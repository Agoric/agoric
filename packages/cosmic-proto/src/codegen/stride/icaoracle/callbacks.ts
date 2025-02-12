//@ts-nocheck
import { Metric, type MetricSDKType } from './icaoracle.js';
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { isSet } from '../../helpers.js';
import { type JsonSafe } from '../../json-safe.js';
/** Callback data for instantiating an oracle */
export interface InstantiateOracleCallback {
  oracleChainId: string;
}
export interface InstantiateOracleCallbackProtoMsg {
  typeUrl: '/stride.icaoracle.InstantiateOracleCallback';
  value: Uint8Array;
}
/** Callback data for instantiating an oracle */
export interface InstantiateOracleCallbackSDKType {
  oracle_chain_id: string;
}
/** Callback data for updating a value in the oracle */
export interface UpdateOracleCallback {
  oracleChainId: string;
  metric?: Metric;
}
export interface UpdateOracleCallbackProtoMsg {
  typeUrl: '/stride.icaoracle.UpdateOracleCallback';
  value: Uint8Array;
}
/** Callback data for updating a value in the oracle */
export interface UpdateOracleCallbackSDKType {
  oracle_chain_id: string;
  metric?: MetricSDKType;
}
function createBaseInstantiateOracleCallback(): InstantiateOracleCallback {
  return {
    oracleChainId: '',
  };
}
export const InstantiateOracleCallback = {
  typeUrl: '/stride.icaoracle.InstantiateOracleCallback',
  encode(
    message: InstantiateOracleCallback,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.oracleChainId !== '') {
      writer.uint32(10).string(message.oracleChainId);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): InstantiateOracleCallback {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseInstantiateOracleCallback();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.oracleChainId = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): InstantiateOracleCallback {
    return {
      oracleChainId: isSet(object.oracleChainId)
        ? String(object.oracleChainId)
        : '',
    };
  },
  toJSON(
    message: InstantiateOracleCallback,
  ): JsonSafe<InstantiateOracleCallback> {
    const obj: any = {};
    message.oracleChainId !== undefined &&
      (obj.oracleChainId = message.oracleChainId);
    return obj;
  },
  fromPartial(
    object: Partial<InstantiateOracleCallback>,
  ): InstantiateOracleCallback {
    const message = createBaseInstantiateOracleCallback();
    message.oracleChainId = object.oracleChainId ?? '';
    return message;
  },
  fromProtoMsg(
    message: InstantiateOracleCallbackProtoMsg,
  ): InstantiateOracleCallback {
    return InstantiateOracleCallback.decode(message.value);
  },
  toProto(message: InstantiateOracleCallback): Uint8Array {
    return InstantiateOracleCallback.encode(message).finish();
  },
  toProtoMsg(
    message: InstantiateOracleCallback,
  ): InstantiateOracleCallbackProtoMsg {
    return {
      typeUrl: '/stride.icaoracle.InstantiateOracleCallback',
      value: InstantiateOracleCallback.encode(message).finish(),
    };
  },
};
function createBaseUpdateOracleCallback(): UpdateOracleCallback {
  return {
    oracleChainId: '',
    metric: undefined,
  };
}
export const UpdateOracleCallback = {
  typeUrl: '/stride.icaoracle.UpdateOracleCallback',
  encode(
    message: UpdateOracleCallback,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.oracleChainId !== '') {
      writer.uint32(10).string(message.oracleChainId);
    }
    if (message.metric !== undefined) {
      Metric.encode(message.metric, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): UpdateOracleCallback {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUpdateOracleCallback();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.oracleChainId = reader.string();
          break;
        case 2:
          message.metric = Metric.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): UpdateOracleCallback {
    return {
      oracleChainId: isSet(object.oracleChainId)
        ? String(object.oracleChainId)
        : '',
      metric: isSet(object.metric) ? Metric.fromJSON(object.metric) : undefined,
    };
  },
  toJSON(message: UpdateOracleCallback): JsonSafe<UpdateOracleCallback> {
    const obj: any = {};
    message.oracleChainId !== undefined &&
      (obj.oracleChainId = message.oracleChainId);
    message.metric !== undefined &&
      (obj.metric = message.metric ? Metric.toJSON(message.metric) : undefined);
    return obj;
  },
  fromPartial(object: Partial<UpdateOracleCallback>): UpdateOracleCallback {
    const message = createBaseUpdateOracleCallback();
    message.oracleChainId = object.oracleChainId ?? '';
    message.metric =
      object.metric !== undefined && object.metric !== null
        ? Metric.fromPartial(object.metric)
        : undefined;
    return message;
  },
  fromProtoMsg(message: UpdateOracleCallbackProtoMsg): UpdateOracleCallback {
    return UpdateOracleCallback.decode(message.value);
  },
  toProto(message: UpdateOracleCallback): Uint8Array {
    return UpdateOracleCallback.encode(message).finish();
  },
  toProtoMsg(message: UpdateOracleCallback): UpdateOracleCallbackProtoMsg {
    return {
      typeUrl: '/stride.icaoracle.UpdateOracleCallback',
      value: UpdateOracleCallback.encode(message).finish(),
    };
  },
};
