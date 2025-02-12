import { Header, type HeaderSDKType } from '../../../tendermint/types/types.js';
import { Timestamp, type TimestampSDKType } from '../../../google/protobuf/timestamp.js';
import { Any, type AnySDKType } from '../../../google/protobuf/any.js';
import { Duration, type DurationSDKType } from '../../../google/protobuf/duration.js';
import { Coin, type CoinSDKType } from '../../base/v1beta1/coin.js';
import { BinaryReader, BinaryWriter } from '../../../binary.js';
import { type JsonSafe } from '../../../json-safe.js';
/** BondStatus is the status of a validator. */
export declare enum BondStatus {
    /** BOND_STATUS_UNSPECIFIED - UNSPECIFIED defines an invalid validator status. */
    BOND_STATUS_UNSPECIFIED = 0,
    /** BOND_STATUS_UNBONDED - UNBONDED defines a validator that is not bonded. */
    BOND_STATUS_UNBONDED = 1,
    /** BOND_STATUS_UNBONDING - UNBONDING defines a validator that is unbonding. */
    BOND_STATUS_UNBONDING = 2,
    /** BOND_STATUS_BONDED - BONDED defines a validator that is bonded. */
    BOND_STATUS_BONDED = 3,
    UNRECOGNIZED = -1
}
export declare const BondStatusSDKType: typeof BondStatus;
export declare function bondStatusFromJSON(object: any): BondStatus;
export declare function bondStatusToJSON(object: BondStatus): string;
/**
 * HistoricalInfo contains header and validator information for a given block.
 * It is stored as part of staking module's state, which persists the `n` most
 * recent HistoricalInfo
 * (`n` is set by the staking module's `historical_entries` parameter).
 */
export interface HistoricalInfo {
    header: Header;
    valset: Validator[];
}
export interface HistoricalInfoProtoMsg {
    typeUrl: '/cosmos.staking.v1beta1.HistoricalInfo';
    value: Uint8Array;
}
/**
 * HistoricalInfo contains header and validator information for a given block.
 * It is stored as part of staking module's state, which persists the `n` most
 * recent HistoricalInfo
 * (`n` is set by the staking module's `historical_entries` parameter).
 */
export interface HistoricalInfoSDKType {
    header: HeaderSDKType;
    valset: ValidatorSDKType[];
}
/**
 * CommissionRates defines the initial commission rates to be used for creating
 * a validator.
 */
export interface CommissionRates {
    /** rate is the commission rate charged to delegators, as a fraction. */
    rate: string;
    /** max_rate defines the maximum commission rate which validator can ever charge, as a fraction. */
    maxRate: string;
    /** max_change_rate defines the maximum daily increase of the validator commission, as a fraction. */
    maxChangeRate: string;
}
export interface CommissionRatesProtoMsg {
    typeUrl: '/cosmos.staking.v1beta1.CommissionRates';
    value: Uint8Array;
}
/**
 * CommissionRates defines the initial commission rates to be used for creating
 * a validator.
 */
export interface CommissionRatesSDKType {
    rate: string;
    max_rate: string;
    max_change_rate: string;
}
/** Commission defines commission parameters for a given validator. */
export interface Commission {
    /** commission_rates defines the initial commission rates to be used for creating a validator. */
    commissionRates: CommissionRates;
    /** update_time is the last time the commission rate was changed. */
    updateTime: Timestamp;
}
export interface CommissionProtoMsg {
    typeUrl: '/cosmos.staking.v1beta1.Commission';
    value: Uint8Array;
}
/** Commission defines commission parameters for a given validator. */
export interface CommissionSDKType {
    commission_rates: CommissionRatesSDKType;
    update_time: TimestampSDKType;
}
/** Description defines a validator description. */
export interface Description {
    /** moniker defines a human-readable name for the validator. */
    moniker: string;
    /** identity defines an optional identity signature (ex. UPort or Keybase). */
    identity: string;
    /** website defines an optional website link. */
    website: string;
    /** security_contact defines an optional email for security contact. */
    securityContact: string;
    /** details define other optional details. */
    details: string;
}
export interface DescriptionProtoMsg {
    typeUrl: '/cosmos.staking.v1beta1.Description';
    value: Uint8Array;
}
/** Description defines a validator description. */
export interface DescriptionSDKType {
    moniker: string;
    identity: string;
    website: string;
    security_contact: string;
    details: string;
}
/**
 * Validator defines a validator, together with the total amount of the
 * Validator's bond shares and their exchange rate to coins. Slashing results in
 * a decrease in the exchange rate, allowing correct calculation of future
 * undelegations without iterating over delegators. When coins are delegated to
 * this validator, the validator is credited with a delegation whose number of
 * bond shares is based on the amount of coins delegated divided by the current
 * exchange rate. Voting power can be calculated as total bonded shares
 * multiplied by exchange rate.
 */
