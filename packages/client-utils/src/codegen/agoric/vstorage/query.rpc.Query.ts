//@ts-nocheck
import { type Rpc } from '../../helpers.js';
import { BinaryReader } from '../../binary.js';
import { QueryClient, createProtobufRpcClient } from '@cosmjs/stargate';
import {
  QueryDataRequest,
  QueryDataResponse,
  QueryCapDataRequest,
  QueryCapDataResponse,
  QueryChildrenRequest,
  QueryChildrenResponse,
} from './query.js';
/** Query defines the gRPC querier service */
export interface Query {
  /** Return the raw string value of an arbitrary vstorage datum. */
  data(request: QueryDataRequest): Promise<QueryDataResponse>;
  /**
   * Return a formatted representation of a vstorage datum that must be
   * a valid StreamCell with CapData values, or standalone CapData.
   */
  capData(request: QueryCapDataRequest): Promise<QueryCapDataResponse>;
  /** Return the children of a given vstorage path. */
  children(request: QueryChildrenRequest): Promise<QueryChildrenResponse>;
}
export class QueryClientImpl implements Query {
  private readonly rpc: Rpc;
  constructor(rpc: Rpc) {
    this.rpc = rpc;
    this.data = this.data.bind(this);
    this.capData = this.capData.bind(this);
    this.children = this.children.bind(this);
  }
  data(request: QueryDataRequest): Promise<QueryDataResponse> {
    const data = QueryDataRequest.encode(request).finish();
    const promise = this.rpc.request('agoric.vstorage.Query', 'Data', data);
    return promise.then(data =>
      QueryDataResponse.decode(new BinaryReader(data)),
    );
  }
  capData(request: QueryCapDataRequest): Promise<QueryCapDataResponse> {
    const data = QueryCapDataRequest.encode(request).finish();
    const promise = this.rpc.request('agoric.vstorage.Query', 'CapData', data);
    return promise.then(data =>
      QueryCapDataResponse.decode(new BinaryReader(data)),
    );
  }
  children(request: QueryChildrenRequest): Promise<QueryChildrenResponse> {
    const data = QueryChildrenRequest.encode(request).finish();
    const promise = this.rpc.request('agoric.vstorage.Query', 'Children', data);
    return promise.then(data =>
      QueryChildrenResponse.decode(new BinaryReader(data)),
    );
  }
}
export const createRpcQueryExtension = (base: QueryClient) => {
  const rpc = createProtobufRpcClient(base);
  const queryService = new QueryClientImpl(rpc);
  return {
    data(request: QueryDataRequest): Promise<QueryDataResponse> {
      return queryService.data(request);
    },
    capData(request: QueryCapDataRequest): Promise<QueryCapDataResponse> {
      return queryService.capData(request);
    },
    children(request: QueryChildrenRequest): Promise<QueryChildrenResponse> {
      return queryService.children(request);
    },
  };
};
