// @ts-check

import { AmountMath } from '@agoric/ertp';
import { calculateFees, amountGT } from './calcFees.js';

const { details: X } = assert;

/**
 * The fee might not be in the same brand as the amount. If they are the same,
 * subtract the fee from the amount. Otherwise return the unadjusted amount.
 *
 * We return empty if the fee is larger because an empty amount indicates that
 * the trader didn't place a limit on the inputAmount.
 *
 * @param {Amount} amount
 * @param {Amount} fee
 * @returns {Amount}
 */
const subtractRelevantFees = (amount, fee) => {
  if (amount.brand === fee.brand) {
    if (AmountMath.isGTE(fee, amount)) {
      return AmountMath.makeEmptyFromAmount(amount);
    }

    return AmountMath.subtract(amount, fee);
  }
  return amount;
};

/**
 * PoolFee and ProtocolFee each identify their brand. If either (or both) match
 * the brand of the Amount, subtract it/them from the amount.
 *
 * @param {Amount} amount
 * @param {FeePair} fee
 * @returns {Amount}
 */
const subtractFees = (amount, { poolFee, protocolFee }) => {
  return subtractRelevantFees(
    subtractRelevantFees(amount, protocolFee),
    poolFee,
  );
};

/**
 * The fee might not be in the same brand as the amount. If they are the same,
 * add the fee to the amount. Otherwise return the unadjusted amount.
 *
 * @param {Amount} amount
 * @param {Amount} fee
 * @returns {Amount}
 */
const addRelevantFees = (amount, fee) => {
  if (amount.brand === fee.brand) {
    return AmountMath.add(amount, fee);
  }
  return amount;
};

/**
 * PoolFee and ProtocolFee each identify their brand. If either (or both) match
 * the brand of the Amount, add it/them to the amount.
 *
 * @param {Amount} amount
 * @param {FeePair} fee
 * @returns {Amount}
 */
const addFees = (amount, { poolFee, protocolFee }) => {
  return addRelevantFees(addRelevantFees(amount, protocolFee), poolFee);
};

/**
 * Increment or decrement a pool balance by an amount. The amount's brand might
 * match the Central or Secondary balance of the pool. Return the adjusted
 * balance. The caller knows which amount they provided, so they're expecting a
 * single Amount whose brand matches the amount parameter.
 *
 * The first parameter specifies whether we're incrementing or decrementing from the pool
 *
 * @param {(
 *   amountLeft: Amount,
 *   amountRight: Amount,
 *   brand?: Brand,
 * ) => Amount} addOrSub
 * @param {PoolAllocation} poolAllocation
 * @param {Amount} amount
 * @returns {Amount}
 */
const addOrSubtractFromPool = (addOrSub, poolAllocation, amount) => {
  if (poolAllocation.Central.brand === amount.brand) {
    return addOrSub(poolAllocation.Central, amount);
  } else {
    return addOrSub(poolAllocation.Secondary, amount);
  }
};

const isGreaterThanZero = amount => {
  return amount && amountGT(amount, AmountMath.makeEmptyFromAmount(amount));
};

const assertGreaterThanZero = (amount, name) => {
  assert(
    amount && isGreaterThanZero(amount),
    X`${name} must be greater than 0: ${amount}`,
  );
};

const isWantedAvailable = (poolAllocation, amountWanted) => {
  // The question is about a poolAllocation. If it has exactly amountWanted,
  // that's not sufficient, since it would leave the pool empty.
  return amountWanted.brand === poolAllocation.Central.brand
    ? !AmountMath.isGTE(amountWanted, poolAllocation.Central)
    : !AmountMath.isGTE(amountWanted, poolAllocation.Secondary);
};

/**
 * We've identified a violation of constraints that means we won't be able to
 * satisfy the user's request. (Not enough funds in the pool, too much was
 * requested, the proceeds would be empty, etc.) Return a result that says no
 * trade will take place and the pool balances won't change.
 *
 * @param {Amount} amountGiven
 * @param {Amount} amountWanted
 * @param {PoolAllocation} poolAllocation
 * @param {Ratio} poolFee
 */
const makeNoTransaction = (
  amountGiven,
  amountWanted,
  poolAllocation,
  poolFee,
) => {
  const emptyGive = AmountMath.makeEmptyFromAmount(amountGiven);
  const emptyWant = AmountMath.makeEmptyFromAmount(amountWanted);

  let newX;
  let newY;
  if (poolAllocation.Central.brand === amountGiven.brand) {
    newX = poolAllocation.Central;
    newY = poolAllocation.Secondary;
  } else {
    newX = poolAllocation.Secondary;
    newY = poolAllocation.Central;
  }

  const result = harden({
    protocolFee: AmountMath.makeEmpty(poolAllocation.Central.brand),
    poolFee: AmountMath.makeEmpty(poolFee.numerator.brand),
    swapperGives: emptyGive,
    swapperGets: emptyWant,
    xIncrement: emptyGive,
    yDecrement: emptyWant,
    newX,
    newY,
  });
  return result;
};

