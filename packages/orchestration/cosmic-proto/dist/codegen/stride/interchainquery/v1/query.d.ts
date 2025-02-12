import { Query, type QuerySDKType } from './genesis.js';
import { BinaryReader, BinaryWriter } from '../../../binary.js';
import { type JsonSafe } from '../../../json-safe.js';
export interface QueryPendingQueriesRequest {
}
export interface QueryPendingQueriesRequestProtoMsg {
    typeUrl: '/stride.interchainquery.v1.QueryPendingQueriesRequest';
    value: Uint8Array;
}
export interface QueryPendingQueriesRequestSDKType {
}
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
export declare const QueryPendingQueriesRequest: {
    typeUrl: string;
    encode(_: QueryPendingQueriesRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryPendingQueriesRequest;
    fromJSON(_: any): QueryPendingQueriesRequest;
    toJSON(_: QueryPendingQueriesRequest): JsonSafe<QueryPendingQueriesRequest>;
    fromPartial(_: Partial<QueryPendingQueriesRequest>): QueryPendingQueriesRequest;
    fromProtoMsg(message: QueryPendingQueriesRequestProtoMsg): QueryPendingQueriesRequest;
    toProto(message: QueryPendingQueriesRequest): Uint8Array;
    toProtoMsg(message: QueryPendingQueriesRequest): QueryPendingQueriesRequestProtoMsg;
};
export declare const QueryPendingQueriesResponse: {
    typeUrl: string;
    encode(message: QueryPendingQueriesResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryPendingQueriesResponse;
    fromJSON(object: any): QueryPendingQueriesResponse;
    toJSON(message: QueryPendingQueriesResponse): JsonSafe<QueryPendingQueriesResponse>;
    fromPartial(object: Partial<QueryPendingQueriesResponse>): QueryPendingQueriesResponse;
    fromProtoMsg(message: QueryPendingQueriesResponseProtoMsg): QueryPendingQueriesResponse;
    toProto(message: QueryPendingQueriesResponse): Uint8Array;
    toProtoMsg(message: QueryPendingQueriesResponse): QueryPendingQueriesResponseProtoMsg;
};
