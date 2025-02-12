//@ts-nocheck
import { Timestamp, } from '../../google/protobuf/timestamp.js';
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { isSet, Decimal, fromJsonTimestamp, fromTimestamp, } from '../../helpers.js';
import {} from '../../json-safe.js';
function createBaseMsgClaimDaily() {
    return {
        claimer: '',
        airdropId: '',
    };
}
export const MsgClaimDaily = {
    typeUrl: '/stride.airdrop.MsgClaimDaily',
    encode(message, writer = BinaryWriter.create()) {
        if (message.claimer !== '') {
            writer.uint32(10).string(message.claimer);
        }
        if (message.airdropId !== '') {
            writer.uint32(18).string(message.airdropId);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgClaimDaily();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.claimer = reader.string();
                    break;
                case 2:
                    message.airdropId = reader.string();
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
            claimer: isSet(object.claimer) ? String(object.claimer) : '',
            airdropId: isSet(object.airdropId) ? String(object.airdropId) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.claimer !== undefined && (obj.claimer = message.claimer);
        message.airdropId !== undefined && (obj.airdropId = message.airdropId);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgClaimDaily();
        message.claimer = object.claimer ?? '';
        message.airdropId = object.airdropId ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return MsgClaimDaily.decode(message.value);
    },
    toProto(message) {
        return MsgClaimDaily.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.airdrop.MsgClaimDaily',
            value: MsgClaimDaily.encode(message).finish(),
        };
    },
};
function createBaseMsgClaimDailyResponse() {
    return {};
}
export const MsgClaimDailyResponse = {
    typeUrl: '/stride.airdrop.MsgClaimDailyResponse',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgClaimDailyResponse();
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
        const message = createBaseMsgClaimDailyResponse();
        return message;
    },
    fromProtoMsg(message) {
        return MsgClaimDailyResponse.decode(message.value);
    },
    toProto(message) {
        return MsgClaimDailyResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.airdrop.MsgClaimDailyResponse',
            value: MsgClaimDailyResponse.encode(message).finish(),
        };
    },
};
function createBaseMsgClaimEarly() {
    return {
        claimer: '',
        airdropId: '',
    };
}
export const MsgClaimEarly = {
    typeUrl: '/stride.airdrop.MsgClaimEarly',
    encode(message, writer = BinaryWriter.create()) {
        if (message.claimer !== '') {
            writer.uint32(10).string(message.claimer);
        }
        if (message.airdropId !== '') {
            writer.uint32(18).string(message.airdropId);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgClaimEarly();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.claimer = reader.string();
                    break;
                case 2:
                    message.airdropId = reader.string();
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
            claimer: isSet(object.claimer) ? String(object.claimer) : '',
            airdropId: isSet(object.airdropId) ? String(object.airdropId) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.claimer !== undefined && (obj.claimer = message.claimer);
        message.airdropId !== undefined && (obj.airdropId = message.airdropId);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgClaimEarly();
        message.claimer = object.claimer ?? '';
        message.airdropId = object.airdropId ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return MsgClaimEarly.decode(message.value);
    },
    toProto(message) {
        return MsgClaimEarly.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.airdrop.MsgClaimEarly',
            value: MsgClaimEarly.encode(message).finish(),
        };
    },
};
function createBaseMsgClaimEarlyResponse() {
    return {};
}
export const MsgClaimEarlyResponse = {
    typeUrl: '/stride.airdrop.MsgClaimEarlyResponse',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgClaimEarlyResponse();
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
        const message = createBaseMsgClaimEarlyResponse();
        return message;
    },
    fromProtoMsg(message) {
        return MsgClaimEarlyResponse.decode(message.value);
    },
    toProto(message) {
        return MsgClaimEarlyResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.airdrop.MsgClaimEarlyResponse',
            value: MsgClaimEarlyResponse.encode(message).finish(),
        };
    },
};
function createBaseMsgCreateAirdrop() {
    return {
        admin: '',
        airdropId: '',
        rewardDenom: '',
        distributionStartDate: undefined,
        distributionEndDate: undefined,
        clawbackDate: undefined,
        claimTypeDeadlineDate: undefined,
        earlyClaimPenalty: '',
        distributorAddress: '',
        allocatorAddress: '',
        linkerAddress: '',
    };
}
export const MsgCreateAirdrop = {
    typeUrl: '/stride.airdrop.MsgCreateAirdrop',
    encode(message, writer = BinaryWriter.create()) {
        if (message.admin !== '') {
            writer.uint32(10).string(message.admin);
        }
        if (message.airdropId !== '') {
            writer.uint32(18).string(message.airdropId);
        }
        if (message.rewardDenom !== '') {
            writer.uint32(26).string(message.rewardDenom);
        }
        if (message.distributionStartDate !== undefined) {
            Timestamp.encode(message.distributionStartDate, writer.uint32(34).fork()).ldelim();
        }
        if (message.distributionEndDate !== undefined) {
            Timestamp.encode(message.distributionEndDate, writer.uint32(42).fork()).ldelim();
        }
        if (message.clawbackDate !== undefined) {
            Timestamp.encode(message.clawbackDate, writer.uint32(50).fork()).ldelim();
        }
        if (message.claimTypeDeadlineDate !== undefined) {
            Timestamp.encode(message.claimTypeDeadlineDate, writer.uint32(58).fork()).ldelim();
        }
        if (message.earlyClaimPenalty !== '') {
            writer
                .uint32(66)
                .string(Decimal.fromUserInput(message.earlyClaimPenalty, 18).atomics);
        }
        if (message.distributorAddress !== '') {
            writer.uint32(74).string(message.distributorAddress);
        }
        if (message.allocatorAddress !== '') {
            writer.uint32(82).string(message.allocatorAddress);
        }
        if (message.linkerAddress !== '') {
            writer.uint32(90).string(message.linkerAddress);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgCreateAirdrop();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.admin = reader.string();
                    break;
                case 2:
                    message.airdropId = reader.string();
                    break;
                case 3:
                    message.rewardDenom = reader.string();
                    break;
                case 4:
                    message.distributionStartDate = Timestamp.decode(reader, reader.uint32());
                    break;
                case 5:
                    message.distributionEndDate = Timestamp.decode(reader, reader.uint32());
                    break;
                case 6:
                    message.clawbackDate = Timestamp.decode(reader, reader.uint32());
                    break;
                case 7:
                    message.claimTypeDeadlineDate = Timestamp.decode(reader, reader.uint32());
                    break;
                case 8:
                    message.earlyClaimPenalty = Decimal.fromAtomics(reader.string(), 18).toString();
                    break;
                case 9:
                    message.distributorAddress = reader.string();
                    break;
                case 10:
                    message.allocatorAddress = reader.string();
                    break;
                case 11:
                    message.linkerAddress = reader.string();
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
            admin: isSet(object.admin) ? String(object.admin) : '',
            airdropId: isSet(object.airdropId) ? String(object.airdropId) : '',
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
        };
    },
    toJSON(message) {
        const obj = {};
        message.admin !== undefined && (obj.admin = message.admin);
        message.airdropId !== undefined && (obj.airdropId = message.airdropId);
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
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgCreateAirdrop();
        message.admin = object.admin ?? '';
        message.airdropId = object.airdropId ?? '';
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
        return message;
    },
    fromProtoMsg(message) {
        return MsgCreateAirdrop.decode(message.value);
    },
    toProto(message) {
        return MsgCreateAirdrop.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.airdrop.MsgCreateAirdrop',
            value: MsgCreateAirdrop.encode(message).finish(),
        };
    },
};
function createBaseMsgCreateAirdropResponse() {
    return {};
}
export const MsgCreateAirdropResponse = {
    typeUrl: '/stride.airdrop.MsgCreateAirdropResponse',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgCreateAirdropResponse();
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
        const message = createBaseMsgCreateAirdropResponse();
        return message;
    },
    fromProtoMsg(message) {
        return MsgCreateAirdropResponse.decode(message.value);
    },
    toProto(message) {
        return MsgCreateAirdropResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.airdrop.MsgCreateAirdropResponse',
            value: MsgCreateAirdropResponse.encode(message).finish(),
        };
    },
};
function createBaseMsgUpdateAirdrop() {
    return {
        admin: '',
        airdropId: '',
        rewardDenom: '',
        distributionStartDate: undefined,
        distributionEndDate: undefined,
        clawbackDate: undefined,
        claimTypeDeadlineDate: undefined,
        earlyClaimPenalty: '',
        distributorAddress: '',
        allocatorAddress: '',
        linkerAddress: '',
    };
}
export const MsgUpdateAirdrop = {
    typeUrl: '/stride.airdrop.MsgUpdateAirdrop',
    encode(message, writer = BinaryWriter.create()) {
        if (message.admin !== '') {
            writer.uint32(10).string(message.admin);
        }
        if (message.airdropId !== '') {
            writer.uint32(18).string(message.airdropId);
        }
        if (message.rewardDenom !== '') {
            writer.uint32(26).string(message.rewardDenom);
        }
        if (message.distributionStartDate !== undefined) {
            Timestamp.encode(message.distributionStartDate, writer.uint32(34).fork()).ldelim();
        }
        if (message.distributionEndDate !== undefined) {
            Timestamp.encode(message.distributionEndDate, writer.uint32(42).fork()).ldelim();
        }
        if (message.clawbackDate !== undefined) {
            Timestamp.encode(message.clawbackDate, writer.uint32(50).fork()).ldelim();
        }
        if (message.claimTypeDeadlineDate !== undefined) {
            Timestamp.encode(message.claimTypeDeadlineDate, writer.uint32(58).fork()).ldelim();
        }
        if (message.earlyClaimPenalty !== '') {
            writer
                .uint32(66)
                .string(Decimal.fromUserInput(message.earlyClaimPenalty, 18).atomics);
        }
        if (message.distributorAddress !== '') {
            writer.uint32(74).string(message.distributorAddress);
        }
        if (message.allocatorAddress !== '') {
            writer.uint32(82).string(message.allocatorAddress);
        }
        if (message.linkerAddress !== '') {
            writer.uint32(90).string(message.linkerAddress);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgUpdateAirdrop();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.admin = reader.string();
                    break;
                case 2:
                    message.airdropId = reader.string();
                    break;
                case 3:
                    message.rewardDenom = reader.string();
                    break;
                case 4:
                    message.distributionStartDate = Timestamp.decode(reader, reader.uint32());
                    break;
                case 5:
                    message.distributionEndDate = Timestamp.decode(reader, reader.uint32());
                    break;
                case 6:
                    message.clawbackDate = Timestamp.decode(reader, reader.uint32());
                    break;
                case 7:
                    message.claimTypeDeadlineDate = Timestamp.decode(reader, reader.uint32());
                    break;
                case 8:
                    message.earlyClaimPenalty = Decimal.fromAtomics(reader.string(), 18).toString();
                    break;
                case 9:
                    message.distributorAddress = reader.string();
                    break;
                case 10:
                    message.allocatorAddress = reader.string();
                    break;
                case 11:
                    message.linkerAddress = reader.string();
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
            admin: isSet(object.admin) ? String(object.admin) : '',
            airdropId: isSet(object.airdropId) ? String(object.airdropId) : '',
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
        };
    },
    toJSON(message) {
        const obj = {};
        message.admin !== undefined && (obj.admin = message.admin);
        message.airdropId !== undefined && (obj.airdropId = message.airdropId);
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
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgUpdateAirdrop();
        message.admin = object.admin ?? '';
        message.airdropId = object.airdropId ?? '';
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
        return message;
    },
    fromProtoMsg(message) {
        return MsgUpdateAirdrop.decode(message.value);
    },
    toProto(message) {
        return MsgUpdateAirdrop.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.airdrop.MsgUpdateAirdrop',
            value: MsgUpdateAirdrop.encode(message).finish(),
        };
    },
};
function createBaseMsgUpdateAirdropResponse() {
    return {};
}
export const MsgUpdateAirdropResponse = {
    typeUrl: '/stride.airdrop.MsgUpdateAirdropResponse',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgUpdateAirdropResponse();
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
        const message = createBaseMsgUpdateAirdropResponse();
        return message;
    },
    fromProtoMsg(message) {
        return MsgUpdateAirdropResponse.decode(message.value);
    },
    toProto(message) {
        return MsgUpdateAirdropResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.airdrop.MsgUpdateAirdropResponse',
            value: MsgUpdateAirdropResponse.encode(message).finish(),
        };
    },
};
function createBaseRawAllocation() {
    return {
        userAddress: '',
        allocations: [],
    };
}
export const RawAllocation = {
    typeUrl: '/stride.airdrop.RawAllocation',
    encode(message, writer = BinaryWriter.create()) {
        if (message.userAddress !== '') {
            writer.uint32(10).string(message.userAddress);
        }
        for (const v of message.allocations) {
            writer.uint32(34).string(v);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseRawAllocation();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.userAddress = reader.string();
                    break;
                case 4:
                    message.allocations.push(reader.string());
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
            userAddress: isSet(object.userAddress) ? String(object.userAddress) : '',
            allocations: Array.isArray(object?.allocations)
                ? object.allocations.map((e) => String(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        message.userAddress !== undefined &&
            (obj.userAddress = message.userAddress);
        if (message.allocations) {
            obj.allocations = message.allocations.map(e => e);
        }
        else {
            obj.allocations = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseRawAllocation();
        message.userAddress = object.userAddress ?? '';
        message.allocations = object.allocations?.map(e => e) || [];
        return message;
    },
    fromProtoMsg(message) {
        return RawAllocation.decode(message.value);
    },
    toProto(message) {
        return RawAllocation.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.airdrop.RawAllocation',
            value: RawAllocation.encode(message).finish(),
        };
    },
};
function createBaseMsgAddAllocations() {
    return {
        admin: '',
        airdropId: '',
        allocations: [],
    };
}
export const MsgAddAllocations = {
    typeUrl: '/stride.airdrop.MsgAddAllocations',
    encode(message, writer = BinaryWriter.create()) {
        if (message.admin !== '') {
            writer.uint32(10).string(message.admin);
        }
        if (message.airdropId !== '') {
            writer.uint32(18).string(message.airdropId);
        }
        for (const v of message.allocations) {
            RawAllocation.encode(v, writer.uint32(26).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgAddAllocations();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.admin = reader.string();
                    break;
                case 2:
                    message.airdropId = reader.string();
                    break;
                case 3:
                    message.allocations.push(RawAllocation.decode(reader, reader.uint32()));
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
            admin: isSet(object.admin) ? String(object.admin) : '',
            airdropId: isSet(object.airdropId) ? String(object.airdropId) : '',
            allocations: Array.isArray(object?.allocations)
                ? object.allocations.map((e) => RawAllocation.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        message.admin !== undefined && (obj.admin = message.admin);
        message.airdropId !== undefined && (obj.airdropId = message.airdropId);
        if (message.allocations) {
            obj.allocations = message.allocations.map(e => e ? RawAllocation.toJSON(e) : undefined);
        }
        else {
            obj.allocations = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgAddAllocations();
        message.admin = object.admin ?? '';
        message.airdropId = object.airdropId ?? '';
        message.allocations =
            object.allocations?.map(e => RawAllocation.fromPartial(e)) || [];
        return message;
    },
    fromProtoMsg(message) {
        return MsgAddAllocations.decode(message.value);
    },
    toProto(message) {
        return MsgAddAllocations.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.airdrop.MsgAddAllocations',
            value: MsgAddAllocations.encode(message).finish(),
        };
    },
};
function createBaseMsgAddAllocationsResponse() {
    return {};
}
export const MsgAddAllocationsResponse = {
    typeUrl: '/stride.airdrop.MsgAddAllocationsResponse',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgAddAllocationsResponse();
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
        const message = createBaseMsgAddAllocationsResponse();
        return message;
    },
    fromProtoMsg(message) {
        return MsgAddAllocationsResponse.decode(message.value);
    },
    toProto(message) {
        return MsgAddAllocationsResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.airdrop.MsgAddAllocationsResponse',
            value: MsgAddAllocationsResponse.encode(message).finish(),
        };
    },
};
function createBaseMsgUpdateUserAllocation() {
    return {
        admin: '',
        airdropId: '',
        userAddress: '',
        allocations: [],
    };
}
export const MsgUpdateUserAllocation = {
    typeUrl: '/stride.airdrop.MsgUpdateUserAllocation',
    encode(message, writer = BinaryWriter.create()) {
        if (message.admin !== '') {
            writer.uint32(10).string(message.admin);
        }
        if (message.airdropId !== '') {
            writer.uint32(18).string(message.airdropId);
        }
        if (message.userAddress !== '') {
            writer.uint32(26).string(message.userAddress);
        }
        for (const v of message.allocations) {
            writer.uint32(34).string(v);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgUpdateUserAllocation();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.admin = reader.string();
                    break;
                case 2:
                    message.airdropId = reader.string();
                    break;
                case 3:
                    message.userAddress = reader.string();
                    break;
                case 4:
                    message.allocations.push(reader.string());
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
            admin: isSet(object.admin) ? String(object.admin) : '',
            airdropId: isSet(object.airdropId) ? String(object.airdropId) : '',
            userAddress: isSet(object.userAddress) ? String(object.userAddress) : '',
            allocations: Array.isArray(object?.allocations)
                ? object.allocations.map((e) => String(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        message.admin !== undefined && (obj.admin = message.admin);
        message.airdropId !== undefined && (obj.airdropId = message.airdropId);
        message.userAddress !== undefined &&
            (obj.userAddress = message.userAddress);
        if (message.allocations) {
            obj.allocations = message.allocations.map(e => e);
        }
        else {
            obj.allocations = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgUpdateUserAllocation();
        message.admin = object.admin ?? '';
        message.airdropId = object.airdropId ?? '';
        message.userAddress = object.userAddress ?? '';
        message.allocations = object.allocations?.map(e => e) || [];
        return message;
    },
    fromProtoMsg(message) {
        return MsgUpdateUserAllocation.decode(message.value);
    },
    toProto(message) {
        return MsgUpdateUserAllocation.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.airdrop.MsgUpdateUserAllocation',
            value: MsgUpdateUserAllocation.encode(message).finish(),
        };
    },
};
function createBaseMsgUpdateUserAllocationResponse() {
    return {};
}
export const MsgUpdateUserAllocationResponse = {
    typeUrl: '/stride.airdrop.MsgUpdateUserAllocationResponse',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgUpdateUserAllocationResponse();
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
        const message = createBaseMsgUpdateUserAllocationResponse();
        return message;
    },
    fromProtoMsg(message) {
        return MsgUpdateUserAllocationResponse.decode(message.value);
    },
    toProto(message) {
        return MsgUpdateUserAllocationResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.airdrop.MsgUpdateUserAllocationResponse',
            value: MsgUpdateUserAllocationResponse.encode(message).finish(),
        };
    },
};
function createBaseMsgLinkAddresses() {
    return {
        admin: '',
        airdropId: '',
        strideAddress: '',
        hostAddress: '',
    };
}
export const MsgLinkAddresses = {
    typeUrl: '/stride.airdrop.MsgLinkAddresses',
    encode(message, writer = BinaryWriter.create()) {
        if (message.admin !== '') {
            writer.uint32(10).string(message.admin);
        }
        if (message.airdropId !== '') {
            writer.uint32(18).string(message.airdropId);
        }
        if (message.strideAddress !== '') {
            writer.uint32(26).string(message.strideAddress);
        }
        if (message.hostAddress !== '') {
            writer.uint32(34).string(message.hostAddress);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgLinkAddresses();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.admin = reader.string();
                    break;
                case 2:
                    message.airdropId = reader.string();
                    break;
                case 3:
                    message.strideAddress = reader.string();
                    break;
                case 4:
                    message.hostAddress = reader.string();
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
            admin: isSet(object.admin) ? String(object.admin) : '',
            airdropId: isSet(object.airdropId) ? String(object.airdropId) : '',
            strideAddress: isSet(object.strideAddress)
                ? String(object.strideAddress)
                : '',
            hostAddress: isSet(object.hostAddress) ? String(object.hostAddress) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.admin !== undefined && (obj.admin = message.admin);
        message.airdropId !== undefined && (obj.airdropId = message.airdropId);
        message.strideAddress !== undefined &&
            (obj.strideAddress = message.strideAddress);
        message.hostAddress !== undefined &&
            (obj.hostAddress = message.hostAddress);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgLinkAddresses();
        message.admin = object.admin ?? '';
        message.airdropId = object.airdropId ?? '';
        message.strideAddress = object.strideAddress ?? '';
        message.hostAddress = object.hostAddress ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return MsgLinkAddresses.decode(message.value);
    },
    toProto(message) {
        return MsgLinkAddresses.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.airdrop.MsgLinkAddresses',
            value: MsgLinkAddresses.encode(message).finish(),
        };
    },
};
function createBaseMsgLinkAddressesResponse() {
    return {};
}
export const MsgLinkAddressesResponse = {
    typeUrl: '/stride.airdrop.MsgLinkAddressesResponse',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgLinkAddressesResponse();
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
        const message = createBaseMsgLinkAddressesResponse();
        return message;
    },
    fromProtoMsg(message) {
        return MsgLinkAddressesResponse.decode(message.value);
    },
    toProto(message) {
        return MsgLinkAddressesResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.airdrop.MsgLinkAddressesResponse',
            value: MsgLinkAddressesResponse.encode(message).finish(),
        };
    },
};
//# sourceMappingURL=tx.js.map