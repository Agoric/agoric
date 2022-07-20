// @ts-check

import '@agoric/zoe/exported.js';
import { test as unknownTest } from '@agoric/zoe/tools/prepare-test-env-ava.js';

import { AmountMath, AssetKind, makeIssuerKit } from '@agoric/ertp';
import { makeNotifierFromSubscriber } from '@agoric/notifier';
import {
  ceilMultiplyBy,
  makeRatioFromAmounts,
} from '@agoric/zoe/src/contractSupport/index.js';
import { eventLoopIteration } from '@agoric/zoe/tools/eventLoopIteration.js';
import { makeManualPriceAuthority } from '@agoric/zoe/tools/manualPriceAuthority.js';
import buildManualTimer from '@agoric/zoe/tools/manualTimer.js';
import { E } from '@endo/eventual-send';
import { deeplyFulfilled } from '@endo/marshal';
import * as Collect from '../../src/collect.js';
import { makeTracer } from '../../src/makeTracer.js';
import {
  setupAmm,
  setupReserve,
  startEconomicCommittee,
  startVaultFactory,
} from '../../src/proposals/econ-behaviors.js';
import '../../src/vaultFactory/types.js';
import { unsafeMakeBundleCache } from '../bundleTool.js';
import {
  installGovernance,
  makeVoterTool,
  setupBootstrap,
  setUpZoeForTest,
  withAmountUtils,
} from '../supports.js';

/** @typedef {Record<string, any> & {
 *   aeth: IssuerKit & import('../supports.js').AmountUtils,
 *   reserveCreatorFacet: AssetReserveCreatorFacet,
 *   run: IssuerKit & import('../supports.js').AmountUtils,
 * }} Context */
/** @type {import('ava').TestInterface<Context>} */
// @ts-expect-error cast
const test = unknownTest;

// #region Support

// TODO path resolve these so refactors detect
const contractRoots = {
  faucet: './test/vaultFactory/faucet.js',
  liquidate: './src/vaultFactory/liquidateIncrementally.js',
  VaultFactory: './src/vaultFactory/vaultFactory.js',
  amm: './src/vpool-xyk-amm/multipoolMarketMaker.js',
  reserve: './src/reserve/assetReserve.js',
};

/** @typedef {import('../../src/vaultFactory/vaultFactory').VaultFactoryContract} VFC */

const trace = makeTracer('TestLiq');

const BASIS_POINTS = 10000n;

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
 * @param {import('../supports.js').AmountUtils} debt
 */
const defaultParamValues = debt =>
  harden({
    debtLimit: debt.make(1_000_000n),
    // margin required to maintain a loan
    liquidationMargin: debt.makeRatio(105n),
    // penalty upon liquidation as proportion of debt
    liquidationPenalty: debt.makeRatio(10n),
    // periodic interest rate (per charging period)
    interestRate: debt.makeRatio(100n, BASIS_POINTS),
    // charge to create or increase loan balance
    loanFee: debt.makeRatio(500n, BASIS_POINTS),
  });

test.before(async t => {
  const { zoe, feeMintAccess } = setUpZoeForTest();
  const runIssuer = await E(zoe).getFeeIssuer();
  const runBrand = await E(runIssuer).getBrand();
  const run = withAmountUtils({ issuer: runIssuer, brand: runBrand });
  const aeth = withAmountUtils(makeIssuerKit('aEth'));
  const bundleCache = await unsafeMakeBundleCache('./bundles/'); // package-relative

  // note that the liquidation might be a different bundle name
  // Collect.mapValues(contractRoots, (root, k) => loader.load(root, k)),
  const bundles = await Collect.allValues({
    faucet: bundleCache.load(contractRoots.faucet, 'faucet'),
    liquidate: bundleCache.load(
      contractRoots.liquidate,
      'liquidateIncrementally',
    ),
    VaultFactory: bundleCache.load(contractRoots.VaultFactory, 'VaultFactory'),
    amm: bundleCache.load(contractRoots.amm, 'amm'),
    reserve: bundleCache.load(contractRoots.reserve, 'reserve'),
  });
  const installation = Collect.mapValues(bundles, bundle =>
    E(zoe).install(bundle),
  );
  const contextPs = {
    bundles,
    installation,
    zoe,
    feeMintAccess,
    loanTiming: {
      chargingPeriod: 2n,
      recordingPeriod: 6n,
    },
    minInitialDebt: 50n,
    rates: defaultParamValues(run),
    runInitialLiquidity: run.make(1_500_000_000n),
    aethInitialLiquidity: AmountMath.make(aeth.brand, 900_000_000n),
  };
  const frozenCtx = await deeplyFulfilled(harden(contextPs));
  t.context = { ...frozenCtx, bundleCache, run, aeth };
  trace(t, 'CONTEXT');
});

