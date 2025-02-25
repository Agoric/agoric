/* global globalThis, WeakRef, FinalizationRegistry */

import process from 'process';
import crypto from 'crypto';
import { performance } from 'perf_hooks';
import { spawn as ambientSpawn } from 'child_process';
import fs from 'fs';
import { tmpName } from 'tmp';
import anylogger from 'anylogger';
import microtime from 'microtime';

import { assert, Fail } from '@endo/errors';
import { importBundle } from '@endo/import-bundle';
import { initSwingStore } from '@agoric/swing-store';

import { mustMatch, M } from '@endo/patterns';
import { checkBundle } from '@endo/check-bundle/lite.js';
import { deepCopyJsonable } from '@agoric/internal/src/js-utils.js';
import { makeLimitedConsole } from '@agoric/internal/src/ses-utils.js';
import engineGC from '@agoric/internal/src/lib-nodejs/engine-gc.js';
import { startSubprocessWorker } from '@agoric/internal/src/lib-nodejs/spawnSubprocessWorker.js';
import { waitUntilQuiescent } from '@agoric/internal/src/lib-nodejs/waitUntilQuiescent.js';
import { makeGcAndFinalize } from '@agoric/internal/src/lib-nodejs/gc-and-finalize.js';
import { kslot, krefOf } from '@agoric/kmarshal';
import { insistStorageAPI } from '../lib/storageAPI.js';
import { insistCapData } from '../lib/capdata.js';
import {
  buildKernelBundle,
  swingsetIsInitialized,
  initializeSwingset,
} from './initializeSwingset.js';
import {
  makeWorkerBundleHandler,
  makeXsnapBundleData,
} from './bundle-handler.js';
import { makeStartXSnap } from './startXSnap.js';
import { makeStartSubprocessWorkerNode } from './startNodeSubprocess.js';

/**
 * @import {EReturn} from '@endo/far';
 */

/**
 * @typedef { import('../types-internal.js').VatID } VatID
 */

const endoZipBase64Sha512Shape = harden({
  moduleFormat: 'endoZipBase64',
  endoZipBase64: M.string(harden({ stringLengthLimit: Infinity })),
  endoZipBase64Sha512: M.string(),
});

/** @param {Uint8Array} bytes */
export function computeSha512(bytes) {
  const hash = crypto.createHash('sha512');
  hash.update(bytes);
  return hash.digest().toString('hex');
}

/**
 * Make logger functions from either a prefix string or a function that receives
 * the first argument of a log-method invocation and returns a replacement that
 * provides more detail for source identification.
 *
 * @param {string | ((originalSource: unknown) => string)} prefixer
 */
function makeConsole(prefixer) {
  if (typeof prefixer !== 'function') {
    const logger = anylogger(prefixer);
    return makeLimitedConsole(level => logger[level]);
  }

  const prefixToLogger = new Map();
  return makeLimitedConsole(level => {
    return (source, ...args) => {
      const prefix = prefixer(source);
      let logger = prefixToLogger.get(prefix);
      if (!logger) {
        logger = anylogger(prefix);
        prefixToLogger.set(prefix, logger);
      }

      return logger[level](...args);
    };
  });
}

/**
 * @param {unknown} e
 * @param {Promise} pr
 */
function unhandledRejectionHandler(e, pr) {
  // Don't trigger sensitive hosts (like AVA).
  pr.catch(() => {});
  console.error('🤞 UnhandledPromiseRejection:', e);
}

/**
 * @param {SwingStoreKernelStorage} kernelStorage
 * @param {Record<string, unknown>} deviceEndowments
 * @param {{
 *   verbose?: boolean,
 *   debugPrefix?: string,
 *   slogCallbacks?: unknown,
 *   slogSender?: import('@agoric/telemetry').SlogSender,
 *   testTrackDecref?: unknown,
 *   warehousePolicy?: import('../types-external.js').VatWarehousePolicy,
 *   overrideVatManagerOptions?: unknown,
 *   spawn?: typeof import('child_process').spawn,
 *   env?: Record<string, string | undefined>,
 *   kernelBundle?: Bundle
 *   xsnapBundleData?: ReturnType<import('./bundle-handler.js').makeXsnapBundleData>,
 *   bundleHandler?: import('./bundle-handler.js').BundleHandler,
 *   profileVats?: string[],
 *   debugVats?: string[],
 * }} runtimeOptions
 */
