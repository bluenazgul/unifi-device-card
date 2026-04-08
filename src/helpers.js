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

async function safeCallWS(hass, msg, fallback = []) {
  try {
    return await hass.callWS(msg);
  } catch (err) {
    console.warn("[unifi-device-card] WS failed", msg?.type, err);
    return fallback;
  }
}

const REGISTRY_CACHE_TTL = 1500;
const _registryCache = new WeakMap();

async function getAllData(hass) {
  const now = Date.now();
  const cached = _registryCache.get(hass);
  if (cached && now - cached.ts < REGISTRY_CACHE_TTL) {
    return cached.data;
  }

  const [devices, rawEntities] = await Promise.all([
    safeCallWS(hass, { type: "config/device_registry/list" }, []),
    safeCallWS(hass, { type: "config/entity_registry/list" }, []),
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

  const data = { devices, entitiesByDevice, configEntries: [] };
  _registryCache.set(hass, { ts: now, data });
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
  const typeSuffix =
    type === "gateway" ? "Gateway" :
    type === "switch" ? "Switch" :
    type === "access_point" ? "AP" :
    "Device";

  if (model && !name.includes(model)) {
    return `${name} · ${model} (${typeSuffix})`;
  }

  return `${name} (${typeSuffix})`;
}

function sortDevices(a, b) {
  const an = lower(a?.label || a?.name || "");
  const bn = lower(b?.label || b?.name || "");
  return an.localeCompare(bn, undefined, { numeric: true, sensitivity: "base" });
}

export async function getUnifiDevices(hass) {
  const { devices, entitiesByDevice, configEntries } = await getAllData(hass);
  const unifiEntryIds = extractUnifiEntryIds(configEntries);

  const result = [];

  for (const device of devices || []) {
    const entities = entitiesByDevice.get(device.id) || [];
    if (!entities.length) continue;

    if (!isUnifiDevice(device, unifiEntryIds, entities)) continue;

    const type = classifyDevice(device, entities);
    if (type !== "gateway" && type !== "switch") continue;

    result.push({
      id: device.id,
      label: buildDeviceLabel(device, type),
      name:
        normalize(device.name_by_user) ||
        normalize(device.name) ||
        normalize(device.model) ||
        "Unknown device",
      model: normalize(device.model),
      type,
    });
  }

  return result.sort(sortDevices);
}

export async function getDeviceContext(hass, deviceId) {
  const { devices, entitiesByDevice } = await getAllData(hass);
  const device = (devices || []).find((d) => d.id === deviceId) || null;
  if (!device) return null;

  const entities = (entitiesByDevice.get(deviceId) || []).slice();
  const type = classifyDevice(device, entities);
  const layout = getDeviceLayout(device, entities);

  return {
    id: device.id,
    name:
      normalize(device.name_by_user) ||
      normalize(device.name) ||
      normalize(device.model) ||
      "Unknown device",
    model: normalize(device.model),
    firmware: normalize(device.sw_version || device.firmware_version || ""),
    manufacturer: normalize(device.manufacturer),
    type,
    layout,
    device,
    entities,
  };
}

// ─────────────────────────────────────────────────
// Disabled / hidden entity warnings
// ─────────────────────────────────────────────────

const WARNING_PATTERNS = [
  {
    key: "port_switch",
    match: (entity) => {
      const txt = entityText(entity);
      return (
        entity.platform === "switch" &&
        /port/i.test(txt) &&
        !/poe/i.test(txt)
      );
    },
  },
  {
    key: "poe_switch",
    match: (entity) => {
      const txt = entityText(entity);
      return entity.platform === "switch" && /poe/i.test(txt);
    },
  },
  {
    key: "poe_power",
    match: (entity) => {
      const txt = entityText(entity);
      return entity.platform === "sensor" && /poe/i.test(txt) && /power|consumption|watt/i.test(txt);
    },
  },
  {
    key: "link_speed",
    match: (entity) => {
      const txt = entityText(entity);
      return entity.platform === "sensor" && /speed|link speed/i.test(txt);
    },
  },
  {
    key: "rx_tx",
    match: (entity) => {
      const txt = entityText(entity);
      return entity.platform === "sensor" && /(rx|tx|throughput|traffic)/i.test(txt);
    },
  },
  {
    key: "power_cycle",
    match: (entity) => {
      const txt = entityText(entity);
      return entity.platform === "button" && /power cycle|cycle power|restart port/i.test(txt);
    },
  },
  {
    key: "link",
    match: (entity) => {
      const txt = entityText(entity);
      return /(link|uplink)/i.test(txt);
    },
  },
];

function bucketEntityWarning(entity) {
  for (const def of WARNING_PATTERNS) {
    try {
      if (def.match(entity)) return def.key;
    } catch (_err) {}
  }
  return null;
}

export async function getRelevantEntityWarningsForDevice(hass, deviceId) {
  const rawEntities = await safeCallWS(hass, { type: "config/entity_registry/list" }, []);
  const entities = (rawEntities || []).filter((e) => e?.device_id === deviceId);

  const disabled = [];
  const hidden = [];
  const buckets = {
    port_switch: 0,
    poe_switch: 0,
    poe_power: 0,
    link_speed: 0,
    rx_tx: 0,
    power_cycle: 0,
    link: 0,
  };

  for (const entity of entities) {
    const isDisabled = !!entity?.disabled_by;
    const isHidden = !!entity?.hidden_by;
    if (!isDisabled && !isHidden) continue;

    const bucket = bucketEntityWarning(entity);
    if (bucket) {
      buckets[bucket] += 1;
    }

    if (isDisabled) disabled.push(entity);
    if (isHidden) hidden.push(entity);
  }

  return {
    disabled,
    hidden,
    buckets,
    disabledCount: disabled.length,
    hiddenCount: hidden.length,
    hasWarnings: disabled.length > 0 || hidden.length > 0,
  };
}

// ─────────────────────────────────────────────────
// Port entity parsing
// ─────────────────────────────────────────────────

function parsePortNumberFromEntityId(entityId) {
  const text = String(entityId || "");

  const patterns = [
    /(?:^|_)port_(\d+)(?:_|$)/i,
    /(?:^|_)eth(\d+)(?:_|$)/i,
    /(?:^|_)(\d+)_(?:link|speed|poe|rx|tx)(?:_|$)/i,
    /(?:^|_)(?:link|speed|poe|rx|tx)_(\d+)(?:_|$)/i,
  ];

  for (const re of patterns) {
    const m = text.match(re);
    if (m) return parseInt(m[1], 10);
  }

  return null;
}

function parseSpecialPortKey(entity) {
  const txt = entityText(entity);

  if (/\bwan2\b/i.test(txt) || /\bwan_2\b/i.test(txt)) return "wan2";
  if (/\bwan\b/i.test(txt)) return "wan";
  if (/\bsfp\+?\s*wan\b/i.test(txt) || /\bwan\s*sfp\+?\b/i.test(txt)) return "sfp_wan";
  if (/\bsfp\+?\b/i.test(txt)) return "sfp";

  return null;
}

function guessEntityRole(entity) {
  const txt = entityText(entity);
  const platform = entity?.platform;

  if (platform === "switch") {
    if (/poe/i.test(txt)) return "poe_switch";
    return "port_switch";
  }

  if (platform === "button") {
    if (/power cycle|cycle power|restart port/i.test(txt)) return "power_cycle";
  }

  if (platform === "sensor") {
    if (/rx|receive/i.test(txt)) return "rx";
    if (/tx|transmit/i.test(txt)) return "tx";
    if (/poe/i.test(txt) && /power|consumption|watt/i.test(txt)) return "poe_power";
    if (/speed|link speed/i.test(txt)) return "speed";
  }

  if (/link|uplink/i.test(txt)) return "link";

  return null;
}

function emptyPort(portNumber) {
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
  };
}

function emptySpecial(key, port = null) {
  return {
    key,
    port,
    label:
      key === "wan2" ? "WAN 2" :
      key === "wan" ? "WAN" :
      key === "sfp_wan" ? "SFP WAN" :
      key === "sfp" ? "SFP" :
      key,
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
}

function assignRoleToPort(port, role, entityId) {
  if (!port || !role || !entityId) return;

  switch (role) {
    case "link":
      port.link_entity = port.link_entity || entityId;
      break;
    case "speed":
      port.speed_entity = port.speed_entity || entityId;
      break;
    case "poe_switch":
      port.poe_switch_entity = port.poe_switch_entity || entityId;
      break;
    case "poe_power":
      port.poe_power_entity = port.poe_power_entity || entityId;
      break;
    case "port_switch":
      port.port_switch_entity = port.port_switch_entity || entityId;
      break;
    case "power_cycle":
      port.power_cycle_entity = port.power_cycle_entity || entityId;
      break;
    case "rx":
      port.rx_entity = port.rx_entity || entityId;
      break;
    case "tx":
      port.tx_entity = port.tx_entity || entityId;
      break;
    default:
      break;
  }
}

export function discoverPorts(entities) {
  const byPort = new Map();

  for (const entity of entities || []) {
    const portNumber = parsePortNumberFromEntityId(entity?.entity_id);
    if (!Number.isInteger(portNumber)) continue;

    if (!byPort.has(portNumber)) {
      byPort.set(portNumber, emptyPort(portNumber));
    }

    const port = byPort.get(portNumber);
    port.raw_entities.push(entity.entity_id);

    const role = guessEntityRole(entity);
    assignRoleToPort(port, role, entity.entity_id);
  }

  return Array.from(byPort.values()).sort((a, b) => a.port - b.port);
}

export function discoverSpecialPorts(entities) {
  const byKey = new Map();

  for (const entity of entities || []) {
    const specialKey = parseSpecialPortKey(entity);
    if (!specialKey) continue;

    if (!byKey.has(specialKey)) {
      byKey.set(specialKey, emptySpecial(specialKey));
    }

    const port = byKey.get(specialKey);
    port.raw_entities.push(entity.entity_id);

    const role = guessEntityRole(entity);
    assignRoleToPort(port, role, entity.entity_id);
  }

  return Array.from(byKey.values());
}

function cloneSlot(slot) {
  return {
    ...slot,
    raw_entities: Array.isArray(slot?.raw_entities) ? [...slot.raw_entities] : [],
  };
}

function createEmptyNumberedPort(portNumber) {
  return emptyPort(portNumber);
}

export function mergePortsWithLayout(layout, discoveredPorts) {
  const rows = (layout?.rows || []).flat();
  if (!rows.length) {
    return (discoveredPorts || []).map(cloneSlot).sort((a, b) => (a.port || 999) - (b.port || 999));
  }

  const discoveredByPort = new Map(
    (discoveredPorts || [])
      .filter((slot) => Number.isInteger(slot?.port))
      .map((slot) => [slot.port, cloneSlot(slot)])
  );

  const merged = [];
  const added = new Set();

  for (const portNumber of rows) {
    if (added.has(portNumber)) continue;
    merged.push(discoveredByPort.get(portNumber) || createEmptyNumberedPort(portNumber));
    added.add(portNumber);
  }

  for (const slot of discoveredByPort.values()) {
    if (!added.has(slot.port)) {
      merged.push(cloneSlot(slot));
      added.add(slot.port);
    }
  }

  return merged.sort((a, b) => (a.port || 999) - (b.port || 999));
}

function normalizeSpecialLayoutSlot(slot) {
  return {
    key: slot.key,
    port: Number.isInteger(slot.port) ? slot.port : null,
    label:
      slot.label ||
      (slot.key === "wan2" ? "WAN 2" :
       slot.key === "wan" ? "WAN" :
       slot.key === "sfp_wan" ? "SFP WAN" :
       slot.key === "sfp" ? "SFP" :
       slot.key),
    kind: "special",
  };
}

export function mergeSpecialsWithLayout(layout, discoveredSpecials, discoveredPorts = []) {
  const layoutSpecials = (layout?.specialSlots || []).map(normalizeSpecialLayoutSlot);
  const discoveredByKey = new Map(
    (discoveredSpecials || []).map((slot) => [slot.key, cloneSlot(slot)])
  );
  const discoveredByPort = new Map(
    (discoveredPorts || [])
      .filter((slot) => Number.isInteger(slot?.port))
      .map((slot) => [slot.port, cloneSlot(slot)])
  );

  const merged = [];
  const usedKeys = new Set();

  for (const layoutSlot of layoutSpecials) {
    const fromKey = discoveredByKey.get(layoutSlot.key);
    const fromPort =
      layoutSlot.port != null ? discoveredByPort.get(layoutSlot.port) : null;

    const source = fromKey || fromPort || {};
    merged.push({
      ...cloneSlot(source),
      ...layoutSlot,
      key: layoutSlot.key,
      label: layoutSlot.label,
      kind: "special",
      port: layoutSlot.port,
      raw_entities: Array.isArray(source?.raw_entities) ? [...source.raw_entities] : [],
    });

    usedKeys.add(layoutSlot.key);
  }

  for (const slot of discoveredSpecials || []) {
    if (usedKeys.has(slot.key)) continue;
    merged.push(cloneSlot(slot));
  }

  return merged;
}

// ─────────────────────────────────────────────────
// Gateway WAN / WAN2 role remapping
// ─────────────────────────────────────────────────

function asNumberedLanPort(slot, portNumber) {
  const base = cloneSlot(slot || createEmptyNumberedPort(portNumber));
  return {
    ...base,
    key: `port-${portNumber}`,
    port: portNumber,
    label: String(portNumber),
    kind: "numbered",
  };
}

function asRoleSpecial(slot, roleKey, roleLabel) {
  const base = cloneSlot(slot || {});
  return {
    ...base,
    key: roleKey,
    label: roleLabel,
    kind: "special",
  };
}

function resolveGatewayRoleSelection(selection, roleKey, layout, specialsByKey) {
  const normalized = String(selection || "auto");

  if (normalized === "none") return null;

  if (!selection || normalized === "auto") {
    const defaultSlot = (layout?.specialSlots || []).find((slot) => slot.key === roleKey);
    if (!defaultSlot) return null;
    if (defaultSlot.port != null) {
      return { type: "port", port: defaultSlot.port, source: "default", sourceKey: defaultSlot.key };
    }
    return { type: "special", key: defaultSlot.key, source: "default", sourceKey: defaultSlot.key };
  }

  if (normalized.startsWith("port_")) {
    const portNumber = parseInt(normalized.replace(/^port_/, ""), 10);
    if (Number.isInteger(portNumber)) {
      return { type: "port", port: portNumber, source: "custom", sourceKey: null };
    }
    return null;
  }

  const specialSlot =
    (layout?.specialSlots || []).find((slot) => slot.key === normalized) ||
    specialsByKey.get(normalized) ||
    null;

  if (!specialSlot) return null;
  if (specialSlot.port != null) {
    return { type: "port", port: specialSlot.port, source: "custom", sourceKey: normalized };
  }
  return { type: "special", key: normalized, source: "custom", sourceKey: normalized };
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

  const layoutRows = (layout?.rows || []).flat();
  const originalSpecials = (specials || []).map(cloneSlot);
  const originalNumbered = (numbered || []).map(cloneSlot);

  const specialsByKey = new Map(originalSpecials.map((slot) => [slot.key, slot]));
  const physicalByPort = new Map();

  for (const slot of [...originalNumbered, ...originalSpecials]) {
    if (Number.isInteger(slot?.port) && !physicalByPort.has(slot.port)) {
      physicalByPort.set(slot.port, cloneSlot(slot));
    }
  }

  const roleAssignments = new Map();

  const wanSelection = resolveGatewayRoleSelection(wanPort, "wan", layout, specialsByKey);
  if (wanSelection) {
    roleAssignments.set("wan", wanSelection);
  }

  const wan2Selection = resolveGatewayRoleSelection(wan2Port, "wan2", layout, specialsByKey);
  if (wan2Selection) {
    const conflictsWithWan =
      (wanSelection?.type === "port" &&
        wan2Selection.type === "port" &&
        wanSelection.port === wan2Selection.port) ||
      (wanSelection?.type === "special" &&
        wan2Selection.type === "special" &&
        wanSelection.key === wan2Selection.key);

    if (!conflictsWithWan) {
      roleAssignments.set("wan2", wan2Selection);
    }
  }

  const assignedPorts = new Set(
    Array.from(roleAssignments.values())
      .filter((selection) => selection?.type === "port")
      .map((selection) => selection.port)
  );
  const assignedSpecialKeys = new Set(
    Array.from(roleAssignments.values())
      .filter((selection) => selection?.type === "special")
      .map((selection) => selection.key)
  );

  const newSpecials = [];
  for (const roleKey of ["wan", "wan2"]) {
    const selection = roleAssignments.get(roleKey);
    if (!selection) continue;

    const roleLabel = roleKey === "wan2" ? "WAN 2" : "WAN";

    if (selection.type === "port") {
      const portData = physicalByPort.get(selection.port) || createEmptyNumberedPort(selection.port);
      newSpecials.push(asRoleSpecial(portData, roleKey, roleLabel));
      continue;
    }

    const specialData = specialsByKey.get(selection.key) || {
      key: selection.key,
      port: null,
      label: selection.key,
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
    newSpecials.push(asRoleSpecial(specialData, roleKey, roleLabel));
  }

  for (const slot of originalSpecials) {
    const isRoleSlot = slot.key === "wan" || slot.key === "wan2";
    if (isRoleSlot) continue;
    if (Number.isInteger(slot.port) && assignedPorts.has(slot.port)) continue;
    if (!Number.isInteger(slot.port) && assignedSpecialKeys.has(slot.key)) continue;
    newSpecials.push(cloneSlot(slot));
  }

  const newNumbered = [];
  const addedPorts = new Set();

  for (const portNumber of layoutRows) {
    if (assignedPorts.has(portNumber)) continue;
    const portData = physicalByPort.get(portNumber) || createEmptyNumberedPort(portNumber);
    newNumbered.push(asNumberedLanPort(portData, portNumber));
    addedPorts.add(portNumber);
  }

  for (const [portNumber, slot] of physicalByPort.entries()) {
    if (assignedPorts.has(portNumber) || addedPorts.has(portNumber)) continue;
    newNumbered.push(asNumberedLanPort(slot, portNumber));
  }

  newNumbered.sort((a, b) => (a.port ?? 999) - (b.port ?? 999));

  return { specials: newSpecials, numbered: newNumbered };
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
  if (Number.isFinite(num)) {
    if (unit) return `${num} ${unit}`;
    return String(num);
  }
  return unit ? `${val} ${unit}` : String(val);
}

export function getPoeStatus(hass, port) {
  const power = port?.poe_power_entity ? formatState(hass, port.poe_power_entity) : null;
  const active =
    isOn(hass, port?.poe_switch_entity) ||
    (power && power !== "—" && power !== "0 W" && power !== "0.0 W");

  return {
    active,
    power: power && power !== "—" ? power : null,
  };
}

export function isPortConnected(hass, port) {
  if (!port) return false;

  const link = stateValue(hass, port.link_entity);
  if (link != null) {
    const normalized = String(link).toLowerCase();
    if (["on", "up", "connected", "true", "active"].includes(normalized)) {
      return true;
    }
    if (["off", "down", "disconnected", "false", "inactive"].includes(normalized)) {
      return false;
    }
  }

  const speed = stateValue(hass, port.speed_entity);
  if (speed != null) {
    const num = parseFloat(String(speed).replace(",", "."));
    if (Number.isFinite(num) && num > 0) return true;
  }

  const rx = stateValue(hass, port.rx_entity);
  if (rx != null) {
    const num = parseFloat(String(rx).replace(",", "."));
    if (Number.isFinite(num) && num > 0) return true;
  }

  const tx = stateValue(hass, port.tx_entity);
  if (tx != null) {
    const num = parseFloat(String(tx).replace(",", "."));
    if (Number.isFinite(num) && num > 0) return true;
  }

  return false;
}

export function getPortLinkText(hass, port) {
  return formatState(hass, port?.link_entity);
}

export function getPortSpeedText(hass, port) {
  return formatState(hass, port?.speed_entity);
}
