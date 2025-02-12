//@ts-nocheck
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { Decimal, isSet } from '../../helpers.js';
import { type JsonSafe } from '../../json-safe.js';
export interface Validator {
  name: string;
  address: string;
  weight: bigint;
  delegation: string;
  slashQueryProgressTracker: string;
  slashQueryCheckpoint: string;
  sharesToTokensRate: string;
  delegationChangesInProgress: bigint;
  slashQueryInProgress: boolean;
}
export interface ValidatorProtoMsg {
  typeUrl: '/stride.stakeibc.Validator';
  value: Uint8Array;
}
export interface ValidatorSDKType {
  name: string;
  address: string;
  weight: bigint;
  delegation: string;
  slash_query_progress_tracker: string;
  slash_query_checkpoint: string;
  shares_to_tokens_rate: string;
  delegation_changes_in_progress: bigint;
  slash_query_in_progress: boolean;
}
function createBaseValidator(): Validator {
  return {
    name: '',
    address: '',
    weight: BigInt(0),
    delegation: '',
    slashQueryProgressTracker: '',
    slashQueryCheckpoint: '',
    sharesToTokensRate: '',
    delegationChangesInProgress: BigInt(0),
    slashQueryInProgress: false,
  };
}
export const Validator = {
  typeUrl: '/stride.stakeibc.Validator',
  encode(
    message: Validator,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.name !== '') {
      writer.uint32(10).string(message.name);
    }
    if (message.address !== '') {
      writer.uint32(18).string(message.address);
    }
    if (message.weight !== BigInt(0)) {
      writer.uint32(48).uint64(message.weight);
    }
    if (message.delegation !== '') {
      writer.uint32(42).string(message.delegation);
    }
    if (message.slashQueryProgressTracker !== '') {
      writer.uint32(74).string(message.slashQueryProgressTracker);
    }
    if (message.slashQueryCheckpoint !== '') {
      writer.uint32(98).string(message.slashQueryCheckpoint);
    }
    if (message.sharesToTokensRate !== '') {
      writer
        .uint32(82)
        .string(Decimal.fromUserInput(message.sharesToTokensRate, 18).atomics);
    }
    if (message.delegationChangesInProgress !== BigInt(0)) {
      writer.uint32(88).int64(message.delegationChangesInProgress);
    }
    if (message.slashQueryInProgress === true) {
      writer.uint32(104).bool(message.slashQueryInProgress);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): Validator {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseValidator();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.name = reader.string();
          break;
        case 2:
          message.address = reader.string();
          break;
        case 6:
          message.weight = reader.uint64();
          break;
        case 5:
          message.delegation = reader.string();
          break;
        case 9:
          message.slashQueryProgressTracker = reader.string();
          break;
        case 12:
          message.slashQueryCheckpoint = reader.string();
          break;
        case 10:
          message.sharesToTokensRate = Decimal.fromAtomics(
            reader.string(),
            18,
          ).toString();
          break;
        case 11:
          message.delegationChangesInProgress = reader.int64();
          break;
        case 13:
          message.slashQueryInProgress = reader.bool();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): Validator {
    return {
      name: isSet(object.name) ? String(object.name) : '',
      address: isSet(object.address) ? String(object.address) : '',
      weight: isSet(object.weight)
        ? BigInt(object.weight.toString())
        : BigInt(0),
      delegation: isSet(object.delegation) ? String(object.delegation) : '',
      slashQueryProgressTracker: isSet(object.slashQueryProgressTracker)
        ? String(object.slashQueryProgressTracker)
        : '',
      slashQueryCheckpoint: isSet(object.slashQueryCheckpoint)
        ? String(object.slashQueryCheckpoint)
        : '',
      sharesToTokensRate: isSet(object.sharesToTokensRate)
        ? String(object.sharesToTokensRate)
        : '',
      delegationChangesInProgress: isSet(object.delegationChangesInProgress)
        ? BigInt(object.delegationChangesInProgress.toString())
        : BigInt(0),
      slashQueryInProgress: isSet(object.slashQueryInProgress)
        ? Boolean(object.slashQueryInProgress)
        : false,
    };
  },
  toJSON(message: Validator): JsonSafe<Validator> {
    const obj: any = {};
    message.name !== undefined && (obj.name = message.name);
    message.address !== undefined && (obj.address = message.address);
    message.weight !== undefined &&
      (obj.weight = (message.weight || BigInt(0)).toString());
    message.delegation !== undefined && (obj.delegation = message.delegation);
    message.slashQueryProgressTracker !== undefined &&
      (obj.slashQueryProgressTracker = message.slashQueryProgressTracker);
    message.slashQueryCheckpoint !== undefined &&
      (obj.slashQueryCheckpoint = message.slashQueryCheckpoint);
    message.sharesToTokensRate !== undefined &&
      (obj.sharesToTokensRate = message.sharesToTokensRate);
    message.delegationChangesInProgress !== undefined &&
      (obj.delegationChangesInProgress = (
        message.delegationChangesInProgress || BigInt(0)
      ).toString());
    message.slashQueryInProgress !== undefined &&
      (obj.slashQueryInProgress = message.slashQueryInProgress);
    return obj;
  },
  fromPartial(object: Partial<Validator>): Validator {
    const message = createBaseValidator();
    message.name = object.name ?? '';
    message.address = object.address ?? '';
    message.weight =
      object.weight !== undefined && object.weight !== null
        ? BigInt(object.weight.toString())
        : BigInt(0);
    message.delegation = object.delegation ?? '';
    message.slashQueryProgressTracker = object.slashQueryProgressTracker ?? '';
    message.slashQueryCheckpoint = object.slashQueryCheckpoint ?? '';
    message.sharesToTokensRate = object.sharesToTokensRate ?? '';
    message.delegationChangesInProgress =
      object.delegationChangesInProgress !== undefined &&
      object.delegationChangesInProgress !== null
        ? BigInt(object.delegationChangesInProgress.toString())
        : BigInt(0);
    message.slashQueryInProgress = object.slashQueryInProgress ?? false;
    return message;
  },
  fromProtoMsg(message: ValidatorProtoMsg): Validator {
    return Validator.decode(message.value);
  },
  toProto(message: Validator): Uint8Array {
    return Validator.encode(message).finish();
  },
  toProtoMsg(message: Validator): ValidatorProtoMsg {
    return {
      typeUrl: '/stride.stakeibc.Validator',
      value: Validator.encode(message).finish(),
    };
  },
};
