import assert from "node:assert/strict";
import { getDeviceOutletEntities, getDeviceTelemetry } from "../src/helpers.js";
import { parseUnifiDeviceUniqueId } from "../src/unique-id.js";
import { getTranslations } from "../src/translations.js";
import {
  formatUpsNumber, formatUpsRuntime, getDefaultUpsOutlet, getUpsBatteryLevel,
  getUpsEntityDiagnostics, getUpsLoad, getUpsRuntimeSeconds, normalizeDefaultOutlet,
} from "../src/ups.js";

const mac = "aa:bb:cc:dd:ee:ff";
const batteryEntity = { entity_id: "sensor.renamed_charge", unique_id: `ups_battery_level-${mac}` };
const runtimeEntity = { entity_id: "sensor.renamed_duration", unique_id: `ups_battery_runtime-${mac}` };
const budgetEntity = { entity_id: "sensor.renamed_capacity", unique_id: `ac_power_budget-${mac}` };
const consumptionEntity = { entity_id: "sensor.renamed_total", unique_id: `ac_power_conumption-${mac}` };
const telemetryEntities = [batteryEntity, runtimeEntity, budgetEntity, consumptionEntity];
const context = { type: "ups", identity: { primary_mac: mac, model_id: "USWDA24" },
  ...getDeviceTelemetry(telemetryEntities), all_entities: telemetryEntities };
const hass = { language: "en", states: {
  [batteryEntity.entity_id]: { state: "76", attributes: { unit_of_measurement: "%" } },
  [runtimeEntity.entity_id]: { state: "1080", attributes: { unit_of_measurement: "s" } },
  [budgetEntity.entity_id]: { state: "1000", attributes: { unit_of_measurement: "W" } },
  [consumptionEntity.entity_id]: { state: "420", attributes: { unit_of_measurement: "W" } },
} };
assert.equal(context.ups_power_budget_entity, budgetEntity.entity_id);
assert.equal(context.ups_power_consumption_entity, consumptionEntity.entity_id);
assert.equal(parseUnifiDeviceUniqueId(consumptionEntity.unique_id).feature, "ac_power_consumption");
assert.equal(parseUnifiDeviceUniqueId(`ac_power_consumption-${mac}`).feature, "ac_power_consumption");
assert.equal(getUpsBatteryLevel(hass, context), 76);
assert.equal(getUpsRuntimeSeconds(hass, context), 1080);
assert.equal(formatUpsRuntime(hass, 1080), "18 min");
assert.equal(formatUpsRuntime({ language: "de" }, 1080), "18 Min.");
assert.equal(formatUpsRuntime(hass, 3660), "1 hr 1 min");
assert.equal(formatUpsRuntime(hass, 45), "45 sec");
assert.equal(formatUpsRuntime(hass, 0), "0 sec");
assert.equal(formatUpsRuntime(hass, null), "—");
assert.equal(formatUpsRuntime(hass, -1), "—");
assert.equal(formatUpsRuntime(hass, Infinity), "—");
assert.equal(formatUpsNumber({ language: "bad_locale!" }, 50), "50");
assert.deepEqual(getUpsLoad(hass, context), { budget: 1000, consumption: 420, percent: 42 });
assert.equal(getUpsLoad(hass, { ups_output_power_entity: consumptionEntity.entity_id, ups_power_budget_entity: budgetEntity.entity_id }), null,
  "UPS battery-pool power must not be mixed with an unrelated AC budget");
for (const raw of ["unknown", "unavailable", "", "5oops", "-1", "Infinity"]) {
  const changed = { ...hass, states: { ...hass.states, [batteryEntity.entity_id]: { state: raw } } };
  assert.equal(getUpsBatteryLevel(changed, context), null);
}
assert.equal(getUpsBatteryLevel({ states: { [batteryEntity.entity_id]: { state: "101" } } }, context), null);
assert.equal(getUpsBatteryLevel({ states: { [batteryEntity.entity_id]: { state: "0" } } }, context), 0);
for (const [unit, raw, expected] of [["min", "18", 1080], ["h", "1.5", 5400], ["s", "0", 0], ["W", "18", null]]) {
  assert.equal(getUpsRuntimeSeconds({ states: { [runtimeEntity.entity_id]: { state: raw, attributes: { unit_of_measurement: unit } } } }, context), expected);
}
for (const [unit, raw, expected] of [["kW", "0.42", 42], ["W", "0", 0], ["W", "1500", 150], ["VA", "420", null], ["", "420", null], ["W", "unknown", null]]) {
  const changed = { ...hass, states: { ...hass.states, [consumptionEntity.entity_id]: { state: raw, attributes: { unit_of_measurement: unit } } } };
  assert.equal(getUpsLoad(changed, context)?.percent ?? null, expected);
}
assert.equal(getUpsLoad({ ...hass, states: { ...hass.states, [budgetEntity.entity_id]: { state: "0", attributes: { unit_of_measurement: "W" } } } }, context), null);
assert.equal(getUpsLoad({}, {}), null);
assert.ok(Math.abs(getUpsLoad({}, { fake_device: true, preview_ups: { power_budget: 1000, power_consumption: 280 } }).percent - 28) < 1e-10);

