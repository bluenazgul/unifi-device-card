# Changelog

##[v0.2.1] — 2026-04-06

🐛 Bug Fixes
Port link detection via PoE power and RX/TX traffic (helpers.js — isOn, getPortLinkText)
Two edge cases were not covered by the v0.2.0 speed-entity fallback:

A port powering a PoE device (e.g. a U6 Mesh AP drawing 6.62 W) reported "Kein Link" because the link entity was missing and the speed entity returned 0. PoE power draw > 0 W now counts as a definitive link signal.
A port showing active RX/TX throughput was shown as OFFLINE. Active throughput > 0 Mbit/s now counts as a link signal.

Both isOn() and getPortLinkText() follow the same five-stage chain: link_entity → speed > 0 → PoE power > 0 → RX/TX > 0 → admin port enable.

SFP/WAN ports reporting false "online" (helpers.js — isOn, getPortLinkText)
A seated SFP+ module without a cable can report non-zero negotiated speed. For special slots that have RX/TX traffic entities, the speed check is now skipped — only live traffic counts as a confirmed link. (Issue #2 — Bug 4)

Port and PoE buttons missing or non-functional (helpers.js — getAllData, unifi-device-card.js)
HA creates entities with disabled_by: "integration" for features not active by default. These have no state in hass.states — the card rendered buttons that silently failed. getAllData() now filters to active-only entities. The card additionally guards each button with a stateObj() check before rendering.

WAN and SFP slots always empty/offline on UDMPRO and UDMSE (model-registry.js, helpers.js — mergeSpecialsWithLayout)
specialSlots had no port numbers, so mergeSpecialsWithLayout() could never match them to discovered port data. (Issue #2 — Bug 3, Issue #3)

UDMPRO and UDMSE now declare port numbers on special slots (WAN = 9, SFP+ 1 = 10, SFP+ 2 = 11).
mergeSpecialsWithLayout() now accepts discoveredPorts as third argument and does port-number lookup first.
mergePortsWithLayout() now excludes ports claimed by specialSlots to prevent double-rendering.


Missing model definitions for US 16 PoE 150W and USW Pro 24 (model-registry.js)
Both devices fell through to auto-infer with wrong layouts. (Issue #2 — Bug 1, Issue #3)

Added US16P150: dual-row (2x8), SFP slots on ports 17/18.
Added US24PRO2: six-grid (4x6), SFP+ slots on ports 25/26.
Updated USW24P from dual-row (2x12) to six-grid (4x6).
Extended resolveModelKey() and inferPortCountFromModel() with new patterns.


Renamed port entities showing no telemetry (helpers.js — getDeviceContext, extractPortNumber)
config/entity_registry/list does not return unique_id since HA 2022.6. Renamed port entities have no _port_N in entity_id, so extractPortNumber() failed silently. (Issue #2 — Bug 2)
getDeviceContext() now fetches the full registry entry for affected entities via config/entity_registry/get to retrieve unique_id. Only entities that need enrichment are fetched individually. extractPortNumber() also now parses port number from unique_id as fallback.

RX/TX throughput showing 17 decimal places (helpers.js — formatState)
formatState() now rounds numeric values to 2 decimal places (integers shown without decimal point). (Issue #3)

Changed

mergeSpecialsWithLayout() now accepts optional discoveredPorts as third argument (backwards compatible).
Action required in unifi-device-card.js: pass discoverPorts(ctx?.entities || []) as third argument to mergeSpecialsWithLayout() so WAN/SFP port-number lookup works.

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
