//@ts-nocheck
import {
  BaseAccount,
  type BaseAccountSDKType,
} from '../../auth/v1beta1/auth.js';
import { Coin, type CoinSDKType } from '../../base/v1beta1/coin.js';
import { BinaryReader, BinaryWriter } from '../../../binary.js';
import { isSet } from '../../../helpers.js';
import { type JsonSafe } from '../../../json-safe.js';
/**
 * BaseVestingAccount implements the VestingAccount interface. It contains all
 * the necessary fields needed for any vesting account implementation.
 */
export interface BaseVestingAccount {
  baseAccount?: BaseAccount;
  originalVesting: Coin[];
  delegatedFree: Coin[];
  delegatedVesting: Coin[];
  /** Vesting end time, as unix timestamp (in seconds). */
  endTime: bigint;
}
export interface BaseVestingAccountProtoMsg {
  typeUrl: '/cosmos.vesting.v1beta1.BaseVestingAccount';
  value: Uint8Array;
}
/**
 * BaseVestingAccount implements the VestingAccount interface. It contains all
 * the necessary fields needed for any vesting account implementation.
 */
export interface BaseVestingAccountSDKType {
  base_account?: BaseAccountSDKType;
  original_vesting: CoinSDKType[];
  delegated_free: CoinSDKType[];
  delegated_vesting: CoinSDKType[];
  end_time: bigint;
}
/**
 * ContinuousVestingAccount implements the VestingAccount interface. It
 * continuously vests by unlocking coins linearly with respect to time.
 */
export interface ContinuousVestingAccount {
  baseVestingAccount?: BaseVestingAccount;
  /** Vesting start time, as unix timestamp (in seconds). */
  startTime: bigint;
}
export interface ContinuousVestingAccountProtoMsg {
  typeUrl: '/cosmos.vesting.v1beta1.ContinuousVestingAccount';
  value: Uint8Array;
}
/**
 * ContinuousVestingAccount implements the VestingAccount interface. It
 * continuously vests by unlocking coins linearly with respect to time.
 */
export interface ContinuousVestingAccountSDKType {
  base_vesting_account?: BaseVestingAccountSDKType;
  start_time: bigint;
}
/**
 * DelayedVestingAccount implements the VestingAccount interface. It vests all
 * coins after a specific time, but non prior. In other words, it keeps them
 * locked until a specified time.
 */
export interface DelayedVestingAccount {
  baseVestingAccount?: BaseVestingAccount;
}
export interface DelayedVestingAccountProtoMsg {
  typeUrl: '/cosmos.vesting.v1beta1.DelayedVestingAccount';
  value: Uint8Array;
}
/**
 * DelayedVestingAccount implements the VestingAccount interface. It vests all
 * coins after a specific time, but non prior. In other words, it keeps them
 * locked until a specified time.
 */
export interface DelayedVestingAccountSDKType {
  base_vesting_account?: BaseVestingAccountSDKType;
}
/**
 * Period defines a length of time and amount of coins that will vest.
 * A sequence of periods defines a sequence of vesting events, with the
 * first period relative to an externally-provided start time,
 * and subsequent periods relatie to their predecessor.
 */
export interface Period {
  /** Period duration in seconds. */
  length: bigint;
  amount: Coin[];
}
export interface PeriodProtoMsg {
  typeUrl: '/cosmos.vesting.v1beta1.Period';
  value: Uint8Array;
}
/**
 * Period defines a length of time and amount of coins that will vest.
 * A sequence of periods defines a sequence of vesting events, with the
 * first period relative to an externally-provided start time,
 * and subsequent periods relatie to their predecessor.
 */
export interface PeriodSDKType {
  length: bigint;
  amount: CoinSDKType[];
}
/**
 * PeriodicVestingAccount implements the VestingAccount interface. It
 * periodically vests by unlocking coins during each specified period.
 */
