//@ts-nocheck
import { Params, type ParamsSDKType } from './icq.js';
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { isSet } from '../../helpers.js';
import { type JsonSafe } from '../../json-safe.js';
/** GenesisState defines the interchain query genesis state */
export interface GenesisState {
  hostPort: string;
  params: Params;
}
export interface GenesisStateProtoMsg {
  typeUrl: '/icq.v1.GenesisState';
  value: Uint8Array;
}
/** GenesisState defines the interchain query genesis state */
export interface GenesisStateSDKType {
  host_port: string;
  params: ParamsSDKType;
}
function createBaseGenesisState(): GenesisState {
  return {
    hostPort: '',
    params: Params.fromPartial({}),
  };
}
export const GenesisState = {
  typeUrl: '/icq.v1.GenesisState',
  encode(
    message: GenesisState,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.hostPort !== '') {
      writer.uint32(10).string(message.hostPort);
    }
    if (message.params !== undefined) {
      Params.encode(message.params, writer.uint32(34).fork()).ldelim();
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
          message.hostPort = reader.string();
          break;
        case 4:
          message.params = Params.decode(reader, reader.uint32());
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
      hostPort: isSet(object.hostPort) ? String(object.hostPort) : '',
      params: isSet(object.params) ? Params.fromJSON(object.params) : undefined,
    };
  },
  toJSON(message: GenesisState): JsonSafe<GenesisState> {
    const obj: any = {};
    message.hostPort !== undefined && (obj.hostPort = message.hostPort);
    message.params !== undefined &&
      (obj.params = message.params ? Params.toJSON(message.params) : undefined);
    return obj;
  },
  fromPartial(object: Partial<GenesisState>): GenesisState {
    const message = createBaseGenesisState();
    message.hostPort = object.hostPort ?? '';
    message.params =
      object.params !== undefined && object.params !== null
        ? Params.fromPartial(object.params)
        : undefined;
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
      typeUrl: '/icq.v1.GenesisState',
      value: GenesisState.encode(message).finish(),
    };
  },
};
