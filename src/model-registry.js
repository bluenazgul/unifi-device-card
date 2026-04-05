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
  return String(value ?? "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

function defaultSwitchLayout(portCount) {
  if (portCount <= 8) {
    return {
      kind: "switch",
      frontStyle: "single-row",
      rows: [range(1, portCount)],
      portCount,
      specialSlots: [],
    };
  }

  if (portCount === 16) {
    return {
      kind: "switch",
      frontStyle: "dual-row",
      rows: [oddRange(1, 16), evenRange(1, 16)],
      portCount,
      specialSlots: [],
    };
  }

  if (portCount === 24) {
    return {
      kind: "switch",
      frontStyle: "dual-row",
      rows: [range(1, 12), range(13, 24)],
      portCount,
      specialSlots: [],
    };
  }

  if (portCount === 48) {
    return {
      kind: "switch",
      frontStyle: "quad-row",
      rows: [range(1, 12), range(13, 24), range(25, 36), range(37, 48)],
      portCount,
      specialSlots: [],
    };
  }

  return {
    kind: "switch",
    frontStyle: "single-row",
    rows: [range(1, portCount)],
    portCount,
    specialSlots: [],
  };
}

export const MODEL_REGISTRY = {
  US8P60: {
    kind: "switch",
    frontStyle: "single-row",
    rows: [range(1, 8)],
    portCount: 8,
    displayModel: "US 8 60W",
    specialSlots: [],
  },

  USMINI: {
    kind: "switch",
    frontStyle: "single-row",
    rows: [range(1, 5)],
    portCount: 5,
    displayModel: "USW Flex Mini",
    specialSlots: [],
  },

  USL8LP: {
    kind: "switch",
    frontStyle: "single-row",
    rows: [range(1, 8)],
    portCount: 8,
    displayModel: "USW Lite 8 PoE",
    specialSlots: [],
  },

  USL8LPB: {
    kind: "switch",
    frontStyle: "single-row",
    rows: [range(1, 8)],
    portCount: 8,
    displayModel: "USW Lite 8 PoE",
    specialSlots: [],
  },

  USL16LP: {
    kind: "switch",
    frontStyle: "dual-row",
    rows: [oddRange(1, 16), evenRange(1, 16)],
    portCount: 16,
    displayModel: "USW Lite 16 PoE",
    specialSlots: [],
  },

  USL16LPB: {
    kind: "switch",
    frontStyle: "dual-row",
    rows: [oddRange(1, 16), evenRange(1, 16)],
    portCount: 16,
    displayModel: "USW Lite 16 PoE",
    specialSlots: [],
  },

  UDRULT: {
    kind: "gateway",
    frontStyle: "gateway-single-row",
    rows: [[1, 2, 3, 4]],
    portCount: 4,
    displayModel: "Cloud Gateway Ultra",
    specialSlots: [{ key: "wan", label: "WAN" }],
  },

  UCGULTRA: {
    kind: "gateway",
    frontStyle: "gateway-single-row",
    rows: [[1, 2, 3, 4]],
    portCount: 4,
    displayModel: "Cloud Gateway Ultra",
    specialSlots: [{ key: "wan", label: "WAN" }],
  },

  UCGMAX: {
    kind: "gateway",
    frontStyle: "gateway-single-row",
    rows: [[1, 2, 3, 4, 5]],
    portCount: 5,
    displayModel: "Cloud Gateway Max",
    specialSlots: [{ key: "wan", label: "WAN" }],
  },

  UDMPRO: {
    kind: "gateway",
    frontStyle: "gateway-rack",
    rows: [range(1, 8)],
    portCount: 8,
    displayModel: "UDM Pro",
    specialSlots: [
      { key: "wan", label: "WAN" },
      { key: "sfp_wan", label: "WAN SFP+" },
      { key: "sfp_lan", label: "LAN SFP+" },
    ],
  },

  UDMSE: {
    kind: "gateway",
    frontStyle: "gateway-rack",
    rows: [range(1, 8)],
    portCount: 8,
    displayModel: "UDM SE",
    specialSlots: [
      { key: "wan", label: "WAN" },
      { key: "sfp_wan", label: "WAN SFP+" },
      { key: "sfp_lan", label: "LAN SFP+" },
    ],
  },
};

export function resolveModelKey(device) {
  const candidates = [
    device?.model,
    device?.hw_version,
    device?.name,
    device?.name_by_user,
  ]
    .filter(Boolean)
    .map(normalizeModelKey);

  for (const candidate of candidates) {
    if (!candidate) continue;

    if (MODEL_REGISTRY[candidate]) return candidate;

    if (candidate.includes("USL16LPB")) return "USL16LPB";
    if (candidate.includes("USL16LP")) return "USL16LP";
    if (candidate.includes("USL8LPB")) return "USL8LPB";
    if (candidate.includes("USL8LP")) return "USL8LP";
    if (candidate.includes("US8P60")) return "US8P60";
    if (candidate.includes("USMINI")) return "USMINI";

    if (candidate.includes("UDRULT")) return "UDRULT";
    if (candidate.includes("UCGULTRA")) return "UCGULTRA";
    if (candidate.includes("CLOUDGATEWAYULTRA")) return "UCGULTRA";
    if (candidate.includes("UCGMAX")) return "UCGMAX";
    if (candidate.includes("CLOUDGATEWAYMAX")) return "UCGMAX";
    if (candidate.includes("UDMPRO")) return "UDMPRO";
    if (candidate.includes("UDMSE")) return "UDMSE";
  }

  return null;
}

export function inferPortCountFromModel(device) {
  const text = normalizeModelKey(
    [device?.model, device?.name, device?.name_by_user].filter(Boolean).join(" ")
  );

  if (text.includes("USL16LPB")) return 16;
  if (text.includes("USL16LP")) return 16;
  if (text.includes("LITE16")) return 16;

  if (text.includes("USL8LPB")) return 8;
  if (text.includes("USL8LP")) return 8;
  if (text.includes("LITE8")) return 8;
  if (text.includes("US8P60")) return 8;
  if (text.includes("US8")) return 8;

  if (text.includes("USMINI")) return 5;
  if (text.includes("FLEXMINI")) return 5;

  if (text.includes("UCGULTRA")) return 4;
  if (text.includes("CLOUDGATEWAYULTRA")) return 4;
  if (text.includes("UCGMAX")) return 5;
  if (text.includes("UDMPRO")) return 8;
  if (text.includes("UDMSE")) return 8;

  if (text.includes("24")) return 24;
  if (text.includes("48")) return 48;

  return null;
}

export function getDeviceLayout(device, discoveredPorts = []) {
  const modelKey = resolveModelKey(device);
  if (modelKey && MODEL_REGISTRY[modelKey]) {
    return {
      modelKey,
      ...MODEL_REGISTRY[modelKey],
    };
  }

  const inferredPortCount =
    inferPortCountFromModel(device) ||
    Math.max(...discoveredPorts.map((p) => p.port), 0);

  if (inferredPortCount > 0) {
    return {
      modelKey: null,
      ...defaultSwitchLayout(inferredPortCount),
      displayModel: device?.model || `UniFi Device ${inferredPortCount}`,
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
