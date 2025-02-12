import { Params, type ParamsSDKType, Airdrop, type AirdropSDKType, UserAllocation, type UserAllocationSDKType } from './airdrop.js';
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { type JsonSafe } from '../../json-safe.js';
/** GenesisState defines the airdrop module's genesis state. */
export interface GenesisState {
    /** Module parameters */
    params: Params;
    /** All airdrop config records */
    airdrops: Airdrop[];
    /** All allocation records across all airdrops */
    userAllocations: UserAllocation[];
}
export interface GenesisStateProtoMsg {
    typeUrl: '/stride.airdrop.GenesisState';
    value: Uint8Array;
}
/** GenesisState defines the airdrop module's genesis state. */
export interface GenesisStateSDKType {
    params: ParamsSDKType;
    airdrops: AirdropSDKType[];
    user_allocations: UserAllocationSDKType[];
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
