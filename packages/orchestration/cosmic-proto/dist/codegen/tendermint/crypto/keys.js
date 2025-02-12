//@ts-nocheck
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { isSet, bytesFromBase64, base64FromBytes } from '../../helpers.js';
import {} from '../../json-safe.js';
function createBasePublicKey() {
    return {
        ed25519: undefined,
        secp256k1: undefined,
    };
}
export const PublicKey = {
    typeUrl: '/tendermint.crypto.PublicKey',
    encode(message, writer = BinaryWriter.create()) {
        if (message.ed25519 !== undefined) {
            writer.uint32(10).bytes(message.ed25519);
        }
        if (message.secp256k1 !== undefined) {
            writer.uint32(18).bytes(message.secp256k1);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBasePublicKey();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.ed25519 = reader.bytes();
                    break;
                case 2:
                    message.secp256k1 = reader.bytes();
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
            ed25519: isSet(object.ed25519)
                ? bytesFromBase64(object.ed25519)
                : undefined,
            secp256k1: isSet(object.secp256k1)
                ? bytesFromBase64(object.secp256k1)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.ed25519 !== undefined &&
            (obj.ed25519 =
                message.ed25519 !== undefined
                    ? base64FromBytes(message.ed25519)
                    : undefined);
        message.secp256k1 !== undefined &&
            (obj.secp256k1 =
                message.secp256k1 !== undefined
                    ? base64FromBytes(message.secp256k1)
                    : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBasePublicKey();
        message.ed25519 = object.ed25519 ?? undefined;
        message.secp256k1 = object.secp256k1 ?? undefined;
        return message;
    },
    fromProtoMsg(message) {
        return PublicKey.decode(message.value);
    },
    toProto(message) {
        return PublicKey.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/tendermint.crypto.PublicKey',
            value: PublicKey.encode(message).finish(),
        };
    },
};
//# sourceMappingURL=keys.js.map