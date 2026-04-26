# UniFi Device Card


Config Screenshots
<img alt="Screenshot" src="https://github.com/bluenazgul/unifi-device-card/blob/6c31b16aebb9bc744ba871ce10cf0b4e2d90536b/screenshots/Screenshot%20Config%201.png" />
<img alt="Screenshot" src="https://github.com/bluenazgul/unifi-device-card/blob/6c31b16aebb9bc744ba871ce10cf0b4e2d90536b/screenshots/Screenshot%20Config%202.png" />
<img alt="Screenshot" src="https://github.com/bluenazgul/unifi-device-card/blob/6c31b16aebb9bc744ba871ce10cf0b4e2d90536b/screenshots/Screenhot%20Config%203.png" />

UCG-U with **show_panel: true** (default) [additional used *background_opacity: 35*]

<img alt="Screenshot" src="https://github.com/bluenazgul/unifi-device-card/blob/6c31b16aebb9bc744ba871ce10cf0b4e2d90536b/screenshots/Screenshot%20UCG-U-with_Panel.png" />

USW-Lite-16-PoE with **force_sequential_port: false** (default) [additional used *background_opacity: 35 / show_panel: false*]

<img alt="Screenshot" src="https://github.com/bluenazgul/unifi-device-card/blob/0dc4ffbd92ae473074e31ad2292a9e0ab17c14cf/screenshots/Screenshot%20USW-Lite-16-PoE%20odd-even.png" />

USW-Lite-16-PoE with **force_sequential_port: true** (optional)  [additional used *background_opacity: 35 / show_panel: false*]

<img alt="Screenshot" src="https://github.com/bluenazgul/unifi-device-card/blob/6c31b16aebb9bc744ba871ce10cf0b4e2d90536b/screenshots/Screenshot%20USW-Lite-16-PoE-wihtout_Panel.png" />


Normal AP Card Layout **ap_compact_view: false** (default) [additional used *background_opacity: 35*]

<img alt="Screenshot" src="https://github.com/bluenazgul/unifi-device-card/blob/fc2fae00697035b608feb18c4b24900b3c98a286/screenshots/AP%20Card%20normal.png" />

Compact AP Card Layout **ap_compact_view: true** (optional) [additional used *background_opacity: 35*]

<img alt="Screenshot" src="https://github.com/bluenazgul/unifi-device-card/blob/0dc4ffbd92ae473074e31ad2292a9e0ab17c14cf/screenshots/AP%20Card%20Compact.png" />


