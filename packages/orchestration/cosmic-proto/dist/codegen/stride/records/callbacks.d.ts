import { LSMTokenDeposit, type LSMTokenDepositSDKType } from './records.js';
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { type JsonSafe } from '../../json-safe.js';
export interface TransferCallback {
    depositRecordId: bigint;
}
export interface TransferCallbackProtoMsg {
    typeUrl: '/stride.records.TransferCallback';
    value: Uint8Array;
}
export interface TransferCallbackSDKType {
    deposit_record_id: bigint;
}
export interface TransferLSMTokenCallback {
    deposit?: LSMTokenDeposit;
}
export interface TransferLSMTokenCallbackProtoMsg {
    typeUrl: '/stride.records.TransferLSMTokenCallback';
    value: Uint8Array;
}
export interface TransferLSMTokenCallbackSDKType {
    deposit?: LSMTokenDepositSDKType;
}
export declare const TransferCallback: {
    typeUrl: string;
    encode(message: TransferCallback, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): TransferCallback;
    fromJSON(object: any): TransferCallback;
    toJSON(message: TransferCallback): JsonSafe<TransferCallback>;
    fromPartial(object: Partial<TransferCallback>): TransferCallback;
    fromProtoMsg(message: TransferCallbackProtoMsg): TransferCallback;
    toProto(message: TransferCallback): Uint8Array;
    toProtoMsg(message: TransferCallback): TransferCallbackProtoMsg;
};
export declare const TransferLSMTokenCallback: {
    typeUrl: string;
    encode(message: TransferLSMTokenCallback, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): TransferLSMTokenCallback;
    fromJSON(object: any): TransferLSMTokenCallback;
    toJSON(message: TransferLSMTokenCallback): JsonSafe<TransferLSMTokenCallback>;
    fromPartial(object: Partial<TransferLSMTokenCallback>): TransferLSMTokenCallback;
    fromProtoMsg(message: TransferLSMTokenCallbackProtoMsg): TransferLSMTokenCallback;
    toProto(message: TransferLSMTokenCallback): Uint8Array;
    toProtoMsg(message: TransferLSMTokenCallback): TransferLSMTokenCallbackProtoMsg;
};
