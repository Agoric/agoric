// @ts-check
// eslint-disable-next-line import/no-extraneous-dependencies
import { test } from '@agoric/zoe/tools/prepare-test-env-ava.js';

import path from 'path';

import bundleSource from '@endo/bundle-source';

import { E } from '@endo/eventual-send';
import { Far } from '@endo/marshal';
import { makeIssuerKit, AssetKind, AmountMath } from '@agoric/ertp';
import { makePromiseKit } from '@endo/promise-kit';

import { assert } from '@agoric/assert';
import { makeFakeVatAdmin } from '../../../tools/fakeVatAdmin.js';
import { makeZoeKit } from '../../../src/zoeService/zoe.js';
import buildManualTimer from '../../../tools/manualTimer.js';

import '../../../exported.js';
import '../../../src/contracts/exported.js';

/**
 * @callback MakeFakePriceOracle
 * @param {ExecutionContext} t
 * @param {bigint} [valueOut]
 * @returns {Promise<OracleKit & { instance: Instance }>}
 */

/**
 * @typedef {Object} TestContext
 * @property {ZoeService} zoe
 * @property {MakeFakePriceOracle} makeFakePriceOracle
 * @property {(
 *   POLL_INTERVAL: bigint,
 * ) => Promise<PriceAggregatorKit & { instance: Instance }>} makeMedianAggregator
 * @property {Amount} feeAmount
 * @property {IssuerKit} link
 *
 * @typedef {import('ava').ExecutionContext<TestContext>} ExecutionContext
 */

const filename = new URL(import.meta.url).pathname;
const dirname = path.dirname(filename);

const oraclePath = `${dirname}/../../../src/contracts/oracle.js`;
const aggregatorPath = `${dirname}/../../../src/contracts/priceAggregator.js`;

test.before(
  'setup aggregator and oracles',
  /** @param {ExecutionContext} ot */ async ot => {
    // Outside of tests, we should use the long-lived Zoe on the
    // testnet. In this test, we must create a new Zoe.
    const { admin, vatAdminState } = makeFakeVatAdmin();
    const { zoeService: zoe } = makeZoeKit(admin);

    // Pack the contracts.
    const oracleBundle = await bundleSource(oraclePath);
    const aggregatorBundle = await bundleSource(aggregatorPath);

    // Install the contract on Zoe, getting an installation. We can
    // use this installation to look up the code we installed. Outside
    // of tests, we can also send the installation to someone
    // else, and they can use it to create a new contract instance
    // using the same code.
    vatAdminState.installBundle('b1-oracle', oracleBundle);
    const oracleInstallation = await E(zoe).installBundleID('b1-oracle');
    vatAdminState.installBundle('b1-aggregator', aggregatorBundle);
    const aggregatorInstallation = await E(zoe).installBundleID(
      'b1-aggregator',
    );

    const link = makeIssuerKit('$LINK', AssetKind.NAT);
    const usd = makeIssuerKit('$USD', AssetKind.NAT);

    /** @type {MakeFakePriceOracle} */
    const makeFakePriceOracle = async (t, valueOut = undefined) => {
      /** @type {OracleHandler} */
      const oracleHandler = Far('OracleHandler', {
        async onQuery({ increment }, _fee) {
          valueOut += increment;
          return harden({
            reply: `${valueOut}`,
            requiredFee: AmountMath.makeEmpty(link.brand),
          });
        },
        onError(query, reason) {
          console.error('query', query, 'failed with', reason);
        },
        onReply(_query, _reply) {},
      });

      /** @type {OracleStartFnResult} */
      const startResult = await E(zoe).startInstance(
        oracleInstallation,
        { Fee: link.issuer },
        { oracleDescription: 'myOracle' },
      );
      const creatorFacet = await E(startResult.creatorFacet).initialize({
        oracleHandler,
      });

      return harden({
        ...startResult,
        creatorFacet,
      });
    };

    const quote = makeIssuerKit('quote', AssetKind.SET);
    /** @param {RelativeTime} POLL_INTERVAL */
    const makeMedianAggregator = async POLL_INTERVAL => {
      const timer = buildManualTimer(() => {});
      const aggregator = await E(zoe).startInstance(
        aggregatorInstallation,
        { In: link.issuer, Out: usd.issuer },
        { timer, POLL_INTERVAL },
      );
      await E(aggregator.creatorFacet).initializeQuoteMint(quote.mint);
      return aggregator;
    };
    ot.context.zoe = zoe;
    ot.context.makeFakePriceOracle = makeFakePriceOracle;
    ot.context.makeMedianAggregator = makeMedianAggregator;
  },
);

