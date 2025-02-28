import { AmountMath } from '@agoric/ertp/src/amountMath.js';
import {
  divideBy,
  makeRatio,
  makeRatioFromAmounts,
  multiplyBy,
} from '@agoric/zoe/src/contractSupport/ratio.js';
import { Fail, q } from '@endo/errors';

const { keys } = Object;
const { add, isEmpty, isEqual, isGTE, make, makeEmpty, subtract } = AmountMath;

/**
 * @import {Amount, Brand, DepositFacet, NatValue, Payment} from '@agoric/ertp';
 * @import {PoolStats} from './types';
 * @import {RepayAmountKWR} from './exos/liquidity-pool';
 */

/**
 * Invariant: shareWorth is the pool balance divided by shares outstanding.
 *
 * Use `makeParity(USDC, PoolShares)` for an initial value.
 *
 * @typedef {Ratio} ShareWorth
 */

/**
 * Make a 1-to-1 ratio between amounts of 2 brands.
 *
 * @param {Brand<'nat'>} numeratorBrand
 * @param {Brand<'nat'>} denominatorBrand
 */
export const makeParity = (numeratorBrand, denominatorBrand) => {
  const dust = 1n;
  return makeRatio(dust, numeratorBrand, dust, denominatorBrand);
};

/**
 * @typedef {{
 *   deposit: {
 *     give: { USDC: Amount<'nat'> },
 *     want: { PoolShare: Amount<'nat'> }
 *   },
 *   withdraw: {
 *     give: { PoolShare: Amount<'nat'> }
 *     want: { USDC: Amount<'nat'> },
 *   },
 *   withdrawFees: {
 *     want: { USDC: Amount<'nat'> }
 *   }
 * }} USDCProposalShapes
 */

/**
 * Compute Shares payout from a deposit proposal, as well as updated shareWorth.
 *
 * Clearly:
 *
 * sharesOutstanding' = sharesOutstanding + Shares
 * poolBalance' = poolBalance + ToPool
 * shareWorth' = poolBalance' / sharesOutstanding'
 *
 * In order to maintain the ShareWorth invariant, we need:
 *
 * Shares = ToPool / shareWorth'
 *
 * Solving for Shares gives:
 *
 * Shares = ToPool * sharesOutstanding / poolBalance
 *
 * that is:
 *
 * Shares = ToPool / shareWorth
 *
 * @param {ShareWorth} shareWorth previous to the deposit
 * @param {USDCProposalShapes['deposit']} proposal
 * @returns {{ payouts: { PoolShare: Amount<'nat'> }; shareWorth: ShareWorth }}
 */
export const depositCalc = (shareWorth, { give, want }) => {
  assert(!isEmpty(give.USDC)); // nice diagnostic provided by proposalShape

  const { denominator: sharesOutstanding, numerator: poolBalance } = shareWorth;

  const fairPoolShare = divideBy(give.USDC, shareWorth);
  if (want?.PoolShare) {
    isGTE(fairPoolShare, want.PoolShare) ||
      Fail`deposit cannot pay out ${q(want.PoolShare)}; ${q(give.USDC)} only gets ${q(fairPoolShare)}`;
  }
  const outstandingPost = add(sharesOutstanding, fairPoolShare);
  const balancePost = add(poolBalance, give.USDC);
  const worthPost = makeRatioFromAmounts(balancePost, outstandingPost);
  return harden({
    payouts: { PoolShare: fairPoolShare },
    shareWorth: worthPost,
  });
};

/**
 * Verifies that the total pool balance (unencumbered + encumbered) matches the
 * shareWorth numerator. The total pool balance consists of:
 * 1. unencumbered balance - USDC available in the pool for borrowing
 * 2. encumbered balance - USDC currently lent out
 *
 * A negligible `dust` amount is used to initialize shareWorth with a non-zero
 * denominator. It must remain in the pool at all times.
 *
 * @param {Allocation} poolAlloc
 * @param {ShareWorth} shareWorth
 * @param {Amount<'nat'>} encumberedBalance
 */
export const checkPoolBalance = (poolAlloc, shareWorth, encumberedBalance) => {
  const { brand: usdcBrand } = encumberedBalance;
  const unencumberedBalance = poolAlloc.USDC || makeEmpty(usdcBrand);
  const kwds = keys(poolAlloc);
  kwds.length === 0 ||
    (kwds.length === 1 && kwds[0] === 'USDC') ||
    Fail`unexpected pool allocations: ${poolAlloc}`;
  const dust = make(usdcBrand, 1n);
  const grossBalance = add(add(unencumberedBalance, dust), encumberedBalance);
  isEqual(grossBalance, shareWorth.numerator) ||
    Fail`🚨 pool balance ${q(unencumberedBalance)} and encumbered balance ${q(encumberedBalance)} inconsistent with shareWorth ${q(shareWorth)}`;
  return harden({ unencumberedBalance, grossBalance });
};

