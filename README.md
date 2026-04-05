# UniFi Device Card

<img width="993" height="544" alt="Screenshot" src="[https://github.com/user-attachments/assets/16e1c29e-ecfb-4c37-8a17-5e31aa5718e5](https://github.com/bluenazgul/unifi-device-card/blob/d69f98278c1a24933163f2144408561e30cad0dc/screenshots/Screenshot.png)" />


A Home Assistant Lovelace custom card for UniFi devices such as switches (USW, US) and gateways (UDM, UCG).

---

## ✨ Features

- Unified UI for UniFi devices
- Automatic device type detection (Switch / Gateway)
- Switch port grid with:
  - Link status (color)
  - PoE status (icon)
- Mobile & desktop friendly (no browser_mod required)
- Built-in UI editor for selecting UniFi devices
- Designed for reuse across multiple switches

---

## 📦 Installation (HACS)

1. Open **HACS**
2. Go to **Frontend**
3. Click the **⋮ (menu)** → **Custom repositories**
4. Add your repository:
   - **Repository:** `https://github.com/YOUR_USERNAME/unifi-device-card`
   - **Category:** `Dashboard`
5. Click **Add**
6. Search for **UniFi Device Card**
7. Install it
8. Restart Home Assistant (or reload resources)

---

## 🚀 Usage

Add the card to your dashboard:

```yaml
type: custom:unifi-device-card
device_id: YOUR_DEVICE_ID
```

---

## 🔎 How to find your device_id

1. Go to **Settings → Devices & Services**
2. Open your UniFi device
3. Click **three dots (⋮)** → **Copy device ID**

---

## 🧱 Manual Installation

1. Copy the file:

`dist/unifi-device-card.js`

to:

`/config/www/unifi-device-card.js`

2. Add the resource:

```yaml
url: /local/unifi-device-card.js
type: module
```

---

## 🖥️ Supported Devices

- UniFi Switches:
  - US 8 60W
  - USW Lite 8
  - USW Lite 16
  - USW Flex / Flex Mini
- UniFi Gateways:
  - UDM
  - UDM Pro
  - UDM SE
  - UCG (Ultra, etc.)

---

## ⚙️ Configuration Options

| Option | Description |
|--------|-------------|
| `device_id` | Home Assistant device ID (required) |
| `name` | Optional custom title |
| `view` | `compact` or `detailed` (future) |
| `navigation_path` | Path for navigation on tap |

---

## 🧪 Development

Source files:

`/src`

Built file (used by Home Assistant):

`/dist/unifi-device-card.js`

After making changes, always rebuild or update the file in `/dist`.

---

## 🏷️ Releases

Releases are optional for HACS dashboard/plugin repositories.

- With releases, HACS supports versioned installs and upgrades
- Without releases, HACS uses the default branch

---

## 🐛 Troubleshooting

### Card not loading

- Check browser console (F12)
- Verify resource path:
  `/hacsfiles/unifi-device-card/unifi-device-card.js`

### Changes not visible

- Hard refresh browser (`CTRL + F5`)
- Or restart the Home Assistant frontend

---

## 📄 License

MIT
