import '@agoric/zoe/exported.js';
import { test as unknownTest } from '@agoric/zoe/tools/prepare-test-env-ava.js';

import { AmountMath, makeIssuerKit } from '@agoric/ertp';
import { allValues, makeTracer, objectMap } from '@agoric/internal';
import { unsafeMakeBundleCache } from '@agoric/swingset-vat/tools/bundleTool.js';
import {
  ceilMultiplyBy,
  makeRatio,
  makeRatioFromAmounts,
} from '@agoric/zoe/src/contractSupport/index.js';
import { eventLoopIteration } from '@agoric/internal/src/testing-utils.js';
import { buildManualTimer } from '@agoric/swingset-vat/tools/manual-timer.js';
import { E } from '@endo/eventual-send';
import { deeplyFulfilled } from '@endo/marshal';
import { TimeMath } from '@agoric/time';
import { assertPayoutAmount } from '@agoric/zoe/test/zoeTestHelpers.js';
import { multiplyBy } from '@agoric/zoe/src/contractSupport/ratio.js';
import { NonNullish } from '@agoric/assert';

import {
  SECONDS_PER_DAY as ONE_DAY,
  SECONDS_PER_HOUR as ONE_HOUR,
  SECONDS_PER_MINUTE as ONE_MINUTE,
  SECONDS_PER_WEEK as ONE_WEEK,
  startVaultFactory,
} from '../../src/proposals/econ-behaviors.js';
import '../../src/vaultFactory/types-ambient.js';
import {
  reserveInitialState,
  subscriptionTracker,
  vaultManagerMetricsTracker,
} from '../metrics.js';
import { setUpZoeForTest, withAmountUtils } from '../supports.js';
import {
  BASIS_POINTS,
  defaultParamValues,
  getRunFromFaucet,
  legacyOfferResult,
  setupElectorateReserveAndAuction,
} from './vaultFactoryUtils.js';

/**
 * @typedef {Record<string, any> & {
 *   aeth: IssuerKit & import('../supports.js').AmountUtils;
 *   run: IssuerKit & import('../supports.js').AmountUtils;
 *   bundleCache: Awaited<ReturnType<typeof unsafeMakeBundleCache>>;
 *   rates: VaultManagerParamValues;
 *   interestTiming: InterestTiming;
 *   zoe: ZoeService;
 * }} Context
 */

/** @type {import('ava').TestFn<Context>} */

const test = unknownTest;

const contractRoots = {
  faucet: './test/vaultFactory/faucet.js',
  VaultFactory: './src/vaultFactory/vaultFactory.js',
  reserve: './src/reserve/assetReserve.js',
  auctioneer: './src/auction/auctioneer.js',
};

/** @typedef {import('../../src/vaultFactory/vaultFactory').VaultFactoryContract} VFC */

const trace = makeTracer('TestST', false);

// Define locally to test that vaultFactory uses these values
export const Phase = /** @type {const} */ ({
  ACTIVE: 'active',
  LIQUIDATING: 'liquidating',
  CLOSED: 'closed',
  LIQUIDATED: 'liquidated',
  TRANSFER: 'transfer',
});

test.before(async t => {
  const { zoe, feeMintAccessP } = await setUpZoeForTest();
  const stableIssuer = await E(zoe).getFeeIssuer();
  const stableBrand = await E(stableIssuer).getBrand();
  // @ts-expect-error missing mint
  const run = withAmountUtils({ issuer: stableIssuer, brand: stableBrand });
  const aeth = withAmountUtils(
    makeIssuerKit('aEth', 'nat', { decimalPlaces: 6 }),
  );

  const bundleCache = await unsafeMakeBundleCache('./bundles/'); // package-relative
  // note that the liquidation might be a different bundle name
  const bundles = await allValues({
    faucet: bundleCache.load(contractRoots.faucet, 'faucet'),
    VaultFactory: bundleCache.load(contractRoots.VaultFactory, 'VaultFactory'),
    reserve: bundleCache.load(contractRoots.reserve, 'reserve'),
    auctioneer: bundleCache.load(contractRoots.auctioneer, 'auction'),
  });
  const installation = objectMap(bundles, bundle => E(zoe).install(bundle));

  const feeMintAccess = await feeMintAccessP;
  const contextPs = {
    zoe,
    feeMintAccess,
    bundles,
    installation,
    electorateTerms: undefined,
    interestTiming: {
      chargingPeriod: 2n,
      recordingPeriod: 6n,
    },
    minInitialDebt: 50n,
    referencedUi: undefined,
    rates: defaultParamValues(run.brand),
  };
  const frozenCtx = await deeplyFulfilled(harden(contextPs));
  t.context = {
    ...frozenCtx,
    bundleCache,
    aeth,
    run,
  };
  trace(t, 'CONTEXT');
});

/**
 * NOTE: called separately by each test so zoe/priceAuthority don't interfere
 *
 * @param {import('ava').ExecutionContext<Context>} t
 * @param {NatValue[] | Ratio} priceOrList
 * @param {Amount | undefined} unitAmountIn
 * @param {import('@agoric/time/src/types').TimerService} timer
 * @param {RelativeTime} quoteInterval
 * @param {bigint} stableInitialLiquidity
 * @param {Partial<import('../../src/auction/params.js').AuctionParams>} [auctionParams]
 */
const setupServices = async (
  t,
  priceOrList,
  unitAmountIn,
  timer = buildManualTimer(),
  quoteInterval = 1n,
  stableInitialLiquidity,
  auctionParams = {},
) => {
  const {
    zoe,
    run,
    aeth,
    interestTiming,
    minInitialDebt,
    referencedUi,
    rates,
  } = t.context;
  t.context.timer = timer;

  const { space } = await setupElectorateReserveAndAuction(
    t,
    // @ts-expect-error inconsistent types with withAmountUtils
    run,
    aeth,
    priceOrList,
    quoteInterval,
    unitAmountIn,
    auctionParams,
  );

  const { consume } = space;

  const {
    installation: { produce: iProduce },
  } = space;
  iProduce.VaultFactory.resolve(t.context.installation.VaultFactory);
  iProduce.liquidate.resolve(t.context.installation.liquidate);
  await startVaultFactory(
    space,
    { interestTiming, options: { referencedUi } },
    minInitialDebt,
  );

  const governorCreatorFacet = E.get(
    consume.vaultFactoryKit,
  ).governorCreatorFacet;
  /** @type {Promise<VaultFactoryCreatorFacet>} */
  const vaultFactoryCreatorFacetP = E.get(consume.vaultFactoryKit).creatorFacet;
  const reserveCreatorFacet = E.get(consume.reserveKit).creatorFacet;
  const reservePublicFacet = E.get(consume.reserveKit).publicFacet;
  // XXX just pass through reserveKit from the space
  const reserveKit = { reserveCreatorFacet, reservePublicFacet };

  // Add a vault that will lend on aeth collateral
  /** @type {Promise<VaultManager>} */
  const aethVaultManagerP = E(vaultFactoryCreatorFacetP).addVaultType(
    aeth.issuer,
    'AEth',
    rates,
  );
  /** @typedef {import('../../src/proposals/econ-behaviors.js').AuctioneerKit} AuctioneerKit */
  /** @typedef {import('@agoric/zoe/tools/manualPriceAuthority.js').ManualPriceAuthority} ManualPriceAuthority */
  /**
   * @type {[
   *   any,
   *   VaultFactoryCreatorFacet,
   *   VFC['publicFacet'],
   *   VaultManager,
   *   AuctioneerKit,
   *   ManualPriceAuthority,
   *   CollateralManager,
   * ]}
   */
  const [
    governorInstance,
    vaultFactory, // creator
    vfPublic,
    aethVaultManager,
    auctioneerKit,
    priceAuthority,
    aethCollateralManager,
  ] = await Promise.all([
    E(consume.agoricNames).lookup('instance', 'VaultFactoryGovernor'),
    vaultFactoryCreatorFacetP,
    E.get(consume.vaultFactoryKit).publicFacet,
    aethVaultManagerP,
    consume.auctioneerKit,
    /** @type {Promise<ManualPriceAuthority>} */ (consume.priceAuthority),
    E(aethVaultManagerP).getPublicFacet(),
  ]);
  trace(t, 'pa', {
    governorInstance,
    vaultFactory,
    vfPublic,
    priceAuthority: !!priceAuthority,
  });

  const { g, v } = {
    g: {
      governorInstance,
      governorPublicFacet: E(zoe).getPublicFacet(governorInstance),
      governorCreatorFacet,
    },
    v: {
      vaultFactory,
      vfPublic,
      aethVaultManager,
      aethCollateralManager,
    },
  };

  await E(auctioneerKit.creatorFacet).addBrand(aeth.issuer, 'Aeth');

  return {
    zoe,
    governor: g,
    vaultFactory: v,
    runKit: { issuer: run.issuer, brand: run.brand },
    priceAuthority,
    reserveKit,
    auctioneerKit,
  };
};

const setClockAndAdvanceNTimes = async (timer, times, start, incr = 1n) => {
  let currentTime = start;
  // first time through is at START, then n TIMES more plus INCR
  for (let i = 0; i <= times; i += 1) {
    trace('advancing clock to ', currentTime);
    await timer.advanceTo(TimeMath.absValue(currentTime));
    await eventLoopIteration();
    currentTime = TimeMath.addAbsRel(currentTime, TimeMath.relValue(incr));
  }
  return currentTime;
};

const bid = async (t, zoe, auctioneerKit, aeth, bidAmount, desired) => {
  const bidderSeat = await E(zoe).offer(
    E(auctioneerKit.publicFacet).makeBidInvitation(aeth.brand),
    harden({ give: { Bid: bidAmount } }),
    harden({ Bid: getRunFromFaucet(t, bidAmount.value) }),
    { maxBuy: desired, offerPrice: makeRatioFromAmounts(bidAmount, desired) },
  );
  return bidderSeat;
};

const bidPrice = async (
  t,
  zoe,
  auctioneerKit,
  aeth,
  bidAmount,
  desired,
  offerPrice,
) => {
  const bidderSeat = await E(zoe).offer(
    E(auctioneerKit.publicFacet).makeBidInvitation(aeth.brand),
    harden({ give: { Bid: bidAmount } }),
    harden({ Bid: getRunFromFaucet(t, bidAmount.value) }),
    { maxBuy: desired, offerPrice },
  );
  return bidderSeat;
};

const bidDiscount = async (
  t,
  zoe,
  auctioneerKit,
  aeth,
  bidAmount,
  desired,
  scale,
) => {
  const bidderSeat = await E(zoe).offer(
    E(auctioneerKit.publicFacet).makeBidInvitation(aeth.brand),
    harden({ give: { Bid: bidAmount } }),
    harden({ Bid: getRunFromFaucet(t, bidAmount.value) }),
    { maxBuy: desired, offerBidScaling: scale },
  );
  return bidderSeat;
};

// Calculate the nominalStart time (when liquidations happen), and the priceLock
// time (when prices are locked). Advance the clock to the priceLock time, then
// to the nominal start time. return the nominal start time and the auction
// start time, so the caller can check on liquidations in process before
// advancing the clock.
const startAuctionClock = async (auctioneerKit, manualTimer) => {
  const schedule = await E(auctioneerKit.creatorFacet).getSchedule();
  const priceDelay = await E(auctioneerKit.publicFacet).getPriceLockPeriod();
  const { startTime, startDelay } = schedule.nextAuctionSchedule;
  const nominalStart = TimeMath.subtractAbsRel(startTime, startDelay);
  const priceLockTime = TimeMath.subtractAbsRel(nominalStart, priceDelay);
  await manualTimer.advanceTo(TimeMath.absValue(priceLockTime));
  await eventLoopIteration();

  await manualTimer.advanceTo(TimeMath.absValue(nominalStart));
  await eventLoopIteration();
  return { startTime, time: nominalStart };
};

const assertBidderPayout = async (t, bidderSeat, run, curr, aeth, coll) => {
  const bidderResult = await E(bidderSeat).getOfferResult();
  t.is(bidderResult, 'Your bid has been accepted');
  const payouts = await E(bidderSeat).getPayouts();
  const { Collateral: bidderCollateral, Bid: bidderBid } = payouts;
  (!bidderBid && curr === 0n) ||
    (await assertPayoutAmount(t, run.issuer, bidderBid, run.make(curr)));
  (!bidderCollateral && coll === 0n) ||
    (await assertPayoutAmount(
      t,
      aeth.issuer,
      bidderCollateral,
      aeth.make(coll),
      'amount ',
    ));
};

test('price drop', async t => {
  const { zoe, aeth, run, rates } = t.context;

  const manualTimer = buildManualTimer();
  // The price starts at 5 RUN per Aeth. The loan will start with 400 Aeth
  // collateral and a loan of 1600, which is a CR of 1.25. After the price falls
  // to 4, the loan will get liquidated.
  t.context.interestTiming = {
    chargingPeriod: 2n,
    recordingPeriod: 10n,
  };

  const services = await setupServices(
    t,
    makeRatio(50n, run.brand, 10n, aeth.brand),
    aeth.make(400n),
    manualTimer,
    undefined,
    500n,
    { StartFrequency: ONE_HOUR },
  );

  const {
    vaultFactory: { vaultFactory, aethCollateralManager },
    priceAuthority,
    reserveKit: { reserveCreatorFacet, reservePublicFacet },
    auctioneerKit,
  } = services;
  const metricsTopic = await E.get(E(reservePublicFacet).getPublicTopics())
    .metrics;
  const m = await subscriptionTracker(t, metricsTopic);

  await m.assertInitial(reserveInitialState(run.makeEmpty()));

  await E(reserveCreatorFacet).addIssuer(aeth.issuer, 'Aeth');

  const collateralAmount = aeth.make(400n);
  const wantMinted = run.make(1600n);
  /** @type {UserSeat<VaultKit>} */

  const vaultSeat = await E(zoe).offer(
    await E(aethCollateralManager).makeVaultInvitation(),
    harden({
      give: { Collateral: collateralAmount },
      want: { Minted: wantMinted },
    }),
    harden({
      Collateral: aeth.mint.mintPayment(collateralAmount),
    }),
  );
  trace(t, 'vault made', wantMinted);

  // A bidder places a bid //////////////////////////
  const bidAmount = run.make(2000n);
  const desired = aeth.make(400n);
  const bidderSeat = await bid(t, zoe, auctioneerKit, aeth, bidAmount, desired);

  const {
    vault,
    publicNotifiers: { vault: vaultNotifier },
  } = await legacyOfferResult(vaultSeat);
  trace(t, 'offer result', vault);
  const debtAmount = await E(vault).getCurrentDebt();
  const fee = ceilMultiplyBy(wantMinted, rates.mintFee);
  t.deepEqual(
    debtAmount,
    AmountMath.add(wantMinted, fee),
    'borrower Minted amount does not match',
  );

  let notification = await E(vaultNotifier).getUpdateSince();
  trace(t, 'got notification', notification);

  t.is(notification.value.vaultState, Phase.ACTIVE);
  t.deepEqual((await notification.value).debtSnapshot, {
    debt: AmountMath.add(wantMinted, fee),
    interest: makeRatio(100n, run.brand),
  });
  const { Minted: lentAmount } = await E(vaultSeat).getFinalAllocation();
  t.truthy(AmountMath.isEqual(lentAmount, wantMinted), 'received 470 Minted');
  t.deepEqual(
    await E(vault).getCollateralAmount(),
    aeth.make(400n),
    'vault holds 11 Collateral',
  );
  trace(t, 'pa2', priceAuthority);

  await priceAuthority.setPrice(makeRatio(40n, run.brand, 10n, aeth.brand));
  trace(t, 'price dropped a little');
  notification = await E(vaultNotifier).getUpdateSince();
  t.is(notification.value.vaultState, Phase.ACTIVE);

  const { startTime, time } = await startAuctionClock(
    auctioneerKit,
    manualTimer,
  );
  let currentTime = time;

  notification = await E(vaultNotifier).getUpdateSince();
  t.is(notification.value.vaultState, Phase.LIQUIDATING);

  t.deepEqual(
    await E(vault).getCollateralAmount(),
    aeth.makeEmpty(),
    'Collateral consumed while liquidating',
  );
  t.deepEqual(
    await E(vault).getCurrentDebt(),
    AmountMath.add(wantMinted, run.make(80n)),
    'Debt remains while liquidating',
  );

  currentTime = await setClockAndAdvanceNTimes(manualTimer, 2, startTime, 2n);
  trace(`advanced time to `, currentTime);

  notification = await E(vaultNotifier).getUpdateSince();
  t.is(notification.value.vaultState, Phase.LIQUIDATED);

  trace(t, 'debt gone');
  t.truthy(await E(vaultSeat).hasExited());

  const debtAmountAfter = await E(vault).getCurrentDebt();

  const finalNotification = await E(vaultNotifier).getUpdateSince();
  t.is(finalNotification.value.vaultState, Phase.LIQUIDATED);

  t.deepEqual(finalNotification.value.locked, aeth.make(0n));
  t.is(debtAmountAfter.value, 0n);

  t.deepEqual(await E(vaultFactory).getRewardAllocation(), {
    Minted: run.make(80n),
  });

  /** @type {UserSeat<string>} */
  const closeSeat = await E(zoe).offer(E(vault).makeCloseInvitation());
  await E(closeSeat).getOfferResult();

  const closeProceeds = await E(closeSeat).getPayouts();
  const collProceeds = await aeth.issuer.getAmountOf(closeProceeds.Collateral);

  // Vault Holder got nothing
  t.falsy(closeProceeds.Minted);
  t.deepEqual(collProceeds, aeth.make(0n));
  t.deepEqual(await E(vault).getCollateralAmount(), aeth.makeEmpty());

  //  Bidder bought 400 Aeth
  await assertBidderPayout(t, bidderSeat, run, 320n, aeth, 400n);

  await m.assertLike({
    allocations: {
      Aeth: undefined,
      Fee: undefined,
    },
  });
});

