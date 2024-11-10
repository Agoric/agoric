//@ts-nocheck
import {
  CommitmentProof,
  type CommitmentProofSDKType,
} from '../../../../proofs.js';
import { BinaryReader, BinaryWriter } from '../../../../binary.js';
import {
  isSet,
  bytesFromBase64,
  base64FromBytes,
} from '../../../../helpers.js';
import { type JsonSafe } from '../../../../json-safe.js';
/**
 * MerkleRoot defines a merkle root hash.
 * In the Cosmos SDK, the AppHash of a block header becomes the root.
 */
export interface MerkleRoot {
  hash: Uint8Array;
}
export interface MerkleRootProtoMsg {
  typeUrl: '/ibc.core.commitment.v1.MerkleRoot';
  value: Uint8Array;
}
/**
 * MerkleRoot defines a merkle root hash.
 * In the Cosmos SDK, the AppHash of a block header becomes the root.
 */
export interface MerkleRootSDKType {
  hash: Uint8Array;
}
/**
 * MerklePrefix is merkle path prefixed to the key.
 * The constructed key from the Path and the key will be append(Path.KeyPath,
 * append(Path.KeyPrefix, key...))
 */
export interface MerklePrefix {
  keyPrefix: Uint8Array;
}
export interface MerklePrefixProtoMsg {
  typeUrl: '/ibc.core.commitment.v1.MerklePrefix';
  value: Uint8Array;
}
/**
 * MerklePrefix is merkle path prefixed to the key.
 * The constructed key from the Path and the key will be append(Path.KeyPath,
 * append(Path.KeyPrefix, key...))
 */
export interface MerklePrefixSDKType {
  key_prefix: Uint8Array;
}
/**
 * MerklePath is the path used to verify commitment proofs, which can be an
 * arbitrary structured object (defined by a commitment type).
 * MerklePath is represented from root-to-leaf
 */
export interface MerklePath {
  keyPath: string[];
}
export interface MerklePathProtoMsg {
  typeUrl: '/ibc.core.commitment.v1.MerklePath';
  value: Uint8Array;
}
/**
 * MerklePath is the path used to verify commitment proofs, which can be an
 * arbitrary structured object (defined by a commitment type).
 * MerklePath is represented from root-to-leaf
 */
export interface MerklePathSDKType {
  key_path: string[];
}
/**
 * MerkleProof is a wrapper type over a chain of CommitmentProofs.
 * It demonstrates membership or non-membership for an element or set of
 * elements, verifiable in conjunction with a known commitment root. Proofs
 * should be succinct.
 * MerkleProofs are ordered from leaf-to-root
 */
export interface MerkleProof {
  proofs: CommitmentProof[];
}
export interface MerkleProofProtoMsg {
  typeUrl: '/ibc.core.commitment.v1.MerkleProof';
  value: Uint8Array;
}
/**
 * MerkleProof is a wrapper type over a chain of CommitmentProofs.
 * It demonstrates membership or non-membership for an element or set of
 * elements, verifiable in conjunction with a known commitment root. Proofs
 * should be succinct.
 * MerkleProofs are ordered from leaf-to-root
 */
