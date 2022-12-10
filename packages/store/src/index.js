export {
  isKey,
  assertKey,
  makeCopySet,
  getCopySetKeys,
  makeCopyBag,
  makeCopyBagFromElements,
  getCopyBagEntries,
  makeCopyMap,
  getCopyMapEntries,
} from './keys/checkKey.js';
export { coerceToElements } from './keys/copySet.js';
export { coerceToBagEntries } from './keys/copyBag.js';
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
  bagIsSuperbag,
  bagCompare,
  bagUnion,
  bagIntersection,
  bagDisjointSubtract,
} from './keys/merge-bag-operators.js';

export {
  M,
  getRankCover,
  isPattern,
  assertPattern,
  assertKeyPattern,
  matches,
  fit,
} from './patterns/patternMatchers.js';

export {
  defendPrototype,
  defendPrototypeKit,
  initEmpty,
  defineHeapFarClass,
  defineHeapFarClassKit,
  makeHeapFarInstance,
} from './patterns/interface-tools.js';

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

export { provideLazy } from './stores/store-utils.js';

// /////////////////////// Deprecated Legacy ///////////////////////////////////

// Importing these from store is deprecated. Import directly from
// '@endo/marshal/src/rankOrder.js' instead.
export {
  compareRank,
  isRankSorted,
  sortByRank,
} from '@endo/marshal/src/rankOrder.js';
// Importing these from store is deprecated. Import directly from
// '@endo/marshal/src/encodePassable.js' instead.
export {
  makeDecodePassable,
  makeEncodePassable,
  isEncodedRemotable,
  zeroPad,
} from '@endo/marshal/src/encodePassable.js';

// export default as well as makeLegacy* only for compatibility
// during the transition.
export { makeLegacyMap, makeLegacyMap as default } from './legacy/legacyMap.js';
export { makeLegacyWeakMap } from './legacy/legacyWeakMap.js';