/**
 * Compute payout from a withdraw proposal, along with updated shareWorth
 *
 * @param {ShareWorth} shareWorth
 * @param {USDCProposalShapes['withdraw']} proposal
 * @param {Allocation} poolAlloc
 * @param {Amount<'nat'>} [encumberedBalance]
 * @returns {{ shareWorth: ShareWorth, payouts: { USDC: Amount<'nat'> }}}
 */
export const withdrawCalc = (
  shareWorth,
  { give, want },
  poolAlloc,
  encumberedBalance = makeEmpty(shareWorth.numerator.brand),
) => {
  const { unencumberedBalance } = checkPoolBalance(
    poolAlloc,
    shareWorth,
    encumberedBalance,
  );

  assert(!isEmpty(give.PoolShare));
  assert(!isEmpty(want.USDC));

  const payout = multiplyBy(give.PoolShare, shareWorth);
  isGTE(payout, want.USDC) ||
    Fail`cannot withdraw ${q(want.USDC)}; ${q(give.PoolShare)} only worth ${q(payout)}`;
  const { denominator: sharesOutstanding, numerator: poolBalance } = shareWorth;
  !isGTE(want.USDC, poolBalance) ||
    Fail`cannot withdraw ${q(want.USDC)}; only ${q(poolBalance)} in pool`;
  isGTE(unencumberedBalance, want.USDC) ||
    Fail`cannot withdraw ${q(want.USDC)}; ${q(encumberedBalance)} is in use; stand by for pool to return to ${q(poolBalance)}`;
  const balancePost = subtract(poolBalance, payout);
  // giving more shares than are outstanding is impossible,
  // so it's not worth a custom diagnostic. subtract will fail
  const outstandingPost = subtract(sharesOutstanding, give.PoolShare);

  const worthPost = makeRatioFromAmounts(balancePost, outstandingPost);
  return harden({ shareWorth: worthPost, payouts: { USDC: payout } });
};

/**
 * @param {ShareWorth} shareWorth
 * @param {Amount<'nat'>} fees
 */
export const withFees = (shareWorth, fees) => {
  const balancePost = add(shareWorth.numerator, fees);
  return makeRatioFromAmounts(balancePost, shareWorth.denominator);
};

/**
 *
 * @param {Amount<'nat'>} requested
 * @param {Amount<'nat'>} poolSeatAllocation
 * @param {Amount<'nat'>} encumberedBalance
 * @param {PoolStats} poolStats
 * @throws {Error} if requested is not less than poolSeatAllocation
 */
export const borrowCalc = (
  requested,
  poolSeatAllocation,
  encumberedBalance,
  poolStats,
) => {
  // pool must never go empty
  !isGTE(requested, poolSeatAllocation) ||
    Fail`Cannot borrow. Requested ${q(requested)} must be less than pool balance ${q(poolSeatAllocation)}.`;

  return harden({
    encumberedBalance: add(encumberedBalance, requested),
    poolStats: {
      ...poolStats,
      totalBorrows: add(poolStats.totalBorrows, requested),
    },
  });
};

/**
 * @param {ShareWorth} shareWorth
 * @param {RepayAmountKWR} split
 * @param {Amount<'nat'>} encumberedBalance aka 'outstanding borrows'
 * @param {PoolStats} poolStats
 * @throws {Error} if Principal exceeds encumberedBalance
 */
export const repayCalc = (shareWorth, split, encumberedBalance, poolStats) => {
  isGTE(encumberedBalance, split.Principal) ||
    Fail`Cannot repay. Principal ${q(split.Principal)} exceeds encumberedBalance ${q(encumberedBalance)}.`;

  return harden({
    shareWorth: withFees(shareWorth, split.PoolFee),
    encumberedBalance: subtract(encumberedBalance, split.Principal),
    poolStats: {
      ...poolStats,
      totalRepays: add(poolStats.totalRepays, split.Principal),
      totalPoolFees: add(poolStats.totalPoolFees, split.PoolFee),
      totalContractFees: add(poolStats.totalContractFees, split.ContractFee),
    },
  });
};
