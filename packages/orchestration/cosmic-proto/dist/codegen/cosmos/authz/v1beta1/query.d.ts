import { PageRequest, type PageRequestSDKType, PageResponse, type PageResponseSDKType } from '../../base/query/v1beta1/pagination.js';
import { Grant, type GrantSDKType, GrantAuthorization, type GrantAuthorizationSDKType } from './authz.js';
import { BinaryReader, BinaryWriter } from '../../../binary.js';
import { type JsonSafe } from '../../../json-safe.js';
/** QueryGrantsRequest is the request type for the Query/Grants RPC method. */
export interface QueryGrantsRequest {
    granter: string;
    grantee: string;
    /** Optional, msg_type_url, when set, will query only grants matching given msg type. */
    msgTypeUrl: string;
    /** pagination defines an pagination for the request. */
    pagination?: PageRequest;
}
export interface QueryGrantsRequestProtoMsg {
    typeUrl: '/cosmos.authz.v1beta1.QueryGrantsRequest';
    value: Uint8Array;
}
/** QueryGrantsRequest is the request type for the Query/Grants RPC method. */
export interface QueryGrantsRequestSDKType {
    granter: string;
    grantee: string;
    msg_type_url: string;
    pagination?: PageRequestSDKType;
}
/** QueryGrantsResponse is the response type for the Query/Authorizations RPC method. */
export interface QueryGrantsResponse {
    /** authorizations is a list of grants granted for grantee by granter. */
    grants: Grant[];
    /** pagination defines an pagination for the response. */
    pagination?: PageResponse;
}
export interface QueryGrantsResponseProtoMsg {
    typeUrl: '/cosmos.authz.v1beta1.QueryGrantsResponse';
    value: Uint8Array;
}
/** QueryGrantsResponse is the response type for the Query/Authorizations RPC method. */
export interface QueryGrantsResponseSDKType {
    grants: GrantSDKType[];
    pagination?: PageResponseSDKType;
}
/** QueryGranterGrantsRequest is the request type for the Query/GranterGrants RPC method. */
export interface QueryGranterGrantsRequest {
    granter: string;
    /** pagination defines an pagination for the request. */
    pagination?: PageRequest;
}
export interface QueryGranterGrantsRequestProtoMsg {
    typeUrl: '/cosmos.authz.v1beta1.QueryGranterGrantsRequest';
    value: Uint8Array;
}
/** QueryGranterGrantsRequest is the request type for the Query/GranterGrants RPC method. */
export interface QueryGranterGrantsRequestSDKType {
    granter: string;
    pagination?: PageRequestSDKType;
}
/** QueryGranterGrantsResponse is the response type for the Query/GranterGrants RPC method. */
export interface QueryGranterGrantsResponse {
    /** grants is a list of grants granted by the granter. */
    grants: GrantAuthorization[];
    /** pagination defines an pagination for the response. */
    pagination?: PageResponse;
}
export interface QueryGranterGrantsResponseProtoMsg {
    typeUrl: '/cosmos.authz.v1beta1.QueryGranterGrantsResponse';
    value: Uint8Array;
}
/** QueryGranterGrantsResponse is the response type for the Query/GranterGrants RPC method. */
export interface QueryGranterGrantsResponseSDKType {
    grants: GrantAuthorizationSDKType[];
    pagination?: PageResponseSDKType;
}
/** QueryGranteeGrantsRequest is the request type for the Query/IssuedGrants RPC method. */
export interface QueryGranteeGrantsRequest {
    grantee: string;
    /** pagination defines an pagination for the request. */
    pagination?: PageRequest;
}
export interface QueryGranteeGrantsRequestProtoMsg {
    typeUrl: '/cosmos.authz.v1beta1.QueryGranteeGrantsRequest';
    value: Uint8Array;
}
/** QueryGranteeGrantsRequest is the request type for the Query/IssuedGrants RPC method. */
export interface QueryGranteeGrantsRequestSDKType {
    grantee: string;
    pagination?: PageRequestSDKType;
}
/** QueryGranteeGrantsResponse is the response type for the Query/GranteeGrants RPC method. */
export interface QueryGranteeGrantsResponse {
    /** grants is a list of grants granted to the grantee. */
    grants: GrantAuthorization[];
    /** pagination defines an pagination for the response. */
    pagination?: PageResponse;
}
export interface QueryGranteeGrantsResponseProtoMsg {
    typeUrl: '/cosmos.authz.v1beta1.QueryGranteeGrantsResponse';
    value: Uint8Array;
}
/** QueryGranteeGrantsResponse is the response type for the Query/GranteeGrants RPC method. */
export interface QueryGranteeGrantsResponseSDKType {
    grants: GrantAuthorizationSDKType[];
    pagination?: PageResponseSDKType;
}
export declare const QueryGrantsRequest: {
    typeUrl: string;
    encode(message: QueryGrantsRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryGrantsRequest;
    fromJSON(object: any): QueryGrantsRequest;
    toJSON(message: QueryGrantsRequest): JsonSafe<QueryGrantsRequest>;
    fromPartial(object: Partial<QueryGrantsRequest>): QueryGrantsRequest;
    fromProtoMsg(message: QueryGrantsRequestProtoMsg): QueryGrantsRequest;
    toProto(message: QueryGrantsRequest): Uint8Array;
    toProtoMsg(message: QueryGrantsRequest): QueryGrantsRequestProtoMsg;
};
export declare const QueryGrantsResponse: {
    typeUrl: string;
    encode(message: QueryGrantsResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryGrantsResponse;
    fromJSON(object: any): QueryGrantsResponse;
    toJSON(message: QueryGrantsResponse): JsonSafe<QueryGrantsResponse>;
    fromPartial(object: Partial<QueryGrantsResponse>): QueryGrantsResponse;
    fromProtoMsg(message: QueryGrantsResponseProtoMsg): QueryGrantsResponse;
    toProto(message: QueryGrantsResponse): Uint8Array;
    toProtoMsg(message: QueryGrantsResponse): QueryGrantsResponseProtoMsg;
};
export declare const QueryGranterGrantsRequest: {
    typeUrl: string;
    encode(message: QueryGranterGrantsRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryGranterGrantsRequest;
    fromJSON(object: any): QueryGranterGrantsRequest;
    toJSON(message: QueryGranterGrantsRequest): JsonSafe<QueryGranterGrantsRequest>;
    fromPartial(object: Partial<QueryGranterGrantsRequest>): QueryGranterGrantsRequest;
    fromProtoMsg(message: QueryGranterGrantsRequestProtoMsg): QueryGranterGrantsRequest;
    toProto(message: QueryGranterGrantsRequest): Uint8Array;
    toProtoMsg(message: QueryGranterGrantsRequest): QueryGranterGrantsRequestProtoMsg;
};
export declare const QueryGranterGrantsResponse: {
    typeUrl: string;
    encode(message: QueryGranterGrantsResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryGranterGrantsResponse;
    fromJSON(object: any): QueryGranterGrantsResponse;
    toJSON(message: QueryGranterGrantsResponse): JsonSafe<QueryGranterGrantsResponse>;
    fromPartial(object: Partial<QueryGranterGrantsResponse>): QueryGranterGrantsResponse;
    fromProtoMsg(message: QueryGranterGrantsResponseProtoMsg): QueryGranterGrantsResponse;
    toProto(message: QueryGranterGrantsResponse): Uint8Array;
    toProtoMsg(message: QueryGranterGrantsResponse): QueryGranterGrantsResponseProtoMsg;
};
export declare const QueryGranteeGrantsRequest: {
    typeUrl: string;
    encode(message: QueryGranteeGrantsRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryGranteeGrantsRequest;
    fromJSON(object: any): QueryGranteeGrantsRequest;
    toJSON(message: QueryGranteeGrantsRequest): JsonSafe<QueryGranteeGrantsRequest>;
    fromPartial(object: Partial<QueryGranteeGrantsRequest>): QueryGranteeGrantsRequest;
    fromProtoMsg(message: QueryGranteeGrantsRequestProtoMsg): QueryGranteeGrantsRequest;
    toProto(message: QueryGranteeGrantsRequest): Uint8Array;
    toProtoMsg(message: QueryGranteeGrantsRequest): QueryGranteeGrantsRequestProtoMsg;
};
export declare const QueryGranteeGrantsResponse: {
    typeUrl: string;
    encode(message: QueryGranteeGrantsResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryGranteeGrantsResponse;
    fromJSON(object: any): QueryGranteeGrantsResponse;
    toJSON(message: QueryGranteeGrantsResponse): JsonSafe<QueryGranteeGrantsResponse>;
    fromPartial(object: Partial<QueryGranteeGrantsResponse>): QueryGranteeGrantsResponse;
    fromProtoMsg(message: QueryGranteeGrantsResponseProtoMsg): QueryGranteeGrantsResponse;
    toProto(message: QueryGranteeGrantsResponse): Uint8Array;
    toProtoMsg(message: QueryGranteeGrantsResponse): QueryGranteeGrantsResponseProtoMsg;
};
