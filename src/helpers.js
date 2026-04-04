import { getDeviceLayout } from "./model-registry.js";

function normalize(value) {
  return String(value ?? "").trim();
}

function lower(value) {
  return normalize(value).toLowerCase();
}

/* ---------------------------
   UNIFI SOURCE OF TRUTH
--------------------------- */

function isUnifiConfigEntry(entry) {
  return entry?.domain === "unifi" || entry?.domain === "unifi_network";
}

function extractUnifiEntryIds(configEntries) {
  return new Set(
    (configEntries || [])
      .filter(isUnifiConfigEntry)
      .map((e) => e.entry_id)
  );
}

function isUnifiDevice(device, unifiEntryIds) {
  return (
    Array.isArray(device?.config_entries) &&
    device.config_entries.some((id) => unifiEntryIds.has(id))
  );
}

/* ---------------------------
   DEVICE TYPE
--------------------------- */

function classifyDevice(device, entities) {
  const model = lower(device?.model);
  const name = lower(device?.name);

  // Gateway detection
  if (
    model.includes("udm") ||
    model.includes("ucg") ||
    model.includes("uxg") ||
    model.includes("gateway") ||
    name.includes("gateway")
  ) {
    return "gateway";
  }

  // Switch detection
  const hasPorts = entities.some((e) => /_port_\d+_/i.test(e.entity_id));

  if (hasPorts) return "switch";

  return "unknown";
}

/* ---------------------------
   DATA LOADING
--------------------------- */

async function safeCallWS(hass, msg, fallback = []) {
  try {
    return await hass.callWS(msg);
  } catch (err) {
    console.warn("[unifi-device-card] WS failed", msg?.type);
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

  for (const e of entities) {
    if (!e.device_id) continue;
    if (!entitiesByDevice.has(e.device_id)) {
      entitiesByDevice.set(e.device_id, []);
    }
    entitiesByDevice.get(e.device_id).push(e);
  }

  return { devices, entitiesByDevice, configEntries };
}

/* ---------------------------
   PUBLIC API
--------------------------- */

export async function getUnifiDevices(hass) {
  const { devices, entitiesByDevice, configEntries } = await getAllData(hass);

  const unifiEntryIds = extractUnifiEntryIds(configEntries);

  return (devices || [])
    .map((device) => {
      if (!isUnifiDevice(device, unifiEntryIds)) return null;

      const entities = entitiesByDevice.get(device.id) || [];

      const type = classifyDevice(device, entities);

      if (type === "unknown") return null;

      return {
        id: device.id,
        name:
          normalize(device.name_by_user) ||
          normalize(device.name) ||
          normalize(device.model),
        label: `${device.name || device.model} (${type})`,
        model: device.model,
        type,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.name.localeCompare(b.name));
}

/* ---------------------------
   DEVICE CONTEXT
--------------------------- */

export async function getDeviceContext(hass, deviceId) {
  const { devices, entitiesByDevice, configEntries } = await getAllData(hass);

  const unifiEntryIds = extractUnifiEntryIds(configEntries);

  const device = devices.find((d) => d.id === deviceId);
  if (!device) return null;

  if (!isUnifiDevice(device, unifiEntryIds)) return null;

  const entities = entitiesByDevice.get(deviceId) || [];

  const type = classifyDevice(device, entities);

  const ports = discoverPorts(entities);
  const layout = getDeviceLayout(device, ports);

  return {
    device,
    entities,
    type,
    layout,
    name: device.name || device.model,
    model: device.model,
  };
}

/* ---------------------------
   PORT DISCOVERY
--------------------------- */

function extractPortNumber(entity) {
  const id = entity.entity_id;

  const match = id.match(/_port_(\d+)_/i);
  if (match) return Number(match[1]);

  return null;
}

function ensurePort(map, port) {
  if (!map.has(port)) {
    map.set(port, {
      port,
      link_entity: null,
      speed_entity: null,
      poe_switch_entity: null,
      poe_power_entity: null,
      power_cycle_entity: null,
    });
  }
  return map.get(port);
}

function classifyPortEntity(entity) {
  const id = lower(entity.entity_id);

  if (id.includes("link")) return "link_entity";
  if (id.includes("speed")) return "speed_entity";
  if (id.includes("poe_power")) return "poe_power_entity";
  if (id.includes("poe")) return "poe_switch_entity";
  if (id.includes("power_cycle")) return "power_cycle_entity";

  return null;
}

export function discoverPorts(entities) {
  const ports = new Map();

  for (const e of entities) {
    const port = extractPortNumber(e);
    if (!port) continue;

    const row = ensurePort(ports, port);

    const type = classifyPortEntity(e);
    if (type && !row[type]) {
      row[type] = e.entity_id;
    }
  }

  return Array.from(ports.values()).sort((a, b) => a.port - b.port);
}

/* ---------------------------
   STATE HELPERS
--------------------------- */

export function stateObj(hass, entityId) {
  return entityId ? hass.states[entityId] : null;
}

export function stateValue(hass, entityId, fallback = "—") {
  const s = stateObj(hass, entityId);
  return s ? s.state : fallback;
}

export function isOn(hass, entityId) {
  const s = stateObj(hass, entityId);
  if (!s) return false;

  const v = String(s.state).toLowerCase();
  return v === "on" || v === "connected" || v === "up";
}

export function formatState(hass, entityId, fallback = "—") {
  const s = stateObj(hass, entityId);
  if (!s) return fallback;

  const unit = s.attributes?.unit_of_measurement;
  return unit ? `${s.state} ${unit}` : s.state;
}
