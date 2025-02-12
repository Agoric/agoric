//@ts-nocheck
import { DelegationRecord, UnbondingRecord, RedemptionRecord, } from './stakedym.js';
import { Coin } from '../../cosmos/base/v1beta1/coin.js';
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { isSet, Decimal } from '../../helpers.js';
import {} from '../../json-safe.js';
export var OverwritableRecordType;
(function (OverwritableRecordType) {
    OverwritableRecordType[OverwritableRecordType["RECORD_TYPE_DELEGATION"] = 0] = "RECORD_TYPE_DELEGATION";
    OverwritableRecordType[OverwritableRecordType["RECORD_TYPE_UNBONDING"] = 1] = "RECORD_TYPE_UNBONDING";
    OverwritableRecordType[OverwritableRecordType["RECORD_TYPE_REDEMPTION"] = 2] = "RECORD_TYPE_REDEMPTION";
    OverwritableRecordType[OverwritableRecordType["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
})(OverwritableRecordType || (OverwritableRecordType = {}));
export const OverwritableRecordTypeSDKType = OverwritableRecordType;
export function overwritableRecordTypeFromJSON(object) {
    switch (object) {
        case 0:
        case 'RECORD_TYPE_DELEGATION':
            return OverwritableRecordType.RECORD_TYPE_DELEGATION;
        case 1:
        case 'RECORD_TYPE_UNBONDING':
            return OverwritableRecordType.RECORD_TYPE_UNBONDING;
        case 2:
        case 'RECORD_TYPE_REDEMPTION':
            return OverwritableRecordType.RECORD_TYPE_REDEMPTION;
        case -1:
        case 'UNRECOGNIZED':
        default:
            return OverwritableRecordType.UNRECOGNIZED;
    }
}
export function overwritableRecordTypeToJSON(object) {
    switch (object) {
        case OverwritableRecordType.RECORD_TYPE_DELEGATION:
            return 'RECORD_TYPE_DELEGATION';
        case OverwritableRecordType.RECORD_TYPE_UNBONDING:
            return 'RECORD_TYPE_UNBONDING';
        case OverwritableRecordType.RECORD_TYPE_REDEMPTION:
            return 'RECORD_TYPE_REDEMPTION';
        case OverwritableRecordType.UNRECOGNIZED:
        default:
            return 'UNRECOGNIZED';
    }
}
function createBaseMsgLiquidStake() {
    return {
        staker: '',
        nativeAmount: '',
    };
}
export const MsgLiquidStake = {
    typeUrl: '/stride.stakedym.MsgLiquidStake',
    encode(message, writer = BinaryWriter.create()) {
        if (message.staker !== '') {
            writer.uint32(10).string(message.staker);
        }
        if (message.nativeAmount !== '') {
            writer.uint32(18).string(message.nativeAmount);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgLiquidStake();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.staker = reader.string();
                    break;
                case 2:
                    message.nativeAmount = reader.string();
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
            staker: isSet(object.staker) ? String(object.staker) : '',
            nativeAmount: isSet(object.nativeAmount)
                ? String(object.nativeAmount)
                : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.staker !== undefined && (obj.staker = message.staker);
        message.nativeAmount !== undefined &&
            (obj.nativeAmount = message.nativeAmount);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgLiquidStake();
        message.staker = object.staker ?? '';
        message.nativeAmount = object.nativeAmount ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return MsgLiquidStake.decode(message.value);
    },
    toProto(message) {
        return MsgLiquidStake.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakedym.MsgLiquidStake',
            value: MsgLiquidStake.encode(message).finish(),
        };
    },
};
function createBaseMsgLiquidStakeResponse() {
    return {
        stToken: Coin.fromPartial({}),
    };
}
export const MsgLiquidStakeResponse = {
    typeUrl: '/stride.stakedym.MsgLiquidStakeResponse',
    encode(message, writer = BinaryWriter.create()) {
        if (message.stToken !== undefined) {
            Coin.encode(message.stToken, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgLiquidStakeResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.stToken = Coin.decode(reader, reader.uint32());
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
            stToken: isSet(object.stToken)
                ? Coin.fromJSON(object.stToken)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.stToken !== undefined &&
            (obj.stToken = message.stToken
                ? Coin.toJSON(message.stToken)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgLiquidStakeResponse();
        message.stToken =
            object.stToken !== undefined && object.stToken !== null
                ? Coin.fromPartial(object.stToken)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return MsgLiquidStakeResponse.decode(message.value);
    },
    toProto(message) {
        return MsgLiquidStakeResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakedym.MsgLiquidStakeResponse',
            value: MsgLiquidStakeResponse.encode(message).finish(),
        };
    },
};
function createBaseMsgRedeemStake() {
    return {
        redeemer: '',
        stTokenAmount: '',
    };
}
export const MsgRedeemStake = {
    typeUrl: '/stride.stakedym.MsgRedeemStake',
    encode(message, writer = BinaryWriter.create()) {
        if (message.redeemer !== '') {
            writer.uint32(10).string(message.redeemer);
        }
        if (message.stTokenAmount !== '') {
            writer.uint32(18).string(message.stTokenAmount);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgRedeemStake();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.redeemer = reader.string();
                    break;
                case 2:
                    message.stTokenAmount = reader.string();
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
            redeemer: isSet(object.redeemer) ? String(object.redeemer) : '',
            stTokenAmount: isSet(object.stTokenAmount)
                ? String(object.stTokenAmount)
                : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.redeemer !== undefined && (obj.redeemer = message.redeemer);
        message.stTokenAmount !== undefined &&
            (obj.stTokenAmount = message.stTokenAmount);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgRedeemStake();
        message.redeemer = object.redeemer ?? '';
        message.stTokenAmount = object.stTokenAmount ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return MsgRedeemStake.decode(message.value);
    },
    toProto(message) {
        return MsgRedeemStake.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakedym.MsgRedeemStake',
            value: MsgRedeemStake.encode(message).finish(),
        };
    },
};
function createBaseMsgRedeemStakeResponse() {
    return {
        nativeToken: Coin.fromPartial({}),
    };
}
export const MsgRedeemStakeResponse = {
    typeUrl: '/stride.stakedym.MsgRedeemStakeResponse',
    encode(message, writer = BinaryWriter.create()) {
        if (message.nativeToken !== undefined) {
            Coin.encode(message.nativeToken, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgRedeemStakeResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.nativeToken = Coin.decode(reader, reader.uint32());
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
            nativeToken: isSet(object.nativeToken)
                ? Coin.fromJSON(object.nativeToken)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.nativeToken !== undefined &&
            (obj.nativeToken = message.nativeToken
                ? Coin.toJSON(message.nativeToken)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgRedeemStakeResponse();
        message.nativeToken =
            object.nativeToken !== undefined && object.nativeToken !== null
                ? Coin.fromPartial(object.nativeToken)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return MsgRedeemStakeResponse.decode(message.value);
    },
    toProto(message) {
        return MsgRedeemStakeResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakedym.MsgRedeemStakeResponse',
            value: MsgRedeemStakeResponse.encode(message).finish(),
        };
    },
};
function createBaseMsgConfirmDelegation() {
    return {
        operator: '',
        recordId: BigInt(0),
        txHash: '',
    };
}
export const MsgConfirmDelegation = {
    typeUrl: '/stride.stakedym.MsgConfirmDelegation',
    encode(message, writer = BinaryWriter.create()) {
        if (message.operator !== '') {
            writer.uint32(10).string(message.operator);
        }
        if (message.recordId !== BigInt(0)) {
            writer.uint32(16).uint64(message.recordId);
        }
        if (message.txHash !== '') {
            writer.uint32(26).string(message.txHash);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgConfirmDelegation();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.operator = reader.string();
                    break;
                case 2:
                    message.recordId = reader.uint64();
                    break;
                case 3:
                    message.txHash = reader.string();
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
            operator: isSet(object.operator) ? String(object.operator) : '',
            recordId: isSet(object.recordId)
                ? BigInt(object.recordId.toString())
                : BigInt(0),
            txHash: isSet(object.txHash) ? String(object.txHash) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.operator !== undefined && (obj.operator = message.operator);
        message.recordId !== undefined &&
            (obj.recordId = (message.recordId || BigInt(0)).toString());
        message.txHash !== undefined && (obj.txHash = message.txHash);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgConfirmDelegation();
        message.operator = object.operator ?? '';
        message.recordId =
            object.recordId !== undefined && object.recordId !== null
                ? BigInt(object.recordId.toString())
                : BigInt(0);
        message.txHash = object.txHash ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return MsgConfirmDelegation.decode(message.value);
    },
    toProto(message) {
        return MsgConfirmDelegation.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakedym.MsgConfirmDelegation',
            value: MsgConfirmDelegation.encode(message).finish(),
        };
    },
};
function createBaseMsgConfirmDelegationResponse() {
    return {};
}
export const MsgConfirmDelegationResponse = {
    typeUrl: '/stride.stakedym.MsgConfirmDelegationResponse',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgConfirmDelegationResponse();
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
        const message = createBaseMsgConfirmDelegationResponse();
        return message;
    },
    fromProtoMsg(message) {
        return MsgConfirmDelegationResponse.decode(message.value);
    },
    toProto(message) {
        return MsgConfirmDelegationResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakedym.MsgConfirmDelegationResponse',
            value: MsgConfirmDelegationResponse.encode(message).finish(),
        };
    },
};
function createBaseMsgConfirmUndelegation() {
    return {
        operator: '',
        recordId: BigInt(0),
        txHash: '',
    };
}
export const MsgConfirmUndelegation = {
    typeUrl: '/stride.stakedym.MsgConfirmUndelegation',
    encode(message, writer = BinaryWriter.create()) {
        if (message.operator !== '') {
            writer.uint32(10).string(message.operator);
        }
        if (message.recordId !== BigInt(0)) {
            writer.uint32(16).uint64(message.recordId);
        }
        if (message.txHash !== '') {
            writer.uint32(26).string(message.txHash);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgConfirmUndelegation();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.operator = reader.string();
                    break;
                case 2:
                    message.recordId = reader.uint64();
                    break;
                case 3:
                    message.txHash = reader.string();
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
            operator: isSet(object.operator) ? String(object.operator) : '',
            recordId: isSet(object.recordId)
                ? BigInt(object.recordId.toString())
                : BigInt(0),
            txHash: isSet(object.txHash) ? String(object.txHash) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.operator !== undefined && (obj.operator = message.operator);
        message.recordId !== undefined &&
            (obj.recordId = (message.recordId || BigInt(0)).toString());
        message.txHash !== undefined && (obj.txHash = message.txHash);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgConfirmUndelegation();
        message.operator = object.operator ?? '';
        message.recordId =
            object.recordId !== undefined && object.recordId !== null
                ? BigInt(object.recordId.toString())
                : BigInt(0);
        message.txHash = object.txHash ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return MsgConfirmUndelegation.decode(message.value);
    },
    toProto(message) {
        return MsgConfirmUndelegation.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakedym.MsgConfirmUndelegation',
            value: MsgConfirmUndelegation.encode(message).finish(),
        };
    },
};
function createBaseMsgConfirmUndelegationResponse() {
    return {};
}
export const MsgConfirmUndelegationResponse = {
    typeUrl: '/stride.stakedym.MsgConfirmUndelegationResponse',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgConfirmUndelegationResponse();
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
        const message = createBaseMsgConfirmUndelegationResponse();
        return message;
    },
    fromProtoMsg(message) {
        return MsgConfirmUndelegationResponse.decode(message.value);
    },
    toProto(message) {
        return MsgConfirmUndelegationResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakedym.MsgConfirmUndelegationResponse',
            value: MsgConfirmUndelegationResponse.encode(message).finish(),
        };
    },
};
function createBaseMsgConfirmUnbondedTokenSweep() {
    return {
        operator: '',
        recordId: BigInt(0),
        txHash: '',
    };
}
export const MsgConfirmUnbondedTokenSweep = {
    typeUrl: '/stride.stakedym.MsgConfirmUnbondedTokenSweep',
    encode(message, writer = BinaryWriter.create()) {
        if (message.operator !== '') {
            writer.uint32(10).string(message.operator);
        }
        if (message.recordId !== BigInt(0)) {
            writer.uint32(16).uint64(message.recordId);
        }
        if (message.txHash !== '') {
            writer.uint32(26).string(message.txHash);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgConfirmUnbondedTokenSweep();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.operator = reader.string();
                    break;
                case 2:
                    message.recordId = reader.uint64();
                    break;
                case 3:
                    message.txHash = reader.string();
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
            operator: isSet(object.operator) ? String(object.operator) : '',
            recordId: isSet(object.recordId)
                ? BigInt(object.recordId.toString())
                : BigInt(0),
            txHash: isSet(object.txHash) ? String(object.txHash) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.operator !== undefined && (obj.operator = message.operator);
        message.recordId !== undefined &&
            (obj.recordId = (message.recordId || BigInt(0)).toString());
        message.txHash !== undefined && (obj.txHash = message.txHash);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgConfirmUnbondedTokenSweep();
        message.operator = object.operator ?? '';
        message.recordId =
            object.recordId !== undefined && object.recordId !== null
                ? BigInt(object.recordId.toString())
                : BigInt(0);
        message.txHash = object.txHash ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return MsgConfirmUnbondedTokenSweep.decode(message.value);
    },
    toProto(message) {
        return MsgConfirmUnbondedTokenSweep.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakedym.MsgConfirmUnbondedTokenSweep',
            value: MsgConfirmUnbondedTokenSweep.encode(message).finish(),
        };
    },
};
function createBaseMsgConfirmUnbondedTokenSweepResponse() {
    return {};
}
export const MsgConfirmUnbondedTokenSweepResponse = {
    typeUrl: '/stride.stakedym.MsgConfirmUnbondedTokenSweepResponse',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgConfirmUnbondedTokenSweepResponse();
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
        const message = createBaseMsgConfirmUnbondedTokenSweepResponse();
        return message;
    },
    fromProtoMsg(message) {
        return MsgConfirmUnbondedTokenSweepResponse.decode(message.value);
    },
    toProto(message) {
        return MsgConfirmUnbondedTokenSweepResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakedym.MsgConfirmUnbondedTokenSweepResponse',
            value: MsgConfirmUnbondedTokenSweepResponse.encode(message).finish(),
        };
    },
};
function createBaseMsgAdjustDelegatedBalance() {
    return {
        operator: '',
        delegationOffset: '',
        validatorAddress: '',
    };
}
export const MsgAdjustDelegatedBalance = {
    typeUrl: '/stride.stakedym.MsgAdjustDelegatedBalance',
    encode(message, writer = BinaryWriter.create()) {
        if (message.operator !== '') {
            writer.uint32(10).string(message.operator);
        }
        if (message.delegationOffset !== '') {
            writer.uint32(18).string(message.delegationOffset);
        }
        if (message.validatorAddress !== '') {
            writer.uint32(26).string(message.validatorAddress);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgAdjustDelegatedBalance();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.operator = reader.string();
                    break;
                case 2:
                    message.delegationOffset = reader.string();
                    break;
                case 3:
                    message.validatorAddress = reader.string();
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
            operator: isSet(object.operator) ? String(object.operator) : '',
            delegationOffset: isSet(object.delegationOffset)
                ? String(object.delegationOffset)
                : '',
            validatorAddress: isSet(object.validatorAddress)
                ? String(object.validatorAddress)
                : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.operator !== undefined && (obj.operator = message.operator);
        message.delegationOffset !== undefined &&
            (obj.delegationOffset = message.delegationOffset);
        message.validatorAddress !== undefined &&
            (obj.validatorAddress = message.validatorAddress);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgAdjustDelegatedBalance();
        message.operator = object.operator ?? '';
        message.delegationOffset = object.delegationOffset ?? '';
        message.validatorAddress = object.validatorAddress ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return MsgAdjustDelegatedBalance.decode(message.value);
    },
    toProto(message) {
        return MsgAdjustDelegatedBalance.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakedym.MsgAdjustDelegatedBalance',
            value: MsgAdjustDelegatedBalance.encode(message).finish(),
        };
    },
};
function createBaseMsgAdjustDelegatedBalanceResponse() {
    return {};
}
export const MsgAdjustDelegatedBalanceResponse = {
    typeUrl: '/stride.stakedym.MsgAdjustDelegatedBalanceResponse',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgAdjustDelegatedBalanceResponse();
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
        const message = createBaseMsgAdjustDelegatedBalanceResponse();
        return message;
    },
    fromProtoMsg(message) {
        return MsgAdjustDelegatedBalanceResponse.decode(message.value);
    },
    toProto(message) {
        return MsgAdjustDelegatedBalanceResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakedym.MsgAdjustDelegatedBalanceResponse',
            value: MsgAdjustDelegatedBalanceResponse.encode(message).finish(),
        };
    },
};
function createBaseMsgUpdateInnerRedemptionRateBounds() {
    return {
        creator: '',
        minInnerRedemptionRate: '',
        maxInnerRedemptionRate: '',
    };
}
export const MsgUpdateInnerRedemptionRateBounds = {
    typeUrl: '/stride.stakedym.MsgUpdateInnerRedemptionRateBounds',
    encode(message, writer = BinaryWriter.create()) {
        if (message.creator !== '') {
            writer.uint32(10).string(message.creator);
        }
        if (message.minInnerRedemptionRate !== '') {
            writer
                .uint32(18)
                .string(Decimal.fromUserInput(message.minInnerRedemptionRate, 18).atomics);
        }
        if (message.maxInnerRedemptionRate !== '') {
            writer
                .uint32(26)
                .string(Decimal.fromUserInput(message.maxInnerRedemptionRate, 18).atomics);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgUpdateInnerRedemptionRateBounds();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.creator = reader.string();
                    break;
                case 2:
                    message.minInnerRedemptionRate = Decimal.fromAtomics(reader.string(), 18).toString();
                    break;
                case 3:
                    message.maxInnerRedemptionRate = Decimal.fromAtomics(reader.string(), 18).toString();
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
            creator: isSet(object.creator) ? String(object.creator) : '',
            minInnerRedemptionRate: isSet(object.minInnerRedemptionRate)
                ? String(object.minInnerRedemptionRate)
                : '',
            maxInnerRedemptionRate: isSet(object.maxInnerRedemptionRate)
                ? String(object.maxInnerRedemptionRate)
                : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.creator !== undefined && (obj.creator = message.creator);
        message.minInnerRedemptionRate !== undefined &&
            (obj.minInnerRedemptionRate = message.minInnerRedemptionRate);
        message.maxInnerRedemptionRate !== undefined &&
            (obj.maxInnerRedemptionRate = message.maxInnerRedemptionRate);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgUpdateInnerRedemptionRateBounds();
        message.creator = object.creator ?? '';
        message.minInnerRedemptionRate = object.minInnerRedemptionRate ?? '';
        message.maxInnerRedemptionRate = object.maxInnerRedemptionRate ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return MsgUpdateInnerRedemptionRateBounds.decode(message.value);
    },
    toProto(message) {
        return MsgUpdateInnerRedemptionRateBounds.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakedym.MsgUpdateInnerRedemptionRateBounds',
            value: MsgUpdateInnerRedemptionRateBounds.encode(message).finish(),
        };
    },
};
function createBaseMsgUpdateInnerRedemptionRateBoundsResponse() {
    return {};
}
export const MsgUpdateInnerRedemptionRateBoundsResponse = {
    typeUrl: '/stride.stakedym.MsgUpdateInnerRedemptionRateBoundsResponse',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgUpdateInnerRedemptionRateBoundsResponse();
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
        const message = createBaseMsgUpdateInnerRedemptionRateBoundsResponse();
        return message;
    },
    fromProtoMsg(message) {
        return MsgUpdateInnerRedemptionRateBoundsResponse.decode(message.value);
    },
    toProto(message) {
        return MsgUpdateInnerRedemptionRateBoundsResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakedym.MsgUpdateInnerRedemptionRateBoundsResponse',
            value: MsgUpdateInnerRedemptionRateBoundsResponse.encode(message).finish(),
        };
    },
};
function createBaseMsgResumeHostZone() {
    return {
        creator: '',
    };
}
export const MsgResumeHostZone = {
    typeUrl: '/stride.stakedym.MsgResumeHostZone',
    encode(message, writer = BinaryWriter.create()) {
        if (message.creator !== '') {
            writer.uint32(10).string(message.creator);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgResumeHostZone();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.creator = reader.string();
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
            creator: isSet(object.creator) ? String(object.creator) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.creator !== undefined && (obj.creator = message.creator);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgResumeHostZone();
        message.creator = object.creator ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return MsgResumeHostZone.decode(message.value);
    },
    toProto(message) {
        return MsgResumeHostZone.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakedym.MsgResumeHostZone',
            value: MsgResumeHostZone.encode(message).finish(),
        };
    },
};
function createBaseMsgResumeHostZoneResponse() {
    return {};
}
export const MsgResumeHostZoneResponse = {
    typeUrl: '/stride.stakedym.MsgResumeHostZoneResponse',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgResumeHostZoneResponse();
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
        const message = createBaseMsgResumeHostZoneResponse();
        return message;
    },
    fromProtoMsg(message) {
        return MsgResumeHostZoneResponse.decode(message.value);
    },
    toProto(message) {
        return MsgResumeHostZoneResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakedym.MsgResumeHostZoneResponse',
            value: MsgResumeHostZoneResponse.encode(message).finish(),
        };
    },
};
function createBaseMsgRefreshRedemptionRate() {
    return {
        creator: '',
    };
}
export const MsgRefreshRedemptionRate = {
    typeUrl: '/stride.stakedym.MsgRefreshRedemptionRate',
    encode(message, writer = BinaryWriter.create()) {
        if (message.creator !== '') {
            writer.uint32(10).string(message.creator);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgRefreshRedemptionRate();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.creator = reader.string();
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
            creator: isSet(object.creator) ? String(object.creator) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.creator !== undefined && (obj.creator = message.creator);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgRefreshRedemptionRate();
        message.creator = object.creator ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return MsgRefreshRedemptionRate.decode(message.value);
    },
    toProto(message) {
        return MsgRefreshRedemptionRate.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakedym.MsgRefreshRedemptionRate',
            value: MsgRefreshRedemptionRate.encode(message).finish(),
        };
    },
};
function createBaseMsgRefreshRedemptionRateResponse() {
    return {};
}
export const MsgRefreshRedemptionRateResponse = {
    typeUrl: '/stride.stakedym.MsgRefreshRedemptionRateResponse',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgRefreshRedemptionRateResponse();
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
        const message = createBaseMsgRefreshRedemptionRateResponse();
        return message;
    },
    fromProtoMsg(message) {
        return MsgRefreshRedemptionRateResponse.decode(message.value);
    },
    toProto(message) {
        return MsgRefreshRedemptionRateResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakedym.MsgRefreshRedemptionRateResponse',
            value: MsgRefreshRedemptionRateResponse.encode(message).finish(),
        };
    },
};
function createBaseMsgOverwriteDelegationRecord() {
    return {
        creator: '',
        delegationRecord: undefined,
    };
}
export const MsgOverwriteDelegationRecord = {
    typeUrl: '/stride.stakedym.MsgOverwriteDelegationRecord',
    encode(message, writer = BinaryWriter.create()) {
        if (message.creator !== '') {
            writer.uint32(10).string(message.creator);
        }
        if (message.delegationRecord !== undefined) {
            DelegationRecord.encode(message.delegationRecord, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgOverwriteDelegationRecord();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.creator = reader.string();
                    break;
                case 2:
                    message.delegationRecord = DelegationRecord.decode(reader, reader.uint32());
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
            creator: isSet(object.creator) ? String(object.creator) : '',
            delegationRecord: isSet(object.delegationRecord)
                ? DelegationRecord.fromJSON(object.delegationRecord)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.creator !== undefined && (obj.creator = message.creator);
        message.delegationRecord !== undefined &&
            (obj.delegationRecord = message.delegationRecord
                ? DelegationRecord.toJSON(message.delegationRecord)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgOverwriteDelegationRecord();
        message.creator = object.creator ?? '';
        message.delegationRecord =
            object.delegationRecord !== undefined && object.delegationRecord !== null
                ? DelegationRecord.fromPartial(object.delegationRecord)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return MsgOverwriteDelegationRecord.decode(message.value);
    },
    toProto(message) {
        return MsgOverwriteDelegationRecord.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakedym.MsgOverwriteDelegationRecord',
            value: MsgOverwriteDelegationRecord.encode(message).finish(),
        };
    },
};
function createBaseMsgOverwriteDelegationRecordResponse() {
    return {};
}
export const MsgOverwriteDelegationRecordResponse = {
    typeUrl: '/stride.stakedym.MsgOverwriteDelegationRecordResponse',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgOverwriteDelegationRecordResponse();
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
        const message = createBaseMsgOverwriteDelegationRecordResponse();
        return message;
    },
    fromProtoMsg(message) {
        return MsgOverwriteDelegationRecordResponse.decode(message.value);
    },
    toProto(message) {
        return MsgOverwriteDelegationRecordResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakedym.MsgOverwriteDelegationRecordResponse',
            value: MsgOverwriteDelegationRecordResponse.encode(message).finish(),
        };
    },
};
function createBaseMsgOverwriteUnbondingRecord() {
    return {
        creator: '',
        unbondingRecord: undefined,
    };
}
export const MsgOverwriteUnbondingRecord = {
    typeUrl: '/stride.stakedym.MsgOverwriteUnbondingRecord',
    encode(message, writer = BinaryWriter.create()) {
        if (message.creator !== '') {
            writer.uint32(10).string(message.creator);
        }
        if (message.unbondingRecord !== undefined) {
            UnbondingRecord.encode(message.unbondingRecord, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgOverwriteUnbondingRecord();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.creator = reader.string();
                    break;
                case 2:
                    message.unbondingRecord = UnbondingRecord.decode(reader, reader.uint32());
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
            creator: isSet(object.creator) ? String(object.creator) : '',
            unbondingRecord: isSet(object.unbondingRecord)
                ? UnbondingRecord.fromJSON(object.unbondingRecord)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.creator !== undefined && (obj.creator = message.creator);
        message.unbondingRecord !== undefined &&
            (obj.unbondingRecord = message.unbondingRecord
                ? UnbondingRecord.toJSON(message.unbondingRecord)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgOverwriteUnbondingRecord();
        message.creator = object.creator ?? '';
        message.unbondingRecord =
            object.unbondingRecord !== undefined && object.unbondingRecord !== null
                ? UnbondingRecord.fromPartial(object.unbondingRecord)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return MsgOverwriteUnbondingRecord.decode(message.value);
    },
    toProto(message) {
        return MsgOverwriteUnbondingRecord.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakedym.MsgOverwriteUnbondingRecord',
            value: MsgOverwriteUnbondingRecord.encode(message).finish(),
        };
    },
};
function createBaseMsgOverwriteUnbondingRecordResponse() {
    return {};
}
export const MsgOverwriteUnbondingRecordResponse = {
    typeUrl: '/stride.stakedym.MsgOverwriteUnbondingRecordResponse',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgOverwriteUnbondingRecordResponse();
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
        const message = createBaseMsgOverwriteUnbondingRecordResponse();
        return message;
    },
    fromProtoMsg(message) {
        return MsgOverwriteUnbondingRecordResponse.decode(message.value);
    },
    toProto(message) {
        return MsgOverwriteUnbondingRecordResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakedym.MsgOverwriteUnbondingRecordResponse',
            value: MsgOverwriteUnbondingRecordResponse.encode(message).finish(),
        };
    },
};
function createBaseMsgOverwriteRedemptionRecord() {
    return {
        creator: '',
        redemptionRecord: undefined,
    };
}
export const MsgOverwriteRedemptionRecord = {
    typeUrl: '/stride.stakedym.MsgOverwriteRedemptionRecord',
    encode(message, writer = BinaryWriter.create()) {
        if (message.creator !== '') {
            writer.uint32(10).string(message.creator);
        }
        if (message.redemptionRecord !== undefined) {
            RedemptionRecord.encode(message.redemptionRecord, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgOverwriteRedemptionRecord();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.creator = reader.string();
                    break;
                case 2:
                    message.redemptionRecord = RedemptionRecord.decode(reader, reader.uint32());
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
            creator: isSet(object.creator) ? String(object.creator) : '',
            redemptionRecord: isSet(object.redemptionRecord)
                ? RedemptionRecord.fromJSON(object.redemptionRecord)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.creator !== undefined && (obj.creator = message.creator);
        message.redemptionRecord !== undefined &&
            (obj.redemptionRecord = message.redemptionRecord
                ? RedemptionRecord.toJSON(message.redemptionRecord)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgOverwriteRedemptionRecord();
        message.creator = object.creator ?? '';
        message.redemptionRecord =
            object.redemptionRecord !== undefined && object.redemptionRecord !== null
                ? RedemptionRecord.fromPartial(object.redemptionRecord)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return MsgOverwriteRedemptionRecord.decode(message.value);
    },
    toProto(message) {
        return MsgOverwriteRedemptionRecord.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakedym.MsgOverwriteRedemptionRecord',
            value: MsgOverwriteRedemptionRecord.encode(message).finish(),
        };
    },
};
function createBaseMsgOverwriteRedemptionRecordResponse() {
    return {};
}
export const MsgOverwriteRedemptionRecordResponse = {
    typeUrl: '/stride.stakedym.MsgOverwriteRedemptionRecordResponse',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgOverwriteRedemptionRecordResponse();
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
        const message = createBaseMsgOverwriteRedemptionRecordResponse();
        return message;
    },
    fromProtoMsg(message) {
        return MsgOverwriteRedemptionRecordResponse.decode(message.value);
    },
    toProto(message) {
        return MsgOverwriteRedemptionRecordResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakedym.MsgOverwriteRedemptionRecordResponse',
            value: MsgOverwriteRedemptionRecordResponse.encode(message).finish(),
        };
    },
};
function createBaseMsgSetOperatorAddress() {
    return {
        signer: '',
        operator: '',
    };
}
export const MsgSetOperatorAddress = {
    typeUrl: '/stride.stakedym.MsgSetOperatorAddress',
    encode(message, writer = BinaryWriter.create()) {
        if (message.signer !== '') {
            writer.uint32(10).string(message.signer);
        }
        if (message.operator !== '') {
            writer.uint32(18).string(message.operator);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgSetOperatorAddress();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.signer = reader.string();
                    break;
                case 2:
                    message.operator = reader.string();
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
            signer: isSet(object.signer) ? String(object.signer) : '',
            operator: isSet(object.operator) ? String(object.operator) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.signer !== undefined && (obj.signer = message.signer);
        message.operator !== undefined && (obj.operator = message.operator);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgSetOperatorAddress();
        message.signer = object.signer ?? '';
        message.operator = object.operator ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return MsgSetOperatorAddress.decode(message.value);
    },
    toProto(message) {
        return MsgSetOperatorAddress.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakedym.MsgSetOperatorAddress',
            value: MsgSetOperatorAddress.encode(message).finish(),
        };
    },
};
function createBaseMsgSetOperatorAddressResponse() {
    return {};
}
export const MsgSetOperatorAddressResponse = {
    typeUrl: '/stride.stakedym.MsgSetOperatorAddressResponse',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgSetOperatorAddressResponse();
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
        const message = createBaseMsgSetOperatorAddressResponse();
        return message;
    },
    fromProtoMsg(message) {
        return MsgSetOperatorAddressResponse.decode(message.value);
    },
    toProto(message) {
        return MsgSetOperatorAddressResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakedym.MsgSetOperatorAddressResponse',
            value: MsgSetOperatorAddressResponse.encode(message).finish(),
        };
    },
};
//# sourceMappingURL=tx.js.map