import { getDeviceLayout, resolveModelKey } from "./model-registry.js";

function normalize(value) { return String(value ?? "").trim(); }
function lower(value)     { return normalize(value).toLowerCase(); }

function entityText(entity) {
  return lower(
    [entity.entity_id, entity.original_name, entity.name, entity.platform,
     entity.device_class, entity.translation_key, entity.original_device_class]
      .filter(Boolean).join(" ")
  );
}

function isUnifiConfigEntry(entry) {
  const domain = lower(entry?.domain);
  const title  = lower(entry?.title);
  return domain === "unifi" || domain === "unifi_network" || domain.includes("unifi") || title.includes("unifi");
}

function extractUnifiEntryIds(configEntries) {
  return new Set((configEntries || []).filter(isUnifiConfigEntry).map((e) => e.entry_id));
}

function hasUbiquitiManufacturer(device) {
  const m = lower(device?.manufacturer);
  return m.includes("ubiquiti") || m.includes("unifi");
}

const SWITCH_MODEL_PREFIXES  = ["USW", "USL", "US8", "US16", "US24", "USMINI", "FLEXMINI"];
const GATEWAY_MODEL_PREFIXES = ["UDM", "UCG", "UXG", "UDRULT", "UDMPRO", "UDMSE"];
const AP_MODEL_PREFIXES      = ["UAP", "U6", "U7", "UAL", "UAPMESH"];

function normalizeModelStr(value) {
  return String(value ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function modelStartsWith(device, prefixes) {
  const candidates = [device?.model, device?.hw_version].filter(Boolean).map(normalizeModelStr);
  return prefixes.some((pfx) => candidates.some((c) => c.startsWith(pfx)));
}

function isDefinitelyAP(device) {
  return modelStartsWith(device, AP_MODEL_PREFIXES);
}

function classifyDevice(device, entities) {
  if (isDefinitelyAP(device)) return "access_point";

  const modelKey = resolveModelKey(device);
  if (modelKey) {
    if (["UDRULT", "UCGULTRA", "UCGMAX", "UDMPRO", "UDMSE"].includes(modelKey)) return "gateway";
    if (["US8P60", "USMINI", "USL8LP", "USL8LPB", "USL16LP", "USL16LPB", "US16P150", "US24PRO2", "USW24P", "USW48P"].includes(modelKey)) return "switch";
  }

  if (modelStartsWith(device, SWITCH_MODEL_PREFIXES))  return "switch";
  if (modelStartsWith(device, GATEWAY_MODEL_PREFIXES)) return "gateway";

  const hasPorts = entities.some((e) => /_port_\d+_/i.test(e.entity_id));
  if (hasPorts) return "switch";

  if (hasUbiquitiManufacturer(device)) {
    const model = lower(device?.model);
    const name  = lower(device?.name_by_user || device?.name);
    if (model.includes("udm") || model.includes("ucg") || model.includes("uxg") || name.includes("gateway")) return "gateway";
    if (model.includes("usw") || model.includes("usl") || model.includes("us8") || name.includes("switch")) return "switch";
  }

  return "unknown";
}

async function safeCallWS(hass, msg, fallback = []) {
  try {
    return await hass.callWS(msg);
  } catch (err) {
    console.warn("[unifi-device-card] WS failed", msg?.type, err);
    return fallback;
  }
}

// ─────────────────────────────────────────────────
// FIX (v0.2.1): Filter disabled/hidden entities.
// HA creates entities with disabled_by:"integration"
// for features not active by default. These have no
// state in hass.states — filtering prevents ghost buttons.
// ─────────────────────────────────────────────────
async function getAllData(hass) {
  const [devices, rawEntities, configEntries] = await Promise.all([
    safeCallWS(hass, { type: "config/device_registry/list" }, []),
    safeCallWS(hass, { type: "config/entity_registry/list" }, []),
    safeCallWS(hass, { type: "config/config_entries/entry" }, []),
  ]);

  const entities = (rawEntities || []).filter((e) => !e.disabled_by && !e.hidden_by);

  const entitiesByDevice = new Map();
  for (const entity of entities) {
    if (!entity.device_id) continue;
    if (!entitiesByDevice.has(entity.device_id)) entitiesByDevice.set(entity.device_id, []);
    entitiesByDevice.get(entity.device_id).push(entity);
  }

  return { devices, entitiesByDevice, configEntries };
}

function isUnifiDevice(device, unifiEntryIds, entities) {
  if (Array.isArray(device?.config_entries) && device.config_entries.some((id) => unifiEntryIds.has(id))) return true;
  if (resolveModelKey(device)) return true;
  if (modelStartsWith(device, [...SWITCH_MODEL_PREFIXES, ...GATEWAY_MODEL_PREFIXES])) return true;
  if (entities.some((e) => /_port_\d+_/i.test(e.entity_id)) && hasUbiquitiManufacturer(device)) return true;
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
    const t = entityText(e);
    return id.includes("firmware") || id.includes("version") || t.includes("firmware");
  });
  return fe ? fe.entity_id : "";
}

