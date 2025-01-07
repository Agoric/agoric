// @ts-nocheck
import { test } from '@agoric/swingset-vat/tools/prepare-test-env-ava.js';

import { AmountMath } from '@agoric/ertp';
import { E } from '@endo/eventual-send';
import { makeNotifierKit } from '@agoric/notifier';
import { TimeMath } from '@agoric/time';

import { eventLoopIteration } from '@agoric/internal/src/testing-utils.js';
import {
  setupLoanUnitTest,
  makeSeatKit,
  checkDetails,
  performAddCollateral,
  checkDescription,
  checkNoNewOffers,
  checkPayouts,
  makeAutoswapInstance,
} from './helpers.js';

import { makeFakePriceAuthority } from '../../../../tools/fakePriceAuthority.js';
import buildManualTimer from '../../../../tools/manualTimer.js';

import { makeBorrowInvitation } from '../../../../src/contracts/loan/borrow.js';
import { makeAddCollateralInvitation } from '../../../../src/contracts/loan/addCollateral.js';
import { makeCloseLoanInvitation } from '../../../../src/contracts/loan/close.js';
import { makeRatio } from '../../../../src/contractSupport/index.js';
import { assertAmountsEqual } from '../../../zoeTestHelpers.js';

const BASIS_POINTS = 10000n;

const setupBorrow = async (
  maxLoanValue = 100n,
  timer = buildManualTimer(console.log, 0n, { eventLoopIteration }),
) => {
  const setup = await setupLoanUnitTest();
  const { zcf: loanZcf, loanKit, collateralKit, zoe, vatAdminState } = setup;
  // Set up the lender seat
  const maxLoan = AmountMath.make(loanKit.brand, maxLoanValue);

  const { zcfSeat: lenderSeat, userSeat: lenderUserSeat } = await makeSeatKit(
    loanZcf,
    { give: { Loan: maxLoan } },
    { Loan: loanKit.mint.mintPayment(maxLoan) },
  );

  const mmr = makeRatio(150n, loanKit.brand);
  const priceList = [2, 1, 1, 1];

  const priceAuthority = await makeFakePriceAuthority({
    actualBrandIn: collateralKit.brand,
    actualBrandOut: loanKit.brand,
    priceList,
    timer,
  });
  await timer.tick();

  const initialLiquidityKeywordRecord = {
    Central: AmountMath.make(loanKit.brand, 10000n),
    Secondary: AmountMath.make(collateralKit.brand, 10000n),
  };

  const autoswapInstance = await makeAutoswapInstance(
    zoe,
    collateralKit,
    loanKit,
    initialLiquidityKeywordRecord,
    vatAdminState,
  );

  // In the config that the borrow code sees, the periodNotifier has
  // been adapted to a periodAsyncIterable
  const { updater: periodUpdater, notifier: periodNotifier } =
    makeNotifierKit();

  const interestRate = makeRatio(5n, loanKit.brand, BASIS_POINTS);

  const config = {
    lenderSeat,
    mmr,
    autoswapInstance,
    priceAuthority,
    makeCloseLoanInvitation,
    makeAddCollateralInvitation,
    periodNotifier,
    interestRate,
    interestPeriod: 5n,
    loanBrand: loanKit.brand,
    collateralBrand: collateralKit.brand,
  };
  const borrowInvitation = makeBorrowInvitation(loanZcf, config);
  return {
    ...setup,
    borrowInvitation,
    maxLoan,
    lenderUserSeat,
    periodUpdater,
    periodNotifier,
    timer,
    priceAuthority,
  };
};

const setupBorrowFacet = async (
  collateralValue = 1000n,
  maxLoanValue = 100n,
) => {
  const setup = await setupBorrow(maxLoanValue);
  const { borrowInvitation, zoe, maxLoan, collateralKit } = setup;

  const collateral = AmountMath.make(collateralKit.brand, collateralValue);

  const proposal = harden({
    want: { Loan: maxLoan },
    give: { Collateral: collateral },
  });

  const payments = { Collateral: collateralKit.mint.mintPayment(collateral) };
  const borrowSeat = await E(zoe).offer(borrowInvitation, proposal, payments);
  /** @type {ERef<BorrowFacet>} */
  const borrowFacet = E(borrowSeat).getOfferResult();

  return {
    ...setup,
    collateral,
    borrowSeat,
    borrowFacet,
  };
};

test('borrow assert customDetails', async t => {
  const { borrowInvitation, zoe, installation, instance, maxLoan } =
    await setupBorrow();

  await checkDetails(t, zoe, borrowInvitation, {
    description: 'borrow',
    handle: null,
    installation,
    instance,
    customDetails: {
      maxLoan,
    },
  });
});

