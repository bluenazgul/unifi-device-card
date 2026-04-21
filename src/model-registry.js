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

function apModel(displayModel) {
  return {
    kind: "access_point",
    frontStyle: "ap-disc",
    rows: [],
    portCount: 0,
    displayModel,
    theme: "white",
    specialSlots: [],
  };
}

export const AP_MODEL_PREFIXES = ["UAP", "UAC", "U6", "U7", "UAL", "UAPMESH", "E7", "UWB", "UDB", "BZ2"];
export const SWITCH_MODEL_PREFIXES = ["USW", "USL", "USPM", "USXG", "USF", "US8", "USC8", "US16", "US24", "US48", "USMINI", "FLEXMINI", "USM"];
export const GATEWAY_MODEL_PREFIXES = ["UDM", "UCG", "UXG", "UGW", "UDR", "UDR7", "UDRULT", "UDMPRO", "UDMPROSE"];

function modelStartsWith(device, prefixes) {
  const candidates = [device?.model, device?.hw_version]
    .filter(Boolean)
    .map(normalizeModelKey);

  return prefixes.some((pfx) => candidates.some((candidate) => candidate.startsWith(pfx)));
}

function isAccessPointLikeModel(device) {
  const candidates = [device?.model, device?.hw_version]
    .filter(Boolean)
    .map(normalizeModelKey);

  return AP_MODEL_PREFIXES.some((pfx) =>
    candidates.some((candidate) => candidate.startsWith(pfx))
  );
}

function defaultSwitchLayout(portCount) {
  if (portCount <= 8) {
    return { kind: "switch", frontStyle: "single-row", rows: [range(1, portCount)], portCount, specialSlots: [] };
  }
  if (portCount === 16) {
    return { kind: "switch", frontStyle: "dual-row", rows: [range(1, 8), range(9, 16)], portCount, specialSlots: [] };
  }
  if (portCount === 24) {
    return { kind: "switch", frontStyle: "eight-grid", rows: [range(1, 8), range(9, 16), range(17, 24)], portCount, specialSlots: [] };
  }
  if (portCount === 48) {
    return { kind: "switch", frontStyle: "quad-row", rows: [range(1, 12), range(13, 24), range(25, 36), range(37, 48)], portCount, specialSlots: [] };
  }
  return { kind: "switch", frontStyle: "single-row", rows: [range(1, portCount)], portCount, specialSlots: [] };
}

function applyRj45LayoutHints(layout) {
  const numberedRj45Count = (layout?.rows || []).flat().filter((port) => Number.isInteger(port)).length;
  const excludedOddEvenModels = new Set(["USPM16", "USPM16P"]);
  const isExcluded = excludedOddEvenModels.has(layout?.modelKey);
  const isSwitchOrGateway = layout?.kind === "switch" || layout?.kind === "gateway";

  return {
    ...layout,
    rj45_odd_even: isSwitchOrGateway && !isExcluded && numberedRj45Count > 8,
  };
}

