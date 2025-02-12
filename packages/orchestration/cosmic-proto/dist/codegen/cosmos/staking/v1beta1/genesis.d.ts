import { Params, type ParamsSDKType, Validator, type ValidatorSDKType, Delegation, type DelegationSDKType, UnbondingDelegation, type UnbondingDelegationSDKType, Redelegation, type RedelegationSDKType } from './staking.js';
import { BinaryReader, BinaryWriter } from '../../../binary.js';
import { type JsonSafe } from '../../../json-safe.js';
/** GenesisState defines the staking module's genesis state. */
export interface GenesisState {
    /** params defines all the paramaters of related to deposit. */
    params: Params;
    /**
     * last_total_power tracks the total amounts of bonded tokens recorded during
     * the previous end block.
     */
    lastTotalPower: Uint8Array;
    /**
     * last_validator_powers is a special index that provides a historical list
     * of the last-block's bonded validators.
     */
    lastValidatorPowers: LastValidatorPower[];
    /** delegations defines the validator set at genesis. */
    validators: Validator[];
    /** delegations defines the delegations active at genesis. */
    delegations: Delegation[];
    /** unbonding_delegations defines the unbonding delegations active at genesis. */
    unbondingDelegations: UnbondingDelegation[];
    /** redelegations defines the redelegations active at genesis. */
    redelegations: Redelegation[];
    exported: boolean;
}
export interface GenesisStateProtoMsg {
    typeUrl: '/cosmos.staking.v1beta1.GenesisState';
    value: Uint8Array;
}
/** GenesisState defines the staking module's genesis state. */
export interface GenesisStateSDKType {
    params: ParamsSDKType;
    last_total_power: Uint8Array;
    last_validator_powers: LastValidatorPowerSDKType[];
    validators: ValidatorSDKType[];
    delegations: DelegationSDKType[];
    unbonding_delegations: UnbondingDelegationSDKType[];
    redelegations: RedelegationSDKType[];
    exported: boolean;
}
/** LastValidatorPower required for validator set update logic. */
export interface LastValidatorPower {
    /** address is the address of the validator. */
    address: string;
    /** power defines the power of the validator. */
    power: bigint;
}
export interface LastValidatorPowerProtoMsg {
    typeUrl: '/cosmos.staking.v1beta1.LastValidatorPower';
    value: Uint8Array;
}
/** LastValidatorPower required for validator set update logic. */
export interface LastValidatorPowerSDKType {
    address: string;
    power: bigint;
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
export declare const LastValidatorPower: {
    typeUrl: string;
    encode(message: LastValidatorPower, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): LastValidatorPower;
    fromJSON(object: any): LastValidatorPower;
    toJSON(message: LastValidatorPower): JsonSafe<LastValidatorPower>;
    fromPartial(object: Partial<LastValidatorPower>): LastValidatorPower;
    fromProtoMsg(message: LastValidatorPowerProtoMsg): LastValidatorPower;
    toProto(message: LastValidatorPower): Uint8Array;
    toProtoMsg(message: LastValidatorPower): LastValidatorPowerProtoMsg;
};
