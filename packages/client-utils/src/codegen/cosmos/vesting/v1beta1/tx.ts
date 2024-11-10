//@ts-nocheck
import { Coin, type CoinSDKType } from '../../base/v1beta1/coin.js';
import { Period, type PeriodSDKType } from './vesting.js';
import { BinaryReader, BinaryWriter } from '../../../binary.js';
import { isSet } from '../../../helpers.js';
import { type JsonSafe } from '../../../json-safe.js';
/**
 * MsgCreateVestingAccount defines a message that enables creating a vesting
 * account.
 */
export interface MsgCreateVestingAccount {
  fromAddress: string;
  toAddress: string;
  amount: Coin[];
  /** end of vesting as unix time (in seconds). */
  endTime: bigint;
  delayed: boolean;
}
export interface MsgCreateVestingAccountProtoMsg {
  typeUrl: '/cosmos.vesting.v1beta1.MsgCreateVestingAccount';
  value: Uint8Array;
}
/**
 * MsgCreateVestingAccount defines a message that enables creating a vesting
 * account.
 */
export interface MsgCreateVestingAccountSDKType {
  from_address: string;
  to_address: string;
  amount: CoinSDKType[];
  end_time: bigint;
  delayed: boolean;
}
/** MsgCreateVestingAccountResponse defines the Msg/CreateVestingAccount response type. */
export interface MsgCreateVestingAccountResponse {}
export interface MsgCreateVestingAccountResponseProtoMsg {
  typeUrl: '/cosmos.vesting.v1beta1.MsgCreateVestingAccountResponse';
  value: Uint8Array;
}
/** MsgCreateVestingAccountResponse defines the Msg/CreateVestingAccount response type. */
export interface MsgCreateVestingAccountResponseSDKType {}
/**
 * MsgCreatePermanentLockedAccount defines a message that enables creating a permanent
 * locked account.
 *
 * Since: cosmos-sdk 0.46
 */
export interface MsgCreatePermanentLockedAccount {
  fromAddress: string;
  toAddress: string;
  amount: Coin[];
}
export interface MsgCreatePermanentLockedAccountProtoMsg {
  typeUrl: '/cosmos.vesting.v1beta1.MsgCreatePermanentLockedAccount';
  value: Uint8Array;
}
/**
 * MsgCreatePermanentLockedAccount defines a message that enables creating a permanent
 * locked account.
 *
 * Since: cosmos-sdk 0.46
 */
export interface MsgCreatePermanentLockedAccountSDKType {
  from_address: string;
  to_address: string;
  amount: CoinSDKType[];
}
/**
 * MsgCreatePermanentLockedAccountResponse defines the Msg/CreatePermanentLockedAccount response type.
 *
 * Since: cosmos-sdk 0.46
 */
export interface MsgCreatePermanentLockedAccountResponse {}
export interface MsgCreatePermanentLockedAccountResponseProtoMsg {
  typeUrl: '/cosmos.vesting.v1beta1.MsgCreatePermanentLockedAccountResponse';
  value: Uint8Array;
}
/**
 * MsgCreatePermanentLockedAccountResponse defines the Msg/CreatePermanentLockedAccount response type.
 *
 * Since: cosmos-sdk 0.46
 */
export interface MsgCreatePermanentLockedAccountResponseSDKType {}
/**
 * MsgCreateVestingAccount defines a message that enables creating a vesting
 * account.
 *
 * Since: cosmos-sdk 0.46
 */
export interface MsgCreatePeriodicVestingAccount {
  fromAddress: string;
  toAddress: string;
  /** start of vesting as unix time (in seconds). */
  startTime: bigint;
  vestingPeriods: Period[];
  /**
   * If true, merge this new grant into an existing PeriodicVestingAccount,
   * or create it if it does not exist. If false, creates a new account,
   * or fails if an account already exists
   */
  merge: boolean;
}
export interface MsgCreatePeriodicVestingAccountProtoMsg {
  typeUrl: '/cosmos.vesting.v1beta1.MsgCreatePeriodicVestingAccount';
  value: Uint8Array;
}
/**
 * MsgCreateVestingAccount defines a message that enables creating a vesting
 * account.
 *
 * Since: cosmos-sdk 0.46
 */
export interface MsgCreatePeriodicVestingAccountSDKType {
  from_address: string;
  to_address: string;
  start_time: bigint;
  vesting_periods: PeriodSDKType[];
  merge: boolean;
}
/**
 * MsgCreateVestingAccountResponse defines the Msg/CreatePeriodicVestingAccount
 * response type.
 *
 * Since: cosmos-sdk 0.46
 */
