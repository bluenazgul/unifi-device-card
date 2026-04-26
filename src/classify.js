import {
  AP_MODEL_PREFIXES,
  GATEWAY_MODEL_PREFIXES,
  resolveModelKey,
  SWITCH_MODEL_PREFIXES,
} from "./model-registry.js";

// Device classifier:
// prioritizes registry identity/capabilities first,
// then falls back to model-registry and lightweight name heuristics.

function normalizeModel(value) {
  return String(value ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function startsWithAny(value, prefixes) {
  return prefixes.some((prefix) => value.startsWith(prefix));
}

function fromModel(model) {
  if (startsWithAny(model, GATEWAY_MODEL_PREFIXES)) return "gateway";
  if (startsWithAny(model, SWITCH_MODEL_PREFIXES)) return "switch";
  if (startsWithAny(model, AP_MODEL_PREFIXES)) return "access_point";
  return null;
}

export function classifyDeviceType(identity, capabilities, entities = [], device = null) {
  const model = normalizeModel(identity?.model || identity?.hw_version || "");
  const manufacturer = String(identity?.manufacturer || "").toLowerCase();
  const name = String(identity?.name || "").toLowerCase();
  const translationKeys = new Set((entities || []).map((entity) => String(entity?.translation_key || "").toLowerCase()));

  const registryType = fromModel(model);
  if (registryType) return registryType;

  const gatewaySignals =
    model.startsWith("UXG") ||
    model.startsWith("UDM") ||
    model.startsWith("UCG") ||
    model.startsWith("UGW") ||
    name.includes("gateway") ||
    name.includes("router");
  if (gatewaySignals) return "gateway";

  const modelKey = resolveModelKey(device || identity || {});
  if (modelKey) {
    if (["UDM", "UDR", "UDMPRO", "UDMPROSE", "UXGPRO", "UXGL", "UGW3", "UGW4", "UGWXG", "UCGULTRA", "UCGMAX", "UCGFIBER"].includes(modelKey)) {
      return "gateway";
    }
    if (["USMINI", "USWULTRA", "US8P60", "US8P150", "USL8LP", "USL16LP", "US24PRO", "US48PRO"].includes(modelKey) || modelKey.startsWith("US")) {
      return "switch";
    }
  }

  if (capabilities?.ap_stats || capabilities?.uplink_mac) return "access_point";
  if (capabilities?.ports || capabilities?.port_control || capabilities?.poe_power) return "switch";

  if (manufacturer.includes("ubiquiti") || manufacturer.includes("unifi")) {
    if (name.includes("switch")) return "switch";
    if (name.includes("access point") || name.includes(" ap")) return "access_point";
  }

  if (translationKeys.has("port_control") || translationKeys.has("poe_port_control")) return "switch";
  if (translationKeys.has("device_uplink_mac")) return "access_point";

  const entityIds = (entities || []).map((e) => String(e?.entity_id || "").toLowerCase());
  if (entityIds.some((id) => id.includes("_port_") || id.includes("_sfp_"))) return "switch";

  return "unknown";
}
