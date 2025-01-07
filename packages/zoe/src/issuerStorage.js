import { Fail } from '@endo/errors';
import { E } from '@endo/eventual-send';
import { deeplyFulfilledObject, objectMap } from '@agoric/internal';
import { provideDurableWeakMapStore } from '@agoric/vat-data';

import { cleanKeywords } from './cleanProposal.js';
import { makeIssuerRecord } from './issuerRecord.js';

const STORAGE_INSTANTIATED_KEY = 'IssuerStorageInstantiated';

/**
 * Make the Issuer Storage.
 *
 * @param {import('@agoric/vat-data').Baggage} zcfBaggage
 */
export const provideIssuerStorage = zcfBaggage => {
  /** @type {WeakMapStore<Brand,IssuerRecord>} */
  const brandToIssuerRecord = provideDurableWeakMapStore(
    zcfBaggage,
    'brandToIssuerRecord',
  );
  /** @type {WeakMapStore<Issuer,IssuerRecord>} */
  const issuerToIssuerRecord = provideDurableWeakMapStore(
    zcfBaggage,
    'issuerToIssuerRecord',
  );

  let instantiated = zcfBaggage.has(STORAGE_INSTANTIATED_KEY);
  const assertInstantiated = () => {
    instantiated || Fail`issuerStorage has not been instantiated`;
  };

  /**
   * If we already know the entire issuer record, such as for a
   * ZCFMint issuer, or for an issuer that Zoe has told us about,
   * store the issuerRecord directly.
   *
   * A note on checking that the issuer and brand match: Because of
   * how we use `storeIssuerRecord`, the issuer and brand in the
   * `issuerRecord` parameter are guaranteed to match, and we do not
   * need to do another asynchronous call.
   *
   * We use `storeIssuerRecord` in 4 cases: 1) ZoeMint records, 2)
   * ZCFMint records, 3) within `storeIssuer`, and 4) storing an
   * issuer record in ZCF that we obtained from Zoe that originally
   * went through `storeIssuer`. In ZoeMints (repackaged as ZCFMints),
   * we create the issuers and brands ourselves using ERTP directly,
   * so we know they are not malicious and that the issuers and brands
   * match. In the last two cases, we go through the
   * brand-issuer-match check in `storeIssuer`.
   *
   * The reason why we need the `has` check below is for the 4th case
   * above, in which we store an issuer record in ZCF that we obtained
   * from Zoe. `WeakMapStore.init` errors if the key is already present,
   * and because an issuer can be used more than once in the same
   * contract, we need to make sure we aren't trying to `init` twice.
   * If the issuer and its record are already present, we do not need
   * to add the issuer again in ZCF.
   *
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
   * If the issuer is already stored, return the issuerRecord.
   * Otherwise, make and save the issuerRecord.
   *
   * @param {ERef<Issuer>} issuerP
   * @returns {Promise<IssuerRecord>}
   */
  const storeIssuer = async issuerP => {
    assertInstantiated();
    const brandP = E(issuerP).getBrand();
    const brandIssuerMatchP = E(brandP).isMyIssuer(issuerP);
    const displayInfoP = E(brandP).getDisplayInfo();
    /** @type {[Issuer,Brand,boolean,DisplayInfo]} */
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
    brandIssuerMatch || Fail`issuer was using a brand which was not its own`;
    const issuerRecord = makeIssuerRecord(brand, issuer, displayInfo);
    storeIssuerRecord(issuerRecord);
    return getByBrand(brand);
  };

  /** @type {GetAssetKindByBrand} */
  const getAssetKindByBrand = brand => {
    assertInstantiated();
    return getByBrand(brand).assetKind;
  };

  /**
   *
   * @param {IssuerKeywordRecord} uncleanIssuerKeywordRecord
   * @returns {Promise<{ issuers: IssuerKeywordRecord,
   *                     brands: BrandKeywordRecord }>}
   */
  const storeIssuerKeywordRecord = async uncleanIssuerKeywordRecord => {
    assertInstantiated();
    cleanKeywords(uncleanIssuerKeywordRecord);
    const issuerRecordPs = objectMap(
      uncleanIssuerKeywordRecord,
      async issuerP => storeIssuer(issuerP),
    );
    const issuerRecords = await deeplyFulfilledObject(issuerRecordPs);
    const issuers = objectMap(issuerRecords, ({ issuer }) => issuer);
    const brands = objectMap(issuerRecords, ({ brand }) => brand);
    return harden({ issuers, brands });
  };

  /**
   * @template {AssetKind} K
   * @param {Issuer<K>} issuer
   * @returns {Brand<K>}
   */
  const getBrandForIssuer = issuer => {
    assertInstantiated();
    // @ts-expect-error cast
    return issuerToIssuerRecord.get(issuer).brand;
  };

  /**
   * @template {AssetKind} K
   * @param {Brand<K>} brand
   * @returns {Issuer<K>}
   */
  const getIssuerForBrand = brand => {
    assertInstantiated();
    // @ts-expect-error cast
    return brandToIssuerRecord.get(brand).issuer;
  };

  /**
   * @param {Issuer[]} issuers
   * @returns {IssuerRecords}
   */
  const getIssuerRecords = issuers => {
    assertInstantiated();
    return issuers.map(issuerToIssuerRecord.get);
  };

  const instantiate = (issuerRecords = []) => {
    if (!zcfBaggage.has(STORAGE_INSTANTIATED_KEY)) {
      zcfBaggage.init(STORAGE_INSTANTIATED_KEY, true);
      instantiated = true;
      for (const record of issuerRecords) {
        storeIssuerRecord(record);
      }
    }
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
