import { PageRequest, type PageRequestSDKType, PageResponse, type PageResponseSDKType } from '../../../../cosmos/base/query/v1beta1/pagination.js';
import { DenomTrace, type DenomTraceSDKType, Params, type ParamsSDKType } from './transfer.js';
import { BinaryReader, BinaryWriter } from '../../../../binary.js';
import { type JsonSafe } from '../../../../json-safe.js';
/**
 * QueryDenomTraceRequest is the request type for the Query/DenomTrace RPC
 * method
 */
export interface QueryDenomTraceRequest {
    /** hash (in hex format) or denom (full denom with ibc prefix) of the denomination trace information. */
    hash: string;
}
export interface QueryDenomTraceRequestProtoMsg {
    typeUrl: '/ibc.applications.transfer.v1.QueryDenomTraceRequest';
    value: Uint8Array;
}
/**
 * QueryDenomTraceRequest is the request type for the Query/DenomTrace RPC
 * method
 */
export interface QueryDenomTraceRequestSDKType {
    hash: string;
}
/**
 * QueryDenomTraceResponse is the response type for the Query/DenomTrace RPC
 * method.
 */
export interface QueryDenomTraceResponse {
    /** denom_trace returns the requested denomination trace information. */
    denomTrace?: DenomTrace;
}
export interface QueryDenomTraceResponseProtoMsg {
    typeUrl: '/ibc.applications.transfer.v1.QueryDenomTraceResponse';
    value: Uint8Array;
}
/**
 * QueryDenomTraceResponse is the response type for the Query/DenomTrace RPC
 * method.
 */
export interface QueryDenomTraceResponseSDKType {
    denom_trace?: DenomTraceSDKType;
}
/**
 * QueryConnectionsRequest is the request type for the Query/DenomTraces RPC
 * method
 */
export interface QueryDenomTracesRequest {
    /** pagination defines an optional pagination for the request. */
    pagination?: PageRequest;
}
export interface QueryDenomTracesRequestProtoMsg {
    typeUrl: '/ibc.applications.transfer.v1.QueryDenomTracesRequest';
    value: Uint8Array;
}
/**
 * QueryConnectionsRequest is the request type for the Query/DenomTraces RPC
 * method
 */
export interface QueryDenomTracesRequestSDKType {
    pagination?: PageRequestSDKType;
}
/**
 * QueryConnectionsResponse is the response type for the Query/DenomTraces RPC
 * method.
 */
export interface QueryDenomTracesResponse {
    /** denom_traces returns all denominations trace information. */
    denomTraces: DenomTrace[];
    /** pagination defines the pagination in the response. */
    pagination?: PageResponse;
}
export interface QueryDenomTracesResponseProtoMsg {
    typeUrl: '/ibc.applications.transfer.v1.QueryDenomTracesResponse';
    value: Uint8Array;
}
/**
 * QueryConnectionsResponse is the response type for the Query/DenomTraces RPC
 * method.
 */
export interface QueryDenomTracesResponseSDKType {
    denom_traces: DenomTraceSDKType[];
    pagination?: PageResponseSDKType;
}
/** QueryParamsRequest is the request type for the Query/Params RPC method. */
export interface QueryParamsRequest {
}
export interface QueryParamsRequestProtoMsg {
    typeUrl: '/ibc.applications.transfer.v1.QueryParamsRequest';
    value: Uint8Array;
}
/** QueryParamsRequest is the request type for the Query/Params RPC method. */
export interface QueryParamsRequestSDKType {
}
/** QueryParamsResponse is the response type for the Query/Params RPC method. */
export interface QueryParamsResponse {
    /** params defines the parameters of the module. */
    params?: Params;
}
export interface QueryParamsResponseProtoMsg {
    typeUrl: '/ibc.applications.transfer.v1.QueryParamsResponse';
    value: Uint8Array;
}
/** QueryParamsResponse is the response type for the Query/Params RPC method. */
export interface QueryParamsResponseSDKType {
    params?: ParamsSDKType;
}
/**
 * QueryDenomHashRequest is the request type for the Query/DenomHash RPC
 * method
 */
export interface QueryDenomHashRequest {
    /** The denomination trace ([port_id]/[channel_id])+/[denom] */
    trace: string;
}
export interface QueryDenomHashRequestProtoMsg {
    typeUrl: '/ibc.applications.transfer.v1.QueryDenomHashRequest';
    value: Uint8Array;
}
/**
 * QueryDenomHashRequest is the request type for the Query/DenomHash RPC
 * method
 */
