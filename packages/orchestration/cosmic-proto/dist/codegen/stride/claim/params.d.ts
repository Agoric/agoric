import { Timestamp, type TimestampSDKType } from '../../google/protobuf/timestamp.js';
import { Duration, type DurationSDKType } from '../../google/protobuf/duration.js';
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { type JsonSafe } from '../../json-safe.js';
/** Params defines the claim module's parameters. */
export interface Params {
    airdrops: Airdrop[];
}
export interface ParamsProtoMsg {
    typeUrl: '/stride.claim.Params';
    value: Uint8Array;
}
/** Params defines the claim module's parameters. */
export interface ParamsSDKType {
    airdrops: AirdropSDKType[];
}
export interface Airdrop {
    airdropIdentifier: string;
    chainId: string;
    /** seconds */
    airdropStartTime: Timestamp;
    /** seconds */
    airdropDuration: Duration;
    /** denom of claimable asset */
    claimDenom: string;
    /** airdrop distribution account */
    distributorAddress: string;
    /** ustrd tokens claimed so far in the current period */
    claimedSoFar: string;
    /** indicates the airdrop should be claimed via autopilot */
    autopilotEnabled: boolean;
}
export interface AirdropProtoMsg {
    typeUrl: '/stride.claim.Airdrop';
    value: Uint8Array;
}
export interface AirdropSDKType {
    airdrop_identifier: string;
    chain_id: string;
    airdrop_start_time: TimestampSDKType;
    airdrop_duration: DurationSDKType;
    claim_denom: string;
    distributor_address: string;
    claimed_so_far: string;
    autopilot_enabled: boolean;
}
export declare const Params: {
    typeUrl: string;
    encode(message: Params, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): Params;
    fromJSON(object: any): Params;
    toJSON(message: Params): JsonSafe<Params>;
    fromPartial(object: Partial<Params>): Params;
    fromProtoMsg(message: ParamsProtoMsg): Params;
    toProto(message: Params): Uint8Array;
    toProtoMsg(message: Params): ParamsProtoMsg;
};
export declare const Airdrop: {
    typeUrl: string;
    encode(message: Airdrop, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): Airdrop;
    fromJSON(object: any): Airdrop;
    toJSON(message: Airdrop): JsonSafe<Airdrop>;
    fromPartial(object: Partial<Airdrop>): Airdrop;
    fromProtoMsg(message: AirdropProtoMsg): Airdrop;
    toProto(message: Airdrop): Uint8Array;
    toProtoMsg(message: Airdrop): AirdropProtoMsg;
};
