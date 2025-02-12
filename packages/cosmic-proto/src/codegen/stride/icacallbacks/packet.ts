//@ts-nocheck
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { isSet } from '../../helpers.js';
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
export interface NoData {}
export interface NoDataProtoMsg {
  typeUrl: '/stride.icacallbacks.NoData';
  value: Uint8Array;
}
export interface NoDataSDKType {}
function createBaseIcacallbacksPacketData(): IcacallbacksPacketData {
  return {
    noData: undefined,
  };
}
export const IcacallbacksPacketData = {
  typeUrl: '/stride.icacallbacks.IcacallbacksPacketData',
  encode(
    message: IcacallbacksPacketData,
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
  ): IcacallbacksPacketData {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseIcacallbacksPacketData();
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
  fromJSON(object: any): IcacallbacksPacketData {
    return {
      noData: isSet(object.noData) ? NoData.fromJSON(object.noData) : undefined,
    };
  },
  toJSON(message: IcacallbacksPacketData): JsonSafe<IcacallbacksPacketData> {
    const obj: any = {};
    message.noData !== undefined &&
      (obj.noData = message.noData ? NoData.toJSON(message.noData) : undefined);
    return obj;
  },
  fromPartial(object: Partial<IcacallbacksPacketData>): IcacallbacksPacketData {
    const message = createBaseIcacallbacksPacketData();
    message.noData =
      object.noData !== undefined && object.noData !== null
        ? NoData.fromPartial(object.noData)
        : undefined;
    return message;
  },
  fromProtoMsg(
    message: IcacallbacksPacketDataProtoMsg,
  ): IcacallbacksPacketData {
    return IcacallbacksPacketData.decode(message.value);
  },
  toProto(message: IcacallbacksPacketData): Uint8Array {
    return IcacallbacksPacketData.encode(message).finish();
  },
  toProtoMsg(message: IcacallbacksPacketData): IcacallbacksPacketDataProtoMsg {
    return {
      typeUrl: '/stride.icacallbacks.IcacallbacksPacketData',
      value: IcacallbacksPacketData.encode(message).finish(),
    };
  },
};
function createBaseNoData(): NoData {
  return {};
}
export const NoData = {
  typeUrl: '/stride.icacallbacks.NoData',
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
      typeUrl: '/stride.icacallbacks.NoData',
      value: NoData.encode(message).finish(),
    };
  },
};
