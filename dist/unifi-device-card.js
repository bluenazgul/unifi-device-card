/* UniFi Device Card 0.0.0-dev.b86b0f7 */
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};

// src/translations.js
function getTranslations(lang) {
  if (!lang) return TRANSLATIONS.en;
  const short = String(lang).split("-")[0].toLowerCase();
  return TRANSLATIONS[short] || TRANSLATIONS.en;
}
function t(hass, key) {
  const lang = hass?.language || "en";
  const strings = getTranslations(lang);
  return strings[key] ?? TRANSLATIONS.en[key] ?? key;
}
var TRANSLATIONS;
var init_translations = __esm({
  "src/translations.js"() {
    TRANSLATIONS = {
      en: {
        // Card states
        select_device: "Please select a UniFi device in the card editor.",
        loading: "Loading device data\u2026",
        no_data: "No device data available.",
        no_ports: "No ports detected.",
        // Front panel
        front_panel: "Front Panel",
        // Port detail
        link_status: "Link Status",
        speed: "Speed",
        poe: "PoE",
        poe_power: "PoE Power",
        connected: "Connected",
        no_link: "No link",
        online: "Online",
        offline: "Offline",
        // Actions
        port_disable: "Disable port",
        port_enable: "Enable port",
        poe_off: "PoE off",
        poe_on: "PoE on",
        power_cycle: "Power Cycle",
        // Hints
        speed_disabled: "Speed entity disabled \u2014 enable it in HA to show link speed.",
        // Editor
        editor_device_title: "Device",
        editor_device_label: "UniFi Device",
        editor_device_loading: "Loading devices from Home Assistant\u2026",
        editor_device_select: "Select device\u2026",
        editor_name_label: "Display name",
        editor_name_hint: "Optional \u2014 defaults to device name",
        editor_no_devices: "No UniFi switches or gateways found in Home Assistant.",
        editor_hint: "Only devices from the UniFi Network Integration are shown.",
        editor_error: "Failed to load UniFi devices.",
        // WAN port selector (editor — gateway only)
        editor_wan_port_label: "WAN Port",
        editor_wan_port_auto: "Default (automatic)",
        editor_wan_port_hint: "Select which port is used as WAN. Only shown for gateway devices.",
        editor_wan_port_lan: "LAN",
        editor_wan_port_sfp: "SFP",
        editor_wan_port_sfpwan: "SFP (WAN-capable)",
        // Raw HA state values that may appear in the link status / PoE fields
        state_on: "On",
        state_off: "Off",
        state_up: "Up",
        state_down: "Down",
        state_connected: "Connected",
        state_disconnected: "Disconnected",
        state_true: "Connected",
        state_false: "No link",
        state_active: "Active",
        // Port label prefix (used in detail panel title)
        port_label: "Port",
        // Background color field (editor)
        editor_bg_label: "Background color (optional)",
        editor_bg_hint: "Default: var(--card-background-color)",
        // Entity warning — loading hint
        warning_checking: "Checking selected device for disabled or hidden UniFi entities\u2026",
        // Entity warning — content
        warning_title: "Disabled or hidden UniFi entities detected",
        warning_body: "The selected device has relevant UniFi entities that are currently disabled or hidden. This can lead to missing controls, incomplete telemetry, or incorrect port status in the card.",
        warning_status: "Status summary: {disabled} disabled, {hidden} hidden.",
        warning_check_in: "Check in Home Assistant under:",
        warning_ha_path: "Settings \u2192 Devices &amp; Services \u2192 UniFi \u2192 Devices / Entities",
        // Entity warning — entity type labels (used with a leading count number)
        warning_entity_port_switch: "port switch entities",
        warning_entity_poe_switch: "PoE switch entities",
        warning_entity_poe_power: "PoE power sensors",
        warning_entity_link_speed: "link speed sensors",
        warning_entity_rx_tx: "RX/TX sensors",
        warning_entity_power_cycle: "power cycle buttons",
        warning_entity_link: "link entities",
        // Device type labels (used in device selector)
        type_switch: "Switch",
        type_gateway: "Gateway"
      },
      de: {
        select_device: "Bitte im Karteneditor ein UniFi-Ger\xE4t ausw\xE4hlen.",
        loading: "Lade Ger\xE4tedaten\u2026",
        no_data: "Keine Ger\xE4tedaten verf\xFCgbar.",
        no_ports: "Keine Ports erkannt.",
        front_panel: "Front Panel",
        link_status: "Link Status",
        speed: "Geschwindigkeit",
        poe: "PoE",
        poe_power: "PoE Leistung",
        connected: "Verbunden",
        no_link: "Kein Link",
        online: "Online",
        offline: "Offline",
        port_disable: "Port deaktivieren",
        port_enable: "Port aktivieren",
        poe_off: "PoE Aus",
        poe_on: "PoE Ein",
        power_cycle: "Power Cycle",
        speed_disabled: "Speed-Entity deaktiviert \u2014 in HA aktivieren f\xFCr Geschwindigkeitsanzeige.",
        editor_device_title: "Ger\xE4t",
        editor_device_label: "UniFi Ger\xE4t",
        editor_device_loading: "Lade Ger\xE4te aus Home Assistant\u2026",
        editor_device_select: "Ger\xE4t ausw\xE4hlen\u2026",
        editor_name_label: "Anzeigename",
        editor_name_hint: "Optional \u2014 wird sonst vom Ger\xE4t \xFCbernommen",
        editor_no_devices: "Keine UniFi Switches oder Gateways in Home Assistant gefunden.",
        editor_hint: "Nur Ger\xE4te aus der UniFi Network Integration werden angezeigt.",
        editor_error: "UniFi-Ger\xE4te konnten nicht geladen werden.",
        // WAN port selector
        editor_wan_port_label: "WAN-Port",
        editor_wan_port_auto: "Standard (automatisch)",
        editor_wan_port_hint: "W\xE4hle, welcher Port als WAN verwendet wird. Nur f\xFCr Gateway-Ger\xE4te.",
        editor_wan_port_lan: "LAN",
        editor_wan_port_sfp: "SFP",
        editor_wan_port_sfpwan: "SFP (WAN-f\xE4hig)",
        // Raw HA state values
        state_on: "Ein",
        state_off: "Aus",
        state_up: "Verbunden",
        state_down: "Kein Link",
        state_connected: "Verbunden",
        state_disconnected: "Getrennt",
        state_true: "Verbunden",
        state_false: "Kein Link",
        state_active: "Aktiv",
        // Port label prefix
        port_label: "Port",
        // Background color field (editor)
        editor_bg_label: "Hintergrundfarbe (optional)",
        editor_bg_hint: "Standard: var(--card-background-color)",
        // Entity warning — loading hint
        warning_checking: "Ausgew\xE4hltes Ger\xE4t auf deaktivierte oder versteckte UniFi-Entities pr\xFCfen\u2026",
        // Entity warning — content
        warning_title: "Deaktivierte oder versteckte UniFi-Entities erkannt",
        warning_body: "Das ausgew\xE4hlte Ger\xE4t hat relevante UniFi-Entities, die derzeit deaktiviert oder versteckt sind. Das kann zu fehlenden Bedienelementen, unvollst\xE4ndiger Telemetrie oder falschem Portstatus in der Karte f\xFChren.",
        warning_status: "Zusammenfassung: {disabled} deaktiviert, {hidden} versteckt.",
        warning_check_in: "In Home Assistant pr\xFCfen unter:",
        warning_ha_path: "Einstellungen \u2192 Ger\xE4te &amp; Dienste \u2192 UniFi \u2192 Ger\xE4te / Entities",
        // Entity warning — entity type labels
        warning_entity_port_switch: "Port-Switch-Entities",
        warning_entity_poe_switch: "PoE-Switch-Entities",
        warning_entity_poe_power: "PoE-Leistungssensoren",
        warning_entity_link_speed: "Linkgeschwindigkeitssensoren",
        warning_entity_rx_tx: "RX/TX-Sensoren",
        warning_entity_power_cycle: "Power-Cycle-Buttons",
        warning_entity_link: "Link-Entities",
        type_switch: "Switch",
        type_gateway: "Gateway"
      },
      nl: {
        select_device: "Selecteer een UniFi-apparaat in de kaarteditor.",
        loading: "Apparaatgegevens laden\u2026",
        no_data: "Geen apparaatgegevens beschikbaar.",
        no_ports: "Geen poorten gedetecteerd.",
        front_panel: "Frontpaneel",
        link_status: "Linkstatus",
        speed: "Snelheid",
        poe: "PoE",
        poe_power: "PoE-vermogen",
        connected: "Verbonden",
        no_link: "Geen link",
        online: "Online",
        offline: "Offline",
        port_disable: "Poort uitschakelen",
        port_enable: "Poort inschakelen",
        poe_off: "PoE uit",
        poe_on: "PoE aan",
        power_cycle: "Power Cycle",
        speed_disabled: "Snelheidsentiteit uitgeschakeld \u2014 schakel in HA in om linksnelheid te tonen.",
        editor_device_title: "Apparaat",
        editor_device_label: "UniFi-apparaat",
        editor_device_loading: "Apparaten laden uit Home Assistant\u2026",
        editor_device_select: "Apparaat selecteren\u2026",
        editor_name_label: "Weergavenaam",
        editor_name_hint: "Optioneel \u2014 standaard de apparaatnaam",
        editor_no_devices: "Geen UniFi-switches of -gateways gevonden in Home Assistant.",
        editor_hint: "Alleen apparaten uit de UniFi Network-integratie worden weergegeven.",
        editor_error: "UniFi-apparaten konden niet worden geladen.",
        // WAN port selector
        editor_wan_port_label: "WAN-poort",
        editor_wan_port_auto: "Standaard (automatisch)",
        editor_wan_port_hint: "Selecteer welke poort als WAN wordt gebruikt. Alleen voor gateway-apparaten.",
        editor_wan_port_lan: "LAN",
        editor_wan_port_sfp: "SFP",
        editor_wan_port_sfpwan: "SFP (WAN-geschikt)",
        // Raw HA state values
        state_on: "Aan",
        state_off: "Uit",
        state_up: "Verbonden",
        state_down: "Geen link",
        state_connected: "Verbonden",
        state_disconnected: "Verbroken",
        state_true: "Verbonden",
        state_false: "Geen link",
        state_active: "Actief",
        port_label: "Poort",
        editor_bg_label: "Achtergrondkleur (optioneel)",
        editor_bg_hint: "Standaard: var(--card-background-color)",
        warning_checking: "Geselecteerd apparaat controleren op uitgeschakelde of verborgen UniFi-entiteiten\u2026",
        warning_title: "Uitgeschakelde of verborgen UniFi-entiteiten gedetecteerd",
        warning_body: "Het geselecteerde apparaat heeft relevante UniFi-entiteiten die momenteel uitgeschakeld of verborgen zijn. Dit kan leiden tot ontbrekende bediening, onvolledige telemetrie of een onjuiste poortstatus in de kaart.",
        warning_status: "Samenvatting: {disabled} uitgeschakeld, {hidden} verborgen.",
        warning_check_in: "Controleer in Home Assistant onder:",
        warning_ha_path: "Instellingen \u2192 Apparaten &amp; Diensten \u2192 UniFi \u2192 Apparaten / Entiteiten",
        warning_entity_port_switch: "poortschakelaar-entiteiten",
        warning_entity_poe_switch: "PoE-schakelaar-entiteiten",
        warning_entity_poe_power: "PoE-vermogenssensoren",
        warning_entity_link_speed: "linksnelheidssensoren",
        warning_entity_rx_tx: "RX/TX-sensoren",
        warning_entity_power_cycle: "power cycle-knoppen",
        warning_entity_link: "link-entiteiten",
        type_switch: "Switch",
        type_gateway: "Gateway"
      },
      fr: {
        select_device: "Veuillez s\xE9lectionner un appareil UniFi dans l'\xE9diteur de carte.",
        loading: "Chargement des donn\xE9es\u2026",
        no_data: "Aucune donn\xE9e disponible.",
        no_ports: "Aucun port d\xE9tect\xE9.",
        front_panel: "Panneau avant",
        link_status: "\xC9tat du lien",
        speed: "Vitesse",
        poe: "PoE",
        poe_power: "Puissance PoE",
        connected: "Connect\xE9",
        no_link: "Pas de lien",
        online: "En ligne",
        offline: "Hors ligne",
        port_disable: "D\xE9sactiver le port",
        port_enable: "Activer le port",
        poe_off: "PoE d\xE9sactiv\xE9",
        poe_on: "PoE activ\xE9",
        power_cycle: "Red\xE9marrage PoE",
        speed_disabled: "Entit\xE9 de vitesse d\xE9sactiv\xE9e \u2014 activez-la dans HA pour afficher la vitesse.",
        editor_device_title: "Appareil",
        editor_device_label: "Appareil UniFi",
        editor_device_loading: "Chargement des appareils\u2026",
        editor_device_select: "S\xE9lectionner un appareil\u2026",
        editor_name_label: "Nom d'affichage",
        editor_name_hint: "Optionnel \u2014 par d\xE9faut le nom de l'appareil",
        editor_no_devices: "Aucun switch ou gateway UniFi trouv\xE9 dans Home Assistant.",
        editor_hint: "Seuls les appareils de l'int\xE9gration UniFi Network sont affich\xE9s.",
        editor_error: "Impossible de charger les appareils UniFi.",
        // WAN port selector
        editor_wan_port_label: "Port WAN",
        editor_wan_port_auto: "Par d\xE9faut (automatique)",
        editor_wan_port_hint: "S\xE9lectionnez le port utilis\xE9 comme WAN. Uniquement pour les passerelles.",
        editor_wan_port_lan: "LAN",
        editor_wan_port_sfp: "SFP",
        editor_wan_port_sfpwan: "SFP (capable WAN)",
        // Raw HA state values
        state_on: "Activ\xE9",
        state_off: "D\xE9sactiv\xE9",
        state_up: "Connect\xE9",
        state_down: "Pas de lien",
        state_connected: "Connect\xE9",
        state_disconnected: "D\xE9connect\xE9",
        state_true: "Connect\xE9",
        state_false: "Pas de lien",
        state_active: "Actif",
        port_label: "Port",
        editor_bg_label: "Couleur de fond (optionnel)",
        editor_bg_hint: "D\xE9faut : var(--card-background-color)",
        warning_checking: "V\xE9rification des entit\xE9s UniFi d\xE9sactiv\xE9es ou masqu\xE9es pour l'appareil s\xE9lectionn\xE9\u2026",
        warning_title: "Entit\xE9s UniFi d\xE9sactiv\xE9es ou masqu\xE9es d\xE9tect\xE9es",
        warning_body: "L'appareil s\xE9lectionn\xE9 poss\xE8de des entit\xE9s UniFi pertinentes actuellement d\xE9sactiv\xE9es ou masqu\xE9es. Cela peut entra\xEEner des commandes manquantes, une t\xE9l\xE9m\xE9trie incompl\xE8te ou un \xE9tat de port incorrect dans la carte.",
        warning_status: "R\xE9sum\xE9 : {disabled} d\xE9sactiv\xE9e(s), {hidden} masqu\xE9e(s).",
        warning_check_in: "V\xE9rifier dans Home Assistant sous :",
        warning_ha_path: "Param\xE8tres \u2192 Appareils &amp; Services \u2192 UniFi \u2192 Appareils / Entit\xE9s",
        warning_entity_port_switch: "entit\xE9s de commutateur de port",
        warning_entity_poe_switch: "entit\xE9s de commutateur PoE",
        warning_entity_poe_power: "capteurs de puissance PoE",
        warning_entity_link_speed: "capteurs de vitesse de lien",
        warning_entity_rx_tx: "capteurs RX/TX",
        warning_entity_power_cycle: "boutons de red\xE9marrage PoE",
        warning_entity_link: "entit\xE9s de lien",
        type_switch: "Switch",
        type_gateway: "Passerelle"
      }
    };
  }
});