test('price falls precipitously', async t => {
  const { zoe, aeth, run, rates } = t.context;
  t.context.interestTiming = {
    chargingPeriod: 2n,
    recordingPeriod: 10n,
  };

  // The borrower will deposit 4 Aeth, and ask to borrow 500 Minted. The
  // PriceAuthority's initial quote is 180. The max loan on 4 Aeth would be 600
  // (to make the margin 20%).
  // The price falls to 130, so the loan will get liquidated. At that point, 4
  // Aeth is worth 520, with a 5% margin, 546 is required. The auction sells at
  // 85%, so the borrower gets something back

  const manualTimer = buildManualTimer();
  const services = await setupServices(
    t,
    makeRatio(600n, run.brand, 4n, aeth.brand),
    aeth.make(900n),
    manualTimer,
    undefined,
    500n,
    { StartFrequency: ONE_HOUR },
  );
  // we start with time=0, price=2200

  const { vaultFactory, aethCollateralManager } = services.vaultFactory;

  const {
    reserveKit: { reserveCreatorFacet, reservePublicFacet },
    auctioneerKit,
    priceAuthority,
  } = services;
  await E(reserveCreatorFacet).addIssuer(aeth.issuer, 'Aeth');

  // Create a loan for 500 Minted with 4 aeth collateral
  const collateralAmount = aeth.make(4n);
  const wantMinted = run.make(500n);
  /** @type {UserSeat<VaultKit>} */
  const userSeat = await E(zoe).offer(
    await E(aethCollateralManager).makeVaultInvitation(),
    harden({
      give: { Collateral: collateralAmount },
      want: { Minted: wantMinted },
    }),
    harden({
      Collateral: aeth.mint.mintPayment(collateralAmount),
    }),
  );

  // A bidder places a bid //////////////////////////
  const bidAmount = run.make(500n);
  const desired = aeth.make(4n);
  const bidderSeat = await bid(t, zoe, auctioneerKit, aeth, bidAmount, desired);

  const {
    vault,
    publicNotifiers: { vault: vaultNotifier },
  } = await legacyOfferResult(userSeat);
  const debtAmount = await E(vault).getCurrentDebt();
  const fee = ceilMultiplyBy(run.make(500n), rates.mintFee);
  t.deepEqual(
    debtAmount,
    AmountMath.add(wantMinted, fee),
    'borrower owes 525 Minted',
  );

  const { Minted: lentAmount } = await E(userSeat).getFinalAllocation();
  t.deepEqual(lentAmount, wantMinted, 'received 470 Minted');
  t.deepEqual(
    await E(vault).getCollateralAmount(),
    aeth.make(4n),
    'vault holds 4 Collateral',
  );

  priceAuthority.setPrice(makeRatio(130n, run.brand, 1n, aeth.brand));
  await eventLoopIteration();

  const { startTime, time } = await startAuctionClock(
    auctioneerKit,
    manualTimer,
  );
  const currentTime = time;
  trace('time advanced to ', currentTime);

  const assertDebtIs = async value => {
    const debt = await E(vault).getCurrentDebt();
    t.is(
      debt.value,
      BigInt(value),
      `Expected debt ${debt.value} to be ${value}`,
    );
  };

  const metricsTopic = await E.get(E(reservePublicFacet).getPublicTopics())
    .metrics;
  const m = await subscriptionTracker(t, metricsTopic);
  await m.assertInitial(reserveInitialState(run.makeEmpty()));
  await assertDebtIs(debtAmount.value);

  await setClockAndAdvanceNTimes(manualTimer, 2, startTime, 2n);

  t.deepEqual(
    await E(vault).getCurrentDebt(),
    run.makeEmpty(),
    `Expected debt after liquidation to be zero`,
  );

  t.deepEqual(await E(vaultFactory).getRewardAllocation(), {
    Minted: run.make(25n),
  });

  t.deepEqual(
    await E(vault).getCollateralAmount(),
    aeth.makeEmpty(),
    'Collateral reduced after liquidation',
  );
  t.deepEqual(
    await E(vault).getCollateralAmount(),
    aeth.makeEmpty(),
    'Excess collateral not returned due to shortfall',
  );

  const finalNotification = await E(vaultNotifier).getUpdateSince();
  t.is(finalNotification.value.vaultState, Phase.LIQUIDATED);
  // vault holds no debt after liquidation
  t.is(finalNotification.value.debtSnapshot.debt.value, 0n);

  /** @type {UserSeat<string>} */
  const closeSeat = await E(zoe).offer(E(vault).makeCloseInvitation());
  // closing with 64n Minted remaining in debt
  await E(closeSeat).getOfferResult();

  const closeProceeds = await E(closeSeat).getPayouts();
  const collProceeds = await aeth.issuer.getAmountOf(closeProceeds.Collateral);

  t.falsy(closeProceeds.Minted);
  t.deepEqual(collProceeds, aeth.make(0n));
  t.deepEqual(await E(vault).getCollateralAmount(), aeth.makeEmpty());

  //  Bidder bought 4 Aeth
  await assertBidderPayout(t, bidderSeat, run, 58n, aeth, 4n);
});

// We'll make two loans, and trigger liquidation of one via price changes, and
// the other via interest charges. The interest rate is 40%. The liquidation
// margin is 103%. The priceAuthority will initially quote 10:1 Run:Aeth, and
// drop to 7:1. Both loans will initially be over collateralized 100%. Alice
// will withdraw enough of the overage that she'll get caught when prices drop.
// Bob will be charged interest, which will trigger liquidation.
test('liquidate two loans', async t => {
  const { zoe, aeth, run, rates: defaultRates } = t.context;

  // Add a vaultManager with 10000 aeth collateral at a 200 aeth/Minted rate
  const rates = harden({
    ...defaultRates,
    // charge 40% interest / year
    interestRate: run.makeRatio(40n),
    liquidationMargin: run.makeRatio(103n),
  });
  t.context.rates = rates;

  // Interest is charged daily, and auctions are every week, so we'll charge
  // interest a few times before the second auction.
  t.context.interestTiming = {
    chargingPeriod: ONE_DAY,
    recordingPeriod: ONE_DAY,
  };

  const manualTimer = buildManualTimer();
  const services = await setupServices(
    t,
    makeRatio(100n, run.brand, 10n, aeth.brand),
    aeth.make(1n),
    manualTimer,
    ONE_WEEK,
    500n,
  );

  const {
    vaultFactory: { aethVaultManager, aethCollateralManager },
    priceAuthority,
    reserveKit: { reserveCreatorFacet, reservePublicFacet },
    auctioneerKit,
  } = services;
  await E(reserveCreatorFacet).addIssuer(aeth.issuer, 'Aeth');

  const metricsTopic = await E.get(E(reservePublicFacet).getPublicTopics())
    .metrics;
  const m = await subscriptionTracker(t, metricsTopic);
  await m.assertInitial(reserveInitialState(run.makeEmpty()));
  let shortfallBalance = 0n;

  const cm = await E(aethVaultManager).getPublicFacet();
  const aethVaultMetrics = await vaultManagerMetricsTracker(t, cm);
  await aethVaultMetrics.assertInitial({
    // present
    numActiveVaults: 0,
    numLiquidatingVaults: 0,
    totalCollateral: aeth.make(0n),
    totalDebt: run.make(0n),
    retainedCollateral: aeth.make(0n),

    // running
    numLiquidationsCompleted: 0,
    numLiquidationsAborted: 0,
    totalOverageReceived: run.make(0n),
    totalProceedsReceived: run.make(0n),
    totalCollateralSold: aeth.make(0n),
    liquidatingCollateral: aeth.make(0n),
    liquidatingDebt: run.make(0n),
    totalShortfallReceived: run.make(0n),
    lockedQuote: null,
  });

  // initial loans /////////////////////////////////////

  // ALICE ////////////////////////////////////////////

  // Create a loan for Alice for 5000 Minted with 1000 aeth collateral
  // ratio is 4:1
  const aliceCollateralAmount = aeth.make(1000n);
  const aliceWantMinted = run.make(5000n);
  /** @type {UserSeat<VaultKit>} */
  const aliceVaultSeat = await E(zoe).offer(
    await E(aethCollateralManager).makeVaultInvitation(),
    harden({
      give: { Collateral: aliceCollateralAmount },
      want: { Minted: aliceWantMinted },
    }),
    harden({
      Collateral: aeth.mint.mintPayment(aliceCollateralAmount),
    }),
  );
  const {
    vault: aliceVault,
    publicNotifiers: { vault: aliceNotifier },
  } = await legacyOfferResult(aliceVaultSeat);

  const aliceDebtAmount = await E(aliceVault).getCurrentDebt();
  const fee = ceilMultiplyBy(aliceWantMinted, rates.mintFee);
  const aliceRunDebtLevel = AmountMath.add(aliceWantMinted, fee);

  t.deepEqual(
    aliceDebtAmount,
    aliceRunDebtLevel,
    'vault lent 5000 Minted + fees',
  );
  const { Minted: aliceLentAmount } =
    await E(aliceVaultSeat).getFinalAllocation();
  const aliceProceeds = await E(aliceVaultSeat).getPayouts();
  t.deepEqual(aliceLentAmount, aliceWantMinted, 'received 5000 Minted');
  trace(t, 'alice vault');

  const aliceRunLent = await aliceProceeds.Minted;
  t.truthy(
    AmountMath.isEqual(
      await E(run.issuer).getAmountOf(aliceRunLent),
      aliceWantMinted,
    ),
  );

  let aliceUpdate = await E(aliceNotifier).getUpdateSince();
  t.deepEqual(aliceUpdate.value.debtSnapshot.debt, aliceRunDebtLevel);

  let totalDebt = 5250n;
  await aethVaultMetrics.assertChange({
    numActiveVaults: 1,
    totalCollateral: { value: 1000n },
    totalDebt: { value: totalDebt },
  });

  // BOB //////////////////////////////////////////////

  // Create a loan for Bob for 630 Minted with 100 Aeth collateral
  const bobCollateralAmount = aeth.make(100n);
  const bobWantMinted = run.make(630n);
  /** @type {UserSeat<VaultKit>} */
  const bobVaultSeat = await E(zoe).offer(
    await E(aethCollateralManager).makeVaultInvitation(),
    harden({
      give: { Collateral: bobCollateralAmount },
      want: { Minted: bobWantMinted },
    }),
    harden({
      Collateral: aeth.mint.mintPayment(bobCollateralAmount),
    }),
  );
  const {
    vault: bobVault,
    publicNotifiers: { vault: bobNotifier },
  } = await legacyOfferResult(bobVaultSeat);

  const bobDebtAmount = await E(bobVault).getCurrentDebt();
  const bobFee = ceilMultiplyBy(bobWantMinted, rates.mintFee);
  const bobRunDebtLevel = AmountMath.add(bobWantMinted, bobFee);

  t.deepEqual(bobDebtAmount, bobRunDebtLevel, 'vault lent 5000 Minted + fees');
  const { Minted: bobLentAmount } = await E(bobVaultSeat).getFinalAllocation();
  const bobProceeds = await E(bobVaultSeat).getPayouts();
  t.deepEqual(bobLentAmount, bobWantMinted, 'received 5000 Minted');
  trace(t, 'bob vault');

  const bobRunLent = await bobProceeds.Minted;
  t.truthy(
    AmountMath.isEqual(
      await E(run.issuer).getAmountOf(bobRunLent),
      bobWantMinted,
    ),
  );

  let bobUpdate = await E(bobNotifier).getUpdateSince();
  t.deepEqual(bobUpdate.value.debtSnapshot.debt, bobRunDebtLevel);
  totalDebt += 630n + 32n;
  await aethVaultMetrics.assertChange({
    numActiveVaults: 2,
    totalCollateral: { value: 1100n },
    totalDebt: { value: totalDebt },
  });

  // reduce collateral  /////////////////////////////////////

  // Alice reduce collateral by 300. That leaves her at 700 * 10 > 1.05 * 5000.
  // Prices will drop from 10 to 7, she'll be liquidated: 700 * 7 < 1.05 * 5000.
  const collateralDecrement = aeth.make(300n);
  const aliceReduceCollateralSeat = await E(zoe).offer(
    E(aliceVault).makeAdjustBalancesInvitation(),
    harden({
      want: { Collateral: collateralDecrement },
    }),
  );
  await E(aliceReduceCollateralSeat).getOfferResult();

  const { Collateral: aliceWithdrawnAeth } = await E(
    aliceReduceCollateralSeat,
  ).getFinalAllocation();
  const proceeds4 = await E(aliceReduceCollateralSeat).getPayouts();
  t.deepEqual(aliceWithdrawnAeth, aeth.make(300n));

  const collateralWithdrawn = await proceeds4.Collateral;
  t.truthy(
    AmountMath.isEqual(
      await E(aeth.issuer).getAmountOf(collateralWithdrawn),
      collateralDecrement,
    ),
  );

  aliceUpdate = await E(aliceNotifier).getUpdateSince(aliceUpdate.updateCount);
  t.deepEqual(aliceUpdate.value.debtSnapshot.debt, aliceRunDebtLevel);
  trace(t, 'alice reduce collateral');
  await aethVaultMetrics.assertChange({
    totalCollateral: { value: 800n },
  });

  await E(priceAuthority).setPrice(makeRatio(70n, run.brand, 10n, aeth.brand));
  trace(t, 'changed price to 7 RUN/Aeth');

  // A BIDDER places a BID //////////////////////////
  const bidAmount = run.make(10000n);
  const desired = aeth.make(800n);
  const bidderSeat = await bid(t, zoe, auctioneerKit, aeth, bidAmount, desired);

  const { startTime: start1, time: now1 } = await startAuctionClock(
    auctioneerKit,
    manualTimer,
  );
  let currentTime = now1;

  await aethVaultMetrics.assertChange({
    lockedQuote: makeRatioFromAmounts(
      aeth.make(1_000_000n),
      run.make(7_000_000n),
    ),
  });

  // expect Alice to be liquidated because her collateral is too low.
  aliceUpdate = await E(aliceNotifier).getUpdateSince(aliceUpdate.updateCount);
  trace(t, 'alice liquidating?', aliceUpdate.value.vaultState);
  t.is(aliceUpdate.value.vaultState, Phase.LIQUIDATING);

  currentTime = await setClockAndAdvanceNTimes(manualTimer, 2, start1, 2n);

  aliceUpdate = await E(aliceNotifier).getUpdateSince(aliceUpdate.updateCount);
  t.is(aliceUpdate.value.vaultState, Phase.LIQUIDATED);
  trace(t, 'alice liquidated');
  totalDebt += 36n;
  await aethVaultMetrics.assertChange({
    numActiveVaults: 1,
    numLiquidatingVaults: 1,
    totalDebt: { value: totalDebt },
    liquidatingCollateral: { value: 700n },
    liquidatingDebt: { value: 5282n },
    lockedQuote: null,
  });

  shortfallBalance += 137n;
  await m.assertChange({
    shortfallBalance: { value: shortfallBalance },
  });

  bobUpdate = await E(bobNotifier).getUpdateSince();
  t.is(bobUpdate.value.vaultState, Phase.ACTIVE);

  const { startTime: start2 } = await startAuctionClock(
    auctioneerKit,
    manualTimer,
  );

  totalDebt -= 5145n + shortfallBalance - 1n;
  await aethVaultMetrics.assertChange({
    liquidatingDebt: { value: 0n },
    liquidatingCollateral: { value: 0n },
    totalCollateral: { value: 100n },
    totalDebt: { value: totalDebt },
    numLiquidatingVaults: 0,
    numLiquidationsCompleted: 1,
    totalCollateralSold: { value: 700n },
    totalProceedsReceived: { value: 5145n },
    totalShortfallReceived: { value: shortfallBalance },
  });

  bobUpdate = await E(bobNotifier).getUpdateSince();
  t.is(bobUpdate.value.vaultState, Phase.ACTIVE);

  currentTime = await setClockAndAdvanceNTimes(manualTimer, 2, start2, 2n);

  await aethVaultMetrics.assertChange({
    lockedQuote: makeRatioFromAmounts(
      aeth.make(1_000_000n),
      run.make(7_000_000n),
    ),
  });

  // Bob's loan is now 777 Minted (including interest) on 100 Aeth, with the price
  // at 7. 100 * 7 > 1.05 * 777. When interest is charged again, Bob should get
  // liquidated.

  const { startTime: start3, time: now3 } = await startAuctionClock(
    auctioneerKit,
    manualTimer,
  );

  totalDebt += 6n;
  await aethVaultMetrics.assertChange({
    lockedQuote: null,
    totalDebt: { value: totalDebt },
  });
  totalDebt += 1n;
  await aethVaultMetrics.assertChange({
    lockedQuote: makeRatioFromAmounts(
      aeth.make(1_000_000n),
      run.make(7_000_000n),
    ),
    totalDebt: { value: totalDebt },
  });
  totalDebt += 6n;
  await aethVaultMetrics.assertChange({
    liquidatingDebt: { value: 680n },
    liquidatingCollateral: { value: 100n },
    totalDebt: { value: totalDebt },
    numActiveVaults: 0,
    numLiquidatingVaults: 1,
    lockedQuote: null,
  });

  currentTime = now3;
  currentTime = await setClockAndAdvanceNTimes(manualTimer, 2, start3, ONE_DAY);
  trace(t, 'finished auctions', currentTime);

  bobUpdate = await E(bobNotifier).getUpdateSince();
  t.is(bobUpdate.value.vaultState, Phase.LIQUIDATED);

  totalDebt = 0n;
  await aethVaultMetrics.assertChange({
    liquidatingDebt: { value: 0n },
    liquidatingCollateral: { value: 0n },
    totalCollateral: { value: 0n },
    totalDebt: { value: totalDebt },
    numLiquidatingVaults: 0,
    numLiquidationsCompleted: 2,
    totalCollateralSold: { value: 792n },
    totalProceedsReceived: { value: 5825n },
  });

  await E(bidderSeat).tryExit();
  //  Bidder bought 792 Aeth
  await assertBidderPayout(t, bidderSeat, run, 4175n, aeth, 792n);

  await m.assertLike({
    allocations: {
      Aeth: aeth.make(8n),
      Fee: undefined,
    },
  });
});

