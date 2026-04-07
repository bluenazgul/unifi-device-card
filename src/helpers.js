// ==============================
// HELPERS
// ==============================

export const lower = (v) => (v || "").toString().toLowerCase();

export function formatBits(value) {
  if (value === undefined || value === null) return "-";
  const units = ["bps", "Kbps", "Mbps", "Gbps"];
  let i = 0;
  let val = Number(value);
  while (val >= 1000 && i < units.length - 1) {
    val /= 1000;
    i++;
  }
  return `${val.toFixed(1)} ${units[i]}`;
}

// ==============================
// PORT NUMBER DETECTION (FIXED)
// ==============================

export function extractPortNumber(entity) {
  const id = entity.entity_id || "";
  const originalName = entity.original_name || "";
  const name = entity.name || "";

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

// ==============================
// ENTITY CLASSIFICATION (FIXED)
// ==============================

export function classifyPortEntity(entity, isSpecial = false) {
  const id = lower(entity.entity_id);
  const eid = entity.entity_id || "";
  const tk = entity.translation_key || "";

  // Power cycle
  if (
    eid.startsWith("button.") &&
    (id.includes("power_cycle") || tk === "power_cycle" || id.includes("_restart") || id.includes("_reboot"))
  ) return "power_cycle_entity";

  // PoE switch
  if (eid.startsWith("switch.") && id.includes("_port_") && id.endsWith("_poe")) {
    return "poe_switch_entity";
  }

  // Port switch
  if (eid.startsWith("switch.") && id.includes("_port_") && !id.endsWith("_poe")) {
    return "port_switch_entity";
  }

  // Link detection (FIXED)
  if (eid.startsWith("binary_sensor.")) {
    if (id.includes("_port_")) return "link_entity";

    if (
      isSpecial &&
      (id.includes("_wan") || id.includes("_sfp") || id.includes("_uplink") ||
       id.includes("_connected") || id.includes("_link") || tk === "port_link")
    ) return "link_entity";
  }

  // Sensors
  if (eid.startsWith("sensor.")) {
    if (id.includes("_port_")) {
      if (id.endsWith("_rx") || id.includes("_rx_") || tk === "port_bandwidth_rx") return "rx_entity";
      if (id.endsWith("_tx") || id.includes("_tx_") || tk === "port_bandwidth_tx") return "tx_entity";

      if (
        id.includes("link_speed") ||
        id.includes("_ethernet_speed") ||
        id.includes("_negotiated_speed") ||
        tk === "port_link_speed"
      ) {
        return "speed_entity";
      }

      if (id.includes("_poe_power") || tk === "poe_power") {
        return "poe_power_entity";
      }
    }

    // Special ports (WAN/SFP)
    if (
      isSpecial &&
      (id.includes("_wan") || id.includes("_sfp") || id.includes("_uplink"))
    ) {
      if (id.includes("download") || id.includes("_rx")) return "rx_entity";
      if (id.includes("upload") || id.includes("_tx")) return "tx_entity";
      if (id.includes("link_speed") || tk === "port_link_speed") return "speed_entity";
    }
  }

  return null;
}

// ==============================
// DEVICE TYPE DETECTION
// ==============================

export function getDeviceType(device) {
  const model = lower(device.model || "");
  const name = lower(device.name || "");

  if (model.includes("udm") || name.includes("dream")) return "udm";
  if (model.includes("uxg")) return "gateway";
  if (model.includes("usg")) return "gateway";
  if (model.includes("usw") || model.includes("switch")) return "switch";

  return "unknown";
}

// ==============================
// POE HELPERS
// ==============================

export function hasPoeCapability(portNumber, modelConfig) {
  if (!modelConfig || !modelConfig.poePortRange) return false;

  const [start, end] = modelConfig.poePortRange;
  return portNumber >= start && portNumber <= end;
}

// ==============================
// GROUPING
// ==============================

export function groupPorts(entities, modelConfig) {
  const ports = {};

  for (const entity of entities) {
    const port = extractPortNumber(entity);
    if (!port) continue;

    if (!ports[port]) {
      ports[port] = {
        port,
        link: null,
        poe: null,
        speed: null,
        rx: null,
        tx: null,
        power: null
      };
    }

    const type = classifyPortEntity(entity);

    if (!type) continue;

    ports[port][type.replace("_entity", "")] = entity;
  }

  return ports;
}