// Translation keys identifying port telemetry entities (for unique_id enrichment)
const PORT_TRANSLATION_KEYS = new Set([
  "port_bandwidth_rx", "port_bandwidth_tx", "port_link_speed",
  "poe", "poe_power", "poe_port_control",
]);

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
    const byConfigEntry = Array.isArray(device?.config_entries) && device.config_entries.some((id) => unifiEntryIds.has(id));
    const modelKey      = resolveModelKey(device);
    const type          = classifyDevice(device, entities);

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

  return results.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
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

  // ─────────────────────────────────────────────────
  // FIX (v0.2.1): unique_id enrichment
  //
  // config/entity_registry/list does not return unique_id
  // since HA 2022.6. Renamed port entities have no _port_N
  // in entity_id, so extractPortNumber() fails silently.
  // Fetch full registry entry individually for affected
  // entities to retrieve unique_id (e.g. "port_rx-mac_6").
  // ─────────────────────────────────────────────────
  const needsUID = entities.filter((e) =>
    !e.unique_id &&
    e.translation_key &&
    PORT_TRANSLATION_KEYS.has(e.translation_key) &&
    !/_port_\d+/i.test(e.entity_id) &&
    !/\bport\s+\d+\b/i.test(e.original_name || "")
  );

  if (needsUID.length > 0) {
    const details = await Promise.all(
      needsUID.map((e) =>
        safeCallWS(hass, { type: "config/entity_registry/get", entity_id: e.entity_id }, null)
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
// Port discovery helpers
// ─────────────────────────────────────────────────
function extractPortNumber(entity) {
  const id           = entity.entity_id || "";
  const originalName = entity.original_name || "";
  const name         = entity.name || "";

  let match = id.match(/_port_(\d+)(?:_|$)/i);
  if (match) return Number(match[1]);

  match = originalName.match(/\bport\s+(\d+)\b/i);
  if (match) return Number(match[1]);

  match = name.match(/\bport\s+(\d+)\b/i);
  if (match) return Number(match[1]);

  // FIX (v0.2.1): Fallback to unique_id for renamed entities.
  // Formats: "port_rx-mac_6", "poe_power_port_3"
  if (entity.unique_id) {
    match = entity.unique_id.match(/[_-](\d+)$/);
    if (match) return Number(match[1]);
    match = entity.unique_id.match(/port[_-](\d+)/i);
    if (match) return Number(match[1]);
  }

  return null;
}

function ensurePort(map, port) {
  if (!map.has(port)) {
    map.set(port, {
      key: `port-${port}`,
      port,
      label: String(port),
      port_label: null,
      kind: "numbered",
      link_entity: null,
      port_switch_entity: null,
      speed_entity: null,
      poe_switch_entity: null,
      poe_power_entity: null,
      power_cycle_entity: null,
      rx_entity: null,
      tx_entity: null,
      raw_entities: [],
    });
  }
  return map.get(port);
}

function ensureSpecialPort(map, key, label) {
  if (!map.has(key)) {
    map.set(key, {
      key,
      port: null,
      label,
      port_label: null,
      kind: "special",
      link_entity: null,
      port_switch_entity: null,
      speed_entity: null,
      poe_switch_entity: null,
      poe_power_entity: null,
      power_cycle_entity: null,
      rx_entity: null,
      tx_entity: null,
      raw_entities: [],
    });
  }
  return map.get(key);
}

function isLikelyLinkStateValue(value) {
  const v = String(value ?? "").toLowerCase();
  return ["on", "off", "up", "down", "connected", "disconnected", "true", "false"].includes(v);
}

function isThroughputEntity(id) {
  return id.endsWith("_rx") ||
         id.endsWith("_tx") ||
         id.includes("_rx_") ||
         id.includes("_tx_") ||
         id.includes("throughput") ||
         id.includes("bandwidth") ||
         id.includes("download") ||
         id.includes("upload") ||
         id.includes("traffic");
}

function isSpeedEntity(id) {
  return id.includes("_link_speed") || id.includes("_ethernet_speed") || id.includes("_negotiated_speed");
}

function classifyPortEntity(entity) {
  const id  = lower(entity.entity_id);
  const eid = entity.entity_id;

  if (eid.startsWith("button.") && (id.includes("power_cycle") || id.includes("_restart") || id.includes("_reboot"))) return "power_cycle_entity";
  if (eid.startsWith("switch.") && id.includes("_port_") && id.endsWith("_poe"))  return "poe_switch_entity";
  if (eid.startsWith("switch.") && id.includes("_port_") && !id.endsWith("_poe")) return "port_switch_entity";
  if (eid.startsWith("binary_sensor.") && id.includes("_port_"))                   return "link_entity";

  if (eid.startsWith("sensor.") && id.includes("_port_")) {
    if (id.endsWith("_rx") || id.includes("_rx_")) return "rx_entity";
    if (id.endsWith("_tx") || id.includes("_tx_")) return "tx_entity";
  }
  if (eid.startsWith("sensor.") && isThroughputEntity(id)) return null;
  if (eid.startsWith("sensor.") && isSpeedEntity(id))      return "speed_entity";
  if (eid.startsWith("sensor.") && id.includes("_port_") && id.includes("_poe_power")) return "poe_power_entity";
  if (eid.startsWith("sensor.") && id.includes("_port_") && (id.includes("_link") || id.includes("_status") || id.includes("_state")) && !isThroughputEntity(id)) return "link_entity";

  return null;
}

function detectSpecialPortKey(entity) {
  const text = entityText(entity);
  const id   = lower(entity.entity_id);

  if (text.includes("wan 2") || id.includes("wan2")) return { key: "wan2", label: "WAN 2" };
  if ((text.includes("wan") || id.includes("wan")) && (text.includes("sfp") || id.includes("sfp"))) return { key: "sfp_wan", label: "WAN SFP+" };
  if ((text.includes("lan") || id.includes("lan")) && (text.includes("sfp") || id.includes("sfp"))) return { key: "sfp_lan", label: "LAN SFP+" };
  if (id.endsWith("_wan_port") || id.endsWith("_wan")) return { key: "wan", label: "WAN" };
  if (text.includes("wan") || id.includes("_wan_"))    return { key: "wan", label: "WAN" };
  if (text.includes("sfp+") || text.includes("sfp") || id.includes("sfp")) return { key: "sfp", label: "SFP" };

  return null;
}

function extractPortLabel(entity) {
  const eid = entity.entity_id || "";
  const id  = eid.toLowerCase();

  const isLabelSource =
    (eid.startsWith("button.") && id.includes("power_cycle")) ||
    (eid.startsWith("sensor.") && id.includes("_link_speed")) ||
    (eid.startsWith("sensor.") && id.includes("_poe_power"));

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

    const type = classifyPortEntity(entity);
    if (type && !row[type]) row[type] = entity.entity_id;
  }

  return Array.from(specials.values());
}

export function mergePortsWithLayout(layout, discoveredPorts) {
  const byPort      = new Map(discoveredPorts.map((p) => [p.port, p]));
  const layoutPorts = (layout?.rows || []).flat();

  // Exclude port numbers claimed by specialSlots to avoid double-rendering
  const specialPortNumbers = new Set(
    (layout?.specialSlots || []).map((s) => s.port).filter((p) => p != null)
  );

  const merged = [];
  for (const portNumber of layoutPorts) {
    if (specialPortNumbers.has(portNumber)) continue;

    merged.push(byPort.get(portNumber) || {
      key: `port-${portNumber}`,
      port: portNumber,
      label: String(portNumber),
      kind: "numbered",
      link_entity: null,
      speed_entity: null,
      poe_switch_entity: null,
      poe_power_entity: null,
      power_cycle_entity: null,
      rx_entity: null,
      tx_entity: null,
      raw_entities: [],
    });
  }

  for (const port of discoveredPorts) {
    if (!layoutPorts.includes(port.port) && !specialPortNumbers.has(port.port)) merged.push(port);
  }

  return merged.sort((a, b) => (a.port ?? 999) - (b.port ?? 999));
}

// ─────────────────────────────────────────────────
// FIX (v0.2.1): mergeSpecialsWithLayout now accepts
// discoveredPorts and resolves slots by port number.
//
// Previously slot.port was null on UDMPRO/UDMSE, so
// WAN/SFP slots always came back empty and offline.
// Now slot.port (e.g. 9 for WAN) is used to look up
// the actual port data from discoveredPorts, giving
// the slot real entity IDs and live telemetry.
// Key-based lookup is retained as fallback.
// ─────────────────────────────────────────────────
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
      port_switch_entity: null,
      speed_entity: null,
      poe_switch_entity: null,
      poe_power_entity: null,
      power_cycle_entity: null,
      rx_entity: null,
      tx_entity: null,
      raw_entities: [],
    };
  });

  for (const special of discoveredSpecials) {
    if (!layoutSpecials.some((s) => s.key === special.key)) merged.push(special);
  }

  return merged;
}

