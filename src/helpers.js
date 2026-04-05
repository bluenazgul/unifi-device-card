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

function isUnifiConfigEntry(entry) {
  const domain = lower(entry?.domain);
  const title = lower(entry?.title);

  return domain === "unifi" || domain === "unifi_network" || title.includes("unifi");
}

function isAccessPoint(device, entities) {
  const model = lower(device?.model);
  const name = lower(device?.name);
  const userName = lower(device?.name_by_user);
  const text = deviceText(device, entities);

  return (
    model.includes("uap") ||
    model.includes("u6") ||
    model.includes("u7") ||
    model.includes("acpro") ||
    model.includes("ac-lite") ||
    model.includes("aclr") ||
    model.includes("nanohd") ||
    name.includes("ac pro") ||
    userName.includes("ac pro") ||
    name.includes("access point") ||
    userName.includes("access point") ||
    text.includes("access point") ||
    text.includes("uap-") ||
    text.includes(" ac pro") ||
    text.includes(" nanohd") ||
    text.includes(" mesh")
  );
}

function classifyDevice(device, entities) {
  if (isAccessPoint(device, entities)) return "access_point";

  const modelKey = resolveModelKey(device);
  if (
    modelKey === "UDRULT" ||
    modelKey === "UCGULTRA" ||
    modelKey === "UCGMAX" ||
    modelKey === "UDMPRO" ||
    modelKey === "UDMSE"
  ) {
    return "gateway";
  }

  if (
    modelKey === "US8P60" ||
    modelKey === "USMINI" ||
    modelKey === "USL8LP" ||
    modelKey === "USL8LPB" ||
    modelKey === "USL16LP" ||
    modelKey === "USL16LPB"
  ) {
    return "switch";
  }

  const model = lower(device?.model);
  const name = lower(device?.name);
  const userName = lower(device?.name_by_user);

  if (
    model.includes("udm") ||
    model.includes("ucg") ||
    model.includes("uxg") ||
    model.includes("gateway") ||
    name.includes("gateway") ||
    userName.includes("gateway")
  ) {
    return "gateway";
  }

  const hasPorts = entities.some((e) => /_port_\d+_/i.test(e.entity_id));
  if (hasPorts) return "switch";

  if (
    model.includes("usw") ||
    model.includes("us8") ||
    model.includes("usmini") ||
    model.includes("usl8") ||
    model.includes("usl16") ||
    name.includes("lite 8") ||
    name.includes("lite 16") ||
    name.includes("switch") ||
    userName.includes("switch")
  ) {
    return "switch";
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

function extractUnifiEntryIds(configEntries) {
  return new Set(
    (configEntries || []).filter(isUnifiConfigEntry).map((entry) => entry.entry_id)
  );
}

function hasUbiquitiManufacturer(device) {
  const manufacturer = lower(device?.manufacturer);
  return (
    manufacturer.includes("ubiquiti") ||
    manufacturer.includes("ubiquiti networks") ||
    manufacturer.includes("unifi")
  );
}

function isUnifiDevice(device, unifiEntryIds, entities, configEntries) {
  const byConfigEntry =
    Array.isArray(device?.config_entries) &&
    device.config_entries.some((id) => unifiEntryIds.has(id));

  if (byConfigEntry) return true;

  const byManufacturer = hasUbiquitiManufacturer(device);
  const text = deviceText(device, entities);

  const byStrongHint =
    text.includes("usw") ||
    text.includes("usmini") ||
    text.includes("usl8") ||
    text.includes("usl16") ||
    text.includes("us8") ||
    text.includes("udm") ||
    text.includes("ucg") ||
    text.includes("uxg") ||
    text.includes("cloud gateway") ||
    text.includes("unifi");

  const hasAnyUnifiEntry = (configEntries || []).some(isUnifiConfigEntry);

  if (!hasAnyUnifiEntry) {
    return byManufacturer && byStrongHint;
  }

  return byManufacturer && byStrongHint;
}

function buildDeviceLabel(device, type) {
  const name =
    normalize(device.name_by_user) ||
    normalize(device.name) ||
    normalize(device.model) ||
    "Unknown device";

  const model = normalize(device.model);
  const typeLabel = type === "gateway" ? "gateway" : "switch";

  if (model && lower(model) !== lower(name)) {
    return `${name} · ${model} (${typeLabel})`;
  }

  return `${name} (${typeLabel})`;
}

function extractFirmware(device, entities) {
  if (normalize(device?.sw_version)) return normalize(device.sw_version);

  const firmwareEntity = entities.find((entity) => {
    const id = lower(entity.entity_id);
    const text = entityText(entity);
    return id.includes("firmware") || id.includes("version") || text.includes("firmware");
  });

  return firmwareEntity ? firmwareEntity.entity_id : "";
}

export async function getUnifiDevices(hass) {
  const { devices, entitiesByDevice, configEntries } = await getAllData(hass);
  const unifiEntryIds = extractUnifiEntryIds(configEntries);

  return (devices || [])
    .map((device) => {
      const entities = entitiesByDevice.get(device.id) || [];
      if (!isUnifiDevice(device, unifiEntryIds, entities, configEntries)) return null;

      const type = classifyDevice(device, entities);
      if (type !== "switch" && type !== "gateway") return null;

      return {
        id: device.id,
        name:
          normalize(device.name_by_user) ||
          normalize(device.name) ||
          normalize(device.model),
        label: buildDeviceLabel(device, type),
        model: normalize(device.model),
        type,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.name.localeCompare(b.name, "de", { sensitivity: "base" }));
}

export async function getDeviceContext(hass, deviceId) {
  const { devices, entitiesByDevice, configEntries } = await getAllData(hass);
  const unifiEntryIds = extractUnifiEntryIds(configEntries);

  const device = devices.find((d) => d.id === deviceId);
  if (!device) return null;

  const entities = entitiesByDevice.get(deviceId) || [];
  if (!isUnifiDevice(device, unifiEntryIds, entities, configEntries)) return null;

  const type = classifyDevice(device, entities);
  if (type !== "switch" && type !== "gateway") return null;

  const discoveredPorts = discoverPorts(entities);
  const layout = getDeviceLayout(device, discoveredPorts);

  return {
    device,
    entities,
    type,
    layout,
    name:
      normalize(device.name_by_user) ||
      normalize(device.name) ||
      normalize(device.model),
    model: normalize(device.model),
    manufacturer: normalize(device.manufacturer),
    firmware: extractFirmware(device, entities),
  };
}

function extractPortNumber(entity) {
  const id = entity.entity_id || "";
  const originalName = entity.original_name || "";
  const name = entity.name || "";

  let match = id.match(/_port_(\d+)_/i);
  if (match) return Number(match[1]);

  match = originalName.match(/\bport\s+(\d+)\b/i);
  if (match) return Number(match[1]);

  match = name.match(/\bport\s+(\d+)\b/i);
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
      raw_entities: [],
    });
  }
  return map.get(port);
}

function isLikelyLinkStateValue(value) {
  const v = String(value ?? "").toLowerCase();
  return (
    v === "on" ||
    v === "off" ||
    v === "up" ||
    v === "down" ||
    v === "connected" ||
    v === "disconnected" ||
    v === "true" ||
    v === "false"
  );
}

function classifyPortEntity(entity) {
  const id = lower(entity.entity_id);
  const text = entityText(entity);

  if (entity.entity_id.startsWith("binary_sensor.")) {
    if (
      id.includes("_link") ||
      id.includes("_connected") ||
      id.includes("_connection") ||
      id.includes("_state") ||
      text.includes(" link") ||
      text.includes("connected") ||
      text.includes("connection")
    ) {
      return "link_entity";
    }
  }

  if (entity.entity_id.startsWith("sensor.")) {
    if (
      (id.includes("_state") || id.includes("_status") || id.includes("_link")) &&
      (text.includes("port") || text.includes("link") || text.includes("connected"))
    ) {
      return "link_entity";
    }
  }

  if (
    entity.entity_id.startsWith("sensor.") &&
    (id.includes("_speed") ||
      id.includes("link_speed") ||
      text.includes("speed") ||
      text.includes("mbit/s") ||
      text.includes("gbe") ||
      text.includes("link speed"))
  ) {
    return "speed_entity";
  }

  if (
    entity.entity_id.startsWith("switch.") &&
    (id.includes("_poe") || text.includes("poe"))
  ) {
    return "poe_switch_entity";
  }

  if (
    entity.entity_id.startsWith("sensor.") &&
    (id.includes("_poe_power") ||
      (text.includes("poe") && text.includes("power")) ||
      (text.includes("poe") && text.includes("w")))
  ) {
    return "poe_power_entity";
  }

  if (
    entity.entity_id.startsWith("button.") &&
    (id.includes("power_cycle") ||
      id.includes("restart") ||
      id.includes("reboot") ||
      (text.includes("power") && text.includes("cycle")))
  ) {
    return "power_cycle_entity";
  }

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

  for (const row of ports.values()) {
    if (!row.power_cycle_entity) {
      row.poe_switch_entity = null;
      row.poe_power_entity = null;
    }
  }

  return Array.from(ports.values()).sort((a, b) => a.port - b.port);
}

export function mergePortsWithLayout(layout, discoveredPorts) {
  const byPort = new Map(discoveredPorts.map((p) => [p.port, p]));
  const layoutPorts = (layout?.rows || []).flat();

  const merged = [];

  for (const portNumber of layoutPorts) {
    merged.push(
      byPort.get(portNumber) || {
        port: portNumber,
        link_entity: null,
        speed_entity: null,
        poe_switch_entity: null,
        poe_power_entity: null,
        power_cycle_entity: null,
        raw_entities: [],
      }
    );
  }

  for (const port of discoveredPorts) {
    if (!layoutPorts.includes(port.port)) {
      merged.push(port);
    }
  }

  return merged.sort((a, b) => a.port - b.port);
}

export function stateObj(hass, entityId) {
  return entityId ? hass.states[entityId] || null : null;
}

export function stateValue(hass, entityId, fallback = "—") {
  const state = stateObj(hass, entityId);
  return state ? state.state : fallback;
}

export function isOn(hass, entityId) {
  const state = stateObj(hass, entityId);
  if (!state) return false;

  const value = String(state.state).toLowerCase();
  return value === "on" || value === "connected" || value === "up" || value === "true";
}

export function formatState(hass, entityId, fallback = "—") {
  const state = stateObj(hass, entityId);
  if (!state) return fallback;

  const unit = state.attributes?.unit_of_measurement;
  if (state.state === "unknown" || state.state === "unavailable") return "—";

  return unit ? `${state.state} ${unit}` : state.state;
}

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
    if (isLikelyLinkStateValue(value)) return value;
  }

  return "—";
}

export function getPortSpeedText(hass, port) {
  const direct = stateObj(hass, port?.speed_entity);
  if (direct) {
    const unit = direct.attributes?.unit_of_measurement;
    if (unit) return `${direct.state} ${unit}`;
    if (String(direct.state ?? "").toLowerCase() !== "unknown") return String(direct.state);
  }

  for (const entityId of port?.raw_entities || []) {
    const st = stateObj(hass, entityId);
    if (!st) continue;

    const text = lower(entityId);
    const unit = st.attributes?.unit_of_measurement || "";
    const value = String(st.state ?? "");

    if (
      text.includes("speed") ||
      text.includes("link_speed") ||
      unit.toLowerCase().includes("mbit") ||
      unit.toLowerCase().includes("gbit")
    ) {
      return unit ? `${value} ${unit}` : value;
    }
  }

  return "—";
}
