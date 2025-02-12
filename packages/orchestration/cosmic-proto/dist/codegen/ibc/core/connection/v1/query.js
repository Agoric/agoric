//@ts-nocheck
import { PageRequest, PageResponse, } from '../../../../cosmos/base/query/v1beta1/pagination.js';
import { ConnectionEnd, IdentifiedConnection, } from './connection.js';
import { Height, IdentifiedClientState, Params, } from '../../client/v1/client.js';
import { Any } from '../../../../google/protobuf/any.js';
import { BinaryReader, BinaryWriter } from '../../../../binary.js';
import { isSet, bytesFromBase64, base64FromBytes, } from '../../../../helpers.js';
import {} from '../../../../json-safe.js';
function createBaseQueryConnectionRequest() {
    return {
        connectionId: '',
    };
}
export const QueryConnectionRequest = {
    typeUrl: '/ibc.core.connection.v1.QueryConnectionRequest',
    encode(message, writer = BinaryWriter.create()) {
        if (message.connectionId !== '') {
            writer.uint32(10).string(message.connectionId);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
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
    fromJSON(object) {
        return {
            connectionId: isSet(object.connectionId)
                ? String(object.connectionId)
                : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.connectionId !== undefined &&
            (obj.connectionId = message.connectionId);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryConnectionRequest();
        message.connectionId = object.connectionId ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return QueryConnectionRequest.decode(message.value);
    },
    toProto(message) {
        return QueryConnectionRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.core.connection.v1.QueryConnectionRequest',
            value: QueryConnectionRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryConnectionResponse() {
    return {
        connection: undefined,
        proof: new Uint8Array(),
        proofHeight: Height.fromPartial({}),
    };
}
export const QueryConnectionResponse = {
    typeUrl: '/ibc.core.connection.v1.QueryConnectionResponse',
    encode(message, writer = BinaryWriter.create()) {
        if (message.connection !== undefined) {
            ConnectionEnd.encode(message.connection, writer.uint32(10).fork()).ldelim();
        }
        if (message.proof.length !== 0) {
            writer.uint32(18).bytes(message.proof);
        }
        if (message.proofHeight !== undefined) {
            Height.encode(message.proofHeight, writer.uint32(26).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
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
    fromJSON(object) {
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
    toJSON(message) {
        const obj = {};
        message.connection !== undefined &&
            (obj.connection = message.connection
                ? ConnectionEnd.toJSON(message.connection)
                : undefined);
        message.proof !== undefined &&
            (obj.proof = base64FromBytes(message.proof !== undefined ? message.proof : new Uint8Array()));
        message.proofHeight !== undefined &&
            (obj.proofHeight = message.proofHeight
                ? Height.toJSON(message.proofHeight)
                : undefined);
        return obj;
    },
    fromPartial(object) {
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
    fromProtoMsg(message) {
        return QueryConnectionResponse.decode(message.value);
    },
    toProto(message) {
        return QueryConnectionResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.core.connection.v1.QueryConnectionResponse',
            value: QueryConnectionResponse.encode(message).finish(),
        };
    },
};
function createBaseQueryConnectionsRequest() {
    return {
        pagination: undefined,
    };
}
export const QueryConnectionsRequest = {
    typeUrl: '/ibc.core.connection.v1.QueryConnectionsRequest',
    encode(message, writer = BinaryWriter.create()) {
        if (message.pagination !== undefined) {
            PageRequest.encode(message.pagination, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
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
    fromJSON(object) {
        return {
            pagination: isSet(object.pagination)
                ? PageRequest.fromJSON(object.pagination)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.pagination !== undefined &&
            (obj.pagination = message.pagination
                ? PageRequest.toJSON(message.pagination)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryConnectionsRequest();
        message.pagination =
            object.pagination !== undefined && object.pagination !== null
                ? PageRequest.fromPartial(object.pagination)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return QueryConnectionsRequest.decode(message.value);
    },
    toProto(message) {
        return QueryConnectionsRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.core.connection.v1.QueryConnectionsRequest',
            value: QueryConnectionsRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryConnectionsResponse() {
    return {
        connections: [],
        pagination: undefined,
        height: Height.fromPartial({}),
    };
}
export const QueryConnectionsResponse = {
    typeUrl: '/ibc.core.connection.v1.QueryConnectionsResponse',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.connections) {
            IdentifiedConnection.encode(v, writer.uint32(10).fork()).ldelim();
        }
        if (message.pagination !== undefined) {
            PageResponse.encode(message.pagination, writer.uint32(18).fork()).ldelim();
        }
        if (message.height !== undefined) {
            Height.encode(message.height, writer.uint32(26).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryConnectionsResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.connections.push(IdentifiedConnection.decode(reader, reader.uint32()));
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
    fromJSON(object) {
        return {
            connections: Array.isArray(object?.connections)
                ? object.connections.map((e) => IdentifiedConnection.fromJSON(e))
                : [],
            pagination: isSet(object.pagination)
                ? PageResponse.fromJSON(object.pagination)
                : undefined,
            height: isSet(object.height) ? Height.fromJSON(object.height) : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.connections) {
            obj.connections = message.connections.map(e => e ? IdentifiedConnection.toJSON(e) : undefined);
        }
        else {
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
    fromPartial(object) {
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
    fromProtoMsg(message) {
        return QueryConnectionsResponse.decode(message.value);
    },
    toProto(message) {
        return QueryConnectionsResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.core.connection.v1.QueryConnectionsResponse',
            value: QueryConnectionsResponse.encode(message).finish(),
        };
    },
};
function createBaseQueryClientConnectionsRequest() {
    return {
        clientId: '',
    };
}
export const QueryClientConnectionsRequest = {
    typeUrl: '/ibc.core.connection.v1.QueryClientConnectionsRequest',
    encode(message, writer = BinaryWriter.create()) {
        if (message.clientId !== '') {
            writer.uint32(10).string(message.clientId);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
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
    fromJSON(object) {
        return {
            clientId: isSet(object.clientId) ? String(object.clientId) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.clientId !== undefined && (obj.clientId = message.clientId);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryClientConnectionsRequest();
        message.clientId = object.clientId ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return QueryClientConnectionsRequest.decode(message.value);
    },
    toProto(message) {
        return QueryClientConnectionsRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.core.connection.v1.QueryClientConnectionsRequest',
            value: QueryClientConnectionsRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryClientConnectionsResponse() {
    return {
        connectionPaths: [],
        proof: new Uint8Array(),
        proofHeight: Height.fromPartial({}),
    };
}
export const QueryClientConnectionsResponse = {
    typeUrl: '/ibc.core.connection.v1.QueryClientConnectionsResponse',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.connectionPaths) {
            writer.uint32(10).string(v);
        }
        if (message.proof.length !== 0) {
            writer.uint32(18).bytes(message.proof);
        }
        if (message.proofHeight !== undefined) {
            Height.encode(message.proofHeight, writer.uint32(26).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
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
    fromJSON(object) {
        return {
            connectionPaths: Array.isArray(object?.connectionPaths)
                ? object.connectionPaths.map((e) => String(e))
                : [],
            proof: isSet(object.proof)
                ? bytesFromBase64(object.proof)
                : new Uint8Array(),
            proofHeight: isSet(object.proofHeight)
                ? Height.fromJSON(object.proofHeight)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.connectionPaths) {
            obj.connectionPaths = message.connectionPaths.map(e => e);
        }
        else {
            obj.connectionPaths = [];
        }
        message.proof !== undefined &&
            (obj.proof = base64FromBytes(message.proof !== undefined ? message.proof : new Uint8Array()));
        message.proofHeight !== undefined &&
            (obj.proofHeight = message.proofHeight
                ? Height.toJSON(message.proofHeight)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryClientConnectionsResponse();
        message.connectionPaths = object.connectionPaths?.map(e => e) || [];
        message.proof = object.proof ?? new Uint8Array();
        message.proofHeight =
            object.proofHeight !== undefined && object.proofHeight !== null
                ? Height.fromPartial(object.proofHeight)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return QueryClientConnectionsResponse.decode(message.value);
    },
    toProto(message) {
        return QueryClientConnectionsResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.core.connection.v1.QueryClientConnectionsResponse',
            value: QueryClientConnectionsResponse.encode(message).finish(),
        };
    },
};
function createBaseQueryConnectionClientStateRequest() {
    return {
        connectionId: '',
    };
}
export const QueryConnectionClientStateRequest = {
    typeUrl: '/ibc.core.connection.v1.QueryConnectionClientStateRequest',
    encode(message, writer = BinaryWriter.create()) {
        if (message.connectionId !== '') {
            writer.uint32(10).string(message.connectionId);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
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
    fromJSON(object) {
        return {
            connectionId: isSet(object.connectionId)
                ? String(object.connectionId)
                : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.connectionId !== undefined &&
            (obj.connectionId = message.connectionId);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryConnectionClientStateRequest();
        message.connectionId = object.connectionId ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return QueryConnectionClientStateRequest.decode(message.value);
    },
    toProto(message) {
        return QueryConnectionClientStateRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.core.connection.v1.QueryConnectionClientStateRequest',
            value: QueryConnectionClientStateRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryConnectionClientStateResponse() {
    return {
        identifiedClientState: undefined,
        proof: new Uint8Array(),
        proofHeight: Height.fromPartial({}),
    };
}
export const QueryConnectionClientStateResponse = {
    typeUrl: '/ibc.core.connection.v1.QueryConnectionClientStateResponse',
    encode(message, writer = BinaryWriter.create()) {
        if (message.identifiedClientState !== undefined) {
            IdentifiedClientState.encode(message.identifiedClientState, writer.uint32(10).fork()).ldelim();
        }
        if (message.proof.length !== 0) {
            writer.uint32(18).bytes(message.proof);
        }
        if (message.proofHeight !== undefined) {
            Height.encode(message.proofHeight, writer.uint32(26).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryConnectionClientStateResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.identifiedClientState = IdentifiedClientState.decode(reader, reader.uint32());
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
    fromJSON(object) {
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
    toJSON(message) {
        const obj = {};
        message.identifiedClientState !== undefined &&
            (obj.identifiedClientState = message.identifiedClientState
                ? IdentifiedClientState.toJSON(message.identifiedClientState)
                : undefined);
        message.proof !== undefined &&
            (obj.proof = base64FromBytes(message.proof !== undefined ? message.proof : new Uint8Array()));
        message.proofHeight !== undefined &&
            (obj.proofHeight = message.proofHeight
                ? Height.toJSON(message.proofHeight)
                : undefined);
        return obj;
    },
    fromPartial(object) {
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
    fromProtoMsg(message) {
        return QueryConnectionClientStateResponse.decode(message.value);
    },
    toProto(message) {
        return QueryConnectionClientStateResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.core.connection.v1.QueryConnectionClientStateResponse',
            value: QueryConnectionClientStateResponse.encode(message).finish(),
        };
    },
};
function createBaseQueryConnectionConsensusStateRequest() {
    return {
        connectionId: '',
        revisionNumber: BigInt(0),
        revisionHeight: BigInt(0),
    };
}
export const QueryConnectionConsensusStateRequest = {
    typeUrl: '/ibc.core.connection.v1.QueryConnectionConsensusStateRequest',
    encode(message, writer = BinaryWriter.create()) {
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
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
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
    fromJSON(object) {
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
    toJSON(message) {
        const obj = {};
        message.connectionId !== undefined &&
            (obj.connectionId = message.connectionId);
        message.revisionNumber !== undefined &&
            (obj.revisionNumber = (message.revisionNumber || BigInt(0)).toString());
        message.revisionHeight !== undefined &&
            (obj.revisionHeight = (message.revisionHeight || BigInt(0)).toString());
        return obj;
    },
    fromPartial(object) {
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
    fromProtoMsg(message) {
        return QueryConnectionConsensusStateRequest.decode(message.value);
    },
    toProto(message) {
        return QueryConnectionConsensusStateRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.core.connection.v1.QueryConnectionConsensusStateRequest',
            value: QueryConnectionConsensusStateRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryConnectionConsensusStateResponse() {
    return {
        consensusState: undefined,
        clientId: '',
        proof: new Uint8Array(),
        proofHeight: Height.fromPartial({}),
    };
}
export const QueryConnectionConsensusStateResponse = {
    typeUrl: '/ibc.core.connection.v1.QueryConnectionConsensusStateResponse',
    encode(message, writer = BinaryWriter.create()) {
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
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
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
    fromJSON(object) {
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
    toJSON(message) {
        const obj = {};
        message.consensusState !== undefined &&
            (obj.consensusState = message.consensusState
                ? Any.toJSON(message.consensusState)
                : undefined);
        message.clientId !== undefined && (obj.clientId = message.clientId);
        message.proof !== undefined &&
            (obj.proof = base64FromBytes(message.proof !== undefined ? message.proof : new Uint8Array()));
        message.proofHeight !== undefined &&
            (obj.proofHeight = message.proofHeight
                ? Height.toJSON(message.proofHeight)
                : undefined);
        return obj;
    },
    fromPartial(object) {
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
    fromProtoMsg(message) {
        return QueryConnectionConsensusStateResponse.decode(message.value);
    },
    toProto(message) {
        return QueryConnectionConsensusStateResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.core.connection.v1.QueryConnectionConsensusStateResponse',
            value: QueryConnectionConsensusStateResponse.encode(message).finish(),
        };
    },
};
function createBaseQueryConnectionParamsRequest() {
    return {};
}
export const QueryConnectionParamsRequest = {
    typeUrl: '/ibc.core.connection.v1.QueryConnectionParamsRequest',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
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
    fromJSON(_) {
        return {};
    },
    toJSON(_) {
        const obj = {};
        return obj;
    },
    fromPartial(_) {
        const message = createBaseQueryConnectionParamsRequest();
        return message;
    },
    fromProtoMsg(message) {
        return QueryConnectionParamsRequest.decode(message.value);
    },
    toProto(message) {
        return QueryConnectionParamsRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.core.connection.v1.QueryConnectionParamsRequest',
            value: QueryConnectionParamsRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryConnectionParamsResponse() {
    return {
        params: undefined,
    };
}
export const QueryConnectionParamsResponse = {
    typeUrl: '/ibc.core.connection.v1.QueryConnectionParamsResponse',
    encode(message, writer = BinaryWriter.create()) {
        if (message.params !== undefined) {
            Params.encode(message.params, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
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
    fromJSON(object) {
        return {
            params: isSet(object.params) ? Params.fromJSON(object.params) : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.params !== undefined &&
            (obj.params = message.params ? Params.toJSON(message.params) : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryConnectionParamsResponse();
        message.params =
            object.params !== undefined && object.params !== null
                ? Params.fromPartial(object.params)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return QueryConnectionParamsResponse.decode(message.value);
    },
    toProto(message) {
        return QueryConnectionParamsResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.core.connection.v1.QueryConnectionParamsResponse',
            value: QueryConnectionParamsResponse.encode(message).finish(),
        };
    },
};
//# sourceMappingURL=query.js.map