// book of offers to buy liquidating vaults with prices in terms of
// discount/markup from the current oracle price.

import { E } from '@endo/captp';
import { AmountMath, BrandShape } from '@agoric/ertp';
import { StorageNodeShape } from '@agoric/internal';
import { M, mustMatch } from '@agoric/store';
import {
  makeScalarBigMapStore,
  makeScalarMapStore,
  prepareExoClass,
  provide,
} from '@agoric/vat-data';
import { makePromiseKit } from '@endo/promise-kit';

import {
  toBidScalingComparator,
  toPartialOfferKey,
  toPriceOfferKey,
  toScaledRateOfferKey,
} from './sortedOffers.js';

/** @typedef {import('@agoric/vat-data').Baggage} Baggage */

/** @type {(baggage: Baggage) => bigint} */
const nextSequenceNumber = baggage => {
  let latestSequenceNumber = provide(baggage, 'sequenceNumber', () => 1000n);
  latestSequenceNumber += 1n;
  baggage.set('sequenceNumber', latestSequenceNumber);
  return latestSequenceNumber;
};

/**
 * @typedef {{
 * seat: ZCFSeat,
 * wanted: Amount<'nat'>,
 * seqNum: NatValue,
 * received: Amount<'nat'>,
 * timestamp: Timestamp,
 * } &  {exitAfterBuy: boolean} & ({ bidScaling: Pattern, price: undefined } | { bidScaling: undefined, price: Ratio})
 * } BidderRecord
 */

const ScaledBidBookStateShape = harden({
  bidScalingPattern: M.any(),
  collateralBrand: BrandShape,
  records: M.any(),
  bidsNode: StorageNodeShape,
});

const makeBidNode = (bidsNode, bidId) =>
  E(bidsNode).makeChildNode(`bid${bidId}`);

const makeGetBidDataRecorder = (bidDataKits, bidDataKitPromises) => {
  return key => {
    if (bidDataKitPromises.has(key)) {
      return E.get(bidDataKitPromises.get(key)).recorder;
    }
    return bidDataKits.get(key).recorder;
  };
};

/** @typedef {ReturnType<import('@agoric/zoe/src/contractSupport/recorder.js').MakeRecorderKit>} RecorderKit */

/**
 * Prices in this book are expressed as percentage of the full oracle price
 * snapshot taken when the auction started. .4 is 60% off. 1.1 is 10% above par.
 *
 * @param {Baggage} baggage
 * @param {import('@agoric/zoe/src/contractSupport/recorder.js').MakeRecorderKit} makeRecorderKit
 */
export const prepareScaledBidBook = (baggage, makeRecorderKit) => {
  // multiple offers might be provided at the same timestamp (since timestamp
  // granularity is limited to blocks), so we increment a sequenceNumber with
  // each offer for uniqueness.

  const bidDataKits = baggage.get('bidDataKits');
  /** @type {MapStore<string, Promise<RecorderKit>>} */
  const bidDataKitPromises = makeScalarMapStore('bidDataKit Promises');
  const getBidDataRecorder = makeGetBidDataRecorder(
    bidDataKits,
    bidDataKitPromises,
  );

  return prepareExoClass(
    baggage,
    'scaledBidBook',
    undefined,
    /**
     * @param {Pattern} bidScalingPattern
     * @param {Brand} collateralBrand
     * @param {StorageNode} bidsNode
     */
    (bidScalingPattern, collateralBrand, bidsNode) => ({
      bidScalingPattern,
      collateralBrand,
      /** @type {MapStore<string, BidderRecord>} */
      records: makeScalarBigMapStore('scaledBidRecords', { durable: true }),
      bidsNode,
    }),
    {
      /**
       * @param {ZCFSeat} seat
       * @param {Ratio} bidScaling
       * @param {Amount<'nat'>} wanted
       * @param {boolean} exitAfterBuy
       * @param {Timestamp} timestamp
       */
      add(seat, bidScaling, wanted, exitAfterBuy, timestamp) {
        const { bidScalingPattern, collateralBrand, records, bidsNode } =
          this.state;
        mustMatch(bidScaling, bidScalingPattern);

        const seqNum = nextSequenceNumber(baggage);
        const key = toScaledRateOfferKey(bidScaling, seqNum);

        /** @type {PromiseKit<RecorderKit>} */
        const bidDataKitP = makePromiseKit();
        bidDataKitPromises.init(key, bidDataKitP.promise);
        E.when(makeBidNode(bidsNode, seqNum), childBidNode => {
          const recorderKit = makeRecorderKit(childBidNode);
          bidDataKits.init(key, recorderKit);
          bidDataKitP.resolve(recorderKit);
          bidDataKitPromises.delete(key);
          return recorderKit;
        });

        /** @type {BidderRecord} */
        const bidderRecord = {
          bidScaling,
          price: undefined,
          received: AmountMath.makeEmpty(collateralBrand),
          seat,
          seqNum,
          wanted,
          exitAfterBuy,
          timestamp,
        };
        records.init(key, harden(bidderRecord));
        return key;
      },
      /** @param {Ratio} bidScaling */
      offersAbove(bidScaling) {
        const { records } = this.state;
        return [...records.entries(M.gte(toBidScalingComparator(bidScaling)))];
      },
      publishOffer(record) {
        const key = toScaledRateOfferKey(record.bidScaling, record.seqNum);

        return E(getBidDataRecorder(key)).write(
          harden({
            bidScaling: record.bidScaling,
            wanted: record.wanted,
            exitAfterBuy: record.exitAfterBuy,
            timestamp: record.timestamp,
            balance: record.seat.getCurrentAllocation().Bid,
            sequence: record.seqNum,
          }),
        );
      },
      publishOffers() {
        const { records } = this.state;

        for (const r of records.values()) {
          this.self.publishOffer(r);
        }
      },
      hasOrders() {
        const { records } = this.state;
        return records.getSize() > 0;
      },
      delete(key) {
        const { records } = this.state;
        bidDataKits.delete(key);
        records.delete(key);
      },
      updateReceived(key, sold) {
        const { records } = this.state;
        const oldRec = records.get(key);
        const newRecord = harden({
          ...oldRec,
          received: AmountMath.add(oldRec.received, sold),
        });
        records.set(key, newRecord);
        this.self.publishOffer(newRecord);
      },
      exitAllSeats() {
        const { records } = this.state;
        for (const [key, { seat }] of records.entries()) {
          if (!seat.hasExited()) {
            seat.exit();
            if (bidDataKits.has(key)) {
              bidDataKits.delete(key);
            }
            records.delete(key);
          }
        }
      },
    },
    {
      stateShape: ScaledBidBookStateShape,
    },
  );
};

