//@ts-nocheck
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { isSet } from '../../helpers.js';
import {} from '../../json-safe.js';
function createBaseParams() {
    return {
        hostEnabled: false,
        allowQueries: [],
    };
}
export const Params = {
    typeUrl: '/icq.v1.Params',
    encode(message, writer = BinaryWriter.create()) {
        if (message.hostEnabled === true) {
            writer.uint32(16).bool(message.hostEnabled);
        }
        for (const v of message.allowQueries) {
            writer.uint32(26).string(v);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseParams();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 2:
                    message.hostEnabled = reader.bool();
                    break;
                case 3:
                    message.allowQueries.push(reader.string());
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
            hostEnabled: isSet(object.hostEnabled)
                ? Boolean(object.hostEnabled)
                : false,
            allowQueries: Array.isArray(object?.allowQueries)
                ? object.allowQueries.map((e) => String(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        message.hostEnabled !== undefined &&
            (obj.hostEnabled = message.hostEnabled);
        if (message.allowQueries) {
            obj.allowQueries = message.allowQueries.map(e => e);
        }
        else {
            obj.allowQueries = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseParams();
        message.hostEnabled = object.hostEnabled ?? false;
        message.allowQueries = object.allowQueries?.map(e => e) || [];
        return message;
    },
    fromProtoMsg(message) {
        return Params.decode(message.value);
    },
    toProto(message) {
        return Params.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/icq.v1.Params',
            value: Params.encode(message).finish(),
        };
    },
};
//# sourceMappingURL=icq.js.map