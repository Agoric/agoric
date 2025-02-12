import { PageRequest, type PageRequestSDKType, PageResponse, type PageResponseSDKType } from '../../../../cosmos/base/query/v1beta1/pagination.js';
import { ConnectionEnd, type ConnectionEndSDKType, IdentifiedConnection, type IdentifiedConnectionSDKType } from './connection.js';
import { Height, type HeightSDKType, IdentifiedClientState, type IdentifiedClientStateSDKType, Params, type ParamsSDKType } from '../../client/v1/client.js';
import { Any, type AnySDKType } from '../../../../google/protobuf/any.js';
import { BinaryReader, BinaryWriter } from '../../../../binary.js';
import { type JsonSafe } from '../../../../json-safe.js';
/**
 * QueryConnectionRequest is the request type for the Query/Connection RPC
 * method
 */
export interface QueryConnectionRequest {
    /** connection unique identifier */
    connectionId: string;
}
export interface QueryConnectionRequestProtoMsg {
    typeUrl: '/ibc.core.connection.v1.QueryConnectionRequest';
    value: Uint8Array;
}
/**
 * QueryConnectionRequest is the request type for the Query/Connection RPC
 * method
 */
export interface QueryConnectionRequestSDKType {
    connection_id: string;
}
/**
 * QueryConnectionResponse is the response type for the Query/Connection RPC
 * method. Besides the connection end, it includes a proof and the height from
 * which the proof was retrieved.
 */
export interface QueryConnectionResponse {
    /** connection associated with the request identifier */
    connection?: ConnectionEnd;
    /** merkle proof of existence */
    proof: Uint8Array;
    /** height at which the proof was retrieved */
    proofHeight: Height;
}
export interface QueryConnectionResponseProtoMsg {
    typeUrl: '/ibc.core.connection.v1.QueryConnectionResponse';
    value: Uint8Array;
}
/**
 * QueryConnectionResponse is the response type for the Query/Connection RPC
 * method. Besides the connection end, it includes a proof and the height from
 * which the proof was retrieved.
 */
export interface QueryConnectionResponseSDKType {
    connection?: ConnectionEndSDKType;
    proof: Uint8Array;
    proof_height: HeightSDKType;
}
/**
 * QueryConnectionsRequest is the request type for the Query/Connections RPC
 * method
 */
export interface QueryConnectionsRequest {
    pagination?: PageRequest;
}
export interface QueryConnectionsRequestProtoMsg {
    typeUrl: '/ibc.core.connection.v1.QueryConnectionsRequest';
    value: Uint8Array;
}
/**
 * QueryConnectionsRequest is the request type for the Query/Connections RPC
 * method
 */
export interface QueryConnectionsRequestSDKType {
    pagination?: PageRequestSDKType;
}
/**
 * QueryConnectionsResponse is the response type for the Query/Connections RPC
 * method.
 */
export interface QueryConnectionsResponse {
    /** list of stored connections of the chain. */
    connections: IdentifiedConnection[];
    /** pagination response */
    pagination?: PageResponse;
    /** query block height */
    height: Height;
}
export interface QueryConnectionsResponseProtoMsg {
    typeUrl: '/ibc.core.connection.v1.QueryConnectionsResponse';
    value: Uint8Array;
}
/**
 * QueryConnectionsResponse is the response type for the Query/Connections RPC
 * method.
 */
export interface QueryConnectionsResponseSDKType {
    connections: IdentifiedConnectionSDKType[];
    pagination?: PageResponseSDKType;
    height: HeightSDKType;
}
/**
 * QueryClientConnectionsRequest is the request type for the
 * Query/ClientConnections RPC method
 */
export interface QueryClientConnectionsRequest {
    /** client identifier associated with a connection */
    clientId: string;
}
export interface QueryClientConnectionsRequestProtoMsg {
    typeUrl: '/ibc.core.connection.v1.QueryClientConnectionsRequest';
    value: Uint8Array;
}
/**
 * QueryClientConnectionsRequest is the request type for the
 * Query/ClientConnections RPC method
 */
export interface QueryClientConnectionsRequestSDKType {
    client_id: string;
}
/**
 * QueryClientConnectionsResponse is the response type for the
 * Query/ClientConnections RPC method
 */
export interface QueryClientConnectionsResponse {
    /** slice of all the connection paths associated with a client. */
    connectionPaths: string[];
    /** merkle proof of existence */
    proof: Uint8Array;
    /** height at which the proof was generated */
    proofHeight: Height;
}
export interface QueryClientConnectionsResponseProtoMsg {
    typeUrl: '/ibc.core.connection.v1.QueryClientConnectionsResponse';
    value: Uint8Array;
}
/**
 * QueryClientConnectionsResponse is the response type for the
 * Query/ClientConnections RPC method
 */
