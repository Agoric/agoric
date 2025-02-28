// @ts-check
/* eslint-env node */

// XXX the JSON configs specify that launching the chain requires @agoric/builders,
// so let the JS tooling know about it by importing it here.
import '@agoric/builders';

import anylogger from 'anylogger';

import { assert, Fail } from '@endo/errors';
import { E } from '@endo/far';
import bundleSource from '@endo/bundle-source';

import {
  buildMailbox,
  buildMailboxStateMap,
  buildTimer,
  buildBridge,
  swingsetIsInitialized,
  initializeSwingset,
  makeSwingsetController,
  loadBasedir,
  loadSwingsetConfigFile,
  normalizeConfig,
  upgradeSwingset,
} from '@agoric/swingset-vat';
import { waitUntilQuiescent } from '@agoric/internal/src/lib-nodejs/waitUntilQuiescent.js';
import { openSwingStore } from '@agoric/swing-store';
import { attenuate, BridgeId as BRIDGE_ID } from '@agoric/internal';
import { objectMapMutable, TRUE } from '@agoric/internal/src/js-utils.js';
import { makeWithQueue } from '@agoric/internal/src/queue.js';
import * as ActionType from '@agoric/internal/src/action-types.js';

import {
  extractCoreProposalBundles,
  mergeCoreProposals,
} from '@agoric/deploy-script-support/src/extract-proposal.js';
import { fileURLToPath } from 'url';
import { ValueType } from '@opentelemetry/api';

import {
  makeDefaultMeterProvider,
  exportKernelStats,
  makeSlogCallbacks,
} from './kernel-stats.js';

import { parseParams } from './params.js';
import { makeQueue, makeQueueStorageMock } from './helpers/make-queue.js';
import { exportStorage } from './export-storage.js';
import { parseLocatedJson } from './helpers/json.js';
import { computronCounter } from './computron-counter.js';

/** @import { BlockInfo } from '@agoric/internal/src/chain-utils.js' */
/** @import { Mailbox, RunPolicy, SwingSetConfig } from '@agoric/swingset-vat' */
/** @import { KVStore, BufferedKVStore } from './helpers/bufferedStorage.js' */

/** @typedef {ReturnType<typeof makeQueue<{context: any, action: any}>>} InboundQueue */

const { now } = Date;
/**
 * Convert a milliseconds timestamp from `now()` into milliseconds since the
 * POSIX epoch. The result will match (or approximately match) the input when
 * `now` is `Date.now`, but may differ dramatically when it is `performance.now`
 * or otherwise not already relative to the POSIX epoch.
 *
 * @param {ReturnType<typeof now>} nowMilliseconds
 * @returns {number}
 */
const toPosix = nowMilliseconds => {
  const offset = Date.now() - now();
  return offset + nowMilliseconds;
};

const console = anylogger('launch-chain');
const blockManagerConsole = anylogger('block-manager');

const blockHistogramMetricDesc = {
  valueType: ValueType.DOUBLE,
  unit: 's',
  advice: {
    explicitBucketBoundaries: [
      0.1, 0.2, 0.3, 0.4, 0.5, 1, 2, 3, 4, 5, 6, 7, 10, 15, 30,
    ],
  },
};
const BLOCK_HISTOGRAM_METRICS = /** @type {const} */ ({
  swingsetRunSeconds: {
    description: 'Per-block time spent executing SwingSet',
    ...blockHistogramMetricDesc,
  },
  swingsetChainSaveSeconds: {
    description: 'Per-block time spent propagating SwingSet state into cosmos',
    ...blockHistogramMetricDesc,
  },
  swingsetCommitSeconds: {
    description:
      'Per-block time spent committing SwingSet state to host storage',
    ...blockHistogramMetricDesc,
  },
  cosmosCommitSeconds: {
    description: 'Per-block time spent committing cosmos state',
    ...blockHistogramMetricDesc,
  },
  fullCommitSeconds: {
    description:
      'Per-block time spent committing state, inclusive of COMMIT_BLOCK processing plus time spent [outside of cosmic-swingset] before and after it',
    ...blockHistogramMetricDesc,
  },
  interBlockSeconds: {
    description: 'Time spent idle between blocks',
    ...blockHistogramMetricDesc,
  },
  afterCommitHangoverSeconds: {
    description:
      'Per-block time spent waiting for previous-block afterCommit work',
    ...blockHistogramMetricDesc,
  },
  blockLagSeconds: {
    description: 'The delay of each block from its expected begin time',
    ...blockHistogramMetricDesc,
    // Add buckets for excessively long delays.
    advice: {
      ...blockHistogramMetricDesc.advice,
      explicitBucketBoundaries: /** @type {number[]} */ ([
        ...blockHistogramMetricDesc.advice.explicitBucketBoundaries,
        ...[60, 120, 180, 240, 300, 600, 3600],
      ]),
    },
  },
});

/**
 * @param {{ info: string } | null | undefined} upgradePlan
 * @param {string} prefix
 */
const parseUpgradePlanInfo = (upgradePlan, prefix = '') => {
  const { info: upgradeInfoJson = null } = upgradePlan || {};

  const upgradePlanInfo =
    upgradeInfoJson &&
    parseLocatedJson(
      upgradeInfoJson,
      `${prefix && `${prefix} `}upgradePlan.info`,
    );

  return harden(upgradePlanInfo || {});
};

/**
 * @typedef {object} CosmicSwingsetConfig
 * @property {import('@agoric/deploy-script-support/src/extract-proposal.js').ConfigProposal[]} [coreProposals]
 * @property {string[]} [clearStorageSubtrees] chain storage paths identifying
 *   roots of subtrees for which data should be deleted (including overlaps with
 *   exportStorageSubtrees, which are *not* preserved).
 * @property {string[]} [exportStorageSubtrees] chain storage paths identifying roots of subtrees
 *   for which data should be exported into bootstrap vat parameter `chainStorageEntries`
 *   (e.g., `exportStorageSubtrees: ['c.o']` might result in vatParameters including
 *   `chainStorageEntries: [ ['c.o', '"top"'], ['c.o.i'], ['c.o.i.n', '42'], ['c.o.w', '"moo"'] ]`).
 */

