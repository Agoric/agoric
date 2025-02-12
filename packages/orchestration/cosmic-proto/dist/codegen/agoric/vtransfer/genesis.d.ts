import { BinaryReader, BinaryWriter } from '../../binary.js';
import { type JsonSafe } from '../../json-safe.js';
/** The initial and exported module state. */
export interface GenesisState {
    /** The list of account addresses that are being watched by the VM. */
    watchedAddresses: Uint8Array[];
}
export interface GenesisStateProtoMsg {
    typeUrl: '/agoric.vtransfer.GenesisState';
    value: Uint8Array;
}
/** The initial and exported module state. */
export interface GenesisStateSDKType {
    watched_addresses: Uint8Array[];
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