export interface QueryClientConnectionsResponseSDKType {
    connection_paths: string[];
    proof: Uint8Array;
    proof_height: HeightSDKType;
}
/**
 * QueryConnectionClientStateRequest is the request type for the
 * Query/ConnectionClientState RPC method
 */
export interface QueryConnectionClientStateRequest {
    /** connection identifier */
    connectionId: string;
}
export interface QueryConnectionClientStateRequestProtoMsg {
    typeUrl: '/ibc.core.connection.v1.QueryConnectionClientStateRequest';
    value: Uint8Array;
}
/**
 * QueryConnectionClientStateRequest is the request type for the
 * Query/ConnectionClientState RPC method
 */
export interface QueryConnectionClientStateRequestSDKType {
    connection_id: string;
}
/**
 * QueryConnectionClientStateResponse is the response type for the
 * Query/ConnectionClientState RPC method
 */
export interface QueryConnectionClientStateResponse {
    /** client state associated with the channel */
    identifiedClientState?: IdentifiedClientState;
    /** merkle proof of existence */
    proof: Uint8Array;
    /** height at which the proof was retrieved */
    proofHeight: Height;
}
export interface QueryConnectionClientStateResponseProtoMsg {
    typeUrl: '/ibc.core.connection.v1.QueryConnectionClientStateResponse';
    value: Uint8Array;
}
/**
 * QueryConnectionClientStateResponse is the response type for the
 * Query/ConnectionClientState RPC method
 */
export interface QueryConnectionClientStateResponseSDKType {
    identified_client_state?: IdentifiedClientStateSDKType;
    proof: Uint8Array;
    proof_height: HeightSDKType;
}
/**
 * QueryConnectionConsensusStateRequest is the request type for the
 * Query/ConnectionConsensusState RPC method
 */
export interface QueryConnectionConsensusStateRequest {
    /** connection identifier */
    connectionId: string;
    revisionNumber: bigint;
    revisionHeight: bigint;
}
export interface QueryConnectionConsensusStateRequestProtoMsg {
    typeUrl: '/ibc.core.connection.v1.QueryConnectionConsensusStateRequest';
    value: Uint8Array;
}
/**
 * QueryConnectionConsensusStateRequest is the request type for the
 * Query/ConnectionConsensusState RPC method
 */
export interface QueryConnectionConsensusStateRequestSDKType {
    connection_id: string;
    revision_number: bigint;
    revision_height: bigint;
}
/**
 * QueryConnectionConsensusStateResponse is the response type for the
 * Query/ConnectionConsensusState RPC method
 */
export interface QueryConnectionConsensusStateResponse {
    /** consensus state associated with the channel */
    consensusState?: Any;
    /** client ID associated with the consensus state */
    clientId: string;
    /** merkle proof of existence */
    proof: Uint8Array;
    /** height at which the proof was retrieved */
    proofHeight: Height;
}
export interface QueryConnectionConsensusStateResponseProtoMsg {
    typeUrl: '/ibc.core.connection.v1.QueryConnectionConsensusStateResponse';
    value: Uint8Array;
}
/**
 * QueryConnectionConsensusStateResponse is the response type for the
 * Query/ConnectionConsensusState RPC method
 */
