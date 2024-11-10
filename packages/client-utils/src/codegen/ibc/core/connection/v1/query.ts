//@ts-nocheck
import {
  PageRequest,
  type PageRequestSDKType,
  PageResponse,
  type PageResponseSDKType,
} from '../../../../cosmos/base/query/v1beta1/pagination.js';
import {
  ConnectionEnd,
  type ConnectionEndSDKType,
  IdentifiedConnection,
  type IdentifiedConnectionSDKType,
} from './connection.js';
import {
  Height,
  type HeightSDKType,
  IdentifiedClientState,
  type IdentifiedClientStateSDKType,
  Params,
  type ParamsSDKType,
} from '../../client/v1/client.js';
import { Any, type AnySDKType } from '../../../../google/protobuf/any.js';
import { BinaryReader, BinaryWriter } from '../../../../binary.js';
import {
  isSet,
  bytesFromBase64,
  base64FromBytes,
} from '../../../../helpers.js';
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
export interface QueryConnectionParamsRequest {}
export interface QueryConnectionParamsRequestProtoMsg {
  typeUrl: '/ibc.core.connection.v1.QueryConnectionParamsRequest';
  value: Uint8Array;
}
/** QueryConnectionParamsRequest is the request type for the Query/ConnectionParams RPC method. */
export interface QueryConnectionParamsRequestSDKType {}
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
function createBaseQueryConnectionRequest(): QueryConnectionRequest {
  return {
    connectionId: '',
  };
}
export const QueryConnectionRequest = {
  typeUrl: '/ibc.core.connection.v1.QueryConnectionRequest',
  encode(
    message: QueryConnectionRequest,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.connectionId !== '') {
      writer.uint32(10).string(message.connectionId);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryConnectionRequest {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryConnectionRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.connectionId = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryConnectionRequest {
    return {
      connectionId: isSet(object.connectionId)
        ? String(object.connectionId)
        : '',
    };
  },
  toJSON(message: QueryConnectionRequest): JsonSafe<QueryConnectionRequest> {
    const obj: any = {};
    message.connectionId !== undefined &&
      (obj.connectionId = message.connectionId);
    return obj;
  },
  fromPartial(object: Partial<QueryConnectionRequest>): QueryConnectionRequest {
    const message = createBaseQueryConnectionRequest();
    message.connectionId = object.connectionId ?? '';
    return message;
  },
  fromProtoMsg(
    message: QueryConnectionRequestProtoMsg,
  ): QueryConnectionRequest {
    return QueryConnectionRequest.decode(message.value);
  },
  toProto(message: QueryConnectionRequest): Uint8Array {
    return QueryConnectionRequest.encode(message).finish();
  },
  toProtoMsg(message: QueryConnectionRequest): QueryConnectionRequestProtoMsg {
    return {
      typeUrl: '/ibc.core.connection.v1.QueryConnectionRequest',
      value: QueryConnectionRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryConnectionResponse(): QueryConnectionResponse {
  return {
    connection: undefined,
    proof: new Uint8Array(),
    proofHeight: Height.fromPartial({}),
  };
}
export const QueryConnectionResponse = {
  typeUrl: '/ibc.core.connection.v1.QueryConnectionResponse',
  encode(
    message: QueryConnectionResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.connection !== undefined) {
      ConnectionEnd.encode(
        message.connection,
        writer.uint32(10).fork(),
      ).ldelim();
    }
    if (message.proof.length !== 0) {
      writer.uint32(18).bytes(message.proof);
    }
    if (message.proofHeight !== undefined) {
      Height.encode(message.proofHeight, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryConnectionResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryConnectionResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.connection = ConnectionEnd.decode(reader, reader.uint32());
          break;
        case 2:
          message.proof = reader.bytes();
          break;
        case 3:
          message.proofHeight = Height.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryConnectionResponse {
    return {
      connection: isSet(object.connection)
        ? ConnectionEnd.fromJSON(object.connection)
        : undefined,
      proof: isSet(object.proof)
        ? bytesFromBase64(object.proof)
        : new Uint8Array(),
      proofHeight: isSet(object.proofHeight)
        ? Height.fromJSON(object.proofHeight)
        : undefined,
    };
  },
  toJSON(message: QueryConnectionResponse): JsonSafe<QueryConnectionResponse> {
    const obj: any = {};
    message.connection !== undefined &&
      (obj.connection = message.connection
        ? ConnectionEnd.toJSON(message.connection)
        : undefined);
    message.proof !== undefined &&
      (obj.proof = base64FromBytes(
        message.proof !== undefined ? message.proof : new Uint8Array(),
      ));
    message.proofHeight !== undefined &&
      (obj.proofHeight = message.proofHeight
        ? Height.toJSON(message.proofHeight)
        : undefined);
    return obj;
  },
  fromPartial(
    object: Partial<QueryConnectionResponse>,
  ): QueryConnectionResponse {
    const message = createBaseQueryConnectionResponse();
    message.connection =
      object.connection !== undefined && object.connection !== null
        ? ConnectionEnd.fromPartial(object.connection)
        : undefined;
    message.proof = object.proof ?? new Uint8Array();
    message.proofHeight =
      object.proofHeight !== undefined && object.proofHeight !== null
        ? Height.fromPartial(object.proofHeight)
        : undefined;
    return message;
  },
  fromProtoMsg(
    message: QueryConnectionResponseProtoMsg,
  ): QueryConnectionResponse {
    return QueryConnectionResponse.decode(message.value);
  },
  toProto(message: QueryConnectionResponse): Uint8Array {
    return QueryConnectionResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QueryConnectionResponse,
  ): QueryConnectionResponseProtoMsg {
    return {
      typeUrl: '/ibc.core.connection.v1.QueryConnectionResponse',
      value: QueryConnectionResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryConnectionsRequest(): QueryConnectionsRequest {
  return {
    pagination: undefined,
  };
}
export const QueryConnectionsRequest = {
  typeUrl: '/ibc.core.connection.v1.QueryConnectionsRequest',
  encode(
    message: QueryConnectionsRequest,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.pagination !== undefined) {
      PageRequest.encode(message.pagination, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryConnectionsRequest {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryConnectionsRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.pagination = PageRequest.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryConnectionsRequest {
    return {
      pagination: isSet(object.pagination)
        ? PageRequest.fromJSON(object.pagination)
        : undefined,
    };
  },
  toJSON(message: QueryConnectionsRequest): JsonSafe<QueryConnectionsRequest> {
    const obj: any = {};
    message.pagination !== undefined &&
      (obj.pagination = message.pagination
        ? PageRequest.toJSON(message.pagination)
        : undefined);
    return obj;
  },
  fromPartial(
    object: Partial<QueryConnectionsRequest>,
  ): QueryConnectionsRequest {
    const message = createBaseQueryConnectionsRequest();
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageRequest.fromPartial(object.pagination)
        : undefined;
    return message;
  },
  fromProtoMsg(
    message: QueryConnectionsRequestProtoMsg,
  ): QueryConnectionsRequest {
    return QueryConnectionsRequest.decode(message.value);
  },
  toProto(message: QueryConnectionsRequest): Uint8Array {
    return QueryConnectionsRequest.encode(message).finish();
  },
  toProtoMsg(
    message: QueryConnectionsRequest,
  ): QueryConnectionsRequestProtoMsg {
    return {
      typeUrl: '/ibc.core.connection.v1.QueryConnectionsRequest',
      value: QueryConnectionsRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryConnectionsResponse(): QueryConnectionsResponse {
  return {
    connections: [],
    pagination: undefined,
    height: Height.fromPartial({}),
  };
}
export const QueryConnectionsResponse = {
  typeUrl: '/ibc.core.connection.v1.QueryConnectionsResponse',
  encode(
    message: QueryConnectionsResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    for (const v of message.connections) {
      IdentifiedConnection.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    if (message.pagination !== undefined) {
      PageResponse.encode(
        message.pagination,
        writer.uint32(18).fork(),
      ).ldelim();
    }
    if (message.height !== undefined) {
      Height.encode(message.height, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryConnectionsResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryConnectionsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.connections.push(
            IdentifiedConnection.decode(reader, reader.uint32()),
          );
          break;
        case 2:
          message.pagination = PageResponse.decode(reader, reader.uint32());
          break;
        case 3:
          message.height = Height.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryConnectionsResponse {
    return {
      connections: Array.isArray(object?.connections)
        ? object.connections.map((e: any) => IdentifiedConnection.fromJSON(e))
        : [],
      pagination: isSet(object.pagination)
        ? PageResponse.fromJSON(object.pagination)
        : undefined,
      height: isSet(object.height) ? Height.fromJSON(object.height) : undefined,
    };
  },
  toJSON(
    message: QueryConnectionsResponse,
  ): JsonSafe<QueryConnectionsResponse> {
    const obj: any = {};
    if (message.connections) {
      obj.connections = message.connections.map(e =>
        e ? IdentifiedConnection.toJSON(e) : undefined,
      );
    } else {
      obj.connections = [];
    }
    message.pagination !== undefined &&
      (obj.pagination = message.pagination
        ? PageResponse.toJSON(message.pagination)
        : undefined);
    message.height !== undefined &&
      (obj.height = message.height ? Height.toJSON(message.height) : undefined);
    return obj;
  },
  fromPartial(
    object: Partial<QueryConnectionsResponse>,
  ): QueryConnectionsResponse {
    const message = createBaseQueryConnectionsResponse();
    message.connections =
      object.connections?.map(e => IdentifiedConnection.fromPartial(e)) || [];
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageResponse.fromPartial(object.pagination)
        : undefined;
    message.height =
      object.height !== undefined && object.height !== null
        ? Height.fromPartial(object.height)
        : undefined;
    return message;
  },
  fromProtoMsg(
    message: QueryConnectionsResponseProtoMsg,
  ): QueryConnectionsResponse {
    return QueryConnectionsResponse.decode(message.value);
  },
  toProto(message: QueryConnectionsResponse): Uint8Array {
    return QueryConnectionsResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QueryConnectionsResponse,
  ): QueryConnectionsResponseProtoMsg {
    return {
      typeUrl: '/ibc.core.connection.v1.QueryConnectionsResponse',
      value: QueryConnectionsResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryClientConnectionsRequest(): QueryClientConnectionsRequest {
  return {
    clientId: '',
  };
}
export const QueryClientConnectionsRequest = {
  typeUrl: '/ibc.core.connection.v1.QueryClientConnectionsRequest',
  encode(
    message: QueryClientConnectionsRequest,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.clientId !== '') {
      writer.uint32(10).string(message.clientId);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryClientConnectionsRequest {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryClientConnectionsRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.clientId = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryClientConnectionsRequest {
    return {
      clientId: isSet(object.clientId) ? String(object.clientId) : '',
    };
  },
  toJSON(
    message: QueryClientConnectionsRequest,
  ): JsonSafe<QueryClientConnectionsRequest> {
    const obj: any = {};
    message.clientId !== undefined && (obj.clientId = message.clientId);
    return obj;
  },
  fromPartial(
    object: Partial<QueryClientConnectionsRequest>,
  ): QueryClientConnectionsRequest {
    const message = createBaseQueryClientConnectionsRequest();
    message.clientId = object.clientId ?? '';
    return message;
  },
  fromProtoMsg(
    message: QueryClientConnectionsRequestProtoMsg,
  ): QueryClientConnectionsRequest {
    return QueryClientConnectionsRequest.decode(message.value);
  },
  toProto(message: QueryClientConnectionsRequest): Uint8Array {
    return QueryClientConnectionsRequest.encode(message).finish();
  },
  toProtoMsg(
    message: QueryClientConnectionsRequest,
  ): QueryClientConnectionsRequestProtoMsg {
    return {
      typeUrl: '/ibc.core.connection.v1.QueryClientConnectionsRequest',
      value: QueryClientConnectionsRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryClientConnectionsResponse(): QueryClientConnectionsResponse {
  return {
    connectionPaths: [],
    proof: new Uint8Array(),
    proofHeight: Height.fromPartial({}),
  };
}
export const QueryClientConnectionsResponse = {
  typeUrl: '/ibc.core.connection.v1.QueryClientConnectionsResponse',
  encode(
    message: QueryClientConnectionsResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    for (const v of message.connectionPaths) {
      writer.uint32(10).string(v!);
    }
    if (message.proof.length !== 0) {
      writer.uint32(18).bytes(message.proof);
    }
    if (message.proofHeight !== undefined) {
      Height.encode(message.proofHeight, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryClientConnectionsResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryClientConnectionsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.connectionPaths.push(reader.string());
          break;
        case 2:
          message.proof = reader.bytes();
          break;
        case 3:
          message.proofHeight = Height.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryClientConnectionsResponse {
    return {
      connectionPaths: Array.isArray(object?.connectionPaths)
        ? object.connectionPaths.map((e: any) => String(e))
        : [],
      proof: isSet(object.proof)
        ? bytesFromBase64(object.proof)
        : new Uint8Array(),
      proofHeight: isSet(object.proofHeight)
        ? Height.fromJSON(object.proofHeight)
        : undefined,
    };
  },
  toJSON(
    message: QueryClientConnectionsResponse,
  ): JsonSafe<QueryClientConnectionsResponse> {
    const obj: any = {};
    if (message.connectionPaths) {
      obj.connectionPaths = message.connectionPaths.map(e => e);
    } else {
      obj.connectionPaths = [];
    }
    message.proof !== undefined &&
      (obj.proof = base64FromBytes(
        message.proof !== undefined ? message.proof : new Uint8Array(),
      ));
    message.proofHeight !== undefined &&
      (obj.proofHeight = message.proofHeight
        ? Height.toJSON(message.proofHeight)
        : undefined);
    return obj;
  },
  fromPartial(
    object: Partial<QueryClientConnectionsResponse>,
  ): QueryClientConnectionsResponse {
    const message = createBaseQueryClientConnectionsResponse();
    message.connectionPaths = object.connectionPaths?.map(e => e) || [];
    message.proof = object.proof ?? new Uint8Array();
    message.proofHeight =
      object.proofHeight !== undefined && object.proofHeight !== null
        ? Height.fromPartial(object.proofHeight)
        : undefined;
    return message;
  },
  fromProtoMsg(
    message: QueryClientConnectionsResponseProtoMsg,
  ): QueryClientConnectionsResponse {
    return QueryClientConnectionsResponse.decode(message.value);
  },
  toProto(message: QueryClientConnectionsResponse): Uint8Array {
    return QueryClientConnectionsResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QueryClientConnectionsResponse,
  ): QueryClientConnectionsResponseProtoMsg {
    return {
      typeUrl: '/ibc.core.connection.v1.QueryClientConnectionsResponse',
      value: QueryClientConnectionsResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryConnectionClientStateRequest(): QueryConnectionClientStateRequest {
  return {
    connectionId: '',
  };
}
export const QueryConnectionClientStateRequest = {
  typeUrl: '/ibc.core.connection.v1.QueryConnectionClientStateRequest',
  encode(
    message: QueryConnectionClientStateRequest,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.connectionId !== '') {
      writer.uint32(10).string(message.connectionId);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryConnectionClientStateRequest {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryConnectionClientStateRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.connectionId = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryConnectionClientStateRequest {
    return {
      connectionId: isSet(object.connectionId)
        ? String(object.connectionId)
        : '',
    };
  },
  toJSON(
    message: QueryConnectionClientStateRequest,
  ): JsonSafe<QueryConnectionClientStateRequest> {
    const obj: any = {};
    message.connectionId !== undefined &&
      (obj.connectionId = message.connectionId);
    return obj;
  },
  fromPartial(
    object: Partial<QueryConnectionClientStateRequest>,
  ): QueryConnectionClientStateRequest {
    const message = createBaseQueryConnectionClientStateRequest();
    message.connectionId = object.connectionId ?? '';
    return message;
  },
  fromProtoMsg(
    message: QueryConnectionClientStateRequestProtoMsg,
  ): QueryConnectionClientStateRequest {
    return QueryConnectionClientStateRequest.decode(message.value);
  },
  toProto(message: QueryConnectionClientStateRequest): Uint8Array {
    return QueryConnectionClientStateRequest.encode(message).finish();
  },
  toProtoMsg(
    message: QueryConnectionClientStateRequest,
  ): QueryConnectionClientStateRequestProtoMsg {
    return {
      typeUrl: '/ibc.core.connection.v1.QueryConnectionClientStateRequest',
      value: QueryConnectionClientStateRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryConnectionClientStateResponse(): QueryConnectionClientStateResponse {
  return {
    identifiedClientState: undefined,
    proof: new Uint8Array(),
    proofHeight: Height.fromPartial({}),
  };
}
export const QueryConnectionClientStateResponse = {
  typeUrl: '/ibc.core.connection.v1.QueryConnectionClientStateResponse',
  encode(
    message: QueryConnectionClientStateResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.identifiedClientState !== undefined) {
      IdentifiedClientState.encode(
        message.identifiedClientState,
        writer.uint32(10).fork(),
      ).ldelim();
    }
    if (message.proof.length !== 0) {
      writer.uint32(18).bytes(message.proof);
    }
    if (message.proofHeight !== undefined) {
      Height.encode(message.proofHeight, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryConnectionClientStateResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryConnectionClientStateResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.identifiedClientState = IdentifiedClientState.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 2:
          message.proof = reader.bytes();
          break;
        case 3:
          message.proofHeight = Height.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryConnectionClientStateResponse {
    return {
      identifiedClientState: isSet(object.identifiedClientState)
        ? IdentifiedClientState.fromJSON(object.identifiedClientState)
        : undefined,
      proof: isSet(object.proof)
        ? bytesFromBase64(object.proof)
        : new Uint8Array(),
      proofHeight: isSet(object.proofHeight)
        ? Height.fromJSON(object.proofHeight)
        : undefined,
    };
  },
  toJSON(
    message: QueryConnectionClientStateResponse,
  ): JsonSafe<QueryConnectionClientStateResponse> {
    const obj: any = {};
    message.identifiedClientState !== undefined &&
      (obj.identifiedClientState = message.identifiedClientState
        ? IdentifiedClientState.toJSON(message.identifiedClientState)
        : undefined);
    message.proof !== undefined &&
      (obj.proof = base64FromBytes(
        message.proof !== undefined ? message.proof : new Uint8Array(),
      ));
    message.proofHeight !== undefined &&
      (obj.proofHeight = message.proofHeight
        ? Height.toJSON(message.proofHeight)
        : undefined);
    return obj;
  },
  fromPartial(
    object: Partial<QueryConnectionClientStateResponse>,
  ): QueryConnectionClientStateResponse {
    const message = createBaseQueryConnectionClientStateResponse();
    message.identifiedClientState =
      object.identifiedClientState !== undefined &&
      object.identifiedClientState !== null
        ? IdentifiedClientState.fromPartial(object.identifiedClientState)
        : undefined;
    message.proof = object.proof ?? new Uint8Array();
    message.proofHeight =
      object.proofHeight !== undefined && object.proofHeight !== null
        ? Height.fromPartial(object.proofHeight)
        : undefined;
    return message;
  },
  fromProtoMsg(
    message: QueryConnectionClientStateResponseProtoMsg,
  ): QueryConnectionClientStateResponse {
    return QueryConnectionClientStateResponse.decode(message.value);
  },
  toProto(message: QueryConnectionClientStateResponse): Uint8Array {
    return QueryConnectionClientStateResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QueryConnectionClientStateResponse,
  ): QueryConnectionClientStateResponseProtoMsg {
    return {
      typeUrl: '/ibc.core.connection.v1.QueryConnectionClientStateResponse',
      value: QueryConnectionClientStateResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryConnectionConsensusStateRequest(): QueryConnectionConsensusStateRequest {
  return {
    connectionId: '',
    revisionNumber: BigInt(0),
    revisionHeight: BigInt(0),
  };
}
export const QueryConnectionConsensusStateRequest = {
  typeUrl: '/ibc.core.connection.v1.QueryConnectionConsensusStateRequest',
  encode(
    message: QueryConnectionConsensusStateRequest,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.connectionId !== '') {
      writer.uint32(10).string(message.connectionId);
    }
    if (message.revisionNumber !== BigInt(0)) {
      writer.uint32(16).uint64(message.revisionNumber);
    }
    if (message.revisionHeight !== BigInt(0)) {
      writer.uint32(24).uint64(message.revisionHeight);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryConnectionConsensusStateRequest {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryConnectionConsensusStateRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.connectionId = reader.string();
          break;
        case 2:
          message.revisionNumber = reader.uint64();
          break;
        case 3:
          message.revisionHeight = reader.uint64();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryConnectionConsensusStateRequest {
    return {
      connectionId: isSet(object.connectionId)
        ? String(object.connectionId)
        : '',
      revisionNumber: isSet(object.revisionNumber)
        ? BigInt(object.revisionNumber.toString())
        : BigInt(0),
      revisionHeight: isSet(object.revisionHeight)
        ? BigInt(object.revisionHeight.toString())
        : BigInt(0),
    };
  },
  toJSON(
    message: QueryConnectionConsensusStateRequest,
  ): JsonSafe<QueryConnectionConsensusStateRequest> {
    const obj: any = {};
    message.connectionId !== undefined &&
      (obj.connectionId = message.connectionId);
    message.revisionNumber !== undefined &&
      (obj.revisionNumber = (message.revisionNumber || BigInt(0)).toString());
    message.revisionHeight !== undefined &&
      (obj.revisionHeight = (message.revisionHeight || BigInt(0)).toString());
    return obj;
  },
  fromPartial(
    object: Partial<QueryConnectionConsensusStateRequest>,
  ): QueryConnectionConsensusStateRequest {
    const message = createBaseQueryConnectionConsensusStateRequest();
    message.connectionId = object.connectionId ?? '';
    message.revisionNumber =
      object.revisionNumber !== undefined && object.revisionNumber !== null
        ? BigInt(object.revisionNumber.toString())
        : BigInt(0);
    message.revisionHeight =
      object.revisionHeight !== undefined && object.revisionHeight !== null
        ? BigInt(object.revisionHeight.toString())
        : BigInt(0);
    return message;
  },
  fromProtoMsg(
    message: QueryConnectionConsensusStateRequestProtoMsg,
  ): QueryConnectionConsensusStateRequest {
    return QueryConnectionConsensusStateRequest.decode(message.value);
  },
  toProto(message: QueryConnectionConsensusStateRequest): Uint8Array {
    return QueryConnectionConsensusStateRequest.encode(message).finish();
  },
  toProtoMsg(
    message: QueryConnectionConsensusStateRequest,
  ): QueryConnectionConsensusStateRequestProtoMsg {
    return {
      typeUrl: '/ibc.core.connection.v1.QueryConnectionConsensusStateRequest',
      value: QueryConnectionConsensusStateRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryConnectionConsensusStateResponse(): QueryConnectionConsensusStateResponse {
  return {
    consensusState: undefined,
    clientId: '',
    proof: new Uint8Array(),
    proofHeight: Height.fromPartial({}),
  };
}
export const QueryConnectionConsensusStateResponse = {
  typeUrl: '/ibc.core.connection.v1.QueryConnectionConsensusStateResponse',
  encode(
    message: QueryConnectionConsensusStateResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.consensusState !== undefined) {
      Any.encode(message.consensusState, writer.uint32(10).fork()).ldelim();
    }
    if (message.clientId !== '') {
      writer.uint32(18).string(message.clientId);
    }
    if (message.proof.length !== 0) {
      writer.uint32(26).bytes(message.proof);
    }
    if (message.proofHeight !== undefined) {
      Height.encode(message.proofHeight, writer.uint32(34).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryConnectionConsensusStateResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryConnectionConsensusStateResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.consensusState = Any.decode(reader, reader.uint32());
          break;
        case 2:
          message.clientId = reader.string();
          break;
        case 3:
          message.proof = reader.bytes();
          break;
        case 4:
          message.proofHeight = Height.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryConnectionConsensusStateResponse {
    return {
      consensusState: isSet(object.consensusState)
        ? Any.fromJSON(object.consensusState)
        : undefined,
      clientId: isSet(object.clientId) ? String(object.clientId) : '',
      proof: isSet(object.proof)
        ? bytesFromBase64(object.proof)
        : new Uint8Array(),
      proofHeight: isSet(object.proofHeight)
        ? Height.fromJSON(object.proofHeight)
        : undefined,
    };
  },
  toJSON(
    message: QueryConnectionConsensusStateResponse,
  ): JsonSafe<QueryConnectionConsensusStateResponse> {
    const obj: any = {};
    message.consensusState !== undefined &&
      (obj.consensusState = message.consensusState
        ? Any.toJSON(message.consensusState)
        : undefined);
    message.clientId !== undefined && (obj.clientId = message.clientId);
    message.proof !== undefined &&
      (obj.proof = base64FromBytes(
        message.proof !== undefined ? message.proof : new Uint8Array(),
      ));
    message.proofHeight !== undefined &&
      (obj.proofHeight = message.proofHeight
        ? Height.toJSON(message.proofHeight)
        : undefined);
    return obj;
  },
  fromPartial(
    object: Partial<QueryConnectionConsensusStateResponse>,
  ): QueryConnectionConsensusStateResponse {
    const message = createBaseQueryConnectionConsensusStateResponse();
    message.consensusState =
      object.consensusState !== undefined && object.consensusState !== null
        ? Any.fromPartial(object.consensusState)
        : undefined;
    message.clientId = object.clientId ?? '';
    message.proof = object.proof ?? new Uint8Array();
    message.proofHeight =
      object.proofHeight !== undefined && object.proofHeight !== null
        ? Height.fromPartial(object.proofHeight)
        : undefined;
    return message;
  },
  fromProtoMsg(
    message: QueryConnectionConsensusStateResponseProtoMsg,
  ): QueryConnectionConsensusStateResponse {
    return QueryConnectionConsensusStateResponse.decode(message.value);
  },
  toProto(message: QueryConnectionConsensusStateResponse): Uint8Array {
    return QueryConnectionConsensusStateResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QueryConnectionConsensusStateResponse,
  ): QueryConnectionConsensusStateResponseProtoMsg {
    return {
      typeUrl: '/ibc.core.connection.v1.QueryConnectionConsensusStateResponse',
      value: QueryConnectionConsensusStateResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryConnectionParamsRequest(): QueryConnectionParamsRequest {
  return {};
}
export const QueryConnectionParamsRequest = {
  typeUrl: '/ibc.core.connection.v1.QueryConnectionParamsRequest',
  encode(
    _: QueryConnectionParamsRequest,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryConnectionParamsRequest {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryConnectionParamsRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(_: any): QueryConnectionParamsRequest {
    return {};
  },
  toJSON(
    _: QueryConnectionParamsRequest,
  ): JsonSafe<QueryConnectionParamsRequest> {
    const obj: any = {};
    return obj;
  },
  fromPartial(
    _: Partial<QueryConnectionParamsRequest>,
  ): QueryConnectionParamsRequest {
    const message = createBaseQueryConnectionParamsRequest();
    return message;
  },
  fromProtoMsg(
    message: QueryConnectionParamsRequestProtoMsg,
  ): QueryConnectionParamsRequest {
    return QueryConnectionParamsRequest.decode(message.value);
  },
  toProto(message: QueryConnectionParamsRequest): Uint8Array {
    return QueryConnectionParamsRequest.encode(message).finish();
  },
  toProtoMsg(
    message: QueryConnectionParamsRequest,
  ): QueryConnectionParamsRequestProtoMsg {
    return {
      typeUrl: '/ibc.core.connection.v1.QueryConnectionParamsRequest',
      value: QueryConnectionParamsRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryConnectionParamsResponse(): QueryConnectionParamsResponse {
  return {
    params: undefined,
  };
}
export const QueryConnectionParamsResponse = {
  typeUrl: '/ibc.core.connection.v1.QueryConnectionParamsResponse',
  encode(
    message: QueryConnectionParamsResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.params !== undefined) {
      Params.encode(message.params, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryConnectionParamsResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryConnectionParamsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.params = Params.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryConnectionParamsResponse {
    return {
      params: isSet(object.params) ? Params.fromJSON(object.params) : undefined,
    };
  },
  toJSON(
    message: QueryConnectionParamsResponse,
  ): JsonSafe<QueryConnectionParamsResponse> {
    const obj: any = {};
    message.params !== undefined &&
      (obj.params = message.params ? Params.toJSON(message.params) : undefined);
    return obj;
  },
  fromPartial(
    object: Partial<QueryConnectionParamsResponse>,
  ): QueryConnectionParamsResponse {
    const message = createBaseQueryConnectionParamsResponse();
    message.params =
      object.params !== undefined && object.params !== null
        ? Params.fromPartial(object.params)
        : undefined;
    return message;
  },
  fromProtoMsg(
    message: QueryConnectionParamsResponseProtoMsg,
  ): QueryConnectionParamsResponse {
    return QueryConnectionParamsResponse.decode(message.value);
  },
  toProto(message: QueryConnectionParamsResponse): Uint8Array {
    return QueryConnectionParamsResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QueryConnectionParamsResponse,
  ): QueryConnectionParamsResponseProtoMsg {
    return {
      typeUrl: '/ibc.core.connection.v1.QueryConnectionParamsResponse',
      value: QueryConnectionParamsResponse.encode(message).finish(),
    };
  },
};
