// @ts-check

export {};

/**
 * @typedef {string} VatID
 *
 * @typedef {string} MeterID
 *
 * @typedef {{ meterID?: MeterID }} HasMeterID
 *
 * @typedef {import('./types-external.js').DynamicVatOptionsWithoutMeter} DynamicVatOptionsWithoutMeter
 *   // used by vatKeeper.setSourceAndOptions(source, RecordedVatOptions)
 *
 * @typedef {DynamicVatOptionsWithoutMeter & HasMeterID} InternalDynamicVatOptions
 *
 * @typedef {| import('./types-external.js').StaticVatOptions
 *   | (InternalDynamicVatOptions & HasMeterID)} RecordedVatOptions
 */
