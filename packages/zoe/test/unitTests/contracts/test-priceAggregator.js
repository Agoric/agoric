/* eslint @typescript-eslint/no-floating-promises: "warn" */
import { test as unknownTest } from '@agoric/swingset-vat/tools/prepare-test-env-ava.js';

import path from 'path';

import bundleSource from '@endo/bundle-source';

import { E } from '@endo/eventual-send';
import { Far } from '@endo/far';
import { makeIssuerKit, AmountMath } from '@agoric/ertp';
import { makePromiseKit } from '@endo/promise-kit';

import { TimeMath } from '@agoric/time';
import { makeNotifierKit, subscribeEach } from '@agoric/notifier';
import { makeFakeMarshaller } from '@agoric/notifier/tools/testSupports.js';
import { makeMockChainStorageRoot } from '@agoric/internal/src/storage-test-utils.js';

import { eventLoopIteration } from '@agoric/internal/src/testing-utils.js';
import { makeFakeVatAdmin } from '../../../tools/fakeVatAdmin.js';
import { makeZoeForTest } from '../../../tools/setup-zoe.js';
import buildManualTimer from '../../../tools/manualTimer.js';
import { start } from '../../../src/contracts/priceAggregator.js';

import '../../../src/contracts/exported.js';
import {
  addRatios,
  makeRatio,
  multiplyBy,
  multiplyRatios,
  parseRatio,
} from '../../../src/contractSupport/ratio.js';

/**
 * @import {PriceAuthority, PriceQuote, PriceDescription, PriceQuoteValue, PriceQuery} from '@agoric/zoe';
 */

/**
 * @callback MakeFakePriceOracle
 * @param {bigint} [valueOut]
 * @returns {Promise<OracleKit & { instance: Instance }>}
 */

/**
 * Type to refine the `timer` term used in tests
 *
 * @param {ZCF<{
 * timer: ManualTimer,
 * POLL_INTERVAL: bigint,
 * brandIn: Brand<'nat'>,
 * brandOut: Brand<'nat'>,
 * unitAmountIn: Amount<'nat'>,
 * }>} zcf
 * @param {{
 * marshaller: Marshaller,
 * quoteMint?: ERef<Mint<'set'>>,
 * storageNode: StorageNode,
 * }} privateArgs
 */
// eslint-disable-next-line no-unused-vars -- used for typedef
const testStartFn = (zcf, privateArgs) => start(zcf, privateArgs);

/**
 * @typedef {object} TestContext
 * @property {ZoeService} zoe
 * @property {MakeFakePriceOracle} makeFakePriceOracle
 * @property {(unitValueIn?: bigint) => Promise<PriceAggregatorKit & { instance: import('../../../src/zoeService/utils.js').Instance<typeof testStartFn>, mockStorageRoot: import('@agoric/internal/src/storage-test-utils.js').MockChainStorageRoot }>} makeMedianAggregator
 * @property {Amount} feeAmount
 * @property {IssuerKit} link
 */

const filename = new URL(import.meta.url).pathname;
const dirname = path.dirname(filename);

const oraclePath = `${dirname}/../../../src/contracts/oracle.js`;
const aggregatorPath = `${dirname}/../../../src/contracts/priceAggregator.js`;

const makePublicationChecker = async (t, aggregatorPublicFacet, timerBrand) => {
  const publications = E(
    subscribeEach(E(aggregatorPublicFacet).getSubscriber()),
  )[Symbol.asyncIterator]();

  return {
    /** @param {{timestamp: bigint, amountOut: any}} spec */
    async nextMatches({ timestamp, amountOut }) {
      const expectedTimestamp = TimeMath.coerceTimestampRecord(
        timestamp,
        timerBrand,
      );
      const { value } = await E(publications).next();
      t.deepEqual(value.timestamp, expectedTimestamp, 'wrong timestamp');
      t.is(value.amountOut.value, amountOut, 'wrong amountOut value');
    },
  };
};

/** @type {import('ava').TestFn<TestContext>} */
const test = unknownTest;

