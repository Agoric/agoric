//@ts-nocheck
import { Metric } from './icaoracle.js';
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { isSet } from '../../helpers.js';
import {} from '../../json-safe.js';
function createBaseInstantiateOracleCallback() {
    return {
        oracleChainId: '',
    };
}
export const InstantiateOracleCallback = {
    typeUrl: '/stride.icaoracle.InstantiateOracleCallback',
    encode(message, writer = BinaryWriter.create()) {
        if (message.oracleChainId !== '') {
            writer.uint32(10).string(message.oracleChainId);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseInstantiateOracleCallback();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.oracleChainId = reader.string();
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
            oracleChainId: isSet(object.oracleChainId)
                ? String(object.oracleChainId)
                : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.oracleChainId !== undefined &&
            (obj.oracleChainId = message.oracleChainId);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseInstantiateOracleCallback();
        message.oracleChainId = object.oracleChainId ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return InstantiateOracleCallback.decode(message.value);
    },
    toProto(message) {
        return InstantiateOracleCallback.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.icaoracle.InstantiateOracleCallback',
            value: InstantiateOracleCallback.encode(message).finish(),
        };
    },
};
function createBaseUpdateOracleCallback() {
    return {
        oracleChainId: '',
        metric: undefined,
    };
}
export const UpdateOracleCallback = {
    typeUrl: '/stride.icaoracle.UpdateOracleCallback',
    encode(message, writer = BinaryWriter.create()) {
        if (message.oracleChainId !== '') {
            writer.uint32(10).string(message.oracleChainId);
        }
        if (message.metric !== undefined) {
            Metric.encode(message.metric, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseUpdateOracleCallback();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.oracleChainId = reader.string();
                    break;
                case 2:
                    message.metric = Metric.decode(reader, reader.uint32());
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
            oracleChainId: isSet(object.oracleChainId)
                ? String(object.oracleChainId)
                : '',
            metric: isSet(object.metric) ? Metric.fromJSON(object.metric) : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.oracleChainId !== undefined &&
            (obj.oracleChainId = message.oracleChainId);
        message.metric !== undefined &&
            (obj.metric = message.metric ? Metric.toJSON(message.metric) : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseUpdateOracleCallback();
        message.oracleChainId = object.oracleChainId ?? '';
        message.metric =
            object.metric !== undefined && object.metric !== null
                ? Metric.fromPartial(object.metric)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return UpdateOracleCallback.decode(message.value);
    },
    toProto(message) {
        return UpdateOracleCallback.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.icaoracle.UpdateOracleCallback',
            value: UpdateOracleCallback.encode(message).finish(),
        };
    },
};
//# sourceMappingURL=callbacks.js.map