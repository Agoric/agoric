//@ts-nocheck
import { Counterparty, Version, } from './connection.js';
import { Any } from '../../../../google/protobuf/any.js';
import { Height } from '../../client/v1/client.js';
import { BinaryReader, BinaryWriter } from '../../../../binary.js';
import { isSet, bytesFromBase64, base64FromBytes, } from '../../../../helpers.js';
import {} from '../../../../json-safe.js';
function createBaseMsgConnectionOpenInit() {
    return {
        clientId: '',
        counterparty: Counterparty.fromPartial({}),
        version: undefined,
        delayPeriod: BigInt(0),
        signer: '',
    };
}
export const MsgConnectionOpenInit = {
    typeUrl: '/ibc.core.connection.v1.MsgConnectionOpenInit',
    encode(message, writer = BinaryWriter.create()) {
        if (message.clientId !== '') {
            writer.uint32(10).string(message.clientId);
        }
        if (message.counterparty !== undefined) {
            Counterparty.encode(message.counterparty, writer.uint32(18).fork()).ldelim();
        }
        if (message.version !== undefined) {
            Version.encode(message.version, writer.uint32(26).fork()).ldelim();
        }
        if (message.delayPeriod !== BigInt(0)) {
            writer.uint32(32).uint64(message.delayPeriod);
        }
        if (message.signer !== '') {
            writer.uint32(42).string(message.signer);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgConnectionOpenInit();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.clientId = reader.string();
                    break;
                case 2:
                    message.counterparty = Counterparty.decode(reader, reader.uint32());
                    break;
                case 3:
                    message.version = Version.decode(reader, reader.uint32());
                    break;
                case 4:
                    message.delayPeriod = reader.uint64();
                    break;
                case 5:
                    message.signer = reader.string();
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
            counterparty: isSet(object.counterparty)
                ? Counterparty.fromJSON(object.counterparty)
                : undefined,
            version: isSet(object.version)
                ? Version.fromJSON(object.version)
                : undefined,
            delayPeriod: isSet(object.delayPeriod)
                ? BigInt(object.delayPeriod.toString())
                : BigInt(0),
            signer: isSet(object.signer) ? String(object.signer) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.clientId !== undefined && (obj.clientId = message.clientId);
        message.counterparty !== undefined &&
            (obj.counterparty = message.counterparty
                ? Counterparty.toJSON(message.counterparty)
                : undefined);
        message.version !== undefined &&
            (obj.version = message.version
                ? Version.toJSON(message.version)
                : undefined);
        message.delayPeriod !== undefined &&
            (obj.delayPeriod = (message.delayPeriod || BigInt(0)).toString());
        message.signer !== undefined && (obj.signer = message.signer);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgConnectionOpenInit();
        message.clientId = object.clientId ?? '';
        message.counterparty =
            object.counterparty !== undefined && object.counterparty !== null
                ? Counterparty.fromPartial(object.counterparty)
                : undefined;
        message.version =
            object.version !== undefined && object.version !== null
                ? Version.fromPartial(object.version)
                : undefined;
        message.delayPeriod =
            object.delayPeriod !== undefined && object.delayPeriod !== null
                ? BigInt(object.delayPeriod.toString())
                : BigInt(0);
        message.signer = object.signer ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return MsgConnectionOpenInit.decode(message.value);
    },
    toProto(message) {
        return MsgConnectionOpenInit.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.core.connection.v1.MsgConnectionOpenInit',
            value: MsgConnectionOpenInit.encode(message).finish(),
        };
    },
};
function createBaseMsgConnectionOpenInitResponse() {
    return {};
}
export const MsgConnectionOpenInitResponse = {
    typeUrl: '/ibc.core.connection.v1.MsgConnectionOpenInitResponse',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgConnectionOpenInitResponse();
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
        const message = createBaseMsgConnectionOpenInitResponse();
        return message;
    },
    fromProtoMsg(message) {
        return MsgConnectionOpenInitResponse.decode(message.value);
    },
    toProto(message) {
        return MsgConnectionOpenInitResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.core.connection.v1.MsgConnectionOpenInitResponse',
            value: MsgConnectionOpenInitResponse.encode(message).finish(),
        };
    },
};
function createBaseMsgConnectionOpenTry() {
    return {
        clientId: '',
        previousConnectionId: '',
        clientState: undefined,
        counterparty: Counterparty.fromPartial({}),
        delayPeriod: BigInt(0),
        counterpartyVersions: [],
        proofHeight: Height.fromPartial({}),
        proofInit: new Uint8Array(),
        proofClient: new Uint8Array(),
        proofConsensus: new Uint8Array(),
        consensusHeight: Height.fromPartial({}),
        signer: '',
    };
}
export const MsgConnectionOpenTry = {
    typeUrl: '/ibc.core.connection.v1.MsgConnectionOpenTry',
    encode(message, writer = BinaryWriter.create()) {
        if (message.clientId !== '') {
            writer.uint32(10).string(message.clientId);
        }
        if (message.previousConnectionId !== '') {
            writer.uint32(18).string(message.previousConnectionId);
        }
        if (message.clientState !== undefined) {
            Any.encode(message.clientState, writer.uint32(26).fork()).ldelim();
        }
        if (message.counterparty !== undefined) {
            Counterparty.encode(message.counterparty, writer.uint32(34).fork()).ldelim();
        }
        if (message.delayPeriod !== BigInt(0)) {
            writer.uint32(40).uint64(message.delayPeriod);
        }
        for (const v of message.counterpartyVersions) {
            Version.encode(v, writer.uint32(50).fork()).ldelim();
        }
        if (message.proofHeight !== undefined) {
            Height.encode(message.proofHeight, writer.uint32(58).fork()).ldelim();
        }
        if (message.proofInit.length !== 0) {
            writer.uint32(66).bytes(message.proofInit);
        }
        if (message.proofClient.length !== 0) {
            writer.uint32(74).bytes(message.proofClient);
        }
        if (message.proofConsensus.length !== 0) {
            writer.uint32(82).bytes(message.proofConsensus);
        }
        if (message.consensusHeight !== undefined) {
            Height.encode(message.consensusHeight, writer.uint32(90).fork()).ldelim();
        }
        if (message.signer !== '') {
            writer.uint32(98).string(message.signer);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgConnectionOpenTry();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.clientId = reader.string();
                    break;
                case 2:
                    message.previousConnectionId = reader.string();
                    break;
                case 3:
                    message.clientState = Any.decode(reader, reader.uint32());
                    break;
                case 4:
                    message.counterparty = Counterparty.decode(reader, reader.uint32());
                    break;
                case 5:
                    message.delayPeriod = reader.uint64();
                    break;
                case 6:
                    message.counterpartyVersions.push(Version.decode(reader, reader.uint32()));
                    break;
                case 7:
                    message.proofHeight = Height.decode(reader, reader.uint32());
                    break;
                case 8:
                    message.proofInit = reader.bytes();
                    break;
                case 9:
                    message.proofClient = reader.bytes();
                    break;
                case 10:
                    message.proofConsensus = reader.bytes();
                    break;
                case 11:
                    message.consensusHeight = Height.decode(reader, reader.uint32());
                    break;
                case 12:
                    message.signer = reader.string();
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
            previousConnectionId: isSet(object.previousConnectionId)
                ? String(object.previousConnectionId)
                : '',
            clientState: isSet(object.clientState)
                ? Any.fromJSON(object.clientState)
                : undefined,
            counterparty: isSet(object.counterparty)
                ? Counterparty.fromJSON(object.counterparty)
                : undefined,
            delayPeriod: isSet(object.delayPeriod)
                ? BigInt(object.delayPeriod.toString())
                : BigInt(0),
            counterpartyVersions: Array.isArray(object?.counterpartyVersions)
                ? object.counterpartyVersions.map((e) => Version.fromJSON(e))
                : [],
            proofHeight: isSet(object.proofHeight)
                ? Height.fromJSON(object.proofHeight)
                : undefined,
            proofInit: isSet(object.proofInit)
                ? bytesFromBase64(object.proofInit)
                : new Uint8Array(),
            proofClient: isSet(object.proofClient)
                ? bytesFromBase64(object.proofClient)
                : new Uint8Array(),
            proofConsensus: isSet(object.proofConsensus)
                ? bytesFromBase64(object.proofConsensus)
                : new Uint8Array(),
            consensusHeight: isSet(object.consensusHeight)
                ? Height.fromJSON(object.consensusHeight)
                : undefined,
            signer: isSet(object.signer) ? String(object.signer) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.clientId !== undefined && (obj.clientId = message.clientId);
        message.previousConnectionId !== undefined &&
            (obj.previousConnectionId = message.previousConnectionId);
        message.clientState !== undefined &&
            (obj.clientState = message.clientState
                ? Any.toJSON(message.clientState)
                : undefined);
        message.counterparty !== undefined &&
            (obj.counterparty = message.counterparty
                ? Counterparty.toJSON(message.counterparty)
                : undefined);
        message.delayPeriod !== undefined &&
            (obj.delayPeriod = (message.delayPeriod || BigInt(0)).toString());
        if (message.counterpartyVersions) {
            obj.counterpartyVersions = message.counterpartyVersions.map(e => e ? Version.toJSON(e) : undefined);
        }
        else {
            obj.counterpartyVersions = [];
        }
        message.proofHeight !== undefined &&
            (obj.proofHeight = message.proofHeight
                ? Height.toJSON(message.proofHeight)
                : undefined);
        message.proofInit !== undefined &&
            (obj.proofInit = base64FromBytes(message.proofInit !== undefined ? message.proofInit : new Uint8Array()));
        message.proofClient !== undefined &&
            (obj.proofClient = base64FromBytes(message.proofClient !== undefined
                ? message.proofClient
                : new Uint8Array()));
        message.proofConsensus !== undefined &&
            (obj.proofConsensus = base64FromBytes(message.proofConsensus !== undefined
                ? message.proofConsensus
                : new Uint8Array()));
        message.consensusHeight !== undefined &&
            (obj.consensusHeight = message.consensusHeight
                ? Height.toJSON(message.consensusHeight)
                : undefined);
        message.signer !== undefined && (obj.signer = message.signer);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgConnectionOpenTry();
        message.clientId = object.clientId ?? '';
        message.previousConnectionId = object.previousConnectionId ?? '';
        message.clientState =
            object.clientState !== undefined && object.clientState !== null
                ? Any.fromPartial(object.clientState)
                : undefined;
        message.counterparty =
            object.counterparty !== undefined && object.counterparty !== null
                ? Counterparty.fromPartial(object.counterparty)
                : undefined;
        message.delayPeriod =
            object.delayPeriod !== undefined && object.delayPeriod !== null
                ? BigInt(object.delayPeriod.toString())
                : BigInt(0);
        message.counterpartyVersions =
            object.counterpartyVersions?.map(e => Version.fromPartial(e)) || [];
        message.proofHeight =
            object.proofHeight !== undefined && object.proofHeight !== null
                ? Height.fromPartial(object.proofHeight)
                : undefined;
        message.proofInit = object.proofInit ?? new Uint8Array();
        message.proofClient = object.proofClient ?? new Uint8Array();
        message.proofConsensus = object.proofConsensus ?? new Uint8Array();
        message.consensusHeight =
            object.consensusHeight !== undefined && object.consensusHeight !== null
                ? Height.fromPartial(object.consensusHeight)
                : undefined;
        message.signer = object.signer ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return MsgConnectionOpenTry.decode(message.value);
    },
    toProto(message) {
        return MsgConnectionOpenTry.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.core.connection.v1.MsgConnectionOpenTry',
            value: MsgConnectionOpenTry.encode(message).finish(),
        };
    },
};
function createBaseMsgConnectionOpenTryResponse() {
    return {};
}
export const MsgConnectionOpenTryResponse = {
    typeUrl: '/ibc.core.connection.v1.MsgConnectionOpenTryResponse',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgConnectionOpenTryResponse();
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
        const message = createBaseMsgConnectionOpenTryResponse();
        return message;
    },
    fromProtoMsg(message) {
        return MsgConnectionOpenTryResponse.decode(message.value);
    },
    toProto(message) {
        return MsgConnectionOpenTryResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.core.connection.v1.MsgConnectionOpenTryResponse',
            value: MsgConnectionOpenTryResponse.encode(message).finish(),
        };
    },
};
function createBaseMsgConnectionOpenAck() {
    return {
        connectionId: '',
        counterpartyConnectionId: '',
        version: undefined,
        clientState: undefined,
        proofHeight: Height.fromPartial({}),
        proofTry: new Uint8Array(),
        proofClient: new Uint8Array(),
        proofConsensus: new Uint8Array(),
        consensusHeight: Height.fromPartial({}),
        signer: '',
    };
}
export const MsgConnectionOpenAck = {
    typeUrl: '/ibc.core.connection.v1.MsgConnectionOpenAck',
    encode(message, writer = BinaryWriter.create()) {
        if (message.connectionId !== '') {
            writer.uint32(10).string(message.connectionId);
        }
        if (message.counterpartyConnectionId !== '') {
            writer.uint32(18).string(message.counterpartyConnectionId);
        }
        if (message.version !== undefined) {
            Version.encode(message.version, writer.uint32(26).fork()).ldelim();
        }
        if (message.clientState !== undefined) {
            Any.encode(message.clientState, writer.uint32(34).fork()).ldelim();
        }
        if (message.proofHeight !== undefined) {
            Height.encode(message.proofHeight, writer.uint32(42).fork()).ldelim();
        }
        if (message.proofTry.length !== 0) {
            writer.uint32(50).bytes(message.proofTry);
        }
        if (message.proofClient.length !== 0) {
            writer.uint32(58).bytes(message.proofClient);
        }
        if (message.proofConsensus.length !== 0) {
            writer.uint32(66).bytes(message.proofConsensus);
        }
        if (message.consensusHeight !== undefined) {
            Height.encode(message.consensusHeight, writer.uint32(74).fork()).ldelim();
        }
        if (message.signer !== '') {
            writer.uint32(82).string(message.signer);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgConnectionOpenAck();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.connectionId = reader.string();
                    break;
                case 2:
                    message.counterpartyConnectionId = reader.string();
                    break;
                case 3:
                    message.version = Version.decode(reader, reader.uint32());
                    break;
                case 4:
                    message.clientState = Any.decode(reader, reader.uint32());
                    break;
                case 5:
                    message.proofHeight = Height.decode(reader, reader.uint32());
                    break;
                case 6:
                    message.proofTry = reader.bytes();
                    break;
                case 7:
                    message.proofClient = reader.bytes();
                    break;
                case 8:
                    message.proofConsensus = reader.bytes();
                    break;
                case 9:
                    message.consensusHeight = Height.decode(reader, reader.uint32());
                    break;
                case 10:
                    message.signer = reader.string();
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
            counterpartyConnectionId: isSet(object.counterpartyConnectionId)
                ? String(object.counterpartyConnectionId)
                : '',
            version: isSet(object.version)
                ? Version.fromJSON(object.version)
                : undefined,
            clientState: isSet(object.clientState)
                ? Any.fromJSON(object.clientState)
                : undefined,
            proofHeight: isSet(object.proofHeight)
                ? Height.fromJSON(object.proofHeight)
                : undefined,
            proofTry: isSet(object.proofTry)
                ? bytesFromBase64(object.proofTry)
                : new Uint8Array(),
            proofClient: isSet(object.proofClient)
                ? bytesFromBase64(object.proofClient)
                : new Uint8Array(),
            proofConsensus: isSet(object.proofConsensus)
                ? bytesFromBase64(object.proofConsensus)
                : new Uint8Array(),
            consensusHeight: isSet(object.consensusHeight)
                ? Height.fromJSON(object.consensusHeight)
                : undefined,
            signer: isSet(object.signer) ? String(object.signer) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.connectionId !== undefined &&
            (obj.connectionId = message.connectionId);
        message.counterpartyConnectionId !== undefined &&
            (obj.counterpartyConnectionId = message.counterpartyConnectionId);
        message.version !== undefined &&
            (obj.version = message.version
                ? Version.toJSON(message.version)
                : undefined);
        message.clientState !== undefined &&
            (obj.clientState = message.clientState
                ? Any.toJSON(message.clientState)
                : undefined);
        message.proofHeight !== undefined &&
            (obj.proofHeight = message.proofHeight
                ? Height.toJSON(message.proofHeight)
                : undefined);
        message.proofTry !== undefined &&
            (obj.proofTry = base64FromBytes(message.proofTry !== undefined ? message.proofTry : new Uint8Array()));
        message.proofClient !== undefined &&
            (obj.proofClient = base64FromBytes(message.proofClient !== undefined
                ? message.proofClient
                : new Uint8Array()));
        message.proofConsensus !== undefined &&
            (obj.proofConsensus = base64FromBytes(message.proofConsensus !== undefined
                ? message.proofConsensus
                : new Uint8Array()));
        message.consensusHeight !== undefined &&
            (obj.consensusHeight = message.consensusHeight
                ? Height.toJSON(message.consensusHeight)
                : undefined);
        message.signer !== undefined && (obj.signer = message.signer);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgConnectionOpenAck();
        message.connectionId = object.connectionId ?? '';
        message.counterpartyConnectionId = object.counterpartyConnectionId ?? '';
        message.version =
            object.version !== undefined && object.version !== null
                ? Version.fromPartial(object.version)
                : undefined;
        message.clientState =
            object.clientState !== undefined && object.clientState !== null
                ? Any.fromPartial(object.clientState)
                : undefined;
        message.proofHeight =
            object.proofHeight !== undefined && object.proofHeight !== null
                ? Height.fromPartial(object.proofHeight)
                : undefined;
        message.proofTry = object.proofTry ?? new Uint8Array();
        message.proofClient = object.proofClient ?? new Uint8Array();
        message.proofConsensus = object.proofConsensus ?? new Uint8Array();
        message.consensusHeight =
            object.consensusHeight !== undefined && object.consensusHeight !== null
                ? Height.fromPartial(object.consensusHeight)
                : undefined;
        message.signer = object.signer ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return MsgConnectionOpenAck.decode(message.value);
    },
    toProto(message) {
        return MsgConnectionOpenAck.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.core.connection.v1.MsgConnectionOpenAck',
            value: MsgConnectionOpenAck.encode(message).finish(),
        };
    },
};
function createBaseMsgConnectionOpenAckResponse() {
    return {};
}
export const MsgConnectionOpenAckResponse = {
    typeUrl: '/ibc.core.connection.v1.MsgConnectionOpenAckResponse',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgConnectionOpenAckResponse();
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
        const message = createBaseMsgConnectionOpenAckResponse();
        return message;
    },
    fromProtoMsg(message) {
        return MsgConnectionOpenAckResponse.decode(message.value);
    },
    toProto(message) {
        return MsgConnectionOpenAckResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.core.connection.v1.MsgConnectionOpenAckResponse',
            value: MsgConnectionOpenAckResponse.encode(message).finish(),
        };
    },
};
function createBaseMsgConnectionOpenConfirm() {
    return {
        connectionId: '',
        proofAck: new Uint8Array(),
        proofHeight: Height.fromPartial({}),
        signer: '',
    };
}
export const MsgConnectionOpenConfirm = {
    typeUrl: '/ibc.core.connection.v1.MsgConnectionOpenConfirm',
    encode(message, writer = BinaryWriter.create()) {
        if (message.connectionId !== '') {
            writer.uint32(10).string(message.connectionId);
        }
        if (message.proofAck.length !== 0) {
            writer.uint32(18).bytes(message.proofAck);
        }
        if (message.proofHeight !== undefined) {
            Height.encode(message.proofHeight, writer.uint32(26).fork()).ldelim();
        }
        if (message.signer !== '') {
            writer.uint32(34).string(message.signer);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgConnectionOpenConfirm();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.connectionId = reader.string();
                    break;
                case 2:
                    message.proofAck = reader.bytes();
                    break;
                case 3:
                    message.proofHeight = Height.decode(reader, reader.uint32());
                    break;
                case 4:
                    message.signer = reader.string();
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
            proofAck: isSet(object.proofAck)
                ? bytesFromBase64(object.proofAck)
                : new Uint8Array(),
            proofHeight: isSet(object.proofHeight)
                ? Height.fromJSON(object.proofHeight)
                : undefined,
            signer: isSet(object.signer) ? String(object.signer) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.connectionId !== undefined &&
            (obj.connectionId = message.connectionId);
        message.proofAck !== undefined &&
            (obj.proofAck = base64FromBytes(message.proofAck !== undefined ? message.proofAck : new Uint8Array()));
        message.proofHeight !== undefined &&
            (obj.proofHeight = message.proofHeight
                ? Height.toJSON(message.proofHeight)
                : undefined);
        message.signer !== undefined && (obj.signer = message.signer);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgConnectionOpenConfirm();
        message.connectionId = object.connectionId ?? '';
        message.proofAck = object.proofAck ?? new Uint8Array();
        message.proofHeight =
            object.proofHeight !== undefined && object.proofHeight !== null
                ? Height.fromPartial(object.proofHeight)
                : undefined;
        message.signer = object.signer ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return MsgConnectionOpenConfirm.decode(message.value);
    },
    toProto(message) {
        return MsgConnectionOpenConfirm.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.core.connection.v1.MsgConnectionOpenConfirm',
            value: MsgConnectionOpenConfirm.encode(message).finish(),
        };
    },
};
function createBaseMsgConnectionOpenConfirmResponse() {
    return {};
}
export const MsgConnectionOpenConfirmResponse = {
    typeUrl: '/ibc.core.connection.v1.MsgConnectionOpenConfirmResponse',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgConnectionOpenConfirmResponse();
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
        const message = createBaseMsgConnectionOpenConfirmResponse();
        return message;
    },
    fromProtoMsg(message) {
        return MsgConnectionOpenConfirmResponse.decode(message.value);
    },
    toProto(message) {
        return MsgConnectionOpenConfirmResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.core.connection.v1.MsgConnectionOpenConfirmResponse',
            value: MsgConnectionOpenConfirmResponse.encode(message).finish(),
        };
    },
};
//# sourceMappingURL=tx.js.map