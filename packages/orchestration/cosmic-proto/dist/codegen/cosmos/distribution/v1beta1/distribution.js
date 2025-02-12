//@ts-nocheck
import { DecCoin, Coin, } from '../../base/v1beta1/coin.js';
import { BinaryReader, BinaryWriter } from '../../../binary.js';
import { Decimal, isSet } from '../../../helpers.js';
import {} from '../../../json-safe.js';
function createBaseParams() {
    return {
        communityTax: '',
        baseProposerReward: '',
        bonusProposerReward: '',
        withdrawAddrEnabled: false,
    };
}
export const Params = {
    typeUrl: '/cosmos.distribution.v1beta1.Params',
    encode(message, writer = BinaryWriter.create()) {
        if (message.communityTax !== '') {
            writer
                .uint32(10)
                .string(Decimal.fromUserInput(message.communityTax, 18).atomics);
        }
        if (message.baseProposerReward !== '') {
            writer
                .uint32(18)
                .string(Decimal.fromUserInput(message.baseProposerReward, 18).atomics);
        }
        if (message.bonusProposerReward !== '') {
            writer
                .uint32(26)
                .string(Decimal.fromUserInput(message.bonusProposerReward, 18).atomics);
        }
        if (message.withdrawAddrEnabled === true) {
            writer.uint32(32).bool(message.withdrawAddrEnabled);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseParams();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.communityTax = Decimal.fromAtomics(reader.string(), 18).toString();
                    break;
                case 2:
                    message.baseProposerReward = Decimal.fromAtomics(reader.string(), 18).toString();
                    break;
                case 3:
                    message.bonusProposerReward = Decimal.fromAtomics(reader.string(), 18).toString();
                    break;
                case 4:
                    message.withdrawAddrEnabled = reader.bool();
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
            communityTax: isSet(object.communityTax)
                ? String(object.communityTax)
                : '',
            baseProposerReward: isSet(object.baseProposerReward)
                ? String(object.baseProposerReward)
                : '',
            bonusProposerReward: isSet(object.bonusProposerReward)
                ? String(object.bonusProposerReward)
                : '',
            withdrawAddrEnabled: isSet(object.withdrawAddrEnabled)
                ? Boolean(object.withdrawAddrEnabled)
                : false,
        };
    },
    toJSON(message) {
        const obj = {};
        message.communityTax !== undefined &&
            (obj.communityTax = message.communityTax);
        message.baseProposerReward !== undefined &&
            (obj.baseProposerReward = message.baseProposerReward);
        message.bonusProposerReward !== undefined &&
            (obj.bonusProposerReward = message.bonusProposerReward);
        message.withdrawAddrEnabled !== undefined &&
            (obj.withdrawAddrEnabled = message.withdrawAddrEnabled);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseParams();
        message.communityTax = object.communityTax ?? '';
        message.baseProposerReward = object.baseProposerReward ?? '';
        message.bonusProposerReward = object.bonusProposerReward ?? '';
        message.withdrawAddrEnabled = object.withdrawAddrEnabled ?? false;
        return message;
    },
    fromProtoMsg(message) {
        return Params.decode(message.value);
    },
    toProto(message) {
        return Params.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.distribution.v1beta1.Params',
            value: Params.encode(message).finish(),
        };
    },
};
function createBaseValidatorHistoricalRewards() {
    return {
        cumulativeRewardRatio: [],
        referenceCount: 0,
    };
}
export const ValidatorHistoricalRewards = {
    typeUrl: '/cosmos.distribution.v1beta1.ValidatorHistoricalRewards',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.cumulativeRewardRatio) {
            DecCoin.encode(v, writer.uint32(10).fork()).ldelim();
        }
        if (message.referenceCount !== 0) {
            writer.uint32(16).uint32(message.referenceCount);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseValidatorHistoricalRewards();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.cumulativeRewardRatio.push(DecCoin.decode(reader, reader.uint32()));
                    break;
                case 2:
                    message.referenceCount = reader.uint32();
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
            cumulativeRewardRatio: Array.isArray(object?.cumulativeRewardRatio)
                ? object.cumulativeRewardRatio.map((e) => DecCoin.fromJSON(e))
                : [],
            referenceCount: isSet(object.referenceCount)
                ? Number(object.referenceCount)
                : 0,
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.cumulativeRewardRatio) {
            obj.cumulativeRewardRatio = message.cumulativeRewardRatio.map(e => e ? DecCoin.toJSON(e) : undefined);
        }
        else {
            obj.cumulativeRewardRatio = [];
        }
        message.referenceCount !== undefined &&
            (obj.referenceCount = Math.round(message.referenceCount));
        return obj;
    },
    fromPartial(object) {
        const message = createBaseValidatorHistoricalRewards();
        message.cumulativeRewardRatio =
            object.cumulativeRewardRatio?.map(e => DecCoin.fromPartial(e)) || [];
        message.referenceCount = object.referenceCount ?? 0;
        return message;
    },
    fromProtoMsg(message) {
        return ValidatorHistoricalRewards.decode(message.value);
    },
    toProto(message) {
        return ValidatorHistoricalRewards.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.distribution.v1beta1.ValidatorHistoricalRewards',
            value: ValidatorHistoricalRewards.encode(message).finish(),
        };
    },
};
function createBaseValidatorCurrentRewards() {
    return {
        rewards: [],
        period: BigInt(0),
    };
}
export const ValidatorCurrentRewards = {
    typeUrl: '/cosmos.distribution.v1beta1.ValidatorCurrentRewards',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.rewards) {
            DecCoin.encode(v, writer.uint32(10).fork()).ldelim();
        }
        if (message.period !== BigInt(0)) {
            writer.uint32(16).uint64(message.period);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseValidatorCurrentRewards();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.rewards.push(DecCoin.decode(reader, reader.uint32()));
                    break;
                case 2:
                    message.period = reader.uint64();
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
            rewards: Array.isArray(object?.rewards)
                ? object.rewards.map((e) => DecCoin.fromJSON(e))
                : [],
            period: isSet(object.period)
                ? BigInt(object.period.toString())
                : BigInt(0),
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.rewards) {
            obj.rewards = message.rewards.map(e => e ? DecCoin.toJSON(e) : undefined);
        }
        else {
            obj.rewards = [];
        }
        message.period !== undefined &&
            (obj.period = (message.period || BigInt(0)).toString());
        return obj;
    },
    fromPartial(object) {
        const message = createBaseValidatorCurrentRewards();
        message.rewards = object.rewards?.map(e => DecCoin.fromPartial(e)) || [];
        message.period =
            object.period !== undefined && object.period !== null
                ? BigInt(object.period.toString())
                : BigInt(0);
        return message;
    },
    fromProtoMsg(message) {
        return ValidatorCurrentRewards.decode(message.value);
    },
    toProto(message) {
        return ValidatorCurrentRewards.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.distribution.v1beta1.ValidatorCurrentRewards',
            value: ValidatorCurrentRewards.encode(message).finish(),
        };
    },
};
function createBaseValidatorAccumulatedCommission() {
    return {
        commission: [],
    };
}
export const ValidatorAccumulatedCommission = {
    typeUrl: '/cosmos.distribution.v1beta1.ValidatorAccumulatedCommission',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.commission) {
            DecCoin.encode(v, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseValidatorAccumulatedCommission();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.commission.push(DecCoin.decode(reader, reader.uint32()));
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
            commission: Array.isArray(object?.commission)
                ? object.commission.map((e) => DecCoin.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.commission) {
            obj.commission = message.commission.map(e => e ? DecCoin.toJSON(e) : undefined);
        }
        else {
            obj.commission = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseValidatorAccumulatedCommission();
        message.commission =
            object.commission?.map(e => DecCoin.fromPartial(e)) || [];
        return message;
    },
    fromProtoMsg(message) {
        return ValidatorAccumulatedCommission.decode(message.value);
    },
    toProto(message) {
        return ValidatorAccumulatedCommission.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.distribution.v1beta1.ValidatorAccumulatedCommission',
            value: ValidatorAccumulatedCommission.encode(message).finish(),
        };
    },
};
function createBaseValidatorOutstandingRewards() {
    return {
        rewards: [],
    };
}
export const ValidatorOutstandingRewards = {
    typeUrl: '/cosmos.distribution.v1beta1.ValidatorOutstandingRewards',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.rewards) {
            DecCoin.encode(v, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseValidatorOutstandingRewards();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.rewards.push(DecCoin.decode(reader, reader.uint32()));
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
            rewards: Array.isArray(object?.rewards)
                ? object.rewards.map((e) => DecCoin.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.rewards) {
            obj.rewards = message.rewards.map(e => e ? DecCoin.toJSON(e) : undefined);
        }
        else {
            obj.rewards = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseValidatorOutstandingRewards();
        message.rewards = object.rewards?.map(e => DecCoin.fromPartial(e)) || [];
        return message;
    },
    fromProtoMsg(message) {
        return ValidatorOutstandingRewards.decode(message.value);
    },
    toProto(message) {
        return ValidatorOutstandingRewards.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.distribution.v1beta1.ValidatorOutstandingRewards',
            value: ValidatorOutstandingRewards.encode(message).finish(),
        };
    },
};
function createBaseValidatorSlashEvent() {
    return {
        validatorPeriod: BigInt(0),
        fraction: '',
    };
}
export const ValidatorSlashEvent = {
    typeUrl: '/cosmos.distribution.v1beta1.ValidatorSlashEvent',
    encode(message, writer = BinaryWriter.create()) {
        if (message.validatorPeriod !== BigInt(0)) {
            writer.uint32(8).uint64(message.validatorPeriod);
        }
        if (message.fraction !== '') {
            writer
                .uint32(18)
                .string(Decimal.fromUserInput(message.fraction, 18).atomics);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseValidatorSlashEvent();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.validatorPeriod = reader.uint64();
                    break;
                case 2:
                    message.fraction = Decimal.fromAtomics(reader.string(), 18).toString();
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
            validatorPeriod: isSet(object.validatorPeriod)
                ? BigInt(object.validatorPeriod.toString())
                : BigInt(0),
            fraction: isSet(object.fraction) ? String(object.fraction) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.validatorPeriod !== undefined &&
            (obj.validatorPeriod = (message.validatorPeriod || BigInt(0)).toString());
        message.fraction !== undefined && (obj.fraction = message.fraction);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseValidatorSlashEvent();
        message.validatorPeriod =
            object.validatorPeriod !== undefined && object.validatorPeriod !== null
                ? BigInt(object.validatorPeriod.toString())
                : BigInt(0);
        message.fraction = object.fraction ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return ValidatorSlashEvent.decode(message.value);
    },
    toProto(message) {
        return ValidatorSlashEvent.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.distribution.v1beta1.ValidatorSlashEvent',
            value: ValidatorSlashEvent.encode(message).finish(),
        };
    },
};
function createBaseValidatorSlashEvents() {
    return {
        validatorSlashEvents: [],
    };
}
export const ValidatorSlashEvents = {
    typeUrl: '/cosmos.distribution.v1beta1.ValidatorSlashEvents',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.validatorSlashEvents) {
            ValidatorSlashEvent.encode(v, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseValidatorSlashEvents();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.validatorSlashEvents.push(ValidatorSlashEvent.decode(reader, reader.uint32()));
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
            validatorSlashEvents: Array.isArray(object?.validatorSlashEvents)
                ? object.validatorSlashEvents.map((e) => ValidatorSlashEvent.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.validatorSlashEvents) {
            obj.validatorSlashEvents = message.validatorSlashEvents.map(e => e ? ValidatorSlashEvent.toJSON(e) : undefined);
        }
        else {
            obj.validatorSlashEvents = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseValidatorSlashEvents();
        message.validatorSlashEvents =
            object.validatorSlashEvents?.map(e => ValidatorSlashEvent.fromPartial(e)) || [];
        return message;
    },
    fromProtoMsg(message) {
        return ValidatorSlashEvents.decode(message.value);
    },
    toProto(message) {
        return ValidatorSlashEvents.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.distribution.v1beta1.ValidatorSlashEvents',
            value: ValidatorSlashEvents.encode(message).finish(),
        };
    },
};
function createBaseFeePool() {
    return {
        communityPool: [],
    };
}
export const FeePool = {
    typeUrl: '/cosmos.distribution.v1beta1.FeePool',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.communityPool) {
            DecCoin.encode(v, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseFeePool();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.communityPool.push(DecCoin.decode(reader, reader.uint32()));
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
            communityPool: Array.isArray(object?.communityPool)
                ? object.communityPool.map((e) => DecCoin.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.communityPool) {
            obj.communityPool = message.communityPool.map(e => e ? DecCoin.toJSON(e) : undefined);
        }
        else {
            obj.communityPool = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseFeePool();
        message.communityPool =
            object.communityPool?.map(e => DecCoin.fromPartial(e)) || [];
        return message;
    },
    fromProtoMsg(message) {
        return FeePool.decode(message.value);
    },
    toProto(message) {
        return FeePool.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.distribution.v1beta1.FeePool',
            value: FeePool.encode(message).finish(),
        };
    },
};
function createBaseCommunityPoolSpendProposal() {
    return {
        $typeUrl: '/cosmos.distribution.v1beta1.CommunityPoolSpendProposal',
        title: '',
        description: '',
        recipient: '',
        amount: [],
    };
}
export const CommunityPoolSpendProposal = {
    typeUrl: '/cosmos.distribution.v1beta1.CommunityPoolSpendProposal',
    encode(message, writer = BinaryWriter.create()) {
        if (message.title !== '') {
            writer.uint32(10).string(message.title);
        }
        if (message.description !== '') {
            writer.uint32(18).string(message.description);
        }
        if (message.recipient !== '') {
            writer.uint32(26).string(message.recipient);
        }
        for (const v of message.amount) {
            Coin.encode(v, writer.uint32(34).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseCommunityPoolSpendProposal();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.title = reader.string();
                    break;
                case 2:
                    message.description = reader.string();
                    break;
                case 3:
                    message.recipient = reader.string();
                    break;
                case 4:
                    message.amount.push(Coin.decode(reader, reader.uint32()));
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
            title: isSet(object.title) ? String(object.title) : '',
            description: isSet(object.description) ? String(object.description) : '',
            recipient: isSet(object.recipient) ? String(object.recipient) : '',
            amount: Array.isArray(object?.amount)
                ? object.amount.map((e) => Coin.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        message.title !== undefined && (obj.title = message.title);
        message.description !== undefined &&
            (obj.description = message.description);
        message.recipient !== undefined && (obj.recipient = message.recipient);
        if (message.amount) {
            obj.amount = message.amount.map(e => (e ? Coin.toJSON(e) : undefined));
        }
        else {
            obj.amount = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseCommunityPoolSpendProposal();
        message.title = object.title ?? '';
        message.description = object.description ?? '';
        message.recipient = object.recipient ?? '';
        message.amount = object.amount?.map(e => Coin.fromPartial(e)) || [];
        return message;
    },
    fromProtoMsg(message) {
        return CommunityPoolSpendProposal.decode(message.value);
    },
    toProto(message) {
        return CommunityPoolSpendProposal.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.distribution.v1beta1.CommunityPoolSpendProposal',
            value: CommunityPoolSpendProposal.encode(message).finish(),
        };
    },
};
function createBaseDelegatorStartingInfo() {
    return {
        previousPeriod: BigInt(0),
        stake: '',
        height: BigInt(0),
    };
}
export const DelegatorStartingInfo = {
    typeUrl: '/cosmos.distribution.v1beta1.DelegatorStartingInfo',
    encode(message, writer = BinaryWriter.create()) {
        if (message.previousPeriod !== BigInt(0)) {
            writer.uint32(8).uint64(message.previousPeriod);
        }
        if (message.stake !== '') {
            writer
                .uint32(18)
                .string(Decimal.fromUserInput(message.stake, 18).atomics);
        }
        if (message.height !== BigInt(0)) {
            writer.uint32(24).uint64(message.height);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseDelegatorStartingInfo();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.previousPeriod = reader.uint64();
                    break;
                case 2:
                    message.stake = Decimal.fromAtomics(reader.string(), 18).toString();
                    break;
                case 3:
                    message.height = reader.uint64();
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
            previousPeriod: isSet(object.previousPeriod)
                ? BigInt(object.previousPeriod.toString())
                : BigInt(0),
            stake: isSet(object.stake) ? String(object.stake) : '',
            height: isSet(object.height)
                ? BigInt(object.height.toString())
                : BigInt(0),
        };
    },
    toJSON(message) {
        const obj = {};
        message.previousPeriod !== undefined &&
            (obj.previousPeriod = (message.previousPeriod || BigInt(0)).toString());
        message.stake !== undefined && (obj.stake = message.stake);
        message.height !== undefined &&
            (obj.height = (message.height || BigInt(0)).toString());
        return obj;
    },
    fromPartial(object) {
        const message = createBaseDelegatorStartingInfo();
        message.previousPeriod =
            object.previousPeriod !== undefined && object.previousPeriod !== null
                ? BigInt(object.previousPeriod.toString())
                : BigInt(0);
        message.stake = object.stake ?? '';
        message.height =
            object.height !== undefined && object.height !== null
                ? BigInt(object.height.toString())
                : BigInt(0);
        return message;
    },
    fromProtoMsg(message) {
        return DelegatorStartingInfo.decode(message.value);
    },
    toProto(message) {
        return DelegatorStartingInfo.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.distribution.v1beta1.DelegatorStartingInfo',
            value: DelegatorStartingInfo.encode(message).finish(),
        };
    },
};
function createBaseDelegationDelegatorReward() {
    return {
        validatorAddress: '',
        reward: [],
    };
}
export const DelegationDelegatorReward = {
    typeUrl: '/cosmos.distribution.v1beta1.DelegationDelegatorReward',
    encode(message, writer = BinaryWriter.create()) {
        if (message.validatorAddress !== '') {
            writer.uint32(10).string(message.validatorAddress);
        }
        for (const v of message.reward) {
            DecCoin.encode(v, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseDelegationDelegatorReward();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.validatorAddress = reader.string();
                    break;
                case 2:
                    message.reward.push(DecCoin.decode(reader, reader.uint32()));
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
            reward: Array.isArray(object?.reward)
                ? object.reward.map((e) => DecCoin.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        message.validatorAddress !== undefined &&
            (obj.validatorAddress = message.validatorAddress);
        if (message.reward) {
            obj.reward = message.reward.map(e => (e ? DecCoin.toJSON(e) : undefined));
        }
        else {
            obj.reward = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseDelegationDelegatorReward();
        message.validatorAddress = object.validatorAddress ?? '';
        message.reward = object.reward?.map(e => DecCoin.fromPartial(e)) || [];
        return message;
    },
    fromProtoMsg(message) {
        return DelegationDelegatorReward.decode(message.value);
    },
    toProto(message) {
        return DelegationDelegatorReward.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.distribution.v1beta1.DelegationDelegatorReward',
            value: DelegationDelegatorReward.encode(message).finish(),
        };
    },
};
function createBaseCommunityPoolSpendProposalWithDeposit() {
    return {
        $typeUrl: '/cosmos.distribution.v1beta1.CommunityPoolSpendProposalWithDeposit',
        title: '',
        description: '',
        recipient: '',
        amount: '',
        deposit: '',
    };
}
export const CommunityPoolSpendProposalWithDeposit = {
    typeUrl: '/cosmos.distribution.v1beta1.CommunityPoolSpendProposalWithDeposit',
    encode(message, writer = BinaryWriter.create()) {
        if (message.title !== '') {
            writer.uint32(10).string(message.title);
        }
        if (message.description !== '') {
            writer.uint32(18).string(message.description);
        }
        if (message.recipient !== '') {
            writer.uint32(26).string(message.recipient);
        }
        if (message.amount !== '') {
            writer.uint32(34).string(message.amount);
        }
        if (message.deposit !== '') {
            writer.uint32(42).string(message.deposit);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseCommunityPoolSpendProposalWithDeposit();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.title = reader.string();
                    break;
                case 2:
                    message.description = reader.string();
                    break;
                case 3:
                    message.recipient = reader.string();
                    break;
                case 4:
                    message.amount = reader.string();
                    break;
                case 5:
                    message.deposit = reader.string();
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
            title: isSet(object.title) ? String(object.title) : '',
            description: isSet(object.description) ? String(object.description) : '',
            recipient: isSet(object.recipient) ? String(object.recipient) : '',
            amount: isSet(object.amount) ? String(object.amount) : '',
            deposit: isSet(object.deposit) ? String(object.deposit) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.title !== undefined && (obj.title = message.title);
        message.description !== undefined &&
            (obj.description = message.description);
        message.recipient !== undefined && (obj.recipient = message.recipient);
        message.amount !== undefined && (obj.amount = message.amount);
        message.deposit !== undefined && (obj.deposit = message.deposit);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseCommunityPoolSpendProposalWithDeposit();
        message.title = object.title ?? '';
        message.description = object.description ?? '';
        message.recipient = object.recipient ?? '';
        message.amount = object.amount ?? '';
        message.deposit = object.deposit ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return CommunityPoolSpendProposalWithDeposit.decode(message.value);
    },
    toProto(message) {
        return CommunityPoolSpendProposalWithDeposit.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.distribution.v1beta1.CommunityPoolSpendProposalWithDeposit',
            value: CommunityPoolSpendProposalWithDeposit.encode(message).finish(),
        };
    },
};
//# sourceMappingURL=distribution.js.map