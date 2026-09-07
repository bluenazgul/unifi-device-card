import assert from "node:assert/strict";

import { applyLagGroups, normalizeLagGroups } from "../src/helpers.js";

assert.deepEqual(
  normalizeLagGroups([{ name: " NAS ", ports: [12, 11, 11, 0, "invalid"] }]),
  [{ name: "NAS", ports: [11, 12] }],
  "LAG groups should normalize names and unique positive port numbers"
);

assert.deepEqual(
  normalizeLagGroups([
    { ports: [1, 2] },
    { name: "Duplicate", ports: [2, 3] },
    { name: "Second", ports: [3, 4] },
  ]),
  [
    { name: "LAG 1", ports: [1, 2] },
    { name: "Second", ports: [3, 4] },
  ],
  "a port should only belong to the first valid configured group"
);

assert.deepEqual(normalizeLagGroups(null), [], "non-array configuration should be ignored");
assert.deepEqual(normalizeLagGroups([{ name: "Solo", ports: [1] }]), [], "single-port groups should be ignored");

const slots = applyLagGroups(
  {
    specials: [{ port: 10, key: "sfp_1" }],
    numbered: [{ port: 1, key: "port-1" }, { port: 2, key: "port-2" }, { port: 3, key: "port-3" }],
  },
  [{ name: "NAS", ports: [1, 2] }]
);

assert.equal(slots.numbered[0].lag_group.name, "NAS");
assert.deepEqual(slots.numbered[1].lag_group.ports, [1, 2]);
assert.equal(slots.numbered[2].lag_group, undefined);
assert.equal(slots.specials[0].lag_group, undefined);

console.log("LAG group tests passed.");
