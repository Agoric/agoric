// @ts-check
/* global Buffer */

import { Tendermint34Client } from '@cosmjs/tendermint-rpc';
import { createProtobufRpcClient, QueryClient } from '@cosmjs/stargate';
import {
  QueryClientImpl,
  QueryDataResponse,
} from '@agoric/cosmic-proto/vstorage/query.js';
import { isStreamCell } from '@agoric/internal/src/lib-chainStorage.js';

const { Fail } = assert;

/** @param {import('@cosmjs/tendermint-rpc').RpcClient} rpcClient */
export const makeVstorageQueryService = async rpcClient => {
  const tmClient = await Tendermint34Client.create(rpcClient);
  const qClient = new QueryClient(tmClient);
  const rpc = createProtobufRpcClient(qClient);
  const queryService = new QueryClientImpl(rpc);
  return queryService;
};

/**
 * Extract one value from a the vstorage stream cell in a QueryDataResponse
 *
 * @param {QueryDataResponse} data
 * @param {number} [index] index of the desired value in a deserialized stream cell
 *
 * XXX import('@agoric/cosmic-proto/vstorage/query').QueryDataResponse doesn't worksomehow
 * @typedef {Awaited<ReturnType<import('@agoric/cosmic-proto/vstorage/query.js').QueryClientImpl['Data']>>} QueryDataResponseT
 */
export const extractStreamCellValue = (data, index = -1) => {
  const { value: serialized } = QueryDataResponse.fromJSON(data);

  serialized.length > 0 || Fail`no StreamCell values: ${data}`;

  const streamCell = JSON.parse(serialized);
  if (!isStreamCell(streamCell)) {
    throw Fail`not a StreamCell: ${streamCell}`;
  }

  const { values } = streamCell;
  values.length > 0 || Fail`no StreamCell values: ${streamCell}`;

  const value = values.at(index);
  assert.typeof(value, 'string');
  return value;
};
harden(extractStreamCellValue);

/**
 * @param {{ kind:PathKind, path:string }[]} queries
 * @returns {JsonRpcRequest[]}
 *
 * @typedef {import('@cosmjs/json-rpc').JsonRpcRequest} JsonRpcRequest
 */
export const vstorageRequests = queries =>
  queries.map(({ kind, path }, index) => ({
    jsonrpc: '2.0',
    id: index,
    method: 'abci_query',
    params: { path: `/custom/vstorage/${kind}/${path}` },
  }));

/**
 * @param {typeof window.fetch} fetch
 * @param {string[]} nodes
 *
 * @typedef {'children' | 'data'} PathKind
 */
export const makeBatchQuery = (fetch, nodes) => {
  let nodeIx = 0;
  /**
   * @param {{ kind:PathKind, path:string }[]} queries
   * @returns {Promise<{ values: QueryDataResponse[], errors: string[] }>}
   */
  const batchQuery = async queries => {
    const requests = vstorageRequests(queries);
    nodeIx = (nodeIx + 1) % nodes.length;
    const node = nodes[nodeIx];
    const res = await fetch(node, {
      method: 'POST',
      body: JSON.stringify(requests),
    });
    if (res.status >= 400) {
      throw Error(res.statusText);
    }
    const data = await res.json();
    const responses = Array.isArray(data) ? data : [data];
    const values = [];
    const errors = [];
    for (const item of responses) {
      if (typeof item?.result?.response !== 'object') {
        throw Error(
          `JSON RPC error: ${typeof item}.${typeof item?.result}.${typeof item
            ?.result?.response}`,
        );
      }
      const {
        id,
        result: { response },
      } = item;
      if (response.code !== 0) {
        errors[id] = response.log;
        continue;
      }
      typeof response.value === 'string' ||
        Fail`JSON RPC value must be string, not ${typeof response.value}`;
      const decoded = Buffer.from(response.value, 'base64').toString();
      values[id] = QueryDataResponse.fromJSON(JSON.parse(decoded));
    }
    return { values, errors };
  };
  return batchQuery;
};
