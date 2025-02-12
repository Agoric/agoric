import { Params, type ParamsSDKType, State, type StateSDKType } from './vbank.js';
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { type JsonSafe } from '../../json-safe.js';
/** QueryParamsRequest is the request type for the Query/Params RPC method. */
export interface QueryParamsRequest {
}
export interface QueryParamsRequestProtoMsg {
    typeUrl: '/agoric.vbank.QueryParamsRequest';
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
    typeUrl: '/agoric.vbank.QueryParamsResponse';
    value: Uint8Array;
}
/** QueryParamsResponse is the response type for the Query/Params RPC method. */
export interface QueryParamsResponseSDKType {
    params: ParamsSDKType;
}
/** QueryStateRequest is the request type for the Query/State RPC method. */
export interface QueryStateRequest {
}
export interface QueryStateRequestProtoMsg {
    typeUrl: '/agoric.vbank.QueryStateRequest';
    value: Uint8Array;
}
/** QueryStateRequest is the request type for the Query/State RPC method. */
export interface QueryStateRequestSDKType {
}
/** QueryStateResponse is the response type for the Query/State RPC method. */
export interface QueryStateResponse {
    /** state defines the parameters of the module. */
    state: State;
}
export interface QueryStateResponseProtoMsg {
    typeUrl: '/agoric.vbank.QueryStateResponse';
    value: Uint8Array;
}
/** QueryStateResponse is the response type for the Query/State RPC method. */
export interface QueryStateResponseSDKType {
    state: StateSDKType;
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
export declare const QueryStateRequest: {
    typeUrl: string;
    encode(_: QueryStateRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryStateRequest;
    fromJSON(_: any): QueryStateRequest;
    toJSON(_: QueryStateRequest): JsonSafe<QueryStateRequest>;
    fromPartial(_: Partial<QueryStateRequest>): QueryStateRequest;
    fromProtoMsg(message: QueryStateRequestProtoMsg): QueryStateRequest;
    toProto(message: QueryStateRequest): Uint8Array;
    toProtoMsg(message: QueryStateRequest): QueryStateRequestProtoMsg;
};
export declare const QueryStateResponse: {
    typeUrl: string;
    encode(message: QueryStateResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryStateResponse;
    fromJSON(object: any): QueryStateResponse;
    toJSON(message: QueryStateResponse): JsonSafe<QueryStateResponse>;
    fromPartial(object: Partial<QueryStateResponse>): QueryStateResponse;
    fromProtoMsg(message: QueryStateResponseProtoMsg): QueryStateResponse;
    toProto(message: QueryStateResponse): Uint8Array;
    toProtoMsg(message: QueryStateResponse): QueryStateResponseProtoMsg;
};
