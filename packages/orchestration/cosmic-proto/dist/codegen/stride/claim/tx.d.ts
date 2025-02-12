import { Coin, type CoinSDKType } from '../../cosmos/base/v1beta1/coin.js';
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { type JsonSafe } from '../../json-safe.js';
export interface MsgSetAirdropAllocations {
    allocator: string;
    airdropIdentifier: string;
    users: string[];
    weights: string[];
}
export interface MsgSetAirdropAllocationsProtoMsg {
    typeUrl: '/stride.claim.MsgSetAirdropAllocations';
    value: Uint8Array;
}
export interface MsgSetAirdropAllocationsSDKType {
    allocator: string;
    airdrop_identifier: string;
    users: string[];
    weights: string[];
}
export interface MsgSetAirdropAllocationsResponse {
}
export interface MsgSetAirdropAllocationsResponseProtoMsg {
    typeUrl: '/stride.claim.MsgSetAirdropAllocationsResponse';
    value: Uint8Array;
}
export interface MsgSetAirdropAllocationsResponseSDKType {
}
export interface MsgClaimFreeAmount {
    user: string;
}
export interface MsgClaimFreeAmountProtoMsg {
    typeUrl: '/stride.claim.MsgClaimFreeAmount';
    value: Uint8Array;
}
export interface MsgClaimFreeAmountSDKType {
    user: string;
}
export interface MsgClaimFreeAmountResponse {
    claimedAmount: Coin[];
}
export interface MsgClaimFreeAmountResponseProtoMsg {
    typeUrl: '/stride.claim.MsgClaimFreeAmountResponse';
    value: Uint8Array;
}
export interface MsgClaimFreeAmountResponseSDKType {
    claimed_amount: CoinSDKType[];
}
export interface MsgCreateAirdrop {
    distributor: string;
    identifier: string;
    chainId: string;
    denom: string;
    startTime: bigint;
    duration: bigint;
    autopilotEnabled: boolean;
}
export interface MsgCreateAirdropProtoMsg {
    typeUrl: '/stride.claim.MsgCreateAirdrop';
    value: Uint8Array;
}
export interface MsgCreateAirdropSDKType {
    distributor: string;
    identifier: string;
    chain_id: string;
    denom: string;
    start_time: bigint;
    duration: bigint;
    autopilot_enabled: boolean;
}
export interface MsgCreateAirdropResponse {
}
export interface MsgCreateAirdropResponseProtoMsg {
    typeUrl: '/stride.claim.MsgCreateAirdropResponse';
    value: Uint8Array;
}
export interface MsgCreateAirdropResponseSDKType {
}
export interface MsgDeleteAirdrop {
    distributor: string;
    identifier: string;
}
export interface MsgDeleteAirdropProtoMsg {
    typeUrl: '/stride.claim.MsgDeleteAirdrop';
    value: Uint8Array;
}
export interface MsgDeleteAirdropSDKType {
    distributor: string;
    identifier: string;
}
export interface MsgDeleteAirdropResponse {
}
export interface MsgDeleteAirdropResponseProtoMsg {
    typeUrl: '/stride.claim.MsgDeleteAirdropResponse';
    value: Uint8Array;
}
export interface MsgDeleteAirdropResponseSDKType {
}
export declare const MsgSetAirdropAllocations: {
    typeUrl: string;
    encode(message: MsgSetAirdropAllocations, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgSetAirdropAllocations;
    fromJSON(object: any): MsgSetAirdropAllocations;
    toJSON(message: MsgSetAirdropAllocations): JsonSafe<MsgSetAirdropAllocations>;
    fromPartial(object: Partial<MsgSetAirdropAllocations>): MsgSetAirdropAllocations;
    fromProtoMsg(message: MsgSetAirdropAllocationsProtoMsg): MsgSetAirdropAllocations;
    toProto(message: MsgSetAirdropAllocations): Uint8Array;
    toProtoMsg(message: MsgSetAirdropAllocations): MsgSetAirdropAllocationsProtoMsg;
};
export declare const MsgSetAirdropAllocationsResponse: {
    typeUrl: string;
    encode(_: MsgSetAirdropAllocationsResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgSetAirdropAllocationsResponse;
    fromJSON(_: any): MsgSetAirdropAllocationsResponse;
    toJSON(_: MsgSetAirdropAllocationsResponse): JsonSafe<MsgSetAirdropAllocationsResponse>;
    fromPartial(_: Partial<MsgSetAirdropAllocationsResponse>): MsgSetAirdropAllocationsResponse;
    fromProtoMsg(message: MsgSetAirdropAllocationsResponseProtoMsg): MsgSetAirdropAllocationsResponse;
    toProto(message: MsgSetAirdropAllocationsResponse): Uint8Array;
    toProtoMsg(message: MsgSetAirdropAllocationsResponse): MsgSetAirdropAllocationsResponseProtoMsg;
};
export declare const MsgClaimFreeAmount: {
    typeUrl: string;
    encode(message: MsgClaimFreeAmount, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgClaimFreeAmount;
    fromJSON(object: any): MsgClaimFreeAmount;
    toJSON(message: MsgClaimFreeAmount): JsonSafe<MsgClaimFreeAmount>;
    fromPartial(object: Partial<MsgClaimFreeAmount>): MsgClaimFreeAmount;
    fromProtoMsg(message: MsgClaimFreeAmountProtoMsg): MsgClaimFreeAmount;
    toProto(message: MsgClaimFreeAmount): Uint8Array;
    toProtoMsg(message: MsgClaimFreeAmount): MsgClaimFreeAmountProtoMsg;
};
export declare const MsgClaimFreeAmountResponse: {
    typeUrl: string;
    encode(message: MsgClaimFreeAmountResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgClaimFreeAmountResponse;
    fromJSON(object: any): MsgClaimFreeAmountResponse;
    toJSON(message: MsgClaimFreeAmountResponse): JsonSafe<MsgClaimFreeAmountResponse>;
    fromPartial(object: Partial<MsgClaimFreeAmountResponse>): MsgClaimFreeAmountResponse;
    fromProtoMsg(message: MsgClaimFreeAmountResponseProtoMsg): MsgClaimFreeAmountResponse;
    toProto(message: MsgClaimFreeAmountResponse): Uint8Array;
    toProtoMsg(message: MsgClaimFreeAmountResponse): MsgClaimFreeAmountResponseProtoMsg;
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
export declare const MsgDeleteAirdrop: {
    typeUrl: string;
    encode(message: MsgDeleteAirdrop, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgDeleteAirdrop;
    fromJSON(object: any): MsgDeleteAirdrop;
    toJSON(message: MsgDeleteAirdrop): JsonSafe<MsgDeleteAirdrop>;
    fromPartial(object: Partial<MsgDeleteAirdrop>): MsgDeleteAirdrop;
    fromProtoMsg(message: MsgDeleteAirdropProtoMsg): MsgDeleteAirdrop;
    toProto(message: MsgDeleteAirdrop): Uint8Array;
    toProtoMsg(message: MsgDeleteAirdrop): MsgDeleteAirdropProtoMsg;
};
export declare const MsgDeleteAirdropResponse: {
    typeUrl: string;
    encode(_: MsgDeleteAirdropResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgDeleteAirdropResponse;
    fromJSON(_: any): MsgDeleteAirdropResponse;
    toJSON(_: MsgDeleteAirdropResponse): JsonSafe<MsgDeleteAirdropResponse>;
    fromPartial(_: Partial<MsgDeleteAirdropResponse>): MsgDeleteAirdropResponse;
    fromProtoMsg(message: MsgDeleteAirdropResponseProtoMsg): MsgDeleteAirdropResponse;
    toProto(message: MsgDeleteAirdropResponse): Uint8Array;
    toProtoMsg(message: MsgDeleteAirdropResponse): MsgDeleteAirdropResponseProtoMsg;
};
