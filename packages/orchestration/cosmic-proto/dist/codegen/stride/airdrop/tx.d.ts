import { Timestamp, type TimestampSDKType } from '../../google/protobuf/timestamp.js';
import { BinaryReader, BinaryWriter } from '../../binary.js';
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
export interface MsgClaimDailyResponse {
}
export interface MsgClaimDailyResponseProtoMsg {
    typeUrl: '/stride.airdrop.MsgClaimDailyResponse';
    value: Uint8Array;
}
export interface MsgClaimDailyResponseSDKType {
}
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
export interface MsgClaimEarlyResponse {
}
export interface MsgClaimEarlyResponseProtoMsg {
    typeUrl: '/stride.airdrop.MsgClaimEarlyResponse';
    value: Uint8Array;
}
export interface MsgClaimEarlyResponseSDKType {
}
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
export interface MsgCreateAirdropResponse {
}
export interface MsgCreateAirdropResponseProtoMsg {
    typeUrl: '/stride.airdrop.MsgCreateAirdropResponse';
    value: Uint8Array;
}
export interface MsgCreateAirdropResponseSDKType {
}
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
export interface MsgUpdateAirdropResponse {
}
export interface MsgUpdateAirdropResponseProtoMsg {
    typeUrl: '/stride.airdrop.MsgUpdateAirdropResponse';
    value: Uint8Array;
}
export interface MsgUpdateAirdropResponseSDKType {
}
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
export interface MsgAddAllocationsResponse {
}
export interface MsgAddAllocationsResponseProtoMsg {
    typeUrl: '/stride.airdrop.MsgAddAllocationsResponse';
    value: Uint8Array;
}
export interface MsgAddAllocationsResponseSDKType {
}
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
export interface MsgUpdateUserAllocationResponse {
}
export interface MsgUpdateUserAllocationResponseProtoMsg {
    typeUrl: '/stride.airdrop.MsgUpdateUserAllocationResponse';
    value: Uint8Array;
}
export interface MsgUpdateUserAllocationResponseSDKType {
}
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
export interface MsgLinkAddressesResponse {
}
export interface MsgLinkAddressesResponseProtoMsg {
    typeUrl: '/stride.airdrop.MsgLinkAddressesResponse';
    value: Uint8Array;
}
export interface MsgLinkAddressesResponseSDKType {
}
export declare const MsgClaimDaily: {
    typeUrl: string;
    encode(message: MsgClaimDaily, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgClaimDaily;
    fromJSON(object: any): MsgClaimDaily;
    toJSON(message: MsgClaimDaily): JsonSafe<MsgClaimDaily>;
    fromPartial(object: Partial<MsgClaimDaily>): MsgClaimDaily;
    fromProtoMsg(message: MsgClaimDailyProtoMsg): MsgClaimDaily;
    toProto(message: MsgClaimDaily): Uint8Array;
    toProtoMsg(message: MsgClaimDaily): MsgClaimDailyProtoMsg;
};
export declare const MsgClaimDailyResponse: {
    typeUrl: string;
    encode(_: MsgClaimDailyResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgClaimDailyResponse;
    fromJSON(_: any): MsgClaimDailyResponse;
    toJSON(_: MsgClaimDailyResponse): JsonSafe<MsgClaimDailyResponse>;
    fromPartial(_: Partial<MsgClaimDailyResponse>): MsgClaimDailyResponse;
    fromProtoMsg(message: MsgClaimDailyResponseProtoMsg): MsgClaimDailyResponse;
    toProto(message: MsgClaimDailyResponse): Uint8Array;
    toProtoMsg(message: MsgClaimDailyResponse): MsgClaimDailyResponseProtoMsg;
};
export declare const MsgClaimEarly: {
    typeUrl: string;
    encode(message: MsgClaimEarly, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgClaimEarly;
    fromJSON(object: any): MsgClaimEarly;
    toJSON(message: MsgClaimEarly): JsonSafe<MsgClaimEarly>;
    fromPartial(object: Partial<MsgClaimEarly>): MsgClaimEarly;
    fromProtoMsg(message: MsgClaimEarlyProtoMsg): MsgClaimEarly;
    toProto(message: MsgClaimEarly): Uint8Array;
    toProtoMsg(message: MsgClaimEarly): MsgClaimEarlyProtoMsg;
};
export declare const MsgClaimEarlyResponse: {
    typeUrl: string;
    encode(_: MsgClaimEarlyResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgClaimEarlyResponse;
    fromJSON(_: any): MsgClaimEarlyResponse;
    toJSON(_: MsgClaimEarlyResponse): JsonSafe<MsgClaimEarlyResponse>;
    fromPartial(_: Partial<MsgClaimEarlyResponse>): MsgClaimEarlyResponse;
    fromProtoMsg(message: MsgClaimEarlyResponseProtoMsg): MsgClaimEarlyResponse;
    toProto(message: MsgClaimEarlyResponse): Uint8Array;
    toProtoMsg(message: MsgClaimEarlyResponse): MsgClaimEarlyResponseProtoMsg;
};
export declare const MsgCreateAirdrop: {
    typeUrl: string;
    encode(message: MsgCreateAirdrop, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgCreateAirdrop;
    fromJSON(object: any): MsgCreateAirdrop;
    toJSON(message: MsgCreateAirdrop): JsonSafe<MsgCreateAirdrop>;
    fromPartial(object: Partial<MsgCreateAirdrop>): MsgCreateAirdrop;
    fromProtoMsg(message: MsgCreateAirdropProtoMsg): MsgCreateAirdrop;
    toProto(message: MsgCreateAirdrop): Uint8Array;
    toProtoMsg(message: MsgCreateAirdrop): MsgCreateAirdropProtoMsg;
};
export declare const MsgCreateAirdropResponse: {
    typeUrl: string;
    encode(_: MsgCreateAirdropResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgCreateAirdropResponse;
    fromJSON(_: any): MsgCreateAirdropResponse;
    toJSON(_: MsgCreateAirdropResponse): JsonSafe<MsgCreateAirdropResponse>;
    fromPartial(_: Partial<MsgCreateAirdropResponse>): MsgCreateAirdropResponse;
    fromProtoMsg(message: MsgCreateAirdropResponseProtoMsg): MsgCreateAirdropResponse;
    toProto(message: MsgCreateAirdropResponse): Uint8Array;
    toProtoMsg(message: MsgCreateAirdropResponse): MsgCreateAirdropResponseProtoMsg;
};
export declare const MsgUpdateAirdrop: {
    typeUrl: string;
    encode(message: MsgUpdateAirdrop, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgUpdateAirdrop;
    fromJSON(object: any): MsgUpdateAirdrop;
    toJSON(message: MsgUpdateAirdrop): JsonSafe<MsgUpdateAirdrop>;
    fromPartial(object: Partial<MsgUpdateAirdrop>): MsgUpdateAirdrop;
    fromProtoMsg(message: MsgUpdateAirdropProtoMsg): MsgUpdateAirdrop;
    toProto(message: MsgUpdateAirdrop): Uint8Array;
    toProtoMsg(message: MsgUpdateAirdrop): MsgUpdateAirdropProtoMsg;
};
export declare const MsgUpdateAirdropResponse: {
    typeUrl: string;
    encode(_: MsgUpdateAirdropResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgUpdateAirdropResponse;
    fromJSON(_: any): MsgUpdateAirdropResponse;
    toJSON(_: MsgUpdateAirdropResponse): JsonSafe<MsgUpdateAirdropResponse>;
    fromPartial(_: Partial<MsgUpdateAirdropResponse>): MsgUpdateAirdropResponse;
    fromProtoMsg(message: MsgUpdateAirdropResponseProtoMsg): MsgUpdateAirdropResponse;
    toProto(message: MsgUpdateAirdropResponse): Uint8Array;
    toProtoMsg(message: MsgUpdateAirdropResponse): MsgUpdateAirdropResponseProtoMsg;
};
export declare const RawAllocation: {
    typeUrl: string;
    encode(message: RawAllocation, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): RawAllocation;
    fromJSON(object: any): RawAllocation;
    toJSON(message: RawAllocation): JsonSafe<RawAllocation>;
    fromPartial(object: Partial<RawAllocation>): RawAllocation;
    fromProtoMsg(message: RawAllocationProtoMsg): RawAllocation;
    toProto(message: RawAllocation): Uint8Array;
    toProtoMsg(message: RawAllocation): RawAllocationProtoMsg;
};
export declare const MsgAddAllocations: {
    typeUrl: string;
    encode(message: MsgAddAllocations, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgAddAllocations;
    fromJSON(object: any): MsgAddAllocations;
    toJSON(message: MsgAddAllocations): JsonSafe<MsgAddAllocations>;
    fromPartial(object: Partial<MsgAddAllocations>): MsgAddAllocations;
    fromProtoMsg(message: MsgAddAllocationsProtoMsg): MsgAddAllocations;
    toProto(message: MsgAddAllocations): Uint8Array;
    toProtoMsg(message: MsgAddAllocations): MsgAddAllocationsProtoMsg;
};
export declare const MsgAddAllocationsResponse: {
    typeUrl: string;
    encode(_: MsgAddAllocationsResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgAddAllocationsResponse;
    fromJSON(_: any): MsgAddAllocationsResponse;
    toJSON(_: MsgAddAllocationsResponse): JsonSafe<MsgAddAllocationsResponse>;
    fromPartial(_: Partial<MsgAddAllocationsResponse>): MsgAddAllocationsResponse;
    fromProtoMsg(message: MsgAddAllocationsResponseProtoMsg): MsgAddAllocationsResponse;
    toProto(message: MsgAddAllocationsResponse): Uint8Array;
    toProtoMsg(message: MsgAddAllocationsResponse): MsgAddAllocationsResponseProtoMsg;
};
export declare const MsgUpdateUserAllocation: {
    typeUrl: string;
    encode(message: MsgUpdateUserAllocation, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgUpdateUserAllocation;
    fromJSON(object: any): MsgUpdateUserAllocation;
    toJSON(message: MsgUpdateUserAllocation): JsonSafe<MsgUpdateUserAllocation>;
    fromPartial(object: Partial<MsgUpdateUserAllocation>): MsgUpdateUserAllocation;
    fromProtoMsg(message: MsgUpdateUserAllocationProtoMsg): MsgUpdateUserAllocation;
    toProto(message: MsgUpdateUserAllocation): Uint8Array;
    toProtoMsg(message: MsgUpdateUserAllocation): MsgUpdateUserAllocationProtoMsg;
};
export declare const MsgUpdateUserAllocationResponse: {
    typeUrl: string;
    encode(_: MsgUpdateUserAllocationResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgUpdateUserAllocationResponse;
    fromJSON(_: any): MsgUpdateUserAllocationResponse;
    toJSON(_: MsgUpdateUserAllocationResponse): JsonSafe<MsgUpdateUserAllocationResponse>;
    fromPartial(_: Partial<MsgUpdateUserAllocationResponse>): MsgUpdateUserAllocationResponse;
    fromProtoMsg(message: MsgUpdateUserAllocationResponseProtoMsg): MsgUpdateUserAllocationResponse;
    toProto(message: MsgUpdateUserAllocationResponse): Uint8Array;
    toProtoMsg(message: MsgUpdateUserAllocationResponse): MsgUpdateUserAllocationResponseProtoMsg;
};
export declare const MsgLinkAddresses: {
    typeUrl: string;
    encode(message: MsgLinkAddresses, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgLinkAddresses;
    fromJSON(object: any): MsgLinkAddresses;
    toJSON(message: MsgLinkAddresses): JsonSafe<MsgLinkAddresses>;
    fromPartial(object: Partial<MsgLinkAddresses>): MsgLinkAddresses;
    fromProtoMsg(message: MsgLinkAddressesProtoMsg): MsgLinkAddresses;
    toProto(message: MsgLinkAddresses): Uint8Array;
    toProtoMsg(message: MsgLinkAddresses): MsgLinkAddressesProtoMsg;
};
export declare const MsgLinkAddressesResponse: {
    typeUrl: string;
    encode(_: MsgLinkAddressesResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgLinkAddressesResponse;
    fromJSON(_: any): MsgLinkAddressesResponse;
    toJSON(_: MsgLinkAddressesResponse): JsonSafe<MsgLinkAddressesResponse>;
    fromPartial(_: Partial<MsgLinkAddressesResponse>): MsgLinkAddressesResponse;
    fromProtoMsg(message: MsgLinkAddressesResponseProtoMsg): MsgLinkAddressesResponse;
    toProto(message: MsgLinkAddressesResponse): Uint8Array;
    toProtoMsg(message: MsgLinkAddressesResponse): MsgLinkAddressesResponseProtoMsg;
};
