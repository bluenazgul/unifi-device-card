/* UniFi Device Card 0.0.0-dev.6a011d8 */

// src/model-registry.js
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
var MODEL_REGISTRY = {
  // ══════════════════════════════════════════════════════════════════════════
  // SWITCHES — Generation 1 (US-*)
  // ══════════════════════════════════════════════════════════════════════════
  // US 8 60W  — 8× 1G RJ45, PoE on ports 5-8
  US8P60: {
    kind: "switch",
    frontStyle: "single-row",
    rows: [range(1, 8)],
    portCount: 8,
    displayModel: "US 8 60W",
    theme: "silver",
    poePortRange: [5, 8],
    specialSlots: []
  },
  // US 8 150W  — 8× 1G RJ45 PoE (all), 2× 1G SFP
  US8P150: {
    kind: "switch",
    frontStyle: "single-row",
    rows: [range(1, 8)],
    portCount: 10,
    displayModel: "US 8 150W",
    theme: "silver",
    poePortRange: [1, 8],
    specialSlots: [
      { key: "sfp_1", label: "SFP 1", port: 9 },
      { key: "sfp_2", label: "SFP 2", port: 10 }
    ]
  },
  // US 16 PoE 150W  — 16× 1G RJ45 PoE (all), 2× 1G SFP
  US16P150: {
    kind: "switch",
    frontStyle: "dual-row",
    rows: [range(1, 8), range(9, 16)],
    portCount: 18,
    displayModel: "US 16 PoE 150W",
    theme: "silver",
    poePortRange: [1, 16],
    specialSlots: [
      { key: "sfp_1", label: "SFP 1", port: 17 },
      { key: "sfp_2", label: "SFP 2", port: 18 }
    ]
  },
  // ══════════════════════════════════════════════════════════════════════════
  // SWITCHES — Generation 2 Standard (USW-*)
  // ══════════════════════════════════════════════════════════════════════════
  // USW Flex Mini  — 5× 1G RJ45, no PoE out
  USMINI: {
    kind: "switch",
    frontStyle: "single-row",
    rows: [range(1, 5)],
    portCount: 5,
    displayModel: "USW Flex Mini",
    theme: "white",
    specialSlots: []
  },
  // USW Flex  — 4× 1G RJ45 PoE-out (1-4), Port 5 uplink / PoE-in
  USF5P: {
    kind: "switch",
    frontStyle: "single-row",
    rows: [range(1, 4)],
    portCount: 5,
    displayModel: "USW Flex",
    theme: "white",
    poePortRange: [1, 4],
    specialSlots: [{ key: "uplink", label: "Uplink", port: 5 }]
  },
  // USW Lite 8 PoE  — 8× 1G RJ45, Ports 1-4 PoE+
  USL8LP: {
    kind: "switch",
    frontStyle: "single-row",
    rows: [range(1, 8)],
    portCount: 8,
    displayModel: "USW Lite 8 PoE",
    theme: "white",
    poePortRange: [1, 4],
    specialSlots: []
  },
  USL8LPB: {
    kind: "switch",
    frontStyle: "single-row",
    rows: [range(1, 8)],
    portCount: 8,
    displayModel: "USW Lite 8 PoE",
    theme: "white",
    poePortRange: [1, 4],
    specialSlots: []
  },
  // USW Lite 16 PoE  — 16× 1G RJ45, Ports 1-8 PoE+
  USL16LP: {
    kind: "switch",
    frontStyle: "dual-row",
    rows: [oddRange(1, 16), evenRange(1, 16)],
    portCount: 16,
    displayModel: "USW Lite 16 PoE",
    theme: "white",
    poePortRange: [1, 8],
    specialSlots: []
  },
  USL16LPB: {
    kind: "switch",
    frontStyle: "dual-row",
    rows: [oddRange(1, 16), evenRange(1, 16)],
    portCount: 16,
    displayModel: "USW Lite 16 PoE",
    theme: "white",
    poePortRange: [1, 8],
    specialSlots: []
  },
  // USW 16 PoE Gen2  — 16× 1G RJ45, Ports 1-8 PoE+, 2× SFP
  USL16P: {
    kind: "switch",
    frontStyle: "dual-row",
    rows: [range(1, 8), range(9, 16)],
    portCount: 18,
    displayModel: "USW 16 PoE",
    theme: "silver",
    poePortRange: [1, 8],
    specialSlots: [
      { key: "sfp_1", label: "SFP 1", port: 17 },
      { key: "sfp_2", label: "SFP 2", port: 18 }
    ]
  },
  // USW 24 Gen2  — 24× 1G RJ45, 2× SFP
  USL24: {
    kind: "switch",
    frontStyle: "six-grid",
    rows: [range(1, 6), range(7, 12), range(13, 18), range(19, 24)],
    portCount: 26,
    displayModel: "USW 24",
    theme: "silver",
    specialSlots: [
      { key: "sfp_1", label: "SFP 1", port: 25 },
      { key: "sfp_2", label: "SFP 2", port: 26 }
    ]
  },
  // USW 24 PoE Gen2  — 24× 1G RJ45, Ports 1-16 PoE+, 2× SFP
  USL24P: {
    kind: "switch",
    frontStyle: "six-grid",
    rows: [range(1, 6), range(7, 12), range(13, 18), range(19, 24)],
    portCount: 26,
    displayModel: "USW 24 PoE",
    theme: "silver",
    poePortRange: [1, 16],
    specialSlots: [
      { key: "sfp_1", label: "SFP 1", port: 25 },
      { key: "sfp_2", label: "SFP 2", port: 26 }
    ]
  },
  USW24P: {
    kind: "switch",
    frontStyle: "six-grid",
    rows: [range(1, 6), range(7, 12), range(13, 18), range(19, 24)],
    portCount: 26,
    displayModel: "USW 24 PoE",
    theme: "silver",
    poePortRange: [1, 16],
    specialSlots: [
      { key: "sfp_1", label: "SFP 1", port: 25 },
      { key: "sfp_2", label: "SFP 2", port: 26 }
    ]
  },
  // USW 48 Gen2  — 48× 1G RJ45, 4× SFP
  USL48: {
    kind: "switch",
    frontStyle: "quad-row",
    rows: [range(1, 12), range(13, 24), range(25, 36), range(37, 48)],
    portCount: 52,
    displayModel: "USW 48",
    theme: "silver",
    specialSlots: [
      { key: "sfp_1", label: "SFP 1", port: 49 },
      { key: "sfp_2", label: "SFP 2", port: 50 },
      { key: "sfp_3", label: "SFP 3", port: 51 },
      { key: "sfp_4", label: "SFP 4", port: 52 }
    ]
  },
  // USW 48 PoE Gen2  — 48× 1G RJ45, Ports 1-32 PoE+, 4× SFP
  USL48P: {
    kind: "switch",
    frontStyle: "quad-row",
    rows: [range(1, 12), range(13, 24), range(25, 36), range(37, 48)],
    portCount: 52,
    displayModel: "USW 48 PoE",
    theme: "silver",
    poePortRange: [1, 32],
    specialSlots: [
      { key: "sfp_1", label: "SFP 1", port: 49 },
      { key: "sfp_2", label: "SFP 2", port: 50 },
      { key: "sfp_3", label: "SFP 3", port: 51 },
      { key: "sfp_4", label: "SFP 4", port: 52 }
    ]
  },
  USW48P: {
    kind: "switch",
    frontStyle: "quad-row",
    rows: [range(1, 12), range(13, 24), range(25, 36), range(37, 48)],
    portCount: 52,
    displayModel: "USW 48 PoE",
    theme: "silver",
    poePortRange: [1, 32],
    specialSlots: [
      { key: "sfp_1", label: "SFP 1", port: 49 },
      { key: "sfp_2", label: "SFP 2", port: 50 },
      { key: "sfp_3", label: "SFP 3", port: 51 },
      { key: "sfp_4", label: "SFP 4", port: 52 }
    ]
  },
  // ══════════════════════════════════════════════════════════════════════════
  // SWITCHES — Professional
  // ══════════════════════════════════════════════════════════════════════════
  US24PRO: {
    kind: "switch",
    frontStyle: "six-grid",
    rows: [range(1, 6), range(7, 12), range(13, 18), range(19, 24)],
    portCount: 26,
    displayModel: "USW Pro 24 PoE",
    theme: "silver",
    poePortRange: [1, 16],
    specialSlots: [
      { key: "sfp_1", label: "SFP+ 1", port: 25 },
      { key: "sfp_2", label: "SFP+ 2", port: 26 }
    ]
  },
  US24PRO2: {
    kind: "switch",
    frontStyle: "six-grid",
    rows: [range(1, 6), range(7, 12), range(13, 18), range(19, 24)],
    portCount: 26,
    displayModel: "USW Pro 24",
    theme: "silver",
    specialSlots: [
      { key: "sfp_1", label: "SFP+ 1", port: 25 },
      { key: "sfp_2", label: "SFP+ 2", port: 26 }
    ]
  },
  US48PRO: {
    kind: "switch",
    frontStyle: "quad-row",
    rows: [range(1, 12), range(13, 24), range(25, 36), range(37, 48)],
    portCount: 52,
    displayModel: "USW Pro 48 PoE",
    theme: "silver",
    poePortRange: [1, 40],
    specialSlots: [
      { key: "sfp_1", label: "SFP+ 1", port: 49 },
      { key: "sfp_2", label: "SFP+ 2", port: 50 },
      { key: "sfp_3", label: "SFP+ 3", port: 51 },
      { key: "sfp_4", label: "SFP+ 4", port: 52 }
    ]
  },
  US48PRO2: {
    kind: "switch",
    frontStyle: "quad-row",
    rows: [range(1, 12), range(13, 24), range(25, 36), range(37, 48)],
    portCount: 52,
    displayModel: "USW Pro 48",
    theme: "silver",
    specialSlots: [
      { key: "sfp_1", label: "SFP+ 1", port: 49 },
      { key: "sfp_2", label: "SFP+ 2", port: 50 },
      { key: "sfp_3", label: "SFP+ 3", port: 51 },
      { key: "sfp_4", label: "SFP+ 4", port: 52 }
    ]
  },
  // ══════════════════════════════════════════════════════════════════════════
  // SWITCHES — Enterprise
  // ══════════════════════════════════════════════════════════════════════════
  US68P: {
    kind: "switch",
    frontStyle: "single-row",
    rows: [range(1, 8)],
    portCount: 10,
    displayModel: "USW Enterprise 8 PoE",
    theme: "silver",
    poePortRange: [1, 8],
    specialSlots: [
      { key: "sfp_1", label: "SFP+ 1", port: 9 },
      { key: "sfp_2", label: "SFP+ 2", port: 10 }
    ]
  },
  US624P: {
    kind: "switch",
    frontStyle: "six-grid",
    rows: [range(1, 6), range(7, 12), range(13, 18), range(19, 24)],
    portCount: 26,
    displayModel: "USW Enterprise 24 PoE",
    theme: "silver",
    poePortRange: [1, 24],
    specialSlots: [
      { key: "sfp_1", label: "SFP+ 1", port: 25 },
      { key: "sfp_2", label: "SFP+ 2", port: 26 }
    ]
  },
  US648P: {
    kind: "switch",
    frontStyle: "quad-row",
    rows: [range(1, 12), range(13, 24), range(25, 36), range(37, 48)],
    portCount: 52,
    displayModel: "USW Enterprise 48 PoE",
    theme: "silver",
    poePortRange: [1, 48],
    specialSlots: [
      { key: "sfp_1", label: "SFP+ 1", port: 49 },
      { key: "sfp_2", label: "SFP+ 2", port: 50 },
      { key: "sfp_3", label: "SFP+ 3", port: 51 },
      { key: "sfp_4", label: "SFP+ 4", port: 52 }
    ]
  },
  // ══════════════════════════════════════════════════════════════════════════
  // SWITCHES — Aggregation
  // ══════════════════════════════════════════════════════════════════════════
  USL8A: {
    kind: "switch",
    frontStyle: "single-row",
    rows: [],
    portCount: 8,
    displayModel: "USW Aggregation",
    theme: "silver",
    specialSlots: [
      { key: "sfp_1", label: "SFP+ 1", port: 1 },
      { key: "sfp_2", label: "SFP+ 2", port: 2 },
      { key: "sfp_3", label: "SFP+ 3", port: 3 },
      { key: "sfp_4", label: "SFP+ 4", port: 4 },
      { key: "sfp_5", label: "SFP+ 5", port: 5 },
      { key: "sfp_6", label: "SFP+ 6", port: 6 },
      { key: "sfp_7", label: "SFP+ 7", port: 7 },
      { key: "sfp_8", label: "SFP+ 8", port: 8 }
    ]
  },
  USAGGPRO: {
    kind: "switch",
    frontStyle: "single-row",
    rows: [],
    portCount: 32,
    displayModel: "USW Pro Aggregation",
    theme: "silver",
    specialSlots: [
      ...range(1, 28).map((p) => ({ key: `sfp_${p}`, label: `SFP+ ${p}`, port: p })),
      { key: "sfp28_1", label: "25G 1", port: 29 },
      { key: "sfp28_2", label: "25G 2", port: 30 },
      { key: "sfp28_3", label: "25G 3", port: 31 },
      { key: "sfp28_4", label: "25G 4", port: 32 }
    ]
  },
  // ══════════════════════════════════════════════════════════════════════════
  // SWITCHES — Ultra family
  // ══════════════════════════════════════════════════════════════════════════
  // 8 total RJ45; one is PoE++ input / uplink, seven are LAN PoE out
  USWULTRA: {
    kind: "switch",
    frontStyle: "single-row",
    rows: [range(1, 7)],
    portCount: 8,
    displayModel: "USW Ultra",
    theme: "white",
    poePortRange: [1, 7],
    specialSlots: [{ key: "uplink", label: "Uplink", port: 8 }]
  },
  USWULTRA60W: {
    kind: "switch",
    frontStyle: "single-row",
    rows: [range(1, 7)],
    portCount: 8,
    displayModel: "USW Ultra 60W",
    theme: "white",
    poePortRange: [1, 7],
    specialSlots: [{ key: "uplink", label: "Uplink", port: 8 }]
  },
  USWULTRA210W: {
    kind: "switch",
    frontStyle: "single-row",
    rows: [range(1, 7)],
    portCount: 8,
    displayModel: "USW Ultra 210W",
    theme: "white",
    poePortRange: [1, 7],
    specialSlots: [{ key: "uplink", label: "Uplink", port: 8 }]
  },
  // ══════════════════════════════════════════════════════════════════════════
  // GATEWAYS
  // ══════════════════════════════════════════════════════════════════════════
  UCGULTRA: {
    kind: "gateway",
    frontStyle: "gateway-single-row",
    rows: [[1, 2, 3, 4]],
    portCount: 5,
    displayModel: "Cloud Gateway Ultra",
    theme: "white",
    specialSlots: [{ key: "wan", label: "WAN", port: 5 }]
  },
  UDRULT: {
    kind: "gateway",
    frontStyle: "gateway-single-row",
    rows: [[1, 2, 3, 4]],
    portCount: 5,
    displayModel: "Cloud Gateway Ultra",
    theme: "white",
    specialSlots: [{ key: "wan", label: "WAN", port: 5 }]
  },
  UCGMAX: {
    kind: "gateway",
    frontStyle: "gateway-single-row",
    rows: [[1, 2, 3, 4]],
    portCount: 5,
    displayModel: "Cloud Gateway Max",
    theme: "white",
    specialSlots: [{ key: "wan", label: "WAN", port: 5 }]
  },
  UCGFIBER: {
    kind: "gateway",
    frontStyle: "gateway-single-row",
    rows: [[1, 2, 3, 4]],
    portCount: 7,
    displayModel: "Cloud Gateway Fiber",
    theme: "white",
    specialSlots: [
      { key: "wan", label: "WAN", port: 5 },
      { key: "sfp_1", label: "SFP+ LAN", port: 6 },
      { key: "sfp_2", label: "SFP+ WAN", port: 7 }
    ]
  },
  UDMPRO: {
    kind: "gateway",
    frontStyle: "gateway-rack",
    rows: [range(1, 8)],
    portCount: 11,
    displayModel: "UDM Pro",
    theme: "silver",
    specialSlots: [
      { key: "wan", label: "WAN", port: 9 },
      { key: "sfp_1", label: "SFP+ 1", port: 10 },
      { key: "sfp_2", label: "SFP+ 2", port: 11 }
    ]
  },
  UDMPROSE: {
    kind: "gateway",
    frontStyle: "gateway-rack",
    rows: [range(1, 8)],
    portCount: 11,
    displayModel: "UDM SE",
    theme: "silver",
    specialSlots: [
      { key: "wan", label: "WAN", port: 9 },
      { key: "sfp_1", label: "SFP+ 1", port: 10 },
      { key: "sfp_2", label: "SFP+ 2", port: 11 }
    ]
  },
  UXGPRO: {
    kind: "gateway",
    frontStyle: "gateway-rack",
    rows: [[1]],
    portCount: 4,
    displayModel: "UXG-Pro",
    theme: "silver",
    specialSlots: [
      { key: "wan", label: "WAN", port: 2 },
      { key: "sfp_1", label: "SFP+ LAN", port: 3 },
      { key: "sfp_2", label: "SFP+ WAN", port: 4 }
    ]
  },
  UXGL: {
    kind: "gateway",
    frontStyle: "gateway-single-row",
    rows: [[1]],
    portCount: 2,
    displayModel: "UXG-Lite",
    theme: "white",
    specialSlots: [{ key: "wan", label: "WAN", port: 2 }]
  },
  UGW3: {
    kind: "gateway",
    frontStyle: "gateway-single-row",
    rows: [[2]],
    portCount: 3,
    displayModel: "UniFi Security Gateway",
    theme: "white",
    specialSlots: [
      { key: "wan", label: "WAN", port: 1 },
      { key: "wan2", label: "WAN 2", port: 3 }
    ]
  },
  UGW4: {
    kind: "gateway",
    frontStyle: "gateway-rack",
    rows: [[3, 4]],
    portCount: 6,
    displayModel: "USG Pro 4",
    theme: "silver",
    specialSlots: [
      { key: "wan", label: "WAN 1", port: 1 },
      { key: "wan2", label: "WAN 2", port: 2 },
      { key: "sfp_1", label: "SFP 1", port: 5 },
      { key: "sfp_2", label: "SFP 2", port: 6 }
    ]
  }
};
function resolveModelKey(device) {
  const candidates = [device?.model, device?.hw_version, device?.name, device?.name_by_user].filter(Boolean).map(normalizeModelKey);
  for (const candidate of candidates) {
    if (!candidate) continue;
    if (MODEL_REGISTRY[candidate]) return candidate;
    if (candidate.includes("UDMPROSE")) return "UDMPROSE";
    if (candidate.includes("UDMSE")) return "UDMPROSE";
    if (candidate.includes("UDMPRO")) return "UDMPRO";
    if (candidate.includes("UCGFIBER")) return "UCGFIBER";
    if (candidate.includes("CLOUDGATEWAYFIBER")) return "UCGFIBER";
    if (candidate.includes("UDRULT")) return "UDRULT";
    if (candidate.includes("UCGULTRA")) return "UCGULTRA";
    if (candidate.includes("CLOUDGATEWAYULTRA")) return "UCGULTRA";
    if (candidate.includes("UCGMAX")) return "UCGMAX";
    if (candidate.includes("CLOUDGATEWAYMAX")) return "UCGMAX";
    if (candidate === "UXGPRO") return "UXGPRO";
    if (candidate.includes("UXGPRO")) return "UXGPRO";
    if (candidate === "UXGL") return "UXGL";
    if (candidate.includes("UXGLITE")) return "UXGL";
    if (candidate.includes("UXGL")) return "UXGL";
    if (candidate === "UGW3") return "UGW3";
    if (candidate.includes("USG3P")) return "UGW3";
    if (candidate.includes("USG3")) return "UGW3";
    if (candidate === "UGW4") return "UGW4";
    if (candidate.includes("USGPRO4")) return "UGW4";
    if (candidate.includes("USG4")) return "UGW4";
    if (candidate === "USAGGPRO") return "USAGGPRO";
    if (candidate.includes("PROAGGREGATION")) return "USAGGPRO";
    if (candidate.includes("AGGREGATIONPRO")) return "USAGGPRO";
    if (candidate === "USL8A") return "USL8A";
    if (candidate.includes("USWAGGREGATION")) return "USL8A";
    if (candidate.includes("SWITCHAGGREGATION")) return "USL8A";
    if (candidate === "US648P") return "US648P";
    if (candidate.includes("ENTERPRISE48")) return "US648P";
    if (candidate === "US624P") return "US624P";
    if (candidate.includes("ENTERPRISE24")) return "US624P";
    if (candidate === "US68P") return "US68P";
    if (candidate.includes("ENTERPRISE8")) return "US68P";
    if (candidate === "US48PRO") return "US48PRO";
    if (candidate.includes("US48PRO2")) return "US48PRO2";
    if (candidate.includes("US48PRO")) return "US48PRO";
    if (candidate.includes("USWPRO48POE")) return "US48PRO";
    if (candidate.includes("PRO48POE")) return "US48PRO";
    if (candidate.includes("USWPRO48")) return "US48PRO2";
    if (candidate.includes("PRO48")) return "US48PRO2";
    if (candidate === "US24PRO2") return "US24PRO2";
    if (candidate.includes("US24PRO2")) return "US24PRO2";
    if (candidate === "US24PRO") return "US24PRO";
    if (candidate.includes("USWPRO24POE")) return "US24PRO";
    if (candidate.includes("PRO24POE")) return "US24PRO";
    if (candidate.includes("US24PRO")) return "US24PRO";
    if (candidate.includes("USWPRO24")) return "US24PRO2";
    if (candidate.includes("SWITCHPRO24")) return "US24PRO2";
    if (candidate.includes("USL16LPB")) return "USL16LPB";
    if (candidate.includes("USL16LP")) return "USL16LP";
    if (candidate.includes("USWLITE16")) return "USL16LPB";
    if (candidate.includes("LITE16")) return "USL16LPB";
    if (candidate.includes("LITE") && candidate.includes("16")) return "USL16LPB";
    if (candidate.includes("USL8LPB")) return "USL8LPB";
    if (candidate.includes("USL8LP")) return "USL8LP";
    if (candidate.includes("USWLITE8")) return "USL8LPB";
    if (candidate.includes("LITE8")) return "USL8LPB";
    if (candidate.includes("LITE") && candidate.includes("8")) return "USL8LPB";
    if (candidate.includes("US8P60")) return "US8P60";
    if (candidate.includes("US860W")) return "US8P60";
    if (candidate.includes("US8P150")) return "US8P150";
    if (candidate.includes("US8150W")) return "US8P150";
    if (candidate.includes("US16P150")) return "US16P150";
    if (candidate.includes("US16POE150")) return "US16P150";
    if (candidate.includes("US16150W")) return "US16P150";
    if (candidate.includes("USMINI")) return "USMINI";
    if (candidate.includes("FLEXMINI")) return "USMINI";
    if (candidate.includes("USWFLEXMINI")) return "USMINI";
    if (candidate === "USF5P") return "USF5P";
    if (candidate.includes("USWFLEX")) return "USF5P";
    if (candidate === "USWULTRA210W") return "USWULTRA210W";
    if (candidate === "USWULTRA60W") return "USWULTRA60W";
    if (candidate === "USWULTRA") return "USWULTRA";
    if (candidate.includes("USWULTRA210")) return "USWULTRA210W";
    if (candidate.includes("USWULTRA60")) return "USWULTRA60W";
    if (candidate.includes("USWULTRA")) return "USWULTRA";
    if (candidate.includes("SWITCHULTRA210")) return "USWULTRA210W";
    if (candidate.includes("SWITCHULTRA60")) return "USWULTRA60W";
    if (candidate.includes("SWITCHULTRA")) return "USWULTRA";
    if (candidate === "USL16P") return "USL16P";
    if (candidate.includes("USW16POE")) return "USL16P";
    if (candidate.includes("USW16P")) return "USL16P";
    if (candidate === "USL24P") return "USL24P";
    if (candidate === "USL24") return "USL24";
    if (candidate.includes("USW24G2")) return "USL24";
    if (candidate.includes("USW24POE")) return "USL24P";
    if (candidate === "USL48P") return "USL48P";
    if (candidate === "USL48") return "USL48";
    if (candidate.includes("USW48G2")) return "USL48";
    if (candidate.includes("USW48POE")) return "USL48P";
    if (candidate.includes("USW24")) return "USL24P";
    if (candidate.includes("USW48")) return "USL48P";
    if (candidate.startsWith("US24")) return "USL24P";
    if (candidate.startsWith("US48")) return "USL48P";
  }
  return null;
}
function inferPortCountFromModel(device) {
  const text = normalizeModelKey(
    [device?.model, device?.name, device?.name_by_user].filter(Boolean).join(" ")
  );
  if (text.includes("UDMPROSE") || text.includes("UDMSE")) return 11;
  if (text.includes("UDMPRO")) return 11;
  if (text.includes("UCGFIBER") || text.includes("CLOUDGATEWAYFIBER")) return 7;
  if (text.includes("UCGULTRA") || text.includes("CLOUDGATEWAYULTRA") || text.includes("UDRULT")) return 5;
  if (text.includes("UCGMAX") || text.includes("CLOUDGATEWAYMAX")) return 5;
  if (text.includes("UXGPRO")) return 4;
  if (text.includes("UXGL")) return 2;
  if (text.includes("UGW4")) return 6;
  if (text.includes("UGW3")) return 3;
  if (text.includes("USAGGPRO") || text.includes("PROAGGREGATION")) return 32;
  if (text.includes("USL8A") || text.includes("USWAGGREGATION")) return 8;
  if (text.includes("USL16LPB") || text.includes("USL16LP") || text.includes("USWLITE16POE") || text.includes("LITE16")) return 16;
  if (text.includes("USL8LPB") || text.includes("USL8LP") || text.includes("USWLITE8POE") || text.includes("LITE8")) return 8;
  if (text.includes("US8P60") || text.includes("US860W")) return 8;
  if (text.includes("US8P150")) return 10;
  if (text.includes("USMINI") || text.includes("FLEXMINI")) return 5;
  if (text.includes("USF5P") || text.includes("USWFLEX")) return 5;
  if (text.includes("US16P150") || text.includes("US16P")) return 18;
  if (text.includes("USL16P")) return 18;
  if (text.includes("US24PRO2") || text.includes("US24PRO") || text.includes("USWPRO24")) return 26;
  if (text.includes("US48PRO2") || text.includes("US48PRO") || text.includes("USWPRO48")) return 52;
  if (text.includes("US648P") || text.includes("ENTERPRISE48POE")) return 52;
  if (text.includes("US624P") || text.includes("ENTERPRISE24POE")) return 26;
  if (text.includes("US68P") || text.includes("ENTERPRISE8POE")) return 10;
  if (text.includes("USL48P") || text.includes("USL48")) return 52;
  if (text.includes("USL24P") || text.includes("USL24")) return 26;
  if (text.includes("USWULTRA")) return 8;
  if (text.includes("48")) return 48;
  if (text.includes("24")) return 24;
  if (text.includes("16")) return 16;
  return null;
}
function getDeviceLayout(device, discoveredPorts = []) {
  const modelKey = resolveModelKey(device);
  if (modelKey && MODEL_REGISTRY[modelKey]) {
    return { modelKey, ...MODEL_REGISTRY[modelKey] };
  }
  const inferredPortCount = inferPortCountFromModel(device) || (discoveredPorts.length > 0 ? Math.max(...discoveredPorts.map((p) => p.port)) : 0);
  if (inferredPortCount > 0) {
    return {
      modelKey: null,
      ...defaultSwitchLayout(inferredPortCount),
      displayModel: device?.model || `UniFi Device (${inferredPortCount}p)`
    };
  }
  return {
    modelKey: null,
    kind: "gateway",
    frontStyle: "gateway-generic",
    rows: [],
    portCount: 0,
    displayModel: device?.model || "UniFi Gateway",
    specialSlots: []
  };
}

