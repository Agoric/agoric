import { BinaryReader, BinaryWriter } from '../../../../binary.js';
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
export declare const MultiSignature: {
    typeUrl: string;
    encode(message: MultiSignature, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MultiSignature;
    fromJSON(object: any): MultiSignature;
    toJSON(message: MultiSignature): JsonSafe<MultiSignature>;
    fromPartial(object: Partial<MultiSignature>): MultiSignature;
    fromProtoMsg(message: MultiSignatureProtoMsg): MultiSignature;
    toProto(message: MultiSignature): Uint8Array;
    toProtoMsg(message: MultiSignature): MultiSignatureProtoMsg;
};
export declare const CompactBitArray: {
    typeUrl: string;
    encode(message: CompactBitArray, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): CompactBitArray;
    fromJSON(object: any): CompactBitArray;
    toJSON(message: CompactBitArray): JsonSafe<CompactBitArray>;
    fromPartial(object: Partial<CompactBitArray>): CompactBitArray;
    fromProtoMsg(message: CompactBitArrayProtoMsg): CompactBitArray;
    toProto(message: CompactBitArray): Uint8Array;
    toProtoMsg(message: CompactBitArray): CompactBitArrayProtoMsg;
};
