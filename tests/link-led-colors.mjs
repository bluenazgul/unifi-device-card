import assert from "node:assert/strict";

import { getLinkLedClass, normalizeLinkLedColor } from "../src/helpers.js";

assert.equal(getLinkLedClass(10, true), "speed-10-100", "10 Mbps should use the low-speed color class");
assert.equal(getLinkLedClass(100, true), "speed-10-100", "100 Mbps should use the low-speed color class");
assert.equal(getLinkLedClass(1000, true), "speed-1000", "1 GbE should use the gigabit color class");
assert.equal(getLinkLedClass(2500, true), "speed-2-5g", "2.5 GbE should use the multi-gig color class");
assert.equal(getLinkLedClass(5000, true), "speed-10g", "5 GbE should use the high-speed color class");
assert.equal(getLinkLedClass(10000, true), "speed-10g", "10 GbE should use the high-speed color class");
assert.equal(getLinkLedClass(null, true), "speed-1000", "missing speed telemetry should preserve the green fallback");
assert.equal(getLinkLedClass(10000, false), "off", "a disconnected port should keep its LED off");

assert.equal(normalizeLinkLedColor(" blue "), "blue", "CSS color words should be accepted");
assert.equal(normalizeLinkLedColor("#12aBcD"), "#12aBcD", "hex colors should be accepted");
assert.equal(normalizeLinkLedColor("rgb(1, 2, 3)"), null, "unsupported CSS expressions should be rejected");
assert.equal(normalizeLinkLedColor("red; color: blue"), null, "style injection should be rejected");
