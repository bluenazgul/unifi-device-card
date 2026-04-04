import { getUnifiDevices } from "./helpers.js";
import "./unifi-device-card-editor.js";

const VERSION = __VERSION__;

class UnifiDeviceCard extends HTMLElement {
  static getConfigElement() {
    return document.createElement("unifi-device-card-editor");
  }

  setConfig(config) {
    if (!config.device_id) {
      throw new Error("device_id required");
    }

    this._config = config;

    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" });
    }
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  _render() {
    this.shadowRoot.innerHTML = `
      <ha-card header="UniFi Device Card v${VERSION}">
        <div style="padding:16px">
          Device ID: ${this._config.device_id}
        </div>
      </ha-card>
    `;
  }
}

customElements.define("unifi-device-card", UnifiDeviceCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "unifi-device-card",
  name: "UniFi Device Card",
  description: "UniFi devices",
});
