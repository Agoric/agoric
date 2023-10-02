import '@agoric/zoe/exported.js';

import { AmountMath, AssetKind, makeIssuerKit } from '@agoric/ertp';
import { allValues, makeTracer, objectMap } from '@agoric/internal';
import { makeNotifierFromSubscriber } from '@agoric/notifier';
import { unsafeMakeBundleCache } from '@agoric/swingset-vat/tools/bundleTool.js';
import {
  ceilMultiplyBy,
  makeRatioFromAmounts,
} from '@agoric/zoe/src/contractSupport/index.js';
import { makeManualPriceAuthority } from '@agoric/zoe/tools/manualPriceAuthority.js';
import buildManualTimer from '@agoric/zoe/tools/manualTimer.js';
import { E } from '@endo/eventual-send';
import { deeplyFulfilled } from '@endo/marshal';

import { NonNullish } from '@agoric/assert';
import { eventLoopIteration } from '@agoric/notifier/tools/testSupports.js';
import {
  setupReserve,
  startAuctioneer,
  startVaultFactory,
} from '../../src/proposals/econ-behaviors.js';
import { startEconomicCommittee } from '../../src/proposals/startEconCommittee.js';
import '../../src/vaultFactory/types-ambient.js';
import {
  installPuppetGovernance,
  setupBootstrap,
  setUpZoeForTest,
  withAmountUtils,
} from '../supports.js';

/** @typedef {import('../../src/vaultFactory/vaultFactory').VaultFactoryContract} VFC */

const trace = makeTracer('VFDriver');

export const AT_NEXT = Symbol('AT_NEXT');

export const BASIS_POINTS = 10000n;

// Define locally to test that vaultFactory uses these values
export const Phase = /** @type {const} */ ({
  ACTIVE: 'active',
  LIQUIDATING: 'liquidating',
  CLOSED: 'closed',
  LIQUIDATED: 'liquidated',
  TRANSFER: 'transfer',
});

const contractRoots = {
  faucet: './test/vaultFactory/faucet.js',
  VaultFactory: './src/vaultFactory/vaultFactory.js',
  auctioneer: './src/auction/auctioneer.js',
  reserve: './src/reserve/assetReserve.js',
};

/**
 * dL: 1M, lM: 105%, lP: 10%, iR: 100, lF: 500, lP: 0%
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
    mintFee: debt.makeRatio(500n, BASIS_POINTS),
    // NB: liquidationPadding defaults to zero in contract
  });

/**
 * @typedef {{
 *   aeth: IssuerKit & import('../supports.js').AmountUtils;
 *   aethInitialLiquidity: Amount<'nat'>;
 *   consume: import('../../src/proposals/econ-behaviors.js').EconomyBootstrapPowers['consume'];
 *   puppetGovernors: {
 *     [contractName: string]:
 *       | undefined
 *       | ERef<
 *           import('@agoric/governance/tools/puppetContractGovernor.js').PuppetContractGovernorKit<any>['creatorFacet']
 *         >;
 *   };
 *   electorateTerms: any;
 *   feeMintAccess: FeeMintAccess;
 *   installation: Record<string, any>;
 *   interestTiming: any;
 *   minInitialDebt: bigint;
 *   reserveCreatorFacet: ERef<AssetReserveCreatorFacet>;
 *   rates: any;
 *   run: IssuerKit & import('../supports.js').AmountUtils;
 *   stableInitialLiquidity: Amount<'nat'>;
 *   timer: ReturnType<typeof buildManualTimer>;
 *   zoe: ZoeService;
 * }} DriverContext
 */

/**
 * @param {object} opts
 * @param {InterestTiming} [opts.interestTiming]
 * @returns {Promise<DriverContext>}
 */
