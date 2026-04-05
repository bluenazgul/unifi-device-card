/* UniFi Device Card 0.0.0-dev.9d283a5 */

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
    specialSlots: []
  },
  USMINI: {
    kind: "switch",
    frontStyle: "single-row",
    rows: [range(1, 5)],
    portCount: 5,
    displayModel: "USW Flex Mini",
    specialSlots: []
  },
  USL8LP: {
    kind: "switch",
    frontStyle: "single-row",
    rows: [range(1, 8)],
    portCount: 8,
    displayModel: "USW Lite 8 PoE",
    specialSlots: []
  },
  USL8LPB: {
    kind: "switch",
    frontStyle: "single-row",
    rows: [range(1, 8)],
    portCount: 8,
    displayModel: "USW Lite 8 PoE",
    specialSlots: []
  },
  USL16LP: {
    kind: "switch",
    frontStyle: "dual-row",
    rows: [oddRange(1, 16), evenRange(1, 16)],
    portCount: 16,
    displayModel: "USW Lite 16 PoE",
    specialSlots: []
  },
  USL16LPB: {
    kind: "switch",
    frontStyle: "dual-row",
    rows: [oddRange(1, 16), evenRange(1, 16)],
    portCount: 16,
    displayModel: "USW Lite 16 PoE",
    specialSlots: []
  },
  UDRULT: {
    kind: "gateway",
    frontStyle: "gateway-single-row",
    rows: [[1, 2, 3, 4]],
    portCount: 4,
    displayModel: "Cloud Gateway Ultra",
    specialSlots: [{ key: "wan", label: "WAN" }]
  },
  UCGULTRA: {
    kind: "gateway",
    frontStyle: "gateway-single-row",
    rows: [[1, 2, 3, 4]],
    portCount: 4,
    displayModel: "Cloud Gateway Ultra",
    specialSlots: [{ key: "wan", label: "WAN" }]
  },
  UCGMAX: {
    kind: "gateway",
    frontStyle: "gateway-single-row",
    rows: [[1, 2, 3, 4, 5]],
    portCount: 5,
    displayModel: "Cloud Gateway Max",
    specialSlots: [{ key: "wan", label: "WAN" }]
  },
  UDMPRO: {
    kind: "gateway",
    frontStyle: "gateway-rack",
    rows: [range(1, 8)],
    portCount: 8,
    displayModel: "UDM Pro",
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
    specialSlots: []
  },
  USW48P: {
    kind: "switch",
    frontStyle: "quad-row",
    rows: [range(1, 12), range(13, 24), range(25, 36), range(37, 48)],
    portCount: 48,
    displayModel: "USW 48 PoE",
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
function isThroughputEntity(id, text) {
  return id.includes("throughput") || id.includes("traffic") || id.includes("download") || id.includes("upload") || id.includes("_rx") || id.includes("_tx") || id.includes("bandwidth") || text.includes("throughput") || text.includes("download") || text.includes("upload") || text.includes("traffic");
}
function classifyPortEntity(entity) {
  const id = lower(entity.entity_id);
  const text = entityText(entity);
  if (entity.entity_id.startsWith("binary_sensor.")) {
    if (id.includes("_link") || id.includes("_connected") || id.includes("_connection") || id.includes("_state") || text.includes(" link") || text.includes("connected") || text.includes("connection")) {
      return "link_entity";
    }
  }
  if (entity.entity_id.startsWith("sensor.") && !isThroughputEntity(id, text) && (id.includes("link_speed") || id.includes("ethernet_speed") || id.includes("negotiated_speed") || // ends with _speed but is NOT a throughput sensor
  id.endsWith("_speed") && !isThroughputEntity(id, text))) {
    return "speed_entity";
  }
  if (entity.entity_id.startsWith("sensor.")) {
    const hasIdKeyword = id.includes("_link") || id.includes("_port_status") || id.includes("_port_state") || id.includes("_status") || id.includes("_state");
    const hasTextKeyword = text.includes("port") || text.includes("link") || text.includes("connected") || text.includes("status") || text.includes("state");
    if (!isThroughputEntity(id, text) && hasIdKeyword && hasTextKeyword) {
      return "link_entity";
    }
    if (!isThroughputEntity(id, text) && id.includes("_port_") && hasIdKeyword) {
      return "link_entity";
    }
  }
  if (entity.entity_id.startsWith("switch.") && (id.includes("_poe") || text.includes("poe"))) {
    return "poe_switch_entity";
  }
  if (entity.entity_id.startsWith("sensor.") && (id.includes("_poe_power") || text.includes("poe") && text.includes("power") || text.includes("poe") && text.includes(" w"))) {
    return "poe_power_entity";
  }
  if (entity.entity_id.startsWith("button.") && (id.includes("power_cycle") || id.includes("restart") || id.includes("reboot") || text.includes("power") && text.includes("cycle"))) {
    return "power_cycle_entity";
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
    if (isThroughputEntity(id, id)) continue;
    if (id.includes("link_speed") || id.endsWith("_speed") || id.includes("ethernet_speed") || id.includes("negotiated_speed")) {
      const result = simplifySpeed(value, unit);
      if (result !== "\u2014") return result;
    }
  }
  return "\u2014";
}

// src/unifi-api.js
var LOG = "[unifi-api]";
function baseUrl(host) {
  const h = String(host || "").replace(/\/+$/, "");
  return h.startsWith("http") ? h : `https://${h}`;
}
function apiUrl(host, path, site = "default") {
  const base = baseUrl(host);
  const p = path.replace(/^\/+/, "");
  return `${base}/proxy/network/${p}`;
}
function legacyApiUrl(host, path, site = "default") {
  const base = baseUrl(host);
  const p = path.replace(/^\/+/, "");
  const resolved = p.replace("{site}", site);
  return `${base}/${resolved}`;
}
var UnifiApiClient = class {
  /**
   * @param {object} opts
   * @param {string}  opts.host      — IP or hostname of the controller (e.g. "192.168.1.1")
   * @param {string}  [opts.apiKey]  — API key (Network 8+, preferred)
   * @param {string}  [opts.username]
   * @param {string}  [opts.password]
   * @param {string}  [opts.site]    — UniFi site name, default "default"
   */
  constructor({ host, apiKey, username, password, site = "default" }) {
    this._host = host;
    this._apiKey = apiKey || null;
    this._username = username || null;
    this._password = password || null;
    this._site = site;
    this._csrf = null;
    this._loggedIn = false;
    this._legacy = false;
  }
  // ── Internal fetch wrapper ────────────────────────────────────────────────
  async _fetch(url, opts = {}) {
    const headers = {
      "Content-Type": "application/json",
      ...opts.headers || {}
    };
    if (this._apiKey) {
      headers["X-API-Key"] = this._apiKey;
    }
    if (this._csrf) {
      headers["X-Csrf-Token"] = this._csrf;
    }
    const res = await fetch(url, {
      credentials: "include",
      ...opts,
      headers
    });
    const csrf = res.headers.get("x-csrf-token");
    if (csrf) this._csrf = csrf;
    return res;
  }
  // ── Authentication ────────────────────────────────────────────────────────
  /**
   * Login with username + password (cookie-based).
   * Not needed when using an API key.
   */
  async login() {
    if (this._apiKey) return;
    if (this._loggedIn) return;
    if (!this._username || !this._password) {
      throw new Error("No API key and no username/password provided.");
    }
    const urls = [
      `${baseUrl(this._host)}/api/auth/login`,
      `${baseUrl(this._host)}/api/login`
    ];
    let lastErr;
    for (const url of urls) {
      try {
        const res = await this._fetch(url, {
          method: "POST",
          body: JSON.stringify({
            username: this._username,
            password: this._password,
            remember: false
          })
        });
        if (res.ok) {
          this._loggedIn = true;
          console.info(LOG, "Logged in via", url);
          return;
        }
        lastErr = new Error(`Login failed: HTTP ${res.status}`);
      } catch (e) {
        lastErr = e;
      }
    }
    throw lastErr;
  }
  // ── Generic GET with new→legacy fallback ─────────────────────────────────
  async _get(newPath, legacyPath) {
    if (!this._legacy) {
      try {
        const url2 = apiUrl(this._host, newPath, this._site);
        const res2 = await this._fetch(url2);
        if (res2.ok) {
          const json2 = await res2.json();
          return json2?.data ?? json2;
        }
        if (res2.status === 404 || res2.status === 401) {
          console.warn(LOG, "New-style endpoint not available, switching to legacy");
          this._legacy = true;
        } else {
          throw new Error(`GET ${url2} \u2192 HTTP ${res2.status}`);
        }
      } catch (e) {
        if (e.message?.includes("HTTP")) throw e;
        this._legacy = true;
      }
    }
    const url = legacyApiUrl(this._host, legacyPath, this._site);
    const res = await this._fetch(url);
    if (!res.ok) throw new Error(`GET ${url} \u2192 HTTP ${res.status}`);
    const json = await res.json();
    return json?.data ?? json;
  }
  async _put(newPath, legacyPath, body) {
    if (!this._legacy) {
      try {
        const url2 = apiUrl(this._host, newPath, this._site);
        const res2 = await this._fetch(url2, {
          method: "PUT",
          body: JSON.stringify(body)
        });
        if (res2.ok) {
          const json2 = await res2.json();
          return json2?.data ?? json2;
        }
        if (res2.status === 404) this._legacy = true;
        else throw new Error(`PUT ${url2} \u2192 HTTP ${res2.status}`);
      } catch (e) {
        if (e.message?.includes("HTTP")) throw e;
        this._legacy = true;
      }
    }
    const url = legacyApiUrl(this._host, legacyPath, this._site);
    const res = await this._fetch(url, {
      method: "PUT",
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error(`PUT ${url} \u2192 HTTP ${res.status}`);
    const json = await res.json();
    return json?.data ?? json;
  }
  // ── Public API ────────────────────────────────────────────────────────────
  /**
   * Test connection – returns true if the controller is reachable
   * and credentials are valid.
   */
  async testConnection() {
    try {
      await this.login();
      const sites = await this._get(
        "api/sites",
        "api/self/sites"
      );
      return Array.isArray(sites) && sites.length > 0;
    } catch (e) {
      console.error(LOG, "testConnection failed:", e);
      return false;
    }
  }
  /**
   * List all UniFi network devices (switches, gateways, APs …).
   * Returns an array of device objects from the controller.
   */
  async getDevices() {
    await this.login();
    return this._get(
      `api/s/${this._site}/stat/device`,
      `api/s/{site}/stat/device`
    );
  }
  /**
   * Get a single device by its MAC address.
   */
  async getDevice(mac) {
    await this.login();
    const devices = await this.getDevices();
    return devices.find(
      (d) => d.mac?.toLowerCase() === mac?.toLowerCase()
    ) || null;
  }
  /**
   * Get rich port data for a device.
   *
   * Returns an array of port objects like:
   * {
   *   port_idx:    1,
   *   name:        "Port 1",
   *   up:          true,
   *   speed:       1000,       // Mbit
   *   duplex:      "full",
   *   poe_enable:  true,
   *   poe_power:   "4.50",     // W
   *   poe_voltage: "53.00",    // V
   *   poe_current: "0.08",     // A
   *   "rx_bytes-r": 12540,     // current RX rate bytes/s
   *   "tx_bytes-r": 8320,
   *   rx_bytes:    1234567890, // total
   *   tx_bytes:    987654321,
   *   mac_table:   [{mac, hostname, ip}],
   * }
   */
  async getPortTable(mac) {
    await this.login();
    const device = await this.getDevice(mac);
    if (!device) throw new Error(`Device ${mac} not found`);
    const portTable = device.port_table || [];
    return portTable.map((p) => ({
      port_idx: p.port_idx,
      name: p.name || `Port ${p.port_idx}`,
      up: Boolean(p.up),
      speed: p.speed || 0,
      duplex: p.full_duplex ? "full" : "half",
      poe_enable: Boolean(p.poe_enable),
      poe_mode: p.poe_mode || null,
      poe_power: p.poe_power ? String(p.poe_power) : null,
      poe_voltage: p.poe_voltage ? String(p.poe_voltage) : null,
      poe_current: p.poe_current ? String(p.poe_current) : null,
      rx_rate: p["rx_bytes-r"] ?? 0,
      tx_rate: p["tx_bytes-r"] ?? 0,
      rx_bytes: p.rx_bytes ?? 0,
      tx_bytes: p.tx_bytes ?? 0,
      mac_table: p.mac_table || [],
      // raw data for debugging
      _raw: p
    }));
  }
  /**
   * Toggle PoE on a specific port.
   * @param {string} deviceId  — UniFi device _id
   * @param {number} portIdx   — 1-based port index
   * @param {boolean} enable
   */
  async setPortPoe(deviceId, portIdx, enable) {
    await this.login();
    const devices = await this.getDevices();
    const device = devices.find((d) => d._id === deviceId);
    if (!device) throw new Error(`Device ${deviceId} not found`);
    const overrides = device.port_overrides ? [...device.port_overrides] : [];
    const idx = overrides.findIndex((o) => o.port_idx === portIdx);
    const updated = {
      port_idx: portIdx,
      poe_mode: enable ? "auto" : "off",
      ...idx >= 0 ? overrides[idx] : {}
    };
    updated.poe_mode = enable ? "auto" : "off";
    if (idx >= 0) overrides[idx] = updated;
    else overrides.push(updated);
    return this._put(
      `api/s/${this._site}/rest/device/${deviceId}`,
      `api/s/{site}/rest/device/${deviceId}`,
      { port_overrides: overrides }
    );
  }
  /**
   * Power-cycle (bounce) a PoE port.
   */
  async powerCyclePort(deviceMac, portIdx) {
    await this.login();
    const url = this._legacy ? legacyApiUrl(this._host, `api/s/{site}/cmd/devmgr`, this._site) : apiUrl(this._host, `api/s/${this._site}/cmd/devmgr`);
    const res = await this._fetch(url, {
      method: "POST",
      body: JSON.stringify({
        cmd: "power-cycle",
        mac: deviceMac,
        port_idx: portIdx
      })
    });
    if (!res.ok) throw new Error(`power-cycle \u2192 HTTP ${res.status}`);
    return res.json();
  }
  /**
   * Fetch all known sites (useful for testing/autocomplete).
   */
  async getSites() {
    await this.login();
    return this._get("api/sites", "api/self/sites");
  }
};
var _clientCache = /* @__PURE__ */ new Map();
function getApiClient(config) {
  const { unifi_host, unifi_api_key, unifi_username, unifi_password, unifi_site } = config;
  if (!unifi_host) return null;
  const key = `${unifi_host}|${unifi_site || "default"}|${unifi_api_key || unifi_username || ""}`;
  if (!_clientCache.has(key)) {
    _clientCache.set(
      key,
      new UnifiApiClient({
        host: unifi_host,
        apiKey: unifi_api_key || null,
        username: unifi_username || null,
        password: unifi_password || null,
        site: unifi_site || "default"
      })
    );
  }
  return _clientCache.get(key);
}
function clearApiClient(config) {
  const { unifi_host, unifi_site, unifi_api_key, unifi_username } = config;
  const key = `${unifi_host}|${unifi_site || "default"}|${unifi_api_key || unifi_username || ""}`;
  _clientCache.delete(key);
}
function formatBytes(bytesPerSec) {
  if (!bytesPerSec || bytesPerSec <= 0) return null;
  if (bytesPerSec >= 1e6) return `${(bytesPerSec / 1e6).toFixed(1)} MB/s`;
  if (bytesPerSec >= 1e3) return `${(bytesPerSec / 1e3).toFixed(0)} KB/s`;
  return `${bytesPerSec} B/s`;
}
function formatSpeed(mbit) {
  if (!mbit || mbit <= 0) return "\u2014";
  if (mbit >= 1e3) return `${mbit / 1e3} Gbit`;
  return `${mbit} Mbit`;
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
    this._apiTesting = false;
    this._apiResult = null;
    this._apiError = "";
    this._apiSites = [];
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
  _onApiField(field, ev) {
    const value = ev.target.value.trim();
    const next = { ...this._config };
    if (value) next[field] = value;
    else delete next[field];
    this._config = next;
    this._apiResult = null;
    this._dispatch(next);
  }
  async _testConnection() {
    if (!this._config.unifi_host) {
      this._apiResult = "fail";
      this._apiError = "Bitte zuerst Host/IP eintragen.";
      this._render();
      return;
    }
    clearApiClient(this._config);
    this._apiTesting = true;
    this._apiResult = null;
    this._apiError = "";
    this._apiSites = [];
    this._render();
    try {
      const client = getApiClient(this._config);
      await client.login();
      const sites = await client.getSites();
      this._apiSites = Array.isArray(sites) ? sites.map((s) => ({ name: s.name, desc: s.desc })) : [];
      this._apiResult = "ok";
    } catch (e) {
      console.error("[unifi-device-card] API test failed:", e);
      this._apiResult = "fail";
      this._apiError = e.message || "Verbindung fehlgeschlagen";
    }
    this._apiTesting = false;
    this._render();
  }
  _render() {
    const cfg = this._config;
    const selId = cfg?.device_id || "";
    const selName = String(cfg?.name || "").replace(/"/g, "&quot;");
    const host = String(cfg?.unifi_host || "").replace(/"/g, "&quot;");
    const apiKey = String(cfg?.unifi_api_key || "").replace(/"/g, "&quot;");
    const username = String(cfg?.unifi_username || "").replace(/"/g, "&quot;");
    const password = String(cfg?.unifi_password || "").replace(/"/g, "&quot;");
    const site = String(cfg?.unifi_site || "").replace(/"/g, "&quot;");
    const mac = String(cfg?.unifi_mac || "").replace(/"/g, "&quot;");
    const options = this._devices.map((d) => `<option value="${d.id}" ${d.id === selId ? "selected" : ""}>${d.label}</option>`).join("");
    let testBadge = "";
    if (this._apiTesting) {
      testBadge = `<div class="api-badge testing">\u23F3 Teste Verbindung\u2026</div>`;
    } else if (this._apiResult === "ok") {
      const sl = this._apiSites.length ? ` \xB7 Sites: ${this._apiSites.map((s) => s.desc || s.name).join(", ")}` : "";
      testBadge = `<div class="api-badge ok">\u2705 Verbindung erfolgreich${sl}</div>`;
    } else if (this._apiResult === "fail") {
      testBadge = `<div class="api-badge fail">\u274C ${this._apiError}</div>`;
    }
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }
        .wrap { display: grid; gap: 14px; }
        .section-title {
          font-size: 11px; font-weight: 700; letter-spacing: 0.08em;
          text-transform: uppercase; color: var(--secondary-text-color);
          padding-bottom: 4px; border-bottom: 1px solid var(--divider-color); margin-top: 4px;
        }
        .field { display: grid; gap: 5px; }
        label { font-size: 13px; font-weight: 600; color: var(--primary-text-color); }
        select, input {
          width: 100%; box-sizing: border-box; min-height: 38px;
          padding: 7px 10px; border-radius: 8px;
          border: 1px solid var(--divider-color);
          background: var(--card-background-color);
          color: var(--primary-text-color); font: inherit;
        }
        .row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .hint  { color: var(--secondary-text-color); font-size: 12px; line-height: 1.4; }
        .error { color: var(--error-color);           font-size: 12px; line-height: 1.4; }
        .test-btn {
          display: inline-flex; align-items: center; gap: 6px;
          border: none; border-radius: 8px; padding: 8px 16px;
          cursor: pointer; font: inherit; font-size: 13px; font-weight: 600;
          background: var(--primary-color); color: white;
        }
        .test-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .api-badge {
          font-size: 12px; line-height: 1.5; padding: 8px 12px;
          border-radius: 8px; border: 1px solid transparent;
        }
        .api-badge.testing { background: rgba(0,0,0,.06);     border-color: var(--divider-color); }
        .api-badge.ok      { background: rgba(34,197,94,.1);  border-color: rgba(34,197,94,.3); color: #14532d; }
        .api-badge.fail    { background: rgba(239,68,68,.08); border-color: rgba(239,68,68,.3); color: #991b1b; }
      </style>

      <div class="wrap">

        <div class="section-title">Home Assistant Ger\xE4t</div>

        <div class="field">
          <label for="device">UniFi Ger\xE4t (aus HA)</label>
          ${this._loading ? `<div class="hint">Lade Ger\xE4te aus Home Assistant\u2026</div>` : `<select id="device"><option value="">Ger\xE4t ausw\xE4hlen\u2026</option>${options}</select>`}
        </div>

        <div class="field">
          <label for="name">Anzeigename</label>
          <input id="name" type="text" value="${selName}" placeholder="Optional" />
        </div>

        ${this._error ? `<div class="error">${this._error}</div>` : ""}
        ${!this._loading && !this._devices.length && !this._error ? `<div class="hint">Keine UniFi Switches/Gateways in HA gefunden.</div>` : !this._loading ? `<div class="hint">Nur Ger\xE4te aus der UniFi-Integration.</div>` : ""}

        <div class="section-title">Direkte API (empfohlen)</div>
        <div class="hint">
          Wenn Host + Zugangsdaten angegeben, werden Port-Daten direkt von der UniFi
          Network Application abgerufen \u2014 pr\xE4ziser und mit mehr Details als \xFCber HA-Entities
          (Echtzeit-Throughput, MAC-Tabelle, PoE-Volt/Ampere, \u2026).
        </div>

        <div class="field">
          <label for="unifi_host">Controller Host / IP</label>
          <input id="unifi_host" type="text" value="${host}"
            placeholder="192.168.1.1  oder  unifi.local" />
        </div>

        <div class="field">
          <label for="unifi_site">Site</label>
          <input id="unifi_site" type="text" value="${site}" placeholder="default" />
        </div>

        <div class="field">
          <label for="unifi_api_key">API-Key  (Network 8.x+, empfohlen)</label>
          <input id="unifi_api_key" type="password" value="${apiKey}"
            placeholder="UniFi Network \u2192 Einstellungen \u2192 API Keys" />
        </div>

        <div class="row2">
          <div class="field">
            <label for="unifi_username">Benutzername</label>
            <input id="unifi_username" type="text" value="${username}" placeholder="local-admin" />
          </div>
          <div class="field">
            <label for="unifi_password">Passwort</label>
            <input id="unifi_password" type="password" value="${password}" placeholder="\u2022\u2022\u2022\u2022\u2022\u2022" />
          </div>
        </div>

        <div class="field">
          <label for="unifi_mac">Ger\xE4te-MAC (optional)</label>
          <input id="unifi_mac" type="text" value="${mac}"
            placeholder="aa:bb:cc:dd:ee:ff \u2014 wird sonst auto-erkannt" />
          <div class="hint">Leer lassen = wird anhand des HA-Ger\xE4tenamens gesucht.</div>
        </div>

        <button class="test-btn" id="test-btn" ${this._apiTesting ? "disabled" : ""}>
          \u{1F50C} Verbindung testen
        </button>

        ${testBadge}

      </div>
    `;
    this.shadowRoot.getElementById("device")?.addEventListener("change", (e) => this._onDeviceChange(e));
    this.shadowRoot.getElementById("name")?.addEventListener("input", (e) => this._onNameInput(e));
    for (const f of ["unifi_host", "unifi_site", "unifi_api_key", "unifi_username", "unifi_password", "unifi_mac"]) {
      this.shadowRoot.getElementById(f)?.addEventListener("change", (e) => this._onApiField(f, e));
    }
    this.shadowRoot.getElementById("test-btn")?.addEventListener("click", () => this._testConnection());
  }
};
customElements.define("unifi-device-card-editor", UnifiDeviceCardEditor);

// src/unifi-device-card.js
var VERSION = "0.0.0-dev.9d283a5";
var UnifiDeviceCard = class _UnifiDeviceCard extends HTMLElement {
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
    this._apiPortMap = null;
    this._apiDeviceId = null;
    this._apiDeviceMac = null;
    this._selectedKey = null;
    this._loading = false;
    this._loadToken = 0;
    this._loadedDeviceId = null;
    this._apiTimer = null;
    this._apiError = null;
  }
  static get REFRESH_MS() {
    return 1e4;
  }
  // live refresh every 10 s
  setConfig(config) {
    const oldDeviceId = this._config?.device_id || null;
    const newConfig = config || {};
    const newDeviceId = newConfig?.device_id || null;
    this._config = newConfig;
    if (oldDeviceId !== newDeviceId) {
      this._ctx = null;
      this._apiPortMap = null;
      this._apiDeviceId = null;
      this._apiDeviceMac = null;
      this._selectedKey = null;
      this._loadedDeviceId = null;
      this._loading = false;
      this._stopApiTimer();
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
  disconnectedCallback() {
    this._stopApiTimer();
  }
  getCardSize() {
    return 8;
  }
  // ── Timer management ──────────────────────────────────────────────────────
  _startApiTimer() {
    if (this._apiTimer) return;
    if (!this._config?.unifi_host) return;
    this._apiTimer = setInterval(() => this._refreshApiData(), _UnifiDeviceCard.REFRESH_MS);
  }
  _stopApiTimer() {
    if (this._apiTimer) {
      clearInterval(this._apiTimer);
      this._apiTimer = null;
    }
  }
  // ── Load orchestration ────────────────────────────────────────────────────
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
      if (this._config?.unifi_host) {
        this._refreshApiData();
        this._startApiTimer();
      }
    } catch (err) {
      console.error("[unifi-device-card] HA context load failed", err);
      if (token !== this._loadToken) return;
      this._ctx = null;
      this._loadedDeviceId = null;
    }
    this._loading = false;
    this._render();
  }
  /**
   * Fetch live data from the UniFi API and update _apiPortMap.
   * Called on first load and periodically by the timer.
   */
  async _refreshApiData() {
    const client = getApiClient(this._config);
    if (!client) return;
    try {
      if (!this._apiDeviceMac) {
        await this._resolveApiDevice(client);
      }
      if (!this._apiDeviceMac) return;
      const portTable = await client.getPortTable(this._apiDeviceMac);
      const map = /* @__PURE__ */ new Map();
      for (const p of portTable) map.set(p.port_idx, p);
      this._apiPortMap = map;
      this._apiError = null;
    } catch (err) {
      console.warn("[unifi-device-card] API refresh failed:", err.message);
      this._apiError = err.message;
    }
    this._render();
  }
  /**
   * Try to match the selected HA device to a UniFi API device by MAC or name.
   */
  async _resolveApiDevice(client) {
    if (this._config?.unifi_mac) {
      this._apiDeviceMac = this._config.unifi_mac;
      return;
    }
    if (!this._ctx) return;
    try {
      const devices = await client.getDevices();
      const haDevice = this._ctx.device;
      const serial = haDevice?.serial_number?.toLowerCase();
      let match = null;
      if (serial) {
        match = devices.find(
          (d) => d.serial?.toLowerCase() === serial || d.mac?.toLowerCase().replace(/:/g, "") === serial.replace(/:/g, "")
        );
      }
      if (!match) {
        const haName = String(
          haDevice?.name_by_user || haDevice?.name || ""
        ).toLowerCase();
        match = devices.find(
          (d) => String(d.name || "").toLowerCase() === haName
        );
      }
      if (match) {
        this._apiDeviceId = match._id;
        this._apiDeviceMac = match.mac;
        console.info("[unifi-device-card] Resolved API device:", match.mac, match.name);
      } else {
        console.warn("[unifi-device-card] Could not match HA device to UniFi API device");
      }
    } catch (err) {
      console.warn("[unifi-device-card] Device resolve failed:", err.message);
    }
  }
  // ── Actions ───────────────────────────────────────────────────────────────
  _selectKey(key) {
    this._selectedKey = key;
    this._render();
  }
  async _togglePoe(slot) {
    const client = getApiClient(this._config);
    if (client && this._apiDeviceId && slot.port) {
      const apiPort = this._apiPortMap?.get(slot.port);
      const current = apiPort ? apiPort.poe_enable : false;
      try {
        await client.setPortPoe(this._apiDeviceId, slot.port, !current);
        await new Promise((r) => setTimeout(r, 800));
        await this._refreshApiData();
        return;
      } catch (err) {
        console.error("[unifi-device-card] PoE toggle via API failed:", err);
      }
    }
    if (slot.poe_switch_entity && this._hass) {
      const [domain] = slot.poe_switch_entity.split(".");
      await this._hass.callService(domain, "toggle", { entity_id: slot.poe_switch_entity });
    }
  }
  async _powerCycle(slot) {
    const client = getApiClient(this._config);
    if (client && this._apiDeviceMac && slot.port) {
      try {
        await client.powerCyclePort(this._apiDeviceMac, slot.port);
        await new Promise((r) => setTimeout(r, 1200));
        await this._refreshApiData();
        return;
      } catch (err) {
        console.error("[unifi-device-card] Power cycle via API failed:", err);
      }
    }
    if (slot.power_cycle_entity && this._hass) {
      await this._hass.callService("button", "press", { entity_id: slot.power_cycle_entity });
    }
  }
  // ── Data helpers: merge HA + API ──────────────────────────────────────────
  /**
   * Is the port link up?
   * API data takes priority over HA entities.
   */
  _portIsUp(slot) {
    if (this._apiPortMap && slot.port) {
      const p = this._apiPortMap.get(slot.port);
      if (p) return p.up;
    }
    return isOn(this._hass, slot.link_entity);
  }
  /**
   * PoE enabled?
   */
  _portPoeEnabled(slot) {
    if (this._apiPortMap && slot.port) {
      const p = this._apiPortMap.get(slot.port);
      if (p) return p.poe_enable;
    }
    return isOn(this._hass, slot.poe_switch_entity);
  }
  /**
   * Has any PoE capability?
   */
  _portHasPoe(slot) {
    if (this._apiPortMap && slot.port) {
      const p = this._apiPortMap.get(slot.port);
      if (p) return p.poe_mode !== null && p.poe_mode !== void 0;
    }
    return Boolean(slot.power_cycle_entity);
  }
  _subtitle() {
    if (!this._config?.device_id || !this._ctx) return `Version ${VERSION}`;
    const fw = this._ctx?.firmware;
    const model = this._ctx?.layout?.displayModel || this._ctx?.model || "";
    const src = this._apiPortMap ? " \xB7 API \u2713" : "";
    return fw ? `${model} \xB7 FW ${fw}${src}` : `${model}${src}`;
  }
  _connectedCount(allSlots) {
    return allSlots.filter((s) => this._portIsUp(s)).length;
  }
  // ── Styles ────────────────────────────────────────────────────────────────
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
        --udc-red:     #ef4444;
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

      /* \u2500\u2500 HEADER \u2500\u2500 */
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
      .header-chips { display: flex; gap: 7px; flex-shrink: 0; align-items: center; }

      .chip {
        display: flex; align-items: center; gap: 5px;
        background: var(--udc-surf2); border: 1px solid var(--udc-border);
        border-radius: 20px; padding: 3px 10px;
        font-size: 0.71rem; font-weight: 700; white-space: nowrap; color: var(--udc-dim);
      }
      .chip .dot {
        width: 6px; height: 6px; border-radius: 50%;
        background: var(--udc-green); box-shadow: 0 0 5px var(--udc-green);
        animation: blink 2.5s ease-in-out infinite;
      }
      .chip.api-chip { color: var(--udc-accent); border-color: rgba(0,144,217,.25); }
      .chip.api-chip .dot { background: var(--udc-accent); box-shadow: 0 0 5px var(--udc-accent); }
      @keyframes blink {
        0%,100% { opacity:1; } 50% { opacity:.4; }
      }

      /* \u2500\u2500 FRONT PANEL \u2500\u2500 */
      .frontpanel {
        padding: 13px 18px 10px; display: grid; gap: 6px;
        background: var(--udc-surface); border-bottom: 1px solid var(--udc-border);
      }
      .panel-label {
        font-size: 0.63rem; font-weight: 700; letter-spacing: .1em;
        text-transform: uppercase; color: var(--udc-muted); margin-bottom: 1px;
      }
      .special-row { display: flex; gap: 5px; flex-wrap: wrap; margin-bottom: 4px; }
      .port-row    { display: grid; gap: 4px; }
      .frontpanel.single-row         .port-row,
      .frontpanel.gateway-single-row .port-row { grid-template-columns: repeat(8, minmax(0,1fr)); }
      .frontpanel.dual-row           .port-row { grid-template-columns: repeat(8, minmax(0,1fr)); }
      .frontpanel.gateway-rack       .port-row { grid-template-columns: repeat(8, minmax(0,1fr)); }
      .frontpanel.gateway-compact    .port-row { grid-template-columns: repeat(5, minmax(0,1fr)); }
      .frontpanel.quad-row           .port-row { grid-template-columns: repeat(12, minmax(0,1fr)); }

      /* \u2500\u2500 PORT BUTTON \u2500\u2500 */
      .port {
        border: 1px solid rgba(255,255,255,.06); border-radius: 7px;
        min-height: 40px; cursor: pointer; font: inherit;
        display: grid; place-items: center; gap: 1px; padding: 3px 2px;
        background: var(--udc-bg); transition: all .13s ease;
        position: relative; overflow: hidden;
      }
      .port::after {
        content:''; position:absolute; top:0; left:0; right:0;
        height:2px; background:transparent; transition:background .15s;
      }
      .port.up { background: rgba(34,197,94,.06); border-color: rgba(34,197,94,.25); }
      .port.up::after { background: var(--udc-green); }
      .port:hover { transform: translateY(-1px); border-color: rgba(0,144,217,.35); background: rgba(0,144,217,.07); }
      .port.selected {
        border-color: var(--udc-accent) !important;
        background: rgba(0,144,217,.12) !important;
        box-shadow: 0 0 0 1px var(--udc-accent), inset 0 0 10px rgba(0,144,217,.08);
      }
      .port.selected::after { background: var(--udc-accent) !important; }
      .port.has-poe.up::after { background: linear-gradient(90deg, var(--udc-green) 50%, var(--udc-orange)); }
      .port.special { min-height: 46px; border-radius: 9px; min-width: 58px; padding: 5px 9px; }
      .port-num { font-size: 10px; font-weight: 800; line-height: 1; color: var(--udc-dim); }
      .port.up .port-num { color: var(--udc-text); }
      .port-icon { font-size: 8px; line-height: 1; color: var(--udc-muted); }
      .port.up .port-icon    { color: var(--udc-green); }
      .port.has-poe.up .port-icon { color: var(--udc-orange); }

      /* \u2500\u2500 DETAIL SECTION \u2500\u2500 */
      .section { padding: 14px 18px 18px; display: grid; gap: 14px; }
      .api-banner {
        display: flex; align-items: center; gap: 7px;
        background: rgba(0,144,217,.08); border: 1px solid rgba(0,144,217,.2);
        border-radius: var(--udc-rsm); padding: 7px 12px;
        font-size: 0.73rem; color: var(--udc-accent); font-weight: 600;
      }
      .api-err-banner {
        display: flex; align-items: center; gap: 7px;
        background: rgba(239,68,68,.07); border: 1px solid rgba(239,68,68,.2);
        border-radius: var(--udc-rsm); padding: 7px 12px;
        font-size: 0.73rem; color: var(--udc-red);
      }
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

      /* \u2500\u2500 DETAIL CARDS (2\xD7N grid) \u2500\u2500 */
      .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px; }
      .detail-card {
        background: var(--udc-surface); border: 1px solid var(--udc-border);
        border-radius: var(--udc-rsm); padding: 9px 12px; display: grid; gap: 2px;
      }
      .dc-label { font-size: .63rem; font-weight: 700; letter-spacing: .07em; text-transform: uppercase; color: var(--udc-muted); }
      .dc-value { font-size: .87rem; font-weight: 700; color: var(--udc-text); }
      .dc-value.accent  { color: var(--udc-accent); }
      .dc-value.poe-on  { color: var(--udc-orange); }
      .dc-value.na      { color: var(--udc-muted); font-weight: 400; }
      .dc-value.green   { color: var(--udc-green); }

      /* \u2500\u2500 MAC TABLE \u2500\u2500 */
      .mac-table { display: grid; gap: 5px; margin-bottom: 12px; }
      .mac-row {
        display: flex; align-items: center; gap: 8px;
        background: var(--udc-surface); border: 1px solid var(--udc-border);
        border-radius: 7px; padding: 7px 11px; font-size: .78rem;
      }
      .mac-icon { font-size: .85rem; opacity: .6; flex-shrink: 0; }
      .mac-hostname { font-weight: 600; flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; }
      .mac-addr { font-size: .7rem; color: var(--udc-dim); font-family: monospace; flex-shrink: 0; }
      .mac-ip   { font-size: .7rem; color: var(--udc-accent); flex-shrink: 0; }

      /* \u2500\u2500 THROUGHPUT CHIPS \u2500\u2500 */
      .tput-row { display: flex; gap: 6px; margin-bottom: 10px; }
      .tput-chip {
        display: inline-flex; align-items: center; gap: 4px;
        background: var(--udc-surf2); border: 1px solid var(--udc-border);
        border-radius: 6px; padding: 3px 8px;
        font-size: .7rem; font-weight: 600; color: var(--udc-dim);
      }
      .tput-chip .arr { font-size: 8px; opacity: .6; }

      /* \u2500\u2500 ACTIONS \u2500\u2500 */
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

      /* \u2500\u2500 MISC \u2500\u2500 */
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
      .empty-state { padding: 24px 18px; color: var(--udc-muted); font-size: .875rem; text-align: center; line-height: 1.5; }
    </style>`;
  }
  // ── Render helpers ────────────────────────────────────────────────────────
  _renderEmpty(title) {
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
  }
  _renderPortButton(slot, selectedKey) {
    const linkUp = this._portIsUp(slot);
    const hasPoe = this._portHasPoe(slot);
    const poeOn = hasPoe && this._portPoeEnabled(slot);
    const isSpecial = slot.kind === "special";
    const icon = poeOn ? "\u26A1" : linkUp ? "\u25B2" : "\u25CB";
    let tooltip = `${slot.label}${linkUp ? " \xB7 Connected" : " \xB7 No link"}`;
    if (this._apiPortMap && slot.port) {
      const ap = this._apiPortMap.get(slot.port);
      if (ap && ap.up && ap.speed) tooltip += ` \xB7 ${formatSpeed(ap.speed)}`;
    }
    return `<button
      class="port ${isSpecial ? "special" : ""} ${linkUp ? "up" : "down"} ${selectedKey === slot.key ? "selected" : ""} ${hasPoe ? "has-poe" : ""}"
      data-key="${slot.key}" title="${tooltip}">
      <div class="port-num">${slot.label}</div>
      <div class="port-icon">${icon}</div>
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
    let detail = "";
    if (selected) {
      const linkUp = this._portIsUp(selected);
      const hasPoe = this._portHasPoe(selected);
      const poeOn = hasPoe && this._portPoeEnabled(selected);
      const apiPort = this._apiPortMap?.get(selected.port) || null;
      const speedText = apiPort ? formatSpeed(apiPort.speed) : getPortSpeedText(this._hass, selected);
      const linkText = apiPort ? apiPort.up ? "Connected" : "No link" : getPortLinkText(this._hass, selected);
      const poePowerText = apiPort?.poe_power ? `${parseFloat(apiPort.poe_power).toFixed(1)} W` : selected.power_cycle_entity ? formatState(this._hass, selected.poe_power_entity, "\u2014") : "\u2014";
      const poeVoltText = apiPort?.poe_voltage ? `${parseFloat(apiPort.poe_voltage).toFixed(0)} V` : null;
      const poeAmpText = apiPort?.poe_current ? `${(parseFloat(apiPort.poe_current) * 1e3).toFixed(0)} mA` : null;
      const rxRate = apiPort ? formatBytes(apiPort.rx_rate) : null;
      const txRate = apiPort ? formatBytes(apiPort.tx_rate) : null;
      const macTable = apiPort?.mac_table || [];
      const canPoe = hasPoe || apiPort?.poe_mode !== null && apiPort?.poe_mode !== void 0;
      const canPowerCycle = Boolean(selected.power_cycle_entity) || Boolean(this._apiDeviceMac) && selected.port;
      const gridCards = [
        { label: "Link Status", value: linkText, cls: "" },
        { label: "Geschwindigkeit", value: speedText, cls: "accent" },
        {
          label: "PoE",
          value: canPoe ? poeOn ? "Ein \u26A1" : "Aus" : "\u2014",
          cls: poeOn ? "poe-on" : canPoe ? "" : "na"
        },
        { label: "PoE Leistung", value: canPoe ? poePowerText : "\u2014", cls: canPoe ? "" : "na" },
        ...poeVoltText ? [{ label: "PoE Spannung", value: poeVoltText, cls: "" }] : [],
        ...poeAmpText ? [{ label: "PoE Strom", value: poeAmpText, cls: "" }] : []
      ];
      const gridHtml = gridCards.map(
        (c) => `<div class="detail-card">
          <div class="dc-label">${c.label}</div>
          <div class="dc-value ${c.cls}">${c.value}</div>
        </div>`
      ).join("");
      const tputHtml = rxRate || txRate ? `
        <div class="tput-row">
          ${rxRate ? `<div class="tput-chip"><span class="arr">\u2193</span>${rxRate}</div>` : ""}
          ${txRate ? `<div class="tput-chip"><span class="arr">\u2191</span>${txRate}</div>` : ""}
        </div>` : "";
      const macHtml = macTable.length > 0 ? `
        <div class="mac-table">
          ${macTable.slice(0, 4).map((m) => `
            <div class="mac-row">
              <div class="mac-icon">\u{1F4BB}</div>
              <div class="mac-hostname">${m.hostname || "Unbekannt"}</div>
              <div class="mac-ip">${m.ip || ""}</div>
              <div class="mac-addr">${m.mac || ""}</div>
            </div>`).join("")}
        </div>` : "";
      const actionsHtml = `
        <div class="actions">
          ${canPoe ? `<button class="action-btn primary" data-action="toggle-poe">
                \u26A1 PoE ${poeOn ? "Aus" : "Ein"}
               </button>` : ""}
          ${canPowerCycle ? `<button class="action-btn secondary" data-action="power-cycle">
                \u21BA Power Cycle
               </button>` : ""}
        </div>`;
      detail = `
        <div class="port-detail">
          <div class="detail-header">
            <div class="detail-title">${selected.kind === "special" ? selected.label : `Port ${selected.port}`}</div>
            <div class="status-badge ${linkUp ? "up" : "down"}">${linkUp ? "\u25CF Online" : "\u25CB Offline"}</div>
          </div>
          <div class="detail-grid">${gridHtml}</div>
          ${tputHtml}
          ${macHtml}
          ${actionsHtml}
        </div>`;
    } else {
      detail = `<div class="muted">Keine Ports erkannt.</div>`;
    }
    let apiBanner = "";
    if (this._config?.unifi_host && this._apiPortMap) {
      apiBanner = `<div class="api-banner">\u26A1 Echtzeit-Daten via UniFi API</div>`;
    } else if (this._config?.unifi_host && this._apiError) {
      apiBanner = `<div class="api-err-banner">\u26A0 API nicht erreichbar: ${this._apiError} \u2014 verwende HA-Daten</div>`;
    } else if (this._config?.unifi_host) {
      apiBanner = `<div class="api-banner">\u23F3 Verbinde mit UniFi API\u2026</div>`;
    }
    const isApiMode = Boolean(this._config?.unifi_host && this._apiPortMap);
    const chipClass = isApiMode ? "chip api-chip" : "chip";
    const chipLabel = isApiMode ? "API" : "HA";
    this.shadowRoot.innerHTML = `${this._styles()}
      <ha-card>
        <div class="header">
          <div class="header-info">
            <div class="title">${title}</div>
            <div class="subtitle">${this._subtitle()}</div>
          </div>
          <div class="header-chips">
            <div class="${chipClass}"><div class="dot"></div>${connected}/${allSlots.length}</div>
            <div class="chip" style="font-size:.65rem;padding:3px 8px;color:var(--udc-muted)">${chipLabel}</div>
          </div>
        </div>

        <div class="frontpanel ${ctx?.layout?.frontStyle || "single-row"}">
          <div class="panel-label">Front Panel</div>
          ${specialRow}
          ${layoutRows.join("") || `<div class="muted" style="padding:8px 0">Keine Ports erkannt.</div>`}
        </div>

        <div class="section">
          ${apiBanner}
          ${detail}
        </div>
      </ha-card>`;
    this.shadowRoot.querySelectorAll(".port").forEach((btn) => btn.addEventListener("click", () => this._selectKey(btn.dataset.key)));
    const ctx2 = this._ctx;
    const numbered2 = mergePortsWithLayout(ctx2?.layout, discoverPorts(ctx2?.entities || []));
    const specials2 = mergeSpecialsWithLayout(ctx2?.layout, discoverSpecialPorts(ctx2?.entities || []));
    const allSlots2 = [...specials2, ...numbered2];
    const sel2 = allSlots2.find((p) => p.key === this._selectedKey) || allSlots2[0] || null;
    this.shadowRoot.querySelector("[data-action='toggle-poe']")?.addEventListener("click", () => sel2 && this._togglePoe(sel2));
    this.shadowRoot.querySelector("[data-action='power-cycle']")?.addEventListener("click", () => sel2 && this._powerCycle(sel2));
  }
  // ── Top-level render ──────────────────────────────────────────────────────
  _render() {
    const title = this._config?.name || "UniFi Device Card";
    if (!this._config?.device_id) {
      this._renderEmpty(title);
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
  description: "A Lovelace card for UniFi switches and gateways \u2014 with optional direct API support."
});
