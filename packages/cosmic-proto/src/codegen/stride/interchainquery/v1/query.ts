//@ts-nocheck
import { Query, type QuerySDKType } from './genesis.js';
import { BinaryReader, BinaryWriter } from '../../../binary.js';
import { type JsonSafe } from '../../../json-safe.js';
export interface QueryPendingQueriesRequest {}
export interface QueryPendingQueriesRequestProtoMsg {
  typeUrl: '/stride.interchainquery.v1.QueryPendingQueriesRequest';
  value: Uint8Array;
}
export interface QueryPendingQueriesRequestSDKType {}
export interface QueryPendingQueriesResponse {
  pendingQueries: Query[];
}
export interface QueryPendingQueriesResponseProtoMsg {
  typeUrl: '/stride.interchainquery.v1.QueryPendingQueriesResponse';
  value: Uint8Array;
}
export interface QueryPendingQueriesResponseSDKType {
  pending_queries: QuerySDKType[];
}
function createBaseQueryPendingQueriesRequest(): QueryPendingQueriesRequest {
  return {};
}
export const QueryPendingQueriesRequest = {
  typeUrl: '/stride.interchainquery.v1.QueryPendingQueriesRequest',
  encode(
    _: QueryPendingQueriesRequest,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryPendingQueriesRequest {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryPendingQueriesRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(_: any): QueryPendingQueriesRequest {
    return {};
  },
  toJSON(_: QueryPendingQueriesRequest): JsonSafe<QueryPendingQueriesRequest> {
    const obj: any = {};
    return obj;
  },
  fromPartial(
    _: Partial<QueryPendingQueriesRequest>,
  ): QueryPendingQueriesRequest {
    const message = createBaseQueryPendingQueriesRequest();
    return message;
  },
  fromProtoMsg(
    message: QueryPendingQueriesRequestProtoMsg,
  ): QueryPendingQueriesRequest {
    return QueryPendingQueriesRequest.decode(message.value);
  },
  toProto(message: QueryPendingQueriesRequest): Uint8Array {
    return QueryPendingQueriesRequest.encode(message).finish();
  },
  toProtoMsg(
    message: QueryPendingQueriesRequest,
  ): QueryPendingQueriesRequestProtoMsg {
    return {
      typeUrl: '/stride.interchainquery.v1.QueryPendingQueriesRequest',
      value: QueryPendingQueriesRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryPendingQueriesResponse(): QueryPendingQueriesResponse {
  return {
    pendingQueries: [],
  };
}
export const QueryPendingQueriesResponse = {
  typeUrl: '/stride.interchainquery.v1.QueryPendingQueriesResponse',
  encode(
    message: QueryPendingQueriesResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    for (const v of message.pendingQueries) {
      Query.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryPendingQueriesResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryPendingQueriesResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.pendingQueries.push(Query.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryPendingQueriesResponse {
    return {
      pendingQueries: Array.isArray(object?.pendingQueries)
        ? object.pendingQueries.map((e: any) => Query.fromJSON(e))
        : [],
    };
  },
  toJSON(
    message: QueryPendingQueriesResponse,
  ): JsonSafe<QueryPendingQueriesResponse> {
    const obj: any = {};
    if (message.pendingQueries) {
      obj.pendingQueries = message.pendingQueries.map(e =>
        e ? Query.toJSON(e) : undefined,
      );
    } else {
      obj.pendingQueries = [];
    }
    return obj;
  },
  fromPartial(
    object: Partial<QueryPendingQueriesResponse>,
  ): QueryPendingQueriesResponse {
    const message = createBaseQueryPendingQueriesResponse();
    message.pendingQueries =
      object.pendingQueries?.map(e => Query.fromPartial(e)) || [];
    return message;
  },
  fromProtoMsg(
    message: QueryPendingQueriesResponseProtoMsg,
  ): QueryPendingQueriesResponse {
    return QueryPendingQueriesResponse.decode(message.value);
  },
  toProto(message: QueryPendingQueriesResponse): Uint8Array {
    return QueryPendingQueriesResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QueryPendingQueriesResponse,
  ): QueryPendingQueriesResponseProtoMsg {
    return {
      typeUrl: '/stride.interchainquery.v1.QueryPendingQueriesResponse',
      value: QueryPendingQueriesResponse.encode(message).finish(),
    };
  },
};
