import { PageRequest, type PageRequestSDKType, PageResponse, type PageResponseSDKType } from '../../base/query/v1beta1/pagination.js';
import { Grant, type GrantSDKType } from './feegrant.js';
import { BinaryReader, BinaryWriter } from '../../../binary.js';
import { type JsonSafe } from '../../../json-safe.js';
/** QueryAllowanceRequest is the request type for the Query/Allowance RPC method. */
export interface QueryAllowanceRequest {
    /** granter is the address of the user granting an allowance of their funds. */
    granter: string;
    /** grantee is the address of the user being granted an allowance of another user's funds. */
    grantee: string;
}
export interface QueryAllowanceRequestProtoMsg {
    typeUrl: '/cosmos.feegrant.v1beta1.QueryAllowanceRequest';
    value: Uint8Array;
}
/** QueryAllowanceRequest is the request type for the Query/Allowance RPC method. */
export interface QueryAllowanceRequestSDKType {
    granter: string;
    grantee: string;
}
/** QueryAllowanceResponse is the response type for the Query/Allowance RPC method. */
export interface QueryAllowanceResponse {
    /** allowance is a allowance granted for grantee by granter. */
    allowance?: Grant;
}
export interface QueryAllowanceResponseProtoMsg {
    typeUrl: '/cosmos.feegrant.v1beta1.QueryAllowanceResponse';
    value: Uint8Array;
}
/** QueryAllowanceResponse is the response type for the Query/Allowance RPC method. */
export interface QueryAllowanceResponseSDKType {
    allowance?: GrantSDKType;
}
/** QueryAllowancesRequest is the request type for the Query/Allowances RPC method. */
export interface QueryAllowancesRequest {
    grantee: string;
    /** pagination defines an pagination for the request. */
    pagination?: PageRequest;
}
export interface QueryAllowancesRequestProtoMsg {
    typeUrl: '/cosmos.feegrant.v1beta1.QueryAllowancesRequest';
    value: Uint8Array;
}
/** QueryAllowancesRequest is the request type for the Query/Allowances RPC method. */
export interface QueryAllowancesRequestSDKType {
    grantee: string;
    pagination?: PageRequestSDKType;
}
/** QueryAllowancesResponse is the response type for the Query/Allowances RPC method. */
export interface QueryAllowancesResponse {
    /** allowances are allowance's granted for grantee by granter. */
    allowances: Grant[];
    /** pagination defines an pagination for the response. */
    pagination?: PageResponse;
}
export interface QueryAllowancesResponseProtoMsg {
    typeUrl: '/cosmos.feegrant.v1beta1.QueryAllowancesResponse';
    value: Uint8Array;
}
/** QueryAllowancesResponse is the response type for the Query/Allowances RPC method. */
export interface QueryAllowancesResponseSDKType {
    allowances: GrantSDKType[];
    pagination?: PageResponseSDKType;
}
/**
 * QueryAllowancesByGranterRequest is the request type for the Query/AllowancesByGranter RPC method.
 *
 * Since: cosmos-sdk 0.46
 */
export interface QueryAllowancesByGranterRequest {
    granter: string;
    /** pagination defines an pagination for the request. */
    pagination?: PageRequest;
}
export interface QueryAllowancesByGranterRequestProtoMsg {
    typeUrl: '/cosmos.feegrant.v1beta1.QueryAllowancesByGranterRequest';
    value: Uint8Array;
}
/**
 * QueryAllowancesByGranterRequest is the request type for the Query/AllowancesByGranter RPC method.
 *
 * Since: cosmos-sdk 0.46
 */
export interface QueryAllowancesByGranterRequestSDKType {
    granter: string;
    pagination?: PageRequestSDKType;
}
/**
 * QueryAllowancesByGranterResponse is the response type for the Query/AllowancesByGranter RPC method.
 *
 * Since: cosmos-sdk 0.46
 */
export interface QueryAllowancesByGranterResponse {
    /** allowances that have been issued by the granter. */
    allowances: Grant[];
    /** pagination defines an pagination for the response. */
    pagination?: PageResponse;
}
export interface QueryAllowancesByGranterResponseProtoMsg {
    typeUrl: '/cosmos.feegrant.v1beta1.QueryAllowancesByGranterResponse';
    value: Uint8Array;
}
/**
 * QueryAllowancesByGranterResponse is the response type for the Query/AllowancesByGranter RPC method.
 *
 * Since: cosmos-sdk 0.46
 */
