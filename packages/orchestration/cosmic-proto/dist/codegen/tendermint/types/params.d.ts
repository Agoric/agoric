import { Duration, type DurationSDKType } from '../../google/protobuf/duration.js';
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { type JsonSafe } from '../../json-safe.js';
/**
 * ConsensusParams contains consensus critical parameters that determine the
 * validity of blocks.
 */
export interface ConsensusParams {
    block: BlockParams;
    evidence: EvidenceParams;
    validator: ValidatorParams;
    version: VersionParams;
}
export interface ConsensusParamsProtoMsg {
    typeUrl: '/tendermint.types.ConsensusParams';
    value: Uint8Array;
}
/**
 * ConsensusParams contains consensus critical parameters that determine the
 * validity of blocks.
 */
export interface ConsensusParamsSDKType {
    block: BlockParamsSDKType;
    evidence: EvidenceParamsSDKType;
    validator: ValidatorParamsSDKType;
    version: VersionParamsSDKType;
}
/** BlockParams contains limits on the block size. */
export interface BlockParams {
    /**
     * Max block size, in bytes.
     * Note: must be greater than 0
     */
    maxBytes: bigint;
    /**
     * Max gas per block.
     * Note: must be greater or equal to -1
     */
    maxGas: bigint;
    /**
     * Minimum time increment between consecutive blocks (in milliseconds) If the
     * block header timestamp is ahead of the system clock, decrease this value.
     *
     * Not exposed to the application.
     */
    timeIotaMs: bigint;
}
export interface BlockParamsProtoMsg {
    typeUrl: '/tendermint.types.BlockParams';
    value: Uint8Array;
}
/** BlockParams contains limits on the block size. */
export interface BlockParamsSDKType {
    max_bytes: bigint;
    max_gas: bigint;
    time_iota_ms: bigint;
}
/** EvidenceParams determine how we handle evidence of malfeasance. */
export interface EvidenceParams {
    /**
     * Max age of evidence, in blocks.
     *
     * The basic formula for calculating this is: MaxAgeDuration / {average block
     * time}.
     */
    maxAgeNumBlocks: bigint;
    /**
     * Max age of evidence, in time.
     *
     * It should correspond with an app's "unbonding period" or other similar
     * mechanism for handling [Nothing-At-Stake
     * attacks](https://github.com/ethereum/wiki/wiki/Proof-of-Stake-FAQ#what-is-the-nothing-at-stake-problem-and-how-can-it-be-fixed).
     */
    maxAgeDuration: Duration;
    /**
     * This sets the maximum size of total evidence in bytes that can be committed in a single block.
     * and should fall comfortably under the max block bytes.
     * Default is 1048576 or 1MB
     */
    maxBytes: bigint;
}
export interface EvidenceParamsProtoMsg {
    typeUrl: '/tendermint.types.EvidenceParams';
    value: Uint8Array;
}
/** EvidenceParams determine how we handle evidence of malfeasance. */
export interface EvidenceParamsSDKType {
    max_age_num_blocks: bigint;
    max_age_duration: DurationSDKType;
    max_bytes: bigint;
}
/**
 * ValidatorParams restrict the public key types validators can use.
 * NOTE: uses ABCI pubkey naming, not Amino names.
 */
export interface ValidatorParams {
    pubKeyTypes: string[];
}
export interface ValidatorParamsProtoMsg {
    typeUrl: '/tendermint.types.ValidatorParams';
    value: Uint8Array;
}
/**
 * ValidatorParams restrict the public key types validators can use.
 * NOTE: uses ABCI pubkey naming, not Amino names.
 */
export interface ValidatorParamsSDKType {
    pub_key_types: string[];
}
/** VersionParams contains the ABCI application version. */
export interface VersionParams {
    appVersion: bigint;
}
export interface VersionParamsProtoMsg {
    typeUrl: '/tendermint.types.VersionParams';
    value: Uint8Array;
}
/** VersionParams contains the ABCI application version. */
export interface VersionParamsSDKType {
    app_version: bigint;
}
/**
 * HashedParams is a subset of ConsensusParams.
 *
 * It is hashed into the Header.ConsensusHash.
 */