// ─────────────────────────────────────────────────
// FIX: getPoeStatus export fehlte in src/helpers.js
// obwohl es in unifi-device-card.js importiert wird.
// Das verursacht den aktuellen Build-Fehler.
// ─────────────────────────────────────────────────
export function getPoeStatus(hass, port) {
  const hasPoe = Boolean(port?.poe_switch_entity || port?.poe_power_entity);

  if (!hasPoe) {
    return {
      hasPoe: false,
      poeOn: false,
      poeText: "—",
      canToggle: false,
    };
  }

  const poeSwitch = stateObj(hass, port?.poe_switch_entity);
  const switchVal = String(poeSwitch?.state ?? "").toLowerCase();

  if (poeSwitch && switchVal !== "unknown" && switchVal !== "unavailable") {
    return {
      hasPoe: true,
      poeOn: isOn(hass, port.poe_switch_entity),
      poeText: String(poeSwitch.state),
      canToggle: Boolean(port?.poe_switch_entity),
    };
  }

  const poePower = stateObj(hass, port?.poe_power_entity);
  const powerNum = parseFloat(String(poePower?.state ?? "").replace(",", "."));

  if (!Number.isNaN(powerNum)) {
    return {
      hasPoe: true,
      poeOn: powerNum > 0,
      poeText: powerNum > 0 ? "on" : "off",
      canToggle: false,
    };
  }

  return {
    hasPoe: true,
    poeOn: false,
    poeText: "—",
    canToggle: false,
  };
}

