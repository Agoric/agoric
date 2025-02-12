import { Validator, type ValidatorSDKType } from './validator.js';
import { Coin, type CoinSDKType } from '../../cosmos/base/v1beta1/coin.js';
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { type JsonSafe } from '../../json-safe.js';
export declare enum AuthzPermissionChange {
    /** GRANT - Grant the address trade permissions */
    GRANT = 0,
    /** REVOKE - Revoke trade permissions from the address */
    REVOKE = 1,
    UNRECOGNIZED = -1
}
export declare const AuthzPermissionChangeSDKType: typeof AuthzPermissionChange;
export declare function authzPermissionChangeFromJSON(object: any): AuthzPermissionChange;
export declare function authzPermissionChangeToJSON(object: AuthzPermissionChange): string;
export interface MsgUpdateInnerRedemptionRateBounds {
    creator: string;
    chainId: string;
    minInnerRedemptionRate: string;
    maxInnerRedemptionRate: string;
}
export interface MsgUpdateInnerRedemptionRateBoundsProtoMsg {
    typeUrl: '/stride.stakeibc.MsgUpdateInnerRedemptionRateBounds';
    value: Uint8Array;
}
export interface MsgUpdateInnerRedemptionRateBoundsSDKType {
    creator: string;
    chain_id: string;
    min_inner_redemption_rate: string;
    max_inner_redemption_rate: string;
}
export interface MsgUpdateInnerRedemptionRateBoundsResponse {
}
export interface MsgUpdateInnerRedemptionRateBoundsResponseProtoMsg {
    typeUrl: '/stride.stakeibc.MsgUpdateInnerRedemptionRateBoundsResponse';
    value: Uint8Array;
}
export interface MsgUpdateInnerRedemptionRateBoundsResponseSDKType {
}
export interface MsgLiquidStake {
    creator: string;
    amount: string;
    hostDenom: string;
}
export interface MsgLiquidStakeProtoMsg {
    typeUrl: '/stride.stakeibc.MsgLiquidStake';
    value: Uint8Array;
}
export interface MsgLiquidStakeSDKType {
    creator: string;
    amount: string;
    host_denom: string;
}
export interface MsgLiquidStakeResponse {
    stToken: Coin;
}
export interface MsgLiquidStakeResponseProtoMsg {
    typeUrl: '/stride.stakeibc.MsgLiquidStakeResponse';
    value: Uint8Array;
}
export interface MsgLiquidStakeResponseSDKType {
    st_token: CoinSDKType;
}
export interface MsgLSMLiquidStake {
    creator: string;
    amount: string;
    lsmTokenIbcDenom: string;
}
export interface MsgLSMLiquidStakeProtoMsg {
    typeUrl: '/stride.stakeibc.MsgLSMLiquidStake';
    value: Uint8Array;
}
export interface MsgLSMLiquidStakeSDKType {
    creator: string;
    amount: string;
    lsm_token_ibc_denom: string;
}
export interface MsgLSMLiquidStakeResponse {
    transactionComplete: boolean;
}
export interface MsgLSMLiquidStakeResponseProtoMsg {
    typeUrl: '/stride.stakeibc.MsgLSMLiquidStakeResponse';
    value: Uint8Array;
}
export interface MsgLSMLiquidStakeResponseSDKType {
    transaction_complete: boolean;
}
export interface MsgClearBalance {
    creator: string;
    chainId: string;
    amount: string;
    channel: string;
}
export interface MsgClearBalanceProtoMsg {
    typeUrl: '/stride.stakeibc.MsgClearBalance';
    value: Uint8Array;
}
export interface MsgClearBalanceSDKType {
    creator: string;
    chain_id: string;
    amount: string;
    channel: string;
}
export interface MsgClearBalanceResponse {
}
export interface MsgClearBalanceResponseProtoMsg {
    typeUrl: '/stride.stakeibc.MsgClearBalanceResponse';
    value: Uint8Array;
}
export interface MsgClearBalanceResponseSDKType {
}
export interface MsgRedeemStake {
    creator: string;
    amount: string;
    hostZone: string;
    receiver: string;
}
export interface MsgRedeemStakeProtoMsg {
    typeUrl: '/stride.stakeibc.MsgRedeemStake';
    value: Uint8Array;
}
export interface MsgRedeemStakeSDKType {
    creator: string;
    amount: string;
    host_zone: string;
    receiver: string;
}
export interface MsgRedeemStakeResponse {
}
export interface MsgRedeemStakeResponseProtoMsg {
    typeUrl: '/stride.stakeibc.MsgRedeemStakeResponse';
    value: Uint8Array;
}
export interface MsgRedeemStakeResponseSDKType {
}
/** next: 15 */
export interface MsgRegisterHostZone {
    connectionId: string;
    bech32prefix: string;
    hostDenom: string;
    ibcDenom: string;
    creator: string;
    transferChannelId: string;
    unbondingPeriod: bigint;
    minRedemptionRate: string;
    maxRedemptionRate: string;
    lsmLiquidStakeEnabled: boolean;
    communityPoolTreasuryAddress: string;
    maxMessagesPerIcaTx: bigint;
}
export interface MsgRegisterHostZoneProtoMsg {
    typeUrl: '/stride.stakeibc.MsgRegisterHostZone';
    value: Uint8Array;
}
/** next: 15 */
export interface MsgRegisterHostZoneSDKType {
    connection_id: string;
    bech32prefix: string;
    host_denom: string;
    ibc_denom: string;
    creator: string;
    transfer_channel_id: string;
    unbonding_period: bigint;
    min_redemption_rate: string;
    max_redemption_rate: string;
    lsm_liquid_stake_enabled: boolean;
    community_pool_treasury_address: string;
    max_messages_per_ica_tx: bigint;
}
export interface MsgRegisterHostZoneResponse {
}
export interface MsgRegisterHostZoneResponseProtoMsg {
    typeUrl: '/stride.stakeibc.MsgRegisterHostZoneResponse';
    value: Uint8Array;
}
export interface MsgRegisterHostZoneResponseSDKType {
}
export interface MsgClaimUndelegatedTokens {
    creator: string;
    /** UserUnbondingRecords are keyed on {chain_id}.{epoch}.{receiver} */
    hostZoneId: string;
    epoch: bigint;
    receiver: string;
}
export interface MsgClaimUndelegatedTokensProtoMsg {
    typeUrl: '/stride.stakeibc.MsgClaimUndelegatedTokens';
    value: Uint8Array;
}
export interface MsgClaimUndelegatedTokensSDKType {
    creator: string;
    host_zone_id: string;
    epoch: bigint;
    receiver: string;
}
export interface MsgClaimUndelegatedTokensResponse {
}
export interface MsgClaimUndelegatedTokensResponseProtoMsg {
    typeUrl: '/stride.stakeibc.MsgClaimUndelegatedTokensResponse';
    value: Uint8Array;
}
export interface MsgClaimUndelegatedTokensResponseSDKType {
}
export interface MsgRebalanceValidators {
    creator: string;
    hostZone: string;
    numRebalance: bigint;
}
export interface MsgRebalanceValidatorsProtoMsg {
    typeUrl: '/stride.stakeibc.MsgRebalanceValidators';
    value: Uint8Array;
}
export interface MsgRebalanceValidatorsSDKType {
    creator: string;
    host_zone: string;
    num_rebalance: bigint;
}
export interface MsgRebalanceValidatorsResponse {
}
export interface MsgRebalanceValidatorsResponseProtoMsg {
    typeUrl: '/stride.stakeibc.MsgRebalanceValidatorsResponse';
    value: Uint8Array;
}
export interface MsgRebalanceValidatorsResponseSDKType {
}
export interface MsgAddValidators {
    creator: string;
    hostZone: string;
    validators: Validator[];
}
export interface MsgAddValidatorsProtoMsg {
    typeUrl: '/stride.stakeibc.MsgAddValidators';
    value: Uint8Array;
}
export interface MsgAddValidatorsSDKType {
    creator: string;
    host_zone: string;
    validators: ValidatorSDKType[];
}
export interface MsgAddValidatorsResponse {
}
export interface MsgAddValidatorsResponseProtoMsg {
    typeUrl: '/stride.stakeibc.MsgAddValidatorsResponse';
    value: Uint8Array;
}
export interface MsgAddValidatorsResponseSDKType {
}
export interface ValidatorWeight {
    address: string;
    weight: bigint;
}
export interface ValidatorWeightProtoMsg {
    typeUrl: '/stride.stakeibc.ValidatorWeight';
    value: Uint8Array;
}
export interface ValidatorWeightSDKType {
    address: string;
    weight: bigint;
}
export interface MsgChangeValidatorWeights {
    creator: string;
    hostZone: string;
    validatorWeights: ValidatorWeight[];
}
export interface MsgChangeValidatorWeightsProtoMsg {
    typeUrl: '/stride.stakeibc.MsgChangeValidatorWeights';
    value: Uint8Array;
}
export interface MsgChangeValidatorWeightsSDKType {
    creator: string;
    host_zone: string;
    validator_weights: ValidatorWeightSDKType[];
}
export interface MsgChangeValidatorWeightsResponse {
}
export interface MsgChangeValidatorWeightsResponseProtoMsg {
    typeUrl: '/stride.stakeibc.MsgChangeValidatorWeightsResponse';
    value: Uint8Array;
}
export interface MsgChangeValidatorWeightsResponseSDKType {
}
export interface MsgDeleteValidator {
    creator: string;
    hostZone: string;
    valAddr: string;
}
export interface MsgDeleteValidatorProtoMsg {
    typeUrl: '/stride.stakeibc.MsgDeleteValidator';
    value: Uint8Array;
}
export interface MsgDeleteValidatorSDKType {
    creator: string;
    host_zone: string;
    val_addr: string;
}
export interface MsgDeleteValidatorResponse {
}
export interface MsgDeleteValidatorResponseProtoMsg {
    typeUrl: '/stride.stakeibc.MsgDeleteValidatorResponse';
    value: Uint8Array;
}
export interface MsgDeleteValidatorResponseSDKType {
}
export interface MsgRestoreInterchainAccount {
    creator: string;
    chainId: string;
    connectionId: string;
    accountOwner: string;
}
export interface MsgRestoreInterchainAccountProtoMsg {
    typeUrl: '/stride.stakeibc.MsgRestoreInterchainAccount';
    value: Uint8Array;
}
export interface MsgRestoreInterchainAccountSDKType {
    creator: string;
    chain_id: string;
    connection_id: string;
    account_owner: string;
}
export interface MsgRestoreInterchainAccountResponse {
}
export interface MsgRestoreInterchainAccountResponseProtoMsg {
    typeUrl: '/stride.stakeibc.MsgRestoreInterchainAccountResponse';
    value: Uint8Array;
}
export interface MsgRestoreInterchainAccountResponseSDKType {
}
export interface MsgCloseDelegationChannel {
    creator: string;
    chainId: string;
}
export interface MsgCloseDelegationChannelProtoMsg {
    typeUrl: '/stride.stakeibc.MsgCloseDelegationChannel';
    value: Uint8Array;
}
export interface MsgCloseDelegationChannelSDKType {
    creator: string;
    chain_id: string;
}
export interface MsgCloseDelegationChannelResponse {
}
export interface MsgCloseDelegationChannelResponseProtoMsg {
    typeUrl: '/stride.stakeibc.MsgCloseDelegationChannelResponse';
    value: Uint8Array;
}
export interface MsgCloseDelegationChannelResponseSDKType {
}
export interface MsgUpdateValidatorSharesExchRate {
    creator: string;
    chainId: string;
    valoper: string;
}
export interface MsgUpdateValidatorSharesExchRateProtoMsg {
    typeUrl: '/stride.stakeibc.MsgUpdateValidatorSharesExchRate';
    value: Uint8Array;
}
export interface MsgUpdateValidatorSharesExchRateSDKType {
    creator: string;
    chain_id: string;
    valoper: string;
}
export interface MsgUpdateValidatorSharesExchRateResponse {
}
export interface MsgUpdateValidatorSharesExchRateResponseProtoMsg {
    typeUrl: '/stride.stakeibc.MsgUpdateValidatorSharesExchRateResponse';
    value: Uint8Array;
}
export interface MsgUpdateValidatorSharesExchRateResponseSDKType {
}
export interface MsgCalibrateDelegation {
    creator: string;
    chainId: string;
    valoper: string;
}
export interface MsgCalibrateDelegationProtoMsg {
    typeUrl: '/stride.stakeibc.MsgCalibrateDelegation';
    value: Uint8Array;
}
export interface MsgCalibrateDelegationSDKType {
    creator: string;
    chain_id: string;
    valoper: string;
}
export interface MsgCalibrateDelegationResponse {
}
export interface MsgCalibrateDelegationResponseProtoMsg {
    typeUrl: '/stride.stakeibc.MsgCalibrateDelegationResponse';
    value: Uint8Array;
}
export interface MsgCalibrateDelegationResponseSDKType {
}
export interface MsgResumeHostZone {
    creator: string;
    chainId: string;
}
export interface MsgResumeHostZoneProtoMsg {
    typeUrl: '/stride.stakeibc.MsgResumeHostZone';
    value: Uint8Array;
}
export interface MsgResumeHostZoneSDKType {
    creator: string;
    chain_id: string;
}
export interface MsgResumeHostZoneResponse {
}
export interface MsgResumeHostZoneResponseProtoMsg {
    typeUrl: '/stride.stakeibc.MsgResumeHostZoneResponse';
    value: Uint8Array;
}
export interface MsgResumeHostZoneResponseSDKType {
}
/** Creates a new trade route */
export interface MsgCreateTradeRoute {
    /**
     * authority is the address that controls the module (defaults to x/gov unless
     * overwritten).
     */
    authority: string;
    /** The chain ID of the host zone */
    hostChainId: string;
    /** Connection IDs between stride and the other zones */
    strideToRewardConnectionId: string;
    strideToTradeConnectionId: string;
    /** Transfer channels between the host, reward, and trade zones */
    hostToRewardTransferChannelId: string;
    rewardToTradeTransferChannelId: string;
    tradeToHostTransferChannelId: string;
    /** ibc denom for the reward token on the host zone (e.g. ibc/usdc on dYdX) */
    rewardDenomOnHost: string;
    /** native denom of reward token on the reward zone (e.g. usdc on Noble) */
    rewardDenomOnReward: string;
    /** ibc denom of the reward token on the trade zone (e.g. ibc/usdc on Osmosis) */
    rewardDenomOnTrade: string;
    /** ibc denom of the host's token on the trade zone (e.g. ibc/dydx on Osmosis) */
    hostDenomOnTrade: string;
    /** the host zone's native denom (e.g. dydx on dYdX) */
    hostDenomOnHost: string;
    /**
     * Deprecated, the trades are now executed off-chain via authz
     *
     * The osmosis pool ID
     */
    /** @deprecated */
    poolId: bigint;
    /**
     * Deprecated, the trades are now executed off-chain via authz
     *
     * Threshold defining the percentage of tokens that could be lost in the trade
     * This captures both the loss from slippage and from a stale price on stride
     * "0.05" means the output from the trade can be no less than a 5% deviation
     * from the current value
     */
    /** @deprecated */
    maxAllowedSwapLossRate: string;
    /**
     * Deprecated, the trades are now executed off-chain via authz
     *
     * minimum amount of reward tokens to initate a swap
     * if not provided, defaults to 0
     */
    minSwapAmount: string;
    /**
     * Deprecated, the trades are now executed off-chain via authz
     *
     * maximum amount of reward tokens in a single swap
     * if not provided, defaults to 10e24
     */
    maxSwapAmount: string;
    /**
     * Minimum amount of reward token that must be accumulated before
     * the tokens are transferred to the trade ICA
     */
    minTransferAmount: string;
}
export interface MsgCreateTradeRouteProtoMsg {
    typeUrl: '/stride.stakeibc.MsgCreateTradeRoute';
    value: Uint8Array;
}
/** Creates a new trade route */
export interface MsgCreateTradeRouteSDKType {
    authority: string;
    host_chain_id: string;
    stride_to_reward_connection_id: string;
    stride_to_trade_connection_id: string;
    host_to_reward_transfer_channel_id: string;
    reward_to_trade_transfer_channel_id: string;
    trade_to_host_transfer_channel_id: string;
    reward_denom_on_host: string;
    reward_denom_on_reward: string;
    reward_denom_on_trade: string;
    host_denom_on_trade: string;
    host_denom_on_host: string;
    /** @deprecated */
    pool_id: bigint;
    /** @deprecated */
    max_allowed_swap_loss_rate: string;
    min_swap_amount: string;
    max_swap_amount: string;
    min_transfer_amount: string;
}
export interface MsgCreateTradeRouteResponse {
}
export interface MsgCreateTradeRouteResponseProtoMsg {
    typeUrl: '/stride.stakeibc.MsgCreateTradeRouteResponse';
    value: Uint8Array;
}
export interface MsgCreateTradeRouteResponseSDKType {
}
/** Deletes a trade route */
export interface MsgDeleteTradeRoute {
    /**
     * authority is the address that controls the module (defaults to x/gov unless
     * overwritten).
     */
    authority: string;
    /** The reward denom of the route in it's native form (e.g. usdc) */
    rewardDenom: string;
    /** The host zone's denom in it's native form (e.g. dydx) */
    hostDenom: string;
}
export interface MsgDeleteTradeRouteProtoMsg {
    typeUrl: '/stride.stakeibc.MsgDeleteTradeRoute';
    value: Uint8Array;
}
/** Deletes a trade route */
export interface MsgDeleteTradeRouteSDKType {
    authority: string;
    reward_denom: string;
    host_denom: string;
}
export interface MsgDeleteTradeRouteResponse {
}
export interface MsgDeleteTradeRouteResponseProtoMsg {
    typeUrl: '/stride.stakeibc.MsgDeleteTradeRouteResponse';
    value: Uint8Array;
}
export interface MsgDeleteTradeRouteResponseSDKType {
}
/** Updates the config of a trade route */
export interface MsgUpdateTradeRoute {
    /**
     * authority is the address that controls the module (defaults to x/gov unless
     * overwritten).
     */
    authority: string;
    /** The reward denom of the route in it's native form (e.g. usdc) */
    rewardDenom: string;
    /** The host zone's denom in it's native form (e.g. dydx) */
    hostDenom: string;
    /**
     * Deprecated, the trades are now executed off-chain via authz
     *
     * The osmosis pool ID
     */
    /** @deprecated */
    poolId: bigint;
    /**
     * Deprecated, the trades are now executed off-chain via authz
     *
     * Threshold defining the percentage of tokens that could be lost in the trade
     * This captures both the loss from slippage and from a stale price on stride
     * "0.05" means the output from the trade can be no less than a 5% deviation
     * from the current value
     */
    /** @deprecated */
    maxAllowedSwapLossRate: string;
    /**
     * Deprecated, the trades are now executed off-chain via authz
     *
     * minimum amount of reward tokens to initate a swap
     * if not provided, defaults to 0
     */
    /** @deprecated */
    minSwapAmount: string;
    /**
     * Deprecated, the trades are now executed off-chain via authz
     *
     * maximum amount of reward tokens in a single swap
     * if not provided, defaults to 10e24
     */
    /** @deprecated */
    maxSwapAmount: string;
    /**
     * Minimum amount of reward token that must be accumulated before
     * the tokens are transferred to the trade ICA
     */
    minTransferAmount: string;
}
export interface MsgUpdateTradeRouteProtoMsg {
    typeUrl: '/stride.stakeibc.MsgUpdateTradeRoute';
    value: Uint8Array;
}
/** Updates the config of a trade route */
export interface MsgUpdateTradeRouteSDKType {
    authority: string;
    reward_denom: string;
    host_denom: string;
    /** @deprecated */
    pool_id: bigint;
    /** @deprecated */
    max_allowed_swap_loss_rate: string;
    /** @deprecated */
    min_swap_amount: string;
    /** @deprecated */
    max_swap_amount: string;
    min_transfer_amount: string;
}
export interface MsgUpdateTradeRouteResponse {
}
export interface MsgUpdateTradeRouteResponseProtoMsg {
    typeUrl: '/stride.stakeibc.MsgUpdateTradeRouteResponse';
    value: Uint8Array;
}
export interface MsgUpdateTradeRouteResponseSDKType {
}
/**
 * Registers or updates a community pool rebate by specifying the amount liquid
 * staked
 */