export interface Validator {
    /** operator_address defines the address of the validator's operator; bech encoded in JSON. */
    operatorAddress: string;
    /** consensus_pubkey is the consensus public key of the validator, as a Protobuf Any. */
    consensusPubkey?: Any | undefined;
    /** jailed defined whether the validator has been jailed from bonded status or not. */
    jailed: boolean;
    /** status is the validator status (bonded/unbonding/unbonded). */
    status: BondStatus;
    /** tokens define the delegated tokens (incl. self-delegation). */
    tokens: string;
    /** delegator_shares defines total shares issued to a validator's delegators. */
    delegatorShares: string;
    /** description defines the description terms for the validator. */
    description: Description;
    /** unbonding_height defines, if unbonding, the height at which this validator has begun unbonding. */
    unbondingHeight: bigint;
    /** unbonding_time defines, if unbonding, the min time for the validator to complete unbonding. */
    unbondingTime: Timestamp;
    /** commission defines the commission parameters. */
    commission: Commission;
    /**
     * min_self_delegation is the validator's self declared minimum self delegation.
     *
     * Since: cosmos-sdk 0.46
     */
    minSelfDelegation: string;
}
export interface ValidatorProtoMsg {
    typeUrl: '/cosmos.staking.v1beta1.Validator';
    value: Uint8Array;
}
/**
 * Validator defines a validator, together with the total amount of the
 * Validator's bond shares and their exchange rate to coins. Slashing results in
 * a decrease in the exchange rate, allowing correct calculation of future
 * undelegations without iterating over delegators. When coins are delegated to
 * this validator, the validator is credited with a delegation whose number of
 * bond shares is based on the amount of coins delegated divided by the current
 * exchange rate. Voting power can be calculated as total bonded shares
 * multiplied by exchange rate.
 */
export interface ValidatorSDKType {
    operator_address: string;
    consensus_pubkey?: AnySDKType | undefined;
    jailed: boolean;
    status: BondStatus;
    tokens: string;
    delegator_shares: string;
    description: DescriptionSDKType;
    unbonding_height: bigint;
    unbonding_time: TimestampSDKType;
    commission: CommissionSDKType;
    min_self_delegation: string;
}
/** ValAddresses defines a repeated set of validator addresses. */
export interface ValAddresses {
    addresses: string[];
}
export interface ValAddressesProtoMsg {
    typeUrl: '/cosmos.staking.v1beta1.ValAddresses';
    value: Uint8Array;
}
/** ValAddresses defines a repeated set of validator addresses. */
export interface ValAddressesSDKType {
    addresses: string[];
}
/**
 * DVPair is struct that just has a delegator-validator pair with no other data.
 * It is intended to be used as a marshalable pointer. For example, a DVPair can
 * be used to construct the key to getting an UnbondingDelegation from state.
 */
export interface DVPair {
    delegatorAddress: string;
    validatorAddress: string;
}
export interface DVPairProtoMsg {
    typeUrl: '/cosmos.staking.v1beta1.DVPair';
    value: Uint8Array;
}
/**
 * DVPair is struct that just has a delegator-validator pair with no other data.
 * It is intended to be used as a marshalable pointer. For example, a DVPair can
 * be used to construct the key to getting an UnbondingDelegation from state.
 */
