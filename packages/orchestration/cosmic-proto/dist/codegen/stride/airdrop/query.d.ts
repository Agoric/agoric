import { PageRequest, type PageRequestSDKType, PageResponse, type PageResponseSDKType } from '../../cosmos/base/query/v1beta1/pagination.js';
import { Timestamp, type TimestampSDKType } from '../../google/protobuf/timestamp.js';
import { Airdrop, type AirdropSDKType, UserAllocation, type UserAllocationSDKType } from './airdrop.js';
import { BinaryReader, BinaryWriter } from '../../binary.js';
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
export interface QueryAllAirdropsRequest {
}
export interface QueryAllAirdropsRequestProtoMsg {
    typeUrl: '/stride.airdrop.QueryAllAirdropsRequest';
    value: Uint8Array;
}
/** Airdrops */
export interface QueryAllAirdropsRequestSDKType {
}
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
export declare const QueryAirdropRequest: {
    typeUrl: string;
    encode(message: QueryAirdropRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryAirdropRequest;
    fromJSON(object: any): QueryAirdropRequest;
    toJSON(message: QueryAirdropRequest): JsonSafe<QueryAirdropRequest>;
    fromPartial(object: Partial<QueryAirdropRequest>): QueryAirdropRequest;
    fromProtoMsg(message: QueryAirdropRequestProtoMsg): QueryAirdropRequest;
    toProto(message: QueryAirdropRequest): Uint8Array;
    toProtoMsg(message: QueryAirdropRequest): QueryAirdropRequestProtoMsg;
};
export declare const QueryAirdropResponse: {
    typeUrl: string;
    encode(message: QueryAirdropResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryAirdropResponse;
    fromJSON(object: any): QueryAirdropResponse;
    toJSON(message: QueryAirdropResponse): JsonSafe<QueryAirdropResponse>;
    fromPartial(object: Partial<QueryAirdropResponse>): QueryAirdropResponse;
    fromProtoMsg(message: QueryAirdropResponseProtoMsg): QueryAirdropResponse;
    toProto(message: QueryAirdropResponse): Uint8Array;
    toProtoMsg(message: QueryAirdropResponse): QueryAirdropResponseProtoMsg;
};
export declare const QueryAllAirdropsRequest: {
    typeUrl: string;
    encode(_: QueryAllAirdropsRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryAllAirdropsRequest;
    fromJSON(_: any): QueryAllAirdropsRequest;
    toJSON(_: QueryAllAirdropsRequest): JsonSafe<QueryAllAirdropsRequest>;
    fromPartial(_: Partial<QueryAllAirdropsRequest>): QueryAllAirdropsRequest;
    fromProtoMsg(message: QueryAllAirdropsRequestProtoMsg): QueryAllAirdropsRequest;
    toProto(message: QueryAllAirdropsRequest): Uint8Array;
    toProtoMsg(message: QueryAllAirdropsRequest): QueryAllAirdropsRequestProtoMsg;
};
export declare const QueryAllAirdropsResponse: {
    typeUrl: string;
    encode(message: QueryAllAirdropsResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryAllAirdropsResponse;
    fromJSON(object: any): QueryAllAirdropsResponse;
    toJSON(message: QueryAllAirdropsResponse): JsonSafe<QueryAllAirdropsResponse>;
    fromPartial(object: Partial<QueryAllAirdropsResponse>): QueryAllAirdropsResponse;
    fromProtoMsg(message: QueryAllAirdropsResponseProtoMsg): QueryAllAirdropsResponse;
    toProto(message: QueryAllAirdropsResponse): Uint8Array;
    toProtoMsg(message: QueryAllAirdropsResponse): QueryAllAirdropsResponseProtoMsg;
};
export declare const QueryUserAllocationRequest: {
    typeUrl: string;
    encode(message: QueryUserAllocationRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryUserAllocationRequest;
    fromJSON(object: any): QueryUserAllocationRequest;
    toJSON(message: QueryUserAllocationRequest): JsonSafe<QueryUserAllocationRequest>;
    fromPartial(object: Partial<QueryUserAllocationRequest>): QueryUserAllocationRequest;
    fromProtoMsg(message: QueryUserAllocationRequestProtoMsg): QueryUserAllocationRequest;
    toProto(message: QueryUserAllocationRequest): Uint8Array;
    toProtoMsg(message: QueryUserAllocationRequest): QueryUserAllocationRequestProtoMsg;
};
export declare const QueryUserAllocationResponse: {
    typeUrl: string;
    encode(message: QueryUserAllocationResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryUserAllocationResponse;
    fromJSON(object: any): QueryUserAllocationResponse;
    toJSON(message: QueryUserAllocationResponse): JsonSafe<QueryUserAllocationResponse>;
    fromPartial(object: Partial<QueryUserAllocationResponse>): QueryUserAllocationResponse;
    fromProtoMsg(message: QueryUserAllocationResponseProtoMsg): QueryUserAllocationResponse;
    toProto(message: QueryUserAllocationResponse): Uint8Array;
    toProtoMsg(message: QueryUserAllocationResponse): QueryUserAllocationResponseProtoMsg;
};
export declare const QueryUserAllocationsRequest: {
    typeUrl: string;
    encode(message: QueryUserAllocationsRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryUserAllocationsRequest;
    fromJSON(object: any): QueryUserAllocationsRequest;
    toJSON(message: QueryUserAllocationsRequest): JsonSafe<QueryUserAllocationsRequest>;
    fromPartial(object: Partial<QueryUserAllocationsRequest>): QueryUserAllocationsRequest;
    fromProtoMsg(message: QueryUserAllocationsRequestProtoMsg): QueryUserAllocationsRequest;
    toProto(message: QueryUserAllocationsRequest): Uint8Array;
    toProtoMsg(message: QueryUserAllocationsRequest): QueryUserAllocationsRequestProtoMsg;
};
export declare const QueryUserAllocationsResponse: {
    typeUrl: string;
    encode(message: QueryUserAllocationsResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryUserAllocationsResponse;
    fromJSON(object: any): QueryUserAllocationsResponse;
    toJSON(message: QueryUserAllocationsResponse): JsonSafe<QueryUserAllocationsResponse>;
    fromPartial(object: Partial<QueryUserAllocationsResponse>): QueryUserAllocationsResponse;
    fromProtoMsg(message: QueryUserAllocationsResponseProtoMsg): QueryUserAllocationsResponse;
    toProto(message: QueryUserAllocationsResponse): Uint8Array;
    toProtoMsg(message: QueryUserAllocationsResponse): QueryUserAllocationsResponseProtoMsg;
};
export declare const QueryAllAllocationsRequest: {
    typeUrl: string;
    encode(message: QueryAllAllocationsRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryAllAllocationsRequest;
    fromJSON(object: any): QueryAllAllocationsRequest;
    toJSON(message: QueryAllAllocationsRequest): JsonSafe<QueryAllAllocationsRequest>;
    fromPartial(object: Partial<QueryAllAllocationsRequest>): QueryAllAllocationsRequest;
    fromProtoMsg(message: QueryAllAllocationsRequestProtoMsg): QueryAllAllocationsRequest;
    toProto(message: QueryAllAllocationsRequest): Uint8Array;
    toProtoMsg(message: QueryAllAllocationsRequest): QueryAllAllocationsRequestProtoMsg;
};
export declare const QueryAllAllocationsResponse: {
    typeUrl: string;
    encode(message: QueryAllAllocationsResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryAllAllocationsResponse;
    fromJSON(object: any): QueryAllAllocationsResponse;
    toJSON(message: QueryAllAllocationsResponse): JsonSafe<QueryAllAllocationsResponse>;
    fromPartial(object: Partial<QueryAllAllocationsResponse>): QueryAllAllocationsResponse;
    fromProtoMsg(message: QueryAllAllocationsResponseProtoMsg): QueryAllAllocationsResponse;
    toProto(message: QueryAllAllocationsResponse): Uint8Array;
    toProtoMsg(message: QueryAllAllocationsResponse): QueryAllAllocationsResponseProtoMsg;
};
export declare const QueryUserSummaryRequest: {
    typeUrl: string;
    encode(message: QueryUserSummaryRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryUserSummaryRequest;
    fromJSON(object: any): QueryUserSummaryRequest;
    toJSON(message: QueryUserSummaryRequest): JsonSafe<QueryUserSummaryRequest>;
    fromPartial(object: Partial<QueryUserSummaryRequest>): QueryUserSummaryRequest;
    fromProtoMsg(message: QueryUserSummaryRequestProtoMsg): QueryUserSummaryRequest;
    toProto(message: QueryUserSummaryRequest): Uint8Array;
    toProtoMsg(message: QueryUserSummaryRequest): QueryUserSummaryRequestProtoMsg;
};
export declare const QueryUserSummaryResponse: {
    typeUrl: string;
    encode(message: QueryUserSummaryResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryUserSummaryResponse;
    fromJSON(object: any): QueryUserSummaryResponse;
    toJSON(message: QueryUserSummaryResponse): JsonSafe<QueryUserSummaryResponse>;
    fromPartial(object: Partial<QueryUserSummaryResponse>): QueryUserSummaryResponse;
    fromProtoMsg(message: QueryUserSummaryResponseProtoMsg): QueryUserSummaryResponse;
    toProto(message: QueryUserSummaryResponse): Uint8Array;
    toProtoMsg(message: QueryUserSummaryResponse): QueryUserSummaryResponseProtoMsg;
};
