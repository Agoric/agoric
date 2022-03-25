// @ts-check
import { makeIssuerKit, AssetKind, AmountMath } from '@agoric/ertp';
import { makePromiseKit } from '@endo/promise-kit';
import {
  makeNotifierKit,
  makeNotifierFromAsyncIterable,
} from '@agoric/notifier';
import { E } from '@endo/eventual-send';
import { assert, details as X } from '@agoric/assert';
import { Far } from '@endo/marshal';

import { natSafeMath } from '../src/contractSupport/index.js';

import './types.js';
import '../exported.js';

/**
 * @typedef {Object} FakePriceAuthorityOptions
 * @property {Brand} actualBrandIn
 * @property {Brand} actualBrandOut
 * @property {number[]} [priceList]
 * @property {[number, number][]} [tradeList]
 * @property {ERef<TimerService>} timer
 * @property {RelativeTime} [quoteInterval]
 * @property {ERef<Mint>} [quoteMint]
 * @property {Amount} [unitAmountIn]
 */

/**
 * TODO: multiple price Schedules for different goods, or for moving the price
 * in different directions?
 *
 * @param {FakePriceAuthorityOptions} options
 * @returns {Promise<PriceAuthority>}
 */
export async function makeFakePriceAuthority(options) {
  const {
    actualBrandIn,
    actualBrandOut,
    priceList,
    tradeList,
    timer,
    unitAmountIn = AmountMath.make(actualBrandIn, 1n),
    quoteInterval = 1n,
    quoteMint = makeIssuerKit('quote', AssetKind.SET).mint,
  } = options;

  assert(
    tradeList || priceList,
    X`One of priceList or tradeList must be specified`,
  );

  const unitValueIn = AmountMath.getValue(actualBrandIn, unitAmountIn);

  const comparisonQueue = [];

  let currentPriceIndex = 0;

  function currentTrade() {
    if (tradeList) {
      return tradeList[currentPriceIndex % tradeList.length];
    }
    assert(priceList);
    return [unitValueIn, priceList[currentPriceIndex % priceList.length]];
  }

  /**
   * @param {Brand} allegedBrandIn
   * @param {Brand} allegedBrandOut
   */
  const assertBrands = (allegedBrandIn, allegedBrandOut) => {
    assert.equal(
      allegedBrandIn,
      actualBrandIn,
      X`${allegedBrandIn} is not an expected input brand`,
    );
    assert.equal(
      allegedBrandOut,
      actualBrandOut,
      X`${allegedBrandOut} is not an expected output brand`,
    );
  };

  const quoteIssuer = E(quoteMint).getIssuer();
  const quoteBrand = await E(quoteIssuer).getBrand();

  /**
   * @type {NotifierRecord<Timestamp>} We Need to have a notifier driven by the
   *   TimerService because if the timer pushes updates to individual
   *   QuoteNotifiers, we have a dependency inversion and the timer can never
   *   know when the QuoteNotifier goes away. (Don't even mention WeakRefs...
   *   they're not exposed to userspace under Swingset because they're nondeterministic.)
   *
   *   TODO It would be desirable to add a timestamp notifier interface to the
   *   TimerService https://github.com/Agoric/agoric-sdk/issues/2002
   *
   *   Caveat: even if we had a timestamp notifier, we can't use it for triggers
   *   yet unless we rewrite our manualTimer tests not to depend on when exactly
   *   a trigger has been fired for a given tick.
   */
  const { notifier: ticker, updater: tickUpdater } = makeNotifierKit();

  /**
   * @param {Amount} amountIn
   * @param {Brand} brandOut
   * @param {Timestamp} quoteTime
   * @returns {PriceQuote}
   */
  function priceInQuote(amountIn, brandOut, quoteTime) {
    assertBrands(amountIn.brand, brandOut);
    AmountMath.coerce(actualBrandIn, amountIn);
    const [tradeValueIn, tradeValueOut] = currentTrade();
    const valueOut = natSafeMath.floorDivide(
      natSafeMath.multiply(amountIn.value, tradeValueOut),
      tradeValueIn,
    );
    const quoteAmount = AmountMath.make(
      quoteBrand,
      harden([
        {
          amountIn,
          amountOut: AmountMath.make(actualBrandOut, valueOut),
          timer,
          timestamp: quoteTime,
        },
      ]),
    );
    const quote = harden({
      quotePayment: E(quoteMint).mintPayment(quoteAmount),
      quoteAmount,
    });
    return quote;
  }

  /**
   * @param {Brand} brandIn
   * @param {Amount} amountOut
   * @param {Timestamp} quoteTime
   * @returns {PriceQuote}
   */
  function priceOutQuote(brandIn, amountOut, quoteTime) {
    assertBrands(brandIn, amountOut.brand);
    const valueOut = AmountMath.getValue(actualBrandOut, amountOut);
    const [tradeValueIn, tradeValueOut] = currentTrade();
    const valueIn = natSafeMath.ceilDivide(
      natSafeMath.multiply(valueOut, tradeValueIn),
      tradeValueOut,
    );
    return priceInQuote(
      AmountMath.make(brandIn, valueIn),
      amountOut.brand,
      quoteTime,
    );
  }

  // Keep track of the time of the latest price change.
  let latestTick;

  // Check if a comparison request has been satisfied.
  // Returns true if it has, false otherwise.
  function checkComparisonRequest(req) {
    if (latestTick === undefined) {
      // We haven't got any quotes.
      return false;
    }
    const priceQuote = priceInQuote(req.amountIn, req.brandOut, latestTick);
    const { amountOut: quotedOut } = priceQuote.quoteAmount.value[0];
    if (!req.operator(quotedOut)) {
      return false;
    }
    req.resolve(priceQuote);
    const reqIndex = comparisonQueue.indexOf(req);
    if (reqIndex >= 0) {
      comparisonQueue.splice(reqIndex, 1);
    }
    return true;
  }

  async function startTicker() {
    let firstTime = true;
    const handler = Far('wake handler', {
      wake: async t => {
        if (firstTime) {
          firstTime = false;
        } else {
          currentPriceIndex += 1;
        }
        latestTick = t;
        tickUpdater.updateState(t);
        for (const req of comparisonQueue) {
          checkComparisonRequest(req);
        }
      },
    });
    const repeater = E(timer).makeRepeater(0n, quoteInterval);
    return E(repeater).schedule(handler);
  }

  let tickListLength = 0;
  if (tradeList) {
    tickListLength = tradeList.length;
  } else if (priceList) {
    tickListLength = priceList.length;
  }

  if (tickListLength > 1) {
    // Only start the ticker if we have actual price changes.
    await startTicker();
  } else if (tickListLength === 1) {
    // Constant price, so schedule it.
    const timestamp = await E(timer).getCurrentTimestamp();
    tickUpdater.updateState(timestamp);
    latestTick = timestamp;
  }

  function resolveQuoteWhen(operator, amountIn, amountOutLimit) {
    assertBrands(amountIn.brand, amountOutLimit.brand);
    const promiseKit = makePromiseKit();
    const req = {
      operator,
      amountIn,
      brandOut: amountOutLimit.brand,
      resolve: promiseKit.resolve,
    };
    if (!checkComparisonRequest(req)) {
      comparisonQueue.push(req);
    }
    return promiseKit.promise;
  }

  async function* generateQuotes(amountIn, brandOut) {
    let record = await ticker.getUpdateSince();
    while (record.updateCount) {
      // eslint-disable-next-line no-await-in-loop
      const { value: timestamp } = record; // = await E(timer).getCurrentTimestamp();
      yield priceInQuote(amountIn, brandOut, timestamp);
      // eslint-disable-next-line no-await-in-loop
      record = await ticker.getUpdateSince(record.updateCount);
    }
  }

  /** @type {PriceAuthority} */
  const priceAuthority = Far('fake price authority', {
    getQuoteIssuer: (brandIn, brandOut) => {
      assertBrands(brandIn, brandOut);
      return quoteIssuer;
    },
    getTimerService: (brandIn, brandOut) => {
      assertBrands(brandIn, brandOut);
      return timer;
    },
    makeQuoteNotifier: async (amountIn, brandOut) => {
      assertBrands(amountIn.brand, brandOut);
      return makeNotifierFromAsyncIterable(generateQuotes(amountIn, brandOut));
    },
    quoteAtTime: (timeStamp, amountIn, brandOut) => {
      assert.typeof(timeStamp, 'bigint');
      assertBrands(amountIn.brand, brandOut);
      const { promise, resolve } = makePromiseKit();
      E(timer).setWakeup(
        timeStamp,
        Far('wake handler', {
          wake: time => {
            return resolve(priceInQuote(amountIn, brandOut, time));
          },
        }),
      );
      return promise;
    },
    quoteGiven: async (amountIn, brandOut) => {
      assertBrands(amountIn.brand, brandOut);
      const timestamp = await E(timer).getCurrentTimestamp();
      return priceInQuote(amountIn, brandOut, timestamp);
    },
    quoteWanted: async (brandIn, amountOut) => {
      assertBrands(brandIn, amountOut.brand);
      const timestamp = await E(timer).getCurrentTimestamp();
      return priceOutQuote(brandIn, amountOut, timestamp);
    },
    quoteWhenGTE: (amountIn, amountOutLimit) => {
      const compareGTE = amount => AmountMath.isGTE(amount, amountOutLimit);
      return resolveQuoteWhen(compareGTE, amountIn, amountOutLimit);
    },
    quoteWhenGT: (amountIn, amountOutLimit) => {
      const compareGT = amount => !AmountMath.isGTE(amountOutLimit, amount);
      return resolveQuoteWhen(compareGT, amountIn, amountOutLimit);
    },
    quoteWhenLTE: (amountIn, amountOutLimit) => {
      const compareLTE = amount => AmountMath.isGTE(amountOutLimit, amount);
      return resolveQuoteWhen(compareLTE, amountIn, amountOutLimit);
    },
    quoteWhenLT: (amountIn, amountOutLimit) => {
      const compareLT = amount => !AmountMath.isGTE(amount, amountOutLimit);
      return resolveQuoteWhen(compareLT, amountIn, amountOutLimit);
    },
    mutableQuoteWhenLT: () => {
      throw Error('use ScriptedPriceAuthority');
    },
    mutableQuoteWhenLTE: () => {
      throw Error('use ScriptedPriceAuthority');
    },
    mutableQuoteWhenGT: () => {
      throw Error('use ScriptedPriceAuthority');
    },
    mutableQuoteWhenGTE: () => {
      throw Error('use ScriptedPriceAuthority');
    },
  });
  return priceAuthority;
}
