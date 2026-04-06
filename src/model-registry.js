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

export const MODEL_REGISTRY = {
  US8P60: {
    kind: "switch", frontStyle: "single-row", rows: [range(1, 8)],
    portCount: 8, displayModel: "US 8 60W", theme: "silver", specialSlots: [],
  },
  USMINI: {
    kind: "switch", frontStyle: "single-row", rows: [range(1, 5)],
    portCount: 5, displayModel: "USW Flex Mini", theme: "white", specialSlots: [],
  },
  USWED35: {
    kind: "switch", frontStyle: "single-row", rows: [range(1, 5)],
    portCount: 5, displayModel: "USW Flex Mini 2.5G", theme: "white", specialSlots: [],
  },
  USL8LP: {
    kind: "switch", frontStyle: "single-row", rows: [range(1, 8)],
    portCount: 8, displayModel: "USW Lite 8 PoE", theme: "white", specialSlots: [],
  },
  USL8LPB: {
    kind: "switch", frontStyle: "single-row", rows: [range(1, 8)],
    portCount: 8, displayModel: "USW Lite 8 PoE", theme: "white", specialSlots: [],
  },
  USL16LP: {
    kind: "switch", frontStyle: "dual-row", rows: [oddRange(1, 16), evenRange(1, 16)],
    portCount: 16, displayModel: "USW Lite 16 PoE", theme: "white", specialSlots: [],
  },
  USL16LPB: {
    kind: "switch", frontStyle: "dual-row", rows: [oddRange(1, 16), evenRange(1, 16)],
    portCount: 16, displayModel: "USW Lite 16 PoE", theme: "white", specialSlots: [],
  },

  US16P150: {
    kind: "switch", frontStyle: "dual-row", rows: [range(1, 8), range(9, 16)],
    portCount: 18, displayModel: "US 16 PoE 150W", theme: "silver",
    specialSlots: [
      { key: "sfp_1", label: "SFP 1", port: 17 },
      { key: "sfp_2", label: "SFP 2", port: 18 },
    ],
  },

  USW24P: {
    kind: "switch", frontStyle: "six-grid",
    rows: [range(1, 6), range(7, 12), range(13, 18), range(19, 24)],
    portCount: 24, displayModel: "USW 24 PoE", theme: "silver", specialSlots: [],
  },

  US24PRO2: {
    kind: "switch", frontStyle: "six-grid",
    rows: [range(1, 6), range(7, 12), range(13, 18), range(19, 24)],
    portCount: 26, displayModel: "USW Pro 24", theme: "silver",
    specialSlots: [
      { key: "sfp_1", label: "SFP+ 1", port: 25 },
      { key: "sfp_2", label: "SFP+ 2", port: 26 },
    ],
  },

  USW48P: {
    kind: "switch", frontStyle: "quad-row",
    rows: [range(1, 12), range(13, 24), range(25, 36), range(37, 48)],
    portCount: 48, displayModel: "USW 48 PoE", theme: "silver", specialSlots: [],
  },

  US48PRO: {
    kind: "switch", frontStyle: "quad-row",
    rows: [oddRange(1, 24), evenRange(1, 24), oddRange(25, 48), evenRange(25, 48)],
    portCount: 52, displayModel: "USW Pro 48 PoE", theme: "silver",
    specialSlots: [
      { key: "sfp_1", label: "SFP+ 1", port: 49 },
      { key: "sfp_2", label: "SFP+ 2", port: 50 },
      { key: "sfp_3", label: "SFP+ 3", port: 51 },
      { key: "sfp_4", label: "SFP+ 4", port: 52 },
    ],
  },

  // ── Cloud Gateways ────────────────────────────────
  //
  // UCG-Ultra / UDR-ULT
  //   5 physical ports: 4× 1G RJ45 (LAN 1–4) + 1× 2.5G RJ45 (Port 5, default WAN)
  //   Max WAN ports: 4 (any port can be remapped)
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

  // UCG-Max
  //   5 physical ports: 4× 2.5G RJ45 (LAN 1–4) + 1× 2.5G RJ45 (Port 5, default WAN)
  //   Max WAN ports: 4 (any port can be remapped)
  UCGMAX: {
    kind: "gateway", frontStyle: "gateway-single-row", rows: [[1, 2, 3, 4]],
    portCount: 5, displayModel: "Cloud Gateway Max", theme: "white",
    specialSlots: [{ key: "wan", label: "WAN", port: 5 }],
  },

  // UCG-Fiber
  //   7 physical ports:
  //     Ports 1–4 : 2.5G RJ45 (LAN, port 4 has PoE+, all WAN-capable)
  //     Port 5    : 10G RJ45 (default WAN, LAN-capable)
  //     Port 6    : 10G SFP+ (LAN default, WAN-capable)
  //     Port 7    : 10G SFP+ (default WAN 2, LAN-capable)
  //   Max WAN ports: 6 (all ports can be remapped)
  //   Note: port numbers are assumed based on physical order; verify against real HA entity IDs.
  UCGFIBER: {
    kind: "gateway", frontStyle: "gateway-single-row", rows: [[1, 2, 3, 4]],
    portCount: 7, displayModel: "Cloud Gateway Fiber", theme: "white",
    specialSlots: [
      { key: "wan", label: "WAN", port: 5 },
      { key: "sfp_1", label: "SFP+ 1", port: 6 },
      { key: "sfp_2", label: "SFP+ 2", port: 7 },
    ],
  },

  // UDR
  //   5 physical ports:
  //     Ports 1–4 : 1G RJ45 (LAN, ports 3-4 has PoE,)
  //     Port 5    : 1G RJ45 (WAN)
  UDR: {
    kind: "gateway", frontStyle: "gateway-single-row", rows: [[1, 2, 3, 4]],
    portCount: 7, displayModel: "Dream Router", theme: "white",
    specialSlots: [
      { key: "wan", label: "WAN", port: 5 },
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
  UDMSE: {
    kind: "gateway", frontStyle: "gateway-rack", rows: [range(1, 8)],
    portCount: 11, displayModel: "UDM SE", theme: "silver",
    specialSlots: [
      { key: "wan",   label: "WAN",    port: 9  },
      { key: "sfp_1", label: "SFP+ 1", port: 10 },
      { key: "sfp_2", label: "SFP+ 2", port: 11 },
    ],
  },

  // ── USW Ultra family ──────────────────────────────
  USWULTRA: {
    kind: "switch", frontStyle: "ultra-row", rows: [range(1, 7)],
    portCount: 8, displayModel: "USW Ultra", theme: "white",
    specialSlots: [{ key: "uplink", label: "Uplink", port: 8 }],
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
};

export function resolveModelKey(device) {
  const candidates = [device?.model, device?.hw_version, device?.name, device?.name_by_user]
    .filter(Boolean)
    .map(normalizeModelKey);

  for (const candidate of candidates) {
    if (!candidate) continue;
    if (MODEL_REGISTRY[candidate]) return candidate;

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

    if (candidate.includes("US8P60"))         return "US8P60";
    if (candidate.includes("US860W"))         return "US8P60";

    if (candidate.includes("USMINI"))         return "USMINI";
    if (candidate.includes("FLEXMINI"))       return "USMINI";
    if (candidate.includes("USWFLEXMINI"))    return "USMINI";
    if (candidate.includes("USWED35"))        return "USWED35";

    // US 16 PoE 150W — before generic US16 patterns
    if (candidate.includes("US16P150"))       return "US16P150";
    if (candidate.includes("US16POE150"))     return "US16P150";
    if (candidate.includes("US16P"))          return "US16P150";

    // USW Pro 24 — before generic USW24 pattern
    if (candidate.includes("US24PRO2"))       return "US24PRO2";
    if (candidate.includes("US24PRO"))        return "US24PRO2";
    if (candidate.includes("USWPRO24"))       return "US24PRO2";
    if (candidate.includes("SWITCHPRO24"))    return "US24PRO2";

    // USW Pro 24 — before generic USW24 pattern
    if (candidate.includes("US48PRO2"))       return "US48PRO";
    if (candidate.includes("US48PRO"))        return "US48PRO";
    if (candidate.includes("USWPRO48"))       return "US48PRO";
    if (candidate.includes("SWITCHPRO48"))    return "US48PRO";

    // Cloud Gateways — UCGFIBER before UCGMAX/UCGULTRA to avoid partial matches
    if (candidate.includes("UCGFIBER"))           return "UCGFIBER";
    if (candidate.includes("CLOUDGATEWAYFIBER"))  return "UCGFIBER";
    if (candidate.includes("UDMA6A8"))  return "UCGFIBER";

    if (candidate.includes("UDRULT"))             return "UDRULT";
    if (candidate.includes("UCGULTRA"))           return "UCGULTRA";
    if (candidate.includes("CLOUDGATEWAYULTRA"))  return "UCGULTRA";
    if (candidate.includes("UCGMAX"))             return "UCGMAX";
    if (candidate.includes("CLOUDGATEWAYMAX"))    return "UCGMAX";
    if (candidate === "UDR")                      return "UDR";
    if (candidate.includes("UDMPRO"))             return "UDMPRO";
    if (candidate.includes("UDMSE"))              return "UDMSE";

    if (candidate === "USWULTRA")              return "USWULTRA";
    if (candidate === "USWULTRA60W")           return "USWULTRA60W";
    if (candidate === "USWULTRA210W")          return "USWULTRA210W";
    if (candidate.includes("USWULTRA210"))     return "USWULTRA210W";
    if (candidate.includes("USWULTRA60"))      return "USWULTRA60W";
    if (candidate.includes("USWULTRA"))        return "USWULTRA";
    if (candidate.includes("SWITCHULTRA210"))  return "USWULTRA210W";
    if (candidate.includes("SWITCHULTRA60"))   return "USWULTRA60W";
    if (candidate.includes("SWITCHULTRA"))     return "USWULTRA";
    if (candidate.includes("USM8P"))           return "USWULTRA";

    // Generic — must come AFTER specific models above
    if (candidate.includes("USW24"))  return "USW24P";
    if (candidate.includes("USW48"))  return "USW48P";
  }

  return null;
}

export function inferPortCountFromModel(device) {
  const text = normalizeModelKey(
    [device?.model, device?.name, device?.name_by_user].filter(Boolean).join(" ")
  );

  if (text.includes("USL16LPB") || text.includes("USL16LP") || text.includes("USWLITE16POE") || text.includes("LITE16")) return 16;
  if (text.includes("USL8LPB")  || text.includes("USL8LP")  || text.includes("USWLITE8POE")  || text.includes("LITE8"))  return 8;
  if (text.includes("US8P60")   || text.includes("US8"))     return 8;
  if (text.includes("USMINI")   || text.includes("FLEXMINI")) return 5;

  if (text.includes("US16P150") || text.includes("US16P"))   return 18;
  if (text.includes("US24PRO2") || text.includes("US24PRO") || text.includes("USWPRO24")) return 26;
  if (text.includes("US48PRO2") || text.includes("US48PRO") || text.includes("USWPRO48")) return 52;

  // UCGFIBER before UCGULTRA/UCGMAX to avoid partial matches
  if (text.includes("UCGFIBER") || text.includes("CLOUDGATEWAYFIBER")) return 7;
  if (text.includes("UCGULTRA") || text.includes("CLOUDGATEWAYULTRA") || text.includes("UDRULT")) return 5;
  if (text.includes("UCGMAX")   || text.includes("CLOUDGATEWAYMAX"))  return 5;
  if (text.includes("UDMPRO")   || text.includes("UDMSE"))            return 11;
  if (text.includes("USWULTRA")) return 7;

  if (text.includes("48"))  return 48;
  if (text.includes("24"))  return 24;

  return null;
}

export function getDeviceLayout(device, discoveredPorts = []) {
  const modelKey = resolveModelKey(device);
  if (modelKey && MODEL_REGISTRY[modelKey]) {
    return { modelKey, ...MODEL_REGISTRY[modelKey] };
  }

  const inferredPortCount =
    inferPortCountFromModel(device) ||
    (discoveredPorts.length > 0 ? Math.max(...discoveredPorts.map((p) => p.port)) : 0);

  if (inferredPortCount > 0) {
    return { modelKey: null, ...defaultSwitchLayout(inferredPortCount), displayModel: device?.model || `UniFi Device (${inferredPortCount}p)` };
  }

  return { modelKey: null, kind: "gateway", frontStyle: "gateway-generic", rows: [], portCount: 0, displayModel: device?.model || "UniFi Gateway", specialSlots: [] };
}
