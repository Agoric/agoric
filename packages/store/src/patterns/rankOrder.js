// @ts-check

import { assert, details as X, q } from '@agoric/assert';
import {
  assertRecord,
  getTag,
  nameForPassableSymbol,
  passStyleOf,
} from '@endo/marshal';

/** @typedef {import('@endo/marshal').PassStyle} PassStyle */

const { fromEntries, entries, setPrototypeOf, is } = Object;

const { ownKeys } = Reflect;

/**
 * This is the equality comparison used by JavaScript's Map and Set
 * abstractions, where NaN is the same as NaN and -0 is the same as 0. Marshal
 * serializes -0 as zero, so the semantics of our distributed object system does
 * not distinguish 0 from -0.
 *
 * `sameValueZero` is the EcmaScript spec name for this equality comparison, but
 * TODO we need a better name for the API.
 *
 * @param {any} x
 * @param {any} y
 * @returns {boolean}
 */
const sameValueZero = (x, y) => x === y || is(x, y);

/** @type {[PassStyle, RankCover][]} */
const PassStyleRankAndCover = harden([
  /* !  */ ['error', ['!', '!~']],
  /* (  */ ['copyRecord', ['(', '(~']],
  /* :  */ ['tagged', [':', ':~']],
  /* ?  */ ['promise', ['?', '?~']],
  /* [  */ ['copyArray', ['[', '[~']],
  /* b  */ ['boolean', ['b', 'b~']],
  /* f  */ ['number', ['f', 'f~']],
  /* np */ ['bigint', ['n', 'p~']],
  /* r  */ ['remotable', ['r', 'r~']],
  /* s  */ ['string', ['s', 't']],
  /* v  */ ['null', ['v', 'v~']],
  /* y  */ ['symbol', ['y', 'z']],
  /* z  */ ['undefined', ['z', '{']],
  /* | remotable->ordinal mapping prefix: This is not used in covers but it is
       reserved from the same set of strings. Note that the prefix is > any
       prefix used by any cover so that ordinal mapping keys are always outside
       the range of valid collection entry keys. */
]);

const PassStyleRank = fromEntries(
  entries(PassStyleRankAndCover).map(([i, v]) => [v[0], Number(i)]),
);
setPrototypeOf(PassStyleRank, null);
harden(setPrototypeOf);

/** @type {GetPassStyleCover} */
export const getPassStyleCover = passStyle =>
  PassStyleRankAndCover[PassStyleRank[passStyle]][1];
harden(getPassStyleCover);

/** @type {WeakMap<RankCompare, WeakSet<Passable[]>>} */
const memoOfSorted = new WeakMap();

/** @type {WeakMap<RankCompare, RankCompare>} */
const comparatorMirrorImages = new WeakMap();

export const recordParts = record => {
  assertRecord(record);
  // TODO Measure which is faster: a reverse sort by sorting and
  // reversing, or by sorting with an inverse comparison function.
  // If it makes a significant difference, use the faster one.
  const names = ownKeys(record).sort().reverse();
  // @ts-expect-error It thinks name might be a symbol, which it doesn't like.
  const vals = names.map(name => record[name]);
  return harden([names, vals]);
};
harden(recordParts);

/**
 * @param {RankCompare} [compareRemotables] An option to create a comparator in
 *   which an internal order is assigned to remotables. This defaults to a
 *   comparator that always returns `0`, meaning that all remotables are tied
 *   for the same rank.
 * @returns {RankComparatorKit}
 */