export interface DVPairSDKType {
    delegator_address: string;
    validator_address: string;
}
/** DVPairs defines an array of DVPair objects. */
export interface DVPairs {
    pairs: DVPair[];
}
export interface DVPairsProtoMsg {
    typeUrl: '/cosmos.staking.v1beta1.DVPairs';
    value: Uint8Array;
}
/** DVPairs defines an array of DVPair objects. */
export interface DVPairsSDKType {
    pairs: DVPairSDKType[];
}
/**
 * DVVTriplet is struct that just has a delegator-validator-validator triplet
 * with no other data. It is intended to be used as a marshalable pointer. For
 * example, a DVVTriplet can be used to construct the key to getting a
 * Redelegation from state.
 */
export interface DVVTriplet {
    delegatorAddress: string;
    validatorSrcAddress: string;
    validatorDstAddress: string;
}
export interface DVVTripletProtoMsg {
    typeUrl: '/cosmos.staking.v1beta1.DVVTriplet';
    value: Uint8Array;
}
/**
 * DVVTriplet is struct that just has a delegator-validator-validator triplet
 * with no other data. It is intended to be used as a marshalable pointer. For
 * example, a DVVTriplet can be used to construct the key to getting a
 * Redelegation from state.
 */
export interface DVVTripletSDKType {
    delegator_address: string;
    validator_src_address: string;
    validator_dst_address: string;
}
/** DVVTriplets defines an array of DVVTriplet objects. */
export interface DVVTriplets {
    triplets: DVVTriplet[];
}
export interface DVVTripletsProtoMsg {
    typeUrl: '/cosmos.staking.v1beta1.DVVTriplets';
    value: Uint8Array;
}
/** DVVTriplets defines an array of DVVTriplet objects. */
export interface DVVTripletsSDKType {
    triplets: DVVTripletSDKType[];
}
/**
 * Delegation represents the bond with tokens held by an account. It is
 * owned by one delegator, and is associated with the voting power of one
 * validator.
 */
export interface Delegation {
    /** delegator_address is the bech32-encoded address of the delegator. */
    delegatorAddress: string;
    /** validator_address is the bech32-encoded address of the validator. */
    validatorAddress: string;
    /** shares define the delegation shares received. */
    shares: string;
}
export interface DelegationProtoMsg {
    typeUrl: '/cosmos.staking.v1beta1.Delegation';
    value: Uint8Array;
}
/**
 * Delegation represents the bond with tokens held by an account. It is
 * owned by one delegator, and is associated with the voting power of one
 * validator.
 */
export interface DelegationSDKType {
    delegator_address: string;
    validator_address: string;
    shares: string;
}
/**
 * UnbondingDelegation stores all of a single delegator's unbonding bonds
 * for a single validator in an time-ordered list.
 */
export interface UnbondingDelegation {
    /** delegator_address is the bech32-encoded address of the delegator. */
    delegatorAddress: string;
    /** validator_address is the bech32-encoded address of the validator. */
    validatorAddress: string;
    /** entries are the unbonding delegation entries. */
    entries: UnbondingDelegationEntry[];
}
export interface UnbondingDelegationProtoMsg {
    typeUrl: '/cosmos.staking.v1beta1.UnbondingDelegation';
    value: Uint8Array;
}
/**
 * UnbondingDelegation stores all of a single delegator's unbonding bonds
 * for a single validator in an time-ordered list.
 */