test.before('setup aggregator and oracles', async t => {
  // Outside of tests, we should use the long-lived Zoe on the
  // testnet. In this test, we must create a new Zoe.
  const { admin, vatAdminState } = makeFakeVatAdmin();
  const zoe = makeZoeForTest(admin);

  // Pack the contracts.
  const oracleBundle = await bundleSource(oraclePath);
  const aggregatorBundle = await bundleSource(aggregatorPath);

  // Install the contract on Zoe, getting an installation. We can
  // use this installation to look up the code we installed. Outside
  // of tests, we can also send the installation to someone
  // else, and they can use it to create a new contract instance
  // using the same code.
  vatAdminState.installBundle('b1-oracle', oracleBundle);
  /** @type {Installation<import('../../../src/contracts/oracle.js').OracleStart>} */
  const oracleInstallation = await E(zoe).installBundleID('b1-oracle');
  vatAdminState.installBundle('b1-aggregator', aggregatorBundle);
  /** @type {Installation<import('../../../src/contracts/priceAggregator.js').start>} */
  const aggregatorInstallation = await E(zoe).installBundleID('b1-aggregator');

  const link = makeIssuerKit('$ATOM');
  const { brand: atomBrand } = makeIssuerKit('$ATOM');
  const { brand: usdBrand } = makeIssuerKit('$USD');

  /**
   *  @type {MakeFakePriceOracle}
   */
  const makeFakePriceOracle = async (valueOut = 0n) => {
    /** @type {OracleHandler} */
    const oracleHandler = Far('OracleHandler', {
      async onQuery({ increment }, _fee) {
        assert(increment);
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

  /**
   * @param {bigint} [unitValueIn] unit size of amountIn brand
   */
  const makeMedianAggregator = async (unitValueIn = 1n) => {
    // ??? why do we need the Far here and not in VaultFactory tests?
    const marshaller = Far('fake marshaller', { ...makeFakeMarshaller() });
    const storageRoot = makeMockChainStorageRoot();

    const timer = buildManualTimer(() => {}, 0n, { eventLoopIteration });
    const POLL_INTERVAL = 1n;
    const storageNode = E(storageRoot).makeChildNode('priceAggregator');
    const aggregator = await E(zoe).startInstance(
      aggregatorInstallation,
      undefined,
      {
        timer,
        POLL_INTERVAL,
        brandIn: atomBrand,
        brandOut: usdBrand,
        unitAmountIn: AmountMath.make(atomBrand, unitValueIn),
      },
      {
        marshaller,
        storageNode: E(storageNode).makeChildNode('ATOM-USD_price_feed'),
      },
    );
    return { ...aggregator, mockStorageRoot: storageRoot };
  };
  Object.assign(t.context, { zoe, makeFakePriceOracle, makeMedianAggregator });
});

test('median aggregator', async t => {
  const { makeFakePriceOracle, zoe } = t.context;

  const aggregator = await t.context.makeMedianAggregator();
  const {
    timer: oracleTimer,
    brandIn,
    brandOut,
    issuers: { Quote: rawQuoteIssuer },
    unitAmountIn,
  } = await E(zoe).getTerms(aggregator.instance);
  const timerBrand = oracleTimer.getTimerBrand();
  const toTS = ts => TimeMath.coerceTimestampRecord(ts, timerBrand);
  /** @type {Issuer<'set'>} */
  const quoteIssuer = rawQuoteIssuer;

  const price1000 = await makeFakePriceOracle(1000n);
  const price1300 = await makeFakePriceOracle(1300n);
  const price800 = await makeFakePriceOracle(800n);
  const pricePush = await makeFakePriceOracle();
  const pa = E(aggregator.publicFacet).getPriceAuthority();

  const notifier = E(pa).makeQuoteNotifier(unitAmountIn, brandOut);
  await E(aggregator.creatorFacet).initOracle(price1000.instance, {
    increment: 10n,
  });
  const publications = await makePublicationChecker(
    t,
    aggregator.publicFacet,
    timerBrand,
  );

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
    t.deepEqual(rgTimestamp, timestamp);
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
    t.deepEqual(rwTimestamp, timestamp);
    t.deepEqual(rwIn, amountIn);
    t.deepEqual(rwOut, amountOut);

    return { timestamp, amountOut: valueOut };
  };

  await publications.nextMatches({ amountOut: 1010n, timestamp: 0n });

  const quote0 = await tickAndQuote();
  t.deepEqual(quote0, { amountOut: 1020n, timestamp: toTS(1n) });
  await publications.nextMatches(quote0);

  const quote1 = await tickAndQuote();
  t.deepEqual(quote1, { amountOut: 1030n, timestamp: toTS(2n) });
  await publications.nextMatches(quote1);

  const price1300Admin = await E(aggregator.creatorFacet).initOracle(
    price1300.instance,
    {
      increment: 8n,
    },
  );
  // Publications and tickAndQuote getUpdateSince ensures one record per update
  await publications.nextMatches({
    amountOut: 1169n,
    timestamp: 2n,
  });

  const quote2 = await tickAndQuote();
  t.deepEqual(quote2, { amountOut: 1178n, timestamp: toTS(3n) });
  await publications.nextMatches(quote2);

  const quote3 = await tickAndQuote();
  t.deepEqual(quote3, { amountOut: 1187n, timestamp: toTS(4n) });
  await publications.nextMatches(quote3);

  await E(aggregator.creatorFacet).initOracle(price800.instance, {
    increment: 17n,
  });
  await publications.nextMatches({
    amountOut: 1050n,
    timestamp: 4n,
  });

  const quote4 = await tickAndQuote();
  t.deepEqual(quote4, { amountOut: 1060n, timestamp: toTS(5n) });
  await publications.nextMatches(quote4);

  const quote5 = await tickAndQuote();
  t.deepEqual(quote5, { amountOut: 1070n, timestamp: toTS(6n) });
  await publications.nextMatches(quote5);

  // Push a price into the fray.
  const pricePushAdmin = await E(aggregator.creatorFacet).initOracle(
    pricePush.instance,
  );
  await E(pricePushAdmin).pushResult('1069');

  const quote6 = await tickAndQuote();
  t.deepEqual(quote6, { amountOut: 1074n, timestamp: toTS(7n) });
  await publications.nextMatches(quote6);

  await E(pricePushAdmin).delete();
  await publications.nextMatches({
    amountOut: 1080n,
    timestamp: 7n,
  });

  const quote7 = await tickAndQuote();
  t.deepEqual(quote7, { amountOut: 1090n, timestamp: toTS(8n) });
  await publications.nextMatches(quote7);

  await E(price1300Admin).delete();
  await publications.nextMatches({
    amountOut: 987n,
    timestamp: 8n,
  });

  const quote8 = await tickAndQuote();
  // 1001n b/c the 800 stream is incrementing within the timestamp, driving the amount up with 885 -> 902
  t.deepEqual(quote8, { amountOut: 1001n, timestamp: toTS(9n) });
  await publications.nextMatches(quote8);
});

test('median aggregator - push only', async t => {
  const { makeFakePriceOracle, zoe } = t.context;

  const aggregator = await t.context.makeMedianAggregator();
  const {
    timer: oracleTimer,
    brandIn,
    brandOut,
    issuers: { Quote: rawQuoteIssuer },
    unitAmountIn,
  } = await E(zoe).getTerms(aggregator.instance);
  const toTS = ts =>
    TimeMath.coerceTimestampRecord(ts, oracleTimer.getTimerBrand());
  /** @type {Issuer<'set'>} */
  const quoteIssuer = rawQuoteIssuer;

  const pricePush = await makeFakePriceOracle();
  const pa = E(aggregator.publicFacet).getPriceAuthority();

  const notifier = E(pa).makeQuoteNotifier(unitAmountIn, brandOut);

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
    t.deepEqual(rgTimestamp, timestamp);
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
    t.deepEqual(rwTimestamp, timestamp);
    t.deepEqual(rwIn, amountIn);
    t.deepEqual(rwOut, amountOut);

    return { timestamp, amountOut: valueOut };
  };

  const pricePushAdmin = await E(aggregator.creatorFacet).initOracle(
    pricePush.instance,
  );

  // Push a price into the fray.
  await E(pricePushAdmin).pushResult('1069');

  const quote1 = await tickAndQuote();
  t.deepEqual(quote1, { amountOut: 1069n, timestamp: toTS(1n) });

  await E(pricePushAdmin).pushResult('1073');

  const quote2 = await tickAndQuote();
  t.deepEqual(quote2, { amountOut: 1073n, timestamp: toTS(2n) });

  await E(pricePushAdmin).delete();
});

test('oracle invitation', async t => {
  const { zoe } = t.context;

  const aggregator = await t.context.makeMedianAggregator();
  const {
    timer: oracleTimer,
    brandIn,
    brandOut,
  } = await E(zoe).getTerms(aggregator.instance);
  const timerBrand = oracleTimer.getTimerBrand();

  const inv1 = await E(aggregator.creatorFacet).makeOracleInvitation('oracle1');
  const { notifier: oracle1, updater: updater1 } = makeNotifierKit();
  const or1 = E(zoe).offer(inv1, undefined, undefined, { notifier: oracle1 });
  const oracleAdmin1 = E(or1).getOfferResult();

  /** @type {Amount<'nat'>} */
  const amountIn = AmountMath.make(brandIn, 1000000n);
  const makeQuoteValue = (timestamp, valueOut) => [
    {
      timer: oracleTimer,
      timestamp: TimeMath.coerceTimestampRecord(timestamp, timerBrand),
      amountIn,
      amountOut: AmountMath.make(brandOut, valueOut),
    },
  ];

  const notifier = E(
    E(aggregator.publicFacet).getPriceAuthority(),
  ).makeQuoteNotifier(amountIn, brandOut);

  updater1.updateState('1234');
  await E(oracleTimer).tick();
  await E(oracleTimer).tick();
  await E(oracleTimer).tick();
  const { value: value1, updateCount: uc1 } =
    await E(notifier).getUpdateSince();
  t.deepEqual(value1.quoteAmount.value, makeQuoteValue(3n, 1_234_000_000n));

  updater1.updateState('1234.567');
  await E(oracleTimer).tick();
  await E(oracleTimer).tick();
  const { value: value2, updateCount: uc2 } =
    await E(notifier).getUpdateSince(uc1);
  t.deepEqual(value2.quoteAmount.value, makeQuoteValue(5n, 1_234_567_000n));

  const inv2 = await E(aggregator.creatorFacet).makeOracleInvitation('oracle2');
  const { notifier: oracle2, updater: updater2 } = makeNotifierKit();
  const or2 = E(zoe).offer(inv2, undefined, undefined, {
    notifier: oracle2,
    scaleValueOut: 0.001,
  });
  const oracleAdmin2 = E(or2).getOfferResult();

  updater2.updateState('1234');
  await E(oracleTimer).tick();
  await E(oracleTimer).tick();
  await E(oracleTimer).tick();
  const { value: value3, updateCount: uc3 } =
    await E(notifier).getUpdateSince(uc2);

  // Check median calculation of two oracles.
  const price1 = parseRatio('1234.567', brandOut, brandIn);
  const price2 = parseRatio('1.234', brandOut, brandIn);
  const medianPrice = multiplyRatios(
    addRatios(price1, price2),
    parseRatio('0.5', brandOut),
  );
  t.deepEqual(
    value3.quoteAmount.value,
    makeQuoteValue(8n, multiplyBy(amountIn, medianPrice).value),
  );

  await E(E.get(oracleAdmin1).admin).delete();

  updater2.updateState('1234');
  await E(oracleTimer).tick();
  const { value: value4, updateCount: uc4 } =
    await E(notifier).getUpdateSince(uc3);
  t.deepEqual(value4.quoteAmount.value, makeQuoteValue(9n, 1_234_000n));

  updater2.updateState('1234.567890');

  await eventLoopIteration(); // pretend this is a new kernel delivery
  await E(oracleTimer).tick();
  const { value: value5, updateCount: uc5 } =
    await E(notifier).getUpdateSince(uc4);
  t.deepEqual(value5.quoteAmount.value, makeQuoteValue(10n, 1_234_567n));

  updater2.updateState(makeRatio(987_654n, brandOut, 500_000n, brandIn));

  await eventLoopIteration(); // pretend this is a new kernel delivery
  await E(oracleTimer).tick();
  const { value: value6, updateCount: _uc6 } =
    await E(notifier).getUpdateSince(uc5);
  t.deepEqual(value6.quoteAmount.value, makeQuoteValue(11n, 987_654n * 2n));

  await E(E.get(oracleAdmin2).admin).delete();
});

test('oracle continuing invitation', async t => {
  const { zoe } = t.context;

  const aggregator = await t.context.makeMedianAggregator();
  const {
    timer: oracleTimer,
    brandIn,
    brandOut,
  } = await E(zoe).getTerms(aggregator.instance);
  const timerBrand = oracleTimer.getTimerBrand();

  const inv1 = await E(aggregator.creatorFacet).makeOracleInvitation('oracle1');
  const { notifier: oracle1 } = makeNotifierKit();
  const or1 = E(zoe).offer(inv1, undefined, undefined, { notifier: oracle1 });
  const oracleAdmin1 = E(or1).getOfferResult();
  const invitationMakers = await E.get(oracleAdmin1).invitationMakers;
  t.true('PushPrice' in invitationMakers);

  const amountIn = AmountMath.make(brandIn, 1000000n);
  const makeQuoteValue = (timestamp, valueOut) => [
    {
      timer: oracleTimer,
      timestamp: TimeMath.coerceTimestampRecord(timestamp, timerBrand),
      amountIn,
      amountOut: AmountMath.make(brandOut, valueOut),
    },
  ];

  const notifier = E(
    E(aggregator.publicFacet).getPriceAuthority(),
  ).makeQuoteNotifier(amountIn, brandOut);

  const invPrice = await E(invitationMakers).PushPrice('1234');
  const invPriceResult = await E(zoe).offer(invPrice);
  t.deepEqual(await E(invPriceResult).numWantsSatisfied(), 1);

  await E(oracleTimer).tick();
  await E(oracleTimer).tick();
  await E(oracleTimer).tick();
  const { value } = await E(notifier).getUpdateSince();
  t.deepEqual(value.quoteAmount.value, makeQuoteValue(3n, 1_234_000_000n));
});

test('quoteAtTime', async t => {
  const { makeFakePriceOracle, zoe } = t.context;

  const userTimer = buildManualTimer(() => {}, 0n, { eventLoopIteration });
  const manualTS = ts =>
    TimeMath.coerceTimestampRecord(ts, userTimer.getTimerBrand());

  const aggregator = await t.context.makeMedianAggregator();
  const {
    timer: oracleTimer,
    brandIn,
    brandOut: usdBrand,
    issuers: { Quote: rawQuoteIssuer },
  } = await E(zoe).getTerms(aggregator.instance);
  const toTS = ts =>
    TimeMath.coerceTimestampRecord(ts, oracleTimer.getTimerBrand());
  /** @type {Issuer<'set'>} */
  const quoteIssuer = rawQuoteIssuer;

  const price1000 = await makeFakePriceOracle(1000n);
  const price1300 = await makeFakePriceOracle(1300n);
  const price800 = await makeFakePriceOracle(800n);
  const pa = E(aggregator.publicFacet).getPriceAuthority();

  const quoteAtTime = E(pa).quoteAtTime(
    toTS(7n),
    AmountMath.make(brandIn, 41n),
    usdBrand,
  );

  /** @type {PriceQuote | undefined} */
  let priceQuote;
  t.notThrowsAsync(quoteAtTime.then(result => (priceQuote = result)));

  /** @type {PromiseRecord<PriceQuote>} */
  const userQuotePK = makePromiseKit();
  await E(userTimer).setWakeup(
    manualTS(1n),
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
  t.notThrowsAsync(quoteAtUserTime.then(result => (userPriceQuote = result)));

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
  t.deepEqual(uTimestamp, toTS(5n));
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
  t.deepEqual(timestamp, toTS(7n));
  t.is(amountIn.value, 41n);
  t.is(amountOut.value / 41n, 960n);
});

test('quoteWhen', async t => {
  const { makeFakePriceOracle, zoe } = t.context;

  const aggregator = await t.context.makeMedianAggregator();

  const {
    timer: oracleTimer,
    issuers: { Quote: rawQuoteIssuer },
    brandIn,
    brandOut,
  } = await E(zoe).getTerms(aggregator.instance);
  const toTS = ts =>
    TimeMath.coerceTimestampRecord(ts, oracleTimer.getTimerBrand());
  /** @type {Issuer<'set'>} */
  const quoteIssuer = rawQuoteIssuer;

  const price1000 = await makeFakePriceOracle(1000n);
  const price1300 = await makeFakePriceOracle(1300n);
  const price800 = await makeFakePriceOracle(800n);
  const pa = E(aggregator.publicFacet).getPriceAuthority();

  const quoteWhenGTE = E(pa).quoteWhenGTE(
    AmountMath.make(brandIn, 37n),
    AmountMath.make(brandOut, 1183n * 37n),
  );

  /** @type {PriceQuote | undefined} */
  let abovePriceQuote;
  t.notThrowsAsync(quoteWhenGTE.then(result => (abovePriceQuote = result)));
  const quoteWhenLTE = E(pa).quoteWhenLTE(
    AmountMath.make(brandIn, 29n),
    AmountMath.make(brandOut, 974n * 29n),
  );

  /** @type {PriceQuote | undefined} */
  let belowPriceQuote;
  t.notThrowsAsync(quoteWhenLTE.then(result => (belowPriceQuote = result)));

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
  t.deepEqual(aboveTimestamp, toTS(4n));
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
  t.deepEqual(belowTimestamp, toTS(6n));
  t.is(belowIn.value, 29n);
  t.is(belowOut.value / 29n, 960n);
});

test('mutableQuoteWhen no replacement', async t => {
  const { makeFakePriceOracle, zoe } = t.context;

  const aggregator = await t.context.makeMedianAggregator();

  const {
    timer: oracleTimer,
    issuers: { Quote: rawQuoteIssuer },
    brandIn,
    brandOut,
  } = await E(zoe).getTerms(aggregator.instance);
  const timerBrand = await E(oracleTimer).getTimerBrand();
  /** @type {Issuer<'set'>} */
  const quoteIssuer = rawQuoteIssuer;

  const price1000 = await makeFakePriceOracle(1000n);
  const price1300 = await makeFakePriceOracle(1300n);
  const price800 = await makeFakePriceOracle(800n);
  const pa = E(aggregator.publicFacet).getPriceAuthority();

  const mutableQuoteWhenGTE = E(pa).mutableQuoteWhenGTE(
    AmountMath.make(brandIn, 37n),
    AmountMath.make(brandOut, 1183n * 37n),
  );

  /** @type {PriceQuote | undefined} */
  let abovePriceQuote;
  const abovePriceQuoteP = E(mutableQuoteWhenGTE).getPromise();
  t.notThrowsAsync(abovePriceQuoteP.then(result => (abovePriceQuote = result)));

  const mutableQuoteWhenLTE = E(pa).mutableQuoteWhenLTE(
    AmountMath.make(brandIn, 29n),
    AmountMath.make(brandOut, 974n * 29n),
  );

  /** @type {PriceQuote | undefined} */
  let belowPriceQuote;
  const belowPriceQuoteP = E(mutableQuoteWhenLTE).getPromise();
  t.notThrowsAsync(belowPriceQuoteP.then(result => (belowPriceQuote = result)));

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
  t.deepEqual(aboveTimestamp, TimeMath.coerceTimestampRecord(4n, timerBrand));
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
  t.deepEqual(belowTimestamp, TimeMath.coerceTimestampRecord(6n, timerBrand));
  t.is(belowIn.value, 29n);
  t.is(belowOut.value / 29n, 960n);
});

test('mutableQuoteWhen with update', async t => {
  const { makeFakePriceOracle, zoe } = t.context;

  const aggregator = await t.context.makeMedianAggregator();

  const {
    timer: oracleTimer,
    issuers: { Quote: rawQuoteIssuer },
    brandIn,
    brandOut,
  } = await E(zoe).getTerms(aggregator.instance);
  const toTS = ts =>
    TimeMath.coerceTimestampRecord(ts, oracleTimer.getTimerBrand());
  /** @type {Issuer<'set'>} */
  const quoteIssuer = rawQuoteIssuer;

  const price1200 = await makeFakePriceOracle(1200n);
  const pa = E(aggregator.publicFacet).getPriceAuthority();

  const mutableQuoteWhenGTE = E(pa).mutableQuoteWhenGTE(
    AmountMath.make(brandIn, 25n),
    AmountMath.make(brandOut, 1240n * 25n),
  );

  /** @type {PriceQuote | undefined} */
  let abovePriceQuote;
  const abovePriceQuoteP = E(mutableQuoteWhenGTE).getPromise();
  t.notThrowsAsync(abovePriceQuoteP.then(result => (abovePriceQuote = result)));

  await E(aggregator.creatorFacet).initOracle(price1200.instance, {
    increment: 10n,
  });

  await E(oracleTimer).tick();

  await E(mutableQuoteWhenGTE).updateLevel(
    AmountMath.make(brandIn, 25n),
    AmountMath.make(brandOut, 1245n * 25n),
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
  t.deepEqual(aboveTimestamp, toTS(4n));
  t.is(aboveIn.value, 25n);
  t.is(aboveOut.value / 25n, 1250n);
});

test('cancel mutableQuoteWhen', async t => {
  const { makeFakePriceOracle, zoe } = t.context;

  const aggregator = await t.context.makeMedianAggregator();

  const {
    timer: oracleTimer,
    brandIn,
    brandOut,
  } = await E(zoe).getTerms(aggregator.instance);

  const price1200 = await makeFakePriceOracle(1200n);
  const pa = E(aggregator.publicFacet).getPriceAuthority();

  const mutableQuoteWhenGTE = E(pa).mutableQuoteWhenGTE(
    AmountMath.make(brandIn, 25n),
    AmountMath.make(brandOut, 1240n * 25n),
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

test('storage keys', async t => {
  const { publicFacet } = await t.context.makeMedianAggregator();

  t.is(
    await E(E(publicFacet).getSubscriber()).getPath(),
    'mockChainStorageRoot.priceAggregator.ATOM-USD_price_feed',
  );
});

test('storage', async t => {
  const { zoe, makeFakePriceOracle, makeMedianAggregator } = t.context;
  const aggregator = await makeMedianAggregator(1n);
  const { timer: oracleTimer } = await E(zoe).getTerms(aggregator.instance);

  const price1000 = await makeFakePriceOracle(1000n);
  await E(aggregator.creatorFacet).initOracle(price1000.instance, {
    increment: 10n,
  });
  await E(oracleTimer).tick();
  t.deepEqual(
    aggregator.mockStorageRoot.getBody(
      'mockChainStorageRoot.priceAggregator.ATOM-USD_price_feed',
    ),
    {
      amountIn: { brand: Far('$ATOM brand'), value: 1n },
      amountOut: { brand: Far('$USD brand'), value: 1020n },
      timer: Far('ManualTimer'),
      timestamp: { timerBrand: Far('timerBrand'), absValue: 1n },
    },
  );
});
