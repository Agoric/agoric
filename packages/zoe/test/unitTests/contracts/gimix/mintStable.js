// @ts-check
import { E } from '@endo/far';

/**
 * @param {bigint} value
 * @param {{
 *   centralSupply: ERef<
 *     Installation<import('@agoric/vats/src/centralSupply.js').start>
 *   >;
 *   feeMintAccess: ERef<FeeMintAccess>;
 *   zoe: ERef<ZoeService>;
 * }} powers
 * @returns {Promise<Payment<'nat'>>}
 */
export const mintStablePayment = async (
  value,
  { centralSupply, feeMintAccess: feeMintAccessP, zoe },
) => {
  const feeMintAccess = await feeMintAccessP;

  const { creatorFacet: bootstrapSupplier } = await E(zoe).startInstance(
    centralSupply,
    {},
    { bootstrapPaymentValue: value },
    { feeMintAccess },
  );
  return E(bootstrapSupplier).getBootstrapPayment();
};
