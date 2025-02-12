import { Oracle, type OracleSDKType, Metric, type MetricSDKType } from './icaoracle.js';
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { type JsonSafe } from '../../json-safe.js';
/** Params defines the icaoracle module parameters. */
export interface Params {
}
export interface ParamsProtoMsg {
    typeUrl: '/stride.icaoracle.Params';
    value: Uint8Array;
}
/** Params defines the icaoracle module parameters. */
export interface ParamsSDKType {
}
/** GenesisState defines the icaoracle module's genesis state. */
export interface GenesisState {
    params: Params;
    oracles: Oracle[];
    metrics: Metric[];
}
export interface GenesisStateProtoMsg {
    typeUrl: '/stride.icaoracle.GenesisState';
    value: Uint8Array;
}
/** GenesisState defines the icaoracle module's genesis state. */
export interface GenesisStateSDKType {
    params: ParamsSDKType;
    oracles: OracleSDKType[];
    metrics: MetricSDKType[];
}
export declare const Params: {
    typeUrl: string;
    encode(_: Params, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): Params;
    fromJSON(_: any): Params;
    toJSON(_: Params): JsonSafe<Params>;
    fromPartial(_: Partial<Params>): Params;
    fromProtoMsg(message: ParamsProtoMsg): Params;
    toProto(message: Params): Uint8Array;
    toProtoMsg(message: Params): ParamsProtoMsg;
};
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
