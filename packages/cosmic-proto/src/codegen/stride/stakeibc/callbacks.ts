//@ts-nocheck
import { Coin, type CoinSDKType } from '../../cosmos/base/v1beta1/coin.js';
import {
  LSMTokenDeposit,
  type LSMTokenDepositSDKType,
} from '../records/records.js';
import { HostZone, type HostZoneSDKType } from './host_zone.js';
import { Validator, type ValidatorSDKType } from './validator.js';
import {
  ICAAccountType,
  iCAAccountTypeFromJSON,
  iCAAccountTypeToJSON,
} from './ica_account.js';
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { isSet } from '../../helpers.js';
import { type JsonSafe } from '../../json-safe.js';
export interface SplitDelegation {
  validator: string;
  amount: string;
}
export interface SplitDelegationProtoMsg {
  typeUrl: '/stride.stakeibc.SplitDelegation';
  value: Uint8Array;
}
export interface SplitDelegationSDKType {
  validator: string;
  amount: string;
}
export interface SplitUndelegation {
  validator: string;
  nativeTokenAmount: string;
}
export interface SplitUndelegationProtoMsg {
  typeUrl: '/stride.stakeibc.SplitUndelegation';
  value: Uint8Array;
}
export interface SplitUndelegationSDKType {
  validator: string;
  native_token_amount: string;
}
export interface DelegateCallback {
  hostZoneId: string;
  depositRecordId: bigint;
  splitDelegations: SplitDelegation[];
}
export interface DelegateCallbackProtoMsg {
  typeUrl: '/stride.stakeibc.DelegateCallback';
  value: Uint8Array;
}
export interface DelegateCallbackSDKType {
  host_zone_id: string;
  deposit_record_id: bigint;
  split_delegations: SplitDelegationSDKType[];
}
export interface ClaimCallback {
  userRedemptionRecordId: string;
  chainId: string;
  epochNumber: bigint;
}
export interface ClaimCallbackProtoMsg {
  typeUrl: '/stride.stakeibc.ClaimCallback';
  value: Uint8Array;
}
export interface ClaimCallbackSDKType {
  user_redemption_record_id: string;
  chain_id: string;
  epoch_number: bigint;
}
export interface ReinvestCallback {
  reinvestAmount: Coin;
  hostZoneId: string;
}
export interface ReinvestCallbackProtoMsg {
  typeUrl: '/stride.stakeibc.ReinvestCallback';
  value: Uint8Array;
}
export interface ReinvestCallbackSDKType {
  reinvest_amount: CoinSDKType;
  host_zone_id: string;
}
export interface UndelegateCallback {
  hostZoneId: string;
  splitUndelegations: SplitUndelegation[];
  epochUnbondingRecordIds: bigint[];
}
export interface UndelegateCallbackProtoMsg {
  typeUrl: '/stride.stakeibc.UndelegateCallback';
  value: Uint8Array;
}
export interface UndelegateCallbackSDKType {
  host_zone_id: string;
  split_undelegations: SplitUndelegationSDKType[];
  epoch_unbonding_record_ids: bigint[];
}
export interface RedemptionCallback {
  hostZoneId: string;
  epochUnbondingRecordIds: bigint[];
}
export interface RedemptionCallbackProtoMsg {
  typeUrl: '/stride.stakeibc.RedemptionCallback';
  value: Uint8Array;
}
export interface RedemptionCallbackSDKType {
  host_zone_id: string;
  epoch_unbonding_record_ids: bigint[];
}
export interface Rebalancing {
  srcValidator: string;
  dstValidator: string;
  amt: string;
}
export interface RebalancingProtoMsg {
  typeUrl: '/stride.stakeibc.Rebalancing';
  value: Uint8Array;
}
export interface RebalancingSDKType {
  src_validator: string;
  dst_validator: string;
  amt: string;
}
export interface RebalanceCallback {
  hostZoneId: string;
  rebalancings: Rebalancing[];
}
export interface RebalanceCallbackProtoMsg {
  typeUrl: '/stride.stakeibc.RebalanceCallback';
  value: Uint8Array;
}
export interface RebalanceCallbackSDKType {
  host_zone_id: string;
  rebalancings: RebalancingSDKType[];
}
export interface DetokenizeSharesCallback {
  deposit?: LSMTokenDeposit;
}
export interface DetokenizeSharesCallbackProtoMsg {
  typeUrl: '/stride.stakeibc.DetokenizeSharesCallback';
  value: Uint8Array;
}
export interface DetokenizeSharesCallbackSDKType {
  deposit?: LSMTokenDepositSDKType;
}
export interface LSMLiquidStake {
  deposit?: LSMTokenDeposit;
  hostZone?: HostZone;
  validator?: Validator;
}
export interface LSMLiquidStakeProtoMsg {
  typeUrl: '/stride.stakeibc.LSMLiquidStake';
  value: Uint8Array;
}
export interface LSMLiquidStakeSDKType {
  deposit?: LSMTokenDepositSDKType;
  host_zone?: HostZoneSDKType;
  validator?: ValidatorSDKType;
}
export interface ValidatorSharesToTokensQueryCallback {
  lsmLiquidStake?: LSMLiquidStake;
}
export interface ValidatorSharesToTokensQueryCallbackProtoMsg {
  typeUrl: '/stride.stakeibc.ValidatorSharesToTokensQueryCallback';
  value: Uint8Array;
}
export interface ValidatorSharesToTokensQueryCallbackSDKType {
  lsm_liquid_stake?: LSMLiquidStakeSDKType;
}
export interface DelegatorSharesQueryCallback {
  /** Validator delegation at the time the query is submitted */
  initialValidatorDelegation: string;
}
export interface DelegatorSharesQueryCallbackProtoMsg {
  typeUrl: '/stride.stakeibc.DelegatorSharesQueryCallback';
  value: Uint8Array;
}
export interface DelegatorSharesQueryCallbackSDKType {
  initial_validator_delegation: string;
}
export interface CommunityPoolBalanceQueryCallback {
  icaType: ICAAccountType;
  denom: string;
}
export interface CommunityPoolBalanceQueryCallbackProtoMsg {
  typeUrl: '/stride.stakeibc.CommunityPoolBalanceQueryCallback';
  value: Uint8Array;
}
export interface CommunityPoolBalanceQueryCallbackSDKType {
  ica_type: ICAAccountType;
  denom: string;
}
export interface TradeRouteCallback {
  rewardDenom: string;
  hostDenom: string;
}
export interface TradeRouteCallbackProtoMsg {
  typeUrl: '/stride.stakeibc.TradeRouteCallback';
  value: Uint8Array;
}
export interface TradeRouteCallbackSDKType {
  reward_denom: string;
  host_denom: string;
}
function createBaseSplitDelegation(): SplitDelegation {
  return {
    validator: '',
    amount: '',
  };
}
export const SplitDelegation = {
  typeUrl: '/stride.stakeibc.SplitDelegation',
  encode(
    message: SplitDelegation,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.validator !== '') {
      writer.uint32(10).string(message.validator);
    }
    if (message.amount !== '') {
      writer.uint32(18).string(message.amount);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): SplitDelegation {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
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
  fromJSON(object: any): SplitDelegation {
    return {
      validator: isSet(object.validator) ? String(object.validator) : '',
      amount: isSet(object.amount) ? String(object.amount) : '',
    };
  },
  toJSON(message: SplitDelegation): JsonSafe<SplitDelegation> {
    const obj: any = {};
    message.validator !== undefined && (obj.validator = message.validator);
    message.amount !== undefined && (obj.amount = message.amount);
    return obj;
  },
  fromPartial(object: Partial<SplitDelegation>): SplitDelegation {
    const message = createBaseSplitDelegation();
    message.validator = object.validator ?? '';
    message.amount = object.amount ?? '';
    return message;
  },
  fromProtoMsg(message: SplitDelegationProtoMsg): SplitDelegation {
    return SplitDelegation.decode(message.value);
  },
  toProto(message: SplitDelegation): Uint8Array {
    return SplitDelegation.encode(message).finish();
  },
  toProtoMsg(message: SplitDelegation): SplitDelegationProtoMsg {
    return {
      typeUrl: '/stride.stakeibc.SplitDelegation',
      value: SplitDelegation.encode(message).finish(),
    };
  },
};
function createBaseSplitUndelegation(): SplitUndelegation {
  return {
    validator: '',
    nativeTokenAmount: '',
  };
}
export const SplitUndelegation = {
  typeUrl: '/stride.stakeibc.SplitUndelegation',
  encode(
    message: SplitUndelegation,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.validator !== '') {
      writer.uint32(10).string(message.validator);
    }
    if (message.nativeTokenAmount !== '') {
      writer.uint32(18).string(message.nativeTokenAmount);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): SplitUndelegation {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
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
  fromJSON(object: any): SplitUndelegation {
    return {
      validator: isSet(object.validator) ? String(object.validator) : '',
      nativeTokenAmount: isSet(object.nativeTokenAmount)
        ? String(object.nativeTokenAmount)
        : '',
    };
  },
  toJSON(message: SplitUndelegation): JsonSafe<SplitUndelegation> {
    const obj: any = {};
    message.validator !== undefined && (obj.validator = message.validator);
    message.nativeTokenAmount !== undefined &&
      (obj.nativeTokenAmount = message.nativeTokenAmount);
    return obj;
  },
  fromPartial(object: Partial<SplitUndelegation>): SplitUndelegation {
    const message = createBaseSplitUndelegation();
    message.validator = object.validator ?? '';
    message.nativeTokenAmount = object.nativeTokenAmount ?? '';
    return message;
  },
  fromProtoMsg(message: SplitUndelegationProtoMsg): SplitUndelegation {
    return SplitUndelegation.decode(message.value);
  },
  toProto(message: SplitUndelegation): Uint8Array {
    return SplitUndelegation.encode(message).finish();
  },
  toProtoMsg(message: SplitUndelegation): SplitUndelegationProtoMsg {
    return {
      typeUrl: '/stride.stakeibc.SplitUndelegation',
      value: SplitUndelegation.encode(message).finish(),
    };
  },
};
function createBaseDelegateCallback(): DelegateCallback {
  return {
    hostZoneId: '',
    depositRecordId: BigInt(0),
    splitDelegations: [],
  };
}
export const DelegateCallback = {
  typeUrl: '/stride.stakeibc.DelegateCallback',
  encode(
    message: DelegateCallback,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.hostZoneId !== '') {
      writer.uint32(10).string(message.hostZoneId);
    }
    if (message.depositRecordId !== BigInt(0)) {
      writer.uint32(16).uint64(message.depositRecordId);
    }
    for (const v of message.splitDelegations) {
      SplitDelegation.encode(v!, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): DelegateCallback {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
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
          message.splitDelegations.push(
            SplitDelegation.decode(reader, reader.uint32()),
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): DelegateCallback {
    return {
      hostZoneId: isSet(object.hostZoneId) ? String(object.hostZoneId) : '',
      depositRecordId: isSet(object.depositRecordId)
        ? BigInt(object.depositRecordId.toString())
        : BigInt(0),
      splitDelegations: Array.isArray(object?.splitDelegations)
        ? object.splitDelegations.map((e: any) => SplitDelegation.fromJSON(e))
        : [],
    };
  },
  toJSON(message: DelegateCallback): JsonSafe<DelegateCallback> {
    const obj: any = {};
    message.hostZoneId !== undefined && (obj.hostZoneId = message.hostZoneId);
    message.depositRecordId !== undefined &&
      (obj.depositRecordId = (message.depositRecordId || BigInt(0)).toString());
    if (message.splitDelegations) {
      obj.splitDelegations = message.splitDelegations.map(e =>
        e ? SplitDelegation.toJSON(e) : undefined,
      );
    } else {
      obj.splitDelegations = [];
    }
    return obj;
  },
  fromPartial(object: Partial<DelegateCallback>): DelegateCallback {
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
  fromProtoMsg(message: DelegateCallbackProtoMsg): DelegateCallback {
    return DelegateCallback.decode(message.value);
  },
  toProto(message: DelegateCallback): Uint8Array {
    return DelegateCallback.encode(message).finish();
  },
  toProtoMsg(message: DelegateCallback): DelegateCallbackProtoMsg {
    return {
      typeUrl: '/stride.stakeibc.DelegateCallback',
      value: DelegateCallback.encode(message).finish(),
    };
  },
};
function createBaseClaimCallback(): ClaimCallback {
  return {
    userRedemptionRecordId: '',
    chainId: '',
    epochNumber: BigInt(0),
  };
}
export const ClaimCallback = {
  typeUrl: '/stride.stakeibc.ClaimCallback',
  encode(
    message: ClaimCallback,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
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
  decode(input: BinaryReader | Uint8Array, length?: number): ClaimCallback {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
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
  fromJSON(object: any): ClaimCallback {
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
  toJSON(message: ClaimCallback): JsonSafe<ClaimCallback> {
    const obj: any = {};
    message.userRedemptionRecordId !== undefined &&
      (obj.userRedemptionRecordId = message.userRedemptionRecordId);
    message.chainId !== undefined && (obj.chainId = message.chainId);
    message.epochNumber !== undefined &&
      (obj.epochNumber = (message.epochNumber || BigInt(0)).toString());
    return obj;
  },
  fromPartial(object: Partial<ClaimCallback>): ClaimCallback {
    const message = createBaseClaimCallback();
    message.userRedemptionRecordId = object.userRedemptionRecordId ?? '';
    message.chainId = object.chainId ?? '';
    message.epochNumber =
      object.epochNumber !== undefined && object.epochNumber !== null
        ? BigInt(object.epochNumber.toString())
        : BigInt(0);
    return message;
  },
  fromProtoMsg(message: ClaimCallbackProtoMsg): ClaimCallback {
    return ClaimCallback.decode(message.value);
  },
  toProto(message: ClaimCallback): Uint8Array {
    return ClaimCallback.encode(message).finish();
  },
  toProtoMsg(message: ClaimCallback): ClaimCallbackProtoMsg {
    return {
      typeUrl: '/stride.stakeibc.ClaimCallback',
      value: ClaimCallback.encode(message).finish(),
    };
  },
};
function createBaseReinvestCallback(): ReinvestCallback {
  return {
    reinvestAmount: Coin.fromPartial({}),
    hostZoneId: '',
  };
}
export const ReinvestCallback = {
  typeUrl: '/stride.stakeibc.ReinvestCallback',
  encode(
    message: ReinvestCallback,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.reinvestAmount !== undefined) {
      Coin.encode(message.reinvestAmount, writer.uint32(10).fork()).ldelim();
    }
    if (message.hostZoneId !== '') {
      writer.uint32(26).string(message.hostZoneId);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): ReinvestCallback {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
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
  fromJSON(object: any): ReinvestCallback {
    return {
      reinvestAmount: isSet(object.reinvestAmount)
        ? Coin.fromJSON(object.reinvestAmount)
        : undefined,
      hostZoneId: isSet(object.hostZoneId) ? String(object.hostZoneId) : '',
    };
  },
  toJSON(message: ReinvestCallback): JsonSafe<ReinvestCallback> {
    const obj: any = {};
    message.reinvestAmount !== undefined &&
      (obj.reinvestAmount = message.reinvestAmount
        ? Coin.toJSON(message.reinvestAmount)
        : undefined);
    message.hostZoneId !== undefined && (obj.hostZoneId = message.hostZoneId);
    return obj;
  },
  fromPartial(object: Partial<ReinvestCallback>): ReinvestCallback {
    const message = createBaseReinvestCallback();
    message.reinvestAmount =
      object.reinvestAmount !== undefined && object.reinvestAmount !== null
        ? Coin.fromPartial(object.reinvestAmount)
        : undefined;
    message.hostZoneId = object.hostZoneId ?? '';
    return message;
  },
  fromProtoMsg(message: ReinvestCallbackProtoMsg): ReinvestCallback {
    return ReinvestCallback.decode(message.value);
  },
  toProto(message: ReinvestCallback): Uint8Array {
    return ReinvestCallback.encode(message).finish();
  },
  toProtoMsg(message: ReinvestCallback): ReinvestCallbackProtoMsg {
    return {
      typeUrl: '/stride.stakeibc.ReinvestCallback',
      value: ReinvestCallback.encode(message).finish(),
    };
  },
};
function createBaseUndelegateCallback(): UndelegateCallback {
  return {
    hostZoneId: '',
    splitUndelegations: [],
    epochUnbondingRecordIds: [],
  };
}
export const UndelegateCallback = {
  typeUrl: '/stride.stakeibc.UndelegateCallback',
  encode(
    message: UndelegateCallback,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.hostZoneId !== '') {
      writer.uint32(10).string(message.hostZoneId);
    }
    for (const v of message.splitUndelegations) {
      SplitUndelegation.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    writer.uint32(26).fork();
    for (const v of message.epochUnbondingRecordIds) {
      writer.uint64(v);
    }
    writer.ldelim();
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): UndelegateCallback {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUndelegateCallback();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.hostZoneId = reader.string();
          break;
        case 2:
          message.splitUndelegations.push(
            SplitUndelegation.decode(reader, reader.uint32()),
          );
          break;
        case 3:
          if ((tag & 7) === 2) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.epochUnbondingRecordIds.push(reader.uint64());
            }
          } else {
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
  fromJSON(object: any): UndelegateCallback {
    return {
      hostZoneId: isSet(object.hostZoneId) ? String(object.hostZoneId) : '',
      splitUndelegations: Array.isArray(object?.splitUndelegations)
        ? object.splitUndelegations.map((e: any) =>
            SplitUndelegation.fromJSON(e),
          )
        : [],
      epochUnbondingRecordIds: Array.isArray(object?.epochUnbondingRecordIds)
        ? object.epochUnbondingRecordIds.map((e: any) => BigInt(e.toString()))
        : [],
    };
  },
  toJSON(message: UndelegateCallback): JsonSafe<UndelegateCallback> {
    const obj: any = {};
    message.hostZoneId !== undefined && (obj.hostZoneId = message.hostZoneId);
    if (message.splitUndelegations) {
      obj.splitUndelegations = message.splitUndelegations.map(e =>
        e ? SplitUndelegation.toJSON(e) : undefined,
      );
    } else {
      obj.splitUndelegations = [];
    }
    if (message.epochUnbondingRecordIds) {
      obj.epochUnbondingRecordIds = message.epochUnbondingRecordIds.map(e =>
        (e || BigInt(0)).toString(),
      );
    } else {
      obj.epochUnbondingRecordIds = [];
    }
    return obj;
  },
  fromPartial(object: Partial<UndelegateCallback>): UndelegateCallback {
    const message = createBaseUndelegateCallback();
    message.hostZoneId = object.hostZoneId ?? '';
    message.splitUndelegations =
      object.splitUndelegations?.map(e => SplitUndelegation.fromPartial(e)) ||
      [];
    message.epochUnbondingRecordIds =
      object.epochUnbondingRecordIds?.map(e => BigInt(e.toString())) || [];
    return message;
  },
  fromProtoMsg(message: UndelegateCallbackProtoMsg): UndelegateCallback {
    return UndelegateCallback.decode(message.value);
  },
  toProto(message: UndelegateCallback): Uint8Array {
    return UndelegateCallback.encode(message).finish();
  },
  toProtoMsg(message: UndelegateCallback): UndelegateCallbackProtoMsg {
    return {
      typeUrl: '/stride.stakeibc.UndelegateCallback',
      value: UndelegateCallback.encode(message).finish(),
    };
  },
};
function createBaseRedemptionCallback(): RedemptionCallback {
  return {
    hostZoneId: '',
    epochUnbondingRecordIds: [],
  };
}
export const RedemptionCallback = {
  typeUrl: '/stride.stakeibc.RedemptionCallback',
  encode(
    message: RedemptionCallback,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
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
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): RedemptionCallback {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
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
          } else {
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
  fromJSON(object: any): RedemptionCallback {
    return {
      hostZoneId: isSet(object.hostZoneId) ? String(object.hostZoneId) : '',
      epochUnbondingRecordIds: Array.isArray(object?.epochUnbondingRecordIds)
        ? object.epochUnbondingRecordIds.map((e: any) => BigInt(e.toString()))
        : [],
    };
  },
  toJSON(message: RedemptionCallback): JsonSafe<RedemptionCallback> {
    const obj: any = {};
    message.hostZoneId !== undefined && (obj.hostZoneId = message.hostZoneId);
    if (message.epochUnbondingRecordIds) {
      obj.epochUnbondingRecordIds = message.epochUnbondingRecordIds.map(e =>
        (e || BigInt(0)).toString(),
      );
    } else {
      obj.epochUnbondingRecordIds = [];
    }
    return obj;
  },
  fromPartial(object: Partial<RedemptionCallback>): RedemptionCallback {
    const message = createBaseRedemptionCallback();
    message.hostZoneId = object.hostZoneId ?? '';
    message.epochUnbondingRecordIds =
      object.epochUnbondingRecordIds?.map(e => BigInt(e.toString())) || [];
    return message;
  },
  fromProtoMsg(message: RedemptionCallbackProtoMsg): RedemptionCallback {
    return RedemptionCallback.decode(message.value);
  },
  toProto(message: RedemptionCallback): Uint8Array {
    return RedemptionCallback.encode(message).finish();
  },
  toProtoMsg(message: RedemptionCallback): RedemptionCallbackProtoMsg {
    return {
      typeUrl: '/stride.stakeibc.RedemptionCallback',
      value: RedemptionCallback.encode(message).finish(),
    };
  },
};
function createBaseRebalancing(): Rebalancing {
  return {
    srcValidator: '',
    dstValidator: '',
    amt: '',
  };
}
export const Rebalancing = {
  typeUrl: '/stride.stakeibc.Rebalancing',
  encode(
    message: Rebalancing,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
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
  decode(input: BinaryReader | Uint8Array, length?: number): Rebalancing {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
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
  fromJSON(object: any): Rebalancing {
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
  toJSON(message: Rebalancing): JsonSafe<Rebalancing> {
    const obj: any = {};
    message.srcValidator !== undefined &&
      (obj.srcValidator = message.srcValidator);
    message.dstValidator !== undefined &&
      (obj.dstValidator = message.dstValidator);
    message.amt !== undefined && (obj.amt = message.amt);
    return obj;
  },
  fromPartial(object: Partial<Rebalancing>): Rebalancing {
    const message = createBaseRebalancing();
    message.srcValidator = object.srcValidator ?? '';
    message.dstValidator = object.dstValidator ?? '';
    message.amt = object.amt ?? '';
    return message;
  },
  fromProtoMsg(message: RebalancingProtoMsg): Rebalancing {
    return Rebalancing.decode(message.value);
  },
  toProto(message: Rebalancing): Uint8Array {
    return Rebalancing.encode(message).finish();
  },
  toProtoMsg(message: Rebalancing): RebalancingProtoMsg {
    return {
      typeUrl: '/stride.stakeibc.Rebalancing',
      value: Rebalancing.encode(message).finish(),
    };
  },
};
function createBaseRebalanceCallback(): RebalanceCallback {
  return {
    hostZoneId: '',
    rebalancings: [],
  };
}
export const RebalanceCallback = {
  typeUrl: '/stride.stakeibc.RebalanceCallback',
  encode(
    message: RebalanceCallback,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.hostZoneId !== '') {
      writer.uint32(10).string(message.hostZoneId);
    }
    for (const v of message.rebalancings) {
      Rebalancing.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): RebalanceCallback {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRebalanceCallback();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.hostZoneId = reader.string();
          break;
        case 2:
          message.rebalancings.push(
            Rebalancing.decode(reader, reader.uint32()),
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): RebalanceCallback {
    return {
      hostZoneId: isSet(object.hostZoneId) ? String(object.hostZoneId) : '',
      rebalancings: Array.isArray(object?.rebalancings)
        ? object.rebalancings.map((e: any) => Rebalancing.fromJSON(e))
        : [],
    };
  },
  toJSON(message: RebalanceCallback): JsonSafe<RebalanceCallback> {
    const obj: any = {};
    message.hostZoneId !== undefined && (obj.hostZoneId = message.hostZoneId);
    if (message.rebalancings) {
      obj.rebalancings = message.rebalancings.map(e =>
        e ? Rebalancing.toJSON(e) : undefined,
      );
    } else {
      obj.rebalancings = [];
    }
    return obj;
  },
  fromPartial(object: Partial<RebalanceCallback>): RebalanceCallback {
    const message = createBaseRebalanceCallback();
    message.hostZoneId = object.hostZoneId ?? '';
    message.rebalancings =
      object.rebalancings?.map(e => Rebalancing.fromPartial(e)) || [];
    return message;
  },
  fromProtoMsg(message: RebalanceCallbackProtoMsg): RebalanceCallback {
    return RebalanceCallback.decode(message.value);
  },
  toProto(message: RebalanceCallback): Uint8Array {
    return RebalanceCallback.encode(message).finish();
  },
  toProtoMsg(message: RebalanceCallback): RebalanceCallbackProtoMsg {
    return {
      typeUrl: '/stride.stakeibc.RebalanceCallback',
      value: RebalanceCallback.encode(message).finish(),
    };
  },
};
function createBaseDetokenizeSharesCallback(): DetokenizeSharesCallback {
  return {
    deposit: undefined,
  };
}
export const DetokenizeSharesCallback = {
  typeUrl: '/stride.stakeibc.DetokenizeSharesCallback',
  encode(
    message: DetokenizeSharesCallback,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.deposit !== undefined) {
      LSMTokenDeposit.encode(
        message.deposit,
        writer.uint32(10).fork(),
      ).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): DetokenizeSharesCallback {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
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
  fromJSON(object: any): DetokenizeSharesCallback {
    return {
      deposit: isSet(object.deposit)
        ? LSMTokenDeposit.fromJSON(object.deposit)
        : undefined,
    };
  },
  toJSON(
    message: DetokenizeSharesCallback,
  ): JsonSafe<DetokenizeSharesCallback> {
    const obj: any = {};
    message.deposit !== undefined &&
      (obj.deposit = message.deposit
        ? LSMTokenDeposit.toJSON(message.deposit)
        : undefined);
    return obj;
  },
  fromPartial(
    object: Partial<DetokenizeSharesCallback>,
  ): DetokenizeSharesCallback {
    const message = createBaseDetokenizeSharesCallback();
    message.deposit =
      object.deposit !== undefined && object.deposit !== null
        ? LSMTokenDeposit.fromPartial(object.deposit)
        : undefined;
    return message;
  },
  fromProtoMsg(
    message: DetokenizeSharesCallbackProtoMsg,
  ): DetokenizeSharesCallback {
    return DetokenizeSharesCallback.decode(message.value);
  },
  toProto(message: DetokenizeSharesCallback): Uint8Array {
    return DetokenizeSharesCallback.encode(message).finish();
  },
  toProtoMsg(
    message: DetokenizeSharesCallback,
  ): DetokenizeSharesCallbackProtoMsg {
    return {
      typeUrl: '/stride.stakeibc.DetokenizeSharesCallback',
      value: DetokenizeSharesCallback.encode(message).finish(),
    };
  },
};
function createBaseLSMLiquidStake(): LSMLiquidStake {
  return {
    deposit: undefined,
    hostZone: undefined,
    validator: undefined,
  };
}
export const LSMLiquidStake = {
  typeUrl: '/stride.stakeibc.LSMLiquidStake',
  encode(
    message: LSMLiquidStake,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.deposit !== undefined) {
      LSMTokenDeposit.encode(
        message.deposit,
        writer.uint32(10).fork(),
      ).ldelim();
    }
    if (message.hostZone !== undefined) {
      HostZone.encode(message.hostZone, writer.uint32(18).fork()).ldelim();
    }
    if (message.validator !== undefined) {
      Validator.encode(message.validator, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): LSMLiquidStake {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
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
  fromJSON(object: any): LSMLiquidStake {
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
  toJSON(message: LSMLiquidStake): JsonSafe<LSMLiquidStake> {
    const obj: any = {};
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
  fromPartial(object: Partial<LSMLiquidStake>): LSMLiquidStake {
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
  fromProtoMsg(message: LSMLiquidStakeProtoMsg): LSMLiquidStake {
    return LSMLiquidStake.decode(message.value);
  },
  toProto(message: LSMLiquidStake): Uint8Array {
    return LSMLiquidStake.encode(message).finish();
  },
  toProtoMsg(message: LSMLiquidStake): LSMLiquidStakeProtoMsg {
    return {
      typeUrl: '/stride.stakeibc.LSMLiquidStake',
      value: LSMLiquidStake.encode(message).finish(),
    };
  },
};
function createBaseValidatorSharesToTokensQueryCallback(): ValidatorSharesToTokensQueryCallback {
  return {
    lsmLiquidStake: undefined,
  };
}
export const ValidatorSharesToTokensQueryCallback = {
  typeUrl: '/stride.stakeibc.ValidatorSharesToTokensQueryCallback',
  encode(
    message: ValidatorSharesToTokensQueryCallback,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.lsmLiquidStake !== undefined) {
      LSMLiquidStake.encode(
        message.lsmLiquidStake,
        writer.uint32(10).fork(),
      ).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): ValidatorSharesToTokensQueryCallback {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseValidatorSharesToTokensQueryCallback();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.lsmLiquidStake = LSMLiquidStake.decode(
            reader,
            reader.uint32(),
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): ValidatorSharesToTokensQueryCallback {
    return {
      lsmLiquidStake: isSet(object.lsmLiquidStake)
        ? LSMLiquidStake.fromJSON(object.lsmLiquidStake)
        : undefined,
    };
  },
  toJSON(
    message: ValidatorSharesToTokensQueryCallback,
  ): JsonSafe<ValidatorSharesToTokensQueryCallback> {
    const obj: any = {};
    message.lsmLiquidStake !== undefined &&
      (obj.lsmLiquidStake = message.lsmLiquidStake
        ? LSMLiquidStake.toJSON(message.lsmLiquidStake)
        : undefined);
    return obj;
  },
  fromPartial(
    object: Partial<ValidatorSharesToTokensQueryCallback>,
  ): ValidatorSharesToTokensQueryCallback {
    const message = createBaseValidatorSharesToTokensQueryCallback();
    message.lsmLiquidStake =
      object.lsmLiquidStake !== undefined && object.lsmLiquidStake !== null
        ? LSMLiquidStake.fromPartial(object.lsmLiquidStake)
        : undefined;
    return message;
  },
  fromProtoMsg(
    message: ValidatorSharesToTokensQueryCallbackProtoMsg,
  ): ValidatorSharesToTokensQueryCallback {
    return ValidatorSharesToTokensQueryCallback.decode(message.value);
  },
  toProto(message: ValidatorSharesToTokensQueryCallback): Uint8Array {
    return ValidatorSharesToTokensQueryCallback.encode(message).finish();
  },
  toProtoMsg(
    message: ValidatorSharesToTokensQueryCallback,
  ): ValidatorSharesToTokensQueryCallbackProtoMsg {
    return {
      typeUrl: '/stride.stakeibc.ValidatorSharesToTokensQueryCallback',
      value: ValidatorSharesToTokensQueryCallback.encode(message).finish(),
    };
  },
};
function createBaseDelegatorSharesQueryCallback(): DelegatorSharesQueryCallback {
  return {
    initialValidatorDelegation: '',
  };
}
export const DelegatorSharesQueryCallback = {
  typeUrl: '/stride.stakeibc.DelegatorSharesQueryCallback',
  encode(
    message: DelegatorSharesQueryCallback,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.initialValidatorDelegation !== '') {
      writer.uint32(10).string(message.initialValidatorDelegation);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): DelegatorSharesQueryCallback {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
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
  fromJSON(object: any): DelegatorSharesQueryCallback {
    return {
      initialValidatorDelegation: isSet(object.initialValidatorDelegation)
        ? String(object.initialValidatorDelegation)
        : '',
    };
  },
  toJSON(
    message: DelegatorSharesQueryCallback,
  ): JsonSafe<DelegatorSharesQueryCallback> {
    const obj: any = {};
    message.initialValidatorDelegation !== undefined &&
      (obj.initialValidatorDelegation = message.initialValidatorDelegation);
    return obj;
  },
  fromPartial(
    object: Partial<DelegatorSharesQueryCallback>,
  ): DelegatorSharesQueryCallback {
    const message = createBaseDelegatorSharesQueryCallback();
    message.initialValidatorDelegation =
      object.initialValidatorDelegation ?? '';
    return message;
  },
  fromProtoMsg(
    message: DelegatorSharesQueryCallbackProtoMsg,
  ): DelegatorSharesQueryCallback {
    return DelegatorSharesQueryCallback.decode(message.value);
  },
  toProto(message: DelegatorSharesQueryCallback): Uint8Array {
    return DelegatorSharesQueryCallback.encode(message).finish();
  },
  toProtoMsg(
    message: DelegatorSharesQueryCallback,
  ): DelegatorSharesQueryCallbackProtoMsg {
    return {
      typeUrl: '/stride.stakeibc.DelegatorSharesQueryCallback',
      value: DelegatorSharesQueryCallback.encode(message).finish(),
    };
  },
};
function createBaseCommunityPoolBalanceQueryCallback(): CommunityPoolBalanceQueryCallback {
  return {
    icaType: 0,
    denom: '',
  };
}
export const CommunityPoolBalanceQueryCallback = {
  typeUrl: '/stride.stakeibc.CommunityPoolBalanceQueryCallback',
  encode(
    message: CommunityPoolBalanceQueryCallback,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.icaType !== 0) {
      writer.uint32(8).int32(message.icaType);
    }
    if (message.denom !== '') {
      writer.uint32(18).string(message.denom);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): CommunityPoolBalanceQueryCallback {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommunityPoolBalanceQueryCallback();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.icaType = reader.int32() as any;
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
  fromJSON(object: any): CommunityPoolBalanceQueryCallback {
    return {
      icaType: isSet(object.icaType)
        ? iCAAccountTypeFromJSON(object.icaType)
        : -1,
      denom: isSet(object.denom) ? String(object.denom) : '',
    };
  },
  toJSON(
    message: CommunityPoolBalanceQueryCallback,
  ): JsonSafe<CommunityPoolBalanceQueryCallback> {
    const obj: any = {};
    message.icaType !== undefined &&
      (obj.icaType = iCAAccountTypeToJSON(message.icaType));
    message.denom !== undefined && (obj.denom = message.denom);
    return obj;
  },
  fromPartial(
    object: Partial<CommunityPoolBalanceQueryCallback>,
  ): CommunityPoolBalanceQueryCallback {
    const message = createBaseCommunityPoolBalanceQueryCallback();
    message.icaType = object.icaType ?? 0;
    message.denom = object.denom ?? '';
    return message;
  },
  fromProtoMsg(
    message: CommunityPoolBalanceQueryCallbackProtoMsg,
  ): CommunityPoolBalanceQueryCallback {
    return CommunityPoolBalanceQueryCallback.decode(message.value);
  },
  toProto(message: CommunityPoolBalanceQueryCallback): Uint8Array {
    return CommunityPoolBalanceQueryCallback.encode(message).finish();
  },
  toProtoMsg(
    message: CommunityPoolBalanceQueryCallback,
  ): CommunityPoolBalanceQueryCallbackProtoMsg {
    return {
      typeUrl: '/stride.stakeibc.CommunityPoolBalanceQueryCallback',
      value: CommunityPoolBalanceQueryCallback.encode(message).finish(),
    };
  },
};
function createBaseTradeRouteCallback(): TradeRouteCallback {
  return {
    rewardDenom: '',
    hostDenom: '',
  };
}
export const TradeRouteCallback = {
  typeUrl: '/stride.stakeibc.TradeRouteCallback',
  encode(
    message: TradeRouteCallback,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.rewardDenom !== '') {
      writer.uint32(10).string(message.rewardDenom);
    }
    if (message.hostDenom !== '') {
      writer.uint32(18).string(message.hostDenom);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): TradeRouteCallback {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
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
  fromJSON(object: any): TradeRouteCallback {
    return {
      rewardDenom: isSet(object.rewardDenom) ? String(object.rewardDenom) : '',
      hostDenom: isSet(object.hostDenom) ? String(object.hostDenom) : '',
    };
  },
  toJSON(message: TradeRouteCallback): JsonSafe<TradeRouteCallback> {
    const obj: any = {};
    message.rewardDenom !== undefined &&
      (obj.rewardDenom = message.rewardDenom);
    message.hostDenom !== undefined && (obj.hostDenom = message.hostDenom);
    return obj;
  },
  fromPartial(object: Partial<TradeRouteCallback>): TradeRouteCallback {
    const message = createBaseTradeRouteCallback();
    message.rewardDenom = object.rewardDenom ?? '';
    message.hostDenom = object.hostDenom ?? '';
    return message;
  },
  fromProtoMsg(message: TradeRouteCallbackProtoMsg): TradeRouteCallback {
    return TradeRouteCallback.decode(message.value);
  },
  toProto(message: TradeRouteCallback): Uint8Array {
    return TradeRouteCallback.encode(message).finish();
  },
  toProtoMsg(message: TradeRouteCallback): TradeRouteCallbackProtoMsg {
    return {
      typeUrl: '/stride.stakeibc.TradeRouteCallback',
      value: TradeRouteCallback.encode(message).finish(),
    };
  },
};
