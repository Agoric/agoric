// @ts-check

import nativePath from 'node:path';
import v8 from 'node:v8';
import process from 'node:process';
import fs from 'node:fs';
import fsPromises from 'node:fs/promises';
import { performance } from 'node:perf_hooks';
import { fork } from 'node:child_process';
import { resolve as importMetaResolve } from 'import-meta-resolve';
import tmp from 'tmp';

import { Fail, q } from '@endo/errors';
import { E, Far } from '@endo/far';
import { makeMarshal } from '@endo/marshal';
import { isNat } from '@endo/nat';
import { M, mustMatch } from '@endo/patterns';
import engineGC from '@agoric/internal/src/lib-nodejs/engine-gc.js';
import { waitUntilQuiescent } from '@agoric/internal/src/lib-nodejs/waitUntilQuiescent.js';
import {
  importMailbox,
  exportMailbox,
} from '@agoric/swingset-vat/src/devices/mailbox/mailbox.js';

import {
  getTelemetryProviders,
  makeSlogSender,
  tryFlushSlogSender,
} from '@agoric/telemetry';

import {
  makeChainStorageRoot,
  makeSerializeToStorage,
} from '@agoric/internal/src/lib-chainStorage.js';
import { makeShutdown } from '@agoric/internal/src/node/shutdown.js';

import { makeInitMsg } from '@agoric/internal/src/chain-utils.js';
import * as STORAGE_PATH from '@agoric/internal/src/chain-storage-paths.js';
import * as ActionType from '@agoric/internal/src/action-types.js';
import { BridgeId, CosmosInitKeyToBridgeId } from '@agoric/internal';
import {
  makeArchiveSnapshot,
  makeArchiveTranscript,
} from '@agoric/swing-store';
import {
  makeBufferedStorage,
  makeReadCachingStorage,
} from './helpers/bufferedStorage.js';
import stringify from './helpers/json-stable-stringify.js';
import { launch, launchAndShareInternals } from './launch-chain.js';
import { makeProcessValue } from './helpers/process-value.js';
import {
  spawnSwingStoreExport,
  validateExporterOptions,
} from './export-kernel-db.js';
import {
  performStateSyncImport,
  validateImporterOptions,
} from './import-kernel-db.js';

/**
 * @import {EReturn} from '@endo/far';
 */

const ignore = () => {};

// eslint-disable-next-line no-unused-vars
let whenHellFreezesOver = null;

const TELEMETRY_SERVICE_NAME = 'agd-cosmos';

const PORT_SUFFIX = 'Port';

const toNumber = specimen => {
  const number = parseInt(specimen, 10);
  String(number) === String(specimen) ||
    Fail`Could not parse ${JSON.stringify(specimen)} as a number`;
  return number;
};

/**
 * The swingset config object parsed and resolved by cosmos in
 * `golang/cosmos/x/swingset/config.go`. The shape should be kept in sync
 * with `SwingsetConfig` defined there.
 *
 * @typedef {object} CosmosSwingsetConfig
 * @property {string} [slogfile]
 * @property {number} [maxVatsOnline]
 * @property {'debug' | 'operational'} [vatSnapshotRetention]
 * @property {'archival' | 'operational'} [vatTranscriptRetention]
 * @property {string} [vatSnapshotArchiveDir]
 * @property {string} [vatTranscriptArchiveDir]
 */
const SwingsetConfigShape = M.splitRecord(
  // All known properties are optional, but unknown properties are not allowed.
  {},
  {
    slogfile: M.string(),
    maxVatsOnline: M.number(),
    vatSnapshotRetention: M.or('debug', 'operational'),
    vatTranscriptRetention: M.or('archival', 'operational'),
    vatSnapshotArchiveDir: M.string(),
    vatTranscriptArchiveDir: M.string(),
  },
  {},
);
const validateSwingsetConfig = swingsetConfig => {
  mustMatch(swingsetConfig, SwingsetConfigShape);
  const { maxVatsOnline } = swingsetConfig;
  maxVatsOnline === undefined ||
    (isNat(maxVatsOnline) && maxVatsOnline > 0) ||
    Fail`maxVatsOnline must be a positive integer`;
};

