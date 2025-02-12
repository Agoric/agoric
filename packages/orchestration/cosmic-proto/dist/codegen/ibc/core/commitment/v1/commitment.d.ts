import { CommitmentProof, type CommitmentProofSDKType } from '../../../../proofs.js';
import { BinaryReader, BinaryWriter } from '../../../../binary.js';
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
export declare const MerkleRoot: {
    typeUrl: string;
    encode(message: MerkleRoot, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MerkleRoot;
    fromJSON(object: any): MerkleRoot;
    toJSON(message: MerkleRoot): JsonSafe<MerkleRoot>;
    fromPartial(object: Partial<MerkleRoot>): MerkleRoot;
    fromProtoMsg(message: MerkleRootProtoMsg): MerkleRoot;
    toProto(message: MerkleRoot): Uint8Array;
    toProtoMsg(message: MerkleRoot): MerkleRootProtoMsg;
};
export declare const MerklePrefix: {
    typeUrl: string;
    encode(message: MerklePrefix, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MerklePrefix;
    fromJSON(object: any): MerklePrefix;
    toJSON(message: MerklePrefix): JsonSafe<MerklePrefix>;
    fromPartial(object: Partial<MerklePrefix>): MerklePrefix;
    fromProtoMsg(message: MerklePrefixProtoMsg): MerklePrefix;
    toProto(message: MerklePrefix): Uint8Array;
    toProtoMsg(message: MerklePrefix): MerklePrefixProtoMsg;
};
export declare const MerklePath: {
    typeUrl: string;
    encode(message: MerklePath, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MerklePath;
    fromJSON(object: any): MerklePath;
    toJSON(message: MerklePath): JsonSafe<MerklePath>;
    fromPartial(object: Partial<MerklePath>): MerklePath;
    fromProtoMsg(message: MerklePathProtoMsg): MerklePath;
    toProto(message: MerklePath): Uint8Array;
    toProtoMsg(message: MerklePath): MerklePathProtoMsg;
};
export declare const MerkleProof: {
    typeUrl: string;
    encode(message: MerkleProof, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MerkleProof;
    fromJSON(object: any): MerkleProof;
    toJSON(message: MerkleProof): JsonSafe<MerkleProof>;
    fromPartial(object: Partial<MerkleProof>): MerkleProof;
    fromProtoMsg(message: MerkleProofProtoMsg): MerkleProof;
    toProto(message: MerkleProof): Uint8Array;
    toProtoMsg(message: MerkleProof): MerkleProofProtoMsg;
};
