import assert from "node:assert/strict";

import { classifyDeviceType } from "../src/classify.js";
import { getDeviceContext, getUnifiDevices } from "../src/helpers.js";
import {
  buildNormalizedDeviceIdentity,
  findDeviceByMac,
} from "../src/identity.js";

const parentId = "unifi-switch-parent";
const child = {
  id: "child-client-or-logical-part",
  parent_device_id: parentId,
  config_entry_id: "unifi-config-entry",
  name: "Child device",
  identifiers: [["unifi", "aa:bb:cc:dd:ee:ff"]],
};

const identity = buildNormalizedDeviceIdentity(child);
assert.equal(identity.parent_device_id, parentId);
assert.equal(identity.is_child_device, true);
assert.equal(
  classifyDeviceType(
    identity,
    { ports: true, port_control: true, poe_power: true },
    [
      {
        entity_id: "switch.child_port_1",
        translation_key: "port_control",
      },
    ],
    child
  ),
  "unknown",
  "Home Assistant child devices must never be classified as standalone UniFi infrastructure"
);

const physicalDevice = {
  id: "physical-unifi-device",
  connections: [["mac", "aa:bb:cc:dd:ee:ff"]],
};

assert.equal(
  findDeviceByMac([child, physicalDevice], "aa:bb:cc:dd:ee:ff")?.id,
  physicalDevice.id,
  "MAC lookup must prefer/return a physical device and skip child devices"
);

for (const [model_id, capabilities] of [
  ["U7PRO", {}],
  ["UDB", { ports: true }],
]) {
  assert.equal(
    classifyDeviceType(
      buildNormalizedDeviceIdentity({
        model_id,
        model: "UniFi Access Point",
        name: "Office Ceiling",
      }),
      capabilities
    ),
    "access_point",
    `${model_id} must be classified from its stable model identifier`
  );
}

const registeredDevice = {
  id: parentId,
  name: "Office switch",
  config_entry_id: child.config_entry_id,
  config_subentry_id: null,
  connections: [["mac", "aa:bb:cc:dd:ee:ff"]],
};
// Future registry responses omit these fields. Getters also catch accidental
// reads while testing identity normalization and both discovery entry points.
for (const field of ["config_entries", "config_entries_subentries", "primary_config_entry"]) {
  Object.defineProperty(registeredDevice, field, {
    get() {
      throw new Error(`Deprecated device-registry field read: ${field}`);
    },
  });
}

const modernIdentity = buildNormalizedDeviceIdentity(registeredDevice);
assert.equal(modernIdentity.config_entry_id, child.config_entry_id);
assert.equal(modernIdentity.config_subentry_id, null);

const otherDevice = {
  id: "other-integration-device",
  name: "Other device",
  config_entry_id: "other-config-entry",
};
const legacyDevice = {
  id: "legacy-only-device",
  name: "Legacy switch",
  config_entries: [child.config_entry_id],
};
const registryEntities = [registeredDevice, child, otherDevice, legacyDevice].map((device) => ({
  device_id: device.id,
  entity_id: `switch.${device.id.replaceAll("-", "_")}_port_1`,
  translation_key: "port_control",
}));
const hass = {
  states: {},
  async callWS(message) {
    if (message.type === "config/device_registry/list") {
      return [registeredDevice, child, otherDevice, legacyDevice];
    }
    if (message.type === "config/entity_registry/list") return registryEntities;
    if (message.type === "config/config_entries") {
      return [
        { entry_id: child.config_entry_id, domain: "unifi" },
        { entry_id: otherDevice.config_entry_id, domain: "other" },
      ];
    }
    throw new Error(`Unexpected WS call: ${message.type}`);
  },
};

assert.deepEqual(
  (await getUnifiDevices(hass)).map((device) => device.id),
  [parentId],
  "editor discovery must use config_entry_id without including children, unrelated devices, or legacy-only matches"
);
const context = await getDeviceContext(hass, parentId);
assert.equal(context?.type, "switch");
assert.equal(context?.identity.config_entry_id, child.config_entry_id);
assert.equal(await getDeviceContext(hass, child.id), null);
assert.equal(await getDeviceContext(hass, legacyDevice.id), null);

console.log("Child-device registry compatibility checks passed.");
