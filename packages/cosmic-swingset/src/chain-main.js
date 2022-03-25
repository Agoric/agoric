/* global setInterval */
import { resolve as importMetaResolve } from 'import-meta-resolve';
import {
  importMailbox,
  exportMailbox,
} from '@agoric/swingset-vat/src/devices/mailbox/mailbox.js';

import { assert, details as X } from '@agoric/assert';
import { makeSlogSenderFromModule } from '@agoric/telemetry';

import stringify from './json-stable-stringify.js';
import { launch } from './launch-chain.js';
import makeBlockManager from './block-manager.js';
import { getTelemetryProviders } from './kernel-stats.js';

const AG_COSMOS_INIT = 'AG_COSMOS_INIT';

const TELEMETRY_SERVICE_NAME = 'agd-cosmos';

const toNumber = specimen => {
  const number = parseInt(specimen, 10);
  assert(
    String(number) === String(specimen),
    X`Could not parse ${JSON.stringify(specimen)} as a number`,
  );
  return number;
};

const makeChainStorage = (call, prefix = '', imp = x => x, exp = x => x) => {
  assert(
    prefix === '' || prefix.endsWith('.'),
    X`prefix ${prefix} must end with a dot`,
  );

  let cache = new Map();
  let changedKeys = new Set();
  const storage = {
    has(key) {
      // It's more efficient just to get the value (null if not exists)
      return !!storage.get(key);
    },
    set(key, obj) {
      if (cache.get(key) !== obj) {
        cache.set(key, obj);
        changedKeys.add(key);
      }
    },
    delete(key) {
      cache.delete(key);
      changedKeys.add(key);
    },
    get(key) {
      if (cache.has(key)) {
        // Our cache has the value.
        return cache.get(key);
      }
      const retStr = call(stringify({ method: 'get', key: `${prefix}${key}` }));
      const ret = JSON.parse(retStr);
      const value = ret && JSON.parse(ret);
      // console.log(` value=${value}`);
      const obj = value && imp(value);
      cache.set(key, obj);
      // We need to add this in case the caller mutates the state, as in
      // mailbox.js, which mutates on basically every get.
      changedKeys.add(key);
      return obj;
    },
    commit() {
      for (const key of changedKeys.keys()) {
        const obj = cache.get(key);
        const value = obj === undefined ? '' : stringify(exp(obj));
        call(
          stringify({
            method: 'set',
            key: `${prefix}${key}`,
            value,
          }),
        );
      }
      // Reset our state.
      storage.abort();
    },
    abort() {
      // Just reset our state.
      cache = new Map();
      changedKeys = new Set();
    },
  };
  return storage;
};

/**
 * Create a queue backed by chain storage.
 *
 * The queue uses the following storage layout, prefixed by `prefix`, such as
 * `actionQueue.`:
 *
 * - `<prefix>head`: the index of the first entry of the queue.
 * - `<prefix>tail`: the index _past_ the last entry in the queue.
 * - `<prefix><index>`: the contents of the queue at the given index.
 *
 * For the `actionQueue`, the Cosmos side of the queue will push into the queue,
 * updating `<prefix>tail` and `<prefix><index>`. The JS side will shift the
 * queue, updating `<prefix>head` and reading and deleting `<prefix><index>`.
 *
 * Parallel access is not supported, only a single outstanding operation at a time.
 *
 * @param {(obj: any) => any} call Send a message to the chain's storage API and
 *   receive a reply
 * @param {string} [prefix] String to prepend to the queue's storage keys
 */
const makeChainQueue = (call, prefix = '') => {
  const storage = makeChainStorage(call, prefix);
  const queue = {
    push: obj => {
      const tail = storage.get('tail') || 0;
      storage.set('tail', tail + 1);
      storage.set(tail, obj);
      storage.commit();
    },
    /** @type {Iterable<unknown>} */
    consumeAll: () => ({
      [Symbol.iterator]: () => {
        let head = storage.get('head') || 0;
        const tail = storage.get('tail') || 0;
        return {
          next: () => {
            if (head < tail) {
              // Still within the queue.
              const value = storage.get(head);
              storage.delete(head);
              head += 1;
              return { value, done: false };
            }
            // Reached the end, so clean up our indices.
            storage.delete('head');
            storage.delete('tail');
            storage.commit();
            return { done: true };
          },
          return: () => {
            // We're done consuming, so save our state.
            storage.set('head', head);
            storage.commit();
          },
          throw: () => {
            // Don't change our state.
            storage.abort();
          },
        };
      },
    }),
  };
  return queue;
};

