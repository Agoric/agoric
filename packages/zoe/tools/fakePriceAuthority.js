import { makeIssuerKit, AssetKind, AmountMath } from '@agoric/ertp';
import { makePromiseKit } from '@endo/promise-kit';
import {
  makeNotifierKit,
  makeNotifierFromAsyncIterable,
} from '@agoric/notifier';
import { E } from '@endo/eventual-send';
import { Far } from '@endo/marshal';
import { TimeMath } from '@agoric/time';

import { natSafeMath } from '../src/contractSupport/index.js';

/**
 * @import {PriceAuthority, PriceQuote, PriceDescription, PriceQuoteValue, PriceQuery} from './types.js';
 */

const { Fail } = assert;
const { coerceRelativeTimeRecord } = TimeMath;

// 'if (a >= b)' becomes 'if (timestampGTE(a,b))'
const timestampGTE = (a, b) => TimeMath.compareAbs(a, b) >= 0;
// 'if (a <= b)' becomes 'if (timestampLTE(a,b))'
const timestampLTE = (a, b) => TimeMath.compareAbs(a, b) <= 0;

/**
 * @typedef {object} FakePriceAuthorityOptions
 * @property {Brand<'nat'>} actualBrandIn
 * @property {Brand<'nat'>} actualBrandOut
 * @property {Array<number>} [priceList]
 * @property {Array<[number, number]>} [tradeList]
 * @property {ERef<import('@agoric/time').TimerService>} timer
 * @property {import('@agoric/time').RelativeTime} [quoteInterval]
 * @property {ERef<Mint<'set'>>} [quoteMint]
 * @property {Amount<'nat'>} [unitAmountIn]
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

  tradeList ||
    priceList ||
    Fail`One of priceList or tradeList must be specified`;

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
    allegedBrandIn === actualBrandIn ||
      Fail`${allegedBrandIn} is not an expected input brand`;
    allegedBrandOut === actualBrandOut ||
      Fail`${allegedBrandOut} is not an expected output brand`;
  };

  const quoteIssuer = E(quoteMint).getIssuer();
  const quoteBrand = await E(quoteIssuer).getBrand();

  /**
   * @type {NotifierRecord<import('@agoric/time').Timestamp>}
   * We need to have a notifier driven by the
   * TimerService because if the timer pushes updates to individual
   * QuoteNotifiers, we have a dependency inversion and the timer can never know
   * when the QuoteNotifier goes away.  (Don't even mention WeakRefs... they're
   * not exposed to userspace under Swingset because they're nondeterministic.)
   *
   * TODO It would be desirable to add a timestamp notifier interface to the
   * TimerService https://github.com/Agoric/agoric-sdk/issues/2002
   *
   * Caveat: even if we had a timestamp notifier, we can't use it for triggers
   * yet unless we rewrite our manualTimer tests not to depend on when exactly a
   * trigger has been fired for a given tick.
   */
  const { notifier: ticker, updater: tickUpdater } = makeNotifierKit();

  /**
   *
   * @param {Amount<'nat'>} amountIn
   * @param {Brand} brandOut
   * @param {import('@agoric/time').Timestamp} quoteTime
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
   * @param {Brand<'nat'>} brandIn
   * @param {Amount<'nat'>} amountOut
   * @param {import('@agoric/time').Timestamp} quoteTime
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

  // clients who are waiting for a specific timestamp
  /** @type { [when: import('@agoric/time').Timestamp, resolve: (quote: PriceQuote) => void][] } */
  let timeClients = [];

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
        if (t === 0n) {
          // just in case makeRepeater() was called with delay=0,
          // which schedules an immediate wakeup
          return;
        }
        if (firstTime) {
          firstTime = false;
        } else {
          currentPriceIndex += 1;
        }
        latestTick = t;
        tickUpdater.updateState(t);
        const remainingTimeClients = [];
        for (const entry of timeClients) {
          const [when, resolve] = entry;
          if (timestampGTE(latestTick, when)) {
            resolve(latestTick);
          } else {
            remainingTimeClients.push(entry);
          }
        }
        timeClients = remainingTimeClients;
        for (const req of comparisonQueue) {
          checkComparisonRequest(req);
        }
      },
    });
    const timerBrand = await E(timer).getTimerBrand();
    const soonRT = coerceRelativeTimeRecord(1n, timerBrand);
    const quoteIntervalRT = coerceRelativeTimeRecord(quoteInterval, timerBrand);
    const repeater = E(timer).makeRepeater(soonRT, quoteIntervalRT);
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
    while (record.updateCount !== undefined) {
      const { value: timestamp } = record; // = await E(timer).getCurrentTimestamp();
      yield priceInQuote(amountIn, brandOut, timestamp);
      record = await ticker.getUpdateSince(record.updateCount);
    }
  }
  harden(generateQuotes);

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
      timeStamp = TimeMath.absValue(timeStamp);
      assert.typeof(timeStamp, 'bigint');
      assertBrands(amountIn.brand, brandOut);
      if (latestTick && timestampLTE(timeStamp, latestTick)) {
        return Promise.resolve(priceInQuote(amountIn, brandOut, timeStamp));
      } else {
        // follow ticker until it fires with >= timeStamp
        const { promise, resolve } = makePromiseKit();
        timeClients.push([timeStamp, resolve]);
        return promise.then(ts => {
          return priceInQuote(amountIn, brandOut, ts);
        });
      }
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
