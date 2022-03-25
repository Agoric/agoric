// @ts-check

import { AmountMath } from '@agoric/ertp';
import { E } from '@endo/eventual-send';

import { assertProposalShape } from '../../contractSupport/index.js';

const { details: X } = assert;

/**
 * Validate that the address is a string and that the amount is a valid Amount
 * of the right brand. Coerce the amount and return it.
 *
 * @param {Brand} externalBrand
 * @param {Address} address
 * @param {Amount} amount
 * @returns {Amount}
 */
const validateInputs = (externalBrand, address, amount) => {
  assert.typeof(address, 'string');
  // Will throw if amount is invalid
  return AmountMath.coerce(externalBrand, amount);
};
harden(validateInputs);

/**
 * @param {ZCF} zcf
 * @param {ZCFMint} zcfMint
 * @param {Amount} amountToMint
 * @returns {Promise<Payment>}
 */
const mintZCFMintPayment = (zcf, zcfMint, amountToMint) => {
  const { userSeat, zcfSeat } = zcf.makeEmptySeatKit();
  zcfMint.mintGains(harden({ Attestation: amountToMint }), zcfSeat);
  zcfSeat.exit();
  return E(userSeat).getPayout('Attestation');
};
harden(mintZCFMintPayment);

/**
 * @param {ZCFSeat} seat
 * @param {Brand} attestationBrand
 * @returns {Amount}
 */
const checkOfferShape = (seat, attestationBrand) => {
  assertProposalShape(seat, { give: { Attestation: null }, want: {} });
  const attestationAmount = seat.getAmountAllocated('Attestation');
  assert(
    attestationAmount.brand === attestationBrand,
    X`The escrowed attestation ${attestationAmount} was not of the attestation brand${attestationBrand}`,
  );
  return attestationAmount;
};
harden(checkOfferShape);

// If x is greater than or equal to y, subtract. If not, return empty.
const subtractOrMakeEmpty = (x, y) => {
  if (AmountMath.isGTE(x, y)) {
    return AmountMath.subtract(x, y);
  } else {
    return AmountMath.makeEmptyFromAmount(x);
  }
};
harden(subtractOrMakeEmpty);

export {
  validateInputs,
  mintZCFMintPayment,
  checkOfferShape,
  subtractOrMakeEmpty,
};