test('median aggregator', /** @param {ExecutionContext} t */ async t => {
  const { makeFakePriceOracle, zoe } = t.context;

  const aggregator = await t.context.makeMedianAggregator(1n);
  const {
    timer: oracleTimer,
    brands: { In: brandIn, Out: brandOut },
    issuers: { Quote: quoteIssuer },
    unitAmountIn = AmountMath.make(brandIn, 1n),
  } = await E(zoe).getTerms(aggregator.instance);

  const price1000 = await makeFakePriceOracle(t, 1000n);
  const price1300 = await makeFakePriceOracle(t, 1300n);
  const price800 = await makeFakePriceOracle(t, 800n);
  const pricePush = await makeFakePriceOracle(t);
  const pa = E(aggregator.publicFacet).getPriceAuthority();

  // TODO: Port this to makeQuoteNotifier(amountIn, brandOut)
  // @ts-ignore fix needed
  const notifier = E(pa).makeQuoteNotifier(
    AmountMath.make(brandIn, 1n),
    brandOut,
  );
  await E(aggregator.creatorFacet).initOracle(price1000.instance, {
    increment: 10n,
  });

  /** @type {UpdateRecord<PriceQuote>} */
  let lastRec;
  const tickAndQuote = async () => {
    await oracleTimer.tick();
    lastRec = await E(notifier).getUpdateSince(lastRec && lastRec.updateCount);

    const q = await E(quoteIssuer).getAmountOf(lastRec.value.quotePayment);
    t.deepEqual(q, lastRec.value.quoteAmount);
    const [{ timestamp, timer, amountIn, amountOut }] = q.value;
    t.is(timer, oracleTimer);
    const valueOut = AmountMath.getValue(brandOut, amountOut);

    t.deepEqual(amountIn, unitAmountIn);

    // Validate that we can get a recent amountOut explicitly as well.
    const { quotePayment: recentG } = await E(pa).quoteGiven(
      unitAmountIn,
      brandOut,
    );
    const recentGQ = await E(quoteIssuer).getAmountOf(recentG);
    const [
      {
        timestamp: rgTimestamp,
        timer: rgTimer,
        amountIn: rgIn,
        amountOut: rgOut,
      },
    ] = recentGQ.value;
    t.is(rgTimer, oracleTimer);
    t.is(rgTimestamp, timestamp);
    t.deepEqual(rgIn, amountIn);
    t.deepEqual(rgOut, amountOut);

    const { quotePayment: recentW } = await E(pa).quoteWanted(brandIn, rgOut);
    const recentWQ = await E(quoteIssuer).getAmountOf(recentW);
    const [
      {
        timestamp: rwTimestamp,
        timer: rwTimer,
        amountIn: rwIn,
        amountOut: rwOut,
      },
    ] = recentWQ.value;
    t.is(rwTimer, oracleTimer);
    t.is(rwTimestamp, timestamp);
    t.deepEqual(rwIn, amountIn);
    t.deepEqual(rwOut, amountOut);

    return { timestamp, amountOut: valueOut };
  };

  const pricePushAdmin = await E(aggregator.creatorFacet).initOracle(
    pricePush.instance,
  );

  const quote0 = await tickAndQuote();
  t.deepEqual(quote0, { amountOut: 1020n, timestamp: 1n });

  const quote1 = await tickAndQuote();
  t.deepEqual(quote1, { amountOut: 1030n, timestamp: 2n });

  const price1300Admin = await E(aggregator.creatorFacet).initOracle(
    price1300.instance,
    {
      increment: 8n,
    },
  );

  const quote2 = await tickAndQuote();
  t.deepEqual(quote2, { amountOut: 1178n, timestamp: 3n });

  const quote3 = await tickAndQuote();
  t.deepEqual(quote3, { amountOut: 1187n, timestamp: 4n });

  await E(aggregator.creatorFacet).initOracle(price800.instance, {
    increment: 17n,
  });

  const quote4 = await tickAndQuote();
  t.deepEqual(quote4, { amountOut: 1060n, timestamp: 5n });

  const quote5 = await tickAndQuote();
  t.deepEqual(quote5, { amountOut: 1070n, timestamp: 6n });

  // Push a price into the fray.
  await E(pricePushAdmin).pushResult('1069');

  const quote6 = await tickAndQuote();
  t.deepEqual(quote6, { amountOut: 1074n, timestamp: 7n });

  await E(pricePushAdmin).delete();

  const quote7 = await tickAndQuote();
  t.deepEqual(quote7, { amountOut: 1090n, timestamp: 8n });

  await E(price1300Admin).delete();

  const quote8 = await tickAndQuote();
  t.deepEqual(quote8, { amountOut: 1001n, timestamp: 9n });
});

