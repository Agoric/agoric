// @jessie-check

import { passStyleOf } from '@endo/pass-style';
import { isKey, assertKey, mustMatch, matches } from '@endo/patterns';
import {
  elementsIsSuperset,
  elementsDisjointUnion,
  elementsDisjointSubtract,
  coerceToElements,
  elementsCompare,
} from '@agoric/store';
import { AmountValueHasBoundShape } from '../typeGuards.js';

/**
 * @import {Key} from '@endo/patterns'
 * @import {MathHelpers, SetValue} from '../types.js'
 */

// Operations for arrays with unique objects identifying and providing
// information about digital assets. Used for Zoe invites.
/** @type {SetValue} */
const empty = harden([]);

/**
 * @deprecated Replace array-based SetMath with CopySet-based CopySetMath
 * @type {MathHelpers<'set', Key, SetValue<Key>>}
 */
export const setMathHelpers = harden({
  doCoerce: list => {
    list = coerceToElements(list);
    // Assert that list contains only
    //   * pass-by-copy primitives,
    //   * pass-by-copy containers containing keys,
    //   * remotables.
    assertKey(list);
    return list;
  },
  doMakeEmpty: () => empty,
  doIsEmpty: list => passStyleOf(list) === 'copyArray' && list.length === 0,
  doIsGTE: (left, rightBound) => {
    if (isKey(rightBound)) {
      return elementsIsSuperset(left, rightBound);
    }
    mustMatch(rightBound, AmountValueHasBoundShape, 'right value bound');
    const {
      payload: [elementPatt, bound],
    } = rightBound;
    if (bound === 0n) {
      return true;
    }
    let count = 0n;
    for (const element of left) {
      if (matches(element, elementPatt)) {
        count += 1n;
      }
      if (count >= bound) {
        return true;
      }
    }
  },
  doIsEqual: (x, y) => elementsCompare(x, y) === 0,
  doAdd: elementsDisjointUnion,
  doSubtract: (left, rightBound) => {
    if (isKey(rightBound)) {
      return elementsDisjointSubtract(left, rightBound);
    }
    mustMatch(rightBound, AmountValueHasBoundShape, 'right value bound');
    const {
      payload: [elementPatt, bound],
    } = rightBound;
    if (bound === 0n) {
      return [];
    }
    let count = 0n;
    const result = [];
    for (const element of left) {
      if (matches(element, elementPatt)) {
        count += 1n;
      } else {
        result.push(element);
      }
      if (count >= bound) {
        return result;
      }
    }
  },
});