export const makeComparatorKit = (compareRemotables = (_x, _y) => 0) => {
  /** @type {RankCompare} */
  const comparator = (left, right) => {
    if (sameValueZero(left, right)) {
      return 0;
    }
    const leftStyle = passStyleOf(left);
    const rightStyle = passStyleOf(right);
    if (leftStyle !== rightStyle) {
      return comparator(PassStyleRank[leftStyle], PassStyleRank[rightStyle]);
    }
    switch (leftStyle) {
      case 'remotable': {
        return compareRemotables(left, right);
      }
      case 'undefined':
      case 'null':
      case 'error':
      case 'promise': {
        // For each of these passStyles, all members of that passStyle are tied
        // for the same rank.
        return 0;
      }
      case 'boolean':
      case 'bigint':
      case 'string': {
        // Within each of these passStyles, the rank ordering agrees with
        // JavaScript's relational operators `<` and `>`.
        if (left < right) {
          return -1;
        } else {
          assert(left > right);
          return 1;
        }
      }
      case 'symbol': {
        return comparator(
          nameForPassableSymbol(left),
          nameForPassableSymbol(right),
        );
      }
      case 'number': {
        // `NaN`'s rank is after all other numbers.
        if (Number.isNaN(left)) {
          assert(!Number.isNaN(right));
          return 1;
        } else if (Number.isNaN(right)) {
          return -1;
        }
        // The rank ordering of non-NaN numbers agrees with JavaScript's
        // relational operators '<' and '>'.
        if (left < right) {
          return -1;
        } else {
          assert(left > right);
          return 1;
        }
      }
      case 'copyRecord': {
        // Lexicographic by inverse sorted order of property names, then
        // lexicographic by corresponding values in that same inverse
        // order of their property names. Comparing names by themselves first,
        // all records with the exact same set of property names sort next to
        // each other in a rank-sort of copyRecords.

        // The copyRecord invariants enforced by passStyleOf ensure that
        // all the property names are strings. We need the reverse sorted order
        // of these names, which we then compare lexicographically. This ensures
        // that if the names of record X are a subset of the names of record Y,
        // then record X will have an earlier rank and sort to the left of Y.
        const [leftNames, leftValues] = recordParts(left);
        const [rightNames, rightValues] = recordParts(right);

        const result = comparator(leftNames, rightNames);
        if (result !== 0) {
          return result;
        }
        return comparator(leftValues, rightValues);
      }
      case 'copyArray': {
        // Lexicographic
        const len = Math.min(left.length, right.length);
        for (let i = 0; i < len; i += 1) {
          const result = comparator(left[i], right[i]);
          if (result !== 0) {
            return result;
          }
        }
        // If all matching elements were tied, then according to their lengths.
        // If array X is a prefix of array Y, then X has an earlier rank than Y.
        return comparator(left.length, right.length);
      }
      case 'tagged': {
        // Lexicographic by `[Symbol.toStringTag]` then `.payload`.
        const labelComp = comparator(getTag(left), getTag(right));
        if (labelComp !== 0) {
          return labelComp;
        }
        return comparator(left.payload, right.payload);
      }
      default: {
        assert.fail(X`Unrecognized passStyle: ${q(leftStyle)}`);
      }
    }
  };

  /** @type {RankCompare} */
  const antiComparator = (x, y) => comparator(y, x);

  memoOfSorted.set(comparator, new WeakSet());
  memoOfSorted.set(antiComparator, new WeakSet());
  comparatorMirrorImages.set(comparator, antiComparator);
  comparatorMirrorImages.set(antiComparator, comparator);

  return harden({ comparator, antiComparator });
};
/**
 * @param {RankCompare} comparator
 * @returns {RankCompare | undefined}
 */
export const comparatorMirrorImage = comparator =>
  comparatorMirrorImages.get(comparator);

/**
 * @param {Passable[]} passables
 * @param {RankCompare} compare
 * @returns {boolean}
 */
export const isRankSorted = (passables, compare) => {
  const subMemoOfSorted = memoOfSorted.get(compare);
  assert(subMemoOfSorted !== undefined);
  if (subMemoOfSorted.has(passables)) {
    return true;
  }
  assert(passStyleOf(passables) === 'copyArray');
  for (let i = 1; i < passables.length; i += 1) {
    if (compare(passables[i - 1], passables[i]) >= 1) {
      return false;
    }
  }
  subMemoOfSorted.add(passables);
  return true;
};
harden(isRankSorted);

/**
 * @param {Passable[]} sorted
 * @param {RankCompare} compare
 */
export const assertRankSorted = (sorted, compare) =>
  assert(
    isRankSorted(sorted, compare),
    // TODO assert on bug could lead to infinite recursion. Fix.
    // eslint-disable-next-line no-use-before-define
    X`Must be rank sorted: ${sorted} vs ${sortByRank(sorted, compare)}`,
  );
harden(assertRankSorted);

/**
 * TODO SECURITY BUG: https://github.com/Agoric/agoric-sdk/issues/4260
 * sortByRank currently uses `Array.prototype.sort` directly, and so only works
 * correctly when given a `compare` function that considers `undefined` strictly
 * bigger (`>`) than everything else. This is because `Array.prototype.sort`
 * bizarrely moves all `undefined`s to the end of the array regardless, without
 * consulting the `compare` function. This is a genuine bug for us NOW because
 * sometimes we sort in reverse order by passing a reversed rank comparison function.
 *
 * @param {Iterable<Passable>} passables
 * @param {RankCompare} compare
 * @returns {Passable[]}
 */
export const sortByRank = (passables, compare) => {
  if (Array.isArray(passables)) {
    harden(passables);
    // Calling isRankSorted gives it a chance to get memoized for
    // this `compare` function even if it was already memoized for a different
    // `compare` function.
    if (isRankSorted(passables, compare)) {
      return passables;
    }
  }
  const unsorted = [...passables];
  unsorted.forEach(harden);
  const sorted = harden(unsorted.sort(compare));
  const subMemoOfSorted = memoOfSorted.get(compare);
  assert(subMemoOfSorted !== undefined);
  subMemoOfSorted.add(sorted);
  return sorted;
};
harden(sortByRank);

/**
 * See
 * https://en.wikipedia.org/wiki/Binary_search_algorithm#Procedure_for_finding_the_leftmost_element
 *
 * @param {Passable[]} sorted
 * @param {RankCompare} compare
 * @param {Passable} key
 * @param {'leftMost' | 'rightMost'} [bias]
 * @returns {number}
 */
