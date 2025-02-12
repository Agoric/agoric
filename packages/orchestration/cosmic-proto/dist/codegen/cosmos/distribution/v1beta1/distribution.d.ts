import { DecCoin, type DecCoinSDKType, Coin, type CoinSDKType } from '../../base/v1beta1/coin.js';
import { BinaryReader, BinaryWriter } from '../../../binary.js';
import { type JsonSafe } from '../../../json-safe.js';
/** Params defines the set of params for the distribution module. */
export interface Params {
    communityTax: string;
    baseProposerReward: string;
    bonusProposerReward: string;
    withdrawAddrEnabled: boolean;
}
export interface ParamsProtoMsg {
    typeUrl: '/cosmos.distribution.v1beta1.Params';
    value: Uint8Array;
}
/** Params defines the set of params for the distribution module. */
export interface ParamsSDKType {
    community_tax: string;
    base_proposer_reward: string;
    bonus_proposer_reward: string;
    withdraw_addr_enabled: boolean;
}
/**
 * ValidatorHistoricalRewards represents historical rewards for a validator.
 * Height is implicit within the store key.
 * Cumulative reward ratio is the sum from the zeroeth period
 * until this period of rewards / tokens, per the spec.
 * The reference count indicates the number of objects
 * which might need to reference this historical entry at any point.
 * ReferenceCount =
 *    number of outstanding delegations which ended the associated period (and
 *    might need to read that record)
 *  + number of slashes which ended the associated period (and might need to
 *  read that record)
 *  + one per validator for the zeroeth period, set on initialization
 */
export interface ValidatorHistoricalRewards {
    cumulativeRewardRatio: DecCoin[];
    referenceCount: number;
}
export interface ValidatorHistoricalRewardsProtoMsg {
    typeUrl: '/cosmos.distribution.v1beta1.ValidatorHistoricalRewards';
    value: Uint8Array;
}
/**
 * ValidatorHistoricalRewards represents historical rewards for a validator.
 * Height is implicit within the store key.
 * Cumulative reward ratio is the sum from the zeroeth period
 * until this period of rewards / tokens, per the spec.
 * The reference count indicates the number of objects
 * which might need to reference this historical entry at any point.
 * ReferenceCount =
 *    number of outstanding delegations which ended the associated period (and
 *    might need to read that record)
 *  + number of slashes which ended the associated period (and might need to
 *  read that record)
 *  + one per validator for the zeroeth period, set on initialization
 */
export interface ValidatorHistoricalRewardsSDKType {
    cumulative_reward_ratio: DecCoinSDKType[];
    reference_count: number;
}
/**
 * ValidatorCurrentRewards represents current rewards and current
 * period for a validator kept as a running counter and incremented
 * each block as long as the validator's tokens remain constant.
 */
export interface ValidatorCurrentRewards {
    rewards: DecCoin[];
    period: bigint;
}
export interface ValidatorCurrentRewardsProtoMsg {
    typeUrl: '/cosmos.distribution.v1beta1.ValidatorCurrentRewards';
    value: Uint8Array;
}
/**
 * ValidatorCurrentRewards represents current rewards and current
 * period for a validator kept as a running counter and incremented
 * each block as long as the validator's tokens remain constant.
 */
export interface ValidatorCurrentRewardsSDKType {
    rewards: DecCoinSDKType[];
    period: bigint;
}
/**
 * ValidatorAccumulatedCommission represents accumulated commission
 * for a validator kept as a running counter, can be withdrawn at any time.
 */
export interface ValidatorAccumulatedCommission {
    commission: DecCoin[];
}
export interface ValidatorAccumulatedCommissionProtoMsg {
    typeUrl: '/cosmos.distribution.v1beta1.ValidatorAccumulatedCommission';
    value: Uint8Array;
}
/**
 * ValidatorAccumulatedCommission represents accumulated commission
 * for a validator kept as a running counter, can be withdrawn at any time.
 */
export interface ValidatorAccumulatedCommissionSDKType {
    commission: DecCoinSDKType[];
}
/**
 * ValidatorOutstandingRewards represents outstanding (un-withdrawn) rewards
 * for a validator inexpensive to track, allows simple sanity checks.
 */
export interface ValidatorOutstandingRewards {
    rewards: DecCoin[];
}
export interface ValidatorOutstandingRewardsProtoMsg {
    typeUrl: '/cosmos.distribution.v1beta1.ValidatorOutstandingRewards';
    value: Uint8Array;
}
/**
 * ValidatorOutstandingRewards represents outstanding (un-withdrawn) rewards
 * for a validator inexpensive to track, allows simple sanity checks.
 */
