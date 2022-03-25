// @ts-check

import { AmountMath } from '@agoric/ertp';
import { E } from '@endo/eventual-send';
import { Far } from '@endo/marshal';
import { makePromiseKit } from '@endo/promise-kit';

import '../../../exported.js';
import { setupAttestation as setupReturnableAttestation } from './returnable/returnableNFT.js';
import { makeStoredTime } from './storedTime.js';
import { assertPrerequisites } from './prerequisites.js';
import { makeGetAttMaker } from './attMaker.js';

const { details: X } = assert;

/**
 * @param {ZCF} zcf
 * @param {Brand} underlyingBrand
 * @param {string} returnableAttName
 */
export const makeAttestationFacets = async (
  zcf,
  underlyingBrand,
  returnableAttName,
) => {
  const authorityPromiseKit = makePromiseKit();

  const { assetKind: underlyingAssetKind } = await E(
    underlyingBrand,
  ).getDisplayInfo();
  // AWAIT ///

  const storedTime = makeStoredTime();
  const empty = AmountMath.makeEmpty(underlyingBrand, underlyingAssetKind);

  const returnableAttManager = await setupReturnableAttestation(
    returnableAttName, // e.g. 'BldAttLoc'
    empty,
    zcf,
  );
  // AWAIT ///

  /** @type {GetLiened} */
  const getLiened = (address, currentTime, brand) => {
    assert(
      brand === underlyingBrand,
      X`This contract can only make attestations for ${brand}`,
    );
    storedTime.updateTime(currentTime);
    return returnableAttManager.getLienAmount(address);
  };

  // IMPORTANT: only expose this function to the owner of the address.
  // This request *must* come from the owner of the address. Merely
  // verifying that the address *could* add a lien is not sufficient.
  // The owner must consent to adding a lien, and non-owners must not
  // be able to initiate a lien for another account.

  /**
   * @param {string} address
   * @param {Amount} amountToLien
   */
  const makeAttestationsInternal = async (address, amountToLien) => {
    amountToLien = AmountMath.coerce(underlyingBrand, amountToLien);

    await assertPrerequisites(
      authorityPromiseKit.promise,
      storedTime,
      getLiened,
      underlyingBrand,
      address,
      amountToLien,
    );
    // AWAIT ///

    const returnableAttPayment = returnableAttManager.addReturnableLien(
      address,
      amountToLien,
    );

    return harden(returnableAttPayment);
  };

  const publicFacet = Far('attestation publicFacet', {
    makeReturnAttInvitation: returnableAttManager.makeReturnAttInvitation,
    getIssuer: () => returnableAttManager.getIssuer(),
    getBrand: () => returnableAttManager.getBrand(),
  });

  // IMPORTANT: The AttMaker should only be given to the owner of the
  // address. Only the owner should be able to create attestations and
  // the resulting liens on their underlying tokens.

  /** @type {MakeAttMaker} */
  const makeAttMaker = address => {
    /** @type {AttMaker} */
    return Far('attMaker', {
      makeAttestation: amountToLien =>
        makeAttestationsInternal(address, amountToLien),
      makeReturnAttInvitation: returnableAttManager.makeReturnAttInvitation,
    });
  };

  const getAttMaker = makeGetAttMaker(makeAttMaker);

  // The authority is used to confirm that the underlying assets are escrowed appropriately.
  const addAuthority = authority => authorityPromiseKit.resolve(authority);

  const creatorFacet = Far('attestation creatorFacet', {
    getLiened,
    getAttMaker,
    addAuthority,
  });

  return harden({ creatorFacet, publicFacet });
};

/** @param {ZCF<{ returnableAttName: string }>} zcf */
const start = async zcf => {
  const {
    brands: { Underlying: underlyingBrand },
    returnableAttName,
  } = zcf.getTerms();
  return makeAttestationFacets(zcf, underlyingBrand, returnableAttName);
};
harden(start);

export { start };
