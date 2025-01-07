/**
 * Prepare Agoric SwingSet vat global strict environment for testing.
 *
 * Installs Hardened JS (and does lockdown), plus adds mocks for virtual objects
 * and stores.
 *
 * Exports tools for simulating upgrades.
 */

import '@agoric/internal/src/install-ses-debug.js';

// eslint-disable-next-line import/order
import { reincarnate, flushIncarnation } from './setup-vat-data.js';

import { makePromiseKit } from '@endo/promise-kit';
import { Fail } from '@endo/errors';
import { eventLoopIteration } from '@agoric/internal/src/testing-utils.js';
import { makeUpgradeDisconnection } from '@agoric/internal/src/upgrade-api.js';

export { flushIncarnation };
export { eventLoopIteration as nextCrank };

/**
 * @import { PromiseKit } from '@endo/promise-kit'
 * @import { Baggage } from '@agoric/swingset-liveslots'
 * @import { ReincarnateOptions } from './setup-vat-data.js'
 */

/** @type {ReincarnateOptions} */
let incarnation;
let incarnationNumber = 0;

/** @param {Omit<ReincarnateOptions, 'fakeVomKit' | 'fakeStore'>} [options] */
export const annihilate = (options = {}) => {
  // @ts-expect-error fakeStore and fakeVomKit don't exist on type, but drop them if they do at runtime
  const { fakeStore: _fs, fakeVomKit: _fvk, ...opts } = options;
  incarnation = reincarnate({ relaxDurabilityRules: false, ...opts });
  incarnationNumber = 0;
  return incarnation;
};

/** @returns {Baggage} */
export const getBaggage = () => {
  return incarnation.fakeVomKit.cm.provideBaggage();
};

/**
 * @param {ReincarnateOptions} [fromIncarnation]
 */
export const nextLife = (fromIncarnation = incarnation) => {
  incarnation = reincarnate(fromIncarnation);
  incarnationNumber += 1;
  return incarnation;
};

/**
 * @template {(baggage: Baggage) => Promise<any> | any} B
 * @param {B} build
 * @param {(tools: Awaited<ReturnType<B>>) => Promise<void> | void} [run]
 * @param {object} [options]
 * @param {ReincarnateOptions} [options.fromIncarnation]
 * @param {boolean} [options.cleanStart]
 */
export const startLife = async (
  build,
  run,
  { fromIncarnation, cleanStart } = {},
) => {
  await eventLoopIteration();
  if (cleanStart) annihilate();
  const oldIncarnationNumber = incarnationNumber;
  const oldIncarnation = incarnation;
  const disconnectionObject = makeUpgradeDisconnection(
    'vat upgraded',
    oldIncarnationNumber,
  );
  const { fakeVomKit } = nextLife(fromIncarnation);
  /** @type {Map<string, PromiseKit<any>>} */
  const previouslyWatchedPromises = new Map();
  let buildTools;
  try {
    buildTools = await build(getBaggage());
    fakeVomKit.wpm.loadWatchedPromiseTable(async vref => {
      // See revivePromise in liveslots.js
      const { getValForSlot, valToSlot, setValForSlot } = fakeVomKit.fakeStuff;
      // Assume all promises were decided by the previous incarnation
      !getValForSlot(vref) || Fail`Attempting to revive known promise ${vref}`;
      const pk = makePromiseKit();
      previouslyWatchedPromises.set(vref, pk);
      const val = pk.promise;
      valToSlot.set(val, vref);
      setValForSlot(vref, val);
      return val;
    });

    fakeVomKit.vom.insistAllDurableKindsReconnected();

    await eventLoopIteration();
    // End of start crank
  } catch (err) {
    // Rollback upgrade
    incarnation = oldIncarnation;
    incarnationNumber = oldIncarnationNumber;
    throw err;
  }

  // Simulate a dispatch of previously decided promise rejections
  // In real swingset this could happen after some deliveries
  for (const { reject } of previouslyWatchedPromises.values()) {
    reject(disconnectionObject);
  }
  await eventLoopIteration();
  // End of resolution dispatch crank

  if (run) {
    await run(buildTools);
    await eventLoopIteration();
  }

  return incarnation;
};

// Setup the initial incarnation
annihilate();
