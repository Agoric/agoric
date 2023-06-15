// @ts-check
import { QueryClient, createProtobufRpcClient } from '@cosmjs/stargate';
import { QueryClientImpl } from '@agoric/cosmic-proto/swingset/query.js';

import { HttpClient, Tendermint34Client } from '@cosmjs/tendermint-rpc';

/**
 * Query swingset params
 *
 * For example, minFeeThingy@@@
 *
 * @param {import('@cosmjs/tendermint-rpc').Tendermint34Client} rpcClient
 * @returns {Promise<import('@agoric/cosmic-proto/swingset/query.js').QueryParamsResponse>}
 */
const querySwingsetParams = async rpcClient => {
  const base = QueryClient.withExtensions(rpcClient);
  const rpc = createProtobufRpcClient(base);
  const queryService = new QueryClientImpl(rpc);
  console.log('query swingset params');
  const result = await queryService.Params({});

  return result;
};

const testMain = async () => {
  const endPoint = 'https://emerynet.rpc.agoric.net:443';
  const rpc = new HttpClient(endPoint);
  const trpc = await Tendermint34Client.create(rpc);
  const params = await querySwingsetParams(trpc);
  console.log(JSON.stringify(params, null, 2));
};

testMain().catch(err => console.error(err));
