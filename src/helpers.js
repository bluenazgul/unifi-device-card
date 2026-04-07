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

// NOTE: Prefix-Listen — minimal, kompatibel mit v0.2.8
// Neue Geräte werden über MODEL_REGISTRY erkannt, nicht über Prefixe
const SWITCH_MODEL_PREFIXES  = ["USW", "USL", "US8", "US16", "US24", "USMINI", "FLEXMINI"];
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

function resolveModelKey(device) {
  // Delegate to model-registry via getDeviceLayout which returns { modelKey, ... }
  const layout = getDeviceLayout(device, []);
  return layout?.modelKey ?? null;
}

function classifyDevice(device, entities) {
  if (isDefinitelyAP(device)) return "access_point";

  const modelKey = resolveModelKey(device);
  if (modelKey) {
    // ── Gateways (alle neuen Keys ergänzt) ───────────────────────
    if ([
      "UDRULT", "UCGULTRA", "UCGMAX", "UCGFIBER", "UCGINDUSTRIAL",
      "UDMPRO", "UDMSE", "UDMPROMAX",
      "UDR", "UDR7",
      "UX", "UX7",
      "UXGPRO", "UXGLITE", "UXGMAX", "UXGENTERPRISE",
      "EFG",
    ].includes(modelKey)) return "gateway";

    // ── Switches (alle neuen Keys ergänzt) ────────────────────────
    if ([
      "USMINI", "USWFLEX25G5", "USWFLEX25G8", "USWFLEX", "USWFLEXXG",
      "US8", "US8P60", "US8150W",
      "USL8LP", "USL8LPB",
      "USWPRO8POE", "USWENTERPRISE8POE", "USWPROXG8POE",
      "USL16LP", "USL16LPB",
      "USW16POE", "US16P150",
      "USWPROMAX16POE", "USWPROMAX16",
      "USWPROXG10POE",
      "USW24P", "USW24", "US24", "US24500W",
      "US24PRO2", "USWPRO24POE", "USWPROMAX24POE", "USWPROMAX24",
      "USWPROHD24POE", "USWPROHD24", "USWPROXG24POE", "USWPROXG24",
      "USW48P", "USW48", "US48", "US48500W", "US48750W",
      "USWPRO48", "USWPRO48POE",
      "USWPROMAX48POE", "USWPROMAX48",
      "USWENTERPRISE48POE",
      "USWPROXG48POE", "USWPROXG48",
      "USWULTRA", "USWULTRA60W", "USWULTRA210W",
    ].includes(modelKey)) return "switch";
  }

  if (modelStartsWith(device, SWITCH_MODEL_PREFIXES))  return "switch";
  if (modelStartsWith(device, GATEWAY_MODEL_PREFIXES)) return "gateway";

  const hasPorts = entities.some((e) => /_port_\d+_/i.test(e.entity_id));
  if (hasPorts) return "switch";

  if (hasUbiquitiManufacturer(device)) {
    const model = lower(device?.model);
    const name  = lower(device?.name_by_user || device?.name);
    if (
      model.includes("udm") || model.includes("ucg") ||
      model.includes("uxg") || name.includes("gateway")
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
  if (eid.startsWith("binary_sensor.") && id.includes("_port_")) return "link_entity";

  return null;
}

function makeEntityWarningResult() {
  return {
    total: 0,
    disabled: 0,
    hidden: 0,
    counts: {
      port_switch: 0,
      poe_switch: 0,
      poe_power: 0,
      link_speed: 0,
      rx_tx: 0,
      power_cycle: 0,
      link_entity: 0,
    },
    items: [],
  };
}

export async function getRelevantEntityWarningsForDevice(hass, deviceId) {
  const result = makeEntityWarningResult();
  if (!hass || !deviceId) return result;

  const entities = await safeCallWS(hass, { type: "config/entity_registry/list" }, []);
  for (const entity of entities || []) {
    if (entity.device_id !== deviceId) continue;

    const kind = classifyRelevantEntityType(entity);
    if (!kind) continue;

    const disabledBy = entity.disabled_by || null;
    const hiddenBy   = entity.hidden_by || null;
    if (!disabledBy && !hiddenBy) continue;

    result.total += 1;
    if (disabledBy) result.disabled += 1;
    if (hiddenBy) result.hidden += 1;
    result.counts[kind] = (result.counts[kind] || 0) + 1;

    result.items.push({
      entity_id:   entity.entity_id,
      name:        entity.original_name || entity.name || entity.entity_id,
      kind,
      disabled_by: disabledBy,
      hidden_by:   hiddenBy,
    });
  }

  return result;
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
    if (id.includes("_port_")) {
      if (id.endsWith("_rx") || id.includes("_rx_")) return "rx_entity";
      if (id.endsWith("_tx") || id.includes("_tx_")) return "tx_entity";
    }
    if (isSpecial && (id.includes("_wan") || id.includes("_sfp") || id.includes("_uplink"))) {
      if (id.includes("download") || id.includes("_rx")) return "rx_entity";
      if (id.includes("upload")   || id.includes("_tx")) return "tx_entity";
    }
    if (isSpeedEntity(id)) return "speed_entity";
    if (id.includes("_port_") && id.includes("_poe_power")) return "poe_power_entity";
    if (
      id.includes("_port_") &&
      (id.includes("_link") || id.includes("_status") || id.includes("_state")) &&
      !isThroughputEntity(id)
    ) {
      return "link_entity";
    }
  }

  return null;
}

function detectSpecialPortKey(entity) {
  const text = entityText(entity);
  const id   = lower(entity.entity_id);

  if (id.includes("_wan_port") || id.includes("wan_port")) return { key: "wan", label: "WAN" };
  if (text.includes("wan 2") || id.includes("wan2"))        return { key: "wan2", label: "WAN 2" };

  if (
    (text.includes("wan") || id.includes("wan")) &&
    (text.includes("sfp") || id.includes("sfp"))
  ) {
    return { key: "sfp_wan", label: "WAN SFP+" };
  }

  if (
    (text.includes("lan") || id.includes("lan")) &&
    (text.includes("sfp") || id.includes("sfp"))
  ) {
    return { key: "sfp_lan", label: "LAN SFP+" };
  }

  if (id.endsWith("_wan_port") || id.endsWith("_wan")) return { key: "wan", label: "WAN" };
  if (text.includes("wan") || id.includes("_wan_"))     return { key: "wan", label: "WAN" };
  if (text.includes("sfp+") || text.includes("sfp") || id.includes("sfp"))
    return { key: "sfp", label: "SFP" };

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
      key:               slot.key,
      port:              slot.port ?? null,
      label:             slot.label,
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
    };
  });

  for (const special of discoveredSpecials) {
    if (!layoutSpecials.some((s) => s.key === special.key)) merged.push(special);
  }

  return merged;
}