export async function makeSwingsetController(
  kernelStorage = initSwingStore().kernelStorage,
  deviceEndowments = {},
  runtimeOptions = {},
) {
  const kvStore = kernelStorage.kvStore;
  insistStorageAPI(kvStore);

  // Use ambient process.env only if caller did not specify.
  const { env = process.env } = runtimeOptions;

  // build console early so we can add console.log to diagnose early problems
  const {
    verbose,
    debugPrefix = '',
    slogCallbacks,
    slogSender,
    spawn = ambientSpawn,
    warehousePolicy = {},
    overrideVatManagerOptions = {},
    xsnapBundleData = makeXsnapBundleData(),
    profileVats = [],
    debugVats = [],
  } = runtimeOptions;
  const {
    bundleHandler = makeWorkerBundleHandler(
      kernelStorage.bundleStore,
      xsnapBundleData,
    ),
  } = runtimeOptions;

  if (typeof Compartment === 'undefined') {
    throw Error('SES must be installed before calling makeSwingsetController');
  }

  const startXSnap = makeStartXSnap({
    bundleHandler,
    snapStore: kernelStorage.snapStore,
    spawn,
    fs,
    tmpName,
    debug: !!env.XSNAP_DEBUG,
    workerTraceRootPath: env.XSNAP_TEST_RECORD,
    profileVats,
    debugVats,
  });
  const startSubprocessWorkerNode = makeStartSubprocessWorkerNode(
    startSubprocessWorker,
    profileVats,
    debugVats,
  );

  function writeSlogObject(obj) {
    if (!slogSender) {
      // Fast path; nothing to do.
      return;
    }

    // microtime gives POSIX gettimeofday() with microsecond resolution
    const time = microtime.nowDouble();
    // this is CLOCK_MONOTONIC, seconds since process start
    const monotime = performance.now() / 1000;

    // rearrange the fields a bit to make it more legible to humans
    const timedObj = { type: undefined, ...obj, time, monotime };

    // Allow the SwingSet host to do anything they want with slog messages.
    slogSender(timedObj);
  }

  const console = makeConsole(`${debugPrefix}SwingSet:controller`);
  // We can harden this 'console' because it's new, but if we were using the
  // original 'console' object (which has a unique prototype), we'd have to
  // harden(Object.getPrototypeOf(console));
  // see https://github.com/Agoric/SES-shim/issues/292 for details
  harden(console);

  writeSlogObject({ type: 'kernel-init-start' });

  writeSlogObject({ type: 'bundle-kernel-start' });
  await null;
  const { kernelBundle = await buildKernelBundle() } = runtimeOptions;
  writeSlogObject({ type: 'bundle-kernel-finish' });

  // FIXME: Put this somewhere better.
  const handlers = process.listeners('unhandledRejection');
  let haveUnhandledRejectionHandler = false;
  for (const handler of handlers) {
    if (handler === unhandledRejectionHandler) {
      haveUnhandledRejectionHandler = true;
      break;
    }
  }
  if (!haveUnhandledRejectionHandler) {
    process.on('unhandledRejection', unhandledRejectionHandler);
  }

  const kernelConsole = makeConsole(`${debugPrefix}SwingSet:kernel`);
  const sloggingKernelConsole = makeLimitedConsole(level => {
    return (...args) => {
      kernelConsole[level](...args);
      writeSlogObject({ type: 'console', source: 'kernel', level, args });
    };
  });
  writeSlogObject({ type: 'import-kernel-start' });
  const kernelNS = await importBundle(kernelBundle, {
    filePrefix: 'kernel/...',
    endowments: {
      console: sloggingKernelConsole,
      // See https://github.com/Agoric/agoric-sdk/issues/9515
      assert: globalThis.assert,
      require: harden(
        what => Fail`kernelRequire unprepared to satisfy require(${what})`,
      ),
      URL: globalThis.Base64, // Unavailable only on XSnap
      Base64: globalThis.Base64, // Available only on XSnap
    },
  });
  const buildKernel = kernelNS.default;
  writeSlogObject({ type: 'import-kernel-finish' });

  // all vats get these in their global scope, plus a vat-specific 'console'
  const vatEndowments = harden({});

  const kernelEndowments = {
    waitUntilQuiescent,
    kernelStorage,
    debugPrefix,
    vatEndowments,
    makeConsole,
    startSubprocessWorkerNode,
    startXSnap,
    slogCallbacks,
    writeSlogObject,
    WeakRef,
    FinalizationRegistry,
    gcAndFinalize: makeGcAndFinalize(engineGC),
    bundleHandler,
  };

  const kernelRuntimeOptions = {
    verbose,
    warehousePolicy,
    overrideVatManagerOptions,
  };
  /** @type { ReturnType<typeof import('../kernel/kernel.js').default> } */
  const kernel = buildKernel(
    kernelEndowments,
    deviceEndowments,
    kernelRuntimeOptions,
  );

  if (runtimeOptions.verbose) {
    kernel.kdebugEnable(true);
  }

  await kernel.start();

  /**
   * Validate and install a code bundle.
   *
   * @param {EndoZipBase64Bundle} bundle
   * @param {BundleID} [allegedBundleID]
   * @returns {Promise<BundleID>}
   */
  async function validateAndInstallBundle(bundle, allegedBundleID = undefined) {
    // TODO The following assertion may be removed when checkBundle subsumes
    // the responsibility to verify the permanence of a bundle's properties.
    // https://github.com/endojs/endo/issues/1106
    mustMatch(bundle, endoZipBase64Sha512Shape);
    await checkBundle(bundle, computeSha512, allegedBundleID);
    const { endoZipBase64Sha512 } = bundle;
    assert.typeof(endoZipBase64Sha512, 'string');
    const bundleID = `b1-${endoZipBase64Sha512}`;
    if (allegedBundleID !== undefined) {
      bundleID === allegedBundleID ||
        Fail`alleged bundleID ${allegedBundleID} does not match actual ${bundleID}`;
    }
    await kernel.installBundle(bundleID, bundle);
    return bundleID;
  }

  // the kernel won't leak our objects into the Vats, we must do
  // the same in this wrapper
  const controller = harden({
    log(str) {
      kernel.log(str);
    },

    writeSlogObject,

    dump() {
      return deepCopyJsonable(kernel.dump());
    },

    verboseDebugMode(flag) {
      kernel.kdebugEnable(flag);
    },

    validateAndInstallBundle,

    /**
     * Run the kernel until the policy says to stop, or the queue is empty.
     *
     * @param {RunPolicy} [policy] - a RunPolicy to limit the work being done
     * @returns {Promise<number>} The number of cranks that were executed.
     */
    async run(policy) {
      return kernel.run(policy);
    },

    async step() {
      return kernel.step();
    },

    async shutdown() {
      return kernel.shutdown();
    },

    reapAllVats() {
      kernel.reapAllVats();
    },

    changeKernelOptions(options) {
      kernel.changeKernelOptions(options);
    },

    getStats() {
      return deepCopyJsonable(kernel.getStats());
    },

    getStatus() {
      return deepCopyJsonable(kernel.getStatus());
    },

    getActivityhash() {
      return kernelStorage.getActivityhash();
    },

    // everything beyond here is for tests, and everything should be migrated
    // to be on this 'debug' object to make that clear

    debug: {
      addDeviceHook: kernel.addDeviceHook,
    },

    pinVatRoot(vatName) {
      const vatID = kernel.vatNameToID(vatName);
      const kref = kernel.getRootObject(vatID);
      kernel.pinObject(kref);
      kernelStorage.emitCrankHashes();
      return kref;
    },

    kpRegisterInterest(kpid) {
      return kernel.kpRegisterInterest(kpid);
    },

    kpStatus(kpid) {
      return kernel.kpStatus(kpid);
    },

    kpResolution(kpid, options) {
      const result = kernel.kpResolution(kpid, options);
      // kpResolution does DB write (changes refcounts) so we need emitCrankHashes here
      kernelStorage.emitCrankHashes();
      return result;
    },

    vatNameToID(vatName) {
      return kernel.vatNameToID(vatName);
    },
    deviceNameToID(deviceName) {
      return kernel.deviceNameToID(deviceName);
    },

    injectQueuedUpgradeEvents: () => kernel.injectQueuedUpgradeEvents(),

    /**
     * Queue a method call into the named vat
     *
     * @param {string} vatName
     * @param {string|symbol} method
     * @param {unknown[]} args
     * @param {ResolutionPolicy} resultPolicy
     */
    queueToVatRoot(vatName, method, args = [], resultPolicy = 'ignore') {
      const vatID = kernel.vatNameToID(vatName);
      if (typeof method !== 'symbol') {
        assert.typeof(method, 'string');
      }
      const kref = kernel.getRootObject(vatID);
      const kpid = kernel.queueToKref(kref, method, args, resultPolicy);
      if (kpid) {
        kernel.kpRegisterInterest(kpid);
      }
      kernelStorage.emitCrankHashes();
      return kpid;
    },

    /**
     * Queue a method call to an object represented by a kmarshal token
     *
     * @param {any} target
     * @param {string|symbol} method
     * @param {unknown[]} args
     * @param {ResolutionPolicy} resultPolicy
     */
    queueToVatObject(target, method, args = [], resultPolicy = 'ignore') {
      const targetKref = krefOf(target);
      assert.typeof(targetKref, 'string');
      if (typeof method !== 'symbol') {
        assert.typeof(method, 'string');
      }
      const kpid = kernel.queueToKref(targetKref, method, args, resultPolicy);
      if (kpid) {
        kernel.kpRegisterInterest(kpid);
      }
      kernelStorage.emitCrankHashes();
      return kpid;
    },

    upgradeStaticVat(vatName, shouldPauseFirst, bundleID, options = {}) {
      const vatID = kernel.vatNameToID(vatName);
      let pauseTarget = null;
      if (shouldPauseFirst) {
        pauseTarget = kslot(kernel.getRootObject(vatID));
      }
      if (!options.upgradeMessage) {
        options.upgradeMessage = `vat ${vatName} upgraded`;
      }
      const result = controller.queueToVatRoot(
        'vatAdmin',
        'upgradeStaticVat',
        [vatID, pauseTarget, bundleID, options],
        'ignore',
      );
      // no emitCrankHashes here because queueToVatRoot did that
      return result;
    },

    /**
     * terminate a vat by ID
     *
     * This allows the host app to terminate any vat. The effect is
     * equivalent to the holder of the vat's `adminNode` calling
     * `E(adminNode).terminateWithFailure(reason)`, or the vat itself
     * calling `vatPowers.exitVatWithFailure(reason)`. It accepts a
     * reason capdata structure (use 'kser()' to build one), which
     * will be included in rejection data for the promise available to
     * `E(adminNode).done()`, just like the internal termination APIs.
     * Note that no slots/krefs are allowed in 'reason' when
     * terminating the vat externally.
     *
     * This is a superpower available only from the host app, not from
     * within vats, since `vatID` is merely a string and can be forged
     * trivially. The host app is responsible for supplying the right
     * vatID to kill, by looking at the database or logs (note that
     * vats do not know their own vatID, and `controller.vatNameToID`
     * only works for static vats, not dynamic).
     *
     * This will cause state changes in the swing-store (specifically
     * marking the vat as terminated, and rejection all its
     * outstanding promises), which must be committed before they will
     * be durable. Either call `hostStorage.commit()` immediately
     * after calling this, or call `controller.run()` and *then*
     * `hostStorage.commit()` as you would normally do in response to
     * other I/O or timer activity.
     *
     * The first `controller.run()` after this call will delete all
     * the old vat's state at once, unless you use a
     * [`runPolicy`](../../docs/run-policy.md) to rate-limit cleanups.
     *
     * @param {VatID} vatID
     * @param {SwingSetCapData} reasonCD
     */

    terminateVat(vatID, reasonCD) {
      insistCapData(reasonCD);
      assert(reasonCD.slots.length === 0, 'no slots allowed in reason');
      kernel.terminateVatExternally(vatID, reasonCD);
    },
  });

  writeSlogObject({ type: 'kernel-init-finish' });

  return controller;
}
/** @typedef {EReturn<typeof makeSwingsetController>} SwingsetController */

