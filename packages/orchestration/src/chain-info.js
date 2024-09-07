import { E } from '@endo/far';
import { M, mustMatch } from '@endo/patterns';
import {
  ASSETS_KEY,
  CHAIN_KEY,
  CONNECTIONS_KEY,
  normalizeConnectionInfo,
} from './exos/chain-hub.js';
import fetchedChainInfo from './fetched-chain-info.js'; // Refresh with scripts/refresh-chain-info.ts
import { CosmosAssetInfoShape, CosmosChainInfoShape } from './typeGuards.js';

/** @import {CosmosChainInfo, EthChainInfo, IBCConnectionInfo} from './types.js'; */
/** @import {NameAdmin} from '@agoric/vats'; */
/** @import {Asset as CosmosAssetInfo} from '@chain-registry/types'; */

/** @typedef {CosmosChainInfo | EthChainInfo} ChainInfo */

const knownChains = /** @satisfies {Record<string, ChainInfo>} */ (
  harden({
    ...fetchedChainInfo,
    // FIXME does not have useful connections
    // UNTIL https://github.com/Agoric/agoric-sdk/issues/9492
    agoriclocal: {
      chainId: 'agoriclocal',
      connections: {
        'cosmoshub-4': {
          id: 'connection-1',
          client_id: '07-tendermint-3',
          counterparty: {
            client_id: '07-tendermint-2',
            connection_id: 'connection-1',
            prefix: {
              key_prefix: '',
            },
          },
          state: 3 /* IBCConnectionState.STATE_OPEN */,
          transferChannel: {
            portId: 'transfer',
            channelId: 'channel-1',
            counterPartyChannelId: 'channel-1',
            counterPartyPortId: 'transfer',
            ordering: 1 /* Order.ORDER_UNORDERED */,
            state: 3 /* IBCConnectionState.STATE_OPEN */,
            version: 'ics20-1',
          },
        },
        osmosislocal: {
          id: 'connection-0',
          client_id: '07-tendermint-2',
          counterparty: {
            client_id: '07-tendermint-2',
            connection_id: 'connection-1',
            prefix: {
              key_prefix: '',
            },
          },
          state: 3 /* IBCConnectionState.STATE_OPEN */,
          transferChannel: {
            portId: 'transfer',
            channelId: 'channel-0',
            counterPartyChannelId: 'channel-1',
            counterPartyPortId: 'transfer',
            ordering: 1 /* Order.ORDER_UNORDERED */,
            state: 3 /* IBCConnectionState.STATE_OPEN */,
            version: 'ics20-1',
          },
        },
      },
    },
  })
);

/** @typedef {typeof knownChains} KnownChains */

/**
 * @param {ERef<NameAdmin>} agoricNamesAdmin
 * @param {string} name
 * @param {CosmosAssetInfo[]} assets
 */
export const registerChainAssets = async (agoricNamesAdmin, name, assets) => {
  mustMatch(assets, M.arrayOf(CosmosAssetInfoShape));
  const { nameAdmin: assetAdmin } =
    await E(agoricNamesAdmin).provideChild(ASSETS_KEY);
  return E(assetAdmin).update(name, assets);
};

/**
 * @param {ERef<NameAdmin>} agoricNamesAdmin
 * @param {string} name
 * @param {CosmosChainInfo} chainInfo
 * @param {(...messages: string[]) => void} [log]
 * @param {Set<string>} [handledConnections] connection keys that need not be
 *   updated
 */
export const registerChain = async (
  agoricNamesAdmin,
  name,
  chainInfo,
  log = () => {},
  handledConnections = new Set(),
) => {
  const { nameAdmin } = await E(agoricNamesAdmin).provideChild(CHAIN_KEY);
  const { nameAdmin: connAdmin } =
    await E(agoricNamesAdmin).provideChild(CONNECTIONS_KEY);

  mustMatch(chainInfo, CosmosChainInfoShape);
  const { connections = {}, ...vertex } = chainInfo;

  const promises = [
    E(nameAdmin)
      .update(name, vertex)
      .then(() => log(`registered agoricNames chain.${name}`)),
  ];

  chainInfo.assetList &&
    promises.push(
      registerChainAssets(agoricNamesAdmin, name, chainInfo.assetList.assets),
    );

  const { chainId } = chainInfo;
  for (const [counterChainId, connInfo] of Object.entries(connections)) {
    const [key, connectionInfo] = normalizeConnectionInfo(
      chainId,
      counterChainId,
      connInfo,
    );
    if (handledConnections.has(key)) {
      continue;
    }

    promises.push(
      E(connAdmin)
        .update(key, connectionInfo)
        .then(() => log(`registering agoricNames chainConnection.${key}`)),
    );

    handledConnections.add(key);
  }
  // Bundle to pipeline IO
  await Promise.all(promises);
};

/**
 * Register all the chains that are known statically.
 *
 * @param {ERef<import('@agoric/vats').NameHubKit['nameAdmin']>} agoricNamesAdmin
 * @param {(...messages: string[]) => void} [log]
 */
export const registerKnownChains = async (agoricNamesAdmin, log) => {
  const handledConnections = new Set();
  for await (const [name, info] of Object.entries(knownChains)) {
    await registerChain(agoricNamesAdmin, name, info, log, handledConnections);
  }
};
