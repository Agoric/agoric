//@ts-nocheck
import { Duration, } from '../../../google/protobuf/duration.js';
import { BinaryReader, BinaryWriter } from '../../../binary.js';
import { isSet, bytesFromBase64, base64FromBytes } from '../../../helpers.js';
import {} from '../../../json-safe.js';
export var TimeoutPolicy;
(function (TimeoutPolicy) {
    TimeoutPolicy[TimeoutPolicy["REJECT_QUERY_RESPONSE"] = 0] = "REJECT_QUERY_RESPONSE";
    TimeoutPolicy[TimeoutPolicy["RETRY_QUERY_REQUEST"] = 1] = "RETRY_QUERY_REQUEST";
    TimeoutPolicy[TimeoutPolicy["EXECUTE_QUERY_CALLBACK"] = 2] = "EXECUTE_QUERY_CALLBACK";
    TimeoutPolicy[TimeoutPolicy["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
})(TimeoutPolicy || (TimeoutPolicy = {}));
export const TimeoutPolicySDKType = TimeoutPolicy;
export function timeoutPolicyFromJSON(object) {
    switch (object) {
        case 0:
        case 'REJECT_QUERY_RESPONSE':
            return TimeoutPolicy.REJECT_QUERY_RESPONSE;
        case 1:
        case 'RETRY_QUERY_REQUEST':
            return TimeoutPolicy.RETRY_QUERY_REQUEST;
        case 2:
        case 'EXECUTE_QUERY_CALLBACK':
            return TimeoutPolicy.EXECUTE_QUERY_CALLBACK;
        case -1:
        case 'UNRECOGNIZED':
        default:
            return TimeoutPolicy.UNRECOGNIZED;
    }
}
export function timeoutPolicyToJSON(object) {
    switch (object) {
        case TimeoutPolicy.REJECT_QUERY_RESPONSE:
            return 'REJECT_QUERY_RESPONSE';
        case TimeoutPolicy.RETRY_QUERY_REQUEST:
            return 'RETRY_QUERY_REQUEST';
        case TimeoutPolicy.EXECUTE_QUERY_CALLBACK:
            return 'EXECUTE_QUERY_CALLBACK';
        case TimeoutPolicy.UNRECOGNIZED:
        default:
            return 'UNRECOGNIZED';
    }
}
function createBaseQuery() {
    return {
        id: '',
        connectionId: '',
        chainId: '',
        queryType: '',
        requestData: new Uint8Array(),
        callbackModule: '',
        callbackId: '',
        callbackData: new Uint8Array(),
        timeoutPolicy: 0,
        timeoutDuration: Duration.fromPartial({}),
        timeoutTimestamp: BigInt(0),
        requestSent: false,
        submissionHeight: BigInt(0),
    };
}
export const Query = {
    typeUrl: '/stride.interchainquery.v1.Query',
    encode(message, writer = BinaryWriter.create()) {
        if (message.id !== '') {
            writer.uint32(10).string(message.id);
        }
        if (message.connectionId !== '') {
            writer.uint32(18).string(message.connectionId);
        }
        if (message.chainId !== '') {
            writer.uint32(26).string(message.chainId);
        }
        if (message.queryType !== '') {
            writer.uint32(34).string(message.queryType);
        }
        if (message.requestData.length !== 0) {
            writer.uint32(42).bytes(message.requestData);
        }
        if (message.callbackModule !== '') {
            writer.uint32(106).string(message.callbackModule);
        }
        if (message.callbackId !== '') {
            writer.uint32(66).string(message.callbackId);
        }
        if (message.callbackData.length !== 0) {
            writer.uint32(98).bytes(message.callbackData);
        }
        if (message.timeoutPolicy !== 0) {
            writer.uint32(120).int32(message.timeoutPolicy);
        }
        if (message.timeoutDuration !== undefined) {
            Duration.encode(message.timeoutDuration, writer.uint32(114).fork()).ldelim();
        }
        if (message.timeoutTimestamp !== BigInt(0)) {
            writer.uint32(72).uint64(message.timeoutTimestamp);
        }
        if (message.requestSent === true) {
            writer.uint32(88).bool(message.requestSent);
        }
        if (message.submissionHeight !== BigInt(0)) {
            writer.uint32(128).uint64(message.submissionHeight);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQuery();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.id = reader.string();
                    break;
                case 2:
                    message.connectionId = reader.string();
                    break;
                case 3:
                    message.chainId = reader.string();
                    break;
                case 4:
                    message.queryType = reader.string();
                    break;
                case 5:
                    message.requestData = reader.bytes();
                    break;
                case 13:
                    message.callbackModule = reader.string();
                    break;
                case 8:
                    message.callbackId = reader.string();
                    break;
                case 12:
                    message.callbackData = reader.bytes();
                    break;
                case 15:
                    message.timeoutPolicy = reader.int32();
                    break;
                case 14:
                    message.timeoutDuration = Duration.decode(reader, reader.uint32());
                    break;
                case 9:
                    message.timeoutTimestamp = reader.uint64();
                    break;
                case 11:
                    message.requestSent = reader.bool();
                    break;
                case 16:
                    message.submissionHeight = reader.uint64();
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
            id: isSet(object.id) ? String(object.id) : '',
            connectionId: isSet(object.connectionId)
                ? String(object.connectionId)
                : '',
            chainId: isSet(object.chainId) ? String(object.chainId) : '',
            queryType: isSet(object.queryType) ? String(object.queryType) : '',
            requestData: isSet(object.requestData)
                ? bytesFromBase64(object.requestData)
                : new Uint8Array(),
            callbackModule: isSet(object.callbackModule)
                ? String(object.callbackModule)
                : '',
            callbackId: isSet(object.callbackId) ? String(object.callbackId) : '',
            callbackData: isSet(object.callbackData)
                ? bytesFromBase64(object.callbackData)
                : new Uint8Array(),
            timeoutPolicy: isSet(object.timeoutPolicy)
                ? timeoutPolicyFromJSON(object.timeoutPolicy)
                : -1,
            timeoutDuration: isSet(object.timeoutDuration)
                ? Duration.fromJSON(object.timeoutDuration)
                : undefined,
            timeoutTimestamp: isSet(object.timeoutTimestamp)
                ? BigInt(object.timeoutTimestamp.toString())
                : BigInt(0),
            requestSent: isSet(object.requestSent)
                ? Boolean(object.requestSent)
                : false,
            submissionHeight: isSet(object.submissionHeight)
                ? BigInt(object.submissionHeight.toString())
                : BigInt(0),
        };
    },
    toJSON(message) {
        const obj = {};
        message.id !== undefined && (obj.id = message.id);
        message.connectionId !== undefined &&
            (obj.connectionId = message.connectionId);
        message.chainId !== undefined && (obj.chainId = message.chainId);
        message.queryType !== undefined && (obj.queryType = message.queryType);
        message.requestData !== undefined &&
            (obj.requestData = base64FromBytes(message.requestData !== undefined
                ? message.requestData
                : new Uint8Array()));
        message.callbackModule !== undefined &&
            (obj.callbackModule = message.callbackModule);
        message.callbackId !== undefined && (obj.callbackId = message.callbackId);
        message.callbackData !== undefined &&
            (obj.callbackData = base64FromBytes(message.callbackData !== undefined
                ? message.callbackData
                : new Uint8Array()));
        message.timeoutPolicy !== undefined &&
            (obj.timeoutPolicy = timeoutPolicyToJSON(message.timeoutPolicy));
        message.timeoutDuration !== undefined &&
            (obj.timeoutDuration = message.timeoutDuration
                ? Duration.toJSON(message.timeoutDuration)
                : undefined);
        message.timeoutTimestamp !== undefined &&
            (obj.timeoutTimestamp = (message.timeoutTimestamp || BigInt(0)).toString());
        message.requestSent !== undefined &&
            (obj.requestSent = message.requestSent);
        message.submissionHeight !== undefined &&
            (obj.submissionHeight = (message.submissionHeight || BigInt(0)).toString());
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQuery();
        message.id = object.id ?? '';
        message.connectionId = object.connectionId ?? '';
        message.chainId = object.chainId ?? '';
        message.queryType = object.queryType ?? '';
        message.requestData = object.requestData ?? new Uint8Array();
        message.callbackModule = object.callbackModule ?? '';
        message.callbackId = object.callbackId ?? '';
        message.callbackData = object.callbackData ?? new Uint8Array();
        message.timeoutPolicy = object.timeoutPolicy ?? 0;
        message.timeoutDuration =
            object.timeoutDuration !== undefined && object.timeoutDuration !== null
                ? Duration.fromPartial(object.timeoutDuration)
                : undefined;
        message.timeoutTimestamp =
            object.timeoutTimestamp !== undefined && object.timeoutTimestamp !== null
                ? BigInt(object.timeoutTimestamp.toString())
                : BigInt(0);
        message.requestSent = object.requestSent ?? false;
        message.submissionHeight =
            object.submissionHeight !== undefined && object.submissionHeight !== null
                ? BigInt(object.submissionHeight.toString())
                : BigInt(0);
        return message;
    },
    fromProtoMsg(message) {
        return Query.decode(message.value);
    },
    toProto(message) {
        return Query.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.interchainquery.v1.Query',
            value: Query.encode(message).finish(),
        };
    },
};
function createBaseDataPoint() {
    return {
        id: '',
        remoteHeight: '',
        localHeight: '',
        value: new Uint8Array(),
    };
}
export const DataPoint = {
    typeUrl: '/stride.interchainquery.v1.DataPoint',
    encode(message, writer = BinaryWriter.create()) {
        if (message.id !== '') {
            writer.uint32(10).string(message.id);
        }
        if (message.remoteHeight !== '') {
            writer.uint32(18).string(message.remoteHeight);
        }
        if (message.localHeight !== '') {
            writer.uint32(26).string(message.localHeight);
        }
        if (message.value.length !== 0) {
            writer.uint32(34).bytes(message.value);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseDataPoint();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.id = reader.string();
                    break;
                case 2:
                    message.remoteHeight = reader.string();
                    break;
                case 3:
                    message.localHeight = reader.string();
                    break;
                case 4:
                    message.value = reader.bytes();
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
            id: isSet(object.id) ? String(object.id) : '',
            remoteHeight: isSet(object.remoteHeight)
                ? String(object.remoteHeight)
                : '',
            localHeight: isSet(object.localHeight) ? String(object.localHeight) : '',
            value: isSet(object.value)
                ? bytesFromBase64(object.value)
                : new Uint8Array(),
        };
    },
    toJSON(message) {
        const obj = {};
        message.id !== undefined && (obj.id = message.id);
        message.remoteHeight !== undefined &&
            (obj.remoteHeight = message.remoteHeight);
        message.localHeight !== undefined &&
            (obj.localHeight = message.localHeight);
        message.value !== undefined &&
            (obj.value = base64FromBytes(message.value !== undefined ? message.value : new Uint8Array()));
        return obj;
    },
    fromPartial(object) {
        const message = createBaseDataPoint();
        message.id = object.id ?? '';
        message.remoteHeight = object.remoteHeight ?? '';
        message.localHeight = object.localHeight ?? '';
        message.value = object.value ?? new Uint8Array();
        return message;
    },
    fromProtoMsg(message) {
        return DataPoint.decode(message.value);
    },
    toProto(message) {
        return DataPoint.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.interchainquery.v1.DataPoint',
            value: DataPoint.encode(message).finish(),
        };
    },
};
function createBaseGenesisState() {
    return {
        queries: [],
    };
}
export const GenesisState = {
    typeUrl: '/stride.interchainquery.v1.GenesisState',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.queries) {
            Query.encode(v, writer.uint32(10).fork()).ldelim();
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
                    message.queries.push(Query.decode(reader, reader.uint32()));
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
            queries: Array.isArray(object?.queries)
                ? object.queries.map((e) => Query.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.queries) {
            obj.queries = message.queries.map(e => (e ? Query.toJSON(e) : undefined));
        }
        else {
            obj.queries = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseGenesisState();
        message.queries = object.queries?.map(e => Query.fromPartial(e)) || [];
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
            typeUrl: '/stride.interchainquery.v1.GenesisState',
            value: GenesisState.encode(message).finish(),
        };
    },
};
//# sourceMappingURL=genesis.js.map