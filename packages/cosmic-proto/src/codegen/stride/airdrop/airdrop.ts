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
/**
 * ClaimType enum represents the possible claim types for a user getting an
 * airdrop
 */
export enum ClaimType {
  /**
   * CLAIM_DAILY - CLAIM_DAILY indicates that the airdrop rewards are accumulated daily
   * A user can claim daily up front and change their decision within the
   * deadline window
   * This type is assigned to the user by default when their allocations are
   * added
   */
  CLAIM_DAILY = 0,
  /**
   * CLAIM_EARLY - CLAIM_EARLY indicates that the airdrop rewards have been claimed early,
   * with half going to the user and half being clawed back
   */
  CLAIM_EARLY = 1,
  UNRECOGNIZED = -1,
}
export const ClaimTypeSDKType = ClaimType;
export function claimTypeFromJSON(object: any): ClaimType {
  switch (object) {
    case 0:
    case 'CLAIM_DAILY':
      return ClaimType.CLAIM_DAILY;
    case 1:
    case 'CLAIM_EARLY':
      return ClaimType.CLAIM_EARLY;
    case -1:
    case 'UNRECOGNIZED':
    default:
      return ClaimType.UNRECOGNIZED;
  }
}
export function claimTypeToJSON(object: ClaimType): string {
  switch (object) {
    case ClaimType.CLAIM_DAILY:
      return 'CLAIM_DAILY';
    case ClaimType.CLAIM_EARLY:
      return 'CLAIM_EARLY';
    case ClaimType.UNRECOGNIZED:
    default:
      return 'UNRECOGNIZED';
  }
}
/** Airdrop module parameters */
export interface Params {
  /**
   * The number of seconds between each element in the allocations array
   * In practice this is always 24 hours, but it's customizable for testing
   */
  periodLengthSeconds: bigint;
}
export interface ParamsProtoMsg {
  typeUrl: '/stride.airdrop.Params';
  value: Uint8Array;
}
/** Airdrop module parameters */
export interface ParamsSDKType {
  period_length_seconds: bigint;
}
/**
 * UserAllocation tracks the status of an allocation for a user on a specific
 * airdrop
 */
export interface UserAllocation {
  /** ID of the airdrop */
  airdropId: string;
  /**
   * Address of the account that is receiving the airdrop allocation
   * The address does not have to be a stride address - but non-stride addresses
   * must be linked and merged into a stride address before claiming
   */
  address: string;
  /** The total amount of tokens that have already been claimed */
  claimed: string;
  /**
   * The total amount of tokens that have been forfeited by the user for
   * claiming early
   */
  forfeited: string;
  /**
   * The current state of allocations for this airdrop
   *
   * Ex 1:
   *   Day 0: {claimed:0, allocations:[10,10,10]}
   *   *MsgClaim*
   *   Day 1: {claimed:10, allocations:[0,10,10]}
   *   *MsgClaim*
   *   Day 2: {claimed:20, allocations:[0,0,10]}
   *
   * Ex 2:
   *   Day 0: {claimed:0, allocations:[10,10,10]}
   *   *MsgClaimEarly*
   *   Day 1: {claimed:15, forfeited:15, allocations:[0,0,0]}
   */
  allocations: string[];
}
export interface UserAllocationProtoMsg {
  typeUrl: '/stride.airdrop.UserAllocation';
  value: Uint8Array;
}
/**
 * UserAllocation tracks the status of an allocation for a user on a specific
 * airdrop
 */
