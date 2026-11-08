import assert from "node:assert/strict";
import { test } from "node:test";
import { parseHTML } from "linkedom";
import { getTranslations, t } from "../src/translations.js";

const { window } = parseHTML("<html><body></body></html>");
globalThis.window = window;
globalThis.document = window.document;
globalThis.HTMLElement = window.HTMLElement;
globalThis.customElements = window.customElements;
await import("../src/unifi-device-card-editor.js");
const Editor = window.customElements.get("unifi-device-card-editor");

const headings = {
  en: "Header", de: "Header", nl: "Kop", fr: "En-tête", es: "Encabezado", it: "Intestazione",
  sv: "Sidhuvud", da: "Sidehoved", no: "Overskrift", fi: "Otsake", pl: "Nagłówek", cs: "Záhlaví",
};
const controls = ["show_header", "show_header_button", "show_panel_label"];

for (const [language, heading] of Object.entries(headings)) {
  test(`${language}: header visibility controls use localized editor text`, () => {
    const strings = getTranslations(language);
    assert.equal(strings.editor_header_label, heading);
    for (const control of controls) {
      const key = `editor_${control}_text`;
      assert.ok(strings[key]?.trim(), `${language}: missing ${key}`);
      // A presence check alone accepts the English values spread into six locales.
      if (language !== "en") {
        assert.notEqual(strings[key], getTranslations("en")[key], `${language}: ${key} uses English`);
      }
      assert.equal(t({ language: `${language}-XX` }, key), strings[key]);
    }

    const editor = new Editor();
    editor._hass = { language, states: {} };
    editor._config = { device_id: "gateway" };
    editor._deviceCtx = { type: "gateway", layout: {}, numberedPorts: [] };
    editor._render();
    const headerField = editor.shadowRoot.getElementById("show_header").closest(".field");
    assert.equal(headerField.querySelector("label").textContent, heading);
    assert.ok(headerField.querySelector("#show_header_button"));
    assert.ok(headerField.querySelector("#show_telemetry"));
    for (const control of controls) {
      const input = editor.shadowRoot.getElementById(control);
      assert.equal(input.closest("label").querySelector("span").textContent, strings[`editor_${control}_text`]);
    }
    assert.ok(editor.shadowRoot.getElementById("show_panel_label").closest(".field").querySelector("#show_panel"));
  });
}
