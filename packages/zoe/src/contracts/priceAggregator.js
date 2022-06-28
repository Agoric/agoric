// @ts-check
// @jessie-check

import { makeIssuerKit, AssetKind, AmountMath } from '@agoric/ertp';
import { E } from '@endo/eventual-send';
import { Far } from '@endo/marshal';
import { makeNotifierKit } from '@agoric/notifier';
import { makeLegacyMap } from '@agoric/store';
import { assert, details as X } from '@agoric/assert';
import {
  calculateMedian,
  makeOnewayPriceAuthorityKit,
} from '../contractSupport/index.js';
import {
  makeRatio,
  makeRatioFromAmounts,
  parseRatio,
  addRatios,
  ratioGTE,
  floorMultiplyBy,
  ceilDivideBy,
  multiplyRatios,
} from '../contractSupport/ratio.js';

import '../../tools/types.js';

/**
 * This contract aggregates price values from a set of oracles and provides a
 * PriceAuthority for their median.
 *
 * @param {ZCF<{
 * timer: TimerService,
 * POLL_INTERVAL: bigint,
 * brandIn: Brand,
 * brandOut: Brand,
 * }>} zcf
 * @param {object} root0
 * @param {ERef<Mint>} [root0.quoteMint]
 */
const start = async (
  zcf,
  { quoteMint = makeIssuerKit('quote', AssetKind.SET).mint } = {},
) => {
  const { timer, POLL_INTERVAL, brandIn, brandOut } = zcf.getTerms();

  const quoteIssuerRecord = await zcf.saveIssuer(
    E(quoteMint).getIssuer(),
    'Quote',
  );
  const quoteKit = {
    ...quoteIssuerRecord,
    mint: quoteMint,
  };

  /** @type {Ratio} */
  let lastPrice;

  /**
   *
   * @param {PriceQuoteValue} quote
   */
  const authenticateQuote = async quote => {
    const quoteAmount = AmountMath.make(quoteKit.brand, harden(quote));
    const quotePayment = await E(quoteKit.mint).mintPayment(quoteAmount);
    return harden({ quoteAmount, quotePayment });
  };

  const { notifier, updater } = makeNotifierKit();
  const { notifier: roundCompleteNotifier, updater: roundCompleteUpdater } =
    makeNotifierKit();
  const zoe = zcf.getZoeService();

  /**
   * @typedef {object} OracleRecord
   * @property {(timestamp: Timestamp) => Promise<void>=} querier
   * @property {Ratio} lastSample
   * @property {OracleKey} oracleKey
   */

  /** @type {Set<OracleRecord>} */
  const oracleRecords = new Set();

  /** @type {LegacyMap<OracleKey, Set<OracleRecord>>} */
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
      if (!querierPs.length) {
        // Only have push results, so publish them.
        // eslint-disable-next-line no-use-before-define
        querierPs.push(updateQuote(timestamp));
      }
      await Promise.all(querierPs).catch(console.error);
    },
  });
  E(repeaterP).schedule(waker);

  /**
   * @param {object} param0
   * @param {Ratio} [param0.overridePrice]
   * @param {Timestamp} [param0.timestamp]
   */
  const makeCreateQuote = ({ overridePrice, timestamp } = {}) =>
    /**
     * @param {PriceQuery} priceQuery
     * @returns {ERef<PriceQuote>=}
     */
    function createQuote(priceQuery) {
      // Use the current price.
      const price = overridePrice || lastPrice;
      if (price === undefined) {
        // We don't have a quote, so abort.
        return undefined;
      }

      /**
       * @param {Amount} amountIn the given amountIn
       * @returns {Amount} the amountOut that will be received
       */
      const calcAmountOut = amountIn => {
        return floorMultiplyBy(amountIn, price);
      };

      /**
       * @param {Amount} amountOut the wanted amountOut
       * @returns {Amount} the amountIn needed to give
       */
      const calcAmountIn = amountOut => {
        return ceilDivideBy(amountOut, price);
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

  const { priceAuthority, adminFacet: priceAuthorityAdmin } =
    makeOnewayPriceAuthorityKit({
      createQuote: makeCreateQuote(),
      notifier,
      quoteIssuer: quoteKit.issuer,
      timer,
      actualBrandIn: brandIn,
      actualBrandOut: brandOut,
    });

  /**
   * @param {Ratio} r
   * @param {bigint} n
   */
  const divide = (r, n) =>
    makeRatio(
      r.numerator.value,
      r.numerator.brand,
      r.denominator.value * n,
      r.denominator.brand,
    );

  /**
   * @param {Timestamp} timestamp
   */
  const updateQuote = async timestamp => {
    const submitted = [...oracleRecords.values()].map(
      ({ oracleKey, lastSample }) =>
        /** @type {[OracleKey, Ratio]} */ ([oracleKey, lastSample]),
    );
    const median = calculateMedian(
      submitted
        .map(([_k, v]) => v)
        .filter(
          sample =>
            sample.numerator.value > 0n && sample.denominator.value > 0n,
        ),
      {
        add: addRatios,
        divide,
        isGTE: ratioGTE,
      },
    );

    if (median === undefined) {
      return;
    }

    /** @type {PriceDescription} */
    const quote = {
      amountIn: median.denominator,
      amountOut: median.numerator,
      timer,
      timestamp,
    };

    // Authenticate the quote by minting it with our quote issuer, then publish.
    const authenticatedQuote = await authenticateQuote([quote]);
    roundCompleteUpdater.updateState({ submitted, authenticatedQuote });

    // Fire any triggers now; we don't care if the timestamp is fully ordered,
    // only if the limit has ever been met.
    await priceAuthorityAdmin.fireTriggers(
      makeCreateQuote({ overridePrice: median, timestamp }),
    );

    if (timestamp < publishedTimestamp) {
      // A more recent timestamp has been published already, so we are too late.
      return;
    }

    // Publish a new authenticated quote.
    publishedTimestamp = timestamp;
    lastPrice = median;
    updater.updateState(authenticatedQuote);
  };

  /** @param {ERef<Brand>} brand */
  const getDecimalP = async brand => {
    const displayInfo = E(brand).getDisplayInfo();
    return E.get(displayInfo).decimalPlaces;
  };
  const [decimalPlacesIn = 0, decimalPlacesOut = 0] = await Promise.all([
    getDecimalP(brandIn),
    getDecimalP(brandOut),
  ]);

  /**
   * We typically don't rely on decimal places in contract code, but if an
   * oracle price source supplies a single dimensionless price, we need to
   * interpret it as a ratio for units of brandOut per units of brandIn.  If we
   * don't do this, then our quoted prices (i.e. `amountOut`) would not be
   * correct for brands with different decimalPlaces.
   *
   * This isn't really an abuse: we are using these decimalPlaces correctly to
   * interpret the price source's "display output" as an actual
   * amountOut:amountIn ratio used in calculations.
   *
   * If a price source wishes to supply an amountOut:amountIn ratio explicitly,
   * it is free to do so, and that is the preferred way.  We leave this
   * unitPriceScale implementation intact, however, since price sources may be
   * outside the distributed object fabric and unable to convey brand references
   * (since they can communicate only plain data).
   */
  const unitPriceScale = makeRatio(
    10n ** BigInt(Math.max(decimalPlacesOut - decimalPlacesIn, 0)),
    brandOut,
    10n ** BigInt(Math.max(decimalPlacesIn - decimalPlacesOut, 0)),
    brandOut,
  );
  const makeRatioFromData = numericData => {
    const unscaled = parseRatio(numericData, brandOut, brandIn);
    return multiplyRatios(unscaled, unitPriceScale);
  };

  /** @type {PriceAggregatorCreatorFacet} */
  const creatorFacet = Far('PriceAggregatorCreatorFacet', {
    /**
     * An "oracle invitation" is an invitation to be able to submit data to
     * include in the priceAggregator's results.
     *
     * The offer result from this invitation is a OracleAdmin, which can be used
     * directly to manage the price submissions as well as to terminate the
     * relationship.
     *
     * @param {Instance | string} [oracleKey]
     */
    makeOracleInvitation: async oracleKey => {
      /**
       * If custom arguments are supplied to the `zoe.offer` call, they can
       * indicate an OraclePriceSubmission notifier and a corresponding
       * `shiftValueOut` that should be adapted as part of the priceAuthority's
       * reported data.
       *
       * @param {ZCFSeat} seat
       * @param {object} param1
       * @param {Notifier<OraclePriceSubmission>} [param1.notifier] optional notifier that produces oracle price submissions
       * @param {number} [param1.scaleValueOut]
       * @returns {Promise<OracleAdmin>}
       */
      const offerHandler = async (
        seat,
        { notifier: oracleNotifier, scaleValueOut = 1 } = {},
      ) => {
        const admin = await creatorFacet.initOracle(oracleKey);
        seat.exit();
        if (!oracleNotifier) {
          // No notifier to track, just let them have the direct admin.
          return admin;
        }

        // Support for notifiers that don't produce ratios, but need scaling for
        // their numeric data.
        const priceScale = parseRatio(scaleValueOut, brandOut);
        const makeScaledRatioFromData = numericData => {
          const ratio = makeRatioFromData(numericData);
          return multiplyRatios(ratio, priceScale);
        };

        /**
         * Adapt the notifier to push results.
         *
         * @param {UpdateRecord<OraclePriceSubmission>} param0
         */
        const recurse = ({ value, updateCount }) => {
          if (!oracleNotifier || !updateCount) {
            // Interrupt the cycle because we either are deleted or the notifier
            // finished.
            return;
          }
          // Queue the next update.
          E(oracleNotifier).getUpdateSince(updateCount).then(recurse);

          // See if we have associated parameters or just a raw value.
          let result;
          switch (typeof value) {
            case 'number':
            case 'bigint':
            case 'string': {
              result = makeScaledRatioFromData(value);
              break;
            }
            default: {
              if (value && value.data !== undefined) {
                result = {
                  ...value,
                  data: makeScaledRatioFromData(value.data),
                };
              } else {
                result = value;
              }
            }
          }

          admin.pushResult(result).catch(console.error);
        };

        // Start the notifier.
        E(oracleNotifier).getUpdateSince().then(recurse);

        return Far('oracleAdmin', {
          ...admin,
          delete: async () => {
            // Stop tracking the notifier on delete.
            oracleNotifier = undefined;
            return admin.delete();
          },
        });
      };

      return zcf.makeInvitation(offerHandler, 'oracle invitation');
    },
    deleteOracle: async oracleKey => {
      for (const record of instanceToRecords.get(oracleKey)) {
        oracleRecords.delete(record);
      }

      // We should remove the entry entirely, as it is empty.
      instanceToRecords.delete(oracleKey);

      // Delete complete, so try asynchronously updating the quote.
      const deletedNow = await E(timer).getCurrentTimestamp();
      await updateQuote(deletedNow);
    },
    initOracle: async (oracleInstance, query) => {
      /** @type {OracleKey} */
      const oracleKey = oracleInstance || Far('fresh key', {});

      /** @type {OracleRecord} */
      const record = {
        oracleKey,
        lastSample: makeRatio(0n, brandOut, 1n, brandIn),
      };

      /** @type {Set<OracleRecord>} */
      let records;
      if (instanceToRecords.has(oracleKey)) {
        records = instanceToRecords.get(oracleKey);
      } else {
        records = new Set();
        instanceToRecords.init(oracleKey, records);
      }
      records.add(record);
      oracleRecords.add(record);

      // Push the current price ratio.
      const pushResult = result => {
        // Sample of NaN, 0, or negative numbers get culled in the median
        // calculation.
        let ratio;
        if (result && result.numerator && result.denominator) {
          ratio = makeRatioFromAmounts(result.numerator, result.denominator);
          AmountMath.coerce(brandOut, ratio.numerator);
          AmountMath.coerce(brandIn, ratio.denominator);
        } else {
          ratio = makeRatioFromData(result);
        }
        record.lastSample = ratio;
      };

      /** @type {OracleAdmin} */
      const oracleAdmin = Far('OracleAdmin', {
        async delete() {
          assert(records.has(record), X`Oracle record is already deleted`);

          // The actual deletion is synchronous.
          oracleRecords.delete(record);
          records.delete(record);

          if (
            records.size === 0 &&
            instanceToRecords.has(oracleKey) &&
            instanceToRecords.get(oracleKey) === records
          ) {
            // We should remove the entry entirely, as it is empty.
            instanceToRecords.delete(oracleKey);
          }

          // Delete complete, so try asynchronously updating the quote.
          const deletedNow = await E(timer).getCurrentTimestamp();
          await updateQuote(deletedNow);
        },
        async pushResult(result) {
          // Sample of NaN, 0, or negative numbers get culled in
          // the median calculation.
          pushResult(result);
        },
      });

      if (query === undefined || typeof oracleInstance === 'string') {
        // They don't want to be polled.
        return oracleAdmin;
      }

      // Obtain the oracle's publicFacet.
      assert(oracleInstance);
      const oracle = await E(zoe).getPublicFacet(oracleInstance);
      assert(records.has(record), X`Oracle record is already deleted`);

      let lastWakeTimestamp = 0n;

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
        await updateQuote(timestamp);
      };
      const now = await E(timer).getCurrentTimestamp();
      await record.querier(now);

      // Return the oracle admin object.
      return oracleAdmin;
    },
  });

  /** @type {PriceAggregatorPublicFacet} */
  const publicFacet = Far('publicFacet', {
    getPriceAuthority() {
      return priceAuthority;
    },
    async getRoundStartNotifier() {
      return undefined;
    },
    async getRoundCompleteNotifier() {
      return roundCompleteNotifier;
    },
  });

  return harden({ creatorFacet, publicFacet });
};

export { start };