export interface UnbondingDelegationSDKType {
    delegator_address: string;
    validator_address: string;
    entries: UnbondingDelegationEntrySDKType[];
}
/** UnbondingDelegationEntry defines an unbonding object with relevant metadata. */
export interface UnbondingDelegationEntry {
    /** creation_height is the height which the unbonding took place. */
    creationHeight: bigint;
    /** completion_time is the unix time for unbonding completion. */
    completionTime: Timestamp;
    /** initial_balance defines the tokens initially scheduled to receive at completion. */
    initialBalance: string;
    /** balance defines the tokens to receive at completion. */
    balance: string;
}
export interface UnbondingDelegationEntryProtoMsg {
    typeUrl: '/cosmos.staking.v1beta1.UnbondingDelegationEntry';
    value: Uint8Array;
}
/** UnbondingDelegationEntry defines an unbonding object with relevant metadata. */
export interface UnbondingDelegationEntrySDKType {
    creation_height: bigint;
    completion_time: TimestampSDKType;
    initial_balance: string;
    balance: string;
}
/** RedelegationEntry defines a redelegation object with relevant metadata. */
export interface RedelegationEntry {
    /** creation_height  defines the height which the redelegation took place. */
    creationHeight: bigint;
    /** completion_time defines the unix time for redelegation completion. */
    completionTime: Timestamp;
    /** initial_balance defines the initial balance when redelegation started. */
    initialBalance: string;
    /** shares_dst is the amount of destination-validator shares created by redelegation. */
    sharesDst: string;
}
export interface RedelegationEntryProtoMsg {
    typeUrl: '/cosmos.staking.v1beta1.RedelegationEntry';
    value: Uint8Array;
}
/** RedelegationEntry defines a redelegation object with relevant metadata. */
export interface RedelegationEntrySDKType {
    creation_height: bigint;
    completion_time: TimestampSDKType;
    initial_balance: string;
    shares_dst: string;
}
/**
 * Redelegation contains the list of a particular delegator's redelegating bonds
 * from a particular source validator to a particular destination validator.
 */
export interface Redelegation {
    /** delegator_address is the bech32-encoded address of the delegator. */
    delegatorAddress: string;
    /** validator_src_address is the validator redelegation source operator address. */
    validatorSrcAddress: string;
    /** validator_dst_address is the validator redelegation destination operator address. */
    validatorDstAddress: string;
    /** entries are the redelegation entries. */
    entries: RedelegationEntry[];
}
export interface RedelegationProtoMsg {
    typeUrl: '/cosmos.staking.v1beta1.Redelegation';
    value: Uint8Array;
}
/**
 * Redelegation contains the list of a particular delegator's redelegating bonds
 * from a particular source validator to a particular destination validator.
 */
export interface RedelegationSDKType {
    delegator_address: string;
    validator_src_address: string;
    validator_dst_address: string;
    entries: RedelegationEntrySDKType[];
}
/** Params defines the parameters for the staking module. */
export interface Params {
    /** unbonding_time is the time duration of unbonding. */
    unbondingTime: Duration;
    /** max_validators is the maximum number of validators. */
    maxValidators: number;
    /** max_entries is the max entries for either unbonding delegation or redelegation (per pair/trio). */
    maxEntries: number;
    /** historical_entries is the number of historical entries to persist. */
    historicalEntries: number;
    /** bond_denom defines the bondable coin denomination. */
    bondDenom: string;
    /** min_commission_rate is the chain-wide minimum commission rate that a validator can charge their delegators */
    minCommissionRate: string;
}
export interface ParamsProtoMsg {
    typeUrl: '/cosmos.staking.v1beta1.Params';
    value: Uint8Array;
}
/** Params defines the parameters for the staking module. */
export interface ParamsSDKType {
    unbonding_time: DurationSDKType;
    max_validators: number;
    max_entries: number;
    historical_entries: number;
    bond_denom: string;
    min_commission_rate: string;
}
/**
 * DelegationResponse is equivalent to Delegation except that it contains a
 * balance in addition to shares which is more suitable for client responses.
 */
export interface DelegationResponse {
    delegation: Delegation;
    balance: Coin;
}
export interface DelegationResponseProtoMsg {
    typeUrl: '/cosmos.staking.v1beta1.DelegationResponse';
    value: Uint8Array;
}
/**
 * DelegationResponse is equivalent to Delegation except that it contains a
 * balance in addition to shares which is more suitable for client responses.
 */
export interface DelegationResponseSDKType {
    delegation: DelegationSDKType;
    balance: CoinSDKType;
}
/**
 * RedelegationEntryResponse is equivalent to a RedelegationEntry except that it
 * contains a balance in addition to shares which is more suitable for client
 * responses.
 */
