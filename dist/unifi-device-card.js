/* UniFi Device Card 0.0.0-dev.9bed8d1 */

// src/model-registry.js
function range(start, end) {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}
function oddRange(start, end) {
  return range(start, end).filter((n) => n % 2 === 1);
}
function evenRange(start, end) {
  return range(start, end).filter((n) => n % 2 === 0);
}
function normalizeModelKey(value) {
  return String(value ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "");
}
function defaultSwitchLayout(portCount) {
  if (portCount <= 8) {
    return {
      kind: "switch",
      frontStyle: "single-row",
      rows: [range(1, portCount)],
      portCount,
      specialSlots: []
    };
  }
  if (portCount === 16) {
    return {
      kind: "switch",
      frontStyle: "dual-row",
      rows: [oddRange(1, 16), evenRange(1, 16)],
      portCount,
      specialSlots: []
    };
  }
  if (portCount === 24) {
    return {
      kind: "switch",
      frontStyle: "dual-row",
      rows: [range(1, 12), range(13, 24)],
      portCount,
      specialSlots: []
    };
  }
  if (portCount === 48) {
    return {
      kind: "switch",
      frontStyle: "quad-row",
      rows: [range(1, 12), range(13, 24), range(25, 36), range(37, 48)],
      portCount,
      specialSlots: []
    };
  }
  return {
    kind: "switch",
    frontStyle: "single-row",
    rows: [range(1, portCount)],
    portCount,
    specialSlots: []
  };
}
var MODEL_REGISTRY = {
  US8P60: {
    kind: "switch",
    frontStyle: "single-row",
    rows: [range(1, 8)],
    portCount: 8,
    displayModel: "US 8 60W",
    theme: "silver",
    specialSlots: []
  },
  USMINI: {
    kind: "switch",
    frontStyle: "single-row",
    rows: [range(1, 5)],
    portCount: 5,
    displayModel: "USW Flex Mini",
    theme: "white",
    specialSlots: []
  },
  USL8LP: {
    kind: "switch",
    frontStyle: "single-row",
    rows: [range(1, 8)],
    portCount: 8,
    displayModel: "USW Lite 8 PoE",
    theme: "white",
    specialSlots: []
  },
  USL8LPB: {
    kind: "switch",
    frontStyle: "single-row",
    rows: [range(1, 8)],
    portCount: 8,
    displayModel: "USW Lite 8 PoE",
    theme: "white",
    specialSlots: []
  },
  USL16LP: {
    kind: "switch",
    frontStyle: "dual-row",
    rows: [oddRange(1, 16), evenRange(1, 16)],
    portCount: 16,
    displayModel: "USW Lite 16 PoE",
    theme: "white",
    specialSlots: []
  },
  USL16LPB: {
    kind: "switch",
    frontStyle: "dual-row",
    rows: [oddRange(1, 16), evenRange(1, 16)],
    portCount: 16,
    displayModel: "USW Lite 16 PoE",
    theme: "white",
    specialSlots: []
  },
  UDRULT: {
    kind: "gateway",
    frontStyle: "gateway-single-row",
    rows: [[1, 2, 3, 4]],
    portCount: 4,
    displayModel: "Cloud Gateway Ultra",
    theme: "white",
    specialSlots: [{ key: "wan", label: "WAN" }]
  },
  UCGULTRA: {
    kind: "gateway",
    frontStyle: "gateway-single-row",
    rows: [[1, 2, 3, 4]],
    portCount: 4,
    displayModel: "Cloud Gateway Ultra",
    theme: "white",
    specialSlots: [{ key: "wan", label: "WAN" }]
  },
  UCGMAX: {
    kind: "gateway",
    frontStyle: "gateway-single-row",
    rows: [[1, 2, 3, 4, 5]],
    portCount: 5,
    displayModel: "Cloud Gateway Max",
    theme: "white",
    specialSlots: [{ key: "wan", label: "WAN" }]
  },
  UDMPRO: {
    kind: "gateway",
    frontStyle: "gateway-rack",
    rows: [range(1, 8)],
    portCount: 8,
    displayModel: "UDM Pro",
    theme: "silver",
    specialSlots: [
      { key: "wan", label: "WAN" },
      { key: "sfp_wan", label: "WAN SFP+" },
      { key: "sfp_lan", label: "LAN SFP+" }
    ]
  },
  UDMSE: {
    kind: "gateway",
    frontStyle: "gateway-rack",
    rows: [range(1, 8)],
    portCount: 8,
    displayModel: "UDM SE",
    theme: "silver",
    specialSlots: [
      { key: "wan", label: "WAN" },
      { key: "sfp_wan", label: "WAN SFP+" },
      { key: "sfp_lan", label: "LAN SFP+" }
    ]
  },
  // ── Additional common models ─────────────────────
  USW24P: {
    kind: "switch",
    frontStyle: "dual-row",
    rows: [range(1, 12), range(13, 24)],
    portCount: 24,
    displayModel: "USW 24 PoE",
    theme: "silver",
    specialSlots: []
  },
  USW48P: {
    kind: "switch",
    frontStyle: "quad-row",
    rows: [range(1, 12), range(13, 24), range(25, 36), range(37, 48)],
    portCount: 48,
    displayModel: "USW 48 PoE",
    theme: "silver",
    specialSlots: []
  }
};
function resolveModelKey(device) {
  const candidates = [
    device?.model,
    device?.hw_version,
    device?.name,
    device?.name_by_user
  ].filter(Boolean).map(normalizeModelKey);
  for (const candidate of candidates) {
    if (!candidate) continue;
    if (MODEL_REGISTRY[candidate]) return candidate;
    if (candidate.includes("USL16LPB")) return "USL16LPB";
    if (candidate.includes("USL16LP")) return "USL16LP";
    if (candidate.includes("USWLITE16POE")) return "USL16LPB";
    if (candidate.includes("USWLITE16")) return "USL16LPB";
    if ((candidate.includes("LITE") || candidate.includes("USW")) && candidate.includes("16") && candidate.includes("POE")) return "USL16LPB";
    if (candidate.includes("USL8LPB")) return "USL8LPB";
    if (candidate.includes("USL8LP")) return "USL8LP";
    if (candidate.includes("USWLITE8POE")) return "USL8LPB";
    if (candidate.includes("USWLITE8")) return "USL8LPB";
    if ((candidate.includes("LITE") || candidate.includes("USW")) && candidate.includes("8") && candidate.includes("POE")) return "USL8LPB";
    if (candidate.includes("US8P60")) return "US8P60";
    if (candidate.includes("US860W")) return "US8P60";
    if (candidate.includes("USMINI")) return "USMINI";
    if (candidate.includes("FLEXMINI")) return "USMINI";
    if (candidate.includes("USWFLEXMINI")) return "USMINI";
    if (candidate.includes("UDRULT")) return "UDRULT";
    if (candidate.includes("UCGULTRA")) return "UCGULTRA";
    if (candidate.includes("CLOUDGATEWAYULTRA")) return "UCGULTRA";
    if (candidate.includes("UCGMAX")) return "UCGMAX";
    if (candidate.includes("CLOUDGATEWAYMAX")) return "UCGMAX";
    if (candidate.includes("UDMPRO")) return "UDMPRO";
    if (candidate.includes("UDMSE")) return "UDMSE";
    if (candidate.includes("USW24")) return "USW24P";
    if (candidate.includes("USW48")) return "USW48P";
  }
  return null;
}
function inferPortCountFromModel(device) {
  const text = normalizeModelKey(
    [device?.model, device?.name, device?.name_by_user].filter(Boolean).join(" ")
  );
  if (text.includes("USL16LPB")) return 16;
  if (text.includes("USL16LP")) return 16;
  if (text.includes("USWLITE16POE")) return 16;
  if (text.includes("USWLITE16")) return 16;
  if (text.includes("LITE16")) return 16;
  if (text.includes("USL8LPB")) return 8;
  if (text.includes("USL8LP")) return 8;
  if (text.includes("USWLITE8POE")) return 8;
  if (text.includes("USWLITE8")) return 8;
  if (text.includes("LITE8")) return 8;
  if (text.includes("US8P60")) return 8;
  if (text.includes("US8")) return 8;
  if (text.includes("USMINI")) return 5;
  if (text.includes("FLEXMINI")) return 5;
  if (text.includes("UCGULTRA")) return 4;
  if (text.includes("CLOUDGATEWAYULTRA")) return 4;
  if (text.includes("UCGMAX")) return 5;
  if (text.includes("UDMPRO")) return 8;
  if (text.includes("UDMSE")) return 8;
  if (text.includes("48")) return 48;
  if (text.includes("24")) return 24;
  return null;
}
function getDeviceLayout(device, discoveredPorts = []) {
  const modelKey = resolveModelKey(device);
  if (modelKey && MODEL_REGISTRY[modelKey]) {
    return {
      modelKey,
      ...MODEL_REGISTRY[modelKey]
    };
  }
  const inferredPortCount = inferPortCountFromModel(device) || (discoveredPorts.length > 0 ? Math.max(...discoveredPorts.map((p) => p.port)) : 0);
  if (inferredPortCount > 0) {
    return {
      modelKey: null,
      ...defaultSwitchLayout(inferredPortCount),
      displayModel: device?.model || `UniFi Device (${inferredPortCount}p)`
    };
  }
  return {
    modelKey: null,
    kind: "gateway",
    frontStyle: "gateway-generic",
    rows: [],
    portCount: 0,
    displayModel: device?.model || "UniFi Gateway",
    specialSlots: []
  };
}

