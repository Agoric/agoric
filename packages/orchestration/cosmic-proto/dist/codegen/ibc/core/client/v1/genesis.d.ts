import { IdentifiedClientState, type IdentifiedClientStateSDKType, ClientConsensusStates, type ClientConsensusStatesSDKType, Params, type ParamsSDKType } from './client.js';
import { BinaryReader, BinaryWriter } from '../../../../binary.js';
import { type JsonSafe } from '../../../../json-safe.js';
/** GenesisState defines the ibc client submodule's genesis state. */
export interface GenesisState {
    /** client states with their corresponding identifiers */
    clients: IdentifiedClientState[];
    /** consensus states from each client */
    clientsConsensus: ClientConsensusStates[];
    /** metadata from each client */
    clientsMetadata: IdentifiedGenesisMetadata[];
    params: Params;
    /** create localhost on initialization */
    createLocalhost: boolean;
    /** the sequence for the next generated client identifier */
    nextClientSequence: bigint;
}
export interface GenesisStateProtoMsg {
    typeUrl: '/ibc.core.client.v1.GenesisState';
    value: Uint8Array;
}
/** GenesisState defines the ibc client submodule's genesis state. */
export interface GenesisStateSDKType {
    clients: IdentifiedClientStateSDKType[];
    clients_consensus: ClientConsensusStatesSDKType[];
    clients_metadata: IdentifiedGenesisMetadataSDKType[];
    params: ParamsSDKType;
    create_localhost: boolean;
    next_client_sequence: bigint;
}
/**
 * GenesisMetadata defines the genesis type for metadata that clients may return
 * with ExportMetadata
 */
export interface GenesisMetadata {
    /** store key of metadata without clientID-prefix */
    key: Uint8Array;
    /** metadata value */
    value: Uint8Array;
}
export interface GenesisMetadataProtoMsg {
    typeUrl: '/ibc.core.client.v1.GenesisMetadata';
    value: Uint8Array;
}
/**
 * GenesisMetadata defines the genesis type for metadata that clients may return
 * with ExportMetadata
 */
export interface GenesisMetadataSDKType {
    key: Uint8Array;
    value: Uint8Array;
}
/**
 * IdentifiedGenesisMetadata has the client metadata with the corresponding
 * client id.
 */
export interface IdentifiedGenesisMetadata {
    clientId: string;
    clientMetadata: GenesisMetadata[];
}
export interface IdentifiedGenesisMetadataProtoMsg {
    typeUrl: '/ibc.core.client.v1.IdentifiedGenesisMetadata';
    value: Uint8Array;
}
/**
 * IdentifiedGenesisMetadata has the client metadata with the corresponding
 * client id.
 */
export interface IdentifiedGenesisMetadataSDKType {
    client_id: string;
    client_metadata: GenesisMetadataSDKType[];
}
export declare const GenesisState: {
    typeUrl: string;
    encode(message: GenesisState, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): GenesisState;
    fromJSON(object: any): GenesisState;
    toJSON(message: GenesisState): JsonSafe<GenesisState>;
    fromPartial(object: Partial<GenesisState>): GenesisState;
    fromProtoMsg(message: GenesisStateProtoMsg): GenesisState;
    toProto(message: GenesisState): Uint8Array;
    toProtoMsg(message: GenesisState): GenesisStateProtoMsg;
};
export declare const GenesisMetadata: {
    typeUrl: string;
    encode(message: GenesisMetadata, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): GenesisMetadata;
    fromJSON(object: any): GenesisMetadata;
    toJSON(message: GenesisMetadata): JsonSafe<GenesisMetadata>;
    fromPartial(object: Partial<GenesisMetadata>): GenesisMetadata;
    fromProtoMsg(message: GenesisMetadataProtoMsg): GenesisMetadata;
    toProto(message: GenesisMetadata): Uint8Array;
    toProtoMsg(message: GenesisMetadata): GenesisMetadataProtoMsg;
};
export declare const IdentifiedGenesisMetadata: {
    typeUrl: string;
    encode(message: IdentifiedGenesisMetadata, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): IdentifiedGenesisMetadata;
    fromJSON(object: any): IdentifiedGenesisMetadata;
    toJSON(message: IdentifiedGenesisMetadata): JsonSafe<IdentifiedGenesisMetadata>;
    fromPartial(object: Partial<IdentifiedGenesisMetadata>): IdentifiedGenesisMetadata;
    fromProtoMsg(message: IdentifiedGenesisMetadataProtoMsg): IdentifiedGenesisMetadata;
    toProto(message: IdentifiedGenesisMetadata): Uint8Array;
    toProtoMsg(message: IdentifiedGenesisMetadata): IdentifiedGenesisMetadataProtoMsg;
};
