import { E } from '@endo/eventual-send';
import { Far } from '@endo/marshal';
import { Fail, assert } from '@agoric/assert';
import { AmountMath } from '@agoric/ertp';
import { makeNotifier } from '@agoric/notifier';

/**
 * @import {EOnly} from '@endo/eventual-send';
 * @import {PriceAuthority, PriceQuote, MutableQuote} from '@agoric/zoe';
 */

/**
 * @param {Brand<'set'>} quoteBrand
 * @param {Amount<'nat'>} amountIn
 * @param {Amount<'nat'>} amountOut
 * @param {ERef<import('@agoric/time').TimerService>} timer
 * @param {import('@agoric/time').Timestamp} timestamp
 * @param {ERef<Mint<'set'>>} quoteMint
 * @returns {Promise<PriceQuote>}
 */
export const mintQuote = async (
  quoteBrand,
  amountIn,
  amountOut,
  timer,
  timestamp,
  quoteMint,
) => {
  const quoteAmount = {
    brand: quoteBrand,
    value: [{ amountIn, amountOut, timer, timestamp }],
  };
  const quotePayment = await E(quoteMint).mintPayment({
    brand: quoteBrand,
    value: [quoteAmount],
  });
  return harden({ quoteAmount, quotePayment });
};

/**
 * @param {object} opts
 * @param {ERef<Mint<'set'>>} opts.quoteMint
 * @param {ERef<PriceAuthority>} opts.sourcePriceAuthority
 * @param {Brand<'nat'>} opts.sourceBrandIn
 * @param {Brand<'nat'>} opts.sourceBrandOut
 * @param {Brand<'nat'>} [opts.actualBrandIn]
 * @param {Brand<'nat'>} [opts.actualBrandOut]
 * @param {(amountIn: Amount<'nat'>) => Amount<'nat'>} [opts.makeSourceAmountIn]
 * @param {(amountOut: Amount<'nat'>) => Amount<'nat'>} [opts.makeSourceAmountOut]
 * @param {(sourceAmountIn: Amount<'nat'>) => Amount<'nat'>} [opts.transformSourceAmountIn]
 * @param {(sourceAmountOut: Amount<'nat'>) => Amount<'nat'>} [opts.transformSourceAmountOut]
 */
