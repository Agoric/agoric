// @ts-check

import { test as unknownTest } from '@agoric/zoe/tools/prepare-test-env-ava.js';
import '@agoric/zoe/exported.js';

import { E } from '@endo/eventual-send';
import { deeplyFulfilled } from '@endo/marshal';

import { AmountMath, AssetKind, makeIssuerKit } from '@agoric/ertp';
import {
  makeNotifierFromAsyncIterable,
  makeStoredPublisherKit,
} from '@agoric/notifier';
import buildManualTimer from '@agoric/zoe/tools/manualTimer.js';
import { eventLoopIteration } from '@agoric/zoe/tools/eventLoopIteration.js';
import {
  ceilMultiplyBy,
  makeRatio,
} from '@agoric/zoe/src/contractSupport/index.js';
import { makeScriptedPriceAuthority } from '@agoric/zoe/tools/scriptedPriceAuthority.js';
import { makeManualPriceAuthority } from '@agoric/zoe/tools/manualPriceAuthority.js';
import { assertAmountsEqual } from '@agoric/zoe/test/zoeTestHelpers.js';
import { M, matches } from '@agoric/store';
import { makeParamManagerBuilder } from '@agoric/governance';

import { makeTracer } from '../../src/makeTracer.js';
import { SECONDS_PER_YEAR } from '../../src/interest.js';
import {
  CHARGING_PERIOD_KEY,
  RECORDING_PERIOD_KEY,
} from '../../src/vaultFactory/params.js';
import {
  setupAmm,
  setupReserve,
  startEconomicCommittee,
  startVaultFactory,
} from '../../src/proposals/econ-behaviors.js';
import '../../src/vaultFactory/types.js';
import * as Collect from '../../src/collect.js';
import { calculateCurrentDebt } from '../../src/interest-math.js';

import {
  installGovernance,
  setupBootstrap,
  setUpZoeForTest,
  withAmountUtils,
  produceInstallations,
  subscriptionKey,
} from '../supports.js';
import { unsafeMakeBundleCache } from '../bundleTool.js';
import {
  metricsTracker,
  vaultManagerMetricsTracker,
  subscriptionTracker,
  reserveInitialState,
} from '../metrics.js';

/** @typedef {Record<string, any> & {
 * aeth: IssuerKit & import('../supports.js').AmountUtils,
 * run: IssuerKit & import('../supports.js').AmountUtils,
 * bundleCache: Awaited<ReturnType<typeof unsafeMakeBundleCache>>,
 * rates: VaultManagerParamValues,
 * loanTiming: LoanTiming,
 * zoe: ZoeService,
 * }} Context */
/** @type {import('ava').TestInterface<Context>} */
// @ts-expect-error cast
const test = unknownTest;

// #region Support

const contractRoots = {
  faucet: './test/vaultFactory/faucet.js',
  liquidate: './src/vaultFactory/liquidateMinimum.js',
  VaultFactory: './src/vaultFactory/vaultFactory.js',
  amm: './src/vpool-xyk-amm/multipoolMarketMaker.js',
  reserve: './src/reserve/assetReserve.js',
};

/** @typedef {import('../../src/vaultFactory/vaultFactory').VaultFactoryContract} VFC */

const trace = makeTracer('TestST');

const BASIS_POINTS = 10000n;
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

/**
 * dL: 1M, lM: 105%, lP: 10%, iR: 100, lF: 500
 *
 * @param {Brand} debtBrand
 */
const defaultParamValues = debtBrand =>
  harden({
    debtLimit: AmountMath.make(debtBrand, 1_000_000n),
    // margin required to maintain a loan
    liquidationMargin: makeRatio(105n, debtBrand),
    // penalty upon liquidation as proportion of debt
    liquidationPenalty: makeRatio(10n, debtBrand),
    // periodic interest rate (per charging period)
    interestRate: makeRatio(100n, debtBrand, BASIS_POINTS),
    // charge to create or increase loan balance
    loanFee: makeRatio(500n, debtBrand, BASIS_POINTS),
  });

