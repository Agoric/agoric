import {
  CosmosChainInfoShape,
  denomHash,
  withChainCapabilities,
} from '@agoric/orchestration';
import fetchedChainInfo from '@agoric/orchestration/src/fetched-chain-info.js';
import { M, mustMatch } from '@endo/patterns';
import { ChainPolicies } from './chain-policies.js';

/**
 * @import {FastUSDCConfig} from '@agoric/fast-usdc';
 * @import {Passable} from '@endo/marshal';
 * @import {CosmosChainInfo, Denom, DenomDetail, IBCConnectionInfo} from '@agoric/orchestration';
 */

/**
 * @param {Record<string, IBCConnectionInfo>} connections
 * @returns {AssetEntry[]}
 * @typedef {[Denom, DenomDetail & { brandKey?: string}]} AssetEntry
 */
const makeUSDCAssets = connections => {
  assert('agoric' in connections);
  const [baseName, baseDenom] = ['noble', 'uusdc'];
  /** @type {AssetEntry} */
  const issuer = ['uusdc', { baseName, chainName: 'noble', baseDenom }];
  /** @param {string} n */
  const brandKeyOf = n => (n === 'agoric' ? { brandKey: 'USDC' } : {});
  /** @type {AssetEntry[]} */
  const others = Object.entries(connections).map(([chainName, conn]) => [
    `ibc/${denomHash({ denom: 'uusdc', channelId: conn.transferChannel.channelId })}`,
    { baseName: 'noble', chainName, baseDenom, ...brandKeyOf(chainName) },
  ]);
  const assetInfo = [issuer, ...others];
  return assetInfo;
};

export const defaultAssetInfo = makeUSDCAssets({
  agoric: fetchedChainInfo.agoric.connections['noble-1'],
  osmosis: fetchedChainInfo.osmosis.connections['noble-1'],
});
harden(defaultAssetInfo);

const agoricAssetInfo = defaultAssetInfo.filter(
  ([_d, i]) => i.chainName === 'agoric',
);

/** ABI for DepositForBurn event in TokenMessenger contract */
const DepositForBurnEvent =
  'DepositForBurn(uint64,address,uint256,address,bytes32,uint32,bytes32,bytes32)';

/** @satisfies {Record<string, CosmosChainInfo & Passable>} */
const devnetChainInfo = (() => {
  const [idAg, idNoble, idOsmo] = /** @type {const} */ ([
    'agoricdev-23',
    'grand-1',
    'osmo-test-5',
  ]);
  const config = /** @type {const} */ ({
    agoric: {
      noble: {
        channel_id: 'channel-69',
        client_id: '07-tendermint-140',
        connection_id: 'connection-95',
      },
      osmosis: {
        channel_id: 'channel-61',
        client_id: '07-tendermint-127',
        connection_id: 'connection-81',
      },
    },
    noble: {
      agoric: {
        channel_id: 'channel-315',
        client_id: '07-tendermint-409',
        connection_id: 'connection-367',
      },
      osmosis: {
        connection_id: 'connection-31',
        client_id: '07-tendermint-42',
        channel_id: 'channel-22',
      },
    },
    osmosis: {
      agoric: {
        channel_id: 'channel-10041',
        client_id: '07-tendermint-4326',
        connection_id: 'connection-3786',
      },
      noble: {
        client_id: '07-tendermint-1374',
        connection_id: 'connection-1275',
        channel_id: 'channel-4280',
      },
    },
  });
  const mkConn = (fwd, rev) => {
    /** @type {Readonly<IBCConnectionInfo>} */
    const conn = {
      id: fwd.connection_id,
      client_id: fwd.client_id,
      counterparty: {
        client_id: rev.client_id,
        connection_id: rev.connection_id,
      },
      transferChannel: {
        channelId: fwd.channel_id,
        counterPartyChannelId: rev.channel_id,
        portId: 'transfer',
        counterPartyPortId: 'transfer',
        state: 3,
        ordering: 0,
        version: 'ics20-1',
      },
      state: 3,
    };
    return conn;
  };

  const info = {
    agoric: {
      bech32Prefix: 'agoric',
      chainId: idAg,
      stakingTokens: [{ denom: 'ubld' }],
      icqEnabled: false,
      connections: {
        [idNoble]: mkConn(config.agoric.noble, config.noble.agoric),
        [idOsmo]: mkConn(config.agoric.osmosis, config.osmosis.agoric),
      },
    },
    noble: {
      bech32Prefix: 'noble',
      chainId: idNoble,
      icqEnabled: false,
      connections: {
        [idAg]: mkConn(config.noble.agoric, config.agoric.noble),
        [idOsmo]: mkConn(config.noble.osmosis, config.osmosis.noble),
      },
    },
    osmosis: {
      bech32Prefix: 'osmo',
      chainId: 'osmo-test-5',
      stakingTokens: [{ denom: 'uosmo' }],
      icqEnabled: true,
      connections: {
        [idAg]: mkConn(config.osmosis.agoric, config.agoric.osmosis),
        [idNoble]: mkConn(config.osmosis.noble, config.noble.osmosis),
      },
    },
  };
  harden(info);
  mustMatch(info, M.recordOf(M.string(), CosmosChainInfoShape));
  return info;
})();