export default async function main(progname, args, { env, homedir, agcc }) {
  const portNums = {};

  // TODO: use the 'basedir' pattern

  // Try to determine the cosmos chain home.
  function getFlagValue(flagName, deflt) {
    let flagValue = deflt;
    const envValue = env[`AG_CHAIN_COSMOS_${flagName.toUpperCase()}`];
    if (envValue !== undefined) {
      flagValue = envValue;
    }
    const flag = `--${flagName}`;
    const flagEquals = `--${flagName}=`;
    for (let i = 0; i < args.length; i += 1) {
      const arg = args[i];
      if (arg === flag) {
        i += 1;
        flagValue = args[i];
      } else if (arg.startsWith(flagEquals)) {
        flagValue = arg.substr(flagEquals.length);
      }
    }
    return flagValue;
  }

  // We try to find the actual cosmos state directory (default=~/.ag-chain-cosmos), which
  // is better than scribbling into the current directory.
  const cosmosHome = getFlagValue('home', `${homedir}/.ag-chain-cosmos`);
  const stateDBDir = `${cosmosHome}/data/ag-cosmos-chain-state`;

  // console.log('Have AG_COSMOS', agcc);

  const portHandlers = {};
  let lastPort = 0;
  function registerPortHandler(portHandler) {
    lastPort += 1;
    const port = lastPort;
    portHandlers[port] = async (...phArgs) => {
      try {
        return await portHandler(...phArgs);
      } catch (e) {
        console.error('portHandler threw', e);
        throw e;
      }
    };
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
    p.then(
      res => {
        // console.error(`Replying in Node to ${str} with`, res);
        replier.resolve(`${res}`);
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
  setInterval(() => undefined, 30000);
  agcc.runAgCosmosDaemon(nodePort, fromGo, [progname, ...args]);

  let savedChainSends = [];

  // Send a chain downcall, recording what we sent and received.
  function chainSend(...sendArgs) {
    const ret = agcc.send(...sendArgs);
    savedChainSends.push([sendArgs, ret]);
    return ret;
  }

  // Flush the chain send queue.
  // If doReplay is truthy, replay each send and insist
  // it hase the same return result.
  function flushChainSends(doReplay) {
    // Remove our queue.
    const chainSends = savedChainSends;
    savedChainSends = [];

    if (!doReplay) {
      return;
    }

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

  // this storagePort changes for every single message. We define it out here
  // so the 'externalStorage' object can close over the single mutable
  // instance, and we update the 'portNums.storage' value each time toSwingSet is called
  async function launchAndInitializeSwingSet(bootMsg) {
    // this object is used to store the mailbox state.
    const mailboxStorage = makeChainStorage(
      msg => chainSend(portNums.storage, msg),
      'mailbox.',
      data => {
        const ack = toNumber(data.ack);
        const outbox = data.outbox.map(([seq, msg]) => [toNumber(seq), msg]);
        return importMailbox({ outbox, ack });
      },
      exportMailbox,
    );
    const actionQueue = makeChainQueue(
      msg => chainSend(portNums.storage, msg),
      'actionQueue.',
    );
    function setActivityhash(activityhash) {
      const msg = stringify({
        method: 'set',
        key: 'activityhash',
        value: activityhash,
      });
      chainSend(portNums.storage, msg);
    }
    function doOutboundBridge(dstID, obj) {
      const portNum = portNums[dstID];
      if (portNum === undefined) {
        console.error(
          `warning: doOutboundBridge called before AG_COSMOS_INIT gave us ${dstID}`,
        );
        // it is dark, and your exception is likely to be eaten by a vat
        throw Error(
          `warning: doOutboundBridge called before AG_COSMOS_INIT gave us ${dstID}`,
        );
      }
      const retStr = chainSend(portNum, stringify(obj));
      try {
        return JSON.parse(retStr);
      } catch (e) {
        assert.fail(X`cannot JSON.parse(${JSON.stringify(retStr)}): ${e}`);
      }
    }

    const argv = {
      ROLE: 'chain',
      noFakeCurrencies: !env.FAKE_CURRENCIES,
      vaultFactoryControllerAddress: env.VAULT_FACTORY_CONTROLLER_ADDR,
      bootMsg,
    };
    const vatconfig = new URL(
      await importMetaResolve(
        env.CHAIN_BOOTSTRAP_VAT_CONFIG ||
          argv.bootMsg.params.bootstrap_vat_config,
        import.meta.url,
      ),
    ).pathname;

    const { metricsProvider } = getTelemetryProviders({
      console,
      env,
      serviceName: TELEMETRY_SERVICE_NAME,
    });

    const { SLOGFILE, SLOGSENDER, LMDB_MAP_SIZE } = env;
    const slogSender = await makeSlogSenderFromModule(SLOGSENDER, {
      stateDir: stateDBDir,
      env,
      serviceName: TELEMETRY_SERVICE_NAME,
    });

    const mapSize = (LMDB_MAP_SIZE && parseInt(LMDB_MAP_SIZE, 10)) || undefined;

    const s = await launch({
      actionQueue,
      kernelStateDBDir: stateDBDir,
      mailboxStorage,
      setActivityhash,
      bridgeOutbound: doOutboundBridge,
      vatconfig,
      argv,
      metricsProvider,
      slogFile: SLOGFILE,
      slogSender,
      mapSize,
    });
    return s;
  }

  let blockingSend;
  async function toSwingSet(action, _replier) {
    // console.log(`toSwingSet`, action);
    if (action.vibcPort) {
      portNums.dibc = action.vibcPort;
    }

    if (action.storagePort) {
      // Initialize the storage for this particular transaction.
      // console.log(` setting portNums.storage to`, action.storagePort);
      portNums.storage = action.storagePort;
    }

    if (action.vbankPort) {
      portNums.bank = action.vbankPort;
    }

    if (action.lienPort) {
      portNums.lien = action.lienPort;
    }

    if (!blockingSend) {
      const { savedChainSends: scs, ...fns } =
        await launchAndInitializeSwingSet(action);
      savedChainSends = scs;
      blockingSend = makeBlockManager({
        ...fns,
        flushChainSends,
        verboseBlocks: true,
      });
    }

    if (action.type === AG_COSMOS_INIT) {
      // console.error('got AG_COSMOS_INIT', action);
      return true;
    }

    return blockingSend(action, savedChainSends);
  }
}