test.before(async t => {
  const { zoe, feeMintAccess } = setUpZoeForTest();
  const runIssuer = await E(zoe).getFeeIssuer();
  const runBrand = await E(runIssuer).getBrand();
  const run = withAmountUtils({ issuer: runIssuer, brand: runBrand });
  const aeth = withAmountUtils(makeIssuerKit('aEth'));

  const bundleCache = await unsafeMakeBundleCache('./bundles/'); // package-relative
  // note that the liquidation might be a different bundle name
  const bundles = await Collect.allValues({
    faucet: bundleCache.load(contractRoots.faucet, 'faucet'),
    liquidate: bundleCache.load(contractRoots.liquidate, 'liquidateMinimum'),
    VaultFactory: bundleCache.load(contractRoots.VaultFactory, 'VaultFactory'),
    amm: bundleCache.load(contractRoots.amm, 'amm'),
    reserve: bundleCache.load(contractRoots.reserve, 'reserve'),
  });
  const installation = Collect.mapValues(bundles, bundle =>
    E(zoe).install(bundle),
  );

  const contextPs = {
    zoe,
    feeMintAccess,
    bundles,
    installation,
    electorateTerms: undefined,
    loanTiming: {
      chargingPeriod: 2n,
      recordingPeriod: 6n,
    },
    minInitialDebt: 50n,
    rates: defaultParamValues(run.brand),
    aethInitialLiquidity: aeth.make(300n),
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
 * @param {import('ava').ExecutionContext<Context>} t
 * @param {*} aethLiquidity
 * @param {*} runLiquidity
 */
const setupAmmAndElectorateAndReserve = async (
  t,
  aethLiquidity,
  runLiquidity,
) => {
  const {
    zoe,
    aeth,
    electorateTerms = { committeeName: 'The Cabal', committeeSize: 1 },
    timer,
  } = t.context;

  const space = setupBootstrap(t, timer);
  const { consume, instance } = space;
  installGovernance(zoe, space.installation.produce);
  produceInstallations(space, t.context.installation);

  await startEconomicCommittee(space, electorateTerms);
  await setupAmm(space, {
    options: { minInitialPoolLiquidity: 300n },
  });

  // AMM needs the reserve in order to function
  await setupReserve(space);

  const governorCreatorFacet = consume.ammGovernorCreatorFacet;
  const governorInstance = await instance.consume.ammGovernor;
  const governorPublicFacet = await E(zoe).getPublicFacet(governorInstance);
  const governedInstance = E(governorPublicFacet).getGovernedContract();

  /** @type { GovernedPublicFacet<XYKAMMPublicFacet> } */
  // @ts-expect-error cast from unknown
  const ammPublicFacet = await E(governorCreatorFacet).getPublicFacet();

  const liquidityIssuer = await E(ammPublicFacet).addIssuer(
    aeth.issuer,
    'Aeth',
  );
  const liquidityBrand = await E(liquidityIssuer).getBrand();

  const liqProposal = harden({
    give: {
      Secondary: aethLiquidity.proposal,
      Central: runLiquidity.proposal,
    },
    want: { Liquidity: AmountMath.makeEmpty(liquidityBrand) },
  });
  const liqInvitation = await E(ammPublicFacet).addPoolInvitation();

  const ammLiquiditySeat = await E(zoe).offer(
    liqInvitation,
    liqProposal,
    harden({
      Secondary: aethLiquidity.payment,
      Central: runLiquidity.payment,
    }),
  );

  // TODO get the creator directly
  const newAmm = {
    ammCreatorFacet: await consume.ammCreatorFacet,
    ammPublicFacet,
    instance: governedInstance,
    ammLiquidity: E(ammLiquiditySeat).getPayout('Liquidity'),
  };

  return { amm: newAmm, space };
};

/**
 *
 * @param {import('ava').ExecutionContext<any>} t
 * @param {bigint} amount
 */
const getRunFromFaucet = async (t, amount) => {
  const {
    installation: { faucet: installation },
    zoe,
    feeMintAccess,
    run,
  } = t.context;
  /** @type {Promise<Installation<import('./faucet.js').start>>} */
  // On-chain, there will be pre-existing RUN. The faucet replicates that
  // @ts-expect-error
  const { creatorFacet: faucetCreator } = await E(zoe).startInstance(
    installation,
    {},
    {},
    harden({ feeMintAccess }),
  );
  const faucetSeat = E(zoe).offer(
    await E(faucetCreator).makeFaucetInvitation(),
    harden({
      give: {},
      want: { RUN: run.make(amount) },
    }),
    harden({}),
  );

  const runPayment = await E(faucetSeat).getPayout('RUN');
  return runPayment;
};

/**
 * NOTE: called separately by each test so AMM/zoe/priceAuthority don't interfere
 *
 * @param {import('ava').ExecutionContext<Context>} t
 * @param {Array<NatValue> | Ratio} priceOrList
 * @param {Amount | undefined} unitAmountIn
 * @param {TimerService} timer
 * @param {RelativeTime} quoteInterval
 * @param {bigint} runInitialLiquidity
 */
const setupServices = async (
  t,
  priceOrList,
  unitAmountIn,
  timer = buildManualTimer(t.log),
  quoteInterval = 1n,
  runInitialLiquidity,
) => {
  const {
    zoe,
    run,
    aeth,
    loanTiming,
    minInitialDebt,
    rates,
    aethInitialLiquidity,
  } = t.context;
  t.context.timer = timer;

  const runPayment = await getRunFromFaucet(t, runInitialLiquidity);
  trace(t, 'faucet', { runInitialLiquidity, runPayment });

  const runLiquidity = {
    proposal: harden(run.make(runInitialLiquidity)),
    payment: runPayment,
  };

  const aethLiquidity = {
    proposal: aethInitialLiquidity,
    payment: aeth.mint.mintPayment(aethInitialLiquidity),
  };
  const { amm: ammFacets, space } = await setupAmmAndElectorateAndReserve(
    t,
    aethLiquidity,
    runLiquidity,
  );

  const { consume, produce } = space;
  trace(t, 'amm', { ammFacets });

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
  await startVaultFactory(space, { loanParams: loanTiming }, minInitialDebt);

  const governorCreatorFacet = consume.vaultFactoryGovernorCreator;
  /** @type {Promise<VaultFactory & LimitedCreatorFacet<VaultFactory>>} */
  const vaultFactoryCreatorFacetP = E(governorCreatorFacet).getCreatorFacet();
  const reserveCreatorFacet = consume.reserveCreatorFacet;
  const reserveFacets = { reserveCreatorFacet };

  // Add a vault that will lend on aeth collateral
  /** @type {Promise<VaultManager>} */
  const aethVaultManagerP = E(vaultFactoryCreatorFacetP).addVaultType(
    aeth.issuer,
    'AEth',
    rates,
  );
  /** @type {[any, VaultFactory, VFC['publicFacet'], VaultManager, PriceAuthority]} */
  // @ts-expect-error cast
  const [
    governorInstance,
    factoryCreator, // creator
    factoryPublic,
    aethVaultManager,
    priceAuthority,
  ] = await Promise.all([
    E(consume.agoricNames).lookup('instance', 'VaultFactoryGovernor'),
    vaultFactoryCreatorFacetP,
    E(governorCreatorFacet).getPublicFacet(),
    aethVaultManagerP,
    pa,
  ]);
  trace(t, 'pa', {
    governorInstance,
    factoryCreator,
    factoryPublic,
    priceAuthority,
  });

  const { g, v } = {
    g: {
      governorInstance,
      governorPublicFacet: E(zoe).getPublicFacet(governorInstance),
      governorCreatorFacet,
    },
    v: {
      vaultFactory: factoryCreator,
      factoryPublic,
      lender: E(factoryPublic).getCollateralManager(aeth.brand),
      aethVaultManager,
    },
  };

  return {
    zoe,
    governor: g,
    vaultFactory: v,
    ammFacets,
    runKit: { issuer: run.issuer, brand: run.brand },
    priceAuthority,
    reserveFacets,
    /** @param {Brand} baseBrand */
    getLiquidityBrand: baseBrand =>
      E(ammFacets.ammPublicFacet)
        .getLiquidityIssuer(baseBrand)
        .then(liqIssuer => E(liqIssuer).getBrand()),
  };
};
// #endregion

test('first', async t => {
  const { aeth, run, zoe, rates } = t.context;
  t.context.loanTiming = {
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
  const { vaultFactory, lender, aethVaultManager } = services.vaultFactory;
  trace(t, 'services', { services, vaultFactory, lender });

  // Create a loan for 470 RUN with 1100 aeth collateral
  const collateralAmount = aeth.make(1100n);
  const loanAmount = run.make(470n);
  /** @type {UserSeat<VaultKit>} */
  const vaultSeat = await E(zoe).offer(
    await E(lender).makeVaultInvitation(),
    harden({
      give: { Collateral: collateralAmount },
      want: { RUN: loanAmount },
    }),
    harden({
      Collateral: aeth.mint.mintPayment(collateralAmount),
    }),
  );

  const {
    vault,
    publicNotifiers: { vault: vaultNotifier },
  } = await E(vaultSeat).getOfferResult();
  const debtAmount = await E(vault).getCurrentDebt();
  const fee = ceilMultiplyBy(run.make(470n), rates.loanFee);
  t.deepEqual(
    debtAmount,
    AmountMath.add(loanAmount, fee),
    'vault lent 470 RUN',
  );
  trace(t, 'correct debt', debtAmount);

  const { RUN: lentAmount } = await E(vaultSeat).getCurrentAllocation();
  const loanProceeds = await E(vaultSeat).getPayouts();
  const runLent = await loanProceeds.RUN;
  t.deepEqual(lentAmount, loanAmount, 'received 47 RUN');
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
  const [paybackPayment, _remainingPayment] = await E(run.issuer).split(
    runLent,
    paybackAmount,
  );

  const seat = await E(zoe).offer(
    await E(vault).makeAdjustBalancesInvitation(),
    harden({
      give: { RUN: paybackAmount },
      want: { Collateral: collateralWanted },
    }),
    harden({
      RUN: paybackPayment,
    }),
  );

  const payouts = E(seat).getPayouts();
  const { Collateral: returnedCollateral, RUN: returnedRun } = await payouts;
  t.deepEqual(
    await E(vault).getCurrentDebt(),
    run.make(294n),
    'debt reduced to 294 RUN',
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

  await E(aethVaultManager).liquidateAll();
  const { value: afterLiquidation } = await E(vaultNotifier).getUpdateSince();
  t.is(afterLiquidation.vaultState, Phase.LIQUIDATED);
  t.is((await E(vault).getCurrentDebt()).value, 0n, 'debt is paid off');
  t.deepEqual(
    await E(vault).getCollateralAmount(),
    aeth.make(440n),
    'unused collateral remains after liquidation',
  );

  t.deepEqual(await E(vaultFactory).getRewardAllocation(), {
    RUN: run.make(24n),
  });
});

test('price drop', async t => {
  const { zoe, aeth, run, rates } = t.context;

  const manualTimer = buildManualTimer(t.log);
  // When the price falls to 636, the loan will get liquidated. 636 for 900
  // Aeth is 1.4 each. The loan is 270 RUN. The margin is 1.05, so at 636, 400
  // Aeth collateral could support a loan of 268.
  t.context.loanTiming = {
    chargingPeriod: 2n,
    recordingPeriod: 10n,
  };

  const services = await setupServices(
    t,
    makeRatio(1000n, run.brand, 900n, aeth.brand),
    aeth.make(900n),
    manualTimer,
    undefined,
    500n,
  );
  trace(t, 'setup');

  const {
    vaultFactory: { vaultFactory, lender },
    priceAuthority,
    reserveFacets: { reserveCreatorFacet },
  } = services;

  // Create a loan for 270 RUN with 400 aeth collateral
  const collateralAmount = aeth.make(400n);
  const loanAmount = run.make(270n);
  /** @type {UserSeat<VaultKit>} */
  const vaultSeat = await E(zoe).offer(
    await E(lender).makeVaultInvitation(),
    harden({
      give: { Collateral: collateralAmount },
      want: { RUN: loanAmount },
    }),
    harden({
      Collateral: aeth.mint.mintPayment(collateralAmount),
    }),
  );
  trace(t, 'loan made', loanAmount);

  const {
    vault,
    publicNotifiers: { vault: vaultNotifier },
  } = await E(vaultSeat).getOfferResult();
  trace(t, 'offer result', vault);
  const debtAmount = await E(vault).getCurrentDebt();
  const fee = ceilMultiplyBy(loanAmount, rates.loanFee);
  t.deepEqual(
    debtAmount,
    AmountMath.add(loanAmount, fee),
    'borrower RUN amount does not match',
  );

  let notification = await E(vaultNotifier).getUpdateSince();
  trace(t, 'got notificaation', notification);

  t.is(notification.value.vaultState, Phase.ACTIVE);
  t.deepEqual((await notification.value).debtSnapshot, {
    debt: AmountMath.add(loanAmount, fee),
    interest: makeRatio(100n, run.brand),
  });
  const { RUN: lentAmount } = await E(vaultSeat).getCurrentAllocation();
  t.truthy(AmountMath.isEqual(lentAmount, loanAmount), 'received 470 RUN');
  t.deepEqual(
    await E(vault).getCollateralAmount(),
    aeth.make(400n),
    'vault holds 11 Collateral',
  );
  trace(t, 'pa2', priceAuthority);

  // @ts-expect-error mock
  priceAuthority.setPrice(makeRatio(677n, run.brand, 900n, aeth.brand));
  trace(t, 'price dropped a little');
  notification = await E(vaultNotifier).getUpdateSince();
  t.is(notification.value.vaultState, Phase.ACTIVE);

  // @ts-expect-error mock
  await E(priceAuthority).setPrice(
    makeRatio(636n, run.brand, 900n, aeth.brand),
  );
  notification = await E(vaultNotifier).getUpdateSince(
    notification.updateCount,
  );
  trace(t, 'price changed to liquidate', notification.value.vaultState);
  t.is(notification.value.vaultState, Phase.LIQUIDATING);

  t.deepEqual(
    await E(vault).getCollateralAmount(),
    aeth.makeEmpty(),
    'Collateral consumed while liquidating',
  );
  t.deepEqual(
    await E(vault).getCurrentDebt(),
    run.make(284n),
    'Debt remains while liquidating',
  );
  trace(t, 'debt remains', run.make(284n));

  // @ts-expect-error mock
  await E(priceAuthority).setPrice(
    makeRatio(1000n, run.brand, 900n, aeth.brand),
  );
  trace(t, 'debt gone');
  notification = await E(vaultNotifier).getUpdateSince(
    notification.updateCount,
  );
  t.is(notification.value.vaultState, Phase.LIQUIDATED);
  t.truthy(await E(vaultSeat).hasExited());

  const metricsSub = await E(reserveCreatorFacet).getMetrics();
  const m = await subscriptionTracker(t, metricsSub);
  await m.assertInitial(reserveInitialState(run.makeEmpty()));

  const debtAmountAfter = await E(vault).getCurrentDebt();
  const finalNotification = await E(vaultNotifier).getUpdateSince();
  t.is(finalNotification.value.vaultState, Phase.LIQUIDATED);
  t.deepEqual(finalNotification.value.locked, aeth.make(2n));
  // shortfall 30n covered by the reserve
  t.is(debtAmountAfter.value, 0n);
  const liqBrand = await services.getLiquidityBrand(aeth.brand);
  await m.assertChange({
    allocations: { RaEthLiquidity: AmountMath.make(liqBrand, 300n) },
    shortfallBalance: { value: 30n },
  });

  t.deepEqual(await E(vaultFactory).getRewardAllocation(), {
    RUN: run.make(14n),
  });

  /** @type {UserSeat<string>} */
  const closeSeat = await E(zoe).offer(E(vault).makeCloseInvitation());
  await E(closeSeat).getOfferResult();

  const closeProceeds = await E(closeSeat).getPayouts();
  const collProceeds = await aeth.issuer.getAmountOf(closeProceeds.Collateral);
  const runProceeds = await E(services.runKit.issuer).getAmountOf(
    closeProceeds.RUN,
  );

  t.deepEqual(runProceeds, run.make(0n));
  t.deepEqual(collProceeds, aeth.make(2n));
  t.deepEqual(await E(vault).getCollateralAmount(), aeth.makeEmpty());
});

test('price falls precipitously', async t => {
  const { zoe, aeth, run, rates } = t.context;
  t.context.loanTiming = {
    chargingPeriod: 2n,
    recordingPeriod: 10n,
  };
  t.context.aethInitialLiquidity = aeth.make(900n);

  // The borrower will deposit 4 Aeth, and ask to borrow 470 RUN. The
  // PriceAuthority's initial quote is 180. The max loan on 4 Aeth would be 600
  // (to make the margin 20%).
  // When the price falls to 123, the loan will get liquidated. At that point, 4
  // Aeth is worth 492, with a 5% margin, 493 is required.
  // The Autowap provides 534 RUN for the 4 Aeth collateral, so the borrower
  // gets 41 back

  const manualTimer = buildManualTimer(t.log);
  const services = await setupServices(
    t,
    [2200n, 19180n, 1650n, 150n],
    aeth.make(900n),
    manualTimer,
    undefined,
    1500n,
  );
  const { vaultFactory, lender } = services.vaultFactory;

  const { reserveCreatorFacet } = services.reserveFacets;
  // Create a loan for 370 RUN with 400 aeth collateral
  const collateralAmount = aeth.make(400n);
  const loanAmount = run.make(370n);
  /** @type {UserSeat<VaultKit>} */
  const userSeat = await E(zoe).offer(
    E(lender).makeVaultInvitation(),
    harden({
      give: { Collateral: collateralAmount },
      want: { RUN: loanAmount },
    }),
    harden({
      Collateral: aeth.mint.mintPayment(collateralAmount),
    }),
  );

  const {
    vault,
    publicNotifiers: { vault: vaultNotifier },
  } = await E(userSeat).getOfferResult();
  const debtAmount = await E(vault).getCurrentDebt();
  const fee = ceilMultiplyBy(run.make(370n), rates.loanFee);
  t.deepEqual(
    debtAmount,
    AmountMath.add(loanAmount, fee),
    'borrower owes 388 RUN',
  );
  trace(t, 'correct debt', debtAmount);

  const { RUN: lentAmount } = await E(userSeat).getCurrentAllocation();
  t.deepEqual(lentAmount, loanAmount, 'received 470 RUN');
  t.deepEqual(
    await E(vault).getCollateralAmount(),
    aeth.make(400n),
    'vault holds 400 Collateral',
  );

  // Sell some Eth to drive the value down
  const swapInvitation = E(
    services.ammFacets.ammPublicFacet,
  ).makeSwapInvitation();
  const proposal = harden({
    give: { In: aeth.make(200n) },
    want: { Out: run.makeEmpty() },
  });
  await E(zoe).offer(
    await swapInvitation,
    proposal,
    harden({
      In: aeth.mint.mintPayment(aeth.make(200n)),
    }),
  );

  const assertDebtIs = async value => {
    const debt = await E(vault).getCurrentDebt();
    t.is(
      debt.value,
      BigInt(value),
      `Expected debt ${debt.value} to be ${value}`,
    );
  };

  const metricsSub = await E(reserveCreatorFacet).getMetrics();
  const m = await subscriptionTracker(t, metricsSub);
  await m.assertInitial(reserveInitialState(run.makeEmpty()));
  await manualTimer.tick();
  await assertDebtIs(debtAmount.value);

  await manualTimer.tick();
  await assertDebtIs(debtAmount.value);

  await manualTimer.tick();
  await assertDebtIs(debtAmount.value);

  await manualTimer.tick();
  await eventLoopIteration();

  // shortfall 103n covered by the reserve
  t.deepEqual(
    await E(vault).getCurrentDebt(),
    run.makeEmpty(),
    `Expected debt after liquidation to be zero`,
  );
  const liqBrand = await services.getLiquidityBrand(aeth.brand);
  await m.assertChange({
    shortfallBalance: { value: 103n },
    allocations: { RaEthLiquidity: AmountMath.make(liqBrand, 300n) },
  });

  t.deepEqual(await E(vaultFactory).getRewardAllocation(), {
    RUN: run.make(19n),
  });

  t.deepEqual(
    await E(vault).getCollateralAmount(),
    // XXX collateral left when there's still debt
    aeth.make(1n),
    'Collateral reduced after liquidation',
  );
  // TODO take all collateral when vault is underwater https://github.com/Agoric/agoric-sdk/issues/5558
  // t.deepEqual(
  //   await E(vault).getCollateralAmount(),
  //   aeth.makeEmpty(),
  //   'Collateral used up trying to cover debt',
  // );

  const finalNotification = await E(vaultNotifier).getUpdateSince();
  t.is(finalNotification.value.vaultState, Phase.LIQUIDATED);
  // vault holds no debt after liquidation
  t.is(finalNotification.value.debtSnapshot.debt.value, 0n);

  /** @type {UserSeat<string>} */
  const closeSeat = await E(zoe).offer(E(vault).makeCloseInvitation());
  // closing with 64n RUN remaining in debt
  await E(closeSeat).getOfferResult();

  const closeProceeds = await E(closeSeat).getPayouts();
  const collProceeds = await aeth.issuer.getAmountOf(closeProceeds.Collateral);
  const runProceeds = await E(services.runKit.issuer).getAmountOf(
    closeProceeds.RUN,
  );

  t.deepEqual(runProceeds, run.make(0n));
  t.deepEqual(collProceeds, aeth.make(1n));
  t.deepEqual(await E(vault).getCollateralAmount(), aeth.makeEmpty());
});

test('vaultFactory display collateral', async t => {
  const { aeth, run, rates: defaultRates } = t.context;
  t.context.aethInitialLiquidity = aeth.make(900n);
  t.context.rates = harden({
    ...defaultRates,
    loanFee: makeRatio(530n, run.brand, BASIS_POINTS),
  });

  const services = await setupServices(
    t,
    [500n, 1500n],
    aeth.make(90n),
    buildManualTimer(t.log),
    undefined,
    500n,
  );

  const { vaultFactory } = services.vaultFactory;
  const collaterals = await E(vaultFactory).getCollaterals();
  t.deepEqual(collaterals[0], {
    brand: aeth.brand,
    liquidationMargin: makeRatio(105n, run.brand),
    stabilityFee: makeRatio(530n, run.brand, BASIS_POINTS),
    marketPrice: makeRatio(5n, run.brand, 1n, aeth.brand),
    interestRate: makeRatio(100n, run.brand, 10000n, run.brand),
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
  t.context.loanTiming = {
    chargingPeriod: SECONDS_PER_WEEK,
    recordingPeriod: SECONDS_PER_WEEK,
  };
  const manualTimer = buildManualTimer(t.log, 0n, SECONDS_PER_DAY);
  const services = await setupServices(
    t,
    [500n, 1500n],
    aeth.make(90n),
    manualTimer,
    SECONDS_PER_DAY,
    500n,
  );
  const { vaultFactory, lender } = services.vaultFactory;

  // Create a loan for Alice for 4700 RUN with 1100 aeth collateral
  const collateralAmount = aeth.make(1100n);
  const aliceLoanAmount = run.make(4700n);
  /** @type {UserSeat<VaultKit>} */
  const aliceLoanSeat = await E(zoe).offer(
    E(lender).makeVaultInvitation(),
    harden({
      give: { Collateral: collateralAmount },
      want: { RUN: aliceLoanAmount },
    }),
    harden({
      Collateral: aeth.mint.mintPayment(collateralAmount),
    }),
  );
  const {
    vault: aliceVault,
    publicNotifiers: { vault: aliceNotifier, asset: assetNotifier },
  } = await E(aliceLoanSeat).getOfferResult();

  const debtAmount = await E(aliceVault).getCurrentDebt();
  const fee = ceilMultiplyBy(aliceLoanAmount, rates.loanFee);
  t.deepEqual(
    debtAmount,
    AmountMath.add(aliceLoanAmount, fee),
    'vault lent 4700 RUN + fees',
  );

  const { RUN: lentAmount } = await E(aliceLoanSeat).getCurrentAllocation();
  const loanProceeds = await E(aliceLoanSeat).getPayouts();
  t.deepEqual(lentAmount, aliceLoanAmount, 'received 4700 RUN');

  const runLent = await loanProceeds.RUN;
  t.truthy(
    AmountMath.isEqual(
      await E(run.issuer).getAmountOf(runLent),
      run.make(4700n),
    ),
  );

  // Create a loan for Bob for 3200 RUN with 800 aeth collateral
  const bobCollateralAmount = aeth.make(800n);
  const bobLoanAmount = run.make(3200n);
  /** @type {UserSeat<VaultKit>} */
  const bobLoanSeat = await E(zoe).offer(
    E(lender).makeVaultInvitation(),
    harden({
      give: { Collateral: bobCollateralAmount },
      want: { RUN: bobLoanAmount },
    }),
    harden({
      Collateral: aeth.mint.mintPayment(bobCollateralAmount),
    }),
  );
  const {
    vault: bobVault,
    publicNotifiers: { vault: bobNotifier },
  } = await E(bobLoanSeat).getOfferResult();

  const bobDebtAmount = await E(bobVault).getCurrentDebt();
  const bobFee = ceilMultiplyBy(bobLoanAmount, rates.loanFee);
  t.deepEqual(
    bobDebtAmount,
    AmountMath.add(bobLoanAmount, bobFee),
    'vault lent 3200 RUN + fees',
  );

  const { RUN: bobLentAmount } = await E(bobLoanSeat).getCurrentAllocation();
  const bobLoanProceeds = await E(bobLoanSeat).getPayouts();
  t.deepEqual(bobLentAmount, bobLoanAmount, 'received 4700 RUN');

  const bobRunLent = await bobLoanProceeds.RUN;
  t.truthy(
    AmountMath.isEqual(
      await E(run.issuer).getAmountOf(bobRunLent),
      run.make(3200n),
    ),
  );

  // { chargingPeriod: weekly, recordingPeriod: weekly }
  // Advance 8 days, past one charging and recording period
  await manualTimer.tickN(8);
  await eventLoopIteration();

  const assetUpdate = await E(assetNotifier).getUpdateSince();
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
    rewardAllocation.RUN.value,
    rewardRunCount,
    // reward includes 5% fees on two loans plus 1% interest three times on each
    `Should be ${rewardRunCount}, was ${rewardAllocation.RUN.value}`,
  );

  // try opening a vault that can't cover fees
  /** @type {UserSeat<VaultKit>} */
  const caroleLoanSeat = await E(zoe).offer(
    E(lender).makeVaultInvitation(),
    harden({
      give: { Collateral: aeth.make(200n) },
      want: { RUN: run.make(0n) }, // no debt
    }),
    harden({
      Collateral: aeth.mint.mintPayment(aeth.make(200n)),
    }),
  );
  await t.throwsAsync(E(caroleLoanSeat).getOfferResult());

  // Advance another 7 days, past one charging and recording period
  await manualTimer.tickN(8);
  await eventLoopIteration();

  // open a vault when manager's interest already compounded
  const wantedRun = 1_000n;
  /** @type {UserSeat<VaultKit>} */
  const danLoanSeat = await E(zoe).offer(
    E(lender).makeVaultInvitation(),
    harden({
      give: { Collateral: aeth.make(2_000n) },
      want: { RUN: run.make(wantedRun) },
    }),
    harden({
      Collateral: aeth.mint.mintPayment(aeth.make(2_000n)),
    }),
  );
  const {
    vault: danVault,
    publicNotifiers: { vault: danNotifier },
  } = await E(danLoanSeat).getOfferResult();
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
  const { lender } = services.vaultFactory;

  // initial loan /////////////////////////////////////

  // Create a loan for Alice for 5000 RUN with 1000 aeth collateral
  const collateralAmount = aeth.make(1000n);
  const aliceLoanAmount = run.make(5000n);
  /** @type {UserSeat<VaultKit>} */
  const aliceLoanSeat = await E(zoe).offer(
    E(lender).makeVaultInvitation(),
    harden({
      give: { Collateral: collateralAmount },
      want: { RUN: aliceLoanAmount },
    }),
    harden({
      Collateral: aeth.mint.mintPayment(collateralAmount),
    }),
  );
  const {
    vault: aliceVault,
    publicNotifiers: { vault: aliceNotifier },
  } = await E(aliceLoanSeat).getOfferResult();

  let debtAmount = await E(aliceVault).getCurrentDebt();
  const fee = ceilMultiplyBy(aliceLoanAmount, rates.loanFee);
  let runDebtLevel = AmountMath.add(aliceLoanAmount, fee);
  let collateralLevel = aeth.make(1000n);

  t.deepEqual(debtAmount, runDebtLevel, 'vault lent 5000 RUN + fees');
  const { RUN: lentAmount } = await E(aliceLoanSeat).getCurrentAllocation();
  const loanProceeds = await E(aliceLoanSeat).getPayouts();
  t.deepEqual(lentAmount, aliceLoanAmount, 'received 5000 RUN');

  const runLent = await loanProceeds.RUN;
  t.truthy(
    AmountMath.isEqual(
      await E(run.issuer).getAmountOf(runLent),
      run.make(5000n),
    ),
  );

  let aliceUpdate = await E(aliceNotifier).getUpdateSince();
  t.deepEqual(aliceUpdate.value.debtSnapshot.debt, runDebtLevel);
  t.deepEqual(aliceUpdate.value.debtSnapshot, {
    debt: run.make(5250n),
    interest: makeRatio(100n, run.brand),
  });

  // increase collateral 1 ///////////////////////////////////// (give both)

  // Alice increase collateral by 100, paying in 50 RUN against debt
  const collateralIncrement = aeth.make(100n);
  const depositRunAmount = run.make(50n);
  runDebtLevel = AmountMath.subtract(runDebtLevel, depositRunAmount);
  collateralLevel = AmountMath.add(collateralLevel, collateralIncrement);

  const [paybackPayment, _remainingPayment] = await E(run.issuer).split(
    runLent,
    depositRunAmount,
  );

  const aliceAddCollateralSeat1 = await E(zoe).offer(
    E(aliceVault).makeAdjustBalancesInvitation(),
    harden({
      give: { Collateral: collateralIncrement, RUN: depositRunAmount },
    }),
    harden({
      Collateral: aeth.mint.mintPayment(collateralIncrement),
      RUN: paybackPayment,
    }),
  );

  await E(aliceAddCollateralSeat1).getOfferResult();
  debtAmount = await E(aliceVault).getCurrentDebt();
  t.deepEqual(debtAmount, runDebtLevel);

  const { RUN: lentAmount2 } = await E(
    aliceAddCollateralSeat1,
  ).getCurrentAllocation();
  const loanProceeds2 = await E(aliceAddCollateralSeat1).getPayouts();
  t.deepEqual(lentAmount2, run.makeEmpty(), 'no payout');

  const runLent2 = await loanProceeds2.RUN;
  t.truthy(
    AmountMath.isEqual(
      await E(run.issuer).getAmountOf(runLent2),
      run.makeEmpty(),
    ),
  );

  aliceUpdate = await E(aliceNotifier).getUpdateSince();
  t.deepEqual(aliceUpdate.value.debtSnapshot.debt, runDebtLevel);

  // increase collateral 2 ////////////////////////////////// (want:s, give:c)

  // Alice increase collateral by 100, withdrawing 50 RUN
  const collateralIncrement2 = aeth.make(100n);
  const withdrawRunAmount = run.make(50n);
  const withdrawRunAmountWithFees = ceilMultiplyBy(
    withdrawRunAmount,
    rates.loanFee,
  );
  runDebtLevel = AmountMath.add(
    runDebtLevel,
    AmountMath.add(withdrawRunAmount, withdrawRunAmountWithFees),
  );
  collateralLevel = AmountMath.add(collateralLevel, collateralIncrement2);

  const aliceAddCollateralSeat2 = await E(zoe).offer(
    E(aliceVault).makeAdjustBalancesInvitation(),
    harden({
      give: { Collateral: collateralIncrement2 },
      want: { RUN: withdrawRunAmount },
    }),
    harden({
      Collateral: aeth.mint.mintPayment(collateralIncrement2),
    }),
  );

  await E(aliceAddCollateralSeat2).getOfferResult();
  const { RUN: lentAmount3 } = await E(
    aliceAddCollateralSeat2,
  ).getCurrentAllocation();
  const loanProceeds3 = await E(aliceAddCollateralSeat2).getPayouts();
  t.deepEqual(lentAmount3, run.make(50n));

  debtAmount = await E(aliceVault).getCurrentDebt();
  t.deepEqual(debtAmount, runDebtLevel);

  const runLent3 = await loanProceeds3.RUN;
  t.truthy(
    AmountMath.isEqual(
      await E(run.issuer).getAmountOf(runLent3),
      run.make(50n),
    ),
  );

  aliceUpdate = await E(aliceNotifier).getUpdateSince();
  t.deepEqual(aliceUpdate.value.debtSnapshot.debt, runDebtLevel);
  t.deepEqual(aliceUpdate.value.debtSnapshot, {
    debt: run.make(5253n),
    interest: run.makeRatio(100n),
  });

  // reduce collateral  ///////////////////////////////////// (want both)

  // Alice reduce collateral by 100, withdrawing 50 RUN
  const collateralDecrement = aeth.make(100n);
  const withdrawRun2 = run.make(50n);
  const withdrawRun2WithFees = ceilMultiplyBy(withdrawRun2, rates.loanFee);
  runDebtLevel = AmountMath.add(
    runDebtLevel,
    AmountMath.add(withdrawRunAmount, withdrawRun2WithFees),
  );
  collateralLevel = AmountMath.subtract(collateralLevel, collateralDecrement);
  const aliceReduceCollateralSeat = await E(zoe).offer(
    E(aliceVault).makeAdjustBalancesInvitation(),
    harden({
      want: { RUN: withdrawRun2, Collateral: collateralDecrement },
    }),
    harden({}),
  );

  await E(aliceReduceCollateralSeat).getOfferResult();

  debtAmount = await E(aliceVault).getCurrentDebt();
  t.deepEqual(debtAmount, runDebtLevel);
  t.deepEqual(collateralLevel, await E(aliceVault).getCollateralAmount());

  const { RUN: lentAmount4 } = await E(
    aliceReduceCollateralSeat,
  ).getCurrentAllocation();
  const loanProceeds4 = await E(aliceReduceCollateralSeat).getPayouts();
  t.deepEqual(lentAmount4, run.make(50n));

  const runBorrowed = await loanProceeds4.RUN;
  t.truthy(
    AmountMath.isEqual(
      await E(run.issuer).getAmountOf(runBorrowed),
      run.make(50n),
    ),
  );
  const collateralWithdrawn = await loanProceeds4.Collateral;
  t.truthy(
    AmountMath.isEqual(
      await E(aeth.issuer).getAmountOf(collateralWithdrawn),
      collateralDecrement,
    ),
  );

  aliceUpdate = await E(aliceNotifier).getUpdateSince();
  t.deepEqual(aliceUpdate.value.debtSnapshot.debt, runDebtLevel);

  // NSF  ///////////////////////////////////// (want too much of both)

  // Alice reduce collateral by 100, withdrawing 50 RUN
  const collateralDecr2 = aeth.make(800n);
  const withdrawRun3 = run.make(500n);
  const withdrawRun3WithFees = ceilMultiplyBy(withdrawRun3, rates.loanFee);
  runDebtLevel = AmountMath.add(
    runDebtLevel,
    AmountMath.add(withdrawRunAmount, withdrawRun3WithFees),
  );
  const aliceReduceCollateralSeat2 = await E(zoe).offer(
    E(aliceVault).makeAdjustBalancesInvitation(),
    harden({
      want: { RUN: withdrawRun3, Collateral: collateralDecr2 },
    }),
  );

  await t.throwsAsync(() => E(aliceReduceCollateralSeat2).getOfferResult(), {
    // Double-disclosure bug endojs/endo#640
    // wildcards were:
    // "brand":"[Alleged: RUN brand]","value":"[5829n]"
    // "value":"[3750n]","brand":"[Alleged: RUN brand]"
    message: / is more than the collateralization ratio allows:/,
    // message: /The requested debt {.*} is more than the collateralization ratio allows: {.*}/,
  });

  // try to trade zero for zero
  const aliceReduceCollateralSeat3 = await E(zoe).offer(
    E(aliceVault).makeAdjustBalancesInvitation(),
    harden({
      want: {
        RUN: run.makeEmpty(),
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
  const { lender } = services.vaultFactory;

  // initial loan /////////////////////////////////////

  // Create a loan for Alice for 5000 RUN with 1000 aeth collateral
  const collateralAmount = aeth.make(1000n);
  const aliceLoanAmount = run.make(5000n);
  /** @type {UserSeat<VaultKit>} */
  const aliceLoanSeat = await E(zoe).offer(
    E(lender).makeVaultInvitation(),
    harden({
      give: { Collateral: collateralAmount },
      want: { RUN: aliceLoanAmount },
    }),
    harden({
      Collateral: aeth.mint.mintPayment(collateralAmount),
    }),
  );
  const {
    vault: aliceVault,
    publicNotifiers: { vault: aliceNotifier },
  } = await E(aliceLoanSeat).getOfferResult();

  let debtAmount = await E(aliceVault).getCurrentDebt();
  const fee = ceilMultiplyBy(aliceLoanAmount, rates.loanFee);
  let runDebtLevel = AmountMath.add(aliceLoanAmount, fee);

  let aliceUpdate = await E(aliceNotifier).getUpdateSince();

  // Withdraw add'l RUN /////////////////////////////////////
  // Alice deposits nothing; requests more RUN

  const additionalRUN = run.make(100n);
  const aliceWithdrawRunSeat = await E(zoe).offer(
    E(aliceVault).makeAdjustBalancesInvitation(),
    harden({
      want: { RUN: additionalRUN },
    }),
  );

  await E(aliceWithdrawRunSeat).getOfferResult();
  debtAmount = await E(aliceVault).getCurrentDebt();
  runDebtLevel = AmountMath.add(
    runDebtLevel,
    AmountMath.add(additionalRUN, run.make(5n)),
  );
  t.deepEqual(debtAmount, runDebtLevel);

  const { RUN: lentAmount2 } = await E(
    aliceWithdrawRunSeat,
  ).getCurrentAllocation();
  const loanProceeds2 = await E(aliceWithdrawRunSeat).getPayouts();
  t.deepEqual(lentAmount2, additionalRUN, '100 RUN');

  const runLent2 = await loanProceeds2.RUN;
  t.deepEqual(await E(run.issuer).getAmountOf(runLent2), additionalRUN);

  aliceUpdate = await E(aliceNotifier).getUpdateSince();
  t.deepEqual(aliceUpdate.value.debtSnapshot.debt, runDebtLevel);
});

test('adjust balances after interest charges', async t => {
  const LOAN1 = 450n;
  const AMPLE = 100_000n;
  const { aeth, run } = t.context;

  // charge interest on every tick
  const manualTimer = buildManualTimer(trace, 0n, SECONDS_PER_DAY);
  t.context.loanTiming = {
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

  const { lender } = services.vaultFactory;

  trace('0. Take out loan');
  const vaultSeat = await E(services.zoe).offer(
    await E(lender).makeVaultInvitation(),
    harden({
      give: { Collateral: aeth.make(AMPLE) },
      want: { RUN: run.make(LOAN1) },
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
      give: { RUN: given },
      want: {},
    }),
    harden({
      RUN: await getRunFromFaucet(t, 60n),
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
  const { lender } = services.vaultFactory;

  // initial loan /////////////////////////////////////

  // Create a loan for Alice for 5000 RUN with 1000 aeth collateral
  const collateralAmount = aeth.make(1000n);
  const aliceLoanAmount = run.make(5000n);
  /** @type {UserSeat<VaultKit>} */
  const aliceLoanSeat = await E(zoe).offer(
    E(lender).makeVaultInvitation(),
    harden({
      give: { Collateral: collateralAmount },
      want: { RUN: aliceLoanAmount },
    }),
    harden({
      Collateral: aeth.mint.mintPayment(collateralAmount),
    }),
  );
  const {
    vault: aliceVault,
    publicNotifiers: { vault: aliceNotifier },
  } = await E(aliceLoanSeat).getOfferResult();

  const debtAmount = await E(aliceVault).getCurrentDebt();

  const getInvitationProperties = async invitation => {
    const invitationIssuer = E(zoe).getInvitationIssuer();
    const amount = await E(invitationIssuer).getAmountOf(invitation);
    return amount.value[0];
  };

  const transferInvite = E(aliceVault).makeTransferInvitation();
  const inviteProps = await getInvitationProperties(transferInvite);
  trace(t, 'TRANSFER INVITE', transferInvite, inviteProps);
  /** @type {UserSeat<VaultKit>} */
  const transferSeat = await E(zoe).offer(transferInvite);
  const {
    vault: transferVault,
    publicNotifiers: { vault: transferNotifier },
  } = await E(transferSeat).getOfferResult();
  await t.throwsAsync(() => E(aliceVault).getCurrentDebt());
  const debtAfter = await E(transferVault).getCurrentDebt();
  t.deepEqual(debtAfter, debtAmount, 'vault lent 5000 RUN + fees');
  const collateralAfter = await E(transferVault).getCollateralAmount();
  t.deepEqual(collateralAmount, collateralAfter, 'vault has 1000n aEth');

  const aliceFinish = await E(aliceNotifier).getUpdateSince();
  t.deepEqual(
    aliceFinish.value.vaultState,
    Phase.TRANSFER,
    'transfer closed old notifier',
  );

  t.like(inviteProps, {
    debtSnapshot: {
      debt: debtAmount,
      interest: aliceFinish.value.debtSnapshot.interest,
    },
    description: 'TransferVault',
    locked: collateralAmount,
    vaultState: 'active',
  });

  const transferStatus = await E(transferNotifier).getUpdateSince();
  t.deepEqual(
    transferStatus.value.vaultState,
    Phase.ACTIVE,
    'new notifier is active',
  );

  // Interleave with `adjustVault`
  // make the invitation first so that we can arrange the interleaving
  // of adjust and tranfer
  const adjustInvitation = E(transferVault).makeAdjustBalancesInvitation();
  const { RUN: lentAmount } = await E(aliceLoanSeat).getCurrentAllocation();
  const aliceProceeds = await E(aliceLoanSeat).getPayouts();
  t.deepEqual(lentAmount, aliceLoanAmount, 'received 5000 RUN');
  const borrowedRun = await aliceProceeds.RUN;
  const payoffRun2 = run.make(600n);
  const [paybackPayment, _remainingPayment] = await E(run.issuer).split(
    borrowedRun,
    payoffRun2,
  );

  // Adjust is multi-turn. Confirm that an interleaved transfer prevents it
  const adjustSeatPromise = E(zoe).offer(
    adjustInvitation,
    harden({
      give: { RUN: payoffRun2 },
    }),
    harden({ RUN: paybackPayment }),
  );
  const t2Invite = await E(transferVault).makeTransferInvitation();
  /** @type {UserSeat<VaultKit>} */
  const t2Seat = await E(zoe).offer(t2Invite);
  const {
    vault: t2Vault,
    publicNotifiers: { vault: t2Notifier },
  } = await E(t2Seat).getOfferResult();
  await t.throwsAsync(
    () => E(adjustSeatPromise).getOfferResult(),
    {
      message: 'Transfer during vault adjustment',
    },
    'adjust balances should have been rejected',
  );
  await t.throwsAsync(() => E(transferVault).getCurrentDebt());
  const debtAfter2 = await E(t2Vault).getCurrentDebt();
  t.deepEqual(debtAmount, debtAfter2, 'vault lent 5000 RUN + fees');

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

// Alice will over repay her borrowed RUN. In order to make that possible,
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
  const { vaultFactory, lender } = services.vaultFactory;

  // Alice's loan /////////////////////////////////////

  // Create a loan for Alice for 5000 RUN with 1000 aeth collateral
  const collateralAmount = aeth.make(1000n);
  const aliceLoanAmount = run.make(5000n);
  /** @type {UserSeat<VaultKit>} */
  const aliceLoanSeat = await E(zoe).offer(
    E(lender).makeVaultInvitation(),
    harden({
      give: { Collateral: collateralAmount },
      want: { RUN: aliceLoanAmount },
    }),
    harden({
      Collateral: aeth.mint.mintPayment(collateralAmount),
    }),
  );
  const {
    vault: aliceVault,
    publicNotifiers: { vault: aliceNotifier },
  } = await E(aliceLoanSeat).getOfferResult();

  let debtAmount = await E(aliceVault).getCurrentDebt();
  const fee = ceilMultiplyBy(aliceLoanAmount, rates.loanFee);
  const runDebt = AmountMath.add(aliceLoanAmount, fee);

  t.deepEqual(debtAmount, runDebt, 'vault lent 5000 RUN + fees');
  const { RUN: lentAmount } = await E(aliceLoanSeat).getCurrentAllocation();
  const aliceProceeds = await E(aliceLoanSeat).getPayouts();
  t.deepEqual(lentAmount, aliceLoanAmount, 'received 5000 RUN');

  const borrowedRun = await aliceProceeds.RUN;
  t.truthy(
    AmountMath.isEqual(
      await E(run.issuer).getAmountOf(borrowedRun),
      run.make(5000n),
    ),
  );

  let aliceUpdate = await E(aliceNotifier).getUpdateSince();
  t.deepEqual(aliceUpdate.value.debtSnapshot.debt, runDebt);
  t.deepEqual(aliceUpdate.value.locked, collateralAmount);

  // Bob's loan /////////////////////////////////////

  // Create a loan for Bob for 1000 RUN with 200 aeth collateral
  const bobCollateralAmount = aeth.make(200n);
  const bobLoanAmount = run.make(1000n);
  /** @type {UserSeat<VaultKit>} */
  const bobLoanSeat = await E(zoe).offer(
    E(lender).makeVaultInvitation(),
    harden({
      give: { Collateral: bobCollateralAmount },
      want: { RUN: bobLoanAmount },
    }),
    harden({
      Collateral: aeth.mint.mintPayment(bobCollateralAmount),
    }),
  );
  const bobProceeds = await E(bobLoanSeat).getPayouts();
  await E(bobLoanSeat).getOfferResult();
  const bobRun = await bobProceeds.RUN;
  t.truthy(
    AmountMath.isEqual(
      await E(run.issuer).getAmountOf(bobRun),
      run.make(1000n),
    ),
  );

  // overpay debt ///////////////////////////////////// (give RUN)

  const combinedRun = await E(run.issuer).combine(
    harden([borrowedRun, bobRun]),
  );
  const depositRun2 = run.make(6000n);

  const aliceOverpaySeat = await E(zoe).offer(
    E(aliceVault).makeAdjustBalancesInvitation(),
    harden({
      give: { RUN: depositRun2 },
    }),
    harden({ RUN: combinedRun }),
  );

  await E(aliceOverpaySeat).getOfferResult();
  debtAmount = await E(aliceVault).getCurrentDebt();
  t.deepEqual(debtAmount, run.makeEmpty());

  const { RUN: lentAmount5 } = await E(aliceOverpaySeat).getCurrentAllocation();
  const loanProceeds5 = await E(aliceOverpaySeat).getPayouts();
  t.deepEqual(lentAmount5, run.make(750n));

  const runReturned = await loanProceeds5.RUN;
  t.deepEqual(await E(run.issuer).getAmountOf(runReturned), run.make(750n));

  aliceUpdate = await E(aliceNotifier).getUpdateSince();
  t.deepEqual(aliceUpdate.value.debtSnapshot.debt, run.makeEmpty());

  const collectFeesSeat = await E(zoe).offer(
    E(vaultFactory).makeCollectFeesInvitation(),
  );
  await E(collectFeesSeat).getOfferResult();
  assertAmountsEqual(
    t,
    await E.get(E(collectFeesSeat).getCurrentAllocation()).RUN,
    run.make(300n),
  );
});

// We'll make two loans, and trigger one via price changes, and the other via
// interest charges. The interest rate is 20%. The liquidation margin is 105%.
// Both loans will initially be over collateralized 100%. Alice will withdraw
// enough of the overage that she'll get caught when prices drop. Bob will be
// charged interest (twice), which will trigger liquidation.
test('mutable liquidity triggers and interest', async t => {
  const { zoe, aeth, run, rates: defaultRates } = t.context;
  t.context.aethInitialLiquidity = aeth.make(90_000_000n);

  // Add a vaultManager with 10000 aeth collateral at a 200 aeth/RUN rate
  const rates = harden({
    ...defaultRates,
    // charge 5% interest
    interestRate: run.makeRatio(30n),
    liquidationMargin: run.makeRatio(130n),
  });
  t.context.rates = rates;

  t.context.loanTiming = {
    chargingPeriod: SECONDS_PER_WEEK,
    recordingPeriod: SECONDS_PER_WEEK,
  };

  // charge interest on every tick
  const manualTimer = buildManualTimer(t.log, 0n, SECONDS_PER_WEEK);
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
    priceAuthority,
    reserveFacets: { reserveCreatorFacet },
  } = services;

  const metricsSub = await E(reserveCreatorFacet).getMetrics();
  const m = await subscriptionTracker(t, metricsSub);
  await m.assertInitial(reserveInitialState(run.makeEmpty()));
  let shortfallBalance = 0n;

  // initial loans /////////////////////////////////////

  // ALICE ////////////////////////////////////////////

  // Create a loan for Alice for 5000 RUN with 1000 aeth collateral
  // ratio is 4:1
  const aliceCollateralAmount = aeth.make(1000n);
  const aliceLoanAmount = run.make(5000n);
  /** @type {UserSeat<VaultKit>} */
  const aliceLoanSeat = await E(zoe).offer(
    E(lender).makeVaultInvitation(),
    harden({
      give: { Collateral: aliceCollateralAmount },
      want: { RUN: aliceLoanAmount },
    }),
    harden({
      Collateral: aeth.mint.mintPayment(aliceCollateralAmount),
    }),
  );
  const {
    vault: aliceVault,
    publicNotifiers: { vault: aliceNotifier },
  } = await E(aliceLoanSeat).getOfferResult();

  const aliceDebtAmount = await E(aliceVault).getCurrentDebt();
  const fee = ceilMultiplyBy(aliceLoanAmount, rates.loanFee);
  const aliceRunDebtLevel = AmountMath.add(aliceLoanAmount, fee);

  t.deepEqual(aliceDebtAmount, aliceRunDebtLevel, 'vault lent 5000 RUN + fees');
  const { RUN: aliceLentAmount } = await E(
    aliceLoanSeat,
  ).getCurrentAllocation();
  const aliceLoanProceeds = await E(aliceLoanSeat).getPayouts();
  t.deepEqual(aliceLentAmount, aliceLoanAmount, 'received 5000 RUN');
  trace(t, 'alice vault');

  const aliceRunLent = await aliceLoanProceeds.RUN;
  t.truthy(
    AmountMath.isEqual(
      await E(run.issuer).getAmountOf(aliceRunLent),
      aliceLoanAmount,
    ),
  );

  let aliceUpdate = await E(aliceNotifier).getUpdateSince();
  t.deepEqual(aliceUpdate.value.debtSnapshot.debt, aliceRunDebtLevel);

  // BOB //////////////////////////////////////////////

  // Create a loan for Bob for 650 RUN with 100 Aeth collateral
  const bobCollateralAmount = aeth.make(100n);
  const bobLoanAmount = run.make(512n);
  /** @type {UserSeat<VaultKit>} */
  const bobLoanSeat = await E(zoe).offer(
    E(lender).makeVaultInvitation(),
    harden({
      give: { Collateral: bobCollateralAmount },
      want: { RUN: bobLoanAmount },
    }),
    harden({
      Collateral: aeth.mint.mintPayment(bobCollateralAmount),
    }),
  );
  const {
    vault: bobVault,
    publicNotifiers: { vault: bobNotifier },
  } = await E(bobLoanSeat).getOfferResult();

  const bobDebtAmount = await E(bobVault).getCurrentDebt();
  const bobFee = ceilMultiplyBy(bobLoanAmount, rates.loanFee);
  const bobRunDebtLevel = AmountMath.add(bobLoanAmount, bobFee);

  t.deepEqual(bobDebtAmount, bobRunDebtLevel, 'vault lent 5000 RUN + fees');
  const { RUN: bobLentAmount } = await E(bobLoanSeat).getCurrentAllocation();
  const bobLoanProceeds = await E(bobLoanSeat).getPayouts();
  t.deepEqual(bobLentAmount, bobLoanAmount, 'received 5000 RUN');
  trace(t, 'bob vault');

  const bobRunLent = await bobLoanProceeds.RUN;
  t.truthy(
    AmountMath.isEqual(
      await E(run.issuer).getAmountOf(bobRunLent),
      bobLoanAmount,
    ),
  );

  let bobUpdate = await E(bobNotifier).getUpdateSince();
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
  ).getCurrentAllocation();
  const loanProceeds4 = await E(aliceReduceCollateralSeat).getPayouts();
  t.deepEqual(aliceWithdrawnAeth, aeth.make(300n));

  const collateralWithdrawn = await loanProceeds4.Collateral;
  t.truthy(
    AmountMath.isEqual(
      await E(aeth.issuer).getAmountOf(collateralWithdrawn),
      collateralDecrement,
    ),
  );

  aliceUpdate = await E(aliceNotifier).getUpdateSince(aliceUpdate.updateCount);
  t.deepEqual(aliceUpdate.value.debtSnapshot.debt, aliceRunDebtLevel);
  trace(t, 'alice reduce collateral');

  // @ts-expect-error mock
  await E(priceAuthority).setPrice(makeRatio(7n, run.brand, 1n, aeth.brand));
  trace(t, 'changed price to 7');

  // expect Alice to be liquidated because her collateral is too low.
  aliceUpdate = await E(aliceNotifier).getUpdateSince(aliceUpdate.updateCount);
  trace(t, 'alice liquidating?', aliceUpdate.value.vaultState);
  t.is(aliceUpdate.value.vaultState, Phase.LIQUIDATING);

  shortfallBalance += 1900n;
  const liqBrand = await services.getLiquidityBrand(aeth.brand);
  await m.assertChange({
    shortfallBalance: { value: shortfallBalance },
    allocations: { RaEthLiquidity: AmountMath.make(liqBrand, 300n) },
  });

  // XXX this causes BOB to get liquidated, which is suspicious. Revisit this test case
  await eventLoopIteration();
  bobUpdate = await E(bobNotifier).getUpdateSince();
  trace(t, 'bob not liquidating?', bobUpdate.value.vaultState);
  t.is(bobUpdate.value.vaultState, Phase.ACTIVE);

  // Bob's loan is now 777 RUN (including interest) on 100 Aeth, with the price
  // at 7. 100 * 7 > 1.05 * 777. When interest is charged again, Bob should get
  // liquidated.
  await manualTimer.tickN(8);
  t.is(bobUpdate.value.vaultState, Phase.ACTIVE);
  trace(
    t,
    'bob active 2?',
    bobUpdate.value.vaultState,
    await E(bobVault).getCurrentDebt(),
  );

  aliceUpdate = await E(aliceNotifier).getUpdateSince(aliceUpdate.updateCount);
  t.is(aliceUpdate.value.vaultState, Phase.LIQUIDATED);
  trace(t, 'alice liquidated');

  bobUpdate = await E(bobNotifier).getUpdateSince();
  trace(
    t,
    'bob state?',
    bobUpdate.value.vaultState,
    await E(bobVault).getCurrentDebt(),
  );
  // 5 days pass
  await manualTimer.tickN(5);

  shortfallBalance += 44n;
  await m.assertChange({
    shortfallBalance: { value: shortfallBalance },
  });

  bobUpdate = await E(bobNotifier).getUpdateSince();
  trace(
    t,
    'bob 2 state?',
    bobUpdate.value.vaultState,
    await E(bobVault).getCurrentDebt(),
  );

  await eventLoopIteration();
  bobUpdate = await E(bobNotifier).getUpdateSince();
  t.is(bobUpdate.value.vaultState, Phase.LIQUIDATED);
  trace(t, 'bob liquidated');
});

test('bad chargingPeriod', async t => {
  t.throws(
    () =>
      makeParamManagerBuilder(makeStoredPublisherKit())
        // @ts-expect-error bad value for test
        .addNat(CHARGING_PERIOD_KEY, 2)
        .addNat(RECORDING_PERIOD_KEY, 10n)
        .build(),
    { message: '2 must be a bigint' },
  );
});

test('collect fees from loan and AMM', async t => {
  const { zoe, aeth, run, rates } = t.context;

  t.context.aethInitialLiquidity = aeth.make(900n);

  const priceList = [500n, 15n];
  const unitAmountIn = aeth.make(900n);
  const manualTimer = buildManualTimer(t.log);

  // Add a pool with 900 aeth collateral at a 201 aeth/RUN rate

  const services = await setupServices(
    t,
    priceList,
    unitAmountIn,
    manualTimer,
    undefined,
    500n,
  );
  const { vaultFactory, lender } = services.vaultFactory;

  // Create a loan for 470 RUN with 1100 aeth collateral
  const collateralAmount = aeth.make(1100n);
  const loanAmount = run.make(470n);
  /** @type {UserSeat<VaultKit>} */
  const vaultSeat = await E(zoe).offer(
    E(lender).makeVaultInvitation(),
    harden({
      give: { Collateral: collateralAmount },
      want: { RUN: loanAmount },
    }),
    harden({
      Collateral: aeth.mint.mintPayment(collateralAmount),
    }),
  );

  const { vault } = await E(vaultSeat).getOfferResult();
  const debtAmount = await E(vault).getCurrentDebt();
  const fee = ceilMultiplyBy(run.make(470n), rates.loanFee);
  t.deepEqual(debtAmount, AmountMath.add(loanAmount, fee), 'vault loaned RUN');
  trace(t, 'correct debt', debtAmount);

  const { RUN: lentAmount } = await E(vaultSeat).getCurrentAllocation();
  const loanProceeds = await E(vaultSeat).getPayouts();
  await loanProceeds.RUN;
  t.deepEqual(lentAmount, loanAmount, 'received 47 RUN');
  t.deepEqual(
    await E(vault).getCollateralAmount(),
    aeth.make(1100n),
    'vault holds 1100 Collateral',
  );

  t.deepEqual(await E(vaultFactory).getRewardAllocation(), {
    RUN: run.make(24n),
  });

  const amm = services.ammFacets.ammPublicFacet;
  const swapAmount = aeth.make(60000n);
  const swapSeat = await E(zoe).offer(
    E(amm).makeSwapInInvitation(),
    harden({
      give: { In: swapAmount },
      want: { Out: run.makeEmpty() },
    }),
    harden({
      In: aeth.mint.mintPayment(swapAmount),
    }),
  );

  const payouts = await E(swapSeat).getPayouts();
  const inAmount = await E(aeth.issuer).getAmountOf(await payouts.In);
  t.truthy(AmountMath.isGTE(aeth.make(60000n), inAmount));
  const outAmount = await E(run.issuer).getAmountOf(await payouts.Out);
  t.truthy(AmountMath.isGTE(outAmount, run.makeEmpty()));

  const feePoolBalance = await E(amm).getProtocolPoolBalance();
  const collectFeesSeat = await E(zoe).offer(
    E(vaultFactory).makeCollectFeesInvitation(),
  );
  await E(collectFeesSeat).getOfferResult();
  const feePayoutAmount = await E.get(E(collectFeesSeat).getCurrentAllocation())
    .RUN;
  trace(t, 'Fee', feePoolBalance, feePayoutAmount);
  t.truthy(AmountMath.isGTE(feePayoutAmount, feePoolBalance.RUN));
});

test('close loan', async t => {
  const { zoe, aeth, run, rates } = t.context;

  const services = await setupServices(
    t,
    [15n],
    aeth.make(1n),
    buildManualTimer(t.log),
    undefined,
    500n,
  );

  const { lender } = services.vaultFactory;

  // initial loan /////////////////////////////////////

  // Create a loan for Alice for 5000 RUN with 1000 aeth collateral
  const collateralAmount = aeth.make(1000n);
  const aliceLoanAmount = run.make(5000n);
  /** @type {UserSeat<VaultKit>} */
  const aliceLoanSeat = await E(zoe).offer(
    E(lender).makeVaultInvitation(),
    harden({
      give: { Collateral: collateralAmount },
      want: { RUN: aliceLoanAmount },
    }),
    harden({
      Collateral: aeth.mint.mintPayment(collateralAmount),
    }),
  );
  const {
    vault: aliceVault,
    publicNotifiers: { vault: aliceNotifier },
  } = await E(aliceLoanSeat).getOfferResult();

  const debtAmount = await E(aliceVault).getCurrentDebt();
  const fee = ceilMultiplyBy(aliceLoanAmount, rates.loanFee);
  const runDebtLevel = AmountMath.add(aliceLoanAmount, fee);

  t.deepEqual(debtAmount, runDebtLevel, 'vault lent 5000 RUN + fees');
  const { RUN: lentAmount } = await E(aliceLoanSeat).getCurrentAllocation();
  const loanProceeds = await E(aliceLoanSeat).getPayouts();
  t.deepEqual(lentAmount, aliceLoanAmount, 'received 5000 RUN');

  const runLent = await loanProceeds.RUN;
  t.truthy(
    AmountMath.isEqual(
      await E(run.issuer).getAmountOf(runLent),
      run.make(5000n),
    ),
  );

  const aliceUpdate = await E(aliceNotifier).getUpdateSince();
  t.deepEqual(aliceUpdate.value.debtSnapshot.debt, runDebtLevel);
  t.deepEqual(aliceUpdate.value.locked, collateralAmount);

  // Create a loan for Bob for 1000 RUN with 200 aeth collateral
  const bobCollateralAmount = aeth.make(200n);
  const bobLoanAmount = run.make(1000n);
  /** @type {UserSeat<VaultKit>} */
  const bobLoanSeat = await E(zoe).offer(
    E(lender).makeVaultInvitation(),
    harden({
      give: { Collateral: bobCollateralAmount },
      want: { RUN: bobLoanAmount },
    }),
    harden({
      Collateral: aeth.mint.mintPayment(bobCollateralAmount),
    }),
  );
  const bobProceeds = await E(bobLoanSeat).getPayouts();
  await E(bobLoanSeat).getOfferResult();
  const bobRun = await bobProceeds.RUN;
  t.truthy(
    AmountMath.isEqual(
      await E(run.issuer).getAmountOf(bobRun),
      run.make(1000n),
    ),
  );

  // close loan, using Bob's RUN /////////////////////////////////////

  const runRepayment = await E(run.issuer).combine(harden([bobRun, runLent]));

  /** @type {UserSeat<string>} */
  const aliceCloseSeat = await E(zoe).offer(
    E(aliceVault).makeCloseInvitation(),
    harden({
      give: { RUN: run.make(6000n) },
      want: { Collateral: aeth.makeEmpty() },
    }),
    harden({ RUN: runRepayment }),
  );

  const closeOfferResult = await E(aliceCloseSeat).getOfferResult();
  t.is(closeOfferResult, 'your loan is closed, thank you for your business');

  const closeAlloc = await E(aliceCloseSeat).getCurrentAllocation();
  t.deepEqual(closeAlloc, {
    RUN: run.make(750n),
    Collateral: aeth.make(1000n),
  });
  const closeProceeds = await E(aliceCloseSeat).getPayouts();
  const collProceeds = await aeth.issuer.getAmountOf(closeProceeds.Collateral);
  const runProceeds = await E(run.issuer).getAmountOf(closeProceeds.RUN);

  t.deepEqual(runProceeds, run.make(750n));
  t.deepEqual(collProceeds, aeth.make(1000n));
  t.deepEqual(await E(aliceVault).getCollateralAmount(), aeth.makeEmpty());
});

test('excessive loan', async t => {
  const { zoe, aeth, run } = t.context;

  const services = await setupServices(
    t,
    [15n],
    aeth.make(1n),
    buildManualTimer(t.log),
    undefined,
    500n,
  );
  const { lender } = services.vaultFactory;

  // Try to Create a loan for Alice for 5000 RUN with 100 aeth collateral
  const collateralAmount = aeth.make(100n);
  const aliceLoanAmount = run.make(5000n);
  /** @type {UserSeat<VaultKit>} */
  const aliceLoanSeat = await E(zoe).offer(
    E(lender).makeVaultInvitation(),
    harden({
      give: { Collateral: collateralAmount },
      want: { RUN: aliceLoanAmount },
    }),
    harden({
      Collateral: aeth.mint.mintPayment(collateralAmount),
    }),
  );
  await t.throwsAsync(() => E(aliceLoanSeat).getOfferResult(), {
    message: /exceeds max/,
  });
});

test('loan too small', async t => {
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
  const { lender } = services.vaultFactory;

  // Try to Create a loan for Alice for 5000 RUN with 100 aeth collateral
  const collateralAmount = aeth.make(100n);
  const aliceLoanAmount = run.make(5000n);
  /** @type {UserSeat<VaultKit>} */
  const aliceLoanSeat = await E(zoe).offer(
    E(lender).makeVaultInvitation(),
    harden({
      give: { Collateral: collateralAmount },
      want: { RUN: aliceLoanAmount },
    }),
    harden({
      Collateral: aeth.mint.mintPayment(collateralAmount),
    }),
  );
  await t.throwsAsync(() => E(aliceLoanSeat).getOfferResult(), {
    message: /Requested.*".5250n.".*exceeds max.*".1428n.".* for .*".100n/,
  });
});

/**
 * Each vaultManager manages one collateral type and has a governed parameter, `debtLimit`,
 * that specifies a cap on the amount of debt the manager will allow.
 *
 * Attempts to adjust balances on vaults beyond the debt limit fail.
 * In other words, minting for anything other than charging interest fails.
 */
test('excessive debt on collateral type', async t => {
  const { zoe, aeth, run } = t.context;

  const services = await setupServices(
    t,
    [15n],
    aeth.make(1n),
    buildManualTimer(t.log),
    undefined,
    500n,
  );
  const { lender } = services.vaultFactory;
  const collateralAmount = aeth.make(1_000_000n);
  const centralAmount = run.make(1_000_000n);
  /** @type {UserSeat<VaultKit>} */
  const loanSeat = await E(zoe).offer(
    E(lender).makeVaultInvitation(),
    harden({
      give: { Collateral: collateralAmount },
      want: { RUN: centralAmount },
    }),
    harden({
      Collateral: aeth.mint.mintPayment(collateralAmount),
    }),
  );
  await t.throwsAsync(() => E(loanSeat).getOfferResult(), {
    message:
      'Minting {"brand":"[Alleged: RUN brand]","value":"[1050000n]"} past {"brand":"[Alleged: RUN brand]","value":"[0n]"} would hit total debt limit {"brand":"[Alleged: RUN brand]","value":"[1000000n]"}',
  });
});

// We'll make two loans, and trigger one via interest charges, and not trigger
// liquidation of the other. The interest rate is 20%. The liquidation margin is
// 105%. Both loans will initially be over collateralized 100%. Alice will
// withdraw enough of the overage that she's on the cusp of getting caught when
// prices drop. Bob will be charged interest (twice), which will trigger
// liquidation. Alice's withdrawal is precisely gauged so the difference between
// a floorDivideBy and a ceilingDivideBy will leave her unliquidated.
test('mutable liquidity sensitivity of triggers and interest', async t => {
  const { zoe, aeth, run, rates: defaultRates } = t.context;

  t.context.loanTiming = {
    chargingPeriod: SECONDS_PER_WEEK,
    recordingPeriod: SECONDS_PER_WEEK,
  };

  // Add a vaultManager with 10000 aeth collateral at a 200 aeth/RUN rate
  const rates = harden({
    ...defaultRates,
    // charge 5% interest
    loanFee: run.makeRatio(500n, BASIS_POINTS),
  });
  t.context.rates = rates;

  // charge interest on every tick
  const manualTimer = buildManualTimer(t.log, 0n, SECONDS_PER_WEEK);
  const services = await setupServices(
    t,
    [10n, 7n],
    aeth.make(1n),
    manualTimer,
    SECONDS_PER_WEEK,
    500n,
  );

  // initial loans /////////////////////////////////////
  const { lender } = services.vaultFactory;

  // Create a loan for Alice for 5000 RUN with 1000 aeth collateral
  const aliceCollateralAmount = aeth.make(1000n);
  const aliceLoanAmount = run.make(5000n);
  /** @type {UserSeat<VaultKit>} */
  const aliceLoanSeat = await E(zoe).offer(
    E(lender).makeVaultInvitation(),
    harden({
      give: { Collateral: aliceCollateralAmount },
      want: { RUN: aliceLoanAmount },
    }),
    harden({
      Collateral: aeth.mint.mintPayment(aliceCollateralAmount),
    }),
  );
  const {
    vault: aliceVault,
    publicNotifiers: { vault: aliceNotifier },
  } = await E(aliceLoanSeat).getOfferResult();

  const aliceDebtAmount = await E(aliceVault).getCurrentDebt();
  const fee = ceilMultiplyBy(aliceLoanAmount, rates.loanFee);
  const aliceRunDebtLevel = AmountMath.add(aliceLoanAmount, fee);

  t.deepEqual(aliceDebtAmount, aliceRunDebtLevel, 'vault lent 5000 RUN + fees');
  const { RUN: aliceLentAmount } = await E(
    aliceLoanSeat,
  ).getCurrentAllocation();
  const aliceLoanProceeds = await E(aliceLoanSeat).getPayouts();
  t.deepEqual(aliceLentAmount, aliceLoanAmount, 'received 5000 RUN');

  const aliceRunLent = await aliceLoanProceeds.RUN;
  t.truthy(
    AmountMath.isEqual(
      await E(run.issuer).getAmountOf(aliceRunLent),
      run.make(5000n),
    ),
  );

  let aliceUpdate = await E(aliceNotifier).getUpdateSince();
  t.deepEqual(aliceUpdate.value.debtSnapshot.debt, aliceRunDebtLevel);

  // Create a loan for Bob for 740 RUN with 100 Aeth collateral
  const bobCollateralAmount = aeth.make(100n);
  const bobLoanAmount = run.make(740n);
  /** @type {UserSeat<VaultKit>} */
  const bobLoanSeat = await E(zoe).offer(
    E(lender).makeVaultInvitation(),
    harden({
      give: { Collateral: bobCollateralAmount },
      want: { RUN: bobLoanAmount },
    }),
    harden({
      Collateral: aeth.mint.mintPayment(bobCollateralAmount),
    }),
  );
  const {
    vault: bobVault,
    publicNotifiers: { vault: bobNotifier },
  } = await E(bobLoanSeat).getOfferResult();

  const bobDebtAmount = await E(bobVault).getCurrentDebt();
  const bobFee = ceilMultiplyBy(bobLoanAmount, rates.loanFee);
  const bobRunDebtLevel = AmountMath.add(bobLoanAmount, bobFee);

  t.deepEqual(bobDebtAmount, bobRunDebtLevel, 'vault lent 5000 RUN + fees');
  const { RUN: bobLentAmount } = await E(bobLoanSeat).getCurrentAllocation();
  const bobLoanProceeds = await E(bobLoanSeat).getPayouts();
  t.deepEqual(bobLentAmount, bobLoanAmount, 'received 5000 RUN');

  const bobRunLent = await bobLoanProceeds.RUN;
  t.truthy(
    AmountMath.isEqual(
      await E(run.issuer).getAmountOf(bobRunLent),
      run.make(740n),
    ),
  );

  let bobUpdate = await E(bobNotifier).getUpdateSince();
  t.deepEqual(bobUpdate.value.debtSnapshot.debt, bobRunDebtLevel);

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

  await E(aliceReduceCollateralSeat).getCurrentAllocation();
  const loanProceeds4 = await E(aliceReduceCollateralSeat).getPayouts();
  // t.deepEqual(aliceWithdrawnAeth, aeth.make(210n));

  const collateralWithdrawn = await loanProceeds4.Collateral;
  t.truthy(
    AmountMath.isEqual(
      await E(aeth.issuer).getAmountOf(collateralWithdrawn),
      collateralDecrement,
    ),
  );

  aliceUpdate = await E(aliceNotifier).getUpdateSince(aliceUpdate.updateCount);
  t.deepEqual(aliceUpdate.value.debtSnapshot.debt, aliceRunDebtLevel);
  t.is(aliceUpdate.value.vaultState, Phase.ACTIVE);

  // Bob's loan is now 777 RUN (including interest) on 100 Aeth, with the price
  // at 7. 100 * 7 > 1.05 * 777. When interest is charged again, Bob should get
  // liquidated.
  // Advance time to trigger interest collection.
  await manualTimer.tick();
  // price levels changed and interest was charged.

  await eventLoopIteration();
  bobUpdate = await E(bobNotifier).getUpdateSince(bobUpdate.updateCount);
  t.is(bobUpdate.value.vaultState, Phase.LIQUIDATED);

  // No change for Alice
  aliceUpdate = await E(aliceNotifier).getUpdateSince(); // can't use updateCount because there's no newer update
  t.is(aliceUpdate.value.vaultState, Phase.ACTIVE);
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
    // @ts-expect-error bad args
    E(vaultFactory).addVaultType(chit.issuer, 'Chit', missingParams),
    { message: /Must have same property names/ },
  );

  const actual = await E(vaultFactory).addVaultType(
    chit.issuer,
    'Chit',
    extraParams,
  );
  t.true(matches(actual, M.remotable()), 'unexpected params are ignored');
});

test('storage keys', async t => {
  const { aeth } = t.context;
  const services = await setupServices(
    t,
    [500n, 15n],
    aeth.make(900n),
    undefined,
    undefined,
    500n,
  );

  // Root vault factory
  const { factoryPublic, vaultFactory } = services.vaultFactory;
  t.is(
    await subscriptionKey(E(factoryPublic).getMetrics()),
    'mockChainStorageRoot.vaultFactory.metrics',
  );
  t.is(
    await subscriptionKey(E(factoryPublic).getElectorateSubscription()),
    'mockChainStorageRoot.vaultFactory.governance',
  );

  // First manager
  const manager0 = await E(factoryPublic).getCollateralManager(aeth.brand);
  t.is(
    await subscriptionKey(E(manager0).getMetrics()),
    'mockChainStorageRoot.vaultFactory.manager0.metrics',
  );
  t.is(
    await subscriptionKey(
      E(factoryPublic).getSubscription({
        collateralBrand: aeth.brand,
      }),
    ),
    'mockChainStorageRoot.vaultFactory.manager0.governance',
  );

  // Second manager
  const chit = makeIssuerKit('chit');
  const manager1 = await E(vaultFactory).addVaultType(
    chit.issuer,
    'Chit',
    defaultParamValues(chit.brand),
  );
  t.is(
    await subscriptionKey(E(E(manager1).getPublicFacet()).getMetrics()),
    'mockChainStorageRoot.vaultFactory.manager1.metrics',
  );
  t.is(
    await subscriptionKey(
      E(factoryPublic).getSubscription({
        collateralBrand: chit.brand,
      }),
    ),
    'mockChainStorageRoot.vaultFactory.manager1.governance',
  );
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

  const { factoryPublic, vaultFactory } = services.vaultFactory;

  const m = await metricsTracker(t, factoryPublic);

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

test('manager notifiers', async t => {
  const LOAN1 = 450n;
  const DEBT1 = 473n; // with penalty
  const LOAN2 = 50n;
  const DEBT2 = 53n; // with penalty
  const AMPLE = 100_000n;
  const ENOUGH = 10_000n;

  const { aeth, run } = t.context;
  const manualTimer = buildManualTimer(t.log, 0n, SECONDS_PER_WEEK);
  t.context.loanTiming = {
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
  );

  const { aethVaultManager, lender } = services.vaultFactory;
  const cm = await E(aethVaultManager).getPublicFacet();

  const m = await vaultManagerMetricsTracker(t, cm);

  trace('0. Creation');
  await m.assertInitial({
    // present
    numVaults: 0,
    totalCollateral: aeth.make(0n),
    totalDebt: run.make(0n),

    // running
    numLiquidationsCompleted: 0,
    totalOverageReceived: run.make(0n),
    totalProceedsReceived: run.make(0n),
    totalCollateralSold: aeth.make(0n),
    totalShortfallReceived: run.make(0n),
  });

  trace('1. Create a loan with ample collateral');
  /** @type {UserSeat<VaultKit>} */
  let vaultSeat = await E(services.zoe).offer(
    await E(lender).makeVaultInvitation(),
    harden({
      give: { Collateral: aeth.make(AMPLE) },
      want: { RUN: run.make(LOAN1) },
    }),
    harden({
      Collateral: t.context.aeth.mint.mintPayment(aeth.make(AMPLE)),
    }),
  );
  let { vault } = await E(vaultSeat).getOfferResult();
  m.addDebt(DEBT1);
  await m.assertChange({
    numVaults: 1,
    totalCollateral: { value: AMPLE },
    totalDebt: { value: DEBT1 },
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
  await m.assertChange({
    totalCollateral: { value: AMPLE - COLL_REMOVED },
  });

  trace('3. Liquidate all (1 loan)');
  await E(aethVaultManager).liquidateAll();
  let totalProceedsReceived = 474n;
  let totalOverageReceived = totalProceedsReceived - DEBT1;
  await m.assertChange({
    numVaults: 0,
    totalCollateral: { value: 0n },
    totalDebt: { value: 0n },
    numLiquidationsCompleted: 1,
    totalOverageReceived: { value: totalOverageReceived },
    totalProceedsReceived: { value: totalProceedsReceived },
  });
  m.assertFullyLiquidated();
  t.is((await E(vault).getCurrentDebt()).value, 0n);

  trace('4. Make another LOAN1 loan');
  vaultSeat = await E(services.zoe).offer(
    await E(lender).makeVaultInvitation(),
    harden({
      give: { Collateral: aeth.make(AMPLE) },
      want: { RUN: run.make(LOAN1) },
    }),
    harden({
      Collateral: t.context.aeth.mint.mintPayment(aeth.make(AMPLE)),
    }),
  );
  ({ vault } = await E(vaultSeat).getOfferResult());
  await m.assertChange({
    numVaults: 1,
    totalCollateral: { value: AMPLE },
    totalDebt: { value: DEBT1 },
  });
  m.addDebt(DEBT1);
  t.is((await E(vault).getCurrentDebt()).value, DEBT1);

  trace('5. Make a LOAN2 loan');
  vaultSeat = await E(services.zoe).offer(
    await E(lender).makeVaultInvitation(),
    harden({
      give: { Collateral: aeth.make(ENOUGH) },
      want: { RUN: run.make(LOAN2) },
    }),
    harden({
      Collateral: t.context.aeth.mint.mintPayment(aeth.make(ENOUGH)),
    }),
  );
  ({ vault } = await E(vaultSeat).getOfferResult());
  await m.assertChange({
    numVaults: 2,
    totalCollateral: { value: AMPLE + ENOUGH },
    totalDebt: { value: DEBT1 + DEBT2 },
  });
  m.addDebt(DEBT2);

  trace('6. Liquidate all (2 loans)');
  await E(aethVaultManager).liquidateAll();
  totalProceedsReceived += 54n;
  totalOverageReceived += 54n - DEBT2;
  await m.assertChange({
    numLiquidationsCompleted: 2,
    numVaults: 1,
    totalCollateral: { value: AMPLE },
    totalDebt: { value: DEBT1 },
    totalOverageReceived: { value: totalOverageReceived },
    totalProceedsReceived: { value: totalProceedsReceived },
  });
  totalProceedsReceived += 473n;
  await m.assertChange({
    numLiquidationsCompleted: 3,
    numVaults: 0,
    totalCollateral: { value: 0n },
    totalDebt: { value: 0n },
    totalProceedsReceived: { value: totalProceedsReceived },
  });
  m.assertFullyLiquidated();

  trace('7. Make another LOAN2 loan');
  vaultSeat = await E(services.zoe).offer(
    await E(lender).makeVaultInvitation(),
    harden({
      give: { Collateral: aeth.make(ENOUGH) },
      want: { RUN: run.make(LOAN2) },
    }),
    harden({
      Collateral: t.context.aeth.mint.mintPayment(aeth.make(ENOUGH)),
    }),
  );
  ({ vault } = await E(vaultSeat).getOfferResult());
  await m.assertChange({
    numVaults: 1,
    totalCollateral: { value: aeth.make(ENOUGH).value },
    totalDebt: { value: DEBT2 },
  });
  m.addDebt(DEBT2);

  trace('8. Liquidate all');
  await E(aethVaultManager).liquidateAll();
  totalProceedsReceived += 53n;
  await m.assertChange({
    numLiquidationsCompleted: 4,
    numVaults: 0,
    totalCollateral: { value: 0n },
    totalDebt: { value: 0n },
    totalProceedsReceived: { value: totalProceedsReceived },
  });

  trace('9. Loan interest');
  vaultSeat = await E(services.zoe).offer(
    await E(lender).makeVaultInvitation(),
    harden({
      give: { Collateral: aeth.make(AMPLE) },
      want: { RUN: run.make(LOAN1) },
    }),
    harden({
      Collateral: t.context.aeth.mint.mintPayment(aeth.make(AMPLE)),
    }),
  );
  ({ vault } = await E(vaultSeat).getOfferResult());
  await m.assertChange({
    numVaults: 1,
    totalCollateral: { value: AMPLE },
    totalDebt: { value: DEBT1 },
  });
  m.addDebt(DEBT1);
  await manualTimer.tickN(5);
  const interestAccrued = (await E(vault).getCurrentDebt()).value - DEBT1;
  m.addDebt(interestAccrued);
  t.is(interestAccrued, 10n);

  trace('make another loan to trigger a publish');
  vaultSeat = await E(services.zoe).offer(
    await E(lender).makeVaultInvitation(),
    harden({
      give: { Collateral: aeth.make(ENOUGH) },
      want: { RUN: run.make(LOAN2) },
    }),
    harden({
      Collateral: t.context.aeth.mint.mintPayment(aeth.make(ENOUGH)),
    }),
  );
  ({ vault } = await E(vaultSeat).getOfferResult());
  await m.assertChange({
    numVaults: 2,
    totalCollateral: { value: AMPLE + ENOUGH },
    totalDebt: { value: DEBT1 + interestAccrued + DEBT2 },
  });
  m.addDebt(DEBT2);

  trace('10. Liquidate all including interest');

  // liquidateAll executes in parallel, allowing the two burns to complete before the proceed calculations begin
  await E(aethVaultManager).liquidateAll();
  let nextProceeds = 53n;
  totalProceedsReceived += nextProceeds;
  await m.assertChange({
    numLiquidationsCompleted: 5,
    numVaults: 1,
    totalCollateral: { value: AMPLE },
    totalDebt: { value: DEBT1 + DEBT2 + interestAccrued - nextProceeds },
    totalProceedsReceived: { value: totalProceedsReceived },
  });
  nextProceeds = 296n;
  totalProceedsReceived += nextProceeds;
  await m.assertChange({
    numLiquidationsCompleted: 6,
    numVaults: 0,
    totalCollateral: { value: 0n },
    totalDebt: { value: 0n },
    totalProceedsReceived: { value: totalProceedsReceived },
    totalShortfallReceived: {
      value: DEBT1 + interestAccrued - nextProceeds, // compensate for previous proceeds and rounding
    },
  });
  m.assertFullyLiquidated();

  trace('11. Create a loan with ample collateral');
  /** @type {UserSeat<VaultKit>} */
  vaultSeat = await E(services.zoe).offer(
    await E(lender).makeVaultInvitation(),
    harden({
      give: { Collateral: aeth.make(AMPLE) },
      want: { RUN: run.make(LOAN1) },
    }),
    harden({
      Collateral: t.context.aeth.mint.mintPayment(aeth.make(AMPLE)),
    }),
  );
  ({ vault } = await E(vaultSeat).getOfferResult());
  m.addDebt(DEBT1);
  await m.assertChange({
    numVaults: 1,
    totalCollateral: { value: AMPLE },
    totalDebt: { value: DEBT1 },
  });

  trace('12. Borrow more');
  const WANT_EXTRA = 400n;
  const DEBT1_EXTRA = DEBT1 + WANT_EXTRA + 20n; // 5% fee on extra
  // can't use 0n because of https://github.com/Agoric/agoric-sdk/issues/5548
  // but since this test is of metrics, we take the opportunity to check totalCollateral changing
  const given = aeth.make(2n);
  vaultSeat = await E(services.zoe).offer(
    await E(vault).makeAdjustBalancesInvitation(),
    harden({
      // nominal collateral
      give: { Collateral: given },
      want: { RUN: run.make(WANT_EXTRA) },
    }),
    harden({
      Collateral: t.context.aeth.mint.mintPayment(given),
    }),
  );
  await E(vaultSeat).getOfferResult();
  await m.assertChange({
    totalDebt: { value: DEBT1_EXTRA },
    totalCollateral: { value: AMPLE + given.value },
  });

  trace('13. Close loan');
  vaultSeat = await E(services.zoe).offer(
    await E(vault).makeCloseInvitation(),
    harden({
      give: { RUN: run.make(DEBT1_EXTRA) },
      want: {},
    }),
    harden({
      RUN: await getRunFromFaucet(t, DEBT1_EXTRA),
    }),
  );
  await E(vaultSeat).getOfferResult();
  await m.assertChange({
    numVaults: 0,
    totalCollateral: { value: 0n },
    totalDebt: { value: 0n },
  });
});

test('governance publisher', async t => {
  const { aeth } = t.context;
  t.context.loanTiming = {
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
  const { factoryPublic } = services.vaultFactory;
  const directorGovNotifier = makeNotifierFromAsyncIterable(
    E(factoryPublic).getElectorateSubscription(),
  );
  let {
    value: { current },
  } = await directorGovNotifier.getUpdateSince();
  // can't deepEqual because of non-literal objects
  t.is(current.Electorate.type, 'invitation');
  t.is(current.LiquidationInstall.type, 'installation');
  t.is(current.LiquidationTerms.type, 'unknown');
  t.is(current.MinInitialDebt.type, 'amount');
  t.is(current.ShortfallInvitation.type, 'invitation');

  const managerGovNotifier = makeNotifierFromAsyncIterable(
    E(factoryPublic).getSubscription({
      collateralBrand: aeth.brand,
    }),
  );
  ({
    value: { current },
  } = await managerGovNotifier.getUpdateSince());
  // can't deepEqual because of non-literal objects
  t.is(current.DebtLimit.type, 'amount');
  t.is(current.InterestRate.type, 'ratio');
  t.is(current.LiquidationMargin.type, 'ratio');
  t.is(current.LiquidationPenalty.type, 'ratio');
  t.is(current.LoanFee.type, 'ratio');
});