/**
 * The phase associated with a controller run.
 *   - Leftover: work from a previous block
 *   - Forced: work that claims the entirety of the current block
 *   - Priority: queued work that precedes timer device advancement (e.g., oracle price updates)
 *   - Timer: work prompted by timer advancement to the new external time
 *   - Inbound: queued work that follows timer advancement (e.g., normal messages)
 *   - Cleanup: for dealing with data from terminated vats
 *
 * @enum {(typeof CrankerPhase)[keyof typeof CrankerPhase]} CrankerPhase
 */
const CrankerPhase = /** @type {const} */ ({
  Leftover: 'leftover',
  Forced: 'forced',
  Priority: 'priority',
  Timer: 'timer',
  Inbound: 'inbound',
  Cleanup: 'cleanup',
});

/**
 * Some phases correspond with inbound message queues.
 *
 * @enum {(typeof InboundQueueName)[keyof typeof InboundQueueName]} InboundQueueName
 */
const InboundQueueName = /** @type {const} */ ({
  Forced: CrankerPhase.Forced,
  Priority: CrankerPhase.Priority,
  Inbound: CrankerPhase.Inbound,
});

/**
 * @typedef {(phase: CrankerPhase) => Promise<boolean>} Cranker runs the kernel
 *   and reports if it is time to stop
 */

/**
 * Return the key in the reserved "host.*" section of the swing-store
 *
 * @param {string} path
 */
const getHostKey = path => `host.${path}`;

/**
 * @param {KVStore<Mailbox>} mailboxStorage
 * @param {((destPort: string, msg: unknown) => unknown)} bridgeOutbound
 * @param {SwingStoreKernelStorage} kernelStorage
 * @param {import('@endo/far').ERef<string | SwingSetConfig> | (() => ERef<string | SwingSetConfig>)} getVatConfig
 * @param {unknown} bootstrapArgs JSON-serializable data
 * @param {{}} env
 * @param {*} options
 */
export async function buildSwingset(
  mailboxStorage,
  bridgeOutbound,
  kernelStorage,
  getVatConfig,
  bootstrapArgs,
  env,
  {
    callerWillEvaluateCoreProposals = !!bridgeOutbound,
    debugName = undefined,
    slogCallbacks,
    slogSender,
    verbose,
    profileVats,
    debugVats,
    warehousePolicy,
  },
) {
  const debugPrefix = debugName === undefined ? '' : `${debugName}:`;
  const mbs = buildMailboxStateMap(mailboxStorage);

  const bridgeDevice = buildBridge(bridgeOutbound);
  const mailboxDevice = buildMailbox(mbs);
  const timerDevice = buildTimer();

  const deviceEndowments = {
    mailbox: { ...mailboxDevice.endowments },
    timer: { ...timerDevice.endowments },
    bridge: { ...bridgeDevice.endowments },
  };

  async function ensureSwingsetInitialized() {
    if (swingsetIsInitialized(kernelStorage)) {
      return;
    }

    const { config, configLocation } = await (async () => {
      const objOrPath = await (typeof getVatConfig === 'function'
        ? getVatConfig()
        : getVatConfig);
      if (typeof objOrPath === 'string') {
        const path = objOrPath;
        const configFromFile = await loadSwingsetConfigFile(path);
        const obj = configFromFile || loadBasedir(path);
        return { config: obj, configLocation: path };
      }
      await normalizeConfig(objOrPath);
      return { config: objOrPath, configLocation: undefined };
    })();

    config.devices = {
      mailbox: {
        sourceSpec: mailboxDevice.srcPath,
      },
      timer: {
        sourceSpec: timerDevice.srcPath,
      },
    };

    if (bridgeDevice) {
      config.devices.bridge = {
        sourceSpec: bridgeDevice.srcPath,
      };
    }

    const {
      coreProposals,
      clearStorageSubtrees,
      exportStorageSubtrees = [],
      ...swingsetConfig
    } = /** @type {SwingSetConfig & CosmicSwingsetConfig} */ (config);

    // XXX `initializeSwingset` does not have a default for the `bootstrap` property;
    // should we universally ensure its presence above?
    const bootVat =
      swingsetConfig.vats[swingsetConfig.bootstrap || 'bootstrap'];

    const batchChainStorage = (method, args) =>
      bridgeOutbound(BRIDGE_ID.STORAGE, { method, args });

    // Extract data from chain storage as [path, value?] pairs.
    const chainStorageEntries = exportStorage(
      batchChainStorage,
      exportStorageSubtrees,
      clearStorageSubtrees,
    );
    bootVat.parameters = { ...bootVat.parameters, chainStorageEntries };

    // Since only on-chain swingsets like `agd` have a bridge (and thereby
    // `CORE_EVAL` support), things like `ag-solo` will need to do the
    // coreProposals in the bootstrap vat.
    let bridgedCoreProposals;
    if (callerWillEvaluateCoreProposals) {
      // We have a bridge to run the coreProposals, so do it in the caller.
      bridgedCoreProposals = coreProposals;
    } else if (coreProposals) {
      // We don't have a bridge to run the coreProposals, so do it in the bootVat.
      const { bundles, codeSteps } = await extractCoreProposalBundles(
        coreProposals,
        configLocation, // for path resolution
      );
      swingsetConfig.bundles = { ...swingsetConfig.bundles, ...bundles };
      bootVat.parameters = {
        ...bootVat.parameters,
        coreProposalCodeSteps: codeSteps,
      };
    }

    swingsetConfig.pinBootstrapRoot = true;
    await initializeSwingset(swingsetConfig, bootstrapArgs, kernelStorage, {
      // @ts-expect-error debugPrefix? what's that?
      debugPrefix,
    });
    // Let our caller schedule our core proposals.
    return bridgedCoreProposals;
  }

  const pendingCoreProposals = await ensureSwingsetInitialized();
  const { modified } = upgradeSwingset(kernelStorage);
  const controller = await makeSwingsetController(
    kernelStorage,
    deviceEndowments,
    {
      env,
      slogCallbacks,
      slogSender,
      verbose,
      profileVats,
      debugVats,
      warehousePolicy,
    },
  );

  // We DON'T want to run the kernel yet, only when the application decides
  // (either on bootstrap block (0) or in endBlock).

  return {
    coreProposals: pendingCoreProposals,
    controller,
    kernelHasUpgradeEvents: modified,
    mb: mailboxDevice,
    bridgeInbound: bridgeDevice.deliverInbound,
    timer: timerDevice,
  };
}