export const makeDriverContext = async ({
  interestTiming = {
    chargingPeriod: 2n,
    recordingPeriod: 6n,
  },
} = {}) => {
  const { zoe, feeMintAccessP } = await setUpZoeForTest();
  const stableIssuer = await E(zoe).getFeeIssuer();
  const stableBrand = await E(stableIssuer).getBrand();
  // @ts-expect-error missing mint
  const run = withAmountUtils({ issuer: stableIssuer, brand: stableBrand });
  const aeth = withAmountUtils(makeIssuerKit('aEth'));
  const bundleCache = await unsafeMakeBundleCache('./bundles/'); // package-relative

  // note that the liquidation might be a different bundle name
  // objectMap(contractRoots, (root, k) => loader.load(root, k)),
  const bundles = await allValues({
    faucet: bundleCache.load(contractRoots.faucet, 'faucet'),
    VaultFactory: bundleCache.load(contractRoots.VaultFactory, 'VaultFactory'),
    auctioneer: bundleCache.load(contractRoots.auctioneer, 'auction'),
    reserve: bundleCache.load(contractRoots.reserve, 'reserve'),
  });
  const installation = objectMap(bundles, bundle => E(zoe).install(bundle));

  const feeMintAccess = await feeMintAccessP;
  const contextPs = {
    installation,
    zoe,
    feeMintAccess,
    interestTiming,
    minInitialDebt: 50n,
    rates: defaultParamValues(run),
    stableInitialLiquidity: run.make(1_500_000_000n),
    aethInitialLiquidity: AmountMath.make(aeth.brand, 900_000_000n),
  };
  const frozenCtx = await deeplyFulfilled(harden(contextPs));
  return { ...frozenCtx, bundleCache, run, aeth };
};

/** @param {import('ava').ExecutionContext<DriverContext>} t */
const setupReserveAndElectorate = async t => {
  const {
    zoe,
    electorateTerms = { committeeName: 'The Cabal', committeeSize: 1 },
    timer,
  } = t.context;

  const space = await setupBootstrap(t, timer);
  installPuppetGovernance(zoe, space.installation.produce);
  // TODO consider using produceInstallations()
  space.installation.produce.reserve.resolve(t.context.installation.reserve);
  await startEconomicCommittee(space, {
    options: { econCommitteeOptions: electorateTerms },
  });

  t.context.puppetGovernors = /** @type {any} */ ({
    auctioneer: E.get(space.consume.auctioneerKit).governorCreatorFacet,
    vaultFactory: E.get(space.consume.vaultFactoryKit).governorCreatorFacet,
  });
  await setupReserve(space);

  return { space };
};

/**
 * @param {import('ava').ExecutionContext<DriverContext>} t
 * @param {Amount<'nat'>} amt
 */
const getRunFromFaucet = async (t, amt) => {
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
      want: { RUN: amt },
    }),
  );

  const runPayment = await E(faucetSeat).getPayout('RUN');
  return runPayment;
};

/**
 * NOTE: called separately by each test so zoe/priceAuthority/etc. don't
 * interfere.
 *
 * @param {import('ava').ExecutionContext<DriverContext>} t
 * @param {Amount} initialPrice
 * @param {Amount} priceBase
 */
