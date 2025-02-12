import { Coin, type CoinSDKType } from '../../cosmos/base/v1beta1/coin.js';
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { type JsonSafe } from '../../json-safe.js';
/** The module governance/configuration parameters. */
export interface Params {
    /**
     * reward_epoch_duration_blocks is the length of a reward epoch, in blocks.
     * A value of zero has the same meaning as a value of one:
     * the full reward buffer should be distributed immediately.
     */
    rewardEpochDurationBlocks: bigint;
    /**
     * per_epoch_reward_fraction is a fraction of the reward pool to distrubute
     * once every reward epoch.  If less than zero, use approximately continuous
     * per-block distribution.
     */
    perEpochRewardFraction: string;
    /**
     * reward_smoothing_blocks is the number of blocks over which to distribute
     * an epoch's rewards.  If zero, use the same value as
     * reward_epoch_duration_blocks.
     */
    rewardSmoothingBlocks: bigint;
    /**
     * allowed_monitoring_accounts is an array of account addresses that can be
     * monitored for sends and receives.  An element of `"*"` will permit any
     * address.
     */
    allowedMonitoringAccounts: string[];
}
export interface ParamsProtoMsg {
    typeUrl: '/agoric.vbank.Params';
    value: Uint8Array;
}
/** The module governance/configuration parameters. */
export interface ParamsSDKType {
    reward_epoch_duration_blocks: bigint;
    per_epoch_reward_fraction: string;
    reward_smoothing_blocks: bigint;
    allowed_monitoring_accounts: string[];
}
/** The current state of the module. */
export interface State {
    /**
     * rewardPool is the current balance of rewards in the module account.
     * NOTE: Tracking manually since there is no bank call for getting a
     * module account balance by name.
     */
    rewardPool: Coin[];
    /**
     * reward_block_amount is the amount of reward, if available, to send to the
     * fee collector module on every block.
     */
    rewardBlockAmount: Coin[];
    /** last_sequence is a sequence number for communicating with the VM. */
    lastSequence: bigint;
    lastRewardDistributionBlock: bigint;
}
export interface StateProtoMsg {
    typeUrl: '/agoric.vbank.State';
    value: Uint8Array;
}
/** The current state of the module. */
export interface StateSDKType {
    reward_pool: CoinSDKType[];
    reward_block_amount: CoinSDKType[];
    last_sequence: bigint;
    last_reward_distribution_block: bigint;
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
export declare const State: {
    typeUrl: string;
    encode(message: State, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): State;
    fromJSON(object: any): State;
    toJSON(message: State): JsonSafe<State>;
    fromPartial(object: Partial<State>): State;
    fromProtoMsg(message: StateProtoMsg): State;
    toProto(message: State): Uint8Array;
    toProtoMsg(message: State): StateProtoMsg;
};