/**
 * @typedef {RunPolicy & {
 *   shouldRun(): boolean;
 *   remainingBeans(): bigint | undefined;
 *   totalBeans(): bigint;
 *   startCleanup(): boolean;
 * }} ChainRunPolicy
 */

/**
 * @template [T=unknown]
 * @typedef {object} LaunchOptions
 * @property {import('./helpers/make-queue.js').QueueStorage} actionQueueStorage
 * @property {import('./helpers/make-queue.js').QueueStorage} highPriorityQueueStorage
 * @property {string} [kernelStateDBDir]
 * @property {import('@agoric/swing-store').SwingStore} [swingStore]
 * @property {BufferedKVStore<Mailbox>} mailboxStorage
 *   TODO: Merge together BufferedKVStore and QueueStorage (get/set/delete/commit/abort)
 * @property {() => Promise<unknown>} clearChainSends
 * @property {() => void} replayChainSends
 * @property {((destPort: string, msg: unknown) => unknown)} bridgeOutbound
 * @property {() => ({publish: (value: unknown) => Promise<void>})} [makeInstallationPublisher]
 * @property {import('@endo/far').ERef<string | SwingSetConfig> | (() => ERef<string | SwingSetConfig>)} vatconfig
 *   either an object or a path to a file which JSON-decodes into an object,
 *   provided directly or through a thunk and/or promise. If the result is an
 *   object, it may be mutated to normalize and/or extend it.
 * @property {unknown} argv for the bootstrap vat (and despite the name, usually
 *   an object rather than an array)
 * @property {typeof process['env']} [env]
 * @property {string} [debugName]
 * @property {boolean} [verboseBlocks]
 * @property {ReturnType<typeof import('./kernel-stats.js').makeDefaultMeterProvider>} [metricsProvider]
 * @property {import('@agoric/telemetry').SlogSender} [slogSender]
 * @property {string} [swingStoreTraceFile]
 * @property {(...args: unknown[]) => Promise<void> | void} [swingStoreExportCallback]
 * @property {boolean} [keepSnapshots]
 * @property {boolean} [keepTranscripts]
 * @property {ReturnType<typeof import('@agoric/swing-store').makeArchiveSnapshot>} [archiveSnapshot]
 * @property {ReturnType<typeof import('@agoric/swing-store').makeArchiveTranscript>} [archiveTranscript]
 * @property {() => object | Promise<object>} [afterCommitCallback]
 * @property {import('./chain-main.js').CosmosSwingsetConfig} swingsetConfig
 *   TODO refactor to clarify relationship vs. import('@agoric/swingset-vat').SwingSetConfig
 *   --- maybe partition into in-consensus "config" vs. consensus-independent "options"?
 *   (which would mostly just require `bundleCachePath` to become a `buildSwingset` input)
 */

/**
 * @param {LaunchOptions} options
 */
