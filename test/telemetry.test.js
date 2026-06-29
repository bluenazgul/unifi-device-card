import assert from "node:assert/strict";
import { getDeviceTelemetry } from "../src/helpers.js";
import { getTranslations } from "../src/translations.js";

const apEntitiesWithoutTemperature = [
  {
    entity_id: "sensor.u7_pro_xgs_cpu_utilization",
    unique_id: "cpu_utilization-aabbccddeeff",
    translation_key: "device_cpu_utilization",
  },
  {
    entity_id: "sensor.u7_pro_xgs_memory_utilization",
    unique_id: "memory_utilization-aabbccddeeff",
    translation_key: "device_memory_utilization",
  },
  {
    entity_id: "sensor.u7_pro_xgs_uptime",
    unique_id: "device_uptime-aabbccddeeff",
    device_class: "timestamp",
    original_device_class: "timestamp",
    translation_key: "device_uptime",
    name: "Uptime",
  },
  {
    entity_id: "sensor.u7_pro_xgs_last_seen",
    unique_id: "last_seen-aabbccddeeff",
    device_class: "timestamp",
    original_device_class: "timestamp",
    translation_key: "last_seen",
    name: "Last seen",
  },
];

const telemetryWithoutTemperature = getDeviceTelemetry(apEntitiesWithoutTemperature);
assert.equal(
  telemetryWithoutTemperature.cpu_utilization_entity,
  "sensor.u7_pro_xgs_cpu_utilization",
  "CPU telemetry should be preserved"
);
assert.equal(
  telemetryWithoutTemperature.memory_utilization_entity,
  "sensor.u7_pro_xgs_memory_utilization",
  "memory telemetry should be preserved"
);
assert.equal(
  telemetryWithoutTemperature.temperature_entity,
  null,
  "timestamp-like uptime/last-seen entities must not be used as temperature telemetry"
);

const telemetryWithTemperature = getDeviceTelemetry([
  ...apEntitiesWithoutTemperature,
  {
    entity_id: "sensor.u7_pro_xgs_device_temperature",
    unique_id: "device_temperature-aabbccddeeff",
    device_class: "temperature",
    original_device_class: "temperature",
    translation_key: "device_temperature",
    name: "Device temperature",
  },
]);
assert.equal(
  telemetryWithTemperature.temperature_entity,
  "sensor.u7_pro_xgs_device_temperature",
  "real temperature telemetry should still be selected"
);

const telemetryWithAbbreviatedTemperature = getDeviceTelemetry([
  ...apEntitiesWithoutTemperature,
  {
    entity_id: "sensor.usw_temp",
    unique_id: "usw-temp-aabbccddeeff",
    name: "USW Temp",
  },
]);
assert.equal(
  telemetryWithAbbreviatedTemperature.temperature_entity,
  "sensor.usw_temp",
  "abbreviated *_temp sensors should remain valid temperature fallbacks"
);

for (const lang of ["en", "de", "nl", "fr", "es", "it", "sv", "da", "no", "fi", "pl", "cs"]) {
  const strings = getTranslations(lang);
  assert.ok(strings.telemetry_unavailable_title, `${lang} title translation should exist`);
  assert.ok(strings.telemetry_unavailable_body, `${lang} body translation should exist`);
}
