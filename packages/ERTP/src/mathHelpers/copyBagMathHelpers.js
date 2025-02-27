// @jessie-check

import {
  keyEQ,
  makeCopyBag,
  mustMatch,
  M,
  getCopyBagEntries,
  bagIsSuperbag,
  bagUnion,
  bagDisjointSubtract,
} from '@agoric/store';

/**
 * @import {Key, CopyBag} from '@endo/patterns'
 * @import {MathHelpers} from '../types.js'
 */

/** @type {CopyBag} */
const empty = makeCopyBag([]);

/** @type {MathHelpers<'copyBag', Key, CopyBag<Key>>} */
export const copyBagMathHelpers = harden({
  doCoerce: bag => {
    mustMatch(bag, M.bag(), 'bag of amount');
    return bag;
  },
  doMakeEmpty: () => empty,
  doIsEmpty: bag => getCopyBagEntries(bag).length === 0,
  doIsGTE: bagIsSuperbag,
  doIsEqual: keyEQ,
  doAdd: bagUnion,
  doSubtract: bagDisjointSubtract,
});