// src/helpers.js
function normalize(value) {
  return String(value ?? "").trim();
}
function lower(value) {
  return normalize(value).toLowerCase();
}
function entityText(entity) {
  return lower(
    [
      entity.entity_id,
      entity.original_name,
      entity.name,
      entity.platform,
      entity.device_class,
      entity.translation_key,
      entity.original_device_class
    ].filter(Boolean).join(" ")
  );
}
function isUnifiConfigEntry(entry) {
  const domain = lower(entry?.domain);
  const title = lower(entry?.title);
  return domain === "unifi" || domain === "unifi_network" || domain.includes("unifi") || title.includes("unifi");
}
function extractUnifiEntryIds(configEntries) {
  return new Set(
    (configEntries || []).filter(isUnifiConfigEntry).map((e) => e.entry_id)
  );
}
function hasUbiquitiManufacturer(device) {
  const m = lower(device?.manufacturer);
  return m.includes("ubiquiti") || m.includes("unifi");
}
var SWITCH_MODEL_PREFIXES = [
  "USW",
  "USL",
  "USF",
  "US8",
  "US16",
  "US24",
  "US48",
  "USMINI",
  "FLEXMINI"
];
var GATEWAY_MODEL_PREFIXES = [
  "UDM",
  "UCG",
  "UXG",
  "UGW",
  "UDRULT",
  "UDMPRO",
  "UDMPROSE"
];
var AP_MODEL_PREFIXES = ["UAP", "U6", "U7", "UAL", "UAPMESH"];
function normalizeModelStr(value) {
  return String(value ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "");
}
function modelStartsWith(device, prefixes) {
  const candidates = [device?.model, device?.hw_version].filter(Boolean).map(normalizeModelStr);
  return prefixes.some((pfx) => candidates.some((c) => c.startsWith(pfx)));
}
function isDefinitelyAP(device) {
  return modelStartsWith(device, AP_MODEL_PREFIXES);
}
function classifyDevice(device, entities) {
  if (isDefinitelyAP(device)) return "access_point";
  const modelKey = resolveModelKey(device);
  if (modelKey) {
    if ([
      "UCGULTRA",
      "UDRULT",
      "UCGMAX",
      "UCGFIBER",
      "UDMPRO",
      "UDMPROSE",
      "UXGPRO",
      "UXGL",
      "UGW3",
      "UGW4"
    ].includes(modelKey)) {
      return "gateway";
    }
    if ([
      "US8P60",
      "US8P150",
      "US16P150",
      "USMINI",
      "USF5P",
      "USL8LP",
      "USL8LPB",
      "USL16LP",
      "USL16LPB",
      "USL16P",
      "USL24",
      "USL24P",
      "USW24P",
      "USL48",
      "USL48P",
      "USW48P",
      "US24PRO",
      "US24PRO2",
      "US48PRO",
      "US48PRO2",
      "US68P",
      "US624P",
      "US648P",
      "USL8A",
      "USAGGPRO",
      "USWULTRA",
      "USWULTRA60W",
      "USWULTRA210W"
    ].includes(modelKey)) {
      return "switch";
    }
  }
  if (modelStartsWith(device, SWITCH_MODEL_PREFIXES)) return "switch";
  if (modelStartsWith(device, GATEWAY_MODEL_PREFIXES)) return "gateway";
  const hasPorts = entities.some((e) => /_port_\d+(?:_|$)/i.test(e.entity_id));
  if (hasPorts) return "switch";
  if (hasUbiquitiManufacturer(device)) {
    const model = lower(device?.model);
    const name = lower(device?.name_by_user || device?.name);
    if (model.includes("udm") || model.includes("ucg") || model.includes("uxg") || model.includes("ugw") || name.includes("gateway")) {
      return "gateway";
    }
    if (model.includes("usw") || model.includes("usl") || model.includes("us8") || name.includes("switch")) {
      return "switch";
    }
  }
  return "unknown";
}
function isIgnorableWSError(err) {
  if (!err) return false;
  const code = err?.code;
  const message = String(err?.message ?? "").toLowerCase();
  return code === 3 || code === "3" || message.includes("disconnected") || message.includes("connection lost") || message.includes("not connected") || message.includes("socket closed");
}
async function safeCallWS(hass, msg, fallback = []) {
  try {
    return await hass.callWS(msg);
  } catch (err) {
    if (!isIgnorableWSError(err)) {
      console.warn("[unifi-device-card] WS failed", msg?.type, err);
    }
    return fallback;
  }
}
var REGISTRY_CACHE_TTL = 2500;
var _registryCache = /* @__PURE__ */ new WeakMap();
async function getAllData(hass) {
  const now = Date.now();
  const cached = _registryCache.get(hass);
  if (cached && now - cached.ts < REGISTRY_CACHE_TTL) {
    return cached.data;
  }
  const [devices, rawEntities] = await Promise.all([
    safeCallWS(hass, { type: "config/device_registry/list" }, cached?.data?.devices || []),
    safeCallWS(
      hass,
      { type: "config/entity_registry/list" },
      Array.from(cached?.data?.entitiesByDevice?.values?.() || []).flat()
    )
  ]);
  const entities = (rawEntities || []).filter((e) => !e.disabled_by && !e.hidden_by);
  const entitiesByDevice = /* @__PURE__ */ new Map();
  for (const entity of entities) {
    if (!entity.device_id) continue;
    if (!entitiesByDevice.has(entity.device_id)) {
      entitiesByDevice.set(entity.device_id, []);
    }
    entitiesByDevice.get(entity.device_id).push(entity);
  }
  const data = {
    devices: devices || [],
    entitiesByDevice,
    configEntries: []
  };
  if ((data.devices?.length || 0) > 0 || entities.length > 0) {
    _registryCache.set(hass, { ts: now, data });
  }
  return data;
}
function isUnifiDevice(device, unifiEntryIds, entities) {
  if (Array.isArray(device?.config_entries) && device.config_entries.some((id) => unifiEntryIds.has(id))) {
    return true;
  }
  if (resolveModelKey(device)) return true;
  if (modelStartsWith(device, [...SWITCH_MODEL_PREFIXES, ...GATEWAY_MODEL_PREFIXES])) {
    return true;
  }
  if (entities.some((e) => /_port_\d+(?:_|$)/i.test(e.entity_id)) && hasUbiquitiManufacturer(device)) {
    return true;
  }
  return false;
}
function buildDeviceLabel(device, type) {
  const name = normalize(device.name_by_user) || normalize(device.name) || normalize(device.model) || "Unknown device";
  const model = normalize(device.model);
  const typeSuffix = type === "gateway" ? "Gateway" : type === "switch" ? "Switch" : type === "access_point" ? "AP" : "Device";
  if (model && !name.includes(model)) {
    return `${name} \xB7 ${model} (${typeSuffix})`;
  }
  return `${name} (${typeSuffix})`;
}
function sortDevices(a, b) {
  const an = lower(a?.label || a?.name || "");
  const bn = lower(b?.label || b?.name || "");
  return an.localeCompare(bn, void 0, {
    numeric: true,
    sensitivity: "base"
  });
}
async function getUnifiDevices(hass) {
  const { devices, entitiesByDevice, configEntries } = await getAllData(hass);
  const unifiEntryIds = extractUnifiEntryIds(configEntries);
  const result = [];
  for (const device of devices || []) {
    const entities = entitiesByDevice.get(device.id) || [];
    if (!entities.length) continue;
    if (!isUnifiDevice(device, unifiEntryIds, entities)) continue;
    const type = classifyDevice(device, entities);
    if (type !== "gateway" && type !== "switch") continue;
    result.push({
      id: device.id,
      label: buildDeviceLabel(device, type),
      name: normalize(device.name_by_user) || normalize(device.name) || normalize(device.model) || "Unknown device",
      model: normalize(device.model),
      type
    });
  }
  return result.sort(sortDevices);
}
async function getDeviceContext(hass, deviceId) {
  const { devices, entitiesByDevice } = await getAllData(hass);
  const device = (devices || []).find((d) => d.id === deviceId) || null;
  if (!device) return null;
  const entities = (entitiesByDevice.get(deviceId) || []).slice();
  const type = classifyDevice(device, entities);
  const layout = getDeviceLayout(device, entities);
  return {
    id: device.id,
    name: normalize(device.name_by_user) || normalize(device.name) || normalize(device.model) || "Unknown device",
    model: normalize(device.model),
    firmware: normalize(device.sw_version || device.firmware_version || ""),
    manufacturer: normalize(device.manufacturer),
    type,
    layout,
    device,
    entities
  };
}
var WARNING_PATTERNS = [
  {
    key: "port_switch",
    match: (entity) => {
      const txt = entityText(entity);
      return entity.platform === "switch" && /port/i.test(txt) && !/poe/i.test(txt);
    }
  },
  {
    key: "poe_switch",
    match: (entity) => {
      const txt = entityText(entity);
      return entity.platform === "switch" && /poe/i.test(txt);
    }
  },
  {
    key: "poe_power",
    match: (entity) => {
      const txt = entityText(entity);
      return entity.platform === "sensor" && /poe/i.test(txt) && /power|consumption|watt/i.test(txt);
    }
  },
  {
    key: "link_speed",
    match: (entity) => {
      const txt = entityText(entity);
      return entity.platform === "sensor" && /speed|link speed/i.test(txt);
    }
  },
  {
    key: "rx_tx",
    match: (entity) => {
      const txt = entityText(entity);
      return entity.platform === "sensor" && /(rx|tx|throughput|traffic)/i.test(txt);
    }
  },
  {
    key: "power_cycle",
    match: (entity) => {
      const txt = entityText(entity);
      return entity.platform === "button" && /power cycle|cycle power|restart port/i.test(txt);
    }
  },
  {
    key: "link",
    match: (entity) => {
      const txt = entityText(entity);
      return /(link|uplink)/i.test(txt);
    }
  }
];
function bucketEntityWarning(entity) {
  for (const def of WARNING_PATTERNS) {
    try {
      if (def.match(entity)) return def.key;
    } catch (_err) {
    }
  }
  return null;
}
async function getRelevantEntityWarningsForDevice(hass, deviceId) {
  const rawEntities = await safeCallWS(
    hass,
    { type: "config/entity_registry/list" },
    []
  );
  const entities = (rawEntities || []).filter((e) => e?.device_id === deviceId);
  const disabled = [];
  const hidden = [];
  const buckets = {
    port_switch: 0,
    poe_switch: 0,
    poe_power: 0,
    link_speed: 0,
    rx_tx: 0,
    power_cycle: 0,
    link: 0
  };
  for (const entity of entities) {
    const isDisabled = !!entity?.disabled_by;
    const isHidden = !!entity?.hidden_by;
    if (!isDisabled && !isHidden) continue;
    const bucket = bucketEntityWarning(entity);
    if (bucket) {
      buckets[bucket] += 1;
    }
    if (isDisabled) disabled.push(entity);
    if (isHidden) hidden.push(entity);
  }
  return {
    disabled,
    hidden,
    buckets,
    disabledCount: disabled.length,
    hiddenCount: hidden.length,
    hasWarnings: disabled.length > 0 || hidden.length > 0
  };
}
function parsePortNumberFromEntityId(entityId) {
  const text = String(entityId || "");
  const patterns = [
    /(?:^|_)port_(\d+)(?:_|$)/i,
    /(?:^|_)eth(\d+)(?:_|$)/i,
    /(?:^|_)(\d+)_(?:link|speed|poe|rx|tx)(?:_|$)/i,
    /(?:^|_)(?:link|speed|poe|rx|tx)_(\d+)(?:_|$)/i
  ];
  for (const re of patterns) {
    const m = text.match(re);
    if (m) return parseInt(m[1], 10);
  }
  return null;
}
function parseSpecialPortKeyFromEntityId(entityId) {
  const text = String(entityId || "").toLowerCase();
  if (/\bwan2\b/.test(text) || /(?:^|_)wan_?2(?:_|$)/.test(text)) return "wan2";
  if (/(?:^|_)wan(?:_|$)/.test(text)) return "wan";
  if (/(?:^|_)sfp_?wan(?:_|$)|(?:^|_)wan_?sfp(?:_|$)/.test(text)) return "sfp_wan";
  const sfpMatch = text.match(/(?:^|_)sfp(?:\+|plus|28)?[_-]?(\d+)(?:_|$)/);
  if (sfpMatch) return `sfp_${sfpMatch[1]}`;
  if (/(?:^|_)sfp(?:\+|plus|28)?(?:_|$)/.test(text)) return "sfp";
  if (/(?:^|_)uplink(?:_|$)/.test(text)) return "uplink";
  return null;
}
function guessEntityRole(entity) {
  const txt = entityText(entity);
  const platform = entity?.platform;
  if (platform === "switch") {
    if (/poe/i.test(txt)) return "poe_switch";
    return "port_switch";
  }
  if (platform === "button") {
    if (/power cycle|cycle power|restart port/i.test(txt)) return "power_cycle";
  }
  if (platform === "sensor") {
    if (/rx|receive/i.test(txt)) return "rx";
    if (/tx|transmit/i.test(txt)) return "tx";
    if (/poe/i.test(txt) && /power|consumption|watt/i.test(txt)) return "poe_power";
    if (/speed|link speed/i.test(txt)) return "speed";
  }
  if (/link|uplink/i.test(txt)) return "link";
  return null;
}
function emptyPort(portNumber) {
  return {
    key: `port-${portNumber}`,
    port: portNumber,
    label: String(portNumber),
    kind: "numbered",
    link_entity: null,
    speed_entity: null,
    poe_switch_entity: null,
    poe_power_entity: null,
    port_switch_entity: null,
    power_cycle_entity: null,
    rx_entity: null,
    tx_entity: null,
    raw_entities: []
  };
}
function emptySpecial(key, port = null) {
  return {
    key,
    port,
    label: key === "wan2" ? "WAN 2" : key === "wan" ? "WAN" : key === "sfp_wan" ? "SFP WAN" : key === "uplink" ? "Uplink" : key.startsWith("sfp_") ? key.replace("sfp_", "SFP ") : key === "sfp" ? "SFP" : key,
    kind: "special",
    link_entity: null,
    speed_entity: null,
    poe_switch_entity: null,
    poe_power_entity: null,
    port_switch_entity: null,
    power_cycle_entity: null,
    rx_entity: null,
    tx_entity: null,
    raw_entities: []
  };
}
function assignRoleToPort(port, role, entityId) {
  if (!port || !role || !entityId) return;
  switch (role) {
    case "link":
      port.link_entity = port.link_entity || entityId;
      break;
    case "speed":
      port.speed_entity = port.speed_entity || entityId;
      break;
    case "poe_switch":
      port.poe_switch_entity = port.poe_switch_entity || entityId;
      break;
    case "poe_power":
      port.poe_power_entity = port.poe_power_entity || entityId;
      break;
    case "port_switch":
      port.port_switch_entity = port.port_switch_entity || entityId;
      break;
    case "power_cycle":
      port.power_cycle_entity = port.power_cycle_entity || entityId;
      break;
    case "rx":
      port.rx_entity = port.rx_entity || entityId;
      break;
    case "tx":
      port.tx_entity = port.tx_entity || entityId;
      break;
    default:
      break;
  }
}
function discoverPorts(entities) {
  const byPort = /* @__PURE__ */ new Map();
  for (const entity of entities || []) {
    const portNumber = parsePortNumberFromEntityId(entity?.entity_id);
    if (!Number.isInteger(portNumber)) continue;
    if (!byPort.has(portNumber)) {
      byPort.set(portNumber, emptyPort(portNumber));
    }
    const port = byPort.get(portNumber);
    port.raw_entities.push(entity.entity_id);
    const role = guessEntityRole(entity);
    assignRoleToPort(port, role, entity.entity_id);
  }
  return Array.from(byPort.values()).sort((a, b) => a.port - b.port);
}
function discoverSpecialPorts(entities) {
  const byKey = /* @__PURE__ */ new Map();
  for (const entity of entities || []) {
    const specialKey = parseSpecialPortKeyFromEntityId(entity?.entity_id);
    if (!specialKey) continue;
    if (!byKey.has(specialKey)) {
      byKey.set(specialKey, emptySpecial(specialKey));
    }
    const port = byKey.get(specialKey);
    port.raw_entities.push(entity.entity_id);
    const role = guessEntityRole(entity);
    assignRoleToPort(port, role, entity.entity_id);
  }
  return Array.from(byKey.values());
}
function cloneSlot(slot) {
  return {
    ...slot,
    raw_entities: Array.isArray(slot?.raw_entities) ? [...slot.raw_entities] : []
  };
}
function createEmptyNumberedPort(portNumber) {
  return emptyPort(portNumber);
}
function mergePortsWithLayout(layout, discoveredPorts) {
  const rows = (layout?.rows || []).flat();
  if (!rows.length) {
    return (discoveredPorts || []).map(cloneSlot).sort((a, b) => (a.port || 999) - (b.port || 999));
  }
  const discoveredByPort = new Map(
    (discoveredPorts || []).filter((slot) => Number.isInteger(slot?.port)).map((slot) => [slot.port, cloneSlot(slot)])
  );
  const merged = [];
  const added = /* @__PURE__ */ new Set();
  for (const portNumber of rows) {
    if (added.has(portNumber)) continue;
    merged.push(
      discoveredByPort.get(portNumber) || createEmptyNumberedPort(portNumber)
    );
    added.add(portNumber);
  }
  for (const slot of discoveredByPort.values()) {
    if (!added.has(slot.port)) {
      merged.push(cloneSlot(slot));
      added.add(slot.port);
    }
  }
  return merged.sort((a, b) => (a.port || 999) - (b.port || 999));
}
function normalizeSpecialLayoutSlot(slot) {
  return {
    key: slot.key,
    port: Number.isInteger(slot.port) ? slot.port : null,
    label: slot.label || (slot.key === "wan2" ? "WAN 2" : slot.key === "wan" ? "WAN" : slot.key === "sfp_wan" ? "SFP WAN" : slot.key === "uplink" ? "Uplink" : slot.key),
    kind: "special"
  };
}
function mergeSpecialsWithLayout(layout, discoveredSpecials, discoveredPorts = []) {
  const layoutSpecials = (layout?.specialSlots || []).map(normalizeSpecialLayoutSlot);
  const discoveredByKey = new Map(
    (discoveredSpecials || []).map((slot) => [slot.key, cloneSlot(slot)])
  );
  const discoveredByPort = new Map(
    (discoveredPorts || []).filter((slot) => Number.isInteger(slot?.port)).map((slot) => [slot.port, cloneSlot(slot)])
  );
  const merged = [];
  const usedKeys = /* @__PURE__ */ new Set();
  for (const layoutSlot of layoutSpecials) {
    const fromKey = discoveredByKey.get(layoutSlot.key);
    const fromPort = layoutSlot.port != null ? discoveredByPort.get(layoutSlot.port) : null;
    const source = fromKey || fromPort || {};
    merged.push({
      ...cloneSlot(source),
      ...layoutSlot,
      key: layoutSlot.key,
      label: layoutSlot.label,
      kind: "special",
      port: layoutSlot.port,
      raw_entities: Array.isArray(source?.raw_entities) ? [...source.raw_entities] : []
    });
    usedKeys.add(layoutSlot.key);
  }
  for (const slot of discoveredSpecials || []) {
    if (usedKeys.has(slot.key)) continue;
    merged.push(cloneSlot(slot));
  }
  return merged;
}
function asNumberedLanPort(slot, portNumber) {
  const base = cloneSlot(slot || createEmptyNumberedPort(portNumber));
  return {
    ...base,
    key: `port-${portNumber}`,
    port: portNumber,
    label: String(portNumber),
    kind: "numbered"
  };
}
function asRoleSpecial(slot, roleKey, roleLabel) {
  const base = cloneSlot(slot || {});
  return {
    ...base,
    key: roleKey,
    label: roleLabel,
    kind: "special"
  };
}
function resolveGatewayRoleSelection(selection, roleKey, layout, specialsByKey) {
  const normalized = String(selection || "auto");
  if (normalized === "none") return null;
  if (!selection || normalized === "auto") {
    const defaultSlot = (layout?.specialSlots || []).find((slot) => slot.key === roleKey);
    if (!defaultSlot) return null;
    if (defaultSlot.port != null) {
      return {
        type: "port",
        port: defaultSlot.port,
        source: "default",
        sourceKey: defaultSlot.key
      };
    }
    return {
      type: "special",
      key: defaultSlot.key,
      source: "default",
      sourceKey: defaultSlot.key
    };
  }
  if (normalized.startsWith("port_")) {
    const portNumber = parseInt(normalized.replace(/^port_/, ""), 10);
    if (Number.isInteger(portNumber)) {
      return { type: "port", port: portNumber, source: "custom", sourceKey: null };
    }
    return null;
  }
  const specialSlot = (layout?.specialSlots || []).find((slot) => slot.key === normalized) || specialsByKey.get(normalized) || null;
  if (!specialSlot) return null;
  if (specialSlot.port != null) {
    return { type: "port", port: specialSlot.port, source: "custom", sourceKey: normalized };
  }
  return { type: "special", key: normalized, source: "custom", sourceKey: normalized };
}
function applyGatewayPortOverrides(config, specials, numbered, layout) {
  const wanPort = config?.wan_port;
  const wan2Port = config?.wan2_port;
  const normalizedWan = String(wanPort || "auto");
  const normalizedWan2 = String(wan2Port || "auto");
  if ((!wanPort || normalizedWan === "auto") && (!wan2Port || normalizedWan2 === "auto")) {
    return { specials, numbered };
  }
  const layoutRows = (layout?.rows || []).flat();
  const originalSpecials = (specials || []).map(cloneSlot);
  const originalNumbered = (numbered || []).map(cloneSlot);
  const specialsByKey = new Map(originalSpecials.map((slot) => [slot.key, slot]));
  const physicalByPort = /* @__PURE__ */ new Map();
  for (const slot of [...originalNumbered, ...originalSpecials]) {
    if (Number.isInteger(slot?.port) && !physicalByPort.has(slot.port)) {
      physicalByPort.set(slot.port, cloneSlot(slot));
    }
  }
  const roleAssignments = /* @__PURE__ */ new Map();
  const wanSelection = resolveGatewayRoleSelection(wanPort, "wan", layout, specialsByKey);
  if (wanSelection) {
    roleAssignments.set("wan", wanSelection);
  }
  const wan2Selection = resolveGatewayRoleSelection(wan2Port, "wan2", layout, specialsByKey);
  if (wan2Selection) {
    const conflictsWithWan = wanSelection?.type === "port" && wan2Selection.type === "port" && wanSelection.port === wan2Selection.port || wanSelection?.type === "special" && wan2Selection.type === "special" && wanSelection.key === wan2Selection.key;
    if (!conflictsWithWan) {
      roleAssignments.set("wan2", wan2Selection);
    }
  }
  const assignedPorts = new Set(
    Array.from(roleAssignments.values()).filter((selection) => selection?.type === "port").map((selection) => selection.port)
  );
  const assignedSpecialKeys = new Set(
    Array.from(roleAssignments.values()).filter((selection) => selection?.type === "special").map((selection) => selection.key)
  );
  const newSpecials = [];
  for (const roleKey of ["wan", "wan2"]) {
    const selection = roleAssignments.get(roleKey);
    if (!selection) continue;
    const roleLabel = roleKey === "wan2" ? "WAN 2" : "WAN";
    if (selection.type === "port") {
      const portData = physicalByPort.get(selection.port) || createEmptyNumberedPort(selection.port);
      newSpecials.push(asRoleSpecial(portData, roleKey, roleLabel));
      continue;
    }
    const specialData = specialsByKey.get(selection.key) || {
      key: selection.key,
      port: null,
      label: selection.key,
      kind: "special",
      link_entity: null,
      speed_entity: null,
      poe_switch_entity: null,
      poe_power_entity: null,
      port_switch_entity: null,
      power_cycle_entity: null,
      rx_entity: null,
      tx_entity: null,
      raw_entities: []
    };
    newSpecials.push(asRoleSpecial(specialData, roleKey, roleLabel));
  }
  for (const slot of originalSpecials) {
    const isRoleSlot = slot.key === "wan" || slot.key === "wan2";
    if (isRoleSlot) continue;
    if (Number.isInteger(slot.port) && assignedPorts.has(slot.port)) continue;
    if (!Number.isInteger(slot.port) && assignedSpecialKeys.has(slot.key)) continue;
    newSpecials.push(cloneSlot(slot));
  }
  const newNumbered = [];
  const addedPorts = /* @__PURE__ */ new Set();
  for (const portNumber of layoutRows) {
    if (assignedPorts.has(portNumber)) continue;
    const portData = physicalByPort.get(portNumber) || createEmptyNumberedPort(portNumber);
    newNumbered.push(asNumberedLanPort(portData, portNumber));
    addedPorts.add(portNumber);
  }
  for (const [portNumber, slot] of physicalByPort.entries()) {
    if (assignedPorts.has(portNumber) || addedPorts.has(portNumber)) continue;
    newNumbered.push(asNumberedLanPort(slot, portNumber));
  }
  newNumbered.sort((a, b) => (a.port ?? 999) - (b.port ?? 999));
  return { specials: newSpecials, numbered: newNumbered };
}
function stateObj(hass, entityId) {
  if (!entityId || !hass?.states) return null;
  return hass.states[entityId] ?? null;
}
function stateValue(hass, entityId) {
  return stateObj(hass, entityId)?.state ?? null;
}
function isOn(hass, entityId) {
  const s = stateValue(hass, entityId);
  return s === "on" || s === "true" || s === "connected" || s === "up" || s === "active";
}
function formatState(hass, entityId) {
  const obj = stateObj(hass, entityId);
  if (!obj) return "\u2014";
  const val = obj.state;
  const unit = obj.attributes?.unit_of_measurement;
  if (!val || val === "unavailable" || val === "unknown") return "\u2014";
  const num = parseFloat(String(val).replace(",", "."));
  if (Number.isFinite(num)) {
    if (unit) return `${num} ${unit}`;
    return String(num);
  }
  return unit ? `${val} ${unit}` : String(val);
}
function getPoeStatus(hass, port) {
  const power = port?.poe_power_entity ? formatState(hass, port.poe_power_entity) : null;
  const active = isOn(hass, port?.poe_switch_entity) || power && power !== "\u2014" && power !== "0 W" && power !== "0.0 W";
  return {
    active,
    power: power && power !== "\u2014" ? power : null
  };
}
function isPortConnected(hass, port) {
  if (!port) return false;
  const link = stateValue(hass, port.link_entity);
  if (link != null) {
    const normalized = String(link).toLowerCase();
    if (["on", "up", "connected", "true", "active"].includes(normalized)) {
      return true;
    }
    if (["off", "down", "disconnected", "false", "inactive"].includes(normalized)) {
      return false;
    }
  }
  const speed = stateValue(hass, port.speed_entity);
  if (speed != null) {
    const num = parseFloat(String(speed).replace(",", "."));
    if (Number.isFinite(num) && num > 0) return true;
  }
  const rx = stateValue(hass, port.rx_entity);
  if (rx != null) {
    const num = parseFloat(String(rx).replace(",", "."));
    if (Number.isFinite(num) && num > 0) return true;
  }
  const tx = stateValue(hass, port.tx_entity);
  if (tx != null) {
    const num = parseFloat(String(tx).replace(",", "."));
    if (Number.isFinite(num) && num > 0) return true;
  }
  return false;
}
function getPortLinkText(hass, port) {
  return formatState(hass, port?.link_entity);
}
function getPortSpeedText(hass, port) {
  return formatState(hass, port?.speed_entity);
}

