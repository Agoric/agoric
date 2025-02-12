//@ts-nocheck
import { Params } from './mint.js';
import { BinaryReader, BinaryWriter } from '../../../binary.js';
import {} from '../../../json-safe.js';
import { isSet, bytesFromBase64, base64FromBytes } from '../../../helpers.js';
function createBaseQueryParamsRequest() {
    return {};
}
export const QueryParamsRequest = {
    typeUrl: '/stride.mint.v1beta1.QueryParamsRequest',
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
            typeUrl: '/stride.mint.v1beta1.QueryParamsRequest',
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
    typeUrl: '/stride.mint.v1beta1.QueryParamsResponse',
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
            typeUrl: '/stride.mint.v1beta1.QueryParamsResponse',
            value: QueryParamsResponse.encode(message).finish(),
        };
    },
};
function createBaseQueryEpochProvisionsRequest() {
    return {};
}
export const QueryEpochProvisionsRequest = {
    typeUrl: '/stride.mint.v1beta1.QueryEpochProvisionsRequest',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryEpochProvisionsRequest();
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
        const message = createBaseQueryEpochProvisionsRequest();
        return message;
    },
    fromProtoMsg(message) {
        return QueryEpochProvisionsRequest.decode(message.value);
    },
    toProto(message) {
        return QueryEpochProvisionsRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.mint.v1beta1.QueryEpochProvisionsRequest',
            value: QueryEpochProvisionsRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryEpochProvisionsResponse() {
    return {
        epochProvisions: new Uint8Array(),
    };
}
export const QueryEpochProvisionsResponse = {
    typeUrl: '/stride.mint.v1beta1.QueryEpochProvisionsResponse',
    encode(message, writer = BinaryWriter.create()) {
        if (message.epochProvisions.length !== 0) {
            writer.uint32(10).bytes(message.epochProvisions);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryEpochProvisionsResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.epochProvisions = reader.bytes();
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
            epochProvisions: isSet(object.epochProvisions)
                ? bytesFromBase64(object.epochProvisions)
                : new Uint8Array(),
        };
    },
    toJSON(message) {
        const obj = {};
        message.epochProvisions !== undefined &&
            (obj.epochProvisions = base64FromBytes(message.epochProvisions !== undefined
                ? message.epochProvisions
                : new Uint8Array()));
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryEpochProvisionsResponse();
        message.epochProvisions = object.epochProvisions ?? new Uint8Array();
        return message;
    },
    fromProtoMsg(message) {
        return QueryEpochProvisionsResponse.decode(message.value);
    },
    toProto(message) {
        return QueryEpochProvisionsResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.mint.v1beta1.QueryEpochProvisionsResponse',
            value: QueryEpochProvisionsResponse.encode(message).finish(),
        };
    },
};
//# sourceMappingURL=query.js.map