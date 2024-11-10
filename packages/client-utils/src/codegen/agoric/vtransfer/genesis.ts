//@ts-nocheck
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { bytesFromBase64, base64FromBytes } from '../../helpers.js';
import { type JsonSafe } from '../../json-safe.js';
/** The initial and exported module state. */
export interface GenesisState {
  /** The list of account addresses that are being watched by the VM. */
  watchedAddresses: Uint8Array[];
}
export interface GenesisStateProtoMsg {
  typeUrl: '/agoric.vtransfer.GenesisState';
  value: Uint8Array;
}
/** The initial and exported module state. */
export interface GenesisStateSDKType {
  watched_addresses: Uint8Array[];
}
function createBaseGenesisState(): GenesisState {
  return {
    watchedAddresses: [],
  };
}
export const GenesisState = {
  typeUrl: '/agoric.vtransfer.GenesisState',
  encode(
    message: GenesisState,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    for (const v of message.watchedAddresses) {
      writer.uint32(10).bytes(v!);
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
          message.watchedAddresses.push(reader.bytes());
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
      watchedAddresses: Array.isArray(object?.watchedAddresses)
        ? object.watchedAddresses.map((e: any) => bytesFromBase64(e))
        : [],
    };
  },
  toJSON(message: GenesisState): JsonSafe<GenesisState> {
    const obj: any = {};
    if (message.watchedAddresses) {
      obj.watchedAddresses = message.watchedAddresses.map(e =>
        base64FromBytes(e !== undefined ? e : new Uint8Array()),
      );
    } else {
      obj.watchedAddresses = [];
    }
    return obj;
  },
  fromPartial(object: Partial<GenesisState>): GenesisState {
    const message = createBaseGenesisState();
    message.watchedAddresses = object.watchedAddresses?.map(e => e) || [];
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
      typeUrl: '/agoric.vtransfer.GenesisState',
      value: GenesisState.encode(message).finish(),
    };
  },
};
