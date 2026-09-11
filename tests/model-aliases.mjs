import assert from "node:assert/strict";

import { classifyDeviceType } from "../src/classify.js";
import { mergePortsWithLayout, mergeSpecialsWithLayout } from "../src/helpers.js";
import { getDeviceLayout, resolveModelKey } from "../src/model-registry.js";

const inWallHd = {
  model_id: "UHDIW",
  model: "UniFi Access Point",
  name: "IW HD",
};

assert.equal(
  resolveModelKey(inWallHd),
  "UAPIWHD",
  "Home Assistant's UHDIW identifier must resolve to the UAP In-Wall HD registry entry"
);

assert.equal(
  classifyDeviceType(inWallHd, { ports: true }),
  "access_point",
  "UHDIW must remain an access point when integrated ports are its only detected capability"
);

assert.deepEqual(
  getDeviceLayout(inWallHd),
  {
    kind: "access_point",
    frontStyle: "ap-in-wall",
    rows: [[1, 2, 3]],
    portCount: 4,
    displayModel: "UAP In-Wall HD",
    theme: "white",
    specialSlots: [{ key: "uplink", label: "Uplink / PoE-In", port: 4, media: "rj45" }],
    poePortRange: [1, 1],
    supportsIntegratedPorts: true,
    modelKey: "UAPIWHD",
    rj45_odd_even: false,
  },
  "UHDIW must retain the UAP In-Wall HD layout and integrated-port support"
);

const layout = getDeviceLayout(inWallHd);
const discoveredPorts = [1, 2, 3, 4].map((port) => ({
  key: `port-${port}`,
  port,
  label: String(port),
  poe_switch_entity: `switch.iw_hd_data_${port}_poe`,
  poe_power_entity: `sensor.iw_hd_data_${port}_poe_power`,
  power_cycle_entity: `button.iw_hd_data_${port}_power_cycle`,
}));
const mergedPorts = mergePortsWithLayout(layout, discoveredPorts);
const mergedSpecials = mergeSpecialsWithLayout(layout, [], discoveredPorts);

assert.deepEqual(
  mergedPorts.map((port) => port.port),
  [1, 2, 3],
  "Ports 1 through 3 must remain numbered LAN ports"
);
assert.equal(mergedPorts[0].poe_switch_entity, "switch.iw_hd_data_1_poe");
assert.equal(mergedPorts[0].poe_power_entity, "sensor.iw_hd_data_1_poe_power");
for (const port of mergedPorts.slice(1)) {
  assert.equal(port.poe_switch_entity, null, `Port ${port.port} must not expose PoE output controls`);
  assert.equal(port.poe_power_entity, null, `Port ${port.port} must not expose PoE output power`);
}
assert.equal(mergedSpecials.length, 1);
assert.equal(mergedSpecials[0].key, "uplink");
assert.equal(mergedSpecials[0].port, 4);
assert.equal(mergedSpecials[0].label, "Uplink / PoE-In");
assert.equal(mergedSpecials[0].media, "rj45");
assert.equal(mergedSpecials[0].poe_switch_entity, null);
assert.equal(mergedSpecials[0].poe_power_entity, null);
assert.equal(mergedSpecials[0].power_cycle_entity, null);

console.log("Model alias compatibility checks passed.");
