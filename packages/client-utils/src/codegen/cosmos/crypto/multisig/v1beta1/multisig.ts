//@ts-nocheck
import { BinaryReader, BinaryWriter } from '../../../../binary.js';
import {
  bytesFromBase64,
  base64FromBytes,
  isSet,
} from '../../../../helpers.js';
import { type JsonSafe } from '../../../../json-safe.js';
/**
 * MultiSignature wraps the signatures from a multisig.LegacyAminoPubKey.
 * See cosmos.tx.v1betata1.ModeInfo.Multi for how to specify which signers
 * signed and with which modes.
 */
export interface MultiSignature {
  signatures: Uint8Array[];
}
export interface MultiSignatureProtoMsg {
  typeUrl: '/cosmos.crypto.multisig.v1beta1.MultiSignature';
  value: Uint8Array;
}
/**
 * MultiSignature wraps the signatures from a multisig.LegacyAminoPubKey.
 * See cosmos.tx.v1betata1.ModeInfo.Multi for how to specify which signers
 * signed and with which modes.
 */
export interface MultiSignatureSDKType {
  signatures: Uint8Array[];
}
/**
 * CompactBitArray is an implementation of a space efficient bit array.
 * This is used to ensure that the encoded data takes up a minimal amount of
 * space after proto encoding.
 * This is not thread safe, and is not intended for concurrent usage.
 */
export interface CompactBitArray {
  extraBitsStored: number;
  elems: Uint8Array;
}
export interface CompactBitArrayProtoMsg {
  typeUrl: '/cosmos.crypto.multisig.v1beta1.CompactBitArray';
  value: Uint8Array;
}
/**
 * CompactBitArray is an implementation of a space efficient bit array.
 * This is used to ensure that the encoded data takes up a minimal amount of
 * space after proto encoding.
 * This is not thread safe, and is not intended for concurrent usage.
 */
export interface CompactBitArraySDKType {
  extra_bits_stored: number;
  elems: Uint8Array;
}
function createBaseMultiSignature(): MultiSignature {
  return {
    signatures: [],
  };
}
export const MultiSignature = {
  typeUrl: '/cosmos.crypto.multisig.v1beta1.MultiSignature',
  encode(
    message: MultiSignature,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    for (const v of message.signatures) {
      writer.uint32(10).bytes(v!);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MultiSignature {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMultiSignature();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.signatures.push(reader.bytes());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): MultiSignature {
    return {
      signatures: Array.isArray(object?.signatures)
        ? object.signatures.map((e: any) => bytesFromBase64(e))
        : [],
    };
  },
  toJSON(message: MultiSignature): JsonSafe<MultiSignature> {
    const obj: any = {};
    if (message.signatures) {
      obj.signatures = message.signatures.map(e =>
        base64FromBytes(e !== undefined ? e : new Uint8Array()),
      );
    } else {
      obj.signatures = [];
    }
    return obj;
  },
  fromPartial(object: Partial<MultiSignature>): MultiSignature {
    const message = createBaseMultiSignature();
    message.signatures = object.signatures?.map(e => e) || [];
    return message;
  },
  fromProtoMsg(message: MultiSignatureProtoMsg): MultiSignature {
    return MultiSignature.decode(message.value);
  },
  toProto(message: MultiSignature): Uint8Array {
    return MultiSignature.encode(message).finish();
  },
  toProtoMsg(message: MultiSignature): MultiSignatureProtoMsg {
    return {
      typeUrl: '/cosmos.crypto.multisig.v1beta1.MultiSignature',
      value: MultiSignature.encode(message).finish(),
    };
  },
};
function createBaseCompactBitArray(): CompactBitArray {
  return {
    extraBitsStored: 0,
    elems: new Uint8Array(),
  };
}
export const CompactBitArray = {
  typeUrl: '/cosmos.crypto.multisig.v1beta1.CompactBitArray',
  encode(
    message: CompactBitArray,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.extraBitsStored !== 0) {
      writer.uint32(8).uint32(message.extraBitsStored);
    }
    if (message.elems.length !== 0) {
      writer.uint32(18).bytes(message.elems);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): CompactBitArray {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCompactBitArray();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.extraBitsStored = reader.uint32();
          break;
        case 2:
          message.elems = reader.bytes();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): CompactBitArray {
    return {
      extraBitsStored: isSet(object.extraBitsStored)
        ? Number(object.extraBitsStored)
        : 0,
      elems: isSet(object.elems)
        ? bytesFromBase64(object.elems)
        : new Uint8Array(),
    };
  },
  toJSON(message: CompactBitArray): JsonSafe<CompactBitArray> {
    const obj: any = {};
    message.extraBitsStored !== undefined &&
      (obj.extraBitsStored = Math.round(message.extraBitsStored));
    message.elems !== undefined &&
      (obj.elems = base64FromBytes(
        message.elems !== undefined ? message.elems : new Uint8Array(),
      ));
    return obj;
  },
  fromPartial(object: Partial<CompactBitArray>): CompactBitArray {
    const message = createBaseCompactBitArray();
    message.extraBitsStored = object.extraBitsStored ?? 0;
    message.elems = object.elems ?? new Uint8Array();
    return message;
  },
  fromProtoMsg(message: CompactBitArrayProtoMsg): CompactBitArray {
    return CompactBitArray.decode(message.value);
  },
  toProto(message: CompactBitArray): Uint8Array {
    return CompactBitArray.encode(message).finish();
  },
  toProtoMsg(message: CompactBitArray): CompactBitArrayProtoMsg {
    return {
      typeUrl: '/cosmos.crypto.multisig.v1beta1.CompactBitArray',
      value: CompactBitArray.encode(message).finish(),
    };
  },
};
