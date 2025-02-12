//@ts-nocheck
import { ICAAccount, type ICAAccountSDKType } from './ica_account.js';
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { Decimal, isSet } from '../../helpers.js';
import { type JsonSafe } from '../../json-safe.js';
/**
 * Deprecated, this configuration is no longer needed since swaps
 * are executed off-chain via authz
 *
 * Stores pool information needed to execute the swap along a trade route
 */
/** @deprecated */
export interface TradeConfig {
  /** Currently Osmosis is the only trade chain so this is an osmosis pool id */
  poolId: bigint;
  /**
   * Spot price in the pool to convert the reward denom to the host denom
   * output_tokens = swap_price * input tokens
   * This value may be slightly stale as it is updated by an ICQ
   */
  swapPrice: string;
  /** unix time in seconds that the price was last updated */
  priceUpdateTimestamp: bigint;
  /**
   * Threshold defining the percentage of tokens that could be lost in the trade
   * This captures both the loss from slippage and from a stale price on stride
   * 0.05 means the output from the trade can be no less than a 5% deviation
   * from the current value
   */
  maxAllowedSwapLossRate: string;
  /**
   * min and max set boundaries of reward denom on trade chain we will swap
   * min also decides when reward token transfers are worth it (transfer fees)
   */
  minSwapAmount: string;
  maxSwapAmount: string;
}
export interface TradeConfigProtoMsg {
  typeUrl: '/stride.stakeibc.TradeConfig';
  value: Uint8Array;
}
/**
 * Deprecated, this configuration is no longer needed since swaps
 * are executed off-chain via authz
 *
 * Stores pool information needed to execute the swap along a trade route
 */
/** @deprecated */
export interface TradeConfigSDKType {
  pool_id: bigint;
  swap_price: string;
  price_update_timestamp: bigint;
  max_allowed_swap_loss_rate: string;
  min_swap_amount: string;
  max_swap_amount: string;
}
/**
 * TradeRoute represents a round trip including info on transfer and how to do
 * the swap. It makes the assumption that the reward token is always foreign to
 * the host so therefore the first two hops are to unwind the ibc denom enroute
 * to the trade chain and the last hop is the return so funds start/end in the
 * withdrawl ICA on hostZone
 * The structure is key'd on reward denom and host denom in their native forms
 * (i.e. reward_denom_on_reward_zone and host_denom_on_host_zone)
 */
export interface TradeRoute {
  /** ibc denom for the reward on the host zone */
  rewardDenomOnHostZone: string;
  /** should be the native denom for the reward chain */
  rewardDenomOnRewardZone: string;
  /** ibc denom of the reward on the trade chain, input to the swap */
  rewardDenomOnTradeZone: string;
  /** ibc of the host denom on the trade chain, output from the swap */
  hostDenomOnTradeZone: string;
  /** should be the same as the native host denom on the host chain */
  hostDenomOnHostZone: string;
  /**
   * ICAAccount on the host zone with the reward tokens
   * This is the same as the host zone withdrawal ICA account
   */
  hostAccount: ICAAccount;
  /**
   * ICAAccount on the reward zone that is acts as the intermediate
   * receiver of the transfer from host zone to trade zone
   */
  rewardAccount: ICAAccount;
  /**
   * ICAAccount responsible for executing the swap of reward
   * tokens for host tokens
   */
  tradeAccount: ICAAccount;
  /**
   * Channel responsible for the transfer of reward tokens from the host
   * zone to the reward zone. This is the channel ID on the host zone side
   */
  hostToRewardChannelId: string;
  /**
   * Channel responsible for the transfer of reward tokens from the reward
   * zone to the trade zone. This is the channel ID on the reward zone side
   */
  rewardToTradeChannelId: string;
  /**
   * Channel responsible for the transfer of host tokens from the trade
   * zone, back to the host zone. This is the channel ID on the trade zone side
   */
  tradeToHostChannelId: string;
  /**
   * Minimum amount of reward token that must be accumulated before
   * the tokens are transferred to the trade ICA
   */
  minTransferAmount: string;
  /**
   * Deprecated, the trades are now executed off-chain via authz
   * so the trade configuration is no longer needed
   *
   * specifies the configuration needed to execute the swap
   * such as pool_id, slippage, min trade amount, etc.
   */
  /** @deprecated */
  tradeConfig: TradeConfig;
}
export interface TradeRouteProtoMsg {
  typeUrl: '/stride.stakeibc.TradeRoute';
  value: Uint8Array;
}
/**
 * TradeRoute represents a round trip including info on transfer and how to do
 * the swap. It makes the assumption that the reward token is always foreign to
 * the host so therefore the first two hops are to unwind the ibc denom enroute
 * to the trade chain and the last hop is the return so funds start/end in the
 * withdrawl ICA on hostZone
 * The structure is key'd on reward denom and host denom in their native forms
 * (i.e. reward_denom_on_reward_zone and host_denom_on_host_zone)
 */