// src/translations.js
var TRANSLATIONS = {
  en: {
    // Card states
    select_device: "Please select a UniFi device in the card editor.",
    loading: "Loading device data\u2026",
    no_data: "No device data available.",
    no_ports: "No ports detected.",
    // Front panel
    front_panel: "Front Panel",
    // Port detail
    link_status: "Link Status",
    speed: "Speed",
    poe: "PoE",
    poe_power: "PoE Power",
    connected: "Connected",
    no_link: "No link",
    online: "Online",
    offline: "Offline",
    // Actions
    port_disable: "Disable port",
    port_enable: "Enable port",
    poe_off: "PoE off",
    poe_on: "PoE on",
    power_cycle: "Power Cycle",
    // Hints
    speed_disabled: "Speed entity disabled \u2014 enable it in HA to show link speed.",
    // Editor
    editor_device_title: "Device",
    editor_device_label: "UniFi Device",
    editor_device_loading: "Loading devices from Home Assistant\u2026",
    editor_device_select: "Select device\u2026",
    editor_name_label: "Display name",
    editor_name_hint: "Optional \u2014 defaults to device name",
    editor_no_devices: "No UniFi switches or gateways found in Home Assistant.",
    editor_hint: "Only devices from the UniFi Network Integration are shown.",
    editor_error: "Failed to load UniFi devices.",
    // WAN / WAN2 selector (editor — gateway only)
    editor_wan_port_label: "WAN Port",
    editor_wan_port_auto: "Default (automatic)",
    editor_wan_port_hint: "Select which port is used as WAN. Only shown for gateway devices.",
    editor_wan_port_lan: "LAN",
    editor_wan_port_sfp: "SFP",
    editor_wan_port_sfpwan: "SFP (WAN-capable)",
    editor_wan2_port_label: "WAN 2 Port",
    editor_wan2_port_hint: "Optional second WAN/uplink port. Set to \u201CDisabled\u201D if not needed.",
    editor_wan2_port_none: "Disabled",
    // Raw HA state values that may appear in the link status / PoE fields
    state_on: "On",
    state_off: "Off",
    state_up: "Up",
    state_down: "Down",
    state_connected: "Connected",
    state_disconnected: "Disconnected",
    state_true: "Connected",
    state_false: "No link",
    state_active: "Active",
    // Port label prefix (used in detail panel title)
    port_label: "Port",
    // Background color field (editor)
    editor_bg_label: "Background color (optional)",
    editor_bg_hint: "Default: var(--card-background-color)",
    // Entity warning — loading hint
    warning_checking: "Checking selected device for disabled or hidden UniFi entities\u2026",
    // Entity warning — content
    warning_title: "Disabled or hidden UniFi entities detected",
    warning_body: "The selected device has relevant UniFi entities that are currently disabled or hidden. This can lead to missing controls, incomplete telemetry, or incorrect port status in the card.",
    warning_status: "Status summary: {disabled} disabled, {hidden} hidden.",
    warning_check_in: "Check in Home Assistant under:",
    warning_ha_path: "Settings \u2192 Devices &amp; Services \u2192 UniFi \u2192 Devices / Entities",
    // Entity warning — entity type labels (used with a leading count number)
    warning_entity_port_switch: "port switch entities",
    warning_entity_poe_switch: "PoE switch entities",
    warning_entity_poe_power: "PoE power sensors",
    warning_entity_link_speed: "link speed sensors",
    warning_entity_rx_tx: "RX/TX sensors",
    warning_entity_power_cycle: "power cycle buttons",
    warning_entity_link: "link entities",
    // Device type labels (used in device selector)
    type_switch: "Switch",
    type_gateway: "Gateway"
  },
  de: {
    // Card states
    select_device: "Bitte im Karteneditor ein UniFi-Ger\xE4t ausw\xE4hlen.",
    loading: "Lade Ger\xE4tedaten\u2026",
    no_data: "Keine Ger\xE4tedaten verf\xFCgbar.",
    no_ports: "Keine Ports erkannt.",
    // Front panel
    front_panel: "Front Panel",
    // Port detail
    link_status: "Link Status",
    speed: "Geschwindigkeit",
    poe: "PoE",
    poe_power: "PoE Leistung",
    connected: "Verbunden",
    no_link: "Kein Link",
    online: "Online",
    offline: "Offline",
    // Actions
    port_disable: "Port deaktivieren",
    port_enable: "Port aktivieren",
    poe_off: "PoE Aus",
    poe_on: "PoE Ein",
    power_cycle: "Power Cycle",
    // Hints
    speed_disabled: "Speed-Entity deaktiviert \u2014 in HA aktivieren f\xFCr Geschwindigkeitsanzeige.",
    // Editor
    editor_device_title: "Ger\xE4t",
    editor_device_label: "UniFi Ger\xE4t",
    editor_device_loading: "Lade Ger\xE4te aus Home Assistant\u2026",
    editor_device_select: "Ger\xE4t ausw\xE4hlen\u2026",
    editor_name_label: "Anzeigename",
    editor_name_hint: "Optional \u2014 wird sonst vom Ger\xE4t \xFCbernommen",
    editor_no_devices: "Keine UniFi Switches oder Gateways in Home Assistant gefunden.",
    editor_hint: "Nur Ger\xE4te aus der UniFi Network Integration werden angezeigt.",
    editor_error: "UniFi-Ger\xE4te konnten nicht geladen werden.",
    // WAN / WAN2 selector
    editor_wan_port_label: "WAN-Port",
    editor_wan_port_auto: "Standard (automatisch)",
    editor_wan_port_hint: "W\xE4hle, welcher Port als WAN verwendet wird. Nur f\xFCr Gateway-Ger\xE4te.",
    editor_wan_port_lan: "LAN",
    editor_wan_port_sfp: "SFP",
    editor_wan_port_sfpwan: "SFP (WAN-f\xE4hig)",
    editor_wan2_port_label: "WAN2-Port",
    editor_wan2_port_hint: "Optionaler zweiter WAN-/Uplink-Port. Bei Bedarf auf \u201EDeaktiviert\u201C setzen.",
    editor_wan2_port_none: "Deaktiviert",
    // Raw HA state values
    state_on: "Ein",
    state_off: "Aus",
    state_up: "Verbunden",
    state_down: "Kein Link",
    state_connected: "Verbunden",
    state_disconnected: "Getrennt",
    state_true: "Verbunden",
    state_false: "Kein Link",
    state_active: "Aktiv",
    // Port label prefix
    port_label: "Port",
    // Background color field (editor)
    editor_bg_label: "Hintergrundfarbe (optional)",
    editor_bg_hint: "Standard: var(--card-background-color)",
    // Entity warning — loading hint
    warning_checking: "Ausgew\xE4hltes Ger\xE4t auf deaktivierte oder versteckte UniFi-Entities pr\xFCfen\u2026",
    // Entity warning — content
    warning_title: "Deaktivierte oder versteckte UniFi-Entities erkannt",
    warning_body: "Das ausgew\xE4hlte Ger\xE4t hat relevante UniFi-Entities, die derzeit deaktiviert oder versteckt sind. Das kann zu fehlenden Bedienelementen, unvollst\xE4ndiger Telemetrie oder falschem Portstatus in der Karte f\xFChren.",
    warning_status: "Zusammenfassung: {disabled} deaktiviert, {hidden} versteckt.",
    warning_check_in: "In Home Assistant pr\xFCfen unter:",
    warning_ha_path: "Einstellungen \u2192 Ger\xE4te &amp; Dienste \u2192 UniFi \u2192 Ger\xE4te / Entities",
    // Entity warning — entity type labels
    warning_entity_port_switch: "Port-Switch-Entities",
    warning_entity_poe_switch: "PoE-Switch-Entities",
    warning_entity_poe_power: "PoE-Leistungssensoren",
    warning_entity_link_speed: "Linkgeschwindigkeitssensoren",
    warning_entity_rx_tx: "RX/TX-Sensoren",
    warning_entity_power_cycle: "Power-Cycle-Buttons",
    warning_entity_link: "Link-Entities",
    // Device type labels
    type_switch: "Switch",
    type_gateway: "Gateway"
  },
  nl: {
    // Card states
    select_device: "Selecteer een UniFi-apparaat in de kaarteditor.",
    loading: "Apparaatgegevens laden\u2026",
    no_data: "Geen apparaatgegevens beschikbaar.",
    no_ports: "Geen poorten gedetecteerd.",
    // Front panel
    front_panel: "Frontpaneel",
    // Port detail
    link_status: "Linkstatus",
    speed: "Snelheid",
    poe: "PoE",
    poe_power: "PoE-vermogen",
    connected: "Verbonden",
    no_link: "Geen link",
    online: "Online",
    offline: "Offline",
    // Actions
    port_disable: "Poort uitschakelen",
    port_enable: "Poort inschakelen",
    poe_off: "PoE uit",
    poe_on: "PoE aan",
    power_cycle: "Power Cycle",
    // Hints
    speed_disabled: "Snelheidsentiteit uitgeschakeld \u2014 schakel in HA in om linksnelheid te tonen.",
    // Editor
    editor_device_title: "Apparaat",
    editor_device_label: "UniFi-apparaat",
    editor_device_loading: "Apparaten laden uit Home Assistant\u2026",
    editor_device_select: "Apparaat selecteren\u2026",
    editor_name_label: "Weergavenaam",
    editor_name_hint: "Optioneel \u2014 standaard de apparaatnaam",
    editor_no_devices: "Geen UniFi-switches of -gateways gevonden in Home Assistant.",
    editor_hint: "Alleen apparaten uit de UniFi Network-integratie worden weergegeven.",
    editor_error: "UniFi-apparaten konden niet worden geladen.",
    // WAN / WAN2 selector
    editor_wan_port_label: "WAN-poort",
    editor_wan_port_auto: "Standaard (automatisch)",
    editor_wan_port_hint: "Selecteer welke poort als WAN wordt gebruikt. Alleen voor gateway-apparaten.",
    editor_wan_port_lan: "LAN",
    editor_wan_port_sfp: "SFP",
    editor_wan_port_sfpwan: "SFP (WAN-geschikt)",
    editor_wan2_port_label: "WAN 2-poort",
    editor_wan2_port_hint: "Optionele tweede WAN-/uplinkpoort. Zet op \u201CUitgeschakeld\u201D als die niet nodig is.",
    editor_wan2_port_none: "Uitgeschakeld",
    // Raw HA state values
    state_on: "Aan",
    state_off: "Uit",
    state_up: "Verbonden",
    state_down: "Geen link",
    state_connected: "Verbonden",
    state_disconnected: "Verbroken",
    state_true: "Verbonden",
    state_false: "Geen link",
    state_active: "Actief",
    // Port label prefix
    port_label: "Poort",
    // Background color field (editor)
    editor_bg_label: "Achtergrondkleur (optioneel)",
    editor_bg_hint: "Standaard: var(--card-background-color)",
    // Entity warning
    warning_checking: "Geselecteerd apparaat controleren op uitgeschakelde of verborgen UniFi-entiteiten\u2026",
    warning_title: "Uitgeschakelde of verborgen UniFi-entiteiten gedetecteerd",
    warning_body: "Het geselecteerde apparaat heeft relevante UniFi-entiteiten die momenteel uitgeschakeld of verborgen zijn. Dit kan leiden tot ontbrekende bediening, onvolledige telemetrie of een onjuiste poortstatus in de kaart.",
    warning_status: "Samenvatting: {disabled} uitgeschakeld, {hidden} verborgen.",
    warning_check_in: "Controleer in Home Assistant onder:",
    warning_ha_path: "Instellingen \u2192 Apparaten &amp; Diensten \u2192 UniFi \u2192 Apparaten / Entiteiten",
    warning_entity_port_switch: "poortschakelaar-entiteiten",
    warning_entity_poe_switch: "PoE-schakelaar-entiteiten",
    warning_entity_poe_power: "PoE-vermogenssensoren",
    warning_entity_link_speed: "linksnelheidssensoren",
    warning_entity_rx_tx: "RX/TX-sensoren",
    warning_entity_power_cycle: "power cycle-knoppen",
    warning_entity_link: "link-entiteiten",
    type_switch: "Switch",
    type_gateway: "Gateway"
  },
  fr: {
    // Card states
    select_device: "Veuillez s\xE9lectionner un appareil UniFi dans l'\xE9diteur de carte.",
    loading: "Chargement des donn\xE9es\u2026",
    no_data: "Aucune donn\xE9e disponible.",
    no_ports: "Aucun port d\xE9tect\xE9.",
    // Front panel
    front_panel: "Panneau avant",
    // Port detail
    link_status: "\xC9tat du lien",
    speed: "Vitesse",
    poe: "PoE",
    poe_power: "Puissance PoE",
    connected: "Connect\xE9",
    no_link: "Pas de lien",
    online: "En ligne",
    offline: "Hors ligne",
    // Actions
    port_disable: "D\xE9sactiver le port",
    port_enable: "Activer le port",
    poe_off: "PoE d\xE9sactiv\xE9",
    poe_on: "PoE activ\xE9",
    power_cycle: "Red\xE9marrage PoE",
    // Hints
    speed_disabled: "Entit\xE9 de vitesse d\xE9sactiv\xE9e \u2014 activez-la dans HA pour afficher la vitesse.",
    // Editor
    editor_device_title: "Appareil",
    editor_device_label: "Appareil UniFi",
    editor_device_loading: "Chargement des appareils\u2026",
    editor_device_select: "S\xE9lectionner un appareil\u2026",
    editor_name_label: "Nom d'affichage",
    editor_name_hint: "Optionnel \u2014 par d\xE9faut le nom de l'appareil",
    editor_no_devices: "Aucun switch ou gateway UniFi trouv\xE9 dans Home Assistant.",
    editor_hint: "Seuls les appareils de l'int\xE9gration UniFi Network sont affich\xE9s.",
    editor_error: "Impossible de charger les appareils UniFi.",
    // WAN / WAN2 selector
    editor_wan_port_label: "Port WAN",
    editor_wan_port_auto: "Par d\xE9faut (automatique)",
    editor_wan_port_hint: "S\xE9lectionnez le port utilis\xE9 comme WAN. Uniquement pour les passerelles.",
    editor_wan_port_lan: "LAN",
    editor_wan_port_sfp: "SFP",
    editor_wan_port_sfpwan: "SFP (compatible WAN)",
    editor_wan2_port_label: "Port WAN 2",
    editor_wan2_port_hint: "Second port WAN/uplink optionnel. R\xE9glez sur \xAB D\xE9sactiv\xE9 \xBB si inutile.",
    editor_wan2_port_none: "D\xE9sactiv\xE9",
    // Raw HA state values
    state_on: "Activ\xE9",
    state_off: "D\xE9sactiv\xE9",
    state_up: "Connect\xE9",
    state_down: "Pas de lien",
    state_connected: "Connect\xE9",
    state_disconnected: "D\xE9connect\xE9",
    state_true: "Connect\xE9",
    state_false: "Pas de lien",
    state_active: "Actif",
    // Port label prefix
    port_label: "Port",
    // Background color field (editor)
    editor_bg_label: "Couleur de fond (optionnel)",
    editor_bg_hint: "D\xE9faut : var(--card-background-color)",
    // Entity warning
    warning_checking: "V\xE9rification des entit\xE9s UniFi d\xE9sactiv\xE9es ou masqu\xE9es pour l'appareil s\xE9lectionn\xE9\u2026",
    warning_title: "Entit\xE9s UniFi d\xE9sactiv\xE9es ou masqu\xE9es d\xE9tect\xE9es",
    warning_body: "L'appareil s\xE9lectionn\xE9 poss\xE8de des entit\xE9s UniFi pertinentes actuellement d\xE9sactiv\xE9es ou masqu\xE9es. Cela peut entra\xEEner des commandes manquantes, une t\xE9l\xE9m\xE9trie incompl\xE8te ou un \xE9tat de port incorrect dans la carte.",
    warning_status: "R\xE9sum\xE9 : {disabled} d\xE9sactiv\xE9e(s), {hidden} masqu\xE9e(s).",
    warning_check_in: "V\xE9rifier dans Home Assistant sous :",
    warning_ha_path: "Param\xE8tres \u2192 Appareils &amp; Services \u2192 UniFi \u2192 Appareils / Entit\xE9s",
    warning_entity_port_switch: "entit\xE9s de commutateur de port",
    warning_entity_poe_switch: "entit\xE9s de commutateur PoE",
    warning_entity_poe_power: "capteurs de puissance PoE",
    warning_entity_link_speed: "capteurs de vitesse de lien",
    warning_entity_rx_tx: "capteurs RX/TX",
    warning_entity_power_cycle: "boutons de red\xE9marrage PoE",
    warning_entity_link: "entit\xE9s de lien",
    type_switch: "Switch",
    type_gateway: "Passerelle"
  }
};
function getTranslations(lang) {
  if (!lang) return TRANSLATIONS.en;
  const short = String(lang).split("-")[0].toLowerCase();
  return TRANSLATIONS[short] || TRANSLATIONS.en;
}
function t(hass, key) {
  const lang = hass?.language || "en";
  const strings = getTranslations(lang);
  return strings[key] ?? TRANSLATIONS.en[key] ?? key;
}

