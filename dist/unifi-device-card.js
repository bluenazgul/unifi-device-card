/* UniFi Device Card 0.0.0-dev.4ddb613 */

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
function defaultSwitchLayout(portCount) {
  if (portCount <= 8) {
    return {
      kind: "switch",
      frontStyle: "single-row",
      rows: [range(1, portCount)],
      portCount
    };
  }
  if (portCount === 16) {
    return {
      kind: "switch",
      frontStyle: "dual-row",
      rows: [oddRange(1, 16), evenRange(1, 16)],
      portCount
    };
  }
  if (portCount === 24) {
    return {
      kind: "switch",
      frontStyle: "dual-row",
      rows: [range(1, 12), range(13, 24)],
      portCount
    };
  }
  if (portCount === 48) {
    return {
      kind: "switch",
      frontStyle: "quad-row",
      rows: [range(1, 12), range(13, 24), range(25, 36), range(37, 48)],
      portCount
    };
  }
  return {
    kind: "switch",
    frontStyle: "single-row",
    rows: [range(1, portCount)],
    portCount
  };
}
var MODEL_REGISTRY = {
  US8P60: {
    kind: "switch",
    frontStyle: "single-row",
    rows: [range(1, 8)],
    portCount: 8,
    displayModel: "US 8 60W"
  },
  USMINI: {
    kind: "switch",
    frontStyle: "single-row",
    rows: [range(1, 5)],
    portCount: 5,
    displayModel: "USW Flex Mini"
  },
  USL8LP: {
    kind: "switch",
    frontStyle: "single-row",
    rows: [range(1, 8)],
    portCount: 8,
    displayModel: "USW Lite 8 PoE"
  },
  USL16LP: {
    kind: "switch",
    frontStyle: "dual-row",
    rows: [oddRange(1, 16), evenRange(1, 16)],
    portCount: 16,
    displayModel: "USW Lite 16 PoE"
  },
  UDRULT: {
    kind: "gateway",
    frontStyle: "gateway-compact",
    rows: [],
    portCount: 0,
    displayModel: "Cloud Gateway Ultra"
  },
  UCGULTRA: {
    kind: "gateway",
    frontStyle: "gateway-compact",
    rows: [],
    portCount: 0,
    displayModel: "Cloud Gateway Ultra"
  },
  UCGMAX: {
    kind: "gateway",
    frontStyle: "gateway-compact",
    rows: [],
    portCount: 0,
    displayModel: "Cloud Gateway Max"
  },
  UDMPRO: {
    kind: "gateway",
    frontStyle: "gateway-rack",
    rows: [range(1, 8)],
    portCount: 8,
    displayModel: "UDM Pro"
  },
  UDMSE: {
    kind: "gateway",
    frontStyle: "gateway-rack",
    rows: [range(1, 8)],
    portCount: 8,
    displayModel: "UDM SE"
  }
};
function normalizeModelKey(value) {
  return String(value ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "");
}
function resolveModelKey(device) {
  const candidates = [
    device?.model,
    device?.hw_version,
    device?.name,
    device?.name_by_user
  ].filter(Boolean).map(normalizeModelKey);
  for (const candidate of candidates) {
    if (!candidate) continue;
    if (MODEL_REGISTRY[candidate]) return candidate;
    if (candidate.includes("USL16LP")) return "USL16LP";
    if (candidate.includes("USL8LP")) return "USL8LP";
    if (candidate.includes("US8P60")) return "US8P60";
    if (candidate.includes("USMINI")) return "USMINI";
    if (candidate.includes("UDRULT")) return "UDRULT";
    if (candidate.includes("UCGULTRA")) return "UCGULTRA";
    if (candidate.includes("CLOUDGATEWAYULTRA")) return "UCGULTRA";
    if (candidate.includes("UCGMAX")) return "UCGMAX";
    if (candidate.includes("UDMPRO")) return "UDMPRO";
    if (candidate.includes("UDMSE")) return "UDMSE";
  }
  return null;
}
function inferPortCountFromModel(device) {
  const text = normalizeModelKey(
    [device?.model, device?.name, device?.name_by_user].filter(Boolean).join(" ")
  );
  if (text.includes("USL16")) return 16;
  if (text.includes("LITE16")) return 16;
  if (text.includes("USL8")) return 8;
  if (text.includes("LITE8")) return 8;
  if (text.includes("US8P60")) return 8;
  if (text.includes("US8")) return 8;
  if (text.includes("USMINI")) return 5;
  if (text.includes("FLEXMINI")) return 5;
  if (text.includes("24")) return 24;
  if (text.includes("48")) return 48;
  return null;
}
function getDeviceLayout(device, discoveredPorts = []) {
  const modelKey = resolveModelKey(device);
  if (modelKey && MODEL_REGISTRY[modelKey]) {
    return {
      modelKey,
      ...MODEL_REGISTRY[modelKey]
    };
  }
  const inferredPortCount = inferPortCountFromModel(device) || Math.max(...discoveredPorts.map((p) => p.port), 0);
  if (inferredPortCount > 0) {
    return {
      modelKey: null,
      ...defaultSwitchLayout(inferredPortCount),
      displayModel: device?.model || `UniFi Switch ${inferredPortCount}`
    };
  }
  return {
    modelKey: null,
    kind: "gateway",
    frontStyle: "gateway-generic",
    rows: [],
    portCount: 0,
    displayModel: device?.model || "UniFi Gateway"
  };
}

