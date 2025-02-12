import { Duration, type DurationSDKType } from '../../../../google/protobuf/duration.js';
import { Height, type HeightSDKType } from '../../../core/client/v1/client.js';
import { ProofSpec, type ProofSpecSDKType } from '../../../../proofs.js';
import { Timestamp, type TimestampSDKType } from '../../../../google/protobuf/timestamp.js';
import { MerkleRoot, type MerkleRootSDKType } from '../../../core/commitment/v1/commitment.js';
import { SignedHeader, type SignedHeaderSDKType } from '../../../../tendermint/types/types.js';
import { ValidatorSet, type ValidatorSetSDKType } from '../../../../tendermint/types/validator.js';
import { BinaryReader, BinaryWriter } from '../../../../binary.js';
import { type JsonSafe } from '../../../../json-safe.js';
/**
 * ClientState from Tendermint tracks the current validator set, latest height,
 * and a possible frozen height.
 */
export interface ClientState {
    chainId: string;
    trustLevel: Fraction;
    /**
     * duration of the period since the LastestTimestamp during which the
     * submitted headers are valid for upgrade
     */
    trustingPeriod: Duration;
    /** duration of the staking unbonding period */
    unbondingPeriod: Duration;
    /** defines how much new (untrusted) header's Time can drift into the future. */
    maxClockDrift: Duration;
    /** Block height when the client was frozen due to a misbehaviour */
    frozenHeight: Height;
    /** Latest height the client was updated to */
    latestHeight: Height;
    /** Proof specifications used in verifying counterparty state */
    proofSpecs: ProofSpec[];
    /**
     * Path at which next upgraded client will be committed.
     * Each element corresponds to the key for a single CommitmentProof in the
     * chained proof. NOTE: ClientState must stored under
     * `{upgradePath}/{upgradeHeight}/clientState` ConsensusState must be stored
     * under `{upgradepath}/{upgradeHeight}/consensusState` For SDK chains using
     * the default upgrade module, upgrade_path should be []string{"upgrade",
     * "upgradedIBCState"}`
     */
    upgradePath: string[];
    /** allow_update_after_expiry is deprecated */
    /** @deprecated */
    allowUpdateAfterExpiry: boolean;
    /** allow_update_after_misbehaviour is deprecated */
    /** @deprecated */
    allowUpdateAfterMisbehaviour: boolean;
}
export interface ClientStateProtoMsg {
    typeUrl: '/ibc.lightclients.tendermint.v1.ClientState';
    value: Uint8Array;
}
/**
 * ClientState from Tendermint tracks the current validator set, latest height,
 * and a possible frozen height.
 */
export interface ClientStateSDKType {
    chain_id: string;
    trust_level: FractionSDKType;
    trusting_period: DurationSDKType;
    unbonding_period: DurationSDKType;
    max_clock_drift: DurationSDKType;
    frozen_height: HeightSDKType;
    latest_height: HeightSDKType;
    proof_specs: ProofSpecSDKType[];
    upgrade_path: string[];
    /** @deprecated */
    allow_update_after_expiry: boolean;
    /** @deprecated */
    allow_update_after_misbehaviour: boolean;
}
/** ConsensusState defines the consensus state from Tendermint. */
export interface ConsensusState {
    /**
     * timestamp that corresponds to the block height in which the ConsensusState
     * was stored.
     */
    timestamp: Timestamp;
    /** commitment root (i.e app hash) */
    root: MerkleRoot;
    nextValidatorsHash: Uint8Array;
}
export interface ConsensusStateProtoMsg {
    typeUrl: '/ibc.lightclients.tendermint.v1.ConsensusState';
    value: Uint8Array;
}
/** ConsensusState defines the consensus state from Tendermint. */
export interface ConsensusStateSDKType {
    timestamp: TimestampSDKType;
    root: MerkleRootSDKType;
    next_validators_hash: Uint8Array;
}
/**
 * Misbehaviour is a wrapper over two conflicting Headers
 * that implements Misbehaviour interface expected by ICS-02
 */
export interface Misbehaviour {
    clientId: string;
    header1?: Header;
    header2?: Header;
}
export interface MisbehaviourProtoMsg {
    typeUrl: '/ibc.lightclients.tendermint.v1.Misbehaviour';
    value: Uint8Array;
}
/**
 * Misbehaviour is a wrapper over two conflicting Headers
 * that implements Misbehaviour interface expected by ICS-02
 */
