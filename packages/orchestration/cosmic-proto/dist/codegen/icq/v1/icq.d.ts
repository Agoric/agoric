import { BinaryReader, BinaryWriter } from '../../binary.js';
import { type JsonSafe } from '../../json-safe.js';
/** Params defines the set of on-chain interchain query parameters. */
export interface Params {
    /** host_enabled enables or disables the host submodule. */
    hostEnabled: boolean;
    /** allow_queries defines a list of query paths allowed to be queried on a host chain. */
    allowQueries: string[];
}
export interface ParamsProtoMsg {
    typeUrl: '/icq.v1.Params';
    value: Uint8Array;
}
/** Params defines the set of on-chain interchain query parameters. */
export interface ParamsSDKType {
    host_enabled: boolean;
    allow_queries: string[];
}
export declare const Params: {
    typeUrl: string;
    encode(message: Params, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): Params;
    fromJSON(object: any): Params;
    toJSON(message: Params): JsonSafe<Params>;
    fromPartial(object: Partial<Params>): Params;
    fromProtoMsg(message: ParamsProtoMsg): Params;
    toProto(message: Params): Uint8Array;
    toProtoMsg(message: Params): ParamsProtoMsg;
};
