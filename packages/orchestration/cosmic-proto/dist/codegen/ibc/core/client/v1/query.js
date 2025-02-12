//@ts-nocheck
import { PageRequest, PageResponse, } from '../../../../cosmos/base/query/v1beta1/pagination.js';
import { Any } from '../../../../google/protobuf/any.js';
import { Height, IdentifiedClientState, ConsensusStateWithHeight, Params, } from './client.js';
import { BinaryReader, BinaryWriter } from '../../../../binary.js';
import { isSet, bytesFromBase64, base64FromBytes, } from '../../../../helpers.js';
import {} from '../../../../json-safe.js';
function createBaseQueryClientStateRequest() {
    return {
        clientId: '',
    };
}
export const QueryClientStateRequest = {
    typeUrl: '/ibc.core.client.v1.QueryClientStateRequest',
    encode(message, writer = BinaryWriter.create()) {
        if (message.clientId !== '') {
            writer.uint32(10).string(message.clientId);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryClientStateRequest();
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
        const message = createBaseQueryClientStateRequest();
        message.clientId = object.clientId ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return QueryClientStateRequest.decode(message.value);
    },
    toProto(message) {
        return QueryClientStateRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.core.client.v1.QueryClientStateRequest',
            value: QueryClientStateRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryClientStateResponse() {
    return {
        clientState: undefined,
        proof: new Uint8Array(),
        proofHeight: Height.fromPartial({}),
    };
}
export const QueryClientStateResponse = {
    typeUrl: '/ibc.core.client.v1.QueryClientStateResponse',
    encode(message, writer = BinaryWriter.create()) {
        if (message.clientState !== undefined) {
            Any.encode(message.clientState, writer.uint32(10).fork()).ldelim();
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
        const message = createBaseQueryClientStateResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.clientState = Any.decode(reader, reader.uint32());
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
            clientState: isSet(object.clientState)
                ? Any.fromJSON(object.clientState)
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
        message.clientState !== undefined &&
            (obj.clientState = message.clientState
                ? Any.toJSON(message.clientState)
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
        const message = createBaseQueryClientStateResponse();
        message.clientState =
            object.clientState !== undefined && object.clientState !== null
                ? Any.fromPartial(object.clientState)
                : undefined;
        message.proof = object.proof ?? new Uint8Array();
        message.proofHeight =
            object.proofHeight !== undefined && object.proofHeight !== null
                ? Height.fromPartial(object.proofHeight)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return QueryClientStateResponse.decode(message.value);
    },
    toProto(message) {
        return QueryClientStateResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.core.client.v1.QueryClientStateResponse',
            value: QueryClientStateResponse.encode(message).finish(),
        };
    },
};
function createBaseQueryClientStatesRequest() {
    return {
        pagination: undefined,
    };
}
export const QueryClientStatesRequest = {
    typeUrl: '/ibc.core.client.v1.QueryClientStatesRequest',
    encode(message, writer = BinaryWriter.create()) {
        if (message.pagination !== undefined) {
            PageRequest.encode(message.pagination, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryClientStatesRequest();
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
        const message = createBaseQueryClientStatesRequest();
        message.pagination =
            object.pagination !== undefined && object.pagination !== null
                ? PageRequest.fromPartial(object.pagination)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return QueryClientStatesRequest.decode(message.value);
    },
    toProto(message) {
        return QueryClientStatesRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.core.client.v1.QueryClientStatesRequest',
            value: QueryClientStatesRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryClientStatesResponse() {
    return {
        clientStates: [],
        pagination: undefined,
    };
}
export const QueryClientStatesResponse = {
    typeUrl: '/ibc.core.client.v1.QueryClientStatesResponse',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.clientStates) {
            IdentifiedClientState.encode(v, writer.uint32(10).fork()).ldelim();
        }
        if (message.pagination !== undefined) {
            PageResponse.encode(message.pagination, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryClientStatesResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.clientStates.push(IdentifiedClientState.decode(reader, reader.uint32()));
                    break;
                case 2:
                    message.pagination = PageResponse.decode(reader, reader.uint32());
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
            clientStates: Array.isArray(object?.clientStates)
                ? object.clientStates.map((e) => IdentifiedClientState.fromJSON(e))
                : [],
            pagination: isSet(object.pagination)
                ? PageResponse.fromJSON(object.pagination)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.clientStates) {
            obj.clientStates = message.clientStates.map(e => e ? IdentifiedClientState.toJSON(e) : undefined);
        }
        else {
            obj.clientStates = [];
        }
        message.pagination !== undefined &&
            (obj.pagination = message.pagination
                ? PageResponse.toJSON(message.pagination)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryClientStatesResponse();
        message.clientStates =
            object.clientStates?.map(e => IdentifiedClientState.fromPartial(e)) || [];
        message.pagination =
            object.pagination !== undefined && object.pagination !== null
                ? PageResponse.fromPartial(object.pagination)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return QueryClientStatesResponse.decode(message.value);
    },
    toProto(message) {
        return QueryClientStatesResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.core.client.v1.QueryClientStatesResponse',
            value: QueryClientStatesResponse.encode(message).finish(),
        };
    },
};
function createBaseQueryConsensusStateRequest() {
    return {
        clientId: '',
        revisionNumber: BigInt(0),
        revisionHeight: BigInt(0),
        latestHeight: false,
    };
}
export const QueryConsensusStateRequest = {
    typeUrl: '/ibc.core.client.v1.QueryConsensusStateRequest',
    encode(message, writer = BinaryWriter.create()) {
        if (message.clientId !== '') {
            writer.uint32(10).string(message.clientId);
        }
        if (message.revisionNumber !== BigInt(0)) {
            writer.uint32(16).uint64(message.revisionNumber);
        }
        if (message.revisionHeight !== BigInt(0)) {
            writer.uint32(24).uint64(message.revisionHeight);
        }
        if (message.latestHeight === true) {
            writer.uint32(32).bool(message.latestHeight);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryConsensusStateRequest();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.clientId = reader.string();
                    break;
                case 2:
                    message.revisionNumber = reader.uint64();
                    break;
                case 3:
                    message.revisionHeight = reader.uint64();
                    break;
                case 4:
                    message.latestHeight = reader.bool();
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
            revisionNumber: isSet(object.revisionNumber)
                ? BigInt(object.revisionNumber.toString())
                : BigInt(0),
            revisionHeight: isSet(object.revisionHeight)
                ? BigInt(object.revisionHeight.toString())
                : BigInt(0),
            latestHeight: isSet(object.latestHeight)
                ? Boolean(object.latestHeight)
                : false,
        };
    },
    toJSON(message) {
        const obj = {};
        message.clientId !== undefined && (obj.clientId = message.clientId);
        message.revisionNumber !== undefined &&
            (obj.revisionNumber = (message.revisionNumber || BigInt(0)).toString());
        message.revisionHeight !== undefined &&
            (obj.revisionHeight = (message.revisionHeight || BigInt(0)).toString());
        message.latestHeight !== undefined &&
            (obj.latestHeight = message.latestHeight);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryConsensusStateRequest();
        message.clientId = object.clientId ?? '';
        message.revisionNumber =
            object.revisionNumber !== undefined && object.revisionNumber !== null
                ? BigInt(object.revisionNumber.toString())
                : BigInt(0);
        message.revisionHeight =
            object.revisionHeight !== undefined && object.revisionHeight !== null
                ? BigInt(object.revisionHeight.toString())
                : BigInt(0);
        message.latestHeight = object.latestHeight ?? false;
        return message;
    },
    fromProtoMsg(message) {
        return QueryConsensusStateRequest.decode(message.value);
    },
    toProto(message) {
        return QueryConsensusStateRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.core.client.v1.QueryConsensusStateRequest',
            value: QueryConsensusStateRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryConsensusStateResponse() {
    return {
        consensusState: undefined,
        proof: new Uint8Array(),
        proofHeight: Height.fromPartial({}),
    };
}
export const QueryConsensusStateResponse = {
    typeUrl: '/ibc.core.client.v1.QueryConsensusStateResponse',
    encode(message, writer = BinaryWriter.create()) {
        if (message.consensusState !== undefined) {
            Any.encode(message.consensusState, writer.uint32(10).fork()).ldelim();
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
        const message = createBaseQueryConsensusStateResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.consensusState = Any.decode(reader, reader.uint32());
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
            consensusState: isSet(object.consensusState)
                ? Any.fromJSON(object.consensusState)
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
        message.consensusState !== undefined &&
            (obj.consensusState = message.consensusState
                ? Any.toJSON(message.consensusState)
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
        const message = createBaseQueryConsensusStateResponse();
        message.consensusState =
            object.consensusState !== undefined && object.consensusState !== null
                ? Any.fromPartial(object.consensusState)
                : undefined;
        message.proof = object.proof ?? new Uint8Array();
        message.proofHeight =
            object.proofHeight !== undefined && object.proofHeight !== null
                ? Height.fromPartial(object.proofHeight)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return QueryConsensusStateResponse.decode(message.value);
    },
    toProto(message) {
        return QueryConsensusStateResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.core.client.v1.QueryConsensusStateResponse',
            value: QueryConsensusStateResponse.encode(message).finish(),
        };
    },
};
function createBaseQueryConsensusStatesRequest() {
    return {
        clientId: '',
        pagination: undefined,
    };
}
export const QueryConsensusStatesRequest = {
    typeUrl: '/ibc.core.client.v1.QueryConsensusStatesRequest',
    encode(message, writer = BinaryWriter.create()) {
        if (message.clientId !== '') {
            writer.uint32(10).string(message.clientId);
        }
        if (message.pagination !== undefined) {
            PageRequest.encode(message.pagination, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryConsensusStatesRequest();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.clientId = reader.string();
                    break;
                case 2:
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
            clientId: isSet(object.clientId) ? String(object.clientId) : '',
            pagination: isSet(object.pagination)
                ? PageRequest.fromJSON(object.pagination)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.clientId !== undefined && (obj.clientId = message.clientId);
        message.pagination !== undefined &&
            (obj.pagination = message.pagination
                ? PageRequest.toJSON(message.pagination)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryConsensusStatesRequest();
        message.clientId = object.clientId ?? '';
        message.pagination =
            object.pagination !== undefined && object.pagination !== null
                ? PageRequest.fromPartial(object.pagination)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return QueryConsensusStatesRequest.decode(message.value);
    },
    toProto(message) {
        return QueryConsensusStatesRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.core.client.v1.QueryConsensusStatesRequest',
            value: QueryConsensusStatesRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryConsensusStatesResponse() {
    return {
        consensusStates: [],
        pagination: undefined,
    };
}
export const QueryConsensusStatesResponse = {
    typeUrl: '/ibc.core.client.v1.QueryConsensusStatesResponse',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.consensusStates) {
            ConsensusStateWithHeight.encode(v, writer.uint32(10).fork()).ldelim();
        }
        if (message.pagination !== undefined) {
            PageResponse.encode(message.pagination, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryConsensusStatesResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.consensusStates.push(ConsensusStateWithHeight.decode(reader, reader.uint32()));
                    break;
                case 2:
                    message.pagination = PageResponse.decode(reader, reader.uint32());
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
            consensusStates: Array.isArray(object?.consensusStates)
                ? object.consensusStates.map((e) => ConsensusStateWithHeight.fromJSON(e))
                : [],
            pagination: isSet(object.pagination)
                ? PageResponse.fromJSON(object.pagination)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.consensusStates) {
            obj.consensusStates = message.consensusStates.map(e => e ? ConsensusStateWithHeight.toJSON(e) : undefined);
        }
        else {
            obj.consensusStates = [];
        }
        message.pagination !== undefined &&
            (obj.pagination = message.pagination
                ? PageResponse.toJSON(message.pagination)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryConsensusStatesResponse();
        message.consensusStates =
            object.consensusStates?.map(e => ConsensusStateWithHeight.fromPartial(e)) || [];
        message.pagination =
            object.pagination !== undefined && object.pagination !== null
                ? PageResponse.fromPartial(object.pagination)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return QueryConsensusStatesResponse.decode(message.value);
    },
    toProto(message) {
        return QueryConsensusStatesResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.core.client.v1.QueryConsensusStatesResponse',
            value: QueryConsensusStatesResponse.encode(message).finish(),
        };
    },
};
function createBaseQueryConsensusStateHeightsRequest() {
    return {
        clientId: '',
        pagination: undefined,
    };
}
export const QueryConsensusStateHeightsRequest = {
    typeUrl: '/ibc.core.client.v1.QueryConsensusStateHeightsRequest',
    encode(message, writer = BinaryWriter.create()) {
        if (message.clientId !== '') {
            writer.uint32(10).string(message.clientId);
        }
        if (message.pagination !== undefined) {
            PageRequest.encode(message.pagination, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryConsensusStateHeightsRequest();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.clientId = reader.string();
                    break;
                case 2:
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
            clientId: isSet(object.clientId) ? String(object.clientId) : '',
            pagination: isSet(object.pagination)
                ? PageRequest.fromJSON(object.pagination)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.clientId !== undefined && (obj.clientId = message.clientId);
        message.pagination !== undefined &&
            (obj.pagination = message.pagination
                ? PageRequest.toJSON(message.pagination)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryConsensusStateHeightsRequest();
        message.clientId = object.clientId ?? '';
        message.pagination =
            object.pagination !== undefined && object.pagination !== null
                ? PageRequest.fromPartial(object.pagination)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return QueryConsensusStateHeightsRequest.decode(message.value);
    },
    toProto(message) {
        return QueryConsensusStateHeightsRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.core.client.v1.QueryConsensusStateHeightsRequest',
            value: QueryConsensusStateHeightsRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryConsensusStateHeightsResponse() {
    return {
        consensusStateHeights: [],
        pagination: undefined,
    };
}
export const QueryConsensusStateHeightsResponse = {
    typeUrl: '/ibc.core.client.v1.QueryConsensusStateHeightsResponse',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.consensusStateHeights) {
            Height.encode(v, writer.uint32(10).fork()).ldelim();
        }
        if (message.pagination !== undefined) {
            PageResponse.encode(message.pagination, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryConsensusStateHeightsResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.consensusStateHeights.push(Height.decode(reader, reader.uint32()));
                    break;
                case 2:
                    message.pagination = PageResponse.decode(reader, reader.uint32());
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
            consensusStateHeights: Array.isArray(object?.consensusStateHeights)
                ? object.consensusStateHeights.map((e) => Height.fromJSON(e))
                : [],
            pagination: isSet(object.pagination)
                ? PageResponse.fromJSON(object.pagination)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.consensusStateHeights) {
            obj.consensusStateHeights = message.consensusStateHeights.map(e => e ? Height.toJSON(e) : undefined);
        }
        else {
            obj.consensusStateHeights = [];
        }
        message.pagination !== undefined &&
            (obj.pagination = message.pagination
                ? PageResponse.toJSON(message.pagination)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryConsensusStateHeightsResponse();
        message.consensusStateHeights =
            object.consensusStateHeights?.map(e => Height.fromPartial(e)) || [];
        message.pagination =
            object.pagination !== undefined && object.pagination !== null
                ? PageResponse.fromPartial(object.pagination)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return QueryConsensusStateHeightsResponse.decode(message.value);
    },
    toProto(message) {
        return QueryConsensusStateHeightsResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.core.client.v1.QueryConsensusStateHeightsResponse',
            value: QueryConsensusStateHeightsResponse.encode(message).finish(),
        };
    },
};
function createBaseQueryClientStatusRequest() {
    return {
        clientId: '',
    };
}
export const QueryClientStatusRequest = {
    typeUrl: '/ibc.core.client.v1.QueryClientStatusRequest',
    encode(message, writer = BinaryWriter.create()) {
        if (message.clientId !== '') {
            writer.uint32(10).string(message.clientId);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryClientStatusRequest();
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
        const message = createBaseQueryClientStatusRequest();
        message.clientId = object.clientId ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return QueryClientStatusRequest.decode(message.value);
    },
    toProto(message) {
        return QueryClientStatusRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.core.client.v1.QueryClientStatusRequest',
            value: QueryClientStatusRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryClientStatusResponse() {
    return {
        status: '',
    };
}
export const QueryClientStatusResponse = {
    typeUrl: '/ibc.core.client.v1.QueryClientStatusResponse',
    encode(message, writer = BinaryWriter.create()) {
        if (message.status !== '') {
            writer.uint32(10).string(message.status);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryClientStatusResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.status = reader.string();
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
            status: isSet(object.status) ? String(object.status) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.status !== undefined && (obj.status = message.status);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryClientStatusResponse();
        message.status = object.status ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return QueryClientStatusResponse.decode(message.value);
    },
    toProto(message) {
        return QueryClientStatusResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.core.client.v1.QueryClientStatusResponse',
            value: QueryClientStatusResponse.encode(message).finish(),
        };
    },
};
function createBaseQueryClientParamsRequest() {
    return {};
}
export const QueryClientParamsRequest = {
    typeUrl: '/ibc.core.client.v1.QueryClientParamsRequest',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryClientParamsRequest();
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
        const message = createBaseQueryClientParamsRequest();
        return message;
    },
    fromProtoMsg(message) {
        return QueryClientParamsRequest.decode(message.value);
    },
    toProto(message) {
        return QueryClientParamsRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.core.client.v1.QueryClientParamsRequest',
            value: QueryClientParamsRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryClientParamsResponse() {
    return {
        params: undefined,
    };
}
export const QueryClientParamsResponse = {
    typeUrl: '/ibc.core.client.v1.QueryClientParamsResponse',
    encode(message, writer = BinaryWriter.create()) {
        if (message.params !== undefined) {
            Params.encode(message.params, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryClientParamsResponse();
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
        const message = createBaseQueryClientParamsResponse();
        message.params =
            object.params !== undefined && object.params !== null
                ? Params.fromPartial(object.params)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return QueryClientParamsResponse.decode(message.value);
    },
    toProto(message) {
        return QueryClientParamsResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.core.client.v1.QueryClientParamsResponse',
            value: QueryClientParamsResponse.encode(message).finish(),
        };
    },
};
function createBaseQueryUpgradedClientStateRequest() {
    return {};
}
export const QueryUpgradedClientStateRequest = {
    typeUrl: '/ibc.core.client.v1.QueryUpgradedClientStateRequest',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryUpgradedClientStateRequest();
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
        const message = createBaseQueryUpgradedClientStateRequest();
        return message;
    },
    fromProtoMsg(message) {
        return QueryUpgradedClientStateRequest.decode(message.value);
    },
    toProto(message) {
        return QueryUpgradedClientStateRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.core.client.v1.QueryUpgradedClientStateRequest',
            value: QueryUpgradedClientStateRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryUpgradedClientStateResponse() {
    return {
        upgradedClientState: undefined,
    };
}
export const QueryUpgradedClientStateResponse = {
    typeUrl: '/ibc.core.client.v1.QueryUpgradedClientStateResponse',
    encode(message, writer = BinaryWriter.create()) {
        if (message.upgradedClientState !== undefined) {
            Any.encode(message.upgradedClientState, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryUpgradedClientStateResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.upgradedClientState = Any.decode(reader, reader.uint32());
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
            upgradedClientState: isSet(object.upgradedClientState)
                ? Any.fromJSON(object.upgradedClientState)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.upgradedClientState !== undefined &&
            (obj.upgradedClientState = message.upgradedClientState
                ? Any.toJSON(message.upgradedClientState)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryUpgradedClientStateResponse();
        message.upgradedClientState =
            object.upgradedClientState !== undefined &&
                object.upgradedClientState !== null
                ? Any.fromPartial(object.upgradedClientState)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return QueryUpgradedClientStateResponse.decode(message.value);
    },
    toProto(message) {
        return QueryUpgradedClientStateResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.core.client.v1.QueryUpgradedClientStateResponse',
            value: QueryUpgradedClientStateResponse.encode(message).finish(),
        };
    },
};
function createBaseQueryUpgradedConsensusStateRequest() {
    return {};
}
export const QueryUpgradedConsensusStateRequest = {
    typeUrl: '/ibc.core.client.v1.QueryUpgradedConsensusStateRequest',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryUpgradedConsensusStateRequest();
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
        const message = createBaseQueryUpgradedConsensusStateRequest();
        return message;
    },
    fromProtoMsg(message) {
        return QueryUpgradedConsensusStateRequest.decode(message.value);
    },
    toProto(message) {
        return QueryUpgradedConsensusStateRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.core.client.v1.QueryUpgradedConsensusStateRequest',
            value: QueryUpgradedConsensusStateRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryUpgradedConsensusStateResponse() {
    return {
        upgradedConsensusState: undefined,
    };
}
export const QueryUpgradedConsensusStateResponse = {
    typeUrl: '/ibc.core.client.v1.QueryUpgradedConsensusStateResponse',
    encode(message, writer = BinaryWriter.create()) {
        if (message.upgradedConsensusState !== undefined) {
            Any.encode(message.upgradedConsensusState, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryUpgradedConsensusStateResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.upgradedConsensusState = Any.decode(reader, reader.uint32());
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
            upgradedConsensusState: isSet(object.upgradedConsensusState)
                ? Any.fromJSON(object.upgradedConsensusState)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.upgradedConsensusState !== undefined &&
            (obj.upgradedConsensusState = message.upgradedConsensusState
                ? Any.toJSON(message.upgradedConsensusState)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryUpgradedConsensusStateResponse();
        message.upgradedConsensusState =
            object.upgradedConsensusState !== undefined &&
                object.upgradedConsensusState !== null
                ? Any.fromPartial(object.upgradedConsensusState)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return QueryUpgradedConsensusStateResponse.decode(message.value);
    },
    toProto(message) {
        return QueryUpgradedConsensusStateResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.core.client.v1.QueryUpgradedConsensusStateResponse',
            value: QueryUpgradedConsensusStateResponse.encode(message).finish(),
        };
    },
};
//# sourceMappingURL=query.js.map