import assert from "node:assert/strict";
import { buildDeviceCapabilities } from "../src/capabilities.js";
import { classifyDeviceType } from "../src/classify.js";
import { getDeviceContext, getUnavailableHeaderTelemetryKeys, getUnifiDevices } from "../src/helpers.js";
import { getDeviceLayout, getFakeDevices, resolveModelKey } from "../src/model-registry.js";
import { getTranslations } from "../src/translations.js";
import { getUpsEntityDiagnostics, getUpsLoad } from "../src/ups.js";

for (const [model, key] of [
  ["UP6", "UP6"], ["USP-Strip", "UP6"], ["SmartPower Strip", "UP6"],
  ["USPPDUP", "USPPDUP"], ["USP-PDU-Pro", "USPPDUP"], ["SmartPower PDU Pro", "USPPDUP"],
]) {
  assert.equal(resolveModelKey({ model }), key);
  assert.equal(classifyDeviceType({ model, name: "Renamed device" }, { ports: true, uplink_mac: true }), "power_distribution");
  assert.equal(getDeviceLayout({ model }).kind, "power_distribution");
}
assert.equal(classifyDeviceType({ model_id: "UP6", is_child_device: true }, { outlet_control: true }), "unknown");
assert.equal(classifyDeviceType({ model_id: "USWDA24" }, { outlet_control: true }), "ups");
assert.deepEqual(getFakeDevices().filter((device) => device.type === "power_distribution").map((device) => device.id).sort(),
  ["fake:UP6", "fake:USPPDUP"]);

const devices = [
  { id: "strip", model_id: "UP6", model: "USP-Strip", name: "Office strip", manufacturer: "Ubiquiti", connections: [["mac", "aa:bb:cc:dd:ee:01"]] },
  { id: "pdu", model_id: "USPPDUP", model: "USP-PDU-Pro", name: "Rack PDU", manufacturer: "Ubiquiti", connections: [["mac", "aa:bb:cc:dd:ee:02"]] },
];
const entities = [];
const states = {};
for (const device of devices) {
  const mac = device.connections[0][1];
  const count = device.id === "strip" ? 7 : 20;
  for (let index = 1; index <= count; index++) {
    const entity_id = `switch.${device.id}_renamed_${index}`;
    const usb = device.id === "strip" ? index === 7 : index <= 4;
    entities.push({ entity_id, device_id: device.id, unique_id: `outlet-${mac}_${index}`,
      original_name: usb ? "USB from Console" : `Console <outlet ${index}>`, name: "HA override" });
    states[entity_id] = { state: "on" };
    if (device.id === "pdu" && !usb) {
      const meter = `sensor.pdu_renamed_${index}`;
      entities.push({ entity_id: meter, device_id: device.id, unique_id: `outlet_power-${mac}_${index}`, hidden_by: "user" });
      states[meter] = { state: "125", attributes: { unit_of_measurement: "W" } };
    }
  }
}
for (const [feature, entity_id, state] of [["ac_power_budget", "sensor.budget", "1875"], ["ac_power_conumption", "sensor.consumption", "300"]]) {
  entities.push({ entity_id, device_id: "pdu", unique_id: `${feature}-aa:bb:cc:dd:ee:02` });
  states[entity_id] = { state, attributes: { unit_of_measurement: "W" } };
}
const serviceCalls = [];
const hass = { language: "en", states, callService: async (...args) => serviceCalls.push(args),
  async callWS(message) {
    if (message.type === "config/device_registry/list") return devices;
    if (message.type === "config/entity_registry/list") return entities;
    if (message.type === "config/config_entries") return [];
    throw new Error(`Unexpected WS request: ${message.type}`);
  },
};
const capabilities = buildDeviceCapabilities(entities, { primary_mac: "aa:bb:cc:dd:ee:01" });
assert.equal(capabilities.outlet_control, true);
assert.equal(capabilities.outlet_power, false, "other devices' power sensors must not add capabilities");
assert.equal(classifyDeviceType({ model: "Unknown future power device" }, capabilities), "power_distribution");
assert.deepEqual((await getUnifiDevices(hass)).map((device) => device.type), ["power_distribution", "power_distribution"]);
const stripContext = await getDeviceContext(hass, "strip");
const pduContext = await getDeviceContext(hass, "pdu");
assert.equal(stripContext.outlet_entities.length, 7);
assert.equal(stripContext.outlet_entities[6].label, "USB from Console");
assert.ok(stripContext.outlet_entities.every((outlet) => !outlet.power_entity));
assert.equal(pduContext.outlet_entities.length, 20);
assert.equal(pduContext.outlet_entities[0].power_entity, undefined, "USB relays must not acquire AC metering");
assert.equal(pduContext.outlet_entities[4].power_entity, "sensor.pdu_renamed_5");
assert.equal(pduContext.outlet_entities[4].label, "Console <outlet 5>");
assert.deepEqual(getUpsEntityDiagnostics(stripContext, hass), [], "unmetered Strip outlets require no metering or battery sensors");
assert.deepEqual(getUpsEntityDiagnostics(pduContext, hass), [], "unmetered PDU USB relays require no power sensors");
assert.deepEqual(getUnavailableHeaderTelemetryKeys(stripContext), []);
assert.deepEqual(getUpsLoad(hass, pduContext), { budget: 1875, consumption: 300, percent: 16 });
assert.equal(getUpsLoad(hass, stripContext), null);
const partialContext = await getDeviceContext({ ...hass, async callWS(message) {
  if (message.type === "config/entity_registry/list") return entities.filter((entity) =>
    ["switch.pdu_renamed_1", "sensor.pdu_renamed_5"].includes(entity.entity_id));
  return hass.callWS(message);
} }, "pdu");
assert.deepEqual(partialContext.outlet_entities.map((outlet) => outlet.index), [1, 5],
  "real cards must not invent outlets from a model's preview count");
