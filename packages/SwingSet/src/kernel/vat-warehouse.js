// @ts-check
import { assert, details as X, quote as q } from '@agoric/assert';
import { makeVatTranslators } from './vatTranslator.js';
import { insistVatDeliveryResult } from '../lib/message.js';

/** @param {number} max */
export const makeLRU = max => {
  /** @type {string[]} */
  const items = [];

  return harden({
    /** @param {string} item */
    add: item => {
      const pos = items.indexOf(item);
      // already most recently used
      if (pos + 1 === max) {
        return null;
      }
      // remove from former position
      if (pos >= 0) {
        items.splice(pos, 1);
      }
      items.push(item);
      // not yet full
      if (items.length <= max) {
        return null;
      }
      const [removed] = items.splice(0, 1);
      return removed;
    },

    get size() {
      return items.length;
    },

    /** @param {string} item */
    remove: item => {
      const pos = items.indexOf(item);
      if (pos >= 0) {
        items.splice(pos, 1);
      }
    },
  });
};

/**
 * @param {KernelKeeper} kernelKeeper
 * @param {ReturnType<
 *   typeof import('./vat-loader/vat-loader.js').makeVatLoader
 * >} vatLoader
 * @param {{
 *   maxVatsOnline?: number;
 *   snapshotInitial?: number;
 *   snapshotInterval?: number;
 * }} [policyOptions]
 *
 * @typedef {(
 *   syscall: VatSyscallObject,
 * ) => ['error', string] | ['ok', null] | ['ok', Capdata]} VatSyscallHandler
 *
 * @typedef {{ body: string; slots: unknown[] }} Capdata
 *
 * @typedef {[unknown, ...unknown[]]} Tagged
 *
 * @typedef {{ moduleFormat: string }} Bundle
 */
