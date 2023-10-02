import '@agoric/zoe/exported.js';
import { test as unknownTest } from '@agoric/zoe/tools/prepare-test-env-ava.js';

import { AmountMath, AssetKind, makeIssuerKit } from '@agoric/ertp';
import { combine, split } from '@agoric/ertp/src/legacy-payment-helpers.js';
import { allValues, makeTracer, objectMap } from '@agoric/internal';
import { eventLoopIteration } from '@agoric/internal/src/testing-utils.js';
import { makeNotifierFromAsyncIterable } from '@agoric/notifier';
import { M, matches } from '@agoric/store';
import { unsafeMakeBundleCache } from '@agoric/swingset-vat/tools/bundleTool.js';
import {
  ceilMultiplyBy,
  makeRatio,
} from '@agoric/zoe/src/contractSupport/index.js';
import {
  assertAmountsEqual,
  assertPayoutAmount,
} from '@agoric/zoe/test/zoeTestHelpers.js';
import { makeManualPriceAuthority } from '@agoric/zoe/tools/manualPriceAuthority.js';

import { documentStorageSchema } from '@agoric/governance/tools/storageDoc.js';
import buildManualTimer from '@agoric/zoe/tools/manualTimer.js';
import { makeScriptedPriceAuthority } from '@agoric/zoe/tools/scriptedPriceAuthority.js';
import { E } from '@endo/eventual-send';
import { deeplyFulfilled } from '@endo/marshal';
import { calculateCurrentDebt } from '../../src/interest-math.js';
import { SECONDS_PER_YEAR } from '../../src/interest.js';
import { startVaultFactory } from '../../src/proposals/econ-behaviors.js';
import '../../src/vaultFactory/types-ambient.js';
import {
  metricsTracker,
  reserveInitialState,
  subscriptionTracker,
  vaultManagerMetricsTracker,
} from '../metrics.js';
import { setUpZoeForTest, withAmountUtils } from '../supports.js';
import {
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

const trace = makeTracer('TestVF', false);

const SECONDS_PER_DAY = SECONDS_PER_YEAR / 365n;
const SECONDS_PER_WEEK = SECONDS_PER_DAY * 7n;

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
    makeIssuerKit('aEth', AssetKind.NAT, { decimalPlaces: 6 }),
  );

  const bundleCache = await unsafeMakeBundleCache('./bundles/'); // package-relative
  // note that the liquidation might be a different bundle name
  const bundles = await allValues({
    faucet: bundleCache.load(contractRoots.faucet, 'faucet'),
    VaultFactory: bundleCache.load(contractRoots.VaultFactory, 'VaultFactory'),
    auctioneer: bundleCache.load(contractRoots.auctioneer, 'auction'),
    reserve: bundleCache.load(contractRoots.reserve, 'reserve'),
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
 * @param {bigint} [startFrequency]
 */
const setupServices = async (
  t,
  priceOrList,
  unitAmountIn,
  timer = buildManualTimer(t.log, 0n, { eventLoopIteration }),
  quoteInterval = 1n,
  stableInitialLiquidity,
  startFrequency = undefined,
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

  const runPayment = await getRunFromFaucet(t, stableInitialLiquidity);
  trace(t, 'faucet', { stableInitialLiquidity, runPayment });

  const { space } = await setupElectorateReserveAndAuction(
    t,
    // @ts-expect-error inconsistent types with withAmountUtils
    run,
    aeth,
    priceOrList,
    quoteInterval,
    unitAmountIn,
    { StartFrequency: startFrequency },
  );

  const { consume, produce } = space;

  const quoteIssuerKit = makeIssuerKit('quote', AssetKind.SET);
  // Cheesy hack for easy use of manual price authority
  const pa = Array.isArray(priceOrList)
    ? makeScriptedPriceAuthority({
        actualBrandIn: aeth.brand,
        actualBrandOut: run.brand,
        priceList: priceOrList,
        timer,
        quoteMint: quoteIssuerKit.mint,
        unitAmountIn,
        quoteInterval,
      })
    : makeManualPriceAuthority({
        actualBrandIn: aeth.brand,
        actualBrandOut: run.brand,
        initialPrice: priceOrList,
        timer,
        quoteIssuerKit,
      });
  produce.priceAuthority.resolve(pa);

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
  const reserveKit = { reserveCreatorFacet, reservePublicFacet };

  // Add a vault that will lend on aeth collateral
  /** @type {Promise<VaultManager>} */
  const aethVaultManagerP = E(vaultFactoryCreatorFacetP).addVaultType(
    aeth.issuer,
    'AEth',
    rates,
  );
  /**
   * @type {[
   *   any,
   *   VaultFactoryCreatorFacet,
   *   VFC['publicFacet'],
   *   VaultManager,
   *   PriceAuthority,
   *   CollateralManager,
   * ]}
   */
  const [
    governorInstance,
    vaultFactory, // creator
    vfPublic,
    aethVaultManager,
    priceAuthority,
    aethCollateralManager,
  ] = await Promise.all([
    E(consume.agoricNames).lookup('instance', 'VaultFactoryGovernor'),
    vaultFactoryCreatorFacetP,
    E.get(consume.vaultFactoryKit).publicFacet,
    aethVaultManagerP,
    consume.priceAuthority,
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
      // name for backwards compatiiblity
      lender: E(vfPublic).getCollateralManager(aeth.brand),
      vaultFactory,
      vfPublic,
      aethVaultManager,
      aethCollateralManager,
    },
  };

  return {
    zoe,
    governor: g,
    vaultFactory: v,
    runKit: { issuer: run.issuer, brand: run.brand },
    priceAuthority,
    reserveKit,
    space,
  };
};

test('first', async t => {
  const { aeth, run, zoe, rates } = t.context;
  t.context.interestTiming = {
    chargingPeriod: 2n,
    recordingPeriod: 10n,
  };

  const services = await setupServices(
    t,
    [500n, 15n],
    aeth.make(900n),
    undefined,
    undefined,
    500n,
  );
  const { vaultFactory, vfPublic } = services.vaultFactory;
  trace(t, 'services', { services, vaultFactory, vfPublic });

  // Create a loan for 470 Minted with 1100 aeth collateral
  const collateralAmount = aeth.make(1100n);
  const wantMinted = run.make(470n);
  /** @type {UserSeat<VaultKit>} */
  const vaultSeat = await E(zoe).offer(
    await E(E(vfPublic).getCollateralManager(aeth.brand)).makeVaultInvitation(),
    harden({
      give: { Collateral: collateralAmount },
      want: { Minted: wantMinted },
    }),
    harden({
      Collateral: aeth.mint.mintPayment(collateralAmount),
    }),
  );

  const { vault } = await legacyOfferResult(vaultSeat);
  const debtAmount = await E(vault).getCurrentDebt();
  const fee = ceilMultiplyBy(run.make(470n), rates.mintFee);
  t.deepEqual(
    debtAmount,
    AmountMath.add(wantMinted, fee),
    'vault lent 470 Minted',
  );
  trace(t, 'correct debt', debtAmount);

  const { Minted: lentAmount } = await E(vaultSeat).getFinalAllocation();
  const proceeds = await E(vaultSeat).getPayouts();
  const runLent = await proceeds.Minted;
  t.deepEqual(lentAmount, wantMinted, 'received 47 Minted');
  t.deepEqual(
    await E(vault).getCollateralAmount(),
    aeth.make(1100n),
    'vault holds 1100 Collateral',
  );

  // Add more collateral to an existing loan. We get nothing back but a warm
  // fuzzy feeling.

  // partially payback
  const collateralWanted = aeth.make(100n);
  const paybackAmount = run.make(200n);
  const [paybackPayment, _remainingPayment] = await split(
    E(run.issuer).makeEmptyPurse(),
    runLent,
    paybackAmount,
  );

  const seat = await E(zoe).offer(
    await E(vault).makeAdjustBalancesInvitation(),
    harden({
      give: { Minted: paybackAmount },
      want: { Collateral: collateralWanted },
    }),
    harden({
      Minted: paybackPayment,
    }),
  );

  const payouts = E(seat).getPayouts();
  const { Collateral: returnedCollateral, Minted: returnedRun } = await payouts;
  t.deepEqual(
    await E(vault).getCurrentDebt(),
    run.make(294n),
    'debt reduced to 294 Minted',
  );
  t.deepEqual(
    await E(vault).getCollateralAmount(),
    aeth.make(1000n),
    'vault holds 1000 Collateral',
  );
  t.deepEqual(
    await aeth.issuer.getAmountOf(returnedCollateral),
    aeth.make(100n),
    'withdrew 100 collateral',
  );
  t.deepEqual(
    await E(run.issuer).getAmountOf(returnedRun),
    run.makeEmpty(),
    'received no run',
  );

  t.deepEqual(await E(vaultFactory).getRewardAllocation(), {
    Minted: run.make(24n),
  });
});

test('interest on multiple vaults', async t => {
  const { zoe, aeth, run, rates: defaultRates } = t.context;
  const rates = {
    ...defaultRates,
    interestRate: makeRatio(5n, run.brand),
  };
  t.context.rates = rates;
  // charging period is 1 week. Clock ticks by days
  t.context.interestTiming = {
    chargingPeriod: SECONDS_PER_WEEK,
    recordingPeriod: SECONDS_PER_WEEK,
  };
  const manualTimer = buildManualTimer(t.log, 0n, {
    timeStep: SECONDS_PER_DAY,
    eventLoopIteration,
  });
  const services = await setupServices(
    t,
    [500n, 1500n],
    aeth.make(90n),
    manualTimer,
    SECONDS_PER_DAY,
    500n,
    // manual timer steps with granularity of a day, which confuses the auction
    52n * 7n * 24n * 3600n,
  );
  const { aethCollateralManager, vaultFactory, vfPublic } =
    services.vaultFactory;

  // Create a loan for Alice for 4700 Minted with 1100 aeth collateral
  const collateralAmount = aeth.make(1100n);
  const aliceWantMinted = run.make(4700n);
  /** @type {UserSeat<VaultKit>} */
  const aliceVaultSeat = await E(zoe).offer(
    E(E(vfPublic).getCollateralManager(aeth.brand)).makeVaultInvitation(),
    harden({
      give: { Collateral: collateralAmount },
      want: { Minted: aliceWantMinted },
    }),
    harden({
      Collateral: aeth.mint.mintPayment(collateralAmount),
    }),
  );
  const {
    vault: aliceVault,
    publicNotifiers: { vault: aliceNotifier },
  } = await legacyOfferResult(aliceVaultSeat);

  const debtAmount = await E(aliceVault).getCurrentDebt();
  const fee = ceilMultiplyBy(aliceWantMinted, rates.mintFee);
  t.deepEqual(
    debtAmount,
    AmountMath.add(aliceWantMinted, fee),
    'vault lent 4700 Minted + fees',
  );

  const { Minted: lentAmount } = await E(aliceVaultSeat).getFinalAllocation();
  const proceeds = await E(aliceVaultSeat).getPayouts();
  t.deepEqual(lentAmount, aliceWantMinted, 'received 4700 Minted');

  const runLent = await proceeds.Minted;
  t.truthy(
    AmountMath.isEqual(
      await E(run.issuer).getAmountOf(runLent),
      run.make(4700n),
    ),
  );

  // Create a loan for Bob for 3200 Minted with 800 aeth collateral
  const bobCollateralAmount = aeth.make(800n);
  const bobWantMinted = run.make(3200n);
  /** @type {UserSeat<VaultKit>} */
  const bobVaultSeat = await E(zoe).offer(
    E(E(vfPublic).getCollateralManager(aeth.brand)).makeVaultInvitation(),
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
  t.deepEqual(
    bobDebtAmount,
    AmountMath.add(bobWantMinted, bobFee),
    'vault lent 3200 Minted + fees',
  );

  const { Minted: bobLentAmount } = await E(bobVaultSeat).getFinalAllocation();
  const bobProceeds = await E(bobVaultSeat).getPayouts();
  t.deepEqual(bobLentAmount, bobWantMinted, 'received 4700 Minted');

  const bobRunLent = await bobProceeds.Minted;
  t.truthy(
    AmountMath.isEqual(
      await E(run.issuer).getAmountOf(bobRunLent),
      run.make(3200n),
    ),
  );

  // { chargingPeriod: weekly, recordingPeriod: weekly }
  // Advance 8 days, past one charging and recording period
  await manualTimer.tickN(8);

  const publicTopics = await E(aethCollateralManager).getPublicTopics();
  const assetUpdate = (await E(publicTopics.asset.subscriber).subscribeAfter())
    .head;

  const aliceUpdate = await E(aliceNotifier).getUpdateSince();
  const bobUpdate = await E(bobNotifier).getUpdateSince();

  // 160n is initial fee. interest is ~3n/week. compounding is in the noise.
  const bobAddedDebt = 160n + 3n;
  t.deepEqual(
    calculateCurrentDebt(
      bobUpdate.value.debtSnapshot.debt,
      bobUpdate.value.debtSnapshot.interest,
      assetUpdate.value.compoundedInterest,
    ),
    run.make(3200n + bobAddedDebt),
  );

  // 236 is the initial fee. Interest is ~4n/week
  const aliceAddedDebt = 236n + 4n;
  t.deepEqual(
    calculateCurrentDebt(
      aliceUpdate.value.debtSnapshot.debt,
      aliceUpdate.value.debtSnapshot.interest,
      assetUpdate.value.compoundedInterest,
    ),
    run.make(4700n + aliceAddedDebt),
    `should have collected ${aliceAddedDebt}`,
  );
  // but no change to the snapshot
  t.deepEqual(aliceUpdate.value.debtSnapshot, {
    debt: run.make(4935n),
    interest: makeRatio(100n, run.brand, 100n),
  });

  const rewardAllocation = await E(vaultFactory).getRewardAllocation();
  const rewardRunCount = aliceAddedDebt + bobAddedDebt;
  t.is(
    rewardAllocation.Minted.value,
    rewardRunCount,
    // reward includes 5% fees on two loans plus 1% interest three times on each
    `Should be ${rewardRunCount}, was ${rewardAllocation.Minted.value}`,
  );

  // try opening a vault that can't cover fees
  /** @type {UserSeat<VaultKit>} */
  const caroleVaultSeat = await E(zoe).offer(
    E(E(vfPublic).getCollateralManager(aeth.brand)).makeVaultInvitation(),
    harden({
      give: { Collateral: aeth.make(200n) },
      want: { Minted: run.make(0n) }, // no debt
    }),
    harden({
      Collateral: aeth.mint.mintPayment(aeth.make(200n)),
    }),
  );
  await t.throwsAsync(E(caroleVaultSeat).getOfferResult());

  // Advance another 7 days, past one charging and recording period
  await manualTimer.tickN(8);

  // open a vault when manager's interest already compounded
  const wantedRun = 1_000n;
  /** @type {UserSeat<VaultKit>} */
  const danVaultSeat = await E(zoe).offer(
    E(E(vfPublic).getCollateralManager(aeth.brand)).makeVaultInvitation(),
    harden({
      give: { Collateral: aeth.make(2_000n) },
      want: { Minted: run.make(wantedRun) },
    }),
    harden({
      Collateral: aeth.mint.mintPayment(aeth.make(2_000n)),
    }),
  );
  const {
    vault: danVault,
    publicNotifiers: { vault: danNotifier },
  } = await legacyOfferResult(danVaultSeat);
  const danActualDebt = wantedRun + 50n; // includes fees
  t.is((await E(danVault).getCurrentDebt()).value, danActualDebt);
  const normalizedDebt = (await E(danVault).getNormalizedDebt()).value;
  t.true(
    normalizedDebt < danActualDebt,
    `Normalized debt ${normalizedDebt} must be less than actual ${danActualDebt} (after any time elapsed)`,
  );
  t.is((await E(danVault).getNormalizedDebt()).value, 1_048n);
  const danUpdate = await E(danNotifier).getUpdateSince();
  // snapshot should equal actual since no additional time has elapsed
  const { debtSnapshot: danSnap } = danUpdate.value;
  t.is(danSnap.debt.value, danActualDebt);
});

test('adjust balances', async t => {
  const { zoe, aeth, run, rates } = t.context;
  t.context;

  const services = await setupServices(
    t,
    [15n],
    aeth.make(1n),
    buildManualTimer(t.log),
    undefined,
    500n,
  );
  const { vfPublic } = services.vaultFactory;

  // initial loan /////////////////////////////////////

  // Create a loan for Alice for 5000 Minted with 1000 aeth collateral
  const collateralAmount = aeth.make(1000n);
  const aliceWantMinted = run.make(5000n);
  /** @type {UserSeat<VaultKit>} */
  const aliceVaultSeat = await E(zoe).offer(
    E(E(vfPublic).getCollateralManager(aeth.brand)).makeVaultInvitation(),
    harden({
      give: { Collateral: collateralAmount },
      want: { Minted: aliceWantMinted },
    }),
    harden({
      Collateral: aeth.mint.mintPayment(collateralAmount),
    }),
  );
  const {
    vault: aliceVault,
    publicNotifiers: { vault: aliceNotifier },
  } = await legacyOfferResult(aliceVaultSeat);

  let debtAmount = await E(aliceVault).getCurrentDebt();
  const fee = ceilMultiplyBy(aliceWantMinted, rates.mintFee);
  let debtLevel = AmountMath.add(aliceWantMinted, fee);
  let collateralLevel = aeth.make(1000n);

  t.deepEqual(debtAmount, debtLevel, 'vault lent 5000 Minted + fees');
  const { Minted: lentAmount } = await E(aliceVaultSeat).getFinalAllocation();
  const proceeds = await E(aliceVaultSeat).getPayouts();
  t.deepEqual(lentAmount, aliceWantMinted, 'received 5000 Minted');

  const runLent = await proceeds.Minted;
  t.truthy(
    AmountMath.isEqual(
      await E(run.issuer).getAmountOf(runLent),
      run.make(5000n),
    ),
  );

  let aliceUpdate = await E(aliceNotifier).getUpdateSince();
  t.deepEqual(aliceUpdate.value.debtSnapshot.debt, debtLevel);
  t.deepEqual(aliceUpdate.value.debtSnapshot, {
    debt: run.make(5250n),
    interest: makeRatio(100n, run.brand),
  });

  // increase collateral 1 ///////////////////////////////////// (give both)

  // Alice increase collateral by 100, paying in 50 Minted against debt
  const collateralIncrement = aeth.make(100n);
  const depositRunAmount = run.make(50n);
  debtLevel = AmountMath.subtract(debtLevel, depositRunAmount);
  collateralLevel = AmountMath.add(collateralLevel, collateralIncrement);

  const [paybackPayment, _remainingPayment] = await split(
    E(run.issuer).makeEmptyPurse(),
    runLent,
    depositRunAmount,
  );

  const aliceAddCollateralSeat1 = await E(zoe).offer(
    E(aliceVault).makeAdjustBalancesInvitation(),
    harden({
      give: { Collateral: collateralIncrement, Minted: depositRunAmount },
    }),
    harden({
      Collateral: aeth.mint.mintPayment(collateralIncrement),
      Minted: paybackPayment,
    }),
  );

  await E(aliceAddCollateralSeat1).getOfferResult();
  debtAmount = await E(aliceVault).getCurrentDebt();
  t.deepEqual(debtAmount, debtLevel);

  const { Minted: lentAmount2 } = await E(
    aliceAddCollateralSeat1,
  ).getFinalAllocation();
  const proceeds2 = await E(aliceAddCollateralSeat1).getPayouts();
  t.deepEqual(lentAmount2, run.makeEmpty(), 'no payout');

  const runLent2 = await proceeds2.Minted;
  t.truthy(
    AmountMath.isEqual(
      await E(run.issuer).getAmountOf(runLent2),
      run.makeEmpty(),
    ),
  );

  aliceUpdate = await E(aliceNotifier).getUpdateSince();
  t.deepEqual(aliceUpdate.value.debtSnapshot.debt, debtLevel);

  // increase collateral 2 ////////////////////////////////// (want:s, give:c)

  // Alice increase collateral by 100, withdrawing 50 Minted
  const collateralIncrement2 = aeth.make(100n);
  const withdrawRunAmount = run.make(50n);
  const withdrawRunAmountWithFees = ceilMultiplyBy(
    withdrawRunAmount,
    rates.mintFee,
  );
  debtLevel = AmountMath.add(
    debtLevel,
    AmountMath.add(withdrawRunAmount, withdrawRunAmountWithFees),
  );
  collateralLevel = AmountMath.add(collateralLevel, collateralIncrement2);

  const aliceAddCollateralSeat2 = await E(zoe).offer(
    E(aliceVault).makeAdjustBalancesInvitation(),
    harden({
      give: { Collateral: collateralIncrement2 },
      want: { Minted: withdrawRunAmount },
    }),
    harden({
      Collateral: aeth.mint.mintPayment(collateralIncrement2),
    }),
  );

  await E(aliceAddCollateralSeat2).getOfferResult();
  const { Minted: lentAmount3 } = await E(
    aliceAddCollateralSeat2,
  ).getFinalAllocation();
  const proceeds3 = await E(aliceAddCollateralSeat2).getPayouts();
  t.deepEqual(lentAmount3, run.make(50n));

  debtAmount = await E(aliceVault).getCurrentDebt();
  t.deepEqual(debtAmount, debtLevel);

  const runLent3 = await proceeds3.Minted;
  t.truthy(
    AmountMath.isEqual(
      await E(run.issuer).getAmountOf(runLent3),
      run.make(50n),
    ),
  );

  aliceUpdate = await E(aliceNotifier).getUpdateSince();
  t.deepEqual(aliceUpdate.value.debtSnapshot.debt, debtLevel);
  t.deepEqual(aliceUpdate.value.debtSnapshot, {
    debt: run.make(5253n),
    interest: run.makeRatio(100n),
  });

  // reduce collateral  ///////////////////////////////////// (want both)

  // Alice reduce collateral by 100, withdrawing 50 Minted
  const collateralDecrement = aeth.make(100n);
  const withdrawRun2 = run.make(50n);
  const withdrawRun2WithFees = ceilMultiplyBy(withdrawRun2, rates.mintFee);
  debtLevel = AmountMath.add(
    debtLevel,
    AmountMath.add(withdrawRunAmount, withdrawRun2WithFees),
  );
  collateralLevel = AmountMath.subtract(collateralLevel, collateralDecrement);
  const aliceReduceCollateralSeat = await E(zoe).offer(
    E(aliceVault).makeAdjustBalancesInvitation(),
    harden({
      want: { Minted: withdrawRun2, Collateral: collateralDecrement },
    }),
    harden({}),
  );

  await E(aliceReduceCollateralSeat).getOfferResult();

  debtAmount = await E(aliceVault).getCurrentDebt();
  t.deepEqual(debtAmount, debtLevel);
  t.deepEqual(collateralLevel, await E(aliceVault).getCollateralAmount());

  const { Minted: lentAmount4 } = await E(
    aliceReduceCollateralSeat,
  ).getFinalAllocation();
  const proceeds4 = await E(aliceReduceCollateralSeat).getPayouts();
  t.deepEqual(lentAmount4, run.make(50n));

  const runBorrowed = await proceeds4.Minted;
  t.truthy(
    AmountMath.isEqual(
      await E(run.issuer).getAmountOf(runBorrowed),
      run.make(50n),
    ),
  );
  const collateralWithdrawn = await proceeds4.Collateral;
  t.truthy(
    AmountMath.isEqual(
      await E(aeth.issuer).getAmountOf(collateralWithdrawn),
      collateralDecrement,
    ),
  );

  aliceUpdate = await E(aliceNotifier).getUpdateSince();
  t.deepEqual(aliceUpdate.value.debtSnapshot.debt, debtLevel);

  // NSF  ///////////////////////////////////// (want too much of both)

  // Alice reduce collateral by 100, withdrawing 50 Minted
  const collateralDecr2 = aeth.make(800n);
  const withdrawRun3 = run.make(500n);
  const withdrawRun3WithFees = ceilMultiplyBy(withdrawRun3, rates.mintFee);
  debtLevel = AmountMath.add(
    debtLevel,
    AmountMath.add(withdrawRunAmount, withdrawRun3WithFees),
  );
  const aliceReduceCollateralSeat2 = await E(zoe).offer(
    E(aliceVault).makeAdjustBalancesInvitation(),
    harden({
      want: { Minted: withdrawRun3, Collateral: collateralDecr2 },
    }),
  );

  await t.throwsAsync(() => E(aliceReduceCollateralSeat2).getOfferResult(), {
    message: /Proposed debt.*exceeds max/,
  });

  // try to trade zero for zero
  const aliceReduceCollateralSeat3 = await E(zoe).offer(
    E(aliceVault).makeAdjustBalancesInvitation(),
    harden({
      want: {
        Minted: run.makeEmpty(),
        Collateral: aeth.makeEmpty(),
      },
    }),
  );

  t.is(
    await E(aliceReduceCollateralSeat3).getOfferResult(),
    'no transaction, as requested',
  );
});

test('adjust balances - withdraw RUN', async t => {
  const { zoe, aeth, run, rates } = t.context;
  t.context;

  const services = await setupServices(
    t,
    [15n],
    aeth.make(1n),
    buildManualTimer(t.log),
    undefined,
    500n,
  );
  const { vfPublic } = services.vaultFactory;

  // initial loan /////////////////////////////////////

  // Create a loan for Alice for 5000 RUN with 1000 aeth collateral
  const collateralAmount = aeth.make(1000n);
  const aliceWantMinted = run.make(5000n);
  /** @type {UserSeat<VaultKit>} */
  const aliceVaultSeat = await E(zoe).offer(
    E(E(vfPublic).getCollateralManager(aeth.brand)).makeVaultInvitation(),
    harden({
      give: { Collateral: collateralAmount },
      want: { Minted: aliceWantMinted },
    }),
    harden({
      Collateral: aeth.mint.mintPayment(collateralAmount),
    }),
  );
  const {
    vault: aliceVault,
    publicNotifiers: { vault: aliceNotifier },
  } = await legacyOfferResult(aliceVaultSeat);

  let debtAmount = await E(aliceVault).getCurrentDebt();
  const fee = ceilMultiplyBy(aliceWantMinted, rates.mintFee);
  let debtLevel = AmountMath.add(aliceWantMinted, fee);

  // Withdraw add'l RUN /////////////////////////////////////
  // Alice deposits nothing; requests more RUN

  const additionalMinted = run.make(100n);
  const aliceWithdrawRunSeat = await E(zoe).offer(
    E(aliceVault).makeAdjustBalancesInvitation(),
    harden({
      want: { Minted: additionalMinted },
    }),
  );

  await E(aliceWithdrawRunSeat).getOfferResult();
  debtAmount = await E(aliceVault).getCurrentDebt();
  debtLevel = AmountMath.add(
    debtLevel,
    AmountMath.add(additionalMinted, run.make(5n)),
  );
  t.deepEqual(debtAmount, debtLevel);

  const { Minted: lentAmount2 } =
    await E(aliceWithdrawRunSeat).getFinalAllocation();
  const proceeds2 = await E(aliceWithdrawRunSeat).getPayouts();
  t.deepEqual(lentAmount2, additionalMinted, '100 RUN');

  const { Minted: runLent2 } = await proceeds2;
  t.deepEqual(await E(run.issuer).getAmountOf(runLent2), additionalMinted);

  const aliceUpdate = await E(aliceNotifier).getUpdateSince();
  t.deepEqual(aliceUpdate.value.debtSnapshot.debt, debtLevel);
});

test('adjust balances after interest charges', async t => {
  const OPEN1 = 450n;
  const AMPLE = 100_000n;
  const { aeth, run } = t.context;

  // charge interest on every tick
  const manualTimer = buildManualTimer(trace, 0n, {
    timeStep: SECONDS_PER_DAY,
  });
  t.context.interestTiming = {
    chargingPeriod: SECONDS_PER_DAY,
    recordingPeriod: SECONDS_PER_DAY,
  };
  t.context.rates = {
    ...t.context.rates,
    interestRate: run.makeRatio(20n),
  };

  const services = await setupServices(
    t,
    makeRatio(1n, run.brand, 100n, aeth.brand),
    undefined,
    manualTimer,
    undefined, // n/a, manual price authority
    10_000n,
  );

  const { vfPublic } = services.vaultFactory;

  trace('0. Take on debt');
  const vaultSeat = await E(services.zoe).offer(
    await E(E(vfPublic).getCollateralManager(aeth.brand)).makeVaultInvitation(),
    harden({
      give: { Collateral: aeth.make(AMPLE) },
      want: { Minted: run.make(OPEN1) },
    }),
    harden({
      Collateral: t.context.aeth.mint.mintPayment(aeth.make(AMPLE)),
    }),
  );
  const { vault } = await E(vaultSeat).getOfferResult();

  trace('1. Charge interest');
  await manualTimer.tick();
  await manualTimer.tick();

  trace('2. Pay down');
  const adjustBalances1 = await E(vault).makeAdjustBalancesInvitation();
  const given = run.make(60n);
  const takeCollateralSeat = await E(services.zoe).offer(
    adjustBalances1,
    harden({
      give: { Minted: given },
      want: {},
    }),
    harden({
      Minted: await getRunFromFaucet(t, 60n),
    }),
  );
  const result = await E(takeCollateralSeat).getOfferResult();
  t.is(result, 'We have adjusted your balances, thank you for your business');
});

test('transfer vault', async t => {
  const { aeth, zoe, run } = t.context;

  const services = await setupServices(
    t,
    [15n],
    aeth.make(1n),
    buildManualTimer(t.log),
    undefined,
    500n,
  );
  const { vfPublic } = services.vaultFactory;

  // initial loan /////////////////////////////////////

  // Create a loan for Alice for 5000 Minted with 1000 aeth collateral
  const collateralAmount = aeth.make(1000n);
  const aliceWantMinted = run.make(5000n);
  /** @type {UserSeat<VaultKit>} */
  const aliceVaultSeat = await E(zoe).offer(
    E(E(vfPublic).getCollateralManager(aeth.brand)).makeVaultInvitation(),
    harden({
      give: { Collateral: collateralAmount },
      want: { Minted: aliceWantMinted },
    }),
    harden({
      Collateral: aeth.mint.mintPayment(collateralAmount),
    }),
  );
  const {
    vault: aliceVault,
    publicNotifiers: { vault: aliceNotifier },
  } = await legacyOfferResult(aliceVaultSeat);

  const debtAmount = await E(aliceVault).getCurrentDebt();

  const getInvitationProperties = async invitation => {
    const invitationIssuer = E(zoe).getInvitationIssuer();
    const amount = await E(invitationIssuer).getAmountOf(invitation);
    return amount.value[0];
  };

  /** @type {Promise<Invitation<VaultKit>>} */
  const transferInvite = E(aliceVault).makeTransferInvitation();
  const inviteProps = await getInvitationProperties(transferInvite);

  trace(t, 'TRANSFER INVITE', transferInvite, inviteProps);
  const transferSeat = await E(zoe).offer(transferInvite);
  const {
    vault: transferVault,
    publicNotifiers: { vault: transferNotifier },
  } = await legacyOfferResult(transferSeat);
  await t.throwsAsync(() => E(aliceVault).getCurrentDebt());
  const debtAfter = await E(transferVault).getCurrentDebt();
  t.deepEqual(debtAfter, debtAmount, 'vault lent 5000 Minted + fees');
  const collateralAfter = await E(transferVault).getCollateralAmount();
  t.deepEqual(collateralAmount, collateralAfter, 'vault has 1000n aEth');

  const aliceFinish = await E(aliceNotifier).getUpdateSince();
  t.deepEqual(
    aliceFinish.value.vaultState,
    Phase.TRANSFER,
    'transfer closed old notifier',
  );

  t.like(inviteProps, {
    description: 'manager0: TransferVault',
    customDetails: {
      debtSnapshot: {
        debt: debtAmount,
        interest: aliceFinish.value.debtSnapshot.interest,
      },
      locked: collateralAmount,
      vaultState: 'active',
    },
  });

  const transferStatus = await E(transferNotifier).getUpdateSince();
  t.deepEqual(
    transferStatus.value.vaultState,
    Phase.ACTIVE,
    'new notifier is active',
  );

  const { Minted: lentAmount } = await E(aliceVaultSeat).getFinalAllocation();
  const aliceProceeds = await E(aliceVaultSeat).getPayouts();
  await assertPayoutAmount(
    t,
    aeth.issuer,
    aliceProceeds.Collateral,
    aeth.makeEmpty(),
    'alice should be paid',
  );
  await assertPayoutAmount(
    t,
    run.issuer,
    aliceProceeds.Minted,
    lentAmount,
    'alice should be paid',
  );
  t.deepEqual(lentAmount, aliceWantMinted, 'received 5000 Minted');

  /** @type {Invitation<VaultKit>} */
  const t2Invite = await E(transferVault).makeTransferInvitation();
  const t2Seat = await E(zoe).offer(t2Invite);
  const {
    vault: t2Vault,
    publicNotifiers: { vault: t2Notifier },
  } = await legacyOfferResult(t2Seat);
  await t.throwsAsync(() => E(transferVault).getCurrentDebt());
  const debtAfter2 = await E(t2Vault).getCurrentDebt();
  t.deepEqual(debtAmount, debtAfter2, 'vault lent 5000 Minted + fees');

  const collateralAfter2 = await E(t2Vault).getCollateralAmount();
  t.deepEqual(collateralAmount, collateralAfter2, 'vault has 1000n aEth');

  const transferFinish = await E(transferNotifier).getUpdateSince();
  t.deepEqual(
    transferFinish.value.vaultState,
    Phase.TRANSFER,
    't2 closed old notifier',
  );

  const t2Status = await E(t2Notifier).getUpdateSince();
  t.deepEqual(
    t2Status.value.vaultState,
    Phase.ACTIVE,
    'new notifier is active',
  );
});

// Alice will over repay her borrowed Minted. In order to make that possible,
// Bob will also take out a loan and will give her the proceeds.
test('overdeposit', async t => {
  const { aeth, zoe, run, rates } = t.context;

  const services = await setupServices(
    t,
    [15n],
    aeth.make(1n),
    buildManualTimer(t.log),
    undefined,
    500n,
  );
  const { vaultFactory, vfPublic } = services.vaultFactory;

  // Alice's loan /////////////////////////////////////

  // Create a loan for Alice for 5000 Minted with 1000 aeth collateral
  const collateralAmount = aeth.make(1000n);
  const aliceWantMinted = run.make(5000n);
  /** @type {UserSeat<VaultKit>} */
  const aliceVaultSeat = await E(zoe).offer(
    E(E(vfPublic).getCollateralManager(aeth.brand)).makeVaultInvitation(),
    harden({
      give: { Collateral: collateralAmount },
      want: { Minted: aliceWantMinted },
    }),
    harden({
      Collateral: aeth.mint.mintPayment(collateralAmount),
    }),
  );
  const {
    vault: aliceVault,
    publicNotifiers: { vault: aliceNotifier },
  } = await legacyOfferResult(aliceVaultSeat);

  let debtAmount = await E(aliceVault).getCurrentDebt();
  const fee = ceilMultiplyBy(aliceWantMinted, rates.mintFee);
  const debt = AmountMath.add(aliceWantMinted, fee);

  t.deepEqual(debtAmount, debt, 'vault lent 5000 Minted + fees');
  const { Minted: lentAmount } = await E(aliceVaultSeat).getFinalAllocation();
  const aliceProceeds = await E(aliceVaultSeat).getPayouts();
  t.deepEqual(lentAmount, aliceWantMinted, 'received 5000 Minted');

  const borrowedRun = await aliceProceeds.Minted;
  t.truthy(
    AmountMath.isEqual(
      await E(run.issuer).getAmountOf(borrowedRun),
      run.make(5000n),
    ),
  );

  let aliceUpdate = await E(aliceNotifier).getUpdateSince();
  t.deepEqual(aliceUpdate.value.debtSnapshot.debt, debt);
  t.deepEqual(aliceUpdate.value.locked, collateralAmount);

  // Bob's loan /////////////////////////////////////

  // Create a loan for Bob for 1000 Minted with 200 aeth collateral
  const bobCollateralAmount = aeth.make(200n);
  const bobWantMinted = run.make(1000n);
  /** @type {UserSeat<VaultKit>} */
  const bobVaultSeat = await E(zoe).offer(
    E(E(vfPublic).getCollateralManager(aeth.brand)).makeVaultInvitation(),
    harden({
      give: { Collateral: bobCollateralAmount },
      want: { Minted: bobWantMinted },
    }),
    harden({
      Collateral: aeth.mint.mintPayment(bobCollateralAmount),
    }),
  );
  const bobProceeds = await E(bobVaultSeat).getPayouts();
  await E(bobVaultSeat).getOfferResult();
  const bobRun = await bobProceeds.Minted;
  t.truthy(
    AmountMath.isEqual(
      await E(run.issuer).getAmountOf(bobRun),
      run.make(1000n),
    ),
  );

  // overpay debt ///////////////////////////////////// (give Minted)

  const combinedRun = await combine(
    E(run.issuer).makeEmptyPurse(),
    harden([borrowedRun, bobRun]),
  );
  const depositRun2 = run.make(6000n);

  const aliceOverpaySeat = await E(zoe).offer(
    E(aliceVault).makeAdjustBalancesInvitation(),
    harden({
      give: { Minted: depositRun2 },
    }),
    harden({ Minted: combinedRun }),
  );

  await E(aliceOverpaySeat).getOfferResult();
  debtAmount = await E(aliceVault).getCurrentDebt();
  t.deepEqual(debtAmount, run.makeEmpty());

  const { Minted: lentAmount5 } =
    await E(aliceOverpaySeat).getFinalAllocation();
  const proceeds5 = await E(aliceOverpaySeat).getPayouts();
  t.deepEqual(lentAmount5, run.make(750n));

  const runReturned = await proceeds5.Minted;
  t.deepEqual(await E(run.issuer).getAmountOf(runReturned), run.make(750n));

  aliceUpdate = await E(aliceNotifier).getUpdateSince();
  t.deepEqual(aliceUpdate.value.debtSnapshot.debt, run.makeEmpty());

  const collectFeesSeat = await E(zoe).offer(
    E(vaultFactory).makeCollectFeesInvitation(),
  );
  await E(collectFeesSeat).getOfferResult();
  await assertAmountsEqual(
    t,
    await E.get(E(collectFeesSeat).getFinalAllocation()).Fee,
    run.make(300n),
  );
});

test('collect fees from vault', async t => {
  const { zoe, aeth, run, rates } = t.context;

  t.context.interestTiming = {
    chargingPeriod: SECONDS_PER_WEEK,
    recordingPeriod: SECONDS_PER_WEEK,
  };

  // charge interest on every tick
  const manualTimer = buildManualTimer(t.log, 0n, {
    timeStep: SECONDS_PER_WEEK,
    eventLoopIteration,
  });
  const services = await setupServices(
    t,
    makeRatio(10n, run.brand, 1n, aeth.brand),
    aeth.make(1n),
    manualTimer,
    SECONDS_PER_WEEK,
    500_000_000n,
  );

  const {
    vaultFactory: { lender },
    reserveKit: { reservePublicFacet },
  } = services;

  const metricsTopic = await E.get(E(reservePublicFacet).getPublicTopics())
    .metrics;
  const m = await subscriptionTracker(t, metricsTopic);
  await m.assertInitial(reserveInitialState(run.makeEmpty()));

  // initial loans /////////////////////////////////////

  // ALICE ////////////////////////////////////////////

  // Create a loan for Alice for 5000 Minted with 1000 aeth collateral
  // ratio is 4:1
  const aliceCollateralAmount = aeth.make(1000n);
  const aliceWantMinted = run.make(5000n);
  /** @type {UserSeat<VaultKit>} */
  const aliceVaultSeat = await E(zoe).offer(
    E(lender).makeVaultInvitation(),
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

  // BOB //////////////////////////////////////////////

  // Create a loan for Bob for 650 Minted with 100 Aeth collateral
  const bobCollateralAmount = aeth.make(100n);
  const bobWantMinted = run.make(512n);
  /** @type {UserSeat<VaultKit>} */
  const bobVaultSeat = await E(zoe).offer(
    E(lender).makeVaultInvitation(),
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

  const bobUpdate = await E(bobNotifier).getUpdateSince();
  t.deepEqual(bobUpdate.value.debtSnapshot.debt, bobRunDebtLevel);

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
});

test('close vault', async t => {
  const { zoe, aeth, run, rates } = t.context;

  const services = await setupServices(
    t,
    [15n],
    aeth.make(1n),
    buildManualTimer(t.log, 0n, { eventLoopIteration }),
    undefined,
    500n,
  );

  const { vfPublic } = services.vaultFactory;

  // initial vault /////////////////////////////////////

  // Create a vault for Alice for 5000 Minted with 1000 aeth collateral
  const collateralAmount = aeth.make(1000n);
  const aliceWantMinted = run.make(5000n);
  /** @type {UserSeat<VaultKit>} */
  const aliceVaultSeat = await E(zoe).offer(
    E(E(vfPublic).getCollateralManager(aeth.brand)).makeVaultInvitation(),
    harden({
      give: { Collateral: collateralAmount },
      want: { Minted: aliceWantMinted },
    }),
    harden({
      Collateral: aeth.mint.mintPayment(collateralAmount),
    }),
  );
  const {
    vault: aliceVault,
    publicNotifiers: { vault: aliceNotifier },
  } = await legacyOfferResult(aliceVaultSeat);

  const debtAmount = await E(aliceVault).getCurrentDebt();
  const fee = ceilMultiplyBy(aliceWantMinted, rates.mintFee);
  const debtLevel = AmountMath.add(aliceWantMinted, fee);

  t.deepEqual(debtAmount, debtLevel, 'vault lent 5000 Minted + fees');
  const { Minted: lentAmount } = await E(aliceVaultSeat).getFinalAllocation();
  const proceeds = await E(aliceVaultSeat).getPayouts();
  t.deepEqual(lentAmount, aliceWantMinted, 'received 5000 Minted');

  const runLent = await proceeds.Minted;
  t.truthy(
    AmountMath.isEqual(
      await E(run.issuer).getAmountOf(runLent),
      run.make(5000n),
    ),
  );

  const aliceUpdate = await E(aliceNotifier).getUpdateSince();
  t.deepEqual(aliceUpdate.value.debtSnapshot.debt, debtLevel);
  t.deepEqual(aliceUpdate.value.locked, collateralAmount);

  // Create a loan for Bob for 1000 Minted with 200 aeth collateral
  const bobCollateralAmount = aeth.make(200n);
  const bobWantMinted = run.make(1000n);
  /** @type {UserSeat<VaultKit>} */
  const bobVaultSeat = await E(zoe).offer(
    E(E(vfPublic).getCollateralManager(aeth.brand)).makeVaultInvitation(),
    harden({
      give: { Collateral: bobCollateralAmount },
      want: { Minted: bobWantMinted },
    }),
    harden({
      Collateral: aeth.mint.mintPayment(bobCollateralAmount),
    }),
  );
  const bobProceeds = await E(bobVaultSeat).getPayouts();
  await E(bobVaultSeat).getOfferResult();
  const bobRun = await bobProceeds.Minted;
  t.truthy(
    AmountMath.isEqual(
      await E(run.issuer).getAmountOf(bobRun),
      run.make(1000n),
    ),
  );

  // close loan, using Bob's Minted /////////////////////////////////////

  const runRepayment = await combine(
    E(run.issuer).makeEmptyPurse(),
    harden([bobRun, runLent]),
  );

  /** @type {UserSeat<string>} */
  const aliceCloseSeat = await E(zoe).offer(
    E(aliceVault).makeCloseInvitation(),
    harden({
      give: { Minted: run.make(6000n) },
      want: { Collateral: aeth.makeEmpty() },
    }),
    harden({ Minted: runRepayment }),
  );

  const closeOfferResult = await E(aliceCloseSeat).getOfferResult();
  t.is(closeOfferResult, 'your vault is closed, thank you for your business');

  const closeAlloc = await E(aliceCloseSeat).getFinalAllocation();
  t.deepEqual(closeAlloc, {
    Minted: run.make(750n),
    Collateral: aeth.make(1000n),
  });
  const closeProceeds = await E(aliceCloseSeat).getPayouts();
  const collProceeds = await aeth.issuer.getAmountOf(closeProceeds.Collateral);
  const runProceeds = await E(run.issuer).getAmountOf(closeProceeds.Minted);

  t.deepEqual(runProceeds, run.make(750n));
  t.deepEqual(collProceeds, aeth.make(1000n));
  t.deepEqual(await E(aliceVault).getCollateralAmount(), aeth.makeEmpty());
});

test('debt too small - MinInitialDebt', async t => {
  const { zoe, aeth, run } = t.context;
  t.context.minInitialDebt = 50_000n;

  const services = await setupServices(
    t,
    [15n],
    aeth.make(1n),
    buildManualTimer(t.log),
    undefined,
    500n,
  );
  const { vfPublic } = services.vaultFactory;

  // Try to Create a loan for Alice for 5000 Minted with 100 aeth collateral
  const collateralAmount = aeth.make(100n);
  const aliceWantMinted = run.make(5000n);
  /** @type {UserSeat<VaultKit>} */
  const aliceVaultSeat = await E(zoe).offer(
    E(E(vfPublic).getCollateralManager(aeth.brand)).makeVaultInvitation(),
    harden({
      give: { Collateral: collateralAmount },
      want: { Minted: aliceWantMinted },
    }),
    harden({
      Collateral: aeth.mint.mintPayment(collateralAmount),
    }),
  );
  await t.throwsAsync(() => E(aliceVaultSeat).getOfferResult(), {
    message:
      'Vault creation requires a minInitialDebt of {"brand":"[Alleged: IST brand]","value":"[50000n]"}',
  });
});

/**
 * Each vaultManager manages one collateral type and has a governed parameter,
 * `debtLimit`, that specifies a cap on the amount of debt the manager will
 * allow.
 *
 * Attempts to adjust balances on vaults beyond the debt limit fail. In other
 * words, minting for anything other than charging interest fails.
 */
test('excessive debt on collateral type - debtLimit', async t => {
  const { zoe, aeth, run } = t.context;

  const services = await setupServices(
    t,
    [15n],
    aeth.make(1n),
    buildManualTimer(t.log),
    undefined,
    500n,
  );
  const { vfPublic } = services.vaultFactory;
  const collateralAmount = aeth.make(1_000_000n);
  const centralAmount = run.make(1_000_000n);
  const vaultSeat = await E(zoe).offer(
    E(E(vfPublic).getCollateralManager(aeth.brand)).makeVaultInvitation(),
    harden({
      give: { Collateral: collateralAmount },
      want: { Minted: centralAmount },
    }),
    harden({
      Collateral: aeth.mint.mintPayment(collateralAmount),
    }),
  );
  await t.throwsAsync(() => E(vaultSeat).getOfferResult(), {
    message:
      'Minting {"brand":"[Alleged: IST brand]","value":"[1050000n]"} past {"brand":"[Alleged: IST brand]","value":"[0n]"} would hit total debt limit {"brand":"[Alleged: IST brand]","value":"[1000000n]"}',
  });
});

test('addVaultType: invalid args do not modify state', async t => {
  const { aeth } = t.context;
  const kw = 'Chit';
  const chit = makeIssuerKit(kw);
  const params = defaultParamValues(chit.brand);

  const services = await setupServices(
    t,
    [500n, 15n],
    aeth.make(900n),
    undefined,
    undefined,
    500n,
  );

  const { vaultFactory } = services.vaultFactory;

  const failsForSameReason = async p =>
    p
      .then(oops => t.fail(`${oops}`))
      .catch(reason1 => t.throwsAsync(p, { message: reason1.message }));
  await failsForSameReason(
    E(vaultFactory)
      // @ts-expect-error bad args on purpose for test
      .addVaultType(chit.issuer, kw, null),
  );
  await failsForSameReason(
    E(vaultFactory).addVaultType(chit.issuer, 'bogus kw', params),
  );

  // The keyword in the vault manager is not "stuck"; it's still available:
  const actual = await E(vaultFactory).addVaultType(chit.issuer, kw, params);
  t.true(matches(actual, M.remotable()));
});

test('addVaultType: extra, unexpected params', async t => {
  const { aeth } = t.context;
  const chit = makeIssuerKit('chit');

  const services = await setupServices(
    t,
    [500n, 15n],
    aeth.make(900n),
    undefined,
    undefined,
    500n,
  );

  const { vaultFactory } = services.vaultFactory;

  const params = { ...defaultParamValues(aeth.brand), shoeSize: 10 };
  const extraParams = { ...params, shoeSize: 10 };
  const { interestRate: _1, ...missingParams } = {
    ...defaultParamValues(aeth.brand),
    shoeSize: 10,
  };

  await t.throwsAsync(
    // @ts-expect-error testing unexpected values
    E(vaultFactory).addVaultType(chit.issuer, 'Chit', missingParams),
    {
      message:
        /initialParamValues: .* - Must have missing properties \["interestRate"\]/,
    },
  );

  const actual = await E(vaultFactory).addVaultType(
    chit.issuer,
    'Chit',
    extraParams,
  );
  t.true(matches(actual, M.remotable()), 'unexpected params are ignored');
});

test('director notifiers', async t => {
  const { aeth } = t.context;
  const services = await setupServices(
    t,
    [500n, 15n],
    aeth.make(900n),
    undefined,
    undefined,
    500n,
  );

  const { vfPublic, vaultFactory } = services.vaultFactory;

  const m = await metricsTracker(t, vfPublic);

  await m.assertInitial({
    collaterals: [aeth.brand],
    rewardPoolAllocation: {},
  });

  // add a vault type
  const chit = makeIssuerKit('chit');
  await E(vaultFactory).addVaultType(
    chit.issuer,
    'Chit',
    defaultParamValues(chit.brand),
  );
  await m.assertChange({
    collaterals: { 1: chit.brand },
  });

  // Not testing rewardPoolAllocation contents because those are simply those values.
  // We could refactor the tests of those allocations to use the data now exposed by a notifier.
});

test('manager notifiers, with snapshot', async t => {
  const OPEN1 = 450n;
  const DEBT1 = 473n; // with penalty
  const OPEN2 = 50n;
  const DEBT2 = 53n; // with penalty
  const AMPLE = 100_000n;
  const ENOUGH = 10_000n;

  const { aeth, run } = t.context;
  const manualTimer = buildManualTimer(t.log, 0n, {
    timeStep: SECONDS_PER_WEEK,
    eventLoopIteration,
  });
  t.context.interestTiming = {
    chargingPeriod: SECONDS_PER_WEEK,
    recordingPeriod: SECONDS_PER_WEEK,
  };
  t.context.rates = {
    ...t.context.rates,
    interestRate: run.makeRatio(20n),
  };

  const services = await setupServices(
    t,
    makeRatio(1n, run.brand, 100n, aeth.brand),
    undefined,
    manualTimer,
    undefined,
    // tuned so first liquidations have overage and the second have shortfall
    3n * (DEBT1 + DEBT2),
    // manual timer steps with granularity of a week, which confuses the auction
    52n * 7n * 24n * 3600n,
  );

  const { aethVaultManager, vfPublic } = services.vaultFactory;
  const cm = await E(aethVaultManager).getPublicFacet();

  const m = await vaultManagerMetricsTracker(t, cm);

  trace('0. Creation');
  await m.assertInitial({
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

  trace('1. Create a vault with ample collateral');
  /** @type {UserSeat<VaultKit>} */
  let vaultSeat = await E(services.zoe).offer(
    await E(E(vfPublic).getCollateralManager(aeth.brand)).makeVaultInvitation(),
    harden({
      give: { Collateral: aeth.make(AMPLE) },
      want: { Minted: run.make(OPEN1) },
    }),
    harden({
      Collateral: t.context.aeth.mint.mintPayment(aeth.make(AMPLE)),
    }),
  );
  let { vault } = await E(vaultSeat).getOfferResult();
  let totalCollateral = AMPLE;
  let totalDebt = DEBT1;
  await m.assertChange({
    numActiveVaults: 1,
    totalCollateral: { value: totalCollateral },
    totalDebt: { value: totalDebt },
  });
  t.is((await E(vault).getCurrentDebt()).value, DEBT1);

  trace('2. Remove collateral');
  const COLL_REMOVED = 50_000n;
  const takeCollateralSeat = await E(services.zoe).offer(
    await E(vault).makeAdjustBalancesInvitation(),
    harden({
      give: {},
      want: { Collateral: aeth.make(COLL_REMOVED) },
    }),
  );
  await E(takeCollateralSeat).getOfferResult();
  totalCollateral -= COLL_REMOVED;
  await m.assertChange({
    totalCollateral: { value: totalCollateral },
  });

  trace('3. Make another LOAN1 loan');
  vaultSeat = await E(services.zoe).offer(
    await E(E(vfPublic).getCollateralManager(aeth.brand)).makeVaultInvitation(),
    harden({
      give: { Collateral: aeth.make(AMPLE) },
      want: { Minted: run.make(OPEN1) },
    }),
    harden({
      Collateral: t.context.aeth.mint.mintPayment(aeth.make(AMPLE)),
    }),
  );
  ({ vault } = await E(vaultSeat).getOfferResult());
  totalCollateral += AMPLE;
  totalDebt += DEBT1;
  await m.assertChange({
    numActiveVaults: 2,
    totalCollateral: { value: totalCollateral },
    totalDebt: { value: totalDebt },
  });

  m.addDebt(DEBT1);
  t.is((await E(vault).getCurrentDebt()).value, DEBT1);

  trace('4. Make a LOAN2 loan');
  vaultSeat = await E(services.zoe).offer(
    await E(E(vfPublic).getCollateralManager(aeth.brand)).makeVaultInvitation(),
    harden({
      give: { Collateral: aeth.make(ENOUGH) },
      want: { Minted: run.make(OPEN2) },
    }),
    harden({
      Collateral: t.context.aeth.mint.mintPayment(aeth.make(ENOUGH)),
    }),
  );
  ({ vault } = await E(vaultSeat).getOfferResult());
  totalCollateral += ENOUGH;
  totalDebt += DEBT2;
  await m.assertChange({
    numActiveVaults: 3,
    totalCollateral: { value: totalCollateral },
    totalDebt: { value: totalDebt },
  });
  m.addDebt(DEBT2);

  trace('5. Make another LOAN2 loan');
  vaultSeat = await E(services.zoe).offer(
    await E(E(vfPublic).getCollateralManager(aeth.brand)).makeVaultInvitation(),
    harden({
      give: { Collateral: aeth.make(ENOUGH) },
      want: { Minted: run.make(OPEN2) },
    }),
    harden({
      Collateral: t.context.aeth.mint.mintPayment(aeth.make(ENOUGH)),
    }),
  );
  ({ vault } = await E(vaultSeat).getOfferResult());

  trace('6. Loan interest');
  vaultSeat = await E(services.zoe).offer(
    await E(E(vfPublic).getCollateralManager(aeth.brand)).makeVaultInvitation(),
    harden({
      give: { Collateral: aeth.make(AMPLE) },
      want: { Minted: run.make(OPEN1) },
    }),
    harden({
      Collateral: t.context.aeth.mint.mintPayment(aeth.make(AMPLE)),
    }),
  );
  ({ vault } = await E(vaultSeat).getOfferResult());
  totalCollateral += ENOUGH;
  totalDebt += DEBT2;
  await m.assertChange({
    numActiveVaults: 4,
    totalCollateral: { value: totalCollateral },
    totalDebt: { value: totalDebt },
  });
  m.addDebt(DEBT2);
  await manualTimer.tickN(5);
  const interestAccrued = (await E(vault).getCurrentDebt()).value - DEBT1;
  m.addDebt(interestAccrued);
  t.is(interestAccrued, 9n);

  trace('7. make another loan to trigger a publish');
  vaultSeat = await E(services.zoe).offer(
    await E(E(vfPublic).getCollateralManager(aeth.brand)).makeVaultInvitation(),
    harden({
      give: { Collateral: aeth.make(ENOUGH) },
      want: { Minted: run.make(OPEN2) },
    }),
    harden({
      Collateral: t.context.aeth.mint.mintPayment(aeth.make(ENOUGH)),
    }),
  );
  ({ vault } = await E(vaultSeat).getOfferResult());
  totalCollateral += AMPLE;
  totalDebt += DEBT1;
  await m.assertChange({
    numActiveVaults: 5,
    totalCollateral: { value: totalCollateral },
    totalDebt: { value: totalDebt },
  });
  m.addDebt(DEBT1);

  trace('8. Create a loan with ample collateral');
  /** @type {UserSeat<VaultKit>} */
  vaultSeat = await E(services.zoe).offer(
    await E(E(vfPublic).getCollateralManager(aeth.brand)).makeVaultInvitation(),
    harden({
      give: { Collateral: aeth.make(AMPLE) },
      want: { Minted: run.make(OPEN1) },
    }),
    harden({
      Collateral: t.context.aeth.mint.mintPayment(aeth.make(AMPLE)),
    }),
  );
  ({ vault } = await E(vaultSeat).getOfferResult());
  totalCollateral += ENOUGH;
  totalDebt += DEBT2 + 30n; // XXX ??
  m.addDebt(DEBT2);
  await m.assertChange({
    numActiveVaults: 6,
    totalCollateral: { value: totalCollateral },
    totalDebt: { value: totalDebt },
  });

  trace('9. Borrow more');
  const WANT_EXTRA = 400n;
  const DEBT1_EXTRA = DEBT1 + WANT_EXTRA + 20n; // 5% fee on extra
  // can't use 0n because of https://github.com/Agoric/agoric-sdk/issues/5548
  // but since this test is of metrics, we take the opportunity to check totalCollateral changing
  const given = aeth.make(2n);
  let vaultOpSeat = await E(services.zoe).offer(
    await E(vault).makeAdjustBalancesInvitation(),
    harden({
      // nominal collateral
      give: { Collateral: given },
      want: { Minted: run.make(WANT_EXTRA) },
    }),
    harden({
      Collateral: t.context.aeth.mint.mintPayment(given),
    }),
  );
  await E(vaultOpSeat).getOfferResult();
  totalCollateral += AMPLE;
  totalDebt += DEBT1;
  await m.assertChange({
    numActiveVaults: 7,
    totalDebt: { value: totalDebt },
    totalCollateral: { value: totalCollateral },
  });

  totalCollateral += given.value;
  totalDebt += WANT_EXTRA + 29n; // magic number is fees

  await m.assertChange({
    totalCollateral: { value: totalCollateral },
    totalDebt: { value: totalDebt },
  });

  trace('10. Close vault');
  vaultOpSeat = await E(services.zoe).offer(
    await E(vault).makeCloseInvitation(),
    harden({
      give: { Minted: run.make(DEBT1_EXTRA) },
      want: {},
    }),
    harden({
      Minted: await getRunFromFaucet(t, DEBT1_EXTRA),
    }),
  );
  await E(vaultOpSeat).getOfferResult();

  totalCollateral -= AMPLE + given.value;
  totalDebt -= DEBT1_EXTRA - 17n; // magic number is fees
  await m.assertChange({
    numActiveVaults: 6,
    totalCollateral: { value: totalCollateral },
    totalDebt: { value: totalDebt },
  });

  /**
   * @type {ReturnType<
   *   import('@agoric/internal/src/storage-test-utils.js').makeMockChainStorageRoot
   * >}
   */
  // @ts-expect-error mock
  const storage = await services.space.consume.chainStorage;
  const doc = {
    node: 'vaultFactory',
    owner: 'the vault factory contract',
  };
  await documentStorageSchema(t, storage, doc);
});

test('governance publisher', async t => {
  const { aeth } = t.context;
  t.context.interestTiming = {
    chargingPeriod: 2n,
    recordingPeriod: 10n,
  };
  t.context.referencedUi = 'abracadabra';

  const services = await setupServices(
    t,
    [500n, 15n],
    aeth.make(900n),
    undefined,
    undefined,
    500n,
  );
  const { vfPublic } = services.vaultFactory;
  const directorGovNotifier = makeNotifierFromAsyncIterable(
    E(vfPublic).getElectorateSubscription(),
  );
  let {
    value: { current },
  } = await directorGovNotifier.getUpdateSince();
  // can't deepEqual because of non-literal objects so check keys and then partial shapes
  t.deepEqual(Object.keys(current), [
    'ChargingPeriod',
    'Electorate',
    'MinInitialDebt',
    'RecordingPeriod',
    'ReferencedUI',
    'ShortfallInvitation',
  ]);
  t.like(current, {
    ChargingPeriod: { type: 'nat', value: 2n },
    Electorate: { type: 'invitation' },
    ReferencedUI: { type: 'string', value: 'abracadabra' },
    MinInitialDebt: { type: 'amount' },
    RecordingPeriod: { type: 'nat', value: 10n },
    ShortfallInvitation: { type: 'invitation' },
  });

  const managerGovNotifier = makeNotifierFromAsyncIterable(
    E(vfPublic).getSubscription({
      collateralBrand: aeth.brand,
    }),
  );
  ({
    value: { current },
  } = await managerGovNotifier.getUpdateSince());
  // can't deepEqual because of non-literal objects so check keys and then partial shapes
  t.deepEqual(Object.keys(current), [
    'DebtLimit',
    'InterestRate',
    'LiquidationMargin',
    'LiquidationPadding',
    'LiquidationPenalty',
    'MintFee',
  ]);
  t.like(current, {
    DebtLimit: { type: 'amount' },
    InterestRate: { type: 'ratio' },
    LiquidationMargin: { type: 'ratio' },
    LiquidationPadding: { type: 'ratio' },
    LiquidationPenalty: { type: 'ratio' },
    MintFee: { type: 'ratio' },
  });
});
