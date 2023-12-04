/* global globalThis, WeakRef, FinalizationRegistry */
/* eslint-disable @typescript-eslint/prefer-ts-expect-error -- https://github.com/Agoric/agoric-sdk/issues/4620 */

import process from 'process';
import crypto from 'crypto';
import { performance } from 'perf_hooks';
import { spawn as ambientSpawn } from 'child_process';
import fs from 'fs';
import { tmpName } from 'tmp';
import anylogger from 'anylogger';
import microtime from 'microtime';

import { assert, Fail } from '@agoric/assert';
import { importBundle } from '@endo/import-bundle';
import { initSwingStore } from '@agoric/swing-store';

import { mustMatch, M } from '@endo/patterns';
import { checkBundle } from '@endo/check-bundle/lite.js';
import engineGC from '@agoric/internal/src/lib-nodejs/engine-gc.js';
import { startSubprocessWorker } from '@agoric/internal/src/lib-nodejs/spawnSubprocessWorker.js';
import { waitUntilQuiescent } from '@agoric/internal/src/lib-nodejs/waitUntilQuiescent.js';
import { makeGcAndFinalize } from '@agoric/internal/src/lib-nodejs/gc-and-finalize.js';
import { kslot, krefOf } from '@agoric/kmarshal';
import { insistStorageAPI } from '../lib/storageAPI.js';
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

/** @param {string | ((args: unknown[]) => string)} tagOrTagCreator */
function makeConsole(tagOrTagCreator) {
  /** @type {(level: string) => (args: unknown[]) => void} */
  let makeLoggerForLevel;
  if (typeof tagOrTagCreator === 'function') {
    const tagToLogger = new Map();
    makeLoggerForLevel =
      level =>
      (...args) => {
        // Retrieve the logger from cache.
        const tag = tagOrTagCreator(args);
        let logger = tagToLogger.get(tag);
        if (!logger) {
          logger = anylogger(tag);
          tagToLogger.set(tag, logger);
        }
        // Actually log the message.
        return logger[level](...args);
      };
  } else {
    const logger = anylogger(tagOrTagCreator);
    makeLoggerForLevel = level => logger[level];
  }
  const cons = {};
  for (const level of ['debug', 'log', 'info', 'warn', 'error']) {
    cons[level] = makeLoggerForLevel(level);
  }
  return harden(cons);
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
  });
  const startSubprocessWorkerNode = makeStartSubprocessWorkerNode(
    startSubprocessWorker,
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

  // eslint-disable-next-line no-shadow
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

  function kernelRequire(what) {
    Fail`kernelRequire unprepared to satisfy require(${what})`;
  }
  writeSlogObject({ type: 'import-kernel-start' });
  const kernelNS = await importBundle(kernelBundle, {
    filePrefix: 'kernel/...',
    endowments: {
      console: makeConsole(`${debugPrefix}SwingSet:kernel`),
      assert,
      require: kernelRequire,
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
  /** @type { ReturnType<typeof import('../kernel').default> } */
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
   * @param {T} x
   * @returns {T}
   * @template T
   */
  const defensiveCopy = x => JSON.parse(JSON.stringify(x));

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
      return defensiveCopy(kernel.dump());
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

    changeKernelOptions(options) {
      kernel.changeKernelOptions(options);
    },

    getStats() {
      return defensiveCopy(kernel.getStats());
    },

    getStatus() {
      return defensiveCopy(kernel.getStatus());
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

    /**
     *
     * @param {string} vatName
     * @param {boolean} shouldPauseFirst
     * @param {string} bundleID
     * @param {{upgradeMessage?: string}} options
     * @returns {string | undefined}
     */
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
  });

  writeSlogObject({ type: 'kernel-init-finish' });

  return controller;
}
/** @typedef {Awaited<ReturnType<typeof makeSwingsetController>>} SwingsetController */

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
