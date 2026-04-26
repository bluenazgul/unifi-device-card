import {
  applyGatewayPortOverrides,
  discoverSpecialPorts,
  formatState,
  getDeviceContext,
  getPoeStatus,
  getPortLinkText,
  getPortSpeedText,
  hasTraffic,
  isSfpLikePort,
  isOn,
  isPortConnected,
  mergePortsWithLayout,
  mergeSpecialsWithLayout,
  parseLinkSpeedMbit,
  stateObj,
} from "./helpers.js";
import { normalizeMac } from "./identity.js";
import { t } from "./translations.js";
import "./unifi-device-card-editor.js";

const VERSION = __VERSION__;
const DEV_LOG_FLAG = "__UNIFI_DEVICE_CARD_VERSION_LOGGED__";
const LOG_LEVELS = { error: 0, warn: 1, info: 2, debug: 3, trace: 4 };
const LOG_STYLES = {
  badge: "background:#00AEEF;color:#fff;padding:2px 6px;border-radius:2px;font-weight:700;",
  version: "background:#2a2a2a;color:#fff;padding:2px 6px;border-radius:2px;font-weight:700;",
  error: "color:#ff5f56;font-weight:700;",
  warn: "color:#ffbd2e;font-weight:700;",
  info: "color:#9effa1;font-weight:700;",
  debug: "color:#8ab4f8;font-weight:700;",
  trace: "color:#caa7ff;font-weight:700;",
};

class UnifiDeviceCard extends HTMLElement {
  static getConfigElement() {
    return document.createElement("unifi-device-card-editor");
  }

  static getStubConfig() {
    return {};
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = {};
    this._ctx = null;
    this._selectedKey = null;
    this._loading = false;
    this._loadToken = 0;
    this._loadedDeviceId = null;
    this._resizeObserver = null;
    this._lastMeasuredWidth = 0;
    this._lastMeasuredPanelWidth = 0;
    this._cardSize = 8;
    this._instanceId = Math.random().toString(36).slice(2, 7);
    // Keys of SFP-like ports that have been observed with live traffic.
    // Used by _isPortConnected() to avoid false "offline" flickers on
    // polling-interval gaps where rx/tx momentarily reads 0.
    this._sfpConnectedSeen = new Set();
  }

  _configuredLogLevel() {
    const raw = String(this._config?.log_level || "").toLowerCase().trim();
    if (raw && Object.prototype.hasOwnProperty.call(LOG_LEVELS, raw)) return raw;
    if (this._config?.debug === true) return "debug";
    return "warn";
  }

  _shouldLog(level) {
    const target = LOG_LEVELS[this._configuredLogLevel()];
    const current = LOG_LEVELS[level];
    if (current == null || target == null) return false;
    return current <= target;
  }

  _log(level, message, ...args) {
    if (!this._shouldLog(level)) return;
    const fn = level === "error" ? "error" : level === "warn" ? "warn" : "log";
    const levelLabel = level.toUpperCase();
    const device = this._config?.device_id ? ` ${this._config.device_id}` : "";
    const header = `%cUNIFI-DEVICE-CARD%c ${levelLabel}%c${device} #${this._instanceId}`;
    console[fn](
      header,
      LOG_STYLES.badge,
      LOG_STYLES[level] || LOG_STYLES.info,
      LOG_STYLES.version,
      message,
      ...args
    );
  }

  _numericState(entityId) {
    if (!entityId || !this._hass?.states) return null;
    const raw = this._hass.states[entityId]?.state;
    if (raw == null || raw === "unknown" || raw === "unavailable") return null;
    const n = Number.parseFloat(String(raw).replace(",", "."));
    return Number.isFinite(n) ? n : null;
  }

  _buildPortDebugSnapshot(ctx) {
    if (!ctx || (ctx.type !== "switch" && ctx.type !== "gateway")) {
      return {
        summary: null,
        ports: [],
      };
    }

    const slotData = this._buildSlotData(ctx);
    const ports = [...(slotData?.specials || []), ...(slotData?.numbered || [])]
      .filter((slot) => Number.isInteger(slot?.port))
      .sort((a, b) => a.port - b.port);

    let connected = 0;
    let poePorts = 0;
    let trafficPorts = 0;
    let poeTotalW = 0;

    const details = ports.map((slot) => {
      const linkUp = this._isPortConnected(slot);
      if (linkUp) connected += 1;

      const poeStatus = getPoeStatus(this._hass, slot);
      if (poeStatus.active) poePorts += 1;
      const poeNum = this._numericState(slot?.poe_power_entity);
      if (poeNum != null && poeNum > 0) poeTotalW += poeNum;

      const rx = this._numericState(slot?.rx_entity) || 0;
      const tx = this._numericState(slot?.tx_entity) || 0;
      const traffic = rx + tx;
      if (traffic > 0) trafficPorts += 1;

      return {
        port: slot.port,
        link: linkUp ? "up" : "down",
        speed: getPortSpeedText(this._hass, slot) || null,
        poe: poeStatus.active ? (poeStatus.power || "on") : "off",
        rx,
        tx,
      };
    });

    const topTraffic = [...details]
      .sort((a, b) => (b.rx + b.tx) - (a.rx + a.tx))
      .filter((row) => (row.rx + row.tx) > 0)
      .slice(0, 5)
      .map((row) => ({
        port: row.port,
        rx: row.rx,
        tx: row.tx,
      }));

    return {
      summary: {
        ports_total: ports.length,
        ports_connected: connected,
        ports_with_poe: poePorts,
        poe_total_w: Number(poeTotalW.toFixed(2)),
        ports_with_traffic: trafficPorts,
      },
      ports: details,
      top_traffic: topTraffic,
    };
  }

  connectedCallback() {
    if (this._resizeObserver) return;
    this._resizeObserver = new ResizeObserver(() => {
      const nextWidth = this._measuredCardWidth();
      if (Math.abs(nextWidth - this._lastMeasuredWidth) < 1) return;
      this._lastMeasuredWidth = nextWidth;
      this._render();
    });
    this._resizeObserver.observe(this);
  }

  disconnectedCallback() {
    this._resizeObserver?.disconnect();
    this._resizeObserver = null;
  }

  setConfig(config) {
    const oldDeviceId = this._config?.device_id || null;
    const newConfig = config || {};
    const newDeviceId = newConfig?.device_id || null;
    this._config = newConfig;
    this._log("info", "setConfig", {
      device_id: newDeviceId || null,
      log_level: this._configuredLogLevel(),
    });

    if (oldDeviceId !== newDeviceId) {
      this._ctx = null;
      this._selectedKey = null;
      this._loadedDeviceId = null;
      this._loading = false;
      if (this._hass && newDeviceId) {
        this._ensureLoaded();
        return;
      }
    }

    this._render();
  }

  set hass(hass) {
    const previousHass = this._hass;
    this._hass = hass;
    this._ensureLoaded();
    this._log("trace", "hass update");
    if (!previousHass || !this._ctx || this._hasRelevantStateChanges(previousHass, hass)) {
      this._render();
    }
  }

  getCardSize() {
    return this._cardSize || this._estimateCardSize();
  }

  _estimateCardSize() {
    if (!this._config?.device_id) return 4;
    if (!this._ctx) return 5;
    if (this._ctx?.type === "access_point") {
      if (this._apCompactViewEnabled()) return this._ctx?.ap_uplink ? 7 : 6;
      return this._ctx?.ap_uplink ? 9 : 8;
    }

    const { specials, numbered } = this._buildSlotData(this._ctx);
    const specialPortsInUse = new Set(
      specials.map((slot) => slot?.port).filter((port) => Number.isInteger(port))
    );
    const visibleNumbered = numbered.filter((slot) => !specialPortsInUse.has(slot.port));
    const panelRows = this._buildEffectiveRows(this._ctx, visibleNumbered).length + (specials.length ? 1 : 0);
    const selected = [...specials, ...visibleNumbered].find((slot) => slot.key === this._selectedKey)
      || specials[0]
      || visibleNumbered[0]
      || null;
    const hasPoe = !!(selected?.poe_switch_entity || selected?.poe_power_entity || selected?.power_cycle_entity);
    const hasTraffic = !!(selected?.rx_entity || selected?.tx_entity);

    return Math.max(6, Math.min(20, 5 + panelRows + (hasPoe ? 1 : 0) + (hasTraffic ? 1 : 0)));
  }

  _updateCardSize() {
    const cardEl = this.shadowRoot?.querySelector("ha-card");
    if (!cardEl) return;
    const measured = Math.max(1, Math.ceil(cardEl.getBoundingClientRect().height / 50));
    const nextSize = Number.isFinite(measured) ? measured : this._estimateCardSize();
    if (nextSize === this._cardSize) return;
    this._cardSize = nextSize;
    this.dispatchEvent(new Event("iron-resize", { bubbles: true, composed: true }));
  }

  _finalizeRender() {
    requestAnimationFrame(() => {
      this._updateCardSize();

      const panelWidth = this._measuredFrontPanelContentWidth();
      if (panelWidth <= 0) return;
      if (Math.abs(panelWidth - this._lastMeasuredPanelWidth) < 1) return;

      this._lastMeasuredPanelWidth = panelWidth;
      this._render();
    });
  }

  _t(key) {
    return t(this._hass, key);
  }

  _translateState(raw) {
    if (!raw || raw === "—") return raw;
    const key = `state_${String(raw).toLowerCase().replace(/\s+/g, "_")}`;
    const translated = this._t(key);
    return translated === key ? raw : translated;
  }

  _cardBgStyle() {
    const color = this._config?.background_color || "var(--card-background-color)";
    const opacityRaw = Number.parseInt(this._config?.background_opacity, 10);
    const opacity = Number.isFinite(opacityRaw) ? Math.min(100, Math.max(0, opacityRaw)) : 100;

    if (opacity >= 100) return color;
    return `color-mix(in srgb, ${color} ${opacity}%, transparent)`;
  }

