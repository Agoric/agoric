//@ts-nocheck
import {
  Minter,
  type MinterSDKType,
  Params,
  type ParamsSDKType,
} from './mint.js';
import { BinaryReader, BinaryWriter } from '../../../binary.js';
import { isSet } from '../../../helpers.js';
import { type JsonSafe } from '../../../json-safe.js';
/** GenesisState defines the mint module's genesis state. */
export interface GenesisState {
  /** minter is a space for holding current rewards information. */
  minter: Minter;
  /** params defines all the paramaters of the module. */
  params: Params;
  /** current reduction period start epoch */
  reductionStartedEpoch: bigint;
}
export interface GenesisStateProtoMsg {
  typeUrl: '/stride.mint.v1beta1.GenesisState';
  value: Uint8Array;
}
/** GenesisState defines the mint module's genesis state. */
export interface GenesisStateSDKType {
  minter: MinterSDKType;
  params: ParamsSDKType;
  reduction_started_epoch: bigint;
}
function createBaseGenesisState(): GenesisState {
  return {
    minter: Minter.fromPartial({}),
    params: Params.fromPartial({}),
    reductionStartedEpoch: BigInt(0),
  };
}
export const GenesisState = {
  typeUrl: '/stride.mint.v1beta1.GenesisState',
  encode(
    message: GenesisState,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.minter !== undefined) {
      Minter.encode(message.minter, writer.uint32(10).fork()).ldelim();
    }
    if (message.params !== undefined) {
      Params.encode(message.params, writer.uint32(18).fork()).ldelim();
    }
    if (message.reductionStartedEpoch !== BigInt(0)) {
      writer.uint32(24).int64(message.reductionStartedEpoch);
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
          message.minter = Minter.decode(reader, reader.uint32());
          break;
        case 2:
          message.params = Params.decode(reader, reader.uint32());
          break;
        case 3:
          message.reductionStartedEpoch = reader.int64();
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
      minter: isSet(object.minter) ? Minter.fromJSON(object.minter) : undefined,
      params: isSet(object.params) ? Params.fromJSON(object.params) : undefined,
      reductionStartedEpoch: isSet(object.reductionStartedEpoch)
        ? BigInt(object.reductionStartedEpoch.toString())
        : BigInt(0),
    };
  },
  toJSON(message: GenesisState): JsonSafe<GenesisState> {
    const obj: any = {};
    message.minter !== undefined &&
      (obj.minter = message.minter ? Minter.toJSON(message.minter) : undefined);
    message.params !== undefined &&
      (obj.params = message.params ? Params.toJSON(message.params) : undefined);
    message.reductionStartedEpoch !== undefined &&
      (obj.reductionStartedEpoch = (
        message.reductionStartedEpoch || BigInt(0)
      ).toString());
    return obj;
  },
  fromPartial(object: Partial<GenesisState>): GenesisState {
    const message = createBaseGenesisState();
    message.minter =
      object.minter !== undefined && object.minter !== null
        ? Minter.fromPartial(object.minter)
        : undefined;
    message.params =
      object.params !== undefined && object.params !== null
        ? Params.fromPartial(object.params)
        : undefined;
    message.reductionStartedEpoch =
      object.reductionStartedEpoch !== undefined &&
      object.reductionStartedEpoch !== null
        ? BigInt(object.reductionStartedEpoch.toString())
        : BigInt(0);
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
      typeUrl: '/stride.mint.v1beta1.GenesisState',
      value: GenesisState.encode(message).finish(),
    };
  },
};
