import { Coin, type CoinSDKType } from '../../cosmos/base/v1beta1/coin.js';
import { LSMTokenDeposit, type LSMTokenDepositSDKType } from '../records/records.js';
import { HostZone, type HostZoneSDKType } from './host_zone.js';
import { Validator, type ValidatorSDKType } from './validator.js';
import { ICAAccountType } from './ica_account.js';
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { type JsonSafe } from '../../json-safe.js';
export interface SplitDelegation {
    validator: string;
    amount: string;
}
export interface SplitDelegationProtoMsg {
    typeUrl: '/stride.stakeibc.SplitDelegation';
    value: Uint8Array;
}
export interface SplitDelegationSDKType {
    validator: string;
    amount: string;
}
export interface SplitUndelegation {
    validator: string;
    nativeTokenAmount: string;
}
export interface SplitUndelegationProtoMsg {
    typeUrl: '/stride.stakeibc.SplitUndelegation';
    value: Uint8Array;
}
export interface SplitUndelegationSDKType {
    validator: string;
    native_token_amount: string;
}
export interface DelegateCallback {
    hostZoneId: string;
    depositRecordId: bigint;
    splitDelegations: SplitDelegation[];
}
export interface DelegateCallbackProtoMsg {
    typeUrl: '/stride.stakeibc.DelegateCallback';
    value: Uint8Array;
}
export interface DelegateCallbackSDKType {
    host_zone_id: string;
    deposit_record_id: bigint;
    split_delegations: SplitDelegationSDKType[];
}
export interface ClaimCallback {
    userRedemptionRecordId: string;
    chainId: string;
    epochNumber: bigint;
}
export interface ClaimCallbackProtoMsg {
    typeUrl: '/stride.stakeibc.ClaimCallback';
    value: Uint8Array;
}
export interface ClaimCallbackSDKType {
    user_redemption_record_id: string;
    chain_id: string;
    epoch_number: bigint;
}
export interface ReinvestCallback {
    reinvestAmount: Coin;
    hostZoneId: string;
}
export interface ReinvestCallbackProtoMsg {
    typeUrl: '/stride.stakeibc.ReinvestCallback';
    value: Uint8Array;
}
export interface ReinvestCallbackSDKType {
    reinvest_amount: CoinSDKType;
    host_zone_id: string;
}
export interface UndelegateCallback {
    hostZoneId: string;
    splitUndelegations: SplitUndelegation[];
    epochUnbondingRecordIds: bigint[];
}
export interface UndelegateCallbackProtoMsg {
    typeUrl: '/stride.stakeibc.UndelegateCallback';
    value: Uint8Array;
}
export interface UndelegateCallbackSDKType {
    host_zone_id: string;
    split_undelegations: SplitUndelegationSDKType[];
    epoch_unbonding_record_ids: bigint[];
}
export interface RedemptionCallback {
    hostZoneId: string;
    epochUnbondingRecordIds: bigint[];
}
export interface RedemptionCallbackProtoMsg {
    typeUrl: '/stride.stakeibc.RedemptionCallback';
    value: Uint8Array;
}
export interface RedemptionCallbackSDKType {
    host_zone_id: string;
    epoch_unbonding_record_ids: bigint[];
}
export interface Rebalancing {
    srcValidator: string;
    dstValidator: string;
    amt: string;
}
export interface RebalancingProtoMsg {
    typeUrl: '/stride.stakeibc.Rebalancing';
    value: Uint8Array;
}
export interface RebalancingSDKType {
    src_validator: string;
    dst_validator: string;
    amt: string;
}
export interface RebalanceCallback {
    hostZoneId: string;
    rebalancings: Rebalancing[];
}
export interface RebalanceCallbackProtoMsg {
    typeUrl: '/stride.stakeibc.RebalanceCallback';
    value: Uint8Array;
}
export interface RebalanceCallbackSDKType {
    host_zone_id: string;
    rebalancings: RebalancingSDKType[];
}
export interface DetokenizeSharesCallback {
    deposit?: LSMTokenDeposit;
}
export interface DetokenizeSharesCallbackProtoMsg {
    typeUrl: '/stride.stakeibc.DetokenizeSharesCallback';
    value: Uint8Array;
}
export interface DetokenizeSharesCallbackSDKType {
    deposit?: LSMTokenDepositSDKType;
}
export interface LSMLiquidStake {
    deposit?: LSMTokenDeposit;
    hostZone?: HostZone;
    validator?: Validator;
}
export interface LSMLiquidStakeProtoMsg {
    typeUrl: '/stride.stakeibc.LSMLiquidStake';
    value: Uint8Array;
}
export interface LSMLiquidStakeSDKType {
    deposit?: LSMTokenDepositSDKType;
    host_zone?: HostZoneSDKType;
    validator?: ValidatorSDKType;
}
export interface ValidatorSharesToTokensQueryCallback {
    lsmLiquidStake?: LSMLiquidStake;
}
export interface ValidatorSharesToTokensQueryCallbackProtoMsg {
    typeUrl: '/stride.stakeibc.ValidatorSharesToTokensQueryCallback';
    value: Uint8Array;
}
export interface ValidatorSharesToTokensQueryCallbackSDKType {
    lsm_liquid_stake?: LSMLiquidStakeSDKType;
}
export interface DelegatorSharesQueryCallback {
    /** Validator delegation at the time the query is submitted */
    initialValidatorDelegation: string;
}
export interface DelegatorSharesQueryCallbackProtoMsg {
    typeUrl: '/stride.stakeibc.DelegatorSharesQueryCallback';
    value: Uint8Array;
}
export interface DelegatorSharesQueryCallbackSDKType {
    initial_validator_delegation: string;
}
export interface CommunityPoolBalanceQueryCallback {
    icaType: ICAAccountType;
    denom: string;
}
export interface CommunityPoolBalanceQueryCallbackProtoMsg {
    typeUrl: '/stride.stakeibc.CommunityPoolBalanceQueryCallback';
    value: Uint8Array;
}
export interface CommunityPoolBalanceQueryCallbackSDKType {
    ica_type: ICAAccountType;
    denom: string;
}
export interface TradeRouteCallback {
    rewardDenom: string;
    hostDenom: string;
}
export interface TradeRouteCallbackProtoMsg {
    typeUrl: '/stride.stakeibc.TradeRouteCallback';
    value: Uint8Array;
}
export interface TradeRouteCallbackSDKType {
    reward_denom: string;
    host_denom: string;
}
export declare const SplitDelegation: {
    typeUrl: string;
    encode(message: SplitDelegation, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): SplitDelegation;
    fromJSON(object: any): SplitDelegation;
    toJSON(message: SplitDelegation): JsonSafe<SplitDelegation>;
    fromPartial(object: Partial<SplitDelegation>): SplitDelegation;
    fromProtoMsg(message: SplitDelegationProtoMsg): SplitDelegation;
    toProto(message: SplitDelegation): Uint8Array;
    toProtoMsg(message: SplitDelegation): SplitDelegationProtoMsg;
};
export declare const SplitUndelegation: {
    typeUrl: string;
    encode(message: SplitUndelegation, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): SplitUndelegation;
    fromJSON(object: any): SplitUndelegation;
    toJSON(message: SplitUndelegation): JsonSafe<SplitUndelegation>;
    fromPartial(object: Partial<SplitUndelegation>): SplitUndelegation;
    fromProtoMsg(message: SplitUndelegationProtoMsg): SplitUndelegation;
    toProto(message: SplitUndelegation): Uint8Array;
    toProtoMsg(message: SplitUndelegation): SplitUndelegationProtoMsg;
};
export declare const DelegateCallback: {
    typeUrl: string;
    encode(message: DelegateCallback, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): DelegateCallback;
    fromJSON(object: any): DelegateCallback;
    toJSON(message: DelegateCallback): JsonSafe<DelegateCallback>;
    fromPartial(object: Partial<DelegateCallback>): DelegateCallback;
    fromProtoMsg(message: DelegateCallbackProtoMsg): DelegateCallback;
    toProto(message: DelegateCallback): Uint8Array;
    toProtoMsg(message: DelegateCallback): DelegateCallbackProtoMsg;
};
export declare const ClaimCallback: {
    typeUrl: string;
    encode(message: ClaimCallback, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): ClaimCallback;
    fromJSON(object: any): ClaimCallback;
    toJSON(message: ClaimCallback): JsonSafe<ClaimCallback>;
    fromPartial(object: Partial<ClaimCallback>): ClaimCallback;
    fromProtoMsg(message: ClaimCallbackProtoMsg): ClaimCallback;
    toProto(message: ClaimCallback): Uint8Array;
    toProtoMsg(message: ClaimCallback): ClaimCallbackProtoMsg;
};
export declare const ReinvestCallback: {
    typeUrl: string;
    encode(message: ReinvestCallback, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): ReinvestCallback;
    fromJSON(object: any): ReinvestCallback;
    toJSON(message: ReinvestCallback): JsonSafe<ReinvestCallback>;
    fromPartial(object: Partial<ReinvestCallback>): ReinvestCallback;
    fromProtoMsg(message: ReinvestCallbackProtoMsg): ReinvestCallback;
    toProto(message: ReinvestCallback): Uint8Array;
    toProtoMsg(message: ReinvestCallback): ReinvestCallbackProtoMsg;
};
export declare const UndelegateCallback: {
    typeUrl: string;
    encode(message: UndelegateCallback, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): UndelegateCallback;
    fromJSON(object: any): UndelegateCallback;
    toJSON(message: UndelegateCallback): JsonSafe<UndelegateCallback>;
    fromPartial(object: Partial<UndelegateCallback>): UndelegateCallback;
    fromProtoMsg(message: UndelegateCallbackProtoMsg): UndelegateCallback;
    toProto(message: UndelegateCallback): Uint8Array;
    toProtoMsg(message: UndelegateCallback): UndelegateCallbackProtoMsg;
};
export declare const RedemptionCallback: {
    typeUrl: string;
    encode(message: RedemptionCallback, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): RedemptionCallback;
    fromJSON(object: any): RedemptionCallback;
    toJSON(message: RedemptionCallback): JsonSafe<RedemptionCallback>;
    fromPartial(object: Partial<RedemptionCallback>): RedemptionCallback;
    fromProtoMsg(message: RedemptionCallbackProtoMsg): RedemptionCallback;
    toProto(message: RedemptionCallback): Uint8Array;
    toProtoMsg(message: RedemptionCallback): RedemptionCallbackProtoMsg;
};
export declare const Rebalancing: {
    typeUrl: string;
    encode(message: Rebalancing, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): Rebalancing;
    fromJSON(object: any): Rebalancing;
    toJSON(message: Rebalancing): JsonSafe<Rebalancing>;
    fromPartial(object: Partial<Rebalancing>): Rebalancing;
    fromProtoMsg(message: RebalancingProtoMsg): Rebalancing;
    toProto(message: Rebalancing): Uint8Array;
    toProtoMsg(message: Rebalancing): RebalancingProtoMsg;
};
export declare const RebalanceCallback: {
    typeUrl: string;
    encode(message: RebalanceCallback, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): RebalanceCallback;
    fromJSON(object: any): RebalanceCallback;
    toJSON(message: RebalanceCallback): JsonSafe<RebalanceCallback>;
    fromPartial(object: Partial<RebalanceCallback>): RebalanceCallback;
    fromProtoMsg(message: RebalanceCallbackProtoMsg): RebalanceCallback;
    toProto(message: RebalanceCallback): Uint8Array;
    toProtoMsg(message: RebalanceCallback): RebalanceCallbackProtoMsg;
};
export declare const DetokenizeSharesCallback: {
    typeUrl: string;
    encode(message: DetokenizeSharesCallback, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): DetokenizeSharesCallback;
    fromJSON(object: any): DetokenizeSharesCallback;
    toJSON(message: DetokenizeSharesCallback): JsonSafe<DetokenizeSharesCallback>;
    fromPartial(object: Partial<DetokenizeSharesCallback>): DetokenizeSharesCallback;
    fromProtoMsg(message: DetokenizeSharesCallbackProtoMsg): DetokenizeSharesCallback;
    toProto(message: DetokenizeSharesCallback): Uint8Array;
    toProtoMsg(message: DetokenizeSharesCallback): DetokenizeSharesCallbackProtoMsg;
};
export declare const LSMLiquidStake: {
    typeUrl: string;
    encode(message: LSMLiquidStake, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): LSMLiquidStake;
    fromJSON(object: any): LSMLiquidStake;
    toJSON(message: LSMLiquidStake): JsonSafe<LSMLiquidStake>;
    fromPartial(object: Partial<LSMLiquidStake>): LSMLiquidStake;
    fromProtoMsg(message: LSMLiquidStakeProtoMsg): LSMLiquidStake;
    toProto(message: LSMLiquidStake): Uint8Array;
    toProtoMsg(message: LSMLiquidStake): LSMLiquidStakeProtoMsg;
};
export declare const ValidatorSharesToTokensQueryCallback: {
    typeUrl: string;
    encode(message: ValidatorSharesToTokensQueryCallback, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): ValidatorSharesToTokensQueryCallback;
    fromJSON(object: any): ValidatorSharesToTokensQueryCallback;
    toJSON(message: ValidatorSharesToTokensQueryCallback): JsonSafe<ValidatorSharesToTokensQueryCallback>;
    fromPartial(object: Partial<ValidatorSharesToTokensQueryCallback>): ValidatorSharesToTokensQueryCallback;
    fromProtoMsg(message: ValidatorSharesToTokensQueryCallbackProtoMsg): ValidatorSharesToTokensQueryCallback;
    toProto(message: ValidatorSharesToTokensQueryCallback): Uint8Array;
    toProtoMsg(message: ValidatorSharesToTokensQueryCallback): ValidatorSharesToTokensQueryCallbackProtoMsg;
};
export declare const DelegatorSharesQueryCallback: {
    typeUrl: string;
    encode(message: DelegatorSharesQueryCallback, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): DelegatorSharesQueryCallback;
    fromJSON(object: any): DelegatorSharesQueryCallback;
    toJSON(message: DelegatorSharesQueryCallback): JsonSafe<DelegatorSharesQueryCallback>;
    fromPartial(object: Partial<DelegatorSharesQueryCallback>): DelegatorSharesQueryCallback;
    fromProtoMsg(message: DelegatorSharesQueryCallbackProtoMsg): DelegatorSharesQueryCallback;
    toProto(message: DelegatorSharesQueryCallback): Uint8Array;
    toProtoMsg(message: DelegatorSharesQueryCallback): DelegatorSharesQueryCallbackProtoMsg;
};
export declare const CommunityPoolBalanceQueryCallback: {
    typeUrl: string;
    encode(message: CommunityPoolBalanceQueryCallback, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): CommunityPoolBalanceQueryCallback;
    fromJSON(object: any): CommunityPoolBalanceQueryCallback;
    toJSON(message: CommunityPoolBalanceQueryCallback): JsonSafe<CommunityPoolBalanceQueryCallback>;
    fromPartial(object: Partial<CommunityPoolBalanceQueryCallback>): CommunityPoolBalanceQueryCallback;
    fromProtoMsg(message: CommunityPoolBalanceQueryCallbackProtoMsg): CommunityPoolBalanceQueryCallback;
    toProto(message: CommunityPoolBalanceQueryCallback): Uint8Array;
    toProtoMsg(message: CommunityPoolBalanceQueryCallback): CommunityPoolBalanceQueryCallbackProtoMsg;
};
export declare const TradeRouteCallback: {
    typeUrl: string;
    encode(message: TradeRouteCallback, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): TradeRouteCallback;
    fromJSON(object: any): TradeRouteCallback;
    toJSON(message: TradeRouteCallback): JsonSafe<TradeRouteCallback>;
    fromPartial(object: Partial<TradeRouteCallback>): TradeRouteCallback;
    fromProtoMsg(message: TradeRouteCallbackProtoMsg): TradeRouteCallback;
    toProto(message: TradeRouteCallback): Uint8Array;
    toProtoMsg(message: TradeRouteCallback): TradeRouteCallbackProtoMsg;
};
