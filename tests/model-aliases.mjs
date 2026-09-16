import assert from "node:assert/strict";

import { classifyDeviceType } from "../src/classify.js";
import {
  getDeviceContext,
  mergePortsWithLayout,
  mergeSpecialsWithLayout,
} from "../src/helpers.js";
import {
  getDeviceLayout,
  getFakeDevices,
  MODEL_REGISTRY,
  resolveModelKey,
} from "../src/model-registry.js";

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
    apUplinkPort: 4,
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

for (const identifier of ["UGW4", "USG-PRO", "USG-PRO-4", "USG Pro 4"]) {
  const usgPro = {
    model_id: identifier,
    model: "UniFi Security Gateway",
    name: "Gateway",
  };

  assert.equal(
    resolveModelKey(usgPro),
    "UGW4",
    `${identifier} must resolve to the canonical aiounifi UGW4 registry entry`
  );
  assert.equal(classifyDeviceType(usgPro), "gateway");
  assert.equal(
    getDeviceLayout(usgPro).displayModel,
    "USG Pro 4",
    `${identifier} must use the existing six-port USG Pro 4 layout`
  );
}

assert.equal(
  resolveModelKey({ model_id: "S40Lite" }),
  null,
  "The unrelated S40Lite identifier must not resolve to a UniFi Dream Machine"
);

const u7ProXg = { model_id: "UAPA6A9" };

assert.equal(
  resolveModelKey(u7ProXg),
  "U7PROXG",
  "Home Assistant's UAPA6A9 identifier must resolve to the U7 Pro XG registry entry"
);
assert.equal(
  getDeviceLayout(u7ProXg).displayModel,
  "U7 Pro XG",
  "UAPA6A9 must display the U7 Pro XG product name"
);

for (const identifier of ["UDB-S", "UDBS", "Device Bridge Switch"]) {
  const deviceBridgeSwitch = { model_id: identifier };

  assert.equal(
    resolveModelKey(deviceBridgeSwitch),
    "UDBS",
    `${identifier} must resolve to the aiounifi UDB-S model identifier`
  );
  assert.equal(
    classifyDeviceType(deviceBridgeSwitch),
    "switch",
    `${identifier} must be classified as a switch rather than an access point`
  );
  assert.deepEqual(
    getDeviceLayout(deviceBridgeSwitch).rows,
    [[1, 2, 3, 4, 5, 6, 7, 8]],
    `${identifier} must expose the Device Bridge Switch's eight switch ports`
  );
  assert.deepEqual(
    getDeviceLayout(deviceBridgeSwitch).poePortRange,
    [1, 8],
    `${identifier} must expose PoE+ on all eight switch ports`
  );
  assert.deepEqual(
    getDeviceLayout(deviceBridgeSwitch).specialSlots,
    [],
    `${identifier} must not reserve a wired port for its wireless uplink`
  );
}

assert.equal(
  MODEL_REGISTRY.UDBSWITCH,
  MODEL_REGISTRY.UDBS,
  "The legacy fake:UDBSWITCH preview ID must use the corrected UDBS switch model"
);
assert.equal(MODEL_REGISTRY.UDBSWITCH.kind, "switch");
assert.equal(MODEL_REGISTRY.UDBSWITCH.portCount, 8);
const legacyFakeDevice = await getDeviceContext(
  {},
  "fake:UDBSWITCH",
  { fake_device: true }
);
assert.equal(legacyFakeDevice?.type, "switch");
assert.equal(legacyFakeDevice?.layout.portCount, 8);
assert.deepEqual(legacyFakeDevice?.layout.poePortRange, [1, 8]);
assert.equal(
  getFakeDevices().filter((device) => device.id === "fake:UDBS").length,
  1,
  "The legacy alias must not add a duplicate fake-device picker entry"
);

console.log("Model alias compatibility checks passed.");
