import { ICAAccount, type ICAAccountSDKType } from './ica_account.js';
import { BinaryReader, BinaryWriter } from '../../binary.js';
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
export declare const TradeConfig: {
    typeUrl: string;
    encode(message: TradeConfig, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): TradeConfig;
    fromJSON(object: any): TradeConfig;
    toJSON(message: TradeConfig): JsonSafe<TradeConfig>;
    fromPartial(object: Partial<TradeConfig>): TradeConfig;
    fromProtoMsg(message: TradeConfigProtoMsg): TradeConfig;
    toProto(message: TradeConfig): Uint8Array;
    toProtoMsg(message: TradeConfig): TradeConfigProtoMsg;
};
export declare const TradeRoute: {
    typeUrl: string;
    encode(message: TradeRoute, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): TradeRoute;
    fromJSON(object: any): TradeRoute;
    toJSON(message: TradeRoute): JsonSafe<TradeRoute>;
    fromPartial(object: Partial<TradeRoute>): TradeRoute;
    fromProtoMsg(message: TradeRouteProtoMsg): TradeRoute;
    toProto(message: TradeRoute): Uint8Array;
    toProtoMsg(message: TradeRoute): TradeRouteProtoMsg;
};
