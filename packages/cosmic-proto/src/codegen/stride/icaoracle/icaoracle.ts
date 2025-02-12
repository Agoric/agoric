//@ts-nocheck
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { isSet } from '../../helpers.js';
import { type JsonSafe } from '../../json-safe.js';
/** MetricStatus indicates whether the Metric update ICA has been sent */
export enum MetricStatus {
  METRIC_STATUS_UNSPECIFIED = 0,
  METRIC_STATUS_QUEUED = 1,
  METRIC_STATUS_IN_PROGRESS = 2,
  UNRECOGNIZED = -1,
}
export const MetricStatusSDKType = MetricStatus;
export function metricStatusFromJSON(object: any): MetricStatus {
  switch (object) {
    case 0:
    case 'METRIC_STATUS_UNSPECIFIED':
      return MetricStatus.METRIC_STATUS_UNSPECIFIED;
    case 1:
    case 'METRIC_STATUS_QUEUED':
      return MetricStatus.METRIC_STATUS_QUEUED;
    case 2:
    case 'METRIC_STATUS_IN_PROGRESS':
      return MetricStatus.METRIC_STATUS_IN_PROGRESS;
    case -1:
    case 'UNRECOGNIZED':
    default:
      return MetricStatus.UNRECOGNIZED;
  }
}
export function metricStatusToJSON(object: MetricStatus): string {
  switch (object) {
    case MetricStatus.METRIC_STATUS_UNSPECIFIED:
      return 'METRIC_STATUS_UNSPECIFIED';
    case MetricStatus.METRIC_STATUS_QUEUED:
      return 'METRIC_STATUS_QUEUED';
    case MetricStatus.METRIC_STATUS_IN_PROGRESS:
      return 'METRIC_STATUS_IN_PROGRESS';
    case MetricStatus.UNRECOGNIZED:
    default:
      return 'UNRECOGNIZED';
  }
}
/** Oracle structure stores context about the CW oracle sitting a different chain */
export interface Oracle {
  chainId: string;
  connectionId: string;
  channelId: string;
  portId: string;
  icaAddress: string;
  contractAddress: string;
  active: boolean;
}
export interface OracleProtoMsg {
  typeUrl: '/stride.icaoracle.Oracle';
  value: Uint8Array;
}
/** Oracle structure stores context about the CW oracle sitting a different chain */
export interface OracleSDKType {
  chain_id: string;
  connection_id: string;
  channel_id: string;
  port_id: string;
  ica_address: string;
  contract_address: string;
  active: boolean;
}
/**
 * Metric structure stores a generic metric using a key value structure
 * along with additional context
 */
export interface Metric {
  key: string;
  value: string;
  metricType: string;
  updateTime: bigint;
  blockHeight: bigint;
  attributes: string;
  destinationOracle: string;
  status: MetricStatus;
}
export interface MetricProtoMsg {
  typeUrl: '/stride.icaoracle.Metric';
  value: Uint8Array;
}
/**
 * Metric structure stores a generic metric using a key value structure
 * along with additional context
 */
