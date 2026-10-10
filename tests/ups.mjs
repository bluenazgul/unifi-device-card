import assert from "node:assert/strict";

import { classifyDeviceType } from "../src/classify.js";
import {
  getDeviceTelemetry,
  getDeviceContext,
  getDeviceOutletEntities,
  getUnavailableHeaderTelemetryKeys,
  hasUpsFrontDisplay,
  isUpsTower,
  normalizeUpsLayout,
  isDynamicOutletDetailsEnabled,
} from "../src/helpers.js";
import { getTranslations } from "../src/translations.js";
import { parseUnifiDeviceUniqueId, parseUnifiOutletUniqueId } from "../src/unique-id.js";
import { getFakeDevices, MODEL_REGISTRY } from "../src/model-registry.js";

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
    { model_id: "USWDA24", manufacturer: "Ubiquiti", name: "UPS Tower" },
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

const renamedBatteryEntity = {
  entity_id: "sensor.server_room_charge",
  unique_id: "ups_battery_level-aa:bb:cc:dd:ee:ff",
};
assert.deepEqual(parseUnifiDeviceUniqueId(renamedBatteryEntity.unique_id), {
  feature: "ups_battery_level",
  mac: "aa:bb:cc:dd:ee:ff",
});
assert.equal(
  getDeviceTelemetry([renamedBatteryEntity]).ups_battery_level_entity,
  renamedBatteryEntity.entity_id,
  "renamed UPS sensors must remain discoverable from their unique ID"
);

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
assert.equal(isUpsTower({ model_id: "USWDA24" }), true);
assert.equal(MODEL_REGISTRY.USPDA2B.theme, "silver");
assert.equal(MODEL_REGISTRY.USWDA25.theme, "silver");
assert.equal(MODEL_REGISTRY.USWDA24.theme, "white");
assert.equal(normalizeUpsLayout(), "combined");
assert.equal(normalizeUpsLayout("front"), "front");
assert.equal(normalizeUpsLayout("back"), "back");
assert.equal(normalizeUpsLayout("invalid"), "combined");

const fakeUpsDevices = getFakeDevices().filter((device) => device.type === "ups");
assert.deepEqual(
  fakeUpsDevices.map((device) => device.id).sort(),
  ["fake:USPDA2B", "fake:USWDA24", "fake:USWDA25"]
);
const fakeUpsProContext = await getDeviceContext({}, "fake:USPDA2B", { fake_device: true });
const fakeUpsContext = await getDeviceContext({}, "fake:USWDA25", { fake_device: true });
const fakeUpsTowerContext = await getDeviceContext({}, "fake:USWDA24", { fake_device: true });
assert.equal(fakeUpsProContext?.type, "ups");
assert.equal(fakeUpsProContext?.identity?.model_id, "USPDA2B");
assert.equal(hasUpsFrontDisplay(fakeUpsProContext?.device), true);
assert.equal(fakeUpsContext?.type, "ups");
assert.equal(fakeUpsContext?.identity?.model_id, "USWDA25");
assert.equal(hasUpsFrontDisplay(fakeUpsContext?.device), false);
assert.equal(fakeUpsTowerContext?.type, "ups");
assert.equal(isUpsTower(fakeUpsTowerContext?.device), true);
assert.equal(fakeUpsTowerContext?.numberedPorts?.length, 1);
assert.equal(fakeUpsTowerContext?.numberedPorts?.[0]?.port, 1);
assert.equal(fakeUpsTowerContext?.outlet_entities?.length, 10);
assert.deepEqual(fakeUpsTowerContext?.outlet_entities?.[0], {
  index: 1,
  entity_id: null,
  label: "Outlet 1",
  preview_state: "on",
  preview_power: 120,
});
assert.equal(fakeUpsProContext?.numberedPorts?.length, 1);
assert.equal(fakeUpsProContext?.outlet_entities?.length, 8);

const outletEntities = [10, 2, 1].map((index) => ({
  entity_id: `switch.ups_tower_outlet_${index}`,
  unique_id: `outlet-aa:bb:cc:dd:ee:ff_${index}`,
  original_name: `Outlet ${index}`,
}));
assert.deepEqual(parseUnifiOutletUniqueId(outletEntities[0].unique_id), {
  feature: "outlet_control",
  mac: "aa:bb:cc:dd:ee:ff",
  outlet: 10,
});
assert.deepEqual(
  getDeviceOutletEntities(outletEntities, { primary_mac: "aa:bb:cc:dd:ee:ff" }),
  [
    { index: 1, entity_id: "switch.ups_tower_outlet_1", label: "Outlet 1" },
    { index: 2, entity_id: "switch.ups_tower_outlet_2", label: "Outlet 2" },
    { index: 10, entity_id: "switch.ups_tower_outlet_10", label: "Outlet 10" },
  ]
);

