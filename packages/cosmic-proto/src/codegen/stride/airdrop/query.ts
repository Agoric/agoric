//@ts-nocheck
import {
  PageRequest,
  type PageRequestSDKType,
  PageResponse,
  type PageResponseSDKType,
} from '../../cosmos/base/query/v1beta1/pagination.js';
import {
  Timestamp,
  type TimestampSDKType,
} from '../../google/protobuf/timestamp.js';
import {
  Airdrop,
  type AirdropSDKType,
  UserAllocation,
  type UserAllocationSDKType,
} from './airdrop.js';
import { BinaryReader, BinaryWriter } from '../../binary.js';
import {
  isSet,
  Decimal,
  fromJsonTimestamp,
  fromTimestamp,
} from '../../helpers.js';
import { type JsonSafe } from '../../json-safe.js';
/** Airdrop */
export interface QueryAirdropRequest {
  id: string;
}
export interface QueryAirdropRequestProtoMsg {
  typeUrl: '/stride.airdrop.QueryAirdropRequest';
  value: Uint8Array;
}
/** Airdrop */
export interface QueryAirdropRequestSDKType {
  id: string;
}
export interface QueryAirdropResponse {
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
  /** The current date index into the airdrop array */
  currentDateIndex: bigint;
  /** The length of the airdrop (i.e. number of periods in the airdrop array) */
  airdropLength: bigint;
}
export interface QueryAirdropResponseProtoMsg {
  typeUrl: '/stride.airdrop.QueryAirdropResponse';
  value: Uint8Array;
}
export interface QueryAirdropResponseSDKType {
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
  current_date_index: bigint;
  airdrop_length: bigint;
}
/** Airdrops */
export interface QueryAllAirdropsRequest {}
export interface QueryAllAirdropsRequestProtoMsg {
  typeUrl: '/stride.airdrop.QueryAllAirdropsRequest';
  value: Uint8Array;
}
/** Airdrops */
export interface QueryAllAirdropsRequestSDKType {}
export interface QueryAllAirdropsResponse {
  airdrops: Airdrop[];
}
export interface QueryAllAirdropsResponseProtoMsg {
  typeUrl: '/stride.airdrop.QueryAllAirdropsResponse';
  value: Uint8Array;
}
export interface QueryAllAirdropsResponseSDKType {
  airdrops: AirdropSDKType[];
}
/** UserAllocation */
export interface QueryUserAllocationRequest {
  airdropId: string;
  address: string;
}
export interface QueryUserAllocationRequestProtoMsg {
  typeUrl: '/stride.airdrop.QueryUserAllocationRequest';
  value: Uint8Array;
}
/** UserAllocation */
export interface QueryUserAllocationRequestSDKType {
  airdrop_id: string;
  address: string;
}
export interface QueryUserAllocationResponse {
  userAllocation?: UserAllocation;
}
export interface QueryUserAllocationResponseProtoMsg {
  typeUrl: '/stride.airdrop.QueryUserAllocationResponse';
  value: Uint8Array;
}
export interface QueryUserAllocationResponseSDKType {
  user_allocation?: UserAllocationSDKType;
}
/** UserAllocations */
export interface QueryUserAllocationsRequest {
  address: string;
}
export interface QueryUserAllocationsRequestProtoMsg {
  typeUrl: '/stride.airdrop.QueryUserAllocationsRequest';
  value: Uint8Array;
}
/** UserAllocations */
export interface QueryUserAllocationsRequestSDKType {
  address: string;
}
export interface QueryUserAllocationsResponse {
  userAllocations: UserAllocation[];
}
export interface QueryUserAllocationsResponseProtoMsg {
  typeUrl: '/stride.airdrop.QueryUserAllocationsResponse';
  value: Uint8Array;
}
export interface QueryUserAllocationsResponseSDKType {
  user_allocations: UserAllocationSDKType[];
}
/** AllAllocations */
export interface QueryAllAllocationsRequest {
  airdropId: string;
  pagination?: PageRequest;
}
export interface QueryAllAllocationsRequestProtoMsg {
  typeUrl: '/stride.airdrop.QueryAllAllocationsRequest';
  value: Uint8Array;
}
/** AllAllocations */
export interface QueryAllAllocationsRequestSDKType {
  airdrop_id: string;
  pagination?: PageRequestSDKType;
}
export interface QueryAllAllocationsResponse {
  allocations: UserAllocation[];
  pagination?: PageResponse;
}
export interface QueryAllAllocationsResponseProtoMsg {
  typeUrl: '/stride.airdrop.QueryAllAllocationsResponse';
  value: Uint8Array;
}
export interface QueryAllAllocationsResponseSDKType {
  allocations: UserAllocationSDKType[];
  pagination?: PageResponseSDKType;
}
/** UserSummary */
export interface QueryUserSummaryRequest {
  airdropId: string;
  address: string;
}
export interface QueryUserSummaryRequestProtoMsg {
  typeUrl: '/stride.airdrop.QueryUserSummaryRequest';
  value: Uint8Array;
}
/** UserSummary */
export interface QueryUserSummaryRequestSDKType {
  airdrop_id: string;
  address: string;
}
export interface QueryUserSummaryResponse {
  /** The claim type (claim daily or claim early) */
  claimType: string;
  /** The total rewards claimed so far */
  claimed: string;
  /** The total rewards forfeited (in the case of claiming early) */
  forfeited: string;
  /** The total rewards remaining */
  remaining: string;
  /** The total rewards that can be claimed right now */
  claimable: string;
}
export interface QueryUserSummaryResponseProtoMsg {
  typeUrl: '/stride.airdrop.QueryUserSummaryResponse';
  value: Uint8Array;
}
export interface QueryUserSummaryResponseSDKType {
  claim_type: string;
  claimed: string;
  forfeited: string;
  remaining: string;
  claimable: string;
}
function createBaseQueryAirdropRequest(): QueryAirdropRequest {
  return {
    id: '',
  };
}
export const QueryAirdropRequest = {
  typeUrl: '/stride.airdrop.QueryAirdropRequest',
  encode(
    message: QueryAirdropRequest,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.id !== '') {
      writer.uint32(10).string(message.id);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryAirdropRequest {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryAirdropRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.id = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryAirdropRequest {
    return {
      id: isSet(object.id) ? String(object.id) : '',
    };
  },
  toJSON(message: QueryAirdropRequest): JsonSafe<QueryAirdropRequest> {
    const obj: any = {};
    message.id !== undefined && (obj.id = message.id);
    return obj;
  },
  fromPartial(object: Partial<QueryAirdropRequest>): QueryAirdropRequest {
    const message = createBaseQueryAirdropRequest();
    message.id = object.id ?? '';
    return message;
  },
  fromProtoMsg(message: QueryAirdropRequestProtoMsg): QueryAirdropRequest {
    return QueryAirdropRequest.decode(message.value);
  },
  toProto(message: QueryAirdropRequest): Uint8Array {
    return QueryAirdropRequest.encode(message).finish();
  },
  toProtoMsg(message: QueryAirdropRequest): QueryAirdropRequestProtoMsg {
    return {
      typeUrl: '/stride.airdrop.QueryAirdropRequest',
      value: QueryAirdropRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryAirdropResponse(): QueryAirdropResponse {
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
    currentDateIndex: BigInt(0),
    airdropLength: BigInt(0),
  };
}
export const QueryAirdropResponse = {
  typeUrl: '/stride.airdrop.QueryAirdropResponse',
  encode(
    message: QueryAirdropResponse,
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
    if (message.currentDateIndex !== BigInt(0)) {
      writer.uint32(88).int64(message.currentDateIndex);
    }
    if (message.airdropLength !== BigInt(0)) {
      writer.uint32(96).int64(message.airdropLength);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryAirdropResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryAirdropResponse();
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
        case 11:
          message.currentDateIndex = reader.int64();
          break;
        case 12:
          message.airdropLength = reader.int64();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryAirdropResponse {
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
      currentDateIndex: isSet(object.currentDateIndex)
        ? BigInt(object.currentDateIndex.toString())
        : BigInt(0),
      airdropLength: isSet(object.airdropLength)
        ? BigInt(object.airdropLength.toString())
        : BigInt(0),
    };
  },
  toJSON(message: QueryAirdropResponse): JsonSafe<QueryAirdropResponse> {
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
    message.currentDateIndex !== undefined &&
      (obj.currentDateIndex = (
        message.currentDateIndex || BigInt(0)
      ).toString());
    message.airdropLength !== undefined &&
      (obj.airdropLength = (message.airdropLength || BigInt(0)).toString());
    return obj;
  },
  fromPartial(object: Partial<QueryAirdropResponse>): QueryAirdropResponse {
    const message = createBaseQueryAirdropResponse();
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
    message.currentDateIndex =
      object.currentDateIndex !== undefined && object.currentDateIndex !== null
        ? BigInt(object.currentDateIndex.toString())
        : BigInt(0);
    message.airdropLength =
      object.airdropLength !== undefined && object.airdropLength !== null
        ? BigInt(object.airdropLength.toString())
        : BigInt(0);
    return message;
  },
  fromProtoMsg(message: QueryAirdropResponseProtoMsg): QueryAirdropResponse {
    return QueryAirdropResponse.decode(message.value);
  },
  toProto(message: QueryAirdropResponse): Uint8Array {
    return QueryAirdropResponse.encode(message).finish();
  },
  toProtoMsg(message: QueryAirdropResponse): QueryAirdropResponseProtoMsg {
    return {
      typeUrl: '/stride.airdrop.QueryAirdropResponse',
      value: QueryAirdropResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryAllAirdropsRequest(): QueryAllAirdropsRequest {
  return {};
}
export const QueryAllAirdropsRequest = {
  typeUrl: '/stride.airdrop.QueryAllAirdropsRequest',
  encode(
    _: QueryAllAirdropsRequest,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryAllAirdropsRequest {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryAllAirdropsRequest();
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
  fromJSON(_: any): QueryAllAirdropsRequest {
    return {};
  },
  toJSON(_: QueryAllAirdropsRequest): JsonSafe<QueryAllAirdropsRequest> {
    const obj: any = {};
    return obj;
  },
  fromPartial(_: Partial<QueryAllAirdropsRequest>): QueryAllAirdropsRequest {
    const message = createBaseQueryAllAirdropsRequest();
    return message;
  },
  fromProtoMsg(
    message: QueryAllAirdropsRequestProtoMsg,
  ): QueryAllAirdropsRequest {
    return QueryAllAirdropsRequest.decode(message.value);
  },
  toProto(message: QueryAllAirdropsRequest): Uint8Array {
    return QueryAllAirdropsRequest.encode(message).finish();
  },
  toProtoMsg(
    message: QueryAllAirdropsRequest,
  ): QueryAllAirdropsRequestProtoMsg {
    return {
      typeUrl: '/stride.airdrop.QueryAllAirdropsRequest',
      value: QueryAllAirdropsRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryAllAirdropsResponse(): QueryAllAirdropsResponse {
  return {
    airdrops: [],
  };
}
export const QueryAllAirdropsResponse = {
  typeUrl: '/stride.airdrop.QueryAllAirdropsResponse',
  encode(
    message: QueryAllAirdropsResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    for (const v of message.airdrops) {
      Airdrop.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryAllAirdropsResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryAllAirdropsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.airdrops.push(Airdrop.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryAllAirdropsResponse {
    return {
      airdrops: Array.isArray(object?.airdrops)
        ? object.airdrops.map((e: any) => Airdrop.fromJSON(e))
        : [],
    };
  },
  toJSON(
    message: QueryAllAirdropsResponse,
  ): JsonSafe<QueryAllAirdropsResponse> {
    const obj: any = {};
    if (message.airdrops) {
      obj.airdrops = message.airdrops.map(e =>
        e ? Airdrop.toJSON(e) : undefined,
      );
    } else {
      obj.airdrops = [];
    }
    return obj;
  },
  fromPartial(
    object: Partial<QueryAllAirdropsResponse>,
  ): QueryAllAirdropsResponse {
    const message = createBaseQueryAllAirdropsResponse();
    message.airdrops = object.airdrops?.map(e => Airdrop.fromPartial(e)) || [];
    return message;
  },
  fromProtoMsg(
    message: QueryAllAirdropsResponseProtoMsg,
  ): QueryAllAirdropsResponse {
    return QueryAllAirdropsResponse.decode(message.value);
  },
  toProto(message: QueryAllAirdropsResponse): Uint8Array {
    return QueryAllAirdropsResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QueryAllAirdropsResponse,
  ): QueryAllAirdropsResponseProtoMsg {
    return {
      typeUrl: '/stride.airdrop.QueryAllAirdropsResponse',
      value: QueryAllAirdropsResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryUserAllocationRequest(): QueryUserAllocationRequest {
  return {
    airdropId: '',
    address: '',
  };
}
export const QueryUserAllocationRequest = {
  typeUrl: '/stride.airdrop.QueryUserAllocationRequest',
  encode(
    message: QueryUserAllocationRequest,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.airdropId !== '') {
      writer.uint32(10).string(message.airdropId);
    }
    if (message.address !== '') {
      writer.uint32(18).string(message.address);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryUserAllocationRequest {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryUserAllocationRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.airdropId = reader.string();
          break;
        case 2:
          message.address = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryUserAllocationRequest {
    return {
      airdropId: isSet(object.airdropId) ? String(object.airdropId) : '',
      address: isSet(object.address) ? String(object.address) : '',
    };
  },
  toJSON(
    message: QueryUserAllocationRequest,
  ): JsonSafe<QueryUserAllocationRequest> {
    const obj: any = {};
    message.airdropId !== undefined && (obj.airdropId = message.airdropId);
    message.address !== undefined && (obj.address = message.address);
    return obj;
  },
  fromPartial(
    object: Partial<QueryUserAllocationRequest>,
  ): QueryUserAllocationRequest {
    const message = createBaseQueryUserAllocationRequest();
    message.airdropId = object.airdropId ?? '';
    message.address = object.address ?? '';
    return message;
  },
  fromProtoMsg(
    message: QueryUserAllocationRequestProtoMsg,
  ): QueryUserAllocationRequest {
    return QueryUserAllocationRequest.decode(message.value);
  },
  toProto(message: QueryUserAllocationRequest): Uint8Array {
    return QueryUserAllocationRequest.encode(message).finish();
  },
  toProtoMsg(
    message: QueryUserAllocationRequest,
  ): QueryUserAllocationRequestProtoMsg {
    return {
      typeUrl: '/stride.airdrop.QueryUserAllocationRequest',
      value: QueryUserAllocationRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryUserAllocationResponse(): QueryUserAllocationResponse {
  return {
    userAllocation: undefined,
  };
}
export const QueryUserAllocationResponse = {
  typeUrl: '/stride.airdrop.QueryUserAllocationResponse',
  encode(
    message: QueryUserAllocationResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.userAllocation !== undefined) {
      UserAllocation.encode(
        message.userAllocation,
        writer.uint32(10).fork(),
      ).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryUserAllocationResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryUserAllocationResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.userAllocation = UserAllocation.decode(
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
  fromJSON(object: any): QueryUserAllocationResponse {
    return {
      userAllocation: isSet(object.userAllocation)
        ? UserAllocation.fromJSON(object.userAllocation)
        : undefined,
    };
  },
  toJSON(
    message: QueryUserAllocationResponse,
  ): JsonSafe<QueryUserAllocationResponse> {
    const obj: any = {};
    message.userAllocation !== undefined &&
      (obj.userAllocation = message.userAllocation
        ? UserAllocation.toJSON(message.userAllocation)
        : undefined);
    return obj;
  },
  fromPartial(
    object: Partial<QueryUserAllocationResponse>,
  ): QueryUserAllocationResponse {
    const message = createBaseQueryUserAllocationResponse();
    message.userAllocation =
      object.userAllocation !== undefined && object.userAllocation !== null
        ? UserAllocation.fromPartial(object.userAllocation)
        : undefined;
    return message;
  },
  fromProtoMsg(
    message: QueryUserAllocationResponseProtoMsg,
  ): QueryUserAllocationResponse {
    return QueryUserAllocationResponse.decode(message.value);
  },
  toProto(message: QueryUserAllocationResponse): Uint8Array {
    return QueryUserAllocationResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QueryUserAllocationResponse,
  ): QueryUserAllocationResponseProtoMsg {
    return {
      typeUrl: '/stride.airdrop.QueryUserAllocationResponse',
      value: QueryUserAllocationResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryUserAllocationsRequest(): QueryUserAllocationsRequest {
  return {
    address: '',
  };
}
export const QueryUserAllocationsRequest = {
  typeUrl: '/stride.airdrop.QueryUserAllocationsRequest',
  encode(
    message: QueryUserAllocationsRequest,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.address !== '') {
      writer.uint32(10).string(message.address);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryUserAllocationsRequest {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryUserAllocationsRequest();
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
  fromJSON(object: any): QueryUserAllocationsRequest {
    return {
      address: isSet(object.address) ? String(object.address) : '',
    };
  },
  toJSON(
    message: QueryUserAllocationsRequest,
  ): JsonSafe<QueryUserAllocationsRequest> {
    const obj: any = {};
    message.address !== undefined && (obj.address = message.address);
    return obj;
  },
  fromPartial(
    object: Partial<QueryUserAllocationsRequest>,
  ): QueryUserAllocationsRequest {
    const message = createBaseQueryUserAllocationsRequest();
    message.address = object.address ?? '';
    return message;
  },
  fromProtoMsg(
    message: QueryUserAllocationsRequestProtoMsg,
  ): QueryUserAllocationsRequest {
    return QueryUserAllocationsRequest.decode(message.value);
  },
  toProto(message: QueryUserAllocationsRequest): Uint8Array {
    return QueryUserAllocationsRequest.encode(message).finish();
  },
  toProtoMsg(
    message: QueryUserAllocationsRequest,
  ): QueryUserAllocationsRequestProtoMsg {
    return {
      typeUrl: '/stride.airdrop.QueryUserAllocationsRequest',
      value: QueryUserAllocationsRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryUserAllocationsResponse(): QueryUserAllocationsResponse {
  return {
    userAllocations: [],
  };
}
export const QueryUserAllocationsResponse = {
  typeUrl: '/stride.airdrop.QueryUserAllocationsResponse',
  encode(
    message: QueryUserAllocationsResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    for (const v of message.userAllocations) {
      UserAllocation.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryUserAllocationsResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryUserAllocationsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.userAllocations.push(
            UserAllocation.decode(reader, reader.uint32()),
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryUserAllocationsResponse {
    return {
      userAllocations: Array.isArray(object?.userAllocations)
        ? object.userAllocations.map((e: any) => UserAllocation.fromJSON(e))
        : [],
    };
  },
  toJSON(
    message: QueryUserAllocationsResponse,
  ): JsonSafe<QueryUserAllocationsResponse> {
    const obj: any = {};
    if (message.userAllocations) {
      obj.userAllocations = message.userAllocations.map(e =>
        e ? UserAllocation.toJSON(e) : undefined,
      );
    } else {
      obj.userAllocations = [];
    }
    return obj;
  },
  fromPartial(
    object: Partial<QueryUserAllocationsResponse>,
  ): QueryUserAllocationsResponse {
    const message = createBaseQueryUserAllocationsResponse();
    message.userAllocations =
      object.userAllocations?.map(e => UserAllocation.fromPartial(e)) || [];
    return message;
  },
  fromProtoMsg(
    message: QueryUserAllocationsResponseProtoMsg,
  ): QueryUserAllocationsResponse {
    return QueryUserAllocationsResponse.decode(message.value);
  },
  toProto(message: QueryUserAllocationsResponse): Uint8Array {
    return QueryUserAllocationsResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QueryUserAllocationsResponse,
  ): QueryUserAllocationsResponseProtoMsg {
    return {
      typeUrl: '/stride.airdrop.QueryUserAllocationsResponse',
      value: QueryUserAllocationsResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryAllAllocationsRequest(): QueryAllAllocationsRequest {
  return {
    airdropId: '',
    pagination: undefined,
  };
}
export const QueryAllAllocationsRequest = {
  typeUrl: '/stride.airdrop.QueryAllAllocationsRequest',
  encode(
    message: QueryAllAllocationsRequest,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.airdropId !== '') {
      writer.uint32(10).string(message.airdropId);
    }
    if (message.pagination !== undefined) {
      PageRequest.encode(message.pagination, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryAllAllocationsRequest {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryAllAllocationsRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.airdropId = reader.string();
          break;
        case 2:
          message.pagination = PageRequest.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryAllAllocationsRequest {
    return {
      airdropId: isSet(object.airdropId) ? String(object.airdropId) : '',
      pagination: isSet(object.pagination)
        ? PageRequest.fromJSON(object.pagination)
        : undefined,
    };
  },
  toJSON(
    message: QueryAllAllocationsRequest,
  ): JsonSafe<QueryAllAllocationsRequest> {
    const obj: any = {};
    message.airdropId !== undefined && (obj.airdropId = message.airdropId);
    message.pagination !== undefined &&
      (obj.pagination = message.pagination
        ? PageRequest.toJSON(message.pagination)
        : undefined);
    return obj;
  },
  fromPartial(
    object: Partial<QueryAllAllocationsRequest>,
  ): QueryAllAllocationsRequest {
    const message = createBaseQueryAllAllocationsRequest();
    message.airdropId = object.airdropId ?? '';
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageRequest.fromPartial(object.pagination)
        : undefined;
    return message;
  },
  fromProtoMsg(
    message: QueryAllAllocationsRequestProtoMsg,
  ): QueryAllAllocationsRequest {
    return QueryAllAllocationsRequest.decode(message.value);
  },
  toProto(message: QueryAllAllocationsRequest): Uint8Array {
    return QueryAllAllocationsRequest.encode(message).finish();
  },
  toProtoMsg(
    message: QueryAllAllocationsRequest,
  ): QueryAllAllocationsRequestProtoMsg {
    return {
      typeUrl: '/stride.airdrop.QueryAllAllocationsRequest',
      value: QueryAllAllocationsRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryAllAllocationsResponse(): QueryAllAllocationsResponse {
  return {
    allocations: [],
    pagination: undefined,
  };
}
export const QueryAllAllocationsResponse = {
  typeUrl: '/stride.airdrop.QueryAllAllocationsResponse',
  encode(
    message: QueryAllAllocationsResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    for (const v of message.allocations) {
      UserAllocation.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    if (message.pagination !== undefined) {
      PageResponse.encode(
        message.pagination,
        writer.uint32(18).fork(),
      ).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryAllAllocationsResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryAllAllocationsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.allocations.push(
            UserAllocation.decode(reader, reader.uint32()),
          );
          break;
        case 2:
          message.pagination = PageResponse.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryAllAllocationsResponse {
    return {
      allocations: Array.isArray(object?.allocations)
        ? object.allocations.map((e: any) => UserAllocation.fromJSON(e))
        : [],
      pagination: isSet(object.pagination)
        ? PageResponse.fromJSON(object.pagination)
        : undefined,
    };
  },
  toJSON(
    message: QueryAllAllocationsResponse,
  ): JsonSafe<QueryAllAllocationsResponse> {
    const obj: any = {};
    if (message.allocations) {
      obj.allocations = message.allocations.map(e =>
        e ? UserAllocation.toJSON(e) : undefined,
      );
    } else {
      obj.allocations = [];
    }
    message.pagination !== undefined &&
      (obj.pagination = message.pagination
        ? PageResponse.toJSON(message.pagination)
        : undefined);
    return obj;
  },
  fromPartial(
    object: Partial<QueryAllAllocationsResponse>,
  ): QueryAllAllocationsResponse {
    const message = createBaseQueryAllAllocationsResponse();
    message.allocations =
      object.allocations?.map(e => UserAllocation.fromPartial(e)) || [];
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageResponse.fromPartial(object.pagination)
        : undefined;
    return message;
  },
  fromProtoMsg(
    message: QueryAllAllocationsResponseProtoMsg,
  ): QueryAllAllocationsResponse {
    return QueryAllAllocationsResponse.decode(message.value);
  },
  toProto(message: QueryAllAllocationsResponse): Uint8Array {
    return QueryAllAllocationsResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QueryAllAllocationsResponse,
  ): QueryAllAllocationsResponseProtoMsg {
    return {
      typeUrl: '/stride.airdrop.QueryAllAllocationsResponse',
      value: QueryAllAllocationsResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryUserSummaryRequest(): QueryUserSummaryRequest {
  return {
    airdropId: '',
    address: '',
  };
}
export const QueryUserSummaryRequest = {
  typeUrl: '/stride.airdrop.QueryUserSummaryRequest',
  encode(
    message: QueryUserSummaryRequest,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.airdropId !== '') {
      writer.uint32(10).string(message.airdropId);
    }
    if (message.address !== '') {
      writer.uint32(18).string(message.address);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryUserSummaryRequest {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryUserSummaryRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.airdropId = reader.string();
          break;
        case 2:
          message.address = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryUserSummaryRequest {
    return {
      airdropId: isSet(object.airdropId) ? String(object.airdropId) : '',
      address: isSet(object.address) ? String(object.address) : '',
    };
  },
  toJSON(message: QueryUserSummaryRequest): JsonSafe<QueryUserSummaryRequest> {
    const obj: any = {};
    message.airdropId !== undefined && (obj.airdropId = message.airdropId);
    message.address !== undefined && (obj.address = message.address);
    return obj;
  },
  fromPartial(
    object: Partial<QueryUserSummaryRequest>,
  ): QueryUserSummaryRequest {
    const message = createBaseQueryUserSummaryRequest();
    message.airdropId = object.airdropId ?? '';
    message.address = object.address ?? '';
    return message;
  },
  fromProtoMsg(
    message: QueryUserSummaryRequestProtoMsg,
  ): QueryUserSummaryRequest {
    return QueryUserSummaryRequest.decode(message.value);
  },
  toProto(message: QueryUserSummaryRequest): Uint8Array {
    return QueryUserSummaryRequest.encode(message).finish();
  },
  toProtoMsg(
    message: QueryUserSummaryRequest,
  ): QueryUserSummaryRequestProtoMsg {
    return {
      typeUrl: '/stride.airdrop.QueryUserSummaryRequest',
      value: QueryUserSummaryRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryUserSummaryResponse(): QueryUserSummaryResponse {
  return {
    claimType: '',
    claimed: '',
    forfeited: '',
    remaining: '',
    claimable: '',
  };
}
export const QueryUserSummaryResponse = {
  typeUrl: '/stride.airdrop.QueryUserSummaryResponse',
  encode(
    message: QueryUserSummaryResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.claimType !== '') {
      writer.uint32(10).string(message.claimType);
    }
    if (message.claimed !== '') {
      writer.uint32(18).string(message.claimed);
    }
    if (message.forfeited !== '') {
      writer.uint32(26).string(message.forfeited);
    }
    if (message.remaining !== '') {
      writer.uint32(34).string(message.remaining);
    }
    if (message.claimable !== '') {
      writer.uint32(42).string(message.claimable);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryUserSummaryResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryUserSummaryResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.claimType = reader.string();
          break;
        case 2:
          message.claimed = reader.string();
          break;
        case 3:
          message.forfeited = reader.string();
          break;
        case 4:
          message.remaining = reader.string();
          break;
        case 5:
          message.claimable = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryUserSummaryResponse {
    return {
      claimType: isSet(object.claimType) ? String(object.claimType) : '',
      claimed: isSet(object.claimed) ? String(object.claimed) : '',
      forfeited: isSet(object.forfeited) ? String(object.forfeited) : '',
      remaining: isSet(object.remaining) ? String(object.remaining) : '',
      claimable: isSet(object.claimable) ? String(object.claimable) : '',
    };
  },
  toJSON(
    message: QueryUserSummaryResponse,
  ): JsonSafe<QueryUserSummaryResponse> {
    const obj: any = {};
    message.claimType !== undefined && (obj.claimType = message.claimType);
    message.claimed !== undefined && (obj.claimed = message.claimed);
    message.forfeited !== undefined && (obj.forfeited = message.forfeited);
    message.remaining !== undefined && (obj.remaining = message.remaining);
    message.claimable !== undefined && (obj.claimable = message.claimable);
    return obj;
  },
  fromPartial(
    object: Partial<QueryUserSummaryResponse>,
  ): QueryUserSummaryResponse {
    const message = createBaseQueryUserSummaryResponse();
    message.claimType = object.claimType ?? '';
    message.claimed = object.claimed ?? '';
    message.forfeited = object.forfeited ?? '';
    message.remaining = object.remaining ?? '';
    message.claimable = object.claimable ?? '';
    return message;
  },
  fromProtoMsg(
    message: QueryUserSummaryResponseProtoMsg,
  ): QueryUserSummaryResponse {
    return QueryUserSummaryResponse.decode(message.value);
  },
  toProto(message: QueryUserSummaryResponse): Uint8Array {
    return QueryUserSummaryResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QueryUserSummaryResponse,
  ): QueryUserSummaryResponseProtoMsg {
    return {
      typeUrl: '/stride.airdrop.QueryUserSummaryResponse',
      value: QueryUserSummaryResponse.encode(message).finish(),
    };
  },
};