export function stateObj(hass, entityId) {
  return entityId ? hass.states[entityId] || null : null;
}

export function stateValue(hass, entityId, fallback = "—") {
  const state = stateObj(hass, entityId);
  return state ? state.state : fallback;
}

// ─────────────────────────────────────────────────
// isOn — five-stage priority chain
// FIX (v0.2.1): Added PoE power and RX/TX signals.
// For special slots (SFP/WAN): skip speed check when
// traffic entities exist, to avoid false-online from
// a seated SFP module with no cable.
// ─────────────────────────────────────────────────
export function isOn(hass, entityId, port = null) {
  if (entityId) {
    const state = stateObj(hass, entityId);
    if (state) {
      const v = String(state.state).toLowerCase();
      if (["on", "connected", "up", "true", "active", "1"].includes(v)) return true;
      if (["off", "disconnected", "false"].includes(v)) return false;
    }
  }

  const isSpecial  = port?.kind === "special";
  const hasTraffic = port?.rx_entity || port?.tx_entity;

  if (!isSpecial || !hasTraffic) {
    if (port?.speed_entity) {
      const s = stateObj(hass, port.speed_entity);
      if (s && !isNaN(parseFloat(s.state)) && parseFloat(s.state) > 0) return true;
    }
  }

  if (port?.poe_power_entity) {
    const s = stateObj(hass, port.poe_power_entity);
    if (s && !isNaN(parseFloat(s.state)) && parseFloat(s.state) > 0) return true;
  }

  for (const eid of [port?.rx_entity, port?.tx_entity]) {
    if (eid) {
      const s = stateObj(hass, eid);
      if (s && !isNaN(parseFloat(s.state)) && parseFloat(s.state) > 0) return true;
    }
  }

  if (port?.port_switch_entity) {
    const s = stateObj(hass, port.port_switch_entity);
    if (s && String(s.state).toLowerCase() === "on") return true;
  }

  return false;
}

