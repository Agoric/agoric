import { BinaryReader, BinaryWriter } from '../../../binary.js';
import { type JsonSafe } from '../../../json-safe.js';
/**
 * Coin defines a token with a denomination and an amount.
 *
 * NOTE: The amount field is an Int which implements the custom method
 * signatures required by gogoproto.
 */
export interface Coin {
    denom: string;
    amount: string;
}
export interface CoinProtoMsg {
    typeUrl: '/cosmos.base.v1beta1.Coin';
    value: Uint8Array;
}
/**
 * Coin defines a token with a denomination and an amount.
 *
 * NOTE: The amount field is an Int which implements the custom method
 * signatures required by gogoproto.
 */
export interface CoinSDKType {
    denom: string;
    amount: string;
}
/**
 * DecCoin defines a token with a denomination and a decimal amount.
 *
 * NOTE: The amount field is an Dec which implements the custom method
 * signatures required by gogoproto.
 */
export interface DecCoin {
    denom: string;
    amount: string;
}
export interface DecCoinProtoMsg {
    typeUrl: '/cosmos.base.v1beta1.DecCoin';
    value: Uint8Array;
}
/**
 * DecCoin defines a token with a denomination and a decimal amount.
 *
 * NOTE: The amount field is an Dec which implements the custom method
 * signatures required by gogoproto.
 */
export interface DecCoinSDKType {
    denom: string;
    amount: string;
}
/** IntProto defines a Protobuf wrapper around an Int object. */
export interface IntProto {
    int: string;
}
export interface IntProtoProtoMsg {
    typeUrl: '/cosmos.base.v1beta1.IntProto';
    value: Uint8Array;
}
/** IntProto defines a Protobuf wrapper around an Int object. */
export interface IntProtoSDKType {
    int: string;
}
/** DecProto defines a Protobuf wrapper around a Dec object. */
export interface DecProto {
    dec: string;
}
export interface DecProtoProtoMsg {
    typeUrl: '/cosmos.base.v1beta1.DecProto';
    value: Uint8Array;
}
/** DecProto defines a Protobuf wrapper around a Dec object. */
export interface DecProtoSDKType {
    dec: string;
}
export declare const Coin: {
    typeUrl: string;
    encode(message: Coin, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): Coin;
    fromJSON(object: any): Coin;
    toJSON(message: Coin): JsonSafe<Coin>;
    fromPartial(object: Partial<Coin>): Coin;
    fromProtoMsg(message: CoinProtoMsg): Coin;
    toProto(message: Coin): Uint8Array;
    toProtoMsg(message: Coin): CoinProtoMsg;
};
export declare const DecCoin: {
    typeUrl: string;
    encode(message: DecCoin, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): DecCoin;
    fromJSON(object: any): DecCoin;
    toJSON(message: DecCoin): JsonSafe<DecCoin>;
    fromPartial(object: Partial<DecCoin>): DecCoin;
    fromProtoMsg(message: DecCoinProtoMsg): DecCoin;
    toProto(message: DecCoin): Uint8Array;
    toProtoMsg(message: DecCoin): DecCoinProtoMsg;
};
export declare const IntProto: {
    typeUrl: string;
    encode(message: IntProto, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): IntProto;
    fromJSON(object: any): IntProto;
    toJSON(message: IntProto): JsonSafe<IntProto>;
    fromPartial(object: Partial<IntProto>): IntProto;
    fromProtoMsg(message: IntProtoProtoMsg): IntProto;
    toProto(message: IntProto): Uint8Array;
    toProtoMsg(message: IntProto): IntProtoProtoMsg;
};
export declare const DecProto: {
    typeUrl: string;
    encode(message: DecProto, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): DecProto;
    fromJSON(object: any): DecProto;
    toJSON(message: DecProto): JsonSafe<DecProto>;
    fromPartial(object: Partial<DecProto>): DecProto;
    fromProtoMsg(message: DecProtoProtoMsg): DecProto;
    toProto(message: DecProto): Uint8Array;
    toProtoMsg(message: DecProto): DecProtoProtoMsg;
};
