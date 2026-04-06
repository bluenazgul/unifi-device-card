import { LitElement, html, css } from "lit";

class UnifiDeviceCard extends LitElement {
  static get properties() {
    return {
      hass: {},
      _config: {},
    };
  }

  setConfig(config) {
    if (!config.device_id) {
      throw new Error("device_id is required");
    }
    this._config = config;
  }

  render() {
    if (!this.hass || !this._config) return html``;

    const name = this._config.name || this._config.device_id;

    // 👉 NEU: Background Handling
    const cardBg =
      this._config.background_color ||
      "var(--card-background-color)";

    return html`
      <ha-card style="--udc-card-bg: ${cardBg}">
        <div class="card">
          <div class="header">${name}</div>

          <div class="content">
            <!-- Bestehender Content bleibt unverändert -->
            <slot></slot>
          </div>
        </div>
      </ha-card>
    `;
  }

  static get styles() {
    return css`
      ha-card {
        background: var(--udc-card-bg) !important;
        border-radius: var(--ha-card-border-radius, 12px);
        box-shadow: var(--ha-card-box-shadow);
        padding: 0;
      }

      .card {
        display: flex;
        flex-direction: column;
      }

      .header {
        font-size: 16px;
        font-weight: 600;
        padding: 12px 16px;
        border-bottom: 1px solid var(--divider-color);
      }

      .content {
        padding: 16px;
      }
    `;
  }
}

customElements.define("unifi-device-card", UnifiDeviceCard);
