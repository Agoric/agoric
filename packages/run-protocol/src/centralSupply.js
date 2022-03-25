// @ts-check

import { AmountMath } from '@agoric/ertp';
import { E, Far } from '@endo/far';

/**
 * The sole purpose of this contract is to mint the initial supply of the
 * central currency, RUN.
 *
 * @param {ZCF<{
 *   bootstrapPaymentValue: bigint;
 * }>} zcf
 * @param {Object} privateArgs
 * @param {FeeMintAccess} privateArgs.feeMintAccess
 */
export const start = async (zcf, { feeMintAccess }) => {
  const { bootstrapPaymentValue } = zcf.getTerms();
  assert.typeof(bootstrapPaymentValue, 'bigint');

  const mint = await zcf.registerFeeMint('Bootstrap', feeMintAccess);
  const { brand } = mint.getIssuerRecord();
  const { zcfSeat, userSeat } = zcf.makeEmptySeatKit();
  mint.mintGains(
    harden({
      Bootstrap: AmountMath.make(brand, bootstrapPaymentValue),
    }),
    zcfSeat,
  );
  zcfSeat.exit();
  const bootstrapPayment = await E(userSeat).getPayout('Bootstrap');

  return {
    creatorFacet: Far('creator', {
      getBootstrapPayment: () => bootstrapPayment,
    }),
  };
};
harden(start);

/** @typedef {ContractOf<typeof start>} CentralSupplyContract */