const powerOnlyEntity = {
  entity_id: "sensor.rack_load",
  unique_id: "outlet_power-aa:bb:cc:dd:ee:ff_3",
  translation_placeholders: { outlet_name: "Storage" },
};
const hiddenPowerEntity = {
  entity_id: "sensor.renamed_server_load",
  unique_id: "outlet_power-aabbccddeeff_2",
  hidden_by: "user",
};
assert.deepEqual(parseUnifiOutletUniqueId(hiddenPowerEntity.unique_id), {
  feature: "outlet_power", mac: "aa:bb:cc:dd:ee:ff", outlet: 2,
});
for (const id of ["outlet_power-aabbccddeeff_0", "outlet_power-invalid_1", "outlet_voltage-aabbccddeeff_1"]) {
  assert.equal(parseUnifiOutletUniqueId(id), null);
}
const mixedOutlets = getDeviceOutletEntities([
  powerOnlyEntity,
  hiddenPowerEntity,
  ...outletEntities,
  { entity_id: "sensor.other_device", unique_id: "outlet_power-11:22:33:44:55:66_2" },
  { entity_id: "sensor.disabled", unique_id: "outlet_power-aa:bb:cc:dd:ee:ff_1", disabled_by: "user" },
  { entity_id: "switch.disabled", unique_id: "outlet-aa:bb:cc:dd:ee:ff_4", disabled_by: "integration" },
  { entity_id: "switch.wrong_domain", unique_id: "outlet_power-aa:bb:cc:dd:ee:ff_5" },
  { entity_id: "sensor.wrong_domain", unique_id: "outlet-aa:bb:cc:dd:ee:ff_6" },
], { primary_mac: "AABBCCDDEEFF" });
assert.deepEqual(mixedOutlets, [
  { index: 1, entity_id: "switch.ups_tower_outlet_1", label: "Outlet 1" },
  { index: 2, entity_id: "switch.ups_tower_outlet_2", label: "Outlet 2", power_entity: hiddenPowerEntity.entity_id },
  { index: 3, entity_id: null, label: "Storage", power_entity: powerOnlyEntity.entity_id },
  { index: 10, entity_id: "switch.ups_tower_outlet_10", label: "Outlet 10" },
]);
assert.deepEqual(
  getDeviceOutletEntities([...outletEntities, hiddenPowerEntity], { primary_mac: "aa:bb:cc:dd:ee:ff" })[1],
  mixedOutlets[1],
  "switch and sensor discovery order must not change outlet mapping"
);

assert.equal(isDynamicOutletDetailsEnabled({}), false);
assert.equal(isDynamicOutletDetailsEnabled({ dynamic_outlet_details: true }), true);
assert.equal(isDynamicOutletDetailsEnabled({ dynamic_port_details: true }), true);
assert.equal(isDynamicOutletDetailsEnabled({ dynamic_port_details: true, dynamic_outlet_details: false }), false);

const registeredDeviceId = "registered-ups";
const registryEntities = [...outletEntities, hiddenPowerEntity, powerOnlyEntity].map((entity) => ({
  ...entity, device_id: registeredDeviceId,
}));
const registeredContext = await getDeviceContext({
  states: {},
  async callWS(message) {
    if (message.type === "config/device_registry/list") return [{
      id: registeredDeviceId, model_id: "USWDA24", manufacturer: "Ubiquiti",
      connections: [["mac", "aa:bb:cc:dd:ee:ff"]],
    }];
    if (message.type === "config/entity_registry/list") return registryEntities;
    if (message.type === "config/config_entries") return [];
    throw new Error(`Unexpected WS call: ${message.type}`);
  },
}, registeredDeviceId);
assert.equal(registeredContext.type, "ups");
assert.equal(registeredContext.outlet_entities[1].power_entity, hiddenPowerEntity.entity_id,
  "hidden enabled outlet telemetry must reach the real device context");
assert.equal(registeredContext.outlet_entities[2].label, "Storage");

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
  "ups_outlets",
  "back_panel",
  "ups_outlet_status",
  "ups_outlet_turn_on",
  "ups_outlet_turn_off",
  "ups_outlet_power",
  "ups_outlet_preview",
  "editor_back_panel_toggle_label",
  "editor_back_panel_toggle_text",
  "editor_back_panel_toggle_hint",
  "editor_dynamic_outlet_details_label",
  "editor_dynamic_outlet_details_text",
  "editor_dynamic_outlet_details_hint",
  "editor_ups_layout_label",
  "editor_ups_layout_combined",
  "editor_ups_layout_hint",
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
