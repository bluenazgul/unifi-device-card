//unifi-device-card-editor.js
import {
  getDeviceContext,
  getRelevantEntityWarningsForDevice,
  mergePortsWithLayout,
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

function clampOpacity(value) {
  const num = Number.parseInt(value, 10);
  if (!Number.isFinite(num)) return 100;
  return Math.min(100, Math.max(0, num));
}

function normalizePortsPerRow(value) {
  const num = Number.parseInt(value, 10);
  if (!Number.isFinite(num) || num < 1) return undefined;
  return Math.min(24, num);
}

function clampPortSize(value) {
  const num = Number.parseInt(value, 10);
  if (!Number.isFinite(num)) return 36;
  return Math.min(52, Math.max(24, num));
}

function clampApScale(value) {
  const num = Number.parseInt(value, 10);
  if (!Number.isFinite(num)) return 100;
  return Math.min(140, Math.max(25, num));
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeAttr(value) {
  return escapeHtml(value)
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function normalizeSpecialPortNumbers(value) {
  if (!Array.isArray(value)) return [];

  const normalized = value
    .map((entry) => Number.parseInt(entry, 10))
    .filter((num) => Number.isInteger(num) && num > 0);

  return Array.from(new Set(normalized)).sort((a, b) => a - b);
}

function collectLayoutPorts(layout) {
  if (!layout) return [];
  const numbered = (layout.rows || []).flat().filter((port) => Number.isInteger(port) && port > 0);
  const specials = (layout.specialSlots || [])
    .map((slot) => slot?.port)
    .filter((port) => Number.isInteger(port) && port > 0);
  return Array.from(new Set([...numbered, ...specials])).sort((a, b) => a - b);
}

function collectDefaultSpecialPorts(layout) {
  if (!layout) return [];
  return Array.from(
    new Set(
      (layout.specialSlots || [])
        .map((slot) => slot?.port)
        .filter((port) => Number.isInteger(port) && port > 0)
    )
  ).sort((a, b) => a - b);
}

function hasExplicitSpecialPorts(config) {
  return Object.prototype.hasOwnProperty.call(config || {}, "special_ports");
}

function resolveSelectedSpecialPorts(config, layout) {
  const configured = normalizeSpecialPortNumbers(config?.special_ports);
  if (hasExplicitSpecialPorts(config)) return configured;
  return collectDefaultSpecialPorts(layout);
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
      if (nextDeviceId !== prevDeviceId) {
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
      if (deviceId !== this._lastHintDeviceId) {
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
      const result = await getDeviceContext(this._hass, deviceId, this._config);
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
    const hadExplicitSpecialPorts = hasExplicitSpecialPorts(this._config);
    const hasIncomingSpecialPorts = hasExplicitSpecialPorts(partial);
    const keepExplicitSpecialPorts = hasIncomingSpecialPorts || hadExplicitSpecialPorts;

    if (!next.name) delete next.name;
    if (!next.background_color) delete next.background_color;
    next.background_opacity = clampOpacity(next.background_opacity);
    if (next.background_opacity === 100) delete next.background_opacity;
    if (!next.wan_port || next.wan_port === "auto") delete next.wan_port;
    if (!next.wan2_port || next.wan2_port === "auto") delete next.wan2_port;
    if (next.wan2_port === "none") next.wan2_port = "none";
    const hasManualWanSelection = !!next.wan_port || !!next.wan2_port;
    if (hasManualWanSelection) next.edit_special_ports = true;
    next.custom_special_ports = normalizeSpecialPortNumbers(next.custom_special_ports);
    if (!next.custom_special_ports.length) delete next.custom_special_ports;
    next.special_ports = normalizeSpecialPortNumbers(next.special_ports);
    if (
      !next.special_ports.length &&
      next.edit_special_ports === true &&
      !keepExplicitSpecialPorts
    ) {
      next.special_ports = collectDefaultSpecialPorts(this._deviceCtx?.layout);
    }
    if (!next.special_ports.length) {
      if (next.edit_special_ports === true && keepExplicitSpecialPorts) {
        next.special_ports = [];
      } else {
        delete next.special_ports;
      }
    }
    if (next.edit_special_ports !== true) delete next.edit_special_ports;
    if (next.show_name !== false) delete next.show_name;
    if (next.show_panel !== false) delete next.show_panel;
    if (next.force_sequential_ports !== true) delete next.force_sequential_ports;
    next.ports_per_row = normalizePortsPerRow(next.ports_per_row);
    if (!next.ports_per_row) delete next.ports_per_row;
    next.port_size = clampPortSize(next.port_size);
    if (next.port_size === 36) delete next.port_size;
    next.ap_scale = clampApScale(next.ap_scale);
    if (next.ap_scale === 100) delete next.ap_scale;
    if (next.ap_compact_view !== true) delete next.ap_compact_view;
    if (next.ap_compact_show_header_telemetry !== true) delete next.ap_compact_show_header_telemetry;

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
      custom_special_ports: undefined,
      special_ports: undefined,
      edit_special_ports: undefined,
      ports_per_row: nextDevice?.type === "gateway" ? undefined : this._config?.ports_per_row,
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

  _onBackgroundOpacityInput(ev) {
    this._emitConfig({ background_opacity: clampOpacity(ev.target.value) });
  }

  _onShowPanelChange(ev) {
    const checked = !!ev.target.checked;
    this._emitConfig({ show_panel: checked ? undefined : false });
  }

  _onPortsPerRowChange(ev) {
    this._emitConfig({ ports_per_row: normalizePortsPerRow(ev.target.value) });
  }

  _onForceSequentialPortsChange(ev) {
    const checked = !!ev.target.checked;
    this._emitConfig({ force_sequential_ports: checked ? true : undefined });
  }

  _onPortSizeInput(ev) {
    this._emitConfig({ port_size: clampPortSize(ev.target.value) });
  }

  _onApScaleInput(ev) {
    this._emitConfig({ ap_scale: clampApScale(ev.target.value) });
  }

  _onApCompactViewChange(ev) {
    const checked = !!ev.target.checked;
    this._emitConfig({
      ap_compact_view: checked ? true : undefined,
      ap_compact_show_header_telemetry: checked
        ? this._config?.ap_compact_show_header_telemetry
        : undefined,
    });
  }

  _onApCompactHeaderTelemetryChange(ev) {
    const checked = !!ev.target.checked;
    this._emitConfig({ ap_compact_show_header_telemetry: checked ? true : undefined });
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
      edit_special_ports: true,
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
      edit_special_ports: true,
    });
  }

  _onEditSpecialPortsChange(ev) {
    const enabled = !!ev.target.checked;
    const defaults = collectDefaultSpecialPorts(this._deviceCtx?.layout);
    const hasConfiguredSpecialPorts = hasExplicitSpecialPorts(this._config);
    const current = normalizeSpecialPortNumbers(this._config?.special_ports);

    this._emitConfig({
      edit_special_ports: enabled ? true : undefined,
      special_ports: enabled
        ? (hasConfiguredSpecialPorts ? current : defaults)
        : undefined,
      custom_special_ports: undefined,
    });
  }

  _onSpecialPortToggle(ev) {
    const button = ev.target?.closest?.("[data-port]");
    if (!button) return;

    const port = Number.parseInt(button.dataset.port, 10);
    if (!Number.isInteger(port) || port < 1) return;

    const current = resolveSelectedSpecialPorts(this._config, this._deviceCtx?.layout);
    const next = current.includes(port)
      ? current.filter((p) => p !== port)
      : [...current, port];

    this._emitConfig({
      special_ports: normalizeSpecialPortNumbers(next),
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
      return `<div class="warn loading">${escapeHtml(this._t("warning_checking"))}</div>`;
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
              `<li><strong>${escapeHtml(item.count)}</strong> ${escapeHtml(this._t(`warning_entity_${item.key}`))}</li>`
          )
          .join("")}</ul>`
      : "";

    return `
      <div class="warn">
        <div class="warn-title">${escapeHtml(this._t("warning_title"))}</div>
        <div class="warn-body">${escapeHtml(this._t("warning_body"))}</div>
        <div class="warn-status">${escapeHtml(summary)}</div>
        ${list}
        <div class="warn-path">
          <strong>${escapeHtml(this._t("warning_check_in"))}</strong><br>
          ${escapeHtml(this._t("warning_ha_path"))}
        </div>
      </div>
    `;
  }

  _gatewayControlsHTML(showControls = true) {
    const deviceId = this._config?.device_id || "";
    const selectedDevice = this._devices.find((d) => d.id === deviceId) || null;
    const isGateway = this._deviceCtx?.type === "gateway" || selectedDevice?.type === "gateway";

    if (!isGateway) return "";

    if (!showControls) return "";

    const layout = this._deviceCtx?.layout;
    if (!layout) {
      return `
        <div class="field">
          <label>${escapeHtml(this._t("editor_wan_port_label"))}</label>
          <select id="wan_port" disabled>
            <option value="auto">${escapeHtml(this._t("editor_device_loading"))}</option>
          </select>
          <div class="hint">${escapeHtml(this._t("editor_wan_port_hint"))}</div>
        </div>

        <div class="field">
          <label>${escapeHtml(this._t("editor_wan2_port_label"))}</label>
          <select id="wan2_port" disabled>
            <option value="auto">${escapeHtml(this._t("editor_device_loading"))}</option>
          </select>
          <div class="hint">${escapeHtml(this._t("editor_wan2_port_hint"))}</div>
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
        <label>${escapeHtml(this._t("editor_wan_port_label"))}</label>
        <select id="wan_port">
          ${wanOptions
            .map(
              (opt) =>
                `<option value="${escapeAttr(opt.value)}" ${opt.value === selectedWan ? "selected" : ""}>${escapeHtml(opt.label)}</option>`
            )
            .join("")}
        </select>
        <div class="hint">${escapeHtml(this._t("editor_wan_port_hint"))}</div>
      </div>

      <div class="field">
        <label>${escapeHtml(this._t("editor_wan2_port_label"))}</label>
        <select id="wan2_port">
          ${wan2Options
            .map((opt) => {
              const disabled =
                opt.value !== "auto" &&
                opt.value !== "none" &&
                roleSelectionsConflict(selectedWan, "wan", opt.value, "wan2", layout);

              return `<option value="${escapeAttr(opt.value)}" ${opt.value === selectedWan2 ? "selected" : ""} ${
                disabled ? "disabled" : ""
              }>${escapeHtml(opt.label)}</option>`;
            })
            .join("")}
        </select>
        <div class="hint">${escapeHtml(this._t("editor_wan2_port_hint"))}</div>
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

      .port-toggle-list {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .port-toggle {
        border: 1px solid var(--divider-color);
        border-radius: 999px;
        padding: 6px 10px;
        font: inherit;
        background: var(--card-background-color);
        color: var(--primary-text-color);
        cursor: pointer;
      }

      .port-toggle.selected {
        border-color: var(--primary-color);
        background: color-mix(in srgb, var(--primary-color) 18%, var(--card-background-color));
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

  _captureFocusState() {
    if (!this.shadowRoot) return null;
    const active = this.shadowRoot.activeElement;
    if (!active || !active.id) return null;

    const supportsSelection =
      typeof active.selectionStart === "number" &&
      typeof active.selectionEnd === "number";

    return {
      id: active.id,
      selectionStart: supportsSelection ? active.selectionStart : null,
      selectionEnd: supportsSelection ? active.selectionEnd : null,
      selectionDirection: supportsSelection ? active.selectionDirection : null,
    };
  }

  _restoreFocusState(focusState) {
    if (!focusState || !this.shadowRoot) return;

    const nextEl = this.shadowRoot.getElementById(focusState.id);
    if (!nextEl || typeof nextEl.focus !== "function") return;

    nextEl.focus({ preventScroll: true });

    if (
      typeof nextEl.setSelectionRange === "function" &&
      focusState.selectionStart != null &&
      focusState.selectionEnd != null
    ) {
      nextEl.setSelectionRange(
        focusState.selectionStart,
        focusState.selectionEnd,
        focusState.selectionDirection || "none"
      );
    }
  }

  _render() {
    this._rendered = true;
    const focusState = this._captureFocusState();

    const deviceValue = this._config?.device_id || "";
    const selectedDevice = this._devices.find((d) => d.id === deviceValue) || null;
    const selectedType = this._deviceCtx?.type || selectedDevice?.type || null;
    const isApDevice = selectedType === "access_point";
    const isSwitchDevice = selectedType === "switch";
    const isSwitchOrGateway = isSwitchDevice || selectedType === "gateway";
    const nameValue = this._config?.name || "";
    const showName = this._config?.show_name !== false;
    const showPanel = this._config?.show_panel !== false;
    const forceSequentialPorts = this._config?.force_sequential_ports === true;
    const backgroundValue = this._config?.background_color || "";
    const backgroundOpacity = clampOpacity(this._config?.background_opacity);
    const portsPerRow = this._config?.ports_per_row || "";
    const portSize = clampPortSize(this._config?.port_size);
    const apScale = clampApScale(this._config?.ap_scale);
    const apCompactView = this._config?.ap_compact_view === true;
    const apCompactShowHeaderTelemetry = this._config?.ap_compact_show_header_telemetry === true;
    const editSpecialPorts =
      this._config?.edit_special_ports === true ||
      !!this._config?.wan_port ||
      !!this._config?.wan2_port;
    const availablePortSlots = mergePortsWithLayout(this._deviceCtx?.layout, this._deviceCtx?.numberedPorts || []);
    const discoveredPorts = availablePortSlots
      .map((slot) => slot?.port)
      .filter((port) => Number.isInteger(port) && port > 0);
    const selectableSpecialPorts = Array.from(
      new Set([...collectLayoutPorts(this._deviceCtx?.layout), ...discoveredPorts])
    ).sort((a, b) => a - b);
    const customSpecialPortOptions = selectableSpecialPorts;
    const selectedSpecialPorts = editSpecialPorts
      ? resolveSelectedSpecialPorts(this._config, this._deviceCtx?.layout)
      : [];

    this.shadowRoot.innerHTML = `
      ${this._styles()}
      <div class="wrap">
        <div class="section-title">${escapeHtml(this._t("editor_device_title"))}</div>

        <div class="field">
          <label>${escapeHtml(this._t("editor_device_label"))}</label>
          <select id="device_id">
            <option value="">${escapeHtml(this._t("editor_device_select"))}</option>
            ${this._devices
              .map(
                (device) =>
                  `<option value="${escapeAttr(device.id)}" ${device.id === deviceValue ? "selected" : ""}>${escapeHtml(device.label)}</option>`
              )
              .join("")}
          </select>
          <div class="hint">${
            this._loading
              ? escapeHtml(this._t("editor_device_loading"))
              : this._devices.length
              ? escapeHtml(this._t("editor_hint"))
              : escapeHtml(this._error || this._t("editor_no_devices"))
          }</div>
        </div>

        <div class="field">
          <label>${escapeHtml(this._t("editor_name_toggle_label"))}</label>
          <label class="checkbox-row">
            <input id="show_name" type="checkbox" ${showName ? "checked" : ""}>
            <span>${escapeHtml(this._t("editor_name_toggle_text"))}</span>
          </label>
          <div class="hint">${escapeHtml(this._t("editor_name_toggle_hint"))}</div>
        </div>

        <div class="field">
          <label>${escapeHtml(this._t("editor_name_label"))}</label>
          <input id="name" type="text" value="${escapeAttr(nameValue)}" ${showName ? "" : "disabled"}>
          <div class="hint">${escapeHtml(this._t("editor_name_hint"))}</div>
        </div>

        ${isSwitchOrGateway ? `
        <div class="field">
          <label>${escapeHtml(this._t("editor_panel_toggle_label"))}</label>
          <label class="checkbox-row">
            <input id="show_panel" type="checkbox" ${showPanel ? "checked" : ""}>
            <span>${escapeHtml(this._t("editor_panel_toggle_text"))}</span>
          </label>
          <div class="hint">${escapeHtml(this._t("editor_panel_toggle_hint"))}</div>
        </div>` : ""}

        ${isSwitchDevice ? `
        <div class="field">
          <label>${escapeHtml(this._t("editor_ports_per_row_label"))}</label>
          <input id="ports_per_row" type="text" inputmode="numeric" value="${escapeAttr(portsPerRow)}">
          <div class="hint">${escapeHtml(this._t("editor_ports_per_row_hint"))}</div>
        </div>` : ""}

        ${isSwitchOrGateway ? `
        <div class="field">
          <label>${escapeHtml(this._t("editor_port_size_label"))}: ${escapeHtml(portSize)}px</label>
          <input id="port_size" type="range" min="24" max="52" step="1" value="${escapeAttr(portSize)}">
          <div class="hint">${escapeHtml(this._t("editor_port_size_hint"))}</div>
        </div>` : ""}

        ${isApDevice ? `
        <div class="field">
          <label>${escapeHtml(this._t("editor_ap_compact_toggle_label"))}</label>
          <label class="checkbox-row">
            <input id="ap_compact_view" type="checkbox" ${apCompactView ? "checked" : ""}>
            <span>${escapeHtml(this._t("editor_ap_compact_toggle_text"))}</span>
          </label>
          <div class="hint">${escapeHtml(this._t("editor_ap_compact_toggle_hint"))}</div>
        </div>

        ${apCompactView ? `
        <div class="field">
          <label>${escapeHtml(this._t("editor_ap_compact_header_telemetry_label"))}</label>
          <label class="checkbox-row">
            <input id="ap_compact_show_header_telemetry" type="checkbox" ${apCompactShowHeaderTelemetry ? "checked" : ""}>
            <span>${escapeHtml(this._t("editor_ap_compact_header_telemetry_text"))}</span>
          </label>
          <div class="hint">${escapeHtml(this._t("editor_ap_compact_header_telemetry_hint"))}</div>
        </div>` : ""}

        ${!apCompactView ? `
        <div class="field">
          <label>${escapeHtml(this._t("editor_ap_scale_label"))}: ${escapeHtml(apScale)}%</label>
          <input id="ap_scale" type="range" min="25" max="140" step="1" value="${escapeAttr(apScale)}">
          <div class="hint">${escapeHtml(this._t("editor_ap_scale_hint"))}</div>
        </div>` : ""}` : ""}

        ${isSwitchOrGateway ? `
        <div class="field">
          <label class="checkbox-row">
            <input id="edit_special_ports" type="checkbox" ${editSpecialPorts ? "checked" : ""}>
            <span>${escapeHtml(this._t("editor_edit_special_ports_toggle"))}</span>
          </label>
          <div class="hint">${escapeHtml(this._t("editor_edit_special_ports_toggle_hint"))}</div>
        </div>

        ${editSpecialPorts ? `
        ${this._gatewayControlsHTML(true)}

        <div class="field">
          <label>${escapeHtml(this._t("editor_custom_special_ports_label"))}</label>
          <div id="special_ports_list" class="port-toggle-list">
            ${selectableSpecialPorts
              .map((port) => `<button type="button" class="port-toggle ${selectedSpecialPorts.includes(port) ? "selected" : ""}" data-port="${escapeAttr(port)}">Port ${escapeHtml(port)}</button>`)
              .join("")}
          </div>
          <div class="hint">${escapeHtml(this._t("editor_custom_special_ports_hint"))}</div>
        </div>` : ""}

        <div class="field">
          <label class="checkbox-row">
            <input id="force_sequential_ports" type="checkbox" ${forceSequentialPorts ? "checked" : ""}>
            <span>${escapeHtml(this._t("editor_force_sequential_ports_label"))}</span>
          </label>
          <div class="hint">${escapeHtml(this._t("editor_force_sequential_ports_hint"))}</div>
        </div>
        ` : ""}

        <div class="field">
          <label>${escapeHtml(this._t("editor_bg_label"))}</label>
          <input id="background_color" type="text" value="${escapeAttr(backgroundValue)}">
          <div class="hint">${escapeHtml(this._t("editor_bg_hint"))}</div>
        </div>

        <div class="field">
          <label>${escapeHtml(this._t("editor_bg_opacity_label"))}: ${escapeHtml(backgroundOpacity)}%</label>
          <input
            id="background_opacity"
            type="range"
            min="0"
            max="100"
            step="1"
            value="${escapeAttr(backgroundOpacity)}"
          >
          <div class="hint">${escapeHtml(this._t("editor_bg_opacity_hint"))}</div>
        </div>

        <div id="warning_slot">${this._warningHTML()}</div>
      </div>
    `;

    this.shadowRoot.getElementById("device_id")
      ?.addEventListener("change", (ev) => this._onDeviceChange(ev));

    this.shadowRoot.getElementById("show_name")
      ?.addEventListener("change", (ev) => this._onShowNameChange(ev));
    this.shadowRoot.getElementById("show_panel")
      ?.addEventListener("change", (ev) => this._onShowPanelChange(ev));

    this.shadowRoot.getElementById("name")
      ?.addEventListener("input", (ev) => this._onNameInput(ev));
    this.shadowRoot.getElementById("ports_per_row")
      ?.addEventListener("input", (ev) => this._onPortsPerRowChange(ev));
    this.shadowRoot.getElementById("force_sequential_ports")
      ?.addEventListener("change", (ev) => this._onForceSequentialPortsChange(ev));
    this.shadowRoot.getElementById("port_size")
      ?.addEventListener("input", (ev) => this._onPortSizeInput(ev));
    this.shadowRoot.getElementById("ap_scale")
      ?.addEventListener("input", (ev) => this._onApScaleInput(ev));
    this.shadowRoot.getElementById("ap_compact_view")
      ?.addEventListener("change", (ev) => this._onApCompactViewChange(ev));
    this.shadowRoot.getElementById("ap_compact_show_header_telemetry")
      ?.addEventListener("change", (ev) => this._onApCompactHeaderTelemetryChange(ev));

    this.shadowRoot.getElementById("background_color")
      ?.addEventListener("input", (ev) => this._onBackgroundInput(ev));
    this.shadowRoot.getElementById("background_opacity")
      ?.addEventListener("input", (ev) => this._onBackgroundOpacityInput(ev));

    this.shadowRoot.getElementById("wan_port")
      ?.addEventListener("change", (ev) => this._onWanPortChange(ev));

    this.shadowRoot.getElementById("wan2_port")
      ?.addEventListener("change", (ev) => this._onWan2PortChange(ev));
    this.shadowRoot.getElementById("edit_special_ports")
      ?.addEventListener("change", (ev) => this._onEditSpecialPortsChange(ev));
    this.shadowRoot.getElementById("special_ports_list")
      ?.addEventListener("click", (ev) => this._onSpecialPortToggle(ev));

    this._restoreFocusState(focusState);
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

if (!customElements.get("unifi-device-card-editor")) {
  customElements.define("unifi-device-card-editor", UnifiDeviceCardEditor);
}
