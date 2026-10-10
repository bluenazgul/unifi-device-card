# UniFi Device Card

A Lovelace dashboard card for UniFi switches, gateways, access points, UPS devices, and SmartPower outlets.

**Requires Home Assistant Core 2026.9.0 or newer** with the UniFi Network integration configured. Upgrade Home Assistant before installing v1.0.0; use a compatible v0.8.x card release on older Home Assistant versions.

- Realistic front-panel port grid with device-accurate styling (white / silver panel)
- Per-port dual LED indicators — PoE state left, link speed right
- Click any port for details: speed, PoE power, toggle & power cycle
- Automatic device and port discovery via the UniFi Network Integration
- Built-in UI editor — no YAML required
- UPS battery/runtime readings and UPS/SmartPower outlet controls when exposed by the UniFi Network integration

Supports: USC8/US8P60/US8P150/US16P150, USW Flex/Flex Mini/Lite/Ultra families, USW 16/24/48 and Pro variants, USW Enterprise models, USW Aggregation + Pro Aggregation, Cloud Gateway Ultra/Max/Fiber, UDM Pro/SE, UXG-Pro/UXG-Lite, USG/USG Pro 4, and unknown models auto-detected by port count.

Repository type in HACS: **Dashboard**
