//@ts-nocheck
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { isSet } from '../../helpers.js';
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
export interface NoData {}
export interface NoDataProtoMsg {
  typeUrl: '/stride.stakeibc.NoData';
  value: Uint8Array;
}
export interface NoDataSDKType {}
function createBaseStakeibcPacketData(): StakeibcPacketData {
  return {
    noData: undefined,
  };
}
export const StakeibcPacketData = {
  typeUrl: '/stride.stakeibc.StakeibcPacketData',
  encode(
    message: StakeibcPacketData,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.noData !== undefined) {
      NoData.encode(message.noData, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): StakeibcPacketData {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseStakeibcPacketData();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.noData = NoData.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): StakeibcPacketData {
    return {
      noData: isSet(object.noData) ? NoData.fromJSON(object.noData) : undefined,
    };
  },
  toJSON(message: StakeibcPacketData): JsonSafe<StakeibcPacketData> {
    const obj: any = {};
    message.noData !== undefined &&
      (obj.noData = message.noData ? NoData.toJSON(message.noData) : undefined);
    return obj;
  },
  fromPartial(object: Partial<StakeibcPacketData>): StakeibcPacketData {
    const message = createBaseStakeibcPacketData();
    message.noData =
      object.noData !== undefined && object.noData !== null
        ? NoData.fromPartial(object.noData)
        : undefined;
    return message;
  },
  fromProtoMsg(message: StakeibcPacketDataProtoMsg): StakeibcPacketData {
    return StakeibcPacketData.decode(message.value);
  },
  toProto(message: StakeibcPacketData): Uint8Array {
    return StakeibcPacketData.encode(message).finish();
  },
  toProtoMsg(message: StakeibcPacketData): StakeibcPacketDataProtoMsg {
    return {
      typeUrl: '/stride.stakeibc.StakeibcPacketData',
      value: StakeibcPacketData.encode(message).finish(),
    };
  },
};
function createBaseNoData(): NoData {
  return {};
}
export const NoData = {
  typeUrl: '/stride.stakeibc.NoData',
  encode(
    _: NoData,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): NoData {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseNoData();
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
  fromJSON(_: any): NoData {
    return {};
  },
  toJSON(_: NoData): JsonSafe<NoData> {
    const obj: any = {};
    return obj;
  },
  fromPartial(_: Partial<NoData>): NoData {
    const message = createBaseNoData();
    return message;
  },
  fromProtoMsg(message: NoDataProtoMsg): NoData {
    return NoData.decode(message.value);
  },
  toProto(message: NoData): Uint8Array {
    return NoData.encode(message).finish();
  },
  toProtoMsg(message: NoData): NoDataProtoMsg {
    return {
      typeUrl: '/stride.stakeibc.NoData',
      value: NoData.encode(message).finish(),
    };
  },
};
