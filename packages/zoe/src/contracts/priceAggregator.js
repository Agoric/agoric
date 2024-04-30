/* eslint @typescript-eslint/no-floating-promises: "warn" */
import { Fail, q } from '@agoric/assert';
import { AmountMath, AssetKind, makeIssuerKit } from '@agoric/ertp';
import { assertAllDefined } from '@agoric/internal';
import {
  makeNotifierKit,
  makeStoredPublishKit,
  observeNotifier,
} from '@agoric/notifier';
import { makeLegacyMap } from '@agoric/store';
import { TimeMath } from '@agoric/time';
import { E } from '@endo/eventual-send';
import { Far } from '@endo/marshal';
import { notForProductionUse } from '@agoric/internal/src/magic-cookie-test-only.js';

import {
  calculateMedian,
  makeOnewayPriceAuthorityKit,
} from '../contractSupport/index.js';
import {
  addRatios,
  assertParsableNumber,
  ceilDivideBy,
  floorMultiplyBy,
  makeRatio,
  makeRatioFromAmounts,
  multiplyRatios,
  parseRatio,
  ratioGTE,
  ratiosSame,
} from '../contractSupport/ratio.js';

/**
 * @import {LegacyMap} from '@agoric/store/exported.js'
 * @import {PriceQuote, PriceDescription, PriceQuoteValue, PriceQuery} from '../../tools/types.js';
 */
/** @typedef {bigint | number | string} ParsableNumber */
/**
 * @typedef {Readonly<ParsableNumber | { data: ParsableNumber }>} OraclePriceSubmission
 */

/** @typedef {ParsableNumber | Ratio} Price */

/** @type {(quote: PriceQuote) => PriceDescription} */
const priceDescriptionFromQuote = quote => quote.quoteAmount.value[0];

/**
 * @deprecated use fluxAggregator
 *
 * This contract aggregates price values from a set of oracles and provides a
 * PriceAuthority for their median. This naive method is game-able and so this module
 * is a stub until we complete what is now in `fluxAggregatorKit.js`.
 *
 * @param {ZCF<{
 * timer: import('@agoric/time').TimerService,
 * POLL_INTERVAL: bigint,
 * brandIn: Brand<'nat'>,
 * brandOut: Brand<'nat'>,
 * unitAmountIn: Amount<'nat'>,
 * }>} zcf
 * @param {{
 * marshaller: Marshaller,
 * quoteMint?: ERef<Mint<'set'>>,
 * storageNode: ERef<StorageNode>,
 * }} privateArgs
 */
