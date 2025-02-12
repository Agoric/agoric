import { InterchainAccountPacketData, type InterchainAccountPacketDataSDKType } from '../../v1/packet.js';
import { BinaryReader, BinaryWriter } from '../../../../../binary.js';
import { type JsonSafe } from '../../../../../json-safe.js';
/** MsgRegisterInterchainAccount defines the payload for Msg/MsgRegisterInterchainAccount */
export interface MsgRegisterInterchainAccount {
    owner: string;
    connectionId: string;
    version: string;
}
export interface MsgRegisterInterchainAccountProtoMsg {
    typeUrl: '/ibc.applications.interchain_accounts.controller.v1.MsgRegisterInterchainAccount';
    value: Uint8Array;
}
/** MsgRegisterInterchainAccount defines the payload for Msg/MsgRegisterInterchainAccount */
export interface MsgRegisterInterchainAccountSDKType {
    owner: string;
    connection_id: string;
    version: string;
}
/** MsgRegisterInterchainAccountResponse defines the response for Msg/MsgRegisterInterchainAccountResponse */
export interface MsgRegisterInterchainAccountResponse {
    channelId: string;
}
export interface MsgRegisterInterchainAccountResponseProtoMsg {
    typeUrl: '/ibc.applications.interchain_accounts.controller.v1.MsgRegisterInterchainAccountResponse';
    value: Uint8Array;
}
/** MsgRegisterInterchainAccountResponse defines the response for Msg/MsgRegisterInterchainAccountResponse */
export interface MsgRegisterInterchainAccountResponseSDKType {
    channel_id: string;
}
/** MsgSendTx defines the payload for Msg/SendTx */
export interface MsgSendTx {
    owner: string;
    connectionId: string;
    packetData: InterchainAccountPacketData;
    /**
     * Relative timeout timestamp provided will be added to the current block time during transaction execution.
     * The timeout timestamp must be non-zero.
     */
    relativeTimeout: bigint;
}
export interface MsgSendTxProtoMsg {
    typeUrl: '/ibc.applications.interchain_accounts.controller.v1.MsgSendTx';
    value: Uint8Array;
}
/** MsgSendTx defines the payload for Msg/SendTx */
export interface MsgSendTxSDKType {
    owner: string;
    connection_id: string;
    packet_data: InterchainAccountPacketDataSDKType;
    relative_timeout: bigint;
}
/** MsgSendTxResponse defines the response for MsgSendTx */
export interface MsgSendTxResponse {
    sequence: bigint;
}
export interface MsgSendTxResponseProtoMsg {
    typeUrl: '/ibc.applications.interchain_accounts.controller.v1.MsgSendTxResponse';
    value: Uint8Array;
}
/** MsgSendTxResponse defines the response for MsgSendTx */
export interface MsgSendTxResponseSDKType {
    sequence: bigint;
}
export declare const MsgRegisterInterchainAccount: {
    typeUrl: string;
    encode(message: MsgRegisterInterchainAccount, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgRegisterInterchainAccount;
    fromJSON(object: any): MsgRegisterInterchainAccount;
    toJSON(message: MsgRegisterInterchainAccount): JsonSafe<MsgRegisterInterchainAccount>;
    fromPartial(object: Partial<MsgRegisterInterchainAccount>): MsgRegisterInterchainAccount;
    fromProtoMsg(message: MsgRegisterInterchainAccountProtoMsg): MsgRegisterInterchainAccount;
    toProto(message: MsgRegisterInterchainAccount): Uint8Array;
    toProtoMsg(message: MsgRegisterInterchainAccount): MsgRegisterInterchainAccountProtoMsg;
};
export declare const MsgRegisterInterchainAccountResponse: {
    typeUrl: string;
    encode(message: MsgRegisterInterchainAccountResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgRegisterInterchainAccountResponse;
    fromJSON(object: any): MsgRegisterInterchainAccountResponse;
    toJSON(message: MsgRegisterInterchainAccountResponse): JsonSafe<MsgRegisterInterchainAccountResponse>;
    fromPartial(object: Partial<MsgRegisterInterchainAccountResponse>): MsgRegisterInterchainAccountResponse;
    fromProtoMsg(message: MsgRegisterInterchainAccountResponseProtoMsg): MsgRegisterInterchainAccountResponse;
    toProto(message: MsgRegisterInterchainAccountResponse): Uint8Array;
    toProtoMsg(message: MsgRegisterInterchainAccountResponse): MsgRegisterInterchainAccountResponseProtoMsg;
};
export declare const MsgSendTx: {
    typeUrl: string;
    encode(message: MsgSendTx, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgSendTx;
    fromJSON(object: any): MsgSendTx;
    toJSON(message: MsgSendTx): JsonSafe<MsgSendTx>;
    fromPartial(object: Partial<MsgSendTx>): MsgSendTx;
    fromProtoMsg(message: MsgSendTxProtoMsg): MsgSendTx;
    toProto(message: MsgSendTx): Uint8Array;
    toProtoMsg(message: MsgSendTx): MsgSendTxProtoMsg;
};
export declare const MsgSendTxResponse: {
    typeUrl: string;
    encode(message: MsgSendTxResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgSendTxResponse;
    fromJSON(object: any): MsgSendTxResponse;
    toJSON(message: MsgSendTxResponse): JsonSafe<MsgSendTxResponse>;
    fromPartial(object: Partial<MsgSendTxResponse>): MsgSendTxResponse;
    fromProtoMsg(message: MsgSendTxResponseProtoMsg): MsgSendTxResponse;
    toProto(message: MsgSendTxResponse): Uint8Array;
    toProtoMsg(message: MsgSendTxResponse): MsgSendTxResponseProtoMsg;
};
