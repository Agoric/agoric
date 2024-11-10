//@ts-nocheck
import {
  IdentifiedConnection,
  type IdentifiedConnectionSDKType,
  ConnectionPaths,
  type ConnectionPathsSDKType,
  Params,
  type ParamsSDKType,
} from './connection.js';
import { BinaryReader, BinaryWriter } from '../../../../binary.js';
import { isSet } from '../../../../helpers.js';
import { type JsonSafe } from '../../../../json-safe.js';
/** GenesisState defines the ibc connection submodule's genesis state. */
export interface GenesisState {
  connections: IdentifiedConnection[];
  clientConnectionPaths: ConnectionPaths[];
  /** the sequence for the next generated connection identifier */
  nextConnectionSequence: bigint;
  params: Params;
}
export interface GenesisStateProtoMsg {
  typeUrl: '/ibc.core.connection.v1.GenesisState';
  value: Uint8Array;
}
/** GenesisState defines the ibc connection submodule's genesis state. */
export interface GenesisStateSDKType {
  connections: IdentifiedConnectionSDKType[];
  client_connection_paths: ConnectionPathsSDKType[];
  next_connection_sequence: bigint;
  params: ParamsSDKType;
}
function createBaseGenesisState(): GenesisState {
  return {
    connections: [],
    clientConnectionPaths: [],
    nextConnectionSequence: BigInt(0),
    params: Params.fromPartial({}),
  };
}
export const GenesisState = {
  typeUrl: '/ibc.core.connection.v1.GenesisState',
  encode(
    message: GenesisState,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    for (const v of message.connections) {
      IdentifiedConnection.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    for (const v of message.clientConnectionPaths) {
      ConnectionPaths.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    if (message.nextConnectionSequence !== BigInt(0)) {
      writer.uint32(24).uint64(message.nextConnectionSequence);
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
          message.connections.push(
            IdentifiedConnection.decode(reader, reader.uint32()),
          );
          break;
        case 2:
          message.clientConnectionPaths.push(
            ConnectionPaths.decode(reader, reader.uint32()),
          );
          break;
        case 3:
          message.nextConnectionSequence = reader.uint64();
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
      connections: Array.isArray(object?.connections)
        ? object.connections.map((e: any) => IdentifiedConnection.fromJSON(e))
        : [],
      clientConnectionPaths: Array.isArray(object?.clientConnectionPaths)
        ? object.clientConnectionPaths.map((e: any) =>
            ConnectionPaths.fromJSON(e),
          )
        : [],
      nextConnectionSequence: isSet(object.nextConnectionSequence)
        ? BigInt(object.nextConnectionSequence.toString())
        : BigInt(0),
      params: isSet(object.params) ? Params.fromJSON(object.params) : undefined,
    };
  },
  toJSON(message: GenesisState): JsonSafe<GenesisState> {
    const obj: any = {};
    if (message.connections) {
      obj.connections = message.connections.map(e =>
        e ? IdentifiedConnection.toJSON(e) : undefined,
      );
    } else {
      obj.connections = [];
    }
    if (message.clientConnectionPaths) {
      obj.clientConnectionPaths = message.clientConnectionPaths.map(e =>
        e ? ConnectionPaths.toJSON(e) : undefined,
      );
    } else {
      obj.clientConnectionPaths = [];
    }
    message.nextConnectionSequence !== undefined &&
      (obj.nextConnectionSequence = (
        message.nextConnectionSequence || BigInt(0)
      ).toString());
    message.params !== undefined &&
      (obj.params = message.params ? Params.toJSON(message.params) : undefined);
    return obj;
  },
  fromPartial(object: Partial<GenesisState>): GenesisState {
    const message = createBaseGenesisState();
    message.connections =
      object.connections?.map(e => IdentifiedConnection.fromPartial(e)) || [];
    message.clientConnectionPaths =
      object.clientConnectionPaths?.map(e => ConnectionPaths.fromPartial(e)) ||
      [];
    message.nextConnectionSequence =
      object.nextConnectionSequence !== undefined &&
      object.nextConnectionSequence !== null
        ? BigInt(object.nextConnectionSequence.toString())
        : BigInt(0);
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
      typeUrl: '/ibc.core.connection.v1.GenesisState',
      value: GenesisState.encode(message).finish(),
    };
  },
};
