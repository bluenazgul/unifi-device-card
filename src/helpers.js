import { getDeviceLayout, resolveModelKey } from "./model-registry.js";

// ─────────────────────────────────────────────────
// String utilities
// ─────────────────────────────────────────────────

function normalize(value) {
  return String(value ?? "").trim();
}

function lower(value) {
  return normalize(value).toLowerCase();
}

function entityText(entity) {
  return lower(
    [
      entity.entity_id,
      entity.original_name,
      entity.name,
      entity.platform,
      entity.device_class,
      entity.translation_key,
      entity.original_device_class,
    ]
      .filter(Boolean)
      .join(" ")
  );
}

// ─────────────────────────────────────────────────
// UniFi config-entry detection
// ─────────────────────────────────────────────────

function isUnifiConfigEntry(entry) {
  const domain = lower(entry?.domain);
  const title = lower(entry?.title);
  return (
    domain === "unifi" ||
    domain === "unifi_network" ||
    domain.includes("unifi") ||
    title.includes("unifi")
  );
}

function extractUnifiEntryIds(configEntries) {
  return new Set(
    (configEntries || []).filter(isUnifiConfigEntry).map((e) => e.entry_id)
  );
}

// ─────────────────────────────────────────────────
// Device classification
// ─────────────────────────────────────────────────

function hasUbiquitiManufacturer(device) {
  const m = lower(device?.manufacturer);
  return m.includes("ubiquiti") || m.includes("unifi");
}

const SWITCH_MODEL_PREFIXES = [
  "USW",
  "USL",
  "USF",
  "US8",
  "USC8",
  "US16",
  "US24",
  "US48",
  "USMINI",
  "FLEXMINI",
];

const GATEWAY_MODEL_PREFIXES = [
  "UDM",
  "UCG",
  "UXG",
  "UGW",
  "UDRULT",
  "UDMPRO",
  "UDMPROSE",
];

const AP_MODEL_PREFIXES = ["UAP", "U6", "U7", "UAL", "UAPMESH"];

