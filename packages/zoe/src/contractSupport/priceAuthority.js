/* eslint @typescript-eslint/no-floating-promises: "warn" */
import { E } from '@endo/eventual-send';
import { Far } from '@endo/marshal';
import { makePromiseKit } from '@endo/promise-kit';
import { AmountMath, AmountShape, BrandShape } from '@agoric/ertp';
import { makeNotifier } from '@agoric/notifier';
import { makeTracer } from '@agoric/internal';
import { TimestampShape } from '@agoric/time';
import { M } from '@agoric/store';

/**
 * @import {MutableQuote, PriceAuthority, PriceQuote, PriceQuoteCreate, PriceQuoteTrigger, PriceAuthorityKit} from '@agoric/zoe';
 */

const { quote: q, Fail } = assert;

const trace = makeTracer('PA', false);

/**
 * @callback CompareAmount
 * @param {Amount} amount
 * @param {Amount} amountLimit
 * @returns {boolean}
 */

/** @type {CompareAmount} */
const isLT = (amount, amountLimit) => !AmountMath.isGTE(amount, amountLimit);

/** @type {CompareAmount} */
const isLTE = (amount, amountLimit) => AmountMath.isGTE(amountLimit, amount);

/** @type {CompareAmount} */
const isGTE = (amount, amountLimit) => AmountMath.isGTE(amount, amountLimit);

/** @type {CompareAmount} */
const isGT = (amount, amountLimit) => !AmountMath.isGTE(amountLimit, amount);

/**
 * @callback Trigger
 * @param {PriceQuoteCreate} createInstantQuote
 * @returns {Promise<void>}
 */

const GuardCallAmountTuple = M.call(AmountShape, AmountShape).returns(
  M.promise(),
);
export const PriceAuthorityI = M.interface('PriceAuthority', {
  getQuoteIssuer: M.call(BrandShape, BrandShape).returns(M.promise()),
  getTimerService: M.call(BrandShape, BrandShape).returns(M.promise()),
  quoteGiven: M.call(AmountShape, BrandShape).returns(M.promise()),
  quoteWanted: M.call(BrandShape, AmountShape).returns(M.promise()),
  makeQuoteNotifier: M.call(AmountShape, BrandShape).returns(M.promise()),
  quoteAtTime: M.call(TimestampShape, AmountShape, BrandShape).returns(
    M.promise(),
  ),
  quoteWhenLT: GuardCallAmountTuple,
  quoteWhenLTE: GuardCallAmountTuple,
  quoteWhenGTE: GuardCallAmountTuple,
  quoteWhenGT: GuardCallAmountTuple,
  mutableQuoteWhenLT: GuardCallAmountTuple,
  mutableQuoteWhenLTE: GuardCallAmountTuple,
  mutableQuoteWhenGTE: GuardCallAmountTuple,
  mutableQuoteWhenGT: GuardCallAmountTuple,
});

/**
 * @param {object} opts
 * @param {Issuer<'set'>} opts.quoteIssuer
 * @param {ERef<Notifier<unknown>>} opts.notifier
 * @param {ERef<import('@agoric/time').TimerService>} opts.timer
 * @param {PriceQuoteCreate} opts.createQuote
 * @param {Brand<'nat'>} opts.actualBrandIn
 * @param {Brand<'nat'>} opts.actualBrandOut
 * @returns {PriceAuthorityKit}
 */
