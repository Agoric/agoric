//@ts-nocheck
import { Params, State, } from './vbank.js';
import { BinaryReader, BinaryWriter } from '../../binary.js';
import {} from '../../json-safe.js';
import { isSet } from '../../helpers.js';
function createBaseQueryParamsRequest() {
    return {};
}
export const QueryParamsRequest = {
    typeUrl: '/agoric.vbank.QueryParamsRequest',
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
            typeUrl: '/agoric.vbank.QueryParamsRequest',
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
    typeUrl: '/agoric.vbank.QueryParamsResponse',
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
            typeUrl: '/agoric.vbank.QueryParamsResponse',
            value: QueryParamsResponse.encode(message).finish(),
        };
    },
};
function createBaseQueryStateRequest() {
    return {};
}
export const QueryStateRequest = {
    typeUrl: '/agoric.vbank.QueryStateRequest',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryStateRequest();
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
        const message = createBaseQueryStateRequest();
        return message;
    },
    fromProtoMsg(message) {
        return QueryStateRequest.decode(message.value);
    },
    toProto(message) {
        return QueryStateRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/agoric.vbank.QueryStateRequest',
            value: QueryStateRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryStateResponse() {
    return {
        state: State.fromPartial({}),
    };
}
export const QueryStateResponse = {
    typeUrl: '/agoric.vbank.QueryStateResponse',
    encode(message, writer = BinaryWriter.create()) {
        if (message.state !== undefined) {
            State.encode(message.state, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryStateResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.state = State.decode(reader, reader.uint32());
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
            state: isSet(object.state) ? State.fromJSON(object.state) : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.state !== undefined &&
            (obj.state = message.state ? State.toJSON(message.state) : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryStateResponse();
        message.state =
            object.state !== undefined && object.state !== null
                ? State.fromPartial(object.state)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return QueryStateResponse.decode(message.value);
    },
    toProto(message) {
        return QueryStateResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/agoric.vbank.QueryStateResponse',
            value: QueryStateResponse.encode(message).finish(),
        };
    },
};
//# sourceMappingURL=query.js.map