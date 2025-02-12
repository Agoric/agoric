import { Any, type AnySDKType } from '../../../../google/protobuf/any.js';
import { Plan, type PlanSDKType } from '../../../../cosmos/upgrade/v1beta1/upgrade.js';
import { BinaryReader, BinaryWriter } from '../../../../binary.js';
import { type JsonSafe } from '../../../../json-safe.js';
/**
 * IdentifiedClientState defines a client state with an additional client
 * identifier field.
 */
export interface IdentifiedClientState {
    /** client identifier */
    clientId: string;
    /** client state */
    clientState?: Any;
}
export interface IdentifiedClientStateProtoMsg {
    typeUrl: '/ibc.core.client.v1.IdentifiedClientState';
    value: Uint8Array;
}
/**
 * IdentifiedClientState defines a client state with an additional client
 * identifier field.
 */
export interface IdentifiedClientStateSDKType {
    client_id: string;
    client_state?: AnySDKType;
}
/**
 * ConsensusStateWithHeight defines a consensus state with an additional height
 * field.
 */
export interface ConsensusStateWithHeight {
    /** consensus state height */
    height: Height;
    /** consensus state */
    consensusState?: Any;
}
export interface ConsensusStateWithHeightProtoMsg {
    typeUrl: '/ibc.core.client.v1.ConsensusStateWithHeight';
    value: Uint8Array;
}
/**
 * ConsensusStateWithHeight defines a consensus state with an additional height
 * field.
 */
export interface ConsensusStateWithHeightSDKType {
    height: HeightSDKType;
    consensus_state?: AnySDKType;
}
/**
 * ClientConsensusStates defines all the stored consensus states for a given
 * client.
 */
export interface ClientConsensusStates {
    /** client identifier */
    clientId: string;
    /** consensus states and their heights associated with the client */
    consensusStates: ConsensusStateWithHeight[];
}
export interface ClientConsensusStatesProtoMsg {
    typeUrl: '/ibc.core.client.v1.ClientConsensusStates';
    value: Uint8Array;
}
/**
 * ClientConsensusStates defines all the stored consensus states for a given
 * client.
 */
export interface ClientConsensusStatesSDKType {
    client_id: string;
    consensus_states: ConsensusStateWithHeightSDKType[];
}
/**
 * ClientUpdateProposal is a governance proposal. If it passes, the substitute
 * client's latest consensus state is copied over to the subject client. The proposal
 * handler may fail if the subject and the substitute do not match in client and
 * chain parameters (with exception to latest height, frozen height, and chain-id).
 */
export interface ClientUpdateProposal {
    $typeUrl?: '/ibc.core.client.v1.ClientUpdateProposal';
    /** the title of the update proposal */
    title: string;
    /** the description of the proposal */
    description: string;
    /** the client identifier for the client to be updated if the proposal passes */
    subjectClientId: string;
    /**
     * the substitute client identifier for the client standing in for the subject
     * client
     */
    substituteClientId: string;
}
export interface ClientUpdateProposalProtoMsg {
    typeUrl: '/ibc.core.client.v1.ClientUpdateProposal';
    value: Uint8Array;
}
/**
 * ClientUpdateProposal is a governance proposal. If it passes, the substitute
 * client's latest consensus state is copied over to the subject client. The proposal
 * handler may fail if the subject and the substitute do not match in client and
 * chain parameters (with exception to latest height, frozen height, and chain-id).
 */
export interface ClientUpdateProposalSDKType {
    $typeUrl?: '/ibc.core.client.v1.ClientUpdateProposal';
    title: string;
    description: string;
    subject_client_id: string;
    substitute_client_id: string;
}
/**
 * UpgradeProposal is a gov Content type for initiating an IBC breaking
 * upgrade.
 */
export interface UpgradeProposal {
    $typeUrl?: '/ibc.core.client.v1.UpgradeProposal';
    title: string;
    description: string;
    plan: Plan;
    /**
     * An UpgradedClientState must be provided to perform an IBC breaking upgrade.
     * This will make the chain commit to the correct upgraded (self) client state
     * before the upgrade occurs, so that connecting chains can verify that the
     * new upgraded client is valid by verifying a proof on the previous version
     * of the chain. This will allow IBC connections to persist smoothly across
     * planned chain upgrades
     */
    upgradedClientState?: Any;
}
export interface UpgradeProposalProtoMsg {
    typeUrl: '/ibc.core.client.v1.UpgradeProposal';
    value: Uint8Array;
}
/**
 * UpgradeProposal is a gov Content type for initiating an IBC breaking
 * upgrade.
 */
export interface UpgradeProposalSDKType {
    $typeUrl?: '/ibc.core.client.v1.UpgradeProposal';
    title: string;
    description: string;
    plan: PlanSDKType;
    upgraded_client_state?: AnySDKType;
}
/**
 * Height is a monotonically increasing data type
 * that can be compared against another Height for the purposes of updating and
 * freezing clients
 *
 * Normally the RevisionHeight is incremented at each height while keeping
 * RevisionNumber the same. However some consensus algorithms may choose to
 * reset the height in certain conditions e.g. hard forks, state-machine
 * breaking changes In these cases, the RevisionNumber is incremented so that
 * height continues to be monitonically increasing even as the RevisionHeight
 * gets reset
 */