export const devnetAssetInfo = makeUSDCAssets({
  agoric: devnetChainInfo.agoric.connections['grand-1'],
  osmosis: devnetChainInfo.osmosis.connections['grand-1'],
});
harden(devnetAssetInfo);

/**
 * @type {Record<string, Pick<FastUSDCConfig, 'oracles' | 'feedPolicy' | 'chainInfo' | 'assetInfo' >>}
 *
 * TODO: determine OCW operator addresses
 * meanwhile, use price oracle addresses (from updatePriceFeeds.js).
 */
export const configurations = {
  /**
   * NOTE: The a3p-integration runtime does _not_ include
   * a noble chain; this limits functionality to advancing
   * to the Agoric chain.
   */
  A3P_INTEGRATION: {
    oracles: {
      gov1: 'agoric1ee9hr0jyrxhy999y755mp862ljgycmwyp4pl7q',
      gov2: 'agoric1wrfh296eu2z34p6pah7q04jjuyj3mxu9v98277',
      gov3: 'agoric1ydzxwh6f893jvpaslmaz6l8j2ulup9a7x8qvvq',
    },
    feedPolicy: {
      nobleAgoricChannelId: 'channel-does-not-exist',
      nobleDomainId: 4,
      chainPolicies: ChainPolicies.TESTNET,
      eventFilter: DepositForBurnEvent,
    },
    chainInfo: /** @type {Record<string, CosmosChainInfo & Passable>} */ (
      withChainCapabilities({
        agoric: fetchedChainInfo.agoric,
        // registering USDC-on-agoric requires registering the noble chain
        noble: fetchedChainInfo.noble,
      })
    ),
    assetInfo: agoricAssetInfo,
  },
  MAINNET: {
    oracles: {
      '01node': 'agoric19uscwxdac6cf6z7d5e26e0jm0lgwstc47cpll8',
      'Simply Staking': 'agoric1krunjcqfrf7la48zrvdfeeqtls5r00ep68mzkr',
      P2P: 'agoric1n4fcxsnkxe4gj6e24naec99hzmc4pjfdccy5nj',
    },
    feedPolicy: {
      nobleAgoricChannelId: 'channel-21',
      nobleDomainId: 4,
      chainPolicies: ChainPolicies.MAINNET,
      eventFilter: DepositForBurnEvent,
    },
    chainInfo: /** @type {Record<string, CosmosChainInfo & Passable>} */ (
      withChainCapabilities(fetchedChainInfo)
    ),
    assetInfo: defaultAssetInfo,
  },
  DEVNET: {
    oracles: {
      gov1: 'agoric1ldmtatp24qlllgxmrsjzcpe20fvlkp448zcuce',
      gov2: 'agoric140dmkrz2e42ergjj7gyvejhzmjzurvqeq82ang',
      gov3: 'agoric1w8wktaur4zf8qmmtn3n7x3r0jhsjkjntcm3u6h',
      // jcv1: 'agoric1f6au5xffuuph97w85zg9qf062gddsnw0sx9xj3',
      // jcv2: 'agoric1vxygktgl0zd7aznq9kw2msdx6gfyz0t0wjreag',
    },
    feedPolicy: {
      // grand-1->agoricdev-23: channel-304
      nobleAgoricChannelId: 'channel-304',
      nobleDomainId: 4,
      chainPolicies: ChainPolicies.TESTNET, // TODO: devnet chainPolicies
      eventFilter: DepositForBurnEvent,
    },
    chainInfo: devnetChainInfo,
    assetInfo: devnetAssetInfo,
  },
  EMERYNET: {
    oracles: {
      gov1: 'agoric1ldmtatp24qlllgxmrsjzcpe20fvlkp448zcuce',
      gov2: 'agoric140dmkrz2e42ergjj7gyvejhzmjzurvqeq82ang',
    },
    feedPolicy: {
      nobleAgoricChannelId: 'TODO',
      nobleDomainId: 4,
      chainPolicies: ChainPolicies.TESTNET,
      eventFilter: DepositForBurnEvent,
    },
    chainInfo: /** @type {Record<string, CosmosChainInfo & Passable>} */ (
      withChainCapabilities(fetchedChainInfo) // TODO: use emerynet values
    ),
    assetInfo: defaultAssetInfo, // TODO: use emerynet values
  },
};
harden(configurations);

// Constraints on the configurations
const MAINNET_EXPECTED_ORACLES = 3;
assert(
  new Set(Object.values(configurations.MAINNET.oracles)).size ===
    MAINNET_EXPECTED_ORACLES,
  `Mainnet must have exactly ${MAINNET_EXPECTED_ORACLES} oracles`,
);