const setupServices = async (t, initialPrice, priceBase) => {
  const timer = buildManualTimer(t.log);
  const { zoe, run, aeth, interestTiming, minInitialDebt, rates } = t.context;
  t.context.timer = timer;

  const { space } = await setupReserveAndElectorate(t);
  const { consume, produce } = space;
  t.context.consume = consume;

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
  t.context.reserveCreatorFacet = E.get(space.consume.reserveKit).creatorFacet;
  iProduce.VaultFactory.resolve(t.context.installation.VaultFactory);
  iProduce.auctioneer.resolve(t.context.installation.auctioneer);

  await Promise.all([
    startVaultFactory(space, { interestTiming }, minInitialDebt),
    startAuctioneer(space),
  ]);

  const governorCreatorFacet = E.get(
    consume.vaultFactoryKit,
  ).governorCreatorFacet;
  const vaultFactoryCreatorFacet = E(governorCreatorFacet).getCreatorFacet();

  // Setup default first collateral
  const aethKeyword = 'AEth';
  const aethVaultManagerP = E(vaultFactoryCreatorFacet).addVaultType(
    aeth.issuer,
    aethKeyword,
    rates,
  );
  await E(E.get(consume.auctioneerKit).creatorFacet).addBrand(
    aeth.issuer,
    aethKeyword,
  );
  await E(E.get(consume.reserveKit).creatorFacet).addIssuer(
    aeth.issuer,
    aethKeyword,
  );

  /**
   * @type {[
   *   any,
   *   VaultFactoryCreatorFacet,
   *   VFC['publicFacet'],
   *   VaultManager,
   * ]}
   */
  const [governorInstance, vaultFactory, vfPublic, aethVaultManager] =
    await Promise.all([
      E(consume.agoricNames).lookup('instance', 'VaultFactoryGovernor'),
      vaultFactoryCreatorFacet,
      E(governorCreatorFacet).getPublicFacet(),
      aethVaultManagerP,
    ]);

  return {
    zoe,
    governor: {
      governorInstance,
      governorPublicFacet: E(zoe).getPublicFacet(governorInstance),
      governorCreatorFacet,
    },
    vaultFactory: {
      // name for backwards compatiiblity
      lender: E(vfPublic).getCollateralManager(aeth.brand),
      vaultFactory,
      vfPublic,
      aethVaultManager,
    },
    priceAuthority,
  };
};

/**
 * @param {import('ava').ExecutionContext<DriverContext>} t
 * @param {Amount<'nat'>} [initialPrice]
 * @param {Amount<'nat'>} [priceBase]
 */
