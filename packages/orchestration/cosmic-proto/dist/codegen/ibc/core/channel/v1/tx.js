//@ts-nocheck
import { Channel, Packet, } from './channel.js';
import { Height } from '../../client/v1/client.js';
import { BinaryReader, BinaryWriter } from '../../../../binary.js';
import { isSet, bytesFromBase64, base64FromBytes, } from '../../../../helpers.js';
import {} from '../../../../json-safe.js';
/** ResponseResultType defines the possible outcomes of the execution of a message */
export var ResponseResultType;
(function (ResponseResultType) {
    /** RESPONSE_RESULT_TYPE_UNSPECIFIED - Default zero value enumeration */
    ResponseResultType[ResponseResultType["RESPONSE_RESULT_TYPE_UNSPECIFIED"] = 0] = "RESPONSE_RESULT_TYPE_UNSPECIFIED";
    /** RESPONSE_RESULT_TYPE_NOOP - The message did not call the IBC application callbacks (because, for example, the packet had already been relayed) */
    ResponseResultType[ResponseResultType["RESPONSE_RESULT_TYPE_NOOP"] = 1] = "RESPONSE_RESULT_TYPE_NOOP";
    /** RESPONSE_RESULT_TYPE_SUCCESS - The message was executed successfully */
    ResponseResultType[ResponseResultType["RESPONSE_RESULT_TYPE_SUCCESS"] = 2] = "RESPONSE_RESULT_TYPE_SUCCESS";
    ResponseResultType[ResponseResultType["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
})(ResponseResultType || (ResponseResultType = {}));
export const ResponseResultTypeSDKType = ResponseResultType;
export function responseResultTypeFromJSON(object) {
    switch (object) {
        case 0:
        case 'RESPONSE_RESULT_TYPE_UNSPECIFIED':
            return ResponseResultType.RESPONSE_RESULT_TYPE_UNSPECIFIED;
        case 1:
        case 'RESPONSE_RESULT_TYPE_NOOP':
            return ResponseResultType.RESPONSE_RESULT_TYPE_NOOP;
        case 2:
        case 'RESPONSE_RESULT_TYPE_SUCCESS':
            return ResponseResultType.RESPONSE_RESULT_TYPE_SUCCESS;
        case -1:
        case 'UNRECOGNIZED':
        default:
            return ResponseResultType.UNRECOGNIZED;
    }
}
export function responseResultTypeToJSON(object) {
    switch (object) {
        case ResponseResultType.RESPONSE_RESULT_TYPE_UNSPECIFIED:
            return 'RESPONSE_RESULT_TYPE_UNSPECIFIED';
        case ResponseResultType.RESPONSE_RESULT_TYPE_NOOP:
            return 'RESPONSE_RESULT_TYPE_NOOP';
        case ResponseResultType.RESPONSE_RESULT_TYPE_SUCCESS:
            return 'RESPONSE_RESULT_TYPE_SUCCESS';
        case ResponseResultType.UNRECOGNIZED:
        default:
            return 'UNRECOGNIZED';
    }
}
function createBaseMsgChannelOpenInit() {
    return {
        portId: '',
        channel: Channel.fromPartial({}),
        signer: '',
    };
}
export const MsgChannelOpenInit = {
    typeUrl: '/ibc.core.channel.v1.MsgChannelOpenInit',
    encode(message, writer = BinaryWriter.create()) {
        if (message.portId !== '') {
            writer.uint32(10).string(message.portId);
        }
        if (message.channel !== undefined) {
            Channel.encode(message.channel, writer.uint32(18).fork()).ldelim();
        }
        if (message.signer !== '') {
            writer.uint32(26).string(message.signer);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgChannelOpenInit();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.portId = reader.string();
                    break;
                case 2:
                    message.channel = Channel.decode(reader, reader.uint32());
                    break;
                case 3:
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
            portId: isSet(object.portId) ? String(object.portId) : '',
            channel: isSet(object.channel)
                ? Channel.fromJSON(object.channel)
                : undefined,
            signer: isSet(object.signer) ? String(object.signer) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.portId !== undefined && (obj.portId = message.portId);
        message.channel !== undefined &&
            (obj.channel = message.channel
                ? Channel.toJSON(message.channel)
                : undefined);
        message.signer !== undefined && (obj.signer = message.signer);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgChannelOpenInit();
        message.portId = object.portId ?? '';
        message.channel =
            object.channel !== undefined && object.channel !== null
                ? Channel.fromPartial(object.channel)
                : undefined;
        message.signer = object.signer ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return MsgChannelOpenInit.decode(message.value);
    },
    toProto(message) {
        return MsgChannelOpenInit.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.core.channel.v1.MsgChannelOpenInit',
            value: MsgChannelOpenInit.encode(message).finish(),
        };
    },
};
function createBaseMsgChannelOpenInitResponse() {
    return {
        channelId: '',
        version: '',
    };
}
export const MsgChannelOpenInitResponse = {
    typeUrl: '/ibc.core.channel.v1.MsgChannelOpenInitResponse',
    encode(message, writer = BinaryWriter.create()) {
        if (message.channelId !== '') {
            writer.uint32(10).string(message.channelId);
        }
        if (message.version !== '') {
            writer.uint32(18).string(message.version);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgChannelOpenInitResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.channelId = reader.string();
                    break;
                case 2:
                    message.version = reader.string();
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
            channelId: isSet(object.channelId) ? String(object.channelId) : '',
            version: isSet(object.version) ? String(object.version) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.channelId !== undefined && (obj.channelId = message.channelId);
        message.version !== undefined && (obj.version = message.version);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgChannelOpenInitResponse();
        message.channelId = object.channelId ?? '';
        message.version = object.version ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return MsgChannelOpenInitResponse.decode(message.value);
    },
    toProto(message) {
        return MsgChannelOpenInitResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.core.channel.v1.MsgChannelOpenInitResponse',
            value: MsgChannelOpenInitResponse.encode(message).finish(),
        };
    },
};
function createBaseMsgChannelOpenTry() {
    return {
        portId: '',
        previousChannelId: '',
        channel: Channel.fromPartial({}),
        counterpartyVersion: '',
        proofInit: new Uint8Array(),
        proofHeight: Height.fromPartial({}),
        signer: '',
    };
}
export const MsgChannelOpenTry = {
    typeUrl: '/ibc.core.channel.v1.MsgChannelOpenTry',
    encode(message, writer = BinaryWriter.create()) {
        if (message.portId !== '') {
            writer.uint32(10).string(message.portId);
        }
        if (message.previousChannelId !== '') {
            writer.uint32(18).string(message.previousChannelId);
        }
        if (message.channel !== undefined) {
            Channel.encode(message.channel, writer.uint32(26).fork()).ldelim();
        }
        if (message.counterpartyVersion !== '') {
            writer.uint32(34).string(message.counterpartyVersion);
        }
        if (message.proofInit.length !== 0) {
            writer.uint32(42).bytes(message.proofInit);
        }
        if (message.proofHeight !== undefined) {
            Height.encode(message.proofHeight, writer.uint32(50).fork()).ldelim();
        }
        if (message.signer !== '') {
            writer.uint32(58).string(message.signer);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgChannelOpenTry();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.portId = reader.string();
                    break;
                case 2:
                    message.previousChannelId = reader.string();
                    break;
                case 3:
                    message.channel = Channel.decode(reader, reader.uint32());
                    break;
                case 4:
                    message.counterpartyVersion = reader.string();
                    break;
                case 5:
                    message.proofInit = reader.bytes();
                    break;
                case 6:
                    message.proofHeight = Height.decode(reader, reader.uint32());
                    break;
                case 7:
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
            portId: isSet(object.portId) ? String(object.portId) : '',
            previousChannelId: isSet(object.previousChannelId)
                ? String(object.previousChannelId)
                : '',
            channel: isSet(object.channel)
                ? Channel.fromJSON(object.channel)
                : undefined,
            counterpartyVersion: isSet(object.counterpartyVersion)
                ? String(object.counterpartyVersion)
                : '',
            proofInit: isSet(object.proofInit)
                ? bytesFromBase64(object.proofInit)
                : new Uint8Array(),
            proofHeight: isSet(object.proofHeight)
                ? Height.fromJSON(object.proofHeight)
                : undefined,
            signer: isSet(object.signer) ? String(object.signer) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.portId !== undefined && (obj.portId = message.portId);
        message.previousChannelId !== undefined &&
            (obj.previousChannelId = message.previousChannelId);
        message.channel !== undefined &&
            (obj.channel = message.channel
                ? Channel.toJSON(message.channel)
                : undefined);
        message.counterpartyVersion !== undefined &&
            (obj.counterpartyVersion = message.counterpartyVersion);
        message.proofInit !== undefined &&
            (obj.proofInit = base64FromBytes(message.proofInit !== undefined ? message.proofInit : new Uint8Array()));
        message.proofHeight !== undefined &&
            (obj.proofHeight = message.proofHeight
                ? Height.toJSON(message.proofHeight)
                : undefined);
        message.signer !== undefined && (obj.signer = message.signer);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgChannelOpenTry();
        message.portId = object.portId ?? '';
        message.previousChannelId = object.previousChannelId ?? '';
        message.channel =
            object.channel !== undefined && object.channel !== null
                ? Channel.fromPartial(object.channel)
                : undefined;
        message.counterpartyVersion = object.counterpartyVersion ?? '';
        message.proofInit = object.proofInit ?? new Uint8Array();
        message.proofHeight =
            object.proofHeight !== undefined && object.proofHeight !== null
                ? Height.fromPartial(object.proofHeight)
                : undefined;
        message.signer = object.signer ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return MsgChannelOpenTry.decode(message.value);
    },
    toProto(message) {
        return MsgChannelOpenTry.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.core.channel.v1.MsgChannelOpenTry',
            value: MsgChannelOpenTry.encode(message).finish(),
        };
    },
};
function createBaseMsgChannelOpenTryResponse() {
    return {
        version: '',
    };
}
export const MsgChannelOpenTryResponse = {
    typeUrl: '/ibc.core.channel.v1.MsgChannelOpenTryResponse',
    encode(message, writer = BinaryWriter.create()) {
        if (message.version !== '') {
            writer.uint32(10).string(message.version);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgChannelOpenTryResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.version = reader.string();
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
            version: isSet(object.version) ? String(object.version) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.version !== undefined && (obj.version = message.version);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgChannelOpenTryResponse();
        message.version = object.version ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return MsgChannelOpenTryResponse.decode(message.value);
    },
    toProto(message) {
        return MsgChannelOpenTryResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.core.channel.v1.MsgChannelOpenTryResponse',
            value: MsgChannelOpenTryResponse.encode(message).finish(),
        };
    },
};
function createBaseMsgChannelOpenAck() {
    return {
        portId: '',
        channelId: '',
        counterpartyChannelId: '',
        counterpartyVersion: '',
        proofTry: new Uint8Array(),
        proofHeight: Height.fromPartial({}),
        signer: '',
    };
}
export const MsgChannelOpenAck = {
    typeUrl: '/ibc.core.channel.v1.MsgChannelOpenAck',
    encode(message, writer = BinaryWriter.create()) {
        if (message.portId !== '') {
            writer.uint32(10).string(message.portId);
        }
        if (message.channelId !== '') {
            writer.uint32(18).string(message.channelId);
        }
        if (message.counterpartyChannelId !== '') {
            writer.uint32(26).string(message.counterpartyChannelId);
        }
        if (message.counterpartyVersion !== '') {
            writer.uint32(34).string(message.counterpartyVersion);
        }
        if (message.proofTry.length !== 0) {
            writer.uint32(42).bytes(message.proofTry);
        }
        if (message.proofHeight !== undefined) {
            Height.encode(message.proofHeight, writer.uint32(50).fork()).ldelim();
        }
        if (message.signer !== '') {
            writer.uint32(58).string(message.signer);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgChannelOpenAck();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.portId = reader.string();
                    break;
                case 2:
                    message.channelId = reader.string();
                    break;
                case 3:
                    message.counterpartyChannelId = reader.string();
                    break;
                case 4:
                    message.counterpartyVersion = reader.string();
                    break;
                case 5:
                    message.proofTry = reader.bytes();
                    break;
                case 6:
                    message.proofHeight = Height.decode(reader, reader.uint32());
                    break;
                case 7:
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
            portId: isSet(object.portId) ? String(object.portId) : '',
            channelId: isSet(object.channelId) ? String(object.channelId) : '',
            counterpartyChannelId: isSet(object.counterpartyChannelId)
                ? String(object.counterpartyChannelId)
                : '',
            counterpartyVersion: isSet(object.counterpartyVersion)
                ? String(object.counterpartyVersion)
                : '',
            proofTry: isSet(object.proofTry)
                ? bytesFromBase64(object.proofTry)
                : new Uint8Array(),
            proofHeight: isSet(object.proofHeight)
                ? Height.fromJSON(object.proofHeight)
                : undefined,
            signer: isSet(object.signer) ? String(object.signer) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.portId !== undefined && (obj.portId = message.portId);
        message.channelId !== undefined && (obj.channelId = message.channelId);
        message.counterpartyChannelId !== undefined &&
            (obj.counterpartyChannelId = message.counterpartyChannelId);
        message.counterpartyVersion !== undefined &&
            (obj.counterpartyVersion = message.counterpartyVersion);
        message.proofTry !== undefined &&
            (obj.proofTry = base64FromBytes(message.proofTry !== undefined ? message.proofTry : new Uint8Array()));
        message.proofHeight !== undefined &&
            (obj.proofHeight = message.proofHeight
                ? Height.toJSON(message.proofHeight)
                : undefined);
        message.signer !== undefined && (obj.signer = message.signer);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgChannelOpenAck();
        message.portId = object.portId ?? '';
        message.channelId = object.channelId ?? '';
        message.counterpartyChannelId = object.counterpartyChannelId ?? '';
        message.counterpartyVersion = object.counterpartyVersion ?? '';
        message.proofTry = object.proofTry ?? new Uint8Array();
        message.proofHeight =
            object.proofHeight !== undefined && object.proofHeight !== null
                ? Height.fromPartial(object.proofHeight)
                : undefined;
        message.signer = object.signer ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return MsgChannelOpenAck.decode(message.value);
    },
    toProto(message) {
        return MsgChannelOpenAck.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.core.channel.v1.MsgChannelOpenAck',
            value: MsgChannelOpenAck.encode(message).finish(),
        };
    },
};
function createBaseMsgChannelOpenAckResponse() {
    return {};
}
export const MsgChannelOpenAckResponse = {
    typeUrl: '/ibc.core.channel.v1.MsgChannelOpenAckResponse',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgChannelOpenAckResponse();
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
        const message = createBaseMsgChannelOpenAckResponse();
        return message;
    },
    fromProtoMsg(message) {
        return MsgChannelOpenAckResponse.decode(message.value);
    },
    toProto(message) {
        return MsgChannelOpenAckResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.core.channel.v1.MsgChannelOpenAckResponse',
            value: MsgChannelOpenAckResponse.encode(message).finish(),
        };
    },
};
function createBaseMsgChannelOpenConfirm() {
    return {
        portId: '',
        channelId: '',
        proofAck: new Uint8Array(),
        proofHeight: Height.fromPartial({}),
        signer: '',
    };
}
export const MsgChannelOpenConfirm = {
    typeUrl: '/ibc.core.channel.v1.MsgChannelOpenConfirm',
    encode(message, writer = BinaryWriter.create()) {
        if (message.portId !== '') {
            writer.uint32(10).string(message.portId);
        }
        if (message.channelId !== '') {
            writer.uint32(18).string(message.channelId);
        }
        if (message.proofAck.length !== 0) {
            writer.uint32(26).bytes(message.proofAck);
        }
        if (message.proofHeight !== undefined) {
            Height.encode(message.proofHeight, writer.uint32(34).fork()).ldelim();
        }
        if (message.signer !== '') {
            writer.uint32(42).string(message.signer);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgChannelOpenConfirm();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.portId = reader.string();
                    break;
                case 2:
                    message.channelId = reader.string();
                    break;
                case 3:
                    message.proofAck = reader.bytes();
                    break;
                case 4:
                    message.proofHeight = Height.decode(reader, reader.uint32());
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
            portId: isSet(object.portId) ? String(object.portId) : '',
            channelId: isSet(object.channelId) ? String(object.channelId) : '',
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
        message.portId !== undefined && (obj.portId = message.portId);
        message.channelId !== undefined && (obj.channelId = message.channelId);
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
        const message = createBaseMsgChannelOpenConfirm();
        message.portId = object.portId ?? '';
        message.channelId = object.channelId ?? '';
        message.proofAck = object.proofAck ?? new Uint8Array();
        message.proofHeight =
            object.proofHeight !== undefined && object.proofHeight !== null
                ? Height.fromPartial(object.proofHeight)
                : undefined;
        message.signer = object.signer ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return MsgChannelOpenConfirm.decode(message.value);
    },
    toProto(message) {
        return MsgChannelOpenConfirm.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.core.channel.v1.MsgChannelOpenConfirm',
            value: MsgChannelOpenConfirm.encode(message).finish(),
        };
    },
};
function createBaseMsgChannelOpenConfirmResponse() {
    return {};
}
export const MsgChannelOpenConfirmResponse = {
    typeUrl: '/ibc.core.channel.v1.MsgChannelOpenConfirmResponse',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgChannelOpenConfirmResponse();
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
        const message = createBaseMsgChannelOpenConfirmResponse();
        return message;
    },
    fromProtoMsg(message) {
        return MsgChannelOpenConfirmResponse.decode(message.value);
    },
    toProto(message) {
        return MsgChannelOpenConfirmResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.core.channel.v1.MsgChannelOpenConfirmResponse',
            value: MsgChannelOpenConfirmResponse.encode(message).finish(),
        };
    },
};
function createBaseMsgChannelCloseInit() {
    return {
        portId: '',
        channelId: '',
        signer: '',
    };
}
export const MsgChannelCloseInit = {
    typeUrl: '/ibc.core.channel.v1.MsgChannelCloseInit',
    encode(message, writer = BinaryWriter.create()) {
        if (message.portId !== '') {
            writer.uint32(10).string(message.portId);
        }
        if (message.channelId !== '') {
            writer.uint32(18).string(message.channelId);
        }
        if (message.signer !== '') {
            writer.uint32(26).string(message.signer);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgChannelCloseInit();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.portId = reader.string();
                    break;
                case 2:
                    message.channelId = reader.string();
                    break;
                case 3:
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
            portId: isSet(object.portId) ? String(object.portId) : '',
            channelId: isSet(object.channelId) ? String(object.channelId) : '',
            signer: isSet(object.signer) ? String(object.signer) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.portId !== undefined && (obj.portId = message.portId);
        message.channelId !== undefined && (obj.channelId = message.channelId);
        message.signer !== undefined && (obj.signer = message.signer);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgChannelCloseInit();
        message.portId = object.portId ?? '';
        message.channelId = object.channelId ?? '';
        message.signer = object.signer ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return MsgChannelCloseInit.decode(message.value);
    },
    toProto(message) {
        return MsgChannelCloseInit.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.core.channel.v1.MsgChannelCloseInit',
            value: MsgChannelCloseInit.encode(message).finish(),
        };
    },
};
function createBaseMsgChannelCloseInitResponse() {
    return {};
}
export const MsgChannelCloseInitResponse = {
    typeUrl: '/ibc.core.channel.v1.MsgChannelCloseInitResponse',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgChannelCloseInitResponse();
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
        const message = createBaseMsgChannelCloseInitResponse();
        return message;
    },
    fromProtoMsg(message) {
        return MsgChannelCloseInitResponse.decode(message.value);
    },
    toProto(message) {
        return MsgChannelCloseInitResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.core.channel.v1.MsgChannelCloseInitResponse',
            value: MsgChannelCloseInitResponse.encode(message).finish(),
        };
    },
};
function createBaseMsgChannelCloseConfirm() {
    return {
        portId: '',
        channelId: '',
        proofInit: new Uint8Array(),
        proofHeight: Height.fromPartial({}),
        signer: '',
    };
}
export const MsgChannelCloseConfirm = {
    typeUrl: '/ibc.core.channel.v1.MsgChannelCloseConfirm',
    encode(message, writer = BinaryWriter.create()) {
        if (message.portId !== '') {
            writer.uint32(10).string(message.portId);
        }
        if (message.channelId !== '') {
            writer.uint32(18).string(message.channelId);
        }
        if (message.proofInit.length !== 0) {
            writer.uint32(26).bytes(message.proofInit);
        }
        if (message.proofHeight !== undefined) {
            Height.encode(message.proofHeight, writer.uint32(34).fork()).ldelim();
        }
        if (message.signer !== '') {
            writer.uint32(42).string(message.signer);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgChannelCloseConfirm();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.portId = reader.string();
                    break;
                case 2:
                    message.channelId = reader.string();
                    break;
                case 3:
                    message.proofInit = reader.bytes();
                    break;
                case 4:
                    message.proofHeight = Height.decode(reader, reader.uint32());
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
            portId: isSet(object.portId) ? String(object.portId) : '',
            channelId: isSet(object.channelId) ? String(object.channelId) : '',
            proofInit: isSet(object.proofInit)
                ? bytesFromBase64(object.proofInit)
                : new Uint8Array(),
            proofHeight: isSet(object.proofHeight)
                ? Height.fromJSON(object.proofHeight)
                : undefined,
            signer: isSet(object.signer) ? String(object.signer) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.portId !== undefined && (obj.portId = message.portId);
        message.channelId !== undefined && (obj.channelId = message.channelId);
        message.proofInit !== undefined &&
            (obj.proofInit = base64FromBytes(message.proofInit !== undefined ? message.proofInit : new Uint8Array()));
        message.proofHeight !== undefined &&
            (obj.proofHeight = message.proofHeight
                ? Height.toJSON(message.proofHeight)
                : undefined);
        message.signer !== undefined && (obj.signer = message.signer);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgChannelCloseConfirm();
        message.portId = object.portId ?? '';
        message.channelId = object.channelId ?? '';
        message.proofInit = object.proofInit ?? new Uint8Array();
        message.proofHeight =
            object.proofHeight !== undefined && object.proofHeight !== null
                ? Height.fromPartial(object.proofHeight)
                : undefined;
        message.signer = object.signer ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return MsgChannelCloseConfirm.decode(message.value);
    },
    toProto(message) {
        return MsgChannelCloseConfirm.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.core.channel.v1.MsgChannelCloseConfirm',
            value: MsgChannelCloseConfirm.encode(message).finish(),
        };
    },
};
function createBaseMsgChannelCloseConfirmResponse() {
    return {};
}
export const MsgChannelCloseConfirmResponse = {
    typeUrl: '/ibc.core.channel.v1.MsgChannelCloseConfirmResponse',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgChannelCloseConfirmResponse();
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
        const message = createBaseMsgChannelCloseConfirmResponse();
        return message;
    },
    fromProtoMsg(message) {
        return MsgChannelCloseConfirmResponse.decode(message.value);
    },
    toProto(message) {
        return MsgChannelCloseConfirmResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.core.channel.v1.MsgChannelCloseConfirmResponse',
            value: MsgChannelCloseConfirmResponse.encode(message).finish(),
        };
    },
};
function createBaseMsgRecvPacket() {
    return {
        packet: Packet.fromPartial({}),
        proofCommitment: new Uint8Array(),
        proofHeight: Height.fromPartial({}),
        signer: '',
    };
}
export const MsgRecvPacket = {
    typeUrl: '/ibc.core.channel.v1.MsgRecvPacket',
    encode(message, writer = BinaryWriter.create()) {
        if (message.packet !== undefined) {
            Packet.encode(message.packet, writer.uint32(10).fork()).ldelim();
        }
        if (message.proofCommitment.length !== 0) {
            writer.uint32(18).bytes(message.proofCommitment);
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
        const message = createBaseMsgRecvPacket();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.packet = Packet.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.proofCommitment = reader.bytes();
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
            packet: isSet(object.packet) ? Packet.fromJSON(object.packet) : undefined,
            proofCommitment: isSet(object.proofCommitment)
                ? bytesFromBase64(object.proofCommitment)
                : new Uint8Array(),
            proofHeight: isSet(object.proofHeight)
                ? Height.fromJSON(object.proofHeight)
                : undefined,
            signer: isSet(object.signer) ? String(object.signer) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.packet !== undefined &&
            (obj.packet = message.packet ? Packet.toJSON(message.packet) : undefined);
        message.proofCommitment !== undefined &&
            (obj.proofCommitment = base64FromBytes(message.proofCommitment !== undefined
                ? message.proofCommitment
                : new Uint8Array()));
        message.proofHeight !== undefined &&
            (obj.proofHeight = message.proofHeight
                ? Height.toJSON(message.proofHeight)
                : undefined);
        message.signer !== undefined && (obj.signer = message.signer);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgRecvPacket();
        message.packet =
            object.packet !== undefined && object.packet !== null
                ? Packet.fromPartial(object.packet)
                : undefined;
        message.proofCommitment = object.proofCommitment ?? new Uint8Array();
        message.proofHeight =
            object.proofHeight !== undefined && object.proofHeight !== null
                ? Height.fromPartial(object.proofHeight)
                : undefined;
        message.signer = object.signer ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return MsgRecvPacket.decode(message.value);
    },
    toProto(message) {
        return MsgRecvPacket.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.core.channel.v1.MsgRecvPacket',
            value: MsgRecvPacket.encode(message).finish(),
        };
    },
};
function createBaseMsgRecvPacketResponse() {
    return {
        result: 0,
    };
}
export const MsgRecvPacketResponse = {
    typeUrl: '/ibc.core.channel.v1.MsgRecvPacketResponse',
    encode(message, writer = BinaryWriter.create()) {
        if (message.result !== 0) {
            writer.uint32(8).int32(message.result);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgRecvPacketResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.result = reader.int32();
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
            result: isSet(object.result)
                ? responseResultTypeFromJSON(object.result)
                : -1,
        };
    },
    toJSON(message) {
        const obj = {};
        message.result !== undefined &&
            (obj.result = responseResultTypeToJSON(message.result));
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgRecvPacketResponse();
        message.result = object.result ?? 0;
        return message;
    },
    fromProtoMsg(message) {
        return MsgRecvPacketResponse.decode(message.value);
    },
    toProto(message) {
        return MsgRecvPacketResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.core.channel.v1.MsgRecvPacketResponse',
            value: MsgRecvPacketResponse.encode(message).finish(),
        };
    },
};
function createBaseMsgTimeout() {
    return {
        packet: Packet.fromPartial({}),
        proofUnreceived: new Uint8Array(),
        proofHeight: Height.fromPartial({}),
        nextSequenceRecv: BigInt(0),
        signer: '',
    };
}
export const MsgTimeout = {
    typeUrl: '/ibc.core.channel.v1.MsgTimeout',
    encode(message, writer = BinaryWriter.create()) {
        if (message.packet !== undefined) {
            Packet.encode(message.packet, writer.uint32(10).fork()).ldelim();
        }
        if (message.proofUnreceived.length !== 0) {
            writer.uint32(18).bytes(message.proofUnreceived);
        }
        if (message.proofHeight !== undefined) {
            Height.encode(message.proofHeight, writer.uint32(26).fork()).ldelim();
        }
        if (message.nextSequenceRecv !== BigInt(0)) {
            writer.uint32(32).uint64(message.nextSequenceRecv);
        }
        if (message.signer !== '') {
            writer.uint32(42).string(message.signer);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgTimeout();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.packet = Packet.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.proofUnreceived = reader.bytes();
                    break;
                case 3:
                    message.proofHeight = Height.decode(reader, reader.uint32());
                    break;
                case 4:
                    message.nextSequenceRecv = reader.uint64();
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
            packet: isSet(object.packet) ? Packet.fromJSON(object.packet) : undefined,
            proofUnreceived: isSet(object.proofUnreceived)
                ? bytesFromBase64(object.proofUnreceived)
                : new Uint8Array(),
            proofHeight: isSet(object.proofHeight)
                ? Height.fromJSON(object.proofHeight)
                : undefined,
            nextSequenceRecv: isSet(object.nextSequenceRecv)
                ? BigInt(object.nextSequenceRecv.toString())
                : BigInt(0),
            signer: isSet(object.signer) ? String(object.signer) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.packet !== undefined &&
            (obj.packet = message.packet ? Packet.toJSON(message.packet) : undefined);
        message.proofUnreceived !== undefined &&
            (obj.proofUnreceived = base64FromBytes(message.proofUnreceived !== undefined
                ? message.proofUnreceived
                : new Uint8Array()));
        message.proofHeight !== undefined &&
            (obj.proofHeight = message.proofHeight
                ? Height.toJSON(message.proofHeight)
                : undefined);
        message.nextSequenceRecv !== undefined &&
            (obj.nextSequenceRecv = (message.nextSequenceRecv || BigInt(0)).toString());
        message.signer !== undefined && (obj.signer = message.signer);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgTimeout();
        message.packet =
            object.packet !== undefined && object.packet !== null
                ? Packet.fromPartial(object.packet)
                : undefined;
        message.proofUnreceived = object.proofUnreceived ?? new Uint8Array();
        message.proofHeight =
            object.proofHeight !== undefined && object.proofHeight !== null
                ? Height.fromPartial(object.proofHeight)
                : undefined;
        message.nextSequenceRecv =
            object.nextSequenceRecv !== undefined && object.nextSequenceRecv !== null
                ? BigInt(object.nextSequenceRecv.toString())
                : BigInt(0);
        message.signer = object.signer ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return MsgTimeout.decode(message.value);
    },
    toProto(message) {
        return MsgTimeout.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.core.channel.v1.MsgTimeout',
            value: MsgTimeout.encode(message).finish(),
        };
    },
};
function createBaseMsgTimeoutResponse() {
    return {
        result: 0,
    };
}
export const MsgTimeoutResponse = {
    typeUrl: '/ibc.core.channel.v1.MsgTimeoutResponse',
    encode(message, writer = BinaryWriter.create()) {
        if (message.result !== 0) {
            writer.uint32(8).int32(message.result);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgTimeoutResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.result = reader.int32();
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
            result: isSet(object.result)
                ? responseResultTypeFromJSON(object.result)
                : -1,
        };
    },
    toJSON(message) {
        const obj = {};
        message.result !== undefined &&
            (obj.result = responseResultTypeToJSON(message.result));
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgTimeoutResponse();
        message.result = object.result ?? 0;
        return message;
    },
    fromProtoMsg(message) {
        return MsgTimeoutResponse.decode(message.value);
    },
    toProto(message) {
        return MsgTimeoutResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.core.channel.v1.MsgTimeoutResponse',
            value: MsgTimeoutResponse.encode(message).finish(),
        };
    },
};
function createBaseMsgTimeoutOnClose() {
    return {
        packet: Packet.fromPartial({}),
        proofUnreceived: new Uint8Array(),
        proofClose: new Uint8Array(),
        proofHeight: Height.fromPartial({}),
        nextSequenceRecv: BigInt(0),
        signer: '',
    };
}
export const MsgTimeoutOnClose = {
    typeUrl: '/ibc.core.channel.v1.MsgTimeoutOnClose',
    encode(message, writer = BinaryWriter.create()) {
        if (message.packet !== undefined) {
            Packet.encode(message.packet, writer.uint32(10).fork()).ldelim();
        }
        if (message.proofUnreceived.length !== 0) {
            writer.uint32(18).bytes(message.proofUnreceived);
        }
        if (message.proofClose.length !== 0) {
            writer.uint32(26).bytes(message.proofClose);
        }
        if (message.proofHeight !== undefined) {
            Height.encode(message.proofHeight, writer.uint32(34).fork()).ldelim();
        }
        if (message.nextSequenceRecv !== BigInt(0)) {
            writer.uint32(40).uint64(message.nextSequenceRecv);
        }
        if (message.signer !== '') {
            writer.uint32(50).string(message.signer);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgTimeoutOnClose();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.packet = Packet.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.proofUnreceived = reader.bytes();
                    break;
                case 3:
                    message.proofClose = reader.bytes();
                    break;
                case 4:
                    message.proofHeight = Height.decode(reader, reader.uint32());
                    break;
                case 5:
                    message.nextSequenceRecv = reader.uint64();
                    break;
                case 6:
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
            packet: isSet(object.packet) ? Packet.fromJSON(object.packet) : undefined,
            proofUnreceived: isSet(object.proofUnreceived)
                ? bytesFromBase64(object.proofUnreceived)
                : new Uint8Array(),
            proofClose: isSet(object.proofClose)
                ? bytesFromBase64(object.proofClose)
                : new Uint8Array(),
            proofHeight: isSet(object.proofHeight)
                ? Height.fromJSON(object.proofHeight)
                : undefined,
            nextSequenceRecv: isSet(object.nextSequenceRecv)
                ? BigInt(object.nextSequenceRecv.toString())
                : BigInt(0),
            signer: isSet(object.signer) ? String(object.signer) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.packet !== undefined &&
            (obj.packet = message.packet ? Packet.toJSON(message.packet) : undefined);
        message.proofUnreceived !== undefined &&
            (obj.proofUnreceived = base64FromBytes(message.proofUnreceived !== undefined
                ? message.proofUnreceived
                : new Uint8Array()));
        message.proofClose !== undefined &&
            (obj.proofClose = base64FromBytes(message.proofClose !== undefined
                ? message.proofClose
                : new Uint8Array()));
        message.proofHeight !== undefined &&
            (obj.proofHeight = message.proofHeight
                ? Height.toJSON(message.proofHeight)
                : undefined);
        message.nextSequenceRecv !== undefined &&
            (obj.nextSequenceRecv = (message.nextSequenceRecv || BigInt(0)).toString());
        message.signer !== undefined && (obj.signer = message.signer);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgTimeoutOnClose();
        message.packet =
            object.packet !== undefined && object.packet !== null
                ? Packet.fromPartial(object.packet)
                : undefined;
        message.proofUnreceived = object.proofUnreceived ?? new Uint8Array();
        message.proofClose = object.proofClose ?? new Uint8Array();
        message.proofHeight =
            object.proofHeight !== undefined && object.proofHeight !== null
                ? Height.fromPartial(object.proofHeight)
                : undefined;
        message.nextSequenceRecv =
            object.nextSequenceRecv !== undefined && object.nextSequenceRecv !== null
                ? BigInt(object.nextSequenceRecv.toString())
                : BigInt(0);
        message.signer = object.signer ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return MsgTimeoutOnClose.decode(message.value);
    },
    toProto(message) {
        return MsgTimeoutOnClose.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.core.channel.v1.MsgTimeoutOnClose',
            value: MsgTimeoutOnClose.encode(message).finish(),
        };
    },
};
function createBaseMsgTimeoutOnCloseResponse() {
    return {
        result: 0,
    };
}
export const MsgTimeoutOnCloseResponse = {
    typeUrl: '/ibc.core.channel.v1.MsgTimeoutOnCloseResponse',
    encode(message, writer = BinaryWriter.create()) {
        if (message.result !== 0) {
            writer.uint32(8).int32(message.result);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgTimeoutOnCloseResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.result = reader.int32();
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
            result: isSet(object.result)
                ? responseResultTypeFromJSON(object.result)
                : -1,
        };
    },
    toJSON(message) {
        const obj = {};
        message.result !== undefined &&
            (obj.result = responseResultTypeToJSON(message.result));
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgTimeoutOnCloseResponse();
        message.result = object.result ?? 0;
        return message;
    },
    fromProtoMsg(message) {
        return MsgTimeoutOnCloseResponse.decode(message.value);
    },
    toProto(message) {
        return MsgTimeoutOnCloseResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.core.channel.v1.MsgTimeoutOnCloseResponse',
            value: MsgTimeoutOnCloseResponse.encode(message).finish(),
        };
    },
};
function createBaseMsgAcknowledgement() {
    return {
        packet: Packet.fromPartial({}),
        acknowledgement: new Uint8Array(),
        proofAcked: new Uint8Array(),
        proofHeight: Height.fromPartial({}),
        signer: '',
    };
}
export const MsgAcknowledgement = {
    typeUrl: '/ibc.core.channel.v1.MsgAcknowledgement',
    encode(message, writer = BinaryWriter.create()) {
        if (message.packet !== undefined) {
            Packet.encode(message.packet, writer.uint32(10).fork()).ldelim();
        }
        if (message.acknowledgement.length !== 0) {
            writer.uint32(18).bytes(message.acknowledgement);
        }
        if (message.proofAcked.length !== 0) {
            writer.uint32(26).bytes(message.proofAcked);
        }
        if (message.proofHeight !== undefined) {
            Height.encode(message.proofHeight, writer.uint32(34).fork()).ldelim();
        }
        if (message.signer !== '') {
            writer.uint32(42).string(message.signer);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgAcknowledgement();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.packet = Packet.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.acknowledgement = reader.bytes();
                    break;
                case 3:
                    message.proofAcked = reader.bytes();
                    break;
                case 4:
                    message.proofHeight = Height.decode(reader, reader.uint32());
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
            packet: isSet(object.packet) ? Packet.fromJSON(object.packet) : undefined,
            acknowledgement: isSet(object.acknowledgement)
                ? bytesFromBase64(object.acknowledgement)
                : new Uint8Array(),
            proofAcked: isSet(object.proofAcked)
                ? bytesFromBase64(object.proofAcked)
                : new Uint8Array(),
            proofHeight: isSet(object.proofHeight)
                ? Height.fromJSON(object.proofHeight)
                : undefined,
            signer: isSet(object.signer) ? String(object.signer) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.packet !== undefined &&
            (obj.packet = message.packet ? Packet.toJSON(message.packet) : undefined);
        message.acknowledgement !== undefined &&
            (obj.acknowledgement = base64FromBytes(message.acknowledgement !== undefined
                ? message.acknowledgement
                : new Uint8Array()));
        message.proofAcked !== undefined &&
            (obj.proofAcked = base64FromBytes(message.proofAcked !== undefined
                ? message.proofAcked
                : new Uint8Array()));
        message.proofHeight !== undefined &&
            (obj.proofHeight = message.proofHeight
                ? Height.toJSON(message.proofHeight)
                : undefined);
        message.signer !== undefined && (obj.signer = message.signer);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgAcknowledgement();
        message.packet =
            object.packet !== undefined && object.packet !== null
                ? Packet.fromPartial(object.packet)
                : undefined;
        message.acknowledgement = object.acknowledgement ?? new Uint8Array();
        message.proofAcked = object.proofAcked ?? new Uint8Array();
        message.proofHeight =
            object.proofHeight !== undefined && object.proofHeight !== null
                ? Height.fromPartial(object.proofHeight)
                : undefined;
        message.signer = object.signer ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return MsgAcknowledgement.decode(message.value);
    },
    toProto(message) {
        return MsgAcknowledgement.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.core.channel.v1.MsgAcknowledgement',
            value: MsgAcknowledgement.encode(message).finish(),
        };
    },
};
function createBaseMsgAcknowledgementResponse() {
    return {
        result: 0,
    };
}
export const MsgAcknowledgementResponse = {
    typeUrl: '/ibc.core.channel.v1.MsgAcknowledgementResponse',
    encode(message, writer = BinaryWriter.create()) {
        if (message.result !== 0) {
            writer.uint32(8).int32(message.result);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgAcknowledgementResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.result = reader.int32();
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
            result: isSet(object.result)
                ? responseResultTypeFromJSON(object.result)
                : -1,
        };
    },
    toJSON(message) {
        const obj = {};
        message.result !== undefined &&
            (obj.result = responseResultTypeToJSON(message.result));
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgAcknowledgementResponse();
        message.result = object.result ?? 0;
        return message;
    },
    fromProtoMsg(message) {
        return MsgAcknowledgementResponse.decode(message.value);
    },
    toProto(message) {
        return MsgAcknowledgementResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.core.channel.v1.MsgAcknowledgementResponse',
            value: MsgAcknowledgementResponse.encode(message).finish(),
        };
    },
};
//# sourceMappingURL=tx.js.map