import assert from "node:assert/strict";
import { test } from "node:test";

// Like the outlet tests, exercise the actual card without a Home Assistant
// server. Track shadow-root writes and retain event targets until a replacement.
class TestShadowRoot {
  writes = [];
  nodes = new Map();
  get innerHTML() { return this.html || ""; }
  set innerHTML(html) {
    this.html = html;
    this.writes.push(html);
    this.nodes = new Map();
  }
  querySelector(selector) {
    if (this.nodes.has(selector)) return this.nodes.get(selector);
    const action = selector.match(/^\[data-action=['"]([^'"]+)['"]\]$/)?.[1];
    if (!action) return null;
    const tag = this.html.match(new RegExp(`<[^>]+data-action="${action}"[^>]*>`))?.[0];
    if (!tag) return null;
    const node = new EventTarget();
    node.dataset = Object.fromEntries([...tag.matchAll(/data-([\w-]+)="([^"]*)"/g)]
      .map(([, key, value]) => [key.replace(/-([a-z])/g, (_, char) => char.toUpperCase()), value]));
    this.nodes.set(selector, node);
    return node;
  }
  querySelectorAll() { return []; }
}

const elements = new Map();
globalThis.__VERSION__ = "test";
globalThis.HTMLElement = class {
  attachShadow() { this.shadowRoot = new TestShadowRoot(); }
};
globalThis.customElements = {
  get: (name) => elements.get(name),
  define: (name, value) => elements.set(name, value),
};
globalThis.window = { customCards: [], __UNIFI_DEVICE_CARD_VERSION_LOGGED__: true, confirm: () => true };
globalThis.requestAnimationFrame = () => {};
await import("../src/unifi-device-card.js");
const Card = elements.get("unifi-device-card");
const flush = () => new Promise(setImmediate);
const mac = "aa:bb:cc:dd:ee:ff";
const state = (value, attributes = {}) => ({ state: String(value), attributes });

async function fixture(model = "UDMPRO", config = {}) {
  const device = {
    id: "device", name: "Office", model_id: model, model,
    config_entry_id: "unifi", connections: [["mac", mac]],
  };
  const entities = [
    ...[1, 2].flatMap((port) => [
      { entity_id: `sensor.port_${port}_link_speed`, unique_id: `port_link_speed-${mac}_${port}`, translation_key: "port_link_speed" },
      { entity_id: `sensor.port_${port}_rx`, unique_id: `port_bandwidth_rx-${mac}_${port}`, translation_key: "port_bandwidth_rx" },
      { entity_id: `switch.port_${port}`, unique_id: `port_control-${mac}_${port}`, translation_key: "port_control" },
    ]),
    { entity_id: "sensor.cpu", unique_id: `cpu_utilization-${mac}`, translation_key: "cpu_utilization" },
    { entity_id: "sensor.cpu_fallback", unique_id: `cpu_usage-${mac}`, translation_key: "cpu_usage" },
    { entity_id: "sensor.diagnostic", unique_id: `diagnostic-${mac}`, translation_key: "diagnostic" },
    { entity_id: "light.led", unique_id: `led-${mac}`, translation_key: "led" },
    { entity_id: "button.reboot", unique_id: `restart-${mac}`, translation_key: "restart" },
  ].map((entity) => ({ ...entity, device_id: device.id }));
  const states = {
    "sensor.cpu": state(10, { unit_of_measurement: "%" }),
    "sensor.cpu_fallback": state(20, { unit_of_measurement: "%" }),
    "sensor.diagnostic": state(1),
    "sensor.room_temperature": state(20),
    "light.led": state("on"),
    "button.reboot": state("unknown"),
    ...Object.fromEntries([1, 2].flatMap((port) => [
      [`sensor.port_${port}_link_speed`, state("1 Gbps", { unit_of_measurement: "Gbps" })],
      [`sensor.port_${port}_rx`, state(0, { unit_of_measurement: "Mbit/s" })],
      [`switch.port_${port}`, state("on")],
    ])),
  };
  const calls = [];
  const hass = {
    language: "en", states,
    callService: async (...args) => calls.push(args),
    callWS: async ({ type }) => {
      if (type === "config/device_registry/list") return [device];
      if (type === "config/entity_registry/list") return entities;
      if (type === "config/config_entries") return [{ entry_id: "unifi", domain: "unifi" }];
      throw new Error(`Unexpected registry request: ${type}`);
    },
  };
  const card = new Card();
  card.setConfig({ device_id: device.id, ...config });
  card.hass = hass;
  assert.match(card.shadowRoot.innerHTML, /class="loading-state"/, "initial load still has a loading indicator");
  await flush();
  assert.ok(card._ctx);
  assert.equal(card._loading, false);
  return { card, calls, device, entities };
}

