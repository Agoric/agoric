/* eslint-env node */
import path from 'path';
import fs from 'fs';
import { Fail } from '@endo/errors';
import {
  importMailbox,
  exportMailbox,
} from '@agoric/swingset-vat/src/devices/mailbox/mailbox.js';

import anylogger from 'anylogger';

import { makeSlogSender } from '@agoric/telemetry';

import { resolve as importMetaResolve } from 'import-meta-resolve';
import { makeWithQueue } from '@agoric/internal/src/queue.js';
import { makeBatchedDeliver } from '@agoric/internal/src/batched-deliver.js';
import stringify from './helpers/json-stable-stringify.js';
import { launch } from './launch-chain.js';
import { getTelemetryProviders } from './kernel-stats.js';
import { DEFAULT_SIM_SWINGSET_PARAMS, QueueInbound } from './sim-params.js';
import { parseQueueSizes } from './params.js';
import { makeKVStoreFromMap } from './helpers/bufferedStorage.js';
import { makeQueue, makeQueueStorageMock } from './helpers/make-queue.js';

/** @import { Mailbox } from '@agoric/swingset-vat' */

const console = anylogger('fake-chain');

const TELEMETRY_SERVICE_NAME = 'sim-cosmos';

const PRETEND_BLOCK_DELAY = 5;
const scaleBlockTime = ms => Math.floor(ms / 1000);

async function makeMailboxStorageFromFile(file) {
  /** @type {Map<string, Mailbox>} */
  const map = new Map();
  const kvStore = makeKVStoreFromMap(map);
  const commit = async () => {
    const obj = {};
    for (const [k, v] of map.entries()) {
      obj[k] = exportMailbox(v);
    }
    const json = stringify(obj);
    await fs.promises.writeFile(file, json);
  };
  const read = async () => {
    const content = await fs.promises.readFile(file, 'utf8');
    return JSON.parse(content);
  };
  const load = async obj => {
    map.clear();
    for (const [k, v] of Object.entries(obj)) {
      map.set(k, importMailbox(v));
    }
  };
  const reset = async () => {
    const obj = await read();
    await load(obj);
  };

  await read().then(load, () => {});

  return { ...kvStore, commit, abort: reset };
}

