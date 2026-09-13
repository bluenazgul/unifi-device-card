import assert from "node:assert/strict";

import {
  getDefaultPort,
  getDefaultPortCandidates,
  resolveDisplayPort,
} from "../src/helpers.js";

const ports = [
  { key: "port_9", connected: false },
  { key: "port_10", connected: true },
  { key: "port_1", connected: true },
];
const uplinks = ports.slice(0, 2);

assert.equal(
  getDefaultPort(ports, uplinks, "auto", (port) => port.connected)?.key,
  "port_10",
  "automatic selection should prefer a connected uplink"
);
assert.equal(
  getDefaultPort(ports, uplinks, "auto", () => false)?.key,
  "port_9",
  "automatic selection should fall back to the first uplink"
);
assert.equal(
  getDefaultPort(ports, uplinks, "port_10", () => false)?.key,
  "port_10",
  "manual selection should use the configured uplink"
);
assert.equal(
  getDefaultPort(ports, uplinks, "", (port) => port.connected)?.key,
  "port_9",
  "an unset preference should preserve the legacy first-port behavior"
);
assert.equal(
  getDefaultPort(ports, uplinks, "port_1", () => true)?.key,
  "port_9",
  "manual selection should be restricted to uplink ports"
);
assert.equal(getDefaultPort([], [], "auto", () => true), null, "an empty port list should not select a port");

const integratedPorts = [
  { key: "port_1", connected: false },
  { key: "port_2", connected: true },
];
assert.deepEqual(
  getDefaultPortCandidates(
    "access_point",
    { supportsIntegratedPorts: true },
    [],
    integratedPorts
  ),
  integratedPorts,
  "an access point with an integrated switch should offer its numbered ports"
);
assert.equal(
  getDefaultPort(integratedPorts, integratedPorts, "port_2", () => false)?.key,
  "port_2",
  "an integrated access point should support a manually selected initial port"
);
const inWallUplink = { key: "uplink", port: 4, connected: true };
assert.equal(
  getDefaultPortCandidates(
    "access_point",
    { supportsIntegratedPorts: true, apUplinkPort: 4 },
    [inWallUplink],
    integratedPorts
  )[0],
  inWallUplink,
  "a known PoE-in port should be the first default candidate for an integrated AP"
);

const apPorts = [
  { key: "port_2", port: 2, connected: true },
  { key: "port_1", port: 1, connected: true },
];
const apCandidates = getDefaultPortCandidates(
  "access_point",
  { supportsApPortPanel: true, apUplinkPort: 1 },
  [],
  apPorts
);
assert.deepEqual(apCandidates.map((port) => port.port), [1, 2]);
assert.equal(
  getDefaultPort(apCandidates, apCandidates, "auto", (port) => port.connected)?.port,
  1,
  "a PoE-only multi-port AP should prefer its declared PoE-in uplink"
);
assert.deepEqual(
  getDefaultPortCandidates("switch", {}, uplinks, integratedPorts),
  uplinks,
  "switches should continue to restrict the setting to designated uplinks"
);

const demotedUplink = { key: "sfp_1", port: 9 };
const displayPorts = [
  { key: "port-9", port: 9 },
  { key: "port_1", port: 1 },
];
assert.equal(
  resolveDisplayPort(demotedUplink, displayPorts)?.key,
  "port-9",
  "a demoted uplink should resolve to its normalized display key"
);

console.log("Default port selection tests passed.");
