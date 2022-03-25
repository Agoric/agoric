// @ts-check

import { E } from '@endo/eventual-send';
import { Far } from '@endo/marshal';
import { makeNotifierKit } from '@agoric/notifier';
import { makeLegacyMap } from '@agoric/store';
import { Nat, isNat } from '@agoric/nat';
import { AmountMath } from '@agoric/ertp';
import { assert, details as X } from '@agoric/assert';
import {
  calculateMedian,
  natSafeMath,
  makeOnewayPriceAuthorityKit,
} from '../contractSupport/index.js';

import '../../tools/types.js';

const { add, multiply, floorDivide, ceilDivide, isGTE } = natSafeMath;

/**
 * This contract aggregates price values from a set of oracles and provides a
 * PriceAuthority for their median.
 *
 * @param {ZCF<{
 *   timer: TimerService;
 *   POLL_INTERVAL: bigint;
 *   unitAmountIn: Amount;
 * }>} zcf
 */
const start = async zcf => {
  const {
    timer,
    POLL_INTERVAL,
    brands: { In: brandIn, Out: brandOut },
    unitAmountIn = AmountMath.make(brandIn, 1n),
  } = zcf.getTerms();

  const unitIn = AmountMath.getValue(brandIn, unitAmountIn);

  /** @type {IssuerRecord & { mint: ERef<Mint> }} */
  let quoteKit;

  /** @type {PriceAuthority} */
  let priceAuthority;

  /** @type {PriceAuthorityAdmin} */
  let priceAuthorityAdmin;

  /** @type {bigint} */
  let lastValueOutForUnitIn;

  /** @param {PriceQuoteValue} quote */
  const authenticateQuote = async quote => {
    const quoteAmount = AmountMath.make(quoteKit.brand, harden(quote));
    const quotePayment = await E(quoteKit.mint).mintPayment(quoteAmount);
    return harden({ quoteAmount, quotePayment });
  };

  const { notifier, updater } = makeNotifierKit();
  const zoe = zcf.getZoeService();

  /**
   * @typedef {Object} OracleRecord
   * @property {(timestamp: Timestamp) => Promise<void>} [querier]
   * @property {bigint} lastSample
   */

  /** @type {Set<OracleRecord>} */
  const oracleRecords = new Set();

  /** @type {LegacyMap<Instance, Set<OracleRecord>>} */
  // Legacy because we're storing a raw JS Set
  const instanceToRecords = makeLegacyMap('oracleInstance');

  let publishedTimestamp = await E(timer).getCurrentTimestamp();

  // Wake every POLL_INTERVAL and run the queriers.
  const repeaterP = E(timer).makeRepeater(0n, POLL_INTERVAL);
  /** @type {TimerWaker} */
  const waker = Far('waker', {
    async wake(timestamp) {
      // Run all the queriers.
      const querierPs = [];
      oracleRecords.forEach(({ querier }) => {
        if (querier) {
          querierPs.push(querier(timestamp));
        }
      });
      await Promise.all(querierPs);
    },
  });
  E(repeaterP).schedule(waker);

  /**
   * @param {Object} param0
   * @param {bigint} [param0.overrideValueOut]
   * @param {Timestamp} [param0.timestamp]
   */
  const makeCreateQuote = ({ overrideValueOut, timestamp } = {}) =>
    /**
     * @param {PriceQuery} priceQuery
     * @returns {ERef<PriceQuote>}
     */
    function createQuote(priceQuery) {
      // Sniff the current baseValueOut.
      const valueOutForUnitIn =
        overrideValueOut === undefined
          ? lastValueOutForUnitIn // Use the latest value.
          : overrideValueOut; // Override the value.
      if (valueOutForUnitIn === undefined) {
        // We don't have a quote, so abort.
        return undefined;
      }

      /**
       * @param {Amount} amountIn The given amountIn
       * @returns {Amount} The amountOut that will be received
       */
      const calcAmountOut = amountIn => {
        const valueIn = AmountMath.getValue(brandIn, amountIn);
        return AmountMath.make(
          brandOut,
          floorDivide(multiply(valueIn, valueOutForUnitIn), unitIn),
        );
      };

      /**
       * @param {Amount} amountOut The wanted amountOut
       * @returns {Amount} The amountIn needed to give
       */
      const calcAmountIn = amountOut => {
        const valueOut = AmountMath.getValue(brandOut, amountOut);
        return AmountMath.make(
          brandIn,
          ceilDivide(multiply(valueOut, unitIn), valueOutForUnitIn),
        );
      };

      // Calculate the quote.
      const quote = priceQuery(calcAmountOut, calcAmountIn);
      if (!quote) {
        return undefined;
      }

      const {
        amountIn,
        amountOut,
        timestamp: theirTimestamp = timestamp,
      } = quote;
      AmountMath.coerce(brandIn, amountIn);
      AmountMath.coerce(brandOut, amountOut);
      if (theirTimestamp !== undefined) {
        return authenticateQuote([
          { amountIn, amountOut, timer, timestamp: theirTimestamp },
        ]);
      }
      return E(timer)
        .getCurrentTimestamp()
        .then(now =>
          authenticateQuote([{ amountIn, amountOut, timer, timestamp: now }]),
        );
    };

  /**
   * @param {bigint[]} samples
   * @param {Timestamp} timestamp
   */
  const updateQuote = async (samples, timestamp) => {
    const median = calculateMedian(
      samples.filter(sample => isNat(sample) && sample > 0n),
      { add, divide: floorDivide, isGTE },
    );

    // console.error('found median', median, 'of', samples);
    if (median === undefined) {
      return;
    }

    const amountOut = AmountMath.make(brandOut, median);

    /** @type {PriceDescription} */
    const quote = {
      amountIn: unitAmountIn,
      amountOut,
      timer,
      timestamp,
    };

    // Authenticate the quote by minting it with our quote issuer, then publish.
    const authenticatedQuote = await authenticateQuote([quote]);

    // Fire any triggers now; we don't care if the timestamp is fully ordered,
    // only if the limit has ever been met.
    await priceAuthorityAdmin.fireTriggers(
      makeCreateQuote({ overrideValueOut: median, timestamp }),
    );

    if (timestamp < publishedTimestamp) {
      // A more recent timestamp has been published already, so we are too late.
      return;
    }

    // Publish a new authenticated quote.
    publishedTimestamp = timestamp;
    lastValueOutForUnitIn = median;
    updater.updateState(authenticatedQuote);
  };

  /** @type {PriceAggregatorCreatorFacet} */
  const creatorFacet = Far('PriceAggregatorCreatorFacet', {
    async initializeQuoteMint(quoteMint) {
      const quoteIssuerRecord = await zcf.saveIssuer(
        E(quoteMint).getIssuer(),
        'Quote',
      );
      quoteKit = {
        ...quoteIssuerRecord,
        mint: quoteMint,
      };

      const paKit = makeOnewayPriceAuthorityKit({
        createQuote: makeCreateQuote(),
        notifier,
        quoteIssuer: quoteKit.issuer,
        timer,
        actualBrandIn: brandIn,
        actualBrandOut: brandOut,
      });
      ({ priceAuthority, adminFacet: priceAuthorityAdmin } = paKit);
    },
    async initOracle(oracleInstance, query = undefined) {
      assert(quoteKit, X`Must initializeQuoteMint before adding an oracle`);

      /** @type {OracleRecord} */
      const record = { querier: undefined, lastSample: 0n };

      /** @type {Set<OracleRecord>} */
      let records;
      if (instanceToRecords.has(oracleInstance)) {
        records = instanceToRecords.get(oracleInstance);
      } else {
        records = new Set();
        instanceToRecords.init(oracleInstance, records);
      }
      records.add(record);
      oracleRecords.add(record);

      const pushResult = result => {
        // Sample of NaN, 0, or negative numbers get culled in the median
        // calculation.
        const sample = Nat(parseInt(result, 10));
        record.lastSample = sample;
      };

      // Obtain the oracle's publicFacet.
      const oracle = await E(zoe).getPublicFacet(oracleInstance);
      assert(records.has(record), X`Oracle record is already deleted`);

      /** @type {OracleAdmin} */
      const oracleAdmin = {
        async delete() {
          assert(records.has(record), X`Oracle record is already deleted`);

          // The actual deletion is synchronous.
          oracleRecords.delete(record);
          records.delete(record);

          if (
            records.size === 0 &&
            instanceToRecords.has(oracleInstance) &&
            instanceToRecords.get(oracleInstance) === records
          ) {
            // We should remove the entry entirely, as it is empty.
            instanceToRecords.delete(oracleInstance);
          }

          // Delete complete, so try asynchronously updating the quote.
          const deletedNow = await E(timer).getCurrentTimestamp();
          await updateQuote(
            [...oracleRecords].map(({ lastSample }) => lastSample),
            deletedNow,
          );
        },
        async pushResult(result) {
          // Sample of NaN, 0, or negative numbers get culled in
          // the median calculation.
          pushResult(result);
        },
      };

      if (query === undefined) {
        // They don't want to be polled.
        return harden(oracleAdmin);
      }

      let lastWakeTimestamp = 0n;

      /** @param {Timestamp} timestamp */
      record.querier = async timestamp => {
        // Submit the query.
        const result = await E(oracle).query(query);
        // Now that we've received the result, check if we're out of date.
        if (timestamp < lastWakeTimestamp || !records.has(record)) {
          return;
        }
        lastWakeTimestamp = timestamp;

        pushResult(result);
        await updateQuote(
          [...oracleRecords].map(({ lastSample }) => lastSample),
          timestamp,
        );
      };
      const now = await E(timer).getCurrentTimestamp();
      await record.querier(now);

      // Return the oracle admin object.
      return harden(oracleAdmin);
    },
  });

  const publicFacet = Far('publicFacet', {
    getPriceAuthority() {
      return priceAuthority;
    },
  });

  return harden({ creatorFacet, publicFacet });
};

export { start };
