//@ts-nocheck
import { PageRequest, PageResponse, } from '../../base/query/v1beta1/pagination.js';
import { Any } from '../../../google/protobuf/any.js';
import { Params, BaseAccount, ModuleAccount, } from './auth.js';
import { BinaryReader, BinaryWriter } from '../../../binary.js';
import { isSet, bytesFromBase64, base64FromBytes } from '../../../helpers.js';
import {} from '../../../json-safe.js';
function createBaseQueryAccountsRequest() {
    return {
        pagination: undefined,
    };
}
export const QueryAccountsRequest = {
    typeUrl: '/cosmos.auth.v1beta1.QueryAccountsRequest',
    encode(message, writer = BinaryWriter.create()) {
        if (message.pagination !== undefined) {
            PageRequest.encode(message.pagination, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryAccountsRequest();
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
        const message = createBaseQueryAccountsRequest();
        message.pagination =
            object.pagination !== undefined && object.pagination !== null
                ? PageRequest.fromPartial(object.pagination)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return QueryAccountsRequest.decode(message.value);
    },
    toProto(message) {
        return QueryAccountsRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.auth.v1beta1.QueryAccountsRequest',
            value: QueryAccountsRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryAccountsResponse() {
    return {
        accounts: [],
        pagination: undefined,
    };
}
export const QueryAccountsResponse = {
    typeUrl: '/cosmos.auth.v1beta1.QueryAccountsResponse',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.accounts) {
            Any.encode(v, writer.uint32(10).fork()).ldelim();
        }
        if (message.pagination !== undefined) {
            PageResponse.encode(message.pagination, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryAccountsResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.accounts.push(Any.decode(reader, reader.uint32()));
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
            accounts: Array.isArray(object?.accounts)
                ? object.accounts.map((e) => Any.fromJSON(e))
                : [],
            pagination: isSet(object.pagination)
                ? PageResponse.fromJSON(object.pagination)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.accounts) {
            obj.accounts = message.accounts.map(e => (e ? Any.toJSON(e) : undefined));
        }
        else {
            obj.accounts = [];
        }
        message.pagination !== undefined &&
            (obj.pagination = message.pagination
                ? PageResponse.toJSON(message.pagination)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryAccountsResponse();
        message.accounts = object.accounts?.map(e => Any.fromPartial(e)) || [];
        message.pagination =
            object.pagination !== undefined && object.pagination !== null
                ? PageResponse.fromPartial(object.pagination)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return QueryAccountsResponse.decode(message.value);
    },
    toProto(message) {
        return QueryAccountsResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.auth.v1beta1.QueryAccountsResponse',
            value: QueryAccountsResponse.encode(message).finish(),
        };
    },
};
function createBaseQueryAccountRequest() {
    return {
        address: '',
    };
}
export const QueryAccountRequest = {
    typeUrl: '/cosmos.auth.v1beta1.QueryAccountRequest',
    encode(message, writer = BinaryWriter.create()) {
        if (message.address !== '') {
            writer.uint32(10).string(message.address);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryAccountRequest();
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
        const message = createBaseQueryAccountRequest();
        message.address = object.address ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return QueryAccountRequest.decode(message.value);
    },
    toProto(message) {
        return QueryAccountRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.auth.v1beta1.QueryAccountRequest',
            value: QueryAccountRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryAccountResponse() {
    return {
        account: undefined,
    };
}
export const QueryAccountResponse = {
    typeUrl: '/cosmos.auth.v1beta1.QueryAccountResponse',
    encode(message, writer = BinaryWriter.create()) {
        if (message.account !== undefined) {
            Any.encode(message.account, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryAccountResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.account = AccountI_InterfaceDecoder(reader);
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
            account: isSet(object.account) ? Any.fromJSON(object.account) : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.account !== undefined &&
            (obj.account = message.account ? Any.toJSON(message.account) : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryAccountResponse();
        message.account =
            object.account !== undefined && object.account !== null
                ? Any.fromPartial(object.account)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return QueryAccountResponse.decode(message.value);
    },
    toProto(message) {
        return QueryAccountResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.auth.v1beta1.QueryAccountResponse',
            value: QueryAccountResponse.encode(message).finish(),
        };
    },
};
function createBaseQueryParamsRequest() {
    return {};
}
export const QueryParamsRequest = {
    typeUrl: '/cosmos.auth.v1beta1.QueryParamsRequest',
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
            typeUrl: '/cosmos.auth.v1beta1.QueryParamsRequest',
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
    typeUrl: '/cosmos.auth.v1beta1.QueryParamsResponse',
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
            typeUrl: '/cosmos.auth.v1beta1.QueryParamsResponse',
            value: QueryParamsResponse.encode(message).finish(),
        };
    },
};
function createBaseQueryModuleAccountsRequest() {
    return {};
}
export const QueryModuleAccountsRequest = {
    typeUrl: '/cosmos.auth.v1beta1.QueryModuleAccountsRequest',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryModuleAccountsRequest();
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
        const message = createBaseQueryModuleAccountsRequest();
        return message;
    },
    fromProtoMsg(message) {
        return QueryModuleAccountsRequest.decode(message.value);
    },
    toProto(message) {
        return QueryModuleAccountsRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.auth.v1beta1.QueryModuleAccountsRequest',
            value: QueryModuleAccountsRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryModuleAccountsResponse() {
    return {
        accounts: [],
    };
}
export const QueryModuleAccountsResponse = {
    typeUrl: '/cosmos.auth.v1beta1.QueryModuleAccountsResponse',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.accounts) {
            Any.encode(v, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryModuleAccountsResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.accounts.push(Any.decode(reader, reader.uint32()));
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
            accounts: Array.isArray(object?.accounts)
                ? object.accounts.map((e) => Any.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.accounts) {
            obj.accounts = message.accounts.map(e => (e ? Any.toJSON(e) : undefined));
        }
        else {
            obj.accounts = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryModuleAccountsResponse();
        message.accounts = object.accounts?.map(e => Any.fromPartial(e)) || [];
        return message;
    },
    fromProtoMsg(message) {
        return QueryModuleAccountsResponse.decode(message.value);
    },
    toProto(message) {
        return QueryModuleAccountsResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.auth.v1beta1.QueryModuleAccountsResponse',
            value: QueryModuleAccountsResponse.encode(message).finish(),
        };
    },
};
function createBaseQueryModuleAccountByNameRequest() {
    return {
        name: '',
    };
}
export const QueryModuleAccountByNameRequest = {
    typeUrl: '/cosmos.auth.v1beta1.QueryModuleAccountByNameRequest',
    encode(message, writer = BinaryWriter.create()) {
        if (message.name !== '') {
            writer.uint32(10).string(message.name);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryModuleAccountByNameRequest();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.name = reader.string();
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
            name: isSet(object.name) ? String(object.name) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.name !== undefined && (obj.name = message.name);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryModuleAccountByNameRequest();
        message.name = object.name ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return QueryModuleAccountByNameRequest.decode(message.value);
    },
    toProto(message) {
        return QueryModuleAccountByNameRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.auth.v1beta1.QueryModuleAccountByNameRequest',
            value: QueryModuleAccountByNameRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryModuleAccountByNameResponse() {
    return {
        account: undefined,
    };
}
export const QueryModuleAccountByNameResponse = {
    typeUrl: '/cosmos.auth.v1beta1.QueryModuleAccountByNameResponse',
    encode(message, writer = BinaryWriter.create()) {
        if (message.account !== undefined) {
            Any.encode(message.account, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryModuleAccountByNameResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.account = ModuleAccountI_InterfaceDecoder(reader);
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
            account: isSet(object.account) ? Any.fromJSON(object.account) : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.account !== undefined &&
            (obj.account = message.account ? Any.toJSON(message.account) : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryModuleAccountByNameResponse();
        message.account =
            object.account !== undefined && object.account !== null
                ? Any.fromPartial(object.account)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return QueryModuleAccountByNameResponse.decode(message.value);
    },
    toProto(message) {
        return QueryModuleAccountByNameResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.auth.v1beta1.QueryModuleAccountByNameResponse',
            value: QueryModuleAccountByNameResponse.encode(message).finish(),
        };
    },
};
function createBaseBech32PrefixRequest() {
    return {};
}
export const Bech32PrefixRequest = {
    typeUrl: '/cosmos.auth.v1beta1.Bech32PrefixRequest',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseBech32PrefixRequest();
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
        const message = createBaseBech32PrefixRequest();
        return message;
    },
    fromProtoMsg(message) {
        return Bech32PrefixRequest.decode(message.value);
    },
    toProto(message) {
        return Bech32PrefixRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.auth.v1beta1.Bech32PrefixRequest',
            value: Bech32PrefixRequest.encode(message).finish(),
        };
    },
};
function createBaseBech32PrefixResponse() {
    return {
        bech32Prefix: '',
    };
}
export const Bech32PrefixResponse = {
    typeUrl: '/cosmos.auth.v1beta1.Bech32PrefixResponse',
    encode(message, writer = BinaryWriter.create()) {
        if (message.bech32Prefix !== '') {
            writer.uint32(10).string(message.bech32Prefix);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseBech32PrefixResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.bech32Prefix = reader.string();
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
            bech32Prefix: isSet(object.bech32Prefix)
                ? String(object.bech32Prefix)
                : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.bech32Prefix !== undefined &&
            (obj.bech32Prefix = message.bech32Prefix);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseBech32PrefixResponse();
        message.bech32Prefix = object.bech32Prefix ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return Bech32PrefixResponse.decode(message.value);
    },
    toProto(message) {
        return Bech32PrefixResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.auth.v1beta1.Bech32PrefixResponse',
            value: Bech32PrefixResponse.encode(message).finish(),
        };
    },
};
function createBaseAddressBytesToStringRequest() {
    return {
        addressBytes: new Uint8Array(),
    };
}
export const AddressBytesToStringRequest = {
    typeUrl: '/cosmos.auth.v1beta1.AddressBytesToStringRequest',
    encode(message, writer = BinaryWriter.create()) {
        if (message.addressBytes.length !== 0) {
            writer.uint32(10).bytes(message.addressBytes);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseAddressBytesToStringRequest();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.addressBytes = reader.bytes();
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
            addressBytes: isSet(object.addressBytes)
                ? bytesFromBase64(object.addressBytes)
                : new Uint8Array(),
        };
    },
    toJSON(message) {
        const obj = {};
        message.addressBytes !== undefined &&
            (obj.addressBytes = base64FromBytes(message.addressBytes !== undefined
                ? message.addressBytes
                : new Uint8Array()));
        return obj;
    },
    fromPartial(object) {
        const message = createBaseAddressBytesToStringRequest();
        message.addressBytes = object.addressBytes ?? new Uint8Array();
        return message;
    },
    fromProtoMsg(message) {
        return AddressBytesToStringRequest.decode(message.value);
    },
    toProto(message) {
        return AddressBytesToStringRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.auth.v1beta1.AddressBytesToStringRequest',
            value: AddressBytesToStringRequest.encode(message).finish(),
        };
    },
};
function createBaseAddressBytesToStringResponse() {
    return {
        addressString: '',
    };
}
export const AddressBytesToStringResponse = {
    typeUrl: '/cosmos.auth.v1beta1.AddressBytesToStringResponse',
    encode(message, writer = BinaryWriter.create()) {
        if (message.addressString !== '') {
            writer.uint32(10).string(message.addressString);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseAddressBytesToStringResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.addressString = reader.string();
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
            addressString: isSet(object.addressString)
                ? String(object.addressString)
                : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.addressString !== undefined &&
            (obj.addressString = message.addressString);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseAddressBytesToStringResponse();
        message.addressString = object.addressString ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return AddressBytesToStringResponse.decode(message.value);
    },
    toProto(message) {
        return AddressBytesToStringResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.auth.v1beta1.AddressBytesToStringResponse',
            value: AddressBytesToStringResponse.encode(message).finish(),
        };
    },
};
function createBaseAddressStringToBytesRequest() {
    return {
        addressString: '',
    };
}
export const AddressStringToBytesRequest = {
    typeUrl: '/cosmos.auth.v1beta1.AddressStringToBytesRequest',
    encode(message, writer = BinaryWriter.create()) {
        if (message.addressString !== '') {
            writer.uint32(10).string(message.addressString);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseAddressStringToBytesRequest();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.addressString = reader.string();
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
            addressString: isSet(object.addressString)
                ? String(object.addressString)
                : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.addressString !== undefined &&
            (obj.addressString = message.addressString);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseAddressStringToBytesRequest();
        message.addressString = object.addressString ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return AddressStringToBytesRequest.decode(message.value);
    },
    toProto(message) {
        return AddressStringToBytesRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.auth.v1beta1.AddressStringToBytesRequest',
            value: AddressStringToBytesRequest.encode(message).finish(),
        };
    },
};
function createBaseAddressStringToBytesResponse() {
    return {
        addressBytes: new Uint8Array(),
    };
}
export const AddressStringToBytesResponse = {
    typeUrl: '/cosmos.auth.v1beta1.AddressStringToBytesResponse',
    encode(message, writer = BinaryWriter.create()) {
        if (message.addressBytes.length !== 0) {
            writer.uint32(10).bytes(message.addressBytes);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseAddressStringToBytesResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.addressBytes = reader.bytes();
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
            addressBytes: isSet(object.addressBytes)
                ? bytesFromBase64(object.addressBytes)
                : new Uint8Array(),
        };
    },
    toJSON(message) {
        const obj = {};
        message.addressBytes !== undefined &&
            (obj.addressBytes = base64FromBytes(message.addressBytes !== undefined
                ? message.addressBytes
                : new Uint8Array()));
        return obj;
    },
    fromPartial(object) {
        const message = createBaseAddressStringToBytesResponse();
        message.addressBytes = object.addressBytes ?? new Uint8Array();
        return message;
    },
    fromProtoMsg(message) {
        return AddressStringToBytesResponse.decode(message.value);
    },
    toProto(message) {
        return AddressStringToBytesResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.auth.v1beta1.AddressStringToBytesResponse',
            value: AddressStringToBytesResponse.encode(message).finish(),
        };
    },
};
function createBaseQueryAccountAddressByIDRequest() {
    return {
        id: BigInt(0),
    };
}
export const QueryAccountAddressByIDRequest = {
    typeUrl: '/cosmos.auth.v1beta1.QueryAccountAddressByIDRequest',
    encode(message, writer = BinaryWriter.create()) {
        if (message.id !== BigInt(0)) {
            writer.uint32(8).int64(message.id);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryAccountAddressByIDRequest();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.id = reader.int64();
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
            id: isSet(object.id) ? BigInt(object.id.toString()) : BigInt(0),
        };
    },
    toJSON(message) {
        const obj = {};
        message.id !== undefined && (obj.id = (message.id || BigInt(0)).toString());
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryAccountAddressByIDRequest();
        message.id =
            object.id !== undefined && object.id !== null
                ? BigInt(object.id.toString())
                : BigInt(0);
        return message;
    },
    fromProtoMsg(message) {
        return QueryAccountAddressByIDRequest.decode(message.value);
    },
    toProto(message) {
        return QueryAccountAddressByIDRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.auth.v1beta1.QueryAccountAddressByIDRequest',
            value: QueryAccountAddressByIDRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryAccountAddressByIDResponse() {
    return {
        accountAddress: '',
    };
}
export const QueryAccountAddressByIDResponse = {
    typeUrl: '/cosmos.auth.v1beta1.QueryAccountAddressByIDResponse',
    encode(message, writer = BinaryWriter.create()) {
        if (message.accountAddress !== '') {
            writer.uint32(10).string(message.accountAddress);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryAccountAddressByIDResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.accountAddress = reader.string();
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
            accountAddress: isSet(object.accountAddress)
                ? String(object.accountAddress)
                : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.accountAddress !== undefined &&
            (obj.accountAddress = message.accountAddress);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryAccountAddressByIDResponse();
        message.accountAddress = object.accountAddress ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return QueryAccountAddressByIDResponse.decode(message.value);
    },
    toProto(message) {
        return QueryAccountAddressByIDResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.auth.v1beta1.QueryAccountAddressByIDResponse',
            value: QueryAccountAddressByIDResponse.encode(message).finish(),
        };
    },
};
export const AccountI_InterfaceDecoder = (input) => {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const data = Any.decode(reader, reader.uint32());
    switch (data.typeUrl) {
        case '/cosmos.auth.v1beta1.BaseAccount':
            return BaseAccount.decode(data.value);
        default:
            return data;
    }
};
export const ModuleAccountI_InterfaceDecoder = (input) => {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const data = Any.decode(reader, reader.uint32());
    switch (data.typeUrl) {
        case '/cosmos.auth.v1beta1.ModuleAccount':
            return ModuleAccount.decode(data.value);
        default:
            return data;
    }
};
//# sourceMappingURL=query.js.map