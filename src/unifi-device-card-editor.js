import { getUnifiDevices } from "./helpers.js";
import { t } from "./translations.js";

class UnifiDeviceCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config    = {};
    this._devices   = [];
    this._loading   = false;
    this._loaded    = false;
    this._error     = "";
    this._hass      = null;
    this._loadToken = 0;
  }

  setConfig(config) {
    this._config = config || {};
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._loaded && !this._loading) this._loadDevices();
  }

  _t(key) { return t(this._hass, key); }

  async _loadDevices() {
    if (!this._hass) return;
    this._loading = true;
    this._error   = "";
    const token   = ++this._loadToken;
    this._render();
    try {
      const devices = await getUnifiDevices(this._hass);
      if (token !== this._loadToken) return;
      this._devices = devices;
      this._loaded  = true;
      this._loading = false;
      this._render();
    } catch (err) {
      if (token !== this._loadToken) return;
      this._devices = [];
      this._loaded  = true;
      this._loading = false;
      this._error   = this._t("editor_error");
      this._render();
    }
  }

  _dispatch(config) {
    this.dispatchEvent(new CustomEvent("config-changed", {
      detail: { config }, bubbles: true, composed: true,
    }));
  }

  _selectedDeviceName(deviceId) {
    return this._devices.find((d) => d.id === deviceId)?.name || "";
  }

  _onDeviceChange(ev) {
    const newDeviceId = ev.target.value || "";
    const oldDeviceId = this._config?.device_id || "";
    const oldAutoName = this._selectedDeviceName(oldDeviceId);
    const newAutoName = this._selectedDeviceName(newDeviceId);
    const next        = { ...this._config };
    if (newDeviceId) next.device_id = newDeviceId;
    else delete next.device_id;
    const currentName = String(next.name || "").trim();
    if (!currentName || currentName === oldAutoName) {
      if (newAutoName) next.name = newAutoName;
      else delete next.name;
    }
    this._config = next;
    this._dispatch(next);
    this._render();
  }

  _onNameInput(ev) {
    const next = { ...this._config, name: ev.target.value || "" };
    this._config = next;
    this._dispatch(next);
  }

  _render() {
    const cfg     = this._config;
    const selId   = cfg?.device_id || "";
    const selName = String(cfg?.name || "").replace(/"/g, "&quot;");

    const options = this._devices
      .map((d) => `<option value="${d.id}" ${d.id === selId ? "selected" : ""}>${d.label}</option>`)
      .join("");

    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }
        .wrap { display: grid; gap: 14px; }
        .section-title {
          font-size: 11px; font-weight: 700; letter-spacing: 0.08em;
          text-transform: uppercase; color: var(--secondary-text-color);
          padding-bottom: 4px; border-bottom: 1px solid var(--divider-color);
        }
        .field { display: grid; gap: 5px; }
        label { font-size: 13px; font-weight: 600; color: var(--primary-text-color); }
        select, input {
          width: 100%; box-sizing: border-box; min-height: 38px;
          padding: 7px 10px; border-radius: 8px;
          border: 1px solid var(--divider-color);
          background: var(--card-background-color);
          color: var(--primary-text-color); font: inherit;
        }
        .hint  { color: var(--secondary-text-color); font-size: 12px; line-height: 1.4; }
        .error { color: var(--error-color);           font-size: 12px; line-height: 1.4; }
      </style>

      <div class="wrap">
        <div class="section-title">${this._t("editor_device_title")}</div>

        <div class="field">
          <label for="device">${this._t("editor_device_label")}</label>
          ${this._loading
            ? `<div class="hint">${this._t("editor_device_loading")}</div>`
            : `<select id="device">
                 <option value="">${this._t("editor_device_select")}</option>
                 ${options}
               </select>`}
        </div>

        <div class="field">
          <label for="name">${this._t("editor_name_label")}</label>
          <input id="name" type="text" value="${selName}"
            placeholder="${this._t("editor_name_hint")}" />
        </div>

        ${this._error ? `<div class="error">${this._error}</div>` : ""}
        ${!this._loading && !this._devices.length && !this._error
          ? `<div class="hint">${this._t("editor_no_devices")}</div>`
          : !this._loading
            ? `<div class="hint">${this._t("editor_hint")}</div>`
            : ""}
      </div>
    `;

    this.shadowRoot.getElementById("device")
      ?.addEventListener("change", (e) => this._onDeviceChange(e));
    this.shadowRoot.getElementById("name")
      ?.addEventListener("input",  (e) => this._onNameInput(e));
  }
}

customElements.define("unifi-device-card-editor", UnifiDeviceCardEditor);