// ─────────────────────────────────────────────────
// FIX (v0.2.1): formatState rounds to 2 decimals.
// Avoids 17-decimal display on RX/TX sensors.
// Integers are shown without decimal point.
// ─────────────────────────────────────────────────
export function formatState(hass, entityId, fallback = "—") {
  const state = stateObj(hass, entityId);
  if (!state) return fallback;

  const unit = state.attributes?.unit_of_measurement || "";
  if (state.state === "unknown" || state.state === "unavailable") return "—";

  const num = parseFloat(state.state);
  if (!isNaN(num)) {
    const rounded = num % 1 === 0 ? String(num) : num.toFixed(2);
    return unit ? `${rounded} ${unit}` : rounded;
  }

  return unit ? `${state.state} ${unit}` : state.state;
}

// ─────────────────────────────────────────────────
// getPortLinkText — consistent with isOn() chain
// FIX (v0.2.1): Added PoE power and RX/TX fallbacks.
// ─────────────────────────────────────────────────
export function getPortLinkText(hass, port) {
  const direct = stateObj(hass, port?.link_entity);
  if (direct) {
    const value = String(direct.state ?? "");
    if (isLikelyLinkStateValue(value)) return value;
  }

  for (const entityId of port?.raw_entities || []) {
    const st = stateObj(hass, entityId);
    if (!st) continue;

    const value = String(st.state ?? "");
    const id    = lower(entityId);

    if (isLikelyLinkStateValue(value) && !id.includes("poe") && !id.includes("power") && !id.includes("speed")) {
      return value;
    }
  }

  const isSpecial  = port?.kind === "special";
  const hasTraffic = port?.rx_entity || port?.tx_entity;

  if (!isSpecial || !hasTraffic) {
    if (port?.speed_entity) {
      const s = stateObj(hass, port.speed_entity);
      if (s && !isNaN(parseFloat(s.state)) && parseFloat(s.state) > 0) return "connected";
    }
  }

  if (port?.poe_power_entity) {
    const s = stateObj(hass, port.poe_power_entity);
    if (s && !isNaN(parseFloat(s.state)) && parseFloat(s.state) > 0) return "connected";
  }

  for (const eid of [port?.rx_entity, port?.tx_entity]) {
    if (eid) {
      const s = stateObj(hass, eid);
      if (s && !isNaN(parseFloat(s.state)) && parseFloat(s.state) > 0) return "connected";
    }
  }

  return "—";
}

function simplifySpeed(value, unit = "") {
  const raw     = String(value ?? "").trim().toLowerCase();
  const rawUnit = String(unit ?? "").trim().toLowerCase();

  if (!raw || raw === "unknown" || raw === "unavailable") return "—";

  const number = parseFloat(raw.replace(",", "."));
  if (!Number.isNaN(number)) {
    if (rawUnit.includes("gbit")) return `${Math.round(number * 1000)} Mbit`;
    if (rawUnit.includes("mbit")) return `${Math.round(number)} Mbit`;
    if ([10, 100, 1000, 2500, 10000].includes(number)) return `${Math.round(number)} Mbit`;
  }

  if (raw.includes("10g")) return "10000 Mbit";
  if (raw.includes("2.5g")) return "2500 Mbit";
  if (raw.includes("1g") || raw.includes("1000")) return "1000 Mbit";
  if (raw.includes("100m") || raw === "100") return "100 Mbit";
  if (raw.includes("10m") || raw === "10") return "10 Mbit";

  return "—";
}

export function getPortSpeedText(hass, port) {
  const direct = stateObj(hass, port?.speed_entity);
  if (direct) {
    const result = simplifySpeed(direct.state, direct.attributes?.unit_of_measurement);
    if (result !== "—") return result;
  }

  for (const entityId of port?.raw_entities || []) {
    const st = stateObj(hass, entityId);
    if (!st) continue;

    const id    = lower(entityId);
    const unit  = st.attributes?.unit_of_measurement || "";
    const value = String(st.state ?? "");

    if (isThroughputEntity(id)) continue;

    if (
      id.includes("link_speed") ||
      id.endsWith("_speed") ||
      id.includes("ethernet_speed") ||
      id.includes("negotiated_speed")
    ) {
      const result = simplifySpeed(value, unit);
      if (result !== "—") return result;
    }
  }

  return "—";
}
