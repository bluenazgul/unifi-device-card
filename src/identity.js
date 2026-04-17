// Identity helpers:
// - normalize MACs
// - extract primary MAC from HA device connections
// - build canonical device identity object used across the card

function normalizeText(value) {
  return String(value ?? "").trim();
}

export function normalizeMac(value) {
  const raw = String(value ?? "")
    .toLowerCase()
    .replace(/[^0-9a-f]/g, "");
  if (raw.length !== 12) return null;
  return raw.match(/.{1,2}/g)?.join(":") || null;
}

export function extractFirstMac(value) {
  const text = String(value ?? "");
  const match = text.match(/(?:[0-9a-f]{2}[:-]){5}[0-9a-f]{2}|[0-9a-f]{12}/i);
  if (!match) return null;
  return normalizeMac(match[0]);
}

export function sameMac(a, b) {
  const left = normalizeMac(a);
  const right = normalizeMac(b);
  return !!left && !!right && left === right;
}

export function extractPrimaryMacFromConnections(connections) {
  if (!Array.isArray(connections)) return null;

  for (const entry of connections) {
    if (!Array.isArray(entry) || entry.length < 2) continue;
    const [type, value] = entry;
    const key = String(type ?? "").toLowerCase();
    if (key !== "mac") continue;
    const mac = extractFirstMac(value);
    if (mac) return mac;
  }

  for (const entry of connections) {
    if (!Array.isArray(entry) || entry.length < 2) continue;
    const mac = extractFirstMac(entry[1]);
    if (mac) return mac;
  }

  return null;
}

export function buildNormalizedDeviceIdentity(device) {
  return {
    device_id: device?.id || null,
    model: normalizeText(device?.model),
    manufacturer: normalizeText(device?.manufacturer),
    name: normalizeText(device?.name_by_user || device?.name),
    hw_version: normalizeText(device?.hw_version),
    sw_version: normalizeText(device?.sw_version),
    primary_mac: extractPrimaryMacFromConnections(device?.connections),
    config_entries: Array.isArray(device?.config_entries) ? device.config_entries : [],
  };
}

function extractDeviceMacs(device) {
  const macs = new Set();
  const candidates = [device?.connections, device?.identifiers];

  for (const block of candidates) {
    if (!Array.isArray(block)) continue;
    for (const entry of block) {
      if (!Array.isArray(entry) || entry.length < 2) continue;
      const [, value] = entry;
      const mac = extractFirstMac(value);
      if (mac) macs.add(mac);
    }
  }

  const primaryMac = extractPrimaryMacFromConnections(device?.connections);
  if (primaryMac) macs.add(primaryMac);

  return macs;
}

export function findDeviceByMac(devices, mac) {
  const normalized = normalizeMac(mac);
  if (!normalized) return null;

  for (const device of devices || []) {
    const macs = extractDeviceMacs(device);
    if (macs.has(normalized)) return device;
  }
  return null;
}

export function findEntitiesByMac(entities, mac) {
  const normalized = normalizeMac(mac);
  if (!normalized) return [];
  return (entities || []).filter((entity) => {
    const uniqueIdMac = extractFirstMac(entity?.unique_id);
    return uniqueIdMac === normalized;
  });
}
