import { Params, type ParamsSDKType, Egress, type EgressSDKType } from './swingset.js';
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { type JsonSafe } from '../../json-safe.js';
/** QueryParamsRequest is the request type for the Query/Params RPC method. */
export interface QueryParamsRequest {
}
export interface QueryParamsRequestProtoMsg {
    typeUrl: '/agoric.swingset.QueryParamsRequest';
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
    typeUrl: '/agoric.swingset.QueryParamsResponse';
    value: Uint8Array;
}
/** QueryParamsResponse is the response type for the Query/Params RPC method. */
export interface QueryParamsResponseSDKType {
    params: ParamsSDKType;
}
/** QueryEgressRequest is the request type for the Query/Egress RPC method */
export interface QueryEgressRequest {
    peer: Uint8Array;
}
export interface QueryEgressRequestProtoMsg {
    typeUrl: '/agoric.swingset.QueryEgressRequest';
    value: Uint8Array;
}
/** QueryEgressRequest is the request type for the Query/Egress RPC method */
export interface QueryEgressRequestSDKType {
    peer: Uint8Array;
}
/** QueryEgressResponse is the egress response. */
export interface QueryEgressResponse {
    egress?: Egress;
}
export interface QueryEgressResponseProtoMsg {
    typeUrl: '/agoric.swingset.QueryEgressResponse';
    value: Uint8Array;
}
/** QueryEgressResponse is the egress response. */
export interface QueryEgressResponseSDKType {
    egress?: EgressSDKType;
}
/** QueryMailboxRequest is the mailbox query. */
export interface QueryMailboxRequest {
    peer: Uint8Array;
}
export interface QueryMailboxRequestProtoMsg {
    typeUrl: '/agoric.swingset.QueryMailboxRequest';
    value: Uint8Array;
}
/** QueryMailboxRequest is the mailbox query. */
export interface QueryMailboxRequestSDKType {
    peer: Uint8Array;
}
/** QueryMailboxResponse is the mailbox response. */
export interface QueryMailboxResponse {
    value: string;
}
export interface QueryMailboxResponseProtoMsg {
    typeUrl: '/agoric.swingset.QueryMailboxResponse';
    value: Uint8Array;
}
/** QueryMailboxResponse is the mailbox response. */
export interface QueryMailboxResponseSDKType {
    value: string;
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
export declare const QueryEgressRequest: {
    typeUrl: string;
    encode(message: QueryEgressRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryEgressRequest;
    fromJSON(object: any): QueryEgressRequest;
    toJSON(message: QueryEgressRequest): JsonSafe<QueryEgressRequest>;
    fromPartial(object: Partial<QueryEgressRequest>): QueryEgressRequest;
    fromProtoMsg(message: QueryEgressRequestProtoMsg): QueryEgressRequest;
    toProto(message: QueryEgressRequest): Uint8Array;
    toProtoMsg(message: QueryEgressRequest): QueryEgressRequestProtoMsg;
};
export declare const QueryEgressResponse: {
    typeUrl: string;
    encode(message: QueryEgressResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryEgressResponse;
    fromJSON(object: any): QueryEgressResponse;
    toJSON(message: QueryEgressResponse): JsonSafe<QueryEgressResponse>;
    fromPartial(object: Partial<QueryEgressResponse>): QueryEgressResponse;
    fromProtoMsg(message: QueryEgressResponseProtoMsg): QueryEgressResponse;
    toProto(message: QueryEgressResponse): Uint8Array;
    toProtoMsg(message: QueryEgressResponse): QueryEgressResponseProtoMsg;
};
export declare const QueryMailboxRequest: {
    typeUrl: string;
    encode(message: QueryMailboxRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryMailboxRequest;
    fromJSON(object: any): QueryMailboxRequest;
    toJSON(message: QueryMailboxRequest): JsonSafe<QueryMailboxRequest>;
    fromPartial(object: Partial<QueryMailboxRequest>): QueryMailboxRequest;
    fromProtoMsg(message: QueryMailboxRequestProtoMsg): QueryMailboxRequest;
    toProto(message: QueryMailboxRequest): Uint8Array;
    toProtoMsg(message: QueryMailboxRequest): QueryMailboxRequestProtoMsg;
};
export declare const QueryMailboxResponse: {
    typeUrl: string;
    encode(message: QueryMailboxResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryMailboxResponse;
    fromJSON(object: any): QueryMailboxResponse;
    toJSON(message: QueryMailboxResponse): JsonSafe<QueryMailboxResponse>;
    fromPartial(object: Partial<QueryMailboxResponse>): QueryMailboxResponse;
    fromProtoMsg(message: QueryMailboxResponseProtoMsg): QueryMailboxResponse;
    toProto(message: QueryMailboxResponse): Uint8Array;
    toProtoMsg(message: QueryMailboxResponse): QueryMailboxResponseProtoMsg;
};