// We'll make two loans, and trigger one via interest charges, and not trigger
// liquidation of the other. The interest rate is 200% per annum. The liquidation margin is
// 103%. Alice's loan will initially be over collateralized 100%. Alice will
// withdraw enough of the overage that she's on the cusp of getting caught when
// prices drop. Bob won't be so overcollateralized. When he is charged interest
// it will trigger liquidation.
test('sell goods at auction', async t => {
  const { zoe, aeth, run, rates: defaultRates } = t.context;

  // Interest is charged daily, and auctions are every week, so we'll charge
  // interest a few times before the second auction.
  t.context.interestTiming = {
    chargingPeriod: ONE_DAY,
    recordingPeriod: ONE_DAY,
  };

  // Add a vaultManager with 10000 aeth collateral at a 200 aeth/Minted rate
  const rates = harden({
    ...defaultRates,
    // charge 200% interest
    interestRate: run.makeRatio(200n),
    liquidationMargin: run.makeRatio(103n),
  });
  t.context.rates = rates;

  // charge interest on every tick
  const manualTimer = buildManualTimer();
  const services = await setupServices(
    t,
    makeRatio(100n, run.brand, 10n, aeth.brand),
    aeth.make(1n),
    manualTimer,
    ONE_WEEK,
    500n,
    { StartFrequency: ONE_HOUR },
  );

  const {
    auctioneerKit,
    priceAuthority,
    reserveKit: { reserveCreatorFacet },
  } = services;
  await E(reserveCreatorFacet).addIssuer(aeth.issuer, 'Aeth');

  // initial loans /////////////////////////////////////
  const { aethCollateralManager } = services.vaultFactory;

  // Create a loan for Alice for 5000 Minted with 1000 aeth collateral
  const aliceCollateralAmount = aeth.make(1000n);
  const aliceWantMinted = run.make(5000n);
  /** @type {UserSeat<VaultKit>} */
  const aliceVaultSeat = await E(zoe).offer(
    await E(aethCollateralManager).makeVaultInvitation(),
    harden({
      give: { Collateral: aliceCollateralAmount },
      want: { Minted: aliceWantMinted },
    }),
    harden({
      Collateral: aeth.mint.mintPayment(aliceCollateralAmount),
    }),
  );
  const {
    vault: aliceVault,
    publicNotifiers: { vault: aliceNotifier },
  } = await legacyOfferResult(aliceVaultSeat);

  const aliceDebtAmount = await E(aliceVault).getCurrentDebt();
  const fee = ceilMultiplyBy(aliceWantMinted, rates.mintFee);
  const aliceRunDebtLevel = AmountMath.add(aliceWantMinted, fee);

  t.deepEqual(
    aliceDebtAmount,
    aliceRunDebtLevel,
    'vault lent 5000 Minted + fees',
  );
  const { Minted: aliceLentAmount } =
    await E(aliceVaultSeat).getFinalAllocation();
  const aliceProceeds = await E(aliceVaultSeat).getPayouts();
  t.deepEqual(aliceLentAmount, aliceWantMinted, 'received 5000 Minted');

  const aliceRunLent = await aliceProceeds.Minted;
  t.truthy(
    AmountMath.isEqual(
      await E(run.issuer).getAmountOf(aliceRunLent),
      run.make(5000n),
    ),
  );

  let aliceUpdate = await E(aliceNotifier).getUpdateSince();
  t.deepEqual(aliceUpdate.value.debtSnapshot.debt, aliceRunDebtLevel);

  // Create a loan for Bob for 740 Minted with 100 Aeth collateral
  const bobCollateralAmount = aeth.make(100n);
  const bobWantMinted = run.make(740n);
  /** @type {UserSeat<VaultKit>} */
  const bobVaultSeat = await E(zoe).offer(
    await E(aethCollateralManager).makeVaultInvitation(),
    harden({
      give: { Collateral: bobCollateralAmount },
      want: { Minted: bobWantMinted },
    }),
    harden({
      Collateral: aeth.mint.mintPayment(bobCollateralAmount),
    }),
  );
  const {
    vault: bobVault,
    publicNotifiers: { vault: bobNotifier },
  } = await legacyOfferResult(bobVaultSeat);

  const bobDebtAmount = await E(bobVault).getCurrentDebt();
  const bobFee = ceilMultiplyBy(bobWantMinted, rates.mintFee);
  const bobRunDebtLevel = AmountMath.add(bobWantMinted, bobFee);

  t.deepEqual(bobDebtAmount, bobRunDebtLevel, 'vault lent 5000 Minted + fees');
  const { Minted: bobLentAmount } = await E(bobVaultSeat).getFinalAllocation();
  const bobProceeds = await E(bobVaultSeat).getPayouts();
  t.deepEqual(bobLentAmount, bobWantMinted, 'received 5000 Minted');

  const bobRunLent = await bobProceeds.Minted;
  t.truthy(
    AmountMath.isEqual(
      await E(run.issuer).getAmountOf(bobRunLent),
      run.make(740n),
    ),
  );

  let bobUpdate = await E(bobNotifier).getUpdateSince();
  t.deepEqual(bobUpdate.value.debtSnapshot.debt, bobRunDebtLevel);

  // A BIDDER places a BID //////////////////////////
  const bidAmount = run.make(800n);
  const desired = aeth.make(100n);
  const bidderSeat = await bid(t, zoe, auctioneerKit, aeth, bidAmount, desired);

  // reduce collateral  /////////////////////////////////////

  // Alice reduce collateral by 300. That leaves her at 700 * 10 > 1.05 * 5000.
  // Prices will drop from 10 to 7, she'll be liquidated: 700 * 7 < 1.05 * 5000.
  const collateralDecrement = aeth.make(211n);
  const aliceReduceCollateralSeat = await E(zoe).offer(
    E(aliceVault).makeAdjustBalancesInvitation(),
    harden({
      want: { Collateral: collateralDecrement },
    }),
  );

  await E(aliceReduceCollateralSeat).getOfferResult();

  await E(aliceReduceCollateralSeat).getFinalAllocation();
  const proceeds4 = await E(aliceReduceCollateralSeat).getPayouts();

  const collateralWithdrawn = await proceeds4.Collateral;
  t.truthy(
    AmountMath.isEqual(
      await E(aeth.issuer).getAmountOf(collateralWithdrawn),
      collateralDecrement,
    ),
  );

  aliceUpdate = await E(aliceNotifier).getUpdateSince(aliceUpdate.updateCount);
  t.deepEqual(aliceUpdate.value.debtSnapshot.debt, aliceRunDebtLevel);
  t.is(aliceUpdate.value.vaultState, Phase.ACTIVE);

  // price falls
  await priceAuthority.setPrice(makeRatio(70n, run.brand, 10n, aeth.brand));
  await eventLoopIteration();

  // Bob's loan is now 777 Minted (including interest) on 100 Aeth, with the price
  // at 7. 100 * 7 > 1.05 * 777. When interest is charged again, Bob should get
  // liquidated.
  // Advance time to trigger interest collection.

  const { startTime } = await startAuctionClock(auctioneerKit, manualTimer);

  await setClockAndAdvanceNTimes(manualTimer, 2n, startTime, 2n);

  // price levels changed and interest was charged.

  bobUpdate = await E(bobNotifier).getUpdateSince(bobUpdate.updateCount);
  t.is(bobUpdate.value.vaultState, Phase.LIQUIDATED);

  // No change for Alice
  aliceUpdate = await E(aliceNotifier).getUpdateSince(); // can't use updateCount because there's no newer update
  t.is(aliceUpdate.value.vaultState, Phase.ACTIVE);

  //  Bidder bought 100 Aeth
  await assertBidderPayout(t, bidderSeat, run, 65n, aeth, 100n);
});