export const makeManagerDriver = async (
  t,
  initialPrice = t.context.run.make(500n),
  priceBase = t.context.aeth.make(100n),
) => {
  const services = await setupServices(t, initialPrice, priceBase);

  const { zoe, aeth, run } = t.context;
  const {
    vaultFactory: { lender, vaultFactory, vfPublic },
    priceAuthority,
    timer,
  } = services;
  const publicTopics = await E(lender).getPublicTopics();
  const managerNotifier = await makeNotifierFromSubscriber(
    publicTopics.asset.subscriber,
  );
  let managerNotification = await E(managerNotifier).getUpdateSince();

  /** @type {UserSeat} */
  let currentSeat;
  let notification = {};
  let currentOfferResult;
  /**
   * @param {Amount<'nat'>} [collateral]
   * @param {Amount<'nat'>} [debt]
   */
  const makeVaultDriver = async (
    collateral = aeth.make(1000n),
    debt = run.make(50n),
  ) => {
    /** @type {UserSeat<VaultKit>} */
    const vaultSeat = await E(zoe).offer(
      await E(lender).makeVaultInvitation(),
      harden({
        give: { Collateral: collateral },
        want: { Minted: debt },
      }),
      harden({
        Collateral: aeth.mint.mintPayment(collateral),
      }),
    );
    const { vault, publicSubscribers } = await E(vaultSeat).getOfferResult();
    t.true(await E(vaultSeat).hasExited(), 'seat must have exited');
    const notifier = makeNotifierFromSubscriber(
      publicSubscribers.vault.subscriber,
    );
    return {
      getVaultSubscriber: () => publicSubscribers.vault,
      vault: () => vault,
      vaultSeat: () => vaultSeat,
      notification: () => notification,
      /**
       * @param {bigint} collValue
       * @param {import('../supports.js').AmountUtils} collUtils
       * @param {bigint} [mintedValue]
       */
      giveCollateral: async (collValue, collUtils, mintedValue = 0n) => {
        trace(t, 'giveCollateral', collValue);
        const invitation = await E(vault).makeAdjustBalancesInvitation();
        const amount = collUtils.make(collValue);
        const seat = await E(services.zoe).offer(
          invitation,
          harden({
            give: { Collateral: amount },
            want: mintedValue ? { Minted: run.make(mintedValue) } : undefined,
          }),
          harden({
            Collateral: collUtils.mint.mintPayment(amount),
          }),
        );
        return E(seat).getOfferResult();
      },
      /**
       * @param {bigint} mintedValue
       * @param {import('../supports.js').AmountUtils} collUtils
       * @param {bigint} [collValue]
       */
      giveMinted: async (mintedValue, collUtils, collValue = 0n) => {
        trace(t, 'giveCollateral', mintedValue);
        const invitation = await E(vault).makeAdjustBalancesInvitation();
        const mintedAmount = run.make(mintedValue);
        const seat = await E(services.zoe).offer(
          invitation,
          harden({
            give: { Minted: mintedAmount },
            want: collValue
              ? { Collateral: collUtils.make(collValue) }
              : undefined,
          }),
          harden({
            Minted: getRunFromFaucet(t, mintedAmount),
          }),
        );
        return E(seat).getOfferResult();
      },
      close: async () => {
        currentSeat = await E(zoe).offer(E(vault).makeCloseInvitation());
        currentOfferResult = await E(currentSeat).getOfferResult();
        t.is(
          currentOfferResult,
          'your loan is closed, thank you for your business',
        );
        t.truthy(await E(vaultSeat).hasExited());
      },
      transfer: async () => {
        currentSeat = await E(zoe).offer(E(vault).makeTransferInvitation());
        currentOfferResult = await E(currentSeat).getOfferResult();
        t.like(currentOfferResult, {
          publicSubscribers: { vault: { description: 'Vault holder status' } },
        });
        t.truthy(await E(vaultSeat).hasExited());
      },
      /**
       * @param {import('../../src/vaultFactory/vault.js').VaultPhase} phase
       * @param {object} [likeExpected]
       * @param {AT_NEXT | number} [optSince] AT_NEXT is an alias for
       *   updateCount of the last update, forcing to wait for another
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
      checkBorrowed: async (loanAmount, mintFee) => {
        const debtAmount = await E(vault).getCurrentDebt();
        const fee = ceilMultiplyBy(loanAmount, mintFee);
        t.deepEqual(
          debtAmount,
          AmountMath.add(loanAmount, fee),
          'borrower Minted amount does not match',
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
    getVaultDirectorPublic: () => vfPublic,
    managerNotification: () => managerNotification,
    // XXX should return another ManagerDriver and maybe there should be a Director driver above them
    addVaultType: async keyword => {
      /** @type {IssuerKit<'nat'>} */
      const kit = makeIssuerKit(keyword.toLowerCase());
      const manager = await E(vaultFactory).addVaultType(
        kit.issuer,
        keyword,
        defaultParamValues(withAmountUtils(kit)),
      );
      return /** @type {const} */ ([manager, withAmountUtils(kit)]);
    },
    currentSeat: () => currentSeat,
    lastOfferResult: () => currentOfferResult,
    timer: () => timer,
    tick: async (ticks = 1) => {
      await timer.tickN(ticks, 'test driver');
    },
    makeVaultDriver,
    checkPayouts: async (expectedRUN, expectedAEth) => {
      const payouts = await E(currentSeat).getPayouts();
      const collProceeds = await aeth.issuer.getAmountOf(payouts.Collateral);
      const runProceeds = await E(run.issuer).getAmountOf(payouts.Minted);
      t.deepEqual(runProceeds, expectedRUN);
      t.deepEqual(collProceeds, expectedAEth);
    },
    checkRewards: async expectedMinted => {
      t.deepEqual(await E(vaultFactory).getRewardAllocation(), {
        Minted: expectedMinted,
      });
    },
    /** @param {Amount<'nat'>} p */
    setPrice: p => priceAuthority.setPrice(makeRatioFromAmounts(p, priceBase)),
    // XXX the paramPath should be implied by the object `setGovernedParam` is being called on.
    // e.g. the manager driver should know the paramPath is `{ key: { collateralBrand: aeth.brand } }`
    // and the director driver should `{ key: 'governedParams }`
    /**
     * @param {string} name
     * @param {any} newValue
     * @param {VaultFactoryParamPath} [paramPath] defaults to root path for the
     *   factory
     */
    setGovernedParam: (
      name,
      newValue,
      paramPath = { key: 'governedParams' },
    ) => {
      trace(t, 'setGovernedParam', name);
      const vfGov = NonNullish(t.context.puppetGovernors.vaultFactory);
      return E(vfGov).changeParams(
        harden({
          paramPath,
          changes: { [name]: newValue },
        }),
      );
    },
    /** @param {string[]} filters */
    setGovernedFilters: filters => {
      trace(t, 'setGovernedFilters', filters);
      const vfGov = NonNullish(t.context.puppetGovernors.vaultFactory);
      return E(vfGov).setFilters(harden(filters));
    },
    /**
     * @param {object} [likeExpected]
     * @param {AT_NEXT | number} [optSince] AT_NEXT is an alias for updateCount
     *   of the last update, forcing to wait for another
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
    checkReserveAllocation: async stableValue => {
      const { reserveCreatorFacet } = t.context;
      const reserveAllocations = await E(reserveCreatorFacet).getAllocations();

      t.deepEqual(reserveAllocations, {
        Fee: run.make(stableValue),
      });
    },
  };
  return driver;
};

/** @param {import('ava').ExecutionContext<DriverContext>} t */
export const makeAuctioneerDriver = async t => {
  const auctioneerKit = await t.context.consume.auctioneerKit;

  // TODO source from context or config
  const startFrequency = 3600n;

  return {
    auctioneerKit,
    advanceTimerByStartFrequency: async () => {
      trace('advanceTimerByStartFrequency');
      // @ts-expect-error ManualTimer debt https://github.com/Agoric/agoric-sdk/issues/7747
      await t.context.timer.advanceBy(BigInt(startFrequency));
      await eventLoopIteration();
    },
    induceTimequake: async () => {
      trace('induceTimequake');
      // @ts-expect-error ManualTimer debt https://github.com/Agoric/agoric-sdk/issues/7747
      await t.context.timer.advanceBy(BigInt(startFrequency) * 10n);
      await eventLoopIteration();
    },
    assertSchedulesLike: async (liveAuctionPartial, nextAuctionPartial) => {
      await eventLoopIteration();
      const { liveAuctionSchedule, nextAuctionSchedule } = await E(
        auctioneerKit.publicFacet,
      ).getSchedules();
      if (liveAuctionPartial === null) {
        t.is(liveAuctionSchedule, null, 'expected liveAuctionSchedule null');
      } else {
        t.like(
          liveAuctionSchedule,
          liveAuctionPartial,
          'unexpected liveAuctionSchedule',
        );
      }
      if (nextAuctionPartial === null) {
        t.is(nextAuctionSchedule, null, 'expected nextAuctionSchedule null');
      } else {
        t.like(
          nextAuctionSchedule,
          nextAuctionPartial,
          'unexpected nextAuctionSchedule',
        );
      }
    },
    /**
     * @param {keyof import('../../src/auction/params.js').AuctionParams} name
     * @param {any} newValue
     */
    setGovernedParam: async (name, newValue) => {
      trace('setGovernedParam', name);
      const auctioneerGov = NonNullish(t.context.puppetGovernors.auctioneer);
      await E(auctioneerGov).changeParams(
        harden({
          paramPath: undefined, // auctioneer getParamMgrRetriever() takes no args
          changes: { [name]: newValue },
        }),
      );
      await eventLoopIteration();
    },
  };
};
