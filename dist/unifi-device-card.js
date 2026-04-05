/* UniFi Device Card 0.0.0-dev.948eb70 */

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
      e.original_device_class
    ])
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
  const manufacturer = lower(device?.manufacturer);
  return manufacturer.includes("ubiquiti") || manufacturer.includes("unifi");
}
function isAccessPoint(device, entities) {
  const model = lower(device?.model);
  const name = lower(device?.name);
  const userName = lower(device?.name_by_user);
  const text = deviceText(device, entities);
  return model.includes("uap") || model.includes("u6") || model.includes("u7") || model.includes("acpro") || model.includes("ac-lite") || model.includes("aclr") || model.includes("nanohd") || name.includes("ac pro") || userName.includes("ac pro") || name.includes("access point") || userName.includes("access point") || text.includes("access point") || text.includes("uap-") || text.includes(" ac pro") || text.includes(" nanohd") || text.includes(" mesh");
}
function classifyDevice(device, entities) {
  if (isAccessPoint(device, entities)) return "access_point";
  const modelKey = resolveModelKey(device);
  if (modelKey === "UDRULT" || modelKey === "UCGULTRA" || modelKey === "UCGMAX" || modelKey === "UDMPRO" || modelKey === "UDMSE") {
    return "gateway";
  }
  if (modelKey === "US8P60" || modelKey === "USMINI" || modelKey === "USL8LP" || modelKey === "USL8LPB" || modelKey === "USL16LP" || modelKey === "USL16LPB") {
    return "switch";
  }
  const model = lower(device?.model);
  const name = lower(device?.name);
  const userName = lower(device?.name_by_user);
  if (model.includes("udm") || model.includes("ucg") || model.includes("uxg") || model.includes("gateway") || name.includes("gateway") || userName.includes("gateway")) {
    return "gateway";
  }
  const hasPorts = entities.some((e) => /_port_\d+_/i.test(e.entity_id));
  if (hasPorts) return "switch";
  if (model.includes("usw") || model.includes("us8") || model.includes("usmini") || model.includes("usl8") || model.includes("usl16") || name.includes("lite 8") || name.includes("lite 16") || name.includes("switch") || userName.includes("switch")) {
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
  const byManufacturer = hasUbiquitiManufacturer(device);
  const text = deviceText(device, entities);
  const byModelHint = text.includes("usw") || text.includes("usl8") || text.includes("usl16") || text.includes("usmini") || text.includes("us8") || text.includes("udm") || text.includes("ucg") || text.includes("uxg") || text.includes("lite 8 poe") || text.includes("lite 16 poe") || text.includes("cloud gateway") || text.includes("unifi switch") || text.includes("unifi dream");
  return byManufacturer || byModelHint;
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
  return (devices || []).map((device) => {
    const entities = entitiesByDevice.get(device.id) || [];
    if (!isUnifiDevice(device, unifiEntryIds, entities)) return null;
    const type = classifyDevice(device, entities);
    if (type !== "switch" && type !== "gateway") return null;
    return {
      id: device.id,
      name: normalize(device.name_by_user) || normalize(device.name) || normalize(device.model),
      label: buildDeviceLabel(device, type),
      model: normalize(device.model),
      type
    };
  }).filter(Boolean).sort((a, b) => a.name.localeCompare(b.name, "de", { sensitivity: "base" }));
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
    if (isThroughputEntity(id, id)) continue;
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
    if (!this._loaded && !this._loading) {
      this._loadDevices();
    }
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
      console.error("[unifi-device-card] Failed to load devices", err);
      this._devices = [];
      this._loaded = true;
      this._loading = false;
      this._error = "UniFi-Ger\xE4te konnten nicht geladen werden.";
      this._render();
    }
  }
  _dispatch(config) {
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config },
        bubbles: true,
        composed: true
      })
    );
  }
  _selectedDeviceName(deviceId) {
    const selected = this._devices.find((d) => d.id === deviceId);
    return selected?.name || "";
  }
  _onDeviceChange(ev) {
    const newDeviceId = ev.target.value || "";
    const oldDeviceId = this._config?.device_id || "";
    const oldAutoName = this._selectedDeviceName(oldDeviceId);
    const newAutoName = this._selectedDeviceName(newDeviceId);
    const next = { ...this._config };
    if (newDeviceId) {
      next.device_id = newDeviceId;
    } else {
      delete next.device_id;
    }
    const currentName = String(next.name || "").trim();
    if (!currentName || currentName === oldAutoName) {
      if (newAutoName) {
        next.name = newAutoName;
      } else {
        delete next.name;
      }
    }
    this._config = next;
    this._dispatch(next);
    this._render();
  }
  _onNameInput(ev) {
    const value = ev.target.value || "";
    const next = {
      ...this._config,
      name: value
    };
    this._config = next;
    this._dispatch(next);
  }
  _render() {
    const selectedId = this._config?.device_id || "";
    const selectedName = String(this._config?.name || "").replace(/"/g, "&quot;");
    const options = this._devices.map(
      (d) => `
          <option value="${d.id}" ${d.id === selectedId ? "selected" : ""}>
            ${d.label}
          </option>
        `
    ).join("");
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
        }

        .wrap {
          display: grid;
          gap: 16px;
        }

        .field {
          display: grid;
          gap: 6px;
        }

        label {
          font-size: 14px;
          font-weight: 600;
          color: var(--primary-text-color);
        }

        select,
        input {
          width: 100%;
          box-sizing: border-box;
          min-height: 40px;
          padding: 8px 10px;
          border-radius: 10px;
          border: 1px solid var(--divider-color);
          background: var(--card-background-color);
          color: var(--primary-text-color);
          font: inherit;
        }

        .hint {
          color: var(--secondary-text-color);
          font-size: 13px;
          line-height: 1.4;
        }

        .error {
          color: var(--error-color);
          font-size: 13px;
          line-height: 1.4;
        }
      </style>

      <div class="wrap">
        <div class="field">
          <label for="device">UniFi device</label>
          ${this._loading ? `<div class="hint">Lade unterst\xFCtzte UniFi-Ger\xE4te\u2026</div>` : `
                <select id="device">
                  <option value="">Select device\u2026</option>
                  ${options}
                </select>
              `}
        </div>

        <div class="field">
          <label for="name">Display name</label>
          <input
            id="name"
            type="text"
            value="${selectedName}"
            placeholder="Optional"
          />
        </div>

        ${this._error ? `<div class="error">${this._error}</div>` : ""}
        ${!this._loading && !this._devices.length && !this._error ? `<div class="hint">Keine unterst\xFCtzten UniFi Switches oder Gateways gefunden.</div>` : `<div class="hint">Es werden nur Ger\xE4te aus der UniFi-Integration angezeigt.</div>`}
      </div>
    `;
    this.shadowRoot.getElementById("device")?.addEventListener("change", (ev) => this._onDeviceChange(ev));
    this.shadowRoot.getElementById("name")?.addEventListener("input", (ev) => this._onNameInput(ev));
  }
};
customElements.define("unifi-device-card-editor", UnifiDeviceCardEditor);

// src/unifi-device-card.js
var VERSION = "0.0.0-dev.948eb70";
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
    this._deviceContext = null;
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
      this._deviceContext = null;
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
    if (this._loadedDeviceId === currentId && this._deviceContext) return;
    if (this._loading) return;
    this._loading = true;
    this._render();
    const token = ++this._loadToken;
    try {
      const ctx = await getDeviceContext(this._hass, currentId);
      if (token !== this._loadToken) return;
      this._deviceContext = ctx;
      this._loadedDeviceId = currentId;
      const numberedPorts = mergePortsWithLayout(ctx?.layout, discoverPorts(ctx?.entities || []));
      const specialPorts = mergeSpecialsWithLayout(ctx?.layout, discoverSpecialPorts(ctx?.entities || []));
      const first = specialPorts[0] || numberedPorts[0] || null;
      this._selectedKey = first?.key || null;
    } catch (err) {
      console.error("[unifi-device-card] Failed to load device context", err);
      if (token !== this._loadToken) return;
      this._deviceContext = null;
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
    if (!this._config?.device_id || !this._deviceContext) return `Version ${VERSION}`;
    const firmware = this._deviceContext?.firmware;
    const model = this._deviceContext?.layout?.displayModel || this._deviceContext?.model || "";
    return firmware ? `${model} \xB7 FW ${firmware}` : model;
  }
  _getThroughputEntities(port) {
    const entities = this._deviceContext?.entities || [];
    const portNum = port?.port;
    if (!portNum) return { rx: null, tx: null };
    const rx = entities.find((e) => {
      const id = e.entity_id.toLowerCase();
      return id.includes(`port_${portNum}`) && (id.includes("_rx") || id.includes("download") || id.includes("receive"));
    });
    const tx = entities.find((e) => {
      const id = e.entity_id.toLowerCase();
      return id.includes(`port_${portNum}`) && (id.includes("_tx") || id.includes("upload") || id.includes("transmit"));
    });
    return { rx: rx ? rx.entity_id : null, tx: tx ? tx.entity_id : null };
  }
  _getConnectedCount(allSlots) {
    return allSlots.filter((s) => isOn(this._hass, s.link_entity)).length;
  }
  _styles() {
    return `
      <style>
        :host {
          --udc-bg: #141820;
          --udc-surface: #1e2433;
          --udc-surface2: #252d3d;
          --udc-border: rgba(255,255,255,0.07);
          --udc-accent: #0090d9;
          --udc-accent-glow: rgba(0,144,217,0.2);
          --udc-green: #22c55e;
          --udc-orange: #f59e0b;
          --udc-text: #e2e8f0;
          --udc-text-muted: #4e5d73;
          --udc-text-dim: #8896a8;
          --udc-radius: 14px;
          --udc-radius-sm: 8px;
        }

        ha-card {
          background: var(--udc-bg) !important;
          color: var(--udc-text) !important;
          border: 1px solid var(--udc-border) !important;
          border-radius: var(--udc-radius) !important;
          overflow: hidden;
          font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
        }

        /* HEADER */
        .header {
          padding: 16px 18px 14px;
          background: linear-gradient(160deg, var(--udc-surface) 0%, var(--udc-bg) 100%);
          border-bottom: 1px solid var(--udc-border);
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
        }
        .header-info { display: grid; gap: 2px; min-width: 0; }
        .title {
          font-size: 1.05rem; font-weight: 700; letter-spacing: -0.02em;
          color: var(--udc-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .subtitle { font-size: 0.74rem; color: var(--udc-text-muted); }
        .stat-chip {
          display: flex; align-items: center; gap: 5px;
          background: var(--udc-surface2); border: 1px solid var(--udc-border);
          border-radius: 20px; padding: 4px 11px;
          font-size: 0.73rem; font-weight: 700; white-space: nowrap; flex-shrink: 0;
          color: var(--udc-text-dim);
        }
        .stat-chip .dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: var(--udc-green); box-shadow: 0 0 5px var(--udc-green);
          animation: blink 2.5s ease-in-out infinite;
        }
        @keyframes blink {
          0%,100% { opacity:1; box-shadow: 0 0 5px var(--udc-green); }
          50% { opacity:.5; box-shadow: 0 0 10px var(--udc-green); }
        }

        /* FRONT PANEL */
        .frontpanel {
          padding: 14px 18px 10px; display: grid; gap: 6px;
          background: var(--udc-surface); border-bottom: 1px solid var(--udc-border);
        }
        .panel-label {
          font-size: 0.64rem; font-weight: 700; letter-spacing: 0.1em;
          text-transform: uppercase; color: var(--udc-text-muted); margin-bottom: 2px;
        }
        .special-row { display: flex; gap: 5px; flex-wrap: wrap; margin-bottom: 4px; }
        .port-row { display: grid; gap: 4px; }
        .frontpanel.single-row .port-row,
        .frontpanel.gateway-single-row .port-row { grid-template-columns: repeat(8, minmax(0, 1fr)); }
        .frontpanel.dual-row .port-row { grid-template-columns: repeat(8, minmax(0, 1fr)); }
        .frontpanel.gateway-rack .port-row { grid-template-columns: repeat(8, minmax(0, 1fr)); }
        .frontpanel.gateway-compact .port-row { grid-template-columns: repeat(5, minmax(0, 1fr)); }
        .frontpanel.quad-row .port-row { grid-template-columns: repeat(12, minmax(0, 1fr)); }

        /* PORT */
        .port {
          border: 1px solid rgba(255,255,255,0.06); border-radius: 7px;
          min-height: 40px; cursor: pointer; font: inherit;
          display: grid; place-items: center; gap: 1px; padding: 3px 2px;
          background: var(--udc-bg); transition: all 0.13s ease;
          position: relative; overflow: hidden;
        }
        .port::after {
          content: ''; position: absolute; top: 0; left: 0; right: 0;
          height: 2px; background: transparent; transition: background 0.15s;
        }
        .port.up { background: rgba(34,197,94,0.06); border-color: rgba(34,197,94,0.25); }
        .port.up::after { background: var(--udc-green); }
        .port:hover { transform: translateY(-1px); border-color: rgba(0,144,217,0.35); background: rgba(0,144,217,0.07); }
        .port.selected {
          border-color: var(--udc-accent) !important;
          background: rgba(0,144,217,0.12) !important;
          box-shadow: 0 0 0 1px var(--udc-accent), inset 0 0 10px rgba(0,144,217,0.08);
        }
        .port.selected::after { background: var(--udc-accent) !important; }
        .port.has-poe.up::after { background: linear-gradient(90deg, var(--udc-green) 50%, var(--udc-orange)); }
        .port.special { min-height: 46px; border-radius: 9px; min-width: 58px; padding: 5px 9px; }

        .port-num { font-size: 10px; font-weight: 800; line-height: 1; color: var(--udc-text-muted); letter-spacing: 0.02em; }
        .port.up .port-num { color: var(--udc-text); }
        .port-icon { font-size: 8px; line-height: 1; color: var(--udc-text-muted); }
        .port.up .port-icon { color: var(--udc-green); }
        .port.has-poe.up .port-icon { color: var(--udc-orange); }

        /* DETAIL */
        .section { padding: 14px 18px 18px; display: grid; gap: 14px; }
        .detail-header {
          display: flex; align-items: center; justify-content: space-between;
          padding-bottom: 12px; border-bottom: 1px solid var(--udc-border); margin-bottom: 12px;
        }
        .detail-title { font-size: 0.92rem; font-weight: 700; letter-spacing: -0.01em; }
        .status-badge {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 3px 9px; border-radius: 20px; font-size: 0.7rem;
          font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase;
        }
        .status-badge.up { background: rgba(34,197,94,0.1); color: var(--udc-green); border: 1px solid rgba(34,197,94,0.2); }
        .status-badge.down { background: rgba(78,93,115,0.2); color: var(--udc-text-muted); border: 1px solid var(--udc-border); }

        .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px; }
        .detail-card {
          background: var(--udc-surface); border: 1px solid var(--udc-border);
          border-radius: var(--udc-radius-sm); padding: 9px 12px; display: grid; gap: 2px;
        }
        .dc-label { font-size: 0.65rem; font-weight: 600; letter-spacing: 0.07em; text-transform: uppercase; color: var(--udc-text-muted); }
        .dc-value { font-size: 0.87rem; font-weight: 700; color: var(--udc-text); }
        .dc-value.accent { color: var(--udc-accent); }
        .dc-value.poe-on { color: var(--udc-orange); }
        .dc-value.na { color: var(--udc-text-muted); font-weight: 400; }

        .throughput-row { display: flex; gap: 6px; margin-bottom: 10px; }
        .tput-chip {
          display: inline-flex; align-items: center; gap: 4px;
          background: var(--udc-surface2); border: 1px solid var(--udc-border);
          border-radius: 6px; padding: 3px 8px; font-size: 0.7rem; font-weight: 600; color: var(--udc-text-dim);
        }
        .tput-chip .arr { font-size: 8px; opacity: .6; }

        .actions { display: flex; gap: 7px; flex-wrap: wrap; }
        .action-btn {
          border: 1px solid var(--udc-border); border-radius: 7px;
          padding: 7px 14px; cursor: pointer; font: inherit;
          font-size: 0.8rem; font-weight: 600; transition: all 0.13s ease;
          display: inline-flex; align-items: center; gap: 5px;
        }
        .action-btn.primary { background: var(--udc-accent); color: white; border-color: var(--udc-accent); }
        .action-btn.primary:hover { background: #0077bb; box-shadow: 0 0 14px var(--udc-accent-glow); }
        .action-btn.secondary { background: var(--udc-surface2); color: var(--udc-text-dim); }
        .action-btn.secondary:hover { color: var(--udc-text); border-color: rgba(255,255,255,0.14); }

        .muted { color: var(--udc-text-muted); font-size: 0.875rem; }
        .loading-state {
          display: flex; align-items: center; gap: 10px;
          padding: 20px; color: var(--udc-text-muted); font-size: 0.875rem;
        }
        .spinner {
          width: 16px; height: 16px; flex-shrink: 0;
          border: 2px solid var(--udc-surface2); border-top-color: var(--udc-accent);
          border-radius: 50%; animation: spin .65s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .empty-state { padding: 24px 18px; color: var(--udc-text-muted); font-size: 0.875rem; text-align: center; line-height: 1.5; }
      </style>
    `;
  }
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
    const linkUp = isOn(this._hass, slot.link_entity);
    const hasPoe = Boolean(slot.power_cycle_entity);
    const poeOn = hasPoe && slot.poe_switch_entity ? isOn(this._hass, slot.poe_switch_entity) : false;
    const isSpecial = slot.kind === "special";
    const icon = poeOn ? "\u26A1" : linkUp ? "\u25B2" : "\u25CB";
    return `<button
        class="port ${isSpecial ? "special" : ""} ${linkUp ? "up" : "down"} ${selectedKey === slot.key ? "selected" : ""} ${hasPoe ? "has-poe" : ""}"
        data-key="${slot.key}"
        title="${slot.label}${linkUp ? " \xB7 Connected" : " \xB7 No link"}${hasPoe ? poeOn ? " \xB7 PoE ON" : " \xB7 PoE OFF" : ""}"
      ><div class="port-num">${slot.label}</div><div class="port-icon">${icon}</div></button>`;
  }
  _renderPanelAndDetail(title) {
    const ctx = this._deviceContext;
    const numberedPorts = mergePortsWithLayout(ctx?.layout, discoverPorts(ctx?.entities || []));
    const specialPorts = mergeSpecialsWithLayout(ctx?.layout, discoverSpecialPorts(ctx?.entities || []));
    const allSlots = [...specialPorts, ...numberedPorts];
    const selected = allSlots.find((p) => p.key === this._selectedKey) || allSlots[0] || null;
    const connectedCount = this._getConnectedCount(allSlots);
    const totalPorts = allSlots.length;
    const specialRow = specialPorts.length ? `<div class="special-row">${specialPorts.map((s) => this._renderPortButton(s, selected?.key)).join("")}</div>` : "";
    const layoutRows = (ctx?.layout?.rows || []).map((rowPorts) => {
      const items = rowPorts.map((portNumber) => {
        const slot = numberedPorts.find((p) => p.port === portNumber) || {
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
      const linkUp = isOn(this._hass, selected.link_entity);
      const linkText = getPortLinkText(this._hass, selected);
      const speedText = getPortSpeedText(this._hass, selected);
      const poeAvail = Boolean(selected.power_cycle_entity && selected.poe_switch_entity);
      const poeOn = poeAvail ? isOn(this._hass, selected.poe_switch_entity) : false;
      const poePower = selected.power_cycle_entity ? formatState(this._hass, selected.poe_power_entity, "\u2014") : "\u2014";
      const { rx, tx } = this._getThroughputEntities(selected);
      const rxVal = rx ? formatState(this._hass, rx, null) : null;
      const txVal = tx ? formatState(this._hass, tx, null) : null;
      const tputHtml = rxVal || txVal ? `<div class="throughput-row">
        ${rxVal ? `<div class="tput-chip"><span class="arr">\u2193</span>${rxVal}</div>` : ""}
        ${txVal ? `<div class="tput-chip"><span class="arr">\u2191</span>${txVal}</div>` : ""}
      </div>` : "";
      detail = `<div class="port-detail">
        <div class="detail-header">
          <div class="detail-title">${selected.kind === "special" ? selected.label : `Port ${selected.port}`}</div>
          <div class="status-badge ${linkUp ? "up" : "down"}">${linkUp ? "\u25CF Online" : "\u25CB Offline"}</div>
        </div>
        <div class="detail-grid">
          <div class="detail-card">
            <div class="dc-label">Link Status</div>
            <div class="dc-value">${linkText !== "\u2014" ? linkText : linkUp ? "Up" : "Down"}</div>
          </div>
          <div class="detail-card">
            <div class="dc-label">Geschwindigkeit</div>
            <div class="dc-value accent">${speedText}</div>
          </div>
          <div class="detail-card">
            <div class="dc-label">PoE</div>
            <div class="dc-value ${poeAvail ? poeOn ? "poe-on" : "" : "na"}">
              ${poeAvail ? stateValue(this._hass, selected.poe_switch_entity, "\u2014") : "Nicht verf\xFCgbar"}
            </div>
          </div>
          <div class="detail-card">
            <div class="dc-label">PoE Leistung</div>
            <div class="dc-value ${selected.power_cycle_entity ? "" : "na"}">
              ${selected.power_cycle_entity ? poePower : "Nicht verf\xFCgbar"}
            </div>
          </div>
        </div>
        ${tputHtml}
        <div class="actions">
          ${poeAvail ? `<button class="action-btn primary" data-action="toggle-poe" data-entity="${selected.poe_switch_entity}">\u26A1 PoE ${poeOn ? "Aus" : "Ein"}</button>` : ""}
          ${selected.power_cycle_entity ? `<button class="action-btn secondary" data-action="power-cycle" data-entity="${selected.power_cycle_entity}">\u21BA Power Cycle</button>` : ""}
        </div>
      </div>`;
    } else {
      detail = `<div class="muted">Keine Ports erkannt.</div>`;
    }
    this.shadowRoot.innerHTML = `${this._styles()}
      <ha-card>
        <div class="header">
          <div class="header-info">
            <div class="title">${title}</div>
            <div class="subtitle">${this._subtitle()}</div>
          </div>
          <div class="stat-chip"><div class="dot"></div>${connectedCount}/${totalPorts}</div>
        </div>
        <div class="frontpanel ${ctx?.layout?.frontStyle || "single-row"}">
          <div class="panel-label">Front Panel</div>
          ${specialRow}
          ${layoutRows.join("") || `<div class="muted" style="padding:8px 0">Keine Ports erkannt.</div>`}
        </div>
        <div class="section">${detail}</div>
      </ha-card>`;
    this.shadowRoot.querySelectorAll(".port").forEach((btn) => btn.addEventListener("click", () => this._selectKey(btn.dataset.key)));
    this.shadowRoot.querySelectorAll("[data-action='toggle-poe']").forEach((btn) => btn.addEventListener("click", async () => await this._toggleEntity(btn.dataset.entity)));
    this.shadowRoot.querySelectorAll("[data-action='power-cycle']").forEach((btn) => btn.addEventListener("click", async () => await this._pressButton(btn.dataset.entity)));
  }
  _render() {
    const title = this._config?.name || "UniFi Device Card";
    if (!this._config?.device_id) {
      this._renderEmpty(title);
      return;
    }
    if (this._loading) {
      this.shadowRoot.innerHTML = `${this._styles()}<ha-card>
        <div class="header"><div class="header-info"><div class="title">${title}</div><div class="subtitle">${this._subtitle()}</div></div></div>
        <div class="loading-state"><div class="spinner"></div>Lade Ger\xE4tedaten\u2026</div>
      </ha-card>`;
      return;
    }
    if (!this._deviceContext) {
      this.shadowRoot.innerHTML = `${this._styles()}<ha-card>
        <div class="header"><div class="header-info"><div class="title">${title}</div><div class="subtitle">${this._subtitle()}</div></div></div>
        <div class="empty-state">Keine Ger\xE4tedaten verf\xFCgbar.</div>
      </ha-card>`;
      return;
    }
    this._renderPanelAndDetail(title);
  }
};
customElements.define("unifi-device-card", UnifiDeviceCard);
window.customCards = window.customCards || [];
window.customCards.push({ type: "unifi-device-card", name: "UniFi Device Card", description: "A Lovelace card for UniFi switches and gateways." });