export function applyWanPortOverride(specials, numbered, layout, wanPort) {
  if (!wanPort || wanPort === "auto") {
    return { specials, numbered };
  }

  let newSpecials = specials.map((s) => ({ ...s }));
  let newNumbered = numbered.map((p) => ({ ...p }));

  const isPortKey = wanPort.startsWith("port_");
  const targetPortNum = isPortKey ? parseInt(wanPort.replace("port_", ""), 10) : null;

  if (isPortKey && targetPortNum != null) {
    const oldWanIdx = newSpecials.findIndex((s) => s.key === "wan");
    const targetIdx = newNumbered.findIndex((p) => p.port === targetPortNum);

    if (oldWanIdx === -1 || targetIdx === -1) {
      return { specials, numbered };
    }

    const oldWan     = newSpecials[oldWanIdx];
    const targetPort = newNumbered[targetIdx];

    const newWanSlot = { ...targetPort, key: "wan", label: "WAN", kind: "special" };

    const layoutSlot = (layout?.specialSlots || []).find((s) => s.key === oldWan.key);
    const restoredOldWan = {
      ...oldWan,
      label: layoutSlot?.label || `Port ${oldWan.port ?? "?"}`,
    };

    newSpecials.splice(oldWanIdx, 1, newWanSlot);

    const alreadyInSpecials = newSpecials.some((s) => s.port === oldWan.port);
    if (!alreadyInSpecials && oldWan.port != null) {
      newSpecials.push(restoredOldWan);
    }

    newNumbered.splice(targetIdx, 1);

    return { specials: newSpecials, numbered: newNumbered };
  }

  const targetSpecialIdx = newSpecials.findIndex((s) => s.key === wanPort);
  const oldWanIdx        = newSpecials.findIndex((s) => s.key === "wan");

  if (targetSpecialIdx === -1 || targetSpecialIdx === oldWanIdx || oldWanIdx === -1) {
    return { specials, numbered };
  }

  const oldWan     = { ...newSpecials[oldWanIdx] };
  const targetSlot = { ...newSpecials[targetSpecialIdx] };

  const layoutOldWan = (layout?.specialSlots || []).find((s) => s.key === oldWan.key);

  newSpecials[targetSpecialIdx] = { ...targetSlot, key: "wan", label: "WAN" };
  newSpecials[oldWanIdx] = {
    ...oldWan,
    key:   layoutOldWan?.key   || oldWan.key,
    label: layoutOldWan?.label || `Port ${oldWan.port ?? "?"}`,
  };

  return { specials: newSpecials, numbered: newNumbered };
}

