import { Coin, type CoinSDKType } from '../../base/v1beta1/coin.js';
import { Input, type InputSDKType, Output, type OutputSDKType } from './bank.js';
import { BinaryReader, BinaryWriter } from '../../../binary.js';
import { type JsonSafe } from '../../../json-safe.js';
/** MsgSend represents a message to send coins from one account to another. */
export interface MsgSend {
    fromAddress: string;
    toAddress: string;
    amount: Coin[];
}
export interface MsgSendProtoMsg {
    typeUrl: '/cosmos.bank.v1beta1.MsgSend';
    value: Uint8Array;
}
/** MsgSend represents a message to send coins from one account to another. */
export interface MsgSendSDKType {
    from_address: string;
    to_address: string;
    amount: CoinSDKType[];
}
/** MsgSendResponse defines the Msg/Send response type. */
export interface MsgSendResponse {
}
export interface MsgSendResponseProtoMsg {
    typeUrl: '/cosmos.bank.v1beta1.MsgSendResponse';
    value: Uint8Array;
}
/** MsgSendResponse defines the Msg/Send response type. */
export interface MsgSendResponseSDKType {
}
/** MsgMultiSend represents an arbitrary multi-in, multi-out send message. */
export interface MsgMultiSend {
    inputs: Input[];
    outputs: Output[];
}
export interface MsgMultiSendProtoMsg {
    typeUrl: '/cosmos.bank.v1beta1.MsgMultiSend';
    value: Uint8Array;
}
/** MsgMultiSend represents an arbitrary multi-in, multi-out send message. */
export interface MsgMultiSendSDKType {
    inputs: InputSDKType[];
    outputs: OutputSDKType[];
}
/** MsgMultiSendResponse defines the Msg/MultiSend response type. */
export interface MsgMultiSendResponse {
}
export interface MsgMultiSendResponseProtoMsg {
    typeUrl: '/cosmos.bank.v1beta1.MsgMultiSendResponse';
    value: Uint8Array;
}
/** MsgMultiSendResponse defines the Msg/MultiSend response type. */
export interface MsgMultiSendResponseSDKType {
}
export declare const MsgSend: {
    typeUrl: string;
    encode(message: MsgSend, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgSend;
    fromJSON(object: any): MsgSend;
    toJSON(message: MsgSend): JsonSafe<MsgSend>;
    fromPartial(object: Partial<MsgSend>): MsgSend;
    fromProtoMsg(message: MsgSendProtoMsg): MsgSend;
    toProto(message: MsgSend): Uint8Array;
    toProtoMsg(message: MsgSend): MsgSendProtoMsg;
};
export declare const MsgSendResponse: {
    typeUrl: string;
    encode(_: MsgSendResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgSendResponse;
    fromJSON(_: any): MsgSendResponse;
    toJSON(_: MsgSendResponse): JsonSafe<MsgSendResponse>;
    fromPartial(_: Partial<MsgSendResponse>): MsgSendResponse;
    fromProtoMsg(message: MsgSendResponseProtoMsg): MsgSendResponse;
    toProto(message: MsgSendResponse): Uint8Array;
    toProtoMsg(message: MsgSendResponse): MsgSendResponseProtoMsg;
};
export declare const MsgMultiSend: {
    typeUrl: string;
    encode(message: MsgMultiSend, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgMultiSend;
    fromJSON(object: any): MsgMultiSend;
    toJSON(message: MsgMultiSend): JsonSafe<MsgMultiSend>;
    fromPartial(object: Partial<MsgMultiSend>): MsgMultiSend;
    fromProtoMsg(message: MsgMultiSendProtoMsg): MsgMultiSend;
    toProto(message: MsgMultiSend): Uint8Array;
    toProtoMsg(message: MsgMultiSend): MsgMultiSendProtoMsg;
};
export declare const MsgMultiSendResponse: {
    typeUrl: string;
    encode(_: MsgMultiSendResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgMultiSendResponse;
    fromJSON(_: any): MsgMultiSendResponse;
    toJSON(_: MsgMultiSendResponse): JsonSafe<MsgMultiSendResponse>;
    fromPartial(_: Partial<MsgMultiSendResponse>): MsgMultiSendResponse;
    fromProtoMsg(message: MsgMultiSendResponseProtoMsg): MsgMultiSendResponse;
    toProto(message: MsgMultiSendResponse): Uint8Array;
    toProtoMsg(message: MsgMultiSendResponse): MsgMultiSendResponseProtoMsg;
};