export interface RedelegationEntryResponse {
    redelegationEntry: RedelegationEntry;
    balance: string;
}
export interface RedelegationEntryResponseProtoMsg {
    typeUrl: '/cosmos.staking.v1beta1.RedelegationEntryResponse';
    value: Uint8Array;
}
/**
 * RedelegationEntryResponse is equivalent to a RedelegationEntry except that it
 * contains a balance in addition to shares which is more suitable for client
 * responses.
 */
export interface RedelegationEntryResponseSDKType {
    redelegation_entry: RedelegationEntrySDKType;
    balance: string;
}
/**
 * RedelegationResponse is equivalent to a Redelegation except that its entries
 * contain a balance in addition to shares which is more suitable for client
 * responses.
 */
export interface RedelegationResponse {
    redelegation: Redelegation;
    entries: RedelegationEntryResponse[];
}
export interface RedelegationResponseProtoMsg {
    typeUrl: '/cosmos.staking.v1beta1.RedelegationResponse';
    value: Uint8Array;
}
/**
 * RedelegationResponse is equivalent to a Redelegation except that its entries
 * contain a balance in addition to shares which is more suitable for client
 * responses.
 */
export interface RedelegationResponseSDKType {
    redelegation: RedelegationSDKType;
    entries: RedelegationEntryResponseSDKType[];
}
/**
 * Pool is used for tracking bonded and not-bonded token supply of the bond
 * denomination.
 */
export interface Pool {
    notBondedTokens: string;
    bondedTokens: string;
}
export interface PoolProtoMsg {
    typeUrl: '/cosmos.staking.v1beta1.Pool';
    value: Uint8Array;
}
/**
 * Pool is used for tracking bonded and not-bonded token supply of the bond
 * denomination.
 */