export interface MsgSetCommunityPoolRebate {
    /** Message signer (admin only) */
    creator: string;
    /**
     * Chain id of the chain whose community pool has a liquid staking rebate
     * arrangement with stride
     */
    chainId: string;
    /** Rebate percentage represented as a decimal (e.g. 0.2 for 20%) */
    rebateRate: string;
    /** Number of stTokens recieved by the community pool after liquid staking */
    liquidStakedStTokenAmount: string;
}
export interface MsgSetCommunityPoolRebateProtoMsg {
    typeUrl: '/stride.stakeibc.MsgSetCommunityPoolRebate';
    value: Uint8Array;
}
/**
 * Registers or updates a community pool rebate by specifying the amount liquid
 * staked
 */
export interface MsgSetCommunityPoolRebateSDKType {
    creator: string;
    chain_id: string;
    rebate_rate: string;
    liquid_staked_st_token_amount: string;
}
export interface MsgSetCommunityPoolRebateResponse {
}
export interface MsgSetCommunityPoolRebateResponseProtoMsg {
    typeUrl: '/stride.stakeibc.MsgSetCommunityPoolRebateResponse';
    value: Uint8Array;
}
export interface MsgSetCommunityPoolRebateResponseSDKType {
}
/** Grants or revokes trade permissions to a given address via authz */
export interface MsgToggleTradeController {
    /** Message signer (admin only) */
    creator: string;
    /** Chain ID of the trade account */
    chainId: string;
    /** Permission change (either grant or revoke) */
    permissionChange: AuthzPermissionChange;
    /** Address of trade operator */
    address: string;
    /** Option to grant/revoke the legacy osmosis swap message */
    legacy: boolean;
}
export interface MsgToggleTradeControllerProtoMsg {
    typeUrl: '/stride.stakeibc.MsgToggleTradeController';
    value: Uint8Array;
}
/** Grants or revokes trade permissions to a given address via authz */
export interface MsgToggleTradeControllerSDKType {
    creator: string;
    chain_id: string;
    permission_change: AuthzPermissionChange;
    address: string;
    legacy: boolean;
}
export interface MsgToggleTradeControllerResponse {
}
export interface MsgToggleTradeControllerResponseProtoMsg {
    typeUrl: '/stride.stakeibc.MsgToggleTradeControllerResponse';
    value: Uint8Array;
}
export interface MsgToggleTradeControllerResponseSDKType {
}
/** Updates host zone params */
export interface MsgUpdateHostZoneParams {
    /**
     * authority is the address that controls the module (defaults to x/gov unless
     * overwritten).
     */
    authority: string;
    /** Chain ID of the host zone */
    chainId: string;
    /** Max messages that can be sent in a single ICA message */
    maxMessagesPerIcaTx: bigint;
}
export interface MsgUpdateHostZoneParamsProtoMsg {
    typeUrl: '/stride.stakeibc.MsgUpdateHostZoneParams';
    value: Uint8Array;
}
/** Updates host zone params */
export interface MsgUpdateHostZoneParamsSDKType {
    authority: string;
    chain_id: string;
    max_messages_per_ica_tx: bigint;
}
export interface MsgUpdateHostZoneParamsResponse {
}
export interface MsgUpdateHostZoneParamsResponseProtoMsg {
    typeUrl: '/stride.stakeibc.MsgUpdateHostZoneParamsResponse';
    value: Uint8Array;
}
export interface MsgUpdateHostZoneParamsResponseSDKType {
}
export declare const MsgUpdateInnerRedemptionRateBounds: {
    typeUrl: string;
    encode(message: MsgUpdateInnerRedemptionRateBounds, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgUpdateInnerRedemptionRateBounds;
    fromJSON(object: any): MsgUpdateInnerRedemptionRateBounds;
    toJSON(message: MsgUpdateInnerRedemptionRateBounds): JsonSafe<MsgUpdateInnerRedemptionRateBounds>;
    fromPartial(object: Partial<MsgUpdateInnerRedemptionRateBounds>): MsgUpdateInnerRedemptionRateBounds;
    fromProtoMsg(message: MsgUpdateInnerRedemptionRateBoundsProtoMsg): MsgUpdateInnerRedemptionRateBounds;
    toProto(message: MsgUpdateInnerRedemptionRateBounds): Uint8Array;
    toProtoMsg(message: MsgUpdateInnerRedemptionRateBounds): MsgUpdateInnerRedemptionRateBoundsProtoMsg;
};
export declare const MsgUpdateInnerRedemptionRateBoundsResponse: {
    typeUrl: string;
    encode(_: MsgUpdateInnerRedemptionRateBoundsResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgUpdateInnerRedemptionRateBoundsResponse;
    fromJSON(_: any): MsgUpdateInnerRedemptionRateBoundsResponse;
    toJSON(_: MsgUpdateInnerRedemptionRateBoundsResponse): JsonSafe<MsgUpdateInnerRedemptionRateBoundsResponse>;
    fromPartial(_: Partial<MsgUpdateInnerRedemptionRateBoundsResponse>): MsgUpdateInnerRedemptionRateBoundsResponse;
    fromProtoMsg(message: MsgUpdateInnerRedemptionRateBoundsResponseProtoMsg): MsgUpdateInnerRedemptionRateBoundsResponse;
    toProto(message: MsgUpdateInnerRedemptionRateBoundsResponse): Uint8Array;
    toProtoMsg(message: MsgUpdateInnerRedemptionRateBoundsResponse): MsgUpdateInnerRedemptionRateBoundsResponseProtoMsg;
};
export declare const MsgLiquidStake: {
    typeUrl: string;
    encode(message: MsgLiquidStake, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgLiquidStake;
    fromJSON(object: any): MsgLiquidStake;
    toJSON(message: MsgLiquidStake): JsonSafe<MsgLiquidStake>;
    fromPartial(object: Partial<MsgLiquidStake>): MsgLiquidStake;
    fromProtoMsg(message: MsgLiquidStakeProtoMsg): MsgLiquidStake;
    toProto(message: MsgLiquidStake): Uint8Array;
    toProtoMsg(message: MsgLiquidStake): MsgLiquidStakeProtoMsg;
};
export declare const MsgLiquidStakeResponse: {
    typeUrl: string;
    encode(message: MsgLiquidStakeResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgLiquidStakeResponse;
    fromJSON(object: any): MsgLiquidStakeResponse;
    toJSON(message: MsgLiquidStakeResponse): JsonSafe<MsgLiquidStakeResponse>;
    fromPartial(object: Partial<MsgLiquidStakeResponse>): MsgLiquidStakeResponse;
    fromProtoMsg(message: MsgLiquidStakeResponseProtoMsg): MsgLiquidStakeResponse;
    toProto(message: MsgLiquidStakeResponse): Uint8Array;
    toProtoMsg(message: MsgLiquidStakeResponse): MsgLiquidStakeResponseProtoMsg;
};
export declare const MsgLSMLiquidStake: {
    typeUrl: string;
    encode(message: MsgLSMLiquidStake, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgLSMLiquidStake;
    fromJSON(object: any): MsgLSMLiquidStake;
    toJSON(message: MsgLSMLiquidStake): JsonSafe<MsgLSMLiquidStake>;
    fromPartial(object: Partial<MsgLSMLiquidStake>): MsgLSMLiquidStake;
    fromProtoMsg(message: MsgLSMLiquidStakeProtoMsg): MsgLSMLiquidStake;
    toProto(message: MsgLSMLiquidStake): Uint8Array;
    toProtoMsg(message: MsgLSMLiquidStake): MsgLSMLiquidStakeProtoMsg;
};
export declare const MsgLSMLiquidStakeResponse: {
    typeUrl: string;
    encode(message: MsgLSMLiquidStakeResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgLSMLiquidStakeResponse;
    fromJSON(object: any): MsgLSMLiquidStakeResponse;
    toJSON(message: MsgLSMLiquidStakeResponse): JsonSafe<MsgLSMLiquidStakeResponse>;
    fromPartial(object: Partial<MsgLSMLiquidStakeResponse>): MsgLSMLiquidStakeResponse;
    fromProtoMsg(message: MsgLSMLiquidStakeResponseProtoMsg): MsgLSMLiquidStakeResponse;
    toProto(message: MsgLSMLiquidStakeResponse): Uint8Array;
    toProtoMsg(message: MsgLSMLiquidStakeResponse): MsgLSMLiquidStakeResponseProtoMsg;
};
export declare const MsgClearBalance: {
    typeUrl: string;
    encode(message: MsgClearBalance, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgClearBalance;
    fromJSON(object: any): MsgClearBalance;
    toJSON(message: MsgClearBalance): JsonSafe<MsgClearBalance>;
    fromPartial(object: Partial<MsgClearBalance>): MsgClearBalance;
    fromProtoMsg(message: MsgClearBalanceProtoMsg): MsgClearBalance;
    toProto(message: MsgClearBalance): Uint8Array;
    toProtoMsg(message: MsgClearBalance): MsgClearBalanceProtoMsg;
};
export declare const MsgClearBalanceResponse: {
    typeUrl: string;
    encode(_: MsgClearBalanceResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgClearBalanceResponse;
    fromJSON(_: any): MsgClearBalanceResponse;
    toJSON(_: MsgClearBalanceResponse): JsonSafe<MsgClearBalanceResponse>;
    fromPartial(_: Partial<MsgClearBalanceResponse>): MsgClearBalanceResponse;
    fromProtoMsg(message: MsgClearBalanceResponseProtoMsg): MsgClearBalanceResponse;
    toProto(message: MsgClearBalanceResponse): Uint8Array;
    toProtoMsg(message: MsgClearBalanceResponse): MsgClearBalanceResponseProtoMsg;
};
export declare const MsgRedeemStake: {
    typeUrl: string;
    encode(message: MsgRedeemStake, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgRedeemStake;
    fromJSON(object: any): MsgRedeemStake;
    toJSON(message: MsgRedeemStake): JsonSafe<MsgRedeemStake>;
    fromPartial(object: Partial<MsgRedeemStake>): MsgRedeemStake;
    fromProtoMsg(message: MsgRedeemStakeProtoMsg): MsgRedeemStake;
    toProto(message: MsgRedeemStake): Uint8Array;
    toProtoMsg(message: MsgRedeemStake): MsgRedeemStakeProtoMsg;
};
export declare const MsgRedeemStakeResponse: {
    typeUrl: string;
    encode(_: MsgRedeemStakeResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgRedeemStakeResponse;
    fromJSON(_: any): MsgRedeemStakeResponse;
    toJSON(_: MsgRedeemStakeResponse): JsonSafe<MsgRedeemStakeResponse>;
    fromPartial(_: Partial<MsgRedeemStakeResponse>): MsgRedeemStakeResponse;
    fromProtoMsg(message: MsgRedeemStakeResponseProtoMsg): MsgRedeemStakeResponse;
    toProto(message: MsgRedeemStakeResponse): Uint8Array;
    toProtoMsg(message: MsgRedeemStakeResponse): MsgRedeemStakeResponseProtoMsg;
};
export declare const MsgRegisterHostZone: {
    typeUrl: string;
    encode(message: MsgRegisterHostZone, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgRegisterHostZone;
    fromJSON(object: any): MsgRegisterHostZone;
    toJSON(message: MsgRegisterHostZone): JsonSafe<MsgRegisterHostZone>;
    fromPartial(object: Partial<MsgRegisterHostZone>): MsgRegisterHostZone;
    fromProtoMsg(message: MsgRegisterHostZoneProtoMsg): MsgRegisterHostZone;
    toProto(message: MsgRegisterHostZone): Uint8Array;
    toProtoMsg(message: MsgRegisterHostZone): MsgRegisterHostZoneProtoMsg;
};
export declare const MsgRegisterHostZoneResponse: {
    typeUrl: string;
    encode(_: MsgRegisterHostZoneResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgRegisterHostZoneResponse;
    fromJSON(_: any): MsgRegisterHostZoneResponse;
    toJSON(_: MsgRegisterHostZoneResponse): JsonSafe<MsgRegisterHostZoneResponse>;
    fromPartial(_: Partial<MsgRegisterHostZoneResponse>): MsgRegisterHostZoneResponse;
    fromProtoMsg(message: MsgRegisterHostZoneResponseProtoMsg): MsgRegisterHostZoneResponse;
    toProto(message: MsgRegisterHostZoneResponse): Uint8Array;
    toProtoMsg(message: MsgRegisterHostZoneResponse): MsgRegisterHostZoneResponseProtoMsg;
};
export declare const MsgClaimUndelegatedTokens: {
    typeUrl: string;
    encode(message: MsgClaimUndelegatedTokens, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgClaimUndelegatedTokens;
    fromJSON(object: any): MsgClaimUndelegatedTokens;
    toJSON(message: MsgClaimUndelegatedTokens): JsonSafe<MsgClaimUndelegatedTokens>;
    fromPartial(object: Partial<MsgClaimUndelegatedTokens>): MsgClaimUndelegatedTokens;
    fromProtoMsg(message: MsgClaimUndelegatedTokensProtoMsg): MsgClaimUndelegatedTokens;
    toProto(message: MsgClaimUndelegatedTokens): Uint8Array;
    toProtoMsg(message: MsgClaimUndelegatedTokens): MsgClaimUndelegatedTokensProtoMsg;
};
export declare const MsgClaimUndelegatedTokensResponse: {
    typeUrl: string;
    encode(_: MsgClaimUndelegatedTokensResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgClaimUndelegatedTokensResponse;
    fromJSON(_: any): MsgClaimUndelegatedTokensResponse;
    toJSON(_: MsgClaimUndelegatedTokensResponse): JsonSafe<MsgClaimUndelegatedTokensResponse>;
    fromPartial(_: Partial<MsgClaimUndelegatedTokensResponse>): MsgClaimUndelegatedTokensResponse;
    fromProtoMsg(message: MsgClaimUndelegatedTokensResponseProtoMsg): MsgClaimUndelegatedTokensResponse;
    toProto(message: MsgClaimUndelegatedTokensResponse): Uint8Array;
    toProtoMsg(message: MsgClaimUndelegatedTokensResponse): MsgClaimUndelegatedTokensResponseProtoMsg;
};
export declare const MsgRebalanceValidators: {
    typeUrl: string;
    encode(message: MsgRebalanceValidators, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgRebalanceValidators;
    fromJSON(object: any): MsgRebalanceValidators;
    toJSON(message: MsgRebalanceValidators): JsonSafe<MsgRebalanceValidators>;
    fromPartial(object: Partial<MsgRebalanceValidators>): MsgRebalanceValidators;
    fromProtoMsg(message: MsgRebalanceValidatorsProtoMsg): MsgRebalanceValidators;
    toProto(message: MsgRebalanceValidators): Uint8Array;
    toProtoMsg(message: MsgRebalanceValidators): MsgRebalanceValidatorsProtoMsg;
};
export declare const MsgRebalanceValidatorsResponse: {
    typeUrl: string;
    encode(_: MsgRebalanceValidatorsResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgRebalanceValidatorsResponse;
    fromJSON(_: any): MsgRebalanceValidatorsResponse;
    toJSON(_: MsgRebalanceValidatorsResponse): JsonSafe<MsgRebalanceValidatorsResponse>;
    fromPartial(_: Partial<MsgRebalanceValidatorsResponse>): MsgRebalanceValidatorsResponse;
    fromProtoMsg(message: MsgRebalanceValidatorsResponseProtoMsg): MsgRebalanceValidatorsResponse;
    toProto(message: MsgRebalanceValidatorsResponse): Uint8Array;
    toProtoMsg(message: MsgRebalanceValidatorsResponse): MsgRebalanceValidatorsResponseProtoMsg;
};
export declare const MsgAddValidators: {
    typeUrl: string;
    encode(message: MsgAddValidators, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgAddValidators;
    fromJSON(object: any): MsgAddValidators;
    toJSON(message: MsgAddValidators): JsonSafe<MsgAddValidators>;
    fromPartial(object: Partial<MsgAddValidators>): MsgAddValidators;
    fromProtoMsg(message: MsgAddValidatorsProtoMsg): MsgAddValidators;
    toProto(message: MsgAddValidators): Uint8Array;
    toProtoMsg(message: MsgAddValidators): MsgAddValidatorsProtoMsg;
};
export declare const MsgAddValidatorsResponse: {
    typeUrl: string;
    encode(_: MsgAddValidatorsResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgAddValidatorsResponse;
    fromJSON(_: any): MsgAddValidatorsResponse;
    toJSON(_: MsgAddValidatorsResponse): JsonSafe<MsgAddValidatorsResponse>;
    fromPartial(_: Partial<MsgAddValidatorsResponse>): MsgAddValidatorsResponse;
    fromProtoMsg(message: MsgAddValidatorsResponseProtoMsg): MsgAddValidatorsResponse;
    toProto(message: MsgAddValidatorsResponse): Uint8Array;
    toProtoMsg(message: MsgAddValidatorsResponse): MsgAddValidatorsResponseProtoMsg;
};
export declare const ValidatorWeight: {
    typeUrl: string;
    encode(message: ValidatorWeight, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): ValidatorWeight;
    fromJSON(object: any): ValidatorWeight;
    toJSON(message: ValidatorWeight): JsonSafe<ValidatorWeight>;
    fromPartial(object: Partial<ValidatorWeight>): ValidatorWeight;
    fromProtoMsg(message: ValidatorWeightProtoMsg): ValidatorWeight;
    toProto(message: ValidatorWeight): Uint8Array;
    toProtoMsg(message: ValidatorWeight): ValidatorWeightProtoMsg;
};
export declare const MsgChangeValidatorWeights: {
    typeUrl: string;
    encode(message: MsgChangeValidatorWeights, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgChangeValidatorWeights;
    fromJSON(object: any): MsgChangeValidatorWeights;
    toJSON(message: MsgChangeValidatorWeights): JsonSafe<MsgChangeValidatorWeights>;
    fromPartial(object: Partial<MsgChangeValidatorWeights>): MsgChangeValidatorWeights;
    fromProtoMsg(message: MsgChangeValidatorWeightsProtoMsg): MsgChangeValidatorWeights;
    toProto(message: MsgChangeValidatorWeights): Uint8Array;
    toProtoMsg(message: MsgChangeValidatorWeights): MsgChangeValidatorWeightsProtoMsg;
};
export declare const MsgChangeValidatorWeightsResponse: {
    typeUrl: string;
    encode(_: MsgChangeValidatorWeightsResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgChangeValidatorWeightsResponse;
    fromJSON(_: any): MsgChangeValidatorWeightsResponse;
    toJSON(_: MsgChangeValidatorWeightsResponse): JsonSafe<MsgChangeValidatorWeightsResponse>;
    fromPartial(_: Partial<MsgChangeValidatorWeightsResponse>): MsgChangeValidatorWeightsResponse;
    fromProtoMsg(message: MsgChangeValidatorWeightsResponseProtoMsg): MsgChangeValidatorWeightsResponse;
    toProto(message: MsgChangeValidatorWeightsResponse): Uint8Array;
    toProtoMsg(message: MsgChangeValidatorWeightsResponse): MsgChangeValidatorWeightsResponseProtoMsg;
};
export declare const MsgDeleteValidator: {
    typeUrl: string;
    encode(message: MsgDeleteValidator, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgDeleteValidator;
    fromJSON(object: any): MsgDeleteValidator;
    toJSON(message: MsgDeleteValidator): JsonSafe<MsgDeleteValidator>;
    fromPartial(object: Partial<MsgDeleteValidator>): MsgDeleteValidator;
    fromProtoMsg(message: MsgDeleteValidatorProtoMsg): MsgDeleteValidator;
    toProto(message: MsgDeleteValidator): Uint8Array;
    toProtoMsg(message: MsgDeleteValidator): MsgDeleteValidatorProtoMsg;
};
export declare const MsgDeleteValidatorResponse: {
    typeUrl: string;
    encode(_: MsgDeleteValidatorResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgDeleteValidatorResponse;
    fromJSON(_: any): MsgDeleteValidatorResponse;
    toJSON(_: MsgDeleteValidatorResponse): JsonSafe<MsgDeleteValidatorResponse>;
    fromPartial(_: Partial<MsgDeleteValidatorResponse>): MsgDeleteValidatorResponse;
    fromProtoMsg(message: MsgDeleteValidatorResponseProtoMsg): MsgDeleteValidatorResponse;
    toProto(message: MsgDeleteValidatorResponse): Uint8Array;
    toProtoMsg(message: MsgDeleteValidatorResponse): MsgDeleteValidatorResponseProtoMsg;
};
export declare const MsgRestoreInterchainAccount: {
    typeUrl: string;
    encode(message: MsgRestoreInterchainAccount, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgRestoreInterchainAccount;
    fromJSON(object: any): MsgRestoreInterchainAccount;
    toJSON(message: MsgRestoreInterchainAccount): JsonSafe<MsgRestoreInterchainAccount>;
    fromPartial(object: Partial<MsgRestoreInterchainAccount>): MsgRestoreInterchainAccount;
    fromProtoMsg(message: MsgRestoreInterchainAccountProtoMsg): MsgRestoreInterchainAccount;
    toProto(message: MsgRestoreInterchainAccount): Uint8Array;
    toProtoMsg(message: MsgRestoreInterchainAccount): MsgRestoreInterchainAccountProtoMsg;
};
export declare const MsgRestoreInterchainAccountResponse: {
    typeUrl: string;
    encode(_: MsgRestoreInterchainAccountResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgRestoreInterchainAccountResponse;
    fromJSON(_: any): MsgRestoreInterchainAccountResponse;
    toJSON(_: MsgRestoreInterchainAccountResponse): JsonSafe<MsgRestoreInterchainAccountResponse>;
    fromPartial(_: Partial<MsgRestoreInterchainAccountResponse>): MsgRestoreInterchainAccountResponse;
    fromProtoMsg(message: MsgRestoreInterchainAccountResponseProtoMsg): MsgRestoreInterchainAccountResponse;
    toProto(message: MsgRestoreInterchainAccountResponse): Uint8Array;
    toProtoMsg(message: MsgRestoreInterchainAccountResponse): MsgRestoreInterchainAccountResponseProtoMsg;
};
export declare const MsgCloseDelegationChannel: {
    typeUrl: string;
    encode(message: MsgCloseDelegationChannel, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgCloseDelegationChannel;
    fromJSON(object: any): MsgCloseDelegationChannel;
    toJSON(message: MsgCloseDelegationChannel): JsonSafe<MsgCloseDelegationChannel>;
    fromPartial(object: Partial<MsgCloseDelegationChannel>): MsgCloseDelegationChannel;
    fromProtoMsg(message: MsgCloseDelegationChannelProtoMsg): MsgCloseDelegationChannel;
    toProto(message: MsgCloseDelegationChannel): Uint8Array;
    toProtoMsg(message: MsgCloseDelegationChannel): MsgCloseDelegationChannelProtoMsg;
};
export declare const MsgCloseDelegationChannelResponse: {
    typeUrl: string;
    encode(_: MsgCloseDelegationChannelResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgCloseDelegationChannelResponse;
    fromJSON(_: any): MsgCloseDelegationChannelResponse;
    toJSON(_: MsgCloseDelegationChannelResponse): JsonSafe<MsgCloseDelegationChannelResponse>;
    fromPartial(_: Partial<MsgCloseDelegationChannelResponse>): MsgCloseDelegationChannelResponse;
    fromProtoMsg(message: MsgCloseDelegationChannelResponseProtoMsg): MsgCloseDelegationChannelResponse;
    toProto(message: MsgCloseDelegationChannelResponse): Uint8Array;
    toProtoMsg(message: MsgCloseDelegationChannelResponse): MsgCloseDelegationChannelResponseProtoMsg;
};
export declare const MsgUpdateValidatorSharesExchRate: {
    typeUrl: string;
    encode(message: MsgUpdateValidatorSharesExchRate, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgUpdateValidatorSharesExchRate;
    fromJSON(object: any): MsgUpdateValidatorSharesExchRate;
    toJSON(message: MsgUpdateValidatorSharesExchRate): JsonSafe<MsgUpdateValidatorSharesExchRate>;
    fromPartial(object: Partial<MsgUpdateValidatorSharesExchRate>): MsgUpdateValidatorSharesExchRate;
    fromProtoMsg(message: MsgUpdateValidatorSharesExchRateProtoMsg): MsgUpdateValidatorSharesExchRate;
    toProto(message: MsgUpdateValidatorSharesExchRate): Uint8Array;
    toProtoMsg(message: MsgUpdateValidatorSharesExchRate): MsgUpdateValidatorSharesExchRateProtoMsg;
};
export declare const MsgUpdateValidatorSharesExchRateResponse: {
    typeUrl: string;
    encode(_: MsgUpdateValidatorSharesExchRateResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgUpdateValidatorSharesExchRateResponse;
    fromJSON(_: any): MsgUpdateValidatorSharesExchRateResponse;
    toJSON(_: MsgUpdateValidatorSharesExchRateResponse): JsonSafe<MsgUpdateValidatorSharesExchRateResponse>;
    fromPartial(_: Partial<MsgUpdateValidatorSharesExchRateResponse>): MsgUpdateValidatorSharesExchRateResponse;
    fromProtoMsg(message: MsgUpdateValidatorSharesExchRateResponseProtoMsg): MsgUpdateValidatorSharesExchRateResponse;
    toProto(message: MsgUpdateValidatorSharesExchRateResponse): Uint8Array;
    toProtoMsg(message: MsgUpdateValidatorSharesExchRateResponse): MsgUpdateValidatorSharesExchRateResponseProtoMsg;
};
export declare const MsgCalibrateDelegation: {
    typeUrl: string;
    encode(message: MsgCalibrateDelegation, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgCalibrateDelegation;
    fromJSON(object: any): MsgCalibrateDelegation;
    toJSON(message: MsgCalibrateDelegation): JsonSafe<MsgCalibrateDelegation>;
    fromPartial(object: Partial<MsgCalibrateDelegation>): MsgCalibrateDelegation;
    fromProtoMsg(message: MsgCalibrateDelegationProtoMsg): MsgCalibrateDelegation;
    toProto(message: MsgCalibrateDelegation): Uint8Array;
    toProtoMsg(message: MsgCalibrateDelegation): MsgCalibrateDelegationProtoMsg;
};
export declare const MsgCalibrateDelegationResponse: {
    typeUrl: string;
    encode(_: MsgCalibrateDelegationResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgCalibrateDelegationResponse;
    fromJSON(_: any): MsgCalibrateDelegationResponse;
    toJSON(_: MsgCalibrateDelegationResponse): JsonSafe<MsgCalibrateDelegationResponse>;
    fromPartial(_: Partial<MsgCalibrateDelegationResponse>): MsgCalibrateDelegationResponse;
    fromProtoMsg(message: MsgCalibrateDelegationResponseProtoMsg): MsgCalibrateDelegationResponse;
    toProto(message: MsgCalibrateDelegationResponse): Uint8Array;
    toProtoMsg(message: MsgCalibrateDelegationResponse): MsgCalibrateDelegationResponseProtoMsg;
};
export declare const MsgResumeHostZone: {
    typeUrl: string;
    encode(message: MsgResumeHostZone, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgResumeHostZone;
    fromJSON(object: any): MsgResumeHostZone;
    toJSON(message: MsgResumeHostZone): JsonSafe<MsgResumeHostZone>;
    fromPartial(object: Partial<MsgResumeHostZone>): MsgResumeHostZone;
    fromProtoMsg(message: MsgResumeHostZoneProtoMsg): MsgResumeHostZone;
    toProto(message: MsgResumeHostZone): Uint8Array;
    toProtoMsg(message: MsgResumeHostZone): MsgResumeHostZoneProtoMsg;
};
export declare const MsgResumeHostZoneResponse: {
    typeUrl: string;
    encode(_: MsgResumeHostZoneResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgResumeHostZoneResponse;
    fromJSON(_: any): MsgResumeHostZoneResponse;
    toJSON(_: MsgResumeHostZoneResponse): JsonSafe<MsgResumeHostZoneResponse>;
    fromPartial(_: Partial<MsgResumeHostZoneResponse>): MsgResumeHostZoneResponse;
    fromProtoMsg(message: MsgResumeHostZoneResponseProtoMsg): MsgResumeHostZoneResponse;
    toProto(message: MsgResumeHostZoneResponse): Uint8Array;
    toProtoMsg(message: MsgResumeHostZoneResponse): MsgResumeHostZoneResponseProtoMsg;
};
export declare const MsgCreateTradeRoute: {
    typeUrl: string;
    encode(message: MsgCreateTradeRoute, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgCreateTradeRoute;
    fromJSON(object: any): MsgCreateTradeRoute;
    toJSON(message: MsgCreateTradeRoute): JsonSafe<MsgCreateTradeRoute>;
    fromPartial(object: Partial<MsgCreateTradeRoute>): MsgCreateTradeRoute;
    fromProtoMsg(message: MsgCreateTradeRouteProtoMsg): MsgCreateTradeRoute;
    toProto(message: MsgCreateTradeRoute): Uint8Array;
    toProtoMsg(message: MsgCreateTradeRoute): MsgCreateTradeRouteProtoMsg;
};
export declare const MsgCreateTradeRouteResponse: {
    typeUrl: string;
    encode(_: MsgCreateTradeRouteResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgCreateTradeRouteResponse;
    fromJSON(_: any): MsgCreateTradeRouteResponse;
    toJSON(_: MsgCreateTradeRouteResponse): JsonSafe<MsgCreateTradeRouteResponse>;
    fromPartial(_: Partial<MsgCreateTradeRouteResponse>): MsgCreateTradeRouteResponse;
    fromProtoMsg(message: MsgCreateTradeRouteResponseProtoMsg): MsgCreateTradeRouteResponse;
    toProto(message: MsgCreateTradeRouteResponse): Uint8Array;
    toProtoMsg(message: MsgCreateTradeRouteResponse): MsgCreateTradeRouteResponseProtoMsg;
};
export declare const MsgDeleteTradeRoute: {
    typeUrl: string;
    encode(message: MsgDeleteTradeRoute, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgDeleteTradeRoute;
    fromJSON(object: any): MsgDeleteTradeRoute;
    toJSON(message: MsgDeleteTradeRoute): JsonSafe<MsgDeleteTradeRoute>;
    fromPartial(object: Partial<MsgDeleteTradeRoute>): MsgDeleteTradeRoute;
    fromProtoMsg(message: MsgDeleteTradeRouteProtoMsg): MsgDeleteTradeRoute;
    toProto(message: MsgDeleteTradeRoute): Uint8Array;
    toProtoMsg(message: MsgDeleteTradeRoute): MsgDeleteTradeRouteProtoMsg;
};
export declare const MsgDeleteTradeRouteResponse: {
    typeUrl: string;
    encode(_: MsgDeleteTradeRouteResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgDeleteTradeRouteResponse;
    fromJSON(_: any): MsgDeleteTradeRouteResponse;
    toJSON(_: MsgDeleteTradeRouteResponse): JsonSafe<MsgDeleteTradeRouteResponse>;
    fromPartial(_: Partial<MsgDeleteTradeRouteResponse>): MsgDeleteTradeRouteResponse;
    fromProtoMsg(message: MsgDeleteTradeRouteResponseProtoMsg): MsgDeleteTradeRouteResponse;
    toProto(message: MsgDeleteTradeRouteResponse): Uint8Array;
    toProtoMsg(message: MsgDeleteTradeRouteResponse): MsgDeleteTradeRouteResponseProtoMsg;
};
export declare const MsgUpdateTradeRoute: {
    typeUrl: string;
    encode(message: MsgUpdateTradeRoute, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgUpdateTradeRoute;
    fromJSON(object: any): MsgUpdateTradeRoute;
    toJSON(message: MsgUpdateTradeRoute): JsonSafe<MsgUpdateTradeRoute>;
    fromPartial(object: Partial<MsgUpdateTradeRoute>): MsgUpdateTradeRoute;
    fromProtoMsg(message: MsgUpdateTradeRouteProtoMsg): MsgUpdateTradeRoute;
    toProto(message: MsgUpdateTradeRoute): Uint8Array;
    toProtoMsg(message: MsgUpdateTradeRoute): MsgUpdateTradeRouteProtoMsg;
};
export declare const MsgUpdateTradeRouteResponse: {
    typeUrl: string;
    encode(_: MsgUpdateTradeRouteResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgUpdateTradeRouteResponse;
    fromJSON(_: any): MsgUpdateTradeRouteResponse;
    toJSON(_: MsgUpdateTradeRouteResponse): JsonSafe<MsgUpdateTradeRouteResponse>;
    fromPartial(_: Partial<MsgUpdateTradeRouteResponse>): MsgUpdateTradeRouteResponse;
    fromProtoMsg(message: MsgUpdateTradeRouteResponseProtoMsg): MsgUpdateTradeRouteResponse;
    toProto(message: MsgUpdateTradeRouteResponse): Uint8Array;
    toProtoMsg(message: MsgUpdateTradeRouteResponse): MsgUpdateTradeRouteResponseProtoMsg;
};
export declare const MsgSetCommunityPoolRebate: {
    typeUrl: string;
    encode(message: MsgSetCommunityPoolRebate, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgSetCommunityPoolRebate;
    fromJSON(object: any): MsgSetCommunityPoolRebate;
    toJSON(message: MsgSetCommunityPoolRebate): JsonSafe<MsgSetCommunityPoolRebate>;
    fromPartial(object: Partial<MsgSetCommunityPoolRebate>): MsgSetCommunityPoolRebate;
    fromProtoMsg(message: MsgSetCommunityPoolRebateProtoMsg): MsgSetCommunityPoolRebate;
    toProto(message: MsgSetCommunityPoolRebate): Uint8Array;
    toProtoMsg(message: MsgSetCommunityPoolRebate): MsgSetCommunityPoolRebateProtoMsg;
};
export declare const MsgSetCommunityPoolRebateResponse: {
    typeUrl: string;
    encode(_: MsgSetCommunityPoolRebateResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgSetCommunityPoolRebateResponse;
    fromJSON(_: any): MsgSetCommunityPoolRebateResponse;
    toJSON(_: MsgSetCommunityPoolRebateResponse): JsonSafe<MsgSetCommunityPoolRebateResponse>;
    fromPartial(_: Partial<MsgSetCommunityPoolRebateResponse>): MsgSetCommunityPoolRebateResponse;
    fromProtoMsg(message: MsgSetCommunityPoolRebateResponseProtoMsg): MsgSetCommunityPoolRebateResponse;
    toProto(message: MsgSetCommunityPoolRebateResponse): Uint8Array;
    toProtoMsg(message: MsgSetCommunityPoolRebateResponse): MsgSetCommunityPoolRebateResponseProtoMsg;
};
export declare const MsgToggleTradeController: {
    typeUrl: string;
    encode(message: MsgToggleTradeController, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgToggleTradeController;
    fromJSON(object: any): MsgToggleTradeController;
    toJSON(message: MsgToggleTradeController): JsonSafe<MsgToggleTradeController>;
    fromPartial(object: Partial<MsgToggleTradeController>): MsgToggleTradeController;
    fromProtoMsg(message: MsgToggleTradeControllerProtoMsg): MsgToggleTradeController;
    toProto(message: MsgToggleTradeController): Uint8Array;
    toProtoMsg(message: MsgToggleTradeController): MsgToggleTradeControllerProtoMsg;
};
export declare const MsgToggleTradeControllerResponse: {
    typeUrl: string;
    encode(_: MsgToggleTradeControllerResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgToggleTradeControllerResponse;
    fromJSON(_: any): MsgToggleTradeControllerResponse;
    toJSON(_: MsgToggleTradeControllerResponse): JsonSafe<MsgToggleTradeControllerResponse>;
    fromPartial(_: Partial<MsgToggleTradeControllerResponse>): MsgToggleTradeControllerResponse;
    fromProtoMsg(message: MsgToggleTradeControllerResponseProtoMsg): MsgToggleTradeControllerResponse;
    toProto(message: MsgToggleTradeControllerResponse): Uint8Array;
    toProtoMsg(message: MsgToggleTradeControllerResponse): MsgToggleTradeControllerResponseProtoMsg;
};
export declare const MsgUpdateHostZoneParams: {
    typeUrl: string;
    encode(message: MsgUpdateHostZoneParams, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgUpdateHostZoneParams;
    fromJSON(object: any): MsgUpdateHostZoneParams;
    toJSON(message: MsgUpdateHostZoneParams): JsonSafe<MsgUpdateHostZoneParams>;
    fromPartial(object: Partial<MsgUpdateHostZoneParams>): MsgUpdateHostZoneParams;
    fromProtoMsg(message: MsgUpdateHostZoneParamsProtoMsg): MsgUpdateHostZoneParams;
    toProto(message: MsgUpdateHostZoneParams): Uint8Array;
    toProtoMsg(message: MsgUpdateHostZoneParams): MsgUpdateHostZoneParamsProtoMsg;
};
export declare const MsgUpdateHostZoneParamsResponse: {
    typeUrl: string;
    encode(_: MsgUpdateHostZoneParamsResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgUpdateHostZoneParamsResponse;
    fromJSON(_: any): MsgUpdateHostZoneParamsResponse;
    toJSON(_: MsgUpdateHostZoneParamsResponse): JsonSafe<MsgUpdateHostZoneParamsResponse>;
    fromPartial(_: Partial<MsgUpdateHostZoneParamsResponse>): MsgUpdateHostZoneParamsResponse;
    fromProtoMsg(message: MsgUpdateHostZoneParamsResponseProtoMsg): MsgUpdateHostZoneParamsResponse;
    toProto(message: MsgUpdateHostZoneParamsResponse): Uint8Array;
    toProtoMsg(message: MsgUpdateHostZoneParamsResponse): MsgUpdateHostZoneParamsResponseProtoMsg;
};
