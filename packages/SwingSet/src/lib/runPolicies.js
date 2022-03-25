// @ts-check

import { assert } from '@agoric/assert';

export function foreverPolicy() {
  /** @type {RunPolicy} */
  return harden({
    vatCreated(_details) {
      return true;
    },
    crankComplete(_details) {
      return true;
    },
    crankFailed(_details) {
      return true;
    },
    emptyCrank() {
      return true;
    },
  });
}

export function crankCounter(
  maxCranks,
  maxCreateVats,
  includeEmptyCranks = false,
) {
  let cranks = 0;
  let vats = 0;
  /** @type {RunPolicy} */
  const policy = harden({
    vatCreated() {
      vats += 1;
      return vats < maxCreateVats;
    },
    crankComplete(_details) {
      cranks += 1;
      return cranks < maxCranks;
    },
    crankFailed() {
      cranks += 1;
      return cranks < maxCranks;
    },
    emptyCrank() {
      cranks += includeEmptyCranks ? 1 : 0;
      return cranks < maxCranks;
    },
  });
  return policy;
}

export function computronCounter(limit) {
  assert.typeof(limit, 'bigint');
  let total = 0n;
  /** @type {RunPolicy} */
  const policy = harden({
    vatCreated() {
      total += 100000n; // pretend vat creation takes 100k computrons
      return total < limit;
    },
    crankComplete(details = {}) {
      assert.typeof(details, 'object');
      if (details.computrons) {
        assert.typeof(details.computrons, 'bigint');
        total += details.computrons;
      }
      return total < limit;
    },
    crankFailed() {
      total += 1000000n; // who knows, 1M is as good as anything
      return total < limit;
    },
    emptyCrank() {
      return true;
    },
  });
  return policy;
}

export function wallClockWaiter(seconds) {
  const timeout = Date.now() + 1000 * seconds;
  /** @type {RunPolicy} */
  const policy = harden({
    vatCreated: () => Date.now() < timeout,
    crankComplete: () => Date.now() < timeout,
    crankFailed: () => Date.now() < timeout,
    emptyCrank: () => Date.now() < timeout,
  });
  return policy;
}