// src/unifi-device-card-editor.js
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
      return `${slot.label}${portNum} \u2014 ${tFn("editor_wan_port_sfpwan")}`;
    case "sfp":
      return `${slot.label}${portNum} \u2014 ${tFn("editor_wan_port_sfp")}`;
    default:
      return `${slot.label}${portNum} \u2014 ${tFn("editor_wan_port_lan")}`;
  }
}
function buildWanPortOptions(layout, tFn) {
  const options = [];
  options.push({ value: "auto", label: tFn("editor_wan_port_auto") });
  if (!layout) return options;
  for (const slot of layout.specialSlots || []) {
    const type = slotPortType(slot);
    options.push({
      value: slot.key,
      label: slotDropdownLabel(slot, tFn),
      type
    });
  }
  const specialPortNums = new Set(
    (layout.specialSlots || []).map((s) => s.port).filter((p) => p != null)
  );
  const allPortNums = (layout.rows || []).flat();
  for (const portNum of allPortNums) {
    if (specialPortNums.has(portNum)) continue;
    options.push({
      value: `port_${portNum}`,
      label: `Port ${portNum} \u2014 ${tFn("editor_wan_port_lan")}`,
      type: "lan"
    });
  }
  return options;
}
var UnifiDeviceCardEditor;
var init_unifi_device_card_editor = __esm({
  "src/unifi-device-card-editor.js"() {
    init_helpers();
    init_translations();
    UnifiDeviceCardEditor = class extends HTMLElement {
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
      }
      setConfig(config) {
        this._config = config || {};
        if (this._hass && this._config?.device_id) {
          this._loadEntityHint(this._config.device_id);
          this._loadDeviceCtx(this._config.device_id);
        } else {
          this._entityHint = null;
          this._deviceCtx = null;
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
        if (!this._loaded && !this._loading) this._loadDevices();
        if (this._config?.device_id) {
          this._loadEntityHint(this._config.device_id);
          this._loadDeviceCtx(this._config.device_id);
        }
      }
      _t(key) {
        return t(this._hass, key);
      }
      _smartRender() {
        const root = this.shadowRoot;
        const hasDeviceSelect = !!root?.getElementById("device");
        const shouldHaveDeviceSelect = !this._loading;
        if (!this._rendered || hasDeviceSelect !== shouldHaveDeviceSelect) {
          this._render();
          return;
        }
        this._patchFields();
        this._patchWarning();
      }
      async _loadDevices() {
        if (!this._hass) return;
        this._loading = true;
        this._error = "";
        const token = ++this._loadToken;
        this._smartRender();
        try {
          const devices = await (void 0)(this._hass);
          if (token !== this._loadToken) return;
          this._devices = devices;
          this._loaded = true;
          this._loading = false;
          this._smartRender();
        } catch (err) {
          if (token !== this._loadToken) return;
          this._devices = [];
          this._loaded = true;
          this._loading = false;
          this._error = this._t("editor_error");
          this._smartRender();
        }
      }
      async _loadEntityHint(deviceId) {
        if (!this._hass || !deviceId) {
          this._entityHint = null;
          this._entityHintLoading = false;
          this._smartRender();
          return;
        }
        const token = ++this._entityHintToken;
        this._entityHintLoading = true;
        this._smartRender();
        try {
          const info = await (void 0)(this._hass, deviceId);
          if (token !== this._entityHintToken) return;
          this._entityHint = info;
        } catch (err) {
          console.warn("[unifi-device-card] Failed to load entity warnings", err);
          if (token !== this._entityHintToken) return;
          this._entityHint = null;
        }
        this._entityHintLoading = false;
        this._smartRender();
      }
      async _loadDeviceCtx(deviceId) {
        if (!this._hass || !deviceId) {
          this._deviceCtx = null;
          this._deviceCtxLoading = false;
          return;
        }
        const token = ++this._deviceCtxToken;
        this._deviceCtxLoading = true;
        try {
          const { getDeviceContext: getDeviceContext3 } = await Promise.resolve().then(() => (init_helpers(), helpers_exports));
          const ctx = await getDeviceContext3(this._hass, deviceId);
          if (token !== this._deviceCtxToken) return;
          this._deviceCtx = ctx;
        } catch (err) {
          console.warn("[unifi-device-card] Failed to load device ctx for editor", err);
          if (token !== this._deviceCtxToken) return;
          this._deviceCtx = null;
        }
        this._deviceCtxLoading = false;
        this._render();
      }
      _dispatch(config) {
        this.dispatchEvent(new CustomEvent("config-changed", {
          detail: { config },
          bubbles: true,
          composed: true
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
        const next = { ...this._config };
        if (newDeviceId) next.device_id = newDeviceId;
        else delete next.device_id;
        const currentName = String(next.name || "").trim();
        if (!currentName || currentName === oldAutoName) {
          if (newAutoName) next.name = newAutoName;
          else delete next.name;
        }
        delete next.wan_port;
        this._config = next;
        this._dispatch(next);
        this._loadEntityHint(newDeviceId);
        this._deviceCtx = null;
        this._loadDeviceCtx(newDeviceId);
        this._render();
      }
      _onNameInput(ev) {
        this._config = { ...this._config, name: ev.target.value || "" };
        this._dispatch(this._config);
      }
      _onBackgroundInput(ev) {
        const value = String(ev.target.value || "").trim();
        const next = { ...this._config };
        if (value) next.background_color = value;
        else delete next.background_color;
        this._config = next;
        this._dispatch(next);
      }
      _onWanPortChange(ev) {
        const value = ev.target.value || "auto";
        const next = { ...this._config };
        if (value && value !== "auto") next.wan_port = value;
        else delete next.wan_port;
        this._config = next;
        this._dispatch(next);
      }
      _patchFields() {
        const root = this.shadowRoot;
        if (!root) return;
        const active = this.shadowRoot.activeElement || document.activeElement;
        const nameEl = root.getElementById("name");
        if (nameEl && nameEl !== active) {
          nameEl.value = this._config?.name || "";
        }
        const bgEl = root.getElementById("background_color");
        if (bgEl && bgEl !== active) {
          bgEl.value = this._config?.background_color || "";
        }
        const selEl = root.getElementById("device");
        if (selEl && selEl !== active) {
          selEl.value = this._config?.device_id || "";
        }
        const wanEl = root.getElementById("wan_port");
        if (wanEl && wanEl !== active) {
          wanEl.value = this._config?.wan_port || "auto";
        }
      }
      _patchWarning() {
        const root = this.shadowRoot;
        if (!root) return;
        const container = root.getElementById("warning-container");
        if (!container) return;
        container.innerHTML = this._renderEntityWarning() + (this._error ? `<div class="error">${this._error}</div>` : "") + (!this._loading && !this._devices.length && !this._error ? `<div class="hint">${this._t("editor_no_devices")}</div>` : !this._loading ? `<div class="hint">${this._t("editor_hint")}</div>` : "");
      }
      _renderEntityWarning() {
        if (this._entityHintLoading) {
          return `<div class="hint">${this._t("warning_checking")}</div>`;
        }
        const info = this._entityHint;
        if (!info) return "";
        const disabled = info.disabled || {};
        const hidden = info.hidden || {};
        const counts = {
          port_switch: (disabled.port_switch?.length || 0) + (hidden.port_switch?.length || 0),
          poe_switch: (disabled.poe_switch?.length || 0) + (hidden.poe_switch?.length || 0),
          poe_power: (disabled.poe_power?.length || 0) + (hidden.poe_power?.length || 0),
          link_speed: (disabled.link_speed?.length || 0) + (hidden.link_speed?.length || 0),
          rx_tx: (disabled.rx_tx?.length || 0) + (hidden.rx_tx?.length || 0),
          power_cycle: (disabled.power_cycle?.length || 0) + (hidden.power_cycle?.length || 0),
          link: (disabled.link?.length || 0) + (hidden.link?.length || 0)
        };
        const total = Object.values(counts).reduce((sum, n) => sum + n, 0);
        if (total === 0) return "";
        const lines = [];
        if (counts.port_switch) lines.push(`<li>${counts.port_switch} ${this._t("warning_entity_port_switch")}</li>`);
        if (counts.poe_switch) lines.push(`<li>${counts.poe_switch} ${this._t("warning_entity_poe_switch")}</li>`);
        if (counts.poe_power) lines.push(`<li>${counts.poe_power} ${this._t("warning_entity_poe_power")}</li>`);
        if (counts.link_speed) lines.push(`<li>${counts.link_speed} ${this._t("warning_entity_link_speed")}</li>`);
        if (counts.rx_tx) lines.push(`<li>${counts.rx_tx} ${this._t("warning_entity_rx_tx")}</li>`);
        if (counts.power_cycle) lines.push(`<li>${counts.power_cycle} ${this._t("warning_entity_power_cycle")}</li>`);
        if (counts.link) lines.push(`<li>${counts.link} ${this._t("warning_entity_link")}</li>`);
        const statusText = this._t("warning_status").replace("{disabled}", `<strong>${info.disabledCount || 0}</strong>`).replace("{hidden}", `<strong>${info.hiddenCount || 0}</strong>`);
        return `
      <div class="warning">
        <div class="warning-title">${this._t("warning_title")}</div>
        <div class="warning-text">${this._t("warning_body")}</div>
        <div class="warning-text">${statusText}</div>
        ${lines.length ? `<ul class="warning-list">${lines.join("")}</ul>` : ""}
        <div class="warning-text">
          ${this._t("warning_check_in")}<br>
          <strong>${this._t("warning_ha_path")}</strong>
        </div>
      </div>
    `;
      }
      _renderWanPortSelector() {
        if (!this._config?.device_id) return "";
        if (this._deviceCtxLoading) {
          return `
        <div class="field">
          <label>${this._t("editor_wan_port_label")}</label>
          <div class="hint">${this._t("editor_device_loading")}</div>
        </div>
      `;
        }
        const ctx = this._deviceCtx;
        if (!ctx || ctx.type !== "gateway") return "";
        const layout = ctx.layout;
        const options = buildWanPortOptions(layout, (k) => this._t(k));
        if (options.length <= 1) return "";
        const currentVal = this._config?.wan_port || "auto";
        const optionHtml = options.map((o) => {
          const sel = o.value === currentVal ? " selected" : "";
          return `<option value="${o.value}"${sel}>${o.label}</option>`;
        }).join("");
        return `
      <div class="field">
        <label for="wan_port">${this._t("editor_wan_port_label")}</label>
        <select id="wan_port">
          ${optionHtml}
        </select>
        <div class="hint">${this._t("editor_wan_port_hint")}</div>
      </div>
    `;
      }
      _render() {
        const cfg = this._config;
        const selId = cfg?.device_id || "";
        const selName = String(cfg?.name || "").replace(/"/g, "&quot;");
        const selBg = String(cfg?.background_color || "").replace(/"/g, "&quot;");
        const options = this._devices.map((d) => `<option value="${d.id}" ${d.id === selId ? "selected" : ""}>${d.label}</option>`).join("");
        this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }
        .wrap { display: grid; gap: 14px; }
        .section-title {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--secondary-text-color);
          padding-bottom: 4px;
          border-bottom: 1px solid var(--divider-color);
        }
        .field { display: grid; gap: 5px; }
        label {
          font-size: 13px;
          font-weight: 600;
          color: var(--primary-text-color);
        }
        select, input {
          width: 100%;
          box-sizing: border-box;
          min-height: 38px;
          padding: 7px 10px;
          border-radius: 8px;
          border: 1px solid var(--divider-color);
          background: var(--card-background-color);
          color: var(--primary-text-color);
          font: inherit;
        }
        .hint {
          color: var(--secondary-text-color);
          font-size: 12px;
          line-height: 1.4;
        }
        .error {
          color: var(--error-color);
          font-size: 12px;
          line-height: 1.4;
        }
        .warning {
          border: 1px solid var(--warning-color, #f59e0b);
          background: rgba(245, 158, 11, 0.08);
          color: var(--primary-text-color);
          border-radius: 8px;
          padding: 10px 12px;
          display: grid;
          gap: 6px;
        }
        .warning-title { font-size: 13px; font-weight: 700; }
        .warning-text  { font-size: 12px; line-height: 1.4; }
        .warning-list  { margin: 0; padding-left: 18px; font-size: 12px; line-height: 1.4; }
      </style>

      <div class="wrap">
        <div class="section-title">${this._t("editor_device_title")}</div>

        <div class="field">
          <label for="device">${this._t("editor_device_label")}</label>
          ${this._loading ? `<div class="hint">${this._t("editor_device_loading")}</div>` : `<select id="device">
                 <option value="">${this._t("editor_device_select")}</option>
                 ${options}
               </select>`}
        </div>

        ${this._renderWanPortSelector()}

        <div class="field">
          <label for="name">${this._t("editor_name_label")}</label>
          <input
            id="name"
            type="text"
            value="${selName}"
            placeholder="${this._t("editor_name_hint")}"
          />
        </div>

        <div class="field">
          <label for="background_color">${this._t("editor_bg_label")}</label>
          <input
            id="background_color"
            type="text"
            value="${selBg}"
            placeholder="${this._t("editor_bg_hint")}"
          />
        </div>

        <div id="warning-container">
          ${this._renderEntityWarning()}
          ${this._error ? `<div class="error">${this._error}</div>` : ""}
          ${!this._loading && !this._devices.length && !this._error ? `<div class="hint">${this._t("editor_no_devices")}</div>` : !this._loading ? `<div class="hint">${this._t("editor_hint")}</div>` : ""}
        </div>
      </div>
    `;
        this._rendered = true;
        this.shadowRoot.getElementById("device")?.addEventListener("change", (e) => this._onDeviceChange(e));
        this.shadowRoot.getElementById("wan_port")?.addEventListener("change", (e) => this._onWanPortChange(e));
        this.shadowRoot.getElementById("name")?.addEventListener("input", (e) => this._onNameInput(e));
        this.shadowRoot.getElementById("background_color")?.addEventListener("input", (e) => this._onBackgroundInput(e));
      }
    };
    customElements.define("unifi-device-card-editor", UnifiDeviceCardEditor);
  }
});

// src/helpers.js
var helpers_exports = {};
var VERSION, UnifiDeviceCard;
var init_helpers = __esm({
  "src/helpers.js"() {
    init_helpers();
    init_translations();
    init_unifi_device_card_editor();
    VERSION = "0.0.0-dev.b86b0f7";
    UnifiDeviceCard = class extends HTMLElement {
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
      /**
       * Translate a raw HA state value (e.g. "on", "connected", "up") to a
       * localised string. Falls back to the original value if not recognised,
       * so sensor readings / firmware strings are passed through unchanged.
       */
      _translateState(raw) {
        if (!raw || raw === "\u2014") return raw;
        const key = `state_${String(raw).toLowerCase().replace(/\s+/g, "_")}`;
        const translated = this._t(key);
        return translated === key ? raw : translated;
      }
      _cardBgStyle() {
        return this._config?.background_color || "";
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
          const ctx = await (void 0)(this._hass, currentId);
          if (token !== this._loadToken) return;
          this._ctx = ctx;
          this._loadedDeviceId = currentId;
          const discovered = (void 0)(ctx?.entities || []);
          const numberedRaw = (void 0)(ctx?.layout, discovered);
          const specialsRaw = (void 0)(
            ctx?.layout,
            (void 0)(ctx?.entities || []),
            discovered
          );
          const wanPort = this._config?.wan_port;
          const { specials, numbered } = ctx?.type === "gateway" && wanPort && wanPort !== "auto" ? (void 0)(specialsRaw, numberedRaw, ctx?.layout, wanPort) : { specials: specialsRaw, numbered: numberedRaw };
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
        return fw ? `${model} \xB7 FW ${fw}` : model;
      }
      _connectedCount(allSlots) {
        return allSlots.filter((s) => (void 0)(this._hass, s.link_entity, s)).length;
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

      .theme-white  .panel-label { color: #8a96a8; }
      .theme-silver .panel-label { color: #5a6070; }
      .theme-dark   .panel-label { color: var(--udc-muted); }

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

      /* port states */
      .port.up   .port-led-link { background: var(--udc-green); box-shadow: 0 0 4px var(--udc-green); }
      .port.down .port-led-link { background: var(--udc-muted); }
      .port.poe-on .port-led-link { background: var(--udc-orange); box-shadow: 0 0 4px var(--udc-orange); }

      /* speed badges */
      .port.speed-10g  .port-socket::after { background: var(--udc-accent); }
      .port.speed-25g  .port-socket::after { background: #a855f7; }
      .port.speed-1g   .port-socket::after { background: var(--udc-green); }
      .port.speed-100m .port-socket::after { background: var(--udc-orange); }
      .port.speed-10m  .port-socket::after { background: var(--udc-muted); }

      /* special port (WAN/SFP) */
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

      /* detail section */
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
      _speedClass(hass, slot) {
        const speedText = (void 0)(hass, slot);
        if (!speedText || speedText === "\u2014") return "";
        const num = parseInt(speedText, 10);
        if (num >= 1e4) return "speed-10g";
        if (num >= 2500) return "speed-25g";
        if (num >= 1e3) return "speed-1g";
        if (num >= 100) return "speed-100m";
        if (num >= 10) return "speed-10m";
        return "";
      }
      _renderPortButton(slot, selectedKey) {
        const isSpecial = slot.kind === "special";
        const linkUp = (void 0)(this._hass, slot.link_entity, slot);
        const poeStatus = (void 0)(this._hass, slot);
        const poeOn = poeStatus.poeOn;
        const speedClass = linkUp ? this._speedClass(this._hass, slot) : "";
        const tooltip = [
          slot.port_label || (isSpecial ? slot.label : `${this._t("port_label")} ${slot.label}`),
          linkUp ? this._t("connected") : this._t("no_link"),
          linkUp ? (void 0)(this._hass, slot) : null,
          poeOn ? "PoE ON" : null
        ].filter((v) => v && v !== "\u2014").join(" \xB7 ");
        const classes = [
          "port",
          isSpecial ? "special" : "",
          linkUp ? "up" : "down",
          selectedKey === slot.key ? "selected" : "",
          speedClass,
          poeOn ? "poe-on" : ""
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
        const discovered = (void 0)(ctx?.entities || []);
        const numberedRaw = (void 0)(ctx?.layout, discovered);
        const specialsRaw = (void 0)(
          ctx?.layout,
          (void 0)(ctx?.entities || []),
          discovered
        );
        const wanPort = this._config?.wan_port;
        const { specials, numbered } = ctx?.type === "gateway" && wanPort && wanPort !== "auto" ? (void 0)(specialsRaw, numberedRaw, ctx?.layout, wanPort) : { specials: specialsRaw, numbered: numberedRaw };
        const allSlots = [...specials, ...numbered];
        const selected = allSlots.find((p) => p.key === this._selectedKey) || allSlots[0] || null;
        const connected = this._connectedCount(allSlots);
        const theme = ctx?.layout?.theme || "dark";
        const specialRow = specials.length ? `<div class="special-row">${specials.map((s) => this._renderPortButton(s, selected?.key)).join("")}</div>` : "";
        const layoutRows = (ctx?.layout?.rows || []).map((rowPorts) => {
          const items = rowPorts.map((portNumber) => {
            const slot = numbered.find((p) => p.port === portNumber) || {
              key: `port-${portNumber}`,
              port: portNumber,
              label: String(portNumber),
              kind: "numbered",
              link_entity: null,
              port_switch_entity: null,
              speed_entity: null,
              poe_switch_entity: null,
              poe_power_entity: null,
              power_cycle_entity: null,
              rx_entity: null,
              tx_entity: null,
              raw_entities: []
            };
            return this._renderPortButton(slot, selected?.key);
          }).join("");
          return `<div class="port-row">${items}</div>`;
        });
        let detail = `<div class="muted">${this._t("no_ports")}</div>`;
        if (selected) {
          const linkUp = (void 0)(this._hass, selected.link_entity, selected);
          const linkText = (void 0)(this._hass, selected);
          const speedText = (void 0)(this._hass, selected);
          const poeStatus = (void 0)(this._hass, selected);
          const hasPoe = poeStatus.hasPoe;
          const poeOn = poeStatus.poeOn;
          const poePower = hasPoe ? (void 0)(this._hass, selected.poe_power_entity, "\u2014") : "\u2014";
          const rxVal = selected.rx_entity ? (void 0)(this._hass, selected.rx_entity, null) : null;
          const txVal = selected.tx_entity ? (void 0)(this._hass, selected.tx_entity, null) : null;
          const portTitle = selected.port_label || (selected.kind === "special" ? selected.label : `${this._t("port_label")} ${selected.label}`);
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
            <div class="detail-value">${speedText || "\u2014"}</div>
          </div>
          ${hasPoe ? `
          <div class="detail-item">
            <div class="detail-label">${this._t("poe")}</div>
            <div class="detail-value">${this._translateState(poeStatus.poeText)}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">${this._t("poe_power")}</div>
            <div class="detail-value">${poePower}</div>
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
            const enabled = (void 0)(this._hass, selected.port_switch_entity);
            return `<button class="action-btn secondary" data-action="toggle-port" data-entity="${selected.port_switch_entity}">
              ${enabled ? this._t("port_disable") : this._t("port_enable")}
            </button>`;
          })() : ""}
          ${poeStatus.canToggle ? `<button class="action-btn primary" data-action="toggle-poe" data-entity="${selected.poe_switch_entity}">
            \u26A1 ${poeOn ? this._t("poe_off") : this._t("poe_on")}
          </button>` : ""}
          ${selected.power_cycle_entity ? `<button class="action-btn secondary" data-action="power-cycle" data-entity="${selected.power_cycle_entity}">
            \u21BA ${this._t("power_cycle")}
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
        this.shadowRoot.querySelectorAll(".port").forEach((btn) => btn.addEventListener("click", () => this._selectKey(btn.dataset.key)));
        this.shadowRoot.querySelector("[data-action='toggle-port']")?.addEventListener("click", (e) => this._toggleEntity(e.currentTarget.dataset.entity));
        this.shadowRoot.querySelector("[data-action='toggle-poe']")?.addEventListener("click", (e) => this._toggleEntity(e.currentTarget.dataset.entity));
        this.shadowRoot.querySelector("[data-action='power-cycle']")?.addEventListener("click", (e) => this._pressButton(e.currentTarget.dataset.entity));
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
    };
    customElements.define("unifi-device-card", UnifiDeviceCard);
    window.customCards = window.customCards || [];
    window.customCards.push({
      type: "unifi-device-card",
      name: "UniFi Device Card",
      description: "Lovelace card for UniFi switches and gateways."
    });
  }
});

// src/unifi-device-card.js
init_helpers();
init_translations();
init_unifi_device_card_editor();
var VERSION2 = "0.0.0-dev.b86b0f7";
var UnifiDeviceCard2 = class extends HTMLElement {
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
    if (!raw || raw === "\u2014") return raw;
    const key = `state_${String(raw).toLowerCase().replace(/\s+/g, "_")}`;
    const translated = this._t(key);
    return translated === key ? raw : translated;
  }
  _cardBgStyle() {
    return this._config?.background_color || "";
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
      const ctx = await (void 0)(this._hass, currentId);
      if (token !== this._loadToken) return;
      this._ctx = ctx;
      this._loadedDeviceId = currentId;
      const discovered = (void 0)(ctx?.entities || []);
      const numberedRaw = (void 0)(ctx?.layout, discovered);
      const specialsRaw = (void 0)(
        ctx?.layout,
        (void 0)(ctx?.entities || []),
        discovered
      );
      const wanPort = this._config?.wan_port;
      const { specials, numbered } = ctx?.type === "gateway" && wanPort && wanPort !== "auto" ? (void 0)(wanPort, specialsRaw, numberedRaw, ctx?.layout) : { specials: specialsRaw, numbered: numberedRaw };
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
    if (!this._config?.device_id || !this._ctx) return `Version ${VERSION2}`;
    const fw = this._ctx?.firmware;
    const model = this._ctx?.layout?.displayModel || this._ctx?.model || "";
    return fw ? `${model} \xB7 FW ${fw}` : model;
  }
  _connectedCount(allSlots) {
    return allSlots.filter((s) => (void 0)(this._hass, s)).length;
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

      .theme-white  .panel-label { color: #8a96a8; }
      .theme-silver .panel-label { color: #5a6070; }
      .theme-dark   .panel-label { color: var(--udc-muted); }

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
  _speedClass(hass, slot) {
    const speedText = (void 0)(hass, slot);
    if (!speedText || speedText === "\u2014") return "";
    const num = parseInt(speedText, 10);
    if (num >= 25e3) return "speed-25g";
    if (num >= 1e4) return "speed-10g";
    if (num >= 1e3) return "speed-1g";
    if (num >= 100) return "speed-100m";
    if (num >= 10) return "speed-10m";
    return "";
  }
  _renderPortButton(slot, selectedKey) {
    const isSpecial = slot.kind === "special";
    const linkUp = (void 0)(this._hass, slot);
    const poeStatus = (void 0)(this._hass, slot);
    const poeOn = poeStatus.active;
    const speedClass = linkUp ? this._speedClass(this._hass, slot) : "";
    const tooltip = [
      slot.port_label || (isSpecial ? slot.label : `${this._t("port_label")} ${slot.label}`),
      this._translateState((void 0)(this._hass, slot)),
      linkUp ? (void 0)(this._hass, slot) : null,
      poeOn ? `${this._t("poe")}${poeStatus.power ? ` ${poeStatus.power}` : " ON"}` : null
    ].filter((v) => v && v !== "\u2014").join(" \xB7 ");
    const classes = [
      "port",
      isSpecial ? "special" : "",
      linkUp ? "up" : "down",
      selectedKey === slot.key ? "selected" : "",
      speedClass,
      poeOn ? "poe-on" : ""
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
    const discovered = (void 0)(ctx?.entities || []);
    const numberedRaw = (void 0)(ctx?.layout, discovered);
    const specialsRaw = (void 0)(
      ctx?.layout,
      (void 0)(ctx?.entities || []),
      discovered
    );
    const wanPort = this._config?.wan_port;
    const { specials, numbered } = ctx?.type === "gateway" && wanPort && wanPort !== "auto" ? (void 0)(wanPort, specialsRaw, numberedRaw, ctx?.layout) : { specials: specialsRaw, numbered: numberedRaw };
    const allSlots = [...specials, ...numbered];
    const selected = allSlots.find((p) => p.key === this._selectedKey) || allSlots[0] || null;
    const connected = this._connectedCount(allSlots);
    const theme = ctx?.layout?.theme || "dark";
    const specialRow = specials.length ? `<div class="special-row">${specials.map((s) => this._renderPortButton(s, selected?.key)).join("")}</div>` : "";
    const layoutRows = (ctx?.layout?.rows || []).map((rowPorts) => {
      const items = rowPorts.map((portNumber) => {
        const slot = numbered.find((p) => p.port === portNumber) || {
          key: `port-${portNumber}`,
          port: portNumber,
          label: String(portNumber),
          kind: "numbered",
          link_entity: null,
          port_switch_entity: null,
          speed_entity: null,
          poe_switch_entity: null,
          poe_power_entity: null,
          power_cycle_entity: null,
          rx_entity: null,
          tx_entity: null,
          raw_entities: []
        };
        return this._renderPortButton(slot, selected?.key);
      }).join("");
      return `<div class="port-row">${items}</div>`;
    });
    let detail = `<div class="muted">${this._t("no_ports")}</div>`;
    if (selected) {
      const linkUp = (void 0)(this._hass, selected);
      const linkText = (void 0)(this._hass, selected);
      const speedText = (void 0)(this._hass, selected);
      const poeStatus = (void 0)(this._hass, selected);
      const hasPoe = !!(selected.poe_switch_entity || selected.poe_power_entity || selected.power_cycle_entity);
      const poeOn = poeStatus.active;
      const poePower = selected.poe_power_entity ? (void 0)(this._hass, selected.poe_power_entity) : "\u2014";
      const rxVal = selected.rx_entity ? (void 0)(this._hass, selected.rx_entity) : null;
      const txVal = selected.tx_entity ? (void 0)(this._hass, selected.tx_entity) : null;
      const portTitle = selected.port_label || (selected.kind === "special" ? selected.label : `${this._t("port_label")} ${selected.label}`);
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
            <div class="detail-value">${speedText || "\u2014"}</div>
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
            <div class="detail-value">${poePower || "\u2014"}</div>
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
        const enabled = (void 0)(this._hass, selected.port_switch_entity);
        return `<button class="action-btn secondary" data-action="toggle-port" data-entity="${selected.port_switch_entity}">
              ${enabled ? this._t("port_disable") : this._t("port_enable")}
            </button>`;
      })() : ""}
          ${selected.poe_switch_entity ? `<button class="action-btn primary" data-action="toggle-poe" data-entity="${selected.poe_switch_entity}">
            \u26A1 ${poeOn ? this._t("poe_off") : this._t("poe_on")}
          </button>` : ""}
          ${selected.power_cycle_entity ? `<button class="action-btn secondary" data-action="power-cycle" data-entity="${selected.power_cycle_entity}">
            \u21BA ${this._t("power_cycle")}
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
    this.shadowRoot.querySelectorAll(".port").forEach((btn) => btn.addEventListener("click", () => this._selectKey(btn.dataset.key)));
    this.shadowRoot.querySelector("[data-action='toggle-port']")?.addEventListener("click", (e) => this._toggleEntity(e.currentTarget.dataset.entity));
    this.shadowRoot.querySelector("[data-action='toggle-poe']")?.addEventListener("click", (e) => this._toggleEntity(e.currentTarget.dataset.entity));
    this.shadowRoot.querySelector("[data-action='power-cycle']")?.addEventListener("click", (e) => this._pressButton(e.currentTarget.dataset.entity));
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
};
customElements.define("unifi-device-card", UnifiDeviceCard2);
window.customCards = window.customCards || [];
window.customCards.push({
  type: "unifi-device-card",
  name: "UniFi Device Card",
  description: "Lovelace card for UniFi switches and gateways."
});
