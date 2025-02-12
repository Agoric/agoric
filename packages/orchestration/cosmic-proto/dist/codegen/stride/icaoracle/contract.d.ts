import { BinaryReader, BinaryWriter } from '../../binary.js';
import { type JsonSafe } from '../../json-safe.js';
/** InstanitateOracleContract is the contract-specific instantiate message */
export interface MsgInstantiateOracleContract {
    adminAddress: string;
    transferChannelId: string;
}
export interface MsgInstantiateOracleContractProtoMsg {
    typeUrl: '/stride.icaoracle.MsgInstantiateOracleContract';
    value: Uint8Array;
}
/** InstanitateOracleContract is the contract-specific instantiate message */
export interface MsgInstantiateOracleContractSDKType {
    admin_address: string;
    transfer_channel_id: string;
}
/** ExecuteContractPostMetric is the contract-specific metric update message */
export interface MsgExecuteContractPostMetric {
    postMetric?: MsgPostMetric;
}
export interface MsgExecuteContractPostMetricProtoMsg {
    typeUrl: '/stride.icaoracle.MsgExecuteContractPostMetric';
    value: Uint8Array;
}
/** ExecuteContractPostMetric is the contract-specific metric update message */
export interface MsgExecuteContractPostMetricSDKType {
    post_metric?: MsgPostMetricSDKType;
}
/** Body of PostMetric contract message */
export interface MsgPostMetric {
    key: string;
    value: string;
    metricType: string;
    updateTime: bigint;
    blockHeight: bigint;
    attributes: string;
}
export interface MsgPostMetricProtoMsg {
    typeUrl: '/stride.icaoracle.MsgPostMetric';
    value: Uint8Array;
}
/** Body of PostMetric contract message */
export interface MsgPostMetricSDKType {
    key: string;
    value: string;
    metric_type: string;
    update_time: bigint;
    block_height: bigint;
    attributes: string;
}
export declare const MsgInstantiateOracleContract: {
    typeUrl: string;
    encode(message: MsgInstantiateOracleContract, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgInstantiateOracleContract;
    fromJSON(object: any): MsgInstantiateOracleContract;
    toJSON(message: MsgInstantiateOracleContract): JsonSafe<MsgInstantiateOracleContract>;
    fromPartial(object: Partial<MsgInstantiateOracleContract>): MsgInstantiateOracleContract;
    fromProtoMsg(message: MsgInstantiateOracleContractProtoMsg): MsgInstantiateOracleContract;
    toProto(message: MsgInstantiateOracleContract): Uint8Array;
    toProtoMsg(message: MsgInstantiateOracleContract): MsgInstantiateOracleContractProtoMsg;
};
export declare const MsgExecuteContractPostMetric: {
    typeUrl: string;
    encode(message: MsgExecuteContractPostMetric, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgExecuteContractPostMetric;
    fromJSON(object: any): MsgExecuteContractPostMetric;
    toJSON(message: MsgExecuteContractPostMetric): JsonSafe<MsgExecuteContractPostMetric>;
    fromPartial(object: Partial<MsgExecuteContractPostMetric>): MsgExecuteContractPostMetric;
    fromProtoMsg(message: MsgExecuteContractPostMetricProtoMsg): MsgExecuteContractPostMetric;
    toProto(message: MsgExecuteContractPostMetric): Uint8Array;
    toProtoMsg(message: MsgExecuteContractPostMetric): MsgExecuteContractPostMetricProtoMsg;
};
export declare const MsgPostMetric: {
    typeUrl: string;
    encode(message: MsgPostMetric, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgPostMetric;
    fromJSON(object: any): MsgPostMetric;
    toJSON(message: MsgPostMetric): JsonSafe<MsgPostMetric>;
    fromPartial(object: Partial<MsgPostMetric>): MsgPostMetric;
    fromProtoMsg(message: MsgPostMetricProtoMsg): MsgPostMetric;
    toProto(message: MsgPostMetric): Uint8Array;
    toProtoMsg(message: MsgPostMetric): MsgPostMetricProtoMsg;
};