export interface TradeRouteSDKType {
  reward_denom_on_host_zone: string;
  reward_denom_on_reward_zone: string;
  reward_denom_on_trade_zone: string;
  host_denom_on_trade_zone: string;
  host_denom_on_host_zone: string;
  host_account: ICAAccountSDKType;
  reward_account: ICAAccountSDKType;
  trade_account: ICAAccountSDKType;
  host_to_reward_channel_id: string;
  reward_to_trade_channel_id: string;
  trade_to_host_channel_id: string;
  min_transfer_amount: string;
  /** @deprecated */
  trade_config: TradeConfigSDKType;
}
function createBaseTradeConfig(): TradeConfig {
  return {
    poolId: BigInt(0),
    swapPrice: '',
    priceUpdateTimestamp: BigInt(0),
    maxAllowedSwapLossRate: '',
    minSwapAmount: '',
    maxSwapAmount: '',
  };
}
export const TradeConfig = {
  typeUrl: '/stride.stakeibc.TradeConfig',
  encode(
    message: TradeConfig,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.poolId !== BigInt(0)) {
      writer.uint32(8).uint64(message.poolId);
    }
    if (message.swapPrice !== '') {
      writer
        .uint32(18)
        .string(Decimal.fromUserInput(message.swapPrice, 18).atomics);
    }
    if (message.priceUpdateTimestamp !== BigInt(0)) {
      writer.uint32(24).uint64(message.priceUpdateTimestamp);
    }
    if (message.maxAllowedSwapLossRate !== '') {
      writer
        .uint32(34)
        .string(
          Decimal.fromUserInput(message.maxAllowedSwapLossRate, 18).atomics,
        );
    }
    if (message.minSwapAmount !== '') {
      writer.uint32(42).string(message.minSwapAmount);
    }
    if (message.maxSwapAmount !== '') {
      writer.uint32(50).string(message.maxSwapAmount);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): TradeConfig {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTradeConfig();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.poolId = reader.uint64();
          break;
        case 2:
          message.swapPrice = Decimal.fromAtomics(
            reader.string(),
            18,
          ).toString();
          break;
        case 3:
          message.priceUpdateTimestamp = reader.uint64();
          break;
        case 4:
          message.maxAllowedSwapLossRate = Decimal.fromAtomics(
            reader.string(),
            18,
          ).toString();
          break;
        case 5:
          message.minSwapAmount = reader.string();
          break;
        case 6:
          message.maxSwapAmount = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): TradeConfig {
    return {
      poolId: isSet(object.poolId)
        ? BigInt(object.poolId.toString())
        : BigInt(0),
      swapPrice: isSet(object.swapPrice) ? String(object.swapPrice) : '',
      priceUpdateTimestamp: isSet(object.priceUpdateTimestamp)
        ? BigInt(object.priceUpdateTimestamp.toString())
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
    };
  },
  toJSON(message: TradeConfig): JsonSafe<TradeConfig> {
    const obj: any = {};
    message.poolId !== undefined &&
      (obj.poolId = (message.poolId || BigInt(0)).toString());
    message.swapPrice !== undefined && (obj.swapPrice = message.swapPrice);
    message.priceUpdateTimestamp !== undefined &&
      (obj.priceUpdateTimestamp = (
        message.priceUpdateTimestamp || BigInt(0)
      ).toString());
    message.maxAllowedSwapLossRate !== undefined &&
      (obj.maxAllowedSwapLossRate = message.maxAllowedSwapLossRate);
    message.minSwapAmount !== undefined &&
      (obj.minSwapAmount = message.minSwapAmount);
    message.maxSwapAmount !== undefined &&
      (obj.maxSwapAmount = message.maxSwapAmount);
    return obj;
  },
  fromPartial(object: Partial<TradeConfig>): TradeConfig {
    const message = createBaseTradeConfig();
    message.poolId =
      object.poolId !== undefined && object.poolId !== null
        ? BigInt(object.poolId.toString())
        : BigInt(0);
    message.swapPrice = object.swapPrice ?? '';
    message.priceUpdateTimestamp =
      object.priceUpdateTimestamp !== undefined &&
      object.priceUpdateTimestamp !== null
        ? BigInt(object.priceUpdateTimestamp.toString())
        : BigInt(0);
    message.maxAllowedSwapLossRate = object.maxAllowedSwapLossRate ?? '';
    message.minSwapAmount = object.minSwapAmount ?? '';
    message.maxSwapAmount = object.maxSwapAmount ?? '';
    return message;
  },
  fromProtoMsg(message: TradeConfigProtoMsg): TradeConfig {
    return TradeConfig.decode(message.value);
  },
  toProto(message: TradeConfig): Uint8Array {
    return TradeConfig.encode(message).finish();
  },
  toProtoMsg(message: TradeConfig): TradeConfigProtoMsg {
    return {
      typeUrl: '/stride.stakeibc.TradeConfig',
      value: TradeConfig.encode(message).finish(),
    };
  },
};
function createBaseTradeRoute(): TradeRoute {
  return {
    rewardDenomOnHostZone: '',
    rewardDenomOnRewardZone: '',
    rewardDenomOnTradeZone: '',
    hostDenomOnTradeZone: '',
    hostDenomOnHostZone: '',
    hostAccount: ICAAccount.fromPartial({}),
    rewardAccount: ICAAccount.fromPartial({}),
    tradeAccount: ICAAccount.fromPartial({}),
    hostToRewardChannelId: '',
    rewardToTradeChannelId: '',
    tradeToHostChannelId: '',
    minTransferAmount: '',
    tradeConfig: TradeConfig.fromPartial({}),
  };
}
export const TradeRoute = {
  typeUrl: '/stride.stakeibc.TradeRoute',
  encode(
    message: TradeRoute,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.rewardDenomOnHostZone !== '') {
      writer.uint32(10).string(message.rewardDenomOnHostZone);
    }
    if (message.rewardDenomOnRewardZone !== '') {
      writer.uint32(18).string(message.rewardDenomOnRewardZone);
    }
    if (message.rewardDenomOnTradeZone !== '') {
      writer.uint32(26).string(message.rewardDenomOnTradeZone);
    }
    if (message.hostDenomOnTradeZone !== '') {
      writer.uint32(34).string(message.hostDenomOnTradeZone);
    }
    if (message.hostDenomOnHostZone !== '') {
      writer.uint32(42).string(message.hostDenomOnHostZone);
    }
    if (message.hostAccount !== undefined) {
      ICAAccount.encode(message.hostAccount, writer.uint32(50).fork()).ldelim();
    }
    if (message.rewardAccount !== undefined) {
      ICAAccount.encode(
        message.rewardAccount,
        writer.uint32(58).fork(),
      ).ldelim();
    }
    if (message.tradeAccount !== undefined) {
      ICAAccount.encode(
        message.tradeAccount,
        writer.uint32(66).fork(),
      ).ldelim();
    }
    if (message.hostToRewardChannelId !== '') {
      writer.uint32(74).string(message.hostToRewardChannelId);
    }
    if (message.rewardToTradeChannelId !== '') {
      writer.uint32(82).string(message.rewardToTradeChannelId);
    }
    if (message.tradeToHostChannelId !== '') {
      writer.uint32(90).string(message.tradeToHostChannelId);
    }
    if (message.minTransferAmount !== '') {
      writer.uint32(106).string(message.minTransferAmount);
    }
    if (message.tradeConfig !== undefined) {
      TradeConfig.encode(
        message.tradeConfig,
        writer.uint32(98).fork(),
      ).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): TradeRoute {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTradeRoute();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.rewardDenomOnHostZone = reader.string();
          break;
        case 2:
          message.rewardDenomOnRewardZone = reader.string();
          break;
        case 3:
          message.rewardDenomOnTradeZone = reader.string();
          break;
        case 4:
          message.hostDenomOnTradeZone = reader.string();
          break;
        case 5:
          message.hostDenomOnHostZone = reader.string();
          break;
        case 6:
          message.hostAccount = ICAAccount.decode(reader, reader.uint32());
          break;
        case 7:
          message.rewardAccount = ICAAccount.decode(reader, reader.uint32());
          break;
        case 8:
          message.tradeAccount = ICAAccount.decode(reader, reader.uint32());
          break;
        case 9:
          message.hostToRewardChannelId = reader.string();
          break;
        case 10:
          message.rewardToTradeChannelId = reader.string();
          break;
        case 11:
          message.tradeToHostChannelId = reader.string();
          break;
        case 13:
          message.minTransferAmount = reader.string();
          break;
        case 12:
          message.tradeConfig = TradeConfig.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): TradeRoute {
    return {
      rewardDenomOnHostZone: isSet(object.rewardDenomOnHostZone)
        ? String(object.rewardDenomOnHostZone)
        : '',
      rewardDenomOnRewardZone: isSet(object.rewardDenomOnRewardZone)
        ? String(object.rewardDenomOnRewardZone)
        : '',
      rewardDenomOnTradeZone: isSet(object.rewardDenomOnTradeZone)
        ? String(object.rewardDenomOnTradeZone)
        : '',
      hostDenomOnTradeZone: isSet(object.hostDenomOnTradeZone)
        ? String(object.hostDenomOnTradeZone)
        : '',
      hostDenomOnHostZone: isSet(object.hostDenomOnHostZone)
        ? String(object.hostDenomOnHostZone)
        : '',
      hostAccount: isSet(object.hostAccount)
        ? ICAAccount.fromJSON(object.hostAccount)
        : undefined,
      rewardAccount: isSet(object.rewardAccount)
        ? ICAAccount.fromJSON(object.rewardAccount)
        : undefined,
      tradeAccount: isSet(object.tradeAccount)
        ? ICAAccount.fromJSON(object.tradeAccount)
        : undefined,
      hostToRewardChannelId: isSet(object.hostToRewardChannelId)
        ? String(object.hostToRewardChannelId)
        : '',
      rewardToTradeChannelId: isSet(object.rewardToTradeChannelId)
        ? String(object.rewardToTradeChannelId)
        : '',
      tradeToHostChannelId: isSet(object.tradeToHostChannelId)
        ? String(object.tradeToHostChannelId)
        : '',
      minTransferAmount: isSet(object.minTransferAmount)
        ? String(object.minTransferAmount)
        : '',
      tradeConfig: isSet(object.tradeConfig)
        ? TradeConfig.fromJSON(object.tradeConfig)
        : undefined,
    };
  },
  toJSON(message: TradeRoute): JsonSafe<TradeRoute> {
    const obj: any = {};
    message.rewardDenomOnHostZone !== undefined &&
      (obj.rewardDenomOnHostZone = message.rewardDenomOnHostZone);
    message.rewardDenomOnRewardZone !== undefined &&
      (obj.rewardDenomOnRewardZone = message.rewardDenomOnRewardZone);
    message.rewardDenomOnTradeZone !== undefined &&
      (obj.rewardDenomOnTradeZone = message.rewardDenomOnTradeZone);
    message.hostDenomOnTradeZone !== undefined &&
      (obj.hostDenomOnTradeZone = message.hostDenomOnTradeZone);
    message.hostDenomOnHostZone !== undefined &&
      (obj.hostDenomOnHostZone = message.hostDenomOnHostZone);
    message.hostAccount !== undefined &&
      (obj.hostAccount = message.hostAccount
        ? ICAAccount.toJSON(message.hostAccount)
        : undefined);
    message.rewardAccount !== undefined &&
      (obj.rewardAccount = message.rewardAccount
        ? ICAAccount.toJSON(message.rewardAccount)
        : undefined);
    message.tradeAccount !== undefined &&
      (obj.tradeAccount = message.tradeAccount
        ? ICAAccount.toJSON(message.tradeAccount)
        : undefined);
    message.hostToRewardChannelId !== undefined &&
      (obj.hostToRewardChannelId = message.hostToRewardChannelId);
    message.rewardToTradeChannelId !== undefined &&
      (obj.rewardToTradeChannelId = message.rewardToTradeChannelId);
    message.tradeToHostChannelId !== undefined &&
      (obj.tradeToHostChannelId = message.tradeToHostChannelId);
    message.minTransferAmount !== undefined &&
      (obj.minTransferAmount = message.minTransferAmount);
    message.tradeConfig !== undefined &&
      (obj.tradeConfig = message.tradeConfig
        ? TradeConfig.toJSON(message.tradeConfig)
        : undefined);
    return obj;
  },
  fromPartial(object: Partial<TradeRoute>): TradeRoute {
    const message = createBaseTradeRoute();
    message.rewardDenomOnHostZone = object.rewardDenomOnHostZone ?? '';
    message.rewardDenomOnRewardZone = object.rewardDenomOnRewardZone ?? '';
    message.rewardDenomOnTradeZone = object.rewardDenomOnTradeZone ?? '';
    message.hostDenomOnTradeZone = object.hostDenomOnTradeZone ?? '';
    message.hostDenomOnHostZone = object.hostDenomOnHostZone ?? '';
    message.hostAccount =
      object.hostAccount !== undefined && object.hostAccount !== null
        ? ICAAccount.fromPartial(object.hostAccount)
        : undefined;
    message.rewardAccount =
      object.rewardAccount !== undefined && object.rewardAccount !== null
        ? ICAAccount.fromPartial(object.rewardAccount)
        : undefined;
    message.tradeAccount =
      object.tradeAccount !== undefined && object.tradeAccount !== null
        ? ICAAccount.fromPartial(object.tradeAccount)
        : undefined;
    message.hostToRewardChannelId = object.hostToRewardChannelId ?? '';
    message.rewardToTradeChannelId = object.rewardToTradeChannelId ?? '';
    message.tradeToHostChannelId = object.tradeToHostChannelId ?? '';
    message.minTransferAmount = object.minTransferAmount ?? '';
    message.tradeConfig =
      object.tradeConfig !== undefined && object.tradeConfig !== null
        ? TradeConfig.fromPartial(object.tradeConfig)
        : undefined;
    return message;
  },
  fromProtoMsg(message: TradeRouteProtoMsg): TradeRoute {
    return TradeRoute.decode(message.value);
  },
  toProto(message: TradeRoute): Uint8Array {
    return TradeRoute.encode(message).finish();
  },
  toProtoMsg(message: TradeRoute): TradeRouteProtoMsg {
    return {
      typeUrl: '/stride.stakeibc.TradeRoute',
      value: TradeRoute.encode(message).finish(),
    };
  },
};