function normalizeModelStr(value) {
  return String(value ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function modelStartsWith(device, prefixes) {
  const candidates = [device?.model, device?.hw_version]
    .filter(Boolean)
    .map(normalizeModelStr);

  return prefixes.some((pfx) => candidates.some((c) => c.startsWith(pfx)));
}

function isDefinitelyAP(device) {
  return modelStartsWith(device, AP_MODEL_PREFIXES);
}

function classifyDevice(device, entities) {
  if (isDefinitelyAP(device)) return "access_point";

  const modelKey = resolveModelKey(device);
  if (modelKey) {
    if (
      [
        "UCGULTRA",
        "UDRULT",
        "UCGMAX",
        "UCGFIBER",
        "UDMPRO",
        "UDMPROSE",
        "UXGPRO",
        "UXGL",
        "UGW3",
        "UGW4",
      ].includes(modelKey)
    ) {
      return "gateway";
    }

    if (
      [
        "USC8",
        "US8P60",
        "US8P150",
        "US16P150",
        "USMINI",
        "USF5P",
        "USL8LP",
        "USL8LPB",
        "USL16LP",
        "USL16LPB",
        "USL16P",
        "USL24",
        "USL24P",
        "USW24P",
        "USL48",
        "USL48P",
        "USW48P",
        "US24PRO",
        "US24PRO2",
        "US48PRO",
        "US48PRO2",
        "US68P",
        "US624P",
        "US648P",
        "USL8A",
        "USAGGPRO",
        "USWULTRA",
        "USWULTRA60W",
        "USWULTRA210W",
      ].includes(modelKey)
    ) {
      return "switch";
    }
  }

  if (modelStartsWith(device, SWITCH_MODEL_PREFIXES)) return "switch";
  if (modelStartsWith(device, GATEWAY_MODEL_PREFIXES)) return "gateway";

  const hasPorts = entities.some((e) => /_port_\d+(?:_|$)/i.test(e.entity_id));
  if (hasPorts) return "switch";

  if (hasUbiquitiManufacturer(device)) {
    const model = lower(device?.model);
    const name = lower(device?.name_by_user || device?.name);

    if (
      model.includes("udm") ||
      model.includes("ucg") ||
      model.includes("uxg") ||
      model.includes("ugw") ||
      name.includes("gateway")
    ) {
      return "gateway";
    }

    if (
      model.includes("usw") ||
      model.includes("usl") ||
      model.includes("us8") ||
      model.includes("usc8") ||
      name.includes("switch")
    ) {
      return "switch";
    }
  }

  return "unknown";
}

// ─────────────────────────────────────────────────
// WS helpers
// ─────────────────────────────────────────────────

function getWSErrorCode(err) {
  if (err?.code != null) return err.code;
  if (err?.error?.code != null) return err.error.code;
  return null;
}

function getWSErrorMessage(err) {
  return String(err?.message ?? err?.error?.message ?? "").toLowerCase();
}

function isIgnorableWSError(err) {
  const code = getWSErrorCode(err);
  const msg = getWSErrorMessage(err);

  return (
    code === 3 ||
    code === "3" ||
    code === "unknown_command" ||
    msg.includes("unknown command") ||
    msg.includes("not connected") ||
    msg.includes("disconnected") ||
    msg.includes("socket closed") ||
    msg.includes("connection lost")
  );
}

async function safeCallWS(hass, msg, fallback = []) {
  try {
    return await hass.callWS(msg);
  } catch (err) {
    if (!isIgnorableWSError(err)) {
      console.warn("[unifi-device-card] WS failed", msg?.type, err);
    }
    return fallback;
  }
}

const REGISTRY_CACHE_TTL = 2500;
const _registryCache = new WeakMap();

function flattenEntitiesByDevice(map) {
  if (!map || typeof map.values !== "function") return [];
  return Array.from(map.values()).flat();
}

async function getAllData(hass) {
  const now = Date.now();
  const cached = _registryCache.get(hass);

  if (cached && now - cached.ts < REGISTRY_CACHE_TTL) {
    return cached.data;
  }

  const fallbackDevices = cached?.data?.devices || [];
  const fallbackEntities = flattenEntitiesByDevice(cached?.data?.entitiesByDevice);

  const [devices, rawEntities] = await Promise.all([
    safeCallWS(hass, { type: "config/device_registry/list" }, fallbackDevices),
    safeCallWS(hass, { type: "config/entity_registry/list" }, fallbackEntities),
  ]);

  const entities = (rawEntities || []).filter((e) => !e.disabled_by && !e.hidden_by);

  const entitiesByDevice = new Map();
  for (const entity of entities) {
    if (!entity.device_id) continue;
    if (!entitiesByDevice.has(entity.device_id)) {
      entitiesByDevice.set(entity.device_id, []);
    }
    entitiesByDevice.get(entity.device_id).push(entity);
  }

  const data = {
    devices: devices || [],
    entitiesByDevice,
    configEntries: [],
  };

  if ((data.devices?.length || 0) > 0 || entities.length > 0) {
    _registryCache.set(hass, { ts: now, data });
  }

  return data;
}

function isUnifiDevice(device, unifiEntryIds, entities) {
  if (
    Array.isArray(device?.config_entries) &&
    device.config_entries.some((id) => unifiEntryIds.has(id))
  ) {
    return true;
  }

  if (resolveModelKey(device)) return true;

  if (modelStartsWith(device, [...SWITCH_MODEL_PREFIXES, ...GATEWAY_MODEL_PREFIXES])) {
    return true;
  }

  if (
    entities.some((e) => /_port_\d+(?:_|$)/i.test(e.entity_id)) &&
    hasUbiquitiManufacturer(device)
  ) {
    return true;
  }

  return false;
}

function buildDeviceLabel(device, type) {
  const name =
    normalize(device.name_by_user) ||
    normalize(device.name) ||
    normalize(device.model) ||
    "Unknown device";

  const model = normalize(device.model);
  const typeLabel = type === "gateway" ? "Gateway" : "Switch";

  if (model && lower(model) !== lower(name)) return `${name} · ${model} (${typeLabel})`;
  return `${name} (${typeLabel})`;
}

function extractFirmware(device, entities) {
  if (normalize(device?.sw_version)) return normalize(device.sw_version);

  const fe = entities.find((e) => {
    const id = lower(e.entity_id);
    const t = entityText(e);
    return id.includes("firmware") || id.includes("version") || t.includes("firmware");
  });

  return fe ? fe.entity_id : "";
}

// ─────────────────────────────────────────────────
// Port translation keys that may need unique_id lookup
// ─────────────────────────────────────────────────

const PORT_TRANSLATION_KEYS = new Set([
  "port_bandwidth_rx",
  "port_bandwidth_tx",
  "port_link_speed",
  "poe",
  "poe_power",
  "poe_port_control",
]);

// ─────────────────────────────────────────────────
// Public: device list for editor
// ─────────────────────────────────────────────────

export async function getUnifiDevices(hass) {
  const { devices, entitiesByDevice, configEntries } = await getAllData(hass);
  const unifiEntryIds = extractUnifiEntryIds(configEntries);

  const results = [];
  for (const device of devices || []) {
    const entities = entitiesByDevice.get(device.id) || [];
    if (!isUnifiDevice(device, unifiEntryIds, entities)) continue;

    const type = classifyDevice(device, entities);
    if (type !== "switch" && type !== "gateway") continue;

    results.push({
      id: device.id,
      name: normalize(device.name_by_user) || normalize(device.name) || normalize(device.model),
      label: buildDeviceLabel(device, type),
      model: normalize(device.model),
      type,
    });
  }

  return results.sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
  );
}

// ─────────────────────────────────────────────────
// Public: full device context for card rendering
// ─────────────────────────────────────────────────

function filterPortsByLayout(discoveredPorts, layout) {
  const layoutRows = (layout?.rows || []).flat();
  const specialPorts = (layout?.specialSlots || [])
    .map((slot) => slot?.port)
    .filter((port) => Number.isInteger(port));

  const allowed = new Set([...layoutRows, ...specialPorts]);

  // Kein Filter, wenn das Layout keine belastbare Portliste liefert
  if (!allowed.size) return discoveredPorts;

  return discoveredPorts.filter((port) => allowed.has(port.port));
}

export async function getDeviceContext(hass, deviceId) {
  const { devices, entitiesByDevice, configEntries } = await getAllData(hass);
  const unifiEntryIds = extractUnifiEntryIds(configEntries);

  const device = devices.find((d) => d.id === deviceId);
  if (!device) return null;

  let entities = entitiesByDevice.get(deviceId) || [];
  if (!isUnifiDevice(device, unifiEntryIds, entities)) return null;

  const type = classifyDevice(device, entities);
  if (type !== "switch" && type !== "gateway") return null;

  const needsUID = entities.filter(
    (e) =>
      !e.unique_id &&
      e.translation_key &&
      PORT_TRANSLATION_KEYS.has(e.translation_key) &&
      !/_port_\d+/i.test(e.entity_id) &&
      !/\bport\s+\d+\b/i.test(e.original_name || "")
  );

  if (needsUID.length > 0) {
    const details = await Promise.all(
      needsUID.map((e) =>
        safeCallWS(
          hass,
          { type: "config/entity_registry/get", entity_id: e.entity_id },
          null
        )
      )
    );

    const uidMap = new Map(
      details
        .filter(Boolean)
        .filter((d) => d.unique_id)
        .map((d) => [d.entity_id, d.unique_id])
    );

    if (uidMap.size > 0) {
      entities = entities.map((e) =>
        uidMap.has(e.entity_id) ? { ...e, unique_id: uidMap.get(e.entity_id) } : e
      );
    }
  }

  const discoveredPortsRaw = discoverPorts(entities);
  const layout = getDeviceLayout(device, discoveredPortsRaw);
  const numberedPorts = filterPortsByLayout(discoveredPortsRaw, layout);
  const specialPorts = discoverSpecialPorts(entities);

  return {
    device,
    entities,
    type,
    layout,
    specialPorts,
    name: normalize(device.name_by_user) || normalize(device.name) || normalize(device.model),
    model: normalize(device.model),
    manufacturer: normalize(device.manufacturer),
    firmware: extractFirmware(device, entities),
    numberedPorts,
  };
}

// ─────────────────────────────────────────────────
// Editor helper: disabled/hidden entity warnings
// ─────────────────────────────────────────────────

function classifyRelevantEntityType(entity) {
  const id = lower(entity.entity_id);
  const eid = entity.entity_id || "";
  const tk = lower(entity.translation_key || "");
  const dc = lower(entity.device_class || "");
  const odc = lower(entity.original_device_class || "");

  if (eid.startsWith("button.") && (id.includes("power_cycle") || tk === "power_cycle")) {
    return "power_cycle";
  }
  if (eid.startsWith("switch.") && id.includes("_port_") && id.endsWith("_poe")) {
    return "poe_switch";
  }
  if (eid.startsWith("switch.") && id.includes("_port_")) {
    return "port_switch";
  }
  if (
    eid.startsWith("sensor.") &&
    (
      id.includes("_poe_power") ||
      (id.includes("_poe") && id.includes("power")) ||
      id.includes("power_draw") ||
      id.includes("power_consumption") ||
      id.includes("consumption") ||
      tk === "poe_power" ||
      tk === "port_poe_power" ||
      tk === "poe_power_consumption" ||
      dc === "power" ||
      odc === "power"
    )
  ) {
    return "poe_power";
  }
  if (
    eid.startsWith("sensor.") &&
    (
      id.endsWith("_rx") ||
      id.endsWith("_tx") ||
      id.includes("_rx_") ||
      id.includes("_tx_") ||
      id.includes("throughput") ||
      id.includes("bandwidth") ||
      id.includes("download") ||
      id.includes("upload") ||
      tk === "port_bandwidth_rx" ||
      tk === "port_bandwidth_tx" ||
      tk === "rx" ||
      tk === "tx"
    )
  ) {
    return "rx_tx";
  }
  if (
    eid.startsWith("sensor.") &&
    (
      id.includes("link_speed") ||
      id.includes("ethernet_speed") ||
      id.includes("negotiated_speed") ||
      id.endsWith("_speed") ||
      tk === "port_link_speed" ||
      tk === "link_speed"
    )
  ) {
    return "link_speed";
  }
  if (
    eid.startsWith("binary_sensor.") &&
    (id.includes("_port_") || id.includes("_link") || tk === "port_link")
  ) {
    return "link";
  }

  return null;
}

export async function getRelevantEntityWarningsForDevice(hass, deviceId) {
  const cached = _registryCache.get(hass)?.data;

  const [devices, allEntities] = await Promise.all([
    safeCallWS(hass, { type: "config/device_registry/list" }, cached?.devices || []),
    safeCallWS(
      hass,
      { type: "config/entity_registry/list" },
      flattenEntitiesByDevice(cached?.entitiesByDevice)
    ),
  ]);

  const device = (devices || []).find((d) => d.id === deviceId);
  if (!device) return null;

  const allForDevice = (allEntities || []).filter((e) => e.device_id === deviceId);

  const disabled = {
    port_switch: [],
    poe_switch: [],
    poe_power: [],
    link_speed: [],
    rx_tx: [],
    power_cycle: [],
    link: [],
  };
  const hidden = {
    port_switch: [],
    poe_switch: [],
    poe_power: [],
    link_speed: [],
    rx_tx: [],
    power_cycle: [],
    link: [],
  };

  for (const entity of allForDevice) {
    const type = classifyRelevantEntityType(entity);
    if (!type) continue;

    if (entity.disabled_by) disabled[type]?.push(entity.entity_id);
    else if (entity.hidden_by) hidden[type]?.push(entity.entity_id);
  }

  const disabledCount = Object.values(disabled).flat().length;
  const hiddenCount = Object.values(hidden).flat().length;

  if (disabledCount === 0 && hiddenCount === 0) return null;
  return { disabled, hidden, disabledCount, hiddenCount };
}

// ─────────────────────────────────────────────────
// Port discovery
// ─────────────────────────────────────────────────

function extractPortNumber(entity) {
  const uid = normalize(entity.unique_id);
  const uidMatch =
    uid.match(/_port[_-]?(\d+)(?:[_-]|$)/i) ||
    uid.match(/-(\d+)-[a-z]/i) ||
    uid.match(/port[_-](\d+)/i) ||
    uid.match(/[_-](\d+)$/);

  if (uidMatch) return parseInt(uidMatch[1], 10);

  const eid = lower(entity.entity_id);
  const eidMatch = eid.match(/_port_(\d+)(?:_|$)/i);
  if (eidMatch) return parseInt(eidMatch[1], 10);

  const originalNameMatch = (entity.original_name || "").match(/\bport\s+(\d+)\b/i);
  if (originalNameMatch) return parseInt(originalNameMatch[1], 10);

  const nameMatch = (entity.name || "").match(/\bport\s+(\d+)\b/i);
  if (nameMatch) return parseInt(nameMatch[1], 10);

  return null;
}

function classifyPortEntity(entity, isSpecial = false) {
  const id = lower(entity.entity_id);
  const eid = entity.entity_id || "";
  const tk = lower(entity.translation_key || "");
  const dc = lower(entity.device_class || "");
  const odc = lower(entity.original_device_class || "");

  if (
    eid.startsWith("button.") &&
    (id.includes("power_cycle") || tk === "power_cycle" || id.includes("_restart") || id.includes("_reboot"))
  ) {
    return "power_cycle_entity";
  }

  if (eid.startsWith("switch.") && id.includes("_port_") && id.endsWith("_poe")) {
    return "poe_switch_entity";
  }

  if (eid.startsWith("switch.") && (id.includes("_port_") || isSpecial)) {
    return "port_switch_entity";
  }

  if (eid.startsWith("binary_sensor.")) {
    if (id.includes("_port_")) return "link_entity";
    if (
      isSpecial &&
      (
        id.includes("_wan") ||
        id.includes("_sfp") ||
        id.includes("_uplink") ||
        id.includes("_connected") ||
        id.includes("_link") ||
        tk === "port_link"
      )
    ) {
      return "link_entity";
    }
  }

  if (eid.startsWith("sensor.")) {
    if (id.includes("_port_")) {
      if (
        id.endsWith("_rx") ||
        id.includes("_rx_") ||
        id.includes("download") ||
        tk === "port_bandwidth_rx" ||
        tk === "rx"
      ) {
        return "rx_entity";
      }

      if (
        id.endsWith("_tx") ||
        id.includes("_tx_") ||
        id.includes("upload") ||
        tk === "port_bandwidth_tx" ||
        tk === "tx"
      ) {
        return "tx_entity";
      }

      if (
        id.includes("link_speed") ||
        id.includes("ethernet_speed") ||
        id.includes("negotiated_speed") ||
        id.endsWith("_speed") ||
        tk === "port_link_speed" ||
        tk === "link_speed"
      ) {
        return "speed_entity";
      }

      if (
        id.includes("_poe_power") ||
        (id.includes("_poe") && id.includes("power")) ||
        id.includes("power_draw") ||
        id.includes("power_consumption") ||
        id.includes("consumption") ||
        tk === "poe_power" ||
        tk === "port_poe_power" ||
        tk === "poe_power_consumption" ||
        dc === "power" ||
        odc === "power"
      ) {
        return "poe_power_entity";
      }
    }

    if (
      isSpecial &&
      (id.includes("_wan") || id.includes("_sfp") || id.includes("_uplink"))
    ) {
      if (
        id.includes("download") ||
        id.includes("_rx") ||
        tk === "port_bandwidth_rx" ||
        tk === "rx"
      ) {
        return "rx_entity";
      }

      if (
        id.includes("upload") ||
        id.includes("_tx") ||
        tk === "port_bandwidth_tx" ||
        tk === "tx"
      ) {
        return "tx_entity";
      }

      if (
        id.includes("link_speed") ||
        id.includes("ethernet_speed") ||
        id.includes("negotiated_speed") ||
        id.endsWith("_speed") ||
        tk === "port_link_speed" ||
        tk === "link_speed"
      ) {
        return "speed_entity";
      }

      if (
        id.includes("_poe_power") ||
        (id.includes("_poe") && id.includes("power")) ||
        id.includes("power_draw") ||
        id.includes("power_consumption") ||
        id.includes("consumption") ||
        tk === "poe_power" ||
        tk === "port_poe_power" ||
        tk === "poe_power_consumption" ||
        dc === "power" ||
        odc === "power"
      ) {
        return "poe_power_entity";
      }
    }
  }

  return null;
}

function ensurePort(map, port) {
  if (!map.has(port)) {
    map.set(port, {
      key: `port-${port}`,
      port,
      label: String(port),
      kind: "numbered",
      link_entity: null,
      speed_entity: null,
      poe_switch_entity: null,
      poe_power_entity: null,
      port_switch_entity: null,
      power_cycle_entity: null,
      rx_entity: null,
      tx_entity: null,
      port_label: null,
      raw_entities: [],
    });
  }
  return map.get(port);
}

function detectSpecialPortKey(entity) {
  const id = lower(entity.entity_id);
  const tk = entity.translation_key || "";

  if (id.includes("_wan2") || id.endsWith("wan2") || tk.includes("wan2")) {
    return { key: "wan2", label: "WAN 2" };
  }
  if (id.includes("_wan_") || id.endsWith("_wan") || tk.includes("wan")) {
    return { key: "wan", label: "WAN" };
  }

  const sfpMatch = id.match(/_sfp[_+]?(\d+)[_-]/) || tk.match(/sfp[_+]?(\d+)/);
  if (sfpMatch) return { key: `sfp_${sfpMatch[1]}`, label: `SFP+ ${sfpMatch[1]}` };
  if (id.includes("_sfp") || id.includes("sfp+")) return { key: "sfp_1", label: "SFP+" };

  if (id.includes("_uplink") || tk.includes("uplink")) {
    return { key: "uplink", label: "Uplink" };
  }

  return null;
}

function ensureSpecialPort(map, key, label) {
  if (!map.has(key)) {
    map.set(key, {
      key,
      port: null,
      label,
      kind: "special",
      link_entity: null,
      speed_entity: null,
      poe_switch_entity: null,
      poe_power_entity: null,
      port_switch_entity: null,
      power_cycle_entity: null,
      rx_entity: null,
      tx_entity: null,
      raw_entities: [],
    });
  }
  return map.get(key);
}

function extractPortLabel(entity) {
  const isLabelSource =
    (entity.entity_id?.startsWith("button.") && lower(entity.entity_id).includes("power_cycle")) ||
    (entity.entity_id?.startsWith("sensor.") && lower(entity.entity_id).includes("_link_speed")) ||
    (entity.entity_id?.startsWith("sensor.") && lower(entity.entity_id).includes("_poe_power"));

  if (!isLabelSource) return null;

  const name = normalize(entity.original_name || entity.name || "");
  if (!name) return null;

  let stripped = name;
  for (const suffix of [/ power cycle$/i, / link speed$/i, / poe power$/i]) {
    const c = name.replace(suffix, "").trim();
    if (c.length < name.length) {
      stripped = c;
      break;
    }
  }

  stripped = stripped.replace(/^port\s+\d+\s*[-–]?\s*/i, "").trim();
  if (!stripped || /^(rx|tx|poe|link|uplink|downlink|sfp|wan|lan)$/i.test(stripped)) {
    return null;
  }
  return stripped;
}

export function discoverPorts(entities) {
  const ports = new Map();

  for (const entity of entities || []) {
    const port = extractPortNumber(entity);
    if (!port) continue;

    const row = ensurePort(ports, port);
    row.raw_entities.push(entity.entity_id);

    const type = classifyPortEntity(entity);
    if (type && !row[type]) row[type] = entity.entity_id;

    if (!row.port_label) {
      const label = extractPortLabel(entity);
      if (label) row.port_label = label;
    }
  }

  return Array.from(ports.values()).sort((a, b) => a.port - b.port);
}

export function discoverSpecialPorts(entities) {
  const specials = new Map();

  for (const entity of entities || []) {
    if (extractPortNumber(entity)) continue;

    const special = detectSpecialPortKey(entity);
    if (!special) continue;

    const row = ensureSpecialPort(specials, special.key, special.label);
    row.raw_entities.push(entity.entity_id);

    const type = classifyPortEntity(entity, true);
    if (type && !row[type]) row[type] = entity.entity_id;
  }

  return Array.from(specials.values());
}

function portHasPoe(portNumber, layout) {
  const r = layout?.poePortRange;
  if (!r) return false;
  return portNumber >= r[0] && portNumber <= r[1];
}

function stripPoeEntities(port) {
  return {
    ...port,
    poe_switch_entity: null,
    poe_power_entity: null,
    power_cycle_entity: null,
  };
}

export function mergePortsWithLayout(layout, discoveredPorts) {
  const byPort = new Map(discoveredPorts.map((p) => [p.port, p]));
  const layoutPorts = (layout?.rows || []).flat();

  const specialPortNumbers = new Set(
    (layout?.specialSlots || []).map((s) => s.port).filter((p) => p != null)
  );

  const merged = [];
  for (const portNumber of layoutPorts) {
    if (specialPortNumbers.has(portNumber)) continue;

    const discovered = byPort.get(portNumber);
    const hasPoe = portHasPoe(portNumber, layout);

    const port = discovered || {
      key: `port-${portNumber}`,
      port: portNumber,
      label: String(portNumber),
      kind: "numbered",
      link_entity: null,
      speed_entity: null,
      poe_switch_entity: null,
      poe_power_entity: null,
      port_switch_entity: null,
      power_cycle_entity: null,
      rx_entity: null,
      tx_entity: null,
      raw_entities: [],
    };

    merged.push(hasPoe ? port : stripPoeEntities(port));
  }

  for (const port of discoveredPorts) {
    if (!layoutPorts.includes(port.port) && !specialPortNumbers.has(port.port)) {
      merged.push(port);
    }
  }

  return merged.sort((a, b) => (a.port ?? 999) - (b.port ?? 999));
}

export function mergeSpecialsWithLayout(layout, discoveredSpecials, discoveredPorts = []) {
  const byKey = new Map(discoveredSpecials.map((s) => [s.key, s]));
  const byPort = new Map(discoveredPorts.map((p) => [p.port, p]));
  const layoutSpecials = layout?.specialSlots || [];

  const merged = layoutSpecials.map((slot) => {
    if (slot.port != null) {
      const portData = byPort.get(slot.port);
      if (portData) return { ...portData, key: slot.key, label: slot.label, kind: "special" };
    }

    const keyData = byKey.get(slot.key);
    if (keyData) {
      return {
        ...keyData,
        key: slot.key,
        label: slot.label,
        kind: "special",
        port: slot.port ?? keyData.port ?? null,
      };
    }

    return {
      key: slot.key,
      port: slot.port ?? null,
      label: slot.label,
      kind: "special",
      link_entity: null,
      speed_entity: null,
      poe_switch_entity: null,
      poe_power_entity: null,
      port_switch_entity: null,
      power_cycle_entity: null,
      rx_entity: null,
      tx_entity: null,
      raw_entities: [],
    };
  });

  return merged;
}

// ─────────────────────────────────────────────────
// WAN / WAN2 overrides
// ─────────────────────────────────────────────────

function cloneSlot(slot) {
  return {
    ...slot,
    raw_entities: Array.isArray(slot?.raw_entities) ? [...slot.raw_entities] : [],
  };
}

function emptyNumberedPort(portNumber) {
  return {
    key: `port-${portNumber}`,
    port: portNumber,
    label: String(portNumber),
    kind: "numbered",
    link_entity: null,
    speed_entity: null,
    poe_switch_entity: null,
    poe_power_entity: null,
    port_switch_entity: null,
    power_cycle_entity: null,
    rx_entity: null,
    tx_entity: null,
    raw_entities: [],
    port_label: null,
  };
}

function emptySpecialPort(key, label, port = null) {
  return {
    key,
    port,
    label,
    kind: "special",
    link_entity: null,
    speed_entity: null,
    poe_switch_entity: null,
    poe_power_entity: null,
    port_switch_entity: null,
    power_cycle_entity: null,
    rx_entity: null,
    tx_entity: null,
    raw_entities: [],
    port_label: null,
  };
}

function resolveGatewaySelection(selection, roleKey, layout, specialsByKey) {
  const normalized = String(selection || "auto");

  if (normalized === "none") return null;

  if (!selection || normalized === "auto") {
    const def = (layout?.specialSlots || []).find((s) => s.key === roleKey);
    if (!def) return null;

    if (def.port != null) {
      return {
        type: "port",
        port: def.port,
        key: def.key,
        label: def.label,
      };
    }

    return {
      type: "special",
      key: def.key,
      label: def.label,
    };
  }

  if (normalized.startsWith("port_")) {
    const port = parseInt(normalized.replace(/^port_/, ""), 10);
    if (!Number.isInteger(port)) return null;

    return {
      type: "port",
      port,
      key: roleKey,
      label: roleKey === "wan2" ? "WAN 2" : "WAN",
    };
  }

  const specialLayout = (layout?.specialSlots || []).find((s) => s.key === normalized);
  if (specialLayout?.port != null) {
    return {
      type: "port",
      port: specialLayout.port,
      key: specialLayout.key,
      label: specialLayout.label,
    };
  }

  const specialData = specialsByKey.get(normalized);
  if (specialData) {
    if (specialData.port != null) {
      return {
        type: "port",
        port: specialData.port,
        key: normalized,
        label: specialData.label,
      };
    }

    return {
      type: "special",
      key: normalized,
      label: specialData.label,
    };
  }

  return null;
}

function makeSpecialFromPhysical(roleKey, physical) {
  return {
    ...cloneSlot(physical),
    key: roleKey,
    label: roleKey === "wan2" ? "WAN 2" : "WAN",
    kind: "special",
  };
}

function makeNumberedFromPhysical(portNumber, physical, layout) {
  const hasPoe = portHasPoe(portNumber, layout);
  const base = physical ? cloneSlot(physical) : emptyNumberedPort(portNumber);

  const numbered = {
    ...base,
    key: `port-${portNumber}`,
    port: portNumber,
    label: String(portNumber),
    kind: "numbered",
  };

  return hasPoe ? numbered : stripPoeEntities(numbered);
}

export function applyGatewayPortOverrides(config, specials, numbered, layout) {
  const wanPort = config?.wan_port;
  const wan2Port = config?.wan2_port;

  const normalizedWan = String(wanPort || "auto");
  const normalizedWan2 = String(wan2Port || "auto");

  if (
    (!wanPort || normalizedWan === "auto") &&
    (!wan2Port || normalizedWan2 === "auto")
  ) {
    return { specials, numbered };
  }

  const originalSpecials = (specials || []).map(cloneSlot);
  const originalNumbered = (numbered || []).map(cloneSlot);

  const specialsByKey = new Map(originalSpecials.map((s) => [s.key, s]));
  const physicalByPort = new Map();

  for (const slot of [...originalSpecials, ...originalNumbered]) {
    if (Number.isInteger(slot?.port) && !physicalByPort.has(slot.port)) {
      physicalByPort.set(slot.port, cloneSlot(slot));
    }
  }

  const wanSel = resolveGatewaySelection(wanPort, "wan", layout, specialsByKey);
  const wan2Sel = resolveGatewaySelection(wan2Port, "wan2", layout, specialsByKey);

  const roleAssignments = new Map();
  if (wanSel) roleAssignments.set("wan", wanSel);

  if (wan2Sel) {
    const samePort =
      wanSel?.type === "port" &&
      wan2Sel?.type === "port" &&
      wanSel.port === wan2Sel.port;

    const sameSpecial =
      wanSel?.type === "special" &&
      wan2Sel?.type === "special" &&
      wanSel.key === wan2Sel.key;

    if (!samePort && !sameSpecial) {
      roleAssignments.set("wan2", wan2Sel);
    }
  }

  const assignedPorts = new Set(
    Array.from(roleAssignments.values())
      .filter((s) => s?.type === "port")
      .map((s) => s.port)
  );

  const assignedSpecialKeys = new Set(
    Array.from(roleAssignments.values())
      .filter((s) => s?.type === "special")
      .map((s) => s.key)
  );

  const newSpecials = [];

  for (const roleKey of ["wan", "wan2"]) {
    const sel = roleAssignments.get(roleKey);
    if (!sel) continue;

    if (sel.type === "port") {
      const physical = physicalByPort.get(sel.port) || emptyNumberedPort(sel.port);
      newSpecials.push(makeSpecialFromPhysical(roleKey, physical));
    } else {
      const specialData =
        specialsByKey.get(sel.key) ||
        emptySpecialPort(roleKey, roleKey === "wan2" ? "WAN 2" : "WAN");

      newSpecials.push({
        ...cloneSlot(specialData),
        key: roleKey,
        label: roleKey === "wan2" ? "WAN 2" : "WAN",
        kind: "special",
      });
    }
  }

  for (const slot of originalSpecials) {
    if (slot.key === "wan" || slot.key === "wan2") continue;

    if (Number.isInteger(slot.port) && assignedPorts.has(slot.port)) continue;
    if (!Number.isInteger(slot.port) && assignedSpecialKeys.has(slot.key)) continue;

    newSpecials.push(cloneSlot(slot));
  }

  const newNumbered = [];

  for (const slot of originalNumbered) {
    if (assignedPorts.has(slot.port)) continue;
    newNumbered.push(makeNumberedFromPhysical(slot.port, slot, layout));
  }

  for (const slot of originalSpecials) {
    if (!Number.isInteger(slot.port)) continue;
    if (assignedPorts.has(slot.port)) continue;
    if (slot.key === "wan" || slot.key === "wan2") {
      newNumbered.push(makeNumberedFromPhysical(slot.port, slot, layout));
    }
  }

  const seen = new Set();
  const deduped = [];
  for (const port of newNumbered.sort((a, b) => (a.port ?? 999) - (b.port ?? 999))) {
    if (!Number.isInteger(port.port)) continue;
    if (seen.has(port.port)) continue;
    seen.add(port.port);
    deduped.push(port);
  }

  return { specials: newSpecials, numbered: deduped };
}

export function applyWanPortOverride(wanPort, specials, numbered, layout) {
  return applyGatewayPortOverrides({ wan_port: wanPort }, specials, numbered, layout);
}

// ─────────────────────────────────────────────────
// State helpers
// ─────────────────────────────────────────────────

export function stateObj(hass, entityId) {
  if (!entityId || !hass?.states) return null;
  return hass.states[entityId] ?? null;
}

export function stateValue(hass, entityId) {
  return stateObj(hass, entityId)?.state ?? null;
}

export function isOn(hass, entityId) {
  const s = stateValue(hass, entityId);
  return s === "on" || s === "true" || s === "connected" || s === "up" || s === "active";
}

export function formatState(hass, entityId) {
  const obj = stateObj(hass, entityId);
  if (!obj) return "—";

  const val = obj.state;
  const unit = obj.attributes?.unit_of_measurement;
  if (!val || val === "unavailable" || val === "unknown") return "—";

  const num = parseFloat(String(val).replace(",", "."));
  if (!isNaN(num)) return unit ? `${num.toFixed(2)} ${unit}` : String(num.toFixed(2));

  return val;
}

export function getPoeStatus(hass, port) {
  const sw = stateValue(hass, port.poe_switch_entity);
  const pwr = stateValue(hass, port.poe_power_entity);

  const powerNum = pwr != null ? parseFloat(String(pwr).replace(",", ".")) : NaN;
  const hasPowerDraw = !Number.isNaN(powerNum) && powerNum > 0;

  return {
    active: isOn(hass, port.poe_switch_entity) || hasPowerDraw,
    power: pwr ?? null,
  };
}

export function isPortConnected(hass, port) {
  if (port.link_entity) {
    const s = lower(stateValue(hass, port.link_entity));
    if (["on", "true", "connected", "up", "active"].includes(s)) return true;
    if (["off", "false", "disconnected", "down", "inactive"].includes(s)) return false;
  }

  const speed = stateValue(hass, port.speed_entity);
  if (speed && speed !== "unavailable" && speed !== "unknown") {
    const n = parseFloat(String(speed).replace(",", "."));

    if (!Number.isNaN(n) && n > 10) return true;
    if (!Number.isNaN(n) && n <= 10) return false;
  }

  const rx = stateValue(hass, port.rx_entity);
  const tx = stateValue(hass, port.tx_entity);

  const rxNum = rx != null ? parseFloat(String(rx).replace(",", ".")) : NaN;
  const txNum = tx != null ? parseFloat(String(tx).replace(",", ".")) : NaN;

  if ((!Number.isNaN(rxNum) && rxNum > 0) || (!Number.isNaN(txNum) && txNum > 0)) {
    return true;
  }

  return false;
}

export function getPortLinkText(hass, port) {
  return isPortConnected(hass, port) ? "connected" : "no_link";
}

export function getPortSpeedText(hass, port) {
  const s = stateValue(hass, port.speed_entity);
  if (!s || s === "unavailable" || s === "unknown") return null;
  return s;
}
