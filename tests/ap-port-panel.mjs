import assert from "node:assert/strict";

import { classifyDeviceType } from "../src/classify.js";
import {
  discoverPorts,
  isApPortPanelAvailable,
  mergePortsWithLayout,
  supportsDeviceLayoutModes,
} from "../src/helpers.js";
import { getDeviceLayout, resolveModelKey } from "../src/model-registry.js";

const mac = "80:2a:a8:00:01:02";
const realisticPortEntities = (ports) => ports.flatMap(({ port, name }) => [
  {
    entity_id: `sensor.test_port_${port}_link_speed`,
    unique_id: `port_link_speed-${mac}_${port}`,
    translation_key: "port_link_speed",
    translation_placeholders: { port_name: name },
    original_name: `${name} link speed`,
  },
  {
    entity_id: `sensor.test_port_${port}_rx`,
    unique_id: `port_bandwidth_rx-${mac}_${port}`,
    translation_key: "port_bandwidth_rx",
  },
]);

const supportedModels = [
  "U7PG2",
  "U7HD",
  "UAPSHD",
  "UCXG",
  "UAPA6A4",
  "U7ENT",
  "UAPA6B1",
];

for (const model_id of supportedModels) {
  const device = { model_id, model: "UniFi Access Point" };
  const layout = getDeviceLayout(device);
  assert.equal(layout.supportsApPortPanel, true, `${model_id} should support a discovered AP port panel`);
  assert.equal(layout.apUplinkPort, 1, `${model_id} should designate its main PoE-in port`);
  assert.equal(classifyDeviceType(device, { ports: true }), "access_point");

  const onePort = discoverPorts(realisticPortEntities([{ port: 1, name: "Main" }]));
  assert.equal(isApPortPanelAvailable(layout, onePort), false, `${model_id} must retain AP-only rendering with one port`);
  assert.equal(supportsDeviceLayoutModes(layout, onePort), false, `${model_id} must reject configured port layouts with one port`);

  const twoPorts = discoverPorts(realisticPortEntities([
    { port: 1, name: "Main" },
    { port: 2, name: "Secondary" },
  ]));
  assert.equal(isApPortPanelAvailable(layout, twoPorts), true, `${model_id} should render two discovered ports`);
  assert.equal(supportsDeviceLayoutModes(layout, twoPorts), true, `${model_id} should allow configured port layouts with two ports`);
  assert.deepEqual(mergePortsWithLayout({ ...layout, rows: [[1, 2]] }, twoPorts).map((port) => port.port), [1, 2]);
}

for (const model_id of ["U7PROWALL", "UAPA6A5", "U7PROXGWALL", "U7PROXG"]) {
  const layout = getDeviceLayout({ model_id });
  assert.equal(
    layout.supportsApPortPanel,
    undefined,
    `${model_id} must not be treated as a secondary-port AP without matching hardware support`
  );
}

assert.equal(resolveModelKey({ model_id: "UAPA6A5" }), "UAPA6A5");
assert.equal(getDeviceLayout({ model_id: "UAPA6A5" }).supportsIntegratedPorts, true);

console.log("AP port-panel compatibility tests passed.");
