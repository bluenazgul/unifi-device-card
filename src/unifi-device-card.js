import {
  applyGatewayPortOverrides,
  discoverSpecialPorts,
  formatState,
  getDeviceContext,
  getPoeStatus,
  getPortLinkText,
  getPortSpeedText,
  isOn,
  isPortConnected,
  mergePortsWithLayout,
  mergeSpecialsWithLayout,
  stateObj,
} from "./helpers.js";
import { t } from "./translations.js";
import "./unifi-device-card-editor.js";

const VERSION = __VERSION__;
const DEV_LOG_FLAG = "__UNIFI_DEVICE_CARD_VERSION_LOGGED__";

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
    this._hass = hass;
    this._ensureLoaded();
    this._render();
  }

  getCardSize() {
    return this._cardSize || this._estimateCardSize();
  }

  _estimateCardSize() {
    if (!this._config?.device_id) return 4;
    if (!this._ctx) return 5;
    if (this._ctx?.type === "access_point") return 8;

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
    return Math.min(140, Math.max(60, raw));
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
    const portSize = this._portSize();
    const panelContentWidth = this._measuredFrontPanelContentWidth();
    const hostWidth = this._measuredCardWidth();
    if (!panelContentWidth && !hostWidth) return Infinity;

    const horizontalPadding = 40;
    const gap = 6;
    const available = panelContentWidth > 0
      ? panelContentWidth
      : Math.max(180, hostWidth - horizontalPadding);
    return Math.max(1, Math.floor((available + gap) / (portSize + gap)));
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
    const ringColor = ledEnabled ? (this._apLedColorValue() || "#0000ff") : "#868b93";
    return { ledEntity, ledEnabled, ringColor };
  }

  _buildSlotData(ctx) {
    const discovered = Array.isArray(ctx?.numberedPorts) ? ctx.numberedPorts : [];
    const numberedRaw = mergePortsWithLayout(ctx?.layout, discovered);

    const specialsRaw = mergeSpecialsWithLayout(
      ctx?.layout,
      ctx?.type === "gateway" ? discoverSpecialPorts(ctx?.entities || []) : [],
      discovered
    );

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

    const selectedPorts = hasEditMode
      ? (Array.isArray(this._config?.special_ports)
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

  async _ensureLoaded() {
    if (!this._hass || !this._config?.device_id) return;

    const currentId = this._config.device_id;
    if (this._loadedDeviceId === currentId && this._ctx) return;
    if (this._loading) return;

    this._loading = true;
    this._render();
    const token = ++this._loadToken;

    try {
      const ctx = await getDeviceContext(this._hass, currentId, this._config);
      if (token !== this._loadToken) return;

      this._ctx = ctx;
      this._loadedDeviceId = currentId;

      const { specials, numbered } = this._buildSlotData(ctx);
      const first = specials[0] || numbered[0] || null;
      this._selectedKey = first?.key || null;
    } catch (err) {
      console.error("[unifi-device-card] Failed to load device context", err);
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
    await this._hass.callService(domain, "toggle", { entity_id: entityId });
  }

  async _pressButton(entityId) {
    if (!entityId || !this._hass) return;
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
    ];

    return metrics
      .filter((item) => item.entity && formatState(this._hass, item.entity) !== "—")
      .map((item) => ({
        label: this._t(item.key),
        value: formatState(this._hass, item.entity),
      }));
  }

  _connectedCount(allSlots) {
    return allSlots.filter((s) => isPortConnected(this._hass, s)).length;
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
    const text = String(getPortSpeedText(this._hass, port) || "");
    const m = text.match(/([0-9]+(?:[.,][0-9]+)?)/);
    if (!m) return null;
    const n = parseFloat(m[1].replace(",", "."));
    return Number.isFinite(n) ? n : null;
  }

  _linkLedClass(port) {
    const connected = isPortConnected(this._hass, port);
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

  _isSfpLike(slot) {
    const label = String(slot?.label || "").toLowerCase();
    const key = String(slot?.key || "").toLowerCase();
    return (
      slot?.kind === "special" &&
      (label.includes("sfp") || key.includes("sfp") || key.includes("uplink"))
    );
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

  _renderPortButton(slot, selectedKey) {
    const isSpecial = slot.kind === "special";
    const isSfp = this._isSfpLike(slot);
    const isWan = this._isWanLike(slot);
    const linkUp = isPortConnected(this._hass, slot);
    const poeStatus = getPoeStatus(this._hass, slot);
    const poeOn = poeStatus.active;

    const tooltip = [
      slot.port_label || (isSpecial ? slot.label : `${this._t("port_label")} ${slot.label}`),
      this._translateState(getPortLinkText(this._hass, slot)),
      linkUp ? getPortSpeedText(this._hass, slot) : null,
      poeOn ? `${this._t("poe")}${poeStatus.power ? ` ${poeStatus.power}` : " ON"}` : null,
    ].filter((v) => v && v !== "—").join(" · ");

    const classes = [
      "port",
      isSpecial ? "special" : "",
      isSfp ? "is-sfp" : "is-rj45",
      isWan ? "is-wan" : "",
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

    return `<button class="${classes}" data-key="${slot.key}" title="${tooltip}">
      <div class="port-housing">
        ${housing}
      </div>
      <div class="port-num">${slot.label}</div>
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
        display: grid;
        row-gap: 4px;
        column-gap: 6px;
      }

      .frontpanel.single-row .port-row,
      .frontpanel.gateway-single-row .port-row {
        grid-template-columns: repeat(8, var(--udc-port-size));
      }

      .frontpanel.dual-row .port-row {
        grid-template-columns: repeat(8, var(--udc-port-size));
      }

      .frontpanel.gateway-rack .port-row {
        grid-template-columns: repeat(8, var(--udc-port-size));
      }

      .frontpanel.gateway-compact .port-row {
        grid-template-columns: repeat(5, var(--udc-port-size));
      }

      .frontpanel.six-grid .port-row {
        grid-template-columns: repeat(6, var(--udc-port-size));
      }

      .frontpanel.eight-grid .port-row {
        grid-template-columns: repeat(8, var(--udc-port-size));
      }

      .frontpanel.quad-row .port-row {
        grid-template-columns: repeat(12, var(--udc-port-size));
      }

      .frontpanel.ultra-row .port-row {
        grid-template-columns: repeat(7, var(--udc-port-size));
      }

      .frontpanel.grid-4 .port-row {
        grid-template-columns: repeat(4, var(--udc-port-size));
      }

      .frontpanel.grid-5 .port-row {
        grid-template-columns: repeat(5, var(--udc-port-size));
      }

      .frontpanel.grid-9 .port-row {
        grid-template-columns: repeat(9, var(--udc-port-size));
      }

      .frontpanel.grid-10 .port-row {
        grid-template-columns: repeat(10, var(--udc-port-size));
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

      .ap-device {
        width: calc(225px * var(--udc-ap-scale));
        height: calc(225px * var(--udc-ap-scale));
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
        width: calc(92px * var(--udc-ap-scale));
        height: calc(92px * var(--udc-ap-scale));
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
        padding: 0 0 1px;
        border-radius: 2px;
        transition: outline .1s ease;
        position: relative;
        min-width: 0;
        border: none;
        background: transparent;
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
        height: 5px;
        border-radius: 0;
        background: #868b93;
        box-shadow: inset 0 -1px 0 rgba(0,0,0,.2);
        z-index: 5;
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
        background: #efb21a;
        box-shadow:
          0 0 4px rgba(239,178,26,.75),
          inset 0 -1px 0 rgba(0,0,0,.18);
      }

      .rj45-led.green {
        background: #33d35d;
        box-shadow:
          0 0 4px rgba(51,211,93,.75),
          inset 0 -1px 0 rgba(0,0,0,.18);
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
        height: 5px;
        border-radius: 0;
        background: #8a8e95;
        box-shadow: inset 0 -1px 0 rgba(0,0,0,.25);
      }

      .sfp-top-led.orange {
        background: #efb21a;
        box-shadow:
          0 0 4px rgba(239,178,26,.75),
          inset 0 -1px 0 rgba(0,0,0,.18);
      }

      .sfp-top-led.green {
        background: #33d35d;
        box-shadow:
          0 0 4px rgba(51,211,93,.75),
          inset 0 -1px 0 rgba(0,0,0,.18);
      }

      .sfp-top-led.off {
        background: #868b93;
        box-shadow: inset 0 -1px 0 rgba(0,0,0,.2);
      }

      .port-sfp {
        position: relative;
        width: calc(var(--udc-port-size) - 2px);
        height: var(--udc-port-size);
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
        min-width: var(--udc-port-size);
        max-width: var(--udc-port-size);
      }

      .port-num {
        font-size: 7px;
        font-weight: 800;
        line-height: 1;
        margin-top: 1px;
        letter-spacing: 0;
        user-select: none;
        color: #646a76;
      }

      .port.up .port-num {
        color: #414957;
      }

      .port.is-sfp .port-num {
        font-size: 6px;
      }

      .section {
        padding: 12px 14px 14px;
        background: var(--udc-chrome-bg, transparent);
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
      const apStatusRaw = this._apStatusRaw(this._ctx?.ap_status_entity);
      const apStatus = this._apStatusState(this._ctx?.ap_status_entity);
      const apStatusClass = apStatusRaw === "connected" ? "online" : (apStatusRaw === "disconnected" ? "offline" : "pending");
      const uptime = this._apUptimeState(this._ctx?.uptime_entity);
      const clients = this._wholeNumberState(this._ctx?.clients_entity);
      const { ledEntity, ledEnabled, ringColor } = this._apLedState();

      const headerTitle = this._title();
      const headerMetrics = this._headerMetrics();

      this.shadowRoot.innerHTML = `${this._styles()}
        <ha-card class="ap-card" style="--udc-card-bg: ${this._cardBgStyle()}; --udc-chrome-bg: ${this._cardChromeBgStyle()}; --ap-ring-color: ${ringColor}; --udc-port-size: ${this._effectivePortSize()}px; --udc-ap-scale: ${this._apScale() / 100}">
          <div class="header">
            <div class="header-info">
              ${headerTitle ? `<div class="title">${headerTitle}</div>` : ""}
              <div class="subtitle">${this._subtitle()}</div>
              ${headerMetrics.length ? `<div class="meta-list">${headerMetrics.map((item) => `
                <div class="meta-row">
                  <div class="meta-label">${item.label}:</div>
                  <div class="meta-value">${item.value}</div>
                </div>`).join("")}</div>` : ""}
            </div>
            <div class="header-actions">
              ${this._ctx?.reboot_entity ? `<button class="chip" data-action="reboot-device">↻ ${this._t("reboot")}</button>` : ""}
              ${ledEntity ? `<button class="chip" data-action="toggle-led" style="--led-indicator: ${ledEnabled ? ringColor : "#868b93"}"><span class="led-indicator"></span>LED</button>` : ""}
            </div>
          </div>

          <div class="frontpanel ap-disc">
            <div class="ap-device">
              <div class="ap-ring ${ledEnabled ? "online" : "off"}">
                <div class="ap-logo">u</div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="detail-title">${this._t("ap_status")}</div>
            <div class="detail-grid">
              <div class="detail-item">
                <div class="detail-label">${this._t("ap_status")}</div>
                <div class="detail-value ${apStatusClass}">${apStatus || (online ? this._t("state_connected") : this._t("state_disconnected"))}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">${this._t("uptime")}</div>
                <div class="detail-value">${uptime}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">${this._t("clients")}</div>
                <div class="detail-value">${clients}</div>
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
    const theme = ctx?.layout?.theme || "dark";
    const showPanel = this._config?.show_panel !== false;

    const specialPortsInUse = new Set(
      allSpecials
        .map((slot) => slot?.port)
        .filter((port) => Number.isInteger(port))
    );

    const visibleNumbered = normalizedNumbered.filter((slot) => !specialPortsInUse.has(slot.port));
    const effectiveRows = this._buildEffectiveRows(ctx, visibleNumbered);

    const specialRow = allSpecials.length
      ? `<div class="special-row">${allSpecials.map((s) => this._renderPortButton(s, selected?.key)).join("")}</div>`
      : "";

    const layoutRows = effectiveRows
      .map((rowPorts) => {
        const items = rowPorts
          .map((portNumber) => visibleNumbered.find((p) => p.port === portNumber))
          .filter(Boolean)
          .map((slot) => this._renderPortButton(slot, selected?.key))
          .join("");

        const cols = Math.max(1, rowPorts.length);
        return items
          ? `<div class="port-row" style="grid-template-columns: repeat(${cols}, var(--udc-port-size));">${items}</div>`
          : "";
      })
      .filter(Boolean);

    let detail = `<div class="muted">${this._t("no_ports")}</div>`;

    if (selected) {
      const linkUp = isPortConnected(this._hass, selected);
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
        <div class="detail-title">${portTitle}</div>
        <div class="detail-grid">
          <div class="detail-item">
            <div class="detail-label">${this._t("link_status")}</div>
            <div class="detail-value ${linkUp ? "online" : "offline"}">
              ${this._translateState(linkText) || (linkUp ? this._t("connected") : this._t("no_link"))}
            </div>
          </div>
          <div class="detail-item">
            <div class="detail-label">${this._t("speed")}</div>
            <div class="detail-value">${speedText || "—"}</div>
          </div>
          ${hasPoe ? `
          <div class="detail-item">
            <div class="detail-label">${this._t("poe")}</div>
            <div class="detail-value ${poeOn ? "online" : "offline"}">
              ${poeOn ? this._t("state_on") : this._t("state_off")}
            </div>
          </div>
          <div class="detail-item">
            <div class="detail-label">${this._t("poe_power")}</div>
            <div class="detail-value">${poePower || "—"}</div>
          </div>` : ""}
          ${rxVal != null ? `
          <div class="detail-item">
            <div class="detail-label">RX</div>
            <div class="detail-value">${rxVal}</div>
          </div>` : ""}
          ${txVal != null ? `
          <div class="detail-item">
            <div class="detail-label">TX</div>
            <div class="detail-value">${txVal}</div>
          </div>` : ""}
        </div>
        <div class="actions">
          ${selected.port_switch_entity ? (() => {
            const enabled = isOn(this._hass, selected.port_switch_entity);
            return `<button class="action-btn secondary" data-action="toggle-port" data-entity="${selected.port_switch_entity}">
              ${enabled ? this._t("port_disable") : this._t("port_enable")}
            </button>`;
          })() : ""}
          ${selected.poe_switch_entity ? `<button class="action-btn primary" data-action="toggle-poe" data-entity="${selected.poe_switch_entity}">
            ⚡ ${poeOn ? this._t("poe_off") : this._t("poe_on")}
          </button>` : ""}
          ${selected.power_cycle_entity ? `<button class="action-btn secondary" data-action="power-cycle" data-entity="${selected.power_cycle_entity}">
            ↺ ${this._t("power_cycle")}
          </button>` : ""}
        </div>`;
    }

    const headerTitle = this._title();
    const headerMetrics = this._headerMetrics();

    this.shadowRoot.innerHTML = `${this._styles()}
      <ha-card style="--udc-card-bg: ${this._cardBgStyle()}; --udc-chrome-bg: ${this._cardChromeBgStyle()}; --udc-port-size: ${this._effectivePortSize()}px; --udc-ap-scale: ${this._apScale() / 100}">
        <div class="header">
          <div class="header-info">
            ${headerTitle ? `<div class="title">${headerTitle}</div>` : ""}
            <div class="subtitle">${this._subtitle()}</div>
            ${headerMetrics.length ? `<div class="meta-list">${headerMetrics.map((item) => `
              <div class="meta-row">
                <div class="meta-label">${item.label}:</div>
                <div class="meta-value">${item.value}</div>
              </div>`).join("")}</div>` : ""}
          </div>
          <div class="header-actions">
            ${ctx?.reboot_entity ? `<button class="chip" data-action="reboot-device">↻ ${this._t("reboot")}</button>` : ""}
            <div class="chip"><div class="dot"></div>${connected}/${allSlots.length}</div>
          </div>
        </div>

        <div class="frontpanel ${ctx?.layout?.frontStyle || "single-row"} theme-${theme}${showPanel ? "" : " no-panel-bg"}">
          <div class="panel-label">${this._t("front_panel")}</div>
          ${specialRow}
          ${layoutRows.join("") || `<div class="muted" style="padding:8px 0">${this._t("no_ports")}</div>`}
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

    if (!this._config?.device_id) {
      this.shadowRoot.innerHTML = `${this._styles()}
        <ha-card style="--udc-card-bg: ${this._cardBgStyle()}; --udc-port-size: ${this._effectivePortSize()}px; --udc-ap-scale: ${this._apScale() / 100}">
          <div class="header">
            <div class="header-info">
              ${title ? `<div class="title">${title}</div>` : ""}
              <div class="subtitle">${this._subtitle()}</div>
            </div>
          </div>
          <div class="empty-state">${this._t("select_device")}</div>
        </ha-card>`;
      this._finalizeRender();
      return;
    }

    if (this._loading) {
      this.shadowRoot.innerHTML = `${this._styles()}
        <ha-card style="--udc-card-bg: ${this._cardBgStyle()}; --udc-port-size: ${this._effectivePortSize()}px; --udc-ap-scale: ${this._apScale() / 100}">
          <div class="header">
            <div class="header-info">
              ${title ? `<div class="title">${title}</div>` : ""}
              <div class="subtitle">${this._subtitle()}</div>
            </div>
          </div>
          <div class="loading-state"><div class="spinner"></div>${this._t("loading")}</div>
        </ha-card>`;
      this._finalizeRender();
      return;
    }

    if (!this._ctx) {
      this.shadowRoot.innerHTML = `${this._styles()}
        <ha-card style="--udc-card-bg: ${this._cardBgStyle()}; --udc-port-size: ${this._effectivePortSize()}px; --udc-ap-scale: ${this._apScale() / 100}">
          <div class="header">
            <div class="header-info">
              ${title ? `<div class="title">${title}</div>` : ""}
              <div class="subtitle">${this._subtitle()}</div>
            </div>
          </div>
          <div class="empty-state">${this._t("no_data")}</div>
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
  console.info(`[UNIFI-DEVICE-CARD] Version ${VERSION}`);
}
