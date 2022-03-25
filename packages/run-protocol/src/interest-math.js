// @ts-check

import {
  floorDivideBy,
  floorMultiplyBy,
  invertRatio,
  multiplyRatios,
  ratiosSame,
} from '@agoric/zoe/src/contractSupport/ratio.js';

/**
 * @param {Ratio} currentCompoundedInterest As coefficient
 * @param {Ratio} previousCompoundedInterest As coefficient
 * @returns {Ratio} Additional compounding since the previous
 */
const calculateRelativeCompounding = (
  currentCompoundedInterest,
  previousCompoundedInterest,
) => {
  // divide compounded interest by the snapshot
  return multiplyRatios(
    currentCompoundedInterest,
    invertRatio(previousCompoundedInterest),
  );
};

/**
 * @param {Amount<'nat'>} debtSnapshot
 * @param {Ratio} interestSnapshot As coefficient
 * @param {Ratio} currentCompoundedInterest As coefficient
 * @returns {Amount<'nat'>}
 */
export const calculateCurrentDebt = (
  debtSnapshot,
  interestSnapshot,
  currentCompoundedInterest,
) => {
  if (ratiosSame(interestSnapshot, currentCompoundedInterest)) {
    return debtSnapshot;
  }

  const interestSinceSnapshot = calculateRelativeCompounding(
    currentCompoundedInterest,
    interestSnapshot,
  );

  return floorMultiplyBy(debtSnapshot, interestSinceSnapshot);
};

/**
 * @param {Amount<'nat'>} debt
 * @param {Ratio} interestApplied
 * @returns {Amount<'nat'>}
 */
export const reverseInterest = (debt, interestApplied) => {
  return floorDivideBy(debt, interestApplied);
};
