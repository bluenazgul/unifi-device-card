/* UniFi Device Card 0.5.6-dev */

// src/model-registry.js
function range(start, end) {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
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
function applyPortsPerRowOverride(layout, portsPerRow) {
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
    12: "quad-row"
  };
  return {
    ...layout,
    rows: newRows,
    frontStyle: frontStyleMap[portsPerRow] || `grid-${portsPerRow}`
  };
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
  // USW Flex Mini  — Port 1 Uplink/PoE-in, ports 2-5 LAN
  USMINI: {
    kind: "switch",
    frontStyle: "single-row",
    rows: [range(2, 5)],
    portCount: 5,
    displayModel: "USW Flex Mini",
    theme: "white",
    specialSlots: [{ key: "uplink", label: "Uplink", port: 1 }]
  },
  // USW Flex  — Port 1 Uplink/PoE-in, ports 2-5 LAN PoE-out
  USF5P: {
    kind: "switch",
    frontStyle: "single-row",
    rows: [range(2, 5)],
    portCount: 5,
    displayModel: "USW Flex",
    theme: "white",
    poePortRange: [2, 5],
    specialSlots: [{ key: "uplink", label: "Uplink", port: 1 }]
  },
  // USW Flex Mini 2.5G 5  — Port 5 Uplink/PoE-in, ports 1-4 LAN
  USWFLEX25G5: {
    kind: "switch",
    frontStyle: "single-row",
    rows: [range(1, 4)],
    portCount: 5,
    displayModel: "USW Flex Mini 2.5G",
    theme: "white",
    specialSlots: [{ key: "uplink", label: "Uplink", port: 5 }]
  },
  // USW Flex 2.5G 8 PoE  — Port 9 Uplink/PoE-in, ports 1-8 LAN PoE-out, 1× SFP uplink
  USWFLEX25G8POE: {
    kind: "switch",
    frontStyle: "single-row",
    rows: [range(1, 8)],
    portCount: 10,
    displayModel: "USW Flex 2.5G 8 PoE",
    theme: "white",
    poePortRange: [1, 8],
    specialSlots: [
      { key: "uplink", label: "Uplink", port: 9 },
      { key: "sfp_1", label: "SFP 1", port: 10 }
    ]
  },
  USWFLEX25G8: {
    kind: "switch",
    frontStyle: "single-row",
    rows: [range(1, 8)],
    portCount: 10,
    displayModel: "USW Flex 2.5G 8",
    theme: "white",
    specialSlots: [
      { key: "uplink", label: "Uplink", port: 9 },
      { key: "sfp_1", label: "SFP 1", port: 10 }
    ]
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
    rows: [range(1, 8), range(9, 16)],
    portCount: 16,
    displayModel: "USW Lite 16 PoE",
    theme: "white",
    poePortRange: [1, 8],
    specialSlots: []
  },
  USL16LPB: {
    kind: "switch",
    frontStyle: "dual-row",
    rows: [range(1, 8), range(9, 16)],
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
    frontStyle: "eight-grid",
    rows: [range(1, 8), range(9, 16), range(17, 24)],
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
    frontStyle: "eight-grid",
    rows: [range(1, 8), range(9, 16), range(17, 24)],
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
    frontStyle: "eight-grid",
    rows: [range(1, 8), range(9, 16), range(17, 24)],
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
    frontStyle: "eight-grid",
    rows: [range(1, 8), range(9, 16), range(17, 24)],
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
    frontStyle: "eight-grid",
    rows: [range(1, 8), range(9, 16), range(17, 24)],
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
  // USW Pro Max 16  — 16× RJ45, 2× SFP+
  USPM16: {
    kind: "switch",
    frontStyle: "dual-row",
    rows: [range(1, 8), range(9, 16)],
    portCount: 18,
    displayModel: "USW Pro Max 16",
    theme: "silver",
    specialSlots: [
      { key: "sfp_1", label: "SFP+ 1", port: 17 },
      { key: "sfp_2", label: "SFP+ 2", port: 18 }
    ]
  },
  // USW Pro Max 16 PoE  — 16× RJ45, 2× SFP+
  USPM16P: {
    kind: "switch",
    frontStyle: "dual-row",
    rows: [range(1, 8), range(9, 16)],
    portCount: 18,
    displayModel: "USW Pro Max 16 PoE",
    theme: "silver",
    poePortRange: [1, 16],
    specialSlots: [
      { key: "sfp_1", label: "SFP+ 1", port: 17 },
      { key: "sfp_2", label: "SFP+ 2", port: 18 }
    ]
  },
  // USW Pro Max 24 (PoE / non-PoE)  — 24× RJ45, 2× SFP+
  USPM24: {
    kind: "switch",
    frontStyle: "eight-grid",
    rows: [range(1, 8), range(9, 16), range(17, 24)],
    portCount: 26,
    displayModel: "USW Pro Max 24",
    theme: "silver",
    specialSlots: [
      { key: "sfp_1", label: "SFP+ 1", port: 25 },
      { key: "sfp_2", label: "SFP+ 2", port: 26 }
    ]
  },
  USPM24P: {
    kind: "switch",
    frontStyle: "eight-grid",
    rows: [range(1, 8), range(9, 16), range(17, 24)],
    portCount: 26,
    displayModel: "USW Pro Max 24 PoE",
    theme: "silver",
    poePortRange: [1, 24],
    specialSlots: [
      { key: "sfp_1", label: "SFP+ 1", port: 25 },
      { key: "sfp_2", label: "SFP+ 2", port: 26 }
    ]
  },
  // USW Pro Max 48 (PoE / non-PoE)  — 48× RJ45, 4× SFP+
  USPM48: {
    kind: "switch",
    frontStyle: "quad-row",
    rows: [range(1, 12), range(13, 24), range(25, 36), range(37, 48)],
    portCount: 52,
    displayModel: "USW Pro Max 48",
    theme: "silver",
    specialSlots: [
      { key: "sfp_1", label: "SFP+ 1", port: 49 },
      { key: "sfp_2", label: "SFP+ 2", port: 50 },
      { key: "sfp_3", label: "SFP+ 3", port: 51 },
      { key: "sfp_4", label: "SFP+ 4", port: 52 }
    ]
  },
  USPM48P: {
    kind: "switch",
    frontStyle: "quad-row",
    rows: [range(1, 12), range(13, 24), range(25, 36), range(37, 48)],
    portCount: 52,
    displayModel: "USW Pro Max 48 PoE",
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
  // USW Enterprise XG 24  — 24× RJ45, 2× SFP+
  USXG24: {
    kind: "switch",
    frontStyle: "six-grid",
    rows: [range(1, 6), range(7, 12), range(13, 18), range(19, 24)],
    portCount: 26,
    displayModel: "USW Enterprise XG 24",
    theme: "silver",
    specialSlots: [
      { key: "sfp_1", label: "SFP+ 1", port: 25 },
      { key: "sfp_2", label: "SFP+ 2", port: 26 }
    ]
  },
  // USW Industrial  — 8× RJ45, 2× SFP+
  USWINDUSTRIAL: {
    kind: "switch",
    frontStyle: "single-row",
    rows: [range(1, 8)],
    portCount: 10,
    displayModel: "USW Industrial",
    theme: "silver",
    poePortRange: [1, 8],
    specialSlots: [
      { key: "sfp_1", label: "SFP+ 1", port: 9 },
      { key: "sfp_2", label: "SFP+ 2", port: 10 }
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
    rows: [[1, 2, 3]],
    portCount: 5,
    displayModel: "UDM67A (UDR7)",
    theme: "white",
    specialSlots: [
      { key: "wan", label: "WAN", port: 4 },
      { key: "sfp_1", label: "SFP+ WAN", port: 5 }
    ]
  },
  UDM67A: {
    kind: "gateway",
    frontStyle: "gateway-rack",
    rows: [range(1, 8)],
    portCount: 11,
    displayModel: "UDM67A (UDM-Pro / UDMPRO)",
    theme: "silver",
    specialSlots: [
      { key: "wan", label: "WAN", port: 9 },
      { key: "sfp_1", label: "SFP+ 1", port: 10 },
      { key: "sfp_2", label: "SFP+ 2", port: 11 }
    ]
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
  UDM: {
    kind: "gateway",
    frontStyle: "gateway-single-row",
    rows: [[1, 2, 3, 4]],
    portCount: 5,
    displayModel: "UDM",
    theme: "white",
    specialSlots: [{ key: "wan", label: "WAN", port: 5 }]
  },
  UDR: {
    kind: "gateway",
    frontStyle: "gateway-single-row",
    rows: [[1, 2, 3, 4]],
    portCount: 5,
    displayModel: "UDR",
    theme: "white",
    specialSlots: [{ key: "wan", label: "WAN", port: 5 }]
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
    if (candidate.includes("U6EXTENDER")) return "U6EXTENDER";
    if (candidate.includes("U6EXT")) return "U6EXTENDER";
    if (candidate.includes("U6MESHPRO")) return "U6MESHPRO";
    if (candidate.includes("U7IW")) return "U7IW";
    if (candidate.includes("U7INWALL")) return "U7IW";
    if (candidate.includes("U7LR")) return "U7LR";
    if (candidate.includes("U7MSH")) return "U7MSH";
    if (candidate.includes("U7MESH")) return "U7MSH";
    if (candidate.includes("U7LITE")) return "U7LITE";
    if (candidate.includes("U7ULTRA")) return "U7LITE";
    if (candidate.includes("U7PROWALL")) return "U7PROWALL";
    if (candidate.includes("U7PROXGS")) return "U7PROXGS";
    if (candidate.includes("U7PROXG")) return "U7PROXG";
    if (candidate.includes("U7PROMAX")) return "U7PROMAX";
    if (candidate.includes("U7PRO")) return "U7PRO";
    if (candidate.includes("U7OUTDOOR")) return "U7OUTDOOR";
    if (candidate.includes("UWBXG")) return "UWBXG";
    if (candidate === "E7" || candidate.startsWith("E7")) return "E7";
    if (candidate.includes("UCGFIBER")) return "UCGFIBER";
    if (candidate.includes("CLOUDGATEWAYFIBER")) return "UCGFIBER";
    if (candidate === "UDM") return "UDM";
    if (candidate.includes("DREAMMACHINE")) return "UDM";
    if (candidate === "UDR") return "UDR";
    if (candidate.includes("DREAMROUTER")) return "UDR";
    if (candidate.includes("UDM67AUDR7")) return "UDR7";
    if (candidate.includes("UDR7")) return "UDR7";
    if (candidate.includes("DREAMROUTER7")) return "UDR7";
    if (candidate.includes("UDM67A")) return "UDM67A";
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
    if (candidate === "USXG24") return "USXG24";
    if (candidate.includes("USWENTERPRISEXG24")) return "USXG24";
    if (candidate.includes("ENTERPRISEXG24")) return "USXG24";
    if (candidate === "US68P") return "US68P";
    if (candidate.includes("ENTERPRISE8")) return "US68P";
    if (candidate === "USWINDUSTRIAL") return "USWINDUSTRIAL";
    if (candidate.includes("USWINDUSTRIAL")) return "USWINDUSTRIAL";
    if (candidate === "US48PRO") return "US48PRO";
    if (candidate.includes("US48PRO2")) return "US48PRO2";
    if (candidate.includes("US48PRO")) return "US48PRO";
    if (candidate.includes("USWPRO48POE")) return "US48PRO";
    if (candidate.includes("PRO48POE")) return "US48PRO";
    if (candidate.includes("USWPRO48")) return "US48PRO2";
    if (candidate.includes("SWITCHPRO48")) return "US48PRO2";
    if (candidate.includes("PRO48")) return "US48PRO2";
    if (candidate === "US24PRO2") return "US24PRO2";
    if (candidate.includes("US24PRO2")) return "US24PRO2";
    if (candidate === "US24PRO") return "US24PRO";
    if (candidate.includes("USWPRO24POE")) return "US24PRO";
    if (candidate.includes("PRO24POE")) return "US24PRO";
    if (candidate.includes("US24PRO")) return "US24PRO";
    if (candidate.includes("USWPRO24")) return "US24PRO2";
    if (candidate.includes("SWITCHPRO24")) return "US24PRO2";
    if (candidate === "USPM16P") return "USPM16P";
    if (candidate.includes("USWPROMAX16POE")) return "USPM16P";
    if (candidate.includes("PROMAX16POE")) return "USPM16P";
    if (candidate === "USPM16") return "USPM16";
    if (candidate.includes("USWPROMAX16")) return "USPM16";
    if (candidate.includes("PROMAX16")) return "USPM16";
    if (candidate === "USPM24P") return "USPM24P";
    if (candidate.includes("USWPROMAX24POE")) return "USPM24P";
    if (candidate.includes("PROMAX24POE")) return "USPM24P";
    if (candidate === "USPM24") return "USPM24";
    if (candidate.includes("USWPROMAX24")) return "USPM24";
    if (candidate.includes("PROMAX24")) return "USPM24";
    if (candidate === "USPM48P") return "USPM48P";
    if (candidate.includes("USWPROMAX48POE")) return "USPM48P";
    if (candidate.includes("PROMAX48POE")) return "USPM48P";
    if (candidate === "USPM48") return "USPM48";
    if (candidate.includes("USWPROMAX48")) return "USPM48";
    if (candidate.includes("PROMAX48")) return "USPM48";
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
    if (candidate === "USWFLEX25G5") return "USWFLEX25G5";
    if (candidate.includes("USWFLEX25G5")) return "USWFLEX25G5";
    if (candidate.includes("USWED35")) return "USWFLEX25G5";
    if (candidate.includes("FLEX25G5")) return "USWFLEX25G5";
    if (candidate.includes("SWITCHFLEXMINI25G")) return "USWFLEX25G5";
    if (candidate === "USWFLEX25G8POE") return "USWFLEX25G8POE";
    if (candidate.includes("FLEX25G8POE")) return "USWFLEX25G8POE";
    if (candidate === "USWFLEX25G8") return "USWFLEX25G8";
    if (candidate.includes("FLEX25G8")) return "USWFLEX25G8";
    if (candidate.includes("USWFLEX25G8")) return "USWFLEX25G8";
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
    if (candidate === "USL24PB") return "USL24P";
    if (candidate === "USL24") return "USL24";
    if (candidate.includes("USW24G2")) return "USL24";
    if (candidate.includes("USW24POE")) return "USL24P";
    if (candidate.includes("USW24P")) return "USL24P";
    if (candidate === "USL48P") return "USL48P";
    if (candidate === "USL48PB") return "USL48P";
    if (candidate === "USL48") return "USL48";
    if (candidate.includes("USW48G2")) return "USL48";
    if (candidate.includes("USW48POE")) return "USL48P";
    if (candidate.includes("USW48P")) return "USL48P";
    if (candidate.includes("USW24NONPOE")) return "USL24";
    if (candidate.includes("USW48NONPOE")) return "USL48";
    if (candidate.includes("USW24")) return "USL24";
    if (candidate.includes("USW48")) return "USL48";
    if (candidate.startsWith("US24P")) return "USL24P";
    if (candidate.startsWith("US48P")) return "USL48P";
    if (candidate.startsWith("US24")) return "USL24";
    if (candidate.startsWith("US48")) return "USL48";
  }
  return null;
}
function inferPortCountFromModel(device) {
  const text = normalizeModelKey(
    [device?.model, device?.name, device?.name_by_user].filter(Boolean).join(" ")
  );
  if (text.includes("UDMPROSE") || text.includes("UDMSE")) return 11;
  if (text.includes("UDMPRO")) return 11;
  if (text === "UDM" || text.includes("DREAMMACHINE")) return 5;
  if (text === "UDR" || text.includes("DREAMROUTER")) return 5;
  if (text.includes("UCGFIBER") || text.includes("CLOUDGATEWAYFIBER")) return 7;
  if (text.includes("UDM67AUDR7") || text.includes("UDR7") || text.includes("DREAMROUTER7")) return 5;
  if (text.includes("UDM67A")) return 11;
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
  if (text.includes("USWFLEX25G5") || text.includes("USWED35") || text.includes("FLEX25G5") || text.includes("SWITCHFLEXMINI25G")) return 5;
  if (text.includes("USWFLEX25G8POE") || text.includes("FLEX25G8POE") || text.includes("USWFLEX25G8")) return 10;
  if (text.includes("USF5P") || text.includes("USWFLEX")) return 5;
  if (text.includes("US16P150") || text.includes("US16P")) return 18;
  if (text.includes("USL16P")) return 18;
  if (text.includes("US24PRO2") || text.includes("US24PRO") || text.includes("USWPRO24") || text.includes("SWITCHPRO24")) return 26;
  if (text.includes("US48PRO2") || text.includes("US48PRO") || text.includes("USWPRO48") || text.includes("SWITCHPRO48")) return 52;
  if (text.includes("USPM16P") || text.includes("USPM16") || text.includes("PROMAX16")) return 18;
  if (text.includes("USPM24P") || text.includes("USPM24") || text.includes("PROMAX24")) return 26;
  if (text.includes("USPM48P") || text.includes("USPM48") || text.includes("PROMAX48")) return 52;
  if (text.includes("US648P") || text.includes("ENTERPRISE48POE")) return 52;
  if (text.includes("US624P") || text.includes("ENTERPRISE24POE")) return 26;
  if (text.includes("USXG24") || text.includes("ENTERPRISEXG24")) return 26;
  if (text.includes("US68P") || text.includes("ENTERPRISE8POE")) return 10;
  if (text.includes("USWINDUSTRIAL")) return 10;
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
  const normalizedText = normalizeModelKey(
    [device?.model, device?.hw_version, device?.name, device?.name_by_user].filter(Boolean).join(" ")
  );
  const maxDiscoveredPort = discoveredPorts.length > 0 ? Math.max(...discoveredPorts.map((p) => p.port || 0)) : 0;
  let effectiveModelKey = modelKey;
  if (effectiveModelKey === "UDM67A") {
    if (normalizedText.includes("UDM67AUDR7") || normalizedText.includes("UDR7") || normalizedText.includes("DREAMROUTER7")) {
      effectiveModelKey = "UDR7";
    } else if (maxDiscoveredPort > 0 && maxDiscoveredPort <= 5) {
      effectiveModelKey = "UDR7";
    }
  }
  if (effectiveModelKey && MODEL_REGISTRY[effectiveModelKey]) {
    return { modelKey: effectiveModelKey, ...MODEL_REGISTRY[effectiveModelKey] };
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
  "USPM",
  "USXG",
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
var AP_MODEL_PREFIXES2 = ["UAP", "UAC", "U6", "U7", "UAL", "UAPMESH", "E7", "UWB", "UDB"];
function normalizeModelStr(value) {
  return String(value ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "");
}
var INDEXED_PORT_ID_RE = /(?:^|[_-])(?:port|lan|eth|ethernet|sfp)[_-]?(\d+)(?:[_-]|$)/i;
function findIndexedPortIdMatch(value) {
  return String(value || "").match(INDEXED_PORT_ID_RE);
}
function hasIndexedPortId(entityId) {
  return !!findIndexedPortIdMatch(entityId);
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
  const hasPortEntities = entities.some((e) => hasIndexedPortId(e?.entity_id));
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
      "UDM",
      "UDR",
      "UDMPRO",
      "UDMPROSE",
      "UDM67A",
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
      "USWFLEX25G5",
      "USWFLEX25G8",
      "USWFLEX25G8POE",
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
      "USPM16",
      "USPM16P",
      "USPM24",
      "USPM24P",
      "USPM48",
      "USPM48P",
      "US68P",
      "US624P",
      "US648P",
      "USXG24",
      "USWINDUSTRIAL",
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
  const hasPorts = entities.some((e) => hasIndexedPortId(e.entity_id));
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
    if (model.includes("uap") || model.includes("uac") || model.includes("u6") || model.includes("u7") || model.includes("ap") || model.includes("in-wall") || model.includes("iw") || model.includes("mesh") || model.includes("nanohd") || model.includes("enterprise") || name.includes("access point") || name.includes("ap ")) {
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
var DEVICE_CONTEXT_CACHE_TTL = 1500;
var _deviceContextCache = /* @__PURE__ */ new WeakMap();
var _deviceContextInflight = /* @__PURE__ */ new WeakMap();
function normalizePortsPerRowForCache(cardConfig) {
  const raw = Number.parseInt(cardConfig?.ports_per_row, 10);
  if (!Number.isFinite(raw) || raw < 1) return "";
  return String(Math.floor(raw));
}
function getDeviceContextCacheKey(deviceId, cardConfig) {
  return `${deviceId}::${normalizePortsPerRowForCache(cardConfig) || "auto"}`;
}
function getContextCacheStore(map, hass) {
  if (!map.has(hass)) map.set(hass, /* @__PURE__ */ new Map());
  return map.get(hass);
}
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
    if (hasInfraSignals || !!resolveModelKey(device)) return true;
    if (modelStartsWith(device, [
      ...SWITCH_MODEL_PREFIXES,
      ...GATEWAY_MODEL_PREFIXES,
      ...AP_MODEL_PREFIXES2
    ])) {
      return true;
    }
    if (hasUbiquitiManufacturer(device) && getDeviceType(device, entities) !== "unknown") {
      return true;
    }
    return false;
  }
  if (resolveModelKey(device)) return true;
  if (modelStartsWith(device, [...SWITCH_MODEL_PREFIXES, ...GATEWAY_MODEL_PREFIXES, ...AP_MODEL_PREFIXES2])) {
    return true;
  }
  if (entities.some((e) => hasIndexedPortId(e.entity_id)) && hasUbiquitiManufacturer(device)) {
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
function isPortLevelTelemetrySensor(entityId) {
  const id = lower(entityId);
  return hasIndexedPortId(id) || id.includes("_wan_") || id.includes("link_speed") || id.includes("_rx") || id.includes("_tx") || id.includes("throughput");
}
function findSystemStatEntity(entities, includePatterns = [], excludePatterns = []) {
  for (const entity of entities || []) {
    const id = lower(entity.entity_id);
    if (!id.startsWith("sensor.")) continue;
    if (isPortLevelTelemetrySensor(id)) continue;
    if (!includePatterns.some((pattern) => id.includes(pattern))) continue;
    if (excludePatterns.some((pattern) => id.includes(pattern))) continue;
    return entity.entity_id;
  }
  return null;
}
function getDeviceTelemetry(entities) {
  return {
    cpu_utilization_entity: findDeviceEntityByPatterns(entities, ["cpu_utilization", "cpu_usage", "processor_utilization"]) || findSystemStatEntity(entities, ["cpu"], ["temperature", "temp", "clock", "frequency", "fan"]),
    cpu_temperature_entity: findDeviceEntityByPatterns(entities, ["cpu_temperature", "processor_temperature", "temperature_cpu"]) || findSystemStatEntity(entities, ["cpu_temp", "cpu_temperature", "processor_temperature", "temperature_cpu", "cpu"], ["utilization", "usage", "clock", "frequency"]),
    memory_utilization_entity: findDeviceEntityByPatterns(entities, ["memory_utilization", "memory_usage", "ram_utilization"]) || findSystemStatEntity(entities, ["memory", "ram"], ["temperature", "temp", "slot"])
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
  if (eid.startsWith("switch.") && hasIndexedPortId(id) && id.endsWith("_poe")) {
    return "poe_switch";
  }
  if (eid.startsWith("switch.") && hasIndexedPortId(id)) {
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
  const uidMatch = findIndexedPortIdMatch(uid) || uid.match(/-(\d+)-[a-z]/i);
  if (uidMatch) return parseInt(uidMatch[1], 10);
  const macPortMatch = uid.match(/[0-9a-f]{2}_(\d+)$/i);
  if (macPortMatch) return parseInt(macPortMatch[1], 10);
  const eid = lower(entity.entity_id);
  const eidMatch = findIndexedPortIdMatch(eid);
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
  const hasPortLikeId = hasIndexedPortId(id);
  const tk = lower(entity.translation_key || "");
  const dc = lower(entity.device_class || "");
  const odc = lower(entity.original_device_class || "");
  if (eid.startsWith("button.") && (id.includes("power_cycle") || tk === "power_cycle" || id.includes("_restart") || id.includes("_reboot"))) {
    return "power_cycle_entity";
  }
  if (eid.startsWith("sensor.")) {
    if (tk === "port_bandwidth_rx" || tk === "rx") return "rx_entity";
    if (tk === "port_bandwidth_tx" || tk === "tx") return "tx_entity";
    if (tk === "port_link_speed" || tk === "link_speed") return "speed_entity";
    if (tk === "poe_power" || tk === "port_poe_power" || tk === "poe_power_consumption") {
      return "poe_power_entity";
    }
  }
  if (eid.startsWith("switch.") && hasPortLikeId && id.endsWith("_poe")) {
    return "poe_switch_entity";
  }
  if (eid.startsWith("switch.") && (hasPortLikeId || isSpecial)) {
    return "port_switch_entity";
  }
  if (eid.startsWith("binary_sensor.")) {
    if (hasPortLikeId) return "link_entity";
    if (isSpecial && (id.includes("_wan") || id.includes("_sfp") || id.includes("_uplink") || id.includes("_connected") || id.includes("_link") || tk === "port_link")) {
      return "link_entity";
    }
  }
  if (eid.startsWith("sensor.")) {
    if (hasPortLikeId) {
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
      physical_key: key,
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
      if (portData) return { ...portData, key: slot.key, physical_key: slot.key, label: slot.label, kind: "special" };
    }
    const keyData = byKey.get(slot.key);
    if (keyData) {
      return {
        ...keyData,
        key: slot.key,
        physical_key: slot.key,
        label: slot.label,
        kind: "special",
        port: slot.port ?? keyData.port ?? null
      };
    }
    return {
      key: slot.key,
      physical_key: slot.key,
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
    physical_key: key,
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
    physical_key: physical?.physical_key || physical?.key || roleKey,
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
        physical_key: specialData?.physical_key || specialData?.key || roleKey,
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
async function buildDeviceContext(hass, deviceId, cardConfig = null) {
  const { devices, entitiesByDevice, configEntries } = await getAllData(hass);
  const unifiEntryIds = extractUnifiEntryIds(configEntries);
  const device = devices.find((d) => d.id === deviceId);
  if (!device) return null;
  let entities = entitiesByDevice.get(deviceId) || [];
  if (!isUnifiDevice(device, unifiEntryIds, entities)) return null;
  const type = getDeviceType(device, entities);
  if (type !== "switch" && type !== "gateway" && type !== "access_point") return null;
  const needsUID = entities.filter(
    (e) => !e.unique_id && e.translation_key && PORT_TRANSLATION_KEYS.has(e.translation_key) && (!hasIndexedPortId(e.entity_id) || /(?:^|[_-])sfp[_+]?\d+(?:[_-]|$)/i.test(lower(e.entity_id))) && !/\bport\s+\d+\b/i.test(e.original_name || "")
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
  let layout = getDeviceLayout(device, discoveredPortsRaw);
  const configuredPortsPerRow = Number.parseInt(cardConfig?.ports_per_row, 10);
  const hasConfiguredPortsPerRow = Number.isFinite(configuredPortsPerRow) && configuredPortsPerRow > 0;
  if (hasConfiguredPortsPerRow) {
    layout = applyPortsPerRowOverride(layout, configuredPortsPerRow);
  } else if (type === "switch") {
    layout = applyPortsPerRowOverride(layout, 8);
  }
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
async function getDeviceContext(hass, deviceId, cardConfig = null) {
  if (!hass || !deviceId) return null;
  const cacheKey = getDeviceContextCacheKey(deviceId, cardConfig);
  const now = Date.now();
  const cacheStore = getContextCacheStore(_deviceContextCache, hass);
  const cached = cacheStore.get(cacheKey);
  if (cached && now - cached.ts < DEVICE_CONTEXT_CACHE_TTL) {
    return cached.data;
  }
  const inflightStore = getContextCacheStore(_deviceContextInflight, hass);
  if (inflightStore.has(cacheKey)) {
    return inflightStore.get(cacheKey);
  }
  const promise = buildDeviceContext(hass, deviceId, cardConfig);
  inflightStore.set(cacheKey, promise);
  try {
    const data = await promise;
    if (data) {
      cacheStore.set(cacheKey, { ts: Date.now(), data });
    }
    return data;
  } finally {
    inflightStore.delete(cacheKey);
  }
}
function stateObj(hass, entityId) {
  if (!entityId || !hass?.states) return null;
  return hass.states[entityId] ?? null;
}
function stateValue(hass, entityId) {
  return stateObj(hass, entityId)?.state ?? null;
}
function parseLinkSpeedMbit(hass, entityId) {
  const obj = stateObj(hass, entityId);
  const raw = obj?.state;
  if (raw == null || raw === "unavailable" || raw === "unknown") return null;
  const n = parseFloat(String(raw).replace(",", "."));
  if (!Number.isFinite(n)) return null;
  const unit = String(obj?.attributes?.unit_of_measurement || "").toLowerCase();
  if (unit.includes("gb")) return n * 1e3;
  if (unit.includes("kb")) return n / 1e3;
  return n;
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
function trafficValue(hass, entityId) {
  const raw = stateValue(hass, entityId);
  if (raw == null || raw === "unavailable" || raw === "unknown") return 0;
  const num = parseFloat(String(raw).replace(",", "."));
  return Number.isFinite(num) ? num : 0;
}
function hasTraffic(hass, port) {
  return trafficValue(hass, port?.rx_entity) > 0 || trafficValue(hass, port?.tx_entity) > 0;
}
function isPortConnected(hass, port) {
  if (port.link_entity) {
    const s = lower(stateValue(hass, port.link_entity));
    if (["on", "true", "connected", "up", "active"].includes(s)) return true;
    if (["off", "false", "disconnected", "down", "inactive"].includes(s)) return false;
  }
  if (port?.kind === "special" && (port?.rx_entity || port?.tx_entity)) {
    return hasTraffic(hass, port);
  }
  const speedMbit = parseLinkSpeedMbit(hass, port.speed_entity);
  if (speedMbit != null) {
    if (speedMbit > 0) return true;
    if (speedMbit <= 0) return false;
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
    editor_panel_toggle_label: "Front panel",
    editor_panel_toggle_text: "Show front panel hardware view",
    editor_panel_toggle_hint: "Enabled by default. Disable to hide the visual front panel.",
    editor_ports_per_row_label: "Ports per row (optional)",
    editor_ports_per_row_hint: "Leave empty for automatic layout. Set a number (for example 4, 6, 8, 12).",
    editor_edit_special_ports_toggle: "Edit special ports",
    editor_edit_special_ports_toggle_hint: "Enable to show WAN/WAN2 selectors and customize which ports appear in the top special row.",
    editor_custom_special_ports_label: "Special ports (top row)",
    editor_custom_special_ports_hint: "Click to toggle ports in the upper special row. Unselected ports move to the normal grid.",
    editor_port_size_label: "Port size",
    editor_port_size_hint: "Adjusts front-panel port size for switches and gateways.",
    editor_ap_scale_label: "AP size",
    editor_ap_scale_hint: "Scales the AP device size in AP card mode.",
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
    editor_panel_toggle_label: "Frontpanel",
    editor_panel_toggle_text: "Hardware-Frontpanel anzeigen",
    editor_panel_toggle_hint: "Standardm\xE4\xDFig aktiviert. Deaktivieren blendet die visuelle Port-Ansicht aus.",
    editor_ports_per_row_label: "Ports pro Zeile (optional)",
    editor_ports_per_row_hint: "Leer lassen f\xFCr automatisches Layout. Zahl setzen (z. B. 4, 6, 8, 12).",
    editor_edit_special_ports_toggle: "Spezial-Ports bearbeiten",
    editor_edit_special_ports_toggle_hint: "Aktivieren, um WAN/WAN2-Auswahl anzuzeigen und festzulegen, welche Ports in der oberen Spezial-Reihe erscheinen.",
    editor_custom_special_ports_label: "Spezial-Ports (obere Reihe)",
    editor_custom_special_ports_hint: "Per Klick Ports in der oberen Spezial-Reihe umschalten. Nicht gew\xE4hlte Ports erscheinen im normalen Grid.",
    editor_port_size_label: "Portgr\xF6\xDFe",
    editor_port_size_hint: "Skaliert die Frontpanel-Portgr\xF6\xDFe f\xFCr Switches und Gateways.",
    editor_ap_scale_label: "AP-Gr\xF6\xDFe",
    editor_ap_scale_hint: "Skaliert die AP-Ger\xE4tegr\xF6\xDFe im AP-Kartenmodus.",
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
    editor_panel_toggle_label: "Frontpaneel",
    editor_panel_toggle_text: "Hardware-frontpaneel tonen",
    editor_panel_toggle_hint: "Standaard ingeschakeld. Uitschakelen verbergt de visuele poortweergave.",
    editor_ports_per_row_label: "Poorten per rij (optioneel)",
    editor_ports_per_row_hint: "Leeg laten voor automatische layout. Stel een getal in (bijv. 4, 6, 8, 12).",
    editor_edit_special_ports_toggle: "Speciale poorten bewerken",
    editor_edit_special_ports_toggle_hint: "Inschakelen om WAN/WAN2-selectie te tonen en te bepalen welke poorten in de bovenste speciale rij staan.",
    editor_custom_special_ports_label: "Speciale poorten (bovenste rij)",
    editor_custom_special_ports_hint: "Klik om poorten in de bovenste speciale rij te wisselen. Niet-geselecteerde poorten gaan naar het normale raster.",
    editor_port_size_label: "Poortgrootte",
    editor_port_size_hint: "Schaalt de poortgrootte op het frontpaneel voor switches en gateways.",
    editor_ap_scale_label: "AP-grootte",
    editor_ap_scale_hint: "Schaalt de AP-apparaatgrootte in AP-kaartmodus.",
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
    editor_panel_toggle_label: "Panneau avant",
    editor_panel_toggle_text: "Afficher la vue mat\xE9rielle du panneau avant",
    editor_panel_toggle_hint: "Activ\xE9 par d\xE9faut. D\xE9sactivez pour masquer la vue visuelle des ports.",
    editor_ports_per_row_label: "Ports par ligne (optionnel)",
    editor_ports_per_row_hint: "Laissez vide pour la mise en page automatique. D\xE9finissez un nombre (ex. 4, 6, 8, 12).",
    editor_edit_special_ports_toggle: "Modifier les ports sp\xE9ciaux",
    editor_edit_special_ports_toggle_hint: "Activez pour afficher les s\xE9lecteurs WAN/WAN2 et choisir quels ports apparaissent dans la ligne sp\xE9ciale sup\xE9rieure.",
    editor_custom_special_ports_label: "Ports sp\xE9ciaux (ligne du haut)",
    editor_custom_special_ports_hint: "Cliquez pour basculer les ports de la ligne sp\xE9ciale sup\xE9rieure. Les ports non s\xE9lectionn\xE9s passent dans la grille normale.",
    editor_port_size_label: "Taille des ports",
    editor_port_size_hint: "Ajuste la taille des ports du panneau avant pour switches/passerelles.",
    editor_ap_scale_label: "Taille AP",
    editor_ap_scale_hint: "Ajuste la taille de l\u2019appareil AP en mode carte AP.",
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
  },
  es: {
    // Card states
    select_device: "Selecciona un dispositivo UniFi en el editor de tarjetas.",
    loading: "Cargando datos del dispositivo\u2026",
    no_data: "No hay datos del dispositivo.",
    no_ports: "No se detectaron puertos.",
    // Front panel
    front_panel: "Panel frontal",
    // Port detail
    link_status: "Estado del enlace",
    ap_status: "Estado del AP",
    link_lan: "Enlace LAN",
    link_mesh: "Enlace Mesh",
    uptime: "Tiempo activo",
    clients: "Clientes",
    speed: "Velocidad",
    poe: "PoE",
    poe_power: "Potencia PoE",
    connected: "Conectado",
    no_link: "Sin enlace",
    online: "En l\xEDnea",
    offline: "Sin conexi\xF3n",
    // Actions
    port_disable: "Desactivar puerto",
    port_enable: "Activar puerto",
    poe_off: "PoE apagado",
    poe_on: "PoE encendido",
    power_cycle: "Reinicio PoE",
    reboot: "Reiniciar",
    led_on: "LED encendido",
    led_off: "LED apagado",
    // Hints
    speed_disabled: "Entidad de velocidad deshabilitada \u2014 act\xEDvala en HA para mostrar la velocidad de enlace.",
    // Editor
    editor_device_title: "Dispositivo",
    editor_device_label: "Dispositivo UniFi",
    editor_device_loading: "Cargando dispositivos desde Home Assistant\u2026",
    editor_device_select: "Seleccionar dispositivo\u2026",
    editor_name_label: "Nombre para mostrar",
    editor_name_hint: "Opcional \u2014 por defecto, el nombre del dispositivo",
    editor_panel_toggle_label: "Panel frontal",
    editor_panel_toggle_text: "Mostrar vista de hardware del panel frontal",
    editor_panel_toggle_hint: "Activado por defecto. Desact\xEDvalo para ocultar la vista visual del panel.",
    editor_ports_per_row_label: "Puertos por fila (opcional)",
    editor_ports_per_row_hint: "D\xE9jalo vac\xEDo para dise\xF1o autom\xE1tico. Define un n\xFAmero (p. ej. 4, 6, 8, 12).",
    editor_edit_special_ports_toggle: "Editar puertos especiales",
    editor_edit_special_ports_toggle_hint: "Activa para mostrar selectores WAN/WAN2 y elegir qu\xE9 puertos aparecen en la fila especial superior.",
    editor_custom_special_ports_label: "Puertos especiales (fila superior)",
    editor_custom_special_ports_hint: "Haz clic para alternar puertos en la fila especial superior. Los no seleccionados pasan a la cuadr\xEDcula normal.",
    editor_port_size_label: "Tama\xF1o de puerto",
    editor_port_size_hint: "Ajusta el tama\xF1o de puertos del panel frontal para switches y gateways.",
    editor_ap_scale_label: "Tama\xF1o AP",
    editor_ap_scale_hint: "Escala el tama\xF1o del dispositivo AP en modo tarjeta AP.",
    editor_no_devices: "No se encontraron switches, gateways o puntos de acceso UniFi en Home Assistant.",
    editor_hint: "Solo se muestran dispositivos de la integraci\xF3n UniFi Network.",
    editor_error: "No se pudieron cargar los dispositivos UniFi.",
    // WAN / WAN2 selector
    editor_wan_port_label: "Puerto WAN",
    editor_wan_port_auto: "Predeterminado (autom\xE1tico)",
    editor_wan_port_hint: "Selecciona qu\xE9 puerto se usa como WAN. Solo para gateways.",
    editor_wan_port_lan: "LAN",
    editor_wan_port_sfp: "SFP",
    editor_wan_port_sfpwan: "SFP (compatible con WAN)",
    editor_wan2_port_label: "Puerto WAN 2",
    editor_wan2_port_hint: "Segundo puerto WAN/uplink opcional. Ponlo en \xABDeshabilitado\xBB si no se usa.",
    editor_wan2_port_none: "Deshabilitado",
    // Raw HA state values
    state_on: "Encendido",
    state_off: "Apagado",
    state_up: "Conectado",
    state_down: "Sin enlace",
    state_connected: "Conectado",
    state_disconnected: "Desconectado",
    state_true: "Conectado",
    state_false: "Sin enlace",
    state_active: "Activo",
    state_pending: "Pendiente",
    state_firmware_mismatch: "Firmware incompatible",
    state_upgrading: "Actualizando",
    state_provisioning: "Provisionando",
    state_heartbeat_missed: "Heartbeat perdido",
    state_adopting: "Adoptando",
    state_deleting: "Eliminando",
    state_inform_error: "Error de inform",
    state_adoption_failed: "Adopci\xF3n fallida",
    state_isolated: "Aislado",
    // Port label prefix
    port_label: "Puerto",
    // Background color field (editor)
    editor_bg_label: "Color de fondo (opcional)",
    editor_bg_hint: "Predeterminado: var(--card-background-color)",
    editor_bg_opacity_label: "Transparencia del fondo",
    editor_bg_opacity_hint: "0% = totalmente transparente, 100% = totalmente opaco",
    // Entity warning
    warning_checking: "Comprobando entidades UniFi deshabilitadas u ocultas en el dispositivo seleccionado\u2026",
    warning_title: "Se detectaron entidades UniFi deshabilitadas u ocultas",
    warning_body: "El dispositivo seleccionado tiene entidades UniFi relevantes que est\xE1n deshabilitadas u ocultas. Esto puede causar controles faltantes, telemetr\xEDa incompleta o estado de puertos incorrecto en la tarjeta.",
    warning_status: "Resumen: {disabled} deshabilitadas, {hidden} ocultas.",
    warning_check_in: "Comprobar en Home Assistant en:",
    warning_ha_path: "Ajustes \u2192 Dispositivos y servicios \u2192 UniFi \u2192 Dispositivos / Entidades",
    warning_entity_port_switch: "entidades de conmutaci\xF3n de puerto",
    warning_entity_poe_switch: "entidades de conmutaci\xF3n PoE",
    warning_entity_poe_power: "sensores de potencia PoE",
    warning_entity_link_speed: "sensores de velocidad de enlace",
    warning_entity_rx_tx: "sensores RX/TX",
    warning_entity_power_cycle: "botones de reinicio PoE",
    warning_entity_link: "entidades de enlace",
    type_switch: "Switch",
    type_gateway: "Gateway",
    type_access_point: "Punto de acceso"
  },
  it: {
    // Card states
    select_device: "Seleziona un dispositivo UniFi nell\u2019editor della card.",
    loading: "Caricamento dati dispositivo\u2026",
    no_data: "Nessun dato dispositivo disponibile.",
    no_ports: "Nessuna porta rilevata.",
    // Front panel
    front_panel: "Pannello frontale",
    // Port detail
    link_status: "Stato collegamento",
    ap_status: "Stato AP",
    link_lan: "Link LAN",
    link_mesh: "Link Mesh",
    uptime: "Uptime",
    clients: "Client",
    speed: "Velocit\xE0",
    poe: "PoE",
    poe_power: "Potenza PoE",
    connected: "Connesso",
    no_link: "Nessun link",
    online: "Online",
    offline: "Offline",
    // Actions
    port_disable: "Disattiva porta",
    port_enable: "Attiva porta",
    poe_off: "PoE spento",
    poe_on: "PoE acceso",
    power_cycle: "Riavvio PoE",
    reboot: "Riavvia",
    led_on: "LED acceso",
    led_off: "LED spento",
    // Hints
    speed_disabled: "Entit\xE0 velocit\xE0 disabilitata \u2014 abilitala in HA per mostrare la velocit\xE0 del link.",
    // Editor
    editor_device_title: "Dispositivo",
    editor_device_label: "Dispositivo UniFi",
    editor_device_loading: "Caricamento dispositivi da Home Assistant\u2026",
    editor_device_select: "Seleziona dispositivo\u2026",
    editor_name_label: "Nome visualizzato",
    editor_name_hint: "Opzionale \u2014 per impostazione predefinita il nome del dispositivo",
    editor_panel_toggle_label: "Pannello frontale",
    editor_panel_toggle_text: "Mostra la vista hardware del pannello frontale",
    editor_panel_toggle_hint: "Abilitato per default. Disattivalo per nascondere la vista visiva dei porti.",
    editor_ports_per_row_label: "Porte per riga (opzionale)",
    editor_ports_per_row_hint: "Lascia vuoto per layout automatico. Imposta un numero (es. 4, 6, 8, 12).",
    editor_edit_special_ports_toggle: "Modifica porte speciali",
    editor_edit_special_ports_toggle_hint: "Abilita per mostrare i selettori WAN/WAN2 e scegliere quali porte appaiono nella riga speciale superiore.",
    editor_custom_special_ports_label: "Porte speciali (riga superiore)",
    editor_custom_special_ports_hint: "Clicca per attivare/disattivare le porte nella riga speciale superiore. Le porte non selezionate passano alla griglia normale.",
    editor_port_size_label: "Dimensione porta",
    editor_port_size_hint: "Regola la dimensione delle porte del pannello frontale per switch e gateway.",
    editor_ap_scale_label: "Dimensione AP",
    editor_ap_scale_hint: "Scala la dimensione del dispositivo AP in modalit\xE0 card AP.",
    editor_no_devices: "Nessuno switch, gateway o access point UniFi trovato in Home Assistant.",
    editor_hint: "Vengono mostrati solo i dispositivi dell\u2019integrazione UniFi Network.",
    editor_error: "Impossibile caricare i dispositivi UniFi.",
    // WAN / WAN2 selector
    editor_wan_port_label: "Porta WAN",
    editor_wan_port_auto: "Predefinita (automatica)",
    editor_wan_port_hint: "Seleziona quale porta usare come WAN. Solo per dispositivi gateway.",
    editor_wan_port_lan: "LAN",
    editor_wan_port_sfp: "SFP",
    editor_wan_port_sfpwan: "SFP (compatibile WAN)",
    editor_wan2_port_label: "Porta WAN 2",
    editor_wan2_port_hint: "Seconda porta WAN/uplink opzionale. Imposta su \xABDisabilitata\xBB se non necessaria.",
    editor_wan2_port_none: "Disabilitata",
    // Raw HA state values
    state_on: "Acceso",
    state_off: "Spento",
    state_up: "Connesso",
    state_down: "Nessun link",
    state_connected: "Connesso",
    state_disconnected: "Disconnesso",
    state_true: "Connesso",
    state_false: "Nessun link",
    state_active: "Attivo",
    state_pending: "In attesa",
    state_firmware_mismatch: "Firmware non compatibile",
    state_upgrading: "Aggiornamento",
    state_provisioning: "Provisioning",
    state_heartbeat_missed: "Heartbeat perso",
    state_adopting: "Adozione in corso",
    state_deleting: "Eliminazione in corso",
    state_inform_error: "Errore inform",
    state_adoption_failed: "Adozione fallita",
    state_isolated: "Isolato",
    // Port label prefix
    port_label: "Porta",
    // Background color field (editor)
    editor_bg_label: "Colore sfondo (opzionale)",
    editor_bg_hint: "Predefinito: var(--card-background-color)",
    editor_bg_opacity_label: "Trasparenza sfondo",
    editor_bg_opacity_hint: "0% = completamente trasparente, 100% = completamente opaco",
    // Entity warning
    warning_checking: "Controllo entit\xE0 UniFi disabilitate o nascoste per il dispositivo selezionato\u2026",
    warning_title: "Rilevate entit\xE0 UniFi disabilitate o nascoste",
    warning_body: "Il dispositivo selezionato ha entit\xE0 UniFi rilevanti attualmente disabilitate o nascoste. Questo pu\xF2 causare controlli mancanti, telemetria incompleta o stato porte non corretto nella card.",
    warning_status: "Riepilogo: {disabled} disabilitate, {hidden} nascoste.",
    warning_check_in: "Controlla in Home Assistant in:",
    warning_ha_path: "Impostazioni \u2192 Dispositivi e servizi \u2192 UniFi \u2192 Dispositivi / Entit\xE0",
    warning_entity_port_switch: "entit\xE0 switch porta",
    warning_entity_poe_switch: "entit\xE0 switch PoE",
    warning_entity_poe_power: "sensori potenza PoE",
    warning_entity_link_speed: "sensori velocit\xE0 link",
    warning_entity_rx_tx: "sensori RX/TX",
    warning_entity_power_cycle: "pulsanti riavvio PoE",
    warning_entity_link: "entit\xE0 link",
    type_switch: "Switch",
    type_gateway: "Gateway",
    type_access_point: "Access Point"
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
function normalizePortsPerRow(value) {
  const num = Number.parseInt(value, 10);
  if (!Number.isFinite(num) || num < 1) return void 0;
  return Math.min(24, num);
}
function clampPortSize(value) {
  const num = Number.parseInt(value, 10);
  if (!Number.isFinite(num)) return 36;
  return Math.min(52, Math.max(24, num));
}
function clampApScale(value) {
  const num = Number.parseInt(value, 10);
  if (!Number.isFinite(num)) return 100;
  return Math.min(140, Math.max(60, num));
}
function normalizeSpecialPortNumbers(value) {
  if (!Array.isArray(value)) return [];
  const normalized = value.map((entry) => Number.parseInt(entry, 10)).filter((num) => Number.isInteger(num) && num > 0);
  return Array.from(new Set(normalized)).sort((a, b) => a - b);
}
function collectLayoutPorts(layout) {
  if (!layout) return [];
  const numbered = (layout.rows || []).flat().filter((port) => Number.isInteger(port) && port > 0);
  const specials = (layout.specialSlots || []).map((slot) => slot?.port).filter((port) => Number.isInteger(port) && port > 0);
  return Array.from(/* @__PURE__ */ new Set([...numbered, ...specials])).sort((a, b) => a - b);
}
function collectDefaultSpecialPorts(layout) {
  if (!layout) return [];
  return Array.from(
    new Set(
      (layout.specialSlots || []).map((slot) => slot?.port).filter((port) => Number.isInteger(port) && port > 0)
    )
  ).sort((a, b) => a - b);
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
      if (nextDeviceId !== prevDeviceId) {
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
      if (deviceId !== this._lastHintDeviceId) {
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
      const result = await getDeviceContext(this._hass, deviceId, this._config);
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
    const hasManualWanSelection = !!next.wan_port || !!next.wan2_port;
    if (hasManualWanSelection) next.edit_special_ports = true;
    next.custom_special_ports = normalizeSpecialPortNumbers(next.custom_special_ports);
    if (!next.custom_special_ports.length) delete next.custom_special_ports;
    next.special_ports = normalizeSpecialPortNumbers(next.special_ports);
    if (!next.special_ports.length && next.edit_special_ports === true) {
      next.special_ports = collectDefaultSpecialPorts(this._deviceCtx?.layout);
    }
    if (!next.special_ports.length) delete next.special_ports;
    if (next.edit_special_ports !== true) delete next.edit_special_ports;
    if (next.show_name !== false) delete next.show_name;
    if (next.show_panel !== false) delete next.show_panel;
    next.ports_per_row = normalizePortsPerRow(next.ports_per_row);
    if (!next.ports_per_row) delete next.ports_per_row;
    next.port_size = clampPortSize(next.port_size);
    if (next.port_size === 36) delete next.port_size;
    next.ap_scale = clampApScale(next.ap_scale);
    if (next.ap_scale === 100) delete next.ap_scale;
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
      wan2_port: void 0,
      custom_special_ports: void 0,
      special_ports: void 0,
      edit_special_ports: void 0
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
  _onShowPanelChange(ev) {
    const checked = !!ev.target.checked;
    this._emitConfig({ show_panel: checked ? void 0 : false });
  }
  _onPortsPerRowChange(ev) {
    this._emitConfig({ ports_per_row: normalizePortsPerRow(ev.target.value) });
  }
  _onPortSizeInput(ev) {
    this._emitConfig({ port_size: clampPortSize(ev.target.value) });
  }
  _onApScaleInput(ev) {
    this._emitConfig({ ap_scale: clampApScale(ev.target.value) });
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
      wan2_port: nextWan2 === "auto" ? void 0 : nextWan2,
      edit_special_ports: true
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
      wan2_port: safeValue === "auto" ? void 0 : safeValue,
      edit_special_ports: true
    });
  }
  _onEditSpecialPortsChange(ev) {
    const enabled = !!ev.target.checked;
    const defaults = collectDefaultSpecialPorts(this._deviceCtx?.layout);
    const current = normalizeSpecialPortNumbers(this._config?.special_ports);
    this._emitConfig({
      edit_special_ports: enabled ? true : void 0,
      special_ports: enabled ? current.length ? current : defaults : void 0,
      custom_special_ports: void 0
    });
  }
  _onSpecialPortToggle(ev) {
    const button = ev.target?.closest?.("[data-port]");
    if (!button) return;
    const port = Number.parseInt(button.dataset.port, 10);
    if (!Number.isInteger(port) || port < 1) return;
    const current = normalizeSpecialPortNumbers(this._config?.special_ports);
    const next = current.includes(port) ? current.filter((p) => p !== port) : [...current, port];
    this._emitConfig({
      special_ports: normalizeSpecialPortNumbers(next)
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
  _gatewayControlsHTML(showControls = true) {
    const deviceId = this._config?.device_id || "";
    const selectedDevice = this._devices.find((d) => d.id === deviceId) || null;
    const isGateway = this._deviceCtx?.type === "gateway" || selectedDevice?.type === "gateway";
    if (!isGateway) return "";
    if (!showControls) return "";
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

      .port-toggle-list {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .port-toggle {
        border: 1px solid var(--divider-color);
        border-radius: 999px;
        padding: 6px 10px;
        font: inherit;
        background: var(--card-background-color);
        color: var(--primary-text-color);
        cursor: pointer;
      }

      .port-toggle.selected {
        border-color: var(--primary-color);
        background: color-mix(in srgb, var(--primary-color) 18%, var(--card-background-color));
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
  _captureFocusState() {
    if (!this.shadowRoot) return null;
    const active = this.shadowRoot.activeElement;
    if (!active || !active.id) return null;
    const supportsSelection = typeof active.selectionStart === "number" && typeof active.selectionEnd === "number";
    return {
      id: active.id,
      selectionStart: supportsSelection ? active.selectionStart : null,
      selectionEnd: supportsSelection ? active.selectionEnd : null,
      selectionDirection: supportsSelection ? active.selectionDirection : null
    };
  }
  _restoreFocusState(focusState) {
    if (!focusState || !this.shadowRoot) return;
    const nextEl = this.shadowRoot.getElementById(focusState.id);
    if (!nextEl || typeof nextEl.focus !== "function") return;
    nextEl.focus({ preventScroll: true });
    if (typeof nextEl.setSelectionRange === "function" && focusState.selectionStart != null && focusState.selectionEnd != null) {
      nextEl.setSelectionRange(
        focusState.selectionStart,
        focusState.selectionEnd,
        focusState.selectionDirection || "none"
      );
    }
  }
  _render() {
    this._rendered = true;
    const focusState = this._captureFocusState();
    const deviceValue = this._config?.device_id || "";
    const selectedDevice = this._devices.find((d) => d.id === deviceValue) || null;
    const selectedType = this._deviceCtx?.type || selectedDevice?.type || null;
    const isApDevice = selectedType === "access_point";
    const isSwitchOrGateway = selectedType === "switch" || selectedType === "gateway";
    const nameValue = this._config?.name || "";
    const showName = this._config?.show_name !== false;
    const showPanel = this._config?.show_panel !== false;
    const backgroundValue = this._config?.background_color || "";
    const backgroundOpacity = clampOpacity(this._config?.background_opacity);
    const portsPerRow = this._config?.ports_per_row || "";
    const portSize = clampPortSize(this._config?.port_size);
    const apScale = clampApScale(this._config?.ap_scale);
    const editSpecialPorts = this._config?.edit_special_ports === true || !!this._config?.wan_port || !!this._config?.wan2_port;
    const availablePortSlots = mergePortsWithLayout(this._deviceCtx?.layout, this._deviceCtx?.numberedPorts || []);
    const discoveredPorts = availablePortSlots.map((slot) => slot?.port).filter((port) => Number.isInteger(port) && port > 0);
    const selectableSpecialPorts = Array.from(
      /* @__PURE__ */ new Set([...collectLayoutPorts(this._deviceCtx?.layout), ...discoveredPorts])
    ).sort((a, b) => a - b);
    const customSpecialPortOptions = selectableSpecialPorts;
    const defaultSpecialPorts = collectDefaultSpecialPorts(this._deviceCtx?.layout);
    const selectedSpecialPorts = editSpecialPorts ? (() => {
      const configured = normalizeSpecialPortNumbers(this._config?.special_ports);
      return configured.length ? configured : defaultSpecialPorts;
    })() : [];
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

        ${isSwitchOrGateway ? `
        <div class="field">
          <label>${this._t("editor_panel_toggle_label")}</label>
          <label class="checkbox-row">
            <input id="show_panel" type="checkbox" ${showPanel ? "checked" : ""}>
            <span>${this._t("editor_panel_toggle_text")}</span>
          </label>
          <div class="hint">${this._t("editor_panel_toggle_hint")}</div>
        </div>

        <div class="field">
          <label>${this._t("editor_ports_per_row_label")}</label>
          <input id="ports_per_row" type="text" inputmode="numeric" value="${portsPerRow}">
          <div class="hint">${this._t("editor_ports_per_row_hint")}</div>
        </div>` : ""}

        ${isSwitchOrGateway ? `
        <div class="field">
          <label>${this._t("editor_port_size_label")}: ${portSize}px</label>
          <input id="port_size" type="range" min="24" max="52" step="1" value="${portSize}">
          <div class="hint">${this._t("editor_port_size_hint")}</div>
        </div>` : ""}

        ${isApDevice ? `
        <div class="field">
          <label>${this._t("editor_ap_scale_label")}: ${apScale}%</label>
          <input id="ap_scale" type="range" min="60" max="140" step="1" value="${apScale}">
          <div class="hint">${this._t("editor_ap_scale_hint")}</div>
        </div>` : ""}

        ${isSwitchOrGateway ? `
        <div class="field">
          <label class="checkbox-row">
            <input id="edit_special_ports" type="checkbox" ${editSpecialPorts ? "checked" : ""}>
            <span>${this._t("editor_edit_special_ports_toggle")}</span>
          </label>
          <div class="hint">${this._t("editor_edit_special_ports_toggle_hint")}</div>
        </div>

        ${editSpecialPorts ? `
        ${this._gatewayControlsHTML(true)}

        <div class="field">
          <label>${this._t("editor_custom_special_ports_label")}</label>
          <div id="special_ports_list" class="port-toggle-list">
            ${selectableSpecialPorts.map((port) => `<button type="button" class="port-toggle ${selectedSpecialPorts.includes(port) ? "selected" : ""}" data-port="${port}">Port ${port}</button>`).join("")}
          </div>
          <div class="hint">${this._t("editor_custom_special_ports_hint")}</div>
        </div>` : ""}
        ` : ""}

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
    this.shadowRoot.getElementById("show_panel")?.addEventListener("change", (ev) => this._onShowPanelChange(ev));
    this.shadowRoot.getElementById("name")?.addEventListener("input", (ev) => this._onNameInput(ev));
    this.shadowRoot.getElementById("ports_per_row")?.addEventListener("input", (ev) => this._onPortsPerRowChange(ev));
    this.shadowRoot.getElementById("port_size")?.addEventListener("input", (ev) => this._onPortSizeInput(ev));
    this.shadowRoot.getElementById("ap_scale")?.addEventListener("input", (ev) => this._onApScaleInput(ev));
    this.shadowRoot.getElementById("background_color")?.addEventListener("input", (ev) => this._onBackgroundInput(ev));
    this.shadowRoot.getElementById("background_opacity")?.addEventListener("input", (ev) => this._onBackgroundOpacityInput(ev));
    this.shadowRoot.getElementById("wan_port")?.addEventListener("change", (ev) => this._onWanPortChange(ev));
    this.shadowRoot.getElementById("wan2_port")?.addEventListener("change", (ev) => this._onWan2PortChange(ev));
    this.shadowRoot.getElementById("edit_special_ports")?.addEventListener("change", (ev) => this._onEditSpecialPortsChange(ev));
    this.shadowRoot.getElementById("special_ports_list")?.addEventListener("click", (ev) => this._onSpecialPortToggle(ev));
    this._restoreFocusState(focusState);
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
var VERSION = "0.5.6-dev";
var DEV_LOG_FLAG = "__UNIFI_DEVICE_CARD_VERSION_LOGGED__";
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
    this._resizeObserver = null;
    this._lastMeasuredWidth = 0;
    this._lastMeasuredPanelWidth = 0;
    this._cardSize = 8;
  }
  connectedCallback() {
    if (this._resizeObserver) return;
    this._resizeObserver = new ResizeObserver(() => {
      const nextWidth = this._measuredCardWidth();
      if (Math.abs(nextWidth - this._lastMeasuredWidth) < 1) return;
      this._lastMeasuredWidth = nextWidth;
      this._render();
    });
    this._resizeObserver.observe(this);
  }
  disconnectedCallback() {
    this._resizeObserver?.disconnect();
    this._resizeObserver = null;
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
    const previousHass = this._hass;
    this._hass = hass;
    this._ensureLoaded();
    if (!previousHass || !this._ctx || this._hasRelevantStateChanges(previousHass, hass)) {
      this._render();
    }
  }
  getCardSize() {
    return this._cardSize || this._estimateCardSize();
  }
  _estimateCardSize() {
    if (!this._config?.device_id) return 4;
    if (!this._ctx) return 5;
    if (this._ctx?.type === "access_point") return 8;
    const { specials, numbered } = this._buildSlotData(this._ctx);
    const specialPortsInUse = new Set(
      specials.map((slot) => slot?.port).filter((port) => Number.isInteger(port))
    );
    const visibleNumbered = numbered.filter((slot) => !specialPortsInUse.has(slot.port));
    const panelRows = this._buildEffectiveRows(this._ctx, visibleNumbered).length + (specials.length ? 1 : 0);
    const selected = [...specials, ...visibleNumbered].find((slot) => slot.key === this._selectedKey) || specials[0] || visibleNumbered[0] || null;
    const hasPoe = !!(selected?.poe_switch_entity || selected?.poe_power_entity || selected?.power_cycle_entity);
    const hasTraffic = !!(selected?.rx_entity || selected?.tx_entity);
    return Math.max(6, Math.min(20, 5 + panelRows + (hasPoe ? 1 : 0) + (hasTraffic ? 1 : 0)));
  }
  _updateCardSize() {
    const cardEl = this.shadowRoot?.querySelector("ha-card");
    if (!cardEl) return;
    const measured = Math.max(1, Math.ceil(cardEl.getBoundingClientRect().height / 50));
    const nextSize = Number.isFinite(measured) ? measured : this._estimateCardSize();
    if (nextSize === this._cardSize) return;
    this._cardSize = nextSize;
    this.dispatchEvent(new Event("iron-resize", { bubbles: true, composed: true }));
  }
  _finalizeRender() {
    requestAnimationFrame(() => {
      this._updateCardSize();
      const panelWidth = this._measuredFrontPanelContentWidth();
      if (panelWidth <= 0) return;
      if (Math.abs(panelWidth - this._lastMeasuredPanelWidth) < 1) return;
      this._lastMeasuredPanelWidth = panelWidth;
      this._render();
    });
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
  _portSize() {
    const raw = Number.parseInt(this._config?.port_size, 10);
    if (!Number.isFinite(raw)) return 36;
    return Math.min(52, Math.max(24, raw));
  }
  _apScale() {
    const raw = Number.parseInt(this._config?.ap_scale, 10);
    if (!Number.isFinite(raw)) return 100;
    return Math.min(140, Math.max(60, raw));
  }
  _maxPortColumns() {
    const rows = this._ctx?.layout?.rows || [];
    const maxRowCols = rows.reduce((max, row) => Math.max(max, row.length || 0), 0);
    const specialCols = (this._ctx?.layout?.specialSlots || []).length;
    return Math.max(1, maxRowCols, specialCols);
  }
  _effectivePortSize() {
    const configured = this._portSize();
    return configured;
  }
  _measuredCardWidth() {
    const hostWidth = this.getBoundingClientRect?.().width || this.offsetWidth || 0;
    if (hostWidth > 0) return hostWidth;
    const cardWidth = this.shadowRoot?.querySelector("ha-card")?.getBoundingClientRect?.().width || 0;
    if (cardWidth > 0) return cardWidth;
    return this.parentElement?.getBoundingClientRect?.().width || 0;
  }
  _measuredFrontPanelContentWidth() {
    const frontPanel = this.shadowRoot?.querySelector(".frontpanel");
    if (!frontPanel) return 0;
    const panelWidth = frontPanel.getBoundingClientRect?.().width || frontPanel.clientWidth || 0;
    if (panelWidth <= 0) return 0;
    const computed = getComputedStyle(frontPanel);
    const paddingLeft = Number.parseFloat(computed.paddingLeft) || 0;
    const paddingRight = Number.parseFloat(computed.paddingRight) || 0;
    return Math.max(0, panelWidth - paddingLeft - paddingRight);
  }
  _maxFittableColumns() {
    const portSize = this._portSize();
    const panelContentWidth = this._measuredFrontPanelContentWidth();
    const hostWidth = this._measuredCardWidth();
    if (!panelContentWidth && !hostWidth) return Infinity;
    const horizontalPadding = 40;
    const gap = 6;
    const available = panelContentWidth > 0 ? panelContentWidth : Math.max(180, hostWidth - horizontalPadding);
    return Math.max(1, Math.floor((available + gap) / (portSize + gap)));
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
    this._applyManualPortSensorOverrides(numberedRaw, specialsRaw);
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
  _hasRelevantStateChanges(previousHass, nextHass) {
    const entities = this._ctx?.entities || [];
    if (!Array.isArray(entities) || entities.length === 0) return true;
    for (const entity of entities) {
      const id = entity?.entity_id;
      if (!id) continue;
      if (previousHass?.states?.[id] !== nextHass?.states?.[id]) return true;
    }
    return false;
  }
  _manualPortSpeedOverrides() {
    const out = /* @__PURE__ */ new Map();
    const entries = Object.entries(this._config || {});
    for (const [key, value] of entries) {
      const match = String(key || "").match(/^port_(\d+)$/i);
      if (!match) continue;
      const port = Number.parseInt(match[1], 10);
      const entityId = String(value || "").trim();
      if (!Number.isInteger(port) || port < 1 || !entityId) continue;
      out.set(port, entityId);
    }
    return out;
  }
  _applyManualPortSensorOverrides(numbered, specials) {
    const overrides = this._manualPortSpeedOverrides();
    if (!overrides.size) return;
    const allSlots = [...Array.isArray(numbered) ? numbered : [], ...Array.isArray(specials) ? specials : []];
    const overrideEntities = new Set(overrides.values());
    for (const slot of allSlots) {
      if (!slot || !overrideEntities.has(slot.speed_entity)) continue;
      slot.speed_entity = null;
    }
    for (const [port, entityId] of overrides.entries()) {
      const slot = allSlots.find((entry) => entry?.port === port);
      if (!slot) continue;
      slot.speed_entity = entityId;
      if (!Array.isArray(slot.raw_entities)) slot.raw_entities = [];
      if (!slot.raw_entities.includes(entityId)) slot.raw_entities.push(entityId);
      const derivedRx = this._deriveTelemetrySibling(entityId, "rx");
      if (derivedRx) {
        slot.rx_entity = derivedRx;
        if (!slot.raw_entities.includes(derivedRx)) slot.raw_entities.push(derivedRx);
      }
      const derivedTx = this._deriveTelemetrySibling(entityId, "tx");
      if (derivedTx) {
        slot.tx_entity = derivedTx;
        if (!slot.raw_entities.includes(derivedTx)) slot.raw_entities.push(derivedTx);
      }
      const derivedPoePower = this._deriveTelemetrySibling(entityId, "poe_power");
      if (derivedPoePower) {
        slot.poe_power_entity = derivedPoePower;
        if (!slot.raw_entities.includes(derivedPoePower)) slot.raw_entities.push(derivedPoePower);
      }
      const derivedPoeSwitch = this._deriveTelemetrySibling(entityId, "poe_switch");
      if (derivedPoeSwitch) {
        slot.poe_switch_entity = derivedPoeSwitch;
        if (!slot.raw_entities.includes(derivedPoeSwitch)) slot.raw_entities.push(derivedPoeSwitch);
      }
    }
  }
  _deriveTelemetrySibling(speedEntityId, metric) {
    const source = String(speedEntityId || "").trim();
    if (!source.startsWith("sensor.") || !source.endsWith("_link_speed")) return null;
    const base = source.replace(/^sensor\./i, "").replace(/_link_speed$/i, "");
    if (!base) return null;
    const candidates = metric === "rx" ? [`sensor.${base}_rx`] : metric === "tx" ? [`sensor.${base}_tx`] : metric === "poe_power" ? [
      `sensor.${base}_poe_power`,
      `sensor.${base}_poe_consumption`,
      `sensor.${base}_power_draw`
    ] : metric === "poe_switch" ? [
      `switch.${base}_poe`,
      `switch.${base}_poe_enabled`,
      `switch.${base}_poe_port_control`,
      `switch.${base}_port_poe`
    ] : [];
    if (!candidates.length) return null;
    return candidates.find((candidate) => !!this._hass?.states?.[candidate]) || null;
  }
  _normalizePortList(value) {
    if (!Array.isArray(value)) return [];
    const numeric = value.map((entry) => Number.parseInt(entry, 10)).filter((num) => Number.isInteger(num) && num > 0);
    return Array.from(new Set(numeric)).sort((a, b) => a - b);
  }
  _applySpecialPortSelection(specials, numbered) {
    const specialPortDefaults = specials.map((slot) => slot?.port).filter((port) => Number.isInteger(port));
    const hasEditMode = this._config?.edit_special_ports === true;
    const selectedPorts = hasEditMode ? Array.isArray(this._config?.special_ports) ? this._normalizePortList(this._config?.special_ports) : this._normalizePortList(specialPortDefaults) : this._normalizePortList([
      ...specialPortDefaults,
      ...this._normalizePortList(this._config?.custom_special_ports)
    ]);
    const allByPort = /* @__PURE__ */ new Map();
    for (const slot of [...specials, ...numbered]) {
      if (!Number.isInteger(slot?.port) || allByPort.has(slot.port)) continue;
      allByPort.set(slot.port, slot);
    }
    const selectedSet = new Set(selectedPorts);
    const nextSpecials = selectedPorts.map((port) => allByPort.get(port)).filter(Boolean).map((slot) => ({ ...slot, kind: "special", label: slot.label || String(slot.port) }));
    const numberedByPort = new Map(
      numbered.filter((slot) => Number.isInteger(slot?.port)).map((slot) => [slot.port, slot])
    );
    const nextNumbered = numbered.filter((slot) => !selectedSet.has(slot.port)).map((slot) => ({ ...slot, kind: "numbered", label: slot.label || String(slot.port) }));
    for (const slot of specials) {
      if (!Number.isInteger(slot?.port) || selectedSet.has(slot.port)) continue;
      if (numberedByPort.has(slot.port)) continue;
      nextNumbered.push({
        ...slot,
        key: `port-${slot.port}`,
        kind: "numbered",
        label: String(slot.port)
      });
    }
    nextNumbered.sort((a, b) => (a.port || 0) - (b.port || 0));
    return { specials: nextSpecials, numbered: nextNumbered };
  }
  _buildEffectiveRows(ctx, numbered) {
    const baseRows = (ctx?.layout?.rows || []).map((row) => [...row]);
    const knownPorts = new Set(baseRows.flat());
    const orderedPorts = numbered.map((slot) => slot?.port).filter((port) => Number.isInteger(port)).sort((a, b) => a - b);
    const extraPorts = numbered.map((slot) => slot?.port).filter((port) => Number.isInteger(port) && !knownPorts.has(port)).sort((a, b) => a - b);
    if (!extraPorts.length && !baseRows.length && !orderedPorts.length) return [];
    const fitCols = this._maxFittableColumns();
    if (!baseRows.length) {
      if (!Number.isFinite(fitCols) || extraPorts.length <= fitCols) return [extraPorts];
      const packed = [];
      for (let i = 0; i < extraPorts.length; i += fitCols) {
        packed.push(extraPorts.slice(i, i + fitCols));
      }
      return packed;
    }
    const rows = baseRows.map((row) => [...row]);
    if (extraPorts.length) rows[rows.length - 1].push(...extraPorts);
    const widestRow = rows.reduce((max, row) => Math.max(max, row.length), 0);
    if (!Number.isFinite(fitCols) || widestRow <= fitCols) return rows;
    const packedRows = [];
    for (let i = 0; i < orderedPorts.length; i += fitCols) {
      packedRows.push(orderedPorts.slice(i, i + fitCols));
    }
    return packedRows;
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
      const ctx = await getDeviceContext(this._hass, currentId, this._config);
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
    return parseLinkSpeedMbit(this._hass, port?.speed_entity);
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
    const physicalKey = String(slot?.physical_key || "").toLowerCase();
    const layoutSlot = Number.isInteger(slot?.port) ? (this._ctx?.layout?.specialSlots || []).find((s) => s.port === slot.port) : null;
    const layoutKey = String(layoutSlot?.key || "").toLowerCase();
    const layoutLabel = String(layoutSlot?.label || "").toLowerCase();
    return slot?.kind === "special" && (label.includes("sfp") || key.includes("sfp") || physicalKey.includes("sfp") || layoutKey.includes("sfp") || layoutLabel.includes("sfp"));
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
        --udc-port-size: 36px;
        --udc-ap-scale: 1;
      }

      ha-card {
        background: var(--udc-card-bg, var(--ha-card-background, var(--card-background-color)));
        border-radius: var(--ha-card-border-radius, 12px);
        overflow: hidden;
        position: relative;
        isolation: isolate;
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

      .chip.compact {
        padding: 1px 7px;
        font-size: 0.64rem;
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
        position: relative;
        z-index: 0;
        overflow: hidden;
      }

      .frontpanel.theme-white { background: #d6d6d9; }
      .frontpanel.theme-silver { background: #c4c5c8; }
      .frontpanel.theme-dark { background: #d0d1d4; }
      .frontpanel.no-panel-bg { background: var(--udc-chrome-bg, transparent); }

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
        grid-template-columns: repeat(8, var(--udc-port-size));
      }

      .frontpanel.dual-row .port-row {
        grid-template-columns: repeat(8, var(--udc-port-size));
      }

      .frontpanel.gateway-rack .port-row {
        grid-template-columns: repeat(8, var(--udc-port-size));
      }

      .frontpanel.gateway-compact .port-row {
        grid-template-columns: repeat(5, var(--udc-port-size));
      }

      .frontpanel.six-grid .port-row {
        grid-template-columns: repeat(6, var(--udc-port-size));
      }

      .frontpanel.eight-grid .port-row {
        grid-template-columns: repeat(8, var(--udc-port-size));
      }

      .frontpanel.quad-row .port-row {
        grid-template-columns: repeat(12, var(--udc-port-size));
      }

      .frontpanel.ultra-row .port-row {
        grid-template-columns: repeat(7, var(--udc-port-size));
      }

      .frontpanel.grid-4 .port-row {
        grid-template-columns: repeat(4, var(--udc-port-size));
      }

      .frontpanel.grid-5 .port-row {
        grid-template-columns: repeat(5, var(--udc-port-size));
      }

      .frontpanel.grid-9 .port-row {
        grid-template-columns: repeat(9, var(--udc-port-size));
      }

      .frontpanel.grid-10 .port-row {
        grid-template-columns: repeat(10, var(--udc-port-size));
      }

      .frontpanel.ap-disc {
        background: var(--udc-chrome-bg, linear-gradient(160deg, var(--udc-surface) 0%, var(--udc-bg) 100%));
        display: grid;
        place-items: center;
        min-height: calc((225px * var(--udc-ap-scale)) + 34px);
        border-bottom: 1px solid var(--udc-border);
        position: relative;
        overflow: hidden;
        padding: 4px 14px;
      }

      .ap-device {
        width: calc(225px * var(--udc-ap-scale));
        height: calc(225px * var(--udc-ap-scale));
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
        width: calc(92px * var(--udc-ap-scale));
        height: calc(92px * var(--udc-ap-scale));
        border-radius: 50%;
        border: max(2px, calc(4px * var(--udc-ap-scale))) solid var(--ap-ring-color, #a5adb8);
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
        font-size: calc(42px * var(--udc-ap-scale));
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
        position: relative;
        min-width: 0;
        border: none;
        background: transparent;
        transition: outline .1s ease, opacity .15s ease, filter .15s ease;
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
        transition: opacity .15s ease, filter .15s ease;
      }

      .port.down .port-housing {
        opacity: .42;
        filter: saturate(.45) brightness(.78);
      }

      .port.up .port-housing {
        opacity: 1;
        filter: saturate(1.05) brightness(1.02);
      }

      .port:hover .port-housing,
      .port.selected .port-housing {
        opacity: 1;
        filter: none;
      }

      .port-rj45 {
        position: relative;
        width: calc(var(--udc-port-size) - 2px);
        height: calc(var(--udc-port-size) - 2px);
        background: linear-gradient(180deg, #2e3137 0%, #0b0c0e 100%);
        border: 1px solid #666a72;
        border-radius: 1px 1px 2px 2px;
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,.05),
          inset 0 -1px 0 rgba(0,0,0,.45);
        overflow: hidden;
        z-index: 0;
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
        height: 4px;
        border-radius: 0;
        background: linear-gradient(180deg, #9ea3ab 0%, #767c85 100%);
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,.16),
          inset 0 -1px 0 rgba(0,0,0,.28);
        z-index: 1;
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
        background: linear-gradient(180deg, #efc14d 0%, #efb21a 58%, #b8820d 100%);
        box-shadow:
          0 0 2px rgba(239,178,26,.42),
          inset 0 1px 0 rgba(255,255,255,.22),
          inset 0 -1px 0 rgba(0,0,0,.35);
      }

      .rj45-led.green {
        background: linear-gradient(180deg, #63ea86 0%, #33d35d 58%, #1c8e3a 100%);
        box-shadow:
          0 0 2px rgba(51,211,93,.42),
          inset 0 1px 0 rgba(255,255,255,.22),
          inset 0 -1px 0 rgba(0,0,0,.35);
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
        height: 4px;
        border-radius: 0;
        background: linear-gradient(180deg, #9ea3ab 0%, #767c85 100%);
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,.16),
          inset 0 -1px 0 rgba(0,0,0,.28);
      }

      .sfp-top-led.orange {
        background: linear-gradient(180deg, #efc14d 0%, #efb21a 58%, #b8820d 100%);
        box-shadow:
          0 0 2px rgba(239,178,26,.42),
          inset 0 1px 0 rgba(255,255,255,.22),
          inset 0 -1px 0 rgba(0,0,0,.35);
      }

      .sfp-top-led.green {
        background: linear-gradient(180deg, #63ea86 0%, #33d35d 58%, #1c8e3a 100%);
        box-shadow:
          0 0 2px rgba(51,211,93,.42),
          inset 0 1px 0 rgba(255,255,255,.22),
          inset 0 -1px 0 rgba(0,0,0,.35);
      }

      .sfp-top-led.off {
        background: #868b93;
        box-shadow: inset 0 -1px 0 rgba(0,0,0,.2);
      }

      .port-sfp {
        position: relative;
        width: calc(var(--udc-port-size) - 2px);
        height: var(--udc-port-size);
        z-index: 0;
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
        min-width: var(--udc-port-size);
        max-width: var(--udc-port-size);
      }

      .port-num {
        font-size: 7px;
        font-weight: 800;
        line-height: 1;
        margin-top: 1px;
        letter-spacing: 0;
        user-select: none;
        color: #646a76;
        transition: color .15s ease, opacity .15s ease;
      }

      .port.down .port-num {
        color: #4c5260;
        opacity: .6;
      }

      .port.up .port-num {
        color: #414957;
        opacity: 1;
      }

      .port:hover .port-num,
      .port.selected .port-num {
        opacity: 1;
      }

      .port.is-sfp .port-num {
        font-size: 6px;
      }

      .section {
        padding: 12px 14px 14px;
        background: var(--udc-chrome-bg, transparent);
        position: relative;
        z-index: 1;
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

      .action-btn.primary.dimmed {
        opacity: .52;
        filter: saturate(.6) brightness(.9);
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
        <ha-card class="ap-card" style="--udc-card-bg: ${this._cardBgStyle()}; --udc-chrome-bg: ${this._cardChromeBgStyle()}; --ap-ring-color: ${ringColor}; --udc-port-size: ${this._effectivePortSize()}px; --udc-ap-scale: ${this._apScale() / 100}">
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
              ${this._ctx?.reboot_entity ? `<button class="chip compact" data-action="reboot-device">\u21BB ${this._t("reboot")}</button>` : ""}
              ${ledEntity ? `<button class="chip compact" data-action="toggle-led" style="--led-indicator: ${ledEnabled ? ringColor : "#868b93"}"><span class="led-indicator"></span>LED</button>` : ""}
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
    const slotData = this._buildSlotData(ctx);
    const { specials: allSpecials, numbered: normalizedNumbered } = this._applySpecialPortSelection(
      slotData.specials,
      slotData.numbered
    );
    const allSlots = [...allSpecials, ...normalizedNumbered];
    const selected = allSlots.find((p) => p.key === this._selectedKey) || allSlots[0] || null;
    const connected = this._connectedCount(allSlots);
    const theme = ctx?.layout?.theme || "dark";
    const showPanel = this._config?.show_panel !== false;
    const specialPortsInUse = new Set(
      allSpecials.map((slot) => slot?.port).filter((port) => Number.isInteger(port))
    );
    const visibleNumbered = normalizedNumbered.filter((slot) => !specialPortsInUse.has(slot.port));
    const effectiveRows = this._buildEffectiveRows(ctx, visibleNumbered);
    const specialRow = allSpecials.length ? `<div class="special-row">${allSpecials.map((s) => this._renderPortButton(s, selected?.key)).join("")}</div>` : "";
    const layoutRows = effectiveRows.map((rowPorts) => {
      const items = rowPorts.map((portNumber) => visibleNumbered.find((p) => p.port === portNumber)).filter(Boolean).map((slot) => this._renderPortButton(slot, selected?.key)).join("");
      const cols = Math.max(1, rowPorts.length);
      return items ? `<div class="port-row" style="grid-template-columns: repeat(${cols}, var(--udc-port-size));">${items}</div>` : "";
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
          ${selected.poe_switch_entity ? `<button class="action-btn primary${poeOn ? "" : " dimmed"}" data-action="toggle-poe" data-entity="${selected.poe_switch_entity}">
            \u26A1 ${this._t("poe")}
          </button>` : ""}
          ${selected.power_cycle_entity ? `<button class="action-btn secondary" data-action="power-cycle" data-entity="${selected.power_cycle_entity}">
            \u21BA ${this._t("power_cycle")}
          </button>` : ""}
        </div>`;
    }
    const headerTitle = this._title();
    const headerMetrics = this._headerMetrics();
    this.shadowRoot.innerHTML = `${this._styles()}
      <ha-card style="--udc-card-bg: ${this._cardBgStyle()}; --udc-chrome-bg: ${this._cardChromeBgStyle()}; --udc-port-size: ${this._effectivePortSize()}px; --udc-ap-scale: ${this._apScale() / 100}">
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
            ${ctx?.reboot_entity ? `<button class="chip compact" data-action="reboot-device">\u21BB ${this._t("reboot")}</button>` : ""}
            <div class="chip"><div class="dot"></div>${connected}/${allSlots.length}</div>
          </div>
        </div>

        <div class="frontpanel ${ctx?.layout?.frontStyle || "single-row"} theme-${theme}${showPanel ? "" : " no-panel-bg"}">
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
        <ha-card style="--udc-card-bg: ${this._cardBgStyle()}; --udc-port-size: ${this._effectivePortSize()}px; --udc-ap-scale: ${this._apScale() / 100}">
          <div class="header">
            <div class="header-info">
              ${title ? `<div class="title">${title}</div>` : ""}
              <div class="subtitle">${this._subtitle()}</div>
            </div>
          </div>
          <div class="empty-state">${this._t("select_device")}</div>
        </ha-card>`;
      this._finalizeRender();
      return;
    }
    if (this._loading) {
      this.shadowRoot.innerHTML = `${this._styles()}
        <ha-card style="--udc-card-bg: ${this._cardBgStyle()}; --udc-port-size: ${this._effectivePortSize()}px; --udc-ap-scale: ${this._apScale() / 100}">
          <div class="header">
            <div class="header-info">
              ${title ? `<div class="title">${title}</div>` : ""}
              <div class="subtitle">${this._subtitle()}</div>
            </div>
          </div>
          <div class="loading-state"><div class="spinner"></div>${this._t("loading")}</div>
        </ha-card>`;
      this._finalizeRender();
      return;
    }
    if (!this._ctx) {
      this.shadowRoot.innerHTML = `${this._styles()}
        <ha-card style="--udc-card-bg: ${this._cardBgStyle()}; --udc-port-size: ${this._effectivePortSize()}px; --udc-ap-scale: ${this._apScale() / 100}">
          <div class="header">
            <div class="header-info">
              ${title ? `<div class="title">${title}</div>` : ""}
              <div class="subtitle">${this._subtitle()}</div>
            </div>
          </div>
          <div class="empty-state">${this._t("no_data")}</div>
        </ha-card>`;
      this._finalizeRender();
      return;
    }
    this._renderPanelAndDetail();
    this._finalizeRender();
  }
};
customElements.define("unifi-device-card", UnifiDeviceCard);
window.customCards = window.customCards || [];
window.customCards.push({
  type: "unifi-device-card",
  name: "UniFi Device Card",
  description: `Lovelace card for UniFi devices (v${VERSION}).`,
  preview: true,
  documentationURL: "https://github.com/bluenazgul/unifi-device-card"
});
if (!window[DEV_LOG_FLAG]) {
  window[DEV_LOG_FLAG] = true;
  console.info(`[UNIFI-DEVICE-CARD] Version ${VERSION}`);
}
