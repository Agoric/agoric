import { test } from '@agoric/zoe/tools/prepare-test-env-ava.js';
import { testProp, fc } from '@fast-check/ava';
import { AmountMath, makeIssuerKit, type Amount } from '@agoric/ertp';
import {
  makeRatioFromAmounts,
  multiplyBy,
  parseRatio,
} from '@agoric/zoe/src/contractSupport/ratio.js';
import { mustMatch } from '@endo/patterns';
import {
  borrowCalc,
  depositCalc,
  makeParity,
  repayCalc,
  withdrawCalc,
  withFees,
} from '../src/pool-share-math.js';
import { makeProposalShapes } from '../src/type-guards.js';

const { add, make, isEmpty, makeEmpty, subtract } = AmountMath;

const issuerKits = {
  PoolShare: makeIssuerKit<'nat'>('PoolShare'),
  USDC: makeIssuerKit<'nat'>('USDC'),
};
const brands = harden({
  PoolShares: issuerKits.PoolShare.brand,
  USDC: issuerKits.USDC.brand,
});
const parity = makeParity(brands.USDC, brands.PoolShares);
const shapes = makeProposalShapes(brands);

test('initial deposit to pool', t => {
  const { PoolShares, USDC } = brands;

  const proposal = harden({
    give: { USDC: make(USDC, 100n) },
    want: { PoolShare: make(PoolShares, 1n) },
  });
  mustMatch(proposal, shapes.deposit);
  const actual = depositCalc(parity, proposal);
  t.deepEqual(actual, {
    payouts: { PoolShare: make(PoolShares, 100n) },
    shareWorth: makeRatioFromAmounts(
      actual.shareWorth.numerator,
      make(PoolShares, actual.shareWorth.numerator.value),
    ),
  });
});

test('initial withdrawal fails', t => {
  const { PoolShares, USDC } = brands;
  const proposal = harden({
    give: { PoolShare: make(PoolShares, 100n) },
    want: { USDC: make(USDC, 100n) },
  });
  t.throws(() => withdrawCalc(parity, proposal, harden({})), {
    message: /cannot withdraw/,
  });
});

test('withdrawal after deposit OK', t => {
  const { PoolShares, USDC } = brands;
  const state0 = makeParity(USDC, PoolShares);
  const emptyShares = makeEmpty(PoolShares);

  const pDep = {
    give: { USDC: make(USDC, 100n) },
    want: { PoolShare: emptyShares },
  };
  const { shareWorth: state1 } = depositCalc(state0, pDep);

  const proposal = harden({
    give: { PoolShare: make(PoolShares, 50n) },
    want: { USDC: make(USDC, 50n) },
  });
  mustMatch(proposal, shapes.withdraw);

  const actual = withdrawCalc(state1, proposal, pDep.give);

  t.deepEqual(actual, {
    payouts: { USDC: make(USDC, 50n) },
    shareWorth: {
      numerator: make(USDC, 51n),
      denominator: make(PoolShares, 51n),
    },
  });
});

test('deposit offer underestimates value of share', t => {
  const { PoolShares, USDC } = brands;
  const emptyShares = makeEmpty(PoolShares);

  const pDep = {
    give: { USDC: make(USDC, 100n) },
    want: { PoolShare: emptyShares },
  };
  const { shareWorth: state1 } = depositCalc(parity, pDep);
  const state2 = withFees(state1, make(USDC, 20n));

  const proposal = harden({
    give: { USDC: make(USDC, 50n) },
    want: { PoolShare: make(PoolShares, 50n) },
  });
  mustMatch(proposal, shapes.deposit);

  t.throws(() => depositCalc(state2, proposal), {
    message: /cannot pay out/,
  });
});

test('deposit offer overestimates value of share', t => {
  const { PoolShares, USDC } = brands;
  const state0 = makeParity(USDC, PoolShares);

  const proposal = harden({
    give: { USDC: make(USDC, 10n) },
    want: { PoolShare: make(PoolShares, 8n) },
  });
  mustMatch(proposal, shapes.deposit);

  const actual = depositCalc(state0, proposal);
  t.deepEqual(actual, {
    payouts: { PoolShare: make(PoolShares, 10n) },
    shareWorth: {
      numerator: make(USDC, 11n),
      denominator: make(PoolShares, 11n),
    },
  });
});

