//@ts-nocheck
import { RequestQuery, ResponseQuery, } from '../../tendermint/abci/types.js';
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { isSet, bytesFromBase64, base64FromBytes } from '../../helpers.js';
import {} from '../../json-safe.js';
function createBaseInterchainQueryPacketData() {
    return {
        data: new Uint8Array(),
        memo: '',
    };
}
export const InterchainQueryPacketData = {
    typeUrl: '/icq.v1.InterchainQueryPacketData',
    encode(message, writer = BinaryWriter.create()) {
        if (message.data.length !== 0) {
            writer.uint32(10).bytes(message.data);
        }
        if (message.memo !== '') {
            writer.uint32(18).string(message.memo);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseInterchainQueryPacketData();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.data = reader.bytes();
                    break;
                case 2:
                    message.memo = reader.string();
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
            data: isSet(object.data)
                ? bytesFromBase64(object.data)
                : new Uint8Array(),
            memo: isSet(object.memo) ? String(object.memo) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.data !== undefined &&
            (obj.data = base64FromBytes(message.data !== undefined ? message.data : new Uint8Array()));
        message.memo !== undefined && (obj.memo = message.memo);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseInterchainQueryPacketData();
        message.data = object.data ?? new Uint8Array();
        message.memo = object.memo ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return InterchainQueryPacketData.decode(message.value);
    },
    toProto(message) {
        return InterchainQueryPacketData.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/icq.v1.InterchainQueryPacketData',
            value: InterchainQueryPacketData.encode(message).finish(),
        };
    },
};
function createBaseInterchainQueryPacketAck() {
    return {
        data: new Uint8Array(),
    };
}
export const InterchainQueryPacketAck = {
    typeUrl: '/icq.v1.InterchainQueryPacketAck',
    encode(message, writer = BinaryWriter.create()) {
        if (message.data.length !== 0) {
            writer.uint32(10).bytes(message.data);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseInterchainQueryPacketAck();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.data = reader.bytes();
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
            data: isSet(object.data)
                ? bytesFromBase64(object.data)
                : new Uint8Array(),
        };
    },
    toJSON(message) {
        const obj = {};
        message.data !== undefined &&
            (obj.data = base64FromBytes(message.data !== undefined ? message.data : new Uint8Array()));
        return obj;
    },
    fromPartial(object) {
        const message = createBaseInterchainQueryPacketAck();
        message.data = object.data ?? new Uint8Array();
        return message;
    },
    fromProtoMsg(message) {
        return InterchainQueryPacketAck.decode(message.value);
    },
    toProto(message) {
        return InterchainQueryPacketAck.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/icq.v1.InterchainQueryPacketAck',
            value: InterchainQueryPacketAck.encode(message).finish(),
        };
    },
};
function createBaseCosmosQuery() {
    return {
        requests: [],
    };
}
export const CosmosQuery = {
    typeUrl: '/icq.v1.CosmosQuery',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.requests) {
            RequestQuery.encode(v, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseCosmosQuery();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.requests.push(RequestQuery.decode(reader, reader.uint32()));
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
            requests: Array.isArray(object?.requests)
                ? object.requests.map((e) => RequestQuery.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.requests) {
            obj.requests = message.requests.map(e => e ? RequestQuery.toJSON(e) : undefined);
        }
        else {
            obj.requests = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseCosmosQuery();
        message.requests =
            object.requests?.map(e => RequestQuery.fromPartial(e)) || [];
        return message;
    },
    fromProtoMsg(message) {
        return CosmosQuery.decode(message.value);
    },
    toProto(message) {
        return CosmosQuery.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/icq.v1.CosmosQuery',
            value: CosmosQuery.encode(message).finish(),
        };
    },
};
function createBaseCosmosResponse() {
    return {
        responses: [],
    };
}
export const CosmosResponse = {
    typeUrl: '/icq.v1.CosmosResponse',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.responses) {
            ResponseQuery.encode(v, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseCosmosResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.responses.push(ResponseQuery.decode(reader, reader.uint32()));
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
                ? object.responses.map((e) => ResponseQuery.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.responses) {
            obj.responses = message.responses.map(e => e ? ResponseQuery.toJSON(e) : undefined);
        }
        else {
            obj.responses = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseCosmosResponse();
        message.responses =
            object.responses?.map(e => ResponseQuery.fromPartial(e)) || [];
        return message;
    },
    fromProtoMsg(message) {
        return CosmosResponse.decode(message.value);
    },
    toProto(message) {
        return CosmosResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/icq.v1.CosmosResponse',
            value: CosmosResponse.encode(message).finish(),
        };
    },
};
//# sourceMappingURL=packet.js.map