export interface ValidatorOutstandingRewardsSDKType {
    rewards: DecCoinSDKType[];
}
/**
 * ValidatorSlashEvent represents a validator slash event.
 * Height is implicit within the store key.
 * This is needed to calculate appropriate amount of staking tokens
 * for delegations which are withdrawn after a slash has occurred.
 */
export interface ValidatorSlashEvent {
    validatorPeriod: bigint;
    fraction: string;
}
export interface ValidatorSlashEventProtoMsg {
    typeUrl: '/cosmos.distribution.v1beta1.ValidatorSlashEvent';
    value: Uint8Array;
}
/**
 * ValidatorSlashEvent represents a validator slash event.
 * Height is implicit within the store key.
 * This is needed to calculate appropriate amount of staking tokens
 * for delegations which are withdrawn after a slash has occurred.
 */
export interface ValidatorSlashEventSDKType {
    validator_period: bigint;
    fraction: string;
}
/** ValidatorSlashEvents is a collection of ValidatorSlashEvent messages. */
export interface ValidatorSlashEvents {
    validatorSlashEvents: ValidatorSlashEvent[];
}
export interface ValidatorSlashEventsProtoMsg {
    typeUrl: '/cosmos.distribution.v1beta1.ValidatorSlashEvents';
    value: Uint8Array;
}
/** ValidatorSlashEvents is a collection of ValidatorSlashEvent messages. */
export interface ValidatorSlashEventsSDKType {
    validator_slash_events: ValidatorSlashEventSDKType[];
}
/** FeePool is the global fee pool for distribution. */
export interface FeePool {
    communityPool: DecCoin[];
}
export interface FeePoolProtoMsg {
    typeUrl: '/cosmos.distribution.v1beta1.FeePool';
    value: Uint8Array;
}
/** FeePool is the global fee pool for distribution. */
export interface FeePoolSDKType {
    community_pool: DecCoinSDKType[];
}
/**
 * CommunityPoolSpendProposal details a proposal for use of community funds,
 * together with how many coins are proposed to be spent, and to which
 * recipient account.
 */
export interface CommunityPoolSpendProposal {
    $typeUrl?: '/cosmos.distribution.v1beta1.CommunityPoolSpendProposal';
    title: string;
    description: string;
    recipient: string;
    amount: Coin[];
}
export interface CommunityPoolSpendProposalProtoMsg {
    typeUrl: '/cosmos.distribution.v1beta1.CommunityPoolSpendProposal';
    value: Uint8Array;
}
/**
 * CommunityPoolSpendProposal details a proposal for use of community funds,
 * together with how many coins are proposed to be spent, and to which
 * recipient account.
 */
export interface CommunityPoolSpendProposalSDKType {
    $typeUrl?: '/cosmos.distribution.v1beta1.CommunityPoolSpendProposal';
    title: string;
    description: string;
    recipient: string;
    amount: CoinSDKType[];
}
/**
 * DelegatorStartingInfo represents the starting info for a delegator reward
 * period. It tracks the previous validator period, the delegation's amount of
 * staking token, and the creation height (to check later on if any slashes have
 * occurred). NOTE: Even though validators are slashed to whole staking tokens,
 * the delegators within the validator may be left with less than a full token,
 * thus sdk.Dec is used.
 */
export interface DelegatorStartingInfo {
    previousPeriod: bigint;
    stake: string;
    height: bigint;
}
export interface DelegatorStartingInfoProtoMsg {
    typeUrl: '/cosmos.distribution.v1beta1.DelegatorStartingInfo';
    value: Uint8Array;
}
/**
 * DelegatorStartingInfo represents the starting info for a delegator reward
 * period. It tracks the previous validator period, the delegation's amount of
 * staking token, and the creation height (to check later on if any slashes have
 * occurred). NOTE: Even though validators are slashed to whole staking tokens,
 * the delegators within the validator may be left with less than a full token,
 * thus sdk.Dec is used.
 */
export interface DelegatorStartingInfoSDKType {
    previous_period: bigint;
    stake: string;
    height: bigint;
}
/**
 * DelegationDelegatorReward represents the properties
 * of a delegator's delegation reward.
 */
export interface DelegationDelegatorReward {
    validatorAddress: string;
    reward: DecCoin[];
}
export interface DelegationDelegatorRewardProtoMsg {
    typeUrl: '/cosmos.distribution.v1beta1.DelegationDelegatorReward';
    value: Uint8Array;
}
/**
 * DelegationDelegatorReward represents the properties
 * of a delegator's delegation reward.
 */
