# Changelog

## [v0.4.0] - 2026-04-09

### ✨ Improvements
- Added optional display-name toggle in the editor
- Display name is enabled by default and can be hidden via checkbox
- Display name now updates correctly when switching devices in the editor as long as it was not manually overridden
- Added optional header telemetry rows for CPU utilization, CPU temperature, and memory utilization
- Header telemetry rows are only shown when matching sensor entities exist and provide valid values
- Added reboot button in the card header next to the online port status
- Improved editor loading by de-duplicating in-flight device/entity/config-entry requests
- Improved front-panel rendering so ports look more like real RJ45 network ports instead of USB-style slots
- Improved SFP/SFP+ port appearance so uplink ports are visually distinguishable from RJ45 ports

### 🐛 Bug Fixes
- Prevented header telemetry rows from rendering empty placeholder values when sensors are missing
- Fixed device name handling so the initially selected device name does not remain permanently when changing to another device
- Reduced delays when UniFi devices are loaded in the editor
- Fix US-8-60W PoE Port detection

## [v0.3.7] - 2026-04-08

### ✨ Features
- Added support for USC8  → 8 Port Switch

## [v0.3.6] - 2026-04-08

### 🐛 Bug Fixes
- Fixed incorrect link status detection on ports reporting `10 Mbit/s`
- Fixed WAN port selection on gateway devices
- Fixed port remapping so reassigned WAN/WAN2 ports are shown correctly

### 🐛 known Bug
- in some cases slow Card rendering when changed WAN and WAN2 (help needed)

## [0.3.0] - 2026-04-07

### ✨ Features
- Added support for new devices (including correct model identification and naming)
  - US68P → USW Enterprise 8 PoE
  - US624P → USW Enterprise 24 PoE
  - US648P → USW Enterprise 48 PoE
  - USL8A → USW Aggregation
  - USAGGPRO → USW Pro Aggregation
  - USF5P → USW Flex
  - US8P150 → UniFi Switch 8 150W
  - US24PRO → USW Pro 24 PoE
  - US48PRO → USW Pro 48 PoE
  - US48PRO2 → USW Pro 48
  - USL16P → USW 16 PoE (Gen2)
  - USL24 → USW 24 (Gen2)
  - USL24P → USW 24 PoE (Gen2)
  - USL48 → USW 48 (Gen2)
  - USL48P → USW 48 PoE (Gen2)
  - UXGPRO → UXG-Pro
  - UXGL → UXG-Lite
  - UDMPROSE → UDM SE
  - UGW3 → UniFi Security Gateway
  - UGW4 → USG Pro 4

### 🐛 Bug Fixes
- Improve device detection
- Improve port detection
- Improve PoE port detection

## [v0.2.9] - 2026-04-07

### 🐛 Bug Fixes

- **clean rollback to stable 0.2.8 baseline**

## [v0.2.8] - 2026-04-06

### ✨ new Feature

- **first try to make the WAN Port selectable on Gateways**

## [v0.2.7] - 2026-04-06

### 🐛 Bug Fixes

- **Solve issue that UCG-U shows 6 LAN Ports but only has 5**

## [v0.2.5] - 2026-04-06

### 🐛 Bug Fixes

- **should fix WAN Port isues** if not i could need help here

- **maybe Theme fixing** if not i could need help here

## [v0.2.3] - 2026-04-06

### 🐛 Bug Fixes

- **Improved port link detection** — PoE no longer counts as a standalone link signal. Ports with RX/TX sensors at exactly `0` are now treated as offline unless another valid signal is present.

- **Power cycle button as conditional link hint** — On PoE-capable ports, an available power cycle button can now be used as an additional link hint when the PoE switch is enabled. This helps detect connected PoE devices more reliably.

- **Improved WAN port detection** — Gateway WAN entities using patterns such as `*_wan_port_*` are now detected more reliably, improving support for devices like the Cloud Gateway Ultra.

---

### ✨ Editor Improvements

- **Disabled or hidden entity warning for selected device** — The card editor now checks only the currently selected device for relevant UniFi entities that are disabled or hidden and shows a warning if this may affect card behavior.

- **Entity type summary in editor** — The warning groups affected entities by type, such as port switches, PoE controls, PoE power sensors, link speed sensors, RX/TX sensors, and power cycle buttons.

---

### 🧭 Troubleshooting Improvements

- **Better visibility of Home Assistant entity issues** — The editor now helps identify when missing controls or incomplete telemetry are caused by disabled or hidden UniFi entities in Home Assistant.

## [v0.2.2] - 2026-04-06

### 🐛 Bug Fixes

- **Card Background should use HA settings now**

## [v0.2.1] - 2026-04-06

### 🐛 Bug Fixes

