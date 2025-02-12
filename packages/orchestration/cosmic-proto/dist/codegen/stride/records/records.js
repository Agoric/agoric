//@ts-nocheck
import { Coin } from '../../cosmos/base/v1beta1/coin.js';
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { isSet } from '../../helpers.js';
import {} from '../../json-safe.js';
export var DepositRecord_Status;
(function (DepositRecord_Status) {
    /** TRANSFER_QUEUE - in transfer queue to be sent to the delegation ICA */
    DepositRecord_Status[DepositRecord_Status["TRANSFER_QUEUE"] = 0] = "TRANSFER_QUEUE";
    /** TRANSFER_IN_PROGRESS - transfer in progress (IBC packet sent, ack not received) */
    DepositRecord_Status[DepositRecord_Status["TRANSFER_IN_PROGRESS"] = 2] = "TRANSFER_IN_PROGRESS";
    /** DELEGATION_QUEUE - in staking queue on delegation ICA */
    DepositRecord_Status[DepositRecord_Status["DELEGATION_QUEUE"] = 1] = "DELEGATION_QUEUE";
    /** DELEGATION_IN_PROGRESS - staking in progress (ICA packet sent, ack not received) */
    DepositRecord_Status[DepositRecord_Status["DELEGATION_IN_PROGRESS"] = 3] = "DELEGATION_IN_PROGRESS";
    DepositRecord_Status[DepositRecord_Status["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
})(DepositRecord_Status || (DepositRecord_Status = {}));
export const DepositRecord_StatusSDKType = DepositRecord_Status;
export function depositRecord_StatusFromJSON(object) {
    switch (object) {
        case 0:
        case 'TRANSFER_QUEUE':
            return DepositRecord_Status.TRANSFER_QUEUE;
        case 2:
        case 'TRANSFER_IN_PROGRESS':
            return DepositRecord_Status.TRANSFER_IN_PROGRESS;
        case 1:
        case 'DELEGATION_QUEUE':
            return DepositRecord_Status.DELEGATION_QUEUE;
        case 3:
        case 'DELEGATION_IN_PROGRESS':
            return DepositRecord_Status.DELEGATION_IN_PROGRESS;
        case -1:
        case 'UNRECOGNIZED':
        default:
            return DepositRecord_Status.UNRECOGNIZED;
    }
}
export function depositRecord_StatusToJSON(object) {
    switch (object) {
        case DepositRecord_Status.TRANSFER_QUEUE:
            return 'TRANSFER_QUEUE';
        case DepositRecord_Status.TRANSFER_IN_PROGRESS:
            return 'TRANSFER_IN_PROGRESS';
        case DepositRecord_Status.DELEGATION_QUEUE:
            return 'DELEGATION_QUEUE';
        case DepositRecord_Status.DELEGATION_IN_PROGRESS:
            return 'DELEGATION_IN_PROGRESS';
        case DepositRecord_Status.UNRECOGNIZED:
        default:
            return 'UNRECOGNIZED';
    }
}
export var DepositRecord_Source;
(function (DepositRecord_Source) {
    DepositRecord_Source[DepositRecord_Source["STRIDE"] = 0] = "STRIDE";
    DepositRecord_Source[DepositRecord_Source["WITHDRAWAL_ICA"] = 1] = "WITHDRAWAL_ICA";
    DepositRecord_Source[DepositRecord_Source["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
})(DepositRecord_Source || (DepositRecord_Source = {}));
export const DepositRecord_SourceSDKType = DepositRecord_Source;
export function depositRecord_SourceFromJSON(object) {
    switch (object) {
        case 0:
        case 'STRIDE':
            return DepositRecord_Source.STRIDE;
        case 1:
        case 'WITHDRAWAL_ICA':
            return DepositRecord_Source.WITHDRAWAL_ICA;
        case -1:
        case 'UNRECOGNIZED':
        default:
            return DepositRecord_Source.UNRECOGNIZED;
    }
}
export function depositRecord_SourceToJSON(object) {
    switch (object) {
        case DepositRecord_Source.STRIDE:
            return 'STRIDE';
        case DepositRecord_Source.WITHDRAWAL_ICA:
            return 'WITHDRAWAL_ICA';
        case DepositRecord_Source.UNRECOGNIZED:
        default:
            return 'UNRECOGNIZED';
    }
}
export var HostZoneUnbonding_Status;
(function (HostZoneUnbonding_Status) {
    /** UNBONDING_QUEUE - tokens bonded on delegate account */
    HostZoneUnbonding_Status[HostZoneUnbonding_Status["UNBONDING_QUEUE"] = 0] = "UNBONDING_QUEUE";
    /** UNBONDING_IN_PROGRESS - unbonding ICA has been submitted */
    HostZoneUnbonding_Status[HostZoneUnbonding_Status["UNBONDING_IN_PROGRESS"] = 3] = "UNBONDING_IN_PROGRESS";
    /** UNBONDING_RETRY_QUEUE - unbonding ICA failed for at least one batch and need to be retried */
    HostZoneUnbonding_Status[HostZoneUnbonding_Status["UNBONDING_RETRY_QUEUE"] = 5] = "UNBONDING_RETRY_QUEUE";
    /** EXIT_TRANSFER_QUEUE - unbonding completed on delegate account */
    HostZoneUnbonding_Status[HostZoneUnbonding_Status["EXIT_TRANSFER_QUEUE"] = 1] = "EXIT_TRANSFER_QUEUE";
    /** EXIT_TRANSFER_IN_PROGRESS - redemption sweep has been submitted */
    HostZoneUnbonding_Status[HostZoneUnbonding_Status["EXIT_TRANSFER_IN_PROGRESS"] = 4] = "EXIT_TRANSFER_IN_PROGRESS";
    /** CLAIMABLE - transfer success */
    HostZoneUnbonding_Status[HostZoneUnbonding_Status["CLAIMABLE"] = 2] = "CLAIMABLE";
    HostZoneUnbonding_Status[HostZoneUnbonding_Status["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
})(HostZoneUnbonding_Status || (HostZoneUnbonding_Status = {}));
export const HostZoneUnbonding_StatusSDKType = HostZoneUnbonding_Status;
export function hostZoneUnbonding_StatusFromJSON(object) {
    switch (object) {
        case 0:
        case 'UNBONDING_QUEUE':
            return HostZoneUnbonding_Status.UNBONDING_QUEUE;
        case 3:
        case 'UNBONDING_IN_PROGRESS':
            return HostZoneUnbonding_Status.UNBONDING_IN_PROGRESS;
        case 5:
        case 'UNBONDING_RETRY_QUEUE':
            return HostZoneUnbonding_Status.UNBONDING_RETRY_QUEUE;
        case 1:
        case 'EXIT_TRANSFER_QUEUE':
            return HostZoneUnbonding_Status.EXIT_TRANSFER_QUEUE;
        case 4:
        case 'EXIT_TRANSFER_IN_PROGRESS':
            return HostZoneUnbonding_Status.EXIT_TRANSFER_IN_PROGRESS;
        case 2:
        case 'CLAIMABLE':
            return HostZoneUnbonding_Status.CLAIMABLE;
        case -1:
        case 'UNRECOGNIZED':
        default:
            return HostZoneUnbonding_Status.UNRECOGNIZED;
    }
}
export function hostZoneUnbonding_StatusToJSON(object) {
    switch (object) {
        case HostZoneUnbonding_Status.UNBONDING_QUEUE:
            return 'UNBONDING_QUEUE';
        case HostZoneUnbonding_Status.UNBONDING_IN_PROGRESS:
            return 'UNBONDING_IN_PROGRESS';
        case HostZoneUnbonding_Status.UNBONDING_RETRY_QUEUE:
            return 'UNBONDING_RETRY_QUEUE';
        case HostZoneUnbonding_Status.EXIT_TRANSFER_QUEUE:
            return 'EXIT_TRANSFER_QUEUE';
        case HostZoneUnbonding_Status.EXIT_TRANSFER_IN_PROGRESS:
            return 'EXIT_TRANSFER_IN_PROGRESS';
        case HostZoneUnbonding_Status.CLAIMABLE:
            return 'CLAIMABLE';
        case HostZoneUnbonding_Status.UNRECOGNIZED:
        default:
            return 'UNRECOGNIZED';
    }
}
export var LSMTokenDeposit_Status;
(function (LSMTokenDeposit_Status) {
    LSMTokenDeposit_Status[LSMTokenDeposit_Status["DEPOSIT_PENDING"] = 0] = "DEPOSIT_PENDING";
    LSMTokenDeposit_Status[LSMTokenDeposit_Status["TRANSFER_QUEUE"] = 1] = "TRANSFER_QUEUE";
    LSMTokenDeposit_Status[LSMTokenDeposit_Status["TRANSFER_IN_PROGRESS"] = 2] = "TRANSFER_IN_PROGRESS";
    LSMTokenDeposit_Status[LSMTokenDeposit_Status["TRANSFER_FAILED"] = 3] = "TRANSFER_FAILED";
    LSMTokenDeposit_Status[LSMTokenDeposit_Status["DETOKENIZATION_QUEUE"] = 4] = "DETOKENIZATION_QUEUE";
    LSMTokenDeposit_Status[LSMTokenDeposit_Status["DETOKENIZATION_IN_PROGRESS"] = 5] = "DETOKENIZATION_IN_PROGRESS";
    LSMTokenDeposit_Status[LSMTokenDeposit_Status["DETOKENIZATION_FAILED"] = 6] = "DETOKENIZATION_FAILED";
    LSMTokenDeposit_Status[LSMTokenDeposit_Status["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
})(LSMTokenDeposit_Status || (LSMTokenDeposit_Status = {}));
export const LSMTokenDeposit_StatusSDKType = LSMTokenDeposit_Status;
export function lSMTokenDeposit_StatusFromJSON(object) {
    switch (object) {
        case 0:
        case 'DEPOSIT_PENDING':
            return LSMTokenDeposit_Status.DEPOSIT_PENDING;
        case 1:
        case 'TRANSFER_QUEUE':
            return LSMTokenDeposit_Status.TRANSFER_QUEUE;
        case 2:
        case 'TRANSFER_IN_PROGRESS':
            return LSMTokenDeposit_Status.TRANSFER_IN_PROGRESS;
        case 3:
        case 'TRANSFER_FAILED':
            return LSMTokenDeposit_Status.TRANSFER_FAILED;
        case 4:
        case 'DETOKENIZATION_QUEUE':
            return LSMTokenDeposit_Status.DETOKENIZATION_QUEUE;
        case 5:
        case 'DETOKENIZATION_IN_PROGRESS':
            return LSMTokenDeposit_Status.DETOKENIZATION_IN_PROGRESS;
        case 6:
        case 'DETOKENIZATION_FAILED':
            return LSMTokenDeposit_Status.DETOKENIZATION_FAILED;
        case -1:
        case 'UNRECOGNIZED':
        default:
            return LSMTokenDeposit_Status.UNRECOGNIZED;
    }
}
export function lSMTokenDeposit_StatusToJSON(object) {
    switch (object) {
        case LSMTokenDeposit_Status.DEPOSIT_PENDING:
            return 'DEPOSIT_PENDING';
        case LSMTokenDeposit_Status.TRANSFER_QUEUE:
            return 'TRANSFER_QUEUE';
        case LSMTokenDeposit_Status.TRANSFER_IN_PROGRESS:
            return 'TRANSFER_IN_PROGRESS';
        case LSMTokenDeposit_Status.TRANSFER_FAILED:
            return 'TRANSFER_FAILED';
        case LSMTokenDeposit_Status.DETOKENIZATION_QUEUE:
            return 'DETOKENIZATION_QUEUE';
        case LSMTokenDeposit_Status.DETOKENIZATION_IN_PROGRESS:
            return 'DETOKENIZATION_IN_PROGRESS';
        case LSMTokenDeposit_Status.DETOKENIZATION_FAILED:
            return 'DETOKENIZATION_FAILED';
        case LSMTokenDeposit_Status.UNRECOGNIZED:
        default:
            return 'UNRECOGNIZED';
    }
}
function createBaseUserRedemptionRecord() {
    return {
        id: '',
        receiver: '',
        nativeTokenAmount: '',
        denom: '',
        hostZoneId: '',
        epochNumber: BigInt(0),
        claimIsPending: false,
        stTokenAmount: '',
    };
}
export const UserRedemptionRecord = {
    typeUrl: '/stride.records.UserRedemptionRecord',
    encode(message, writer = BinaryWriter.create()) {
        if (message.id !== '') {
            writer.uint32(10).string(message.id);
        }
        if (message.receiver !== '') {
            writer.uint32(26).string(message.receiver);
        }
        if (message.nativeTokenAmount !== '') {
            writer.uint32(34).string(message.nativeTokenAmount);
        }
        if (message.denom !== '') {
            writer.uint32(42).string(message.denom);
        }
        if (message.hostZoneId !== '') {
            writer.uint32(50).string(message.hostZoneId);
        }
        if (message.epochNumber !== BigInt(0)) {
            writer.uint32(56).uint64(message.epochNumber);
        }
        if (message.claimIsPending === true) {
            writer.uint32(64).bool(message.claimIsPending);
        }
        if (message.stTokenAmount !== '') {
            writer.uint32(74).string(message.stTokenAmount);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseUserRedemptionRecord();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.id = reader.string();
                    break;
                case 3:
                    message.receiver = reader.string();
                    break;
                case 4:
                    message.nativeTokenAmount = reader.string();
                    break;
                case 5:
                    message.denom = reader.string();
                    break;
                case 6:
                    message.hostZoneId = reader.string();
                    break;
                case 7:
                    message.epochNumber = reader.uint64();
                    break;
                case 8:
                    message.claimIsPending = reader.bool();
                    break;
                case 9:
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
            id: isSet(object.id) ? String(object.id) : '',
            receiver: isSet(object.receiver) ? String(object.receiver) : '',
            nativeTokenAmount: isSet(object.nativeTokenAmount)
                ? String(object.nativeTokenAmount)
                : '',
            denom: isSet(object.denom) ? String(object.denom) : '',
            hostZoneId: isSet(object.hostZoneId) ? String(object.hostZoneId) : '',
            epochNumber: isSet(object.epochNumber)
                ? BigInt(object.epochNumber.toString())
                : BigInt(0),
            claimIsPending: isSet(object.claimIsPending)
                ? Boolean(object.claimIsPending)
                : false,
            stTokenAmount: isSet(object.stTokenAmount)
                ? String(object.stTokenAmount)
                : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.id !== undefined && (obj.id = message.id);
        message.receiver !== undefined && (obj.receiver = message.receiver);
        message.nativeTokenAmount !== undefined &&
            (obj.nativeTokenAmount = message.nativeTokenAmount);
        message.denom !== undefined && (obj.denom = message.denom);
        message.hostZoneId !== undefined && (obj.hostZoneId = message.hostZoneId);
        message.epochNumber !== undefined &&
            (obj.epochNumber = (message.epochNumber || BigInt(0)).toString());
        message.claimIsPending !== undefined &&
            (obj.claimIsPending = message.claimIsPending);
        message.stTokenAmount !== undefined &&
            (obj.stTokenAmount = message.stTokenAmount);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseUserRedemptionRecord();
        message.id = object.id ?? '';
        message.receiver = object.receiver ?? '';
        message.nativeTokenAmount = object.nativeTokenAmount ?? '';
        message.denom = object.denom ?? '';
        message.hostZoneId = object.hostZoneId ?? '';
        message.epochNumber =
            object.epochNumber !== undefined && object.epochNumber !== null
                ? BigInt(object.epochNumber.toString())
                : BigInt(0);
        message.claimIsPending = object.claimIsPending ?? false;
        message.stTokenAmount = object.stTokenAmount ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return UserRedemptionRecord.decode(message.value);
    },
    toProto(message) {
        return UserRedemptionRecord.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.records.UserRedemptionRecord',
            value: UserRedemptionRecord.encode(message).finish(),
        };
    },
};
function createBaseDepositRecord() {
    return {
        id: BigInt(0),
        amount: '',
        denom: '',
        hostZoneId: '',
        status: 0,
        depositEpochNumber: BigInt(0),
        source: 0,
        delegationTxsInProgress: BigInt(0),
    };
}
export const DepositRecord = {
    typeUrl: '/stride.records.DepositRecord',
    encode(message, writer = BinaryWriter.create()) {
        if (message.id !== BigInt(0)) {
            writer.uint32(8).uint64(message.id);
        }
        if (message.amount !== '') {
            writer.uint32(18).string(message.amount);
        }
        if (message.denom !== '') {
            writer.uint32(26).string(message.denom);
        }
        if (message.hostZoneId !== '') {
            writer.uint32(34).string(message.hostZoneId);
        }
        if (message.status !== 0) {
            writer.uint32(48).int32(message.status);
        }
        if (message.depositEpochNumber !== BigInt(0)) {
            writer.uint32(56).uint64(message.depositEpochNumber);
        }
        if (message.source !== 0) {
            writer.uint32(64).int32(message.source);
        }
        if (message.delegationTxsInProgress !== BigInt(0)) {
            writer.uint32(72).uint64(message.delegationTxsInProgress);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseDepositRecord();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.id = reader.uint64();
                    break;
                case 2:
                    message.amount = reader.string();
                    break;
                case 3:
                    message.denom = reader.string();
                    break;
                case 4:
                    message.hostZoneId = reader.string();
                    break;
                case 6:
                    message.status = reader.int32();
                    break;
                case 7:
                    message.depositEpochNumber = reader.uint64();
                    break;
                case 8:
                    message.source = reader.int32();
                    break;
                case 9:
                    message.delegationTxsInProgress = reader.uint64();
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
            amount: isSet(object.amount) ? String(object.amount) : '',
            denom: isSet(object.denom) ? String(object.denom) : '',
            hostZoneId: isSet(object.hostZoneId) ? String(object.hostZoneId) : '',
            status: isSet(object.status)
                ? depositRecord_StatusFromJSON(object.status)
                : -1,
            depositEpochNumber: isSet(object.depositEpochNumber)
                ? BigInt(object.depositEpochNumber.toString())
                : BigInt(0),
            source: isSet(object.source)
                ? depositRecord_SourceFromJSON(object.source)
                : -1,
            delegationTxsInProgress: isSet(object.delegationTxsInProgress)
                ? BigInt(object.delegationTxsInProgress.toString())
                : BigInt(0),
        };
    },
    toJSON(message) {
        const obj = {};
        message.id !== undefined && (obj.id = (message.id || BigInt(0)).toString());
        message.amount !== undefined && (obj.amount = message.amount);
        message.denom !== undefined && (obj.denom = message.denom);
        message.hostZoneId !== undefined && (obj.hostZoneId = message.hostZoneId);
        message.status !== undefined &&
            (obj.status = depositRecord_StatusToJSON(message.status));
        message.depositEpochNumber !== undefined &&
            (obj.depositEpochNumber = (message.depositEpochNumber || BigInt(0)).toString());
        message.source !== undefined &&
            (obj.source = depositRecord_SourceToJSON(message.source));
        message.delegationTxsInProgress !== undefined &&
            (obj.delegationTxsInProgress = (message.delegationTxsInProgress || BigInt(0)).toString());
        return obj;
    },
    fromPartial(object) {
        const message = createBaseDepositRecord();
        message.id =
            object.id !== undefined && object.id !== null
                ? BigInt(object.id.toString())
                : BigInt(0);
        message.amount = object.amount ?? '';
        message.denom = object.denom ?? '';
        message.hostZoneId = object.hostZoneId ?? '';
        message.status = object.status ?? 0;
        message.depositEpochNumber =
            object.depositEpochNumber !== undefined &&
                object.depositEpochNumber !== null
                ? BigInt(object.depositEpochNumber.toString())
                : BigInt(0);
        message.source = object.source ?? 0;
        message.delegationTxsInProgress =
            object.delegationTxsInProgress !== undefined &&
                object.delegationTxsInProgress !== null
                ? BigInt(object.delegationTxsInProgress.toString())
                : BigInt(0);
        return message;
    },
    fromProtoMsg(message) {
        return DepositRecord.decode(message.value);
    },
    toProto(message) {
        return DepositRecord.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.records.DepositRecord',
            value: DepositRecord.encode(message).finish(),
        };
    },
};
function createBaseHostZoneUnbonding() {
    return {
        stTokenAmount: '',
        nativeTokenAmount: '',
        stTokensToBurn: '',
        nativeTokensToUnbond: '',
        claimableNativeTokens: '',
        undelegationTxsInProgress: BigInt(0),
        denom: '',
        hostZoneId: '',
        unbondingTime: BigInt(0),
        status: 0,
        userRedemptionRecords: [],
    };
}
export const HostZoneUnbonding = {
    typeUrl: '/stride.records.HostZoneUnbonding',
    encode(message, writer = BinaryWriter.create()) {
        if (message.stTokenAmount !== '') {
            writer.uint32(10).string(message.stTokenAmount);
        }
        if (message.nativeTokenAmount !== '') {
            writer.uint32(18).string(message.nativeTokenAmount);
        }
        if (message.stTokensToBurn !== '') {
            writer.uint32(66).string(message.stTokensToBurn);
        }
        if (message.nativeTokensToUnbond !== '') {
            writer.uint32(74).string(message.nativeTokensToUnbond);
        }
        if (message.claimableNativeTokens !== '') {
            writer.uint32(82).string(message.claimableNativeTokens);
        }
        if (message.undelegationTxsInProgress !== BigInt(0)) {
            writer.uint32(88).uint64(message.undelegationTxsInProgress);
        }
        if (message.denom !== '') {
            writer.uint32(26).string(message.denom);
        }
        if (message.hostZoneId !== '') {
            writer.uint32(34).string(message.hostZoneId);
        }
        if (message.unbondingTime !== BigInt(0)) {
            writer.uint32(40).uint64(message.unbondingTime);
        }
        if (message.status !== 0) {
            writer.uint32(48).int32(message.status);
        }
        for (const v of message.userRedemptionRecords) {
            writer.uint32(58).string(v);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseHostZoneUnbonding();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.stTokenAmount = reader.string();
                    break;
                case 2:
                    message.nativeTokenAmount = reader.string();
                    break;
                case 8:
                    message.stTokensToBurn = reader.string();
                    break;
                case 9:
                    message.nativeTokensToUnbond = reader.string();
                    break;
                case 10:
                    message.claimableNativeTokens = reader.string();
                    break;
                case 11:
                    message.undelegationTxsInProgress = reader.uint64();
                    break;
                case 3:
                    message.denom = reader.string();
                    break;
                case 4:
                    message.hostZoneId = reader.string();
                    break;
                case 5:
                    message.unbondingTime = reader.uint64();
                    break;
                case 6:
                    message.status = reader.int32();
                    break;
                case 7:
                    message.userRedemptionRecords.push(reader.string());
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
            stTokenAmount: isSet(object.stTokenAmount)
                ? String(object.stTokenAmount)
                : '',
            nativeTokenAmount: isSet(object.nativeTokenAmount)
                ? String(object.nativeTokenAmount)
                : '',
            stTokensToBurn: isSet(object.stTokensToBurn)
                ? String(object.stTokensToBurn)
                : '',
            nativeTokensToUnbond: isSet(object.nativeTokensToUnbond)
                ? String(object.nativeTokensToUnbond)
                : '',
            claimableNativeTokens: isSet(object.claimableNativeTokens)
                ? String(object.claimableNativeTokens)
                : '',
            undelegationTxsInProgress: isSet(object.undelegationTxsInProgress)
                ? BigInt(object.undelegationTxsInProgress.toString())
                : BigInt(0),
            denom: isSet(object.denom) ? String(object.denom) : '',
            hostZoneId: isSet(object.hostZoneId) ? String(object.hostZoneId) : '',
            unbondingTime: isSet(object.unbondingTime)
                ? BigInt(object.unbondingTime.toString())
                : BigInt(0),
            status: isSet(object.status)
                ? hostZoneUnbonding_StatusFromJSON(object.status)
                : -1,
            userRedemptionRecords: Array.isArray(object?.userRedemptionRecords)
                ? object.userRedemptionRecords.map((e) => String(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        message.stTokenAmount !== undefined &&
            (obj.stTokenAmount = message.stTokenAmount);
        message.nativeTokenAmount !== undefined &&
            (obj.nativeTokenAmount = message.nativeTokenAmount);
        message.stTokensToBurn !== undefined &&
            (obj.stTokensToBurn = message.stTokensToBurn);
        message.nativeTokensToUnbond !== undefined &&
            (obj.nativeTokensToUnbond = message.nativeTokensToUnbond);
        message.claimableNativeTokens !== undefined &&
            (obj.claimableNativeTokens = message.claimableNativeTokens);
        message.undelegationTxsInProgress !== undefined &&
            (obj.undelegationTxsInProgress = (message.undelegationTxsInProgress || BigInt(0)).toString());
        message.denom !== undefined && (obj.denom = message.denom);
        message.hostZoneId !== undefined && (obj.hostZoneId = message.hostZoneId);
        message.unbondingTime !== undefined &&
            (obj.unbondingTime = (message.unbondingTime || BigInt(0)).toString());
        message.status !== undefined &&
            (obj.status = hostZoneUnbonding_StatusToJSON(message.status));
        if (message.userRedemptionRecords) {
            obj.userRedemptionRecords = message.userRedemptionRecords.map(e => e);
        }
        else {
            obj.userRedemptionRecords = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseHostZoneUnbonding();
        message.stTokenAmount = object.stTokenAmount ?? '';
        message.nativeTokenAmount = object.nativeTokenAmount ?? '';
        message.stTokensToBurn = object.stTokensToBurn ?? '';
        message.nativeTokensToUnbond = object.nativeTokensToUnbond ?? '';
        message.claimableNativeTokens = object.claimableNativeTokens ?? '';
        message.undelegationTxsInProgress =
            object.undelegationTxsInProgress !== undefined &&
                object.undelegationTxsInProgress !== null
                ? BigInt(object.undelegationTxsInProgress.toString())
                : BigInt(0);
        message.denom = object.denom ?? '';
        message.hostZoneId = object.hostZoneId ?? '';
        message.unbondingTime =
            object.unbondingTime !== undefined && object.unbondingTime !== null
                ? BigInt(object.unbondingTime.toString())
                : BigInt(0);
        message.status = object.status ?? 0;
        message.userRedemptionRecords =
            object.userRedemptionRecords?.map(e => e) || [];
        return message;
    },
    fromProtoMsg(message) {
        return HostZoneUnbonding.decode(message.value);
    },
    toProto(message) {
        return HostZoneUnbonding.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.records.HostZoneUnbonding',
            value: HostZoneUnbonding.encode(message).finish(),
        };
    },
};
function createBaseEpochUnbondingRecord() {
    return {
        epochNumber: BigInt(0),
        hostZoneUnbondings: [],
    };
}
export const EpochUnbondingRecord = {
    typeUrl: '/stride.records.EpochUnbondingRecord',
    encode(message, writer = BinaryWriter.create()) {
        if (message.epochNumber !== BigInt(0)) {
            writer.uint32(8).uint64(message.epochNumber);
        }
        for (const v of message.hostZoneUnbondings) {
            HostZoneUnbonding.encode(v, writer.uint32(26).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseEpochUnbondingRecord();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.epochNumber = reader.uint64();
                    break;
                case 3:
                    message.hostZoneUnbondings.push(HostZoneUnbonding.decode(reader, reader.uint32()));
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
            hostZoneUnbondings: Array.isArray(object?.hostZoneUnbondings)
                ? object.hostZoneUnbondings.map((e) => HostZoneUnbonding.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        message.epochNumber !== undefined &&
            (obj.epochNumber = (message.epochNumber || BigInt(0)).toString());
        if (message.hostZoneUnbondings) {
            obj.hostZoneUnbondings = message.hostZoneUnbondings.map(e => e ? HostZoneUnbonding.toJSON(e) : undefined);
        }
        else {
            obj.hostZoneUnbondings = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseEpochUnbondingRecord();
        message.epochNumber =
            object.epochNumber !== undefined && object.epochNumber !== null
                ? BigInt(object.epochNumber.toString())
                : BigInt(0);
        message.hostZoneUnbondings =
            object.hostZoneUnbondings?.map(e => HostZoneUnbonding.fromPartial(e)) ||
                [];
        return message;
    },
    fromProtoMsg(message) {
        return EpochUnbondingRecord.decode(message.value);
    },
    toProto(message) {
        return EpochUnbondingRecord.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.records.EpochUnbondingRecord',
            value: EpochUnbondingRecord.encode(message).finish(),
        };
    },
};
function createBaseLSMTokenDeposit() {
    return {
        depositId: '',
        chainId: '',
        denom: '',
        ibcDenom: '',
        stakerAddress: '',
        validatorAddress: '',
        amount: '',
        stToken: Coin.fromPartial({}),
        status: 0,
    };
}
export const LSMTokenDeposit = {
    typeUrl: '/stride.records.LSMTokenDeposit',
    encode(message, writer = BinaryWriter.create()) {
        if (message.depositId !== '') {
            writer.uint32(10).string(message.depositId);
        }
        if (message.chainId !== '') {
            writer.uint32(18).string(message.chainId);
        }
        if (message.denom !== '') {
            writer.uint32(26).string(message.denom);
        }
        if (message.ibcDenom !== '') {
            writer.uint32(34).string(message.ibcDenom);
        }
        if (message.stakerAddress !== '') {
            writer.uint32(42).string(message.stakerAddress);
        }
        if (message.validatorAddress !== '') {
            writer.uint32(50).string(message.validatorAddress);
        }
        if (message.amount !== '') {
            writer.uint32(58).string(message.amount);
        }
        if (message.stToken !== undefined) {
            Coin.encode(message.stToken, writer.uint32(66).fork()).ldelim();
        }
        if (message.status !== 0) {
            writer.uint32(72).int32(message.status);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseLSMTokenDeposit();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.depositId = reader.string();
                    break;
                case 2:
                    message.chainId = reader.string();
                    break;
                case 3:
                    message.denom = reader.string();
                    break;
                case 4:
                    message.ibcDenom = reader.string();
                    break;
                case 5:
                    message.stakerAddress = reader.string();
                    break;
                case 6:
                    message.validatorAddress = reader.string();
                    break;
                case 7:
                    message.amount = reader.string();
                    break;
                case 8:
                    message.stToken = Coin.decode(reader, reader.uint32());
                    break;
                case 9:
                    message.status = reader.int32();
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
            depositId: isSet(object.depositId) ? String(object.depositId) : '',
            chainId: isSet(object.chainId) ? String(object.chainId) : '',
            denom: isSet(object.denom) ? String(object.denom) : '',
            ibcDenom: isSet(object.ibcDenom) ? String(object.ibcDenom) : '',
            stakerAddress: isSet(object.stakerAddress)
                ? String(object.stakerAddress)
                : '',
            validatorAddress: isSet(object.validatorAddress)
                ? String(object.validatorAddress)
                : '',
            amount: isSet(object.amount) ? String(object.amount) : '',
            stToken: isSet(object.stToken)
                ? Coin.fromJSON(object.stToken)
                : undefined,
            status: isSet(object.status)
                ? lSMTokenDeposit_StatusFromJSON(object.status)
                : -1,
        };
    },
    toJSON(message) {
        const obj = {};
        message.depositId !== undefined && (obj.depositId = message.depositId);
        message.chainId !== undefined && (obj.chainId = message.chainId);
        message.denom !== undefined && (obj.denom = message.denom);
        message.ibcDenom !== undefined && (obj.ibcDenom = message.ibcDenom);
        message.stakerAddress !== undefined &&
            (obj.stakerAddress = message.stakerAddress);
        message.validatorAddress !== undefined &&
            (obj.validatorAddress = message.validatorAddress);
        message.amount !== undefined && (obj.amount = message.amount);
        message.stToken !== undefined &&
            (obj.stToken = message.stToken
                ? Coin.toJSON(message.stToken)
                : undefined);
        message.status !== undefined &&
            (obj.status = lSMTokenDeposit_StatusToJSON(message.status));
        return obj;
    },
    fromPartial(object) {
        const message = createBaseLSMTokenDeposit();
        message.depositId = object.depositId ?? '';
        message.chainId = object.chainId ?? '';
        message.denom = object.denom ?? '';
        message.ibcDenom = object.ibcDenom ?? '';
        message.stakerAddress = object.stakerAddress ?? '';
        message.validatorAddress = object.validatorAddress ?? '';
        message.amount = object.amount ?? '';
        message.stToken =
            object.stToken !== undefined && object.stToken !== null
                ? Coin.fromPartial(object.stToken)
                : undefined;
        message.status = object.status ?? 0;
        return message;
    },
    fromProtoMsg(message) {
        return LSMTokenDeposit.decode(message.value);
    },
    toProto(message) {
        return LSMTokenDeposit.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.records.LSMTokenDeposit',
            value: LSMTokenDeposit.encode(message).finish(),
        };
    },
};
//# sourceMappingURL=records.js.map