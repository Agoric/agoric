//@ts-nocheck
import { BinaryReader, BinaryWriter } from '../../../../binary.js';
import { isSet } from '../../../../helpers.js';
import { type JsonSafe } from '../../../../json-safe.js';
/**
 * FungibleTokenPacketData defines a struct for the packet payload
 * See FungibleTokenPacketData spec:
 * https://github.com/cosmos/ibc/tree/master/spec/app/ics-020-fungible-token-transfer#data-structures
 */
export interface FungibleTokenPacketData {
  /** the token denomination to be transferred */
  denom: string;
  /** the token amount to be transferred */
  amount: string;
  /** the sender address */
  sender: string;
  /** the recipient address on the destination chain */
  receiver: string;
  /** optional memo */
  memo: string;
}
export interface FungibleTokenPacketDataProtoMsg {
  typeUrl: '/ibc.applications.transfer.v2.FungibleTokenPacketData';
  value: Uint8Array;
}
/**
 * FungibleTokenPacketData defines a struct for the packet payload
 * See FungibleTokenPacketData spec:
 * https://github.com/cosmos/ibc/tree/master/spec/app/ics-020-fungible-token-transfer#data-structures
 */
export interface FungibleTokenPacketDataSDKType {
  denom: string;
  amount: string;
  sender: string;
  receiver: string;
  memo: string;
}
function createBaseFungibleTokenPacketData(): FungibleTokenPacketData {
  return {
    denom: '',
    amount: '',
    sender: '',
    receiver: '',
    memo: '',
  };
}
export const FungibleTokenPacketData = {
  typeUrl: '/ibc.applications.transfer.v2.FungibleTokenPacketData',
  encode(
    message: FungibleTokenPacketData,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.denom !== '') {
      writer.uint32(10).string(message.denom);
    }
    if (message.amount !== '') {
      writer.uint32(18).string(message.amount);
    }
    if (message.sender !== '') {
      writer.uint32(26).string(message.sender);
    }
    if (message.receiver !== '') {
      writer.uint32(34).string(message.receiver);
    }
    if (message.memo !== '') {
      writer.uint32(42).string(message.memo);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): FungibleTokenPacketData {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseFungibleTokenPacketData();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.denom = reader.string();
          break;
        case 2:
          message.amount = reader.string();
          break;
        case 3:
          message.sender = reader.string();
          break;
        case 4:
          message.receiver = reader.string();
          break;
        case 5:
          message.memo = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): FungibleTokenPacketData {
    return {
      denom: isSet(object.denom) ? String(object.denom) : '',
      amount: isSet(object.amount) ? String(object.amount) : '',
      sender: isSet(object.sender) ? String(object.sender) : '',
      receiver: isSet(object.receiver) ? String(object.receiver) : '',
      memo: isSet(object.memo) ? String(object.memo) : '',
    };
  },
  toJSON(message: FungibleTokenPacketData): JsonSafe<FungibleTokenPacketData> {
    const obj: any = {};
    message.denom !== undefined && (obj.denom = message.denom);
    message.amount !== undefined && (obj.amount = message.amount);
    message.sender !== undefined && (obj.sender = message.sender);
    message.receiver !== undefined && (obj.receiver = message.receiver);
    message.memo !== undefined && (obj.memo = message.memo);
    return obj;
  },
  fromPartial(
    object: Partial<FungibleTokenPacketData>,
  ): FungibleTokenPacketData {
    const message = createBaseFungibleTokenPacketData();
    message.denom = object.denom ?? '';
    message.amount = object.amount ?? '';
    message.sender = object.sender ?? '';
    message.receiver = object.receiver ?? '';
    message.memo = object.memo ?? '';
    return message;
  },
  fromProtoMsg(
    message: FungibleTokenPacketDataProtoMsg,
  ): FungibleTokenPacketData {
    return FungibleTokenPacketData.decode(message.value);
  },
  toProto(message: FungibleTokenPacketData): Uint8Array {
    return FungibleTokenPacketData.encode(message).finish();
  },
  toProtoMsg(
    message: FungibleTokenPacketData,
  ): FungibleTokenPacketDataProtoMsg {
    return {
      typeUrl: '/ibc.applications.transfer.v2.FungibleTokenPacketData',
      value: FungibleTokenPacketData.encode(message).finish(),
    };
  },
};
