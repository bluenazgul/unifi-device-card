import {
  AP_MODEL_PREFIXES,
  applyPortsPerRowOverride,
  GATEWAY_MODEL_PREFIXES,
  getDeviceLayout,
  resolveModelKey,
  SWITCH_MODEL_PREFIXES,
} from "./model-registry.js";
// Shared architecture modules:
// identity => canonical device identity + MAC helpers
// capabilities => per-device feature matrix
// classify => device type decision
// unique-id => stable UniFi unique_id parsing helpers
import { buildNormalizedDeviceIdentity, extractFirstMac, findDeviceByMac } from "./identity.js";
import { buildDeviceCapabilities } from "./capabilities.js";
import { classifyDeviceType } from "./classify.js";
import { parseUnifiPortUniqueId } from "./unique-id.js";

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

function normalizeModelStr(value) {
  return String(value ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "");
}

const INDEXED_PORT_ID_RE = /(?:^|[_-])(?:port|lan|eth|ethernet)[_-]?(\d+)(?:[_-]|$)|(?:^|[_-])sfp(?:28)?[_-]?(\d+)(?:[_-]|$)/i;

function findIndexedPortIdMatch(value) {
  const match = String(value || "").match(INDEXED_PORT_ID_RE);
  if (!match) return null;
  return [match[0], match[1] || match[2]];
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
  const identity = buildNormalizedDeviceIdentity(device);
  const capabilities = buildDeviceCapabilities(entities, identity);
  return classifyDeviceType(identity, capabilities, entities, device);
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
    const fallbackEntities = flattenEntitiesByDevice(
      cached?.data?.allEntitiesByDevice || cached?.data?.entitiesByDevice
    );
    const fallbackConfigEntries = cached?.data?.configEntries || [];

    const [devices, rawEntities, configEntries] = await Promise.all([
      safeCallWS(hass, { type: "config/device_registry/list" }, fallbackDevices),
      safeCallWS(hass, { type: "config/entity_registry/list" }, fallbackEntities),
      safeCallWS(hass, { type: "config/config_entries" }, fallbackConfigEntries),
    ]);

    const allEntities = rawEntities || [];
    const entities = allEntities.filter((e) => !e.disabled_by && !e.hidden_by);

    const entitiesByDevice = new Map();
    for (const entity of entities) {
      if (!entity.device_id) continue;
      if (!entitiesByDevice.has(entity.device_id)) {
        entitiesByDevice.set(entity.device_id, []);
      }
      entitiesByDevice.get(entity.device_id).push(entity);
    }

    const allEntitiesByDevice = new Map();
    for (const entity of allEntities) {
      if (!entity.device_id) continue;
      if (!allEntitiesByDevice.has(entity.device_id)) {
        allEntitiesByDevice.set(entity.device_id, []);
      }
      allEntitiesByDevice.get(entity.device_id).push(entity);
    }

    const data = {
      devices: devices || [],
      entitiesByDevice,
      allEntitiesByDevice,
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

  if (modelStartsWith(device, [
    ...SWITCH_MODEL_PREFIXES,
    ...GATEWAY_MODEL_PREFIXES,
    ...AP_MODEL_PREFIXES,
  ])) {
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
    temperature_entity:
      findDeviceEntityByPatterns(entities, ["device_temperature", "system_temperature", "board_temperature", "chassis_temperature"]) ||
      findSystemStatEntity(
        entities,
        ["temperature", "temp"],
        ["cpu", "processor", "memory", "ram", "wan", "sfp", "uplink", "link_speed", "link", "rx", "tx", "throughput", "poe", "fan"]
      ),
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

function safeEntityState(hass, entityId) {
  if (!entityId) return null;
  const raw = String(hass?.states?.[entityId]?.state ?? "").trim();
  if (!raw || raw === "unknown" || raw === "unavailable" || raw === "none") return null;
  return raw;
}

function readStateAttributes(hass, entityId) {
  if (!entityId) return {};
  const attrs = hass?.states?.[entityId]?.attributes;
  return attrs && typeof attrs === "object" ? attrs : {};
}

function pickAttribute(attrs, keys = []) {
  for (const key of keys) {
    if (attrs[key] !== undefined && attrs[key] !== null && String(attrs[key]).trim() !== "") {
      return attrs[key];
    }
  }
  return null;
}

function discoverApUplinkEntities(entities) {
  const result = {
    uplink_mac_entity: null,
    mesh_peer_mac_entity: null,
    remote_port_entity: null,
    uplink_type_entity: null,
  };

  for (const entity of entities || []) {
    const id = lower(entity.entity_id);
    if (!id.startsWith("sensor.")) continue;
    const translationKey = lower(entity.translation_key || "");
    const displayText = lower([entity.original_name, entity.name].filter(Boolean).join(" "));
    const fallbackText = lower([entity.entity_id, entity.original_name, entity.name].filter(Boolean).join(" "));

    if (!result.uplink_mac_entity && translationKey === "device_uplink_mac") {
      result.uplink_mac_entity = entity.entity_id;
      continue;
    }

    if (!result.remote_port_entity && (translationKey === "device_uplink_remote_port" || translationKey === "uplink_remote_port")) {
      result.remote_port_entity = entity.entity_id;
      continue;
    }

    if (!result.uplink_type_entity && (translationKey === "device_uplink_type" || translationKey === "uplink_type")) {
      result.uplink_type_entity = entity.entity_id;
      continue;
    }

    if (!result.mesh_peer_mac_entity && (translationKey === "device_mesh_peer_mac" || translationKey === "mesh_peer_mac")) {
      result.mesh_peer_mac_entity = entity.entity_id;
      continue;
    }

    const hasUplinkSignal =
      translationKey.includes("uplink") ||
      displayText.includes("uplink") ||
      displayText.includes("mesh peer");
    if (!hasUplinkSignal) continue;

    if (
      !result.mesh_peer_mac_entity &&
      (translationKey.includes("mesh_peer_mac") ||
        (displayText.includes("mesh peer") && displayText.includes("mac")) ||
        (fallbackText.includes("meshv3") && fallbackText.includes("peer") && fallbackText.includes("mac")))
    ) {
      result.mesh_peer_mac_entity = entity.entity_id;
      continue;
    }

    if (
      !result.uplink_mac_entity &&
      ((translationKey.includes("uplink") && translationKey.includes("mac")) ||
        (displayText.includes("uplink") && displayText.includes("mac")) ||
        fallbackText.includes("_uplink_mac"))
    ) {
      result.uplink_mac_entity = entity.entity_id;
      continue;
    }

    if (
      !result.remote_port_entity &&
      ((translationKey.includes("uplink") && translationKey.includes("port")) ||
        (displayText.includes("uplink") && displayText.includes("port")) ||
        fallbackText.includes("_uplink_remote_port"))
    ) {
      result.remote_port_entity = entity.entity_id;
      continue;
    }

    if (
      !result.uplink_type_entity &&
      ((translationKey.includes("uplink") && (translationKey.includes("type") || translationKey.includes("source"))) ||
        (displayText.includes("uplink") && (displayText.includes("type") || displayText.includes("source"))))
    ) {
      result.uplink_type_entity = entity.entity_id;
    }
  }

  return result;
}

function resolveAccessPointUplink(hass, entities, allDevices) {
  const discovered = discoverApUplinkEntities(entities);
  const uplinkAttrs = readStateAttributes(hass, discovered.uplink_mac_entity);
  const uplinkMacRaw = safeEntityState(hass, discovered.uplink_mac_entity);
  const meshPeerMacRaw = safeEntityState(hass, discovered.mesh_peer_mac_entity);
  const remotePortRaw = safeEntityState(hass, discovered.remote_port_entity) || pickAttribute(uplinkAttrs, [
    "uplink_remote_port",
    "remote_port",
    "port",
    "uplink_port",
    "port_number",
    "remote_port_number",
    "uplink_port_number",
    "uplink_port_id",
  ]);
  const uplinkTypeRaw = lower(
    safeEntityState(hass, discovered.uplink_type_entity) || pickAttribute(uplinkAttrs, [
      "uplink_type",
      "type",
      "uplink_source",
      "connection_type",
      "media",
    ])
  );

  const uplinkMac = extractFirstMac(uplinkMacRaw);
  const meshPeerMac = extractFirstMac(meshPeerMacRaw);
  const viaMac = meshPeerMac || uplinkMac;
  const remotePortNormalized = normalize(remotePortRaw);
  const remotePortMatch = remotePortNormalized.match(/\d+/);
  const remotePort = remotePortMatch ? remotePortMatch[0] : remotePortNormalized;

  const viaDevice = findDeviceByMac(allDevices, viaMac);
  const viaDeviceName = viaDevice
    ? normalize(viaDevice.name_by_user) || normalize(viaDevice.name) || normalize(viaDevice.model)
    : null;

  const meshByType =
    uplinkTypeRaw.includes("mesh") ||
    uplinkTypeRaw.includes("wireless") ||
    uplinkTypeRaw.includes("wifi") ||
    uplinkTypeRaw.includes("wlan") ||
    uplinkAttrs.is_uplink_wireless === true;
  const wiredByType =
    uplinkTypeRaw.includes("wired") ||
    uplinkTypeRaw.includes("ethernet") ||
    uplinkTypeRaw.includes("lan") ||
    uplinkAttrs.is_uplink_wireless === false;
  const resolvedDeviceType = viaDevice ? getDeviceType(viaDevice, []) : null;

  const meshSignals = meshPeerMac || meshByType || uplinkTypeRaw.includes("wireless_uplink");
  const wiredSignals = remotePort || wiredByType || resolvedDeviceType === "switch" || resolvedDeviceType === "gateway";

  const kind = wiredSignals
    ? "wired"
    : meshSignals
      ? "mesh"
      : "unknown";

  if (!viaMac && !remotePort && !uplinkTypeRaw) return null;

  return {
    kind,
    via_device_id: viaDevice?.id || null,
    via_device_name: viaDeviceName || null,
    via_mac: viaMac || null,
    remote_port: remotePort || null,
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
  const { devices, entitiesByDevice, allEntitiesByDevice, configEntries } = await getAllData(hass);
  const unifiEntryIds = extractUnifiEntryIds(configEntries);

  const results = [];
  for (const device of devices || []) {
    const entities = allEntitiesByDevice?.get(device.id) || entitiesByDevice.get(device.id) || [];
    if (!isUnifiDevice(device, unifiEntryIds, entities)) continue;

    const identity = buildNormalizedDeviceIdentity(device);
    const capabilities = buildDeviceCapabilities(entities, identity);
    const type = classifyDeviceType(identity, capabilities, entities, device);
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
      flattenEntitiesByDevice(cached?.allEntitiesByDevice || cached?.entitiesByDevice)
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
  const parsedUid = parseUnifiPortUniqueId(entity?.unique_id);
  if (parsedUid?.port) return parsedUid.port;

  const uid = normalize(entity.unique_id);
  const uidMatch = findIndexedPortIdMatch(uid) || uid.match(/-(\d+)-[a-z]/i);

  if (uidMatch) return parseInt(uidMatch[1], 10);

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
  const text = lower([entity.entity_id, entity.translation_key, entity.original_name, entity.name].filter(Boolean).join(" "));

  if (id.includes("_wan2") || id.endsWith("wan2") || tk.includes("wan2")) {
    return { key: "wan2", label: "WAN 2" };
  }
  if (id.includes("_wan_") || id.endsWith("_wan") || tk.includes("wan")) {
    return { key: "wan", label: "WAN" };
  }

  const sfp28Match = id.match(/_sfp28[_+]?(\d+)[_-]/) || tk.match(/sfp28[_+]?(\d+)/);
  if (sfp28Match) return { key: `sfp28_${sfp28Match[1]}`, label: `SFP28 ${sfp28Match[1]}` };
  if (id.includes("_sfp28") || tk.includes("sfp28")) return { key: "sfp28_1", label: "SFP28" };

  const looksSfpPlus =
    text.includes("sfp+") ||
    text.includes("sfp plus") ||
    text.includes("sfpplus") ||
    tk.includes("sfp_plus") ||
    id.includes("sfpplus");

  const sfpMatch = id.match(/_sfp[_+]?(\d+)[_-]/) || tk.match(/sfp[_+]?(\d+)/);
  if (sfpMatch) {
    return { key: `sfp_${sfpMatch[1]}`, label: `${looksSfpPlus ? "SFP+" : "SFP"} ${sfpMatch[1]}` };
  }
  if (id.includes("_sfp") || id.includes("sfp+")) return { key: "sfp_1", label: looksSfpPlus ? "SFP+" : "SFP" };

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
  const hasKnownPoeRange =
    Array.isArray(layout?.poePortRange) &&
    layout.poePortRange.length === 2 &&
    Number.isInteger(layout.poePortRange[0]) &&
    Number.isInteger(layout.poePortRange[1]);

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

    merged.push(hasKnownPoeRange && !hasPoe ? stripPoeEntities(port) : port);
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
  const { devices, entitiesByDevice, allEntitiesByDevice, configEntries } = await getAllData(hass);
  const unifiEntryIds = extractUnifiEntryIds(configEntries);

  const device = devices.find((d) => d.id === deviceId);
  if (!device) return null;

  const allEntities = allEntitiesByDevice?.get(deviceId) || entitiesByDevice.get(deviceId) || [];
  let entities = entitiesByDevice.get(deviceId) || [];
  if (!isUnifiDevice(device, unifiEntryIds, allEntities)) return null;

  const identity = buildNormalizedDeviceIdentity(device);
  const capabilities = buildDeviceCapabilities(allEntities, identity);
  const type = classifyDeviceType(identity, capabilities, allEntities, device);
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
  const apUplink = type === "access_point"
    ? resolveAccessPointUplink(hass, entities, devices)
    : null;

  return {
    device,
    identity,
    capabilities,
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
    ap_uplink: apUplink,
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

export function trafficValue(hass, entityId) {
  const raw = stateValue(hass, entityId);
  if (raw == null || raw === "unavailable" || raw === "unknown") return 0;

  const num = parseFloat(String(raw).replace(",", "."));
  return Number.isFinite(num) ? num : 0;
}

export function hasTraffic(hass, port) {
  return trafficValue(hass, port?.rx_entity) > 0 || trafficValue(hass, port?.tx_entity) > 0;
}

function portObservedClientCount(hass, port) {
  const candidates = [
    port?.link_entity,
    port?.speed_entity,
    port?.port_switch_entity,
    port?.rx_entity,
    port?.tx_entity,
  ].filter(Boolean);

  const numericKeys = [
    "connected_clients",
    "client_count",
    "clients",
    "num_clients",
    "active_clients",
    "station_count",
  ];

  const listKeys = ["clients", "connected_clients", "client_list", "stations", "hosts"];
  let bestCount = 0;

  for (const entityId of candidates) {
    const attrs = stateObj(hass, entityId)?.attributes;
    if (!attrs || typeof attrs !== "object") continue;

    for (const key of numericKeys) {
      const num = Number.parseInt(attrs[key], 10);
      if (Number.isInteger(num) && num > bestCount) bestCount = num;
    }

    for (const key of listKeys) {
      const value = attrs[key];
      if (Array.isArray(value) && value.length > bestCount) bestCount = value.length;
    }
  }

  return bestCount;
}

function isSfpSpecialPort(port) {
  if (port?.kind !== "special") return false;

  const key = lower(port?.physical_key || port?.key || "");
  return key.startsWith("sfp_") || key.startsWith("sfp28_");
}

/**
 * Returns true if the port is SFP-like, either by slot kind or by entity naming.
 * Catches cases like the UDMPRO where SFP ports are numbered but named "sfp_1" /
 * "sfp_2" in their entity IDs rather than being declared as special slots.
 */
export function isSfpLikePort(port) {
  if (isSfpSpecialPort(port)) return true;
  const text = [
    port?.key,
    port?.physical_key,
    port?.label,
    port?.speed_entity,
    port?.rx_entity,
    port?.tx_entity,
    port?.link_entity,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return text.includes("sfp") || text.includes("10g");
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
  // However, if the integration exposes an explicit link or speed state,
  // trust those first so idle-but-linked SFP(+) ports still show correctly.
  if (
    isSfpSpecialPort(port) &&
    (port?.rx_entity || port?.tx_entity) &&
    !port?.link_entity &&
    !port?.speed_entity
  ) {
    return hasTraffic(hass, port);
  }
  // --- END new behavior for Issue #91 ---

  const speedMbit = parseLinkSpeedMbit(hass, port.speed_entity);
  if (speedMbit != null) {
    if (speedMbit > 0) {
      // RJ45 ghost-link guard:
      // Some setups report persistent 10 Mbit on idle/disconnected copper ports.
      // If no explicit link sensor exists and we have neither traffic, clients, nor PoE activity,
      // treat 10 Mbit as not connected to avoid false "up" LEDs.
      if (!isSfpLikePort(port) && !port?.link_entity && speedMbit <= 10) {
        const hasActiveTraffic = hasTraffic(hass, port);
        const clientCount = portObservedClientCount(hass, port);
        const poeActive = getPoeStatus(hass, port).active;
        if (!hasActiveTraffic && clientCount === 0 && !poeActive) return false;
      }
      // SFP ghost-link guard (extended): some gateways report rated speed on SFP
      // ports when the module is seated but no cable is connected. Use traffic
      // presence as the definitive test when an explicit link sensor is absent.
      if (isSfpLikePort(port) && !port?.link_entity && (port?.rx_entity || port?.tx_entity)) {
        if (!hasTraffic(hass, port)) return false;
      }
      return true;
    }
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