export async function launchAndShareInternals({
  actionQueueStorage,
  highPriorityQueueStorage,
  kernelStateDBDir,
  swingStore,
  mailboxStorage,
  clearChainSends,
  replayChainSends,
  bridgeOutbound,
  makeInstallationPublisher,
  vatconfig,
  argv,
  env = process.env,
  debugName = undefined,
  verboseBlocks = false,
  metricsProvider = makeDefaultMeterProvider(),
  slogSender,
  swingStoreTraceFile,
  swingStoreExportCallback,
  keepSnapshots,
  keepTranscripts,
  archiveSnapshot,
  archiveTranscript,
  afterCommitCallback = async () => ({}),
  swingsetConfig,
}) {
  console.info('Launching SwingSet kernel');

  // The swingstore export-data callback gives us export-data records,
  // which must be written into IAVL by sending them over to the
  // golang side with swingStoreExportCallback . However, that
  // callback isn't ready right away, so if e.g. openSwingStore() were
  // to invoke it, we might lose those records. Likewise
  // saveOutsideState() gathers the chainSends just before calling
  // commit, so if the callback were invoked during commit(), those
  // records would be left for a subsequent block, which would break
  // consensus if the node crashed before the next commit. So this
  // `allowExportCallback` flag serves to catch these two cases.
  //
  // Note that swingstore is within its rights to call exportCallback
  // during openSwingStore() or commit(), it just happens to not do so
  // right now. If that changes under maintenance, this guard should
  // turn a corruption bug into a crash bug. See
  // https://github.com/Agoric/agoric-sdk/issues/9655 for details

  let allowExportCallback = false;

  // The swingStore's exportCallback is synchronous, however we allow the
  // callback provided to launch-chain to be asynchronous. The callbacks are
  // invoked sequentially like if they were awaited, and the block manager
  // synchronizes before finishing END_BLOCK
  let pendingSwingStoreExport = Promise.resolve();
  const swingStoreExportSyncCallback = (() => {
    if (!swingStoreExportCallback) return undefined;
    const enqueueSwingStoreExportCallback = makeWithQueue()(
      swingStoreExportCallback,
    );
    return updates => {
      assert(allowExportCallback, 'export-data callback called at bad time');
      pendingSwingStoreExport = enqueueSwingStoreExportCallback(updates);
    };
  })();

  if (swingStore) {
    !swingStoreExportCallback ||
      Fail`swingStoreExportCallback is not compatible with a provided swingStore; either drop the former or allow launch to open the latter`;
    kernelStateDBDir === undefined ||
      kernelStateDBDir === swingStore.internal.dirPath ||
      Fail`provided kernelStateDBDir does not match provided swingStore`;
  }
  const { kernelStorage, hostStorage } =
    swingStore ||
    openSwingStore(/** @type {string} */ (kernelStateDBDir), {
      traceFile: swingStoreTraceFile,
      exportCallback: swingStoreExportSyncCallback,
      keepSnapshots,
      keepTranscripts,
      archiveSnapshot,
      archiveTranscript,
    });
  const { kvStore, commit } = hostStorage;

  /** @type {InboundQueue} */
  const actionQueue = makeQueue(actionQueueStorage);
  /** @type {InboundQueue} */
  const highPriorityQueue = makeQueue(highPriorityQueueStorage);
  /**
   * In memory queue holding actions that must be consumed entirely
   * during the block. If it's not drained, we open the gates to
   * hangover hell.
   *
   * @type {InboundQueue}
   */
  const runThisBlock = makeQueue(makeQueueStorageMock().storage);

  // Not to be confused with the gas model, this meter is for OpenTelemetry.
  const metricMeter = metricsProvider.getMeter('ag-chain-cosmos');

  const knownActionTypes = new Set(Object.values(ActionType.QueuedActionType));

  const processedInboundActionCounter = metricMeter.createCounter(
    'cosmic_swingset_inbound_actions',
    { description: 'Processed inbound action counts by type' },
  );

  /** @type {(actionType: ActionType.QueuedActionType) => void} */
  const countInboundAction = actionType => {
    if (!knownActionTypes.has(actionType)) {
      console.warn(`unknown inbound action type ${JSON.stringify(actionType)}`);
    }
    processedInboundActionCounter.add(1, { actionType });
  };
  const slogCallbacks = makeSlogCallbacks({
    metricMeter,
  });

  console.debug(`buildSwingset`);
  const warehousePolicy = {
    maxVatsOnline: swingsetConfig.maxVatsOnline,
  };
  const {
    coreProposals: bootstrapCoreProposals,
    controller,
    kernelHasUpgradeEvents,
    mb,
    bridgeInbound,
    timer,
  } = await buildSwingset(
    mailboxStorage,
    bridgeOutbound,
    kernelStorage,
    vatconfig,
    argv,
    env,
    {
      debugName,
      slogCallbacks,
      slogSender,
      warehousePolicy,
    },
  );

  /** @type {{publish: (value: unknown) => Promise<void>} | undefined} */
  let installationPublisher;

  // Artificially create load if set.
  const END_BLOCK_SPIN_MS = env.END_BLOCK_SPIN_MS
    ? parseInt(env.END_BLOCK_SPIN_MS, 10)
    : 0;

  const initialQueueLengths = /** @type {Record<InboundQueueName, number>} */ ({
    [InboundQueueName.Forced]: runThisBlock.size(),
    [InboundQueueName.Priority]: highPriorityQueue.size(),
    [InboundQueueName.Inbound]: actionQueue.size(),
  });
  const { crankScheduler, inboundQueueMetrics } = exportKernelStats({
    controller,
    metricMeter,
    // @ts-expect-error Type 'Logger<BaseLevels>' is not assignable to type 'Console'.
    log: console,
    initialQueueLengths,
  });

  const blockMetrics = objectMapMutable(BLOCK_HISTOGRAM_METRICS, (desc, name) =>
    metricMeter.createHistogram(name, desc),
  );

  /**
   * @param {number} blockHeight
   * @param {ChainRunPolicy} runPolicy
   * @returns {Cranker}
   */
  function makeRunSwingset(blockHeight, runPolicy) {
    let runNum = 0;
    async function runSwingset(phase) {
      if (phase === CrankerPhase.Cleanup) {
        const allowCleanup = runPolicy.startCleanup();
        if (!allowCleanup) return false;
      }
      const startBeans = runPolicy.totalBeans();
      controller.writeSlogObject({
        type: 'cosmic-swingset-run-start',
        blockHeight,
        runNum,
        phase,
        startBeans,
        remainingBeans: runPolicy.remainingBeans(),
      });
      // TODO: crankScheduler does a schedulerBlockTimeHistogram thing
      // that needs to be revisited, it used to be called once per
      // block, now it's once per processed inbound queue item
      await crankScheduler(runPolicy);
      const finishBeans = runPolicy.totalBeans();
      controller.writeSlogObject({
        type: 'kernel-stats',
        stats: controller.getStats(),
      });
      controller.writeSlogObject({
        type: 'cosmic-swingset-run-finish',
        blockHeight,
        runNum,
        phase,
        startBeans,
        finishBeans,
        usedBeans: finishBeans - startBeans,
        remainingBeans: runPolicy.remainingBeans(),
      });
      runNum += 1;
      return runPolicy.shouldRun();
    }
    return runSwingset;
  }

  async function bootstrapBlock(blockHeight, blockTime, params) {
    // We need to let bootstrap know of the chain time. The time of the first
    // block may be the genesis time, or the block time of the upgrade block.
    timer.poll(blockTime);
    // This is before the initial block, we need to finish processing the
    // entire bootstrap before opening for business.
    const runPolicy = computronCounter(params, true);
    const runSwingset = makeRunSwingset(blockHeight, runPolicy);

    await runSwingset(CrankerPhase.Forced);
  }

  async function saveChainState() {
    // Save the mailbox state.
    await mailboxStorage.commit();
  }

  async function saveOutsideState(blockHeight) {
    allowExportCallback = false;
    const chainSends = await clearChainSends();
    kvStore.set(getHostKey('height'), `${blockHeight}`);
    kvStore.set(getHostKey('chainSends'), JSON.stringify(chainSends));

    await commit();
  }

  async function doKernelUpgradeEvents(inboundNum) {
    controller.writeSlogObject({
      type: 'cosmic-swingset-inject-kernel-upgrade-events',
      inboundNum,
    });
    controller.injectQueuedUpgradeEvents();
  }

  async function deliverInbound(sender, messages, ack, inboundNum) {
    Array.isArray(messages) || Fail`inbound given non-Array: ${messages}`;
    controller.writeSlogObject({
      type: 'cosmic-swingset-deliver-inbound',
      inboundNum,
      sender,
      count: messages.length,
      messages,
      ack,
    });
    if (!mb.deliverInbound(sender, messages, ack)) {
      return;
    }
    console.debug(`mboxDeliver:   ADDED messages`);
  }

  async function doBridgeInbound(source, body, inboundNum) {
    controller.writeSlogObject({
      type: 'cosmic-swingset-bridge-inbound',
      inboundNum,
      source,
      body,
    });
    if (!bridgeInbound) throw Fail`bridgeInbound undefined`;
    // console.log(`doBridgeInbound`);
    // the inbound bridge will push messages onto the kernel run-queue for
    // delivery+dispatch to some handler vat
    bridgeInbound(source, body);
  }

  async function installBundle(bundleJson, inboundNum) {
    let bundle;
    try {
      bundle = JSON.parse(bundleJson);
    } catch (e) {
      blockManagerConsole.warn('INSTALL_BUNDLE warn:', e);
      return;
    }
    harden(bundle);

    const error = await controller.validateAndInstallBundle(bundle).then(
      () => null,
      (/** @type {unknown} */ errorValue) => errorValue,
    );

    const { endoZipBase64Sha512 } = bundle;

    controller.writeSlogObject({
      type: 'cosmic-swingset-install-bundle',
      inboundNum,
      endoZipBase64Sha512,
      error,
    });

    if (installationPublisher === undefined) {
      return;
    }

    await installationPublisher.publish(
      harden({
        endoZipBase64Sha512,
        installed: error === null,
        error,
      }),
    );
  }

  function provideInstallationPublisher() {
    if (
      installationPublisher === undefined &&
      makeInstallationPublisher !== undefined
    ) {
      installationPublisher = makeInstallationPublisher();
    }
  }

  let savedHeight = Number(kvStore.get(getHostKey('height')) || 0);
  let savedBeginHeight = Number(
    kvStore.get(getHostKey('beginHeight')) || savedHeight,
  );
  /**
   * duration of the latest swingset execution in either END_BLOCK or
   * once-per-chain bootstrap (the latter excluding "bridged" core proposals
   * that run outside the bootstrap vat)
   */
  let runDuration = NaN;
  /** duration of the latest saveChainState(), which commits mailbox data to chain storage */
  let chainSaveDuration = NaN;
  /** duration of the latest saveOutsideState(), which commits to swing-store host storage */
  let swingsetCommitDuration = NaN;
  let blockParams;
  let decohered;
  /** @type {undefined | Promise<void>} */
  let afterCommitWorkDone;
  /** Timestamps that are relevant across block lifecycle events. */
  const times = {
    endBlockDone: NaN,
    commitBlockDone: NaN,
    afterCommitBlockDone: NaN,
    previousBeginBlockPosix: NaN,
  };

  /**
   * Dispatch an action from an inbound queue to an appropriate handler based on
   * action type.
   *
   * @param {{ type: ActionType.QueuedActionType } & Record<string, unknown>} action
   * @param {string} inboundNum
   * @returns {Promise<void>}
   */
  async function performAction(action, inboundNum) {
    // blockManagerConsole.error('Performing action', action);
    let p;

    switch (action.type) {
      case ActionType.DELIVER_INBOUND: {
        p = deliverInbound(
          action.peer,
          action.messages,
          action.ack,
          inboundNum,
        );
        break;
      }

      case ActionType.VBANK_BALANCE_UPDATE: {
        p = doBridgeInbound(BRIDGE_ID.BANK, action, inboundNum);
        break;
      }

      case ActionType.IBC_EVENT: {
        p = doBridgeInbound(BRIDGE_ID.DIBC, action, inboundNum);
        break;
      }

      case ActionType.VTRANSFER_IBC_EVENT: {
        p = doBridgeInbound(BRIDGE_ID.VTRANSFER, action, inboundNum);
        break;
      }

      case ActionType.PLEASE_PROVISION: {
        p = doBridgeInbound(BRIDGE_ID.PROVISION, action, inboundNum);
        break;
      }

      case ActionType.KERNEL_UPGRADE_EVENTS: {
        p = doKernelUpgradeEvents(inboundNum);
        break;
      }

      case ActionType.INSTALL_BUNDLE: {
        p = installBundle(action.bundle, inboundNum);
        break;
      }

      case ActionType.CORE_EVAL: {
        p = doBridgeInbound(BRIDGE_ID.CORE, action, inboundNum);
        break;
      }

      case ActionType.WALLET_ACTION: {
        p = doBridgeInbound(BRIDGE_ID.WALLET, action, inboundNum);
        break;
      }

      case ActionType.WALLET_SPEND_ACTION: {
        p = doBridgeInbound(BRIDGE_ID.WALLET, action, inboundNum);
        break;
      }

      default: {
        Fail`${action.type} not recognized`;
      }
    }
    return p;
  }

  /**
   * Process as much as we can from an inbound queue, which contains
   * first the old actions not previously processed, followed by actions
   * newly added, running the kernel to completion after each.
   *
   * @param {InboundQueue} inboundQueue
   * @param {Cranker} runSwingset
   * @param {InboundQueueName} phase
   */
  async function processActions(inboundQueue, runSwingset, phase) {
    let keepGoing = true;
    for await (const { action, context } of inboundQueue.consumeAll()) {
      const inboundNum = `${context.blockHeight}-${context.txHash}-${context.msgIdx}`;
      inboundQueueMetrics.decStat(phase);
      countInboundAction(action.type);
      await performAction(action, inboundNum);
      keepGoing = await runSwingset(phase);
      if (!keepGoing) {
        // any leftover actions will remain on the inbound queue for possible
        // processing in the next block
        break;
      }
    }
    return keepGoing;
  }

  /**
   * Trigger the Swingset runs for this block, stopping when out of relevant
   * work or when instructed to (whichever comes first).
   *
   * @param {Cranker} runSwingset
   * @param {BlockInfo['blockHeight']} blockHeight
   * @param {BlockInfo['blockTime']} blockTime
   */
  async function processBlockActions(runSwingset, blockHeight, blockTime) {
    // First, complete leftover work, if any
    let keepGoing = await runSwingset(CrankerPhase.Leftover);
    if (!keepGoing) return;

    // Then, if we have anything in the special runThisBlock queue, process
    // it and do no further work.
    if (runThisBlock.size()) {
      await processActions(runThisBlock, runSwingset, CrankerPhase.Forced);
      return;
    }

    // Then, process as much as we can from the priorityQueue.
    keepGoing = await processActions(
      highPriorityQueue,
      runSwingset,
      CrankerPhase.Priority,
    );
    if (!keepGoing) return;

    // Then, update the timer device with the new external time, which might
    // push work onto the kernel run-queue (if any timers were ready to wake).
    const addedToQueue = timer.poll(blockTime);
    controller.writeSlogObject({
      type: 'cosmic-swingset-timer-poll',
      blockHeight,
      blockTime,
      added: addedToQueue,
    });
    console.debug(
      `polled; blockTime:${blockTime}, h:${blockHeight}; ADDED =`,
      addedToQueue,
    );
    // We must run the kernel even if nothing was added since the kernel
    // only notes state exports and updates consistency hashes when attempting
    // to perform a crank.
    keepGoing = await runSwingset(CrankerPhase.Timer);
    if (!keepGoing) return;

    // Finally, process as much as we can from the actionQueue.
    await processActions(actionQueue, runSwingset, CrankerPhase.Inbound);

    // Cleanup after terminated vats as allowed.
    await runSwingset(CrankerPhase.Cleanup);
  }

  async function endBlock(blockHeight, blockTime, params) {
    // This is called once per block, during the END_BLOCK event, and
    // only when we know that cosmos is in sync (else we'd skip kernel
    // execution).

    // First, record new actions (bridge/mailbox/etc events that cosmos
    // added up for delivery to swingset) into our inboundQueue metrics
    const newLengths = /** @type {Record<InboundQueueName, number>} */ ({
      [InboundQueueName.Forced]: runThisBlock.size(),
      [InboundQueueName.Priority]: highPriorityQueue.size(),
      [InboundQueueName.Inbound]: actionQueue.size(),
    });
    inboundQueueMetrics.updateLengths(newLengths);

    // If we have work to complete this block, it needs to run to completion.
    // It will also run to completion any work that swingset still had pending.
    const neverStop = runThisBlock.size() > 0;

    // Process the work for this block using a dedicated Cranker with a stateful
    // run policy.
    const runPolicy = computronCounter(params, neverStop);
    const runSwingset = makeRunSwingset(blockHeight, runPolicy);
    await processBlockActions(runSwingset, blockHeight, blockTime);

    if (END_BLOCK_SPIN_MS) {
      // Introduce a busy-wait to artificially put load on the chain.
      const startTime = now();
      while (now() - startTime < END_BLOCK_SPIN_MS);
    }
  }

  /**
   * @template T
   * @param {string} label
   * @param {() => Promise<T>} fn
   * @param {() => void} onSettled
   */
  function withErrorLogging(label, fn, onSettled) {
    const p = fn();
    void E.when(p, onSettled, err => {
      blockManagerConsole.error(label, 'error:', err);
      onSettled();
    });
    return p;
  }

  function blockNeedsExecution(blockHeight) {
    if (savedHeight === 0) {
      // 0 is the default we use when the DB is empty, so we've only executed
      // the bootstrap block but no others. The first non-bootstrap block can
      // have an arbitrary height (the chain may not start at 1), but since the
      // bootstrap block doesn't commit (and doesn't have a begin/end) there is
      // no risk of hangover inconsistency for the first block, and it can
      // always be executed.
      return true;
    }

    if (blockHeight === savedHeight + 1) {
      // execute the next block
      return true;
    }

    if (blockHeight === savedHeight) {
      // we have already committed this block, so "replay" by not executing
      // (but returning all the results from the last time)
      return false;
    }

    // we're being asked to rewind by more than one block, or execute something
    // more than one block in the future, neither of which we can accommodate.
    // Keep throwing forever.
    decohered = Error(
      // TODO unimplemented
      `Unimplemented reset state from ${savedHeight} to ${blockHeight}`,
    );
    throw decohered;
  }

  function saveBeginHeight(blockHeight) {
    savedBeginHeight = blockHeight;
    kvStore.set(getHostKey('beginHeight'), `${savedBeginHeight}`);
  }

  /** @type {(blockHeight: BlockInfo['blockHeight'], blockTime: BlockInfo['blockTime']) => Promise<void>} */
  async function afterCommit(blockHeight, blockTime) {
    await waitUntilQuiescent()
      .then(afterCommitCallback)
      .then((afterCommitStats = {}) => {
        controller.writeSlogObject({
          type: 'cosmic-swingset-after-commit-stats',
          blockHeight,
          blockTime,
          ...afterCommitStats,
        });
      });
  }

  const doBootstrap = async action => {
    const { blockTime, blockHeight, params } = action;
    controller.writeSlogObject({
      type: 'cosmic-swingset-bootstrap-block-start',
      blockTime,
    });

    await null;
    try {
      verboseBlocks && blockManagerConsole.info('block bootstrap');
      (savedHeight === 0 && savedBeginHeight === 0) ||
        Fail`Cannot run a bootstrap block at height ${savedHeight}`;
      const bootstrapBlockParams = parseParams(params);

      // Start a block transaction, but without changing state
      // for the upcoming begin block check
      saveBeginHeight(savedBeginHeight);
      const start = now();
      await withErrorLogging(
        action.type,
        () => bootstrapBlock(blockHeight, blockTime, bootstrapBlockParams),
        () => {
          runDuration += now() - start;
        },
      );
    } finally {
      controller.writeSlogObject({
        type: 'cosmic-swingset-bootstrap-block-finish',
        blockTime,
      });
    }
  };

  const doCoreProposals = async ({ blockHeight, blockTime }, coreProposals) => {
    controller.writeSlogObject({
      type: 'cosmic-swingset-upgrade-start',
      blockHeight,
      blockTime,
      coreProposals,
    });

    await null;
    try {
      // Start a block transaction, but without changing state
      // for the upcoming begin block check
      saveBeginHeight(savedBeginHeight);

      // Find scripts relative to our location.
      const myFilename = fileURLToPath(import.meta.url);
      const { bundles, codeSteps: coreEvalCodeSteps } =
        await extractCoreProposalBundles(coreProposals, myFilename, {
          handleToBundleSpec: async (handle, source, _sequence, _piece) => {
            const bundle = await bundleSource(source);
            const { endoZipBase64Sha512: hash } = bundle;
            const bundleID = `b1-${hash}`;
            handle.bundleID = bundleID;
            harden(handle);
            return harden([`${bundleID}: ${source}`, bundle]);
          },
        });

      for (const [meta, bundle] of Object.entries(bundles)) {
        await controller
          .validateAndInstallBundle(bundle)
          .catch(e => Fail`Cannot validate and install ${meta}: ${e}`);
      }

      // Now queue each step's code for evaluation.
      for (const [key, coreEvalCode] of Object.entries(coreEvalCodeSteps)) {
        const coreEvalAction = {
          type: ActionType.CORE_EVAL,
          blockHeight,
          blockTime,
          evals: [
            {
              json_permits: 'true',
              js_code: coreEvalCode,
            },
          ],
        };
        runThisBlock.push({
          context: {
            blockHeight,
            txHash: 'x/upgrade',
            msgIdx: key,
          },
          action: coreEvalAction,
        });
      }
    } finally {
      controller.writeSlogObject({
        type: 'cosmic-swingset-upgrade-finish',
        blockHeight,
        blockTime,
      });
    }
  };

  // Handle block related actions
  // Some actions that are integration specific may be handled by the caller
  // For example SWING_STORE_EXPORT is handled in chain-main.js
  async function doBlockingSend(action) {
    await null;
    // blockManagerConsole.warn(
    //   'FIGME: blockHeight',
    //   action.blockHeight,
    //   'received',
    //   action.type,
    // );
    switch (action.type) {
      case ActionType.AG_COSMOS_INIT: {
        allowExportCallback = true; // cleared by saveOutsideState in COMMIT_BLOCK
        const { blockHeight, isBootstrap, upgradeDetails } = action;
        // TODO: parseParams(action.params), for validation?

        if (!blockNeedsExecution(blockHeight)) {
          return true;
        }

        const softwareUpgradeCoreProposals = upgradeDetails?.coreProposals;

        const { coreProposals: upgradeInfoCoreProposals } =
          parseUpgradePlanInfo(upgradeDetails?.plan, ActionType.AG_COSMOS_INIT);

        if (isBootstrap) {
          // This only runs for the very first block on the chain.
          await doBootstrap(action);
        }

        // The reboot-time upgradeSwingset() may have generated some
        // remediation events that need to be injected at the right
        // time (after catchup, before proposals). Push them onto
        // runThisBlock before anything else goes there.
        if (kernelHasUpgradeEvents) {
          isBootstrap ||
            upgradeDetails ||
            Fail`Unexpected kernel upgrade events outside of consensus start`;
          const txHash = 'x/kernel-upgrade-events';
          const context = { blockHeight, txHash, msgIdx: 0 };
          runThisBlock.push({
            action: { type: ActionType.KERNEL_UPGRADE_EVENTS },
            context,
          });
        }

        // Concatenate together any pending core proposals from chain bootstrap
        // with any from this inbound init action, then execute them all.
        const coreProposals = mergeCoreProposals(
          bootstrapCoreProposals,
          softwareUpgradeCoreProposals,
          upgradeInfoCoreProposals,
        );
        if (coreProposals.steps.length) {
          isBootstrap ||
            upgradeDetails ||
            Fail`Unexpected core proposals outside of consensus start`;
          await doCoreProposals(action, coreProposals);
        }
        return true;
      }

      case ActionType.COMMIT_BLOCK: {
        const { blockHeight, blockTime } = action;
        verboseBlocks &&
          blockManagerConsole.info('block', blockHeight, 'commit');
        if (blockHeight !== savedHeight) {
          throw Error(
            `Committed height ${blockHeight} does not match saved height ${savedHeight}`,
          );
        }

        runThisBlock.size() === 0 ||
          Fail`We didn't process all "run this block" actions`;

        controller.writeSlogObject({
          type: 'cosmic-swingset-commit-block-start',
          blockHeight,
          blockTime,
        });

        // Save the kernel's computed state just before the chain commits.
        const start = now();
        await saveOutsideState(savedHeight);
        swingsetCommitDuration = now() - start;

        blockParams = undefined;

        blockManagerConsole.debug(
          `wrote SwingSet checkpoint [run=${runDuration}ms, chainSave=${chainSaveDuration}ms, kernelSave=${swingsetCommitDuration}ms]`,
        );

        times.commitBlockDone = now();

        return undefined;
      }

      case ActionType.AFTER_COMMIT_BLOCK: {
        const { blockHeight, blockTime } = action;

        const afterCommitStart = now();
        // Time spent since the end of COMMIT_BLOCK (which itself is dominated
        // by swingsetCommitDuration).
        const cosmosCommitDuration = afterCommitStart - times.commitBlockDone;
        // Time spent since the end of END_BLOCK (inclusive of COMMIT_BLOCK).
        const fullCommitDuration = afterCommitStart - times.endBlockDone;

        controller.writeSlogObject({
          type: 'cosmic-swingset-commit-block-finish',
          blockHeight,
          blockTime,
          runSeconds: runDuration / 1000,
          // TODO: After preparing all known consumers, rename
          // {chain,save,fullSave}Time to
          // {chainSave,swingsetCommit,cosmosCommit}Seconds
          chainTime: chainSaveDuration / 1000,
          saveTime: swingsetCommitDuration / 1000,
          cosmosCommitSeconds: cosmosCommitDuration / 1000,
          fullSaveTime: fullCommitDuration / 1000,
        });

        blockMetrics.swingsetRunSeconds.record(runDuration / 1000);
        blockMetrics.swingsetChainSaveSeconds.record(chainSaveDuration / 1000);
        blockMetrics.swingsetCommitSeconds.record(
          swingsetCommitDuration / 1000,
        );
        blockMetrics.cosmosCommitSeconds.record(cosmosCommitDuration / 1000);
        blockMetrics.fullCommitSeconds.record(fullCommitDuration / 1000);

        afterCommitWorkDone = afterCommit(blockHeight, blockTime);

        // In the expected case where afterCommit work finishes before the next
        // block starts, don't incorrectly attribute `await` time to it.
        const latestAfterCommitP = afterCommitWorkDone;
        void afterCommitWorkDone.then(() => {
          afterCommitWorkDone === latestAfterCommitP ||
            Fail`Unexpected afterCommit overlap`;
          afterCommitWorkDone = undefined;
        });

        times.afterCommitBlockDone = now();

        return undefined;
      }

      case ActionType.BEGIN_BLOCK: {
        const beginBlockTimestamp = now();
        const interBlockDuration =
          beginBlockTimestamp - times.afterCommitBlockDone;

        // Awaiting completion of afterCommitWorkDone ensures that timings
        // correspond exclusively with work for a single block.
        let hangoverTimestamp = beginBlockTimestamp;
        if (afterCommitWorkDone) {
          await afterCommitWorkDone;
          hangoverTimestamp = now();
        }
        const afterCommitHangover = hangoverTimestamp - beginBlockTimestamp;

        allowExportCallback = true; // cleared by saveOutsideState in COMMIT_BLOCK
        const { blockHeight, blockTime, params } = action;
        blockParams = parseParams(params);
        verboseBlocks &&
          blockManagerConsole.info('block', blockHeight, 'begin');
        runDuration = 0;
        // blockTime is decided in consensus when starting to execute the
        // *previous* block.
        // TODO: Link to documentation of this.
        const blockLag = times.previousBeginBlockPosix - blockTime * 1000;
        times.previousBeginBlockPosix = toPosix(beginBlockTimestamp);

        if (blockNeedsExecution(blockHeight)) {
          if (savedBeginHeight === blockHeight) {
            decohered = Error(
              `Inconsistent committed state. Block ${blockHeight} had already began execution`,
            );
            throw decohered;
          }
          // Start a block transaction, recording which block height is executed
          saveBeginHeight(blockHeight);
        }

        controller.writeSlogObject({
          type: 'cosmic-swingset-begin-block',
          blockHeight,
          blockTime,
          interBlockSeconds: interBlockDuration / 1000,
          afterCommitHangoverSeconds: afterCommitHangover / 1000,
          blockLagSeconds: blockLag / 1000,
          inboundQueueStats: inboundQueueMetrics.getStats(),
        });

        Number.isNaN(interBlockDuration) ||
          blockMetrics.interBlockSeconds.record(interBlockDuration / 1000);
        blockMetrics.afterCommitHangoverSeconds.record(
          afterCommitHangover / 1000,
        );
        Number.isNaN(blockLag) ||
          blockMetrics.blockLagSeconds.record(blockLag / 1000);

        return undefined;
      }

      case ActionType.END_BLOCK: {
        const { blockHeight, blockTime } = action;
        controller.writeSlogObject({
          type: 'cosmic-swingset-end-block-start',
          blockHeight,
          blockTime,
        });

        blockParams || Fail`blockParams missing`;

        if (!blockNeedsExecution(blockHeight)) {
          // We are reevaluating, so do not do any work, and send exactly the
          // same downcalls to the chain.
          //
          // This is necessary only after a restart when Tendermint is reevaluating the
          // block that was interrupted and not committed.
          //
          // We assert that the return values are identical, which allows us to silently
          // clear the queue.
          try {
            replayChainSends();
          } catch (e) {
            // Very bad!
            decohered = e;
            throw e;
          }
        } else {
          if (blockHeight !== savedBeginHeight) {
            decohered = Error(
              `Inconsistent committed state. Trying to end block ${blockHeight}, expected began block ${savedBeginHeight}`,
            );
            throw decohered;
          }

          // And now we actually process the queued actions down here, during
          // END_BLOCK, but still reentrancy-protected.

          provideInstallationPublisher();

          const start = now();
          await withErrorLogging(
            action.type,
            () => endBlock(blockHeight, blockTime, blockParams),
            () => {
              runDuration += now() - start;
            },
          );

          // We write out our on-chain state as a number of chainSends.
          const start2 = now();
          await saveChainState();
          // Not strictly necessary for correctness (the caller ensures this is
          // done before returning), but account for time taken to flush.
          await pendingSwingStoreExport;
          chainSaveDuration = now() - start2;

          // Advance our saved state variables.
          savedHeight = blockHeight;
        }
        controller.writeSlogObject({
          type: 'cosmic-swingset-end-block-finish',
          blockHeight,
          blockTime,
          inboundQueueStats: inboundQueueMetrics.getStats(),
        });

        times.endBlockDone = now();

        return undefined;
      }

      default: {
        throw Fail`Unrecognized action ${action}; are you sure you didn't mean to queue it?`;
      }
    }
  }
  async function blockingSend(action) {
    if (decohered) {
      throw decohered;
    }

    return doBlockingSend(action).finally(() => pendingSwingStoreExport);
  }

  async function shutdown() {
    await controller.shutdown();
    await afterCommitWorkDone;
  }

  function writeSlogObject(obj) {
    controller.writeSlogObject(obj);
  }

  console.info('Launched SwingSet kernel');

  return {
    blockingSend,
    shutdown,
    writeSlogObject,
    savedHeight,
    savedChainSends: JSON.parse(kvStore.get(getHostKey('chainSends')) || '[]'),
    // NOTE: to be used only for testing purposes!
    internals: {
      controller,
      bridgeInbound,
      timer,
    },
  };
}

/**
 * @param {LaunchOptions} options
 * @returns {Promise<Omit<Awaited<ReturnType<typeof launchAndShareInternals>>, 'internals'>>}
 */
export async function launch(options) {
  const launchResult = await launchAndShareInternals(options);
  return attenuate(launchResult, {
    blockingSend: TRUE,
    shutdown: TRUE,
    writeSlogObject: TRUE,
    savedHeight: TRUE,
    savedChainSends: TRUE,
  });
}
