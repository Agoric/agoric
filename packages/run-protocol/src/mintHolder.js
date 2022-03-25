// @ts-check
// @jessie-check

import { makeIssuerKit } from '@agoric/ertp';

/**
 * This contract holds one mint; it basically wraps makeIssuerKit in its own
 * contract, and hence in its own vat.
 *
 * @param {ZCF<{
 *   keyword: string;
 *   assetKind: AssetKind;
 *   displayInfo: DisplayInfo;
 * }>} zcf
 * @returns {{ publicFacet: Issuer; creatorFacet: Mint }}
 */
export const start = zcf => {
  const { keyword, assetKind, displayInfo } = zcf.getTerms();

  const { mint, issuer } = makeIssuerKit(keyword, assetKind, displayInfo);

  return {
    publicFacet: issuer,
    creatorFacet: mint,
  };
};
harden(start);
