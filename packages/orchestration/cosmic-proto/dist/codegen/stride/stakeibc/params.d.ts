import { BinaryReader, BinaryWriter } from '../../binary.js';
import { type JsonSafe } from '../../json-safe.js';
/**
 * Params defines the parameters for the module.
 * next id: 20
 */
export interface Params {
    /** define epoch lengths, in stride_epochs */
    rewardsInterval: bigint;
    delegateInterval: bigint;
    depositInterval: bigint;
    redemptionRateInterval: bigint;
    strideCommission: bigint;
    reinvestInterval: bigint;
    icaTimeoutNanos: bigint;
    bufferSize: bigint;
    ibcTimeoutBlocks: bigint;
    feeTransferTimeoutNanos: bigint;
    maxStakeIcaCallsPerEpoch: bigint;
    defaultMinRedemptionRateThreshold: bigint;
    defaultMaxRedemptionRateThreshold: bigint;
    ibcTransferTimeoutNanos: bigint;
    validatorSlashQueryThreshold: bigint;
    validatorWeightCap: bigint;
}
export interface ParamsProtoMsg {
    typeUrl: '/stride.stakeibc.Params';
    value: Uint8Array;
}
/**
 * Params defines the parameters for the module.
 * next id: 20
 */
export interface ParamsSDKType {
    rewards_interval: bigint;
    delegate_interval: bigint;
    deposit_interval: bigint;
    redemption_rate_interval: bigint;
    stride_commission: bigint;
    reinvest_interval: bigint;
    ica_timeout_nanos: bigint;
    buffer_size: bigint;
    ibc_timeout_blocks: bigint;
    fee_transfer_timeout_nanos: bigint;
    max_stake_ica_calls_per_epoch: bigint;
    default_min_redemption_rate_threshold: bigint;
    default_max_redemption_rate_threshold: bigint;
    ibc_transfer_timeout_nanos: bigint;
    validator_slash_query_threshold: bigint;
    validator_weight_cap: bigint;
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
