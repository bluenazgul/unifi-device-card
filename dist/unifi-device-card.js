/* UniFi Device Card 0.0.0-dev.c2f212a */

// src/helpers.js
async function getUnifiDevices(hass) {
  const [devices, entities] = await Promise.all([
    hass.callWS({ type: "config/device_registry/list" }),
    hass.callWS({ type: "config/entity_registry/list" })
  ]);
  return devices.map((device) => {
    const devEntities = entities.filter(
      (e) => e.device_id === device.id
    );
    const text = ((device.name || "") + (device.model || "") + (device.manufacturer || "") + devEntities.map((e) => e.entity_id).join(" ")).toLowerCase();
    const isUnifi = text.includes("unifi") || text.includes("usw") || text.includes("udm") || text.includes("ucg");
    const isAP = text.includes("access point") || text.includes("uap");
    const isSwitch = text.includes("port_") || text.includes("switch");
    const isGateway = text.includes("udm") || text.includes("gateway");
    return {
      id: device.id,
      name: device.name_by_user || device.name || device.model || "Unknown",
      type: isGateway ? "gateway" : isSwitch ? "switch" : "other",
      valid: isUnifi && !isAP
    };
  }).filter((d) => d.valid).sort((a, b) => a.name.localeCompare(b.name));
}

// src/unifi-device-card-editor.js
var UnifiDeviceCardEditor = class extends HTMLElement {
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
            device_id
          }
        },
        bubbles: true,
        composed: true
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

      ${this._loading ? `<div>Loading UniFi devices...</div>` : `
            <select>
              <option value="">Select device</option>
              ${this._devices.map(
      (d) => `
                  <option value="${d.id}" ${d.id === this._config.device_id ? "selected" : ""}>
                    ${d.name} (${d.type})
                  </option>
                `
    ).join("")}
            </select>
          `}
    `;
    const select = this.shadowRoot.querySelector("select");
    if (select) {
      select.addEventListener("change", this._onChange.bind(this));
    }
  }
};
customElements.define("unifi-device-card-editor", UnifiDeviceCardEditor);

// src/unifi-device-card.js
var VERSION = "0.0.0-dev.c2f212a";
var UnifiDeviceCard = class extends HTMLElement {
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
};
customElements.define("unifi-device-card", UnifiDeviceCard);
window.customCards = window.customCards || [];
window.customCards.push({
  type: "unifi-device-card",
  name: "UniFi Device Card",
  description: "UniFi devices"
});
