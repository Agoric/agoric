//@ts-nocheck
import { Params } from './controller.js';
import { BinaryReader, BinaryWriter } from '../../../../../binary.js';
import { isSet } from '../../../../../helpers.js';
import {} from '../../../../../json-safe.js';
function createBaseQueryInterchainAccountRequest() {
    return {
        owner: '',
        connectionId: '',
    };
}
export const QueryInterchainAccountRequest = {
    typeUrl: '/ibc.applications.interchain_accounts.controller.v1.QueryInterchainAccountRequest',
    encode(message, writer = BinaryWriter.create()) {
        if (message.owner !== '') {
            writer.uint32(10).string(message.owner);
        }
        if (message.connectionId !== '') {
            writer.uint32(18).string(message.connectionId);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryInterchainAccountRequest();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.owner = reader.string();
                    break;
                case 2:
                    message.connectionId = reader.string();
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
            owner: isSet(object.owner) ? String(object.owner) : '',
            connectionId: isSet(object.connectionId)
                ? String(object.connectionId)
                : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.owner !== undefined && (obj.owner = message.owner);
        message.connectionId !== undefined &&
            (obj.connectionId = message.connectionId);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryInterchainAccountRequest();
        message.owner = object.owner ?? '';
        message.connectionId = object.connectionId ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return QueryInterchainAccountRequest.decode(message.value);
    },
    toProto(message) {
        return QueryInterchainAccountRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.applications.interchain_accounts.controller.v1.QueryInterchainAccountRequest',
            value: QueryInterchainAccountRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryInterchainAccountResponse() {
    return {
        address: '',
    };
}
export const QueryInterchainAccountResponse = {
    typeUrl: '/ibc.applications.interchain_accounts.controller.v1.QueryInterchainAccountResponse',
    encode(message, writer = BinaryWriter.create()) {
        if (message.address !== '') {
            writer.uint32(10).string(message.address);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryInterchainAccountResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.address = reader.string();
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
            address: isSet(object.address) ? String(object.address) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.address !== undefined && (obj.address = message.address);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryInterchainAccountResponse();
        message.address = object.address ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return QueryInterchainAccountResponse.decode(message.value);
    },
    toProto(message) {
        return QueryInterchainAccountResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.applications.interchain_accounts.controller.v1.QueryInterchainAccountResponse',
            value: QueryInterchainAccountResponse.encode(message).finish(),
        };
    },
};
function createBaseQueryParamsRequest() {
    return {};
}
export const QueryParamsRequest = {
    typeUrl: '/ibc.applications.interchain_accounts.controller.v1.QueryParamsRequest',
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
            typeUrl: '/ibc.applications.interchain_accounts.controller.v1.QueryParamsRequest',
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
    typeUrl: '/ibc.applications.interchain_accounts.controller.v1.QueryParamsResponse',
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
            typeUrl: '/ibc.applications.interchain_accounts.controller.v1.QueryParamsResponse',
            value: QueryParamsResponse.encode(message).finish(),
        };
    },
};
//# sourceMappingURL=query.js.map