//@ts-nocheck
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { isSet } from '../../helpers.js';
import {} from '../../json-safe.js';
function createBaseMsgAddOracle() {
    return {
        creator: '',
        connectionId: '',
    };
}
export const MsgAddOracle = {
    typeUrl: '/stride.icaoracle.MsgAddOracle',
    encode(message, writer = BinaryWriter.create()) {
        if (message.creator !== '') {
            writer.uint32(10).string(message.creator);
        }
        if (message.connectionId !== '') {
            writer.uint32(18).string(message.connectionId);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgAddOracle();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.creator = reader.string();
                    break;
                case 2:
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
            creator: isSet(object.creator) ? String(object.creator) : '',
            connectionId: isSet(object.connectionId)
                ? String(object.connectionId)
                : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.creator !== undefined && (obj.creator = message.creator);
        message.connectionId !== undefined &&
            (obj.connectionId = message.connectionId);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgAddOracle();
        message.creator = object.creator ?? '';
        message.connectionId = object.connectionId ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return MsgAddOracle.decode(message.value);
    },
    toProto(message) {
        return MsgAddOracle.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.icaoracle.MsgAddOracle',
            value: MsgAddOracle.encode(message).finish(),
        };
    },
};
function createBaseMsgAddOracleResponse() {
    return {};
}
export const MsgAddOracleResponse = {
    typeUrl: '/stride.icaoracle.MsgAddOracleResponse',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgAddOracleResponse();
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
        const message = createBaseMsgAddOracleResponse();
        return message;
    },
    fromProtoMsg(message) {
        return MsgAddOracleResponse.decode(message.value);
    },
    toProto(message) {
        return MsgAddOracleResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.icaoracle.MsgAddOracleResponse',
            value: MsgAddOracleResponse.encode(message).finish(),
        };
    },
};
function createBaseMsgInstantiateOracle() {
    return {
        creator: '',
        oracleChainId: '',
        contractCodeId: BigInt(0),
        transferChannelOnOracle: '',
    };
}
export const MsgInstantiateOracle = {
    typeUrl: '/stride.icaoracle.MsgInstantiateOracle',
    encode(message, writer = BinaryWriter.create()) {
        if (message.creator !== '') {
            writer.uint32(10).string(message.creator);
        }
        if (message.oracleChainId !== '') {
            writer.uint32(18).string(message.oracleChainId);
        }
        if (message.contractCodeId !== BigInt(0)) {
            writer.uint32(24).uint64(message.contractCodeId);
        }
        if (message.transferChannelOnOracle !== '') {
            writer.uint32(34).string(message.transferChannelOnOracle);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgInstantiateOracle();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.creator = reader.string();
                    break;
                case 2:
                    message.oracleChainId = reader.string();
                    break;
                case 3:
                    message.contractCodeId = reader.uint64();
                    break;
                case 4:
                    message.transferChannelOnOracle = reader.string();
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
            creator: isSet(object.creator) ? String(object.creator) : '',
            oracleChainId: isSet(object.oracleChainId)
                ? String(object.oracleChainId)
                : '',
            contractCodeId: isSet(object.contractCodeId)
                ? BigInt(object.contractCodeId.toString())
                : BigInt(0),
            transferChannelOnOracle: isSet(object.transferChannelOnOracle)
                ? String(object.transferChannelOnOracle)
                : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.creator !== undefined && (obj.creator = message.creator);
        message.oracleChainId !== undefined &&
            (obj.oracleChainId = message.oracleChainId);
        message.contractCodeId !== undefined &&
            (obj.contractCodeId = (message.contractCodeId || BigInt(0)).toString());
        message.transferChannelOnOracle !== undefined &&
            (obj.transferChannelOnOracle = message.transferChannelOnOracle);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgInstantiateOracle();
        message.creator = object.creator ?? '';
        message.oracleChainId = object.oracleChainId ?? '';
        message.contractCodeId =
            object.contractCodeId !== undefined && object.contractCodeId !== null
                ? BigInt(object.contractCodeId.toString())
                : BigInt(0);
        message.transferChannelOnOracle = object.transferChannelOnOracle ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return MsgInstantiateOracle.decode(message.value);
    },
    toProto(message) {
        return MsgInstantiateOracle.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.icaoracle.MsgInstantiateOracle',
            value: MsgInstantiateOracle.encode(message).finish(),
        };
    },
};
function createBaseMsgInstantiateOracleResponse() {
    return {};
}
export const MsgInstantiateOracleResponse = {
    typeUrl: '/stride.icaoracle.MsgInstantiateOracleResponse',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgInstantiateOracleResponse();
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
        const message = createBaseMsgInstantiateOracleResponse();
        return message;
    },
    fromProtoMsg(message) {
        return MsgInstantiateOracleResponse.decode(message.value);
    },
    toProto(message) {
        return MsgInstantiateOracleResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.icaoracle.MsgInstantiateOracleResponse',
            value: MsgInstantiateOracleResponse.encode(message).finish(),
        };
    },
};
function createBaseMsgRestoreOracleICA() {
    return {
        creator: '',
        oracleChainId: '',
    };
}
export const MsgRestoreOracleICA = {
    typeUrl: '/stride.icaoracle.MsgRestoreOracleICA',
    encode(message, writer = BinaryWriter.create()) {
        if (message.creator !== '') {
            writer.uint32(10).string(message.creator);
        }
        if (message.oracleChainId !== '') {
            writer.uint32(18).string(message.oracleChainId);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgRestoreOracleICA();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.creator = reader.string();
                    break;
                case 2:
                    message.oracleChainId = reader.string();
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
            creator: isSet(object.creator) ? String(object.creator) : '',
            oracleChainId: isSet(object.oracleChainId)
                ? String(object.oracleChainId)
                : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.creator !== undefined && (obj.creator = message.creator);
        message.oracleChainId !== undefined &&
            (obj.oracleChainId = message.oracleChainId);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgRestoreOracleICA();
        message.creator = object.creator ?? '';
        message.oracleChainId = object.oracleChainId ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return MsgRestoreOracleICA.decode(message.value);
    },
    toProto(message) {
        return MsgRestoreOracleICA.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.icaoracle.MsgRestoreOracleICA',
            value: MsgRestoreOracleICA.encode(message).finish(),
        };
    },
};
function createBaseMsgRestoreOracleICAResponse() {
    return {};
}
export const MsgRestoreOracleICAResponse = {
    typeUrl: '/stride.icaoracle.MsgRestoreOracleICAResponse',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgRestoreOracleICAResponse();
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
        const message = createBaseMsgRestoreOracleICAResponse();
        return message;
    },
    fromProtoMsg(message) {
        return MsgRestoreOracleICAResponse.decode(message.value);
    },
    toProto(message) {
        return MsgRestoreOracleICAResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.icaoracle.MsgRestoreOracleICAResponse',
            value: MsgRestoreOracleICAResponse.encode(message).finish(),
        };
    },
};
function createBaseMsgToggleOracle() {
    return {
        authority: '',
        oracleChainId: '',
        active: false,
    };
}
export const MsgToggleOracle = {
    typeUrl: '/stride.icaoracle.MsgToggleOracle',
    encode(message, writer = BinaryWriter.create()) {
        if (message.authority !== '') {
            writer.uint32(10).string(message.authority);
        }
        if (message.oracleChainId !== '') {
            writer.uint32(18).string(message.oracleChainId);
        }
        if (message.active === true) {
            writer.uint32(24).bool(message.active);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgToggleOracle();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.authority = reader.string();
                    break;
                case 2:
                    message.oracleChainId = reader.string();
                    break;
                case 3:
                    message.active = reader.bool();
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
            authority: isSet(object.authority) ? String(object.authority) : '',
            oracleChainId: isSet(object.oracleChainId)
                ? String(object.oracleChainId)
                : '',
            active: isSet(object.active) ? Boolean(object.active) : false,
        };
    },
    toJSON(message) {
        const obj = {};
        message.authority !== undefined && (obj.authority = message.authority);
        message.oracleChainId !== undefined &&
            (obj.oracleChainId = message.oracleChainId);
        message.active !== undefined && (obj.active = message.active);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgToggleOracle();
        message.authority = object.authority ?? '';
        message.oracleChainId = object.oracleChainId ?? '';
        message.active = object.active ?? false;
        return message;
    },
    fromProtoMsg(message) {
        return MsgToggleOracle.decode(message.value);
    },
    toProto(message) {
        return MsgToggleOracle.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.icaoracle.MsgToggleOracle',
            value: MsgToggleOracle.encode(message).finish(),
        };
    },
};
function createBaseMsgToggleOracleResponse() {
    return {};
}
export const MsgToggleOracleResponse = {
    typeUrl: '/stride.icaoracle.MsgToggleOracleResponse',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgToggleOracleResponse();
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
        const message = createBaseMsgToggleOracleResponse();
        return message;
    },
    fromProtoMsg(message) {
        return MsgToggleOracleResponse.decode(message.value);
    },
    toProto(message) {
        return MsgToggleOracleResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.icaoracle.MsgToggleOracleResponse',
            value: MsgToggleOracleResponse.encode(message).finish(),
        };
    },
};
function createBaseMsgRemoveOracle() {
    return {
        authority: '',
        oracleChainId: '',
    };
}
export const MsgRemoveOracle = {
    typeUrl: '/stride.icaoracle.MsgRemoveOracle',
    encode(message, writer = BinaryWriter.create()) {
        if (message.authority !== '') {
            writer.uint32(10).string(message.authority);
        }
        if (message.oracleChainId !== '') {
            writer.uint32(18).string(message.oracleChainId);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgRemoveOracle();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.authority = reader.string();
                    break;
                case 2:
                    message.oracleChainId = reader.string();
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
            authority: isSet(object.authority) ? String(object.authority) : '',
            oracleChainId: isSet(object.oracleChainId)
                ? String(object.oracleChainId)
                : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.authority !== undefined && (obj.authority = message.authority);
        message.oracleChainId !== undefined &&
            (obj.oracleChainId = message.oracleChainId);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgRemoveOracle();
        message.authority = object.authority ?? '';
        message.oracleChainId = object.oracleChainId ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return MsgRemoveOracle.decode(message.value);
    },
    toProto(message) {
        return MsgRemoveOracle.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.icaoracle.MsgRemoveOracle',
            value: MsgRemoveOracle.encode(message).finish(),
        };
    },
};
function createBaseMsgRemoveOracleResponse() {
    return {};
}
export const MsgRemoveOracleResponse = {
    typeUrl: '/stride.icaoracle.MsgRemoveOracleResponse',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgRemoveOracleResponse();
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
        const message = createBaseMsgRemoveOracleResponse();
        return message;
    },
    fromProtoMsg(message) {
        return MsgRemoveOracleResponse.decode(message.value);
    },
    toProto(message) {
        return MsgRemoveOracleResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.icaoracle.MsgRemoveOracleResponse',
            value: MsgRemoveOracleResponse.encode(message).finish(),
        };
    },
};
//# sourceMappingURL=tx.js.map