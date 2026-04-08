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
} from "./helpers.js";
import { t } from "./translations.js";
import "./unifi-device-card-editor.js";

const VERSION = __VERSION__;

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
    return 8;
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
    return this._config?.background_color || "";
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

  _buildEffectiveRows(ctx, numbered) {
    const baseRows = (ctx?.layout?.rows || []).map((row) => [...row]);
    const knownPorts = new Set(baseRows.flat());

    const extraPorts = numbered
      .map((slot) => slot?.port)
      .filter((port) => Number.isInteger(port) && !knownPorts.has(port))
      .sort((a, b) => a - b);

    if (!extraPorts.length) return baseRows;
    if (!baseRows.length) return [extraPorts];

    const rows = baseRows.map((row) => [...row]);
    rows[rows.length - 1].push(...extraPorts);
    return rows;
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
      const ctx = await getDeviceContext(this._hass, currentId);
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

  _subtitle() {
    if (!this._config?.device_id || !this._ctx) return `Version ${VERSION}`;
    const fw = this._ctx?.firmware;
    const model = this._ctx?.layout?.displayModel || this._ctx?.model || "";
    return fw ? `${model} · FW ${fw}` : model;
  }

  _connectedCount(allSlots) {
    return allSlots.filter((s) => isPortConnected(this._hass, s)).length;
  }

  _styles() {
    return `<style>
      :host {
        --udc-bg:      #141820;
        --udc-surface: #1e2433;
        --udc-surf2:   #252d3d;
        --udc-border:  rgba(255,255,255,0.07);
        --udc-accent:  #0090d9;
        --udc-aglow:   rgba(0,144,217,0.2);
        --udc-green:   #22c55e;
        --udc-orange:  #f59e0b;
        --udc-red:     #ef4444;
        --udc-text:    #e2e8f0;
        --udc-muted:   #4e5d73;
        --udc-dim:     #8896a8;
        --udc-r:       14px;
        --udc-rsm:     8px;
      }

      ha-card {
        background: var(--udc-card-bg, var(--card-background-color)) !important;
        color: var(--primary-text-color, var(--udc-text)) !important;
        border: var(--ha-card-border-width, 1px) solid var(--ha-card-border-color, var(--udc-border)) !important;
        border-radius: var(--ha-card-border-radius, var(--udc-r)) !important;
        box-shadow: var(--ha-card-box-shadow, none);
        overflow: hidden;
        font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
      }

      .header {
        padding: 16px 18px 13px;
        background: linear-gradient(160deg, var(--udc-surface) 0%, var(--udc-bg) 100%);
        border-bottom: 1px solid var(--udc-border);
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 10px;
      }

      .header-info {
        display: grid;
        gap: 2px;
        min-width: 0;
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

      .chip {
        display: flex;
        align-items: center;
        gap: 5px;
        background: var(--udc-surf2);
        border: 1px solid var(--udc-border);
        border-radius: 20px;
        padding: 3px 10px;
        font-size: 0.71rem;
        font-weight: 700;
        white-space: nowrap;
        color: var(--udc-dim);
        flex-shrink: 0;
      }

      .chip .dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: var(--udc-green);
        box-shadow: 0 0 5px var(--udc-green);
        animation: blink 2.5s ease-in-out infinite;
      }

      @keyframes blink {
        0%, 100% { opacity: 1; }
        50% { opacity: .4; }
      }

      .frontpanel {
        padding: 12px 14px 10px;
        display: grid;
        gap: 5px;
        border-bottom: 1px solid var(--udc-border);
      }

      .frontpanel.theme-white  { background: #d8dde6; }
      .frontpanel.theme-silver { background: #2a2e35; }
      .frontpanel.theme-dark   { background: var(--udc-surface); }

      .panel-label {
        font-size: 0.63rem;
        font-weight: 700;
        letter-spacing: .1em;
        text-transform: uppercase;
        margin-bottom: 2px;
      }

      .theme-white .panel-label { color: #8a96a8; }
      .theme-silver .panel-label { color: #5a6070; }
      .theme-dark .panel-label { color: var(--udc-muted); }

      .special-row {
        display: flex;
        gap: 5px;
        flex-wrap: wrap;
        margin-bottom: 4px;
      }

      .port-row {
        display: grid;
        gap: 5px;
      }

      .frontpanel.single-row .port-row,
      .frontpanel.gateway-single-row .port-row {
        grid-template-columns: repeat(8, minmax(0,1fr));
      }

      .frontpanel.dual-row .port-row {
        grid-template-columns: repeat(8, minmax(0,1fr));
      }

      .frontpanel.gateway-rack .port-row {
        grid-template-columns: repeat(8, minmax(0,1fr));
      }

      .frontpanel.gateway-compact .port-row {
        grid-template-columns: repeat(5, minmax(0,1fr));
      }

      .frontpanel.six-grid .port-row {
        grid-template-columns: repeat(6, minmax(0,1fr));
      }

      .frontpanel.quad-row .port-row {
        grid-template-columns: repeat(12, minmax(0,1fr));
      }

      .frontpanel.ultra-row .port-row {
        grid-template-columns: repeat(7, minmax(0,1fr));
      }

      .port {
        cursor: pointer;
        font: inherit;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 4px 2px 3px;
        border-radius: 4px;
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
        border-radius: 5px;
      }

      .port:hover {
        outline: 1px solid rgba(0,144,217,.5);
        outline-offset: 1px;
        border-radius: 5px;
      }

      .port-leds {
        display: flex;
        justify-content: center;
        width: 100%;
        padding: 0 1px;
        margin-bottom: 2px;
      }

      .port-led {
        width: 4px;
        height: 4px;
        border-radius: 50%;
        transition: background .2s;
        flex-shrink: 0;
      }

      .port-socket {
        width: 100%;
        height: 13px;
        border-radius: 2px 2px 0 0;
        position: relative;
        flex-shrink: 0;
      }

      .port-socket::after {
        content: "";
        position: absolute;
        bottom: 0;
        left: 12%;
        right: 12%;
        height: 4px;
        border-radius: 1px 1px 0 0;
      }

      .port-num {
        font-size: 8px;
        font-weight: 800;
        line-height: 1;
        margin-top: 2px;
        letter-spacing: 0;
        user-select: none;
      }

      .theme-white .port-socket         { background: #b0b8c4; }
      .theme-white .port-socket::after  { background: #8a8060; }
      .theme-white .port-num            { color: #8a96a8; }
      .theme-white .port.up .port-socket { background: #9aa8b8; }
      .theme-white .port.up .port-num   { color: #4a5568; }
      .theme-white .port-led            { background: #c8d0d8; }

      .theme-silver .port-socket        { background: #3a4050; }
      .theme-silver .port-socket::after { background: #5a6070; }
      .theme-silver .port-num           { color: #5a6070; }
      .theme-silver .port.up .port-socket { background: #2a3040; }
      .theme-silver .port.up .port-num  { color: #8a96a8; }
      .theme-silver .port-led           { background: #3a4050; }

      .theme-dark .port-socket          { background: var(--udc-surf2); }
      .theme-dark .port-socket::after   { background: var(--udc-muted); }
      .theme-dark .port-num             { color: var(--udc-muted); }
      .theme-dark .port.up .port-socket { background: #1a2030; }
      .theme-dark .port.up .port-num    { color: var(--udc-dim); }
      .theme-dark .port-led             { background: var(--udc-surf2); }

      .port.up   .port-led-link { background: var(--udc-green); box-shadow: 0 0 4px var(--udc-green); }
      .port.down .port-led-link { background: var(--udc-muted); }
      .port.poe-on .port-led-link { background: var(--udc-orange); box-shadow: 0 0 4px var(--udc-orange); }

      .port.speed-25g  .port-socket::after { background: #a855f7; }
      .port.speed-10g  .port-socket::after { background: var(--udc-accent); }
      .port.speed-1g   .port-socket::after { background: var(--udc-green); }
      .port.speed-100m .port-socket::after { background: var(--udc-orange); }
      .port.speed-10m  .port-socket::after { background: var(--udc-muted); }

      .port.special {
        min-width: 38px;
        max-width: 56px;
      }

      .port.special .port-socket {
        height: 16px;
        border-radius: 3px 3px 0 0;
      }

      .port.special .port-num {
        font-size: 7px;
      }

      .section {
        padding: 12px 14px 14px;
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

      .detail-value.online  { color: var(--udc-green); }
      .detail-value.offline { color: var(--udc-muted); }

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
        background: var(--udc-accent);
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

      .empty-state, .loading-state {
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
        border-top-color: var(--udc-accent);
        border-radius: 50%;
        animation: spin .7s linear infinite;
        flex-shrink: 0;
      }

      @keyframes spin { to { transform: rotate(360deg); } }
    </style>`;
  }

  _speedClass(hass, port) {
    const speedText = getPortSpeedText(hass, port);
    const match = String(speedText || "").match(/(\d+)/);
    if (!match) return "";

    const mbps = parseInt(match[1], 10);
    if (mbps >= 25000) return "speed-25g";
    if (mbps >= 10000) return "speed-10g";
    if (mbps >= 1000) return "speed-1g";
    if (mbps >= 100) return "speed-100m";
    if (mbps >= 10) return "speed-10m";
    return "";
  }

  _renderPortButton(slot, selectedKey) {
    const isSpecial = slot.kind === "special";
    const linkUp = isPortConnected(this._hass, slot);
    const poeStatus = getPoeStatus(this._hass, slot);
    const poeOn = poeStatus.active;
    const speedClass = this._speedClass(this._hass, slot);

    const tooltip = [
      slot.port_label || (isSpecial ? slot.label : `${this._t("port_label")} ${slot.label}`),
      this._translateState(getPortLinkText(this._hass, slot)),
      linkUp ? getPortSpeedText(this._hass, slot) : null,
      poeOn ? `${this._t("poe")}${poeStatus.power ? ` ${poeStatus.power}` : " ON"}` : null,
    ].filter((v) => v && v !== "—").join(" · ");

    const classes = [
      "port",
      isSpecial ? "special" : "",
      linkUp ? "up" : "down",
      selectedKey === slot.key ? "selected" : "",
      speedClass,
      poeOn ? "poe-on" : "",
    ].filter(Boolean).join(" ");

    return `<button class="${classes}" data-key="${slot.key}" title="${tooltip}">
      <div class="port-leds">
        <div class="port-led port-led-link"></div>
      </div>
      <div class="port-socket"></div>
      <div class="port-num">${slot.label}</div>
    </button>`;
  }

  _renderPanelAndDetail(title) {
    const ctx = this._ctx;
    const { specials, numbered } = this._buildSlotData(ctx);

    const allSlots = [...specials, ...numbered];
    const selected = allSlots.find((p) => p.key === this._selectedKey) || allSlots[0] || null;
    const connected = this._connectedCount(allSlots);
    const theme = ctx?.layout?.theme || "dark";

    const specialPortsInUse = new Set(
      specials
        .map((slot) => slot?.port)
        .filter((port) => Number.isInteger(port))
    );

    const visibleNumbered = numbered.filter(
      (slot) => !specialPortsInUse.has(slot.port)
    );

    const effectiveRows = this._buildEffectiveRows(ctx, visibleNumbered);

    const specialRow = specials.length
      ? `<div class="special-row">${specials.map((s) => this._renderPortButton(s, selected?.key)).join("")}</div>`
      : "";

    const layoutRows = effectiveRows.map((rowPorts) => {
      const items = rowPorts
        .map((portNumber) => visibleNumbered.find((p) => p.port === portNumber))
        .filter(Boolean)
        .map((slot) => this._renderPortButton(slot, selected?.key))
        .join("");

      return items ? `<div class="port-row">${items}</div>` : "";
    }).filter(Boolean);

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

    this.shadowRoot.innerHTML = `${this._styles()}
      <ha-card ${this._cardBgStyle() ? `style="--udc-card-bg: ${this._cardBgStyle()}"` : ""}>
        <div class="header">
          <div class="header-info">
            <div class="title">${title}</div>
            <div class="subtitle">${this._subtitle()}</div>
          </div>
          <div class="chip"><div class="dot"></div>${connected}/${allSlots.length}</div>
        </div>

        <div class="frontpanel ${ctx?.layout?.frontStyle || "single-row"} theme-${theme}">
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
  }

  _render() {
    const title = this._config?.name || "UniFi Device Card";

    if (!this._config?.device_id) {
      this.shadowRoot.innerHTML = `${this._styles()}
        <ha-card ${this._cardBgStyle() ? `style="--udc-card-bg: ${this._cardBgStyle()}"` : ""}>
          <div class="header">
            <div class="header-info">
              <div class="title">${title}</div>
              <div class="subtitle">${this._subtitle()}</div>
            </div>
          </div>
          <div class="empty-state">${this._t("select_device")}</div>
        </ha-card>`;
      return;
    }

    if (this._loading) {
      this.shadowRoot.innerHTML = `${this._styles()}
        <ha-card ${this._cardBgStyle() ? `style="--udc-card-bg: ${this._cardBgStyle()}"` : ""}>
          <div class="header">
            <div class="header-info">
              <div class="title">${title}</div>
              <div class="subtitle">${this._subtitle()}</div>
            </div>
          </div>
          <div class="loading-state"><div class="spinner"></div>${this._t("loading")}</div>
        </ha-card>`;
      return;
    }

    if (!this._ctx) {
      this.shadowRoot.innerHTML = `${this._styles()}
        <ha-card ${this._cardBgStyle() ? `style="--udc-card-bg: ${this._cardBgStyle()}"` : ""}>
          <div class="header">
            <div class="header-info">
              <div class="title">${title}</div>
              <div class="subtitle">${this._subtitle()}</div>
            </div>
          </div>
          <div class="empty-state">${this._t("no_data")}</div>
        </ha-card>`;
      return;
    }

    this._renderPanelAndDetail(title);
  }
}

customElements.define("unifi-device-card", UnifiDeviceCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "unifi-device-card",
  name: "UniFi Device Card",
  description: "Lovelace card for UniFi switches and gateways.",
});