export interface HashedParams {
    blockMaxBytes: bigint;
    blockMaxGas: bigint;
}
export interface HashedParamsProtoMsg {
    typeUrl: '/tendermint.types.HashedParams';
    value: Uint8Array;
}
/**
 * HashedParams is a subset of ConsensusParams.
 *
 * It is hashed into the Header.ConsensusHash.
 */
export interface HashedParamsSDKType {
    block_max_bytes: bigint;
    block_max_gas: bigint;
}
export declare const ConsensusParams: {
    typeUrl: string;
    encode(message: ConsensusParams, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): ConsensusParams;
    fromJSON(object: any): ConsensusParams;
    toJSON(message: ConsensusParams): JsonSafe<ConsensusParams>;
    fromPartial(object: Partial<ConsensusParams>): ConsensusParams;
    fromProtoMsg(message: ConsensusParamsProtoMsg): ConsensusParams;
    toProto(message: ConsensusParams): Uint8Array;
    toProtoMsg(message: ConsensusParams): ConsensusParamsProtoMsg;
};
export declare const BlockParams: {
    typeUrl: string;
    encode(message: BlockParams, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): BlockParams;
    fromJSON(object: any): BlockParams;
    toJSON(message: BlockParams): JsonSafe<BlockParams>;
    fromPartial(object: Partial<BlockParams>): BlockParams;
    fromProtoMsg(message: BlockParamsProtoMsg): BlockParams;
    toProto(message: BlockParams): Uint8Array;
    toProtoMsg(message: BlockParams): BlockParamsProtoMsg;
};
export declare const EvidenceParams: {
    typeUrl: string;
    encode(message: EvidenceParams, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): EvidenceParams;
    fromJSON(object: any): EvidenceParams;
    toJSON(message: EvidenceParams): JsonSafe<EvidenceParams>;
    fromPartial(object: Partial<EvidenceParams>): EvidenceParams;
    fromProtoMsg(message: EvidenceParamsProtoMsg): EvidenceParams;
    toProto(message: EvidenceParams): Uint8Array;
    toProtoMsg(message: EvidenceParams): EvidenceParamsProtoMsg;
};
export declare const ValidatorParams: {
    typeUrl: string;
    encode(message: ValidatorParams, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): ValidatorParams;
    fromJSON(object: any): ValidatorParams;
    toJSON(message: ValidatorParams): JsonSafe<ValidatorParams>;
    fromPartial(object: Partial<ValidatorParams>): ValidatorParams;
    fromProtoMsg(message: ValidatorParamsProtoMsg): ValidatorParams;
    toProto(message: ValidatorParams): Uint8Array;
    toProtoMsg(message: ValidatorParams): ValidatorParamsProtoMsg;
};
export declare const VersionParams: {
    typeUrl: string;
    encode(message: VersionParams, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): VersionParams;
    fromJSON(object: any): VersionParams;
    toJSON(message: VersionParams): JsonSafe<VersionParams>;
    fromPartial(object: Partial<VersionParams>): VersionParams;
    fromProtoMsg(message: VersionParamsProtoMsg): VersionParams;
    toProto(message: VersionParams): Uint8Array;
    toProtoMsg(message: VersionParams): VersionParamsProtoMsg;
};
export declare const HashedParams: {
    typeUrl: string;
    encode(message: HashedParams, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): HashedParams;
    fromJSON(object: any): HashedParams;
    toJSON(message: HashedParams): JsonSafe<HashedParams>;
    fromPartial(object: Partial<HashedParams>): HashedParams;
    fromProtoMsg(message: HashedParamsProtoMsg): HashedParams;
    toProto(message: HashedParams): Uint8Array;
    toProtoMsg(message: HashedParams): HashedParamsProtoMsg;
};
