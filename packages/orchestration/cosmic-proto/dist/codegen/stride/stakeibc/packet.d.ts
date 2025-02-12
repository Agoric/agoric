import { BinaryReader, BinaryWriter } from '../../binary.js';
import { type JsonSafe } from '../../json-safe.js';
export interface StakeibcPacketData {
    noData?: NoData;
}
export interface StakeibcPacketDataProtoMsg {
    typeUrl: '/stride.stakeibc.StakeibcPacketData';
    value: Uint8Array;
}
export interface StakeibcPacketDataSDKType {
    no_data?: NoDataSDKType;
}
export interface NoData {
}
export interface NoDataProtoMsg {
    typeUrl: '/stride.stakeibc.NoData';
    value: Uint8Array;
}
export interface NoDataSDKType {
}
export declare const StakeibcPacketData: {
    typeUrl: string;
    encode(message: StakeibcPacketData, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): StakeibcPacketData;
    fromJSON(object: any): StakeibcPacketData;
    toJSON(message: StakeibcPacketData): JsonSafe<StakeibcPacketData>;
    fromPartial(object: Partial<StakeibcPacketData>): StakeibcPacketData;
    fromProtoMsg(message: StakeibcPacketDataProtoMsg): StakeibcPacketData;
    toProto(message: StakeibcPacketData): Uint8Array;
    toProtoMsg(message: StakeibcPacketData): StakeibcPacketDataProtoMsg;
};
export declare const NoData: {
    typeUrl: string;
    encode(_: NoData, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): NoData;
    fromJSON(_: any): NoData;
    toJSON(_: NoData): JsonSafe<NoData>;
    fromPartial(_: Partial<NoData>): NoData;
    fromProtoMsg(message: NoDataProtoMsg): NoData;
    toProto(message: NoData): Uint8Array;
    toProtoMsg(message: NoData): NoDataProtoMsg;
};
