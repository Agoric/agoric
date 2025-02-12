import { BinaryReader, BinaryWriter } from '../../binary.js';
import { type JsonSafe } from '../../json-safe.js';
/**
 * App includes the protocol and software version for the application.
 * This information is included in ResponseInfo. The App.Protocol can be
 * updated in ResponseEndBlock.
 */
export interface App {
    protocol: bigint;
    software: string;
}
export interface AppProtoMsg {
    typeUrl: '/tendermint.version.App';
    value: Uint8Array;
}
/**
 * App includes the protocol and software version for the application.
 * This information is included in ResponseInfo. The App.Protocol can be
 * updated in ResponseEndBlock.
 */
export interface AppSDKType {
    protocol: bigint;
    software: string;
}
/**
 * Consensus captures the consensus rules for processing a block in the blockchain,
 * including all blockchain data structures and the rules of the application's
 * state transition machine.
 */
export interface Consensus {
    block: bigint;
    app: bigint;
}
export interface ConsensusProtoMsg {
    typeUrl: '/tendermint.version.Consensus';
    value: Uint8Array;
}
/**
 * Consensus captures the consensus rules for processing a block in the blockchain,
 * including all blockchain data structures and the rules of the application's
 * state transition machine.
 */
export interface ConsensusSDKType {
    block: bigint;
    app: bigint;
}
export declare const App: {
    typeUrl: string;
    encode(message: App, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): App;
    fromJSON(object: any): App;
    toJSON(message: App): JsonSafe<App>;
    fromPartial(object: Partial<App>): App;
    fromProtoMsg(message: AppProtoMsg): App;
    toProto(message: App): Uint8Array;
    toProtoMsg(message: App): AppProtoMsg;
};
export declare const Consensus: {
    typeUrl: string;
    encode(message: Consensus, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): Consensus;
    fromJSON(object: any): Consensus;
    toJSON(message: Consensus): JsonSafe<Consensus>;
    fromPartial(object: Partial<Consensus>): Consensus;
    fromProtoMsg(message: ConsensusProtoMsg): Consensus;
    toProto(message: Consensus): Uint8Array;
    toProtoMsg(message: Consensus): ConsensusProtoMsg;
};
