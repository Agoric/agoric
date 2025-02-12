//@ts-nocheck
import { DecCoin } from '../../base/v1beta1/coin.js';
import { ValidatorAccumulatedCommission, ValidatorHistoricalRewards, ValidatorCurrentRewards, DelegatorStartingInfo, ValidatorSlashEvent, Params, FeePool, } from './distribution.js';
import { BinaryReader, BinaryWriter } from '../../../binary.js';
import { isSet } from '../../../helpers.js';
import {} from '../../../json-safe.js';
function createBaseDelegatorWithdrawInfo() {
    return {
        delegatorAddress: '',
        withdrawAddress: '',
    };
}
export const DelegatorWithdrawInfo = {
    typeUrl: '/cosmos.distribution.v1beta1.DelegatorWithdrawInfo',
    encode(message, writer = BinaryWriter.create()) {
        if (message.delegatorAddress !== '') {
            writer.uint32(10).string(message.delegatorAddress);
        }
        if (message.withdrawAddress !== '') {
            writer.uint32(18).string(message.withdrawAddress);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseDelegatorWithdrawInfo();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.delegatorAddress = reader.string();
                    break;
                case 2:
                    message.withdrawAddress = reader.string();
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
            delegatorAddress: isSet(object.delegatorAddress)
                ? String(object.delegatorAddress)
                : '',
            withdrawAddress: isSet(object.withdrawAddress)
                ? String(object.withdrawAddress)
                : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.delegatorAddress !== undefined &&
            (obj.delegatorAddress = message.delegatorAddress);
        message.withdrawAddress !== undefined &&
            (obj.withdrawAddress = message.withdrawAddress);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseDelegatorWithdrawInfo();
        message.delegatorAddress = object.delegatorAddress ?? '';
        message.withdrawAddress = object.withdrawAddress ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return DelegatorWithdrawInfo.decode(message.value);
    },
    toProto(message) {
        return DelegatorWithdrawInfo.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.distribution.v1beta1.DelegatorWithdrawInfo',
            value: DelegatorWithdrawInfo.encode(message).finish(),
        };
    },
};
function createBaseValidatorOutstandingRewardsRecord() {
    return {
        validatorAddress: '',
        outstandingRewards: [],
    };
}
export const ValidatorOutstandingRewardsRecord = {
    typeUrl: '/cosmos.distribution.v1beta1.ValidatorOutstandingRewardsRecord',
    encode(message, writer = BinaryWriter.create()) {
        if (message.validatorAddress !== '') {
            writer.uint32(10).string(message.validatorAddress);
        }
        for (const v of message.outstandingRewards) {
            DecCoin.encode(v, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseValidatorOutstandingRewardsRecord();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.validatorAddress = reader.string();
                    break;
                case 2:
                    message.outstandingRewards.push(DecCoin.decode(reader, reader.uint32()));
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
            validatorAddress: isSet(object.validatorAddress)
                ? String(object.validatorAddress)
                : '',
            outstandingRewards: Array.isArray(object?.outstandingRewards)
                ? object.outstandingRewards.map((e) => DecCoin.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        message.validatorAddress !== undefined &&
            (obj.validatorAddress = message.validatorAddress);
        if (message.outstandingRewards) {
            obj.outstandingRewards = message.outstandingRewards.map(e => e ? DecCoin.toJSON(e) : undefined);
        }
        else {
            obj.outstandingRewards = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseValidatorOutstandingRewardsRecord();
        message.validatorAddress = object.validatorAddress ?? '';
        message.outstandingRewards =
            object.outstandingRewards?.map(e => DecCoin.fromPartial(e)) || [];
        return message;
    },
    fromProtoMsg(message) {
        return ValidatorOutstandingRewardsRecord.decode(message.value);
    },
    toProto(message) {
        return ValidatorOutstandingRewardsRecord.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.distribution.v1beta1.ValidatorOutstandingRewardsRecord',
            value: ValidatorOutstandingRewardsRecord.encode(message).finish(),
        };
    },
};
function createBaseValidatorAccumulatedCommissionRecord() {
    return {
        validatorAddress: '',
        accumulated: ValidatorAccumulatedCommission.fromPartial({}),
    };
}
export const ValidatorAccumulatedCommissionRecord = {
    typeUrl: '/cosmos.distribution.v1beta1.ValidatorAccumulatedCommissionRecord',
    encode(message, writer = BinaryWriter.create()) {
        if (message.validatorAddress !== '') {
            writer.uint32(10).string(message.validatorAddress);
        }
        if (message.accumulated !== undefined) {
            ValidatorAccumulatedCommission.encode(message.accumulated, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseValidatorAccumulatedCommissionRecord();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.validatorAddress = reader.string();
                    break;
                case 2:
                    message.accumulated = ValidatorAccumulatedCommission.decode(reader, reader.uint32());
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
            validatorAddress: isSet(object.validatorAddress)
                ? String(object.validatorAddress)
                : '',
            accumulated: isSet(object.accumulated)
                ? ValidatorAccumulatedCommission.fromJSON(object.accumulated)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.validatorAddress !== undefined &&
            (obj.validatorAddress = message.validatorAddress);
        message.accumulated !== undefined &&
            (obj.accumulated = message.accumulated
                ? ValidatorAccumulatedCommission.toJSON(message.accumulated)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseValidatorAccumulatedCommissionRecord();
        message.validatorAddress = object.validatorAddress ?? '';
        message.accumulated =
            object.accumulated !== undefined && object.accumulated !== null
                ? ValidatorAccumulatedCommission.fromPartial(object.accumulated)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return ValidatorAccumulatedCommissionRecord.decode(message.value);
    },
    toProto(message) {
        return ValidatorAccumulatedCommissionRecord.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.distribution.v1beta1.ValidatorAccumulatedCommissionRecord',
            value: ValidatorAccumulatedCommissionRecord.encode(message).finish(),
        };
    },
};
function createBaseValidatorHistoricalRewardsRecord() {
    return {
        validatorAddress: '',
        period: BigInt(0),
        rewards: ValidatorHistoricalRewards.fromPartial({}),
    };
}
export const ValidatorHistoricalRewardsRecord = {
    typeUrl: '/cosmos.distribution.v1beta1.ValidatorHistoricalRewardsRecord',
    encode(message, writer = BinaryWriter.create()) {
        if (message.validatorAddress !== '') {
            writer.uint32(10).string(message.validatorAddress);
        }
        if (message.period !== BigInt(0)) {
            writer.uint32(16).uint64(message.period);
        }
        if (message.rewards !== undefined) {
            ValidatorHistoricalRewards.encode(message.rewards, writer.uint32(26).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseValidatorHistoricalRewardsRecord();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.validatorAddress = reader.string();
                    break;
                case 2:
                    message.period = reader.uint64();
                    break;
                case 3:
                    message.rewards = ValidatorHistoricalRewards.decode(reader, reader.uint32());
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
            validatorAddress: isSet(object.validatorAddress)
                ? String(object.validatorAddress)
                : '',
            period: isSet(object.period)
                ? BigInt(object.period.toString())
                : BigInt(0),
            rewards: isSet(object.rewards)
                ? ValidatorHistoricalRewards.fromJSON(object.rewards)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.validatorAddress !== undefined &&
            (obj.validatorAddress = message.validatorAddress);
        message.period !== undefined &&
            (obj.period = (message.period || BigInt(0)).toString());
        message.rewards !== undefined &&
            (obj.rewards = message.rewards
                ? ValidatorHistoricalRewards.toJSON(message.rewards)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseValidatorHistoricalRewardsRecord();
        message.validatorAddress = object.validatorAddress ?? '';
        message.period =
            object.period !== undefined && object.period !== null
                ? BigInt(object.period.toString())
                : BigInt(0);
        message.rewards =
            object.rewards !== undefined && object.rewards !== null
                ? ValidatorHistoricalRewards.fromPartial(object.rewards)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return ValidatorHistoricalRewardsRecord.decode(message.value);
    },
    toProto(message) {
        return ValidatorHistoricalRewardsRecord.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.distribution.v1beta1.ValidatorHistoricalRewardsRecord',
            value: ValidatorHistoricalRewardsRecord.encode(message).finish(),
        };
    },
};
function createBaseValidatorCurrentRewardsRecord() {
    return {
        validatorAddress: '',
        rewards: ValidatorCurrentRewards.fromPartial({}),
    };
}
export const ValidatorCurrentRewardsRecord = {
    typeUrl: '/cosmos.distribution.v1beta1.ValidatorCurrentRewardsRecord',
    encode(message, writer = BinaryWriter.create()) {
        if (message.validatorAddress !== '') {
            writer.uint32(10).string(message.validatorAddress);
        }
        if (message.rewards !== undefined) {
            ValidatorCurrentRewards.encode(message.rewards, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseValidatorCurrentRewardsRecord();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.validatorAddress = reader.string();
                    break;
                case 2:
                    message.rewards = ValidatorCurrentRewards.decode(reader, reader.uint32());
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
            validatorAddress: isSet(object.validatorAddress)
                ? String(object.validatorAddress)
                : '',
            rewards: isSet(object.rewards)
                ? ValidatorCurrentRewards.fromJSON(object.rewards)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.validatorAddress !== undefined &&
            (obj.validatorAddress = message.validatorAddress);
        message.rewards !== undefined &&
            (obj.rewards = message.rewards
                ? ValidatorCurrentRewards.toJSON(message.rewards)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseValidatorCurrentRewardsRecord();
        message.validatorAddress = object.validatorAddress ?? '';
        message.rewards =
            object.rewards !== undefined && object.rewards !== null
                ? ValidatorCurrentRewards.fromPartial(object.rewards)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return ValidatorCurrentRewardsRecord.decode(message.value);
    },
    toProto(message) {
        return ValidatorCurrentRewardsRecord.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.distribution.v1beta1.ValidatorCurrentRewardsRecord',
            value: ValidatorCurrentRewardsRecord.encode(message).finish(),
        };
    },
};
function createBaseDelegatorStartingInfoRecord() {
    return {
        delegatorAddress: '',
        validatorAddress: '',
        startingInfo: DelegatorStartingInfo.fromPartial({}),
    };
}
export const DelegatorStartingInfoRecord = {
    typeUrl: '/cosmos.distribution.v1beta1.DelegatorStartingInfoRecord',
    encode(message, writer = BinaryWriter.create()) {
        if (message.delegatorAddress !== '') {
            writer.uint32(10).string(message.delegatorAddress);
        }
        if (message.validatorAddress !== '') {
            writer.uint32(18).string(message.validatorAddress);
        }
        if (message.startingInfo !== undefined) {
            DelegatorStartingInfo.encode(message.startingInfo, writer.uint32(26).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseDelegatorStartingInfoRecord();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.delegatorAddress = reader.string();
                    break;
                case 2:
                    message.validatorAddress = reader.string();
                    break;
                case 3:
                    message.startingInfo = DelegatorStartingInfo.decode(reader, reader.uint32());
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
            delegatorAddress: isSet(object.delegatorAddress)
                ? String(object.delegatorAddress)
                : '',
            validatorAddress: isSet(object.validatorAddress)
                ? String(object.validatorAddress)
                : '',
            startingInfo: isSet(object.startingInfo)
                ? DelegatorStartingInfo.fromJSON(object.startingInfo)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.delegatorAddress !== undefined &&
            (obj.delegatorAddress = message.delegatorAddress);
        message.validatorAddress !== undefined &&
            (obj.validatorAddress = message.validatorAddress);
        message.startingInfo !== undefined &&
            (obj.startingInfo = message.startingInfo
                ? DelegatorStartingInfo.toJSON(message.startingInfo)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseDelegatorStartingInfoRecord();
        message.delegatorAddress = object.delegatorAddress ?? '';
        message.validatorAddress = object.validatorAddress ?? '';
        message.startingInfo =
            object.startingInfo !== undefined && object.startingInfo !== null
                ? DelegatorStartingInfo.fromPartial(object.startingInfo)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return DelegatorStartingInfoRecord.decode(message.value);
    },
    toProto(message) {
        return DelegatorStartingInfoRecord.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.distribution.v1beta1.DelegatorStartingInfoRecord',
            value: DelegatorStartingInfoRecord.encode(message).finish(),
        };
    },
};
function createBaseValidatorSlashEventRecord() {
    return {
        validatorAddress: '',
        height: BigInt(0),
        period: BigInt(0),
        validatorSlashEvent: ValidatorSlashEvent.fromPartial({}),
    };
}
export const ValidatorSlashEventRecord = {
    typeUrl: '/cosmos.distribution.v1beta1.ValidatorSlashEventRecord',
    encode(message, writer = BinaryWriter.create()) {
        if (message.validatorAddress !== '') {
            writer.uint32(10).string(message.validatorAddress);
        }
        if (message.height !== BigInt(0)) {
            writer.uint32(16).uint64(message.height);
        }
        if (message.period !== BigInt(0)) {
            writer.uint32(24).uint64(message.period);
        }
        if (message.validatorSlashEvent !== undefined) {
            ValidatorSlashEvent.encode(message.validatorSlashEvent, writer.uint32(34).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseValidatorSlashEventRecord();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.validatorAddress = reader.string();
                    break;
                case 2:
                    message.height = reader.uint64();
                    break;
                case 3:
                    message.period = reader.uint64();
                    break;
                case 4:
                    message.validatorSlashEvent = ValidatorSlashEvent.decode(reader, reader.uint32());
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
            validatorAddress: isSet(object.validatorAddress)
                ? String(object.validatorAddress)
                : '',
            height: isSet(object.height)
                ? BigInt(object.height.toString())
                : BigInt(0),
            period: isSet(object.period)
                ? BigInt(object.period.toString())
                : BigInt(0),
            validatorSlashEvent: isSet(object.validatorSlashEvent)
                ? ValidatorSlashEvent.fromJSON(object.validatorSlashEvent)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.validatorAddress !== undefined &&
            (obj.validatorAddress = message.validatorAddress);
        message.height !== undefined &&
            (obj.height = (message.height || BigInt(0)).toString());
        message.period !== undefined &&
            (obj.period = (message.period || BigInt(0)).toString());
        message.validatorSlashEvent !== undefined &&
            (obj.validatorSlashEvent = message.validatorSlashEvent
                ? ValidatorSlashEvent.toJSON(message.validatorSlashEvent)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseValidatorSlashEventRecord();
        message.validatorAddress = object.validatorAddress ?? '';
        message.height =
            object.height !== undefined && object.height !== null
                ? BigInt(object.height.toString())
                : BigInt(0);
        message.period =
            object.period !== undefined && object.period !== null
                ? BigInt(object.period.toString())
                : BigInt(0);
        message.validatorSlashEvent =
            object.validatorSlashEvent !== undefined &&
                object.validatorSlashEvent !== null
                ? ValidatorSlashEvent.fromPartial(object.validatorSlashEvent)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return ValidatorSlashEventRecord.decode(message.value);
    },
    toProto(message) {
        return ValidatorSlashEventRecord.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.distribution.v1beta1.ValidatorSlashEventRecord',
            value: ValidatorSlashEventRecord.encode(message).finish(),
        };
    },
};
function createBaseGenesisState() {
    return {
        params: Params.fromPartial({}),
        feePool: FeePool.fromPartial({}),
        delegatorWithdrawInfos: [],
        previousProposer: '',
        outstandingRewards: [],
        validatorAccumulatedCommissions: [],
        validatorHistoricalRewards: [],
        validatorCurrentRewards: [],
        delegatorStartingInfos: [],
        validatorSlashEvents: [],
    };
}
export const GenesisState = {
    typeUrl: '/cosmos.distribution.v1beta1.GenesisState',
    encode(message, writer = BinaryWriter.create()) {
        if (message.params !== undefined) {
            Params.encode(message.params, writer.uint32(10).fork()).ldelim();
        }
        if (message.feePool !== undefined) {
            FeePool.encode(message.feePool, writer.uint32(18).fork()).ldelim();
        }
        for (const v of message.delegatorWithdrawInfos) {
            DelegatorWithdrawInfo.encode(v, writer.uint32(26).fork()).ldelim();
        }
        if (message.previousProposer !== '') {
            writer.uint32(34).string(message.previousProposer);
        }
        for (const v of message.outstandingRewards) {
            ValidatorOutstandingRewardsRecord.encode(v, writer.uint32(42).fork()).ldelim();
        }
        for (const v of message.validatorAccumulatedCommissions) {
            ValidatorAccumulatedCommissionRecord.encode(v, writer.uint32(50).fork()).ldelim();
        }
        for (const v of message.validatorHistoricalRewards) {
            ValidatorHistoricalRewardsRecord.encode(v, writer.uint32(58).fork()).ldelim();
        }
        for (const v of message.validatorCurrentRewards) {
            ValidatorCurrentRewardsRecord.encode(v, writer.uint32(66).fork()).ldelim();
        }
        for (const v of message.delegatorStartingInfos) {
            DelegatorStartingInfoRecord.encode(v, writer.uint32(74).fork()).ldelim();
        }
        for (const v of message.validatorSlashEvents) {
            ValidatorSlashEventRecord.encode(v, writer.uint32(82).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseGenesisState();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.params = Params.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.feePool = FeePool.decode(reader, reader.uint32());
                    break;
                case 3:
                    message.delegatorWithdrawInfos.push(DelegatorWithdrawInfo.decode(reader, reader.uint32()));
                    break;
                case 4:
                    message.previousProposer = reader.string();
                    break;
                case 5:
                    message.outstandingRewards.push(ValidatorOutstandingRewardsRecord.decode(reader, reader.uint32()));
                    break;
                case 6:
                    message.validatorAccumulatedCommissions.push(ValidatorAccumulatedCommissionRecord.decode(reader, reader.uint32()));
                    break;
                case 7:
                    message.validatorHistoricalRewards.push(ValidatorHistoricalRewardsRecord.decode(reader, reader.uint32()));
                    break;
                case 8:
                    message.validatorCurrentRewards.push(ValidatorCurrentRewardsRecord.decode(reader, reader.uint32()));
                    break;
                case 9:
                    message.delegatorStartingInfos.push(DelegatorStartingInfoRecord.decode(reader, reader.uint32()));
                    break;
                case 10:
                    message.validatorSlashEvents.push(ValidatorSlashEventRecord.decode(reader, reader.uint32()));
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
            feePool: isSet(object.feePool)
                ? FeePool.fromJSON(object.feePool)
                : undefined,
            delegatorWithdrawInfos: Array.isArray(object?.delegatorWithdrawInfos)
                ? object.delegatorWithdrawInfos.map((e) => DelegatorWithdrawInfo.fromJSON(e))
                : [],
            previousProposer: isSet(object.previousProposer)
                ? String(object.previousProposer)
                : '',
            outstandingRewards: Array.isArray(object?.outstandingRewards)
                ? object.outstandingRewards.map((e) => ValidatorOutstandingRewardsRecord.fromJSON(e))
                : [],
            validatorAccumulatedCommissions: Array.isArray(object?.validatorAccumulatedCommissions)
                ? object.validatorAccumulatedCommissions.map((e) => ValidatorAccumulatedCommissionRecord.fromJSON(e))
                : [],
            validatorHistoricalRewards: Array.isArray(object?.validatorHistoricalRewards)
                ? object.validatorHistoricalRewards.map((e) => ValidatorHistoricalRewardsRecord.fromJSON(e))
                : [],
            validatorCurrentRewards: Array.isArray(object?.validatorCurrentRewards)
                ? object.validatorCurrentRewards.map((e) => ValidatorCurrentRewardsRecord.fromJSON(e))
                : [],
            delegatorStartingInfos: Array.isArray(object?.delegatorStartingInfos)
                ? object.delegatorStartingInfos.map((e) => DelegatorStartingInfoRecord.fromJSON(e))
                : [],
            validatorSlashEvents: Array.isArray(object?.validatorSlashEvents)
                ? object.validatorSlashEvents.map((e) => ValidatorSlashEventRecord.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        message.params !== undefined &&
            (obj.params = message.params ? Params.toJSON(message.params) : undefined);
        message.feePool !== undefined &&
            (obj.feePool = message.feePool
                ? FeePool.toJSON(message.feePool)
                : undefined);
        if (message.delegatorWithdrawInfos) {
            obj.delegatorWithdrawInfos = message.delegatorWithdrawInfos.map(e => e ? DelegatorWithdrawInfo.toJSON(e) : undefined);
        }
        else {
            obj.delegatorWithdrawInfos = [];
        }
        message.previousProposer !== undefined &&
            (obj.previousProposer = message.previousProposer);
        if (message.outstandingRewards) {
            obj.outstandingRewards = message.outstandingRewards.map(e => e ? ValidatorOutstandingRewardsRecord.toJSON(e) : undefined);
        }
        else {
            obj.outstandingRewards = [];
        }
        if (message.validatorAccumulatedCommissions) {
            obj.validatorAccumulatedCommissions =
                message.validatorAccumulatedCommissions.map(e => e ? ValidatorAccumulatedCommissionRecord.toJSON(e) : undefined);
        }
        else {
            obj.validatorAccumulatedCommissions = [];
        }
        if (message.validatorHistoricalRewards) {
            obj.validatorHistoricalRewards = message.validatorHistoricalRewards.map(e => (e ? ValidatorHistoricalRewardsRecord.toJSON(e) : undefined));
        }
        else {
            obj.validatorHistoricalRewards = [];
        }
        if (message.validatorCurrentRewards) {
            obj.validatorCurrentRewards = message.validatorCurrentRewards.map(e => e ? ValidatorCurrentRewardsRecord.toJSON(e) : undefined);
        }
        else {
            obj.validatorCurrentRewards = [];
        }
        if (message.delegatorStartingInfos) {
            obj.delegatorStartingInfos = message.delegatorStartingInfos.map(e => e ? DelegatorStartingInfoRecord.toJSON(e) : undefined);
        }
        else {
            obj.delegatorStartingInfos = [];
        }
        if (message.validatorSlashEvents) {
            obj.validatorSlashEvents = message.validatorSlashEvents.map(e => e ? ValidatorSlashEventRecord.toJSON(e) : undefined);
        }
        else {
            obj.validatorSlashEvents = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseGenesisState();
        message.params =
            object.params !== undefined && object.params !== null
                ? Params.fromPartial(object.params)
                : undefined;
        message.feePool =
            object.feePool !== undefined && object.feePool !== null
                ? FeePool.fromPartial(object.feePool)
                : undefined;
        message.delegatorWithdrawInfos =
            object.delegatorWithdrawInfos?.map(e => DelegatorWithdrawInfo.fromPartial(e)) || [];
        message.previousProposer = object.previousProposer ?? '';
        message.outstandingRewards =
            object.outstandingRewards?.map(e => ValidatorOutstandingRewardsRecord.fromPartial(e)) || [];
        message.validatorAccumulatedCommissions =
            object.validatorAccumulatedCommissions?.map(e => ValidatorAccumulatedCommissionRecord.fromPartial(e)) || [];
        message.validatorHistoricalRewards =
            object.validatorHistoricalRewards?.map(e => ValidatorHistoricalRewardsRecord.fromPartial(e)) || [];
        message.validatorCurrentRewards =
            object.validatorCurrentRewards?.map(e => ValidatorCurrentRewardsRecord.fromPartial(e)) || [];
        message.delegatorStartingInfos =
            object.delegatorStartingInfos?.map(e => DelegatorStartingInfoRecord.fromPartial(e)) || [];
        message.validatorSlashEvents =
            object.validatorSlashEvents?.map(e => ValidatorSlashEventRecord.fromPartial(e)) || [];
        return message;
    },
    fromProtoMsg(message) {
        return GenesisState.decode(message.value);
    },
    toProto(message) {
        return GenesisState.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.distribution.v1beta1.GenesisState',
            value: GenesisState.encode(message).finish(),
        };
    },
};
//# sourceMappingURL=genesis.js.map