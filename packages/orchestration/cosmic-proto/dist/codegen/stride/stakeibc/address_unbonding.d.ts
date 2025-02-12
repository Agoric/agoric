import { BinaryReader, BinaryWriter } from '../../binary.js';
import { type JsonSafe } from '../../json-safe.js';
export interface AddressUnbonding {
    address: string;
    receiver: string;
    unbondingEstimatedTime: string;
    amount: string;
    denom: string;
    claimIsPending: boolean;
    epochNumber: bigint;
}
export interface AddressUnbondingProtoMsg {
    typeUrl: '/stride.stakeibc.AddressUnbonding';
    value: Uint8Array;
}
export interface AddressUnbondingSDKType {
    address: string;
    receiver: string;
    unbonding_estimated_time: string;
    amount: string;
    denom: string;
    claim_is_pending: boolean;
    epoch_number: bigint;
}
export declare const AddressUnbonding: {
    typeUrl: string;
    encode(message: AddressUnbonding, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): AddressUnbonding;
    fromJSON(object: any): AddressUnbonding;
    toJSON(message: AddressUnbonding): JsonSafe<AddressUnbonding>;
    fromPartial(object: Partial<AddressUnbonding>): AddressUnbonding;
    fromProtoMsg(message: AddressUnbondingProtoMsg): AddressUnbonding;
    toProto(message: AddressUnbonding): Uint8Array;
    toProtoMsg(message: AddressUnbonding): AddressUnbondingProtoMsg;
};
