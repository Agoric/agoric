//@ts-nocheck
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { isSet } from '../../helpers.js';
import { type JsonSafe } from '../../json-safe.js';
/** InstanitateOracleContract is the contract-specific instantiate message */
export interface MsgInstantiateOracleContract {
  adminAddress: string;
  transferChannelId: string;
}
export interface MsgInstantiateOracleContractProtoMsg {
  typeUrl: '/stride.icaoracle.MsgInstantiateOracleContract';
  value: Uint8Array;
}
/** InstanitateOracleContract is the contract-specific instantiate message */
export interface MsgInstantiateOracleContractSDKType {
  admin_address: string;
  transfer_channel_id: string;
}
/** ExecuteContractPostMetric is the contract-specific metric update message */
export interface MsgExecuteContractPostMetric {
  postMetric?: MsgPostMetric;
}
export interface MsgExecuteContractPostMetricProtoMsg {
  typeUrl: '/stride.icaoracle.MsgExecuteContractPostMetric';
  value: Uint8Array;
}
/** ExecuteContractPostMetric is the contract-specific metric update message */
export interface MsgExecuteContractPostMetricSDKType {
  post_metric?: MsgPostMetricSDKType;
}
/** Body of PostMetric contract message */
export interface MsgPostMetric {
  key: string;
  value: string;
  metricType: string;
  updateTime: bigint;
  blockHeight: bigint;
  attributes: string;
}
export interface MsgPostMetricProtoMsg {
  typeUrl: '/stride.icaoracle.MsgPostMetric';
  value: Uint8Array;
}
/** Body of PostMetric contract message */
export interface MsgPostMetricSDKType {
  key: string;
  value: string;
  metric_type: string;
  update_time: bigint;
  block_height: bigint;
  attributes: string;
}
function createBaseMsgInstantiateOracleContract(): MsgInstantiateOracleContract {
  return {
    adminAddress: '',
    transferChannelId: '',
  };
}
export const MsgInstantiateOracleContract = {
  typeUrl: '/stride.icaoracle.MsgInstantiateOracleContract',
  encode(
    message: MsgInstantiateOracleContract,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.adminAddress !== '') {
      writer.uint32(10).string(message.adminAddress);
    }
    if (message.transferChannelId !== '') {
      writer.uint32(18).string(message.transferChannelId);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): MsgInstantiateOracleContract {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgInstantiateOracleContract();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.adminAddress = reader.string();
          break;
        case 2:
          message.transferChannelId = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): MsgInstantiateOracleContract {
    return {
      adminAddress: isSet(object.adminAddress)
        ? String(object.adminAddress)
        : '',
      transferChannelId: isSet(object.transferChannelId)
        ? String(object.transferChannelId)
        : '',
    };
  },
  toJSON(
    message: MsgInstantiateOracleContract,
  ): JsonSafe<MsgInstantiateOracleContract> {
    const obj: any = {};
    message.adminAddress !== undefined &&
      (obj.adminAddress = message.adminAddress);
    message.transferChannelId !== undefined &&
      (obj.transferChannelId = message.transferChannelId);
    return obj;
  },
  fromPartial(
    object: Partial<MsgInstantiateOracleContract>,
  ): MsgInstantiateOracleContract {
    const message = createBaseMsgInstantiateOracleContract();
    message.adminAddress = object.adminAddress ?? '';
    message.transferChannelId = object.transferChannelId ?? '';
    return message;
  },
  fromProtoMsg(
    message: MsgInstantiateOracleContractProtoMsg,
  ): MsgInstantiateOracleContract {
    return MsgInstantiateOracleContract.decode(message.value);
  },
  toProto(message: MsgInstantiateOracleContract): Uint8Array {
    return MsgInstantiateOracleContract.encode(message).finish();
  },
  toProtoMsg(
    message: MsgInstantiateOracleContract,
  ): MsgInstantiateOracleContractProtoMsg {
    return {
      typeUrl: '/stride.icaoracle.MsgInstantiateOracleContract',
      value: MsgInstantiateOracleContract.encode(message).finish(),
    };
  },
};
function createBaseMsgExecuteContractPostMetric(): MsgExecuteContractPostMetric {
  return {
    postMetric: undefined,
  };
}
export const MsgExecuteContractPostMetric = {
  typeUrl: '/stride.icaoracle.MsgExecuteContractPostMetric',
  encode(
    message: MsgExecuteContractPostMetric,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.postMetric !== undefined) {
      MsgPostMetric.encode(
        message.postMetric,
        writer.uint32(10).fork(),
      ).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): MsgExecuteContractPostMetric {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgExecuteContractPostMetric();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.postMetric = MsgPostMetric.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): MsgExecuteContractPostMetric {
    return {
      postMetric: isSet(object.postMetric)
        ? MsgPostMetric.fromJSON(object.postMetric)
        : undefined,
    };
  },
  toJSON(
    message: MsgExecuteContractPostMetric,
  ): JsonSafe<MsgExecuteContractPostMetric> {
    const obj: any = {};
    message.postMetric !== undefined &&
      (obj.postMetric = message.postMetric
        ? MsgPostMetric.toJSON(message.postMetric)
        : undefined);
    return obj;
  },
  fromPartial(
    object: Partial<MsgExecuteContractPostMetric>,
  ): MsgExecuteContractPostMetric {
    const message = createBaseMsgExecuteContractPostMetric();
    message.postMetric =
      object.postMetric !== undefined && object.postMetric !== null
        ? MsgPostMetric.fromPartial(object.postMetric)
        : undefined;
    return message;
  },
  fromProtoMsg(
    message: MsgExecuteContractPostMetricProtoMsg,
  ): MsgExecuteContractPostMetric {
    return MsgExecuteContractPostMetric.decode(message.value);
  },
  toProto(message: MsgExecuteContractPostMetric): Uint8Array {
    return MsgExecuteContractPostMetric.encode(message).finish();
  },
  toProtoMsg(
    message: MsgExecuteContractPostMetric,
  ): MsgExecuteContractPostMetricProtoMsg {
    return {
      typeUrl: '/stride.icaoracle.MsgExecuteContractPostMetric',
      value: MsgExecuteContractPostMetric.encode(message).finish(),
    };
  },
};
function createBaseMsgPostMetric(): MsgPostMetric {
  return {
    key: '',
    value: '',
    metricType: '',
    updateTime: BigInt(0),
    blockHeight: BigInt(0),
    attributes: '',
  };
}
export const MsgPostMetric = {
  typeUrl: '/stride.icaoracle.MsgPostMetric',
  encode(
    message: MsgPostMetric,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.key !== '') {
      writer.uint32(10).string(message.key);
    }
    if (message.value !== '') {
      writer.uint32(18).string(message.value);
    }
    if (message.metricType !== '') {
      writer.uint32(26).string(message.metricType);
    }
    if (message.updateTime !== BigInt(0)) {
      writer.uint32(32).int64(message.updateTime);
    }
    if (message.blockHeight !== BigInt(0)) {
      writer.uint32(40).int64(message.blockHeight);
    }
    if (message.attributes !== '') {
      writer.uint32(50).string(message.attributes);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgPostMetric {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgPostMetric();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.key = reader.string();
          break;
        case 2:
          message.value = reader.string();
          break;
        case 3:
          message.metricType = reader.string();
          break;
        case 4:
          message.updateTime = reader.int64();
          break;
        case 5:
          message.blockHeight = reader.int64();
          break;
        case 6:
          message.attributes = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): MsgPostMetric {
    return {
      key: isSet(object.key) ? String(object.key) : '',
      value: isSet(object.value) ? String(object.value) : '',
      metricType: isSet(object.metricType) ? String(object.metricType) : '',
      updateTime: isSet(object.updateTime)
        ? BigInt(object.updateTime.toString())
        : BigInt(0),
      blockHeight: isSet(object.blockHeight)
        ? BigInt(object.blockHeight.toString())
        : BigInt(0),
      attributes: isSet(object.attributes) ? String(object.attributes) : '',
    };
  },
  toJSON(message: MsgPostMetric): JsonSafe<MsgPostMetric> {
    const obj: any = {};
    message.key !== undefined && (obj.key = message.key);
    message.value !== undefined && (obj.value = message.value);
    message.metricType !== undefined && (obj.metricType = message.metricType);
    message.updateTime !== undefined &&
      (obj.updateTime = (message.updateTime || BigInt(0)).toString());
    message.blockHeight !== undefined &&
      (obj.blockHeight = (message.blockHeight || BigInt(0)).toString());
    message.attributes !== undefined && (obj.attributes = message.attributes);
    return obj;
  },
  fromPartial(object: Partial<MsgPostMetric>): MsgPostMetric {
    const message = createBaseMsgPostMetric();
    message.key = object.key ?? '';
    message.value = object.value ?? '';
    message.metricType = object.metricType ?? '';
    message.updateTime =
      object.updateTime !== undefined && object.updateTime !== null
        ? BigInt(object.updateTime.toString())
        : BigInt(0);
    message.blockHeight =
      object.blockHeight !== undefined && object.blockHeight !== null
        ? BigInt(object.blockHeight.toString())
        : BigInt(0);
    message.attributes = object.attributes ?? '';
    return message;
  },
  fromProtoMsg(message: MsgPostMetricProtoMsg): MsgPostMetric {
    return MsgPostMetric.decode(message.value);
  },
  toProto(message: MsgPostMetric): Uint8Array {
    return MsgPostMetric.encode(message).finish();
  },
  toProtoMsg(message: MsgPostMetric): MsgPostMetricProtoMsg {
    return {
      typeUrl: '/stride.icaoracle.MsgPostMetric',
      value: MsgPostMetric.encode(message).finish(),
    };
  },
};
