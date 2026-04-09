import { LitElement, html, css } from "https://unpkg.com/lit@2.8.0/index.js?module";
import { getTranslations } from "./translations.js";
import {
  getAllData,
  getDeviceType,
  getDeviceTelemetry,
  getDeviceRebootEntity,
  getDeviceWarningInfo,
  getGatewayPortChoices,
} from "./helpers.js";

class UnifiDeviceCardEditor extends LitElement {
  static properties = {
    hass: { attribute: false },
    _config: { state: true },
    _devices: { state: true },
    _loading: { state: true },
    _error: { state: true },
    _warning: { state: true },
  };

  static styles = css`
    :host {
      display: block;
      color: var(--primary-text-color);
    }

    .wrap {
      display: grid;
      gap: 16px;
    }

    .section-title {
      font-size: 1rem;
      font-weight: 700;
      margin: 0 0 4px;
    }

    .field {
      display: grid;
      gap: 8px;
    }

    label {
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--primary-text-color);
    }

    select,
    input[type="text"] {
      box-sizing: border-box;
      width: 100%;
      padding: 10px 12px;
      border-radius: 12px;
      border: 1px solid var(--divider-color);
      background: var(--card-background-color);
      color: var(--primary-text-color);
      font: inherit;
      outline: none;
    }

    select:focus,
    input[type="text"]:focus {
      border-color: var(--primary-color);
    }

    input[type="text"]:disabled {
      opacity: 0.55;
      cursor: not-allowed;
    }

    .checkbox-row {
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: 500;
      user-select: none;
    }

    .checkbox-row input[type="checkbox"] {
      width: 18px;
      height: 18px;
      margin: 0;
      accent-color: var(--primary-color);
    }

    .hint {
      font-size: 0.83rem;
      line-height: 1.4;
      color: var(--secondary-text-color);
    }

    .error {
      padding: 12px 14px;
      border-radius: 14px;
      background: color-mix(in srgb, var(--error-color) 14%, transparent);
      border: 1px solid color-mix(in srgb, var(--error-color) 34%, transparent);
      color: var(--primary-text-color);
      font-size: 0.9rem;
    }

    .warn {
      padding: 14px 16px;
      border-radius: 16px;
      background: color-mix(in srgb, var(--warning-color, #ffa600) 12%, transparent);
      border: 1px solid color-mix(in srgb, var(--warning-color, #ffa600) 30%, transparent);
      color: var(--primary-text-color);
      display: grid;
      gap: 8px;
    }

    .warn-title {
      font-weight: 700;
      font-size: 0.95rem;
    }

    .warn-body,
    .warn-summary,
    .warn-path,
    .warn-list {
      font-size: 0.88rem;
      line-height: 1.45;
    }

    .warn-list {
      margin: 0;
      padding-left: 18px;
    }

    .warn-path code {
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      font-size: 0.84rem;
      word-break: break-word;
    }

    .loading {
      font-size: 0.92rem;
      color: var(--secondary-text-color);
    }
  `;

  constructor() {
    super();
    this._config = {};
    this._devices = [];
    this._loading = false;
    this._error = "";
    this._warning = null;
  }

  setConfig(config) {
    this._config = { ...config };
  }

  get _strings() {
    return getTranslations(this.hass?.language || "en");
  }

  _t(key, vars = {}) {
    let text = this._strings?.[key] ?? getTranslations("en")[key] ?? key;
    for (const [k, v] of Object.entries(vars)) {
      text = text.replaceAll(`{${k}}`, String(v));
    }
    return text;
  }

  _emitConfig(partial) {
    const next = { ...this._config, ...partial };

    if (!next.device_id) delete next.device_id;
    if (!next.name) delete next.name;
    if (!next.background_color) delete next.background_color;
    if (!next.wan_port || next.wan_port === "auto") delete next.wan_port;
    if (!next.wan2_port || next.wan2_port === "auto") delete next.wan2_port;
    if (next.wan2_port === "none") next.wan2_port = "none";
    if (next.show_name !== false) delete next.show_name;

    this.dispatchEvent(new CustomEvent("config-changed", {
      detail: { config: next },
      bubbles: true,
      composed: true,
    }));
  }

  async firstUpdated() {
    await this._loadDevices();
  }

