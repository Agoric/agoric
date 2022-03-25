/**
 * @typedef {[unknown, ...unknown[]]} Tagged
 *
 * @typedef {{
 *   meterType: string;
 *   allocate: number | null;
 *   compute: number | null;
 * }}
 *   MeterUsage
 *
 * @typedef {{ reply: Tagged; meterUsage: MeterUsage }} CrankResults
 */

/**
 * @callback BuildRootObjectForTestVat
 * @param {VatPowers & { testLog: (msg: any) => void }} vatPowers
 * @param {Record<string, unknown> & { argv: string[] }} vatParameters
 * @returns {unknown}
 */