test('withdrawal offer underestimates value of share', t => {
  const { PoolShares, USDC } = brands;
  const emptyShares = makeEmpty(PoolShares);
  const state0 = makeParity(USDC, PoolShares);

  const proposal1 = harden({
    give: { USDC: make(USDC, 100n) },
    want: { PoolShare: emptyShares },
  });
  const { shareWorth: state1 } = depositCalc(state0, proposal1);

  const proposal = harden({
    give: { PoolShare: make(PoolShares, 60n) },
    want: { USDC: make(USDC, 50n) },
  });
  mustMatch(proposal, shapes.withdraw);

  const actual = withdrawCalc(state1, proposal, proposal1.give);

  t.deepEqual(actual, {
    payouts: { USDC: make(USDC, 60n) },
    shareWorth: {
      numerator: make(USDC, 41n),
      denominator: make(PoolShares, 41n),
    },
  });
});

test('withdrawal offer overestimates value of share', t => {
  const { PoolShares, USDC } = brands;
  const emptyShares = makeEmpty(PoolShares);
  const state0 = makeParity(USDC, PoolShares);

  const d100 = {
    give: { USDC: make(USDC, 100n) },
    want: { PoolShare: emptyShares },
  };
  const { shareWorth: state1 } = depositCalc(state0, d100);

  const proposal = harden({
    give: { PoolShare: make(PoolShares, 50n) },
    want: { USDC: make(USDC, 60n) },
  });
  mustMatch(proposal, shapes.withdraw);

  t.throws(() => withdrawCalc(state1, proposal, d100.give), {
    message: /cannot withdraw/,
  });
});

test('withdrawal during advance can fail', t => {
  const { PoolShares, USDC } = brands;
  const state0 = makeParity(USDC, PoolShares);
  const emptyShares = makeEmpty(PoolShares);

  const pDep = {
    give: { USDC: make(USDC, 100n) },
    want: { PoolShare: make(PoolShares, 10n) },
  };
  const { shareWorth: state1 } = depositCalc(state0, pDep);

  const proposal = harden({
    give: { PoolShare: make(PoolShares, 70n) },
    want: { USDC: make(USDC, 70n) },
  });
  mustMatch(proposal, shapes.withdraw);

  const encumbered = make(USDC, 40n);
  const alloc = harden({ USDC: subtract(pDep.give.USDC, encumbered) });
  t.throws(() => withdrawCalc(state1, proposal, alloc, encumbered), {
    message: /cannot withdraw .* stand by/,
  });
});

const scaleAmount = (frac: number, amount: Amount<'nat'>) => {
  const asRatio = parseRatio(frac, amount.brand);
  return multiplyBy(amount, asRatio);
};

// ack: https://stackoverflow.com/a/2901298/7963
const numberWithCommas = x =>
  x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

const logAmt = amt => [
  Number(amt.value),
  //   numberWithCommas(Number(amt.value)),
  amt.brand
    .toString()
    .replace(/^\[object Alleged:/, '')
    .replace(/ brand]$/, ''),
];

const arbAmountOf = brand =>
  fc
    .record({
      brand: fc.constant(brand),
      value: fc.bigInt({ min: 1n, max: 1_000n * 1_000_000n }),
    })
    .map(x => harden(x));
const arbUSDC = arbAmountOf(brands.USDC);
const arbShares = arbAmountOf(brands.PoolShares);

const arbShareWorth = fc
  .record({ numerator: arbUSDC, denominator: arbShares })
  .map(x => harden(x));

testProp(
  'deposit properties',
  [arbShareWorth, arbUSDC],
  (t, shareWorth, In) => {
    const { PoolShares } = brands;
    const emptyShares = makeEmpty(PoolShares);
    const actual = depositCalc(shareWorth, {
      give: { USDC: In },
      want: { PoolShare: emptyShares },
    });
    const {
      payouts: { PoolShare },
      shareWorth: post,
    } = actual;
    const { numerator: poolAmount, denominator: sharesOutstanding } = post;
    t.deepEqual(poolAmount, add(shareWorth.numerator, In));
    t.deepEqual(sharesOutstanding, add(shareWorth.denominator, PoolShare));
  },
);

const arbPortion = fc.double({ min: 0.0001, max: 1.0, noNaN: true });
const arbDelta = fc.double({ min: 0.75, max: 1.0, noNaN: true });