// src/helpers.js
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
    entity.original_device_class
  ].filter(Boolean).join(" ").toLowerCase();
}
function isUnifiConfigEntry(entry) {
  const domain = lower(entry?.domain);
  const title = lower(entry?.title);
  return domain === "unifi" || domain === "unifi_network" || domain.includes("unifi") || title.includes("unifi");
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
var SWITCH_MODEL_PREFIXES = ["USW", "USL", "US8", "USMINI", "FLEXMINI"];
var GATEWAY_MODEL_PREFIXES = ["UDM", "UCG", "UXG", "UDRULT", "UDMPRO", "UDMSE"];
var AP_MODEL_PREFIXES = ["UAP", "U6", "U7", "UAL", "UAPMESH"];
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
    if ([
      "US8P60",
      "USMINI",
      "USL8LP",
      "USL8LPB",
      "USL16LP",
      "USL16LPB",
      "USW24P",
      "USW48P"
    ].includes(modelKey)) return "switch";
  }
  if (modelStartsWith(device, SWITCH_MODEL_PREFIXES)) return "switch";
  if (modelStartsWith(device, GATEWAY_MODEL_PREFIXES)) return "gateway";
  const hasPorts = entities.some((e) => /_port_\d+_/i.test(e.entity_id));
  if (hasPorts) return "switch";
  if (hasUbiquitiManufacturer(device)) {
    const model = lower(device?.model);
    const name = lower(device?.name_by_user || device?.name);
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
async function getAllData(hass) {
  const [devices, entities, configEntries] = await Promise.all([
    safeCallWS(hass, { type: "config/device_registry/list" }, []),
    safeCallWS(hass, { type: "config/entity_registry/list" }, []),
    safeCallWS(hass, { type: "config/config_entries/entry" }, [])
  ]);
  const entitiesByDevice = /* @__PURE__ */ new Map();
  for (const entity of entities) {
    if (!entity.device_id) continue;
    if (!entitiesByDevice.has(entity.device_id)) {
      entitiesByDevice.set(entity.device_id, []);
    }
    entitiesByDevice.get(entity.device_id).push(entity);
  }
  return { devices, entitiesByDevice, configEntries };
}
function isUnifiDevice(device, unifiEntryIds, entities) {
  const byConfigEntry = Array.isArray(device?.config_entries) && device.config_entries.some((id) => unifiEntryIds.has(id));
  if (byConfigEntry) return true;
  const modelKey = resolveModelKey(device);
  if (modelKey) return true;
  if (modelStartsWith(device, [...SWITCH_MODEL_PREFIXES, ...GATEWAY_MODEL_PREFIXES])) {
    return true;
  }
  const hasPorts = entities.some((e) => /_port_\d+_/i.test(e.entity_id));
  if (hasPorts && hasUbiquitiManufacturer(device)) return true;
  return false;
}
function buildDeviceLabel(device, type) {
  const name = normalize(device.name_by_user) || normalize(device.name) || normalize(device.model) || "Unknown device";
  const model = normalize(device.model);
  const typeLabel = type === "gateway" ? "Gateway" : "Switch";
  if (model && lower(model) !== lower(name)) {
    return `${name} \xB7 ${model} (${typeLabel})`;
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
async function getUnifiDevices(hass) {
  const { devices, entitiesByDevice, configEntries } = await getAllData(hass);
  const unifiEntryIds = extractUnifiEntryIds(configEntries);
  console.debug(
    "[unifi-device-card] Config entries:",
    (configEntries || []).map((e) => ({ domain: e.domain, title: e.title, id: e.entry_id }))
  );
  const results = [];
  for (const device of devices || []) {
    const entities = entitiesByDevice.get(device.id) || [];
    const byConfigEntry = Array.isArray(device?.config_entries) && device.config_entries.some((id) => unifiEntryIds.has(id));
    const modelKey = resolveModelKey(device);
    const type = classifyDevice(device, entities);
    if (hasUbiquitiManufacturer(device) || byConfigEntry) {
      console.debug("[unifi-device-card] Candidate device:", {
        name: device.name_by_user || device.name,
        manufacturer: device.manufacturer,
        model: device.model,
        hw_version: device.hw_version,
        sw_version: device.sw_version,
        config_entries: device.config_entries,
        byConfigEntry,
        modelKey,
        type,
        isUnifi: isUnifiDevice(device, unifiEntryIds, entities)
      });
    }
    if (!isUnifiDevice(device, unifiEntryIds, entities)) continue;
    if (type !== "switch" && type !== "gateway") continue;
    results.push({
      id: device.id,
      name: normalize(device.name_by_user) || normalize(device.name) || normalize(device.model),
      label: buildDeviceLabel(device, type),
      model: normalize(device.model),
      type
    });
  }
  return results.sort((a, b) => a.name.localeCompare(b.name, "de", { sensitivity: "base" }));
}
async function getDeviceContext(hass, deviceId) {
  const { devices, entitiesByDevice, configEntries } = await getAllData(hass);
  const unifiEntryIds = extractUnifiEntryIds(configEntries);
  const device = devices.find((d) => d.id === deviceId);
  if (!device) return null;
  const entities = entitiesByDevice.get(deviceId) || [];
  if (!isUnifiDevice(device, unifiEntryIds, entities)) return null;
  const type = classifyDevice(device, entities);
  if (type !== "switch" && type !== "gateway") return null;
  const numberedPorts = discoverPorts(entities);
  const specialPorts = discoverSpecialPorts(entities);
  const layout = getDeviceLayout(device, numberedPorts);
  return {
    device,
    entities,
    type,
    layout,
    specialPorts,
    name: normalize(device.name_by_user) || normalize(device.name) || normalize(device.model),
    model: normalize(device.model),
    manufacturer: normalize(device.manufacturer),
    firmware: extractFirmware(device, entities)
  };
}
function extractPortNumber(entity) {
  const id = entity.entity_id || "";
  const originalName = entity.original_name || "";
  const name = entity.name || "";
  let match = id.match(/_port_(\d+)(?:_|$)/i);
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
      key: `port-${port}`,
      port,
      label: String(port),
      kind: "numbered",
      link_entity: null,
      speed_entity: null,
      poe_switch_entity: null,
      poe_power_entity: null,
      power_cycle_entity: null,
      raw_entities: []
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
      kind: "special",
      link_entity: null,
      speed_entity: null,
      poe_switch_entity: null,
      poe_power_entity: null,
      power_cycle_entity: null,
      raw_entities: []
    });
  }
  return map.get(key);
}
function isLikelyLinkStateValue(value) {
  const v = String(value ?? "").toLowerCase();
  return v === "on" || v === "off" || v === "up" || v === "down" || v === "connected" || v === "disconnected" || v === "true" || v === "false";
}
function isThroughputEntity(id) {
  return id.endsWith("_rx") || id.endsWith("_tx") || id.includes("_rx_") || id.includes("_tx_") || id.includes("throughput") || id.includes("bandwidth") || id.includes("download") || id.includes("upload") || id.includes("traffic");
}
function isSpeedEntity(id) {
  return id.includes("_link_speed") || id.includes("_ethernet_speed") || id.includes("_negotiated_speed");
}
function classifyPortEntity(entity) {
  const id = lower(entity.entity_id);
  const eid = entity.entity_id;
  if (eid.startsWith("button.") && (id.includes("power_cycle") || id.includes("_restart") || id.includes("_reboot"))) {
    return "power_cycle_entity";
  }
  if (eid.startsWith("switch.") && id.includes("_port_") && id.endsWith("_poe")) {
    return "poe_switch_entity";
  }
  if (eid.startsWith("switch.") && id.includes("_port_") && !id.endsWith("_poe")) {
    return "link_entity";
  }
  if (eid.startsWith("binary_sensor.") && id.includes("_port_")) {
    return "link_entity";
  }
  if (eid.startsWith("sensor.") && isThroughputEntity(id)) {
    return null;
  }
  if (eid.startsWith("sensor.") && isSpeedEntity(id)) {
    return "speed_entity";
  }
  if (eid.startsWith("sensor.") && id.includes("_port_") && id.includes("_poe_power")) {
    return "poe_power_entity";
  }
  if (eid.startsWith("sensor.") && id.includes("_port_") && (id.includes("_link") || id.includes("_status") || id.includes("_state")) && !isThroughputEntity(id)) {
    return "link_entity";
  }
  return null;
}
function detectSpecialPortKey(entity) {
  const text = entityText(entity);
  const id = lower(entity.entity_id);
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
function discoverPorts(entities) {
  const ports = /* @__PURE__ */ new Map();
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
function discoverSpecialPorts(entities) {
  const specials = /* @__PURE__ */ new Map();
  for (const entity of entities || []) {
    if (extractPortNumber(entity)) continue;
    const special = detectSpecialPortKey(entity);
    if (!special) continue;
    const row = ensureSpecialPort(specials, special.key, special.label);
    row.raw_entities.push(entity.entity_id);
    const type = classifyPortEntity(entity);
    if (type && !row[type]) {
      row[type] = entity.entity_id;
    }
  }
  return Array.from(specials.values());
}
function mergePortsWithLayout(layout, discoveredPorts) {
  const byPort = new Map(discoveredPorts.map((p) => [p.port, p]));
  const layoutPorts = (layout?.rows || []).flat();
  const merged = [];
  for (const portNumber of layoutPorts) {
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
        raw_entities: []
      }
    );
  }
  for (const port of discoveredPorts) {
    if (!layoutPorts.includes(port.port)) merged.push(port);
  }
  return merged.sort((a, b) => (a.port ?? 999) - (b.port ?? 999));
}
function mergeSpecialsWithLayout(layout, discoveredSpecials) {
  const byKey = new Map(discoveredSpecials.map((s) => [s.key, s]));
  const layoutSpecials = layout?.specialSlots || [];
  const merged = layoutSpecials.map((slot) => {
    return byKey.get(slot.key) || {
      key: slot.key,
      port: null,
      label: slot.label,
      kind: "special",
      link_entity: null,
      speed_entity: null,
      poe_switch_entity: null,
      poe_power_entity: null,
      power_cycle_entity: null,
      raw_entities: []
    };
  });
  for (const special of discoveredSpecials) {
    if (!layoutSpecials.some((s) => s.key === special.key)) merged.push(special);
  }
  return merged;
}
function stateObj(hass, entityId) {
  return entityId ? hass.states[entityId] || null : null;
}
function stateValue(hass, entityId, fallback = "\u2014") {
  const state = stateObj(hass, entityId);
  return state ? state.state : fallback;
}
function isOn(hass, entityId) {
  const state = stateObj(hass, entityId);
  if (!state) return false;
  const value = String(state.state).toLowerCase();
  if (value === "on" || value === "connected" || value === "up" || value === "true" || value === "active" || value === "1") return true;
  const num = parseFloat(value);
  if (!isNaN(num) && num > 0) {
    const id = lower(entityId);
    if (id.includes("_link") || id.includes("_status") || id.includes("_state") || id.includes("_port_status")) return true;
  }
  return false;
}
function formatState(hass, entityId, fallback = "\u2014") {
  const state = stateObj(hass, entityId);
  if (!state) return fallback;
  const unit = state.attributes?.unit_of_measurement;
  if (state.state === "unknown" || state.state === "unavailable") return "\u2014";
  return unit ? `${state.state} ${unit}` : state.state;
}
function getPortLinkText(hass, port) {
  const direct = stateObj(hass, port?.link_entity);
  if (direct) {
    const value = String(direct.state ?? "");
    if (isLikelyLinkStateValue(value)) return value;
  }
  for (const entityId of port?.raw_entities || []) {
    const st = stateObj(hass, entityId);
    if (!st) continue;
    const value = String(st.state ?? "");
    const id = lower(entityId);
    if (isLikelyLinkStateValue(value) && !id.includes("poe") && !id.includes("power") && !id.includes("speed")) {
      return value;
    }
  }
  if (port?.speed_entity) {
    const speedState = stateObj(hass, port.speed_entity);
    if (speedState) {
      const num = parseFloat(speedState.state);
      if (!isNaN(num) && num > 0) return "connected";
    }
  }
  return "\u2014";
}
function simplifySpeed(value, unit = "") {
  const raw = String(value ?? "").trim().toLowerCase();
  const rawUnit = String(unit ?? "").trim().toLowerCase();
  if (!raw || raw === "unknown" || raw === "unavailable") return "\u2014";
  const number = parseFloat(raw.replace(",", "."));
  if (!Number.isNaN(number)) {
    if (rawUnit.includes("gbit")) return `${Math.round(number * 1e3)} Mbit`;
    if (rawUnit.includes("mbit")) return `${Math.round(number)} Mbit`;
    if (number === 10 || number === 100 || number === 1e3 || number === 2500 || number === 1e4) {
      return `${Math.round(number)} Mbit`;
    }
  }
  if (raw.includes("10g")) return "10000 Mbit";
  if (raw.includes("2.5g")) return "2500 Mbit";
  if (raw.includes("1g")) return "1000 Mbit";
  if (raw.includes("1000")) return "1000 Mbit";
  if (raw.includes("100m")) return "100 Mbit";
  if (raw === "100") return "100 Mbit";
  if (raw.includes("10m")) return "10 Mbit";
  if (raw === "10") return "10 Mbit";
  return "\u2014";
}
function getPortSpeedText(hass, port) {
  const direct = stateObj(hass, port?.speed_entity);
  if (direct) {
    const result = simplifySpeed(direct.state, direct.attributes?.unit_of_measurement);
    if (result !== "\u2014") return result;
  }
  for (const entityId of port?.raw_entities || []) {
    const st = stateObj(hass, entityId);
    if (!st) continue;
    const id = lower(entityId);
    const unit = st.attributes?.unit_of_measurement || "";
    const value = String(st.state ?? "");
    if (isThroughputEntity(id)) continue;
    if (id.includes("link_speed") || id.endsWith("_speed") || id.includes("ethernet_speed") || id.includes("negotiated_speed")) {
      const result = simplifySpeed(value, unit);
      if (result !== "\u2014") return result;
    }
  }
  return "\u2014";
}