test('borrow not enough collateral', async t => {
  // collateral is 0
  const { borrowSeat, borrowFacet } = await setupBorrowFacet(0n);
  // Sink unhandled rejection
  void E.when(
    borrowFacet,
    () => {},
    () => {},
  );
  await t.throwsAsync(async () => E(borrowSeat).getOfferResult(), {
    message: /The required margin is .*% but collateral only had value of .*/,
  });
});

test('borrow just enough collateral', async t => {
  const { borrowFacet, zoe } = await setupBorrowFacet(75n);
  const closeLoanInvitation = await E(borrowFacet).makeCloseLoanInvitation();
  await checkDescription(t, zoe, closeLoanInvitation, 'repayAndClose');
});

test('borrow makeCloseLoanInvitation', async t => {
  const { borrowFacet, zoe } = await setupBorrowFacet();
  const closeLoanInvitation = await E(borrowFacet).makeCloseLoanInvitation();
  await checkDescription(t, zoe, closeLoanInvitation, 'repayAndClose');
});

test('borrow makeAddCollateralInvitation', async t => {
  const { borrowFacet, zoe } = await setupBorrowFacet();
  const addCollateralInvitation =
    await E(borrowFacet).makeAddCollateralInvitation();
  await checkDescription(t, zoe, addCollateralInvitation, 'addCollateral');
});

test('borrow getDebtNotifier', async t => {
  const { borrowFacet, maxLoan } = await setupBorrowFacet();
  const debtNotifier = await E(borrowFacet).getDebtNotifier();
  const state = await debtNotifier.getUpdateSince();
  await assertAmountsEqual(t, state.value, maxLoan);
});

test('borrow getRecentCollateralAmount', async t => {
  const { borrowFacet, collateral } = await setupBorrowFacet();
  const collateralAmount = await E(borrowFacet).getRecentCollateralAmount();
  await assertAmountsEqual(t, collateralAmount, collateral);
});

test('borrow getLiquidationPromise', async t => {
  const { borrowFacet, collateralKit, loanKit, priceAuthority, timer } =
    await setupBorrowFacet(100n);
  const toTS = ts => TimeMath.coerceTimestampRecord(ts, timer.getTimerBrand());
  const liquidationPromise = E(borrowFacet).getLiquidationPromise();

  const collateralGiven = AmountMath.make(collateralKit.brand, 100n);

  const quoteIssuer = E(priceAuthority).getQuoteIssuer(
    collateralKit.brand,
    loanKit.brand,
  );
  const quoteBrand = await E(quoteIssuer).getBrand();

  // According to the schedule, the value of the collateral moves from
  // 2x the loan brand to only 1x the loan brand at time 1.
  await timer.tick();

  const { quoteAmount, quotePayment } = await liquidationPromise;
  const quoteAmount2 = await E(quoteIssuer).getAmountOf(quotePayment);

  await assertAmountsEqual(t, quoteAmount, quoteAmount2);
  await assertAmountsEqual(
    t,
    quoteAmount,
    AmountMath.make(
      quoteBrand,
      harden([
        {
          amountIn: collateralGiven,
          amountOut: AmountMath.make(loanKit.brand, 100n),
          timer,
          timestamp: toTS(2n),
        },
      ]),
    ),
  );
});

// Liquidation should not happen at the old assetAmount, but should
// happen at the new assetAmount
test('borrow, then addCollateral, then getLiquidationPromise', async t => {
  const {
    borrowFacet,
    lenderUserSeat,
    collateralKit,
    loanKit,
    zoe,
    priceAuthority,
    timer,
    zcf,
  } = await setupBorrowFacet(100n);
  const toTS = ts => TimeMath.coerceTimestampRecord(ts, timer.getTimerBrand());
  const liquidationPromise = E(borrowFacet).getLiquidationPromise();

  const addCollateralInvitation =
    await E(borrowFacet).makeAddCollateralInvitation();

  const addedAmount = AmountMath.make(collateralKit.brand, 3n);

  await performAddCollateral(
    t,
    zoe,
    collateralKit,
    loanKit,
    addCollateralInvitation,
    addedAmount,
  );

  const collateralGiven = AmountMath.make(collateralKit.brand, 103n);

  const quoteIssuer = await E(priceAuthority).getQuoteIssuer(
    collateralKit.brand,
    loanKit.brand,
  );

  await timer.tick();
  await timer.tick();

  const { quoteAmount, quotePayment } = await liquidationPromise;

  const quoteAmount2 = await E(quoteIssuer).getAmountOf(quotePayment);

  const quoteBrand = await E(quoteIssuer).getBrand();

  await assertAmountsEqual(t, quoteAmount, quoteAmount2);
  await assertAmountsEqual(
    t,
    quoteAmount,
    AmountMath.make(
      quoteBrand,
      harden([
        {
          amountIn: collateralGiven,
          amountOut: AmountMath.make(loanKit.brand, 103n),
          timer,
          timestamp: toTS(3n),
        },
      ]),
    ),
  );

  await checkPayouts(
    t,
    lenderUserSeat,
    { Collateral: collateralKit, Loan: loanKit },
    {
      Collateral: AmountMath.makeEmpty(
        collateralKit.brand,
        collateralKit.assetKind,
      ),
      Loan: AmountMath.make(loanKit.brand, 101n),
    },
  );

  await checkNoNewOffers(t, zcf);
});

