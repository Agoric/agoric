// @ts-check

import {
  keyEQ,
  makeCopySet,
  fit,
  M,
  getCopySetKeys,
  setIsSuperset,
  setDisjointUnion,
  setDisjointSubtract,
} from '@agoric/store';
import '../types.js';

/** @type {CopySetValue} */
const empty = makeCopySet([]);

/** @type {CopySetMathHelpers} */
export const copySetMathHelpers = harden({
  doCoerce: set => {
    fit(set, M.set());
    return set;
  },
  doMakeEmpty: () => empty,
  doIsEmpty: set => getCopySetKeys(set).length === 0,
  doIsGTE: setIsSuperset,
  doIsEqual: keyEQ,
  doAdd: setDisjointUnion,
  doSubtract: setDisjointSubtract,
});
