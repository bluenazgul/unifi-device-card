/* UniFi Device Card 0.0.0-dev.f9a98ef */

// src/helpers.js
function normalize(value) {
  return String(value ?? "").trim();
}
function lower(value) {
  return normalize(value).toLowerCase();
}
function deviceLabel(device) {
  const name = normalize(device.name_by_user) || normalize(device.name) || normalize(device.model) || "Unknown device";
  const model = normalize(device.model);
  return model && lower(model) !== lower(name) ? `${name} \xB7 ${model}` : name;
}
function deviceText(device, entities) {
  return [
    device.name_by_user,
    device.name,
    device.model,
    device.manufacturer,
    device.hw_version,
    ...entities.flatMap((e) => [
      e.entity_id,
      e.original_name,
      e.name,
      e.platform,
      e.device_class
    ])
  ].filter(Boolean).join(" ").toLowerCase();
}
function classifyDevice(device, entities) {
  const text = deviceText(device, entities);
  const isAccessPoint = text.includes("access point") || text.includes(" uap") || text.includes("uap-") || text.includes(" nanohd") || text.includes(" u6") || text.includes(" u7") || text.includes(" mesh");
  if (isAccessPoint) return "access_point";
  const isGateway = text.includes("udm") || text.includes("ucg") || text.includes("uxg") || text.includes("dream machine") || text.includes("gateway") || text.includes("wan");
  if (isGateway) return "gateway";
  const isSwitch = text.includes("usw") || text.includes("us-") || text.includes("switch") || entities.some((e) => /_port_\d+_/.test(e.entity_id));
  if (isSwitch) return "switch";
  return "unknown";
}
function isLikelyUnifi(device, entities) {
  const text = deviceText(device, entities);
  return text.includes("unifi") || text.includes("ubiquiti") || text.includes("usw") || text.includes("us-") || text.includes("udm") || text.includes("ucg") || text.includes("uxg");
}
async function getAllDevices(hass) {
  const [devices, entities] = await Promise.all([
    hass.callWS({ type: "config/device_registry/list" }),
    hass.callWS({ type: "config/entity_registry/list" })
  ]);
  const entitiesByDevice = /* @__PURE__ */ new Map();
  for (const entity of entities) {
    if (!entity.device_id) continue;
    if (!entitiesByDevice.has(entity.device_id)) {
      entitiesByDevice.set(entity.device_id, []);
    }
    entitiesByDevice.get(entity.device_id).push(entity);
  }
  return { devices, entities, entitiesByDevice };
}
async function getUnifiDevices(hass) {
  const { devices, entitiesByDevice } = await getAllDevices(hass);
  return devices.map((device) => {
    const deviceEntities = entitiesByDevice.get(device.id) || [];
    const type = classifyDevice(device, deviceEntities);
    return {
      id: device.id,
      name: normalize(device.name_by_user) || normalize(device.name) || normalize(device.model) || "Unknown device",
      label: deviceLabel(device),
      model: normalize(device.model),
      manufacturer: normalize(device.manufacturer),
      type,
      valid: isLikelyUnifi(device, deviceEntities) && (type === "switch" || type === "gateway")
    };
  }).filter((d) => d.valid).sort((a, b) => a.label.localeCompare(b.label, "de", { sensitivity: "base" }));
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
var VERSION = "0.0.0-dev.f9a98ef";
var UnifiDeviceCard = class extends HTMLElement {
  static getConfigElement() {
    return document.createElement("unifi-device-card-editor");
  }
  static getStubConfig() {
    return {};
  }
  setConfig(config) {
    this._config = config || {};
    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" });
    }
    this._render();
  }
  set hass(hass) {
    this._hass = hass;
    this._render();
  }
  getCardSize() {
    return 3;
  }
  _render() {
    if (!this.shadowRoot) return;
    const deviceId = this._config?.device_id || "";
    const title = this._config?.name || `UniFi Device Card v${VERSION}`;
    if (!deviceId) {
      this.shadowRoot.innerHTML = `
        <ha-card header="${title}">
          <div class="content">
            Bitte im Karteneditor ein UniFi-Ger\xE4t ausw\xE4hlen.
          </div>
        </ha-card>

        <style>
          .content {
            padding: 16px;
            color: var(--secondary-text-color);
          }
        </style>
      `;
      return;
    }
    this.shadowRoot.innerHTML = `
      <ha-card header="${title}">
        <div class="content">
          <div><strong>Version:</strong> ${VERSION}</div>
          <div><strong>Device ID:</strong> ${deviceId}</div>
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
};
customElements.define("unifi-device-card", UnifiDeviceCard);
window.customCards = window.customCards || [];
window.customCards.push({
  type: "unifi-device-card",
  name: "UniFi Device Card",
  description: "A Lovelace card for supported UniFi switches and gateways."
});