export interface MsgCreatePeriodicVestingAccountResponse {}
export interface MsgCreatePeriodicVestingAccountResponseProtoMsg {
  typeUrl: '/cosmos.vesting.v1beta1.MsgCreatePeriodicVestingAccountResponse';
  value: Uint8Array;
}
/**
 * MsgCreateVestingAccountResponse defines the Msg/CreatePeriodicVestingAccount
 * response type.
 *
 * Since: cosmos-sdk 0.46
 */
export interface MsgCreatePeriodicVestingAccountResponseSDKType {}
/** MsgCreateClawbackVestingAccount defines a message that enables creating a ClawbackVestingAccount. */
export interface MsgCreateClawbackVestingAccount {
  /** Address of the account providing the funds, which must also sign the request. */
  fromAddress: string;
  /** Address of the account to receive the funds. */
  toAddress: string;
  /** Start time of the vesting. Periods start relative to this time. */
  startTime: bigint;
  /** Unlocking events as a sequence of durations and amounts, starting relative to start_time. */
  lockupPeriods: Period[];
  /** Vesting events as a sequence of durations and amounts, starting relative to start_time. */
  vestingPeriods: Period[];
  /**
   * If true, merge this new grant into an existing ClawbackVestingAccount,
   * or create it if it does not exist. If false, creates a new account.
   * New grants to an existing account must be from the same from_address.
   */
  merge: boolean;
}
export interface MsgCreateClawbackVestingAccountProtoMsg {
  typeUrl: '/cosmos.vesting.v1beta1.MsgCreateClawbackVestingAccount';
  value: Uint8Array;
}
/** MsgCreateClawbackVestingAccount defines a message that enables creating a ClawbackVestingAccount. */
export interface MsgCreateClawbackVestingAccountSDKType {
  from_address: string;
  to_address: string;
  start_time: bigint;
  lockup_periods: PeriodSDKType[];
  vesting_periods: PeriodSDKType[];
  merge: boolean;
}
/** MsgCreateClawbackVestingAccountResponse defines the MsgCreateClawbackVestingAccount response type. */
export interface MsgCreateClawbackVestingAccountResponse {}
export interface MsgCreateClawbackVestingAccountResponseProtoMsg {
  typeUrl: '/cosmos.vesting.v1beta1.MsgCreateClawbackVestingAccountResponse';
  value: Uint8Array;
}
/** MsgCreateClawbackVestingAccountResponse defines the MsgCreateClawbackVestingAccount response type. */
export interface MsgCreateClawbackVestingAccountResponseSDKType {}
/** MsgClawback defines a message that removes unvested tokens from a ClawbackVestingAccount. */
export interface MsgClawback {
  /** funder_address is the address which funded the account */
  funderAddress: string;
  /** address is the address of the ClawbackVestingAccount to claw back from. */
  address: string;
  /**
   * dest_address specifies where the clawed-back tokens should be transferred.
   * If empty, the tokens will be transferred back to the original funder of the account.
   */
  destAddress: string;
}
export interface MsgClawbackProtoMsg {
  typeUrl: '/cosmos.vesting.v1beta1.MsgClawback';
  value: Uint8Array;
}
/** MsgClawback defines a message that removes unvested tokens from a ClawbackVestingAccount. */
export interface MsgClawbackSDKType {
  funder_address: string;
  address: string;
  dest_address: string;
}
/** MsgClawbackResponse defines the MsgClawback response type. */
export interface MsgClawbackResponse {}
export interface MsgClawbackResponseProtoMsg {
  typeUrl: '/cosmos.vesting.v1beta1.MsgClawbackResponse';
  value: Uint8Array;
}
/** MsgClawbackResponse defines the MsgClawback response type. */
export interface MsgClawbackResponseSDKType {}
/**
 * MsgReturnGrants defines a message for a grantee to return all granted assets,
 * including delegated, undelegated and unbonding, vested and unvested,
 * are transferred to the original funder of the account. Might not be complete if
 * some vested assets have been transferred out of the account. Currently only applies to
 * ClawbackVesting accounts.
 */
export interface MsgReturnGrants {
  /** address is the address of the grantee account returning the grant. */
  address: string;
}
export interface MsgReturnGrantsProtoMsg {
  typeUrl: '/cosmos.vesting.v1beta1.MsgReturnGrants';
  value: Uint8Array;
}
/**
 * MsgReturnGrants defines a message for a grantee to return all granted assets,
 * including delegated, undelegated and unbonding, vested and unvested,
 * are transferred to the original funder of the account. Might not be complete if
 * some vested assets have been transferred out of the account. Currently only applies to
 * ClawbackVesting accounts.
 */
