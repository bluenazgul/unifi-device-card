# UniFi Device Card

A Home Assistant Lovelace custom card for UniFi switches, gateways, access points, UPS devices, and SmartPower outlets. It uses the [UniFi Network integration](https://www.home-assistant.io/integrations/unifi/), which is included with Home Assistant, and the entities already registered in Home Assistant.

Add the card, pick a device, and configure common settings in the visual editor. YAML provides additional overrides for port names, LAG badges, link colors, and sensor mappings.

[Requirements](#requirements) · [Installation](#installation) · [Usage and YAML examples](#usage-and-yaml-examples) · [Configuration options](#configuration-options) · [Supported devices](#supported-devices) · [Troubleshooting](#troubleshooting) · [Screenshots](#screenshots) · [Development](#development)

## Features

- Model-specific front panels with RJ45/SFP link-speed and PoE indicators, port details, and available port controls.
- Access point layouts with status, uptime, clients, and reboot controls; supported hybrid devices also offer combined or network-only views.
- UPS front/back views with available battery/runtime readings and outlet controls; SmartPower Strip/PDU outlet overviews with AC/USB relays.
- Console outlet names, optional power badges, off confirmation, and visible command/state feedback.
- Automatic device and entity discovery, including renamed entities through stable UniFi identifiers.
- A visual editor, custom colors, optional link LED animation, and configurable port/outlet detail behavior.
- Automatic Sections sizing with optional Home Assistant `grid_options` overrides.
- Translations for English, German, Dutch, French, Spanish, Italian, Swedish, Danish, Norwegian, Finnish, Polish, and Czech.

## Requirements

- Home Assistant Core **2026.9.0 or newer** with the built-in **UniFi Network** integration configured
- UniFi devices must appear under **Settings → Devices & Services → UniFi Network**

> [!IMPORTANT]
> Starting with **v1.0.0**, upgrade Home Assistant to **2026.9.0 or newer** before updating the card. If you need to stay on an older Home Assistant version, keep the latest compatible **v0.8.x** card release.
> Existing card YAML and device selections do not need to be changed. Features still depend on the entities exposed by your configured UniFi Network integration; for example, UniFi UPS telemetry requires Home Assistant Core **2026.10** or newer.

## Installation

### HACS

1. Open **HACS** and search for **UniFi Device Card** in the **Dashboard** category.
2. Install the card and reload the browser/frontend.
3. Add **UniFi Device Card** to your dashboard and select your device.

If the card is unavailable in the normal search, add `https://github.com/bluenazgul/unifi-device-card` under **HACS → ⋮ → Custom repositories**, using the **Dashboard** category. Then search and install it as above.

#### Older Home Assistant versions

HACS checks the minimum Home Assistant version in the selected release's `hacs.json`. **v1.x requires Home Assistant Core 2026.9.0 or newer**; older **v0.8.x** releases retain their own requirements. HACS defaults to the newest release and does not automatically select the newest compatible version.

To install or keep a compatible v0.8.x release on an older Home Assistant version:

1. Find **UniFi Device Card** in HACS and open its **⋮** menu.
2. Select **Download** for a first installation or **Redownload** if the card is already installed.
3. Expand **Need a different version?** and select a compatible **v0.8.x** release, such as [v0.8.9](https://github.com/bluenazgul/unifi-device-card/releases/tag/v0.8.9).
4. Download it and reload the browser/frontend.

HACS rejects v1.x downloads on Home Assistant versions below 2026.9.0. After upgrading Home Assistant, select v1.x to update the card. See the [HACS version selection guide](https://www.hacs.xyz/docs/use/repositories/dashboard/#downloading-a-specific-version-of-a-repository).

HACS currently lists only the latest **30 releases**, so an older v0.8.x release may eventually disappear from the selection menu. Its GitHub release assets remain available: download `unifi-device-card.js` from the compatible release and follow the manual installation steps below.

### Manual installation

1. Download `unifi-device-card.js` from the [latest release](https://github.com/bluenazgul/unifi-device-card/releases/latest), or from a compatible **v0.8.x** release if your Home Assistant version is below **2026.9.0**.
2. Copy it to `/config/www/unifi-device-card.js`.
3. Add a resource under **Settings → Dashboards → Resources**, with URL `/local/unifi-device-card.js` and type **JavaScript module**.
4. Reload the browser and add the card to your dashboard.

## Usage and YAML examples

Start with the visual editor, or use this minimal YAML configuration:

```yaml
type: custom:unifi-device-card
device_id: YOUR_DEVICE_ID
```

`device_id` is the Home Assistant device registry ID, not an entity ID or MAC address. Select the device in the editor to populate it, or copy the final ID from its **Settings → Devices & Services** device-page URL.

The examples below are separate card configurations. Replace placeholder device/entity IDs with your own and choose options that apply to your model.

### Switch: names, LAG badges, and link LEDs

```yaml
type: custom:unifi-device-card
device_id: YOUR_SWITCH_DEVICE_ID
name: Office switch
default_uplink_port: auto
dynamic_port_details: false
port_name:
  1: Uplink
  3: Office AP
lag_groups:
  - name: NAS
    ports: [11, 12]
port_led_blink: true
port_led_blink_speed_rj45: 0.2
port_led_blink_speed_sfp: 0.5
link_color_10-100: "#efb21a"
link_color_1000: green
link_color_2.5g: orange
link_color_10g: white
```

Use physical port numbers that exist on your switch. `port_name` changes tooltips/detail headings; the printed front-panel port numbers stay unchanged. `lag_groups` adds visual badges only: configure the actual aggregation in UniFi Network. Blink intervals are seconds, so `0.2` means 5 blinks per second.

`default_uplink_port: auto` prefers an active designated uplink, then the first designated uplink, then the first port. For a specific initial port, use an exact selectable key from the editor; gateway `wan_port` selectors and manual `port_<n>` sensor mappings use different keys. Dynamic port details start with no selection and override initial port selection.

### Special row: replace or extend the model defaults

To replace the special row with physical ports 17 and 18 on a compatible switch:

```yaml
type: custom:unifi-device-card
device_id: YOUR_SWITCH_DEVICE_ID
edit_special_ports: true
special_ports: [17, 18]
```

An empty `special_ports: []` removes the special row in edit mode. To keep the model defaults and add ports 1 and 2 instead:

```yaml
type: custom:unifi-device-card
device_id: YOUR_SWITCH_DEVICE_ID
edit_special_ports: false
custom_special_ports: [1, 2]
```

These settings affect the display. They do not configure uplinks or change the device's UniFi port roles. `custom_special_ports` is ignored while edit mode is enabled.

### Gateway: assign WAN display roles

```yaml
type: custom:unifi-device-card
device_id: YOUR_GATEWAY_DEVICE_ID
edit_special_ports: true
wan_port: port_5
wan2_port: none
```

Select physical ports or slot keys offered by the editor for your gateway. `auto` keeps the model's default assignment; `none` removes a WAN/WAN2 display role. WAN settings change the card's layout, not the gateway's network configuration.

When the editor saves a non-`auto` `wan_port` or `wan2_port` value, it enables and persists `edit_special_ports`. The additive `custom_special_ports` option no longer applies after enabling edit mode.

### Access point: compact or integrated layout

```yaml
type: custom:unifi-device-card
device_id: YOUR_AP_DEVICE_ID
ap_compact_view: true
ap_scale: 90
show_telemetry: true
ap_compact_show_header_telemetry: true
```

For supported multi-port APs or hybrid gateway/AP devices, use `device_layout: combined`, `network`, or `ap`. Integrated AP port panels require at least two discovered ports. The older `integrated_ports: false` option selects AP-only mode when `device_layout` is unset.

### Custom card and button colors

```yaml
type: custom:unifi-device-card
device_id: YOUR_DEVICE_ID
background_color: "#1f2937"
background_opacity: 85
title_color: "#ffffff"
telemetry_color: "#d1d5db"
label_color: "#9ca3af"
value_color: "#f3f4f6"
meta_color: "#94a3b8"
button_theme_style: false
button_default_color: false
button_color: "#0090d9"
button_text_color: "#ffffff"
button_secondary_color: "#262b34"
button_secondary_text_color: "#e2e8f0"
button_border_color: "#3b4350"
```

Custom button colors require **both** `button_theme_style: false` and `button_default_color: false`. Other card colors are independent. Link LED overrides accept CSS color names or hex values; normal card color options also accept CSS tokens such as `var(--primary-color)`.

### UPS and SmartPower outlets

```yaml
type: custom:unifi-device-card
device_id: YOUR_UPS_DEVICE_ID
ups_layout: back
show_back_panel: false
dynamic_port_details: false
dynamic_outlet_details: true
outlet_power_badges: true
confirm_outlet_off: true
```

`ups_layout` selects a UPS front, back, or combined view. For SmartPower Strip/PDU, omit `ups_layout`; these devices always use the outlet overview. `show_back_panel: false` removes the outlet-panel background while keeping outlets visible.

Select an outlet, then use its separate on/off button. Labels prefer the Console names supplied by the integration. Real cards show only registered outlets; model/preview outlet counts do not create controllable outlets. A missing or unavailable relay cannot be controlled, while metering-only outlets can still show power.

`dynamic_outlet_details` controls outlet selection independently of RJ45 details. When unset, it inherits `dynamic_port_details` for compatibility. In the example, UPS RJ45 details remain visible until an outlet is selected and return when it is deselected. Set both dynamic options to `true` to initially collapse both kinds of details.

To start with a specific outlet selected, use:

```yaml
type: custom:unifi-device-card
device_id: YOUR_UPS_OR_SMARTPOWER_DEVICE_ID
dynamic_outlet_details: false
default_outlet: 3
outlet_power_badges: true
```

`default_outlet` uses the registered outlet index and falls back to the first available outlet if that index is missing. It is ignored while dynamic outlet details are enabled.

Outlet commands wait for Home Assistant to confirm the new state. Failures and missing confirmation after 10 seconds are displayed in the outlet details. `confirm_outlet_off` asks before turning an outlet off; turning it on requires no confirmation.

Readings depend on the entities exposed by your Home Assistant/UniFi version. Missing Strip/USB metering is normal. UPS battery/runtime readings and indicators follow the available telemetry; `show_telemetry: false` hides header/UPS readings while keeping outlet readings available. Load percentage requires matching whole-device AC consumption and a positive power budget in W/kW. The card does not infer load from model ratings or individual outlet readings.

The editor distinguishes disabled entities, unavailable states, and entities not exposed by the integration. Hidden enabled outlet entities remain usable.

### Manual link-speed sensor mapping

Use a manual override only when automatic port mapping fails:

```yaml
type: custom:unifi-device-card
device_id: YOUR_DEVICE_ID
port_5: sensor.office_switch_port_5_link_speed
```

The key identifies an existing physical port. The referenced sensor must belong to that port and be enabled/available in Home Assistant. The card may find matching RX/TX and PoE entities with the same sensor-name prefix, but the override does not create missing entities.

### Local model previews

Enable **Fake Device** in the editor and select a model to preview its layout without real hardware. Preview outlet controls change local example states and never call Home Assistant services. The editor stores `fake_device: true` and the corresponding `fake:<MODEL_KEY>` device ID; turn preview mode off before selecting a real device.

## Configuration options

Unset options use the defaults below. Model-specific settings take effect only where the relevant layout or entities exist. The table identifies YAML-only options and retained compatibility aliases.

### General and card layout

| Key | Type | Default | Description |
|---|---|---|---|
| `device_id` | string | — | Home Assistant device registry ID of the UniFi device. |
| `name` | string | device name | Custom display name shown in card header (if `show_name` is enabled). |
| `show_name` | boolean | `true` | Show/hide the header title line. |
| `show_telemetry` | boolean | `true` | Show/hide header telemetry. On UPS cards, also controls the battery summary, battery indicators, and UPS readings; on SmartPower cards, controls whole-device AC readings. Outlet readings remain available. |
| `show_panel` | boolean | `true` | Show/hide the visual front panel area. |
| `background_opacity` | number | `100` | Background transparency in percent (`0` = transparent, `100` = opaque). |
| `grid_options` | object | automatic | Home Assistant Sections layout override, for example `{columns: 24, rows: auto}`. This option is handled by Home Assistant. |

### Colors and button style

| Key | Type | Default | Description |
|---|---|---|---|
| `background_color` | string | `var(--card-background-color)` | Any valid CSS color/token. |
| `title_color` | string | theme default | Optional title text color. |
| `telemetry_color` | string | theme default | Optional header telemetry color (including device-specific UPS/AC readings). |
| `label_color` | string | theme default | Optional detail/panel label color. |
| `value_color` | string | theme default | Optional detail value color (except fixed link-status state colors). |
| `meta_color` | string | theme default | Optional model/firmware subtitle color. |
| `port_label_color` | string | theme default | Optional front-panel port number label color. |
| `special_port_label_color` | string | theme default | Optional special-port label color (for special row labels like WAN and the selected special port headline). |
| `ap_led_color` | string | model default | AP only: optional LED fallback color used when no RGB LED color is provided by entities. |
| `ap_color` | string | model default | AP only: optional AP body color override. |
| `ap_ring_color` | string | model default | AP only: optional AP outer ring color override. |
| `ap_inner_color` | string | model default | AP only: optional AP inner circle color override. |
| `button_theme_style` | boolean | `true` | Use Home Assistant theme colors for card buttons. |
| `button_default_color` | boolean | `true` | Use the card's built-in default button colors when theme button style is disabled. |
| `button_color` | string | default/theme | Custom button background color when theme and default button colors are disabled. |
| `button_text_color` | string | default/theme | Custom button text/icon color when theme and default button colors are disabled. |
| `button_secondary_color` | string | default/custom primary | Optional custom secondary button background color. |
| `button_secondary_text_color` | string | default/custom primary | Optional custom secondary button text/icon color. |
| `button_border_color` | string | default/theme | Optional custom secondary button border color. |
| `link_color_10-100` | string | amber | YAML-only link LED color override for 10/100 Mbps; accepts a CSS color word or hex value. |
| `link_color_1000` | string | green | YAML-only link LED color override for 1 GbE; accepts a CSS color word or hex value. |
| `link_color_2.5g` | string | amber | YAML-only link LED color override for 2.5 GbE; accepts a CSS color word or hex value. |
| `link_color_10g` | string | white | YAML-only link LED color override for both 5 and 10 GbE; accepts a CSS color word or hex value. |

### Network ports

| Key | Type | Default | Description |
|---|---|---|---|
| `dynamic_port_details` | boolean | `false` | Network port details, including UPS management ports: starts without a selected port, shows details after a port click, and hides them when that port is clicked again. |
| `default_uplink_port` | string | unset | Switch/Gateway and compatible In-Wall AP port sections: initial detail port behavior. Leave unset for the existing first-port behavior, use `auto` to prefer an active selectable port, or copy a selectable port key from the editor (for example `sfp_1` or `uplink`; keys depend on the model). Ignored while dynamic port details are enabled. Switches and gateways restrict choices to designated uplinks. |
| `port_name` | object | `{}` | YAML-only port-number-to-name mapping for tooltips and detail headings. Front-panel port numbers remain unchanged. |
| `lag_groups` | array<object> | `[]` | YAML-only visual grouping for LAG members. Each group requires at least two unique positive port numbers and may have a `name`; configured members receive a `LAG` badge and group name without changing their independently detected link, speed, traffic, or PoE states. A port can belong to only the first valid configured group. |
| `port_<n>` | string | auto | YAML-only manual link-speed sensor mapping, for example `port_5: sensor.office_port_5_link_speed`. Applies to an existing physical port; does not create ports or entities. |
| `trust_link_speed_ports` | array<number> | `[]` | Ports whose positive link-speed value is trusted even at 10 Mbit/s. By default, the RJ45 ghost-link guard treats speeds up to and including 10 Mbit/s as disconnected when no link, traffic, client, or PoE signal confirms the connection. Select only ports with a genuine 10 Mbit/s link; `0`, `unknown`, and `unavailable` remain disconnected. |
| `port_led_blink` | boolean | `false` | Enables a purely visual blink animation for connected RJ45/SFP link LEDs without changing link detection, telemetry, or port controls. |
| `port_led_blink_rj45` | boolean | `true` | Enables blinking for connected RJ45 link LEDs when `port_led_blink` is enabled. |
| `port_led_blink_sfp` | boolean | `true` | Enables blinking for connected SFP link LEDs when `port_led_blink` is enabled. |
| `port_led_blink_speed_rj45` | number | `1` | RJ45 blink interval in seconds (`0.1` to `1`, corresponding to 10–1 blinks/s). Falls back to `port_led_blink_speed` if unset. The editor defaults to `0.2` (5 blinks/s) when enabling the feature. |
| `port_led_blink_speed_sfp` | number | `1` | SFP blink interval in seconds (`0.1` to `1`, corresponding to 10–1 blinks/s). The legacy `port_led_blink_speed` remains supported as a shared fallback. |
| `port_led_blink_speed` | number | `1` | Legacy shared blink interval in seconds (`0.1`–`1`). A media-specific interval takes precedence. Prefer the RJ45/SFP options for new configurations. |
| `rotate180` | boolean | `false` | Switch/Gateway only: rotates the front-panel layout by 180° (`false`/`true`). |
| `ports_per_row` | number | auto | Positive integer row width override (editor range `1`–`24`) for switch layouts and compatible In-Wall AP integrated-port sections. Without it, a model with declared rows keeps them, and only single-row fallbacks use 8 per row. |
| `force_sequential_ports` | boolean | `false` | Switch/Gateway only: disables odd/even row rendering and keeps ports in natural numeric order. |
| `port_size` | number | `36` | Port size in pixels (`24`–`52`) for switch/gateway front panel rendering and compatible In-Wall AP port sections (special and numbered ports are unified). |
| `edit_special_ports` | boolean | `false` | Switch/Gateway only: enables WAN/WAN2 selectors and manual special-port editing in the UI/editor. |
| `special_ports` | array<number> | auto | Switch/Gateway only: with `edit_special_ports: true`, explicit physical port numbers shown in the top special row; non-selected ports render in the normal grid. |
| `custom_special_ports` | array<number> | `[]` | YAML-only: add physical port numbers to the model-default special row when `edit_special_ports` is disabled. Use `special_ports` with edit mode to replace the row instead. |
| `wan_port` | string | auto | Gateway only: assign WAN role (`auto`, `none`, slot key like `wan`, or `port_<n>`). |
| `wan2_port` | string | auto | Gateway only: assign WAN2 role (`auto`, `none`, slot key, or `port_<n>`). |

### Access points and hybrid devices

| Key | Type | Default | Description |
|---|---|---|---|
| `device_layout` | string | `combined` | Supported hybrid gateways/APs and multi-port APs: `combined`, `network`, or `ap`. The legacy `integrated_ports: false` remains an AP-only alias. |
| `integrated_ports` | boolean | `true` | Legacy AP-only alias for compatible In-Wall and supported multi-port APs: show discovered Ethernet ports below the normal AP panel. Set `false` for AP-only rendering when `device_layout` is unset. Multi-port AP panels require at least two ports reported by Home Assistant. |
| `ap_scale` | number | `100` | AP device scale in percent (`25`-`140`) for every AP design, including model-specific shaped devices in normal and compact AP layouts. |
| `ap_compact_view` | boolean | `false` | AP and supported hybrid devices: renders a compact side-by-side layout with the AP image and status details in one row. |
| `ap_compact_show_header_telemetry` | boolean | `false` | AP and supported hybrid devices: keeps CPU/memory/temperature header telemetry visible in compact AP view when `show_telemetry` is enabled. |

### UPS and SmartPower outlets

| Key | Type | Default | Description |
|---|---|---|---|
| `ups_layout` | string | `combined` | UPS only: `combined` for front and back, `front` for the front with telemetry, or `back` for outlets and network ports with telemetry. |
| `show_back_panel` | boolean | `true` | UPS/SmartPower: show the outlet-panel background. Set `false` to hide the background while keeping outlets and any UPS network ports visible. |
| `dynamic_outlet_details` | boolean | `false` / port setting | UPS/SmartPower: start without selected outlet details; click an outlet to show status, available power telemetry, and controls, then click it again to hide the details. Independent of RJ45 port details. If unset, existing `dynamic_port_details` YAML settings remain a fallback for outlets. |
| `default_outlet` | integer | first available | UPS/SmartPower: initially selected registered outlet index when dynamic outlet details are disabled. Falls back to the first available outlet if the configured index is missing. |
| `outlet_power_badges` | boolean | `false` | UPS/SmartPower: show available power readings directly on outlet buttons. |
| `confirm_outlet_off` | boolean | `false` | UPS/SmartPower: require confirmation before turning an outlet off. |

### Logging and previews

| Key | Type | Default | Description |
|---|---|---|---|
| `log_level` | string | `warn` | Per-card runtime log level in browser console: `error`, `warn`, `info`, `debug`, `trace`. |
| `debug` | boolean | `false` | Shorthand for enabling debug logging (`true` behaves like `log_level: debug` if `log_level` is unset or invalid). |
| `fake_device` | boolean | `false` | Preview mode: select a model in the editor instead of a registered device. Requires a `fake:<MODEL_KEY>` device ID; preview controls change only local example states. |

## Supported Devices

| Model | Ports | Panel |
|---|---|---|
| UPS 2U Pro (`USPDA2B`) | 8 outlets + 1 management RJ45 | Silver rack |
| UPS 2U (`USWDA25`) | 8 outlets + 1 management RJ45 | Silver rack |
| UPS Tower (`USWDA24`) | 10 outlets + 1 management RJ45 | White tower |
| SmartPower Strip (`UP6`, `USP-Strip`) | 6 AC outlets + 1 shared USB group | Outlet overview |
| SmartPower PDU Pro (`USPPDUP`, `USP-PDU-Pro`) | 16 AC outlets + 4 USB outlets | Outlet overview |
| UniFi Switch Compact 8 (`USC8`) | 8 | Silver |
| UniFi Switch 8 (`US8`) | 8 | Silver |
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
| US-24-250W (`US24P250`) | 24 + 2 SFP | Silver |
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
| US-16-XG (`USXG`) | 4 + 12 SFP+ | Silver |
| USW Flex XG (`USWFLEXXG`) | 4 + Uplink | White |
| US XG 6 PoE (`USXG6POE`) | 6 | Silver |
| USW WAN / WAN RJ45 (`USWWAN`, `USWWANRJ45`) | 4 | Silver |
| USW Mission Critical (`USWMISSIONCRITICAL`) | 9 | Silver |
| USW Industrial (`USWINDUSTRIAL`) | 8 + 2 SFP+ | Silver |
| USW Aggregation (`USL8A`) | 8 SFP+ | Silver |
| USW Pro Aggregation (`USAGGPRO`) | 28 SFP+ + 4 SFP28 | Silver |
| USW Ultra (`USWULTRA`) | 8 | White |
| USW Ultra 60W (`USWULTRA60W`) | 8 | White |
| USW Ultra 210W (`USWULTRA210W`) | 8 | White |
| USW Pro XG 8 PoE (`USWPROXG8POE`) | 8 + 2 SFP+ | Silver |
| USW Pro XG 10 PoE (`USWPROXG10POE`) | 10 + 2 SFP+ | Silver |
| USW Pro XG 24 / 24 PoE (`USWPROXG24`, `USWPROXG24POE`) | 24 + 2 SFP+ | Silver |
| USW Pro XG 48 / 48 PoE (`USWPROXG48`, `USWPROXG48POE`) | 48 + 4 SFP+ | Silver |
| USW Pro HD 24 / 24 PoE (`USWPROHD24`, `USWPROHD24POE`) | 24 + 4 SFP+ | Silver |
| Enterprise Campus 24 PoE / 24S PoE (`ECS24POE`, `ECS24SPOE`) | 24 + 4 SFP28 | Silver |
| Enterprise Campus 48 PoE / 48S PoE (`ECS48POE`, `ECS48SPOE`) | 48 + 4 SFP28 | Silver |
| Enterprise Campus Aggregation (`ECSAGGREGATION`) | 32 SFP28 | Silver |
| UniFi Cable Internet (`UCI`) | 1 LAN | Silver |
| Enterprise Fortress Gateway (`EFG`) | Gateway ports | Silver |
| Dream Machine Pro Max (`UDMPROMAX`) | 8 + WAN/SFP+ | Silver |
| Dream Machine Beast (`UDMBEAST`) | 8 + WAN/SFP+ | Silver |
| Dream Router 7 (`UDR7`) | 3 + WAN (RJ45) + SFP+ WAN | White |
| Cloud Gateway Ultra (`UCGULTRA`, `UDRULT`) | 4 + WAN | White |
| Cloud Gateway Max (`UCGMAX`) | 4 + WAN | White |
| Cloud Gateway Fiber (`UCGFIBER`) | 4 + WAN + 2 SFP+ | White |
| Cloud Gateway Industrial (`UCGINDUSTRIAL`) | 4 + WAN + SFP+ | White |
| Dream Machine (`UDM`) | 4 + WAN | White |
| Dream Router (`UDR`) | 4 + WAN | White |
| UDM Pro (`UDMPRO`) | 8 + WAN/SFP+ | Silver |
| UDM SE (`UDMPROSE`) | 8 + WAN/SFP+ | Silver |
| UniFi Express / Express 7 (`UX`, `UX7`) | LAN + WAN | White |
| Dream Router 5G Max (`UDR5GMAX`) | 4 + WAN | White |
| Dream Wall (`UDW`) | Integrated WiFi + 12 PoE LAN + 2.5 GbE WAN + 2 SFP+ | White |
| UXG Max (`UXGMAX`) | 4 + WAN | White |
| UniFi Travel Router (`UTR`) | LAN + WAN | White |
| UXG-Pro (`UXGPRO`) | 2 + WAN + SFP+ | Silver |
| UXG-Lite (`UXGL`) | 1 + WAN | White |
| UniFi Security Gateway (`UGW3`) | 2 + WAN | White |
| USG Pro 4 (`UGW4`) | 2 + WAN + 2 SFP | Silver |
| USG XG 8 (`UGWXG`) | 8 + WAN | Silver |

### Access Point Designs

| Design | Explicitly recognized models | Display behavior |
|---|---|---|
| Round AP | UAP, UAP-LR, UAP-Pro, UAP AC/Lite/LR/Pro, nanoHD, HD, XG, SHD, U6 Lite/LR/Pro/Plus/Enterprise, U7 Pro/Pro Max/LR/Lite/Pro XG/Pro XGS | Standard scalable circular HTML AP face and safe fallback for unknown APs |
| Wall / In-Wall | UniFi AP In-Wall (`UAPIW`), UAP AC In-Wall (`UAPACIW`), UAP AC In-Wall Pro (`UAPACIWPRO`), UAP In-Wall HD (`UAPIWHD`), U6 In-Wall (`U6IW`), U6 Enterprise In-Wall (`U6ENTERPRISEIW`), U7 Pro Wall (`U7PROWALL`), U7 In-Wall (`U7IW`), U7 Pro XG Wall (`U7PROXGWALL`) | Scalable rectangular HTML device face; integrated port section is available only on models that expose switch ports |
| Mesh column | FlexHD, U6 Mesh, U7 Mesh | Identical tall, rounded scalable enclosure for all three models, with the LED ring around the top cap |
| Antenna mesh | UAP-Outdoor5 | Scalable narrow enclosure with external antennas |
| AC Mesh | UAP AC Mesh | Scalable slim capsule enclosure with two long angled antennas |
| U6 Mesh Pro | U6 Mesh Pro | Scalable narrow rectangular enclosure with a horizontal front LED |
| Outdoor panel | UAP AC Mesh Pro, UK Ultra | Scalable weatherproof panel enclosure |
| Extender | BeaconHD, U6 Extender | Scalable wall-plug extender enclosure |
| Device Bridge Pro Sector | UDB-Pro-Sector | Scalable tall rounded sector enclosure without a front LED |
| Building Bridge | UBB, UBB XG | Scalable circular enclosure with LED status shown as an edge glow and no front LED |
| Device Bridge | UDB | Scalable tall enclosure with five vertical front status LEDs and an upper antenna connector |
| Device Bridge IoT | UDB-IoT | Scalable compact enclosure with five vertical front status LEDs and a tall upper antenna |
| Device Bridge Pro | UDB-Pro | Scalable circular enclosure with LED status shown as an edge glow and no front LED |
| Bridge | U-AirWire, Device Bridge Switch | Scalable directional bridge enclosure |
| E7 | E7, U7 Enterprise, E7 Campus | Scalable rounded-square enclosure; LED status is rendered as an edge glow because the front has no visible LED |
| E7 Audience | E7-Audience | Scalable wide rounded enclosure with a lower center connection and LED edge glow; no front LED is shown |
| WiFi BaseStation XG | UWB-XG | Scalable wide enclosure with lower antenna connections and an LED edge glow |
| U7 Outdoor | U7 Outdoor (`U7OUTDOOR`, `UKPW`), U7 Pro Outdoor (`U7PROOUTDOOR`) | Dedicated scalable outdoor enclosure with lower status LED |
| 5G Backup | UniFi 5G Backup (`UMBBE634`) | Dedicated scalable HTML device and display with signal bars, uptime, CPU, and RAM |

Unknown models from the `UAP*`, `U6*`, `U7*`, `E7*`, `UWB*`, `UDB*`, `UBB*`, `UMBB*`, `UK*`, and related AP families fall back to the round AP design.

Unknown switches are auto-detected by port count and use the silver/dark hardware design (`#c4c5c8`). Explicitly recognized desktop switches use the white design. These are the two UniFi device color variants and are independent of the selected Home Assistant theme.

> [!NOTE]
> For best results, make sure the relevant UniFi switch and sensor entities are enabled in Home Assistant.  
> The card can only display and evaluate entities that are available from the UniFi Network integration.

---

## Troubleshooting

### Card not loading

Open the browser console (`F12`) and check for errors.

Verify the resource URL is correct:

- HACS: `/hacsfiles/unifi-device-card/unifi-device-card.js`
- Manual: `/local/unifi-device-card.js`

Try a hard refresh (`Ctrl+Shift+R`).

### Device not shown in the editor

Confirm the device appears under **Settings → Devices & Services → UniFi Network**.

The card can log runtime output in the browser console with `UNIFI-DEVICE-CARD` prefix and colorized levels.

Example:

```yaml
type: custom:unifi-device-card
device_id: YOUR_DEVICE_ID
log_level: debug
```

For noisy traces, use `log_level: trace`. For quiet production usage, keep the default `warn`.

### Ports show as offline despite being connected

Check whether the UniFi Network integration created matching entities for the device.

The card can use:

- direct link entities
- speed entities
- PoE power
- RX/TX traffic

Depending on the device model and firmware, not all signals may be available.

### Make sure UniFi entities are enabled

The card can only evaluate entities that Home Assistant actually provides.

Disabled or unexposed entities can leave parts of the card incomplete. Hidden enabled outlet entities remain usable; hiding an entity is different from disabling it.

For best results, make sure the relevant UniFi entities are enabled for the device, especially:

- port switch entities
- PoE switch entities
- PoE power sensors
- link speed sensors
- RX/TX traffic sensors
- power cycle buttons

In Home Assistant, check:

**Settings → Devices & Services → UniFi Network → Devices / Entities**

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

This information helps distinguish a missing model layout from entities the integration does not expose.

### Background color does not change

Check that:

- `background_color` is set in the card config
- the browser cache was refreshed
- the value is valid CSS, for example:
  - `#1f2937`
  - `red`
  - `var(--card-background-color)`

## Screenshots

<details>
<summary>Configuration, switch/gateway, and AP examples</summary>

<img alt="Screenshot" src="https://github.com/bluenazgul/unifi-device-card/blob/6c31b16aebb9bc744ba871ce10cf0b4e2d90536b/screenshots/Screenshot%20Config%201.png" />
<img alt="Screenshot" src="https://github.com/bluenazgul/unifi-device-card/blob/6c31b16aebb9bc744ba871ce10cf0b4e2d90536b/screenshots/Screenshot%20Config%202.png" />
<img alt="Screenshot" src="https://github.com/bluenazgul/unifi-device-card/blob/6c31b16aebb9bc744ba871ce10cf0b4e2d90536b/screenshots/Screenhot%20Config%203.png" />

UCG-U with **show_panel: true** (default) [additional used *background_opacity: 35*]

<img alt="Screenshot" src="https://github.com/bluenazgul/unifi-device-card/blob/6c31b16aebb9bc744ba871ce10cf0b4e2d90536b/screenshots/Screenshot%20UCG-U-with_Panel.png" />

USW-Lite-16-PoE with **force_sequential_ports: false** (default) [additional used *background_opacity: 35 / show_panel: false*]

<img alt="Screenshot" src="https://github.com/bluenazgul/unifi-device-card/blob/0dc4ffbd92ae473074e31ad2292a9e0ab17c14cf/screenshots/Screenshot%20USW-Lite-16-PoE%20odd-even.png" />

USW-Lite-16-PoE with **force_sequential_ports: true** (optional)  [additional used *background_opacity: 35 / show_panel: false*]

<img alt="Screenshot" src="https://github.com/bluenazgul/unifi-device-card/blob/6c31b16aebb9bc744ba871ce10cf0b4e2d90536b/screenshots/Screenshot%20USW-Lite-16-PoE-wihtout_Panel.png" />


Normal AP Card Layout **ap_compact_view: false** (default) [additional used *background_opacity: 35*]

<img alt="Screenshot" src="https://github.com/bluenazgul/unifi-device-card/blob/fc2fae00697035b608feb18c4b24900b3c98a286/screenshots/AP%20Card%20normal.png" />

Compact AP Card Layout **ap_compact_view: true** (optional) [additional used *background_opacity: 35*]

<img alt="Screenshot" src="https://github.com/bluenazgul/unifi-device-card/blob/0dc4ffbd92ae473074e31ad2292a9e0ab17c14cf/screenshots/AP%20Card%20Compact.png" />

</details>

## Development

Use **Node.js 24**. Install the locked dependencies and run the same checks used by CI:

```sh
npm ci
npm test
npm run lint
npm run build
```

`npm test` runs every `tests/*.mjs` regression script, including registry/model discovery, AP layouts, port selection, LAG/link colors, UPS/SmartPower rendering and controls, and release-note extraction. Tests mock Home Assistant and do not replace validation on real hardware.

The build writes the distribution bundle to `dist/unifi-device-card.js`. Its development version includes the current commit; release workflows bake in the requested release version. Source changes belong in `src`; generated bundles are maintained by the build/release workflows.

Pull requests target `develop`. CI runs the full test suite, bundle build, ESLint, HACS validation, and CodeQL. Stable and development release workflows also run tests and lint before creating their bundle and tag.

Use the **Create Dev Release** workflow with `1.0.0` (or `v1.0.0`) to prepare `v1.0.0-dev` from `develop`. The **Create Release** workflow uses the repository's stable default branch and accepts `1.0.0` or `v1.0.0`. Both read the matching base version's changelog section.

## About and support

I created this card with help from ChatGPT to bring important UniFi information into one dashboard. Hardware testing has covered the devices I own: UCG-U, US 8 60W, USW Lite 8/16 PoE, USW Flex, AC Mesh, AC Pro, U6+, and U6 Mesh. Other supported layouts also have automated regression checks.

For improvements, issues, or new device support, please [open an issue](https://github.com/bluenazgul/unifi-device-card/issues) or a pull request.

If you like this project and want to support my work, you can donate via PayPal or buy me a coffee.

<a href="https://www.paypal.me/bluenazgul">
  <img
    src="https://raw.githubusercontent.com/stefan-niedermann/paypal-donate-button/master/paypal-donate-button.png"
    alt="Donate with PayPal"
    width="220"
  />
</a>

<a href="https://www.buymeacoffee.com/bluenazgul" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me a Coffee" style="height: 60px !important;width: 217px !important;" ></a>