export interface QueryDenomHashRequestSDKType {
    trace: string;
}
/**
 * QueryDenomHashResponse is the response type for the Query/DenomHash RPC
 * method.
 */
export interface QueryDenomHashResponse {
    /** hash (in hex format) of the denomination trace information. */
    hash: string;
}
export interface QueryDenomHashResponseProtoMsg {
    typeUrl: '/ibc.applications.transfer.v1.QueryDenomHashResponse';
    value: Uint8Array;
}
/**
 * QueryDenomHashResponse is the response type for the Query/DenomHash RPC
 * method.
 */
export interface QueryDenomHashResponseSDKType {
    hash: string;
}
/** QueryEscrowAddressRequest is the request type for the EscrowAddress RPC method. */
export interface QueryEscrowAddressRequest {
    /** unique port identifier */
    portId: string;
    /** unique channel identifier */
    channelId: string;
}
export interface QueryEscrowAddressRequestProtoMsg {
    typeUrl: '/ibc.applications.transfer.v1.QueryEscrowAddressRequest';
    value: Uint8Array;
}
/** QueryEscrowAddressRequest is the request type for the EscrowAddress RPC method. */
export interface QueryEscrowAddressRequestSDKType {
    port_id: string;
    channel_id: string;
}
/** QueryEscrowAddressResponse is the response type of the EscrowAddress RPC method. */
export interface QueryEscrowAddressResponse {
    /** the escrow account address */
    escrowAddress: string;
}
export interface QueryEscrowAddressResponseProtoMsg {
    typeUrl: '/ibc.applications.transfer.v1.QueryEscrowAddressResponse';
    value: Uint8Array;
}
/** QueryEscrowAddressResponse is the response type of the EscrowAddress RPC method. */
export interface QueryEscrowAddressResponseSDKType {
    escrow_address: string;
}
export declare const QueryDenomTraceRequest: {
    typeUrl: string;
    encode(message: QueryDenomTraceRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryDenomTraceRequest;
    fromJSON(object: any): QueryDenomTraceRequest;
    toJSON(message: QueryDenomTraceRequest): JsonSafe<QueryDenomTraceRequest>;
    fromPartial(object: Partial<QueryDenomTraceRequest>): QueryDenomTraceRequest;
    fromProtoMsg(message: QueryDenomTraceRequestProtoMsg): QueryDenomTraceRequest;
    toProto(message: QueryDenomTraceRequest): Uint8Array;
    toProtoMsg(message: QueryDenomTraceRequest): QueryDenomTraceRequestProtoMsg;
};
export declare const QueryDenomTraceResponse: {
    typeUrl: string;
    encode(message: QueryDenomTraceResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryDenomTraceResponse;
    fromJSON(object: any): QueryDenomTraceResponse;
    toJSON(message: QueryDenomTraceResponse): JsonSafe<QueryDenomTraceResponse>;
    fromPartial(object: Partial<QueryDenomTraceResponse>): QueryDenomTraceResponse;
    fromProtoMsg(message: QueryDenomTraceResponseProtoMsg): QueryDenomTraceResponse;
    toProto(message: QueryDenomTraceResponse): Uint8Array;
    toProtoMsg(message: QueryDenomTraceResponse): QueryDenomTraceResponseProtoMsg;
};
export declare const QueryDenomTracesRequest: {
    typeUrl: string;
    encode(message: QueryDenomTracesRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryDenomTracesRequest;
    fromJSON(object: any): QueryDenomTracesRequest;
    toJSON(message: QueryDenomTracesRequest): JsonSafe<QueryDenomTracesRequest>;
    fromPartial(object: Partial<QueryDenomTracesRequest>): QueryDenomTracesRequest;
    fromProtoMsg(message: QueryDenomTracesRequestProtoMsg): QueryDenomTracesRequest;
    toProto(message: QueryDenomTracesRequest): Uint8Array;
    toProtoMsg(message: QueryDenomTracesRequest): QueryDenomTracesRequestProtoMsg;
};
export declare const QueryDenomTracesResponse: {
    typeUrl: string;
    encode(message: QueryDenomTracesResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryDenomTracesResponse;
    fromJSON(object: any): QueryDenomTracesResponse;
    toJSON(message: QueryDenomTracesResponse): JsonSafe<QueryDenomTracesResponse>;
    fromPartial(object: Partial<QueryDenomTracesResponse>): QueryDenomTracesResponse;
    fromProtoMsg(message: QueryDenomTracesResponseProtoMsg): QueryDenomTracesResponse;
    toProto(message: QueryDenomTracesResponse): Uint8Array;
    toProtoMsg(message: QueryDenomTracesResponse): QueryDenomTracesResponseProtoMsg;
};
export declare const QueryParamsRequest: {
    typeUrl: string;
    encode(_: QueryParamsRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryParamsRequest;
    fromJSON(_: any): QueryParamsRequest;
    toJSON(_: QueryParamsRequest): JsonSafe<QueryParamsRequest>;
    fromPartial(_: Partial<QueryParamsRequest>): QueryParamsRequest;
    fromProtoMsg(message: QueryParamsRequestProtoMsg): QueryParamsRequest;
    toProto(message: QueryParamsRequest): Uint8Array;
    toProtoMsg(message: QueryParamsRequest): QueryParamsRequestProtoMsg;
};
export declare const QueryParamsResponse: {
    typeUrl: string;
    encode(message: QueryParamsResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryParamsResponse;
    fromJSON(object: any): QueryParamsResponse;
    toJSON(message: QueryParamsResponse): JsonSafe<QueryParamsResponse>;
    fromPartial(object: Partial<QueryParamsResponse>): QueryParamsResponse;
    fromProtoMsg(message: QueryParamsResponseProtoMsg): QueryParamsResponse;
    toProto(message: QueryParamsResponse): Uint8Array;
    toProtoMsg(message: QueryParamsResponse): QueryParamsResponseProtoMsg;
};
export declare const QueryDenomHashRequest: {
    typeUrl: string;
    encode(message: QueryDenomHashRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryDenomHashRequest;
    fromJSON(object: any): QueryDenomHashRequest;
    toJSON(message: QueryDenomHashRequest): JsonSafe<QueryDenomHashRequest>;
    fromPartial(object: Partial<QueryDenomHashRequest>): QueryDenomHashRequest;
    fromProtoMsg(message: QueryDenomHashRequestProtoMsg): QueryDenomHashRequest;
    toProto(message: QueryDenomHashRequest): Uint8Array;
    toProtoMsg(message: QueryDenomHashRequest): QueryDenomHashRequestProtoMsg;
};
export declare const QueryDenomHashResponse: {
    typeUrl: string;
    encode(message: QueryDenomHashResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryDenomHashResponse;
    fromJSON(object: any): QueryDenomHashResponse;
    toJSON(message: QueryDenomHashResponse): JsonSafe<QueryDenomHashResponse>;
    fromPartial(object: Partial<QueryDenomHashResponse>): QueryDenomHashResponse;
    fromProtoMsg(message: QueryDenomHashResponseProtoMsg): QueryDenomHashResponse;
    toProto(message: QueryDenomHashResponse): Uint8Array;
    toProtoMsg(message: QueryDenomHashResponse): QueryDenomHashResponseProtoMsg;
};
export declare const QueryEscrowAddressRequest: {
    typeUrl: string;
    encode(message: QueryEscrowAddressRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryEscrowAddressRequest;
    fromJSON(object: any): QueryEscrowAddressRequest;
    toJSON(message: QueryEscrowAddressRequest): JsonSafe<QueryEscrowAddressRequest>;
    fromPartial(object: Partial<QueryEscrowAddressRequest>): QueryEscrowAddressRequest;
    fromProtoMsg(message: QueryEscrowAddressRequestProtoMsg): QueryEscrowAddressRequest;
    toProto(message: QueryEscrowAddressRequest): Uint8Array;
    toProtoMsg(message: QueryEscrowAddressRequest): QueryEscrowAddressRequestProtoMsg;
};
export declare const QueryEscrowAddressResponse: {
    typeUrl: string;
    encode(message: QueryEscrowAddressResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryEscrowAddressResponse;
    fromJSON(object: any): QueryEscrowAddressResponse;
    toJSON(message: QueryEscrowAddressResponse): JsonSafe<QueryEscrowAddressResponse>;
    fromPartial(object: Partial<QueryEscrowAddressResponse>): QueryEscrowAddressResponse;
    fromProtoMsg(message: QueryEscrowAddressResponseProtoMsg): QueryEscrowAddressResponse;
    toProto(message: QueryEscrowAddressResponse): Uint8Array;
    toProtoMsg(message: QueryEscrowAddressResponse): QueryEscrowAddressResponseProtoMsg;
};
