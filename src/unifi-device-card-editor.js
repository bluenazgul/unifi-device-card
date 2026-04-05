import { getUnifiDevices } from "./helpers.js";
import { getApiClient, clearApiClient } from "./unifi-api.js";

class UnifiDeviceCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config     = {};
    this._devices    = [];
    this._loading    = false;
    this._loaded     = false;
    this._error      = "";
    this._hass       = null;
    this._loadToken  = 0;
    this._apiTesting = false;
    this._apiResult  = null;
    this._apiError   = "";
    this._apiSites   = [];
  }

  setConfig(config) {
    this._config = config || {};
    // Default auth_mode to "apikey" if not set but an api_key exists,
    // or "userpass" if username exists, otherwise "apikey"
    if (!this._config._auth_mode) {
      this._config._auth_mode = this._config.unifi_username ? "userpass" : "apikey";
    }
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._loaded && !this._loading) this._loadDevices();
  }

  async _loadDevices() {
    if (!this._hass) return;
    this._loading = true;
    this._error   = "";
    const token   = ++this._loadToken;
    this._render();
    try {
      const devices = await getUnifiDevices(this._hass);
      if (token !== this._loadToken) return;
      this._devices = devices;
      this._loaded  = true;
      this._loading = false;
      this._render();
    } catch (err) {
      if (token !== this._loadToken) return;
      this._devices = [];
      this._loaded  = true;
      this._loading = false;
      this._error   = "UniFi-Geräte konnten nicht geladen werden.";
      this._render();
    }
  }

  _dispatch(config) {
    // Never persist the internal _auth_mode helper key
    const { _auth_mode, ...persistable } = config;
    this.dispatchEvent(new CustomEvent("config-changed", {
      detail: { config: persistable }, bubbles: true, composed: true,
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
    const next        = { ...this._config };
    if (newDeviceId) next.device_id = newDeviceId;
    else delete next.device_id;
    const currentName = String(next.name || "").trim();
    if (!currentName || currentName === oldAutoName) {
      if (newAutoName) next.name = newAutoName;
      else delete next.name;
    }
    this._config = next;
    this._dispatch(next);
    this._render();
  }

  _onNameInput(ev) {
    const next = { ...this._config, name: ev.target.value || "" };
    this._config = next;
    this._dispatch(next);
  }

  _onApiField(field, ev) {
    const value = ev.target.value.trim();
    const next  = { ...this._config };
    if (value) next[field] = value;
    else delete next[field];
    this._config    = next;
    this._apiResult = null;
    this._dispatch(next);
  }

  // Site always falls back to "default" when empty
  _effectiveSite() {
    return (this._config.unifi_site || "").trim() || "default";
  }

  _onAuthModeChange(mode) {
    const next = { ...this._config, _auth_mode: mode };
    // Clear credentials of the OTHER mode so they don't linger in config
    if (mode === "apikey") {
      delete next.unifi_username;
      delete next.unifi_password;
    } else {
      delete next.unifi_api_key;
    }
    this._config    = next;
    this._apiResult = null;
    this._dispatch(next);
    this._render();
  }

  async _testConnection() {
    if (!this._config.unifi_host) {
      this._apiResult = "fail";
      this._apiError  = "Bitte zuerst Host/IP eintragen.";
      this._render();
      return;
    }

    // Build effective config with site fallback
    const effectiveConfig = {
      ...this._config,
      unifi_site: this._effectiveSite(),
    };

    clearApiClient(effectiveConfig);
    this._apiTesting = true;
    this._apiResult  = null;
    this._apiError   = "";
    this._apiSites   = [];
    this._render();

    try {
      const client = getApiClient(effectiveConfig);
      await client.login();
      const sites  = await client.getSites();
      this._apiSites  = Array.isArray(sites)
        ? sites.map((s) => ({ name: s.name, desc: s.desc || s.name }))
        : [];
      this._apiResult = "ok";
    } catch (e) {
      console.error("[unifi-device-card] API test failed:", e);
      this._apiResult = "fail";
      this._apiError  = e.message || "Verbindung fehlgeschlagen";
    }

    this._apiTesting = false;
    this._render();
  }

  _render() {
    const cfg      = this._config;
    const authMode = cfg._auth_mode || "apikey";
    const selId    = cfg?.device_id    || "";
    const selName  = String(cfg?.name           || "").replace(/"/g, "&quot;");
    const host     = String(cfg?.unifi_host     || "").replace(/"/g, "&quot;");
    const apiKey   = String(cfg?.unifi_api_key  || "").replace(/"/g, "&quot;");
    const username = String(cfg?.unifi_username || "").replace(/"/g, "&quot;");
    const password = String(cfg?.unifi_password || "").replace(/"/g, "&quot;");
    const siteRaw  = String(cfg?.unifi_site     || "").replace(/"/g, "&quot;");
    const mac      = String(cfg?.unifi_mac      || "").replace(/"/g, "&quot;");

    const options = this._devices
      .map((d) => `<option value="${d.id}" ${d.id === selId ? "selected" : ""}>${d.label}</option>`)
      .join("");

    // ── Test result badge ────────────────────────────────────────────────
    let testBadge = "";
    if (this._apiTesting) {
      testBadge = `<div class="api-badge testing">⏳ Teste Verbindung…</div>`;
    } else if (this._apiResult === "ok") {
      const sl = this._apiSites.length
        ? `<br><span style="font-weight:400">Sites: ${this._apiSites.map((s) => s.desc).join(", ")}</span>`
        : "";
      testBadge = `<div class="api-badge ok">✅ Verbindung erfolgreich${sl}</div>`;
    } else if (this._apiResult === "fail") {
      testBadge = `<div class="api-badge fail">❌ ${this._apiError}</div>`;
    }

    // ── Auth fields depending on selected mode ────────────────────────────
    const authFields = authMode === "apikey" ? `
      <div class="field">
        <label for="unifi_api_key">API-Key</label>
        <input id="unifi_api_key" type="password" value="${apiKey}"
          placeholder="UniFi Network → Einstellungen → API Keys" />
        <div class="hint">Verfügbar ab UniFi Network 8.x — empfohlen.</div>
      </div>
    ` : `
      <div class="row2">
        <div class="field">
          <label for="unifi_username">Benutzername</label>
          <input id="unifi_username" type="text" value="${username}" placeholder="local-admin" />
        </div>
        <div class="field">
          <label for="unifi_password">Passwort</label>
          <input id="unifi_password" type="password" value="${password}" placeholder="••••••" />
        </div>
      </div>
    `;

    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }
        .wrap { display: grid; gap: 14px; padding-bottom: 8px; }

        .section-title {
          font-size: 11px; font-weight: 700; letter-spacing: 0.08em;
          text-transform: uppercase; color: var(--secondary-text-color);
          padding-bottom: 4px; border-bottom: 1px solid var(--divider-color);
          margin-top: 6px;
        }

        .field { display: grid; gap: 5px; }

        label { font-size: 13px; font-weight: 600; color: var(--primary-text-color); }

        select, input {
          width: 100%; box-sizing: border-box; min-height: 38px;
          padding: 7px 10px; border-radius: 8px;
          border: 1px solid var(--divider-color);
          background: var(--card-background-color);
          color: var(--primary-text-color); font: inherit;
        }

        .row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }

        .hint  { color: var(--secondary-text-color); font-size: 12px; line-height: 1.4; }
        .error { color: var(--error-color);           font-size: 12px; line-height: 1.4; }

        /* ── Auth mode toggle ── */
        .auth-toggle {
          display: grid; grid-template-columns: 1fr 1fr;
          border: 1px solid var(--divider-color); border-radius: 8px;
          overflow: hidden; background: var(--card-background-color);
        }
        .auth-tab {
          padding: 8px 12px; text-align: center;
          font-size: 12px; font-weight: 600; cursor: pointer;
          background: transparent; border: none; font: inherit;
          color: var(--secondary-text-color);
          transition: all .15s ease;
        }
        .auth-tab.active {
          background: var(--primary-color); color: white;
        }
        .auth-tab:not(.active):hover {
          background: var(--secondary-background-color);
          color: var(--primary-text-color);
        }

        /* ── Test button ── */
        .test-btn {
          display: inline-flex; align-items: center; gap: 6px;
          border: none; border-radius: 8px; padding: 8px 16px;
          cursor: pointer; font: inherit; font-size: 13px; font-weight: 600;
          background: var(--primary-color); color: white;
          transition: opacity .15s;
        }
        .test-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        /* ── Result badge ── */
        .api-badge {
          font-size: 12px; font-weight: 600; line-height: 1.5;
          padding: 8px 12px; border-radius: 8px; border: 1px solid transparent;
        }
        .api-badge.testing { background: var(--secondary-background-color); border-color: var(--divider-color); }
        .api-badge.ok      { background: rgba(34,197,94,.1);  border-color: rgba(34,197,94,.3); color: #14532d; }
        .api-badge.fail    { background: rgba(239,68,68,.08); border-color: rgba(239,68,68,.3); color: #991b1b; }

        /* ── Site inline hint ── */
        .site-row { display: grid; grid-template-columns: 1fr auto; gap: 8px; align-items: end; }
        .site-default-hint {
          font-size: 11px; color: var(--primary-color); font-weight: 600;
          padding-bottom: 10px; white-space: nowrap;
        }
      </style>

      <div class="wrap">

        <!-- ── HA Device ── -->
        <div class="section-title">Home Assistant Gerät</div>

        <div class="field">
          <label for="device">UniFi Gerät (aus HA)</label>
          ${this._loading
            ? `<div class="hint">Lade Geräte aus Home Assistant…</div>`
            : `<select id="device"><option value="">Gerät auswählen…</option>${options}</select>`}
        </div>

        <div class="field">
          <label for="name">Anzeigename</label>
          <input id="name" type="text" value="${selName}" placeholder="Optional — wird sonst vom Gerät übernommen" />
        </div>

        ${this._error ? `<div class="error">${this._error}</div>` : ""}
        ${!this._loading && !this._devices.length && !this._error
          ? `<div class="hint">Keine UniFi Switches/Gateways in HA gefunden.</div>`
          : !this._loading
            ? `<div class="hint">Nur Geräte aus der UniFi-Integration werden angezeigt.</div>`
            : ""}

        <!-- ── Direct API ── -->
        <div class="section-title">Direkte API (empfohlen)</div>
        <div class="hint">
          Wenn Host + Zugangsdaten angegeben, werden Port-Daten direkt von der UniFi
          Network Application abgerufen — zuverlässiger und mit mehr Details
          (Echtzeit-Throughput, MAC-Tabelle, PoE-Volt/Ampere).
        </div>

        <div class="field">
          <label for="unifi_host">Controller Host / IP</label>
          <input id="unifi_host" type="text" value="${host}"
            placeholder="192.168.1.1  oder  unifi.local" />
        </div>

        <div class="field">
          <label for="unifi_site">Site</label>
          <div class="site-row">
            <input id="unifi_site" type="text" value="${siteRaw}" placeholder="default" />
            ${!siteRaw ? `<div class="site-default-hint">→ default</div>` : ""}
          </div>
          <div class="hint">Leer lassen = "default" wird automatisch verwendet.</div>
        </div>

        <!-- ── Auth mode toggle ── -->
        <div class="field">
          <label>Authentifizierung</label>
          <div class="auth-toggle">
            <button class="auth-tab ${authMode === "apikey"   ? "active" : ""}" data-mode="apikey">
              🔑 API-Key
            </button>
            <button class="auth-tab ${authMode === "userpass" ? "active" : ""}" data-mode="userpass">
              👤 Benutzername / Passwort
            </button>
          </div>
        </div>

        ${authFields}

        <div class="field">
          <label for="unifi_mac">Geräte-MAC (optional)</label>
          <input id="unifi_mac" type="text" value="${mac}"
            placeholder="aa:bb:cc:dd:ee:ff" />
          <div class="hint">Leer lassen — wird automatisch anhand des HA-Gerätenamens erkannt.</div>
        </div>

        <button class="test-btn" id="test-btn" ${this._apiTesting ? "disabled" : ""}>
          🔌 Verbindung testen
        </button>

        ${testBadge}

      </div>
    `;

    // ── Event listeners ──────────────────────────────────────────────────────
    this.shadowRoot.getElementById("device")
      ?.addEventListener("change", (e) => this._onDeviceChange(e));

    this.shadowRoot.getElementById("name")
      ?.addEventListener("input", (e) => this._onNameInput(e));

    // Auth mode tabs
    this.shadowRoot.querySelectorAll(".auth-tab").forEach((btn) => {
      btn.addEventListener("click", () => this._onAuthModeChange(btn.dataset.mode));
    });

    // API fields — use "change" so we don't dispatch on every keystroke
    const apiFields = authMode === "apikey"
      ? ["unifi_host", "unifi_site", "unifi_api_key", "unifi_mac"]
      : ["unifi_host", "unifi_site", "unifi_username", "unifi_password", "unifi_mac"];

    for (const f of apiFields) {
      this.shadowRoot.getElementById(f)
        ?.addEventListener("change", (e) => this._onApiField(f, e));
    }

    this.shadowRoot.getElementById("test-btn")
      ?.addEventListener("click", () => this._testConnection());
  }
}

customElements.define("unifi-device-card-editor", UnifiDeviceCardEditor);