testProp(
  'sequence of deposits and withdrawals',
  [
    fc.array(
      fc.record({
        party: fc.nat(7),
        action: fc.oneof(
          fc.record({ In: arbUSDC }),
          fc.record({ Part: arbPortion, Slip: arbDelta }),
        ),
      }),
      { minLength: 3 },
    ),
  ],
  (t, actions) => {
    const { PoolShares, USDC } = brands;
    const emptyShares = makeEmpty(PoolShares);
    const emptyUSDC = makeEmpty(USDC);
    let shareWorth = makeParity(USDC, PoolShares);
    const myDeposits: Record<number, Amount<'nat'>> = {};
    const myShares: Record<number, Amount<'nat'>> = {};

    for (const { party, action } of actions) {
      if ('In' in action) {
        const d = depositCalc(shareWorth, {
          give: { USDC: action.In },
          want: { PoolShare: emptyShares },
        });
        myShares[party] = add(
          myShares[party] || emptyShares,
          d.payouts.PoolShare,
        );
        myDeposits[party] = add(myDeposits[party] || emptyUSDC, action.In);

        const {
          payouts: { PoolShare },
          shareWorth: post,
        } = d;
        const { numerator: poolAmount, denominator: sharesOutstanding } = post;

        t.deepEqual(poolAmount, add(shareWorth.numerator, action.In));
        t.deepEqual(sharesOutstanding, add(shareWorth.denominator, PoolShare));

        shareWorth = post;
      } else if ('Part' in action) {
        if (!myShares[party]) continue;
        const toGive = scaleAmount(action.Part, myShares[party]);
        if (isEmpty(toGive)) continue;
        const toGet = scaleAmount(action.Slip, multiplyBy(toGive, shareWorth));
        const s = withdrawCalc(
          shareWorth,
          { give: { PoolShare: toGive }, want: { USDC: toGet } },
          harden({ USDC: subtract(shareWorth.numerator, make(USDC, 1n)) }),
        );
        myShares[party] = subtract(myShares[party], toGive);
        myDeposits[party] = subtract(myDeposits[party], s.payouts.USDC);
        const { numerator: poolAmount, denominator: sharesOutstanding } =
          s.shareWorth;
        t.deepEqual(poolAmount, subtract(shareWorth.numerator, s.payouts.USDC));
        t.deepEqual(
          sharesOutstanding,
          subtract(shareWorth.denominator, toGive),
        );
        shareWorth = s.shareWorth;
      }
    }

    if (Object.keys(myShares).length === 0) t.pass();

    for (const p of Object.keys(myShares)) {
      const myValue = multiplyBy(myShares[p], shareWorth);
      // t.log(p, ...[myShares[p], myDeposits[p], myValue].map(logAmt).flat());
      t.deepEqual(myValue, myDeposits[p]);
    }

    const allShares = Object.values(myShares).reduce(
      (acc, v) => add(acc, v),
      make(PoolShares, 1n),
    );
    t.deepEqual(allShares, shareWorth.denominator);

    if (actions.length < 14) return;
    t.log(
      actions.length,
      'actions',
      Object.keys(myShares).length,
      'parties:',
      ...logAmt(allShares),
    );
  },
);

const makeInitialPoolStats = () => ({
  totalBorrows: makeEmpty(brands.USDC),
  totalRepays: makeEmpty(brands.USDC),
  totalPoolFees: makeEmpty(brands.USDC),
  totalContractFees: makeEmpty(brands.USDC),
});

test('basic borrow calculation', t => {
  const { USDC } = brands;
  const requested = make(USDC, 100n);
  const poolSeatAllocation = make(USDC, 200n);
  const encumberedBalance = make(USDC, 50n);
  const poolStats = makeInitialPoolStats();

  const result = borrowCalc(
    requested,
    poolSeatAllocation,
    encumberedBalance,
    poolStats,
  );

  t.deepEqual(
    result.encumberedBalance,
    make(USDC, 150n),
    'Outstanding lends should increase by borrowed amount',
  );
  t.deepEqual(
    result.poolStats.totalBorrows,
    make(USDC, 100n),
    'Total borrows should increase by borrowed amount',
  );
  t.deepEqual(
    Object.keys(result.poolStats),
    Object.keys(poolStats),
    'borrowCalc returns all poolStats fields',
  );
});

