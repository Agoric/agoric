import { ParamChange, type ParamChangeSDKType } from './params.js';
import { BinaryReader, BinaryWriter } from '../../../binary.js';
import { type JsonSafe } from '../../../json-safe.js';
/** QueryParamsRequest is request type for the Query/Params RPC method. */
export interface QueryParamsRequest {
    /** subspace defines the module to query the parameter for. */
    subspace: string;
    /** key defines the key of the parameter in the subspace. */
    key: string;
}
export interface QueryParamsRequestProtoMsg {
    typeUrl: '/cosmos.params.v1beta1.QueryParamsRequest';
    value: Uint8Array;
}
/** QueryParamsRequest is request type for the Query/Params RPC method. */
export interface QueryParamsRequestSDKType {
    subspace: string;
    key: string;
}
/** QueryParamsResponse is response type for the Query/Params RPC method. */
export interface QueryParamsResponse {
    /** param defines the queried parameter. */
    param: ParamChange;
}
export interface QueryParamsResponseProtoMsg {
    typeUrl: '/cosmos.params.v1beta1.QueryParamsResponse';
    value: Uint8Array;
}
/** QueryParamsResponse is response type for the Query/Params RPC method. */
export interface QueryParamsResponseSDKType {
    param: ParamChangeSDKType;
}
/**
 * QuerySubspacesRequest defines a request type for querying for all registered
 * subspaces and all keys for a subspace.
 *
 * Since: cosmos-sdk 0.46
 */
export interface QuerySubspacesRequest {
}
export interface QuerySubspacesRequestProtoMsg {
    typeUrl: '/cosmos.params.v1beta1.QuerySubspacesRequest';
    value: Uint8Array;
}
/**
 * QuerySubspacesRequest defines a request type for querying for all registered
 * subspaces and all keys for a subspace.
 *
 * Since: cosmos-sdk 0.46
 */
export interface QuerySubspacesRequestSDKType {
}
/**
 * QuerySubspacesResponse defines the response types for querying for all
 * registered subspaces and all keys for a subspace.
 *
 * Since: cosmos-sdk 0.46
 */
export interface QuerySubspacesResponse {
    subspaces: Subspace[];
}
export interface QuerySubspacesResponseProtoMsg {
    typeUrl: '/cosmos.params.v1beta1.QuerySubspacesResponse';
    value: Uint8Array;
}
/**
 * QuerySubspacesResponse defines the response types for querying for all
 * registered subspaces and all keys for a subspace.
 *
 * Since: cosmos-sdk 0.46
 */
export interface QuerySubspacesResponseSDKType {
    subspaces: SubspaceSDKType[];
}
/**
 * Subspace defines a parameter subspace name and all the keys that exist for
 * the subspace.
 *
 * Since: cosmos-sdk 0.46
 */
export interface Subspace {
    subspace: string;
    keys: string[];
}
export interface SubspaceProtoMsg {
    typeUrl: '/cosmos.params.v1beta1.Subspace';
    value: Uint8Array;
}
/**
 * Subspace defines a parameter subspace name and all the keys that exist for
 * the subspace.
 *
 * Since: cosmos-sdk 0.46
 */
export interface SubspaceSDKType {
    subspace: string;
    keys: string[];
}
export declare const QueryParamsRequest: {
    typeUrl: string;
    encode(message: QueryParamsRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryParamsRequest;
    fromJSON(object: any): QueryParamsRequest;
    toJSON(message: QueryParamsRequest): JsonSafe<QueryParamsRequest>;
    fromPartial(object: Partial<QueryParamsRequest>): QueryParamsRequest;
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
export declare const QuerySubspacesRequest: {
    typeUrl: string;
    encode(_: QuerySubspacesRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QuerySubspacesRequest;
    fromJSON(_: any): QuerySubspacesRequest;
    toJSON(_: QuerySubspacesRequest): JsonSafe<QuerySubspacesRequest>;
    fromPartial(_: Partial<QuerySubspacesRequest>): QuerySubspacesRequest;
    fromProtoMsg(message: QuerySubspacesRequestProtoMsg): QuerySubspacesRequest;
    toProto(message: QuerySubspacesRequest): Uint8Array;
    toProtoMsg(message: QuerySubspacesRequest): QuerySubspacesRequestProtoMsg;
};
export declare const QuerySubspacesResponse: {
    typeUrl: string;
    encode(message: QuerySubspacesResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QuerySubspacesResponse;
    fromJSON(object: any): QuerySubspacesResponse;
    toJSON(message: QuerySubspacesResponse): JsonSafe<QuerySubspacesResponse>;
    fromPartial(object: Partial<QuerySubspacesResponse>): QuerySubspacesResponse;
    fromProtoMsg(message: QuerySubspacesResponseProtoMsg): QuerySubspacesResponse;
    toProto(message: QuerySubspacesResponse): Uint8Array;
    toProtoMsg(message: QuerySubspacesResponse): QuerySubspacesResponseProtoMsg;
};
export declare const Subspace: {
    typeUrl: string;
    encode(message: Subspace, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): Subspace;
    fromJSON(object: any): Subspace;
    toJSON(message: Subspace): JsonSafe<Subspace>;
    fromPartial(object: Partial<Subspace>): Subspace;
    fromProtoMsg(message: SubspaceProtoMsg): Subspace;
    toProto(message: Subspace): Uint8Array;
    toProtoMsg(message: Subspace): SubspaceProtoMsg;
};
