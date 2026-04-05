import { getDeviceLayout, resolveModelKey } from "./model-registry.js";

function normalize(value) {
  return String(value ?? "").trim();
}

function lower(value) {
  return normalize(value).toLowerCase();
}

function entityText(entity) {
  return [
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
    .toLowerCase();
}

function deviceText(device, entities) {
  return [
    device.name_by_user,
    device.name,
    device.model,
    device.manufacturer,
    device.hw_version,
    device.sw_version,
    device.serial_number,
    ...entities.flatMap((e) => [
      e.entity_id,
      e.original_name,
      e.name,
      e.platform,
      e.device_class,
      e.translation_key,
      e.original_device_class,
    ]),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

// ─────────────────────────────────────────────────
// Config-entry detection
// The UniFi Network integration domain is "unifi".
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
    (configEntries || []).filter(isUnifiConfigEntry).map((entry) => entry.entry_id)
  );
}

function hasUbiquitiManufacturer(device) {
  const m = lower(device?.manufacturer);
  return m.includes("ubiquiti") || m.includes("unifi");
}

// ─────────────────────────────────────────────────
// Whitelist of model-key prefixes that are definitely
// switches or gateways (never APs, cameras, etc.)
// ─────────────────────────────────────────────────
const SWITCH_MODEL_PREFIXES  = ["USW", "USL", "US8", "USMINI", "FLEXMINI"];
const GATEWAY_MODEL_PREFIXES = ["UDM", "UCG", "UXG", "UDRULT", "UDMPRO", "UDMSE"];
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
  // 1. Hard AP check via model prefix — reject immediately
  if (isDefinitelyAP(device)) return "access_point";

  // 2. Known model key from registry (most reliable)
  const modelKey = resolveModelKey(device);
  if (modelKey) {
    if (["UDRULT","UCGULTRA","UCGMAX","UDMPRO","UDMSE"].includes(modelKey)) return "gateway";
    if (["US8P60","USMINI","USL8LP","USL8LPB","USL16LP","USL16LPB",
         "USW24P","USW48P"].includes(modelKey)) return "switch";
  }

  // 3. Model prefix whitelist
  if (modelStartsWith(device, SWITCH_MODEL_PREFIXES))  return "switch";
  if (modelStartsWith(device, GATEWAY_MODEL_PREFIXES)) return "gateway";

  // 4. Entity-based: numbered port entities = switch
  const hasPorts = entities.some((e) => /_port_\d+_/i.test(e.entity_id));
  if (hasPorts) return "switch";

  // 5. Name/model text fallback — only if manufacturer is Ubiquiti
  //    (avoids matching random devices named "switch" or "gateway")
  if (hasUbiquitiManufacturer(device)) {
    const model    = lower(device?.model);
    const name     = lower(device?.name_by_user || device?.name);
    if (model.includes("udm") || model.includes("ucg") || model.includes("uxg") ||
        name.includes("gateway")) return "gateway";
    if (model.includes("usw") || model.includes("usl") || model.includes("us8") ||
        name.includes("switch")) return "switch";
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

async function getAllData(hass) {
  const [devices, entities, configEntries] = await Promise.all([
    safeCallWS(hass, { type: "config/device_registry/list" }, []),
    safeCallWS(hass, { type: "config/entity_registry/list" }, []),
    safeCallWS(hass, { type: "config/config_entries/entry" }, []),
  ]);

  const entitiesByDevice = new Map();
  for (const entity of entities) {
    if (!entity.device_id) continue;
    if (!entitiesByDevice.has(entity.device_id)) {
      entitiesByDevice.set(entity.device_id, []);
    }
    entitiesByDevice.get(entity.device_id).push(entity);
  }

  return { devices, entitiesByDevice, configEntries };
}

// ─────────────────────────────────────────────────
// isUnifiDevice — two-stage check:
//
// Stage 1 (config entry): The device is linked to a
//   UniFi config entry → definitely a UniFi device.
//   This is the most reliable signal and is always
//   used first. Most devices will match here.
//
// Stage 2 (model whitelist): For devices not linked
//   via config entry (e.g. manually added), we only
//   accept them if their model key resolves to a known
//   switch/gateway model OR their model string starts
//   with a known prefix. We do NOT fall back to pure
//   manufacturer matching because many non-switch
//   Ubiquiti devices (APs, cameras, …) share the same
//   manufacturer string.
// ─────────────────────────────────────────────────
function isUnifiDevice(device, unifiEntryIds, entities) {
  // Stage 1: linked to a known UniFi config entry
  const byConfigEntry =
    Array.isArray(device?.config_entries) &&
    device.config_entries.some((id) => unifiEntryIds.has(id));

  if (byConfigEntry) return true;

  // Stage 2: model-based whitelist (no config entry available)
  // Only accept if the model resolves to a known switch/gateway
  const modelKey = resolveModelKey(device);
  if (modelKey) return true; // resolveModelKey already filters to known models

  // Also accept if model prefix clearly indicates a switch/gateway
  if (modelStartsWith(device, [...SWITCH_MODEL_PREFIXES, ...GATEWAY_MODEL_PREFIXES])) {
    return true;
  }

  // Entity-based: if port entities exist it is definitely a switch
  const hasPorts = entities.some((e) => /_port_\d+_/i.test(e.entity_id));
  if (hasPorts && hasUbiquitiManufacturer(device)) return true;

  return false;
}

function buildDeviceLabel(device, type) {
  const name =
    normalize(device.name_by_user) ||
    normalize(device.name) ||
    normalize(device.model) ||
    "Unknown device";

  const model     = normalize(device.model);
  const typeLabel = type === "gateway" ? "Gateway" : "Switch";

  if (model && lower(model) !== lower(name)) {
    return `${name} · ${model} (${typeLabel})`;
  }
  return `${name} (${typeLabel})`;
}

function extractFirmware(device, entities) {
  if (normalize(device?.sw_version)) return normalize(device.sw_version);

  const firmwareEntity = entities.find((entity) => {
    const id   = lower(entity.entity_id);
    const text = entityText(entity);
    return id.includes("firmware") || id.includes("version") || text.includes("firmware");
  });

  return firmwareEntity ? firmwareEntity.entity_id : "";
}

export async function getUnifiDevices(hass) {
  const { devices, entitiesByDevice, configEntries } = await getAllData(hass);
  const unifiEntryIds = extractUnifiEntryIds(configEntries);

  // Debug: log all config entries so we can see the UniFi domain
  console.debug("[unifi-device-card] Config entries:",
    (configEntries || []).map((e) => ({ domain: e.domain, title: e.title, id: e.entry_id }))
  );

  const results = [];

  for (const device of devices || []) {
    const entities = entitiesByDevice.get(device.id) || [];
    const byConfigEntry =
      Array.isArray(device?.config_entries) &&
      device.config_entries.some((id) => unifiEntryIds.has(id));
    const modelKey = resolveModelKey(device);
    const type     = classifyDevice(device, entities);

    // Debug every Ubiquiti device regardless of outcome
    if (hasUbiquitiManufacturer(device) || byConfigEntry) {
      console.debug("[unifi-device-card] Candidate device:", {
        name:         device.name_by_user || device.name,
        manufacturer: device.manufacturer,
        model:        device.model,
        hw_version:   device.hw_version,
        sw_version:   device.sw_version,
        config_entries: device.config_entries,
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

  return results.sort((a, b) => a.name.localeCompare(b.name, "de", { sensitivity: "base" }));
}

export async function getDeviceContext(hass, deviceId) {
  const { devices, entitiesByDevice, configEntries } = await getAllData(hass);
  const unifiEntryIds = extractUnifiEntryIds(configEntries);

  const device = devices.find((d) => d.id === deviceId);
  if (!device) return null;

  const entities = entitiesByDevice.get(deviceId) || [];
  if (!isUnifiDevice(device, unifiEntryIds, entities)) return null;

  const type = classifyDevice(device, entities);
  if (type !== "switch" && type !== "gateway") return null;

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

function extractPortNumber(entity) {
  const id           = entity.entity_id    || "";
  const originalName = entity.original_name || "";
  const name         = entity.name          || "";

  // e.g. sensor.usw_lite_8_port_4_hostname_link_speed
  //      switch.usw_lite_16_port_4_poe
  //      switch.usw_lite_16_port_9          ← ends with port number
  let match = id.match(/_port_(\d+)(?:_|$)/i);
  if (match) return Number(match[1]);

  // e.g. "Port 3 Link Speed"
  match = originalName.match(/\bport\s+(\d+)\b/i);
  if (match) return Number(match[1]);

  match = name.match(/\bport\s+(\d+)\b/i);
  if (match) return Number(match[1]);

  return null;
}

function ensurePort(map, port) {
  if (!map.has(port)) {
    map.set(port, {
      key:               `port-${port}`,
      port,
      label:             String(port),
      kind:              "numbered",
      link_entity:       null,
      speed_entity:      null,
      poe_switch_entity: null,
      poe_power_entity:  null,
      power_cycle_entity:null,
      raw_entities:      [],
    });
  }
  return map.get(port);
}

function ensureSpecialPort(map, key, label) {
  if (!map.has(key)) {
    map.set(key, {
      key,
      port:              null,
      label,
      kind:              "special",
      link_entity:       null,
      speed_entity:      null,
      poe_switch_entity: null,
      poe_power_entity:  null,
      power_cycle_entity:null,
      raw_entities:      [],
    });
  }
  return map.get(key);
}

function isLikelyLinkStateValue(value) {
  const v = String(value ?? "").toLowerCase();
  return (
    v === "on"           ||
    v === "off"          ||
    v === "up"           ||
    v === "down"         ||
    v === "connected"    ||
    v === "disconnected" ||
    v === "true"         ||
    v === "false"
  );
}

// ─────────────────────────────────────────────────
// Throughput guard — RX/TX sensors must never be
// treated as link-state or speed entities.
// ─────────────────────────────────────────────────
function isThroughputEntity(id) {
  return (
    id.endsWith("_rx")        ||
    id.endsWith("_tx")        ||
    id.includes("_rx_")       ||
    id.includes("_tx_")       ||
    id.includes("throughput") ||
    id.includes("bandwidth")  ||
    id.includes("download")   ||
    id.includes("upload")     ||
    id.includes("traffic")
  );
}

// ─────────────────────────────────────────────────
// isSpeedEntity — sensor contains "_link_speed"
// anywhere in the id (not necessarily at the end).
//
// Real-world examples from HA UniFi integration:
//   sensor.usw_lite_8_port_4_usb2ip_pi3b_link_speed
//   sensor.us_8_60w_port_1_downlink_usw_lite_link_speed
//   sensor.switch_port_3_link_speed
// All contain "_link_speed" — use includes(), not endsWith().
// ─────────────────────────────────────────────────
function isSpeedEntity(id) {
  return (
    id.includes("_link_speed")       ||
    id.includes("_ethernet_speed")   ||
    id.includes("_negotiated_speed")
  );
}

// ─────────────────────────────────────────────────
// classifyPortEntity
//
// Based on observed real-world entity naming from
// the HA UniFi Network integration:
//
// US 8 60W:
//   switch.*_port_8            → link (on/off = port enabled/connected)
//   switch.*_port_5_poe        → PoE toggle
//
// USW Lite 8/16 PoE:
//   switch.*_port_4            → link (on/off = port enabled/connected)
//   switch.*_port_2_poe        → PoE toggle
//   sensor.*_port_2_poe_power  → PoE power (W)
//   sensor.*_port_4_*_link_speed → speed (contains hostname in between)
//   sensor.*_port_2_rx/tx      → throughput (ignore)
//   button.*_port_2_power_cycle → power cycle
//
// KEY INSIGHT: switch.* without "_poe" suffix = link entity
//              switch.* with "_poe" suffix    = PoE toggle
// ─────────────────────────────────────────────────
function classifyPortEntity(entity) {
  const id  = lower(entity.entity_id);
  const eid = entity.entity_id;

  // ── button: power cycle ──────────────────────────────────────────────────
  if (eid.startsWith("button.") && (
    id.includes("power_cycle") ||
    id.includes("_restart")    ||
    id.includes("_reboot")
  )) {
    return "power_cycle_entity";
  }

  // ── switch.*_port_*_poe  → PoE toggle ────────────────────────────────────
  if (eid.startsWith("switch.") && id.includes("_port_") && id.endsWith("_poe")) {
    return "poe_switch_entity";
  }

  // ── switch.*_port_* (no _poe suffix) → link entity ───────────────────────
  // This is how USW Lite / US 8 etc. expose port link state.
  // The switch is "on" when the port has a connected device.
  if (eid.startsWith("switch.") && id.includes("_port_") && !id.endsWith("_poe")) {
    return "link_entity";
  }

  // ── binary_sensor.*_port_* → link entity ─────────────────────────────────
  if (eid.startsWith("binary_sensor.") && id.includes("_port_")) {
    return "link_entity";
  }

  // ── sensor: throughput (rx/tx) — must be checked BEFORE speed/link ────────
  if (eid.startsWith("sensor.") && isThroughputEntity(id)) {
    return null; // explicitly ignore
  }

  // ── sensor: speed — id contains _link_speed anywhere ─────────────────────
  if (eid.startsWith("sensor.") && isSpeedEntity(id)) {
    return "speed_entity";
  }

  // ── sensor: PoE power ────────────────────────────────────────────────────
  if (eid.startsWith("sensor.") && id.includes("_port_") && id.includes("_poe_power")) {
    return "poe_power_entity";
  }

  // ── sensor: generic link/state (fallback for older FW naming) ────────────
  if (eid.startsWith("sensor.") && id.includes("_port_") && (
    id.includes("_link")   ||
    id.includes("_status") ||
    id.includes("_state")
  ) && !isThroughputEntity(id)) {
    return "link_entity";
  }

  return null;
}

function detectSpecialPortKey(entity) {
  const text = entityText(entity);
  const id   = lower(entity.entity_id);

  if (text.includes("wan 2") || id.includes("wan2"))
    return { key: "wan2", label: "WAN 2" };
  if ((text.includes("wan") || id.includes("wan")) && (text.includes("sfp") || id.includes("sfp")))
    return { key: "sfp_wan", label: "WAN SFP+" };
  if ((text.includes("lan") || id.includes("lan")) && (text.includes("sfp") || id.includes("sfp")))
    return { key: "sfp_lan", label: "LAN SFP+" };
  if (text.includes("wan") || id.includes("wan"))
    return { key: "wan", label: "WAN" };
  if (text.includes("sfp+") || text.includes("sfp") || id.includes("sfp"))
    return { key: "sfp", label: "SFP" };

  return null;
}

export function discoverPorts(entities) {
  const ports = new Map();

  for (const entity of entities || []) {
    const port = extractPortNumber(entity);
    if (!port) continue;

    const row = ensurePort(ports, port);
    row.raw_entities.push(entity.entity_id);

    const type = classifyPortEntity(entity);
    if (type && !row[type]) {
      row[type] = entity.entity_id;
    }
  }

  // If a port has no power_cycle_entity, strip PoE fields
  for (const row of ports.values()) {
    if (!row.power_cycle_entity) {
      row.poe_switch_entity = null;
      row.poe_power_entity  = null;
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

    const row  = ensureSpecialPort(specials, special.key, special.label);
    row.raw_entities.push(entity.entity_id);

    const type = classifyPortEntity(entity);
    if (type && !row[type]) {
      row[type] = entity.entity_id;
    }
  }

  return Array.from(specials.values());
}

export function mergePortsWithLayout(layout, discoveredPorts) {
  const byPort     = new Map(discoveredPorts.map((p) => [p.port, p]));
  const layoutPorts = (layout?.rows || []).flat();
  const merged     = [];

  for (const portNumber of layoutPorts) {
    merged.push(
      byPort.get(portNumber) || {
        key:               `port-${portNumber}`,
        port:              portNumber,
        label:             String(portNumber),
        kind:              "numbered",
        link_entity:       null,
        speed_entity:      null,
        poe_switch_entity: null,
        poe_power_entity:  null,
        power_cycle_entity:null,
        raw_entities:      [],
      }
    );
  }

  for (const port of discoveredPorts) {
    if (!layoutPorts.includes(port.port)) merged.push(port);
  }

  return merged.sort((a, b) => (a.port ?? 999) - (b.port ?? 999));
}

export function mergeSpecialsWithLayout(layout, discoveredSpecials) {
  const byKey         = new Map(discoveredSpecials.map((s) => [s.key, s]));
  const layoutSpecials = layout?.specialSlots || [];

  const merged = layoutSpecials.map((slot) => {
    return (
      byKey.get(slot.key) || {
        key:               slot.key,
        port:              null,
        label:             slot.label,
        kind:              "special",
        link_entity:       null,
        speed_entity:      null,
        poe_switch_entity: null,
        poe_power_entity:  null,
        power_cycle_entity:null,
        raw_entities:      [],
      }
    );
  });

  for (const special of discoveredSpecials) {
    if (!layoutSpecials.some((s) => s.key === special.key)) merged.push(special);
  }

  return merged;
}

export function stateObj(hass, entityId) {
  return entityId ? hass.states[entityId] || null : null;
}

export function stateValue(hass, entityId, fallback = "—") {
  const state = stateObj(hass, entityId);
  return state ? state.state : fallback;
}

// ─────────────────────────────────────────────────
// FIX: isOn
// Added "1" and numeric string > 0 as active values.
// Some UniFi speed sensors report "1000" (Mbit) for
// an active port with no dedicated binary_sensor.
// Also added "active" as a valid "on" state.
// ─────────────────────────────────────────────────
export function isOn(hass, entityId) {
  const state = stateObj(hass, entityId);
  if (!state) return false;

  const value = String(state.state).toLowerCase();
  if (
    value === "on"        ||
    value === "connected" ||
    value === "up"        ||
    value === "true"      ||
    value === "active"    ||
    value === "1"
  ) return true;

  // Numeric speed value > 0 means port is up
  const num = parseFloat(value);
  if (!isNaN(num) && num > 0) {
    // Only treat as link-state if the entity looks like a link/status entity
    const id = lower(entityId);
    if (
      id.includes("_link")   ||
      id.includes("_status") ||
      id.includes("_state")  ||
      id.includes("_port_status")
    ) return true;
  }

  return false;
}

export function formatState(hass, entityId, fallback = "—") {
  const state = stateObj(hass, entityId);
  if (!state) return fallback;

  const unit = state.attributes?.unit_of_measurement;
  if (state.state === "unknown" || state.state === "unavailable") return "—";

  return unit ? `${state.state} ${unit}` : state.state;
}

// ─────────────────────────────────────────────────
// FIX: getPortLinkText
// Falls back to raw_entities scan, now also
// considers numeric speed > 0 as "connected".
// Also uses speed_entity as last resort indicator.
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

    if (
      isLikelyLinkStateValue(value) &&
      !id.includes("poe") &&
      !id.includes("power") &&
      !id.includes("speed")
    ) {
      return value;
    }
  }

  // Last resort: if speed entity has a positive value → port is up
  if (port?.speed_entity) {
    const speedState = stateObj(hass, port.speed_entity);
    if (speedState) {
      const num = parseFloat(speedState.state);
      if (!isNaN(num) && num > 0) return "connected";
    }
  }

  return "—";
}

function simplifySpeed(value, unit = "") {
  const raw     = String(value ?? "").trim().toLowerCase();
  const rawUnit = String(unit  ?? "").trim().toLowerCase();

  if (!raw || raw === "unknown" || raw === "unavailable") return "—";

  const number = parseFloat(raw.replace(",", "."));

  if (!Number.isNaN(number)) {
    if (rawUnit.includes("gbit"))  return `${Math.round(number * 1000)} Mbit`;
    if (rawUnit.includes("mbit"))  return `${Math.round(number)} Mbit`;
    if (number === 10 || number === 100 || number === 1000 || number === 2500 || number === 10000) {
      return `${Math.round(number)} Mbit`;
    }
  }

  if (raw.includes("10g"))   return "10000 Mbit";
  if (raw.includes("2.5g"))  return "2500 Mbit";
  if (raw.includes("1g"))    return "1000 Mbit";
  if (raw.includes("1000"))  return "1000 Mbit";
  if (raw.includes("100m"))  return "100 Mbit";
  if (raw === "100")         return "100 Mbit";
  if (raw.includes("10m"))   return "10 Mbit";
  if (raw === "10")          return "10 Mbit";

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

    const id   = lower(entityId);
    const unit  = st.attributes?.unit_of_measurement || "";
    const value = String(st.state ?? "");

    if (isThroughputEntity(id)) continue;

    if (
      id.includes("link_speed")       ||
      id.endsWith("_speed")           ||
      id.includes("ethernet_speed")   ||
      id.includes("negotiated_speed")
    ) {
      const result = simplifySpeed(value, unit);
      if (result !== "—") return result;
    }
  }

  return "—";
}
