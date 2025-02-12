//@ts-nocheck
import { PageRequest, PageResponse, } from '../../base/query/v1beta1/pagination.js';
import { Grant, GrantAuthorization, } from './authz.js';
import { BinaryReader, BinaryWriter } from '../../../binary.js';
import { isSet } from '../../../helpers.js';
import {} from '../../../json-safe.js';
function createBaseQueryGrantsRequest() {
    return {
        granter: '',
        grantee: '',
        msgTypeUrl: '',
        pagination: undefined,
    };
}
export const QueryGrantsRequest = {
    typeUrl: '/cosmos.authz.v1beta1.QueryGrantsRequest',
    encode(message, writer = BinaryWriter.create()) {
        if (message.granter !== '') {
            writer.uint32(10).string(message.granter);
        }
        if (message.grantee !== '') {
            writer.uint32(18).string(message.grantee);
        }
        if (message.msgTypeUrl !== '') {
            writer.uint32(26).string(message.msgTypeUrl);
        }
        if (message.pagination !== undefined) {
            PageRequest.encode(message.pagination, writer.uint32(34).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryGrantsRequest();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.granter = reader.string();
                    break;
                case 2:
                    message.grantee = reader.string();
                    break;
                case 3:
                    message.msgTypeUrl = reader.string();
                    break;
                case 4:
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
            granter: isSet(object.granter) ? String(object.granter) : '',
            grantee: isSet(object.grantee) ? String(object.grantee) : '',
            msgTypeUrl: isSet(object.msgTypeUrl) ? String(object.msgTypeUrl) : '',
            pagination: isSet(object.pagination)
                ? PageRequest.fromJSON(object.pagination)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.granter !== undefined && (obj.granter = message.granter);
        message.grantee !== undefined && (obj.grantee = message.grantee);
        message.msgTypeUrl !== undefined && (obj.msgTypeUrl = message.msgTypeUrl);
        message.pagination !== undefined &&
            (obj.pagination = message.pagination
                ? PageRequest.toJSON(message.pagination)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryGrantsRequest();
        message.granter = object.granter ?? '';
        message.grantee = object.grantee ?? '';
        message.msgTypeUrl = object.msgTypeUrl ?? '';
        message.pagination =
            object.pagination !== undefined && object.pagination !== null
                ? PageRequest.fromPartial(object.pagination)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return QueryGrantsRequest.decode(message.value);
    },
    toProto(message) {
        return QueryGrantsRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.authz.v1beta1.QueryGrantsRequest',
            value: QueryGrantsRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryGrantsResponse() {
    return {
        grants: [],
        pagination: undefined,
    };
}
export const QueryGrantsResponse = {
    typeUrl: '/cosmos.authz.v1beta1.QueryGrantsResponse',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.grants) {
            Grant.encode(v, writer.uint32(10).fork()).ldelim();
        }
        if (message.pagination !== undefined) {
            PageResponse.encode(message.pagination, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryGrantsResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.grants.push(Grant.decode(reader, reader.uint32()));
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
            grants: Array.isArray(object?.grants)
                ? object.grants.map((e) => Grant.fromJSON(e))
                : [],
            pagination: isSet(object.pagination)
                ? PageResponse.fromJSON(object.pagination)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.grants) {
            obj.grants = message.grants.map(e => (e ? Grant.toJSON(e) : undefined));
        }
        else {
            obj.grants = [];
        }
        message.pagination !== undefined &&
            (obj.pagination = message.pagination
                ? PageResponse.toJSON(message.pagination)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryGrantsResponse();
        message.grants = object.grants?.map(e => Grant.fromPartial(e)) || [];
        message.pagination =
            object.pagination !== undefined && object.pagination !== null
                ? PageResponse.fromPartial(object.pagination)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return QueryGrantsResponse.decode(message.value);
    },
    toProto(message) {
        return QueryGrantsResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.authz.v1beta1.QueryGrantsResponse',
            value: QueryGrantsResponse.encode(message).finish(),
        };
    },
};
function createBaseQueryGranterGrantsRequest() {
    return {
        granter: '',
        pagination: undefined,
    };
}
export const QueryGranterGrantsRequest = {
    typeUrl: '/cosmos.authz.v1beta1.QueryGranterGrantsRequest',
    encode(message, writer = BinaryWriter.create()) {
        if (message.granter !== '') {
            writer.uint32(10).string(message.granter);
        }
        if (message.pagination !== undefined) {
            PageRequest.encode(message.pagination, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryGranterGrantsRequest();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.granter = reader.string();
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
            granter: isSet(object.granter) ? String(object.granter) : '',
            pagination: isSet(object.pagination)
                ? PageRequest.fromJSON(object.pagination)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.granter !== undefined && (obj.granter = message.granter);
        message.pagination !== undefined &&
            (obj.pagination = message.pagination
                ? PageRequest.toJSON(message.pagination)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryGranterGrantsRequest();
        message.granter = object.granter ?? '';
        message.pagination =
            object.pagination !== undefined && object.pagination !== null
                ? PageRequest.fromPartial(object.pagination)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return QueryGranterGrantsRequest.decode(message.value);
    },
    toProto(message) {
        return QueryGranterGrantsRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.authz.v1beta1.QueryGranterGrantsRequest',
            value: QueryGranterGrantsRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryGranterGrantsResponse() {
    return {
        grants: [],
        pagination: undefined,
    };
}
export const QueryGranterGrantsResponse = {
    typeUrl: '/cosmos.authz.v1beta1.QueryGranterGrantsResponse',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.grants) {
            GrantAuthorization.encode(v, writer.uint32(10).fork()).ldelim();
        }
        if (message.pagination !== undefined) {
            PageResponse.encode(message.pagination, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryGranterGrantsResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.grants.push(GrantAuthorization.decode(reader, reader.uint32()));
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
            grants: Array.isArray(object?.grants)
                ? object.grants.map((e) => GrantAuthorization.fromJSON(e))
                : [],
            pagination: isSet(object.pagination)
                ? PageResponse.fromJSON(object.pagination)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.grants) {
            obj.grants = message.grants.map(e => e ? GrantAuthorization.toJSON(e) : undefined);
        }
        else {
            obj.grants = [];
        }
        message.pagination !== undefined &&
            (obj.pagination = message.pagination
                ? PageResponse.toJSON(message.pagination)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryGranterGrantsResponse();
        message.grants =
            object.grants?.map(e => GrantAuthorization.fromPartial(e)) || [];
        message.pagination =
            object.pagination !== undefined && object.pagination !== null
                ? PageResponse.fromPartial(object.pagination)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return QueryGranterGrantsResponse.decode(message.value);
    },
    toProto(message) {
        return QueryGranterGrantsResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.authz.v1beta1.QueryGranterGrantsResponse',
            value: QueryGranterGrantsResponse.encode(message).finish(),
        };
    },
};
function createBaseQueryGranteeGrantsRequest() {
    return {
        grantee: '',
        pagination: undefined,
    };
}
export const QueryGranteeGrantsRequest = {
    typeUrl: '/cosmos.authz.v1beta1.QueryGranteeGrantsRequest',
    encode(message, writer = BinaryWriter.create()) {
        if (message.grantee !== '') {
            writer.uint32(10).string(message.grantee);
        }
        if (message.pagination !== undefined) {
            PageRequest.encode(message.pagination, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryGranteeGrantsRequest();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.grantee = reader.string();
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
            grantee: isSet(object.grantee) ? String(object.grantee) : '',
            pagination: isSet(object.pagination)
                ? PageRequest.fromJSON(object.pagination)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.grantee !== undefined && (obj.grantee = message.grantee);
        message.pagination !== undefined &&
            (obj.pagination = message.pagination
                ? PageRequest.toJSON(message.pagination)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryGranteeGrantsRequest();
        message.grantee = object.grantee ?? '';
        message.pagination =
            object.pagination !== undefined && object.pagination !== null
                ? PageRequest.fromPartial(object.pagination)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return QueryGranteeGrantsRequest.decode(message.value);
    },
    toProto(message) {
        return QueryGranteeGrantsRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.authz.v1beta1.QueryGranteeGrantsRequest',
            value: QueryGranteeGrantsRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryGranteeGrantsResponse() {
    return {
        grants: [],
        pagination: undefined,
    };
}
export const QueryGranteeGrantsResponse = {
    typeUrl: '/cosmos.authz.v1beta1.QueryGranteeGrantsResponse',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.grants) {
            GrantAuthorization.encode(v, writer.uint32(10).fork()).ldelim();
        }
        if (message.pagination !== undefined) {
            PageResponse.encode(message.pagination, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryGranteeGrantsResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.grants.push(GrantAuthorization.decode(reader, reader.uint32()));
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
            grants: Array.isArray(object?.grants)
                ? object.grants.map((e) => GrantAuthorization.fromJSON(e))
                : [],
            pagination: isSet(object.pagination)
                ? PageResponse.fromJSON(object.pagination)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.grants) {
            obj.grants = message.grants.map(e => e ? GrantAuthorization.toJSON(e) : undefined);
        }
        else {
            obj.grants = [];
        }
        message.pagination !== undefined &&
            (obj.pagination = message.pagination
                ? PageResponse.toJSON(message.pagination)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryGranteeGrantsResponse();
        message.grants =
            object.grants?.map(e => GrantAuthorization.fromPartial(e)) || [];
        message.pagination =
            object.pagination !== undefined && object.pagination !== null
                ? PageResponse.fromPartial(object.pagination)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return QueryGranteeGrantsResponse.decode(message.value);
    },
    toProto(message) {
        return QueryGranteeGrantsResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.authz.v1beta1.QueryGranteeGrantsResponse',
            value: QueryGranteeGrantsResponse.encode(message).finish(),
        };
    },
};
//# sourceMappingURL=query.js.map