test('quoteAtTime', /** @param {ExecutionContext} t */ async t => {
  const { makeFakePriceOracle, zoe } = t.context;

  const userTimer = buildManualTimer(() => {});

  const aggregator = await t.context.makeMedianAggregator(1n);
  const {
    timer: oracleTimer,
    brands: { Out: usdBrand, In: brandIn },
    issuers: { Quote: quoteIssuer },
  } = await E(zoe).getTerms(aggregator.instance);

  const price1000 = await makeFakePriceOracle(t, 1000n);
  const price1300 = await makeFakePriceOracle(t, 1300n);
  const price800 = await makeFakePriceOracle(t, 800n);
  const pa = E(aggregator.publicFacet).getPriceAuthority();

  const quoteAtTime = E(pa).quoteAtTime(
    7n,
    AmountMath.make(brandIn, 41n),
    usdBrand,
  );

  /** @type {PriceQuote | undefined} */
  let priceQuote;
  quoteAtTime.then(
    result => (priceQuote = result),
    reason =>
      t.notThrows(() => {
        throw reason;
      }),
  );

  /** @type {PromiseRecord<PriceQuote>} */
  const userQuotePK = makePromiseKit();
  await E(userTimer).setWakeup(
    1n,
    Far('wakeHandler', {
      async wake(_timestamp) {
        userQuotePK.resolve(
          E(pa).quoteGiven(AmountMath.make(brandIn, 23n), usdBrand),
        );
        await userQuotePK.promise;
      },
    }),
  );
  const quoteAtUserTime = userQuotePK.promise;

  /** @type {PriceQuote | undefined} */
  let userPriceQuote;
  quoteAtUserTime.then(
    result => (userPriceQuote = result),
    reason =>
      t.notThrowsAsync(() => {
        throw reason;
      }),
  );

  await E(aggregator.creatorFacet).initOracle(price1000.instance, {
    increment: 10n,
  });

  await E(oracleTimer).tick();
  await E(oracleTimer).tick();

  const price1300Admin = await E(aggregator.creatorFacet).initOracle(
    price1300.instance,
    {
      increment: 8n,
    },
  );

  await E(oracleTimer).tick();
  await E(oracleTimer).tick();

  await E(aggregator.creatorFacet).initOracle(price800.instance, {
    increment: 17n,
  });

  await E(oracleTimer).tick();

  // Ensure our user quote fires exactly now.
  t.falsy(userPriceQuote);
  await E(userTimer).tick();
  t.truthy(userPriceQuote);
  assert(userPriceQuote);

  const userQuote = await E(quoteIssuer).getAmountOf(
    userPriceQuote.quotePayment,
  );
  const [
    {
      amountIn: userIn,
      amountOut: userOut,
      timer: uTimer,
      timestamp: uTimestamp,
    },
  ] = userQuote.value;
  t.is(uTimer, oracleTimer);
  t.is(uTimestamp, 5n);
  t.is(userIn.value, 23n);
  t.is(userOut.value / 23n, 1060n);

  await E(oracleTimer).tick();

  await E(price1300Admin).delete();

  // Ensure our quote fires exactly now.
  t.falsy(priceQuote);
  await E(oracleTimer).tick();
  t.truthy(priceQuote);
  assert(priceQuote);

  const quote = await E(quoteIssuer).getAmountOf(priceQuote.quotePayment);
  t.deepEqual(quote, priceQuote.quoteAmount);
  const [{ amountIn, amountOut, timer, timestamp }] = quote.value;
  t.is(timer, oracleTimer);
  t.is(timestamp, 7n);
  t.is(amountIn.value, 41n);
  t.is(amountOut.value / 41n, 960n);
});

