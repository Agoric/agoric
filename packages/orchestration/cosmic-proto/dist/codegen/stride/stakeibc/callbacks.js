//@ts-nocheck
import { Coin } from '../../cosmos/base/v1beta1/coin.js';
import { LSMTokenDeposit, } from '../records/records.js';
import { HostZone } from './host_zone.js';
import { Validator } from './validator.js';
import { ICAAccountType, iCAAccountTypeFromJSON, iCAAccountTypeToJSON, } from './ica_account.js';
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { isSet } from '../../helpers.js';
import {} from '../../json-safe.js';
function createBaseSplitDelegation() {
    return {
        validator: '',
        amount: '',
    };
}
export const SplitDelegation = {
    typeUrl: '/stride.stakeibc.SplitDelegation',
    encode(message, writer = BinaryWriter.create()) {
        if (message.validator !== '') {
            writer.uint32(10).string(message.validator);
        }
        if (message.amount !== '') {
            writer.uint32(18).string(message.amount);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseSplitDelegation();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.validator = reader.string();
                    break;
                case 2:
                    message.amount = reader.string();
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
            validator: isSet(object.validator) ? String(object.validator) : '',
            amount: isSet(object.amount) ? String(object.amount) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.validator !== undefined && (obj.validator = message.validator);
        message.amount !== undefined && (obj.amount = message.amount);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseSplitDelegation();
        message.validator = object.validator ?? '';
        message.amount = object.amount ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return SplitDelegation.decode(message.value);
    },
    toProto(message) {
        return SplitDelegation.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakeibc.SplitDelegation',
            value: SplitDelegation.encode(message).finish(),
        };
    },
};
function createBaseSplitUndelegation() {
    return {
        validator: '',
        nativeTokenAmount: '',
    };
}
export const SplitUndelegation = {
    typeUrl: '/stride.stakeibc.SplitUndelegation',
    encode(message, writer = BinaryWriter.create()) {
        if (message.validator !== '') {
            writer.uint32(10).string(message.validator);
        }
        if (message.nativeTokenAmount !== '') {
            writer.uint32(18).string(message.nativeTokenAmount);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseSplitUndelegation();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.validator = reader.string();
                    break;
                case 2:
                    message.nativeTokenAmount = reader.string();
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
            validator: isSet(object.validator) ? String(object.validator) : '',
            nativeTokenAmount: isSet(object.nativeTokenAmount)
                ? String(object.nativeTokenAmount)
                : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.validator !== undefined && (obj.validator = message.validator);
        message.nativeTokenAmount !== undefined &&
            (obj.nativeTokenAmount = message.nativeTokenAmount);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseSplitUndelegation();
        message.validator = object.validator ?? '';
        message.nativeTokenAmount = object.nativeTokenAmount ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return SplitUndelegation.decode(message.value);
    },
    toProto(message) {
        return SplitUndelegation.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakeibc.SplitUndelegation',
            value: SplitUndelegation.encode(message).finish(),
        };
    },
};
function createBaseDelegateCallback() {
    return {
        hostZoneId: '',
        depositRecordId: BigInt(0),
        splitDelegations: [],
    };
}
export const DelegateCallback = {
    typeUrl: '/stride.stakeibc.DelegateCallback',
    encode(message, writer = BinaryWriter.create()) {
        if (message.hostZoneId !== '') {
            writer.uint32(10).string(message.hostZoneId);
        }
        if (message.depositRecordId !== BigInt(0)) {
            writer.uint32(16).uint64(message.depositRecordId);
        }
        for (const v of message.splitDelegations) {
            SplitDelegation.encode(v, writer.uint32(26).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseDelegateCallback();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.hostZoneId = reader.string();
                    break;
                case 2:
                    message.depositRecordId = reader.uint64();
                    break;
                case 3:
                    message.splitDelegations.push(SplitDelegation.decode(reader, reader.uint32()));
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
            depositRecordId: isSet(object.depositRecordId)
                ? BigInt(object.depositRecordId.toString())
                : BigInt(0),
            splitDelegations: Array.isArray(object?.splitDelegations)
                ? object.splitDelegations.map((e) => SplitDelegation.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        message.hostZoneId !== undefined && (obj.hostZoneId = message.hostZoneId);
        message.depositRecordId !== undefined &&
            (obj.depositRecordId = (message.depositRecordId || BigInt(0)).toString());
        if (message.splitDelegations) {
            obj.splitDelegations = message.splitDelegations.map(e => e ? SplitDelegation.toJSON(e) : undefined);
        }
        else {
            obj.splitDelegations = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseDelegateCallback();
        message.hostZoneId = object.hostZoneId ?? '';
        message.depositRecordId =
            object.depositRecordId !== undefined && object.depositRecordId !== null
                ? BigInt(object.depositRecordId.toString())
                : BigInt(0);
        message.splitDelegations =
            object.splitDelegations?.map(e => SplitDelegation.fromPartial(e)) || [];
        return message;
    },
    fromProtoMsg(message) {
        return DelegateCallback.decode(message.value);
    },
    toProto(message) {
        return DelegateCallback.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakeibc.DelegateCallback',
            value: DelegateCallback.encode(message).finish(),
        };
    },
};
function createBaseClaimCallback() {
    return {
        userRedemptionRecordId: '',
        chainId: '',
        epochNumber: BigInt(0),
    };
}
export const ClaimCallback = {
    typeUrl: '/stride.stakeibc.ClaimCallback',
    encode(message, writer = BinaryWriter.create()) {
        if (message.userRedemptionRecordId !== '') {
            writer.uint32(10).string(message.userRedemptionRecordId);
        }
        if (message.chainId !== '') {
            writer.uint32(18).string(message.chainId);
        }
        if (message.epochNumber !== BigInt(0)) {
            writer.uint32(24).uint64(message.epochNumber);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseClaimCallback();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.userRedemptionRecordId = reader.string();
                    break;
                case 2:
                    message.chainId = reader.string();
                    break;
                case 3:
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
            userRedemptionRecordId: isSet(object.userRedemptionRecordId)
                ? String(object.userRedemptionRecordId)
                : '',
            chainId: isSet(object.chainId) ? String(object.chainId) : '',
            epochNumber: isSet(object.epochNumber)
                ? BigInt(object.epochNumber.toString())
                : BigInt(0),
        };
    },
    toJSON(message) {
        const obj = {};
        message.userRedemptionRecordId !== undefined &&
            (obj.userRedemptionRecordId = message.userRedemptionRecordId);
        message.chainId !== undefined && (obj.chainId = message.chainId);
        message.epochNumber !== undefined &&
            (obj.epochNumber = (message.epochNumber || BigInt(0)).toString());
        return obj;
    },
    fromPartial(object) {
        const message = createBaseClaimCallback();
        message.userRedemptionRecordId = object.userRedemptionRecordId ?? '';
        message.chainId = object.chainId ?? '';
        message.epochNumber =
            object.epochNumber !== undefined && object.epochNumber !== null
                ? BigInt(object.epochNumber.toString())
                : BigInt(0);
        return message;
    },
    fromProtoMsg(message) {
        return ClaimCallback.decode(message.value);
    },
    toProto(message) {
        return ClaimCallback.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakeibc.ClaimCallback',
            value: ClaimCallback.encode(message).finish(),
        };
    },
};
function createBaseReinvestCallback() {
    return {
        reinvestAmount: Coin.fromPartial({}),
        hostZoneId: '',
    };
}
export const ReinvestCallback = {
    typeUrl: '/stride.stakeibc.ReinvestCallback',
    encode(message, writer = BinaryWriter.create()) {
        if (message.reinvestAmount !== undefined) {
            Coin.encode(message.reinvestAmount, writer.uint32(10).fork()).ldelim();
        }
        if (message.hostZoneId !== '') {
            writer.uint32(26).string(message.hostZoneId);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseReinvestCallback();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.reinvestAmount = Coin.decode(reader, reader.uint32());
                    break;
                case 3:
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
            reinvestAmount: isSet(object.reinvestAmount)
                ? Coin.fromJSON(object.reinvestAmount)
                : undefined,
            hostZoneId: isSet(object.hostZoneId) ? String(object.hostZoneId) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.reinvestAmount !== undefined &&
            (obj.reinvestAmount = message.reinvestAmount
                ? Coin.toJSON(message.reinvestAmount)
                : undefined);
        message.hostZoneId !== undefined && (obj.hostZoneId = message.hostZoneId);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseReinvestCallback();
        message.reinvestAmount =
            object.reinvestAmount !== undefined && object.reinvestAmount !== null
                ? Coin.fromPartial(object.reinvestAmount)
                : undefined;
        message.hostZoneId = object.hostZoneId ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return ReinvestCallback.decode(message.value);
    },
    toProto(message) {
        return ReinvestCallback.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakeibc.ReinvestCallback',
            value: ReinvestCallback.encode(message).finish(),
        };
    },
};
function createBaseUndelegateCallback() {
    return {
        hostZoneId: '',
        splitUndelegations: [],
        epochUnbondingRecordIds: [],
    };
}
export const UndelegateCallback = {
    typeUrl: '/stride.stakeibc.UndelegateCallback',
    encode(message, writer = BinaryWriter.create()) {
        if (message.hostZoneId !== '') {
            writer.uint32(10).string(message.hostZoneId);
        }
        for (const v of message.splitUndelegations) {
            SplitUndelegation.encode(v, writer.uint32(18).fork()).ldelim();
        }
        writer.uint32(26).fork();
        for (const v of message.epochUnbondingRecordIds) {
            writer.uint64(v);
        }
        writer.ldelim();
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseUndelegateCallback();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.hostZoneId = reader.string();
                    break;
                case 2:
                    message.splitUndelegations.push(SplitUndelegation.decode(reader, reader.uint32()));
                    break;
                case 3:
                    if ((tag & 7) === 2) {
                        const end2 = reader.uint32() + reader.pos;
                        while (reader.pos < end2) {
                            message.epochUnbondingRecordIds.push(reader.uint64());
                        }
                    }
                    else {
                        message.epochUnbondingRecordIds.push(reader.uint64());
                    }
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
            splitUndelegations: Array.isArray(object?.splitUndelegations)
                ? object.splitUndelegations.map((e) => SplitUndelegation.fromJSON(e))
                : [],
            epochUnbondingRecordIds: Array.isArray(object?.epochUnbondingRecordIds)
                ? object.epochUnbondingRecordIds.map((e) => BigInt(e.toString()))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        message.hostZoneId !== undefined && (obj.hostZoneId = message.hostZoneId);
        if (message.splitUndelegations) {
            obj.splitUndelegations = message.splitUndelegations.map(e => e ? SplitUndelegation.toJSON(e) : undefined);
        }
        else {
            obj.splitUndelegations = [];
        }
        if (message.epochUnbondingRecordIds) {
            obj.epochUnbondingRecordIds = message.epochUnbondingRecordIds.map(e => (e || BigInt(0)).toString());
        }
        else {
            obj.epochUnbondingRecordIds = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseUndelegateCallback();
        message.hostZoneId = object.hostZoneId ?? '';
        message.splitUndelegations =
            object.splitUndelegations?.map(e => SplitUndelegation.fromPartial(e)) ||
                [];
        message.epochUnbondingRecordIds =
            object.epochUnbondingRecordIds?.map(e => BigInt(e.toString())) || [];
        return message;
    },
    fromProtoMsg(message) {
        return UndelegateCallback.decode(message.value);
    },
    toProto(message) {
        return UndelegateCallback.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakeibc.UndelegateCallback',
            value: UndelegateCallback.encode(message).finish(),
        };
    },
};
function createBaseRedemptionCallback() {
    return {
        hostZoneId: '',
        epochUnbondingRecordIds: [],
    };
}
export const RedemptionCallback = {
    typeUrl: '/stride.stakeibc.RedemptionCallback',
    encode(message, writer = BinaryWriter.create()) {
        if (message.hostZoneId !== '') {
            writer.uint32(10).string(message.hostZoneId);
        }
        writer.uint32(18).fork();
        for (const v of message.epochUnbondingRecordIds) {
            writer.uint64(v);
        }
        writer.ldelim();
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseRedemptionCallback();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.hostZoneId = reader.string();
                    break;
                case 2:
                    if ((tag & 7) === 2) {
                        const end2 = reader.uint32() + reader.pos;
                        while (reader.pos < end2) {
                            message.epochUnbondingRecordIds.push(reader.uint64());
                        }
                    }
                    else {
                        message.epochUnbondingRecordIds.push(reader.uint64());
                    }
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
            epochUnbondingRecordIds: Array.isArray(object?.epochUnbondingRecordIds)
                ? object.epochUnbondingRecordIds.map((e) => BigInt(e.toString()))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        message.hostZoneId !== undefined && (obj.hostZoneId = message.hostZoneId);
        if (message.epochUnbondingRecordIds) {
            obj.epochUnbondingRecordIds = message.epochUnbondingRecordIds.map(e => (e || BigInt(0)).toString());
        }
        else {
            obj.epochUnbondingRecordIds = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseRedemptionCallback();
        message.hostZoneId = object.hostZoneId ?? '';
        message.epochUnbondingRecordIds =
            object.epochUnbondingRecordIds?.map(e => BigInt(e.toString())) || [];
        return message;
    },
    fromProtoMsg(message) {
        return RedemptionCallback.decode(message.value);
    },
    toProto(message) {
        return RedemptionCallback.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakeibc.RedemptionCallback',
            value: RedemptionCallback.encode(message).finish(),
        };
    },
};
function createBaseRebalancing() {
    return {
        srcValidator: '',
        dstValidator: '',
        amt: '',
    };
}
export const Rebalancing = {
    typeUrl: '/stride.stakeibc.Rebalancing',
    encode(message, writer = BinaryWriter.create()) {
        if (message.srcValidator !== '') {
            writer.uint32(10).string(message.srcValidator);
        }
        if (message.dstValidator !== '') {
            writer.uint32(18).string(message.dstValidator);
        }
        if (message.amt !== '') {
            writer.uint32(26).string(message.amt);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseRebalancing();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.srcValidator = reader.string();
                    break;
                case 2:
                    message.dstValidator = reader.string();
                    break;
                case 3:
                    message.amt = reader.string();
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
            srcValidator: isSet(object.srcValidator)
                ? String(object.srcValidator)
                : '',
            dstValidator: isSet(object.dstValidator)
                ? String(object.dstValidator)
                : '',
            amt: isSet(object.amt) ? String(object.amt) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.srcValidator !== undefined &&
            (obj.srcValidator = message.srcValidator);
        message.dstValidator !== undefined &&
            (obj.dstValidator = message.dstValidator);
        message.amt !== undefined && (obj.amt = message.amt);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseRebalancing();
        message.srcValidator = object.srcValidator ?? '';
        message.dstValidator = object.dstValidator ?? '';
        message.amt = object.amt ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return Rebalancing.decode(message.value);
    },
    toProto(message) {
        return Rebalancing.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakeibc.Rebalancing',
            value: Rebalancing.encode(message).finish(),
        };
    },
};
function createBaseRebalanceCallback() {
    return {
        hostZoneId: '',
        rebalancings: [],
    };
}
export const RebalanceCallback = {
    typeUrl: '/stride.stakeibc.RebalanceCallback',
    encode(message, writer = BinaryWriter.create()) {
        if (message.hostZoneId !== '') {
            writer.uint32(10).string(message.hostZoneId);
        }
        for (const v of message.rebalancings) {
            Rebalancing.encode(v, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseRebalanceCallback();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.hostZoneId = reader.string();
                    break;
                case 2:
                    message.rebalancings.push(Rebalancing.decode(reader, reader.uint32()));
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
            rebalancings: Array.isArray(object?.rebalancings)
                ? object.rebalancings.map((e) => Rebalancing.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        message.hostZoneId !== undefined && (obj.hostZoneId = message.hostZoneId);
        if (message.rebalancings) {
            obj.rebalancings = message.rebalancings.map(e => e ? Rebalancing.toJSON(e) : undefined);
        }
        else {
            obj.rebalancings = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseRebalanceCallback();
        message.hostZoneId = object.hostZoneId ?? '';
        message.rebalancings =
            object.rebalancings?.map(e => Rebalancing.fromPartial(e)) || [];
        return message;
    },
    fromProtoMsg(message) {
        return RebalanceCallback.decode(message.value);
    },
    toProto(message) {
        return RebalanceCallback.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakeibc.RebalanceCallback',
            value: RebalanceCallback.encode(message).finish(),
        };
    },
};
function createBaseDetokenizeSharesCallback() {
    return {
        deposit: undefined,
    };
}
export const DetokenizeSharesCallback = {
    typeUrl: '/stride.stakeibc.DetokenizeSharesCallback',
    encode(message, writer = BinaryWriter.create()) {
        if (message.deposit !== undefined) {
            LSMTokenDeposit.encode(message.deposit, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseDetokenizeSharesCallback();
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
        const message = createBaseDetokenizeSharesCallback();
        message.deposit =
            object.deposit !== undefined && object.deposit !== null
                ? LSMTokenDeposit.fromPartial(object.deposit)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return DetokenizeSharesCallback.decode(message.value);
    },
    toProto(message) {
        return DetokenizeSharesCallback.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakeibc.DetokenizeSharesCallback',
            value: DetokenizeSharesCallback.encode(message).finish(),
        };
    },
};
function createBaseLSMLiquidStake() {
    return {
        deposit: undefined,
        hostZone: undefined,
        validator: undefined,
    };
}
export const LSMLiquidStake = {
    typeUrl: '/stride.stakeibc.LSMLiquidStake',
    encode(message, writer = BinaryWriter.create()) {
        if (message.deposit !== undefined) {
            LSMTokenDeposit.encode(message.deposit, writer.uint32(10).fork()).ldelim();
        }
        if (message.hostZone !== undefined) {
            HostZone.encode(message.hostZone, writer.uint32(18).fork()).ldelim();
        }
        if (message.validator !== undefined) {
            Validator.encode(message.validator, writer.uint32(26).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseLSMLiquidStake();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.deposit = LSMTokenDeposit.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.hostZone = HostZone.decode(reader, reader.uint32());
                    break;
                case 3:
                    message.validator = Validator.decode(reader, reader.uint32());
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
            hostZone: isSet(object.hostZone)
                ? HostZone.fromJSON(object.hostZone)
                : undefined,
            validator: isSet(object.validator)
                ? Validator.fromJSON(object.validator)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.deposit !== undefined &&
            (obj.deposit = message.deposit
                ? LSMTokenDeposit.toJSON(message.deposit)
                : undefined);
        message.hostZone !== undefined &&
            (obj.hostZone = message.hostZone
                ? HostZone.toJSON(message.hostZone)
                : undefined);
        message.validator !== undefined &&
            (obj.validator = message.validator
                ? Validator.toJSON(message.validator)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseLSMLiquidStake();
        message.deposit =
            object.deposit !== undefined && object.deposit !== null
                ? LSMTokenDeposit.fromPartial(object.deposit)
                : undefined;
        message.hostZone =
            object.hostZone !== undefined && object.hostZone !== null
                ? HostZone.fromPartial(object.hostZone)
                : undefined;
        message.validator =
            object.validator !== undefined && object.validator !== null
                ? Validator.fromPartial(object.validator)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return LSMLiquidStake.decode(message.value);
    },
    toProto(message) {
        return LSMLiquidStake.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakeibc.LSMLiquidStake',
            value: LSMLiquidStake.encode(message).finish(),
        };
    },
};
function createBaseValidatorSharesToTokensQueryCallback() {
    return {
        lsmLiquidStake: undefined,
    };
}
export const ValidatorSharesToTokensQueryCallback = {
    typeUrl: '/stride.stakeibc.ValidatorSharesToTokensQueryCallback',
    encode(message, writer = BinaryWriter.create()) {
        if (message.lsmLiquidStake !== undefined) {
            LSMLiquidStake.encode(message.lsmLiquidStake, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseValidatorSharesToTokensQueryCallback();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.lsmLiquidStake = LSMLiquidStake.decode(reader, reader.uint32());
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
            lsmLiquidStake: isSet(object.lsmLiquidStake)
                ? LSMLiquidStake.fromJSON(object.lsmLiquidStake)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.lsmLiquidStake !== undefined &&
            (obj.lsmLiquidStake = message.lsmLiquidStake
                ? LSMLiquidStake.toJSON(message.lsmLiquidStake)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseValidatorSharesToTokensQueryCallback();
        message.lsmLiquidStake =
            object.lsmLiquidStake !== undefined && object.lsmLiquidStake !== null
                ? LSMLiquidStake.fromPartial(object.lsmLiquidStake)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return ValidatorSharesToTokensQueryCallback.decode(message.value);
    },
    toProto(message) {
        return ValidatorSharesToTokensQueryCallback.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakeibc.ValidatorSharesToTokensQueryCallback',
            value: ValidatorSharesToTokensQueryCallback.encode(message).finish(),
        };
    },
};
function createBaseDelegatorSharesQueryCallback() {
    return {
        initialValidatorDelegation: '',
    };
}
export const DelegatorSharesQueryCallback = {
    typeUrl: '/stride.stakeibc.DelegatorSharesQueryCallback',
    encode(message, writer = BinaryWriter.create()) {
        if (message.initialValidatorDelegation !== '') {
            writer.uint32(10).string(message.initialValidatorDelegation);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseDelegatorSharesQueryCallback();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.initialValidatorDelegation = reader.string();
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
            initialValidatorDelegation: isSet(object.initialValidatorDelegation)
                ? String(object.initialValidatorDelegation)
                : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.initialValidatorDelegation !== undefined &&
            (obj.initialValidatorDelegation = message.initialValidatorDelegation);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseDelegatorSharesQueryCallback();
        message.initialValidatorDelegation =
            object.initialValidatorDelegation ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return DelegatorSharesQueryCallback.decode(message.value);
    },
    toProto(message) {
        return DelegatorSharesQueryCallback.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakeibc.DelegatorSharesQueryCallback',
            value: DelegatorSharesQueryCallback.encode(message).finish(),
        };
    },
};
function createBaseCommunityPoolBalanceQueryCallback() {
    return {
        icaType: 0,
        denom: '',
    };
}
export const CommunityPoolBalanceQueryCallback = {
    typeUrl: '/stride.stakeibc.CommunityPoolBalanceQueryCallback',
    encode(message, writer = BinaryWriter.create()) {
        if (message.icaType !== 0) {
            writer.uint32(8).int32(message.icaType);
        }
        if (message.denom !== '') {
            writer.uint32(18).string(message.denom);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseCommunityPoolBalanceQueryCallback();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.icaType = reader.int32();
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
            icaType: isSet(object.icaType)
                ? iCAAccountTypeFromJSON(object.icaType)
                : -1,
            denom: isSet(object.denom) ? String(object.denom) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.icaType !== undefined &&
            (obj.icaType = iCAAccountTypeToJSON(message.icaType));
        message.denom !== undefined && (obj.denom = message.denom);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseCommunityPoolBalanceQueryCallback();
        message.icaType = object.icaType ?? 0;
        message.denom = object.denom ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return CommunityPoolBalanceQueryCallback.decode(message.value);
    },
    toProto(message) {
        return CommunityPoolBalanceQueryCallback.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakeibc.CommunityPoolBalanceQueryCallback',
            value: CommunityPoolBalanceQueryCallback.encode(message).finish(),
        };
    },
};
function createBaseTradeRouteCallback() {
    return {
        rewardDenom: '',
        hostDenom: '',
    };
}
export const TradeRouteCallback = {
    typeUrl: '/stride.stakeibc.TradeRouteCallback',
    encode(message, writer = BinaryWriter.create()) {
        if (message.rewardDenom !== '') {
            writer.uint32(10).string(message.rewardDenom);
        }
        if (message.hostDenom !== '') {
            writer.uint32(18).string(message.hostDenom);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseTradeRouteCallback();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.rewardDenom = reader.string();
                    break;
                case 2:
                    message.hostDenom = reader.string();
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
            rewardDenom: isSet(object.rewardDenom) ? String(object.rewardDenom) : '',
            hostDenom: isSet(object.hostDenom) ? String(object.hostDenom) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.rewardDenom !== undefined &&
            (obj.rewardDenom = message.rewardDenom);
        message.hostDenom !== undefined && (obj.hostDenom = message.hostDenom);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseTradeRouteCallback();
        message.rewardDenom = object.rewardDenom ?? '';
        message.hostDenom = object.hostDenom ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return TradeRouteCallback.decode(message.value);
    },
    toProto(message) {
        return TradeRouteCallback.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakeibc.TradeRouteCallback',
            value: TradeRouteCallback.encode(message).finish(),
        };
    },
};
//# sourceMappingURL=callbacks.js.map