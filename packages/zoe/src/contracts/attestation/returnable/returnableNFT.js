// @ts-check

import { makeStore } from '@agoric/store';
import { AmountMath, AssetKind } from '@agoric/ertp';

import {
  mintZCFMintPayment,
  validateInputs,
  checkOfferShape,
} from '../helpers';
import { addToLiened } from './returnableHelpers';

const { details: X, quote: q } = assert;

/**
 * @param {string} attestationTokenName - the name for the attestation
 * token
 * @param {Amount} empty
 * @param {ContractFacet} zcf
 * @returns {Promise<{makeReturnAttInvitation:
 * MakeReturnAttInvitation, addReturnableLien: AddReturnableLien,
 * getLienAmount: GetReturnableLienAmount, issuer: Issuer, brand: Brand}>}
 */
const setupAttestation = async (attestationTokenName, empty, zcf) => {
  assert(AmountMath.isEmpty(empty), `empty ${q(empty)} was not empty`);
  const zcfMint = await zcf.makeZCFMint(attestationTokenName, AssetKind.SET);
  const {
    brand: attestationBrand,
    issuer: attestationIssuer,
  } = zcfMint.getIssuerRecord();

  const { brand: externalBrand } = empty;

  // Amount in `lienedAmounts` is of the brand `externalBrand`

  /** @type {Store<Address,Amount>} */
  const lienedAmounts = makeStore('address');

  /** @type {AddReturnableLien} */
  const addReturnableLien = (address, amount) => {
    const amountToLien = validateInputs(externalBrand, address, amount);

    addToLiened(lienedAmounts, address, amountToLien);
    const amountToMint = AmountMath.make(attestationBrand, [
      /** @type {ReturnableAttElem} */ ({
        address,
        amountLiened: amountToLien,
      }),
    ]);

    return mintZCFMintPayment(zcf, zcfMint, amountToMint);
  };

  /** @type {ReturnAttestation} */
  const returnAttestation = seat => {
    const attestationAmount = checkOfferShape(seat, attestationBrand);

    // Burn the escrowed attestation payment and exit the seat
    zcfMint.burnLosses({ Attestation: attestationAmount }, seat);
    seat.exit();

    const attestationValue =
      /** @type {Array<ReturnableAttElem>} */ (attestationAmount.value);

    attestationValue.forEach(({ address, amountLiened: amountReturned }) => {
      assert(
        lienedAmounts.has(address),
        X`We have no record of anything liened for address ${q(address)}`,
      );
      // No need to validate the address and amountLiened because we
      // get the address and the amountLiened from the escrowed
      // amount, which Zoe verifies is from a real attestation payment
      const liened = lienedAmounts.get(address);
      // This assertion should always be true.
      // TODO: Escalate appropriately, such as shutting down the vat
      // if false.
      assert(
        AmountMath.isGTE(liened, amountReturned),
        X`The returned amount ${q(
          amountReturned,
        )} was greater than the amount liened ${q(
          liened,
        )}. Something very wrong occurred.`,
      );
      const updated = AmountMath.subtract(liened, amountReturned);
      lienedAmounts.set(address, updated);
    });
  };

  /** @type {GetReturnableLienAmount} */
  const getLienAmount = address => {
    assert.typeof(address, 'string');
    if (lienedAmounts.has(address)) {
      return lienedAmounts.get(address);
    } else {
      return empty;
    }
  };

  /** @type {MakeReturnAttInvitation} */
  const makeReturnAttInvitation = () =>
    zcf.makeInvitation(returnAttestation, 'ReturnAtt', {
      brand: attestationBrand,
    });

  return harden({
    makeReturnAttInvitation,
    addReturnableLien,
    getLienAmount,
    issuer: attestationIssuer,
    brand: attestationBrand,
  });
};

harden(setupAttestation);
export { setupAttestation };
