//@ts-nocheck
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { isSet, bytesFromBase64, base64FromBytes } from '../../helpers.js';
import {} from '../../json-safe.js';
function createBaseCallbackData() {
    return {
        callbackKey: '',
        portId: '',
        channelId: '',
        sequence: BigInt(0),
        callbackId: '',
        callbackArgs: new Uint8Array(),
    };
}
export const CallbackData = {
    typeUrl: '/stride.icacallbacks.CallbackData',
    encode(message, writer = BinaryWriter.create()) {
        if (message.callbackKey !== '') {
            writer.uint32(10).string(message.callbackKey);
        }
        if (message.portId !== '') {
            writer.uint32(18).string(message.portId);
        }
        if (message.channelId !== '') {
            writer.uint32(26).string(message.channelId);
        }
        if (message.sequence !== BigInt(0)) {
            writer.uint32(32).uint64(message.sequence);
        }
        if (message.callbackId !== '') {
            writer.uint32(42).string(message.callbackId);
        }
        if (message.callbackArgs.length !== 0) {
            writer.uint32(50).bytes(message.callbackArgs);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseCallbackData();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.callbackKey = reader.string();
                    break;
                case 2:
                    message.portId = reader.string();
                    break;
                case 3:
                    message.channelId = reader.string();
                    break;
                case 4:
                    message.sequence = reader.uint64();
                    break;
                case 5:
                    message.callbackId = reader.string();
                    break;
                case 6:
                    message.callbackArgs = reader.bytes();
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
            callbackKey: isSet(object.callbackKey) ? String(object.callbackKey) : '',
            portId: isSet(object.portId) ? String(object.portId) : '',
            channelId: isSet(object.channelId) ? String(object.channelId) : '',
            sequence: isSet(object.sequence)
                ? BigInt(object.sequence.toString())
                : BigInt(0),
            callbackId: isSet(object.callbackId) ? String(object.callbackId) : '',
            callbackArgs: isSet(object.callbackArgs)
                ? bytesFromBase64(object.callbackArgs)
                : new Uint8Array(),
        };
    },
    toJSON(message) {
        const obj = {};
        message.callbackKey !== undefined &&
            (obj.callbackKey = message.callbackKey);
        message.portId !== undefined && (obj.portId = message.portId);
        message.channelId !== undefined && (obj.channelId = message.channelId);
        message.sequence !== undefined &&
            (obj.sequence = (message.sequence || BigInt(0)).toString());
        message.callbackId !== undefined && (obj.callbackId = message.callbackId);
        message.callbackArgs !== undefined &&
            (obj.callbackArgs = base64FromBytes(message.callbackArgs !== undefined
                ? message.callbackArgs
                : new Uint8Array()));
        return obj;
    },
    fromPartial(object) {
        const message = createBaseCallbackData();
        message.callbackKey = object.callbackKey ?? '';
        message.portId = object.portId ?? '';
        message.channelId = object.channelId ?? '';
        message.sequence =
            object.sequence !== undefined && object.sequence !== null
                ? BigInt(object.sequence.toString())
                : BigInt(0);
        message.callbackId = object.callbackId ?? '';
        message.callbackArgs = object.callbackArgs ?? new Uint8Array();
        return message;
    },
    fromProtoMsg(message) {
        return CallbackData.decode(message.value);
    },
    toProto(message) {
        return CallbackData.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.icacallbacks.CallbackData',
            value: CallbackData.encode(message).finish(),
        };
    },
};
//# sourceMappingURL=callback_data.js.map