/**
 * This is the heart of the calculation. See README.md for the long explanation.
 * calculate how much should be added to and removed from the pool, the fees,
 * and what the user will pay and receive.
 *
 * As soon as we detect that we won't be able to satisfy the request, we return
 * noTransaction, indicating that no trade should take place. This can be due to
 * a request for more assets than the pool holds, a specified price the current
 * assets won't support, or the trade would requre more than the trader allowed,
 * or provide less, or fees would eat up all the trader's proceeds.
 *
 * We start by calculating the amounts that would be traded if no fees were
 * charged. The actual fees are based on these amounts. Once we know the actual
 * fees, we calculate the deltaX and deltaY that will best maintain the constant
 * product invariant.
 *
 * The amounts by which the pool will be adjusted, that the trader will pay and
 * receive, and the fees are then computed based on deltaX and deltaY.
 *
 * @type {InternalSwap}
 */
export const swap = (
  amountGiven,
  poolAllocation,
  amountWanted,
  protocolFeeRatio,
  poolFeeRatio,
  swapFn,
) => {
  const noTransaction = makeNoTransaction(
    amountGiven,
    amountWanted,
    poolAllocation,
    poolFeeRatio,
  );
  assertGreaterThanZero(poolAllocation.Central, 'poolAllocation.Central');
  assertGreaterThanZero(poolAllocation.Secondary, 'poolAllocation.Secondary');

  if (!isGreaterThanZero(amountGiven) && !isGreaterThanZero(amountWanted)) {
    return noTransaction;
  }

  if (!isWantedAvailable(poolAllocation, amountWanted)) {
    return noTransaction;
  }

  // The protocol fee must always be collected in RUN, but the pool
  // fee is collected in the amount opposite of what is specified.
  // This call gives us improved amountIn or amountOut
  const fees = calculateFees(
    amountGiven,
    poolAllocation,
    amountWanted,
    protocolFeeRatio,
    poolFeeRatio,
    swapFn,
  );

  if (!isWantedAvailable(poolAllocation, addFees(amountWanted, fees))) {
    return noTransaction;
  }

  // Calculate no-fee amounts. swapFn will only pay attention to the `specified`
  // value. The pool fee is always charged on the unspecified side, so it is an
  // output of the calculation. When BLD was specified, we add the protocol fee
  // to amountWanted. When the specified value is in RUN, the protocol fee will
  // be deducted from amountGiven before adding to the pool or added to
  // amountWanted to calculate amoutOut.
  const { amountIn, amountOut } = swapFn({
    amountGiven: subtractFees(amountGiven, fees),
    poolAllocation,
    amountWanted: addFees(amountWanted, fees),
  });

  if (AmountMath.isEmpty(amountOut)) {
    return noTransaction;
  }

  // The swapper pays extra or receives less to cover the fees.
  const swapperGives = addFees(amountIn, fees);
  const swapperGets = subtractFees(amountOut, fees);

  // return noTransaction if fees would eat up all the trader's proceeds,
  // the trader specified an amountGiven, and the trade would require more, or
  // the trade would require them to give more than they specified.
  if (
    AmountMath.isEmpty(swapperGets) ||
    (!AmountMath.isEmpty(amountGiven) && amountGT(swapperGives, amountGiven)) ||
    amountGT(amountWanted, swapperGets)
  ) {
    return noTransaction;
  }

  const xIncrement = addRelevantFees(amountIn, fees.poolFee);
  const yDecrement = subtractRelevantFees(amountOut, fees.poolFee);

  // poolFee is the amount the pool will grow over the no-fee calculation.
  // protocolFee is to be separated and sent to an external purse.
  // The swapper amounts are what will be paid and received.
  // xIncrement and yDecrement are what will be added and removed from the pools.
  //   Either xIncrement will be increased by the pool fee or yDecrement will be
  //   reduced by it in order to compensate the pool.
  // newX and newY are the new pool balances, for comparison with start values.
  const result = harden({
    protocolFee: fees.protocolFee,
    poolFee: fees.poolFee,
    swapperGives,
    swapperGets,
    xIncrement,
    yDecrement,
    newX: addOrSubtractFromPool(AmountMath.add, poolAllocation, xIncrement),
    newY: addOrSubtractFromPool(
      AmountMath.subtract,
      poolAllocation,
      yDecrement,
    ),
  });

  return result;
};
