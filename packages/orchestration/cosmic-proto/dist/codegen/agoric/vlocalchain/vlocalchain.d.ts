import { Any, type AnySDKType } from '../../google/protobuf/any.js';
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { type JsonSafe } from '../../json-safe.js';
/**
 * CosmosTx contains a list of sdk.Msg's. It should be used when sending
 * transactions to a local chain.
 */
export interface CosmosTx {
    messages: Any[];
}
export interface CosmosTxProtoMsg {
    typeUrl: '/agoric.vlocalchain.CosmosTx';
    value: Uint8Array;
}
/**
 * CosmosTx contains a list of sdk.Msg's. It should be used when sending
 * transactions to a local chain.
 */
export interface CosmosTxSDKType {
    messages: AnySDKType[];
}
/** QueryRequest is used internally to describe a query for the local chain. */
export interface QueryRequest {
    fullMethod: string;
    request?: Any;
    replyType: string;
}
export interface QueryRequestProtoMsg {
    typeUrl: '/agoric.vlocalchain.QueryRequest';
    value: Uint8Array;
}
/** QueryRequest is used internally to describe a query for the local chain. */
export interface QueryRequestSDKType {
    full_method: string;
    request?: AnySDKType;
    reply_type: string;
}
/** QueryResponse is used internally to describe a response from the local chain. */
export interface QueryResponse {
    height: bigint;
    reply?: Any;
    error: string;
}
export interface QueryResponseProtoMsg {
    typeUrl: '/agoric.vlocalchain.QueryResponse';
    value: Uint8Array;
}
/** QueryResponse is used internally to describe a response from the local chain. */
export interface QueryResponseSDKType {
    height: bigint;
    reply?: AnySDKType;
    error: string;
}
/** QueryResponses is used to group multiple QueryResponse messages. */
export interface QueryResponses {
    responses: QueryResponse[];
}
export interface QueryResponsesProtoMsg {
    typeUrl: '/agoric.vlocalchain.QueryResponses';
    value: Uint8Array;
}
/** QueryResponses is used to group multiple QueryResponse messages. */
export interface QueryResponsesSDKType {
    responses: QueryResponseSDKType[];
}
export declare const CosmosTx: {
    typeUrl: string;
    encode(message: CosmosTx, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): CosmosTx;
    fromJSON(object: any): CosmosTx;
    toJSON(message: CosmosTx): JsonSafe<CosmosTx>;
    fromPartial(object: Partial<CosmosTx>): CosmosTx;
    fromProtoMsg(message: CosmosTxProtoMsg): CosmosTx;
    toProto(message: CosmosTx): Uint8Array;
    toProtoMsg(message: CosmosTx): CosmosTxProtoMsg;
};
export declare const QueryRequest: {
    typeUrl: string;
    encode(message: QueryRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryRequest;
    fromJSON(object: any): QueryRequest;
    toJSON(message: QueryRequest): JsonSafe<QueryRequest>;
    fromPartial(object: Partial<QueryRequest>): QueryRequest;
    fromProtoMsg(message: QueryRequestProtoMsg): QueryRequest;
    toProto(message: QueryRequest): Uint8Array;
    toProtoMsg(message: QueryRequest): QueryRequestProtoMsg;
};
export declare const QueryResponse: {
    typeUrl: string;
    encode(message: QueryResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryResponse;
    fromJSON(object: any): QueryResponse;
    toJSON(message: QueryResponse): JsonSafe<QueryResponse>;
    fromPartial(object: Partial<QueryResponse>): QueryResponse;
    fromProtoMsg(message: QueryResponseProtoMsg): QueryResponse;
    toProto(message: QueryResponse): Uint8Array;
    toProtoMsg(message: QueryResponse): QueryResponseProtoMsg;
};
export declare const QueryResponses: {
    typeUrl: string;
    encode(message: QueryResponses, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryResponses;
    fromJSON(object: any): QueryResponses;
    toJSON(message: QueryResponses): JsonSafe<QueryResponses>;
    fromPartial(object: Partial<QueryResponses>): QueryResponses;
    fromProtoMsg(message: QueryResponsesProtoMsg): QueryResponses;
    toProto(message: QueryResponses): Uint8Array;
    toProtoMsg(message: QueryResponses): QueryResponsesProtoMsg;
};
