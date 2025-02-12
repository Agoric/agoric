//@ts-nocheck
import { PageRequest, PageResponse, } from '../../cosmos/base/query/v1beta1/pagination.js';
import { Timestamp, } from '../../google/protobuf/timestamp.js';
import { Airdrop, UserAllocation, } from './airdrop.js';
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { isSet, Decimal, fromJsonTimestamp, fromTimestamp, } from '../../helpers.js';
import {} from '../../json-safe.js';
function createBaseQueryAirdropRequest() {
    return {
        id: '',
    };
}
export const QueryAirdropRequest = {
    typeUrl: '/stride.airdrop.QueryAirdropRequest',
    encode(message, writer = BinaryWriter.create()) {
        if (message.id !== '') {
            writer.uint32(10).string(message.id);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryAirdropRequest();
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
        const message = createBaseQueryAirdropRequest();
        message.id = object.id ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return QueryAirdropRequest.decode(message.value);
    },
    toProto(message) {
        return QueryAirdropRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.airdrop.QueryAirdropRequest',
            value: QueryAirdropRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryAirdropResponse() {
    return {
        id: '',
        rewardDenom: '',
        distributionStartDate: undefined,
        distributionEndDate: undefined,
        clawbackDate: undefined,
        claimTypeDeadlineDate: undefined,
        earlyClaimPenalty: '',
        distributorAddress: '',
        allocatorAddress: '',
        linkerAddress: '',
        currentDateIndex: BigInt(0),
        airdropLength: BigInt(0),
    };
}
export const QueryAirdropResponse = {
    typeUrl: '/stride.airdrop.QueryAirdropResponse',
    encode(message, writer = BinaryWriter.create()) {
        if (message.id !== '') {
            writer.uint32(10).string(message.id);
        }
        if (message.rewardDenom !== '') {
            writer.uint32(18).string(message.rewardDenom);
        }
        if (message.distributionStartDate !== undefined) {
            Timestamp.encode(message.distributionStartDate, writer.uint32(26).fork()).ldelim();
        }
        if (message.distributionEndDate !== undefined) {
            Timestamp.encode(message.distributionEndDate, writer.uint32(34).fork()).ldelim();
        }
        if (message.clawbackDate !== undefined) {
            Timestamp.encode(message.clawbackDate, writer.uint32(42).fork()).ldelim();
        }
        if (message.claimTypeDeadlineDate !== undefined) {
            Timestamp.encode(message.claimTypeDeadlineDate, writer.uint32(50).fork()).ldelim();
        }
        if (message.earlyClaimPenalty !== '') {
            writer
                .uint32(58)
                .string(Decimal.fromUserInput(message.earlyClaimPenalty, 18).atomics);
        }
        if (message.distributorAddress !== '') {
            writer.uint32(66).string(message.distributorAddress);
        }
        if (message.allocatorAddress !== '') {
            writer.uint32(74).string(message.allocatorAddress);
        }
        if (message.linkerAddress !== '') {
            writer.uint32(82).string(message.linkerAddress);
        }
        if (message.currentDateIndex !== BigInt(0)) {
            writer.uint32(88).int64(message.currentDateIndex);
        }
        if (message.airdropLength !== BigInt(0)) {
            writer.uint32(96).int64(message.airdropLength);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryAirdropResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.id = reader.string();
                    break;
                case 2:
                    message.rewardDenom = reader.string();
                    break;
                case 3:
                    message.distributionStartDate = Timestamp.decode(reader, reader.uint32());
                    break;
                case 4:
                    message.distributionEndDate = Timestamp.decode(reader, reader.uint32());
                    break;
                case 5:
                    message.clawbackDate = Timestamp.decode(reader, reader.uint32());
                    break;
                case 6:
                    message.claimTypeDeadlineDate = Timestamp.decode(reader, reader.uint32());
                    break;
                case 7:
                    message.earlyClaimPenalty = Decimal.fromAtomics(reader.string(), 18).toString();
                    break;
                case 8:
                    message.distributorAddress = reader.string();
                    break;
                case 9:
                    message.allocatorAddress = reader.string();
                    break;
                case 10:
                    message.linkerAddress = reader.string();
                    break;
                case 11:
                    message.currentDateIndex = reader.int64();
                    break;
                case 12:
                    message.airdropLength = reader.int64();
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
            rewardDenom: isSet(object.rewardDenom) ? String(object.rewardDenom) : '',
            distributionStartDate: isSet(object.distributionStartDate)
                ? fromJsonTimestamp(object.distributionStartDate)
                : undefined,
            distributionEndDate: isSet(object.distributionEndDate)
                ? fromJsonTimestamp(object.distributionEndDate)
                : undefined,
            clawbackDate: isSet(object.clawbackDate)
                ? fromJsonTimestamp(object.clawbackDate)
                : undefined,
            claimTypeDeadlineDate: isSet(object.claimTypeDeadlineDate)
                ? fromJsonTimestamp(object.claimTypeDeadlineDate)
                : undefined,
            earlyClaimPenalty: isSet(object.earlyClaimPenalty)
                ? String(object.earlyClaimPenalty)
                : '',
            distributorAddress: isSet(object.distributorAddress)
                ? String(object.distributorAddress)
                : '',
            allocatorAddress: isSet(object.allocatorAddress)
                ? String(object.allocatorAddress)
                : '',
            linkerAddress: isSet(object.linkerAddress)
                ? String(object.linkerAddress)
                : '',
            currentDateIndex: isSet(object.currentDateIndex)
                ? BigInt(object.currentDateIndex.toString())
                : BigInt(0),
            airdropLength: isSet(object.airdropLength)
                ? BigInt(object.airdropLength.toString())
                : BigInt(0),
        };
    },
    toJSON(message) {
        const obj = {};
        message.id !== undefined && (obj.id = message.id);
        message.rewardDenom !== undefined &&
            (obj.rewardDenom = message.rewardDenom);
        message.distributionStartDate !== undefined &&
            (obj.distributionStartDate = fromTimestamp(message.distributionStartDate).toISOString());
        message.distributionEndDate !== undefined &&
            (obj.distributionEndDate = fromTimestamp(message.distributionEndDate).toISOString());
        message.clawbackDate !== undefined &&
            (obj.clawbackDate = fromTimestamp(message.clawbackDate).toISOString());
        message.claimTypeDeadlineDate !== undefined &&
            (obj.claimTypeDeadlineDate = fromTimestamp(message.claimTypeDeadlineDate).toISOString());
        message.earlyClaimPenalty !== undefined &&
            (obj.earlyClaimPenalty = message.earlyClaimPenalty);
        message.distributorAddress !== undefined &&
            (obj.distributorAddress = message.distributorAddress);
        message.allocatorAddress !== undefined &&
            (obj.allocatorAddress = message.allocatorAddress);
        message.linkerAddress !== undefined &&
            (obj.linkerAddress = message.linkerAddress);
        message.currentDateIndex !== undefined &&
            (obj.currentDateIndex = (message.currentDateIndex || BigInt(0)).toString());
        message.airdropLength !== undefined &&
            (obj.airdropLength = (message.airdropLength || BigInt(0)).toString());
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryAirdropResponse();
        message.id = object.id ?? '';
        message.rewardDenom = object.rewardDenom ?? '';
        message.distributionStartDate =
            object.distributionStartDate !== undefined &&
                object.distributionStartDate !== null
                ? Timestamp.fromPartial(object.distributionStartDate)
                : undefined;
        message.distributionEndDate =
            object.distributionEndDate !== undefined &&
                object.distributionEndDate !== null
                ? Timestamp.fromPartial(object.distributionEndDate)
                : undefined;
        message.clawbackDate =
            object.clawbackDate !== undefined && object.clawbackDate !== null
                ? Timestamp.fromPartial(object.clawbackDate)
                : undefined;
        message.claimTypeDeadlineDate =
            object.claimTypeDeadlineDate !== undefined &&
                object.claimTypeDeadlineDate !== null
                ? Timestamp.fromPartial(object.claimTypeDeadlineDate)
                : undefined;
        message.earlyClaimPenalty = object.earlyClaimPenalty ?? '';
        message.distributorAddress = object.distributorAddress ?? '';
        message.allocatorAddress = object.allocatorAddress ?? '';
        message.linkerAddress = object.linkerAddress ?? '';
        message.currentDateIndex =
            object.currentDateIndex !== undefined && object.currentDateIndex !== null
                ? BigInt(object.currentDateIndex.toString())
                : BigInt(0);
        message.airdropLength =
            object.airdropLength !== undefined && object.airdropLength !== null
                ? BigInt(object.airdropLength.toString())
                : BigInt(0);
        return message;
    },
    fromProtoMsg(message) {
        return QueryAirdropResponse.decode(message.value);
    },
    toProto(message) {
        return QueryAirdropResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.airdrop.QueryAirdropResponse',
            value: QueryAirdropResponse.encode(message).finish(),
        };
    },
};
function createBaseQueryAllAirdropsRequest() {
    return {};
}
export const QueryAllAirdropsRequest = {
    typeUrl: '/stride.airdrop.QueryAllAirdropsRequest',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryAllAirdropsRequest();
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
        const message = createBaseQueryAllAirdropsRequest();
        return message;
    },
    fromProtoMsg(message) {
        return QueryAllAirdropsRequest.decode(message.value);
    },
    toProto(message) {
        return QueryAllAirdropsRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.airdrop.QueryAllAirdropsRequest',
            value: QueryAllAirdropsRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryAllAirdropsResponse() {
    return {
        airdrops: [],
    };
}
export const QueryAllAirdropsResponse = {
    typeUrl: '/stride.airdrop.QueryAllAirdropsResponse',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.airdrops) {
            Airdrop.encode(v, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryAllAirdropsResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.airdrops.push(Airdrop.decode(reader, reader.uint32()));
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
            airdrops: Array.isArray(object?.airdrops)
                ? object.airdrops.map((e) => Airdrop.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.airdrops) {
            obj.airdrops = message.airdrops.map(e => e ? Airdrop.toJSON(e) : undefined);
        }
        else {
            obj.airdrops = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryAllAirdropsResponse();
        message.airdrops = object.airdrops?.map(e => Airdrop.fromPartial(e)) || [];
        return message;
    },
    fromProtoMsg(message) {
        return QueryAllAirdropsResponse.decode(message.value);
    },
    toProto(message) {
        return QueryAllAirdropsResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.airdrop.QueryAllAirdropsResponse',
            value: QueryAllAirdropsResponse.encode(message).finish(),
        };
    },
};
function createBaseQueryUserAllocationRequest() {
    return {
        airdropId: '',
        address: '',
    };
}
export const QueryUserAllocationRequest = {
    typeUrl: '/stride.airdrop.QueryUserAllocationRequest',
    encode(message, writer = BinaryWriter.create()) {
        if (message.airdropId !== '') {
            writer.uint32(10).string(message.airdropId);
        }
        if (message.address !== '') {
            writer.uint32(18).string(message.address);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryUserAllocationRequest();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.airdropId = reader.string();
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
            airdropId: isSet(object.airdropId) ? String(object.airdropId) : '',
            address: isSet(object.address) ? String(object.address) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.airdropId !== undefined && (obj.airdropId = message.airdropId);
        message.address !== undefined && (obj.address = message.address);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryUserAllocationRequest();
        message.airdropId = object.airdropId ?? '';
        message.address = object.address ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return QueryUserAllocationRequest.decode(message.value);
    },
    toProto(message) {
        return QueryUserAllocationRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.airdrop.QueryUserAllocationRequest',
            value: QueryUserAllocationRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryUserAllocationResponse() {
    return {
        userAllocation: undefined,
    };
}
export const QueryUserAllocationResponse = {
    typeUrl: '/stride.airdrop.QueryUserAllocationResponse',
    encode(message, writer = BinaryWriter.create()) {
        if (message.userAllocation !== undefined) {
            UserAllocation.encode(message.userAllocation, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryUserAllocationResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.userAllocation = UserAllocation.decode(reader, reader.uint32());
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
            userAllocation: isSet(object.userAllocation)
                ? UserAllocation.fromJSON(object.userAllocation)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.userAllocation !== undefined &&
            (obj.userAllocation = message.userAllocation
                ? UserAllocation.toJSON(message.userAllocation)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryUserAllocationResponse();
        message.userAllocation =
            object.userAllocation !== undefined && object.userAllocation !== null
                ? UserAllocation.fromPartial(object.userAllocation)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return QueryUserAllocationResponse.decode(message.value);
    },
    toProto(message) {
        return QueryUserAllocationResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.airdrop.QueryUserAllocationResponse',
            value: QueryUserAllocationResponse.encode(message).finish(),
        };
    },
};
function createBaseQueryUserAllocationsRequest() {
    return {
        address: '',
    };
}
export const QueryUserAllocationsRequest = {
    typeUrl: '/stride.airdrop.QueryUserAllocationsRequest',
    encode(message, writer = BinaryWriter.create()) {
        if (message.address !== '') {
            writer.uint32(10).string(message.address);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryUserAllocationsRequest();
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
        const message = createBaseQueryUserAllocationsRequest();
        message.address = object.address ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return QueryUserAllocationsRequest.decode(message.value);
    },
    toProto(message) {
        return QueryUserAllocationsRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.airdrop.QueryUserAllocationsRequest',
            value: QueryUserAllocationsRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryUserAllocationsResponse() {
    return {
        userAllocations: [],
    };
}
export const QueryUserAllocationsResponse = {
    typeUrl: '/stride.airdrop.QueryUserAllocationsResponse',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.userAllocations) {
            UserAllocation.encode(v, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryUserAllocationsResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.userAllocations.push(UserAllocation.decode(reader, reader.uint32()));
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
            userAllocations: Array.isArray(object?.userAllocations)
                ? object.userAllocations.map((e) => UserAllocation.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.userAllocations) {
            obj.userAllocations = message.userAllocations.map(e => e ? UserAllocation.toJSON(e) : undefined);
        }
        else {
            obj.userAllocations = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryUserAllocationsResponse();
        message.userAllocations =
            object.userAllocations?.map(e => UserAllocation.fromPartial(e)) || [];
        return message;
    },
    fromProtoMsg(message) {
        return QueryUserAllocationsResponse.decode(message.value);
    },
    toProto(message) {
        return QueryUserAllocationsResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.airdrop.QueryUserAllocationsResponse',
            value: QueryUserAllocationsResponse.encode(message).finish(),
        };
    },
};
function createBaseQueryAllAllocationsRequest() {
    return {
        airdropId: '',
        pagination: undefined,
    };
}
export const QueryAllAllocationsRequest = {
    typeUrl: '/stride.airdrop.QueryAllAllocationsRequest',
    encode(message, writer = BinaryWriter.create()) {
        if (message.airdropId !== '') {
            writer.uint32(10).string(message.airdropId);
        }
        if (message.pagination !== undefined) {
            PageRequest.encode(message.pagination, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryAllAllocationsRequest();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.airdropId = reader.string();
                    break;
                case 2:
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
            airdropId: isSet(object.airdropId) ? String(object.airdropId) : '',
            pagination: isSet(object.pagination)
                ? PageRequest.fromJSON(object.pagination)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.airdropId !== undefined && (obj.airdropId = message.airdropId);
        message.pagination !== undefined &&
            (obj.pagination = message.pagination
                ? PageRequest.toJSON(message.pagination)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryAllAllocationsRequest();
        message.airdropId = object.airdropId ?? '';
        message.pagination =
            object.pagination !== undefined && object.pagination !== null
                ? PageRequest.fromPartial(object.pagination)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return QueryAllAllocationsRequest.decode(message.value);
    },
    toProto(message) {
        return QueryAllAllocationsRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.airdrop.QueryAllAllocationsRequest',
            value: QueryAllAllocationsRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryAllAllocationsResponse() {
    return {
        allocations: [],
        pagination: undefined,
    };
}
export const QueryAllAllocationsResponse = {
    typeUrl: '/stride.airdrop.QueryAllAllocationsResponse',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.allocations) {
            UserAllocation.encode(v, writer.uint32(10).fork()).ldelim();
        }
        if (message.pagination !== undefined) {
            PageResponse.encode(message.pagination, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryAllAllocationsResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.allocations.push(UserAllocation.decode(reader, reader.uint32()));
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
            allocations: Array.isArray(object?.allocations)
                ? object.allocations.map((e) => UserAllocation.fromJSON(e))
                : [],
            pagination: isSet(object.pagination)
                ? PageResponse.fromJSON(object.pagination)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.allocations) {
            obj.allocations = message.allocations.map(e => e ? UserAllocation.toJSON(e) : undefined);
        }
        else {
            obj.allocations = [];
        }
        message.pagination !== undefined &&
            (obj.pagination = message.pagination
                ? PageResponse.toJSON(message.pagination)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryAllAllocationsResponse();
        message.allocations =
            object.allocations?.map(e => UserAllocation.fromPartial(e)) || [];
        message.pagination =
            object.pagination !== undefined && object.pagination !== null
                ? PageResponse.fromPartial(object.pagination)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return QueryAllAllocationsResponse.decode(message.value);
    },
    toProto(message) {
        return QueryAllAllocationsResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.airdrop.QueryAllAllocationsResponse',
            value: QueryAllAllocationsResponse.encode(message).finish(),
        };
    },
};
function createBaseQueryUserSummaryRequest() {
    return {
        airdropId: '',
        address: '',
    };
}
export const QueryUserSummaryRequest = {
    typeUrl: '/stride.airdrop.QueryUserSummaryRequest',
    encode(message, writer = BinaryWriter.create()) {
        if (message.airdropId !== '') {
            writer.uint32(10).string(message.airdropId);
        }
        if (message.address !== '') {
            writer.uint32(18).string(message.address);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryUserSummaryRequest();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.airdropId = reader.string();
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
            airdropId: isSet(object.airdropId) ? String(object.airdropId) : '',
            address: isSet(object.address) ? String(object.address) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.airdropId !== undefined && (obj.airdropId = message.airdropId);
        message.address !== undefined && (obj.address = message.address);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryUserSummaryRequest();
        message.airdropId = object.airdropId ?? '';
        message.address = object.address ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return QueryUserSummaryRequest.decode(message.value);
    },
    toProto(message) {
        return QueryUserSummaryRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.airdrop.QueryUserSummaryRequest',
            value: QueryUserSummaryRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryUserSummaryResponse() {
    return {
        claimType: '',
        claimed: '',
        forfeited: '',
        remaining: '',
        claimable: '',
    };
}
export const QueryUserSummaryResponse = {
    typeUrl: '/stride.airdrop.QueryUserSummaryResponse',
    encode(message, writer = BinaryWriter.create()) {
        if (message.claimType !== '') {
            writer.uint32(10).string(message.claimType);
        }
        if (message.claimed !== '') {
            writer.uint32(18).string(message.claimed);
        }
        if (message.forfeited !== '') {
            writer.uint32(26).string(message.forfeited);
        }
        if (message.remaining !== '') {
            writer.uint32(34).string(message.remaining);
        }
        if (message.claimable !== '') {
            writer.uint32(42).string(message.claimable);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryUserSummaryResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.claimType = reader.string();
                    break;
                case 2:
                    message.claimed = reader.string();
                    break;
                case 3:
                    message.forfeited = reader.string();
                    break;
                case 4:
                    message.remaining = reader.string();
                    break;
                case 5:
                    message.claimable = reader.string();
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
            claimType: isSet(object.claimType) ? String(object.claimType) : '',
            claimed: isSet(object.claimed) ? String(object.claimed) : '',
            forfeited: isSet(object.forfeited) ? String(object.forfeited) : '',
            remaining: isSet(object.remaining) ? String(object.remaining) : '',
            claimable: isSet(object.claimable) ? String(object.claimable) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.claimType !== undefined && (obj.claimType = message.claimType);
        message.claimed !== undefined && (obj.claimed = message.claimed);
        message.forfeited !== undefined && (obj.forfeited = message.forfeited);
        message.remaining !== undefined && (obj.remaining = message.remaining);
        message.claimable !== undefined && (obj.claimable = message.claimable);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryUserSummaryResponse();
        message.claimType = object.claimType ?? '';
        message.claimed = object.claimed ?? '';
        message.forfeited = object.forfeited ?? '';
        message.remaining = object.remaining ?? '';
        message.claimable = object.claimable ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return QueryUserSummaryResponse.decode(message.value);
    },
    toProto(message) {
        return QueryUserSummaryResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.airdrop.QueryUserSummaryResponse',
            value: QueryUserSummaryResponse.encode(message).finish(),
        };
    },
};
//# sourceMappingURL=query.js.map