// src/unifi-device-card-editor.js
var UnifiDeviceCardEditor = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = {};
    this._devices = [];
    this._loading = false;
    this._loaded = false;
    this._error = "";
    this._hass = null;
    this._loadToken = 0;
  }
  setConfig(config) {
    this._config = config || {};
    this._render();
  }
  set hass(hass) {
    this._hass = hass;
    if (!this._loaded && !this._loading) this._loadDevices();
  }
  async _loadDevices() {
    if (!this._hass) return;
    this._loading = true;
    this._error = "";
    const token = ++this._loadToken;
    this._render();
    try {
      const devices = await getUnifiDevices(this._hass);
      if (token !== this._loadToken) return;
      this._devices = devices;
      this._loaded = true;
      this._loading = false;
      this._render();
    } catch (err) {
      if (token !== this._loadToken) return;
      this._devices = [];
      this._loaded = true;
      this._loading = false;
      this._error = "UniFi-Ger\xE4te konnten nicht geladen werden.";
      this._render();
    }
  }
  _dispatch(config) {
    this.dispatchEvent(new CustomEvent("config-changed", {
      detail: { config },
      bubbles: true,
      composed: true
    }));
  }
  _selectedDeviceName(deviceId) {
    return this._devices.find((d) => d.id === deviceId)?.name || "";
  }
  _onDeviceChange(ev) {
    const newDeviceId = ev.target.value || "";
    const oldDeviceId = this._config?.device_id || "";
    const oldAutoName = this._selectedDeviceName(oldDeviceId);
    const newAutoName = this._selectedDeviceName(newDeviceId);
    const next = { ...this._config };
    if (newDeviceId) next.device_id = newDeviceId;
    else delete next.device_id;
    const currentName = String(next.name || "").trim();
    if (!currentName || currentName === oldAutoName) {
      if (newAutoName) next.name = newAutoName;
      else delete next.name;
    }
    this._config = next;
    this._dispatch(next);
    this._render();
  }
  _onNameInput(ev) {
    const next = { ...this._config, name: ev.target.value || "" };
    this._config = next;
    this._dispatch(next);
  }
  _render() {
    const cfg = this._config;
    const selId = cfg?.device_id || "";
    const selName = String(cfg?.name || "").replace(/"/g, "&quot;");
    const options = this._devices.map((d) => `<option value="${d.id}" ${d.id === selId ? "selected" : ""}>${d.label}</option>`).join("");
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }
        .wrap { display: grid; gap: 14px; }

        .section-title {
          font-size: 11px; font-weight: 700; letter-spacing: 0.08em;
          text-transform: uppercase; color: var(--secondary-text-color);
          padding-bottom: 4px; border-bottom: 1px solid var(--divider-color);
        }

        .field { display: grid; gap: 5px; }

        label {
          font-size: 13px; font-weight: 600;
          color: var(--primary-text-color);
        }

        select, input {
          width: 100%; box-sizing: border-box; min-height: 38px;
          padding: 7px 10px; border-radius: 8px;
          border: 1px solid var(--divider-color);
          background: var(--card-background-color);
          color: var(--primary-text-color); font: inherit;
        }

        .hint  { color: var(--secondary-text-color); font-size: 12px; line-height: 1.4; }
        .error { color: var(--error-color);           font-size: 12px; line-height: 1.4; }
      </style>

      <div class="wrap">

        <div class="section-title">Ger\xE4t</div>

        <div class="field">
          <label for="device">UniFi Ger\xE4t</label>
          ${this._loading ? `<div class="hint">Lade Ger\xE4te aus Home Assistant\u2026</div>` : `<select id="device">
                 <option value="">Ger\xE4t ausw\xE4hlen\u2026</option>
                 ${options}
               </select>`}
        </div>

        <div class="field">
          <label for="name">Anzeigename</label>
          <input id="name" type="text" value="${selName}"
            placeholder="Optional \u2014 wird sonst vom Ger\xE4t \xFCbernommen" />
        </div>

        ${this._error ? `<div class="error">${this._error}</div>` : ""}

        ${!this._loading && !this._devices.length && !this._error ? `<div class="hint">Keine UniFi Switches oder Gateways in Home Assistant gefunden.</div>` : !this._loading ? `<div class="hint">Nur Ger\xE4te aus der UniFi Network Integration werden angezeigt.</div>` : ""}

      </div>
    `;
    this.shadowRoot.getElementById("device")?.addEventListener("change", (e) => this._onDeviceChange(e));
    this.shadowRoot.getElementById("name")?.addEventListener("input", (e) => this._onNameInput(e));
  }
};
customElements.define("unifi-device-card-editor", UnifiDeviceCardEditor);

// src/unifi-device-card.js
var VERSION = "0.0.0-dev.9bed8d1";
var UnifiDeviceCard = class extends HTMLElement {
  static getConfigElement() {
    return document.createElement("unifi-device-card-editor");
  }
  static getStubConfig() {
    return {};
  }
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = {};
    this._ctx = null;
    this._selectedKey = null;
    this._loading = false;
    this._loadToken = 0;
    this._loadedDeviceId = null;
  }
  setConfig(config) {
    const oldDeviceId = this._config?.device_id || null;
    const newConfig = config || {};
    const newDeviceId = newConfig?.device_id || null;
    this._config = newConfig;
    if (oldDeviceId !== newDeviceId) {
      this._ctx = null;
      this._selectedKey = null;
      this._loadedDeviceId = null;
      this._loading = false;
      if (this._hass && newDeviceId) {
        this._ensureLoaded();
        return;
      }
    }
    this._render();
  }
  set hass(hass) {
    this._hass = hass;
    this._ensureLoaded();
    this._render();
  }
  getCardSize() {
    return 8;
  }
  async _ensureLoaded() {
    if (!this._hass || !this._config?.device_id) return;
    const currentId = this._config.device_id;
    if (this._loadedDeviceId === currentId && this._ctx) return;
    if (this._loading) return;
    this._loading = true;
    this._render();
    const token = ++this._loadToken;
    try {
      const ctx = await getDeviceContext(this._hass, currentId);
      if (token !== this._loadToken) return;
      this._ctx = ctx;
      this._loadedDeviceId = currentId;
      const numbered = mergePortsWithLayout(ctx?.layout, discoverPorts(ctx?.entities || []));
      const specials = mergeSpecialsWithLayout(ctx?.layout, discoverSpecialPorts(ctx?.entities || []));
      const first = specials[0] || numbered[0] || null;
      this._selectedKey = first?.key || null;
    } catch (err) {
      console.error("[unifi-device-card] Failed to load device context", err);
      if (token !== this._loadToken) return;
      this._ctx = null;
      this._loadedDeviceId = null;
    }
    this._loading = false;
    this._render();
  }
  _selectKey(key) {
    this._selectedKey = key;
    this._render();
  }
  async _toggleEntity(entityId) {
    if (!entityId || !this._hass) return;
    const [domain] = entityId.split(".");
    await this._hass.callService(domain, "toggle", { entity_id: entityId });
  }
  async _pressButton(entityId) {
    if (!entityId || !this._hass) return;
    await this._hass.callService("button", "press", { entity_id: entityId });
  }
  _subtitle() {
    if (!this._config?.device_id || !this._ctx) return `Version ${VERSION}`;
    const fw = this._ctx?.firmware;
    const model = this._ctx?.layout?.displayModel || this._ctx?.model || "";
    return fw ? `${model} \xB7 FW ${fw}` : model;
  }
  _connectedCount(allSlots) {
    return allSlots.filter((s) => isOn(this._hass, s.link_entity)).length;
  }
  _styles() {
    return `<style>
      :host {
        --udc-bg:      #141820;
        --udc-surface: #1e2433;
        --udc-surf2:   #252d3d;
        --udc-border:  rgba(255,255,255,0.07);
        --udc-accent:  #0090d9;
        --udc-aglow:   rgba(0,144,217,0.2);
        --udc-green:   #22c55e;
        --udc-orange:  #f59e0b;
        --udc-text:    #e2e8f0;
        --udc-muted:   #4e5d73;
        --udc-dim:     #8896a8;
        --udc-r:       14px;
        --udc-rsm:     8px;
      }
      ha-card {
        background: var(--udc-bg) !important;
        color: var(--udc-text) !important;
        border: 1px solid var(--udc-border) !important;
        border-radius: var(--udc-r) !important;
        overflow: hidden;
        font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
      }

      /* HEADER */
      .header {
        padding: 16px 18px 13px;
        background: linear-gradient(160deg, var(--udc-surface) 0%, var(--udc-bg) 100%);
        border-bottom: 1px solid var(--udc-border);
        display: flex; justify-content: space-between; align-items: center; gap: 10px;
      }
      .header-info { display: grid; gap: 2px; min-width: 0; }
      .title {
        font-size: 1.05rem; font-weight: 700; letter-spacing: -.02em;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }
      .subtitle { font-size: 0.73rem; color: var(--udc-muted); }
      .chip {
        display: flex; align-items: center; gap: 5px;
        background: var(--udc-surf2); border: 1px solid var(--udc-border);
        border-radius: 20px; padding: 3px 10px;
        font-size: 0.71rem; font-weight: 700; white-space: nowrap;
        color: var(--udc-dim); flex-shrink: 0;
      }
      .chip .dot {
        width: 6px; height: 6px; border-radius: 50%;
        background: var(--udc-green); box-shadow: 0 0 5px var(--udc-green);
        animation: blink 2.5s ease-in-out infinite;
      }
      @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.4} }

      /* \u2500\u2500 FRONT PANEL \u2500\u2500 */
      .frontpanel {
        padding: 10px 14px 12px; display: grid; gap: 5px;
        border-bottom: 1px solid var(--udc-border);
      }
      /* White theme (USW Lite, Flex Mini, UCG) */
      .frontpanel.theme-white {
        background: #d8dde6;
      }
      /* Silver/rack theme (US 8 60W, UDM Pro, USW 24/48) */
      .frontpanel.theme-silver {
        background: #2a2e35;
      }
      /* Default fallback */
      .frontpanel.theme-dark {
        background: var(--udc-surface);
      }

      .panel-label {
        font-size: 0.62rem; font-weight: 700; letter-spacing: .1em;
        text-transform: uppercase; margin-bottom: 3px;
      }
      .theme-white  .panel-label { color: #8a96a8; }
      .theme-silver .panel-label { color: #5a6070; }
      .theme-dark   .panel-label { color: var(--udc-muted); }

      .special-row { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 5px; }
      .port-row    { display: grid; gap: 5px; }
      .frontpanel.single-row         .port-row,
      .frontpanel.gateway-single-row .port-row { grid-template-columns: repeat(8, minmax(0,1fr)); }
      .frontpanel.dual-row           .port-row { grid-template-columns: repeat(8, minmax(0,1fr)); }
      .frontpanel.gateway-rack       .port-row { grid-template-columns: repeat(8, minmax(0,1fr)); }
      .frontpanel.gateway-compact    .port-row { grid-template-columns: repeat(5, minmax(0,1fr)); }
      .frontpanel.quad-row           .port-row { grid-template-columns: repeat(12, minmax(0,1fr)); }

      /* \u2500\u2500 PORT BUTTON \u2500\u2500 */
      .port {
        cursor: pointer; font: inherit;
        display: flex; flex-direction: column; align-items: center;
        padding: 4px 2px 3px; border-radius: 4px;
        transition: outline .1s ease; position: relative; min-width: 0;
        /* no border \u2014 LEDs and socket provide all visual feedback */
        border: none; background: transparent;
      }
      .port:focus { outline: none; }
      .port.selected { outline: 2px solid var(--udc-accent); outline-offset: 1px; border-radius: 5px; }
      .port:hover { outline: 1px solid rgba(0,144,217,.5); outline-offset: 1px; border-radius: 5px; }

      /* LED row \u2014 spans full port width, LEDs at far left + right */
      .port-leds {
        display: flex; justify-content: space-between;
        width: 100%; padding: 0 1px; margin-bottom: 2px;
      }
      .port-led {
        width: 4px; height: 4px; border-radius: 50%;
        transition: background .2s;
        flex-shrink: 0;
      }

      /* RJ45 socket \u2014 white theme: light beige recess */
      .port-socket {
        width: 100%; height: 13px; border-radius: 2px 2px 0 0;
        position: relative; flex-shrink: 0;
      }
      /* The gold contact pins inside the socket */
      .port-socket::after {
        content: '';
        position: absolute; bottom: 0; left: 12%; right: 12%;
        height: 4px; border-radius: 1px 1px 0 0;
      }

      .port-num {
        font-size: 8px; font-weight: 800; line-height: 1;
        margin-top: 2px; letter-spacing: 0; user-select: none;
      }

      /* \u2500\u2500 WHITE THEME port colors \u2500\u2500 */
      .theme-white .port-socket            { background: #b0b8c4; }
      .theme-white .port-socket::after     { background: #8a8060; }
      .theme-white .port-num               { color: #8a96a8; }
      .theme-white .port.up .port-socket   { background: #9aa8b8; }
      .theme-white .port.up .port-num      { color: #4a5568; }
      .theme-white .port-led               { background: #c8d0d8; }

      /* \u2500\u2500 SILVER THEME port colors \u2500\u2500 */
      .theme-silver .port-socket           { background: #1a1e24; }
      .theme-silver .port-socket::after    { background: #6a6040; }
      .theme-silver .port-num              { color: #5a6070; }
      .theme-silver .port.up .port-socket  { background: #141c14; }
      .theme-silver .port.up .port-num     { color: #9aabb8; }
      .theme-silver .port-led              { background: #252a30; }

      /* \u2500\u2500 DARK THEME port colors \u2500\u2500 */
      .theme-dark .port-socket             { background: #1a2030; }
      .theme-dark .port-socket::after      { background: #5a5030; }
      .theme-dark .port-num                { color: var(--udc-muted); }
      .theme-dark .port.up .port-socket    { background: #0f2010; }
      .theme-dark .port.up .port-num       { color: var(--udc-text); }
      .theme-dark .port-led                { background: #1e2433; }

      /* \u2500\u2500 LED states \u2014 same for all themes \u2500\u2500 */
      /* Right LED: link / speed */
      .port.up          .port-led-link { background: var(--udc-green); }
      .port.speed-100   .port-led-link { background: var(--udc-orange); }
      .port.speed-low   .port-led-link { background: #7a5c10; }
      /* Left LED: PoE */
      .port.poe-on      .port-led-poe  { background: var(--udc-orange); }

      /* Special ports (WAN / SFP) */
      .port.special { padding: 5px 5px 4px; border-radius: 5px; }
      .port.special .port-socket { height: 15px; border-radius: 3px 3px 0 0; }
      .port.special .port-num { font-size: 9px; }

      /* DETAIL */
      .section { padding: 14px 18px 18px; display: grid; gap: 14px; }
      .detail-header {
        display: flex; align-items: center; justify-content: space-between;
        padding-bottom: 11px; border-bottom: 1px solid var(--udc-border); margin-bottom: 12px;
      }
      .detail-title { font-size: .92rem; font-weight: 700; letter-spacing: -.01em; }
      .status-badge {
        display: inline-flex; align-items: center; gap: 4px;
        padding: 3px 9px; border-radius: 20px;
        font-size: .7rem; font-weight: 700; letter-spacing: .04em; text-transform: uppercase;
      }
      .status-badge.up   { background: rgba(34,197,94,.1);  color: var(--udc-green); border: 1px solid rgba(34,197,94,.2); }
      .status-badge.down { background: rgba(78,93,115,.2);   color: var(--udc-muted); border: 1px solid var(--udc-border); }

      .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px; }
      .detail-card {
        background: var(--udc-surface); border: 1px solid var(--udc-border);
        border-radius: var(--udc-rsm); padding: 9px 12px; display: grid; gap: 2px;
      }
      .dc-label { font-size: .63rem; font-weight: 700; letter-spacing: .07em; text-transform: uppercase; color: var(--udc-muted); }
      .dc-value { font-size: .87rem; font-weight: 700; color: var(--udc-text); }
      .dc-value.accent { color: var(--udc-accent); }
      .dc-value.poe-on { color: var(--udc-orange); }
      .dc-value.na     { color: var(--udc-muted); font-weight: 400; }

      .actions { display: flex; gap: 7px; flex-wrap: wrap; }
      .action-btn {
        border: 1px solid var(--udc-border); border-radius: 7px;
        padding: 7px 14px; cursor: pointer; font: inherit;
        font-size: .8rem; font-weight: 600; transition: all .13s ease;
        display: inline-flex; align-items: center; gap: 5px;
      }
      .action-btn.primary   { background: var(--udc-accent); color: white; border-color: var(--udc-accent); }
      .action-btn.primary:hover { background: #0077bb; box-shadow: 0 0 14px var(--udc-aglow); }
      .action-btn.secondary { background: var(--udc-surf2); color: var(--udc-dim); }
      .action-btn.secondary:hover { color: var(--udc-text); border-color: rgba(255,255,255,.14); }

      .muted { color: var(--udc-muted); font-size: .875rem; }
      .loading-state {
        display: flex; align-items: center; gap: 10px;
        padding: 20px; color: var(--udc-muted); font-size: .875rem;
      }
      .spinner {
        width: 16px; height: 16px; flex-shrink: 0;
        border: 2px solid var(--udc-surf2); border-top-color: var(--udc-accent);
        border-radius: 50%; animation: spin .65s linear infinite;
      }
      @keyframes spin { to { transform: rotate(360deg); } }
      .empty-state {
        padding: 24px 18px; color: var(--udc-muted);
        font-size: .875rem; text-align: center; line-height: 1.5;
      }
    </style>`;
  }
  _renderPortButton(slot, selectedKey) {
    const linkUp = isOn(this._hass, slot.link_entity);
    const hasPoe = Boolean(slot.power_cycle_entity);
    const poeOn = hasPoe && slot.poe_switch_entity ? isOn(this._hass, slot.poe_switch_entity) : false;
    const isSpecial = slot.kind === "special";
    let speedClass = "";
    if (linkUp) {
      const speedText = getPortSpeedText(this._hass, slot);
      if (speedText.includes("1000") || speedText.toLowerCase().includes("1 gbit") || speedText.includes("1Gbit")) {
        speedClass = "";
      } else if (speedText.includes("100")) {
        speedClass = "speed-100";
      } else if (speedText !== "\u2014") {
        speedClass = "speed-low";
      }
    }
    const tooltip = [
      slot.label,
      linkUp ? "Connected" : "No link",
      linkUp ? getPortSpeedText(this._hass, slot) : null,
      poeOn ? "PoE ON" : null
    ].filter((v) => v && v !== "\u2014").join(" \xB7 ");
    const classes = [
      "port",
      isSpecial ? "special" : "",
      linkUp ? "up" : "down",
      selectedKey === slot.key ? "selected" : "",
      speedClass,
      poeOn ? "poe-on" : ""
    ].filter(Boolean).join(" ");
    return `<button class="${classes}" data-key="${slot.key}" title="${tooltip}">
      <div class="port-leds">
        <div class="port-led port-led-poe"></div>
        <div class="port-led port-led-link"></div>
      </div>
      <div class="port-socket"></div>
      <div class="port-num">${slot.label}</div>
    </button>`;
  }
  _renderPanelAndDetail(title) {
    const ctx = this._ctx;
    const numbered = mergePortsWithLayout(ctx?.layout, discoverPorts(ctx?.entities || []));
    const specials = mergeSpecialsWithLayout(ctx?.layout, discoverSpecialPorts(ctx?.entities || []));
    const allSlots = [...specials, ...numbered];
    const selected = allSlots.find((p) => p.key === this._selectedKey) || allSlots[0] || null;
    const connected = this._connectedCount(allSlots);
    const specialRow = specials.length ? `<div class="special-row">${specials.map((s) => this._renderPortButton(s, selected?.key)).join("")}</div>` : "";
    const layoutRows = (ctx?.layout?.rows || []).map((rowPorts) => {
      const items = rowPorts.map((portNumber) => {
        const slot = numbered.find((p) => p.port === portNumber) || {
          key: `port-${portNumber}`,
          port: portNumber,
          label: String(portNumber),
          kind: "numbered",
          link_entity: null,
          speed_entity: null,
          poe_switch_entity: null,
          poe_power_entity: null,
          power_cycle_entity: null,
          raw_entities: []
        };
        return this._renderPortButton(slot, selected?.key);
      }).join("");
      return `<div class="port-row">${items}</div>`;
    });
    let detail = `<div class="muted">Keine Ports erkannt.</div>`;
    if (selected) {
      const linkUp = isOn(this._hass, selected.link_entity);
      const linkText = getPortLinkText(this._hass, selected);
      const speedText = getPortSpeedText(this._hass, selected);
      const poeAvail = Boolean(selected.power_cycle_entity && selected.poe_switch_entity);
      const poeOn = poeAvail ? isOn(this._hass, selected.poe_switch_entity) : false;
      const poePower = poeAvail ? formatState(this._hass, selected.poe_power_entity, "\u2014") : "\u2014";
      detail = `
        <div class="detail-header">
          <div class="detail-title">${selected.kind === "special" ? selected.label : `Port ${selected.port}`}</div>
          <div class="status-badge ${linkUp ? "up" : "down"}">${linkUp ? "\u25CF Online" : "\u25CB Offline"}</div>
        </div>

        <div class="detail-grid">
          <div class="detail-card">
            <div class="dc-label">Link Status</div>
            <div class="dc-value">${linkText !== "\u2014" ? linkText : linkUp ? "Connected" : "No link"}</div>
          </div>
          <div class="detail-card">
            <div class="dc-label">Geschwindigkeit</div>
            <div class="dc-value accent">${speedText}</div>
          </div>
          <div class="detail-card">
            <div class="dc-label">PoE</div>
            <div class="dc-value ${poeAvail ? poeOn ? "poe-on" : "" : "na"}">
              ${poeAvail ? stateValue(this._hass, selected.poe_switch_entity, "\u2014") : "\u2014"}
            </div>
          </div>
          <div class="detail-card">
            <div class="dc-label">PoE Leistung</div>
            <div class="dc-value ${poeAvail ? "" : "na"}">${poePower}</div>
          </div>
        </div>

        <div class="actions">
          ${poeAvail ? `<button class="action-btn primary" data-action="toggle-poe" data-entity="${selected.poe_switch_entity}">
                \u26A1 PoE ${poeOn ? "Aus" : "Ein"}
               </button>` : ""}
          ${selected.power_cycle_entity ? `<button class="action-btn secondary" data-action="power-cycle" data-entity="${selected.power_cycle_entity}">
                \u21BA Power Cycle
               </button>` : ""}
        </div>`;
    }
    const theme = ctx?.layout?.theme || "dark";
    const themeClass = `theme-${theme}`;
    this.shadowRoot.innerHTML = `${this._styles()}
      <ha-card>
        <div class="header">
          <div class="header-info">
            <div class="title">${title}</div>
            <div class="subtitle">${this._subtitle()}</div>
          </div>
          <div class="chip"><div class="dot"></div>${connected}/${allSlots.length}</div>
        </div>

        <div class="frontpanel ${ctx?.layout?.frontStyle || "single-row"} ${themeClass}">
          <div class="panel-label">Front Panel</div>
          ${specialRow}
          ${layoutRows.join("") || `<div class="muted" style="padding:8px 0">Keine Ports erkannt.</div>`}
        </div>

        <div class="section">${detail}</div>
      </ha-card>`;
    this.shadowRoot.querySelectorAll(".port").forEach((btn) => btn.addEventListener("click", () => this._selectKey(btn.dataset.key)));
    this.shadowRoot.querySelector("[data-action='toggle-poe']")?.addEventListener("click", (e) => this._toggleEntity(e.currentTarget.dataset.entity));
    this.shadowRoot.querySelector("[data-action='power-cycle']")?.addEventListener("click", (e) => this._pressButton(e.currentTarget.dataset.entity));
  }
  _render() {
    const title = this._config?.name || "UniFi Device Card";
    if (!this._config?.device_id) {
      this.shadowRoot.innerHTML = `${this._styles()}
        <ha-card>
          <div class="header">
            <div class="header-info">
              <div class="title">${title}</div>
              <div class="subtitle">${this._subtitle()}</div>
            </div>
          </div>
          <div class="empty-state">Bitte im Karteneditor ein UniFi-Ger\xE4t ausw\xE4hlen.</div>
        </ha-card>`;
      return;
    }
    if (this._loading) {
      this.shadowRoot.innerHTML = `${this._styles()}
        <ha-card>
          <div class="header">
            <div class="header-info">
              <div class="title">${title}</div>
              <div class="subtitle">${this._subtitle()}</div>
            </div>
          </div>
          <div class="loading-state"><div class="spinner"></div>Lade Ger\xE4tedaten\u2026</div>
        </ha-card>`;
      return;
    }
    if (!this._ctx) {
      this.shadowRoot.innerHTML = `${this._styles()}
        <ha-card>
          <div class="header">
            <div class="header-info">
              <div class="title">${title}</div>
              <div class="subtitle">${this._subtitle()}</div>
            </div>
          </div>
          <div class="empty-state">Keine Ger\xE4tedaten verf\xFCgbar.</div>
        </ha-card>`;
      return;
    }
    this._renderPanelAndDetail(title);
  }
};
customElements.define("unifi-device-card", UnifiDeviceCard);
window.customCards = window.customCards || [];
window.customCards.push({
  type: "unifi-device-card",
  name: "UniFi Device Card",
  description: "Lovelace card for UniFi switches and gateways."
});
