// @ts-check

import {
  keyEQ,
  makeCopyBag,
  fit,
  M,
  getCopyBagEntries,
  bagIsSuperbag,
  bagUnion,
  bagDisjointSubtract,
} from '@agoric/store';
import '../types.js';

/** @type {CopyBagValue} */
const empty = makeCopyBag([]);

/** @type {CopyBagMathHelpers} */
export const copyBagMathHelpers = harden({
  doCoerce: bag => {
    fit(bag, M.bag());
    return bag;
  },
  doMakeEmpty: () => empty,
  doIsEmpty: bag => getCopyBagEntries(bag).length === 0,
  doIsGTE: bagIsSuperbag,
  doIsEqual: keyEQ,
  doAdd: bagUnion,
  doSubtract: bagDisjointSubtract,
});
