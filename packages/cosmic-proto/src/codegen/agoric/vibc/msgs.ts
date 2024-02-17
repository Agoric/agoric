//@ts-nocheck
import {
  Packet,
  PacketAmino,
  PacketSDKType,
} from '../../ibc/core/channel/v1/channel.js';
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { isSet, bytesFromBase64, base64FromBytes } from '../../helpers.js';
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
export interface MsgSendPacketAmino {
  packet?: PacketAmino;
  sender?: string;
}
export interface MsgSendPacketAminoMsg {
  type: '/agoric.vibc.MsgSendPacket';
  value: MsgSendPacketAmino;
}
/** MsgSendPacket is an SDK message for sending an outgoing IBC packet */
export interface MsgSendPacketSDKType {
  packet: PacketSDKType;
  sender: Uint8Array;
}
/** Empty response for SendPacket. */
export interface MsgSendPacketResponse {}
export interface MsgSendPacketResponseProtoMsg {
  typeUrl: '/agoric.vibc.MsgSendPacketResponse';
  value: Uint8Array;
}
/** Empty response for SendPacket. */
export interface MsgSendPacketResponseAmino {}
export interface MsgSendPacketResponseAminoMsg {
  type: '/agoric.vibc.MsgSendPacketResponse';
  value: MsgSendPacketResponseAmino;
}
/** Empty response for SendPacket. */
export interface MsgSendPacketResponseSDKType {}
function createBaseMsgSendPacket(): MsgSendPacket {
  return {
    packet: Packet.fromPartial({}),
    sender: new Uint8Array(),
  };
}
export const MsgSendPacket = {
  typeUrl: '/agoric.vibc.MsgSendPacket',
  encode(
    message: MsgSendPacket,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.packet !== undefined) {
      Packet.encode(message.packet, writer.uint32(10).fork()).ldelim();
    }
    if (message.sender.length !== 0) {
      writer.uint32(18).bytes(message.sender);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgSendPacket {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgSendPacket();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.packet = Packet.decode(reader, reader.uint32());
          break;
        case 2:
          message.sender = reader.bytes();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): MsgSendPacket {
    return {
      packet: isSet(object.packet) ? Packet.fromJSON(object.packet) : undefined,
      sender: isSet(object.sender)
        ? bytesFromBase64(object.sender)
        : new Uint8Array(),
    };
  },
  toJSON(message: MsgSendPacket): unknown {
    const obj: any = {};
    message.packet !== undefined &&
      (obj.packet = message.packet ? Packet.toJSON(message.packet) : undefined);
    message.sender !== undefined &&
      (obj.sender = base64FromBytes(
        message.sender !== undefined ? message.sender : new Uint8Array(),
      ));
    return obj;
  },
  fromPartial(object: Partial<MsgSendPacket>): MsgSendPacket {
    const message = createBaseMsgSendPacket();
    message.packet =
      object.packet !== undefined && object.packet !== null
        ? Packet.fromPartial(object.packet)
        : undefined;
    message.sender = object.sender ?? new Uint8Array();
    return message;
  },
  fromAmino(object: MsgSendPacketAmino): MsgSendPacket {
    const message = createBaseMsgSendPacket();
    if (object.packet !== undefined && object.packet !== null) {
      message.packet = Packet.fromAmino(object.packet);
    }
    if (object.sender !== undefined && object.sender !== null) {
      message.sender = bytesFromBase64(object.sender);
    }
    return message;
  },
  toAmino(message: MsgSendPacket): MsgSendPacketAmino {
    const obj: any = {};
    obj.packet = message.packet ? Packet.toAmino(message.packet) : undefined;
    obj.sender = message.sender ? base64FromBytes(message.sender) : undefined;
    return obj;
  },
  fromAminoMsg(object: MsgSendPacketAminoMsg): MsgSendPacket {
    return MsgSendPacket.fromAmino(object.value);
  },
  fromProtoMsg(message: MsgSendPacketProtoMsg): MsgSendPacket {
    return MsgSendPacket.decode(message.value);
  },
  toProto(message: MsgSendPacket): Uint8Array {
    return MsgSendPacket.encode(message).finish();
  },
  toProtoMsg(message: MsgSendPacket): MsgSendPacketProtoMsg {
    return {
      typeUrl: '/agoric.vibc.MsgSendPacket',
      value: MsgSendPacket.encode(message).finish(),
    };
  },
};
function createBaseMsgSendPacketResponse(): MsgSendPacketResponse {
  return {};
}
export const MsgSendPacketResponse = {
  typeUrl: '/agoric.vibc.MsgSendPacketResponse',
  encode(
    _: MsgSendPacketResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): MsgSendPacketResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgSendPacketResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(_: any): MsgSendPacketResponse {
    return {};
  },
  toJSON(_: MsgSendPacketResponse): unknown {
    const obj: any = {};
    return obj;
  },
  fromPartial(_: Partial<MsgSendPacketResponse>): MsgSendPacketResponse {
    const message = createBaseMsgSendPacketResponse();
    return message;
  },
  fromAmino(_: MsgSendPacketResponseAmino): MsgSendPacketResponse {
    const message = createBaseMsgSendPacketResponse();
    return message;
  },
  toAmino(_: MsgSendPacketResponse): MsgSendPacketResponseAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(object: MsgSendPacketResponseAminoMsg): MsgSendPacketResponse {
    return MsgSendPacketResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: MsgSendPacketResponseProtoMsg): MsgSendPacketResponse {
    return MsgSendPacketResponse.decode(message.value);
  },
  toProto(message: MsgSendPacketResponse): Uint8Array {
    return MsgSendPacketResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgSendPacketResponse): MsgSendPacketResponseProtoMsg {
    return {
      typeUrl: '/agoric.vibc.MsgSendPacketResponse',
      value: MsgSendPacketResponse.encode(message).finish(),
    };
  },
};
