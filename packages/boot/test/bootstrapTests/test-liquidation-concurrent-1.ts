// @ts-check
/** @file Bootstrap test of liquidation across multiple collaterals */
import { test as anyTest } from '@agoric/zoe/tools/prepare-test-env-ava.js';

import { NonNullish } from '@agoric/assert';
import process from 'process';
import { TestFn } from 'ava';
import {
  LiquidationSetup,
  LiquidationTestContext,
  ensureVaultCollateral,
  likePayouts,
  makeLiquidationTestContext,
  scale6,
} from '../../tools/liquidation.js';

const test = anyTest as TestFn<LiquidationTestContext>;

const atomSetup: LiquidationSetup = {
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
      give: '80IST',
      discount: 0.1,
    },
    {
      give: '90IST',
      price: 9.0,
    },
    {
      give: '150IST',
      discount: 0.15,
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
      collateral: 9.659301,
      debt: 0,
    },
  },
};

const starsSetup: LiquidationSetup = {
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
      give: '80IST',
      discount: 0.1,
    },
    {
      give: '90IST',
      price: 10.0,
    },
    {
      give: '166.675IST',
      discount: 0.15,
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
      collateral: 9.970236,
      debt: 0,
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
        Collateral: 8.897786,
      },
    },
    {
      payouts: {
        Bid: 0,
        Collateral: 10.01001,
      },
    },
    {
      payouts: {
        Bid: 10.46,
        Collateral: 16.432903,
      },
    },
  ],
  reserve: {
    allocations: {
      ATOM: 0.309852,
    },
    shortfall: 0,
  },
  vaultsSpec: [
    {
      locked: 3.373,
    },
    {
      locked: 3.024,
    },
    {
      locked: 2.792,
    },
  ],
  vaultsActual: [
    {
      locked: 3.525747,
    },
    {
      locked: 3.181519,
    },
    {
      locked: 2.642185,
    },
  ],
};