  _cardChromeBgStyle() {
    if (this._ctx?.type === "switch" || this._ctx?.type === "gateway") {
      return this._cardBgStyle();
    }
    return this._cardBgStyle();
  }

  _portSize() {
    const raw = Number.parseInt(this._config?.port_size, 10);
    if (!Number.isFinite(raw)) return 36;
    return Math.min(52, Math.max(24, raw));
  }

  _apScale() {
    const raw = Number.parseInt(this._config?.ap_scale, 10);
    if (!Number.isFinite(raw)) return 100;
    return Math.min(140, Math.max(25, raw));
  }

  _apCompactViewEnabled() {
    return this._ctx?.type === "access_point" && this._config?.ap_compact_view === true;
  }

  _apCompactHeaderTelemetryEnabled() {
    return this._ctx?.type === "access_point" && this._config?.ap_compact_show_header_telemetry === true;
  }

  _maxPortColumns() {
    const rows = this._ctx?.layout?.rows || [];
    const maxRowCols = rows.reduce((max, row) => Math.max(max, row.length || 0), 0);
    const specialCols = (this._ctx?.layout?.specialSlots || []).length;
    return Math.max(1, maxRowCols, specialCols);
  }

  _effectivePortSize() {
    const configured = this._portSize();
    return configured;
  }

  _measuredCardWidth() {
    const hostWidth = this.getBoundingClientRect?.().width || this.offsetWidth || 0;
    if (hostWidth > 0) return hostWidth;
    const cardWidth = this.shadowRoot?.querySelector("ha-card")?.getBoundingClientRect?.().width || 0;
    if (cardWidth > 0) return cardWidth;
    return this.parentElement?.getBoundingClientRect?.().width || 0;
  }

  _measuredFrontPanelContentWidth() {
    const frontPanel = this.shadowRoot?.querySelector(".frontpanel");
    if (!frontPanel) return 0;

    const panelWidth = frontPanel.getBoundingClientRect?.().width || frontPanel.clientWidth || 0;
    if (panelWidth <= 0) return 0;

    const computed = getComputedStyle(frontPanel);
    const paddingLeft = Number.parseFloat(computed.paddingLeft) || 0;
    const paddingRight = Number.parseFloat(computed.paddingRight) || 0;
    return Math.max(0, panelWidth - paddingLeft - paddingRight);
  }

  _maxFittableColumns() {
    // When the user has explicitly set ports_per_row, honour it unconditionally.
    // The measured panel width must not override an intentional layout choice.
    const configuredPPR = Number.parseInt(this._config?.ports_per_row, 10);
    if (Number.isFinite(configuredPPR) && configuredPPR > 0) return Infinity;

    const portSize = this._portSize();
    const panelContentWidth = this._measuredFrontPanelContentWidth();
    const hostWidth = this._measuredCardWidth();
    if (!panelContentWidth && !hostWidth) return Infinity;

    // Use a tighter slot estimate so measured width does not under-count columns.
    const horizontalPadding = 24;
    const gap = 6;
    const slotWidth = Math.max(1, portSize - 2);
    const available = panelContentWidth > 0
      ? panelContentWidth
      : Math.max(180, hostWidth - horizontalPadding);
    return Math.max(1, Math.floor((available + gap) / (slotWidth + gap)));
  }

  _wholeNumberState(entityId) {
    if (!entityId || !this._hass) return "—";
    const obj = stateObj(this._hass, entityId);
    if (!obj) return "—";

    const raw = Number.parseFloat(String(obj.state ?? "").replace(",", "."));
    if (!Number.isFinite(raw)) return formatState(this._hass, entityId);

    const unit = obj.attributes?.unit_of_measurement;
    const intValue = Math.round(raw);
    return unit ? `${intValue} ${unit}` : String(intValue);
  }

  _humanizeDurationSeconds(totalSeconds) {
    const seconds = Math.max(0, Math.round(totalSeconds));
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    const parts = [];
    if (days) parts.push(`${days}d`);
    if (hours || days) parts.push(`${hours}h`);
    parts.push(`${minutes}m`);
    return parts.join(" ");
  }

  _apStatusRaw(entityId) {
    if (!entityId || !this._hass) return "—";
    const obj = stateObj(this._hass, entityId);
    if (!obj?.state) return "—";
    return String(obj.state);
  }

  _apStatusState(entityId) {
    const raw = this._apStatusRaw(entityId);
    return raw === "—" ? raw : this._translateState(raw);
  }

  _apUptimeState(entityId) {
    if (!entityId || !this._hass) return "—";
    const obj = stateObj(this._hass, entityId);
    if (!obj) return "—";

    const rawState = String(obj.state ?? "").trim();
    const deviceClass = String(obj.attributes?.device_class || "").toLowerCase().trim();
    if (deviceClass === "timestamp") {
      const parsed = new Date(rawState);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed.toLocaleString(this._hass?.locale?.language || undefined, {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        });
      }
    }

    const raw = Number.parseFloat(String(obj.state ?? "").replace(",", "."));
    if (!Number.isFinite(raw)) return formatState(this._hass, entityId);

    const unit = String(obj.attributes?.unit_of_measurement || "").toLowerCase().trim();
    if (["s", "sec", "second", "seconds"].includes(unit)) {
      return this._humanizeDurationSeconds(raw);
    }
    if (["min", "mins", "minute", "minutes"].includes(unit)) {
      return this._humanizeDurationSeconds(raw * 60);
    }
    if (["h", "hr", "hour", "hours"].includes(unit)) {
      return this._humanizeDurationSeconds(raw * 3600);
    }

