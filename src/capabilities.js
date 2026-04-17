import { parseUnifiDeviceUniqueId, parseUnifiObjectUniqueId, parseUnifiPortUniqueId } from "./unique-id.js";
import { sameMac } from "./identity.js";

// Capability builder:
// converts raw entity-registry entries into a per-device capability map
// with active/disabled/hidden counters for diagnostics and rendering decisions.

function emptyBucket() {
  return { active: 0, disabled: 0, hidden: 0 };
}

function statusKey(entity) {
  if (entity?.disabled_by) return "disabled";
  if (entity?.hidden_by) return "hidden";
  return "active";
}

function inferCapability(entity, identity) {
  const domain = String(entity?.entity_id || "").split(".")[0] || "";
  const tk = String(entity?.translation_key || "").toLowerCase();
  const uniqueId = entity?.unique_id || "";

  const portInfo = parseUnifiPortUniqueId(uniqueId);
  if (portInfo && sameMac(portInfo.mac, identity?.primary_mac)) {
    if (portInfo.feature === "port_control") return "port_control";
    if (portInfo.feature === "power_cycle") return "power_cycle";
    if (portInfo.feature === "poe_power") return "poe_power";
    if (portInfo.feature === "port_rx") return "port_rx";
    if (portInfo.feature === "port_tx") return "port_tx";
    if (portInfo.feature === "link_speed") return "link_speed";
  }

  const deviceInfo = parseUnifiDeviceUniqueId(uniqueId);
  if (deviceInfo && sameMac(deviceInfo.mac, identity?.primary_mac)) {
    if (deviceInfo.feature === "uplink_mac") return "uplink_mac";
    if (deviceInfo.feature === "restart") return "restart";
    if (deviceInfo.feature === "client_rx") return "client_rx";
    if (deviceInfo.feature === "client_tx") return "client_tx";
    if (deviceInfo.feature === "client_link_speed") return "link_speed";
  }

  const objectInfo = parseUnifiObjectUniqueId(uniqueId);
  if (objectInfo?.feature === "wlan_control" || tk === "wlan_control") return "wlan_control";
  if (objectInfo?.feature === "firewall_policy" || tk === "firewall_policy_control") {
    return "firewall_policy";
  }

  if (domain === "button" && (tk === "restart" || tk === "reboot" || tk === "power_cycle")) {
    return tk === "power_cycle" ? "power_cycle" : "restart";
  }
  if (domain === "sensor" && tk === "port_bandwidth_rx") return "port_rx";
  if (domain === "sensor" && tk === "port_bandwidth_tx") return "port_tx";
  if (domain === "sensor" && tk === "client_bandwidth_rx") return "client_rx";
  if (domain === "sensor" && tk === "client_bandwidth_tx") return "client_tx";
  if (domain === "sensor" && (tk === "port_link_speed" || tk === "link_speed")) return "link_speed";
  if (domain === "sensor" && (tk === "poe_power" || tk === "port_poe_power" || tk === "poe_power_consumption")) {
    return "poe_power";
  }
  if (domain === "switch" && tk === "poe_port_control") return "port_control";
  if (domain === "sensor" && tk === "device_uplink_mac") return "uplink_mac";

  return null;
}

export function buildDeviceCapabilities(entities, identity) {
  const counts = {
    restart: emptyBucket(),
    ports: emptyBucket(),
    port_control: emptyBucket(),
    power_cycle: emptyBucket(),
    poe_power: emptyBucket(),
    port_rx: emptyBucket(),
    port_tx: emptyBucket(),
    client_rx: emptyBucket(),
    client_tx: emptyBucket(),
    link_speed: emptyBucket(),
    uplink_mac: emptyBucket(),
    ap_stats: emptyBucket(),
    led_control: emptyBucket(),
    wlan_control: emptyBucket(),
    firewall_policy: emptyBucket(),
  };

  for (const entity of entities || []) {
    const status = statusKey(entity);
    const cap = inferCapability(entity, identity);

    if (cap && counts[cap]) counts[cap][status] += 1;

    const portInfo = parseUnifiPortUniqueId(entity?.unique_id || "");
    if (portInfo && (!identity?.primary_mac || sameMac(portInfo.mac, identity?.primary_mac))) {
      counts.ports[status] += 1;
    }

    const id = String(entity?.entity_id || "").toLowerCase();
    if (id.startsWith("light.") && (id.includes("led") || String(entity?.translation_key || "").includes("led"))) {
      counts.led_control[status] += 1;
    }
    if (id.startsWith("sensor.") && (id.includes("_clients") || id.includes("_uptime"))) {
      counts.ap_stats[status] += 1;
    }
  }

  const out = { counts };
  for (const [key, bucket] of Object.entries(counts)) {
    out[key] = (bucket.active + bucket.disabled + bucket.hidden) > 0;
  }
  return out;
}