export interface MerkleProofSDKType {
  proofs: CommitmentProofSDKType[];
}
function createBaseMerkleRoot(): MerkleRoot {
  return {
    hash: new Uint8Array(),
  };
}
export const MerkleRoot = {
  typeUrl: '/ibc.core.commitment.v1.MerkleRoot',
  encode(
    message: MerkleRoot,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.hash.length !== 0) {
      writer.uint32(10).bytes(message.hash);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MerkleRoot {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMerkleRoot();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.hash = reader.bytes();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): MerkleRoot {
    return {
      hash: isSet(object.hash)
        ? bytesFromBase64(object.hash)
        : new Uint8Array(),
    };
  },
  toJSON(message: MerkleRoot): JsonSafe<MerkleRoot> {
    const obj: any = {};
    message.hash !== undefined &&
      (obj.hash = base64FromBytes(
        message.hash !== undefined ? message.hash : new Uint8Array(),
      ));
    return obj;
  },
  fromPartial(object: Partial<MerkleRoot>): MerkleRoot {
    const message = createBaseMerkleRoot();
    message.hash = object.hash ?? new Uint8Array();
    return message;
  },
  fromProtoMsg(message: MerkleRootProtoMsg): MerkleRoot {
    return MerkleRoot.decode(message.value);
  },
  toProto(message: MerkleRoot): Uint8Array {
    return MerkleRoot.encode(message).finish();
  },
  toProtoMsg(message: MerkleRoot): MerkleRootProtoMsg {
    return {
      typeUrl: '/ibc.core.commitment.v1.MerkleRoot',
      value: MerkleRoot.encode(message).finish(),
    };
  },
};
function createBaseMerklePrefix(): MerklePrefix {
  return {
    keyPrefix: new Uint8Array(),
  };
}
export const MerklePrefix = {
  typeUrl: '/ibc.core.commitment.v1.MerklePrefix',
  encode(
    message: MerklePrefix,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.keyPrefix.length !== 0) {
      writer.uint32(10).bytes(message.keyPrefix);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MerklePrefix {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMerklePrefix();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.keyPrefix = reader.bytes();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): MerklePrefix {
    return {
      keyPrefix: isSet(object.keyPrefix)
        ? bytesFromBase64(object.keyPrefix)
        : new Uint8Array(),
    };
  },
  toJSON(message: MerklePrefix): JsonSafe<MerklePrefix> {
    const obj: any = {};
    message.keyPrefix !== undefined &&
      (obj.keyPrefix = base64FromBytes(
        message.keyPrefix !== undefined ? message.keyPrefix : new Uint8Array(),
      ));
    return obj;
  },
  fromPartial(object: Partial<MerklePrefix>): MerklePrefix {
    const message = createBaseMerklePrefix();
    message.keyPrefix = object.keyPrefix ?? new Uint8Array();
    return message;
  },
  fromProtoMsg(message: MerklePrefixProtoMsg): MerklePrefix {
    return MerklePrefix.decode(message.value);
  },
  toProto(message: MerklePrefix): Uint8Array {
    return MerklePrefix.encode(message).finish();
  },
  toProtoMsg(message: MerklePrefix): MerklePrefixProtoMsg {
    return {
      typeUrl: '/ibc.core.commitment.v1.MerklePrefix',
      value: MerklePrefix.encode(message).finish(),
    };
  },
};
function createBaseMerklePath(): MerklePath {
  return {
    keyPath: [],
  };
}
export const MerklePath = {
  typeUrl: '/ibc.core.commitment.v1.MerklePath',
  encode(
    message: MerklePath,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    for (const v of message.keyPath) {
      writer.uint32(10).string(v!);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MerklePath {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMerklePath();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.keyPath.push(reader.string());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): MerklePath {
    return {
      keyPath: Array.isArray(object?.keyPath)
        ? object.keyPath.map((e: any) => String(e))
        : [],
    };
  },
  toJSON(message: MerklePath): JsonSafe<MerklePath> {
    const obj: any = {};
    if (message.keyPath) {
      obj.keyPath = message.keyPath.map(e => e);
    } else {
      obj.keyPath = [];
    }
    return obj;
  },
  fromPartial(object: Partial<MerklePath>): MerklePath {
    const message = createBaseMerklePath();
    message.keyPath = object.keyPath?.map(e => e) || [];
    return message;
  },
  fromProtoMsg(message: MerklePathProtoMsg): MerklePath {
    return MerklePath.decode(message.value);
  },
  toProto(message: MerklePath): Uint8Array {
    return MerklePath.encode(message).finish();
  },
  toProtoMsg(message: MerklePath): MerklePathProtoMsg {
    return {
      typeUrl: '/ibc.core.commitment.v1.MerklePath',
      value: MerklePath.encode(message).finish(),
    };
  },
};
function createBaseMerkleProof(): MerkleProof {
  return {
    proofs: [],
  };
}
export const MerkleProof = {
  typeUrl: '/ibc.core.commitment.v1.MerkleProof',
  encode(
    message: MerkleProof,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    for (const v of message.proofs) {
      CommitmentProof.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MerkleProof {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMerkleProof();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.proofs.push(CommitmentProof.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): MerkleProof {
    return {
      proofs: Array.isArray(object?.proofs)
        ? object.proofs.map((e: any) => CommitmentProof.fromJSON(e))
        : [],
    };
  },
  toJSON(message: MerkleProof): JsonSafe<MerkleProof> {
    const obj: any = {};
    if (message.proofs) {
      obj.proofs = message.proofs.map(e =>
        e ? CommitmentProof.toJSON(e) : undefined,
      );
    } else {
      obj.proofs = [];
    }
    return obj;
  },
  fromPartial(object: Partial<MerkleProof>): MerkleProof {
    const message = createBaseMerkleProof();
    message.proofs =
      object.proofs?.map(e => CommitmentProof.fromPartial(e)) || [];
    return message;
  },
  fromProtoMsg(message: MerkleProofProtoMsg): MerkleProof {
    return MerkleProof.decode(message.value);
  },
  toProto(message: MerkleProof): Uint8Array {
    return MerkleProof.encode(message).finish();
  },
  toProtoMsg(message: MerkleProof): MerkleProofProtoMsg {
    return {
      typeUrl: '/ibc.core.commitment.v1.MerkleProof',
      value: MerkleProof.encode(message).finish(),
    };
  },
};
