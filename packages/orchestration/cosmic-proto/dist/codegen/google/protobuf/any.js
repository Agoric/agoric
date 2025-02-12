//@ts-nocheck
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { isSet, bytesFromBase64, base64FromBytes } from '../../helpers.js';
import {} from '../../json-safe.js';
function createBaseAny() {
    return {
        $typeUrl: '/google.protobuf.Any',
        typeUrl: '',
        value: new Uint8Array(),
    };
}
export const Any = {
    typeUrl: '/google.protobuf.Any',
    encode(message, writer = BinaryWriter.create()) {
        if (message.typeUrl !== '') {
            writer.uint32(10).string(message.typeUrl);
        }
        if (message.value.length !== 0) {
            writer.uint32(18).bytes(message.value);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseAny();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.typeUrl = reader.string();
                    break;
                case 2:
                    message.value = reader.bytes();
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
            typeUrl: isSet(object.typeUrl) ? String(object.typeUrl) : '',
            value: isSet(object.value)
                ? bytesFromBase64(object.value)
                : new Uint8Array(),
        };
    },
    toJSON(message) {
        const obj = {};
        message.typeUrl !== undefined && (obj.typeUrl = message.typeUrl);
        message.value !== undefined &&
            (obj.value = base64FromBytes(message.value !== undefined ? message.value : new Uint8Array()));
        return obj;
    },
    fromPartial(object) {
        const message = createBaseAny();
        message.typeUrl = object.typeUrl ?? '';
        message.value = object.value ?? new Uint8Array();
        return message;
    },
    fromProtoMsg(message) {
        return Any.decode(message.value);
    },
    toProto(message) {
        return Any.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/google.protobuf.Any',
            value: Any.encode(message).finish(),
        };
    },
};
//# sourceMappingURL=any.js.map