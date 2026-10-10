import assert from "node:assert/strict";

// Exercise card rendering and control behavior without a Home Assistant server.
const elements = new Map();
globalThis.__VERSION__ = "test";
globalThis.HTMLElement = class {
  attachShadow() {
    this.shadowRoot = {
      innerHTML: "",
      querySelector: () => null,
      querySelectorAll: () => [],
      getElementById: () => null,
    };
  }
};
globalThis.customElements = {
  get: (name) => elements.get(name),
  define: (name, value) => elements.set(name, value),
};
globalThis.window = { customCards: [], __UNIFI_DEVICE_CARD_VERSION_LOGGED__: true };
globalThis.requestAnimationFrame = () => {};
await import("../src/unifi-device-card.js");

const Card = elements.get("unifi-device-card");
const Editor = elements.get("unifi-device-card-editor");
async function loadContext(card) {
  // Let a load started by setConfig finish, then exercise a periodic refresh.
  await new Promise(setImmediate);
  card._contextLoadedAt = 0;
  await card._ensureLoaded();
}

const serviceCalls = [];
const hass = {
  language: "en",
  states: {},
  callService: async (...args) => serviceCalls.push(args),
};

const card = new Card();
card._styles = () => "";
card._hass = hass;
card.setConfig({ device_id: "fake:USWDA24", fake_device: true, ups_layout: "back" });
await loadContext(card);
assert.equal(card._selectedKey, "outlet:1", "non-dynamic UPS views should select an outlet first");
assert.match(card.shadowRoot.innerHTML, /data-action="toggle-outlet"/);
assert.match(card.shadowRoot.innerHTML, /120 W/);
assert.match(card.shadowRoot.innerHTML, /simulated/);

card._selectKey("outlet:2");
await loadContext(card);
assert.equal(card._selectedKey, "outlet:2", "context refresh must preserve outlet selection");
await card._toggleUpsOutlet(2);
assert.equal(card._upsOutletState(card._ctx.outlet_entities[1]), "off");
assert.match(card.shadowRoot.innerHTML, /Turn on outlet/);
assert.match(card.shadowRoot.innerHTML, />0 W</);
await loadContext(card);
assert.equal(card._upsOutletState(card._ctx.outlet_entities[1]), "off", "preview state survives a context refresh");
await card._toggleUpsOutlet(2);
assert.equal(card._upsOutletState(card._ctx.outlet_entities[1]), "on");
assert.deepEqual(serviceCalls, [], "fake controls must never call HA services");

const otherCard = new Card();
otherCard._styles = () => "";
otherCard._hass = hass;
otherCard.setConfig({ device_id: "fake:USWDA24", fake_device: true });
await loadContext(otherCard);
await card._toggleUpsOutlet(2);
assert.equal(otherCard._upsOutletState(otherCard._ctx.outlet_entities[1]), "on",
  "cached fake contexts must not share mutable preview state between cards");

card.setConfig({ ...card._config, show_back_panel: false, dynamic_outlet_details: true });
assert.equal(card._selectedKey, null);
assert.match(card.shadowRoot.innerHTML, /class="ups-connection-panel tower no-panel-bg"/);
assert.match(card.shadowRoot.innerHTML, /data-outlet-key="outlet:1"/);
assert.match(card.shadowRoot.innerHTML, /class="ups-network-ports"/);
assert.doesNotMatch(card.shadowRoot.innerHTML, /data-action="toggle-outlet"/);
await loadContext(card);
assert.equal(card._selectedKey, null);
card._selectKey("outlet:3");
assert.match(card.shadowRoot.innerHTML, /data-outlet-index="3"/);
card._selectKey("outlet:3");
assert.equal(card._selectedKey, null);
assert.doesNotMatch(card.shadowRoot.innerHTML, /data-action="toggle-outlet"/);

const networkKey = card._buildSlotData(card._ctx).numbered[0].key;
card._selectKey(networkKey);
card._selectKey(networkKey);
assert.equal(card._selectedKey, networkKey, "dynamic outlets must not change non-dynamic RJ45 selection");
card.setConfig({ ...card._config, dynamic_port_details: true, dynamic_outlet_details: false });
card._selectKey("outlet:1");
card._selectKey("outlet:1");
assert.equal(card._selectedKey, "outlet:1", "explicit UPS setting overrides the legacy YAML fallback");
card._selectKey(networkKey);
card._selectKey(networkKey);
assert.equal(card._selectedKey, null, "RJ45 details still follow their own setting");

