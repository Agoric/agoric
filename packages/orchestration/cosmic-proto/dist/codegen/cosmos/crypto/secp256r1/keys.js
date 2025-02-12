//@ts-nocheck
import { BinaryReader, BinaryWriter } from '../../../binary.js';
import { isSet, bytesFromBase64, base64FromBytes } from '../../../helpers.js';
import {} from '../../../json-safe.js';
function createBasePubKey() {
    return {
        key: new Uint8Array(),
    };
}
export const PubKey = {
    typeUrl: '/cosmos.crypto.secp256r1.PubKey',
    encode(message, writer = BinaryWriter.create()) {
        if (message.key.length !== 0) {
            writer.uint32(10).bytes(message.key);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBasePubKey();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.key = reader.bytes();
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
            key: isSet(object.key) ? bytesFromBase64(object.key) : new Uint8Array(),
        };
    },
    toJSON(message) {
        const obj = {};
        message.key !== undefined &&
            (obj.key = base64FromBytes(message.key !== undefined ? message.key : new Uint8Array()));
        return obj;
    },
    fromPartial(object) {
        const message = createBasePubKey();
        message.key = object.key ?? new Uint8Array();
        return message;
    },
    fromProtoMsg(message) {
        return PubKey.decode(message.value);
    },
    toProto(message) {
        return PubKey.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.crypto.secp256r1.PubKey',
            value: PubKey.encode(message).finish(),
        };
    },
};
function createBasePrivKey() {
    return {
        secret: new Uint8Array(),
    };
}
export const PrivKey = {
    typeUrl: '/cosmos.crypto.secp256r1.PrivKey',
    encode(message, writer = BinaryWriter.create()) {
        if (message.secret.length !== 0) {
            writer.uint32(10).bytes(message.secret);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBasePrivKey();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.secret = reader.bytes();
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
            secret: isSet(object.secret)
                ? bytesFromBase64(object.secret)
                : new Uint8Array(),
        };
    },
    toJSON(message) {
        const obj = {};
        message.secret !== undefined &&
            (obj.secret = base64FromBytes(message.secret !== undefined ? message.secret : new Uint8Array()));
        return obj;
    },
    fromPartial(object) {
        const message = createBasePrivKey();
        message.secret = object.secret ?? new Uint8Array();
        return message;
    },
    fromProtoMsg(message) {
        return PrivKey.decode(message.value);
    },
    toProto(message) {
        return PrivKey.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.crypto.secp256r1.PrivKey',
            value: PrivKey.encode(message).finish(),
        };
    },
};
//# sourceMappingURL=keys.js.map