test('getDebtNotifier with interest', async t => {
  const { borrowFacet, maxLoan, periodUpdater, zoe, loanKit } =
    await setupBorrowFacet(100000n, 40000n);
  periodUpdater.updateState(0n);

  const debtNotifier = await E(borrowFacet).getDebtNotifier();

  const { value: originalDebt, updateCount } =
    await E(debtNotifier).getUpdateSince();
  await assertAmountsEqual(t, originalDebt, maxLoan);

  periodUpdater.updateState(6n);

  const { value: debtCompounded1, updateCount: updateCount1 } =
    await E(debtNotifier).getUpdateSince(updateCount);
  await assertAmountsEqual(
    t,
    debtCompounded1,
    AmountMath.make(loanKit.brand, 40020n),
  );

  periodUpdater.updateState(11n);

  const { value: debtCompounded2 } =
    await E(debtNotifier).getUpdateSince(updateCount1);
  await assertAmountsEqual(
    t,
    debtCompounded2,
    AmountMath.make(loanKit.brand, 40041n),
  );

  const closeLoanInvitation = E(borrowFacet).makeCloseLoanInvitation();
  await checkDescription(t, zoe, closeLoanInvitation, 'repayAndClose');

  const collateral = await E(borrowFacet).getRecentCollateralAmount();

  const proposal = harden({
    give: { Loan: AmountMath.make(loanKit.brand, 40000n) },
    want: { Collateral: collateral },
  });

  const payments = harden({
    Loan: loanKit.mint.mintPayment(AmountMath.make(loanKit.brand, 40000n)),
  });

  const seat = await E(zoe).offer(closeLoanInvitation, proposal, payments);

  await t.throwsAsync(async () => seat.getOfferResult(), {
    message:
      /Not enough Loan assets have been repaid. {2}.* is required, but only .* was repaid./,
  });
});

test('borrow collateral just too low', async t => {
  const { borrowSeat: borrowSeatGood } = await setupBorrowFacet(75n);
  const offerResult = await E(borrowSeatGood).getOfferResult();
  const collateralAmount = await E(offerResult).getRecentCollateralAmount();
  t.is(collateralAmount.value, 75n);

  const { borrowSeat: borrowSeatBad, borrowFacet: borrowFacetBad } =
    await setupBorrowFacet(74n);

  // Sink unhandled rejection
  void E.when(
    borrowFacetBad,
    () => {},
    () => {},
  );

  await t.throwsAsync(async () => E(borrowSeatBad).getOfferResult(), {
    message: /The required margin is .*% but collateral only had value of .*/,
  });
});

test('aperiodic interest', async t => {
  const { borrowFacet, maxLoan, periodUpdater, loanKit, timer } =
    await setupBorrowFacet(100000n, 40000n);
  const toTS = ts => TimeMath.coerceTimestampRecord(ts, timer.getTimerBrand());
  periodUpdater.updateState(0n);

  const debtNotifier = await E(borrowFacet).getDebtNotifier();

  const { value: originalDebt, updateCount } =
    await E(debtNotifier).getUpdateSince();
  await assertAmountsEqual(t, originalDebt, maxLoan);

  periodUpdater.updateState(6n);

  const { value: debtCompounded1, updateCount: updateCount1 } =
    await E(debtNotifier).getUpdateSince(updateCount);
  await assertAmountsEqual(
    t,
    debtCompounded1,
    AmountMath.make(loanKit.brand, 40020n),
  );

  // skip ahead a notification
  periodUpdater.updateState(16n);

  // both debt notifications are received
  const { value: debtCompounded2, updateCount: updateCount2 } =
    await E(debtNotifier).getUpdateSince(updateCount1);
  t.deepEqual(await E(borrowFacet).getLastCalculationTimestamp(), toTS(16n));
  await assertAmountsEqual(
    t,
    debtCompounded2,
    AmountMath.make(loanKit.brand, 40062n),
  );

  periodUpdater.updateState(21n);
  const { value: debtCompounded3 } =
    await E(debtNotifier).getUpdateSince(updateCount2);
  await assertAmountsEqual(
    t,
    debtCompounded3,
    AmountMath.make(loanKit.brand, 40083n),
  );
});

