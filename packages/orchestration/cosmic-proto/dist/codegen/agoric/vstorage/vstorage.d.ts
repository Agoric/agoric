import { BinaryReader, BinaryWriter } from '../../binary.js';
import { type JsonSafe } from '../../json-safe.js';
/** Data is the vstorage node data. */
export interface Data {
    value: string;
}
export interface DataProtoMsg {
    typeUrl: '/agoric.vstorage.Data';
    value: Uint8Array;
}
/** Data is the vstorage node data. */
export interface DataSDKType {
    value: string;
}
/**
 * Children are the immediate names (just one level deep) of subnodes leading to
 * more data from a given vstorage node.
 */
export interface Children {
    children: string[];
}
export interface ChildrenProtoMsg {
    typeUrl: '/agoric.vstorage.Children';
    value: Uint8Array;
}
/**
 * Children are the immediate names (just one level deep) of subnodes leading to
 * more data from a given vstorage node.
 */
export interface ChildrenSDKType {
    children: string[];
}
export declare const Data: {
    typeUrl: string;
    encode(message: Data, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): Data;
    fromJSON(object: any): Data;
    toJSON(message: Data): JsonSafe<Data>;
    fromPartial(object: Partial<Data>): Data;
    fromProtoMsg(message: DataProtoMsg): Data;
    toProto(message: Data): Uint8Array;
    toProtoMsg(message: Data): DataProtoMsg;
};
export declare const Children: {
    typeUrl: string;
    encode(message: Children, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): Children;
    fromJSON(object: any): Children;
    toJSON(message: Children): JsonSafe<Children>;
    fromPartial(object: Partial<Children>): Children;
    fromProtoMsg(message: ChildrenProtoMsg): Children;
    toProto(message: Children): Uint8Array;
    toProtoMsg(message: Children): ChildrenProtoMsg;
};