export interface Height {
    /** the revision that the client is currently on */
    revisionNumber: bigint;
    /** the height within the given revision */
    revisionHeight: bigint;
}
export interface HeightProtoMsg {
    typeUrl: '/ibc.core.client.v1.Height';
    value: Uint8Array;
}
/**
 * Height is a monotonically increasing data type
 * that can be compared against another Height for the purposes of updating and
 * freezing clients
 *
 * Normally the RevisionHeight is incremented at each height while keeping
 * RevisionNumber the same. However some consensus algorithms may choose to
 * reset the height in certain conditions e.g. hard forks, state-machine
 * breaking changes In these cases, the RevisionNumber is incremented so that
 * height continues to be monitonically increasing even as the RevisionHeight
 * gets reset
 */
export interface HeightSDKType {
    revision_number: bigint;
    revision_height: bigint;
}
/** Params defines the set of IBC light client parameters. */
export interface Params {
    /** allowed_clients defines the list of allowed client state types. */
    allowedClients: string[];
}
export interface ParamsProtoMsg {
    typeUrl: '/ibc.core.client.v1.Params';
    value: Uint8Array;
}
/** Params defines the set of IBC light client parameters. */
export interface ParamsSDKType {
    allowed_clients: string[];
}
export declare const IdentifiedClientState: {
    typeUrl: string;
    encode(message: IdentifiedClientState, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): IdentifiedClientState;
    fromJSON(object: any): IdentifiedClientState;
    toJSON(message: IdentifiedClientState): JsonSafe<IdentifiedClientState>;
    fromPartial(object: Partial<IdentifiedClientState>): IdentifiedClientState;
    fromProtoMsg(message: IdentifiedClientStateProtoMsg): IdentifiedClientState;
    toProto(message: IdentifiedClientState): Uint8Array;
    toProtoMsg(message: IdentifiedClientState): IdentifiedClientStateProtoMsg;
};
export declare const ConsensusStateWithHeight: {
    typeUrl: string;
    encode(message: ConsensusStateWithHeight, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): ConsensusStateWithHeight;
    fromJSON(object: any): ConsensusStateWithHeight;
    toJSON(message: ConsensusStateWithHeight): JsonSafe<ConsensusStateWithHeight>;
    fromPartial(object: Partial<ConsensusStateWithHeight>): ConsensusStateWithHeight;
    fromProtoMsg(message: ConsensusStateWithHeightProtoMsg): ConsensusStateWithHeight;
    toProto(message: ConsensusStateWithHeight): Uint8Array;
    toProtoMsg(message: ConsensusStateWithHeight): ConsensusStateWithHeightProtoMsg;
};
export declare const ClientConsensusStates: {
    typeUrl: string;
    encode(message: ClientConsensusStates, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): ClientConsensusStates;
    fromJSON(object: any): ClientConsensusStates;
    toJSON(message: ClientConsensusStates): JsonSafe<ClientConsensusStates>;
    fromPartial(object: Partial<ClientConsensusStates>): ClientConsensusStates;
    fromProtoMsg(message: ClientConsensusStatesProtoMsg): ClientConsensusStates;
    toProto(message: ClientConsensusStates): Uint8Array;
    toProtoMsg(message: ClientConsensusStates): ClientConsensusStatesProtoMsg;
};
export declare const ClientUpdateProposal: {
    typeUrl: string;
    encode(message: ClientUpdateProposal, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): ClientUpdateProposal;
    fromJSON(object: any): ClientUpdateProposal;
    toJSON(message: ClientUpdateProposal): JsonSafe<ClientUpdateProposal>;
    fromPartial(object: Partial<ClientUpdateProposal>): ClientUpdateProposal;
    fromProtoMsg(message: ClientUpdateProposalProtoMsg): ClientUpdateProposal;
    toProto(message: ClientUpdateProposal): Uint8Array;
    toProtoMsg(message: ClientUpdateProposal): ClientUpdateProposalProtoMsg;
};
export declare const UpgradeProposal: {
    typeUrl: string;
    encode(message: UpgradeProposal, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): UpgradeProposal;
    fromJSON(object: any): UpgradeProposal;
    toJSON(message: UpgradeProposal): JsonSafe<UpgradeProposal>;
    fromPartial(object: Partial<UpgradeProposal>): UpgradeProposal;
    fromProtoMsg(message: UpgradeProposalProtoMsg): UpgradeProposal;
    toProto(message: UpgradeProposal): Uint8Array;
    toProtoMsg(message: UpgradeProposal): UpgradeProposalProtoMsg;
};
export declare const Height: {
    typeUrl: string;
    encode(message: Height, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): Height;
    fromJSON(object: any): Height;
    toJSON(message: Height): JsonSafe<Height>;
    fromPartial(object: Partial<Height>): Height;
    fromProtoMsg(message: HeightProtoMsg): Height;
    toProto(message: Height): Uint8Array;
    toProtoMsg(message: Height): HeightProtoMsg;
};
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
