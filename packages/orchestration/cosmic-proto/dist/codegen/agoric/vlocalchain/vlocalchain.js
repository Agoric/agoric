//@ts-nocheck
import { Any } from '../../google/protobuf/any.js';
import { BinaryReader, BinaryWriter } from '../../binary.js';
import {} from '../../json-safe.js';
import { isSet } from '../../helpers.js';
function createBaseCosmosTx() {
    return {
        messages: [],
    };
}
export const CosmosTx = {
    typeUrl: '/agoric.vlocalchain.CosmosTx',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.messages) {
            Any.encode(v, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseCosmosTx();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.messages.push(Any.decode(reader, reader.uint32()));
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
            messages: Array.isArray(object?.messages)
                ? object.messages.map((e) => Any.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.messages) {
            obj.messages = message.messages.map(e => (e ? Any.toJSON(e) : undefined));
        }
        else {
            obj.messages = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseCosmosTx();
        message.messages = object.messages?.map(e => Any.fromPartial(e)) || [];
        return message;
    },
    fromProtoMsg(message) {
        return CosmosTx.decode(message.value);
    },
    toProto(message) {
        return CosmosTx.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/agoric.vlocalchain.CosmosTx',
            value: CosmosTx.encode(message).finish(),
        };
    },
};
function createBaseQueryRequest() {
    return {
        fullMethod: '',
        request: undefined,
        replyType: '',
    };
}
export const QueryRequest = {
    typeUrl: '/agoric.vlocalchain.QueryRequest',
    encode(message, writer = BinaryWriter.create()) {
        if (message.fullMethod !== '') {
            writer.uint32(10).string(message.fullMethod);
        }
        if (message.request !== undefined) {
            Any.encode(message.request, writer.uint32(18).fork()).ldelim();
        }
        if (message.replyType !== '') {
            writer.uint32(26).string(message.replyType);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryRequest();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.fullMethod = reader.string();
                    break;
                case 2:
                    message.request = Any.decode(reader, reader.uint32());
                    break;
                case 3:
                    message.replyType = reader.string();
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
            fullMethod: isSet(object.fullMethod) ? String(object.fullMethod) : '',
            request: isSet(object.request) ? Any.fromJSON(object.request) : undefined,
            replyType: isSet(object.replyType) ? String(object.replyType) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.fullMethod !== undefined && (obj.fullMethod = message.fullMethod);
        message.request !== undefined &&
            (obj.request = message.request ? Any.toJSON(message.request) : undefined);
        message.replyType !== undefined && (obj.replyType = message.replyType);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryRequest();
        message.fullMethod = object.fullMethod ?? '';
        message.request =
            object.request !== undefined && object.request !== null
                ? Any.fromPartial(object.request)
                : undefined;
        message.replyType = object.replyType ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return QueryRequest.decode(message.value);
    },
    toProto(message) {
        return QueryRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/agoric.vlocalchain.QueryRequest',
            value: QueryRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryResponse() {
    return {
        height: BigInt(0),
        reply: undefined,
        error: '',
    };
}
export const QueryResponse = {
    typeUrl: '/agoric.vlocalchain.QueryResponse',
    encode(message, writer = BinaryWriter.create()) {
        if (message.height !== BigInt(0)) {
            writer.uint32(8).int64(message.height);
        }
        if (message.reply !== undefined) {
            Any.encode(message.reply, writer.uint32(18).fork()).ldelim();
        }
        if (message.error !== '') {
            writer.uint32(26).string(message.error);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.height = reader.int64();
                    break;
                case 2:
                    message.reply = Any.decode(reader, reader.uint32());
                    break;
                case 3:
                    message.error = reader.string();
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
            height: isSet(object.height)
                ? BigInt(object.height.toString())
                : BigInt(0),
            reply: isSet(object.reply) ? Any.fromJSON(object.reply) : undefined,
            error: isSet(object.error) ? String(object.error) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.height !== undefined &&
            (obj.height = (message.height || BigInt(0)).toString());
        message.reply !== undefined &&
            (obj.reply = message.reply ? Any.toJSON(message.reply) : undefined);
        message.error !== undefined && (obj.error = message.error);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryResponse();
        message.height =
            object.height !== undefined && object.height !== null
                ? BigInt(object.height.toString())
                : BigInt(0);
        message.reply =
            object.reply !== undefined && object.reply !== null
                ? Any.fromPartial(object.reply)
                : undefined;
        message.error = object.error ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return QueryResponse.decode(message.value);
    },
    toProto(message) {
        return QueryResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/agoric.vlocalchain.QueryResponse',
            value: QueryResponse.encode(message).finish(),
        };
    },
};
function createBaseQueryResponses() {
    return {
        responses: [],
    };
}
export const QueryResponses = {
    typeUrl: '/agoric.vlocalchain.QueryResponses',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.responses) {
            QueryResponse.encode(v, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryResponses();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.responses.push(QueryResponse.decode(reader, reader.uint32()));
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
            responses: Array.isArray(object?.responses)
                ? object.responses.map((e) => QueryResponse.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.responses) {
            obj.responses = message.responses.map(e => e ? QueryResponse.toJSON(e) : undefined);
        }
        else {
            obj.responses = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryResponses();
        message.responses =
            object.responses?.map(e => QueryResponse.fromPartial(e)) || [];
        return message;
    },
    fromProtoMsg(message) {
        return QueryResponses.decode(message.value);
    },
    toProto(message) {
        return QueryResponses.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/agoric.vlocalchain.QueryResponses',
            value: QueryResponses.encode(message).finish(),
        };
    },
};
//# sourceMappingURL=vlocalchain.js.map