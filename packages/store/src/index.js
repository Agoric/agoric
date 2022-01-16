// @ts-check

export {
  isKey,
  assertKey,
  makeCopySet,
  getCopySetKeys,
} from './keys/checkKey.js';
export { coerceToElements } from './keys/copySet.js';
export {
  compareKeys,
  keyLT,
  keyLTE,
  keyEQ,
  keyGTE,
  keyGT,
} from './keys/compareKeys.js';
export {
  elementsIsSuperset,
  elementsIsDisjoint,
  elementsCompare,
  elementsUnion,
  elementsDisjointUnion,
  elementsIntersection,
  elementsDisjointSubtract,
  setIsSuperset,
  setIsDisjoint,
  setCompare,
  setUnion,
  setDisjointUnion,
  setIntersection,
  setDisjointSubtract,
} from './keys/merge-set-operators.js';

export {
  M,
  isPattern,
  assertPattern,
  matches,
  fit,
} from './patterns/patternMatchers.js';
export { compareRank, isRankSorted, sortByRank } from './patterns/rankOrder.js';

export { makeScalarWeakSetStore } from './stores/scalarWeakSetStore.js';
export { makeScalarSetStore } from './stores/scalarSetStore.js';
export {
  makeScalarWeakMapStore,
  makeScalarWeakMapStore as makeScalarWeakMap, // Deprecated legacy
  makeScalarWeakMapStore as makeWeakStore, // Deprecated legacy
} from './stores/scalarWeakMapStore.js';
export {
  makeScalarMapStore,
  makeScalarMapStore as makeScalarMap, // Deprecated legacy
  makeScalarMapStore as makeStore, // Deprecated legacy
} from './stores/scalarMapStore.js';

// /////////////////////// Deprecated Legacy ///////////////////////////////////

// export default as well as makeLegacy* only for compatibility
// during the transition.
export { makeLegacyMap, makeLegacyMap as default } from './legacy/legacyMap.js';
export { makeLegacyWeakMap } from './legacy/legacyWeakMap.js';