export interface PeriodicVestingAccount {
  baseVestingAccount?: BaseVestingAccount;
  startTime: bigint;
  vestingPeriods: Period[];
}
export interface PeriodicVestingAccountProtoMsg {
  typeUrl: '/cosmos.vesting.v1beta1.PeriodicVestingAccount';
  value: Uint8Array;
}
/**
 * PeriodicVestingAccount implements the VestingAccount interface. It
 * periodically vests by unlocking coins during each specified period.
 */
export interface PeriodicVestingAccountSDKType {
  base_vesting_account?: BaseVestingAccountSDKType;
  start_time: bigint;
  vesting_periods: PeriodSDKType[];
}
/**
 * PermanentLockedAccount implements the VestingAccount interface. It does
 * not ever release coins, locking them indefinitely. Coins in this account can
 * still be used for delegating and for governance votes even while locked.
 *
 * Since: cosmos-sdk 0.43
 */
export interface PermanentLockedAccount {
  baseVestingAccount?: BaseVestingAccount;
}
export interface PermanentLockedAccountProtoMsg {
  typeUrl: '/cosmos.vesting.v1beta1.PermanentLockedAccount';
  value: Uint8Array;
}
/**
 * PermanentLockedAccount implements the VestingAccount interface. It does
 * not ever release coins, locking them indefinitely. Coins in this account can
 * still be used for delegating and for governance votes even while locked.
 *
 * Since: cosmos-sdk 0.43
 */
export interface PermanentLockedAccountSDKType {
  base_vesting_account?: BaseVestingAccountSDKType;
}
/**
 * ClawbackVestingAccount implements the VestingAccount interface. It provides
 * an account that can hold contributions subject to "lockup" (like a
 * PeriodicVestingAccount), or vesting which is subject to clawback
 * of unvested tokens, or a combination (tokens vest, but are still locked).
 */
export interface ClawbackVestingAccount {
  baseVestingAccount?: BaseVestingAccount;
  /** funder_address specifies the account which can perform clawback. */
  funderAddress: string;
  startTime: bigint;
  /** unlocking schedule relative to the BaseVestingAccount start_time. */
  lockupPeriods: Period[];
  /** vesting (i.e. immunity from clawback) schedule relative to the BaseVestingAccount start_time. */
  vestingPeriods: Period[];
}
export interface ClawbackVestingAccountProtoMsg {
  typeUrl: '/cosmos.vesting.v1beta1.ClawbackVestingAccount';
  value: Uint8Array;
}
/**
 * ClawbackVestingAccount implements the VestingAccount interface. It provides
 * an account that can hold contributions subject to "lockup" (like a
 * PeriodicVestingAccount), or vesting which is subject to clawback
 * of unvested tokens, or a combination (tokens vest, but are still locked).
 */
