//@ts-nocheck
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { isSet } from '../../helpers.js';
import { type JsonSafe } from '../../json-safe.js';
/**
 * Status fields for a delegation record
 * Note: There is an important assumption here that tokens in the deposit
 * account should not be tracked by these records. The record is created as soon
 * as the tokens leave stride
 * Additionally, the GetActiveDelegationRecords query filters for records that
 * are either TRANSFER_IN_PROGERSS or DELEGATION_QUEUE. If a new active status
 * is added, the keeper must be modified
 */
export enum DelegationRecordStatus {
  /**
   * TRANSFER_IN_PROGRESS - TRANSFER_IN_PROGRESS indicates the native tokens are being sent from the
   * deposit account to the delegation account
   */
  TRANSFER_IN_PROGRESS = 0,
  /**
   * TRANSFER_FAILED - TRANSFER_FAILED indicates that the transfer either timed out or was an ack
   * failure
   */
  TRANSFER_FAILED = 1,
  /**
   * DELEGATION_QUEUE - DELEGATION_QUEUE indicates the tokens have landed on the host zone and are
   * ready to be delegated
   */
  DELEGATION_QUEUE = 2,
  /** DELEGATION_COMPLETE - DELEGATION_COMPLETE indicates the delegation has been completed */
  DELEGATION_COMPLETE = 3,
  UNRECOGNIZED = -1,
}
export const DelegationRecordStatusSDKType = DelegationRecordStatus;
export function delegationRecordStatusFromJSON(
  object: any,
): DelegationRecordStatus {
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
export function delegationRecordStatusToJSON(
  object: DelegationRecordStatus,
): string {
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
export enum UnbondingRecordStatus {
  /**
   * ACCUMULATING_REDEMPTIONS - ACCUMULATING_REDEMPTIONS indicates redemptions are still being accumulated
   * on this record
   */
  ACCUMULATING_REDEMPTIONS = 0,
  /**
   * UNBONDING_QUEUE - UNBONDING_QUEUE indicates the unbond amount for this epoch has been froze
   * and the tokens are ready to be unbonded on the host zone
   */
  UNBONDING_QUEUE = 1,
  /**
   * UNBONDING_IN_PROGRESS - UNBONDING_IN_PROGRESS indicates the unbonding is currently in progress on
   * the host zone
   */
  UNBONDING_IN_PROGRESS = 2,
  /**
   * UNBONDED - UNBONDED indicates the unbonding is finished on the host zone and the
   * tokens are still in the delegation account
   */
  UNBONDED = 3,
  /**
   * CLAIMABLE - CLAIMABLE indicates the unbonded tokens have been swept to stride and are
   * ready to be distributed to users
   */
  CLAIMABLE = 4,
  /** CLAIMED - CLAIMED indicates the full unbonding cycle has been completed */
  CLAIMED = 5,
  UNRECOGNIZED = -1,
}
export const UnbondingRecordStatusSDKType = UnbondingRecordStatus;
export function unbondingRecordStatusFromJSON(
  object: any,
): UnbondingRecordStatus {
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
export function unbondingRecordStatusToJSON(
  object: UnbondingRecordStatus,
): string {
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
export interface HostZone {
  /** Chain ID */
  chainId: string;
  /** Native token denom on the host zone (e.g. utia) */
  nativeTokenDenom: string;
  /** IBC denom of the native token as it lives on stride (e.g. ibc/...) */
  nativeTokenIbcDenom: string;
  /** Transfer channel ID from stride to the host zone */
  transferChannelId: string;
  /** Operator controlled delegation address on the host zone */
  delegationAddress: string;
  /** Operator controlled reward address on the host zone */
  rewardAddress: string;
  /** Deposit address on stride */
  depositAddress: string;
  /** Redemption address on stride */
  redemptionAddress: string;
  /** Claim address on stride */
  claimAddress: string;
  /** operator address set by safe, on stride */
  operatorAddressOnStride: string;
  /** admin address set upon host zone creation,  on stride */
  safeAddressOnStride: string;
  /** Total delegated balance on the host zone delegation account */
  remainingDelegatedBalance: string;
  /** The undelegation period for Celestia in days */
  unbondingPeriodSeconds: bigint;
  /** Indicates whether the host zone has been halted */
  halted: boolean;
}
export interface HostZoneProtoMsg {
  typeUrl: '/stride.staketia.HostZone';
  value: Uint8Array;
}
export interface HostZoneSDKType {
  chain_id: string;
  native_token_denom: string;
  native_token_ibc_denom: string;
  transfer_channel_id: string;
  delegation_address: string;
  reward_address: string;
  deposit_address: string;
  redemption_address: string;
  claim_address: string;
  operator_address_on_stride: string;
  safe_address_on_stride: string;
  remaining_delegated_balance: string;
  unbonding_period_seconds: bigint;
  halted: boolean;
}
/**
 * DelegationRecords track the aggregate liquid stakes and delegations
 * for a given epoch
 * Note: There is an important assumption here that tokens in the deposit
 * account should not be tracked by these records. The record is created as soon
 * as the tokens leave stride
 */
export interface DelegationRecord {
  /** Deposit record unique ID */
  id: bigint;
  /** The amount of native tokens that should be delegated */
  nativeAmount: string;
  /** The status indicating the point in the delegation's lifecycle */
  status: DelegationRecordStatus;
  /** The tx hash of the delegation on the host zone */
  txHash: string;
}
export interface DelegationRecordProtoMsg {
  typeUrl: '/stride.staketia.DelegationRecord';
  value: Uint8Array;
}
/**
 * DelegationRecords track the aggregate liquid stakes and delegations
 * for a given epoch
 * Note: There is an important assumption here that tokens in the deposit
 * account should not be tracked by these records. The record is created as soon
 * as the tokens leave stride
 */
export interface DelegationRecordSDKType {
  id: bigint;
  native_amount: string;
  status: DelegationRecordStatus;
  tx_hash: string;
}
/** UnbondingRecords track the aggregate unbondings across an epoch */
export interface UnbondingRecord {
  /** Unbonding record ID */
  id: bigint;
  /** The status indicating the point in the delegation's lifecycle */
  status: UnbondingRecordStatus;
  /** The amount of stTokens that were redeemed */
  stTokenAmount: string;
  /** The corresponding amount of native tokens that should be unbonded */
  nativeAmount: string;
  /** The Unix timestamp (in seconds) at which the unbonding completes */
  unbondingCompletionTimeSeconds: bigint;
  /** The tx hash of the undelegation on the host zone */
  undelegationTxHash: string;
  /** The tx hash of the unbonded token sweep on the host zone */
  unbondedTokenSweepTxHash: string;
}
export interface UnbondingRecordProtoMsg {
  typeUrl: '/stride.staketia.UnbondingRecord';
  value: Uint8Array;
}
/** UnbondingRecords track the aggregate unbondings across an epoch */
export interface UnbondingRecordSDKType {
  id: bigint;
  status: UnbondingRecordStatus;
  st_token_amount: string;
  native_amount: string;
  unbonding_completion_time_seconds: bigint;
  undelegation_tx_hash: string;
  unbonded_token_sweep_tx_hash: string;
}
/** RedemptionRecords track an individual user's redemption claims */
export interface RedemptionRecord {
  /** Unbonding record ID */
  unbondingRecordId: bigint;
  /** Redeemer */
  redeemer: string;
  /** The amount of stTokens that were redeemed */
  stTokenAmount: string;
  /** The corresponding amount of native tokens that should be unbonded */
  nativeAmount: string;
}
export interface RedemptionRecordProtoMsg {
  typeUrl: '/stride.staketia.RedemptionRecord';
  value: Uint8Array;
}
/** RedemptionRecords track an individual user's redemption claims */
export interface RedemptionRecordSDKType {
  unbonding_record_id: bigint;
  redeemer: string;
  st_token_amount: string;
  native_amount: string;
}
/** SlashRecords log adjustments to the delegated balance */
export interface SlashRecord {
  /** The slash record monotonically increasing ID */
  id: bigint;
  /**
   * The Unix timestamp (in seconds) when the slash adjustment was processed on
   * stride
   */
  time: bigint;
  /** The delta by which the total delegated amount changed from slash */
  nativeAmount: string;
  /** The address (or addresses) of the validator that was slashed */
  validatorAddress: string;
}
export interface SlashRecordProtoMsg {
  typeUrl: '/stride.staketia.SlashRecord';
  value: Uint8Array;
}
/** SlashRecords log adjustments to the delegated balance */
export interface SlashRecordSDKType {
  id: bigint;
  time: bigint;
  native_amount: string;
  validator_address: string;
}
function createBaseHostZone(): HostZone {
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
  encode(
    message: HostZone,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
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
  decode(input: BinaryReader | Uint8Array, length?: number): HostZone {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
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
  fromJSON(object: any): HostZone {
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
  toJSON(message: HostZone): JsonSafe<HostZone> {
    const obj: any = {};
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
      (obj.unbondingPeriodSeconds = (
        message.unbondingPeriodSeconds || BigInt(0)
      ).toString());
    message.halted !== undefined && (obj.halted = message.halted);
    return obj;
  },
  fromPartial(object: Partial<HostZone>): HostZone {
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
  fromProtoMsg(message: HostZoneProtoMsg): HostZone {
    return HostZone.decode(message.value);
  },
  toProto(message: HostZone): Uint8Array {
    return HostZone.encode(message).finish();
  },
  toProtoMsg(message: HostZone): HostZoneProtoMsg {
    return {
      typeUrl: '/stride.staketia.HostZone',
      value: HostZone.encode(message).finish(),
    };
  },
};
function createBaseDelegationRecord(): DelegationRecord {
  return {
    id: BigInt(0),
    nativeAmount: '',
    status: 0,
    txHash: '',
  };
}
export const DelegationRecord = {
  typeUrl: '/stride.staketia.DelegationRecord',
  encode(
    message: DelegationRecord,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
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
  decode(input: BinaryReader | Uint8Array, length?: number): DelegationRecord {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
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
          message.status = reader.int32() as any;
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
  fromJSON(object: any): DelegationRecord {
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
  toJSON(message: DelegationRecord): JsonSafe<DelegationRecord> {
    const obj: any = {};
    message.id !== undefined && (obj.id = (message.id || BigInt(0)).toString());
    message.nativeAmount !== undefined &&
      (obj.nativeAmount = message.nativeAmount);
    message.status !== undefined &&
      (obj.status = delegationRecordStatusToJSON(message.status));
    message.txHash !== undefined && (obj.txHash = message.txHash);
    return obj;
  },
  fromPartial(object: Partial<DelegationRecord>): DelegationRecord {
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
  fromProtoMsg(message: DelegationRecordProtoMsg): DelegationRecord {
    return DelegationRecord.decode(message.value);
  },
  toProto(message: DelegationRecord): Uint8Array {
    return DelegationRecord.encode(message).finish();
  },
  toProtoMsg(message: DelegationRecord): DelegationRecordProtoMsg {
    return {
      typeUrl: '/stride.staketia.DelegationRecord',
      value: DelegationRecord.encode(message).finish(),
    };
  },
};
function createBaseUnbondingRecord(): UnbondingRecord {
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
  encode(
    message: UnbondingRecord,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
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
  decode(input: BinaryReader | Uint8Array, length?: number): UnbondingRecord {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUnbondingRecord();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.id = reader.uint64();
          break;
        case 2:
          message.status = reader.int32() as any;
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
  fromJSON(object: any): UnbondingRecord {
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
      unbondingCompletionTimeSeconds: isSet(
        object.unbondingCompletionTimeSeconds,
      )
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
  toJSON(message: UnbondingRecord): JsonSafe<UnbondingRecord> {
    const obj: any = {};
    message.id !== undefined && (obj.id = (message.id || BigInt(0)).toString());
    message.status !== undefined &&
      (obj.status = unbondingRecordStatusToJSON(message.status));
    message.stTokenAmount !== undefined &&
      (obj.stTokenAmount = message.stTokenAmount);
    message.nativeAmount !== undefined &&
      (obj.nativeAmount = message.nativeAmount);
    message.unbondingCompletionTimeSeconds !== undefined &&
      (obj.unbondingCompletionTimeSeconds = (
        message.unbondingCompletionTimeSeconds || BigInt(0)
      ).toString());
    message.undelegationTxHash !== undefined &&
      (obj.undelegationTxHash = message.undelegationTxHash);
    message.unbondedTokenSweepTxHash !== undefined &&
      (obj.unbondedTokenSweepTxHash = message.unbondedTokenSweepTxHash);
    return obj;
  },
  fromPartial(object: Partial<UnbondingRecord>): UnbondingRecord {
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
  fromProtoMsg(message: UnbondingRecordProtoMsg): UnbondingRecord {
    return UnbondingRecord.decode(message.value);
  },
  toProto(message: UnbondingRecord): Uint8Array {
    return UnbondingRecord.encode(message).finish();
  },
  toProtoMsg(message: UnbondingRecord): UnbondingRecordProtoMsg {
    return {
      typeUrl: '/stride.staketia.UnbondingRecord',
      value: UnbondingRecord.encode(message).finish(),
    };
  },
};
function createBaseRedemptionRecord(): RedemptionRecord {
  return {
    unbondingRecordId: BigInt(0),
    redeemer: '',
    stTokenAmount: '',
    nativeAmount: '',
  };
}
export const RedemptionRecord = {
  typeUrl: '/stride.staketia.RedemptionRecord',
  encode(
    message: RedemptionRecord,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
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
  decode(input: BinaryReader | Uint8Array, length?: number): RedemptionRecord {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
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
  fromJSON(object: any): RedemptionRecord {
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
  toJSON(message: RedemptionRecord): JsonSafe<RedemptionRecord> {
    const obj: any = {};
    message.unbondingRecordId !== undefined &&
      (obj.unbondingRecordId = (
        message.unbondingRecordId || BigInt(0)
      ).toString());
    message.redeemer !== undefined && (obj.redeemer = message.redeemer);
    message.stTokenAmount !== undefined &&
      (obj.stTokenAmount = message.stTokenAmount);
    message.nativeAmount !== undefined &&
      (obj.nativeAmount = message.nativeAmount);
    return obj;
  },
  fromPartial(object: Partial<RedemptionRecord>): RedemptionRecord {
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
  fromProtoMsg(message: RedemptionRecordProtoMsg): RedemptionRecord {
    return RedemptionRecord.decode(message.value);
  },
  toProto(message: RedemptionRecord): Uint8Array {
    return RedemptionRecord.encode(message).finish();
  },
  toProtoMsg(message: RedemptionRecord): RedemptionRecordProtoMsg {
    return {
      typeUrl: '/stride.staketia.RedemptionRecord',
      value: RedemptionRecord.encode(message).finish(),
    };
  },
};
function createBaseSlashRecord(): SlashRecord {
  return {
    id: BigInt(0),
    time: BigInt(0),
    nativeAmount: '',
    validatorAddress: '',
  };
}
export const SlashRecord = {
  typeUrl: '/stride.staketia.SlashRecord',
  encode(
    message: SlashRecord,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
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
  decode(input: BinaryReader | Uint8Array, length?: number): SlashRecord {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
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
  fromJSON(object: any): SlashRecord {
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
  toJSON(message: SlashRecord): JsonSafe<SlashRecord> {
    const obj: any = {};
    message.id !== undefined && (obj.id = (message.id || BigInt(0)).toString());
    message.time !== undefined &&
      (obj.time = (message.time || BigInt(0)).toString());
    message.nativeAmount !== undefined &&
      (obj.nativeAmount = message.nativeAmount);
    message.validatorAddress !== undefined &&
      (obj.validatorAddress = message.validatorAddress);
    return obj;
  },
  fromPartial(object: Partial<SlashRecord>): SlashRecord {
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
  fromProtoMsg(message: SlashRecordProtoMsg): SlashRecord {
    return SlashRecord.decode(message.value);
  },
  toProto(message: SlashRecord): Uint8Array {
    return SlashRecord.encode(message).finish();
  },
  toProtoMsg(message: SlashRecord): SlashRecordProtoMsg {
    return {
      typeUrl: '/stride.staketia.SlashRecord',
      value: SlashRecord.encode(message).finish(),
    };
  },
};
