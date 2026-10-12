import assert from "node:assert/strict";
import { test } from "node:test";

import { parseHTML } from "linkedom";

// Use a DOM implementation so identity, text updates and retained event
// listeners are checked, rather than only comparing generated HTML strings.
const { window } = parseHTML("<html><body></body></html>");
const elements = window.customElements;
globalThis.__VERSION__ = "test";
globalThis.window = window;
globalThis.document = window.document;
globalThis.Event = window.Event;
globalThis.customElements = elements;
window.customCards = [];
window.__UNIFI_DEVICE_CARD_VERSION_LOGGED__ = true;
window.confirm = () => true;
globalThis.requestAnimationFrame = () => {};
globalThis.HTMLElement = class extends window.HTMLElement {
  attachShadow(options) {
    const root = super.attachShadow(options);
    let prototype = root;
    let innerHTML;
    while (!innerHTML) {
      prototype = Object.getPrototypeOf(prototype);
      innerHTML = Object.getOwnPropertyDescriptor(prototype, "innerHTML");
    }
    root.writes = [];
    Object.defineProperty(root, "innerHTML", {
      get() { return innerHTML.get.call(root); },
      set(html) { root.writes.push(html); innerHTML.set.call(root, html); },
    });
    return root;
  }
};
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
      { entity_id: `sensor.port_${port}_poe_power`, unique_id: `poe_power-${mac}_${port}`, translation_key: "poe_power" },
      { entity_id: `switch.port_${port}`, unique_id: `port_control-${mac}_${port}`, translation_key: "port_control" },
    ]),
    { entity_id: "switch.port_1_poe", unique_id: `poe-${mac}_1` },
    { entity_id: "sensor.cpu", unique_id: `cpu_utilization-${mac}`, translation_key: "cpu_utilization" },
    { entity_id: "sensor.cpu_fallback", unique_id: `cpu_usage-${mac}`, translation_key: "cpu_usage" },
    ...["memory_utilization", "cpu_temperature", "temperature"].map((key) => ({
      entity_id: `sensor.${key}`, unique_id: `${key}-${mac}`, translation_key: key,
    })),
    { entity_id: "sensor.diagnostic", unique_id: `diagnostic-${mac}`, translation_key: "diagnostic" },
    { entity_id: "light.led", unique_id: `led-${mac}`, translation_key: "led" },
    { entity_id: "button.reboot", unique_id: `restart-${mac}`, translation_key: "restart" },
  ].map((entity) => ({ ...entity, device_id: device.id }));
  const states = {
    "sensor.cpu": state(10, { unit_of_measurement: "%" }),
    "sensor.cpu_fallback": state(20, { unit_of_measurement: "%" }),
    "sensor.memory_utilization": state(30, { unit_of_measurement: "%" }),
    "sensor.cpu_temperature": state(45, { unit_of_measurement: "°C" }),
    "sensor.temperature": state(35, { unit_of_measurement: "°C" }),
    "sensor.diagnostic": state(1),
    "sensor.room_temperature": state(20),
    "light.led": state("on"),
    "button.reboot": state("unknown"),
    "switch.port_1_poe": state("off"),
    ...Object.fromEntries([1, 2].flatMap((port) => [
      [`sensor.port_${port}_link_speed`, state("1 Gbps", { unit_of_measurement: "Gbps" })],
      [`sensor.port_${port}_rx`, state(0, { unit_of_measurement: "Mbit/s" })],
      [`sensor.port_${port}_poe_power`, state(0, { unit_of_measurement: "W" })],
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
  const content = card.shadowRoot.querySelector("ha-card");
  action();
  assert.equal(card.shadowRoot.writes.length, before, "unchanged presentation must not replace the DOM");
  assert.equal(card.shadowRoot.querySelector("ha-card"), content, "existing card must survive");
}

for (const model of ["UDMSE", "USW48P"]) {
  test(`${model}: PoE LEDs light up and turn off with switch and power updates`, async () => {
    const { card } = await fixture(model, { link_color_1000: "blue" });
    const led = (port) => card.shadowRoot.querySelector(`[data-key="port-${port}"] .rj45-led.left`);
    // Inspect the background declarations that match the rendered LED. These
    // top-level LED rules are ordered from the base style to the state styles.
    const background = (element) => Array.from(card.shadowRoot.querySelector("style").sheet.cssRules)
      .filter((rule) => rule.selectorText?.includes(".rj45-led") && element.matches(rule.selectorText))
      .map((rule) => rule.style.background)
      .filter(Boolean).at(-1);

    assert.ok(led(1).classList.contains("off"));
    update(card, { "switch.port_1_poe": state("on") });
    assert.ok(led(1).classList.contains("orange"), "the PoE switch alone activates the LED");
    assert.match(background(led(1)), /#efb21a/, "active PoE must have its amber background, not the grey base style");
    assert.doesNotMatch(background(led(1)), /var\(/, "link color overrides must not change the PoE color");
    const activeLed = led(1);
    expectRetained(card, () => update(card, { "sensor.cpu": state(11, { unit_of_measurement: "%" }) }));
    assert.equal(led(1), activeLed, "header telemetry retains the active PoE LED");

    update(card, {
      "switch.port_1_poe": state("off"),
      "sensor.cpu": state(12, { unit_of_measurement: "%" }),
    });
    assert.ok(led(1).classList.contains("off"), "PoE updates must not be skipped alongside a header update");
    assert.equal(background(led(1)), "#868b93");

    assert.equal(card._buildSlotData(card._ctx).numbered.find((port) => port.port === 2).poe_switch_entity, null);
    update(card, { "sensor.port_2_poe_power": state("4,5", { unit_of_measurement: "W" }) });
    assert.ok(led(2).classList.contains("orange"), "positive power draw activates PoE without a switch entity");
    assert.match(background(led(2)), /#efb21a/);
    for (const value of [0, "unavailable"]) {
      update(card, { "sensor.port_2_poe_power": state(value, { unit_of_measurement: "W" }) });
      assert.ok(led(2).classList.contains("off"));
      assert.equal(background(led(2)), "#868b93");
    }
  });
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
  expectRetained(card, () => update(card, { "sensor.cpu": state(11, { unit_of_measurement: "%" }) }));
  assert.equal(card.shadowRoot.querySelector('[data-metric="cpu_utilization"] .meta-value').textContent, "11.00 %");
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

for (const model of ["UDMPRO", "USW48P", "U7PRO"]) {
  test(`${model}: changing header telemetry preserves panel, metric nodes and controls`, async () => {
    const { card, calls } = await fixture(model);
    const root = card.shadowRoot;
    const panel = root.querySelector(".frontpanel");
    const reboot = root.querySelector("[data-action='reboot-device']");
    const values = new Map(Array.from(root.querySelectorAll("[data-metric]"), (row) =>
      [row.dataset.metric, row.querySelector(".meta-value")]));
    assert.equal(values.size, 4);
    const selected = card._selectedKey;
    const mutations = [];
    const observer = new window.MutationObserver((records) => mutations.push(...records));
    observer.observe(panel, { subtree: true, childList: true, attributes: true, characterData: true });

    for (let index = 1; index <= 60; index++) {
      expectRetained(card, () => update(card, {
        "sensor.cpu": state(index, { unit_of_measurement: "%" }),
        "sensor.memory_utilization": state(index + 10, { unit_of_measurement: "%" }),
        "sensor.cpu_temperature": state(index + 20, { unit_of_measurement: "°C" }),
        "sensor.temperature": state(index + 30, { unit_of_measurement: "°C" }),
      }));
      assert.equal(values.get("cpu_utilization").textContent, `${index.toFixed(2)} %`);
      assert.equal(values.get("memory_utilization").textContent, `${(index + 10).toFixed(2)} %`);
      assert.equal(values.get("cpu_temperature").textContent, `${(index + 20).toFixed(2)} °C`);
      assert.equal(values.get("temperature").textContent, `${(index + 30).toFixed(2)} °C`);
    }
    await flush();
    observer.disconnect();
    assert.deepEqual(mutations, [], "telemetry must not mutate the port/AP panel");
    assert.equal(root.querySelector(".frontpanel"), panel);
    assert.equal(root.querySelector("[data-action='reboot-device']"), reboot);
    assert.equal(card._selectedKey, selected);
    for (const [key, value] of values) {
      assert.equal(root.querySelector(`[data-metric="${key}"] .meta-value`), value);
    }
    reboot.dispatchEvent(new Event("click"));
    assert.deepEqual(calls, [["button", "press", { entity_id: "button.reboot" }]], "telemetry must not duplicate handlers");

    // The rendered-HTML cache must track patched values too.
    expectRetained(card, () => update(card, { "sensor.diagnostic": state(2) }));
    expectRetained(card, () => update(card, { "sensor.cpu": state(60, { unit_of_measurement: "%" }) }));
  });
}

test("missing and returning metrics, fallbacks and visibility only update the header", async () => {
  const { card } = await fixture();
  const list = card.shadowRoot.querySelector(".meta-list");
  const cpu = list.querySelector('[data-metric="cpu_utilization"] .meta-value');
  expectRetained(card, () => update(card, { "sensor.cpu": state("unavailable") }));
  assert.equal(cpu.textContent, "20.00 %", "fallback values update the same metric node");
  const memory = list.querySelector('[data-metric="memory_utilization"]');
  expectRetained(card, () => update(card, {
    "sensor.cpu_fallback": state("unknown"),
    "sensor.cpu_temperature": state("unavailable"),
  }));
  assert.equal(list.querySelector('[data-metric="cpu_utilization"]'), null);
  assert.equal(list.querySelector('[data-metric="cpu_temperature"]'), null);
  assert.equal(list.querySelector('[data-metric="memory_utilization"]'), memory);
  expectRetained(card, () => update(card, {
    "sensor.memory_utilization": state("unavailable"),
    "sensor.temperature": state("unavailable"),
  }));
  assert.equal(list.children.length, 0);
  assert.equal(list.hidden, true);
  expectRetained(card, () => update(card, {
    "sensor.cpu": state(12, { unit_of_measurement: "%" }),
    "sensor.memory_utilization": state(40, { unit_of_measurement: "%" }),
    "sensor.cpu_temperature": state(50, { unit_of_measurement: "°C" }),
  }));
  assert.equal(list.hidden, false);
  assert.deepEqual(Array.from(list.children, (row) => row.dataset.metric),
    ["cpu_utilization", "cpu_temperature", "memory_utilization"]);
  assert.equal(list.querySelector('[data-metric="cpu_utilization"] .meta-value').textContent, "12.00 %");
  expectRetained(card, () => card.setConfig({ ...card._config, show_telemetry: false }));
  assert.equal(list.hidden, true);
  expectRetained(card, () => update(card, { "sensor.cpu": state(13, { unit_of_measurement: "%" }) }));
  expectRetained(card, () => card.setConfig({ ...card._config, show_telemetry: true }));
  assert.equal(list.querySelector('[data-metric="cpu_utilization"] .meta-value').textContent, "13.00 %");
  expectRetained(card, () => update(card, { "sensor.cpu": state(14, { unit_of_measurement: '<img src="x">' }) }));
  assert.equal(list.querySelector('[data-metric="cpu_utilization"] .meta-value').textContent, '14.00 <img src="x">');
  assert.equal(list.querySelector("img"), null, "patched text must remain text, not HTML");
});

test("simultaneous port changes, configuration and language still update all content", async () => {
  const { card } = await fixture();
  const panel = card.shadowRoot.querySelector(".frontpanel");
  update(card, {
    "sensor.cpu": state(17, { unit_of_measurement: "%" }),
    "sensor.port_1_link_speed": state("100 Mbps"),
  });
  assert.notEqual(card.shadowRoot.querySelector(".frontpanel"), panel);
  assert.match(card.shadowRoot.innerHTML, /100 Mbps/);
  assert.equal(card.shadowRoot.querySelector('[data-metric="cpu_utilization"] .meta-value').textContent, "17.00 %");
  expectRetained(card, () => update(card, { "sensor.cpu": state(18, { unit_of_measurement: "%" }) }));
  card.setConfig({ ...card._config, name: "Updated card" });
  assert.equal(card.shadowRoot.querySelector(".title").textContent, "Updated card");
  card.hass = { ...card._hass, language: "de" };
  assert.equal(card.shadowRoot.querySelector('[data-metric="cpu_utilization"] .meta-label').textContent, "CPU-Auslastung:");
  assert.match(card.shadowRoot.innerHTML, /Geschwindigkeit/);
});

test("compact AP telemetry updates in place and respects its visibility option", async () => {
  const { card } = await fixture("U7PRO", { ap_compact_view: true, ap_compact_show_header_telemetry: true });
  const panel = card.shadowRoot.querySelector(".frontpanel");
  expectRetained(card, () => update(card, { "sensor.cpu": state(25, { unit_of_measurement: "%" }) }));
  assert.equal(card.shadowRoot.querySelector('[data-metric="cpu_utilization"] .meta-value').textContent, "25.00 %");
  expectRetained(card, () => card.setConfig({ ...card._config, ap_compact_show_header_telemetry: false }));
  assert.equal(card.shadowRoot.querySelector(".meta-list").hidden, true);
  expectRetained(card, () => update(card, { "sensor.cpu": state(26, { unit_of_measurement: "%" }) }));
  expectRetained(card, () => card.setConfig({ ...card._config, ap_compact_show_header_telemetry: true }));
  assert.equal(card.shadowRoot.querySelector('[data-metric="cpu_utilization"] .meta-value').textContent, "26.00 %");
  assert.equal(card.shadowRoot.querySelector(".frontpanel"), panel);
});