export interface ClawbackVestingAccountSDKType {
  base_vesting_account?: BaseVestingAccountSDKType;
  funder_address: string;
  start_time: bigint;
  lockup_periods: PeriodSDKType[];
  vesting_periods: PeriodSDKType[];
}
function createBaseBaseVestingAccount(): BaseVestingAccount {
  return {
    baseAccount: undefined,
    originalVesting: [],
    delegatedFree: [],
    delegatedVesting: [],
    endTime: BigInt(0),
  };
}
export const BaseVestingAccount = {
  typeUrl: '/cosmos.vesting.v1beta1.BaseVestingAccount',
  encode(
    message: BaseVestingAccount,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.baseAccount !== undefined) {
      BaseAccount.encode(
        message.baseAccount,
        writer.uint32(10).fork(),
      ).ldelim();
    }
    for (const v of message.originalVesting) {
      Coin.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    for (const v of message.delegatedFree) {
      Coin.encode(v!, writer.uint32(26).fork()).ldelim();
    }
    for (const v of message.delegatedVesting) {
      Coin.encode(v!, writer.uint32(34).fork()).ldelim();
    }
    if (message.endTime !== BigInt(0)) {
      writer.uint32(40).int64(message.endTime);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): BaseVestingAccount {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBaseVestingAccount();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.baseAccount = BaseAccount.decode(reader, reader.uint32());
          break;
        case 2:
          message.originalVesting.push(Coin.decode(reader, reader.uint32()));
          break;
        case 3:
          message.delegatedFree.push(Coin.decode(reader, reader.uint32()));
          break;
        case 4:
          message.delegatedVesting.push(Coin.decode(reader, reader.uint32()));
          break;
        case 5:
          message.endTime = reader.int64();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): BaseVestingAccount {
    return {
      baseAccount: isSet(object.baseAccount)
        ? BaseAccount.fromJSON(object.baseAccount)
        : undefined,
      originalVesting: Array.isArray(object?.originalVesting)
        ? object.originalVesting.map((e: any) => Coin.fromJSON(e))
        : [],
      delegatedFree: Array.isArray(object?.delegatedFree)
        ? object.delegatedFree.map((e: any) => Coin.fromJSON(e))
        : [],
      delegatedVesting: Array.isArray(object?.delegatedVesting)
        ? object.delegatedVesting.map((e: any) => Coin.fromJSON(e))
        : [],
      endTime: isSet(object.endTime)
        ? BigInt(object.endTime.toString())
        : BigInt(0),
    };
  },
  toJSON(message: BaseVestingAccount): JsonSafe<BaseVestingAccount> {
    const obj: any = {};
    message.baseAccount !== undefined &&
      (obj.baseAccount = message.baseAccount
        ? BaseAccount.toJSON(message.baseAccount)
        : undefined);
    if (message.originalVesting) {
      obj.originalVesting = message.originalVesting.map(e =>
        e ? Coin.toJSON(e) : undefined,
      );
    } else {
      obj.originalVesting = [];
    }
    if (message.delegatedFree) {
      obj.delegatedFree = message.delegatedFree.map(e =>
        e ? Coin.toJSON(e) : undefined,
      );
    } else {
      obj.delegatedFree = [];
    }
    if (message.delegatedVesting) {
      obj.delegatedVesting = message.delegatedVesting.map(e =>
        e ? Coin.toJSON(e) : undefined,
      );
    } else {
      obj.delegatedVesting = [];
    }
    message.endTime !== undefined &&
      (obj.endTime = (message.endTime || BigInt(0)).toString());
    return obj;
  },
  fromPartial(object: Partial<BaseVestingAccount>): BaseVestingAccount {
    const message = createBaseBaseVestingAccount();
    message.baseAccount =
      object.baseAccount !== undefined && object.baseAccount !== null
        ? BaseAccount.fromPartial(object.baseAccount)
        : undefined;
    message.originalVesting =
      object.originalVesting?.map(e => Coin.fromPartial(e)) || [];
    message.delegatedFree =
      object.delegatedFree?.map(e => Coin.fromPartial(e)) || [];
    message.delegatedVesting =
      object.delegatedVesting?.map(e => Coin.fromPartial(e)) || [];
    message.endTime =
      object.endTime !== undefined && object.endTime !== null
        ? BigInt(object.endTime.toString())
        : BigInt(0);
    return message;
  },
  fromProtoMsg(message: BaseVestingAccountProtoMsg): BaseVestingAccount {
    return BaseVestingAccount.decode(message.value);
  },
  toProto(message: BaseVestingAccount): Uint8Array {
    return BaseVestingAccount.encode(message).finish();
  },
  toProtoMsg(message: BaseVestingAccount): BaseVestingAccountProtoMsg {
    return {
      typeUrl: '/cosmos.vesting.v1beta1.BaseVestingAccount',
      value: BaseVestingAccount.encode(message).finish(),
    };
  },
};
function createBaseContinuousVestingAccount(): ContinuousVestingAccount {
  return {
    baseVestingAccount: undefined,
    startTime: BigInt(0),
  };
}
export const ContinuousVestingAccount = {
  typeUrl: '/cosmos.vesting.v1beta1.ContinuousVestingAccount',
  encode(
    message: ContinuousVestingAccount,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.baseVestingAccount !== undefined) {
      BaseVestingAccount.encode(
        message.baseVestingAccount,
        writer.uint32(10).fork(),
      ).ldelim();
    }
    if (message.startTime !== BigInt(0)) {
      writer.uint32(16).int64(message.startTime);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): ContinuousVestingAccount {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseContinuousVestingAccount();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.baseVestingAccount = BaseVestingAccount.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 2:
          message.startTime = reader.int64();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): ContinuousVestingAccount {
    return {
      baseVestingAccount: isSet(object.baseVestingAccount)
        ? BaseVestingAccount.fromJSON(object.baseVestingAccount)
        : undefined,
      startTime: isSet(object.startTime)
        ? BigInt(object.startTime.toString())
        : BigInt(0),
    };
  },
  toJSON(
    message: ContinuousVestingAccount,
  ): JsonSafe<ContinuousVestingAccount> {
    const obj: any = {};
    message.baseVestingAccount !== undefined &&
      (obj.baseVestingAccount = message.baseVestingAccount
        ? BaseVestingAccount.toJSON(message.baseVestingAccount)
        : undefined);
    message.startTime !== undefined &&
      (obj.startTime = (message.startTime || BigInt(0)).toString());
    return obj;
  },
  fromPartial(
    object: Partial<ContinuousVestingAccount>,
  ): ContinuousVestingAccount {
    const message = createBaseContinuousVestingAccount();
    message.baseVestingAccount =
      object.baseVestingAccount !== undefined &&
      object.baseVestingAccount !== null
        ? BaseVestingAccount.fromPartial(object.baseVestingAccount)
        : undefined;
    message.startTime =
      object.startTime !== undefined && object.startTime !== null
        ? BigInt(object.startTime.toString())
        : BigInt(0);
    return message;
  },
  fromProtoMsg(
    message: ContinuousVestingAccountProtoMsg,
  ): ContinuousVestingAccount {
    return ContinuousVestingAccount.decode(message.value);
  },
  toProto(message: ContinuousVestingAccount): Uint8Array {
    return ContinuousVestingAccount.encode(message).finish();
  },
  toProtoMsg(
    message: ContinuousVestingAccount,
  ): ContinuousVestingAccountProtoMsg {
    return {
      typeUrl: '/cosmos.vesting.v1beta1.ContinuousVestingAccount',
      value: ContinuousVestingAccount.encode(message).finish(),
    };
  },
};
function createBaseDelayedVestingAccount(): DelayedVestingAccount {
  return {
    baseVestingAccount: undefined,
  };
}
export const DelayedVestingAccount = {
  typeUrl: '/cosmos.vesting.v1beta1.DelayedVestingAccount',
  encode(
    message: DelayedVestingAccount,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.baseVestingAccount !== undefined) {
      BaseVestingAccount.encode(
        message.baseVestingAccount,
        writer.uint32(10).fork(),
      ).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): DelayedVestingAccount {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDelayedVestingAccount();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.baseVestingAccount = BaseVestingAccount.decode(
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
  fromJSON(object: any): DelayedVestingAccount {
    return {
      baseVestingAccount: isSet(object.baseVestingAccount)
        ? BaseVestingAccount.fromJSON(object.baseVestingAccount)
        : undefined,
    };
  },
  toJSON(message: DelayedVestingAccount): JsonSafe<DelayedVestingAccount> {
    const obj: any = {};
    message.baseVestingAccount !== undefined &&
      (obj.baseVestingAccount = message.baseVestingAccount
        ? BaseVestingAccount.toJSON(message.baseVestingAccount)
        : undefined);
    return obj;
  },
  fromPartial(object: Partial<DelayedVestingAccount>): DelayedVestingAccount {
    const message = createBaseDelayedVestingAccount();
    message.baseVestingAccount =
      object.baseVestingAccount !== undefined &&
      object.baseVestingAccount !== null
        ? BaseVestingAccount.fromPartial(object.baseVestingAccount)
        : undefined;
    return message;
  },
  fromProtoMsg(message: DelayedVestingAccountProtoMsg): DelayedVestingAccount {
    return DelayedVestingAccount.decode(message.value);
  },
  toProto(message: DelayedVestingAccount): Uint8Array {
    return DelayedVestingAccount.encode(message).finish();
  },
  toProtoMsg(message: DelayedVestingAccount): DelayedVestingAccountProtoMsg {
    return {
      typeUrl: '/cosmos.vesting.v1beta1.DelayedVestingAccount',
      value: DelayedVestingAccount.encode(message).finish(),
    };
  },
};
function createBasePeriod(): Period {
  return {
    length: BigInt(0),
    amount: [],
  };
}
export const Period = {
  typeUrl: '/cosmos.vesting.v1beta1.Period',
  encode(
    message: Period,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.length !== BigInt(0)) {
      writer.uint32(8).int64(message.length);
    }
    for (const v of message.amount) {
      Coin.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): Period {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePeriod();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.length = reader.int64();
          break;
        case 2:
          message.amount.push(Coin.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): Period {
    return {
      length: isSet(object.length)
        ? BigInt(object.length.toString())
        : BigInt(0),
      amount: Array.isArray(object?.amount)
        ? object.amount.map((e: any) => Coin.fromJSON(e))
        : [],
    };
  },
  toJSON(message: Period): JsonSafe<Period> {
    const obj: any = {};
    message.length !== undefined &&
      (obj.length = (message.length || BigInt(0)).toString());
    if (message.amount) {
      obj.amount = message.amount.map(e => (e ? Coin.toJSON(e) : undefined));
    } else {
      obj.amount = [];
    }
    return obj;
  },
  fromPartial(object: Partial<Period>): Period {
    const message = createBasePeriod();
    message.length =
      object.length !== undefined && object.length !== null
        ? BigInt(object.length.toString())
        : BigInt(0);
    message.amount = object.amount?.map(e => Coin.fromPartial(e)) || [];
    return message;
  },
  fromProtoMsg(message: PeriodProtoMsg): Period {
    return Period.decode(message.value);
  },
  toProto(message: Period): Uint8Array {
    return Period.encode(message).finish();
  },
  toProtoMsg(message: Period): PeriodProtoMsg {
    return {
      typeUrl: '/cosmos.vesting.v1beta1.Period',
      value: Period.encode(message).finish(),
    };
  },
};
function createBasePeriodicVestingAccount(): PeriodicVestingAccount {
  return {
    baseVestingAccount: undefined,
    startTime: BigInt(0),
    vestingPeriods: [],
  };
}
export const PeriodicVestingAccount = {
  typeUrl: '/cosmos.vesting.v1beta1.PeriodicVestingAccount',
  encode(
    message: PeriodicVestingAccount,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.baseVestingAccount !== undefined) {
      BaseVestingAccount.encode(
        message.baseVestingAccount,
        writer.uint32(10).fork(),
      ).ldelim();
    }
    if (message.startTime !== BigInt(0)) {
      writer.uint32(16).int64(message.startTime);
    }
    for (const v of message.vestingPeriods) {
      Period.encode(v!, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): PeriodicVestingAccount {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePeriodicVestingAccount();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.baseVestingAccount = BaseVestingAccount.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 2:
          message.startTime = reader.int64();
          break;
        case 3:
          message.vestingPeriods.push(Period.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): PeriodicVestingAccount {
    return {
      baseVestingAccount: isSet(object.baseVestingAccount)
        ? BaseVestingAccount.fromJSON(object.baseVestingAccount)
        : undefined,
      startTime: isSet(object.startTime)
        ? BigInt(object.startTime.toString())
        : BigInt(0),
      vestingPeriods: Array.isArray(object?.vestingPeriods)
        ? object.vestingPeriods.map((e: any) => Period.fromJSON(e))
        : [],
    };
  },
  toJSON(message: PeriodicVestingAccount): JsonSafe<PeriodicVestingAccount> {
    const obj: any = {};
    message.baseVestingAccount !== undefined &&
      (obj.baseVestingAccount = message.baseVestingAccount
        ? BaseVestingAccount.toJSON(message.baseVestingAccount)
        : undefined);
    message.startTime !== undefined &&
      (obj.startTime = (message.startTime || BigInt(0)).toString());
    if (message.vestingPeriods) {
      obj.vestingPeriods = message.vestingPeriods.map(e =>
        e ? Period.toJSON(e) : undefined,
      );
    } else {
      obj.vestingPeriods = [];
    }
    return obj;
  },
  fromPartial(object: Partial<PeriodicVestingAccount>): PeriodicVestingAccount {
    const message = createBasePeriodicVestingAccount();
    message.baseVestingAccount =
      object.baseVestingAccount !== undefined &&
      object.baseVestingAccount !== null
        ? BaseVestingAccount.fromPartial(object.baseVestingAccount)
        : undefined;
    message.startTime =
      object.startTime !== undefined && object.startTime !== null
        ? BigInt(object.startTime.toString())
        : BigInt(0);
    message.vestingPeriods =
      object.vestingPeriods?.map(e => Period.fromPartial(e)) || [];
    return message;
  },
  fromProtoMsg(
    message: PeriodicVestingAccountProtoMsg,
  ): PeriodicVestingAccount {
    return PeriodicVestingAccount.decode(message.value);
  },
  toProto(message: PeriodicVestingAccount): Uint8Array {
    return PeriodicVestingAccount.encode(message).finish();
  },
  toProtoMsg(message: PeriodicVestingAccount): PeriodicVestingAccountProtoMsg {
    return {
      typeUrl: '/cosmos.vesting.v1beta1.PeriodicVestingAccount',
      value: PeriodicVestingAccount.encode(message).finish(),
    };
  },
};
function createBasePermanentLockedAccount(): PermanentLockedAccount {
  return {
    baseVestingAccount: undefined,
  };
}
export const PermanentLockedAccount = {
  typeUrl: '/cosmos.vesting.v1beta1.PermanentLockedAccount',
  encode(
    message: PermanentLockedAccount,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.baseVestingAccount !== undefined) {
      BaseVestingAccount.encode(
        message.baseVestingAccount,
        writer.uint32(10).fork(),
      ).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): PermanentLockedAccount {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePermanentLockedAccount();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.baseVestingAccount = BaseVestingAccount.decode(
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
  fromJSON(object: any): PermanentLockedAccount {
    return {
      baseVestingAccount: isSet(object.baseVestingAccount)
        ? BaseVestingAccount.fromJSON(object.baseVestingAccount)
        : undefined,
    };
  },
  toJSON(message: PermanentLockedAccount): JsonSafe<PermanentLockedAccount> {
    const obj: any = {};
    message.baseVestingAccount !== undefined &&
      (obj.baseVestingAccount = message.baseVestingAccount
        ? BaseVestingAccount.toJSON(message.baseVestingAccount)
        : undefined);
    return obj;
  },
  fromPartial(object: Partial<PermanentLockedAccount>): PermanentLockedAccount {
    const message = createBasePermanentLockedAccount();
    message.baseVestingAccount =
      object.baseVestingAccount !== undefined &&
      object.baseVestingAccount !== null
        ? BaseVestingAccount.fromPartial(object.baseVestingAccount)
        : undefined;
    return message;
  },
  fromProtoMsg(
    message: PermanentLockedAccountProtoMsg,
  ): PermanentLockedAccount {
    return PermanentLockedAccount.decode(message.value);
  },
  toProto(message: PermanentLockedAccount): Uint8Array {
    return PermanentLockedAccount.encode(message).finish();
  },
  toProtoMsg(message: PermanentLockedAccount): PermanentLockedAccountProtoMsg {
    return {
      typeUrl: '/cosmos.vesting.v1beta1.PermanentLockedAccount',
      value: PermanentLockedAccount.encode(message).finish(),
    };
  },
};
function createBaseClawbackVestingAccount(): ClawbackVestingAccount {
  return {
    baseVestingAccount: undefined,
    funderAddress: '',
    startTime: BigInt(0),
    lockupPeriods: [],
    vestingPeriods: [],
  };
}
export const ClawbackVestingAccount = {
  typeUrl: '/cosmos.vesting.v1beta1.ClawbackVestingAccount',
  encode(
    message: ClawbackVestingAccount,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.baseVestingAccount !== undefined) {
      BaseVestingAccount.encode(
        message.baseVestingAccount,
        writer.uint32(10).fork(),
      ).ldelim();
    }
    if (message.funderAddress !== '') {
      writer.uint32(18).string(message.funderAddress);
    }
    if (message.startTime !== BigInt(0)) {
      writer.uint32(24).int64(message.startTime);
    }
    for (const v of message.lockupPeriods) {
      Period.encode(v!, writer.uint32(34).fork()).ldelim();
    }
    for (const v of message.vestingPeriods) {
      Period.encode(v!, writer.uint32(42).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): ClawbackVestingAccount {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseClawbackVestingAccount();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.baseVestingAccount = BaseVestingAccount.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 2:
          message.funderAddress = reader.string();
          break;
        case 3:
          message.startTime = reader.int64();
          break;
        case 4:
          message.lockupPeriods.push(Period.decode(reader, reader.uint32()));
          break;
        case 5:
          message.vestingPeriods.push(Period.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): ClawbackVestingAccount {
    return {
      baseVestingAccount: isSet(object.baseVestingAccount)
        ? BaseVestingAccount.fromJSON(object.baseVestingAccount)
        : undefined,
      funderAddress: isSet(object.funderAddress)
        ? String(object.funderAddress)
        : '',
      startTime: isSet(object.startTime)
        ? BigInt(object.startTime.toString())
        : BigInt(0),
      lockupPeriods: Array.isArray(object?.lockupPeriods)
        ? object.lockupPeriods.map((e: any) => Period.fromJSON(e))
        : [],
      vestingPeriods: Array.isArray(object?.vestingPeriods)
        ? object.vestingPeriods.map((e: any) => Period.fromJSON(e))
        : [],
    };
  },
  toJSON(message: ClawbackVestingAccount): JsonSafe<ClawbackVestingAccount> {
    const obj: any = {};
    message.baseVestingAccount !== undefined &&
      (obj.baseVestingAccount = message.baseVestingAccount
        ? BaseVestingAccount.toJSON(message.baseVestingAccount)
        : undefined);
    message.funderAddress !== undefined &&
      (obj.funderAddress = message.funderAddress);
    message.startTime !== undefined &&
      (obj.startTime = (message.startTime || BigInt(0)).toString());
    if (message.lockupPeriods) {
      obj.lockupPeriods = message.lockupPeriods.map(e =>
        e ? Period.toJSON(e) : undefined,
      );
    } else {
      obj.lockupPeriods = [];
    }
    if (message.vestingPeriods) {
      obj.vestingPeriods = message.vestingPeriods.map(e =>
        e ? Period.toJSON(e) : undefined,
      );
    } else {
      obj.vestingPeriods = [];
    }
    return obj;
  },
  fromPartial(object: Partial<ClawbackVestingAccount>): ClawbackVestingAccount {
    const message = createBaseClawbackVestingAccount();
    message.baseVestingAccount =
      object.baseVestingAccount !== undefined &&
      object.baseVestingAccount !== null
        ? BaseVestingAccount.fromPartial(object.baseVestingAccount)
        : undefined;
    message.funderAddress = object.funderAddress ?? '';
    message.startTime =
      object.startTime !== undefined && object.startTime !== null
        ? BigInt(object.startTime.toString())
        : BigInt(0);
    message.lockupPeriods =
      object.lockupPeriods?.map(e => Period.fromPartial(e)) || [];
    message.vestingPeriods =
      object.vestingPeriods?.map(e => Period.fromPartial(e)) || [];
    return message;
  },
  fromProtoMsg(
    message: ClawbackVestingAccountProtoMsg,
  ): ClawbackVestingAccount {
    return ClawbackVestingAccount.decode(message.value);
  },
  toProto(message: ClawbackVestingAccount): Uint8Array {
    return ClawbackVestingAccount.encode(message).finish();
  },
  toProtoMsg(message: ClawbackVestingAccount): ClawbackVestingAccountProtoMsg {
    return {
      typeUrl: '/cosmos.vesting.v1beta1.ClawbackVestingAccount',
      value: ClawbackVestingAccount.encode(message).finish(),
    };
  },
};