assert.equal(partialContext.outlet_entities[1].entity_id, null, "metering-only outlets do not acquire a relay");
const diagnostics = getUpsEntityDiagnostics({ ...pduContext, all_entities: pduContext.all_entities.map((entity) =>
  entity.entity_id === "sensor.pdu_renamed_5" ? { ...entity, disabled_by: "user" } : entity) }, {
  ...hass, states: { ...states, "switch.pdu_renamed_1": { state: "unavailable" } },
});
assert.ok(diagnostics.some((row) => row.key === "ups_outlet_power" && row.status === "disabled"));
assert.ok(diagnostics.some((row) => row.key === "ups_outlet_control" && row.status === "unavailable"));
assert.ok(diagnostics.every((row) => !row.key.includes("battery") && !row.key.includes("poe")));

const elements = new Map();
globalThis.__VERSION__ = "test";
globalThis.HTMLElement = class {
  attachShadow() { this.shadowRoot = { innerHTML: "", querySelector: () => null, querySelectorAll: () => [], getElementById: () => null }; }
};
globalThis.customElements = { get: (name) => elements.get(name), define: (name, element) => elements.set(name, element) };
globalThis.window = { customCards: [], __UNIFI_DEVICE_CARD_VERSION_LOGGED__: true };
globalThis.requestAnimationFrame = () => {};
await import("../src/unifi-device-card.js");
const Card = elements.get("unifi-device-card");
const Editor = elements.get("unifi-device-card-editor");
async function makeCard(config) {
  const card = new Card();
  card._styles = () => "";
  card._hass = hass;
  card.setConfig(config);
  await new Promise(setImmediate);
  await card._ensureLoaded();
  return card;
}
const strip = await makeCard({ device_id: "strip", outlet_power_badges: true });
assert.equal(strip._selectedKey, "outlet:1");
assert.match(strip.shadowRoot.innerHTML, /class="power-outlet-panel"/);
assert.equal((strip.shadowRoot.innerHTML.match(/data-outlet-key=/g) || []).length, 7);
assert.match(strip.shadowRoot.innerHTML, /7 of 7 outlets on/);
assert.doesNotMatch(strip.shadowRoot.innerHTML, /ups-visual|ups-chassis|Battery|UPS load|CPU|Outlet power/);
strip.setConfig({ ...strip._config, dynamic_outlet_details: true, show_back_panel: false });
assert.equal(strip._selectedKey, null);
assert.match(strip.shadowRoot.innerHTML, /power-outlet-panel no-panel-bg/);
assert.doesNotMatch(strip.shadowRoot.innerHTML, /data-action="toggle-outlet"/);
strip._selectKey("outlet:7");
assert.match(strip.shadowRoot.innerHTML, /USB from Console/);
await strip._toggleUpsOutlet(7);
assert.deepEqual(serviceCalls, [["switch", "turn_off", { entity_id: "switch.strip_renamed_7" }]]);
assert.match(strip.shadowRoot.innerHTML, /aria-busy="true"/);
strip.hass = { ...hass, states: { ...states, "switch.strip_renamed_7": { state: "off" } } };
assert.equal(strip._pendingOutletActions.size, 0);
assert.match(strip.shadowRoot.innerHTML, /Turn on outlet/);
strip._selectKey("outlet:7");
assert.doesNotMatch(strip.shadowRoot.innerHTML, /data-action="toggle-outlet"/);

