//@ts-nocheck
import { type Rpc } from '../../helpers.js';
import { BinaryReader } from '../../binary.js';
import { QueryClient, createProtobufRpcClient } from '@cosmjs/stargate';
import {
  QueryParamsRequest,
  QueryParamsResponse,
  QueryEgressRequest,
  QueryEgressResponse,
  QueryMailboxRequest,
  QueryMailboxResponse,
} from './query.js';
/** Query provides defines the gRPC querier service */
export interface Query {
  /** Params queries params of the swingset module. */
  params(request?: QueryParamsRequest): Promise<QueryParamsResponse>;
  /** Egress queries a provisioned egress. */
  egress(request: QueryEgressRequest): Promise<QueryEgressResponse>;
  /** Return the contents of a peer's outbound mailbox. */
  mailbox(request: QueryMailboxRequest): Promise<QueryMailboxResponse>;
}
export class QueryClientImpl implements Query {
  private readonly rpc: Rpc;
  constructor(rpc: Rpc) {
    this.rpc = rpc;
    this.params = this.params.bind(this);
    this.egress = this.egress.bind(this);
    this.mailbox = this.mailbox.bind(this);
  }
  params(request: QueryParamsRequest = {}): Promise<QueryParamsResponse> {
    const data = QueryParamsRequest.encode(request).finish();
    const promise = this.rpc.request('agoric.swingset.Query', 'Params', data);
    return promise.then(data =>
      QueryParamsResponse.decode(new BinaryReader(data)),
    );
  }
  egress(request: QueryEgressRequest): Promise<QueryEgressResponse> {
    const data = QueryEgressRequest.encode(request).finish();
    const promise = this.rpc.request('agoric.swingset.Query', 'Egress', data);
    return promise.then(data =>
      QueryEgressResponse.decode(new BinaryReader(data)),
    );
  }
  mailbox(request: QueryMailboxRequest): Promise<QueryMailboxResponse> {
    const data = QueryMailboxRequest.encode(request).finish();
    const promise = this.rpc.request('agoric.swingset.Query', 'Mailbox', data);
    return promise.then(data =>
      QueryMailboxResponse.decode(new BinaryReader(data)),
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
    egress(request: QueryEgressRequest): Promise<QueryEgressResponse> {
      return queryService.egress(request);
    },
    mailbox(request: QueryMailboxRequest): Promise<QueryMailboxResponse> {
      return queryService.mailbox(request);
    },
  };
};
