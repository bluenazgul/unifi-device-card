// model-registry.js
//
// Schema für jeden Eintrag im MODEL_REGISTRY:
//
//   kind        : "switch" | "gateway"
//   frontStyle  : CSS-Klasse auf .frontpanel — bestimmt grid-template-columns
//                 "single-row"         → repeat(8)   ≤8 Ports
//                 "dual-row"           → repeat(8)   16 Ports, 2 Zeilen
//                 "six-grid"           → repeat(6)   24 Ports, 4 Zeilen à 6
//                 "quad-row"           → repeat(12)  48 Ports, 4 Zeilen à 12
//                 "ultra-row"          → repeat(7)   USW Ultra (7 Ports)
//                 "gateway-single-row" → repeat(8)   Desktop-Gateways (4–7 LAN-Ports)
//                 "gateway-compact"    → repeat(5)   Sehr kleine Gateways (1–3 LAN-Ports)
//                 "gateway-rack"       → repeat(8)   1U-Rack-Gateways
//
//   rows        : Array von Port-Nummer-Arrays — NUR die normalen RJ45/LAN-Ports
//                 SFP/WAN/Uplink kommen in specialSlots, nicht in rows!
//
//   portCount   : Gesamtzahl aller physischen Ports (RJ45 + SFP, informativ)
//
//   displayModel: Anzeigename in der Card
//
//   theme       : "white"  → hellgraues Frontpanel (Lite/Flex/Mini/Cloud-GW-Desktop)
//                 "silver" → dunkles Frontpanel   (Pro/Enterprise/Rack/Gen1-Silber)
//
//   specialSlots: [ { key, label, port? }, … ]
//                 key: "wan" | "sfp_1"–"sfp_4" | "uplink"
//                 port: logische Port-Nummer aus HA-Entity (optional)

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

