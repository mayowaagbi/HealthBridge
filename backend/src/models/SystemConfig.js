const BaseModel = require("./BaseModel");

class SystemConfig extends BaseModel {
  constructor() {
    super("systemConfig");
    this.cache = new Map();
    this.cacheTTL = 300000; // 5 minutes
  }

  /**
   * Get config value with type conversion and caching
   * @param {string} key
   * @returns {Promise<any>} Typed config value
   */
  async getConfig(key) {
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }

    const entry = await this.prisma.systemConfig.findUnique({
      where: { key },
    });

    if (!entry) return null;

    const value = this._parseValue(entry.value, entry.type);
    this.cache.set(key, value);
    setTimeout(() => this.cache.delete(key), this.cacheTTL);

    return value;
  }

  /**
   * Set config value with type validation
   * @param {string} key
   * @param {any} value
   * @param {string} [type] - Auto-detected if omitted
   * @returns {Promise<Object>} Updated config entry
   */
  async setConfig(key, value, type) {
    const detectedType = type || this._detectType(value);
    const serializedValue = this._serializeValue(value, detectedType);

    return this.prisma
      .$transaction([
        this.prisma.systemConfig.upsert({
          where: { key },
          update: { value: serializedValue, type: detectedType },
          create: { key, value: serializedValue, type: detectedType },
        }),
      ])
      .then(() => {
        this.cache.delete(key);
        return { key, value, type: detectedType };
      });
  }

  /**
   * Get all configs as key-value pairs
   * @returns {Promise<Object>}
   */
  async getAllConfigs() {
    const entries = await this.prisma.systemConfig.findMany();
    return entries.reduce((acc, entry) => {
      acc[entry.key] = this._parseValue(entry.value, entry.type);
      return acc;
    }, {});
  }

  /** @private */
  _parseValue(value, type) {
    const parsers = {
      STRING: (v) => v,
      NUMBER: (v) => Number(v),
      BOOLEAN: (v) => v === "true",
      JSON: (v) => JSON.parse(v),
    };
    return parsers[type]?.(value) ?? value;
  }

  /** @private */
  _serializeValue(value, type) {
    const serializers = {
      STRING: (v) => String(v),
      NUMBER: (v) => String(v),
      BOOLEAN: (v) => v.toString(),
      JSON: (v) => JSON.stringify(v),
    };
    return serializers[type]?.(value) ?? value;
  }

  /** @private */
  _detectType(value) {
    if (typeof value === "boolean") return "BOOLEAN";
    if (typeof value === "number") return "NUMBER";
    if (typeof value === "object") return "JSON";
    return "STRING";
  }
}

module.exports = new SystemConfig();
