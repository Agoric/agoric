// @ts-check

import { assertChecker, makeTagged, passStyleOf } from '@agoric/marshal';
import {
  compareAntiRank,
  isRankSorted,
  makeFullOrderComparatorKit,
  sortByRank,
} from '../patterns/rankOrder.js';

/// <reference types="ses"/>

const { details: X } = assert;

/**
 * @template T
 * @param {T[]} elements
 * @param {Checker=} check
 * @returns {boolean}
 */
const checkNoDuplicates = (elements, check = x => x) => {
  // This fullOrder contains history dependent state. It is specific
  // to this one `merge` call and does not survive it.
  const fullCompare = makeFullOrderComparatorKit().antiComparator;

  elements = sortByRank(elements, fullCompare);
  const { length } = elements;
  for (let i = 1; i < length; i += 1) {
    const k0 = elements[i - 1];
    const k1 = elements[i];
    if (fullCompare(k0, k1) === 0) {
      return check(false, X`value has duplicates: ${k0}`);
    }
  }
  return true;
};

/**
 * @param {Passable[]} elements
 * @param {Checker=} check
 * @returns {boolean}
 */
export const checkElements = (elements, check = x => x) => {
  if (passStyleOf(elements) !== 'copyArray') {
    return check(
      false,
      X`The keys of a copySet or copyMap must be a copyArray: ${elements}`,
    );
  }
  if (!isRankSorted(elements, compareAntiRank)) {
    return check(
      false,
      X`The keys of a copySet or copyMap must be sorted in reverse rank order: ${elements}`,
    );
  }
  return checkNoDuplicates(elements, check);
};
harden(checkElements);

export const assertElements = elements =>
  checkElements(elements, assertChecker);
harden(assertElements);

export const coerceToElements = elementsList => {
  const elements = sortByRank(elementsList, compareAntiRank);
  assertElements(elements);
  return elements;
};
harden(coerceToElements);

/**
 * @template K
 * @param {Iterable<K>} elementIter
 * @returns {CopySet<K>}
 */
export const makeSetOfElements = elementIter =>
  makeTagged('copySet', coerceToElements(elementIter));
harden(makeSetOfElements);