export function makeVatWarehouse(kernelKeeper, vatLoader, policyOptions) {
  const {
    maxVatsOnline = 50,
    // Often a large contract evaluation is among the first few deliveries,
    // so let's do a snapshot after just a few deliveries.
    snapshotInitial = 2,
    // Then we'll snapshot at invervals of some number of cranks.
    // Note: some measurements show 10 deliveries per sec on XS
    //       as of this writing.
    snapshotInterval = 200,
  } = policyOptions || {};
  // Idea: snapshot based on delivery size: after deliveries >10Kb.
  // console.debug('makeVatWarehouse', { policyOptions });

  /**
   * @typedef {{
   *   manager: VatManager;
   *   enablePipelining: boolean;
   *   options: {
   *     name?: string;
   *     description?: string;
   *     managerType?: ManagerType;
   *   };
   * }} VatInfo
   *
   * @typedef {ReturnType<
   *   typeof import('./vatTranslator').makeVatTranslators
   * >} VatTranslators
   */
  const ephemeral = {
    /** @type {Map<string, VatInfo>} key Is vatID */
    vats: new Map(),
  };

  /** @type {Map<string, VatTranslators>} */
  const xlate = new Map();
  /** @param {string} vatID */
  function provideTranslators(vatID) {
    let translators = xlate.get(vatID);
    if (!translators) {
      // NOTE: makeVatTranslators assumes
      // vatKeeper for this vatID is available.
      translators = makeVatTranslators(vatID, kernelKeeper);
      xlate.set(vatID, translators);
    }
    return translators;
  }

  /**
   * @param {string} vatID
   * @param {boolean} recreate
   * @returns {Promise<VatInfo>}
   */
  async function ensureVatOnline(vatID, recreate) {
    const info = ephemeral.vats.get(vatID);
    if (info) return info;

    assert(kernelKeeper.vatIsAlive(vatID), X`${q(vatID)}: not alive`);
    const vatKeeper = kernelKeeper.provideVatKeeper(vatID);
    const { source, options } = vatKeeper.getSourceAndOptions();

    const translators = provideTranslators(vatID);

    const chooseLoader = () => {
      if (recreate) {
        const isDynamic = kernelKeeper.getDynamicVats().includes(vatID);
        if (isDynamic) {
          return vatLoader.recreateDynamicVat;
        } else {
          return vatLoader.recreateStaticVat;
        }
      } else {
        return vatLoader.createVatDynamically;
      }
    };
    const manager = await chooseLoader()(vatID, source, translators, options);

    // TODO(3218): persist this option; avoid spinning up a vat that isn't pipelined
    const { enablePipelining = false } = options;

    const lastSnapshot = vatKeeper.getLastSnapshot();
    await manager.replayTranscript(
      lastSnapshot ? lastSnapshot.startPos : undefined,
    );

    const result = {
      manager,
      translators,
      enablePipelining,
      options,
    };
    // console.info(
    //   vatID,
    //   'online:',
    //   options.managerType,
    //   options.description || '',
    //   'transcript entries replayed:',
    //   entriesReplayed, // retval of replayTranscript() above
    // );
    ephemeral.vats.set(vatID, result);
    // eslint-disable-next-line no-use-before-define
    await applyAvailabilityPolicy(vatID);
    return result;
  }

  /**
   * Bring new dynamic vat online and run its (bootstrap) code.
   *
   * @param {string} vatID
   */
  async function createDynamicVat(vatID) {
    return ensureVatOnline(vatID, false);
  }

  /** @param {typeof console.log} logStartup */
  async function start(logStartup) {
    const recreate = true; // note: PANIC on failure to recreate

    // NOTE: OPTIMIZATION OPPORTUNITY: replay vats in parallel

    // instantiate all static vats
    for (const [name, vatID] of kernelKeeper.getStaticVats()) {
      logStartup(`provideVatKeeper for vat ${name} as vat ${vatID}`);
      // eslint-disable-next-line no-await-in-loop
      await ensureVatOnline(vatID, recreate);
    }

    // instantiate all dynamic vats
    for (const vatID of kernelKeeper.getDynamicVats()) {
      logStartup(`provideVatKeeper for dynamic vat ${vatID}`);
      // eslint-disable-next-line no-await-in-loop
      await ensureVatOnline(vatID, recreate);
    }
  }

  /**
   * @param {string} vatID
   * @returns {{ enablePipelining?: boolean } | undefined} Undefined if the vat
   *   is dead of never initialized
   */
  function lookup(vatID) {
    const liveInfo = ephemeral.vats.get(vatID);
    if (liveInfo) {
      const { enablePipelining } = liveInfo;
      return { enablePipelining };
    }
    if (!kernelKeeper.vatIsAlive(vatID)) {
      return undefined;
    }
    const vatKeeper = kernelKeeper.provideVatKeeper(vatID);
    const { enablePipelining } = vatKeeper.getOptions();
    return { enablePipelining };
  }

  const recent = makeLRU(maxVatsOnline);

  /**
   * Does not modify the kernelDB
   *
   * @param {string} vatID
   * @returns {Promise<unknown>}
   */
  async function evict(vatID) {
    assert(lookup(vatID));

    recent.remove(vatID);

    const info = ephemeral.vats.get(vatID);
    if (!info) {
      // console.debug('evict: not online:', vatID);
      return undefined;
    }
    ephemeral.vats.delete(vatID);
    xlate.delete(vatID);
    kernelKeeper.closeVatTranscript(vatID);
    kernelKeeper.evictVatKeeper(vatID);

    // console.log('evict: shutting down', vatID);
    return info.manager.shutdown();
  }

  /**
   * Simple fixed-size LRU cache policy
   *
   * TODO: policy input: did a vat get a message? how long ago? "important" vat
   * option? options: pay $/block to keep in RAM - advisory; not consensus
   * creation arg: # of vats to keep in RAM (LRU 10~50~100)
   *
   * @param {string} currentVatID
   */
  async function applyAvailabilityPolicy(currentVatID) {
    const lru = recent.add(currentVatID);
    if (!lru) {
      return;
    }
    // const {
    //   options: { description, managerType },
    // } = ephemeral.vats.get(lru) || assert.fail();
    // console.info('evict', lru, description, managerType, 'for', currentVatID);
    await evict(lru);
  }

  /** @type {string | undefined} */
  let lastVatID;

  /**
   * @type {(
   *   vatID: string,
   *   kd: KernelDeliveryObject,
   *   d: VatDeliveryObject,
   *   vs: VatSlog,
   * ) => Promise<VatDeliveryResult>}
   */
  async function deliverToVat(vatID, kd, vd, vs) {
    await applyAvailabilityPolicy(vatID);
    lastVatID = vatID;

    const recreate = true; // PANIC in the failure case
    // create the worker and replay the transcript, if necessary
    const { manager } = await ensureVatOnline(vatID, recreate);

    // then log the delivery so it appears after transcript replay
    const vatKeeper = kernelKeeper.provideVatKeeper(vatID);
    const crankNum = kernelKeeper.getCrankNumber();
    const deliveryNum = vatKeeper.nextDeliveryNum(); // increments
    /** @type {SlogFinishDelivery} */
    const slogFinish = vs.delivery(crankNum, deliveryNum, kd, vd);

    // make the delivery
    const deliveryResult = await manager.deliver(vd);
    insistVatDeliveryResult(deliveryResult);

    // log the delivery results, and return to caller for evaluation
    slogFinish(deliveryResult);
    return deliveryResult;
  }

  /** Save a snapshot of most recently used vat, depending on snapshotInterval. */
  async function maybeSaveSnapshot() {
    if (!lastVatID || !lookup(lastVatID)) {
      return false;
    }

    const recreate = true; // PANIC in the failure case
    const { manager } = await ensureVatOnline(lastVatID, recreate);
    if (!manager.makeSnapshot) {
      return false;
    }

    const vatKeeper = kernelKeeper.provideVatKeeper(lastVatID);
    let reason;
    const { totalEntries, snapshottedEntries } =
      vatKeeper.transcriptSnapshotStats();
    if (snapshotInitial === totalEntries) {
      reason = { snapshotInitial };
    } else if (totalEntries - snapshottedEntries >= snapshotInterval) {
      reason = { snapshotInterval };
    }
    // console.log('maybeSaveSnapshot: reason:', reason);
    if (!reason) {
      return false;
    }
    await vatKeeper.saveSnapshot(manager);
    lastVatID = undefined;
    return true;
  }

  /**
   * @param {string} vatID
   * @param {unknown[]} kd
   * @returns {VatDeliveryObject}
   */
  function kernelDeliveryToVatDelivery(vatID, kd) {
    const translators = provideTranslators(vatID);

    // @ts-ignore TODO: types for kernelDeliveryToVatDelivery
    return translators.kernelDeliveryToVatDelivery(kd);
  }

  /**
   * @param {string} vatID
   * @param {unknown} setup
   * @param {ManagerOptions} creationOptions
   */
  async function loadTestVat(vatID, setup, creationOptions) {
    const manager = await vatLoader.loadTestVat(vatID, setup, creationOptions);

    const translators = provideTranslators(vatID);

    const { enablePipelining = false } = creationOptions;

    const result = {
      manager,
      translators,
      enablePipelining,
      options: {},
    };
    ephemeral.vats.set(vatID, result);
  }

  /**
   * @param {string} vatID
   * @returns {Promise<void>}
   */
  async function vatWasTerminated(vatID) {
    try {
      await evict(vatID);
    } catch (err) {
      console.debug('vat termination was already reported; ignoring:', err);
    }
  }

  // mostly used by tests, only needed with thread/process-based workers
  function shutdown() {
    const work = Array.from(ephemeral.vats.values(), ({ manager }) =>
      manager.shutdown(),
    );
    return Promise.all(work);
  }

  return harden({
    start,
    createDynamicVat,
    loadTestVat,
    lookup,
    kernelDeliveryToVatDelivery,
    deliverToVat,
    maybeSaveSnapshot,

    // mostly for testing?
    activeVatsInfo: () =>
      [...ephemeral.vats].map(([id, { options }]) => ({ id, options })),

    vatWasTerminated,
    shutdown,
  });
}
harden(makeVatWarehouse);
