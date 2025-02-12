import { Metric, type MetricSDKType } from './icaoracle.js';
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { type JsonSafe } from '../../json-safe.js';
/** Callback data for instantiating an oracle */
export interface InstantiateOracleCallback {
    oracleChainId: string;
}
export interface InstantiateOracleCallbackProtoMsg {
    typeUrl: '/stride.icaoracle.InstantiateOracleCallback';
    value: Uint8Array;
}
/** Callback data for instantiating an oracle */
export interface InstantiateOracleCallbackSDKType {
    oracle_chain_id: string;
}
/** Callback data for updating a value in the oracle */
export interface UpdateOracleCallback {
    oracleChainId: string;
    metric?: Metric;
}
export interface UpdateOracleCallbackProtoMsg {
    typeUrl: '/stride.icaoracle.UpdateOracleCallback';
    value: Uint8Array;
}
/** Callback data for updating a value in the oracle */
export interface UpdateOracleCallbackSDKType {
    oracle_chain_id: string;
    metric?: MetricSDKType;
}
export declare const InstantiateOracleCallback: {
    typeUrl: string;
    encode(message: InstantiateOracleCallback, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): InstantiateOracleCallback;
    fromJSON(object: any): InstantiateOracleCallback;
    toJSON(message: InstantiateOracleCallback): JsonSafe<InstantiateOracleCallback>;
    fromPartial(object: Partial<InstantiateOracleCallback>): InstantiateOracleCallback;
    fromProtoMsg(message: InstantiateOracleCallbackProtoMsg): InstantiateOracleCallback;
    toProto(message: InstantiateOracleCallback): Uint8Array;
    toProtoMsg(message: InstantiateOracleCallback): InstantiateOracleCallbackProtoMsg;
};
export declare const UpdateOracleCallback: {
    typeUrl: string;
    encode(message: UpdateOracleCallback, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): UpdateOracleCallback;
    fromJSON(object: any): UpdateOracleCallback;
    toJSON(message: UpdateOracleCallback): JsonSafe<UpdateOracleCallback>;
    fromPartial(object: Partial<UpdateOracleCallback>): UpdateOracleCallback;
    fromProtoMsg(message: UpdateOracleCallbackProtoMsg): UpdateOracleCallback;
    toProto(message: UpdateOracleCallback): Uint8Array;
    toProtoMsg(message: UpdateOracleCallback): UpdateOracleCallbackProtoMsg;
};