- **Port link detection via PoE power and RX/TX traffic** — Ports without a usable link entity or speed sensor fallback could still be shown as offline even though they were actively powering a PoE device or carrying traffic. Link detection now also treats `poe_power > 0` and active RX/TX throughput as valid link signals.

- **False online state on WAN/SFP special ports** — Special WAN/SFP slots could report a false online state from negotiated speed alone, even when no real traffic was present. If RX/TX traffic entities are available, live traffic is now used as the decisive signal for these ports.

- **Disabled entities no longer create broken controls** — Home Assistant can expose entities disabled by the integration that have no live state in `hass.states`. These are now filtered out before rendering so missing or non-functional port/PoE buttons are no longer shown.

- **WAN/SFP slots on UDM Pro and UDM SE** — Special WAN/SFP slots were not correctly resolved to their underlying discovered ports and therefore appeared empty or offline. Special slots now resolve by real port number and are excluded from the normal numbered grid to prevent duplicate rendering.

- **Renamed port entities now resolve correctly** — Renamed port entities without `_port_N` in the `entity_id` could no longer be mapped back to a physical port. Missing `unique_id` values are now fetched on demand and used as an additional fallback for port number extraction.

- **RX/TX throughput formatting** — Numeric throughput values are now rounded to two decimal places for cleaner display.

---

### ✨ New Devices

- **US 16 PoE 150W (`US16P150`)** — Added dedicated model handling with a dual-row layout and SFP uplink slots.

- **USW Pro 24 (`US24PRO2`)** — Added dedicated model handling with a six-grid layout and SFP+ uplink slots.

---

### 🎨 UI / Visual Changes

- **USW 24 PoE layout** — Updated from `dual-row` (2 × 12) to `six-grid` (4 × 6) for a more accurate front panel representation.

- **Optional card background color** — The outer card background now defaults to the Home Assistant card background and can optionally be overridden via `background_color` in the card configuration/editor.

---

## [v0.2.0] - 2026-04-06

### 🐛 Bug Fixes

- **Port discovery for renamed entities** — Home Assistant 2022.6+ no longer includes `unique_id` in the WebSocket entity registry list. Port numbers for renamed port entities could no longer be resolved, causing ports to appear without data. Missing `unique_id`s are now fetched on demand via `config/entity_registry/get` and patched in before port discovery runs.

- **UDM Pro port count & special slots** — Port count corrected from 8 to 11. WAN/SFP special slots now carry explicit port numbers (9, 10, 11) so they are resolved from real port data instead of relying on fragile key matching. Slot keys updated to `wan`, `sfp_1`, `sfp_2`.

- **Special port online detection** — WAN and SFP uplink ports no longer show a false "online" state caused by stale link-speed sensors. If RX/TX bandwidth sensors are available, live traffic is used to determine whether the port is actually carrying data.

- **PoE status for ports without a switch entity** — Ports that expose only a `poe_power` sensor (no toggle switch) now correctly show PoE power consumption. The PoE toggle button is hidden for these ports instead of appearing non-functional.

- **Special slot port-label in detail panel** — Custom port labels (`port_label`) are now also shown for special slots (WAN, SFP) in the detail panel, not only for numbered ports.

- **Sensor value formatting** — Numeric sensor states are now rounded to two decimal places (e.g. `1.23 Mbit/s` instead of `1.2345678 Mbit/s`).

- **Special ports excluded from numbered port grid** — Ports that are mapped to a special slot by port number are now correctly excluded from the regular port grid to avoid duplicate rendering.

---

### ✨ New Devices

- **US 16 PoE 150W (`US16P150`)** — 16 RJ45 PoE ports in a dual-row layout (2 × 8) plus two dedicated SFP uplink slots (ports 17 & 18). Model aliases `US16P` and `US16P150` are both recognized.

- **USW Pro 24 (`US24PRO2`)** — 24 RJ45 ports in a six-grid layout (4 × 6) plus two dedicated SFP+ uplink slots (ports 25 & 26). Recognized via model strings `US24PRO2`, `US24PRO`, and `USWPRO24`.

---

### 🎨 UI / Visual Changes

- **USW 24 PoE layout** — Switched from a `dual-row` (2 × 12) layout to `six-grid` (4 × 6) for a more accurate representation of the physical front panel.

- **Port LED — PoE indicator** — The separate orange PoE LED has been replaced with a subtle ring highlight (`box-shadow`) on the link LED when PoE is active. This matches the visual style of real UniFi switches where a single LED indicates both link and PoE state through color and brightness rather than a second indicator. The PoE state remains fully visible in the port detail panel.

- **Port LED alignment** — LEDs are now centered within the port button instead of being spread to the edges.
