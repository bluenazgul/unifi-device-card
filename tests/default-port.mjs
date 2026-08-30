import assert from "node:assert/strict";

import { getDefaultPort, resolveDisplayPort } from "../src/helpers.js";

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
