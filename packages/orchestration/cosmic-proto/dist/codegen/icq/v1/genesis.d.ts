import { Params, type ParamsSDKType } from './icq.js';
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { type JsonSafe } from '../../json-safe.js';
/** GenesisState defines the interchain query genesis state */
export interface GenesisState {
    hostPort: string;
    params: Params;
}
export interface GenesisStateProtoMsg {
    typeUrl: '/icq.v1.GenesisState';
    value: Uint8Array;
}
/** GenesisState defines the interchain query genesis state */
export interface GenesisStateSDKType {
    host_port: string;
    params: ParamsSDKType;
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
