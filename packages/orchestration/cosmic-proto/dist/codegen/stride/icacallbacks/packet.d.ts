import { BinaryReader, BinaryWriter } from '../../binary.js';
import { type JsonSafe } from '../../json-safe.js';
export interface IcacallbacksPacketData {
    noData?: NoData;
}
export interface IcacallbacksPacketDataProtoMsg {
    typeUrl: '/stride.icacallbacks.IcacallbacksPacketData';
    value: Uint8Array;
}
export interface IcacallbacksPacketDataSDKType {
    no_data?: NoDataSDKType;
}
export interface NoData {
}
export interface NoDataProtoMsg {
    typeUrl: '/stride.icacallbacks.NoData';
    value: Uint8Array;
}
export interface NoDataSDKType {
}
export declare const IcacallbacksPacketData: {
    typeUrl: string;
    encode(message: IcacallbacksPacketData, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): IcacallbacksPacketData;
    fromJSON(object: any): IcacallbacksPacketData;
    toJSON(message: IcacallbacksPacketData): JsonSafe<IcacallbacksPacketData>;
    fromPartial(object: Partial<IcacallbacksPacketData>): IcacallbacksPacketData;
    fromProtoMsg(message: IcacallbacksPacketDataProtoMsg): IcacallbacksPacketData;
    toProto(message: IcacallbacksPacketData): Uint8Array;
    toProtoMsg(message: IcacallbacksPacketData): IcacallbacksPacketDataProtoMsg;
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