// src/helpers.js
function normalize(value) {
  return String(value ?? "").trim();
}
function lower(value) {
  return normalize(value).toLowerCase();
}
function entityText(entity) {
  return [
    entity.entity_id,
    entity.original_name,
    entity.name,
    entity.platform,
    entity.device_class,
    entity.translation_key,
    entity.original_device_class
  ].filter(Boolean).join(" ").toLowerCase();
}
function deviceText(device, entities) {
  return [
    device.name_by_user,
    device.name,
    device.model,
    device.manufacturer,
    device.hw_version,
    device.serial_number,
    ...entities.flatMap((e) => [
      e.entity_id,
      e.original_name,
      e.name,
      e.platform,
      e.device_class,
      e.translation_key,
      e.original_device_class
    ])
  ].filter(Boolean).join(" ").toLowerCase();
}
function isUnifiConfigEntry(entry) {
  const domain = lower(entry?.domain);
  const title = lower(entry?.title);
  return domain === "unifi" || domain === "unifi_network" || title.includes("unifi");
}
function hasUbiquitiManufacturer(device) {
  const manufacturer = lower(device?.manufacturer);
  return manufacturer.includes("ubiquiti") || manufacturer.includes("ubiquiti networks") || manufacturer.includes("unifi");
}
function classifyDevice(device, entities) {
  const model = lower(device?.model);
  const name = lower(device?.name);
  const userName = lower(device?.name_by_user);
  const text = deviceText(device, entities);
  const isAccessPoint = text.includes("access point") || text.includes(" uap") || text.includes("uap-") || text.includes(" nanohd") || text.includes(" u6") || text.includes(" u7") || text.includes(" mesh");
  if (isAccessPoint) return "access_point";
  const modelKey = resolveModelKey(device);
  if (modelKey === "UDRULT" || modelKey === "UCGULTRA" || modelKey === "UCGMAX" || modelKey === "UDMPRO" || modelKey === "UDMSE") {
    return "gateway";
  }
  if (modelKey === "US8P60" || modelKey === "USMINI" || modelKey === "USL8LP" || modelKey === "USL16LP") {
    return "switch";
  }
  const isGateway = model.startsWith("udm") || model.startsWith("ucg") || model.startsWith("uxg") || model.includes("udrult") || model.includes("ucg-ultra") || model.includes("gateway") || name.includes("cloud gateway") || userName.includes("cloud gateway") || name.includes("gateway ultra") || userName.includes("gateway ultra") || name.includes("ucg") || userName.includes("ucg") || name.includes("udm") || userName.includes("udm") || name.includes("uxg") || userName.includes("uxg") || text.includes("dream machine") || text.includes("cloud gateway ultra") || text.includes("gateway ultra");
  if (isGateway) return "gateway";
  const hasPortEntities = entities.some((e) => /_port_\d+_/i.test(e.entity_id));
  const isSwitchByModel = model.startsWith("usw") || model.startsWith("us-") || model.includes("usmini") || model.includes("us8") || model.includes("us8p") || model.includes("usl8") || model.includes("usl16") || model.includes("usl8lp") || model.includes("usl16lp") || model.includes("flex");
  const isSwitchByName = name.includes("usw") || name.includes("us 8") || userName.includes("usw") || userName.includes("us 8");
  if (hasPortEntities || isSwitchByModel || isSwitchByName) return "switch";
  return "unknown";
}
function buildDeviceLabel(device, type) {
  const name = normalize(device.name_by_user) || normalize(device.name) || normalize(device.model) || "Unknown device";
  const model = normalize(device.model);
  const typeLabel = type === "switch" ? "switch" : type === "gateway" ? "gateway" : type === "access_point" ? "ap" : "unknown";
  if (model && lower(model) !== lower(name)) {
    return `${name} \xB7 ${model} (${typeLabel})`;
  }
  return `${name} (${typeLabel})`;
}
async function safeCallWS(hass, msg, fallback = []) {
  try {
    return await hass.callWS(msg);
  } catch (err) {
    console.warn("[unifi-device-card] WS call failed:", msg?.type, err);
    return fallback;
  }
}
async function getAllData(hass) {
  const [devices, entities, configEntries] = await Promise.all([
    safeCallWS(hass, { type: "config/device_registry/list" }, []),
    safeCallWS(hass, { type: "config/entity_registry/list" }, []),
    safeCallWS(hass, { type: "config/config_entries/entry" }, [])
  ]);
  const entitiesByDevice = /* @__PURE__ */ new Map();
  for (const entity of entities) {
    if (!entity.device_id) continue;
    if (!entitiesByDevice.has(entity.device_id)) {
      entitiesByDevice.set(entity.device_id, []);
    }
    entitiesByDevice.get(entity.device_id).push(entity);
  }
  return { devices, entities, configEntries, entitiesByDevice };
}
function extractUnifiEntryIds(configEntries) {
  return new Set(
    (configEntries || []).filter(isUnifiConfigEntry).map((entry) => entry.entry_id)
  );
}
function deviceBelongsToUnifi(device, unifiEntryIds, entities) {
  const byConfigEntry = unifiEntryIds.size > 0 && Array.isArray(device?.config_entries) && device.config_entries.some((id) => unifiEntryIds.has(id));
  if (byConfigEntry) return true;
  if (!hasUbiquitiManufacturer(device)) return false;
  const model = lower(device?.model);
  const name = lower(device?.name);
  const userName = lower(device?.name_by_user);
  const strongModelHint = model.startsWith("usw") || model.startsWith("us-") || model.startsWith("udm") || model.startsWith("ucg") || model.startsWith("uxg") || model.includes("usmini") || model.includes("us8") || model.includes("us8p") || model.includes("usl8") || model.includes("usl16") || model.includes("udrult") || model.includes("gateway");
  const strongNameHint = name.includes("usw") || name.includes("us 8") || name.includes("cloud gateway") || name.includes("gateway ultra") || name.includes("udm") || name.includes("ucg") || name.includes("uxg") || userName.includes("usw") || userName.includes("us 8") || userName.includes("cloud gateway") || userName.includes("gateway ultra") || userName.includes("udm") || userName.includes("ucg") || userName.includes("uxg");
  const strongEntityHint = entities.some((entity) => {
    const eid = lower(entity.entity_id);
    const txt = entityText(entity);
    return eid.includes("usw") || eid.includes("us8") || eid.includes("us_8") || eid.includes("ucg") || eid.includes("udm") || eid.includes("uxg") || txt.includes("ubiquiti") || txt.includes("unifi");
  });
  return strongModelHint || strongNameHint || strongEntityHint;
}
async function getUnifiDevices(hass) {
  const { devices, configEntries, entitiesByDevice } = await getAllData(hass);
  const unifiEntryIds = extractUnifiEntryIds(configEntries);
  return (devices || []).map((device) => {
    const entities = entitiesByDevice.get(device.id) || [];
    const belongsToUnifi = deviceBelongsToUnifi(device, unifiEntryIds, entities);
    if (!belongsToUnifi) return null;
    const type = classifyDevice(device, entities);
    if (type !== "switch" && type !== "gateway") return null;
    return {
      id: device.id,
      name: normalize(device.name_by_user) || normalize(device.name) || normalize(device.model) || "Unknown device",
      label: buildDeviceLabel(device, type),
      model: normalize(device.model),
      manufacturer: normalize(device.manufacturer),
      type
    };
  }).filter(Boolean).sort((a, b) => a.label.localeCompare(b.label, "de", { sensitivity: "base" }));
}
async function getDeviceContext(hass, deviceId) {
  const { devices, configEntries, entitiesByDevice } = await getAllData(hass);
  const unifiEntryIds = extractUnifiEntryIds(configEntries);
  const device = (devices || []).find((d) => d.id === deviceId);
  if (!device) return null;
  const entities = entitiesByDevice.get(deviceId) || [];
  const belongsToUnifi = deviceBelongsToUnifi(device, unifiEntryIds, entities);
  if (!belongsToUnifi) return null;
  const type = classifyDevice(device, entities);
  if (type !== "switch" && type !== "gateway") return null;
  const discoveredPorts = discoverPorts(entities);
  const layout = getDeviceLayout(device, discoveredPorts);
  return {
    device,
    entities,
    type,
    layout,
    name: normalize(device.name_by_user) || normalize(device.name) || normalize(device.model) || "Unknown device",
    model: normalize(device.model),
    manufacturer: normalize(device.manufacturer)
  };
}
function extractPortNumber(entity) {
  const id = entity.entity_id || "";
  const originalName = entity.original_name || "";
  const name = entity.name || "";
  let match = id.match(/_port_(\d+)_/i);
  if (match) return Number(match[1]);
  match = originalName.match(/\bport\s+(\d+)\b/i);
  if (match) return Number(match[1]);
  match = name.match(/\bport\s+(\d+)\b/i);
  if (match) return Number(match[1]);
  return null;
}
function ensurePort(map, port) {
  if (!map.has(port)) {
    map.set(port, {
      port,
      link_entity: null,
      speed_entity: null,
      poe_switch_entity: null,
      poe_power_entity: null,
      power_cycle_entity: null,
      raw_entities: []
    });
  }
  return map.get(port);
}
function classifyPortEntity(entity) {
  const eid = lower(entity.entity_id);
  const text = entityText(entity);
  if (entity.entity_id.startsWith("binary_sensor.") && (eid.includes("_link") || text.includes(" link"))) {
    return "link_entity";
  }
  if (entity.entity_id.startsWith("sensor.") && (eid.includes("_speed") || text.includes("speed"))) {
    return "speed_entity";
  }
  if (entity.entity_id.startsWith("switch.") && (eid.includes("_poe") || text.includes("poe"))) {
    return "poe_switch_entity";
  }
  if (entity.entity_id.startsWith("sensor.") && (eid.includes("_poe_power") || text.includes("poe") && text.includes("power") || text.includes("poe") && text.includes("w"))) {
    return "poe_power_entity";
  }
  if (entity.entity_id.startsWith("button.") && (eid.includes("power_cycle") || eid.includes("restart") || text.includes("power") && text.includes("cycle"))) {
    return "power_cycle_entity";
  }
  return null;
}
function discoverPorts(entities) {
  const ports = /* @__PURE__ */ new Map();
  for (const entity of entities || []) {
    const port = extractPortNumber(entity);
    if (!port) continue;
    const row = ensurePort(ports, port);
    row.raw_entities.push(entity.entity_id);
    const slot = classifyPortEntity(entity);
    if (slot && !row[slot]) {
      row[slot] = entity.entity_id;
    }
  }
  for (const row of ports.values()) {
    if (!row.power_cycle_entity) {
      row.poe_switch_entity = null;
      row.poe_power_entity = null;
    }
  }
  return Array.from(ports.values()).sort((a, b) => a.port - b.port);
}
function mergePortsWithLayout(layout, discoveredPorts) {
  const byPort = new Map(discoveredPorts.map((p) => [p.port, p]));
  const layoutPorts = (layout?.rows || []).flat();
  const merged = [];
  for (const portNumber of layoutPorts) {
    merged.push(
      byPort.get(portNumber) || {
        port: portNumber,
        link_entity: null,
        speed_entity: null,
        poe_switch_entity: null,
        poe_power_entity: null,
        power_cycle_entity: null,
        raw_entities: []
      }
    );
  }
  for (const port of discoveredPorts) {
    if (!layoutPorts.includes(port.port)) {
      merged.push(port);
    }
  }
  return merged.sort((a, b) => a.port - b.port);
}
function stateObj(hass, entityId) {
  return entityId ? hass.states[entityId] || null : null;
}
function stateValue(hass, entityId, fallback = "\u2014") {
  const st = stateObj(hass, entityId);
  if (!st) return fallback;
  return st.state ?? fallback;
}
function isOn(hass, entityId) {
  return stateValue(hass, entityId, "off") === "on";
}
function formatState(hass, entityId, fallback = "\u2014") {
  const st = stateObj(hass, entityId);
  if (!st) return fallback;
  const state = st.state ?? fallback;
  const unit = st.attributes?.unit_of_measurement || "";
  if (state === "unknown" || state === "unavailable") return "\u2014";
  return unit ? `${state} ${unit}` : String(state);
}