test('quoteWhen', /** @param {ExecutionContext} t */ async t => {
  const { makeFakePriceOracle, zoe } = t.context;

  const aggregator = await t.context.makeMedianAggregator(1n);

  const {
    timer: oracleTimer,
    issuers: { Quote: quoteIssuer },
    brands,
  } = await E(zoe).getTerms(aggregator.instance);

  const price1000 = await makeFakePriceOracle(t, 1000n);
  const price1300 = await makeFakePriceOracle(t, 1300n);
  const price800 = await makeFakePriceOracle(t, 800n);
  const pa = E(aggregator.publicFacet).getPriceAuthority();

  const quoteWhenGTE = E(pa).quoteWhenGTE(
    AmountMath.make(brands.In, 37n),
    AmountMath.make(brands.Out, 1183n * 37n),
  );

  /** @type {PriceQuote | undefined} */
  let abovePriceQuote;
  quoteWhenGTE.then(
    result => (abovePriceQuote = result),
    reason =>
      t.notThrows(() => {
        throw reason;
      }),
  );

  const quoteWhenLTE = E(pa).quoteWhenLTE(
    AmountMath.make(brands.In, 29n),
    AmountMath.make(brands.Out, 974n * 29n),
  );

  /** @type {PriceQuote | undefined} */
  let belowPriceQuote;
  quoteWhenLTE.then(
    result => (belowPriceQuote = result),
    reason =>
      t.notThrows(() => {
        throw reason;
      }),
  );

  await E(aggregator.creatorFacet).initOracle(price1000.instance, {
    increment: 10n,
  });

  await E(oracleTimer).tick();
  await E(oracleTimer).tick();

  const price1300Admin = await E(aggregator.creatorFacet).initOracle(
    price1300.instance,
    {
      increment: 8n,
    },
  );

  await E(oracleTimer).tick();
  // Above trigger has not yet fired.
  t.falsy(abovePriceQuote);
  await E(oracleTimer).tick();

  // The above trigger should fire here.
  await quoteWhenGTE;
  t.truthy(abovePriceQuote);
  assert(abovePriceQuote);
  const aboveQuote = await E(quoteIssuer).getAmountOf(
    abovePriceQuote.quotePayment,
  );
  t.deepEqual(aboveQuote, abovePriceQuote.quoteAmount);
  const [
    {
      amountIn: aboveIn,
      amountOut: aboveOut,
      timer: aboveTimer,
      timestamp: aboveTimestamp,
    },
  ] = aboveQuote.value;
  t.is(aboveTimer, oracleTimer);
  t.is(aboveTimestamp, 4n);
  t.is(aboveIn.value, 37n);
  t.is(aboveOut.value / 37n, 1183n);

  await E(aggregator.creatorFacet).initOracle(price800.instance, {
    increment: 17n,
  });

  await E(oracleTimer).tick();
  await E(oracleTimer).tick();

  // Below trigger has not yet fired.
  t.falsy(belowPriceQuote);
  await E(price1300Admin).delete();

  // The below trigger should fire here.
  await quoteWhenLTE;
  t.truthy(belowPriceQuote);
  assert(belowPriceQuote);
  const belowQuote = await E(quoteIssuer).getAmountOf(
    belowPriceQuote.quotePayment,
  );
  t.deepEqual(belowQuote, belowPriceQuote.quoteAmount);
  const [
    {
      amountIn: belowIn,
      amountOut: belowOut,
      timer: belowTimer,
      timestamp: belowTimestamp,
    },
  ] = belowQuote.value;
  t.is(belowTimer, oracleTimer);
  t.is(belowTimestamp, 6n);
  t.is(belowIn.value, 29n);
  t.is(belowOut.value / 29n, 960n);
});

