//@ts-nocheck
import { type Rpc } from '../../helpers.js';
import { BinaryReader } from '../../binary.js';
import { QueryClient, createProtobufRpcClient } from '@cosmjs/stargate';
import {
  QueryParamsRequest,
  QueryParamsResponse,
  QueryStateRequest,
  QueryStateResponse,
} from './query.js';
/** Query defines the gRPC querier service for vbank module. */
export interface Query {
  /** Params queries params of the vbank module. */
  params(request?: QueryParamsRequest): Promise<QueryParamsResponse>;
  /** State queries current state of the vbank module. */
  state(request?: QueryStateRequest): Promise<QueryStateResponse>;
}
export class QueryClientImpl implements Query {
  private readonly rpc: Rpc;
  constructor(rpc: Rpc) {
    this.rpc = rpc;
    this.params = this.params.bind(this);
    this.state = this.state.bind(this);
  }
  params(request: QueryParamsRequest = {}): Promise<QueryParamsResponse> {
    const data = QueryParamsRequest.encode(request).finish();
    const promise = this.rpc.request('agoric.vbank.Query', 'Params', data);
    return promise.then(data =>
      QueryParamsResponse.decode(new BinaryReader(data)),
    );
  }
  state(request: QueryStateRequest = {}): Promise<QueryStateResponse> {
    const data = QueryStateRequest.encode(request).finish();
    const promise = this.rpc.request('agoric.vbank.Query', 'State', data);
    return promise.then(data =>
      QueryStateResponse.decode(new BinaryReader(data)),
    );
  }
}
export const createRpcQueryExtension = (base: QueryClient) => {
  const rpc = createProtobufRpcClient(base);
  const queryService = new QueryClientImpl(rpc);
  return {
    params(request?: QueryParamsRequest): Promise<QueryParamsResponse> {
      return queryService.params(request);
    },
    state(request?: QueryStateRequest): Promise<QueryStateResponse> {
      return queryService.state(request);
    },
  };
};