/**
 * Capture "port numbers" for communicating with cosmos modules.
 *
 * @param {object} action
 */
export const extractPortNums = action => {
  const portNums = {};
  for (const [key, value] of Object.entries(action)) {
    const portAlias = CosmosInitKeyToBridgeId[key];
    if (portAlias) {
      // Use the alias if it exists.
      portNums[portAlias] = value;
    } else if (key.endsWith(PORT_SUFFIX)) {
      // Anything else that ends in the suffix is assumed to be a port
      // number, as described in app.go/cosmosInitAction.
      const portName = key.slice(0, key.length - PORT_SUFFIX.length);
      portNums[portName] = value;
    }
  }
  return harden(portNums);
};

/**
 * @template {unknown} [T=unknown]
 * @param {(req: string) => string} call
 * @param {string} prefix
 * @param {"set" | "legacySet" | "setWithoutNotify"} setterMethod
 * @param {(value: string) => T} fromBridgeStringValue
 * @param {(value: T) => string} toBridgeStringValue
 * @returns {import('./helpers/bufferedStorage.js').KVStore<T>}
 */
const makePrefixedBridgeStorage = (
  call,
  prefix,
  setterMethod,
  fromBridgeStringValue = x => JSON.parse(x),
  toBridgeStringValue = x => stringify(x),
) => {
  prefix.endsWith('.') || Fail`prefix ${prefix} must end with a dot`;

  return harden({
    has: key => {
      const retStr = call(
        stringify({ method: 'has', args: [`${prefix}${key}`] }),
      );
      const ret = JSON.parse(retStr);
      return ret;
    },
    get: key => {
      const retStr = call(
        stringify({ method: 'get', args: [`${prefix}${key}`] }),
      );
      const ret = JSON.parse(retStr);
      if (ret == null) {
        return undefined;
      }
      return fromBridgeStringValue(ret);
    },
    set: (key, value) => {
      const fullPath = `${prefix}${key}`;
      const entry = [fullPath, toBridgeStringValue(value)];
      call(
        stringify({
          method: setterMethod,
          args: [entry],
        }),
      );
    },
    delete: key => {
      const fullPath = `${prefix}${key}`;
      const entry = [fullPath];
      call(
        stringify({
          method: setterMethod,
          args: [entry],
        }),
      );
    },
    getNextKey(_previousKey) {
      throw Error('not implemented');
    },
  });
};

/**
 * @param {(req: string) => string} call
 * @param {string} queuePath
 */
export const makeQueueStorage = (call, queuePath) => {
  const { kvStore, commit, abort } = makeBufferedStorage(
    makePrefixedBridgeStorage(
      call,
      `${queuePath}.`,
      'setWithoutNotify',
      x => x,
      x => x,
    ),
  );
  return harden({ ...kvStore, commit, abort });
};

/**
 * @param {any} agcc
 * @param {string} stateDBDir
 * @param {object} options
 * @param {typeof process.env} [options.env]
 * @param {Pick<import('fs'), 'createWriteStream' | 'mkdirSync' | 'renameSync'>} options.fs
 * @param {Pick<import('path'), 'join' | 'resolve'>} options.path
 * @param {import('tmp')} [options.tmp] required to support vatSnapshotArchiveDir/vatTranscriptArchiveDir
 * @param {ReturnType<typeof makeProcessValue>} [options.processValue]
 * @param {() => Promise<void>} [options.readyForCommit]
 * @param {{
 *   debugName?: string,
 *   slogSender?: ERef<EReturn<typeof makeSlogSender>>,
 *   swingStore?: import('@agoric/swing-store').SwingStore,
 *   vatconfig?: Parameters<typeof launch>[0]['vatconfig'],
 *   withInternals?: boolean,
 * }} [options.testingOverrides] Exposed only for testing purposes.
 *   `debugName`/`slogSender`/`swingStore`/`vatConfig` are pure overrides, while
 *   `withInternals` expands the return value to expose internal objects
 *   `controller`/`bridgeInbound`/`timer`.
 */
