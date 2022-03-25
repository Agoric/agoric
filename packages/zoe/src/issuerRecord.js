/**
 * Put together information about the issuer in a standard format that is
 * synchronously accessible.
 *
 * @param {Brand} brand
 * @param {Issuer} issuer
 * @param {DisplayInfo} displayInfo
 * @returns {IssuerRecord}
 */
export const makeIssuerRecord = (brand, issuer, displayInfo) =>
  harden({
    brand,
    issuer,
    assetKind: displayInfo.assetKind,
    displayInfo,
  });
