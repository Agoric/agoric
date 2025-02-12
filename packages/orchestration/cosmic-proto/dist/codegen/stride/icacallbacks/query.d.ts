import { PageRequest, type PageRequestSDKType, PageResponse, type PageResponseSDKType } from '../../cosmos/base/query/v1beta1/pagination.js';
import { Params, type ParamsSDKType } from './params.js';
import { CallbackData, type CallbackDataSDKType } from './callback_data.js';
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { type JsonSafe } from '../../json-safe.js';
/** QueryParamsRequest is request type for the Query/Params RPC method. */
export interface QueryParamsRequest {
}
export interface QueryParamsRequestProtoMsg {
    typeUrl: '/stride.icacallbacks.QueryParamsRequest';
    value: Uint8Array;
}
/** QueryParamsRequest is request type for the Query/Params RPC method. */
export interface QueryParamsRequestSDKType {
}
/** QueryParamsResponse is response type for the Query/Params RPC method. */
export interface QueryParamsResponse {
    /** params holds all the parameters of this module. */
    params: Params;
}
export interface QueryParamsResponseProtoMsg {
    typeUrl: '/stride.icacallbacks.QueryParamsResponse';
    value: Uint8Array;
}
/** QueryParamsResponse is response type for the Query/Params RPC method. */
export interface QueryParamsResponseSDKType {
    params: ParamsSDKType;
}
export interface QueryGetCallbackDataRequest {
    callbackKey: string;
}
export interface QueryGetCallbackDataRequestProtoMsg {
    typeUrl: '/stride.icacallbacks.QueryGetCallbackDataRequest';
    value: Uint8Array;
}
export interface QueryGetCallbackDataRequestSDKType {
    callback_key: string;
}
export interface QueryGetCallbackDataResponse {
    callbackData: CallbackData;
}
export interface QueryGetCallbackDataResponseProtoMsg {
    typeUrl: '/stride.icacallbacks.QueryGetCallbackDataResponse';
    value: Uint8Array;
}
export interface QueryGetCallbackDataResponseSDKType {
    callback_data: CallbackDataSDKType;
}
export interface QueryAllCallbackDataRequest {
    pagination?: PageRequest;
}
export interface QueryAllCallbackDataRequestProtoMsg {
    typeUrl: '/stride.icacallbacks.QueryAllCallbackDataRequest';
    value: Uint8Array;
}
export interface QueryAllCallbackDataRequestSDKType {
    pagination?: PageRequestSDKType;
}
export interface QueryAllCallbackDataResponse {
    callbackData: CallbackData[];
    pagination?: PageResponse;
}
export interface QueryAllCallbackDataResponseProtoMsg {
    typeUrl: '/stride.icacallbacks.QueryAllCallbackDataResponse';
    value: Uint8Array;
}
export interface QueryAllCallbackDataResponseSDKType {
    callback_data: CallbackDataSDKType[];
    pagination?: PageResponseSDKType;
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
export declare const QueryGetCallbackDataRequest: {
    typeUrl: string;
    encode(message: QueryGetCallbackDataRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryGetCallbackDataRequest;
    fromJSON(object: any): QueryGetCallbackDataRequest;
    toJSON(message: QueryGetCallbackDataRequest): JsonSafe<QueryGetCallbackDataRequest>;
    fromPartial(object: Partial<QueryGetCallbackDataRequest>): QueryGetCallbackDataRequest;
    fromProtoMsg(message: QueryGetCallbackDataRequestProtoMsg): QueryGetCallbackDataRequest;
    toProto(message: QueryGetCallbackDataRequest): Uint8Array;
    toProtoMsg(message: QueryGetCallbackDataRequest): QueryGetCallbackDataRequestProtoMsg;
};
export declare const QueryGetCallbackDataResponse: {
    typeUrl: string;
    encode(message: QueryGetCallbackDataResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryGetCallbackDataResponse;
    fromJSON(object: any): QueryGetCallbackDataResponse;
    toJSON(message: QueryGetCallbackDataResponse): JsonSafe<QueryGetCallbackDataResponse>;
    fromPartial(object: Partial<QueryGetCallbackDataResponse>): QueryGetCallbackDataResponse;
    fromProtoMsg(message: QueryGetCallbackDataResponseProtoMsg): QueryGetCallbackDataResponse;
    toProto(message: QueryGetCallbackDataResponse): Uint8Array;
    toProtoMsg(message: QueryGetCallbackDataResponse): QueryGetCallbackDataResponseProtoMsg;
};
export declare const QueryAllCallbackDataRequest: {
    typeUrl: string;
    encode(message: QueryAllCallbackDataRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryAllCallbackDataRequest;
    fromJSON(object: any): QueryAllCallbackDataRequest;
    toJSON(message: QueryAllCallbackDataRequest): JsonSafe<QueryAllCallbackDataRequest>;
    fromPartial(object: Partial<QueryAllCallbackDataRequest>): QueryAllCallbackDataRequest;
    fromProtoMsg(message: QueryAllCallbackDataRequestProtoMsg): QueryAllCallbackDataRequest;
    toProto(message: QueryAllCallbackDataRequest): Uint8Array;
    toProtoMsg(message: QueryAllCallbackDataRequest): QueryAllCallbackDataRequestProtoMsg;
};
export declare const QueryAllCallbackDataResponse: {
    typeUrl: string;
    encode(message: QueryAllCallbackDataResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryAllCallbackDataResponse;
    fromJSON(object: any): QueryAllCallbackDataResponse;
    toJSON(message: QueryAllCallbackDataResponse): JsonSafe<QueryAllCallbackDataResponse>;
    fromPartial(object: Partial<QueryAllCallbackDataResponse>): QueryAllCallbackDataResponse;
    fromProtoMsg(message: QueryAllCallbackDataResponseProtoMsg): QueryAllCallbackDataResponse;
    toProto(message: QueryAllCallbackDataResponse): Uint8Array;
    toProtoMsg(message: QueryAllCallbackDataResponse): QueryAllCallbackDataResponseProtoMsg;
};
