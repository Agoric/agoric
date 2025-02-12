import { Lien, type LienSDKType } from './lien.js';
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { type JsonSafe } from '../../json-safe.js';
/** The initial or exported state. */
export interface GenesisState {
    liens: AccountLien[];
}
export interface GenesisStateProtoMsg {
    typeUrl: '/agoric.lien.GenesisState';
    value: Uint8Array;
}
/** The initial or exported state. */
export interface GenesisStateSDKType {
    liens: AccountLienSDKType[];
}
/** The lien on a particular account */
export interface AccountLien {
    /** Account address, bech32-encoded. */
    address: string;
    /** The liened amount. Should be nonzero. */
    lien?: Lien;
}
export interface AccountLienProtoMsg {
    typeUrl: '/agoric.lien.AccountLien';
    value: Uint8Array;
}
/** The lien on a particular account */
export interface AccountLienSDKType {
    address: string;
    lien?: LienSDKType;
}
export declare const GenesisState: {
    typeUrl: string;
    encode(message: GenesisState, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): GenesisState;
    fromJSON(object: any): GenesisState;
    toJSON(message: GenesisState): JsonSafe<GenesisState>;
    fromPartial(object: Partial<GenesisState>): GenesisState;
    fromProtoMsg(message: GenesisStateProtoMsg): GenesisState;
    toProto(message: GenesisState): Uint8Array;
    toProtoMsg(message: GenesisState): GenesisStateProtoMsg;
};
export declare const AccountLien: {
    typeUrl: string;
    encode(message: AccountLien, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): AccountLien;
    fromJSON(object: any): AccountLien;
    toJSON(message: AccountLien): JsonSafe<AccountLien>;
    fromPartial(object: Partial<AccountLien>): AccountLien;
    fromProtoMsg(message: AccountLienProtoMsg): AccountLien;
    toProto(message: AccountLien): Uint8Array;
    toProtoMsg(message: AccountLien): AccountLienProtoMsg;
};