export interface DelegationDelegatorRewardSDKType {
    validator_address: string;
    reward: DecCoinSDKType[];
}
/**
 * CommunityPoolSpendProposalWithDeposit defines a CommunityPoolSpendProposal
 * with a deposit
 */
export interface CommunityPoolSpendProposalWithDeposit {
    $typeUrl?: '/cosmos.distribution.v1beta1.CommunityPoolSpendProposalWithDeposit';
    title: string;
    description: string;
    recipient: string;
    amount: string;
    deposit: string;
}
export interface CommunityPoolSpendProposalWithDepositProtoMsg {
    typeUrl: '/cosmos.distribution.v1beta1.CommunityPoolSpendProposalWithDeposit';
    value: Uint8Array;
}
/**
 * CommunityPoolSpendProposalWithDeposit defines a CommunityPoolSpendProposal
 * with a deposit
 */
export interface CommunityPoolSpendProposalWithDepositSDKType {
    $typeUrl?: '/cosmos.distribution.v1beta1.CommunityPoolSpendProposalWithDeposit';
    title: string;
    description: string;
    recipient: string;
    amount: string;
    deposit: string;
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
export declare const ValidatorHistoricalRewards: {
    typeUrl: string;
    encode(message: ValidatorHistoricalRewards, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): ValidatorHistoricalRewards;
    fromJSON(object: any): ValidatorHistoricalRewards;
    toJSON(message: ValidatorHistoricalRewards): JsonSafe<ValidatorHistoricalRewards>;
    fromPartial(object: Partial<ValidatorHistoricalRewards>): ValidatorHistoricalRewards;
    fromProtoMsg(message: ValidatorHistoricalRewardsProtoMsg): ValidatorHistoricalRewards;
    toProto(message: ValidatorHistoricalRewards): Uint8Array;
    toProtoMsg(message: ValidatorHistoricalRewards): ValidatorHistoricalRewardsProtoMsg;
};
export declare const ValidatorCurrentRewards: {
    typeUrl: string;
    encode(message: ValidatorCurrentRewards, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): ValidatorCurrentRewards;
    fromJSON(object: any): ValidatorCurrentRewards;
    toJSON(message: ValidatorCurrentRewards): JsonSafe<ValidatorCurrentRewards>;
    fromPartial(object: Partial<ValidatorCurrentRewards>): ValidatorCurrentRewards;
    fromProtoMsg(message: ValidatorCurrentRewardsProtoMsg): ValidatorCurrentRewards;
    toProto(message: ValidatorCurrentRewards): Uint8Array;
    toProtoMsg(message: ValidatorCurrentRewards): ValidatorCurrentRewardsProtoMsg;
};
export declare const ValidatorAccumulatedCommission: {
    typeUrl: string;
    encode(message: ValidatorAccumulatedCommission, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): ValidatorAccumulatedCommission;
    fromJSON(object: any): ValidatorAccumulatedCommission;
    toJSON(message: ValidatorAccumulatedCommission): JsonSafe<ValidatorAccumulatedCommission>;
    fromPartial(object: Partial<ValidatorAccumulatedCommission>): ValidatorAccumulatedCommission;
    fromProtoMsg(message: ValidatorAccumulatedCommissionProtoMsg): ValidatorAccumulatedCommission;
    toProto(message: ValidatorAccumulatedCommission): Uint8Array;
    toProtoMsg(message: ValidatorAccumulatedCommission): ValidatorAccumulatedCommissionProtoMsg;
};
export declare const ValidatorOutstandingRewards: {
    typeUrl: string;
    encode(message: ValidatorOutstandingRewards, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): ValidatorOutstandingRewards;
    fromJSON(object: any): ValidatorOutstandingRewards;
    toJSON(message: ValidatorOutstandingRewards): JsonSafe<ValidatorOutstandingRewards>;
    fromPartial(object: Partial<ValidatorOutstandingRewards>): ValidatorOutstandingRewards;
    fromProtoMsg(message: ValidatorOutstandingRewardsProtoMsg): ValidatorOutstandingRewards;
    toProto(message: ValidatorOutstandingRewards): Uint8Array;
    toProtoMsg(message: ValidatorOutstandingRewards): ValidatorOutstandingRewardsProtoMsg;
};
export declare const ValidatorSlashEvent: {
    typeUrl: string;
    encode(message: ValidatorSlashEvent, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): ValidatorSlashEvent;
    fromJSON(object: any): ValidatorSlashEvent;
    toJSON(message: ValidatorSlashEvent): JsonSafe<ValidatorSlashEvent>;
    fromPartial(object: Partial<ValidatorSlashEvent>): ValidatorSlashEvent;
    fromProtoMsg(message: ValidatorSlashEventProtoMsg): ValidatorSlashEvent;
    toProto(message: ValidatorSlashEvent): Uint8Array;
    toProtoMsg(message: ValidatorSlashEvent): ValidatorSlashEventProtoMsg;
};
export declare const ValidatorSlashEvents: {
    typeUrl: string;
    encode(message: ValidatorSlashEvents, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): ValidatorSlashEvents;
    fromJSON(object: any): ValidatorSlashEvents;
    toJSON(message: ValidatorSlashEvents): JsonSafe<ValidatorSlashEvents>;
    fromPartial(object: Partial<ValidatorSlashEvents>): ValidatorSlashEvents;
    fromProtoMsg(message: ValidatorSlashEventsProtoMsg): ValidatorSlashEvents;
    toProto(message: ValidatorSlashEvents): Uint8Array;
    toProtoMsg(message: ValidatorSlashEvents): ValidatorSlashEventsProtoMsg;
};
export declare const FeePool: {
    typeUrl: string;
    encode(message: FeePool, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): FeePool;
    fromJSON(object: any): FeePool;
    toJSON(message: FeePool): JsonSafe<FeePool>;
    fromPartial(object: Partial<FeePool>): FeePool;
    fromProtoMsg(message: FeePoolProtoMsg): FeePool;
    toProto(message: FeePool): Uint8Array;
    toProtoMsg(message: FeePool): FeePoolProtoMsg;
};
export declare const CommunityPoolSpendProposal: {
    typeUrl: string;
    encode(message: CommunityPoolSpendProposal, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): CommunityPoolSpendProposal;
    fromJSON(object: any): CommunityPoolSpendProposal;
    toJSON(message: CommunityPoolSpendProposal): JsonSafe<CommunityPoolSpendProposal>;
    fromPartial(object: Partial<CommunityPoolSpendProposal>): CommunityPoolSpendProposal;
    fromProtoMsg(message: CommunityPoolSpendProposalProtoMsg): CommunityPoolSpendProposal;
    toProto(message: CommunityPoolSpendProposal): Uint8Array;
    toProtoMsg(message: CommunityPoolSpendProposal): CommunityPoolSpendProposalProtoMsg;
};
export declare const DelegatorStartingInfo: {
    typeUrl: string;
    encode(message: DelegatorStartingInfo, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): DelegatorStartingInfo;
    fromJSON(object: any): DelegatorStartingInfo;
    toJSON(message: DelegatorStartingInfo): JsonSafe<DelegatorStartingInfo>;
    fromPartial(object: Partial<DelegatorStartingInfo>): DelegatorStartingInfo;
    fromProtoMsg(message: DelegatorStartingInfoProtoMsg): DelegatorStartingInfo;
    toProto(message: DelegatorStartingInfo): Uint8Array;
    toProtoMsg(message: DelegatorStartingInfo): DelegatorStartingInfoProtoMsg;
};
export declare const DelegationDelegatorReward: {
    typeUrl: string;
    encode(message: DelegationDelegatorReward, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): DelegationDelegatorReward;
    fromJSON(object: any): DelegationDelegatorReward;
    toJSON(message: DelegationDelegatorReward): JsonSafe<DelegationDelegatorReward>;
    fromPartial(object: Partial<DelegationDelegatorReward>): DelegationDelegatorReward;
    fromProtoMsg(message: DelegationDelegatorRewardProtoMsg): DelegationDelegatorReward;
    toProto(message: DelegationDelegatorReward): Uint8Array;
    toProtoMsg(message: DelegationDelegatorReward): DelegationDelegatorRewardProtoMsg;
};
export declare const CommunityPoolSpendProposalWithDeposit: {
    typeUrl: string;
    encode(message: CommunityPoolSpendProposalWithDeposit, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): CommunityPoolSpendProposalWithDeposit;
    fromJSON(object: any): CommunityPoolSpendProposalWithDeposit;
    toJSON(message: CommunityPoolSpendProposalWithDeposit): JsonSafe<CommunityPoolSpendProposalWithDeposit>;
    fromPartial(object: Partial<CommunityPoolSpendProposalWithDeposit>): CommunityPoolSpendProposalWithDeposit;
    fromProtoMsg(message: CommunityPoolSpendProposalWithDepositProtoMsg): CommunityPoolSpendProposalWithDeposit;
    toProto(message: CommunityPoolSpendProposalWithDeposit): Uint8Array;
    toProtoMsg(message: CommunityPoolSpendProposalWithDeposit): CommunityPoolSpendProposalWithDepositProtoMsg;
};