export const makeLaunchChain = (
  agcc,
  stateDBDir,
  {
    env = {},
    // eslint-disable-next-line no-shadow
    fs,
    path,
    // eslint-disable-next-line no-shadow
    tmp,
    processValue = makeProcessValue({ env, args: [] }),
    readyForCommit,
    testingOverrides = {},
  },
) => {
  /** @typedef {[args: Parameters<typeof agcc.send>, ret: ReturnType<typeof agcc.send>]} SavedChainSend */
  /** @type {SavedChainSend[]} */
  let savedChainSends = [];

  // Send a chain downcall, recording what we sent and received.
  function chainSend(...sendArgs) {
    const ret = agcc.send(...sendArgs);
    savedChainSends.push([sendArgs, ret]);
    return ret;
  }

  const clearChainSends = async () => {
    // TODO: Make `readyForCommit` an explicit `launch` input rather than
    // having an overloaded async `clearChainSends` with the expectation that
    // it is called right before `commit()`.
    await readyForCommit?.();

    const chainSends = savedChainSends;
    savedChainSends = [];
    return chainSends;
  };

  // Replay and clear the chain send queue.
  // While replaying each send, insist it has the same return result.
  function replayChainSends() {
    // Remove our queue.
    const chainSends = [...savedChainSends];

    // Just send all the things we saved.
    while (chainSends.length > 0) {
      const [sendArgs, expectedRet] = /** @type {SavedChainSend} */ (
        chainSends.shift()
      );
      const actualRet = agcc.send(...sendArgs);

      // Enforce that we got back what we expected.
      if (actualRet !== expectedRet) {
        throw Error(
          `fatal: replaying chain send ${JSON.stringify(
            sendArgs,
          )} resulted in ${JSON.stringify(actualRet)}; expected ${expectedRet}`,
        );
      }
    }
  }

  const launchChain = async initAction => {
    const { XSNAP_KEEP_SNAPSHOTS = '', NODE_HEAP_SNAPSHOTS = '-1' } = env;
    const portNums = extractPortNums(initAction);

    /** @type {CosmosSwingsetConfig} */
    const swingsetConfig = harden(initAction.resolvedConfig || {});
    validateSwingsetConfig(swingsetConfig);
    const {
      slogfile,
      vatSnapshotRetention,
      vatTranscriptRetention,
      vatSnapshotArchiveDir,
      vatTranscriptArchiveDir,
    } = swingsetConfig;
    const keepSnapshots = vatSnapshotRetention
      ? vatSnapshotRetention !== 'operational'
      : ['1', 'true'].includes(XSNAP_KEEP_SNAPSHOTS);
    const keepTranscripts = vatTranscriptRetention
      ? vatTranscriptRetention !== 'operational'
      : false;

    // As a kludge, back-propagate selected configuration into environment variables.
    // eslint-disable-next-line dot-notation
    if (slogfile) env['SLOGFILE'] = slogfile;

    const sendToChainStorage = msg => chainSend(portNums.storage, msg);
    // this object is used to store the mailbox state.
    const fromBridgeMailbox = data => {
      const ack = toNumber(data.ack);
      const outbox = data.outbox.map(([seq, msg]) => [toNumber(seq), msg]);
      return importMailbox({ outbox, ack });
    };
    const mailboxStorage = makeReadCachingStorage(
      makePrefixedBridgeStorage(
        sendToChainStorage,
        `${STORAGE_PATH.MAILBOX}.`,
        'legacySet',
        val => fromBridgeMailbox(JSON.parse(val)),
        val => stringify(exportMailbox(val)),
      ),
    );
    const actionQueueStorage = makeQueueStorage(
      sendToChainStorage,
      STORAGE_PATH.ACTION_QUEUE,
    );
    const highPriorityQueueStorage = makeQueueStorage(
      sendToChainStorage,
      STORAGE_PATH.HIGH_PRIORITY_QUEUE,
    );
    /**
     * Callback invoked during SwingSet execution when new "export data" is
     * generated by swingStore to be saved in the host's verified DB. In our
     * case, we publish these entries in vstorage under a dedicated prefix.
     * This effectively shadows the "export data" of the swingStore so that
     * processes like state-sync can generate a verified "root of trust" to
     * restore SwingSet state.
     *
     * @param {ReadonlyArray<[path: string, value?: string | null]>} updates
     */
    const swingStoreExportCallback = async updates => {
      // Allow I/O to proceed first
      await waitUntilQuiescent();

      const entries = updates.map(([key, value]) => {
        if (typeof key !== 'string') {
          throw Fail`Unexpected swingStore exported key ${q(key)}`;
        }
        if (value == null) {
          return [key];
        }
        if (typeof value !== 'string') {
          throw Fail`Unexpected ${typeof value} value for swingStore exported key ${q(
            key,
          )}`;
        }
        return [key, value];
      });
      chainSend(
        portNums.swingset,
        stringify({
          method: 'swingStoreUpdateExportData',
          args: entries,
        }),
      );
    };
    function doOutboundBridge(dstID, msg) {
      const portNum = portNums[dstID];
      if (portNum === undefined) {
        const portKey =
          Object.keys(CosmosInitKeyToBridgeId).find(
            key => CosmosInitKeyToBridgeId[key] === dstID,
          ) || `${dstID}${PORT_SUFFIX}`;
        console.error(
          `warning: doOutboundBridge called before AG_COSMOS_INIT gave us ${portKey}`,
        );
        // it is dark, and your exception is likely to be eaten by a vat
        throw Error(
          `warning: doOutboundBridge called before AG_COSMOS_INIT gave us ${portKey}`,
        );
      }
      const respStr = chainSend(portNum, stringify(msg));
      try {
        return JSON.parse(respStr);
      } catch (e) {
        throw Fail`cannot JSON.parse(${JSON.stringify(respStr)}): ${e}`;
      }
    }

    const toStorage = Far('BridgeStorageHandler', message => {
      return doOutboundBridge(BridgeId.STORAGE, message);
    });

    const makeInstallationPublisher = () => {
      const installationStorageNode = makeChainStorageRoot(
        toStorage,
        STORAGE_PATH.BUNDLES,
        { sequence: true },
      );
      const marshaller = makeMarshal(undefined, undefined, {
        serializeBodyFormat: 'smallcaps',
      });
      const publish = makeSerializeToStorage(
        installationStorageNode,
        marshaller,
      );
      const publisher = harden({ publish });
      return publisher;
    };

    const argv = {
      bootMsg: makeInitMsg(initAction),
    };
    const getVatConfig = async () => {
      const href = importMetaResolve(
        env.CHAIN_BOOTSTRAP_VAT_CONFIG ||
          argv.bootMsg.params.bootstrap_vat_config,
        import.meta.url,
      );
      const { pathname } = new URL(href);
      return pathname;
    };

    const { metricsProvider } = getTelemetryProviders({
      console,
      env,
      serviceName: TELEMETRY_SERVICE_NAME,
    });

    const providedSlogSender = await testingOverrides.slogSender;
    const slogSender = await (providedSlogSender ||
      makeSlogSender({
        stateDir: stateDBDir,
        env,
        serviceName: TELEMETRY_SERVICE_NAME,
      }));

    const swingStoreTraceFile = processValue.getPath({
      envName: 'SWING_STORE_TRACE',
      flagName: 'trace-store',
      trueValue: path.resolve(stateDBDir, 'store-trace.log'),
    });

    const nodeHeapSnapshots = Number.parseInt(NODE_HEAP_SNAPSHOTS, 10);

    let lastCommitTime = 0;
    let commitCallsSinceLastSnapshot = NaN;
    const snapshotBaseDir = path.resolve(stateDBDir, 'node-heap-snapshots');

    if (nodeHeapSnapshots >= 0) {
      fs.mkdirSync(snapshotBaseDir, { recursive: true });
    }

    const afterCommitCallback = async () => {
      const slogSenderFlushed = tryFlushSlogSender(slogSender, {
        env,
        log: console.warn,
      });

      // delay until all current promise reactions are drained so we can be sure
      // that the commit-block reply has been sent to agcc through replier.resolve
      await Promise.all([slogSenderFlushed, waitUntilQuiescent()]);

      try {
        let heapSnapshot;
        let heapSnapshotTime;

        const t0 = performance.now();
        engineGC();
        const t1 = performance.now();
        const memoryUsage = process.memoryUsage();
        const t2 = performance.now();
        const heapStats = v8.getHeapStatistics();
        const t3 = performance.now();

        commitCallsSinceLastSnapshot += 1;
        if (
          (nodeHeapSnapshots >= 0 && t0 - lastCommitTime > 30 * 1000) ||
          (nodeHeapSnapshots > 0 &&
            !(nodeHeapSnapshots > commitCallsSinceLastSnapshot))
        ) {
          commitCallsSinceLastSnapshot = 0;
          heapSnapshot = `Heap-${process.pid}-${Date.now()}.heapsnapshot`;
          const snapshotPath = path.resolve(snapshotBaseDir, heapSnapshot);
          v8.writeHeapSnapshot(snapshotPath);
          heapSnapshotTime = performance.now() - t3;
        }
        lastCommitTime = t0;

        return {
          memoryUsage,
          heapStats,
          heapSnapshot,
          statsTime: {
            forcedGc: t1 - t0,
            memoryUsage: t2 - t1,
            heapStats: t3 - t2,
            heapSnapshot: heapSnapshotTime,
          },
        };
      } catch (err) {
        console.warn('Failed to gather memory stats', err);
        return {};
      }
    };

    const fsPowers = { fs, path, tmp };
    const archiveSnapshot = vatSnapshotArchiveDir
      ? makeArchiveSnapshot(vatSnapshotArchiveDir, fsPowers)
      : undefined;
    const archiveTranscript = vatTranscriptArchiveDir
      ? makeArchiveTranscript(vatTranscriptArchiveDir, fsPowers)
      : undefined;

    const launcher = testingOverrides.withInternals
      ? launchAndShareInternals
      : launch;
    const s = await launcher({
      actionQueueStorage,
      highPriorityQueueStorage,
      swingStore: testingOverrides.swingStore,
      kernelStateDBDir: testingOverrides.swingStore ? undefined : stateDBDir,
      makeInstallationPublisher,
      mailboxStorage,
      clearChainSends,
      replayChainSends,
      bridgeOutbound: doOutboundBridge,
      vatconfig: testingOverrides.vatconfig || getVatConfig,
      argv,
      env,
      verboseBlocks: true,
      metricsProvider,
      debugName: testingOverrides.debugName,
      slogSender,
      swingStoreExportCallback: testingOverrides.swingStore
        ? undefined
        : swingStoreExportCallback,
      swingStoreTraceFile,
      keepSnapshots,
      keepTranscripts,
      archiveSnapshot,
      archiveTranscript,
      afterCommitCallback,
      swingsetConfig,
    });
    savedChainSends = s.savedChainSends;
    const shutdown = async () => {
      await s.shutdown?.();
      if (providedSlogSender) return;
      await slogSender?.shutdown?.();
    };
    return { ...s, shutdown };
  };

  return launchChain;
};