test('collect fees from loan', async t => {
  const { zoe, aeth, run, rates } = t.context;
  const manualTimer = buildManualTimer();

  t.context.interestTiming = {
    chargingPeriod: 2n,
    recordingPeriod: 10n,
  };

  const services = await setupServices(
    t,
    makeRatio(10n, run.brand, 1n, aeth.brand),
    aeth.make(1n),
    manualTimer,
    undefined,
    500n,
    { StartFrequency: ONE_HOUR },
  );

  const {
    vaultFactory: { aethVaultManager, aethCollateralManager },
    priceAuthority,
    reserveKit: { reserveCreatorFacet, reservePublicFacet },
    auctioneerKit,
  } = services;
  await E(reserveCreatorFacet).addIssuer(aeth.issuer, 'Aeth');

  const metricsTopic = await E.get(E(reservePublicFacet).getPublicTopics())
    .metrics;
  const reserveMetrics = await subscriptionTracker(t, metricsTopic);
  await reserveMetrics.assertInitial(reserveInitialState(run.makeEmpty()));

  const cm = await E(aethVaultManager).getPublicFacet();
  const aethVaultMetrics = await vaultManagerMetricsTracker(t, cm);
  await aethVaultMetrics.assertInitial({
    // present
    numActiveVaults: 0,
    numLiquidatingVaults: 0,
    totalCollateral: aeth.make(0n),
    totalDebt: run.make(0n),
    retainedCollateral: aeth.make(0n),

    // running
    numLiquidationsCompleted: 0,
    numLiquidationsAborted: 0,
    totalOverageReceived: run.make(0n),
    totalProceedsReceived: run.make(0n),
    totalCollateralSold: aeth.make(0n),
    liquidatingCollateral: aeth.make(0n),
    liquidatingDebt: run.make(0n),
    totalShortfallReceived: run.make(0n),
    lockedQuote: null,
  });

  // initial loans /////////////////////////////////////

  // ALICE ////////////////////////////////////////////

  // Create a loan for Alice for 5000 Minted with 1000 aeth collateral
  // ratio is 4:1
  const aliceCollateralAmount = aeth.make(1000n);
  const aliceWantMinted = run.make(5000n);
  /** @type {UserSeat<VaultKit>} */
  const aliceVaultSeat = await E(zoe).offer(
    await E(aethCollateralManager).makeVaultInvitation(),
    harden({
      give: { Collateral: aliceCollateralAmount },
      want: { Minted: aliceWantMinted },
    }),
    harden({
      Collateral: aeth.mint.mintPayment(aliceCollateralAmount),
    }),
  );
  const {
    vault: aliceVault,
    publicNotifiers: { vault: aliceNotifier },
  } = await legacyOfferResult(aliceVaultSeat);
  let notification = await E(aliceNotifier).getUpdateSince();
  t.is(notification.value.vaultState, Phase.ACTIVE);

  let totalCollateral = 1000n;
  const totalDebt = 5250n;
  await aethVaultMetrics.assertChange({
    numActiveVaults: 1,
    totalCollateral: { value: totalCollateral },
    totalDebt: { value: totalDebt },
  });

  const aliceDebtAmount = await E(aliceVault).getCurrentDebt();
  const fee = ceilMultiplyBy(aliceWantMinted, rates.mintFee);
  const aliceRunDebtLevel = AmountMath.add(aliceWantMinted, fee);

  t.deepEqual(
    aliceDebtAmount,
    aliceRunDebtLevel,
    'vault lent 5000 Minted + fees',
  );
  const { Minted: aliceLentAmount } =
    await E(aliceVaultSeat).getFinalAllocation();
  const aliceProceeds = await E(aliceVaultSeat).getPayouts();
  t.deepEqual(aliceLentAmount, aliceWantMinted, 'received 5000 Minted');
  trace(t, 'alice vault');

  const aliceRunLent = await aliceProceeds.Minted;
  t.truthy(
    AmountMath.isEqual(
      await E(run.issuer).getAmountOf(aliceRunLent),
      aliceWantMinted,
    ),
  );

  let aliceUpdate = await E(aliceNotifier).getUpdateSince();
  t.deepEqual(aliceUpdate.value.debtSnapshot.debt, aliceRunDebtLevel);

  // A bidder places a bid //////////////////////////
  const bidAmount = run.make(3_000n);
  const desired = aeth.make(700n);
  const bidderSeat = await bid(t, zoe, auctioneerKit, aeth, bidAmount, desired);

  // reduce collateral  /////////////////////////////////////

  // Alice reduce collateral by 300. That leaves her at 700 * 10 > 1.05 * 5000.
  // Prices will drop from 10 to 7, she'll be liquidated: 700 * 7 < 1.05 * 5000.
  const collateralDecrement = aeth.make(300n);
  const aliceReduceCollateralSeat = await E(zoe).offer(
    E(aliceVault).makeAdjustBalancesInvitation(),
    harden({
      want: { Collateral: collateralDecrement },
    }),
  );
  await E(aliceReduceCollateralSeat).getOfferResult();

  const { Collateral: aliceWithdrawnAeth } = await E(
    aliceReduceCollateralSeat,
  ).getFinalAllocation();
  const proceeds4 = await E(aliceReduceCollateralSeat).getPayouts();
  t.deepEqual(aliceWithdrawnAeth, aeth.make(300n));

  totalCollateral -= 300n;
  await aethVaultMetrics.assertChange({
    totalCollateral: { value: totalCollateral },
  });

  const collateralWithdrawn = await proceeds4.Collateral;
  t.truthy(
    AmountMath.isEqual(
      await E(aeth.issuer).getAmountOf(collateralWithdrawn),
      collateralDecrement,
    ),
  );

  aliceUpdate = await E(aliceNotifier).getUpdateSince(aliceUpdate.updateCount);
  t.deepEqual(aliceUpdate.value.debtSnapshot.debt, aliceRunDebtLevel);
  trace(t, 'alice reduce collateral');

  await E(priceAuthority).setPrice(makeRatio(7n, run.brand, 1n, aeth.brand));
  trace(t, 'changed price to 7');

  await priceAuthority.setPrice(makeRatio(40n, run.brand, 10n, aeth.brand));
  trace(t, 'price dropped a little');
  notification = await E(aliceNotifier).getUpdateSince();
  t.is(notification.value.vaultState, Phase.ACTIVE);

  const { startTime, time } = await startAuctionClock(
    auctioneerKit,
    manualTimer,
  );
  let currentTime = time;

  notification = await E(aliceNotifier).getUpdateSince();
  t.is(notification.value.vaultState, Phase.LIQUIDATING);

  t.deepEqual(
    await E(aliceVault).getCollateralAmount(),
    aeth.makeEmpty(),
    'Collateral consumed while liquidating',
  );

  t.deepEqual(
    await E(aliceVault).getCurrentDebt(),
    AmountMath.add(aliceWantMinted, run.make(250n)),
    'Debt remains while liquidating',
  );
  await aethVaultMetrics.assertChange({
    lockedQuote: makeRatioFromAmounts(
      aeth.make(1_000_000n),
      run.make(4_000_000n),
    ),
  });

  currentTime = await setClockAndAdvanceNTimes(manualTimer, 2, startTime, 2n);
  trace(`advanced time to `, currentTime);

  notification = await E(aliceNotifier).getUpdateSince();
  t.is(notification.value.vaultState, Phase.LIQUIDATED);

  // expect Alice to be liquidated because her collateral is too low.

  aliceUpdate = await E(aliceNotifier).getUpdateSince(aliceUpdate.updateCount);
  t.is(aliceUpdate.value.vaultState, Phase.LIQUIDATED);
  trace(t, 'alice liquidated');

  await reserveMetrics.assertChange({
    shortfallBalance: { value: 2310n },
  });

  await aethVaultMetrics.assertChange({
    numActiveVaults: 0,
    numLiquidatingVaults: 1,

    // running
    liquidatingCollateral: { value: 700n },
    liquidatingDebt: { value: 5250n },
    lockedQuote: null,
  });

  await aethVaultMetrics.assertChange({
    numLiquidatingVaults: 0,
    totalCollateralSold: { value: 700n },
    totalDebt: { value: 0n },
    totalCollateral: { value: 0n },

    // running
    numLiquidationsCompleted: 1,
    totalProceedsReceived: { value: 2940n },
    totalShortfallReceived: { value: 2310n },
    liquidatingCollateral: { value: 0n },
    liquidatingDebt: { value: 0n },
  });

  //  Bidder bought 400 Aeth
  await assertBidderPayout(t, bidderSeat, run, 60n, aeth, 700n);
});

// We'll make a loan, and trigger liquidation via price changes. The interest
// rate is 40%. The liquidation margin is 105%. The priceAuthority will
// initially quote 10:1 Run:Aeth, and drop to 7:1. The loan will initially be
// overcollateralized 100%. Alice will withdraw enough of the overage that
// she'll get caught when prices drop.
// A bidder will buy at the 65% level, so there will be a shortfall.
test('Auction sells all collateral w/shortfall', async t => {
  const { zoe, aeth, run, rates: defaultRates } = t.context;

  // Add a vaultManager with 10000 aeth collateral at a 200 aeth/Minted rate
  const rates = harden({
    ...defaultRates,
    // charge 40% interest / year
    interestRate: run.makeRatio(40n),
    liquidationMargin: run.makeRatio(130n),
  });
  t.context.rates = rates;

  // Interest is charged daily, and auctions are every week
  t.context.interestTiming = {
    chargingPeriod: ONE_DAY,
    recordingPeriod: ONE_DAY,
  };

  const manualTimer = buildManualTimer();
  const services = await setupServices(
    t,
    makeRatio(100n, run.brand, 10n, aeth.brand),
    aeth.make(1n),
    manualTimer,
    ONE_WEEK,
    500n,
    { StartFrequency: ONE_HOUR },
  );

  const {
    vaultFactory: { aethVaultManager, aethCollateralManager },
    priceAuthority,
    reserveKit: { reserveCreatorFacet, reservePublicFacet },
    auctioneerKit,
  } = services;
  await E(reserveCreatorFacet).addIssuer(aeth.issuer, 'Aeth');

  const metricsTopic = await E.get(E(reservePublicFacet).getPublicTopics())
    .metrics;
  const m = await subscriptionTracker(t, metricsTopic);
  await m.assertInitial(reserveInitialState(run.makeEmpty()));
  let shortfallBalance = 0n;

  const cm = await E(aethVaultManager).getPublicFacet();
  const aethVaultMetrics = await vaultManagerMetricsTracker(t, cm);
  await aethVaultMetrics.assertInitial({
    // present
    numActiveVaults: 0,
    numLiquidatingVaults: 0,
    totalCollateral: aeth.make(0n),
    totalDebt: run.make(0n),
    retainedCollateral: aeth.make(0n),

    // running
    numLiquidationsCompleted: 0,
    numLiquidationsAborted: 0,
    totalOverageReceived: run.make(0n),
    totalProceedsReceived: run.make(0n),
    totalCollateralSold: aeth.make(0n),
    liquidatingCollateral: aeth.make(0n),
    liquidatingDebt: run.make(0n),
    totalShortfallReceived: run.make(0n),
    lockedQuote: null,
  });

  // ALICE's loan ////////////////////////////////////////////

  // Create a loan for Alice for 5000 Minted with 1000 aeth collateral
  // ratio is 4:1
  const aliceCollateralAmount = aeth.make(1000n);
  const aliceWantMinted = run.make(5000n);
  /** @type {UserSeat<VaultKit>} */
  const aliceVaultSeat = await E(zoe).offer(
    await E(aethCollateralManager).makeVaultInvitation(),
    harden({
      give: { Collateral: aliceCollateralAmount },
      want: { Minted: aliceWantMinted },
    }),
    harden({
      Collateral: aeth.mint.mintPayment(aliceCollateralAmount),
    }),
  );
  const {
    vault: aliceVault,
    publicNotifiers: { vault: aliceNotifier },
  } = await legacyOfferResult(aliceVaultSeat);

  const aliceDebtAmount = await E(aliceVault).getCurrentDebt();
  const fee = ceilMultiplyBy(aliceWantMinted, rates.mintFee);
  const aliceRunDebtLevel = AmountMath.add(aliceWantMinted, fee);

  t.deepEqual(
    aliceDebtAmount,
    aliceRunDebtLevel,
    'vault lent 5000 Minted + fees',
  );
  const { Minted: aliceLentAmount } =
    await E(aliceVaultSeat).getFinalAllocation();
  const aliceProceeds = await E(aliceVaultSeat).getPayouts();
  t.deepEqual(aliceLentAmount, aliceWantMinted, 'received 5000 Minted');
  trace(t, 'alice vault');

  const aliceRunLent = await aliceProceeds.Minted;
  t.truthy(
    AmountMath.isEqual(
      await E(run.issuer).getAmountOf(aliceRunLent),
      aliceWantMinted,
    ),
  );

  let aliceUpdate = await E(aliceNotifier).getUpdateSince();
  t.deepEqual(aliceUpdate.value.debtSnapshot.debt, aliceRunDebtLevel);

  let totalDebt = 5250n;
  await aethVaultMetrics.assertChange({
    numActiveVaults: 1,
    totalCollateral: { value: 1000n },
    totalDebt: { value: totalDebt },
  });

  // reduce collateral  /////////////////////////////////////

  trace(t, 'alice reduce collateral');

  // Alice reduce collateral by 300. That leaves her at 700 * 10 > 1.05 * 5000.
  // Prices will drop from 10 to 7, she'll be liquidated: 700 * 7 < 1.05 * 5000.
  const collateralDecrement = aeth.make(300n);
  const aliceReduceCollateralSeat = await E(zoe).offer(
    E(aliceVault).makeAdjustBalancesInvitation(),
    harden({
      want: { Collateral: collateralDecrement },
    }),
  );
  await E(aliceReduceCollateralSeat).getOfferResult();

  trace('alice ');
  const { Collateral: aliceWithdrawnAeth } = await E(
    aliceReduceCollateralSeat,
  ).getFinalAllocation();
  const proceeds4 = await E(aliceReduceCollateralSeat).getPayouts();
  t.deepEqual(aliceWithdrawnAeth, aeth.make(300n));

  const collateralWithdrawn = await proceeds4.Collateral;
  t.truthy(
    AmountMath.isEqual(
      await E(aeth.issuer).getAmountOf(collateralWithdrawn),
      collateralDecrement,
    ),
  );

  aliceUpdate = await E(aliceNotifier).getUpdateSince(aliceUpdate.updateCount);
  t.deepEqual(aliceUpdate.value.debtSnapshot.debt, aliceRunDebtLevel);
  trace(t, 'alice reduce collateral');
  await aethVaultMetrics.assertChange({
    totalCollateral: { value: 700n },
  });

  await E(priceAuthority).setPrice(makeRatio(70n, run.brand, 10n, aeth.brand));
  trace(t, 'changed price to 7 RUN/Aeth');

  // A BIDDER places a BID //////////////////////////
  const bidAmount = run.make(3300n);
  const desired = aeth.make(700n);
  const bidderSeat = await bid(t, zoe, auctioneerKit, aeth, bidAmount, desired);

  const { startTime: start1, time: now1 } = await startAuctionClock(
    auctioneerKit,
    manualTimer,
  );
  let currentTime = now1;

  await aethVaultMetrics.assertChange({
    lockedQuote: makeRatioFromAmounts(
      aeth.make(1_000_000n),
      run.make(7_000_000n),
    ),
  });

  // expect Alice to be liquidated because her collateral is too low.
  aliceUpdate = await E(aliceNotifier).getUpdateSince(aliceUpdate.updateCount);
  trace(t, 'alice liquidating?', aliceUpdate.value.vaultState);
  t.is(aliceUpdate.value.vaultState, Phase.LIQUIDATING);

  currentTime = await setClockAndAdvanceNTimes(manualTimer, 2, start1, 2n);

  aliceUpdate = await E(aliceNotifier).getUpdateSince(aliceUpdate.updateCount);
  t.is(aliceUpdate.value.vaultState, Phase.LIQUIDATED);
  trace(t, 'alice liquidated', currentTime);
  totalDebt += 30n;
  await aethVaultMetrics.assertChange({
    numActiveVaults: 0,
    numLiquidatingVaults: 1,
    liquidatingCollateral: { value: 700n },
    liquidatingDebt: { value: 5250n },
    lockedQuote: null,
  });

  shortfallBalance += 2065n;
  await m.assertChange({
    shortfallBalance: { value: shortfallBalance },
  });

  await aethVaultMetrics.assertChange({
    liquidatingDebt: { value: 0n },
    liquidatingCollateral: { value: 0n },
    totalCollateral: { value: 0n },
    totalDebt: { value: 0n },
    numLiquidatingVaults: 0,
    numLiquidationsCompleted: 1,
    totalCollateralSold: { value: 700n },
    totalProceedsReceived: { value: 3185n },
    totalShortfallReceived: { value: shortfallBalance },
  });

  //  Bidder bought 800 Aeth
  await assertBidderPayout(t, bidderSeat, run, 115n, aeth, 700n);
});

// See #7191.  Changing the price from 12.34 to 9.99 should liquidate a vault
// with 15 collateral and 100 debt at liquidationMargin of 150%. Interest won't
// be charged over this period.
test('liquidation Margin matters', async t => {
  const { zoe, aeth, run, rates: defaultRates } = t.context;

  const rates = harden({
    ...defaultRates,
    interestRate: run.makeRatio(0n),
    liquidationMargin: run.makeRatio(150n),
  });
  t.context.rates = rates;

  const manualTimer = buildManualTimer();
  const services = await setupServices(
    t,
    makeRatio(1234n, run.brand, 100n, aeth.brand),
    aeth.make(1n),
    manualTimer,
    ONE_WEEK,
    500n,
    { StartFrequency: ONE_HOUR },
  );

  const {
    auctioneerKit,
    priceAuthority,
    reserveKit: { reserveCreatorFacet },
  } = services;
  await E(reserveCreatorFacet).addIssuer(aeth.issuer, 'Aeth');

  const { aethCollateralManager } = services.vaultFactory;

  const aliceCollateralAmount = aeth.make(15n);

  // a loan of 95 with 5% fee produces a debt of 100.
  const aliceWantMinted = run.make(95n);
  /** @type {UserSeat<VaultKit>} */
  const aliceVaultSeat = await E(zoe).offer(
    await E(aethCollateralManager).makeVaultInvitation(),
    harden({
      give: { Collateral: aliceCollateralAmount },
      want: { Minted: aliceWantMinted },
    }),
    harden({
      Collateral: aeth.mint.mintPayment(aliceCollateralAmount),
    }),
  );
  const {
    vault: aliceVault,
    publicNotifiers: { vault: aliceNotifier },
  } = await legacyOfferResult(aliceVaultSeat);

  const aliceDebtAmount = await E(aliceVault).getCurrentDebt();
  const fee = ceilMultiplyBy(aliceWantMinted, rates.mintFee);
  const aliceRunDebtLevel = AmountMath.add(aliceWantMinted, fee);

  t.deepEqual(
    aliceDebtAmount,
    aliceRunDebtLevel,
    'vault lent 5000 Minted + fees',
  );
  const { Minted: aliceLentAmount } =
    await E(aliceVaultSeat).getFinalAllocation();
  const aliceProceeds = await E(aliceVaultSeat).getPayouts();
  t.deepEqual(aliceLentAmount, aliceWantMinted, 'received 95 Minted');

  const aliceRunLent = await aliceProceeds.Minted;
  t.deepEqual(await E(run.issuer).getAmountOf(aliceRunLent), run.make(95n));

  let aliceUpdate = await E(aliceNotifier).getUpdateSince();
  t.deepEqual(aliceUpdate.value.debtSnapshot.debt, aliceRunDebtLevel);
  t.is(aliceUpdate.value.vaultState, Phase.ACTIVE);

  // A BIDDER places a BID //////////////////////////
  const bidAmount = run.make(100n);
  const desired = aeth.make(15n);
  const bidderSeat = await bid(t, zoe, auctioneerKit, aeth, bidAmount, desired);

  // price falls to 10.00. notice that no liquidation takes place.
  await priceAuthority.setPrice(makeRatio(1000n, run.brand, 100n, aeth.brand));
  await eventLoopIteration();

  let { startTime } = await startAuctionClock(auctioneerKit, manualTimer);

  await setClockAndAdvanceNTimes(manualTimer, 2n, startTime, 2n);

  aliceUpdate = await E(aliceNotifier).getUpdateSince();
  t.is(aliceUpdate.value.vaultState, Phase.ACTIVE);

  // price falls to 9.99. Now it liquidates.
  await priceAuthority.setPrice(makeRatio(999n, run.brand, 100n, aeth.brand));
  await eventLoopIteration();

  ({ startTime } = await startAuctionClock(auctioneerKit, manualTimer));

  await setClockAndAdvanceNTimes(manualTimer, 2n, startTime, 2n);

  aliceUpdate = await E(aliceNotifier).getUpdateSince();
  t.is(aliceUpdate.value.vaultState, Phase.LIQUIDATED);

  await assertBidderPayout(t, bidderSeat, run, 2n, aeth, 15n);
});

