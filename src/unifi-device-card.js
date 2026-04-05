import {
  discoverPorts,
  discoverSpecialPorts,
  formatState,
  getDeviceContext,
  getPortLinkText,
  getPortSpeedText,
  isOn,
  mergePortsWithLayout,
  mergeSpecialsWithLayout,
  stateValue,
} from "./helpers.js";
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
    this._deviceContext = null;
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
      this._deviceContext = null;
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

  async _ensureLoaded() {
    if (!this._hass || !this._config?.device_id) return;

    const currentId = this._config.device_id;
    if (this._loadedDeviceId === currentId && this._deviceContext) return;
    if (this._loading) return;

    this._loading = true;
    this._render();

    const token = ++this._loadToken;

    try {
      const ctx = await getDeviceContext(this._hass, currentId);
      if (token !== this._loadToken) return;

      this._deviceContext = ctx;
      this._loadedDeviceId = currentId;

      const numberedPorts = mergePortsWithLayout(
        ctx?.layout,
        discoverPorts(ctx?.entities || [])
      );
      const specialPorts = mergeSpecialsWithLayout(
        ctx?.layout,
        discoverSpecialPorts(ctx?.entities || [])
      );

      const first = specialPorts[0] || numberedPorts[0] || null;
      this._selectedKey = first?.key || null;
    } catch (err) {
      console.error("[unifi-device-card] Failed to load device context", err);
      if (token !== this._loadToken) return;
      this._deviceContext = null;
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
    if (!this._config?.device_id || !this._deviceContext) {
      return `Version ${VERSION}`;
    }

    const firmware = this._deviceContext?.firmware;
    if (firmware) {
      return `${this._deviceContext?.layout?.displayModel || this._deviceContext?.model || ""} · Firmware ${firmware}`;
    }

    return `${this._deviceContext?.layout?.displayModel || this._deviceContext?.model || ""}`;
  }

  _styles() {
    return `
      <style>
        .content {
          padding: 16px;
        }

        .muted {
          color: var(--secondary-text-color);
        }

        .header {
          padding: 16px 16px 8px 16px;
          display: grid;
          gap: 4px;
        }

        .title {
          font-size: 1.55rem;
          font-weight: 600;
          line-height: 1.2;
        }

        .subtitle {
          color: var(--secondary-text-color);
          font-size: 0.92rem;
        }

        .frontpanel {
          padding: 8px 16px 8px 16px;
          display: grid;
          gap: 4px;
        }

        .special-row,
        .port-row {
          display: grid;
          gap: 4px;
        }

        .frontpanel.single-row .port-row,
        .frontpanel.gateway-single-row .port-row {
          grid-template-columns: repeat(8, minmax(0, 1fr));
        }

        .frontpanel.dual-row .port-row {
          grid-template-columns: repeat(8, minmax(0, 1fr));
        }

        .frontpanel.gateway-rack .port-row {
          grid-template-columns: repeat(8, minmax(0, 1fr));
        }

        .frontpanel.gateway-compact .port-row {
          grid-template-columns: repeat(5, minmax(0, 1fr));
        }

        .frontpanel.quad-row .port-row {
          grid-template-columns: repeat(12, minmax(0, 1fr));
        }

        .special-row {
          grid-template-columns: repeat(auto-fit, minmax(70px, 1fr));
          margin-bottom: 2px;
        }

        .port {
          border: none;
          border-radius: 8px;
          min-height: 40px;
          cursor: pointer;
          color: white;
          font: inherit;
          display: grid;
          place-items: center;
          gap: 0;
          padding: 4px 2px;
          background: #555;
        }

        .port.up {
          background: #2e7d32;
        }

        .port.down {
          background: #555;
        }

        .port.selected {
          outline: 2px solid var(--primary-color);
          outline-offset: 1px;
        }

        .port.has-poe {
          box-shadow: inset 0 0 0 1px rgba(255, 193, 7, 0.75);
        }

        .port.special {
          min-height: 44px;
          border-radius: 10px;
        }

        .port-num {
          font-size: 11px;
          font-weight: 700;
          line-height: 1;
        }

        .port-icon {
          font-size: 11px;
          line-height: 1;
          margin-top: 1px;
        }

        .section {
          padding: 16px;
          padding-top: 8px;
          display: grid;
          gap: 12px;
        }

        .port-detail {
          border-top: 1px solid var(--divider-color);
          padding-top: 12px;
          display: grid;
          gap: 10px;
        }

        .detail-title {
          font-size: 16px;
          font-weight: 700;
        }

        .detail-grid {
          display: grid;
          gap: 8px;
        }

        .row {
          display: grid;
          grid-template-columns: 140px 1fr;
          gap: 8px;
          align-items: center;
        }

        .row .label {
          color: var(--secondary-text-color);
        }

        .actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 4px;
        }

        .action-btn {
          border: none;
          border-radius: 10px;
          padding: 10px 12px;
          cursor: pointer;
          font: inherit;
          background: var(--primary-color);
          color: var(--text-primary-color, white);
        }

        .action-btn.secondary {
          background: var(--secondary-background-color, #666);
          color: var(--primary-text-color);
        }

        .layout-note {
          color: var(--secondary-text-color);
          font-size: 0.85rem;
        }
      </style>
    `;
  }

  _renderEmpty(title) {
    this.shadowRoot.innerHTML = `
      <ha-card>
        <div class="header">
          <div class="title">${title}</div>
          <div class="subtitle">${this._subtitle()}</div>
        </div>
        <div class="content muted">Bitte im Karteneditor ein UniFi-Gerät auswählen.</div>
      </ha-card>
      ${this._styles()}
    `;
  }

  _renderPortButton(slot, selectedKey) {
    const linkUp = isOn(this._hass, slot.link_entity);
    const hasPoe = Boolean(slot.power_cycle_entity);
    const poeOn = hasPoe && slot.poe_switch_entity
      ? isOn(this._hass, slot.poe_switch_entity)
      : false;

    return `
      <button
        class="port ${slot.kind === "special" ? "special" : ""} ${linkUp ? "up" : "down"} ${selectedKey === slot.key ? "selected" : ""} ${hasPoe ? "has-poe" : ""}"
        data-key="${slot.key}"
        title="${slot.label}"
      >
        <div class="port-num">${slot.label}</div>
        <div class="port-icon">${poeOn ? "⚡" : "⇄"}</div>
      </button>
    `;
  }

  _renderPanelAndDetail(title) {
    const ctx = this._deviceContext;

    const numberedPorts = mergePortsWithLayout(
      ctx?.layout,
      discoverPorts(ctx?.entities || [])
    );
    const specialPorts = mergeSpecialsWithLayout(
      ctx?.layout,
      discoverSpecialPorts(ctx?.entities || [])
    );

    const allSlots = [...specialPorts, ...numberedPorts];
    const selected =
      allSlots.find((p) => p.key === this._selectedKey) || allSlots[0] || null;

    const specialRow = specialPorts.length
      ? `<div class="special-row">${specialPorts
          .map((slot) => this._renderPortButton(slot, selected?.key))
          .join("")}</div>`
      : "";

    const layoutRows = (ctx?.layout?.rows || []).map((rowPorts) => {
      const rowItems = rowPorts
        .map((portNumber) => {
          const slot =
            numberedPorts.find((p) => p.port === portNumber) || {
              key: `port-${portNumber}`,
              port: portNumber,
              label: String(portNumber),
              kind: "numbered",
              link_entity: null,
              speed_entity: null,
              poe_switch_entity: null,
              poe_power_entity: null,
              power_cycle_entity: null,
              raw_entities: [],
            };

          return this._renderPortButton(slot, selected?.key);
        })
        .join("");

      return `<div class="port-row">${rowItems}</div>`;
    });

    const detail = selected
      ? `
        <div class="port-detail">
          <div class="detail-title">${selected.kind === "special" ? selected.label : `Port ${selected.port}`}</div>

          <div class="detail-grid">
            <div class="row">
              <div class="label">Link</div>
              <div>${getPortLinkText(this._hass, selected)}</div>
            </div>
            <div class="row">
              <div class="label">Speed</div>
              <div>${getPortSpeedText(this._hass, selected)}</div>
            </div>
            <div class="row">
              <div class="label">PoE</div>
              <div>${selected.power_cycle_entity && selected.poe_switch_entity ? stateValue(this._hass, selected.poe_switch_entity, "—") : "Nicht verfügbar"}</div>
            </div>
            <div class="row">
              <div class="label">PoE Leistung</div>
              <div>${selected.power_cycle_entity ? formatState(this._hass, selected.poe_power_entity, "—") : "Nicht verfügbar"}</div>
            </div>
          </div>

          <div class="actions">
            ${
              selected.power_cycle_entity && selected.poe_switch_entity
                ? `<button class="action-btn" data-action="toggle-poe" data-entity="${selected.poe_switch_entity}">
                    PoE ${isOn(this._hass, selected.poe_switch_entity) ? "Ausschalten" : "Einschalten"}
                  </button>`
                : ""
            }
            ${
              selected.power_cycle_entity
                ? `<button class="action-btn secondary" data-action="power-cycle" data-entity="${selected.power_cycle_entity}">
                    Power Cycle
                  </button>`
                : ""
            }
          </div>
        </div>
      `
      : `<div class="muted">Keine Ports erkannt.</div>`;

    this.shadowRoot.innerHTML = `
      <ha-card>
        <div class="header">
          <div class="title">${title}</div>
          <div class="subtitle">${this._subtitle()}</div>
        </div>
        <div class="frontpanel ${ctx?.layout?.frontStyle || "single-row"}">
          ${specialRow}
          ${layoutRows.join("") || `<div class="content muted">Keine Ports erkannt.</div>`}
        </div>
        <div class="section">
          <div class="layout-note">Layout: ${ctx?.layout?.frontStyle || "generisch"}</div>
          ${detail}
        </div>
      </ha-card>
      ${this._styles()}
    `;

    this.shadowRoot.querySelectorAll(".port").forEach((btn) => {
      btn.addEventListener("click", () => {
        this._selectKey(btn.dataset.key);
      });
    });

    this.shadowRoot.querySelectorAll("[data-action='toggle-poe']").forEach((btn) => {
      btn.addEventListener("click", async () => {
        await this._toggleEntity(btn.dataset.entity);
      });
    });

    this.shadowRoot.querySelectorAll("[data-action='power-cycle']").forEach((btn) => {
      btn.addEventListener("click", async () => {
        await this._pressButton(btn.dataset.entity);
      });
    });
  }

  _render() {
    const title = this._config?.name || "UniFi Device Card";

    if (!this._config?.device_id) {
      this._renderEmpty(title);
      return;
    }

    if (this._loading) {
      this.shadowRoot.innerHTML = `
        <ha-card>
          <div class="header">
            <div class="title">${title}</div>
            <div class="subtitle">${this._subtitle()}</div>
          </div>
          <div class="content muted">Lade Gerätedaten…</div>
        </ha-card>
        ${this._styles()}
      `;
      return;
    }

    if (!this._deviceContext) {
      this.shadowRoot.innerHTML = `
        <ha-card>
          <div class="header">
            <div class="title">${title}</div>
            <div class="subtitle">${this._subtitle()}</div>
          </div>
          <div class="content muted">Keine Gerätedaten verfügbar.</div>
        </ha-card>
        ${this._styles()}
      `;
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
  description: "A Lovelace card for UniFi switches and gateways.",
});
