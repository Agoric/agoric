//@ts-nocheck
import { Oracle, Metric, } from './icaoracle.js';
import { BinaryReader, BinaryWriter } from '../../binary.js';
import {} from '../../json-safe.js';
import { isSet } from '../../helpers.js';
function createBaseParams() {
    return {};
}
export const Params = {
    typeUrl: '/stride.icaoracle.Params',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseParams();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON(_) {
        return {};
    },
    toJSON(_) {
        const obj = {};
        return obj;
    },
    fromPartial(_) {
        const message = createBaseParams();
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
            typeUrl: '/stride.icaoracle.Params',
            value: Params.encode(message).finish(),
        };
    },
};
function createBaseGenesisState() {
    return {
        params: Params.fromPartial({}),
        oracles: [],
        metrics: [],
    };
}
export const GenesisState = {
    typeUrl: '/stride.icaoracle.GenesisState',
    encode(message, writer = BinaryWriter.create()) {
        if (message.params !== undefined) {
            Params.encode(message.params, writer.uint32(10).fork()).ldelim();
        }
        for (const v of message.oracles) {
            Oracle.encode(v, writer.uint32(18).fork()).ldelim();
        }
        for (const v of message.metrics) {
            Metric.encode(v, writer.uint32(26).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseGenesisState();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.params = Params.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.oracles.push(Oracle.decode(reader, reader.uint32()));
                    break;
                case 3:
                    message.metrics.push(Metric.decode(reader, reader.uint32()));
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
            params: isSet(object.params) ? Params.fromJSON(object.params) : undefined,
            oracles: Array.isArray(object?.oracles)
                ? object.oracles.map((e) => Oracle.fromJSON(e))
                : [],
            metrics: Array.isArray(object?.metrics)
                ? object.metrics.map((e) => Metric.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        message.params !== undefined &&
            (obj.params = message.params ? Params.toJSON(message.params) : undefined);
        if (message.oracles) {
            obj.oracles = message.oracles.map(e => e ? Oracle.toJSON(e) : undefined);
        }
        else {
            obj.oracles = [];
        }
        if (message.metrics) {
            obj.metrics = message.metrics.map(e => e ? Metric.toJSON(e) : undefined);
        }
        else {
            obj.metrics = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseGenesisState();
        message.params =
            object.params !== undefined && object.params !== null
                ? Params.fromPartial(object.params)
                : undefined;
        message.oracles = object.oracles?.map(e => Oracle.fromPartial(e)) || [];
        message.metrics = object.metrics?.map(e => Metric.fromPartial(e)) || [];
        return message;
    },
    fromProtoMsg(message) {
        return GenesisState.decode(message.value);
    },
    toProto(message) {
        return GenesisState.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.icaoracle.GenesisState',
            value: GenesisState.encode(message).finish(),
        };
    },
};
//# sourceMappingURL=genesis.js.map