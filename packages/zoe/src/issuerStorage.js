// @ts-check

import { makeWeakStore } from '@agoric/store';
import { assert, details as X } from '@agoric/assert';
import { E } from '@endo/eventual-send';

import { arrayToObj } from './objArrayConversion.js';
import { cleanKeywords } from './cleanProposal.js';
import { makeIssuerRecord } from './issuerRecord.js';

/** Make the Issuer Storage. */
export const makeIssuerStorage = () => {
  /** @type {WeakStore<Brand, IssuerRecord>} */
  const brandToIssuerRecord = makeWeakStore('brand');
  /** @type {WeakStore<Issuer, IssuerRecord>} */
  const issuerToIssuerRecord = makeWeakStore('issuer');

  let instantiated = false;
  const assertInstantiated = () =>
    assert(instantiated, X`issuerStorage has not been instantiated`);

  /**
   * If we already know the entire issuer record, such as for a ZCFMint issuer,
   * or for an issuer that Zoe has told us about, store the issuerRecord directly.
   *
   * A note on checking that the issuer and brand match: Because of how we use
   * `storeIssuerRecord`, the issuer and brand in the `issuerRecord` parameter
   * are guaranteed to match, and we do not need to do another asynchronous call.
   *
   * We use `storeIssuerRecord` in 4 cases: 1) ZoeMint records, 2) ZCFMint
   * records, 3) within `storeIssuer`, and 4) storing an issuer record in ZCF
   * that we obtained from Zoe that originally went through `storeIssuer`. In
   * ZoeMints (repackaged as ZCFMints), we create the issuers and brands
   * ourselves using ERTP directly, so we know they are not malicious and that
   * the issuers and brands match. In the last two cases, we go through the
   * brand-issuer-match check in `storeIssuer`.
   *
   * The reason why we need the `has` check below is for the 4th case above, in
   * which we store an issuer record in ZCF that we obtained from Zoe.
   * `WeakStore.init` errors if the key is already present, and because an
   * issuer can be used more than once in the same contract, we need to make
   * sure we aren't trying to `init` twice. If the issuer and its record are
   * already present, we do not need to add the issuer again in ZCF.
   *
   * @param {IssuerRecord} issuerRecord
   * @returns {IssuerRecord}
   */
  const storeIssuerRecord = issuerRecord => {
    assertInstantiated();
    const { brand, issuer } = issuerRecord;
    if (issuerToIssuerRecord.has(issuer)) {
      return issuerToIssuerRecord.get(issuer);
    }

    brandToIssuerRecord.init(brand, issuerRecord);
    issuerToIssuerRecord.init(issuer, issuerRecord);
    return issuerToIssuerRecord.get(issuer);
  };

  const getByBrand = brand => {
    assertInstantiated();
    return brandToIssuerRecord.get(brand);
  };

  /**
   * If the issuer is already stored, return the issuerRecord. Otherwise, make
   * and save the issuerRecord.
   *
   * @param {ERef<Issuer>} issuerP
   * @returns {Promise<IssuerRecord>}
   */
  const storeIssuer = async issuerP => {
    assertInstantiated();
    const brandP = E(issuerP).getBrand();
    const brandIssuerMatchP = E(brandP).isMyIssuer(issuerP);
    const displayInfoP = E(brandP).getDisplayInfo();
    /** @type {[Issuer, Brand, boolean, DisplayInfo]} */
    const [issuer, brand, brandIssuerMatch, displayInfo] = await Promise.all([
      issuerP,
      brandP,
      brandIssuerMatchP,
      displayInfoP,
    ]);
    // AWAIT /////

    if (issuerToIssuerRecord.has(issuer)) {
      return issuerToIssuerRecord.get(issuer);
    }
    // A malicious issuer may use another issuer's valid brand.
    // Therefore, we must check that the brand recognizes the issuer
    // as its own and vice versa. However, we only need to check this
    // once per issuer per ZoeService, and we do not need to check
    // this for issuers that the ZoeService creates, such as issuers
    // made with ZCFMints.

    // In the case of a malicious issuer using another issuer's brand,
    // the line below will throw in all cases. However, in the case of
    // a malicious issuer using a *malicious* brand, the malicious
    // issuer and brand may coordinate to change their answers. At
    // this point, Zoe has done all it could. Zoe does not prevent or
    // intend to prevent issuer misbehavior in general, so the user
    // *must* rely on the good behavior of the issuers used in the
    // smart contracts they use.
    assert(brandIssuerMatch, `issuer was using a brand which was not its own`);
    const issuerRecord = makeIssuerRecord(brand, issuer, displayInfo);
    storeIssuerRecord(issuerRecord);
    return getByBrand(brand);
  };

  const storeIssuers = issuers => {
    assertInstantiated();
    return Promise.all(issuers.map(storeIssuer));
  };

  /** @type {GetAssetKindByBrand} */
  const getAssetKindByBrand = brand => {
    assertInstantiated();
    return getByBrand(brand).assetKind;
  };

  /**
   * @param {IssuerKeywordRecord} uncleanIssuerKeywordRecord
   * @returns {Promise<{
   *   issuers: IssuerKeywordRecord;
   *   brands: BrandKeywordRecord;
   * }>}
   */
  const storeIssuerKeywordRecord = async uncleanIssuerKeywordRecord => {
    assertInstantiated();
    const keywords = cleanKeywords(uncleanIssuerKeywordRecord);
    const issuerPs = keywords.map(
      keyword => uncleanIssuerKeywordRecord[keyword],
    );
    // The issuers may not have been seen before, so we must wait for the
    // issuer records to be available synchronously
    const issuerRecords = await storeIssuers(issuerPs);
    // AWAIT ///

    const issuers = arrayToObj(
      issuerRecords.map(record => record.issuer),
      keywords,
    );
    const brands = arrayToObj(
      issuerRecords.map(record => record.brand),
      keywords,
    );

    return harden({
      issuers,
      brands,
    });
  };

  /**
   * @param {Issuer} issuer
   * @returns {Brand}
   */
  const getBrandForIssuer = issuer => {
    assertInstantiated();
    return issuerToIssuerRecord.get(issuer).brand;
  };

  /**
   * @param {Brand} brand
   * @returns {Issuer}
   */
  const getIssuerForBrand = brand => {
    assertInstantiated();
    return brandToIssuerRecord.get(brand).issuer;
  };

  /** @type {IssuerStorageGetIssuerRecords} */
  const getIssuerRecords = issuers => {
    assertInstantiated();
    return issuers.map(issuerToIssuerRecord.get);
  };

  const instantiate = (issuerRecords = []) => {
    assert(
      instantiated === false,
      X`issuerStorage can only be instantiated once`,
    );
    instantiated = true;
    issuerRecords.forEach(storeIssuerRecord);
  };

  return {
    storeIssuerKeywordRecord,
    storeIssuer,
    storeIssuerRecord,
    getAssetKindByBrand,
    getBrandForIssuer,
    getIssuerForBrand,
    getIssuerRecords,
    instantiate,
  };
};
