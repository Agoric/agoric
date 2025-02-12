import { Params, type ParamsSDKType } from './controller.js';
import { BinaryReader, BinaryWriter } from '../../../../../binary.js';
import { type JsonSafe } from '../../../../../json-safe.js';
/** QueryInterchainAccountRequest is the request type for the Query/InterchainAccount RPC method. */
export interface QueryInterchainAccountRequest {
    owner: string;
    connectionId: string;
}
export interface QueryInterchainAccountRequestProtoMsg {
    typeUrl: '/ibc.applications.interchain_accounts.controller.v1.QueryInterchainAccountRequest';
    value: Uint8Array;
}
/** QueryInterchainAccountRequest is the request type for the Query/InterchainAccount RPC method. */
export interface QueryInterchainAccountRequestSDKType {
    owner: string;
    connection_id: string;
}
/** QueryInterchainAccountResponse the response type for the Query/InterchainAccount RPC method. */
export interface QueryInterchainAccountResponse {
    address: string;
}
export interface QueryInterchainAccountResponseProtoMsg {
    typeUrl: '/ibc.applications.interchain_accounts.controller.v1.QueryInterchainAccountResponse';
    value: Uint8Array;
}
/** QueryInterchainAccountResponse the response type for the Query/InterchainAccount RPC method. */
export interface QueryInterchainAccountResponseSDKType {
    address: string;
}
/** QueryParamsRequest is the request type for the Query/Params RPC method. */
export interface QueryParamsRequest {
}
export interface QueryParamsRequestProtoMsg {
    typeUrl: '/ibc.applications.interchain_accounts.controller.v1.QueryParamsRequest';
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
    typeUrl: '/ibc.applications.interchain_accounts.controller.v1.QueryParamsResponse';
    value: Uint8Array;
}
/** QueryParamsResponse is the response type for the Query/Params RPC method. */
export interface QueryParamsResponseSDKType {
    params?: ParamsSDKType;
}
export declare const QueryInterchainAccountRequest: {
    typeUrl: string;
    encode(message: QueryInterchainAccountRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryInterchainAccountRequest;
    fromJSON(object: any): QueryInterchainAccountRequest;
    toJSON(message: QueryInterchainAccountRequest): JsonSafe<QueryInterchainAccountRequest>;
    fromPartial(object: Partial<QueryInterchainAccountRequest>): QueryInterchainAccountRequest;
    fromProtoMsg(message: QueryInterchainAccountRequestProtoMsg): QueryInterchainAccountRequest;
    toProto(message: QueryInterchainAccountRequest): Uint8Array;
    toProtoMsg(message: QueryInterchainAccountRequest): QueryInterchainAccountRequestProtoMsg;
};
export declare const QueryInterchainAccountResponse: {
    typeUrl: string;
    encode(message: QueryInterchainAccountResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryInterchainAccountResponse;
    fromJSON(object: any): QueryInterchainAccountResponse;
    toJSON(message: QueryInterchainAccountResponse): JsonSafe<QueryInterchainAccountResponse>;
    fromPartial(object: Partial<QueryInterchainAccountResponse>): QueryInterchainAccountResponse;
    fromProtoMsg(message: QueryInterchainAccountResponseProtoMsg): QueryInterchainAccountResponse;
    toProto(message: QueryInterchainAccountResponse): Uint8Array;
    toProtoMsg(message: QueryInterchainAccountResponse): QueryInterchainAccountResponseProtoMsg;
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