// two vaults go into liquidation. bids are insufficient, so one is reinstated.
// We'll do this by dropping the oracle price, without charging interest.
test('reinstate vault', async t => {
  const { zoe, aeth, run, rates: defaultRates } = t.context;

  const rates = harden({
    ...defaultRates,
    interestRate: run.makeRatio(0n),
    liquidationMargin: run.makeRatio(150n),
  });
  t.context.rates = rates;

  const manualTimer = buildManualTimer();
  const services = await setupServices(
    t,
    makeRatio(1500n, run.brand, 100n, aeth.brand),
    aeth.make(1n),
    manualTimer,
    ONE_WEEK,
    500n,
    { StartFrequency: ONE_HOUR },
  );

  const {
    vaultFactory: { aethVaultManager, aethCollateralManager },
    auctioneerKit,
    priceAuthority,
    reserveKit: { reserveCreatorFacet, reservePublicFacet },
  } = services;
  await E(reserveCreatorFacet).addIssuer(aeth.issuer, 'Aeth');

  const cm = await E(aethVaultManager).getPublicFacet();
  const aethVaultMetrics = await vaultManagerMetricsTracker(t, cm);
  await aethVaultMetrics.assertInitial({
    // present
    numActiveVaults: 0,
    numLiquidatingVaults: 0,
    totalCollateral: aeth.make(0n),
    totalDebt: run.make(0n),
    retainedCollateral: aeth.make(0n),

    // running
    numLiquidationsCompleted: 0,
    numLiquidationsAborted: 0,
    totalOverageReceived: run.make(0n),
    totalProceedsReceived: run.make(0n),
    totalCollateralSold: aeth.make(0n),
    liquidatingCollateral: aeth.make(0n),
    liquidatingDebt: run.make(0n),
    totalShortfallReceived: run.make(0n),
    lockedQuote: null,
  });

  // ALICE takes out a loan ////////////////////////

  // a loan of 95 with 5% fee produces a debt of 100.
  const aliceCollateralAmount = aeth.make(15n);
  const aliceWantMinted = run.make(95n);
  /** @type {UserSeat<VaultKit>} */
  const aliceVaultSeat = await E(zoe).offer(
    await E(aethCollateralManager).makeVaultInvitation(),
    harden({
      give: { Collateral: aliceCollateralAmount },
      want: { Minted: aliceWantMinted },
    }),
    harden({
      Collateral: aeth.mint.mintPayment(aliceCollateralAmount),
    }),
  );
  const {
    vault: aliceVault,
    publicNotifiers: { vault: aliceNotifier },
  } = await legacyOfferResult(aliceVaultSeat);

  const aliceDebtAmount = await E(aliceVault).getCurrentDebt();
  const aliceFee = ceilMultiplyBy(aliceWantMinted, rates.mintFee);
  const aliceRunDebtLevel = AmountMath.add(aliceWantMinted, aliceFee);

  t.deepEqual(
    aliceDebtAmount,
    aliceRunDebtLevel,
    'vault lent 5000 Minted + fees',
  );
  const { Minted: aliceLentAmount } =
    await E(aliceVaultSeat).getFinalAllocation();
  const aliceProceeds = await E(aliceVaultSeat).getPayouts();
  t.deepEqual(aliceLentAmount, aliceWantMinted, 'received 95 Minted');

  const aliceRunLent = await aliceProceeds.Minted;
  t.deepEqual(await E(run.issuer).getAmountOf(aliceRunLent), aliceWantMinted);

  let aliceUpdate = await E(aliceNotifier).getUpdateSince();
  t.deepEqual(aliceUpdate.value.debtSnapshot.debt, aliceRunDebtLevel);
  t.is(aliceUpdate.value.vaultState, Phase.ACTIVE);

  await aethVaultMetrics.assertChange({
    numActiveVaults: 1,
    totalDebt: { value: 100n },
    totalCollateral: { value: 15n },
  });

  // BOB takes out a loan ////////////////////////
  const bobCollateralAmount = aeth.make(48n);
  const bobWantMinted = run.make(150n);
  /** @type {UserSeat<VaultKit>} */
  const bobVaultSeat = await E(zoe).offer(
    await E(aethCollateralManager).makeVaultInvitation(),
    harden({
      give: { Collateral: bobCollateralAmount },
      want: { Minted: bobWantMinted },
    }),
    harden({
      Collateral: aeth.mint.mintPayment(bobCollateralAmount),
    }),
  );
  const {
    vault: bobVault,
    publicNotifiers: { vault: bobNotifier },
  } = await legacyOfferResult(bobVaultSeat);

  const bobDebtAmount = await E(bobVault).getCurrentDebt();
  const bobFee = ceilMultiplyBy(bobWantMinted, rates.mintFee);
  const bobRunDebtLevel = AmountMath.add(bobWantMinted, bobFee);

  t.deepEqual(bobDebtAmount, bobRunDebtLevel, 'vault lent 5000 Minted + fees');
  const { Minted: bobLentAmount } = await E(bobVaultSeat).getFinalAllocation();
  const bobProceeds = await E(bobVaultSeat).getPayouts();
  t.deepEqual(bobLentAmount, bobWantMinted, 'received 95 Minted');

  const bobRunLent = await bobProceeds.Minted;
  t.deepEqual(await E(run.issuer).getAmountOf(bobRunLent), bobWantMinted);

  let bobUpdate = await E(bobNotifier).getUpdateSince();
  t.deepEqual(bobUpdate.value.debtSnapshot.debt, bobRunDebtLevel);
  t.is(bobUpdate.value.vaultState, Phase.ACTIVE);

  await aethVaultMetrics.assertChange({
    numActiveVaults: 2,
    totalDebt: { value: 258n },
    totalCollateral: { value: 63n },
  });

  // A BIDDER places a BID //////////////////////////
  const bidAmount = run.make(100n);
  const desired = aeth.make(8n);
  const bidderSeat = await bid(t, zoe, auctioneerKit, aeth, bidAmount, desired);

  // price falls
  await priceAuthority.setPrice(makeRatio(400n, run.brand, 100n, aeth.brand));
  await eventLoopIteration();

  const { startTime } = await startAuctionClock(auctioneerKit, manualTimer);

  await aethVaultMetrics.assertChange({
    lockedQuote: makeRatioFromAmounts(
      aeth.make(1_000_000n),
      run.make(4_000_000n),
    ),
  });

  await aethVaultMetrics.assertChange({
    numActiveVaults: 0,
    liquidatingDebt: { value: 258n },
    liquidatingCollateral: { value: 63n },
    numLiquidatingVaults: 2,
    lockedQuote: null,
  });

  await setClockAndAdvanceNTimes(manualTimer, 2n, startTime, 2n);

  await aethVaultMetrics.assertChange({
    numActiveVaults: 1,
    liquidatingDebt: { value: 0n },
    liquidatingCollateral: { value: 0n },
    totalDebt: { value: 158n },
    totalCollateral: { value: 44n },
    totalProceedsReceived: { value: 34n },
    totalShortfallReceived: { value: 66n },
    totalCollateralSold: { value: 8n },
    numLiquidatingVaults: 0,
    numLiquidationsCompleted: 1,
    numLiquidationsAborted: 1,
  });

  aliceUpdate = await E(aliceNotifier).getUpdateSince();
  t.is(aliceUpdate.value.vaultState, Phase.LIQUIDATED);
  t.deepEqual(aliceUpdate.value.locked, aeth.make(0n));

  // Reduce Bob's collateral by liquidation penalty
  // bob's share is 7 * 158/258, which rounds up to 5
  const recoveredBobCollateral = AmountMath.subtract(
    bobCollateralAmount,
    aeth.make(5n),
  );
  bobUpdate = await E(bobNotifier).getUpdateSince();
  t.is(bobUpdate.value.vaultState, Phase.ACTIVE);
  t.deepEqual(bobUpdate.value.locked, recoveredBobCollateral);
  t.deepEqual(bobUpdate.value.debtSnapshot.debt, bobRunDebtLevel);

  await assertBidderPayout(t, bidderSeat, run, 66n, aeth, 8n);

  const metricsTopic = await E.get(E(reservePublicFacet).getPublicTopics())
    .metrics;
  const m = await subscriptionTracker(t, metricsTopic);
  await m.assertLike({
    allocations: {
      Aeth: aeth.make(12n),
      Fee: undefined,
    },
  });
});

test('auction locks low price', async t => {
  const { zoe, aeth, run } = t.context;
  // vary just the want/numerator
  const baseCollateral = 4n;

  t.context.interestTiming = {
    chargingPeriod: 2n,
    recordingPeriod: 10n,
  };

  const manualTimer = buildManualTimer();
  const services = await setupServices(
    t,
    makeRatio(600n, run.brand, baseCollateral, aeth.brand),
    aeth.make(900n),
    manualTimer,
    undefined,
    500n,
    { StartFrequency: ONE_HOUR },
  );
  // we start with time=0, price=2200

  const { aethCollateralManager } = services.vaultFactory;

  const {
    reserveKit: { reserveCreatorFacet },
    auctioneerKit,
    priceAuthority,
  } = services;
  await E(reserveCreatorFacet).addIssuer(aeth.issuer, 'Aeth');
  trace('addIssuer awaited');

  const wanted = 500n;

  // Lock in a low price (zero)
  priceAuthority.setPrice(makeRatio(0n, run.brand, baseCollateral, aeth.brand));
  await eventLoopIteration();

  const schedule = await E(auctioneerKit.creatorFacet).getSchedule();
  const priceDelay = await E(auctioneerKit.publicFacet).getPriceLockPeriod();
  const { startTime, startDelay } = NonNullish(schedule.nextAuctionSchedule);
  const nominalStart = TimeMath.subtractAbsRel(startTime, startDelay);
  const priceLockTime = TimeMath.subtractAbsRel(nominalStart, priceDelay);
  await manualTimer.advanceTo(TimeMath.absValue(priceLockTime));
  await eventLoopIteration();

  // make vault MCR uses the locked price
  await t.throwsAsync(
    // promise for the offer's result
    E(
      E(zoe).offer(
        E(aethCollateralManager).makeVaultInvitation(),
        harden({
          give: { Collateral: aeth.make(baseCollateral) },
          want: { Minted: run.make(wanted) },
        }),
        harden({
          Collateral: aeth.mint.mintPayment(aeth.make(baseCollateral)),
        }),
      ),
    ).getOfferResult(),
    {
      message:
        'Proposed debt {"brand":"[Alleged: IST brand]","value":"[525n]"} exceeds max {"brand":"[Alleged: IST brand]","value":"[0n]"} for {"brand":"[Alleged: aEth brand]","value":"[4n]"} collateral',
    },
  );

  // Bump back up to a high price
  priceAuthority.setPrice(
    makeRatio(100n * wanted, run.brand, baseCollateral, aeth.brand),
  );

  await manualTimer.advanceTo(TimeMath.absValue(nominalStart));
  trace('auction started, binding lockedQuote in the vault manager state');
  await eventLoopIteration();

  const result = await E(
    E(zoe).offer(
      E(aethCollateralManager).makeVaultInvitation(),
      harden({
        give: { Collateral: aeth.make(baseCollateral) },
        want: { Minted: run.make(wanted) },
      }),
      harden({
        Collateral: aeth.mint.mintPayment(aeth.make(baseCollateral)),
      }),
    ),
  ).getOfferResult();
  t.truthy(result);
});