function update(card, patch) {
  card.hass = { ...card._hass, states: { ...card._hass.states, ...patch } };
}

function expectRetained(card, action) {
  const before = card.shadowRoot.writes.length;
  const nodes = card.shadowRoot.nodes;
  action();
  assert.equal(card.shadowRoot.writes.length, before, "unchanged presentation must not replace the DOM");
  assert.equal(card.shadowRoot.nodes, nodes, "existing event targets must survive");
}

for (const model of ["UDMPRO", "USW48P"]) {
  test(`${model}: unrelated, hidden and unchanged values preserve the DOM`, async () => {
    const { card } = await fixture(model, { show_telemetry: false });
    expectRetained(card, () => update(card, { "sensor.room_temperature": state(21) }));
    expectRetained(card, () => update(card, { "sensor.diagnostic": state(2) }));
    expectRetained(card, () => update(card, { "sensor.cpu": state(11, { unit_of_measurement: "%" }) }));
    expectRetained(card, () => update(card, {
      "sensor.port_1_link_speed": {
        ...state("1 Gbps", { unit_of_measurement: "Gbps" }), last_updated: "2026-10-11T17:00:00Z",
      },
    }));
    expectRetained(card, () => card.setConfig({ ...card._config }));
    const before = card.shadowRoot.writes.length;
    update(card, { "sensor.port_1_link_speed": state("100 Mbps") });
    assert.equal(card.shadowRoot.writes.length, before + 1);
    assert.match(card.shadowRoot.innerHTML, /100 Mbps/);
    update(card, { "sensor.port_1_link_speed": state("100 Mbps", { clients: ["Desk PC"] }) });
    assert.match(card.shadowRoot.innerHTML, /Desk PC/, "attribute-only updates must refresh client tooltips");
  });
}

test("manual port sensors, selection, configuration and language remain live", async () => {
  const { card } = await fixture("USW48P", { port_1: "sensor.custom_link_speed" });
  update(card, { "sensor.custom_link_speed": state("2.5 Gbps", { unit_of_measurement: "Gbps" }) });
  assert.match(card.shadowRoot.innerHTML, /2\.5 Gbps/);
  const port = card._buildSlotData(card._ctx).numbered.find((slot) => slot.port === 1);
  card._selectKey(port.key);
  assert.equal(card._selectedKey, port.key);
  update(card, { "sensor.custom_link_speed": state("100 Mbps") });
  assert.equal(card._selectedKey, port.key);
  assert.match(card.shadowRoot.innerHTML, /100 Mbps/);
  card.setConfig({ ...card._config, name: "Renamed card", port_name: { 1: "Server" } });
  assert.match(card.shadowRoot.innerHTML, /Renamed card/);
  assert.match(card.shadowRoot.innerHTML, /Server/);
  card.hass = { ...card._hass, language: "de" };
  assert.match(card.shadowRoot.innerHTML, /Geschwindigkeit/);
  const germanHtml = card.shadowRoot.innerHTML;
  card.hass = { ...card._hass, language: undefined, locale: { language: "en" } };
  assert.notEqual(card.shadowRoot.innerHTML, germanHtml);
  card.hass = { ...card._hass, locale: { language: "de" } };
  assert.equal(card.shadowRoot.innerHTML, germanHtml);
});

