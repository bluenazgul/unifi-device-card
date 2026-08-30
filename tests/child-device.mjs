import assert from "node:assert/strict";

import { classifyDeviceType } from "../src/classify.js";
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

console.log("Child-device registry compatibility checks passed.");