// src/unifi-device-card-editor.js
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
  }
  setConfig(config) {
    this._config = config || {};
    this._render();
  }
  set hass(hass) {
    this._hass = hass;
    if (!this._loaded && !this._loading) {
      this._loadDevices();
    }
  }
  async _loadDevices() {
    if (!this._hass) return;
    this._loading = true;
    this._error = "";
    const token = ++this._loadToken;
    this._render();
    try {
      const devices = await getUnifiDevices(this._hass);
      if (token !== this._loadToken) return;
      this._devices = devices;
      this._loaded = true;
      this._loading = false;
      this._render();
    } catch (err) {
      if (token !== this._loadToken) return;
      console.error("[unifi-device-card] Failed to load devices", err);
      this._devices = [];
      this._loaded = true;
      this._loading = false;
      this._error = "UniFi-Ger\xE4te konnten nicht geladen werden.";
      this._render();
    }
  }
  _dispatch(config) {
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config },
        bubbles: true,
        composed: true
      })
    );
  }
  _selectedDeviceName(deviceId) {
    const selected = this._devices.find((d) => d.id === deviceId);
    return selected?.name || "";
  }
  _onDeviceChange(ev) {
    const newDeviceId = ev.target.value || "";
    const oldDeviceId = this._config?.device_id || "";
    const oldAutoName = this._selectedDeviceName(oldDeviceId);
    const newAutoName = this._selectedDeviceName(newDeviceId);
    const next = { ...this._config };
    if (newDeviceId) {
      next.device_id = newDeviceId;
    } else {
      delete next.device_id;
    }
    const currentName = String(next.name || "").trim();
    if (!currentName || currentName === oldAutoName) {
      if (newAutoName) {
        next.name = newAutoName;
      } else {
        delete next.name;
      }
    }
    this._config = next;
    this._dispatch(next);
    this._render();
  }
  _onNameInput(ev) {
    const value = ev.target.value || "";
    const next = {
      ...this._config,
      name: value
    };
    this._config = next;
    this._dispatch(next);
  }
  _render() {
    const selectedId = this._config?.device_id || "";
    const selectedName = String(this._config?.name || "").replace(/"/g, "&quot;");
    const options = this._devices.map(
      (d) => `
          <option value="${d.id}" ${d.id === selectedId ? "selected" : ""}>
            ${d.label}
          </option>
        `
    ).join("");
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
        }

        .wrap {
          display: grid;
          gap: 16px;
        }

        .field {
          display: grid;
          gap: 6px;
        }

        label {
          font-size: 14px;
          font-weight: 600;
          color: var(--primary-text-color);
        }

        select,
        input {
          width: 100%;
          box-sizing: border-box;
          min-height: 40px;
          padding: 8px 10px;
          border-radius: 10px;
          border: 1px solid var(--divider-color);
          background: var(--card-background-color);
          color: var(--primary-text-color);
          font: inherit;
        }

        .hint {
          color: var(--secondary-text-color);
          font-size: 13px;
          line-height: 1.4;
        }

        .error {
          color: var(--error-color);
          font-size: 13px;
          line-height: 1.4;
        }
      </style>

      <div class="wrap">
        <div class="field">
          <label for="device">UniFi device</label>
          ${this._loading ? `<div class="hint">Lade unterst\xFCtzte UniFi-Ger\xE4te\u2026</div>` : `
                <select id="device">
                  <option value="">Select device\u2026</option>
                  ${options}
                </select>
              `}
        </div>

        <div class="field">
          <label for="name">Display name</label>
          <input
            id="name"
            type="text"
            value="${selectedName}"
            placeholder="Optional"
          />
        </div>

        ${this._error ? `<div class="error">${this._error}</div>` : ""}
        ${!this._loading && !this._devices.length && !this._error ? `<div class="hint">Keine unterst\xFCtzten UniFi Switches oder Gateways gefunden.</div>` : `<div class="hint">Es werden nur Ger\xE4te aus der UniFi-Integration angezeigt.</div>`}
      </div>
    `;
    this.shadowRoot.getElementById("device")?.addEventListener("change", (ev) => this._onDeviceChange(ev));
    this.shadowRoot.getElementById("name")?.addEventListener("input", (ev) => this._onNameInput(ev));
  }
};
customElements.define("unifi-device-card-editor", UnifiDeviceCardEditor);

// src/unifi-device-card.js
var VERSION = "0.0.0-dev.4ddb613";
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
    this._deviceContext = null;
    this._selectedPort = null;
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
      this._deviceContext = null;
      this._selectedPort = null;
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
  async _ensureLoaded() {
    if (!this._hass || !this._config?.device_id) return;
    const currentId = this._config.device_id;
    if (this._loadedDeviceId === currentId && this._deviceContext) return;
    if (this._loading) return;
    this._loading = true;
    this._render();
    const token = ++this._loadToken;
    try {
      const ctx = await getDeviceContext(this._hass, currentId);
      if (token !== this._loadToken) return;
      this._deviceContext = ctx;
      this._loadedDeviceId = currentId;
      const discoveredPorts = discoverPorts(ctx?.entities || []);
      const mergedPorts = mergePortsWithLayout(ctx?.layout, discoveredPorts);
      if (mergedPorts.length) {
        this._selectedPort = mergedPorts[0].port;
      } else {
        this._selectedPort = null;
      }
    } catch (err) {
      console.error("[unifi-device-card] Failed to load device context", err);
      if (token !== this._loadToken) return;
      this._deviceContext = null;
      this._loadedDeviceId = null;
    }
    this._loading = false;
    this._render();
  }
  _selectPort(port) {
    this._selectedPort = port;
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
  _styles() {
    return `
      <style>
        .content {
          padding: 16px;
        }

        .muted {
          color: var(--secondary-text-color);
        }

        .header {
          padding: 16px 16px 8px 16px;
          display: grid;
          gap: 4px;
        }

        .title {
          font-size: 1.55rem;
          font-weight: 600;
          line-height: 1.2;
        }

        .subtitle {
          color: var(--secondary-text-color);
          font-size: 0.92rem;
        }

        .frontpanel {
          padding: 8px 16px 8px 16px;
          display: grid;
          gap: 8px;
        }

        .port-row {
          display: grid;
          gap: 8px;
        }

        .frontpanel.single-row .port-row {
          grid-template-columns: repeat(auto-fit, minmax(56px, 1fr));
        }

        .frontpanel.dual-row .port-row,
        .frontpanel.gateway-rack .port-row,
        .frontpanel.gateway-compact .port-row,
        .frontpanel.quad-row .port-row {
          grid-template-columns: repeat(auto-fit, minmax(52px, 1fr));
        }

        .port {
          border: none;
          border-radius: 12px;
          min-height: 64px;
          cursor: pointer;
          color: white;
          font: inherit;
          display: grid;
          place-items: center;
          gap: 2px;
          padding: 8px 4px;
          background: #555;
        }

        .port.up {
          background: #2e7d32;
        }

        .port.down {
          background: #555;
        }

        .port.selected {
          outline: 2px solid var(--primary-color);
          outline-offset: 2px;
        }

        .port.has-poe {
          box-shadow: inset 0 0 0 2px rgba(255, 193, 7, 0.55);
        }

        .port-num {
          font-size: 14px;
          font-weight: 700;
          line-height: 1;
        }

        .port-icon {
          font-size: 16px;
          line-height: 1;
        }

        .section {
          padding: 16px;
          padding-top: 8px;
          display: grid;
          gap: 12px;
        }

        .port-detail {
          border-top: 1px solid var(--divider-color);
          padding-top: 12px;
          display: grid;
          gap: 10px;
        }

        .detail-title {
          font-size: 16px;
          font-weight: 700;
        }

        .detail-grid {
          display: grid;
          gap: 8px;
        }

        .row {
          display: grid;
          grid-template-columns: 140px 1fr;
          gap: 8px;
          align-items: center;
        }

        .row .label {
          color: var(--secondary-text-color);
        }

        .actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 4px;
        }

        .action-btn {
          border: none;
          border-radius: 10px;
          padding: 10px 12px;
          cursor: pointer;
          font: inherit;
          background: var(--primary-color);
          color: var(--text-primary-color, white);
        }

        .action-btn.secondary {
          background: var(--secondary-background-color, #666);
          color: var(--primary-text-color);
        }

        .summary {
          display: grid;
          gap: 8px;
        }

        .layout-note {
          color: var(--secondary-text-color);
          font-size: 0.85rem;
        }
      </style>
    `;
  }
  _renderEmpty(title) {
    this.shadowRoot.innerHTML = `
      <ha-card>
        <div class="header">
          <div class="title">${title}</div>
          <div class="subtitle">Version ${VERSION}</div>
        </div>
        <div class="content muted">Bitte im Karteneditor ein UniFi-Ger\xE4t ausw\xE4hlen.</div>
      </ha-card>
      ${this._styles()}
    `;
  }
  _renderGateway(title) {
    const ctx = this._deviceContext;
    this.shadowRoot.innerHTML = `
      <ha-card>
        <div class="header">
          <div class="title">${title}</div>
          <div class="subtitle">${ctx?.layout?.displayModel || ctx?.model || "Gateway"} \xB7 Version ${VERSION}</div>
        </div>
        <div class="section">
          <div class="summary">
            <div><strong>Typ:</strong> Gateway</div>
            <div><strong>Modell:</strong> ${ctx?.layout?.displayModel || ctx?.model || "Unbekannt"}</div>
            <div><strong>Hersteller:</strong> ${ctx?.manufacturer || "Unbekannt"}</div>
          </div>
        </div>
      </ha-card>
      ${this._styles()}
    `;
  }
  _renderPortButton(port, selectedPort) {
    const linkUp = isOn(this._hass, port.link_entity);
    const hasPoe = Boolean(port.power_cycle_entity);
    const poeOn = hasPoe && port.poe_switch_entity ? isOn(this._hass, port.poe_switch_entity) : false;
    return `
      <button
        class="port ${linkUp ? "up" : "down"} ${selectedPort?.port === port.port ? "selected" : ""} ${hasPoe ? "has-poe" : ""}"
        data-port="${port.port}"
        title="Port ${port.port}"
      >
        <div class="port-num">${port.port}</div>
        <div class="port-icon">${poeOn ? "\u26A1" : "\u21C4"}</div>
      </button>
    `;
  }
  _renderSwitch(title) {
    const ctx = this._deviceContext;
    const discoveredPorts = discoverPorts(ctx?.entities || []);
    const ports = mergePortsWithLayout(ctx?.layout, discoveredPorts);
    const selected = ports.find((p) => p.port === this._selectedPort) || ports[0] || null;
    const rows = (ctx?.layout?.rows || []).map((rowPorts) => {
      const rowItems = rowPorts.map((portNumber) => {
        const port = ports.find((p) => p.port === portNumber) || {
          port: portNumber,
          link_entity: null,
          speed_entity: null,
          poe_switch_entity: null,
          poe_power_entity: null,
          power_cycle_entity: null,
          raw_entities: []
        };
        return this._renderPortButton(port, selected);
      }).join("");
      return `<div class="port-row">${rowItems}</div>`;
    });
    const extraPorts = ports.filter((p) => !(ctx?.layout?.rows || []).flat().includes(p.port)).sort((a, b) => a.port - b.port);
    if (extraPorts.length) {
      rows.push(
        `<div class="port-row">${extraPorts.map((port) => this._renderPortButton(port, selected)).join("")}</div>`
      );
    }
    const detail = selected ? `
        <div class="port-detail">
          <div class="detail-title">Port ${selected.port}</div>

          <div class="detail-grid">
            <div class="row">
              <div class="label">Link</div>
              <div>${stateValue(this._hass, selected.link_entity, "\u2014")}</div>
            </div>
            <div class="row">
              <div class="label">Speed</div>
              <div>${formatState(this._hass, selected.speed_entity, "\u2014")}</div>
            </div>
            <div class="row">
              <div class="label">PoE</div>
              <div>${selected.power_cycle_entity && selected.poe_switch_entity ? stateValue(this._hass, selected.poe_switch_entity, "\u2014") : "Nicht verf\xFCgbar"}</div>
            </div>
            <div class="row">
              <div class="label">PoE Leistung</div>
              <div>${selected.power_cycle_entity ? formatState(this._hass, selected.poe_power_entity, "\u2014") : "Nicht verf\xFCgbar"}</div>
            </div>
          </div>

          <div class="actions">
            ${selected.power_cycle_entity && selected.poe_switch_entity ? `<button class="action-btn" data-action="toggle-poe" data-entity="${selected.poe_switch_entity}">
                    PoE ${isOn(this._hass, selected.poe_switch_entity) ? "Ausschalten" : "Einschalten"}
                  </button>` : ""}
            ${selected.power_cycle_entity ? `<button class="action-btn secondary" data-action="power-cycle" data-entity="${selected.power_cycle_entity}">
                    Power Cycle
                  </button>` : ""}
          </div>
        </div>
      ` : `<div class="muted">Keine Ports erkannt.</div>`;
    this.shadowRoot.innerHTML = `
      <ha-card>
        <div class="header">
          <div class="title">${title}</div>
          <div class="subtitle">${ctx?.layout?.displayModel || ctx?.model || "Switch"} \xB7 Version ${VERSION}</div>
        </div>
        <div class="frontpanel ${ctx?.layout?.frontStyle || "single-row"}">
          ${rows.join("") || `<div class="content muted">Keine Ports erkannt.</div>`}
        </div>
        <div class="section">
          <div class="layout-note">Layout: ${ctx?.layout?.frontStyle || "generisch"}</div>
          ${detail}
        </div>
      </ha-card>
      ${this._styles()}
    `;
    this.shadowRoot.querySelectorAll(".port").forEach((btn) => {
      btn.addEventListener("click", () => {
        this._selectPort(Number(btn.dataset.port));
      });
    });
    this.shadowRoot.querySelectorAll("[data-action='toggle-poe']").forEach((btn) => {
      btn.addEventListener("click", async () => {
        await this._toggleEntity(btn.dataset.entity);
      });
    });
    this.shadowRoot.querySelectorAll("[data-action='power-cycle']").forEach((btn) => {
      btn.addEventListener("click", async () => {
        await this._pressButton(btn.dataset.entity);
      });
    });
  }
  _render() {
    const title = this._config?.name || "UniFi Device Card";
    if (!this._config?.device_id) {
      this._renderEmpty(title);
      return;
    }
    if (this._loading) {
      this.shadowRoot.innerHTML = `
        <ha-card>
          <div class="header">
            <div class="title">${title}</div>
            <div class="subtitle">Version ${VERSION}</div>
          </div>
          <div class="content muted">Lade Ger\xE4tedaten\u2026</div>
        </ha-card>
        ${this._styles()}
      `;
      return;
    }
    if (!this._deviceContext) {
      this.shadowRoot.innerHTML = `
        <ha-card>
          <div class="header">
            <div class="title">${title}</div>
            <div class="subtitle">Version ${VERSION}</div>
          </div>
          <div class="content muted">Keine Ger\xE4tedaten verf\xFCgbar.</div>
        </ha-card>
        ${this._styles()}
      `;
      return;
    }
    if (this._deviceContext.type === "switch") {
      this._renderSwitch(title);
      return;
    }
    this._renderGateway(title);
  }
};
customElements.define("unifi-device-card", UnifiDeviceCard);
window.customCards = window.customCards || [];
window.customCards.push({
  type: "unifi-device-card",
  name: "UniFi Device Card",
  description: "A Lovelace card for supported UniFi switches and gateways."
});