/**
 * @param {import('ava').ExecutionContext<Context>} t
 * @param {any} aethLiquidity
 * @param {any} runLiquidity
 */
const setupAmmAndElectorate = async (t, aethLiquidity, runLiquidity) => {
  const {
    zoe,
    aeth,
    electorateTerms = { committeeName: 'The Cabal', committeeSize: 1 },
    timer,
  } = t.context;

  const space = setupBootstrap(t, timer);
  const { consume, instance } = space;
  installGovernance(zoe, space.installation.produce);
  // TODO consider using produceInstallations()
  space.installation.produce.amm.resolve(t.context.installation.amm);
  space.installation.produce.reserve.resolve(t.context.installation.reserve);
  await startEconomicCommittee(space, {
    options: { econCommitteeOptions: electorateTerms },
  });
  await setupAmm(space, {
    options: { minInitialPoolLiquidity: 1000n },
  });
  await setupReserve(space);

  const governorCreatorFacet = consume.ammGovernorCreatorFacet;
  const governorInstance = await instance.consume.ammGovernor;
  const governorPublicFacet = await E(zoe).getPublicFacet(governorInstance);
  const governedInstance = E(governorPublicFacet).getGovernedContract();

  const counter = await space.installation.consume.binaryVoteCounter;
  t.context.committee = makeVoterTool(
    zoe,
    space.consume.economicCommitteeCreatorFacet,
    space.consume.vaultFactoryGovernorCreator,
    counter,
  );

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
 * @param {import('ava').ExecutionContext<Context>} t
 * @param {bigint} runInitialLiquidity
 */
const getRunFromFaucet = async (t, runInitialLiquidity) => {
  const {
    installation: { faucet: installation },
    zoe,
    feeMintAccess,
  } = t.context;
  /** @type {Promise<Installation<import('./faucet.js').start>>} */
  // @ts-expect-error cast
  // On-chain, there will be pre-existing RUN. The faucet replicates that
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
      want: { RUN: runInitialLiquidity },
    }),
  );

  const runPayment = await E(faucetSeat).getPayout('RUN');
  return runPayment;
};

/**
 * NOTE: called separately by each test so AMM/zoe/priceAuthority don't interfere
 *
 * @param {import('ava').ExecutionContext} t
 * @param {Amount} initialPrice
 * @param {Amount} priceBase
 * @param {TimerService} timer
 */
