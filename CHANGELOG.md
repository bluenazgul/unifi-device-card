# Changelog

## [Unreleased]

### ✨ Improvements
- Add a dedicated “Change colors” editor step with live card preview, per-color popup picker (including alpha), per-slot reset, and global reset-all action.
- Add optional YAML color keys for `title_color`, `telemetry_color`, `label_color`, `value_color`, `meta_color`, and `port_label_color`.
- Add color slot/key `special_port_label_color` to style special port labels (for example WAN) and special-port detail titles.
- Improve color-step layout: move card transparency control above background color and add extra spacing for better readability.
- Add AP-specific color slots for outer ring and inner circle, plus LED fallback color (auto-disabled in editor when RGB LED control is available).

### 🐛 Bug Fixes
- Fix gateway classification for `USG-XG-8` / `UGWXG` aliases so gateway-specific behavior is applied reliably even without gateway-like names.
- Fix AP classification for legacy `U5O` (`UAP-Outdoor5`) aliases so these devices remain visible in the editor when capability signals are limited.
- Harden dynamic template rendering in card/editor by consistently escaping interpolated HTML text and attribute values (including warnings, gateway option labels, header/detail metrics, and entity-derived values).



If you see improvements, issues, or fixes, feel free to open an issue or create a pull request.

If you like this project and want to support my work, you can donate via PayPal.

<a href="https://www.paypal.me/bluenazgul">
  <img
    src="https://raw.githubusercontent.com/stefan-niedermann/paypal-donate-button/master/paypal-donate-button.png"
    alt="Donate with PayPal"
    width="220"
  />
</a>

## [v0.6.7]

### ✨ Improvements
- Improved editor/card responsiveness during create/edit/save by increasing short-lived registry/device-context cache windows, reducing repeated reload delays.
- add AP compact header telemetry toggle to UI Editor

### 🐛 Bug Fixes
- Improve detection of legacy Switches and AccessPoints



If you see improvements, issues, or fixes, feel free to open an issue or create a pull request.

If you like this project and want to support my work, you can donate via PayPal.

<a href="https://www.paypal.me/bluenazgul">
  <img
    src="https://raw.githubusercontent.com/stefan-niedermann/paypal-donate-button/master/paypal-donate-button.png"
    alt="Donate with PayPal"
    width="220"
  />
</a>

## [v0.6.6] - 2026-04-21

### 🐛 Bug Fixes
- Hotfix for legacy AP model detection so `UAP` / `UAP LR` aliases are resolved reliably (including legacy controller model keys like `BZ2` and `BZ2LR`).



If you see improvements, issues, or fixes, feel free to open an issue or create a pull request.

If you like this project and want to support my work, you can donate via PayPal.

<a href="https://www.paypal.me/bluenazgul">
  <img
    src="https://raw.githubusercontent.com/stefan-niedermann/paypal-donate-button/master/paypal-donate-button.png"
    alt="Donate with PayPal"
    width="220"
  />
</a>

## [v0.6.5] - 2026-04-21

### ✨ Improvements
- Add AP-only `ap_compact_view` option with an editor checkbox to render AP cards in a compact side-by-side layout
- Hide the AP size slider while compact view is enabled and extend AP size range to 25–140 for normal AP view
- Add optional YAML flag `ap_compact_show_header_telemetry` to keep AP header telemetry visible in compact view

### 🐛 Bug Fixes
- Added per-model AP LED fallback colors so legacy models (`UAP`, `UAP-LR`, `UAP-Outdoor5`) use green when no LED RGB/color entity is available.
- Restore header telemetry discovery for switch/AP devices by resolving telemetry entities from the full device entity set.



If you see improvements, issues, or fixes, feel free to open an issue or create a pull request.

If you like this project and want to support my work, you can donate via PayPal.

<a href="https://www.paypal.me/bluenazgul">
  <img
    src="https://raw.githubusercontent.com/stefan-niedermann/paypal-donate-button/master/paypal-donate-button.png"
    alt="Donate with PayPal"
    width="220"
  />
</a>

## [0.6.2] - 2026-04-20

### ✨ Improvements
- Include Respect explicit 'special_ports' config to allow show all ports in an single row (like Uplink (Port1) on USW-Flex-mini)
- Add force_sequential_ports option to disable odd/even port layout

