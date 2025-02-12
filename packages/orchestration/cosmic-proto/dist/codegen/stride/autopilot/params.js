//@ts-nocheck
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { isSet } from '../../helpers.js';
import {} from '../../json-safe.js';
function createBaseParams() {
    return {
        stakeibcActive: false,
        claimActive: false,
    };
}
export const Params = {
    typeUrl: '/stride.autopilot.Params',
    encode(message, writer = BinaryWriter.create()) {
        if (message.stakeibcActive === true) {
            writer.uint32(8).bool(message.stakeibcActive);
        }
        if (message.claimActive === true) {
            writer.uint32(16).bool(message.claimActive);
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
                case 1:
                    message.stakeibcActive = reader.bool();
                    break;
                case 2:
                    message.claimActive = reader.bool();
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
            stakeibcActive: isSet(object.stakeibcActive)
                ? Boolean(object.stakeibcActive)
                : false,
            claimActive: isSet(object.claimActive)
                ? Boolean(object.claimActive)
                : false,
        };
    },
    toJSON(message) {
        const obj = {};
        message.stakeibcActive !== undefined &&
            (obj.stakeibcActive = message.stakeibcActive);
        message.claimActive !== undefined &&
            (obj.claimActive = message.claimActive);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseParams();
        message.stakeibcActive = object.stakeibcActive ?? false;
        message.claimActive = object.claimActive ?? false;
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
            typeUrl: '/stride.autopilot.Params',
            value: Params.encode(message).finish(),
        };
    },
};
//# sourceMappingURL=params.js.map