/**
 * NB: To be used only in tests. An app with this may not survive a reboot.
 *
 * This helper makes Swingset controllers and automatically initializes the
 * SwingSet if it isn't already. It will not work for use cases that need to
 * configure devices.
 *
 * The official API does these as two separate steps because the two sometimes
 * need to happen at different times.  In particular, sometimes you need the
 * host to be able to control whether or not to initialize independent of the
 * SwingSet's history.  Also sometimes you want different runtime options for
 * the two stages; this can happen, for example, in some debugging cases.
 *
 * @param {SwingSetConfig} config
 * @param {string[]} argv
 * @param {{
 *   kernelStorage?: SwingStoreKernelStorage;
 *   env?: Record<string, string>;
 *   verbose?: boolean;
 *   kernelBundles?: Record<string, Bundle>;
 *   debugPrefix?: string;
 *   slogCallbacks?: unknown;
 *   slogSender?: import('@agoric/telemetry').SlogSender;
 *   testTrackDecref?: unknown;
 *   warehousePolicy?: import('../types-external.js').VatWarehousePolicy;
 * }} runtimeOptions
 * @param {Record<string, unknown>} deviceEndowments
 * @typedef { import('@agoric/swing-store').KVStore } KVStore
 */
export async function buildVatController(
  config,
  argv = [],
  runtimeOptions = {},
  deviceEndowments = {},
) {
  const {
    env,
    verbose,
    kernelBundles: kernelAndOtherBundles = {},
    debugPrefix,
    slogCallbacks,
    warehousePolicy,
    slogSender,
  } = runtimeOptions;
  let { kernelStorage } = runtimeOptions;
  let hostStorage;
  if (!kernelStorage) {
    ({ kernelStorage, hostStorage } = initSwingStore());
  }
  const { kernel: kernelBundle, ...otherBundles } = kernelAndOtherBundles;
  const kernelBundles = runtimeOptions.kernelBundles ? otherBundles : undefined;

  const actualRuntimeOptions = {
    env,
    verbose,
    debugPrefix,
    slogCallbacks,
    warehousePolicy,
    slogSender,
    kernelBundle,
  };
  const initializationOptions = { verbose, kernelBundles };
  let bootstrapResult;
  await null;
  if (!swingsetIsInitialized(kernelStorage)) {
    bootstrapResult = await initializeSwingset(
      config,
      argv,
      kernelStorage,
      initializationOptions,
      runtimeOptions,
    );
  }
  const controller = await makeSwingsetController(
    kernelStorage,
    deviceEndowments,
    actualRuntimeOptions,
  );
  const shutdown = async () =>
    Promise.all([
      controller.shutdown(),
      hostStorage && hostStorage.close(),
    ]).then(() => {});
  return harden({ bootstrapResult, ...controller, shutdown });
}
