import {
  State as IBCChannelState,
  Order,
} from '@agoric/cosmic-proto/ibc/core/channel/v1/channel.js';
import { State as IBCConnectionState } from '@agoric/cosmic-proto/ibc/core/connection/v1/connection.js';
import assert from 'node:assert';

/**
 * @import {IBCChannelID, IBCConnectionID} from '@agoric/vats';
 * @import {Chain, IBCInfo} from '@chain-registry/types';
 * @import {ChainRegistryClient} from '@chain-registry/client';
 * @import {CosmosChainInfo, IBCConnectionInfo} from '../cosmos-api.js';
 */

/**
 * @param {IBCInfo} ibcInfo
 * @param {string} name
 * @param {Record<string, CosmosChainInfo>} chainInfo
 * @returns {[string, IBCConnectionInfo] | []}
 */
function toConnectionEntry(ibcInfo, name, chainInfo) {
  // IbcInfo encodes the undirected edge as a tuple of (chain_1, chain_2) in alphabetical order
  const fromChain1 = ibcInfo.chain_1.chain_name === name;
  const [from, to] = fromChain1
    ? [ibcInfo.chain_1, ibcInfo.chain_2]
    : [ibcInfo.chain_2, ibcInfo.chain_1];
  assert.equal(from.chain_name, name);
  const transferChannels = ibcInfo.channels.filter(
    c =>
      c.chain_1.port_id === 'transfer' &&
      // @ts-expect-error tags does not specify keys
      c.tags?.preferred,
  );
  if (transferChannels.length === 0) {
    console.warn(
      'no transfer channel for [',
      from.chain_name,
      to.chain_name,
      ']',
      '(skipping)',
    );
    return [];
  }
  if (transferChannels.length > 1) {
    console.warn(
      'multiple preferred transfer channels [',
      from.chain_name,
      to.chain_name,
      ']:',
      transferChannels,
      '(choosing first)',
    );
  }
  const [channel] = transferChannels;
  const [channelFrom, channelTo] = fromChain1
    ? [channel.chain_1, channel.chain_2]
    : [channel.chain_2, channel.chain_1];
  const record = {
    id: /** @type {IBCConnectionID} */ (from.connection_id),
    client_id: from.client_id,
    counterparty: {
      client_id: to.client_id,
      connection_id: /** @type {IBCConnectionID} */ (to.connection_id),
      prefix: {
        key_prefix: 'FIXME',
      },
    },
    state: IBCConnectionState.STATE_OPEN, // XXX presumably
    transferChannel: {
      channelId: /** @type {IBCChannelID} */ (channelFrom.channel_id),
      portId: channelFrom.port_id,
      counterPartyChannelId: /** @type {IBCChannelID} */ (channelTo.channel_id),
      counterPartyPortId: channelTo.port_id,
      // FIXME mapping, our guard expects a numerical enum
      ordering: Order.ORDER_NONE_UNSPECIFIED,
      state: IBCChannelState.STATE_OPEN, // XXX presumably
      version: channel.version,
    },
  };
  const destChainId = chainInfo[to.chain_name].chainId;
  return [destChainId, record];
}

/**
 * Converts the given chain info to our local config format
 *
 * @param {Pick<
 *   ChainRegistryClient,
 *   'chains' | 'ibcData' | 'getChainAssetList'
 * >} registry
 */
export const convertChainInfo = async registry => {
  /** @type {Record<string, CosmosChainInfo>} */
  const chainInfo = {};

  for (const chain of registry.chains) {
    console.log('processing info', chain.chain_name);
    chainInfo[chain.chain_name] = {
      chainId: chain.chain_id,
      stakingTokens: chain.staking?.staking_tokens,
      // UNTIL https://github.com/Agoric/agoric-sdk/issues/9326
      icqEnabled: chain.chain_name === 'osmosis',
    };
  }

  // XXX probably easier to keep ibc separate
  const ibcLookup = {};
  for (const ibc of registry.ibcData) {
    ibcLookup[ibc.chain_1.chain_name] ||= [];
    ibcLookup[ibc.chain_2.chain_name] ||= [];

    ibcLookup[ibc.chain_1.chain_name].push(ibc);
    ibcLookup[ibc.chain_2.chain_name].push(ibc);
  }

  const chainNames = registry.chains.map(c => c.chain_name).sort();

  // eslint-disable-next-line no-nested-ternary
  const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

  // iterate this after chainInfo is filled out
  for (const name of chainNames) {
    console.log('processing connections', name);

    const ibcData = ibcLookup[name];
    const connections = Object.fromEntries(
      ibcData
        .map(datum => toConnectionEntry(datum, name, chainInfo))
        // sort alphabetically for consistency
        .sort(([a], [b]) => (a && b ? cmp(a, b) : 0)),
    );
    const assetList = registry.getChainAssetList(name);
    chainInfo[name] = { ...chainInfo[name], connections, assetList };
  }

  // return object with insertion in alphabetical order of chain name
  return Object.fromEntries(chainNames.map(name => [name, chainInfo[name]]));
};