test('mutableQuoteWhen no replacement', /** @param {ExecutionContext} t */ async t => {
  const { makeFakePriceOracle, zoe } = t.context;

  const aggregator = await t.context.makeMedianAggregator(1n);

  const {
    timer: oracleTimer,
    issuers: { Quote: quoteIssuer },
    brands,
  } = await E(zoe).getTerms(aggregator.instance);

  const price1000 = await makeFakePriceOracle(t, 1000n);
  const price1300 = await makeFakePriceOracle(t, 1300n);
  const price800 = await makeFakePriceOracle(t, 800n);
  const pa = E(aggregator.publicFacet).getPriceAuthority();

  const mutableQuoteWhenGTE = E(pa).mutableQuoteWhenGTE(
    AmountMath.make(brands.In, 37n),
    AmountMath.make(brands.Out, 1183n * 37n),
  );

  /** @type {PriceQuote | undefined} */
  let abovePriceQuote;
  E(mutableQuoteWhenGTE)
    .getPromise()
    .then(
      result => (abovePriceQuote = result),
      reason =>
        t.notThrows(() => {
          throw reason;
        }),
    );

  const mutableQuoteWhenLTE = E(pa).mutableQuoteWhenLTE(
    AmountMath.make(brands.In, 29n),
    AmountMath.make(brands.Out, 974n * 29n),
  );

  /** @type {PriceQuote | undefined} */
  let belowPriceQuote;
  E(mutableQuoteWhenLTE)
    .getPromise()
    .then(
      result => (belowPriceQuote = result),
      reason =>
        t.notThrows(() => {
          throw reason;
        }),
    );

  await E(aggregator.creatorFacet).initOracle(price1000.instance, {
    increment: 10n,
  });

  await E(oracleTimer).tick();
  await E(oracleTimer).tick();

  const price1300Admin = await E(aggregator.creatorFacet).initOracle(
    price1300.instance,
    {
      increment: 8n,
    },
  );

  await E(oracleTimer).tick();
  // Above trigger has not yet fired.
  t.falsy(abovePriceQuote);
  await E(oracleTimer).tick();

  // The above trigger should fire here.
  t.truthy(abovePriceQuote);
  await E(mutableQuoteWhenGTE).getPromise();

  assert(abovePriceQuote);
  const aboveQuote = await E(quoteIssuer).getAmountOf(
    abovePriceQuote.quotePayment,
  );
  t.deepEqual(aboveQuote, abovePriceQuote.quoteAmount);
  const [
    {
      amountIn: aboveIn,
      amountOut: aboveOut,
      timer: aboveTimer,
      timestamp: aboveTimestamp,
    },
  ] = aboveQuote.value;
  t.is(aboveTimer, oracleTimer);
  t.is(aboveTimestamp, 4n);
  t.is(aboveIn.value, 37n);
  t.is(aboveOut.value / 37n, 1183n);

  await E(aggregator.creatorFacet).initOracle(price800.instance, {
    increment: 17n,
  });

  await E(oracleTimer).tick();
  await E(oracleTimer).tick();

  // Below trigger has not yet fired.
  t.falsy(belowPriceQuote);
  await E(price1300Admin).delete();

  // The below trigger should fire here.
  // TODO(hibbert): the delete() call above should cause belowPriceQuote to
  //   trigger. It appears that updateState() has been called, but it hasn't
  //   propagated yet
  await E(mutableQuoteWhenLTE).getPromise();
  t.truthy(belowPriceQuote);
  assert(belowPriceQuote);
  const belowQuote = await E(quoteIssuer).getAmountOf(
    belowPriceQuote.quotePayment,
  );
  t.deepEqual(belowQuote, belowPriceQuote.quoteAmount);
  const [
    {
      amountIn: belowIn,
      amountOut: belowOut,
      timer: belowTimer,
      timestamp: belowTimestamp,
    },
  ] = belowQuote.value;
  t.is(belowTimer, oracleTimer);
  t.is(belowTimestamp, 6n);
  t.is(belowIn.value, 29n);
  t.is(belowOut.value / 29n, 960n);
});

