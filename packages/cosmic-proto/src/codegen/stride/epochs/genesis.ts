//@ts-nocheck
import {
  Timestamp,
  type TimestampSDKType,
} from '../../google/protobuf/timestamp.js';
import {
  Duration,
  type DurationSDKType,
} from '../../google/protobuf/duration.js';
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { isSet, fromJsonTimestamp, fromTimestamp } from '../../helpers.js';
import { type JsonSafe } from '../../json-safe.js';
export interface EpochInfo {
  identifier: string;
  startTime: Timestamp;
  duration: Duration;
  currentEpoch: bigint;
  currentEpochStartTime: Timestamp;
  epochCountingStarted: boolean;
  currentEpochStartHeight: bigint;
}
export interface EpochInfoProtoMsg {
  typeUrl: '/stride.epochs.EpochInfo';
  value: Uint8Array;
}
export interface EpochInfoSDKType {
  identifier: string;
  start_time: TimestampSDKType;
  duration: DurationSDKType;
  current_epoch: bigint;
  current_epoch_start_time: TimestampSDKType;
  epoch_counting_started: boolean;
  current_epoch_start_height: bigint;
}
/** GenesisState defines the epochs module's genesis state. */
export interface GenesisState {
  epochs: EpochInfo[];
}
export interface GenesisStateProtoMsg {
  typeUrl: '/stride.epochs.GenesisState';
  value: Uint8Array;
}
/** GenesisState defines the epochs module's genesis state. */
export interface GenesisStateSDKType {
  epochs: EpochInfoSDKType[];
}
function createBaseEpochInfo(): EpochInfo {
  return {
    identifier: '',
    startTime: Timestamp.fromPartial({}),
    duration: Duration.fromPartial({}),
    currentEpoch: BigInt(0),
    currentEpochStartTime: Timestamp.fromPartial({}),
    epochCountingStarted: false,
    currentEpochStartHeight: BigInt(0),
  };
}
export const EpochInfo = {
  typeUrl: '/stride.epochs.EpochInfo',
  encode(
    message: EpochInfo,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.identifier !== '') {
      writer.uint32(10).string(message.identifier);
    }
    if (message.startTime !== undefined) {
      Timestamp.encode(message.startTime, writer.uint32(18).fork()).ldelim();
    }
    if (message.duration !== undefined) {
      Duration.encode(message.duration, writer.uint32(26).fork()).ldelim();
    }
    if (message.currentEpoch !== BigInt(0)) {
      writer.uint32(32).int64(message.currentEpoch);
    }
    if (message.currentEpochStartTime !== undefined) {
      Timestamp.encode(
        message.currentEpochStartTime,
        writer.uint32(42).fork(),
      ).ldelim();
    }
    if (message.epochCountingStarted === true) {
      writer.uint32(48).bool(message.epochCountingStarted);
    }
    if (message.currentEpochStartHeight !== BigInt(0)) {
      writer.uint32(56).int64(message.currentEpochStartHeight);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): EpochInfo {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEpochInfo();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.identifier = reader.string();
          break;
        case 2:
          message.startTime = Timestamp.decode(reader, reader.uint32());
          break;
        case 3:
          message.duration = Duration.decode(reader, reader.uint32());
          break;
        case 4:
          message.currentEpoch = reader.int64();
          break;
        case 5:
          message.currentEpochStartTime = Timestamp.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 6:
          message.epochCountingStarted = reader.bool();
          break;
        case 7:
          message.currentEpochStartHeight = reader.int64();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): EpochInfo {
    return {
      identifier: isSet(object.identifier) ? String(object.identifier) : '',
      startTime: isSet(object.startTime)
        ? fromJsonTimestamp(object.startTime)
        : undefined,
      duration: isSet(object.duration)
        ? Duration.fromJSON(object.duration)
        : undefined,
      currentEpoch: isSet(object.currentEpoch)
        ? BigInt(object.currentEpoch.toString())
        : BigInt(0),
      currentEpochStartTime: isSet(object.currentEpochStartTime)
        ? fromJsonTimestamp(object.currentEpochStartTime)
        : undefined,
      epochCountingStarted: isSet(object.epochCountingStarted)
        ? Boolean(object.epochCountingStarted)
        : false,
      currentEpochStartHeight: isSet(object.currentEpochStartHeight)
        ? BigInt(object.currentEpochStartHeight.toString())
        : BigInt(0),
    };
  },
  toJSON(message: EpochInfo): JsonSafe<EpochInfo> {
    const obj: any = {};
    message.identifier !== undefined && (obj.identifier = message.identifier);
    message.startTime !== undefined &&
      (obj.startTime = fromTimestamp(message.startTime).toISOString());
    message.duration !== undefined &&
      (obj.duration = message.duration
        ? Duration.toJSON(message.duration)
        : undefined);
    message.currentEpoch !== undefined &&
      (obj.currentEpoch = (message.currentEpoch || BigInt(0)).toString());
    message.currentEpochStartTime !== undefined &&
      (obj.currentEpochStartTime = fromTimestamp(
        message.currentEpochStartTime,
      ).toISOString());
    message.epochCountingStarted !== undefined &&
      (obj.epochCountingStarted = message.epochCountingStarted);
    message.currentEpochStartHeight !== undefined &&
      (obj.currentEpochStartHeight = (
        message.currentEpochStartHeight || BigInt(0)
      ).toString());
    return obj;
  },
  fromPartial(object: Partial<EpochInfo>): EpochInfo {
    const message = createBaseEpochInfo();
    message.identifier = object.identifier ?? '';
    message.startTime =
      object.startTime !== undefined && object.startTime !== null
        ? Timestamp.fromPartial(object.startTime)
        : undefined;
    message.duration =
      object.duration !== undefined && object.duration !== null
        ? Duration.fromPartial(object.duration)
        : undefined;
    message.currentEpoch =
      object.currentEpoch !== undefined && object.currentEpoch !== null
        ? BigInt(object.currentEpoch.toString())
        : BigInt(0);
    message.currentEpochStartTime =
      object.currentEpochStartTime !== undefined &&
      object.currentEpochStartTime !== null
        ? Timestamp.fromPartial(object.currentEpochStartTime)
        : undefined;
    message.epochCountingStarted = object.epochCountingStarted ?? false;
    message.currentEpochStartHeight =
      object.currentEpochStartHeight !== undefined &&
      object.currentEpochStartHeight !== null
        ? BigInt(object.currentEpochStartHeight.toString())
        : BigInt(0);
    return message;
  },
  fromProtoMsg(message: EpochInfoProtoMsg): EpochInfo {
    return EpochInfo.decode(message.value);
  },
  toProto(message: EpochInfo): Uint8Array {
    return EpochInfo.encode(message).finish();
  },
  toProtoMsg(message: EpochInfo): EpochInfoProtoMsg {
    return {
      typeUrl: '/stride.epochs.EpochInfo',
      value: EpochInfo.encode(message).finish(),
    };
  },
};
function createBaseGenesisState(): GenesisState {
  return {
    epochs: [],
  };
}
export const GenesisState = {
  typeUrl: '/stride.epochs.GenesisState',
  encode(
    message: GenesisState,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    for (const v of message.epochs) {
      EpochInfo.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): GenesisState {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGenesisState();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.epochs.push(EpochInfo.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): GenesisState {
    return {
      epochs: Array.isArray(object?.epochs)
        ? object.epochs.map((e: any) => EpochInfo.fromJSON(e))
        : [],
    };
  },
  toJSON(message: GenesisState): JsonSafe<GenesisState> {
    const obj: any = {};
    if (message.epochs) {
      obj.epochs = message.epochs.map(e =>
        e ? EpochInfo.toJSON(e) : undefined,
      );
    } else {
      obj.epochs = [];
    }
    return obj;
  },
  fromPartial(object: Partial<GenesisState>): GenesisState {
    const message = createBaseGenesisState();
    message.epochs = object.epochs?.map(e => EpochInfo.fromPartial(e)) || [];
    return message;
  },
  fromProtoMsg(message: GenesisStateProtoMsg): GenesisState {
    return GenesisState.decode(message.value);
  },
  toProto(message: GenesisState): Uint8Array {
    return GenesisState.encode(message).finish();
  },
  toProtoMsg(message: GenesisState): GenesisStateProtoMsg {
    return {
      typeUrl: '/stride.epochs.GenesisState',
      value: GenesisState.encode(message).finish(),
    };
  },
};
