// @ts-check
import { assert, details as X } from '@agoric/assert';
import { AmountMath } from '@agoric/ertp';

/**
 * @callback Operation An operation such as add or subtract.
 * @param {Amount | undefined} amount
 * @param {Amount | undefined} diff
 * @param {Keyword} keyword
 * @returns {Amount}
 */

/**
 * Add amounts to an allocation, or subtract amounts from an allocation, by
 * keyword. The operationFn performs the actual adding or subtracting.
 *
 * @param {Allocation} allocation
 * @param {AmountKeywordRecord} amountKeywordRecord
 * @param {Operation} operationFn
 * @returns {AmountKeywordRecord}
 */
const doOperation = (allocation, amountKeywordRecord, operationFn) => {
  const allKeywords = Object.keys({ ...allocation, ...amountKeywordRecord });

  const entries = allKeywords
    .map(keyword => {
      const result = operationFn(
        allocation[keyword],
        amountKeywordRecord[keyword],
        keyword,
      );
      return [keyword, result];
    })
    .filter(([_keyword, result]) => result !== undefined);

  return Object.fromEntries(entries);
};

/** @type {Operation} */
const add = (amount, amountToAdd, _keyword) => {
  // Add if both are defined.
  if (amount && amountToAdd) {
    return AmountMath.add(amount, amountToAdd);
  }
  // If one is undefined (at least one will be defined), return the
  // other, defined amount
  return /** @type {Amount} */ (amount || amountToAdd);
};

/** @type {Operation} */
const subtract = (amount, amountToSubtract, keyword) => {
  // if amountToSubtract is undefined OR is defined, but empty
  if (amountToSubtract === undefined || AmountMath.isEmpty(amountToSubtract)) {
    // Subtracting undefined is equivalent to subtracting empty, so in
    // both cases we can return the original amount. If the original
    // amount is undefined, it is filtered out in doOperation.
    return /** @type {Amount} */ (amount);
  } else {
    assert(
      amount !== undefined,
      X`The amount could not be subtracted from the allocation because the allocation did not have an amount under the keyword ${keyword}.`,
    );
    assert(
      AmountMath.isGTE(amount, amountToSubtract),
      X`The amount to be subtracted ${amountToSubtract} was greater than the allocation's amount ${amount} for the keyword ${keyword}`,
    );
    return AmountMath.subtract(amount, amountToSubtract);
  }
};

/**
 * @param {Allocation} allocation
 * @param {AmountKeywordRecord} amountKeywordRecord
 * @returns {AmountKeywordRecord}
 */
export const addToAllocation = (allocation, amountKeywordRecord) => {
  return doOperation(allocation, amountKeywordRecord, add);
};

/**
 * @param {Allocation} allocation
 * @param {AmountKeywordRecord} amountKeywordRecord
 * @returns {AmountKeywordRecord}
 */
export const subtractFromAllocation = (allocation, amountKeywordRecord) => {
  return doOperation(allocation, amountKeywordRecord, subtract);
};
