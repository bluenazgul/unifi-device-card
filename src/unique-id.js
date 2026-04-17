import { normalizeMac } from "./identity.js";

// unique_id parsers:
// - port-scoped UniFi entities (port-<mac>_<n>, power_cycle-<mac>_<n>, ...)
// - device-scoped UniFi entities (device_restart-<mac>, device_uplink_mac-<mac>, ...)
// - object-scoped UniFi entities (wlan-*, firewall_policy-*, ...)

const PORT_FEATURE_PREFIXES = {
  port: "port_control",
  power_cycle: "power_cycle",
  poe_power: "poe_power",
  port_rx: "port_rx",
  port_tx: "port_tx",
  port_bandwidth_rx: "port_rx",
  port_bandwidth_tx: "port_tx",
  port_link_speed: "link_speed",
};

const DEVICE_FEATURE_PREFIXES = {
  device_restart: "restart",
  device_uplink_mac: "uplink_mac",
  rx: "client_rx",
  tx: "client_tx",
  wired_speed: "client_link_speed",
};

export function parseUnifiPortUniqueId(uniqueId) {
  const raw = String(uniqueId ?? "").trim().toLowerCase();
  if (!raw) return null;

  const match = raw.match(/^([a-z0-9_]+)-([0-9a-f:]{17}|[0-9a-f]{12})_(\d+)$/i);
  if (!match) return null;

  const [, prefix, macRaw, portRaw] = match;
  const feature = PORT_FEATURE_PREFIXES[prefix] || null;
  const mac = normalizeMac(macRaw);
  const port = Number.parseInt(portRaw, 10);

  if (!feature || !mac || !Number.isInteger(port)) return null;
  return { feature, mac, port };
}

export function parseUnifiDeviceUniqueId(uniqueId) {
  const raw = String(uniqueId ?? "").trim().toLowerCase();
  if (!raw) return null;

  const match = raw.match(/^([a-z0-9_]+)-([0-9a-f:]{17}|[0-9a-f]{12})$/i);
  if (!match) return null;

  const [, prefix, macRaw] = match;
  const feature = DEVICE_FEATURE_PREFIXES[prefix] || null;
  const mac = normalizeMac(macRaw);
  if (!feature || !mac) return null;

  return { feature, mac };
}

export function parseUnifiObjectUniqueId(uniqueId) {
  const raw = String(uniqueId ?? "").trim().toLowerCase();
  if (!raw) return null;

  const match = raw.match(/^(wlan|qr_code|regenerate_password|firewall_policy)-(.+)$/i);
  if (!match) return null;

  const [, prefix, objectId] = match;
  const featureMap = {
    wlan: "wlan_control",
    qr_code: "wlan_qr_code",
    regenerate_password: "wlan_regenerate_password",
    firewall_policy: "firewall_policy",
  };
  return {
    feature: featureMap[prefix] || null,
    object_id: objectId || null,
  };
}
