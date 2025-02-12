//@ts-nocheck
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { isSet } from '../../helpers.js';
import {} from '../../json-safe.js';
/**
 * Status fields for a delegation record
 * Note: There is an important assumption here that tokens in the deposit
 * account should not be tracked by these records. The record is created as soon
 * as the tokens leave stride
 * Additionally, the GetActiveDelegationRecords query filters for records that
 * are either TRANSFER_IN_PROGERSS or DELEGATION_QUEUE. If a new active status
 * is added, the keeper must be modified
 */
export var DelegationRecordStatus;
(function (DelegationRecordStatus) {
    /**
     * TRANSFER_IN_PROGRESS - TRANSFER_IN_PROGRESS indicates the native tokens are being sent from the
     * deposit account to the delegation account
     */
    DelegationRecordStatus[DelegationRecordStatus["TRANSFER_IN_PROGRESS"] = 0] = "TRANSFER_IN_PROGRESS";
    /**
     * TRANSFER_FAILED - TRANSFER_FAILED indicates that the transfer either timed out or was an ack
     * failure
     */
    DelegationRecordStatus[DelegationRecordStatus["TRANSFER_FAILED"] = 1] = "TRANSFER_FAILED";
    /**
     * DELEGATION_QUEUE - DELEGATION_QUEUE indicates the tokens have landed on the host zone and are
     * ready to be delegated
     */
    DelegationRecordStatus[DelegationRecordStatus["DELEGATION_QUEUE"] = 2] = "DELEGATION_QUEUE";
    /** DELEGATION_COMPLETE - DELEGATION_COMPLETE indicates the delegation has been completed */
    DelegationRecordStatus[DelegationRecordStatus["DELEGATION_COMPLETE"] = 3] = "DELEGATION_COMPLETE";
    DelegationRecordStatus[DelegationRecordStatus["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
})(DelegationRecordStatus || (DelegationRecordStatus = {}));
export const DelegationRecordStatusSDKType = DelegationRecordStatus;
export function delegationRecordStatusFromJSON(object) {
    switch (object) {
        case 0:
        case 'TRANSFER_IN_PROGRESS':
            return DelegationRecordStatus.TRANSFER_IN_PROGRESS;
        case 1:
        case 'TRANSFER_FAILED':
            return DelegationRecordStatus.TRANSFER_FAILED;
        case 2:
        case 'DELEGATION_QUEUE':
            return DelegationRecordStatus.DELEGATION_QUEUE;
        case 3:
        case 'DELEGATION_COMPLETE':
            return DelegationRecordStatus.DELEGATION_COMPLETE;
        case -1:
        case 'UNRECOGNIZED':
        default:
            return DelegationRecordStatus.UNRECOGNIZED;
    }
}
export function delegationRecordStatusToJSON(object) {
    switch (object) {
        case DelegationRecordStatus.TRANSFER_IN_PROGRESS:
            return 'TRANSFER_IN_PROGRESS';
        case DelegationRecordStatus.TRANSFER_FAILED:
            return 'TRANSFER_FAILED';
        case DelegationRecordStatus.DELEGATION_QUEUE:
            return 'DELEGATION_QUEUE';
        case DelegationRecordStatus.DELEGATION_COMPLETE:
            return 'DELEGATION_COMPLETE';
        case DelegationRecordStatus.UNRECOGNIZED:
        default:
            return 'UNRECOGNIZED';
    }
}
/** Status fields for an unbonding record */
export var UnbondingRecordStatus;
(function (UnbondingRecordStatus) {
    /**
     * ACCUMULATING_REDEMPTIONS - ACCUMULATING_REDEMPTIONS indicates redemptions are still being accumulated
     * on this record
     */
    UnbondingRecordStatus[UnbondingRecordStatus["ACCUMULATING_REDEMPTIONS"] = 0] = "ACCUMULATING_REDEMPTIONS";
    /**
     * UNBONDING_QUEUE - UNBONDING_QUEUE indicates the unbond amount for this epoch has been froze
     * and the tokens are ready to be unbonded on the host zone
     */
    UnbondingRecordStatus[UnbondingRecordStatus["UNBONDING_QUEUE"] = 1] = "UNBONDING_QUEUE";
    /**
     * UNBONDING_IN_PROGRESS - UNBONDING_IN_PROGRESS indicates the unbonding is currently in progress on
     * the host zone
     */
    UnbondingRecordStatus[UnbondingRecordStatus["UNBONDING_IN_PROGRESS"] = 2] = "UNBONDING_IN_PROGRESS";
    /**
     * UNBONDED - UNBONDED indicates the unbonding is finished on the host zone and the
     * tokens are still in the delegation account
     */
    UnbondingRecordStatus[UnbondingRecordStatus["UNBONDED"] = 3] = "UNBONDED";
    /**
     * CLAIMABLE - CLAIMABLE indicates the unbonded tokens have been swept to stride and are
     * ready to be distributed to users
     */
    UnbondingRecordStatus[UnbondingRecordStatus["CLAIMABLE"] = 4] = "CLAIMABLE";
    /** CLAIMED - CLAIMED indicates the full unbonding cycle has been completed */
    UnbondingRecordStatus[UnbondingRecordStatus["CLAIMED"] = 5] = "CLAIMED";
    UnbondingRecordStatus[UnbondingRecordStatus["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
})(UnbondingRecordStatus || (UnbondingRecordStatus = {}));
export const UnbondingRecordStatusSDKType = UnbondingRecordStatus;
export function unbondingRecordStatusFromJSON(object) {
    switch (object) {
        case 0:
        case 'ACCUMULATING_REDEMPTIONS':
            return UnbondingRecordStatus.ACCUMULATING_REDEMPTIONS;
        case 1:
        case 'UNBONDING_QUEUE':
            return UnbondingRecordStatus.UNBONDING_QUEUE;
        case 2:
        case 'UNBONDING_IN_PROGRESS':
            return UnbondingRecordStatus.UNBONDING_IN_PROGRESS;
        case 3:
        case 'UNBONDED':
            return UnbondingRecordStatus.UNBONDED;
        case 4:
        case 'CLAIMABLE':
            return UnbondingRecordStatus.CLAIMABLE;
        case 5:
        case 'CLAIMED':
            return UnbondingRecordStatus.CLAIMED;
        case -1:
        case 'UNRECOGNIZED':
        default:
            return UnbondingRecordStatus.UNRECOGNIZED;
    }
}
export function unbondingRecordStatusToJSON(object) {
    switch (object) {
        case UnbondingRecordStatus.ACCUMULATING_REDEMPTIONS:
            return 'ACCUMULATING_REDEMPTIONS';
        case UnbondingRecordStatus.UNBONDING_QUEUE:
            return 'UNBONDING_QUEUE';
        case UnbondingRecordStatus.UNBONDING_IN_PROGRESS:
            return 'UNBONDING_IN_PROGRESS';
        case UnbondingRecordStatus.UNBONDED:
            return 'UNBONDED';
        case UnbondingRecordStatus.CLAIMABLE:
            return 'CLAIMABLE';
        case UnbondingRecordStatus.CLAIMED:
            return 'CLAIMED';
        case UnbondingRecordStatus.UNRECOGNIZED:
        default:
            return 'UNRECOGNIZED';
    }
}
function createBaseHostZone() {
    return {
        chainId: '',
        nativeTokenDenom: '',
        nativeTokenIbcDenom: '',
        transferChannelId: '',
        delegationAddress: '',
        rewardAddress: '',
        depositAddress: '',
        redemptionAddress: '',
        claimAddress: '',
        operatorAddressOnStride: '',
        safeAddressOnStride: '',
        remainingDelegatedBalance: '',
        unbondingPeriodSeconds: BigInt(0),
        halted: false,
    };
}
export const HostZone = {
    typeUrl: '/stride.staketia.HostZone',
    encode(message, writer = BinaryWriter.create()) {
        if (message.chainId !== '') {
            writer.uint32(10).string(message.chainId);
        }
        if (message.nativeTokenDenom !== '') {
            writer.uint32(18).string(message.nativeTokenDenom);
        }
        if (message.nativeTokenIbcDenom !== '') {
            writer.uint32(26).string(message.nativeTokenIbcDenom);
        }
        if (message.transferChannelId !== '') {
            writer.uint32(34).string(message.transferChannelId);
        }
        if (message.delegationAddress !== '') {
            writer.uint32(42).string(message.delegationAddress);
        }
        if (message.rewardAddress !== '') {
            writer.uint32(50).string(message.rewardAddress);
        }
        if (message.depositAddress !== '') {
            writer.uint32(58).string(message.depositAddress);
        }
        if (message.redemptionAddress !== '') {
            writer.uint32(66).string(message.redemptionAddress);
        }
        if (message.claimAddress !== '') {
            writer.uint32(74).string(message.claimAddress);
        }
        if (message.operatorAddressOnStride !== '') {
            writer.uint32(82).string(message.operatorAddressOnStride);
        }
        if (message.safeAddressOnStride !== '') {
            writer.uint32(90).string(message.safeAddressOnStride);
        }
        if (message.remainingDelegatedBalance !== '') {
            writer.uint32(146).string(message.remainingDelegatedBalance);
        }
        if (message.unbondingPeriodSeconds !== BigInt(0)) {
            writer.uint32(152).uint64(message.unbondingPeriodSeconds);
        }
        if (message.halted === true) {
            writer.uint32(160).bool(message.halted);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseHostZone();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.chainId = reader.string();
                    break;
                case 2:
                    message.nativeTokenDenom = reader.string();
                    break;
                case 3:
                    message.nativeTokenIbcDenom = reader.string();
                    break;
                case 4:
                    message.transferChannelId = reader.string();
                    break;
                case 5:
                    message.delegationAddress = reader.string();
                    break;
                case 6:
                    message.rewardAddress = reader.string();
                    break;
                case 7:
                    message.depositAddress = reader.string();
                    break;
                case 8:
                    message.redemptionAddress = reader.string();
                    break;
                case 9:
                    message.claimAddress = reader.string();
                    break;
                case 10:
                    message.operatorAddressOnStride = reader.string();
                    break;
                case 11:
                    message.safeAddressOnStride = reader.string();
                    break;
                case 18:
                    message.remainingDelegatedBalance = reader.string();
                    break;
                case 19:
                    message.unbondingPeriodSeconds = reader.uint64();
                    break;
                case 20:
                    message.halted = reader.bool();
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
            nativeTokenDenom: isSet(object.nativeTokenDenom)
                ? String(object.nativeTokenDenom)
                : '',
            nativeTokenIbcDenom: isSet(object.nativeTokenIbcDenom)
                ? String(object.nativeTokenIbcDenom)
                : '',
            transferChannelId: isSet(object.transferChannelId)
                ? String(object.transferChannelId)
                : '',
            delegationAddress: isSet(object.delegationAddress)
                ? String(object.delegationAddress)
                : '',
            rewardAddress: isSet(object.rewardAddress)
                ? String(object.rewardAddress)
                : '',
            depositAddress: isSet(object.depositAddress)
                ? String(object.depositAddress)
                : '',
            redemptionAddress: isSet(object.redemptionAddress)
                ? String(object.redemptionAddress)
                : '',
            claimAddress: isSet(object.claimAddress)
                ? String(object.claimAddress)
                : '',
            operatorAddressOnStride: isSet(object.operatorAddressOnStride)
                ? String(object.operatorAddressOnStride)
                : '',
            safeAddressOnStride: isSet(object.safeAddressOnStride)
                ? String(object.safeAddressOnStride)
                : '',
            remainingDelegatedBalance: isSet(object.remainingDelegatedBalance)
                ? String(object.remainingDelegatedBalance)
                : '',
            unbondingPeriodSeconds: isSet(object.unbondingPeriodSeconds)
                ? BigInt(object.unbondingPeriodSeconds.toString())
                : BigInt(0),
            halted: isSet(object.halted) ? Boolean(object.halted) : false,
        };
    },
    toJSON(message) {
        const obj = {};
        message.chainId !== undefined && (obj.chainId = message.chainId);
        message.nativeTokenDenom !== undefined &&
            (obj.nativeTokenDenom = message.nativeTokenDenom);
        message.nativeTokenIbcDenom !== undefined &&
            (obj.nativeTokenIbcDenom = message.nativeTokenIbcDenom);
        message.transferChannelId !== undefined &&
            (obj.transferChannelId = message.transferChannelId);
        message.delegationAddress !== undefined &&
            (obj.delegationAddress = message.delegationAddress);
        message.rewardAddress !== undefined &&
            (obj.rewardAddress = message.rewardAddress);
        message.depositAddress !== undefined &&
            (obj.depositAddress = message.depositAddress);
        message.redemptionAddress !== undefined &&
            (obj.redemptionAddress = message.redemptionAddress);
        message.claimAddress !== undefined &&
            (obj.claimAddress = message.claimAddress);
        message.operatorAddressOnStride !== undefined &&
            (obj.operatorAddressOnStride = message.operatorAddressOnStride);
        message.safeAddressOnStride !== undefined &&
            (obj.safeAddressOnStride = message.safeAddressOnStride);
        message.remainingDelegatedBalance !== undefined &&
            (obj.remainingDelegatedBalance = message.remainingDelegatedBalance);
        message.unbondingPeriodSeconds !== undefined &&
            (obj.unbondingPeriodSeconds = (message.unbondingPeriodSeconds || BigInt(0)).toString());
        message.halted !== undefined && (obj.halted = message.halted);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseHostZone();
        message.chainId = object.chainId ?? '';
        message.nativeTokenDenom = object.nativeTokenDenom ?? '';
        message.nativeTokenIbcDenom = object.nativeTokenIbcDenom ?? '';
        message.transferChannelId = object.transferChannelId ?? '';
        message.delegationAddress = object.delegationAddress ?? '';
        message.rewardAddress = object.rewardAddress ?? '';
        message.depositAddress = object.depositAddress ?? '';
        message.redemptionAddress = object.redemptionAddress ?? '';
        message.claimAddress = object.claimAddress ?? '';
        message.operatorAddressOnStride = object.operatorAddressOnStride ?? '';
        message.safeAddressOnStride = object.safeAddressOnStride ?? '';
        message.remainingDelegatedBalance = object.remainingDelegatedBalance ?? '';
        message.unbondingPeriodSeconds =
            object.unbondingPeriodSeconds !== undefined &&
                object.unbondingPeriodSeconds !== null
                ? BigInt(object.unbondingPeriodSeconds.toString())
                : BigInt(0);
        message.halted = object.halted ?? false;
        return message;
    },
    fromProtoMsg(message) {
        return HostZone.decode(message.value);
    },
    toProto(message) {
        return HostZone.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.staketia.HostZone',
            value: HostZone.encode(message).finish(),
        };
    },
};
function createBaseDelegationRecord() {
    return {
        id: BigInt(0),
        nativeAmount: '',
        status: 0,
        txHash: '',
    };
}
export const DelegationRecord = {
    typeUrl: '/stride.staketia.DelegationRecord',
    encode(message, writer = BinaryWriter.create()) {
        if (message.id !== BigInt(0)) {
            writer.uint32(8).uint64(message.id);
        }
        if (message.nativeAmount !== '') {
            writer.uint32(18).string(message.nativeAmount);
        }
        if (message.status !== 0) {
            writer.uint32(24).int32(message.status);
        }
        if (message.txHash !== '') {
            writer.uint32(34).string(message.txHash);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseDelegationRecord();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.id = reader.uint64();
                    break;
                case 2:
                    message.nativeAmount = reader.string();
                    break;
                case 3:
                    message.status = reader.int32();
                    break;
                case 4:
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
            id: isSet(object.id) ? BigInt(object.id.toString()) : BigInt(0),
            nativeAmount: isSet(object.nativeAmount)
                ? String(object.nativeAmount)
                : '',
            status: isSet(object.status)
                ? delegationRecordStatusFromJSON(object.status)
                : -1,
            txHash: isSet(object.txHash) ? String(object.txHash) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.id !== undefined && (obj.id = (message.id || BigInt(0)).toString());
        message.nativeAmount !== undefined &&
            (obj.nativeAmount = message.nativeAmount);
        message.status !== undefined &&
            (obj.status = delegationRecordStatusToJSON(message.status));
        message.txHash !== undefined && (obj.txHash = message.txHash);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseDelegationRecord();
        message.id =
            object.id !== undefined && object.id !== null
                ? BigInt(object.id.toString())
                : BigInt(0);
        message.nativeAmount = object.nativeAmount ?? '';
        message.status = object.status ?? 0;
        message.txHash = object.txHash ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return DelegationRecord.decode(message.value);
    },
    toProto(message) {
        return DelegationRecord.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.staketia.DelegationRecord',
            value: DelegationRecord.encode(message).finish(),
        };
    },
};
function createBaseUnbondingRecord() {
    return {
        id: BigInt(0),
        status: 0,
        stTokenAmount: '',
        nativeAmount: '',
        unbondingCompletionTimeSeconds: BigInt(0),
        undelegationTxHash: '',
        unbondedTokenSweepTxHash: '',
    };
}
export const UnbondingRecord = {
    typeUrl: '/stride.staketia.UnbondingRecord',
    encode(message, writer = BinaryWriter.create()) {
        if (message.id !== BigInt(0)) {
            writer.uint32(8).uint64(message.id);
        }
        if (message.status !== 0) {
            writer.uint32(16).int32(message.status);
        }
        if (message.stTokenAmount !== '') {
            writer.uint32(26).string(message.stTokenAmount);
        }
        if (message.nativeAmount !== '') {
            writer.uint32(34).string(message.nativeAmount);
        }
        if (message.unbondingCompletionTimeSeconds !== BigInt(0)) {
            writer.uint32(40).uint64(message.unbondingCompletionTimeSeconds);
        }
        if (message.undelegationTxHash !== '') {
            writer.uint32(50).string(message.undelegationTxHash);
        }
        if (message.unbondedTokenSweepTxHash !== '') {
            writer.uint32(58).string(message.unbondedTokenSweepTxHash);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseUnbondingRecord();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.id = reader.uint64();
                    break;
                case 2:
                    message.status = reader.int32();
                    break;
                case 3:
                    message.stTokenAmount = reader.string();
                    break;
                case 4:
                    message.nativeAmount = reader.string();
                    break;
                case 5:
                    message.unbondingCompletionTimeSeconds = reader.uint64();
                    break;
                case 6:
                    message.undelegationTxHash = reader.string();
                    break;
                case 7:
                    message.unbondedTokenSweepTxHash = reader.string();
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
            status: isSet(object.status)
                ? unbondingRecordStatusFromJSON(object.status)
                : -1,
            stTokenAmount: isSet(object.stTokenAmount)
                ? String(object.stTokenAmount)
                : '',
            nativeAmount: isSet(object.nativeAmount)
                ? String(object.nativeAmount)
                : '',
            unbondingCompletionTimeSeconds: isSet(object.unbondingCompletionTimeSeconds)
                ? BigInt(object.unbondingCompletionTimeSeconds.toString())
                : BigInt(0),
            undelegationTxHash: isSet(object.undelegationTxHash)
                ? String(object.undelegationTxHash)
                : '',
            unbondedTokenSweepTxHash: isSet(object.unbondedTokenSweepTxHash)
                ? String(object.unbondedTokenSweepTxHash)
                : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.id !== undefined && (obj.id = (message.id || BigInt(0)).toString());
        message.status !== undefined &&
            (obj.status = unbondingRecordStatusToJSON(message.status));
        message.stTokenAmount !== undefined &&
            (obj.stTokenAmount = message.stTokenAmount);
        message.nativeAmount !== undefined &&
            (obj.nativeAmount = message.nativeAmount);
        message.unbondingCompletionTimeSeconds !== undefined &&
            (obj.unbondingCompletionTimeSeconds = (message.unbondingCompletionTimeSeconds || BigInt(0)).toString());
        message.undelegationTxHash !== undefined &&
            (obj.undelegationTxHash = message.undelegationTxHash);
        message.unbondedTokenSweepTxHash !== undefined &&
            (obj.unbondedTokenSweepTxHash = message.unbondedTokenSweepTxHash);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseUnbondingRecord();
        message.id =
            object.id !== undefined && object.id !== null
                ? BigInt(object.id.toString())
                : BigInt(0);
        message.status = object.status ?? 0;
        message.stTokenAmount = object.stTokenAmount ?? '';
        message.nativeAmount = object.nativeAmount ?? '';
        message.unbondingCompletionTimeSeconds =
            object.unbondingCompletionTimeSeconds !== undefined &&
                object.unbondingCompletionTimeSeconds !== null
                ? BigInt(object.unbondingCompletionTimeSeconds.toString())
                : BigInt(0);
        message.undelegationTxHash = object.undelegationTxHash ?? '';
        message.unbondedTokenSweepTxHash = object.unbondedTokenSweepTxHash ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return UnbondingRecord.decode(message.value);
    },
    toProto(message) {
        return UnbondingRecord.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.staketia.UnbondingRecord',
            value: UnbondingRecord.encode(message).finish(),
        };
    },
};
function createBaseRedemptionRecord() {
    return {
        unbondingRecordId: BigInt(0),
        redeemer: '',
        stTokenAmount: '',
        nativeAmount: '',
    };
}
export const RedemptionRecord = {
    typeUrl: '/stride.staketia.RedemptionRecord',
    encode(message, writer = BinaryWriter.create()) {
        if (message.unbondingRecordId !== BigInt(0)) {
            writer.uint32(8).uint64(message.unbondingRecordId);
        }
        if (message.redeemer !== '') {
            writer.uint32(18).string(message.redeemer);
        }
        if (message.stTokenAmount !== '') {
            writer.uint32(26).string(message.stTokenAmount);
        }
        if (message.nativeAmount !== '') {
            writer.uint32(34).string(message.nativeAmount);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseRedemptionRecord();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.unbondingRecordId = reader.uint64();
                    break;
                case 2:
                    message.redeemer = reader.string();
                    break;
                case 3:
                    message.stTokenAmount = reader.string();
                    break;
                case 4:
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
            unbondingRecordId: isSet(object.unbondingRecordId)
                ? BigInt(object.unbondingRecordId.toString())
                : BigInt(0),
            redeemer: isSet(object.redeemer) ? String(object.redeemer) : '',
            stTokenAmount: isSet(object.stTokenAmount)
                ? String(object.stTokenAmount)
                : '',
            nativeAmount: isSet(object.nativeAmount)
                ? String(object.nativeAmount)
                : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.unbondingRecordId !== undefined &&
            (obj.unbondingRecordId = (message.unbondingRecordId || BigInt(0)).toString());
        message.redeemer !== undefined && (obj.redeemer = message.redeemer);
        message.stTokenAmount !== undefined &&
            (obj.stTokenAmount = message.stTokenAmount);
        message.nativeAmount !== undefined &&
            (obj.nativeAmount = message.nativeAmount);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseRedemptionRecord();
        message.unbondingRecordId =
            object.unbondingRecordId !== undefined &&
                object.unbondingRecordId !== null
                ? BigInt(object.unbondingRecordId.toString())
                : BigInt(0);
        message.redeemer = object.redeemer ?? '';
        message.stTokenAmount = object.stTokenAmount ?? '';
        message.nativeAmount = object.nativeAmount ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return RedemptionRecord.decode(message.value);
    },
    toProto(message) {
        return RedemptionRecord.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.staketia.RedemptionRecord',
            value: RedemptionRecord.encode(message).finish(),
        };
    },
};
function createBaseSlashRecord() {
    return {
        id: BigInt(0),
        time: BigInt(0),
        nativeAmount: '',
        validatorAddress: '',
    };
}
export const SlashRecord = {
    typeUrl: '/stride.staketia.SlashRecord',
    encode(message, writer = BinaryWriter.create()) {
        if (message.id !== BigInt(0)) {
            writer.uint32(8).uint64(message.id);
        }
        if (message.time !== BigInt(0)) {
            writer.uint32(16).uint64(message.time);
        }
        if (message.nativeAmount !== '') {
            writer.uint32(26).string(message.nativeAmount);
        }
        if (message.validatorAddress !== '') {
            writer.uint32(34).string(message.validatorAddress);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseSlashRecord();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.id = reader.uint64();
                    break;
                case 2:
                    message.time = reader.uint64();
                    break;
                case 3:
                    message.nativeAmount = reader.string();
                    break;
                case 4:
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
            id: isSet(object.id) ? BigInt(object.id.toString()) : BigInt(0),
            time: isSet(object.time) ? BigInt(object.time.toString()) : BigInt(0),
            nativeAmount: isSet(object.nativeAmount)
                ? String(object.nativeAmount)
                : '',
            validatorAddress: isSet(object.validatorAddress)
                ? String(object.validatorAddress)
                : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.id !== undefined && (obj.id = (message.id || BigInt(0)).toString());
        message.time !== undefined &&
            (obj.time = (message.time || BigInt(0)).toString());
        message.nativeAmount !== undefined &&
            (obj.nativeAmount = message.nativeAmount);
        message.validatorAddress !== undefined &&
            (obj.validatorAddress = message.validatorAddress);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseSlashRecord();
        message.id =
            object.id !== undefined && object.id !== null
                ? BigInt(object.id.toString())
                : BigInt(0);
        message.time =
            object.time !== undefined && object.time !== null
                ? BigInt(object.time.toString())
                : BigInt(0);
        message.nativeAmount = object.nativeAmount ?? '';
        message.validatorAddress = object.validatorAddress ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return SlashRecord.decode(message.value);
    },
    toProto(message) {
        return SlashRecord.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.staketia.SlashRecord',
            value: SlashRecord.encode(message).finish(),
        };
    },
};
//# sourceMappingURL=staketia.js.map