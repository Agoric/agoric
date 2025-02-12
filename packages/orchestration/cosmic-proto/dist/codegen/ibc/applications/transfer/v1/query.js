//@ts-nocheck
import { PageRequest, PageResponse, } from '../../../../cosmos/base/query/v1beta1/pagination.js';
import { DenomTrace, Params, } from './transfer.js';
import { BinaryReader, BinaryWriter } from '../../../../binary.js';
import { isSet } from '../../../../helpers.js';
import {} from '../../../../json-safe.js';
function createBaseQueryDenomTraceRequest() {
    return {
        hash: '',
    };
}
export const QueryDenomTraceRequest = {
    typeUrl: '/ibc.applications.transfer.v1.QueryDenomTraceRequest',
    encode(message, writer = BinaryWriter.create()) {
        if (message.hash !== '') {
            writer.uint32(10).string(message.hash);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryDenomTraceRequest();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.hash = reader.string();
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
            hash: isSet(object.hash) ? String(object.hash) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.hash !== undefined && (obj.hash = message.hash);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryDenomTraceRequest();
        message.hash = object.hash ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return QueryDenomTraceRequest.decode(message.value);
    },
    toProto(message) {
        return QueryDenomTraceRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.applications.transfer.v1.QueryDenomTraceRequest',
            value: QueryDenomTraceRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryDenomTraceResponse() {
    return {
        denomTrace: undefined,
    };
}
export const QueryDenomTraceResponse = {
    typeUrl: '/ibc.applications.transfer.v1.QueryDenomTraceResponse',
    encode(message, writer = BinaryWriter.create()) {
        if (message.denomTrace !== undefined) {
            DenomTrace.encode(message.denomTrace, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryDenomTraceResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.denomTrace = DenomTrace.decode(reader, reader.uint32());
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
            denomTrace: isSet(object.denomTrace)
                ? DenomTrace.fromJSON(object.denomTrace)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.denomTrace !== undefined &&
            (obj.denomTrace = message.denomTrace
                ? DenomTrace.toJSON(message.denomTrace)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryDenomTraceResponse();
        message.denomTrace =
            object.denomTrace !== undefined && object.denomTrace !== null
                ? DenomTrace.fromPartial(object.denomTrace)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return QueryDenomTraceResponse.decode(message.value);
    },
    toProto(message) {
        return QueryDenomTraceResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.applications.transfer.v1.QueryDenomTraceResponse',
            value: QueryDenomTraceResponse.encode(message).finish(),
        };
    },
};
function createBaseQueryDenomTracesRequest() {
    return {
        pagination: undefined,
    };
}
export const QueryDenomTracesRequest = {
    typeUrl: '/ibc.applications.transfer.v1.QueryDenomTracesRequest',
    encode(message, writer = BinaryWriter.create()) {
        if (message.pagination !== undefined) {
            PageRequest.encode(message.pagination, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryDenomTracesRequest();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.pagination = PageRequest.decode(reader, reader.uint32());
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
            pagination: isSet(object.pagination)
                ? PageRequest.fromJSON(object.pagination)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.pagination !== undefined &&
            (obj.pagination = message.pagination
                ? PageRequest.toJSON(message.pagination)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryDenomTracesRequest();
        message.pagination =
            object.pagination !== undefined && object.pagination !== null
                ? PageRequest.fromPartial(object.pagination)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return QueryDenomTracesRequest.decode(message.value);
    },
    toProto(message) {
        return QueryDenomTracesRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.applications.transfer.v1.QueryDenomTracesRequest',
            value: QueryDenomTracesRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryDenomTracesResponse() {
    return {
        denomTraces: [],
        pagination: undefined,
    };
}
export const QueryDenomTracesResponse = {
    typeUrl: '/ibc.applications.transfer.v1.QueryDenomTracesResponse',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.denomTraces) {
            DenomTrace.encode(v, writer.uint32(10).fork()).ldelim();
        }
        if (message.pagination !== undefined) {
            PageResponse.encode(message.pagination, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryDenomTracesResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.denomTraces.push(DenomTrace.decode(reader, reader.uint32()));
                    break;
                case 2:
                    message.pagination = PageResponse.decode(reader, reader.uint32());
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
            denomTraces: Array.isArray(object?.denomTraces)
                ? object.denomTraces.map((e) => DenomTrace.fromJSON(e))
                : [],
            pagination: isSet(object.pagination)
                ? PageResponse.fromJSON(object.pagination)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.denomTraces) {
            obj.denomTraces = message.denomTraces.map(e => e ? DenomTrace.toJSON(e) : undefined);
        }
        else {
            obj.denomTraces = [];
        }
        message.pagination !== undefined &&
            (obj.pagination = message.pagination
                ? PageResponse.toJSON(message.pagination)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryDenomTracesResponse();
        message.denomTraces =
            object.denomTraces?.map(e => DenomTrace.fromPartial(e)) || [];
        message.pagination =
            object.pagination !== undefined && object.pagination !== null
                ? PageResponse.fromPartial(object.pagination)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return QueryDenomTracesResponse.decode(message.value);
    },
    toProto(message) {
        return QueryDenomTracesResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.applications.transfer.v1.QueryDenomTracesResponse',
            value: QueryDenomTracesResponse.encode(message).finish(),
        };
    },
};
function createBaseQueryParamsRequest() {
    return {};
}
export const QueryParamsRequest = {
    typeUrl: '/ibc.applications.transfer.v1.QueryParamsRequest',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryParamsRequest();
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
        const message = createBaseQueryParamsRequest();
        return message;
    },
    fromProtoMsg(message) {
        return QueryParamsRequest.decode(message.value);
    },
    toProto(message) {
        return QueryParamsRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.applications.transfer.v1.QueryParamsRequest',
            value: QueryParamsRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryParamsResponse() {
    return {
        params: undefined,
    };
}
export const QueryParamsResponse = {
    typeUrl: '/ibc.applications.transfer.v1.QueryParamsResponse',
    encode(message, writer = BinaryWriter.create()) {
        if (message.params !== undefined) {
            Params.encode(message.params, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryParamsResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.params = Params.decode(reader, reader.uint32());
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
        };
    },
    toJSON(message) {
        const obj = {};
        message.params !== undefined &&
            (obj.params = message.params ? Params.toJSON(message.params) : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryParamsResponse();
        message.params =
            object.params !== undefined && object.params !== null
                ? Params.fromPartial(object.params)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return QueryParamsResponse.decode(message.value);
    },
    toProto(message) {
        return QueryParamsResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.applications.transfer.v1.QueryParamsResponse',
            value: QueryParamsResponse.encode(message).finish(),
        };
    },
};
function createBaseQueryDenomHashRequest() {
    return {
        trace: '',
    };
}
export const QueryDenomHashRequest = {
    typeUrl: '/ibc.applications.transfer.v1.QueryDenomHashRequest',
    encode(message, writer = BinaryWriter.create()) {
        if (message.trace !== '') {
            writer.uint32(10).string(message.trace);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryDenomHashRequest();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.trace = reader.string();
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
            trace: isSet(object.trace) ? String(object.trace) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.trace !== undefined && (obj.trace = message.trace);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryDenomHashRequest();
        message.trace = object.trace ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return QueryDenomHashRequest.decode(message.value);
    },
    toProto(message) {
        return QueryDenomHashRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.applications.transfer.v1.QueryDenomHashRequest',
            value: QueryDenomHashRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryDenomHashResponse() {
    return {
        hash: '',
    };
}
export const QueryDenomHashResponse = {
    typeUrl: '/ibc.applications.transfer.v1.QueryDenomHashResponse',
    encode(message, writer = BinaryWriter.create()) {
        if (message.hash !== '') {
            writer.uint32(10).string(message.hash);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryDenomHashResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.hash = reader.string();
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
            hash: isSet(object.hash) ? String(object.hash) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.hash !== undefined && (obj.hash = message.hash);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryDenomHashResponse();
        message.hash = object.hash ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return QueryDenomHashResponse.decode(message.value);
    },
    toProto(message) {
        return QueryDenomHashResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.applications.transfer.v1.QueryDenomHashResponse',
            value: QueryDenomHashResponse.encode(message).finish(),
        };
    },
};
function createBaseQueryEscrowAddressRequest() {
    return {
        portId: '',
        channelId: '',
    };
}
export const QueryEscrowAddressRequest = {
    typeUrl: '/ibc.applications.transfer.v1.QueryEscrowAddressRequest',
    encode(message, writer = BinaryWriter.create()) {
        if (message.portId !== '') {
            writer.uint32(10).string(message.portId);
        }
        if (message.channelId !== '') {
            writer.uint32(18).string(message.channelId);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryEscrowAddressRequest();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.portId = reader.string();
                    break;
                case 2:
                    message.channelId = reader.string();
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
            portId: isSet(object.portId) ? String(object.portId) : '',
            channelId: isSet(object.channelId) ? String(object.channelId) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.portId !== undefined && (obj.portId = message.portId);
        message.channelId !== undefined && (obj.channelId = message.channelId);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryEscrowAddressRequest();
        message.portId = object.portId ?? '';
        message.channelId = object.channelId ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return QueryEscrowAddressRequest.decode(message.value);
    },
    toProto(message) {
        return QueryEscrowAddressRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.applications.transfer.v1.QueryEscrowAddressRequest',
            value: QueryEscrowAddressRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryEscrowAddressResponse() {
    return {
        escrowAddress: '',
    };
}
export const QueryEscrowAddressResponse = {
    typeUrl: '/ibc.applications.transfer.v1.QueryEscrowAddressResponse',
    encode(message, writer = BinaryWriter.create()) {
        if (message.escrowAddress !== '') {
            writer.uint32(10).string(message.escrowAddress);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryEscrowAddressResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.escrowAddress = reader.string();
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
            escrowAddress: isSet(object.escrowAddress)
                ? String(object.escrowAddress)
                : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.escrowAddress !== undefined &&
            (obj.escrowAddress = message.escrowAddress);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryEscrowAddressResponse();
        message.escrowAddress = object.escrowAddress ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return QueryEscrowAddressResponse.decode(message.value);
    },
    toProto(message) {
        return QueryEscrowAddressResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.applications.transfer.v1.QueryEscrowAddressResponse',
            value: QueryEscrowAddressResponse.encode(message).finish(),
        };
    },
};
//# sourceMappingURL=query.js.map