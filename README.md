# UniFi Device Card

<img width="993" height="544" alt="Screenshot" src="https://github.com/bluenazgul/unifi-device-card/blob/2e9fff1a4ccfdc226950513b9ca75e082bc31ff3/screenshots/Screenshot.png" />

A Home Assistant Lovelace custom card for UniFi switches and gateways — built on top of the official [UniFi Network Integration](https://www.home-assistant.io/integrations/unifi/).

No direct API access, no extra configuration. Just add the card and pick your device.

---

## Features

- **Realistic front-panel view** — ports laid out exactly as on the physical device, dual-row for 16-port switches, quad-row for 48-port models
- **Device-accurate styling** — white panel for USW Lite / Flex Mini / UCG, silver for US 8 / UDM Pro / UDM SE
- **Per-port dual LED indicators** — left LED: PoE status (orange = active), right LED: link speed (green = 1 Gbit, orange = 100 Mbit)
- **Port detail panel** — click any port to see link status, speed, PoE state, PoE power draw, and available actions
- **PoE toggle & Power Cycle** — directly from the card, no extra helpers needed
- **Live port counter** — connected / total shown in the header chip
- **Automatic device detection** — finds all UniFi switches and gateways registered in HA
- **Built-in UI editor** — full card configuration without YAML

---

## Supported Devices

| Model | Ports | Panel |
|---|---|---|
| USW Flex Mini | 5 | White |
| USW Lite 8 PoE | 8 | White |
| USW Lite 16 PoE | 16 | White |
| US 8 60W | 8 | Silver |
| USW 24 PoE | 24 | Silver |
| USW 48 PoE | 48 | Silver |
| Cloud Gateway Ultra | 4 + WAN | White |
| Cloud Gateway Max | 5 + WAN | White |
| UDM Pro | 8 + WAN/SFP | Silver |
| UDM SE | 8 + WAN/SFP | Silver |

Unknown models are auto-detected by port count and fall back to a generic dark theme.

---

## Requirements

- Home Assistant with the **UniFi Network Integration** configured
- UniFi devices must appear under **Settings → Devices & Services → UniFi**

---

## Installation via HACS

1. Open **HACS** → **Frontend**
2. Click **⋮** → **Custom repositories**
3. Add:
   - **Repository:** `https://github.com/YOUR_USERNAME/unifi-device-card`
   - **Category:** `Dashboard`
4. Click **Add**, search for **UniFi Device Card** and install
5. Reload the browser (Ctrl+Shift+R)

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
name: My Switch   # optional, overrides the device name
```

### Finding your device_id

**Settings → Devices & Services** → open the UniFi device → **⋮** → **Copy device ID**

---

## How it works

The card reads data exclusively from Home Assistant entities created by the UniFi Network Integration — no direct connection to the controller is needed. It automatically discovers port entities by parsing entity IDs:

| Entity pattern | Meaning |
|---|---|
| `switch.*_port_N` | Link state — `on` = port connected |
| `switch.*_port_N_poe` | PoE toggle |
| `sensor.*_port_N_poe_power` | PoE power draw (W) |
| `sensor.*_port_N_*_link_speed` | Port speed (Mbit) |
| `button.*_port_N_power_cycle` | Power cycle action |

---

## Development

```
src/
  unifi-device-card.js          main card element
  unifi-device-card-editor.js   visual config editor
  helpers.js                    HA entity discovery & state helpers
  model-registry.js             per-model layout, port rows & theme
```

Push to `main` to trigger the build workflow which rebuilds `dist/unifi-device-card.js`. Use the **Create Release** workflow to publish a versioned release for HACS.

```bash
npm install
npm run build
```

---

## Troubleshooting

**Card not loading**
Open the browser console (F12) and check for errors. Verify the resource URL is `/hacsfiles/unifi-device-card/unifi-device-card.js`. Try a hard refresh (Ctrl+Shift+R).

**Device not shown in the editor**
Confirm the device appears under **Settings → Devices & Services → UniFi**. The card logs debug output prefixed with `[unifi-device-card]` in the browser console showing why each device is accepted or rejected.

**Ports show as offline despite being connected**
Check that the UniFi Integration has created `switch.*_port_*` entities for your device. Some models or firmware versions may expose port state differently — open an issue with your entity list.

---

## License

MIT
