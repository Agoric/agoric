//@ts-nocheck
import {
  BaseAccount,
  type BaseAccountSDKType,
} from '../../cosmos/auth/v1beta1/auth.js';
import { Coin, type CoinSDKType } from '../../cosmos/base/v1beta1/coin.js';
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { isSet } from '../../helpers.js';
import { type JsonSafe } from '../../json-safe.js';
/**
 * BaseVestingAccount implements the VestingAccount interface. It contains all
 * the necessary fields needed for any vesting account implementation.
 */
export interface BaseVestingAccount {
  baseAccount?: BaseAccount;
  originalVesting: Coin[];
  delegatedFree: Coin[];
  delegatedVesting: Coin[];
  endTime: bigint;
}
export interface BaseVestingAccountProtoMsg {
  typeUrl: '/stride.vesting.BaseVestingAccount';
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
/** Period defines a length of time and amount of coins that will vest. */
export interface Period {
  startTime: bigint;
  length: bigint;
  amount: Coin[];
  actionType: number;
}
export interface PeriodProtoMsg {
  typeUrl: '/stride.vesting.Period';
  value: Uint8Array;
}
/** Period defines a length of time and amount of coins that will vest. */
export interface PeriodSDKType {
  start_time: bigint;
  length: bigint;
  amount: CoinSDKType[];
  action_type: number;
}
/**
 * StridePeriodicVestingAccount implements the VestingAccount interface. It
 * periodically vests by unlocking coins during each specified period.
 */
export interface StridePeriodicVestingAccount {
  baseVestingAccount?: BaseVestingAccount;
  vestingPeriods: Period[];
}
export interface StridePeriodicVestingAccountProtoMsg {
  typeUrl: '/stride.vesting.StridePeriodicVestingAccount';
  value: Uint8Array;
}
/**
 * StridePeriodicVestingAccount implements the VestingAccount interface. It
 * periodically vests by unlocking coins during each specified period.
 */
export interface StridePeriodicVestingAccountSDKType {
  base_vesting_account?: BaseVestingAccountSDKType;
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
  typeUrl: '/stride.vesting.BaseVestingAccount',
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
      typeUrl: '/stride.vesting.BaseVestingAccount',
      value: BaseVestingAccount.encode(message).finish(),
    };
  },
};
function createBasePeriod(): Period {
  return {
    startTime: BigInt(0),
    length: BigInt(0),
    amount: [],
    actionType: 0,
  };
}
export const Period = {
  typeUrl: '/stride.vesting.Period',
  encode(
    message: Period,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.startTime !== BigInt(0)) {
      writer.uint32(8).int64(message.startTime);
    }
    if (message.length !== BigInt(0)) {
      writer.uint32(16).int64(message.length);
    }
    for (const v of message.amount) {
      Coin.encode(v!, writer.uint32(26).fork()).ldelim();
    }
    if (message.actionType !== 0) {
      writer.uint32(32).int32(message.actionType);
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
          message.startTime = reader.int64();
          break;
        case 2:
          message.length = reader.int64();
          break;
        case 3:
          message.amount.push(Coin.decode(reader, reader.uint32()));
          break;
        case 4:
          message.actionType = reader.int32();
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
      startTime: isSet(object.startTime)
        ? BigInt(object.startTime.toString())
        : BigInt(0),
      length: isSet(object.length)
        ? BigInt(object.length.toString())
        : BigInt(0),
      amount: Array.isArray(object?.amount)
        ? object.amount.map((e: any) => Coin.fromJSON(e))
        : [],
      actionType: isSet(object.actionType) ? Number(object.actionType) : 0,
    };
  },
  toJSON(message: Period): JsonSafe<Period> {
    const obj: any = {};
    message.startTime !== undefined &&
      (obj.startTime = (message.startTime || BigInt(0)).toString());
    message.length !== undefined &&
      (obj.length = (message.length || BigInt(0)).toString());
    if (message.amount) {
      obj.amount = message.amount.map(e => (e ? Coin.toJSON(e) : undefined));
    } else {
      obj.amount = [];
    }
    message.actionType !== undefined &&
      (obj.actionType = Math.round(message.actionType));
    return obj;
  },
  fromPartial(object: Partial<Period>): Period {
    const message = createBasePeriod();
    message.startTime =
      object.startTime !== undefined && object.startTime !== null
        ? BigInt(object.startTime.toString())
        : BigInt(0);
    message.length =
      object.length !== undefined && object.length !== null
        ? BigInt(object.length.toString())
        : BigInt(0);
    message.amount = object.amount?.map(e => Coin.fromPartial(e)) || [];
    message.actionType = object.actionType ?? 0;
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
      typeUrl: '/stride.vesting.Period',
      value: Period.encode(message).finish(),
    };
  },
};
function createBaseStridePeriodicVestingAccount(): StridePeriodicVestingAccount {
  return {
    baseVestingAccount: undefined,
    vestingPeriods: [],
  };
}
export const StridePeriodicVestingAccount = {
  typeUrl: '/stride.vesting.StridePeriodicVestingAccount',
  encode(
    message: StridePeriodicVestingAccount,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.baseVestingAccount !== undefined) {
      BaseVestingAccount.encode(
        message.baseVestingAccount,
        writer.uint32(10).fork(),
      ).ldelim();
    }
    for (const v of message.vestingPeriods) {
      Period.encode(v!, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): StridePeriodicVestingAccount {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseStridePeriodicVestingAccount();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.baseVestingAccount = BaseVestingAccount.decode(
            reader,
            reader.uint32(),
          );
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
  fromJSON(object: any): StridePeriodicVestingAccount {
    return {
      baseVestingAccount: isSet(object.baseVestingAccount)
        ? BaseVestingAccount.fromJSON(object.baseVestingAccount)
        : undefined,
      vestingPeriods: Array.isArray(object?.vestingPeriods)
        ? object.vestingPeriods.map((e: any) => Period.fromJSON(e))
        : [],
    };
  },
  toJSON(
    message: StridePeriodicVestingAccount,
  ): JsonSafe<StridePeriodicVestingAccount> {
    const obj: any = {};
    message.baseVestingAccount !== undefined &&
      (obj.baseVestingAccount = message.baseVestingAccount
        ? BaseVestingAccount.toJSON(message.baseVestingAccount)
        : undefined);
    if (message.vestingPeriods) {
      obj.vestingPeriods = message.vestingPeriods.map(e =>
        e ? Period.toJSON(e) : undefined,
      );
    } else {
      obj.vestingPeriods = [];
    }
    return obj;
  },
  fromPartial(
    object: Partial<StridePeriodicVestingAccount>,
  ): StridePeriodicVestingAccount {
    const message = createBaseStridePeriodicVestingAccount();
    message.baseVestingAccount =
      object.baseVestingAccount !== undefined &&
      object.baseVestingAccount !== null
        ? BaseVestingAccount.fromPartial(object.baseVestingAccount)
        : undefined;
    message.vestingPeriods =
      object.vestingPeriods?.map(e => Period.fromPartial(e)) || [];
    return message;
  },
  fromProtoMsg(
    message: StridePeriodicVestingAccountProtoMsg,
  ): StridePeriodicVestingAccount {
    return StridePeriodicVestingAccount.decode(message.value);
  },
  toProto(message: StridePeriodicVestingAccount): Uint8Array {
    return StridePeriodicVestingAccount.encode(message).finish();
  },
  toProtoMsg(
    message: StridePeriodicVestingAccount,
  ): StridePeriodicVestingAccountProtoMsg {
    return {
      typeUrl: '/stride.vesting.StridePeriodicVestingAccount',
      value: StridePeriodicVestingAccount.encode(message).finish(),
    };
  },
};
