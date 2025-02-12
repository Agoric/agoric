//@ts-nocheck
import { PageRequest, PageResponse, } from '../../cosmos/base/query/v1beta1/pagination.js';
import { Params } from './params.js';
import { CallbackData } from './callback_data.js';
import { BinaryReader, BinaryWriter } from '../../binary.js';
import {} from '../../json-safe.js';
import { isSet } from '../../helpers.js';
function createBaseQueryParamsRequest() {
    return {};
}
export const QueryParamsRequest = {
    typeUrl: '/stride.icacallbacks.QueryParamsRequest',
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
            typeUrl: '/stride.icacallbacks.QueryParamsRequest',
            value: QueryParamsRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryParamsResponse() {
    return {
        params: Params.fromPartial({}),
    };
}
export const QueryParamsResponse = {
    typeUrl: '/stride.icacallbacks.QueryParamsResponse',
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
            typeUrl: '/stride.icacallbacks.QueryParamsResponse',
            value: QueryParamsResponse.encode(message).finish(),
        };
    },
};
function createBaseQueryGetCallbackDataRequest() {
    return {
        callbackKey: '',
    };
}
export const QueryGetCallbackDataRequest = {
    typeUrl: '/stride.icacallbacks.QueryGetCallbackDataRequest',
    encode(message, writer = BinaryWriter.create()) {
        if (message.callbackKey !== '') {
            writer.uint32(10).string(message.callbackKey);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryGetCallbackDataRequest();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.callbackKey = reader.string();
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
            callbackKey: isSet(object.callbackKey) ? String(object.callbackKey) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.callbackKey !== undefined &&
            (obj.callbackKey = message.callbackKey);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryGetCallbackDataRequest();
        message.callbackKey = object.callbackKey ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return QueryGetCallbackDataRequest.decode(message.value);
    },
    toProto(message) {
        return QueryGetCallbackDataRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.icacallbacks.QueryGetCallbackDataRequest',
            value: QueryGetCallbackDataRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryGetCallbackDataResponse() {
    return {
        callbackData: CallbackData.fromPartial({}),
    };
}
export const QueryGetCallbackDataResponse = {
    typeUrl: '/stride.icacallbacks.QueryGetCallbackDataResponse',
    encode(message, writer = BinaryWriter.create()) {
        if (message.callbackData !== undefined) {
            CallbackData.encode(message.callbackData, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryGetCallbackDataResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.callbackData = CallbackData.decode(reader, reader.uint32());
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
            callbackData: isSet(object.callbackData)
                ? CallbackData.fromJSON(object.callbackData)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.callbackData !== undefined &&
            (obj.callbackData = message.callbackData
                ? CallbackData.toJSON(message.callbackData)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryGetCallbackDataResponse();
        message.callbackData =
            object.callbackData !== undefined && object.callbackData !== null
                ? CallbackData.fromPartial(object.callbackData)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return QueryGetCallbackDataResponse.decode(message.value);
    },
    toProto(message) {
        return QueryGetCallbackDataResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.icacallbacks.QueryGetCallbackDataResponse',
            value: QueryGetCallbackDataResponse.encode(message).finish(),
        };
    },
};
function createBaseQueryAllCallbackDataRequest() {
    return {
        pagination: undefined,
    };
}
export const QueryAllCallbackDataRequest = {
    typeUrl: '/stride.icacallbacks.QueryAllCallbackDataRequest',
    encode(message, writer = BinaryWriter.create()) {
        if (message.pagination !== undefined) {
            PageRequest.encode(message.pagination, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryAllCallbackDataRequest();
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
        const message = createBaseQueryAllCallbackDataRequest();
        message.pagination =
            object.pagination !== undefined && object.pagination !== null
                ? PageRequest.fromPartial(object.pagination)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return QueryAllCallbackDataRequest.decode(message.value);
    },
    toProto(message) {
        return QueryAllCallbackDataRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.icacallbacks.QueryAllCallbackDataRequest',
            value: QueryAllCallbackDataRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryAllCallbackDataResponse() {
    return {
        callbackData: [],
        pagination: undefined,
    };
}
export const QueryAllCallbackDataResponse = {
    typeUrl: '/stride.icacallbacks.QueryAllCallbackDataResponse',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.callbackData) {
            CallbackData.encode(v, writer.uint32(10).fork()).ldelim();
        }
        if (message.pagination !== undefined) {
            PageResponse.encode(message.pagination, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryAllCallbackDataResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.callbackData.push(CallbackData.decode(reader, reader.uint32()));
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
            callbackData: Array.isArray(object?.callbackData)
                ? object.callbackData.map((e) => CallbackData.fromJSON(e))
                : [],
            pagination: isSet(object.pagination)
                ? PageResponse.fromJSON(object.pagination)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.callbackData) {
            obj.callbackData = message.callbackData.map(e => e ? CallbackData.toJSON(e) : undefined);
        }
        else {
            obj.callbackData = [];
        }
        message.pagination !== undefined &&
            (obj.pagination = message.pagination
                ? PageResponse.toJSON(message.pagination)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryAllCallbackDataResponse();
        message.callbackData =
            object.callbackData?.map(e => CallbackData.fromPartial(e)) || [];
        message.pagination =
            object.pagination !== undefined && object.pagination !== null
                ? PageResponse.fromPartial(object.pagination)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return QueryAllCallbackDataResponse.decode(message.value);
    },
    toProto(message) {
        return QueryAllCallbackDataResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.icacallbacks.QueryAllCallbackDataResponse',
            value: QueryAllCallbackDataResponse.encode(message).finish(),
        };
    },
};
//# sourceMappingURL=query.js.map