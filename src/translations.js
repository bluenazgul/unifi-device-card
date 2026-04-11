/**
 * translations.js
 *
 * UI string translations for the UniFi Device Card.
 * Language is detected from Home Assistant (hass.language)
 * and falls back to English for any unsupported language.
 *
 * To add a new language: copy the "en" block, change the key,
 * and translate the values.
 */

const TRANSLATIONS = {
  en: {
    // Card states
    select_device:      "Please select a UniFi device in the card editor.",
    loading:            "Loading device data…",
    no_data:            "No device data available.",
    no_ports:           "No ports detected.",

    // Front panel
    front_panel:        "Front Panel",
    cpu_utilization:    "CPU utilization",
    cpu_temperature:    "CPU temperature",
    memory_utilization: "Memory utilization",

    // Port detail
    link_status:        "Link Status",
    ap_status:          "AP Status",
    link_lan:           "Link LAN",
    link_mesh:          "Link Mesh",
    uptime:             "Uptime",
    clients:            "Clients",
    speed:              "Speed",
    poe:                "PoE",
    poe_power:          "PoE Power",
    connected:          "Connected",
    no_link:            "No link",
    online:             "Online",
    offline:            "Offline",

    // Actions
    port_disable:       "Disable port",
    port_enable:        "Enable port",
    poe_off:            "PoE off",
    poe_on:             "PoE on",
    power_cycle:        "Power Cycle",
    reboot:             "Reboot",
    led_on:             "LED On",
    led_off:            "LED Off",

    // Hints
    speed_disabled:     "Speed entity disabled — enable it in HA to show link speed.",

    // Editor
    editor_device_title:   "Device",
    editor_device_label:   "UniFi Device",
    editor_device_loading: "Loading devices from Home Assistant…",
    editor_device_select:  "Select device…",
    editor_name_toggle_label: "Display name",
    editor_name_toggle_text:  "Show display name in the card header",
    editor_name_toggle_hint:  "Enabled by default. When disabled, only the model/firmware line is shown.",
    editor_name_label:        "Display name text",
    editor_name_hint:         "Optional — updates automatically when switching devices unless you changed it manually",
    editor_panel_toggle_label: "Front panel",
    editor_panel_toggle_text:  "Show front panel hardware view",
    editor_panel_toggle_hint:  "Enabled by default. Disable to hide the visual front panel.",
    editor_ports_per_row_label: "Ports per row (optional)",
    editor_ports_per_row_hint:  "Leave empty for automatic layout. Set a number (for example 4, 6, 8, 12).",
    editor_port_size_label: "Port size",
    editor_port_size_hint:  "Adjusts front-panel port size for switches and gateways.",
    editor_ap_scale_label:  "AP size",
    editor_ap_scale_hint:   "Scales the AP device size in AP card mode.",
    editor_no_devices:     "No UniFi switches, gateways, or access points found in Home Assistant.",
    editor_hint:           "Only devices from the UniFi Network Integration are shown.",
    editor_error:          "Failed to load UniFi devices.",

    // WAN / WAN2 selector (editor — gateway only)
    editor_wan_port_label:   "WAN Port",
    editor_wan_port_auto:    "Default (automatic)",
    editor_wan_port_hint:    "Select which port is used as WAN. Only shown for gateway devices.",
    editor_wan_port_lan:     "LAN",
    editor_wan_port_sfp:     "SFP",
    editor_wan_port_sfpwan:  "SFP (WAN-capable)",

    editor_wan2_port_label:  "WAN 2 Port",
    editor_wan2_port_hint:   "Optional second WAN/uplink port. Set to “Disabled” if not needed.",
    editor_wan2_port_none:   "Disabled",

    // Raw HA state values that may appear in the link status / PoE fields
    state_on:           "On",
    state_off:          "Off",
    state_up:           "Up",
    state_down:         "Down",
    state_connected:    "Connected",
    state_disconnected: "Disconnected",
    state_true:         "Connected",
    state_false:        "No link",
    state_active:       "Active",
    state_pending:      "Pending",
    state_firmware_mismatch: "Firmware mismatch",
    state_upgrading:    "Upgrading",
    state_provisioning: "Provisioning",
    state_heartbeat_missed: "Heartbeat missed",
    state_adopting:     "Adopting",
    state_deleting:     "Deleting",
    state_inform_error: "Inform error",
    state_adoption_failed: "Adoption failed",
    state_isolated:     "Isolated",

    // Port label prefix (used in detail panel title)
    port_label:         "Port",

    // Background color field (editor)
    editor_bg_label: "Background color (optional)",
    editor_bg_hint:  "Default: var(--card-background-color)",
    editor_bg_opacity_label: "Background transparency",
    editor_bg_opacity_hint:  "0% = fully transparent, 100% = fully opaque",

    // Entity warning — loading hint
    warning_checking: "Checking selected device for disabled or hidden UniFi entities…",

    // Entity warning — content
    warning_title:   "Disabled or hidden UniFi entities detected",
    warning_body:    "The selected device has relevant UniFi entities that are currently disabled or hidden. This can lead to missing controls, incomplete telemetry, or incorrect port status in the card.",
    warning_status:  "Status summary: {disabled} disabled, {hidden} hidden.",
    warning_check_in: "Check in Home Assistant under:",
    warning_ha_path: "Settings → Devices &amp; Services → UniFi → Devices / Entities",

    // Entity warning — entity type labels (used with a leading count number)
    warning_entity_port_switch: "port switch entities",
    warning_entity_poe_switch:  "PoE switch entities",
    warning_entity_poe_power:   "PoE power sensors",
    warning_entity_link_speed:  "link speed sensors",
    warning_entity_rx_tx:       "RX/TX sensors",
    warning_entity_power_cycle: "power cycle buttons",
    warning_entity_link:        "link entities",

    // Device type labels (used in device selector)
    type_switch:  "Switch",
    type_gateway: "Gateway",
    type_access_point: "Access Point",
  },

  de: {
    // Card states
    select_device:      "Bitte im Karteneditor ein UniFi-Gerät auswählen.",
    loading:            "Lade Gerätedaten…",
    no_data:            "Keine Gerätedaten verfügbar.",
    no_ports:           "Keine Ports erkannt.",

    // Front panel
    front_panel:        "Front Panel",

    // Port detail
    link_status:        "Link Status",
    ap_status:          "AP Status",
    link_lan:           "Link LAN",
    link_mesh:          "Link Mesh",
    uptime:             "Uptime",
    clients:            "Clients",
    speed:              "Geschwindigkeit",
    poe:                "PoE",
    poe_power:          "PoE Leistung",
    connected:          "Verbunden",
    no_link:            "Kein Link",
    online:             "Online",
    offline:            "Offline",

    // Actions
    port_disable:       "Port deaktivieren",
    port_enable:        "Port aktivieren",
    poe_off:            "PoE Aus",
    poe_on:             "PoE Ein",
    power_cycle:        "Power Cycle",
    reboot:             "Neustart",
    led_on:             "LED Ein",
    led_off:            "LED Aus",

    // Hints
    speed_disabled:     "Speed-Entity deaktiviert — in HA aktivieren für Geschwindigkeitsanzeige.",

    // Editor
    editor_device_title:   "Gerät",
    editor_device_label:   "UniFi Gerät",
    editor_device_loading: "Lade Geräte aus Home Assistant…",
    editor_device_select:  "Gerät auswählen…",
    editor_name_toggle_label: "Anzeigename",
    editor_name_toggle_text:  "Anzeigenamen im Kartenkopf anzeigen",
    editor_name_toggle_hint:  "Standardmäßig aktiviert. Wenn deaktiviert, wird nur die Modell-/Firmware-Zeile angezeigt.",
    editor_name_label:        "Text für den Anzeigenamen",
    editor_name_hint:         "Optional — wird beim Gerätewechsel automatisch aktualisiert, solange du ihn nicht manuell geändert hast",
    editor_panel_toggle_label: "Frontpanel",
    editor_panel_toggle_text:  "Hardware-Frontpanel anzeigen",
    editor_panel_toggle_hint:  "Standardmäßig aktiviert. Deaktivieren blendet die visuelle Port-Ansicht aus.",
    editor_ports_per_row_label: "Ports pro Zeile (optional)",
    editor_ports_per_row_hint:  "Leer lassen für automatisches Layout. Zahl setzen (z. B. 4, 6, 8, 12).",
    editor_port_size_label: "Portgröße",
    editor_port_size_hint:  "Skaliert die Frontpanel-Portgröße für Switches und Gateways.",
    editor_ap_scale_label:  "AP-Größe",
    editor_ap_scale_hint:   "Skaliert die AP-Gerätegröße im AP-Kartenmodus.",
    editor_no_devices:     "Keine UniFi Switches, Gateways oder Access Points in Home Assistant gefunden.",
    editor_hint:           "Nur Geräte aus der UniFi Network Integration werden angezeigt.",
    editor_error:          "UniFi-Geräte konnten nicht geladen werden.",

    // WAN / WAN2 selector
    editor_wan_port_label:   "WAN-Port",
    editor_wan_port_auto:    "Standard (automatisch)",
    editor_wan_port_hint:    "Wähle, welcher Port als WAN verwendet wird. Nur für Gateway-Geräte.",
    editor_wan_port_lan:     "LAN",
    editor_wan_port_sfp:     "SFP",
    editor_wan_port_sfpwan:  "SFP (WAN-fähig)",

    editor_wan2_port_label:  "WAN2-Port",
    editor_wan2_port_hint:   "Optionaler zweiter WAN-/Uplink-Port. Bei Bedarf auf „Deaktiviert“ setzen.",
    editor_wan2_port_none:   "Deaktiviert",

    // Raw HA state values
    state_on:           "Ein",
    state_off:          "Aus",
    state_up:           "Verbunden",
    state_down:         "Kein Link",
    state_connected:    "Verbunden",
    state_disconnected: "Getrennt",
    state_true:         "Verbunden",
    state_false:        "Kein Link",
    state_active:       "Aktiv",
    state_pending:      "Ausstehend",
    state_firmware_mismatch: "Firmware-Konflikt",
    state_upgrading:    "Aktualisierung",
    state_provisioning: "Provisionierung",
    state_heartbeat_missed: "Heartbeat verloren",
    state_adopting:     "Wird adoptiert",
    state_deleting:     "Wird gelöscht",
    state_inform_error: "Inform-Fehler",
    state_adoption_failed: "Adoption fehlgeschlagen",
    state_isolated:     "Isoliert",

    // Port label prefix
    port_label:         "Port",

    // Background color field (editor)
    editor_bg_label: "Hintergrundfarbe (optional)",
    editor_bg_hint:  "Standard: var(--card-background-color)",
    editor_bg_opacity_label: "Hintergrund-Transparenz",
    editor_bg_opacity_hint:  "0% = vollständig transparent, 100% = vollständig deckend",

    // Entity warning — loading hint
    warning_checking: "Ausgewähltes Gerät auf deaktivierte oder versteckte UniFi-Entities prüfen…",

    // Entity warning — content
    warning_title:   "Deaktivierte oder versteckte UniFi-Entities erkannt",
    warning_body:    "Das ausgewählte Gerät hat relevante UniFi-Entities, die derzeit deaktiviert oder versteckt sind. Das kann zu fehlenden Bedienelementen, unvollständiger Telemetrie oder falschem Portstatus in der Karte führen.",
    warning_status:  "Zusammenfassung: {disabled} deaktiviert, {hidden} versteckt.",
    warning_check_in: "In Home Assistant prüfen unter:",
    warning_ha_path: "Einstellungen → Geräte &amp; Dienste → UniFi → Geräte / Entities",

    // Entity warning — entity type labels
    warning_entity_port_switch: "Port-Switch-Entities",
    warning_entity_poe_switch:  "PoE-Switch-Entities",
    warning_entity_poe_power:   "PoE-Leistungssensoren",
    warning_entity_link_speed:  "Linkgeschwindigkeitssensoren",
    warning_entity_rx_tx:       "RX/TX-Sensoren",
    warning_entity_power_cycle: "Power-Cycle-Buttons",
    warning_entity_link:        "Link-Entities",

    // Device type labels
    type_switch:  "Switch",
    type_gateway: "Gateway",
    type_access_point: "Access Point",
  },

  nl: {
    // Card states
    select_device:      "Selecteer een UniFi-apparaat in de kaarteditor.",
    loading:            "Apparaatgegevens laden…",
    no_data:            "Geen apparaatgegevens beschikbaar.",
    no_ports:           "Geen poorten gedetecteerd.",

    // Front panel
    front_panel:        "Frontpaneel",
    cpu_utilization:    "CPU-gebruik",
    cpu_temperature:    "CPU-temperatuur",
    memory_utilization: "Geheugengebruik",

    // Port detail
    link_status:        "Linkstatus",
    ap_status:          "AP-status",
    link_lan:           "Link LAN",
    link_mesh:          "Link Mesh",
    uptime:             "Uptime",
    clients:            "Clients",
    speed:              "Snelheid",
    poe:                "PoE",
    poe_power:          "PoE-vermogen",
    connected:          "Verbonden",
    no_link:            "Geen link",
    online:             "Online",
    offline:            "Offline",

    // Actions
    port_disable:       "Poort uitschakelen",
    port_enable:        "Poort inschakelen",
    poe_off:            "PoE uit",
    poe_on:             "PoE aan",
    power_cycle:        "Power Cycle",
    reboot:             "Herstarten",
    led_on:             "LED aan",
    led_off:            "LED uit",

    // Hints
    speed_disabled:     "Snelheidsentiteit uitgeschakeld — schakel in HA in om linksnelheid te tonen.",

    // Editor
    editor_device_title:   "Apparaat",
    editor_device_label:   "UniFi-apparaat",
    editor_device_loading: "Apparaten laden uit Home Assistant…",
    editor_device_select:  "Apparaat selecteren…",
    editor_name_toggle_label: "Weergavenaam",
    editor_name_toggle_text:  "Weergavenaam tonen in de kaartkop",
    editor_name_toggle_hint:  "Standaard ingeschakeld. Indien uitgeschakeld, wordt alleen de model-/firmwareregel getoond.",
    editor_name_label:        "Tekst voor de weergavenaam",
    editor_name_hint:         "Optioneel — wordt automatisch bijgewerkt bij het wisselen van apparaat zolang je hem niet handmatig hebt aangepast",
    editor_panel_toggle_label: "Frontpaneel",
    editor_panel_toggle_text:  "Hardware-frontpaneel tonen",
    editor_panel_toggle_hint:  "Standaard ingeschakeld. Uitschakelen verbergt de visuele poortweergave.",
    editor_ports_per_row_label: "Poorten per rij (optioneel)",
    editor_ports_per_row_hint:  "Leeg laten voor automatische layout. Stel een getal in (bijv. 4, 6, 8, 12).",
    editor_port_size_label: "Poortgrootte",
    editor_port_size_hint:  "Schaalt de poortgrootte op het frontpaneel voor switches en gateways.",
    editor_ap_scale_label:  "AP-grootte",
    editor_ap_scale_hint:   "Schaalt de AP-apparaatgrootte in AP-kaartmodus.",
    editor_no_devices:     "Geen UniFi-switches, -gateways of access points gevonden in Home Assistant.",
    editor_hint:           "Alleen apparaten uit de UniFi Network-integratie worden weergegeven.",
    editor_error:          "UniFi-apparaten konden niet worden geladen.",

    // WAN / WAN2 selector
    editor_wan_port_label:   "WAN-poort",
    editor_wan_port_auto:    "Standaard (automatisch)",
    editor_wan_port_hint:    "Selecteer welke poort als WAN wordt gebruikt. Alleen voor gateway-apparaten.",
    editor_wan_port_lan:     "LAN",
    editor_wan_port_sfp:     "SFP",
    editor_wan_port_sfpwan:  "SFP (WAN-geschikt)",

    editor_wan2_port_label:  "WAN 2-poort",
    editor_wan2_port_hint:   "Optionele tweede WAN-/uplinkpoort. Zet op “Uitgeschakeld” als die niet nodig is.",
    editor_wan2_port_none:   "Uitgeschakeld",

    // Raw HA state values
    state_on:           "Aan",
    state_off:          "Uit",
    state_up:           "Verbonden",
    state_down:         "Geen link",
    state_connected:    "Verbonden",
    state_disconnected: "Verbroken",
    state_true:         "Verbonden",
    state_false:        "Geen link",
    state_active:       "Actief",
    state_pending:      "In behandeling",
    state_firmware_mismatch: "Firmware komt niet overeen",
    state_upgrading:    "Bijwerken",
    state_provisioning: "Provisioning",
    state_heartbeat_missed: "Heartbeat gemist",
    state_adopting:     "Adopteren",
    state_deleting:     "Verwijderen",
    state_inform_error: "Inform-fout",
    state_adoption_failed: "Adoptie mislukt",
    state_isolated:     "Geïsoleerd",

    // Port label prefix
    port_label:         "Poort",

    // Background color field (editor)
    editor_bg_label: "Achtergrondkleur (optioneel)",
    editor_bg_hint:  "Standaard: var(--card-background-color)",
    editor_bg_opacity_label: "Achtergrondtransparantie",
    editor_bg_opacity_hint:  "0% = volledig transparant, 100% = volledig ondoorzichtig",

    // Entity warning
    warning_checking: "Geselecteerd apparaat controleren op uitgeschakelde of verborgen UniFi-entiteiten…",
    warning_title:   "Uitgeschakelde of verborgen UniFi-entiteiten gedetecteerd",
    warning_body:    "Het geselecteerde apparaat heeft relevante UniFi-entiteiten die momenteel uitgeschakeld of verborgen zijn. Dit kan leiden tot ontbrekende bediening, onvolledige telemetrie of een onjuiste poortstatus in de kaart.",
    warning_status:  "Samenvatting: {disabled} uitgeschakeld, {hidden} verborgen.",
    warning_check_in: "Controleer in Home Assistant onder:",
    warning_ha_path: "Instellingen → Apparaten &amp; Diensten → UniFi → Apparaten / Entiteiten",

    warning_entity_port_switch: "poortschakelaar-entiteiten",
    warning_entity_poe_switch:  "PoE-schakelaar-entiteiten",
    warning_entity_poe_power:   "PoE-vermogenssensoren",
    warning_entity_link_speed:  "linksnelheidssensoren",
    warning_entity_rx_tx:       "RX/TX-sensoren",
    warning_entity_power_cycle: "power cycle-knoppen",
    warning_entity_link:        "link-entiteiten",

    type_switch:  "Switch",
    type_gateway: "Gateway",
    type_access_point: "Access Point",
  },

  fr: {
    // Card states
    select_device:      "Veuillez sélectionner un appareil UniFi dans l'éditeur de carte.",
    loading:            "Chargement des données…",
    no_data:            "Aucune donnée disponible.",
    no_ports:           "Aucun port détecté.",

    // Front panel
    front_panel:        "Panneau avant",

    // Port detail
    link_status:        "État du lien",
    ap_status:          "Statut AP",
    link_lan:           "Lien LAN",
    link_mesh:          "Lien Mesh",
    uptime:             "Disponibilité",
    clients:            "Clients",
    speed:              "Vitesse",
    poe:                "PoE",
    poe_power:          "Puissance PoE",
    connected:          "Connecté",
    no_link:            "Pas de lien",
    online:             "En ligne",
    offline:            "Hors ligne",

    // Actions
    port_disable:       "Désactiver le port",
    port_enable:        "Activer le port",
    poe_off:            "PoE désactivé",
    poe_on:             "PoE activé",
    power_cycle:        "Redémarrage PoE",
    reboot:             "Redémarrer",
    led_on:             "LED activée",
    led_off:            "LED désactivée",

    // Hints
    speed_disabled:     "Entité de vitesse désactivée — activez-la dans HA pour afficher la vitesse.",

    // Editor
    editor_device_title:   "Appareil",
    editor_device_label:   "Appareil UniFi",
    editor_device_loading: "Chargement des appareils…",
    editor_device_select:  "Sélectionner un appareil…",
    editor_name_label:     "Nom d'affichage",
    editor_name_hint:      "Optionnel — par défaut le nom de l'appareil",
    editor_panel_toggle_label: "Panneau avant",
    editor_panel_toggle_text:  "Afficher la vue matérielle du panneau avant",
    editor_panel_toggle_hint:  "Activé par défaut. Désactivez pour masquer la vue visuelle des ports.",
    editor_ports_per_row_label: "Ports par ligne (optionnel)",
    editor_ports_per_row_hint:  "Laissez vide pour la mise en page automatique. Définissez un nombre (ex. 4, 6, 8, 12).",
    editor_port_size_label: "Taille des ports",
    editor_port_size_hint:  "Ajuste la taille des ports du panneau avant pour switches/passerelles.",
    editor_ap_scale_label:  "Taille AP",
    editor_ap_scale_hint:   "Ajuste la taille de l’appareil AP en mode carte AP.",
    editor_no_devices:     "Aucun switch, gateway ou point d’accès UniFi trouvé dans Home Assistant.",
    editor_hint:           "Seuls les appareils de l'intégration UniFi Network sont affichés.",
    editor_error:          "Impossible de charger les appareils UniFi.",

    // WAN / WAN2 selector
    editor_wan_port_label:   "Port WAN",
    editor_wan_port_auto:    "Par défaut (automatique)",
    editor_wan_port_hint:    "Sélectionnez le port utilisé comme WAN. Uniquement pour les passerelles.",
    editor_wan_port_lan:     "LAN",
    editor_wan_port_sfp:     "SFP",
    editor_wan_port_sfpwan:  "SFP (compatible WAN)",

    editor_wan2_port_label:  "Port WAN 2",
    editor_wan2_port_hint:   "Second port WAN/uplink optionnel. Réglez sur « Désactivé » si inutile.",
    editor_wan2_port_none:   "Désactivé",

    // Raw HA state values
    state_on:           "Activé",
    state_off:          "Désactivé",
    state_up:           "Connecté",
    state_down:         "Pas de lien",
    state_connected:    "Connecté",
    state_disconnected: "Déconnecté",
    state_true:         "Connecté",
    state_false:        "Pas de lien",
    state_active:       "Actif",
    state_pending:      "En attente",
    state_firmware_mismatch: "Incompatibilité firmware",
    state_upgrading:    "Mise à niveau",
    state_provisioning: "Provisionnement",
    state_heartbeat_missed: "Heartbeat manqué",
    state_adopting:     "Adoption en cours",
    state_deleting:     "Suppression en cours",
    state_inform_error: "Erreur inform",
    state_adoption_failed: "Échec de l’adoption",
    state_isolated:     "Isolé",

    // Port label prefix
    port_label:         "Port",

    // Background color field (editor)
    editor_bg_label: "Couleur de fond (optionnel)",
    editor_bg_hint:  "Défaut : var(--card-background-color)",
    editor_bg_opacity_label: "Transparence de fond",
    editor_bg_opacity_hint:  "0 % = entièrement transparent, 100 % = entièrement opaque",

    // Entity warning
    warning_checking: "Vérification des entités UniFi désactivées ou masquées pour l'appareil sélectionné…",
    warning_title:   "Entités UniFi désactivées ou masquées détectées",
    warning_body:    "L'appareil sélectionné possède des entités UniFi pertinentes actuellement désactivées ou masquées. Cela peut entraîner des commandes manquantes, une télémétrie incomplète ou un état de port incorrect dans la carte.",
    warning_status:  "Résumé : {disabled} désactivée(s), {hidden} masquée(s).",
    warning_check_in: "Vérifier dans Home Assistant sous :",
    warning_ha_path: "Paramètres → Appareils &amp; Services → UniFi → Appareils / Entités",

    warning_entity_port_switch: "entités de commutateur de port",
    warning_entity_poe_switch:  "entités de commutateur PoE",
    warning_entity_poe_power:   "capteurs de puissance PoE",
    warning_entity_link_speed:  "capteurs de vitesse de lien",
    warning_entity_rx_tx:       "capteurs RX/TX",
    warning_entity_power_cycle: "boutons de redémarrage PoE",
    warning_entity_link:        "entités de lien",

    type_switch:  "Switch",
    type_gateway: "Passerelle",
    type_access_point: "Point d’accès",
  },
};

/**
 * Get translations for the given language code.
 * Falls back to "en" for any unsupported language.
 * Supports both full locale ("de-DE") and short ("de").
 */
export function getTranslations(lang) {
  if (!lang) return TRANSLATIONS.en;
  const short = String(lang).split("-")[0].toLowerCase();
  return TRANSLATIONS[short] || TRANSLATIONS.en;
}

/**
 * Convenience: get a single translated string.
 * Usage: t(hass, "loading")
 */
export function t(hass, key) {
  const lang = hass?.language || "en";
  const strings = getTranslations(lang);
  return strings[key] ?? TRANSLATIONS.en[key] ?? key;
}
