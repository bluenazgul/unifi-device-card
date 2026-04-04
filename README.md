# UniFi Device Card

A Home Assistant Lovelace custom card for UniFi devices.

Current scope:
- UniFi switches with a compact port grid
- UniFi gateways and consoles such as UCG and UDM with a summary view
- built-in visual config editor
- device picker that tries to show only UniFi devices from Home Assistant

This repository is structured to be usable as a **HACS custom repository** right away.

## HACS install

1. Push this repository to GitHub.
2. In Home Assistant, open **HACS**.
3. Open the menu in the top right and choose **Custom repositories**.
4. Add your GitHub repository URL.
5. Select repository type **Dashboard**.
6. Install **UniFi Device Card**.
7. Refresh the browser.

HACS custom repositories need a known repository structure, and dashboard/plugin repositories need the card JavaScript file in `dist/` or the repo root, with a name matching the repository name. HACS can install from the default branch even without releases, and custom repositories are added through HACS using the repository URL and the correct type. citeturn840225search0turn840225search1turn840225search2

After installing through HACS, the resource is usually added automatically. If you need to add it manually, use:

```yaml
url: /hacsfiles/unifi-device-card/unifi-device-card.js
type: module
```

## Manual install

Copy `dist/unifi-device-card.js` to:

```text
/config/www/unifi-device-card.js
```

Then add a Lovelace resource:

```yaml
url: /local/unifi-device-card.js
type: module
```

## Basic usage

```yaml
type: custom:unifi-device-card
device_id: YOUR_HOME_ASSISTANT_DEVICE_ID
```

Example with options:

```yaml
type: custom:unifi-device-card
device_id: YOUR_HOME_ASSISTANT_DEVICE_ID
name: Core Switch
view: compact
tap_action: navigate
navigation_path: /dashboard-switches/core-switch
show_speed: true
show_port_details: true
show_gateway_ports: true
```

## Repository layout

```text
.
├── .github/workflows/
│   ├── hacs-validate.yml
│   └── release.yml
├── dist/
│   └── unifi-device-card.js
├── src/
│   ├── helpers.js
│   ├── unifi-device-card-editor.js
│   └── unifi-device-card.js
├── hacs.json
├── info.md
├── LICENSE
├── package.json
└── README.md
```

## Current behavior

### Switches
- compact port grid
- link state styling
- PoE icon hint when discovered
- optional navigation on tap
- optional hold and double-tap actions
- optional detailed list of discovered port entities

### Gateways and consoles
- summary tiles for internet, WAN, CPU, memory, temperature, uptime, clients, throughput
- optional discovered WAN and LAN entities below

## Config editor

The built-in editor tries to find UniFi devices by checking:
- device manufacturer and model
- device name
- related entity ids and names

It is heuristic-based so it can work across different UniFi models and Home Assistant versions.

## Notes about discovery

Home Assistant's UniFi entity naming can vary by version and model. The card therefore uses best-effort matching instead of assuming one exact entity pattern.

If your installation uses different entity names, adjust the heuristics in:

- `src/helpers.js`

Then rebuild `dist/unifi-device-card.js` or update it directly.

## Suggested GitHub repo name

Use this exact repository name:

```text
unifi-device-card
```

That matches the distributed file name `unifi-device-card.js`, which is the simplest HACS-compatible setup for a dashboard/plugin repository. citeturn840225search0

## Releasing

Releases are optional for HACS dashboard/plugin repositories. If you create GitHub releases, HACS can offer recent release versions in the install or upgrade flow; without releases it uses the default branch. citeturn840225search0turn840225search2

This repo includes:
- a HACS validation workflow
- a manual GitHub release workflow that can upload `dist/unifi-device-card.js`

## Development

```bash
npm install
npm run build
```

At the moment the build script is a placeholder because the repo already ships a ready-to-use `dist/unifi-device-card.js`.

## Roadmap

- richer UniFi capability detection
- better per-port metadata mapping
- optional AP support
- stronger config editor filtering by integration entry
- localization
- polished styling and theming

## License

MIT
