//@ts-nocheck
import { InterchainAccountPacketData, } from '../../v1/packet.js';
import { BinaryReader, BinaryWriter } from '../../../../../binary.js';
import { isSet } from '../../../../../helpers.js';
import {} from '../../../../../json-safe.js';
function createBaseMsgRegisterInterchainAccount() {
    return {
        owner: '',
        connectionId: '',
        version: '',
    };
}
export const MsgRegisterInterchainAccount = {
    typeUrl: '/ibc.applications.interchain_accounts.controller.v1.MsgRegisterInterchainAccount',
    encode(message, writer = BinaryWriter.create()) {
        if (message.owner !== '') {
            writer.uint32(10).string(message.owner);
        }
        if (message.connectionId !== '') {
            writer.uint32(18).string(message.connectionId);
        }
        if (message.version !== '') {
            writer.uint32(26).string(message.version);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgRegisterInterchainAccount();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.owner = reader.string();
                    break;
                case 2:
                    message.connectionId = reader.string();
                    break;
                case 3:
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
            owner: isSet(object.owner) ? String(object.owner) : '',
            connectionId: isSet(object.connectionId)
                ? String(object.connectionId)
                : '',
            version: isSet(object.version) ? String(object.version) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.owner !== undefined && (obj.owner = message.owner);
        message.connectionId !== undefined &&
            (obj.connectionId = message.connectionId);
        message.version !== undefined && (obj.version = message.version);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgRegisterInterchainAccount();
        message.owner = object.owner ?? '';
        message.connectionId = object.connectionId ?? '';
        message.version = object.version ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return MsgRegisterInterchainAccount.decode(message.value);
    },
    toProto(message) {
        return MsgRegisterInterchainAccount.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.applications.interchain_accounts.controller.v1.MsgRegisterInterchainAccount',
            value: MsgRegisterInterchainAccount.encode(message).finish(),
        };
    },
};
function createBaseMsgRegisterInterchainAccountResponse() {
    return {
        channelId: '',
    };
}
export const MsgRegisterInterchainAccountResponse = {
    typeUrl: '/ibc.applications.interchain_accounts.controller.v1.MsgRegisterInterchainAccountResponse',
    encode(message, writer = BinaryWriter.create()) {
        if (message.channelId !== '') {
            writer.uint32(10).string(message.channelId);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgRegisterInterchainAccountResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.channelId = reader.string();
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
        };
    },
    toJSON(message) {
        const obj = {};
        message.channelId !== undefined && (obj.channelId = message.channelId);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgRegisterInterchainAccountResponse();
        message.channelId = object.channelId ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return MsgRegisterInterchainAccountResponse.decode(message.value);
    },
    toProto(message) {
        return MsgRegisterInterchainAccountResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.applications.interchain_accounts.controller.v1.MsgRegisterInterchainAccountResponse',
            value: MsgRegisterInterchainAccountResponse.encode(message).finish(),
        };
    },
};
function createBaseMsgSendTx() {
    return {
        owner: '',
        connectionId: '',
        packetData: InterchainAccountPacketData.fromPartial({}),
        relativeTimeout: BigInt(0),
    };
}
export const MsgSendTx = {
    typeUrl: '/ibc.applications.interchain_accounts.controller.v1.MsgSendTx',
    encode(message, writer = BinaryWriter.create()) {
        if (message.owner !== '') {
            writer.uint32(10).string(message.owner);
        }
        if (message.connectionId !== '') {
            writer.uint32(18).string(message.connectionId);
        }
        if (message.packetData !== undefined) {
            InterchainAccountPacketData.encode(message.packetData, writer.uint32(26).fork()).ldelim();
        }
        if (message.relativeTimeout !== BigInt(0)) {
            writer.uint32(32).uint64(message.relativeTimeout);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgSendTx();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.owner = reader.string();
                    break;
                case 2:
                    message.connectionId = reader.string();
                    break;
                case 3:
                    message.packetData = InterchainAccountPacketData.decode(reader, reader.uint32());
                    break;
                case 4:
                    message.relativeTimeout = reader.uint64();
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
            owner: isSet(object.owner) ? String(object.owner) : '',
            connectionId: isSet(object.connectionId)
                ? String(object.connectionId)
                : '',
            packetData: isSet(object.packetData)
                ? InterchainAccountPacketData.fromJSON(object.packetData)
                : undefined,
            relativeTimeout: isSet(object.relativeTimeout)
                ? BigInt(object.relativeTimeout.toString())
                : BigInt(0),
        };
    },
    toJSON(message) {
        const obj = {};
        message.owner !== undefined && (obj.owner = message.owner);
        message.connectionId !== undefined &&
            (obj.connectionId = message.connectionId);
        message.packetData !== undefined &&
            (obj.packetData = message.packetData
                ? InterchainAccountPacketData.toJSON(message.packetData)
                : undefined);
        message.relativeTimeout !== undefined &&
            (obj.relativeTimeout = (message.relativeTimeout || BigInt(0)).toString());
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgSendTx();
        message.owner = object.owner ?? '';
        message.connectionId = object.connectionId ?? '';
        message.packetData =
            object.packetData !== undefined && object.packetData !== null
                ? InterchainAccountPacketData.fromPartial(object.packetData)
                : undefined;
        message.relativeTimeout =
            object.relativeTimeout !== undefined && object.relativeTimeout !== null
                ? BigInt(object.relativeTimeout.toString())
                : BigInt(0);
        return message;
    },
    fromProtoMsg(message) {
        return MsgSendTx.decode(message.value);
    },
    toProto(message) {
        return MsgSendTx.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.applications.interchain_accounts.controller.v1.MsgSendTx',
            value: MsgSendTx.encode(message).finish(),
        };
    },
};
function createBaseMsgSendTxResponse() {
    return {
        sequence: BigInt(0),
    };
}
export const MsgSendTxResponse = {
    typeUrl: '/ibc.applications.interchain_accounts.controller.v1.MsgSendTxResponse',
    encode(message, writer = BinaryWriter.create()) {
        if (message.sequence !== BigInt(0)) {
            writer.uint32(8).uint64(message.sequence);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgSendTxResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.sequence = reader.uint64();
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
            sequence: isSet(object.sequence)
                ? BigInt(object.sequence.toString())
                : BigInt(0),
        };
    },
    toJSON(message) {
        const obj = {};
        message.sequence !== undefined &&
            (obj.sequence = (message.sequence || BigInt(0)).toString());
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgSendTxResponse();
        message.sequence =
            object.sequence !== undefined && object.sequence !== null
                ? BigInt(object.sequence.toString())
                : BigInt(0);
        return message;
    },
    fromProtoMsg(message) {
        return MsgSendTxResponse.decode(message.value);
    },
    toProto(message) {
        return MsgSendTxResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.applications.interchain_accounts.controller.v1.MsgSendTxResponse',
            value: MsgSendTxResponse.encode(message).finish(),
        };
    },
};
//# sourceMappingURL=tx.js.map