export function applyPortsPerRowOverride(layout, portsPerRow) {
  if (!portsPerRow || portsPerRow < 1 || layout.kind !== "switch") return layout;

  const portCount = layout.portCount;
  const newRows = [];
  for (let i = 0; i < portCount; i += portsPerRow) {
    newRows.push(range(i + 1, Math.min(i + portsPerRow, portCount)));
  }

  const frontStyleMap = {
    4: "grid-4",
    6: "six-grid",
    7: "ultra-row",
    8: "eight-grid",
    12: "quad-row",
  };

  return {
    ...layout,
    rows: newRows,
    frontStyle: frontStyleMap[portsPerRow] || `grid-${portsPerRow}`,
  };
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
  // ACCESS POINTS
  // ══════════════════════════════════════════════════════════════════════════
  UAP: { ...apModel("UAP"), apLedDefaultColor: "#33d35d" },
  UAPLR: { ...apModel("UAP-LR"), apLedDefaultColor: "#33d35d" },
  UAPOUTDOOR5: { ...apModel("UAP-Outdoor5"), apLedDefaultColor: "#33d35d" },
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
  U6EXTENDER: apModel("U6 Extender"),
  U7PRO: apModel("U7 Pro"),
  U7PROMAX: apModel("U7 Pro Max"),
  U7PROWALL: apModel("U7 Pro Wall"),
  U7IW: apModel("U7 In-Wall"),
  U7LR: apModel("U7 LR"),
  U7MSH: apModel("U7 Mesh"),
  U7LITE: apModel("U7 Lite"),
  U7OUTDOOR: apModel("U7 Outdoor"),
  U7PROXG: apModel("U7 Pro XG"),
  U7PROXGS: apModel("U7 Pro XGS"),
  U6MESHPRO: apModel("U6 Mesh Pro"),
  E7: apModel("E7"),
  UWBXG: apModel("UWB-XG"),

  // ══════════════════════════════════════════════════════════════════════════
  // SWITCHES — Generation 1 (US-*)
  // ══════════════════════════════════════════════════════════════════════════

  // US 8 12W  — 8× 1G RJ45, PoE-Passthrough 12W (Port 8)
  USC8: {
    kind: "switch", frontStyle: "single-row", rows: [range(1, 8)],
    portCount: 8, displayModel: "USC 8", theme: "silver",
    poePortRange: [],
    specialSlots: [],
  },
  
  // US 8 60W  — 8× 1G RJ45, PoE on ports 5-8
  US8P60: {
    kind: "switch", frontStyle: "single-row", rows: [range(1, 8)],
    portCount: 8, displayModel: "US 8", theme: "silver",
    poePortRange: [5, 8],
    specialSlots: [],
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

  // USW Flex Mini  — Port 1 Uplink/PoE-in, ports 2-5 LAN
  USMINI: {
    kind: "switch", frontStyle: "single-row", rows: [range(2, 5)],
    portCount: 5, displayModel: "USW Flex Mini", theme: "white",
    specialSlots: [{ key: "uplink", label: "Uplink", port: 1 }],
  },

  // USW Flex  — Port 1 Uplink/PoE-in, ports 2-5 LAN PoE-out
  USF5P: {
    kind: "switch", frontStyle: "single-row", rows: [range(2, 5)],
    portCount: 5, displayModel: "USW Flex", theme: "white",
    poePortRange: [2, 5],
    specialSlots: [{ key: "uplink", label: "Uplink", port: 1 }],
  },

  // USW Flex Mini 2.5G 5  — Port 5 Uplink/PoE-in, ports 1-4 LAN
  USWFLEX25G5: {
    kind: "switch", frontStyle: "single-row", rows: [range(1, 4)],
    portCount: 5, displayModel: "USW Flex Mini 2.5G", theme: "white",
    specialSlots: [{ key: "uplink", label: "Uplink", port: 5 }],
  },

  // USW Flex 2.5G 8 PoE  — Port 9 Uplink/PoE-in, ports 1-8 LAN PoE-out, 1× SFP uplink
  USWFLEX25G8POE: {
    kind: "switch", frontStyle: "single-row", rows: [range(1, 8)],
    portCount: 10, displayModel: "USW Flex 2.5G 8 PoE", theme: "white",
    poePortRange: [1, 8],
    specialSlots: [
      { key: "uplink", label: "Uplink", port: 9 },
      { key: "sfp_1", label: "SFP 1", port: 10 },
    ],
  },
  USWFLEX25G8: {
    kind: "switch", frontStyle: "single-row", rows: [range(1, 8)],
    portCount: 10, displayModel: "USW Flex 2.5G 8", theme: "white",
    specialSlots: [
      { key: "uplink", label: "Uplink", port: 9 },
      { key: "sfp_1", label: "SFP 1", port: 10 },
    ],
  },

  // USW Lite 8 PoE  — 8× 1G RJ45, Ports 1-4 PoE+
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

  // USW Lite 16 PoE  — 16× 1G RJ45, Ports 1-8 PoE+
  USL16LP: {
    kind: "switch", frontStyle: "dual-row", rows: [range(1, 8), range(9, 16)],
    portCount: 16, displayModel: "USW Lite 16 PoE", theme: "white",
    poePortRange: [1, 8],
    specialSlots: [],
  },
  USL16LPB: {
    kind: "switch", frontStyle: "dual-row", rows: [range(1, 8), range(9, 16)],
    portCount: 16, displayModel: "USW Lite 16 PoE", theme: "white",
    poePortRange: [1, 8],
    specialSlots: [],
  },

  // USW 16 PoE Gen2  — 16× 1G RJ45, Ports 1-8 PoE+, 2× SFP
  USL16P: {
    kind: "switch", frontStyle: "dual-row", rows: [range(1, 8), range(9, 16)],
    portCount: 18, displayModel: "USW 16 PoE", theme: "silver",
    poePortRange: [1, 8],
    specialSlots: [
      { key: "sfp_1", label: "SFP 1", port: 17 },
      { key: "sfp_2", label: "SFP 2", port: 18 },
    ],
  },

  // USW 24 Gen2  — 24× 1G RJ45, 2× SFP
  USL24: {
    kind: "switch", frontStyle: "eight-grid",
    rows: [range(1, 8), range(9, 16), range(17, 24)],
    portCount: 26, displayModel: "USW 24", theme: "silver",
    specialSlots: [
      { key: "sfp_1", label: "SFP 1", port: 25 },
      { key: "sfp_2", label: "SFP 2", port: 26 },
    ],
  },

  // USW 24 PoE Gen2  — 24× 1G RJ45, Ports 1-16 PoE+, 2× SFP
  USL24P: {
    kind: "switch", frontStyle: "eight-grid",
    rows: [range(1, 8), range(9, 16), range(17, 24)],
    portCount: 26, displayModel: "USW 24 PoE", theme: "silver",
    poePortRange: [1, 16],
    specialSlots: [
      { key: "sfp_1", label: "SFP 1", port: 25 },
      { key: "sfp_2", label: "SFP 2", port: 26 },
    ],
  },

  USW24P: {
    kind: "switch", frontStyle: "eight-grid",
    rows: [range(1, 8), range(9, 16), range(17, 24)],
    portCount: 26, displayModel: "USW 24 PoE", theme: "silver",
    poePortRange: [1, 16],
    specialSlots: [
      { key: "sfp_1", label: "SFP 1", port: 25 },
      { key: "sfp_2", label: "SFP 2", port: 26 },
    ],
  },

  // USW 48 Gen2  — 48× 1G RJ45, 4× SFP
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

  // USW 48 PoE Gen2  — 48× 1G RJ45, Ports 1-32 PoE+, 4× SFP
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
  // SWITCHES — Professional
  // ══════════════════════════════════════════════════════════════════════════

  US24PRO: {
    kind: "switch", frontStyle: "eight-grid",
    rows: [range(1, 8), range(9, 16), range(17, 24)],
    portCount: 26, displayModel: "USW Pro 24 PoE", theme: "silver",
    poePortRange: [1, 16],
    specialSlots: [
      { key: "sfp_1", label: "SFP+ 1", port: 25 },
      { key: "sfp_2", label: "SFP+ 2", port: 26 },
    ],
  },

  US24PRO2: {
    kind: "switch", frontStyle: "eight-grid",
    rows: [range(1, 8), range(9, 16), range(17, 24)],
    portCount: 26, displayModel: "USW Pro 24", theme: "silver",
    specialSlots: [
      { key: "sfp_1", label: "SFP+ 1", port: 25 },
      { key: "sfp_2", label: "SFP+ 2", port: 26 },
    ],
  },

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

  // USW Pro Max 16  — 16× RJ45, 2× SFP+
  USPM16: {
    kind: "switch", frontStyle: "single-row", rows: [range(1, 16)],
    portCount: 18, displayModel: "USW Pro Max 16", theme: "silver",
    specialSlots: [
      { key: "sfp_1", label: "SFP+ 1", port: 17 },
      { key: "sfp_2", label: "SFP+ 2", port: 18 },
    ],
  },

  // USW Pro Max 16 PoE  — 16× RJ45, 2× SFP+
  USPM16P: {
    kind: "switch", frontStyle: "single-row", rows: [range(1, 16)],
    portCount: 18, displayModel: "USW Pro Max 16 PoE", theme: "silver",
    poePortRange: [1, 16],
    specialSlots: [
      { key: "sfp_1", label: "SFP+ 1", port: 17 },
      { key: "sfp_2", label: "SFP+ 2", port: 18 },
    ],
  },

  // USW Pro Max 24 (PoE / non-PoE)  — 24× RJ45, 2× SFP+
  USPM24: {
    kind: "switch", frontStyle: "eight-grid",
    rows: [range(1, 8), range(9, 16), range(17, 24)],
    portCount: 26, displayModel: "USW Pro Max 24", theme: "silver",
    specialSlots: [
      { key: "sfp_1", label: "SFP+ 1", port: 25 },
      { key: "sfp_2", label: "SFP+ 2", port: 26 },
    ],
  },
  USPM24P: {
    kind: "switch", frontStyle: "eight-grid",
    rows: [range(1, 8), range(9, 16), range(17, 24)],
    portCount: 26, displayModel: "USW Pro Max 24 PoE", theme: "silver",
    poePortRange: [1, 24],
    specialSlots: [
      { key: "sfp_1", label: "SFP+ 1", port: 25 },
      { key: "sfp_2", label: "SFP+ 2", port: 26 },
    ],
  },

  // USW Pro Max 48 (PoE / non-PoE)  — 48× RJ45, 4× SFP+
  USPM48: {
    kind: "switch", frontStyle: "quad-row",
    rows: [range(1, 12), range(13, 24), range(25, 36), range(37, 48)],
    portCount: 52, displayModel: "USW Pro Max 48", theme: "silver",
    specialSlots: [
      { key: "sfp_1", label: "SFP+ 1", port: 49 },
      { key: "sfp_2", label: "SFP+ 2", port: 50 },
      { key: "sfp_3", label: "SFP+ 3", port: 51 },
      { key: "sfp_4", label: "SFP+ 4", port: 52 },
    ],
  },
  USPM48P: {
    kind: "switch", frontStyle: "quad-row",
    rows: [range(1, 12), range(13, 24), range(25, 36), range(37, 48)],
    portCount: 52, displayModel: "USW Pro Max 48 PoE", theme: "silver",
    poePortRange: [1, 48],
    specialSlots: [
      { key: "sfp_1", label: "SFP+ 1", port: 49 },
      { key: "sfp_2", label: "SFP+ 2", port: 50 },
      { key: "sfp_3", label: "SFP+ 3", port: 51 },
      { key: "sfp_4", label: "SFP+ 4", port: 52 },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // SWITCHES — Enterprise
  // ══════════════════════════════════════════════════════════════════════════

  US68P: {
    kind: "switch", frontStyle: "single-row", rows: [range(1, 8)],
    portCount: 10, displayModel: "USW Enterprise 8 PoE", theme: "silver",
    poePortRange: [1, 8],
    specialSlots: [
      { key: "sfp_1", label: "SFP+ 1", port: 9  },
      { key: "sfp_2", label: "SFP+ 2", port: 10 },
    ],
  },

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

  // USW Enterprise XG 24  — 24× RJ45, 2× SFP+
  USXG24: {
    kind: "switch", frontStyle: "six-grid",
    rows: [range(1, 6), range(7, 12), range(13, 18), range(19, 24)],
    portCount: 26, displayModel: "USW Enterprise XG 24", theme: "silver",
    specialSlots: [
      { key: "sfp_1", label: "SFP+ 1", port: 25 },
      { key: "sfp_2", label: "SFP+ 2", port: 26 },
    ],
  },

  // USW Industrial  — 8× RJ45, 2× SFP+
  USWINDUSTRIAL: {
    kind: "switch", frontStyle: "single-row", rows: [range(1, 8)],
    portCount: 10, displayModel: "USW Industrial", theme: "silver",
    poePortRange: [1, 8],
    specialSlots: [
      { key: "sfp_1", label: "SFP+ 1", port: 9 },
      { key: "sfp_2", label: "SFP+ 2", port: 10 },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // SWITCHES — Aggregation
  // ══════════════════════════════════════════════════════════════════════════

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
  // SWITCHES — Ultra family
  // ══════════════════════════════════════════════════════════════════════════

  // 8 total RJ45; one is PoE++ input / uplink, seven are LAN PoE out
  USWULTRA: {
    kind: "switch", frontStyle: "single-row", rows: [range(1, 7)],
    portCount: 8, displayModel: "USW Ultra", theme: "white",
    poePortRange: [1, 7],
    specialSlots: [{ key: "uplink", label: "Uplink", port: 8 }],
  },
  USWULTRA60W: {
    kind: "switch", frontStyle: "single-row", rows: [range(1, 7)],
    portCount: 8, displayModel: "USW Ultra 60W", theme: "white",
    poePortRange: [1, 7],
    specialSlots: [{ key: "uplink", label: "Uplink", port: 8 }],
  },
  USWULTRA210W: {
    kind: "switch", frontStyle: "single-row", rows: [range(1, 7)],
    portCount: 8, displayModel: "USW Ultra 210W", theme: "white",
    poePortRange: [1, 7],
    specialSlots: [{ key: "uplink", label: "Uplink", port: 8 }],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // GATEWAYS
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
  UDR7: {
    kind: "gateway", frontStyle: "gateway-single-row", rows: [[1, 2, 3]],
    portCount: 5, displayModel: "UDM67A (UDR7)", theme: "white",
    specialSlots: [
      { key: "wan", label: "WAN", port: 4 },
      { key: "sfp_1", label: "SFP+ WAN", port: 5 },
    ],
  },
  UDM67A: {
    kind: "gateway", frontStyle: "gateway-rack", rows: [range(1, 8)],
    portCount: 11, displayModel: "UDM67A (UDM-Pro / UDMPRO)", theme: "silver",
    specialSlots: [
      { key: "wan",   label: "WAN",    port: 9  },
      { key: "sfp_1", label: "SFP+ 1", port: 10 },
      { key: "sfp_2", label: "SFP+ 2", port: 11 },
    ],
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
      { key: "wan",   label: "WAN",      port: 5 },
      { key: "sfp_1", label: "SFP+ LAN", port: 6 },
      { key: "sfp_2", label: "SFP+ WAN", port: 7 },
    ],
  },
  UDM: {
    kind: "gateway", frontStyle: "gateway-single-row", rows: [[1, 2, 3, 4]],
    portCount: 5, displayModel: "UDM", theme: "white",
    specialSlots: [{ key: "wan", label: "WAN", port: 5 }],
  },
  UDR: {
    kind: "gateway", frontStyle: "gateway-single-row", rows: [[1, 2, 3, 4]],
    portCount: 5, displayModel: "UDR", theme: "white",
    specialSlots: [{ key: "wan", label: "WAN", port: 5 }],
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
      { key: "wan2", label: "WAN2/LAN2", port: 3 },
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

export function validateModelLayoutEntry(key, entry) {
  const issues = [];
  const rows = Array.isArray(entry?.rows) ? entry.rows : [];
  const numberedPorts = rows.flat().filter((p) => Number.isInteger(p));
  const specialPorts = (entry?.specialSlots || []).map((s) => s?.port).filter((p) => Number.isInteger(p));
  const allPorts = [...numberedPorts, ...specialPorts];

  const duplicates = allPorts.filter((p, i) => allPorts.indexOf(p) !== i);
  if (duplicates.length) {
    issues.push(`duplicate port numbers: ${[...new Set(duplicates)].join(", ")}`);
  }

  if (entry?.portCount != null && allPorts.length !== entry.portCount) {
    issues.push(`portCount=${entry.portCount} but rows+specialSlots=${allPorts.length}`);
  }

  if (numberedPorts.some((p) => specialPorts.includes(p))) {
    issues.push("numbered rows overlap with special slots");
  }

  if (numberedPorts.some((p) => p < 1) || specialPorts.some((p) => p < 1)) {
    issues.push("ports must start at 1");
  }

  const maxPort = allPorts.length ? Math.max(...allPorts) : 0;
  if (entry?.portCount != null && maxPort > entry.portCount) {
    issues.push(`highest port ${maxPort} exceeds portCount ${entry.portCount}`);
  }

  if (entry?.poePortRange) {
    const [start, end] = entry.poePortRange;
    if (!Number.isInteger(start) || !Number.isInteger(end) || start > end) {
      issues.push("invalid poePortRange");
    } else {
      for (let p = start; p <= end; p += 1) {
        if (!numberedPorts.includes(p)) {
          issues.push(`poePortRange includes non-numbered/special port ${p}`);
          break;
        }
      }
    }
  }

  return issues;
}

export function validateModelRegistry() {
  return Object.entries(MODEL_REGISTRY).map(([key, entry]) => ({
    key,
    issues: validateModelLayoutEntry(key, entry),
  }));
}

export function resolveModelKey(device) {
  const candidates = [device?.model, device?.hw_version, device?.name, device?.name_by_user]
    .filter(Boolean)
    .map(normalizeModelKey);

  for (const candidate of candidates) {
    if (!candidate) continue;

    if (MODEL_REGISTRY[candidate]) return candidate;

    if (candidate.includes("UDMPROSE"))           return "UDMPROSE";
    if (candidate.includes("UDMSE"))              return "UDMPROSE";
    if (candidate.includes("UDMPRO"))             return "UDMPRO";
    if (candidate === "UAP")                      return "UAP";
    if (candidate.includes("BZ2LR"))              return "UAPLR";
    if (candidate.includes("BZ2LZ"))              return "UAPLR";
    if (candidate.includes("BZ2"))                return "UAP";
    if (candidate.includes("UAPLR"))              return "UAPLR";
    if (candidate.includes("UAPPRO"))             return "UAPPRO";
    if (candidate.includes("UAPACMESH"))          return "UAPACM";
    if (candidate.includes("UAPACMPRO"))          return "UAPACMPRO";
    if (candidate.includes("UAPACM"))             return "UAPACM";
    if (candidate.includes("UAPACLR"))            return "UAPACLR";
    if (candidate.includes("UAPACLITE"))          return "UAPACLITE";
    if (candidate.includes("UAPACPRO"))           return "UAPACPRO";
    if (candidate.includes("UAPACIW"))            return "UAPACIW";
    if (candidate.includes("UAPAC"))              return "UAPAC";
    if (candidate.includes("UAPNANOHD"))          return "UAPNANOHD";
    if (candidate.includes("UAPFLEXHD"))          return "UAPFLEXHD";
    if (candidate.includes("UAPBEACONHD"))        return "UAPBEACONHD";
    if (candidate.includes("UAPSHD"))             return "UAPSHD";
    if (candidate.includes("UAPXG"))              return "UAPXG";
    if (candidate.includes("UAPHD"))              return "UAPHD";
    if (candidate.includes("U6ENTERPRISE"))       return "U6ENTERPRISE";
    if (candidate.includes("U6MESH"))             return "U6MESH";
    if (candidate.includes("U6PLUS"))             return "U6PLUS";
    if (candidate.includes("U6PRO"))              return "U6PRO";
    if (candidate.includes("U6LR"))               return "U6LR";
    if (candidate.includes("U6LITE"))             return "U6LITE";
    if (candidate.includes("U6IW"))               return "U6IW";
    if (candidate.includes("U6EXTENDER"))         return "U6EXTENDER";
    if (candidate.includes("U6EXT"))              return "U6EXTENDER";
    if (candidate.includes("U6MESHPRO"))          return "U6MESHPRO";
    if (candidate.includes("U7IW"))               return "U7IW";
    if (candidate.includes("U7INWALL"))           return "U7IW";
    if (candidate.includes("U7LR"))               return "U7LR";
    if (candidate.includes("U7MSH"))              return "U7MSH";
    if (candidate.includes("U7MESH"))             return "U7MSH";
    if (candidate.includes("U7LITE"))             return "U7LITE";
    if (candidate.includes("U7ULTRA"))            return "U7LITE";
    if (candidate.includes("U7PROWALL"))          return "U7PROWALL";
    if (candidate.includes("U7PROXGS"))           return "U7PROXGS";
    if (candidate.includes("U7PROXG"))            return "U7PROXG";
    if (candidate.includes("U7PROMAX"))           return "U7PROMAX";
    if (candidate.includes("U7PRO"))              return "U7PRO";
    if (candidate.includes("U7OUTDOOR"))          return "U7OUTDOOR";
    if (candidate.includes("UWBXG"))              return "UWBXG";
    if (candidate === "E7" || candidate.startsWith("E7")) return "E7";
    if (candidate.includes("UCGFIBER"))           return "UCGFIBER";
    if (candidate.includes("CLOUDGATEWAYFIBER"))  return "UCGFIBER";
    if (candidate === "UDM")                      return "UDM";
    if (candidate.includes("DREAMMACHINE"))       return "UDM";
    if (candidate === "UDR")                      return "UDR";
    if (candidate.includes("DREAMROUTER"))        return "UDR";
    if (candidate.includes("UDM67AUDR7"))         return "UDR7";
    if (candidate.includes("UDR7"))               return "UDR7";
    if (candidate.includes("DREAMROUTER7"))       return "UDR7";
    if (candidate.includes("UDM67A"))             return "UDM67A";
    if (candidate.includes("UDRULT"))             return "UDRULT";
    if (candidate.includes("UCGULTRA"))           return "UCGULTRA";
    if (candidate.includes("CLOUDGATEWAYULTRA"))  return "UCGULTRA";
    if (candidate.includes("UCGMAX"))             return "UCGMAX";
    if (candidate.includes("CLOUDGATEWAYMAX"))    return "UCGMAX";
    if (candidate === "UXGPRO")                   return "UXGPRO";
    if (candidate.includes("UXGPRO"))             return "UXGPRO";
    if (candidate === "UXGL")                     return "UXGL";
    if (candidate.includes("UXGLITE"))            return "UXGL";
    if (candidate.includes("UXGL"))               return "UXGL";
    if (candidate === "UGW3")                     return "UGW3";
    if (candidate.includes("USG3P"))              return "UGW3";
    if (candidate.includes("USG3"))               return "UGW3";
    if (candidate === "UGW4")                     return "UGW4";
    if (candidate.includes("USGPRO4"))            return "UGW4";
    if (candidate.includes("USG4"))               return "UGW4";

    if (candidate === "USAGGPRO")                 return "USAGGPRO";
    if (candidate.includes("PROAGGREGATION"))     return "USAGGPRO";
    if (candidate.includes("AGGREGATIONPRO"))     return "USAGGPRO";
    if (candidate === "USL8A")                    return "USL8A";
    if (candidate.includes("USWAGGREGATION"))     return "USL8A";
    if (candidate.includes("SWITCHAGGREGATION"))  return "USL8A";

    if (candidate === "US648P")                   return "US648P";
    if (candidate.includes("ENTERPRISE48"))       return "US648P";
    if (candidate === "US624P")                   return "US624P";
    if (candidate.includes("ENTERPRISE24"))       return "US624P";
    if (candidate === "USXG24")                   return "USXG24";
    if (candidate.includes("USWENTERPRISEXG24"))  return "USXG24";
    if (candidate.includes("ENTERPRISEXG24"))     return "USXG24";
    if (candidate === "US68P")                    return "US68P";
    if (candidate.includes("ENTERPRISE8"))        return "US68P";
    if (candidate === "USWINDUSTRIAL")            return "USWINDUSTRIAL";
    if (candidate.includes("USWINDUSTRIAL"))      return "USWINDUSTRIAL";

    if (candidate === "US48PRO")                  return "US48PRO";
    if (candidate.includes("US48PRO2"))           return "US48PRO2";
    if (candidate.includes("US48PRO"))            return "US48PRO";
    if (candidate.includes("USWPRO48POE"))        return "US48PRO";
    if (candidate.includes("PRO48POE"))           return "US48PRO";
    if (candidate.includes("USWPRO48"))           return "US48PRO2";
    if (candidate.includes("SWITCHPRO48"))        return "US48PRO2";
    if (candidate.includes("PRO48"))              return "US48PRO2";

    if (candidate === "US24PRO2")                 return "US24PRO2";
    if (candidate.includes("US24PRO2"))           return "US24PRO2";
    if (candidate === "US24PRO")                  return "US24PRO";
    if (candidate.includes("USWPRO24POE"))        return "US24PRO";
    if (candidate.includes("PRO24POE"))           return "US24PRO";
    if (candidate.includes("US24PRO"))            return "US24PRO";
    if (candidate.includes("USWPRO24"))           return "US24PRO2";
    if (candidate.includes("SWITCHPRO24"))        return "US24PRO2";

    if (candidate === "USPM16P")                  return "USPM16P";
    if (candidate.includes("USWPROMAX16POE"))     return "USPM16P";
    if (candidate.includes("PROMAX16POE"))        return "USPM16P";
    if (candidate === "USPM16")                   return "USPM16";
    if (candidate.includes("USWPROMAX16"))        return "USPM16";
    if (candidate.includes("PROMAX16"))           return "USPM16";

    if (candidate === "USPM24P")                  return "USPM24P";
    if (candidate.includes("USWPROMAX24POE"))     return "USPM24P";
    if (candidate.includes("PROMAX24POE"))        return "USPM24P";
    if (candidate === "USPM24")                   return "USPM24";
    if (candidate.includes("USWPROMAX24"))        return "USPM24";
    if (candidate.includes("PROMAX24"))           return "USPM24";

    if (candidate === "USPM48P")                  return "USPM48P";
    if (candidate.includes("USWPROMAX48POE"))     return "USPM48P";
    if (candidate.includes("PROMAX48POE"))        return "USPM48P";
    if (candidate === "USPM48")                   return "USPM48";
    if (candidate.includes("USWPROMAX48"))        return "USPM48";
    if (candidate.includes("PROMAX48"))           return "USPM48";

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

    if (candidate.includes("USC8"))               return "USC8";
    if (candidate.includes("US8P60"))             return "US8P60";
    if (candidate.includes("US860W"))             return "US8P60";
    if (candidate.includes("US8P150"))            return "US8P150";
    if (candidate.includes("US8150W"))            return "US8P150";
    if (candidate.includes("US16P150"))           return "US16P150";
    if (candidate.includes("US16POE150"))         return "US16P150";
    if (candidate.includes("US16150W"))           return "US16P150";

    if (candidate.includes("USMINI"))             return "USMINI";
    if (candidate.includes("FLEXMINI"))           return "USMINI";
    if (candidate.includes("USWFLEXMINI"))        return "USMINI";
    if (candidate === "USWFLEX25G5")              return "USWFLEX25G5";
    if (candidate.includes("USWFLEX25G5"))        return "USWFLEX25G5";
    if (candidate.includes("USWED35"))            return "USWFLEX25G5";
    if (candidate.includes("FLEX25G5"))           return "USWFLEX25G5";
    if (candidate.includes("SWITCHFLEXMINI25G"))  return "USWFLEX25G5";
    if (candidate === "USWFLEX25G8POE")           return "USWFLEX25G8POE";
    if (candidate.includes("FLEX25G8POE"))        return "USWFLEX25G8POE";
    if (candidate === "USWFLEX25G8")              return "USWFLEX25G8";
    if (candidate.includes("FLEX25G8"))           return "USWFLEX25G8";
    if (candidate.includes("USWFLEX25G8"))        return "USWFLEX25G8";
    if (candidate === "USF5P")                    return "USF5P";
    if (candidate.includes("USWFLEX"))            return "USF5P";

    if (candidate === "USWULTRA210W")             return "USWULTRA210W";
    if (candidate.includes("SWITCHULTRA210"))     return "USWULTRA210W";
    if (candidate.includes("USWULTRA210"))        return "USWULTRA210W";
    if (candidate === "USM8P210")                 return "USWULTRA210W";
    if (candidate === "USWULTRA60W")              return "USWULTRA60W";
    if (candidate.includes("SWITCHULTRA60"))      return "USWULTRA60W";
    if (candidate.includes("USWULTRA60"))         return "USWULTRA60W";
    if (candidate === "USM8P60")                  return "USWULTRA60W";
    if (candidate === "USWULTRA")                 return "USWULTRA";
    if (candidate.includes("USWULTRA"))           return "USWULTRA";
    if (candidate.includes("SWITCHULTRA"))        return "USWULTRA";
    if (candidate === "USM8P")                    return "USWULTRA";

    if (candidate === "USL16P")                   return "USL16P";
    if (candidate.includes("USW16POE"))           return "USL16P";
    if (candidate.includes("USW16P"))             return "USL16P";

    if (candidate === "USL24P")                   return "USL24P";
    if (candidate === "USL24PB")                  return "USL24P";
    if (candidate === "USL24")                    return "USL24";
    if (candidate.includes("USW24G2"))            return "USL24";
    if (candidate.includes("USW24POE"))           return "USL24P";
    if (candidate.includes("USW24P"))             return "USL24P";

    if (candidate === "USL48P")                   return "USL48P";
    if (candidate === "USL48PB")                  return "USL48P";
    if (candidate === "USL48")                    return "USL48";
    if (candidate.includes("USW48G2"))            return "USL48";
    if (candidate.includes("USW48POE"))           return "USL48P";
    if (candidate.includes("USW48P"))             return "USL48P";

    if (candidate.includes("USW24NONPOE"))        return "USL24";
    if (candidate.includes("USW48NONPOE"))        return "USL48";
    // Note: aiounifi/controller naming can expose marketed USW-24/USW-48
    // while the internal model keys are USL24/USL48 (non-PoE Gen2).
    if (candidate.includes("USW24"))              return "USL24";
    if (candidate.includes("USW48"))              return "USL48";
    if (candidate.startsWith("US24P"))            return "USL24P";
    if (candidate.startsWith("US48P"))            return "USL48P";
    if (candidate.startsWith("US24"))             return "USL24";
    if (candidate.startsWith("US48"))             return "USL48";
  }

  return null;
}

export function inferPortCountFromModel(device) {
  const text = normalizeModelKey(
    [device?.model, device?.name, device?.name_by_user].filter(Boolean).join(" ")
  );

  if (text.includes("UDMPROSE") || text.includes("UDMSE"))                           return 11;
  if (text.includes("UDMPRO"))                                                        return 11;
  if (text === "UDM" || text.includes("DREAMMACHINE"))                               return 5;
  if (text === "UDR" || text.includes("DREAMROUTER"))                                return 5;
  if (text.includes("UCGFIBER") || text.includes("CLOUDGATEWAYFIBER"))               return 7;
  if (text.includes("UDM67AUDR7") || text.includes("UDR7") || text.includes("DREAMROUTER7")) return 5;
  if (text.includes("UDM67A"))                                                        return 11;
  if (text.includes("UCGULTRA") || text.includes("CLOUDGATEWAYULTRA") || text.includes("UDRULT")) return 5;
  if (text.includes("UCGMAX")   || text.includes("CLOUDGATEWAYMAX"))                 return 5;
  if (text.includes("UXGPRO"))                                                        return 4;
  if (text.includes("UXGL"))                                                          return 2;
  if (text.includes("UGW4"))                                                          return 6;
  if (text.includes("UGW3"))                                                          return 3;

  if (text.includes("USAGGPRO") || text.includes("PROAGGREGATION"))                  return 32;
  if (text.includes("USL8A")    || text.includes("USWAGGREGATION"))                  return 8;

  if (text.includes("USL16LPB") || text.includes("USL16LP") || text.includes("USWLITE16POE") || text.includes("LITE16")) return 16;
  if (text.includes("USL8LPB")  || text.includes("USL8LP")  || text.includes("USWLITE8POE")  || text.includes("LITE8"))  return 8;
  if (text.includes("US8P60")   || text.includes("US860W")  || text.includes("USC8")) return 8;
  if (text.includes("US8P150"))                                                       return 10;
  if (text.includes("USMINI")   || text.includes("FLEXMINI"))                        return 5;
  if (text.includes("USWFLEX25G5") || text.includes("USWED35") || text.includes("FLEX25G5") || text.includes("SWITCHFLEXMINI25G")) return 5;
  if (text.includes("USWFLEX25G8POE") || text.includes("FLEX25G8POE") || text.includes("USWFLEX25G8")) return 10;
  if (text.includes("USF5P")    || text.includes("USWFLEX"))                         return 5;

  if (text.includes("US16P150") || text.includes("US16P"))                           return 18;
  if (text.includes("USL16P"))                                                        return 18;

  if (text.includes("US24PRO2") || text.includes("US24PRO") || text.includes("USWPRO24") || text.includes("SWITCHPRO24")) return 26;
  if (text.includes("US48PRO2") || text.includes("US48PRO") || text.includes("USWPRO48") || text.includes("SWITCHPRO48")) return 52;
  if (text.includes("USPM16P")  || text.includes("USPM16") || text.includes("PROMAX16")) return 18;
  if (text.includes("USPM24P")  || text.includes("USPM24")  || text.includes("PROMAX24")) return 26;
  if (text.includes("USPM48P")  || text.includes("USPM48")  || text.includes("PROMAX48")) return 52;

  if (text.includes("US648P")   || text.includes("ENTERPRISE48POE"))                 return 52;
  if (text.includes("US624P")   || text.includes("ENTERPRISE24POE"))                 return 26;
  if (text.includes("USXG24")   || text.includes("ENTERPRISEXG24"))                  return 26;
  if (text.includes("US68P")    || text.includes("ENTERPRISE8POE"))                  return 10;
  if (text.includes("USWINDUSTRIAL"))                                                 return 10;

  if (text.includes("USL48P")   || text.includes("USL48"))                           return 52;
  if (text.includes("USL24P")   || text.includes("USL24"))                           return 26;

  if (text.includes("USWULTRA"))                                                      return 8;

  if (text.includes("48"))  return 48;
  if (text.includes("24"))  return 24;
  if (text.includes("16"))  return 16;

  return null;
}

export function getDeviceLayout(device, discoveredPorts = []) {
  const modelKey = resolveModelKey(device);
  const normalizedText = normalizeModelKey(
    [device?.model, device?.hw_version, device?.name, device?.name_by_user].filter(Boolean).join(" ")
  );
  const maxDiscoveredPort = discoveredPorts.length > 0 ? Math.max(...discoveredPorts.map((p) => p.port || 0)) : 0;
  const inferredPortCount =
    inferPortCountFromModel(device) ||
    (discoveredPorts.length > 0 ? Math.max(...discoveredPorts.map((p) => p.port)) : 0);
  const looksSwitchLike = modelStartsWith(device, SWITCH_MODEL_PREFIXES);
  const looksGatewayLike = modelStartsWith(device, GATEWAY_MODEL_PREFIXES);

  let effectiveModelKey = modelKey;
  if (effectiveModelKey === "UDM67A") {
    if (
      normalizedText.includes("UDM67AUDR7") ||
      normalizedText.includes("UDR7") ||
      normalizedText.includes("DREAMROUTER7")
    ) {
      effectiveModelKey = "UDR7";
    } else if (maxDiscoveredPort > 0 && maxDiscoveredPort <= 5) {
      effectiveModelKey = "UDR7";
    }
  }

  if (effectiveModelKey && MODEL_REGISTRY[effectiveModelKey]) {
    return applyRj45LayoutHints({ modelKey: effectiveModelKey, ...MODEL_REGISTRY[effectiveModelKey] });
  }

  if (looksGatewayLike && inferredPortCount > 0) {
    const lanPortCount = Math.max(1, inferredPortCount - 1);
    return applyRj45LayoutHints({
      modelKey: null,
      kind: "gateway",
      frontStyle: inferredPortCount > 8 ? "gateway-rack" : "gateway-single-row",
      rows: [range(1, lanPortCount)],
      portCount: inferredPortCount,
      displayModel: device?.model || `UniFi Gateway (${inferredPortCount}p)`,
      specialSlots: [{ key: "wan", label: "WAN", port: inferredPortCount }],
    });
  }

  if (isAccessPointLikeModel(device) && !looksSwitchLike && !looksGatewayLike) {
    return {
      modelKey: null,
      kind: "access_point",
      frontStyle: "ap-disc",
      rows: [],
      portCount: 0,
      displayModel: device?.model || "UniFi Access Point",
      theme: "white",
      specialSlots: [],
    };
  }

  if (inferredPortCount > 0) {
    return applyRj45LayoutHints({
      modelKey: null,
      ...defaultSwitchLayout(inferredPortCount),
      displayModel: device?.model || `UniFi Device (${inferredPortCount}p)`,
    });
  }

  return applyRj45LayoutHints({
    modelKey: null,
    kind: "gateway",
    frontStyle: "gateway-generic",
    rows: [],
    portCount: 0,
    displayModel: device?.model || "UniFi Gateway",
    specialSlots: [],
  });
}
