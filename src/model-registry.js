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

  // US 8 60W  — 8× 1G RJ45 PoE (all), 2× 1G SFP
  US8P60: {
    kind: "switch", frontStyle: "single-row", rows: [range(1, 8)],
    portCount: 10, displayModel: "US 8 60W", theme: "silver",
    poePortRange: [1, 8],
    specialSlots: [
      { key: "sfp_1", label: "SFP 1", port: 9  },
      { key: "sfp_2", label: "SFP 2", port: 10 },
    ],
  },

  // US 8 150W  — 8× 1G RJ45 PoE (all), 2× 1G SFP
  US8P150: {
    kind: "switch", frontStyle: "single-row", rows: [range(1, 8)],
    portCount: 10, displayModel: "US 8 150W", theme: "silver",
    poePortRange: [1, 8],
    specialSlots: [
      { key: "sfp_1", label: "SFP 1", port: 9  },
      { key: "sfp_2", label: "SFP 2", port: 10 },
    ],
  },

  // US 16 PoE 150W  — 16× 1G RJ45 PoE (all), 2× 1G SFP
  US16P150: {
    kind: "switch", frontStyle: "dual-row", rows: [range(1, 8), range(9, 16)],
    portCount: 18, displayModel: "US 16 PoE 150W", theme: "silver",
    poePortRange: [1, 16],
    specialSlots: [
      { key: "sfp_1", label: "SFP 1", port: 17 },
      { key: "sfp_2", label: "SFP 2", port: 18 },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // SWITCHES — Generation 2 Standard (USW-*)
  // ══════════════════════════════════════════════════════════════════════════

  // USW Flex Mini  — 4× 1G RJ45 (no PoE out), Port 5 = PoE-in / Uplink
  USMINI: {
    kind: "switch", frontStyle: "single-row", rows: [range(1, 4)],
    portCount: 5, displayModel: "USW Flex Mini", theme: "white",
    // no poePortRange — ports 1-4 receive but do not output PoE
    specialSlots: [{ key: "uplink", label: "Uplink", port: 5 }],
  },

  // USW Flex  — 4× 1G RJ45 PoE-out (all), Port 5 = PoE-in / Uplink
  USF5P: {
    kind: "switch", frontStyle: "single-row", rows: [range(1, 4)],
    portCount: 5, displayModel: "USW Flex", theme: "white",
    poePortRange: [1, 4],
    specialSlots: [{ key: "uplink", label: "Uplink", port: 5 }],
  },

  // USW Lite 8 PoE  — 8× 1G RJ45, Ports 1-4: PoE+, Ports 5-8: no PoE
  USL8LP: {
    kind: "switch", frontStyle: "single-row", rows: [range(1, 8)],
    portCount: 8, displayModel: "USW Lite 8 PoE", theme: "white",
    poePortRange: [1, 4],
    specialSlots: [],
  },
  USL8LPB: {
    kind: "switch", frontStyle: "single-row", rows: [range(1, 8)],
    portCount: 8, displayModel: "USW Lite 8 PoE", theme: "white",
    poePortRange: [1, 4],
    specialSlots: [],
  },

  // USW Lite 16 PoE  — 16× 1G RJ45, Ports 1-8: PoE+, Ports 9-16: no PoE
  USL16LP: {
    kind: "switch", frontStyle: "dual-row", rows: [oddRange(1, 16), evenRange(1, 16)],
    portCount: 16, displayModel: "USW Lite 16 PoE", theme: "white",
    poePortRange: [1, 8],
    specialSlots: [],
  },
  USL16LPB: {
    kind: "switch", frontStyle: "dual-row", rows: [oddRange(1, 16), evenRange(1, 16)],
    portCount: 16, displayModel: "USW Lite 16 PoE", theme: "white",
    poePortRange: [1, 8],
    specialSlots: [],
  },

  // USW 16 PoE Gen2  — 16× 1G RJ45, Ports 1-8: PoE+, Ports 9-16: no PoE, 2× SFP
  USL16P: {
    kind: "switch", frontStyle: "dual-row", rows: [range(1, 8), range(9, 16)],
    portCount: 18, displayModel: "USW 16 PoE", theme: "silver",
    poePortRange: [1, 8],
    specialSlots: [
      { key: "sfp_1", label: "SFP 1", port: 17 },
      { key: "sfp_2", label: "SFP 2", port: 18 },
    ],
  },

  // USW 24 Gen2 no PoE  — 24× 1G RJ45 (no PoE), 2× SFP
  USL24: {
    kind: "switch", frontStyle: "six-grid",
    rows: [range(1, 6), range(7, 12), range(13, 18), range(19, 24)],
    portCount: 26, displayModel: "USW 24", theme: "silver",
    // no poePortRange
    specialSlots: [
      { key: "sfp_1", label: "SFP 1", port: 25 },
      { key: "sfp_2", label: "SFP 2", port: 26 },
    ],
  },

  // USW 24 PoE Gen2  — 24× 1G RJ45, Ports 1-16: PoE+, Ports 17-24: no PoE, 2× SFP
  USL24P: {
    kind: "switch", frontStyle: "six-grid",
    rows: [range(1, 6), range(7, 12), range(13, 18), range(19, 24)],
    portCount: 26, displayModel: "USW 24 PoE", theme: "silver",
    poePortRange: [1, 16],
    specialSlots: [
      { key: "sfp_1", label: "SFP 1", port: 25 },
      { key: "sfp_2", label: "SFP 2", port: 26 },
    ],
  },

  // USW 24 PoE (legacy firmware key)  — identisch zu USL24P
  USW24P: {
    kind: "switch", frontStyle: "six-grid",
    rows: [range(1, 6), range(7, 12), range(13, 18), range(19, 24)],
    portCount: 26, displayModel: "USW 24 PoE", theme: "silver",
    poePortRange: [1, 16],
    specialSlots: [
      { key: "sfp_1", label: "SFP 1", port: 25 },
      { key: "sfp_2", label: "SFP 2", port: 26 },
    ],
  },

  // USW 48 Gen2 no PoE  — 48× 1G RJ45 (no PoE), 4× SFP
  USL48: {
    kind: "switch", frontStyle: "quad-row",
    rows: [range(1, 12), range(13, 24), range(25, 36), range(37, 48)],
    portCount: 52, displayModel: "USW 48", theme: "silver",
    // no poePortRange
    specialSlots: [
      { key: "sfp_1", label: "SFP 1", port: 49 },
      { key: "sfp_2", label: "SFP 2", port: 50 },
      { key: "sfp_3", label: "SFP 3", port: 51 },
      { key: "sfp_4", label: "SFP 4", port: 52 },
    ],
  },

  // USW 48 PoE Gen2  — 48× 1G RJ45, Ports 1-32: PoE+, Ports 33-48: no PoE, 4× SFP
  USL48P: {
    kind: "switch", frontStyle: "quad-row",
    rows: [range(1, 12), range(13, 24), range(25, 36), range(37, 48)],
    portCount: 52, displayModel: "USW 48 PoE", theme: "silver",
    poePortRange: [1, 32],
    specialSlots: [
      { key: "sfp_1", label: "SFP 1", port: 49 },
      { key: "sfp_2", label: "SFP 2", port: 50 },
      { key: "sfp_3", label: "SFP 3", port: 51 },
      { key: "sfp_4", label: "SFP 4", port: 52 },
    ],
  },

  // USW 48 PoE (legacy firmware key)  — identisch zu USL48P
  USW48P: {
    kind: "switch", frontStyle: "quad-row",
    rows: [range(1, 12), range(13, 24), range(25, 36), range(37, 48)],
    portCount: 52, displayModel: "USW 48 PoE", theme: "silver",
    poePortRange: [1, 32],
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

  // USW Pro 24 PoE  — 24× 1G RJ45, Ports 1-16: PoE+, 17-24: no PoE, 2× 10G SFP+
  US24PRO: {
    kind: "switch", frontStyle: "six-grid",
    rows: [range(1, 6), range(7, 12), range(13, 18), range(19, 24)],
    portCount: 26, displayModel: "USW Pro 24 PoE", theme: "silver",
    poePortRange: [1, 16],
    specialSlots: [
      { key: "sfp_1", label: "SFP+ 1", port: 25 },
      { key: "sfp_2", label: "SFP+ 2", port: 26 },
    ],
  },

  // USW Pro 24 no PoE  — 24× 1G RJ45 (no PoE), 2× 10G SFP+
  US24PRO2: {
    kind: "switch", frontStyle: "six-grid",
    rows: [range(1, 6), range(7, 12), range(13, 18), range(19, 24)],
    portCount: 26, displayModel: "USW Pro 24", theme: "silver",
    // no poePortRange
    specialSlots: [
      { key: "sfp_1", label: "SFP+ 1", port: 25 },
      { key: "sfp_2", label: "SFP+ 2", port: 26 },
    ],
  },

  // USW Pro 48 PoE  — 48× 1G RJ45, Ports 1-40: PoE+, 41-48: no PoE, 4× 10G SFP+
  US48PRO: {
    kind: "switch", frontStyle: "quad-row",
    rows: [range(1, 12), range(13, 24), range(25, 36), range(37, 48)],
    portCount: 52, displayModel: "USW Pro 48 PoE", theme: "silver",
    poePortRange: [1, 40],
    specialSlots: [
      { key: "sfp_1", label: "SFP+ 1", port: 49 },
      { key: "sfp_2", label: "SFP+ 2", port: 50 },
      { key: "sfp_3", label: "SFP+ 3", port: 51 },
      { key: "sfp_4", label: "SFP+ 4", port: 52 },
    ],
  },

  // USW Pro 48 no PoE  — 48× 1G RJ45 (no PoE), 4× 10G SFP+
  US48PRO2: {
    kind: "switch", frontStyle: "quad-row",
    rows: [range(1, 12), range(13, 24), range(25, 36), range(37, 48)],
    portCount: 52, displayModel: "USW Pro 48", theme: "silver",
    // no poePortRange
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

  // USW Enterprise 8 PoE  — 8× 1G RJ45 PoE+ (all), 2× 10G SFP+
  US68P: {
    kind: "switch", frontStyle: "single-row", rows: [range(1, 8)],
    portCount: 10, displayModel: "USW Enterprise 8 PoE", theme: "silver",
    poePortRange: [1, 8],
    specialSlots: [
      { key: "sfp_1", label: "SFP+ 1", port: 9  },
      { key: "sfp_2", label: "SFP+ 2", port: 10 },
    ],
  },

  // USW Enterprise 24 PoE  — 24× RJ45 PoE+ (all: 12× 2.5G + 12× 1G), 2× 10G SFP+
  US624P: {
    kind: "switch", frontStyle: "six-grid",
    rows: [range(1, 6), range(7, 12), range(13, 18), range(19, 24)],
    portCount: 26, displayModel: "USW Enterprise 24 PoE", theme: "silver",
    poePortRange: [1, 24],
    specialSlots: [
      { key: "sfp_1", label: "SFP+ 1", port: 25 },
      { key: "sfp_2", label: "SFP+ 2", port: 26 },
    ],
  },

  // USW Enterprise 48 PoE  — 48× 2.5G RJ45 PoE+ (all), 4× 10G SFP+
  US648P: {
    kind: "switch", frontStyle: "quad-row",
    rows: [range(1, 12), range(13, 24), range(25, 36), range(37, 48)],
    portCount: 52, displayModel: "USW Enterprise 48 PoE", theme: "silver",
    poePortRange: [1, 48],
    specialSlots: [
      { key: "sfp_1", label: "SFP+ 1", port: 49 },
      { key: "sfp_2", label: "SFP+ 2", port: 50 },
      { key: "sfp_3", label: "SFP+ 3", port: 51 },
      { key: "sfp_4", label: "SFP+ 4", port: 52 },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // SWITCHES — Aggregation (all SFP, no PoE)
  // ══════════════════════════════════════════════════════════════════════════

  // USW Aggregation  — 8× 10G SFP+ only, no RJ45, no PoE
  USL8A: {
    kind: "switch", frontStyle: "single-row", rows: [],
    portCount: 8, displayModel: "USW Aggregation", theme: "silver",
    // no poePortRange — SFP-only, no PoE
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

  // USW Pro Aggregation  — 28× 10G SFP+ + 4× 25G SFP28, no PoE
  USAGGPRO: {
    kind: "switch", frontStyle: "single-row", rows: [],
    portCount: 32, displayModel: "USW Pro Aggregation", theme: "silver",
    // no poePortRange — SFP-only, no PoE
    specialSlots: [
      ...range(1, 28).map((p) => ({ key: `sfp_${p}`, label: `SFP+ ${p}`, port: p })),
      { key: "sfp28_1", label: "25G 1", port: 29 },
      { key: "sfp28_2", label: "25G 2", port: 30 },
      { key: "sfp28_3", label: "25G 3", port: 31 },
      { key: "sfp28_4", label: "25G 4", port: 32 },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // SWITCHES — USW Ultra family (all LAN ports have PoE)
  // ══════════════════════════════════════════════════════════════════════════

  // USW Ultra  — 6× 1G RJ45 PoE+ (all), Port 7 = SFP+ Uplink (no PoE)
  USWULTRA: {
    kind: "switch", frontStyle: "ultra-row", rows: [range(1, 6)],
    portCount: 7, displayModel: "USW Ultra", theme: "white",
    poePortRange: [1, 6],
    specialSlots: [{ key: "uplink", label: "Uplink", port: 7 }],
  },
  USWULTRA60W: {
    kind: "switch", frontStyle: "ultra-row", rows: [range(1, 6)],
    portCount: 7, displayModel: "USW Ultra 60W", theme: "white",
    poePortRange: [1, 6],
    specialSlots: [{ key: "uplink", label: "Uplink", port: 7 }],
  },
  USWULTRA210W: {
    kind: "switch", frontStyle: "ultra-row", rows: [range(1, 6)],
    portCount: 7, displayModel: "USW Ultra 210W", theme: "white",
    poePortRange: [1, 6],
    specialSlots: [{ key: "uplink", label: "Uplink", port: 7 }],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // GATEWAYS — no PoE output on any port
  // ══════════════════════════════════════════════════════════════════════════

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
  UCGMAX: {
    kind: "gateway", frontStyle: "gateway-single-row", rows: [[1, 2, 3, 4]],
    portCount: 5, displayModel: "Cloud Gateway Max", theme: "white",
    specialSlots: [{ key: "wan", label: "WAN", port: 5 }],
  },
  UCGFIBER: {
    kind: "gateway", frontStyle: "gateway-single-row", rows: [[1, 2, 3, 4]],
    portCount: 7, displayModel: "Cloud Gateway Fiber", theme: "white",
    specialSlots: [
      { key: "sfp_1", label: "SFP+ 1", port: 5 },
      { key: "wan",   label: "WAN",    port: 6 },
      { key: "sfp_2", label: "SFP+ 2", port: 7 },
    ],
  },
  UDMPRO: {
    kind: "gateway", frontStyle: "gateway-rack", rows: [range(1, 8)],
    portCount: 11, displayModel: "UDM Pro", theme: "silver",
    specialSlots: [
      { key: "wan",   label: "WAN",    port: 9  },
      { key: "sfp_1", label: "SFP+ 1", port: 10 },
      { key: "sfp_2", label: "SFP+ 2", port: 11 },
    ],
  },
  // ⚠ API key is UDMPROSE, not UDMSE
  UDMPROSE: {
    kind: "gateway", frontStyle: "gateway-rack", rows: [range(1, 8)],
    portCount: 11, displayModel: "UDM SE", theme: "silver",
    specialSlots: [
      { key: "wan",   label: "WAN",    port: 9  },
      { key: "sfp_1", label: "SFP+ 1", port: 10 },
      { key: "sfp_2", label: "SFP+ 2", port: 11 },
    ],
  },
  UXGPRO: {
    kind: "gateway", frontStyle: "gateway-rack", rows: [[1]],
    portCount: 4, displayModel: "UXG-Pro", theme: "silver",
    specialSlots: [
      { key: "wan",   label: "WAN",      port: 2 },
      { key: "sfp_1", label: "SFP+ LAN", port: 3 },
      { key: "sfp_2", label: "SFP+ WAN", port: 4 },
    ],
  },
  // UXG-Lite — API key UXGL (unconfirmed, device too new for official table)
  UXGL: {
    kind: "gateway", frontStyle: "gateway-single-row", rows: [[1]],
    portCount: 2, displayModel: "UXG-Lite", theme: "white",
    specialSlots: [{ key: "wan", label: "WAN", port: 2 }],
  },
  UGW3: {
    kind: "gateway", frontStyle: "gateway-single-row", rows: [[2]],
    portCount: 3, displayModel: "UniFi Security Gateway", theme: "white",
    specialSlots: [
      { key: "wan",  label: "WAN",   port: 1 },
      { key: "wan2", label: "WAN 2", port: 3 },
    ],
  },
  UGW4: {
    kind: "gateway", frontStyle: "gateway-rack", rows: [[3, 4]],
    portCount: 6, displayModel: "USG Pro 4", theme: "silver",
    specialSlots: [
      { key: "wan",   label: "WAN 1", port: 1 },
      { key: "wan2",  label: "WAN 2", port: 2 },
      { key: "sfp_1", label: "SFP 1", port: 5 },
      { key: "sfp_2", label: "SFP 2", port: 6 },
    ],
  },
};


export function resolveModelKey(device) {
  const candidates = [device?.model, device?.hw_version, device?.name, device?.name_by_user]
    .filter(Boolean)
    .map(normalizeModelKey);

  for (const candidate of candidates) {
    if (!candidate) continue;

    // ── 1. Direct registry hit — always fastest and most precise ────────────
    if (MODEL_REGISTRY[candidate]) return candidate;

    // ── 2. Gateways — before any switch rules ───────────────────────────────
    // UDMPROSE must come before UDMPRO
    if (candidate.includes("UDMPROSE"))           return "UDMPROSE";
    if (candidate.includes("UDMSE"))              return "UDMPROSE";   // legacy alias
    if (candidate.includes("UDMPRO"))             return "UDMPRO";
    // Cloud Gateways — UCGFIBER before UCGMAX/UCGULTRA
    if (candidate.includes("UCGFIBER"))           return "UCGFIBER";
    if (candidate.includes("CLOUDGATEWAYFIBER"))  return "UCGFIBER";
    if (candidate.includes("UDRULT"))             return "UDRULT";
    if (candidate.includes("UCGULTRA"))           return "UCGULTRA";
    if (candidate.includes("CLOUDGATEWAYULTRA"))  return "UCGULTRA";
    if (candidate.includes("UCGMAX"))             return "UCGMAX";
    if (candidate.includes("CLOUDGATEWAYMAX"))    return "UCGMAX";
    // UXG
    if (candidate === "UXGPRO")                   return "UXGPRO";
    if (candidate.includes("UXGPRO"))             return "UXGPRO";
    if (candidate === "UXGL")                     return "UXGL";
    if (candidate.includes("UXGLITE"))            return "UXGL";
    if (candidate.includes("UXGL"))               return "UXGL";
    // Legacy USG
    if (candidate === "UGW3")                     return "UGW3";
    if (candidate.includes("USG3P"))              return "UGW3";
    if (candidate.includes("USG3"))               return "UGW3";
    if (candidate === "UGW4")                     return "UGW4";
    if (candidate.includes("USGPRO4"))            return "UGW4";
    if (candidate.includes("USG4"))               return "UGW4";

    // ── 3. Switches — Aggregation (Pro before Standard) ─────────────────────
    // Must be early — "AGGREGATIONPRO" contains "AGGREGATION"
    if (candidate === "USAGGPRO")                 return "USAGGPRO";
    if (candidate.includes("PROAGGREGATION"))     return "USAGGPRO";
    if (candidate.includes("AGGREGATIONPRO"))     return "USAGGPRO";   // USWAGGREGATIONPRO
    if (candidate === "USL8A")                    return "USL8A";
    if (candidate.includes("USWAGGREGATION"))     return "USL8A";
    if (candidate.includes("SWITCHAGGREGATION"))  return "USL8A";

    // ── 4. Switches — Enterprise (before Lite/generic 8/16/48/24 rules) ─────
    // Enterprise 48 before 24 before 8 (longer strings first)
    if (candidate === "US648P")                   return "US648P";
    if (candidate.includes("ENTERPRISE48"))       return "US648P";
    if (candidate === "US624P")                   return "US624P";
    if (candidate.includes("ENTERPRISE24"))       return "US624P";
    if (candidate === "US68P")                    return "US68P";
    if (candidate.includes("ENTERPRISE8"))        return "US68P";

    // ── 5. Switches — Pro 48 (PoE before non-PoE, before generic 48 rules) ──
    if (candidate === "US48PRO")                  return "US48PRO";
    if (candidate.includes("US48PRO2"))           return "US48PRO2";
    if (candidate.includes("US48PRO"))            return "US48PRO";   // catches US48PRO + any suffix except 2
    if (candidate.includes("USWPRO48POE"))        return "US48PRO";
    if (candidate.includes("PRO48POE"))           return "US48PRO";
    if (candidate.includes("USWPRO48"))           return "US48PRO2";
    if (candidate.includes("PRO48"))              return "US48PRO2";

    // ── 6. Switches — Pro 24 (PoE before non-PoE) ───────────────────────────
    if (candidate === "US24PRO2")                 return "US24PRO2";
    if (candidate.includes("US24PRO2"))           return "US24PRO2";
    if (candidate === "US24PRO")                  return "US24PRO";
    if (candidate.includes("USWPRO24POE"))        return "US24PRO";
    if (candidate.includes("PRO24POE"))           return "US24PRO";
    if (candidate.includes("US24PRO"))            return "US24PRO";
    if (candidate.includes("USWPRO24"))           return "US24PRO2";  // no PoE suffix → non-PoE
    if (candidate.includes("SWITCHPRO24"))        return "US24PRO2";

    // ── 7. Switches — Lite series (LITE keyword required, not generic USW) ───
    if (candidate.includes("USL16LPB"))           return "USL16LPB";
    if (candidate.includes("USL16LP"))            return "USL16LP";
    if (candidate.includes("USWLITE16"))          return "USL16LPB";
    if (candidate.includes("LITE16"))             return "USL16LPB";
    if (candidate.includes("LITE") && candidate.includes("16")) return "USL16LPB";

    if (candidate.includes("USL8LPB"))            return "USL8LPB";
    if (candidate.includes("USL8LP"))             return "USL8LP";
    if (candidate.includes("USWLITE8"))           return "USL8LPB";
    if (candidate.includes("LITE8"))              return "USL8LPB";
    if (candidate.includes("LITE") && candidate.includes("8")) return "USL8LPB";

    // ── 8. Switches — Gen1 ──────────────────────────────────────────────────
    if (candidate.includes("US8P60"))             return "US8P60";
    if (candidate.includes("US860W"))             return "US8P60";
    if (candidate.includes("US8P150"))            return "US8P150";
    if (candidate.includes("US8150W"))            return "US8P150";
    // US16P must come before US16 generic to avoid catching USL16P
    if (candidate.includes("US16P150"))           return "US16P150";
    if (candidate.includes("US16POE150"))         return "US16P150";
    if (candidate.includes("US16150W"))           return "US16P150";

    // ── 9. Switches — Mini / Flex ────────────────────────────────────────────
    if (candidate.includes("USMINI"))             return "USMINI";
    if (candidate.includes("FLEXMINI"))           return "USMINI";
    if (candidate.includes("USWFLEXMINI"))        return "USMINI";
    if (candidate === "USF5P")                    return "USF5P";
    if (candidate.includes("USWFLEX"))            return "USF5P";

    // ── 10. Switches — Ultra family ──────────────────────────────────────────
    if (candidate === "USWULTRA210W")             return "USWULTRA210W";
    if (candidate === "USWULTRA60W")              return "USWULTRA60W";
    if (candidate === "USWULTRA")                 return "USWULTRA";
    if (candidate.includes("USWULTRA210"))        return "USWULTRA210W";
    if (candidate.includes("USWULTRA60"))         return "USWULTRA60W";
    if (candidate.includes("USWULTRA"))           return "USWULTRA";
    if (candidate.includes("SWITCHULTRA210"))     return "USWULTRA210W";
    if (candidate.includes("SWITCHULTRA60"))      return "USWULTRA60W";
    if (candidate.includes("SWITCHULTRA"))        return "USWULTRA";

    // ── 11. Switches — Gen2 Standard 16/24/48 ────────────────────────────────
    // USL16P = Gen2 16-port PoE (distinct from Lite-16 and US-16-150W)
    if (candidate === "USL16P")                   return "USL16P";
    if (candidate.includes("USW16POE"))           return "USL16P";    // USW-16-PoE
    if (candidate.includes("USW16P"))             return "USL16P";

    // 24-port: G2 (no PoE) before generic, PoE-suffix → PoE
    if (candidate === "USL24P")                   return "USL24P";
    if (candidate === "USL24")                    return "USL24";
    if (candidate.includes("USW24G2"))            return "USL24";     // USW-24-G2
    if (candidate.includes("USW24POE"))           return "USL24P";    // USW-24-PoE

    // 48-port: G2 (no PoE) before generic, PoE-suffix → PoE
    if (candidate === "USL48P")                   return "USL48P";
    if (candidate === "USL48")                    return "USL48";
    if (candidate.includes("USW48G2"))            return "USL48";     // USW-48-G2
    if (candidate.includes("USW48POE"))           return "USL48P";    // USW-48-PoE

    // ── 12. Generic fallbacks (last resort) ──────────────────────────────────
    // Only reached if nothing specific matched above
    if (candidate.includes("USW24"))              return "USL24P";    // assume PoE
    if (candidate.includes("USW48"))              return "USL48P";    // assume PoE
    // Gen1 US-24-*/US-48-* (e.g. US-24-250W → US24250W, US-48-500W → US48500W)
    if (candidate.startsWith("US24"))             return "USL24P";
    if (candidate.startsWith("US48"))             return "USL48P";
  }

  return null;
}

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