test('Bug 7422 vault reinstated with no assets', async t => {
  const { zoe, aeth, run, rates: defaultRates } = t.context;

  const rates = harden({
    ...defaultRates,
    liquidationPenalty: makeRatio(5n, run.brand),
    liquidationMargin: run.makeRatio(150n),
  });
  t.context.rates = rates;

  const manualTimer = buildManualTimer();
  const services = await setupServices(
    t,
    makeRatio(1250n, run.brand, 100n, aeth.brand),
    aeth.make(1000n),
    manualTimer,
    ONE_WEEK,
    500n,
    { StartFrequency: ONE_HOUR },
  );

  const {
    vaultFactory: { aethVaultManager, aethCollateralManager },
    auctioneerKit: auctKit,
    priceAuthority,
    reserveKit: { reserveCreatorFacet, reservePublicFacet },
  } = services;
  await E(reserveCreatorFacet).addIssuer(aeth.issuer, 'Aeth');

  const cm = await E(aethVaultManager).getPublicFacet();
  const aethVaultMetrics = await vaultManagerMetricsTracker(t, cm);
  await aethVaultMetrics.assertInitial({
    // present
    numActiveVaults: 0,
    numLiquidatingVaults: 0,
    totalCollateral: aeth.make(0n),
    totalDebt: run.make(0n),
    retainedCollateral: aeth.make(0n),

    // running
    numLiquidationsCompleted: 0,
    numLiquidationsAborted: 0,
    totalOverageReceived: run.make(0n),
    totalProceedsReceived: run.make(0n),
    totalCollateralSold: aeth.make(0n),
    liquidatingCollateral: aeth.make(0n),
    liquidatingDebt: run.make(0n),
    totalShortfallReceived: run.make(0n),
    lockedQuote: null,
  });

  const openVault = (collateral, want) =>
    E(zoe).offer(
      E(aethCollateralManager).makeVaultInvitation(),
      harden({
        give: { Collateral: collateral },
        want: { Minted: want },
      }),
      harden({
        Collateral: aeth.mint.mintPayment(collateral),
      }),
    );

  const aliceWantMinted = run.make(100n);
  const collateral = aeth.make(15n);
  /** @type {UserSeat<VaultKit>} */
  const aliceVaultSeat = await openVault(collateral, aliceWantMinted);
  const {
    vault: aliceVault,
    publicNotifiers: { vault: aliceNotifier },
  } = await legacyOfferResult(aliceVaultSeat);
  let aliceUpdate = await E(aliceNotifier).getUpdateSince();
  t.is(aliceUpdate.value.vaultState, Phase.ACTIVE);
  await aethVaultMetrics.assertChange({
    numActiveVaults: 1,
    totalCollateral: { value: 15n },
    totalDebt: { value: 105n },
  });

  const bobWantMinted = run.make(105n);
  /** @type {UserSeat<VaultKit>} */
  const bobVaultSeat = await openVault(collateral, bobWantMinted);
  const {
    vault: bobVault,
    publicNotifiers: { vault: bobNotifier },
  } = await legacyOfferResult(bobVaultSeat);
  const bobUpdate = await E(bobNotifier).getUpdateSince();
  t.is(bobUpdate.value.vaultState, Phase.ACTIVE);

  await aethVaultMetrics.assertChange({
    numActiveVaults: 2,
    totalCollateral: { value: 30n },
    totalDebt: { value: 216n },
  });

  const carolWantMinted = run.make(110n);
  /** @type {UserSeat<VaultKit>} */
  const carolVaultSeat = await openVault(collateral, carolWantMinted);
  const {
    vault: carolVault,
    publicNotifiers: { vault: carolNotifier },
  } = await legacyOfferResult(carolVaultSeat);
  const carolUpdate = await E(carolNotifier).getUpdateSince();
  t.is(carolUpdate.value.vaultState, Phase.ACTIVE);
  await aethVaultMetrics.assertChange({
    numActiveVaults: 3,
    totalCollateral: { value: 45n },
    totalDebt: { value: 332n },
  });

  const { Minted: aliceLentAmount } =
    await E(aliceVaultSeat).getFinalAllocation();
  const aliceProceeds = await E(aliceVaultSeat).getPayouts();
  t.deepEqual(aliceLentAmount, aliceWantMinted, 'received 95 Minted');

  const aliceRunLent = await aliceProceeds.Minted;
  t.deepEqual(await E(run.issuer).getAmountOf(aliceRunLent), aliceWantMinted);

  // BIDDERs place BIDs //////////////////////////
  const bidderSeat1 = await bidDiscount(
    t,
    zoe,
    auctKit,
    aeth,
    run.make(50n),
    aeth.make(100n),
    makeRatio(70n, run.brand),
  );
  const bidderSeat2 = await bid(
    t,
    zoe,
    auctKit,
    aeth,
    run.make(50n),
    aeth.make(10n),
  );
  const bidderSeat3 = await bidDiscount(
    t,
    zoe,
    auctKit,
    aeth,
    run.make(75n),
    aeth.make(100n),
    makeRatio(78n, run.brand),
  );

  // price falls
  await priceAuthority.setPrice(makeRatio(999n, run.brand, 1000n, aeth.brand));
  await eventLoopIteration();

  const { startTime } = await startAuctionClock(auctKit, manualTimer);

  await aethVaultMetrics.assertChange({
    lockedQuote: makeRatioFromAmounts(
      aeth.make(1_000_000n),
      run.make(999_000n),
    ),
  });

  await setClockAndAdvanceNTimes(manualTimer, 2n, startTime, 2n);

  await aethVaultMetrics.assertChange({
    liquidatingDebt: { value: 332n },
    liquidatingCollateral: { value: 45n },
    numActiveVaults: 0,
    numLiquidatingVaults: 3,
    lockedQuote: null,
  });

  aliceUpdate = await E(aliceNotifier).getUpdateSince();
  t.is(aliceUpdate.value.vaultState, Phase.LIQUIDATED);

  const shortfall = 298n;
  await aethVaultMetrics.assertChange({
    liquidatingDebt: { value: 0n },
    totalDebt: { value: 0n },
    liquidatingCollateral: { value: 0n },
    totalCollateral: { value: 0n },
    totalCollateralSold: { value: 45n },
    totalProceedsReceived: { value: 34n },
    totalShortfallReceived: { value: shortfall },
    numLiquidatingVaults: 0,
    numLiquidationsCompleted: 3,
  });

  t.deepEqual(await E(aliceVault).getCollateralAmount(), aeth.make(0n));
  t.deepEqual(await E(aliceVault).getCurrentDebt(), run.makeEmpty());
  t.deepEqual(await E(bobVault).getCollateralAmount(), aeth.make(0n));
  t.deepEqual(await E(bobVault).getCurrentDebt(), run.makeEmpty());
  t.deepEqual(await E(carolVault).getCollateralAmount(), aeth.make(0n));
  t.deepEqual(await E(carolVault).getCurrentDebt(), run.makeEmpty());

  t.false(await E(bidderSeat3).hasExited());
  await E(bidderSeat3).tryExit();
  t.true(await E(bidderSeat3).hasExited());
  await assertBidderPayout(t, bidderSeat3, run, 75n, aeth, 0n);
  await E(bidderSeat1).tryExit();
  await assertBidderPayout(t, bidderSeat1, run, 27n, aeth, 35n);
  await assertBidderPayout(t, bidderSeat2, run, 39n, aeth, 10n);

  const metricsTopic = await E.get(E(reservePublicFacet).getPublicTopics())
    .metrics;
  const m = await subscriptionTracker(t, metricsTopic);

  await m.assertState({
    ...reserveInitialState(run.makeEmpty()),
    shortfallBalance: run.make(shortfall),
  });
});

const makeMaxCalculator = (aeth, run, penaltyAeth, sold, totalDebt) => {
  // VaultHolders can get back their collateral minus (their share of penalty
  // plus their share of the debt valued at the Realized Sale Price).
  // RSP is totalDebt / amountSold
  //
  // The Aeth value of each vault's debt is amountSold * vaultDebt / totalDebt
  // Each vault's share of the penalty is totalPenalty * vaultDebt / totalDebt
  const maxVaultReturn = (vaultCollateral, vaultDebt) => {
    return AmountMath.subtract(
      vaultCollateral,
      ceilMultiplyBy(
        vaultDebt,
        makeRatioFromAmounts(
          AmountMath.add(aeth.make(penaltyAeth), aeth.make(sold)),
          run.make(totalDebt),
        ),
      ),
    );
  };
  return maxVaultReturn;
};

test('Bug 7346 excess collateral to holder', async t => {
  const { zoe, aeth, run, rates: defaultRates } = t.context;

  const rates = harden({
    ...defaultRates,
    liquidationPenalty: makeRatio(1n, run.brand),
    liquidationMargin: run.makeRatio(150n),
    mintFee: run.makeRatio(50n, 10_000n),
    debtLimit: run.make(100_000_000_000n),
  });
  t.context.rates = rates;

  const manualTimer = buildManualTimer();
  const services = await setupServices(
    t,
    makeRatio(1234n, run.brand, 100n, aeth.brand),
    aeth.make(1_000_000n),
    manualTimer,
    ONE_WEEK,
    500_000n,
    { DiscountStep: 500n, StartFrequency: ONE_HOUR },
  );

  const {
    vaultFactory: { aethVaultManager, aethCollateralManager },
    auctioneerKit: auctKit,
    priceAuthority,
    reserveKit: { reserveCreatorFacet, reservePublicFacet },
  } = services;
  await E(reserveCreatorFacet).addIssuer(aeth.issuer, 'Aeth');

  const cm = await E(aethVaultManager).getPublicFacet();
  const aethVaultMetrics = await vaultManagerMetricsTracker(t, cm);
  await aethVaultMetrics.assertInitial({
    // present
    numActiveVaults: 0,
    numLiquidatingVaults: 0,
    totalCollateral: aeth.make(0n),
    totalDebt: run.make(0n),
    retainedCollateral: aeth.make(0n),

    // running
    numLiquidationsCompleted: 0,
    numLiquidationsAborted: 0,
    totalOverageReceived: run.make(0n),
    totalProceedsReceived: run.make(0n),
    totalCollateralSold: aeth.make(0n),
    liquidatingCollateral: aeth.make(0n),
    liquidatingDebt: run.make(0n),
    totalShortfallReceived: run.make(0n),
    lockedQuote: null,
  });

  const openVault = (collateral, want) =>
    E(zoe).offer(
      E(aethCollateralManager).makeVaultInvitation(),
      harden({
        give: { Collateral: collateral },
        want: { Minted: want },
      }),
      harden({
        Collateral: aeth.mint.mintPayment(collateral),
      }),
    );

  const aliceWantMinted = run.make(100_000_000n);
  const collateral = aeth.make(15_000_000n);
  /** @type {UserSeat<VaultKit>} */
  const aliceVaultSeat = await openVault(collateral, aliceWantMinted);
  const {
    vault: aliceVault,
    publicNotifiers: { vault: aliceNotifier },
  } = await legacyOfferResult(aliceVaultSeat);
  let aliceUpdate = await E(aliceNotifier).getUpdateSince();
  t.is(aliceUpdate.value.vaultState, Phase.ACTIVE);
  const aliceDebt = 100_500_000n;
  await aethVaultMetrics.assertChange({
    numActiveVaults: 1,
    totalCollateral: { value: 15_000_000n },
    totalDebt: { value: aliceDebt },
  });

  const bobWantMinted = run.make(103_000_000n);
  const bobDebt = 103_515_000n;
  /** @type {UserSeat<VaultKit>} */
  const bobVaultSeat = await openVault(collateral, bobWantMinted);
  const {
    vault: bobVault,
    publicNotifiers: { vault: bobNotifier },
  } = await legacyOfferResult(bobVaultSeat);
  const bobUpdate = await E(bobNotifier).getUpdateSince();
  t.is(bobUpdate.value.vaultState, Phase.ACTIVE);

  await aethVaultMetrics.assertChange({
    numActiveVaults: 2,
    totalCollateral: { value: 30_000_000n },
    totalDebt: { value: aliceDebt + bobDebt },
  });

  const carolWantMinted = run.make(105_000_000n);
  const carolDebt = 105_525_000n;
  /** @type {UserSeat<VaultKit>} */
  const carolVaultSeat = await openVault(collateral, carolWantMinted);
  const {
    vault: carolVault,
    publicNotifiers: { vault: carolNotifier },
  } = await legacyOfferResult(carolVaultSeat);
  const carolUpdate = await E(carolNotifier).getUpdateSince();
  t.is(carolUpdate.value.vaultState, Phase.ACTIVE);
  const totalCollateral = 45_000_000n;
  const totalDebt = aliceDebt + bobDebt + carolDebt;
  await aethVaultMetrics.assertChange({
    numActiveVaults: 3,
    totalCollateral: { value: totalCollateral },
    totalDebt: { value: totalDebt },
  });

  const { Minted: aliceLentAmount } =
    await E(aliceVaultSeat).getFinalAllocation();
  const aliceProceeds = await E(aliceVaultSeat).getPayouts();
  t.deepEqual(aliceLentAmount, aliceWantMinted, 'received 95 Minted');

  const aliceRunLent = await aliceProceeds.Minted;
  t.deepEqual(await E(run.issuer).getAmountOf(aliceRunLent), aliceWantMinted);

  // BIDDERs place BIDs //////////////////////////
  // bidder 1 will spend 80M at 90% of 9.99 for 8,897,786
  const bidder1Buys = 8_897_786n;
  const bidderSeat1 = await bidDiscount(
    t,
    zoe,
    auctKit,
    aeth,
    run.make(80_000_000n),
    aeth.make(1000_000_000n),
    makeRatio(90n, run.brand),
  );
  // bidder 2 will spend 90M at 90% of 9.99 for 10_010_010M
  const bidder2Buys = 10_010_010n;
  const bidderSeat2 = await bidPrice(
    t,
    zoe,
    auctKit,
    aeth,
    run.make(90_000_000n),
    aeth.make(100_000_000n),
    makeRatio(900n, run.brand, 100n, aeth.brand),
  );
  // bidder 3 will spend 309,540 - 170,000 = 139,540,000 at 85% of 9.99 for 16,432,903
  const bidder3Buys = 16_432_903n;
  const bidder3Spend = totalDebt - 80_000_000n - 90_000_000n;
  const bidderSeat3 = await bidDiscount(
    t,
    zoe,
    auctKit,
    aeth,
    run.make(150_000_000n),
    aeth.make(1000_000_000n),
    makeRatio(85n, run.brand),
  );
  const sold = bidder1Buys + bidder2Buys + bidder3Buys;

  // price falls
  const newPrice = makeRatio(9990n, run.brand, 1000n, aeth.brand);
  await priceAuthority.setPrice(newPrice);
  await eventLoopIteration();

  const { startTime } = await startAuctionClock(auctKit, manualTimer);

  await aethVaultMetrics.assertChange({
    lockedQuote: makeRatioFromAmounts(
      aeth.make(1_000_000n),
      run.make(9_990_000n),
    ),
  });

  await setClockAndAdvanceNTimes(manualTimer, 10n, startTime, 2n);

  // Penalty is 1% of the debt valued at auction start price = proceeds/9.99
  const penaltyAeth = 309_850n;

  await aethVaultMetrics.assertChange({
    liquidatingDebt: { value: totalDebt },
    liquidatingCollateral: { value: totalCollateral },
    numActiveVaults: 0,
    numLiquidatingVaults: 3,
    lockedQuote: null,
  });

  aliceUpdate = await E(aliceNotifier).getUpdateSince();
  t.is(aliceUpdate.value.vaultState, Phase.LIQUIDATED);

  await aethVaultMetrics.assertChange({
    liquidatingDebt: { value: 0n },
    totalDebt: { value: 0n },
    liquidatingCollateral: { value: 0n },
    totalCollateral: { value: 0n },
    totalCollateralSold: { value: sold },
    totalProceedsReceived: { value: totalDebt },
    numLiquidatingVaults: 0,
    numLiquidationsCompleted: 3,
  });
  const maxVaultReturn = makeMaxCalculator(
    aeth,
    run,
    penaltyAeth,
    sold,
    totalDebt,
  );

  const aliceReturn = maxVaultReturn(collateral, run.make(aliceDebt));
  t.deepEqual(await E(aliceVault).getCollateralAmount(), aliceReturn);
  t.deepEqual(await E(aliceVault).getCurrentDebt(), run.makeEmpty());
  const bobReturn = maxVaultReturn(collateral, run.make(bobDebt));
  t.deepEqual(await E(bobVault).getCollateralAmount(), bobReturn);
  t.deepEqual(await E(bobVault).getCurrentDebt(), run.makeEmpty());
  const carolReturn = maxVaultReturn(collateral, run.make(carolDebt));
  t.deepEqual(await E(carolVault).getCollateralAmount(), carolReturn);
  t.deepEqual(await E(carolVault).getCurrentDebt(), run.makeEmpty());

  t.false(await E(bidderSeat3).hasExited());
  await E(bidderSeat3).tryExit();
  t.true(await E(bidderSeat3).hasExited());
  await assertBidderPayout(
    t,
    bidderSeat3,
    run,
    150_000_000n - bidder3Spend,
    aeth,
    bidder3Buys,
  );
  t.true(await E(bidderSeat1).hasExited());
  await assertBidderPayout(t, bidderSeat1, run, 0n, aeth, bidder1Buys);

  t.true(await E(bidderSeat2).hasExited());
  await assertBidderPayout(t, bidderSeat2, run, 0n, aeth, bidder2Buys);

  const metricsTopic = await E.get(E(reservePublicFacet).getPublicTopics())
    .metrics;
  const m = await subscriptionTracker(t, metricsTopic);

  await m.assertState({
    ...reserveInitialState(run.makeEmpty()),
    shortfallBalance: run.makeEmpty(),
    allocations: {
      Aeth: aeth.make(309_852n),
    },
  });
});