export interface PoolSDKType {
    not_bonded_tokens: string;
    bonded_tokens: string;
}
export declare const HistoricalInfo: {
    typeUrl: string;
    encode(message: HistoricalInfo, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): HistoricalInfo;
    fromJSON(object: any): HistoricalInfo;
    toJSON(message: HistoricalInfo): JsonSafe<HistoricalInfo>;
    fromPartial(object: Partial<HistoricalInfo>): HistoricalInfo;
    fromProtoMsg(message: HistoricalInfoProtoMsg): HistoricalInfo;
    toProto(message: HistoricalInfo): Uint8Array;
    toProtoMsg(message: HistoricalInfo): HistoricalInfoProtoMsg;
};
export declare const CommissionRates: {
    typeUrl: string;
    encode(message: CommissionRates, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): CommissionRates;
    fromJSON(object: any): CommissionRates;
    toJSON(message: CommissionRates): JsonSafe<CommissionRates>;
    fromPartial(object: Partial<CommissionRates>): CommissionRates;
    fromProtoMsg(message: CommissionRatesProtoMsg): CommissionRates;
    toProto(message: CommissionRates): Uint8Array;
    toProtoMsg(message: CommissionRates): CommissionRatesProtoMsg;
};
export declare const Commission: {
    typeUrl: string;
    encode(message: Commission, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): Commission;
    fromJSON(object: any): Commission;
    toJSON(message: Commission): JsonSafe<Commission>;
    fromPartial(object: Partial<Commission>): Commission;
    fromProtoMsg(message: CommissionProtoMsg): Commission;
    toProto(message: Commission): Uint8Array;
    toProtoMsg(message: Commission): CommissionProtoMsg;
};
export declare const Description: {
    typeUrl: string;
    encode(message: Description, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): Description;
    fromJSON(object: any): Description;
    toJSON(message: Description): JsonSafe<Description>;
    fromPartial(object: Partial<Description>): Description;
    fromProtoMsg(message: DescriptionProtoMsg): Description;
    toProto(message: Description): Uint8Array;
    toProtoMsg(message: Description): DescriptionProtoMsg;
};
export declare const Validator: {
    typeUrl: string;
    encode(message: Validator, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): Validator;
    fromJSON(object: any): Validator;
    toJSON(message: Validator): JsonSafe<Validator>;
    fromPartial(object: Partial<Validator>): Validator;
    fromProtoMsg(message: ValidatorProtoMsg): Validator;
    toProto(message: Validator): Uint8Array;
    toProtoMsg(message: Validator): ValidatorProtoMsg;
};
export declare const ValAddresses: {
    typeUrl: string;
    encode(message: ValAddresses, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): ValAddresses;
    fromJSON(object: any): ValAddresses;
    toJSON(message: ValAddresses): JsonSafe<ValAddresses>;
    fromPartial(object: Partial<ValAddresses>): ValAddresses;
    fromProtoMsg(message: ValAddressesProtoMsg): ValAddresses;
    toProto(message: ValAddresses): Uint8Array;
    toProtoMsg(message: ValAddresses): ValAddressesProtoMsg;
};
export declare const DVPair: {
    typeUrl: string;
    encode(message: DVPair, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): DVPair;
    fromJSON(object: any): DVPair;
    toJSON(message: DVPair): JsonSafe<DVPair>;
    fromPartial(object: Partial<DVPair>): DVPair;
    fromProtoMsg(message: DVPairProtoMsg): DVPair;
    toProto(message: DVPair): Uint8Array;
    toProtoMsg(message: DVPair): DVPairProtoMsg;
};
export declare const DVPairs: {
    typeUrl: string;
    encode(message: DVPairs, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): DVPairs;
    fromJSON(object: any): DVPairs;
    toJSON(message: DVPairs): JsonSafe<DVPairs>;
    fromPartial(object: Partial<DVPairs>): DVPairs;
    fromProtoMsg(message: DVPairsProtoMsg): DVPairs;
    toProto(message: DVPairs): Uint8Array;
    toProtoMsg(message: DVPairs): DVPairsProtoMsg;
};
export declare const DVVTriplet: {
    typeUrl: string;
    encode(message: DVVTriplet, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): DVVTriplet;
    fromJSON(object: any): DVVTriplet;
    toJSON(message: DVVTriplet): JsonSafe<DVVTriplet>;
    fromPartial(object: Partial<DVVTriplet>): DVVTriplet;
    fromProtoMsg(message: DVVTripletProtoMsg): DVVTriplet;
    toProto(message: DVVTriplet): Uint8Array;
    toProtoMsg(message: DVVTriplet): DVVTripletProtoMsg;
};
export declare const DVVTriplets: {
    typeUrl: string;
    encode(message: DVVTriplets, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): DVVTriplets;
    fromJSON(object: any): DVVTriplets;
    toJSON(message: DVVTriplets): JsonSafe<DVVTriplets>;
    fromPartial(object: Partial<DVVTriplets>): DVVTriplets;
    fromProtoMsg(message: DVVTripletsProtoMsg): DVVTriplets;
    toProto(message: DVVTriplets): Uint8Array;
    toProtoMsg(message: DVVTriplets): DVVTripletsProtoMsg;
};
export declare const Delegation: {
    typeUrl: string;
    encode(message: Delegation, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): Delegation;
    fromJSON(object: any): Delegation;
    toJSON(message: Delegation): JsonSafe<Delegation>;
    fromPartial(object: Partial<Delegation>): Delegation;
    fromProtoMsg(message: DelegationProtoMsg): Delegation;
    toProto(message: Delegation): Uint8Array;
    toProtoMsg(message: Delegation): DelegationProtoMsg;
};
export declare const UnbondingDelegation: {
    typeUrl: string;
    encode(message: UnbondingDelegation, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): UnbondingDelegation;
    fromJSON(object: any): UnbondingDelegation;
    toJSON(message: UnbondingDelegation): JsonSafe<UnbondingDelegation>;
    fromPartial(object: Partial<UnbondingDelegation>): UnbondingDelegation;
    fromProtoMsg(message: UnbondingDelegationProtoMsg): UnbondingDelegation;
    toProto(message: UnbondingDelegation): Uint8Array;
    toProtoMsg(message: UnbondingDelegation): UnbondingDelegationProtoMsg;
};
export declare const UnbondingDelegationEntry: {
    typeUrl: string;
    encode(message: UnbondingDelegationEntry, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): UnbondingDelegationEntry;
    fromJSON(object: any): UnbondingDelegationEntry;
    toJSON(message: UnbondingDelegationEntry): JsonSafe<UnbondingDelegationEntry>;
    fromPartial(object: Partial<UnbondingDelegationEntry>): UnbondingDelegationEntry;
    fromProtoMsg(message: UnbondingDelegationEntryProtoMsg): UnbondingDelegationEntry;
    toProto(message: UnbondingDelegationEntry): Uint8Array;
    toProtoMsg(message: UnbondingDelegationEntry): UnbondingDelegationEntryProtoMsg;
};
export declare const RedelegationEntry: {
    typeUrl: string;
    encode(message: RedelegationEntry, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): RedelegationEntry;
    fromJSON(object: any): RedelegationEntry;
    toJSON(message: RedelegationEntry): JsonSafe<RedelegationEntry>;
    fromPartial(object: Partial<RedelegationEntry>): RedelegationEntry;
    fromProtoMsg(message: RedelegationEntryProtoMsg): RedelegationEntry;
    toProto(message: RedelegationEntry): Uint8Array;
    toProtoMsg(message: RedelegationEntry): RedelegationEntryProtoMsg;
};
export declare const Redelegation: {
    typeUrl: string;
    encode(message: Redelegation, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): Redelegation;
    fromJSON(object: any): Redelegation;
    toJSON(message: Redelegation): JsonSafe<Redelegation>;
    fromPartial(object: Partial<Redelegation>): Redelegation;
    fromProtoMsg(message: RedelegationProtoMsg): Redelegation;
    toProto(message: Redelegation): Uint8Array;
    toProtoMsg(message: Redelegation): RedelegationProtoMsg;
};
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
export declare const DelegationResponse: {
    typeUrl: string;
    encode(message: DelegationResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): DelegationResponse;
    fromJSON(object: any): DelegationResponse;
    toJSON(message: DelegationResponse): JsonSafe<DelegationResponse>;
    fromPartial(object: Partial<DelegationResponse>): DelegationResponse;
    fromProtoMsg(message: DelegationResponseProtoMsg): DelegationResponse;
    toProto(message: DelegationResponse): Uint8Array;
    toProtoMsg(message: DelegationResponse): DelegationResponseProtoMsg;
};
export declare const RedelegationEntryResponse: {
    typeUrl: string;
    encode(message: RedelegationEntryResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): RedelegationEntryResponse;
    fromJSON(object: any): RedelegationEntryResponse;
    toJSON(message: RedelegationEntryResponse): JsonSafe<RedelegationEntryResponse>;
    fromPartial(object: Partial<RedelegationEntryResponse>): RedelegationEntryResponse;
    fromProtoMsg(message: RedelegationEntryResponseProtoMsg): RedelegationEntryResponse;
    toProto(message: RedelegationEntryResponse): Uint8Array;
    toProtoMsg(message: RedelegationEntryResponse): RedelegationEntryResponseProtoMsg;
};
export declare const RedelegationResponse: {
    typeUrl: string;
    encode(message: RedelegationResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): RedelegationResponse;
    fromJSON(object: any): RedelegationResponse;
    toJSON(message: RedelegationResponse): JsonSafe<RedelegationResponse>;
    fromPartial(object: Partial<RedelegationResponse>): RedelegationResponse;
    fromProtoMsg(message: RedelegationResponseProtoMsg): RedelegationResponse;
    toProto(message: RedelegationResponse): Uint8Array;
    toProtoMsg(message: RedelegationResponse): RedelegationResponseProtoMsg;
};
export declare const Pool: {
    typeUrl: string;
    encode(message: Pool, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): Pool;
    fromJSON(object: any): Pool;
    toJSON(message: Pool): JsonSafe<Pool>;
    fromPartial(object: Partial<Pool>): Pool;
    fromProtoMsg(message: PoolProtoMsg): Pool;
    toProto(message: Pool): Uint8Array;
    toProtoMsg(message: Pool): PoolProtoMsg;
};
export declare const Cosmos_cryptoPubKey_InterfaceDecoder: (input: BinaryReader | Uint8Array) => Any;