const setupServices = async (
  t,
  initialPrice,
  priceBase,
  timer = buildManualTimer(t.log),
) => {
  const {
    zoe,
    run,
    aeth,
    loanTiming,
    minInitialDebt,
    rates,
    aethInitialLiquidity,
    runInitialLiquidity,
  } = t.context;
  t.context.timer = timer;

  const runPayment = await getRunFromFaucet(t, runInitialLiquidity);
  trace(t, 'faucet', { runInitialLiquidity, runPayment });
  const runLiquidity = {
    proposal: runInitialLiquidity,
    payment: runPayment,
  };
  const aethLiquidity = {
    proposal: aethInitialLiquidity,
    payment: aeth.mint.mintPayment(aethInitialLiquidity),
  };
  const { amm: ammFacets, space } = await setupAmmAndElectorate(
    t,
    aethLiquidity,
    runLiquidity,
  );
  const { consume, produce } = space;
  trace(t, 'amm', { ammFacets });

  // Cheesy hack for easy use of manual price authority
  const priceAuthority = makeManualPriceAuthority({
    actualBrandIn: aeth.brand,
    actualBrandOut: run.brand,
    initialPrice: makeRatioFromAmounts(initialPrice, priceBase),
    timer,
    quoteIssuerKit: makeIssuerKit('quote', AssetKind.SET),
  });
  produce.priceAuthority.resolve(priceAuthority);

  const {
    installation: { produce: iProduce },
  } = space;
  t.context.reserveCreatorFacet = space.consume.reserveCreatorFacet;
  iProduce.VaultFactory.resolve(t.context.installation.VaultFactory);
  iProduce.liquidate.resolve(t.context.installation.liquidate);
  await startVaultFactory(space, { loanParams: loanTiming }, minInitialDebt);

  const governorCreatorFacet = consume.vaultFactoryGovernorCreator;
  /** @type {Promise<VaultFactory & LimitedCreatorFacet<any>>} */
  const vaultFactoryCreatorFacet = /** @type { any } */ (
    E(governorCreatorFacet).getCreatorFacet()
  );

  // Add a vault that will lend on aeth collateral
  const aethVaultManagerP = E(vaultFactoryCreatorFacet).addVaultType(
    aeth.issuer,
    'AEth',
    rates,
  );

  /** @type {[any, VaultFactory, VFC['publicFacet'], VaultManager]} */
  // @ts-expect-error cast
  const [governorInstance, vaultFactory, lender, aethVaultManager] =
    await Promise.all([
      E(consume.agoricNames).lookup('instance', 'VaultFactoryGovernor'),
      vaultFactoryCreatorFacet,
      E(governorCreatorFacet).getPublicFacet(),
      aethVaultManagerP,
    ]);
  trace(t, 'pa', { governorInstance, vaultFactory, lender, priceAuthority });

  return {
    zoe,
    // installs,
    governor: {
      governorInstance,
      governorPublicFacet: E(zoe).getPublicFacet(governorInstance),
      governorCreatorFacet,
    },
    vaultFactory: {
      vaultFactory,
      lender,
      aethVaultManager,
    },
    ammFacets,
    priceAuthority,
  };
};
// #endregion

// #region driver
const AT_NEXT = {};

/**
 * @param {import('ava').ExecutionContext<Context>} t
 * @param {Amount<'nat'>} initialPrice
 * @param {Amount<'nat'>} priceBase
 */
