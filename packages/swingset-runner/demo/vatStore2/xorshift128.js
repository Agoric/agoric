// Portions of this software are licensed under "MIT"
// Copyright (c) 2014 Andreas Madsen & Emil Bay
// https://github.com/AndreasMadsen/xorshift

/* eslint no-bitwise:[0] */

/**
 * This variation on the xorshift128+ psuedo-random number generator provides an
 * API that allows the user to inject more entropy into the generator's state
 * between extractions.
 *
 * The generator provides an API suitable for use both as a random number
 * generator and also a hash digest. As a random number generator, it accepts a
 * seed and returns an object implementing `random()`, like `Math.random()`. To
 * preserve integer integrity, it also provides `randomUint32()`, which returns
 * the noiser high 32 bits of randomness from the underlying 64 bits of
 * randomness provided by a crank of the xorshift128+ algorithm.
 *
 * As a hash digest, like one that implements {`update()` and `digest()`}, the
 * generator provides `update(array)`, which will fold an arbitrary amount of
 * entropy into its own state from an array or typed array of 32 bit unsigned
 * integers. The `random()` function serves as `digest()`, but doesn't leave the
 * generator in a useless state.
 *
 * In addition, `fork()` will create a new branch of the generator sequence
 * beginning with the same state, and is useful for testing.
 *
 * Once significant difference in this implementation to the prior version by
 * Andreas Madsen & Emil Bay is that there is no method that returns an duple of
 * [high and low] unsigned 32 bit integers, owing to a prejudice against
 * unnecessary allocation. Instead, pass a reusable array or typed array to the
 * `scribble` method.
 */

// Chris Hibbert really wanted the default seed to be Bob's Coffee Façade,
// which is conveniently exactly 64 bits long.
const defaultSeed = [0xb0b5c0ff, 0xeefacade, 0xb0b5c0ff, 0xeefacade];

export const makeXorShift128 = (seed = defaultSeed) => {
  // Assertions about the seed's shape.
  if (seed.length !== 4) {
    throw new TypeError(
      `Cannot construct xorshift128 random number generator: seed must have a length of 4, got ${seed.length}`,
    );
  }
  for (let i = 0; i < 4; i += 1) {
    if (typeof seed[i] !== 'number') {
      throw new TypeError(
        `Cannot construct xorshift128 random number generator: seed[${i}] must be a number, got ${typeof seed[
          i
        ]}`,
      );
    }
    if (seed[i] >>> 0 !== seed[i]) {
      throw new RangeError(
        `Cannot construct xorshift128 random number generator: seed[${i}] must have a value in the range of a 32 bit unsigned integer, got ${seed[i]}`,
      );
    }
  }

  const state = new Uint32Array(seed);

  let high = 0;
  let low = 0;

  const advance = () => {
    // uint64_t s1 = s[0]
    let s1U = state[0];
    let s1L = state[1];
    // uint64_t s0 = s[1]
    const s0U = state[2];
    const s0L = state[3];

    // result = s0 + s1
    const sumL = (s0L >>> 0) + (s1L >>> 0);
    high = (s0U + s1U + ((sumL / 2) >>> 31)) >>> 0;
    low = sumL >>> 0;

    // s[0] = s0
    state[0] = s0U;
    state[1] = s0L;

    // - t1 = [0, 0]
    let t1U = 0;
    let t1L = 0;
    // - t2 = [0, 0]
    let t2U = 0;
    let t2L = 0;

    // s1 ^= s1 << 23;
    // :: t1 = s1 << 23
    const a1 = 23;
    const m1 = 0xffffffff << (32 - a1);
    t1U = (s1U << a1) | ((s1L & m1) >>> (32 - a1));
    t1L = s1L << a1;
    // :: s1 = s1 ^ t1
    s1U ^= t1U;
    s1L ^= t1L;

    // t1 = ( s1 ^ s0 ^ ( s1 >> 17 ) ^ ( s0 >> 26 ) )
    // :: t1 = s1 ^ s0
    t1U = s1U ^ s0U;
    t1L = s1L ^ s0L;
    // :: t2 = s1 >> 18
    const a2 = 18;
    const m2 = 0xffffffff >>> (32 - a2);
    t2U = s1U >>> a2;
    t2L = (s1L >>> a2) | ((s1U & m2) << (32 - a2));
    // :: t1 = t1 ^ t2
    t1U ^= t2U;
    t1L ^= t2L;
    // :: t2 = s0 >> 5
    const a3 = 5;
    const m3 = 0xffffffff >>> (32 - a3);
    t2U = s0U >>> a3;
    t2L = (s0L >>> a3) | ((s0U & m3) << (32 - a3));
    // :: t1 = t1 ^ t2
    t1U ^= t2U;
    t1L ^= t2L;

    // s[1] = t1
    state[2] = t1U;
    state[3] = t1L;
  };

  const update = words => {
    let j = 0;
    for (let i = 0; i < words.length; i += 1) {
      state[j] ^= words[i];
      j = (j + 1) & (4 - 1);
    }
    advance();
  };

  // Math.pow(2, -32) = 2.3283064365386963e-10
  // Math.pow(2, -52) = 2.220446049250313e-16
  const random = () => {
    advance();
    return high * 2.3283064365386963e-10 + (low >>> 12) * 2.220446049250313e-16;
  };

  // High bits are noiser.
  const randomUint32 = () => {
    advance();
    return high;
  };

  // Writes 32 bit words to any array-like object.
  const scribble = words => {
    for (let i = 0; i < (words.length & ~1); i += 2) {
      advance();
      words[i + 0] = high;
      words[i + 1] = low;
    }
    if (words.length & 1) {
      advance();
      words[words.length - 1] = high;
    }
  };

  const fork = () => makeXorShift128(state);

  return {
    update,
    random,
    randomUint32,
    scribble,
    fork,
  };
};
