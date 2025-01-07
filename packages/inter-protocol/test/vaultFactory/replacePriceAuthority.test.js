import { test as unknownTest } from '@agoric/zoe/tools/prepare-test-env-ava.js';

import { AmountMath, makeIssuerKit } from '@agoric/ertp';
import {
  allValues,
  deeplyFulfilledObject,
  makeTracer,
  objectMap,
} from '@agoric/internal';
import { unsafeMakeBundleCache } from '@agoric/swingset-vat/tools/bundleTool.js';
import { makeRatio } from '@agoric/zoe/src/contractSupport/index.js';
import { eventLoopIteration } from '@agoric/internal/src/testing-utils.js';
import { buildManualTimer } from '@agoric/swingset-vat/tools/manual-timer.js';
import { E } from '@endo/eventual-send';
import { TimeMath } from '@agoric/time';
import { providePriceAuthorityRegistry } from '@agoric/vats/src/priceAuthorityRegistry.js';
import { makeScalarMapStore } from '@agoric/vat-data/src/index.js';
import { makeManualPriceAuthority } from '@agoric/zoe/tools/manualPriceAuthority.js';
import { makeNotifierFromAsyncIterable, subscribeEach } from '@agoric/notifier';

import {
  installPuppetGovernance,
  produceInstallations,
  setupBootstrap,
  setUpZoeForTest,
  withAmountUtils,
} from '../supports.js';
import { startEconomicCommittee } from '../../src/proposals/startEconCommittee.js';
import {
  setupReserve,
  startAuctioneer,
  SECONDS_PER_DAY as ONE_DAY,
  SECONDS_PER_HOUR as ONE_HOUR,
  SECONDS_PER_WEEK as ONE_WEEK,
  startVaultFactory,
} from '../../src/proposals/econ-behaviors.js';

import { defaultParamValues } from './vaultFactoryUtils.js';

/**
 * @import {VaultFactoryContract as VFC} from '../../src/vaultFactory/vaultFactory.js';
 * @import {AmountUtils} from '@agoric/zoe/tools/test-utils.js';
 */

/**
 * @typedef {Record<string, any> & {
 *   aeth: IssuerKit & AmountUtils;
 *   run: IssuerKit & AmountUtils;
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

/** @import {VaultFactoryContract} from '../../src/vaultFactory/vaultFactory' */

const trace = makeTracer('Test replc PriceAuthority', false);

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
  const installation = objectMap(bundles, async bundle =>
    E(zoe).install(bundle),
  );

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
  const frozenCtx = await deeplyFulfilledObject(harden(contextPs));
  t.context = {
    ...frozenCtx,
    bundleCache,
    // @ts-expect-error XXX AssetIssuerKit
    aeth,
    // @ts-expect-error XXX AssetIssuerKit
    run,
  };
  trace(t, 'CONTEXT');
});

/**
 * @param {import('ava').ExecutionContext<Context>} t
 * @param {IssuerKit<'nat'>} run
 * @param {IssuerKit<'nat'>} aeth
 * @param {NatValue[] | Ratio} priceOrList
 * @param {RelativeTime} quoteInterval
 * @param {Amount | undefined} unitAmountIn
 * @param {Partial<import('../../src/auction/params.js').AuctionParams>} actionParamArgs
 */
export const setupElectorateReserveAndAuction = async (
  t,
  run,
  aeth,
  priceOrList,
  quoteInterval,
  unitAmountIn,
  {
    StartFrequency = ONE_WEEK,
    DiscountStep = 2000n,
    LowestRate = 5500n,
    ClockStep = 2n,
    StartingRate = 10_500n,
    AuctionStartDelay = 10n,
    PriceLockPeriod = 3n,
  },
) => {
  const {
    zoe,
    electorateTerms = { committeeName: 'The Cabal', committeeSize: 1 },
    timer,
  } = t.context;

  const space = await setupBootstrap(t, timer);
  installPuppetGovernance(zoe, space.installation.produce);
  produceInstallations(space, t.context.installation);

  await startEconomicCommittee(space, electorateTerms);
  await setupReserve(space);
  // const quoteIssuerKit = makeIssuerKit('quote', AssetKind.SET);

  /** @type {import('@agoric/vat-data').Baggage} */
  const paBaggage = makeScalarMapStore();
  const { priceAuthority, adminFacet: registry } =
    providePriceAuthorityRegistry(paBaggage);
  space.produce.priceAuthority.resolve(priceAuthority);

  const pa = makeManualPriceAuthority({
    actualBrandIn: aeth.brand,
    actualBrandOut: run.brand,
    timer,
    initialPrice: makeRatio(1000n, run.brand, 100n, aeth.brand),
  });
  await E(registry).registerPriceAuthority(pa, aeth.brand, run.brand, true);

  const auctionParams = {
    StartFrequency,
    ClockStep,
    StartingRate,
    LowestRate,
    DiscountStep,
    AuctionStartDelay,
    PriceLockPeriod,
  };

  await startAuctioneer(space, { auctionParams });
  return { space, thePriceAuthority: pa, registry };
};

/**
 * NOTE: called separately by each test so zoe/priceAuthority don't interfere
 *
 * @param {import('ava').ExecutionContext<Context>} t
 * @param {NatValue[] | Ratio} priceOrList
 * @param {Amount | undefined} unitAmountIn
 * @param {import('@agoric/time').TimerService} timer
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

  const { space, thePriceAuthority, registry } =
    await setupElectorateReserveAndAuction(
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
  /** @import {AuctioneerKit} from '../../src/proposals/econ-behaviors.js' */
  /** @import {ManualPriceAuthority} from '@agoric/zoe/tools/manualPriceAuthority.js' */
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
    thePriceAuthority,
    registry,
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

test('replace priceAuthority', async t => {
  const { aeth, run, rates: defaultRates } = t.context;

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
    reserveKit: { reserveCreatorFacet },
  } = services;
  await E(reserveCreatorFacet).addIssuer(aeth.issuer, 'Aeth');

  // initial loan /////////////////////////////////////
  const { aethVaultManager } = services.vaultFactory;

  const publicFacet = await E(aethVaultManager).getPublicFacet();
  const publicTopics = await E(publicFacet).getPublicTopics();
  const subscription = subscribeEach(publicTopics.metrics.subscriber);
  const aethVaultNotifier = await makeNotifierFromAsyncIterable(subscription);

  const newPa = makeManualPriceAuthority({
    actualBrandIn: aeth.brand,
    actualBrandOut: run.brand,
    timer: t.context.timer,
    initialPrice: makeRatio(70n, run.brand, 10n, aeth.brand),
  });
  await E(services.registry).registerPriceAuthority(
    newPa,
    aeth.brand,
    run.brand,
    true,
  );
  services.thePriceAuthority.disable();

  await eventLoopIteration();

  let update = await E(aethVaultNotifier).getUpdateSince();
  let startTime;
  ({ startTime } = await startAuctionClock(auctioneerKit, manualTimer));
  await setClockAndAdvanceNTimes(manualTimer, 2n, startTime, 2n);

  await eventLoopIteration();
  ({ startTime } = await startAuctionClock(auctioneerKit, manualTimer));
  await setClockAndAdvanceNTimes(manualTimer, 2n, startTime, 2n);

  update = await E(aethVaultNotifier).getUpdateSince(update.updateCount);
  t.deepEqual(
    update.value.lockedQuote?.numerator,
    AmountMath.make(aeth.brand, 1000_000n),
  );
});
