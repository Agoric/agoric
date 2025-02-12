//@ts-nocheck
import {
  Timestamp,
  type TimestampSDKType,
} from '../../google/protobuf/timestamp.js';
import { BinaryReader, BinaryWriter } from '../../binary.js';
import {
  isSet,
  Decimal,
  fromJsonTimestamp,
  fromTimestamp,
} from '../../helpers.js';
import { type JsonSafe } from '../../json-safe.js';
/** ClaimDaily */
export interface MsgClaimDaily {
  /** Address of the claimer */
  claimer: string;
  /** Airdrop ID */
  airdropId: string;
}
export interface MsgClaimDailyProtoMsg {
  typeUrl: '/stride.airdrop.MsgClaimDaily';
  value: Uint8Array;
}
/** ClaimDaily */
export interface MsgClaimDailySDKType {
  claimer: string;
  airdrop_id: string;
}
export interface MsgClaimDailyResponse {}
export interface MsgClaimDailyResponseProtoMsg {
  typeUrl: '/stride.airdrop.MsgClaimDailyResponse';
  value: Uint8Array;
}
export interface MsgClaimDailyResponseSDKType {}
/** ClaimEarly */
export interface MsgClaimEarly {
  /** Address of the claimer */
  claimer: string;
  /** Airdrop ID */
  airdropId: string;
}
export interface MsgClaimEarlyProtoMsg {
  typeUrl: '/stride.airdrop.MsgClaimEarly';
  value: Uint8Array;
}
/** ClaimEarly */
export interface MsgClaimEarlySDKType {
  claimer: string;
  airdrop_id: string;
}
export interface MsgClaimEarlyResponse {}
export interface MsgClaimEarlyResponseProtoMsg {
  typeUrl: '/stride.airdrop.MsgClaimEarlyResponse';
  value: Uint8Array;
}
export interface MsgClaimEarlyResponseSDKType {}
/** CreateAirdrop */
export interface MsgCreateAirdrop {
  /** Airdrop admin address */
  admin: string;
  /** Airdrop ID */
  airdropId: string;
  /** Denom used when distributing rewards */
  rewardDenom: string;
  /** The first date that claiming begins and rewards are distributed */
  distributionStartDate?: Timestamp;
  /**
   * The last date for rewards to be distributed. Immediately after this date
   * the rewards can no longer be claimed, but rewards have not been clawed back
   * yet
   */
  distributionEndDate?: Timestamp;
  /**
   * Date with which the rewards are clawed back (occurs after the distribution
   * end date)
   */
  clawbackDate?: Timestamp;
  /** Deadline for the user to make a decision on their claim type */
  claimTypeDeadlineDate?: Timestamp;
  /**
   * Penalty for claiming rewards early - e.g. 0.5 means claiming early will
   * result in losing 50% of rewards
   */
  earlyClaimPenalty: string;
  /** Account that holds the total reward balance and distributes to users */
  distributorAddress: string;
  /** Admin account with permissions to add or update allocations */
  allocatorAddress: string;
  /** Admin account with permissions to link addresseses */
  linkerAddress: string;
}
export interface MsgCreateAirdropProtoMsg {
  typeUrl: '/stride.airdrop.MsgCreateAirdrop';
  value: Uint8Array;
}
/** CreateAirdrop */
export interface MsgCreateAirdropSDKType {
  admin: string;
  airdrop_id: string;
  reward_denom: string;
  distribution_start_date?: TimestampSDKType;
  distribution_end_date?: TimestampSDKType;
  clawback_date?: TimestampSDKType;
  claim_type_deadline_date?: TimestampSDKType;
  early_claim_penalty: string;
  distributor_address: string;
  allocator_address: string;
  linker_address: string;
}
export interface MsgCreateAirdropResponse {}
export interface MsgCreateAirdropResponseProtoMsg {
  typeUrl: '/stride.airdrop.MsgCreateAirdropResponse';
  value: Uint8Array;
}
export interface MsgCreateAirdropResponseSDKType {}
/** UpdateAirdrop */
export interface MsgUpdateAirdrop {
  /** Airdrop admin address */
  admin: string;
  /** Airdrop ID */
  airdropId: string;
  /** Denom used when distributing rewards */
  rewardDenom: string;
  /** The first date that claiming begins and rewards are distributed */
  distributionStartDate?: Timestamp;
  /**
   * The last date for rewards to be distributed. Immediately after this date
   * the rewards can no longer be claimed, but rewards have not been clawed back
   * yet
   */
  distributionEndDate?: Timestamp;
  /**
   * Date with which the rewards are clawed back (occurs after the distribution
   * end date)
   */
  clawbackDate?: Timestamp;
  /** Deadline for the user to make a decision on their claim type */
  claimTypeDeadlineDate?: Timestamp;
  /**
   * Penalty for claiming rewards early - e.g. 0.5 means claiming early will
   * result in losing 50% of rewards
   */
  earlyClaimPenalty: string;
  /** Account that holds the total reward balance and distributes to users */
  distributorAddress: string;
  /** Admin account with permissions to add or update allocations */
  allocatorAddress: string;
  /** Admin account with permissions to link addresseses */
  linkerAddress: string;
}
export interface MsgUpdateAirdropProtoMsg {
  typeUrl: '/stride.airdrop.MsgUpdateAirdrop';
  value: Uint8Array;
}
/** UpdateAirdrop */
export interface MsgUpdateAirdropSDKType {
  admin: string;
  airdrop_id: string;
  reward_denom: string;
  distribution_start_date?: TimestampSDKType;
  distribution_end_date?: TimestampSDKType;
  clawback_date?: TimestampSDKType;
  claim_type_deadline_date?: TimestampSDKType;
  early_claim_penalty: string;
  distributor_address: string;
  allocator_address: string;
  linker_address: string;
}
export interface MsgUpdateAirdropResponse {}
export interface MsgUpdateAirdropResponseProtoMsg {
  typeUrl: '/stride.airdrop.MsgUpdateAirdropResponse';
  value: Uint8Array;
}
export interface MsgUpdateAirdropResponseSDKType {}
/** Allocation specification when bootstrapping reward data */
export interface RawAllocation {
  userAddress: string;
  allocations: string[];
}
export interface RawAllocationProtoMsg {
  typeUrl: '/stride.airdrop.RawAllocation';
  value: Uint8Array;
}
/** Allocation specification when bootstrapping reward data */
export interface RawAllocationSDKType {
  user_address: string;
  allocations: string[];
}
/** AddAllocations */
export interface MsgAddAllocations {
  /** Airdrop admin address */
  admin: string;
  /** Airdrop ID */
  airdropId: string;
  /** List of address/allocation pairs for each user */
  allocations: RawAllocation[];
}
export interface MsgAddAllocationsProtoMsg {
  typeUrl: '/stride.airdrop.MsgAddAllocations';
  value: Uint8Array;
}
/** AddAllocations */
export interface MsgAddAllocationsSDKType {
  admin: string;
  airdrop_id: string;
  allocations: RawAllocationSDKType[];
}
export interface MsgAddAllocationsResponse {}
export interface MsgAddAllocationsResponseProtoMsg {
  typeUrl: '/stride.airdrop.MsgAddAllocationsResponse';
  value: Uint8Array;
}
export interface MsgAddAllocationsResponseSDKType {}
/** UpdateUserAllocation */
export interface MsgUpdateUserAllocation {
  /** Airdrop admin address */
  admin: string;
  /** Airdrop ID */
  airdropId: string;
  /** Address of the airdrop recipient */
  userAddress: string;
  /**
   * Allocations - as an array where each element represents the rewards for a
   * day
   */
  allocations: string[];
}
export interface MsgUpdateUserAllocationProtoMsg {
  typeUrl: '/stride.airdrop.MsgUpdateUserAllocation';
  value: Uint8Array;
}
/** UpdateUserAllocation */
export interface MsgUpdateUserAllocationSDKType {
  admin: string;
  airdrop_id: string;
  user_address: string;
  allocations: string[];
}
export interface MsgUpdateUserAllocationResponse {}
export interface MsgUpdateUserAllocationResponseProtoMsg {
  typeUrl: '/stride.airdrop.MsgUpdateUserAllocationResponse';
  value: Uint8Array;
}
export interface MsgUpdateUserAllocationResponseSDKType {}
/** LinkAddresses */
export interface MsgLinkAddresses {
  /** Airdrop admin address */
  admin: string;
  /** Airdrop ID */
  airdropId: string;
  /** Stride address - this address may or may not exist in allocations yet */
  strideAddress: string;
  /** Host address - this address must exist */
  hostAddress: string;
}
export interface MsgLinkAddressesProtoMsg {
  typeUrl: '/stride.airdrop.MsgLinkAddresses';
  value: Uint8Array;
}
/** LinkAddresses */
export interface MsgLinkAddressesSDKType {
  admin: string;
  airdrop_id: string;
  stride_address: string;
  host_address: string;
}
export interface MsgLinkAddressesResponse {}
export interface MsgLinkAddressesResponseProtoMsg {
  typeUrl: '/stride.airdrop.MsgLinkAddressesResponse';
  value: Uint8Array;
}
export interface MsgLinkAddressesResponseSDKType {}
function createBaseMsgClaimDaily(): MsgClaimDaily {
  return {
    claimer: '',
    airdropId: '',
  };
}
export const MsgClaimDaily = {
  typeUrl: '/stride.airdrop.MsgClaimDaily',
  encode(
    message: MsgClaimDaily,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.claimer !== '') {
      writer.uint32(10).string(message.claimer);
    }
    if (message.airdropId !== '') {
      writer.uint32(18).string(message.airdropId);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgClaimDaily {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgClaimDaily();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.claimer = reader.string();
          break;
        case 2:
          message.airdropId = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): MsgClaimDaily {
    return {
      claimer: isSet(object.claimer) ? String(object.claimer) : '',
      airdropId: isSet(object.airdropId) ? String(object.airdropId) : '',
    };
  },
  toJSON(message: MsgClaimDaily): JsonSafe<MsgClaimDaily> {
    const obj: any = {};
    message.claimer !== undefined && (obj.claimer = message.claimer);
    message.airdropId !== undefined && (obj.airdropId = message.airdropId);
    return obj;
  },
  fromPartial(object: Partial<MsgClaimDaily>): MsgClaimDaily {
    const message = createBaseMsgClaimDaily();
    message.claimer = object.claimer ?? '';
    message.airdropId = object.airdropId ?? '';
    return message;
  },
  fromProtoMsg(message: MsgClaimDailyProtoMsg): MsgClaimDaily {
    return MsgClaimDaily.decode(message.value);
  },
  toProto(message: MsgClaimDaily): Uint8Array {
    return MsgClaimDaily.encode(message).finish();
  },
  toProtoMsg(message: MsgClaimDaily): MsgClaimDailyProtoMsg {
    return {
      typeUrl: '/stride.airdrop.MsgClaimDaily',
      value: MsgClaimDaily.encode(message).finish(),
    };
  },
};
function createBaseMsgClaimDailyResponse(): MsgClaimDailyResponse {
  return {};
}
export const MsgClaimDailyResponse = {
  typeUrl: '/stride.airdrop.MsgClaimDailyResponse',
  encode(
    _: MsgClaimDailyResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): MsgClaimDailyResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgClaimDailyResponse();
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
  fromJSON(_: any): MsgClaimDailyResponse {
    return {};
  },
  toJSON(_: MsgClaimDailyResponse): JsonSafe<MsgClaimDailyResponse> {
    const obj: any = {};
    return obj;
  },
  fromPartial(_: Partial<MsgClaimDailyResponse>): MsgClaimDailyResponse {
    const message = createBaseMsgClaimDailyResponse();
    return message;
  },
  fromProtoMsg(message: MsgClaimDailyResponseProtoMsg): MsgClaimDailyResponse {
    return MsgClaimDailyResponse.decode(message.value);
  },
  toProto(message: MsgClaimDailyResponse): Uint8Array {
    return MsgClaimDailyResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgClaimDailyResponse): MsgClaimDailyResponseProtoMsg {
    return {
      typeUrl: '/stride.airdrop.MsgClaimDailyResponse',
      value: MsgClaimDailyResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgClaimEarly(): MsgClaimEarly {
  return {
    claimer: '',
    airdropId: '',
  };
}
export const MsgClaimEarly = {
  typeUrl: '/stride.airdrop.MsgClaimEarly',
  encode(
    message: MsgClaimEarly,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.claimer !== '') {
      writer.uint32(10).string(message.claimer);
    }
    if (message.airdropId !== '') {
      writer.uint32(18).string(message.airdropId);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgClaimEarly {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgClaimEarly();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.claimer = reader.string();
          break;
        case 2:
          message.airdropId = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): MsgClaimEarly {
    return {
      claimer: isSet(object.claimer) ? String(object.claimer) : '',
      airdropId: isSet(object.airdropId) ? String(object.airdropId) : '',
    };
  },
  toJSON(message: MsgClaimEarly): JsonSafe<MsgClaimEarly> {
    const obj: any = {};
    message.claimer !== undefined && (obj.claimer = message.claimer);
    message.airdropId !== undefined && (obj.airdropId = message.airdropId);
    return obj;
  },
  fromPartial(object: Partial<MsgClaimEarly>): MsgClaimEarly {
    const message = createBaseMsgClaimEarly();
    message.claimer = object.claimer ?? '';
    message.airdropId = object.airdropId ?? '';
    return message;
  },
  fromProtoMsg(message: MsgClaimEarlyProtoMsg): MsgClaimEarly {
    return MsgClaimEarly.decode(message.value);
  },
  toProto(message: MsgClaimEarly): Uint8Array {
    return MsgClaimEarly.encode(message).finish();
  },
  toProtoMsg(message: MsgClaimEarly): MsgClaimEarlyProtoMsg {
    return {
      typeUrl: '/stride.airdrop.MsgClaimEarly',
      value: MsgClaimEarly.encode(message).finish(),
    };
  },
};
function createBaseMsgClaimEarlyResponse(): MsgClaimEarlyResponse {
  return {};
}
export const MsgClaimEarlyResponse = {
  typeUrl: '/stride.airdrop.MsgClaimEarlyResponse',
  encode(
    _: MsgClaimEarlyResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): MsgClaimEarlyResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgClaimEarlyResponse();
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
  fromJSON(_: any): MsgClaimEarlyResponse {
    return {};
  },
  toJSON(_: MsgClaimEarlyResponse): JsonSafe<MsgClaimEarlyResponse> {
    const obj: any = {};
    return obj;
  },
  fromPartial(_: Partial<MsgClaimEarlyResponse>): MsgClaimEarlyResponse {
    const message = createBaseMsgClaimEarlyResponse();
    return message;
  },
  fromProtoMsg(message: MsgClaimEarlyResponseProtoMsg): MsgClaimEarlyResponse {
    return MsgClaimEarlyResponse.decode(message.value);
  },
  toProto(message: MsgClaimEarlyResponse): Uint8Array {
    return MsgClaimEarlyResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgClaimEarlyResponse): MsgClaimEarlyResponseProtoMsg {
    return {
      typeUrl: '/stride.airdrop.MsgClaimEarlyResponse',
      value: MsgClaimEarlyResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgCreateAirdrop(): MsgCreateAirdrop {
  return {
    admin: '',
    airdropId: '',
    rewardDenom: '',
    distributionStartDate: undefined,
    distributionEndDate: undefined,
    clawbackDate: undefined,
    claimTypeDeadlineDate: undefined,
    earlyClaimPenalty: '',
    distributorAddress: '',
    allocatorAddress: '',
    linkerAddress: '',
  };
}
export const MsgCreateAirdrop = {
  typeUrl: '/stride.airdrop.MsgCreateAirdrop',
  encode(
    message: MsgCreateAirdrop,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.admin !== '') {
      writer.uint32(10).string(message.admin);
    }
    if (message.airdropId !== '') {
      writer.uint32(18).string(message.airdropId);
    }
    if (message.rewardDenom !== '') {
      writer.uint32(26).string(message.rewardDenom);
    }
    if (message.distributionStartDate !== undefined) {
      Timestamp.encode(
        message.distributionStartDate,
        writer.uint32(34).fork(),
      ).ldelim();
    }
    if (message.distributionEndDate !== undefined) {
      Timestamp.encode(
        message.distributionEndDate,
        writer.uint32(42).fork(),
      ).ldelim();
    }
    if (message.clawbackDate !== undefined) {
      Timestamp.encode(message.clawbackDate, writer.uint32(50).fork()).ldelim();
    }
    if (message.claimTypeDeadlineDate !== undefined) {
      Timestamp.encode(
        message.claimTypeDeadlineDate,
        writer.uint32(58).fork(),
      ).ldelim();
    }
    if (message.earlyClaimPenalty !== '') {
      writer
        .uint32(66)
        .string(Decimal.fromUserInput(message.earlyClaimPenalty, 18).atomics);
    }
    if (message.distributorAddress !== '') {
      writer.uint32(74).string(message.distributorAddress);
    }
    if (message.allocatorAddress !== '') {
      writer.uint32(82).string(message.allocatorAddress);
    }
    if (message.linkerAddress !== '') {
      writer.uint32(90).string(message.linkerAddress);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgCreateAirdrop {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCreateAirdrop();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.admin = reader.string();
          break;
        case 2:
          message.airdropId = reader.string();
          break;
        case 3:
          message.rewardDenom = reader.string();
          break;
        case 4:
          message.distributionStartDate = Timestamp.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 5:
          message.distributionEndDate = Timestamp.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 6:
          message.clawbackDate = Timestamp.decode(reader, reader.uint32());
          break;
        case 7:
          message.claimTypeDeadlineDate = Timestamp.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 8:
          message.earlyClaimPenalty = Decimal.fromAtomics(
            reader.string(),
            18,
          ).toString();
          break;
        case 9:
          message.distributorAddress = reader.string();
          break;
        case 10:
          message.allocatorAddress = reader.string();
          break;
        case 11:
          message.linkerAddress = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): MsgCreateAirdrop {
    return {
      admin: isSet(object.admin) ? String(object.admin) : '',
      airdropId: isSet(object.airdropId) ? String(object.airdropId) : '',
      rewardDenom: isSet(object.rewardDenom) ? String(object.rewardDenom) : '',
      distributionStartDate: isSet(object.distributionStartDate)
        ? fromJsonTimestamp(object.distributionStartDate)
        : undefined,
      distributionEndDate: isSet(object.distributionEndDate)
        ? fromJsonTimestamp(object.distributionEndDate)
        : undefined,
      clawbackDate: isSet(object.clawbackDate)
        ? fromJsonTimestamp(object.clawbackDate)
        : undefined,
      claimTypeDeadlineDate: isSet(object.claimTypeDeadlineDate)
        ? fromJsonTimestamp(object.claimTypeDeadlineDate)
        : undefined,
      earlyClaimPenalty: isSet(object.earlyClaimPenalty)
        ? String(object.earlyClaimPenalty)
        : '',
      distributorAddress: isSet(object.distributorAddress)
        ? String(object.distributorAddress)
        : '',
      allocatorAddress: isSet(object.allocatorAddress)
        ? String(object.allocatorAddress)
        : '',
      linkerAddress: isSet(object.linkerAddress)
        ? String(object.linkerAddress)
        : '',
    };
  },
  toJSON(message: MsgCreateAirdrop): JsonSafe<MsgCreateAirdrop> {
    const obj: any = {};
    message.admin !== undefined && (obj.admin = message.admin);
    message.airdropId !== undefined && (obj.airdropId = message.airdropId);
    message.rewardDenom !== undefined &&
      (obj.rewardDenom = message.rewardDenom);
    message.distributionStartDate !== undefined &&
      (obj.distributionStartDate = fromTimestamp(
        message.distributionStartDate,
      ).toISOString());
    message.distributionEndDate !== undefined &&
      (obj.distributionEndDate = fromTimestamp(
        message.distributionEndDate,
      ).toISOString());
    message.clawbackDate !== undefined &&
      (obj.clawbackDate = fromTimestamp(message.clawbackDate).toISOString());
    message.claimTypeDeadlineDate !== undefined &&
      (obj.claimTypeDeadlineDate = fromTimestamp(
        message.claimTypeDeadlineDate,
      ).toISOString());
    message.earlyClaimPenalty !== undefined &&
      (obj.earlyClaimPenalty = message.earlyClaimPenalty);
    message.distributorAddress !== undefined &&
      (obj.distributorAddress = message.distributorAddress);
    message.allocatorAddress !== undefined &&
      (obj.allocatorAddress = message.allocatorAddress);
    message.linkerAddress !== undefined &&
      (obj.linkerAddress = message.linkerAddress);
    return obj;
  },
  fromPartial(object: Partial<MsgCreateAirdrop>): MsgCreateAirdrop {
    const message = createBaseMsgCreateAirdrop();
    message.admin = object.admin ?? '';
    message.airdropId = object.airdropId ?? '';
    message.rewardDenom = object.rewardDenom ?? '';
    message.distributionStartDate =
      object.distributionStartDate !== undefined &&
      object.distributionStartDate !== null
        ? Timestamp.fromPartial(object.distributionStartDate)
        : undefined;
    message.distributionEndDate =
      object.distributionEndDate !== undefined &&
      object.distributionEndDate !== null
        ? Timestamp.fromPartial(object.distributionEndDate)
        : undefined;
    message.clawbackDate =
      object.clawbackDate !== undefined && object.clawbackDate !== null
        ? Timestamp.fromPartial(object.clawbackDate)
        : undefined;
    message.claimTypeDeadlineDate =
      object.claimTypeDeadlineDate !== undefined &&
      object.claimTypeDeadlineDate !== null
        ? Timestamp.fromPartial(object.claimTypeDeadlineDate)
        : undefined;
    message.earlyClaimPenalty = object.earlyClaimPenalty ?? '';
    message.distributorAddress = object.distributorAddress ?? '';
    message.allocatorAddress = object.allocatorAddress ?? '';
    message.linkerAddress = object.linkerAddress ?? '';
    return message;
  },
  fromProtoMsg(message: MsgCreateAirdropProtoMsg): MsgCreateAirdrop {
    return MsgCreateAirdrop.decode(message.value);
  },
  toProto(message: MsgCreateAirdrop): Uint8Array {
    return MsgCreateAirdrop.encode(message).finish();
  },
  toProtoMsg(message: MsgCreateAirdrop): MsgCreateAirdropProtoMsg {
    return {
      typeUrl: '/stride.airdrop.MsgCreateAirdrop',
      value: MsgCreateAirdrop.encode(message).finish(),
    };
  },
};
function createBaseMsgCreateAirdropResponse(): MsgCreateAirdropResponse {
  return {};
}
export const MsgCreateAirdropResponse = {
  typeUrl: '/stride.airdrop.MsgCreateAirdropResponse',
  encode(
    _: MsgCreateAirdropResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): MsgCreateAirdropResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCreateAirdropResponse();
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
  fromJSON(_: any): MsgCreateAirdropResponse {
    return {};
  },
  toJSON(_: MsgCreateAirdropResponse): JsonSafe<MsgCreateAirdropResponse> {
    const obj: any = {};
    return obj;
  },
  fromPartial(_: Partial<MsgCreateAirdropResponse>): MsgCreateAirdropResponse {
    const message = createBaseMsgCreateAirdropResponse();
    return message;
  },
  fromProtoMsg(
    message: MsgCreateAirdropResponseProtoMsg,
  ): MsgCreateAirdropResponse {
    return MsgCreateAirdropResponse.decode(message.value);
  },
  toProto(message: MsgCreateAirdropResponse): Uint8Array {
    return MsgCreateAirdropResponse.encode(message).finish();
  },
  toProtoMsg(
    message: MsgCreateAirdropResponse,
  ): MsgCreateAirdropResponseProtoMsg {
    return {
      typeUrl: '/stride.airdrop.MsgCreateAirdropResponse',
      value: MsgCreateAirdropResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgUpdateAirdrop(): MsgUpdateAirdrop {
  return {
    admin: '',
    airdropId: '',
    rewardDenom: '',
    distributionStartDate: undefined,
    distributionEndDate: undefined,
    clawbackDate: undefined,
    claimTypeDeadlineDate: undefined,
    earlyClaimPenalty: '',
    distributorAddress: '',
    allocatorAddress: '',
    linkerAddress: '',
  };
}
export const MsgUpdateAirdrop = {
  typeUrl: '/stride.airdrop.MsgUpdateAirdrop',
  encode(
    message: MsgUpdateAirdrop,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.admin !== '') {
      writer.uint32(10).string(message.admin);
    }
    if (message.airdropId !== '') {
      writer.uint32(18).string(message.airdropId);
    }
    if (message.rewardDenom !== '') {
      writer.uint32(26).string(message.rewardDenom);
    }
    if (message.distributionStartDate !== undefined) {
      Timestamp.encode(
        message.distributionStartDate,
        writer.uint32(34).fork(),
      ).ldelim();
    }
    if (message.distributionEndDate !== undefined) {
      Timestamp.encode(
        message.distributionEndDate,
        writer.uint32(42).fork(),
      ).ldelim();
    }
    if (message.clawbackDate !== undefined) {
      Timestamp.encode(message.clawbackDate, writer.uint32(50).fork()).ldelim();
    }
    if (message.claimTypeDeadlineDate !== undefined) {
      Timestamp.encode(
        message.claimTypeDeadlineDate,
        writer.uint32(58).fork(),
      ).ldelim();
    }
    if (message.earlyClaimPenalty !== '') {
      writer
        .uint32(66)
        .string(Decimal.fromUserInput(message.earlyClaimPenalty, 18).atomics);
    }
    if (message.distributorAddress !== '') {
      writer.uint32(74).string(message.distributorAddress);
    }
    if (message.allocatorAddress !== '') {
      writer.uint32(82).string(message.allocatorAddress);
    }
    if (message.linkerAddress !== '') {
      writer.uint32(90).string(message.linkerAddress);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgUpdateAirdrop {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgUpdateAirdrop();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.admin = reader.string();
          break;
        case 2:
          message.airdropId = reader.string();
          break;
        case 3:
          message.rewardDenom = reader.string();
          break;
        case 4:
          message.distributionStartDate = Timestamp.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 5:
          message.distributionEndDate = Timestamp.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 6:
          message.clawbackDate = Timestamp.decode(reader, reader.uint32());
          break;
        case 7:
          message.claimTypeDeadlineDate = Timestamp.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 8:
          message.earlyClaimPenalty = Decimal.fromAtomics(
            reader.string(),
            18,
          ).toString();
          break;
        case 9:
          message.distributorAddress = reader.string();
          break;
        case 10:
          message.allocatorAddress = reader.string();
          break;
        case 11:
          message.linkerAddress = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): MsgUpdateAirdrop {
    return {
      admin: isSet(object.admin) ? String(object.admin) : '',
      airdropId: isSet(object.airdropId) ? String(object.airdropId) : '',
      rewardDenom: isSet(object.rewardDenom) ? String(object.rewardDenom) : '',
      distributionStartDate: isSet(object.distributionStartDate)
        ? fromJsonTimestamp(object.distributionStartDate)
        : undefined,
      distributionEndDate: isSet(object.distributionEndDate)
        ? fromJsonTimestamp(object.distributionEndDate)
        : undefined,
      clawbackDate: isSet(object.clawbackDate)
        ? fromJsonTimestamp(object.clawbackDate)
        : undefined,
      claimTypeDeadlineDate: isSet(object.claimTypeDeadlineDate)
        ? fromJsonTimestamp(object.claimTypeDeadlineDate)
        : undefined,
      earlyClaimPenalty: isSet(object.earlyClaimPenalty)
        ? String(object.earlyClaimPenalty)
        : '',
      distributorAddress: isSet(object.distributorAddress)
        ? String(object.distributorAddress)
        : '',
      allocatorAddress: isSet(object.allocatorAddress)
        ? String(object.allocatorAddress)
        : '',
      linkerAddress: isSet(object.linkerAddress)
        ? String(object.linkerAddress)
        : '',
    };
  },
  toJSON(message: MsgUpdateAirdrop): JsonSafe<MsgUpdateAirdrop> {
    const obj: any = {};
    message.admin !== undefined && (obj.admin = message.admin);
    message.airdropId !== undefined && (obj.airdropId = message.airdropId);
    message.rewardDenom !== undefined &&
      (obj.rewardDenom = message.rewardDenom);
    message.distributionStartDate !== undefined &&
      (obj.distributionStartDate = fromTimestamp(
        message.distributionStartDate,
      ).toISOString());
    message.distributionEndDate !== undefined &&
      (obj.distributionEndDate = fromTimestamp(
        message.distributionEndDate,
      ).toISOString());
    message.clawbackDate !== undefined &&
      (obj.clawbackDate = fromTimestamp(message.clawbackDate).toISOString());
    message.claimTypeDeadlineDate !== undefined &&
      (obj.claimTypeDeadlineDate = fromTimestamp(
        message.claimTypeDeadlineDate,
      ).toISOString());
    message.earlyClaimPenalty !== undefined &&
      (obj.earlyClaimPenalty = message.earlyClaimPenalty);
    message.distributorAddress !== undefined &&
      (obj.distributorAddress = message.distributorAddress);
    message.allocatorAddress !== undefined &&
      (obj.allocatorAddress = message.allocatorAddress);
    message.linkerAddress !== undefined &&
      (obj.linkerAddress = message.linkerAddress);
    return obj;
  },
  fromPartial(object: Partial<MsgUpdateAirdrop>): MsgUpdateAirdrop {
    const message = createBaseMsgUpdateAirdrop();
    message.admin = object.admin ?? '';
    message.airdropId = object.airdropId ?? '';
    message.rewardDenom = object.rewardDenom ?? '';
    message.distributionStartDate =
      object.distributionStartDate !== undefined &&
      object.distributionStartDate !== null
        ? Timestamp.fromPartial(object.distributionStartDate)
        : undefined;
    message.distributionEndDate =
      object.distributionEndDate !== undefined &&
      object.distributionEndDate !== null
        ? Timestamp.fromPartial(object.distributionEndDate)
        : undefined;
    message.clawbackDate =
      object.clawbackDate !== undefined && object.clawbackDate !== null
        ? Timestamp.fromPartial(object.clawbackDate)
        : undefined;
    message.claimTypeDeadlineDate =
      object.claimTypeDeadlineDate !== undefined &&
      object.claimTypeDeadlineDate !== null
        ? Timestamp.fromPartial(object.claimTypeDeadlineDate)
        : undefined;
    message.earlyClaimPenalty = object.earlyClaimPenalty ?? '';
    message.distributorAddress = object.distributorAddress ?? '';
    message.allocatorAddress = object.allocatorAddress ?? '';
    message.linkerAddress = object.linkerAddress ?? '';
    return message;
  },
  fromProtoMsg(message: MsgUpdateAirdropProtoMsg): MsgUpdateAirdrop {
    return MsgUpdateAirdrop.decode(message.value);
  },
  toProto(message: MsgUpdateAirdrop): Uint8Array {
    return MsgUpdateAirdrop.encode(message).finish();
  },
  toProtoMsg(message: MsgUpdateAirdrop): MsgUpdateAirdropProtoMsg {
    return {
      typeUrl: '/stride.airdrop.MsgUpdateAirdrop',
      value: MsgUpdateAirdrop.encode(message).finish(),
    };
  },
};
function createBaseMsgUpdateAirdropResponse(): MsgUpdateAirdropResponse {
  return {};
}
export const MsgUpdateAirdropResponse = {
  typeUrl: '/stride.airdrop.MsgUpdateAirdropResponse',
  encode(
    _: MsgUpdateAirdropResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): MsgUpdateAirdropResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgUpdateAirdropResponse();
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
  fromJSON(_: any): MsgUpdateAirdropResponse {
    return {};
  },
  toJSON(_: MsgUpdateAirdropResponse): JsonSafe<MsgUpdateAirdropResponse> {
    const obj: any = {};
    return obj;
  },
  fromPartial(_: Partial<MsgUpdateAirdropResponse>): MsgUpdateAirdropResponse {
    const message = createBaseMsgUpdateAirdropResponse();
    return message;
  },
  fromProtoMsg(
    message: MsgUpdateAirdropResponseProtoMsg,
  ): MsgUpdateAirdropResponse {
    return MsgUpdateAirdropResponse.decode(message.value);
  },
  toProto(message: MsgUpdateAirdropResponse): Uint8Array {
    return MsgUpdateAirdropResponse.encode(message).finish();
  },
  toProtoMsg(
    message: MsgUpdateAirdropResponse,
  ): MsgUpdateAirdropResponseProtoMsg {
    return {
      typeUrl: '/stride.airdrop.MsgUpdateAirdropResponse',
      value: MsgUpdateAirdropResponse.encode(message).finish(),
    };
  },
};
function createBaseRawAllocation(): RawAllocation {
  return {
    userAddress: '',
    allocations: [],
  };
}
export const RawAllocation = {
  typeUrl: '/stride.airdrop.RawAllocation',
  encode(
    message: RawAllocation,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.userAddress !== '') {
      writer.uint32(10).string(message.userAddress);
    }
    for (const v of message.allocations) {
      writer.uint32(34).string(v!);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): RawAllocation {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRawAllocation();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.userAddress = reader.string();
          break;
        case 4:
          message.allocations.push(reader.string());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): RawAllocation {
    return {
      userAddress: isSet(object.userAddress) ? String(object.userAddress) : '',
      allocations: Array.isArray(object?.allocations)
        ? object.allocations.map((e: any) => String(e))
        : [],
    };
  },
  toJSON(message: RawAllocation): JsonSafe<RawAllocation> {
    const obj: any = {};
    message.userAddress !== undefined &&
      (obj.userAddress = message.userAddress);
    if (message.allocations) {
      obj.allocations = message.allocations.map(e => e);
    } else {
      obj.allocations = [];
    }
    return obj;
  },
  fromPartial(object: Partial<RawAllocation>): RawAllocation {
    const message = createBaseRawAllocation();
    message.userAddress = object.userAddress ?? '';
    message.allocations = object.allocations?.map(e => e) || [];
    return message;
  },
  fromProtoMsg(message: RawAllocationProtoMsg): RawAllocation {
    return RawAllocation.decode(message.value);
  },
  toProto(message: RawAllocation): Uint8Array {
    return RawAllocation.encode(message).finish();
  },
  toProtoMsg(message: RawAllocation): RawAllocationProtoMsg {
    return {
      typeUrl: '/stride.airdrop.RawAllocation',
      value: RawAllocation.encode(message).finish(),
    };
  },
};
function createBaseMsgAddAllocations(): MsgAddAllocations {
  return {
    admin: '',
    airdropId: '',
    allocations: [],
  };
}
export const MsgAddAllocations = {
  typeUrl: '/stride.airdrop.MsgAddAllocations',
  encode(
    message: MsgAddAllocations,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.admin !== '') {
      writer.uint32(10).string(message.admin);
    }
    if (message.airdropId !== '') {
      writer.uint32(18).string(message.airdropId);
    }
    for (const v of message.allocations) {
      RawAllocation.encode(v!, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgAddAllocations {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgAddAllocations();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.admin = reader.string();
          break;
        case 2:
          message.airdropId = reader.string();
          break;
        case 3:
          message.allocations.push(
            RawAllocation.decode(reader, reader.uint32()),
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): MsgAddAllocations {
    return {
      admin: isSet(object.admin) ? String(object.admin) : '',
      airdropId: isSet(object.airdropId) ? String(object.airdropId) : '',
      allocations: Array.isArray(object?.allocations)
        ? object.allocations.map((e: any) => RawAllocation.fromJSON(e))
        : [],
    };
  },
  toJSON(message: MsgAddAllocations): JsonSafe<MsgAddAllocations> {
    const obj: any = {};
    message.admin !== undefined && (obj.admin = message.admin);
    message.airdropId !== undefined && (obj.airdropId = message.airdropId);
    if (message.allocations) {
      obj.allocations = message.allocations.map(e =>
        e ? RawAllocation.toJSON(e) : undefined,
      );
    } else {
      obj.allocations = [];
    }
    return obj;
  },
  fromPartial(object: Partial<MsgAddAllocations>): MsgAddAllocations {
    const message = createBaseMsgAddAllocations();
    message.admin = object.admin ?? '';
    message.airdropId = object.airdropId ?? '';
    message.allocations =
      object.allocations?.map(e => RawAllocation.fromPartial(e)) || [];
    return message;
  },
  fromProtoMsg(message: MsgAddAllocationsProtoMsg): MsgAddAllocations {
    return MsgAddAllocations.decode(message.value);
  },
  toProto(message: MsgAddAllocations): Uint8Array {
    return MsgAddAllocations.encode(message).finish();
  },
  toProtoMsg(message: MsgAddAllocations): MsgAddAllocationsProtoMsg {
    return {
      typeUrl: '/stride.airdrop.MsgAddAllocations',
      value: MsgAddAllocations.encode(message).finish(),
    };
  },
};
function createBaseMsgAddAllocationsResponse(): MsgAddAllocationsResponse {
  return {};
}
export const MsgAddAllocationsResponse = {
  typeUrl: '/stride.airdrop.MsgAddAllocationsResponse',
  encode(
    _: MsgAddAllocationsResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): MsgAddAllocationsResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgAddAllocationsResponse();
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
  fromJSON(_: any): MsgAddAllocationsResponse {
    return {};
  },
  toJSON(_: MsgAddAllocationsResponse): JsonSafe<MsgAddAllocationsResponse> {
    const obj: any = {};
    return obj;
  },
  fromPartial(
    _: Partial<MsgAddAllocationsResponse>,
  ): MsgAddAllocationsResponse {
    const message = createBaseMsgAddAllocationsResponse();
    return message;
  },
  fromProtoMsg(
    message: MsgAddAllocationsResponseProtoMsg,
  ): MsgAddAllocationsResponse {
    return MsgAddAllocationsResponse.decode(message.value);
  },
  toProto(message: MsgAddAllocationsResponse): Uint8Array {
    return MsgAddAllocationsResponse.encode(message).finish();
  },
  toProtoMsg(
    message: MsgAddAllocationsResponse,
  ): MsgAddAllocationsResponseProtoMsg {
    return {
      typeUrl: '/stride.airdrop.MsgAddAllocationsResponse',
      value: MsgAddAllocationsResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgUpdateUserAllocation(): MsgUpdateUserAllocation {
  return {
    admin: '',
    airdropId: '',
    userAddress: '',
    allocations: [],
  };
}
export const MsgUpdateUserAllocation = {
  typeUrl: '/stride.airdrop.MsgUpdateUserAllocation',
  encode(
    message: MsgUpdateUserAllocation,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.admin !== '') {
      writer.uint32(10).string(message.admin);
    }
    if (message.airdropId !== '') {
      writer.uint32(18).string(message.airdropId);
    }
    if (message.userAddress !== '') {
      writer.uint32(26).string(message.userAddress);
    }
    for (const v of message.allocations) {
      writer.uint32(34).string(v!);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): MsgUpdateUserAllocation {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgUpdateUserAllocation();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.admin = reader.string();
          break;
        case 2:
          message.airdropId = reader.string();
          break;
        case 3:
          message.userAddress = reader.string();
          break;
        case 4:
          message.allocations.push(reader.string());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): MsgUpdateUserAllocation {
    return {
      admin: isSet(object.admin) ? String(object.admin) : '',
      airdropId: isSet(object.airdropId) ? String(object.airdropId) : '',
      userAddress: isSet(object.userAddress) ? String(object.userAddress) : '',
      allocations: Array.isArray(object?.allocations)
        ? object.allocations.map((e: any) => String(e))
        : [],
    };
  },
  toJSON(message: MsgUpdateUserAllocation): JsonSafe<MsgUpdateUserAllocation> {
    const obj: any = {};
    message.admin !== undefined && (obj.admin = message.admin);
    message.airdropId !== undefined && (obj.airdropId = message.airdropId);
    message.userAddress !== undefined &&
      (obj.userAddress = message.userAddress);
    if (message.allocations) {
      obj.allocations = message.allocations.map(e => e);
    } else {
      obj.allocations = [];
    }
    return obj;
  },
  fromPartial(
    object: Partial<MsgUpdateUserAllocation>,
  ): MsgUpdateUserAllocation {
    const message = createBaseMsgUpdateUserAllocation();
    message.admin = object.admin ?? '';
    message.airdropId = object.airdropId ?? '';
    message.userAddress = object.userAddress ?? '';
    message.allocations = object.allocations?.map(e => e) || [];
    return message;
  },
  fromProtoMsg(
    message: MsgUpdateUserAllocationProtoMsg,
  ): MsgUpdateUserAllocation {
    return MsgUpdateUserAllocation.decode(message.value);
  },
  toProto(message: MsgUpdateUserAllocation): Uint8Array {
    return MsgUpdateUserAllocation.encode(message).finish();
  },
  toProtoMsg(
    message: MsgUpdateUserAllocation,
  ): MsgUpdateUserAllocationProtoMsg {
    return {
      typeUrl: '/stride.airdrop.MsgUpdateUserAllocation',
      value: MsgUpdateUserAllocation.encode(message).finish(),
    };
  },
};
function createBaseMsgUpdateUserAllocationResponse(): MsgUpdateUserAllocationResponse {
  return {};
}
export const MsgUpdateUserAllocationResponse = {
  typeUrl: '/stride.airdrop.MsgUpdateUserAllocationResponse',
  encode(
    _: MsgUpdateUserAllocationResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): MsgUpdateUserAllocationResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgUpdateUserAllocationResponse();
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
  fromJSON(_: any): MsgUpdateUserAllocationResponse {
    return {};
  },
  toJSON(
    _: MsgUpdateUserAllocationResponse,
  ): JsonSafe<MsgUpdateUserAllocationResponse> {
    const obj: any = {};
    return obj;
  },
  fromPartial(
    _: Partial<MsgUpdateUserAllocationResponse>,
  ): MsgUpdateUserAllocationResponse {
    const message = createBaseMsgUpdateUserAllocationResponse();
    return message;
  },
  fromProtoMsg(
    message: MsgUpdateUserAllocationResponseProtoMsg,
  ): MsgUpdateUserAllocationResponse {
    return MsgUpdateUserAllocationResponse.decode(message.value);
  },
  toProto(message: MsgUpdateUserAllocationResponse): Uint8Array {
    return MsgUpdateUserAllocationResponse.encode(message).finish();
  },
  toProtoMsg(
    message: MsgUpdateUserAllocationResponse,
  ): MsgUpdateUserAllocationResponseProtoMsg {
    return {
      typeUrl: '/stride.airdrop.MsgUpdateUserAllocationResponse',
      value: MsgUpdateUserAllocationResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgLinkAddresses(): MsgLinkAddresses {
  return {
    admin: '',
    airdropId: '',
    strideAddress: '',
    hostAddress: '',
  };
}
export const MsgLinkAddresses = {
  typeUrl: '/stride.airdrop.MsgLinkAddresses',
  encode(
    message: MsgLinkAddresses,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.admin !== '') {
      writer.uint32(10).string(message.admin);
    }
    if (message.airdropId !== '') {
      writer.uint32(18).string(message.airdropId);
    }
    if (message.strideAddress !== '') {
      writer.uint32(26).string(message.strideAddress);
    }
    if (message.hostAddress !== '') {
      writer.uint32(34).string(message.hostAddress);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgLinkAddresses {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgLinkAddresses();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.admin = reader.string();
          break;
        case 2:
          message.airdropId = reader.string();
          break;
        case 3:
          message.strideAddress = reader.string();
          break;
        case 4:
          message.hostAddress = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): MsgLinkAddresses {
    return {
      admin: isSet(object.admin) ? String(object.admin) : '',
      airdropId: isSet(object.airdropId) ? String(object.airdropId) : '',
      strideAddress: isSet(object.strideAddress)
        ? String(object.strideAddress)
        : '',
      hostAddress: isSet(object.hostAddress) ? String(object.hostAddress) : '',
    };
  },
  toJSON(message: MsgLinkAddresses): JsonSafe<MsgLinkAddresses> {
    const obj: any = {};
    message.admin !== undefined && (obj.admin = message.admin);
    message.airdropId !== undefined && (obj.airdropId = message.airdropId);
    message.strideAddress !== undefined &&
      (obj.strideAddress = message.strideAddress);
    message.hostAddress !== undefined &&
      (obj.hostAddress = message.hostAddress);
    return obj;
  },
  fromPartial(object: Partial<MsgLinkAddresses>): MsgLinkAddresses {
    const message = createBaseMsgLinkAddresses();
    message.admin = object.admin ?? '';
    message.airdropId = object.airdropId ?? '';
    message.strideAddress = object.strideAddress ?? '';
    message.hostAddress = object.hostAddress ?? '';
    return message;
  },
  fromProtoMsg(message: MsgLinkAddressesProtoMsg): MsgLinkAddresses {
    return MsgLinkAddresses.decode(message.value);
  },
  toProto(message: MsgLinkAddresses): Uint8Array {
    return MsgLinkAddresses.encode(message).finish();
  },
  toProtoMsg(message: MsgLinkAddresses): MsgLinkAddressesProtoMsg {
    return {
      typeUrl: '/stride.airdrop.MsgLinkAddresses',
      value: MsgLinkAddresses.encode(message).finish(),
    };
  },
};
function createBaseMsgLinkAddressesResponse(): MsgLinkAddressesResponse {
  return {};
}
export const MsgLinkAddressesResponse = {
  typeUrl: '/stride.airdrop.MsgLinkAddressesResponse',
  encode(
    _: MsgLinkAddressesResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): MsgLinkAddressesResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgLinkAddressesResponse();
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
  fromJSON(_: any): MsgLinkAddressesResponse {
    return {};
  },
  toJSON(_: MsgLinkAddressesResponse): JsonSafe<MsgLinkAddressesResponse> {
    const obj: any = {};
    return obj;
  },
  fromPartial(_: Partial<MsgLinkAddressesResponse>): MsgLinkAddressesResponse {
    const message = createBaseMsgLinkAddressesResponse();
    return message;
  },
  fromProtoMsg(
    message: MsgLinkAddressesResponseProtoMsg,
  ): MsgLinkAddressesResponse {
    return MsgLinkAddressesResponse.decode(message.value);
  },
  toProto(message: MsgLinkAddressesResponse): Uint8Array {
    return MsgLinkAddressesResponse.encode(message).finish();
  },
  toProtoMsg(
    message: MsgLinkAddressesResponse,
  ): MsgLinkAddressesResponseProtoMsg {
    return {
      typeUrl: '/stride.airdrop.MsgLinkAddressesResponse',
      value: MsgLinkAddressesResponse.encode(message).finish(),
    };
  },
};
