//@ts-nocheck
import { BinaryReader, BinaryWriter } from '../../../../binary.js';
import { isSet } from '../../../../helpers.js';
import { type JsonSafe } from '../../../../json-safe.js';
/**
 * DenomTrace contains the base denomination for ICS20 fungible tokens and the
 * source tracing information path.
 */
export interface DenomTrace {
  /**
   * path defines the chain of port/channel identifiers used for tracing the
   * source of the fungible token.
   */
  path: string;
  /** base denomination of the relayed fungible token. */
  baseDenom: string;
}
export interface DenomTraceProtoMsg {
  typeUrl: '/ibc.applications.transfer.v1.DenomTrace';
  value: Uint8Array;
}
/**
 * DenomTrace contains the base denomination for ICS20 fungible tokens and the
 * source tracing information path.
 */
export interface DenomTraceSDKType {
  path: string;
  base_denom: string;
}
/**
 * Params defines the set of IBC transfer parameters.
 * NOTE: To prevent a single token from being transferred, set the
 * TransfersEnabled parameter to true and then set the bank module's SendEnabled
 * parameter for the denomination to false.
 */
export interface Params {
  /**
   * send_enabled enables or disables all cross-chain token transfers from this
   * chain.
   */
  sendEnabled: boolean;
  /**
   * receive_enabled enables or disables all cross-chain token transfers to this
   * chain.
   */
  receiveEnabled: boolean;
}
export interface ParamsProtoMsg {
  typeUrl: '/ibc.applications.transfer.v1.Params';
  value: Uint8Array;
}
/**
 * Params defines the set of IBC transfer parameters.
 * NOTE: To prevent a single token from being transferred, set the
 * TransfersEnabled parameter to true and then set the bank module's SendEnabled
 * parameter for the denomination to false.
 */
export interface ParamsSDKType {
  send_enabled: boolean;
  receive_enabled: boolean;
}
function createBaseDenomTrace(): DenomTrace {
  return {
    path: '',
    baseDenom: '',
  };
}
export const DenomTrace = {
  typeUrl: '/ibc.applications.transfer.v1.DenomTrace',
  encode(
    message: DenomTrace,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.path !== '') {
      writer.uint32(10).string(message.path);
    }
    if (message.baseDenom !== '') {
      writer.uint32(18).string(message.baseDenom);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): DenomTrace {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDenomTrace();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.path = reader.string();
          break;
        case 2:
          message.baseDenom = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): DenomTrace {
    return {
      path: isSet(object.path) ? String(object.path) : '',
      baseDenom: isSet(object.baseDenom) ? String(object.baseDenom) : '',
    };
  },
  toJSON(message: DenomTrace): JsonSafe<DenomTrace> {
    const obj: any = {};
    message.path !== undefined && (obj.path = message.path);
    message.baseDenom !== undefined && (obj.baseDenom = message.baseDenom);
    return obj;
  },
  fromPartial(object: Partial<DenomTrace>): DenomTrace {
    const message = createBaseDenomTrace();
    message.path = object.path ?? '';
    message.baseDenom = object.baseDenom ?? '';
    return message;
  },
  fromProtoMsg(message: DenomTraceProtoMsg): DenomTrace {
    return DenomTrace.decode(message.value);
  },
  toProto(message: DenomTrace): Uint8Array {
    return DenomTrace.encode(message).finish();
  },
  toProtoMsg(message: DenomTrace): DenomTraceProtoMsg {
    return {
      typeUrl: '/ibc.applications.transfer.v1.DenomTrace',
      value: DenomTrace.encode(message).finish(),
    };
  },
};
function createBaseParams(): Params {
  return {
    sendEnabled: false,
    receiveEnabled: false,
  };
}
export const Params = {
  typeUrl: '/ibc.applications.transfer.v1.Params',
  encode(
    message: Params,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.sendEnabled === true) {
      writer.uint32(8).bool(message.sendEnabled);
    }
    if (message.receiveEnabled === true) {
      writer.uint32(16).bool(message.receiveEnabled);
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
          message.sendEnabled = reader.bool();
          break;
        case 2:
          message.receiveEnabled = reader.bool();
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
      sendEnabled: isSet(object.sendEnabled)
        ? Boolean(object.sendEnabled)
        : false,
      receiveEnabled: isSet(object.receiveEnabled)
        ? Boolean(object.receiveEnabled)
        : false,
    };
  },
  toJSON(message: Params): JsonSafe<Params> {
    const obj: any = {};
    message.sendEnabled !== undefined &&
      (obj.sendEnabled = message.sendEnabled);
    message.receiveEnabled !== undefined &&
      (obj.receiveEnabled = message.receiveEnabled);
    return obj;
  },
  fromPartial(object: Partial<Params>): Params {
    const message = createBaseParams();
    message.sendEnabled = object.sendEnabled ?? false;
    message.receiveEnabled = object.receiveEnabled ?? false;
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
      typeUrl: '/ibc.applications.transfer.v1.Params',
      value: Params.encode(message).finish(),
    };
  },
};
