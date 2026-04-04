import { getUnifiDevices } from "./helpers.js";

class UnifiDeviceCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._devices = [];
    this._loading = false;
  }

  setConfig(config) {
    this._config = config || {};
    this._render();
  }

  set hass(hass) {
    this._hass = hass;

    if (!this._devices.length && !this._loading) {
      this._loadDevices();
    }
  }

  async _loadDevices() {
    this._loading = true;
    this._render();

    this._devices = await getUnifiDevices(this._hass);

    this._loading = false;
    this._render();
  }

  _onChange(ev) {
    const device_id = ev.target.value;

    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: {
          config: {
            ...this._config,
            device_id,
          },
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  _render() {
    this.shadowRoot.innerHTML = `
      <style>
        select {
          width: 100%;
          padding: 8px;
          border-radius: 8px;
        }
      </style>

      ${
        this._loading
          ? `<div>Loading UniFi devices...</div>`
          : `
            <select>
              <option value="">Select device</option>
              ${this._devices
                .map(
                  (d) => `
                  <option value="${d.id}" ${
                    d.id === this._config.device_id ? "selected" : ""
                  }>
                    ${d.name} (${d.type})
                  </option>
                `
                )
                .join("")}
            </select>
          `
      }
    `;

    const select = this.shadowRoot.querySelector("select");
    if (select) {
      select.addEventListener("change", this._onChange.bind(this));
    }
  }
}

customElements.define("unifi-device-card-editor", UnifiDeviceCardEditor);
