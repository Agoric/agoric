//@ts-nocheck
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { isSet } from '../../helpers.js';
import { type JsonSafe } from '../../json-safe.js';
/** Params defines the set of on-chain interchain query parameters. */
export interface Params {
  /** host_enabled enables or disables the host submodule. */
  hostEnabled: boolean;
  /** allow_queries defines a list of query paths allowed to be queried on a host chain. */
  allowQueries: string[];
}
export interface ParamsProtoMsg {
  typeUrl: '/icq.v1.Params';
  value: Uint8Array;
}
/** Params defines the set of on-chain interchain query parameters. */
export interface ParamsSDKType {
  host_enabled: boolean;
  allow_queries: string[];
}
function createBaseParams(): Params {
  return {
    hostEnabled: false,
    allowQueries: [],
  };
}
export const Params = {
  typeUrl: '/icq.v1.Params',
  encode(
    message: Params,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.hostEnabled === true) {
      writer.uint32(16).bool(message.hostEnabled);
    }
    for (const v of message.allowQueries) {
      writer.uint32(26).string(v!);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): Params {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseParams();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 2:
          message.hostEnabled = reader.bool();
          break;
        case 3:
          message.allowQueries.push(reader.string());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): Params {
    return {
      hostEnabled: isSet(object.hostEnabled)
        ? Boolean(object.hostEnabled)
        : false,
      allowQueries: Array.isArray(object?.allowQueries)
        ? object.allowQueries.map((e: any) => String(e))
        : [],
    };
  },
  toJSON(message: Params): JsonSafe<Params> {
    const obj: any = {};
    message.hostEnabled !== undefined &&
      (obj.hostEnabled = message.hostEnabled);
    if (message.allowQueries) {
      obj.allowQueries = message.allowQueries.map(e => e);
    } else {
      obj.allowQueries = [];
    }
    return obj;
  },
  fromPartial(object: Partial<Params>): Params {
    const message = createBaseParams();
    message.hostEnabled = object.hostEnabled ?? false;
    message.allowQueries = object.allowQueries?.map(e => e) || [];
    return message;
  },
  fromProtoMsg(message: ParamsProtoMsg): Params {
    return Params.decode(message.value);
  },
  toProto(message: Params): Uint8Array {
    return Params.encode(message).finish();
  },
  toProtoMsg(message: Params): ParamsProtoMsg {
    return {
      typeUrl: '/icq.v1.Params',
      value: Params.encode(message).finish(),
    };
  },
};
