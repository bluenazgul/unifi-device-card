/* UniFi Device Card 0.0.0-dev.9ac7e37 */

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
function apModel(displayModel) {
  return {
    kind: "access_point",
    frontStyle: "ap-disc",
    rows: [],
    portCount: 0,
    displayModel,
    theme: "white",
    specialSlots: []
  };
}
var AP_MODEL_PREFIXES = ["UAP", "U6", "U7", "UAL", "UAPMESH", "E7", "UWB", "UDB"];
function isAccessPointLikeModel(device) {
  const candidates = [device?.model, device?.hw_version].filter(Boolean).map(normalizeModelKey);
  return AP_MODEL_PREFIXES.some(
    (pfx) => candidates.some((candidate) => candidate.startsWith(pfx))
  );
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
  // ACCESS POINTS
  // ══════════════════════════════════════════════════════════════════════════
  UAP: apModel("UAP"),
  UAPLR: apModel("UAP-LR"),
  UAPPRO: apModel("UAP-Pro"),
  UAPAC: apModel("UAP AC"),
  UAPACLITE: apModel("UAP AC Lite"),
  UAPACLR: apModel("UAP AC LR"),
  UAPACPRO: apModel("UAP AC Pro"),
  UAPACIW: apModel("UAP AC In-Wall"),
  UAPACM: apModel("UAP AC Mesh"),
  UAPACMPRO: apModel("UAP AC Mesh Pro"),
  UAPNANOHD: apModel("UAP nanoHD"),
  UAPHD: apModel("UAP HD"),
  UAPXG: apModel("UAP XG"),
  UAPSHD: apModel("UAP SHD"),
  UAPFLEXHD: apModel("UAP FlexHD"),
  UAPBEACONHD: apModel("UAP BeaconHD"),
  U6LITE: apModel("U6 Lite"),
  U6LR: apModel("U6 LR"),
  U6PRO: apModel("U6 Pro"),
  U6PLUS: apModel("U6+"),
  U6MESH: apModel("U6 Mesh"),
  U6IW: apModel("U6 In-Wall"),
  U6ENTERPRISE: apModel("U6 Enterprise"),
  U7PRO: apModel("U7 Pro"),
  U7PROMAX: apModel("U7 Pro Max"),
  U7PROWALL: apModel("U7 Pro Wall"),
  U7OUTDOOR: apModel("U7 Outdoor"),
  E7: apModel("E7"),
  UWBXG: apModel("UWB-XG"),
  // ══════════════════════════════════════════════════════════════════════════
  // SWITCHES — Generation 1 (US-*)
  // ══════════════════════════════════════════════════════════════════════════
  // US 8 12W  — 8× 1G RJ45, PoE-Passthrough 12W (Port 8)
  USC8: {
    kind: "switch",
    frontStyle: "single-row",
    rows: [range(1, 8)],
    portCount: 8,
    displayModel: "USC 8",
    theme: "silver",
    poePortRange: [],
    specialSlots: []
  },
  // US 8 60W  — 8× 1G RJ45, PoE on ports 5-8
  US8P60: {
    kind: "switch",
    frontStyle: "single-row",
    rows: [range(1, 8)],
    portCount: 8,
    displayModel: "US 8",
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
  UDR7: {
    kind: "gateway",
    frontStyle: "gateway-single-row",
    rows: [[1, 2, 3, 4]],
    portCount: 5,
    displayModel: "Dream Router 7",
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
    if (candidate === "UAP") return "UAP";
    if (candidate.includes("UAPLR")) return "UAPLR";
    if (candidate.includes("UAPPRO")) return "UAPPRO";
    if (candidate.includes("UAPACMESH")) return "UAPACM";
    if (candidate.includes("UAPACMPRO")) return "UAPACMPRO";
    if (candidate.includes("UAPACM")) return "UAPACM";
    if (candidate.includes("UAPACLR")) return "UAPACLR";
    if (candidate.includes("UAPACLITE")) return "UAPACLITE";
    if (candidate.includes("UAPACPRO")) return "UAPACPRO";
    if (candidate.includes("UAPACIW")) return "UAPACIW";
    if (candidate.includes("UAPAC")) return "UAPAC";
    if (candidate.includes("UAPNANOHD")) return "UAPNANOHD";
    if (candidate.includes("UAPFLEXHD")) return "UAPFLEXHD";
    if (candidate.includes("UAPBEACONHD")) return "UAPBEACONHD";
    if (candidate.includes("UAPSHD")) return "UAPSHD";
    if (candidate.includes("UAPXG")) return "UAPXG";
    if (candidate.includes("UAPHD")) return "UAPHD";
    if (candidate.includes("U6ENTERPRISE")) return "U6ENTERPRISE";
    if (candidate.includes("U6MESH")) return "U6MESH";
    if (candidate.includes("U6PLUS")) return "U6PLUS";
    if (candidate.includes("U6PRO")) return "U6PRO";
    if (candidate.includes("U6LR")) return "U6LR";
    if (candidate.includes("U6LITE")) return "U6LITE";
    if (candidate.includes("U6IW")) return "U6IW";
    if (candidate.includes("U7PROWALL")) return "U7PROWALL";
    if (candidate.includes("U7PROMAX")) return "U7PROMAX";
    if (candidate.includes("U7PRO")) return "U7PRO";
    if (candidate.includes("U7OUTDOOR")) return "U7OUTDOOR";
    if (candidate.includes("UWBXG")) return "UWBXG";
    if (candidate === "E7" || candidate.startsWith("E7")) return "E7";
    if (candidate.includes("UCGFIBER")) return "UCGFIBER";
    if (candidate.includes("CLOUDGATEWAYFIBER")) return "UCGFIBER";
    if (candidate.includes("UDR7")) return "UDR7";
    if (candidate.includes("DREAMROUTER7")) return "UDR7";
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
    if (candidate.includes("USC8")) return "USC8";
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
  if (text.includes("UDR7") || text.includes("DREAMROUTER7")) return 5;
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
  if (text.includes("US8P60") || text.includes("US860W") || text.includes("USC8")) return 8;
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
  if (isAccessPointLikeModel(device)) {
    return {
      modelKey: null,
      kind: "access_point",
      frontStyle: "ap-disc",
      rows: [],
      portCount: 0,
      displayModel: device?.model || "UniFi Access Point",
      theme: "white",
      specialSlots: []
    };
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
  "USC8",
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
  "UDR7",
  "UDRULT",
  "UDMPRO",
  "UDMPROSE"
];
var AP_MODEL_PREFIXES2 = ["UAP", "U6", "U7", "UAL", "UAPMESH", "E7", "UWB", "UDB"];
function normalizeModelStr(value) {
  return String(value ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "");
}
function modelStartsWith(device, prefixes) {
  const candidates = [device?.model, device?.hw_version].filter(Boolean).map(normalizeModelStr);
  return prefixes.some((pfx) => candidates.some((c) => c.startsWith(pfx)));
}
function isDefinitelyAP(device) {
  return modelStartsWith(device, AP_MODEL_PREFIXES2);
}
function isVirtualControllerDevice(device) {
  const model = lower(device?.model);
  const name = lower(device?.name_by_user || device?.name);
  const combined = `${model} ${name}`;
  return combined.includes("network application") || combined.includes("unifi os") || combined.includes("controller");
}
function hasInfrastructureEntitySignals(entities = []) {
  const hasPortEntities = entities.some((e) => /_port_\d+(?:_|$)/i.test(e?.entity_id || ""));
  if (hasPortEntities) return true;
  const hasRebootControl = entities.some((e) => {
    const id = lower(e?.entity_id);
    if (!id.startsWith("button.")) return false;
    return id.includes("reboot") || id.includes("restart") || id.includes("power_cycle");
  });
  if (hasRebootControl) return true;
  return entities.some((e) => {
    const id = lower(e?.entity_id);
    if (!id.startsWith("sensor.") && !id.startsWith("binary_sensor.")) return false;
    return id.includes("cpu") || id.includes("memory") || id.includes("temperature") || id.endsWith("_uptime") || id.includes("_uptime_") || id.endsWith("_clients") || id.includes("_clients_");
  });
}
function getDeviceType(device, entities = []) {
  if (isDefinitelyAP(device)) return "access_point";
  const modelKey = resolveModelKey(device);
  if (modelKey) {
    if ([
      "UCGULTRA",
      "UDR7",
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
      "USC8",
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
  if (modelStartsWith(device, AP_MODEL_PREFIXES2)) return "access_point";
  const hasAccessPointSignals = entities.some((entity) => {
    const id = lower(entity?.entity_id);
    if (!id) return false;
    return id.endsWith("_clients") || id.includes("_clients_") || id.endsWith("_uptime") || id.includes("_is_online") || id.includes("_connected");
  });
  if (hasAccessPointSignals && hasUbiquitiManufacturer(device)) return "access_point";
  const hasPorts = entities.some((e) => /_port_\d+(?:_|$)/i.test(e.entity_id));
  if (hasPorts) return "switch";
  if (hasUbiquitiManufacturer(device)) {
    const model = lower(device?.model);
    const name = lower(device?.name_by_user || device?.name);
    if (model.includes("udm") || model.includes("ucg") || model.includes("uxg") || model.includes("ugw") || name.includes("gateway")) {
      return "gateway";
    }
    if (model.includes("usw") || model.includes("usl") || model.includes("us8") || model.includes("usc8") || name.includes("switch")) {
      return "switch";
    }
    if (model.includes("uap") || model.includes("u6") || model.includes("u7") || model.includes("ap") || model.includes("in-wall") || model.includes("iw") || model.includes("mesh") || model.includes("nanohd") || model.includes("enterprise") || name.includes("access point") || name.includes("ap ")) {
      return "access_point";
    }
    if (!hasPorts) return "access_point";
  }
  return "unknown";
}
function getWSErrorCode(err) {
  if (err?.code != null) return err.code;
  if (err?.error?.code != null) return err.error.code;
  return null;
}
function getWSErrorMessage(err) {
  return String(err?.message ?? err?.error?.message ?? "").toLowerCase();
}
function isIgnorableWSError(err) {
  const code = getWSErrorCode(err);
  const msg = getWSErrorMessage(err);
  return code === 3 || code === "3" || code === "unknown_command" || msg.includes("unknown command") || msg.includes("not connected") || msg.includes("disconnected") || msg.includes("socket closed") || msg.includes("connection lost");
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
var _registryInflight = /* @__PURE__ */ new WeakMap();
function flattenEntitiesByDevice(map) {
  if (!map || typeof map.values !== "function") return [];
  return Array.from(map.values()).flat();
}
async function getAllData(hass) {
  const now = Date.now();
  const cached = _registryCache.get(hass);
  if (cached && now - cached.ts < REGISTRY_CACHE_TTL) {
    return cached.data;
  }
  const inflight = _registryInflight.get(hass);
  if (inflight) return inflight;
  const promise = (async () => {
    const fallbackDevices = cached?.data?.devices || [];
    const fallbackEntities = flattenEntitiesByDevice(cached?.data?.entitiesByDevice);
    const fallbackConfigEntries = cached?.data?.configEntries || [];
    const [devices, rawEntities, configEntries] = await Promise.all([
      safeCallWS(hass, { type: "config/device_registry/list" }, fallbackDevices),
      safeCallWS(hass, { type: "config/entity_registry/list" }, fallbackEntities),
      safeCallWS(hass, { type: "config/config_entries" }, fallbackConfigEntries)
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
      configEntries: configEntries || []
    };
    if ((data.devices?.length || 0) > 0 || entities.length > 0) {
      _registryCache.set(hass, { ts: Date.now(), data });
    }
    return data;
  })();
  _registryInflight.set(hass, promise);
  try {
    return await promise;
  } finally {
    _registryInflight.delete(hass);
  }
}
function isUnifiDevice(device, unifiEntryIds, entities) {
  if (isVirtualControllerDevice(device)) return false;
  const hasInfraSignals = hasInfrastructureEntitySignals(entities);
  if (Array.isArray(device?.config_entries) && device.config_entries.some((id) => unifiEntryIds.has(id))) {
    return hasInfraSignals || !!resolveModelKey(device);
  }
  if (resolveModelKey(device)) return true;
  if (modelStartsWith(device, [...SWITCH_MODEL_PREFIXES, ...GATEWAY_MODEL_PREFIXES, ...AP_MODEL_PREFIXES2])) {
    return true;
  }
  if (entities.some((e) => /_port_\d+(?:_|$)/i.test(e.entity_id)) && hasUbiquitiManufacturer(device)) {
    return true;
  }
  if (hasUbiquitiManufacturer(device) && getDeviceType(device, entities) === "access_point" && hasInfraSignals) {
    return true;
  }
  return false;
}
function buildDeviceLabel(device, type) {
  const name = normalize(device.name_by_user) || normalize(device.name) || normalize(device.model) || "Unknown device";
  const model = normalize(device.model);
  const typeLabel = type === "gateway" ? "Gateway" : type === "access_point" ? "Access Point" : "Switch";
  if (model && lower(model) !== lower(name)) return `${name} \xB7 ${model} (${typeLabel})`;
  return `${name} (${typeLabel})`;
}
function extractFirmware(device) {
  if (normalize(device?.sw_version)) return normalize(device.sw_version);
  return "";
}
function findDeviceEntityByPatterns(entities, patterns = []) {
  for (const entity of entities || []) {
    const id = lower(entity.entity_id);
    if (!id.startsWith("sensor.")) continue;
    if (patterns.some((pattern) => id.includes(pattern))) {
      return entity.entity_id;
    }
  }
  return null;
}
function getDeviceTelemetry(entities) {
  return {
    cpu_utilization_entity: findDeviceEntityByPatterns(entities, ["cpu_utilization", "cpu_usage", "processor_utilization"]),
    cpu_temperature_entity: findDeviceEntityByPatterns(entities, ["cpu_temperature", "processor_temperature", "temperature_cpu"]),
    memory_utilization_entity: findDeviceEntityByPatterns(entities, ["memory_utilization", "memory_usage", "ram_utilization"])
  };
}
function getDeviceOnlineEntity(entities) {
  for (const entity of entities || []) {
    const id = lower(entity.entity_id);
    if (!id.startsWith("binary_sensor.")) continue;
    if (id.endsWith("_is_online") || id.endsWith("_status") || id.includes("_connected") || id.includes("is_online")) {
      return entity.entity_id;
    }
  }
  for (const entity of entities || []) {
    const id = lower(entity.entity_id);
    if (!id.startsWith("sensor.")) continue;
    if (id.endsWith("_state") || id.endsWith("_status") || id.includes("_connected") || id.includes("is_online")) {
      return entity.entity_id;
    }
  }
  return null;
}
function getAccessPointStatEntities(entities) {
  let uptimeEntity = null;
  let clientsEntity = null;
  let apStatusEntity = null;
  let ledSwitchEntity = null;
  let ledColorEntity = null;
  for (const entity of entities || []) {
    const id = lower(entity.entity_id);
    const tk = lower(entity.translation_key || "");
    if (!ledSwitchEntity && id.startsWith("light.") && (id.includes("led") || id.includes("indicator") || tk.includes("led") || tk.includes("indicator"))) {
      ledSwitchEntity = entity.entity_id;
    }
    if (!id.startsWith("sensor.")) continue;
    if (!uptimeEntity && (id.endsWith("_uptime") || id.includes(" uptime") || id.includes("_uptime_") || id.includes("uptime"))) {
      uptimeEntity = entity.entity_id;
    }
    if (!clientsEntity && (id.endsWith("_clients") || id.includes("_clients_") || id.includes(" clients"))) {
      clientsEntity = entity.entity_id;
    }
    if (!apStatusEntity && (id.endsWith("_state") || id.includes("_state_"))) {
      apStatusEntity = entity.entity_id;
    }
    if (!ledColorEntity && (id.includes("led_color") || id.includes("led_colour") || id.includes("indicator_color") || id.includes("indicator_colour"))) {
      ledColorEntity = entity.entity_id;
    }
  }
  return {
    uptime_entity: uptimeEntity,
    clients_entity: clientsEntity,
    ap_status_entity: apStatusEntity,
    led_switch_entity: ledSwitchEntity,
    led_color_entity: ledColorEntity
  };
}
function getDeviceRebootEntity(entities) {
  for (const entity of entities || []) {
    const id = lower(entity.entity_id);
    const tk = lower(entity.translation_key || "");
    if (!id.startsWith("button.")) continue;
    if (id.includes("reboot") || id.includes("restart") || tk.includes("reboot") || tk.includes("restart")) {
      return entity.entity_id;
    }
  }
  return null;
}
async function getUnifiDevices(hass) {
  const { devices, entitiesByDevice, configEntries } = await getAllData(hass);
  const unifiEntryIds = extractUnifiEntryIds(configEntries);
  const results = [];
  for (const device of devices || []) {
    const entities = entitiesByDevice.get(device.id) || [];
    if (!isUnifiDevice(device, unifiEntryIds, entities)) continue;
    const type = getDeviceType(device, entities);
    if (type !== "switch" && type !== "gateway" && type !== "access_point") continue;
    results.push({
      id: device.id,
      name: normalize(device.name_by_user) || normalize(device.name) || normalize(device.model),
      label: buildDeviceLabel(device, type),
      model: normalize(device.model),
      type
    });
  }
  return results.sort(
    (a, b) => a.name.localeCompare(b.name, void 0, { sensitivity: "base" })
  );
}
function classifyRelevantEntityType(entity) {
  const id = lower(entity.entity_id);
  const eid = entity.entity_id || "";
  const tk = lower(entity.translation_key || "");
  const dc = lower(entity.device_class || "");
  const odc = lower(entity.original_device_class || "");
  if (eid.startsWith("button.") && (id.includes("power_cycle") || tk === "power_cycle")) {
    return "power_cycle";
  }
  if (eid.startsWith("switch.") && id.includes("_port_") && id.endsWith("_poe")) {
    return "poe_switch";
  }
  if (eid.startsWith("switch.") && id.includes("_port_")) {
    return "port_switch";
  }
  if (eid.startsWith("sensor.") && (id.includes("_poe_power") || id.includes("_poe") && id.includes("power") || id.includes("power_draw") || id.includes("power_consumption") || id.includes("consumption") || tk === "poe_power" || tk === "port_poe_power" || tk === "poe_power_consumption" || dc === "power" || odc === "power")) {
    return "poe_power";
  }
  if (eid.startsWith("sensor.") && (id.endsWith("_rx") || id.endsWith("_tx") || id.includes("_rx_") || id.includes("_tx_") || id.includes("throughput") || id.includes("bandwidth") || id.includes("download") || id.includes("upload") || tk === "port_bandwidth_rx" || tk === "port_bandwidth_tx" || tk === "rx" || tk === "tx")) {
    return "rx_tx";
  }
  if (eid.startsWith("sensor.") && (id.includes("link_speed") || id.includes("ethernet_speed") || id.includes("negotiated_speed") || id.endsWith("_speed") || tk === "port_link_speed" || tk === "link_speed")) {
    return "link_speed";
  }
  if (eid.startsWith("binary_sensor.") && (id.includes("_port_") || id.includes("_link") || tk === "port_link")) {
    return "link";
  }
  return null;
}
async function getRelevantEntityWarningsForDevice(hass, deviceId) {
  const cached = _registryCache.get(hass)?.data;
  const [devices, allEntities] = await Promise.all([
    safeCallWS(hass, { type: "config/device_registry/list" }, cached?.devices || []),
    safeCallWS(
      hass,
      { type: "config/entity_registry/list" },
      flattenEntitiesByDevice(cached?.entitiesByDevice)
    )
  ]);
  const device = (devices || []).find((d) => d.id === deviceId);
  if (!device) return null;
  const allForDevice = (allEntities || []).filter((e) => e.device_id === deviceId);
  const disabled = {
    port_switch: [],
    poe_switch: [],
    poe_power: [],
    link_speed: [],
    rx_tx: [],
    power_cycle: [],
    link: []
  };
  const hidden = {
    port_switch: [],
    poe_switch: [],
    poe_power: [],
    link_speed: [],
    rx_tx: [],
    power_cycle: [],
    link: []
  };
  for (const entity of allForDevice) {
    const type = classifyRelevantEntityType(entity);
    if (!type) continue;
    if (entity.disabled_by) disabled[type]?.push(entity.entity_id);
    else if (entity.hidden_by) hidden[type]?.push(entity.entity_id);
  }
  const disabledCount = Object.values(disabled).flat().length;
  const hiddenCount = Object.values(hidden).flat().length;
  if (disabledCount === 0 && hiddenCount === 0) return null;
  return { disabled, hidden, disabledCount, hiddenCount };
}
function extractPortNumber(entity) {
  const uid = normalize(entity.unique_id);
  const uidMatch = uid.match(/_port[_-]?(\d+)(?:[_-]|$)/i) || uid.match(/-(\d+)-[a-z]/i) || uid.match(/port[_-](\d+)/i) || uid.match(/[_-](\d+)$/);
  if (uidMatch) return parseInt(uidMatch[1], 10);
  const eid = lower(entity.entity_id);
  const eidMatch = eid.match(/_port_(\d+)(?:_|$)/i);
  if (eidMatch) return parseInt(eidMatch[1], 10);
  const originalNameMatch = (entity.original_name || "").match(/\bport\s+(\d+)\b/i);
  if (originalNameMatch) return parseInt(originalNameMatch[1], 10);
  const nameMatch = (entity.name || "").match(/\bport\s+(\d+)\b/i);
  if (nameMatch) return parseInt(nameMatch[1], 10);
  return null;
}
function classifyPortEntity(entity, isSpecial = false) {
  const id = lower(entity.entity_id);
  const eid = entity.entity_id || "";
  const tk = lower(entity.translation_key || "");
  const dc = lower(entity.device_class || "");
  const odc = lower(entity.original_device_class || "");
  if (eid.startsWith("button.") && (id.includes("power_cycle") || tk === "power_cycle" || id.includes("_restart") || id.includes("_reboot"))) {
    return "power_cycle_entity";
  }
  if (eid.startsWith("switch.") && id.includes("_port_") && id.endsWith("_poe")) {
    return "poe_switch_entity";
  }
  if (eid.startsWith("switch.") && (id.includes("_port_") || isSpecial)) {
    return "port_switch_entity";
  }
  if (eid.startsWith("binary_sensor.")) {
    if (id.includes("_port_")) return "link_entity";
    if (isSpecial && (id.includes("_wan") || id.includes("_sfp") || id.includes("_uplink") || id.includes("_connected") || id.includes("_link") || tk === "port_link")) {
      return "link_entity";
    }
  }
  if (eid.startsWith("sensor.")) {
    if (id.includes("_port_")) {
      if (id.endsWith("_rx") || id.includes("_rx_") || id.includes("download") || tk === "port_bandwidth_rx" || tk === "rx") {
        return "rx_entity";
      }
      if (id.endsWith("_tx") || id.includes("_tx_") || id.includes("upload") || tk === "port_bandwidth_tx" || tk === "tx") {
        return "tx_entity";
      }
      if (id.includes("link_speed") || id.includes("ethernet_speed") || id.includes("negotiated_speed") || id.endsWith("_speed") || tk === "port_link_speed" || tk === "link_speed") {
        return "speed_entity";
      }
      if (id.includes("_poe_power") || id.includes("_poe") && id.includes("power") || id.includes("power_draw") || id.includes("power_consumption") || id.includes("consumption") || tk === "poe_power" || tk === "port_poe_power" || tk === "poe_power_consumption" || dc === "power" || odc === "power") {
        return "poe_power_entity";
      }
    }
    if (isSpecial && (id.includes("_wan") || id.includes("_sfp") || id.includes("_uplink"))) {
      if (id.includes("download") || id.includes("_rx") || tk === "port_bandwidth_rx" || tk === "rx") {
        return "rx_entity";
      }
      if (id.includes("upload") || id.includes("_tx") || tk === "port_bandwidth_tx" || tk === "tx") {
        return "tx_entity";
      }
      if (id.includes("link_speed") || id.includes("ethernet_speed") || id.includes("negotiated_speed") || id.endsWith("_speed") || tk === "port_link_speed" || tk === "link_speed") {
        return "speed_entity";
      }
      if (id.includes("_poe_power") || id.includes("_poe") && id.includes("power") || id.includes("power_draw") || id.includes("power_consumption") || id.includes("consumption") || tk === "poe_power" || tk === "port_poe_power" || tk === "poe_power_consumption" || dc === "power" || odc === "power") {
        return "poe_power_entity";
      }
    }
  }
  return null;
}
function ensurePort(map, port) {
  if (!map.has(port)) {
    map.set(port, {
      key: `port-${port}`,
      port,
      label: String(port),
      kind: "numbered",
      link_entity: null,
      speed_entity: null,
      poe_switch_entity: null,
      poe_power_entity: null,
      port_switch_entity: null,
      power_cycle_entity: null,
      rx_entity: null,
      tx_entity: null,
      port_label: null,
      raw_entities: []
    });
  }
  return map.get(port);
}
function detectSpecialPortKey(entity) {
  const id = lower(entity.entity_id);
  const tk = entity.translation_key || "";
  if (id.includes("_wan2") || id.endsWith("wan2") || tk.includes("wan2")) {
    return { key: "wan2", label: "WAN 2" };
  }
  if (id.includes("_wan_") || id.endsWith("_wan") || tk.includes("wan")) {
    return { key: "wan", label: "WAN" };
  }
  const sfpMatch = id.match(/_sfp[_+]?(\d+)[_-]/) || tk.match(/sfp[_+]?(\d+)/);
  if (sfpMatch) return { key: `sfp_${sfpMatch[1]}`, label: `SFP+ ${sfpMatch[1]}` };
  if (id.includes("_sfp") || id.includes("sfp+")) return { key: "sfp_1", label: "SFP+" };
  if (id.includes("_uplink") || tk.includes("uplink")) {
    return { key: "uplink", label: "Uplink" };
  }
  return null;
}
function ensureSpecialPort(map, key, label) {
  if (!map.has(key)) {
    map.set(key, {
      key,
      port: null,
      label,
      kind: "special",
      link_entity: null,
      speed_entity: null,
      poe_switch_entity: null,
      poe_power_entity: null,
      port_switch_entity: null,
      power_cycle_entity: null,
      rx_entity: null,
      tx_entity: null,
      raw_entities: [],
      port_label: null
    });
  }
  return map.get(key);
}
function extractPortLabel(entity) {
  const isLabelSource = entity.entity_id?.startsWith("button.") && lower(entity.entity_id).includes("power_cycle") || entity.entity_id?.startsWith("sensor.") && lower(entity.entity_id).includes("_link_speed") || entity.entity_id?.startsWith("sensor.") && lower(entity.entity_id).includes("_poe_power");
  if (!isLabelSource) return null;
  const name = normalize(entity.original_name || entity.name || "");
  if (!name) return null;
  let stripped = name;
  for (const suffix of [/ power cycle$/i, / link speed$/i, / poe power$/i]) {
    const c = name.replace(suffix, "").trim();
    if (c.length < name.length) {
      stripped = c;
      break;
    }
  }
  stripped = stripped.replace(/^port\s+\d+\s*[-–]?\s*/i, "").trim();
  if (!stripped || /^(rx|tx|poe|link|uplink|downlink|sfp|wan|lan)$/i.test(stripped)) {
    return null;
  }
  return stripped;
}
function discoverPorts(entities) {
  const ports = /* @__PURE__ */ new Map();
  for (const entity of entities || []) {
    const port = extractPortNumber(entity);
    if (!port) continue;
    const row = ensurePort(ports, port);
    row.raw_entities.push(entity.entity_id);
    const type = classifyPortEntity(entity);
    if (type && !row[type]) row[type] = entity.entity_id;
    if (!row.port_label) {
      const label = extractPortLabel(entity);
      if (label) row.port_label = label;
    }
  }
  return Array.from(ports.values()).sort((a, b) => a.port - b.port);
}
function discoverSpecialPorts(entities) {
  const specials = /* @__PURE__ */ new Map();
  for (const entity of entities || []) {
    if (extractPortNumber(entity)) continue;
    const special = detectSpecialPortKey(entity);
    if (!special) continue;
    const row = ensureSpecialPort(specials, special.key, special.label);
    row.raw_entities.push(entity.entity_id);
    const type = classifyPortEntity(entity, true);
    if (type && !row[type]) row[type] = entity.entity_id;
  }
  return Array.from(specials.values());
}
function portHasPoe(portNumber, layout) {
  const r = layout?.poePortRange;
  if (!r) return false;
  return portNumber >= r[0] && portNumber <= r[1];
}
function stripPoeEntities(port) {
  return {
    ...port,
    poe_switch_entity: null,
    poe_power_entity: null,
    power_cycle_entity: null
  };
}
function mergePortsWithLayout(layout, discoveredPorts) {
  const byPort = new Map(discoveredPorts.map((p) => [p.port, p]));
  const layoutPorts = (layout?.rows || []).flat();
  const specialPortNumbers = new Set(
    (layout?.specialSlots || []).map((s) => s.port).filter((p) => p != null)
  );
  const merged = [];
  for (const portNumber of layoutPorts) {
    if (specialPortNumbers.has(portNumber)) continue;
    const discovered = byPort.get(portNumber);
    const hasPoe = portHasPoe(portNumber, layout);
    const port = discovered || {
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
      raw_entities: [],
      port_label: null
    };
    merged.push(hasPoe ? port : stripPoeEntities(port));
  }
  for (const port of discoveredPorts) {
    if (!layoutPorts.includes(port.port) && !specialPortNumbers.has(port.port)) {
      merged.push(port);
    }
  }
  return merged.sort((a, b) => (a.port ?? 999) - (b.port ?? 999));
}
function mergeSpecialsWithLayout(layout, discoveredSpecials, discoveredPorts = []) {
  const byKey = new Map(discoveredSpecials.map((s) => [s.key, s]));
  const byPort = new Map(discoveredPorts.map((p) => [p.port, p]));
  const layoutSpecials = layout?.specialSlots || [];
  const merged = layoutSpecials.map((slot) => {
    if (slot.port != null) {
      const portData = byPort.get(slot.port);
      if (portData) return { ...portData, key: slot.key, label: slot.label, kind: "special" };
    }
    const keyData = byKey.get(slot.key);
    if (keyData) {
      return {
        ...keyData,
        key: slot.key,
        label: slot.label,
        kind: "special",
        port: slot.port ?? keyData.port ?? null
      };
    }
    return {
      key: slot.key,
      port: slot.port ?? null,
      label: slot.label,
      kind: "special",
      link_entity: null,
      speed_entity: null,
      poe_switch_entity: null,
      poe_power_entity: null,
      port_switch_entity: null,
      power_cycle_entity: null,
      rx_entity: null,
      tx_entity: null,
      raw_entities: [],
      port_label: null
    };
  });
  return merged;
}
function cloneSlot(slot) {
  return {
    ...slot,
    raw_entities: Array.isArray(slot?.raw_entities) ? [...slot.raw_entities] : []
  };
}
function emptyNumberedPort(portNumber) {
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
    raw_entities: [],
    port_label: null
  };
}
function emptySpecialPort(key, label, port = null) {
  return {
    key,
    port,
    label,
    kind: "special",
    link_entity: null,
    speed_entity: null,
    poe_switch_entity: null,
    poe_power_entity: null,
    port_switch_entity: null,
    power_cycle_entity: null,
    rx_entity: null,
    tx_entity: null,
    raw_entities: [],
    port_label: null
  };
}
function resolveGatewaySelection(selection, roleKey, layout, specialsByKey) {
  const normalized = String(selection || "auto");
  if (normalized === "none") return null;
  if (!selection || normalized === "auto") {
    const def = (layout?.specialSlots || []).find((s) => s.key === roleKey);
    if (!def) return null;
    if (def.port != null) {
      return {
        type: "port",
        port: def.port,
        key: def.key,
        label: def.label
      };
    }
    return {
      type: "special",
      key: def.key,
      label: def.label
    };
  }
  if (normalized.startsWith("port_")) {
    const port = parseInt(normalized.replace(/^port_/, ""), 10);
    if (!Number.isInteger(port)) return null;
    return {
      type: "port",
      port,
      key: roleKey,
      label: roleKey === "wan2" ? "WAN 2" : "WAN"
    };
  }
  const specialLayout = (layout?.specialSlots || []).find((s) => s.key === normalized);
  if (specialLayout?.port != null) {
    return {
      type: "port",
      port: specialLayout.port,
      key: specialLayout.key,
      label: specialLayout.label
    };
  }
  const specialData = specialsByKey.get(normalized);
  if (specialData) {
    if (specialData.port != null) {
      return {
        type: "port",
        port: specialData.port,
        key: normalized,
        label: specialData.label
      };
    }
    return {
      type: "special",
      key: normalized,
      label: specialData.label
    };
  }
  return null;
}
function makeSpecialFromPhysical(roleKey, physical) {
  return {
    ...cloneSlot(physical),
    key: roleKey,
    label: roleKey === "wan2" ? "WAN 2" : "WAN",
    kind: "special"
  };
}
function makeNumberedFromPhysical(portNumber, physical, layout) {
  const hasPoe = portHasPoe(portNumber, layout);
  const base = physical ? cloneSlot(physical) : emptyNumberedPort(portNumber);
  const numbered = {
    ...base,
    key: `port-${portNumber}`,
    port: portNumber,
    label: String(portNumber),
    kind: "numbered"
  };
  return hasPoe ? numbered : stripPoeEntities(numbered);
}
function applyGatewayPortOverrides(config, specials, numbered, layout) {
  const wanPort = config?.wan_port;
  const wan2Port = config?.wan2_port;
  const normalizedWan = String(wanPort || "auto");
  const normalizedWan2 = String(wan2Port || "auto");
  if ((!wanPort || normalizedWan === "auto") && (!wan2Port || normalizedWan2 === "auto")) {
    return { specials, numbered };
  }
  const originalSpecials = (specials || []).map(cloneSlot);
  const originalNumbered = (numbered || []).map(cloneSlot);
  const specialsByKey = new Map(originalSpecials.map((s) => [s.key, s]));
  const physicalByPort = /* @__PURE__ */ new Map();
  for (const slot of [...originalSpecials, ...originalNumbered]) {
    if (Number.isInteger(slot?.port) && !physicalByPort.has(slot.port)) {
      physicalByPort.set(slot.port, cloneSlot(slot));
    }
  }
  const wanSel = resolveGatewaySelection(wanPort, "wan", layout, specialsByKey);
  const wan2Sel = resolveGatewaySelection(wan2Port, "wan2", layout, specialsByKey);
  const roleAssignments = /* @__PURE__ */ new Map();
  if (wanSel) roleAssignments.set("wan", wanSel);
  if (wan2Sel) {
    const samePort = wanSel?.type === "port" && wan2Sel?.type === "port" && wanSel.port === wan2Sel.port;
    const sameSpecial = wanSel?.type === "special" && wan2Sel?.type === "special" && wanSel.key === wan2Sel.key;
    if (!samePort && !sameSpecial) {
      roleAssignments.set("wan2", wan2Sel);
    }
  }
  const assignedPorts = new Set(
    Array.from(roleAssignments.values()).filter((s) => s?.type === "port").map((s) => s.port)
  );
  const assignedSpecialKeys = new Set(
    Array.from(roleAssignments.values()).filter((s) => s?.type === "special").map((s) => s.key)
  );
  const newSpecials = [];
  for (const roleKey of ["wan", "wan2"]) {
    const sel = roleAssignments.get(roleKey);
    if (!sel) continue;
    if (sel.type === "port") {
      const physical = physicalByPort.get(sel.port) || emptyNumberedPort(sel.port);
      newSpecials.push(makeSpecialFromPhysical(roleKey, physical));
    } else {
      const specialData = specialsByKey.get(sel.key) || emptySpecialPort(roleKey, roleKey === "wan2" ? "WAN 2" : "WAN");
      newSpecials.push({
        ...cloneSlot(specialData),
        key: roleKey,
        label: roleKey === "wan2" ? "WAN 2" : "WAN",
        kind: "special"
      });
    }
  }
  for (const slot of originalSpecials) {
    if (slot.key === "wan" || slot.key === "wan2") continue;
    if (Number.isInteger(slot.port) && assignedPorts.has(slot.port)) continue;
    if (!Number.isInteger(slot.port) && assignedSpecialKeys.has(slot.key)) continue;
    newSpecials.push(cloneSlot(slot));
  }
  const newNumbered = [];
  for (const slot of originalNumbered) {
    if (assignedPorts.has(slot.port)) continue;
    newNumbered.push(makeNumberedFromPhysical(slot.port, slot, layout));
  }
  for (const slot of originalSpecials) {
    if (!Number.isInteger(slot.port)) continue;
    if (assignedPorts.has(slot.port)) continue;
    if (slot.key === "wan" || slot.key === "wan2") {
      newNumbered.push(makeNumberedFromPhysical(slot.port, slot, layout));
    }
  }
  const seen = /* @__PURE__ */ new Set();
  const deduped = [];
  for (const port of newNumbered.sort((a, b) => (a.port ?? 999) - (b.port ?? 999))) {
    if (!Number.isInteger(port.port)) continue;
    if (seen.has(port.port)) continue;
    seen.add(port.port);
    deduped.push(port);
  }
  return { specials: newSpecials, numbered: deduped };
}
var PORT_TRANSLATION_KEYS = /* @__PURE__ */ new Set([
  "port_bandwidth_rx",
  "port_bandwidth_tx",
  "port_link_speed",
  "poe",
  "poe_power",
  "poe_port_control"
]);
function filterPortsByLayout(discoveredPorts, layout) {
  const layoutRows = (layout?.rows || []).flat();
  const specialPorts = (layout?.specialSlots || []).map((slot) => slot?.port).filter((port) => Number.isInteger(port));
  const allowed = /* @__PURE__ */ new Set([...layoutRows, ...specialPorts]);
  if (!allowed.size) return discoveredPorts;
  return discoveredPorts.filter((port) => allowed.has(port.port));
}
async function getDeviceContext(hass, deviceId) {
  const { devices, entitiesByDevice, configEntries } = await getAllData(hass);
  const unifiEntryIds = extractUnifiEntryIds(configEntries);
  const device = devices.find((d) => d.id === deviceId);
  if (!device) return null;
  let entities = entitiesByDevice.get(deviceId) || [];
  if (!isUnifiDevice(device, unifiEntryIds, entities)) return null;
  const type = getDeviceType(device, entities);
  if (type !== "switch" && type !== "gateway" && type !== "access_point") return null;
  const needsUID = entities.filter(
    (e) => !e.unique_id && e.translation_key && PORT_TRANSLATION_KEYS.has(e.translation_key) && !/_port_\d+/i.test(e.entity_id) && !/\bport\s+\d+\b/i.test(e.original_name || "")
  );
  if (needsUID.length > 0) {
    const details = await Promise.all(
      needsUID.map(
        (e) => safeCallWS(
          hass,
          { type: "config/entity_registry/get", entity_id: e.entity_id },
          null
        )
      )
    );
    const uidMap = new Map(
      details.filter(Boolean).filter((d) => d.unique_id).map((d) => [d.entity_id, d.unique_id])
    );
    if (uidMap.size > 0) {
      entities = entities.map(
        (e) => uidMap.has(e.entity_id) ? { ...e, unique_id: uidMap.get(e.entity_id) } : e
      );
    }
  }
  const discoveredPortsRaw = discoverPorts(entities);
  const layout = getDeviceLayout(device, discoveredPortsRaw);
  const numberedPorts = filterPortsByLayout(discoveredPortsRaw, layout);
  const specialPorts = discoverSpecialPorts(entities);
  const telemetry = getDeviceTelemetry(entities);
  const apStats = getAccessPointStatEntities(entities);
  return {
    device,
    entities,
    type,
    layout,
    specialPorts,
    name: normalize(device.name_by_user) || normalize(device.name) || normalize(device.model),
    model: normalize(device.model),
    manufacturer: normalize(device.manufacturer),
    firmware: extractFirmware(device),
    online_entity: getDeviceOnlineEntity(entities),
    ...apStats,
    reboot_entity: getDeviceRebootEntity(entities),
    ...telemetry,
    numberedPorts
  };
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
  if (!Number.isNaN(num)) return unit ? `${num.toFixed(2)} ${unit}` : String(num.toFixed(2));
  return val;
}
function getPoeStatus(hass, port) {
  const sw = stateValue(hass, port.poe_switch_entity);
  const pwr = stateValue(hass, port.poe_power_entity);
  const powerNum = pwr != null ? parseFloat(String(pwr).replace(",", ".")) : NaN;
  const hasPowerDraw = !Number.isNaN(powerNum) && powerNum > 0;
  return {
    active: sw === "on" || sw === "true" || hasPowerDraw,
    power: pwr ?? null
  };
}
function isPortConnected(hass, port) {
  if (port.link_entity) {
    const s = lower(stateValue(hass, port.link_entity));
    if (["on", "true", "connected", "up", "active"].includes(s)) return true;
    if (["off", "false", "disconnected", "down", "inactive"].includes(s)) return false;
  }
  const speed = stateValue(hass, port.speed_entity);
  if (speed && speed !== "unavailable" && speed !== "unknown") {
    const n = parseFloat(String(speed).replace(",", "."));
    if (!Number.isNaN(n) && n > 10) return true;
    if (!Number.isNaN(n) && n <= 10) return false;
  }
  const rx = stateValue(hass, port.rx_entity);
  const tx = stateValue(hass, port.tx_entity);
  const rxNum = rx != null ? parseFloat(String(rx).replace(",", ".")) : NaN;
  const txNum = tx != null ? parseFloat(String(tx).replace(",", ".")) : NaN;
  if (!Number.isNaN(rxNum) && rxNum > 0 || !Number.isNaN(txNum) && txNum > 0) {
    return true;
  }
  return false;
}
function getPortLinkText(hass, port) {
  return isPortConnected(hass, port) ? "connected" : "no_link";
}
function getPortSpeedText(hass, port) {
  const s = stateValue(hass, port.speed_entity);
  if (!s || s === "unavailable" || s === "unknown") return null;
  return s;
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
    cpu_utilization: "CPU utilization",
    cpu_temperature: "CPU temperature",
    memory_utilization: "Memory utilization",
    // Port detail
    link_status: "Link Status",
    ap_status: "AP Status",
    link_lan: "Link LAN",
    link_mesh: "Link Mesh",
    uptime: "Uptime",
    clients: "Clients",
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
    reboot: "Reboot",
    led_on: "LED On",
    led_off: "LED Off",
    // Hints
    speed_disabled: "Speed entity disabled \u2014 enable it in HA to show link speed.",
    // Editor
    editor_device_title: "Device",
    editor_device_label: "UniFi Device",
    editor_device_loading: "Loading devices from Home Assistant\u2026",
    editor_device_select: "Select device\u2026",
    editor_name_toggle_label: "Display name",
    editor_name_toggle_text: "Show display name in the card header",
    editor_name_toggle_hint: "Enabled by default. When disabled, only the model/firmware line is shown.",
    editor_name_label: "Display name text",
    editor_name_hint: "Optional \u2014 updates automatically when switching devices unless you changed it manually",
    editor_no_devices: "No UniFi switches, gateways, or access points found in Home Assistant.",
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
    state_pending: "Pending",
    state_firmware_mismatch: "Firmware mismatch",
    state_upgrading: "Upgrading",
    state_provisioning: "Provisioning",
    state_heartbeat_missed: "Heartbeat missed",
    state_adopting: "Adopting",
    state_deleting: "Deleting",
    state_inform_error: "Inform error",
    state_adoption_failed: "Adoption failed",
    state_isolated: "Isolated",
    // Port label prefix (used in detail panel title)
    port_label: "Port",
    // Background color field (editor)
    editor_bg_label: "Background color (optional)",
    editor_bg_hint: "Default: var(--card-background-color)",
    editor_bg_opacity_label: "Background transparency",
    editor_bg_opacity_hint: "0% = fully transparent, 100% = fully opaque",
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
    type_gateway: "Gateway",
    type_access_point: "Access Point"
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
    ap_status: "AP Status",
    link_lan: "Link LAN",
    link_mesh: "Link Mesh",
    uptime: "Uptime",
    clients: "Clients",
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
    reboot: "Neustart",
    led_on: "LED Ein",
    led_off: "LED Aus",
    // Hints
    speed_disabled: "Speed-Entity deaktiviert \u2014 in HA aktivieren f\xFCr Geschwindigkeitsanzeige.",
    // Editor
    editor_device_title: "Ger\xE4t",
    editor_device_label: "UniFi Ger\xE4t",
    editor_device_loading: "Lade Ger\xE4te aus Home Assistant\u2026",
    editor_device_select: "Ger\xE4t ausw\xE4hlen\u2026",
    editor_name_toggle_label: "Anzeigename",
    editor_name_toggle_text: "Anzeigenamen im Kartenkopf anzeigen",
    editor_name_toggle_hint: "Standardm\xE4\xDFig aktiviert. Wenn deaktiviert, wird nur die Modell-/Firmware-Zeile angezeigt.",
    editor_name_label: "Text f\xFCr den Anzeigenamen",
    editor_name_hint: "Optional \u2014 wird beim Ger\xE4tewechsel automatisch aktualisiert, solange du ihn nicht manuell ge\xE4ndert hast",
    editor_no_devices: "Keine UniFi Switches, Gateways oder Access Points in Home Assistant gefunden.",
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
    state_pending: "Ausstehend",
    state_firmware_mismatch: "Firmware-Konflikt",
    state_upgrading: "Aktualisierung",
    state_provisioning: "Provisionierung",
    state_heartbeat_missed: "Heartbeat verloren",
    state_adopting: "Wird adoptiert",
    state_deleting: "Wird gel\xF6scht",
    state_inform_error: "Inform-Fehler",
    state_adoption_failed: "Adoption fehlgeschlagen",
    state_isolated: "Isoliert",
    // Port label prefix
    port_label: "Port",
    // Background color field (editor)
    editor_bg_label: "Hintergrundfarbe (optional)",
    editor_bg_hint: "Standard: var(--card-background-color)",
    editor_bg_opacity_label: "Hintergrund-Transparenz",
    editor_bg_opacity_hint: "0% = vollst\xE4ndig transparent, 100% = vollst\xE4ndig deckend",
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
    type_gateway: "Gateway",
    type_access_point: "Access Point"
  },
  nl: {
    // Card states
    select_device: "Selecteer een UniFi-apparaat in de kaarteditor.",
    loading: "Apparaatgegevens laden\u2026",
    no_data: "Geen apparaatgegevens beschikbaar.",
    no_ports: "Geen poorten gedetecteerd.",
    // Front panel
    front_panel: "Frontpaneel",
    cpu_utilization: "CPU-gebruik",
    cpu_temperature: "CPU-temperatuur",
    memory_utilization: "Geheugengebruik",
    // Port detail
    link_status: "Linkstatus",
    ap_status: "AP-status",
    link_lan: "Link LAN",
    link_mesh: "Link Mesh",
    uptime: "Uptime",
    clients: "Clients",
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
    reboot: "Herstarten",
    led_on: "LED aan",
    led_off: "LED uit",
    // Hints
    speed_disabled: "Snelheidsentiteit uitgeschakeld \u2014 schakel in HA in om linksnelheid te tonen.",
    // Editor
    editor_device_title: "Apparaat",
    editor_device_label: "UniFi-apparaat",
    editor_device_loading: "Apparaten laden uit Home Assistant\u2026",
    editor_device_select: "Apparaat selecteren\u2026",
    editor_name_toggle_label: "Weergavenaam",
    editor_name_toggle_text: "Weergavenaam tonen in de kaartkop",
    editor_name_toggle_hint: "Standaard ingeschakeld. Indien uitgeschakeld, wordt alleen de model-/firmwareregel getoond.",
    editor_name_label: "Tekst voor de weergavenaam",
    editor_name_hint: "Optioneel \u2014 wordt automatisch bijgewerkt bij het wisselen van apparaat zolang je hem niet handmatig hebt aangepast",
    editor_no_devices: "Geen UniFi-switches, -gateways of access points gevonden in Home Assistant.",
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
    state_pending: "In behandeling",
    state_firmware_mismatch: "Firmware komt niet overeen",
    state_upgrading: "Bijwerken",
    state_provisioning: "Provisioning",
    state_heartbeat_missed: "Heartbeat gemist",
    state_adopting: "Adopteren",
    state_deleting: "Verwijderen",
    state_inform_error: "Inform-fout",
    state_adoption_failed: "Adoptie mislukt",
    state_isolated: "Ge\xEFsoleerd",
    // Port label prefix
    port_label: "Poort",
    // Background color field (editor)
    editor_bg_label: "Achtergrondkleur (optioneel)",
    editor_bg_hint: "Standaard: var(--card-background-color)",
    editor_bg_opacity_label: "Achtergrondtransparantie",
    editor_bg_opacity_hint: "0% = volledig transparant, 100% = volledig ondoorzichtig",
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
    type_gateway: "Gateway",
    type_access_point: "Access Point"
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
    ap_status: "Statut AP",
    link_lan: "Lien LAN",
    link_mesh: "Lien Mesh",
    uptime: "Disponibilit\xE9",
    clients: "Clients",
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
    reboot: "Red\xE9marrer",
    led_on: "LED activ\xE9e",
    led_off: "LED d\xE9sactiv\xE9e",
    // Hints
    speed_disabled: "Entit\xE9 de vitesse d\xE9sactiv\xE9e \u2014 activez-la dans HA pour afficher la vitesse.",
    // Editor
    editor_device_title: "Appareil",
    editor_device_label: "Appareil UniFi",
    editor_device_loading: "Chargement des appareils\u2026",
    editor_device_select: "S\xE9lectionner un appareil\u2026",
    editor_name_label: "Nom d'affichage",
    editor_name_hint: "Optionnel \u2014 par d\xE9faut le nom de l'appareil",
    editor_no_devices: "Aucun switch, gateway ou point d\u2019acc\xE8s UniFi trouv\xE9 dans Home Assistant.",
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
    state_pending: "En attente",
    state_firmware_mismatch: "Incompatibilit\xE9 firmware",
    state_upgrading: "Mise \xE0 niveau",
    state_provisioning: "Provisionnement",
    state_heartbeat_missed: "Heartbeat manqu\xE9",
    state_adopting: "Adoption en cours",
    state_deleting: "Suppression en cours",
    state_inform_error: "Erreur inform",
    state_adoption_failed: "\xC9chec de l\u2019adoption",
    state_isolated: "Isol\xE9",
    // Port label prefix
    port_label: "Port",
    // Background color field (editor)
    editor_bg_label: "Couleur de fond (optionnel)",
    editor_bg_hint: "D\xE9faut : var(--card-background-color)",
    editor_bg_opacity_label: "Transparence de fond",
    editor_bg_opacity_hint: "0 % = enti\xE8rement transparent, 100 % = enti\xE8rement opaque",
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
    type_gateway: "Passerelle",
    type_access_point: "Point d\u2019acc\xE8s"
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
function clampOpacity(value) {
  const num = Number.parseInt(value, 10);
  if (!Number.isFinite(num)) return 100;
  return Math.min(100, Math.max(0, num));
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
      const devices = await getUnifiDevices(this._hass);
      if (token !== this._loadToken) return;
      this._devices = devices;
      this._loaded = true;
    } catch (err) {
      console.error("[unifi-device-card] failed to load devices", err);
      if (token !== this._loadToken) return;
      this._devices = this._devices || [];
      this._error = this._t("editor_error");
    }
    this._loading = false;
    this._render();
  }
  async _loadEntityHint(deviceId) {
    if (!this._hass || !deviceId) return;
    this._entityHintLoading = true;
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
    }
    this._entityHintLoading = false;
    this._patchWarning();
  }
  async _loadDeviceCtx(deviceId) {
    if (!this._hass || !deviceId) return;
    this._deviceCtxLoading = true;
    this._lastCtxDeviceId = deviceId;
    this._patchFields();
    const token = ++this._deviceCtxToken;
    try {
      const result = await getDeviceContext(this._hass, deviceId);
      if (token !== this._deviceCtxToken) return;
      if (result) {
        this._deviceCtx = result;
      }
    } catch (err) {
      console.error("[unifi-device-card] failed to load device context for editor", err);
      if (token !== this._deviceCtxToken) return;
    }
    this._deviceCtxLoading = false;
    this._patchFields();
  }
  _emitConfig(partial) {
    const next = { ...this._config, ...partial };
    if (!next.name) delete next.name;
    if (!next.background_color) delete next.background_color;
    next.background_opacity = clampOpacity(next.background_opacity);
    if (next.background_opacity === 100) delete next.background_opacity;
    if (!next.wan_port || next.wan_port === "auto") delete next.wan_port;
    if (!next.wan2_port || next.wan2_port === "auto") delete next.wan2_port;
    if (next.wan2_port === "none") next.wan2_port = "none";
    if (next.show_name !== false) delete next.show_name;
    this.dispatchEvent(new CustomEvent("config-changed", {
      detail: { config: next },
      bubbles: true,
      composed: true
    }));
  }
  _onDeviceChange(ev) {
    const deviceId = ev.target.value || "";
    const nextDevice = this._devices.find((d) => d.id === deviceId) || null;
    const prevDevice = this._devices.find((d) => d.id === this._config?.device_id) || null;
    const currentName = this._config?.name || "";
    const currentMatchesPrevious = !currentName || currentName === (prevDevice?.name || "");
    const nextConfig = {
      device_id: deviceId || void 0,
      wan_port: void 0,
      wan2_port: void 0
    };
    if (!deviceId) {
      nextConfig.name = void 0;
    } else if (currentMatchesPrevious) {
      nextConfig.name = nextDevice?.name || void 0;
    }
    this._emitConfig(nextConfig);
  }
  _onNameInput(ev) {
    this._emitConfig({ name: ev.target.value || void 0 });
  }
  _onShowNameChange(ev) {
    const checked = !!ev.target.checked;
    this._emitConfig({ show_name: checked ? void 0 : false });
  }
  _onBackgroundInput(ev) {
    this._emitConfig({ background_color: ev.target.value || void 0 });
  }
  _onBackgroundOpacityInput(ev) {
    this._emitConfig({ background_opacity: clampOpacity(ev.target.value) });
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
    if (!hint) return [];
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
      count: (hint.disabled?.[key]?.length || 0) + (hint.hidden?.[key]?.length || 0)
    })).filter((item) => item.count > 0);
  }
  _warningHTML() {
    if (this._entityHintLoading && !this._entityHint) {
      return `<div class="warn loading">${this._t("warning_checking")}</div>`;
    }
    if (!this._entityHint) return "";
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
    const deviceId = this._config?.device_id || "";
    const selectedDevice = this._devices.find((d) => d.id === deviceId) || null;
    const isGateway = this._deviceCtx?.type === "gateway" || selectedDevice?.type === "gateway";
    if (!isGateway) return "";
    const layout = this._deviceCtx?.layout;
    if (!layout) {
      return `
        <div class="field">
          <label>${this._t("editor_wan_port_label")}</label>
          <select id="wan_port" disabled>
            <option value="auto">${this._t("editor_device_loading")}</option>
          </select>
          <div class="hint">${this._t("editor_wan_port_hint")}</div>
        </div>

        <div class="field">
          <label>${this._t("editor_wan2_port_label")}</label>
          <select id="wan2_port" disabled>
            <option value="auto">${this._t("editor_device_loading")}</option>
          </select>
          <div class="hint">${this._t("editor_wan2_port_hint")}</div>
        </div>
      `;
    }
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
      input[type="text"] {
        box-sizing: border-box;
        width: 100%;
        padding: 10px 12px;
        border-radius: 10px;
        border: 1px solid var(--divider-color);
        background: var(--card-background-color);
        color: var(--primary-text-color);
        font: inherit;
      }

      .checkbox-row {
        display: flex;
        align-items: center;
        gap: 10px;
        font-weight: 500;
      }

      .checkbox-row input[type="checkbox"] {
        width: 18px;
        height: 18px;
        margin: 0;
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
    const showName = this._config?.show_name !== false;
    const backgroundValue = this._config?.background_color || "";
    const backgroundOpacity = clampOpacity(this._config?.background_opacity);
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
          <label>${this._t("editor_name_toggle_label")}</label>
          <label class="checkbox-row">
            <input id="show_name" type="checkbox" ${showName ? "checked" : ""}>
            <span>${this._t("editor_name_toggle_text")}</span>
          </label>
          <div class="hint">${this._t("editor_name_toggle_hint")}</div>
        </div>

        <div class="field">
          <label>${this._t("editor_name_label")}</label>
          <input id="name" type="text" value="${nameValue}" ${showName ? "" : "disabled"}>
          <div class="hint">${this._t("editor_name_hint")}</div>
        </div>

        ${this._gatewayControlsHTML()}

        <div class="field">
          <label>${this._t("editor_bg_label")}</label>
          <input id="background_color" type="text" value="${backgroundValue}">
          <div class="hint">${this._t("editor_bg_hint")}</div>
        </div>

        <div class="field">
          <label>${this._t("editor_bg_opacity_label")}: ${backgroundOpacity}%</label>
          <input
            id="background_opacity"
            type="range"
            min="0"
            max="100"
            step="1"
            value="${backgroundOpacity}"
          >
          <div class="hint">${this._t("editor_bg_opacity_hint")}</div>
        </div>

        <div id="warning_slot">${this._warningHTML()}</div>
      </div>
    `;
    this.shadowRoot.getElementById("device_id")?.addEventListener("change", (ev) => this._onDeviceChange(ev));
    this.shadowRoot.getElementById("show_name")?.addEventListener("change", (ev) => this._onShowNameChange(ev));
    this.shadowRoot.getElementById("name")?.addEventListener("input", (ev) => this._onNameInput(ev));
    this.shadowRoot.getElementById("background_color")?.addEventListener("input", (ev) => this._onBackgroundInput(ev));
    this.shadowRoot.getElementById("background_opacity")?.addEventListener("input", (ev) => this._onBackgroundOpacityInput(ev));
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
    this._render();
  }
};
customElements.define("unifi-device-card-editor", UnifiDeviceCardEditor);

// src/unifi-device-card.js
var VERSION = "0.0.0-dev.9ac7e37";
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
    const color = this._config?.background_color || "var(--card-background-color)";
    const opacityRaw = Number.parseInt(this._config?.background_opacity, 10);
    const opacity = Number.isFinite(opacityRaw) ? Math.min(100, Math.max(0, opacityRaw)) : 100;
    if (opacity >= 100) return color;
    return `color-mix(in srgb, ${color} ${opacity}%, transparent)`;
  }
  _cardChromeBgStyle() {
    if (this._ctx?.type === "switch" || this._ctx?.type === "gateway") {
      return this._cardBgStyle();
    }
    return this._cardBgStyle();
  }
  _wholeNumberState(entityId) {
    if (!entityId || !this._hass) return "\u2014";
    const obj = stateObj(this._hass, entityId);
    if (!obj) return "\u2014";
    const raw = Number.parseFloat(String(obj.state ?? "").replace(",", "."));
    if (!Number.isFinite(raw)) return formatState(this._hass, entityId);
    const unit = obj.attributes?.unit_of_measurement;
    const intValue = Math.round(raw);
    return unit ? `${intValue} ${unit}` : String(intValue);
  }
  _humanizeDurationSeconds(totalSeconds) {
    const seconds = Math.max(0, Math.round(totalSeconds));
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor(seconds % 86400 / 3600);
    const minutes = Math.floor(seconds % 3600 / 60);
    const parts = [];
    if (days) parts.push(`${days}d`);
    if (hours || days) parts.push(`${hours}h`);
    parts.push(`${minutes}m`);
    return parts.join(" ");
  }
  _apStatusRaw(entityId) {
    if (!entityId || !this._hass) return "\u2014";
    const obj = stateObj(this._hass, entityId);
    if (!obj?.state) return "\u2014";
    return String(obj.state);
  }
  _apStatusState(entityId) {
    const raw = this._apStatusRaw(entityId);
    return raw === "\u2014" ? raw : this._translateState(raw);
  }
  _apUptimeState(entityId) {
    if (!entityId || !this._hass) return "\u2014";
    const obj = stateObj(this._hass, entityId);
    if (!obj) return "\u2014";
    const rawState = String(obj.state ?? "").trim();
    const deviceClass = String(obj.attributes?.device_class || "").toLowerCase().trim();
    if (deviceClass === "timestamp") {
      const parsed = new Date(rawState);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed.toLocaleString(this._hass?.locale?.language || void 0, {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit"
        });
      }
    }
    const raw = Number.parseFloat(String(obj.state ?? "").replace(",", "."));
    if (!Number.isFinite(raw)) return formatState(this._hass, entityId);
    const unit = String(obj.attributes?.unit_of_measurement || "").toLowerCase().trim();
    if (["s", "sec", "second", "seconds"].includes(unit)) {
      return this._humanizeDurationSeconds(raw);
    }
    if (["min", "mins", "minute", "minutes"].includes(unit)) {
      return this._humanizeDurationSeconds(raw * 60);
    }
    if (["h", "hr", "hour", "hours"].includes(unit)) {
      return this._humanizeDurationSeconds(raw * 3600);
    }
    return formatState(this._hass, entityId);
  }
  _apLedColorValue() {
    const colorEntity = this._ctx?.led_color_entity;
    const colorStateObj = colorEntity ? stateObj(this._hass, colorEntity) : null;
    const raw = String(colorStateObj?.state || "").trim();
    if (raw && raw !== "unknown" && raw !== "unavailable") {
      if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(raw)) return raw;
      if (/^rgb\(/i.test(raw)) return raw;
    }
    const ledObj = this._ctx?.led_switch_entity ? stateObj(this._hass, this._ctx.led_switch_entity) : null;
    const rgbAttr = ledObj?.attributes?.rgb_color || colorStateObj?.attributes?.rgb_color;
    if (Array.isArray(rgbAttr) && rgbAttr.length === 3) {
      const [r, g, b] = rgbAttr.map((n) => Math.max(0, Math.min(255, Number(n) || 0)));
      return `rgb(${r}, ${g}, ${b})`;
    }
    const named = raw.toLowerCase();
    const map = {
      blue: "#0000ff",
      white: "#ffffff",
      red: "#ff3b30",
      green: "#33d35d",
      orange: "#efb21a",
      amber: "#efb21a",
      yellow: "#efb21a",
      warm_white: "#f5deb3",
      cool_white: "#dbeafe",
      purple: "#8b5cf6",
      pink: "#ec4899"
    };
    return map[named] || null;
  }
  _apLedState() {
    const ledEntity = this._ctx?.led_switch_entity;
    const ledEnabled = ledEntity ? isOn(this._hass, ledEntity) : this._isDeviceOnline();
    const ringColor = ledEnabled ? this._apLedColorValue() || "#0000ff" : "#868b93";
    return { ledEntity, ledEnabled, ringColor };
  }
  _buildSlotData(ctx) {
    const discovered = Array.isArray(ctx?.numberedPorts) ? ctx.numberedPorts : [];
    const numberedRaw = mergePortsWithLayout(ctx?.layout, discovered);
    const specialsRaw = mergeSpecialsWithLayout(
      ctx?.layout,
      ctx?.type === "gateway" ? discoverSpecialPorts(ctx?.entities || []) : [],
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
    return { specials: specialsRaw, numbered: numberedRaw };
  }
  _buildEffectiveRows(ctx, numbered) {
    const baseRows = (ctx?.layout?.rows || []).map((row) => [...row]);
    const knownPorts = new Set(baseRows.flat());
    const extraPorts = numbered.map((slot) => slot?.port).filter((port) => Number.isInteger(port) && !knownPorts.has(port)).sort((a, b) => a - b);
    if (!extraPorts.length) return baseRows;
    if (!baseRows.length) return [extraPorts];
    const rows = baseRows.map((row) => [...row]);
    rows[rows.length - 1].push(...extraPorts);
    return rows;
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
  _title() {
    if (this._config?.show_name === false) return "";
    if (this._config?.name) return this._config.name;
    if (this._ctx?.name) return this._ctx.name;
    return "UniFi Device Card";
  }
  _subtitle() {
    if (!this._config?.device_id || !this._ctx) return `Version ${VERSION}`;
    const fw = this._ctx?.firmware;
    const model = this._ctx?.layout?.displayModel || this._ctx?.model || "";
    return fw ? `${model} \xB7 FW ${fw}` : model;
  }
  _headerMetrics() {
    if (!this._ctx || !this._hass) return [];
    const metrics = [
      { key: "cpu_utilization", entity: this._ctx.cpu_utilization_entity },
      { key: "cpu_temperature", entity: this._ctx.cpu_temperature_entity },
      { key: "memory_utilization", entity: this._ctx.memory_utilization_entity }
    ];
    return metrics.filter((item) => item.entity && formatState(this._hass, item.entity) !== "\u2014").map((item) => ({
      label: this._t(item.key),
      value: formatState(this._hass, item.entity)
    }));
  }
  _connectedCount(allSlots) {
    return allSlots.filter((s) => isPortConnected(this._hass, s)).length;
  }
  _isDeviceOnline() {
    const onlineEntity = this._ctx?.online_entity;
    if (!onlineEntity) return false;
    const raw = String(formatState(this._hass, onlineEntity) || "").toLowerCase().trim();
    if (!raw || raw === "\u2014") return false;
    const onlineTokens = ["online", "connected", "verbunden", "available", "bereit", "up", "on", "true", "1"];
    const offlineTokens = ["offline", "disconnected", "getrennt", "not connected", "unavailable", "down", "off", "false", "0"];
    if (offlineTokens.some((token) => raw === token || raw.includes(token))) return false;
    return onlineTokens.some((token) => raw === token || raw.includes(token));
  }
  _speedValueMbit(port) {
    const text = String(getPortSpeedText(this._hass, port) || "");
    const m = text.match(/([0-9]+(?:[.,][0-9]+)?)/);
    if (!m) return null;
    const n = parseFloat(m[1].replace(",", "."));
    return Number.isFinite(n) ? n : null;
  }
  _linkLedClass(port) {
    const connected = isPortConnected(this._hass, port);
    if (!connected) return "off";
    const speed = this._speedValueMbit(port);
    if (speed == null) return "green";
    if (speed >= 1e3) return "green";
    return "orange";
  }
  _poeLedClass(port) {
    const poe = getPoeStatus(this._hass, port);
    return poe.active ? "orange" : "off";
  }
  _isSfpLike(slot) {
    const label = String(slot?.label || "").toLowerCase();
    const key = String(slot?.key || "").toLowerCase();
    return slot?.kind === "special" && (label.includes("sfp") || key.includes("sfp") || key.includes("uplink"));
  }
  _isWanLike(slot) {
    const key = String(slot?.key || "").toLowerCase();
    return key === "wan" || key === "wan2";
  }
  _renderContacts() {
    return `
      <div class="rj45-contacts">
        <span></span><span></span><span></span><span></span>
        <span></span><span></span><span></span><span></span>
      </div>
    `;
  }
  _renderPortButton(slot, selectedKey) {
    const isSpecial = slot.kind === "special";
    const isSfp = this._isSfpLike(slot);
    const isWan = this._isWanLike(slot);
    const linkUp = isPortConnected(this._hass, slot);
    const poeStatus = getPoeStatus(this._hass, slot);
    const poeOn = poeStatus.active;
    const tooltip = [
      slot.port_label || (isSpecial ? slot.label : `${this._t("port_label")} ${slot.label}`),
      this._translateState(getPortLinkText(this._hass, slot)),
      linkUp ? getPortSpeedText(this._hass, slot) : null,
      poeOn ? `${this._t("poe")}${poeStatus.power ? ` ${poeStatus.power}` : " ON"}` : null
    ].filter((v) => v && v !== "\u2014").join(" \xB7 ");
    const classes = [
      "port",
      isSpecial ? "special" : "",
      isSfp ? "is-sfp" : "is-rj45",
      isWan ? "is-wan" : "",
      linkUp ? "up" : "down",
      selectedKey === slot.key ? "selected" : ""
    ].filter(Boolean).join(" ");
    const poeLed = this._poeLedClass(slot);
    const linkLed = this._linkLedClass(slot);
    const housing = isSfp ? `
        <div class="port-sfp-wrap">
          <div class="sfp-top-led ${linkLed}"></div>
          <div class="port-sfp">
            <div class="sfp-frame"></div>
            <div class="sfp-rail top"></div>
            <div class="sfp-rail bottom"></div>
            <div class="sfp-slot"></div>
            <div class="sfp-inner"></div>
            <div class="sfp-latch"></div>
          </div>
        </div>
      ` : `
        <div class="port-rj45">
          <div class="rj45-shell-top"></div>
          ${this._renderContacts()}
          <div class="rj45-cavity"></div>
          <div class="rj45-led left ${poeLed}"></div>
          <div class="rj45-led right ${linkLed}"></div>
          <div class="rj45-notch"></div>
          <div class="rj45-floor"></div>
        </div>
      `;
    return `<button class="${classes}" data-key="${slot.key}" title="${tooltip}">
      <div class="port-housing">
        ${housing}
      </div>
      <div class="port-num">${slot.label}</div>
    </button>`;
  }
  _styles() {
    return `<style>
      :host {
        --udc-bg: #141820;
        --udc-surface: #1e2433;
        --udc-surf2: #252d3d;
        --udc-border: rgba(255,255,255,0.07);
        --udc-accent: #0090d9;
        --udc-green: #31d35f;
        --udc-orange: #f0b312;
        --udc-text: #e2e8f0;
        --udc-muted: #6f7d90;
        --udc-dim: #9aa7b9;
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

      ha-card.ap-card {
        background: var(--udc-card-bg, var(--card-background-color)) !important;
      }

      .header {
        padding: 16px 18px 13px;
        background: var(--udc-chrome-bg, linear-gradient(160deg, var(--udc-surface) 0%, var(--udc-bg) 100%));
        border-bottom: 1px solid var(--udc-border);
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 10px;
      }

      .header-info {
        display: grid;
        gap: 2px;
        min-width: 0;
        flex: 1 1 auto;
      }

      .header-actions {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-shrink: 0;
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

      .meta-list {
        display: grid;
        gap: 2px;
        margin-top: 4px;
      }

      .meta-row {
        display: flex;
        gap: 6px;
        align-items: baseline;
        font-size: 0.73rem;
        min-width: 0;
      }

      .meta-label {
        color: var(--primary-text-color, var(--udc-text));
        white-space: nowrap;
        font-weight: 500;
      }

      .meta-value {
        color: var(--primary-text-color, var(--udc-text));
        font-weight: 600;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .chip {
        display: flex;
        align-items: center;
        gap: 4px;
        background: var(--udc-surf2);
        border: 1px solid var(--udc-border);
        border-radius: 20px;
        padding: 2px 8px;
        font-size: 0.68rem;
        font-weight: 600;
        white-space: nowrap;
        color: var(--udc-dim);
        flex-shrink: 0;
      }

      button.chip {
        cursor: pointer;
        font: inherit;
      }

      button.chip:hover {
        filter: brightness(1.08);
      }

      .chip .dot {
        width: 5px;
        height: 5px;
        border-radius: 50%;
        background: var(--udc-green);
        box-shadow: 0 0 5px var(--udc-green);
        animation: blink 2.5s ease-in-out infinite;
      }

      .chip .led-indicator {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: var(--led-indicator, #868b93);
        box-shadow: 0 0 6px color-mix(in srgb, var(--led-indicator, #868b93) 70%, transparent);
      }

      @keyframes blink {
        0%, 100% { opacity: 1; }
        50% { opacity: .4; }
      }

      .frontpanel {
        padding: 12px 14px 10px;
        display: grid;
        gap: 3px;
        border-bottom: 1px solid var(--udc-border);
      }

      .frontpanel.theme-white { background: #d6d6d9; }
      .frontpanel.theme-silver { background: #c4c5c8; }
      .frontpanel.theme-dark { background: #d0d1d4; }

      .panel-label {
        font-size: 0.63rem;
        font-weight: 700;
        letter-spacing: .1em;
        text-transform: uppercase;
        margin-bottom: 2px;
        color: #7c818b;
      }

      .special-row {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
        margin-bottom: 3px;
      }

      .port-row {
        display: grid;
        row-gap: 4px;
        column-gap: 6px;
      }

      .frontpanel.single-row .port-row,
      .frontpanel.gateway-single-row .port-row {
        grid-template-columns: repeat(8, 36px);
      }

      .frontpanel.dual-row .port-row {
        grid-template-columns: repeat(8, 36px);
      }

      .frontpanel.gateway-rack .port-row {
        grid-template-columns: repeat(8, 36px);
      }

      .frontpanel.gateway-compact .port-row {
        grid-template-columns: repeat(5, 36px);
      }

      .frontpanel.six-grid .port-row {
        grid-template-columns: repeat(6, 36px);
      }

      .frontpanel.quad-row .port-row {
        grid-template-columns: repeat(12, 36px);
      }

      .frontpanel.ultra-row .port-row {
        grid-template-columns: repeat(7, 36px);
      }

      .frontpanel.ap-disc {
        background: var(--udc-chrome-bg, linear-gradient(160deg, var(--udc-surface) 0%, var(--udc-bg) 100%));
        display: grid;
        place-items: center;
        min-height: 305px;
        border-bottom: 1px solid var(--udc-border);
        position: relative;
        overflow: hidden;
      }

      .ap-device {
        width: 225px;
        height: 225px;
        border-radius: 50%;
        background: radial-gradient(circle at 30% 28%, #e9edf4 0%, #cfd5df 52%, #b6becb 100%);
        box-shadow:
          inset -8px -10px 16px rgba(0,0,0,.08),
          inset 9px 12px 17px rgba(255,255,255,.7),
          0 12px 22px rgba(0,0,0,.18);
        display: grid;
        place-items: center;
      }

      .ap-ring {
        width: 92px;
        height: 92px;
        border-radius: 50%;
        border: 4px solid var(--ap-ring-color, #a5adb8);
        box-shadow: 0 0 11px rgba(165,173,184,.35);
        display: grid;
        place-items: center;
        transition: border-color .18s ease, box-shadow .18s ease;
      }

      .ap-ring.online {
        border-color: var(--ap-ring-color, rgb(0, 0, 255));
        box-shadow:
          0 0 12px color-mix(in srgb, var(--ap-ring-color, rgb(0, 0, 255)) 55%, transparent),
          0 0 24px color-mix(in srgb, var(--ap-ring-color, rgb(0, 0, 255)) 32%, transparent);
      }

      .ap-ring.off {
        border-color: #868b93;
        box-shadow: inset 0 -1px 0 rgba(0,0,0,.2);
      }

      .ap-logo {
        color: rgba(82, 89, 102, .55);
        font-size: 42px;
        font-weight: 700;
        font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
        line-height: 1;
        transform: translateY(-1px);
        user-select: none;
      }

      .port {
        cursor: pointer;
        font: inherit;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 0 0 1px;
        border-radius: 2px;
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
      }

      .port:hover {
        outline: 1px solid rgba(0,144,217,.5);
        outline-offset: 1px;
      }

      .port-housing {
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: flex-start;
      }

      .port-rj45 {
        position: relative;
        width: 34px;
        height: 34px;
        background: linear-gradient(180deg, #2e3137 0%, #0b0c0e 100%);
        border: 1px solid #666a72;
        border-radius: 1px 1px 2px 2px;
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,.05),
          inset 0 -1px 0 rgba(0,0,0,.45);
        overflow: hidden;
      }

      .port.is-wan .port-rj45 {
        width: 36px;
        height: 36px;
      }

      .rj45-shell-top {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 2px;
        background: linear-gradient(180deg, rgba(255,255,255,.06) 0%, rgba(255,255,255,0) 100%);
        pointer-events: none;
      }

      .rj45-contacts {
        position: absolute;
        top: 4px;
        left: 4px;
        right: 4px;
        height: 3px;
        display: grid;
        grid-template-columns: repeat(8, 1fr);
        gap: 1px;
        z-index: 2;
      }

      .rj45-contacts span {
        display: block;
        background: #caa252;
        min-width: 0;
      }

      .rj45-cavity {
        position: absolute;
        top: 8px;
        left: 3px;
        right: 3px;
        bottom: 2px;
        background: linear-gradient(180deg, #14181d 0%, #060708 100%);
        z-index: 1;
      }

      .rj45-led {
        position: absolute;
        bottom: 1px;
        height: 5px;
        border-radius: 0;
        background: #868b93;
        box-shadow: inset 0 -1px 0 rgba(0,0,0,.2);
        z-index: 5;
      }

      .rj45-led.left {
        left: 0;
        right: 50%;
        margin-right: 3px;
      }

      .rj45-led.right {
        right: 0;
        left: 50%;
        margin-left: 3px;
      }

      .rj45-led.orange {
        background: #efb21a;
        box-shadow:
          0 0 4px rgba(239,178,26,.75),
          inset 0 -1px 0 rgba(0,0,0,.18);
      }

      .rj45-led.green {
        background: #33d35d;
        box-shadow:
          0 0 4px rgba(51,211,93,.75),
          inset 0 -1px 0 rgba(0,0,0,.18);
      }

      .rj45-led.off {
        background: #868b93;
        box-shadow: inset 0 -1px 0 rgba(0,0,0,.2);
      }

      .rj45-notch {
        position: absolute;
        left: 35%;
        right: 35%;
        bottom: 0;
        height: 6px;
        background: #d0d1d4;
        border-radius: 1px 1px 0 0;
        z-index: 6;
      }

      .rj45-floor {
        position: absolute;
        left: 3px;
        right: 3px;
        bottom: 0;
        height: 2px;
        background: #0e1014;
        z-index: 2;
      }

      .port-sfp-wrap {
        width: 100%;
        display: grid;
        justify-items: center;
        gap: 1px;
      }

      .sfp-top-led {
        width: 16px;
        height: 5px;
        border-radius: 0;
        background: #8a8e95;
        box-shadow: inset 0 -1px 0 rgba(0,0,0,.25);
      }

      .sfp-top-led.orange {
        background: #efb21a;
        box-shadow:
          0 0 4px rgba(239,178,26,.75),
          inset 0 -1px 0 rgba(0,0,0,.18);
      }

      .sfp-top-led.green {
        background: #33d35d;
        box-shadow:
          0 0 4px rgba(51,211,93,.75),
          inset 0 -1px 0 rgba(0,0,0,.18);
      }

      .sfp-top-led.off {
        background: #868b93;
        box-shadow: inset 0 -1px 0 rgba(0,0,0,.2);
      }

      .port-sfp {
        position: relative;
        width: 34px;
        height: 36px;
      }

      .port.is-wan .port-sfp {
        width: 36px;
        height: 38px;
      }

      .sfp-frame {
        position: absolute;
        inset: 0;
        background: linear-gradient(180deg, #7d828a 0%, #62676f 100%);
        border: 1px solid #6d7279;
        border-radius: 1px;
      }

      .sfp-rail {
        position: absolute;
        left: 3px;
        right: 3px;
        height: 1px;
        background: rgba(230,235,240,.28);
        z-index: 3;
      }

      .sfp-rail.top {
        top: 5px;
      }

      .sfp-rail.bottom {
        bottom: 5px;
      }

      .sfp-slot {
        position: absolute;
        left: 3px;
        right: 3px;
        top: 5px;
        bottom: 5px;
        background: linear-gradient(180deg, #171b22 0%, #060709 100%);
        border: 1px solid rgba(220,225,230,.10);
        z-index: 1;
      }

      .sfp-inner {
        position: absolute;
        left: 6px;
        right: 6px;
        top: 9px;
        bottom: 9px;
        background: rgba(130,140,155,.16);
        z-index: 2;
      }

      .sfp-latch {
        position: absolute;
        left: 10px;
        right: 10px;
        bottom: 2px;
        height: 4px;
        background: rgba(210,214,220,.48);
        z-index: 4;
      }

      .port.special {
        min-width: 36px;
        max-width: 40px;
      }

      .port-num {
        font-size: 7px;
        font-weight: 800;
        line-height: 1;
        margin-top: 1px;
        letter-spacing: 0;
        user-select: none;
        color: #646a76;
      }

      .port.up .port-num {
        color: #414957;
      }

      .port.is-sfp .port-num {
        font-size: 6px;
      }

      .section {
        padding: 12px 14px 14px;
        background: var(--udc-chrome-bg, transparent);
      }

      .detail-title {
        font-size: 0.8rem;
        font-weight: 700;
        margin-bottom: 8px;
        color: var(--primary-text-color, var(--udc-text));
      }

      .detail-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 6px 10px;
        margin-bottom: 10px;
      }

      .detail-item {
        display: grid;
        gap: 2px;
      }

      .detail-label {
        font-size: 0.67rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: .06em;
        color: var(--secondary-text-color, var(--udc-muted));
      }

      .detail-value {
        font-size: 0.85rem;
        font-weight: 600;
        color: var(--primary-text-color, var(--udc-text));
      }

      .detail-value.online { color: var(--udc-green); }
      .detail-value.offline { color: var(--udc-muted); }
      .detail-value.pending { color: #efb21a; }

      .actions {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        margin-top: 8px;
      }

      .action-btn {
        font: inherit;
        font-size: 0.8rem;
        font-weight: 600;
        padding: 6px 14px;
        border-radius: var(--udc-rsm);
        border: none;
        cursor: pointer;
        transition: opacity .15s, filter .15s;
      }

      .action-btn:hover { opacity: .85; }
      .action-btn:active { filter: brightness(.9); }

      .action-btn.primary {
        background: #0090d9;
        color: #fff;
      }

      .action-btn.secondary {
        background: var(--udc-surf2);
        border: 1px solid var(--udc-border);
        color: var(--primary-text-color, var(--udc-text));
      }

      .muted {
        color: var(--secondary-text-color, var(--udc-muted));
        font-size: 0.82rem;
      }

      .empty-state,
      .loading-state {
        padding: 24px 18px;
        color: var(--secondary-text-color, var(--udc-muted));
        font-size: 0.85rem;
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .spinner {
        width: 16px;
        height: 16px;
        border: 2px solid var(--udc-border);
        border-top-color: #0090d9;
        border-radius: 50%;
        animation: spin .7s linear infinite;
        flex-shrink: 0;
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    </style>`;
  }
  _renderPanelAndDetail() {
    if (this._ctx?.type === "access_point") {
      const online = this._isDeviceOnline();
      const apStatusRaw = this._apStatusRaw(this._ctx?.ap_status_entity);
      const apStatus = this._apStatusState(this._ctx?.ap_status_entity);
      const apStatusClass = apStatusRaw === "connected" ? "online" : apStatusRaw === "disconnected" ? "offline" : "pending";
      const uptime = this._apUptimeState(this._ctx?.uptime_entity);
      const clients = this._wholeNumberState(this._ctx?.clients_entity);
      const { ledEntity, ledEnabled, ringColor } = this._apLedState();
      const headerTitle2 = this._title();
      const headerMetrics2 = this._headerMetrics();
      this.shadowRoot.innerHTML = `${this._styles()}
        <ha-card class="ap-card" style="--udc-card-bg: ${this._cardBgStyle()}; --udc-chrome-bg: ${this._cardChromeBgStyle()}; --ap-ring-color: ${ringColor}">
          <div class="header">
            <div class="header-info">
              ${headerTitle2 ? `<div class="title">${headerTitle2}</div>` : ""}
              <div class="subtitle">${this._subtitle()}</div>
              ${headerMetrics2.length ? `<div class="meta-list">${headerMetrics2.map((item) => `
                <div class="meta-row">
                  <div class="meta-label">${item.label}:</div>
                  <div class="meta-value">${item.value}</div>
                </div>`).join("")}</div>` : ""}
            </div>
            <div class="header-actions">
              ${this._ctx?.reboot_entity ? `<button class="chip" data-action="reboot-device">\u21BB ${this._t("reboot")}</button>` : ""}
              ${ledEntity ? `<button class="chip" data-action="toggle-led" style="--led-indicator: ${ledEnabled ? ringColor : "#868b93"}"><span class="led-indicator"></span>LED</button>` : ""}
            </div>
          </div>

          <div class="frontpanel ap-disc">
            <div class="ap-device">
              <div class="ap-ring ${ledEnabled ? "online" : "off"}">
                <div class="ap-logo">u</div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="detail-title">${this._t("ap_status")}</div>
            <div class="detail-grid">
              <div class="detail-item">
                <div class="detail-label">${this._t("ap_status")}</div>
                <div class="detail-value ${apStatusClass}">${apStatus || (online ? this._t("state_connected") : this._t("state_disconnected"))}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">${this._t("uptime")}</div>
                <div class="detail-value">${uptime}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">${this._t("clients")}</div>
                <div class="detail-value">${clients}</div>
              </div>
            </div>
          </div>
        </ha-card>`;
      this.shadowRoot.querySelector("[data-action='reboot-device']")?.addEventListener("click", () => this._pressButton(this._ctx?.reboot_entity));
      this.shadowRoot.querySelector("[data-action='toggle-led']")?.addEventListener("click", () => this._toggleEntity(ledEntity));
      return;
    }
    const ctx = this._ctx;
    const { specials, numbered } = this._buildSlotData(ctx);
    const allSlots = [...specials, ...numbered];
    const selected = allSlots.find((p) => p.key === this._selectedKey) || allSlots[0] || null;
    const connected = this._connectedCount(allSlots);
    const theme = ctx?.layout?.theme || "dark";
    const specialPortsInUse = new Set(
      specials.map((slot) => slot?.port).filter((port) => Number.isInteger(port))
    );
    const visibleNumbered = numbered.filter((slot) => !specialPortsInUse.has(slot.port));
    const effectiveRows = this._buildEffectiveRows(ctx, visibleNumbered);
    const specialRow = specials.length ? `<div class="special-row">${specials.map((s) => this._renderPortButton(s, selected?.key)).join("")}</div>` : "";
    const layoutRows = effectiveRows.map((rowPorts) => {
      const items = rowPorts.map((portNumber) => visibleNumbered.find((p) => p.port === portNumber)).filter(Boolean).map((slot) => this._renderPortButton(slot, selected?.key)).join("");
      return items ? `<div class="port-row">${items}</div>` : "";
    }).filter(Boolean);
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
    const headerTitle = this._title();
    const headerMetrics = this._headerMetrics();
    this.shadowRoot.innerHTML = `${this._styles()}
      <ha-card style="--udc-card-bg: ${this._cardBgStyle()}; --udc-chrome-bg: ${this._cardChromeBgStyle()}">
        <div class="header">
          <div class="header-info">
            ${headerTitle ? `<div class="title">${headerTitle}</div>` : ""}
            <div class="subtitle">${this._subtitle()}</div>
            ${headerMetrics.length ? `<div class="meta-list">${headerMetrics.map((item) => `
              <div class="meta-row">
                <div class="meta-label">${item.label}:</div>
                <div class="meta-value">${item.value}</div>
              </div>`).join("")}</div>` : ""}
          </div>
          <div class="header-actions">
            ${ctx?.reboot_entity ? `<button class="chip" data-action="reboot-device">\u21BB ${this._t("reboot")}</button>` : ""}
            <div class="chip"><div class="dot"></div>${connected}/${allSlots.length}</div>
          </div>
        </div>

        <div class="frontpanel ${ctx?.layout?.frontStyle || "single-row"} theme-${theme}">
          <div class="panel-label">${this._t("front_panel")}</div>
          ${specialRow}
          ${layoutRows.join("") || `<div class="muted" style="padding:8px 0">${this._t("no_ports")}</div>`}
        </div>

        <div class="section">${detail}</div>
      </ha-card>`;
    this.shadowRoot.querySelectorAll(".port").forEach((btn) => btn.addEventListener("click", () => this._selectKey(btn.dataset.key)));
    this.shadowRoot.querySelector("[data-action='toggle-port']")?.addEventListener("click", (e) => this._toggleEntity(e.currentTarget.dataset.entity));
    this.shadowRoot.querySelector("[data-action='toggle-poe']")?.addEventListener("click", (e) => this._toggleEntity(e.currentTarget.dataset.entity));
    this.shadowRoot.querySelector("[data-action='power-cycle']")?.addEventListener("click", (e) => this._pressButton(e.currentTarget.dataset.entity));
    this.shadowRoot.querySelector("[data-action='reboot-device']")?.addEventListener("click", () => this._pressButton(ctx?.reboot_entity));
  }
  _render() {
    const title = this._title();
    if (!this._config?.device_id) {
      this.shadowRoot.innerHTML = `${this._styles()}
        <ha-card style="--udc-card-bg: ${this._cardBgStyle()}">
          <div class="header">
            <div class="header-info">
              ${title ? `<div class="title">${title}</div>` : ""}
              <div class="subtitle">${this._subtitle()}</div>
            </div>
          </div>
          <div class="empty-state">${this._t("select_device")}</div>
        </ha-card>`;
      return;
    }
    if (this._loading) {
      this.shadowRoot.innerHTML = `${this._styles()}
        <ha-card style="--udc-card-bg: ${this._cardBgStyle()}">
          <div class="header">
            <div class="header-info">
              ${title ? `<div class="title">${title}</div>` : ""}
              <div class="subtitle">${this._subtitle()}</div>
            </div>
          </div>
          <div class="loading-state"><div class="spinner"></div>${this._t("loading")}</div>
        </ha-card>`;
      return;
    }
    if (!this._ctx) {
      this.shadowRoot.innerHTML = `${this._styles()}
        <ha-card style="--udc-card-bg: ${this._cardBgStyle()}">
          <div class="header">
            <div class="header-info">
              ${title ? `<div class="title">${title}</div>` : ""}
              <div class="subtitle">${this._subtitle()}</div>
            </div>
          </div>
          <div class="empty-state">${this._t("no_data")}</div>
        </ha-card>`;
      return;
    }
    this._renderPanelAndDetail();
  }
};
customElements.define("unifi-device-card", UnifiDeviceCard);
window.customCards = window.customCards || [];
window.customCards.push({
  type: "unifi-device-card",
  name: "UniFi Device Card",
  description: "Lovelace card for UniFi switches and gateways."
});
