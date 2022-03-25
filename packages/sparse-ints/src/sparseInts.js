// Copyright (C) 2019 Agoric, under Apache License 2.0

/**
 * Generator function to produce a stream of positive integers that are sparsely
 * scattered across the number space. This supports IDs that are guessable, but
 * for example mistyping a correct ID is unlikely to mistakenly match another
 * generated ID.
 *
 * @param {number} seed
 * @yields {number}
 */
function* generateSparseInts(seed) {
  // This is a linear-feedback shift register with computed startState.
  // Thus, it is totally deterministic, but at least looks a little random
  // and so can be used for e.g., colors in a game or the gallery

  /* eslint-disable no-bitwise */
  const mask = 0xffffffff;
  const startState = Math.floor(seed * mask) ^ 0xdeadbeef;
  let lfsr = startState;
  while (true) {
    lfsr ^= lfsr >>> 7;
    lfsr ^= (lfsr << 9) & mask;
    lfsr ^= lfsr >>> 13;
    const rand = (Math.floor(lfsr) % 0x800000) + 0x7fffff;
    yield rand;
  }
  /* eslint-enable no-bitwise */
}
harden(generateSparseInts);
export { generateSparseInts };
