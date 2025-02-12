//@ts-nocheck
import { PageRequest, PageResponse, } from '../../cosmos/base/query/v1beta1/pagination.js';
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { isSet } from '../../helpers.js';
import {} from '../../json-safe.js';
function createBaseQueryDataRequest() {
    return {
        path: '',
    };
}
export const QueryDataRequest = {
    typeUrl: '/agoric.vstorage.QueryDataRequest',
    encode(message, writer = BinaryWriter.create()) {
        if (message.path !== '') {
            writer.uint32(10).string(message.path);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryDataRequest();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.path = reader.string();
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
            path: isSet(object.path) ? String(object.path) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.path !== undefined && (obj.path = message.path);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryDataRequest();
        message.path = object.path ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return QueryDataRequest.decode(message.value);
    },
    toProto(message) {
        return QueryDataRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/agoric.vstorage.QueryDataRequest',
            value: QueryDataRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryDataResponse() {
    return {
        value: '',
    };
}
export const QueryDataResponse = {
    typeUrl: '/agoric.vstorage.QueryDataResponse',
    encode(message, writer = BinaryWriter.create()) {
        if (message.value !== '') {
            writer.uint32(10).string(message.value);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryDataResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.value = reader.string();
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
            value: isSet(object.value) ? String(object.value) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.value !== undefined && (obj.value = message.value);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryDataResponse();
        message.value = object.value ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return QueryDataResponse.decode(message.value);
    },
    toProto(message) {
        return QueryDataResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/agoric.vstorage.QueryDataResponse',
            value: QueryDataResponse.encode(message).finish(),
        };
    },
};
function createBaseQueryCapDataRequest() {
    return {
        path: '',
        mediaType: '',
        itemFormat: '',
        remotableValueFormat: '',
    };
}
export const QueryCapDataRequest = {
    typeUrl: '/agoric.vstorage.QueryCapDataRequest',
    encode(message, writer = BinaryWriter.create()) {
        if (message.path !== '') {
            writer.uint32(10).string(message.path);
        }
        if (message.mediaType !== '') {
            writer.uint32(18).string(message.mediaType);
        }
        if (message.itemFormat !== '') {
            writer.uint32(26).string(message.itemFormat);
        }
        if (message.remotableValueFormat !== '') {
            writer.uint32(82).string(message.remotableValueFormat);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryCapDataRequest();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.path = reader.string();
                    break;
                case 2:
                    message.mediaType = reader.string();
                    break;
                case 3:
                    message.itemFormat = reader.string();
                    break;
                case 10:
                    message.remotableValueFormat = reader.string();
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
            path: isSet(object.path) ? String(object.path) : '',
            mediaType: isSet(object.mediaType) ? String(object.mediaType) : '',
            itemFormat: isSet(object.itemFormat) ? String(object.itemFormat) : '',
            remotableValueFormat: isSet(object.remotableValueFormat)
                ? String(object.remotableValueFormat)
                : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.path !== undefined && (obj.path = message.path);
        message.mediaType !== undefined && (obj.mediaType = message.mediaType);
        message.itemFormat !== undefined && (obj.itemFormat = message.itemFormat);
        message.remotableValueFormat !== undefined &&
            (obj.remotableValueFormat = message.remotableValueFormat);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryCapDataRequest();
        message.path = object.path ?? '';
        message.mediaType = object.mediaType ?? '';
        message.itemFormat = object.itemFormat ?? '';
        message.remotableValueFormat = object.remotableValueFormat ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return QueryCapDataRequest.decode(message.value);
    },
    toProto(message) {
        return QueryCapDataRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/agoric.vstorage.QueryCapDataRequest',
            value: QueryCapDataRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryCapDataResponse() {
    return {
        blockHeight: '',
        value: '',
    };
}
export const QueryCapDataResponse = {
    typeUrl: '/agoric.vstorage.QueryCapDataResponse',
    encode(message, writer = BinaryWriter.create()) {
        if (message.blockHeight !== '') {
            writer.uint32(10).string(message.blockHeight);
        }
        if (message.value !== '') {
            writer.uint32(82).string(message.value);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryCapDataResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.blockHeight = reader.string();
                    break;
                case 10:
                    message.value = reader.string();
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
            blockHeight: isSet(object.blockHeight) ? String(object.blockHeight) : '',
            value: isSet(object.value) ? String(object.value) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.blockHeight !== undefined &&
            (obj.blockHeight = message.blockHeight);
        message.value !== undefined && (obj.value = message.value);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryCapDataResponse();
        message.blockHeight = object.blockHeight ?? '';
        message.value = object.value ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return QueryCapDataResponse.decode(message.value);
    },
    toProto(message) {
        return QueryCapDataResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/agoric.vstorage.QueryCapDataResponse',
            value: QueryCapDataResponse.encode(message).finish(),
        };
    },
};
function createBaseQueryChildrenRequest() {
    return {
        path: '',
        pagination: undefined,
    };
}
export const QueryChildrenRequest = {
    typeUrl: '/agoric.vstorage.QueryChildrenRequest',
    encode(message, writer = BinaryWriter.create()) {
        if (message.path !== '') {
            writer.uint32(10).string(message.path);
        }
        if (message.pagination !== undefined) {
            PageRequest.encode(message.pagination, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryChildrenRequest();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.path = reader.string();
                    break;
                case 2:
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
            path: isSet(object.path) ? String(object.path) : '',
            pagination: isSet(object.pagination)
                ? PageRequest.fromJSON(object.pagination)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.path !== undefined && (obj.path = message.path);
        message.pagination !== undefined &&
            (obj.pagination = message.pagination
                ? PageRequest.toJSON(message.pagination)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryChildrenRequest();
        message.path = object.path ?? '';
        message.pagination =
            object.pagination !== undefined && object.pagination !== null
                ? PageRequest.fromPartial(object.pagination)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return QueryChildrenRequest.decode(message.value);
    },
    toProto(message) {
        return QueryChildrenRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/agoric.vstorage.QueryChildrenRequest',
            value: QueryChildrenRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryChildrenResponse() {
    return {
        children: [],
        pagination: undefined,
    };
}
export const QueryChildrenResponse = {
    typeUrl: '/agoric.vstorage.QueryChildrenResponse',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.children) {
            writer.uint32(10).string(v);
        }
        if (message.pagination !== undefined) {
            PageResponse.encode(message.pagination, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryChildrenResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.children.push(reader.string());
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
            children: Array.isArray(object?.children)
                ? object.children.map((e) => String(e))
                : [],
            pagination: isSet(object.pagination)
                ? PageResponse.fromJSON(object.pagination)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.children) {
            obj.children = message.children.map(e => e);
        }
        else {
            obj.children = [];
        }
        message.pagination !== undefined &&
            (obj.pagination = message.pagination
                ? PageResponse.toJSON(message.pagination)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryChildrenResponse();
        message.children = object.children?.map(e => e) || [];
        message.pagination =
            object.pagination !== undefined && object.pagination !== null
                ? PageResponse.fromPartial(object.pagination)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return QueryChildrenResponse.decode(message.value);
    },
    toProto(message) {
        return QueryChildrenResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/agoric.vstorage.QueryChildrenResponse',
            value: QueryChildrenResponse.encode(message).finish(),
        };
    },
};
//# sourceMappingURL=query.js.map