export const makePriceAuthorityTransform = async ({
  quoteMint,
  sourcePriceAuthority,
  sourceBrandIn,
  sourceBrandOut,
  actualBrandIn = sourceBrandIn,
  actualBrandOut = sourceBrandOut,
  makeSourceAmountIn = x => x,
  makeSourceAmountOut = x => x,
  transformSourceAmountIn = x => x,
  transformSourceAmountOut = x => x,
}) => {
  const quoteIssuer = E(quoteMint).getIssuer();
  const quoteBrand = await E(quoteIssuer).getBrand();

  /**
   * Ensure that the brandIn/brandOut pair is supported.
   *
   * @param {Brand} brandIn
   * @param {Brand} brandOut
   */
  const assertBrands = (brandIn, brandOut) => {
    brandIn === actualBrandIn ||
      Fail`Desired brandIn ${brandIn} must match ${actualBrandIn}`;
    brandOut === actualBrandOut ||
      Fail`Desired brandOut ${brandOut} must match ${actualBrandOut}`;
  };

  /**
   * @param {PriceQuote} sourceQuote
   * @returns {Promise<PriceQuote>}
   */
  const scaleQuote = async sourceQuote => {
    const { quotePayment: sourceQuotePayment } = sourceQuote;

    const sourceQuoteIssuer = E(sourcePriceAuthority).getQuoteIssuer(
      sourceBrandIn,
      sourceBrandOut,
    );

    const { value: sourceQuoteValue } =
      await E(sourceQuoteIssuer).getAmountOf(sourceQuotePayment);

    sourceQuoteValue.length === 1 ||
      Fail`sourceQuoteValue.length ${sourceQuoteValue.length} is not 1`;

    const {
      amountIn: sourceAmountIn,
      amountOut: sourceAmountOut,
      timer,
      timestamp,
    } = sourceQuoteValue[0];
    const amountIn = transformSourceAmountIn(sourceAmountIn);
    const amountOut = transformSourceAmountOut(sourceAmountOut);

    return mintQuote(
      quoteBrand,
      amountIn,
      amountOut,
      timer,
      timestamp,
      quoteMint,
    );
  };

  /**
   * Create a quoteWhen* function.
   *
   * @param {string} sourceMethod
   */
  const makeQuoteWhenOut = sourceMethod => {
    /**
     * Return a quote when sourceMethod fires.
     *
     * @param {Amount<'nat'>} amountIn the input value to the calcAmountTrigger
     * @param {Amount<'nat'>} amountOutLimit the value to compare with the output
     * of calcAmountTrigger
     */
    const quoteWhenOut = async (amountIn, amountOutLimit) => {
      AmountMath.coerce(actualBrandIn, amountIn);
      AmountMath.coerce(actualBrandOut, amountOutLimit);

      const sourceQuote = await E(sourcePriceAuthority)[sourceMethod](
        makeSourceAmountIn(amountIn),
        makeSourceAmountOut(amountOutLimit),
      );

      return scaleQuote(sourceQuote);
    };
    return quoteWhenOut;
  };

  /**
   * Create a mutableQuoteWhen* function.
   *
   * @param {string} sourceMethod
   */
  const makeMutableQuote = sourceMethod => {
    /**
     * @param {Amount<'nat'>} amountIn
     * @param {Amount<'nat'>} amountOutLimit
     */
    const mutableQuoteWhenOut = (amountIn, amountOutLimit) => {
      AmountMath.coerce(actualBrandIn, amountIn);
      AmountMath.coerce(actualBrandOut, amountOutLimit);

      /** @type {ERef<MutableQuote>} */
      const sourceMutableQuote = E(sourcePriceAuthority)[sourceMethod](
        makeSourceAmountIn(amountIn),
        makeSourceAmountOut(amountOutLimit),
      );

      /** @type {EOnly<MutableQuote>} */
      const mutableQuote = Far('MutableQuote', {
        cancel: e => E(sourceMutableQuote).cancel(e),
        updateLevel: (newAmountIn, newAmountOutLimit) => {
          AmountMath.coerce(actualBrandIn, newAmountIn);
          AmountMath.coerce(actualBrandOut, newAmountOutLimit);

          return E(sourceMutableQuote).updateLevel(
            makeSourceAmountIn(newAmountIn),
            makeSourceAmountOut(newAmountOutLimit),
          );
        },
        getPromise: () => E(sourceMutableQuote).getPromise().then(scaleQuote),
      });
      return mutableQuote;
    };
    return mutableQuoteWhenOut;
  };

  /** @type {PriceAuthority} */
  const priceAuthority = Far('PriceAuthority', {
    getQuoteIssuer(brandIn, brandOut) {
      assertBrands(brandIn, brandOut);
      return quoteIssuer;
    },
    getTimerService(brandIn, brandOut) {
      assertBrands(brandIn, brandOut);
      return E(sourcePriceAuthority).getTimerService(
        sourceBrandIn,
        sourceBrandOut,
      );
    },
    makeQuoteNotifier(amountIn, brandOut) {
      AmountMath.coerce(actualBrandIn, amountIn);
      assertBrands(amountIn.brand, brandOut);

      const notifier = E(sourcePriceAuthority).makeQuoteNotifier(
        makeSourceAmountIn(amountIn),
        sourceBrandOut,
      );

      // Wrap our underlying notifier with scaled quotes.
      const scaledBaseNotifier = harden({
        async getUpdateSince(updateCount = undefined) {
          // We use the same updateCount as our underlying notifier.
          const record = await E(notifier).getUpdateSince(updateCount);

          const quote = await scaleQuote(record.value);
          return harden({
            value: quote,
            updateCount: record.updateCount,
          });
        },
      });

      /** @type {Notifier<PriceQuote>} */
      const scaledNotifier = Far('QuoteNotifier', {
        ...makeNotifier(scaledBaseNotifier),
        // TODO stop exposing baseNotifier methods directly.
        ...scaledBaseNotifier,
      });
      return scaledNotifier;
    },
    async quoteGiven(amountIn, brandOut) {
      AmountMath.coerce(actualBrandIn, amountIn);
      assertBrands(amountIn.brand, brandOut);

      const sourceQuote = await E(sourcePriceAuthority).quoteGiven(
        makeSourceAmountIn(amountIn),
        sourceBrandOut,
      );
      return scaleQuote(sourceQuote);
    },
    async quoteWanted(brandIn, amountOut) {
      AmountMath.coerce(actualBrandOut, amountOut);
      assertBrands(brandIn, amountOut.brand);

      const sourceQuote = await E(sourcePriceAuthority).quoteWanted(
        sourceBrandIn,
        makeSourceAmountOut(amountOut),
      );
      return scaleQuote(sourceQuote);
    },
    async quoteAtTime(deadline, amountIn, brandOut) {
      assert.typeof(deadline, 'bigint');
      AmountMath.coerce(actualBrandIn, amountIn);
      assertBrands(amountIn.brand, brandOut);

      const sourceQuote = await E(sourcePriceAuthority).quoteAtTime(
        deadline,
        makeSourceAmountIn(amountIn),
        sourceBrandOut,
      );
      return scaleQuote(sourceQuote);
    },
    quoteWhenLT: makeQuoteWhenOut('quoteWhenLT'),
    quoteWhenLTE: makeQuoteWhenOut('quoteWhenLTE'),
    quoteWhenGTE: makeQuoteWhenOut('quoteWhenGTE'),
    quoteWhenGT: makeQuoteWhenOut('quoteWhenGT'),
    mutableQuoteWhenLT: makeMutableQuote('mutableQuoteWhenLT'),
    mutableQuoteWhenLTE: makeMutableQuote('mutableQuoteWhenLTE'),
    mutableQuoteWhenGT: makeMutableQuote('mutableQuoteWhenGT'),
    mutableQuoteWhenGTE: makeMutableQuote('mutableQuoteWhenGTE'),
  });

  return priceAuthority;
};
