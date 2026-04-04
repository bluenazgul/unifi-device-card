import { getUnifiDeviceById } from "./helpers.js";
import "./unifi-device-card-editor.js";

class UnifiDeviceCard extends HTMLElement {
  static getConfigElement() {
    return document.createElement("unifi-device-card-editor");
  }

  static getStubConfig() {
    return {
      name: "",
    };
  }

  setConfig(config) {
    if (!config || !config.device_id) {
      throw new Error("device_id is required");
    }

    this._config = config;

    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" });
    }

    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._loadDevice();
  }

  getCardSize() {
    return 4;
  }

  async _loadDevice() {
    if (!this._hass || !this._config?.device_id) return;

    try {
      this._device = await getUnifiDeviceById(this._hass, this._config.device_id);
      this._render();
    } catch (err) {
      console.error("[unifi-device-card] Failed to load selected device", err);
    }
  }

  _render() {
    if (!this.shadowRoot) return;

    if (!this._config?.device_id) {
      this.shadowRoot.innerHTML = `
        <ha-card header="UniFi Device Card">
          <div class="content">Bitte ein UniFi-Gerät auswählen.</div>
        </ha-card>
        <style>
          .content { padding: 16px; }
        </style>
      `;
      return;
    }

    const title =
      this._config?.name ||
      this._device?.name ||
      "UniFi Device";

    const type =
      this._device?.type === "switch"
        ? "Switch"
        : this._device?.type === "gateway"
        ? "Gateway"
        : this._device?.type || "Unbekannt";

    const model = this._device?.model || "Unbekannt";

    this.shadowRoot.innerHTML = `
      <ha-card header="${title}">
        <div class="content">
          <div><strong>Typ:</strong> ${type}</div>
          <div><strong>Modell:</strong> ${model}</div>
          <div><strong>Device ID:</strong> ${this._config.device_id}</div>
        </div>
      </ha-card>

      <style>
        .content {
          padding: 16px;
          display: grid;
          gap: 8px;
        }
      </style>
    `;
  }
}

customElements.define("unifi-device-card", UnifiDeviceCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "unifi-device-card",
  name: "UniFi Device Card",
  description: "A Lovelace card for supported UniFi switches and gateways.",
});
