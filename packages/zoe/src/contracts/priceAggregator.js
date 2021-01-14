// @ts-check
import { E } from '@agoric/eventual-send';
import { makeNotifierKit } from '@agoric/notifier';
import makeStore from '@agoric/store';
import { assert, details } from '@agoric/assert';
import {
  calculateMedian,
  natSafeMath,
  makeOnewayPriceAuthorityKit,
} from '../contractSupport';

// the bulk import style for typescript declarations doesn't seem to work here.
/**
 * @typedef {import('../../tools/types').PriceAuthority} PriceAuthority
 * @typedef {import('../../tools/types').PriceAuthorityAdmin} PriceAuthorityAdmin
 * @typedef {import('../../tools/types').PriceQuote} PriceQuote
 * @typedef {import('../../tools/types').PriceQuoteValue} PriceQuoteValue
 * @typedef {import('../../tools/types').PriceQuery} PriceQuery
 * @typedef {import('../../tools/types').PriceDescription} PriceDescription
 */

const { add, multiply, floorDivide, ceilDivide, isGTE } = natSafeMath;

/**
 * This contract aggregates price values from a set of oracles and provides a
 * PriceAuthority for their median.
 *
 * @type {ContractStartFn}
 */
const start = async zcf => {
  const {
    timer: rawTimer,
    POLL_INTERVAL,
    maths: { In: mathIn, Out: mathOut },
    unitAmountIn = mathIn.make(1),
  } = zcf.getTerms();

  const unitIn = mathIn.getValue(unitAmountIn);

  /** @type {TimerService} */
  const timer = rawTimer;

  /** @type {IssuerRecord & { mint: ERef<Mint> }} */
  let quoteKit;

  /** @type {PriceAuthority} */
  let priceAuthority;

  /** @type {PriceAuthorityAdmin} */
  let priceAuthorityAdmin;

  /** @type {number} */
  let lastValueOutForUnitIn;

  /**
   *
   * @param {PriceQuoteValue} quote
   */
  const authenticateQuote = async quote => {
    const quoteAmount = quoteKit.amountMath.make(harden(quote));
    const quotePayment = await E(quoteKit.mint).mintPayment(quoteAmount);
    return harden({ quoteAmount, quotePayment });
  };

  const { notifier, updater } = makeNotifierKit();
  const zoe = zcf.getZoeService();

  /**
   * @typedef {Object} OracleRecord
   * @property {(timestamp: Timestamp) => Promise<void>=} querier
   * @property {number} lastSample
   */

  /** @type {Set<OracleRecord>} */
  const oracleRecords = new Set();

  /** @type {Store<Instance, Set<OracleRecord>>} */
  const instanceToRecords = makeStore('oracleInstance');

  let publishedTimestamp = await E(timer).getCurrentTimestamp();

  // Wake every POLL_INTERVAL and run the queriers.
  const repeaterP = E(timer).makeRepeater(0, POLL_INTERVAL);
  /** @type {TimerWaker} */
  const waker = {
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
  };
  E(repeaterP).schedule(waker);

  /**
   * @param {Object} param0
   * @param {number} [param0.overrideValueOut]
   * @param {Timestamp} [param0.timestamp]
   */
  const makeCreateQuote = ({ overrideValueOut, timestamp } = {}) =>
    /**
     * @param {PriceQuery} priceQuery
     * @returns {ERef<PriceQuote>=}
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
       * @param {Amount} amountIn the given amountIn
       * @returns {Amount} the amountOut that will be received
       */
      const calcAmountOut = amountIn => {
        const valueIn = mathIn.getValue(amountIn);
        return mathOut.make(
          floorDivide(multiply(valueIn, valueOutForUnitIn), unitIn),
        );
      };

      /**
       * @param {Amount} amountOut the wanted amountOut
       * @returns {Amount} the amountIn needed to give
       */
      const calcAmountIn = amountOut => {
        const valueOut = mathOut.getValue(amountOut);
        return mathIn.make(
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
      mathIn.coerce(amountIn);
      mathOut.coerce(amountOut);
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
   * @param {Array<number>} samples
   * @param {Timestamp} timestamp
   */
  const updateQuote = async (samples, timestamp) => {
    const median = calculateMedian(
      samples.filter(sample => sample > 0 && Number.isSafeInteger(sample)),
      { add, divide: floorDivide, isGTE },
    );

    // console.error('found median', median, 'of', samples);
    if (median === undefined) {
      return;
    }

    const amountOut = mathOut.make(median);

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
  const creatorFacet = harden({
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
        mathIn,
        mathOut,
        notifier,
        quoteIssuer: quoteKit.issuer,
        timer,
      });
      ({ priceAuthority, adminFacet: priceAuthorityAdmin } = paKit);
    },
    async initOracle(oracleInstance, query = undefined) {
      assert(
        quoteKit,
        details`Must initializeQuoteMint before adding an oracle`,
      );

      /** @type {OracleRecord} */
      const record = { querier: undefined, lastSample: NaN };

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
        const sample = parseInt(result, 10);
        record.lastSample = sample;
      };

      // Obtain the oracle's publicFacet.
      const oracle = await E(zoe).getPublicFacet(oracleInstance);
      assert(records.has(record), details`Oracle record is already deleted`);

      /** @type {OracleAdmin} */
      const oracleAdmin = {
        async delete() {
          assert(
            records.has(record),
            details`Oracle record is already deleted`,
          );

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

      let lastWakeTimestamp = 0;

      /**
       * @param {Timestamp} timestamp
       */
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

  const publicFacet = {
    getPriceAuthority() {
      return priceAuthority;
    },
  };

  return harden({ creatorFacet, publicFacet });
};

export { start };
