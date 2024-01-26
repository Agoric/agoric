// eslint-disable-next-line import/order
import { bench } from '../src/benchmarkerator.js';

import { Offers } from '@agoric/inter-protocol/src/clientSupport.js';
import { scale6 } from '@agoric/boot/tools/liquidation.js';

const setupData = {
  vaults: [
    {
      atom: 15,
      ist: 100,
      debt: 100.5,
    },
  ],
  bids: [
    {
      give: '80IST',
      discount: 0.1,
    },
  ],
  price: {
    starting: 12.34,
    trigger: 9.99,
  },
  auction: {
    start: {
      collateral: 15,
      debt: 100.5,
    },
    end: {
      collateral: 9.659301,
      debt: 0,
    },
  },
};

const outcome = {
  bids: [
    {
      payouts: {
        Bid: 0,
        Collateral: 8.897786,
      },
    },
  ],
  reserve: {
    allocations: {
      ATOM: 6.102214,
    },
    shortfall: 20.5,
  },
  vaultsSpec: [
    {
      locked: 3.373,
    },
  ],
  vaultsActual: [
    {
      locked: 3.525747,
    },
  ],
};

const liquidationOptions = {
  collateralBrandKey: 'ATOM',
  managerIndex: 0,
};

const setup = async context => {
  const { managerIndex } = liquidationOptions;
  const { walletFactoryDriver } = context.tools;

  const metricsPath = `published.vaultFactory.managers.manager${managerIndex}.metrics`;
  const buyer = await walletFactoryDriver.provideSmartWallet('agoric1buyer');
  const minter = await walletFactoryDriver.provideSmartWallet('agoric1minter');

  return { metricsPath, buyer, minter };
};

const setupRound = async (context, round) => {
  const { collateralBrandKey, managerIndex } = liquidationOptions;
  const { setupVaults, placeBids } = context.tools;

  await setupVaults(
    collateralBrandKey,
    managerIndex,
    setupData,
    round * setupData.vaults.length,
  );
  await placeBids(collateralBrandKey, 'agoric1buyer', setupData);
};

const executeRound = async (context, round) => {
  const { collateralBrandKey, managerIndex } = liquidationOptions;
  const { advanceTimeBy, advanceTimeTo, priceFeedDrivers, readLatest } =
    context.tools;

  const { metricsPath } = context.config;

  // ---------------
  //  Change price to trigger liquidation
  // ---------------

  await priceFeedDrivers[collateralBrandKey].setPrice(9.99);

  // check nothing liquidating yet
  const liveSchedule = readLatest('published.auction.schedule');
  assert(liveSchedule.activeStartTime === null);
  const metrics1 = readLatest(metricsPath);
  assert(
    metrics1.numActiveVaults === setupData.vaults.length &&
      metrics1.numLiquidatingVaults === 0,
  );

  // advance time to start an auction
  console.log(collateralBrandKey, 'step 1 of 10');
  await advanceTimeTo(liveSchedule.nextDescendingStepTime);
  const metrics2 = readLatest(metricsPath);
  assert(
    metrics2.numActiveVaults === 0 &&
      metrics2.numLiquidatingVaults === setupData.vaults.length &&
      metrics2.liquidatingCollateral.value ===
        scale6(setupData.auction.start.collateral) &&
      metrics2.liquidatingDebt.value === scale6(setupData.auction.start.debt) &&
      metrics2.lockedQuote === null,
  );

  console.log(collateralBrandKey, 'step 2 of 10');
  await advanceTimeBy(3, 'minutes');
  let auctionBook = readLatest(`published.auction.book${managerIndex}`);
  assert(
    auctionBook.collateralAvailable.value ===
      scale6(setupData.auction.start.collateral) &&
      auctionBook.startCollateral.value ===
        scale6(setupData.auction.start.collateral) &&
      auctionBook.startProceedsGoal.value ===
        scale6(setupData.auction.start.debt),
  );

  console.log(collateralBrandKey, 'step 3 of 10');
  await advanceTimeBy(3, 'minutes');

  console.log(collateralBrandKey, 'step 4 of 10');
  await advanceTimeBy(3, 'minutes');

  let buyerWallet = readLatest('published.wallet.agoric1buyer');
  assert(
    buyerWallet.status.id === `${collateralBrandKey}-bid1` &&
      buyerWallet.status.payouts.Collateral.value ===
        scale6(outcome.bids[0].payouts.Collateral) &&
      buyerWallet.status.payouts.Bid.value ===
        scale6(outcome.bids[0].payouts.Bid),
  );

  console.log(collateralBrandKey, 'step 5 of 10');
  await advanceTimeBy(3, 'minutes');

  console.log(collateralBrandKey, 'step 6 of 10');
  await advanceTimeBy(3, 'minutes');
  auctionBook = readLatest(`published.auction.book${managerIndex}`);
  assert(auctionBook.collateralAvailable.value === 6102214n);

  console.log(collateralBrandKey, 'step 7 of 10');
  await advanceTimeBy(3, 'minutes');

  console.log(collateralBrandKey, 'step 8 of 10');
  await advanceTimeBy(3, 'minutes');

  console.log(collateralBrandKey, 'step 9 of 10');
  await advanceTimeBy(3, 'minutes');

  const metrics3 = readLatest(metricsPath);
  const roundB = BigInt(round);
  assert(
    metrics3.numActiveVaults === 0 &&
      metrics3.numLiquidationsCompleted === setupData.vaults.length * round &&
      metrics3.numLiquidatingVaults === 0 &&
      metrics3.retainedCollateral.value === 0n &&
      metrics3.totalCollateral.value === 0n &&
      metrics3.totalCollateralSold.value === 8897786n * roundB &&
      metrics3.totalDebt.value === 0n &&
      metrics3.totalOverageReceived.value === 0n &&
      metrics3.totalProceedsReceived.value === 80000000n * roundB &&
      metrics3.totalShortfallReceived.value === 20500000n * roundB,
  );

  console.log(collateralBrandKey, 'step 10 of 10');

  buyerWallet = readLatest('published.wallet.agoric1buyer');
  assert(
    buyerWallet.status.id === `${collateralBrandKey}-bid1` &&
      buyerWallet.status.payouts.Collateral.value ===
        scale6(outcome.bids[0].payouts.Collateral) &&
      buyerWallet.status.payouts.Bid.value ===
        scale6(outcome.bids[0].payouts.Bid),
  );

  // check reserve balances
  const metrics4 = readLatest('published.reserve.metrics');
  assert(
    metrics4.allocations[collateralBrandKey].value ===
      scale6(outcome.reserve.allocations[collateralBrandKey]) * roundB &&
      metrics4.shortfallBalance.value ===
        scale6(outcome.reserve.shortfall) * roundB,
  );
};

const finishRound = async (context, round) => {
  const { collateralBrandKey } = liquidationOptions;
  const { minter } = context.config;

  await 47; // sacrifice to the gods of asynchrony
  for (let i = 0; i < setupData.vaults.length; i += 1) {
    await minter.executeOfferMaker(
      Offers.vaults.CloseVault,
      {
        offerId: `${collateralBrandKey}-bid${i}`,
        collateralBrandKey,
        giveMinted: 0,
      },
      `open-${collateralBrandKey}-vault${round * setupData.vaults.length + i}`,
    );
  }
};

bench.addBenchmark('price feed with liquidation', {
  setup,
  setupRound,
  executeRound,
  finishRound,
});

await bench.run();
