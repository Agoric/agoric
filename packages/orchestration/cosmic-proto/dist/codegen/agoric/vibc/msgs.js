//@ts-nocheck
import { Packet, } from '../../ibc/core/channel/v1/channel.js';
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { isSet, bytesFromBase64, base64FromBytes } from '../../helpers.js';
import {} from '../../json-safe.js';
function createBaseMsgSendPacket() {
    return {
        packet: Packet.fromPartial({}),
        sender: new Uint8Array(),
    };
}
export const MsgSendPacket = {
    typeUrl: '/agoric.vibc.MsgSendPacket',
    encode(message, writer = BinaryWriter.create()) {
        if (message.packet !== undefined) {
            Packet.encode(message.packet, writer.uint32(10).fork()).ldelim();
        }
        if (message.sender.length !== 0) {
            writer.uint32(18).bytes(message.sender);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgSendPacket();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.packet = Packet.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.sender = reader.bytes();
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
            sender: isSet(object.sender)
                ? bytesFromBase64(object.sender)
                : new Uint8Array(),
        };
    },
    toJSON(message) {
        const obj = {};
        message.packet !== undefined &&
            (obj.packet = message.packet ? Packet.toJSON(message.packet) : undefined);
        message.sender !== undefined &&
            (obj.sender = base64FromBytes(message.sender !== undefined ? message.sender : new Uint8Array()));
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgSendPacket();
        message.packet =
            object.packet !== undefined && object.packet !== null
                ? Packet.fromPartial(object.packet)
                : undefined;
        message.sender = object.sender ?? new Uint8Array();
        return message;
    },
    fromProtoMsg(message) {
        return MsgSendPacket.decode(message.value);
    },
    toProto(message) {
        return MsgSendPacket.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/agoric.vibc.MsgSendPacket',
            value: MsgSendPacket.encode(message).finish(),
        };
    },
};
function createBaseMsgSendPacketResponse() {
    return {};
}
export const MsgSendPacketResponse = {
    typeUrl: '/agoric.vibc.MsgSendPacketResponse',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgSendPacketResponse();
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
        const message = createBaseMsgSendPacketResponse();
        return message;
    },
    fromProtoMsg(message) {
        return MsgSendPacketResponse.decode(message.value);
    },
    toProto(message) {
        return MsgSendPacketResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/agoric.vibc.MsgSendPacketResponse',
            value: MsgSendPacketResponse.encode(message).finish(),
        };
    },
};
//# sourceMappingURL=msgs.js.map