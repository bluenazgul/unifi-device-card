import {
  discoverPorts,
  formatState,
  getDeviceContext,
  isOn,
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
    this._selectedPort = null;
    this._loading = false;
    this._loadToken = 0;
  }

  setConfig(config) {
    this._config = config || {};
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._ensureLoaded();
    this._render();
  }

  getCardSize() {
    return 6;
  }

  async _ensureLoaded() {
    if (!this._hass || !this._config?.device_id) return;

    const currentId = this._config.device_id;
    if (this._deviceContext?.device?.id === currentId) return;

    this._loading = true;
    this._render();

    const token = ++this._loadToken;

    try {
      const ctx = await getDeviceContext(this._hass, currentId);
      if (token !== this._loadToken) return;

      this._deviceContext = ctx;
      if (ctx?.type === "switch") {
        const ports = discoverPorts(ctx.entities);
        if (ports.length && !this._selectedPort) {
          this._selectedPort = ports[0].port;
        }
      } else {
        this._selectedPort = null;
      }
    } catch (err) {
      console.error("[unifi-device-card] Failed to load device context", err);
      if (token !== this._loadToken) return;
      this._deviceContext = null;
    }

    this._loading = false;
    this._render();
  }

  _selectPort(port) {
    this._selectedPort = port;
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

  _renderEmpty(title) {
    this.shadowRoot.innerHTML = `
      <ha-card header="${title}">
        <div class="content muted">Bitte im Karteneditor ein UniFi-Gerät auswählen.</div>
      </ha-card>
      ${this._styles()}
    `;
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

        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(56px, 1fr));
          gap: 8px;
          padding: 16px;
          padding-bottom: 8px;
        }

        .port {
          border: none;
          border-radius: 12px;
          min-height: 64px;
          cursor: pointer;
          color: white;
          font: inherit;
          display: grid;
          place-items: center;
          gap: 2px;
          padding: 8px 4px;
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
          outline-offset: 2px;
        }

        .port-num {
          font-size: 14px;
          font-weight: 700;
          line-height: 1;
        }

        .port-icon {
          font-size: 16px;
          line-height: 1;
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

        .summary {
          display: grid;
          gap: 8px;
        }
      </style>
    `;
  }

  _renderGateway(title) {
    const ctx = this._deviceContext;
    this.shadowRoot.innerHTML = `
      <ha-card header="${title}">
        <div class="section">
          <div class="summary">
            <div><strong>Typ:</strong> Gateway</div>
            <div><strong>Modell:</strong> ${ctx?.model || "Unbekannt"}</div>
            <div><strong>Version:</strong> ${VERSION}</div>
          </div>
        </div>
      </ha-card>
      ${this._styles()}
    `;
  }

  _renderSwitch(title) {
    const ctx = this._deviceContext;
    const ports = discoverPorts(ctx?.entities || []);
    const selected =
      ports.find((p) => p.port === this._selectedPort) || ports[0] || null;

    const grid = ports
      .map((p) => {
        const linkUp = isOn(this._hass, p.link_entity);
        const poeOn = p.poe_switch_entity
          ? isOn(this._hass, p.poe_switch_entity)
          : false;

        return `
          <button
            class="port ${linkUp ? "up" : "down"} ${selected?.port === p.port ? "selected" : ""}"
            data-port="${p.port}"
            title="Port ${p.port}"
          >
            <div class="port-num">${p.port}</div>
            <div class="port-icon">${poeOn ? "⚡" : "⇄"}</div>
          </button>
        `;
      })
      .join("");

    const detail = selected
      ? `
        <div class="port-detail">
          <div class="detail-title">Port ${selected.port}</div>

          <div class="detail-grid">
            <div class="row">
              <div class="label">Link</div>
              <div>${stateValue(this._hass, selected.link_entity, "—")}</div>
            </div>
            <div class="row">
              <div class="label">Speed</div>
              <div>${formatState(this._hass, selected.speed_entity, "—")}</div>
            </div>
            <div class="row">
              <div class="label">PoE</div>
              <div>${selected.poe_switch_entity ? stateValue(this._hass, selected.poe_switch_entity, "—") : "Nicht verfügbar"}</div>
            </div>
            <div class="row">
              <div class="label">PoE Leistung</div>
              <div>${formatState(this._hass, selected.poe_power_entity, "—")}</div>
            </div>
          </div>

          <div class="actions">
            ${
              selected.poe_switch_entity
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
      <ha-card header="${title}">
        <div class="content muted">Version ${VERSION}</div>
        <div class="grid">${grid || `<div class="content muted">Keine Ports erkannt.</div>`}</div>
        <div class="section">${detail}</div>
      </ha-card>
      ${this._styles()}
    `;

    this.shadowRoot.querySelectorAll(".port").forEach((btn) => {
      btn.addEventListener("click", () => {
        this._selectPort(Number(btn.dataset.port));
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
    const title = this._config?.name || `UniFi Device Card v${VERSION}`;

    if (!this._config?.device_id) {
      this._renderEmpty(title);
      return;
    }

    if (this._loading) {
      this.shadowRoot.innerHTML = `
        <ha-card header="${title}">
          <div class="content muted">Lade Gerätedaten…</div>
        </ha-card>
        ${this._styles()}
      `;
      return;
    }

    if (!this._deviceContext) {
      this.shadowRoot.innerHTML = `
        <ha-card header="${title}">
          <div class="content muted">Keine Gerätedaten verfügbar.</div>
        </ha-card>
        ${this._styles()}
      `;
      return;
    }

    if (this._deviceContext.type === "switch") {
      this._renderSwitch(title);
      return;
    }

    this._renderGateway(title);
  }
}

customElements.define("unifi-device-card", UnifiDeviceCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "unifi-device-card",
  name: "UniFi Device Card",
  description: "A Lovelace card for supported UniFi switches and gateways.",
});
