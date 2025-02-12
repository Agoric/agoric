//@ts-nocheck
import { PageRequest, PageResponse, } from '../../cosmos/base/query/v1beta1/pagination.js';
import { HostZone, DelegationRecord, UnbondingRecord, SlashRecord, RedemptionRecord, } from './staketia.js';
import { BinaryReader, BinaryWriter } from '../../binary.js';
import {} from '../../json-safe.js';
import { isSet } from '../../helpers.js';
function createBaseQueryHostZoneRequest() {
    return {};
}
export const QueryHostZoneRequest = {
    typeUrl: '/stride.staketia.QueryHostZoneRequest',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryHostZoneRequest();
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
        const message = createBaseQueryHostZoneRequest();
        return message;
    },
    fromProtoMsg(message) {
        return QueryHostZoneRequest.decode(message.value);
    },
    toProto(message) {
        return QueryHostZoneRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.staketia.QueryHostZoneRequest',
            value: QueryHostZoneRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryHostZoneResponse() {
    return {
        hostZone: undefined,
    };
}
export const QueryHostZoneResponse = {
    typeUrl: '/stride.staketia.QueryHostZoneResponse',
    encode(message, writer = BinaryWriter.create()) {
        if (message.hostZone !== undefined) {
            HostZone.encode(message.hostZone, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryHostZoneResponse();
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
        const message = createBaseQueryHostZoneResponse();
        message.hostZone =
            object.hostZone !== undefined && object.hostZone !== null
                ? HostZone.fromPartial(object.hostZone)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return QueryHostZoneResponse.decode(message.value);
    },
    toProto(message) {
        return QueryHostZoneResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.staketia.QueryHostZoneResponse',
            value: QueryHostZoneResponse.encode(message).finish(),
        };
    },
};
function createBaseQueryDelegationRecordsRequest() {
    return {
        includeArchived: false,
    };
}
export const QueryDelegationRecordsRequest = {
    typeUrl: '/stride.staketia.QueryDelegationRecordsRequest',
    encode(message, writer = BinaryWriter.create()) {
        if (message.includeArchived === true) {
            writer.uint32(8).bool(message.includeArchived);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryDelegationRecordsRequest();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.includeArchived = reader.bool();
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
            includeArchived: isSet(object.includeArchived)
                ? Boolean(object.includeArchived)
                : false,
        };
    },
    toJSON(message) {
        const obj = {};
        message.includeArchived !== undefined &&
            (obj.includeArchived = message.includeArchived);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryDelegationRecordsRequest();
        message.includeArchived = object.includeArchived ?? false;
        return message;
    },
    fromProtoMsg(message) {
        return QueryDelegationRecordsRequest.decode(message.value);
    },
    toProto(message) {
        return QueryDelegationRecordsRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.staketia.QueryDelegationRecordsRequest',
            value: QueryDelegationRecordsRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryDelegationRecordsResponse() {
    return {
        delegationRecords: [],
    };
}
export const QueryDelegationRecordsResponse = {
    typeUrl: '/stride.staketia.QueryDelegationRecordsResponse',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.delegationRecords) {
            DelegationRecord.encode(v, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryDelegationRecordsResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.delegationRecords.push(DelegationRecord.decode(reader, reader.uint32()));
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
            delegationRecords: Array.isArray(object?.delegationRecords)
                ? object.delegationRecords.map((e) => DelegationRecord.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.delegationRecords) {
            obj.delegationRecords = message.delegationRecords.map(e => e ? DelegationRecord.toJSON(e) : undefined);
        }
        else {
            obj.delegationRecords = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryDelegationRecordsResponse();
        message.delegationRecords =
            object.delegationRecords?.map(e => DelegationRecord.fromPartial(e)) || [];
        return message;
    },
    fromProtoMsg(message) {
        return QueryDelegationRecordsResponse.decode(message.value);
    },
    toProto(message) {
        return QueryDelegationRecordsResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.staketia.QueryDelegationRecordsResponse',
            value: QueryDelegationRecordsResponse.encode(message).finish(),
        };
    },
};
function createBaseQueryUnbondingRecordsRequest() {
    return {
        includeArchived: false,
    };
}
export const QueryUnbondingRecordsRequest = {
    typeUrl: '/stride.staketia.QueryUnbondingRecordsRequest',
    encode(message, writer = BinaryWriter.create()) {
        if (message.includeArchived === true) {
            writer.uint32(8).bool(message.includeArchived);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryUnbondingRecordsRequest();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.includeArchived = reader.bool();
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
            includeArchived: isSet(object.includeArchived)
                ? Boolean(object.includeArchived)
                : false,
        };
    },
    toJSON(message) {
        const obj = {};
        message.includeArchived !== undefined &&
            (obj.includeArchived = message.includeArchived);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryUnbondingRecordsRequest();
        message.includeArchived = object.includeArchived ?? false;
        return message;
    },
    fromProtoMsg(message) {
        return QueryUnbondingRecordsRequest.decode(message.value);
    },
    toProto(message) {
        return QueryUnbondingRecordsRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.staketia.QueryUnbondingRecordsRequest',
            value: QueryUnbondingRecordsRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryUnbondingRecordsResponse() {
    return {
        unbondingRecords: [],
    };
}
export const QueryUnbondingRecordsResponse = {
    typeUrl: '/stride.staketia.QueryUnbondingRecordsResponse',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.unbondingRecords) {
            UnbondingRecord.encode(v, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryUnbondingRecordsResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.unbondingRecords.push(UnbondingRecord.decode(reader, reader.uint32()));
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
            unbondingRecords: Array.isArray(object?.unbondingRecords)
                ? object.unbondingRecords.map((e) => UnbondingRecord.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.unbondingRecords) {
            obj.unbondingRecords = message.unbondingRecords.map(e => e ? UnbondingRecord.toJSON(e) : undefined);
        }
        else {
            obj.unbondingRecords = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryUnbondingRecordsResponse();
        message.unbondingRecords =
            object.unbondingRecords?.map(e => UnbondingRecord.fromPartial(e)) || [];
        return message;
    },
    fromProtoMsg(message) {
        return QueryUnbondingRecordsResponse.decode(message.value);
    },
    toProto(message) {
        return QueryUnbondingRecordsResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.staketia.QueryUnbondingRecordsResponse',
            value: QueryUnbondingRecordsResponse.encode(message).finish(),
        };
    },
};
function createBaseQueryRedemptionRecordRequest() {
    return {
        unbondingRecordId: BigInt(0),
        address: '',
    };
}
export const QueryRedemptionRecordRequest = {
    typeUrl: '/stride.staketia.QueryRedemptionRecordRequest',
    encode(message, writer = BinaryWriter.create()) {
        if (message.unbondingRecordId !== BigInt(0)) {
            writer.uint32(8).uint64(message.unbondingRecordId);
        }
        if (message.address !== '') {
            writer.uint32(18).string(message.address);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryRedemptionRecordRequest();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.unbondingRecordId = reader.uint64();
                    break;
                case 2:
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
            unbondingRecordId: isSet(object.unbondingRecordId)
                ? BigInt(object.unbondingRecordId.toString())
                : BigInt(0),
            address: isSet(object.address) ? String(object.address) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.unbondingRecordId !== undefined &&
            (obj.unbondingRecordId = (message.unbondingRecordId || BigInt(0)).toString());
        message.address !== undefined && (obj.address = message.address);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryRedemptionRecordRequest();
        message.unbondingRecordId =
            object.unbondingRecordId !== undefined &&
                object.unbondingRecordId !== null
                ? BigInt(object.unbondingRecordId.toString())
                : BigInt(0);
        message.address = object.address ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return QueryRedemptionRecordRequest.decode(message.value);
    },
    toProto(message) {
        return QueryRedemptionRecordRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.staketia.QueryRedemptionRecordRequest',
            value: QueryRedemptionRecordRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryRedemptionRecordResponse() {
    return {
        redemptionRecordResponse: undefined,
    };
}
export const QueryRedemptionRecordResponse = {
    typeUrl: '/stride.staketia.QueryRedemptionRecordResponse',
    encode(message, writer = BinaryWriter.create()) {
        if (message.redemptionRecordResponse !== undefined) {
            RedemptionRecordResponse.encode(message.redemptionRecordResponse, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryRedemptionRecordResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.redemptionRecordResponse = RedemptionRecordResponse.decode(reader, reader.uint32());
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
            redemptionRecordResponse: isSet(object.redemptionRecordResponse)
                ? RedemptionRecordResponse.fromJSON(object.redemptionRecordResponse)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.redemptionRecordResponse !== undefined &&
            (obj.redemptionRecordResponse = message.redemptionRecordResponse
                ? RedemptionRecordResponse.toJSON(message.redemptionRecordResponse)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryRedemptionRecordResponse();
        message.redemptionRecordResponse =
            object.redemptionRecordResponse !== undefined &&
                object.redemptionRecordResponse !== null
                ? RedemptionRecordResponse.fromPartial(object.redemptionRecordResponse)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return QueryRedemptionRecordResponse.decode(message.value);
    },
    toProto(message) {
        return QueryRedemptionRecordResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.staketia.QueryRedemptionRecordResponse',
            value: QueryRedemptionRecordResponse.encode(message).finish(),
        };
    },
};
function createBaseQueryRedemptionRecordsRequest() {
    return {
        address: '',
        unbondingRecordId: BigInt(0),
        pagination: undefined,
    };
}
export const QueryRedemptionRecordsRequest = {
    typeUrl: '/stride.staketia.QueryRedemptionRecordsRequest',
    encode(message, writer = BinaryWriter.create()) {
        if (message.address !== '') {
            writer.uint32(10).string(message.address);
        }
        if (message.unbondingRecordId !== BigInt(0)) {
            writer.uint32(16).uint64(message.unbondingRecordId);
        }
        if (message.pagination !== undefined) {
            PageRequest.encode(message.pagination, writer.uint32(26).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryRedemptionRecordsRequest();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.address = reader.string();
                    break;
                case 2:
                    message.unbondingRecordId = reader.uint64();
                    break;
                case 3:
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
            address: isSet(object.address) ? String(object.address) : '',
            unbondingRecordId: isSet(object.unbondingRecordId)
                ? BigInt(object.unbondingRecordId.toString())
                : BigInt(0),
            pagination: isSet(object.pagination)
                ? PageRequest.fromJSON(object.pagination)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.address !== undefined && (obj.address = message.address);
        message.unbondingRecordId !== undefined &&
            (obj.unbondingRecordId = (message.unbondingRecordId || BigInt(0)).toString());
        message.pagination !== undefined &&
            (obj.pagination = message.pagination
                ? PageRequest.toJSON(message.pagination)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryRedemptionRecordsRequest();
        message.address = object.address ?? '';
        message.unbondingRecordId =
            object.unbondingRecordId !== undefined &&
                object.unbondingRecordId !== null
                ? BigInt(object.unbondingRecordId.toString())
                : BigInt(0);
        message.pagination =
            object.pagination !== undefined && object.pagination !== null
                ? PageRequest.fromPartial(object.pagination)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return QueryRedemptionRecordsRequest.decode(message.value);
    },
    toProto(message) {
        return QueryRedemptionRecordsRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.staketia.QueryRedemptionRecordsRequest',
            value: QueryRedemptionRecordsRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryRedemptionRecordsResponse() {
    return {
        redemptionRecordResponses: [],
        pagination: undefined,
    };
}
export const QueryRedemptionRecordsResponse = {
    typeUrl: '/stride.staketia.QueryRedemptionRecordsResponse',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.redemptionRecordResponses) {
            RedemptionRecordResponse.encode(v, writer.uint32(10).fork()).ldelim();
        }
        if (message.pagination !== undefined) {
            PageResponse.encode(message.pagination, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryRedemptionRecordsResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.redemptionRecordResponses.push(RedemptionRecordResponse.decode(reader, reader.uint32()));
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
            redemptionRecordResponses: Array.isArray(object?.redemptionRecordResponses)
                ? object.redemptionRecordResponses.map((e) => RedemptionRecordResponse.fromJSON(e))
                : [],
            pagination: isSet(object.pagination)
                ? PageResponse.fromJSON(object.pagination)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.redemptionRecordResponses) {
            obj.redemptionRecordResponses = message.redemptionRecordResponses.map(e => (e ? RedemptionRecordResponse.toJSON(e) : undefined));
        }
        else {
            obj.redemptionRecordResponses = [];
        }
        message.pagination !== undefined &&
            (obj.pagination = message.pagination
                ? PageResponse.toJSON(message.pagination)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryRedemptionRecordsResponse();
        message.redemptionRecordResponses =
            object.redemptionRecordResponses?.map(e => RedemptionRecordResponse.fromPartial(e)) || [];
        message.pagination =
            object.pagination !== undefined && object.pagination !== null
                ? PageResponse.fromPartial(object.pagination)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return QueryRedemptionRecordsResponse.decode(message.value);
    },
    toProto(message) {
        return QueryRedemptionRecordsResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.staketia.QueryRedemptionRecordsResponse',
            value: QueryRedemptionRecordsResponse.encode(message).finish(),
        };
    },
};
function createBaseQuerySlashRecordsRequest() {
    return {};
}
export const QuerySlashRecordsRequest = {
    typeUrl: '/stride.staketia.QuerySlashRecordsRequest',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQuerySlashRecordsRequest();
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
        const message = createBaseQuerySlashRecordsRequest();
        return message;
    },
    fromProtoMsg(message) {
        return QuerySlashRecordsRequest.decode(message.value);
    },
    toProto(message) {
        return QuerySlashRecordsRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.staketia.QuerySlashRecordsRequest',
            value: QuerySlashRecordsRequest.encode(message).finish(),
        };
    },
};
function createBaseQuerySlashRecordsResponse() {
    return {
        slashRecords: [],
    };
}
export const QuerySlashRecordsResponse = {
    typeUrl: '/stride.staketia.QuerySlashRecordsResponse',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.slashRecords) {
            SlashRecord.encode(v, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQuerySlashRecordsResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.slashRecords.push(SlashRecord.decode(reader, reader.uint32()));
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
            slashRecords: Array.isArray(object?.slashRecords)
                ? object.slashRecords.map((e) => SlashRecord.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.slashRecords) {
            obj.slashRecords = message.slashRecords.map(e => e ? SlashRecord.toJSON(e) : undefined);
        }
        else {
            obj.slashRecords = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQuerySlashRecordsResponse();
        message.slashRecords =
            object.slashRecords?.map(e => SlashRecord.fromPartial(e)) || [];
        return message;
    },
    fromProtoMsg(message) {
        return QuerySlashRecordsResponse.decode(message.value);
    },
    toProto(message) {
        return QuerySlashRecordsResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.staketia.QuerySlashRecordsResponse',
            value: QuerySlashRecordsResponse.encode(message).finish(),
        };
    },
};
function createBaseRedemptionRecordResponse() {
    return {
        redemptionRecord: undefined,
        unbondingCompletionTimeSeconds: BigInt(0),
    };
}
export const RedemptionRecordResponse = {
    typeUrl: '/stride.staketia.RedemptionRecordResponse',
    encode(message, writer = BinaryWriter.create()) {
        if (message.redemptionRecord !== undefined) {
            RedemptionRecord.encode(message.redemptionRecord, writer.uint32(10).fork()).ldelim();
        }
        if (message.unbondingCompletionTimeSeconds !== BigInt(0)) {
            writer.uint32(16).uint64(message.unbondingCompletionTimeSeconds);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseRedemptionRecordResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.redemptionRecord = RedemptionRecord.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.unbondingCompletionTimeSeconds = reader.uint64();
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
            redemptionRecord: isSet(object.redemptionRecord)
                ? RedemptionRecord.fromJSON(object.redemptionRecord)
                : undefined,
            unbondingCompletionTimeSeconds: isSet(object.unbondingCompletionTimeSeconds)
                ? BigInt(object.unbondingCompletionTimeSeconds.toString())
                : BigInt(0),
        };
    },
    toJSON(message) {
        const obj = {};
        message.redemptionRecord !== undefined &&
            (obj.redemptionRecord = message.redemptionRecord
                ? RedemptionRecord.toJSON(message.redemptionRecord)
                : undefined);
        message.unbondingCompletionTimeSeconds !== undefined &&
            (obj.unbondingCompletionTimeSeconds = (message.unbondingCompletionTimeSeconds || BigInt(0)).toString());
        return obj;
    },
    fromPartial(object) {
        const message = createBaseRedemptionRecordResponse();
        message.redemptionRecord =
            object.redemptionRecord !== undefined && object.redemptionRecord !== null
                ? RedemptionRecord.fromPartial(object.redemptionRecord)
                : undefined;
        message.unbondingCompletionTimeSeconds =
            object.unbondingCompletionTimeSeconds !== undefined &&
                object.unbondingCompletionTimeSeconds !== null
                ? BigInt(object.unbondingCompletionTimeSeconds.toString())
                : BigInt(0);
        return message;
    },
    fromProtoMsg(message) {
        return RedemptionRecordResponse.decode(message.value);
    },
    toProto(message) {
        return RedemptionRecordResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.staketia.RedemptionRecordResponse',
            value: RedemptionRecordResponse.encode(message).finish(),
        };
    },
};
//# sourceMappingURL=query.js.map