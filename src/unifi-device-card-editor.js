import {
  getRelevantEntityWarningsForDevice,
  getUnifiDevices,
} from "./helpers.js";
import { t } from "./translations.js";

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

    this._entityHint = null;
    this._entityHintLoading = false;
    this._entityHintToken = 0;

    // Track whether a full render has happened yet
    this._rendered = false;
  }

  setConfig(config) {
    this._config = config || {};
    if (this._hass && this._config?.device_id) {
      this._loadEntityHint(this._config.device_id);
    } else {
      this._entityHint = null;
    }
    // If the DOM already exists, patch individual fields instead of rebuilding
    if (this._rendered) {
      this._patchFields();
    } else {
      this._render();
    }
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._loaded && !this._loading) this._loadDevices();
    if (this._config?.device_id) this._loadEntityHint(this._config.device_id);
  }

  _t(key) { return t(this._hass, key); }

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
      this._devices = [];
      this._loaded = true;
      this._loading = false;
      this._error = this._t("editor_error");
      this._render();
    }
  }

  async _loadEntityHint(deviceId) {
    if (!this._hass || !deviceId) {
      this._entityHint = null;
      this._entityHintLoading = false;
      this._render();
      return;
    }

    const token = ++this._entityHintToken;
    this._entityHintLoading = true;
    this._render();

    try {
      const info = await getRelevantEntityWarningsForDevice(this._hass, deviceId);
      if (token !== this._entityHintToken) return;
      this._entityHint = info;
    } catch (err) {
      console.warn("[unifi-device-card] Failed to load entity warnings", err);
      if (token !== this._entityHintToken) return;
      this._entityHint = null;
    }

    this._entityHintLoading = false;
    this._render();
  }

  _dispatch(config) {
    this.dispatchEvent(new CustomEvent("config-changed", {
      detail: { config },
      bubbles: true,
      composed: true,
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
    const next = { ...this._config };

    if (newDeviceId) next.device_id = newDeviceId;
    else delete next.device_id;

    const currentName = String(next.name || "").trim();
    if (!currentName || currentName === oldAutoName) {
      if (newAutoName) next.name = newAutoName;
      else delete next.name;
    }

    this._config = next;
    this._dispatch(next);
    this._loadEntityHint(newDeviceId);
    this._render();
  }

  _onNameInput(ev) {
    const next = { ...this._config, name: ev.target.value || "" };
    this._config = next;
    this._dispatch(next);
    // No _render() here – the input keeps focus naturally
  }

  _onBackgroundInput(ev) {
    const value = String(ev.target.value || "").trim();
    const next = { ...this._config };

    if (value) next.background_color = value;
    else delete next.background_color;

    this._config = next;
    this._dispatch(next);
    // No _render() here – patching only what needs to change avoids focus loss
  }

  /**
   * Lightweight DOM patch: update only the values of existing input/select
   * elements without rebuilding the entire shadow DOM. This preserves focus
   * and cursor position while still keeping the displayed values in sync with
   * the latest config (e.g. after HA calls setConfig from the outside).
   */
  _patchFields() {
    const root = this.shadowRoot;
    if (!root) return;

    const nameEl = root.getElementById("name");
    const bgEl   = root.getElementById("background_color");

    // Only overwrite if the element is NOT currently focused (user is typing)
    if (nameEl && document.activeElement !== nameEl) {
      nameEl.value = this._config?.name || "";
    }
    if (bgEl && document.activeElement !== bgEl) {
      bgEl.value = this._config?.background_color || "";
    }
  }

  _renderEntityWarning() {
    if (this._entityHintLoading) {
      return `<div class="hint">${this._t("warning_checking")}</div>`;
    }

    const info = this._entityHint;
    if (!info || !info.total) return "";

    const lines = [];
    if (info.counts.port_switch) lines.push(`<li>${info.counts.port_switch} ${this._t("warning_entity_port_switch")}</li>`);
    if (info.counts.poe_switch)  lines.push(`<li>${info.counts.poe_switch} ${this._t("warning_entity_poe_switch")}</li>`);
    if (info.counts.poe_power)   lines.push(`<li>${info.counts.poe_power} ${this._t("warning_entity_poe_power")}</li>`);
    if (info.counts.link_speed)  lines.push(`<li>${info.counts.link_speed} ${this._t("warning_entity_link_speed")}</li>`);
    if (info.counts.rx_tx)       lines.push(`<li>${info.counts.rx_tx} ${this._t("warning_entity_rx_tx")}</li>`);
    if (info.counts.power_cycle) lines.push(`<li>${info.counts.power_cycle} ${this._t("warning_entity_power_cycle")}</li>`);
    if (info.counts.link_entity) lines.push(`<li>${info.counts.link_entity} ${this._t("warning_entity_link")}</li>`);

    const statusText = this._t("warning_status")
      .replace("{disabled}", `<strong>${info.disabled}</strong>`)
      .replace("{hidden}",   `<strong>${info.hidden}</strong>`);

    return `
      <div class="warning">
        <div class="warning-title">${this._t("warning_title")}</div>
        <div class="warning-text">${this._t("warning_body")}</div>
        <div class="warning-text">${statusText}</div>
        ${lines.length ? `<ul class="warning-list">${lines.join("")}</ul>` : ""}
        <div class="warning-text">
          ${this._t("warning_check_in")}<br>
          <strong>${this._t("warning_ha_path")}</strong>
        </div>
      </div>
    `;
  }

  _render() {
    const cfg     = this._config;
    const selId   = cfg?.device_id || "";
    const selName = String(cfg?.name || "").replace(/"/g, "&quot;");
    const selBg   = String(cfg?.background_color || "").replace(/"/g, "&quot;");

    const options = this._devices
      .map((d) => `<option value="${d.id}" ${d.id === selId ? "selected" : ""}>${d.label}</option>`)
      .join("");

    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }
        .wrap { display: grid; gap: 14px; }
        .section-title {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--secondary-text-color);
          padding-bottom: 4px;
          border-bottom: 1px solid var(--divider-color);
        }
        .field { display: grid; gap: 5px; }
        label {
          font-size: 13px;
          font-weight: 600;
          color: var(--primary-text-color);
        }
        select, input {
          width: 100%;
          box-sizing: border-box;
          min-height: 38px;
          padding: 7px 10px;
          border-radius: 8px;
          border: 1px solid var(--divider-color);
          background: var(--card-background-color);
          color: var(--primary-text-color);
          font: inherit;
        }
        .hint {
          color: var(--secondary-text-color);
          font-size: 12px;
          line-height: 1.4;
        }
        .error {
          color: var(--error-color);
          font-size: 12px;
          line-height: 1.4;
        }
        .warning {
          border: 1px solid var(--warning-color, #f59e0b);
          background: rgba(245, 158, 11, 0.08);
          color: var(--primary-text-color);
          border-radius: 8px;
          padding: 10px 12px;
          display: grid;
          gap: 6px;
        }
        .warning-title {
          font-size: 13px;
          font-weight: 700;
        }
        .warning-text {
          font-size: 12px;
          line-height: 1.4;
        }
        .warning-list {
          margin: 0;
          padding-left: 18px;
          font-size: 12px;
          line-height: 1.4;
        }
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
          <input
            id="name"
            type="text"
            value="${selName}"
            placeholder="${this._t("editor_name_hint")}"
          />
        </div>

        <div class="field">
          <label for="background_color">${this._t("editor_bg_label")}</label>
          <input
            id="background_color"
            type="text"
            value="${selBg}"
            placeholder="${this._t("editor_bg_hint")}"
          />
        </div>

        ${this._renderEntityWarning()}

        ${this._error ? `<div class="error">${this._error}</div>` : ""}
        ${!this._loading && !this._devices.length && !this._error
          ? `<div class="hint">${this._t("editor_no_devices")}</div>`
          : !this._loading
            ? `<div class="hint">${this._t("editor_hint")}</div>`
            : ""}
      </div>
    `;

    this._rendered = true;

    this.shadowRoot.getElementById("device")
      ?.addEventListener("change", (e) => this._onDeviceChange(e));
    this.shadowRoot.getElementById("name")
      ?.addEventListener("input", (e) => this._onNameInput(e));
    this.shadowRoot.getElementById("background_color")
      ?.addEventListener("input", (e) => this._onBackgroundInput(e));
  }
}

customElements.define("unifi-device-card-editor", UnifiDeviceCardEditor);
