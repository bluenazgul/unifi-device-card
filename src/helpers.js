// helpers.js
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
  const title  = lower(entry?.title);
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

const SWITCH_MODEL_PREFIXES  = ["USW", "USL", "USF", "US8", "US16", "US24", "US48", "USMINI", "FLEXMINI"];
const GATEWAY_MODEL_PREFIXES = ["UDM", "UCG", "UXG", "UGW", "UDRULT", "UDMPRO", "UDMPROSE"];
const AP_MODEL_PREFIXES      = ["UAP", "U6", "U7", "UAL", "UAPMESH"];

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
    if ([
      // Cloud Gateways
      "UCGULTRA", "UDRULT", "UCGMAX", "UCGFIBER",
      // Dream Machines
      "UDMPRO", "UDMPROSE",
      // UXG Next-Gen Gateways
      "UXGPRO", "UXGL",
      // Legacy USG
      "UGW3", "UGW4",
    ].includes(modelKey)) return "gateway";

    if ([
      // Gen1
      "US8P60", "US8P150", "US16P150",
      // Lite / Flex
      "USMINI", "USF5P",
      "USL8LP", "USL8LPB", "USL16LP", "USL16LPB",
      // Gen2 Standard
      "USL16P",
      "USL24", "USL24P", "USW24P",
      "USL48", "USL48P", "USW48P",
      // Pro
      "US24PRO", "US24PRO2",
      "US48PRO", "US48PRO2",
      // Enterprise
      "US68P", "US624P", "US648P",
      // Aggregation
      "USL8A", "USAGGPRO",
      // Ultra
      "USWULTRA", "USWULTRA60W", "USWULTRA210W",
    ].includes(modelKey)) return "switch";
  }

  if (modelStartsWith(device, SWITCH_MODEL_PREFIXES))  return "switch";
  if (modelStartsWith(device, GATEWAY_MODEL_PREFIXES)) return "gateway";

  const hasPorts = entities.some((e) => /_port_\d+(?:_|$)/i.test(e.entity_id));
  if (hasPorts) return "switch";

  if (hasUbiquitiManufacturer(device)) {
    const model = lower(device?.model);
    const name  = lower(device?.name_by_user || device?.name);
    if (
      model.includes("udm") || model.includes("ucg") ||
      model.includes("uxg") || model.includes("ugw") ||
      name.includes("gateway")
    ) return "gateway";
    if (
      model.includes("usw") || model.includes("usl") ||
      model.includes("us8") || name.includes("switch")
    ) return "switch";
  }

  return "unknown";
}

// ─────────────────────────────────────────────────
// WS helpers
// ─────────────────────────────────────────────────

async function safeCallWS(hass, msg, fallback = []) {
  try {
    return await hass.callWS(msg);
  } catch (err) {
    console.warn("[unifi-device-card] WS failed", msg?.type, err);
    return fallback;
  }
}

async function getAllData(hass) {
  const [devices, rawEntities, configEntries] = await Promise.all([
    safeCallWS(hass, { type: "config/device_registry/list" }, []),
    safeCallWS(hass, { type: "config/entity_registry/list" }, []),
    safeCallWS(hass, { type: "config/config_entries/entry" }, []),
  ]);

  // Only include entities that are enabled and visible
  const entities = (rawEntities || []).filter((e) => !e.disabled_by && !e.hidden_by);

  const entitiesByDevice = new Map();
  for (const entity of entities) {
    if (!entity.device_id) continue;
    if (!entitiesByDevice.has(entity.device_id))
      entitiesByDevice.set(entity.device_id, []);
    entitiesByDevice.get(entity.device_id).push(entity);
  }

  return { devices, entitiesByDevice, configEntries };
}

