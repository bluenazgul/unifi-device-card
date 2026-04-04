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

function buildDeviceLabel(device, type) {
  const name =
    normalize(device.name_by_user) ||
    normalize(device.name) ||
    normalize(device.model) ||
    "Unknown device";

  const model = normalize(device.model);
  const typeLabel =
    type === "switch"
      ? "switch"
      : type === "gateway"
      ? "gateway"
      : type === "access_point"
      ? "ap"
      : "unknown";

  if (model && lower(model) !== lower(name)) {
    return `${name} · ${model} (${typeLabel})`;
  }

  return `${name} (${typeLabel})`;
}

function isUnifiConfigEntry(entry) {
  const domain = lower(entry?.domain);
  const title = lower(entry?.title);
  return domain === "unifi" || domain === "unifi_network" || title.includes("unifi");
}

function classifyDevice(device, entities) {
  const text = deviceText(device, entities);

  const isAccessPoint =
    text.includes("access point") ||
    text.includes(" uap") ||
    text.includes("uap-") ||
    text.includes(" nanohd") ||
    text.includes(" u6") ||
    text.includes(" u7") ||
    text.includes(" mesh");

  if (isAccessPoint) return "access_point";

  const isGateway =
    text.includes("udm") ||
    text.includes("ucg") ||
    text.includes("uxg") ||
    text.includes("dream machine") ||
    text.includes("gateway") ||
    text.includes("wan ");

  if (isGateway) return "gateway";

  const hasPortEntities = entities.some((e) => /_port_\d+_/i.test(e.entity_id));
  const hasSwitchModelHints =
    text.includes("usw") ||
    text.includes("us-") ||
    text.includes("lite 8") ||
    text.includes("lite 16") ||
    text.includes("flex");

  if (hasPortEntities || hasSwitchModelHints) return "switch";

  return "unknown";
}

