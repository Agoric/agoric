import { Params, type ParamsSDKType, State, type StateSDKType } from './vbank.js';
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { type JsonSafe } from '../../json-safe.js';
/** The initial and exported module state. */
export interface GenesisState {
    /** parms defines all the parameters of the module. */
    params: Params;
    /** state is the current operation state. */
    state: State;
}
export interface GenesisStateProtoMsg {
    typeUrl: '/agoric.vbank.GenesisState';
    value: Uint8Array;
}
/** The initial and exported module state. */
export interface GenesisStateSDKType {
    params: ParamsSDKType;
    state: StateSDKType;
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
