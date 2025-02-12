//@ts-nocheck
import { BinaryReader, BinaryWriter } from '../../../../binary.js';
import { bytesFromBase64, base64FromBytes, isSet, } from '../../../../helpers.js';
import {} from '../../../../json-safe.js';
function createBaseMultiSignature() {
    return {
        signatures: [],
    };
}
export const MultiSignature = {
    typeUrl: '/cosmos.crypto.multisig.v1beta1.MultiSignature',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.signatures) {
            writer.uint32(10).bytes(v);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMultiSignature();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.signatures.push(reader.bytes());
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
            signatures: Array.isArray(object?.signatures)
                ? object.signatures.map((e) => bytesFromBase64(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.signatures) {
            obj.signatures = message.signatures.map(e => base64FromBytes(e !== undefined ? e : new Uint8Array()));
        }
        else {
            obj.signatures = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMultiSignature();
        message.signatures = object.signatures?.map(e => e) || [];
        return message;
    },
    fromProtoMsg(message) {
        return MultiSignature.decode(message.value);
    },
    toProto(message) {
        return MultiSignature.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.crypto.multisig.v1beta1.MultiSignature',
            value: MultiSignature.encode(message).finish(),
        };
    },
};
function createBaseCompactBitArray() {
    return {
        extraBitsStored: 0,
        elems: new Uint8Array(),
    };
}
export const CompactBitArray = {
    typeUrl: '/cosmos.crypto.multisig.v1beta1.CompactBitArray',
    encode(message, writer = BinaryWriter.create()) {
        if (message.extraBitsStored !== 0) {
            writer.uint32(8).uint32(message.extraBitsStored);
        }
        if (message.elems.length !== 0) {
            writer.uint32(18).bytes(message.elems);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseCompactBitArray();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.extraBitsStored = reader.uint32();
                    break;
                case 2:
                    message.elems = reader.bytes();
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
            extraBitsStored: isSet(object.extraBitsStored)
                ? Number(object.extraBitsStored)
                : 0,
            elems: isSet(object.elems)
                ? bytesFromBase64(object.elems)
                : new Uint8Array(),
        };
    },
    toJSON(message) {
        const obj = {};
        message.extraBitsStored !== undefined &&
            (obj.extraBitsStored = Math.round(message.extraBitsStored));
        message.elems !== undefined &&
            (obj.elems = base64FromBytes(message.elems !== undefined ? message.elems : new Uint8Array()));
        return obj;
    },
    fromPartial(object) {
        const message = createBaseCompactBitArray();
        message.extraBitsStored = object.extraBitsStored ?? 0;
        message.elems = object.elems ?? new Uint8Array();
        return message;
    },
    fromProtoMsg(message) {
        return CompactBitArray.decode(message.value);
    },
    toProto(message) {
        return CompactBitArray.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.crypto.multisig.v1beta1.CompactBitArray',
            value: CompactBitArray.encode(message).finish(),
        };
    },
};
//# sourceMappingURL=multisig.js.map