const makeDriver = async (t, initialPrice, priceBase) => {
  const timer = buildManualTimer(t.log);
  const services = await setupServices(t, initialPrice, priceBase, timer);

  const { zoe, aeth, run } = t.context;
  const {
    vaultFactory: { lender, vaultFactory },
    priceAuthority,
  } = services;
  const managerNotifier = await makeNotifierFromSubscriber(
    E(E(lender).getCollateralManager(aeth.brand)).getSubscriber(),
  );
  let managerNotification = await E(managerNotifier).getUpdateSince();

  /** @type {UserSeat} */
  let currentSeat;
  let notification = {};
  let currentOfferResult;
  /**
   * @param {Amount} collateral
   * @param {Amount} debt
   */
  const makeVaultDriver = async (collateral, debt) => {
    const collateralManager = E(lender).getCollateralManager(collateral.brand);
    /** @type {UserSeat<VaultKit>} */
    const vaultSeat = await E(zoe).offer(
      await E(collateralManager).makeVaultInvitation(),
      harden({
        give: { Collateral: collateral },
        want: { RUN: debt },
      }),
      harden({
        Collateral: aeth.mint.mintPayment(collateral),
      }),
    );
    const {
      vault,
      publicNotifiers: { vault: notifier },
    } = await E(vaultSeat).getOfferResult();
    t.true(await E(vaultSeat).hasExited());
    return {
      vault: () => vault,
      vaultSeat: () => vaultSeat,
      notification: () => notification,
      close: async () => {
        currentSeat = await E(zoe).offer(E(vault).makeCloseInvitation());
        currentOfferResult = await E(currentSeat).getOfferResult();
        t.is(
          currentOfferResult,
          'your loan is closed, thank you for your business',
        );
        t.truthy(await E(vaultSeat).hasExited());
      },
      /**
       *
       * @param {import('../../src/vaultFactory/vault.js').VaultPhase} phase
       * @param {object} [likeExpected]
       * @param {AT_NEXT|number} [optSince] AT_NEXT is an alias for updateCount of the last update, forcing to wait for another
       */
      notified: async (phase, likeExpected, optSince) => {
        notification = await E(notifier).getUpdateSince(
          optSince === AT_NEXT ? notification.updateCount : optSince,
        );
        t.is(notification.value.vaultState, phase);
        if (likeExpected) {
          t.like(notification.value, likeExpected);
        }
        return notification;
      },
      checkBorrowed: async (loanAmount, loanFee) => {
        const debtAmount = await E(vault).getCurrentDebt();
        const fee = ceilMultiplyBy(loanAmount, loanFee);
        t.deepEqual(
          debtAmount,
          AmountMath.add(loanAmount, fee),
          'borrower RUN amount does not match',
        );
        return debtAmount;
      },
      checkBalance: async (expectedDebt, expectedAEth) => {
        t.deepEqual(await E(vault).getCurrentDebt(), expectedDebt);
        t.deepEqual(await E(vault).getCollateralAmount(), expectedAEth);
      },
    };
  };

  const driver = {
    managerNotification: () => managerNotification,
    currentSeat: () => currentSeat,
    lastOfferResult: () => currentOfferResult,
    timer: () => timer,
    tick: async (ticks = 1) => {
      await timer.tickN(ticks, 'TestLiq driver');
    },
    makeVaultDriver,
    checkPayouts: async (expectedRUN, expectedAEth) => {
      const payouts = await E(currentSeat).getPayouts();
      const collProceeds = await aeth.issuer.getAmountOf(payouts.Collateral);
      const runProceeds = await E(run.issuer).getAmountOf(payouts.RUN);
      t.deepEqual(runProceeds, expectedRUN);
      t.deepEqual(collProceeds, expectedAEth);
    },
    checkRewards: async expectedRUN => {
      t.deepEqual(await E(vaultFactory).getRewardAllocation(), {
        RUN: expectedRUN,
      });
    },
    sellOnAMM: async (give, want, optStopAfter, expected) => {
      const swapInvitation = E(
        services.ammFacets.ammPublicFacet,
      ).makeSwapInvitation();
      trace(t, 'AMM sell', { give, want, optStopAfter });
      const offerArgs = optStopAfter
        ? harden({ stopAfter: optStopAfter })
        : undefined;
      currentSeat = await E(zoe).offer(
        await swapInvitation,
        harden({ give: { In: give }, want: { Out: want } }),
        harden({ In: aeth.mint.mintPayment(give) }),
        offerArgs,
      );
      currentOfferResult = await E(currentSeat).getOfferResult();
      if (expected) {
        const payouts = await E(currentSeat).getCurrentAllocation();
        trace(t, 'AMM payouts', payouts);
        t.like(payouts, expected);
      }
    },
    setPrice: p => priceAuthority.setPrice(makeRatioFromAmounts(p, priceBase)),
    // setLiquidationTerms('MaxImpactBP', 80n)
    setLiquidationTerms: async (name, newValue) => {
      const deadline = 3n;
      const { cast, outcome } = await E(t.context.committee).changeParam(
        harden({
          paramPath: { key: 'governedParams' },
          changes: { [name]: newValue },
        }),
        deadline,
      );
      await cast;
      await driver.tick(3);
      await outcome;
    },
    /**
     *
     * @param {object} [likeExpected]
     * @param {AT_NEXT|number} [optSince] AT_NEXT is an alias for updateCount of the last update, forcing to wait for another
     */
    managerNotified: async (likeExpected, optSince) => {
      managerNotification = await E(managerNotifier).getUpdateSince(
        optSince === AT_NEXT ? managerNotification.updateCount : optSince,
      );
      trace(t, 'manager notifier', managerNotification);
      if (likeExpected) {
        t.like(managerNotification.value, likeExpected);
      }
      return managerNotification;
    },
    checkReserveAllocation: async (liquidityValue, stableValue) => {
      const { reserveCreatorFacet } = t.context;
      const reserveAllocations = await E(reserveCreatorFacet).getAllocations();

      const liquidityIssuer = await E(
        services.ammFacets.ammPublicFacet,
      ).getLiquidityIssuer(aeth.brand);
      const liquidityBrand = await E(liquidityIssuer).getBrand();

      t.deepEqual(reserveAllocations, {
        RaEthLiquidity: AmountMath.make(liquidityBrand, liquidityValue),
        RUN: run.make(stableValue),
      });
    },
  };
  return driver;
};
// #endregion

