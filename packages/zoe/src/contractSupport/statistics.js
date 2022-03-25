/**
 * @template T
 * @typedef {Object} TypedMath
 * @property {(a: T, b: T) => T} add
 * @property {(a: T, b: T) => T} divide
 * @property {(a: T, b: T) => boolean} isGTE
 */

/**
 * Calculate the median of a set of samples
 *
 * @template T
 * @param {T[]} samples The input measurements
 * @param {TypedMath<T>} math
 * @returns {T} The median (undefined if no samples)
 */
export const calculateMedian = (samples, math) => {
  const sorted = samples.sort((a, b) => {
    if (!math.isGTE(a, b)) {
      return -1;
    } else if (!math.isGTE(b, a)) {
      return 1;
    }
    return 0;
  });

  if (sorted.length === 0) {
    // No valid samples, don't report anything.
    return undefined;
  }

  if (sorted.length % 2 !== 0) {
    // Odd length, just pick the middle element.
    return sorted[(sorted.length - 1) / 2];
  }

  // Even length, take the mean of the two middle values.
  const secondIndex = sorted.length / 2;
  const sum = math.add(sorted[secondIndex - 1], sorted[secondIndex]);
  return math.divide(sum, 2);
};
