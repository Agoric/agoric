import { BinaryReader, BinaryWriter } from '../../binary.js';
import { type JsonSafe } from '../../json-safe.js';
export interface CallbackData {
    callbackKey: string;
    portId: string;
    channelId: string;
    sequence: bigint;
    callbackId: string;
    callbackArgs: Uint8Array;
}
export interface CallbackDataProtoMsg {
    typeUrl: '/stride.icacallbacks.CallbackData';
    value: Uint8Array;
}
export interface CallbackDataSDKType {
    callback_key: string;
    port_id: string;
    channel_id: string;
    sequence: bigint;
    callback_id: string;
    callback_args: Uint8Array;
}
export declare const CallbackData: {
    typeUrl: string;
    encode(message: CallbackData, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): CallbackData;
    fromJSON(object: any): CallbackData;
    toJSON(message: CallbackData): JsonSafe<CallbackData>;
    fromPartial(object: Partial<CallbackData>): CallbackData;
    fromProtoMsg(message: CallbackDataProtoMsg): CallbackData;
    toProto(message: CallbackData): Uint8Array;
    toProtoMsg(message: CallbackData): CallbackDataProtoMsg;
};