export interface QueryConnectionConsensusStateResponseSDKType {
    consensus_state?: AnySDKType;
    client_id: string;
    proof: Uint8Array;
    proof_height: HeightSDKType;
}
/** QueryConnectionParamsRequest is the request type for the Query/ConnectionParams RPC method. */
export interface QueryConnectionParamsRequest {
}
export interface QueryConnectionParamsRequestProtoMsg {
    typeUrl: '/ibc.core.connection.v1.QueryConnectionParamsRequest';
    value: Uint8Array;
}
/** QueryConnectionParamsRequest is the request type for the Query/ConnectionParams RPC method. */
export interface QueryConnectionParamsRequestSDKType {
}
/** QueryConnectionParamsResponse is the response type for the Query/ConnectionParams RPC method. */
export interface QueryConnectionParamsResponse {
    /** params defines the parameters of the module. */
    params?: Params;
}
export interface QueryConnectionParamsResponseProtoMsg {
    typeUrl: '/ibc.core.connection.v1.QueryConnectionParamsResponse';
    value: Uint8Array;
}
/** QueryConnectionParamsResponse is the response type for the Query/ConnectionParams RPC method. */
export interface QueryConnectionParamsResponseSDKType {
    params?: ParamsSDKType;
}
export declare const QueryConnectionRequest: {
    typeUrl: string;
    encode(message: QueryConnectionRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryConnectionRequest;
    fromJSON(object: any): QueryConnectionRequest;
    toJSON(message: QueryConnectionRequest): JsonSafe<QueryConnectionRequest>;
    fromPartial(object: Partial<QueryConnectionRequest>): QueryConnectionRequest;
    fromProtoMsg(message: QueryConnectionRequestProtoMsg): QueryConnectionRequest;
    toProto(message: QueryConnectionRequest): Uint8Array;
    toProtoMsg(message: QueryConnectionRequest): QueryConnectionRequestProtoMsg;
};
export declare const QueryConnectionResponse: {
    typeUrl: string;
    encode(message: QueryConnectionResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryConnectionResponse;
    fromJSON(object: any): QueryConnectionResponse;
    toJSON(message: QueryConnectionResponse): JsonSafe<QueryConnectionResponse>;
    fromPartial(object: Partial<QueryConnectionResponse>): QueryConnectionResponse;
    fromProtoMsg(message: QueryConnectionResponseProtoMsg): QueryConnectionResponse;
    toProto(message: QueryConnectionResponse): Uint8Array;
    toProtoMsg(message: QueryConnectionResponse): QueryConnectionResponseProtoMsg;
};
export declare const QueryConnectionsRequest: {
    typeUrl: string;
    encode(message: QueryConnectionsRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryConnectionsRequest;
    fromJSON(object: any): QueryConnectionsRequest;
    toJSON(message: QueryConnectionsRequest): JsonSafe<QueryConnectionsRequest>;
    fromPartial(object: Partial<QueryConnectionsRequest>): QueryConnectionsRequest;
    fromProtoMsg(message: QueryConnectionsRequestProtoMsg): QueryConnectionsRequest;
    toProto(message: QueryConnectionsRequest): Uint8Array;
    toProtoMsg(message: QueryConnectionsRequest): QueryConnectionsRequestProtoMsg;
};
export declare const QueryConnectionsResponse: {
    typeUrl: string;
    encode(message: QueryConnectionsResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryConnectionsResponse;
    fromJSON(object: any): QueryConnectionsResponse;
    toJSON(message: QueryConnectionsResponse): JsonSafe<QueryConnectionsResponse>;
    fromPartial(object: Partial<QueryConnectionsResponse>): QueryConnectionsResponse;
    fromProtoMsg(message: QueryConnectionsResponseProtoMsg): QueryConnectionsResponse;
    toProto(message: QueryConnectionsResponse): Uint8Array;
    toProtoMsg(message: QueryConnectionsResponse): QueryConnectionsResponseProtoMsg;
};
export declare const QueryClientConnectionsRequest: {
    typeUrl: string;
    encode(message: QueryClientConnectionsRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryClientConnectionsRequest;
    fromJSON(object: any): QueryClientConnectionsRequest;
    toJSON(message: QueryClientConnectionsRequest): JsonSafe<QueryClientConnectionsRequest>;
    fromPartial(object: Partial<QueryClientConnectionsRequest>): QueryClientConnectionsRequest;
    fromProtoMsg(message: QueryClientConnectionsRequestProtoMsg): QueryClientConnectionsRequest;
    toProto(message: QueryClientConnectionsRequest): Uint8Array;
    toProtoMsg(message: QueryClientConnectionsRequest): QueryClientConnectionsRequestProtoMsg;
};
export declare const QueryClientConnectionsResponse: {
    typeUrl: string;
    encode(message: QueryClientConnectionsResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryClientConnectionsResponse;
    fromJSON(object: any): QueryClientConnectionsResponse;
    toJSON(message: QueryClientConnectionsResponse): JsonSafe<QueryClientConnectionsResponse>;
    fromPartial(object: Partial<QueryClientConnectionsResponse>): QueryClientConnectionsResponse;
    fromProtoMsg(message: QueryClientConnectionsResponseProtoMsg): QueryClientConnectionsResponse;
    toProto(message: QueryClientConnectionsResponse): Uint8Array;
    toProtoMsg(message: QueryClientConnectionsResponse): QueryClientConnectionsResponseProtoMsg;
};
export declare const QueryConnectionClientStateRequest: {
    typeUrl: string;
    encode(message: QueryConnectionClientStateRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryConnectionClientStateRequest;
    fromJSON(object: any): QueryConnectionClientStateRequest;
    toJSON(message: QueryConnectionClientStateRequest): JsonSafe<QueryConnectionClientStateRequest>;
    fromPartial(object: Partial<QueryConnectionClientStateRequest>): QueryConnectionClientStateRequest;
    fromProtoMsg(message: QueryConnectionClientStateRequestProtoMsg): QueryConnectionClientStateRequest;
    toProto(message: QueryConnectionClientStateRequest): Uint8Array;
    toProtoMsg(message: QueryConnectionClientStateRequest): QueryConnectionClientStateRequestProtoMsg;
};
export declare const QueryConnectionClientStateResponse: {
    typeUrl: string;
    encode(message: QueryConnectionClientStateResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryConnectionClientStateResponse;
    fromJSON(object: any): QueryConnectionClientStateResponse;
    toJSON(message: QueryConnectionClientStateResponse): JsonSafe<QueryConnectionClientStateResponse>;
    fromPartial(object: Partial<QueryConnectionClientStateResponse>): QueryConnectionClientStateResponse;
    fromProtoMsg(message: QueryConnectionClientStateResponseProtoMsg): QueryConnectionClientStateResponse;
    toProto(message: QueryConnectionClientStateResponse): Uint8Array;
    toProtoMsg(message: QueryConnectionClientStateResponse): QueryConnectionClientStateResponseProtoMsg;
};
export declare const QueryConnectionConsensusStateRequest: {
    typeUrl: string;
    encode(message: QueryConnectionConsensusStateRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryConnectionConsensusStateRequest;
    fromJSON(object: any): QueryConnectionConsensusStateRequest;
    toJSON(message: QueryConnectionConsensusStateRequest): JsonSafe<QueryConnectionConsensusStateRequest>;
    fromPartial(object: Partial<QueryConnectionConsensusStateRequest>): QueryConnectionConsensusStateRequest;
    fromProtoMsg(message: QueryConnectionConsensusStateRequestProtoMsg): QueryConnectionConsensusStateRequest;
    toProto(message: QueryConnectionConsensusStateRequest): Uint8Array;
    toProtoMsg(message: QueryConnectionConsensusStateRequest): QueryConnectionConsensusStateRequestProtoMsg;
};
export declare const QueryConnectionConsensusStateResponse: {
    typeUrl: string;
    encode(message: QueryConnectionConsensusStateResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryConnectionConsensusStateResponse;
    fromJSON(object: any): QueryConnectionConsensusStateResponse;
    toJSON(message: QueryConnectionConsensusStateResponse): JsonSafe<QueryConnectionConsensusStateResponse>;
    fromPartial(object: Partial<QueryConnectionConsensusStateResponse>): QueryConnectionConsensusStateResponse;
    fromProtoMsg(message: QueryConnectionConsensusStateResponseProtoMsg): QueryConnectionConsensusStateResponse;
    toProto(message: QueryConnectionConsensusStateResponse): Uint8Array;
    toProtoMsg(message: QueryConnectionConsensusStateResponse): QueryConnectionConsensusStateResponseProtoMsg;
};
export declare const QueryConnectionParamsRequest: {
    typeUrl: string;
    encode(_: QueryConnectionParamsRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryConnectionParamsRequest;
    fromJSON(_: any): QueryConnectionParamsRequest;
    toJSON(_: QueryConnectionParamsRequest): JsonSafe<QueryConnectionParamsRequest>;
    fromPartial(_: Partial<QueryConnectionParamsRequest>): QueryConnectionParamsRequest;
    fromProtoMsg(message: QueryConnectionParamsRequestProtoMsg): QueryConnectionParamsRequest;
    toProto(message: QueryConnectionParamsRequest): Uint8Array;
    toProtoMsg(message: QueryConnectionParamsRequest): QueryConnectionParamsRequestProtoMsg;
};
export declare const QueryConnectionParamsResponse: {
    typeUrl: string;
    encode(message: QueryConnectionParamsResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryConnectionParamsResponse;
    fromJSON(object: any): QueryConnectionParamsResponse;
    toJSON(message: QueryConnectionParamsResponse): JsonSafe<QueryConnectionParamsResponse>;
    fromPartial(object: Partial<QueryConnectionParamsResponse>): QueryConnectionParamsResponse;
    fromProtoMsg(message: QueryConnectionParamsResponseProtoMsg): QueryConnectionParamsResponse;
    toProto(message: QueryConnectionParamsResponse): Uint8Array;
    toProtoMsg(message: QueryConnectionParamsResponse): QueryConnectionParamsResponseProtoMsg;
};
