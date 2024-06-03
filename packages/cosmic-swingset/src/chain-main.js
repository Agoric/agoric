// @ts-check

import { resolve as pathResolve } from 'path';
import v8 from 'node:v8';
import process from 'node:process';
import fs from 'node:fs';
import fsPromises from 'node:fs/promises';
import { performance } from 'perf_hooks';
import { resolve as importMetaResolve } from 'import-meta-resolve';
import tmpfs from 'tmp';
import { fork } from 'node:child_process';

import { E } from '@endo/far';
import engineGC from '@agoric/internal/src/lib-nodejs/engine-gc.js';
import { waitUntilQuiescent } from '@agoric/internal/src/lib-nodejs/waitUntilQuiescent.js';
import {
  importMailbox,
  exportMailbox,
} from '@agoric/swingset-vat/src/devices/mailbox/mailbox.js';

import { Fail, q } from '@agoric/assert';
import { makeSlogSender, tryFlushSlogSender } from '@agoric/telemetry';

import {
  makeChainStorageRoot,
  makeSerializeToStorage,
} from '@agoric/internal/src/lib-chainStorage.js';
import { makeMarshal } from '@endo/marshal';
import { makeShutdown } from '@agoric/internal/src/node/shutdown.js';

import * as STORAGE_PATH from '@agoric/internal/src/chain-storage-paths.js';
import * as ActionType from '@agoric/internal/src/action-types.js';
import { BridgeId, CosmosInitKeyToBridgeId } from '@agoric/internal';
import {
  makeBufferedStorage,
  makeReadCachingStorage,
} from './helpers/bufferedStorage.js';
import stringify from './helpers/json-stable-stringify.js';
import { launch } from './launch-chain.js';
import { getTelemetryProviders } from './kernel-stats.js';
import { makeProcessValue } from './helpers/process-value.js';
import {
  spawnSwingStoreExport,
  validateExporterOptions,
} from './export-kernel-db.js';
import {
  performStateSyncImport,
  validateImporterOptions,
} from './import-kernel-db.js';

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
      const path = `${prefix}${key}`;
      const entry = [path, toBridgeStringValue(value)];
      call(
        stringify({
          method: setterMethod,
          args: [entry],
        }),
      );
    },
    delete: key => {
      const path = `${prefix}${key}`;
      const entry = [path];
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

export default async function main(progname, args, { env, homedir, agcc }) {
  const portNums = {};

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

  // console.log('Have AG_COSMOS', agcc);

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
  // eslint-disable-next-line no-use-before-define
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

  let savedChainSends = [];

  // Send a chain downcall, recording what we sent and received.
  function chainSend(...sendArgs) {
    const ret = agcc.send(...sendArgs);
    savedChainSends.push([sendArgs, ret]);
    return ret;
  }

  const clearChainSends = async () => {
    // Cosmos should have blocked before calling commit, but wait just in case
    await stateSyncExport?.exporter?.onStarted().catch(() => {});

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
      const [sendArgs, expectedRet] = chainSends.shift();
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

  /** @type {((obj: object) => void) | undefined} */
  let writeSlogObject;

  // the storagePort used to change for every single message. It's defined out
  // here so 'sendToChainStorage' can close over the single mutable instance,
  // when we updated the 'portNums.storage' value each time toSwingSet was called.
  async function launchAndInitializeSwingSet(bootMsg) {
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
    const makeQueueStorage = queuePath => {
      const { kvStore, commit, abort } = makeBufferedStorage(
        makePrefixedBridgeStorage(
          sendToChainStorage,
          `${queuePath}.`,
          'setWithoutNotify',
          x => x,
          x => x,
        ),
      );
      return harden({ ...kvStore, commit, abort });
    };
    const actionQueueStorage = makeQueueStorage(STORAGE_PATH.ACTION_QUEUE);
    const highPriorityQueueStorage = makeQueueStorage(
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

    const toStorage = message => {
      return doOutboundBridge(BridgeId.STORAGE, message);
    };

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
      bootMsg,
    };
    const getVatConfig = async () => {
      const vatHref = await importMetaResolve(
        env.CHAIN_BOOTSTRAP_VAT_CONFIG ||
          argv.bootMsg.params.bootstrap_vat_config,
        import.meta.url,
      );
      const vatconfig = new URL(vatHref).pathname;
      return vatconfig;
    };

    // Delay makeShutdown to override the golang interrupts
    const { registerShutdown } = makeShutdown();

    const { metricsProvider } = getTelemetryProviders({
      console,
      env,
      serviceName: TELEMETRY_SERVICE_NAME,
    });

    const { XSNAP_KEEP_SNAPSHOTS, NODE_HEAP_SNAPSHOTS = -1 } = env;
    const slogSender = await makeSlogSender({
      stateDir: stateDBDir,
      env,
      serviceName: TELEMETRY_SERVICE_NAME,
    });

    const swingStoreTraceFile = processValue.getPath({
      envName: 'SWING_STORE_TRACE',
      flagName: 'trace-store',
      trueValue: pathResolve(stateDBDir, 'store-trace.log'),
    });

    const keepSnapshots =
      XSNAP_KEEP_SNAPSHOTS === '1' || XSNAP_KEEP_SNAPSHOTS === 'true';

    const nodeHeapSnapshots = Number.parseInt(NODE_HEAP_SNAPSHOTS, 10);

    let lastCommitTime = 0;
    let commitCallsSinceLastSnapshot = NaN;
    const snapshotBaseDir = pathResolve(stateDBDir, 'node-heap-snapshots');

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
          const snapshotPath = pathResolve(snapshotBaseDir, heapSnapshot);
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

    const s = await launch({
      actionQueueStorage,
      highPriorityQueueStorage,
      kernelStateDBDir: stateDBDir,
      makeInstallationPublisher,
      mailboxStorage,
      clearChainSends,
      replayChainSends,
      bridgeOutbound: doOutboundBridge,
      vatconfig: getVatConfig,
      argv,
      env,
      verboseBlocks: true,
      metricsProvider,
      slogSender,
      swingStoreExportCallback,
      swingStoreTraceFile,
      keepSnapshots,
      afterCommitCallback,
    });

    const { blockingSend, shutdown } = s;
    ({ writeSlogObject, savedChainSends } = s);

    let pendingBlockingSend = Promise.resolve();

    registerShutdown(async interrupted =>
      Promise.all([
        interrupted && pendingBlockingSend.then(shutdown),
        discardStateSyncExport(),
      ]).then(() => {}),
    );

    return async action => {
      const result = blockingSend(action);
      pendingBlockingSend = Promise.resolve(result).then(
        () => {},
        () => {},
      );
      return result;
    };
  }

  /** @type {Awaited<ReturnType<typeof launch>>['blockingSend'] | undefined} */
  let blockingSend;

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
          pathResolve,
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
          tmpfs.dir(
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

  async function toSwingSet(action, _replier) {
    // console.log(`toSwingSet`, action);

    await null;

    switch (action.type) {
      case ActionType.AG_COSMOS_INIT: {
        // console.error('got AG_COSMOS_INIT', action);

        !blockingSend || Fail`Swingset already initialized`;

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
        harden(portNums);

        // Ensure that initialization has completed.
        blockingSend = await launchAndInitializeSwingSet(action);

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