export interface MetricSDKType {
  key: string;
  value: string;
  metric_type: string;
  update_time: bigint;
  block_height: bigint;
  attributes: string;
  destination_oracle: string;
  status: MetricStatus;
}
/** Attributes associated with a RedemptionRate metric update */
export interface RedemptionRateAttributes {
  sttokenDenom: string;
}
export interface RedemptionRateAttributesProtoMsg {
  typeUrl: '/stride.icaoracle.RedemptionRateAttributes';
  value: Uint8Array;
}
/** Attributes associated with a RedemptionRate metric update */
export interface RedemptionRateAttributesSDKType {
  sttoken_denom: string;
}
function createBaseOracle(): Oracle {
  return {
    chainId: '',
    connectionId: '',
    channelId: '',
    portId: '',
    icaAddress: '',
    contractAddress: '',
    active: false,
  };
}
export const Oracle = {
  typeUrl: '/stride.icaoracle.Oracle',
  encode(
    message: Oracle,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.chainId !== '') {
      writer.uint32(10).string(message.chainId);
    }
    if (message.connectionId !== '') {
      writer.uint32(18).string(message.connectionId);
    }
    if (message.channelId !== '') {
      writer.uint32(26).string(message.channelId);
    }
    if (message.portId !== '') {
      writer.uint32(34).string(message.portId);
    }
    if (message.icaAddress !== '') {
      writer.uint32(42).string(message.icaAddress);
    }
    if (message.contractAddress !== '') {
      writer.uint32(50).string(message.contractAddress);
    }
    if (message.active === true) {
      writer.uint32(56).bool(message.active);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): Oracle {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseOracle();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.chainId = reader.string();
          break;
        case 2:
          message.connectionId = reader.string();
          break;
        case 3:
          message.channelId = reader.string();
          break;
        case 4:
          message.portId = reader.string();
          break;
        case 5:
          message.icaAddress = reader.string();
          break;
        case 6:
          message.contractAddress = reader.string();
          break;
        case 7:
          message.active = reader.bool();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): Oracle {
    return {
      chainId: isSet(object.chainId) ? String(object.chainId) : '',
      connectionId: isSet(object.connectionId)
        ? String(object.connectionId)
        : '',
      channelId: isSet(object.channelId) ? String(object.channelId) : '',
      portId: isSet(object.portId) ? String(object.portId) : '',
      icaAddress: isSet(object.icaAddress) ? String(object.icaAddress) : '',
      contractAddress: isSet(object.contractAddress)
        ? String(object.contractAddress)
        : '',
      active: isSet(object.active) ? Boolean(object.active) : false,
    };
  },
  toJSON(message: Oracle): JsonSafe<Oracle> {
    const obj: any = {};
    message.chainId !== undefined && (obj.chainId = message.chainId);
    message.connectionId !== undefined &&
      (obj.connectionId = message.connectionId);
    message.channelId !== undefined && (obj.channelId = message.channelId);
    message.portId !== undefined && (obj.portId = message.portId);
    message.icaAddress !== undefined && (obj.icaAddress = message.icaAddress);
    message.contractAddress !== undefined &&
      (obj.contractAddress = message.contractAddress);
    message.active !== undefined && (obj.active = message.active);
    return obj;
  },
  fromPartial(object: Partial<Oracle>): Oracle {
    const message = createBaseOracle();
    message.chainId = object.chainId ?? '';
    message.connectionId = object.connectionId ?? '';
    message.channelId = object.channelId ?? '';
    message.portId = object.portId ?? '';
    message.icaAddress = object.icaAddress ?? '';
    message.contractAddress = object.contractAddress ?? '';
    message.active = object.active ?? false;
    return message;
  },
  fromProtoMsg(message: OracleProtoMsg): Oracle {
    return Oracle.decode(message.value);
  },
  toProto(message: Oracle): Uint8Array {
    return Oracle.encode(message).finish();
  },
  toProtoMsg(message: Oracle): OracleProtoMsg {
    return {
      typeUrl: '/stride.icaoracle.Oracle',
      value: Oracle.encode(message).finish(),
    };
  },
};
function createBaseMetric(): Metric {
  return {
    key: '',
    value: '',
    metricType: '',
    updateTime: BigInt(0),
    blockHeight: BigInt(0),
    attributes: '',
    destinationOracle: '',
    status: 0,
  };
}
export const Metric = {
  typeUrl: '/stride.icaoracle.Metric',
  encode(
    message: Metric,
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
    if (message.destinationOracle !== '') {
      writer.uint32(58).string(message.destinationOracle);
    }
    if (message.status !== 0) {
      writer.uint32(64).int32(message.status);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): Metric {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMetric();
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
        case 7:
          message.destinationOracle = reader.string();
          break;
        case 8:
          message.status = reader.int32() as any;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): Metric {
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
      destinationOracle: isSet(object.destinationOracle)
        ? String(object.destinationOracle)
        : '',
      status: isSet(object.status) ? metricStatusFromJSON(object.status) : -1,
    };
  },
  toJSON(message: Metric): JsonSafe<Metric> {
    const obj: any = {};
    message.key !== undefined && (obj.key = message.key);
    message.value !== undefined && (obj.value = message.value);
    message.metricType !== undefined && (obj.metricType = message.metricType);
    message.updateTime !== undefined &&
      (obj.updateTime = (message.updateTime || BigInt(0)).toString());
    message.blockHeight !== undefined &&
      (obj.blockHeight = (message.blockHeight || BigInt(0)).toString());
    message.attributes !== undefined && (obj.attributes = message.attributes);
    message.destinationOracle !== undefined &&
      (obj.destinationOracle = message.destinationOracle);
    message.status !== undefined &&
      (obj.status = metricStatusToJSON(message.status));
    return obj;
  },
  fromPartial(object: Partial<Metric>): Metric {
    const message = createBaseMetric();
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
    message.destinationOracle = object.destinationOracle ?? '';
    message.status = object.status ?? 0;
    return message;
  },
  fromProtoMsg(message: MetricProtoMsg): Metric {
    return Metric.decode(message.value);
  },
  toProto(message: Metric): Uint8Array {
    return Metric.encode(message).finish();
  },
  toProtoMsg(message: Metric): MetricProtoMsg {
    return {
      typeUrl: '/stride.icaoracle.Metric',
      value: Metric.encode(message).finish(),
    };
  },
};
function createBaseRedemptionRateAttributes(): RedemptionRateAttributes {
  return {
    sttokenDenom: '',
  };
}
export const RedemptionRateAttributes = {
  typeUrl: '/stride.icaoracle.RedemptionRateAttributes',
  encode(
    message: RedemptionRateAttributes,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.sttokenDenom !== '') {
      writer.uint32(10).string(message.sttokenDenom);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): RedemptionRateAttributes {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRedemptionRateAttributes();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.sttokenDenom = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): RedemptionRateAttributes {
    return {
      sttokenDenom: isSet(object.sttokenDenom)
        ? String(object.sttokenDenom)
        : '',
    };
  },
  toJSON(
    message: RedemptionRateAttributes,
  ): JsonSafe<RedemptionRateAttributes> {
    const obj: any = {};
    message.sttokenDenom !== undefined &&
      (obj.sttokenDenom = message.sttokenDenom);
    return obj;
  },
  fromPartial(
    object: Partial<RedemptionRateAttributes>,
  ): RedemptionRateAttributes {
    const message = createBaseRedemptionRateAttributes();
    message.sttokenDenom = object.sttokenDenom ?? '';
    return message;
  },
  fromProtoMsg(
    message: RedemptionRateAttributesProtoMsg,
  ): RedemptionRateAttributes {
    return RedemptionRateAttributes.decode(message.value);
  },
  toProto(message: RedemptionRateAttributes): Uint8Array {
    return RedemptionRateAttributes.encode(message).finish();
  },
  toProtoMsg(
    message: RedemptionRateAttributes,
  ): RedemptionRateAttributesProtoMsg {
    return {
      typeUrl: '/stride.icaoracle.RedemptionRateAttributes',
      value: RedemptionRateAttributes.encode(message).finish(),
    };
  },
};