test('price drop', async t => {
  const { aeth, run, rates } = t.context;

  // When the price falls to 636, the loan will get liquidated. 636 for 900
  // Aeth is 1.4 each. The loan is 270 RUN. The margin is 1.05, so at 636, 400
  // Aeth collateral could support a loan of 268.
  t.context.loanTiming = {
    chargingPeriod: 2n,
    recordingPeriod: 10n,
  };

  const d = await makeDriver(t, run.make(1000n), aeth.make(900n));
  // Create a loan for 270 RUN with 400 aeth collateral
  const collateralAmount = aeth.make(400n);
  const loanAmount = run.make(270n);
  const dv = await d.makeVaultDriver(collateralAmount, loanAmount);
  trace(t, 'loan made', loanAmount, dv);
  const debtAmount = await dv.checkBorrowed(loanAmount, rates.loanFee);

  await dv.notified(Phase.ACTIVE, {
    debtSnapshot: {
      debt: debtAmount,
      interest: run.makeRatio(100n),
    },
  });
  await dv.checkBalance(debtAmount, collateralAmount);

  // small change doesn't cause liquidation
  await d.setPrice(run.make(677n));
  trace(t, 'price dropped a little');
  await d.tick();
  await dv.notified(Phase.ACTIVE);

  await d.setPrice(run.make(636n));
  trace(t, 'price dropped enough to liquidate');
  await dv.notified(Phase.LIQUIDATING, undefined, AT_NEXT);

  // Collateral consumed while liquidating
  // Debt remains while liquidating
  await dv.checkBalance(debtAmount, aeth.makeEmpty());
  const collateralExpected = aeth.make(210n);
  const debtExpected = run.makeEmpty();
  await dv.notified(Phase.LIQUIDATED, { locked: collateralExpected }, AT_NEXT);
  await dv.checkBalance(debtExpected, collateralExpected);

  await d.checkRewards(run.make(14n));

  await dv.close();
  await dv.notified(Phase.CLOSED, {
    locked: aeth.makeEmpty(),
    updateCount: undefined,
  });
  await d.checkPayouts(debtExpected, collateralExpected);
  await dv.checkBalance(debtExpected, aeth.makeEmpty());
});

