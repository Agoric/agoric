//@ts-nocheck
import { Validator, type ValidatorSDKType } from './validator.js';
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { Decimal, isSet } from '../../helpers.js';
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
function createBaseCommunityPoolRebate(): CommunityPoolRebate {
  return {
    rebateRate: '',
    liquidStakedStTokenAmount: '',
  };
}
export const CommunityPoolRebate = {
  typeUrl: '/stride.stakeibc.CommunityPoolRebate',
  encode(
    message: CommunityPoolRebate,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.rebateRate !== '') {
      writer
        .uint32(10)
        .string(Decimal.fromUserInput(message.rebateRate, 18).atomics);
    }
    if (message.liquidStakedStTokenAmount !== '') {
      writer.uint32(18).string(message.liquidStakedStTokenAmount);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): CommunityPoolRebate {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommunityPoolRebate();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.rebateRate = Decimal.fromAtomics(
            reader.string(),
            18,
          ).toString();
          break;
        case 2:
          message.liquidStakedStTokenAmount = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): CommunityPoolRebate {
    return {
      rebateRate: isSet(object.rebateRate) ? String(object.rebateRate) : '',
      liquidStakedStTokenAmount: isSet(object.liquidStakedStTokenAmount)
        ? String(object.liquidStakedStTokenAmount)
        : '',
    };
  },
  toJSON(message: CommunityPoolRebate): JsonSafe<CommunityPoolRebate> {
    const obj: any = {};
    message.rebateRate !== undefined && (obj.rebateRate = message.rebateRate);
    message.liquidStakedStTokenAmount !== undefined &&
      (obj.liquidStakedStTokenAmount = message.liquidStakedStTokenAmount);
    return obj;
  },
  fromPartial(object: Partial<CommunityPoolRebate>): CommunityPoolRebate {
    const message = createBaseCommunityPoolRebate();
    message.rebateRate = object.rebateRate ?? '';
    message.liquidStakedStTokenAmount = object.liquidStakedStTokenAmount ?? '';
    return message;
  },
  fromProtoMsg(message: CommunityPoolRebateProtoMsg): CommunityPoolRebate {
    return CommunityPoolRebate.decode(message.value);
  },
  toProto(message: CommunityPoolRebate): Uint8Array {
    return CommunityPoolRebate.encode(message).finish();
  },
  toProtoMsg(message: CommunityPoolRebate): CommunityPoolRebateProtoMsg {
    return {
      typeUrl: '/stride.stakeibc.CommunityPoolRebate',
      value: CommunityPoolRebate.encode(message).finish(),
    };
  },
};
function createBaseHostZone(): HostZone {
  return {
    chainId: '',
    bech32prefix: '',
    connectionId: '',
    transferChannelId: '',
    ibcDenom: '',
    hostDenom: '',
    unbondingPeriod: BigInt(0),
    validators: [],
    depositAddress: '',
    withdrawalIcaAddress: '',
    feeIcaAddress: '',
    delegationIcaAddress: '',
    redemptionIcaAddress: '',
    communityPoolDepositIcaAddress: '',
    communityPoolReturnIcaAddress: '',
    communityPoolStakeHoldingAddress: '',
    communityPoolRedeemHoldingAddress: '',
    communityPoolTreasuryAddress: '',
    totalDelegations: '',
    lastRedemptionRate: '',
    redemptionRate: '',
    minRedemptionRate: '',
    maxRedemptionRate: '',
    minInnerRedemptionRate: '',
    maxInnerRedemptionRate: '',
    maxMessagesPerIcaTx: BigInt(0),
    redemptionsEnabled: false,
    communityPoolRebate: undefined,
    lsmLiquidStakeEnabled: false,
    halted: false,
  };
}
export const HostZone = {
  typeUrl: '/stride.stakeibc.HostZone',
  encode(
    message: HostZone,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.chainId !== '') {
      writer.uint32(10).string(message.chainId);
    }
    if (message.bech32prefix !== '') {
      writer.uint32(138).string(message.bech32prefix);
    }
    if (message.connectionId !== '') {
      writer.uint32(18).string(message.connectionId);
    }
    if (message.transferChannelId !== '') {
      writer.uint32(98).string(message.transferChannelId);
    }
    if (message.ibcDenom !== '') {
      writer.uint32(66).string(message.ibcDenom);
    }
    if (message.hostDenom !== '') {
      writer.uint32(74).string(message.hostDenom);
    }
    if (message.unbondingPeriod !== BigInt(0)) {
      writer.uint32(208).uint64(message.unbondingPeriod);
    }
    for (const v of message.validators) {
      Validator.encode(v!, writer.uint32(26).fork()).ldelim();
    }
    if (message.depositAddress !== '') {
      writer.uint32(146).string(message.depositAddress);
    }
    if (message.withdrawalIcaAddress !== '') {
      writer.uint32(178).string(message.withdrawalIcaAddress);
    }
    if (message.feeIcaAddress !== '') {
      writer.uint32(186).string(message.feeIcaAddress);
    }
    if (message.delegationIcaAddress !== '') {
      writer.uint32(194).string(message.delegationIcaAddress);
    }
    if (message.redemptionIcaAddress !== '') {
      writer.uint32(202).string(message.redemptionIcaAddress);
    }
    if (message.communityPoolDepositIcaAddress !== '') {
      writer.uint32(242).string(message.communityPoolDepositIcaAddress);
    }
    if (message.communityPoolReturnIcaAddress !== '') {
      writer.uint32(250).string(message.communityPoolReturnIcaAddress);
    }
    if (message.communityPoolStakeHoldingAddress !== '') {
      writer.uint32(258).string(message.communityPoolStakeHoldingAddress);
    }
    if (message.communityPoolRedeemHoldingAddress !== '') {
      writer.uint32(266).string(message.communityPoolRedeemHoldingAddress);
    }
    if (message.communityPoolTreasuryAddress !== '') {
      writer.uint32(282).string(message.communityPoolTreasuryAddress);
    }
    if (message.totalDelegations !== '') {
      writer.uint32(106).string(message.totalDelegations);
    }
    if (message.lastRedemptionRate !== '') {
      writer
        .uint32(82)
        .string(Decimal.fromUserInput(message.lastRedemptionRate, 18).atomics);
    }
    if (message.redemptionRate !== '') {
      writer
        .uint32(90)
        .string(Decimal.fromUserInput(message.redemptionRate, 18).atomics);
    }
    if (message.minRedemptionRate !== '') {
      writer
        .uint32(162)
        .string(Decimal.fromUserInput(message.minRedemptionRate, 18).atomics);
    }
    if (message.maxRedemptionRate !== '') {
      writer
        .uint32(170)
        .string(Decimal.fromUserInput(message.maxRedemptionRate, 18).atomics);
    }
    if (message.minInnerRedemptionRate !== '') {
      writer
        .uint32(226)
        .string(
          Decimal.fromUserInput(message.minInnerRedemptionRate, 18).atomics,
        );
    }
    if (message.maxInnerRedemptionRate !== '') {
      writer
        .uint32(234)
        .string(
          Decimal.fromUserInput(message.maxInnerRedemptionRate, 18).atomics,
        );
    }
    if (message.maxMessagesPerIcaTx !== BigInt(0)) {
      writer.uint32(288).uint64(message.maxMessagesPerIcaTx);
    }
    if (message.redemptionsEnabled === true) {
      writer.uint32(296).bool(message.redemptionsEnabled);
    }
    if (message.communityPoolRebate !== undefined) {
      CommunityPoolRebate.encode(
        message.communityPoolRebate,
        writer.uint32(274).fork(),
      ).ldelim();
    }
    if (message.lsmLiquidStakeEnabled === true) {
      writer.uint32(216).bool(message.lsmLiquidStakeEnabled);
    }
    if (message.halted === true) {
      writer.uint32(152).bool(message.halted);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): HostZone {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseHostZone();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.chainId = reader.string();
          break;
        case 17:
          message.bech32prefix = reader.string();
          break;
        case 2:
          message.connectionId = reader.string();
          break;
        case 12:
          message.transferChannelId = reader.string();
          break;
        case 8:
          message.ibcDenom = reader.string();
          break;
        case 9:
          message.hostDenom = reader.string();
          break;
        case 26:
          message.unbondingPeriod = reader.uint64();
          break;
        case 3:
          message.validators.push(Validator.decode(reader, reader.uint32()));
          break;
        case 18:
          message.depositAddress = reader.string();
          break;
        case 22:
          message.withdrawalIcaAddress = reader.string();
          break;
        case 23:
          message.feeIcaAddress = reader.string();
          break;
        case 24:
          message.delegationIcaAddress = reader.string();
          break;
        case 25:
          message.redemptionIcaAddress = reader.string();
          break;
        case 30:
          message.communityPoolDepositIcaAddress = reader.string();
          break;
        case 31:
          message.communityPoolReturnIcaAddress = reader.string();
          break;
        case 32:
          message.communityPoolStakeHoldingAddress = reader.string();
          break;
        case 33:
          message.communityPoolRedeemHoldingAddress = reader.string();
          break;
        case 35:
          message.communityPoolTreasuryAddress = reader.string();
          break;
        case 13:
          message.totalDelegations = reader.string();
          break;
        case 10:
          message.lastRedemptionRate = Decimal.fromAtomics(
            reader.string(),
            18,
          ).toString();
          break;
        case 11:
          message.redemptionRate = Decimal.fromAtomics(
            reader.string(),
            18,
          ).toString();
          break;
        case 20:
          message.minRedemptionRate = Decimal.fromAtomics(
            reader.string(),
            18,
          ).toString();
          break;
        case 21:
          message.maxRedemptionRate = Decimal.fromAtomics(
            reader.string(),
            18,
          ).toString();
          break;
        case 28:
          message.minInnerRedemptionRate = Decimal.fromAtomics(
            reader.string(),
            18,
          ).toString();
          break;
        case 29:
          message.maxInnerRedemptionRate = Decimal.fromAtomics(
            reader.string(),
            18,
          ).toString();
          break;
        case 36:
          message.maxMessagesPerIcaTx = reader.uint64();
          break;
        case 37:
          message.redemptionsEnabled = reader.bool();
          break;
        case 34:
          message.communityPoolRebate = CommunityPoolRebate.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 27:
          message.lsmLiquidStakeEnabled = reader.bool();
          break;
        case 19:
          message.halted = reader.bool();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): HostZone {
    return {
      chainId: isSet(object.chainId) ? String(object.chainId) : '',
      bech32prefix: isSet(object.bech32prefix)
        ? String(object.bech32prefix)
        : '',
      connectionId: isSet(object.connectionId)
        ? String(object.connectionId)
        : '',
      transferChannelId: isSet(object.transferChannelId)
        ? String(object.transferChannelId)
        : '',
      ibcDenom: isSet(object.ibcDenom) ? String(object.ibcDenom) : '',
      hostDenom: isSet(object.hostDenom) ? String(object.hostDenom) : '',
      unbondingPeriod: isSet(object.unbondingPeriod)
        ? BigInt(object.unbondingPeriod.toString())
        : BigInt(0),
      validators: Array.isArray(object?.validators)
        ? object.validators.map((e: any) => Validator.fromJSON(e))
        : [],
      depositAddress: isSet(object.depositAddress)
        ? String(object.depositAddress)
        : '',
      withdrawalIcaAddress: isSet(object.withdrawalIcaAddress)
        ? String(object.withdrawalIcaAddress)
        : '',
      feeIcaAddress: isSet(object.feeIcaAddress)
        ? String(object.feeIcaAddress)
        : '',
      delegationIcaAddress: isSet(object.delegationIcaAddress)
        ? String(object.delegationIcaAddress)
        : '',
      redemptionIcaAddress: isSet(object.redemptionIcaAddress)
        ? String(object.redemptionIcaAddress)
        : '',
      communityPoolDepositIcaAddress: isSet(
        object.communityPoolDepositIcaAddress,
      )
        ? String(object.communityPoolDepositIcaAddress)
        : '',
      communityPoolReturnIcaAddress: isSet(object.communityPoolReturnIcaAddress)
        ? String(object.communityPoolReturnIcaAddress)
        : '',
      communityPoolStakeHoldingAddress: isSet(
        object.communityPoolStakeHoldingAddress,
      )
        ? String(object.communityPoolStakeHoldingAddress)
        : '',
      communityPoolRedeemHoldingAddress: isSet(
        object.communityPoolRedeemHoldingAddress,
      )
        ? String(object.communityPoolRedeemHoldingAddress)
        : '',
      communityPoolTreasuryAddress: isSet(object.communityPoolTreasuryAddress)
        ? String(object.communityPoolTreasuryAddress)
        : '',
      totalDelegations: isSet(object.totalDelegations)
        ? String(object.totalDelegations)
        : '',
      lastRedemptionRate: isSet(object.lastRedemptionRate)
        ? String(object.lastRedemptionRate)
        : '',
      redemptionRate: isSet(object.redemptionRate)
        ? String(object.redemptionRate)
        : '',
      minRedemptionRate: isSet(object.minRedemptionRate)
        ? String(object.minRedemptionRate)
        : '',
      maxRedemptionRate: isSet(object.maxRedemptionRate)
        ? String(object.maxRedemptionRate)
        : '',
      minInnerRedemptionRate: isSet(object.minInnerRedemptionRate)
        ? String(object.minInnerRedemptionRate)
        : '',
      maxInnerRedemptionRate: isSet(object.maxInnerRedemptionRate)
        ? String(object.maxInnerRedemptionRate)
        : '',
      maxMessagesPerIcaTx: isSet(object.maxMessagesPerIcaTx)
        ? BigInt(object.maxMessagesPerIcaTx.toString())
        : BigInt(0),
      redemptionsEnabled: isSet(object.redemptionsEnabled)
        ? Boolean(object.redemptionsEnabled)
        : false,
      communityPoolRebate: isSet(object.communityPoolRebate)
        ? CommunityPoolRebate.fromJSON(object.communityPoolRebate)
        : undefined,
      lsmLiquidStakeEnabled: isSet(object.lsmLiquidStakeEnabled)
        ? Boolean(object.lsmLiquidStakeEnabled)
        : false,
      halted: isSet(object.halted) ? Boolean(object.halted) : false,
    };
  },
  toJSON(message: HostZone): JsonSafe<HostZone> {
    const obj: any = {};
    message.chainId !== undefined && (obj.chainId = message.chainId);
    message.bech32prefix !== undefined &&
      (obj.bech32prefix = message.bech32prefix);
    message.connectionId !== undefined &&
      (obj.connectionId = message.connectionId);
    message.transferChannelId !== undefined &&
      (obj.transferChannelId = message.transferChannelId);
    message.ibcDenom !== undefined && (obj.ibcDenom = message.ibcDenom);
    message.hostDenom !== undefined && (obj.hostDenom = message.hostDenom);
    message.unbondingPeriod !== undefined &&
      (obj.unbondingPeriod = (message.unbondingPeriod || BigInt(0)).toString());
    if (message.validators) {
      obj.validators = message.validators.map(e =>
        e ? Validator.toJSON(e) : undefined,
      );
    } else {
      obj.validators = [];
    }
    message.depositAddress !== undefined &&
      (obj.depositAddress = message.depositAddress);
    message.withdrawalIcaAddress !== undefined &&
      (obj.withdrawalIcaAddress = message.withdrawalIcaAddress);
    message.feeIcaAddress !== undefined &&
      (obj.feeIcaAddress = message.feeIcaAddress);
    message.delegationIcaAddress !== undefined &&
      (obj.delegationIcaAddress = message.delegationIcaAddress);
    message.redemptionIcaAddress !== undefined &&
      (obj.redemptionIcaAddress = message.redemptionIcaAddress);
    message.communityPoolDepositIcaAddress !== undefined &&
      (obj.communityPoolDepositIcaAddress =
        message.communityPoolDepositIcaAddress);
    message.communityPoolReturnIcaAddress !== undefined &&
      (obj.communityPoolReturnIcaAddress =
        message.communityPoolReturnIcaAddress);
    message.communityPoolStakeHoldingAddress !== undefined &&
      (obj.communityPoolStakeHoldingAddress =
        message.communityPoolStakeHoldingAddress);
    message.communityPoolRedeemHoldingAddress !== undefined &&
      (obj.communityPoolRedeemHoldingAddress =
        message.communityPoolRedeemHoldingAddress);
    message.communityPoolTreasuryAddress !== undefined &&
      (obj.communityPoolTreasuryAddress = message.communityPoolTreasuryAddress);
    message.totalDelegations !== undefined &&
      (obj.totalDelegations = message.totalDelegations);
    message.lastRedemptionRate !== undefined &&
      (obj.lastRedemptionRate = message.lastRedemptionRate);
    message.redemptionRate !== undefined &&
      (obj.redemptionRate = message.redemptionRate);
    message.minRedemptionRate !== undefined &&
      (obj.minRedemptionRate = message.minRedemptionRate);
    message.maxRedemptionRate !== undefined &&
      (obj.maxRedemptionRate = message.maxRedemptionRate);
    message.minInnerRedemptionRate !== undefined &&
      (obj.minInnerRedemptionRate = message.minInnerRedemptionRate);
    message.maxInnerRedemptionRate !== undefined &&
      (obj.maxInnerRedemptionRate = message.maxInnerRedemptionRate);
    message.maxMessagesPerIcaTx !== undefined &&
      (obj.maxMessagesPerIcaTx = (
        message.maxMessagesPerIcaTx || BigInt(0)
      ).toString());
    message.redemptionsEnabled !== undefined &&
      (obj.redemptionsEnabled = message.redemptionsEnabled);
    message.communityPoolRebate !== undefined &&
      (obj.communityPoolRebate = message.communityPoolRebate
        ? CommunityPoolRebate.toJSON(message.communityPoolRebate)
        : undefined);
    message.lsmLiquidStakeEnabled !== undefined &&
      (obj.lsmLiquidStakeEnabled = message.lsmLiquidStakeEnabled);
    message.halted !== undefined && (obj.halted = message.halted);
    return obj;
  },
  fromPartial(object: Partial<HostZone>): HostZone {
    const message = createBaseHostZone();
    message.chainId = object.chainId ?? '';
    message.bech32prefix = object.bech32prefix ?? '';
    message.connectionId = object.connectionId ?? '';
    message.transferChannelId = object.transferChannelId ?? '';
    message.ibcDenom = object.ibcDenom ?? '';
    message.hostDenom = object.hostDenom ?? '';
    message.unbondingPeriod =
      object.unbondingPeriod !== undefined && object.unbondingPeriod !== null
        ? BigInt(object.unbondingPeriod.toString())
        : BigInt(0);
    message.validators =
      object.validators?.map(e => Validator.fromPartial(e)) || [];
    message.depositAddress = object.depositAddress ?? '';
    message.withdrawalIcaAddress = object.withdrawalIcaAddress ?? '';
    message.feeIcaAddress = object.feeIcaAddress ?? '';
    message.delegationIcaAddress = object.delegationIcaAddress ?? '';
    message.redemptionIcaAddress = object.redemptionIcaAddress ?? '';
    message.communityPoolDepositIcaAddress =
      object.communityPoolDepositIcaAddress ?? '';
    message.communityPoolReturnIcaAddress =
      object.communityPoolReturnIcaAddress ?? '';
    message.communityPoolStakeHoldingAddress =
      object.communityPoolStakeHoldingAddress ?? '';
    message.communityPoolRedeemHoldingAddress =
      object.communityPoolRedeemHoldingAddress ?? '';
    message.communityPoolTreasuryAddress =
      object.communityPoolTreasuryAddress ?? '';
    message.totalDelegations = object.totalDelegations ?? '';
    message.lastRedemptionRate = object.lastRedemptionRate ?? '';
    message.redemptionRate = object.redemptionRate ?? '';
    message.minRedemptionRate = object.minRedemptionRate ?? '';
    message.maxRedemptionRate = object.maxRedemptionRate ?? '';
    message.minInnerRedemptionRate = object.minInnerRedemptionRate ?? '';
    message.maxInnerRedemptionRate = object.maxInnerRedemptionRate ?? '';
    message.maxMessagesPerIcaTx =
      object.maxMessagesPerIcaTx !== undefined &&
      object.maxMessagesPerIcaTx !== null
        ? BigInt(object.maxMessagesPerIcaTx.toString())
        : BigInt(0);
    message.redemptionsEnabled = object.redemptionsEnabled ?? false;
    message.communityPoolRebate =
      object.communityPoolRebate !== undefined &&
      object.communityPoolRebate !== null
        ? CommunityPoolRebate.fromPartial(object.communityPoolRebate)
        : undefined;
    message.lsmLiquidStakeEnabled = object.lsmLiquidStakeEnabled ?? false;
    message.halted = object.halted ?? false;
    return message;
  },
  fromProtoMsg(message: HostZoneProtoMsg): HostZone {
    return HostZone.decode(message.value);
  },
  toProto(message: HostZone): Uint8Array {
    return HostZone.encode(message).finish();
  },
  toProtoMsg(message: HostZone): HostZoneProtoMsg {
    return {
      typeUrl: '/stride.stakeibc.HostZone',
      value: HostZone.encode(message).finish(),
    };
  },
};