export const makeOnewayPriceAuthorityKit = opts => {
  const {
    timer,
    createQuote,
    actualBrandIn,
    actualBrandOut,
    quoteIssuer,
    notifier,
  } = opts;

  let haveFirstQuote = false;

  void E(notifier)
    .getUpdateSince()
    .then(_ => (haveFirstQuote = true));

  /** @type {Set<Trigger>} */
  const triggers = new Set();
  const mutableTriggers = new Map();

  /**
   * @param {PriceQuoteCreate} triggerCreateQuote
   * @returns {Promise<void>}
   */
  const fireTriggers = async triggerCreateQuote => {
    if (!haveFirstQuote) {
      return;
    }
    await Promise.all(
      [...triggers, ...Array.from(mutableTriggers.values())].map(trigger =>
        trigger(triggerCreateQuote),
      ),
    );
  };

  /**
   * Create a quoteWhen* function.
   *
   * @param {CompareAmount} compareAmountsFn
   */
  const makeQuoteWhenOut =
    compareAmountsFn =>
    /**
     * Return a quote when triggerWhen is true of the arguments.
     *
     * @param {Amount<'nat'>} amountIn the input value to the calcAmountTrigger
     * @param {Amount} amountOutLimit the value to compare with the output
     * of calcAmountTrigger
     */
    async (amountIn, amountOutLimit) => {
      amountIn = AmountMath.coerce(actualBrandIn, amountIn);
      amountOutLimit = AmountMath.coerce(actualBrandOut, amountOutLimit);

      /** @type {PromiseRecord<PriceQuote>} */
      const triggerPK = makePromiseKit();

      /** @type {PriceQuoteTrigger} */
      const trigger = async createInstantQuote => {
        try {
          const quoteP = createInstantQuote(calcAmountOut => {
            if (!triggers.has(trigger)) {
              // Already fired.
              return undefined;
            }
            const amountOut = calcAmountOut(amountIn);

            if (!compareAmountsFn(amountOut, amountOutLimit)) {
              // Don't fire the trigger yet.
              return undefined;
            }

            // Generate the quote.
            return { amountIn, amountOut };
          });

          if (!quoteP) {
            // We shouldn't resolve yet.
            return;
          }

          triggers.delete(trigger);
          triggerPK.resolve(quoteP);
        } catch (e) {
          // Trigger failed, so reject and drop.
          triggerPK.reject(e);
          triggers.delete(trigger);
        }
      };

      triggers.add(trigger);

      // Fire now, just in case.
      await trigger(createQuote);

      return triggerPK.promise;
    };

  /**
   * Create a mutableQuoteWhen* function.
   *
   * @param {CompareAmount} compareAmountsFn
   */
  const makeMutableQuote =
    compareAmountsFn =>
    /**
     * @param {Amount<'nat'>} amountIn
     * @param {Amount<'nat'>} amountOutLimit
     */
    async (amountIn, amountOutLimit) => {
      AmountMath.coerce(actualBrandIn, amountIn);
      AmountMath.coerce(actualBrandOut, amountOutLimit);

      /** @type {PromiseRecord<PriceQuote>} */
      const triggerPK = makePromiseKit();

      /** @type {MutableQuote} */
      const mutableQuote = Far('MutableQuote', {
        cancel: e => triggerPK.reject(e),
        updateLevel: (newAmountIn, newAmountOutLimit) => {
          const coercedAmountIn = AmountMath.coerce(actualBrandIn, newAmountIn);
          const coercedAmountOutLimit = AmountMath.coerce(
            actualBrandOut,
            newAmountOutLimit,
          );
          amountIn = coercedAmountIn;
          amountOutLimit = coercedAmountOutLimit;
          fireTriggers(createQuote);
        },
        getPromise: () => triggerPK.promise,
      });

      /** @type {PriceQuoteTrigger} */
      const mutableTrigger = async createInstantQuote => {
        try {
          const quoteP = createInstantQuote(calcAmountOut => {
            if (!mutableTriggers.has(mutableQuote)) {
              // Already fired.
              return undefined;
            }
            const amountOut = calcAmountOut(amountIn);

            if (!compareAmountsFn(amountOut, amountOutLimit)) {
              // Don't fire the mutableTrigger yet.
              return undefined;
            }

            // Generate the quote.
            return { amountIn, amountOut };
          });

          if (!quoteP) {
            // We shouldn't resolve yet.
            return;
          }

          mutableTriggers.delete(mutableQuote);
          triggerPK.resolve(quoteP);
        } catch (e) {
          // Trigger failed, so reject and drop.
          triggerPK.reject(e);
          mutableTriggers.delete(mutableQuote);
        }
      };

      mutableTriggers.set(mutableQuote, mutableTrigger);

      // Fire now, just in case.
      await mutableTrigger(createQuote);

      return mutableQuote;
    };

  /**
   * Ensure that the brandIn/brandOut pair is supported.
   *
   * @param {Brand} brandIn
   * @param {Brand} brandOut
   */
  const assertBrands = (brandIn, brandOut) => {
    brandIn === actualBrandIn ||
      Fail`Desired brandIn ${q(brandIn)} must match ${q(actualBrandIn)}`;
    brandOut === actualBrandOut ||
      Fail`Desired brandOut ${q(brandOut)} must match ${q(actualBrandOut)}`;
  };

  /** @type {PriceAuthority} */
  const priceAuthority = Far('PriceAuthority', {
    getQuoteIssuer(brandIn, brandOut) {
      assertBrands(brandIn, brandOut);
      return quoteIssuer;
    },
    getTimerService(brandIn, brandOut) {
      assertBrands(brandIn, brandOut);
      return timer;
    },
    makeQuoteNotifier(amountIn, brandOut) {
      AmountMath.coerce(actualBrandIn, amountIn);
      assertBrands(amountIn.brand, brandOut);

      // Wrap our underlying notifier with specific quotes.
      const specificBaseNotifier = harden({
        async getUpdateSince(updateCount = undefined) {
          // We use the same updateCount as our underlying notifier.
          const record = await E(notifier).getUpdateSince(updateCount);

          // We create a quote inline.
          let quote;
          // createQuote can throw if priceAuthority is replaced.

          try {
            quote = createQuote(calcAmountOut => ({
              amountIn,
              amountOut: calcAmountOut(amountIn),
            }));
          } catch (e) {
            // fall through
          }

          if (!quote) {
            throw Fail`createQuote returned nothing`;
          }

          const value = await quote;
          return harden({
            value,
            updateCount: record.updateCount,
          });
        },
      });

      /** @type {Notifier<PriceQuote>} */
      const specificNotifier = Far('QuoteNotifier', {
        ...makeNotifier(specificBaseNotifier),
        // TODO stop exposing baseNotifier methods directly.
        ...specificBaseNotifier,
      });
      return specificNotifier;
    },
    async quoteGiven(amountIn, brandOut) {
      trace('quoteGiven', amountIn, brandOut);
      AmountMath.coerce(actualBrandIn, amountIn);
      assertBrands(amountIn.brand, brandOut);

      await E(notifier).getUpdateSince();
      const quote = createQuote(calcAmountOut => ({
        amountIn,
        amountOut: calcAmountOut(amountIn),
      }));
      assert(quote);
      return quote;
    },
    async quoteWanted(brandIn, amountOut) {
      AmountMath.coerce(actualBrandOut, amountOut);
      assertBrands(brandIn, amountOut.brand);

      await E(notifier).getUpdateSince();
      const quote = createQuote((calcAmountOut, calcAmountIn) => {
        // We need to determine an amountIn that guarantees at least the amountOut.
        const amountIn = calcAmountIn(amountOut);
        const actualAmountOut = calcAmountOut(amountIn);
        AmountMath.isGTE(actualAmountOut, amountOut) ||
          Fail`Calculation of ${actualAmountOut} didn't cover expected ${amountOut}`;
        return { amountIn, amountOut };
      });
      assert(quote);
      return quote;
    },
    async quoteAtTime(deadline, amountIn, brandOut) {
      AmountMath.coerce(actualBrandIn, amountIn);
      assertBrands(amountIn.brand, brandOut);

      await E(notifier).getUpdateSince();
      const quotePK = makePromiseKit();
      await E(timer).setWakeup(
        deadline,
        Far('wakeObj', {
          async wake(timestamp) {
            await null;
            try {
              const quoteP = createQuote(calcAmountOut => ({
                amountIn,
                amountOut: calcAmountOut(amountIn),
                timestamp,
              }));

              // We don't wait for the quote to be authenticated; resolve
              // immediately.
              quotePK.resolve(quoteP);
              await quotePK.promise;
            } catch (e) {
              quotePK.reject(e);
            }
          },
        }),
      );

      // Wait until the wakeup passes.
      return quotePK.promise;
    },
    quoteWhenLT: makeQuoteWhenOut(isLT),
    quoteWhenLTE: makeQuoteWhenOut(isLTE),
    quoteWhenGTE: makeQuoteWhenOut(isGTE),
    quoteWhenGT: makeQuoteWhenOut(isGT),
    mutableQuoteWhenLT: makeMutableQuote(isLT),
    mutableQuoteWhenLTE: makeMutableQuote(isLTE),
    mutableQuoteWhenGT: makeMutableQuote(isGT),
    mutableQuoteWhenGTE: makeMutableQuote(isGTE),
  });

  return { priceAuthority, adminFacet: { fireTriggers } };
};