  async updated(changed) {
    if (changed.has("hass") && this.hass && !this._devices.length && !this._loading) {
      await this._loadDevices();
    }

    if (changed.has("_config") && this.hass && this._config?.device_id) {
      await this._loadWarning();
    }
  }

  async _loadDevices() {
    if (!this.hass) return;

    this._loading = true;
    this._error = "";

    try {
      const data = await getAllData(this.hass);
      const devices = (data?.devices || [])
        .filter((device) => {
          const type = getDeviceType(device);
          return type === "switch" || type === "gateway";
        })
        .map((device) => {
          const entities = data?.entitiesByDevice?.get(device.id) || [];
          const type = getDeviceType(device);
          const telemetry = getDeviceTelemetry(entities);
          const rebootEntity = getDeviceRebootEntity(entities);

          return {
            id: device.id,
            name: device.name_by_user || device.name || device.model || device.id,
            model: device.model || "",
            manufacturer: device.manufacturer || "",
            sw_version: device.sw_version || "",
            type,
            hasTelemetry:
              !!telemetry.cpu_utilization_entity ||
              !!telemetry.cpu_temperature_entity ||
              !!telemetry.memory_utilization_entity,
            hasReboot: !!rebootEntity,
          };
        })
        .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));

      this._devices = devices;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("[unifi-device-card] editor device load failed", err);
      this._error = this._t("editor_error");
      this._devices = [];
    } finally {
      this._loading = false;
    }

    await this._loadWarning();
  }

  async _loadWarning() {
    if (!this.hass || !this._config?.device_id) {
      this._warning = null;
      return;
    }

    try {
      this._warning = await getDeviceWarningInfo(this.hass, this._config.device_id);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn("[unifi-device-card] warning info failed", err);
      this._warning = null;
    }
  }

  _onDeviceChange(ev) {
    const deviceId = ev.target.value || "";
    const nextDevice = this._devices.find((d) => d.id === deviceId) || null;
    const prevDevice = this._devices.find((d) => d.id === this._config?.device_id) || null;
    const currentName = this._config?.name || "";
    const currentMatchesPrevious = !currentName || currentName === (prevDevice?.name || "");

    const nextConfig = {
      device_id: deviceId || undefined,
      wan_port: undefined,
      wan2_port: undefined,
    };

    if (!deviceId) {
      nextConfig.name = undefined;
    } else if (currentMatchesPrevious) {
      nextConfig.name = nextDevice?.name || undefined;
    }

    this._emitConfig(nextConfig);
  }

  _onNameInput(ev) {
    this._emitConfig({ name: ev.target.value || undefined });
  }

  _onShowNameChange(ev) {
    const checked = !!ev.target.checked;
    this._emitConfig({ show_name: checked ? undefined : false });
  }

  _onBackgroundInput(ev) {
    this._emitConfig({ background_color: ev.target.value || undefined });
  }

  _onWanPortChange(ev) {
    const value = ev.target.value || "auto";
    this._emitConfig({ wan_port: value === "auto" ? undefined : value });
  }

  _onWan2PortChange(ev) {
    const value = ev.target.value || "auto";
    this._emitConfig({ wan2_port: value === "auto" ? undefined : value });
  }

  _renderDeviceOptions() {
    if (this._loading) {
      return html`<option value="">${this._t("editor_device_loading")}</option>`;
    }

    if (!this._devices.length) {
      return html`<option value="">${this._t("editor_no_devices")}</option>`;
    }

    const current = this._config?.device_id || "";

    return [
      html`<option value="">${this._t("editor_device_select")}</option>`,
      ...this._devices.map((device) => {
        const typeLabel = this._t(device.type === "gateway" ? "type_gateway" : "type_switch");
        const secondary = [device.model, typeLabel].filter(Boolean).join(" · ");
        return html`
          <option value=${device.id} ?selected=${current === device.id}>
            ${secondary ? `${device.name} — ${secondary}` : device.name}
          </option>
        `;
      }),
    ];
  }

  _renderGatewaySelectors() {
    if (!this.hass || !this._config?.device_id) return null;

    const selected = this._devices.find((d) => d.id === this._config.device_id);
    if (!selected || selected.type !== "gateway") return null;

    const choices = getGatewayPortChoices(this.hass, this._config.device_id);
    const wanValue = this._config?.wan_port || "auto";
    const wan2Value = this._config?.wan2_port || "auto";

    return html`
      <div class="field">
        <label for="wan_port">${this._t("editor_wan_port_label")}</label>
        <select id="wan_port">
          <option value="auto" ?selected=${wanValue === "auto"}>${this._t("editor_wan_port_auto")}</option>
          ${choices.map((choice) => html`
            <option value=${choice.value} ?selected=${wanValue === choice.value}>${choice.label}</option>
          `)}
        </select>
        <div class="hint">${this._t("editor_wan_port_hint")}</div>
      </div>

      <div class="field">
        <label for="wan2_port">${this._t("editor_wan2_port_label")}</label>
        <select id="wan2_port">
          <option value="auto" ?selected=${wan2Value === "auto"}>${this._t("editor_wan_port_auto")}</option>
          <option value="none" ?selected=${wan2Value === "none"}>${this._t("editor_wan2_port_none")}</option>
          ${choices.map((choice) => html`
            <option value=${choice.value} ?selected=${wan2Value === choice.value}>${choice.label}</option>
          `)}
        </select>
        <div class="hint">${this._t("editor_wan2_port_hint")}</div>
      </div>
    `;
  }

  _renderWarning() {
    const w = this._warning;
    if (!w) return null;
    if (!w.disabledCount && !w.hiddenCount) return null;

    const items = [];

    for (const [key, count] of Object.entries(w.groups || {})) {
      if (!count) continue;
      items.push(html`<li>${count} ${this._t(key)}</li>`);
    }

    return html`
      <div class="warn">
        <div class="warn-title">${this._t("warning_title")}</div>
        <div class="warn-body">${this._t("warning_body")}</div>
        <div class="warn-summary">
          ${this._t("warning_status", {
            disabled: w.disabledCount || 0,
            hidden: w.hiddenCount || 0,
          })}
        </div>
        ${items.length ? html`<ul class="warn-list">${items}</ul>` : null}
        <div class="warn-path">
          ${this._t("warning_check_in")}<br />
          <code>${this._t("warning_ha_path")}</code>
        </div>
      </div>
    `;
  }

  render() {
    const deviceValue = this._config?.device_id || "";
    const nameValue = this._config?.name || "";
    const showName = this._config?.show_name !== false;
    const backgroundValue = this._config?.background_color || "";

    return html`
      <div class="wrap">
        <div class="section-title">${this._t("editor_device_title")}</div>

        <div class="field">
          <label for="device_id">${this._t("editor_device_label")}</label>
          <select id="device_id" @change=${this._onDeviceChange}>
            ${this._renderDeviceOptions()}
          </select>
          <div class="hint">${this._t("editor_hint")}</div>
        </div>

        ${this._error ? html`<div class="error">${this._error}</div>` : null}

        <div class="field">
          <label>${this._t("editor_name_toggle_label")}</label>
          <label class="checkbox-row">
            <input
              id="show_name"
              type="checkbox"
              ?checked=${showName}
              @change=${this._onShowNameChange}
            />
            <span>${this._t("editor_name_toggle_text")}</span>
          </label>
          <div class="hint">${this._t("editor_name_toggle_hint")}</div>
        </div>

        <div class="field">
          <label for="name">${this._t("editor_name_label")}</label>
          <input
            id="name"
            type="text"
            .value=${nameValue}
            ?disabled=${!showName}
            @input=${this._onNameInput}
          />
          <div class="hint">${this._t("editor_name_hint")}</div>
        </div>

        ${this._renderGatewaySelectors()}

        <div class="field">
          <label for="background_color">${this._t("editor_bg_label")}</label>
          <input
            id="background_color"
            type="text"
            .value=${backgroundValue}
            @input=${this._onBackgroundInput}
            placeholder="var(--card-background-color)"
          />
          <div class="hint">${this._t("editor_bg_hint")}</div>
        </div>

        ${deviceValue && !this._warning
          ? html`<div class="loading">${this._t("warning_checking")}</div>`
          : null}

        ${this._renderWarning()}
      </div>
    `;
  }
}

customElements.define("unifi-device-card-editor", UnifiDeviceCardEditor);
