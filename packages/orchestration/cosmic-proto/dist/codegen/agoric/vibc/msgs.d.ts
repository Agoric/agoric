import { Packet, type PacketSDKType } from '../../ibc/core/channel/v1/channel.js';
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { type JsonSafe } from '../../json-safe.js';
/** MsgSendPacket is an SDK message for sending an outgoing IBC packet */
export interface MsgSendPacket {
    packet: Packet;
    sender: Uint8Array;
}
export interface MsgSendPacketProtoMsg {
    typeUrl: '/agoric.vibc.MsgSendPacket';
    value: Uint8Array;
}
/** MsgSendPacket is an SDK message for sending an outgoing IBC packet */
export interface MsgSendPacketSDKType {
    packet: PacketSDKType;
    sender: Uint8Array;
}
/** Empty response for SendPacket. */
export interface MsgSendPacketResponse {
}
export interface MsgSendPacketResponseProtoMsg {
    typeUrl: '/agoric.vibc.MsgSendPacketResponse';
    value: Uint8Array;
}
/** Empty response for SendPacket. */
export interface MsgSendPacketResponseSDKType {
}
export declare const MsgSendPacket: {
    typeUrl: string;
    encode(message: MsgSendPacket, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgSendPacket;
    fromJSON(object: any): MsgSendPacket;
    toJSON(message: MsgSendPacket): JsonSafe<MsgSendPacket>;
    fromPartial(object: Partial<MsgSendPacket>): MsgSendPacket;
    fromProtoMsg(message: MsgSendPacketProtoMsg): MsgSendPacket;
    toProto(message: MsgSendPacket): Uint8Array;
    toProtoMsg(message: MsgSendPacket): MsgSendPacketProtoMsg;
};
export declare const MsgSendPacketResponse: {
    typeUrl: string;
    encode(_: MsgSendPacketResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgSendPacketResponse;
    fromJSON(_: any): MsgSendPacketResponse;
    toJSON(_: MsgSendPacketResponse): JsonSafe<MsgSendPacketResponse>;
    fromPartial(_: Partial<MsgSendPacketResponse>): MsgSendPacketResponse;
    fromProtoMsg(message: MsgSendPacketResponseProtoMsg): MsgSendPacketResponse;
    toProto(message: MsgSendPacketResponse): Uint8Array;
    toProtoMsg(message: MsgSendPacketResponse): MsgSendPacketResponseProtoMsg;
};