A Home Assistant Lovelace custom card for UniFi switches, gateways, and access points — built on top of the official [UniFi Network Integration](https://www.home-assistant.io/integrations/unifi/).

No direct API access, no extra configuration. Just add the card and pick your device.

---

## Infos

This dashboard is based on my idea, but was created with the help of ChatGPT and only tested with the UniFi devices I own:

- UCG-U
- US 8 60W
- USW Lite 8 PoE
- USW Lite 16 PoE
- USW Flex
- AC Mesh
- AC Pro
- U6+
- U6 Mesh

The idea behind this card was to create a single place to gather the most important information about UniFi devices, so you do not have to open the excellent UniFi app for every small detail. Since there was nothing like this available, I decided to get creative.

If you see improvements, issues, or fixes, feel free to open an issue or create a pull request.

If you like this project and want to support my work, you can donate via PayPal.

<a href="https://www.paypal.me/bluenazgul">
  <img
    src="https://raw.githubusercontent.com/stefan-niedermann/paypal-donate-button/master/paypal-donate-button.png"
    alt="Donate with PayPal"
    width="220"
  />
</a>

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
- **Advanced color editor step** — configure background/title/telemetry/labels/values/model+firmware/port labels with live preview and per-slot reset
- **AP-native card background behavior** — AP cards can stay transparent like native Home Assistant cards unless a custom background color is configured

---

## Supported Devices

| Model | Ports | Panel |
|---|---|---|
| UniFi Switch Compact 8 (`USC8`) | 8 | Silver |
| UniFi Switch 8 60W (`US8P60`) | 8 | Silver |
| UniFi Switch 8 150W (`US8P150`) | 8 + 2 SFP | Silver |
| UniFi Switch 16 PoE 150W (`US16P150`) | 16 + 2 SFP | Silver |
| USW Flex Mini (`USMINI`) | 4 + Uplink | White |
| USW Flex (`USF5P`) | 4 + Uplink | White |
| USW Flex 2.5G 5 (`USWFLEX25G5`) | 4 + Uplink | White |
| USW Flex 2.5G 8 (`USWFLEX25G8`) | 8 + Uplink + 1 SFP | White |
| USW Flex 2.5G 8 PoE (`USWFLEX25G8POE`) | 8 + Uplink + 1 SFP | White |
| USW Lite 8 PoE (`USL8LP`, `USL8LPB`) | 8 | White |
| USW Lite 16 PoE (`USL16LP`, `USL16LPB`) | 16 | White |
| USW 16 PoE (`USL16P`) | 16 + 2 SFP | Silver |
| USW 24 (`USL24`) | 24 + 2 SFP | Silver |
| USW 24 PoE (`USL24P`, `USL24PB`, `USW24P`) | 24 + 2 SFP | Silver |
| USW 48 (`USL48`) | 48 + 4 SFP | Silver |
| USW 48 PoE (`USL48P`, `USW48P`) | 48 + 4 SFP | Silver |
| USW Pro 24 PoE (`US24PRO`) | 24 + 2 SFP+ | Silver |
| USW Pro 24 (`US24PRO2`) | 24 + 2 SFP+ | Silver |
| USW Pro 48 PoE (`US48PRO`) | 48 + 4 SFP+ | Silver |
| USW Pro 48 (`US48PRO2`) | 48 + 4 SFP+ | Silver |
| USW Pro Max 16 (`USPM16`) | 16 + 2 SFP+ | Silver |
| USW Pro Max 16 PoE (`USPM16P`) | 16 + 2 SFP+ | Silver |
| USW Pro Max 24 (`USPM24`) | 24 + 2 SFP+ | Silver |
| USW Pro Max 24 PoE (`USPM24P`) | 24 + 2 SFP+ | Silver |
| USW Pro Max 48 (`USPM48`) | 48 + 4 SFP+ | Silver |
| USW Pro Max 48 PoE (`USPM48P`) | 48 + 4 SFP+ | Silver |
| USW Enterprise 8 PoE (`US68P`) | 8 + 2 SFP+ | Silver |
| USW Enterprise 24 PoE (`US624P`) | 24 + 2 SFP+ | Silver |
| USW Enterprise 48 PoE (`US648P`) | 48 + 4 SFP+ | Silver |
| USW Enterprise XG 24 (`USXG24`) | 24 + 2 SFP+ | Silver |
| USW Industrial (`USWINDUSTRIAL`) | 8 + 2 SFP+ | Silver |
| USW Aggregation (`USL8A`) | 8 SFP+ | Silver |
| USW Pro Aggregation (`USAGGPRO`) | 28 SFP+ + 4 SFP28 | Silver |
| USW Ultra (`USWULTRA`) | 8 | White |
| USW Ultra 60W (`USWULTRA60W`) | 8 | White |
| USW Ultra 210W (`USWULTRA210W`) | 8 | White |
| Dream Router 7 (`UDR7`) | 3 + WAN (RJ45) + SFP+ WAN | White |
| Cloud Gateway Ultra (`UCGULTRA`, `UDRULT`) | 4 + WAN | White |
| Cloud Gateway Max (`UCGMAX`) | 4 + WAN | White |
| Cloud Gateway Fiber (`UCGFIBER`) | 4 + WAN + 2 SFP+ | White |
| Dream Machine (`UDM`) | 4 + WAN | White |
| Dream Router (`UDR`) | 4 + WAN | White |
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
| U6 Extender (`U6EXTENDER`) | AP panel | White |
| U7 In-Wall (`U7IW`) | AP panel | White |
| U7 Mesh (`U7MSH`) | AP panel | White |
| U7 LR (`U7LR`) | AP panel | White |
| U7 Lite (`U7LITE`) | AP panel | White |
| U7 Pro XG (`U7PROXG`) | AP panel | White |
| U7 Pro XGS (`U7PROXGS`) | AP panel | White |
| U6 Mesh Pro (`U6MESHPRO`) | AP panel | White |
| Weitere AP-Familien (`UAP*`, `U6*`, `U7*`, `E7*`, `UWB*`) | AP panel | White |

Unknown models are auto-detected by port count and fall back to a generic dark theme where possible.

### Notes

- Access points are supported through a generic AP panel (status/uptime/clients/reboot)
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
title_color: "#ffffff"        # optional
telemetry_color: "#d1d5db"    # optional
label_color: "#9ca3af"        # optional
value_color: "#f3f4f6"        # optional
meta_color: "#94a3b8"         # optional (model + firmware line)
port_label_color: "#6b7280"   # optional
background_opacity: 85        # optional (0-100)
show_name: true               # optional (default: true)
show_panel: true              # optional (default: true)
rotate180: false              # optional (default: false) | true flips the switch/gateway front panel by 180°
ports_per_row: 8              # optional (switches only)
force_sequential_ports: false # optional (switch/gateway only; disable odd/even layout)
port_size: 36                 # optional (switch/gateway front panel scale in px)
ap_scale: 100                 # optional (AP size in %, 25-140)
ap_compact_view: false        # optional (AP only; side-by-side compact AP layout)
ap_compact_show_header_telemetry: false # optional (AP only; show header telemetry also in compact AP view)
log_level: warn               # optional (error|warn|info|debug|trace)
debug: false                  # optional shorthand (true => debug log level)
edit_special_ports: false     # optional (switch/gateway only)
special_ports: [1, 2, 9]      # optional (switch/gateway only)
wan_port: auto                # optional (gateway only)
wan2_port: none               # optional (gateway only)
```

### Configuration options

| Key | Type | Default | Description |
|---|---|---|---|
| `device_id` | string | — | Home Assistant device registry ID of the UniFi device. |
| `name` | string | device name | Custom display name shown in card header (if `show_name` is enabled). |
| `show_name` | boolean | `true` | Show/hide the header title line. |
| `background_color` | string | `var(--card-background-color)` | Any valid CSS color/token. |
| `title_color` | string | theme default | Optional title text color. |
| `telemetry_color` | string | theme default | Optional header telemetry color (CPU, memory, temperature values/labels). |
| `label_color` | string | theme default | Optional detail/panel label color. |
| `value_color` | string | theme default | Optional detail value color (except fixed link-status state colors). |
| `meta_color` | string | theme default | Optional model/firmware subtitle color. |
| `port_label_color` | string | theme default | Optional front-panel port number label color. |
| `background_opacity` | number | `100` | Background transparency in percent (`0` = transparent, `100` = opaque). |
| `show_panel` | boolean | `true` | Show/hide the visual front panel area. |
| `rotate180` | boolean | `false` | Switch/Gateway only: rotates the front-panel layout by 180° (`false`/`true`). |
| `ports_per_row` | number | auto | Optional row width override for switch layouts. |
| `force_sequential_ports` | boolean | `false` | Switch/Gateway only: disables odd/even row rendering and keeps ports in natural numeric order. |
| `port_size` | number | `36` | Port size in pixels for switch/gateway front panel rendering (special and numbered ports are unified). |
| `ap_scale` | number | `100` | AP device scale in percent (`25`-`140`) for AP card mode. |
| `ap_compact_view` | boolean | `false` | AP only: renders a compact side-by-side layout with AP image and status details in one row. |
| `ap_compact_show_header_telemetry` | boolean | `false` | AP only: keeps CPU/memory/temperature header telemetry visible in compact AP view. |
| `log_level` | string | `warn` | Per-card runtime log level in browser console: `error`, `warn`, `info`, `debug`, `trace`. |
| `debug` | boolean | `false` | Shorthand for enabling debug logging (`true` behaves like `log_level: debug` if `log_level` is not set). |
| `edit_special_ports` | boolean | `false` | Switch/Gateway only: enables WAN/WAN2 selectors and manual special-port editing in the UI/editor. |
| `special_ports` | array<number> | auto | Switch/Gateway only: explicit port numbers shown in the top special row; non-selected ports render in the normal grid. |
| `wan_port` | string | auto | Gateway only: assign WAN role (`auto`, slot key like `wan`, or `port_<n>`). |
| `wan2_port` | string | auto | Gateway only: assign WAN2 role (`auto`, `none`, slot key, or `port_<n>`). |

> If `wan_port` or `wan2_port` is set in YAML, `edit_special_ports` is automatically treated as enabled in the editor and persisted.

### YAML notes for `port_*` keys

- `port_*: sensor.*_link_speed` can be used as a manual fallback if automatic mapping fails after port renaming in Home Assistant.
- Example: `port_5: sensor.<device>_port_5_link_speed`.
- Use this only when a renamed port is no longer automatically assigned to the correct physical port.
- Keep key and sensor port number aligned (for example `port_5` → `..._port_5_link_speed`) to avoid mismatched telemetry.

## Troubleshooting

### Card not loading

Open the browser console (`F12`) and check for errors.

Verify the resource URL is correct:

- HACS: `/hacsfiles/unifi-device-card/unifi-device-card.js`
- Manual: `/local/unifi-device-card.js`

Try a hard refresh (`Ctrl+Shift+R`).

### Device not shown in the editor

Confirm the device appears under **Settings → Devices & Services → UniFi**.

The card can log runtime output in the browser console with `UNIFI-DEVICE-CARD` prefix and colorized levels.

Example:

```yaml
type: custom:unifi-device-card
device_id: YOUR_DEVICE_ID
log_level: debug
```

For noisy traces, use `log_level: trace`. For quiet production usage, keep the default `warn`.

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

### `port_*` remap does not work (compact checklist)

1. Check YAML syntax: `port_<n>: sensor.*_link_speed`.
2. Verify the referenced sensor exists and has state updates in Home Assistant.
3. Confirm key and sensor belong to the same physical port number (`port_5` ↔ `..._port_5_link_speed`).
4. Save YAML, reload dashboard/card, then verify mapping in the port detail panel.
5. If still wrong, open **Developer Tools → States** and verify the configured `sensor.*_link_speed` entity is available and updating for that exact device.

If remapping still fails after port renaming, the configured `sensor.*_link_speed` entity is usually missing, disabled, or still tied to a different physical port than expected.

### Bug report for unsupported/new UniFi devices

If you want me to add clean support for a new device model, please include the following in your issue:

- **UniFi device name** as shown in Home Assistant / UniFi Controller
- **UniFi model identifier** (for example `USW...`, `UCG...`, `UDM...`, `U7...`)
- **RJ45 port count** (LAN/WAN if relevant)
- **SFP/SFP+/SFP28 port count**
- Optional but very helpful:
  - Which ports should be treated as special slots (WAN, WAN2, uplink)
  - Screenshot/photo of the physical front panel
  - Example entity IDs (especially `switch.*_port_*` and `sensor.*_link_speed`)

This is the minimum data needed to map the model correctly in `model-registry.js` and let helper logic in `helpers.js` detect and render ports reliably.

### Background color does not change

Check that:

- `background_color` is set in the card config
- the browser cache was refreshed
- the value is valid CSS, for example:
  - `#1f2937`
  - `red`
  - `var(--card-background-color)`