const start = async (zcf, privateArgs) => {
  notForProductionUse();

  // brands come from named terms instead of `brands` key because the latter is
  // a StandardTerm that Zoe creates from the `issuerKeywordRecord` argument and
  // Oracle brands are inert (without issuers or mints).
  const { timer, POLL_INTERVAL, brandIn, brandOut, unitAmountIn } =
    zcf.getTerms();
  assertAllDefined({ brandIn, brandOut, POLL_INTERVAL, timer, unitAmountIn });

  assert(privateArgs, 'Missing privateArgs in priceAggregator start');
  const { marshaller, storageNode } = privateArgs;
  assertAllDefined({ marshaller, storageNode });

  const quoteMint =
    privateArgs.quoteMint ||
    // makeIssuerKit fails upgrade, this contract is for demo only
    makeIssuerKit('quote', AssetKind.SET).mint;
  /** @type {IssuerRecord<'set'>} */
  // xxx saveIssuer not generic
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
    /** @type {Amount<'set'>} */
    // xxx type should be inferred from brand and value
    const quoteAmount = AmountMath.make(quoteKit.brand, harden(quote));
    const quotePayment = await E(quoteKit.mint).mintPayment(quoteAmount);
    return harden({ quoteAmount, quotePayment });
  };

  // To notify the price authority of a new median
  const { notifier: medianNotifier, updater: medianUpdater } =
    makeNotifierKit();

  // For diagnostics
  const { notifier: roundCompleteNotifier, updater: roundCompleteUpdater } =
    makeNotifierKit();

  // For publishing priceAuthority values to off-chain storage
  const { publisher, subscriber } = makeStoredPublishKit(
    storageNode,
    marshaller,
  );

  const zoe = zcf.getZoeService();

  /**
   * @typedef {object} OracleRecord
   * @property {(timestamp: import('@agoric/time').Timestamp) => Promise<void>} [querier]
   * @property {Ratio} lastSample
   * @property {OracleKey} oracleKey
   */

  /** @type {Set<OracleRecord>} */
  const oracleRecords = new Set();

  /** @type {LegacyMap<OracleKey, Set<OracleRecord>>} */
  // Legacy because we're storing a raw JS Set
  const instanceToRecords = makeLegacyMap('oracleInstance');

  let publishedTimestamp = await E(timer).getCurrentTimestamp();
  const { timerBrand } = publishedTimestamp;

  // Wake every POLL_INTERVAL and run the queriers.
  const repeaterP = E(timer).makeRepeater(0n, POLL_INTERVAL);
  /** @type {import('@agoric/time').TimerWaker} */
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
   * @param {import('@agoric/time').TimestampRecord} [param0.timestamp]
   */
  const makeCreateQuote = ({ overridePrice, timestamp } = {}) =>
    /**
     * @param {PriceQuery} priceQuery
     * @returns {ERef<PriceQuote> | undefined}
     */
    function createQuote(priceQuery) {
      // Use the current price.
      const price = overridePrice || lastPrice;
      if (price === undefined) {
        // We don't have a quote, so abort.
        return undefined;
      }

      /**
       * @param {Amount<'nat'>} amountIn the given amountIn
       * @returns {Amount<'nat'>} the amountOut that will be received
       */
      const calcAmountOut = amountIn => {
        return floorMultiplyBy(amountIn, price);
      };

      /**
       * @param {Amount<'nat'>} amountOut the wanted amountOut
       * @returns {Amount<'nat'>} the amountIn needed to give
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
      notifier: medianNotifier,
      quoteIssuer: quoteKit.issuer,
      timer,
      actualBrandIn: brandIn,
      actualBrandOut: brandOut,
    });

  // for each new quote from the priceAuthority, publish it to off-chain storage
  observeNotifier(priceAuthority.makeQuoteNotifier(unitAmountIn, brandOut), {
    updateState: quote => {
      publisher.publish(priceDescriptionFromQuote(quote));
    },
    fail: reason => {
      throw Error(`priceAuthority observer failed: ${reason}`);
    },
    finish: done => {
      throw Error(`priceAuthority observer died: ${done}`);
    },
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
   * @param {import('@agoric/time').Timestamp} timestamp
   */
  const updateQuote = async timestamp => {
    timestamp = TimeMath.coerceTimestampRecord(timestamp, timerBrand);

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

    // If a more recent timestamp has already been published, we are too late.
    if (TimeMath.compareAbs(timestamp, publishedTimestamp) < 0) {
      return;
    }

    if (lastPrice && ratiosSame(lastPrice, median)) {
      // No change in the median so don't publish
      return;
    }

    // Publish a new authenticated quote.
    publishedTimestamp = TimeMath.coerceTimestampRecord(timestamp, timerBrand);
    lastPrice = median;
    medianUpdater.updateState(authenticatedQuote);
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
  /**
   *
   * @param {ParsableNumber} numericData
   * @returns {Ratio}
   */
  const makeRatioFromData = numericData => {
    const unscaled = parseRatio(numericData, brandOut, brandIn);
    return multiplyRatios(unscaled, unitPriceScale);
  };

  /**
   *
   * @param {Notifier<OraclePriceSubmission>} oracleNotifier
   * @param {number} scaleValueOut
   * @param {(result: Ratio) => Promise<void>} pushResult
   */
  const pushFromOracle = (oracleNotifier, scaleValueOut, pushResult) => {
    // Support for notifiers that don't produce ratios, but need scaling for
    // their numeric data.
    const priceScale = parseRatio(scaleValueOut, brandOut);
    /** @param {ParsableNumber} numericData */
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
      /** @type {Ratio | undefined} */
      let result;
      switch (typeof value) {
        case 'number':
        case 'bigint':
        case 'string': {
          result = makeScaledRatioFromData(value);
          break;
        }
        case 'undefined': {
          throw Fail`undefined value in OraclePriceSubmission`;
        }
        case 'object': {
          if ('data' in value) {
            result = makeScaledRatioFromData(value.data);
            break;
          }
          if ('numerator' in value) {
            // ratio
            result = value;
            break;
          }
          throw Fail`unknown value object`;
        }
        default: {
          throw Fail`unknown value type ${q(typeof value)}`;
        }
      }

      pushResult(result).catch(console.error);
    };

    // Start the notifier.
    E(oracleNotifier).getUpdateSince().then(recurse);
  };

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
       * @returns {Promise<{admin: OracleAdmin<Price>, invitationMakers: {PushPrice: (price: ParsableNumber) => Promise<Invitation<void>>} }>}
       */
      const offerHandler = async (
        seat,
        { notifier: oracleNotifier, scaleValueOut = 1 } = {},
      ) => {
        seat.exit();
        const admin = await creatorFacet.initOracle(oracleKey);
        const invitationMakers = Far('invitation makers', {
          /** @param {ParsableNumber} price */
          PushPrice(price) {
            assertParsableNumber(price);
            return zcf.makeInvitation(cSeat => {
              cSeat.exit();
              admin.pushResult(price);
            }, 'PushPrice');
          },
        });

        if (oracleNotifier) {
          pushFromOracle(oracleNotifier, scaleValueOut, r =>
            admin.pushResult(r),
          );
        }

        return harden({
          admin: Far('oracleAdmin', {
            ...admin,
            /** @override */
            delete: async () => {
              // Stop tracking the notifier on delete.
              oracleNotifier = undefined;
              return admin.delete();
            },
          }),

          invitationMakers,
        });
      };

      return zcf.makeInvitation(offerHandler, 'oracle invitation');
    },
    /** @param {OracleKey} oracleKey */
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
    /**
     * @param {Instance | string} [oracleInstance]
     * @param {OracleQuery} [query]
     * @returns {Promise<OracleAdmin<Price>>}
     */
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

      /**
       * Push the current price ratio.
       *
       * @param {ParsableNumber | Ratio} result
       */
      const pushResult = result => {
        // Sample of NaN, 0, or negative numbers get culled in the median
        // calculation.
        /** @type {Ratio | undefined} */
        let ratio;
        if (typeof result === 'object') {
          ratio = makeRatioFromAmounts(result.numerator, result.denominator);
          AmountMath.coerce(brandOut, ratio.numerator);
          AmountMath.coerce(brandIn, ratio.denominator);
        } else {
          ratio = makeRatioFromData(result);
        }
        record.lastSample = ratio;
      };

      /** @type {OracleAdmin<Price>} */
      const oracleAdmin = Far('OracleAdmin', {
        async delete() {
          assert(records.has(record), 'Oracle record is already deleted');

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
      /** @type {import('./oracle.js').OracleContract['publicFacet']} */
      const oracle = await E(zoe).getPublicFacet(oracleInstance);
      assert(records.has(record), 'Oracle record is already deleted');

      /** @type {import('@agoric/time').Timestamp} */
      let lastWakeTimestamp = 0n;

      /**
       * @param {import('@agoric/time').Timestamp} timestamp
       */
      record.querier = async timestamp => {
        // Submit the query.
        const result = await E(oracle).query(query);
        assertParsableNumber(result);
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

  const publicFacet = Far('publicFacet', {
    getPriceAuthority() {
      return priceAuthority;
    },
    getSubscriber: () => subscriber,
    /** Diagnostic tool */
    async getRoundCompleteNotifier() {
      return roundCompleteNotifier;
    },
  });

  return harden({ creatorFacet, publicFacet });
};

export { start };
/** @typedef {ContractOf<typeof start>} PriceAggregatorContract */