const pdu = await makeCard({ device_id: "pdu", default_outlet: 5, outlet_power_badges: true });
assert.equal(pdu._selectedKey, "outlet:5");
assert.match(pdu.shadowRoot.innerHTML, /Console &lt;outlet 5&gt;/);
assert.match(pdu.shadowRoot.innerHTML, /125\.00 W/);
assert.match(pdu.shadowRoot.innerHTML, /300 W · 16%/);
assert.doesNotMatch(pdu.shadowRoot.innerHTML, /HA override|ups-visual|Battery|CPU/);
pdu.setConfig({ ...pdu._config, default_outlet: 2, show_telemetry: false });
assert.equal(pdu._selectedKey, "outlet:2");
assert.doesNotMatch(pdu.shadowRoot.innerHTML, /AC load|SmartPower telemetry/);
assert.match(pdu.shadowRoot.innerHTML, /125\.00 W/, "per-outlet power badges remain when device telemetry is hidden");

const fakeStrip = await makeCard({ device_id: "fake:UP6", fake_device: true, default_outlet: 7, outlet_power_badges: true });
assert.equal(fakeStrip._selectedKey, "outlet:7");
assert.match(fakeStrip.shadowRoot.innerHTML, /USB Outlets/);
assert.doesNotMatch(fakeStrip.shadowRoot.innerHTML, /Outlet power|ups-outlet-power|AC load/);
await fakeStrip._toggleUpsOutlet(7);
assert.equal(serviceCalls.length, 1, "preview switching must not invoke a real HA service");
const fakePdu = await makeCard({ device_id: "fake:USPPDUP", fake_device: true, default_outlet: 5, outlet_power_badges: true });
assert.equal(fakePdu._ctx.outlet_entities.length, 20);
assert.equal(fakePdu._upsOutletPower(fakePdu._ctx.outlet_entities[0]), null);
assert.match(fakePdu.shadowRoot.innerHTML, /120 W/);
assert.ok(fakePdu._upsLoad().consumption > 0);
await fakePdu._toggleUpsOutlet(5);
assert.equal(fakePdu._upsLoad().consumption, 160);
assert.equal(serviceCalls.length, 1);

const editor = new Editor();
editor._hass = hass;
editor._deviceCtx = stripContext;
editor._config = { device_id: "strip" };
editor._render();
for (const id of ["show_back_panel", "dynamic_outlet_details", "default_outlet", "outlet_power_badges", "confirm_outlet_off"]) {
  assert.match(editor.shadowRoot.innerHTML, new RegExp(`id="${id}"`));
}
assert.doesNotMatch(editor.shadowRoot.innerHTML, /id="ups_layout"|id="show_panel"|Battery|CPU|UPS telemetry/);
assert.match(editor.shadowRoot.innerHTML, /SmartPower telemetry/);
assert.equal(editor._upsDiagnosticsHTML(), "");

const keys = ["power_telemetry", "power_load", "power_diagnostics", "power_preview", "editor_power_telemetry_text", "editor_power_telemetry_hint", "editor_power_panel_text"];
for (const language of ["en", "de", "nl", "fr", "es", "it", "sv", "da", "no", "fi", "pl", "cs"]) {
  for (const key of keys) assert.ok(getTranslations(language)[key], `${language} lacks ${key}`);
}
console.log("SmartPower classification, registry, metering, outlet rendering and control checks passed.");