### 🐛 Bug Fixes
- Included fixes from [PR #130](https://github.com/bluenazgul/unifi-device-card/pull/130): clear SFP sticky state when speed entity is absent or unavailable . Thanks to @DAE51D.



If you see improvements, issues, or fixes, feel free to open an issue or create a pull request.

If you like this project and want to support my work, you can donate via PayPal.

<a href="https://www.paypal.me/bluenazgul">
  <img
    src="https://raw.githubusercontent.com/stefan-niedermann/paypal-donate-button/master/paypal-donate-button.png"
    alt="Donate with PayPal"
    width="220"
  />
</a>

## [0.6.1] - 2026-04-20

### 🐛 Bug Fixes
- Included fixes from [PR #125](https://github.com/bluenazgul/unifi-device-card/pull/125): stabilized SFP link-state handling and restored support for explicit row-layout behavior. Thanks to @DAE51D.



If you see improvements, issues, or fixes, feel free to open an issue or create a pull request.

If you like this project and want to support my work, you can donate via PayPal.

<a href="https://www.paypal.me/bluenazgul">
  <img
    src="https://raw.githubusercontent.com/stefan-niedermann/paypal-donate-button/master/paypal-donate-button.png"
    alt="Donate with PayPal"
    width="220"
  />
</a>

## [0.6.0] - 2026-04-16

### ✨ Improvements
- Refactored sensor/entity handling to a device-registry + capability driven flow (identity/capability/unique_id/classify modules) for more robust detection across UniFi setups.
- Added odd/even RJ45 front-panel layout support for models that expose alternating row orientation hints.
- Added richer tooltip support:
  - AP uplink tooltip with wired/mesh context and peer details.
  - Port mouseover tooltip with client count/name hints (when available from HA entities).
- Added configurable per-card debug logging in browser console with colorized log output and YAML-configurable log levels (`log_level`, `debug`).

### 🐛 Bug Fixes
- Added RJ45 ghost-link guard so idle 10 Mbit reports without traffic/clients/PoE are no longer treated as connected.



If you see improvements, issues, or fixes, feel free to open an issue or create a pull request.

If you like this project and want to support my work, you can donate via PayPal.

<a href="https://www.paypal.me/bluenazgul">
  <img
    src="https://raw.githubusercontent.com/stefan-niedermann/paypal-donate-button/master/paypal-donate-button.png"
    alt="Donate with PayPal"
    width="220"
  />
</a>

## [0.5.91] - 2026-04-15

### ✨ Improvements
- Added new optional YAML key `rotate180` (`false` default / `true`) for switch and gateway front-panel rotation.
  - right-to-left row order,
  - special ports moved to the bottom,
  - rotated front-panel area aligned to the right.

## [0.5.90] - 2026-04-14

### ✨ Improvements
- Added an Uplink Info on AP Card to show the current Uplink Device of an AccessPoint

## [0.5.81] - 2026-04-14

### 🐛 Bug Fixes
- Refined SFP media detection to distinguish SFP, SFP+, and SFP28 based on explicit slot/entity hints.
- Avoided false SFP+ rendering for generic `10G` hints so 10GbE RJ45 ports are no longer misclassified as SFP+.
- Hardened fallback model/layout detection to reduce AP misclassification for unresolved gateway/switch-like devices.
- Confirmed UDM Pro SE alias handling (`UDMSE` → `UDMPROSE`) remains active for gateway detection/layout mapping.

## [0.5.80] - 2026-04-13

### ✨ Improvements
- Added optional header metric for a generic device temperature sensor (shown only when available and valid).
- Improved metric rendering to avoid duplicate header entries when multiple metric slots resolve to the same entity.
- Added translation key for the new temperature metric across all existing language blocks.

### 🐛 Bug Fixes
- Fixed special-port link detection so only SFP/SFP28 special slots prefer live RX/TX traffic over negotiated link speed, preserving ghost-link protection without forcing WAN/WAN2/uplink into traffic-only evaluation.
- Fixed gateway WAN/WAN2 override remapping to retain entities when a selected special slot (for example UDR7 SFP+ WAN) is resolved by key, preventing false `no_link` on mapped WAN special ports with valid link/traffic sensors.
- Fixed accidental disabled WAN2/LAN2 on USG3P.
- Fixed SFP connector rendering so SFP/SFP+ ports keep SFP-style visualization based on slot metadata and no longer fall back to RJ45 styling in override/selection edge cases.

## [0.5.7] - 2026-04-13

### ✨ Improvements
- Added missing `USM8P60`, `USM8P210`, `USM8P` alias handling for USW Ultra Switches

### 🐛 Bug Fixes
- complete UniFi port telemetry mapping and SFP/PoE behavior polish PR [#93](https://github.com/bluenazgul/unifi-device-card/pull/93) thanks to @DAE51D
- Fixes: Idle ports show as connected due to 10 Mbit/s ghost link speed Issue [#81](https://github.com/bluenazgul/unifi-device-card/issues/81) thanks to @DAE51D

## [v0.5.6] - 2026-04-12

### ✨ Improvements
- Added explicit non-PoE `USW Pro Max 16` (`USPM16`) model mapping and switch classification, including 16x RJ45 + 2x SFP+ port layout fallback.
- Improved `USW-24` / `USW-48` fallback model resolution so generic identifiers now default to non-PoE variants, while explicit `...P`/`...PoE` identifiers still resolve to PoE models.
- Added missing `SWITCHPRO48` alias handling (plus `SWITCHPRO24`/`SWITCHPRO48` fallback port-count inference) for better alignment with alternate UniFi/aiounifi naming variants.
- Added additional alias support checks from recent device reports: `U7MSH`/`U7MESH` → `U7 Mesh` AP model and `USL24PB`/`USL48PB` → PoE switch variants.
- Improved port-entity detection regex for LAN/ETH/SFP identifiers with compact numbering (for example `lan1`/`eth1`) to better detect active ports on devices like `USG-3P` (`UGW3`) when entity naming differs.
- Extended shared port-id detection used by switch/gateway classification and telemetry heuristics to also recognize `lan1`/`eth1`/`sfp1` naming variants (not only `_port_#`), reducing model-specific edge cases.

## [v0.5.5] - 2026-04-12

### ✨ Improvements
- Added dedicated model recognition and layouts for additional UniFi switch families: Pro Max 16/24/48 (including PoE variants), Enterprise XG 24, and USW Industrial.
- Added dedicated gateway recognition/layouts for Dream Machine (`UDM`) and Dream Router (`UDR`) with explicit WAN mapping.
- Expanded AP model recognition with dedicated aliases for `U7 Pro XG`, `U7 Pro XGS`, and `U6 Mesh Pro`.
- Extended helper-side type detection lists so newly added model keys are classified consistently as switch/gateway in editor and card context loading.
- Added static PoE-In uplink mappings in model registry for known PoE-In switches (including Flex/Flex Mini/Flex 2.5G and Ultra families).
- Corrected Flex-family uplink ports: `USMINI` → port 1, `USWFLEX25G5` → port 5, `USF5P` → port 1, `USWFLEX25G8`/`USWFLEX25G8POE` → port 9.

## [v0.5.4] - 2026-04-12

### 🐛 Bug Fixes
- Fixed UDR7 (`UDM67A (UDR7)`) model recognition so devices containing both `UDM67A` and `UDR7` are still resolved as UDR7 where appropriate.
- Improved UDR7 / UDM-Pro (`UDMPRO`) disambiguation for `UDM67A`-based identifiers in device detection and layout selection.
- Fixed UDR7 SFP (port 5) rendering when used as WAN special port so it keeps SFP visualization instead of falling back to RJ45.
- Preserved physical special-port identity during WAN/WAN2 remapping to avoid wrong connector type display and link-status confusion on remapped special ports.
- Improved UDMPROSE/UDMSE active-port discovery by accepting additional aiounifi-style port entity patterns (for example `*_lan_*` / `*_eth_*` / `*_sfp_*`) in port extraction and port-entity classification.

## [v0.5.3] - 2026-04-12

### 🐛 Bug Fixes
- Included fixes from [PR #70](https://github.com/bluenazgul/unifi-device-card/pull/70): normalized link-speed unit handling for port LED status and improved connected-link detection for low negotiated speeds.
- Added model alias detection for `UDM67A` so devices exposed as `UDM67A (UDR7)` are resolved to `UDR7` correctly.
- Added fallback port-count inference for `UDM67A` to keep Dream Router 7 detection at 5 total ports even when only the alias is present.

## [v0.5.2] - 2026-04-12

### 📚 Documentation
- Added README YAML guidance for `port_*: sensor.*_link_speed` fallback remapping when automatic assignment breaks after port renaming.
- Added a compact troubleshooting checklist for failed manual `port_*` remapping.
- Clarified troubleshooting validation to use Home Assistant **Developer Tools → States** for device-specific sensor verification.
- Added README bug-report guidance for new/unsupported devices (device name, model ID, RJ45/SFP port counts, and useful entity examples) to support clean model mapping.

## [v0.5.1] - 2026-04-11

### ⚠️ Breaking / behavior change
- Updated 16-port and 24-port default front-panel row layouts to contiguous ordering (16p: `1-8 / 9-16`, 24p: `1-8 / 9-16 / 17-24`). Existing cards keep working, but visual port placement changed compared to previous odd/even and 4×6 layouts.

### ✨ Improvements
- Added editor controls for front panel visibility and ports-per-row override, so these values are written to card YAML config.
- Updated fallback and known 24-port switch layouts to use the 3×8 front-panel arrangement.
- Added editor sliders for `port_size` (switch/gateway) and `ap_scale` (AP mode), both persisted to YAML config.
- Unified special and numbered switch/gateway port visual size so both use the same base port size.
- Reduced AP panel top/bottom spacing and kept AP visual centered with scalable AP size.
- `show_panel: false` now renders switch/gateway frontpanel backgrounds transparent instead of retaining the device color.
- Editor now shows the AP scale slider only for AP devices, and the port size slider only for switch/gateway devices.
- AP panel height now scales with the configured AP size so changing `ap_scale` adjusts both device size and AP section height.
- Added `edit_special_ports` + `special_ports` configuration support for switch/gateway cards, including YAML persistence and editor controls.
- Moved WAN/WAN2 selector visibility under “Edit special ports” to keep the editor cleaner (WAN roles are treated as part of special-port editing).
- Replaced multi-select special-port editing with click-to-toggle port chips (no CMD/CTRL modifier needed).

### 🐛 Bug Fixes
- Fixed editor warning-message flicker by avoiding repeated warning checks on every Home Assistant state refresh when the selected device did not change.
- Ensured `ports_per_row` layout overrides are applied consistently in both card rendering and editor context loading.
- Added model alias detection for `USWED35` so it resolves to `USW Flex Mini 2.5G` (`USWFLEX25G5`) instead of a generic switch.
- Improved front-panel sizing behavior so default port size no longer forces overly wide layouts on narrow cards (auto-fit applies when `port_size` is not explicitly set; explicit slider/YAML values keep their exact size).
- Added row-cap fallback on narrow cards: when configured columns do not fit, rows are repacked to the maximum visible column count so ports stay fully visible without horizontal scrolling.
- Added additional AP model/alias detection for `U6 Extender` (`U6EXTENDER`), `U7 In-Wall` (`U7IW`), `U7 LR` (`U7LR`), and `U7 Lite` (`U7LITE`) to improve reliable AP recognition in Home Assistant naming variants.
- Fixed UniFi device-list filtering so APs (including `U6 Pro`) are no longer dropped when they are linked to the UniFi config entry but expose only weak/partial entity signals.
- Fixed editor focus handling so text fields and sliders keep focus while typing/dragging instead of losing focus after each config change.
- Fixed special-port editing so existing special ports are preselected when edit mode is enabled and can be deselected to render as normal ports again.
- Ensured all ports remain visible exactly once when switching ports between special and numbered areas (no duplicates, no disappearing ports).
- Ensured setting `wan_port`/`wan2_port` in YAML automatically enables and persists `edit_special_ports`.

## [v0.4.7] - 2026-04-10

### ✨ Improvements
- Added dedicated model support for USW Flex 2.5G 5 (`USWFLEX25G5`) in the card layouts and device detection

## [v0.4.6] - 2026-04-10

### ✨ Improvements
- Added dedicated model support for USW Flex 2.5G 8 PoE (`USWFLEX25G8POE`) with 9 RJ45 ports, 1 SFP uplink slot, and PoE range handling (ports 1-9)
- Updated Dream Router 7 (`UDR7`) layout to 5 total ports (3 LAN + RJ45 WAN + SFP+ WAN) with RJ45 port 4 as default WAN

### 🐛 Bug Fixes
- Corrected fallback port-count inference for `USWFLEX25G8POE` (10 ports total) and `UDR7` (5 ports total)

## [v0.4.5] - 2026-04-10

### ✨ Improvements
- Added model detection and dedicated gateway layout support for Dream Router 7 (`UDR7`)
- Added broad UniFi Access Point model mapping and assignment (`UAP*`, `U6*`, `U7*`, `E7*`, `UWB*`) in model registry/device resolution
- Only one single AP Style used for all kind of APs
- Improved AP detection heuristics in helper logic to better classify APs even with varying model/entity naming
- Added AP-specific card UI behavior updates (localized uptime/clients labels, transparent HA-like AP card background behavior)
- Updated editor/device support wording to include Access Points

### 🐛 Bug Fixes
- Improved AP online-state and AP telemetry/entity pattern matching for mixed naming schemes from Home Assistant/UniFi integration

## [v0.4.1] - 2026-04-09

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