function isUnifiDevice(device, unifiEntryIds, entities) {
  if (
    Array.isArray(device?.config_entries) &&
    device.config_entries.some((id) => unifiEntryIds.has(id))
  ) return true;
  if (resolveModelKey(device)) return true;
  if (modelStartsWith(device, [...SWITCH_MODEL_PREFIXES, ...GATEWAY_MODEL_PREFIXES])) return true;
  if (
    entities.some((e) => /_port_\d+(?:_|$)/i.test(e.entity_id)) &&
    hasUbiquitiManufacturer(device)
  ) return true;
  return false;
}

function buildDeviceLabel(device, type) {
  const name      = normalize(device.name_by_user) || normalize(device.name) || normalize(device.model) || "Unknown device";
  const model     = normalize(device.model);
  const typeLabel = type === "gateway" ? "Gateway" : "Switch";
  if (model && lower(model) !== lower(name)) return `${name} · ${model} (${typeLabel})`;
  return `${name} (${typeLabel})`;
}

function extractFirmware(device, entities) {
  if (normalize(device?.sw_version)) return normalize(device.sw_version);
  const fe = entities.find((e) => {
    const id = lower(e.entity_id);
    const t  = entityText(e);
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

  console.debug(
    "[unifi-device-card] Config entries:",
    (configEntries || []).map((e) => ({ domain: e.domain, title: e.title, id: e.entry_id }))
  );

  const results = [];
  for (const device of devices || []) {
    const entities      = entitiesByDevice.get(device.id) || [];
    const byConfigEntry =
      Array.isArray(device?.config_entries) &&
      device.config_entries.some((id) => unifiEntryIds.has(id));
    const modelKey = resolveModelKey(device);
    const type     = classifyDevice(device, entities);

    if (hasUbiquitiManufacturer(device) || byConfigEntry) {
      console.debug("[unifi-device-card] Candidate:", {
        name: device.name_by_user || device.name,
        model: device.model,
        byConfigEntry,
        modelKey,
        type,
        isUnifi: isUnifiDevice(device, unifiEntryIds, entities),
      });
    }

    if (!isUnifiDevice(device, unifiEntryIds, entities)) continue;
    if (type !== "switch" && type !== "gateway") continue;

    results.push({
      id:    device.id,
      name:  normalize(device.name_by_user) || normalize(device.name) || normalize(device.model),
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

  const numberedPorts = discoverPorts(entities);
  const specialPorts  = discoverSpecialPorts(entities);
  const layout        = getDeviceLayout(device, numberedPorts);

  return {
    device,
    entities,
    type,
    layout,
    specialPorts,
    name:         normalize(device.name_by_user) || normalize(device.name) || normalize(device.model),
    model:        normalize(device.model),
    manufacturer: normalize(device.manufacturer),
    firmware:     extractFirmware(device, entities),
  };
}

// ─────────────────────────────────────────────────
// Editor helper: disabled/hidden entity warnings
// ─────────────────────────────────────────────────

function classifyRelevantEntityType(entity) {
  const id  = lower(entity.entity_id);
  const eid = entity.entity_id || "";
  const tk  = entity.translation_key || "";

  if (eid.startsWith("button.") && (id.includes("power_cycle") || tk === "power_cycle")) return "power_cycle";
  if (eid.startsWith("switch.") && id.includes("_port_") && id.endsWith("_poe")) return "poe_switch";
  if (eid.startsWith("switch.") && id.includes("_port_")) return "port_switch";
  if (eid.startsWith("sensor.") && (id.includes("_poe_power") || tk === "poe_power")) return "poe_power";
  if (
    eid.startsWith("sensor.") &&
    (
      id.endsWith("_rx") || id.endsWith("_tx") ||
      id.includes("_rx_") || id.includes("_tx_") ||
      id.includes("throughput") || id.includes("bandwidth") ||
      tk === "port_bandwidth_rx" || tk === "port_bandwidth_tx"
    )
  ) return "rx_tx";
  if (
    eid.startsWith("sensor.") &&
    (
      id.includes("link_speed") || id.includes("ethernet_speed") ||
      id.includes("negotiated_speed") || tk === "port_link_speed"
    )
  ) return "link_speed";
  if (eid.startsWith("binary_sensor.") && (id.includes("_port_") || id.includes("_link") || tk === "port_link")) return "link";

  return null;
}

export async function getRelevantEntityWarningsForDevice(hass, deviceId) {
  const [devices, allEntities] = await Promise.all([
    safeCallWS(hass, { type: "config/device_registry/list" }, []),
    safeCallWS(hass, { type: "config/entity_registry/list" }, []),
  ]);

  const device = (devices || []).find((d) => d.id === deviceId);
  if (!device) return null;

  const allForDevice = (allEntities || []).filter((e) => e.device_id === deviceId);

  const disabled = { port_switch: [], poe_switch: [], poe_power: [], link_speed: [], rx_tx: [], power_cycle: [], link: [] };
  const hidden   = { port_switch: [], poe_switch: [], poe_power: [], link_speed: [], rx_tx: [], power_cycle: [], link: [] };

  for (const entity of allForDevice) {
    const type = classifyRelevantEntityType(entity);
    if (!type) continue;

    if (entity.disabled_by) disabled[type]?.push(entity.entity_id);
    else if (entity.hidden_by) hidden[type]?.push(entity.entity_id);
  }

  const disabledCount = Object.values(disabled).flat().length;
  const hiddenCount   = Object.values(hidden).flat().length;

  if (disabledCount === 0 && hiddenCount === 0) return null;
  return { disabled, hidden, disabledCount, hiddenCount };
}

// ─────────────────────────────────────────────────
// Port discovery
// ─────────────────────────────────────────────────

function extractPortNumber(entity) {
  // 1. unique_id numeric suffix (most reliable)
  const uid = normalize(entity.unique_id);
  const uidMatch =
    uid.match(/_port[_-]?(\d+)(?:[_-]|$)/i) ||
    uid.match(/-(\d+)-[a-z]/i) ||
    uid.match(/port[_-](\d+)/i) ||
    uid.match(/[_-](\d+)$/);

  if (uidMatch) return parseInt(uidMatch[1], 10);

  // 2. entity_id _port_N or _port_N_
  const eid = lower(entity.entity_id);
  const eidMatch = eid.match(/_port_(\d+)(?:_|$)/i);
  if (eidMatch) return parseInt(eidMatch[1], 10);

  // 3. original_name "Port N …"
  const originalNameMatch = (entity.original_name || "").match(/\bport\s+(\d+)\b/i);
  if (originalNameMatch) return parseInt(originalNameMatch[1], 10);

  // 4. fallback: visible name "Port N …"
  const nameMatch = (entity.name || "").match(/\bport\s+(\d+)\b/i);
  if (nameMatch) return parseInt(nameMatch[1], 10);

  return null;
}

function classifyPortEntity(entity, isSpecial = false) {
  const id  = lower(entity.entity_id);
  const eid = entity.entity_id || "";
  const tk  = entity.translation_key || "";

  if (
    eid.startsWith("button.") &&
    (id.includes("power_cycle") || tk === "power_cycle" || id.includes("_restart") || id.includes("_reboot"))
  ) return "power_cycle_entity";

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
    ) return "link_entity";
  }

  if (eid.startsWith("sensor.")) {
    if (id.includes("_port_")) {
      if (id.endsWith("_rx") || id.includes("_rx_") || tk === "port_bandwidth_rx") return "rx_entity";
      if (id.endsWith("_tx") || id.includes("_tx_") || tk === "port_bandwidth_tx") return "tx_entity";
      if (id.includes("link_speed") || id.includes("ethernet_speed") || id.includes("negotiated_speed") || tk === "port_link_speed") {
        return "speed_entity";
      }
      if (id.includes("_poe_power") || tk === "poe_power") return "poe_power_entity";
    }

    if (
      isSpecial &&
      (id.includes("_wan") || id.includes("_sfp") || id.includes("_uplink"))
    ) {
      if (id.includes("download") || id.includes("_rx")) return "rx_entity";
      if (id.includes("upload") || id.includes("_tx")) return "tx_entity";
      if (id.includes("link_speed") || tk === "port_link_speed") return "speed_entity";
      if (id.includes("_poe_power") || tk === "poe_power") return "poe_power_entity";
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

  if (id.includes("_wan_") || id.endsWith("_wan") || tk.includes("wan")) return { key: "wan", label: "WAN" };
  if (id.includes("_wan2") || id.endsWith("wan2") || tk.includes("wan2")) return { key: "wan2", label: "WAN 2" };

  const sfpMatch = id.match(/_sfp[_+]?(\d+)[_-]/) || tk.match(/sfp[_+]?(\d+)/);
  if (sfpMatch) return { key: `sfp_${sfpMatch[1]}`, label: `SFP+ ${sfpMatch[1]}` };
  if (id.includes("_sfp") || id.includes("sfp+")) return { key: "sfp_1", label: "SFP+" };

  if (id.includes("_uplink") || tk.includes("uplink")) return { key: "uplink", label: "Uplink" };

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
    (entity.entity_id?.startsWith("sensor.")  && lower(entity.entity_id).includes("_link_speed")) ||
    (entity.entity_id?.startsWith("sensor.")  && lower(entity.entity_id).includes("_poe_power"));

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
  if (!stripped || /^(rx|tx|poe|link|uplink|downlink|sfp|wan|lan)$/i.test(stripped)) return null;
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

// Returns true when a port number is within the model's declared PoE range.
// poePortRange: [firstPoEPort, lastPoEPort] inclusive, or absent/null = no PoE.
function portHasPoe(portNumber, layout) {
  const r = layout?.poePortRange;
  if (!r) return false;
  return portNumber >= r[0] && portNumber <= r[1];
}

// Strip PoE and power-cycle entities from a port object that has no physical PoE.
function stripPoeEntities(port) {
  return {
    ...port,
    poe_switch_entity:  null,
    poe_power_entity:   null,
    power_cycle_entity: null,
  };
}

export function mergePortsWithLayout(layout, discoveredPorts) {
  const byPort      = new Map(discoveredPorts.map((p) => [p.port, p]));
  const layoutPorts = (layout?.rows || []).flat();

  const specialPortNumbers = new Set(
    (layout?.specialSlots || []).map((s) => s.port).filter((p) => p != null)
  );

  const merged = [];
  for (const portNumber of layoutPorts) {
    if (specialPortNumbers.has(portNumber)) continue;

    const discovered = byPort.get(portNumber);
    const hasPoe     = portHasPoe(portNumber, layout);

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
    if (!layoutPorts.includes(port.port) && !specialPortNumbers.has(port.port))
      merged.push(port);
  }

  return merged.sort((a, b) => (a.port ?? 999) - (b.port ?? 999));
}

export function mergeSpecialsWithLayout(layout, discoveredSpecials, discoveredPorts = []) {
  const byKey  = new Map(discoveredSpecials.map((s) => [s.key, s]));
  const byPort = new Map(discoveredPorts.map((p) => [p.port, p]));
  const layoutSpecials = layout?.specialSlots || [];

  const merged = layoutSpecials.map((slot) => {
    if (slot.port != null) {
      const portData = byPort.get(slot.port);
      if (portData) return { ...portData, key: slot.key, label: slot.label, kind: "special" };
    }

    const keyData = byKey.get(slot.key);
    if (keyData) return keyData;

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
// WAN port override (user can remap any port as WAN)
// ─────────────────────────────────────────────────

export function applyWanPortOverride(wanPort, specials, numbered, layout) {
  if (!wanPort || wanPort === "auto") return { specials, numbered };

  const newSpecials = [...specials.map((s) => ({ ...s }))];
  const newNumbered = [...numbered];

  const targetIdx = newNumbered.findIndex((p) => String(p.port) === String(wanPort));
  if (targetIdx !== -1) {
    const oldWanIdx = newSpecials.findIndex((s) => s.key === "wan");
    const target    = { ...newNumbered[targetIdx] };

    const oldWan = oldWanIdx !== -1 ? { ...newSpecials[oldWanIdx] } : null;

    const layoutOldWan = oldWan
      ? (layout?.specialSlots || []).find((s) => s.key === oldWan.key)
      : null;

    const newWanSlot = {
      ...target,
      key:   "wan",
      label: "WAN",
      kind:  "special",
    };

    const restoredOldWan = oldWan
      ? {
          ...oldWan,
          key:   layoutOldWan?.key   || oldWan.key,
          label: layoutOldWan?.label || `Port ${oldWan.port ?? "?"}`,
        }
      : null;

    if (oldWanIdx !== -1) {
      newSpecials.splice(oldWanIdx, 1, newWanSlot);
    } else {
      newSpecials.push(newWanSlot);
    }

    const alreadyInSpecials = newSpecials.some((s) => s.port === oldWan?.port);
    if (!alreadyInSpecials && oldWan?.port != null && restoredOldWan) {
      newSpecials.push(restoredOldWan);
    }

    newNumbered.splice(targetIdx, 1);
    return { specials: newSpecials, numbered: newNumbered };
  }

  const targetSpecialIdx = newSpecials.findIndex((s) => s.key === wanPort);
  const oldWanIdx        = newSpecials.findIndex((s) => s.key === "wan");

  if (targetSpecialIdx === -1 || targetSpecialIdx === oldWanIdx) {
    return { specials, numbered };
  }

  const oldWan     = { ...newSpecials[oldWanIdx] };
  const targetSlot = { ...newSpecials[targetSpecialIdx] };

  const layoutOldWan = (layout?.specialSlots || []).find((s) => s.key === oldWan.key);

  newSpecials[targetSpecialIdx] = {
    ...targetSlot,
    key:   "wan",
    label: "WAN",
  };

  newSpecials[oldWanIdx] = {
    ...oldWan,
    key:   layoutOldWan?.key   || oldWan.key,
    label: layoutOldWan?.label || `Port ${oldWan.port ?? "?"}`,
  };

  return { specials: newSpecials, numbered: newNumbered };
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
  const val  = obj.state;
  const unit = obj.attributes?.unit_of_measurement;
  if (!val || val === "unavailable" || val === "unknown") return "—";
  const num = parseFloat(val);
  if (!isNaN(num)) return unit ? `${num.toFixed(2)} ${unit}` : String(num.toFixed(2));
  return val;
}

export function getPoeStatus(hass, port) {
  const sw  = stateValue(hass, port.poe_switch_entity);
  const pwr = stateValue(hass, port.poe_power_entity);

  if (sw !== null) return { active: isOn(hass, port.poe_switch_entity), power: pwr };
  if (pwr !== null) {
    const num = parseFloat(pwr);
    return { active: !isNaN(num) && num > 0, power: pwr };
  }
  return { active: false, power: null };
}

export function getPortLinkText(hass, port) {
  if (port.link_entity) {
    const s = stateValue(hass, port.link_entity);
    if (s === "on" || s === "true" || s === "connected" || s === "up") return "connected";
    if (s === "off" || s === "false" || s === "disconnected" || s === "down") return "no_link";
  }

  const speed = stateValue(hass, port.speed_entity);
  if (speed && speed !== "unavailable" && speed !== "unknown" && parseFloat(speed) > 0) return "connected";

  const rx = stateValue(hass, port.rx_entity);
  const tx = stateValue(hass, port.tx_entity);
  if ((rx && parseFloat(rx) > 0) || (tx && parseFloat(tx) > 0)) return "connected";

  if (port.kind === "special" && (port.key === "wan" || port.key === "wan2" || port.key?.startsWith("sfp"))) {
    return "no_link";
  }

  if (speed && speed !== "unavailable" && speed !== "unknown") return "connected";
  return "no_link";
}

export function getPortSpeedText(hass, port) {
  const s = stateValue(hass, port.speed_entity);
  if (!s || s === "unavailable" || s === "unknown") return null;
  return s;
}
