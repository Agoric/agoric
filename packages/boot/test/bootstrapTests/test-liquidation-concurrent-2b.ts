// @ts-check
/**
 * @file Bootstrap test integration vaults with smart-wallet
 *
 *   Forks test-liquidation to test another scenario, but with a clean vault
 *   manager state. TODO is there a way to _reset_ the vaultmanager to make the
 *   two tests run faster?
 */
import { test as anyTest } from '@agoric/zoe/tools/prepare-test-env-ava.js';

import { NonNullish } from '@agoric/assert';
import { ExecutionContext, TestFn } from 'ava';
import {
  LiquidationTestContext,
  ensureVaultCollateral,
  makeLiquidationTestContext,
  scale6,
} from '../../tools/liquidation.js';

const test = anyTest as TestFn<LiquidationTestContext>;

const atomSetup = {
  vaults: [
    {
      atom: 15,
      ist: 100,
      debt: 100.5,
    },
    {
      atom: 15,
      ist: 103,
      debt: 103.515,
    },
    {
      atom: 15,
      ist: 105,
      debt: 105.525,
    },
  ],
  bids: [
    {
      give: '25IST',
      discount: 0.3,
    },
    {
      give: '75IST',
      discount: 0.22,
    },
  ],
  price: {
    starting: 12.34,
    trigger: 9.99,
  },
  auction: {
    start: {
      collateral: 45,
      debt: 309.54,
    },
    end: {
      collateral: 31.414987,
      debt: 209.54,
    },
  },
};

const starsSetup = /** @type {const} */ {
  vaults: [
    {
      atom: 15,
      ist: 110,
      debt: 110.55,
    },
    {
      atom: 15,
      ist: 112,
      debt: 112.56,
    },
    {
      atom: 15,
      ist: 113,
      debt: 113.565,
    },
  ],
  bids: [
    {
      give: '25IST',
      discount: 0.3,
    },
    {
      give: '75IST',
      discount: 0.22,
    },
  ],
  price: {
    starting: 13.34,
    trigger: 10.99,
  },
  auction: {
    start: {
      collateral: 45,
      debt: 336.675,
    },
    end: {
      collateral: 32.65,
      debt: 236.675,
    },
  },
};

const setups = {
  ATOM: atomSetup,
  STARS: starsSetup,
};

const atomOutcome = /** @type {const} */ {
  bids: [
    {
      payouts: {
        Bid: 0,
        Collateral: 10.01,
      },
    },
    {
      payouts: {
        Bid: 0,
        Collateral: 3.575,
      },
    },
  ],
  reserve: {
    allocations: {
      ATOM: 1.619207,
    },
    shortfall: 5.525,
  },
  vaultsActual: [
    {
      debt: 100.5,
      locked: 14.998993,
    },
    {
      debt: 103.515,
      locked: 14.998963,
    },
    {
      locked: 0,
    },
  ],
};

const starsOutcome = /** @type {const} */ {
  bids: [
    {
      payouts: {
        Bid: 0,
        Collateral: 9.099,
      },
    },
    {
      payouts: {
        Bid: 0,
        Collateral: 3.2497,
      },
    },
  ],
  reserve: {
    allocations: {
      ATOM: 2.87192,
    },
    shortfall: 13.565,
  },
  vaultsActual: [
    {
      debt: 100.5,
      locked: 14.998993,
    },
    {
      debt: 103.515,
      locked: 14.998963,
    },
    {
      locked: 0,
    },
  ],
};

const outcomes = {
  ATOM: atomOutcome,
  STARS: starsOutcome,
};

test.before(async t => {
  t.context = await makeLiquidationTestContext(t);
});
test.after.always(t => {
  return t.context.shutdown && t.context.shutdown();
});

