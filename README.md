# UniFi Device Card


<img alt="Screenshot" src="https://github.com/bluenazgul/unifi-device-card/blob/29216dc3ed95c7a143f5230742f15ecb4f57626b/screenshots/Screenshot%20USW-Lite-16-PoE.png" />
<img alt="Screenshot" src="https://github.com/bluenazgul/unifi-device-card/blob/main/screenshots/Screenshot%20Editor.png" />
<img alt="Screenshot" src="https://github.com/bluenazgul/unifi-device-card/blob/main/screenshots/Screenshot%20UCG-U.png" />
<img alt="Screenshot" src="https://github.com/bluenazgul/unifi-device-card/blob/main/screenshots/Screenshot%20US8-60W.png" />


A Home Assistant Lovelace custom card for UniFi switches, gateways, and access points — built on top of the official [UniFi Network Integration](https://www.home-assistant.io/integrations/unifi/).

No direct API access, no extra configuration. Just add the card and pick your device.

---

## Infos

This dashboard is based on my idea, but was created with the help of ChatGPT and Claude.ai and only tested with the UniFi devices I own:

- UCG-U
- US 8 60W
- USW Lite 8 PoE
- USW Lite 16 PoE
- USW Flex
- AC Mesh
- AC Pro
- U6+
- U6 Mesh

If you see improvements, issues, or fixes, feel free to open an issue or create a pull request.

---

## Features

- **Realistic front-panel view** — ports laid out close to the physical device, including dual-row, six-grid, quad-row, compact gateway, and special WAN/SFP slot layouts
- **Device-accurate styling** — white panel for Lite / Flex / Ultra / Cloud Gateway style devices, silver or dark layouts for rack devices like US 8 / UDM Pro / UDM SE
- **Per-port link and PoE indication** — visual port LEDs reflect link state, speed class, and active PoE
- **Port detail panel** — click any port to see link status, speed, PoE state, PoE power draw, RX/TX values, and available actions
- **PoE toggle & Power Cycle** — directly from the card when supported by Home Assistant entities
- **Live port counter** — connected / total shown in the header chip
- **Automatic device detection** — finds UniFi switches and gateways registered in Home Assistant
- **Access Point card mode** — AP devices render a dedicated AP panel with online status, uptime, clients, and reboot action (if available)
- **Built-in UI editor** — full card configuration without YAML
- **Supports renamed entities** — port telemetry still works even if entities were renamed in Home Assistant
- **Smarter link detection** — falls back to speed, PoE power, and RX/TX traffic when direct port link entities are missing
- **Optional card background color** — use the default Home Assistant card background or override it with your own color
- **AP-native card background behavior** — AP cards can stay transparent like native Home Assistant cards unless a custom background color is configured

---

## Supported Devices

| Model | Ports | Panel |
|---|---|---|
| UniFi Switch Compact 8 (`USC8`) | 8 | Silver |
| UniFi Switch 8 60W (`US8P60`) | 8 | Silver |
| UniFi Switch 8 150W (`US8P150`) | 8 + 2 SFP | Silver |
| UniFi Switch 16 PoE 150W (`US16P150`) | 16 + 2 SFP | Silver |
| USW Flex Mini (`USMINI`) | 5 | White |
| USW Flex (`USF5P`) | 4 + Uplink | White |
| USW Lite 8 PoE (`USL8LP`, `USL8LPB`) | 8 | White |
| USW Lite 16 PoE (`USL16LP`, `USL16LPB`) | 16 | White |
| USW 16 PoE (`USL16P`) | 16 + 2 SFP | Silver |
| USW 24 (`USL24`) | 24 + 2 SFP | Silver |
| USW 24 PoE (`USL24P`, `USW24P`) | 24 + 2 SFP | Silver |
| USW 48 (`USL48`) | 48 + 4 SFP | Silver |
| USW 48 PoE (`USL48P`, `USW48P`) | 48 + 4 SFP | Silver |
| USW Pro 24 PoE (`US24PRO`) | 24 + 2 SFP+ | Silver |
| USW Pro 24 (`US24PRO2`) | 24 + 2 SFP+ | Silver |
| USW Pro 48 PoE (`US48PRO`) | 48 + 4 SFP+ | Silver |
| USW Pro 48 (`US48PRO2`) | 48 + 4 SFP+ | Silver |
| USW Enterprise 8 PoE (`US68P`) | 8 + 2 SFP+ | Silver |
| USW Enterprise 24 PoE (`US624P`) | 24 + 2 SFP+ | Silver |
| USW Enterprise 48 PoE (`US648P`) | 48 + 4 SFP+ | Silver |
| USW Aggregation (`USL8A`) | 8 SFP+ | Silver |
| USW Pro Aggregation (`USAGGPRO`) | 28 SFP+ + 4 SFP28 | Silver |
| USW Ultra (`USWULTRA`) | 8 | White |
| USW Ultra 60W (`USWULTRA60W`) | 8 | White |
| USW Ultra 210W (`USWULTRA210W`) | 8 | White |
| Dream Router 7 (`UDR7`) | 4 + WAN | White |
| Cloud Gateway Ultra (`UCGULTRA`, `UDRULT`) | 4 + WAN | White |
| Cloud Gateway Max (`UCGMAX`) | 4 + WAN | White |
| Cloud Gateway Fiber (`UCGFIBER`) | 4 + WAN + 2 SFP+ | White |
| UDM Pro (`UDMPRO`) | 8 + WAN/SFP+ | Silver |
| UDM SE (`UDMPROSE`) | 8 + WAN/SFP+ | Silver |
| UXG-Pro (`UXGPRO`) | 2 + WAN + SFP+ | Silver |
| UXG-Lite (`UXGL`) | 1 + WAN | White |
| UniFi Security Gateway (`UGW3`) | 2 + WAN | White |
| USG Pro 4 (`UGW4`) | 2 + WAN + 2 SFP | Silver |
| UAP AC Pro (`UAPACPRO`) | AP panel | White |
| UAP AC Mesh (`UAPACM`) | AP panel | White |
| U6+ (`U6PLUS`) | AP panel | White |
| U6 Mesh (`U6MESH`) | AP panel | White |
| Weitere AP-Familien (`UAP*`, `U6*`, `U7*`, `E7*`, `UWB*`) | AP panel | White |

Unknown models are auto-detected by port count and fall back to a generic dark theme where possible.

### Notes

- Access points are supported via a dedicated AP panel (status/uptime/clients/reboot)
- Some models are still **layout-inferred** if no dedicated registry entry exists
- WAN / SFP handling for **UDM Pro** and **UDM SE** was improved in v0.2.x
- **US 16 PoE 150W** and **USW Pro 24** were added with dedicated layouts in v0.2.x

> [!NOTE]
> For best results, make sure the relevant UniFi switch and sensor entities are enabled in Home Assistant.  
> The card can only display and evaluate entities that are available from the UniFi Network Integration.

---

## Requirements

- Home Assistant with the **UniFi Network Integration** configured
- UniFi devices must appear under **Settings → Devices & Services → UniFi**

---

## Installation via HACS

1. Open **HACS** → **Frontend**
2. Click **⋮** → **Custom repositories**
3. Add:
   - **Repository:** `https://github.com/bluenazgul/unifi-device-card`
   - **Category:** `Dashboard`
4. Click **Add**, search for **UniFi Device Card** and install
5. Reload the browser (`Ctrl+Shift+R`)

---

## Manual Installation

1. Download `unifi-device-card.js` from the [latest release](../../releases/latest)
2. Copy to `/config/www/unifi-device-card.js`
3. Add the resource in HA under **Settings → Dashboards → Resources**:
   - URL: `/local/unifi-device-card.js`
   - Type: `JavaScript module`
4. Reload the browser

---

## Usage

Add via the dashboard UI editor — search for **UniFi Device Card** — or manually:

```yaml
type: custom:unifi-device-card
device_id: YOUR_DEVICE_ID
name: My Switch
background_color: "#1f2937"   # optional
```

## Troubleshooting

### Card not loading

Open the browser console (`F12`) and check for errors.

Verify the resource URL is correct:

- HACS: `/hacsfiles/unifi-device-card/unifi-device-card.js`
- Manual: `/local/unifi-device-card.js`

Try a hard refresh (`Ctrl+Shift+R`).

### Device not shown in the editor

Confirm the device appears under **Settings → Devices & Services → UniFi**.

The card logs debug output prefixed with `[unifi-device-card]` in the browser console showing why each device is accepted or rejected.

### Ports show as offline despite being connected

Check whether the UniFi Integration created matching entities for the device.

The card can use:

- direct link entities
- speed entities
- PoE power
- RX/TX traffic

Depending on the device model and firmware, not all signals may be available.

### Make sure UniFi entities are enabled

The card can only evaluate entities that Home Assistant actually provides.

If important UniFi entities are disabled, hidden, or not created by the integration, parts of the card may appear incomplete or incorrect.

For best results, make sure the relevant UniFi entities are enabled for the device, especially:

- port switch entities
- PoE switch entities
- PoE power sensors
- link speed sensors
- RX/TX traffic sensors
- power cycle buttons

In Home Assistant, check:

**Settings → Devices & Services → UniFi → Devices / Entities**

If required, enable the disabled entities there first.

### Renamed entities show no telemetry

Renamed entities are supported, but if Home Assistant entity registry data is stale, a reload of the integration or browser may help.

### Missing PoE controls

PoE controls are only shown if a PoE switch entity exists.

Ports that expose only `poe_power` sensors will still show consumption, but no PoE toggle button.

### Background color does not change

Check that:

- `background_color` is set in the card config
- the browser cache was refreshed
- the value is valid CSS, for example:
  - `#1f2937`
  - `red`
  - `var(--card-background-color)`
