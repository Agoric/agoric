// @ts-check
import { assert } from '@agoric/assert';
import { makeVatTranslators } from '../vatTranslator';

/**
 * @param { ReturnType<typeof import('../state/kernelKeeper').default> } kernelKeeper
 * @param { ReturnType<typeof import('../loadVat').makeVatLoader> } vatLoader
 * @param {{ sizeHint?: number }=} policyOptions
 *
 * @typedef { ReturnType<typeof import('@agoric/swing-store-simple').initSwingStore> } SwingStore
 * @typedef {(syscall: VatSyscallObject) => ['error', string] | ['ok', null] | ['ok', Capdata]} VatSyscallHandler
 * @typedef {{ body: string, slots: unknown[] }} Capdata
 * @typedef { [unknown, ...unknown[]] } Tagged
 * @typedef { { moduleFormat: string }} Bundle
 */
export function makeVatWarehouse(kernelKeeper, vatLoader, policyOptions) {
  const { sizeHint = 50 } = policyOptions || {};

  /**
   * @typedef {{
   *   manager: VatManager,
   *   enablePipelining: boolean, //@@@put in DB. avoid spinning up a vat that isn't pipelined, in some cases.
   * }} VatInfo
   * @typedef { ReturnType<typeof import('../vatTranslator').makeVatTranslators> } VatTranslators
   */
  const ephemeral = {
    /** @type {Map<string, VatInfo> } key is vatID */
    vats: new Map(),
  };

  /** @type {Map<string, VatTranslators> } */
  const xlate = new Map();
  /** @param { string } vatID */
  function findOrCreateTranslators(vatID) {
    let translators = xlate.get(vatID);
    if (!translators) {
      // @@@ document pre-condition makeVatTranslators needs vatKeeper?
      // or pass in the vatKeeper too;
      // grep for getVatKeeper and avoid this pattern.
      // remove ephemeral table from kernelKeeper@@@
      translators = makeVatTranslators(vatID, kernelKeeper);
      xlate.set(vatID, translators);
    }
    return translators;
  }

  /**
   * @param {string} vatID
   * @param {boolean} recreate
   * @returns { Promise<VatInfo> }
   */
  async function ensureVatOnline(vatID, recreate) {
    const info = ephemeral.vats.get(vatID);
    if (info) return info;

    // @@@getVatKeeper -> provideVatKeeper?
    const vatKeeper =
      kernelKeeper.getVatKeeper(vatID) || kernelKeeper.allocateVatKeeper(vatID);
    const { source, options } = vatKeeper.getSourceAndOptions(); // @@@comms vat source repeated?

    const translators = findOrCreateTranslators(vatID);

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
    // console.log('provide: creating from bundle', vatID);
    const manager = await chooseLoader()(vatID, source, translators, options);

    const { enablePipelining = false } = options;

    // TODO: load from snapshot
    await manager.replayTranscript();
    const result = {
      manager,
      translators,
      enablePipelining,
    };
    ephemeral.vats.set(vatID, result);
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

  /** @param { typeof console.log } logStartup */
  async function start(logStartup) {
    const recreate = true; // note: PANIC on failure to recreate

    // NOTE: OPTIMIZATION OPPORTUNITY: replay vats in parallel

    // instantiate all static vats
    for (const [name, vatID] of kernelKeeper.getStaticVats()) {
      logStartup(`allocateVatKeeper for vat ${name} as vat ${vatID}`);
      // eslint-disable-next-line no-await-in-loop
      await ensureVatOnline(vatID, recreate);
    }

    // instantiate all dynamic vats
    for (const vatID of kernelKeeper.getDynamicVats()) {
      logStartup(`allocateVatKeeper for dynamic vat ${vatID}`);
      // eslint-disable-next-line no-await-in-loop
      await ensureVatOnline(vatID, recreate);
    }
  }

  /**
   * @param { string } vatID
   * @returns {{ enablePipelining?: boolean }
   *  | void // undefined if the vat is dead or never initialized
   * }
   */
  function lookup(vatID) {
    const liveInfo = ephemeral.vats.get(vatID);
    if (liveInfo) {
      const { enablePipelining } = liveInfo;
      return { enablePipelining };
    }
    const vatKeeper = kernelKeeper.getVatKeeper(vatID);
    if (vatKeeper) {
      const {
        options: { enablePipelining },
      } = vatKeeper.getSourceAndOptions();
      return { enablePipelining };
    }
    return undefined;
  }

  /**
   *
   * @param {string} vatID
   * @param {boolean=} makeSnapshot
   * @returns { Promise<unknown> }
   */
  async function evict(vatID, makeSnapshot = false) {
    assert(!makeSnapshot, 'not implemented');
    assert(lookup(vatID));
    const info = ephemeral.vats.get(vatID);
    if (!info) return undefined;
    ephemeral.vats.delete(vatID);
    xlate.delete(vatID);

    // TODO@@@?: add a way to remove a vatKeeper from ephemeral in kernel.js
    // so that we can get rid of a vatKeeper when we evict its vat.

    // console.log('evict: shutting down', vatID);
    return info.manager.shutdown();
  }

  /** @type { string[] } */
  const recent = [];

  /**
   * Simple fixed-size LRU cache policy
   *
   * TODO: policy input: did a vat get a message? how long ago?
   * "important" vat option?
   * options: pay $/block to keep in RAM - advisory; not consensus
   * creation arg: # of vats to keep in RAM (LRU 10~50~100)
   *
   * @param {string} currentVatID
   */
  async function applyAvailabilityPolicy(currentVatID) {
    // console.log('applyAvailabilityPolicy', currentVatID, recent);
    const pos = recent.indexOf(currentVatID);
    // already most recently used
    if (pos + 1 === sizeHint) return;
    if (pos >= 0) recent.splice(pos, 1);
    recent.push(currentVatID);
    // not yet full
    if (recent.length <= sizeHint) return;
    const [lru] = recent.splice(0, 1);
    await evict(lru);
  }

  /** @type {(vatID: string, d: VatDeliveryObject) => Promise<Tagged> } */
  async function deliverToVat(vatID, delivery) {
    await applyAvailabilityPolicy(vatID);
    const recreate = true; // PANIC in the failure case

    const { manager } = await ensureVatOnline(vatID, recreate);
    return manager.deliver(delivery);
  }

  /**
   * @param {string} vatID
   * @param {unknown[]} kd
   * @returns { VatDeliveryObject }
   */
  function kernelDeliveryToVatDelivery(vatID, kd) {
    const translators = findOrCreateTranslators(vatID);

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

    const translators = findOrCreateTranslators(vatID);

    const { enablePipelining = false } = creationOptions;

    const result = {
      manager,
      translators,
      enablePipelining,
    };
    ephemeral.vats.set(vatID, result);
  }

  /**
   * @param {string} vatID
   * @returns { Promise<void> }
   */
  async function vatWasTerminated(vatID) {
    try {
      await evict(vatID, false);
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

    // mostly for testing?
    activeVatIDs: () => [...ephemeral.vats.keys()],

    vatWasTerminated,
    shutdown,
  });
}
harden(makeVatWarehouse);