export interface MisbehaviourSDKType {
    client_id: string;
    header_1?: HeaderSDKType;
    header_2?: HeaderSDKType;
}
/**
 * Header defines the Tendermint client consensus Header.
 * It encapsulates all the information necessary to update from a trusted
 * Tendermint ConsensusState. The inclusion of TrustedHeight and
 * TrustedValidators allows this update to process correctly, so long as the
 * ConsensusState for the TrustedHeight exists, this removes race conditions
 * among relayers The SignedHeader and ValidatorSet are the new untrusted update
 * fields for the client. The TrustedHeight is the height of a stored
 * ConsensusState on the client that will be used to verify the new untrusted
 * header. The Trusted ConsensusState must be within the unbonding period of
 * current time in order to correctly verify, and the TrustedValidators must
 * hash to TrustedConsensusState.NextValidatorsHash since that is the last
 * trusted validator set at the TrustedHeight.
 */
export interface Header {
    signedHeader?: SignedHeader;
    validatorSet?: ValidatorSet;
    trustedHeight: Height;
    trustedValidators?: ValidatorSet;
}
export interface HeaderProtoMsg {
    typeUrl: '/ibc.lightclients.tendermint.v1.Header';
    value: Uint8Array;
}
/**
 * Header defines the Tendermint client consensus Header.
 * It encapsulates all the information necessary to update from a trusted
 * Tendermint ConsensusState. The inclusion of TrustedHeight and
 * TrustedValidators allows this update to process correctly, so long as the
 * ConsensusState for the TrustedHeight exists, this removes race conditions
 * among relayers The SignedHeader and ValidatorSet are the new untrusted update
 * fields for the client. The TrustedHeight is the height of a stored
 * ConsensusState on the client that will be used to verify the new untrusted
 * header. The Trusted ConsensusState must be within the unbonding period of
 * current time in order to correctly verify, and the TrustedValidators must
 * hash to TrustedConsensusState.NextValidatorsHash since that is the last
 * trusted validator set at the TrustedHeight.
 */
export interface HeaderSDKType {
    signed_header?: SignedHeaderSDKType;
    validator_set?: ValidatorSetSDKType;
    trusted_height: HeightSDKType;
    trusted_validators?: ValidatorSetSDKType;
}
/**
 * Fraction defines the protobuf message type for tmmath.Fraction that only
 * supports positive values.
 */
export interface Fraction {
    numerator: bigint;
    denominator: bigint;
}
export interface FractionProtoMsg {
    typeUrl: '/ibc.lightclients.tendermint.v1.Fraction';
    value: Uint8Array;
}
/**
 * Fraction defines the protobuf message type for tmmath.Fraction that only
 * supports positive values.
 */
export interface FractionSDKType {
    numerator: bigint;
    denominator: bigint;
}
export declare const ClientState: {
    typeUrl: string;
    encode(message: ClientState, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): ClientState;
    fromJSON(object: any): ClientState;
    toJSON(message: ClientState): JsonSafe<ClientState>;
    fromPartial(object: Partial<ClientState>): ClientState;
    fromProtoMsg(message: ClientStateProtoMsg): ClientState;
    toProto(message: ClientState): Uint8Array;
    toProtoMsg(message: ClientState): ClientStateProtoMsg;
};
export declare const ConsensusState: {
    typeUrl: string;
    encode(message: ConsensusState, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): ConsensusState;
    fromJSON(object: any): ConsensusState;
    toJSON(message: ConsensusState): JsonSafe<ConsensusState>;
    fromPartial(object: Partial<ConsensusState>): ConsensusState;
    fromProtoMsg(message: ConsensusStateProtoMsg): ConsensusState;
    toProto(message: ConsensusState): Uint8Array;
    toProtoMsg(message: ConsensusState): ConsensusStateProtoMsg;
};
export declare const Misbehaviour: {
    typeUrl: string;
    encode(message: Misbehaviour, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): Misbehaviour;
    fromJSON(object: any): Misbehaviour;
    toJSON(message: Misbehaviour): JsonSafe<Misbehaviour>;
    fromPartial(object: Partial<Misbehaviour>): Misbehaviour;
    fromProtoMsg(message: MisbehaviourProtoMsg): Misbehaviour;
    toProto(message: Misbehaviour): Uint8Array;
    toProtoMsg(message: Misbehaviour): MisbehaviourProtoMsg;
};
export declare const Header: {
    typeUrl: string;
    encode(message: Header, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): Header;
    fromJSON(object: any): Header;
    toJSON(message: Header): JsonSafe<Header>;
    fromPartial(object: Partial<Header>): Header;
    fromProtoMsg(message: HeaderProtoMsg): Header;
    toProto(message: Header): Uint8Array;
    toProtoMsg(message: Header): HeaderProtoMsg;
};
export declare const Fraction: {
    typeUrl: string;
    encode(message: Fraction, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): Fraction;
    fromJSON(object: any): Fraction;
    toJSON(message: Fraction): JsonSafe<Fraction>;
    fromPartial(object: Partial<Fraction>): Fraction;
    fromProtoMsg(message: FractionProtoMsg): Fraction;
    toProto(message: Fraction): Uint8Array;
    toProtoMsg(message: Fraction): FractionProtoMsg;
};
