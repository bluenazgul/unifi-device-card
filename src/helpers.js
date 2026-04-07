import { getDeviceLayout } from "./model-registry.js";

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

// Prefix-based fallback classification (catches unknown / future models)
const SWITCH_MODEL_PREFIXES = [
  "USW", "USL", "US8", "US16", "US24", "US48",
  "USMINI", "FLEXMINI",
];
const GATEWAY_MODEL_PREFIXES = [
  "UDM", "UCG", "UXG", "UDR", "UX",
  "UDRULT", "UDMPRO", "UDMSE",
  "EFG",
];
const AP_MODEL_PREFIXES = ["UAP", "U6", "U7", "UAL", "UAPMESH", "E7", "UAC"];

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

function resolveModelKey(device) {
  // Delegate to model-registry via getDeviceLayout which returns { modelKey, ... }
  const layout = getDeviceLayout(device, []);
  return layout?.modelKey ?? null;
}

function classifyDevice(device, entities) {
  if (isDefinitelyAP(device)) return "access_point";

  const modelKey = resolveModelKey(device);
  if (modelKey) {
    // ── Gateways ─────────────────────────────────
    if ([
      "UDRULT", "UCGULTRA", "UCGMAX", "UCGFIBER", "UCGINDUSTRIAL",
      "UDMPRO", "UDMSE", "UDMPROMAX",
      "UDR", "UDR7",
      "UX", "UX7",
      "UXGPRO", "UXGLITE", "UXGMAX", "UXGENTERPRISE",
      "EFG",
    ].includes(modelKey)) return "gateway";

    // ── Switches ──────────────────────────────────
    if ([
      // Utility / Flex / Mini
      "USMINI", "USWFLEX25G5", "USWFLEX25G8", "USWFLEX", "USWFLEXXG",
      // 8-port
      "US8", "US8P60", "US8150W",
      "USL8LP", "USL8LPB",
      "USWPRO8POE", "USWENTERPRISE8POE",
      // 16-port
      "USL16LP", "USL16LPB",
      "USW16POE",
      "US16P150",
      "USWPROMAX16POE", "USWPROMAX16",
      // 24-port
      "USW24P", "USW24", "US24", "US24500W",
      "US24PRO2", "USWPRO24POE", "USWPROMAX24POE", "USWPROMAX24",
      // 48-port
      "USW48P", "USW48", "US48", "US48500W", "US48750W",
      "USWPRO48", "USWPRO48POE",
      "USWPROMAX48POE", "USWPROMAX48",
      "USWENTERPRISE48POE",
      // Ultra
      "USWULTRA", "USWULTRA60W", "USWULTRA210W",
    ].includes(modelKey)) return "switch";
  }

  // Fallback: prefix-based detection
  if (modelStartsWith(device, SWITCH_MODEL_PREFIXES))  return "switch";
  if (modelStartsWith(device, GATEWAY_MODEL_PREFIXES)) return "gateway";

  // Fallback: entity presence
  const hasPorts = entities.some((e) => /_port_\d+_/i.test(e.entity_id));
  if (hasPorts) return "switch";

  // Fallback: manufacturer + model string matching
  if (hasUbiquitiManufacturer(device)) {
    const model = lower(device?.model);
    const name  = lower(device?.name_by_user || device?.name);
    if (
      model.includes("udm") || model.includes("ucg") ||
      model.includes("uxg") || model.includes("udr") ||
      name.includes("gateway") || name.includes("router")
    ) return "gateway";
    if (
      model.includes("usw") || model.includes("usl") ||
      model.includes("us8") || model.includes("us16") ||
      model.includes("us24") || model.includes("us48") ||
      name.includes("switch")
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
    entities.some((e) => /_port_\d+_/i.test(e.entity_id)) &&
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

  if (eid.startsWith("button.") && id.includes("power_cycle")) return "power_cycle";
  if (eid.startsWith("switch.") && id.includes("_port_") && id.endsWith("_poe")) return "poe_switch";
  if (eid.startsWith("switch.") && id.includes("_port_")) return "port_switch";
  if (eid.startsWith("sensor.") && id.includes("_poe_power")) return "poe_power";
  if (
    eid.startsWith("sensor.") &&
    (id.endsWith("_rx") || id.endsWith("_tx") || id.includes("_rx_") || id.includes("_tx_") ||
     id.includes("throughput") || id.includes("bandwidth"))
  ) return "rx_tx";
  if (
    eid.startsWith("sensor.") &&
    (id.includes("link_speed") || id.includes("ethernet_speed") || id.includes("negotiated_speed"))
  ) return "link_speed";
  if (eid.startsWith("binary_sensor.") && id.includes("_port_")) return "port_link";

  return null;
}

export async function getEditorWarnings(hass, deviceId) {
  if (!hass || !deviceId) return [];

  const { devices, entitiesByDevice, configEntries } = await getAllData(hass);
  const unifiEntryIds = extractUnifiEntryIds(configEntries);

  const device = devices.find((d) => d.id === deviceId);
  if (!device) return [];

  const allRaw = await safeCallWS(hass, { type: "config/entity_registry/list" }, []);
  const deviceEntities = (allRaw || []).filter((e) => e.device_id === deviceId);

  const warnings = [];
  for (const entity of deviceEntities) {
    const type = classifyRelevantEntityType(entity);
    if (!type) continue;
    if (entity.disabled_by) {
      warnings.push({ type, entity_id: entity.entity_id, reason: "disabled" });
    } else if (entity.hidden_by) {
      warnings.push({ type, entity_id: entity.entity_id, reason: "hidden" });
    }
  }

  return warnings;
}

// ─────────────────────────────────────────────────
// Port discovery
// ─────────────────────────────────────────────────

function extractPortNumber(entity) {
  const id           = lower(entity.entity_id);
  const originalName = lower(entity.original_name || "");
  const name         = lower(entity.name || "");
  const uniqueId     = entity.unique_id || "";

  let match = id.match(/_port_(\d+)(?:_|$)/i);
  if (match) return Number(match[1]);

  match = originalName.match(/\bport\s+(\d+)\b/i);
  if (match) return Number(match[1]);

  match = name.match(/\bport\s+(\d+)\b/i);
  if (match) return Number(match[1]);

  if (uniqueId) {
    match = uniqueId.match(/[_-](\d+)$/);
    if (match) return Number(match[1]);
    match = uniqueId.match(/port[_-](\d+)/i);
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
  return (
    id.endsWith("_rx") ||
    id.endsWith("_tx") ||
    id.includes("_rx_") ||
    id.includes("_tx_") ||
    id.includes("throughput") ||
    id.includes("bandwidth") ||
    id.includes("download") ||
    id.includes("upload") ||
    id.includes("traffic")
  );
}

function isSpeedEntity(id) {
  return (
    id.includes("_link_speed") ||
    id.includes("_ethernet_speed") ||
    id.includes("_negotiated_speed")
  );
}

function classifyPortEntity(entity, isSpecial = false) {
  const id  = lower(entity.entity_id);
  const eid = entity.entity_id;

  if (
    eid.startsWith("button.") &&
    (id.includes("power_cycle") || id.includes("_restart") || id.includes("_reboot"))
  ) {
    return "power_cycle_entity";
  }
  if (eid.startsWith("switch.") && id.includes("_port_") && id.endsWith("_poe")) {
    return "poe_switch_entity";
  }
  if (eid.startsWith("switch.") && id.includes("_port_") && !id.endsWith("_poe")) {
    return "port_switch_entity";
  }

  if (eid.startsWith("binary_sensor.")) {
    if (id.includes("_port_")) return "link_entity";
    if (
      isSpecial &&
      (id.includes("_wan") || id.includes("_sfp") || id.includes("_uplink") ||
       id.includes("_connected") || id.includes("_link"))
    ) return "link_entity";
  }

  if (eid.startsWith("sensor.")) {
    if (isThroughputEntity(id)) {
      if (id.endsWith("_rx") || id.includes("_rx_") || id.includes("download")) return "rx_entity";
      if (id.endsWith("_tx") || id.includes("_tx_") || id.includes("upload"))   return "tx_entity";
    }
    if (id.includes("_poe_power") || id.includes("_poe_current") || id.includes("_poe_voltage")) {
      return "poe_power_entity";
    }
    if (isSpeedEntity(id)) return "speed_entity";
  }

  return null;
}

function detectSpecialPortKey(entity) {
  const id = lower(entity.entity_id);
  const t  = entityText(entity);

  if (id.includes("_wan") || t.includes("wan port") || t.includes("wan link")) {
    return { key: "wan", label: "WAN" };
  }
  if (id.includes("_sfp2") || id.includes("_sfp_2") || t.includes("sfp+ 2") || t.includes("sfp 2")) {
    return { key: "sfp_2", label: "SFP+ 2" };
  }
  if (id.includes("_sfp1") || id.includes("_sfp_1") || t.includes("sfp+ 1") || t.includes("sfp 1") || id.includes("_sfp")) {
    return { key: "sfp_1", label: "SFP+ 1" };
  }
  if (id.includes("_uplink") || t.includes("uplink")) {
    return { key: "uplink", label: "Uplink" };
  }

  return null;
}

function extractPortLabel(entity) {
  const eid = entity.entity_id || "";
  const id  = lower(eid);

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

    const type = classifyPortEntity(entity, true);
    if (type && !row[type]) row[type] = entity.entity_id;
  }

  return Array.from(specials.values());
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

    merged.push(
      byPort.get(portNumber) || {
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
      }
    );
  }

  for (const port of discoveredPorts) {
    if (!layoutPorts.includes(port.port) && !specialPortNumbers.has(port.port))
      merged.push(port);
  }

  return merged.sort((a, b) => (a.port ?? 999) - (b.port ?? 999));
}

export function mergeSpecialsWithLayout(layout, discoveredSpecials) {
  const byKey  = new Map(discoveredSpecials.map((s) => [s.key, s]));
  const merged = [];

  for (const slot of layout?.specialSlots || []) {
    merged.push(
      byKey.get(slot.key) || {
        key:               slot.key,
        port:              slot.port ?? null,
        label:             slot.label,
        port_label:        null,
        kind:              "special",
        link_entity:       null,
        port_switch_entity: null,
        speed_entity:      null,
        poe_switch_entity: null,
        poe_power_entity:  null,
        power_cycle_entity: null,
        rx_entity:         null,
        tx_entity:         null,
        raw_entities:      [],
      }
    );
  }

  for (const special of discoveredSpecials) {
    if (!layout?.specialSlots?.some((s) => s.key === special.key)) {
      merged.push(special);
    }
  }

  return merged;
}

// ─────────────────────────────────────────────────
// WAN port override
// ─────────────────────────────────────────────────

export function applyWanPortOverride(layout, specialPorts, wanPortConfig) {
  if (!wanPortConfig || !layout) return { layout, specialPorts };

  const wanPort = Number(wanPortConfig);
  if (!wanPort || isNaN(wanPort)) return { layout, specialPorts };

  const updatedSlots = (layout.specialSlots || []).map((slot) =>
    slot.key === "wan" ? { ...slot, port: wanPort } : slot
  );

  if (!updatedSlots.some((s) => s.key === "wan")) {
    updatedSlots.push({ key: "wan", label: "WAN", port: wanPort });
  }

  return {
    layout: { ...layout, specialSlots: updatedSlots },
    specialPorts,
  };
}

// ─────────────────────────────────────────────────
// State formatting
// ─────────────────────────────────────────────────

function stateObj(hass, entityId) {
  if (!hass || !entityId) return null;
  return hass.states[entityId] ?? null;
}

export function isOn(hass, entityId) {
  const s = stateObj(hass, entityId);
  if (!s) return null;
  const v = lower(s.state);
  if (["on", "true", "connected", "up"].includes(v))  return true;
  if (["off", "false", "disconnected", "down"].includes(v)) return false;
  return null;
}

export function getPoeStatus(hass, port) {
  const sw = stateObj(hass, port?.poe_switch_entity);
  if (sw) {
    const v = lower(sw.state);
    if (v === "on")  return "active";
    if (v === "off") return "inactive";
  }
  const pw = stateObj(hass, port?.poe_power_entity);
  if (pw) {
    const watts = parseFloat(pw.state);
    if (!isNaN(watts) && watts > 0) return "active";
    if (!isNaN(watts))              return "inactive";
  }
  return null;
}

export function getPortLinkText(hass, port) {
  const link = stateObj(hass, port?.link_entity);
  if (link) return link.state;

  const sw = stateObj(hass, port?.port_switch_entity);
  if (sw) return sw.state;

  for (const entityId of port?.raw_entities || []) {
    const st = stateObj(hass, entityId);
    if (!st) continue;
    const v = lower(st.state);
    if (isLikelyLinkStateValue(v)) return st.state;
  }

  return null;
}

function simplifySpeed(raw, unit) {
  const rawLow  = String(raw  ?? "").trim().toLowerCase();
  const rawUnit = String(unit ?? "").trim().toLowerCase();
  if (!raw || raw === "unknown" || raw === "unavailable") return "—";
  const number = parseFloat(rawLow.replace(",", "."));
  if (!Number.isNaN(number)) {
    if (rawUnit.includes("gbit")) return `${Math.round(number * 1_000)} Mbit`;
    if (rawUnit.includes("mbit")) return `${Math.round(number)} Mbit`;
    if ([10, 100, 1_000, 2_500, 10_000].includes(number)) return `${Math.round(number)} Mbit`;
  }
  if (rawLow.includes("10g"))   return "10000 Mbit";
  if (rawLow.includes("2.5g")) return "2500 Mbit";
  if (rawLow.includes("1g") || rawLow.includes("1000")) return "1000 Mbit";
  if (rawLow.includes("100m") || rawLow === "100") return "100 Mbit";
  if (rawLow.includes("10m")  || rawLow === "10")  return "10 Mbit";
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
    const unit = st.attributes?.unit_of_measurement || "";
    const value = String(st.state ?? "");
    if (isThroughputEntity(id)) continue;
    if (id.includes("link_speed") || id.endsWith("_speed") || id.includes("ethernet_speed") || id.includes("negotiated_speed")) {
      const result = simplifySpeed(value, unit);
      if (result !== "—") return result;
    }
  }
  return "—";
}

export function formatState(hass, entityId) {
  const s = stateObj(hass, entityId);
  if (!s) return "—";
  const unit = s.attributes?.unit_of_measurement;
  if (unit) return `${s.state} ${unit}`;
  return s.state;
}