test('price falls precipitously', async t => {
  const { aeth, run, rates } = t.context;
  t.context.loanTiming = {
    chargingPeriod: 2n,
    recordingPeriod: 10n,
  };

  const d = await makeDriver(t, run.make(2200n), aeth.make(900n));
  // Create a loan for 370 RUN with 400 aeth collateral
  const collateralAmount = aeth.make(400n);
  const loanAmount = run.make(370n);
  const dv = await d.makeVaultDriver(collateralAmount, loanAmount);
  trace(t, 'loan made', loanAmount, dv);
  const debtAmount = await dv.checkBorrowed(loanAmount, rates.loanFee);

  await dv.notified(Phase.ACTIVE, {
    debtSnapshot: {
      debt: debtAmount,
      interest: run.makeRatio(100n),
    },
  });
  await dv.checkBalance(debtAmount, collateralAmount);

  // Sell some aEth to drive the value down
  await d.sellOnAMM(aeth.make(200n), run.makeEmpty());

  // [2200n, 19180n, 1650n, 150n],
  await d.setPrice(run.make(19180n));
  await dv.checkBalance(debtAmount, collateralAmount);
  await d.tick();
  await dv.notified(Phase.ACTIVE);

  await d.setPrice(run.make(1650n));
  await d.tick();
  await dv.checkBalance(debtAmount, collateralAmount);
  await dv.notified(Phase.ACTIVE);

  // Drop price a lot
  await d.setPrice(run.make(150n));
  await dv.notified(Phase.LIQUIDATING, undefined, AT_NEXT);
  await dv.checkBalance(debtAmount, aeth.makeEmpty());
  // was run.make(103n)

  // Collateral consumed while liquidating
  // Debt remains while liquidating
  await dv.checkBalance(debtAmount, aeth.makeEmpty());
  const collateralExpected = aeth.make(141n);
  const debtExpected = run.makeEmpty();
  await dv.notified(Phase.LIQUIDATED, { locked: collateralExpected }, AT_NEXT);
  await dv.checkBalance(debtExpected, collateralExpected);

  await d.checkRewards(run.make(19n));

  await dv.close();
  await dv.notified(Phase.CLOSED, {
    locked: aeth.makeEmpty(),
    updateCount: undefined,
  });
  await d.checkPayouts(debtExpected, collateralExpected);
  await dv.checkBalance(debtExpected, aeth.makeEmpty());
});

test('update liquidator', async t => {
  const { aeth, run: debt } = t.context;
  t.context.runInitialLiquidity = debt.make(500_000_000n);
  t.context.aethInitialLiquidity = aeth.make(100_000_000n);

  const d = await makeDriver(t, debt.make(500n), aeth.make(100n));
  const loanAmount = debt.make(300n);
  const collateralAmount = aeth.make(100n);
  /* * @type {UserSeat<VaultKit>} */
  const dv = await d.makeVaultDriver(collateralAmount, loanAmount);
  const debtAmount = await E(dv.vault()).getCurrentDebt();
  await dv.checkBalance(debtAmount, collateralAmount);

  let govNotify = await d.managerNotified();
  const oldLiquidator = govNotify.value.liquidatorInstance;
  trace(t, 'gov start', oldLiquidator, govNotify);
  await d.setLiquidationTerms(
    'LiquidationTerms',
    harden({
      MaxImpactBP: 80n,
      OracleTolerance: debt.makeRatio(30n),
      AMMMaxSlippage: debt.makeRatio(30n),
    }),
  );
  await eventLoopIteration();
  govNotify = await d.managerNotified();
  const newLiquidator = govNotify.value.liquidatorInstance;
  t.not(oldLiquidator, newLiquidator);

  // trigger liquidation
  await d.setPrice(debt.make(300n));
  await eventLoopIteration();
  await dv.notified(Phase.LIQUIDATED);
});