export default async function main(
  progname,
  args,
  { env, homedir, path = nativePath, agcc },
) {
  // TODO: use the 'basedir' pattern

  const processValue = makeProcessValue({ env, args });

  // We try to find the actual cosmos state directory (default=~/.ag-chain-cosmos), which
  // is better than scribbling into the current directory.
  const cosmosHome = processValue.getFlag(
    'home',
    `${homedir}/.ag-chain-cosmos`,
  );
  const stateDBDir = `${cosmosHome}/data/agoric`;
  fs.mkdirSync(stateDBDir, { recursive: true });

  /** @type {EReturn<typeof launch>['blockingSend'] | undefined} */
  let blockingSend;

  const portHandlers = {};
  let lastPort = 0;
  function registerPortHandler(portHandler) {
    lastPort += 1;
    const port = lastPort;
    portHandlers[port] = async (...phArgs) =>
      E.resolve(portHandler(...phArgs)).catch(e => {
        console.error('portHandler threw', e);
        throw e;
      });
    return port;
  }

  function fromGo(port, str, replier) {
    // console.error(`inbound ${port} ${str}`);
    const handler = portHandlers[port];
    if (!handler) {
      replier.reject(`invalid requested port ${port}`);
      return;
    }
    const action = JSON.parse(str);
    const p = Promise.resolve(handler(action));
    void E.when(
      p,
      res => {
        // console.error(`Replying in Node to ${str} with`, res);
        replier.resolve(stringify(res !== undefined ? res : null));
      },
      rej => {
        // console.error(`Rejecting in Node to ${str} with`, rej);
        replier.reject(`${(rej && rej.stack) || rej}`);
      },
    );
  }

  // Actually run the main ag-chain-cosmos program.  Before we start the daemon,
  // there will be a call to nodePort/AG_COSMOS_INIT, otherwise exit.
  const nodePort = registerPortHandler(toSwingSet);

  // Need to keep the process alive until Go exits.
  whenHellFreezesOver = new Promise(() => {});
  agcc.runAgCosmosDaemon(nodePort, fromGo, [progname, ...args]);

  /**
   * @type {undefined | {
   *   blockHeight: number,
   *   exporter?: import('./export-kernel-db.js').StateSyncExporter,
   *   exportDir?: string,
   *   cleanup?: () => Promise<void>,
   * }}
   */
  let stateSyncExport;

  async function discardStateSyncExport() {
    const exportData = stateSyncExport;
    stateSyncExport = undefined;
    await exportData?.exporter?.stop();
    await exportData?.cleanup?.();
  }

  async function handleSwingStoreExport(blockHeight, request, requestArgs) {
    await null;
    switch (request) {
      case 'restore': {
        const requestOptions =
          typeof requestArgs[0] === 'string'
            ? { exportDir: requestArgs[0] }
            : requestArgs[0] || {};
        const options = {
          ...requestOptions,
          stateDir: stateDBDir,
          blockHeight,
        };
        validateImporterOptions(options);
        !stateSyncExport ||
          Fail`Snapshot already in progress for ${stateSyncExport.blockHeight}`;
        !blockingSend || Fail`Cannot restore snapshot after init`;
        console.info(
          'Restoring SwingSet state from snapshot at block height',
          blockHeight,
          'with options',
          JSON.stringify(requestOptions),
        );
        return performStateSyncImport(options, {
          fs: { ...fs, ...fsPromises },
          pathResolve: path.resolve,
          log: null,
        });
      }
      case 'initiate': {
        !stateSyncExport ||
          Fail`Snapshot already in progress for ${stateSyncExport.blockHeight}`;

        const requestOptions = requestArgs[0] || {};

        validateExporterOptions({
          ...requestOptions,
          stateDir: stateDBDir,
          exportDir: '',
          blockHeight,
        });

        const exportData =
          /** @type {Required<NonNullable<typeof stateSyncExport>>} */ ({
            blockHeight,
          });
        stateSyncExport = exportData;

        await new Promise((resolve, reject) => {
          tmp.dir(
            {
              prefix: `agd-state-sync-${blockHeight}-`,
              unsafeCleanup: true,
            },
            (err, exportDir, cleanup) => {
              if (err) {
                reject(err);
                return;
              }
              exportData.exportDir = exportDir;
              /** @type {Promise<void> | undefined} */
              let cleanupResult;
              exportData.cleanup = async () => {
                cleanupResult ||= new Promise(cleanupDone => {
                  // If the exporter is still the same, then the retriever
                  // is in charge of cleanups
                  if (stateSyncExport !== exportData) {
                    // @ts-expect-error wrong type definitions
                    cleanup(cleanupDone);
                  } else {
                    console.warn('unexpected call of state-sync cleanup');
                    cleanupDone();
                  }
                });
                await cleanupResult;
              };
              resolve(null);
            },
          );
        });

        console.warn(
          'Initiating SwingSet state snapshot at block height',
          blockHeight,
          'with options',
          JSON.stringify(requestOptions),
        );
        exportData.exporter = spawnSwingStoreExport(
          {
            ...requestOptions,
            stateDir: stateDBDir,
            exportDir: exportData.exportDir,
            blockHeight,
          },
          {
            fork,
          },
        );

        exportData.exporter.onDone().catch(() => {
          if (exportData === stateSyncExport) {
            stateSyncExport = undefined;
          }
          return exportData.cleanup();
        });

        return exportData.exporter.onStarted().catch(err => {
          console.warn(
            `State-sync export failed for block ${blockHeight}`,
            err,
          );
          throw err;
        });
      }
      case 'discard': {
        return discardStateSyncExport();
      }
      case 'retrieve': {
        const exportData = stateSyncExport;
        if (!exportData || !exportData.exporter) {
          throw Fail`No snapshot in progress`;
        }

        return exportData.exporter.onDone().then(() => {
          if (exportData === stateSyncExport) {
            // Don't cleanup, cosmos is now in charge
            stateSyncExport = undefined;
            return exportData.exportDir;
          } else {
            throw Fail`Snapshot was discarded`;
          }
        });
      }
      default:
        throw Fail`Unknown cosmos snapshot request ${request}`;
    }
  }

  const launchChain = makeLaunchChain(agcc, stateDBDir, {
    env,
    fs,
    path,
    tmp,
    processValue,
    readyForCommit: async () =>
      stateSyncExport?.exporter?.onStarted().then(ignore, ignore),
  });

  /** @type {((obj: object) => void) | undefined} */
  let writeSlogObject;

  async function toSwingSet(action, _replier) {
    // console.log(`toSwingSet`, action);

    await null;

    switch (action.type) {
      case ActionType.AG_COSMOS_INIT: {
        !blockingSend || Fail`Swingset already initialized`;

        const s = await launchChain(action);
        const { blockingSend: sendToSwingset, shutdown } = s;
        ({ writeSlogObject } = s);

        // Wrap `blockingSend` with a spy for supporting clean shutdowns.
        const { registerShutdown } = makeShutdown();
        let pendingBlockingSend = Promise.resolve();
        registerShutdown(async interrupted => {
          await Promise.all([
            interrupted && pendingBlockingSend.then(shutdown),
            discardStateSyncExport(),
          ]);
        });
        // eslint-disable-next-line no-shadow
        blockingSend = async action => {
          const result = sendToSwingset(action);
          pendingBlockingSend = Promise.resolve(result).then(ignore, ignore);
          return result;
        };

        return blockingSend(action);
      }

      // Snapshot actions are specific to cosmos chains and handled here
      case ActionType.SWING_STORE_EXPORT: {
        const { blockHeight, request, args: requestArgs } = action;
        writeSlogObject?.({
          type: 'cosmic-swingset-snapshot-start',
          blockHeight,
          request,
          args: requestArgs,
        });

        const resultP = handleSwingStoreExport(
          blockHeight,
          request,
          requestArgs,
        );

        resultP.then(
          result => {
            writeSlogObject?.({
              type: 'cosmic-swingset-snapshot-finish',
              blockHeight,
              request,
              args: requestArgs,
              result,
            });
          },
          error => {
            writeSlogObject?.({
              type: 'cosmic-swingset-snapshot-finish',
              blockHeight,
              request,
              args: requestArgs,
              error,
            });
          },
        );

        return resultP;
      }

      default: {
        if (!blockingSend) throw Fail`Swingset not initialized`;

        // Block related actions are processed by `blockingSend`
        return blockingSend(action);
      }
    }
  }
}
