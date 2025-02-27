// @jessie-check

import {
  keyEQ,
  makeCopySet,
  mustMatch,
  M,
  getCopySetKeys,
  setIsSuperset,
  setDisjointUnion,
  setDisjointSubtract,
} from '@agoric/store';

/**
 * @import {Key, CopySet} from '@endo/patterns'
 * @import {MathHelpers} from '../types.js'
 */

/** @type {CopySet} */
const empty = makeCopySet([]);

/** @type {MathHelpers<'copySet', Key, CopySet<Key>>} */
export const copySetMathHelpers = harden({
  doCoerce: set => {
    mustMatch(set, M.set(), 'set of amount');
    return set;
  },
  doMakeEmpty: () => empty,
  doIsEmpty: set => getCopySetKeys(set).length === 0,
  doIsGTE: setIsSuperset,
  doIsEqual: keyEQ,
  doAdd: setDisjointUnion,
  doSubtract: setDisjointSubtract,
});
