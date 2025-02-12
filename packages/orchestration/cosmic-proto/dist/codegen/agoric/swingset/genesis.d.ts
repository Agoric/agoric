import { Params, type ParamsSDKType, State, type StateSDKType } from './swingset.js';
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { type JsonSafe } from '../../json-safe.js';
/** The initial or exported state. */
export interface GenesisState {
    params: Params;
    state: State;
    swingStoreExportData: SwingStoreExportDataEntry[];
    swingStoreExportDataHash: string;
}
export interface GenesisStateProtoMsg {
    typeUrl: '/agoric.swingset.GenesisState';
    value: Uint8Array;
}
/** The initial or exported state. */
export interface GenesisStateSDKType {
    params: ParamsSDKType;
    state: StateSDKType;
    swing_store_export_data: SwingStoreExportDataEntrySDKType[];
    swing_store_export_data_hash: string;
}
/** A SwingStore "export data" entry. */
export interface SwingStoreExportDataEntry {
    key: string;
    value: string;
}
export interface SwingStoreExportDataEntryProtoMsg {
    typeUrl: '/agoric.swingset.SwingStoreExportDataEntry';
    value: Uint8Array;
}
/** A SwingStore "export data" entry. */
export interface SwingStoreExportDataEntrySDKType {
    key: string;
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
export declare const SwingStoreExportDataEntry: {
    typeUrl: string;
    encode(message: SwingStoreExportDataEntry, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): SwingStoreExportDataEntry;
    fromJSON(object: any): SwingStoreExportDataEntry;
    toJSON(message: SwingStoreExportDataEntry): JsonSafe<SwingStoreExportDataEntry>;
    fromPartial(object: Partial<SwingStoreExportDataEntry>): SwingStoreExportDataEntry;
    fromProtoMsg(message: SwingStoreExportDataEntryProtoMsg): SwingStoreExportDataEntry;
    toProto(message: SwingStoreExportDataEntry): Uint8Array;
    toProtoMsg(message: SwingStoreExportDataEntry): SwingStoreExportDataEntryProtoMsg;
};
