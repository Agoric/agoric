import { MerklePrefix, type MerklePrefixSDKType } from '../../commitment/v1/commitment.js';
import { BinaryReader, BinaryWriter } from '../../../../binary.js';
import { type JsonSafe } from '../../../../json-safe.js';
/**
 * State defines if a connection is in one of the following states:
 * INIT, TRYOPEN, OPEN or UNINITIALIZED.
 */
export declare enum State {
    /** STATE_UNINITIALIZED_UNSPECIFIED - Default State */
    STATE_UNINITIALIZED_UNSPECIFIED = 0,
    /** STATE_INIT - A connection end has just started the opening handshake. */
    STATE_INIT = 1,
    /**
     * STATE_TRYOPEN - A connection end has acknowledged the handshake step on the counterparty
     * chain.
     */
    STATE_TRYOPEN = 2,
    /** STATE_OPEN - A connection end has completed the handshake. */
    STATE_OPEN = 3,
    UNRECOGNIZED = -1
}
export declare const StateSDKType: typeof State;
export declare function stateFromJSON(object: any): State;
export declare function stateToJSON(object: State): string;
/**
 * ConnectionEnd defines a stateful object on a chain connected to another
 * separate one.
 * NOTE: there must only be 2 defined ConnectionEnds to establish
 * a connection between two chains.
 */
export interface ConnectionEnd {
    /** client associated with this connection. */
    clientId: string;
    /**
     * IBC version which can be utilised to determine encodings or protocols for
     * channels or packets utilising this connection.
     */
    versions: Version[];
    /** current state of the connection end. */
    state: State;
    /** counterparty chain associated with this connection. */
    counterparty: Counterparty;
    /**
     * delay period that must pass before a consensus state can be used for
     * packet-verification NOTE: delay period logic is only implemented by some
     * clients.
     */
    delayPeriod: bigint;
}
export interface ConnectionEndProtoMsg {
    typeUrl: '/ibc.core.connection.v1.ConnectionEnd';
    value: Uint8Array;
}
/**
 * ConnectionEnd defines a stateful object on a chain connected to another
 * separate one.
 * NOTE: there must only be 2 defined ConnectionEnds to establish
 * a connection between two chains.
 */
export interface ConnectionEndSDKType {
    client_id: string;
    versions: VersionSDKType[];
    state: State;
    counterparty: CounterpartySDKType;
    delay_period: bigint;
}
/**
 * IdentifiedConnection defines a connection with additional connection
 * identifier field.
 */
export interface IdentifiedConnection {
    /** connection identifier. */
    id: string;
    /** client associated with this connection. */
    clientId: string;
    /**
     * IBC version which can be utilised to determine encodings or protocols for
     * channels or packets utilising this connection
     */
    versions: Version[];
    /** current state of the connection end. */
    state: State;
    /** counterparty chain associated with this connection. */
    counterparty: Counterparty;
    /** delay period associated with this connection. */
    delayPeriod: bigint;
}
export interface IdentifiedConnectionProtoMsg {
    typeUrl: '/ibc.core.connection.v1.IdentifiedConnection';
    value: Uint8Array;
}
/**
 * IdentifiedConnection defines a connection with additional connection
 * identifier field.
 */
export interface IdentifiedConnectionSDKType {
    id: string;
    client_id: string;
    versions: VersionSDKType[];
    state: State;
    counterparty: CounterpartySDKType;
    delay_period: bigint;
}
/** Counterparty defines the counterparty chain associated with a connection end. */
export interface Counterparty {
    /**
     * identifies the client on the counterparty chain associated with a given
     * connection.
     */
    clientId: string;
    /**
     * identifies the connection end on the counterparty chain associated with a
     * given connection.
     */
    connectionId: string;
    /** commitment merkle prefix of the counterparty chain. */
    prefix: MerklePrefix;
}
export interface CounterpartyProtoMsg {
    typeUrl: '/ibc.core.connection.v1.Counterparty';
    value: Uint8Array;
}
/** Counterparty defines the counterparty chain associated with a connection end. */
export interface CounterpartySDKType {
    client_id: string;
    connection_id: string;
    prefix: MerklePrefixSDKType;
}
/** ClientPaths define all the connection paths for a client state. */
export interface ClientPaths {
    /** list of connection paths */
    paths: string[];
}
export interface ClientPathsProtoMsg {
    typeUrl: '/ibc.core.connection.v1.ClientPaths';
    value: Uint8Array;
}
/** ClientPaths define all the connection paths for a client state. */
export interface ClientPathsSDKType {
    paths: string[];
}
/** ConnectionPaths define all the connection paths for a given client state. */
export interface ConnectionPaths {
    /** client state unique identifier */
    clientId: string;
    /** list of connection paths */
    paths: string[];
}
export interface ConnectionPathsProtoMsg {
    typeUrl: '/ibc.core.connection.v1.ConnectionPaths';
    value: Uint8Array;
}
/** ConnectionPaths define all the connection paths for a given client state. */
export interface ConnectionPathsSDKType {
    client_id: string;
    paths: string[];
}
/**
 * Version defines the versioning scheme used to negotiate the IBC verison in
 * the connection handshake.
 */
