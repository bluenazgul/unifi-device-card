# UniFi Device Card

<img width="993" height="544" alt="Screenshot" src="https://github.com/bluenazgul/unifi-device-card/blob/2e9fff1a4ccfdc226950513b9ca75e082bc31ff3/screenshots/Screenshot.png" />

A Home Assistant Lovelace custom card for UniFi switches and gateways — built on top of the official [UniFi Network Integration](https://www.home-assistant.io/integrations/unifi/).

No direct API access, no extra configuration. Just add the card and pick your device.

---

## Infos

This dashboard is based on my idea, but was created with the help of ChatGPT and Claude.ai and only tested with the UniFi devices I own:

- UCG-U
- US 8 60W
- USW Lite 8 PoE
- USW Lite 16 PoE
- USW Flex
- USW Ultra family

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
- **Built-in UI editor** — full card configuration without YAML
- **Supports renamed entities** — port telemetry still works even if entities were renamed in Home Assistant
- **Smarter link detection** — falls back to speed, PoE power, and RX/TX traffic when direct port link entities are missing
- **Optional card background color** — use the default Home Assistant card background or override it with your own color

---

## Supported Devices

### Switches — Utility / Flex / Mini

| Model | Ports | Panel |
|---|---|---|
| USW Flex Mini | 5 | White |
| USW Flex Mini 2.5G (`USW-Flex-2.5G-5`) | 5 | White |
| USW Flex | 5 | White |
| USW Flex 2.5G (`USW-Flex-2.5G-8`) | 8 | White |
| USW Flex XG | 4 + 1 SFP+ | White |

### Switches — 8 Port

| Model | Ports | Panel |
|---|---|---|
| US 8 | 8 | Silver |
| US 8 60W | 8 + 2 SFP | Silver |
| US 8 150W | 8 + 2 SFP | Silver |
| USW Lite 8 PoE | 8 | White |
| USW Pro 8 PoE | 8 + 2 SFP+ | Silver |
| USW Enterprise 8 PoE | 8 + 2 SFP+ | Silver |
| USW Pro XG 8 PoE | 8 + 2 SFP28 | Silver |

### Switches — 16 Port

| Model | Ports | Panel |
|---|---|---|
| USW Lite 16 PoE | 16 | White |
| USW 16 PoE (`USW-16-POE`) | 16 + 2 SFP | Silver |
| US 16 PoE 150W (`US16P150`) | 16 + 2 SFP | Silver |
| USW Pro Max 16 PoE | 16 + 2 SFP+ | Silver |
| USW Pro Max 16 | 16 + 2 SFP+ | Silver |
| USW Pro XG 10 PoE | 10 + 2 SFP28 | Silver |

### Switches — 24 Port

| Model | Ports | Panel |
|---|---|---|
| USW 24 PoE (`USW-24-POE`) | 24 + 2 SFP | Silver |
| USW 24 (`USW-24`) | 24 + 2 SFP | Silver |
| US 24 | 24 + 2 SFP | Silver |
| US 24 500W | 24 + 2 SFP | Silver |
| USW Pro 24 (`US24PRO2`, `USW-Pro-24`) | 24 + 2 SFP+ | Silver |
| USW Pro 24 PoE (`USW-Pro-24-POE`) | 24 + 2 SFP+ | Silver |
| USW Pro Max 24 PoE | 24 + 2 SFP+ | Silver |
| USW Pro Max 24 | 24 + 2 SFP+ | Silver |
| USW Pro HD 24 PoE | 24 + 4 SFP+ | Silver |
| USW Pro HD 24 | 24 + 4 SFP+ | Silver |
| USW Pro XG 24 PoE | 24 + 2 SFP28 | Silver |
| USW Pro XG 24 | 24 + 2 SFP28 | Silver |

### Switches — 48 Port

| Model | Ports | Panel |
|---|---|---|
| USW 48 PoE (`USW-48-POE`) | 48 + 4 SFP | Silver |
| USW 48 (`USW-48`) | 48 + 4 SFP | Silver |
| US 48 | 48 + 2 SFP + 2 SFP+ | Silver |
| US 48 500W | 48 + 2 SFP + 2 SFP+ | Silver |
| US 48 750W | 48 + 2 SFP + 2 SFP+ | Silver |
| USW Pro 48 (`USW-Pro-48`) | 48 + 4 SFP+ | Silver |
| USW Pro 48 PoE (`USW-Pro-48-POE`) | 48 + 4 SFP+ | Silver |
| USW Pro Max 48 PoE | 48 + 4 SFP+ | Silver |
| USW Pro Max 48 | 48 + 4 SFP+ | Silver |
| USW Enterprise 48 PoE | 48 + 4 SFP+ | Silver |
| USW Pro XG 48 PoE | 48 + 4 SFP28 | Silver |
| USW Pro XG 48 | 48 + 4 SFP28 | Silver |

### Switches — Ultra

| Model | Ports | Panel |
|---|---|---|
| USW Ultra | 7 + Uplink | White |
| USW Ultra 60W | 7 + Uplink | White |
| USW Ultra 210W | 7 + Uplink | White |

### Gateways — Desktop / Compact

| Model | Ports | Panel |
|---|---|---|
| Cloud Gateway Ultra (`UCG-Ultra`) | 4 LAN + WAN | White |
| Cloud Gateway Max (`UCG-Max`) | 4 LAN + WAN | White |
| Cloud Gateway Fiber (`UCG-Fiber`) | 4 LAN + SFP+ + WAN + SFP+ | White |
| Cloud Gateway Industrial (`UCG-Industrial`) | 5 LAN + SFP+ | Silver |
| Dream Router (`UDR`) | 4 LAN + WAN | White |
| Dream Router 7 (`UDR7`) | 3 LAN + WAN + SFP+ | White |
| UniFi Express (`UX`) | 1 LAN + WAN | White |
| UniFi Express 7 (`UX7`) | 1 LAN + SFP+ | White |
| UXG Lite | 1 LAN + WAN | White |
| UXG Max | 4 LAN + SFP+ | White |

### Gateways — Rack

| Model | Ports | Panel |
|---|---|---|
| UDM Pro | 8 LAN + WAN + 2 SFP+ | Silver |
| UDM SE | 8 LAN + WAN + 2 SFP+ | Silver |
| UDM Pro Max | 8 LAN + WAN + 2 SFP+ | Silver |
| UXG Pro | 2 RJ45 + 2 SFP+ | Silver |
| UXG Enterprise | 4 × 10G RJ45 + 2 SFP28 | Silver |
| Enterprise Fortress Gateway (`EFG`) | 8 × 10G RJ45 + 2 SFP28 | Silver |

Unknown models are auto-detected by port count and fall back to a generic layout.

Unknown models are auto-detected by port count and fall back to a generic dark theme where possible.

### Notes

- **Access Points are not supported** and are filtered automatically
- Some models are still **layout-inferred** if no dedicated registry entry exists
- WAN / SFP handling for **UDM Pro** and **UDM SE** was improved in v0.2.x

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