const rankSearch = (sorted, compare, key, bias = 'leftMost') => {
  assertRankSorted(sorted, compare);
  let left = 0;
  let right = sorted.length;
  while (left < right) {
    const m = Math.floor((left + right) / 2);
    const comp = compare(sorted[m], key);
    if (comp <= -1 || (comp === 0 && bias === 'rightMost')) {
      left = m + 1;
    } else {
      assert(comp >= 1 || (comp === 0 && bias === 'leftMost'));
      right = m;
    }
  }
  return bias === 'leftMost' ? left : right - 1;
};

/** @type {GetIndexCover} */
export const getIndexCover = (sorted, compare, [leftKey, rightKey]) => {
  assertRankSorted(sorted, compare);
  const leftIndex = rankSearch(sorted, compare, leftKey, 'leftMost');
  const rightIndex = rankSearch(sorted, compare, rightKey, 'rightMost');
  return [leftIndex, rightIndex];
};
harden(getIndexCover);

/** @type {RankCover} */
export const FullRankCover = harden(['', '{']);

/** @type {CoveredEntries} */
export const coveredEntries = (sorted, [leftIndex, rightIndex]) => {
  /** @type {Iterable<[number, Passable]>} */
  const iterable = harden({
    [Symbol.iterator]: () => {
      let i = leftIndex;
      return harden({
        next: () => {
          if (i <= rightIndex) {
            const element = sorted[i];
            i += 1;
            return harden({ value: [i, element], done: false });
          } else {
            return harden({ value: undefined, done: true });
          }
        },
      });
    },
  });
  return iterable;
};
harden(coveredEntries);

/**
 * @param {RankCompare} compare
 * @param {Passable} a
 * @param {Passable} b
 * @returns {Passable}
 */
const maxRank = (compare, a, b) => (compare(a, b) >= 0 ? a : b);

/**
 * @param {RankCompare} compare
 * @param {Passable} a
 * @param {Passable} b
 * @returns {Passable}
 */
const minRank = (compare, a, b) => (compare(a, b) <= 0 ? a : b);

/**
 * @param {RankCompare} compare
 * @param {RankCover[]} covers
 * @returns {RankCover}
 */
export const unionRankCovers = (compare, covers) => {
  /**
   * @param {RankCover} a
   * @param {RankCover} b
   * @returns {RankCover}
   */
  const unionRankCoverPair = ([leftA, rightA], [leftB, rightB]) => [
    minRank(compare, leftA, leftB),
    maxRank(compare, rightA, rightB),
  ];
  return covers.reduce(unionRankCoverPair, ['{', '']);
};
harden(unionRankCovers);

/**
 * @param {RankCompare} compare
 * @param {RankCover[]} covers
 * @returns {RankCover}
 */
export const intersectRankCovers = (compare, covers) => {
  /**
   * @param {RankCover} a
   * @param {RankCover} b
   * @returns {RankCover}
   */
  const intersectRankCoverPair = ([leftA, rightA], [leftB, rightB]) => [
    maxRank(compare, leftA, leftB),
    minRank(compare, rightA, rightB),
  ];
  return covers.reduce(intersectRankCoverPair, ['', '{']);
};

export const { comparator: compareRank, antiComparator: compareAntiRank } =
  makeComparatorKit();

/**
 * Create a comparator kit in which remotables are fully ordered by the order in
 * which they are first seen by _this_ comparator kit. BEWARE: This is
 * observable mutable state, so such a comparator kit should never be shared
 * among subsystems that should not be able to communicate.
 *
 * Note that this order does not meet the requirements for store ordering, since
 * it has no memory of deleted keys.
 *
 * These full order comparator kit is strictly more precise that the rank order
 * comparator kits above. As a result, any array which is sorted by such a full
 * order will pass the isRankSorted test with a corresponding rank order.
 *
 * An array which is sorted by a _fresh_ full order comparator, i.e., one that
 * has not yet seen any remotables, will of course remain sorted by according to
 * _that_ full order comparator. An array _of scalars_ sorted by a fresh full
 * order will remain sorted even according to a new fresh full order comparator,
 * since it will see the remotables in the same order again. Unfortunately, this
 * is not true of arrays of passables in general.
 *
 * @param {boolean} [longLived]
 * @returns {FullComparatorKit}
 */
export const makeFullOrderComparatorKit = (longLived = false) => {
  let numSeen = 0;
  // When dynamically created with short lifetimes (the default) a WeakMap
  // would perform poorly, and the leak created by a Map only lasts as long
  // as the Map.
  const MapConstructor = longLived ? WeakMap : Map;
  const seen = new MapConstructor();
  const tag = r => {
    if (seen.has(r)) {
      return seen.get(r);
    }
    numSeen += 1;
    seen.set(r, numSeen);
    return numSeen;
  };
  const compareRemotables = (x, y) => compareRank(tag(x), tag(y));
  return makeComparatorKit(compareRemotables);
};
harden(makeFullOrderComparatorKit);
