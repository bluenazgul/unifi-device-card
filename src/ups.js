import { normalizeMac } from "./identity.js";
import { parseUnifiDeviceUniqueId, parseUnifiOutletUniqueId } from "./unique-id.js";

export const UPS_TELEMETRY_KEYS = [
  "ups_battery_level", "ups_battery_runtime", "ups_output_power", "ups_output_current",
  "ups_output_voltage", "ups_input_voltage", "ups_bypass_voltage", "ups_output_power_factor",
];

function numberState(hass, entityId) {
  const raw = hass?.states?.[entityId]?.state;
  if (raw == null || String(raw).trim() === "") return null;
  const number = Number(String(raw).replace(",", "."));
  return Number.isFinite(number) && number >= 0 ? number : null;
}

export function getUpsBatteryLevel(hass, context) {
  const level = context?.fake_device
    ? context.preview_ups?.battery_level
    : numberState(hass, context?.ups_battery_level_entity);
  return Number.isFinite(level) && level >= 0 && level <= 100 ? level : null;
}

export function getUpsRuntimeSeconds(hass, context) {
  if (context?.fake_device) return context.preview_ups?.battery_runtime ?? null;
  const entityId = context?.ups_battery_runtime_entity;
  const value = numberState(hass, entityId);
  if (value == null) return null;
  const unit = String(hass?.states?.[entityId]?.attributes?.unit_of_measurement || "s").toLowerCase();
  const factor = { s: 1, sec: 1, second: 1, seconds: 1, min: 60, minute: 60, minutes: 60,
    h: 3600, hr: 3600, hour: 3600, hours: 3600, d: 86400, day: 86400, days: 86400 }[unit];
  return factor ? value * factor : null;
}

export function formatUpsNumber(hass, value, options = {}) {
  try {
    return new Intl.NumberFormat(hass?.language || hass?.locale?.language || "en", options).format(value);
  } catch {
    return new Intl.NumberFormat("en", options).format(value);
  }
}

export function formatUpsRuntime(hass, seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "—";
  const rounded = Math.floor(seconds);
  const unit = (value, name) => formatUpsNumber(hass, value, { style: "unit", unit: name, unitDisplay: "short" });
  if (rounded < 60) return unit(rounded, "second");
  const hours = Math.floor(rounded / 3600);
  const minutes = Math.floor((rounded % 3600) / 60);
  return hours ? [unit(hours, "hour"), ...(minutes ? [unit(minutes, "minute")] : [])].join(" ") : unit(minutes, "minute");
}

function powerWatts(hass, entityId) {
  const value = numberState(hass, entityId);
  const unit = String(hass?.states?.[entityId]?.attributes?.unit_of_measurement || "").toLowerCase();
  if (value == null || !["w", "kw"].includes(unit)) return null;
  return value * (unit === "kw" ? 1000 : 1);
}

export function getUpsLoad(hass, context) {
  // The AC budget and consumption describe the same outlet power scope.
  // Do not substitute battery-pool output power or an assumed model rating.
  const preview = context?.preview_power || context?.preview_ups;
  const budget = context?.fake_device ? preview?.power_budget : powerWatts(hass, context?.ups_power_budget_entity);
  const consumption = context?.fake_device ? preview?.power_consumption : powerWatts(hass, context?.ups_power_consumption_entity);
  if (!Number.isFinite(budget) || budget <= 0 || !Number.isFinite(consumption) || consumption < 0) return null;
  const percent = consumption / budget * 100;
  return Number.isFinite(percent) ? { budget, consumption, percent } : null;
}

export function normalizeDefaultOutlet(value) {
  if (typeof value !== "string" && typeof value !== "number") return null;
  const index = Number(value);
  return Number.isInteger(index) && index > 0 ? index : null;
}

export function getDefaultUpsOutlet(outlets, value) {
  return (outlets || []).find((outlet) => outlet.index === normalizeDefaultOutlet(value)) || outlets?.[0] || null;
}

export function getUpsEntityDiagnostics(context, hass, showTelemetry = true) {
  if (!["ups", "power_distribution"].includes(context?.type) || context?.fake_device) return [];
  const entities = context.all_entities || context.telemetry_entities || context.entities || [];
  const rows = [];
  const check = (key, candidates, label = "") => {
    const enabled = candidates.filter((entity) => !entity.disabled_by);
    if (enabled.some((entity) => {
      const state = hass?.states?.[entity.entity_id]?.state;
      return state != null && !["", "unknown", "unavailable"].includes(String(state));
    })) return;
    rows.push({ key, label, status: enabled.length ? "unavailable" : candidates.length ? "disabled" : "not_exposed" });
  };
  const sensorCandidates = (feature, translationKey = feature, entityId = null) => entities.filter((entity) =>
    String(entity.entity_id || "").startsWith("sensor.") && (
      entity.entity_id === entityId || parseUnifiDeviceUniqueId(entity.unique_id)?.feature === feature ||
      entity.translation_key === translationKey
    )
  );
  if (showTelemetry) {
    const keys = context.type === "ups"
      ? UPS_TELEMETRY_KEYS.filter((key) => !["ups_input_voltage", "ups_bypass_voltage"].includes(key)) : [];
    const model = context.identity?.model_id || context.device?.model_id;
    if (model === "USPDA2B") keys.push("ups_input_voltage");
    if (model === "USWDA25") keys.push("ups_bypass_voltage");
    for (const key of keys) check(key, sensorCandidates(key, key, context[`${key}_entity`]));
    const acChecks = [
      ["ups_power_budget", "ac_power_budget", "smartpower_ac_power_budget"],
      ["ups_power_consumption", "ac_power_consumption", "smartpower_ac_power_consumption"],
    ].map(([key, feature, tk]) => ({ key, candidates: sensorCandidates(feature, tk, context[`${key}_entity`]) }));
    if (acChecks.some((item) => item.candidates.length)) {
      for (const item of acChecks) check(item.key, item.candidates);
    }
  }

  const outlets = new Map();
  const mac = normalizeMac(context.identity?.primary_mac);
  for (const entity of entities) {
    const parsed = parseUnifiOutletUniqueId(entity.unique_id);
    if (!parsed || (mac && parsed.mac !== mac)) continue;
    const domain = String(entity.entity_id || "").split(".")[0];
    if ((parsed.feature === "outlet_control" && domain !== "switch") ||
        (parsed.feature === "outlet_power" && domain !== "sensor")) continue;
    const group = outlets.get(parsed.outlet) || { control: [], power: [] };
    group[parsed.feature === "outlet_control" ? "control" : "power"].push(entity);
    outlets.set(parsed.outlet, group);
  }
  if (!outlets.size) check("ups_outlets", []);
  for (const [index, group] of Array.from(outlets).sort(([a], [b]) => a - b)) {
    const control = group.control[0];
    const label = control?.original_name || group.power[0]?.translation_placeholders?.outlet_name ||
      control?.name || `Outlet ${index}`;
    check("ups_outlet_control", group.control, label);
    // Strip outlets and PDU USB relays may legitimately have no metering.
    if (context.type === "ups" || group.power.length) check("ups_outlet_power", group.power, label);
  }
  return rows;
}
