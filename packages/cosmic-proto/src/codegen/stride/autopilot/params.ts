//@ts-nocheck
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { isSet } from '../../helpers.js';
import { type JsonSafe } from '../../json-safe.js';
/**
 * Params defines the parameters for the module.
 * next id: 1
 */
export interface Params {
  /** optionally, turn off each module */
  stakeibcActive: boolean;
  claimActive: boolean;
}
export interface ParamsProtoMsg {
  typeUrl: '/stride.autopilot.Params';
  value: Uint8Array;
}
/**
 * Params defines the parameters for the module.
 * next id: 1
 */
export interface ParamsSDKType {
  stakeibc_active: boolean;
  claim_active: boolean;
}
function createBaseParams(): Params {
  return {
    stakeibcActive: false,
    claimActive: false,
  };
}
export const Params = {
  typeUrl: '/stride.autopilot.Params',
  encode(
    message: Params,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.stakeibcActive === true) {
      writer.uint32(8).bool(message.stakeibcActive);
    }
    if (message.claimActive === true) {
      writer.uint32(16).bool(message.claimActive);
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
        case 1:
          message.stakeibcActive = reader.bool();
          break;
        case 2:
          message.claimActive = reader.bool();
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
      stakeibcActive: isSet(object.stakeibcActive)
        ? Boolean(object.stakeibcActive)
        : false,
      claimActive: isSet(object.claimActive)
        ? Boolean(object.claimActive)
        : false,
    };
  },
  toJSON(message: Params): JsonSafe<Params> {
    const obj: any = {};
    message.stakeibcActive !== undefined &&
      (obj.stakeibcActive = message.stakeibcActive);
    message.claimActive !== undefined &&
      (obj.claimActive = message.claimActive);
    return obj;
  },
  fromPartial(object: Partial<Params>): Params {
    const message = createBaseParams();
    message.stakeibcActive = object.stakeibcActive ?? false;
    message.claimActive = object.claimActive ?? false;
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
      typeUrl: '/stride.autopilot.Params',
      value: Params.encode(message).finish(),
    };
  },
};
