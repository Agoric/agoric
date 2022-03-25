// @ts-check
// @jessie-check

import { assert } from '@agoric/assert';

import { AssetKind, assertAssetKind } from './amountMath.js';
import { coerceDisplayInfo } from './displayInfo.js';
import { makeBrand } from './brand.js';
import { makePaymentLedger } from './paymentLedger.js';

import './types.js';

/**
 * @template {AssetKind} K The allegedName becomes part of the brand in asset
 *   descriptions. The allegedName doesn't have to be a string, but it will only
 *   be used for its value. The allegedName is useful for debugging and
 *   double-checking assumptions, but should not be trusted.
 *
 *   The assetKind will be used to import a specific mathHelpers from the
 *   mathHelpers library. For example, natMathHelpers, the default, is used for
 *   basic fungible tokens.
 *
 *   `displayInfo` gives information to the UI on how to display the amount.
 * @param {string} allegedName
 * @param {K} [assetKind=AssetKind.NAT]
 * @param {AdditionalDisplayInfo} [displayInfo={}]
 * @param {ShutdownWithFailure} [optShutdownWithFailure] If this issuer fails in
 *   the middle of an atomic action (which btw should never happen), it
 *   potentially leaves its ledger in a corrupted state. If this function was
 *   provided, then the failed atomic action will call it, so that some larger
 *   unit of computation, like the enclosing vat, can be shutdown before
 *   anything else is corrupted by that corrupted state. See
 *   https://github.com/Agoric/agoric-sdk/issues/3434
 * @returns {{
 *   mint: Mint<K>;
 *   issuer: Issuer<K>;
 *   brand: Brand<K>;
 *   displayInfo: DisplayInfo;
 * }}
 */
const makeIssuerKit = (
  allegedName,
  // @ts-expect-error K could be instantiated with a different subtype of AssetKind
  assetKind = AssetKind.NAT,
  displayInfo = harden({}),
  optShutdownWithFailure = undefined,
) => {
  assert.typeof(allegedName, 'string');
  assertAssetKind(assetKind);

  // Add assetKind to displayInfo, or override if present
  const cleanDisplayInfo = coerceDisplayInfo(displayInfo, assetKind);
  if (optShutdownWithFailure !== undefined) {
    assert.typeof(optShutdownWithFailure, 'function');
  }

  /**
   * We can define this function to use the in-scope `issuer` variable before
   * that variable is initialized, as long as the variable is initialized before
   * the function is called.
   *
   * @param {Issuer} allegedIssuer
   * @returns {boolean}
   */
  // eslint-disable-next-line no-use-before-define
  const isMyIssuerNow = allegedIssuer => allegedIssuer === issuer;

  const brand = makeBrand(allegedName, isMyIssuerNow, cleanDisplayInfo);

  // Attenuate the powerful authority to mint and change balances
  const { issuer, mint } = makePaymentLedger(
    allegedName,
    brand,
    assetKind,
    cleanDisplayInfo,
    optShutdownWithFailure,
  );

  return harden({
    brand,
    issuer,
    mint,
    displayInfo: cleanDisplayInfo,
  });
};

harden(makeIssuerKit);

export { makeIssuerKit };

/** @typedef {ReturnType<typeof makeIssuerKit>} IssuerKit */
