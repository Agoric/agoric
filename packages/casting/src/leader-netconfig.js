/* global fetch */
import { makeRoundRobinLeader } from './leader.js';
import {
  DEFAULT_BOOTSTRAP,
  DEFAULT_JITTER,
  DEFAULT_RETRY_CALLBACK,
} from './defaults.js';
import { assertNetworkConfig } from './netconfig.js';

/**
 * @import {ERef} from '@endo/far';
 * @import {IterationObserver, LatestTopic, Notifier, NotifierRecord, PublicationRecord, Publisher, PublishKit, StoredPublishKit, StoredSubscription, StoredSubscriber, Subscriber, Subscription, UpdateRecord} from '../src/types.js';
 * @import {Marshaller, StorageNode, Unserializer} from '@agoric/internal/src/lib-chainStorage.js';
 */

const { Fail } = assert;

/**
 * @param {string[]} rpcAddrs
 * @param {import('./types.js').LeaderOptions} [leaderOptions]
 * @returns {import('./types.js').Leader}
 */
export const makeLeaderFromRpcAddresses = (rpcAddrs, leaderOptions) => {
  Array.isArray(rpcAddrs) || Fail`rpcAddrs ${rpcAddrs} must be an array`;

  const rpcHrefs = rpcAddrs.map(rpcAddr => {
    typeof rpcAddr === 'string' || Fail`rpcAddr ${rpcAddr} must be a string`;
    // Don't remove explicit port numbers from the URL, because the Cosmos
    // `--node=xxx` flag requires them (it doesn't just assume that
    // `--node=https://testnet.rpc.agoric.net` is the same as
    // `--node=https://testnet.rpc.agoric.net:443`)
    return rpcAddr.includes('://') ? rpcAddr : `http://${rpcAddr}`;
  });

  return makeRoundRobinLeader(rpcHrefs, leaderOptions);
};

/**
 * @param {string} netconfigURL
 * @param {import('./types.js').LeaderOptions} [options]
 */
export const makeLeaderFromNetworkConfig = (netconfigURL, options = {}) => {
  const { retryCallback = DEFAULT_RETRY_CALLBACK, jitter = DEFAULT_JITTER } =
    options;
  /** @type {import('./types.js').LeaderOptions['retryCallback']} */
  const retry = async (where, err, attempt) => {
    if (retryCallback) {
      return retryCallback(where, err, attempt);
    }
    throw err;
  };
  let attempt = 0;
  const where = 'Network config leader';
  return new Promise((resolve, reject) => {
    const makeLeader = async () => {
      const response = await fetch(netconfigURL, {
        headers: { accept: 'application/json' },
      });
      const networkConfig = await response.json();
      assertNetworkConfig(harden(networkConfig));
      const { rpcAddrs } = networkConfig;
      // Our part succeeded, so reset the attempt counter.
      attempt = 0;
      return makeLeaderFromRpcAddresses(rpcAddrs, options);
    };
    const retryLeader = async err => {
      retry(where, err, attempt)
        .then(() => jitter(where))
        .then(() => makeLeader().then(resolve, retryLeader))
        .catch(reject);
      attempt += 1;
    };
    makeLeader().then(resolve, retryLeader);
  });
};

/**
 * @param {string} [bootstrap]
 * @param {import('./types.js').LeaderOptions} [options]
 * @returns {ERef<import('./types.js').Leader>}
 */
export const makeLeader = (bootstrap = DEFAULT_BOOTSTRAP, options) => {
  if (bootstrap.includes('network-config')) {
    return makeLeaderFromNetworkConfig(bootstrap, options);
  }
  return makeLeaderFromRpcAddresses([bootstrap], options);
};
