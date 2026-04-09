import {
  getDeviceContext,
  getRelevantEntityWarningsForDevice,
  getUnifiDevices,
} from "./helpers.js";
import { t } from "./translations.js";

function slotPortType(slot) {
  const key = String(slot.key || "").toLowerCase();
  if (key === "wan" || key === "wan2") return "wan";
  if (key.includes("sfp_wan") || key.includes("wan_sfp")) return "sfp_wan";
  if (key.includes("sfp")) return "sfp";
  return "lan";
}

function slotDropdownLabel(slot, tFn) {
  const type = slotPortType(slot);
  const portNum = slot.port != null ? ` (Port ${slot.port})` : "";

  switch (type) {
    case "wan":
      return `${slot.label}${portNum}`;
    case "sfp_wan":
      return `${slot.label}${portNum} — ${tFn("editor_wan_port_sfpwan")}`;
    case "sfp":
      return `${slot.label}${portNum} — ${tFn("editor_wan_port_sfp")}`;
    default:
      return `${slot.label}${portNum} — ${tFn("editor_wan_port_lan")}`;
  }
}

function buildGatewayRoleOptions(layout, tFn, { includeNone = false } = {}) {
  const options = [{ value: "auto", label: tFn("editor_wan_port_auto") }];

  if (includeNone) {
    options.push({ value: "none", label: tFn("editor_wan2_port_none") });
  }

  if (!layout) return options;

  for (const slot of layout.specialSlots || []) {
    options.push({
      value: slot.key,
      label: slotDropdownLabel(slot, tFn),
      type: slotPortType(slot),
      port: slot.port ?? null,
    });
  }

  const allPortNums = (layout.rows || []).flat();
  for (const portNum of allPortNums) {
    options.push({
      value: `port_${portNum}`,
      label: `Port ${portNum} — ${tFn("editor_wan_port_lan")}`,
      type: "lan",
      port: portNum,
    });
  }

  const seen = new Set();
  return options.filter((option) => {
    const key = `${option.value}|${option.label}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function resolveSelectionForConflict(value, roleKey, layout) {
  const normalized = String(value || "auto");
  if (normalized === "none") return "none";
  if (normalized !== "auto") return normalized;

  const defaultSlot = (layout?.specialSlots || []).find((slot) => slot.key === roleKey);
  if (!defaultSlot) return roleKey === "wan2" ? "none" : "auto";
  return defaultSlot.port != null ? `port_${defaultSlot.port}` : defaultSlot.key;
}

function roleSelectionsConflict(a, aRole, b, bRole, layout) {
  const resolvedA = resolveSelectionForConflict(a, aRole, layout);
  const resolvedB = resolveSelectionForConflict(b, bRole, layout);
  if (resolvedA === "none" || resolvedB === "none") return false;
  return resolvedA === resolvedB;
}

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
    this._rendered = false;
    this._deviceCtx = null;
    this._deviceCtxLoading = false;
    this._deviceCtxToken = 0;
    this._lastHintDeviceId = null;
    this._lastCtxDeviceId = null;
  }

  setConfig(config) {
    const prevDeviceId = this._config?.device_id || "";
    this._config = config || {};

    const nextDeviceId = this._config?.device_id || "";
    if (this._hass && nextDeviceId) {
      if (nextDeviceId !== prevDeviceId || !this._entityHint) {
        this._loadEntityHint(nextDeviceId);
      }
      if (nextDeviceId !== prevDeviceId || !this._deviceCtx) {
        this._loadDeviceCtx(nextDeviceId);
      }
    } else {
      this._entityHint = null;
      this._deviceCtx = null;
      this._lastHintDeviceId = null;
      this._lastCtxDeviceId = null;
    }

    if (this._rendered) {
      this._patchFields();
      this._patchWarning();
    } else {
      this._render();
    }
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._loaded && !this._loading) {
      this._loadDevices();
    }

    const deviceId = this._config?.device_id || "";
    if (deviceId) {
      if (deviceId !== this._lastHintDeviceId || !this._entityHint) {
        this._loadEntityHint(deviceId);
      }
      if (deviceId !== this._lastCtxDeviceId || !this._deviceCtx) {
        this._loadDeviceCtx(deviceId);
      }
    }
  }

  _t(key) {
    return t(this._hass, key);
  }

  async _loadDevices() {
    if (!this._hass) return;
    this._loading = true;
    this._error = "";
    this._render();

    const token = ++this._loadToken;
    try {
      const devices = await getUnifiDevices(this._hass);
      if (token !== this._loadToken) return;
      this._devices = devices;
      this._loaded = true;
    } catch (err) {
      console.error("[unifi-device-card] failed to load devices", err);
      if (token !== this._loadToken) return;
      this._devices = this._devices || [];
      this._error = this._t("editor_error");
    }

    this._loading = false;
    this._render();
  }

  async _loadEntityHint(deviceId) {
    if (!this._hass || !deviceId) return;

    this._entityHintLoading = true;
    this._lastHintDeviceId = deviceId;
    this._patchWarning();

    const token = ++this._entityHintToken;
    try {
      const result = await getRelevantEntityWarningsForDevice(this._hass, deviceId);
      if (token !== this._entityHintToken) return;
      this._entityHint = result;
    } catch (err) {
      console.error("[unifi-device-card] failed to load entity warning", err);
      if (token !== this._entityHintToken) return;
    }

    this._entityHintLoading = false;
    this._patchWarning();
  }

  async _loadDeviceCtx(deviceId) {
    if (!this._hass || !deviceId) return;

    this._deviceCtxLoading = true;
    this._lastCtxDeviceId = deviceId;
    this._patchFields();

    const token = ++this._deviceCtxToken;
    try {
      const result = await getDeviceContext(this._hass, deviceId);
      if (token !== this._deviceCtxToken) return;

      if (result) {
        this._deviceCtx = result;
      }
    } catch (err) {
      console.error("[unifi-device-card] failed to load device context for editor", err);
      if (token !== this._deviceCtxToken) return;
    }

    this._deviceCtxLoading = false;
    this._patchFields();
  }

  _emitConfig(partial) {
    const next = { ...this._config, ...partial };

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
    const nextValue = ev.target.value || "auto";
    const currentWan2 = this._config?.wan2_port || "auto";
    const layout = this._deviceCtx?.layout;

    let nextWan2 = currentWan2;
    if (roleSelectionsConflict(nextValue, "wan", currentWan2, "wan2", layout)) {
      nextWan2 = "none";
    }

    this._emitConfig({
      wan_port: nextValue === "auto" ? undefined : nextValue,
      wan2_port: nextWan2 === "auto" ? undefined : nextWan2,
    });
  }

  _onWan2PortChange(ev) {
    const nextValue = ev.target.value || "auto";
    const currentWan = this._config?.wan_port || "auto";
    const layout = this._deviceCtx?.layout;

    let safeValue = nextValue;
    if (roleSelectionsConflict(currentWan, "wan", nextValue, "wan2", layout)) {
      safeValue = "none";
    }

    this._emitConfig({
      wan2_port: safeValue === "auto" ? undefined : safeValue,
    });
  }

  _warningItems() {
    const hint = this._entityHint;
    if (!hint) return [];

    const order = [
      "port_switch",
      "poe_switch",
      "poe_power",
      "link_speed",
      "rx_tx",
      "power_cycle",
      "link",
    ];

    return order
      .map((key) => ({
        key,
        count: (hint.disabled?.[key]?.length || 0) + (hint.hidden?.[key]?.length || 0),
      }))
      .filter((item) => item.count > 0);
  }

  _warningHTML() {
    if (this._entityHintLoading && !this._entityHint) {
      return `<div class="warn loading">${this._t("warning_checking")}</div>`;
    }

    if (!this._entityHint) return "";

    const disabled = this._entityHint?.disabledCount || 0;
    const hidden = this._entityHint?.hiddenCount || 0;
    const items = this._warningItems();

    const summary = this._t("warning_status")
      .replace("{disabled}", String(disabled))
      .replace("{hidden}", String(hidden));

    const list = items.length
      ? `<ul>${items
          .map(
            (item) =>
              `<li><strong>${item.count}</strong> ${this._t(`warning_entity_${item.key}`)}</li>`
          )
          .join("")}</ul>`
      : "";

    return `
      <div class="warn">
        <div class="warn-title">${this._t("warning_title")}</div>
        <div class="warn-body">${this._t("warning_body")}</div>
        <div class="warn-status">${summary}</div>
        ${list}
        <div class="warn-path">
          <strong>${this._t("warning_check_in")}</strong><br>
          ${this._t("warning_ha_path")}
        </div>
      </div>
    `;
  }

  _gatewayControlsHTML() {
    const deviceId = this._config?.device_id || "";
    const selectedDevice = this._devices.find((d) => d.id === deviceId) || null;
    const isGateway = this._deviceCtx?.type === "gateway" || selectedDevice?.type === "gateway";

    if (!isGateway) return "";

    const layout = this._deviceCtx?.layout;
    if (!layout) {
      return `
        <div class="field">
          <label>${this._t("editor_wan_port_label")}</label>
          <select id="wan_port" disabled>
            <option value="auto">${this._t("editor_device_loading")}</option>
          </select>
          <div class="hint">${this._t("editor_wan_port_hint")}</div>
        </div>

        <div class="field">
          <label>${this._t("editor_wan2_port_label")}</label>
          <select id="wan2_port" disabled>
            <option value="auto">${this._t("editor_device_loading")}</option>
          </select>
          <div class="hint">${this._t("editor_wan2_port_hint")}</div>
        </div>
      `;
    }

    const wanOptions = buildGatewayRoleOptions(layout, (k) => this._t(k));
    const wan2Options = buildGatewayRoleOptions(layout, (k) => this._t(k), { includeNone: true });

    const selectedWan = this._config?.wan_port || "auto";
    let selectedWan2 = this._config?.wan2_port || "auto";

    if (roleSelectionsConflict(selectedWan, "wan", selectedWan2, "wan2", layout)) {
      selectedWan2 = "none";
    }

    return `
      <div class="field">
        <label>${this._t("editor_wan_port_label")}</label>
        <select id="wan_port">
          ${wanOptions
            .map(
              (opt) =>
                `<option value="${opt.value}" ${opt.value === selectedWan ? "selected" : ""}>${opt.label}</option>`
            )
            .join("")}
        </select>
        <div class="hint">${this._t("editor_wan_port_hint")}</div>
      </div>

      <div class="field">
        <label>${this._t("editor_wan2_port_label")}</label>
        <select id="wan2_port">
          ${wan2Options
            .map((opt) => {
              const disabled =
                opt.value !== "auto" &&
                opt.value !== "none" &&
                roleSelectionsConflict(selectedWan, "wan", opt.value, "wan2", layout);

              return `<option value="${opt.value}" ${opt.value === selectedWan2 ? "selected" : ""} ${
                disabled ? "disabled" : ""
              }>${opt.label}</option>`;
            })
            .join("")}
        </select>
        <div class="hint">${this._t("editor_wan2_port_hint")}</div>
      </div>
    `;
  }

  _styles() {
    return `<style>
      :host {
        display: block;
      }

      .wrap {
        display: grid;
        gap: 14px;
      }

      .section-title {
        font-size: 0.95rem;
        font-weight: 700;
        margin: 2px 0 0;
      }

      .field {
        display: grid;
        gap: 6px;
      }

      label {
        font-weight: 600;
      }

      select,
      input[type="text"] {
        box-sizing: border-box;
        width: 100%;
        padding: 10px 12px;
        border-radius: 10px;
        border: 1px solid var(--divider-color);
        background: var(--card-background-color);
        color: var(--primary-text-color);
        font: inherit;
      }

      .checkbox-row {
        display: flex;
        align-items: center;
        gap: 10px;
        font-weight: 500;
      }

      .checkbox-row input[type="checkbox"] {
        width: 18px;
        height: 18px;
        margin: 0;
      }

      .hint {
        color: var(--secondary-text-color);
        font-size: 0.82rem;
      }

      .warn {
        border-radius: 12px;
        padding: 12px 14px;
        background: rgba(245, 158, 11, 0.12);
        border: 1px solid rgba(245, 158, 11, 0.35);
        color: var(--primary-text-color);
      }

      .warn.loading {
        background: rgba(59, 130, 246, 0.12);
        border-color: rgba(59, 130, 246, 0.35);
      }

      .warn-title {
        font-weight: 700;
        margin-bottom: 6px;
      }

      .warn-body,
      .warn-status,
      .warn-path {
        font-size: 0.9rem;
        line-height: 1.45;
      }

      .warn ul {
        margin: 10px 0 10px 18px;
        padding: 0;
      }

      .warn li {
        margin: 4px 0;
      }

      .empty,
      .error {
        font-size: 0.92rem;
      }

      .error {
        color: var(--error-color);
      }
    </style>`;
  }

  _render() {
    this._rendered = true;

    const deviceValue = this._config?.device_id || "";
    const nameValue = this._config?.name || "";
    const showName = this._config?.show_name !== false;
    const backgroundValue = this._config?.background_color || "";

    this.shadowRoot.innerHTML = `
      ${this._styles()}
      <div class="wrap">
        <div class="section-title">${this._t("editor_device_title")}</div>

        <div class="field">
          <label>${this._t("editor_device_label")}</label>
          <select id="device_id">
            <option value="">${this._t("editor_device_select")}</option>
            ${this._devices
              .map(
                (device) =>
                  `<option value="${device.id}" ${device.id === deviceValue ? "selected" : ""}>${device.label}</option>`
              )
              .join("")}
          </select>
          <div class="hint">${
            this._loading
              ? this._t("editor_device_loading")
              : this._devices.length
              ? this._t("editor_hint")
              : this._error || this._t("editor_no_devices")
          }</div>
        </div>

        <div class="field">
          <label>${this._t("editor_name_toggle_label")}</label>
          <label class="checkbox-row">
            <input id="show_name" type="checkbox" ${showName ? "checked" : ""}>
            <span>${this._t("editor_name_toggle_text")}</span>
          </label>
          <div class="hint">${this._t("editor_name_toggle_hint")}</div>
        </div>

        <div class="field">
          <label>${this._t("editor_name_label")}</label>
          <input id="name" type="text" value="${nameValue}" ${showName ? "" : "disabled"}>
          <div class="hint">${this._t("editor_name_hint")}</div>
        </div>

        ${this._gatewayControlsHTML()}

        <div class="field">
          <label>${this._t("editor_bg_label")}</label>
          <input id="background_color" type="text" value="${backgroundValue}">
          <div class="hint">${this._t("editor_bg_hint")}</div>
        </div>

        <div id="warning_slot">${this._warningHTML()}</div>
      </div>
    `;

    this.shadowRoot.getElementById("device_id")
      ?.addEventListener("change", (ev) => this._onDeviceChange(ev));

    this.shadowRoot.getElementById("show_name")
      ?.addEventListener("change", (ev) => this._onShowNameChange(ev));

    this.shadowRoot.getElementById("name")
      ?.addEventListener("input", (ev) => this._onNameInput(ev));

    this.shadowRoot.getElementById("background_color")
      ?.addEventListener("input", (ev) => this._onBackgroundInput(ev));

    this.shadowRoot.getElementById("wan_port")
      ?.addEventListener("change", (ev) => this._onWanPortChange(ev));

    this.shadowRoot.getElementById("wan2_port")
      ?.addEventListener("change", (ev) => this._onWan2PortChange(ev));
  }

  _patchWarning() {
    if (!this._rendered || !this.shadowRoot) return;
    const slot = this.shadowRoot.getElementById("warning_slot");
    if (!slot) return;
    slot.innerHTML = this._warningHTML();
  }

  _patchFields() {
    if (!this._rendered || !this.shadowRoot) return;
    this._render();
  }
}

customElements.define("unifi-device-card-editor", UnifiDeviceCardEditor);