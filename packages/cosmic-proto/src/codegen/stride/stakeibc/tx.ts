//@ts-nocheck
import { Validator, type ValidatorSDKType } from './validator.js';
import { Coin, type CoinSDKType } from '../../cosmos/base/v1beta1/coin.js';
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { Decimal, isSet } from '../../helpers.js';
import { type JsonSafe } from '../../json-safe.js';
export enum AuthzPermissionChange {
  /** GRANT - Grant the address trade permissions */
  GRANT = 0,
  /** REVOKE - Revoke trade permissions from the address */
  REVOKE = 1,
  UNRECOGNIZED = -1,
}
export const AuthzPermissionChangeSDKType = AuthzPermissionChange;
export function authzPermissionChangeFromJSON(
  object: any,
): AuthzPermissionChange {
  switch (object) {
    case 0:
    case 'GRANT':
      return AuthzPermissionChange.GRANT;
    case 1:
    case 'REVOKE':
      return AuthzPermissionChange.REVOKE;
    case -1:
    case 'UNRECOGNIZED':
    default:
      return AuthzPermissionChange.UNRECOGNIZED;
  }
}
export function authzPermissionChangeToJSON(
  object: AuthzPermissionChange,
): string {
  switch (object) {
    case AuthzPermissionChange.GRANT:
      return 'GRANT';
    case AuthzPermissionChange.REVOKE:
      return 'REVOKE';
    case AuthzPermissionChange.UNRECOGNIZED:
    default:
      return 'UNRECOGNIZED';
  }
}
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
export interface MsgUpdateInnerRedemptionRateBoundsResponse {}
export interface MsgUpdateInnerRedemptionRateBoundsResponseProtoMsg {
  typeUrl: '/stride.stakeibc.MsgUpdateInnerRedemptionRateBoundsResponse';
  value: Uint8Array;
}
export interface MsgUpdateInnerRedemptionRateBoundsResponseSDKType {}
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
export interface MsgClearBalanceResponse {}
export interface MsgClearBalanceResponseProtoMsg {
  typeUrl: '/stride.stakeibc.MsgClearBalanceResponse';
  value: Uint8Array;
}
export interface MsgClearBalanceResponseSDKType {}
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
export interface MsgRedeemStakeResponse {}
export interface MsgRedeemStakeResponseProtoMsg {
  typeUrl: '/stride.stakeibc.MsgRedeemStakeResponse';
  value: Uint8Array;
}
export interface MsgRedeemStakeResponseSDKType {}
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
export interface MsgRegisterHostZoneResponse {}
export interface MsgRegisterHostZoneResponseProtoMsg {
  typeUrl: '/stride.stakeibc.MsgRegisterHostZoneResponse';
  value: Uint8Array;
}
export interface MsgRegisterHostZoneResponseSDKType {}
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
export interface MsgClaimUndelegatedTokensResponse {}
export interface MsgClaimUndelegatedTokensResponseProtoMsg {
  typeUrl: '/stride.stakeibc.MsgClaimUndelegatedTokensResponse';
  value: Uint8Array;
}
export interface MsgClaimUndelegatedTokensResponseSDKType {}
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
export interface MsgRebalanceValidatorsResponse {}
export interface MsgRebalanceValidatorsResponseProtoMsg {
  typeUrl: '/stride.stakeibc.MsgRebalanceValidatorsResponse';
  value: Uint8Array;
}
export interface MsgRebalanceValidatorsResponseSDKType {}
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
export interface MsgAddValidatorsResponse {}
export interface MsgAddValidatorsResponseProtoMsg {
  typeUrl: '/stride.stakeibc.MsgAddValidatorsResponse';
  value: Uint8Array;
}
export interface MsgAddValidatorsResponseSDKType {}
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
export interface MsgChangeValidatorWeightsResponse {}
export interface MsgChangeValidatorWeightsResponseProtoMsg {
  typeUrl: '/stride.stakeibc.MsgChangeValidatorWeightsResponse';
  value: Uint8Array;
}
export interface MsgChangeValidatorWeightsResponseSDKType {}
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
export interface MsgDeleteValidatorResponse {}
export interface MsgDeleteValidatorResponseProtoMsg {
  typeUrl: '/stride.stakeibc.MsgDeleteValidatorResponse';
  value: Uint8Array;
}
export interface MsgDeleteValidatorResponseSDKType {}
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
export interface MsgRestoreInterchainAccountResponse {}
export interface MsgRestoreInterchainAccountResponseProtoMsg {
  typeUrl: '/stride.stakeibc.MsgRestoreInterchainAccountResponse';
  value: Uint8Array;
}
export interface MsgRestoreInterchainAccountResponseSDKType {}
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
export interface MsgCloseDelegationChannelResponse {}
export interface MsgCloseDelegationChannelResponseProtoMsg {
  typeUrl: '/stride.stakeibc.MsgCloseDelegationChannelResponse';
  value: Uint8Array;
}
export interface MsgCloseDelegationChannelResponseSDKType {}
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
export interface MsgUpdateValidatorSharesExchRateResponse {}
export interface MsgUpdateValidatorSharesExchRateResponseProtoMsg {
  typeUrl: '/stride.stakeibc.MsgUpdateValidatorSharesExchRateResponse';
  value: Uint8Array;
}
export interface MsgUpdateValidatorSharesExchRateResponseSDKType {}
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
export interface MsgCalibrateDelegationResponse {}
export interface MsgCalibrateDelegationResponseProtoMsg {
  typeUrl: '/stride.stakeibc.MsgCalibrateDelegationResponse';
  value: Uint8Array;
}
export interface MsgCalibrateDelegationResponseSDKType {}
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
export interface MsgResumeHostZoneResponse {}
export interface MsgResumeHostZoneResponseProtoMsg {
  typeUrl: '/stride.stakeibc.MsgResumeHostZoneResponse';
  value: Uint8Array;
}
export interface MsgResumeHostZoneResponseSDKType {}
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
export interface MsgCreateTradeRouteResponse {}
export interface MsgCreateTradeRouteResponseProtoMsg {
  typeUrl: '/stride.stakeibc.MsgCreateTradeRouteResponse';
  value: Uint8Array;
}
export interface MsgCreateTradeRouteResponseSDKType {}
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
export interface MsgDeleteTradeRouteResponse {}
export interface MsgDeleteTradeRouteResponseProtoMsg {
  typeUrl: '/stride.stakeibc.MsgDeleteTradeRouteResponse';
  value: Uint8Array;
}
export interface MsgDeleteTradeRouteResponseSDKType {}
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
export interface MsgUpdateTradeRouteResponse {}
export interface MsgUpdateTradeRouteResponseProtoMsg {
  typeUrl: '/stride.stakeibc.MsgUpdateTradeRouteResponse';
  value: Uint8Array;
}
export interface MsgUpdateTradeRouteResponseSDKType {}
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
export interface MsgSetCommunityPoolRebateResponse {}
export interface MsgSetCommunityPoolRebateResponseProtoMsg {
  typeUrl: '/stride.stakeibc.MsgSetCommunityPoolRebateResponse';
  value: Uint8Array;
}
export interface MsgSetCommunityPoolRebateResponseSDKType {}
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
export interface MsgToggleTradeControllerResponse {}
export interface MsgToggleTradeControllerResponseProtoMsg {
  typeUrl: '/stride.stakeibc.MsgToggleTradeControllerResponse';
  value: Uint8Array;
}
export interface MsgToggleTradeControllerResponseSDKType {}
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
export interface MsgUpdateHostZoneParamsResponse {}
export interface MsgUpdateHostZoneParamsResponseProtoMsg {
  typeUrl: '/stride.stakeibc.MsgUpdateHostZoneParamsResponse';
  value: Uint8Array;
}
export interface MsgUpdateHostZoneParamsResponseSDKType {}
function createBaseMsgUpdateInnerRedemptionRateBounds(): MsgUpdateInnerRedemptionRateBounds {
  return {
    creator: '',
    chainId: '',
    minInnerRedemptionRate: '',
    maxInnerRedemptionRate: '',
  };
}
export const MsgUpdateInnerRedemptionRateBounds = {
  typeUrl: '/stride.stakeibc.MsgUpdateInnerRedemptionRateBounds',
  encode(
    message: MsgUpdateInnerRedemptionRateBounds,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.creator !== '') {
      writer.uint32(10).string(message.creator);
    }
    if (message.chainId !== '') {
      writer.uint32(18).string(message.chainId);
    }
    if (message.minInnerRedemptionRate !== '') {
      writer
        .uint32(26)
        .string(
          Decimal.fromUserInput(message.minInnerRedemptionRate, 18).atomics,
        );
    }
    if (message.maxInnerRedemptionRate !== '') {
      writer
        .uint32(34)
        .string(
          Decimal.fromUserInput(message.maxInnerRedemptionRate, 18).atomics,
        );
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): MsgUpdateInnerRedemptionRateBounds {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgUpdateInnerRedemptionRateBounds();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.creator = reader.string();
          break;
        case 2:
          message.chainId = reader.string();
          break;
        case 3:
          message.minInnerRedemptionRate = Decimal.fromAtomics(
            reader.string(),
            18,
          ).toString();
          break;
        case 4:
          message.maxInnerRedemptionRate = Decimal.fromAtomics(
            reader.string(),
            18,
          ).toString();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): MsgUpdateInnerRedemptionRateBounds {
    return {
      creator: isSet(object.creator) ? String(object.creator) : '',
      chainId: isSet(object.chainId) ? String(object.chainId) : '',
      minInnerRedemptionRate: isSet(object.minInnerRedemptionRate)
        ? String(object.minInnerRedemptionRate)
        : '',
      maxInnerRedemptionRate: isSet(object.maxInnerRedemptionRate)
        ? String(object.maxInnerRedemptionRate)
        : '',
    };
  },
  toJSON(
    message: MsgUpdateInnerRedemptionRateBounds,
  ): JsonSafe<MsgUpdateInnerRedemptionRateBounds> {
    const obj: any = {};
    message.creator !== undefined && (obj.creator = message.creator);
    message.chainId !== undefined && (obj.chainId = message.chainId);
    message.minInnerRedemptionRate !== undefined &&
      (obj.minInnerRedemptionRate = message.minInnerRedemptionRate);
    message.maxInnerRedemptionRate !== undefined &&
      (obj.maxInnerRedemptionRate = message.maxInnerRedemptionRate);
    return obj;
  },
  fromPartial(
    object: Partial<MsgUpdateInnerRedemptionRateBounds>,
  ): MsgUpdateInnerRedemptionRateBounds {
    const message = createBaseMsgUpdateInnerRedemptionRateBounds();
    message.creator = object.creator ?? '';
    message.chainId = object.chainId ?? '';
    message.minInnerRedemptionRate = object.minInnerRedemptionRate ?? '';
    message.maxInnerRedemptionRate = object.maxInnerRedemptionRate ?? '';
    return message;
  },
  fromProtoMsg(
    message: MsgUpdateInnerRedemptionRateBoundsProtoMsg,
  ): MsgUpdateInnerRedemptionRateBounds {
    return MsgUpdateInnerRedemptionRateBounds.decode(message.value);
  },
  toProto(message: MsgUpdateInnerRedemptionRateBounds): Uint8Array {
    return MsgUpdateInnerRedemptionRateBounds.encode(message).finish();
  },
  toProtoMsg(
    message: MsgUpdateInnerRedemptionRateBounds,
  ): MsgUpdateInnerRedemptionRateBoundsProtoMsg {
    return {
      typeUrl: '/stride.stakeibc.MsgUpdateInnerRedemptionRateBounds',
      value: MsgUpdateInnerRedemptionRateBounds.encode(message).finish(),
    };
  },
};
function createBaseMsgUpdateInnerRedemptionRateBoundsResponse(): MsgUpdateInnerRedemptionRateBoundsResponse {
  return {};
}
export const MsgUpdateInnerRedemptionRateBoundsResponse = {
  typeUrl: '/stride.stakeibc.MsgUpdateInnerRedemptionRateBoundsResponse',
  encode(
    _: MsgUpdateInnerRedemptionRateBoundsResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): MsgUpdateInnerRedemptionRateBoundsResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgUpdateInnerRedemptionRateBoundsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(_: any): MsgUpdateInnerRedemptionRateBoundsResponse {
    return {};
  },
  toJSON(
    _: MsgUpdateInnerRedemptionRateBoundsResponse,
  ): JsonSafe<MsgUpdateInnerRedemptionRateBoundsResponse> {
    const obj: any = {};
    return obj;
  },
  fromPartial(
    _: Partial<MsgUpdateInnerRedemptionRateBoundsResponse>,
  ): MsgUpdateInnerRedemptionRateBoundsResponse {
    const message = createBaseMsgUpdateInnerRedemptionRateBoundsResponse();
    return message;
  },
  fromProtoMsg(
    message: MsgUpdateInnerRedemptionRateBoundsResponseProtoMsg,
  ): MsgUpdateInnerRedemptionRateBoundsResponse {
    return MsgUpdateInnerRedemptionRateBoundsResponse.decode(message.value);
  },
  toProto(message: MsgUpdateInnerRedemptionRateBoundsResponse): Uint8Array {
    return MsgUpdateInnerRedemptionRateBoundsResponse.encode(message).finish();
  },
  toProtoMsg(
    message: MsgUpdateInnerRedemptionRateBoundsResponse,
  ): MsgUpdateInnerRedemptionRateBoundsResponseProtoMsg {
    return {
      typeUrl: '/stride.stakeibc.MsgUpdateInnerRedemptionRateBoundsResponse',
      value:
        MsgUpdateInnerRedemptionRateBoundsResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgLiquidStake(): MsgLiquidStake {
  return {
    creator: '',
    amount: '',
    hostDenom: '',
  };
}
export const MsgLiquidStake = {
  typeUrl: '/stride.stakeibc.MsgLiquidStake',
  encode(
    message: MsgLiquidStake,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.creator !== '') {
      writer.uint32(10).string(message.creator);
    }
    if (message.amount !== '') {
      writer.uint32(18).string(message.amount);
    }
    if (message.hostDenom !== '') {
      writer.uint32(26).string(message.hostDenom);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgLiquidStake {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgLiquidStake();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.creator = reader.string();
          break;
        case 2:
          message.amount = reader.string();
          break;
        case 3:
          message.hostDenom = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): MsgLiquidStake {
    return {
      creator: isSet(object.creator) ? String(object.creator) : '',
      amount: isSet(object.amount) ? String(object.amount) : '',
      hostDenom: isSet(object.hostDenom) ? String(object.hostDenom) : '',
    };
  },
  toJSON(message: MsgLiquidStake): JsonSafe<MsgLiquidStake> {
    const obj: any = {};
    message.creator !== undefined && (obj.creator = message.creator);
    message.amount !== undefined && (obj.amount = message.amount);
    message.hostDenom !== undefined && (obj.hostDenom = message.hostDenom);
    return obj;
  },
  fromPartial(object: Partial<MsgLiquidStake>): MsgLiquidStake {
    const message = createBaseMsgLiquidStake();
    message.creator = object.creator ?? '';
    message.amount = object.amount ?? '';
    message.hostDenom = object.hostDenom ?? '';
    return message;
  },
  fromProtoMsg(message: MsgLiquidStakeProtoMsg): MsgLiquidStake {
    return MsgLiquidStake.decode(message.value);
  },
  toProto(message: MsgLiquidStake): Uint8Array {
    return MsgLiquidStake.encode(message).finish();
  },
  toProtoMsg(message: MsgLiquidStake): MsgLiquidStakeProtoMsg {
    return {
      typeUrl: '/stride.stakeibc.MsgLiquidStake',
      value: MsgLiquidStake.encode(message).finish(),
    };
  },
};
function createBaseMsgLiquidStakeResponse(): MsgLiquidStakeResponse {
  return {
    stToken: Coin.fromPartial({}),
  };
}
export const MsgLiquidStakeResponse = {
  typeUrl: '/stride.stakeibc.MsgLiquidStakeResponse',
  encode(
    message: MsgLiquidStakeResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.stToken !== undefined) {
      Coin.encode(message.stToken, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): MsgLiquidStakeResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgLiquidStakeResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.stToken = Coin.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): MsgLiquidStakeResponse {
    return {
      stToken: isSet(object.stToken)
        ? Coin.fromJSON(object.stToken)
        : undefined,
    };
  },
  toJSON(message: MsgLiquidStakeResponse): JsonSafe<MsgLiquidStakeResponse> {
    const obj: any = {};
    message.stToken !== undefined &&
      (obj.stToken = message.stToken
        ? Coin.toJSON(message.stToken)
        : undefined);
    return obj;
  },
  fromPartial(object: Partial<MsgLiquidStakeResponse>): MsgLiquidStakeResponse {
    const message = createBaseMsgLiquidStakeResponse();
    message.stToken =
      object.stToken !== undefined && object.stToken !== null
        ? Coin.fromPartial(object.stToken)
        : undefined;
    return message;
  },
  fromProtoMsg(
    message: MsgLiquidStakeResponseProtoMsg,
  ): MsgLiquidStakeResponse {
    return MsgLiquidStakeResponse.decode(message.value);
  },
  toProto(message: MsgLiquidStakeResponse): Uint8Array {
    return MsgLiquidStakeResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgLiquidStakeResponse): MsgLiquidStakeResponseProtoMsg {
    return {
      typeUrl: '/stride.stakeibc.MsgLiquidStakeResponse',
      value: MsgLiquidStakeResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgLSMLiquidStake(): MsgLSMLiquidStake {
  return {
    creator: '',
    amount: '',
    lsmTokenIbcDenom: '',
  };
}
export const MsgLSMLiquidStake = {
  typeUrl: '/stride.stakeibc.MsgLSMLiquidStake',
  encode(
    message: MsgLSMLiquidStake,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.creator !== '') {
      writer.uint32(10).string(message.creator);
    }
    if (message.amount !== '') {
      writer.uint32(18).string(message.amount);
    }
    if (message.lsmTokenIbcDenom !== '') {
      writer.uint32(26).string(message.lsmTokenIbcDenom);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgLSMLiquidStake {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgLSMLiquidStake();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.creator = reader.string();
          break;
        case 2:
          message.amount = reader.string();
          break;
        case 3:
          message.lsmTokenIbcDenom = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): MsgLSMLiquidStake {
    return {
      creator: isSet(object.creator) ? String(object.creator) : '',
      amount: isSet(object.amount) ? String(object.amount) : '',
      lsmTokenIbcDenom: isSet(object.lsmTokenIbcDenom)
        ? String(object.lsmTokenIbcDenom)
        : '',
    };
  },
  toJSON(message: MsgLSMLiquidStake): JsonSafe<MsgLSMLiquidStake> {
    const obj: any = {};
    message.creator !== undefined && (obj.creator = message.creator);
    message.amount !== undefined && (obj.amount = message.amount);
    message.lsmTokenIbcDenom !== undefined &&
      (obj.lsmTokenIbcDenom = message.lsmTokenIbcDenom);
    return obj;
  },
  fromPartial(object: Partial<MsgLSMLiquidStake>): MsgLSMLiquidStake {
    const message = createBaseMsgLSMLiquidStake();
    message.creator = object.creator ?? '';
    message.amount = object.amount ?? '';
    message.lsmTokenIbcDenom = object.lsmTokenIbcDenom ?? '';
    return message;
  },
  fromProtoMsg(message: MsgLSMLiquidStakeProtoMsg): MsgLSMLiquidStake {
    return MsgLSMLiquidStake.decode(message.value);
  },
  toProto(message: MsgLSMLiquidStake): Uint8Array {
    return MsgLSMLiquidStake.encode(message).finish();
  },
  toProtoMsg(message: MsgLSMLiquidStake): MsgLSMLiquidStakeProtoMsg {
    return {
      typeUrl: '/stride.stakeibc.MsgLSMLiquidStake',
      value: MsgLSMLiquidStake.encode(message).finish(),
    };
  },
};
function createBaseMsgLSMLiquidStakeResponse(): MsgLSMLiquidStakeResponse {
  return {
    transactionComplete: false,
  };
}
export const MsgLSMLiquidStakeResponse = {
  typeUrl: '/stride.stakeibc.MsgLSMLiquidStakeResponse',
  encode(
    message: MsgLSMLiquidStakeResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.transactionComplete === true) {
      writer.uint32(8).bool(message.transactionComplete);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): MsgLSMLiquidStakeResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgLSMLiquidStakeResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.transactionComplete = reader.bool();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): MsgLSMLiquidStakeResponse {
    return {
      transactionComplete: isSet(object.transactionComplete)
        ? Boolean(object.transactionComplete)
        : false,
    };
  },
  toJSON(
    message: MsgLSMLiquidStakeResponse,
  ): JsonSafe<MsgLSMLiquidStakeResponse> {
    const obj: any = {};
    message.transactionComplete !== undefined &&
      (obj.transactionComplete = message.transactionComplete);
    return obj;
  },
  fromPartial(
    object: Partial<MsgLSMLiquidStakeResponse>,
  ): MsgLSMLiquidStakeResponse {
    const message = createBaseMsgLSMLiquidStakeResponse();
    message.transactionComplete = object.transactionComplete ?? false;
    return message;
  },
  fromProtoMsg(
    message: MsgLSMLiquidStakeResponseProtoMsg,
  ): MsgLSMLiquidStakeResponse {
    return MsgLSMLiquidStakeResponse.decode(message.value);
  },
  toProto(message: MsgLSMLiquidStakeResponse): Uint8Array {
    return MsgLSMLiquidStakeResponse.encode(message).finish();
  },
  toProtoMsg(
    message: MsgLSMLiquidStakeResponse,
  ): MsgLSMLiquidStakeResponseProtoMsg {
    return {
      typeUrl: '/stride.stakeibc.MsgLSMLiquidStakeResponse',
      value: MsgLSMLiquidStakeResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgClearBalance(): MsgClearBalance {
  return {
    creator: '',
    chainId: '',
    amount: '',
    channel: '',
  };
}
export const MsgClearBalance = {
  typeUrl: '/stride.stakeibc.MsgClearBalance',
  encode(
    message: MsgClearBalance,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.creator !== '') {
      writer.uint32(10).string(message.creator);
    }
    if (message.chainId !== '') {
      writer.uint32(18).string(message.chainId);
    }
    if (message.amount !== '') {
      writer.uint32(26).string(message.amount);
    }
    if (message.channel !== '') {
      writer.uint32(34).string(message.channel);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgClearBalance {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgClearBalance();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.creator = reader.string();
          break;
        case 2:
          message.chainId = reader.string();
          break;
        case 3:
          message.amount = reader.string();
          break;
        case 4:
          message.channel = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): MsgClearBalance {
    return {
      creator: isSet(object.creator) ? String(object.creator) : '',
      chainId: isSet(object.chainId) ? String(object.chainId) : '',
      amount: isSet(object.amount) ? String(object.amount) : '',
      channel: isSet(object.channel) ? String(object.channel) : '',
    };
  },
  toJSON(message: MsgClearBalance): JsonSafe<MsgClearBalance> {
    const obj: any = {};
    message.creator !== undefined && (obj.creator = message.creator);
    message.chainId !== undefined && (obj.chainId = message.chainId);
    message.amount !== undefined && (obj.amount = message.amount);
    message.channel !== undefined && (obj.channel = message.channel);
    return obj;
  },
  fromPartial(object: Partial<MsgClearBalance>): MsgClearBalance {
    const message = createBaseMsgClearBalance();
    message.creator = object.creator ?? '';
    message.chainId = object.chainId ?? '';
    message.amount = object.amount ?? '';
    message.channel = object.channel ?? '';
    return message;
  },
  fromProtoMsg(message: MsgClearBalanceProtoMsg): MsgClearBalance {
    return MsgClearBalance.decode(message.value);
  },
  toProto(message: MsgClearBalance): Uint8Array {
    return MsgClearBalance.encode(message).finish();
  },
  toProtoMsg(message: MsgClearBalance): MsgClearBalanceProtoMsg {
    return {
      typeUrl: '/stride.stakeibc.MsgClearBalance',
      value: MsgClearBalance.encode(message).finish(),
    };
  },
};
function createBaseMsgClearBalanceResponse(): MsgClearBalanceResponse {
  return {};
}
export const MsgClearBalanceResponse = {
  typeUrl: '/stride.stakeibc.MsgClearBalanceResponse',
  encode(
    _: MsgClearBalanceResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): MsgClearBalanceResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgClearBalanceResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(_: any): MsgClearBalanceResponse {
    return {};
  },
  toJSON(_: MsgClearBalanceResponse): JsonSafe<MsgClearBalanceResponse> {
    const obj: any = {};
    return obj;
  },
  fromPartial(_: Partial<MsgClearBalanceResponse>): MsgClearBalanceResponse {
    const message = createBaseMsgClearBalanceResponse();
    return message;
  },
  fromProtoMsg(
    message: MsgClearBalanceResponseProtoMsg,
  ): MsgClearBalanceResponse {
    return MsgClearBalanceResponse.decode(message.value);
  },
  toProto(message: MsgClearBalanceResponse): Uint8Array {
    return MsgClearBalanceResponse.encode(message).finish();
  },
  toProtoMsg(
    message: MsgClearBalanceResponse,
  ): MsgClearBalanceResponseProtoMsg {
    return {
      typeUrl: '/stride.stakeibc.MsgClearBalanceResponse',
      value: MsgClearBalanceResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgRedeemStake(): MsgRedeemStake {
  return {
    creator: '',
    amount: '',
    hostZone: '',
    receiver: '',
  };
}
export const MsgRedeemStake = {
  typeUrl: '/stride.stakeibc.MsgRedeemStake',
  encode(
    message: MsgRedeemStake,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.creator !== '') {
      writer.uint32(10).string(message.creator);
    }
    if (message.amount !== '') {
      writer.uint32(18).string(message.amount);
    }
    if (message.hostZone !== '') {
      writer.uint32(26).string(message.hostZone);
    }
    if (message.receiver !== '') {
      writer.uint32(34).string(message.receiver);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgRedeemStake {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgRedeemStake();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.creator = reader.string();
          break;
        case 2:
          message.amount = reader.string();
          break;
        case 3:
          message.hostZone = reader.string();
          break;
        case 4:
          message.receiver = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): MsgRedeemStake {
    return {
      creator: isSet(object.creator) ? String(object.creator) : '',
      amount: isSet(object.amount) ? String(object.amount) : '',
      hostZone: isSet(object.hostZone) ? String(object.hostZone) : '',
      receiver: isSet(object.receiver) ? String(object.receiver) : '',
    };
  },
  toJSON(message: MsgRedeemStake): JsonSafe<MsgRedeemStake> {
    const obj: any = {};
    message.creator !== undefined && (obj.creator = message.creator);
    message.amount !== undefined && (obj.amount = message.amount);
    message.hostZone !== undefined && (obj.hostZone = message.hostZone);
    message.receiver !== undefined && (obj.receiver = message.receiver);
    return obj;
  },
  fromPartial(object: Partial<MsgRedeemStake>): MsgRedeemStake {
    const message = createBaseMsgRedeemStake();
    message.creator = object.creator ?? '';
    message.amount = object.amount ?? '';
    message.hostZone = object.hostZone ?? '';
    message.receiver = object.receiver ?? '';
    return message;
  },
  fromProtoMsg(message: MsgRedeemStakeProtoMsg): MsgRedeemStake {
    return MsgRedeemStake.decode(message.value);
  },
  toProto(message: MsgRedeemStake): Uint8Array {
    return MsgRedeemStake.encode(message).finish();
  },
  toProtoMsg(message: MsgRedeemStake): MsgRedeemStakeProtoMsg {
    return {
      typeUrl: '/stride.stakeibc.MsgRedeemStake',
      value: MsgRedeemStake.encode(message).finish(),
    };
  },
};
function createBaseMsgRedeemStakeResponse(): MsgRedeemStakeResponse {
  return {};
}
export const MsgRedeemStakeResponse = {
  typeUrl: '/stride.stakeibc.MsgRedeemStakeResponse',
  encode(
    _: MsgRedeemStakeResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): MsgRedeemStakeResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgRedeemStakeResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(_: any): MsgRedeemStakeResponse {
    return {};
  },
  toJSON(_: MsgRedeemStakeResponse): JsonSafe<MsgRedeemStakeResponse> {
    const obj: any = {};
    return obj;
  },
  fromPartial(_: Partial<MsgRedeemStakeResponse>): MsgRedeemStakeResponse {
    const message = createBaseMsgRedeemStakeResponse();
    return message;
  },
  fromProtoMsg(
    message: MsgRedeemStakeResponseProtoMsg,
  ): MsgRedeemStakeResponse {
    return MsgRedeemStakeResponse.decode(message.value);
  },
  toProto(message: MsgRedeemStakeResponse): Uint8Array {
    return MsgRedeemStakeResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgRedeemStakeResponse): MsgRedeemStakeResponseProtoMsg {
    return {
      typeUrl: '/stride.stakeibc.MsgRedeemStakeResponse',
      value: MsgRedeemStakeResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgRegisterHostZone(): MsgRegisterHostZone {
  return {
    connectionId: '',
    bech32prefix: '',
    hostDenom: '',
    ibcDenom: '',
    creator: '',
    transferChannelId: '',
    unbondingPeriod: BigInt(0),
    minRedemptionRate: '',
    maxRedemptionRate: '',
    lsmLiquidStakeEnabled: false,
    communityPoolTreasuryAddress: '',
    maxMessagesPerIcaTx: BigInt(0),
  };
}
export const MsgRegisterHostZone = {
  typeUrl: '/stride.stakeibc.MsgRegisterHostZone',
  encode(
    message: MsgRegisterHostZone,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.connectionId !== '') {
      writer.uint32(18).string(message.connectionId);
    }
    if (message.bech32prefix !== '') {
      writer.uint32(98).string(message.bech32prefix);
    }
    if (message.hostDenom !== '') {
      writer.uint32(34).string(message.hostDenom);
    }
    if (message.ibcDenom !== '') {
      writer.uint32(42).string(message.ibcDenom);
    }
    if (message.creator !== '') {
      writer.uint32(50).string(message.creator);
    }
    if (message.transferChannelId !== '') {
      writer.uint32(82).string(message.transferChannelId);
    }
    if (message.unbondingPeriod !== BigInt(0)) {
      writer.uint32(88).uint64(message.unbondingPeriod);
    }
    if (message.minRedemptionRate !== '') {
      writer
        .uint32(106)
        .string(Decimal.fromUserInput(message.minRedemptionRate, 18).atomics);
    }
    if (message.maxRedemptionRate !== '') {
      writer
        .uint32(114)
        .string(Decimal.fromUserInput(message.maxRedemptionRate, 18).atomics);
    }
    if (message.lsmLiquidStakeEnabled === true) {
      writer.uint32(120).bool(message.lsmLiquidStakeEnabled);
    }
    if (message.communityPoolTreasuryAddress !== '') {
      writer.uint32(130).string(message.communityPoolTreasuryAddress);
    }
    if (message.maxMessagesPerIcaTx !== BigInt(0)) {
      writer.uint32(136).uint64(message.maxMessagesPerIcaTx);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): MsgRegisterHostZone {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgRegisterHostZone();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 2:
          message.connectionId = reader.string();
          break;
        case 12:
          message.bech32prefix = reader.string();
          break;
        case 4:
          message.hostDenom = reader.string();
          break;
        case 5:
          message.ibcDenom = reader.string();
          break;
        case 6:
          message.creator = reader.string();
          break;
        case 10:
          message.transferChannelId = reader.string();
          break;
        case 11:
          message.unbondingPeriod = reader.uint64();
          break;
        case 13:
          message.minRedemptionRate = Decimal.fromAtomics(
            reader.string(),
            18,
          ).toString();
          break;
        case 14:
          message.maxRedemptionRate = Decimal.fromAtomics(
            reader.string(),
            18,
          ).toString();
          break;
        case 15:
          message.lsmLiquidStakeEnabled = reader.bool();
          break;
        case 16:
          message.communityPoolTreasuryAddress = reader.string();
          break;
        case 17:
          message.maxMessagesPerIcaTx = reader.uint64();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): MsgRegisterHostZone {
    return {
      connectionId: isSet(object.connectionId)
        ? String(object.connectionId)
        : '',
      bech32prefix: isSet(object.bech32prefix)
        ? String(object.bech32prefix)
        : '',
      hostDenom: isSet(object.hostDenom) ? String(object.hostDenom) : '',
      ibcDenom: isSet(object.ibcDenom) ? String(object.ibcDenom) : '',
      creator: isSet(object.creator) ? String(object.creator) : '',
      transferChannelId: isSet(object.transferChannelId)
        ? String(object.transferChannelId)
        : '',
      unbondingPeriod: isSet(object.unbondingPeriod)
        ? BigInt(object.unbondingPeriod.toString())
        : BigInt(0),
      minRedemptionRate: isSet(object.minRedemptionRate)
        ? String(object.minRedemptionRate)
        : '',
      maxRedemptionRate: isSet(object.maxRedemptionRate)
        ? String(object.maxRedemptionRate)
        : '',
      lsmLiquidStakeEnabled: isSet(object.lsmLiquidStakeEnabled)
        ? Boolean(object.lsmLiquidStakeEnabled)
        : false,
      communityPoolTreasuryAddress: isSet(object.communityPoolTreasuryAddress)
        ? String(object.communityPoolTreasuryAddress)
        : '',
      maxMessagesPerIcaTx: isSet(object.maxMessagesPerIcaTx)
        ? BigInt(object.maxMessagesPerIcaTx.toString())
        : BigInt(0),
    };
  },
  toJSON(message: MsgRegisterHostZone): JsonSafe<MsgRegisterHostZone> {
    const obj: any = {};
    message.connectionId !== undefined &&
      (obj.connectionId = message.connectionId);
    message.bech32prefix !== undefined &&
      (obj.bech32prefix = message.bech32prefix);
    message.hostDenom !== undefined && (obj.hostDenom = message.hostDenom);
    message.ibcDenom !== undefined && (obj.ibcDenom = message.ibcDenom);
    message.creator !== undefined && (obj.creator = message.creator);
    message.transferChannelId !== undefined &&
      (obj.transferChannelId = message.transferChannelId);
    message.unbondingPeriod !== undefined &&
      (obj.unbondingPeriod = (message.unbondingPeriod || BigInt(0)).toString());
    message.minRedemptionRate !== undefined &&
      (obj.minRedemptionRate = message.minRedemptionRate);
    message.maxRedemptionRate !== undefined &&
      (obj.maxRedemptionRate = message.maxRedemptionRate);
    message.lsmLiquidStakeEnabled !== undefined &&
      (obj.lsmLiquidStakeEnabled = message.lsmLiquidStakeEnabled);
    message.communityPoolTreasuryAddress !== undefined &&
      (obj.communityPoolTreasuryAddress = message.communityPoolTreasuryAddress);
    message.maxMessagesPerIcaTx !== undefined &&
      (obj.maxMessagesPerIcaTx = (
        message.maxMessagesPerIcaTx || BigInt(0)
      ).toString());
    return obj;
  },
  fromPartial(object: Partial<MsgRegisterHostZone>): MsgRegisterHostZone {
    const message = createBaseMsgRegisterHostZone();
    message.connectionId = object.connectionId ?? '';
    message.bech32prefix = object.bech32prefix ?? '';
    message.hostDenom = object.hostDenom ?? '';
    message.ibcDenom = object.ibcDenom ?? '';
    message.creator = object.creator ?? '';
    message.transferChannelId = object.transferChannelId ?? '';
    message.unbondingPeriod =
      object.unbondingPeriod !== undefined && object.unbondingPeriod !== null
        ? BigInt(object.unbondingPeriod.toString())
        : BigInt(0);
    message.minRedemptionRate = object.minRedemptionRate ?? '';
    message.maxRedemptionRate = object.maxRedemptionRate ?? '';
    message.lsmLiquidStakeEnabled = object.lsmLiquidStakeEnabled ?? false;
    message.communityPoolTreasuryAddress =
      object.communityPoolTreasuryAddress ?? '';
    message.maxMessagesPerIcaTx =
      object.maxMessagesPerIcaTx !== undefined &&
      object.maxMessagesPerIcaTx !== null
        ? BigInt(object.maxMessagesPerIcaTx.toString())
        : BigInt(0);
    return message;
  },
  fromProtoMsg(message: MsgRegisterHostZoneProtoMsg): MsgRegisterHostZone {
    return MsgRegisterHostZone.decode(message.value);
  },
  toProto(message: MsgRegisterHostZone): Uint8Array {
    return MsgRegisterHostZone.encode(message).finish();
  },
  toProtoMsg(message: MsgRegisterHostZone): MsgRegisterHostZoneProtoMsg {
    return {
      typeUrl: '/stride.stakeibc.MsgRegisterHostZone',
      value: MsgRegisterHostZone.encode(message).finish(),
    };
  },
};
function createBaseMsgRegisterHostZoneResponse(): MsgRegisterHostZoneResponse {
  return {};
}
export const MsgRegisterHostZoneResponse = {
  typeUrl: '/stride.stakeibc.MsgRegisterHostZoneResponse',
  encode(
    _: MsgRegisterHostZoneResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): MsgRegisterHostZoneResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgRegisterHostZoneResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(_: any): MsgRegisterHostZoneResponse {
    return {};
  },
  toJSON(
    _: MsgRegisterHostZoneResponse,
  ): JsonSafe<MsgRegisterHostZoneResponse> {
    const obj: any = {};
    return obj;
  },
  fromPartial(
    _: Partial<MsgRegisterHostZoneResponse>,
  ): MsgRegisterHostZoneResponse {
    const message = createBaseMsgRegisterHostZoneResponse();
    return message;
  },
  fromProtoMsg(
    message: MsgRegisterHostZoneResponseProtoMsg,
  ): MsgRegisterHostZoneResponse {
    return MsgRegisterHostZoneResponse.decode(message.value);
  },
  toProto(message: MsgRegisterHostZoneResponse): Uint8Array {
    return MsgRegisterHostZoneResponse.encode(message).finish();
  },
  toProtoMsg(
    message: MsgRegisterHostZoneResponse,
  ): MsgRegisterHostZoneResponseProtoMsg {
    return {
      typeUrl: '/stride.stakeibc.MsgRegisterHostZoneResponse',
      value: MsgRegisterHostZoneResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgClaimUndelegatedTokens(): MsgClaimUndelegatedTokens {
  return {
    creator: '',
    hostZoneId: '',
    epoch: BigInt(0),
    receiver: '',
  };
}
export const MsgClaimUndelegatedTokens = {
  typeUrl: '/stride.stakeibc.MsgClaimUndelegatedTokens',
  encode(
    message: MsgClaimUndelegatedTokens,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.creator !== '') {
      writer.uint32(10).string(message.creator);
    }
    if (message.hostZoneId !== '') {
      writer.uint32(18).string(message.hostZoneId);
    }
    if (message.epoch !== BigInt(0)) {
      writer.uint32(24).uint64(message.epoch);
    }
    if (message.receiver !== '') {
      writer.uint32(42).string(message.receiver);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): MsgClaimUndelegatedTokens {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgClaimUndelegatedTokens();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.creator = reader.string();
          break;
        case 2:
          message.hostZoneId = reader.string();
          break;
        case 3:
          message.epoch = reader.uint64();
          break;
        case 5:
          message.receiver = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): MsgClaimUndelegatedTokens {
    return {
      creator: isSet(object.creator) ? String(object.creator) : '',
      hostZoneId: isSet(object.hostZoneId) ? String(object.hostZoneId) : '',
      epoch: isSet(object.epoch) ? BigInt(object.epoch.toString()) : BigInt(0),
      receiver: isSet(object.receiver) ? String(object.receiver) : '',
    };
  },
  toJSON(
    message: MsgClaimUndelegatedTokens,
  ): JsonSafe<MsgClaimUndelegatedTokens> {
    const obj: any = {};
    message.creator !== undefined && (obj.creator = message.creator);
    message.hostZoneId !== undefined && (obj.hostZoneId = message.hostZoneId);
    message.epoch !== undefined &&
      (obj.epoch = (message.epoch || BigInt(0)).toString());
    message.receiver !== undefined && (obj.receiver = message.receiver);
    return obj;
  },
  fromPartial(
    object: Partial<MsgClaimUndelegatedTokens>,
  ): MsgClaimUndelegatedTokens {
    const message = createBaseMsgClaimUndelegatedTokens();
    message.creator = object.creator ?? '';
    message.hostZoneId = object.hostZoneId ?? '';
    message.epoch =
      object.epoch !== undefined && object.epoch !== null
        ? BigInt(object.epoch.toString())
        : BigInt(0);
    message.receiver = object.receiver ?? '';
    return message;
  },
  fromProtoMsg(
    message: MsgClaimUndelegatedTokensProtoMsg,
  ): MsgClaimUndelegatedTokens {
    return MsgClaimUndelegatedTokens.decode(message.value);
  },
  toProto(message: MsgClaimUndelegatedTokens): Uint8Array {
    return MsgClaimUndelegatedTokens.encode(message).finish();
  },
  toProtoMsg(
    message: MsgClaimUndelegatedTokens,
  ): MsgClaimUndelegatedTokensProtoMsg {
    return {
      typeUrl: '/stride.stakeibc.MsgClaimUndelegatedTokens',
      value: MsgClaimUndelegatedTokens.encode(message).finish(),
    };
  },
};
function createBaseMsgClaimUndelegatedTokensResponse(): MsgClaimUndelegatedTokensResponse {
  return {};
}
export const MsgClaimUndelegatedTokensResponse = {
  typeUrl: '/stride.stakeibc.MsgClaimUndelegatedTokensResponse',
  encode(
    _: MsgClaimUndelegatedTokensResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): MsgClaimUndelegatedTokensResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgClaimUndelegatedTokensResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(_: any): MsgClaimUndelegatedTokensResponse {
    return {};
  },
  toJSON(
    _: MsgClaimUndelegatedTokensResponse,
  ): JsonSafe<MsgClaimUndelegatedTokensResponse> {
    const obj: any = {};
    return obj;
  },
  fromPartial(
    _: Partial<MsgClaimUndelegatedTokensResponse>,
  ): MsgClaimUndelegatedTokensResponse {
    const message = createBaseMsgClaimUndelegatedTokensResponse();
    return message;
  },
  fromProtoMsg(
    message: MsgClaimUndelegatedTokensResponseProtoMsg,
  ): MsgClaimUndelegatedTokensResponse {
    return MsgClaimUndelegatedTokensResponse.decode(message.value);
  },
  toProto(message: MsgClaimUndelegatedTokensResponse): Uint8Array {
    return MsgClaimUndelegatedTokensResponse.encode(message).finish();
  },
  toProtoMsg(
    message: MsgClaimUndelegatedTokensResponse,
  ): MsgClaimUndelegatedTokensResponseProtoMsg {
    return {
      typeUrl: '/stride.stakeibc.MsgClaimUndelegatedTokensResponse',
      value: MsgClaimUndelegatedTokensResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgRebalanceValidators(): MsgRebalanceValidators {
  return {
    creator: '',
    hostZone: '',
    numRebalance: BigInt(0),
  };
}
export const MsgRebalanceValidators = {
  typeUrl: '/stride.stakeibc.MsgRebalanceValidators',
  encode(
    message: MsgRebalanceValidators,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.creator !== '') {
      writer.uint32(10).string(message.creator);
    }
    if (message.hostZone !== '') {
      writer.uint32(18).string(message.hostZone);
    }
    if (message.numRebalance !== BigInt(0)) {
      writer.uint32(24).uint64(message.numRebalance);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): MsgRebalanceValidators {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgRebalanceValidators();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.creator = reader.string();
          break;
        case 2:
          message.hostZone = reader.string();
          break;
        case 3:
          message.numRebalance = reader.uint64();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): MsgRebalanceValidators {
    return {
      creator: isSet(object.creator) ? String(object.creator) : '',
      hostZone: isSet(object.hostZone) ? String(object.hostZone) : '',
      numRebalance: isSet(object.numRebalance)
        ? BigInt(object.numRebalance.toString())
        : BigInt(0),
    };
  },
  toJSON(message: MsgRebalanceValidators): JsonSafe<MsgRebalanceValidators> {
    const obj: any = {};
    message.creator !== undefined && (obj.creator = message.creator);
    message.hostZone !== undefined && (obj.hostZone = message.hostZone);
    message.numRebalance !== undefined &&
      (obj.numRebalance = (message.numRebalance || BigInt(0)).toString());
    return obj;
  },
  fromPartial(object: Partial<MsgRebalanceValidators>): MsgRebalanceValidators {
    const message = createBaseMsgRebalanceValidators();
    message.creator = object.creator ?? '';
    message.hostZone = object.hostZone ?? '';
    message.numRebalance =
      object.numRebalance !== undefined && object.numRebalance !== null
        ? BigInt(object.numRebalance.toString())
        : BigInt(0);
    return message;
  },
  fromProtoMsg(
    message: MsgRebalanceValidatorsProtoMsg,
  ): MsgRebalanceValidators {
    return MsgRebalanceValidators.decode(message.value);
  },
  toProto(message: MsgRebalanceValidators): Uint8Array {
    return MsgRebalanceValidators.encode(message).finish();
  },
  toProtoMsg(message: MsgRebalanceValidators): MsgRebalanceValidatorsProtoMsg {
    return {
      typeUrl: '/stride.stakeibc.MsgRebalanceValidators',
      value: MsgRebalanceValidators.encode(message).finish(),
    };
  },
};
function createBaseMsgRebalanceValidatorsResponse(): MsgRebalanceValidatorsResponse {
  return {};
}
export const MsgRebalanceValidatorsResponse = {
  typeUrl: '/stride.stakeibc.MsgRebalanceValidatorsResponse',
  encode(
    _: MsgRebalanceValidatorsResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): MsgRebalanceValidatorsResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgRebalanceValidatorsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(_: any): MsgRebalanceValidatorsResponse {
    return {};
  },
  toJSON(
    _: MsgRebalanceValidatorsResponse,
  ): JsonSafe<MsgRebalanceValidatorsResponse> {
    const obj: any = {};
    return obj;
  },
  fromPartial(
    _: Partial<MsgRebalanceValidatorsResponse>,
  ): MsgRebalanceValidatorsResponse {
    const message = createBaseMsgRebalanceValidatorsResponse();
    return message;
  },
  fromProtoMsg(
    message: MsgRebalanceValidatorsResponseProtoMsg,
  ): MsgRebalanceValidatorsResponse {
    return MsgRebalanceValidatorsResponse.decode(message.value);
  },
  toProto(message: MsgRebalanceValidatorsResponse): Uint8Array {
    return MsgRebalanceValidatorsResponse.encode(message).finish();
  },
  toProtoMsg(
    message: MsgRebalanceValidatorsResponse,
  ): MsgRebalanceValidatorsResponseProtoMsg {
    return {
      typeUrl: '/stride.stakeibc.MsgRebalanceValidatorsResponse',
      value: MsgRebalanceValidatorsResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgAddValidators(): MsgAddValidators {
  return {
    creator: '',
    hostZone: '',
    validators: [],
  };
}
export const MsgAddValidators = {
  typeUrl: '/stride.stakeibc.MsgAddValidators',
  encode(
    message: MsgAddValidators,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.creator !== '') {
      writer.uint32(10).string(message.creator);
    }
    if (message.hostZone !== '') {
      writer.uint32(18).string(message.hostZone);
    }
    for (const v of message.validators) {
      Validator.encode(v!, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgAddValidators {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgAddValidators();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.creator = reader.string();
          break;
        case 2:
          message.hostZone = reader.string();
          break;
        case 3:
          message.validators.push(Validator.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): MsgAddValidators {
    return {
      creator: isSet(object.creator) ? String(object.creator) : '',
      hostZone: isSet(object.hostZone) ? String(object.hostZone) : '',
      validators: Array.isArray(object?.validators)
        ? object.validators.map((e: any) => Validator.fromJSON(e))
        : [],
    };
  },
  toJSON(message: MsgAddValidators): JsonSafe<MsgAddValidators> {
    const obj: any = {};
    message.creator !== undefined && (obj.creator = message.creator);
    message.hostZone !== undefined && (obj.hostZone = message.hostZone);
    if (message.validators) {
      obj.validators = message.validators.map(e =>
        e ? Validator.toJSON(e) : undefined,
      );
    } else {
      obj.validators = [];
    }
    return obj;
  },
  fromPartial(object: Partial<MsgAddValidators>): MsgAddValidators {
    const message = createBaseMsgAddValidators();
    message.creator = object.creator ?? '';
    message.hostZone = object.hostZone ?? '';
    message.validators =
      object.validators?.map(e => Validator.fromPartial(e)) || [];
    return message;
  },
  fromProtoMsg(message: MsgAddValidatorsProtoMsg): MsgAddValidators {
    return MsgAddValidators.decode(message.value);
  },
  toProto(message: MsgAddValidators): Uint8Array {
    return MsgAddValidators.encode(message).finish();
  },
  toProtoMsg(message: MsgAddValidators): MsgAddValidatorsProtoMsg {
    return {
      typeUrl: '/stride.stakeibc.MsgAddValidators',
      value: MsgAddValidators.encode(message).finish(),
    };
  },
};
function createBaseMsgAddValidatorsResponse(): MsgAddValidatorsResponse {
  return {};
}
export const MsgAddValidatorsResponse = {
  typeUrl: '/stride.stakeibc.MsgAddValidatorsResponse',
  encode(
    _: MsgAddValidatorsResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): MsgAddValidatorsResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgAddValidatorsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(_: any): MsgAddValidatorsResponse {
    return {};
  },
  toJSON(_: MsgAddValidatorsResponse): JsonSafe<MsgAddValidatorsResponse> {
    const obj: any = {};
    return obj;
  },
  fromPartial(_: Partial<MsgAddValidatorsResponse>): MsgAddValidatorsResponse {
    const message = createBaseMsgAddValidatorsResponse();
    return message;
  },
  fromProtoMsg(
    message: MsgAddValidatorsResponseProtoMsg,
  ): MsgAddValidatorsResponse {
    return MsgAddValidatorsResponse.decode(message.value);
  },
  toProto(message: MsgAddValidatorsResponse): Uint8Array {
    return MsgAddValidatorsResponse.encode(message).finish();
  },
  toProtoMsg(
    message: MsgAddValidatorsResponse,
  ): MsgAddValidatorsResponseProtoMsg {
    return {
      typeUrl: '/stride.stakeibc.MsgAddValidatorsResponse',
      value: MsgAddValidatorsResponse.encode(message).finish(),
    };
  },
};
function createBaseValidatorWeight(): ValidatorWeight {
  return {
    address: '',
    weight: BigInt(0),
  };
}
export const ValidatorWeight = {
  typeUrl: '/stride.stakeibc.ValidatorWeight',
  encode(
    message: ValidatorWeight,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.address !== '') {
      writer.uint32(10).string(message.address);
    }
    if (message.weight !== BigInt(0)) {
      writer.uint32(16).uint64(message.weight);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): ValidatorWeight {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseValidatorWeight();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.address = reader.string();
          break;
        case 2:
          message.weight = reader.uint64();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): ValidatorWeight {
    return {
      address: isSet(object.address) ? String(object.address) : '',
      weight: isSet(object.weight)
        ? BigInt(object.weight.toString())
        : BigInt(0),
    };
  },
  toJSON(message: ValidatorWeight): JsonSafe<ValidatorWeight> {
    const obj: any = {};
    message.address !== undefined && (obj.address = message.address);
    message.weight !== undefined &&
      (obj.weight = (message.weight || BigInt(0)).toString());
    return obj;
  },
  fromPartial(object: Partial<ValidatorWeight>): ValidatorWeight {
    const message = createBaseValidatorWeight();
    message.address = object.address ?? '';
    message.weight =
      object.weight !== undefined && object.weight !== null
        ? BigInt(object.weight.toString())
        : BigInt(0);
    return message;
  },
  fromProtoMsg(message: ValidatorWeightProtoMsg): ValidatorWeight {
    return ValidatorWeight.decode(message.value);
  },
  toProto(message: ValidatorWeight): Uint8Array {
    return ValidatorWeight.encode(message).finish();
  },
  toProtoMsg(message: ValidatorWeight): ValidatorWeightProtoMsg {
    return {
      typeUrl: '/stride.stakeibc.ValidatorWeight',
      value: ValidatorWeight.encode(message).finish(),
    };
  },
};
function createBaseMsgChangeValidatorWeights(): MsgChangeValidatorWeights {
  return {
    creator: '',
    hostZone: '',
    validatorWeights: [],
  };
}
export const MsgChangeValidatorWeights = {
  typeUrl: '/stride.stakeibc.MsgChangeValidatorWeights',
  encode(
    message: MsgChangeValidatorWeights,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.creator !== '') {
      writer.uint32(10).string(message.creator);
    }
    if (message.hostZone !== '') {
      writer.uint32(18).string(message.hostZone);
    }
    for (const v of message.validatorWeights) {
      ValidatorWeight.encode(v!, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): MsgChangeValidatorWeights {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgChangeValidatorWeights();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.creator = reader.string();
          break;
        case 2:
          message.hostZone = reader.string();
          break;
        case 3:
          message.validatorWeights.push(
            ValidatorWeight.decode(reader, reader.uint32()),
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): MsgChangeValidatorWeights {
    return {
      creator: isSet(object.creator) ? String(object.creator) : '',
      hostZone: isSet(object.hostZone) ? String(object.hostZone) : '',
      validatorWeights: Array.isArray(object?.validatorWeights)
        ? object.validatorWeights.map((e: any) => ValidatorWeight.fromJSON(e))
        : [],
    };
  },
  toJSON(
    message: MsgChangeValidatorWeights,
  ): JsonSafe<MsgChangeValidatorWeights> {
    const obj: any = {};
    message.creator !== undefined && (obj.creator = message.creator);
    message.hostZone !== undefined && (obj.hostZone = message.hostZone);
    if (message.validatorWeights) {
      obj.validatorWeights = message.validatorWeights.map(e =>
        e ? ValidatorWeight.toJSON(e) : undefined,
      );
    } else {
      obj.validatorWeights = [];
    }
    return obj;
  },
  fromPartial(
    object: Partial<MsgChangeValidatorWeights>,
  ): MsgChangeValidatorWeights {
    const message = createBaseMsgChangeValidatorWeights();
    message.creator = object.creator ?? '';
    message.hostZone = object.hostZone ?? '';
    message.validatorWeights =
      object.validatorWeights?.map(e => ValidatorWeight.fromPartial(e)) || [];
    return message;
  },
  fromProtoMsg(
    message: MsgChangeValidatorWeightsProtoMsg,
  ): MsgChangeValidatorWeights {
    return MsgChangeValidatorWeights.decode(message.value);
  },
  toProto(message: MsgChangeValidatorWeights): Uint8Array {
    return MsgChangeValidatorWeights.encode(message).finish();
  },
  toProtoMsg(
    message: MsgChangeValidatorWeights,
  ): MsgChangeValidatorWeightsProtoMsg {
    return {
      typeUrl: '/stride.stakeibc.MsgChangeValidatorWeights',
      value: MsgChangeValidatorWeights.encode(message).finish(),
    };
  },
};
function createBaseMsgChangeValidatorWeightsResponse(): MsgChangeValidatorWeightsResponse {
  return {};
}
export const MsgChangeValidatorWeightsResponse = {
  typeUrl: '/stride.stakeibc.MsgChangeValidatorWeightsResponse',
  encode(
    _: MsgChangeValidatorWeightsResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): MsgChangeValidatorWeightsResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgChangeValidatorWeightsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(_: any): MsgChangeValidatorWeightsResponse {
    return {};
  },
  toJSON(
    _: MsgChangeValidatorWeightsResponse,
  ): JsonSafe<MsgChangeValidatorWeightsResponse> {
    const obj: any = {};
    return obj;
  },
  fromPartial(
    _: Partial<MsgChangeValidatorWeightsResponse>,
  ): MsgChangeValidatorWeightsResponse {
    const message = createBaseMsgChangeValidatorWeightsResponse();
    return message;
  },
  fromProtoMsg(
    message: MsgChangeValidatorWeightsResponseProtoMsg,
  ): MsgChangeValidatorWeightsResponse {
    return MsgChangeValidatorWeightsResponse.decode(message.value);
  },
  toProto(message: MsgChangeValidatorWeightsResponse): Uint8Array {
    return MsgChangeValidatorWeightsResponse.encode(message).finish();
  },
  toProtoMsg(
    message: MsgChangeValidatorWeightsResponse,
  ): MsgChangeValidatorWeightsResponseProtoMsg {
    return {
      typeUrl: '/stride.stakeibc.MsgChangeValidatorWeightsResponse',
      value: MsgChangeValidatorWeightsResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgDeleteValidator(): MsgDeleteValidator {
  return {
    creator: '',
    hostZone: '',
    valAddr: '',
  };
}
export const MsgDeleteValidator = {
  typeUrl: '/stride.stakeibc.MsgDeleteValidator',
  encode(
    message: MsgDeleteValidator,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.creator !== '') {
      writer.uint32(10).string(message.creator);
    }
    if (message.hostZone !== '') {
      writer.uint32(18).string(message.hostZone);
    }
    if (message.valAddr !== '') {
      writer.uint32(26).string(message.valAddr);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): MsgDeleteValidator {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgDeleteValidator();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.creator = reader.string();
          break;
        case 2:
          message.hostZone = reader.string();
          break;
        case 3:
          message.valAddr = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): MsgDeleteValidator {
    return {
      creator: isSet(object.creator) ? String(object.creator) : '',
      hostZone: isSet(object.hostZone) ? String(object.hostZone) : '',
      valAddr: isSet(object.valAddr) ? String(object.valAddr) : '',
    };
  },
  toJSON(message: MsgDeleteValidator): JsonSafe<MsgDeleteValidator> {
    const obj: any = {};
    message.creator !== undefined && (obj.creator = message.creator);
    message.hostZone !== undefined && (obj.hostZone = message.hostZone);
    message.valAddr !== undefined && (obj.valAddr = message.valAddr);
    return obj;
  },
  fromPartial(object: Partial<MsgDeleteValidator>): MsgDeleteValidator {
    const message = createBaseMsgDeleteValidator();
    message.creator = object.creator ?? '';
    message.hostZone = object.hostZone ?? '';
    message.valAddr = object.valAddr ?? '';
    return message;
  },
  fromProtoMsg(message: MsgDeleteValidatorProtoMsg): MsgDeleteValidator {
    return MsgDeleteValidator.decode(message.value);
  },
  toProto(message: MsgDeleteValidator): Uint8Array {
    return MsgDeleteValidator.encode(message).finish();
  },
  toProtoMsg(message: MsgDeleteValidator): MsgDeleteValidatorProtoMsg {
    return {
      typeUrl: '/stride.stakeibc.MsgDeleteValidator',
      value: MsgDeleteValidator.encode(message).finish(),
    };
  },
};
function createBaseMsgDeleteValidatorResponse(): MsgDeleteValidatorResponse {
  return {};
}
export const MsgDeleteValidatorResponse = {
  typeUrl: '/stride.stakeibc.MsgDeleteValidatorResponse',
  encode(
    _: MsgDeleteValidatorResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): MsgDeleteValidatorResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgDeleteValidatorResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(_: any): MsgDeleteValidatorResponse {
    return {};
  },
  toJSON(_: MsgDeleteValidatorResponse): JsonSafe<MsgDeleteValidatorResponse> {
    const obj: any = {};
    return obj;
  },
  fromPartial(
    _: Partial<MsgDeleteValidatorResponse>,
  ): MsgDeleteValidatorResponse {
    const message = createBaseMsgDeleteValidatorResponse();
    return message;
  },
  fromProtoMsg(
    message: MsgDeleteValidatorResponseProtoMsg,
  ): MsgDeleteValidatorResponse {
    return MsgDeleteValidatorResponse.decode(message.value);
  },
  toProto(message: MsgDeleteValidatorResponse): Uint8Array {
    return MsgDeleteValidatorResponse.encode(message).finish();
  },
  toProtoMsg(
    message: MsgDeleteValidatorResponse,
  ): MsgDeleteValidatorResponseProtoMsg {
    return {
      typeUrl: '/stride.stakeibc.MsgDeleteValidatorResponse',
      value: MsgDeleteValidatorResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgRestoreInterchainAccount(): MsgRestoreInterchainAccount {
  return {
    creator: '',
    chainId: '',
    connectionId: '',
    accountOwner: '',
  };
}
export const MsgRestoreInterchainAccount = {
  typeUrl: '/stride.stakeibc.MsgRestoreInterchainAccount',
  encode(
    message: MsgRestoreInterchainAccount,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.creator !== '') {
      writer.uint32(10).string(message.creator);
    }
    if (message.chainId !== '') {
      writer.uint32(18).string(message.chainId);
    }
    if (message.connectionId !== '') {
      writer.uint32(26).string(message.connectionId);
    }
    if (message.accountOwner !== '') {
      writer.uint32(34).string(message.accountOwner);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): MsgRestoreInterchainAccount {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgRestoreInterchainAccount();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.creator = reader.string();
          break;
        case 2:
          message.chainId = reader.string();
          break;
        case 3:
          message.connectionId = reader.string();
          break;
        case 4:
          message.accountOwner = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): MsgRestoreInterchainAccount {
    return {
      creator: isSet(object.creator) ? String(object.creator) : '',
      chainId: isSet(object.chainId) ? String(object.chainId) : '',
      connectionId: isSet(object.connectionId)
        ? String(object.connectionId)
        : '',
      accountOwner: isSet(object.accountOwner)
        ? String(object.accountOwner)
        : '',
    };
  },
  toJSON(
    message: MsgRestoreInterchainAccount,
  ): JsonSafe<MsgRestoreInterchainAccount> {
    const obj: any = {};
    message.creator !== undefined && (obj.creator = message.creator);
    message.chainId !== undefined && (obj.chainId = message.chainId);
    message.connectionId !== undefined &&
      (obj.connectionId = message.connectionId);
    message.accountOwner !== undefined &&
      (obj.accountOwner = message.accountOwner);
    return obj;
  },
  fromPartial(
    object: Partial<MsgRestoreInterchainAccount>,
  ): MsgRestoreInterchainAccount {
    const message = createBaseMsgRestoreInterchainAccount();
    message.creator = object.creator ?? '';
    message.chainId = object.chainId ?? '';
    message.connectionId = object.connectionId ?? '';
    message.accountOwner = object.accountOwner ?? '';
    return message;
  },
  fromProtoMsg(
    message: MsgRestoreInterchainAccountProtoMsg,
  ): MsgRestoreInterchainAccount {
    return MsgRestoreInterchainAccount.decode(message.value);
  },
  toProto(message: MsgRestoreInterchainAccount): Uint8Array {
    return MsgRestoreInterchainAccount.encode(message).finish();
  },
  toProtoMsg(
    message: MsgRestoreInterchainAccount,
  ): MsgRestoreInterchainAccountProtoMsg {
    return {
      typeUrl: '/stride.stakeibc.MsgRestoreInterchainAccount',
      value: MsgRestoreInterchainAccount.encode(message).finish(),
    };
  },
};
function createBaseMsgRestoreInterchainAccountResponse(): MsgRestoreInterchainAccountResponse {
  return {};
}
export const MsgRestoreInterchainAccountResponse = {
  typeUrl: '/stride.stakeibc.MsgRestoreInterchainAccountResponse',
  encode(
    _: MsgRestoreInterchainAccountResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): MsgRestoreInterchainAccountResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgRestoreInterchainAccountResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(_: any): MsgRestoreInterchainAccountResponse {
    return {};
  },
  toJSON(
    _: MsgRestoreInterchainAccountResponse,
  ): JsonSafe<MsgRestoreInterchainAccountResponse> {
    const obj: any = {};
    return obj;
  },
  fromPartial(
    _: Partial<MsgRestoreInterchainAccountResponse>,
  ): MsgRestoreInterchainAccountResponse {
    const message = createBaseMsgRestoreInterchainAccountResponse();
    return message;
  },
  fromProtoMsg(
    message: MsgRestoreInterchainAccountResponseProtoMsg,
  ): MsgRestoreInterchainAccountResponse {
    return MsgRestoreInterchainAccountResponse.decode(message.value);
  },
  toProto(message: MsgRestoreInterchainAccountResponse): Uint8Array {
    return MsgRestoreInterchainAccountResponse.encode(message).finish();
  },
  toProtoMsg(
    message: MsgRestoreInterchainAccountResponse,
  ): MsgRestoreInterchainAccountResponseProtoMsg {
    return {
      typeUrl: '/stride.stakeibc.MsgRestoreInterchainAccountResponse',
      value: MsgRestoreInterchainAccountResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgCloseDelegationChannel(): MsgCloseDelegationChannel {
  return {
    creator: '',
    chainId: '',
  };
}
export const MsgCloseDelegationChannel = {
  typeUrl: '/stride.stakeibc.MsgCloseDelegationChannel',
  encode(
    message: MsgCloseDelegationChannel,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.creator !== '') {
      writer.uint32(10).string(message.creator);
    }
    if (message.chainId !== '') {
      writer.uint32(18).string(message.chainId);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): MsgCloseDelegationChannel {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCloseDelegationChannel();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.creator = reader.string();
          break;
        case 2:
          message.chainId = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): MsgCloseDelegationChannel {
    return {
      creator: isSet(object.creator) ? String(object.creator) : '',
      chainId: isSet(object.chainId) ? String(object.chainId) : '',
    };
  },
  toJSON(
    message: MsgCloseDelegationChannel,
  ): JsonSafe<MsgCloseDelegationChannel> {
    const obj: any = {};
    message.creator !== undefined && (obj.creator = message.creator);
    message.chainId !== undefined && (obj.chainId = message.chainId);
    return obj;
  },
  fromPartial(
    object: Partial<MsgCloseDelegationChannel>,
  ): MsgCloseDelegationChannel {
    const message = createBaseMsgCloseDelegationChannel();
    message.creator = object.creator ?? '';
    message.chainId = object.chainId ?? '';
    return message;
  },
  fromProtoMsg(
    message: MsgCloseDelegationChannelProtoMsg,
  ): MsgCloseDelegationChannel {
    return MsgCloseDelegationChannel.decode(message.value);
  },
  toProto(message: MsgCloseDelegationChannel): Uint8Array {
    return MsgCloseDelegationChannel.encode(message).finish();
  },
  toProtoMsg(
    message: MsgCloseDelegationChannel,
  ): MsgCloseDelegationChannelProtoMsg {
    return {
      typeUrl: '/stride.stakeibc.MsgCloseDelegationChannel',
      value: MsgCloseDelegationChannel.encode(message).finish(),
    };
  },
};
function createBaseMsgCloseDelegationChannelResponse(): MsgCloseDelegationChannelResponse {
  return {};
}
export const MsgCloseDelegationChannelResponse = {
  typeUrl: '/stride.stakeibc.MsgCloseDelegationChannelResponse',
  encode(
    _: MsgCloseDelegationChannelResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): MsgCloseDelegationChannelResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCloseDelegationChannelResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(_: any): MsgCloseDelegationChannelResponse {
    return {};
  },
  toJSON(
    _: MsgCloseDelegationChannelResponse,
  ): JsonSafe<MsgCloseDelegationChannelResponse> {
    const obj: any = {};
    return obj;
  },
  fromPartial(
    _: Partial<MsgCloseDelegationChannelResponse>,
  ): MsgCloseDelegationChannelResponse {
    const message = createBaseMsgCloseDelegationChannelResponse();
    return message;
  },
  fromProtoMsg(
    message: MsgCloseDelegationChannelResponseProtoMsg,
  ): MsgCloseDelegationChannelResponse {
    return MsgCloseDelegationChannelResponse.decode(message.value);
  },
  toProto(message: MsgCloseDelegationChannelResponse): Uint8Array {
    return MsgCloseDelegationChannelResponse.encode(message).finish();
  },
  toProtoMsg(
    message: MsgCloseDelegationChannelResponse,
  ): MsgCloseDelegationChannelResponseProtoMsg {
    return {
      typeUrl: '/stride.stakeibc.MsgCloseDelegationChannelResponse',
      value: MsgCloseDelegationChannelResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgUpdateValidatorSharesExchRate(): MsgUpdateValidatorSharesExchRate {
  return {
    creator: '',
    chainId: '',
    valoper: '',
  };
}
export const MsgUpdateValidatorSharesExchRate = {
  typeUrl: '/stride.stakeibc.MsgUpdateValidatorSharesExchRate',
  encode(
    message: MsgUpdateValidatorSharesExchRate,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.creator !== '') {
      writer.uint32(10).string(message.creator);
    }
    if (message.chainId !== '') {
      writer.uint32(18).string(message.chainId);
    }
    if (message.valoper !== '') {
      writer.uint32(26).string(message.valoper);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): MsgUpdateValidatorSharesExchRate {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgUpdateValidatorSharesExchRate();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.creator = reader.string();
          break;
        case 2:
          message.chainId = reader.string();
          break;
        case 3:
          message.valoper = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): MsgUpdateValidatorSharesExchRate {
    return {
      creator: isSet(object.creator) ? String(object.creator) : '',
      chainId: isSet(object.chainId) ? String(object.chainId) : '',
      valoper: isSet(object.valoper) ? String(object.valoper) : '',
    };
  },
  toJSON(
    message: MsgUpdateValidatorSharesExchRate,
  ): JsonSafe<MsgUpdateValidatorSharesExchRate> {
    const obj: any = {};
    message.creator !== undefined && (obj.creator = message.creator);
    message.chainId !== undefined && (obj.chainId = message.chainId);
    message.valoper !== undefined && (obj.valoper = message.valoper);
    return obj;
  },
  fromPartial(
    object: Partial<MsgUpdateValidatorSharesExchRate>,
  ): MsgUpdateValidatorSharesExchRate {
    const message = createBaseMsgUpdateValidatorSharesExchRate();
    message.creator = object.creator ?? '';
    message.chainId = object.chainId ?? '';
    message.valoper = object.valoper ?? '';
    return message;
  },
  fromProtoMsg(
    message: MsgUpdateValidatorSharesExchRateProtoMsg,
  ): MsgUpdateValidatorSharesExchRate {
    return MsgUpdateValidatorSharesExchRate.decode(message.value);
  },
  toProto(message: MsgUpdateValidatorSharesExchRate): Uint8Array {
    return MsgUpdateValidatorSharesExchRate.encode(message).finish();
  },
  toProtoMsg(
    message: MsgUpdateValidatorSharesExchRate,
  ): MsgUpdateValidatorSharesExchRateProtoMsg {
    return {
      typeUrl: '/stride.stakeibc.MsgUpdateValidatorSharesExchRate',
      value: MsgUpdateValidatorSharesExchRate.encode(message).finish(),
    };
  },
};
function createBaseMsgUpdateValidatorSharesExchRateResponse(): MsgUpdateValidatorSharesExchRateResponse {
  return {};
}
export const MsgUpdateValidatorSharesExchRateResponse = {
  typeUrl: '/stride.stakeibc.MsgUpdateValidatorSharesExchRateResponse',
  encode(
    _: MsgUpdateValidatorSharesExchRateResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): MsgUpdateValidatorSharesExchRateResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgUpdateValidatorSharesExchRateResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(_: any): MsgUpdateValidatorSharesExchRateResponse {
    return {};
  },
  toJSON(
    _: MsgUpdateValidatorSharesExchRateResponse,
  ): JsonSafe<MsgUpdateValidatorSharesExchRateResponse> {
    const obj: any = {};
    return obj;
  },
  fromPartial(
    _: Partial<MsgUpdateValidatorSharesExchRateResponse>,
  ): MsgUpdateValidatorSharesExchRateResponse {
    const message = createBaseMsgUpdateValidatorSharesExchRateResponse();
    return message;
  },
  fromProtoMsg(
    message: MsgUpdateValidatorSharesExchRateResponseProtoMsg,
  ): MsgUpdateValidatorSharesExchRateResponse {
    return MsgUpdateValidatorSharesExchRateResponse.decode(message.value);
  },
  toProto(message: MsgUpdateValidatorSharesExchRateResponse): Uint8Array {
    return MsgUpdateValidatorSharesExchRateResponse.encode(message).finish();
  },
  toProtoMsg(
    message: MsgUpdateValidatorSharesExchRateResponse,
  ): MsgUpdateValidatorSharesExchRateResponseProtoMsg {
    return {
      typeUrl: '/stride.stakeibc.MsgUpdateValidatorSharesExchRateResponse',
      value: MsgUpdateValidatorSharesExchRateResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgCalibrateDelegation(): MsgCalibrateDelegation {
  return {
    creator: '',
    chainId: '',
    valoper: '',
  };
}
export const MsgCalibrateDelegation = {
  typeUrl: '/stride.stakeibc.MsgCalibrateDelegation',
  encode(
    message: MsgCalibrateDelegation,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.creator !== '') {
      writer.uint32(10).string(message.creator);
    }
    if (message.chainId !== '') {
      writer.uint32(18).string(message.chainId);
    }
    if (message.valoper !== '') {
      writer.uint32(26).string(message.valoper);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): MsgCalibrateDelegation {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCalibrateDelegation();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.creator = reader.string();
          break;
        case 2:
          message.chainId = reader.string();
          break;
        case 3:
          message.valoper = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): MsgCalibrateDelegation {
    return {
      creator: isSet(object.creator) ? String(object.creator) : '',
      chainId: isSet(object.chainId) ? String(object.chainId) : '',
      valoper: isSet(object.valoper) ? String(object.valoper) : '',
    };
  },
  toJSON(message: MsgCalibrateDelegation): JsonSafe<MsgCalibrateDelegation> {
    const obj: any = {};
    message.creator !== undefined && (obj.creator = message.creator);
    message.chainId !== undefined && (obj.chainId = message.chainId);
    message.valoper !== undefined && (obj.valoper = message.valoper);
    return obj;
  },
  fromPartial(object: Partial<MsgCalibrateDelegation>): MsgCalibrateDelegation {
    const message = createBaseMsgCalibrateDelegation();
    message.creator = object.creator ?? '';
    message.chainId = object.chainId ?? '';
    message.valoper = object.valoper ?? '';
    return message;
  },
  fromProtoMsg(
    message: MsgCalibrateDelegationProtoMsg,
  ): MsgCalibrateDelegation {
    return MsgCalibrateDelegation.decode(message.value);
  },
  toProto(message: MsgCalibrateDelegation): Uint8Array {
    return MsgCalibrateDelegation.encode(message).finish();
  },
  toProtoMsg(message: MsgCalibrateDelegation): MsgCalibrateDelegationProtoMsg {
    return {
      typeUrl: '/stride.stakeibc.MsgCalibrateDelegation',
      value: MsgCalibrateDelegation.encode(message).finish(),
    };
  },
};
function createBaseMsgCalibrateDelegationResponse(): MsgCalibrateDelegationResponse {
  return {};
}
export const MsgCalibrateDelegationResponse = {
  typeUrl: '/stride.stakeibc.MsgCalibrateDelegationResponse',
  encode(
    _: MsgCalibrateDelegationResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): MsgCalibrateDelegationResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCalibrateDelegationResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(_: any): MsgCalibrateDelegationResponse {
    return {};
  },
  toJSON(
    _: MsgCalibrateDelegationResponse,
  ): JsonSafe<MsgCalibrateDelegationResponse> {
    const obj: any = {};
    return obj;
  },
  fromPartial(
    _: Partial<MsgCalibrateDelegationResponse>,
  ): MsgCalibrateDelegationResponse {
    const message = createBaseMsgCalibrateDelegationResponse();
    return message;
  },
  fromProtoMsg(
    message: MsgCalibrateDelegationResponseProtoMsg,
  ): MsgCalibrateDelegationResponse {
    return MsgCalibrateDelegationResponse.decode(message.value);
  },
  toProto(message: MsgCalibrateDelegationResponse): Uint8Array {
    return MsgCalibrateDelegationResponse.encode(message).finish();
  },
  toProtoMsg(
    message: MsgCalibrateDelegationResponse,
  ): MsgCalibrateDelegationResponseProtoMsg {
    return {
      typeUrl: '/stride.stakeibc.MsgCalibrateDelegationResponse',
      value: MsgCalibrateDelegationResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgResumeHostZone(): MsgResumeHostZone {
  return {
    creator: '',
    chainId: '',
  };
}
export const MsgResumeHostZone = {
  typeUrl: '/stride.stakeibc.MsgResumeHostZone',
  encode(
    message: MsgResumeHostZone,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.creator !== '') {
      writer.uint32(10).string(message.creator);
    }
    if (message.chainId !== '') {
      writer.uint32(18).string(message.chainId);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgResumeHostZone {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgResumeHostZone();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.creator = reader.string();
          break;
        case 2:
          message.chainId = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): MsgResumeHostZone {
    return {
      creator: isSet(object.creator) ? String(object.creator) : '',
      chainId: isSet(object.chainId) ? String(object.chainId) : '',
    };
  },
  toJSON(message: MsgResumeHostZone): JsonSafe<MsgResumeHostZone> {
    const obj: any = {};
    message.creator !== undefined && (obj.creator = message.creator);
    message.chainId !== undefined && (obj.chainId = message.chainId);
    return obj;
  },
  fromPartial(object: Partial<MsgResumeHostZone>): MsgResumeHostZone {
    const message = createBaseMsgResumeHostZone();
    message.creator = object.creator ?? '';
    message.chainId = object.chainId ?? '';
    return message;
  },
  fromProtoMsg(message: MsgResumeHostZoneProtoMsg): MsgResumeHostZone {
    return MsgResumeHostZone.decode(message.value);
  },
  toProto(message: MsgResumeHostZone): Uint8Array {
    return MsgResumeHostZone.encode(message).finish();
  },
  toProtoMsg(message: MsgResumeHostZone): MsgResumeHostZoneProtoMsg {
    return {
      typeUrl: '/stride.stakeibc.MsgResumeHostZone',
      value: MsgResumeHostZone.encode(message).finish(),
    };
  },
};
function createBaseMsgResumeHostZoneResponse(): MsgResumeHostZoneResponse {
  return {};
}
export const MsgResumeHostZoneResponse = {
  typeUrl: '/stride.stakeibc.MsgResumeHostZoneResponse',
  encode(
    _: MsgResumeHostZoneResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): MsgResumeHostZoneResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgResumeHostZoneResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(_: any): MsgResumeHostZoneResponse {
    return {};
  },
  toJSON(_: MsgResumeHostZoneResponse): JsonSafe<MsgResumeHostZoneResponse> {
    const obj: any = {};
    return obj;
  },
  fromPartial(
    _: Partial<MsgResumeHostZoneResponse>,
  ): MsgResumeHostZoneResponse {
    const message = createBaseMsgResumeHostZoneResponse();
    return message;
  },
  fromProtoMsg(
    message: MsgResumeHostZoneResponseProtoMsg,
  ): MsgResumeHostZoneResponse {
    return MsgResumeHostZoneResponse.decode(message.value);
  },
  toProto(message: MsgResumeHostZoneResponse): Uint8Array {
    return MsgResumeHostZoneResponse.encode(message).finish();
  },
  toProtoMsg(
    message: MsgResumeHostZoneResponse,
  ): MsgResumeHostZoneResponseProtoMsg {
    return {
      typeUrl: '/stride.stakeibc.MsgResumeHostZoneResponse',
      value: MsgResumeHostZoneResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgCreateTradeRoute(): MsgCreateTradeRoute {
  return {
    authority: '',
    hostChainId: '',
    strideToRewardConnectionId: '',
    strideToTradeConnectionId: '',
    hostToRewardTransferChannelId: '',
    rewardToTradeTransferChannelId: '',
    tradeToHostTransferChannelId: '',
    rewardDenomOnHost: '',
    rewardDenomOnReward: '',
    rewardDenomOnTrade: '',
    hostDenomOnTrade: '',
    hostDenomOnHost: '',
    poolId: BigInt(0),
    maxAllowedSwapLossRate: '',
    minSwapAmount: '',
    maxSwapAmount: '',
    minTransferAmount: '',
  };
}
export const MsgCreateTradeRoute = {
  typeUrl: '/stride.stakeibc.MsgCreateTradeRoute',
  encode(
    message: MsgCreateTradeRoute,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.authority !== '') {
      writer.uint32(10).string(message.authority);
    }
    if (message.hostChainId !== '') {
      writer.uint32(18).string(message.hostChainId);
    }
    if (message.strideToRewardConnectionId !== '') {
      writer.uint32(26).string(message.strideToRewardConnectionId);
    }
    if (message.strideToTradeConnectionId !== '') {
      writer.uint32(34).string(message.strideToTradeConnectionId);
    }
    if (message.hostToRewardTransferChannelId !== '') {
      writer.uint32(42).string(message.hostToRewardTransferChannelId);
    }
    if (message.rewardToTradeTransferChannelId !== '') {
      writer.uint32(50).string(message.rewardToTradeTransferChannelId);
    }
    if (message.tradeToHostTransferChannelId !== '') {
      writer.uint32(58).string(message.tradeToHostTransferChannelId);
    }
    if (message.rewardDenomOnHost !== '') {
      writer.uint32(66).string(message.rewardDenomOnHost);
    }
    if (message.rewardDenomOnReward !== '') {
      writer.uint32(74).string(message.rewardDenomOnReward);
    }
    if (message.rewardDenomOnTrade !== '') {
      writer.uint32(82).string(message.rewardDenomOnTrade);
    }
    if (message.hostDenomOnTrade !== '') {
      writer.uint32(90).string(message.hostDenomOnTrade);
    }
    if (message.hostDenomOnHost !== '') {
      writer.uint32(98).string(message.hostDenomOnHost);
    }
    if (message.poolId !== BigInt(0)) {
      writer.uint32(104).uint64(message.poolId);
    }
    if (message.maxAllowedSwapLossRate !== '') {
      writer.uint32(114).string(message.maxAllowedSwapLossRate);
    }
    if (message.minSwapAmount !== '') {
      writer.uint32(122).string(message.minSwapAmount);
    }
    if (message.maxSwapAmount !== '') {
      writer.uint32(130).string(message.maxSwapAmount);
    }
    if (message.minTransferAmount !== '') {
      writer.uint32(138).string(message.minTransferAmount);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): MsgCreateTradeRoute {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCreateTradeRoute();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.authority = reader.string();
          break;
        case 2:
          message.hostChainId = reader.string();
          break;
        case 3:
          message.strideToRewardConnectionId = reader.string();
          break;
        case 4:
          message.strideToTradeConnectionId = reader.string();
          break;
        case 5:
          message.hostToRewardTransferChannelId = reader.string();
          break;
        case 6:
          message.rewardToTradeTransferChannelId = reader.string();
          break;
        case 7:
          message.tradeToHostTransferChannelId = reader.string();
          break;
        case 8:
          message.rewardDenomOnHost = reader.string();
          break;
        case 9:
          message.rewardDenomOnReward = reader.string();
          break;
        case 10:
          message.rewardDenomOnTrade = reader.string();
          break;
        case 11:
          message.hostDenomOnTrade = reader.string();
          break;
        case 12:
          message.hostDenomOnHost = reader.string();
          break;
        case 13:
          message.poolId = reader.uint64();
          break;
        case 14:
          message.maxAllowedSwapLossRate = reader.string();
          break;
        case 15:
          message.minSwapAmount = reader.string();
          break;
        case 16:
          message.maxSwapAmount = reader.string();
          break;
        case 17:
          message.minTransferAmount = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): MsgCreateTradeRoute {
    return {
      authority: isSet(object.authority) ? String(object.authority) : '',
      hostChainId: isSet(object.hostChainId) ? String(object.hostChainId) : '',
      strideToRewardConnectionId: isSet(object.strideToRewardConnectionId)
        ? String(object.strideToRewardConnectionId)
        : '',
      strideToTradeConnectionId: isSet(object.strideToTradeConnectionId)
        ? String(object.strideToTradeConnectionId)
        : '',
      hostToRewardTransferChannelId: isSet(object.hostToRewardTransferChannelId)
        ? String(object.hostToRewardTransferChannelId)
        : '',
      rewardToTradeTransferChannelId: isSet(
        object.rewardToTradeTransferChannelId,
      )
        ? String(object.rewardToTradeTransferChannelId)
        : '',
      tradeToHostTransferChannelId: isSet(object.tradeToHostTransferChannelId)
        ? String(object.tradeToHostTransferChannelId)
        : '',
      rewardDenomOnHost: isSet(object.rewardDenomOnHost)
        ? String(object.rewardDenomOnHost)
        : '',
      rewardDenomOnReward: isSet(object.rewardDenomOnReward)
        ? String(object.rewardDenomOnReward)
        : '',
      rewardDenomOnTrade: isSet(object.rewardDenomOnTrade)
        ? String(object.rewardDenomOnTrade)
        : '',
      hostDenomOnTrade: isSet(object.hostDenomOnTrade)
        ? String(object.hostDenomOnTrade)
        : '',
      hostDenomOnHost: isSet(object.hostDenomOnHost)
        ? String(object.hostDenomOnHost)
        : '',
      poolId: isSet(object.poolId)
        ? BigInt(object.poolId.toString())
        : BigInt(0),
      maxAllowedSwapLossRate: isSet(object.maxAllowedSwapLossRate)
        ? String(object.maxAllowedSwapLossRate)
        : '',
      minSwapAmount: isSet(object.minSwapAmount)
        ? String(object.minSwapAmount)
        : '',
      maxSwapAmount: isSet(object.maxSwapAmount)
        ? String(object.maxSwapAmount)
        : '',
      minTransferAmount: isSet(object.minTransferAmount)
        ? String(object.minTransferAmount)
        : '',
    };
  },
  toJSON(message: MsgCreateTradeRoute): JsonSafe<MsgCreateTradeRoute> {
    const obj: any = {};
    message.authority !== undefined && (obj.authority = message.authority);
    message.hostChainId !== undefined &&
      (obj.hostChainId = message.hostChainId);
    message.strideToRewardConnectionId !== undefined &&
      (obj.strideToRewardConnectionId = message.strideToRewardConnectionId);
    message.strideToTradeConnectionId !== undefined &&
      (obj.strideToTradeConnectionId = message.strideToTradeConnectionId);
    message.hostToRewardTransferChannelId !== undefined &&
      (obj.hostToRewardTransferChannelId =
        message.hostToRewardTransferChannelId);
    message.rewardToTradeTransferChannelId !== undefined &&
      (obj.rewardToTradeTransferChannelId =
        message.rewardToTradeTransferChannelId);
    message.tradeToHostTransferChannelId !== undefined &&
      (obj.tradeToHostTransferChannelId = message.tradeToHostTransferChannelId);
    message.rewardDenomOnHost !== undefined &&
      (obj.rewardDenomOnHost = message.rewardDenomOnHost);
    message.rewardDenomOnReward !== undefined &&
      (obj.rewardDenomOnReward = message.rewardDenomOnReward);
    message.rewardDenomOnTrade !== undefined &&
      (obj.rewardDenomOnTrade = message.rewardDenomOnTrade);
    message.hostDenomOnTrade !== undefined &&
      (obj.hostDenomOnTrade = message.hostDenomOnTrade);
    message.hostDenomOnHost !== undefined &&
      (obj.hostDenomOnHost = message.hostDenomOnHost);
    message.poolId !== undefined &&
      (obj.poolId = (message.poolId || BigInt(0)).toString());
    message.maxAllowedSwapLossRate !== undefined &&
      (obj.maxAllowedSwapLossRate = message.maxAllowedSwapLossRate);
    message.minSwapAmount !== undefined &&
      (obj.minSwapAmount = message.minSwapAmount);
    message.maxSwapAmount !== undefined &&
      (obj.maxSwapAmount = message.maxSwapAmount);
    message.minTransferAmount !== undefined &&
      (obj.minTransferAmount = message.minTransferAmount);
    return obj;
  },
  fromPartial(object: Partial<MsgCreateTradeRoute>): MsgCreateTradeRoute {
    const message = createBaseMsgCreateTradeRoute();
    message.authority = object.authority ?? '';
    message.hostChainId = object.hostChainId ?? '';
    message.strideToRewardConnectionId =
      object.strideToRewardConnectionId ?? '';
    message.strideToTradeConnectionId = object.strideToTradeConnectionId ?? '';
    message.hostToRewardTransferChannelId =
      object.hostToRewardTransferChannelId ?? '';
    message.rewardToTradeTransferChannelId =
      object.rewardToTradeTransferChannelId ?? '';
    message.tradeToHostTransferChannelId =
      object.tradeToHostTransferChannelId ?? '';
    message.rewardDenomOnHost = object.rewardDenomOnHost ?? '';
    message.rewardDenomOnReward = object.rewardDenomOnReward ?? '';
    message.rewardDenomOnTrade = object.rewardDenomOnTrade ?? '';
    message.hostDenomOnTrade = object.hostDenomOnTrade ?? '';
    message.hostDenomOnHost = object.hostDenomOnHost ?? '';
    message.poolId =
      object.poolId !== undefined && object.poolId !== null
        ? BigInt(object.poolId.toString())
        : BigInt(0);
    message.maxAllowedSwapLossRate = object.maxAllowedSwapLossRate ?? '';
    message.minSwapAmount = object.minSwapAmount ?? '';
    message.maxSwapAmount = object.maxSwapAmount ?? '';
    message.minTransferAmount = object.minTransferAmount ?? '';
    return message;
  },
  fromProtoMsg(message: MsgCreateTradeRouteProtoMsg): MsgCreateTradeRoute {
    return MsgCreateTradeRoute.decode(message.value);
  },
  toProto(message: MsgCreateTradeRoute): Uint8Array {
    return MsgCreateTradeRoute.encode(message).finish();
  },
  toProtoMsg(message: MsgCreateTradeRoute): MsgCreateTradeRouteProtoMsg {
    return {
      typeUrl: '/stride.stakeibc.MsgCreateTradeRoute',
      value: MsgCreateTradeRoute.encode(message).finish(),
    };
  },
};
function createBaseMsgCreateTradeRouteResponse(): MsgCreateTradeRouteResponse {
  return {};
}
export const MsgCreateTradeRouteResponse = {
  typeUrl: '/stride.stakeibc.MsgCreateTradeRouteResponse',
  encode(
    _: MsgCreateTradeRouteResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): MsgCreateTradeRouteResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCreateTradeRouteResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(_: any): MsgCreateTradeRouteResponse {
    return {};
  },
  toJSON(
    _: MsgCreateTradeRouteResponse,
  ): JsonSafe<MsgCreateTradeRouteResponse> {
    const obj: any = {};
    return obj;
  },
  fromPartial(
    _: Partial<MsgCreateTradeRouteResponse>,
  ): MsgCreateTradeRouteResponse {
    const message = createBaseMsgCreateTradeRouteResponse();
    return message;
  },
  fromProtoMsg(
    message: MsgCreateTradeRouteResponseProtoMsg,
  ): MsgCreateTradeRouteResponse {
    return MsgCreateTradeRouteResponse.decode(message.value);
  },
  toProto(message: MsgCreateTradeRouteResponse): Uint8Array {
    return MsgCreateTradeRouteResponse.encode(message).finish();
  },
  toProtoMsg(
    message: MsgCreateTradeRouteResponse,
  ): MsgCreateTradeRouteResponseProtoMsg {
    return {
      typeUrl: '/stride.stakeibc.MsgCreateTradeRouteResponse',
      value: MsgCreateTradeRouteResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgDeleteTradeRoute(): MsgDeleteTradeRoute {
  return {
    authority: '',
    rewardDenom: '',
    hostDenom: '',
  };
}
export const MsgDeleteTradeRoute = {
  typeUrl: '/stride.stakeibc.MsgDeleteTradeRoute',
  encode(
    message: MsgDeleteTradeRoute,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.authority !== '') {
      writer.uint32(10).string(message.authority);
    }
    if (message.rewardDenom !== '') {
      writer.uint32(18).string(message.rewardDenom);
    }
    if (message.hostDenom !== '') {
      writer.uint32(26).string(message.hostDenom);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): MsgDeleteTradeRoute {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgDeleteTradeRoute();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.authority = reader.string();
          break;
        case 2:
          message.rewardDenom = reader.string();
          break;
        case 3:
          message.hostDenom = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): MsgDeleteTradeRoute {
    return {
      authority: isSet(object.authority) ? String(object.authority) : '',
      rewardDenom: isSet(object.rewardDenom) ? String(object.rewardDenom) : '',
      hostDenom: isSet(object.hostDenom) ? String(object.hostDenom) : '',
    };
  },
  toJSON(message: MsgDeleteTradeRoute): JsonSafe<MsgDeleteTradeRoute> {
    const obj: any = {};
    message.authority !== undefined && (obj.authority = message.authority);
    message.rewardDenom !== undefined &&
      (obj.rewardDenom = message.rewardDenom);
    message.hostDenom !== undefined && (obj.hostDenom = message.hostDenom);
    return obj;
  },
  fromPartial(object: Partial<MsgDeleteTradeRoute>): MsgDeleteTradeRoute {
    const message = createBaseMsgDeleteTradeRoute();
    message.authority = object.authority ?? '';
    message.rewardDenom = object.rewardDenom ?? '';
    message.hostDenom = object.hostDenom ?? '';
    return message;
  },
  fromProtoMsg(message: MsgDeleteTradeRouteProtoMsg): MsgDeleteTradeRoute {
    return MsgDeleteTradeRoute.decode(message.value);
  },
  toProto(message: MsgDeleteTradeRoute): Uint8Array {
    return MsgDeleteTradeRoute.encode(message).finish();
  },
  toProtoMsg(message: MsgDeleteTradeRoute): MsgDeleteTradeRouteProtoMsg {
    return {
      typeUrl: '/stride.stakeibc.MsgDeleteTradeRoute',
      value: MsgDeleteTradeRoute.encode(message).finish(),
    };
  },
};
function createBaseMsgDeleteTradeRouteResponse(): MsgDeleteTradeRouteResponse {
  return {};
}
export const MsgDeleteTradeRouteResponse = {
  typeUrl: '/stride.stakeibc.MsgDeleteTradeRouteResponse',
  encode(
    _: MsgDeleteTradeRouteResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): MsgDeleteTradeRouteResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgDeleteTradeRouteResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(_: any): MsgDeleteTradeRouteResponse {
    return {};
  },
  toJSON(
    _: MsgDeleteTradeRouteResponse,
  ): JsonSafe<MsgDeleteTradeRouteResponse> {
    const obj: any = {};
    return obj;
  },
  fromPartial(
    _: Partial<MsgDeleteTradeRouteResponse>,
  ): MsgDeleteTradeRouteResponse {
    const message = createBaseMsgDeleteTradeRouteResponse();
    return message;
  },
  fromProtoMsg(
    message: MsgDeleteTradeRouteResponseProtoMsg,
  ): MsgDeleteTradeRouteResponse {
    return MsgDeleteTradeRouteResponse.decode(message.value);
  },
  toProto(message: MsgDeleteTradeRouteResponse): Uint8Array {
    return MsgDeleteTradeRouteResponse.encode(message).finish();
  },
  toProtoMsg(
    message: MsgDeleteTradeRouteResponse,
  ): MsgDeleteTradeRouteResponseProtoMsg {
    return {
      typeUrl: '/stride.stakeibc.MsgDeleteTradeRouteResponse',
      value: MsgDeleteTradeRouteResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgUpdateTradeRoute(): MsgUpdateTradeRoute {
  return {
    authority: '',
    rewardDenom: '',
    hostDenom: '',
    poolId: BigInt(0),
    maxAllowedSwapLossRate: '',
    minSwapAmount: '',
    maxSwapAmount: '',
    minTransferAmount: '',
  };
}
export const MsgUpdateTradeRoute = {
  typeUrl: '/stride.stakeibc.MsgUpdateTradeRoute',
  encode(
    message: MsgUpdateTradeRoute,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.authority !== '') {
      writer.uint32(10).string(message.authority);
    }
    if (message.rewardDenom !== '') {
      writer.uint32(18).string(message.rewardDenom);
    }
    if (message.hostDenom !== '') {
      writer.uint32(26).string(message.hostDenom);
    }
    if (message.poolId !== BigInt(0)) {
      writer.uint32(32).uint64(message.poolId);
    }
    if (message.maxAllowedSwapLossRate !== '') {
      writer.uint32(42).string(message.maxAllowedSwapLossRate);
    }
    if (message.minSwapAmount !== '') {
      writer.uint32(50).string(message.minSwapAmount);
    }
    if (message.maxSwapAmount !== '') {
      writer.uint32(58).string(message.maxSwapAmount);
    }
    if (message.minTransferAmount !== '') {
      writer.uint32(138).string(message.minTransferAmount);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): MsgUpdateTradeRoute {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgUpdateTradeRoute();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.authority = reader.string();
          break;
        case 2:
          message.rewardDenom = reader.string();
          break;
        case 3:
          message.hostDenom = reader.string();
          break;
        case 4:
          message.poolId = reader.uint64();
          break;
        case 5:
          message.maxAllowedSwapLossRate = reader.string();
          break;
        case 6:
          message.minSwapAmount = reader.string();
          break;
        case 7:
          message.maxSwapAmount = reader.string();
          break;
        case 17:
          message.minTransferAmount = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): MsgUpdateTradeRoute {
    return {
      authority: isSet(object.authority) ? String(object.authority) : '',
      rewardDenom: isSet(object.rewardDenom) ? String(object.rewardDenom) : '',
      hostDenom: isSet(object.hostDenom) ? String(object.hostDenom) : '',
      poolId: isSet(object.poolId)
        ? BigInt(object.poolId.toString())
        : BigInt(0),
      maxAllowedSwapLossRate: isSet(object.maxAllowedSwapLossRate)
        ? String(object.maxAllowedSwapLossRate)
        : '',
      minSwapAmount: isSet(object.minSwapAmount)
        ? String(object.minSwapAmount)
        : '',
      maxSwapAmount: isSet(object.maxSwapAmount)
        ? String(object.maxSwapAmount)
        : '',
      minTransferAmount: isSet(object.minTransferAmount)
        ? String(object.minTransferAmount)
        : '',
    };
  },
  toJSON(message: MsgUpdateTradeRoute): JsonSafe<MsgUpdateTradeRoute> {
    const obj: any = {};
    message.authority !== undefined && (obj.authority = message.authority);
    message.rewardDenom !== undefined &&
      (obj.rewardDenom = message.rewardDenom);
    message.hostDenom !== undefined && (obj.hostDenom = message.hostDenom);
    message.poolId !== undefined &&
      (obj.poolId = (message.poolId || BigInt(0)).toString());
    message.maxAllowedSwapLossRate !== undefined &&
      (obj.maxAllowedSwapLossRate = message.maxAllowedSwapLossRate);
    message.minSwapAmount !== undefined &&
      (obj.minSwapAmount = message.minSwapAmount);
    message.maxSwapAmount !== undefined &&
      (obj.maxSwapAmount = message.maxSwapAmount);
    message.minTransferAmount !== undefined &&
      (obj.minTransferAmount = message.minTransferAmount);
    return obj;
  },
  fromPartial(object: Partial<MsgUpdateTradeRoute>): MsgUpdateTradeRoute {
    const message = createBaseMsgUpdateTradeRoute();
    message.authority = object.authority ?? '';
    message.rewardDenom = object.rewardDenom ?? '';
    message.hostDenom = object.hostDenom ?? '';
    message.poolId =
      object.poolId !== undefined && object.poolId !== null
        ? BigInt(object.poolId.toString())
        : BigInt(0);
    message.maxAllowedSwapLossRate = object.maxAllowedSwapLossRate ?? '';
    message.minSwapAmount = object.minSwapAmount ?? '';
    message.maxSwapAmount = object.maxSwapAmount ?? '';
    message.minTransferAmount = object.minTransferAmount ?? '';
    return message;
  },
  fromProtoMsg(message: MsgUpdateTradeRouteProtoMsg): MsgUpdateTradeRoute {
    return MsgUpdateTradeRoute.decode(message.value);
  },
  toProto(message: MsgUpdateTradeRoute): Uint8Array {
    return MsgUpdateTradeRoute.encode(message).finish();
  },
  toProtoMsg(message: MsgUpdateTradeRoute): MsgUpdateTradeRouteProtoMsg {
    return {
      typeUrl: '/stride.stakeibc.MsgUpdateTradeRoute',
      value: MsgUpdateTradeRoute.encode(message).finish(),
    };
  },
};
function createBaseMsgUpdateTradeRouteResponse(): MsgUpdateTradeRouteResponse {
  return {};
}
export const MsgUpdateTradeRouteResponse = {
  typeUrl: '/stride.stakeibc.MsgUpdateTradeRouteResponse',
  encode(
    _: MsgUpdateTradeRouteResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): MsgUpdateTradeRouteResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgUpdateTradeRouteResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(_: any): MsgUpdateTradeRouteResponse {
    return {};
  },
  toJSON(
    _: MsgUpdateTradeRouteResponse,
  ): JsonSafe<MsgUpdateTradeRouteResponse> {
    const obj: any = {};
    return obj;
  },
  fromPartial(
    _: Partial<MsgUpdateTradeRouteResponse>,
  ): MsgUpdateTradeRouteResponse {
    const message = createBaseMsgUpdateTradeRouteResponse();
    return message;
  },
  fromProtoMsg(
    message: MsgUpdateTradeRouteResponseProtoMsg,
  ): MsgUpdateTradeRouteResponse {
    return MsgUpdateTradeRouteResponse.decode(message.value);
  },
  toProto(message: MsgUpdateTradeRouteResponse): Uint8Array {
    return MsgUpdateTradeRouteResponse.encode(message).finish();
  },
  toProtoMsg(
    message: MsgUpdateTradeRouteResponse,
  ): MsgUpdateTradeRouteResponseProtoMsg {
    return {
      typeUrl: '/stride.stakeibc.MsgUpdateTradeRouteResponse',
      value: MsgUpdateTradeRouteResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgSetCommunityPoolRebate(): MsgSetCommunityPoolRebate {
  return {
    creator: '',
    chainId: '',
    rebateRate: '',
    liquidStakedStTokenAmount: '',
  };
}
export const MsgSetCommunityPoolRebate = {
  typeUrl: '/stride.stakeibc.MsgSetCommunityPoolRebate',
  encode(
    message: MsgSetCommunityPoolRebate,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.creator !== '') {
      writer.uint32(10).string(message.creator);
    }
    if (message.chainId !== '') {
      writer.uint32(18).string(message.chainId);
    }
    if (message.rebateRate !== '') {
      writer
        .uint32(26)
        .string(Decimal.fromUserInput(message.rebateRate, 18).atomics);
    }
    if (message.liquidStakedStTokenAmount !== '') {
      writer.uint32(34).string(message.liquidStakedStTokenAmount);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): MsgSetCommunityPoolRebate {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgSetCommunityPoolRebate();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.creator = reader.string();
          break;
        case 2:
          message.chainId = reader.string();
          break;
        case 3:
          message.rebateRate = Decimal.fromAtomics(
            reader.string(),
            18,
          ).toString();
          break;
        case 4:
          message.liquidStakedStTokenAmount = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): MsgSetCommunityPoolRebate {
    return {
      creator: isSet(object.creator) ? String(object.creator) : '',
      chainId: isSet(object.chainId) ? String(object.chainId) : '',
      rebateRate: isSet(object.rebateRate) ? String(object.rebateRate) : '',
      liquidStakedStTokenAmount: isSet(object.liquidStakedStTokenAmount)
        ? String(object.liquidStakedStTokenAmount)
        : '',
    };
  },
  toJSON(
    message: MsgSetCommunityPoolRebate,
  ): JsonSafe<MsgSetCommunityPoolRebate> {
    const obj: any = {};
    message.creator !== undefined && (obj.creator = message.creator);
    message.chainId !== undefined && (obj.chainId = message.chainId);
    message.rebateRate !== undefined && (obj.rebateRate = message.rebateRate);
    message.liquidStakedStTokenAmount !== undefined &&
      (obj.liquidStakedStTokenAmount = message.liquidStakedStTokenAmount);
    return obj;
  },
  fromPartial(
    object: Partial<MsgSetCommunityPoolRebate>,
  ): MsgSetCommunityPoolRebate {
    const message = createBaseMsgSetCommunityPoolRebate();
    message.creator = object.creator ?? '';
    message.chainId = object.chainId ?? '';
    message.rebateRate = object.rebateRate ?? '';
    message.liquidStakedStTokenAmount = object.liquidStakedStTokenAmount ?? '';
    return message;
  },
  fromProtoMsg(
    message: MsgSetCommunityPoolRebateProtoMsg,
  ): MsgSetCommunityPoolRebate {
    return MsgSetCommunityPoolRebate.decode(message.value);
  },
  toProto(message: MsgSetCommunityPoolRebate): Uint8Array {
    return MsgSetCommunityPoolRebate.encode(message).finish();
  },
  toProtoMsg(
    message: MsgSetCommunityPoolRebate,
  ): MsgSetCommunityPoolRebateProtoMsg {
    return {
      typeUrl: '/stride.stakeibc.MsgSetCommunityPoolRebate',
      value: MsgSetCommunityPoolRebate.encode(message).finish(),
    };
  },
};
function createBaseMsgSetCommunityPoolRebateResponse(): MsgSetCommunityPoolRebateResponse {
  return {};
}
export const MsgSetCommunityPoolRebateResponse = {
  typeUrl: '/stride.stakeibc.MsgSetCommunityPoolRebateResponse',
  encode(
    _: MsgSetCommunityPoolRebateResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): MsgSetCommunityPoolRebateResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgSetCommunityPoolRebateResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(_: any): MsgSetCommunityPoolRebateResponse {
    return {};
  },
  toJSON(
    _: MsgSetCommunityPoolRebateResponse,
  ): JsonSafe<MsgSetCommunityPoolRebateResponse> {
    const obj: any = {};
    return obj;
  },
  fromPartial(
    _: Partial<MsgSetCommunityPoolRebateResponse>,
  ): MsgSetCommunityPoolRebateResponse {
    const message = createBaseMsgSetCommunityPoolRebateResponse();
    return message;
  },
  fromProtoMsg(
    message: MsgSetCommunityPoolRebateResponseProtoMsg,
  ): MsgSetCommunityPoolRebateResponse {
    return MsgSetCommunityPoolRebateResponse.decode(message.value);
  },
  toProto(message: MsgSetCommunityPoolRebateResponse): Uint8Array {
    return MsgSetCommunityPoolRebateResponse.encode(message).finish();
  },
  toProtoMsg(
    message: MsgSetCommunityPoolRebateResponse,
  ): MsgSetCommunityPoolRebateResponseProtoMsg {
    return {
      typeUrl: '/stride.stakeibc.MsgSetCommunityPoolRebateResponse',
      value: MsgSetCommunityPoolRebateResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgToggleTradeController(): MsgToggleTradeController {
  return {
    creator: '',
    chainId: '',
    permissionChange: 0,
    address: '',
    legacy: false,
  };
}
export const MsgToggleTradeController = {
  typeUrl: '/stride.stakeibc.MsgToggleTradeController',
  encode(
    message: MsgToggleTradeController,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.creator !== '') {
      writer.uint32(10).string(message.creator);
    }
    if (message.chainId !== '') {
      writer.uint32(18).string(message.chainId);
    }
    if (message.permissionChange !== 0) {
      writer.uint32(24).int32(message.permissionChange);
    }
    if (message.address !== '') {
      writer.uint32(34).string(message.address);
    }
    if (message.legacy === true) {
      writer.uint32(40).bool(message.legacy);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): MsgToggleTradeController {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgToggleTradeController();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.creator = reader.string();
          break;
        case 2:
          message.chainId = reader.string();
          break;
        case 3:
          message.permissionChange = reader.int32() as any;
          break;
        case 4:
          message.address = reader.string();
          break;
        case 5:
          message.legacy = reader.bool();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): MsgToggleTradeController {
    return {
      creator: isSet(object.creator) ? String(object.creator) : '',
      chainId: isSet(object.chainId) ? String(object.chainId) : '',
      permissionChange: isSet(object.permissionChange)
        ? authzPermissionChangeFromJSON(object.permissionChange)
        : -1,
      address: isSet(object.address) ? String(object.address) : '',
      legacy: isSet(object.legacy) ? Boolean(object.legacy) : false,
    };
  },
  toJSON(
    message: MsgToggleTradeController,
  ): JsonSafe<MsgToggleTradeController> {
    const obj: any = {};
    message.creator !== undefined && (obj.creator = message.creator);
    message.chainId !== undefined && (obj.chainId = message.chainId);
    message.permissionChange !== undefined &&
      (obj.permissionChange = authzPermissionChangeToJSON(
        message.permissionChange,
      ));
    message.address !== undefined && (obj.address = message.address);
    message.legacy !== undefined && (obj.legacy = message.legacy);
    return obj;
  },
  fromPartial(
    object: Partial<MsgToggleTradeController>,
  ): MsgToggleTradeController {
    const message = createBaseMsgToggleTradeController();
    message.creator = object.creator ?? '';
    message.chainId = object.chainId ?? '';
    message.permissionChange = object.permissionChange ?? 0;
    message.address = object.address ?? '';
    message.legacy = object.legacy ?? false;
    return message;
  },
  fromProtoMsg(
    message: MsgToggleTradeControllerProtoMsg,
  ): MsgToggleTradeController {
    return MsgToggleTradeController.decode(message.value);
  },
  toProto(message: MsgToggleTradeController): Uint8Array {
    return MsgToggleTradeController.encode(message).finish();
  },
  toProtoMsg(
    message: MsgToggleTradeController,
  ): MsgToggleTradeControllerProtoMsg {
    return {
      typeUrl: '/stride.stakeibc.MsgToggleTradeController',
      value: MsgToggleTradeController.encode(message).finish(),
    };
  },
};
function createBaseMsgToggleTradeControllerResponse(): MsgToggleTradeControllerResponse {
  return {};
}
export const MsgToggleTradeControllerResponse = {
  typeUrl: '/stride.stakeibc.MsgToggleTradeControllerResponse',
  encode(
    _: MsgToggleTradeControllerResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): MsgToggleTradeControllerResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgToggleTradeControllerResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(_: any): MsgToggleTradeControllerResponse {
    return {};
  },
  toJSON(
    _: MsgToggleTradeControllerResponse,
  ): JsonSafe<MsgToggleTradeControllerResponse> {
    const obj: any = {};
    return obj;
  },
  fromPartial(
    _: Partial<MsgToggleTradeControllerResponse>,
  ): MsgToggleTradeControllerResponse {
    const message = createBaseMsgToggleTradeControllerResponse();
    return message;
  },
  fromProtoMsg(
    message: MsgToggleTradeControllerResponseProtoMsg,
  ): MsgToggleTradeControllerResponse {
    return MsgToggleTradeControllerResponse.decode(message.value);
  },
  toProto(message: MsgToggleTradeControllerResponse): Uint8Array {
    return MsgToggleTradeControllerResponse.encode(message).finish();
  },
  toProtoMsg(
    message: MsgToggleTradeControllerResponse,
  ): MsgToggleTradeControllerResponseProtoMsg {
    return {
      typeUrl: '/stride.stakeibc.MsgToggleTradeControllerResponse',
      value: MsgToggleTradeControllerResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgUpdateHostZoneParams(): MsgUpdateHostZoneParams {
  return {
    authority: '',
    chainId: '',
    maxMessagesPerIcaTx: BigInt(0),
  };
}
export const MsgUpdateHostZoneParams = {
  typeUrl: '/stride.stakeibc.MsgUpdateHostZoneParams',
  encode(
    message: MsgUpdateHostZoneParams,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.authority !== '') {
      writer.uint32(10).string(message.authority);
    }
    if (message.chainId !== '') {
      writer.uint32(18).string(message.chainId);
    }
    if (message.maxMessagesPerIcaTx !== BigInt(0)) {
      writer.uint32(24).uint64(message.maxMessagesPerIcaTx);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): MsgUpdateHostZoneParams {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgUpdateHostZoneParams();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.authority = reader.string();
          break;
        case 2:
          message.chainId = reader.string();
          break;
        case 3:
          message.maxMessagesPerIcaTx = reader.uint64();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): MsgUpdateHostZoneParams {
    return {
      authority: isSet(object.authority) ? String(object.authority) : '',
      chainId: isSet(object.chainId) ? String(object.chainId) : '',
      maxMessagesPerIcaTx: isSet(object.maxMessagesPerIcaTx)
        ? BigInt(object.maxMessagesPerIcaTx.toString())
        : BigInt(0),
    };
  },
  toJSON(message: MsgUpdateHostZoneParams): JsonSafe<MsgUpdateHostZoneParams> {
    const obj: any = {};
    message.authority !== undefined && (obj.authority = message.authority);
    message.chainId !== undefined && (obj.chainId = message.chainId);
    message.maxMessagesPerIcaTx !== undefined &&
      (obj.maxMessagesPerIcaTx = (
        message.maxMessagesPerIcaTx || BigInt(0)
      ).toString());
    return obj;
  },
  fromPartial(
    object: Partial<MsgUpdateHostZoneParams>,
  ): MsgUpdateHostZoneParams {
    const message = createBaseMsgUpdateHostZoneParams();
    message.authority = object.authority ?? '';
    message.chainId = object.chainId ?? '';
    message.maxMessagesPerIcaTx =
      object.maxMessagesPerIcaTx !== undefined &&
      object.maxMessagesPerIcaTx !== null
        ? BigInt(object.maxMessagesPerIcaTx.toString())
        : BigInt(0);
    return message;
  },
  fromProtoMsg(
    message: MsgUpdateHostZoneParamsProtoMsg,
  ): MsgUpdateHostZoneParams {
    return MsgUpdateHostZoneParams.decode(message.value);
  },
  toProto(message: MsgUpdateHostZoneParams): Uint8Array {
    return MsgUpdateHostZoneParams.encode(message).finish();
  },
  toProtoMsg(
    message: MsgUpdateHostZoneParams,
  ): MsgUpdateHostZoneParamsProtoMsg {
    return {
      typeUrl: '/stride.stakeibc.MsgUpdateHostZoneParams',
      value: MsgUpdateHostZoneParams.encode(message).finish(),
    };
  },
};
function createBaseMsgUpdateHostZoneParamsResponse(): MsgUpdateHostZoneParamsResponse {
  return {};
}
export const MsgUpdateHostZoneParamsResponse = {
  typeUrl: '/stride.stakeibc.MsgUpdateHostZoneParamsResponse',
  encode(
    _: MsgUpdateHostZoneParamsResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): MsgUpdateHostZoneParamsResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgUpdateHostZoneParamsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(_: any): MsgUpdateHostZoneParamsResponse {
    return {};
  },
  toJSON(
    _: MsgUpdateHostZoneParamsResponse,
  ): JsonSafe<MsgUpdateHostZoneParamsResponse> {
    const obj: any = {};
    return obj;
  },
  fromPartial(
    _: Partial<MsgUpdateHostZoneParamsResponse>,
  ): MsgUpdateHostZoneParamsResponse {
    const message = createBaseMsgUpdateHostZoneParamsResponse();
    return message;
  },
  fromProtoMsg(
    message: MsgUpdateHostZoneParamsResponseProtoMsg,
  ): MsgUpdateHostZoneParamsResponse {
    return MsgUpdateHostZoneParamsResponse.decode(message.value);
  },
  toProto(message: MsgUpdateHostZoneParamsResponse): Uint8Array {
    return MsgUpdateHostZoneParamsResponse.encode(message).finish();
  },
  toProtoMsg(
    message: MsgUpdateHostZoneParamsResponse,
  ): MsgUpdateHostZoneParamsResponseProtoMsg {
    return {
      typeUrl: '/stride.stakeibc.MsgUpdateHostZoneParamsResponse',
      value: MsgUpdateHostZoneParamsResponse.encode(message).finish(),
    };
  },
};
