import { getUnifiDevices } from "./helpers.js";

class UnifiDeviceCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = {};
    this._devices = [];
    this._loading = false;
    this._loaded = false;
    this._error = "";
    this._hass = null;
    this._loadToken = 0;
  }

  setConfig(config) {
    this._config = config || {};
    this._render();
  }

  set hass(hass) {
    this._hass = hass;

    if (!this._loaded && !this._loading) {
      this._loadDevices();
    }
  }

  async _loadDevices() {
    if (!this._hass) return;

    this._loading = true;
    this._error = "";
    const token = ++this._loadToken;
    this._render();

    try {
      const devices = await getUnifiDevices(this._hass);

      if (token !== this._loadToken) return;

      this._devices = devices;
      this._loaded = true;
      this._loading = false;
      this._render();
    } catch (err) {
      if (token !== this._loadToken) return;

      console.error("[unifi-device-card] Failed to load devices", err);
      this._devices = [];
      this._loaded = true;
      this._loading = false;
      this._error = "UniFi-Geräte konnten nicht geladen werden.";
      this._render();
    }
  }

  _dispatch(config) {
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config },
        bubbles: true,
        composed: true,
      })
    );
  }

  _onDeviceChange(ev) {
    const device_id = ev.target.value || "";
    const next = { ...this._config };

    if (device_id) {
      next.device_id = device_id;

      const selected = this._devices.find((d) => d.id === device_id);
      if ((!next.name || next.name === "") && selected?.name) {
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
      name: ev.target.value || "",
    };
    this._config = next;
    this._dispatch(next);
  }

  _render() {
    const selectedId = this._config?.device_id || "";
    const selectedName = String(this._config?.name || "").replace(/"/g, "&quot;");

    const options = this._devices
      .map(
        (d) => `
          <option value="${d.id}" ${d.id === selectedId ? "selected" : ""}>
            ${d.label}
          </option>
        `
      )
      .join("");

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
          color: var(--primary-text-color);
        }

        select,
        input {
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
          line-height: 1.4;
        }

        .error {
          color: var(--error-color);
          font-size: 13px;
          line-height: 1.4;
        }
      </style>

      <div class="wrap">
        <div class="field">
          <label for="device">UniFi device</label>
          ${
            this._loading
              ? `<div class="hint">Lade unterstützte UniFi-Geräte…</div>`
              : `
                <select id="device">
                  <option value="">Select device…</option>
                  ${options}
                </select>
              `
          }
        </div>

        <div class="field">
          <label for="name">Display name</label>
          <input
            id="name"
            type="text"
            value="${selectedName}"
            placeholder="Optional"
          />
        </div>

        ${this._error ? `<div class="error">${this._error}</div>` : ""}
        ${
          !this._loading && !this._devices.length && !this._error
            ? `<div class="hint">Keine unterstützten UniFi Switches oder Gateways gefunden.</div>`
            : `<div class="hint">Es werden nur Geräte aus der UniFi-Integration angezeigt.</div>`
        }
      </div>
    `;

    this.shadowRoot
      .getElementById("device")
      ?.addEventListener("change", (ev) => this._onDeviceChange(ev));
    this.shadowRoot
      .getElementById("name")
      ?.addEventListener("input", (ev) => this._onNameInput(ev));
  }
}

customElements.define("unifi-device-card-editor", UnifiDeviceCardEditor);