export const MODEL_REGISTRY = {

  // ════════════════════════════════════════════════════════
  // UTILITY / FLEX / MINI
  // ════════════════════════════════════════════════════════

  // USW Flex Mini  5× 1G RJ45 | white | single-row
  USMINI: {
    kind: "switch", frontStyle: "single-row", rows: [range(1, 5)],
    portCount: 5, displayModel: "USW Flex Mini", theme: "white", specialSlots: [],
  },

  // USW Flex Mini 2.5G  5× 2.5G RJ45 | white | single-row
  USWFLEX25G5: {
    kind: "switch", frontStyle: "single-row", rows: [range(1, 5)],
    portCount: 5, displayModel: "USW Flex Mini 2.5G", theme: "white", specialSlots: [],
  },

  // USW Flex  5× 1G RJ45, PoE-in | white | single-row
  USWFLEX: {
    kind: "switch", frontStyle: "single-row", rows: [range(1, 5)],
    portCount: 5, displayModel: "USW Flex", theme: "white", specialSlots: [],
  },

  // USW Flex 2.5G  8× 2.5G RJ45 | white | single-row
  USWFLEX25G8: {
    kind: "switch", frontStyle: "single-row", rows: [range(1, 8)],
    portCount: 8, displayModel: "USW Flex 2.5G", theme: "white", specialSlots: [],
  },

  // USW Flex XG  4× 10G RJ45 + 1× SFP+ Uplink | white | single-row
  USWFLEXXG: {
    kind: "switch", frontStyle: "single-row", rows: [range(1, 4)],
    portCount: 5, displayModel: "USW Flex XG", theme: "white",
    specialSlots: [{ key: "sfp_1", label: "SFP+ 1", port: 5 }],
  },

  // ════════════════════════════════════════════════════════
  // 8-PORT SWITCHES
  // ════════════════════════════════════════════════════════

  // US 8 (Gen1, non-PoE)  8× 1G RJ45 | silver | single-row
  US8: {
    kind: "switch", frontStyle: "single-row", rows: [range(1, 8)],
    portCount: 8, displayModel: "US 8", theme: "silver", specialSlots: [],
  },

  // US 8 60W (Gen1, PoE)  8× 1G RJ45 PoE + 2× SFP | silver | single-row
  US8P60: {
    kind: "switch", frontStyle: "single-row", rows: [range(1, 8)],
    portCount: 10, displayModel: "US 8 60W", theme: "silver",
    specialSlots: [
      { key: "sfp_1", label: "SFP 1", port: 9 },
      { key: "sfp_2", label: "SFP 2", port: 10 },
    ],
  },

  // US 8 150W (Gen1, PoE)  8× 1G RJ45 PoE + 2× SFP | silver | single-row
  US8150W: {
    kind: "switch", frontStyle: "single-row", rows: [range(1, 8)],
    portCount: 10, displayModel: "US 8 150W", theme: "silver",
    specialSlots: [
      { key: "sfp_1", label: "SFP 1", port: 9 },
      { key: "sfp_2", label: "SFP 2", port: 10 },
    ],
  },

  // USW Lite 8 PoE  8× 1G (4× PoE+) | white | single-row
  USL8LP: {
    kind: "switch", frontStyle: "single-row", rows: [range(1, 8)],
    portCount: 8, displayModel: "USW Lite 8 PoE", theme: "white", specialSlots: [],
  },
  USL8LPB: {
    kind: "switch", frontStyle: "single-row", rows: [range(1, 8)],
    portCount: 8, displayModel: "USW Lite 8 PoE", theme: "white", specialSlots: [],
  },

  // USW Pro 8 PoE  8× 1G PoE+ + 2× 10G SFP+ | silver | single-row
  USWPRO8POE: {
    kind: "switch", frontStyle: "single-row", rows: [range(1, 8)],
    portCount: 10, displayModel: "USW Pro 8 PoE", theme: "silver",
    specialSlots: [
      { key: "sfp_1", label: "SFP+ 1", port: 9 },
      { key: "sfp_2", label: "SFP+ 2", port: 10 },
    ],
  },

  // USW Enterprise 8 PoE  8× 2.5G PoE++ + 2× 10G SFP+ | silver | single-row
  USWENTERPRISE8POE: {
    kind: "switch", frontStyle: "single-row", rows: [range(1, 8)],
    portCount: 10, displayModel: "USW Enterprise 8 PoE", theme: "silver",
    specialSlots: [
      { key: "sfp_1", label: "SFP+ 1", port: 9 },
      { key: "sfp_2", label: "SFP+ 2", port: 10 },
    ],
  },

  // USW Pro XG 8 PoE  8× 10G PoE+++ + 2× 25G SFP28 | silver | single-row
  USWPROXG8POE: {
    kind: "switch", frontStyle: "single-row", rows: [range(1, 8)],
    portCount: 10, displayModel: "USW Pro XG 8 PoE", theme: "silver",
    specialSlots: [
      { key: "sfp_1", label: "SFP28 1", port: 9 },
      { key: "sfp_2", label: "SFP28 2", port: 10 },
    ],
  },

  // ════════════════════════════════════════════════════════
  // 16-PORT SWITCHES
  // ════════════════════════════════════════════════════════

  // USW Lite 16 PoE  16× 1G (8× PoE+) | white | dual-row (interleaved: odd top, even bottom)
  USL16LP: {
    kind: "switch", frontStyle: "dual-row", rows: [oddRange(1, 16), evenRange(1, 16)],
    portCount: 16, displayModel: "USW Lite 16 PoE", theme: "white", specialSlots: [],
  },
  USL16LPB: {
    kind: "switch", frontStyle: "dual-row", rows: [oddRange(1, 16), evenRange(1, 16)],
    portCount: 16, displayModel: "USW Lite 16 PoE", theme: "white", specialSlots: [],
  },

  // USW 16 PoE (Standard Gen2)  16× 1G (8× PoE+) + 2× 1G SFP | silver | dual-row sequential
  USW16POE: {
    kind: "switch", frontStyle: "dual-row", rows: [range(1, 8), range(9, 16)],
    portCount: 18, displayModel: "USW 16 PoE", theme: "silver",
    specialSlots: [
      { key: "sfp_1", label: "SFP 1", port: 17 },
      { key: "sfp_2", label: "SFP 2", port: 18 },
    ],
  },

  // US 16 PoE 150W (Gen1)  16× 1G PoE + 2× SFP | silver | dual-row sequential
  US16P150: {
    kind: "switch", frontStyle: "dual-row", rows: [range(1, 8), range(9, 16)],
    portCount: 18, displayModel: "US 16 PoE 150W", theme: "silver",
    specialSlots: [
      { key: "sfp_1", label: "SFP 1", port: 17 },
      { key: "sfp_2", label: "SFP 2", port: 18 },
    ],
  },

  // USW Pro Max 16 PoE  16× mixed 1G/2.5G PoE++ + 2× 10G SFP+ | silver | dual-row
  USWPROMAX16POE: {
    kind: "switch", frontStyle: "dual-row", rows: [range(1, 8), range(9, 16)],
    portCount: 18, displayModel: "USW Pro Max 16 PoE", theme: "silver",
    specialSlots: [
      { key: "sfp_1", label: "SFP+ 1", port: 17 },
      { key: "sfp_2", label: "SFP+ 2", port: 18 },
    ],
  },

  // USW Pro Max 16 (non-PoE)  16× mixed 1G/2.5G + 2× 10G SFP+ | silver | dual-row
  USWPROMAX16: {
    kind: "switch", frontStyle: "dual-row", rows: [range(1, 8), range(9, 16)],
    portCount: 18, displayModel: "USW Pro Max 16", theme: "silver",
    specialSlots: [
      { key: "sfp_1", label: "SFP+ 1", port: 17 },
      { key: "sfp_2", label: "SFP+ 2", port: 18 },
    ],
  },

  // USW Pro XG 10 PoE  10× 10G PoE+++ + 2× 25G SFP28 | silver | dual-row
  USWPROXG10POE: {
    kind: "switch", frontStyle: "dual-row", rows: [range(1, 5), range(6, 10)],
    portCount: 12, displayModel: "USW Pro XG 10 PoE", theme: "silver",
    specialSlots: [
      { key: "sfp_1", label: "SFP28 1", port: 11 },
      { key: "sfp_2", label: "SFP28 2", port: 12 },
    ],
  },

  // ════════════════════════════════════════════════════════
  // 24-PORT SWITCHES  (alle: six-grid → repeat(6), 4 Zeilen à 6)
  // ════════════════════════════════════════════════════════

  // USW 24 PoE (Standard Gen2)  24× 1G (16× PoE+) + 2× 1G SFP | silver | six-grid
  USW24P: {
    kind: "switch", frontStyle: "six-grid",
    rows: [range(1, 6), range(7, 12), range(13, 18), range(19, 24)],
    portCount: 26, displayModel: "USW 24 PoE", theme: "silver",
    specialSlots: [
      { key: "sfp_1", label: "SFP 1", port: 25 },
      { key: "sfp_2", label: "SFP 2", port: 26 },
    ],
  },

  // USW 24 (Standard Gen2, non-PoE)  24× 1G + 2× 1G SFP | silver | six-grid
  USW24: {
    kind: "switch", frontStyle: "six-grid",
    rows: [range(1, 6), range(7, 12), range(13, 18), range(19, 24)],
    portCount: 26, displayModel: "USW 24", theme: "silver",
    specialSlots: [
      { key: "sfp_1", label: "SFP 1", port: 25 },
      { key: "sfp_2", label: "SFP 2", port: 26 },
    ],
  },

  // US 24 (Gen1, non-PoE)  24× 1G + 2× SFP | silver | six-grid
  US24: {
    kind: "switch", frontStyle: "six-grid",
    rows: [range(1, 6), range(7, 12), range(13, 18), range(19, 24)],
    portCount: 26, displayModel: "US 24", theme: "silver",
    specialSlots: [
      { key: "sfp_1", label: "SFP 1", port: 25 },
      { key: "sfp_2", label: "SFP 2", port: 26 },
    ],
  },

  // US 24 500W (Gen1, PoE)  24× 1G PoE + 2× SFP | silver | six-grid
  US24500W: {
    kind: "switch", frontStyle: "six-grid",
    rows: [range(1, 6), range(7, 12), range(13, 18), range(19, 24)],
    portCount: 26, displayModel: "US 24 500W", theme: "silver",
    specialSlots: [
      { key: "sfp_1", label: "SFP 1", port: 25 },
      { key: "sfp_2", label: "SFP 2", port: 26 },
    ],
  },

  // USW Pro 24  24× 1G + 2× 10G SFP+ | silver | six-grid
  // Key US24PRO2 für Rückwärtskompatibilität beibehalten
  US24PRO2: {
    kind: "switch", frontStyle: "six-grid",
    rows: [range(1, 6), range(7, 12), range(13, 18), range(19, 24)],
    portCount: 26, displayModel: "USW Pro 24", theme: "silver",
    specialSlots: [
      { key: "sfp_1", label: "SFP+ 1", port: 25 },
      { key: "sfp_2", label: "SFP+ 2", port: 26 },
    ],
  },

  // USW Pro 24 PoE  24× 1G (16× PoE+, 8× PoE++) + 2× 10G SFP+ | silver | six-grid
  USWPRO24POE: {
    kind: "switch", frontStyle: "six-grid",
    rows: [range(1, 6), range(7, 12), range(13, 18), range(19, 24)],
    portCount: 26, displayModel: "USW Pro 24 PoE", theme: "silver",
    specialSlots: [
      { key: "sfp_1", label: "SFP+ 1", port: 25 },
      { key: "sfp_2", label: "SFP+ 2", port: 26 },
    ],
  },

  // USW Pro Max 24 PoE  16× 1G + 8× 2.5G PoE++ + 2× 10G SFP+ | silver | six-grid
  USWPROMAX24POE: {
    kind: "switch", frontStyle: "six-grid",
    rows: [range(1, 6), range(7, 12), range(13, 18), range(19, 24)],
    portCount: 26, displayModel: "USW Pro Max 24 PoE", theme: "silver",
    specialSlots: [
      { key: "sfp_1", label: "SFP+ 1", port: 25 },
      { key: "sfp_2", label: "SFP+ 2", port: 26 },
    ],
  },

  // USW Pro Max 24 (non-PoE)  16× 1G + 8× 2.5G + 2× 10G SFP+ | silver | six-grid
  USWPROMAX24: {
    kind: "switch", frontStyle: "six-grid",
    rows: [range(1, 6), range(7, 12), range(13, 18), range(19, 24)],
    portCount: 26, displayModel: "USW Pro Max 24", theme: "silver",
    specialSlots: [
      { key: "sfp_1", label: "SFP+ 1", port: 25 },
      { key: "sfp_2", label: "SFP+ 2", port: 26 },
    ],
  },

  // USW Pro HD 24 PoE  2× 10G + 22× 2.5G PoE++ + 4× 10G SFP+ | silver | six-grid
  USWPROHD24POE: {
    kind: "switch", frontStyle: "six-grid",
    rows: [range(1, 6), range(7, 12), range(13, 18), range(19, 24)],
    portCount: 28, displayModel: "USW Pro HD 24 PoE", theme: "silver",
    specialSlots: [
      { key: "sfp_1", label: "SFP+ 1", port: 25 },
      { key: "sfp_2", label: "SFP+ 2", port: 26 },
      { key: "sfp_3", label: "SFP+ 3", port: 27 },
      { key: "sfp_4", label: "SFP+ 4", port: 28 },
    ],
  },

  // USW Pro HD 24 (non-PoE)  24× 2.5G + 4× 10G SFP+ | silver | six-grid
  USWPROHD24: {
    kind: "switch", frontStyle: "six-grid",
    rows: [range(1, 6), range(7, 12), range(13, 18), range(19, 24)],
    portCount: 28, displayModel: "USW Pro HD 24", theme: "silver",
    specialSlots: [
      { key: "sfp_1", label: "SFP+ 1", port: 25 },
      { key: "sfp_2", label: "SFP+ 2", port: 26 },
      { key: "sfp_3", label: "SFP+ 3", port: 27 },
      { key: "sfp_4", label: "SFP+ 4", port: 28 },
    ],
  },

  // USW Pro XG 24 PoE  8× 2.5G + 16× 10G PoE+++ + 2× 25G SFP28 | silver | six-grid
  USWPROXG24POE: {
    kind: "switch", frontStyle: "six-grid",
    rows: [range(1, 6), range(7, 12), range(13, 18), range(19, 24)],
    portCount: 26, displayModel: "USW Pro XG 24 PoE", theme: "silver",
    specialSlots: [
      { key: "sfp_1", label: "SFP28 1", port: 25 },
      { key: "sfp_2", label: "SFP28 2", port: 26 },
    ],
  },

  // USW Pro XG 24 (non-PoE)  8× 2.5G + 16× 10G + 2× 25G SFP28 | silver | six-grid
  USWPROXG24: {
    kind: "switch", frontStyle: "six-grid",
    rows: [range(1, 6), range(7, 12), range(13, 18), range(19, 24)],
    portCount: 26, displayModel: "USW Pro XG 24", theme: "silver",
    specialSlots: [
      { key: "sfp_1", label: "SFP28 1", port: 25 },
      { key: "sfp_2", label: "SFP28 2", port: 26 },
    ],
  },

  // ════════════════════════════════════════════════════════
  // 48-PORT SWITCHES  (alle: quad-row → repeat(12), 4 Zeilen à 12)
  // ════════════════════════════════════════════════════════

  // USW 48 PoE (Standard Gen2)  48× 1G (32× PoE+) + 4× 1G SFP | silver | quad-row
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

  // USW 48 (Standard Gen2, non-PoE)  48× 1G + 4× 1G SFP | silver | quad-row
  USW48: {
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

  // US 48 (Gen1, non-PoE)  48× 1G + 2× SFP + 2× SFP+ | silver | quad-row
  US48: {
    kind: "switch", frontStyle: "quad-row",
    rows: [range(1, 12), range(13, 24), range(25, 36), range(37, 48)],
    portCount: 52, displayModel: "US 48", theme: "silver",
    specialSlots: [
      { key: "sfp_1", label: "SFP 1",  port: 49 },
      { key: "sfp_2", label: "SFP 2",  port: 50 },
      { key: "sfp_3", label: "SFP+ 1", port: 51 },
      { key: "sfp_4", label: "SFP+ 2", port: 52 },
    ],
  },

  // US 48 500W (Gen1, PoE)  48× 1G PoE + 2× SFP + 2× SFP+ | silver | quad-row
  US48500W: {
    kind: "switch", frontStyle: "quad-row",
    rows: [range(1, 12), range(13, 24), range(25, 36), range(37, 48)],
    portCount: 52, displayModel: "US 48 500W", theme: "silver",
    specialSlots: [
      { key: "sfp_1", label: "SFP 1",  port: 49 },
      { key: "sfp_2", label: "SFP 2",  port: 50 },
      { key: "sfp_3", label: "SFP+ 1", port: 51 },
      { key: "sfp_4", label: "SFP+ 2", port: 52 },
    ],
  },

  // US 48 750W (Gen1, PoE Hi-Power)  48× 1G PoE + 2× SFP + 2× SFP+ | silver | quad-row
  US48750W: {
    kind: "switch", frontStyle: "quad-row",
    rows: [range(1, 12), range(13, 24), range(25, 36), range(37, 48)],
    portCount: 52, displayModel: "US 48 750W", theme: "silver",
    specialSlots: [
      { key: "sfp_1", label: "SFP 1",  port: 49 },
      { key: "sfp_2", label: "SFP 2",  port: 50 },
      { key: "sfp_3", label: "SFP+ 1", port: 51 },
      { key: "sfp_4", label: "SFP+ 2", port: 52 },
    ],
  },

  // USW Pro 48 (non-PoE)  48× 1G + 4× 10G SFP+ | silver | quad-row
  USWPRO48: {
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

  // USW Pro 48 PoE  48× 1G (40× PoE+, 8× PoE++) + 4× 10G SFP+ | silver | quad-row
  USWPRO48POE: {
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

  // USW Pro Max 48 PoE  32× 1G + 16× 2.5G PoE++ + 4× 10G SFP+ | silver | quad-row
  USWPROMAX48POE: {
    kind: "switch", frontStyle: "quad-row",
    rows: [range(1, 12), range(13, 24), range(25, 36), range(37, 48)],
    portCount: 52, displayModel: "USW Pro Max 48 PoE", theme: "silver",
    specialSlots: [
      { key: "sfp_1", label: "SFP+ 1", port: 49 },
      { key: "sfp_2", label: "SFP+ 2", port: 50 },
      { key: "sfp_3", label: "SFP+ 3", port: 51 },
      { key: "sfp_4", label: "SFP+ 4", port: 52 },
    ],
  },

  // USW Pro Max 48 (non-PoE)  32× 1G + 16× 2.5G + 4× 10G SFP+ | silver | quad-row
  USWPROMAX48: {
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

  // USW Enterprise 48 PoE  48× 2.5G PoE+ + 4× 10G SFP+ | silver | quad-row
  USWENTERPRISE48POE: {
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

  // USW Pro XG 48 PoE  16× 2.5G + 32× 10G PoE+++ + 4× 25G SFP28 | silver | quad-row
  USWPROXG48POE: {
    kind: "switch", frontStyle: "quad-row",
    rows: [range(1, 12), range(13, 24), range(25, 36), range(37, 48)],
    portCount: 52, displayModel: "USW Pro XG 48 PoE", theme: "silver",
    specialSlots: [
      { key: "sfp_1", label: "SFP28 1", port: 49 },
      { key: "sfp_2", label: "SFP28 2", port: 50 },
      { key: "sfp_3", label: "SFP28 3", port: 51 },
      { key: "sfp_4", label: "SFP28 4", port: 52 },
    ],
  },

  // USW Pro XG 48 (non-PoE)  16× 2.5G + 32× 10G + 4× 25G SFP28 | silver | quad-row
  USWPROXG48: {
    kind: "switch", frontStyle: "quad-row",
    rows: [range(1, 12), range(13, 24), range(25, 36), range(37, 48)],
    portCount: 52, displayModel: "USW Pro XG 48", theme: "silver",
    specialSlots: [
      { key: "sfp_1", label: "SFP28 1", port: 49 },
      { key: "sfp_2", label: "SFP28 2", port: 50 },
      { key: "sfp_3", label: "SFP28 3", port: 51 },
      { key: "sfp_4", label: "SFP28 4", port: 52 },
    ],
  },

  // ════════════════════════════════════════════════════════
  // USW ULTRA FAMILY
  // 7× 1G RJ45 (6× PoE) + 1× 10G SFP+ als "uplink" Slot
  // ultra-row → repeat(7)  |  white
  // ════════════════════════════════════════════════════════

  USWULTRA: {
    kind: "switch", frontStyle: "ultra-row", rows: [range(1, 7)],
    portCount: 7, displayModel: "USW Ultra", theme: "white",
    specialSlots: [{ key: "uplink", label: "Uplink" }],
  },
  USWULTRA60W: {
    kind: "switch", frontStyle: "ultra-row", rows: [range(1, 7)],
    portCount: 7, displayModel: "USW Ultra 60W", theme: "white",
    specialSlots: [{ key: "uplink", label: "Uplink" }],
  },
  USWULTRA210W: {
    kind: "switch", frontStyle: "ultra-row", rows: [range(1, 7)],
    portCount: 7, displayModel: "USW Ultra 210W", theme: "white",
    specialSlots: [{ key: "uplink", label: "Uplink" }],
  },

  // ════════════════════════════════════════════════════════
  // CLOUD GATEWAYS — KOMPAKT / DESKTOP
  // gateway-single-row → repeat(8)  |  gateway-compact → repeat(5)
  // ════════════════════════════════════════════════════════

  // UCG-Ultra / UDRULT  5 Ports: 4× 1G LAN (1–4) + 1× 2.5G WAN (5) | white | gateway-single-row
  UDRULT: {
    kind: "gateway", frontStyle: "gateway-single-row", rows: [[1, 2, 3, 4]],
    portCount: 5, displayModel: "Cloud Gateway Ultra", theme: "white",
    specialSlots: [{ key: "wan", label: "WAN", port: 5 }],
  },
  UCGULTRA: {
    kind: "gateway", frontStyle: "gateway-single-row", rows: [[1, 2, 3, 4]],
    portCount: 5, displayModel: "Cloud Gateway Ultra", theme: "white",
    specialSlots: [{ key: "wan", label: "WAN", port: 5 }],
  },

  // UCG-Max  5 Ports: 4× 2.5G LAN (1–4) + 1× 2.5G WAN (5) | white | gateway-single-row
  UCGMAX: {
    kind: "gateway", frontStyle: "gateway-single-row", rows: [[1, 2, 3, 4]],
    portCount: 5, displayModel: "Cloud Gateway Max", theme: "white",
    specialSlots: [{ key: "wan", label: "WAN", port: 5 }],
  },

  // UCG-Fiber  7 Ports: 4× 2.5G LAN (1–4), 1× 10G SFP+ (5), 1× 10G RJ45 WAN (6), 1× 10G SFP+ WAN2 (7)
  // | white | gateway-single-row (LAN-Ports in rows, SFP/WAN als specialSlots)
  UCGFIBER: {
    kind: "gateway", frontStyle: "gateway-single-row", rows: [[1, 2, 3, 4]],
    portCount: 7, displayModel: "Cloud Gateway Fiber", theme: "white",
    specialSlots: [
      { key: "sfp_1", label: "SFP+ 1", port: 5 },
      { key: "wan",   label: "WAN",    port: 6 },
      { key: "sfp_2", label: "SFP+ 2", port: 7 },
    ],
  },

  // UCG-Industrial  6 Ports: 5× 1G LAN (1–5) + 1× 10G SFP+ WAN (6) | silver | gateway-single-row
  UCGINDUSTRIAL: {
    kind: "gateway", frontStyle: "gateway-single-row", rows: [[1, 2, 3, 4, 5]],
    portCount: 6, displayModel: "Cloud Gateway Industrial", theme: "silver",
    specialSlots: [{ key: "sfp_1", label: "SFP+ WAN", port: 6 }],
  },

  // UDR  Dream Router (Wi-Fi 6)  5 Ports: 1× 1G WAN (1) + 4× 1G LAN (2–5, 2× PoE)
  // | white | gateway-single-row  (WAN als specialSlot links, LAN-Ports in rows)
  UDR: {
    kind: "gateway", frontStyle: "gateway-single-row", rows: [[2, 3, 4, 5]],
    portCount: 5, displayModel: "Dream Router", theme: "white",
    specialSlots: [{ key: "wan", label: "WAN", port: 1 }],
  },

  // UDR7  Dream Router 7 (Wi-Fi 7)  5 Ports: 3× 2.5G LAN (1–3, 1× PoE) + 1× 2.5G WAN (4) + 1× 10G SFP+ WAN2 (5)
  // | white | gateway-single-row
  UDR7: {
    kind: "gateway", frontStyle: "gateway-single-row", rows: [[1, 2, 3]],
    portCount: 5, displayModel: "Dream Router 7", theme: "white",
    specialSlots: [
      { key: "wan",   label: "WAN",    port: 4 },
      { key: "sfp_1", label: "SFP+ 1", port: 5 },
    ],
  },

  // UX  UniFi Express (Wi-Fi 6)  2 Ports: 1× 1G LAN (1) + 1× 1G WAN (2)
  // | white | gateway-compact (repeat(5) → passt für 1–3 sichtbare Ports)
  UX: {
    kind: "gateway", frontStyle: "gateway-compact", rows: [[1]],
    portCount: 2, displayModel: "UniFi Express", theme: "white",
    specialSlots: [{ key: "wan", label: "WAN", port: 2 }],
  },

  // UX7  UniFi Express 7 (Wi-Fi 7)  2 Ports: 1× 2.5G LAN (1) + 1× 10G SFP+ WAN (2)
  // | white | gateway-compact
  UX7: {
    kind: "gateway", frontStyle: "gateway-compact", rows: [[1]],
    portCount: 2, displayModel: "UniFi Express 7", theme: "white",
    specialSlots: [{ key: "sfp_1", label: "SFP+ WAN", port: 2 }],
  },

  // ════════════════════════════════════════════════════════
  // CLOUD GATEWAYS — RACK (1U)
  // gateway-rack → repeat(8)  |  silver
  // ════════════════════════════════════════════════════════

  // UDM-Pro  1U Rack  11 Ports: 8× 1G LAN (1–8) + 1× 1G WAN (9) + 2× 10G SFP+ (10–11)
  // | silver | gateway-rack
  UDMPRO: {
    kind: "gateway", frontStyle: "gateway-rack", rows: [range(1, 8)],
    portCount: 11, displayModel: "UDM Pro", theme: "silver",
    specialSlots: [
      { key: "wan",   label: "WAN",    port: 9  },
      { key: "sfp_1", label: "SFP+ 1", port: 10 },
      { key: "sfp_2", label: "SFP+ 2", port: 11 },
    ],
  },

  // UDM-SE  1U Rack  11 Ports: 8× 1G LAN (1–8) + 1× 2.5G WAN (9) + 2× 10G SFP+ (10–11)
  // + PoE auf LAN-Ports  | silver | gateway-rack
  UDMSE: {
    kind: "gateway", frontStyle: "gateway-rack", rows: [range(1, 8)],
    portCount: 11, displayModel: "UDM SE", theme: "silver",
    specialSlots: [
      { key: "wan",   label: "WAN",    port: 9  },
      { key: "sfp_1", label: "SFP+ 1", port: 10 },
      { key: "sfp_2", label: "SFP+ 2", port: 11 },
    ],
  },

  // UDM-Pro-Max  1U Rack  11 Ports: 8× 1G LAN (1–8) + 1× 2.5G WAN (9) + 2× 10G SFP+ (10–11)
  // | silver | gateway-rack
  UDMPROMAX: {
    kind: "gateway", frontStyle: "gateway-rack", rows: [range(1, 8)],
    portCount: 11, displayModel: "UDM Pro Max", theme: "silver",
    specialSlots: [
      { key: "wan",   label: "WAN",    port: 9  },
      { key: "sfp_1", label: "SFP+ 1", port: 10 },
      { key: "sfp_2", label: "SFP+ 2", port: 11 },
    ],
  },

  // UXG-Pro  1U Rack  4 Ports: 2× 1G RJ45 (1–2) + 2× 10G SFP+ (3–4), alle remappable
  // | silver | gateway-single-row (nur 2 LAN-Ports in rows)
  UXGPRO: {
    kind: "gateway", frontStyle: "gateway-single-row", rows: [[1, 2]],
    portCount: 4, displayModel: "UXG Pro", theme: "silver",
    specialSlots: [
      { key: "sfp_1", label: "SFP+ 1", port: 3 },
      { key: "sfp_2", label: "SFP+ 2", port: 4 },
    ],
  },

  // UXG-Lite  kompakter Desktop  2 Ports: 1× 1G LAN (1) + 1× 1G WAN (2) | white | gateway-compact
  UXGLITE: {
    kind: "gateway", frontStyle: "gateway-compact", rows: [[1]],
    portCount: 2, displayModel: "UXG Lite", theme: "white",
    specialSlots: [{ key: "wan", label: "WAN", port: 2 }],
  },

  // UXG-Max  Desktop  5 Ports: 4× 1G LAN (1–4) + 1× 10G SFP+ (5) | white | gateway-single-row
  UXGMAX: {
    kind: "gateway", frontStyle: "gateway-single-row", rows: [[1, 2, 3, 4]],
    portCount: 5, displayModel: "UXG Max", theme: "white",
    specialSlots: [{ key: "sfp_1", label: "SFP+ 1", port: 5 }],
  },

  // UXG-Enterprise  1U Rack  6 Ports: 4× 10G RJ45 (1–4) + 2× 25G SFP28 (5–6)
  // | silver | gateway-rack
  UXGENTERPRISE: {
    kind: "gateway", frontStyle: "gateway-rack", rows: [[1, 2, 3, 4]],
    portCount: 6, displayModel: "UXG Enterprise", theme: "silver",
    specialSlots: [
      { key: "sfp_1", label: "SFP28 1", port: 5 },
      { key: "sfp_2", label: "SFP28 2", port: 6 },
    ],
  },

  // EFG  Enterprise Fortress Gateway  10 Ports: 8× 10G RJ45 (1–8) + 2× 25G SFP28 (9–10)
  // | silver | gateway-rack
  EFG: {
    kind: "gateway", frontStyle: "gateway-rack", rows: [range(1, 8)],
    portCount: 10, displayModel: "Enterprise Fortress Gateway", theme: "silver",
    specialSlots: [
      { key: "sfp_1", label: "SFP28 1", port: 9  },
      { key: "sfp_2", label: "SFP28 2", port: 10 },
    ],
  },

};

// ════════════════════════════════════════════════════════
// resolveModelKey — mappt Gerät-String → MODEL_REGISTRY-Key
// Reihenfolge: spezifisch vor generisch, länger vor kürzer
// ════════════════════════════════════════════════════════
export function resolveModelKey(device) {
  const candidates = [device?.model, device?.hw_version, device?.name, device?.name_by_user]
    .filter(Boolean)
    .map(normalizeModelKey);

  for (const candidate of candidates) {
    if (!candidate) continue;

    // Direkter Registry-Hit (HA liefert exakten Key)
    if (MODEL_REGISTRY[candidate]) return candidate;

    // ── Flex Mini / Flex ────────────────────────────────────────────
    if (candidate.includes("USWFLEXMINI") || candidate.includes("FLEXMINI") || candidate.includes("USMINI")) return "USMINI";

    // Flex Mini 2.5G (5p) vor Flex 2.5G (8p): "5" im String-Kandidat
    if (candidate.includes("FLEX25G5") || (candidate.includes("FLEX") && candidate.includes("25G") && (candidate.endsWith("5") || candidate.includes("MINI")))) return "USWFLEX25G5";
    if (candidate.includes("FLEX25G8") || (candidate.includes("FLEX") && candidate.includes("25G") && candidate.includes("8"))) return "USWFLEX25G8";
    if (candidate.includes("FLEX") && candidate.includes("25G"))              return "USWFLEX25G5"; // Fallback: 5-Port Mini

    if (candidate.includes("FLEXXG"))                                         return "USWFLEXXG";
    if (candidate.includes("USWFLEX") && !candidate.includes("25G") && !candidate.includes("XG") && !candidate.includes("MINI")) return "USWFLEX";

    // ── Lite 8 PoE ──────────────────────────────────────────────────
    if (candidate.includes("USL8LPB"))                                        return "USL8LPB";
    if (candidate.includes("USL8LP"))                                         return "USL8LP";
    if (candidate.includes("USWLITE8"))                                       return "USL8LPB";
    if (candidate.includes("LITE") && candidate.includes("8") && candidate.includes("POE")) return "USL8LPB";

    // ── Lite 16 PoE ─────────────────────────────────────────────────
    if (candidate.includes("USL16LPB"))                                       return "USL16LPB";
    if (candidate.includes("USL16LP"))                                        return "USL16LP";
    if (candidate.includes("USWLITE16"))                                      return "USL16LPB";
    if (candidate.includes("LITE") && candidate.includes("16") && candidate.includes("POE")) return "USL16LPB";

    // ── US 8 legacy ─────────────────────────────────────────────────
    if (candidate.includes("US8P60") || candidate.includes("US860W"))        return "US8P60";
    if (candidate.includes("US8150W") || candidate.includes("US8POE150"))    return "US8150W";
    if (candidate === "US8")                                                  return "US8";

    // ── Pro XG 8 PoE ────────────────────────────────────────────────
    if ((candidate.includes("PROXG8") || candidate.includes("USWPROXG8")) && candidate.includes("POE")) return "USWPROXG8POE";

    // ── Enterprise 8 / Pro 8 ────────────────────────────────────────
    if (candidate.includes("ENTERPRISE8"))                                    return "USWENTERPRISE8POE";
    if ((candidate.includes("USWPRO8") || (candidate.includes("PRO8") && !candidate.includes("MAX") && !candidate.includes("XG"))) && candidate.includes("POE")) return "USWPRO8POE";

    // ── Standard 16 PoE Gen2 ────────────────────────────────────────
    if (candidate.includes("USW16P") || candidate.includes("USW16POE"))      return "USW16POE";

    // ── US 16 PoE 150W Gen1 ─────────────────────────────────────────
    if (candidate.includes("US16P150") || candidate.includes("US16POE150"))  return "US16P150";
    if (candidate.includes("US16P"))                                          return "US16P150";

    // ── Pro Max 16 ──────────────────────────────────────────────────
    if ((candidate.includes("PROMAX16") || candidate.includes("USWPROMAX16")) && candidate.includes("POE")) return "USWPROMAX16POE";
    if (candidate.includes("PROMAX16") || candidate.includes("USWPROMAX16")) return "USWPROMAX16";

    // ── Pro XG 10 PoE ───────────────────────────────────────────────
    if (candidate.includes("PROXG10") || candidate.includes("USWPROXG10"))   return "USWPROXG10POE";

    // ── Pro XG 48 — vor Enterprise 48 und Pro 48 ────────────────────
    if ((candidate.includes("PROXG48") || candidate.includes("USWPROXG48")) && candidate.includes("POE")) return "USWPROXG48POE";
    if (candidate.includes("PROXG48") || candidate.includes("USWPROXG48"))   return "USWPROXG48";

    // ── Enterprise 48 PoE ───────────────────────────────────────────
    if (candidate.includes("ENTERPRISE48"))                                   return "USWENTERPRISE48POE";

    // ── Pro Max 48 — vor Pro 48 ─────────────────────────────────────
    if ((candidate.includes("PROMAX48") || candidate.includes("USWPROMAX48")) && candidate.includes("POE")) return "USWPROMAX48POE";
    if (candidate.includes("PROMAX48") || candidate.includes("USWPROMAX48")) return "USWPROMAX48";

    // ── Pro 48 PoE / Pro 48 ─────────────────────────────────────────
    if ((candidate.includes("USWPRO48") || (candidate.includes("PRO48") && !candidate.includes("MAX") && !candidate.includes("XG"))) && candidate.includes("POE")) return "USWPRO48POE";
    if (candidate.includes("USWPRO48") || (candidate.includes("PRO48") && !candidate.includes("MAX") && !candidate.includes("XG"))) return "USWPRO48";

    // ── Standard 48 Gen2 ────────────────────────────────────────────
    if (candidate.includes("USW48POE") || candidate.includes("USW48P"))      return "USW48P";
    if (candidate.includes("US48750"))                                        return "US48750W";
    if (candidate.includes("US48500"))                                        return "US48500W";
    if (candidate === "US48")                                                 return "US48";
    if (candidate.includes("USW48") && !candidate.includes("POE") && !candidate.includes("PRO")) return "USW48";

    // ── Pro XG 24 PoE/non-PoE — vor Pro HD 24 und Pro Max 24 ────────
    if ((candidate.includes("PROXG24") || candidate.includes("USWPROXG24")) && candidate.includes("POE")) return "USWPROXG24POE";
    if (candidate.includes("PROXG24") || candidate.includes("USWPROXG24"))   return "USWPROXG24";

    // ── Pro HD 24 PoE/non-PoE — vor Pro Max 24 ──────────────────────
    if ((candidate.includes("PROHD24") || candidate.includes("USWPROHD24")) && candidate.includes("POE")) return "USWPROHD24POE";
    if (candidate.includes("PROHD24") || candidate.includes("USWPROHD24"))   return "USWPROHD24";

    // ── Pro Max 24 — vor Pro 24 ─────────────────────────────────────
    if ((candidate.includes("PROMAX24") || candidate.includes("USWPROMAX24")) && candidate.includes("POE")) return "USWPROMAX24POE";
    if (candidate.includes("PROMAX24") || candidate.includes("USWPROMAX24")) return "USWPROMAX24";

    // ── Pro 24 PoE / Pro 24 ─────────────────────────────────────────
    if ((candidate.includes("USWPRO24") || (candidate.includes("PRO24") && !candidate.includes("MAX") && !candidate.includes("HD") && !candidate.includes("XG"))) && candidate.includes("POE")) return "USWPRO24POE";

    // USW Pro 24 / US24PRO2 Rückwärtskompatibilität
    if (candidate.includes("US24PRO2"))                                       return "US24PRO2";
    if (candidate.includes("US24PRO") || candidate.includes("USWPRO24") || candidate.includes("SWITCHPRO24")) return "US24PRO2";

    // ── Standard 24 Gen2 ────────────────────────────────────────────
    if (candidate.includes("USW24POE") || candidate.includes("USW24P"))      return "USW24P";
    if (candidate.includes("US24500"))                                        return "US24500W";
    if (candidate === "US24")                                                 return "US24";
    if (candidate.includes("USW24") && !candidate.includes("POE") && !candidate.includes("PRO")) return "USW24";

    // ── Cloud Gateways — spezifisch vor generisch ────────────────────
    if (candidate.includes("UCGFIBER") || candidate.includes("CLOUDGATEWAYFIBER"))   return "UCGFIBER";
    if (candidate.includes("UCGINDUSTRIAL") || candidate.includes("CLOUDGATEWAYINDUSTRIAL")) return "UCGINDUSTRIAL";
    if (candidate.includes("UDRULT"))                                                 return "UDRULT";
    if (candidate.includes("UCGULTRA") || candidate.includes("CLOUDGATEWAYULTRA"))   return "UCGULTRA";
    if (candidate.includes("UCGMAX") || candidate.includes("CLOUDGATEWAYMAX"))       return "UCGMAX";

    // UDM-Pro-Max vor UDM-Pro
    if (candidate.includes("UDMPROMAX") || candidate.includes("UDMPMAX"))            return "UDMPROMAX";
    if (candidate.includes("UDMPRO"))                                                 return "UDMPRO";
    if (candidate.includes("UDMSE"))                                                  return "UDMSE";

    // UXG
    if (candidate.includes("UXGENTERPRISE"))                                          return "UXGENTERPRISE";
    if (candidate.includes("UXGPRO"))                                                 return "UXGPRO";
    if (candidate.includes("UXGMAX"))                                                 return "UXGMAX";
    if (candidate.includes("UXGLITE"))                                                return "UXGLITE";

    // EFG
    if (candidate === "EFG" || candidate.includes("ENTERPRISEFORTRESS"))             return "EFG";

    // UDR7 vor UDR
    if (candidate === "UDR7" || candidate.includes("UDR7") || candidate.includes("DREAMROUTER7")) return "UDR7";
    if (candidate === "UDR"  || candidate.includes("DREAMROUTER"))                   return "UDR";

    // UX7 vor UX
    if (candidate === "UX7"  || candidate.includes("UX7") || candidate.includes("UNIFIEXPRESS7")) return "UX7";
    if (candidate === "UX"   || candidate.includes("UNIFIEXPRESS"))                  return "UX";

    // ── USW Ultra ───────────────────────────────────────────────────
    if (candidate === "USWULTRA210W" || candidate.includes("USWULTRA210") || candidate.includes("SWITCHULTRA210")) return "USWULTRA210W";
    if (candidate === "USWULTRA60W"  || candidate.includes("USWULTRA60")  || candidate.includes("SWITCHULTRA60"))  return "USWULTRA60W";
    if (candidate === "USWULTRA"     || candidate.includes("USWULTRA")    || candidate.includes("SWITCHULTRA"))    return "USWULTRA";
  }

  return null;
}

// ════════════════════════════════════════════════════════
// inferPortCountFromModel — Fallback wenn kein Registry-Hit
// ════════════════════════════════════════════════════════
export function inferPortCountFromModel(device) {
  const text = normalizeModelKey(
    [device?.model, device?.name, device?.name_by_user].filter(Boolean).join(" ")
  );

  if (text.includes("USL16LPB") || text.includes("USL16LP") || text.includes("USWLITE16")) return 16;
  if (text.includes("USL8LPB")  || text.includes("USL8LP")  || text.includes("USWLITE8"))  return 8;
  if (text.includes("US8P60")   || text.includes("US860W")  || text.includes("US8"))       return 8;
  if (text.includes("USMINI")   || text.includes("FLEXMINI"))                               return 5;
  if (text.includes("FLEX25G5") || (text.includes("FLEX") && text.includes("25G5")))        return 5;
  if (text.includes("FLEX25G8") || (text.includes("FLEX") && text.includes("25G8")))        return 8;

  if (text.includes("US16P150") || text.includes("US16P"))   return 18;
  if (text.includes("PROXG10"))                               return 12;

  // 24-Port-Modelle mit SFP → 26 oder 28
  if (text.includes("PROHD24"))                               return 28;
  if (text.includes("US24PRO2") || text.includes("US24PRO") || text.includes("USWPRO24") ||
      text.includes("PROMAX24") || text.includes("PROXG24")) return 26;

  // 48-Port-Modelle mit SFP → 52
  if (text.includes("USWPRO48") || text.includes("PRO48") ||
      text.includes("PROMAX48") || text.includes("PROXG48") ||
      text.includes("ENTERPRISE48") || text.includes("USW48")) return 52;

  // Cloud Gateways — UCGFIBER vor UCGULTRA/UCGMAX
  if (text.includes("UCGFIBER") || text.includes("CLOUDGATEWAYFIBER"))  return 7;
  if (text.includes("UCGINDUSTRIAL"))                                    return 6;
  if (text.includes("UCGULTRA") || text.includes("CLOUDGATEWAYULTRA") || text.includes("UDRULT")) return 5;
  if (text.includes("UCGMAX")   || text.includes("CLOUDGATEWAYMAX"))   return 5;
  if (text.includes("UDMPROMAX") || text.includes("UDMPMAX"))           return 11;
  if (text.includes("UDMPRO")   || text.includes("UDMSE"))              return 11;
  if (text.includes("UXGENTERPRISE"))                                    return 6;
  if (text.includes("UXGPRO"))                                           return 4;
  if (text.includes("UXGMAX"))                                           return 5;
  if (text.includes("UDR7"))                                             return 5;
  if (text.includes("UDR"))                                              return 5;
  if (text.includes("USWULTRA"))                                         return 7;

  // Generische Zahlen-Erkennung (muss am Ende stehen)
  if (text.includes("48"))   return 52;
  if (text.includes("24"))   return 26;
  if (text.includes("16"))   return 18;

  return null;
}

// ════════════════════════════════════════════════════════
// getDeviceLayout — öffentliche API für helpers.js
// ════════════════════════════════════════════════════════
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
