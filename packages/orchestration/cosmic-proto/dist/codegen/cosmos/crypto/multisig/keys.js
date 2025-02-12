//@ts-nocheck
import { Any } from '../../../google/protobuf/any.js';
import { BinaryReader, BinaryWriter } from '../../../binary.js';
import { isSet } from '../../../helpers.js';
import {} from '../../../json-safe.js';
function createBaseLegacyAminoPubKey() {
    return {
        threshold: 0,
        publicKeys: [],
    };
}
export const LegacyAminoPubKey = {
    typeUrl: '/cosmos.crypto.multisig.LegacyAminoPubKey',
    encode(message, writer = BinaryWriter.create()) {
        if (message.threshold !== 0) {
            writer.uint32(8).uint32(message.threshold);
        }
        for (const v of message.publicKeys) {
            Any.encode(v, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseLegacyAminoPubKey();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.threshold = reader.uint32();
                    break;
                case 2:
                    message.publicKeys.push(Any.decode(reader, reader.uint32()));
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
            threshold: isSet(object.threshold) ? Number(object.threshold) : 0,
            publicKeys: Array.isArray(object?.publicKeys)
                ? object.publicKeys.map((e) => Any.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        message.threshold !== undefined &&
            (obj.threshold = Math.round(message.threshold));
        if (message.publicKeys) {
            obj.publicKeys = message.publicKeys.map(e => e ? Any.toJSON(e) : undefined);
        }
        else {
            obj.publicKeys = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseLegacyAminoPubKey();
        message.threshold = object.threshold ?? 0;
        message.publicKeys = object.publicKeys?.map(e => Any.fromPartial(e)) || [];
        return message;
    },
    fromProtoMsg(message) {
        return LegacyAminoPubKey.decode(message.value);
    },
    toProto(message) {
        return LegacyAminoPubKey.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.crypto.multisig.LegacyAminoPubKey',
            value: LegacyAminoPubKey.encode(message).finish(),
        };
    },
};
//# sourceMappingURL=keys.js.map