test('borrow fails when requested exceeds or equals pool seat allocation', t => {
  const { USDC } = brands;
  const requested = make(USDC, 200n);
  const poolSeatAllocation = make(USDC, 100n);
  const encumberedBalance = make(USDC, 0n);
  const poolStats = makeInitialPoolStats();

  t.throws(
    () =>
      borrowCalc(requested, poolSeatAllocation, encumberedBalance, poolStats),
    {
      message: /Cannot borrow/,
    },
  );
  t.throws(
    () => borrowCalc(requested, make(USDC, 200n), encumberedBalance, poolStats),
    {
      message: /Cannot borrow/,
    },
    'throw when request equals pool seat allocation',
  );
  t.notThrows(() =>
    borrowCalc(requested, make(USDC, 201n), encumberedBalance, poolStats),
  );
});

test('basic repay calculation', t => {
  const { USDC } = brands;
  const shareWorth = makeParity(USDC, brands.PoolShares);
  const amounts = {
    Principal: make(USDC, 100n),
    PoolFee: make(USDC, 10n),
    ContractFee: make(USDC, 5n),
  };
  const encumberedBalance = make(USDC, 200n);
  const poolStats = makeInitialPoolStats();

  const result = repayCalc(shareWorth, amounts, encumberedBalance, poolStats);

  t.deepEqual(
    result.encumberedBalance,
    make(USDC, 100n),
    'Outstanding lends should decrease by principal',
  );
  t.deepEqual(
    result.poolStats.totalRepays,
    amounts.Principal,
    'Total repays should increase by principal',
  );
  t.deepEqual(
    result.poolStats.totalPoolFees,
    amounts.PoolFee,
    'Total pool fees should increase by pool fee',
  );
  t.deepEqual(
    result.poolStats.totalContractFees,
    amounts.ContractFee,
    'Total contract fees should increase by contract fee',
  );
  t.deepEqual(
    result.poolStats.totalBorrows,
    poolStats.totalBorrows,
    'Total borrows should remain unchanged',
  );
  t.deepEqual(
    result.shareWorth.numerator,
    make(USDC, 11n),
    'Share worth numerator should increase by pool fee',
  );
  t.deepEqual(
    Object.keys(result.poolStats),
    Object.keys(poolStats),
    'repayCalc returns all poolStats fields',
  );
});

test('repay fails when principal exceeds encumbered balance', t => {
  const { USDC } = brands;

  const shareWorth = makeParity(USDC, brands.PoolShares);
  const amounts = {
    Principal: make(USDC, 200n),
    PoolFee: make(USDC, 10n),
    ContractFee: make(USDC, 5n),
  };
  const encumberedBalance = make(USDC, 100n);
  const poolStats = {
    ...makeInitialPoolStats(),
    totalBorrows: make(USDC, 100n),
  };

  const fromSeatAllocation = amounts;

  t.throws(() => repayCalc(shareWorth, amounts, encumberedBalance, poolStats), {
    message: /Cannot repay. Principal .* exceeds encumberedBalance/,
  });

  t.notThrows(
    () =>
      repayCalc(shareWorth, amounts, make(USDC, 200n), {
        ...makeInitialPoolStats(),
        totalBorrows: make(USDC, 200n),
      }),
    'repay succeeds when principal equals encumbered balance',
  );
});

test('repay fails when seat allocation does not equal amounts', t => {
  const { USDC } = brands;

  const shareWorth = makeParity(USDC, brands.PoolShares);
  const amounts = {
    Principal: make(USDC, 200n),
    PoolFee: make(USDC, 10n),
    ContractFee: make(USDC, 5n),
  };
  const encumberedBalance = make(USDC, 100n);
  const poolStats = {
    ...makeInitialPoolStats(),
    totalBorrows: make(USDC, 100n),
  };

  t.throws(() => repayCalc(shareWorth, amounts, encumberedBalance, poolStats), {
    message: /Cannot repay. Principal .* exceeds encumberedBalance/,
  });
});

test('repay succeeds with no Pool or Contract Fee', t => {
  const { USDC } = brands;
  const encumberedBalance = make(USDC, 100n);
  const shareWorth = makeParity(USDC, brands.PoolShares);

  const amounts = {
    Principal: make(USDC, 25n),
    ContractFee: make(USDC, 0n),
    PoolFee: make(USDC, 0n),
  };
  const poolStats = {
    ...makeInitialPoolStats(),
    totalBorrows: make(USDC, 100n),
  };
  const fromSeatAllocation = amounts;
  const actual = repayCalc(shareWorth, amounts, encumberedBalance, poolStats);
  t.like(actual, {
    shareWorth,
    encumberedBalance: {
      value: 75n,
    },
  });
});