async function safeCallWS(hass, msg, fallback = []) {
  try {
    return await hass.callWS(msg);
  } catch (err) {
    console.warn("[unifi-device-card] WS call failed:", msg?.type, err);
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

  return { devices, entities, configEntries, entitiesByDevice };
}

function extractUnifiEntryIds(configEntries) {
  return new Set(
    (configEntries || []).filter(isUnifiConfigEntry).map((entry) => entry.entry_id)
  );
}

function deviceBelongsToUnifi(device, unifiEntryIds, entities) {
  const byConfigEntry =
    unifiEntryIds.size > 0 &&
    Array.isArray(device?.config_entries) &&
    device.config_entries.some((id) => unifiEntryIds.has(id));

  if (byConfigEntry) return true;

  const manufacturer = lower(device?.manufacturer);
  const model = lower(device?.model);
  const name = lower(device?.name);
  const userName = lower(device?.name_by_user);

  const text = deviceText(device, entities);

  const hasUnifiManufacturer =
    manufacturer.includes("ubiquiti") || manufacturer.includes("unifi");

  const hasStrongModelHint =
    model.includes("usw") ||
    model.includes("us-") ||
    model.includes("udm") ||
    model.includes("ucg") ||
    model.includes("uxg");

  const hasStrongNameHint =
    name.includes("usw") ||
    name.includes("us-") ||
    name.includes("udm") ||
    name.includes("ucg") ||
    name.includes("uxg") ||
    userName.includes("usw") ||
    userName.includes("us-") ||
    userName.includes("udm") ||
    userName.includes("ucg") ||
    userName.includes("uxg");

  const hasStrongEntityHint = entities.some((entity) => {
    const eid = lower(entity.entity_id);
    const txt = entityText(entity);

    return (
      eid.includes("usw") ||
      eid.includes("us_") ||
      eid.includes("udm") ||
      eid.includes("ucg") ||
      eid.includes("uxg") ||
      txt.includes("unifi") ||
      txt.includes("ubiquiti")
    );
  });

  return (
    hasUnifiManufacturer ||
    hasStrongModelHint ||
    hasStrongNameHint ||
    hasStrongEntityHint
  );
}

export async function getUnifiDevices(hass) {
  const { devices, configEntries, entitiesByDevice } = await getAllData(hass);
  const unifiEntryIds = extractUnifiEntryIds(configEntries);

  return (devices || [])
    .map((device) => {
      const entities = entitiesByDevice.get(device.id) || [];
      const belongsToUnifi = deviceBelongsToUnifi(device, unifiEntryIds, entities);

      return {
        device,
        entities,
        belongsToUnifi,
      };
    })
    .filter((row) => row.belongsToUnifi)
    .map(({ device, entities }) => {
      const type = classifyDevice(device, entities);

      return {
        id: device.id,
        name:
          normalize(device.name_by_user) ||
          normalize(device.name) ||
          normalize(device.model) ||
          "Unknown device",
        label: buildDeviceLabel(device, type),
        model: normalize(device.model),
        manufacturer: normalize(device.manufacturer),
        type,
      };
    })
    .filter((device) => device.type === "switch" || device.type === "gateway")
    .sort((a, b) => a.label.localeCompare(b.label, "de", { sensitivity: "base" }));
}

export async function getDeviceContext(hass, deviceId) {
  const { devices, configEntries, entitiesByDevice } = await getAllData(hass);
  const unifiEntryIds = extractUnifiEntryIds(configEntries);

  const device = (devices || []).find((d) => d.id === deviceId);
  if (!device) return null;

  const entities = entitiesByDevice.get(deviceId) || [];
  const belongsToUnifi = deviceBelongsToUnifi(device, unifiEntryIds, entities);

  if (!belongsToUnifi) return null;

  const type = classifyDevice(device, entities);

  return {
    device,
    entities,
    type,
    name:
      normalize(device.name_by_user) ||
      normalize(device.name) ||
      normalize(device.model) ||
      "Unknown device",
    model: normalize(device.model),
    manufacturer: normalize(device.manufacturer),
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

function classifyPortEntity(entity) {
  const eid = lower(entity.entity_id);
  const text = entityText(entity);

  if (
    entity.entity_id.startsWith("binary_sensor.") &&
    (eid.includes("_link") || text.includes(" link"))
  ) {
    return "link_entity";
  }

  if (
    entity.entity_id.startsWith("sensor.") &&
    (eid.includes("_speed") || text.includes("speed"))
  ) {
    return "speed_entity";
  }

  if (
    entity.entity_id.startsWith("switch.") &&
    (eid.includes("_poe") || text.includes("poe"))
  ) {
    return "poe_switch_entity";
  }

  if (
    entity.entity_id.startsWith("sensor.") &&
    (eid.includes("_poe_power") ||
      (text.includes("poe") && text.includes("power")) ||
      (text.includes("poe") && text.includes("w")))
  ) {
    return "poe_power_entity";
  }

  if (
    entity.entity_id.startsWith("button.") &&
    (eid.includes("power_cycle") ||
      eid.includes("restart") ||
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

    const slot = classifyPortEntity(entity);
    if (slot && !row[slot]) {
      row[slot] = entity.entity_id;
    }
  }

  return Array.from(ports.values()).sort((a, b) => a.port - b.port);
}

export function stateObj(hass, entityId) {
  return entityId ? hass.states[entityId] || null : null;
}

export function stateValue(hass, entityId, fallback = "—") {
  const st = stateObj(hass, entityId);
  if (!st) return fallback;
  return st.state ?? fallback;
}

export function isOn(hass, entityId) {
  return stateValue(hass, entityId, "off") === "on";
}

export function formatState(hass, entityId, fallback = "—") {
  const st = stateObj(hass, entityId);
  if (!st) return fallback;

  const state = st.state ?? fallback;
  const unit = st.attributes?.unit_of_measurement || "";

  if (state === "unknown" || state === "unavailable") return "—";
  return unit ? `${state} ${unit}` : String(state);
}