const PriceBookStateShape = harden({
  priceRatioPattern: M.any(),
  collateralBrand: BrandShape,
  records: M.any(),
  bidsNode: StorageNodeShape,
});

/**
 * Prices in this book are actual prices expressed in terms of bid amount
 * and collateral amount.
 *
 * @param {Baggage} baggage
 * @param {import('@agoric/zoe/src/contractSupport/recorder.js').MakeRecorderKit} makeRecorderKit
 */
export const preparePriceBook = (baggage, makeRecorderKit) => {
  const bidDataKits = baggage.get('bidDataKits');
  /** @type {MapStore<string, Promise<RecorderKit>>} */
  const bidDataKitPromises = makeScalarMapStore('bidDataKit Promises');
  const getBidDataRecorder = makeGetBidDataRecorder(
    bidDataKits,
    bidDataKitPromises,
  );

  return prepareExoClass(
    baggage,
    'priceBook',
    undefined,
    /**
     * @param {Pattern} priceRatioPattern
     * @param {Brand} collateralBrand
     * @param {StorageNode} bidsNode
     */
    (priceRatioPattern, collateralBrand, bidsNode) => ({
      priceRatioPattern,
      collateralBrand,
      /** @type {MapStore<string, BidderRecord>} */
      records: makeScalarBigMapStore('scaledBidRecords', { durable: true }),
      bidsNode,
    }),
    {
      /**
       * @param {ZCFSeat} seat
       * @param {Ratio} price
       * @param {Amount<'nat'>} wanted
       * @param {boolean} exitAfterBuy
       * @param {Timestamp} timestamp
       */
      add(seat, price, wanted, exitAfterBuy, timestamp) {
        const { priceRatioPattern, collateralBrand, records, bidsNode } =
          this.state;
        mustMatch(price, priceRatioPattern);

        const seqNum = nextSequenceNumber(baggage);
        const key = toPriceOfferKey(price, seqNum);

        /** @type {PromiseKit<RecorderKit>} */
        const bidDataKitP = makePromiseKit();
        bidDataKitPromises.init(key, bidDataKitP.promise);
        E.when(makeBidNode(bidsNode, seqNum), childBidNode => {
          const recorderKit = makeRecorderKit(childBidNode);
          bidDataKits.init(key, recorderKit);
          bidDataKitP.resolve(recorderKit);
          bidDataKitPromises.delete(key);
          return recorderKit;
        });

        /** @type {BidderRecord} */
        const bidderRecord = harden({
          bidScaling: undefined,
          price,
          received: AmountMath.makeEmpty(collateralBrand),
          seat,
          seqNum,
          wanted,
          exitAfterBuy,
          timestamp,
        });
        records.init(key, bidderRecord);
        return key;
      },
      offersAbove(price) {
        const { records } = this.state;
        return [...records.entries(M.gte(toPartialOfferKey(price)))];
      },
      publishOffer(record) {
        const key = toPriceOfferKey(record.price, record.seqNum);

        return E(getBidDataRecorder(key)).write(
          harden({
            price: record.price,
            wanted: record.wanted,
            exitAfterBuy: record.exitAfterBuy,
            timestamp: record.timestamp,
            balance: record.seat.getCurrentAllocation().Bid,
            sequence: record.seqNum,
          }),
        );
      },
      publishOffers() {
        const { records } = this.state;
        for (const r of records.values()) {
          this.self.publishOffer(r);
        }
      },
      hasOrders() {
        const { records } = this.state;
        return records.getSize() > 0;
      },
      delete(key) {
        const { records } = this.state;
        bidDataKits.delete(key);
        records.delete(key);
      },
      updateReceived(key, sold) {
        const { records } = this.state;
        const oldRec = records.get(key);
        const newRecord = harden({
          ...oldRec,
          received: AmountMath.add(oldRec.received, sold),
        });
        records.set(key, newRecord);
        this.self.publishOffer(newRecord);
      },
      exitAllSeats() {
        const { records } = this.state;
        for (const [key, { seat }] of records.entries()) {
          if (!seat.hasExited()) {
            seat.exit();
            if (bidDataKits.has(key)) {
              bidDataKits.delete(key);
            }
            records.delete(key);
          }
        }
      },
    },
    {
      stateShape: PriceBookStateShape,
    },
  );
};