export interface UserAllocationSDKType {
  airdrop_id: string;
  address: string;
  claimed: string;
  forfeited: string;
  allocations: string[];
}
/** Airdrop track the aggregate unbondings across an epoch */
export interface Airdrop {
  /** Airdrop ID */
  id: string;
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
export interface AirdropProtoMsg {
  typeUrl: '/stride.airdrop.Airdrop';
  value: Uint8Array;
}
/** Airdrop track the aggregate unbondings across an epoch */
export interface AirdropSDKType {
  id: string;
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
function createBaseParams(): Params {
  return {
    periodLengthSeconds: BigInt(0),
  };
}
export const Params = {
  typeUrl: '/stride.airdrop.Params',
  encode(
    message: Params,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.periodLengthSeconds !== BigInt(0)) {
      writer.uint32(8).int64(message.periodLengthSeconds);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): Params {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseParams();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.periodLengthSeconds = reader.int64();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): Params {
    return {
      periodLengthSeconds: isSet(object.periodLengthSeconds)
        ? BigInt(object.periodLengthSeconds.toString())
        : BigInt(0),
    };
  },
  toJSON(message: Params): JsonSafe<Params> {
    const obj: any = {};
    message.periodLengthSeconds !== undefined &&
      (obj.periodLengthSeconds = (
        message.periodLengthSeconds || BigInt(0)
      ).toString());
    return obj;
  },
  fromPartial(object: Partial<Params>): Params {
    const message = createBaseParams();
    message.periodLengthSeconds =
      object.periodLengthSeconds !== undefined &&
      object.periodLengthSeconds !== null
        ? BigInt(object.periodLengthSeconds.toString())
        : BigInt(0);
    return message;
  },
  fromProtoMsg(message: ParamsProtoMsg): Params {
    return Params.decode(message.value);
  },
  toProto(message: Params): Uint8Array {
    return Params.encode(message).finish();
  },
  toProtoMsg(message: Params): ParamsProtoMsg {
    return {
      typeUrl: '/stride.airdrop.Params',
      value: Params.encode(message).finish(),
    };
  },
};
function createBaseUserAllocation(): UserAllocation {
  return {
    airdropId: '',
    address: '',
    claimed: '',
    forfeited: '',
    allocations: [],
  };
}
export const UserAllocation = {
  typeUrl: '/stride.airdrop.UserAllocation',
  encode(
    message: UserAllocation,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.airdropId !== '') {
      writer.uint32(10).string(message.airdropId);
    }
    if (message.address !== '') {
      writer.uint32(18).string(message.address);
    }
    if (message.claimed !== '') {
      writer.uint32(26).string(message.claimed);
    }
    if (message.forfeited !== '') {
      writer.uint32(34).string(message.forfeited);
    }
    for (const v of message.allocations) {
      writer.uint32(42).string(v!);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): UserAllocation {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUserAllocation();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.airdropId = reader.string();
          break;
        case 2:
          message.address = reader.string();
          break;
        case 3:
          message.claimed = reader.string();
          break;
        case 4:
          message.forfeited = reader.string();
          break;
        case 5:
          message.allocations.push(reader.string());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): UserAllocation {
    return {
      airdropId: isSet(object.airdropId) ? String(object.airdropId) : '',
      address: isSet(object.address) ? String(object.address) : '',
      claimed: isSet(object.claimed) ? String(object.claimed) : '',
      forfeited: isSet(object.forfeited) ? String(object.forfeited) : '',
      allocations: Array.isArray(object?.allocations)
        ? object.allocations.map((e: any) => String(e))
        : [],
    };
  },
  toJSON(message: UserAllocation): JsonSafe<UserAllocation> {
    const obj: any = {};
    message.airdropId !== undefined && (obj.airdropId = message.airdropId);
    message.address !== undefined && (obj.address = message.address);
    message.claimed !== undefined && (obj.claimed = message.claimed);
    message.forfeited !== undefined && (obj.forfeited = message.forfeited);
    if (message.allocations) {
      obj.allocations = message.allocations.map(e => e);
    } else {
      obj.allocations = [];
    }
    return obj;
  },
  fromPartial(object: Partial<UserAllocation>): UserAllocation {
    const message = createBaseUserAllocation();
    message.airdropId = object.airdropId ?? '';
    message.address = object.address ?? '';
    message.claimed = object.claimed ?? '';
    message.forfeited = object.forfeited ?? '';
    message.allocations = object.allocations?.map(e => e) || [];
    return message;
  },
  fromProtoMsg(message: UserAllocationProtoMsg): UserAllocation {
    return UserAllocation.decode(message.value);
  },
  toProto(message: UserAllocation): Uint8Array {
    return UserAllocation.encode(message).finish();
  },
  toProtoMsg(message: UserAllocation): UserAllocationProtoMsg {
    return {
      typeUrl: '/stride.airdrop.UserAllocation',
      value: UserAllocation.encode(message).finish(),
    };
  },
};
function createBaseAirdrop(): Airdrop {
  return {
    id: '',
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
export const Airdrop = {
  typeUrl: '/stride.airdrop.Airdrop',
  encode(
    message: Airdrop,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.id !== '') {
      writer.uint32(10).string(message.id);
    }
    if (message.rewardDenom !== '') {
      writer.uint32(18).string(message.rewardDenom);
    }
    if (message.distributionStartDate !== undefined) {
      Timestamp.encode(
        message.distributionStartDate,
        writer.uint32(26).fork(),
      ).ldelim();
    }
    if (message.distributionEndDate !== undefined) {
      Timestamp.encode(
        message.distributionEndDate,
        writer.uint32(34).fork(),
      ).ldelim();
    }
    if (message.clawbackDate !== undefined) {
      Timestamp.encode(message.clawbackDate, writer.uint32(42).fork()).ldelim();
    }
    if (message.claimTypeDeadlineDate !== undefined) {
      Timestamp.encode(
        message.claimTypeDeadlineDate,
        writer.uint32(50).fork(),
      ).ldelim();
    }
    if (message.earlyClaimPenalty !== '') {
      writer
        .uint32(58)
        .string(Decimal.fromUserInput(message.earlyClaimPenalty, 18).atomics);
    }
    if (message.distributorAddress !== '') {
      writer.uint32(66).string(message.distributorAddress);
    }
    if (message.allocatorAddress !== '') {
      writer.uint32(74).string(message.allocatorAddress);
    }
    if (message.linkerAddress !== '') {
      writer.uint32(82).string(message.linkerAddress);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): Airdrop {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAirdrop();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.id = reader.string();
          break;
        case 2:
          message.rewardDenom = reader.string();
          break;
        case 3:
          message.distributionStartDate = Timestamp.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 4:
          message.distributionEndDate = Timestamp.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 5:
          message.clawbackDate = Timestamp.decode(reader, reader.uint32());
          break;
        case 6:
          message.claimTypeDeadlineDate = Timestamp.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 7:
          message.earlyClaimPenalty = Decimal.fromAtomics(
            reader.string(),
            18,
          ).toString();
          break;
        case 8:
          message.distributorAddress = reader.string();
          break;
        case 9:
          message.allocatorAddress = reader.string();
          break;
        case 10:
          message.linkerAddress = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): Airdrop {
    return {
      id: isSet(object.id) ? String(object.id) : '',
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
  toJSON(message: Airdrop): JsonSafe<Airdrop> {
    const obj: any = {};
    message.id !== undefined && (obj.id = message.id);
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
  fromPartial(object: Partial<Airdrop>): Airdrop {
    const message = createBaseAirdrop();
    message.id = object.id ?? '';
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
  fromProtoMsg(message: AirdropProtoMsg): Airdrop {
    return Airdrop.decode(message.value);
  },
  toProto(message: Airdrop): Uint8Array {
    return Airdrop.encode(message).finish();
  },
  toProtoMsg(message: Airdrop): AirdropProtoMsg {
    return {
      typeUrl: '/stride.airdrop.Airdrop',
      value: Airdrop.encode(message).finish(),
    };
  },
};
