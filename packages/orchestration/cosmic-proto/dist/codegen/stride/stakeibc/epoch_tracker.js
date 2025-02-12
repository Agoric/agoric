//@ts-nocheck
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { isSet } from '../../helpers.js';
import {} from '../../json-safe.js';
function createBaseEpochTracker() {
    return {
        epochIdentifier: '',
        epochNumber: BigInt(0),
        nextEpochStartTime: BigInt(0),
        duration: BigInt(0),
    };
}
export const EpochTracker = {
    typeUrl: '/stride.stakeibc.EpochTracker',
    encode(message, writer = BinaryWriter.create()) {
        if (message.epochIdentifier !== '') {
            writer.uint32(10).string(message.epochIdentifier);
        }
        if (message.epochNumber !== BigInt(0)) {
            writer.uint32(16).uint64(message.epochNumber);
        }
        if (message.nextEpochStartTime !== BigInt(0)) {
            writer.uint32(24).uint64(message.nextEpochStartTime);
        }
        if (message.duration !== BigInt(0)) {
            writer.uint32(32).uint64(message.duration);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseEpochTracker();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.epochIdentifier = reader.string();
                    break;
                case 2:
                    message.epochNumber = reader.uint64();
                    break;
                case 3:
                    message.nextEpochStartTime = reader.uint64();
                    break;
                case 4:
                    message.duration = reader.uint64();
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
            epochIdentifier: isSet(object.epochIdentifier)
                ? String(object.epochIdentifier)
                : '',
            epochNumber: isSet(object.epochNumber)
                ? BigInt(object.epochNumber.toString())
                : BigInt(0),
            nextEpochStartTime: isSet(object.nextEpochStartTime)
                ? BigInt(object.nextEpochStartTime.toString())
                : BigInt(0),
            duration: isSet(object.duration)
                ? BigInt(object.duration.toString())
                : BigInt(0),
        };
    },
    toJSON(message) {
        const obj = {};
        message.epochIdentifier !== undefined &&
            (obj.epochIdentifier = message.epochIdentifier);
        message.epochNumber !== undefined &&
            (obj.epochNumber = (message.epochNumber || BigInt(0)).toString());
        message.nextEpochStartTime !== undefined &&
            (obj.nextEpochStartTime = (message.nextEpochStartTime || BigInt(0)).toString());
        message.duration !== undefined &&
            (obj.duration = (message.duration || BigInt(0)).toString());
        return obj;
    },
    fromPartial(object) {
        const message = createBaseEpochTracker();
        message.epochIdentifier = object.epochIdentifier ?? '';
        message.epochNumber =
            object.epochNumber !== undefined && object.epochNumber !== null
                ? BigInt(object.epochNumber.toString())
                : BigInt(0);
        message.nextEpochStartTime =
            object.nextEpochStartTime !== undefined &&
                object.nextEpochStartTime !== null
                ? BigInt(object.nextEpochStartTime.toString())
                : BigInt(0);
        message.duration =
            object.duration !== undefined && object.duration !== null
                ? BigInt(object.duration.toString())
                : BigInt(0);
        return message;
    },
    fromProtoMsg(message) {
        return EpochTracker.decode(message.value);
    },
    toProto(message) {
        return EpochTracker.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakeibc.EpochTracker',
            value: EpochTracker.encode(message).finish(),
        };
    },
};
//# sourceMappingURL=epoch_tracker.js.map