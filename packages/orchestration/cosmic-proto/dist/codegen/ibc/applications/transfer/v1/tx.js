//@ts-nocheck
import { Coin, } from '../../../../cosmos/base/v1beta1/coin.js';
import { Height } from '../../../core/client/v1/client.js';
import { BinaryReader, BinaryWriter } from '../../../../binary.js';
import { isSet } from '../../../../helpers.js';
import {} from '../../../../json-safe.js';
function createBaseMsgTransfer() {
    return {
        sourcePort: '',
        sourceChannel: '',
        token: Coin.fromPartial({}),
        sender: '',
        receiver: '',
        timeoutHeight: Height.fromPartial({}),
        timeoutTimestamp: BigInt(0),
        memo: '',
    };
}
export const MsgTransfer = {
    typeUrl: '/ibc.applications.transfer.v1.MsgTransfer',
    encode(message, writer = BinaryWriter.create()) {
        if (message.sourcePort !== '') {
            writer.uint32(10).string(message.sourcePort);
        }
        if (message.sourceChannel !== '') {
            writer.uint32(18).string(message.sourceChannel);
        }
        if (message.token !== undefined) {
            Coin.encode(message.token, writer.uint32(26).fork()).ldelim();
        }
        if (message.sender !== '') {
            writer.uint32(34).string(message.sender);
        }
        if (message.receiver !== '') {
            writer.uint32(42).string(message.receiver);
        }
        if (message.timeoutHeight !== undefined) {
            Height.encode(message.timeoutHeight, writer.uint32(50).fork()).ldelim();
        }
        if (message.timeoutTimestamp !== BigInt(0)) {
            writer.uint32(56).uint64(message.timeoutTimestamp);
        }
        if (message.memo !== '') {
            writer.uint32(66).string(message.memo);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgTransfer();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.sourcePort = reader.string();
                    break;
                case 2:
                    message.sourceChannel = reader.string();
                    break;
                case 3:
                    message.token = Coin.decode(reader, reader.uint32());
                    break;
                case 4:
                    message.sender = reader.string();
                    break;
                case 5:
                    message.receiver = reader.string();
                    break;
                case 6:
                    message.timeoutHeight = Height.decode(reader, reader.uint32());
                    break;
                case 7:
                    message.timeoutTimestamp = reader.uint64();
                    break;
                case 8:
                    message.memo = reader.string();
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
            sourcePort: isSet(object.sourcePort) ? String(object.sourcePort) : '',
            sourceChannel: isSet(object.sourceChannel)
                ? String(object.sourceChannel)
                : '',
            token: isSet(object.token) ? Coin.fromJSON(object.token) : undefined,
            sender: isSet(object.sender) ? String(object.sender) : '',
            receiver: isSet(object.receiver) ? String(object.receiver) : '',
            timeoutHeight: isSet(object.timeoutHeight)
                ? Height.fromJSON(object.timeoutHeight)
                : undefined,
            timeoutTimestamp: isSet(object.timeoutTimestamp)
                ? BigInt(object.timeoutTimestamp.toString())
                : BigInt(0),
            memo: isSet(object.memo) ? String(object.memo) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.sourcePort !== undefined && (obj.sourcePort = message.sourcePort);
        message.sourceChannel !== undefined &&
            (obj.sourceChannel = message.sourceChannel);
        message.token !== undefined &&
            (obj.token = message.token ? Coin.toJSON(message.token) : undefined);
        message.sender !== undefined && (obj.sender = message.sender);
        message.receiver !== undefined && (obj.receiver = message.receiver);
        message.timeoutHeight !== undefined &&
            (obj.timeoutHeight = message.timeoutHeight
                ? Height.toJSON(message.timeoutHeight)
                : undefined);
        message.timeoutTimestamp !== undefined &&
            (obj.timeoutTimestamp = (message.timeoutTimestamp || BigInt(0)).toString());
        message.memo !== undefined && (obj.memo = message.memo);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgTransfer();
        message.sourcePort = object.sourcePort ?? '';
        message.sourceChannel = object.sourceChannel ?? '';
        message.token =
            object.token !== undefined && object.token !== null
                ? Coin.fromPartial(object.token)
                : undefined;
        message.sender = object.sender ?? '';
        message.receiver = object.receiver ?? '';
        message.timeoutHeight =
            object.timeoutHeight !== undefined && object.timeoutHeight !== null
                ? Height.fromPartial(object.timeoutHeight)
                : undefined;
        message.timeoutTimestamp =
            object.timeoutTimestamp !== undefined && object.timeoutTimestamp !== null
                ? BigInt(object.timeoutTimestamp.toString())
                : BigInt(0);
        message.memo = object.memo ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return MsgTransfer.decode(message.value);
    },
    toProto(message) {
        return MsgTransfer.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.applications.transfer.v1.MsgTransfer',
            value: MsgTransfer.encode(message).finish(),
        };
    },
};
function createBaseMsgTransferResponse() {
    return {
        sequence: BigInt(0),
    };
}
export const MsgTransferResponse = {
    typeUrl: '/ibc.applications.transfer.v1.MsgTransferResponse',
    encode(message, writer = BinaryWriter.create()) {
        if (message.sequence !== BigInt(0)) {
            writer.uint32(8).uint64(message.sequence);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgTransferResponse();
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
        const message = createBaseMsgTransferResponse();
        message.sequence =
            object.sequence !== undefined && object.sequence !== null
                ? BigInt(object.sequence.toString())
                : BigInt(0);
        return message;
    },
    fromProtoMsg(message) {
        return MsgTransferResponse.decode(message.value);
    },
    toProto(message) {
        return MsgTransferResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.applications.transfer.v1.MsgTransferResponse',
            value: MsgTransferResponse.encode(message).finish(),
        };
    },
};
//# sourceMappingURL=tx.js.map