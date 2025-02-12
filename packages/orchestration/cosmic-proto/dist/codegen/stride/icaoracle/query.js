//@ts-nocheck
import { Oracle, Metric, } from './icaoracle.js';
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { isSet } from '../../helpers.js';
import {} from '../../json-safe.js';
function createBaseQueryOracleRequest() {
    return {
        chainId: '',
    };
}
export const QueryOracleRequest = {
    typeUrl: '/stride.icaoracle.QueryOracleRequest',
    encode(message, writer = BinaryWriter.create()) {
        if (message.chainId !== '') {
            writer.uint32(10).string(message.chainId);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryOracleRequest();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.chainId = reader.string();
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
            chainId: isSet(object.chainId) ? String(object.chainId) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.chainId !== undefined && (obj.chainId = message.chainId);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryOracleRequest();
        message.chainId = object.chainId ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return QueryOracleRequest.decode(message.value);
    },
    toProto(message) {
        return QueryOracleRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.icaoracle.QueryOracleRequest',
            value: QueryOracleRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryOracleResponse() {
    return {
        oracle: undefined,
    };
}
export const QueryOracleResponse = {
    typeUrl: '/stride.icaoracle.QueryOracleResponse',
    encode(message, writer = BinaryWriter.create()) {
        if (message.oracle !== undefined) {
            Oracle.encode(message.oracle, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryOracleResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.oracle = Oracle.decode(reader, reader.uint32());
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
            oracle: isSet(object.oracle) ? Oracle.fromJSON(object.oracle) : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.oracle !== undefined &&
            (obj.oracle = message.oracle ? Oracle.toJSON(message.oracle) : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryOracleResponse();
        message.oracle =
            object.oracle !== undefined && object.oracle !== null
                ? Oracle.fromPartial(object.oracle)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return QueryOracleResponse.decode(message.value);
    },
    toProto(message) {
        return QueryOracleResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.icaoracle.QueryOracleResponse',
            value: QueryOracleResponse.encode(message).finish(),
        };
    },
};
function createBaseQueryAllOraclesRequest() {
    return {};
}
export const QueryAllOraclesRequest = {
    typeUrl: '/stride.icaoracle.QueryAllOraclesRequest',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryAllOraclesRequest();
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
        const message = createBaseQueryAllOraclesRequest();
        return message;
    },
    fromProtoMsg(message) {
        return QueryAllOraclesRequest.decode(message.value);
    },
    toProto(message) {
        return QueryAllOraclesRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.icaoracle.QueryAllOraclesRequest',
            value: QueryAllOraclesRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryAllOraclesResponse() {
    return {
        oracles: [],
    };
}
export const QueryAllOraclesResponse = {
    typeUrl: '/stride.icaoracle.QueryAllOraclesResponse',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.oracles) {
            Oracle.encode(v, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryAllOraclesResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.oracles.push(Oracle.decode(reader, reader.uint32()));
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
            oracles: Array.isArray(object?.oracles)
                ? object.oracles.map((e) => Oracle.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.oracles) {
            obj.oracles = message.oracles.map(e => e ? Oracle.toJSON(e) : undefined);
        }
        else {
            obj.oracles = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryAllOraclesResponse();
        message.oracles = object.oracles?.map(e => Oracle.fromPartial(e)) || [];
        return message;
    },
    fromProtoMsg(message) {
        return QueryAllOraclesResponse.decode(message.value);
    },
    toProto(message) {
        return QueryAllOraclesResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.icaoracle.QueryAllOraclesResponse',
            value: QueryAllOraclesResponse.encode(message).finish(),
        };
    },
};
function createBaseQueryActiveOraclesRequest() {
    return {
        active: false,
    };
}
export const QueryActiveOraclesRequest = {
    typeUrl: '/stride.icaoracle.QueryActiveOraclesRequest',
    encode(message, writer = BinaryWriter.create()) {
        if (message.active === true) {
            writer.uint32(8).bool(message.active);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryActiveOraclesRequest();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.active = reader.bool();
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
            active: isSet(object.active) ? Boolean(object.active) : false,
        };
    },
    toJSON(message) {
        const obj = {};
        message.active !== undefined && (obj.active = message.active);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryActiveOraclesRequest();
        message.active = object.active ?? false;
        return message;
    },
    fromProtoMsg(message) {
        return QueryActiveOraclesRequest.decode(message.value);
    },
    toProto(message) {
        return QueryActiveOraclesRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.icaoracle.QueryActiveOraclesRequest',
            value: QueryActiveOraclesRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryActiveOraclesResponse() {
    return {
        oracles: [],
    };
}
export const QueryActiveOraclesResponse = {
    typeUrl: '/stride.icaoracle.QueryActiveOraclesResponse',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.oracles) {
            Oracle.encode(v, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryActiveOraclesResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.oracles.push(Oracle.decode(reader, reader.uint32()));
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
            oracles: Array.isArray(object?.oracles)
                ? object.oracles.map((e) => Oracle.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.oracles) {
            obj.oracles = message.oracles.map(e => e ? Oracle.toJSON(e) : undefined);
        }
        else {
            obj.oracles = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryActiveOraclesResponse();
        message.oracles = object.oracles?.map(e => Oracle.fromPartial(e)) || [];
        return message;
    },
    fromProtoMsg(message) {
        return QueryActiveOraclesResponse.decode(message.value);
    },
    toProto(message) {
        return QueryActiveOraclesResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.icaoracle.QueryActiveOraclesResponse',
            value: QueryActiveOraclesResponse.encode(message).finish(),
        };
    },
};
function createBaseQueryMetricsRequest() {
    return {
        metricKey: '',
        oracleChainId: '',
    };
}
export const QueryMetricsRequest = {
    typeUrl: '/stride.icaoracle.QueryMetricsRequest',
    encode(message, writer = BinaryWriter.create()) {
        if (message.metricKey !== '') {
            writer.uint32(10).string(message.metricKey);
        }
        if (message.oracleChainId !== '') {
            writer.uint32(18).string(message.oracleChainId);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryMetricsRequest();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.metricKey = reader.string();
                    break;
                case 2:
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
            metricKey: isSet(object.metricKey) ? String(object.metricKey) : '',
            oracleChainId: isSet(object.oracleChainId)
                ? String(object.oracleChainId)
                : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.metricKey !== undefined && (obj.metricKey = message.metricKey);
        message.oracleChainId !== undefined &&
            (obj.oracleChainId = message.oracleChainId);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryMetricsRequest();
        message.metricKey = object.metricKey ?? '';
        message.oracleChainId = object.oracleChainId ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return QueryMetricsRequest.decode(message.value);
    },
    toProto(message) {
        return QueryMetricsRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.icaoracle.QueryMetricsRequest',
            value: QueryMetricsRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryMetricsResponse() {
    return {
        metrics: [],
    };
}
export const QueryMetricsResponse = {
    typeUrl: '/stride.icaoracle.QueryMetricsResponse',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.metrics) {
            Metric.encode(v, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryMetricsResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
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
            metrics: Array.isArray(object?.metrics)
                ? object.metrics.map((e) => Metric.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.metrics) {
            obj.metrics = message.metrics.map(e => e ? Metric.toJSON(e) : undefined);
        }
        else {
            obj.metrics = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryMetricsResponse();
        message.metrics = object.metrics?.map(e => Metric.fromPartial(e)) || [];
        return message;
    },
    fromProtoMsg(message) {
        return QueryMetricsResponse.decode(message.value);
    },
    toProto(message) {
        return QueryMetricsResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.icaoracle.QueryMetricsResponse',
            value: QueryMetricsResponse.encode(message).finish(),
        };
    },
};
//# sourceMappingURL=query.js.map