export interface Version {
    /** unique version identifier */
    identifier: string;
    /** list of features compatible with the specified identifier */
    features: string[];
}
export interface VersionProtoMsg {
    typeUrl: '/ibc.core.connection.v1.Version';
    value: Uint8Array;
}
/**
 * Version defines the versioning scheme used to negotiate the IBC verison in
 * the connection handshake.
 */
export interface VersionSDKType {
    identifier: string;
    features: string[];
}
/** Params defines the set of Connection parameters. */
export interface Params {
    /**
     * maximum expected time per block (in nanoseconds), used to enforce block delay. This parameter should reflect the
     * largest amount of time that the chain might reasonably take to produce the next block under normal operating
     * conditions. A safe choice is 3-5x the expected time per block.
     */
    maxExpectedTimePerBlock: bigint;
}
export interface ParamsProtoMsg {
    typeUrl: '/ibc.core.connection.v1.Params';
    value: Uint8Array;
}
/** Params defines the set of Connection parameters. */
export interface ParamsSDKType {
    max_expected_time_per_block: bigint;
}
export declare const ConnectionEnd: {
    typeUrl: string;
    encode(message: ConnectionEnd, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): ConnectionEnd;
    fromJSON(object: any): ConnectionEnd;
    toJSON(message: ConnectionEnd): JsonSafe<ConnectionEnd>;
    fromPartial(object: Partial<ConnectionEnd>): ConnectionEnd;
    fromProtoMsg(message: ConnectionEndProtoMsg): ConnectionEnd;
    toProto(message: ConnectionEnd): Uint8Array;
    toProtoMsg(message: ConnectionEnd): ConnectionEndProtoMsg;
};
export declare const IdentifiedConnection: {
    typeUrl: string;
    encode(message: IdentifiedConnection, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): IdentifiedConnection;
    fromJSON(object: any): IdentifiedConnection;
    toJSON(message: IdentifiedConnection): JsonSafe<IdentifiedConnection>;
    fromPartial(object: Partial<IdentifiedConnection>): IdentifiedConnection;
    fromProtoMsg(message: IdentifiedConnectionProtoMsg): IdentifiedConnection;
    toProto(message: IdentifiedConnection): Uint8Array;
    toProtoMsg(message: IdentifiedConnection): IdentifiedConnectionProtoMsg;
};
export declare const Counterparty: {
    typeUrl: string;
    encode(message: Counterparty, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): Counterparty;
    fromJSON(object: any): Counterparty;
    toJSON(message: Counterparty): JsonSafe<Counterparty>;
    fromPartial(object: Partial<Counterparty>): Counterparty;
    fromProtoMsg(message: CounterpartyProtoMsg): Counterparty;
    toProto(message: Counterparty): Uint8Array;
    toProtoMsg(message: Counterparty): CounterpartyProtoMsg;
};
export declare const ClientPaths: {
    typeUrl: string;
    encode(message: ClientPaths, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): ClientPaths;
    fromJSON(object: any): ClientPaths;
    toJSON(message: ClientPaths): JsonSafe<ClientPaths>;
    fromPartial(object: Partial<ClientPaths>): ClientPaths;
    fromProtoMsg(message: ClientPathsProtoMsg): ClientPaths;
    toProto(message: ClientPaths): Uint8Array;
    toProtoMsg(message: ClientPaths): ClientPathsProtoMsg;
};
export declare const ConnectionPaths: {
    typeUrl: string;
    encode(message: ConnectionPaths, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): ConnectionPaths;
    fromJSON(object: any): ConnectionPaths;
    toJSON(message: ConnectionPaths): JsonSafe<ConnectionPaths>;
    fromPartial(object: Partial<ConnectionPaths>): ConnectionPaths;
    fromProtoMsg(message: ConnectionPathsProtoMsg): ConnectionPaths;
    toProto(message: ConnectionPaths): Uint8Array;
    toProtoMsg(message: ConnectionPaths): ConnectionPathsProtoMsg;
};
export declare const Version: {
    typeUrl: string;
    encode(message: Version, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): Version;
    fromJSON(object: any): Version;
    toJSON(message: Version): JsonSafe<Version>;
    fromPartial(object: Partial<Version>): Version;
    fromProtoMsg(message: VersionProtoMsg): Version;
    toProto(message: Version): Uint8Array;
    toProtoMsg(message: Version): VersionProtoMsg;
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