    return formatState(this._hass, entityId);
  }

  _apLedColorValue() {
    const colorEntity = this._ctx?.led_color_entity;
    const colorStateObj = colorEntity ? stateObj(this._hass, colorEntity) : null;
    const raw = String(colorStateObj?.state || "").trim();
    if (raw && raw !== "unknown" && raw !== "unavailable") {
      if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(raw)) return raw;
      if (/^rgb\(/i.test(raw)) return raw;
    }

    const ledObj = this._ctx?.led_switch_entity ? stateObj(this._hass, this._ctx.led_switch_entity) : null;
    const rgbAttr = ledObj?.attributes?.rgb_color || colorStateObj?.attributes?.rgb_color;
    if (Array.isArray(rgbAttr) && rgbAttr.length === 3) {
      const [r, g, b] = rgbAttr.map((n) => Math.max(0, Math.min(255, Number(n) || 0)));
      return `rgb(${r}, ${g}, ${b})`;
    }

    const named = raw.toLowerCase();
    const map = {
      blue: "#0000ff",
      white: "#ffffff",
      red: "#ff3b30",
      green: "#33d35d",
      orange: "#efb21a",
      amber: "#efb21a",
      yellow: "#efb21a",
      warm_white: "#f5deb3",
      cool_white: "#dbeafe",
      purple: "#8b5cf6",
      pink: "#ec4899",
    };
    return map[named] || null;
  }

  _apLedState() {
    const ledEntity = this._ctx?.led_switch_entity;
    const ledEnabled = ledEntity ? isOn(this._hass, ledEntity) : this._isDeviceOnline();
    const defaultColor = this._ctx?.layout?.apLedDefaultColor ?? "#0000ff";
    const ringColor = ledEnabled ? (this._apLedColorValue() || defaultColor) : "#868b93";
    return { ledEntity, ledEnabled, ringColor };
  }

  _apUplinkText(uplink) {
    if (!uplink) return null;
    const deviceLabel = String(uplink.via_device_name || uplink.via_mac || "").trim();
    return deviceLabel || null;
  }

  _escapeAttr(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/'/g, "&#39;");
  }

  _escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  _safeClassToken(value, fallback = "") {
    const token = String(value ?? "").trim();
    if (!token) return fallback;
    return /^[a-z0-9_-]+$/i.test(token) ? token : fallback;
  }

  _apUplinkTooltip(uplink) {
    if (!uplink) return "";
    const lines = [];
    const kind = String(uplink.kind || "").toLowerCase();

    if (kind === "mesh") lines.push("Mesh Uplink");
    else if (kind === "wired") lines.push("Wired Uplink");
    else lines.push("Uplink");

    if (uplink.via_device_name) lines.push(`Device: ${uplink.via_device_name}`);
    if (uplink.remote_port) lines.push(`Port: ${uplink.remote_port}`);
    if (uplink.via_mac) lines.push(`MAC: ${uplink.via_mac}`);

    return lines.join(" · ");
  }

  _toClientNames(value) {
    if (!Array.isArray(value)) return [];
    const out = [];
    for (const entry of value) {
      if (typeof entry === "string" && entry.trim()) {
        out.push(entry.trim());
        continue;
      }
      if (entry && typeof entry === "object") {
        const name =
          entry.name ||
          entry.hostname ||
          entry.client_name ||
          entry.display_name ||
          entry.mac ||
          "";
        if (String(name).trim()) out.push(String(name).trim());
      }
    }
    return out;
  }

  _getPortClientInfo(slot) {
    const candidates = new Set([
      slot?.link_entity,
      slot?.speed_entity,
      slot?.port_switch_entity,
      slot?.poe_power_entity,
      slot?.rx_entity,
      slot?.tx_entity,
      ...(Array.isArray(slot?.raw_entities) ? slot.raw_entities : []),
    ].filter(Boolean));

    const numericKeys = [
      "connected_clients",
      "client_count",
      "clients",
      "num_clients",
      "active_clients",
      "station_count",
    ];
    const listKeys = ["clients", "connected_clients", "client_list", "stations", "hosts"];

    let bestCount = null;
    let bestNames = [];

    for (const entityId of candidates) {
      const obj = stateObj(this._hass, entityId);
      const attrs = obj?.attributes;
      if (!attrs || typeof attrs !== "object") continue;

      const stateNum = Number.parseInt(String(obj?.state ?? ""), 10);
      if (
        Number.isInteger(stateNum) &&
        stateNum >= 0 &&
        (entityId.includes("clients") || String(attrs?.friendly_name || "").toLowerCase().includes("clients"))
      ) {
        if (bestCount == null || stateNum > bestCount) bestCount = stateNum;
      }

      for (const key of numericKeys) {
        const raw = attrs[key];
        const num = Number.parseInt(raw, 10);
        if (Number.isInteger(num) && num >= 0 && (bestCount == null || num > bestCount)) {
          bestCount = num;
        }
      }

      for (const key of listKeys) {
        const names = this._toClientNames(attrs[key]);
        if (names.length > bestNames.length) bestNames = names;
      }
    }

    if ((bestCount == null || bestCount === 0) && bestNames.length === 0) return null;
    const count = bestCount != null ? bestCount : bestNames.length;
    return { count, names: bestNames.slice(0, 8) };
  }

  _extractClientNameFromStateObj(obj, entityId) {
    const attrs = obj?.attributes || {};
    const friendly = String(attrs.friendly_name || "").trim();
    if (friendly) return friendly;
    return String(entityId || "")
      .replace(/^device_tracker\./i, "")
      .replace(/_/g, " ")
      .trim();
  }

  _extractPortFromAttributes(attrs, entityId = "") {
    const keys = [
      "port",
      "switch_port",
      "sw_port",
      "uplink_port",
      "uplink_remote_port",
      "remote_port",
      "network_port",
      "port_number",
      "wired_port",
    ];
    for (const key of keys) {
      const match = String(attrs?.[key] ?? "").match(/\d+/);
      if (match) return Number.parseInt(match[0], 10);
    }
    const textKeys = ["connected_to", "uplink", "uplink_source", "source", "network_path", "connection_path"];
    for (const key of textKeys) {
      const match = String(attrs?.[key] ?? "").match(/port\D*(\d+)/i);
      if (match) return Number.parseInt(match[1], 10);
    }
    const idMatch = String(entityId || "").match(/(?:^|[_-])port[_-]?(\d+)(?:[_-]|$)/i);
    if (idMatch) return Number.parseInt(idMatch[1], 10);
    return null;
  }

  _extractParentMacFromAttributes(attrs) {
    const keys = [
      "sw_mac",
      "switch_mac",
      "uplink_mac",
      "uplink_device_mac",
      "wired_uplink_mac",
      "switch_uplink_mac",
      "connected_to_mac",
      "parent_mac",
      "parent_device_mac",
      "network_device_mac",
    ];
    for (const key of keys) {
      const mac = normalizeMac(attrs?.[key]);
      if (mac) return mac;
    }
    return null;
  }

  _extractParentText(attrs) {
    const textKeys = [
      "connected_to",
      "uplink",
      "uplink_source",
      "source",
      "network_device",
      "network_path",
      "connection_path",
      "switch",
      "parent",
    ];
    return textKeys
      .map((key) => String(attrs?.[key] ?? "").trim())
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
  }

  _matchesParentDevice(attrs, deviceMac) {
    const parentMac = this._extractParentMacFromAttributes(attrs);
    if (parentMac) return parentMac === deviceMac;

    const parentText = this._extractParentText(attrs);
    if (!parentText) return false;

    const deviceName = String(this._ctx?.name || "").toLowerCase().trim();
    const deviceModel = String(this._ctx?.model || "").toLowerCase().trim();
    if (deviceName && parentText.includes(deviceName)) return true;
    if (deviceModel && parentText.includes(deviceModel)) return true;
    return false;
  }

  _buildPortClientIndex() {
    const deviceMac = normalizeMac(this._ctx?.identity?.primary_mac);
    if (!deviceMac || !this._hass?.states) return new Map();

    const byPort = new Map();
    for (const [entityId, obj] of Object.entries(this._hass.states)) {
      const attrs = obj?.attributes || {};
      if (!this._matchesParentDevice(attrs, deviceMac)) continue;

      const port = this._extractPortFromAttributes(attrs, entityId);
      if (!Number.isInteger(port) || port < 1) continue;

      if (!byPort.has(port)) {
        byPort.set(port, { count: 0, names: new Set() });
      }
      const entry = byPort.get(port);

      if (entityId.startsWith("device_tracker.")) {
        const name = this._extractClientNameFromStateObj(obj, entityId);
        if (name) entry.names.add(name);
      }

      const stateNum = Number.parseInt(String(obj?.state ?? ""), 10);
      const friendly = String(attrs?.friendly_name || "").toLowerCase();
      const looksLikeClientCounter =
        entityId.includes("clients") ||
        friendly.includes("clients") ||
        friendly.includes("geräte");
      if (looksLikeClientCounter && Number.isInteger(stateNum) && stateNum >= 0) {
        entry.count = Math.max(entry.count, stateNum);
      }

      const attrNames = this._toClientNames(attrs?.clients || attrs?.connected_clients || attrs?.client_list);
      for (const name of attrNames) {
        entry.names.add(name);
      }

      entry.count = Math.max(entry.count, entry.names.size);
    }

    return byPort;
  }

  _buildSlotData(ctx) {
    const discovered = Array.isArray(ctx?.numberedPorts) ? ctx.numberedPorts : [];
    const numberedRaw = mergePortsWithLayout(ctx?.layout, discovered);

    const specialsRaw = mergeSpecialsWithLayout(
      ctx?.layout,
      ctx?.type === "gateway" ? discoverSpecialPorts(ctx?.entities || []) : [],
      discovered
    );

    this._applyManualPortSensorOverrides(numberedRaw, specialsRaw);

    if (ctx?.type === "gateway") {
      return applyGatewayPortOverrides(
        this._config,
        specialsRaw,
        numberedRaw,
        ctx?.layout
      );
    }

    return { specials: specialsRaw, numbered: numberedRaw };
  }

  _hasRelevantStateChanges(previousHass, nextHass) {
    const entities = this._ctx?.entities || [];
    if (!Array.isArray(entities) || entities.length === 0) return true;

    for (const entity of entities) {
      const id = entity?.entity_id;
      if (!id) continue;
      if (previousHass?.states?.[id] !== nextHass?.states?.[id]) return true;
    }

    return false;
  }

  _manualPortSpeedOverrides() {
    const out = new Map();
    const entries = Object.entries(this._config || {});

    for (const [key, value] of entries) {
      const match = String(key || "").match(/^port_(\d+)$/i);
      if (!match) continue;

      const port = Number.parseInt(match[1], 10);
      const entityId = String(value || "").trim();
      if (!Number.isInteger(port) || port < 1 || !entityId) continue;

      out.set(port, entityId);
    }

    return out;
  }

  _applyManualPortSensorOverrides(numbered, specials) {
    const overrides = this._manualPortSpeedOverrides();
    if (!overrides.size) return;

    const allSlots = [...(Array.isArray(numbered) ? numbered : []), ...(Array.isArray(specials) ? specials : [])];
    const overrideEntities = new Set(overrides.values());

    for (const slot of allSlots) {
      if (!slot || !overrideEntities.has(slot.speed_entity)) continue;
      slot.speed_entity = null;
    }

    for (const [port, entityId] of overrides.entries()) {
      const slot = allSlots.find((entry) => entry?.port === port);
      if (!slot) continue;

      slot.speed_entity = entityId;
      if (!Array.isArray(slot.raw_entities)) slot.raw_entities = [];
      if (!slot.raw_entities.includes(entityId)) slot.raw_entities.push(entityId);

      const derivedRx = this._deriveTelemetrySibling(entityId, "rx");
      if (derivedRx) {
        slot.rx_entity = derivedRx;
        if (!slot.raw_entities.includes(derivedRx)) slot.raw_entities.push(derivedRx);
      }

      const derivedTx = this._deriveTelemetrySibling(entityId, "tx");
      if (derivedTx) {
        slot.tx_entity = derivedTx;
        if (!slot.raw_entities.includes(derivedTx)) slot.raw_entities.push(derivedTx);
      }

      const derivedPoePower = this._deriveTelemetrySibling(entityId, "poe_power");
      if (derivedPoePower) {
        slot.poe_power_entity = derivedPoePower;
        if (!slot.raw_entities.includes(derivedPoePower)) slot.raw_entities.push(derivedPoePower);
      }

      const derivedPoeSwitch = this._deriveTelemetrySibling(entityId, "poe_switch");
      if (derivedPoeSwitch) {
        slot.poe_switch_entity = derivedPoeSwitch;
        if (!slot.raw_entities.includes(derivedPoeSwitch)) slot.raw_entities.push(derivedPoeSwitch);
      }
    }
  }

  _deriveTelemetrySibling(speedEntityId, metric) {
    const source = String(speedEntityId || "").trim();
    if (!source.startsWith("sensor.") || !source.endsWith("_link_speed")) return null;

    const base = source.replace(/^sensor\./i, "").replace(/_link_speed$/i, "");
    if (!base) return null;

    const candidates = metric === "rx"
      ? [`sensor.${base}_rx`]
      : metric === "tx"
        ? [`sensor.${base}_tx`]
        : metric === "poe_power"
          ? [
              `sensor.${base}_poe_power`,
              `sensor.${base}_poe_consumption`,
              `sensor.${base}_power_draw`,
            ]
          : metric === "poe_switch"
            ? [
                `switch.${base}_poe`,
                `switch.${base}_poe_enabled`,
                `switch.${base}_poe_port_control`,
                `switch.${base}_port_poe`,
              ]
            : [];

    if (!candidates.length) return null;
    return candidates.find((candidate) => !!this._hass?.states?.[candidate]) || null;
  }

  _normalizePortList(value) {
    if (!Array.isArray(value)) return [];
    const numeric = value
      .map((entry) => Number.parseInt(entry, 10))
      .filter((num) => Number.isInteger(num) && num > 0);
    return Array.from(new Set(numeric)).sort((a, b) => a - b);
  }

  _applySpecialPortSelection(specials, numbered) {
    const specialPortDefaults = specials
      .map((slot) => slot?.port)
      .filter((port) => Number.isInteger(port));
    const hasEditMode = this._config?.edit_special_ports === true;
    const hasExplicitSpecialPorts =
      hasEditMode && Object.prototype.hasOwnProperty.call(this._config || {}, "special_ports");

    const selectedPorts = hasEditMode
      ? (hasExplicitSpecialPorts
          ? this._normalizePortList(this._config?.special_ports)
          : this._normalizePortList(specialPortDefaults))
      : this._normalizePortList([
          ...specialPortDefaults,
          ...this._normalizePortList(this._config?.custom_special_ports),
        ]);

    const allByPort = new Map();
    for (const slot of [...specials, ...numbered]) {
      if (!Number.isInteger(slot?.port) || allByPort.has(slot.port)) continue;
      allByPort.set(slot.port, slot);
    }

    const selectedSet = new Set(selectedPorts);
    const nextSpecials = selectedPorts
      .map((port) => allByPort.get(port))
      .filter(Boolean)
      .map((slot) => ({ ...slot, kind: "special", label: slot.label || String(slot.port) }));

    const numberedByPort = new Map(
      numbered
        .filter((slot) => Number.isInteger(slot?.port))
        .map((slot) => [slot.port, slot])
    );

    const nextNumbered = numbered
      .filter((slot) => !selectedSet.has(slot.port))
      .map((slot) => ({ ...slot, kind: "numbered", label: slot.label || String(slot.port) }));

    for (const slot of specials) {
      if (!Number.isInteger(slot?.port) || selectedSet.has(slot.port)) continue;
      if (numberedByPort.has(slot.port)) continue;
      nextNumbered.push({
        ...slot,
        key: `port-${slot.port}`,
        kind: "numbered",
        label: String(slot.port),
      });
    }

    nextNumbered.sort((a, b) => (a.port || 0) - (b.port || 0));
    return { specials: nextSpecials, numbered: nextNumbered };
  }

  _buildEffectiveRows(ctx, numbered) {
    const baseRows = (ctx?.layout?.rows || []).map((row) => [...row]);
    const knownPorts = new Set(baseRows.flat());
    const orderedPorts = numbered
      .map((slot) => slot?.port)
      .filter((port) => Number.isInteger(port))
      .sort((a, b) => a - b);

    const extraPorts = numbered
      .map((slot) => slot?.port)
      .filter((port) => Number.isInteger(port) && !knownPorts.has(port))
      .sort((a, b) => a - b);

    if (!extraPorts.length && !baseRows.length && !orderedPorts.length) return [];

    const fitCols = this._maxFittableColumns();

    if (!baseRows.length) {
      if (!Number.isFinite(fitCols) || extraPorts.length <= fitCols) return [extraPorts];
      const packed = [];
      for (let i = 0; i < extraPorts.length; i += fitCols) {
        packed.push(extraPorts.slice(i, i + fitCols));
      }
      return packed;
    }

    const rows = baseRows.map((row) => [...row]);
    if (extraPorts.length) rows[rows.length - 1].push(...extraPorts);
    const widestRow = rows.reduce((max, row) => Math.max(max, row.length), 0);
    if (!Number.isFinite(fitCols) || widestRow <= fitCols) return rows;

    const packedRows = [];
    for (let i = 0; i < orderedPorts.length; i += fitCols) {
      packedRows.push(orderedPorts.slice(i, i + fitCols));
    }
    return packedRows;
  }

  _shouldUseOddEvenRows(ctx, numbered) {
    if (!ctx || (ctx.type !== "switch" && ctx.type !== "gateway")) return false;
    if (this._config?.force_sequential_ports === true) return false;
    // Explicit per-layout overrides always win.
    if (ctx?.layout?.rj45_odd_even === true) return true;
    if (ctx?.layout?.rj45_odd_even === false) return false;
    // Devices with an explicit multi-row frontStyle (six-grid, eight-grid, dual-row,
    // quad-row) already define their own row groupings.  Applying odd/even reordering
    // on top would break those groupings (e.g. a USW Pro 24 ending up with 6 columns
    // instead of the declared 6-per-row layout).
    const frontStyle = String(ctx?.layout?.frontStyle || "");
    if (["dual-row", "six-grid", "eight-grid", "quad-row"].includes(frontStyle)) {
      return false;
    }
    const portCount = (numbered || []).filter((slot) => Number.isInteger(slot?.port)).length;
    return portCount > 8;
  }

  _applyOddEvenRows(rows) {
    const out = [];
    for (let i = 0; i < rows.length; i += 2) {
      const first = rows[i] || [];
      const second = rows[i + 1] || [];
      const pair = [...first, ...second];
      if (pair.length <= 1) {
        if (first.length) out.push(first);
        if (second.length) out.push(second);
        continue;
      }

      const odds = pair.filter((port) => Number.isInteger(port) && port % 2 === 1);
      const evens = pair.filter((port) => Number.isInteger(port) && port % 2 === 0);
      if (odds.length && evens.length) {
        out.push(odds, evens);
      } else {
        if (first.length) out.push(first);
        if (second.length) out.push(second);
      }
    }
    return out;
  }

  _rotate180Enabled(ctx) {
    const type = ctx?.type;
    const rawRotate = this._config?.rotate180;
    const rotate180 =
      rawRotate === true ||
      rawRotate === "true" ||
      rawRotate === 1 ||
      rawRotate === "1";

    return (type === "switch" || type === "gateway") && rotate180;
  }

  async _ensureLoaded() {
    if (!this._hass || !this._config?.device_id) return;

    const currentId = this._config.device_id;
    if (this._loadedDeviceId === currentId && this._ctx) return;
    if (this._loading) return;

    this._loading = true;
    this._log("debug", "loading device context");
    this._render();
    const token = ++this._loadToken;

    try {
      const ctx = await getDeviceContext(this._hass, currentId, this._config);
      if (token !== this._loadToken) return;

      this._ctx = ctx;
      this._loadedDeviceId = currentId;
      const portSnapshot = this._buildPortDebugSnapshot(ctx);
      this._log("info", "context loaded", {
        type: ctx?.type || null,
        model: ctx?.model || null,
        identity_mac: ctx?.identity?.primary_mac || null,
        ...(portSnapshot.summary || {}),
        top_traffic: portSnapshot.top_traffic || [],
      });
      if (this._shouldLog("debug") && portSnapshot.ports?.length) {
        this._log("debug", "port snapshot", portSnapshot.ports);
      }

      const { specials, numbered } = this._buildSlotData(ctx);
      const first = specials[0] || numbered[0] || null;
      this._selectedKey = first?.key || null;
    } catch (err) {
      this._log("error", "Failed to load device context", err);
      if (token !== this._loadToken) return;
      this._ctx = null;
      this._loadedDeviceId = null;
    }

    this._loading = false;
    this._render();
  }

  _selectKey(key) {
    this._selectedKey = key;
    this._render();
  }

  async _toggleEntity(entityId) {
    if (!entityId || !this._hass) return;
    const [domain] = entityId.split(".");
    this._log("debug", "toggle entity", entityId);
    await this._hass.callService(domain, "toggle", { entity_id: entityId });
  }

  async _pressButton(entityId) {
    if (!entityId || !this._hass) return;
    this._log("debug", "press button", entityId);
    await this._hass.callService("button", "press", { entity_id: entityId });
  }

  _title() {
    if (this._config?.show_name === false) return "";
    if (this._config?.name) return this._config.name;
    if (this._ctx?.name) return this._ctx.name;
    return "UniFi Device Card";
  }

  _subtitle() {
    if (!this._config?.device_id || !this._ctx) return `Version ${VERSION}`;
    const fw = this._ctx?.firmware;
    const model = this._ctx?.layout?.displayModel || this._ctx?.model || "";
    return fw ? `${model} · FW ${fw}` : model;
  }

  _headerMetrics() {
    if (!this._ctx || !this._hass) return [];

    const metrics = [
      { key: "cpu_utilization", entity: this._ctx.cpu_utilization_entity },
      { key: "cpu_temperature", entity: this._ctx.cpu_temperature_entity },
      { key: "memory_utilization", entity: this._ctx.memory_utilization_entity },
      { key: "temperature", entity: this._ctx.temperature_entity },
    ];

    const seenEntities = new Set();
    return metrics
      .filter((item) => {
        if (!item.entity) return false;
        if (seenEntities.has(item.entity)) return false;
        seenEntities.add(item.entity);
        return formatState(this._hass, item.entity) !== "—";
      })
      .map((item) => ({
        label: this._t(item.key),
        value: formatState(this._hass, item.entity),
      }));
  }

  /**
   * Wrapper around the module-level isPortConnected() that adds sticky-state
   * tracking for SFP-like ports.  When a port has been observed with live
   * traffic, short polling-interval gaps where rx/tx momentarily reads 0 will
   * no longer flip the LED off.  The sticky state is cleared only when the
   * link speed itself drops to 0 (cable genuinely removed).
   */
  _isPortConnected(port) {
    if (isSfpLikePort(port)) {
      const key = port?.key || port?.physical_key;
      if (key) {
        if (hasTraffic(this._hass, port)) this._sfpConnectedSeen.add(key);
        const result = isPortConnected(this._hass, port);
        if (!result && this._sfpConnectedSeen.has(key)) {
          // Port was live before — only keep sticky when speed entity confirms
          // the link is still up (> 0). A null means no speed entity exists so
          // we cannot distinguish a poll-dip from a real disconnect; let it fall
          // through. A value of 0 means the cable was removed.
          const speedMbit = parseLinkSpeedMbit(this._hass, port?.speed_entity);
          if (speedMbit != null && speedMbit > 0) return true;
          // Speed is 0 or unavailable: clear sticky state.
          this._sfpConnectedSeen.delete(key);
        }
        return result;
      }
    }
    return isPortConnected(this._hass, port);
  }

  _connectedCount(allSlots) {
    return allSlots.filter((s) => this._isPortConnected(s)).length;
  }

  _isDeviceOnline() {
    const onlineEntity = this._ctx?.online_entity;
    if (!onlineEntity) return false;
    const raw = String(formatState(this._hass, onlineEntity) || "").toLowerCase().trim();
    if (!raw || raw === "—") return false;

    const onlineTokens = ["online", "connected", "verbunden", "available", "bereit", "up", "on", "true", "1"];
    const offlineTokens = ["offline", "disconnected", "getrennt", "not connected", "unavailable", "down", "off", "false", "0"];

    if (offlineTokens.some((token) => raw === token || raw.includes(token))) return false;
    return onlineTokens.some((token) => raw === token || raw.includes(token));
  }

  _speedValueMbit(port) {
    return parseLinkSpeedMbit(this._hass, port?.speed_entity);
  }

  _linkLedClass(port) {
    const connected = this._isPortConnected(port);
    if (!connected) return "off";

    const speed = this._speedValueMbit(port);
    if (speed == null) return "green";
    if (speed >= 1000) return "green";
    return "orange";
  }

  _poeLedClass(port) {
    const poe = getPoeStatus(this._hass, port);
    return poe.active ? "orange" : "off";
  }

  _portMediaType(slot) {
    const label = String(slot?.label || "").toLowerCase();
    const key = String(slot?.key || "").toLowerCase();
    const physicalKey = String(slot?.physical_key || "").toLowerCase();
    const rawEntities = Array.isArray(slot?.raw_entities)
      ? slot.raw_entities.map((entityId) => String(entityId || "").toLowerCase())
      : [];
    const layoutSlot = Number.isInteger(slot?.port)
      ? (this._ctx?.layout?.specialSlots || []).find((s) => s.port === slot.port)
      : null;
    const layoutKey = String(layoutSlot?.key || "").toLowerCase();
    const layoutLabel = String(layoutSlot?.label || "").toLowerCase();
    const allHints = [label, key, physicalKey, layoutKey, layoutLabel, ...rawEntities].join(" ");

    if (allHints.includes("sfp28") || allHints.includes("25g")) return "sfp28";
    if (
      allHints.includes("sfp+") ||
      allHints.includes("sfpplus") ||
      allHints.includes("sfp_plus")
    ) {
      return "sfp_plus";
    }
    if (allHints.includes("sfp")) return "sfp";
    return "rj45";
  }

  _isSfpLike(slot) {
    return this._portMediaType(slot) !== "rj45";
  }

  _isWanLike(slot) {
    const key = String(slot?.key || "").toLowerCase();
    return key === "wan" || key === "wan2";
  }

  _renderContacts() {
    return `
      <div class="rj45-contacts">
        <span></span><span></span><span></span><span></span>
        <span></span><span></span><span></span><span></span>
      </div>
    `;
  }

  _renderPortButton(slot, selectedKey, portClientIndex = null, oddEvenTopRow = false) {
    const isSpecial = slot.kind === "special";
    const mediaType = this._portMediaType(slot);
    const isSfp = mediaType !== "rj45";
    const isWan = this._isWanLike(slot);
    const linkUp = this._isPortConnected(slot);
    const poeStatus = getPoeStatus(this._hass, slot);
    const poeOn = poeStatus.active;

    const clientInfo = this._getPortClientInfo(slot);
    const indexedPortInfo = Number.isInteger(slot?.port) ? portClientIndex?.get(slot.port) : null;
    const indexedNames = indexedPortInfo?.names ? Array.from(indexedPortInfo.names) : [];
    const indexedCount = indexedPortInfo?.count || indexedNames.length;
    const mergedNames = Array.from(new Set([...(clientInfo?.names || []), ...indexedNames])).slice(0, 8);
    const mergedCount = Math.max(clientInfo?.count || 0, indexedCount);
    const tooltip = [
      slot.port_label || (isSpecial ? slot.label : `${this._t("port_label")} ${slot.label}`),
      this._translateState(getPortLinkText(this._hass, slot)),
      linkUp ? getPortSpeedText(this._hass, slot) : null,
      poeOn ? `${this._t("poe")}${poeStatus.power ? ` ${poeStatus.power}` : " ON"}` : null,
      mergedCount > 0 ? `${this._t("clients")}: ${mergedCount}` : null,
      mergedNames.length ? mergedNames.join(", ") : null,
    ].filter((v) => v && v !== "—").join(" · ");

    const classes = [
      "port",
      isSpecial ? "special" : "",
      isSfp ? "is-sfp" : "is-rj45",
      `media-${this._safeClassToken(mediaType, "rj45")}`,
      this._rotate180Enabled(this._ctx) ? "rotated180" : "",
      isWan ? "is-wan" : "",
      oddEvenTopRow && !isSpecial && !isSfp ? "odd-even-top" : "",
      linkUp ? "up" : "down",
      selectedKey === slot.key ? "selected" : "",
    ].filter(Boolean).join(" ");

    const poeLed = this._poeLedClass(slot);
    const linkLed = this._linkLedClass(slot);

    const housing = isSfp
      ? `
        <div class="port-sfp-wrap">
          <div class="sfp-top-led ${linkLed}"></div>
          <div class="port-sfp">
            <div class="sfp-frame"></div>
            <div class="sfp-rail top"></div>
            <div class="sfp-rail bottom"></div>
            <div class="sfp-slot"></div>
            <div class="sfp-inner"></div>
            <div class="sfp-latch"></div>
          </div>
        </div>
      `
      : `
        <div class="port-rj45">
          <div class="rj45-shell-top"></div>
          ${this._renderContacts()}
          <div class="rj45-cavity"></div>
          <div class="rj45-led left ${poeLed}"></div>
          <div class="rj45-led right ${linkLed}"></div>
          <div class="rj45-notch"></div>
          <div class="rj45-floor"></div>
        </div>
      `;

    return `<button class="${this._escapeAttr(classes)}" data-key="${this._escapeAttr(slot.key)}" title="${this._escapeAttr(tooltip)}">
      <div class="port-housing">
        ${housing}
      </div>
      <div class="port-num">${this._escapeHtml(slot.label)}</div>
    </button>`;
  }

  _styles() {
    return `<style>
      :host {
        --udc-bg: #141820;
        --udc-surface: #1e2433;
        --udc-surf2: #252d3d;
        --udc-border: rgba(255,255,255,0.07);
        --udc-accent: #0090d9;
        --udc-green: #31d35f;
        --udc-orange: #f0b312;
        --udc-text: #e2e8f0;
        --udc-muted: #6f7d90;
        --udc-dim: #9aa7b9;
        --udc-r: 14px;
        --udc-rsm: 8px;
        --udc-port-size: 36px;
        --udc-ap-scale: 1;
      }

      ha-card {
        background: var(--udc-card-bg, var(--ha-card-background, var(--card-background-color)));
        border-radius: var(--ha-card-border-radius, 12px);
        overflow: hidden;
        position: relative;
        isolation: isolate;
      }

      .header {
        padding: 16px 18px 13px;
        background: var(--udc-chrome-bg, linear-gradient(160deg, var(--udc-surface) 0%, var(--udc-bg) 100%));
        border-bottom: 1px solid var(--udc-border);
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 10px;
      }

      .header-info {
        display: grid;
        gap: 2px;
        min-width: 0;
        flex: 1 1 auto;
      }

      .header-actions {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-shrink: 0;
      }

      .title {
        font-size: 1.05rem;
        font-weight: 700;
        letter-spacing: -.02em;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .subtitle {
        font-size: 0.73rem;
        color: var(--udc-muted);
      }

      .meta-list {
        display: grid;
        gap: 2px;
        margin-top: 4px;
      }

      .meta-row {
        display: flex;
        gap: 6px;
        align-items: baseline;
        font-size: 0.73rem;
        min-width: 0;
      }

      .meta-label {
        color: var(--primary-text-color, var(--udc-text));
        white-space: nowrap;
        font-weight: 500;
      }

      .meta-value {
        color: var(--primary-text-color, var(--udc-text));
        font-weight: 600;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .chip {
        display: flex;
        align-items: center;
        gap: 4px;
        background: var(--udc-surf2);
        border: 1px solid var(--udc-border);
        border-radius: 20px;
        padding: 2px 8px;
        font-size: 0.68rem;
        font-weight: 600;
        white-space: nowrap;
        color: var(--udc-dim);
        flex-shrink: 0;
      }

      button.chip {
        cursor: pointer;
        font: inherit;
      }

      button.chip:hover {
        filter: brightness(1.08);
      }

      .chip.compact {
        padding: 1px 7px;
        font-size: 0.64rem;
      }

      .chip .dot {
        width: 5px;
        height: 5px;
        border-radius: 50%;
        background: var(--udc-green);
        box-shadow: 0 0 5px var(--udc-green);
        animation: blink 2.5s ease-in-out infinite;
      }

      .chip .led-indicator {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: var(--led-indicator, #868b93);
        box-shadow: 0 0 6px color-mix(in srgb, var(--led-indicator, #868b93) 70%, transparent);
      }

      @keyframes blink {
        0%, 100% { opacity: 1; }
        50% { opacity: .4; }
      }

      .frontpanel {
        padding: 12px 14px 10px;
        display: grid;
        gap: 3px;
        border-bottom: 1px solid var(--udc-border);
        position: relative;
        z-index: 0;
        overflow: hidden;
      }

      .frontpanel.theme-white { background: #d6d6d9; }
      .frontpanel.theme-silver { background: #c4c5c8; }
      .frontpanel.theme-dark { background: #d0d1d4; }
      .frontpanel.no-panel-bg { background: var(--udc-chrome-bg, transparent); }

      .panel-label {
        font-size: 0.63rem;
        font-weight: 700;
        letter-spacing: .1em;
        text-transform: uppercase;
        margin-bottom: 2px;
        color: #7c818b;
      }

      .special-row {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
        margin-bottom: 3px;
      }

      .port-row {
        display: flex;
        flex-wrap: wrap;
        gap: 4px 6px;
        width: 100%;
        align-items: flex-start;
      }

      .frontpanel.rotate180-enabled .panel-label {
        text-align: right;
      }

      .frontpanel.rotate180-enabled .special-row {
        justify-content: flex-end;
      }

      .frontpanel.rotate180-enabled .port-row {
        justify-content: end;
      }

      .frontpanel.single-row .port-row,
      .frontpanel.gateway-single-row .port-row {
        --udc-cols: 8;
      }

      .frontpanel.dual-row .port-row {
        --udc-cols: 8;
      }

      .frontpanel.gateway-rack .port-row {
        --udc-cols: 8;
      }

      .frontpanel.gateway-compact .port-row {
        --udc-cols: 5;
      }

      .frontpanel.six-grid .port-row {
        --udc-cols: 6;
      }

      .frontpanel.eight-grid .port-row {
        --udc-cols: 8;
      }

      .frontpanel.quad-row .port-row {
        --udc-cols: 12;
      }

      .frontpanel.ultra-row .port-row {
        --udc-cols: 7;
      }

      .frontpanel.grid-4 .port-row {
        --udc-cols: 4;
      }

      .frontpanel.grid-5 .port-row {
        --udc-cols: 5;
      }

      .frontpanel.grid-9 .port-row {
        --udc-cols: 9;
      }

      .frontpanel.grid-10 .port-row {
        --udc-cols: 10;
      }

      .frontpanel.ap-disc {
        background: var(--udc-chrome-bg, linear-gradient(160deg, var(--udc-surface) 0%, var(--udc-bg) 100%));
        display: grid;
        place-items: center;
        min-height: calc((225px * var(--udc-ap-scale)) + 34px);
        border-bottom: 1px solid var(--udc-border);
        position: relative;
        overflow: hidden;
        padding: 4px 14px;
      }

      .ap-layout.compact {
        display: grid;
        grid-template-columns: 1fr 1fr;
        align-items: stretch;
      }

      .ap-layout.compact .frontpanel.ap-disc {
        min-height: 0;
        border-bottom: none;
        border-right: 1px solid var(--udc-border);
      }

      .ap-layout.compact .ap-device {
        width: min(100%, calc(180px * var(--udc-ap-scale)));
      }

      .ap-layout.compact .section {
        display: grid;
        align-content: center;
      }

      .ap-layout.compact .detail-grid {
        grid-template-columns: 1fr;
        gap: 10px;
        margin-bottom: 0;
      }

      .ap-device {
        width: calc(225px * var(--udc-ap-scale));
        height: auto;
        aspect-ratio: 1 / 1;
        max-width: 100%;
        border-radius: 50%;
        background: radial-gradient(circle at 30% 28%, #e9edf4 0%, #cfd5df 52%, #b6becb 100%);
        box-shadow:
          inset -8px -10px 16px rgba(0,0,0,.08),
          inset 9px 12px 17px rgba(255,255,255,.7),
          0 12px 22px rgba(0,0,0,.18);
        display: grid;
        place-items: center;
      }

      .ap-ring {
        width: 41%;
        height: 41%;
        border-radius: 50%;
        border: max(2px, calc(4px * var(--udc-ap-scale))) solid var(--ap-ring-color, #a5adb8);
        box-shadow: 0 0 11px rgba(165,173,184,.35);
        display: grid;
        place-items: center;
        transition: border-color .18s ease, box-shadow .18s ease;
      }

      .ap-ring.online {
        border-color: var(--ap-ring-color, rgb(0, 0, 255));
        box-shadow:
          0 0 12px color-mix(in srgb, var(--ap-ring-color, rgb(0, 0, 255)) 55%, transparent),
          0 0 24px color-mix(in srgb, var(--ap-ring-color, rgb(0, 0, 255)) 32%, transparent);
      }

      .ap-ring.off {
        border-color: #868b93;
        box-shadow: inset 0 -1px 0 rgba(0,0,0,.2);
      }

      .ap-logo {
        color: rgba(82, 89, 102, .55);
        font-size: calc(42px * var(--udc-ap-scale));
        font-weight: 700;
        font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
        line-height: 1;
        transform: translateY(-1px);
        user-select: none;
      }

      .port {
        cursor: pointer;
        font: inherit;
        display: flex;
        flex-direction: column;
        align-items: center;
        width: calc(var(--udc-port-size) - 2px);
        flex: 0 0 calc(var(--udc-port-size) - 2px);
        padding: 0 0 1px;
        border-radius: 2px;
        position: relative;
        min-width: 0;
        border: none;
        background: transparent;
        transition: outline .1s ease, opacity .15s ease, filter .15s ease;
      }

      .port:focus {
        outline: none;
      }

      .port.selected {
        outline: 2px solid var(--udc-accent);
        outline-offset: 1px;
      }

      .port:hover {
        outline: 1px solid rgba(0,144,217,.5);
        outline-offset: 1px;
      }

      .port-housing {
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: flex-start;
        transition: opacity .15s ease, filter .15s ease;
      }

      .port.rotated180 .port-housing {
        transform: rotate(180deg);
      }

      .port.down .port-housing {
        opacity: .42;
        filter: saturate(.45) brightness(.78);
      }

      .port.up .port-housing {
        opacity: 1;
        filter: saturate(1.05) brightness(1.02);
      }

      .port:hover .port-housing,
      .port.selected .port-housing {
        opacity: 1;
        filter: none;
      }

      .port-rj45 {
        position: relative;
        width: calc(var(--udc-port-size) - 2px);
        height: calc(var(--udc-port-size) - 2px);
        background: linear-gradient(180deg, #2e3137 0%, #0b0c0e 100%);
        border: 1px solid #666a72;
        border-radius: 1px 1px 2px 2px;
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,.05),
          inset 0 -1px 0 rgba(0,0,0,.45);
        overflow: hidden;
        z-index: 0;
      }

      .port.odd-even-top .port-rj45 {
        transform: rotate(180deg);
        transform-origin: 50% 50%;
      }

      .port.odd-even-top .rj45-led.left {
        left: 50%;
        right: 0;
        margin-left: 3px;
        margin-right: 0;
      }

      .port.odd-even-top .rj45-led.right {
        right: 50%;
        left: 0;
        margin-right: 3px;
        margin-left: 0;
      }

      .rj45-shell-top {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 2px;
        background: linear-gradient(180deg, rgba(255,255,255,.06) 0%, rgba(255,255,255,0) 100%);
        pointer-events: none;
      }

      .rj45-contacts {
        position: absolute;
        top: 4px;
        left: 4px;
        right: 4px;
        height: 3px;
        display: grid;
        grid-template-columns: repeat(8, 1fr);
        gap: 1px;
        z-index: 2;
      }

      .rj45-contacts span {
        display: block;
        background: #caa252;
        min-width: 0;
      }

      .rj45-cavity {
        position: absolute;
        top: 8px;
        left: 3px;
        right: 3px;
        bottom: 2px;
        background: linear-gradient(180deg, #14181d 0%, #060708 100%);
        z-index: 1;
      }

      .rj45-led {
        position: absolute;
        bottom: 1px;
        height: 4px;
        border-radius: 0;
        background: linear-gradient(180deg, #9ea3ab 0%, #767c85 100%);
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,.16),
          inset 0 -1px 0 rgba(0,0,0,.28);
        z-index: 1;
      }

      .rj45-led.left {
        left: 0;
        right: 50%;
        margin-right: 3px;
      }

      .rj45-led.right {
        right: 0;
        left: 50%;
        margin-left: 3px;
      }

      .rj45-led.orange {
        background: linear-gradient(180deg, #efc14d 0%, #efb21a 58%, #b8820d 100%);
        box-shadow:
          0 0 2px rgba(239,178,26,.42),
          inset 0 1px 0 rgba(255,255,255,.22),
          inset 0 -1px 0 rgba(0,0,0,.35);
      }

      .rj45-led.green {
        background: linear-gradient(180deg, #63ea86 0%, #33d35d 58%, #1c8e3a 100%);
        box-shadow:
          0 0 2px rgba(51,211,93,.42),
          inset 0 1px 0 rgba(255,255,255,.22),
          inset 0 -1px 0 rgba(0,0,0,.35);
      }

      .rj45-led.off {
        background: #868b93;
        box-shadow: inset 0 -1px 0 rgba(0,0,0,.2);
      }

      .rj45-notch {
        position: absolute;
        left: 35%;
        right: 35%;
        bottom: 0;
        height: 6px;
        background: #d0d1d4;
        border-radius: 1px 1px 0 0;
        z-index: 6;
      }

      .rj45-floor {
        position: absolute;
        left: 3px;
        right: 3px;
        bottom: 0;
        height: 2px;
        background: #0e1014;
        z-index: 2;
      }

      .port-sfp-wrap {
        width: 100%;
        display: grid;
        justify-items: center;
        gap: 1px;
      }

      .sfp-top-led {
        width: 16px;
        height: 4px;
        border-radius: 0;
        background: linear-gradient(180deg, #9ea3ab 0%, #767c85 100%);
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,.16),
          inset 0 -1px 0 rgba(0,0,0,.28);
      }

      .sfp-top-led.orange {
        background: linear-gradient(180deg, #efc14d 0%, #efb21a 58%, #b8820d 100%);
        box-shadow:
          0 0 2px rgba(239,178,26,.42),
          inset 0 1px 0 rgba(255,255,255,.22),
          inset 0 -1px 0 rgba(0,0,0,.35);
      }

      .sfp-top-led.green {
        background: linear-gradient(180deg, #63ea86 0%, #33d35d 58%, #1c8e3a 100%);
        box-shadow:
          0 0 2px rgba(51,211,93,.42),
          inset 0 1px 0 rgba(255,255,255,.22),
          inset 0 -1px 0 rgba(0,0,0,.35);
      }

      .sfp-top-led.off {
        background: #868b93;
        box-shadow: inset 0 -1px 0 rgba(0,0,0,.2);
      }

      .port-sfp {
        position: relative;
        width: calc(var(--udc-port-size) - 2px);
        height: var(--udc-port-size);
        z-index: 0;
      }

      .sfp-frame {
        position: absolute;
        inset: 0;
        background: linear-gradient(180deg, #7d828a 0%, #62676f 100%);
        border: 1px solid #6d7279;
        border-radius: 1px;
      }

      .sfp-rail {
        position: absolute;
        left: 3px;
        right: 3px;
        height: 1px;
        background: rgba(230,235,240,.28);
        z-index: 3;
      }

      .sfp-rail.top {
        top: 5px;
      }

      .sfp-rail.bottom {
        bottom: 5px;
      }

      .sfp-slot {
        position: absolute;
        left: 3px;
        right: 3px;
        top: 5px;
        bottom: 5px;
        background: linear-gradient(180deg, #171b22 0%, #060709 100%);
        border: 1px solid rgba(220,225,230,.10);
        z-index: 1;
      }

      .sfp-inner {
        position: absolute;
        left: 6px;
        right: 6px;
        top: 9px;
        bottom: 9px;
        background: rgba(130,140,155,.16);
        z-index: 2;
      }

      .sfp-latch {
        position: absolute;
        left: 10px;
        right: 10px;
        bottom: 2px;
        height: 4px;
        background: rgba(210,214,220,.48);
        z-index: 4;
      }

      .port.special {
        min-width: calc(var(--udc-port-size) - 2px);
        max-width: calc(var(--udc-port-size) - 2px);
      }

      .port-num {
        font-size: 7px;
        font-weight: 800;
        line-height: 1;
        margin-top: 1px;
        letter-spacing: 0;
        user-select: none;
        color: #646a76;
        transition: color .15s ease, opacity .15s ease;
      }

      .port.down .port-num {
        color: #4c5260;
        opacity: .6;
      }

      .port.up .port-num {
        color: #414957;
        opacity: 1;
      }

      .port:hover .port-num,
      .port.selected .port-num {
        opacity: 1;
      }

      .port.is-sfp .port-num {
        font-size: 6px;
      }

      .section {
        padding: 12px 14px 14px;
        background: var(--udc-chrome-bg, transparent);
        position: relative;
        z-index: 1;
      }

      .detail-title {
        font-size: 0.8rem;
        font-weight: 700;
        margin-bottom: 8px;
        color: var(--primary-text-color, var(--udc-text));
      }

      .detail-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 6px 10px;
        margin-bottom: 10px;
      }

      .detail-item {
        display: grid;
        gap: 2px;
      }

      .detail-label {
        font-size: 0.67rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: .06em;
        color: var(--secondary-text-color, var(--udc-muted));
      }

      .detail-value {
        font-size: 0.85rem;
        font-weight: 600;
        color: var(--primary-text-color, var(--udc-text));
      }

      .detail-value.online { color: var(--udc-green); }
      .detail-value.offline { color: var(--udc-muted); }
      .detail-value.pending { color: #efb21a; }

      .actions {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        margin-top: 8px;
      }

      .action-btn {
        font: inherit;
        font-size: 0.8rem;
        font-weight: 600;
        padding: 6px 14px;
        border-radius: var(--udc-rsm);
        border: none;
        cursor: pointer;
        transition: opacity .15s, filter .15s;
      }

      .action-btn:hover { opacity: .85; }
      .action-btn:active { filter: brightness(.9); }

      .action-btn.primary {
        background: #0090d9;
        color: #fff;
      }

      .action-btn.primary.dimmed {
        opacity: .52;
        filter: saturate(.6) brightness(.9);
      }

      .action-btn.secondary {
        background: var(--udc-surf2);
        border: 1px solid var(--udc-border);
        color: var(--primary-text-color, var(--udc-text));
      }

      .muted {
        color: var(--secondary-text-color, var(--udc-muted));
        font-size: 0.82rem;
      }

      .empty-state,
      .loading-state {
        padding: 24px 18px;
        color: var(--secondary-text-color, var(--udc-muted));
        font-size: 0.85rem;
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .spinner {
        width: 16px;
        height: 16px;
        border: 2px solid var(--udc-border);
        border-top-color: #0090d9;
        border-radius: 50%;
        animation: spin .7s linear infinite;
        flex-shrink: 0;
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    </style>`;
  }

  _renderPanelAndDetail() {
    if (this._ctx?.type === "access_point") {
      const online = this._isDeviceOnline();
      const compactApView = this._apCompactViewEnabled();
      const apStatusRaw = this._apStatusRaw(this._ctx?.ap_status_entity);
      const apStatus = this._apStatusState(this._ctx?.ap_status_entity);
      const apStatusClass = apStatusRaw === "connected" ? "online" : (apStatusRaw === "disconnected" ? "offline" : "pending");
      const uptime = this._apUptimeState(this._ctx?.uptime_entity);
      const clients = this._wholeNumberState(this._ctx?.clients_entity);
      const apUplink = this._apUplinkText(this._ctx?.ap_uplink);
      const apUplinkTooltip = this._apUplinkTooltip(this._ctx?.ap_uplink);
      const { ledEntity, ledEnabled, ringColor } = this._apLedState();

      const headerTitle = this._title();
      const headerMetrics = compactApView && !this._apCompactHeaderTelemetryEnabled()
        ? []
        : this._headerMetrics();

      const escapedHeaderTitle = this._escapeHtml(headerTitle);
      const escapedSubtitle = this._escapeHtml(this._subtitle());
      this.shadowRoot.innerHTML = `${this._styles()}
        <ha-card class="ap-card ${compactApView ? "compact" : ""}" style="--udc-card-bg: ${this._cardBgStyle()}; --udc-chrome-bg: ${this._cardChromeBgStyle()}; --ap-ring-color: ${ringColor}; --udc-port-size: ${this._effectivePortSize()}px; --udc-ap-scale: ${this._apScale() / 100}">
          <div class="header">
            <div class="header-info">
              ${headerTitle ? `<div class="title">${escapedHeaderTitle}</div>` : ""}
              <div class="subtitle">${escapedSubtitle}</div>
              ${headerMetrics.length ? `<div class="meta-list">${headerMetrics.map((item) => `
                <div class="meta-row">
                  <div class="meta-label">${this._escapeHtml(item.label)}:</div>
                  <div class="meta-value">${this._escapeHtml(item.value)}</div>
                </div>`).join("")}</div>` : ""}
            </div>
            <div class="header-actions">
              ${this._ctx?.reboot_entity ? `<button class="chip compact" data-action="reboot-device">↻ ${this._escapeHtml(this._t("reboot"))}</button>` : ""}
              ${ledEntity ? `<button class="chip compact" data-action="toggle-led" style="--led-indicator: ${ledEnabled ? ringColor : "#868b93"}"><span class="led-indicator"></span>LED</button>` : ""}
            </div>
          </div>

          <div class="ap-layout ${compactApView ? "compact" : ""}">
            <div class="frontpanel ap-disc">
              <div class="ap-device">
                <div class="ap-ring ${ledEnabled ? "online" : "off"}">
                  <div class="ap-logo">u</div>
                </div>
              </div>
            </div>

            <div class="section">
              <div class="detail-grid">
                <div class="detail-item">
                  <div class="detail-label">${this._escapeHtml(this._t("ap_status"))}</div>
                  <div class="detail-value ${apStatusClass}">${this._escapeHtml(apStatus || (online ? this._t("state_connected") : this._t("state_disconnected")))}</div>
                </div>
                ${compactApView ? `
                <div class="detail-item">
                  <div class="detail-label">${this._escapeHtml(this._t("clients"))}</div>
                  <div class="detail-value">${this._escapeHtml(clients)}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">${this._escapeHtml(this._t("uptime"))}</div>
                  <div class="detail-value">${this._escapeHtml(uptime)}</div>
                </div>` : `
                <div class="detail-item">
                  <div class="detail-label">${this._escapeHtml(this._t("uptime"))}</div>
                  <div class="detail-value">${this._escapeHtml(uptime)}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">${this._escapeHtml(this._t("clients"))}</div>
                  <div class="detail-value">${this._escapeHtml(clients)}</div>
                </div>`}
                ${apUplink ? `
                <div class="detail-item">
                  <div class="detail-label">${this._escapeHtml(this._t("uplink"))}</div>
                  <div class="detail-value" title="${this._escapeAttr(apUplinkTooltip)}">${this._escapeHtml(apUplink)}</div>
                </div>` : ""}
              </div>
            </div>
          </div>
        </ha-card>`;

      this.shadowRoot.querySelector("[data-action='reboot-device']")
        ?.addEventListener("click", () => this._pressButton(this._ctx?.reboot_entity));
      this.shadowRoot.querySelector("[data-action='toggle-led']")
        ?.addEventListener("click", () => this._toggleEntity(ledEntity));

      return;
    }

    const ctx = this._ctx;
    const slotData = this._buildSlotData(ctx);
    const { specials: allSpecials, numbered: normalizedNumbered } = this._applySpecialPortSelection(
      slotData.specials,
      slotData.numbered
    );

    const allSlots = [...allSpecials, ...normalizedNumbered];
    const selected = allSlots.find((p) => p.key === this._selectedKey) || allSlots[0] || null;
    const connected = this._connectedCount(allSlots);
    const layoutTheme = ctx?.layout?.theme;
    const theme = this._safeClassToken(layoutTheme || "dark", "dark");
    const frontStyle = this._safeClassToken(ctx?.layout?.frontStyle || "single-row", "single-row");
    const showPanel = this._config?.show_panel !== false && !!layoutTheme;

    const specialPortsInUse = new Set(
      allSpecials
        .map((slot) => slot?.port)
        .filter((port) => Number.isInteger(port))
    );

    const visibleNumbered = normalizedNumbered.filter((slot) => !specialPortsInUse.has(slot.port));
    const reverseFrontpanel = this._rotate180Enabled(ctx);
    const portClientIndex = this._buildPortClientIndex();
    const oddEvenRows = this._shouldUseOddEvenRows(ctx, visibleNumbered);
    const baseRowsRaw = this._buildEffectiveRows(ctx, visibleNumbered);
    const baseRows = oddEvenRows ? this._applyOddEvenRows(baseRowsRaw) : baseRowsRaw;
    const effectiveRows = reverseFrontpanel
      ? baseRows.map((row) => [...row].reverse()).reverse()
      : baseRows;
    const renderedSpecials = reverseFrontpanel ? [...allSpecials].reverse() : allSpecials;

    const specialRow = renderedSpecials.length
      ? `<div class="special-row">${renderedSpecials.map((s) => this._renderPortButton(s, selected?.key, portClientIndex)).join("")}</div>`
      : "";

    const layoutRows = effectiveRows
      .map((rowPorts, rowIndex) => {
        const oddEvenTopRow = oddEvenRows && rowIndex % 2 === 0;
        const items = rowPorts
          .map((portNumber) => visibleNumbered.find((p) => p.port === portNumber))
          .filter(Boolean)
          .map((slot) => this._renderPortButton(slot, selected?.key, portClientIndex, oddEvenTopRow))
          .join("");

        const cols = Math.max(1, rowPorts.length);
        return items
          ? `<div class="port-row" style="--udc-cols: ${cols};">${items}</div>`
          : "";
      })
      .filter(Boolean);

    const panelRowsHtml = layoutRows.join("");
    const panelPortsHtml = reverseFrontpanel
      ? `${panelRowsHtml}${specialRow}`
      : `${specialRow}${panelRowsHtml}`;
    const panelContentHtml = panelPortsHtml || `<div class="muted" style="padding:8px 0">${this._escapeHtml(this._t("no_ports"))}</div>`;

    let detail = `<div class="muted">${this._escapeHtml(this._t("no_ports"))}</div>`;

    if (selected) {
      const linkUp = this._isPortConnected(selected);
      const linkText = getPortLinkText(this._hass, selected);
      const speedText = getPortSpeedText(this._hass, selected);
      const poeStatus = getPoeStatus(this._hass, selected);
      const hasPoe = !!(selected.poe_switch_entity || selected.poe_power_entity || selected.power_cycle_entity);
      const poeOn = poeStatus.active;
      const poePower = selected.poe_power_entity ? formatState(this._hass, selected.poe_power_entity) : "—";
      const rxVal = selected.rx_entity ? formatState(this._hass, selected.rx_entity) : null;
      const txVal = selected.tx_entity ? formatState(this._hass, selected.tx_entity) : null;

      const portTitle = selected.port_label
        || (selected.kind === "special" ? selected.label : `${this._t("port_label")} ${selected.label}`);

      detail = `
        <div class="detail-title">${this._escapeHtml(portTitle)}</div>
        <div class="detail-grid">
          <div class="detail-item">
            <div class="detail-label">${this._escapeHtml(this._t("link_status"))}</div>
            <div class="detail-value ${linkUp ? "online" : "offline"}">
              ${this._escapeHtml(this._translateState(linkText) || (linkUp ? this._t("connected") : this._t("no_link")))}
            </div>
          </div>
          <div class="detail-item">
            <div class="detail-label">${this._escapeHtml(this._t("speed"))}</div>
            <div class="detail-value">${this._escapeHtml(speedText || "—")}</div>
          </div>
          ${hasPoe ? `
          <div class="detail-item">
            <div class="detail-label">${this._escapeHtml(this._t("poe"))}</div>
            <div class="detail-value ${poeOn ? "online" : "offline"}">
              ${this._escapeHtml(poeOn ? this._t("state_on") : this._t("state_off"))}
            </div>
          </div>
          <div class="detail-item">
            <div class="detail-label">${this._escapeHtml(this._t("poe_power"))}</div>
            <div class="detail-value">${this._escapeHtml(poePower || "—")}</div>
          </div>` : ""}
          ${rxVal != null ? `
          <div class="detail-item">
            <div class="detail-label">RX</div>
            <div class="detail-value">${this._escapeHtml(rxVal)}</div>
          </div>` : ""}
          ${txVal != null ? `
          <div class="detail-item">
            <div class="detail-label">TX</div>
            <div class="detail-value">${this._escapeHtml(txVal)}</div>
          </div>` : ""}
        </div>
        <div class="actions">
          ${selected.port_switch_entity ? (() => {
            const enabled = isOn(this._hass, selected.port_switch_entity);
            return `<button class="action-btn secondary" data-action="toggle-port" data-entity="${this._escapeAttr(selected.port_switch_entity)}">
              ${this._escapeHtml(enabled ? this._t("port_disable") : this._t("port_enable"))}
            </button>`;
          })() : ""}
          ${selected.poe_switch_entity ? `<button class="action-btn primary${poeOn ? "" : " dimmed"}" data-action="toggle-poe" data-entity="${this._escapeAttr(selected.poe_switch_entity)}">
            ⚡ ${this._escapeHtml(this._t("poe"))}
          </button>` : ""}
          ${selected.power_cycle_entity ? `<button class="action-btn secondary" data-action="power-cycle" data-entity="${this._escapeAttr(selected.power_cycle_entity)}">
            ↺ ${this._escapeHtml(this._t("power_cycle"))}
          </button>` : ""}
        </div>`;
    }

    const headerTitle = this._title();
    const headerMetrics = this._headerMetrics();

    const escapedHeaderTitle = this._escapeHtml(headerTitle);
    const escapedSubtitle = this._escapeHtml(this._subtitle());
    this.shadowRoot.innerHTML = `${this._styles()}
      <ha-card style="--udc-card-bg: ${this._cardBgStyle()}; --udc-chrome-bg: ${this._cardChromeBgStyle()}; --udc-port-size: ${this._effectivePortSize()}px; --udc-ap-scale: ${this._apScale() / 100}">
        <div class="header">
          <div class="header-info">
            ${headerTitle ? `<div class="title">${escapedHeaderTitle}</div>` : ""}
            <div class="subtitle">${escapedSubtitle}</div>
            ${headerMetrics.length ? `<div class="meta-list">${headerMetrics.map((item) => `
              <div class="meta-row">
                <div class="meta-label">${this._escapeHtml(item.label)}:</div>
                <div class="meta-value">${this._escapeHtml(item.value)}</div>
              </div>`).join("")}</div>` : ""}
          </div>
          <div class="header-actions">
            ${ctx?.reboot_entity ? `<button class="chip compact" data-action="reboot-device">↻ ${this._escapeHtml(this._t("reboot"))}</button>` : ""}
            <div class="chip"><div class="dot"></div>${this._escapeHtml(`${connected}/${allSlots.length}`)}</div>
          </div>
        </div>

        <div class="frontpanel ${frontStyle} theme-${theme}${showPanel ? "" : " no-panel-bg"}${reverseFrontpanel ? " rotate180-enabled" : ""}">
          <div class="panel-label">${this._escapeHtml(this._t("front_panel"))}</div>
          ${panelContentHtml}
        </div>

        <div class="section">${detail}</div>
      </ha-card>`;

    this.shadowRoot.querySelectorAll(".port")
      .forEach((btn) => btn.addEventListener("click", () => this._selectKey(btn.dataset.key)));

    this.shadowRoot.querySelector("[data-action='toggle-port']")
      ?.addEventListener("click", (e) => this._toggleEntity(e.currentTarget.dataset.entity));

    this.shadowRoot.querySelector("[data-action='toggle-poe']")
      ?.addEventListener("click", (e) => this._toggleEntity(e.currentTarget.dataset.entity));

    this.shadowRoot.querySelector("[data-action='power-cycle']")
      ?.addEventListener("click", (e) => this._pressButton(e.currentTarget.dataset.entity));

    this.shadowRoot.querySelector("[data-action='reboot-device']")
      ?.addEventListener("click", () => this._pressButton(ctx?.reboot_entity));
  }

  _render() {
    const title = this._title();
    const escapedTitle = this._escapeHtml(title);
    const escapedSubtitle = this._escapeHtml(this._subtitle());

    if (!this._config?.device_id) {
      this.shadowRoot.innerHTML = `${this._styles()}
        <ha-card style="--udc-card-bg: ${this._cardBgStyle()}; --udc-port-size: ${this._effectivePortSize()}px; --udc-ap-scale: ${this._apScale() / 100}">
          <div class="header">
            <div class="header-info">
              ${title ? `<div class="title">${escapedTitle}</div>` : ""}
              <div class="subtitle">${escapedSubtitle}</div>
            </div>
          </div>
          <div class="empty-state">${this._escapeHtml(this._t("select_device"))}</div>
        </ha-card>`;
      this._finalizeRender();
      return;
    }

    if (this._loading) {
      this.shadowRoot.innerHTML = `${this._styles()}
        <ha-card style="--udc-card-bg: ${this._cardBgStyle()}; --udc-port-size: ${this._effectivePortSize()}px; --udc-ap-scale: ${this._apScale() / 100}">
          <div class="header">
            <div class="header-info">
              ${title ? `<div class="title">${escapedTitle}</div>` : ""}
              <div class="subtitle">${escapedSubtitle}</div>
            </div>
          </div>
          <div class="loading-state"><div class="spinner"></div>${this._escapeHtml(this._t("loading"))}</div>
        </ha-card>`;
      this._finalizeRender();
      return;
    }

    if (!this._ctx) {
      this.shadowRoot.innerHTML = `${this._styles()}
        <ha-card style="--udc-card-bg: ${this._cardBgStyle()}; --udc-port-size: ${this._effectivePortSize()}px; --udc-ap-scale: ${this._apScale() / 100}">
          <div class="header">
            <div class="header-info">
              ${title ? `<div class="title">${escapedTitle}</div>` : ""}
              <div class="subtitle">${escapedSubtitle}</div>
            </div>
          </div>
          <div class="empty-state">${this._escapeHtml(this._t("no_data"))}</div>
        </ha-card>`;
      this._finalizeRender();
      return;
    }

    this._renderPanelAndDetail();
    this._finalizeRender();
  }
}

customElements.define("unifi-device-card", UnifiDeviceCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "unifi-device-card",
  name: "UniFi Device Card",
  description: `Lovelace card for UniFi devices (v${VERSION}).`,
  preview: true,
  documentationURL: "https://github.com/bluenazgul/unifi-device-card",
});

if (!window[DEV_LOG_FLAG]) {
  window[DEV_LOG_FLAG] = true;
  console.log(
    `%cUNIFI-DEVICE-CARD%c v${VERSION}`,
    LOG_STYLES.badge,
    LOG_STYLES.version
  );
}