// ─────────────────────────────────────────────────
// State helpers — exakt wie v0.2.8
// ─────────────────────────────────────────────────

export function stateObj(hass, entityId) {
  return entityId ? hass?.states?.[entityId] || null : null;
}

export function stateValue(hass, entityId, fallback = "—") {
  const state = stateObj(hass, entityId);
  return state ? state.state : fallback;
}

function numericState(hass, entityId) {
  const state = stateObj(hass, entityId);
  if (!state) return null;
  const raw = String(state.state ?? "").replace(",", ".");
  if (raw === "unknown" || raw === "unavailable" || raw === "") return null;
  const num = parseFloat(raw);
  return Number.isNaN(num) ? null : num;
}

function hasAvailableState(hass, entityId) {
  const state = stateObj(hass, entityId);
  if (!state) return false;
  const v = String(state.state ?? "").toLowerCase();
  return v !== "unknown" && v !== "unavailable" && v !== "";
}

function isPoeSwitchOn(hass, port) {
  const state = stateObj(hass, port?.poe_switch_entity);
  if (!state) return false;
  return String(state.state ?? "").toLowerCase() === "on";
}

function getTrafficStatus(hass, port) {
  const ids = [port?.rx_entity, port?.tx_entity].filter(Boolean);
  if (!ids.length) return "none";
  let sawNumeric = false;
  for (const entityId of ids) {
    const value = numericState(hass, entityId);
    if (value == null) continue;
    sawNumeric = true;
    if (value > 0) return "positive";
  }
  if (sawNumeric) return "zero";
  return "unknown";
}

export function getPoeStatus(hass, port) {
  if (!port) {
    return { hasPoe: false, poeOn: false, poeText: "—", canToggle: false };
  }

  const hasPoe = Boolean(port?.poe_switch_entity || port?.poe_power_entity);
  if (!hasPoe) {
    return { hasPoe: false, poeOn: false, poeText: "—", canToggle: false };
  }

  const poeSwitch = stateObj(hass, port?.poe_switch_entity);
  const switchVal = String(poeSwitch?.state ?? "").toLowerCase();
  if (poeSwitch && switchVal !== "unknown" && switchVal !== "unavailable") {
    return {
      hasPoe:    true,
      poeOn:     switchVal === "on",
      poeText:   String(poeSwitch.state),
      canToggle: Boolean(port?.poe_switch_entity),
    };
  }

  const poePower = numericState(hass, port?.poe_power_entity);
  if (poePower != null) {
    return {
      hasPoe:    true,
      poeOn:     poePower > 0,
      poeText:   poePower > 0 ? `${poePower.toFixed(1)} W` : "0 W",
      canToggle: false,
    };
  }

  return { hasPoe: true, poeOn: false, poeText: "—", canToggle: false };
}

