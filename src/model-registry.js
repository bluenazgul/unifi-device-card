// model-registry.js

function range(start, end) {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

function oddRange(start, end) {
  return range(start, end).filter((n) => n % 2 === 1);
}

function evenRange(start, end) {
  return range(start, end).filter((n) => n % 2 === 0);
}

function normalizeModelKey(value) {
  return String(value ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function defaultSwitchLayout(portCount) {
  if (portCount <= 8) {
    return { kind: "switch", frontStyle: "single-row", rows: [range(1, portCount)], portCount, specialSlots: [] };
  }
  if (portCount === 16) {
    return { kind: "switch", frontStyle: "dual-row", rows: [oddRange(1, 16), evenRange(1, 16)], portCount, specialSlots: [] };
  }
  if (portCount === 24) {
    return { kind: "switch", frontStyle: "six-grid", rows: [range(1, 6), range(7, 12), range(13, 18), range(19, 24)], portCount, specialSlots: [] };
  }
  if (portCount === 48) {
    return { kind: "switch", frontStyle: "quad-row", rows: [range(1, 12), range(13, 24), range(25, 36), range(37, 48)], portCount, specialSlots: [] };
  }
  return { kind: "switch", frontStyle: "single-row", rows: [range(1, portCount)], portCount, specialSlots: [] };
}

// ─────────────────────────────────────────────────────────────────────────────
// MODEL REGISTRY
//
// specialSlots: ports that are NOT regular numbered LAN ports.
// By default every special slot is rendered separately from the numbered grid.
//
// slot key conventions:
//   "wan"      → WAN / internet uplink (always a special port)
//   "sfp_N"    → SFP / SFP+ fibre uplink (always a special port)
//   "sfp28_N"  → 25G SFP28 uplink
//   "uplink"   → generic uplink without dedicated WAN function (switches)
//
// rows: only contains *LAN* RJ45 port numbers.
// portCount: total physical ports including special slots.
// ─────────────────────────────────────────────────────────────────────────────
export const MODEL_REGISTRY = {

  // ══════════════════════════════════════════════════════════════════════════
  // SWITCHES — Generation 1 (US-*)
  // ══════════════════════════════════════════════════════════════════════════

  // US 8 60W  (API key: US8P60)
  // 8× 1G RJ45 PoE, 2× 1G SFP uplinks
  US8P60: {
    kind: "switch", frontStyle: "single-row", rows: [range(1, 8)],
    portCount: 10, displayModel: "US 8 60W", theme: "silver",
    specialSlots: [
      { key: "sfp_1", label: "SFP 1", port: 9  },
      { key: "sfp_2", label: "SFP 2", port: 10 },
    ],
  },

  // US 8 150W  (API key: US8P150)  – Gen1 PoE switch
  // 8× 1G RJ45 PoE, 2× 1G SFP
  US8P150: {
    kind: "switch", frontStyle: "single-row", rows: [range(1, 8)],
    portCount: 10, displayModel: "US 8 150W", theme: "silver",
    specialSlots: [
      { key: "sfp_1", label: "SFP 1", port: 9  },
      { key: "sfp_2", label: "SFP 2", port: 10 },
    ],
  },

  // US 16 PoE 150W  (API key: US16P150)
  // 16× 1G RJ45 PoE, 2× 1G SFP
  US16P150: {
    kind: "switch", frontStyle: "dual-row", rows: [range(1, 8), range(9, 16)],
    portCount: 18, displayModel: "US 16 PoE 150W", theme: "silver",
    specialSlots: [
      { key: "sfp_1", label: "SFP 1", port: 17 },
      { key: "sfp_2", label: "SFP 2", port: 18 },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // SWITCHES — Generation 2 Standard (USW-*)
  // ══════════════════════════════════════════════════════════════════════════

  // USW Flex Mini  (API key: USMINI)
  // 5× 1G RJ45, Port 1 = PoE-In / Uplink
  USMINI: {
    kind: "switch", frontStyle: "single-row", rows: [range(1, 4)],
    portCount: 5, displayModel: "USW Flex Mini", theme: "white",
    specialSlots: [{ key: "uplink", label: "Uplink", port: 5 }],
  },

  // USW Flex  (API key: USF5P)
  // 4× 1G RJ45 PoE-out, Port 5 = PoE-In / Uplink
  USF5P: {
    kind: "switch", frontStyle: "single-row", rows: [range(1, 4)],
    portCount: 5, displayModel: "USW Flex", theme: "white",
    specialSlots: [{ key: "uplink", label: "Uplink", port: 5 }],
  },

  // USW Lite 8 PoE  (API key: USL8LP / USL8LPB)
  // 8× 1G RJ45 (4× PoE+)
  USL8LP: {
    kind: "switch", frontStyle: "single-row", rows: [range(1, 8)],
    portCount: 8, displayModel: "USW Lite 8 PoE", theme: "white", specialSlots: [],
  },
  USL8LPB: {
    kind: "switch", frontStyle: "single-row", rows: [range(1, 8)],
    portCount: 8, displayModel: "USW Lite 8 PoE", theme: "white", specialSlots: [],
  },

  // USW Lite 16 PoE  (API key: USL16LP / USL16LPB)
  // 16× 1G RJ45 (8× PoE+)
  USL16LP: {
    kind: "switch", frontStyle: "dual-row", rows: [oddRange(1, 16), evenRange(1, 16)],
    portCount: 16, displayModel: "USW Lite 16 PoE", theme: "white", specialSlots: [],
  },
  USL16LPB: {
    kind: "switch", frontStyle: "dual-row", rows: [oddRange(1, 16), evenRange(1, 16)],
    portCount: 16, displayModel: "USW Lite 16 PoE", theme: "white", specialSlots: [],
  },

  // USW 16 PoE (Gen2)  (API key: USL16P)
  // 16× 1G RJ45 (8× PoE+), 2× 1G SFP uplinks
  USL16P: {
    kind: "switch", frontStyle: "dual-row", rows: [range(1, 8), range(9, 16)],
    portCount: 18, displayModel: "USW 16 PoE", theme: "silver",
    specialSlots: [
      { key: "sfp_1", label: "SFP 1", port: 17 },
      { key: "sfp_2", label: "SFP 2", port: 18 },
    ],
  },

  // USW 24 (Gen2, kein PoE)  (API key: USL24)
  // 24× 1G RJ45, 2× 1G SFP uplinks
  USL24: {
    kind: "switch", frontStyle: "six-grid",
    rows: [range(1, 6), range(7, 12), range(13, 18), range(19, 24)],
    portCount: 26, displayModel: "USW 24", theme: "silver",
    specialSlots: [
      { key: "sfp_1", label: "SFP 1", port: 25 },
      { key: "sfp_2", label: "SFP 2", port: 26 },
    ],
  },

  // USW 24 PoE (Gen2)  (API key: USL24P)
  // 24× 1G RJ45 (16× PoE+), 2× 1G SFP uplinks
  USL24P: {
    kind: "switch", frontStyle: "six-grid",
    rows: [range(1, 6), range(7, 12), range(13, 18), range(19, 24)],
    portCount: 26, displayModel: "USW 24 PoE", theme: "silver",
    specialSlots: [
      { key: "sfp_1", label: "SFP 1", port: 25 },
      { key: "sfp_2", label: "SFP 2", port: 26 },
    ],
  },

  // USW 24 PoE (legacy key used by older firmware)  (API key: USW24P)
  // Identisch zu USL24P, nur abweichender API-Key
  USW24P: {
    kind: "switch", frontStyle: "six-grid",
    rows: [range(1, 6), range(7, 12), range(13, 18), range(19, 24)],
    portCount: 26, displayModel: "USW 24 PoE", theme: "silver",
    specialSlots: [
      { key: "sfp_1", label: "SFP 1", port: 25 },
      { key: "sfp_2", label: "SFP 2", port: 26 },
    ],
  },

  // USW 48 (Gen2, kein PoE)  (API key: USL48)
  // 48× 1G RJ45, 4× 1G SFP uplinks
  USL48: {
    kind: "switch", frontStyle: "quad-row",
    rows: [range(1, 12), range(13, 24), range(25, 36), range(37, 48)],
    portCount: 52, displayModel: "USW 48", theme: "silver",
    specialSlots: [
      { key: "sfp_1", label: "SFP 1", port: 49 },
      { key: "sfp_2", label: "SFP 2", port: 50 },
      { key: "sfp_3", label: "SFP 3", port: 51 },
      { key: "sfp_4", label: "SFP 4", port: 52 },
    ],
  },

  // USW 48 PoE (Gen2)  (API key: USL48P)
  // 48× 1G RJ45 (32× PoE+), 4× 1G SFP uplinks
  USL48P: {
    kind: "switch", frontStyle: "quad-row",
    rows: [range(1, 12), range(13, 24), range(25, 36), range(37, 48)],
    portCount: 52, displayModel: "USW 48 PoE", theme: "silver",
    specialSlots: [
      { key: "sfp_1", label: "SFP 1", port: 49 },
      { key: "sfp_2", label: "SFP 2", port: 50 },
      { key: "sfp_3", label: "SFP 3", port: 51 },
      { key: "sfp_4", label: "SFP 4", port: 52 },
    ],
  },

  // USW 48 PoE (legacy key)  (API key: USW48P)
  // Identisch zu USL48P, nur abweichender API-Key
  USW48P: {
    kind: "switch", frontStyle: "quad-row",
    rows: [range(1, 12), range(13, 24), range(25, 36), range(37, 48)],
    portCount: 52, displayModel: "USW 48 PoE", theme: "silver",
    specialSlots: [
      { key: "sfp_1", label: "SFP 1", port: 49 },
      { key: "sfp_2", label: "SFP 2", port: 50 },
      { key: "sfp_3", label: "SFP 3", port: 51 },
      { key: "sfp_4", label: "SFP 4", port: 52 },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // SWITCHES — Generation 2 Professional (USW-Pro-*)
  // ══════════════════════════════════════════════════════════════════════════

  // USW Pro 24 PoE  (API key: US24PRO)
  // 24× 1G RJ45 (16× PoE+, 8× PoE++), 2× 10G SFP+ uplinks
  US24PRO: {
    kind: "switch", frontStyle: "six-grid",
    rows: [range(1, 6), range(7, 12), range(13, 18), range(19, 24)],
    portCount: 26, displayModel: "USW Pro 24 PoE", theme: "silver",
    specialSlots: [
      { key: "sfp_1", label: "SFP+ 1", port: 25 },
      { key: "sfp_2", label: "SFP+ 2", port: 26 },
    ],
  },

  // USW Pro 24 (kein PoE)  (API key: US24PRO2)
  // 24× 1G RJ45, 2× 10G SFP+ uplinks
  US24PRO2: {
    kind: "switch", frontStyle: "six-grid",
    rows: [range(1, 6), range(7, 12), range(13, 18), range(19, 24)],
    portCount: 26, displayModel: "USW Pro 24", theme: "silver",
    specialSlots: [
      { key: "sfp_1", label: "SFP+ 1", port: 25 },
      { key: "sfp_2", label: "SFP+ 2", port: 26 },
    ],
  },

  // USW Pro 48 PoE  (API key: US48PRO)
  // 48× 1G RJ45 (40× PoE+, 8× PoE++), 4× 10G SFP+ uplinks
  US48PRO: {
    kind: "switch", frontStyle: "quad-row",
    rows: [range(1, 12), range(13, 24), range(25, 36), range(37, 48)],
    portCount: 52, displayModel: "USW Pro 48 PoE", theme: "silver",
    specialSlots: [
      { key: "sfp_1", label: "SFP+ 1", port: 49 },
      { key: "sfp_2", label: "SFP+ 2", port: 50 },
      { key: "sfp_3", label: "SFP+ 3", port: 51 },
      { key: "sfp_4", label: "SFP+ 4", port: 52 },
    ],
  },

  // USW Pro 48 (kein PoE)  (API key: US48PRO2)
  // 48× 1G RJ45, 4× 10G SFP+ uplinks
  US48PRO2: {
    kind: "switch", frontStyle: "quad-row",
    rows: [range(1, 12), range(13, 24), range(25, 36), range(37, 48)],
    portCount: 52, displayModel: "USW Pro 48", theme: "silver",
    specialSlots: [
      { key: "sfp_1", label: "SFP+ 1", port: 49 },
      { key: "sfp_2", label: "SFP+ 2", port: 50 },
      { key: "sfp_3", label: "SFP+ 3", port: 51 },
      { key: "sfp_4", label: "SFP+ 4", port: 52 },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // SWITCHES — Generation 2 Enterprise (USW-Enterprise-*)
  // ══════════════════════════════════════════════════════════════════════════

  // USW Enterprise 8 PoE  (API key: US68P)
  // 8× 1G RJ45 PoE+, 2× 10G SFP+ uplinks
  US68P: {
    kind: "switch", frontStyle: "single-row", rows: [range(1, 8)],
    portCount: 10, displayModel: "USW Enterprise 8 PoE", theme: "silver",
    specialSlots: [
      { key: "sfp_1", label: "SFP+ 1", port: 9  },
      { key: "sfp_2", label: "SFP+ 2", port: 10 },
    ],
  },

  // USW Enterprise 24 PoE  (API key: US624P)
  // 12× 2.5G RJ45 PoE+ + 12× 1G RJ45 PoE+, 2× 10G SFP+ uplinks
  US624P: {
    kind: "switch", frontStyle: "six-grid",
    rows: [range(1, 6), range(7, 12), range(13, 18), range(19, 24)],
    portCount: 26, displayModel: "USW Enterprise 24 PoE", theme: "silver",
    specialSlots: [
      { key: "sfp_1", label: "SFP+ 1", port: 25 },
      { key: "sfp_2", label: "SFP+ 2", port: 26 },
    ],
  },

  // USW Enterprise 48 PoE  (API key: US648P)
  // 48× 2.5G RJ45 PoE+, 4× 10G SFP+ uplinks
  US648P: {
    kind: "switch", frontStyle: "quad-row",
    rows: [range(1, 12), range(13, 24), range(25, 36), range(37, 48)],
    portCount: 52, displayModel: "USW Enterprise 48 PoE", theme: "silver",
    specialSlots: [
      { key: "sfp_1", label: "SFP+ 1", port: 49 },
      { key: "sfp_2", label: "SFP+ 2", port: 50 },
      { key: "sfp_3", label: "SFP+ 3", port: 51 },
      { key: "sfp_4", label: "SFP+ 4", port: 52 },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // SWITCHES — Aggregation
  // ══════════════════════════════════════════════════════════════════════════

  // USW Aggregation  (API key: USL8A)
  // 8× 10G SFP+ — all ports are fibre/SFP, no RJ45 LAN ports
  USL8A: {
    kind: "switch", frontStyle: "single-row", rows: [],
    portCount: 8, displayModel: "USW Aggregation", theme: "silver",
    specialSlots: [
      { key: "sfp_1", label: "SFP+ 1", port: 1 },
      { key: "sfp_2", label: "SFP+ 2", port: 2 },
      { key: "sfp_3", label: "SFP+ 3", port: 3 },
      { key: "sfp_4", label: "SFP+ 4", port: 4 },
      { key: "sfp_5", label: "SFP+ 5", port: 5 },
      { key: "sfp_6", label: "SFP+ 6", port: 6 },
      { key: "sfp_7", label: "SFP+ 7", port: 7 },
      { key: "sfp_8", label: "SFP+ 8", port: 8 },
    ],
  },

  // USW Pro Aggregation  (API key: USAGGPRO)
  // 28× 10G SFP+ + 4× 25G SFP28 — all ports are fibre/SFP
  USAGGPRO: {
    kind: "switch", frontStyle: "single-row", rows: [],
    portCount: 32, displayModel: "USW Pro Aggregation", theme: "silver",
    specialSlots: [
      ...range(1, 28).map((p) => ({ key: `sfp_${p}`, label: `SFP+ ${p}`, port: p })),
      { key: "sfp28_1", label: "25G 1", port: 29 },
      { key: "sfp28_2", label: "25G 2", port: 30 },
      { key: "sfp28_3", label: "25G 3", port: 31 },
      { key: "sfp28_4", label: "25G 4", port: 32 },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // SWITCHES — USW Ultra family
  // ══════════════════════════════════════════════════════════════════════════

  // USW Ultra  (API key: USWULTRA)
  // 6× 1G RJ45 PoE+, 1× SFP+ uplink (Port 7 = Uplink, not in numbered grid)
  USWULTRA: {
    kind: "switch", frontStyle: "ultra-row", rows: [range(1, 6)],
    portCount: 7, displayModel: "USW Ultra", theme: "white",
    specialSlots: [{ key: "uplink", label: "Uplink", port: 7 }],
  },

  // USW Ultra 60W  (API key: USWULTRA60W)
  USWULTRA60W: {
    kind: "switch", frontStyle: "ultra-row", rows: [range(1, 6)],
    portCount: 7, displayModel: "USW Ultra 60W", theme: "white",
    specialSlots: [{ key: "uplink", label: "Uplink", port: 7 }],
  },

  // USW Ultra 210W  (API key: USWULTRA210W)
  USWULTRA210W: {
    kind: "switch", frontStyle: "ultra-row", rows: [range(1, 6)],
    portCount: 7, displayModel: "USW Ultra 210W", theme: "white",
    specialSlots: [{ key: "uplink", label: "Uplink", port: 7 }],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // GATEWAYS — Cloud Gateways (UCG-* / UDR-*)
  // ══════════════════════════════════════════════════════════════════════════

  // Cloud Gateway Ultra  (API key: UCGULTRA / UDRULT)
  // Ports 1–4: 1G RJ45 LAN  |  Port 5: 2.5G RJ45 WAN (default)
  UCGULTRA: {
    kind: "gateway", frontStyle: "gateway-single-row", rows: [[1, 2, 3, 4]],
    portCount: 5, displayModel: "Cloud Gateway Ultra", theme: "white",
    specialSlots: [{ key: "wan", label: "WAN", port: 5 }],
  },
  UDRULT: {
    kind: "gateway", frontStyle: "gateway-single-row", rows: [[1, 2, 3, 4]],
    portCount: 5, displayModel: "Cloud Gateway Ultra", theme: "white",
    specialSlots: [{ key: "wan", label: "WAN", port: 5 }],
  },

  // Cloud Gateway Max  (API key: UCGMAX)
  // Ports 1–4: 2.5G RJ45 LAN (any can be WAN)  |  Port 5: 2.5G RJ45 WAN (default)
  UCGMAX: {
    kind: "gateway", frontStyle: "gateway-single-row", rows: [[1, 2, 3, 4]],
    portCount: 5, displayModel: "Cloud Gateway Max", theme: "white",
    specialSlots: [{ key: "wan", label: "WAN", port: 5 }],
  },

  // Cloud Gateway Fiber  (API key: UCGFIBER)
  // Ports 1–4: 2.5G RJ45 LAN  |  Port 5: 10G SFP+ (LAN/WAN)
  // Port 6: 10G RJ45 WAN  |  Port 7: 10G SFP+ WAN 2
  UCGFIBER: {
    kind: "gateway", frontStyle: "gateway-single-row", rows: [[1, 2, 3, 4]],
    portCount: 7, displayModel: "Cloud Gateway Fiber", theme: "white",
    specialSlots: [
      { key: "sfp_1", label: "SFP+ 1", port: 5 },
      { key: "wan",   label: "WAN",    port: 6 },
      { key: "sfp_2", label: "SFP+ 2", port: 7 },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // GATEWAYS — Dream Machines (UDM-*)
  // ══════════════════════════════════════════════════════════════════════════

  // UDM Pro  (API key: UDMPRO)
  // Ports 1–8: 1G RJ45 LAN switch  |  Port 9: 1G RJ45 WAN
  // Port 10: 10G SFP+ (WAN 2 / LAN)  |  Port 11: 10G SFP+ (LAN/uplink)
  UDMPRO: {
    kind: "gateway", frontStyle: "gateway-rack", rows: [range(1, 8)],
    portCount: 11, displayModel: "UDM Pro", theme: "silver",
    specialSlots: [
      { key: "wan",   label: "WAN",    port: 9  },
      { key: "sfp_1", label: "SFP+ 1", port: 10 },
      { key: "sfp_2", label: "SFP+ 2", port: 11 },
    ],
  },

  // UDM SE  (API key: UDMPROSE)
  // ⚠ Wichtig: die UniFi API liefert "UDMPROSE", NICHT "UDMSE"
  // Ports 1–8: 1G/2.5G RJ45 LAN  |  Port 9: 2.5G RJ45 WAN
  // Port 10: 10G SFP+ (WAN 2 / LAN)  |  Port 11: 10G SFP+ (LAN/uplink)
  UDMPROSE: {
    kind: "gateway", frontStyle: "gateway-rack", rows: [range(1, 8)],
    portCount: 11, displayModel: "UDM SE", theme: "silver",
    specialSlots: [
      { key: "wan",   label: "WAN",    port: 9  },
      { key: "sfp_1", label: "SFP+ 1", port: 10 },
      { key: "sfp_2", label: "SFP+ 2", port: 11 },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // GATEWAYS — UXG Next-Generation Gateways
  // ══════════════════════════════════════════════════════════════════════════

  // UXG-Pro  (API key: UXGPRO)
  // Port 1: 1G RJ45 LAN  |  Port 2: 1G RJ45 WAN (default)
  // Port 3: 10G SFP+ LAN  |  Port 4: 10G SFP+ WAN (default)
  UXGPRO: {
    kind: "gateway", frontStyle: "gateway-rack", rows: [[1]],
    portCount: 4, displayModel: "UXG-Pro", theme: "silver",
    specialSlots: [
      { key: "wan",   label: "WAN",      port: 2 },
      { key: "sfp_1", label: "SFP+ LAN", port: 3 },
      { key: "sfp_2", label: "SFP+ WAN", port: 4 },
    ],
  },

  // UXG-Lite  (API key: UXGL — unbestätigt, Gerät zu neu für offizielle Tabelle)
  // Port 1: 1G RJ45 LAN  |  Port 2: 1G RJ45 WAN
  UXGL: {
    kind: "gateway", frontStyle: "gateway-single-row", rows: [[1]],
    portCount: 2, displayModel: "UXG-Lite", theme: "white",
    specialSlots: [{ key: "wan", label: "WAN", port: 2 }],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // GATEWAYS — Legacy USG Security Gateways
  // ══════════════════════════════════════════════════════════════════════════

  // UniFi Security Gateway 3P  (API key: UGW3)
  // Port 1: 1G RJ45 WAN  |  Port 2: 1G RJ45 LAN  |  Port 3: 1G RJ45 WAN2/LAN2
  UGW3: {
    kind: "gateway", frontStyle: "gateway-single-row", rows: [[2]],
    portCount: 3, displayModel: "UniFi Security Gateway", theme: "white",
    specialSlots: [
      { key: "wan",  label: "WAN",     port: 1 },
      { key: "wan2", label: "WAN 2",   port: 3 },
    ],
  },

  // UniFi Security Gateway Pro 4  (API key: UGW4)
  // Port 1: 1G RJ45 WAN 1  |  Port 2: 1G RJ45 WAN 2
  // Port 3: 1G RJ45 LAN 1  |  Port 4: 1G RJ45 LAN 2
  // Port 5: 1G SFP  |  Port 6: 1G SFP
  UGW4: {
    kind: "gateway", frontStyle: "gateway-rack", rows: [[3, 4]],
    portCount: 6, displayModel: "USG Pro 4", theme: "silver",
    specialSlots: [
      { key: "wan",   label: "WAN 1",  port: 1 },
      { key: "wan2",  label: "WAN 2",  port: 2 },
      { key: "sfp_1", label: "SFP 1",  port: 5 },
      { key: "sfp_2", label: "SFP 2",  port: 6 },
    ],
  },
};

// ─────────────────────────────────────────────────
// Model key resolution
// ─────────────────────────────────────────────────

export function resolveModelKey(device) {
  const candidates = [device?.model, device?.hw_version, device?.name, device?.name_by_user]
    .filter(Boolean)
    .map(normalizeModelKey);

  for (const candidate of candidates) {
    if (!candidate) continue;

    // Direct registry hit — fastest path
    if (MODEL_REGISTRY[candidate]) return candidate;

    // ── Gateways ────────────────────────────────────────────────────────────
    // UDMPROSE must come before UDMPRO to avoid partial match
    if (candidate.includes("UDMPROSE")) return "UDMPROSE";
    if (candidate.includes("UDMSE"))    return "UDMPROSE";  // legacy alias
    if (candidate.includes("UDMPRO"))   return "UDMPRO";

    // Cloud Gateways — UCGFIBER before UCGMAX/UCGULTRA (avoid partial matches)
    if (candidate.includes("UCGFIBER"))           return "UCGFIBER";
    if (candidate.includes("CLOUDGATEWAYFIBER"))  return "UCGFIBER";
    if (candidate.includes("UDRULT"))             return "UDRULT";
    if (candidate.includes("UCGULTRA"))           return "UCGULTRA";
    if (candidate.includes("CLOUDGATEWAYULTRA"))  return "UCGULTRA";
    if (candidate.includes("UCGMAX"))             return "UCGMAX";
    if (candidate.includes("CLOUDGATEWAYMAX"))    return "UCGMAX";

    // UXG gateways
    if (candidate === "UXGPRO")         return "UXGPRO";
    if (candidate.includes("UXGPRO"))   return "UXGPRO";
    // UXG-Lite — API key not yet confirmed; catch likely variants
    if (candidate === "UXGL")           return "UXGL";
    if (candidate.includes("UXGLITE"))  return "UXGL";
    if (candidate.includes("UXGL"))     return "UXGL";

    // Legacy USG
    if (candidate === "UGW3")           return "UGW3";
    if (candidate.includes("USG3"))     return "UGW3";
    if (candidate === "UGW4")           return "UGW4";
    if (candidate.includes("USGPRO4"))  return "UGW4";
    if (candidate.includes("USG4"))     return "UGW4";

    // ── Switches — Lite series ───────────────────────────────────────────────
    if (candidate.includes("USL16LPB"))       return "USL16LPB";
    if (candidate.includes("USL16LP"))        return "USL16LP";
    if (candidate.includes("USWLITE16POE"))   return "USL16LPB";
    if (candidate.includes("USWLITE16"))      return "USL16LPB";
    if ((candidate.includes("LITE") || candidate.includes("USW")) && candidate.includes("16") && candidate.includes("POE")) return "USL16LPB";

    if (candidate.includes("USL8LPB"))        return "USL8LPB";
    if (candidate.includes("USL8LP"))         return "USL8LP";
    if (candidate.includes("USWLITE8POE"))    return "USL8LPB";
    if (candidate.includes("USWLITE8"))       return "USL8LPB";
    if ((candidate.includes("LITE") || candidate.includes("USW")) && candidate.includes("8") && candidate.includes("POE")) return "USL8LPB";

    // ── Switches — Gen1 ─────────────────────────────────────────────────────
    if (candidate.includes("US8P60"))         return "US8P60";
    if (candidate.includes("US860W"))         return "US8P60";
    if (candidate.includes("US8P150"))        return "US8P150";
    if (candidate.includes("US8150W"))        return "US8P150";

    // US 16 PoE 150W — before generic US16 patterns
    if (candidate.includes("US16P150"))       return "US16P150";
    if (candidate.includes("US16POE150"))     return "US16P150";
    if (candidate.includes("US16P"))          return "US16P150";

    // ── Switches — Mini / Flex ───────────────────────────────────────────────
    if (candidate.includes("USMINI"))         return "USMINI";
    if (candidate.includes("FLEXMINI"))       return "USMINI";
    if (candidate.includes("USWFLEXMINI"))    return "USMINI";
    if (candidate === "USF5P")                return "USF5P";
    if (candidate.includes("USWFLEX"))        return "USF5P";

    // ── Switches — Aggregation ───────────────────────────────────────────────
    // USW Aggregation (USL8A) — must check before generic US/USL patterns
    if (candidate === "USL8A")                       return "USL8A";
    if (candidate.includes("USWAGGREGATION"))        return "USL8A";
    if (candidate.includes("SWITCHAGGREGATION"))     return "USL8A";
    // USW Pro Aggregation (USAGGPRO)
    if (candidate === "USAGGPRO")                    return "USAGGPRO";
    if (candidate.includes("PROAGGREGATION"))        return "USAGGPRO";
    if (candidate.includes("USWPROAGGREGATION"))     return "USAGGPRO";

    // ── Switches — Pro 48 (PoE before non-PoE) ──────────────────────────────
    if (candidate === "US48PRO")                     return "US48PRO";
    if (candidate.includes("US48PRO"))               return "US48PRO";   // catches US48PRO itself + suffix variants
    if (candidate.includes("USWPRO48POE"))           return "US48PRO";
    if (candidate.includes("PRO48POE"))              return "US48PRO";
    // non-PoE variant
    if (candidate === "US48PRO2")                    return "US48PRO2";
    if (candidate.includes("USWPRO48"))              return "US48PRO2";
    if (candidate.includes("PRO48"))                 return "US48PRO2";

    // ── Switches — Pro 24 ────────────────────────────────────────────────────
    // US24PRO = Pro 24 PoE;  US24PRO2 = Pro 24 no-PoE
    if (candidate === "US24PRO2")                    return "US24PRO2";
    if (candidate.includes("US24PRO2"))              return "US24PRO2";
    if (candidate.includes("USWPRO24"))              return "US24PRO2";
    if (candidate.includes("SWITCHPRO24"))           return "US24PRO2";
    if (candidate === "US24PRO")                     return "US24PRO";
    if (candidate.includes("US24PRO"))               return "US24PRO";
    if (candidate.includes("USWPRO24POE"))           return "US24PRO";
    if (candidate.includes("PRO24POE"))              return "US24PRO";

    // ── Switches — Enterprise ────────────────────────────────────────────────
    // Enterprise 48 before 24 to avoid partial match
    if (candidate === "US648P")                      return "US648P";
    if (candidate.includes("ENTERPRISE48POE"))       return "US648P";
    if (candidate.includes("USWENTERPRISE48"))       return "US648P";
    if (candidate === "US624P")                      return "US624P";
    if (candidate.includes("ENTERPRISE24POE"))       return "US624P";
    if (candidate.includes("USWENTERPRISE24"))       return "US624P";
    if (candidate === "US68P")                       return "US68P";
    if (candidate.includes("ENTERPRISE8POE"))        return "US68P";
    if (candidate.includes("USWENTERPRISE8"))        return "US68P";

    // ── Switches — USW 16/24/48 Gen2 ─────────────────────────────────────────
    // USW 16 PoE Gen2 (USL16P) — distinct from Lite-16 (USL16LP)
    if (candidate === "USL16P")                      return "USL16P";
    // USW 24/48 — PoE before non-PoE, specific before generic
    if (candidate === "USL24P")                      return "USL24P";
    if (candidate === "USL24")                       return "USL24";
    if (candidate === "USL48P")                      return "USL48P";
    if (candidate === "USL48")                       return "USL48";

    // ── Switches — Ultra family ───────────────────────────────────────────────
    if (candidate === "USWULTRA210W")                return "USWULTRA210W";
    if (candidate === "USWULTRA60W")                 return "USWULTRA60W";
    if (candidate === "USWULTRA")                    return "USWULTRA";
    if (candidate.includes("USWULTRA210"))           return "USWULTRA210W";
    if (candidate.includes("USWULTRA60"))            return "USWULTRA60W";
    if (candidate.includes("USWULTRA"))              return "USWULTRA";
    if (candidate.includes("SWITCHULTRA210"))        return "USWULTRA210W";
    if (candidate.includes("SWITCHULTRA60"))         return "USWULTRA60W";
    if (candidate.includes("SWITCHULTRA"))           return "USWULTRA";

    // ── Generic fallbacks — must come AFTER all specific checks above ─────────
    if (candidate.includes("USW24"))  return "USL24P";  // assume PoE for generic USW24
    if (candidate.includes("USW48"))  return "USL48P";  // assume PoE for generic USW48
  }

  return null;
}

// ─────────────────────────────────────────────────
// Port-count inference (for unknown/fallback models)
// ─────────────────────────────────────────────────

export function inferPortCountFromModel(device) {
  const text = normalizeModelKey(
    [device?.model, device?.name, device?.name_by_user].filter(Boolean).join(" ")
  );

  // Gateways
  if (text.includes("UDMPROSE") || text.includes("UDMSE"))                           return 11;
  if (text.includes("UDMPRO"))                                                        return 11;
  if (text.includes("UCGFIBER") || text.includes("CLOUDGATEWAYFIBER"))               return 7;
  if (text.includes("UCGULTRA") || text.includes("CLOUDGATEWAYULTRA") || text.includes("UDRULT")) return 5;
  if (text.includes("UCGMAX")   || text.includes("CLOUDGATEWAYMAX"))                 return 5;
  if (text.includes("UXGPRO"))                                                        return 4;
  if (text.includes("UXGL"))                                                          return 2;
  if (text.includes("UGW4"))                                                          return 6;
  if (text.includes("UGW3"))                                                          return 3;

  // Aggregation switches
  if (text.includes("USAGGPRO") || text.includes("PROAGGREGATION"))                  return 32;
  if (text.includes("USL8A")    || text.includes("USWAGGREGATION"))                  return 8;

  // Lite / Flex
  if (text.includes("USL16LPB") || text.includes("USL16LP") || text.includes("USWLITE16POE") || text.includes("LITE16")) return 16;
  if (text.includes("USL8LPB")  || text.includes("USL8LP")  || text.includes("USWLITE8POE")  || text.includes("LITE8"))  return 8;
  if (text.includes("US8P60")   || text.includes("US8"))                              return 8;
  if (text.includes("US8P150"))                                                       return 10;
  if (text.includes("USMINI")   || text.includes("FLEXMINI"))                        return 5;
  if (text.includes("USF5P")    || text.includes("USWFLEX"))                         return 5;

  // Gen1 16-port
  if (text.includes("US16P150") || text.includes("US16P"))                           return 18;
  if (text.includes("USL16P"))                                                        return 18;

  // Pro 24/48
  if (text.includes("US24PRO2") || text.includes("US24PRO") || text.includes("USWPRO24")) return 26;
  if (text.includes("US48PRO2") || text.includes("US48PRO") || text.includes("USWPRO48")) return 52;

  // Enterprise
  if (text.includes("US648P")   || text.includes("ENTERPRISE48POE"))                 return 52;
  if (text.includes("US624P")   || text.includes("ENTERPRISE24POE"))                 return 26;
  if (text.includes("US68P")    || text.includes("ENTERPRISE8POE"))                  return 10;

  // Gen2 standard (with SFP)
  if (text.includes("USL48P")   || text.includes("USL48"))                           return 52;
  if (text.includes("USL24P")   || text.includes("USL24"))                           return 26;

  // Ultra
  if (text.includes("USWULTRA"))                                                      return 7;

  // Numeric fallbacks
  if (text.includes("48"))  return 48;
  if (text.includes("24"))  return 24;
  if (text.includes("16"))  return 16;

  return null;
}

// ─────────────────────────────────────────────────
// Main layout resolver
// ─────────────────────────────────────────────────

export function getDeviceLayout(device, discoveredPorts = []) {
  const modelKey = resolveModelKey(device);
  if (modelKey && MODEL_REGISTRY[modelKey]) {
    return { modelKey, ...MODEL_REGISTRY[modelKey] };
  }

  const inferredPortCount =
    inferPortCountFromModel(device) ||
    (discoveredPorts.length > 0 ? Math.max(...discoveredPorts.map((p) => p.port)) : 0);

  if (inferredPortCount > 0) {
    return {
      modelKey: null,
      ...defaultSwitchLayout(inferredPortCount),
      displayModel: device?.model || `UniFi Device (${inferredPortCount}p)`,
    };
  }

  return {
    modelKey: null,
    kind: "gateway",
    frontStyle: "gateway-generic",
    rows: [],
    portCount: 0,
    displayModel: device?.model || "UniFi Gateway",
    specialSlots: [],
  };
}