// src/unifi-device-card-editor.js
function slotPortType(slot) {
  const key = String(slot.key || "").toLowerCase();
  if (key === "wan" || key === "wan2") return "wan";
  if (key.includes("sfp_wan") || key.includes("wan_sfp")) return "sfp_wan";
  if (key.includes("sfp")) return "sfp";
  return "lan";
}
function slotDropdownLabel(slot, tFn) {
  const type = slotPortType(slot);
  const portNum = slot.port != null ? ` (Port ${slot.port})` : "";
  switch (type) {
    case "wan":
      return `${slot.label}${portNum}`;
    case "sfp_wan":
      return `${slot.label}${portNum} \u2014 ${tFn("editor_wan_port_sfpwan")}`;
    case "sfp":
      return `${slot.label}${portNum} \u2014 ${tFn("editor_wan_port_sfp")}`;
    default:
      return `${slot.label}${portNum} \u2014 ${tFn("editor_wan_port_lan")}`;
  }
}
function buildGatewayRoleOptions(layout, tFn, { includeNone = false } = {}) {
  const options = [{ value: "auto", label: tFn("editor_wan_port_auto") }];
  if (includeNone) {
    options.push({ value: "none", label: tFn("editor_wan2_port_none") });
  }
  if (!layout) return options;
  for (const slot of layout.specialSlots || []) {
    options.push({
      value: slot.key,
      label: slotDropdownLabel(slot, tFn),
      type: slotPortType(slot),
      port: slot.port ?? null
    });
  }
  const allPortNums = (layout.rows || []).flat();
  for (const portNum of allPortNums) {
    options.push({
      value: `port_${portNum}`,
      label: `Port ${portNum} \u2014 ${tFn("editor_wan_port_lan")}`,
      type: "lan",
      port: portNum
    });
  }
  const seen = /* @__PURE__ */ new Set();
  return options.filter((option) => {
    const key = `${option.value}|${option.label}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
function resolveSelectionForConflict(value, roleKey, layout) {
  const normalized = String(value || "auto");
  if (normalized === "none") return "none";
  if (normalized !== "auto") return normalized;
  const defaultSlot = (layout?.specialSlots || []).find((slot) => slot.key === roleKey);
  if (!defaultSlot) return roleKey === "wan2" ? "none" : "auto";
  return defaultSlot.port != null ? `port_${defaultSlot.port}` : defaultSlot.key;
}
function roleSelectionsConflict(a, aRole, b, bRole, layout) {
  const resolvedA = resolveSelectionForConflict(a, aRole, layout);
  const resolvedB = resolveSelectionForConflict(b, bRole, layout);
  if (resolvedA === "none" || resolvedB === "none") return false;
  return resolvedA === resolvedB;
}
var UnifiDeviceCardEditor = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = {};
    this._devices = [];
    this._loading = false;
    this._loaded = false;
    this._error = "";
    this._hass = null;
    this._loadToken = 0;
    this._entityHint = null;
    this._entityHintLoading = false;
    this._entityHintToken = 0;
    this._rendered = false;
    this._deviceCtx = null;
    this._deviceCtxLoading = false;
    this._deviceCtxToken = 0;
    this._lastHintDeviceId = null;
    this._lastCtxDeviceId = null;
  }
  setConfig(config) {
    const prevDeviceId = this._config?.device_id || "";
    this._config = config || {};
    const nextDeviceId = this._config?.device_id || "";
    if (this._hass && nextDeviceId) {
      if (nextDeviceId !== prevDeviceId || !this._entityHint) {
        this._loadEntityHint(nextDeviceId);
      }
      if (nextDeviceId !== prevDeviceId || !this._deviceCtx) {
        this._loadDeviceCtx(nextDeviceId);
      }
    } else {
      this._entityHint = null;
      this._deviceCtx = null;
      this._lastHintDeviceId = null;
      this._lastCtxDeviceId = null;
    }
    if (this._rendered) {
      this._patchFields();
      this._patchWarning();
    } else {
      this._render();
    }
  }
  set hass(hass) {
    this._hass = hass;
    if (!this._loaded && !this._loading) {
      this._loadDevices();
    }
    const deviceId = this._config?.device_id || "";
    if (deviceId) {
      if (deviceId !== this._lastHintDeviceId || !this._entityHint) {
        this._loadEntityHint(deviceId);
      }
      if (deviceId !== this._lastCtxDeviceId || !this._deviceCtx) {
        this._loadDeviceCtx(deviceId);
      }
    }
  }
  _t(key) {
    return t(this._hass, key);
  }
  async _loadDevices() {
    if (!this._hass) return;
    this._loading = true;
    this._error = "";
    this._render();
    const token = ++this._loadToken;
    try {
      this._devices = await getUnifiDevices(this._hass);
      if (token !== this._loadToken) return;
      this._loaded = true;
    } catch (err) {
      console.error("[unifi-device-card] failed to load devices", err);
      if (token !== this._loadToken) return;
      this._devices = [];
      this._error = this._t("editor_error");
    }
    this._loading = false;
    this._render();
  }
  async _loadEntityHint(deviceId) {
    if (!this._hass || !deviceId) return;
    this._entityHintLoading = true;
    this._entityHint = null;
    this._lastHintDeviceId = deviceId;
    this._patchWarning();
    const token = ++this._entityHintToken;
    try {
      const result = await getRelevantEntityWarningsForDevice(this._hass, deviceId);
      if (token !== this._entityHintToken) return;
      this._entityHint = result;
    } catch (err) {
      console.error("[unifi-device-card] failed to load entity warning", err);
      if (token !== this._entityHintToken) return;
      this._entityHint = null;
    }
    this._entityHintLoading = false;
    this._patchWarning();
  }
  async _loadDeviceCtx(deviceId) {
    if (!this._hass || !deviceId) return;
    this._deviceCtxLoading = true;
    this._deviceCtx = null;
    this._lastCtxDeviceId = deviceId;
    this._patchFields();
    const token = ++this._deviceCtxToken;
    try {
      const result = await getDeviceContext(this._hass, deviceId);
      if (token !== this._deviceCtxToken) return;
      this._deviceCtx = result;
    } catch (err) {
      console.error("[unifi-device-card] failed to load device context for editor", err);
      if (token !== this._deviceCtxToken) return;
      this._deviceCtx = null;
    }
    this._deviceCtxLoading = false;
    this._patchFields();
  }
  _emitConfig(partial) {
    const next = { ...this._config, ...partial };
    if (!next.name) delete next.name;
    if (!next.background_color) delete next.background_color;
    if (!next.wan_port || next.wan_port === "auto") delete next.wan_port;
    if (!next.wan2_port || next.wan2_port === "auto") delete next.wan2_port;
    if (next.wan2_port === "none") next.wan2_port = "none";
    this.dispatchEvent(new CustomEvent("config-changed", {
      detail: { config: next },
      bubbles: true,
      composed: true
    }));
  }
  _onDeviceChange(ev) {
    const deviceId = ev.target.value || "";
    const nextDevice = this._devices.find((d) => d.id === deviceId) || null;
    const nextConfig = {
      device_id: deviceId || void 0,
      wan_port: void 0,
      wan2_port: void 0
    };
    if (!deviceId) {
      nextConfig.name = void 0;
    } else if (!this._config?.name && nextDevice?.name) {
      nextConfig.name = nextDevice.name;
    }
    this._emitConfig(nextConfig);
  }
  _onNameInput(ev) {
    this._emitConfig({ name: ev.target.value || void 0 });
  }
  _onBackgroundInput(ev) {
    this._emitConfig({ background_color: ev.target.value || void 0 });
  }
  _onWanPortChange(ev) {
    const nextValue = ev.target.value || "auto";
    const currentWan2 = this._config?.wan2_port || "auto";
    const layout = this._deviceCtx?.layout;
    let nextWan2 = currentWan2;
    if (roleSelectionsConflict(nextValue, "wan", currentWan2, "wan2", layout)) {
      nextWan2 = "none";
    }
    this._emitConfig({
      wan_port: nextValue === "auto" ? void 0 : nextValue,
      wan2_port: nextWan2 === "auto" ? void 0 : nextWan2
    });
  }
  _onWan2PortChange(ev) {
    const nextValue = ev.target.value || "auto";
    const currentWan = this._config?.wan_port || "auto";
    const layout = this._deviceCtx?.layout;
    let safeValue = nextValue;
    if (roleSelectionsConflict(currentWan, "wan", nextValue, "wan2", layout)) {
      safeValue = "none";
    }
    this._emitConfig({
      wan2_port: safeValue === "auto" ? void 0 : safeValue
    });
  }
  _warningItems() {
    const hint = this._entityHint;
    if (!hint?.hasWarnings) return [];
    const order = [
      "port_switch",
      "poe_switch",
      "poe_power",
      "link_speed",
      "rx_tx",
      "power_cycle",
      "link"
    ];
    return order.map((key) => ({
      key,
      count: hint.buckets?.[key] || 0
    })).filter((item) => item.count > 0);
  }
  _warningHTML() {
    if (this._entityHintLoading) {
      return `<div class="warn loading">${this._t("warning_checking")}</div>`;
    }
    if (!this._entityHint?.hasWarnings) return "";
    const disabled = this._entityHint?.disabledCount || 0;
    const hidden = this._entityHint?.hiddenCount || 0;
    const items = this._warningItems();
    const summary = this._t("warning_status").replace("{disabled}", String(disabled)).replace("{hidden}", String(hidden));
    const list = items.length ? `<ul>${items.map(
      (item) => `<li><strong>${item.count}</strong> ${this._t(`warning_entity_${item.key}`)}</li>`
    ).join("")}</ul>` : "";
    return `
      <div class="warn">
        <div class="warn-title">${this._t("warning_title")}</div>
        <div class="warn-body">${this._t("warning_body")}</div>
        <div class="warn-status">${summary}</div>
        ${list}
        <div class="warn-path">
          <strong>${this._t("warning_check_in")}</strong><br>
          ${this._t("warning_ha_path")}
        </div>
      </div>
    `;
  }
  _gatewayControlsHTML() {
    const ctx = this._deviceCtx;
    if (!ctx || ctx.type !== "gateway") return "";
    const layout = ctx.layout;
    const wanOptions = buildGatewayRoleOptions(layout, (k) => this._t(k));
    const wan2Options = buildGatewayRoleOptions(layout, (k) => this._t(k), { includeNone: true });
    const selectedWan = this._config?.wan_port || "auto";
    let selectedWan2 = this._config?.wan2_port || "auto";
    if (roleSelectionsConflict(selectedWan, "wan", selectedWan2, "wan2", layout)) {
      selectedWan2 = "none";
    }
    return `
      <div class="field">
        <label>${this._t("editor_wan_port_label")}</label>
        <select id="wan_port">
          ${wanOptions.map(
      (opt) => `<option value="${opt.value}" ${opt.value === selectedWan ? "selected" : ""}>${opt.label}</option>`
    ).join("")}
        </select>
        <div class="hint">${this._t("editor_wan_port_hint")}</div>
      </div>

      <div class="field">
        <label>${this._t("editor_wan2_port_label")}</label>
        <select id="wan2_port">
          ${wan2Options.map((opt) => {
      const disabled = opt.value !== "auto" && opt.value !== "none" && roleSelectionsConflict(selectedWan, "wan", opt.value, "wan2", layout);
      return `<option value="${opt.value}" ${opt.value === selectedWan2 ? "selected" : ""} ${disabled ? "disabled" : ""}>${opt.label}</option>`;
    }).join("")}
        </select>
        <div class="hint">${this._t("editor_wan2_port_hint")}</div>
      </div>
    `;
  }
  _styles() {
    return `<style>
      :host {
        display: block;
      }

      .wrap {
        display: grid;
        gap: 14px;
      }

      .section-title {
        font-size: 0.95rem;
        font-weight: 700;
        margin: 2px 0 0;
      }

      .field {
        display: grid;
        gap: 6px;
      }

      label {
        font-weight: 600;
      }

      select,
      input {
        box-sizing: border-box;
        width: 100%;
        padding: 10px 12px;
        border-radius: 10px;
        border: 1px solid var(--divider-color);
        background: var(--card-background-color);
        color: var(--primary-text-color);
        font: inherit;
      }

      .hint {
        color: var(--secondary-text-color);
        font-size: 0.82rem;
      }

      .warn {
        border-radius: 12px;
        padding: 12px 14px;
        background: rgba(245, 158, 11, 0.12);
        border: 1px solid rgba(245, 158, 11, 0.35);
        color: var(--primary-text-color);
      }

      .warn.loading {
        background: rgba(59, 130, 246, 0.12);
        border-color: rgba(59, 130, 246, 0.35);
      }

      .warn-title {
        font-weight: 700;
        margin-bottom: 6px;
      }

      .warn-body,
      .warn-status,
      .warn-path {
        font-size: 0.9rem;
        line-height: 1.45;
      }

      .warn ul {
        margin: 10px 0 10px 18px;
        padding: 0;
      }

      .warn li {
        margin: 4px 0;
      }

      .empty,
      .error {
        font-size: 0.92rem;
      }

      .error {
        color: var(--error-color);
      }
    </style>`;
  }
  _render() {
    this._rendered = true;
    const deviceValue = this._config?.device_id || "";
    const nameValue = this._config?.name || "";
    const backgroundValue = this._config?.background_color || "";
    this.shadowRoot.innerHTML = `
      ${this._styles()}
      <div class="wrap">
        <div class="section-title">${this._t("editor_device_title")}</div>

        <div class="field">
          <label>${this._t("editor_device_label")}</label>
          <select id="device_id">
            <option value="">${this._t("editor_device_select")}</option>
            ${this._devices.map(
      (device) => `<option value="${device.id}" ${device.id === deviceValue ? "selected" : ""}>${device.label}</option>`
    ).join("")}
          </select>
          <div class="hint">${this._loading ? this._t("editor_device_loading") : this._devices.length ? this._t("editor_hint") : this._error || this._t("editor_no_devices")}</div>
        </div>

        <div class="field">
          <label>${this._t("editor_name_label")}</label>
          <input id="name" type="text" value="${nameValue}">
          <div class="hint">${this._t("editor_name_hint")}</div>
        </div>

        ${this._gatewayControlsHTML()}

        <div class="field">
          <label>${this._t("editor_bg_label")}</label>
          <input id="background_color" type="text" value="${backgroundValue}">
          <div class="hint">${this._t("editor_bg_hint")}</div>
        </div>

        <div id="warning_slot">${this._warningHTML()}</div>
      </div>
    `;
    this.shadowRoot.getElementById("device_id")?.addEventListener("change", (ev) => this._onDeviceChange(ev));
    this.shadowRoot.getElementById("name")?.addEventListener("input", (ev) => this._onNameInput(ev));
    this.shadowRoot.getElementById("background_color")?.addEventListener("input", (ev) => this._onBackgroundInput(ev));
    this.shadowRoot.getElementById("wan_port")?.addEventListener("change", (ev) => this._onWanPortChange(ev));
    this.shadowRoot.getElementById("wan2_port")?.addEventListener("change", (ev) => this._onWan2PortChange(ev));
  }
  _patchWarning() {
    if (!this._rendered || !this.shadowRoot) return;
    const slot = this.shadowRoot.getElementById("warning_slot");
    if (!slot) return;
    slot.innerHTML = this._warningHTML();
  }
  _patchFields() {
    if (!this._rendered || !this.shadowRoot) return;
    const currentDevice = this.shadowRoot.getElementById("device_id");
    if (currentDevice && currentDevice.value !== (this._config?.device_id || "")) {
      currentDevice.value = this._config?.device_id || "";
    }
    const currentName = this.shadowRoot.getElementById("name");
    if (currentName && currentName.value !== (this._config?.name || "")) {
      currentName.value = this._config?.name || "";
    }
    const currentBg = this.shadowRoot.getElementById("background_color");
    if (currentBg && currentBg.value !== (this._config?.background_color || "")) {
      currentBg.value = this._config?.background_color || "";
    }
    this._render();
  }
};
customElements.define("unifi-device-card-editor", UnifiDeviceCardEditor);

// src/unifi-device-card.js
var VERSION = "0.0.0-dev.6a011d8";
var UnifiDeviceCard = class extends HTMLElement {
  static getConfigElement() {
    return document.createElement("unifi-device-card-editor");
  }
  static getStubConfig() {
    return {};
  }
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = {};
    this._ctx = null;
    this._selectedKey = null;
    this._loading = false;
    this._loadToken = 0;
    this._loadedDeviceId = null;
  }
  setConfig(config) {
    const oldDeviceId = this._config?.device_id || null;
    const newConfig = config || {};
    const newDeviceId = newConfig?.device_id || null;
    this._config = newConfig;
    if (oldDeviceId !== newDeviceId) {
      this._ctx = null;
      this._selectedKey = null;
      this._loadedDeviceId = null;
      this._loading = false;
      if (this._hass && newDeviceId) {
        this._ensureLoaded();
        return;
      }
    }
    this._render();
  }
  set hass(hass) {
    this._hass = hass;
    this._ensureLoaded();
    this._render();
  }
  getCardSize() {
    return 8;
  }
  _t(key) {
    return t(this._hass, key);
  }
  _translateState(raw) {
    if (!raw || raw === "\u2014") return raw;
    const key = `state_${String(raw).toLowerCase().replace(/\s+/g, "_")}`;
    const translated = this._t(key);
    return translated === key ? raw : translated;
  }
  _cardBgStyle() {
    return this._config?.background_color || "";
  }
  _buildSlotData(ctx) {
    const discovered = discoverPorts(ctx?.entities || []);
    const numberedRaw = mergePortsWithLayout(ctx?.layout, discovered);
    const discoveredSpecials = ctx?.type === "gateway" ? discoverSpecialPorts(ctx?.entities || []) : [];
    const specialsRaw = mergeSpecialsWithLayout(
      ctx?.layout,
      discoveredSpecials,
      discovered
    );
    if (ctx?.type === "gateway") {
      return applyGatewayPortOverrides(
        this._config,
        specialsRaw,
        numberedRaw,
        ctx?.layout
      );
    }
    return {
      specials: specialsRaw,
      numbered: numberedRaw
    };
  }
  async _ensureLoaded() {
    if (!this._hass || !this._config?.device_id) return;
    const currentId = this._config.device_id;
    if (this._loadedDeviceId === currentId && this._ctx) return;
    if (this._loading) return;
    this._loading = true;
    this._render();
    const token = ++this._loadToken;
    try {
      const ctx = await getDeviceContext(this._hass, currentId);
      if (token !== this._loadToken) return;
      this._ctx = ctx;
      this._loadedDeviceId = currentId;
      const { specials, numbered } = this._buildSlotData(ctx);
      const first = specials[0] || numbered[0] || null;
      this._selectedKey = first?.key || null;
    } catch (err) {
      console.error("[unifi-device-card] Failed to load device context", err);
      if (token !== this._loadToken) return;
      this._ctx = null;
      this._loadedDeviceId = null;
    }
    this._loading = false;
    this._render();
  }
  _selectKey(key) {
    this._selectedKey = key;
    this._render();
  }
  async _toggleEntity(entityId) {
    if (!entityId || !this._hass) return;
    const [domain] = entityId.split(".");
    await this._hass.callService(domain, "toggle", { entity_id: entityId });
  }
  async _pressButton(entityId) {
    if (!entityId || !this._hass) return;
    await this._hass.callService("button", "press", { entity_id: entityId });
  }
  _subtitle() {
    if (!this._config?.device_id || !this._ctx) return `Version ${VERSION}`;
    const fw = this._ctx?.firmware;
    const model = this._ctx?.layout?.displayModel || this._ctx?.model || "";
    return fw ? `${model} \xB7 FW ${fw}` : model;
  }
  _connectedCount(allSlots) {
    return allSlots.filter((s) => isPortConnected(this._hass, s)).length;
  }
  _styles() {
    return `<style>
      :host {
        --udc-bg: #141820;
        --udc-surface: #1e2433;
        --udc-surf2: #252d3d;
        --udc-border: rgba(255,255,255,0.07);
        --udc-accent: #0090d9;
        --udc-aglow: rgba(0,144,217,0.2);
        --udc-green: #22c55e;
        --udc-orange: #f59e0b;
        --udc-red: #ef4444;
        --udc-text: #e2e8f0;
        --udc-muted: #4e5d73;
        --udc-dim: #8896a8;
        --udc-r: 14px;
        --udc-rsm: 8px;
      }

      ha-card {
        background: var(--udc-card-bg, var(--card-background-color)) !important;
        color: var(--primary-text-color, var(--udc-text)) !important;
        border: var(--ha-card-border-width, 1px) solid var(--ha-card-border-color, var(--udc-border)) !important;
        border-radius: var(--ha-card-border-radius, var(--udc-r)) !important;
        box-shadow: var(--ha-card-box-shadow, none);
        overflow: hidden;
        font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
      }

      .header {
        padding: 16px 18px 13px;
        background: linear-gradient(160deg, var(--udc-surface) 0%, var(--udc-bg) 100%);
        border-bottom: 1px solid var(--udc-border);
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 10px;
      }

      .header-info {
        display: grid;
        gap: 2px;
        min-width: 0;
      }

      .title {
        font-size: 1.05rem;
        font-weight: 700;
        letter-spacing: -.02em;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .subtitle {
        font-size: 0.73rem;
        color: var(--udc-muted);
      }

      .chip {
        display: flex;
        align-items: center;
        gap: 5px;
        background: var(--udc-surf2);
        border: 1px solid var(--udc-border);
        border-radius: 20px;
        padding: 3px 10px;
        font-size: 0.71rem;
        font-weight: 700;
        white-space: nowrap;
        color: var(--udc-dim);
        flex-shrink: 0;
      }

      .chip .dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: var(--udc-green);
        box-shadow: 0 0 5px var(--udc-green);
        animation: blink 2.5s ease-in-out infinite;
      }

      @keyframes blink {
        0%, 100% { opacity: 1; }
        50% { opacity: .4; }
      }

      .frontpanel {
        padding: 12px 14px 10px;
        display: grid;
        gap: 5px;
        border-bottom: 1px solid var(--udc-border);
      }

      .frontpanel.theme-white  { background: #d8dde6; }
      .frontpanel.theme-silver { background: #2a2e35; }
      .frontpanel.theme-dark   { background: var(--udc-surface); }

      .panel-label {
        font-size: 0.63rem;
        font-weight: 700;
        letter-spacing: .1em;
        text-transform: uppercase;
        margin-bottom: 2px;
      }

      .theme-white .panel-label { color: #8a96a8; }
      .theme-silver .panel-label { color: #5a6070; }
      .theme-dark .panel-label { color: var(--udc-muted); }

      .special-row {
        display: flex;
        gap: 5px;
        flex-wrap: wrap;
        margin-bottom: 4px;
      }

      .port-row {
        display: grid;
        gap: 5px;
      }

      .frontpanel.single-row .port-row,
      .frontpanel.gateway-single-row .port-row {
        grid-template-columns: repeat(8, minmax(0,1fr));
      }

      .frontpanel.dual-row .port-row {
        grid-template-columns: repeat(8, minmax(0,1fr));
      }

      .frontpanel.gateway-rack .port-row {
        grid-template-columns: repeat(8, minmax(0,1fr));
      }

      .frontpanel.gateway-compact .port-row {
        grid-template-columns: repeat(5, minmax(0,1fr));
      }

      .frontpanel.six-grid .port-row {
        grid-template-columns: repeat(6, minmax(0,1fr));
      }

      .frontpanel.quad-row .port-row {
        grid-template-columns: repeat(12, minmax(0,1fr));
      }

      .frontpanel.ultra-row .port-row {
        grid-template-columns: repeat(7, minmax(0,1fr));
      }

      .port {
        cursor: pointer;
        font: inherit;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 4px 2px 3px;
        border-radius: 4px;
        transition: outline .1s ease;
        position: relative;
        min-width: 0;
        border: none;
        background: transparent;
      }

      .port:focus {
        outline: none;
      }

      .port.selected {
        outline: 2px solid var(--udc-accent);
        outline-offset: 1px;
        border-radius: 5px;
      }

      .port:hover {
        outline: 1px solid rgba(0,144,217,.5);
        outline-offset: 1px;
        border-radius: 5px;
      }

      .port-leds {
        display: flex;
        justify-content: center;
        width: 100%;
        padding: 0 1px;
        margin-bottom: 2px;
      }

      .port-led {
        width: 4px;
        height: 4px;
        border-radius: 50%;
        transition: background .2s;
        flex-shrink: 0;
      }

      .port-socket {
        width: 100%;
        height: 13px;
        border-radius: 2px 2px 0 0;
        position: relative;
        flex-shrink: 0;
      }

      .port-socket::after {
        content: "";
        position: absolute;
        bottom: 0;
        left: 12%;
        right: 12%;
        height: 4px;
        border-radius: 1px 1px 0 0;
      }

      .port-num {
        font-size: 8px;
        font-weight: 800;
        line-height: 1;
        margin-top: 2px;
        letter-spacing: 0;
        user-select: none;
      }

      .theme-white .port-socket         { background: #b0b8c4; }
      .theme-white .port-socket::after  { background: #9aa4b2; }
      .theme-white .port-num            { color: #4c5563; }

      .theme-silver .port-socket        { background: #828a96; }
      .theme-silver .port-socket::after { background: #6f7784; }
      .theme-silver .port-num           { color: #dbe1eb; }

      .theme-dark .port-socket          { background: #5e6b80; }
      .theme-dark .port-socket::after   { background: #495568; }
      .theme-dark .port-num             { color: #d7e0ee; }

      .port.special .port-socket {
        width: 28px;
      }

      .port.special .port-num {
        font-size: 7px;
      }

      .port-led-link { background: #566173; }
      .port.up .port-led-link {
        background: var(--udc-green);
        box-shadow: 0 0 6px rgba(34,197,94,.8);
      }

      .port.speed-10m .port-led-link  { background: #a3e635; box-shadow: 0 0 6px rgba(163,230,53,.8); }
      .port.speed-100m .port-led-link { background: #22c55e; box-shadow: 0 0 6px rgba(34,197,94,.8); }
      .port.speed-1g .port-led-link   { background: #06b6d4; box-shadow: 0 0 6px rgba(6,182,212,.8); }
      .port.speed-10g .port-led-link  { background: #f59e0b; box-shadow: 0 0 6px rgba(245,158,11,.8); }
      .port.speed-25g .port-led-link  { background: #ef4444; box-shadow: 0 0 6px rgba(239,68,68,.8); }

      .section {
        padding: 14px 16px 16px;
      }

      .detail-title {
        font-size: 0.98rem;
        font-weight: 700;
        margin-bottom: 10px;
      }

      .detail-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0,1fr));
        gap: 10px;
        margin-bottom: 14px;
      }

      .detail-item {
        background: var(--udc-surf2);
        border: 1px solid var(--udc-border);
        border-radius: 10px;
        padding: 10px 12px;
        min-width: 0;
      }

      .detail-label {
        font-size: 0.72rem;
        color: var(--udc-muted);
        margin-bottom: 4px;
      }

      .detail-value {
        font-size: 0.93rem;
        font-weight: 700;
        overflow-wrap: anywhere;
      }

      .detail-value.online  { color: var(--udc-green); }
      .detail-value.offline { color: var(--udc-red); }

      .actions {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }

      .action-btn {
        border: 1px solid var(--udc-border);
        background: var(--udc-surf2);
        color: var(--udc-text);
        border-radius: 10px;
        padding: 9px 12px;
        font: inherit;
        font-weight: 700;
        cursor: pointer;
      }

      .action-btn.primary {
        background: rgba(0,144,217,.15);
        border-color: rgba(0,144,217,.35);
      }

      .action-btn.secondary {
        background: rgba(255,255,255,.03);
      }

      .empty-state,
      .loading-state {
        padding: 22px 18px;
        color: var(--udc-muted);
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .muted {
        color: var(--udc-muted);
      }

      .spinner {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        border: 2px solid rgba(255,255,255,.18);
        border-top-color: var(--udc-accent);
        animation: spin .9s linear infinite;
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    </style>`;
  }
  _speedClass(hass, slot) {
    const speedText = getPortSpeedText(hass, slot);
    if (!speedText || speedText === "\u2014") return "";
    const num = parseInt(speedText, 10);
    if (num >= 25e3) return "speed-25g";
    if (num >= 1e4) return "speed-10g";
    if (num >= 1e3) return "speed-1g";
    if (num >= 100) return "speed-100m";
    if (num >= 10) return "speed-10m";
    return "";
  }
  _renderPortButton(slot, selectedKey) {
    const isSpecial = slot.kind === "special";
    const linkUp = isPortConnected(this._hass, slot);
    const poeStatus = getPoeStatus(this._hass, slot);
    const poeOn = poeStatus.active;
    const speedClass = linkUp ? this._speedClass(this._hass, slot) : "";
    const tooltip = [
      slot.port_label || (isSpecial ? slot.label : `${this._t("port_label")} ${slot.label}`),
      this._translateState(getPortLinkText(this._hass, slot)),
      linkUp ? getPortSpeedText(this._hass, slot) : null,
      poeOn ? `${this._t("poe")}${poeStatus.power ? ` ${poeStatus.power}` : " ON"}` : null
    ].filter((v) => v && v !== "\u2014").join(" \xB7 ");
    const classes = [
      "port",
      isSpecial ? "special" : "",
      linkUp ? "up" : "down",
      selectedKey === slot.key ? "selected" : "",
      speedClass,
      poeOn ? "poe-on" : ""
    ].filter(Boolean).join(" ");
    return `<button class="${classes}" data-key="${slot.key}" title="${tooltip}">
      <div class="port-leds">
        <div class="port-led port-led-link"></div>
      </div>
      <div class="port-socket"></div>
      <div class="port-num">${slot.label}</div>
    </button>`;
  }
  _renderPanelAndDetail(title) {
    const ctx = this._ctx;
    const { specials, numbered } = this._buildSlotData(ctx);
    const allSlots = [...specials, ...numbered];
    const selected = allSlots.find((p) => p.key === this._selectedKey) || allSlots[0] || null;
    const connected = this._connectedCount(allSlots);
    const theme = ctx?.layout?.theme || "dark";
    const specialRow = specials.length ? `<div class="special-row">${specials.map((s) => this._renderPortButton(s, selected?.key)).join("")}</div>` : "";
    const layoutRows = (ctx?.layout?.rows || []).map((rowPorts) => {
      const items = rowPorts.map((portNumber) => {
        const slot = numbered.find((p) => p.port === portNumber) || {
          key: `port-${portNumber}`,
          port: portNumber,
          label: String(portNumber),
          kind: "numbered",
          link_entity: null,
          port_switch_entity: null,
          speed_entity: null,
          poe_switch_entity: null,
          poe_power_entity: null,
          power_cycle_entity: null,
          rx_entity: null,
          tx_entity: null,
          raw_entities: []
        };
        return this._renderPortButton(slot, selected?.key);
      }).join("");
      return `<div class="port-row">${items}</div>`;
    });
    let detail = `<div class="muted">${this._t("no_ports")}</div>`;
    if (selected) {
      const linkUp = isPortConnected(this._hass, selected);
      const linkText = getPortLinkText(this._hass, selected);
      const speedText = getPortSpeedText(this._hass, selected);
      const poeStatus = getPoeStatus(this._hass, selected);
      const hasPoe = !!(selected.poe_switch_entity || selected.poe_power_entity || selected.power_cycle_entity);
      const poeOn = poeStatus.active;
      const poePower = selected.poe_power_entity ? formatState(this._hass, selected.poe_power_entity) : "\u2014";
      const rxVal = selected.rx_entity ? formatState(this._hass, selected.rx_entity) : null;
      const txVal = selected.tx_entity ? formatState(this._hass, selected.tx_entity) : null;
      const portTitle = selected.port_label || (selected.kind === "special" ? selected.label : `${this._t("port_label")} ${selected.label}`);
      detail = `
        <div class="detail-title">${portTitle}</div>
        <div class="detail-grid">
          <div class="detail-item">
            <div class="detail-label">${this._t("link_status")}</div>
            <div class="detail-value ${linkUp ? "online" : "offline"}">
              ${this._translateState(linkText) || (linkUp ? this._t("connected") : this._t("no_link"))}
            </div>
          </div>
          <div class="detail-item">
            <div class="detail-label">${this._t("speed")}</div>
            <div class="detail-value">${speedText || "\u2014"}</div>
          </div>
          ${hasPoe ? `
          <div class="detail-item">
            <div class="detail-label">${this._t("poe")}</div>
            <div class="detail-value ${poeOn ? "online" : "offline"}">
              ${poeOn ? this._t("state_on") : this._t("state_off")}
            </div>
          </div>
          <div class="detail-item">
            <div class="detail-label">${this._t("poe_power")}</div>
            <div class="detail-value">${poePower || "\u2014"}</div>
          </div>` : ""}
          ${rxVal != null ? `
          <div class="detail-item">
            <div class="detail-label">RX</div>
            <div class="detail-value">${rxVal}</div>
          </div>` : ""}
          ${txVal != null ? `
          <div class="detail-item">
            <div class="detail-label">TX</div>
            <div class="detail-value">${txVal}</div>
          </div>` : ""}
        </div>
        <div class="actions">
          ${selected.port_switch_entity ? (() => {
        const enabled = isOn(this._hass, selected.port_switch_entity);
        return `<button class="action-btn secondary" data-action="toggle-port" data-entity="${selected.port_switch_entity}">
                    ${enabled ? this._t("port_disable") : this._t("port_enable")}
                  </button>`;
      })() : ""}
          ${selected.poe_switch_entity ? `<button class="action-btn primary" data-action="toggle-poe" data-entity="${selected.poe_switch_entity}">
                  \u26A1 ${poeOn ? this._t("poe_off") : this._t("poe_on")}
                </button>` : ""}
          ${selected.power_cycle_entity ? `<button class="action-btn secondary" data-action="power-cycle" data-entity="${selected.power_cycle_entity}">
                  \u21BA ${this._t("power_cycle")}
                </button>` : ""}
        </div>`;
    }
    this.shadowRoot.innerHTML = `${this._styles()}
      <ha-card ${this._cardBgStyle() ? `style="--udc-card-bg: ${this._cardBgStyle()}"` : ""}>
        <div class="header">
          <div class="header-info">
            <div class="title">${title}</div>
            <div class="subtitle">${this._subtitle()}</div>
          </div>
          <div class="chip"><div class="dot"></div>${connected}/${allSlots.length}</div>
        </div>

        <div class="frontpanel ${ctx?.layout?.frontStyle || "single-row"} theme-${theme}">
          <div class="panel-label">${this._t("front_panel")}</div>
          ${specialRow}
          ${layoutRows.join("") || `<div class="muted" style="padding:8px 0">${this._t("no_ports")}</div>`}
        </div>

        <div class="section">${detail}</div>
      </ha-card>`;
    this.shadowRoot.querySelectorAll(".port").forEach(
      (btn) => btn.addEventListener("click", () => this._selectKey(btn.dataset.key))
    );
    this.shadowRoot.querySelector("[data-action='toggle-port']")?.addEventListener(
      "click",
      (e) => this._toggleEntity(e.currentTarget.dataset.entity)
    );
    this.shadowRoot.querySelector("[data-action='toggle-poe']")?.addEventListener(
      "click",
      (e) => this._toggleEntity(e.currentTarget.dataset.entity)
    );
    this.shadowRoot.querySelector("[data-action='power-cycle']")?.addEventListener(
      "click",
      (e) => this._pressButton(e.currentTarget.dataset.entity)
    );
  }
  _render() {
    const title = this._config?.name || "UniFi Device Card";
    if (!this._config?.device_id) {
      this.shadowRoot.innerHTML = `${this._styles()}
        <ha-card ${this._cardBgStyle() ? `style="--udc-card-bg: ${this._cardBgStyle()}"` : ""}>
          <div class="header">
            <div class="header-info">
              <div class="title">${title}</div>
              <div class="subtitle">${this._subtitle()}</div>
            </div>
          </div>
          <div class="empty-state">${this._t("select_device")}</div>
        </ha-card>`;
      return;
    }
    if (this._loading) {
      this.shadowRoot.innerHTML = `${this._styles()}
        <ha-card ${this._cardBgStyle() ? `style="--udc-card-bg: ${this._cardBgStyle()}"` : ""}>
          <div class="header">
            <div class="header-info">
              <div class="title">${title}</div>
              <div class="subtitle">${this._subtitle()}</div>
            </div>
          </div>
          <div class="loading-state"><div class="spinner"></div>${this._t("loading")}</div>
        </ha-card>`;
      return;
    }
    if (!this._ctx) {
      this.shadowRoot.innerHTML = `${this._styles()}
        <ha-card ${this._cardBgStyle() ? `style="--udc-card-bg: ${this._cardBgStyle()}"` : ""}>
          <div class="header">
            <div class="header-info">
              <div class="title">${title}</div>
              <div class="subtitle">${this._subtitle()}</div>
            </div>
          </div>
          <div class="empty-state">${this._t("no_data")}</div>
        </ha-card>`;
      return;
    }
    this._renderPanelAndDetail(title);
  }
};
customElements.define("unifi-device-card", UnifiDeviceCard);
window.customCards = window.customCards || [];
window.customCards.push({
  type: "unifi-device-card",
  name: "UniFi Device Card",
  description: "Lovelace card for UniFi switches and gateways."
});
