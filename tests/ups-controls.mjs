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
assert.deepEqual(serviceCalls, [["switch", "turn_off", { entity_id: outlet.entity_id }]]);
assert.equal(card._pendingOutletActions.has(1), true, "service receipt alone must not confirm a relay state");
assert.match(card._renderUpsOutletDetail(outlet), /aria-busy="true"/);
await card._toggleUpsOutlet(1);
assert.equal(serviceCalls.length, 1, "pending outlet commands must block repeated clicks");

const previousHass = card._hass;
const nextHass = { ...previousHass, states: { ...previousHass.states,
  [outlet.entity_id]: { state: "off" },
  [outlet.power_entity]: { state: "150", attributes: { unit_of_measurement: "W" } },
} };
assert.equal(card._hasRelevantStateChanges(previousHass, nextHass), true);
card.hass = nextHass;
assert.equal(card._pendingOutletActions.size, 0, "the reported target state completes a command");
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

// Preview layout options preserve independent outlet and network behavior.
otherCard.setConfig({ ...otherCard._config, default_outlet: 3, outlet_power_badges: true });
assert.equal(otherCard._selectedKey, "outlet:3");
assert.match(otherCard.shadowRoot.innerHTML, /class="ups-outlet-power">45 W/);
otherCard.setConfig({ ...otherCard._config, dynamic_outlet_details: true });
assert.equal(otherCard._selectedKey, null);
assert.match(otherCard.shadowRoot.innerHTML, /role="progressbar"[^>]*aria-valuenow="76"/);
assert.equal((otherCard.shadowRoot.innerHTML.match(/<i class="active">/g) || []).length, 4);
assert.match(otherCard.shadowRoot.innerHTML, /18 min/);
otherCard.setConfig({ ...otherCard._config, show_telemetry: false });
assert.doesNotMatch(otherCard.shadowRoot.innerHTML, /role="progressbar"/);
assert.doesNotMatch(otherCard.shadowRoot.innerHTML, /<i class="active">/);

// Optional confirmation runs only for off actions, including in previews.
let confirmationCalls = 0;
window.confirm = () => { confirmationCalls++; return false; };
otherCard.setConfig({ ...otherCard._config, confirm_outlet_off: true });
await otherCard._toggleUpsOutlet(1);
assert.equal(otherCard._upsOutletState(otherCard._ctx.outlet_entities[0]), "on");
assert.equal(confirmationCalls, 1);
window.confirm = () => { confirmationCalls++; return true; };
await otherCard._toggleUpsOutlet(1);
await otherCard._toggleUpsOutlet(1);
assert.equal(confirmationCalls, 2, "turning on an outlet does not require confirmation");

// Errors remain visible and never leave the button permanently disabled.
card._hass.states[outlet.entity_id] = { state: "on" };
card._hass.callService = async () => { throw new Error("mock rejection"); };
card._log = () => {};
await card._toggleUpsOutlet(1);
assert.equal(card._pendingOutletActions.size, 0);
assert.match(card._renderUpsOutletDetail(outlet), /role="alert"/);
assert.match(card._renderUpsOutletDetail(outlet), /could not be switched/);

// Delayed state acknowledgement, timeout, and navigation must not leak actions.
let completeService;
card._hass.callService = () => new Promise((resolve) => { completeService = resolve; });
const delayedAction = card._toggleUpsOutlet(1);
assert.equal(card._pendingOutletActions.get(1).serviceComplete, false);
card._hass.states[outlet.entity_id] = { state: "off" };
assert.equal(card._finishConfirmedUpsOutletActions(), false);
completeService();
await delayedAction;
assert.equal(card._pendingOutletActions.size, 0);

const secondOutlet = { ...outlet, index: 2, entity_id: "switch.second_relay" };
card._ctx.outlet_entities = [outlet, secondOutlet];
card._hass.states[outlet.entity_id] = { state: "on" };
card._hass.states[secondOutlet.entity_id] = { state: "on" };
card._hass.callService = async () => {};
await card._toggleUpsOutlet(1);
card._hass.callService = () => new Promise((resolve) => { completeService = resolve; });
const secondAction = card._toggleUpsOutlet(2);
card._hass.states[outlet.entity_id] = { state: "off" };
completeService();
await secondAction;
assert.equal(card._pendingOutletActions.has(1), false);
assert.ok(card._pendingOutletActions.get(2).timer, "another completed action must not prevent this outlet's timeout");
card._clearUpsOutletActions();
card._ctx.outlet_entities = [outlet];

const realSetTimeout = globalThis.setTimeout;
const realClearTimeout = globalThis.clearTimeout;
let expiry;
globalThis.setTimeout = (callback) => { expiry = callback; return 1; };
globalThis.clearTimeout = () => {};
card._hass.callService = async () => {};
await card._toggleUpsOutlet(1);
assert.equal(card._pendingOutletActions.has(1), true);
expiry();
assert.equal(card._pendingOutletActions.size, 0);
assert.match(card._renderUpsOutletDetail(outlet), /No updated outlet state/);
await card._toggleUpsOutlet(1);
card.setConfig({ device_id: "fake:USPDA2B", fake_device: true });
expiry();
assert.equal(card._pendingOutletActions.size, 0);
assert.equal(card._outletErrors.size, 0, "an old timeout cannot affect another device");
globalThis.setTimeout = realSetTimeout;
globalThis.clearTimeout = realClearTimeout;
await loadContext(card);

editor._deviceCtx = otherCard._ctx;
editor._config = { ...editor._config, default_outlet: 2, outlet_power_badges: true, confirm_outlet_off: true };
editor._emitConfig({ name: "UPS" });
assert.equal(emitted.default_outlet, 2);
assert.equal(emitted.outlet_power_badges, true);
assert.equal(emitted.confirm_outlet_off, true);

editor._deviceCtx = { type: "ups", identity: { primary_mac: "aa:bb:cc:dd:ee:ff", model_id: "USWDA24" }, all_entities: [
  { entity_id: "sensor.disabled_runtime", unique_id: "ups_battery_runtime-aa:bb:cc:dd:ee:ff", disabled_by: "user" },
  { entity_id: "switch.unavailable_server", unique_id: "outlet-aa:bb:cc:dd:ee:ff_1", original_name: "Server" },
] };
editor._config.show_telemetry = true;
editor._hass.states = { "switch.unavailable_server": { state: "unavailable" } };
const diagnosticHtml = editor._upsDiagnosticsHTML();
assert.match(diagnosticHtml, /Disabled entities/);
assert.match(diagnosticHtml, /Currently unavailable/);
assert.match(diagnosticHtml, /Not exposed by the integration/);
assert.match(diagnosticHtml, /Outlet control · Server/);
assert.doesNotMatch(diagnosticHtml, /PoE/);
assert.equal(editor._warningHTML(), "", "UPS diagnostics replace generic network warnings");
assert.equal(editor._unavailableTelemetryHTML(), "");

console.log("UPS outlet rendering and control checks passed.");