test('refund to one of two loans', async t => {
  const { zoe, aeth, run } = t.context;

  const manualTimer = buildManualTimer();
  // The price starts at 5 RUN per Aeth. One loan will start with 400 Aeth
  // collateral and will borrow 1600, which is a CR of 1.25. Another loan will
  // have 200 Aeth and borrow 790.  After the price falls to 4, both will get
  // liquidated. The bidder will offer enough for most of the collateral to pay
  // off the debt, but only the second will get collateral back.
  t.context.interestTiming = {
    chargingPeriod: 2n,
    recordingPeriod: 10n,
  };

  // The default mint fee is 500 BP. This means the initial indebtedness is 105%.
  // When the starting point of the auction is 105% of the collateral value, the
  // auction can't collect more than the debt in order to be able to refund
  // anything to vault holders. We'll use a mint fee of 100 BP.
  const mintFee = makeRatio(100n, run.brand, BASIS_POINTS);

  // reduce the penalty, so there is some collateral to distribute.
  const liquidationPenalty = makeRatio(1n, run.brand);
  t.context.rates = {
    ...defaultParamValues(run.brand),
    liquidationPenalty,
    mintFee,
  };
  const initialDebtRatio = makeRatio(101n, run.brand);

  const services = await setupServices(
    t,
    makeRatio(50n, run.brand, 10n, aeth.brand),
    aeth.make(400n),
    manualTimer,
    undefined,
    500n,
    { StartFrequency: ONE_HOUR },
  );

  const {
    vaultFactory: { vaultFactory, aethCollateralManager },
    priceAuthority,
    reserveKit: { reserveCreatorFacet, reservePublicFacet },
    auctioneerKit,
  } = services;
  await E(reserveCreatorFacet).addIssuer(aeth.issuer, 'Aeth');

  const aliceCollateralAmount = aeth.make(400n);
  const aliceWantMinted = run.make(1600n);

  /** @type {UserSeat<VaultKit>} */
  const aliceVaultSeat = await E(zoe).offer(
    await E(aethCollateralManager).makeVaultInvitation(),
    harden({
      give: { Collateral: aliceCollateralAmount },
      want: { Minted: aliceWantMinted },
    }),
    harden({
      Collateral: aeth.mint.mintPayment(aliceCollateralAmount),
    }),
  );

  const bobCollateralAmount = aeth.make(200n);
  const bobWantMinted = run.make(790n);
  /** @type {UserSeat<VaultKit>} */
  const bobVaultSeat = await E(zoe).offer(
    await E(aethCollateralManager).makeVaultInvitation(),
    harden({
      give: { Collateral: bobCollateralAmount },
      want: { Minted: bobWantMinted },
    }),
    harden({
      Collateral: aeth.mint.mintPayment(bobCollateralAmount),
    }),
  );

  // A bidder places a bid //////////////////////////
  const bidAmount = run.make(3000n);
  const desired = aeth.make(590n);
  const bidderSeat = await bid(t, zoe, auctioneerKit, aeth, bidAmount, desired);

  const {
    vault: aliceVault,
    publicNotifiers: { vault: aliceVaultNotifier },
  } = await legacyOfferResult(aliceVaultSeat);
  const {
    vault: bobVault,
    publicNotifiers: { vault: bobVaultNotifier },
  } = await legacyOfferResult(bobVaultSeat);

  const aliceFee = ceilMultiplyBy(aliceWantMinted, mintFee);
  let aliceNotification = await E(aliceVaultNotifier).getUpdateSince();
  t.is(aliceNotification.value.vaultState, Phase.ACTIVE);
  t.deepEqual((await aliceNotification.value).debtSnapshot, {
    debt: AmountMath.add(aliceWantMinted, aliceFee),
    interest: makeRatio(100n, run.brand),
  });
  const { Minted: lentAmount } = await E(aliceVaultSeat).getFinalAllocation();
  t.truthy(AmountMath.isEqual(lentAmount, aliceWantMinted));
  t.deepEqual(await E(aliceVault).getCollateralAmount(), aeth.make(400n));

  await priceAuthority.setPrice(makeRatio(40n, run.brand, 10n, aeth.brand));
  aliceNotification = await E(aliceVaultNotifier).getUpdateSince();
  t.is(aliceNotification.value.vaultState, Phase.ACTIVE);

  const { startTime, time } = await startAuctionClock(
    auctioneerKit,
    manualTimer,
  );
  let currentTime = time;

  aliceNotification = await E(aliceVaultNotifier).getUpdateSince();
  t.is(aliceNotification.value.vaultState, Phase.LIQUIDATING);
  const bobNotification = await E(bobVaultNotifier).getUpdateSince();
  t.is(bobNotification.value.vaultState, Phase.LIQUIDATING);

  t.deepEqual(
    await E(aliceVault).getCollateralAmount(),
    aeth.makeEmpty(),
    'Collateral consumed while liquidating',
  );

  t.deepEqual(
    await E(aliceVault).getCurrentDebt(),
    multiplyBy(aliceWantMinted, initialDebtRatio),
    'Debt remains while liquidating',
  );

  t.deepEqual(
    await E(bobVault).getCollateralAmount(),
    aeth.makeEmpty(),
    'Collateral consumed while liquidating',
  );
  t.deepEqual(
    await E(bobVault).getCurrentDebt(),
    multiplyBy(bobWantMinted, initialDebtRatio),
    'Debt remains while liquidating',
  );

  currentTime = await setClockAndAdvanceNTimes(manualTimer, 2, startTime, 2n);
  trace(`advanced time to `, currentTime);

  aliceNotification = await E(aliceVaultNotifier).getUpdateSince();
  t.is(aliceNotification.value.vaultState, Phase.LIQUIDATED);

  t.truthy(await E(aliceVaultSeat).hasExited());

  const metricsTopic = await E.get(E(reservePublicFacet).getPublicTopics())
    .metrics;
  const m = await subscriptionTracker(t, metricsTopic);

  // FIXME bug in test or code?
  // await m.assertInitial(reserveInitialState(run.makeEmpty()));
  const debtAmountAfter = await E(aliceVault).getCurrentDebt();

  const finalNotification = await E(aliceVaultNotifier).getUpdateSince();
  t.is(finalNotification.value.vaultState, Phase.LIQUIDATED);

  const aliceCollateralOut = aeth.make(10n);
  t.deepEqual(finalNotification.value.locked, aliceCollateralOut);
  t.is(debtAmountAfter.value, 0n);

  const totalWantMinted = AmountMath.add(aliceWantMinted, bobWantMinted);
  t.deepEqual(await E(vaultFactory).getRewardAllocation(), {
    Minted: ceilMultiplyBy(totalWantMinted, mintFee),
  });

  /** @type {UserSeat<string>} */
  const aliceCloseSeat = await E(zoe).offer(
    E(aliceVault).makeCloseInvitation(),
  );
  await E(aliceCloseSeat).getOfferResult();

  /** @type {UserSeat<string>} */
  const bobCloseSeat = await E(zoe).offer(E(bobVault).makeCloseInvitation());
  await E(bobCloseSeat).getOfferResult();

  // Alice got nothing
  const alicePayouts = await E(aliceCloseSeat).getPayouts();
  const aliceCollOut = await aeth.issuer.getAmountOf(alicePayouts.Collateral);
  t.falsy(alicePayouts.Minted);
  t.deepEqual(aliceCollOut, aliceCollateralOut);
  t.deepEqual(await E(aliceVault).getCollateralAmount(), aeth.makeEmpty());

  // bob got something
  const bobPayouts = await E(bobCloseSeat).getPayouts();
  const bobCollOut = await aeth.issuer.getAmountOf(bobPayouts.Collateral);
  t.falsy(bobPayouts.Minted);
  t.deepEqual(bobCollOut, aeth.make(7n));
  t.deepEqual(await E(bobVault).getCollateralAmount(), aeth.makeEmpty());

  await E(bidderSeat).tryExit();
  //  Bidder bought 400 Aeth
  await assertBidderPayout(t, bidderSeat, run, 586n, aeth, 574n);

  await m.assertLike({
    allocations: {
      Aeth: aeth.make(9n),
      Fee: undefined,
    },
  });
});

test('Bug 7784 reconstitute both', async t => {
  const { zoe, aeth, run, rates: defaultRates } = t.context;

  const rates = harden({
    ...defaultRates,
    liquidationPenalty: makeRatio(1n, run.brand),
    liquidationMargin: run.makeRatio(150n),
    mintFee: run.makeRatio(50n, 10_000n),
  });
  t.context.rates = rates;

  const manualTimer = buildManualTimer();
  const services = await setupServices(
    t,
    makeRatio(1234n, run.brand, 100n, aeth.brand),
    aeth.make(1000n),
    manualTimer,
    ONE_WEEK,
    500n,
    { DiscountStep: 500n, LowestRate: 6500n, StartFrequency: ONE_HOUR },
  );

  const {
    vaultFactory: { aethVaultManager, aethCollateralManager },
    auctioneerKit: auctKit,
    priceAuthority,
    reserveKit: { reserveCreatorFacet, reservePublicFacet },
  } = services;
  await E(reserveCreatorFacet).addIssuer(aeth.issuer, 'Aeth');

  const cm = await E(aethVaultManager).getPublicFacet();
  const aethVaultMetrics = await vaultManagerMetricsTracker(t, cm);
  await aethVaultMetrics.assertInitial({
    // present
    numActiveVaults: 0,
    numLiquidatingVaults: 0,
    totalCollateral: aeth.make(0n),
    totalDebt: run.make(0n),
    retainedCollateral: aeth.make(0n),

    // running
    numLiquidationsCompleted: 0,
    numLiquidationsAborted: 0,
    totalOverageReceived: run.make(0n),
    totalProceedsReceived: run.make(0n),
    totalCollateralSold: aeth.make(0n),
    liquidatingCollateral: aeth.make(0n),
    liquidatingDebt: run.make(0n),
    totalShortfallReceived: run.make(0n),
    lockedQuote: null,
  });

  const openVault = (collateral, want) =>
    E(zoe).offer(
      E(aethCollateralManager).makeVaultInvitation(),
      harden({
        give: { Collateral: collateral },
        want: { Minted: want },
      }),
      harden({
        Collateral: aeth.mint.mintPayment(collateral),
      }),
    );

  const aliceWantMinted = run.make(100_000n);
  const collateral = aeth.make(15_000n);
  /** @type {UserSeat<VaultKit>} */
  const aliceVaultSeat = await openVault(collateral, aliceWantMinted);
  const {
    vault: aliceVault,
    publicNotifiers: { vault: aliceNotifier },
  } = await legacyOfferResult(aliceVaultSeat);
  let aliceUpdate = await E(aliceNotifier).getUpdateSince();
  t.is(aliceUpdate.value.vaultState, Phase.ACTIVE);
  await aethVaultMetrics.assertChange({
    numActiveVaults: 1,
    totalCollateral: { value: 15_000n },
    totalDebt: { value: 100_500n },
  });

  const bobWantMinted = run.make(103_000n);
  /** @type {UserSeat<VaultKit>} */
  const bobVaultSeat = await openVault(collateral, bobWantMinted);
  const {
    vault: bobVault,
    publicNotifiers: { vault: bobNotifier },
  } = await legacyOfferResult(bobVaultSeat);
  let bobUpdate = await E(bobNotifier).getUpdateSince();
  t.is(bobUpdate.value.vaultState, Phase.ACTIVE);

  await aethVaultMetrics.assertChange({
    numActiveVaults: 2,
    totalCollateral: { value: 30_000n },
    totalDebt: { value: 204_015n },
  });

  const carolWantMinted = run.make(105_000n);
  /** @type {UserSeat<VaultKit>} */
  const carolVaultSeat = await openVault(collateral, carolWantMinted);
  const {
    vault: carolVault,
    publicNotifiers: { vault: carolNotifier },
  } = await legacyOfferResult(carolVaultSeat);
  let carolUpdate = await E(carolNotifier).getUpdateSince();
  t.is(carolUpdate.value.vaultState, Phase.ACTIVE);
  await aethVaultMetrics.assertChange({
    numActiveVaults: 3,
    totalCollateral: { value: 45_000n },
    totalDebt: { value: 309_540n },
  });

  const { Minted: aliceLentAmount } =
    await E(aliceVaultSeat).getFinalAllocation();
  const aliceProceeds = await E(aliceVaultSeat).getPayouts();
  t.deepEqual(aliceLentAmount, aliceWantMinted, 'received 95 Minted');

  const aliceRunLent = await aliceProceeds.Minted;
  t.deepEqual(await E(run.issuer).getAmountOf(aliceRunLent), aliceWantMinted);

  // BIDDERs place BIDs //////////////////////////
  const bidderSeat1 = await bidDiscount(
    t,
    zoe,
    auctKit,
    aeth,
    run.make(25_000n),
    aeth.make(1000_000n),
    makeRatio(70n, run.brand),
  );
  const bidderSeat3 = await bidDiscount(
    t,
    zoe,
    auctKit,
    aeth,
    run.make(75_000n),
    aeth.make(1000_000n),
    makeRatio(78n, run.brand),
  );

  // price falls
  await priceAuthority.setPrice(makeRatio(9990n, run.brand, 1000n, aeth.brand));
  await eventLoopIteration();

  const { startTime } = await startAuctionClock(auctKit, manualTimer);

  await aethVaultMetrics.assertChange({
    lockedQuote: makeRatioFromAmounts(
      aeth.make(1_000_000n),
      run.make(9_990_000n),
    ),
  });

  await setClockAndAdvanceNTimes(manualTimer, 8n, startTime, 2n);

  await aethVaultMetrics.assertChange({
    liquidatingDebt: { value: 309_540n },
    liquidatingCollateral: { value: 45_000n },
    numActiveVaults: 0,
    numLiquidatingVaults: 3,
    lockedQuote: null,
  });

  aliceUpdate = await E(aliceNotifier).getUpdateSince();
  t.is(aliceUpdate.value.vaultState, Phase.ACTIVE);
  bobUpdate = await E(bobNotifier).getUpdateSince();
  t.is(bobUpdate.value.vaultState, Phase.ACTIVE);
  carolUpdate = await E(carolNotifier).getUpdateSince();
  t.is(carolUpdate.value.vaultState, Phase.LIQUIDATED);

  await aethVaultMetrics.assertChange({
    liquidatingDebt: { value: 0n },
    totalDebt: { value: 204_015n },
    liquidatingCollateral: { value: 0n },
    totalCollateral: { value: 29797n },
    totalCollateralSold: { value: 13_585n },
    totalProceedsReceived: { value: 100_000n },
    totalShortfallReceived: { value: 5_525n },
    numActiveVaults: 2,
    numLiquidatingVaults: 0,
    numLiquidationsCompleted: 1,
    numLiquidationsAborted: 2,
  });

  t.deepEqual(await E(aliceVault).getCollateralAmount(), aeth.make(14_899n));
  t.deepEqual(await E(aliceVault).getCurrentDebt(), run.make(100_500n));
  t.deepEqual(await E(bobVault).getCollateralAmount(), aeth.make(14_896n));
  t.deepEqual(await E(bobVault).getCurrentDebt(), run.make(103_515n));
  t.deepEqual(await E(carolVault).getCollateralAmount(), aeth.makeEmpty());
  t.deepEqual(await E(carolVault).getCurrentDebt(), run.makeEmpty());

  t.true(await E(bidderSeat3).hasExited());
  await assertBidderPayout(t, bidderSeat3, run, 0n, aeth, 10010n);
  t.true(await E(bidderSeat1).hasExited());
  await assertBidderPayout(t, bidderSeat1, run, 0n, aeth, 3575n);

  const metricsTopic = await E.get(E(reservePublicFacet).getPublicTopics())
    .metrics;
  const m = await subscriptionTracker(t, metricsTopic);

  await m.assertState({
    ...reserveInitialState(run.makeEmpty()),
    shortfallBalance: run.make(5_525n),
    allocations: {
      Aeth: aeth.make(1_620n),
    },
  });
});