export interface MsgReturnGrantsSDKType {
  address: string;
}
/** MsgReturnGrantsResponse defines the ReturnGrants response type. */
export interface MsgReturnGrantsResponse {}
export interface MsgReturnGrantsResponseProtoMsg {
  typeUrl: '/cosmos.vesting.v1beta1.MsgReturnGrantsResponse';
  value: Uint8Array;
}
/** MsgReturnGrantsResponse defines the ReturnGrants response type. */
export interface MsgReturnGrantsResponseSDKType {}
function createBaseMsgCreateVestingAccount(): MsgCreateVestingAccount {
  return {
    fromAddress: '',
    toAddress: '',
    amount: [],
    endTime: BigInt(0),
    delayed: false,
  };
}
export const MsgCreateVestingAccount = {
  typeUrl: '/cosmos.vesting.v1beta1.MsgCreateVestingAccount',
  encode(
    message: MsgCreateVestingAccount,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.fromAddress !== '') {
      writer.uint32(10).string(message.fromAddress);
    }
    if (message.toAddress !== '') {
      writer.uint32(18).string(message.toAddress);
    }
    for (const v of message.amount) {
      Coin.encode(v!, writer.uint32(26).fork()).ldelim();
    }
    if (message.endTime !== BigInt(0)) {
      writer.uint32(32).int64(message.endTime);
    }
    if (message.delayed === true) {
      writer.uint32(40).bool(message.delayed);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): MsgCreateVestingAccount {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCreateVestingAccount();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.fromAddress = reader.string();
          break;
        case 2:
          message.toAddress = reader.string();
          break;
        case 3:
          message.amount.push(Coin.decode(reader, reader.uint32()));
          break;
        case 4:
          message.endTime = reader.int64();
          break;
        case 5:
          message.delayed = reader.bool();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): MsgCreateVestingAccount {
    return {
      fromAddress: isSet(object.fromAddress) ? String(object.fromAddress) : '',
      toAddress: isSet(object.toAddress) ? String(object.toAddress) : '',
      amount: Array.isArray(object?.amount)
        ? object.amount.map((e: any) => Coin.fromJSON(e))
        : [],
      endTime: isSet(object.endTime)
        ? BigInt(object.endTime.toString())
        : BigInt(0),
      delayed: isSet(object.delayed) ? Boolean(object.delayed) : false,
    };
  },
  toJSON(message: MsgCreateVestingAccount): JsonSafe<MsgCreateVestingAccount> {
    const obj: any = {};
    message.fromAddress !== undefined &&
      (obj.fromAddress = message.fromAddress);
    message.toAddress !== undefined && (obj.toAddress = message.toAddress);
    if (message.amount) {
      obj.amount = message.amount.map(e => (e ? Coin.toJSON(e) : undefined));
    } else {
      obj.amount = [];
    }
    message.endTime !== undefined &&
      (obj.endTime = (message.endTime || BigInt(0)).toString());
    message.delayed !== undefined && (obj.delayed = message.delayed);
    return obj;
  },
  fromPartial(
    object: Partial<MsgCreateVestingAccount>,
  ): MsgCreateVestingAccount {
    const message = createBaseMsgCreateVestingAccount();
    message.fromAddress = object.fromAddress ?? '';
    message.toAddress = object.toAddress ?? '';
    message.amount = object.amount?.map(e => Coin.fromPartial(e)) || [];
    message.endTime =
      object.endTime !== undefined && object.endTime !== null
        ? BigInt(object.endTime.toString())
        : BigInt(0);
    message.delayed = object.delayed ?? false;
    return message;
  },
  fromProtoMsg(
    message: MsgCreateVestingAccountProtoMsg,
  ): MsgCreateVestingAccount {
    return MsgCreateVestingAccount.decode(message.value);
  },
  toProto(message: MsgCreateVestingAccount): Uint8Array {
    return MsgCreateVestingAccount.encode(message).finish();
  },
  toProtoMsg(
    message: MsgCreateVestingAccount,
  ): MsgCreateVestingAccountProtoMsg {
    return {
      typeUrl: '/cosmos.vesting.v1beta1.MsgCreateVestingAccount',
      value: MsgCreateVestingAccount.encode(message).finish(),
    };
  },
};
function createBaseMsgCreateVestingAccountResponse(): MsgCreateVestingAccountResponse {
  return {};
}
export const MsgCreateVestingAccountResponse = {
  typeUrl: '/cosmos.vesting.v1beta1.MsgCreateVestingAccountResponse',
  encode(
    _: MsgCreateVestingAccountResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): MsgCreateVestingAccountResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCreateVestingAccountResponse();
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
  fromJSON(_: any): MsgCreateVestingAccountResponse {
    return {};
  },
  toJSON(
    _: MsgCreateVestingAccountResponse,
  ): JsonSafe<MsgCreateVestingAccountResponse> {
    const obj: any = {};
    return obj;
  },
  fromPartial(
    _: Partial<MsgCreateVestingAccountResponse>,
  ): MsgCreateVestingAccountResponse {
    const message = createBaseMsgCreateVestingAccountResponse();
    return message;
  },
  fromProtoMsg(
    message: MsgCreateVestingAccountResponseProtoMsg,
  ): MsgCreateVestingAccountResponse {
    return MsgCreateVestingAccountResponse.decode(message.value);
  },
  toProto(message: MsgCreateVestingAccountResponse): Uint8Array {
    return MsgCreateVestingAccountResponse.encode(message).finish();
  },
  toProtoMsg(
    message: MsgCreateVestingAccountResponse,
  ): MsgCreateVestingAccountResponseProtoMsg {
    return {
      typeUrl: '/cosmos.vesting.v1beta1.MsgCreateVestingAccountResponse',
      value: MsgCreateVestingAccountResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgCreatePermanentLockedAccount(): MsgCreatePermanentLockedAccount {
  return {
    fromAddress: '',
    toAddress: '',
    amount: [],
  };
}
export const MsgCreatePermanentLockedAccount = {
  typeUrl: '/cosmos.vesting.v1beta1.MsgCreatePermanentLockedAccount',
  encode(
    message: MsgCreatePermanentLockedAccount,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.fromAddress !== '') {
      writer.uint32(10).string(message.fromAddress);
    }
    if (message.toAddress !== '') {
      writer.uint32(18).string(message.toAddress);
    }
    for (const v of message.amount) {
      Coin.encode(v!, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): MsgCreatePermanentLockedAccount {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCreatePermanentLockedAccount();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.fromAddress = reader.string();
          break;
        case 2:
          message.toAddress = reader.string();
          break;
        case 3:
          message.amount.push(Coin.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): MsgCreatePermanentLockedAccount {
    return {
      fromAddress: isSet(object.fromAddress) ? String(object.fromAddress) : '',
      toAddress: isSet(object.toAddress) ? String(object.toAddress) : '',
      amount: Array.isArray(object?.amount)
        ? object.amount.map((e: any) => Coin.fromJSON(e))
        : [],
    };
  },
  toJSON(
    message: MsgCreatePermanentLockedAccount,
  ): JsonSafe<MsgCreatePermanentLockedAccount> {
    const obj: any = {};
    message.fromAddress !== undefined &&
      (obj.fromAddress = message.fromAddress);
    message.toAddress !== undefined && (obj.toAddress = message.toAddress);
    if (message.amount) {
      obj.amount = message.amount.map(e => (e ? Coin.toJSON(e) : undefined));
    } else {
      obj.amount = [];
    }
    return obj;
  },
  fromPartial(
    object: Partial<MsgCreatePermanentLockedAccount>,
  ): MsgCreatePermanentLockedAccount {
    const message = createBaseMsgCreatePermanentLockedAccount();
    message.fromAddress = object.fromAddress ?? '';
    message.toAddress = object.toAddress ?? '';
    message.amount = object.amount?.map(e => Coin.fromPartial(e)) || [];
    return message;
  },
  fromProtoMsg(
    message: MsgCreatePermanentLockedAccountProtoMsg,
  ): MsgCreatePermanentLockedAccount {
    return MsgCreatePermanentLockedAccount.decode(message.value);
  },
  toProto(message: MsgCreatePermanentLockedAccount): Uint8Array {
    return MsgCreatePermanentLockedAccount.encode(message).finish();
  },
  toProtoMsg(
    message: MsgCreatePermanentLockedAccount,
  ): MsgCreatePermanentLockedAccountProtoMsg {
    return {
      typeUrl: '/cosmos.vesting.v1beta1.MsgCreatePermanentLockedAccount',
      value: MsgCreatePermanentLockedAccount.encode(message).finish(),
    };
  },
};
function createBaseMsgCreatePermanentLockedAccountResponse(): MsgCreatePermanentLockedAccountResponse {
  return {};
}
export const MsgCreatePermanentLockedAccountResponse = {
  typeUrl: '/cosmos.vesting.v1beta1.MsgCreatePermanentLockedAccountResponse',
  encode(
    _: MsgCreatePermanentLockedAccountResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): MsgCreatePermanentLockedAccountResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCreatePermanentLockedAccountResponse();
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
  fromJSON(_: any): MsgCreatePermanentLockedAccountResponse {
    return {};
  },
  toJSON(
    _: MsgCreatePermanentLockedAccountResponse,
  ): JsonSafe<MsgCreatePermanentLockedAccountResponse> {
    const obj: any = {};
    return obj;
  },
  fromPartial(
    _: Partial<MsgCreatePermanentLockedAccountResponse>,
  ): MsgCreatePermanentLockedAccountResponse {
    const message = createBaseMsgCreatePermanentLockedAccountResponse();
    return message;
  },
  fromProtoMsg(
    message: MsgCreatePermanentLockedAccountResponseProtoMsg,
  ): MsgCreatePermanentLockedAccountResponse {
    return MsgCreatePermanentLockedAccountResponse.decode(message.value);
  },
  toProto(message: MsgCreatePermanentLockedAccountResponse): Uint8Array {
    return MsgCreatePermanentLockedAccountResponse.encode(message).finish();
  },
  toProtoMsg(
    message: MsgCreatePermanentLockedAccountResponse,
  ): MsgCreatePermanentLockedAccountResponseProtoMsg {
    return {
      typeUrl:
        '/cosmos.vesting.v1beta1.MsgCreatePermanentLockedAccountResponse',
      value: MsgCreatePermanentLockedAccountResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgCreatePeriodicVestingAccount(): MsgCreatePeriodicVestingAccount {
  return {
    fromAddress: '',
    toAddress: '',
    startTime: BigInt(0),
    vestingPeriods: [],
    merge: false,
  };
}
export const MsgCreatePeriodicVestingAccount = {
  typeUrl: '/cosmos.vesting.v1beta1.MsgCreatePeriodicVestingAccount',
  encode(
    message: MsgCreatePeriodicVestingAccount,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.fromAddress !== '') {
      writer.uint32(10).string(message.fromAddress);
    }
    if (message.toAddress !== '') {
      writer.uint32(18).string(message.toAddress);
    }
    if (message.startTime !== BigInt(0)) {
      writer.uint32(24).int64(message.startTime);
    }
    for (const v of message.vestingPeriods) {
      Period.encode(v!, writer.uint32(34).fork()).ldelim();
    }
    if (message.merge === true) {
      writer.uint32(40).bool(message.merge);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): MsgCreatePeriodicVestingAccount {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCreatePeriodicVestingAccount();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.fromAddress = reader.string();
          break;
        case 2:
          message.toAddress = reader.string();
          break;
        case 3:
          message.startTime = reader.int64();
          break;
        case 4:
          message.vestingPeriods.push(Period.decode(reader, reader.uint32()));
          break;
        case 5:
          message.merge = reader.bool();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): MsgCreatePeriodicVestingAccount {
    return {
      fromAddress: isSet(object.fromAddress) ? String(object.fromAddress) : '',
      toAddress: isSet(object.toAddress) ? String(object.toAddress) : '',
      startTime: isSet(object.startTime)
        ? BigInt(object.startTime.toString())
        : BigInt(0),
      vestingPeriods: Array.isArray(object?.vestingPeriods)
        ? object.vestingPeriods.map((e: any) => Period.fromJSON(e))
        : [],
      merge: isSet(object.merge) ? Boolean(object.merge) : false,
    };
  },
  toJSON(
    message: MsgCreatePeriodicVestingAccount,
  ): JsonSafe<MsgCreatePeriodicVestingAccount> {
    const obj: any = {};
    message.fromAddress !== undefined &&
      (obj.fromAddress = message.fromAddress);
    message.toAddress !== undefined && (obj.toAddress = message.toAddress);
    message.startTime !== undefined &&
      (obj.startTime = (message.startTime || BigInt(0)).toString());
    if (message.vestingPeriods) {
      obj.vestingPeriods = message.vestingPeriods.map(e =>
        e ? Period.toJSON(e) : undefined,
      );
    } else {
      obj.vestingPeriods = [];
    }
    message.merge !== undefined && (obj.merge = message.merge);
    return obj;
  },
  fromPartial(
    object: Partial<MsgCreatePeriodicVestingAccount>,
  ): MsgCreatePeriodicVestingAccount {
    const message = createBaseMsgCreatePeriodicVestingAccount();
    message.fromAddress = object.fromAddress ?? '';
    message.toAddress = object.toAddress ?? '';
    message.startTime =
      object.startTime !== undefined && object.startTime !== null
        ? BigInt(object.startTime.toString())
        : BigInt(0);
    message.vestingPeriods =
      object.vestingPeriods?.map(e => Period.fromPartial(e)) || [];
    message.merge = object.merge ?? false;
    return message;
  },
  fromProtoMsg(
    message: MsgCreatePeriodicVestingAccountProtoMsg,
  ): MsgCreatePeriodicVestingAccount {
    return MsgCreatePeriodicVestingAccount.decode(message.value);
  },
  toProto(message: MsgCreatePeriodicVestingAccount): Uint8Array {
    return MsgCreatePeriodicVestingAccount.encode(message).finish();
  },
  toProtoMsg(
    message: MsgCreatePeriodicVestingAccount,
  ): MsgCreatePeriodicVestingAccountProtoMsg {
    return {
      typeUrl: '/cosmos.vesting.v1beta1.MsgCreatePeriodicVestingAccount',
      value: MsgCreatePeriodicVestingAccount.encode(message).finish(),
    };
  },
};
function createBaseMsgCreatePeriodicVestingAccountResponse(): MsgCreatePeriodicVestingAccountResponse {
  return {};
}
export const MsgCreatePeriodicVestingAccountResponse = {
  typeUrl: '/cosmos.vesting.v1beta1.MsgCreatePeriodicVestingAccountResponse',
  encode(
    _: MsgCreatePeriodicVestingAccountResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): MsgCreatePeriodicVestingAccountResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCreatePeriodicVestingAccountResponse();
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
  fromJSON(_: any): MsgCreatePeriodicVestingAccountResponse {
    return {};
  },
  toJSON(
    _: MsgCreatePeriodicVestingAccountResponse,
  ): JsonSafe<MsgCreatePeriodicVestingAccountResponse> {
    const obj: any = {};
    return obj;
  },
  fromPartial(
    _: Partial<MsgCreatePeriodicVestingAccountResponse>,
  ): MsgCreatePeriodicVestingAccountResponse {
    const message = createBaseMsgCreatePeriodicVestingAccountResponse();
    return message;
  },
  fromProtoMsg(
    message: MsgCreatePeriodicVestingAccountResponseProtoMsg,
  ): MsgCreatePeriodicVestingAccountResponse {
    return MsgCreatePeriodicVestingAccountResponse.decode(message.value);
  },
  toProto(message: MsgCreatePeriodicVestingAccountResponse): Uint8Array {
    return MsgCreatePeriodicVestingAccountResponse.encode(message).finish();
  },
  toProtoMsg(
    message: MsgCreatePeriodicVestingAccountResponse,
  ): MsgCreatePeriodicVestingAccountResponseProtoMsg {
    return {
      typeUrl:
        '/cosmos.vesting.v1beta1.MsgCreatePeriodicVestingAccountResponse',
      value: MsgCreatePeriodicVestingAccountResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgCreateClawbackVestingAccount(): MsgCreateClawbackVestingAccount {
  return {
    fromAddress: '',
    toAddress: '',
    startTime: BigInt(0),
    lockupPeriods: [],
    vestingPeriods: [],
    merge: false,
  };
}
export const MsgCreateClawbackVestingAccount = {
  typeUrl: '/cosmos.vesting.v1beta1.MsgCreateClawbackVestingAccount',
  encode(
    message: MsgCreateClawbackVestingAccount,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.fromAddress !== '') {
      writer.uint32(10).string(message.fromAddress);
    }
    if (message.toAddress !== '') {
      writer.uint32(18).string(message.toAddress);
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
    if (message.merge === true) {
      writer.uint32(48).bool(message.merge);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): MsgCreateClawbackVestingAccount {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCreateClawbackVestingAccount();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.fromAddress = reader.string();
          break;
        case 2:
          message.toAddress = reader.string();
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
        case 6:
          message.merge = reader.bool();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): MsgCreateClawbackVestingAccount {
    return {
      fromAddress: isSet(object.fromAddress) ? String(object.fromAddress) : '',
      toAddress: isSet(object.toAddress) ? String(object.toAddress) : '',
      startTime: isSet(object.startTime)
        ? BigInt(object.startTime.toString())
        : BigInt(0),
      lockupPeriods: Array.isArray(object?.lockupPeriods)
        ? object.lockupPeriods.map((e: any) => Period.fromJSON(e))
        : [],
      vestingPeriods: Array.isArray(object?.vestingPeriods)
        ? object.vestingPeriods.map((e: any) => Period.fromJSON(e))
        : [],
      merge: isSet(object.merge) ? Boolean(object.merge) : false,
    };
  },
  toJSON(
    message: MsgCreateClawbackVestingAccount,
  ): JsonSafe<MsgCreateClawbackVestingAccount> {
    const obj: any = {};
    message.fromAddress !== undefined &&
      (obj.fromAddress = message.fromAddress);
    message.toAddress !== undefined && (obj.toAddress = message.toAddress);
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
    message.merge !== undefined && (obj.merge = message.merge);
    return obj;
  },
  fromPartial(
    object: Partial<MsgCreateClawbackVestingAccount>,
  ): MsgCreateClawbackVestingAccount {
    const message = createBaseMsgCreateClawbackVestingAccount();
    message.fromAddress = object.fromAddress ?? '';
    message.toAddress = object.toAddress ?? '';
    message.startTime =
      object.startTime !== undefined && object.startTime !== null
        ? BigInt(object.startTime.toString())
        : BigInt(0);
    message.lockupPeriods =
      object.lockupPeriods?.map(e => Period.fromPartial(e)) || [];
    message.vestingPeriods =
      object.vestingPeriods?.map(e => Period.fromPartial(e)) || [];
    message.merge = object.merge ?? false;
    return message;
  },
  fromProtoMsg(
    message: MsgCreateClawbackVestingAccountProtoMsg,
  ): MsgCreateClawbackVestingAccount {
    return MsgCreateClawbackVestingAccount.decode(message.value);
  },
  toProto(message: MsgCreateClawbackVestingAccount): Uint8Array {
    return MsgCreateClawbackVestingAccount.encode(message).finish();
  },
  toProtoMsg(
    message: MsgCreateClawbackVestingAccount,
  ): MsgCreateClawbackVestingAccountProtoMsg {
    return {
      typeUrl: '/cosmos.vesting.v1beta1.MsgCreateClawbackVestingAccount',
      value: MsgCreateClawbackVestingAccount.encode(message).finish(),
    };
  },
};
function createBaseMsgCreateClawbackVestingAccountResponse(): MsgCreateClawbackVestingAccountResponse {
  return {};
}
export const MsgCreateClawbackVestingAccountResponse = {
  typeUrl: '/cosmos.vesting.v1beta1.MsgCreateClawbackVestingAccountResponse',
  encode(
    _: MsgCreateClawbackVestingAccountResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): MsgCreateClawbackVestingAccountResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCreateClawbackVestingAccountResponse();
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
  fromJSON(_: any): MsgCreateClawbackVestingAccountResponse {
    return {};
  },
  toJSON(
    _: MsgCreateClawbackVestingAccountResponse,
  ): JsonSafe<MsgCreateClawbackVestingAccountResponse> {
    const obj: any = {};
    return obj;
  },
  fromPartial(
    _: Partial<MsgCreateClawbackVestingAccountResponse>,
  ): MsgCreateClawbackVestingAccountResponse {
    const message = createBaseMsgCreateClawbackVestingAccountResponse();
    return message;
  },
  fromProtoMsg(
    message: MsgCreateClawbackVestingAccountResponseProtoMsg,
  ): MsgCreateClawbackVestingAccountResponse {
    return MsgCreateClawbackVestingAccountResponse.decode(message.value);
  },
  toProto(message: MsgCreateClawbackVestingAccountResponse): Uint8Array {
    return MsgCreateClawbackVestingAccountResponse.encode(message).finish();
  },
  toProtoMsg(
    message: MsgCreateClawbackVestingAccountResponse,
  ): MsgCreateClawbackVestingAccountResponseProtoMsg {
    return {
      typeUrl:
        '/cosmos.vesting.v1beta1.MsgCreateClawbackVestingAccountResponse',
      value: MsgCreateClawbackVestingAccountResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgClawback(): MsgClawback {
  return {
    funderAddress: '',
    address: '',
    destAddress: '',
  };
}
export const MsgClawback = {
  typeUrl: '/cosmos.vesting.v1beta1.MsgClawback',
  encode(
    message: MsgClawback,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.funderAddress !== '') {
      writer.uint32(10).string(message.funderAddress);
    }
    if (message.address !== '') {
      writer.uint32(18).string(message.address);
    }
    if (message.destAddress !== '') {
      writer.uint32(26).string(message.destAddress);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgClawback {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgClawback();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.funderAddress = reader.string();
          break;
        case 2:
          message.address = reader.string();
          break;
        case 3:
          message.destAddress = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): MsgClawback {
    return {
      funderAddress: isSet(object.funderAddress)
        ? String(object.funderAddress)
        : '',
      address: isSet(object.address) ? String(object.address) : '',
      destAddress: isSet(object.destAddress) ? String(object.destAddress) : '',
    };
  },
  toJSON(message: MsgClawback): JsonSafe<MsgClawback> {
    const obj: any = {};
    message.funderAddress !== undefined &&
      (obj.funderAddress = message.funderAddress);
    message.address !== undefined && (obj.address = message.address);
    message.destAddress !== undefined &&
      (obj.destAddress = message.destAddress);
    return obj;
  },
  fromPartial(object: Partial<MsgClawback>): MsgClawback {
    const message = createBaseMsgClawback();
    message.funderAddress = object.funderAddress ?? '';
    message.address = object.address ?? '';
    message.destAddress = object.destAddress ?? '';
    return message;
  },
  fromProtoMsg(message: MsgClawbackProtoMsg): MsgClawback {
    return MsgClawback.decode(message.value);
  },
  toProto(message: MsgClawback): Uint8Array {
    return MsgClawback.encode(message).finish();
  },
  toProtoMsg(message: MsgClawback): MsgClawbackProtoMsg {
    return {
      typeUrl: '/cosmos.vesting.v1beta1.MsgClawback',
      value: MsgClawback.encode(message).finish(),
    };
  },
};
function createBaseMsgClawbackResponse(): MsgClawbackResponse {
  return {};
}
export const MsgClawbackResponse = {
  typeUrl: '/cosmos.vesting.v1beta1.MsgClawbackResponse',
  encode(
    _: MsgClawbackResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): MsgClawbackResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgClawbackResponse();
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
  fromJSON(_: any): MsgClawbackResponse {
    return {};
  },
  toJSON(_: MsgClawbackResponse): JsonSafe<MsgClawbackResponse> {
    const obj: any = {};
    return obj;
  },
  fromPartial(_: Partial<MsgClawbackResponse>): MsgClawbackResponse {
    const message = createBaseMsgClawbackResponse();
    return message;
  },
  fromProtoMsg(message: MsgClawbackResponseProtoMsg): MsgClawbackResponse {
    return MsgClawbackResponse.decode(message.value);
  },
  toProto(message: MsgClawbackResponse): Uint8Array {
    return MsgClawbackResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgClawbackResponse): MsgClawbackResponseProtoMsg {
    return {
      typeUrl: '/cosmos.vesting.v1beta1.MsgClawbackResponse',
      value: MsgClawbackResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgReturnGrants(): MsgReturnGrants {
  return {
    address: '',
  };
}
export const MsgReturnGrants = {
  typeUrl: '/cosmos.vesting.v1beta1.MsgReturnGrants',
  encode(
    message: MsgReturnGrants,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.address !== '') {
      writer.uint32(10).string(message.address);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgReturnGrants {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgReturnGrants();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.address = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): MsgReturnGrants {
    return {
      address: isSet(object.address) ? String(object.address) : '',
    };
  },
  toJSON(message: MsgReturnGrants): JsonSafe<MsgReturnGrants> {
    const obj: any = {};
    message.address !== undefined && (obj.address = message.address);
    return obj;
  },
  fromPartial(object: Partial<MsgReturnGrants>): MsgReturnGrants {
    const message = createBaseMsgReturnGrants();
    message.address = object.address ?? '';
    return message;
  },
  fromProtoMsg(message: MsgReturnGrantsProtoMsg): MsgReturnGrants {
    return MsgReturnGrants.decode(message.value);
  },
  toProto(message: MsgReturnGrants): Uint8Array {
    return MsgReturnGrants.encode(message).finish();
  },
  toProtoMsg(message: MsgReturnGrants): MsgReturnGrantsProtoMsg {
    return {
      typeUrl: '/cosmos.vesting.v1beta1.MsgReturnGrants',
      value: MsgReturnGrants.encode(message).finish(),
    };
  },
};
function createBaseMsgReturnGrantsResponse(): MsgReturnGrantsResponse {
  return {};
}
export const MsgReturnGrantsResponse = {
  typeUrl: '/cosmos.vesting.v1beta1.MsgReturnGrantsResponse',
  encode(
    _: MsgReturnGrantsResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): MsgReturnGrantsResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgReturnGrantsResponse();
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
  fromJSON(_: any): MsgReturnGrantsResponse {
    return {};
  },
  toJSON(_: MsgReturnGrantsResponse): JsonSafe<MsgReturnGrantsResponse> {
    const obj: any = {};
    return obj;
  },
  fromPartial(_: Partial<MsgReturnGrantsResponse>): MsgReturnGrantsResponse {
    const message = createBaseMsgReturnGrantsResponse();
    return message;
  },
  fromProtoMsg(
    message: MsgReturnGrantsResponseProtoMsg,
  ): MsgReturnGrantsResponse {
    return MsgReturnGrantsResponse.decode(message.value);
  },
  toProto(message: MsgReturnGrantsResponse): Uint8Array {
    return MsgReturnGrantsResponse.encode(message).finish();
  },
  toProtoMsg(
    message: MsgReturnGrantsResponse,
  ): MsgReturnGrantsResponseProtoMsg {
    return {
      typeUrl: '/cosmos.vesting.v1beta1.MsgReturnGrantsResponse',
      value: MsgReturnGrantsResponse.encode(message).finish(),
    };
  },
};
