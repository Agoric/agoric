// @ts-check

import { makeStore } from '@agoric/store';
import { AmountMath, AssetKind } from '@agoric/ertp';

import {
  mintZCFMintPayment,
  validateInputs,
  checkOfferShape,
} from '../helpers.js';
import { addToLiened } from './returnableHelpers.js';

const { details: X } = assert;

/**
 * @param {string} attestationTokenName - The name for the attestation token
 * @param {Amount} empty
 * @param {ZCF} zcf
 * @returns {Promise<{
 *   makeReturnAttInvitation: MakeReturnAttInvitation;
 *   addReturnableLien: AddReturnableLien;
 *   getLienAmount: GetReturnableLienAmount;
 *   getIssuer: () => Issuer;
 *   getBrand: () => Brand;
 * }>}
 */
const setupAttestation = async (attestationTokenName, empty, zcf) => {
  assert(AmountMath.isEmpty(empty), X`empty ${empty} was not empty`);
  const zcfMint = await zcf.makeZCFMint(attestationTokenName, AssetKind.SET);
  const { brand: attestationBrand, issuer: attestationIssuer } =
    zcfMint.getIssuerRecord();

  const { brand: externalBrand } = empty;

  // Amount in `lienedAmounts` is of the brand `externalBrand`

  /** @type {Store<Address, Amount>} */
  const lienedAmounts = makeStore('address');

  // IMPORTANT: only expose this function to the owner of the address.
  // This request *must* come from the owner of the address. Merely
  // verifying that the address *could* add a lien is not sufficient.
  // The owner must consent to adding a lien, and non-owners must not
  // be able to initiate a lien for another account.

  /** @type {AddReturnableLien} */
  const addReturnableLien = (address, amount) => {
    const amountToLien = validateInputs(externalBrand, address, amount);

    addToLiened(lienedAmounts, address, amountToLien);
    const amountToMint = AmountMath.make(
      attestationBrand,
      harden([
        /** @type {ReturnableAttElem} */ ({
          address,
          amountLiened: amountToLien,
        }),
      ]),
    );

    return mintZCFMintPayment(zcf, zcfMint, amountToMint);
  };

  /** @type {ReturnAttestation} */
  const returnAttestation = seat => {
    const attestationAmount = checkOfferShape(seat, attestationBrand);

    // Burn the escrowed attestation payment and exit the seat
    zcfMint.burnLosses(harden({ Attestation: attestationAmount }), seat);
    seat.exit();

    const attestationValue = /** @type {ReturnableAttElem[]} */ (
      attestationAmount.value
    );

    attestationValue.forEach(({ address, amountLiened: amountReturned }) => {
      assert(
        lienedAmounts.has(address),
        X`We have no record of anything liened for address ${address}`,
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
        X`The returned amount ${amountReturned} was greater than the amount liened ${liened}. Something very wrong occurred.`,
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
    getIssuer: () => attestationIssuer,
    getBrand: () => attestationBrand,
  });
};

harden(setupAttestation);
export { setupAttestation };
