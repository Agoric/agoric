/* eslint @typescript-eslint/no-floating-promises: "warn" */
import { AmountMath } from '@agoric/ertp';
import { prepareExoClass } from '@agoric/vat-data';
import { E } from '@endo/eventual-send';

import { coerceAmountKeywordRecord } from '../cleanProposal.js';
import { assertFullIssuerRecord, makeIssuerRecord } from '../issuerRecord.js';
import { addToAllocation, subtractFromAllocation } from './allocationMath.js';

import '../internal-types.js';
import { ZcfMintI } from '../typeGuards.js';
import './internal-types.js';
import './types.js';

const { Fail } = assert;

/**
 * @template {AssetKind} K
 * @param {AmountKeywordRecord} amr
 * @param {IssuerRecord<K>} issuerRecord
 * @returns {Amount<K>}
 */
export const sumAmountKeywordRecord = (amr, issuerRecord) => {
  const empty = AmountMath.makeEmpty(
    issuerRecord.brand,
    issuerRecord.assetKind,
  );
  return Object.values(amr).reduce(
    (total, amountToAdd) =>
      AmountMath.add(total, amountToAdd, issuerRecord.brand),
    empty,
  );
};

/**
 * @param {import('@agoric/vat-data').Baggage} zcfBaggage
 * @param {{ (keyword: string, issuerRecord: IssuerRecord): void }} recordIssuer
 * @param {GetAssetKindByBrand} getAssetKindByBrand
 * @param {(exit?: undefined) => { zcfSeat: any; userSeat: Promise<UserSeat> }} makeEmptySeatKit
 * @param {ZcfMintReallocator} reallocator
 */
export const prepareZcMint = (
  zcfBaggage,
  recordIssuer,
  getAssetKindByBrand,
  makeEmptySeatKit,
  reallocator,
) => {
  const makeZcMintInternal = prepareExoClass(
    zcfBaggage,
    'zcfMint',
    ZcfMintI,
    /**
     * @template {AssetKind} [K=AssetKind]
     * @param {string} keyword
     * @param {ZoeMint<K>} zoeMint
     * @param {Required<IssuerRecord<K>>} issuerRecord
     */
    (keyword, zoeMint, issuerRecord) => {
      const {
        brand: mintyBrand,
        issuer: mintyIssuer,
        displayInfo: mintyDisplayInfo,
      } = issuerRecord;

      const mintyIssuerRecord = makeIssuerRecord(
        mintyBrand,
        mintyIssuer,
        mintyDisplayInfo,
      );
      recordIssuer(keyword, mintyIssuerRecord);

      return { keyword, zoeMint, mintyIssuerRecord };
    },
    {
      getIssuerRecord() {
        return this.state.mintyIssuerRecord;
      },
      /** @type {(gains: Record<string, Amount>, zcfSeat?: ZCFSeat) => ZCFSeat} */
      mintGains(gains, zcfSeat = makeEmptySeatKit().zcfSeat) {
        const { mintyIssuerRecord, zoeMint } = this.state;
        gains = coerceAmountKeywordRecord(gains, getAssetKindByBrand);

        const totalToMint = sumAmountKeywordRecord(gains, mintyIssuerRecord);

        !zcfSeat.hasExited() ||
          Fail`zcfSeat must be active to mint gains for the zcfSeat`;
        const allocationPlusGains = addToAllocation(
          zcfSeat.getCurrentAllocation(),
          gains,
        );

        // Increment the stagedAllocation if it exists so that the
        // stagedAllocation is kept up to the currentAllocation
        if (zcfSeat.hasStagedAllocation()) {
          zcfSeat.incrementBy(gains);
        }

        // Offer safety should never be able to be violated here, as
        // we are adding assets. However, we keep this check so that
        // all reallocations are covered by offer safety checks, and
        // that any bug within Zoe that may affect this is caught.
        zcfSeat.isOfferSafe(allocationPlusGains) ||
          Fail`The allocation after minting gains ${allocationPlusGains} for the zcfSeat was not offer safe`;
        // No effects above, apart from incrementBy. Note COMMIT POINT within
        // reallocator.reallocate(). The following two steps *should* be
        // committed atomically, but it is not a disaster if they are
        // not. If we minted only, no one would ever get those
        // invisibly-minted assets.
        E(zoeMint).mintAndEscrow(totalToMint);
        reallocator.reallocate(zcfSeat, allocationPlusGains);
        return zcfSeat;
      },
      /**
       * @param {AmountKeywordRecord} losses
       * @param {ZCFSeat} zcfSeat
       */
      burnLosses(losses, zcfSeat) {
        const { mintyIssuerRecord, zoeMint } = this.state;
        losses = coerceAmountKeywordRecord(losses, getAssetKindByBrand);

        const totalToBurn = sumAmountKeywordRecord(losses, mintyIssuerRecord);

        !zcfSeat.hasExited() ||
          Fail`zcfSeat must be active to burn losses from the zcfSeat`;
        const allocationMinusLosses = subtractFromAllocation(
          zcfSeat.getCurrentAllocation(),
          losses,
        );

        // verifies offer safety
        zcfSeat.isOfferSafe(allocationMinusLosses) ||
          Fail`The allocation after burning losses ${allocationMinusLosses} for the zcfSeat was not offer safe`;

        // Decrement the stagedAllocation if it exists so that the
        // stagedAllocation is kept up to the currentAllocation
        if (zcfSeat.hasStagedAllocation()) {
          zcfSeat.decrementBy(losses);
        }

        // No effects above, apart from decrementBy. Note COMMIT POINT within
        // reallocator.reallocate(). The following two steps *should* be
        // committed atomically, but it is not a disaster if they are
        // not. If we only commit the allocationMinusLosses no one would
        // ever get the unburned assets.
        reallocator.reallocate(zcfSeat, allocationMinusLosses);
        E(zoeMint).withdrawAndBurn(totalToBurn);
      },
    },
  );

  /**
   * @template {AssetKind} K
   * @param {string} keyword
   * @param {ERef<ZoeMint<K>>} zoeMintP
   * @returns {Promise<ZCFMint<K>>}
   */
  return async (keyword, zoeMintP) => {
    const [zoeMint, issuerRecord] = await Promise.all([
      zoeMintP,
      E(zoeMintP).getIssuerRecord(),
    ]);
    assertFullIssuerRecord(issuerRecord);
    // @ts-expect-error cast, XXX AssetKind generic
    return makeZcMintInternal(keyword, zoeMint, issuerRecord);
  };
};
