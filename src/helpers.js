import {
  applyPortsPerRowOverride,
  getDeviceLayout,
  resolveModelKey,
} from "./model-registry.js";

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
  "USPM",
  "USXG",
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
  "UDR7",
  "UDRULT",
  "UDMPRO",
  "UDMPROSE",
];

const AP_MODEL_PREFIXES = ["UAP", "UAC", "U6", "U7", "UAL", "UAPMESH", "E7", "UWB", "UDB"];

function normalizeModelStr(value) {
  return String(value ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "");
}

const INDEXED_PORT_ID_RE = /(?:^|[_-])(?:port|lan|eth|ethernet|sfp)[_-]?(\d+)(?:[_-]|$)/i;

function findIndexedPortIdMatch(value) {
  return String(value || "").match(INDEXED_PORT_ID_RE);
}

function hasIndexedPortId(entityId) {
  return !!findIndexedPortIdMatch(entityId);
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

function isVirtualControllerDevice(device) {
  const model = lower(device?.model);
  const name = lower(device?.name_by_user || device?.name);
  const combined = `${model} ${name}`;

  return (
    combined.includes("network application") ||
    combined.includes("unifi os") ||
    combined.includes("controller")
  );
}

function hasInfrastructureEntitySignals(entities = []) {
  const hasPortEntities = entities.some((e) => hasIndexedPortId(e?.entity_id));
  if (hasPortEntities) return true;

  const hasRebootControl = entities.some((e) => {
    const id = lower(e?.entity_id);
    if (!id.startsWith("button.")) return false;
    return id.includes("reboot") || id.includes("restart") || id.includes("power_cycle");
  });
  if (hasRebootControl) return true;

  return entities.some((e) => {
    const id = lower(e?.entity_id);
    if (!id.startsWith("sensor.") && !id.startsWith("binary_sensor.")) return false;
    return (
      id.includes("cpu") ||
      id.includes("memory") ||
      id.includes("temperature") ||
      id.endsWith("_uptime") ||
      id.includes("_uptime_") ||
      id.endsWith("_clients") ||
      id.includes("_clients_")
    );
  });
}

export function getDeviceType(device, entities = []) {
  if (isDefinitelyAP(device)) return "access_point";

  const modelKey = resolveModelKey(device);
  if (modelKey) {
    if (
      [
        "UCGULTRA",
        "UDR7",
        "UDRULT",
        "UCGMAX",
        "UCGFIBER",
        "UDM",
        "UDR",
        "UDMPRO",
        "UDMPROSE",
        "UDM67A",
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
        "USWFLEX25G5",
        "USWFLEX25G8",
        "USWFLEX25G8POE",
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
        "USPM16",
        "USPM16P",
        "USPM24",
        "USPM24P",
        "USPM48",
        "USPM48P",
        "US68P",
        "US624P",
        "US648P",
        "USXG24",
        "USWINDUSTRIAL",
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
  if (modelStartsWith(device, AP_MODEL_PREFIXES)) return "access_point";

  const hasAccessPointSignals = entities.some((entity) => {
    const id = lower(entity?.entity_id);
    if (!id) return false;
    return (
      id.endsWith("_clients") ||
      id.includes("_clients_") ||
      id.endsWith("_uptime") ||
      id.includes("_is_online") ||
      id.includes("_connected")
    );
  });
  if (hasAccessPointSignals && hasUbiquitiManufacturer(device)) return "access_point";

  const hasPorts = entities.some((e) => hasIndexedPortId(e.entity_id));
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

    if (
      model.includes("uap") ||
      model.includes("uac") ||
      model.includes("u6") ||
      model.includes("u7") ||
      model.includes("ap") ||
      model.includes("in-wall") ||
      model.includes("iw") ||
      model.includes("mesh") ||
      model.includes("nanohd") ||
      model.includes("enterprise") ||
      name.includes("access point") ||
      name.includes("ap ")
    ) {
      return "access_point";
    }

    // UniFi Network registry mostly contains APs, switches and gateways.
    // If it is not clearly switch/gateway and has no switch-like port entities,
    // treat it as AP for broad model compatibility.
    if (!hasPorts) return "access_point";
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
const _registryInflight = new WeakMap();
const DEVICE_CONTEXT_CACHE_TTL = 1500;
const _deviceContextCache = new WeakMap();
const _deviceContextInflight = new WeakMap();

function normalizePortsPerRowForCache(cardConfig) {
  const raw = Number.parseInt(cardConfig?.ports_per_row, 10);
  if (!Number.isFinite(raw) || raw < 1) return "";
  return String(Math.floor(raw));
}

function getDeviceContextCacheKey(deviceId, cardConfig) {
  return `${deviceId}::${normalizePortsPerRowForCache(cardConfig) || "auto"}`;
}

function getContextCacheStore(map, hass) {
  if (!map.has(hass)) map.set(hass, new Map());
  return map.get(hass);
}

function flattenEntitiesByDevice(map) {
  if (!map || typeof map.values !== "function") return [];
  return Array.from(map.values()).flat();
}

export async function getAllData(hass) {
  const now = Date.now();
  const cached = _registryCache.get(hass);

  if (cached && now - cached.ts < REGISTRY_CACHE_TTL) {
    return cached.data;
  }

  const inflight = _registryInflight.get(hass);
  if (inflight) return inflight;

  const promise = (async () => {
    const fallbackDevices = cached?.data?.devices || [];
    const fallbackEntities = flattenEntitiesByDevice(cached?.data?.entitiesByDevice);
    const fallbackConfigEntries = cached?.data?.configEntries || [];

    const [devices, rawEntities, configEntries] = await Promise.all([
      safeCallWS(hass, { type: "config/device_registry/list" }, fallbackDevices),
      safeCallWS(hass, { type: "config/entity_registry/list" }, fallbackEntities),
      safeCallWS(hass, { type: "config/config_entries" }, fallbackConfigEntries),
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
      configEntries: configEntries || [],
    };

    if ((data.devices?.length || 0) > 0 || entities.length > 0) {
      _registryCache.set(hass, { ts: Date.now(), data });
    }

    return data;
  })();

  _registryInflight.set(hass, promise);

  try {
    return await promise;
  } finally {
    _registryInflight.delete(hass);
  }
}

function isUnifiDevice(device, unifiEntryIds, entities) {
  if (isVirtualControllerDevice(device)) return false;
  const hasInfraSignals = hasInfrastructureEntitySignals(entities);

  if (
    Array.isArray(device?.config_entries) &&
    device.config_entries.some((id) => unifiEntryIds.has(id))
  ) {
    if (hasInfraSignals || !!resolveModelKey(device)) return true;

    if (
      modelStartsWith(device, [
        ...SWITCH_MODEL_PREFIXES,
        ...GATEWAY_MODEL_PREFIXES,
        ...AP_MODEL_PREFIXES,
      ])
    ) {
      return true;
    }

    if (hasUbiquitiManufacturer(device) && getDeviceType(device, entities) !== "unknown") {
      return true;
    }

    return false;
  }

  if (resolveModelKey(device)) return true;

  if (modelStartsWith(device, [...SWITCH_MODEL_PREFIXES, ...GATEWAY_MODEL_PREFIXES, ...AP_MODEL_PREFIXES])) {
    return true;
  }

  if (
    entities.some((e) => hasIndexedPortId(e.entity_id)) &&
    hasUbiquitiManufacturer(device)
  ) {
    return true;
  }

  if (
    hasUbiquitiManufacturer(device) &&
    getDeviceType(device, entities) === "access_point" &&
    hasInfraSignals
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
  const typeLabel =
    type === "gateway" ? "Gateway" : type === "access_point" ? "Access Point" : "Switch";

  if (model && lower(model) !== lower(name)) return `${name} · ${model} (${typeLabel})`;
  return `${name} (${typeLabel})`;
}

function extractFirmware(device) {
  if (normalize(device?.sw_version)) return normalize(device.sw_version);
  return "";
}

// ─────────────────────────────────────────────────
// Exported telemetry / reboot helpers
// ─────────────────────────────────────────────────

function findDeviceEntityByPatterns(entities, patterns = []) {
  for (const entity of entities || []) {
    const id = lower(entity.entity_id);
    if (!id.startsWith("sensor.")) continue;
    if (patterns.some((pattern) => id.includes(pattern))) {
      return entity.entity_id;
    }
  }
  return null;
}

function isPortLevelTelemetrySensor(entityId) {
  const id = lower(entityId);
  return (
    hasIndexedPortId(id) ||
    id.includes("_wan_") ||
    id.includes("link_speed") ||
    id.includes("_rx") ||
    id.includes("_tx") ||
    id.includes("throughput")
  );
}

function findSystemStatEntity(entities, includePatterns = [], excludePatterns = []) {
  for (const entity of entities || []) {
    const id = lower(entity.entity_id);
    if (!id.startsWith("sensor.")) continue;
    if (isPortLevelTelemetrySensor(id)) continue;
    if (!includePatterns.some((pattern) => id.includes(pattern))) continue;
    if (excludePatterns.some((pattern) => id.includes(pattern))) continue;
    return entity.entity_id;
  }
  return null;
}

export function getDeviceTelemetry(entities) {
  return {
    cpu_utilization_entity:
      findDeviceEntityByPatterns(entities, ["cpu_utilization", "cpu_usage", "processor_utilization"]) ||
      findSystemStatEntity(entities, ["cpu"], ["temperature", "temp", "clock", "frequency", "fan"]),
    cpu_temperature_entity:
      findDeviceEntityByPatterns(entities, ["cpu_temperature", "processor_temperature", "temperature_cpu"]) ||
      findSystemStatEntity(entities, ["cpu_temp", "cpu_temperature", "processor_temperature", "temperature_cpu", "cpu"], ["utilization", "usage", "clock", "frequency"]),
    memory_utilization_entity:
      findDeviceEntityByPatterns(entities, ["memory_utilization", "memory_usage", "ram_utilization"]) ||
      findSystemStatEntity(entities, ["memory", "ram"], ["temperature", "temp", "slot"]),
  };
}

export function getDeviceOnlineEntity(entities) {
  for (const entity of entities || []) {
    const id = lower(entity.entity_id);
    if (!id.startsWith("binary_sensor.")) continue;
    if (
      id.endsWith("_is_online") ||
      id.endsWith("_status") ||
      id.includes("_connected") ||
      id.includes("is_online")
    ) {
      return entity.entity_id;
    }
  }

  for (const entity of entities || []) {
    const id = lower(entity.entity_id);
    if (!id.startsWith("sensor.")) continue;
    if (
      id.endsWith("_state") ||
      id.endsWith("_status") ||
      id.includes("_connected") ||
      id.includes("is_online")
    ) {
      return entity.entity_id;
    }
  }
  return null;
}

export function getAccessPointStatEntities(entities) {
  let uptimeEntity = null;
  let clientsEntity = null;
  let apStatusEntity = null;
  let ledSwitchEntity = null;
  let ledColorEntity = null;

  for (const entity of entities || []) {
    const id = lower(entity.entity_id);
    const tk = lower(entity.translation_key || "");

    if (
      !ledSwitchEntity &&
      id.startsWith("light.") &&
      (id.includes("led") || id.includes("indicator") || tk.includes("led") || tk.includes("indicator"))
    ) {
      ledSwitchEntity = entity.entity_id;
    }

    if (!id.startsWith("sensor.")) continue;

    if (!uptimeEntity && (id.endsWith("_uptime") || id.includes(" uptime") || id.includes("_uptime_") || id.includes("uptime"))) {
      uptimeEntity = entity.entity_id;
    }

    if (!clientsEntity && (id.endsWith("_clients") || id.includes("_clients_") || id.includes(" clients"))) {
      clientsEntity = entity.entity_id;
    }

    if (!apStatusEntity && (id.endsWith("_state") || id.includes("_state_"))) {
      apStatusEntity = entity.entity_id;
    }

    if (
      !ledColorEntity &&
      (id.includes("led_color") ||
        id.includes("led_colour") ||
        id.includes("indicator_color") ||
        id.includes("indicator_colour"))
    ) {
      ledColorEntity = entity.entity_id;
    }
  }

  return {
    uptime_entity: uptimeEntity,
    clients_entity: clientsEntity,
    ap_status_entity: apStatusEntity,
    led_switch_entity: ledSwitchEntity,
    led_color_entity: ledColorEntity,
  };
}

export function getDeviceRebootEntity(entities) {
  for (const entity of entities || []) {
    const id = lower(entity.entity_id);
    const tk = lower(entity.translation_key || "");
    if (!id.startsWith("button.")) continue;
    if (
      id.includes("reboot") ||
      id.includes("restart") ||
      tk.includes("reboot") ||
      tk.includes("restart")
    ) {
      return entity.entity_id;
    }
  }
  return null;
}

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

    const type = getDeviceType(device, entities);
    if (type !== "switch" && type !== "gateway" && type !== "access_point") continue;

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
// Warning helper for editor
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
  if (eid.startsWith("switch.") && hasIndexedPortId(id) && id.endsWith("_poe")) {
    return "poe_switch";
  }
  if (eid.startsWith("switch.") && hasIndexedPortId(id)) {
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

// Alias, falls irgendwo noch der andere Name verwendet wird
export const getDeviceWarningInfo = getRelevantEntityWarningsForDevice;

// ─────────────────────────────────────────────────
// Port discovery
// ─────────────────────────────────────────────────

function extractPortNumber(entity) {
  const uid = normalize(entity.unique_id);
  const uidMatch = findIndexedPortIdMatch(uid) || uid.match(/-(\d+)-[a-z]/i);

  if (uidMatch) return parseInt(uidMatch[1], 10);

  // UniFi HA integration unique_ids use "translation_key-{mac}_{portNum}" format.
  // e.g. "port_link_speed-f4:92:bf:92:19:d5_23" → port 23.
  // Must be checked before entity_id fallback to prevent SFP entities (whose
  // entity_id contains "_sfp_1_") from mapping to the wrong port number.
  const macPortMatch = uid.match(/[0-9a-f]{2}_(\d+)$/i);
  if (macPortMatch) return parseInt(macPortMatch[1], 10);

  const eid = lower(entity.entity_id);
  const eidMatch = findIndexedPortIdMatch(eid);
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
  const hasPortLikeId = hasIndexedPortId(id);
  const tk = lower(entity.translation_key || "");
  const dc = lower(entity.device_class || "");
  const odc = lower(entity.original_device_class || "");

  if (
    eid.startsWith("button.") &&
    (id.includes("power_cycle") || tk === "power_cycle" || id.includes("_restart") || id.includes("_reboot"))
  ) {
    return "power_cycle_entity";
  }

  // Translation keys are stable even when users rename port entities.
  if (eid.startsWith("sensor.")) {
    if (tk === "port_bandwidth_rx" || tk === "rx") return "rx_entity";
    if (tk === "port_bandwidth_tx" || tk === "tx") return "tx_entity";
    if (tk === "port_link_speed" || tk === "link_speed") return "speed_entity";
    if (
      tk === "poe_power" ||
      tk === "port_poe_power" ||
      tk === "poe_power_consumption"
    ) {
      return "poe_power_entity";
    }
  }

  if (eid.startsWith("switch.") && hasPortLikeId && id.endsWith("_poe")) {
    return "poe_switch_entity";
  }

  if (eid.startsWith("switch.") && (hasPortLikeId || isSpecial)) {
    return "port_switch_entity";
  }

  if (eid.startsWith("binary_sensor.")) {
    if (hasPortLikeId) return "link_entity";
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
    if (hasPortLikeId) {
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
      physical_key: key,
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
      port_label: null,
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
      port_label: null,
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
      if (portData) return { ...portData, key: slot.key, physical_key: slot.key, label: slot.label, kind: "special" };
    }

    const keyData = byKey.get(slot.key);
    if (keyData) {
      return {
        ...keyData,
        key: slot.key,
        physical_key: slot.key,
        label: slot.label,
        kind: "special",
        port: slot.port ?? keyData.port ?? null,
      };
    }

    return {
      key: slot.key,
      physical_key: slot.key,
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
      port_label: null,
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
    physical_key: key,
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
    physical_key: physical?.physical_key || physical?.key || roleKey,
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
      const physicalByPortSlot = physicalByPort.get(sel.port);
      const physicalByKeySlot = sel.key ? specialsByKey.get(sel.key) : null;
      const physical = physicalByPortSlot || physicalByKeySlot || emptyNumberedPort(sel.port);
      newSpecials.push(makeSpecialFromPhysical(roleKey, physical));
    } else {
      const specialData =
        specialsByKey.get(sel.key) ||
        emptySpecialPort(roleKey, roleKey === "wan2" ? "WAN 2" : "WAN");

      newSpecials.push({
        ...cloneSlot(specialData),
        key: roleKey,
        physical_key: specialData?.physical_key || specialData?.key || roleKey,
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

// Optional helper for older editor variants
export function getGatewayPortChoices(hassOrLayout, maybeDeviceId) {
  const layout =
    maybeDeviceId === undefined
      ? hassOrLayout
      : null;

  if (!layout) return [];

  const out = [];
  for (const slot of layout.specialSlots || []) {
    out.push({
      value: slot.key,
      label: slot.label,
      port: slot.port ?? null,
    });
  }

  for (const port of (layout.rows || []).flat()) {
    out.push({
      value: `port_${port}`,
      label: `Port ${port}`,
      port,
    });
  }

  return out;
}

// ─────────────────────────────────────────────────
// Full device context
// ─────────────────────────────────────────────────

const PORT_TRANSLATION_KEYS = new Set([
  "port_bandwidth_rx",
  "port_bandwidth_tx",
  "port_link_speed",
  "poe",
  "poe_power",
  "poe_port_control",
]);

function filterPortsByLayout(discoveredPorts, layout) {
  const layoutRows = (layout?.rows || []).flat();
  const specialPorts = (layout?.specialSlots || [])
    .map((slot) => slot?.port)
    .filter((port) => Number.isInteger(port));

  const allowed = new Set([...layoutRows, ...specialPorts]);

  if (!allowed.size) return discoveredPorts;
  return discoveredPorts.filter((port) => allowed.has(port.port));
}

async function buildDeviceContext(hass, deviceId, cardConfig = null) {
  const { devices, entitiesByDevice, configEntries } = await getAllData(hass);
  const unifiEntryIds = extractUnifiEntryIds(configEntries);

  const device = devices.find((d) => d.id === deviceId);
  if (!device) return null;

  let entities = entitiesByDevice.get(deviceId) || [];
  if (!isUnifiDevice(device, unifiEntryIds, entities)) return null;

  const type = getDeviceType(device, entities);
  if (type !== "switch" && type !== "gateway" && type !== "access_point") return null;

  const needsUID = entities.filter(
    (e) =>
      !e.unique_id &&
      e.translation_key &&
      PORT_TRANSLATION_KEYS.has(e.translation_key) &&
      (!hasIndexedPortId(e.entity_id) || /(?:^|[_-])sfp[_+]?\d+(?:[_-]|$)/i.test(lower(e.entity_id))) &&
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
  let layout = getDeviceLayout(device, discoveredPortsRaw);
  const configuredPortsPerRow = Number.parseInt(cardConfig?.ports_per_row, 10);
  const hasConfiguredPortsPerRow = Number.isFinite(configuredPortsPerRow) && configuredPortsPerRow > 0;

  if (hasConfiguredPortsPerRow) {
    layout = applyPortsPerRowOverride(layout, configuredPortsPerRow);
  } else if (type === "switch") {
    layout = applyPortsPerRowOverride(layout, 8);
  }
  const numberedPorts = filterPortsByLayout(discoveredPortsRaw, layout);
  const specialPorts = discoverSpecialPorts(entities);
  const telemetry = getDeviceTelemetry(entities);
  const apStats = getAccessPointStatEntities(entities);

  return {
    device,
    entities,
    type,
    layout,
    specialPorts,
    name: normalize(device.name_by_user) || normalize(device.name) || normalize(device.model),
    model: normalize(device.model),
    manufacturer: normalize(device.manufacturer),
    firmware: extractFirmware(device),
    online_entity: getDeviceOnlineEntity(entities),
    ...apStats,
    reboot_entity: getDeviceRebootEntity(entities),
    ...telemetry,
    numberedPorts,
  };
}

export async function getDeviceContext(hass, deviceId, cardConfig = null) {
  if (!hass || !deviceId) return null;

  const cacheKey = getDeviceContextCacheKey(deviceId, cardConfig);
  const now = Date.now();

  const cacheStore = getContextCacheStore(_deviceContextCache, hass);
  const cached = cacheStore.get(cacheKey);
  if (cached && now - cached.ts < DEVICE_CONTEXT_CACHE_TTL) {
    return cached.data;
  }

  const inflightStore = getContextCacheStore(_deviceContextInflight, hass);
  if (inflightStore.has(cacheKey)) {
    return inflightStore.get(cacheKey);
  }

  const promise = buildDeviceContext(hass, deviceId, cardConfig);
  inflightStore.set(cacheKey, promise);

  try {
    const data = await promise;
    if (data) {
      cacheStore.set(cacheKey, { ts: Date.now(), data });
    }
    return data;
  } finally {
    inflightStore.delete(cacheKey);
  }
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

export function parseLinkSpeedMbit(hass, entityId) {
  const obj = stateObj(hass, entityId);
  const raw = obj?.state;
  if (raw == null || raw === "unavailable" || raw === "unknown") return null;

  const n = parseFloat(String(raw).replace(",", "."));
  if (!Number.isFinite(n)) return null;

  const unit = String(obj?.attributes?.unit_of_measurement || "").toLowerCase();
  if (unit.includes("gb")) return n * 1000;
  if (unit.includes("kb")) return n / 1000;
  return n;
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
  if (!Number.isNaN(num)) return unit ? `${num.toFixed(2)} ${unit}` : String(num.toFixed(2));

  return val;
}

export function getPoeStatus(hass, port) {
  const sw = stateValue(hass, port.poe_switch_entity);
  const pwr = stateValue(hass, port.poe_power_entity);

  const powerNum = pwr != null ? parseFloat(String(pwr).replace(",", ".")) : NaN;
  const hasPowerDraw = !Number.isNaN(powerNum) && powerNum > 0;

  return {
    active: sw === "on" || sw === "true" || hasPowerDraw,
    power: pwr ?? null,
  };
}

function trafficValue(hass, entityId) {
  const raw = stateValue(hass, entityId);
  if (raw == null || raw === "unavailable" || raw === "unknown") return 0;

  const num = parseFloat(String(raw).replace(",", "."));
  return Number.isFinite(num) ? num : 0;
}

function hasTraffic(hass, port) {
  return trafficValue(hass, port?.rx_entity) > 0 || trafficValue(hass, port?.tx_entity) > 0;
}

function isSfpSpecialPort(port) {
  if (port?.kind !== "special") return false;

  const key = lower(port?.physical_key || port?.key || "");
  return key.startsWith("sfp_") || key.startsWith("sfp28_");
}

export function isPortConnected(hass, port) {
  if (port.link_entity) {
    const s = lower(stateValue(hass, port.link_entity));
    if (["on", "true", "connected", "up", "active"].includes(s)) return true;
    if (["off", "false", "disconnected", "down", "inactive"].includes(s)) return false;
  }

  // --- BEGIN previous behavior (kept for easy rollback) ---
  // For WAN/SFP special slots, prefer live traffic over negotiated speed.
  // Some gateways report ghost speed on idle SFP ports even when no cable is active.
  // if (port?.kind === "special" && (port?.rx_entity || port?.tx_entity)) {
  //   return hasTraffic(hass, port);
  // }
  // --- END previous behavior ---

  // --- BEGIN new behavior for Issue #91 ---
  // Keep the ghost-speed protection for SFP/SFP28 special ports only.
  // WAN/WAN2/Uplink special slots continue with speed_entity and then RX/TX fallback.
  if (isSfpSpecialPort(port) && (port?.rx_entity || port?.tx_entity)) {
    return hasTraffic(hass, port);
  }
  // --- END new behavior for Issue #91 ---

  const speedMbit = parseLinkSpeedMbit(hass, port.speed_entity);
  if (speedMbit != null) {
    if (speedMbit > 0) return true;
    if (speedMbit <= 0) return false;
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
