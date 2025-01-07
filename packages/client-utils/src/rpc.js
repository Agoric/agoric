import { makeTendermintRpcClient } from '@agoric/casting';
import { StargateClient } from '@cosmjs/stargate';
import { Tendermint34Client } from '@cosmjs/tendermint-rpc';

/**
 * @import {MinimalNetworkConfig} from './network-config.js';
 */

// TODO distribute load
export const pickEndpoint = ({ rpcAddrs }) => rpcAddrs[0];

/**
 * @param {string} endpoint
 * @param {{ fetch: typeof window.fetch }} io
 * @returns {Promise<Tendermint34Client>}
 */
export const makeTendermint34Client = async (endpoint, { fetch }) => {
  const rpcClient = makeTendermintRpcClient(endpoint, fetch);
  return Tendermint34Client.create(rpcClient);
};

/**
 * @param {MinimalNetworkConfig} config
 * @param {{ fetch: typeof window.fetch }} io
 * @returns {Promise<StargateClient>}
 */
export const makeStargateClient = async (config, { fetch }) => {
  const url = pickEndpoint(config);
  const tm = await makeTendermint34Client(url, { fetch });
  return StargateClient.create(tm);
};
