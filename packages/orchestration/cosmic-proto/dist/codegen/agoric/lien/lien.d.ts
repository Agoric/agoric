import { Coin, type CoinSDKType } from '../../cosmos/base/v1beta1/coin.js';
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { type JsonSafe } from '../../json-safe.js';
/** Lien contains the lien state of a particular account. */
export interface Lien {
    /** coins holds the amount liened */
    coins: Coin[];
    /**
     * delegated tracks the net amount delegated for non-vesting accounts,
     * or zero coins for vesting accounts.
     * (Vesting accounts have their own fields to track delegation.)
     */
    delegated: Coin[];
}
export interface LienProtoMsg {
    typeUrl: '/agoric.lien.Lien';
    value: Uint8Array;
}
/** Lien contains the lien state of a particular account. */
export interface LienSDKType {
    coins: CoinSDKType[];
    delegated: CoinSDKType[];
}
export declare const Lien: {
    typeUrl: string;
    encode(message: Lien, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): Lien;
    fromJSON(object: any): Lien;
    toJSON(message: Lien): JsonSafe<Lien>;
    fromPartial(object: Partial<Lien>): Lien;
    fromProtoMsg(message: LienProtoMsg): Lien;
    toProto(message: Lien): Uint8Array;
    toProtoMsg(message: Lien): LienProtoMsg;
};