const starsOutcome = /** @type {const} */ {
  bids: [
    {
      payouts: {
        Bid: 0,
        Collateral: 8.08,
      },
    },
    {
      payouts: {
        Bid: 0,
        Collateral: 9.099181,
      },
    },
    {
      payouts: {
        Bid: 0,
        Collateral: 17.48,
      },
    },
  ],
  reserve: {
    allocations: {
      STARS: 0.306349,
    },
    shortfall: 0,
  },
  vaultsSpec: [
    {
      locked: 3.373,
    },
    {
      locked: 3.024,
    },
    {
      locked: 2.792,
    },
  ],
  vaultsActual: [
    {
      locked: 3.525747,
    },
    {
      locked: 3.181519,
    },
    {
      locked: 2.642185,
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

// Reference: Flow 1 from https://github.com/Agoric/agoric-sdk/issues/7123
test('concurrent flow 1', async t => {
  // fail if there are any unhandled rejections
  process.on('unhandledRejection', (error: Error) => {
    t.fail(error.message);
  });

  const {
    advanceTimeBy,
    advanceTimeTo,
    check,
    priceFeedDrivers,
    readLatest,
    walletFactoryDriver,
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

  const buyer = await walletFactoryDriver.provideSmartWallet('agoric1buyer');

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
      placeBids(collateralBrandKey, 'agoric1buyer', setups[collateralBrandKey]),
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

  // advance time to start an auction
  console.log('step 1 of 10');
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
      lockedQuote: null,
    });
  }

  console.log('step 2 of 10');
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

  console.log('step 3 of 10');
  await advanceTimeBy(3, 'minutes');

  console.log('step 4 of 10');
  await advanceTimeBy(3, 'minutes');

  // updates for bid1 and bid2 are appended in the same turn so readLatest gives bid2
  // updates for ATOM and STARS are appended in the same turn so readLatest gives STARS
  t.like(readLatest('published.wallet.agoric1buyer'), {
    status: {
      id: `${collateralBrandKeySt}-bid2`,
      payouts: likePayouts(outcomes[collateralBrandKeySt].bids[1].payouts),
    },
  });

  console.log('step 5 of 10');
  await advanceTimeBy(3, 'minutes');

  console.log('step 6 of 10');
  await advanceTimeBy(3, 'minutes');

  for (const { collateralBrandKey, managerIndex } of cases) {
    t.like(readLatest(`published.auction.book${managerIndex}`), {
      collateralAvailable: {
        value: scale6(setups[collateralBrandKey].auction.end.collateral),
      },
    });
  }

  console.log('step 7 of 10');
  await advanceTimeBy(3, 'minutes');

  console.log('step 8 of 10');
  await advanceTimeBy(3, 'minutes');

  console.log('step 9 of 10');
  await advanceTimeBy(3, 'minutes');

  console.log('step 10 of 10');
  // continuing after now would start a new auction
  {
    /**
     * @type {Record<
     *   string,
     *   import('@agoric/time').TimestampRecord
     * >}
     */
    const { nextDescendingStepTime, nextStartTime } = readLatest(
      'published.auction.schedule',
    );
    t.is(nextDescendingStepTime.absValue, nextStartTime.absValue);
  }

  for (const { collateralBrandKey, managerIndex } of cases) {
    check.vaultNotification(managerIndex, 0, {
      debt: undefined,
      vaultState: 'liquidated',
      locked: {
        value: scale6(outcomes[collateralBrandKey].vaultsActual[0].locked),
      },
    });
    check.vaultNotification(managerIndex, 1, {
      debt: undefined,
      vaultState: 'liquidated',
      locked: {
        value: scale6(outcomes[collateralBrandKey].vaultsActual[1].locked),
      },
    });

    // check reserve balances
    t.like(readLatest('published.reserve.metrics'), {
      allocations: {
        [collateralBrandKey]: {
          value: scale6(
            outcomes[collateralBrandKey].reserve.allocations[
              collateralBrandKey
            ],
          ),
        },
      },
      shortfallBalance: {
        value: scale6(outcomes[collateralBrandKey].reserve.shortfall),
      },
    });
  }

  const metricsPathA = metricsPaths[managerIndexA];
  const metricsPathSt = metricsPaths[managerIndexSt];

  // ATOM
  t.like(readLatest(metricsPathA), {
    numActiveVaults: 0,
    numLiquidationsCompleted: setups[collateralBrandKeyA].vaults.length,
    numLiquidatingVaults: 0,
    retainedCollateral: { value: 0n },
    totalCollateral: { value: 0n },
    totalDebt: { value: 0n },
    totalOverageReceived: { value: 0n },
    totalProceedsReceived: {
      value: scale6(setups[collateralBrandKeyA].auction.start.debt),
    },
    totalShortfallReceived: {
      value: scale6(outcomes[collateralBrandKeyA].reserve.shortfall),
    },
  });

  // bid3 still live because it's not fully satisfied
  const { liveOffers } = readLatest('published.wallet.agoric1buyer.current');
  t.is(liveOffers[0][1].id, `${collateralBrandKeyA}-bid3`);
  // exit to get payouts
  await buyer.tryExitOffer(`${collateralBrandKeyA}-bid3`);
  t.like(readLatest('published.wallet.agoric1buyer'), {
    status: {
      id: `${collateralBrandKeyA}-bid3`,
      payouts: likePayouts(outcomes[collateralBrandKeyA].bids[2].payouts),
    },
  });

  // STARS
  t.like(readLatest(metricsPathSt), {
    numActiveVaults: 0,
    numLiquidationsCompleted: setups[collateralBrandKeySt].vaults.length,
    numLiquidatingVaults: 0,
    retainedCollateral: { value: 0n },
    totalCollateral: { value: 0n },
    totalDebt: { value: 0n },
    totalOverageReceived: { value: 0n },
    totalProceedsReceived: {
      value: scale6(setups[collateralBrandKeySt].auction.start.debt),
    },
    totalShortfallReceived: {
      value: scale6(outcomes[collateralBrandKeySt].reserve.shortfall),
    },
  });
});
