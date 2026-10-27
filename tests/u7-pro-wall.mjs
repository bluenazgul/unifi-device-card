import assert from "node:assert/strict";
import { test } from "node:test";

import { parseHTML } from "linkedom";

import { classifyDeviceType } from "../src/classify.js";
import { getDeviceLayout, resolveModelKey } from "../src/model-registry.js";

const { window } = parseHTML("<html><body></body></html>");
globalThis.__VERSION__ = "test";
globalThis.window = window;
globalThis.document = window.document;
globalThis.HTMLElement = window.HTMLElement;
globalThis.customElements = window.customElements;
globalThis.requestAnimationFrame = () => {};
window.customCards = [];
window.__UNIFI_DEVICE_CARD_VERSION_LOGGED__ = true;
await import("../src/unifi-device-card.js");
const Card = window.customElements.get("unifi-device-card");

const cases = [
  {
    label: "#313: model=U7PIW, empty model_id, hw_version=7",
    identity: { model: "U7PIW", model_id: "", hw_version: "7" },
    modelKey: "U7PROWALL", displayModel: "U7 Pro Wall", frontStyle: "ap-in-wall",
  },
  {
    label: "#313: model_id=U7PIW with a generic model name",
    identity: { model_id: "U7PIW", model: "UniFi Access Point", hw_version: "7" },
    modelKey: "U7PROWALL", displayModel: "U7 Pro Wall", frontStyle: "ap-in-wall",
  },
];

// Keep the legacy U7IW distinct from the current U7 In-Wall and Pro Wall.
// Exercise both HA identity fields so an exact model_id cannot mask a regression.
for (const [modelKey, displayModel, frontStyle, integratedPorts = false] of [
  ["U7PROWALL", "U7 Pro Wall", "ap-in-wall"],
  ["U7IW", "UAP AC In-Wall", "ap-in-wall", true],
  ["UAPA6A5", "U7 In-Wall", "ap-in-wall", true],
  ["U6IW", "U6 In-Wall", "ap-in-wall", true],
  ["U7PROXGWALL", "U7 Pro XG Wall", "ap-in-wall"],
  ["U7PRO", "U7 Pro", "ap-disc"],
  ["U7PROMAX", "U7 Pro Max", "ap-disc"],
  ["U7PROXG", "U7 Pro XG", "ap-disc"],
  ["U7MESH", "U7 Mesh", "ap-mesh-column"],
]) {
  for (const field of ["model", "model_id"]) {
    cases.push({
      label: `${field}=${modelKey}`,
      identity: { model: "UniFi Access Point", model_id: "", hw_version: "7", [field]: modelKey },
      modelKey, displayModel, frontStyle, integratedPorts,
    });
  }
}

async function renderCard(identity, compact) {
  const device = {
    id: "office-ap", name: "Office", manufacturer: "Ubiquiti",
    config_entry_id: "unifi", sw_version: "8.8.11.20161", ...identity,
  };
  const hass = {
    language: "en",
    states: {},
    async callWS({ type }) {
      if (type === "config/device_registry/list") return [device];
      if (type === "config/entity_registry/list") return [];
      if (type === "config/config_entries") return [{ entry_id: "unifi", domain: "unifi" }];
      throw new Error(`Unexpected registry request: ${type}`);
    },
  };
  const card = new Card();
  card.setConfig({ device_id: device.id, ap_compact_view: compact });
  card.hass = hass;
  await new Promise(setImmediate);
  assert.equal(card._loading, false);
  assert.ok(card._ctx, "the real HA registry identity must produce a device context");
  return card;
}

for (const { label, identity, modelKey, displayModel, frontStyle, integratedPorts = false } of cases) {
  test(`${label}: model resolution, AP classification and layout`, () => {
    assert.equal(resolveModelKey(identity), modelKey);
    for (const capabilities of [{}, { ports: true }, { ap_stats: true }]) {
      assert.equal(classifyDeviceType(identity, capabilities), "access_point");
    }
    const layout = getDeviceLayout(identity);
    assert.equal(layout.modelKey, modelKey);
    assert.equal(layout.displayModel, displayModel);
    assert.equal(layout.kind, "access_point");
    assert.equal(layout.frontStyle, frontStyle);
    assert.equal(layout.theme, "white");
    assert.equal(layout.supportsIntegratedPorts, integratedPorts ? true : undefined);
    assert.equal(layout.supportsApPortPanel, undefined);
    assert.equal(layout.portCount, 0);
    assert.deepEqual(layout.rows, []);
    assert.deepEqual(layout.specialSlots, []);
  });

  for (const compact of [false, true]) {
    test(`${label}: ${compact ? "compact" : "normal"} card rendering`, async (t) => {
      const card = await renderCard(identity, compact);
      t.after(() => card.disconnectedCallback());
      assert.equal(card._ctx.type, "access_point");
      assert.equal(card._ctx.layout.modelKey, modelKey);

      const root = card.shadowRoot;
      assert.equal(root.querySelector(".title")?.textContent, "Office");
      assert.equal(root.querySelector(".subtitle")?.textContent, `${displayModel} · FW 8.8.11.20161`);
      const apCard = root.querySelector("ha-card.ap-card");
      const apLayout = root.querySelector(".ap-layout");
      assert.ok(apCard, "the card must use the access-point renderer");
      assert.ok(apLayout);
      assert.equal(apCard.classList.contains("compact"), compact);
      assert.equal(apLayout.classList.contains("compact"), compact);
      assert.equal(root.querySelectorAll(".frontpanel").length, 1);
      assert.ok(apLayout.querySelector(`.frontpanel.${frontStyle}`));

      // Inspect rendered elements, not the stylesheet, which contains every shape.
      assert.equal(root.querySelectorAll(".ap-in-wall-device").length, frontStyle === "ap-in-wall" ? 1 : 0);
      assert.equal(root.querySelectorAll(".ap-in-wall-led").length, frontStyle === "ap-in-wall" ? 1 : 0);
      assert.equal(root.querySelectorAll(".ap-in-wall-logo").length, frontStyle === "ap-in-wall" ? 1 : 0);
      assert.equal(root.querySelectorAll(".ap-ring").length, frontStyle === "ap-disc" ? 1 : 0);
      assert.equal(root.querySelectorAll(".ap-mesh-column-device").length, frontStyle === "ap-mesh-column" ? 1 : 0);
    });
  }
}