test('mutableQuoteWhen with update', /** @param {ExecutionContext} t */ async t => {
  const { makeFakePriceOracle, zoe } = t.context;

  const aggregator = await t.context.makeMedianAggregator(1n);

  const {
    timer: oracleTimer,
    issuers: { Quote: quoteIssuer },
    brands,
  } = await E(zoe).getTerms(aggregator.instance);

  const price1200 = await makeFakePriceOracle(t, 1200n);
  const pa = E(aggregator.publicFacet).getPriceAuthority();

  const mutableQuoteWhenGTE = E(pa).mutableQuoteWhenGTE(
    AmountMath.make(brands.In, 25n),
    AmountMath.make(brands.Out, 1240n * 25n),
  );

  /** @type {PriceQuote | undefined} */
  let abovePriceQuote;
  E(mutableQuoteWhenGTE)
    .getPromise()
    .then(
      result => (abovePriceQuote = result),
      reason =>
        t.notThrows(() => {
          throw reason;
        }),
    );

  await E(aggregator.creatorFacet).initOracle(price1200.instance, {
    increment: 10n,
  });

  await E(oracleTimer).tick();

  await E(mutableQuoteWhenGTE).updateLevel(
    AmountMath.make(brands.In, 25n),
    AmountMath.make(brands.Out, 1245n * 25n),
  );

  await E(oracleTimer).tick();
  // Above trigger has not yet fired.
  t.falsy(abovePriceQuote);
  await E(oracleTimer).tick();

  // The above trigger would have fired here if not for updateLevel()
  t.falsy(abovePriceQuote);
  await E(oracleTimer).tick();

  t.truthy(abovePriceQuote);
  assert(abovePriceQuote);
  const aboveQuote = await E(quoteIssuer).getAmountOf(
    abovePriceQuote.quotePayment,
  );
  t.deepEqual(aboveQuote, abovePriceQuote.quoteAmount);
  const [
    {
      amountIn: aboveIn,
      amountOut: aboveOut,
      timer: aboveTimer,
      timestamp: aboveTimestamp,
    },
  ] = aboveQuote.value;
  t.is(aboveTimer, oracleTimer);
  t.is(aboveTimestamp, 4n);
  t.is(aboveIn.value, 25n);
  t.is(aboveOut.value / 25n, 1250n);
});

test('cancel mutableQuoteWhen', /** @param {ExecutionContext} t */ async t => {
  const { makeFakePriceOracle, zoe } = t.context;

  const aggregator = await t.context.makeMedianAggregator(1n);

  const { timer: oracleTimer, brands } = await E(zoe).getTerms(
    aggregator.instance,
  );

  const price1200 = await makeFakePriceOracle(t, 1200n);
  const pa = E(aggregator.publicFacet).getPriceAuthority();

  const mutableQuoteWhenGTE = E(pa).mutableQuoteWhenGTE(
    AmountMath.make(brands.In, 25n),
    AmountMath.make(brands.Out, 1240n * 25n),
  );

  /** @type {PriceQuote | undefined} */
  E(mutableQuoteWhenGTE)
    .getPromise()
    .then(
      result => t.fail(`Promise should throw, not return ${result}`),
      reason => t.is(reason, 'unneeded'),
    );

  await E(aggregator.creatorFacet).initOracle(price1200.instance, {
    increment: 10n,
  });

  await E(oracleTimer).tick();
  await E(mutableQuoteWhenGTE).cancel('unneeded');
});