test.serial(
  'concurrent flow 2',
  async (t: ExecutionContext<LiquidationTestContext>) => {
    const {
      advanceTimeBy,
      advanceTimeTo,
      check,
      priceFeedDrivers,
      readLatest,
      setupVaults,
      placeBids,
    } = t.context;

    const cases = [
      { collateralBrandKey: 'ATOM', managerIndex: 0 },
      { collateralBrandKey: 'STARS', managerIndex: 1 },
    ];

    await Promise.all(
      cases.map(({ collateralBrandKey }) =>
        ensureVaultCollateral(collateralBrandKey, t),
      ),
    );

    const metricsPaths = cases.map(
      ({ managerIndex }) =>
        `published.vaultFactory.managers.manager${managerIndex}.metrics`,
    );

    const {
      collateralBrandKey: collateralBrandKeyA,
      managerIndex: managerIndexA,
    } = cases[0];
    const {
      collateralBrandKey: collateralBrandKeySt,
      managerIndex: managerIndexSt,
    } = cases[1];

    await setupVaults(
      collateralBrandKeyA,
      managerIndexA,
      setups[collateralBrandKeyA],
    );
    await setupVaults(
      collateralBrandKeySt,
      managerIndexSt,
      setups[collateralBrandKeySt],
    );

    await Promise.all(
      cases.map(({ collateralBrandKey }) =>
        placeBids(
          collateralBrandKey,
          'agoric1buyer',
          setups[collateralBrandKey],
        ),
      ),
    );

    // ---------------
    //  Change price to trigger liquidation
    // ---------------
    console.log('Change prices');
    await priceFeedDrivers[collateralBrandKeyA].setPrice(
      setups[collateralBrandKeyA].price.trigger,
    );
    await priceFeedDrivers[collateralBrandKeySt].setPrice(
      setups[collateralBrandKeySt].price.trigger,
    );

    const liveSchedule = readLatest('published.auction.schedule');

    for (const { collateralBrandKey, managerIndex } of cases) {
      // check nothing liquidating yet
      /** @type {import('@agoric/inter-protocol/src/auction/scheduler.js').ScheduleNotification} */
      t.is(liveSchedule.activeStartTime, null);
      t.like(readLatest(metricsPaths[managerIndex]), {
        numActiveVaults: setups[collateralBrandKey].vaults.length,
        numLiquidatingVaults: 0,
      });
    }

    console.log('step 0 of 11');
    await advanceTimeTo(NonNullish(liveSchedule.nextDescendingStepTime));

    for (const { collateralBrandKey, managerIndex } of cases) {
      t.like(readLatest(metricsPaths[managerIndex]), {
        numActiveVaults: 0,
        numLiquidatingVaults: setups[collateralBrandKey].vaults.length,
        liquidatingCollateral: {
          value: scale6(setups[collateralBrandKey].auction.start.collateral),
        },
        liquidatingDebt: {
          value: scale6(setups[collateralBrandKey].auction.start.debt),
        },
      });
    }

    console.log('step 1 of 11');
    await advanceTimeBy(3, 'minutes');

    for (const { collateralBrandKey, managerIndex } of cases) {
      t.like(readLatest(`published.auction.book${managerIndex}`), {
        collateralAvailable: {
          value: scale6(setups[collateralBrandKey].auction.start.collateral),
        },
        startCollateral: {
          value: scale6(setups[collateralBrandKey].auction.start.collateral),
        },
        startProceedsGoal: {
          value: scale6(setups[collateralBrandKey].auction.start.debt),
        },
      });
    }

    console.log('step 2 of 11');
    await advanceTimeBy(3, 'minutes');

    console.log('step 3 of 11');
    await advanceTimeBy(3, 'minutes');

    console.log('step 4 of 11');
    await advanceTimeBy(3, 'minutes');

    console.log('step 5 of 11');
    await advanceTimeBy(3, 'minutes');

    for (const { collateralBrandKey, managerIndex } of cases) {
      t.like(readLatest(`published.auction.book${managerIndex}`), {
        collateralAvailable: {
          value: scale6(setups[collateralBrandKey].auction.start.collateral),
        },
      });
    }

    console.log('step 6 of 11');
    await advanceTimeBy(3, 'minutes');

    console.log('step 7 of 11');
    await advanceTimeBy(3, 'minutes');

    console.log('step 8 of 11');
    await advanceTimeBy(3, 'minutes');

    console.log('step 9 of 11');
    await advanceTimeBy(3, 'minutes');

    console.log('step 10 of 11');
    await advanceTimeBy(3, 'minutes');

    console.log('step 11 of 11');
    await advanceTimeBy(3, 'minutes');

    for (const { collateralBrandKey, managerIndex } of cases) {
      check.vaultNotification(managerIndex, 0, {
        debt: undefined,
        vaultState: 'active',
        locked: {
          value: scale6(outcomes[collateralBrandKey].vaultsActual[0].locked),
        },
      });
      check.vaultNotification(managerIndex, 1, {
        debt: undefined,
        vaultState: 'active',
        locked: {
          value: scale6(outcomes[collateralBrandKey].vaultsActual[1].locked),
        },
      });
      check.vaultNotification(managerIndex, 2, {
        debt: undefined,
        vaultState: 'liquidated',
        locked: {
          value: scale6(outcomes[collateralBrandKey].vaultsActual[2].locked),
        },
      });
    }

    const metricsPathA = metricsPaths[managerIndexA];
    const metricsPathSt = metricsPaths[managerIndexSt];

    // ATOM
    t.like(readLatest(metricsPathA), {
      // reconstituted
      numActiveVaults: 2,
      numLiquidationsCompleted: 1,
      numLiquidatingVaults: 0,
      retainedCollateral: { value: 0n },
      totalCollateral: { value: 29795782n },
      totalCollateralSold: { value: 13585013n },
      totalDebt: { value: 204015000n },
      totalOverageReceived: { value: 0n },
      totalProceedsReceived: { value: 100000000n },
      totalShortfallReceived: {
        value: scale6(outcomes[collateralBrandKeyA].reserve.shortfall),
      },
    });

    // STARS
    t.like(readLatest(metricsPathSt), {
      // reconstituted
      numActiveVaults: 2,
      numLiquidationsCompleted: 1,
      numLiquidatingVaults: 0,
      retainedCollateral: { value: 0n },
      totalCollateral: { value: 29796989n },
      totalCollateralSold: { value: 12348888n },
      totalDebt: { value: 223110000n },
      totalOverageReceived: { value: 0n },
      totalProceedsReceived: { value: 100000000n },
      totalShortfallReceived: {
        value: scale6(outcomes[collateralBrandKeySt].reserve.shortfall),
      },
    });
  },
);