// This test fails if `auctionDriver.capturePrices()` is moved from line 253 in
// https://github.com/Agoric/agoric-sdk/blob/bf4b59f2128aca73d786429c6ef4a7c9cdfb6700/packages/inter-protocol/src/auction/scheduler.js
// to line 310, which matches the code before #7803
test('Bug 7796 missing lockedPrice', async t => {
  const { zoe, aeth, run, rates: defaultRates } = t.context;

  const rates = harden({
    ...defaultRates,
    liquidationPenalty: makeRatio(1n, run.brand),
    liquidationMargin: run.makeRatio(150n),
    mintFee: run.makeRatio(50n, 10_000n),
    debtLimit: run.make(100_000_000_000n),
  });
  t.context.rates = rates;

  const manualTimer = buildManualTimer();
  const TEN_MINUTES = 10n * ONE_MINUTE;
  const services = await setupServices(
    t,
    makeRatio(1234n, run.brand, 100n, aeth.brand),
    aeth.make(1_000_000n),
    manualTimer,
    ONE_WEEK,
    500_000n,
    {
      DiscountStep: 500n,
      StartFrequency: ONE_HOUR,
      ClockStep: TEN_MINUTES,
    },
  );

  const {
    vaultFactory: { aethVaultManager, aethCollateralManager },
    auctioneerKit: auctKit,
    priceAuthority,
    reserveKit: { reserveCreatorFacet, reservePublicFacet },
  } = services;
  await E(reserveCreatorFacet).addIssuer(aeth.issuer, 'Aeth');

  const cm = await E(aethVaultManager).getPublicFacet();
  const aethVaultMetrics = await vaultManagerMetricsTracker(t, cm);
  await aethVaultMetrics.assertInitial({
    // present
    numActiveVaults: 0,
    numLiquidatingVaults: 0,
    totalCollateral: aeth.make(0n),
    totalDebt: run.make(0n),
    retainedCollateral: aeth.make(0n),

    // running
    numLiquidationsCompleted: 0,
    numLiquidationsAborted: 0,
    totalOverageReceived: run.make(0n),
    totalProceedsReceived: run.make(0n),
    totalCollateralSold: aeth.make(0n),
    liquidatingCollateral: aeth.make(0n),
    liquidatingDebt: run.make(0n),
    totalShortfallReceived: run.make(0n),
    lockedQuote: null,
  });

  const openVault = (collateral, want) =>
    E(zoe).offer(
      E(aethCollateralManager).makeVaultInvitation(),
      harden({
        give: { Collateral: collateral },
        want: { Minted: want },
      }),
      harden({
        Collateral: aeth.mint.mintPayment(collateral),
      }),
    );

  const aliceWantMinted = run.make(100_000_000n);
  const collateral = aeth.make(15_000_000n);
  /** @type {UserSeat<VaultKit>} */
  const aliceVaultSeat = await openVault(collateral, aliceWantMinted);
  const {
    vault: aliceVault,
    publicNotifiers: { vault: aliceNotifier },
  } = await legacyOfferResult(aliceVaultSeat);
  let aliceUpdate = await E(aliceNotifier).getUpdateSince();
  t.is(aliceUpdate.value.vaultState, Phase.ACTIVE);
  const aliceDebt = 100_500_000n;
  await aethVaultMetrics.assertChange({
    numActiveVaults: 1,
    totalCollateral: { value: 15_000_000n },
    totalDebt: { value: aliceDebt },
  });

  const bobWantMinted = run.make(103_000_000n);
  const bobDebt = 103_515_000n;
  /** @type {UserSeat<VaultKit>} */
  const bobVaultSeat = await openVault(collateral, bobWantMinted);
  const {
    vault: bobVault,
    publicNotifiers: { vault: bobNotifier },
  } = await legacyOfferResult(bobVaultSeat);
  const bobUpdate = await E(bobNotifier).getUpdateSince();
  t.is(bobUpdate.value.vaultState, Phase.ACTIVE);

  await aethVaultMetrics.assertChange({
    numActiveVaults: 2,
    totalCollateral: { value: 30_000_000n },
    totalDebt: { value: aliceDebt + bobDebt },
  });

  const carolWantMinted = run.make(105_000_000n);
  const carolDebt = 105_525_000n;
  /** @type {UserSeat<VaultKit>} */
  const carolVaultSeat = await openVault(collateral, carolWantMinted);
  const {
    vault: carolVault,
    publicNotifiers: { vault: carolNotifier },
  } = await legacyOfferResult(carolVaultSeat);
  const carolUpdate = await E(carolNotifier).getUpdateSince();
  t.is(carolUpdate.value.vaultState, Phase.ACTIVE);
  const totalCollateral = 45_000_000n;
  const totalDebt = aliceDebt + bobDebt + carolDebt;
  await aethVaultMetrics.assertChange({
    numActiveVaults: 3,
    totalCollateral: { value: totalCollateral },
    totalDebt: { value: totalDebt },
  });

  const { Minted: aliceLentAmount } =
    await E(aliceVaultSeat).getFinalAllocation();
  const aliceProceeds = await E(aliceVaultSeat).getPayouts();
  t.deepEqual(aliceLentAmount, aliceWantMinted, 'received 95 Minted');

  const aliceRunLent = await aliceProceeds.Minted;
  t.deepEqual(await E(run.issuer).getAmountOf(aliceRunLent), aliceWantMinted);

  // BIDDERs place BIDs //////////////////////////
  // bidder 1 will spend 80M at 90% of 9.99 for 8,897,786
  const bidder1Buys = 8_897_786n;
  const bidderSeat1 = await bidDiscount(
    t,
    zoe,
    auctKit,
    aeth,
    run.make(80_000_000n),
    aeth.make(1000_000_000n),
    makeRatio(90n, run.brand),
  );
  // bidder 2 will spend 90M at 90% of 9.99 for 10_010_010M
  const bidder2Buys = 10_010_010n;
  const bidderSeat2 = await bidPrice(
    t,
    zoe,
    auctKit,
    aeth,
    run.make(90_000_000n),
    aeth.make(100_000_000n),
    makeRatio(900n, run.brand, 100n, aeth.brand),
  );
  // bidder 3 will spend 309,540 - 170,000 = 139,540,000 at 85% of 9.99 for 16,432,903
  const bidder3Buys = 16_432_903n;
  const bidder3Spend = totalDebt - 80_000_000n - 90_000_000n;
  const bidderSeat3 = await bidDiscount(
    t,
    zoe,
    auctKit,
    aeth,
    run.make(150_000_000n),
    aeth.make(1000_000_000n),
    makeRatio(85n, run.brand),
  );
  const sold = bidder1Buys + bidder2Buys + bidder3Buys;

  // Before the price falls, we'll do a blank round of the auction to see if
  // that breaks the price capture. PriceLockPeriod is at its default of 3n.

  const { startTime } = await startAuctionClock(auctKit, manualTimer);

  await aethVaultMetrics.assertChange({
    lockedQuote: makeRatioFromAmounts(
      aeth.make(1_000_000n),
      run.make(12_340_000n),
    ),
  });
  let now = await setClockAndAdvanceNTimes(
    manualTimer,
    3n,
    startTime,
    TEN_MINUTES,
  );

  trace('ADVANCING', now);
  // price falls
  const newPrice = makeRatio(9990n, run.brand, 1000n, aeth.brand);
  await priceAuthority.setPrice(newPrice);
  await eventLoopIteration();

  now = await setClockAndAdvanceNTimes(
    manualTimer,
    10n,
    TimeMath.addAbsRel(now, TimeMath.relValue(ONE_HOUR)),
    TEN_MINUTES,
  );

  // Penalty is 1% of the debt valued at auction start price = proceeds/9.99
  const penaltyAeth = 309_850n;

  await aethVaultMetrics.assertChange({
    lockedQuote: null,
  });
  await aethVaultMetrics.assertChange({
    lockedQuote: makeRatioFromAmounts(
      aeth.make(1_000_000n),
      run.make(9_990_000n),
    ),
  });
  await aethVaultMetrics.assertChange({
    liquidatingDebt: { value: totalDebt },
    liquidatingCollateral: { value: totalCollateral },
    numActiveVaults: 0,
    numLiquidatingVaults: 3,
    lockedQuote: null,
  });

  aliceUpdate = await E(aliceNotifier).getUpdateSince();
  t.is(aliceUpdate.value.vaultState, Phase.LIQUIDATED);

  await aethVaultMetrics.assertChange({
    liquidatingDebt: { value: 0n },
    totalDebt: { value: 0n },
    liquidatingCollateral: { value: 0n },
    totalCollateral: { value: 0n },
    totalCollateralSold: { value: sold },
    totalProceedsReceived: { value: totalDebt },
    numLiquidatingVaults: 0,
    numLiquidationsCompleted: 3,
  });

  const maxVaultReturn = makeMaxCalculator(
    aeth,
    run,
    penaltyAeth,
    sold,
    totalDebt,
  );

  const aliceReturn = maxVaultReturn(collateral, run.make(aliceDebt));
  t.deepEqual(await E(aliceVault).getCollateralAmount(), aliceReturn);
  t.deepEqual(await E(aliceVault).getCurrentDebt(), run.makeEmpty());
  const bobReturn = maxVaultReturn(collateral, run.make(bobDebt));
  t.deepEqual(await E(bobVault).getCollateralAmount(), bobReturn);
  t.deepEqual(await E(bobVault).getCurrentDebt(), run.makeEmpty());
  const carolReturn = maxVaultReturn(collateral, run.make(carolDebt));
  t.deepEqual(await E(carolVault).getCollateralAmount(), carolReturn);
  t.deepEqual(await E(carolVault).getCurrentDebt(), run.makeEmpty());

  t.false(await E(bidderSeat3).hasExited());
  await E(bidderSeat3).tryExit();
  t.true(await E(bidderSeat3).hasExited());
  await assertBidderPayout(
    t,
    bidderSeat3,
    run,
    150_000_000n - bidder3Spend,
    aeth,
    bidder3Buys,
  );
  t.true(await E(bidderSeat1).hasExited());
  await assertBidderPayout(t, bidderSeat1, run, 0n, aeth, bidder1Buys);

  t.true(await E(bidderSeat2).hasExited());
  await assertBidderPayout(t, bidderSeat2, run, 0n, aeth, bidder2Buys);

  const metricsTopic = await E.get(E(reservePublicFacet).getPublicTopics())
    .metrics;
  const m = await subscriptionTracker(t, metricsTopic);

  await m.assertState({
    ...reserveInitialState(run.makeEmpty()),
    shortfallBalance: run.makeEmpty(),
    allocations: {
      Aeth: aeth.make(309_852n),
    },
  });
});

test('Bug 7851 & no bidders', async t => {
  const { zoe, aeth, run, rates: defaultRates } = t.context;

  const rates = harden({
    ...defaultRates,
    liquidationPenalty: makeRatio(1n, run.brand),
    liquidationMargin: run.makeRatio(150n),
    mintFee: run.makeRatio(50n, 10_000n),
  });
  t.context.rates = rates;

  const manualTimer = buildManualTimer();
  const services = await setupServices(
    t,
    makeRatio(1234n, run.brand, 100n, aeth.brand),
    aeth.make(1000n),
    manualTimer,
    ONE_WEEK,
    500n,
    {
      DiscountStep: 500n,
      StartFrequency: ONE_HOUR,
      ClockStep: 10n * ONE_MINUTE,
    },
  );

  const {
    vaultFactory: { aethVaultManager, aethCollateralManager },
    auctioneerKit: auctKit,
    priceAuthority,
    reserveKit: { reserveCreatorFacet, reservePublicFacet },
  } = services;
  await E(reserveCreatorFacet).addIssuer(aeth.issuer, 'Aeth');

  const cm = await E(aethVaultManager).getPublicFacet();
  const aethVaultMetrics = await vaultManagerMetricsTracker(t, cm);
  await aethVaultMetrics.assertInitial({
    // present
    numActiveVaults: 0,
    numLiquidatingVaults: 0,
    totalCollateral: aeth.make(0n),
    totalDebt: run.make(0n),
    retainedCollateral: aeth.make(0n),

    // running
    numLiquidationsCompleted: 0,
    numLiquidationsAborted: 0,
    totalOverageReceived: run.make(0n),
    totalProceedsReceived: run.make(0n),
    totalCollateralSold: aeth.make(0n),
    liquidatingCollateral: aeth.make(0n),
    liquidatingDebt: run.make(0n),
    totalShortfallReceived: run.make(0n),
    lockedQuote: null,
  });

  const openVault = (collateral, want) =>
    E(zoe).offer(
      E(aethCollateralManager).makeVaultInvitation(),
      harden({
        give: { Collateral: collateral },
        want: { Minted: want },
      }),
      harden({
        Collateral: aeth.mint.mintPayment(collateral),
      }),
    );

  const aliceWantMinted = run.make(100_000n);
  const aliceDebt = 100_500n;
  const collateral = 15_000n;
  /** @type {UserSeat<VaultKit>} */
  const aliceVaultSeat = await openVault(
    aeth.make(collateral),
    aliceWantMinted,
  );
  const {
    vault: aliceVault,
    publicNotifiers: { vault: aliceNotifier },
  } = await legacyOfferResult(aliceVaultSeat);
  let aliceUpdate = await E(aliceNotifier).getUpdateSince();
  t.is(aliceUpdate.value.vaultState, Phase.ACTIVE);
  await aethVaultMetrics.assertChange({
    numActiveVaults: 1,
    totalCollateral: { value: collateral },
    totalDebt: { value: aliceDebt },
  });

  const { Minted: aliceLentAmount } =
    await E(aliceVaultSeat).getFinalAllocation();
  const aliceProceeds = await E(aliceVaultSeat).getPayouts();
  t.deepEqual(aliceLentAmount, aliceWantMinted, 'received 95 Minted');

  const aliceRunLent = await aliceProceeds.Minted;
  t.deepEqual(await E(run.issuer).getAmountOf(aliceRunLent), aliceWantMinted);

  const { startTime } = await startAuctionClock(auctKit, manualTimer);
  await setClockAndAdvanceNTimes(manualTimer, 3n, startTime, 10n * ONE_MINUTE);
  await aethVaultMetrics.assertChange({
    lockedQuote: makeRatioFromAmounts(
      aeth.make(1_000_000n),
      run.make(12_340_000n),
    ),
  });

  // price falls
  await priceAuthority.setPrice(makeRatio(9990n, run.brand, 1000n, aeth.brand));
  await eventLoopIteration();

  await setClockAndAdvanceNTimes(
    manualTimer,
    5n,
    TimeMath.addAbsRel(startTime, TimeMath.relValue(ONE_HOUR)),
    10n * ONE_MINUTE,
  );

  await aethVaultMetrics.assertChange({
    lockedQuote: null,
  });
  await aethVaultMetrics.assertChange({
    lockedQuote: makeRatioFromAmounts(
      aeth.make(1_000_000n),
      run.make(9_990_000n),
    ),
  });
  await aethVaultMetrics.assertChange({
    liquidatingDebt: { value: aliceDebt },
    liquidatingCollateral: { value: collateral },
    numActiveVaults: 0,
    numLiquidatingVaults: 1,
    lockedQuote: null,
  });

  trace('liquidated?');
  await eventLoopIteration();
  aliceUpdate = await E(aliceNotifier).getUpdateSince(aliceUpdate.updateCount);
  t.is(aliceUpdate.value.vaultState, Phase.ACTIVE);

  const penalty = 101n;
  const collateralReduced = aeth.make(collateral - penalty);
  t.deepEqual(await E(aliceVault).getCollateralAmount(), collateralReduced);
  t.deepEqual(await E(aliceVault).getCurrentDebt(), run.make(aliceDebt));

  const metricsTopic = await E.get(E(reservePublicFacet).getPublicTopics())
    .metrics;
  const m = await subscriptionTracker(t, metricsTopic);

  await m.assertState({
    ...reserveInitialState(run.makeEmpty()),
    shortfallBalance: run.make(0n),
    allocations: {
      Aeth: aeth.make(penalty),
    },
  });

  await aethVaultMetrics.assertNoUpdate();
});