export async function connectToFakeChain(basedir, GCI, delay, inbound) {
  const env = process.env;
  const initialHeight = 0;
  const mailboxFile = path.join(basedir, `fake-chain-${GCI}-mailbox.json`);
  const bootAddress = `${GCI}-client`;

  const mailboxStorage = await makeMailboxStorageFromFile(mailboxFile);

  const argv = {
    giveMeAllTheAgoricPowers: true,
    hardcodedClientAddresses: [bootAddress],
    bootMsg: {
      supplyCoins: [
        { denom: 'ubld', amount: `${50_000n * 10n ** 6n}` },
        { denom: 'uist', amount: `${1_000_000n * 10n ** 6n}` },
      ],
      params: DEFAULT_SIM_SWINGSET_PARAMS,
    },
  };

  const getVatConfig = async () => {
    const href = await importMetaResolve(
      env.CHAIN_BOOTSTRAP_VAT_CONFIG ||
        argv.bootMsg.params.bootstrap_vat_config,
      import.meta.url,
    );
    const { pathname } = new URL(href);
    return pathname;
  };
  const stateDBdir = path.join(basedir, `fake-chain-${GCI}-state`);
  function replayChainSends() {
    Fail`Replay not implemented`;
  }
  async function clearChainSends() {
    return [];
  }

  const { metricsProvider } = getTelemetryProviders({
    console,
    env,
    serviceName: TELEMETRY_SERVICE_NAME,
  });

  const slogSender = await makeSlogSender({
    stateDir: stateDBdir,
    serviceName: TELEMETRY_SERVICE_NAME,
    env,
  });

  const actionQueueStorage = makeQueueStorageMock().storage;
  const highPriorityQueueStorage = makeQueueStorageMock().storage;
  const actionQueue = makeQueue(actionQueueStorage);

  const s = await launch({
    bridgeOutbound: /** @type {any} */ (undefined),
    actionQueueStorage,
    highPriorityQueueStorage,
    kernelStateDBDir: stateDBdir,
    mailboxStorage,
    clearChainSends,
    replayChainSends,
    vatconfig: getVatConfig,
    argv,
    debugName: GCI,
    metricsProvider,
    slogSender,
    swingsetConfig: {},
  });

  const { blockingSend, savedHeight } = s;

  let blockHeight = savedHeight;
  const intoChain = [];
  /** @type {undefined | ReturnType<typeof setTimeout>} */
  let nextBlockTimeout;
  const resetNextBlockTimeout = () => {
    if (nextBlockTimeout === undefined) return;
    clearTimeout(nextBlockTimeout);
    nextBlockTimeout = undefined;
  };

  const maximumDelay = (delay || PRETEND_BLOCK_DELAY) * 1000;

  const withBlockQueue = makeWithQueue();
  const unhandledSimulateBlock = withBlockQueue(
    async function unqueuedSimulateBlock() {
      const blockTime = scaleBlockTime(Date.now());
      blockHeight += 1;

      const params = DEFAULT_SIM_SWINGSET_PARAMS;
      const beginAction = {
        type: 'BEGIN_BLOCK',
        blockHeight,
        blockTime,
        params,
      };
      await blockingSend(beginAction);
      const inboundQueueMax = parseQueueSizes(params.queue_max)[QueueInbound];
      const inboundQueueAllowed = Math.max(
        0,
        inboundQueueMax - actionQueue.size(),
      );

      // Gather up the new messages into the latest block.
      const thisBlock = intoChain.splice(0, inboundQueueAllowed);

      for (const [i, [newMessages, acknum]] of thisBlock.entries()) {
        actionQueue.push({
          action: {
            type: 'DELIVER_INBOUND',
            peer: bootAddress,
            messages: newMessages,
            ack: acknum,
            blockHeight,
            blockTime,
          },
          context: { blockHeight, txHash: 'simTx', msgIdx: i },
        });
      }
      const endAction = { type: 'END_BLOCK', blockHeight, blockTime };
      await blockingSend(endAction);

      // Done processing, "commit the block".
      await blockingSend({ type: 'COMMIT_BLOCK', blockHeight, blockTime });

      resetNextBlockTimeout();
      nextBlockTimeout = setTimeout(simulateBlock, maximumDelay);

      // TODO: maybe add latency to the inbound messages.
      const mailbox = mailboxStorage.get(`${bootAddress}`);
      const { outbox = [], ack = 0 } = mailbox ? exportMailbox(mailbox) : {};
      inbound(GCI, outbox, ack);
    },
  );

  const simulateBlock = async () =>
    unhandledSimulateBlock().catch(e => {
      console.error(e);
      process.exit(1);
    });

  let totalDeliveries = 0;
  async function deliver(newMessages, acknum) {
    totalDeliveries += 1;
    console.log(`delivering to ${GCI} (trips=${totalDeliveries})`);

    intoChain.push([newMessages, acknum]);
    // Only actually simulate a block if we're not in bootstrap.
    let p;
    if (blockHeight && !delay) {
      resetNextBlockTimeout();
      p = simulateBlock();
    }
    await p;
  }

  const bootSimChain = async () => {
    if (blockHeight) {
      return;
    }
    // The before-first-block is special... do it now.
    // This emulates what x/swingset does when bootstrapping
    // before continuing with the real initialHeight.
    await blockingSend({
      type: 'AG_COSMOS_INIT',
      blockTime: scaleBlockTime(Date.now()),
      isBootstrap: true,
      params: DEFAULT_SIM_SWINGSET_PARAMS,
    });
    blockHeight = initialHeight;
  };

  const enableDeliveries = () => {
    // Start the first pretend block.
    nextBlockTimeout = setTimeout(simulateBlock, maximumDelay);
  };

  bootSimChain().then(enableDeliveries, e => {
    console.error(`Cannot boot sim chain:`, e);
    process.exit(1);
  });

  const batchDelayMs = delay ? delay * 1000 : undefined;
  return makeBatchedDeliver(
    deliver,
    { clearTimeout, setTimeout },
    batchDelayMs,
  );
}
