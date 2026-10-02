import assert from "node:assert/strict";

import { classifyDeviceType } from "../src/classify.js";
import {
  getDeviceTelemetry,
  getUnavailableHeaderTelemetryKeys,
  hasUpsFrontDisplay,
} from "../src/helpers.js";
import { getTranslations } from "../src/translations.js";

const entities = [
  ["ups_battery_level", "sensor.ups_battery_level"],
  ["ups_battery_runtime", "sensor.ups_battery_runtime"],
  ["ups_output_power", "sensor.ups_output_power"],
  ["ups_output_current", "sensor.ups_output_current"],
  ["ups_output_voltage", "sensor.ups_output_voltage"],
  ["ups_input_voltage", "sensor.ups_input_voltage"],
  ["ups_output_power_factor", "sensor.ups_output_power_factor"],
].map(([translation_key, entity_id]) => ({ translation_key, entity_id }));

assert.equal(
  classifyDeviceType(
    { model_id: "USPDA2B", manufacturer: "Ubiquiti", name: "UPS 2U Pro" },
    {},
    entities
  ),
  "ups"
);

assert.equal(
  classifyDeviceType(
    { model_id: "USWDA25", manufacturer: "Ubiquiti", name: "UPS 2U" },
    { ports: true },
    entities
  ),
  "ups",
  "UPS identification must take precedence over switch-like port capabilities"
);

const telemetry = getDeviceTelemetry(entities);
for (const entity of entities) {
  assert.equal(telemetry[`${entity.translation_key}_entity`], entity.entity_id);
}
assert.equal(telemetry.ups_bypass_voltage_entity, null);

const overlappingPowerTelemetry = getDeviceTelemetry([
  { entity_id: "sensor.rack_ups_output_power_factor" },
  { entity_id: "sensor.rack_ups_output_power" },
]);
assert.equal(overlappingPowerTelemetry.ups_output_power_entity, "sensor.rack_ups_output_power");
assert.equal(
  overlappingPowerTelemetry.ups_output_power_factor_entity,
  "sensor.rack_ups_output_power_factor"
);

assert.equal(hasUpsFrontDisplay({ model_id: "USPDA2B" }), true);
assert.equal(hasUpsFrontDisplay({ model: "USWDA25" }), false);

const completeProContext = {
  type: "ups",
  identity: { model_id: "USPDA2B" },
  ...telemetry,
};
assert.deepEqual(getUnavailableHeaderTelemetryKeys(completeProContext), []);
assert.deepEqual(
  getUnavailableHeaderTelemetryKeys({
    ...completeProContext,
    ups_battery_runtime_entity: null,
    ups_output_power_factor_entity: null,
  }),
  ["ups_battery_runtime", "ups_output_power_factor"]
);
assert.ok(
  !getUnavailableHeaderTelemetryKeys(completeProContext).includes("cpu_utilization"),
  "UPS telemetry warnings must not require switch, gateway, or AP telemetry"
);
const complete2UContext = {
  ...completeProContext,
  identity: { model_id: "USWDA25" },
  ups_input_voltage_entity: null,
  ups_bypass_voltage_entity: "sensor.ups_bypass_voltage",
};
assert.deepEqual(getUnavailableHeaderTelemetryKeys(complete2UContext), []);

const upsTranslationKeys = [
  "ups_telemetry",
  "ups_battery_level",
  "ups_battery_runtime",
  "ups_output_power",
  "ups_output_current",
  "ups_output_voltage",
  "ups_input_voltage",
  "ups_bypass_voltage",
  "ups_output_power_factor",
  "type_ups",
];
for (const language of ["en", "de", "nl", "fr", "es", "it", "sv", "da", "no", "fi", "pl", "cs"]) {
  const translations = getTranslations(language);
  for (const key of upsTranslationKeys) {
    assert.ok(translations[key], `${language} is missing ${key}`);
  }
}

console.log("UPS telemetry compatibility checks passed.");
