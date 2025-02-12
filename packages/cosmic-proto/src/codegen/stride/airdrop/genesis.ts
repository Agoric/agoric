//@ts-nocheck
import {
  Params,
  type ParamsSDKType,
  Airdrop,
  type AirdropSDKType,
  UserAllocation,
  type UserAllocationSDKType,
} from './airdrop.js';
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { isSet } from '../../helpers.js';
import { type JsonSafe } from '../../json-safe.js';
/** GenesisState defines the airdrop module's genesis state. */
export interface GenesisState {
  /** Module parameters */
  params: Params;
  /** All airdrop config records */
  airdrops: Airdrop[];
  /** All allocation records across all airdrops */
  userAllocations: UserAllocation[];
}
export interface GenesisStateProtoMsg {
  typeUrl: '/stride.airdrop.GenesisState';
  value: Uint8Array;
}
/** GenesisState defines the airdrop module's genesis state. */
export interface GenesisStateSDKType {
  params: ParamsSDKType;
  airdrops: AirdropSDKType[];
  user_allocations: UserAllocationSDKType[];
}
function createBaseGenesisState(): GenesisState {
  return {
    params: Params.fromPartial({}),
    airdrops: [],
    userAllocations: [],
  };
}
export const GenesisState = {
  typeUrl: '/stride.airdrop.GenesisState',
  encode(
    message: GenesisState,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.params !== undefined) {
      Params.encode(message.params, writer.uint32(10).fork()).ldelim();
    }
    for (const v of message.airdrops) {
      Airdrop.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    for (const v of message.userAllocations) {
      UserAllocation.encode(v!, writer.uint32(26).fork()).ldelim();
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
          message.params = Params.decode(reader, reader.uint32());
          break;
        case 2:
          message.airdrops.push(Airdrop.decode(reader, reader.uint32()));
          break;
        case 3:
          message.userAllocations.push(
            UserAllocation.decode(reader, reader.uint32()),
          );
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
      params: isSet(object.params) ? Params.fromJSON(object.params) : undefined,
      airdrops: Array.isArray(object?.airdrops)
        ? object.airdrops.map((e: any) => Airdrop.fromJSON(e))
        : [],
      userAllocations: Array.isArray(object?.userAllocations)
        ? object.userAllocations.map((e: any) => UserAllocation.fromJSON(e))
        : [],
    };
  },
  toJSON(message: GenesisState): JsonSafe<GenesisState> {
    const obj: any = {};
    message.params !== undefined &&
      (obj.params = message.params ? Params.toJSON(message.params) : undefined);
    if (message.airdrops) {
      obj.airdrops = message.airdrops.map(e =>
        e ? Airdrop.toJSON(e) : undefined,
      );
    } else {
      obj.airdrops = [];
    }
    if (message.userAllocations) {
      obj.userAllocations = message.userAllocations.map(e =>
        e ? UserAllocation.toJSON(e) : undefined,
      );
    } else {
      obj.userAllocations = [];
    }
    return obj;
  },
  fromPartial(object: Partial<GenesisState>): GenesisState {
    const message = createBaseGenesisState();
    message.params =
      object.params !== undefined && object.params !== null
        ? Params.fromPartial(object.params)
        : undefined;
    message.airdrops = object.airdrops?.map(e => Airdrop.fromPartial(e)) || [];
    message.userAllocations =
      object.userAllocations?.map(e => UserAllocation.fromPartial(e)) || [];
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
      typeUrl: '/stride.airdrop.GenesisState',
      value: GenesisState.encode(message).finish(),
    };
  },
};