// Show that interest is charged from the time the loan was created.
// setupBorrow() calls timer.tick(), so the basetime for the loan will be 4.
test('interest starting from non-zero time', async t => {
  const collateralValue = 100000n;
  const maxLoanValue = 40000n;
  // The fakePriceAuthority pays attention to the fakeTimer
  const timer = buildManualTimer(t.log);
  const toTS = ts => TimeMath.coerceTimestampRecord(ts, timer.getTimerBrand());
  await timer.tick();
  await timer.tick();
  await timer.tick();
  const setup = await setupBorrow(maxLoanValue, timer);
  const {
    borrowInvitation,
    zoe,
    maxLoan,
    collateralKit,
    periodUpdater,
    loanKit,
  } = setup;
  const collateral = AmountMath.make(collateralKit.brand, collateralValue);

  const proposal = harden({
    want: { Loan: maxLoan },
    give: { Collateral: collateral },
  });

  const payments = { Collateral: collateralKit.mint.mintPayment(collateral) };
  const borrowSeat = await E(zoe).offer(borrowInvitation, proposal, payments);
  /** @type {ERef<BorrowFacet>} */
  const borrowFacet = E(borrowSeat).getOfferResult();

  // The loan gets notifications from the updater
  periodUpdater.updateState(6n);

  const debtNotifier = await E(borrowFacet).getDebtNotifier();

  const { value: originalDebt, updateCount } =
    await E(debtNotifier).getUpdateSince();
  t.deepEqual(originalDebt, maxLoan);

  periodUpdater.updateState(9n);
  const { value: debtCompounded2 } =
    await E(debtNotifier).getUpdateSince(updateCount);
  t.deepEqual(debtCompounded2, AmountMath.make(loanKit.brand, 40020n));
  t.deepEqual(await E(borrowFacet).getLastCalculationTimestamp(), toTS(9n));
});

// In this test, the updates are expected at multiples of 5, but they show up at
// multiples of 4 instead. The starting time is 1. We should charge interest
// after 9, 13, 17, 21, 29
test('short periods', async t => {
  const { borrowFacet, maxLoan, periodUpdater, loanKit, timer } =
    await setupBorrowFacet(100000n, 40000n);
  periodUpdater.updateState(0n);
  const toTS = ts => TimeMath.coerceTimestampRecord(ts, timer.getTimerBrand());

  const debtNotifier = await E(borrowFacet).getDebtNotifier();

  const { value: originalDebt, updateCount } =
    await E(debtNotifier).getUpdateSince();
  await assertAmountsEqual(t, originalDebt, maxLoan);

  periodUpdater.updateState(5n);
  t.deepEqual(await E(borrowFacet).getLastCalculationTimestamp(), toTS(1n));

  periodUpdater.updateState(9n);
  const { value: debtCompounded1, updateCount: updateCount1 } =
    await E(debtNotifier).getUpdateSince(updateCount);
  await assertAmountsEqual(
    t,
    debtCompounded1,
    AmountMath.make(loanKit.brand, 40020n),
  );
  t.deepEqual(await E(borrowFacet).getLastCalculationTimestamp(), toTS(6n));

  periodUpdater.updateState(14n);
  const { value: debtCompounded2, updateCount: updateCount2 } =
    await E(debtNotifier).getUpdateSince(updateCount1);
  await assertAmountsEqual(
    t,
    debtCompounded2,
    AmountMath.make(loanKit.brand, 40041n),
  );
  t.deepEqual(await E(borrowFacet).getLastCalculationTimestamp(), toTS(11n));

  periodUpdater.updateState(17n);
  const { value: debtCompounded3, updateCount: updateCount3 } =
    await E(debtNotifier).getUpdateSince(updateCount2);
  await assertAmountsEqual(
    t,
    debtCompounded3,
    AmountMath.make(loanKit.brand, 40062n),
  );
  t.deepEqual(await E(borrowFacet).getLastCalculationTimestamp(), toTS(16n));

  periodUpdater.updateState(21n);
  const { value: debtCompounded4, updateCount: updateCount4 } =
    await E(debtNotifier).getUpdateSince(updateCount3);
  await assertAmountsEqual(
    t,
    debtCompounded4,
    AmountMath.make(loanKit.brand, 40083n),
  );
  t.deepEqual(await E(borrowFacet).getLastCalculationTimestamp(), toTS(21n));

  periodUpdater.updateState(25n);
  t.deepEqual(await E(borrowFacet).getLastCalculationTimestamp(), toTS(21n));

  periodUpdater.updateState(29n);
  const { value: debtCompounded5 } =
    await E(debtNotifier).getUpdateSince(updateCount4);
  await assertAmountsEqual(
    t,
    debtCompounded5,
    AmountMath.make(loanKit.brand, 40104n),
  );
  t.deepEqual(await E(borrowFacet).getLastCalculationTimestamp(), toTS(26n));
});

test.todo('borrow bad proposal');

test.todo('schedule a liquidation that fails, giving collateral to the lender');
