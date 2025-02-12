import { BinaryReader, BinaryWriter } from '../../../binary.js';
import { type JsonSafe } from '../../../json-safe.js';
export interface BitArray {
    bits: bigint;
    elems: bigint[];
}
export interface BitArrayProtoMsg {
    typeUrl: '/tendermint.libs.bits.BitArray';
    value: Uint8Array;
}
export interface BitArraySDKType {
    bits: bigint;
    elems: bigint[];
}
export declare const BitArray: {
    typeUrl: string;
    encode(message: BitArray, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): BitArray;
    fromJSON(object: any): BitArray;
    toJSON(message: BitArray): JsonSafe<BitArray>;
    fromPartial(object: Partial<BitArray>): BitArray;
    fromProtoMsg(message: BitArrayProtoMsg): BitArray;
    toProto(message: BitArray): Uint8Array;
    toProtoMsg(message: BitArray): BitArrayProtoMsg;
};
