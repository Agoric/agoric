import { Params, type ParamsSDKType } from './mint.js';
import { BinaryReader, BinaryWriter } from '../../../binary.js';
import { type JsonSafe } from '../../../json-safe.js';
/** QueryParamsRequest is the request type for the Query/Params RPC method. */
export interface QueryParamsRequest {
}
export interface QueryParamsRequestProtoMsg {
    typeUrl: '/stride.mint.v1beta1.QueryParamsRequest';
    value: Uint8Array;
}
/** QueryParamsRequest is the request type for the Query/Params RPC method. */
export interface QueryParamsRequestSDKType {
}
/** QueryParamsResponse is the response type for the Query/Params RPC method. */
export interface QueryParamsResponse {
    /** params defines the parameters of the module. */
    params: Params;
}
export interface QueryParamsResponseProtoMsg {
    typeUrl: '/stride.mint.v1beta1.QueryParamsResponse';
    value: Uint8Array;
}
/** QueryParamsResponse is the response type for the Query/Params RPC method. */
export interface QueryParamsResponseSDKType {
    params: ParamsSDKType;
}
/**
 * QueryEpochProvisionsRequest is the request type for the
 * Query/EpochProvisions RPC method.
 */
export interface QueryEpochProvisionsRequest {
}
export interface QueryEpochProvisionsRequestProtoMsg {
    typeUrl: '/stride.mint.v1beta1.QueryEpochProvisionsRequest';
    value: Uint8Array;
}
/**
 * QueryEpochProvisionsRequest is the request type for the
 * Query/EpochProvisions RPC method.
 */
export interface QueryEpochProvisionsRequestSDKType {
}
/**
 * QueryEpochProvisionsResponse is the response type for the
 * Query/EpochProvisions RPC method.
 */
export interface QueryEpochProvisionsResponse {
    /** epoch_provisions is the current minting per epoch provisions value. */
    epochProvisions: Uint8Array;
}
export interface QueryEpochProvisionsResponseProtoMsg {
    typeUrl: '/stride.mint.v1beta1.QueryEpochProvisionsResponse';
    value: Uint8Array;
}
/**
 * QueryEpochProvisionsResponse is the response type for the
 * Query/EpochProvisions RPC method.
 */
export interface QueryEpochProvisionsResponseSDKType {
    epoch_provisions: Uint8Array;
}
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
export declare const QueryEpochProvisionsRequest: {
    typeUrl: string;
    encode(_: QueryEpochProvisionsRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryEpochProvisionsRequest;
    fromJSON(_: any): QueryEpochProvisionsRequest;
    toJSON(_: QueryEpochProvisionsRequest): JsonSafe<QueryEpochProvisionsRequest>;
    fromPartial(_: Partial<QueryEpochProvisionsRequest>): QueryEpochProvisionsRequest;
    fromProtoMsg(message: QueryEpochProvisionsRequestProtoMsg): QueryEpochProvisionsRequest;
    toProto(message: QueryEpochProvisionsRequest): Uint8Array;
    toProtoMsg(message: QueryEpochProvisionsRequest): QueryEpochProvisionsRequestProtoMsg;
};
export declare const QueryEpochProvisionsResponse: {
    typeUrl: string;
    encode(message: QueryEpochProvisionsResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryEpochProvisionsResponse;
    fromJSON(object: any): QueryEpochProvisionsResponse;
    toJSON(message: QueryEpochProvisionsResponse): JsonSafe<QueryEpochProvisionsResponse>;
    fromPartial(object: Partial<QueryEpochProvisionsResponse>): QueryEpochProvisionsResponse;
    fromProtoMsg(message: QueryEpochProvisionsResponseProtoMsg): QueryEpochProvisionsResponse;
    toProto(message: QueryEpochProvisionsResponse): Uint8Array;
    toProtoMsg(message: QueryEpochProvisionsResponse): QueryEpochProvisionsResponseProtoMsg;
};