export interface QueryAllowancesByGranterResponseSDKType {
    allowances: GrantSDKType[];
    pagination?: PageResponseSDKType;
}
export declare const QueryAllowanceRequest: {
    typeUrl: string;
    encode(message: QueryAllowanceRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryAllowanceRequest;
    fromJSON(object: any): QueryAllowanceRequest;
    toJSON(message: QueryAllowanceRequest): JsonSafe<QueryAllowanceRequest>;
    fromPartial(object: Partial<QueryAllowanceRequest>): QueryAllowanceRequest;
    fromProtoMsg(message: QueryAllowanceRequestProtoMsg): QueryAllowanceRequest;
    toProto(message: QueryAllowanceRequest): Uint8Array;
    toProtoMsg(message: QueryAllowanceRequest): QueryAllowanceRequestProtoMsg;
};
export declare const QueryAllowanceResponse: {
    typeUrl: string;
    encode(message: QueryAllowanceResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryAllowanceResponse;
    fromJSON(object: any): QueryAllowanceResponse;
    toJSON(message: QueryAllowanceResponse): JsonSafe<QueryAllowanceResponse>;
    fromPartial(object: Partial<QueryAllowanceResponse>): QueryAllowanceResponse;
    fromProtoMsg(message: QueryAllowanceResponseProtoMsg): QueryAllowanceResponse;
    toProto(message: QueryAllowanceResponse): Uint8Array;
    toProtoMsg(message: QueryAllowanceResponse): QueryAllowanceResponseProtoMsg;
};
export declare const QueryAllowancesRequest: {
    typeUrl: string;
    encode(message: QueryAllowancesRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryAllowancesRequest;
    fromJSON(object: any): QueryAllowancesRequest;
    toJSON(message: QueryAllowancesRequest): JsonSafe<QueryAllowancesRequest>;
    fromPartial(object: Partial<QueryAllowancesRequest>): QueryAllowancesRequest;
    fromProtoMsg(message: QueryAllowancesRequestProtoMsg): QueryAllowancesRequest;
    toProto(message: QueryAllowancesRequest): Uint8Array;
    toProtoMsg(message: QueryAllowancesRequest): QueryAllowancesRequestProtoMsg;
};
export declare const QueryAllowancesResponse: {
    typeUrl: string;
    encode(message: QueryAllowancesResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryAllowancesResponse;
    fromJSON(object: any): QueryAllowancesResponse;
    toJSON(message: QueryAllowancesResponse): JsonSafe<QueryAllowancesResponse>;
    fromPartial(object: Partial<QueryAllowancesResponse>): QueryAllowancesResponse;
    fromProtoMsg(message: QueryAllowancesResponseProtoMsg): QueryAllowancesResponse;
    toProto(message: QueryAllowancesResponse): Uint8Array;
    toProtoMsg(message: QueryAllowancesResponse): QueryAllowancesResponseProtoMsg;
};
export declare const QueryAllowancesByGranterRequest: {
    typeUrl: string;
    encode(message: QueryAllowancesByGranterRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryAllowancesByGranterRequest;
    fromJSON(object: any): QueryAllowancesByGranterRequest;
    toJSON(message: QueryAllowancesByGranterRequest): JsonSafe<QueryAllowancesByGranterRequest>;
    fromPartial(object: Partial<QueryAllowancesByGranterRequest>): QueryAllowancesByGranterRequest;
    fromProtoMsg(message: QueryAllowancesByGranterRequestProtoMsg): QueryAllowancesByGranterRequest;
    toProto(message: QueryAllowancesByGranterRequest): Uint8Array;
    toProtoMsg(message: QueryAllowancesByGranterRequest): QueryAllowancesByGranterRequestProtoMsg;
};
export declare const QueryAllowancesByGranterResponse: {
    typeUrl: string;
    encode(message: QueryAllowancesByGranterResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryAllowancesByGranterResponse;
    fromJSON(object: any): QueryAllowancesByGranterResponse;
    toJSON(message: QueryAllowancesByGranterResponse): JsonSafe<QueryAllowancesByGranterResponse>;
    fromPartial(object: Partial<QueryAllowancesByGranterResponse>): QueryAllowancesByGranterResponse;
    fromProtoMsg(message: QueryAllowancesByGranterResponseProtoMsg): QueryAllowancesByGranterResponse;
    toProto(message: QueryAllowancesByGranterResponse): Uint8Array;
    toProtoMsg(message: QueryAllowancesByGranterResponse): QueryAllowancesByGranterResponseProtoMsg;
};
