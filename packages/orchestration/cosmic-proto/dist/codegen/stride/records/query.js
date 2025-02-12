//@ts-nocheck
import { PageRequest, PageResponse, } from '../../cosmos/base/query/v1beta1/pagination.js';
import { Params } from './params.js';
import { DepositRecord, UserRedemptionRecord, EpochUnbondingRecord, LSMTokenDeposit, } from './records.js';
import { BinaryReader, BinaryWriter } from '../../binary.js';
import {} from '../../json-safe.js';
import { isSet } from '../../helpers.js';
function createBaseQueryParamsRequest() {
    return {};
}
export const QueryParamsRequest = {
    typeUrl: '/stride.records.QueryParamsRequest',
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
            typeUrl: '/stride.records.QueryParamsRequest',
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
    typeUrl: '/stride.records.QueryParamsResponse',
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
            typeUrl: '/stride.records.QueryParamsResponse',
            value: QueryParamsResponse.encode(message).finish(),
        };
    },
};
function createBaseQueryGetDepositRecordRequest() {
    return {
        id: BigInt(0),
    };
}
export const QueryGetDepositRecordRequest = {
    typeUrl: '/stride.records.QueryGetDepositRecordRequest',
    encode(message, writer = BinaryWriter.create()) {
        if (message.id !== BigInt(0)) {
            writer.uint32(8).uint64(message.id);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryGetDepositRecordRequest();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.id = reader.uint64();
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
        const message = createBaseQueryGetDepositRecordRequest();
        message.id =
            object.id !== undefined && object.id !== null
                ? BigInt(object.id.toString())
                : BigInt(0);
        return message;
    },
    fromProtoMsg(message) {
        return QueryGetDepositRecordRequest.decode(message.value);
    },
    toProto(message) {
        return QueryGetDepositRecordRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.records.QueryGetDepositRecordRequest',
            value: QueryGetDepositRecordRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryGetDepositRecordResponse() {
    return {
        depositRecord: DepositRecord.fromPartial({}),
    };
}
export const QueryGetDepositRecordResponse = {
    typeUrl: '/stride.records.QueryGetDepositRecordResponse',
    encode(message, writer = BinaryWriter.create()) {
        if (message.depositRecord !== undefined) {
            DepositRecord.encode(message.depositRecord, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryGetDepositRecordResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.depositRecord = DepositRecord.decode(reader, reader.uint32());
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
            depositRecord: isSet(object.depositRecord)
                ? DepositRecord.fromJSON(object.depositRecord)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.depositRecord !== undefined &&
            (obj.depositRecord = message.depositRecord
                ? DepositRecord.toJSON(message.depositRecord)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryGetDepositRecordResponse();
        message.depositRecord =
            object.depositRecord !== undefined && object.depositRecord !== null
                ? DepositRecord.fromPartial(object.depositRecord)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return QueryGetDepositRecordResponse.decode(message.value);
    },
    toProto(message) {
        return QueryGetDepositRecordResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.records.QueryGetDepositRecordResponse',
            value: QueryGetDepositRecordResponse.encode(message).finish(),
        };
    },
};
function createBaseQueryAllDepositRecordRequest() {
    return {
        pagination: undefined,
    };
}
export const QueryAllDepositRecordRequest = {
    typeUrl: '/stride.records.QueryAllDepositRecordRequest',
    encode(message, writer = BinaryWriter.create()) {
        if (message.pagination !== undefined) {
            PageRequest.encode(message.pagination, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryAllDepositRecordRequest();
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
        const message = createBaseQueryAllDepositRecordRequest();
        message.pagination =
            object.pagination !== undefined && object.pagination !== null
                ? PageRequest.fromPartial(object.pagination)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return QueryAllDepositRecordRequest.decode(message.value);
    },
    toProto(message) {
        return QueryAllDepositRecordRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.records.QueryAllDepositRecordRequest',
            value: QueryAllDepositRecordRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryAllDepositRecordResponse() {
    return {
        depositRecord: [],
        pagination: undefined,
    };
}
export const QueryAllDepositRecordResponse = {
    typeUrl: '/stride.records.QueryAllDepositRecordResponse',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.depositRecord) {
            DepositRecord.encode(v, writer.uint32(10).fork()).ldelim();
        }
        if (message.pagination !== undefined) {
            PageResponse.encode(message.pagination, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryAllDepositRecordResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.depositRecord.push(DepositRecord.decode(reader, reader.uint32()));
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
            depositRecord: Array.isArray(object?.depositRecord)
                ? object.depositRecord.map((e) => DepositRecord.fromJSON(e))
                : [],
            pagination: isSet(object.pagination)
                ? PageResponse.fromJSON(object.pagination)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.depositRecord) {
            obj.depositRecord = message.depositRecord.map(e => e ? DepositRecord.toJSON(e) : undefined);
        }
        else {
            obj.depositRecord = [];
        }
        message.pagination !== undefined &&
            (obj.pagination = message.pagination
                ? PageResponse.toJSON(message.pagination)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryAllDepositRecordResponse();
        message.depositRecord =
            object.depositRecord?.map(e => DepositRecord.fromPartial(e)) || [];
        message.pagination =
            object.pagination !== undefined && object.pagination !== null
                ? PageResponse.fromPartial(object.pagination)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return QueryAllDepositRecordResponse.decode(message.value);
    },
    toProto(message) {
        return QueryAllDepositRecordResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.records.QueryAllDepositRecordResponse',
            value: QueryAllDepositRecordResponse.encode(message).finish(),
        };
    },
};
function createBaseQueryDepositRecordByHostRequest() {
    return {
        hostZoneId: '',
    };
}
export const QueryDepositRecordByHostRequest = {
    typeUrl: '/stride.records.QueryDepositRecordByHostRequest',
    encode(message, writer = BinaryWriter.create()) {
        if (message.hostZoneId !== '') {
            writer.uint32(10).string(message.hostZoneId);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryDepositRecordByHostRequest();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.hostZoneId = reader.string();
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
            hostZoneId: isSet(object.hostZoneId) ? String(object.hostZoneId) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.hostZoneId !== undefined && (obj.hostZoneId = message.hostZoneId);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryDepositRecordByHostRequest();
        message.hostZoneId = object.hostZoneId ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return QueryDepositRecordByHostRequest.decode(message.value);
    },
    toProto(message) {
        return QueryDepositRecordByHostRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.records.QueryDepositRecordByHostRequest',
            value: QueryDepositRecordByHostRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryDepositRecordByHostResponse() {
    return {
        depositRecord: [],
    };
}
export const QueryDepositRecordByHostResponse = {
    typeUrl: '/stride.records.QueryDepositRecordByHostResponse',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.depositRecord) {
            DepositRecord.encode(v, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryDepositRecordByHostResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.depositRecord.push(DepositRecord.decode(reader, reader.uint32()));
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
            depositRecord: Array.isArray(object?.depositRecord)
                ? object.depositRecord.map((e) => DepositRecord.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.depositRecord) {
            obj.depositRecord = message.depositRecord.map(e => e ? DepositRecord.toJSON(e) : undefined);
        }
        else {
            obj.depositRecord = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryDepositRecordByHostResponse();
        message.depositRecord =
            object.depositRecord?.map(e => DepositRecord.fromPartial(e)) || [];
        return message;
    },
    fromProtoMsg(message) {
        return QueryDepositRecordByHostResponse.decode(message.value);
    },
    toProto(message) {
        return QueryDepositRecordByHostResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.records.QueryDepositRecordByHostResponse',
            value: QueryDepositRecordByHostResponse.encode(message).finish(),
        };
    },
};
function createBaseQueryGetUserRedemptionRecordRequest() {
    return {
        id: '',
    };
}
export const QueryGetUserRedemptionRecordRequest = {
    typeUrl: '/stride.records.QueryGetUserRedemptionRecordRequest',
    encode(message, writer = BinaryWriter.create()) {
        if (message.id !== '') {
            writer.uint32(10).string(message.id);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryGetUserRedemptionRecordRequest();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.id = reader.string();
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
            id: isSet(object.id) ? String(object.id) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.id !== undefined && (obj.id = message.id);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryGetUserRedemptionRecordRequest();
        message.id = object.id ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return QueryGetUserRedemptionRecordRequest.decode(message.value);
    },
    toProto(message) {
        return QueryGetUserRedemptionRecordRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.records.QueryGetUserRedemptionRecordRequest',
            value: QueryGetUserRedemptionRecordRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryGetUserRedemptionRecordResponse() {
    return {
        userRedemptionRecord: UserRedemptionRecord.fromPartial({}),
    };
}
export const QueryGetUserRedemptionRecordResponse = {
    typeUrl: '/stride.records.QueryGetUserRedemptionRecordResponse',
    encode(message, writer = BinaryWriter.create()) {
        if (message.userRedemptionRecord !== undefined) {
            UserRedemptionRecord.encode(message.userRedemptionRecord, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryGetUserRedemptionRecordResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.userRedemptionRecord = UserRedemptionRecord.decode(reader, reader.uint32());
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
            userRedemptionRecord: isSet(object.userRedemptionRecord)
                ? UserRedemptionRecord.fromJSON(object.userRedemptionRecord)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.userRedemptionRecord !== undefined &&
            (obj.userRedemptionRecord = message.userRedemptionRecord
                ? UserRedemptionRecord.toJSON(message.userRedemptionRecord)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryGetUserRedemptionRecordResponse();
        message.userRedemptionRecord =
            object.userRedemptionRecord !== undefined &&
                object.userRedemptionRecord !== null
                ? UserRedemptionRecord.fromPartial(object.userRedemptionRecord)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return QueryGetUserRedemptionRecordResponse.decode(message.value);
    },
    toProto(message) {
        return QueryGetUserRedemptionRecordResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.records.QueryGetUserRedemptionRecordResponse',
            value: QueryGetUserRedemptionRecordResponse.encode(message).finish(),
        };
    },
};
function createBaseQueryAllUserRedemptionRecordRequest() {
    return {
        pagination: undefined,
    };
}
export const QueryAllUserRedemptionRecordRequest = {
    typeUrl: '/stride.records.QueryAllUserRedemptionRecordRequest',
    encode(message, writer = BinaryWriter.create()) {
        if (message.pagination !== undefined) {
            PageRequest.encode(message.pagination, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryAllUserRedemptionRecordRequest();
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
        const message = createBaseQueryAllUserRedemptionRecordRequest();
        message.pagination =
            object.pagination !== undefined && object.pagination !== null
                ? PageRequest.fromPartial(object.pagination)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return QueryAllUserRedemptionRecordRequest.decode(message.value);
    },
    toProto(message) {
        return QueryAllUserRedemptionRecordRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.records.QueryAllUserRedemptionRecordRequest',
            value: QueryAllUserRedemptionRecordRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryAllUserRedemptionRecordResponse() {
    return {
        userRedemptionRecord: [],
        pagination: undefined,
    };
}
export const QueryAllUserRedemptionRecordResponse = {
    typeUrl: '/stride.records.QueryAllUserRedemptionRecordResponse',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.userRedemptionRecord) {
            UserRedemptionRecord.encode(v, writer.uint32(10).fork()).ldelim();
        }
        if (message.pagination !== undefined) {
            PageResponse.encode(message.pagination, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryAllUserRedemptionRecordResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.userRedemptionRecord.push(UserRedemptionRecord.decode(reader, reader.uint32()));
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
            userRedemptionRecord: Array.isArray(object?.userRedemptionRecord)
                ? object.userRedemptionRecord.map((e) => UserRedemptionRecord.fromJSON(e))
                : [],
            pagination: isSet(object.pagination)
                ? PageResponse.fromJSON(object.pagination)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.userRedemptionRecord) {
            obj.userRedemptionRecord = message.userRedemptionRecord.map(e => e ? UserRedemptionRecord.toJSON(e) : undefined);
        }
        else {
            obj.userRedemptionRecord = [];
        }
        message.pagination !== undefined &&
            (obj.pagination = message.pagination
                ? PageResponse.toJSON(message.pagination)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryAllUserRedemptionRecordResponse();
        message.userRedemptionRecord =
            object.userRedemptionRecord?.map(e => UserRedemptionRecord.fromPartial(e)) || [];
        message.pagination =
            object.pagination !== undefined && object.pagination !== null
                ? PageResponse.fromPartial(object.pagination)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return QueryAllUserRedemptionRecordResponse.decode(message.value);
    },
    toProto(message) {
        return QueryAllUserRedemptionRecordResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.records.QueryAllUserRedemptionRecordResponse',
            value: QueryAllUserRedemptionRecordResponse.encode(message).finish(),
        };
    },
};
function createBaseQueryAllUserRedemptionRecordForUserRequest() {
    return {
        chainId: '',
        day: BigInt(0),
        address: '',
        limit: BigInt(0),
        pagination: undefined,
    };
}
export const QueryAllUserRedemptionRecordForUserRequest = {
    typeUrl: '/stride.records.QueryAllUserRedemptionRecordForUserRequest',
    encode(message, writer = BinaryWriter.create()) {
        if (message.chainId !== '') {
            writer.uint32(10).string(message.chainId);
        }
        if (message.day !== BigInt(0)) {
            writer.uint32(16).uint64(message.day);
        }
        if (message.address !== '') {
            writer.uint32(26).string(message.address);
        }
        if (message.limit !== BigInt(0)) {
            writer.uint32(32).uint64(message.limit);
        }
        if (message.pagination !== undefined) {
            PageRequest.encode(message.pagination, writer.uint32(42).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryAllUserRedemptionRecordForUserRequest();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.chainId = reader.string();
                    break;
                case 2:
                    message.day = reader.uint64();
                    break;
                case 3:
                    message.address = reader.string();
                    break;
                case 4:
                    message.limit = reader.uint64();
                    break;
                case 5:
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
            chainId: isSet(object.chainId) ? String(object.chainId) : '',
            day: isSet(object.day) ? BigInt(object.day.toString()) : BigInt(0),
            address: isSet(object.address) ? String(object.address) : '',
            limit: isSet(object.limit) ? BigInt(object.limit.toString()) : BigInt(0),
            pagination: isSet(object.pagination)
                ? PageRequest.fromJSON(object.pagination)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.chainId !== undefined && (obj.chainId = message.chainId);
        message.day !== undefined &&
            (obj.day = (message.day || BigInt(0)).toString());
        message.address !== undefined && (obj.address = message.address);
        message.limit !== undefined &&
            (obj.limit = (message.limit || BigInt(0)).toString());
        message.pagination !== undefined &&
            (obj.pagination = message.pagination
                ? PageRequest.toJSON(message.pagination)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryAllUserRedemptionRecordForUserRequest();
        message.chainId = object.chainId ?? '';
        message.day =
            object.day !== undefined && object.day !== null
                ? BigInt(object.day.toString())
                : BigInt(0);
        message.address = object.address ?? '';
        message.limit =
            object.limit !== undefined && object.limit !== null
                ? BigInt(object.limit.toString())
                : BigInt(0);
        message.pagination =
            object.pagination !== undefined && object.pagination !== null
                ? PageRequest.fromPartial(object.pagination)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return QueryAllUserRedemptionRecordForUserRequest.decode(message.value);
    },
    toProto(message) {
        return QueryAllUserRedemptionRecordForUserRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.records.QueryAllUserRedemptionRecordForUserRequest',
            value: QueryAllUserRedemptionRecordForUserRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryAllUserRedemptionRecordForUserResponse() {
    return {
        userRedemptionRecord: [],
        pagination: undefined,
    };
}
export const QueryAllUserRedemptionRecordForUserResponse = {
    typeUrl: '/stride.records.QueryAllUserRedemptionRecordForUserResponse',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.userRedemptionRecord) {
            UserRedemptionRecord.encode(v, writer.uint32(10).fork()).ldelim();
        }
        if (message.pagination !== undefined) {
            PageResponse.encode(message.pagination, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryAllUserRedemptionRecordForUserResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.userRedemptionRecord.push(UserRedemptionRecord.decode(reader, reader.uint32()));
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
            userRedemptionRecord: Array.isArray(object?.userRedemptionRecord)
                ? object.userRedemptionRecord.map((e) => UserRedemptionRecord.fromJSON(e))
                : [],
            pagination: isSet(object.pagination)
                ? PageResponse.fromJSON(object.pagination)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.userRedemptionRecord) {
            obj.userRedemptionRecord = message.userRedemptionRecord.map(e => e ? UserRedemptionRecord.toJSON(e) : undefined);
        }
        else {
            obj.userRedemptionRecord = [];
        }
        message.pagination !== undefined &&
            (obj.pagination = message.pagination
                ? PageResponse.toJSON(message.pagination)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryAllUserRedemptionRecordForUserResponse();
        message.userRedemptionRecord =
            object.userRedemptionRecord?.map(e => UserRedemptionRecord.fromPartial(e)) || [];
        message.pagination =
            object.pagination !== undefined && object.pagination !== null
                ? PageResponse.fromPartial(object.pagination)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return QueryAllUserRedemptionRecordForUserResponse.decode(message.value);
    },
    toProto(message) {
        return QueryAllUserRedemptionRecordForUserResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.records.QueryAllUserRedemptionRecordForUserResponse',
            value: QueryAllUserRedemptionRecordForUserResponse.encode(message).finish(),
        };
    },
};
function createBaseQueryGetEpochUnbondingRecordRequest() {
    return {
        epochNumber: BigInt(0),
    };
}
export const QueryGetEpochUnbondingRecordRequest = {
    typeUrl: '/stride.records.QueryGetEpochUnbondingRecordRequest',
    encode(message, writer = BinaryWriter.create()) {
        if (message.epochNumber !== BigInt(0)) {
            writer.uint32(8).uint64(message.epochNumber);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryGetEpochUnbondingRecordRequest();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.epochNumber = reader.uint64();
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
            epochNumber: isSet(object.epochNumber)
                ? BigInt(object.epochNumber.toString())
                : BigInt(0),
        };
    },
    toJSON(message) {
        const obj = {};
        message.epochNumber !== undefined &&
            (obj.epochNumber = (message.epochNumber || BigInt(0)).toString());
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryGetEpochUnbondingRecordRequest();
        message.epochNumber =
            object.epochNumber !== undefined && object.epochNumber !== null
                ? BigInt(object.epochNumber.toString())
                : BigInt(0);
        return message;
    },
    fromProtoMsg(message) {
        return QueryGetEpochUnbondingRecordRequest.decode(message.value);
    },
    toProto(message) {
        return QueryGetEpochUnbondingRecordRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.records.QueryGetEpochUnbondingRecordRequest',
            value: QueryGetEpochUnbondingRecordRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryGetEpochUnbondingRecordResponse() {
    return {
        epochUnbondingRecord: EpochUnbondingRecord.fromPartial({}),
    };
}
export const QueryGetEpochUnbondingRecordResponse = {
    typeUrl: '/stride.records.QueryGetEpochUnbondingRecordResponse',
    encode(message, writer = BinaryWriter.create()) {
        if (message.epochUnbondingRecord !== undefined) {
            EpochUnbondingRecord.encode(message.epochUnbondingRecord, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryGetEpochUnbondingRecordResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.epochUnbondingRecord = EpochUnbondingRecord.decode(reader, reader.uint32());
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
            epochUnbondingRecord: isSet(object.epochUnbondingRecord)
                ? EpochUnbondingRecord.fromJSON(object.epochUnbondingRecord)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.epochUnbondingRecord !== undefined &&
            (obj.epochUnbondingRecord = message.epochUnbondingRecord
                ? EpochUnbondingRecord.toJSON(message.epochUnbondingRecord)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryGetEpochUnbondingRecordResponse();
        message.epochUnbondingRecord =
            object.epochUnbondingRecord !== undefined &&
                object.epochUnbondingRecord !== null
                ? EpochUnbondingRecord.fromPartial(object.epochUnbondingRecord)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return QueryGetEpochUnbondingRecordResponse.decode(message.value);
    },
    toProto(message) {
        return QueryGetEpochUnbondingRecordResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.records.QueryGetEpochUnbondingRecordResponse',
            value: QueryGetEpochUnbondingRecordResponse.encode(message).finish(),
        };
    },
};
function createBaseQueryAllEpochUnbondingRecordRequest() {
    return {
        pagination: undefined,
    };
}
export const QueryAllEpochUnbondingRecordRequest = {
    typeUrl: '/stride.records.QueryAllEpochUnbondingRecordRequest',
    encode(message, writer = BinaryWriter.create()) {
        if (message.pagination !== undefined) {
            PageRequest.encode(message.pagination, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryAllEpochUnbondingRecordRequest();
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
        const message = createBaseQueryAllEpochUnbondingRecordRequest();
        message.pagination =
            object.pagination !== undefined && object.pagination !== null
                ? PageRequest.fromPartial(object.pagination)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return QueryAllEpochUnbondingRecordRequest.decode(message.value);
    },
    toProto(message) {
        return QueryAllEpochUnbondingRecordRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.records.QueryAllEpochUnbondingRecordRequest',
            value: QueryAllEpochUnbondingRecordRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryAllEpochUnbondingRecordResponse() {
    return {
        epochUnbondingRecord: [],
        pagination: undefined,
    };
}
export const QueryAllEpochUnbondingRecordResponse = {
    typeUrl: '/stride.records.QueryAllEpochUnbondingRecordResponse',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.epochUnbondingRecord) {
            EpochUnbondingRecord.encode(v, writer.uint32(10).fork()).ldelim();
        }
        if (message.pagination !== undefined) {
            PageResponse.encode(message.pagination, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryAllEpochUnbondingRecordResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.epochUnbondingRecord.push(EpochUnbondingRecord.decode(reader, reader.uint32()));
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
            epochUnbondingRecord: Array.isArray(object?.epochUnbondingRecord)
                ? object.epochUnbondingRecord.map((e) => EpochUnbondingRecord.fromJSON(e))
                : [],
            pagination: isSet(object.pagination)
                ? PageResponse.fromJSON(object.pagination)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.epochUnbondingRecord) {
            obj.epochUnbondingRecord = message.epochUnbondingRecord.map(e => e ? EpochUnbondingRecord.toJSON(e) : undefined);
        }
        else {
            obj.epochUnbondingRecord = [];
        }
        message.pagination !== undefined &&
            (obj.pagination = message.pagination
                ? PageResponse.toJSON(message.pagination)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryAllEpochUnbondingRecordResponse();
        message.epochUnbondingRecord =
            object.epochUnbondingRecord?.map(e => EpochUnbondingRecord.fromPartial(e)) || [];
        message.pagination =
            object.pagination !== undefined && object.pagination !== null
                ? PageResponse.fromPartial(object.pagination)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return QueryAllEpochUnbondingRecordResponse.decode(message.value);
    },
    toProto(message) {
        return QueryAllEpochUnbondingRecordResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.records.QueryAllEpochUnbondingRecordResponse',
            value: QueryAllEpochUnbondingRecordResponse.encode(message).finish(),
        };
    },
};
function createBaseQueryLSMDepositRequest() {
    return {
        chainId: '',
        denom: '',
    };
}
export const QueryLSMDepositRequest = {
    typeUrl: '/stride.records.QueryLSMDepositRequest',
    encode(message, writer = BinaryWriter.create()) {
        if (message.chainId !== '') {
            writer.uint32(10).string(message.chainId);
        }
        if (message.denom !== '') {
            writer.uint32(18).string(message.denom);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryLSMDepositRequest();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.chainId = reader.string();
                    break;
                case 2:
                    message.denom = reader.string();
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
            denom: isSet(object.denom) ? String(object.denom) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.chainId !== undefined && (obj.chainId = message.chainId);
        message.denom !== undefined && (obj.denom = message.denom);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryLSMDepositRequest();
        message.chainId = object.chainId ?? '';
        message.denom = object.denom ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return QueryLSMDepositRequest.decode(message.value);
    },
    toProto(message) {
        return QueryLSMDepositRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.records.QueryLSMDepositRequest',
            value: QueryLSMDepositRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryLSMDepositResponse() {
    return {
        deposit: LSMTokenDeposit.fromPartial({}),
    };
}
export const QueryLSMDepositResponse = {
    typeUrl: '/stride.records.QueryLSMDepositResponse',
    encode(message, writer = BinaryWriter.create()) {
        if (message.deposit !== undefined) {
            LSMTokenDeposit.encode(message.deposit, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryLSMDepositResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.deposit = LSMTokenDeposit.decode(reader, reader.uint32());
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
            deposit: isSet(object.deposit)
                ? LSMTokenDeposit.fromJSON(object.deposit)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.deposit !== undefined &&
            (obj.deposit = message.deposit
                ? LSMTokenDeposit.toJSON(message.deposit)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryLSMDepositResponse();
        message.deposit =
            object.deposit !== undefined && object.deposit !== null
                ? LSMTokenDeposit.fromPartial(object.deposit)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return QueryLSMDepositResponse.decode(message.value);
    },
    toProto(message) {
        return QueryLSMDepositResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.records.QueryLSMDepositResponse',
            value: QueryLSMDepositResponse.encode(message).finish(),
        };
    },
};
function createBaseQueryLSMDepositsRequest() {
    return {
        chainId: '',
        validatorAddress: '',
        status: '',
    };
}
export const QueryLSMDepositsRequest = {
    typeUrl: '/stride.records.QueryLSMDepositsRequest',
    encode(message, writer = BinaryWriter.create()) {
        if (message.chainId !== '') {
            writer.uint32(10).string(message.chainId);
        }
        if (message.validatorAddress !== '') {
            writer.uint32(18).string(message.validatorAddress);
        }
        if (message.status !== '') {
            writer.uint32(26).string(message.status);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryLSMDepositsRequest();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.chainId = reader.string();
                    break;
                case 2:
                    message.validatorAddress = reader.string();
                    break;
                case 3:
                    message.status = reader.string();
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
            validatorAddress: isSet(object.validatorAddress)
                ? String(object.validatorAddress)
                : '',
            status: isSet(object.status) ? String(object.status) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.chainId !== undefined && (obj.chainId = message.chainId);
        message.validatorAddress !== undefined &&
            (obj.validatorAddress = message.validatorAddress);
        message.status !== undefined && (obj.status = message.status);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryLSMDepositsRequest();
        message.chainId = object.chainId ?? '';
        message.validatorAddress = object.validatorAddress ?? '';
        message.status = object.status ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return QueryLSMDepositsRequest.decode(message.value);
    },
    toProto(message) {
        return QueryLSMDepositsRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.records.QueryLSMDepositsRequest',
            value: QueryLSMDepositsRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryLSMDepositsResponse() {
    return {
        deposits: [],
    };
}
export const QueryLSMDepositsResponse = {
    typeUrl: '/stride.records.QueryLSMDepositsResponse',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.deposits) {
            LSMTokenDeposit.encode(v, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryLSMDepositsResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.deposits.push(LSMTokenDeposit.decode(reader, reader.uint32()));
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
            deposits: Array.isArray(object?.deposits)
                ? object.deposits.map((e) => LSMTokenDeposit.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.deposits) {
            obj.deposits = message.deposits.map(e => e ? LSMTokenDeposit.toJSON(e) : undefined);
        }
        else {
            obj.deposits = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryLSMDepositsResponse();
        message.deposits =
            object.deposits?.map(e => LSMTokenDeposit.fromPartial(e)) || [];
        return message;
    },
    fromProtoMsg(message) {
        return QueryLSMDepositsResponse.decode(message.value);
    },
    toProto(message) {
        return QueryLSMDepositsResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.records.QueryLSMDepositsResponse',
            value: QueryLSMDepositsResponse.encode(message).finish(),
        };
    },
};
//# sourceMappingURL=query.js.map