test("external clients join, rename, move and leave without device sensor changes", async () => {
  const { card } = await fixture();
  update(card, { "device_tracker.desk": state("home", { sw_mac: mac, switch_port: 1, friendly_name: "Desk PC" }) });
  assert.match(card.shadowRoot.innerHTML, /Desk PC/);
  update(card, { "device_tracker.desk": state("home", { sw_mac: mac, switch_port: 2, friendly_name: "Office PC" }) });
  assert.doesNotMatch(card.shadowRoot.innerHTML, /Desk PC/);
  assert.match(card.shadowRoot.innerHTML, /Port 2[^"\n]*Office PC/);
  update(card, { "device_tracker.desk": state("home", { sw_mac: "11:22:33:44:55:66", switch_port: 2, friendly_name: "Office PC" }) });
  assert.doesNotMatch(card.shadowRoot.innerHTML, /Office PC/);
  update(card, { "device_tracker.desk": state("home", { sw_mac: mac, switch_port: 1, friendly_name: "Desk PC" }) });
  const states = { ...card._hass.states };
  delete states["device_tracker.desk"];
  card.hass = { ...card._hass, states };
  assert.doesNotMatch(card.shadowRoot.innerHTML, /Desk PC/);
});

test("telemetry fallback and restoration update the displayed metric", async () => {
  const { card } = await fixture();
  assert.equal(card._ctx.cpu_utilization_entity, "sensor.cpu");
  assert.match(card.shadowRoot.innerHTML, /10\.00 %/);
  update(card, { "sensor.cpu": state("unavailable") });
  assert.equal(card._ctx.cpu_utilization_entity, "sensor.cpu_fallback");
  assert.match(card.shadowRoot.innerHTML, /20\.00 %/);
  update(card, { "sensor.cpu": state(15, { unit_of_measurement: "%" }) });
  assert.equal(card._ctx.cpu_utilization_entity, "sensor.cpu");
  assert.match(card.shadowRoot.innerHTML, /15\.00 %/);
});

test("background refresh preserves content, selection and current sensor values", async () => {
  const { card } = await fixture();
  const port = card._buildSlotData(card._ctx).numbered.find((slot) => slot.port === 2);
  card._selectKey(port.key);
  let finishRegistry;
  const gate = new Promise((resolve) => { finishRegistry = resolve; });
  const callWS = card._hass.callWS;
  card._hass = { ...card._hass, callWS: async (message) => { await gate; return callWS(message); } };
  card._contextLoadedAt = 0;
  const before = card.shadowRoot.writes.length;
  const refresh = card._ensureLoaded();
  assert.equal(card._loading, true);
  assert.equal(card.shadowRoot.writes.length, before);
  update(card, {
    "sensor.port_2_link_speed": state("100 Mbps"),
    "sensor.cpu": state("unavailable"),
  });
  assert.match(card.shadowRoot.innerHTML, /100 Mbps/);
  assert.match(card.shadowRoot.innerHTML, /20\.00 %/);
  assert.equal(card._selectedKey, port.key);
  const afterUpdate = card.shadowRoot.writes.length;
  finishRegistry();
  await refresh;
  assert.equal(card._ctx.cpu_utilization_entity, "sensor.cpu_fallback", "in-flight registry work must not restore an old telemetry selection");
  assert.equal(card.shadowRoot.writes.length, afterUpdate, "unchanged refresh result must retain the DOM");
  assert.equal(card._selectedKey, port.key);
  assert.ok(card.shadowRoot.writes.slice(before).every((html) => !html.includes('class="loading-state"')));

  card._hass = { ...card._hass };
  card._contextLoadedAt = 0;
  await card._ensureLoaded();
  assert.equal(card.shadowRoot.writes.length, afterUpdate, "idle refresh must retain the DOM too");
});

test("preserved controls bind once and use the latest context and hass", async () => {
  for (const model of ["UDMPRO", "U7PRO", "USPDA2B", "UP6"]) {
    const { card, calls } = await fixture(model);
    const button = card.shadowRoot.querySelector("[data-action='reboot-device']");
    assert.ok(button, model);
    const before = card.shadowRoot.writes.length;
    card._ctx = { ...card._ctx, reboot_entity: "button.renamed_reboot" };
    card._render();
    card._render();
    assert.equal(card.shadowRoot.writes.length, before, model);
    assert.equal(card.shadowRoot.querySelector("[data-action='reboot-device']"), button);
    const latestCalls = [];
    card.hass = { ...card._hass, callService: async (...args) => latestCalls.push(args) };
    button.dispatchEvent(new Event("click"));
    assert.deepEqual(latestCalls, [["button", "press", { entity_id: "button.renamed_reboot" }]], model);
    assert.deepEqual(calls, [], "retained handlers use the latest hass service connection");
    if (model === "U7PRO") {
      const led = card.shadowRoot.querySelector("[data-action='toggle-led']");
      assert.ok(led);
      card._ctx = { ...card._ctx, led_switch_entity: "light.new_led" };
      update(card, { "light.new_led": state("on") });
      assert.equal(card.shadowRoot.querySelector("[data-action='toggle-led']"), led);
      led.dispatchEvent(new Event("click"));
      assert.deepEqual(latestCalls.at(-1), ["light", "toggle", { entity_id: "light.new_led" }]);
      assert.equal(latestCalls.length, 2);
    }
  }
});

test("empty and initial loading states are stable; changing devices still loads", async () => {
  const empty = new Card();
  empty.setConfig({});
  expectRetained(empty, () => { empty.hass = { states: {} }; empty.hass = { states: {} }; });
  const { card } = await fixture();
  card.setConfig({ device_id: "missing" });
  assert.match(card.shadowRoot.innerHTML, /class="loading-state"/);
  expectRetained(card, () => update(card, { "sensor.room_temperature": state(25) }));
  await flush();
  assert.equal(card._ctx, null);
  assert.match(card.shadowRoot.innerHTML, /class="empty-state"/);
  expectRetained(card, () => card._render());
});
