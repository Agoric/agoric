//@ts-nocheck
import { ParamChange } from './params.js';
import { BinaryReader, BinaryWriter } from '../../../binary.js';
import { isSet } from '../../../helpers.js';
import {} from '../../../json-safe.js';
function createBaseQueryParamsRequest() {
    return {
        subspace: '',
        key: '',
    };
}
export const QueryParamsRequest = {
    typeUrl: '/cosmos.params.v1beta1.QueryParamsRequest',
    encode(message, writer = BinaryWriter.create()) {
        if (message.subspace !== '') {
            writer.uint32(10).string(message.subspace);
        }
        if (message.key !== '') {
            writer.uint32(18).string(message.key);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryParamsRequest();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.subspace = reader.string();
                    break;
                case 2:
                    message.key = reader.string();
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
            subspace: isSet(object.subspace) ? String(object.subspace) : '',
            key: isSet(object.key) ? String(object.key) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.subspace !== undefined && (obj.subspace = message.subspace);
        message.key !== undefined && (obj.key = message.key);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryParamsRequest();
        message.subspace = object.subspace ?? '';
        message.key = object.key ?? '';
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
            typeUrl: '/cosmos.params.v1beta1.QueryParamsRequest',
            value: QueryParamsRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryParamsResponse() {
    return {
        param: ParamChange.fromPartial({}),
    };
}
export const QueryParamsResponse = {
    typeUrl: '/cosmos.params.v1beta1.QueryParamsResponse',
    encode(message, writer = BinaryWriter.create()) {
        if (message.param !== undefined) {
            ParamChange.encode(message.param, writer.uint32(10).fork()).ldelim();
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
                    message.param = ParamChange.decode(reader, reader.uint32());
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
            param: isSet(object.param)
                ? ParamChange.fromJSON(object.param)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.param !== undefined &&
            (obj.param = message.param
                ? ParamChange.toJSON(message.param)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryParamsResponse();
        message.param =
            object.param !== undefined && object.param !== null
                ? ParamChange.fromPartial(object.param)
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
            typeUrl: '/cosmos.params.v1beta1.QueryParamsResponse',
            value: QueryParamsResponse.encode(message).finish(),
        };
    },
};
function createBaseQuerySubspacesRequest() {
    return {};
}
export const QuerySubspacesRequest = {
    typeUrl: '/cosmos.params.v1beta1.QuerySubspacesRequest',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQuerySubspacesRequest();
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
        const message = createBaseQuerySubspacesRequest();
        return message;
    },
    fromProtoMsg(message) {
        return QuerySubspacesRequest.decode(message.value);
    },
    toProto(message) {
        return QuerySubspacesRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.params.v1beta1.QuerySubspacesRequest',
            value: QuerySubspacesRequest.encode(message).finish(),
        };
    },
};
function createBaseQuerySubspacesResponse() {
    return {
        subspaces: [],
    };
}
export const QuerySubspacesResponse = {
    typeUrl: '/cosmos.params.v1beta1.QuerySubspacesResponse',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.subspaces) {
            Subspace.encode(v, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQuerySubspacesResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.subspaces.push(Subspace.decode(reader, reader.uint32()));
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
            subspaces: Array.isArray(object?.subspaces)
                ? object.subspaces.map((e) => Subspace.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.subspaces) {
            obj.subspaces = message.subspaces.map(e => e ? Subspace.toJSON(e) : undefined);
        }
        else {
            obj.subspaces = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQuerySubspacesResponse();
        message.subspaces =
            object.subspaces?.map(e => Subspace.fromPartial(e)) || [];
        return message;
    },
    fromProtoMsg(message) {
        return QuerySubspacesResponse.decode(message.value);
    },
    toProto(message) {
        return QuerySubspacesResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.params.v1beta1.QuerySubspacesResponse',
            value: QuerySubspacesResponse.encode(message).finish(),
        };
    },
};
function createBaseSubspace() {
    return {
        subspace: '',
        keys: [],
    };
}
export const Subspace = {
    typeUrl: '/cosmos.params.v1beta1.Subspace',
    encode(message, writer = BinaryWriter.create()) {
        if (message.subspace !== '') {
            writer.uint32(10).string(message.subspace);
        }
        for (const v of message.keys) {
            writer.uint32(18).string(v);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseSubspace();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.subspace = reader.string();
                    break;
                case 2:
                    message.keys.push(reader.string());
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
            subspace: isSet(object.subspace) ? String(object.subspace) : '',
            keys: Array.isArray(object?.keys)
                ? object.keys.map((e) => String(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        message.subspace !== undefined && (obj.subspace = message.subspace);
        if (message.keys) {
            obj.keys = message.keys.map(e => e);
        }
        else {
            obj.keys = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseSubspace();
        message.subspace = object.subspace ?? '';
        message.keys = object.keys?.map(e => e) || [];
        return message;
    },
    fromProtoMsg(message) {
        return Subspace.decode(message.value);
    },
    toProto(message) {
        return Subspace.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.params.v1beta1.Subspace',
            value: Subspace.encode(message).finish(),
        };
    },
};
//# sourceMappingURL=query.js.map