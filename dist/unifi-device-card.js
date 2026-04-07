/* UniFi Device Card 0.0.0-dev.84ccad0 */
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

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
  if (portCount <= 16) {
    return { kind: "switch", frontStyle: "dual-row", rows: [oddRange(1, 16), evenRange(1, 16)], portCount, specialSlots: [] };
  }
  if (portCount <= 24) {
    return { kind: "switch", frontStyle: "six-grid", rows: [range(1, 6), range(7, 12), range(13, 18), range(19, 24)], portCount, specialSlots: [] };
  }
  if (portCount <= 48) {
    return { kind: "switch", frontStyle: "quad-row", rows: [range(1, 12), range(13, 24), range(25, 36), range(37, 48)], portCount, specialSlots: [] };
  }
  return { kind: "switch", frontStyle: "single-row", rows: [range(1, portCount)], portCount, specialSlots: [] };
}
function resolveModelKey(device) {
  const candidates = [device?.model, device?.hw_version, device?.name, device?.name_by_user].filter(Boolean).map(normalizeModelKey);
  for (const candidate of candidates) {
    if (!candidate) continue;
    if (MODEL_REGISTRY[candidate]) return candidate;
    if (candidate.includes("USWFLEXMINI") || candidate.includes("FLEXMINI") || candidate.includes("USMINI")) return "USMINI";
    if (candidate.includes("FLEX25G5") || candidate.includes("FLEX") && candidate.includes("25G") && (candidate.endsWith("5") || candidate.includes("MINI"))) return "USWFLEX25G5";
    if (candidate.includes("FLEX25G8") || candidate.includes("FLEX") && candidate.includes("25G") && candidate.includes("8")) return "USWFLEX25G8";
    if (candidate.includes("FLEX") && candidate.includes("25G")) return "USWFLEX25G5";
    if (candidate.includes("FLEXXG")) return "USWFLEXXG";
    if (candidate.includes("USWFLEX") && !candidate.includes("25G") && !candidate.includes("XG") && !candidate.includes("MINI")) return "USWFLEX";
    if (candidate.includes("USL8LPB")) return "USL8LPB";
    if (candidate.includes("USL8LP")) return "USL8LP";
    if (candidate.includes("USWLITE8")) return "USL8LPB";
    if (candidate.includes("LITE") && candidate.includes("8") && candidate.includes("POE")) return "USL8LPB";
    if (candidate.includes("USL16LPB")) return "USL16LPB";
    if (candidate.includes("USL16LP")) return "USL16LP";
    if (candidate.includes("USWLITE16")) return "USL16LPB";
    if (candidate.includes("LITE") && candidate.includes("16") && candidate.includes("POE")) return "USL16LPB";
    if (candidate.includes("US8P60") || candidate.includes("US860W")) return "US8P60";
    if (candidate.includes("US8150W") || candidate.includes("US8POE150")) return "US8150W";
    if (candidate === "US8") return "US8";
    if ((candidate.includes("PROXG8") || candidate.includes("USWPROXG8")) && candidate.includes("POE")) return "USWPROXG8POE";
    if (candidate.includes("ENTERPRISE8")) return "USWENTERPRISE8POE";
    if ((candidate.includes("USWPRO8") || candidate.includes("PRO8") && !candidate.includes("MAX") && !candidate.includes("XG")) && candidate.includes("POE")) return "USWPRO8POE";
    if (candidate.includes("USW16P") || candidate.includes("USW16POE")) return "USW16POE";
    if (candidate.includes("US16P150") || candidate.includes("US16POE150")) return "US16P150";
    if (candidate.includes("US16P")) return "US16P150";
    if ((candidate.includes("PROMAX16") || candidate.includes("USWPROMAX16")) && candidate.includes("POE")) return "USWPROMAX16POE";
    if (candidate.includes("PROMAX16") || candidate.includes("USWPROMAX16")) return "USWPROMAX16";
    if (candidate.includes("PROXG10") || candidate.includes("USWPROXG10")) return "USWPROXG10POE";
    if ((candidate.includes("PROXG48") || candidate.includes("USWPROXG48")) && candidate.includes("POE")) return "USWPROXG48POE";
    if (candidate.includes("PROXG48") || candidate.includes("USWPROXG48")) return "USWPROXG48";
    if (candidate.includes("ENTERPRISE48")) return "USWENTERPRISE48POE";
    if ((candidate.includes("PROMAX48") || candidate.includes("USWPROMAX48")) && candidate.includes("POE")) return "USWPROMAX48POE";
    if (candidate.includes("PROMAX48") || candidate.includes("USWPROMAX48")) return "USWPROMAX48";
    if ((candidate.includes("USWPRO48") || candidate.includes("PRO48") && !candidate.includes("MAX") && !candidate.includes("XG")) && candidate.includes("POE")) return "USWPRO48POE";
    if (candidate.includes("USWPRO48") || candidate.includes("PRO48") && !candidate.includes("MAX") && !candidate.includes("XG")) return "USWPRO48";
    if (candidate.includes("USW48POE") || candidate.includes("USW48P")) return "USW48P";
    if (candidate.includes("US48750")) return "US48750W";
    if (candidate.includes("US48500")) return "US48500W";
    if (candidate === "US48") return "US48";
    if (candidate.includes("USW48") && !candidate.includes("POE") && !candidate.includes("PRO")) return "USW48";
    if ((candidate.includes("PROXG24") || candidate.includes("USWPROXG24")) && candidate.includes("POE")) return "USWPROXG24POE";
    if (candidate.includes("PROXG24") || candidate.includes("USWPROXG24")) return "USWPROXG24";
    if ((candidate.includes("PROHD24") || candidate.includes("USWPROHD24")) && candidate.includes("POE")) return "USWPROHD24POE";
    if (candidate.includes("PROHD24") || candidate.includes("USWPROHD24")) return "USWPROHD24";
    if ((candidate.includes("PROMAX24") || candidate.includes("USWPROMAX24")) && candidate.includes("POE")) return "USWPROMAX24POE";
    if (candidate.includes("PROMAX24") || candidate.includes("USWPROMAX24")) return "USWPROMAX24";
    if ((candidate.includes("USWPRO24") || candidate.includes("PRO24") && !candidate.includes("MAX") && !candidate.includes("HD") && !candidate.includes("XG")) && candidate.includes("POE")) return "USWPRO24POE";
    if (candidate.includes("US24PRO2")) return "US24PRO2";
    if (candidate.includes("US24PRO") || candidate.includes("USWPRO24") || candidate.includes("SWITCHPRO24")) return "US24PRO2";
    if (candidate.includes("USW24POE") || candidate.includes("USW24P")) return "USW24P";
    if (candidate.includes("US24500")) return "US24500W";
    if (candidate === "US24") return "US24";
    if (candidate.includes("USW24") && !candidate.includes("POE") && !candidate.includes("PRO")) return "USW24";
    if (candidate.includes("UCGFIBER") || candidate.includes("CLOUDGATEWAYFIBER")) return "UCGFIBER";
    if (candidate.includes("UCGINDUSTRIAL") || candidate.includes("CLOUDGATEWAYINDUSTRIAL")) return "UCGINDUSTRIAL";
    if (candidate.includes("UDRULT")) return "UDRULT";
    if (candidate.includes("UCGULTRA") || candidate.includes("CLOUDGATEWAYULTRA")) return "UCGULTRA";
    if (candidate.includes("UCGMAX") || candidate.includes("CLOUDGATEWAYMAX")) return "UCGMAX";
    if (candidate.includes("UDMPROMAX") || candidate.includes("UDMPMAX")) return "UDMPROMAX";
    if (candidate.includes("UDMPRO")) return "UDMPRO";
    if (candidate.includes("UDMSE")) return "UDMSE";
    if (candidate.includes("UXGENTERPRISE")) return "UXGENTERPRISE";
    if (candidate.includes("UXGPRO")) return "UXGPRO";
    if (candidate.includes("UXGMAX")) return "UXGMAX";
    if (candidate.includes("UXGLITE")) return "UXGLITE";
    if (candidate === "EFG" || candidate.includes("ENTERPRISEFORTRESS")) return "EFG";
    if (candidate === "UDR7" || candidate.includes("UDR7") || candidate.includes("DREAMROUTER7")) return "UDR7";
    if (candidate === "UDR" || candidate.includes("DREAMROUTER")) return "UDR";
    if (candidate === "UX7" || candidate.includes("UX7") || candidate.includes("UNIFIEXPRESS7")) return "UX7";
    if (candidate === "UX" || candidate.includes("UNIFIEXPRESS")) return "UX";
    if (candidate === "USWULTRA210W" || candidate.includes("USWULTRA210") || candidate.includes("SWITCHULTRA210")) return "USWULTRA210W";
    if (candidate === "USWULTRA60W" || candidate.includes("USWULTRA60") || candidate.includes("SWITCHULTRA60")) return "USWULTRA60W";
    if (candidate === "USWULTRA" || candidate.includes("USWULTRA") || candidate.includes("SWITCHULTRA")) return "USWULTRA";
  }
  return null;
}
function inferPortCountFromModel(device) {
  const text = normalizeModelKey(
    [device?.model, device?.name, device?.name_by_user].filter(Boolean).join(" ")
  );
  if (text.includes("USL16LPB") || text.includes("USL16LP") || text.includes("USWLITE16")) return 16;
  if (text.includes("USL8LPB") || text.includes("USL8LP") || text.includes("USWLITE8")) return 8;
  if (text.includes("US8P60") || text.includes("US860W") || text.includes("US8")) return 8;
  if (text.includes("USMINI") || text.includes("FLEXMINI")) return 5;
  if (text.includes("FLEX25G5") || text.includes("FLEX") && text.includes("25G5")) return 5;
  if (text.includes("FLEX25G8") || text.includes("FLEX") && text.includes("25G8")) return 8;
  if (text.includes("US16P150") || text.includes("US16P")) return 18;
  if (text.includes("PROXG10")) return 12;
  if (text.includes("PROHD24")) return 28;
  if (text.includes("US24PRO2") || text.includes("US24PRO") || text.includes("USWPRO24") || text.includes("PROMAX24") || text.includes("PROXG24")) return 26;
  if (text.includes("USWPRO48") || text.includes("PRO48") || text.includes("PROMAX48") || text.includes("PROXG48") || text.includes("ENTERPRISE48") || text.includes("USW48")) return 52;
  if (text.includes("UCGFIBER") || text.includes("CLOUDGATEWAYFIBER")) return 7;
  if (text.includes("UCGINDUSTRIAL")) return 6;
  if (text.includes("UCGULTRA") || text.includes("CLOUDGATEWAYULTRA") || text.includes("UDRULT")) return 5;
  if (text.includes("UCGMAX") || text.includes("CLOUDGATEWAYMAX")) return 5;
  if (text.includes("UDMPROMAX") || text.includes("UDMPMAX")) return 11;
  if (text.includes("UDMPRO") || text.includes("UDMSE")) return 11;
  if (text.includes("UXGENTERPRISE")) return 6;
  if (text.includes("UXGPRO")) return 4;
  if (text.includes("UXGMAX")) return 5;
  if (text.includes("UDR7")) return 5;
  if (text.includes("UDR")) return 5;
  if (text.includes("USWULTRA")) return 7;
  if (text.includes("48")) return 52;
  if (text.includes("24")) return 26;
  if (text.includes("16")) return 18;
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
var MODEL_REGISTRY;
var init_model_registry = __esm({
  "src/model-registry.js"() {
    MODEL_REGISTRY = {
      // ════════════════════════════════════════════════════════
      // UTILITY / FLEX / MINI
      // ════════════════════════════════════════════════════════
      // USW Flex Mini  5× 1G RJ45 | white | single-row
      USMINI: {
        kind: "switch",
        frontStyle: "single-row",
        rows: [range(1, 5)],
        portCount: 5,
        displayModel: "USW Flex Mini",
        theme: "white",
        specialSlots: []
      },
      // USW Flex Mini 2.5G  5× 2.5G RJ45 | white | single-row
      USWFLEX25G5: {
        kind: "switch",
        frontStyle: "single-row",
        rows: [range(1, 5)],
        portCount: 5,
        displayModel: "USW Flex Mini 2.5G",
        theme: "white",
        specialSlots: []
      },
      // USW Flex  5× 1G RJ45, PoE-in | white | single-row
      USWFLEX: {
        kind: "switch",
        frontStyle: "single-row",
        rows: [range(1, 5)],
        portCount: 5,
        displayModel: "USW Flex",
        theme: "white",
        specialSlots: []
      },
      // USW Flex 2.5G  8× 2.5G RJ45 | white | single-row
      USWFLEX25G8: {
        kind: "switch",
        frontStyle: "single-row",
        rows: [range(1, 8)],
        portCount: 8,
        displayModel: "USW Flex 2.5G",
        theme: "white",
        specialSlots: []
      },
      // USW Flex XG  4× 10G RJ45 + 1× SFP+ Uplink | white | single-row
      USWFLEXXG: {
        kind: "switch",
        frontStyle: "single-row",
        rows: [range(1, 4)],
        portCount: 5,
        displayModel: "USW Flex XG",
        theme: "white",
        specialSlots: [{ key: "sfp_1", label: "SFP+ 1", port: 5 }]
      },
      // ════════════════════════════════════════════════════════
      // 8-PORT SWITCHES
      // ════════════════════════════════════════════════════════
      // US 8 (Gen1, non-PoE)  8× 1G RJ45 | silver | single-row
      US8: {
        kind: "switch",
        frontStyle: "single-row",
        rows: [range(1, 8)],
        portCount: 8,
        displayModel: "US 8",
        theme: "silver",
        specialSlots: []
      },
      // US 8 60W (Gen1, PoE)  8× 1G RJ45 PoE + 2× SFP | silver | single-row
      US8P60: {
        kind: "switch",
        frontStyle: "single-row",
        rows: [range(1, 8)],
        portCount: 10,
        displayModel: "US 8 60W",
        theme: "silver",
        specialSlots: [
          { key: "sfp_1", label: "SFP 1", port: 9 },
          { key: "sfp_2", label: "SFP 2", port: 10 }
        ]
      },
      // US 8 150W (Gen1, PoE)  8× 1G RJ45 PoE + 2× SFP | silver | single-row
      US8150W: {
        kind: "switch",
        frontStyle: "single-row",
        rows: [range(1, 8)],
        portCount: 10,
        displayModel: "US 8 150W",
        theme: "silver",
        specialSlots: [
          { key: "sfp_1", label: "SFP 1", port: 9 },
          { key: "sfp_2", label: "SFP 2", port: 10 }
        ]
      },
      // USW Lite 8 PoE  8× 1G (4× PoE+) | white | single-row
      USL8LP: {
        kind: "switch",
        frontStyle: "single-row",
        rows: [range(1, 8)],
        portCount: 8,
        displayModel: "USW Lite 8 PoE",
        theme: "white",
        specialSlots: []
      },
      USL8LPB: {
        kind: "switch",
        frontStyle: "single-row",
        rows: [range(1, 8)],
        portCount: 8,
        displayModel: "USW Lite 8 PoE",
        theme: "white",
        specialSlots: []
      },
      // USW Pro 8 PoE  8× 1G PoE+ + 2× 10G SFP+ | silver | single-row
      USWPRO8POE: {
        kind: "switch",
        frontStyle: "single-row",
        rows: [range(1, 8)],
        portCount: 10,
        displayModel: "USW Pro 8 PoE",
        theme: "silver",
        specialSlots: [
          { key: "sfp_1", label: "SFP+ 1", port: 9 },
          { key: "sfp_2", label: "SFP+ 2", port: 10 }
        ]
      },
      // USW Enterprise 8 PoE  8× 2.5G PoE++ + 2× 10G SFP+ | silver | single-row
      USWENTERPRISE8POE: {
        kind: "switch",
        frontStyle: "single-row",
        rows: [range(1, 8)],
        portCount: 10,
        displayModel: "USW Enterprise 8 PoE",
        theme: "silver",
        specialSlots: [
          { key: "sfp_1", label: "SFP+ 1", port: 9 },
          { key: "sfp_2", label: "SFP+ 2", port: 10 }
        ]
      },
      // USW Pro XG 8 PoE  8× 10G PoE+++ + 2× 25G SFP28 | silver | single-row
      USWPROXG8POE: {
        kind: "switch",
        frontStyle: "single-row",
        rows: [range(1, 8)],
        portCount: 10,
        displayModel: "USW Pro XG 8 PoE",
        theme: "silver",
        specialSlots: [
          { key: "sfp_1", label: "SFP28 1", port: 9 },
          { key: "sfp_2", label: "SFP28 2", port: 10 }
        ]
      },
      // ════════════════════════════════════════════════════════
      // 16-PORT SWITCHES
      // ════════════════════════════════════════════════════════
      // USW Lite 16 PoE  16× 1G (8× PoE+) | white | dual-row (interleaved: odd top, even bottom)
      USL16LP: {
        kind: "switch",
        frontStyle: "dual-row",
        rows: [oddRange(1, 16), evenRange(1, 16)],
        portCount: 16,
        displayModel: "USW Lite 16 PoE",
        theme: "white",
        specialSlots: []
      },
      USL16LPB: {
        kind: "switch",
        frontStyle: "dual-row",
        rows: [oddRange(1, 16), evenRange(1, 16)],
        portCount: 16,
        displayModel: "USW Lite 16 PoE",
        theme: "white",
        specialSlots: []
      },
      // USW 16 PoE (Standard Gen2)  16× 1G (8× PoE+) + 2× 1G SFP | silver | dual-row sequential
      USW16POE: {
        kind: "switch",
        frontStyle: "dual-row",
        rows: [range(1, 8), range(9, 16)],
        portCount: 18,
        displayModel: "USW 16 PoE",
        theme: "silver",
        specialSlots: [
          { key: "sfp_1", label: "SFP 1", port: 17 },
          { key: "sfp_2", label: "SFP 2", port: 18 }
        ]
      },
      // US 16 PoE 150W (Gen1)  16× 1G PoE + 2× SFP | silver | dual-row sequential
      US16P150: {
        kind: "switch",
        frontStyle: "dual-row",
        rows: [range(1, 8), range(9, 16)],
        portCount: 18,
        displayModel: "US 16 PoE 150W",
        theme: "silver",
        specialSlots: [
          { key: "sfp_1", label: "SFP 1", port: 17 },
          { key: "sfp_2", label: "SFP 2", port: 18 }
        ]
      },
      // USW Pro Max 16 PoE  16× mixed 1G/2.5G PoE++ + 2× 10G SFP+ | silver | dual-row
      USWPROMAX16POE: {
        kind: "switch",
        frontStyle: "dual-row",
        rows: [range(1, 8), range(9, 16)],
        portCount: 18,
        displayModel: "USW Pro Max 16 PoE",
        theme: "silver",
        specialSlots: [
          { key: "sfp_1", label: "SFP+ 1", port: 17 },
          { key: "sfp_2", label: "SFP+ 2", port: 18 }
        ]
      },
      // USW Pro Max 16 (non-PoE)  16× mixed 1G/2.5G + 2× 10G SFP+ | silver | dual-row
      USWPROMAX16: {
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
      // USW Pro XG 10 PoE  10× 10G PoE+++ + 2× 25G SFP28 | silver | dual-row
      USWPROXG10POE: {
        kind: "switch",
        frontStyle: "dual-row",
        rows: [range(1, 5), range(6, 10)],
        portCount: 12,
        displayModel: "USW Pro XG 10 PoE",
        theme: "silver",
        specialSlots: [
          { key: "sfp_1", label: "SFP28 1", port: 11 },
          { key: "sfp_2", label: "SFP28 2", port: 12 }
        ]
      },
      // ════════════════════════════════════════════════════════
      // 24-PORT SWITCHES  (alle: six-grid → repeat(6), 4 Zeilen à 6)
      // ════════════════════════════════════════════════════════
      // USW 24 PoE (Standard Gen2)  24× 1G (16× PoE+) + 2× 1G SFP | silver | six-grid
      USW24P: {
        kind: "switch",
        frontStyle: "six-grid",
        rows: [range(1, 6), range(7, 12), range(13, 18), range(19, 24)],
        portCount: 26,
        displayModel: "USW 24 PoE",
        theme: "silver",
        specialSlots: [
          { key: "sfp_1", label: "SFP 1", port: 25 },
          { key: "sfp_2", label: "SFP 2", port: 26 }
        ]
      },
      // USW 24 (Standard Gen2, non-PoE)  24× 1G + 2× 1G SFP | silver | six-grid
      USW24: {
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
      // US 24 (Gen1, non-PoE)  24× 1G + 2× SFP | silver | six-grid
      US24: {
        kind: "switch",
        frontStyle: "six-grid",
        rows: [range(1, 6), range(7, 12), range(13, 18), range(19, 24)],
        portCount: 26,
        displayModel: "US 24",
        theme: "silver",
        specialSlots: [
          { key: "sfp_1", label: "SFP 1", port: 25 },
          { key: "sfp_2", label: "SFP 2", port: 26 }
        ]
      },
      // US 24 500W (Gen1, PoE)  24× 1G PoE + 2× SFP | silver | six-grid
      US24500W: {
        kind: "switch",
        frontStyle: "six-grid",
        rows: [range(1, 6), range(7, 12), range(13, 18), range(19, 24)],
        portCount: 26,
        displayModel: "US 24 500W",
        theme: "silver",
        specialSlots: [
          { key: "sfp_1", label: "SFP 1", port: 25 },
          { key: "sfp_2", label: "SFP 2", port: 26 }
        ]
      },
      // USW Pro 24  24× 1G + 2× 10G SFP+ | silver | six-grid
      // Key US24PRO2 für Rückwärtskompatibilität beibehalten
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
      // USW Pro 24 PoE  24× 1G (16× PoE+, 8× PoE++) + 2× 10G SFP+ | silver | six-grid
      USWPRO24POE: {
        kind: "switch",
        frontStyle: "six-grid",
        rows: [range(1, 6), range(7, 12), range(13, 18), range(19, 24)],
        portCount: 26,
        displayModel: "USW Pro 24 PoE",
        theme: "silver",
        specialSlots: [
          { key: "sfp_1", label: "SFP+ 1", port: 25 },
          { key: "sfp_2", label: "SFP+ 2", port: 26 }
        ]
      },
      // USW Pro Max 24 PoE  16× 1G + 8× 2.5G PoE++ + 2× 10G SFP+ | silver | six-grid
      USWPROMAX24POE: {
        kind: "switch",
        frontStyle: "six-grid",
        rows: [range(1, 6), range(7, 12), range(13, 18), range(19, 24)],
        portCount: 26,
        displayModel: "USW Pro Max 24 PoE",
        theme: "silver",
        specialSlots: [
          { key: "sfp_1", label: "SFP+ 1", port: 25 },
          { key: "sfp_2", label: "SFP+ 2", port: 26 }
        ]
      },
      // USW Pro Max 24 (non-PoE)  16× 1G + 8× 2.5G + 2× 10G SFP+ | silver | six-grid
      USWPROMAX24: {
        kind: "switch",
        frontStyle: "six-grid",
        rows: [range(1, 6), range(7, 12), range(13, 18), range(19, 24)],
        portCount: 26,
        displayModel: "USW Pro Max 24",
        theme: "silver",
        specialSlots: [
          { key: "sfp_1", label: "SFP+ 1", port: 25 },
          { key: "sfp_2", label: "SFP+ 2", port: 26 }
        ]
      },
      // USW Pro HD 24 PoE  2× 10G + 22× 2.5G PoE++ + 4× 10G SFP+ | silver | six-grid
      USWPROHD24POE: {
        kind: "switch",
        frontStyle: "six-grid",
        rows: [range(1, 6), range(7, 12), range(13, 18), range(19, 24)],
        portCount: 28,
        displayModel: "USW Pro HD 24 PoE",
        theme: "silver",
        specialSlots: [
          { key: "sfp_1", label: "SFP+ 1", port: 25 },
          { key: "sfp_2", label: "SFP+ 2", port: 26 },
          { key: "sfp_3", label: "SFP+ 3", port: 27 },
          { key: "sfp_4", label: "SFP+ 4", port: 28 }
        ]
      },
      // USW Pro HD 24 (non-PoE)  24× 2.5G + 4× 10G SFP+ | silver | six-grid
      USWPROHD24: {
        kind: "switch",
        frontStyle: "six-grid",
        rows: [range(1, 6), range(7, 12), range(13, 18), range(19, 24)],
        portCount: 28,
        displayModel: "USW Pro HD 24",
        theme: "silver",
        specialSlots: [
          { key: "sfp_1", label: "SFP+ 1", port: 25 },
          { key: "sfp_2", label: "SFP+ 2", port: 26 },
          { key: "sfp_3", label: "SFP+ 3", port: 27 },
          { key: "sfp_4", label: "SFP+ 4", port: 28 }
        ]
      },
      // USW Pro XG 24 PoE  8× 2.5G + 16× 10G PoE+++ + 2× 25G SFP28 | silver | six-grid
      USWPROXG24POE: {
        kind: "switch",
        frontStyle: "six-grid",
        rows: [range(1, 6), range(7, 12), range(13, 18), range(19, 24)],
        portCount: 26,
        displayModel: "USW Pro XG 24 PoE",
        theme: "silver",
        specialSlots: [
          { key: "sfp_1", label: "SFP28 1", port: 25 },
          { key: "sfp_2", label: "SFP28 2", port: 26 }
        ]
      },
      // USW Pro XG 24 (non-PoE)  8× 2.5G + 16× 10G + 2× 25G SFP28 | silver | six-grid
      USWPROXG24: {
        kind: "switch",
        frontStyle: "six-grid",
        rows: [range(1, 6), range(7, 12), range(13, 18), range(19, 24)],
        portCount: 26,
        displayModel: "USW Pro XG 24",
        theme: "silver",
        specialSlots: [
          { key: "sfp_1", label: "SFP28 1", port: 25 },
          { key: "sfp_2", label: "SFP28 2", port: 26 }
        ]
      },
      // ════════════════════════════════════════════════════════
      // 48-PORT SWITCHES  (alle: quad-row → repeat(12), 4 Zeilen à 12)
      // ════════════════════════════════════════════════════════
      // USW 48 PoE (Standard Gen2)  48× 1G (32× PoE+) + 4× 1G SFP | silver | quad-row
      USW48P: {
        kind: "switch",
        frontStyle: "quad-row",
        rows: [range(1, 12), range(13, 24), range(25, 36), range(37, 48)],
        portCount: 52,
        displayModel: "USW 48 PoE",
        theme: "silver",
        specialSlots: [
          { key: "sfp_1", label: "SFP 1", port: 49 },
          { key: "sfp_2", label: "SFP 2", port: 50 },
          { key: "sfp_3", label: "SFP 3", port: 51 },
          { key: "sfp_4", label: "SFP 4", port: 52 }
        ]
      },
      // USW 48 (Standard Gen2, non-PoE)  48× 1G + 4× 1G SFP | silver | quad-row
      USW48: {
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
      // US 48 (Gen1, non-PoE)  48× 1G + 2× SFP + 2× SFP+ | silver | quad-row
      US48: {
        kind: "switch",
        frontStyle: "quad-row",
        rows: [range(1, 12), range(13, 24), range(25, 36), range(37, 48)],
        portCount: 52,
        displayModel: "US 48",
        theme: "silver",
        specialSlots: [
          { key: "sfp_1", label: "SFP 1", port: 49 },
          { key: "sfp_2", label: "SFP 2", port: 50 },
          { key: "sfp_3", label: "SFP+ 1", port: 51 },
          { key: "sfp_4", label: "SFP+ 2", port: 52 }
        ]
      },
      // US 48 500W (Gen1, PoE)  48× 1G PoE + 2× SFP + 2× SFP+ | silver | quad-row
      US48500W: {
        kind: "switch",
        frontStyle: "quad-row",
        rows: [range(1, 12), range(13, 24), range(25, 36), range(37, 48)],
        portCount: 52,
        displayModel: "US 48 500W",
        theme: "silver",
        specialSlots: [
          { key: "sfp_1", label: "SFP 1", port: 49 },
          { key: "sfp_2", label: "SFP 2", port: 50 },
          { key: "sfp_3", label: "SFP+ 1", port: 51 },
          { key: "sfp_4", label: "SFP+ 2", port: 52 }
        ]
      },
      // US 48 750W (Gen1, PoE Hi-Power)  48× 1G PoE + 2× SFP + 2× SFP+ | silver | quad-row
      US48750W: {
        kind: "switch",
        frontStyle: "quad-row",
        rows: [range(1, 12), range(13, 24), range(25, 36), range(37, 48)],
        portCount: 52,
        displayModel: "US 48 750W",
        theme: "silver",
        specialSlots: [
          { key: "sfp_1", label: "SFP 1", port: 49 },
          { key: "sfp_2", label: "SFP 2", port: 50 },
          { key: "sfp_3", label: "SFP+ 1", port: 51 },
          { key: "sfp_4", label: "SFP+ 2", port: 52 }
        ]
      },
      // USW Pro 48 (non-PoE)  48× 1G + 4× 10G SFP+ | silver | quad-row
      USWPRO48: {
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
      // USW Pro 48 PoE  48× 1G (40× PoE+, 8× PoE++) + 4× 10G SFP+ | silver | quad-row
      USWPRO48POE: {
        kind: "switch",
        frontStyle: "quad-row",
        rows: [range(1, 12), range(13, 24), range(25, 36), range(37, 48)],
        portCount: 52,
        displayModel: "USW Pro 48 PoE",
        theme: "silver",
        specialSlots: [
          { key: "sfp_1", label: "SFP+ 1", port: 49 },
          { key: "sfp_2", label: "SFP+ 2", port: 50 },
          { key: "sfp_3", label: "SFP+ 3", port: 51 },
          { key: "sfp_4", label: "SFP+ 4", port: 52 }
        ]
      },
      // USW Pro Max 48 PoE  32× 1G + 16× 2.5G PoE++ + 4× 10G SFP+ | silver | quad-row
      USWPROMAX48POE: {
        kind: "switch",
        frontStyle: "quad-row",
        rows: [range(1, 12), range(13, 24), range(25, 36), range(37, 48)],
        portCount: 52,
        displayModel: "USW Pro Max 48 PoE",
        theme: "silver",
        specialSlots: [
          { key: "sfp_1", label: "SFP+ 1", port: 49 },
          { key: "sfp_2", label: "SFP+ 2", port: 50 },
          { key: "sfp_3", label: "SFP+ 3", port: 51 },
          { key: "sfp_4", label: "SFP+ 4", port: 52 }
        ]
      },
      // USW Pro Max 48 (non-PoE)  32× 1G + 16× 2.5G + 4× 10G SFP+ | silver | quad-row
      USWPROMAX48: {
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
      // USW Enterprise 48 PoE  48× 2.5G PoE+ + 4× 10G SFP+ | silver | quad-row
      USWENTERPRISE48POE: {
        kind: "switch",
        frontStyle: "quad-row",
        rows: [range(1, 12), range(13, 24), range(25, 36), range(37, 48)],
        portCount: 52,
        displayModel: "USW Enterprise 48 PoE",
        theme: "silver",
        specialSlots: [
          { key: "sfp_1", label: "SFP+ 1", port: 49 },
          { key: "sfp_2", label: "SFP+ 2", port: 50 },
          { key: "sfp_3", label: "SFP+ 3", port: 51 },
          { key: "sfp_4", label: "SFP+ 4", port: 52 }
        ]
      },
      // USW Pro XG 48 PoE  16× 2.5G + 32× 10G PoE+++ + 4× 25G SFP28 | silver | quad-row
      USWPROXG48POE: {
        kind: "switch",
        frontStyle: "quad-row",
        rows: [range(1, 12), range(13, 24), range(25, 36), range(37, 48)],
        portCount: 52,
        displayModel: "USW Pro XG 48 PoE",
        theme: "silver",
        specialSlots: [
          { key: "sfp_1", label: "SFP28 1", port: 49 },
          { key: "sfp_2", label: "SFP28 2", port: 50 },
          { key: "sfp_3", label: "SFP28 3", port: 51 },
          { key: "sfp_4", label: "SFP28 4", port: 52 }
        ]
      },
      // USW Pro XG 48 (non-PoE)  16× 2.5G + 32× 10G + 4× 25G SFP28 | silver | quad-row
      USWPROXG48: {
        kind: "switch",
        frontStyle: "quad-row",
        rows: [range(1, 12), range(13, 24), range(25, 36), range(37, 48)],
        portCount: 52,
        displayModel: "USW Pro XG 48",
        theme: "silver",
        specialSlots: [
          { key: "sfp_1", label: "SFP28 1", port: 49 },
          { key: "sfp_2", label: "SFP28 2", port: 50 },
          { key: "sfp_3", label: "SFP28 3", port: 51 },
          { key: "sfp_4", label: "SFP28 4", port: 52 }
        ]
      },
      // ════════════════════════════════════════════════════════
      // USW ULTRA FAMILY
      // 7× 1G RJ45 (6× PoE) + 1× 10G SFP+ als "uplink" Slot
      // ultra-row → repeat(7)  |  white
      // ════════════════════════════════════════════════════════
      USWULTRA: {
        kind: "switch",
        frontStyle: "ultra-row",
        rows: [range(1, 7)],
        portCount: 7,
        displayModel: "USW Ultra",
        theme: "white",
        specialSlots: [{ key: "uplink", label: "Uplink" }]
      },
      USWULTRA60W: {
        kind: "switch",
        frontStyle: "ultra-row",
        rows: [range(1, 7)],
        portCount: 7,
        displayModel: "USW Ultra 60W",
        theme: "white",
        specialSlots: [{ key: "uplink", label: "Uplink" }]
      },
      USWULTRA210W: {
        kind: "switch",
        frontStyle: "ultra-row",
        rows: [range(1, 7)],
        portCount: 7,
        displayModel: "USW Ultra 210W",
        theme: "white",
        specialSlots: [{ key: "uplink", label: "Uplink" }]
      },
      // ════════════════════════════════════════════════════════
      // CLOUD GATEWAYS — KOMPAKT / DESKTOP
      // gateway-single-row → repeat(8)  |  gateway-compact → repeat(5)
      // ════════════════════════════════════════════════════════
      // UCG-Ultra / UDRULT  5 Ports: 4× 1G LAN (1–4) + 1× 2.5G WAN (5) | white | gateway-single-row
      UDRULT: {
        kind: "gateway",
        frontStyle: "gateway-single-row",
        rows: [[1, 2, 3, 4]],
        portCount: 5,
        displayModel: "Cloud Gateway Ultra",
        theme: "white",
        specialSlots: [{ key: "wan", label: "WAN", port: 5 }]
      },
      UCGULTRA: {
        kind: "gateway",
        frontStyle: "gateway-single-row",
        rows: [[1, 2, 3, 4]],
        portCount: 5,
        displayModel: "Cloud Gateway Ultra",
        theme: "white",
        specialSlots: [{ key: "wan", label: "WAN", port: 5 }]
      },
      // UCG-Max  5 Ports: 4× 2.5G LAN (1–4) + 1× 2.5G WAN (5) | white | gateway-single-row
      UCGMAX: {
        kind: "gateway",
        frontStyle: "gateway-single-row",
        rows: [[1, 2, 3, 4]],
        portCount: 5,
        displayModel: "Cloud Gateway Max",
        theme: "white",
        specialSlots: [{ key: "wan", label: "WAN", port: 5 }]
      },
      // UCG-Fiber  7 Ports: 4× 2.5G LAN (1–4), 1× 10G SFP+ (5), 1× 10G RJ45 WAN (6), 1× 10G SFP+ WAN2 (7)
      // | white | gateway-single-row (LAN-Ports in rows, SFP/WAN als specialSlots)
      UCGFIBER: {
        kind: "gateway",
        frontStyle: "gateway-single-row",
        rows: [[1, 2, 3, 4]],
        portCount: 7,
        displayModel: "Cloud Gateway Fiber",
        theme: "white",
        specialSlots: [
          { key: "sfp_1", label: "SFP+ 1", port: 5 },
          { key: "wan", label: "WAN", port: 6 },
          { key: "sfp_2", label: "SFP+ 2", port: 7 }
        ]
      },
      // UCG-Industrial  6 Ports: 5× 1G LAN (1–5) + 1× 10G SFP+ WAN (6) | silver | gateway-single-row
      UCGINDUSTRIAL: {
        kind: "gateway",
        frontStyle: "gateway-single-row",
        rows: [[1, 2, 3, 4, 5]],
        portCount: 6,
        displayModel: "Cloud Gateway Industrial",
        theme: "silver",
        specialSlots: [{ key: "sfp_1", label: "SFP+ WAN", port: 6 }]
      },
      // UDR  Dream Router (Wi-Fi 6)  5 Ports: 1× 1G WAN (1) + 4× 1G LAN (2–5, 2× PoE)
      // | white | gateway-single-row  (WAN als specialSlot links, LAN-Ports in rows)
      UDR: {
        kind: "gateway",
        frontStyle: "gateway-single-row",
        rows: [[2, 3, 4, 5]],
        portCount: 5,
        displayModel: "Dream Router",
        theme: "white",
        specialSlots: [{ key: "wan", label: "WAN", port: 1 }]
      },
      // UDR7  Dream Router 7 (Wi-Fi 7)  5 Ports: 3× 2.5G LAN (1–3, 1× PoE) + 1× 2.5G WAN (4) + 1× 10G SFP+ WAN2 (5)
      // | white | gateway-single-row
      UDR7: {
        kind: "gateway",
        frontStyle: "gateway-single-row",
        rows: [[1, 2, 3]],
        portCount: 5,
        displayModel: "Dream Router 7",
        theme: "white",
        specialSlots: [
          { key: "wan", label: "WAN", port: 4 },
          { key: "sfp_1", label: "SFP+ 1", port: 5 }
        ]
      },
      // UX  UniFi Express (Wi-Fi 6)  2 Ports: 1× 1G LAN (1) + 1× 1G WAN (2)
      // | white | gateway-compact (repeat(5) → passt für 1–3 sichtbare Ports)
      UX: {
        kind: "gateway",
        frontStyle: "gateway-compact",
        rows: [[1]],
        portCount: 2,
        displayModel: "UniFi Express",
        theme: "white",
        specialSlots: [{ key: "wan", label: "WAN", port: 2 }]
      },
      // UX7  UniFi Express 7 (Wi-Fi 7)  2 Ports: 1× 2.5G LAN (1) + 1× 10G SFP+ WAN (2)
      // | white | gateway-compact
      UX7: {
        kind: "gateway",
        frontStyle: "gateway-compact",
        rows: [[1]],
        portCount: 2,
        displayModel: "UniFi Express 7",
        theme: "white",
        specialSlots: [{ key: "sfp_1", label: "SFP+ WAN", port: 2 }]
      },
      // ════════════════════════════════════════════════════════
      // CLOUD GATEWAYS — RACK (1U)
      // gateway-rack → repeat(8)  |  silver
      // ════════════════════════════════════════════════════════
      // UDM-Pro  1U Rack  11 Ports: 8× 1G LAN (1–8) + 1× 1G WAN (9) + 2× 10G SFP+ (10–11)
      // | silver | gateway-rack
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
      // UDM-SE  1U Rack  11 Ports: 8× 1G LAN (1–8) + 1× 2.5G WAN (9) + 2× 10G SFP+ (10–11)
      // + PoE auf LAN-Ports  | silver | gateway-rack
      UDMSE: {
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
      // UDM-Pro-Max  1U Rack  11 Ports: 8× 1G LAN (1–8) + 1× 2.5G WAN (9) + 2× 10G SFP+ (10–11)
      // | silver | gateway-rack
      UDMPROMAX: {
        kind: "gateway",
        frontStyle: "gateway-rack",
        rows: [range(1, 8)],
        portCount: 11,
        displayModel: "UDM Pro Max",
        theme: "silver",
        specialSlots: [
          { key: "wan", label: "WAN", port: 9 },
          { key: "sfp_1", label: "SFP+ 1", port: 10 },
          { key: "sfp_2", label: "SFP+ 2", port: 11 }
        ]
      },
      // UXG-Pro  1U Rack  4 Ports: 2× 1G RJ45 (1–2) + 2× 10G SFP+ (3–4), alle remappable
      // | silver | gateway-single-row (nur 2 LAN-Ports in rows)
      UXGPRO: {
        kind: "gateway",
        frontStyle: "gateway-single-row",
        rows: [[1, 2]],
        portCount: 4,
        displayModel: "UXG Pro",
        theme: "silver",
        specialSlots: [
          { key: "sfp_1", label: "SFP+ 1", port: 3 },
          { key: "sfp_2", label: "SFP+ 2", port: 4 }
        ]
      },
      // UXG-Lite  kompakter Desktop  2 Ports: 1× 1G LAN (1) + 1× 1G WAN (2) | white | gateway-compact
      UXGLITE: {
        kind: "gateway",
        frontStyle: "gateway-compact",
        rows: [[1]],
        portCount: 2,
        displayModel: "UXG Lite",
        theme: "white",
        specialSlots: [{ key: "wan", label: "WAN", port: 2 }]
      },
      // UXG-Max  Desktop  5 Ports: 4× 1G LAN (1–4) + 1× 10G SFP+ (5) | white | gateway-single-row
      UXGMAX: {
        kind: "gateway",
        frontStyle: "gateway-single-row",
        rows: [[1, 2, 3, 4]],
        portCount: 5,
        displayModel: "UXG Max",
        theme: "white",
        specialSlots: [{ key: "sfp_1", label: "SFP+ 1", port: 5 }]
      },
      // UXG-Enterprise  1U Rack  6 Ports: 4× 10G RJ45 (1–4) + 2× 25G SFP28 (5–6)
      // | silver | gateway-rack
      UXGENTERPRISE: {
        kind: "gateway",
        frontStyle: "gateway-rack",
        rows: [[1, 2, 3, 4]],
        portCount: 6,
        displayModel: "UXG Enterprise",
        theme: "silver",
        specialSlots: [
          { key: "sfp_1", label: "SFP28 1", port: 5 },
          { key: "sfp_2", label: "SFP28 2", port: 6 }
        ]
      },
      // EFG  Enterprise Fortress Gateway  10 Ports: 8× 10G RJ45 (1–8) + 2× 25G SFP28 (9–10)
      // | silver | gateway-rack
      EFG: {
        kind: "gateway",
        frontStyle: "gateway-rack",
        rows: [range(1, 8)],
        portCount: 10,
        displayModel: "Enterprise Fortress Gateway",
        theme: "silver",
        specialSlots: [
          { key: "sfp_1", label: "SFP28 1", port: 9 },
          { key: "sfp_2", label: "SFP28 2", port: 10 }
        ]
      }
    };
  }
});

// src/helpers.js
var helpers_exports = {};
__export(helpers_exports, {
  applyWanPortOverride: () => applyWanPortOverride,
  discoverPorts: () => discoverPorts,
  discoverSpecialPorts: () => discoverSpecialPorts,
  formatState: () => formatState,
  getDeviceContext: () => getDeviceContext,
  getPoeStatus: () => getPoeStatus,
  getPortLinkText: () => getPortLinkText,
  getPortSpeedText: () => getPortSpeedText,
  getRelevantEntityWarningsForDevice: () => getRelevantEntityWarningsForDevice,
  getUnifiDevices: () => getUnifiDevices,
  isOn: () => isOn,
  mergePortsWithLayout: () => mergePortsWithLayout,
  mergeSpecialsWithLayout: () => mergeSpecialsWithLayout,
  stateObj: () => stateObj,
  stateValue: () => stateValue
});
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
function resolveModelKey2(device) {
  const layout = getDeviceLayout(device, []);
  return layout?.modelKey ?? null;
}
function classifyDevice(device, entities) {
  if (isDefinitelyAP(device)) return "access_point";
  const modelKey = resolveModelKey2(device);
  if (modelKey) {
    if ([
      "UDRULT",
      "UCGULTRA",
      "UCGMAX",
      "UCGFIBER",
      "UCGINDUSTRIAL",
      "UDMPRO",
      "UDMSE",
      "UDMPROMAX",
      "UDR",
      "UDR7",
      "UX",
      "UX7",
      "UXGPRO",
      "UXGLITE",
      "UXGMAX",
      "UXGENTERPRISE",
      "EFG"
    ].includes(modelKey)) return "gateway";
    if ([
      // Utility / Flex / Mini
      "USMINI",
      "USWFLEX25G5",
      "USWFLEX25G8",
      "USWFLEX",
      "USWFLEXXG",
      // 8-port
      "US8",
      "US8P60",
      "US8150W",
      "USL8LP",
      "USL8LPB",
      "USWPRO8POE",
      "USWENTERPRISE8POE",
      // 16-port
      "USL16LP",
      "USL16LPB",
      "USW16POE",
      "US16P150",
      "USWPROMAX16POE",
      "USWPROMAX16",
      // 24-port
      "USW24P",
      "USW24",
      "US24",
      "US24500W",
      "US24PRO2",
      "USWPRO24POE",
      "USWPROMAX24POE",
      "USWPROMAX24",
      // 48-port
      "USW48P",
      "USW48",
      "US48",
      "US48500W",
      "US48750W",
      "USWPRO48",
      "USWPRO48POE",
      "USWPROMAX48POE",
      "USWPROMAX48",
      "USWENTERPRISE48POE",
      // Ultra
      "USWULTRA",
      "USWULTRA60W",
      "USWULTRA210W"
    ].includes(modelKey)) return "switch";
  }
  if (modelStartsWith(device, SWITCH_MODEL_PREFIXES)) return "switch";
  if (modelStartsWith(device, GATEWAY_MODEL_PREFIXES)) return "gateway";
  const hasPorts = entities.some((e) => /_port_\d+_/i.test(e.entity_id));
  if (hasPorts) return "switch";
  if (hasUbiquitiManufacturer(device)) {
    const model = lower(device?.model);
    const name = lower(device?.name_by_user || device?.name);
    if (model.includes("udm") || model.includes("ucg") || model.includes("uxg") || model.includes("udr") || name.includes("gateway") || name.includes("router")) return "gateway";
    if (model.includes("usw") || model.includes("usl") || model.includes("us8") || model.includes("us16") || model.includes("us24") || model.includes("us48") || name.includes("switch")) return "switch";
  }
  return "unknown";
}
async function safeCallWS(hass, msg, fallback = []) {
  try {
    return await hass.callWS(msg);
  } catch (err) {
    console.warn("[unifi-device-card] WS failed", msg?.type, err);
    return fallback;
  }
}
async function getAllData(hass) {
  const [devices, rawEntities, configEntries] = await Promise.all([
    safeCallWS(hass, { type: "config/device_registry/list" }, []),
    safeCallWS(hass, { type: "config/entity_registry/list" }, []),
    safeCallWS(hass, { type: "config/config_entries/entry" }, [])
  ]);
  const entities = (rawEntities || []).filter((e) => !e.disabled_by && !e.hidden_by);
  const entitiesByDevice = /* @__PURE__ */ new Map();
  for (const entity of entities) {
    if (!entity.device_id) continue;
    if (!entitiesByDevice.has(entity.device_id))
      entitiesByDevice.set(entity.device_id, []);
    entitiesByDevice.get(entity.device_id).push(entity);
  }
  return { devices, entitiesByDevice, configEntries };
}
function isUnifiDevice(device, unifiEntryIds, entities) {
  if (Array.isArray(device?.config_entries) && device.config_entries.some((id) => unifiEntryIds.has(id))) return true;
  if (resolveModelKey2(device)) return true;
  if (modelStartsWith(device, [...SWITCH_MODEL_PREFIXES, ...GATEWAY_MODEL_PREFIXES])) return true;
  if (entities.some((e) => /_port_\d+_/i.test(e.entity_id)) && hasUbiquitiManufacturer(device)) return true;
  return false;
}
function buildDeviceLabel(device, type) {
  const name = normalize(device.name_by_user) || normalize(device.name) || normalize(device.model) || "Unknown device";
  const model = normalize(device.model);
  const typeLabel = type === "gateway" ? "Gateway" : "Switch";
  if (model && lower(model) !== lower(name)) return `${name} \xB7 ${model} (${typeLabel})`;
  return `${name} (${typeLabel})`;
}
function extractFirmware(device, entities) {
  if (normalize(device?.sw_version)) return normalize(device.sw_version);
  const fe = entities.find((e) => {
    const id = lower(e.entity_id);
    const t2 = entityText(e);
    return id.includes("firmware") || id.includes("version") || t2.includes("firmware");
  });
  return fe ? fe.entity_id : "";
}
async function getUnifiDevices(hass) {
  const { devices, entitiesByDevice, configEntries } = await getAllData(hass);
  const unifiEntryIds = extractUnifiEntryIds(configEntries);
  console.debug(
    "[unifi-device-card] Config entries:",
    (configEntries || []).map((e) => ({ domain: e.domain, title: e.title, id: e.entry_id }))
  );
  const results = [];
  for (const device of devices || []) {
    const entities = entitiesByDevice.get(device.id) || [];
    const byConfigEntry = Array.isArray(device?.config_entries) && device.config_entries.some((id) => unifiEntryIds.has(id));
    const modelKey = resolveModelKey2(device);
    const type = classifyDevice(device, entities);
    if (hasUbiquitiManufacturer(device) || byConfigEntry) {
      console.debug("[unifi-device-card] Candidate:", {
        name: device.name_by_user || device.name,
        model: device.model,
        byConfigEntry,
        modelKey,
        type,
        isUnifi: isUnifiDevice(device, unifiEntryIds, entities)
      });
    }
    if (!isUnifiDevice(device, unifiEntryIds, entities)) continue;
    if (type !== "switch" && type !== "gateway") continue;
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
async function getDeviceContext(hass, deviceId) {
  const { devices, entitiesByDevice, configEntries } = await getAllData(hass);
  const unifiEntryIds = extractUnifiEntryIds(configEntries);
  const device = devices.find((d) => d.id === deviceId);
  if (!device) return null;
  let entities = entitiesByDevice.get(deviceId) || [];
  if (!isUnifiDevice(device, unifiEntryIds, entities)) return null;
  const type = classifyDevice(device, entities);
  if (type !== "switch" && type !== "gateway") return null;
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
  const numberedPorts = discoverPorts(entities);
  const specialPorts = discoverSpecialPorts(entities);
  const layout = getDeviceLayout(device, numberedPorts);
  return {
    device,
    entities,
    type,
    layout,
    specialPorts,
    name: normalize(device.name_by_user) || normalize(device.name) || normalize(device.model),
    model: normalize(device.model),
    manufacturer: normalize(device.manufacturer),
    firmware: extractFirmware(device, entities)
  };
}
function classifyRelevantEntityType(entity) {
  const id = lower(entity.entity_id);
  const eid = entity.entity_id || "";
  if (eid.startsWith("button.") && id.includes("power_cycle")) return "power_cycle";
  if (eid.startsWith("switch.") && id.includes("_port_") && id.endsWith("_poe")) return "poe_switch";
  if (eid.startsWith("switch.") && id.includes("_port_")) return "port_switch";
  if (eid.startsWith("sensor.") && id.includes("_poe_power")) return "poe_power";
  if (eid.startsWith("sensor.") && (id.endsWith("_rx") || id.endsWith("_tx") || id.includes("_rx_") || id.includes("_tx_") || id.includes("throughput") || id.includes("bandwidth"))) return "rx_tx";
  if (eid.startsWith("sensor.") && (id.includes("link_speed") || id.includes("ethernet_speed") || id.includes("negotiated_speed"))) return "link_speed";
  if (eid.startsWith("binary_sensor.") && id.includes("_port_")) return "port_link";
  return null;
}
async function getRelevantEntityWarningsForDevice(hass, deviceId) {
  if (!hass || !deviceId) return null;
  const allRaw = await safeCallWS(hass, { type: "config/entity_registry/list" }, []);
  const deviceEntities = (allRaw || []).filter((e) => e.device_id === deviceId);
  const counts = {
    port_switch: 0,
    poe_switch: 0,
    poe_power: 0,
    link_speed: 0,
    rx_tx: 0,
    power_cycle: 0,
    link_entity: 0
  };
  let disabled = 0;
  let hidden = 0;
  for (const entity of deviceEntities) {
    const type = classifyRelevantEntityType(entity);
    if (!type) continue;
    const isDisabled = !!entity.disabled_by;
    const isHidden = !!entity.hidden_by;
    if (!isDisabled && !isHidden) continue;
    if (isDisabled) disabled++;
    else hidden++;
    if (type === "port_switch") counts.port_switch++;
    else if (type === "poe_switch") counts.poe_switch++;
    else if (type === "poe_power") counts.poe_power++;
    else if (type === "link_speed") counts.link_speed++;
    else if (type === "rx_tx") counts.rx_tx++;
    else if (type === "power_cycle") counts.power_cycle++;
    else if (type === "port_link") counts.link_entity++;
  }
  const total = disabled + hidden;
  if (total === 0) return null;
  return { total, disabled, hidden, counts };
}
function extractPortNumber(entity) {
  const id = lower(entity.entity_id);
  const originalName = lower(entity.original_name || "");
  const name = lower(entity.name || "");
  const uniqueId = entity.unique_id || "";
  let match = id.match(/_port_(\d+)(?:_|$)/i);
  if (match) return Number(match[1]);
  match = originalName.match(/\bport\s+(\d+)\b/i);
  if (match) return Number(match[1]);
  match = name.match(/\bport\s+(\d+)\b/i);
  if (match) return Number(match[1]);
  if (uniqueId) {
    match = uniqueId.match(/[_-](\d+)$/);
    if (match) return Number(match[1]);
    match = uniqueId.match(/port[_-](\d+)/i);
    if (match) return Number(match[1]);
  }
  return null;
}
function ensurePort(map, port) {
  if (!map.has(port)) {
    map.set(port, {
      key: `port-${port}`,
      port,
      label: String(port),
      port_label: null,
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
    });
  }
  return map.get(port);
}
function ensureSpecialPort(map, key, label) {
  if (!map.has(key)) {
    map.set(key, {
      key,
      port: null,
      label,
      port_label: null,
      kind: "special",
      link_entity: null,
      port_switch_entity: null,
      speed_entity: null,
      poe_switch_entity: null,
      poe_power_entity: null,
      power_cycle_entity: null,
      rx_entity: null,
      tx_entity: null,
      raw_entities: []
    });
  }
  return map.get(key);
}
function isLikelyLinkStateValue(value) {
  const v = String(value ?? "").toLowerCase();
  return ["on", "off", "up", "down", "connected", "disconnected", "true", "false"].includes(v);
}
function isThroughputEntity(id) {
  return id.endsWith("_rx") || id.endsWith("_tx") || id.includes("_rx_") || id.includes("_tx_") || id.includes("throughput") || id.includes("bandwidth") || id.includes("download") || id.includes("upload") || id.includes("traffic");
}
function isSpeedEntity(id) {
  return id.includes("_link_speed") || id.includes("_ethernet_speed") || id.includes("_negotiated_speed");
}
function classifyPortEntity(entity, isSpecial = false) {
  const id = lower(entity.entity_id);
  const eid = entity.entity_id;
  if (eid.startsWith("button.") && (id.includes("power_cycle") || id.includes("_restart") || id.includes("_reboot"))) {
    return "power_cycle_entity";
  }
  if (eid.startsWith("switch.") && id.includes("_port_") && id.endsWith("_poe")) {
    return "poe_switch_entity";
  }
  if (eid.startsWith("switch.") && id.includes("_port_") && !id.endsWith("_poe")) {
    return "port_switch_entity";
  }
  if (eid.startsWith("binary_sensor.")) {
    if (id.includes("_port_")) return "link_entity";
    if (isSpecial && (id.includes("_wan") || id.includes("_sfp") || id.includes("_uplink") || id.includes("_connected") || id.includes("_link"))) return "link_entity";
  }
  if (eid.startsWith("sensor.")) {
    if (isThroughputEntity(id)) {
      if (id.endsWith("_rx") || id.includes("_rx_") || id.includes("download")) return "rx_entity";
      if (id.endsWith("_tx") || id.includes("_tx_") || id.includes("upload")) return "tx_entity";
    }
    if (id.includes("_poe_power") || id.includes("_poe_current") || id.includes("_poe_voltage")) {
      return "poe_power_entity";
    }
    if (isSpeedEntity(id)) return "speed_entity";
  }
  return null;
}
function detectSpecialPortKey(entity) {
  const id = lower(entity.entity_id);
  const t2 = entityText(entity);
  if (id.includes("_wan") || t2.includes("wan port") || t2.includes("wan link")) {
    return { key: "wan", label: "WAN" };
  }
  if (id.includes("_sfp2") || id.includes("_sfp_2") || t2.includes("sfp+ 2") || t2.includes("sfp 2")) {
    return { key: "sfp_2", label: "SFP+ 2" };
  }
  if (id.includes("_sfp1") || id.includes("_sfp_1") || t2.includes("sfp+ 1") || t2.includes("sfp 1") || id.includes("_sfp")) {
    return { key: "sfp_1", label: "SFP+ 1" };
  }
  if (id.includes("_uplink") || t2.includes("uplink")) {
    return { key: "uplink", label: "Uplink" };
  }
  return null;
}
function extractPortLabel(entity) {
  const eid = entity.entity_id || "";
  const id = lower(eid);
  const isLabelSource = eid.startsWith("button.") && id.includes("power_cycle") || eid.startsWith("sensor.") && id.includes("_link_speed") || eid.startsWith("sensor.") && id.includes("_poe_power");
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
  if (!stripped || /^(rx|tx|poe|link|uplink|downlink|sfp|wan|lan)$/i.test(stripped)) return null;
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
function mergePortsWithLayout(layout, discoveredPorts) {
  const byPort = new Map(discoveredPorts.map((p) => [p.port, p]));
  const layoutPorts = (layout?.rows || []).flat();
  const specialPortNumbers = new Set(
    (layout?.specialSlots || []).map((s) => s.port).filter((p) => p != null)
  );
  const merged = [];
  for (const portNumber of layoutPorts) {
    if (specialPortNumbers.has(portNumber)) continue;
    merged.push(
      byPort.get(portNumber) || {
        key: `port-${portNumber}`,
        port: portNumber,
        label: String(portNumber),
        kind: "numbered",
        link_entity: null,
        speed_entity: null,
        poe_switch_entity: null,
        poe_power_entity: null,
        power_cycle_entity: null,
        rx_entity: null,
        tx_entity: null,
        raw_entities: []
      }
    );
  }
  for (const port of discoveredPorts) {
    if (!layoutPorts.includes(port.port) && !specialPortNumbers.has(port.port))
      merged.push(port);
  }
  return merged.sort((a, b) => (a.port ?? 999) - (b.port ?? 999));
}
function mergeSpecialsWithLayout(layout, discoveredSpecials) {
  const byKey = new Map(discoveredSpecials.map((s) => [s.key, s]));
  const merged = [];
  for (const slot of layout?.specialSlots || []) {
    merged.push(
      byKey.get(slot.key) || {
        key: slot.key,
        port: slot.port ?? null,
        label: slot.label,
        port_label: null,
        kind: "special",
        link_entity: null,
        port_switch_entity: null,
        speed_entity: null,
        poe_switch_entity: null,
        poe_power_entity: null,
        power_cycle_entity: null,
        rx_entity: null,
        tx_entity: null,
        raw_entities: []
      }
    );
  }
  for (const special of discoveredSpecials) {
    if (!layout?.specialSlots?.some((s) => s.key === special.key)) {
      merged.push(special);
    }
  }
  return merged;
}
function applyWanPortOverride(layout, specialPorts, wanPortConfig) {
  if (!wanPortConfig || !layout) return { layout, specialPorts };
  const wanPort = Number(wanPortConfig);
  if (!wanPort || isNaN(wanPort)) return { layout, specialPorts };
  const updatedSlots = (layout.specialSlots || []).map(
    (slot) => slot.key === "wan" ? { ...slot, port: wanPort } : slot
  );
  if (!updatedSlots.some((s) => s.key === "wan")) {
    updatedSlots.push({ key: "wan", label: "WAN", port: wanPort });
  }
  return {
    layout: { ...layout, specialSlots: updatedSlots },
    specialPorts
  };
}
function stateObj(hass, entityId) {
  if (!hass || !entityId) return null;
  return hass.states[entityId] ?? null;
}
function stateValue(hass, entityId) {
  return stateObj(hass, entityId)?.state ?? null;
}
function isOn(hass, entityId) {
  const s = stateObj(hass, entityId);
  if (!s) return null;
  const v = lower(s.state);
  if (["on", "true", "connected", "up"].includes(v)) return true;
  if (["off", "false", "disconnected", "down"].includes(v)) return false;
  return null;
}
function getPoeStatus(hass, port) {
  const sw = stateObj(hass, port?.poe_switch_entity);
  if (sw) {
    const v = lower(sw.state);
    if (v === "on") return "active";
    if (v === "off") return "inactive";
  }
  const pw = stateObj(hass, port?.poe_power_entity);
  if (pw) {
    const watts = parseFloat(pw.state);
    if (!isNaN(watts) && watts > 0) return "active";
    if (!isNaN(watts)) return "inactive";
  }
  return null;
}
function getPortLinkText(hass, port) {
  const link = stateObj(hass, port?.link_entity);
  if (link) return link.state;
  const sw = stateObj(hass, port?.port_switch_entity);
  if (sw) return sw.state;
  for (const entityId of port?.raw_entities || []) {
    const st = stateObj(hass, entityId);
    if (!st) continue;
    const v = lower(st.state);
    if (isLikelyLinkStateValue(v)) return st.state;
  }
  return null;
}
function simplifySpeed(raw, unit) {
  const rawLow = String(raw ?? "").trim().toLowerCase();
  const rawUnit = String(unit ?? "").trim().toLowerCase();
  if (!raw || raw === "unknown" || raw === "unavailable") return "\u2014";
  const number = parseFloat(rawLow.replace(",", "."));
  if (!Number.isNaN(number)) {
    if (rawUnit.includes("gbit")) return `${Math.round(number * 1e3)} Mbit`;
    if (rawUnit.includes("mbit")) return `${Math.round(number)} Mbit`;
    if ([10, 100, 1e3, 2500, 1e4].includes(number)) return `${Math.round(number)} Mbit`;
  }
  if (rawLow.includes("10g")) return "10000 Mbit";
  if (rawLow.includes("2.5g")) return "2500 Mbit";
  if (rawLow.includes("1g") || rawLow.includes("1000")) return "1000 Mbit";
  if (rawLow.includes("100m") || rawLow === "100") return "100 Mbit";
  if (rawLow.includes("10m") || rawLow === "10") return "10 Mbit";
  return "\u2014";
}
function getPortSpeedText(hass, port) {
  const direct = stateObj(hass, port?.speed_entity);
  if (direct) {
    const result = simplifySpeed(direct.state, direct.attributes?.unit_of_measurement);
    if (result !== "\u2014") return result;
  }
  for (const entityId of port?.raw_entities || []) {
    const st = stateObj(hass, entityId);
    if (!st) continue;
    const id = lower(entityId);
    const unit = st.attributes?.unit_of_measurement || "";
    const value = String(st.state ?? "");
    if (isThroughputEntity(id)) continue;
    if (id.includes("link_speed") || id.endsWith("_speed") || id.includes("ethernet_speed") || id.includes("negotiated_speed")) {
      const result = simplifySpeed(value, unit);
      if (result !== "\u2014") return result;
    }
  }
  return "\u2014";
}
function formatState(hass, entityId) {
  const s = stateObj(hass, entityId);
  if (!s) return "\u2014";
  const unit = s.attributes?.unit_of_measurement;
  if (unit) return `${s.state} ${unit}`;
  return s.state;
}
var SWITCH_MODEL_PREFIXES, GATEWAY_MODEL_PREFIXES, AP_MODEL_PREFIXES, PORT_TRANSLATION_KEYS;
var init_helpers = __esm({
  "src/helpers.js"() {
    init_model_registry();
    SWITCH_MODEL_PREFIXES = [
      "USW",
      "USL",
      "US8",
      "US16",
      "US24",
      "US48",
      "USMINI",
      "FLEXMINI"
    ];
    GATEWAY_MODEL_PREFIXES = [
      "UDM",
      "UCG",
      "UXG",
      "UDR",
      "UX",
      "UDRULT",
      "UDMPRO",
      "UDMSE",
      "EFG"
    ];
    AP_MODEL_PREFIXES = ["UAP", "U6", "U7", "UAL", "UAPMESH", "E7"];
    PORT_TRANSLATION_KEYS = /* @__PURE__ */ new Set([
      "port_bandwidth_rx",
      "port_bandwidth_tx",
      "port_link_speed",
      "poe",
      "poe_power",
      "poe_port_control"
    ]);
  }
});

// src/unifi-device-card.js
init_helpers();

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
    // WAN port selector (editor — gateway only)
    editor_wan_port_label: "WAN Port",
    editor_wan_port_auto: "Default (automatic)",
    editor_wan_port_hint: "Select which port is used as WAN. Only shown for gateway devices.",
    editor_wan_port_lan: "LAN",
    editor_wan_port_sfp: "SFP",
    editor_wan_port_sfpwan: "SFP (WAN-capable)",
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
    select_device: "Bitte im Karteneditor ein UniFi-Ger\xE4t ausw\xE4hlen.",
    loading: "Lade Ger\xE4tedaten\u2026",
    no_data: "Keine Ger\xE4tedaten verf\xFCgbar.",
    no_ports: "Keine Ports erkannt.",
    front_panel: "Front Panel",
    link_status: "Link Status",
    speed: "Geschwindigkeit",
    poe: "PoE",
    poe_power: "PoE Leistung",
    connected: "Verbunden",
    no_link: "Kein Link",
    online: "Online",
    offline: "Offline",
    port_disable: "Port deaktivieren",
    port_enable: "Port aktivieren",
    poe_off: "PoE Aus",
    poe_on: "PoE Ein",
    power_cycle: "Power Cycle",
    speed_disabled: "Speed-Entity deaktiviert \u2014 in HA aktivieren f\xFCr Geschwindigkeitsanzeige.",
    editor_device_title: "Ger\xE4t",
    editor_device_label: "UniFi Ger\xE4t",
    editor_device_loading: "Lade Ger\xE4te aus Home Assistant\u2026",
    editor_device_select: "Ger\xE4t ausw\xE4hlen\u2026",
    editor_name_label: "Anzeigename",
    editor_name_hint: "Optional \u2014 wird sonst vom Ger\xE4t \xFCbernommen",
    editor_no_devices: "Keine UniFi Switches oder Gateways in Home Assistant gefunden.",
    editor_hint: "Nur Ger\xE4te aus der UniFi Network Integration werden angezeigt.",
    editor_error: "UniFi-Ger\xE4te konnten nicht geladen werden.",
    // WAN port selector
    editor_wan_port_label: "WAN-Port",
    editor_wan_port_auto: "Standard (automatisch)",
    editor_wan_port_hint: "W\xE4hle, welcher Port als WAN verwendet wird. Nur f\xFCr Gateway-Ger\xE4te.",
    editor_wan_port_lan: "LAN",
    editor_wan_port_sfp: "SFP",
    editor_wan_port_sfpwan: "SFP (WAN-f\xE4hig)",
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
    type_switch: "Switch",
    type_gateway: "Gateway"
  },
  nl: {
    select_device: "Selecteer een UniFi-apparaat in de kaarteditor.",
    loading: "Apparaatgegevens laden\u2026",
    no_data: "Geen apparaatgegevens beschikbaar.",
    no_ports: "Geen poorten gedetecteerd.",
    front_panel: "Frontpaneel",
    link_status: "Linkstatus",
    speed: "Snelheid",
    poe: "PoE",
    poe_power: "PoE-vermogen",
    connected: "Verbonden",
    no_link: "Geen link",
    online: "Online",
    offline: "Offline",
    port_disable: "Poort uitschakelen",
    port_enable: "Poort inschakelen",
    poe_off: "PoE uit",
    poe_on: "PoE aan",
    power_cycle: "Power Cycle",
    speed_disabled: "Snelheidsentiteit uitgeschakeld \u2014 schakel in HA in om linksnelheid te tonen.",
    editor_device_title: "Apparaat",
    editor_device_label: "UniFi-apparaat",
    editor_device_loading: "Apparaten laden uit Home Assistant\u2026",
    editor_device_select: "Apparaat selecteren\u2026",
    editor_name_label: "Weergavenaam",
    editor_name_hint: "Optioneel \u2014 standaard de apparaatnaam",
    editor_no_devices: "Geen UniFi-switches of -gateways gevonden in Home Assistant.",
    editor_hint: "Alleen apparaten uit de UniFi Network-integratie worden weergegeven.",
    editor_error: "UniFi-apparaten konden niet worden geladen.",
    // WAN port selector
    editor_wan_port_label: "WAN-poort",
    editor_wan_port_auto: "Standaard (automatisch)",
    editor_wan_port_hint: "Selecteer welke poort als WAN wordt gebruikt. Alleen voor gateway-apparaten.",
    editor_wan_port_lan: "LAN",
    editor_wan_port_sfp: "SFP",
    editor_wan_port_sfpwan: "SFP (WAN-geschikt)",
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
    port_label: "Poort",
    editor_bg_label: "Achtergrondkleur (optioneel)",
    editor_bg_hint: "Standaard: var(--card-background-color)",
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
    select_device: "Veuillez s\xE9lectionner un appareil UniFi dans l'\xE9diteur de carte.",
    loading: "Chargement des donn\xE9es\u2026",
    no_data: "Aucune donn\xE9e disponible.",
    no_ports: "Aucun port d\xE9tect\xE9.",
    front_panel: "Panneau avant",
    link_status: "\xC9tat du lien",
    speed: "Vitesse",
    poe: "PoE",
    poe_power: "Puissance PoE",
    connected: "Connect\xE9",
    no_link: "Pas de lien",
    online: "En ligne",
    offline: "Hors ligne",
    port_disable: "D\xE9sactiver le port",
    port_enable: "Activer le port",
    poe_off: "PoE d\xE9sactiv\xE9",
    poe_on: "PoE activ\xE9",
    power_cycle: "Red\xE9marrage PoE",
    speed_disabled: "Entit\xE9 de vitesse d\xE9sactiv\xE9e \u2014 activez-la dans HA pour afficher la vitesse.",
    editor_device_title: "Appareil",
    editor_device_label: "Appareil UniFi",
    editor_device_loading: "Chargement des appareils\u2026",
    editor_device_select: "S\xE9lectionner un appareil\u2026",
    editor_name_label: "Nom d'affichage",
    editor_name_hint: "Optionnel \u2014 par d\xE9faut le nom de l'appareil",
    editor_no_devices: "Aucun switch ou gateway UniFi trouv\xE9 dans Home Assistant.",
    editor_hint: "Seuls les appareils de l'int\xE9gration UniFi Network sont affich\xE9s.",
    editor_error: "Impossible de charger les appareils UniFi.",
    // WAN port selector
    editor_wan_port_label: "Port WAN",
    editor_wan_port_auto: "Par d\xE9faut (automatique)",
    editor_wan_port_hint: "S\xE9lectionnez le port utilis\xE9 comme WAN. Uniquement pour les passerelles.",
    editor_wan_port_lan: "LAN",
    editor_wan_port_sfp: "SFP",
    editor_wan_port_sfpwan: "SFP (capable WAN)",
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
    port_label: "Port",
    editor_bg_label: "Couleur de fond (optionnel)",
    editor_bg_hint: "D\xE9faut : var(--card-background-color)",
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
init_helpers();
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
function buildWanPortOptions(layout, tFn) {
  const options = [];
  options.push({ value: "auto", label: tFn("editor_wan_port_auto") });
  if (!layout) return options;
  for (const slot of layout.specialSlots || []) {
    const type = slotPortType(slot);
    options.push({
      value: slot.key,
      label: slotDropdownLabel(slot, tFn),
      type
    });
  }
  const specialPortNums = new Set(
    (layout.specialSlots || []).map((s) => s.port).filter((p) => p != null)
  );
  const allPortNums = (layout.rows || []).flat();
  for (const portNum of allPortNums) {
    if (specialPortNums.has(portNum)) continue;
    options.push({
      value: `port_${portNum}`,
      label: `Port ${portNum} \u2014 ${tFn("editor_wan_port_lan")}`,
      type: "lan"
    });
  }
  return options;
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
  }
  setConfig(config) {
    this._config = config || {};
    if (this._hass && this._config?.device_id) {
      this._loadEntityHint(this._config.device_id);
      this._loadDeviceCtx(this._config.device_id);
    } else {
      this._entityHint = null;
      this._deviceCtx = null;
    }
    if (this._rendered) {
      this._patchFields();
    } else {
      this._render();
    }
  }
  set hass(hass) {
    this._hass = hass;
    if (!this._loaded && !this._loading) this._loadDevices();
    if (this._config?.device_id) {
      this._loadEntityHint(this._config.device_id);
      this._loadDeviceCtx(this._config.device_id);
    }
  }
  _t(key) {
    return t(this._hass, key);
  }
  // ─── Smart render helper ───────────────────────────────────────────────────
  _smartRender() {
    const root = this.shadowRoot;
    const hasDeviceSelect = !!root?.getElementById("device");
    const shouldHaveDeviceSelect = !this._loading;
    if (!this._rendered || hasDeviceSelect !== shouldHaveDeviceSelect) {
      this._render();
      return;
    }
    this._patchFields();
    this._patchWarning();
  }
  // ─── Async loaders ────────────────────────────────────────────────────────
  async _loadDevices() {
    if (!this._hass) return;
    this._loading = true;
    this._error = "";
    const token = ++this._loadToken;
    this._smartRender();
    try {
      const devices = await getUnifiDevices(this._hass);
      if (token !== this._loadToken) return;
      this._devices = devices;
      this._loaded = true;
      this._loading = false;
      this._smartRender();
    } catch (err) {
      if (token !== this._loadToken) return;
      this._devices = [];
      this._loaded = true;
      this._loading = false;
      this._error = this._t("editor_error");
      this._smartRender();
    }
  }
  async _loadEntityHint(deviceId) {
    if (!this._hass || !deviceId) {
      this._entityHint = null;
      this._entityHintLoading = false;
      this._smartRender();
      return;
    }
    const token = ++this._entityHintToken;
    this._entityHintLoading = true;
    this._smartRender();
    try {
      const info = await getRelevantEntityWarningsForDevice(this._hass, deviceId);
      if (token !== this._entityHintToken) return;
      this._entityHint = info;
    } catch (err) {
      console.warn("[unifi-device-card] Failed to load entity warnings", err);
      if (token !== this._entityHintToken) return;
      this._entityHint = null;
    }
    this._entityHintLoading = false;
    this._smartRender();
  }
  /**
   * Load the device type and layout for the selected device so we know
   * whether to show the WAN port selector (gateway only) and which ports
   * to offer.
   */
  async _loadDeviceCtx(deviceId) {
    if (!this._hass || !deviceId) {
      this._deviceCtx = null;
      this._deviceCtxLoading = false;
      return;
    }
    const token = ++this._deviceCtxToken;
    this._deviceCtxLoading = true;
    try {
      const { getDeviceContext: getDeviceContext2 } = await Promise.resolve().then(() => (init_helpers(), helpers_exports));
      const ctx = await getDeviceContext2(this._hass, deviceId);
      if (token !== this._deviceCtxToken) return;
      this._deviceCtx = ctx;
    } catch (err) {
      console.warn("[unifi-device-card] Failed to load device ctx for editor", err);
      if (token !== this._deviceCtxToken) return;
      this._deviceCtx = null;
    }
    this._deviceCtxLoading = false;
    this._render();
  }
  // ─── Event dispatching ────────────────────────────────────────────────────
  _dispatch(config) {
    this.dispatchEvent(new CustomEvent("config-changed", {
      detail: { config },
      bubbles: true,
      composed: true
    }));
  }
  _selectedDeviceName(deviceId) {
    return this._devices.find((d) => d.id === deviceId)?.name || "";
  }
  // ─── Input handlers ───────────────────────────────────────────────────────
  _onDeviceChange(ev) {
    const newDeviceId = ev.target.value || "";
    const oldDeviceId = this._config?.device_id || "";
    const oldAutoName = this._selectedDeviceName(oldDeviceId);
    const newAutoName = this._selectedDeviceName(newDeviceId);
    const next = { ...this._config };
    if (newDeviceId) next.device_id = newDeviceId;
    else delete next.device_id;
    const currentName = String(next.name || "").trim();
    if (!currentName || currentName === oldAutoName) {
      if (newAutoName) next.name = newAutoName;
      else delete next.name;
    }
    delete next.wan_port;
    this._config = next;
    this._dispatch(next);
    this._loadEntityHint(newDeviceId);
    this._deviceCtx = null;
    this._loadDeviceCtx(newDeviceId);
    this._render();
  }
  _onNameInput(ev) {
    this._config = { ...this._config, name: ev.target.value || "" };
    this._dispatch(this._config);
  }
  _onBackgroundInput(ev) {
    const value = String(ev.target.value || "").trim();
    const next = { ...this._config };
    if (value) next.background_color = value;
    else delete next.background_color;
    this._config = next;
    this._dispatch(next);
  }
  _onWanPortChange(ev) {
    const value = ev.target.value || "auto";
    const next = { ...this._config };
    if (value && value !== "auto") {
      next.wan_port = value;
    } else {
      delete next.wan_port;
    }
    this._config = next;
    this._dispatch(next);
  }
  // ─── DOM patch helpers ────────────────────────────────────────────────────
  /**
   * Update only the *values* of existing input fields without touching the DOM
   * structure. Skips any field that currently has focus so the user's cursor
   * position is never disturbed.
   */
  _patchFields() {
    const root = this.shadowRoot;
    if (!root) return;
    const active = this.shadowRoot.activeElement || document.activeElement;
    const nameEl = root.getElementById("name");
    if (nameEl && nameEl !== active) {
      nameEl.value = this._config?.name || "";
    }
    const bgEl = root.getElementById("background_color");
    if (bgEl && bgEl !== active) {
      bgEl.value = this._config?.background_color || "";
    }
    const selEl = root.getElementById("device");
    if (selEl && selEl !== active) {
      selEl.value = this._config?.device_id || "";
    }
    const wanEl = root.getElementById("wan_port");
    if (wanEl && wanEl !== active) {
      wanEl.value = this._config?.wan_port || "auto";
    }
  }
  /**
   * Replace only the warning/hint block without touching any input elements.
   * This prevents the full-DOM rebuild that would steal focus.
   */
  _patchWarning() {
    const root = this.shadowRoot;
    if (!root) return;
    const container = root.getElementById("warning-container");
    if (!container) return;
    container.innerHTML = this._renderEntityWarning() + (this._error ? `<div class="error">${this._error}</div>` : "") + (!this._loading && !this._devices.length && !this._error ? `<div class="hint">${this._t("editor_no_devices")}</div>` : !this._loading ? `<div class="hint">${this._t("editor_hint")}</div>` : "");
  }
  // ─── Warning block renderer ───────────────────────────────────────────────
  _renderEntityWarning() {
    if (this._entityHintLoading) {
      return `<div class="hint">${this._t("warning_checking")}</div>`;
    }
    const info = this._entityHint;
    if (!info || !info.total) return "";
    const lines = [];
    if (info.counts.port_switch) lines.push(`<li>${info.counts.port_switch} ${this._t("warning_entity_port_switch")}</li>`);
    if (info.counts.poe_switch) lines.push(`<li>${info.counts.poe_switch} ${this._t("warning_entity_poe_switch")}</li>`);
    if (info.counts.poe_power) lines.push(`<li>${info.counts.poe_power} ${this._t("warning_entity_poe_power")}</li>`);
    if (info.counts.link_speed) lines.push(`<li>${info.counts.link_speed} ${this._t("warning_entity_link_speed")}</li>`);
    if (info.counts.rx_tx) lines.push(`<li>${info.counts.rx_tx} ${this._t("warning_entity_rx_tx")}</li>`);
    if (info.counts.power_cycle) lines.push(`<li>${info.counts.power_cycle} ${this._t("warning_entity_power_cycle")}</li>`);
    if (info.counts.link_entity) lines.push(`<li>${info.counts.link_entity} ${this._t("warning_entity_link")}</li>`);
    const statusText = this._t("warning_status").replace("{disabled}", `<strong>${info.disabled}</strong>`).replace("{hidden}", `<strong>${info.hidden}</strong>`);
    return `
      <div class="warning">
        <div class="warning-title">${this._t("warning_title")}</div>
        <div class="warning-text">${this._t("warning_body")}</div>
        <div class="warning-text">${statusText}</div>
        ${lines.length ? `<ul class="warning-list">${lines.join("")}</ul>` : ""}
        <div class="warning-text">
          ${this._t("warning_check_in")}<br>
          <strong>${this._t("warning_ha_path")}</strong>
        </div>
      </div>
    `;
  }
  // ─── WAN port selector renderer ───────────────────────────────────────────
  /**
   * Render the WAN port dropdown.
   * Only shown when:
   *   1. A device is selected
   *   2. The device type is "gateway"
   *   3. The layout has at least one slot (so there is something to choose from)
   */
  _renderWanPortSelector() {
    if (!this._config?.device_id) return "";
    if (this._deviceCtxLoading) {
      return `
        <div class="field">
          <label>${this._t("editor_wan_port_label")}</label>
          <div class="hint">${this._t("editor_device_loading")}</div>
        </div>
      `;
    }
    const ctx = this._deviceCtx;
    if (!ctx || ctx.type !== "gateway") return "";
    const layout = ctx.layout;
    const options = buildWanPortOptions(layout, (k) => this._t(k));
    if (options.length <= 1) return "";
    const currentVal = this._config?.wan_port || "auto";
    const optionHtml = options.map((o) => {
      const sel = o.value === currentVal ? " selected" : "";
      return `<option value="${o.value}"${sel}>${o.label}</option>`;
    }).join("");
    return `
      <div class="field">
        <label for="wan_port">${this._t("editor_wan_port_label")}</label>
        <select id="wan_port">
          ${optionHtml}
        </select>
        <div class="hint">${this._t("editor_wan_port_hint")}</div>
      </div>
    `;
  }
  // ─── Full render (first time only / device change) ────────────────────────
  _render() {
    const cfg = this._config;
    const selId = cfg?.device_id || "";
    const selName = String(cfg?.name || "").replace(/"/g, "&quot;");
    const selBg = String(cfg?.background_color || "").replace(/"/g, "&quot;");
    const options = this._devices.map((d) => `<option value="${d.id}" ${d.id === selId ? "selected" : ""}>${d.label}</option>`).join("");
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }
        .wrap { display: grid; gap: 14px; }
        .section-title {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--secondary-text-color);
          padding-bottom: 4px;
          border-bottom: 1px solid var(--divider-color);
        }
        .field { display: grid; gap: 5px; }
        label {
          font-size: 13px;
          font-weight: 600;
          color: var(--primary-text-color);
        }
        select, input {
          width: 100%;
          box-sizing: border-box;
          min-height: 38px;
          padding: 7px 10px;
          border-radius: 8px;
          border: 1px solid var(--divider-color);
          background: var(--card-background-color);
          color: var(--primary-text-color);
          font: inherit;
        }
        .hint {
          color: var(--secondary-text-color);
          font-size: 12px;
          line-height: 1.4;
        }
        .error {
          color: var(--error-color);
          font-size: 12px;
          line-height: 1.4;
        }
        .warning {
          border: 1px solid var(--warning-color, #f59e0b);
          background: rgba(245, 158, 11, 0.08);
          color: var(--primary-text-color);
          border-radius: 8px;
          padding: 10px 12px;
          display: grid;
          gap: 6px;
        }
        .warning-title { font-size: 13px; font-weight: 700; }
        .warning-text  { font-size: 12px; line-height: 1.4; }
        .warning-list  { margin: 0; padding-left: 18px; font-size: 12px; line-height: 1.4; }
      </style>

      <div class="wrap">
        <div class="section-title">${this._t("editor_device_title")}</div>

        <div class="field">
          <label for="device">${this._t("editor_device_label")}</label>
          ${this._loading ? `<div class="hint">${this._t("editor_device_loading")}</div>` : `<select id="device">
                 <option value="">${this._t("editor_device_select")}</option>
                 ${options}
               </select>`}
        </div>

        ${this._renderWanPortSelector()}

        <div class="field">
          <label for="name">${this._t("editor_name_label")}</label>
          <input
            id="name"
            type="text"
            value="${selName}"
            placeholder="${this._t("editor_name_hint")}"
          />
        </div>

        <div class="field">
          <label for="background_color">${this._t("editor_bg_label")}</label>
          <input
            id="background_color"
            type="text"
            value="${selBg}"
            placeholder="${this._t("editor_bg_hint")}"
          />
        </div>

        <div id="warning-container">
          ${this._renderEntityWarning()}
          ${this._error ? `<div class="error">${this._error}</div>` : ""}
          ${!this._loading && !this._devices.length && !this._error ? `<div class="hint">${this._t("editor_no_devices")}</div>` : !this._loading ? `<div class="hint">${this._t("editor_hint")}</div>` : ""}
        </div>
      </div>
    `;
    this._rendered = true;
    this.shadowRoot.getElementById("device")?.addEventListener("change", (e) => this._onDeviceChange(e));
    this.shadowRoot.getElementById("wan_port")?.addEventListener("change", (e) => this._onWanPortChange(e));
    this.shadowRoot.getElementById("name")?.addEventListener("input", (e) => this._onNameInput(e));
    this.shadowRoot.getElementById("background_color")?.addEventListener("input", (e) => this._onBackgroundInput(e));
  }
};
customElements.define("unifi-device-card-editor", UnifiDeviceCardEditor);

// src/unifi-device-card.js
var VERSION = "0.0.0-dev.84ccad0";
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
  /**
   * Translate a raw HA state value (e.g. "on", "connected", "up") to a
   * localised string. Falls back to the original value if not recognised,
   * so sensor readings / firmware strings are passed through unchanged.
   */
  _translateState(raw) {
    if (!raw || raw === "\u2014") return raw;
    const key = `state_${String(raw).toLowerCase().replace(/\s+/g, "_")}`;
    const translated = this._t(key);
    return translated === key ? raw : translated;
  }
  _cardBgStyle() {
    return this._config?.background_color || "";
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
      const discovered = discoverPorts(ctx?.entities || []);
      const numberedRaw = mergePortsWithLayout(ctx?.layout, discovered);
      const specialsRaw = mergeSpecialsWithLayout(
        ctx?.layout,
        discoverSpecialPorts(ctx?.entities || []),
        discovered
      );
      const wanPort = this._config?.wan_port;
      const { specials, numbered } = ctx?.type === "gateway" && wanPort && wanPort !== "auto" ? applyWanPortOverride(specialsRaw, numberedRaw, ctx?.layout, wanPort) : { specials: specialsRaw, numbered: numberedRaw };
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
    return allSlots.filter((s) => isOn(this._hass, s.link_entity, s)).length;
  }
  _styles() {
    return `<style>
      :host {
        --udc-bg:      #141820;
        --udc-surface: #1e2433;
        --udc-surf2:   #252d3d;
        --udc-border:  rgba(255,255,255,0.07);
        --udc-accent:  #0090d9;
        --udc-aglow:   rgba(0,144,217,0.2);
        --udc-green:   #22c55e;
        --udc-orange:  #f59e0b;
        --udc-red:     #ef4444;
        --udc-text:    #e2e8f0;
        --udc-muted:   #4e5d73;
        --udc-dim:     #8896a8;
        --udc-r:       14px;
        --udc-rsm:     8px;
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

      .theme-white  .panel-label { color: #8a96a8; }
      .theme-silver .panel-label { color: #5a6070; }
      .theme-dark   .panel-label { color: var(--udc-muted); }

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
      .theme-white .port-socket::after  { background: #8a8060; }
      .theme-white .port-num            { color: #8a96a8; }
      .theme-white .port.up .port-socket { background: #9aa8b8; }
      .theme-white .port.up .port-num   { color: #4a5568; }
      .theme-white .port-led            { background: #c8d0d8; }

      .theme-silver .port-socket        { background: #3a4050; }
      .theme-silver .port-socket::after { background: #5a6070; }
      .theme-silver .port-num           { color: #5a6070; }
      .theme-silver .port.up .port-socket { background: #2a3040; }
      .theme-silver .port.up .port-num  { color: #8a96a8; }
      .theme-silver .port-led           { background: #3a4050; }

      .theme-dark .port-socket          { background: var(--udc-surf2); }
      .theme-dark .port-socket::after   { background: var(--udc-muted); }
      .theme-dark .port-num             { color: var(--udc-muted); }
      .theme-dark .port.up .port-socket { background: #1a2030; }
      .theme-dark .port.up .port-num    { color: var(--udc-dim); }
      .theme-dark .port-led             { background: var(--udc-surf2); }

      /* port states */
      .port.up   .port-led-link { background: var(--udc-green); box-shadow: 0 0 4px var(--udc-green); }
      .port.down .port-led-link { background: var(--udc-muted); }
      .port.poe-on .port-led-link { background: var(--udc-orange); box-shadow: 0 0 4px var(--udc-orange); }

      /* speed badges */
      .port.speed-10g  .port-socket::after { background: var(--udc-accent); }
      .port.speed-25g  .port-socket::after { background: #a855f7; }
      .port.speed-1g   .port-socket::after { background: var(--udc-green); }
      .port.speed-100m .port-socket::after { background: var(--udc-orange); }
      .port.speed-10m  .port-socket::after { background: var(--udc-muted); }

      /* special port (WAN/SFP) */
      .port.special {
        min-width: 38px;
        max-width: 56px;
      }
      .port.special .port-socket {
        height: 16px;
        border-radius: 3px 3px 0 0;
      }
      .port.special .port-num {
        font-size: 7px;
      }

      /* detail section */
      .section {
        padding: 12px 14px 14px;
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

      .detail-value.online  { color: var(--udc-green); }
      .detail-value.offline { color: var(--udc-muted); }

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
        background: var(--udc-accent);
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

      .empty-state, .loading-state {
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
        border-top-color: var(--udc-accent);
        border-radius: 50%;
        animation: spin .7s linear infinite;
        flex-shrink: 0;
      }

      @keyframes spin { to { transform: rotate(360deg); } }
    </style>`;
  }
  _speedClass(hass, slot) {
    const speedText = getPortSpeedText(hass, slot);
    if (!speedText || speedText === "\u2014") return "";
    const num = parseInt(speedText, 10);
    if (num >= 1e4) return "speed-10g";
    if (num >= 2500) return "speed-25g";
    if (num >= 1e3) return "speed-1g";
    if (num >= 100) return "speed-100m";
    if (num >= 10) return "speed-10m";
    return "";
  }
  _renderPortButton(slot, selectedKey) {
    const isSpecial = slot.kind === "special";
    const linkUp = isOn(this._hass, slot.link_entity, slot);
    const poeStatus = getPoeStatus(this._hass, slot);
    const poeOn = poeStatus.poeOn;
    const speedClass = linkUp ? this._speedClass(this._hass, slot) : "";
    const tooltip = [
      slot.port_label || (isSpecial ? slot.label : `${this._t("port_label")} ${slot.label}`),
      linkUp ? this._t("connected") : this._t("no_link"),
      linkUp ? getPortSpeedText(this._hass, slot) : null,
      poeOn ? "PoE ON" : null
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
    const discovered = discoverPorts(ctx?.entities || []);
    const numberedRaw = mergePortsWithLayout(ctx?.layout, discovered);
    const specialsRaw = mergeSpecialsWithLayout(
      ctx?.layout,
      discoverSpecialPorts(ctx?.entities || []),
      discovered
    );
    const wanPort = this._config?.wan_port;
    const { specials, numbered } = ctx?.type === "gateway" && wanPort && wanPort !== "auto" ? applyWanPortOverride(specialsRaw, numberedRaw, ctx?.layout, wanPort) : { specials: specialsRaw, numbered: numberedRaw };
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
      const linkUp = isOn(this._hass, selected.link_entity, selected);
      const linkText = getPortLinkText(this._hass, selected);
      const speedText = getPortSpeedText(this._hass, selected);
      const poeStatus = getPoeStatus(this._hass, selected);
      const hasPoe = poeStatus.hasPoe;
      const poeOn = poeStatus.poeOn;
      const poePower = hasPoe ? formatState(this._hass, selected.poe_power_entity, "\u2014") : "\u2014";
      const rxVal = selected.rx_entity ? formatState(this._hass, selected.rx_entity, null) : null;
      const txVal = selected.tx_entity ? formatState(this._hass, selected.tx_entity, null) : null;
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
            <div class="detail-value">${this._translateState(poeStatus.poeText)}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">${this._t("poe_power")}</div>
            <div class="detail-value">${poePower}</div>
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
          ${poeStatus.canToggle ? `<button class="action-btn primary" data-action="toggle-poe" data-entity="${selected.poe_switch_entity}">
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
    this.shadowRoot.querySelectorAll(".port").forEach((btn) => btn.addEventListener("click", () => this._selectKey(btn.dataset.key)));
    this.shadowRoot.querySelector("[data-action='toggle-port']")?.addEventListener("click", (e) => this._toggleEntity(e.currentTarget.dataset.entity));
    this.shadowRoot.querySelector("[data-action='toggle-poe']")?.addEventListener("click", (e) => this._toggleEntity(e.currentTarget.dataset.entity));
    this.shadowRoot.querySelector("[data-action='power-cycle']")?.addEventListener("click", (e) => this._pressButton(e.currentTarget.dataset.entity));
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
