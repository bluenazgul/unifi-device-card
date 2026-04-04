/* UniFi Device Card 0.0.0-dev.85a2427 */

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
    this._config = {};
    this._devices = [];
    this._loading = false;
    this._error = "";
  }
  setConfig(config) {
    this._config = config || {};
    this._render();
  }
  set hass(hass) {
    this._hass = hass;
    if (!this._loading && !this._devices.length) {
      this._loadDevices();
    } else {
      this._render();
    }
  }
  async _loadDevices() {
    if (!this._hass) return;
    this._loading = true;
    this._error = "";
    this._render();
    try {
      this._devices = await getUnifiDevices(this._hass);
    } catch (err) {
      console.error("[unifi-device-card] Failed to load devices", err);
      this._error = "UniFi-Ger\xE4te konnten nicht geladen werden.";
      this._devices = [];
    }
    this._loading = false;
    this._render();
  }
  _dispatch(config) {
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config },
        bubbles: true,
        composed: true
      })
    );
  }
  _onDeviceChange(ev) {
    const device_id = ev.target.value || "";
    const next = { ...this._config };
    if (device_id) {
      next.device_id = device_id;
      const selected = this._devices.find((d) => d.id === device_id);
      if (!next.name && selected?.name) {
        next.name = selected.name;
      }
    } else {
      delete next.device_id;
    }
    this._config = next;
    this._dispatch(next);
    this._render();
  }
  _onNameInput(ev) {
    const next = {
      ...this._config,
      name: ev.target.value || ""
    };
    this._config = next;
    this._dispatch(next);
  }
  _render() {
    const options = this._devices.map(
      (d) => `
          <option value="${d.id}" ${d.id === this._config.device_id ? "selected" : ""}>
            ${d.label} (${d.type})
          </option>
        `
    ).join("");
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
        }

        .wrap {
          display: grid;
          gap: 16px;
        }

        .field {
          display: grid;
          gap: 6px;
        }

        label {
          font-size: 14px;
          font-weight: 600;
        }

        select, input {
          width: 100%;
          box-sizing: border-box;
          min-height: 40px;
          padding: 8px 10px;
          border-radius: 10px;
          border: 1px solid var(--divider-color);
          background: var(--card-background-color);
          color: var(--primary-text-color);
          font: inherit;
        }

        .hint {
          color: var(--secondary-text-color);
          font-size: 13px;
        }

        .error {
          color: var(--error-color);
          font-size: 13px;
        }
      </style>

      <div class="wrap">
        <div class="field">
          <label for="device">UniFi device</label>
          ${this._loading ? `<div class="hint">Lade unterst\xFCtzte UniFi-Ger\xE4te\u2026</div>` : `
                <select id="device">
                  <option value="">Select device\u2026</option>
                  ${options}
                </select>
              `}
        </div>

        <div class="field">
          <label for="name">Display name</label>
          <input
            id="name"
            type="text"
            value="${String(this._config.name || "").replace(/"/g, "&quot;")}"
            placeholder="Optional"
          />
        </div>

        ${this._error ? `<div class="error">${this._error}</div>` : ""}
        ${!this._loading && !this._devices.length && !this._error ? `<div class="hint">Keine unterst\xFCtzten UniFi Switches oder Gateways gefunden.</div>` : `<div class="hint">Es werden nur UniFi Switches und Gateways angezeigt.</div>`}
      </div>
    `;
    this.shadowRoot.getElementById("device")?.addEventListener("change", (ev) => this._onDeviceChange(ev));
    this.shadowRoot.getElementById("name")?.addEventListener("input", (ev) => this._onNameInput(ev));
  }
};
customElements.define("unifi-device-card-editor", UnifiDeviceCardEditor);

// src/unifi-device-card.js
var VERSION = "0.0.0-dev.85a2427";
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