card.setConfig({ ...card._config, ups_layout: "front" });
assert.doesNotMatch(card.shadowRoot.innerHTML, /data-outlet-key=/);
assert.doesNotMatch(card.shadowRoot.innerHTML, /data-action="toggle-outlet"/);
card.setConfig({ device_id: "fake:USPDA2B", fake_device: true, ups_layout: "back", show_back_panel: false });
await loadContext(card);
assert.match(card.shadowRoot.innerHTML, /class="ups-connection-panel rack no-panel-bg"/);
assert.equal(card._fakeOutletStates.size, 0, "switching devices resets local preview state");

const outlet = { index: 1, entity_id: "switch.renamed_relay", power_entity: "sensor.renamed_load", label: "Server <rack>" };
card._ctx = { type: "ups", outlet_entities: [outlet], layout: {}, entities: [] };
card._config = { device_id: "real-ups", ups_layout: "back" };
card._hass = {
  ...hass,
  states: {
    [outlet.entity_id]: { state: "on" },
    [outlet.power_entity]: { state: "125", attributes: { unit_of_measurement: "W" } },
  },
};
card._selectedKey = "outlet:1";
card._loadedDeviceId = "real-ups";
card._contextLoadedAt = Date.now();
card._render();
assert.match(card.shadowRoot.innerHTML, /125\.00 W/);
assert.match(card.shadowRoot.innerHTML, /Server &lt;rack&gt;/);
assert.match(card.shadowRoot.innerHTML, /Turn off outlet/);
assert.doesNotMatch(card.shadowRoot.innerHTML, /simulated/);
await card._toggleUpsOutlet(1);
assert.deepEqual(serviceCalls, [["switch", "toggle", { entity_id: outlet.entity_id }]]);

const previousHass = card._hass;
const nextHass = { ...previousHass, states: { ...previousHass.states, [outlet.power_entity]: { state: "150", attributes: { unit_of_measurement: "W" } } } };
assert.equal(card._hasRelevantStateChanges(previousHass, nextHass), true);
card.hass = nextHass;
assert.match(card.shadowRoot.innerHTML, /150\.00 W/);

for (const state of ["unavailable", "unknown", undefined]) {
  card._hass.states[outlet.entity_id] = state ? { state } : undefined;
  const detail = card._renderUpsOutletDetail(outlet);
  assert.match(detail, /data-action="toggle-outlet"[^>]*disabled/);
  assert.doesNotMatch(detail, /class="detail-value offline"/);
  await card._toggleUpsOutlet(1);
}
assert.equal(serviceCalls.length, 1, "unavailable switches must not trigger control calls");
const meteringOnlyOutlet = { index: 2, entity_id: null, power_entity: outlet.power_entity, label: "Metering only" };
assert.match(card._renderUpsOutletDetail(meteringOnlyOutlet), /150\.00 W/);
assert.doesNotMatch(card._renderUpsOutletDetail(meteringOnlyOutlet), /data-action="toggle-outlet"/);
assert.doesNotMatch(card._renderUpsOutletDetail({ index: 3, label: "No telemetry" }), /Outlet power/);

const editor = new Editor();
editor._hass = hass;
editor._deviceCtx = otherCard._ctx;
editor._config = { device_id: "fake:USWDA24", fake_device: true };
editor._render();
assert.match(editor.shadowRoot.innerHTML, /id="show_back_panel"/);
assert.match(editor.shadowRoot.innerHTML, /id="dynamic_outlet_details"/);
assert.doesNotMatch(editor.shadowRoot.innerHTML, /id="show_panel"/);
assert.doesNotMatch(editor.shadowRoot.innerHTML, /id="dynamic_port_details"/);
let emitted;
editor._dispatchConfig = (config) => { emitted = config; };
editor._onShowBackPanelChange({ target: { checked: false } });
assert.equal(emitted.show_back_panel, false);
editor._onDynamicOutletDetailsChange({ target: { checked: true } });
assert.equal(emitted.dynamic_outlet_details, true);
editor._onShowBackPanelChange({ target: { checked: true } });
assert.equal(emitted.show_back_panel, undefined);
editor._config.dynamic_port_details = true;
editor._onDynamicOutletDetailsChange({ target: { checked: false } });
assert.equal(emitted.dynamic_outlet_details, false, "editor must preserve an explicit override of legacy dynamic details");

editor._deviceCtx = { type: "switch", layout: {} };
editor._render();
assert.match(editor.shadowRoot.innerHTML, /id="show_panel"/);
assert.match(editor.shadowRoot.innerHTML, /id="dynamic_port_details"/);
assert.doesNotMatch(editor.shadowRoot.innerHTML, /id="show_back_panel"/);
assert.doesNotMatch(editor.shadowRoot.innerHTML, /id="dynamic_outlet_details"/);

console.log("UPS outlet rendering and control checks passed.");
