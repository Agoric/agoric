import { BinaryReader, BinaryWriter } from '../../binary.js';
import { type JsonSafe } from '../../json-safe.js';
/** The initial or exported state. */
export interface GenesisState {
    data: DataEntry[];
}
export interface GenesisStateProtoMsg {
    typeUrl: '/agoric.vstorage.GenesisState';
    value: Uint8Array;
}
/** The initial or exported state. */
export interface GenesisStateSDKType {
    data: DataEntrySDKType[];
}
/**
 * A vstorage entry.  The only necessary entries are those with data, as the
 * ancestor nodes are reconstructed on import.
 */
export interface DataEntry {
    /**
     * A "."-separated path with individual path elements matching
     * `[-_A-Za-z0-9]+`
     */
    path: string;
    value: string;
}
export interface DataEntryProtoMsg {
    typeUrl: '/agoric.vstorage.DataEntry';
    value: Uint8Array;
}
/**
 * A vstorage entry.  The only necessary entries are those with data, as the
 * ancestor nodes are reconstructed on import.
 */
export interface DataEntrySDKType {
    path: string;
    value: string;
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
export declare const DataEntry: {
    typeUrl: string;
    encode(message: DataEntry, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): DataEntry;
    fromJSON(object: any): DataEntry;
    toJSON(message: DataEntry): JsonSafe<DataEntry>;
    fromPartial(object: Partial<DataEntry>): DataEntry;
    fromProtoMsg(message: DataEntryProtoMsg): DataEntry;
    toProto(message: DataEntry): Uint8Array;
    toProtoMsg(message: DataEntry): DataEntryProtoMsg;
};
