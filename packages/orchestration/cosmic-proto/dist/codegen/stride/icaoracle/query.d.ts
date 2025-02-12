import { Oracle, type OracleSDKType, Metric, type MetricSDKType } from './icaoracle.js';
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { type JsonSafe } from '../../json-safe.js';
/** Query's a specific oracle */
export interface QueryOracleRequest {
    chainId: string;
}
export interface QueryOracleRequestProtoMsg {
    typeUrl: '/stride.icaoracle.QueryOracleRequest';
    value: Uint8Array;
}
/** Query's a specific oracle */
export interface QueryOracleRequestSDKType {
    chain_id: string;
}
export interface QueryOracleResponse {
    oracle?: Oracle;
}
export interface QueryOracleResponseProtoMsg {
    typeUrl: '/stride.icaoracle.QueryOracleResponse';
    value: Uint8Array;
}
export interface QueryOracleResponseSDKType {
    oracle?: OracleSDKType;
}
/** Query's all oracle's */
export interface QueryAllOraclesRequest {
}
export interface QueryAllOraclesRequestProtoMsg {
    typeUrl: '/stride.icaoracle.QueryAllOraclesRequest';
    value: Uint8Array;
}
/** Query's all oracle's */
export interface QueryAllOraclesRequestSDKType {
}
export interface QueryAllOraclesResponse {
    oracles: Oracle[];
}
export interface QueryAllOraclesResponseProtoMsg {
    typeUrl: '/stride.icaoracle.QueryAllOraclesResponse';
    value: Uint8Array;
}
export interface QueryAllOraclesResponseSDKType {
    oracles: OracleSDKType[];
}
/** Query's all oracle with a filter for whether they're active */
export interface QueryActiveOraclesRequest {
    active: boolean;
}
export interface QueryActiveOraclesRequestProtoMsg {
    typeUrl: '/stride.icaoracle.QueryActiveOraclesRequest';
    value: Uint8Array;
}
/** Query's all oracle with a filter for whether they're active */
export interface QueryActiveOraclesRequestSDKType {
    active: boolean;
}
export interface QueryActiveOraclesResponse {
    oracles: Oracle[];
}
export interface QueryActiveOraclesResponseProtoMsg {
    typeUrl: '/stride.icaoracle.QueryActiveOraclesResponse';
    value: Uint8Array;
}
export interface QueryActiveOraclesResponseSDKType {
    oracles: OracleSDKType[];
}
/** Query's metric's with optional filters */
export interface QueryMetricsRequest {
    metricKey: string;
    oracleChainId: string;
}
export interface QueryMetricsRequestProtoMsg {
    typeUrl: '/stride.icaoracle.QueryMetricsRequest';
    value: Uint8Array;
}
/** Query's metric's with optional filters */
export interface QueryMetricsRequestSDKType {
    metric_key: string;
    oracle_chain_id: string;
}
export interface QueryMetricsResponse {
    metrics: Metric[];
}
export interface QueryMetricsResponseProtoMsg {
    typeUrl: '/stride.icaoracle.QueryMetricsResponse';
    value: Uint8Array;
}
export interface QueryMetricsResponseSDKType {
    metrics: MetricSDKType[];
}
export declare const QueryOracleRequest: {
    typeUrl: string;
    encode(message: QueryOracleRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryOracleRequest;
    fromJSON(object: any): QueryOracleRequest;
    toJSON(message: QueryOracleRequest): JsonSafe<QueryOracleRequest>;
    fromPartial(object: Partial<QueryOracleRequest>): QueryOracleRequest;
    fromProtoMsg(message: QueryOracleRequestProtoMsg): QueryOracleRequest;
    toProto(message: QueryOracleRequest): Uint8Array;
    toProtoMsg(message: QueryOracleRequest): QueryOracleRequestProtoMsg;
};
export declare const QueryOracleResponse: {
    typeUrl: string;
    encode(message: QueryOracleResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryOracleResponse;
    fromJSON(object: any): QueryOracleResponse;
    toJSON(message: QueryOracleResponse): JsonSafe<QueryOracleResponse>;
    fromPartial(object: Partial<QueryOracleResponse>): QueryOracleResponse;
    fromProtoMsg(message: QueryOracleResponseProtoMsg): QueryOracleResponse;
    toProto(message: QueryOracleResponse): Uint8Array;
    toProtoMsg(message: QueryOracleResponse): QueryOracleResponseProtoMsg;
};
export declare const QueryAllOraclesRequest: {
    typeUrl: string;
    encode(_: QueryAllOraclesRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryAllOraclesRequest;
    fromJSON(_: any): QueryAllOraclesRequest;
    toJSON(_: QueryAllOraclesRequest): JsonSafe<QueryAllOraclesRequest>;
    fromPartial(_: Partial<QueryAllOraclesRequest>): QueryAllOraclesRequest;
    fromProtoMsg(message: QueryAllOraclesRequestProtoMsg): QueryAllOraclesRequest;
    toProto(message: QueryAllOraclesRequest): Uint8Array;
    toProtoMsg(message: QueryAllOraclesRequest): QueryAllOraclesRequestProtoMsg;
};
export declare const QueryAllOraclesResponse: {
    typeUrl: string;
    encode(message: QueryAllOraclesResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryAllOraclesResponse;
    fromJSON(object: any): QueryAllOraclesResponse;
    toJSON(message: QueryAllOraclesResponse): JsonSafe<QueryAllOraclesResponse>;
    fromPartial(object: Partial<QueryAllOraclesResponse>): QueryAllOraclesResponse;
    fromProtoMsg(message: QueryAllOraclesResponseProtoMsg): QueryAllOraclesResponse;
    toProto(message: QueryAllOraclesResponse): Uint8Array;
    toProtoMsg(message: QueryAllOraclesResponse): QueryAllOraclesResponseProtoMsg;
};
export declare const QueryActiveOraclesRequest: {
    typeUrl: string;
    encode(message: QueryActiveOraclesRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryActiveOraclesRequest;
    fromJSON(object: any): QueryActiveOraclesRequest;
    toJSON(message: QueryActiveOraclesRequest): JsonSafe<QueryActiveOraclesRequest>;
    fromPartial(object: Partial<QueryActiveOraclesRequest>): QueryActiveOraclesRequest;
    fromProtoMsg(message: QueryActiveOraclesRequestProtoMsg): QueryActiveOraclesRequest;
    toProto(message: QueryActiveOraclesRequest): Uint8Array;
    toProtoMsg(message: QueryActiveOraclesRequest): QueryActiveOraclesRequestProtoMsg;
};
export declare const QueryActiveOraclesResponse: {
    typeUrl: string;
    encode(message: QueryActiveOraclesResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryActiveOraclesResponse;
    fromJSON(object: any): QueryActiveOraclesResponse;
    toJSON(message: QueryActiveOraclesResponse): JsonSafe<QueryActiveOraclesResponse>;
    fromPartial(object: Partial<QueryActiveOraclesResponse>): QueryActiveOraclesResponse;
    fromProtoMsg(message: QueryActiveOraclesResponseProtoMsg): QueryActiveOraclesResponse;
    toProto(message: QueryActiveOraclesResponse): Uint8Array;
    toProtoMsg(message: QueryActiveOraclesResponse): QueryActiveOraclesResponseProtoMsg;
};
export declare const QueryMetricsRequest: {
    typeUrl: string;
    encode(message: QueryMetricsRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryMetricsRequest;
    fromJSON(object: any): QueryMetricsRequest;
    toJSON(message: QueryMetricsRequest): JsonSafe<QueryMetricsRequest>;
    fromPartial(object: Partial<QueryMetricsRequest>): QueryMetricsRequest;
    fromProtoMsg(message: QueryMetricsRequestProtoMsg): QueryMetricsRequest;
    toProto(message: QueryMetricsRequest): Uint8Array;
    toProtoMsg(message: QueryMetricsRequest): QueryMetricsRequestProtoMsg;
};
export declare const QueryMetricsResponse: {
    typeUrl: string;
    encode(message: QueryMetricsResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryMetricsResponse;
    fromJSON(object: any): QueryMetricsResponse;
    toJSON(message: QueryMetricsResponse): JsonSafe<QueryMetricsResponse>;
    fromPartial(object: Partial<QueryMetricsResponse>): QueryMetricsResponse;
    fromProtoMsg(message: QueryMetricsResponseProtoMsg): QueryMetricsResponse;
    toProto(message: QueryMetricsResponse): Uint8Array;
    toProtoMsg(message: QueryMetricsResponse): QueryMetricsResponseProtoMsg;
};
