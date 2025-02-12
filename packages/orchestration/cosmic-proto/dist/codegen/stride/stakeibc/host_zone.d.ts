import { Validator, type ValidatorSDKType } from './validator.js';
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { type JsonSafe } from '../../json-safe.js';
/**
 * CommunityPoolRebate stores the size of the community pool liquid stake
 * (denominated in stTokens) and the rebate rate as a decimal
 */
export interface CommunityPoolRebate {
    /** Rebate percentage as a decimal (e.g. 0.2 for 20%) */
    rebateRate: string;
    /** Number of stTokens received from the community pool liquid stake */
    liquidStakedStTokenAmount: string;
}
export interface CommunityPoolRebateProtoMsg {
    typeUrl: '/stride.stakeibc.CommunityPoolRebate';
    value: Uint8Array;
}
/**
 * CommunityPoolRebate stores the size of the community pool liquid stake
 * (denominated in stTokens) and the rebate rate as a decimal
 */
export interface CommunityPoolRebateSDKType {
    rebate_rate: string;
    liquid_staked_st_token_amount: string;
}
/** Core data structure to track liquid staking zones */
export interface HostZone {
    /** Chain ID of the host zone */
    chainId: string;
    /** Bech32 prefix of host zone's address */
    bech32prefix: string;
    /** ConnectionID from Stride to the host zone (ID is on the stride side) */
    connectionId: string;
    /** Transfer Channel ID from Stride to the host zone (ID is on the stride side) */
    transferChannelId: string;
    /** ibc denom of the host zone's native token on stride */
    ibcDenom: string;
    /** native denom on host zone */
    hostDenom: string;
    /** The unbonding period in days (e.g. 21) */
    unbondingPeriod: bigint;
    /** List of validators that are delegated to */
    validators: Validator[];
    /** Address that custodies native tokens during a liquid stake */
    depositAddress: string;
    /** ICA Address on the host zone responsible for collecting rewards */
    withdrawalIcaAddress: string;
    /** ICA Address on the host zone responsible for commission */
    feeIcaAddress: string;
    /** ICA Address on the host zone responsible for staking and unstaking */
    delegationIcaAddress: string;
    /** ICA Address that receives unstaked tokens after they've finished unbonding */
    redemptionIcaAddress: string;
    /**
     * ICA Address that receives tokens from a community pool to liquid stake or
     * redeem In the case of a liquid stake, the community pool deposits native
     * tokens In the case of a redemption, the community pool deposits stTokens
     */
    communityPoolDepositIcaAddress: string;
    /**
     * ICA Address that distributes tokens back to the community pool during a
     * community pool liquid stake or redeem In the case of a liquid stake, the
     * return address sends back stTokens In the case of a redemption, the return
     * address sends back native tokens
     */
    communityPoolReturnIcaAddress: string;
    /**
     * Module account on Stride that receives native tokens from the deposit ICA
     * and liquid stakes them
     */
    communityPoolStakeHoldingAddress: string;
    /**
     * Module account on Stride that receives stTokens from the deposit ICA and
     * redeems them
     */
    communityPoolRedeemHoldingAddress: string;
    /**
     * Optional community pool address to send tokens to after a community pool
     * liquid stake or redemption If this address is empty, the tokens are sent to
     * the main community pool
     */
    communityPoolTreasuryAddress: string;
    /** The total delegated balance on the host zone */
    totalDelegations: string;
    /** The redemption rate from the previous epoch */
    lastRedemptionRate: string;
    /** The current redemption rate */
    redemptionRate: string;
    /**
     * The min outer redemption rate bound - controlled only be governance
     * The min inner bound cannot exceed this bound
     */
    minRedemptionRate: string;
    /**
     * The max outer redemption rate bound - controlled only be governance
     * The max inner bound cannot exceed this bound
     */
    maxRedemptionRate: string;
    /**
     * The min minner redemption rate bound - controlled by the admin
     * If the redemption rate exceeds this bound, the host zone is halted
     */
    minInnerRedemptionRate: string;
    /**
     * The max minner redemption rate bound - controlled by the admin
     * If the redemption rate exceeds this bound, the host zone is halted
     */
    maxInnerRedemptionRate: string;
    /**
     * The max number of messages that can be sent in a delegation
     * or undelegation ICA tx
     */
    maxMessagesPerIcaTx: bigint;
    /** Indicates whether redemptions are allowed through this module */
    redemptionsEnabled: boolean;
    /**
     * An optional fee rebate
     * If there is no rebate for the host zone, this will be nil
     */
    communityPoolRebate?: CommunityPoolRebate;
    /** A boolean indicating whether the chain has LSM enabled */
    lsmLiquidStakeEnabled: boolean;
    /** A boolean indicating whether the chain is currently halted */
    halted: boolean;
}
export interface HostZoneProtoMsg {
    typeUrl: '/stride.stakeibc.HostZone';
    value: Uint8Array;
}
/** Core data structure to track liquid staking zones */
export interface HostZoneSDKType {
    chain_id: string;
    bech32prefix: string;
    connection_id: string;
    transfer_channel_id: string;
    ibc_denom: string;
    host_denom: string;
    unbonding_period: bigint;
    validators: ValidatorSDKType[];
    deposit_address: string;
    withdrawal_ica_address: string;
    fee_ica_address: string;
    delegation_ica_address: string;
    redemption_ica_address: string;
    community_pool_deposit_ica_address: string;
    community_pool_return_ica_address: string;
    community_pool_stake_holding_address: string;
    community_pool_redeem_holding_address: string;
    community_pool_treasury_address: string;
    total_delegations: string;
    last_redemption_rate: string;
    redemption_rate: string;
    min_redemption_rate: string;
    max_redemption_rate: string;
    min_inner_redemption_rate: string;
    max_inner_redemption_rate: string;
    max_messages_per_ica_tx: bigint;
    redemptions_enabled: boolean;
    community_pool_rebate?: CommunityPoolRebateSDKType;
    lsm_liquid_stake_enabled: boolean;
    halted: boolean;
}
export declare const CommunityPoolRebate: {
    typeUrl: string;
    encode(message: CommunityPoolRebate, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): CommunityPoolRebate;
    fromJSON(object: any): CommunityPoolRebate;
    toJSON(message: CommunityPoolRebate): JsonSafe<CommunityPoolRebate>;
    fromPartial(object: Partial<CommunityPoolRebate>): CommunityPoolRebate;
    fromProtoMsg(message: CommunityPoolRebateProtoMsg): CommunityPoolRebate;
    toProto(message: CommunityPoolRebate): Uint8Array;
    toProtoMsg(message: CommunityPoolRebate): CommunityPoolRebateProtoMsg;
};
export declare const HostZone: {
    typeUrl: string;
    encode(message: HostZone, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): HostZone;
    fromJSON(object: any): HostZone;
    toJSON(message: HostZone): JsonSafe<HostZone>;
    fromPartial(object: Partial<HostZone>): HostZone;
    fromProtoMsg(message: HostZoneProtoMsg): HostZone;
    toProto(message: HostZone): Uint8Array;
    toProtoMsg(message: HostZone): HostZoneProtoMsg;
};
