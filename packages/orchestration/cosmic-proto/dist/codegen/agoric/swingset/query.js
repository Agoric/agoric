//@ts-nocheck
import { Params, Egress, } from './swingset.js';
import { BinaryReader, BinaryWriter } from '../../binary.js';
import {} from '../../json-safe.js';
import { isSet, bytesFromBase64, base64FromBytes } from '../../helpers.js';
function createBaseQueryParamsRequest() {
    return {};
}
export const QueryParamsRequest = {
    typeUrl: '/agoric.swingset.QueryParamsRequest',
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
            typeUrl: '/agoric.swingset.QueryParamsRequest',
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
    typeUrl: '/agoric.swingset.QueryParamsResponse',
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
            typeUrl: '/agoric.swingset.QueryParamsResponse',
            value: QueryParamsResponse.encode(message).finish(),
        };
    },
};
function createBaseQueryEgressRequest() {
    return {
        peer: new Uint8Array(),
    };
}
export const QueryEgressRequest = {
    typeUrl: '/agoric.swingset.QueryEgressRequest',
    encode(message, writer = BinaryWriter.create()) {
        if (message.peer.length !== 0) {
            writer.uint32(10).bytes(message.peer);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryEgressRequest();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.peer = reader.bytes();
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
            peer: isSet(object.peer)
                ? bytesFromBase64(object.peer)
                : new Uint8Array(),
        };
    },
    toJSON(message) {
        const obj = {};
        message.peer !== undefined &&
            (obj.peer = base64FromBytes(message.peer !== undefined ? message.peer : new Uint8Array()));
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryEgressRequest();
        message.peer = object.peer ?? new Uint8Array();
        return message;
    },
    fromProtoMsg(message) {
        return QueryEgressRequest.decode(message.value);
    },
    toProto(message) {
        return QueryEgressRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/agoric.swingset.QueryEgressRequest',
            value: QueryEgressRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryEgressResponse() {
    return {
        egress: undefined,
    };
}
export const QueryEgressResponse = {
    typeUrl: '/agoric.swingset.QueryEgressResponse',
    encode(message, writer = BinaryWriter.create()) {
        if (message.egress !== undefined) {
            Egress.encode(message.egress, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryEgressResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.egress = Egress.decode(reader, reader.uint32());
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
            egress: isSet(object.egress) ? Egress.fromJSON(object.egress) : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.egress !== undefined &&
            (obj.egress = message.egress ? Egress.toJSON(message.egress) : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryEgressResponse();
        message.egress =
            object.egress !== undefined && object.egress !== null
                ? Egress.fromPartial(object.egress)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return QueryEgressResponse.decode(message.value);
    },
    toProto(message) {
        return QueryEgressResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/agoric.swingset.QueryEgressResponse',
            value: QueryEgressResponse.encode(message).finish(),
        };
    },
};
function createBaseQueryMailboxRequest() {
    return {
        peer: new Uint8Array(),
    };
}
export const QueryMailboxRequest = {
    typeUrl: '/agoric.swingset.QueryMailboxRequest',
    encode(message, writer = BinaryWriter.create()) {
        if (message.peer.length !== 0) {
            writer.uint32(10).bytes(message.peer);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryMailboxRequest();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.peer = reader.bytes();
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
            peer: isSet(object.peer)
                ? bytesFromBase64(object.peer)
                : new Uint8Array(),
        };
    },
    toJSON(message) {
        const obj = {};
        message.peer !== undefined &&
            (obj.peer = base64FromBytes(message.peer !== undefined ? message.peer : new Uint8Array()));
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryMailboxRequest();
        message.peer = object.peer ?? new Uint8Array();
        return message;
    },
    fromProtoMsg(message) {
        return QueryMailboxRequest.decode(message.value);
    },
    toProto(message) {
        return QueryMailboxRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/agoric.swingset.QueryMailboxRequest',
            value: QueryMailboxRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryMailboxResponse() {
    return {
        value: '',
    };
}
export const QueryMailboxResponse = {
    typeUrl: '/agoric.swingset.QueryMailboxResponse',
    encode(message, writer = BinaryWriter.create()) {
        if (message.value !== '') {
            writer.uint32(10).string(message.value);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryMailboxResponse();
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
        const message = createBaseQueryMailboxResponse();
        message.value = object.value ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return QueryMailboxResponse.decode(message.value);
    },
    toProto(message) {
        return QueryMailboxResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/agoric.swingset.QueryMailboxResponse',
            value: QueryMailboxResponse.encode(message).finish(),
        };
    },
};
//# sourceMappingURL=query.js.map