export function isOn(hass, entityId, port) {
  const traffic = getTrafficStatus(hass, port);
  const speed   = numericState(hass, port?.speed_entity);

  if (entityId) {
    const state = stateObj(hass, entityId);
    if (state) {
      const v = String(state.state ?? "").toLowerCase();
      if (["on", "connected", "up", "true"].includes(v)) {
        const isSpecialPort  = port?.kind === "special";
        const hasSpeedData   = speed != null;
        const hasTrafficData = traffic !== "none" && traffic !== "unknown";
        if (!isSpecialPort && (hasSpeedData || hasTrafficData)) {
          const speedIsZero   = hasSpeedData   && speed === 0;
          const trafficIsZero = hasTrafficData && traffic === "zero";
          if (speedIsZero || trafficIsZero) return false;
        }
        return true;
      }
      if (["off", "disconnected", "false"].includes(v)) return false;
    }
  }

  if (traffic === "positive") return true;
  if (traffic === "zero")     return false;

  const isSpecial = port?.kind === "special";
  if (!isSpecial || traffic === "none" || traffic === "unknown") {
    if (speed != null && speed > 0) return true;
    if (speed != null && speed === 0) return false;
  }

  return false;
}

export function formatState(hass, entityId, fallback = "—") {
  const state = stateObj(hass, entityId);
  if (!state) return fallback;

  const unit = state.attributes?.unit_of_measurement || "";
  if (state.state === "unknown" || state.state === "unavailable") return "—";

  const num = parseFloat(state.state);
  if (!Number.isNaN(num)) {
    const rounded = num % 1 === 0 ? String(num) : num.toFixed(2);
    return unit ? `${rounded} ${unit}` : rounded;
  }

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
    const id    = lower(entityId);
    if (isLikelyLinkStateValue(value) && !id.includes("poe") && !id.includes("power") && !id.includes("speed")) {
      return value;
    }
  }

  const traffic = getTrafficStatus(hass, port);
  const speed   = numericState(hass, port?.speed_entity);

  if (traffic === "positive") return "connected";
  if (traffic === "zero")     return "no link";

  const isSpecial = port?.kind === "special";
  if (!isSpecial || traffic === "none" || traffic === "unknown") {
    if (speed != null && speed > 0) return "connected";
    if (speed != null && speed === 0) return "no link";
  }

  return "—";
}

function simplifySpeed(value, unit = "") {
  const raw     = String(value ?? "").trim().toLowerCase();
  const rawUnit = String(unit  ?? "").trim().toLowerCase();

  if (!raw || raw === "unknown" || raw === "unavailable") return "—";

  const number = parseFloat(raw.replace(",", "."));
  if (!Number.isNaN(number)) {
    if (rawUnit.includes("gbit")) return `${Math.round(number * 1_000)} Mbit`;
    if (rawUnit.includes("mbit")) return `${Math.round(number)} Mbit`;
    if ([10, 100, 1_000, 2_500, 10_000].includes(number)) return `${Math.round(number)} Mbit`;
  }

  if (raw.includes("10g"))   return "10000 Mbit";
  if (raw.includes("2.5g")) return "2500 Mbit";
  if (raw.includes("1g") || raw.includes("1000")) return "1000 Mbit";
  if (raw.includes("100m") || raw === "100") return "100 Mbit";
  if (raw.includes("10m")  || raw === "10")  return "10 Mbit";

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
    if (id.includes("link_speed") || id.endsWith("_speed") || id.includes("ethernet_speed") || id.includes("negotiated_speed")) {
      const result = simplifySpeed(value, unit);
      if (result !== "—") return result;
    }
  }

  return "—";
}
