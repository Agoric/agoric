import { BaseAccount, type BaseAccountSDKType } from '../../../../cosmos/auth/v1beta1/auth.js';
import { BinaryReader, BinaryWriter } from '../../../../binary.js';
import { type JsonSafe } from '../../../../json-safe.js';
/** An InterchainAccount is defined as a BaseAccount & the address of the account owner on the controller chain */
export interface InterchainAccount {
    $typeUrl?: '/ibc.applications.interchain_accounts.v1.InterchainAccount';
    baseAccount?: BaseAccount;
    accountOwner: string;
}
export interface InterchainAccountProtoMsg {
    typeUrl: '/ibc.applications.interchain_accounts.v1.InterchainAccount';
    value: Uint8Array;
}
/** An InterchainAccount is defined as a BaseAccount & the address of the account owner on the controller chain */
export interface InterchainAccountSDKType {
    $typeUrl?: '/ibc.applications.interchain_accounts.v1.InterchainAccount';
    base_account?: BaseAccountSDKType;
    account_owner: string;
}
export declare const InterchainAccount: {
    typeUrl: string;
    encode(message: InterchainAccount, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): InterchainAccount;
    fromJSON(object: any): InterchainAccount;
    toJSON(message: InterchainAccount): JsonSafe<InterchainAccount>;
    fromPartial(object: Partial<InterchainAccount>): InterchainAccount;
    fromProtoMsg(message: InterchainAccountProtoMsg): InterchainAccount;
    toProto(message: InterchainAccount): Uint8Array;
    toProtoMsg(message: InterchainAccount): InterchainAccountProtoMsg;
};
