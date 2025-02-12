//@ts-nocheck
import { PageRequest, PageResponse, } from '../../cosmos/base/query/v1beta1/pagination.js';
import { Params } from './params.js';
import { Validator } from './validator.js';
import { HostZone } from './host_zone.js';
import { EpochTracker } from './epoch_tracker.js';
import { AddressUnbonding, } from './address_unbonding.js';
import { TradeRoute } from './trade_route.js';
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { isSet } from '../../helpers.js';
import {} from '../../json-safe.js';
function createBaseQueryInterchainAccountFromAddressRequest() {
    return {
        owner: '',
        connectionId: '',
    };
}
export const QueryInterchainAccountFromAddressRequest = {
    typeUrl: '/stride.stakeibc.QueryInterchainAccountFromAddressRequest',
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
        const message = createBaseQueryInterchainAccountFromAddressRequest();
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
        const message = createBaseQueryInterchainAccountFromAddressRequest();
        message.owner = object.owner ?? '';
        message.connectionId = object.connectionId ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return QueryInterchainAccountFromAddressRequest.decode(message.value);
    },
    toProto(message) {
        return QueryInterchainAccountFromAddressRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakeibc.QueryInterchainAccountFromAddressRequest',
            value: QueryInterchainAccountFromAddressRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryInterchainAccountFromAddressResponse() {
    return {
        interchainAccountAddress: '',
    };
}
export const QueryInterchainAccountFromAddressResponse = {
    typeUrl: '/stride.stakeibc.QueryInterchainAccountFromAddressResponse',
    encode(message, writer = BinaryWriter.create()) {
        if (message.interchainAccountAddress !== '') {
            writer.uint32(10).string(message.interchainAccountAddress);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryInterchainAccountFromAddressResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.interchainAccountAddress = reader.string();
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
            interchainAccountAddress: isSet(object.interchainAccountAddress)
                ? String(object.interchainAccountAddress)
                : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.interchainAccountAddress !== undefined &&
            (obj.interchainAccountAddress = message.interchainAccountAddress);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryInterchainAccountFromAddressResponse();
        message.interchainAccountAddress = object.interchainAccountAddress ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return QueryInterchainAccountFromAddressResponse.decode(message.value);
    },
    toProto(message) {
        return QueryInterchainAccountFromAddressResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakeibc.QueryInterchainAccountFromAddressResponse',
            value: QueryInterchainAccountFromAddressResponse.encode(message).finish(),
        };
    },
};
function createBaseQueryParamsRequest() {
    return {};
}
export const QueryParamsRequest = {
    typeUrl: '/stride.stakeibc.QueryParamsRequest',
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
            typeUrl: '/stride.stakeibc.QueryParamsRequest',
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
    typeUrl: '/stride.stakeibc.QueryParamsResponse',
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
            typeUrl: '/stride.stakeibc.QueryParamsResponse',
            value: QueryParamsResponse.encode(message).finish(),
        };
    },
};
function createBaseQueryGetValidatorsRequest() {
    return {
        chainId: '',
    };
}
export const QueryGetValidatorsRequest = {
    typeUrl: '/stride.stakeibc.QueryGetValidatorsRequest',
    encode(message, writer = BinaryWriter.create()) {
        if (message.chainId !== '') {
            writer.uint32(10).string(message.chainId);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryGetValidatorsRequest();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.chainId = reader.string();
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
            chainId: isSet(object.chainId) ? String(object.chainId) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.chainId !== undefined && (obj.chainId = message.chainId);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryGetValidatorsRequest();
        message.chainId = object.chainId ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return QueryGetValidatorsRequest.decode(message.value);
    },
    toProto(message) {
        return QueryGetValidatorsRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakeibc.QueryGetValidatorsRequest',
            value: QueryGetValidatorsRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryGetValidatorsResponse() {
    return {
        validators: [],
    };
}
export const QueryGetValidatorsResponse = {
    typeUrl: '/stride.stakeibc.QueryGetValidatorsResponse',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.validators) {
            Validator.encode(v, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryGetValidatorsResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.validators.push(Validator.decode(reader, reader.uint32()));
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
            validators: Array.isArray(object?.validators)
                ? object.validators.map((e) => Validator.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.validators) {
            obj.validators = message.validators.map(e => e ? Validator.toJSON(e) : undefined);
        }
        else {
            obj.validators = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryGetValidatorsResponse();
        message.validators =
            object.validators?.map(e => Validator.fromPartial(e)) || [];
        return message;
    },
    fromProtoMsg(message) {
        return QueryGetValidatorsResponse.decode(message.value);
    },
    toProto(message) {
        return QueryGetValidatorsResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakeibc.QueryGetValidatorsResponse',
            value: QueryGetValidatorsResponse.encode(message).finish(),
        };
    },
};
function createBaseQueryGetHostZoneRequest() {
    return {
        chainId: '',
    };
}
export const QueryGetHostZoneRequest = {
    typeUrl: '/stride.stakeibc.QueryGetHostZoneRequest',
    encode(message, writer = BinaryWriter.create()) {
        if (message.chainId !== '') {
            writer.uint32(10).string(message.chainId);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryGetHostZoneRequest();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.chainId = reader.string();
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
            chainId: isSet(object.chainId) ? String(object.chainId) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.chainId !== undefined && (obj.chainId = message.chainId);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryGetHostZoneRequest();
        message.chainId = object.chainId ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return QueryGetHostZoneRequest.decode(message.value);
    },
    toProto(message) {
        return QueryGetHostZoneRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakeibc.QueryGetHostZoneRequest',
            value: QueryGetHostZoneRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryGetHostZoneResponse() {
    return {
        hostZone: HostZone.fromPartial({}),
    };
}
export const QueryGetHostZoneResponse = {
    typeUrl: '/stride.stakeibc.QueryGetHostZoneResponse',
    encode(message, writer = BinaryWriter.create()) {
        if (message.hostZone !== undefined) {
            HostZone.encode(message.hostZone, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryGetHostZoneResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.hostZone = HostZone.decode(reader, reader.uint32());
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
            hostZone: isSet(object.hostZone)
                ? HostZone.fromJSON(object.hostZone)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.hostZone !== undefined &&
            (obj.hostZone = message.hostZone
                ? HostZone.toJSON(message.hostZone)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryGetHostZoneResponse();
        message.hostZone =
            object.hostZone !== undefined && object.hostZone !== null
                ? HostZone.fromPartial(object.hostZone)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return QueryGetHostZoneResponse.decode(message.value);
    },
    toProto(message) {
        return QueryGetHostZoneResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakeibc.QueryGetHostZoneResponse',
            value: QueryGetHostZoneResponse.encode(message).finish(),
        };
    },
};
function createBaseQueryAllHostZoneRequest() {
    return {
        pagination: undefined,
    };
}
export const QueryAllHostZoneRequest = {
    typeUrl: '/stride.stakeibc.QueryAllHostZoneRequest',
    encode(message, writer = BinaryWriter.create()) {
        if (message.pagination !== undefined) {
            PageRequest.encode(message.pagination, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryAllHostZoneRequest();
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
        const message = createBaseQueryAllHostZoneRequest();
        message.pagination =
            object.pagination !== undefined && object.pagination !== null
                ? PageRequest.fromPartial(object.pagination)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return QueryAllHostZoneRequest.decode(message.value);
    },
    toProto(message) {
        return QueryAllHostZoneRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakeibc.QueryAllHostZoneRequest',
            value: QueryAllHostZoneRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryAllHostZoneResponse() {
    return {
        hostZone: [],
        pagination: undefined,
    };
}
export const QueryAllHostZoneResponse = {
    typeUrl: '/stride.stakeibc.QueryAllHostZoneResponse',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.hostZone) {
            HostZone.encode(v, writer.uint32(10).fork()).ldelim();
        }
        if (message.pagination !== undefined) {
            PageResponse.encode(message.pagination, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryAllHostZoneResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.hostZone.push(HostZone.decode(reader, reader.uint32()));
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
            hostZone: Array.isArray(object?.hostZone)
                ? object.hostZone.map((e) => HostZone.fromJSON(e))
                : [],
            pagination: isSet(object.pagination)
                ? PageResponse.fromJSON(object.pagination)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.hostZone) {
            obj.hostZone = message.hostZone.map(e => e ? HostZone.toJSON(e) : undefined);
        }
        else {
            obj.hostZone = [];
        }
        message.pagination !== undefined &&
            (obj.pagination = message.pagination
                ? PageResponse.toJSON(message.pagination)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryAllHostZoneResponse();
        message.hostZone = object.hostZone?.map(e => HostZone.fromPartial(e)) || [];
        message.pagination =
            object.pagination !== undefined && object.pagination !== null
                ? PageResponse.fromPartial(object.pagination)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return QueryAllHostZoneResponse.decode(message.value);
    },
    toProto(message) {
        return QueryAllHostZoneResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakeibc.QueryAllHostZoneResponse',
            value: QueryAllHostZoneResponse.encode(message).finish(),
        };
    },
};
function createBaseQueryModuleAddressRequest() {
    return {
        name: '',
    };
}
export const QueryModuleAddressRequest = {
    typeUrl: '/stride.stakeibc.QueryModuleAddressRequest',
    encode(message, writer = BinaryWriter.create()) {
        if (message.name !== '') {
            writer.uint32(10).string(message.name);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryModuleAddressRequest();
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
        const message = createBaseQueryModuleAddressRequest();
        message.name = object.name ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return QueryModuleAddressRequest.decode(message.value);
    },
    toProto(message) {
        return QueryModuleAddressRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakeibc.QueryModuleAddressRequest',
            value: QueryModuleAddressRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryModuleAddressResponse() {
    return {
        addr: '',
    };
}
export const QueryModuleAddressResponse = {
    typeUrl: '/stride.stakeibc.QueryModuleAddressResponse',
    encode(message, writer = BinaryWriter.create()) {
        if (message.addr !== '') {
            writer.uint32(10).string(message.addr);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryModuleAddressResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.addr = reader.string();
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
            addr: isSet(object.addr) ? String(object.addr) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.addr !== undefined && (obj.addr = message.addr);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryModuleAddressResponse();
        message.addr = object.addr ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return QueryModuleAddressResponse.decode(message.value);
    },
    toProto(message) {
        return QueryModuleAddressResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakeibc.QueryModuleAddressResponse',
            value: QueryModuleAddressResponse.encode(message).finish(),
        };
    },
};
function createBaseQueryGetEpochTrackerRequest() {
    return {
        epochIdentifier: '',
    };
}
export const QueryGetEpochTrackerRequest = {
    typeUrl: '/stride.stakeibc.QueryGetEpochTrackerRequest',
    encode(message, writer = BinaryWriter.create()) {
        if (message.epochIdentifier !== '') {
            writer.uint32(10).string(message.epochIdentifier);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryGetEpochTrackerRequest();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.epochIdentifier = reader.string();
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
            epochIdentifier: isSet(object.epochIdentifier)
                ? String(object.epochIdentifier)
                : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.epochIdentifier !== undefined &&
            (obj.epochIdentifier = message.epochIdentifier);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryGetEpochTrackerRequest();
        message.epochIdentifier = object.epochIdentifier ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return QueryGetEpochTrackerRequest.decode(message.value);
    },
    toProto(message) {
        return QueryGetEpochTrackerRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakeibc.QueryGetEpochTrackerRequest',
            value: QueryGetEpochTrackerRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryGetEpochTrackerResponse() {
    return {
        epochTracker: EpochTracker.fromPartial({}),
    };
}
export const QueryGetEpochTrackerResponse = {
    typeUrl: '/stride.stakeibc.QueryGetEpochTrackerResponse',
    encode(message, writer = BinaryWriter.create()) {
        if (message.epochTracker !== undefined) {
            EpochTracker.encode(message.epochTracker, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryGetEpochTrackerResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.epochTracker = EpochTracker.decode(reader, reader.uint32());
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
            epochTracker: isSet(object.epochTracker)
                ? EpochTracker.fromJSON(object.epochTracker)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.epochTracker !== undefined &&
            (obj.epochTracker = message.epochTracker
                ? EpochTracker.toJSON(message.epochTracker)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryGetEpochTrackerResponse();
        message.epochTracker =
            object.epochTracker !== undefined && object.epochTracker !== null
                ? EpochTracker.fromPartial(object.epochTracker)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return QueryGetEpochTrackerResponse.decode(message.value);
    },
    toProto(message) {
        return QueryGetEpochTrackerResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakeibc.QueryGetEpochTrackerResponse',
            value: QueryGetEpochTrackerResponse.encode(message).finish(),
        };
    },
};
function createBaseQueryAllEpochTrackerRequest() {
    return {};
}
export const QueryAllEpochTrackerRequest = {
    typeUrl: '/stride.stakeibc.QueryAllEpochTrackerRequest',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryAllEpochTrackerRequest();
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
        const message = createBaseQueryAllEpochTrackerRequest();
        return message;
    },
    fromProtoMsg(message) {
        return QueryAllEpochTrackerRequest.decode(message.value);
    },
    toProto(message) {
        return QueryAllEpochTrackerRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakeibc.QueryAllEpochTrackerRequest',
            value: QueryAllEpochTrackerRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryAllEpochTrackerResponse() {
    return {
        epochTracker: [],
    };
}
export const QueryAllEpochTrackerResponse = {
    typeUrl: '/stride.stakeibc.QueryAllEpochTrackerResponse',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.epochTracker) {
            EpochTracker.encode(v, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryAllEpochTrackerResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.epochTracker.push(EpochTracker.decode(reader, reader.uint32()));
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
            epochTracker: Array.isArray(object?.epochTracker)
                ? object.epochTracker.map((e) => EpochTracker.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.epochTracker) {
            obj.epochTracker = message.epochTracker.map(e => e ? EpochTracker.toJSON(e) : undefined);
        }
        else {
            obj.epochTracker = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryAllEpochTrackerResponse();
        message.epochTracker =
            object.epochTracker?.map(e => EpochTracker.fromPartial(e)) || [];
        return message;
    },
    fromProtoMsg(message) {
        return QueryAllEpochTrackerResponse.decode(message.value);
    },
    toProto(message) {
        return QueryAllEpochTrackerResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakeibc.QueryAllEpochTrackerResponse',
            value: QueryAllEpochTrackerResponse.encode(message).finish(),
        };
    },
};
function createBaseQueryGetNextPacketSequenceRequest() {
    return {
        channelId: '',
        portId: '',
    };
}
export const QueryGetNextPacketSequenceRequest = {
    typeUrl: '/stride.stakeibc.QueryGetNextPacketSequenceRequest',
    encode(message, writer = BinaryWriter.create()) {
        if (message.channelId !== '') {
            writer.uint32(10).string(message.channelId);
        }
        if (message.portId !== '') {
            writer.uint32(18).string(message.portId);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryGetNextPacketSequenceRequest();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.channelId = reader.string();
                    break;
                case 2:
                    message.portId = reader.string();
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
            channelId: isSet(object.channelId) ? String(object.channelId) : '',
            portId: isSet(object.portId) ? String(object.portId) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.channelId !== undefined && (obj.channelId = message.channelId);
        message.portId !== undefined && (obj.portId = message.portId);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryGetNextPacketSequenceRequest();
        message.channelId = object.channelId ?? '';
        message.portId = object.portId ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return QueryGetNextPacketSequenceRequest.decode(message.value);
    },
    toProto(message) {
        return QueryGetNextPacketSequenceRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakeibc.QueryGetNextPacketSequenceRequest',
            value: QueryGetNextPacketSequenceRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryGetNextPacketSequenceResponse() {
    return {
        sequence: BigInt(0),
    };
}
export const QueryGetNextPacketSequenceResponse = {
    typeUrl: '/stride.stakeibc.QueryGetNextPacketSequenceResponse',
    encode(message, writer = BinaryWriter.create()) {
        if (message.sequence !== BigInt(0)) {
            writer.uint32(8).uint64(message.sequence);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryGetNextPacketSequenceResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.sequence = reader.uint64();
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
            sequence: isSet(object.sequence)
                ? BigInt(object.sequence.toString())
                : BigInt(0),
        };
    },
    toJSON(message) {
        const obj = {};
        message.sequence !== undefined &&
            (obj.sequence = (message.sequence || BigInt(0)).toString());
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryGetNextPacketSequenceResponse();
        message.sequence =
            object.sequence !== undefined && object.sequence !== null
                ? BigInt(object.sequence.toString())
                : BigInt(0);
        return message;
    },
    fromProtoMsg(message) {
        return QueryGetNextPacketSequenceResponse.decode(message.value);
    },
    toProto(message) {
        return QueryGetNextPacketSequenceResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakeibc.QueryGetNextPacketSequenceResponse',
            value: QueryGetNextPacketSequenceResponse.encode(message).finish(),
        };
    },
};
function createBaseQueryAddressUnbondings() {
    return {
        address: '',
    };
}
export const QueryAddressUnbondings = {
    typeUrl: '/stride.stakeibc.QueryAddressUnbondings',
    encode(message, writer = BinaryWriter.create()) {
        if (message.address !== '') {
            writer.uint32(10).string(message.address);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryAddressUnbondings();
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
        const message = createBaseQueryAddressUnbondings();
        message.address = object.address ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return QueryAddressUnbondings.decode(message.value);
    },
    toProto(message) {
        return QueryAddressUnbondings.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakeibc.QueryAddressUnbondings',
            value: QueryAddressUnbondings.encode(message).finish(),
        };
    },
};
function createBaseQueryAddressUnbondingsResponse() {
    return {
        addressUnbondings: [],
    };
}
export const QueryAddressUnbondingsResponse = {
    typeUrl: '/stride.stakeibc.QueryAddressUnbondingsResponse',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.addressUnbondings) {
            AddressUnbonding.encode(v, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryAddressUnbondingsResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.addressUnbondings.push(AddressUnbonding.decode(reader, reader.uint32()));
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
            addressUnbondings: Array.isArray(object?.addressUnbondings)
                ? object.addressUnbondings.map((e) => AddressUnbonding.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.addressUnbondings) {
            obj.addressUnbondings = message.addressUnbondings.map(e => e ? AddressUnbonding.toJSON(e) : undefined);
        }
        else {
            obj.addressUnbondings = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryAddressUnbondingsResponse();
        message.addressUnbondings =
            object.addressUnbondings?.map(e => AddressUnbonding.fromPartial(e)) || [];
        return message;
    },
    fromProtoMsg(message) {
        return QueryAddressUnbondingsResponse.decode(message.value);
    },
    toProto(message) {
        return QueryAddressUnbondingsResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakeibc.QueryAddressUnbondingsResponse',
            value: QueryAddressUnbondingsResponse.encode(message).finish(),
        };
    },
};
function createBaseQueryAllTradeRoutes() {
    return {};
}
export const QueryAllTradeRoutes = {
    typeUrl: '/stride.stakeibc.QueryAllTradeRoutes',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryAllTradeRoutes();
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
        const message = createBaseQueryAllTradeRoutes();
        return message;
    },
    fromProtoMsg(message) {
        return QueryAllTradeRoutes.decode(message.value);
    },
    toProto(message) {
        return QueryAllTradeRoutes.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakeibc.QueryAllTradeRoutes',
            value: QueryAllTradeRoutes.encode(message).finish(),
        };
    },
};
function createBaseQueryAllTradeRoutesResponse() {
    return {
        tradeRoutes: [],
    };
}
export const QueryAllTradeRoutesResponse = {
    typeUrl: '/stride.stakeibc.QueryAllTradeRoutesResponse',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.tradeRoutes) {
            TradeRoute.encode(v, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryAllTradeRoutesResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.tradeRoutes.push(TradeRoute.decode(reader, reader.uint32()));
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
            tradeRoutes: Array.isArray(object?.tradeRoutes)
                ? object.tradeRoutes.map((e) => TradeRoute.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.tradeRoutes) {
            obj.tradeRoutes = message.tradeRoutes.map(e => e ? TradeRoute.toJSON(e) : undefined);
        }
        else {
            obj.tradeRoutes = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryAllTradeRoutesResponse();
        message.tradeRoutes =
            object.tradeRoutes?.map(e => TradeRoute.fromPartial(e)) || [];
        return message;
    },
    fromProtoMsg(message) {
        return QueryAllTradeRoutesResponse.decode(message.value);
    },
    toProto(message) {
        return QueryAllTradeRoutesResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakeibc.QueryAllTradeRoutesResponse',
            value: QueryAllTradeRoutesResponse.encode(message).finish(),
        };
    },
};
//# sourceMappingURL=query.js.map