test('liquidate many', async t => {
  const { aeth, run, rates } = t.context;
  // When the price falls to 636, the loan will get liquidated. 636 for 900
  // Aeth is 1.4 each. The loan is 270 RUN. The margin is 1.05, so at 636, 400
  // Aeth collateral could support a loan of 268.

  const overThreshold = async v => {
    const debt = await E(v.vault()).getCurrentDebt();
    return ceilMultiplyBy(
      ceilMultiplyBy(debt, rates.liquidationMargin),
      run.makeRatio(300n),
    );
  };
  const d = await makeDriver(t, run.make(1500n), aeth.make(900n));
  const collateral = aeth.make(300n);
  const dv0 = await d.makeVaultDriver(collateral, run.make(390n));
  const dv1 = await d.makeVaultDriver(collateral, run.make(380n));
  const dv2 = await d.makeVaultDriver(collateral, run.make(370n));
  const dv3 = await d.makeVaultDriver(collateral, run.make(360n));
  const dv4 = await d.makeVaultDriver(collateral, run.make(350n));
  const dv5 = await d.makeVaultDriver(collateral, run.make(340n));
  const dv6 = await d.makeVaultDriver(collateral, run.make(330n));
  const dv7 = await d.makeVaultDriver(collateral, run.make(320n));
  const dv8 = await d.makeVaultDriver(collateral, run.make(310n));
  const dv9 = await d.makeVaultDriver(collateral, run.make(300n));

  await d.setPrice(await overThreshold(dv1));
  await eventLoopIteration();
  await dv0.notified(Phase.LIQUIDATED);
  await dv1.notified(Phase.ACTIVE);
  await dv2.notified(Phase.ACTIVE);
  await dv3.notified(Phase.ACTIVE);
  await dv4.notified(Phase.ACTIVE);
  await dv5.notified(Phase.ACTIVE);
  await dv6.notified(Phase.ACTIVE);
  await dv7.notified(Phase.ACTIVE);
  await dv8.notified(Phase.ACTIVE);
  await dv9.notified(Phase.ACTIVE);

  await d.setPrice(await overThreshold(dv5));
  await eventLoopIteration();
  await dv1.notified(Phase.LIQUIDATED);
  await dv2.notified(Phase.LIQUIDATED);
  await dv3.notified(Phase.LIQUIDATED);
  await dv4.notified(Phase.LIQUIDATED);
  await dv5.notified(Phase.ACTIVE);
  await dv6.notified(Phase.ACTIVE);
  await dv7.notified(Phase.ACTIVE);
  await dv8.notified(Phase.ACTIVE);
  await dv9.notified(Phase.ACTIVE);

  await d.setPrice(run.make(300n));
  await eventLoopIteration();
  await dv5.notified(Phase.LIQUIDATED);
  await dv6.notified(Phase.LIQUIDATED);
  await dv7.notified(Phase.LIQUIDATED);
  await dv8.notified(Phase.LIQUIDATED);
  await dv9.notified(Phase.LIQUIDATED);
});

// 1) `give` sells for more than `stopAfter`, and got some of the input back
test('amm stopAfter - input back', async t => {
  const { aeth, run } = t.context;
  const d = await makeDriver(t, run.make(2_199n), aeth.make(999n));
  const give = aeth.make(100n);
  const want = run.make(80n);
  const stopAfter = run.make(100n);
  const expectedAeth = aeth.make(38n);
  const expectedRUN = stopAfter;
  await d.sellOnAMM(give, want, stopAfter, {
    In: expectedAeth,
    Out: expectedRUN,
  });
});

// 2) `give` wouldn't have sold for `stopAfter`, so sell it all
test('amm stopAfter - shortfall', async t => {
  const { aeth, run } = t.context;
  // uses off-by-one amounts to force rounding errors
  const d = await makeDriver(t, run.make(2_199n), aeth.make(999n));
  const give = aeth.make(100n);
  const want = run.make(80n);
  // 164 is the most I could get
  const stopAfter = run.make(180n);
  const expectedAeth = aeth.makeEmpty();
  const expectedRUN = run.make(164n);
  await d.sellOnAMM(give, want, stopAfter, {
    In: expectedAeth,
    Out: expectedRUN,
  });
});

// 3) wouldn't have sold for enough, so sold everything,
//    and that still wasn't enough for `want.Out`
test('amm stopAfter - want too much', async t => {
  const { aeth, run } = t.context;
  // uses off-by-one amounts to force rounding errors
  const d = await makeDriver(t, run.make(2_199n), aeth.make(999n));
  const give = aeth.make(100n);
  const want = run.make(170n);
  const stopAfter = run.make(180n);
  const expectedAeth = give;
  const expectedRUN = run.makeEmpty();
  await d.sellOnAMM(give, want, stopAfter, {
    In: expectedAeth,
    Out: expectedRUN,
  });
});

test('penalties to reserve', async t => {
  const { aeth, run } = t.context;

  const d = await makeDriver(t, run.make(1000n), aeth.make(900n));
  // Create a loan for 270 RUN with 400 aeth collateral
  const collateralAmount = aeth.make(400n);
  const loanAmount = run.make(270n);
  await d.makeVaultDriver(collateralAmount, loanAmount);

  // liquidate
  d.setPrice(run.make(636n));
  await eventLoopIteration();

  await d.checkReserveAllocation(1000n, 29n);
});