const relay = { entity_id: "switch.renamed_server", unique_id: `outlet-${mac}_1`, original_name: "Server from Console", name: "HA override" };
const meter = { entity_id: "sensor.renamed_server_watts", unique_id: `outlet_power-${mac}_1`, hidden_by: "user", translation_placeholders: { outlet_name: "Server from Console" } };
assert.equal(getDeviceOutletEntities([relay, meter], context.identity)[0].label, "Server from Console");
assert.equal(getDeviceOutletEntities([meter], context.identity)[0].label, "Server from Console");
assert.equal(getDeviceOutletEntities([{ ...relay, original_name: null }], context.identity)[0].label, "HA override");
const outlets = getDeviceOutletEntities([relay, { ...relay, unique_id: `outlet-${mac}_3`, entity_id: "switch.nas", original_name: "NAS" }]);
assert.equal(normalizeDefaultOutlet("3"), 3);
for (const invalid of [0, -1, 2.5, "bad", {}, true]) assert.equal(normalizeDefaultOutlet(invalid), null);
assert.equal(getDefaultUpsOutlet(outlets, 3).label, "NAS");
assert.equal(getDefaultUpsOutlet(outlets, 2).label, "Server from Console");
assert.equal(getDefaultUpsOutlet([], 3), null);

const diagnosticContext = { ...context, all_entities: [
  ...telemetryEntities.map((entity) => entity === runtimeEntity ? { ...entity, disabled_by: "user" } : entity),
  relay, meter,
] };
const diagnosticHass = { ...hass, states: { ...hass.states,
  [relay.entity_id]: { state: "unavailable" },
  [meter.entity_id]: { state: "125" },
} };
const diagnostics = getUpsEntityDiagnostics(diagnosticContext, diagnosticHass);
assert.ok(diagnostics.some((row) => row.key === "ups_battery_runtime" && row.status === "disabled"));
assert.ok(diagnostics.some((row) => row.key === "ups_outlet_control" && row.status === "unavailable" && row.label === "Server from Console"));
assert.ok(diagnostics.some((row) => row.key === "ups_output_power" && row.status === "not_exposed"));
assert.ok(!diagnostics.some((row) => row.key === "ups_outlet_power"), "hidden enabled metering is usable");
assert.ok(!diagnostics.some((row) => row.key === "ups_power_budget"), "optional AC sensors are not required when available");
const noTelemetryDiagnostics = getUpsEntityDiagnostics(diagnosticContext, diagnosticHass, false);
assert.ok(noTelemetryDiagnostics.every((row) => row.key.startsWith("ups_outlet")));
assert.deepEqual(getUpsEntityDiagnostics({ ...diagnosticContext, fake_device: true }, diagnosticHass), []);
assert.deepEqual(getUpsEntityDiagnostics({ type: "switch" }, diagnosticHass), []);
const absentDiagnostics = getUpsEntityDiagnostics({ ...context, all_entities: [] }, {});
assert.ok(absentDiagnostics.some((row) => row.key === "ups_outlets" && row.status === "not_exposed"));
assert.ok(!absentDiagnostics.some((row) => row.key === "ups_power_budget"));
assert.ok(getUpsEntityDiagnostics({ ...context, all_entities: [budgetEntity] }, hass)
  .some((row) => row.key === "ups_power_consumption" && row.status === "not_exposed"));
assert.ok(!diagnostics.some((row) => row.key.includes("poe")));

const keys = ["ups_load", "ups_power_budget", "ups_power_consumption", "ups_outlet_count", "ups_outlet_unknown_count",
  "ups_outlet_switching", "ups_outlet_action_failed", "ups_outlet_no_confirmation", "ups_confirm_outlet_off", "ups_preview",
  "ups_diagnostics", "ups_diagnostics_disabled", "ups_diagnostics_unavailable", "ups_diagnostics_not_exposed",
  "ups_diagnostics_not_exposed_hint", "ups_outlet_control", "editor_default_outlet_label", "editor_default_outlet_first",
  "editor_default_outlet_hint", "editor_outlet_power_badges_text", "editor_confirm_outlet_off_text", "editor_confirm_outlet_off_hint",
  "editor_ups_telemetry_text", "editor_ups_telemetry_hint"];
for (const language of ["en", "de", "nl", "fr", "es", "it", "sv", "da", "no", "fi", "pl", "cs"]) {
  for (const key of keys) assert.ok(getTranslations(language)[key], `${language} is missing ${key}`);
}
console.log("UPS battery, load, naming and diagnostics checks passed.");
