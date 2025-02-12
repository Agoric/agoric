import { DelegationRecord, type DelegationRecordSDKType, UnbondingRecord, type UnbondingRecordSDKType, RedemptionRecord, type RedemptionRecordSDKType } from './stakedym.js';
import { Coin, type CoinSDKType } from '../../cosmos/base/v1beta1/coin.js';
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { type JsonSafe } from '../../json-safe.js';
export declare enum OverwritableRecordType {
    RECORD_TYPE_DELEGATION = 0,
    RECORD_TYPE_UNBONDING = 1,
    RECORD_TYPE_REDEMPTION = 2,
    UNRECOGNIZED = -1
}
export declare const OverwritableRecordTypeSDKType: typeof OverwritableRecordType;
export declare function overwritableRecordTypeFromJSON(object: any): OverwritableRecordType;
export declare function overwritableRecordTypeToJSON(object: OverwritableRecordType): string;
/** LiquidStake */
export interface MsgLiquidStake {
    staker: string;
    nativeAmount: string;
}
export interface MsgLiquidStakeProtoMsg {
    typeUrl: '/stride.stakedym.MsgLiquidStake';
    value: Uint8Array;
}
/** LiquidStake */
export interface MsgLiquidStakeSDKType {
    staker: string;
    native_amount: string;
}
export interface MsgLiquidStakeResponse {
    stToken: Coin;
}
export interface MsgLiquidStakeResponseProtoMsg {
    typeUrl: '/stride.stakedym.MsgLiquidStakeResponse';
    value: Uint8Array;
}
export interface MsgLiquidStakeResponseSDKType {
    st_token: CoinSDKType;
}
/** RedeemStake */
export interface MsgRedeemStake {
    redeemer: string;
    stTokenAmount: string;
}
export interface MsgRedeemStakeProtoMsg {
    typeUrl: '/stride.stakedym.MsgRedeemStake';
    value: Uint8Array;
}
/** RedeemStake */
export interface MsgRedeemStakeSDKType {
    redeemer: string;
    st_token_amount: string;
}
export interface MsgRedeemStakeResponse {
    nativeToken: Coin;
}
export interface MsgRedeemStakeResponseProtoMsg {
    typeUrl: '/stride.stakedym.MsgRedeemStakeResponse';
    value: Uint8Array;
}
export interface MsgRedeemStakeResponseSDKType {
    native_token: CoinSDKType;
}
/** ConfirmDelegation */
export interface MsgConfirmDelegation {
    operator: string;
    recordId: bigint;
    txHash: string;
}
export interface MsgConfirmDelegationProtoMsg {
    typeUrl: '/stride.stakedym.MsgConfirmDelegation';
    value: Uint8Array;
}
/** ConfirmDelegation */
export interface MsgConfirmDelegationSDKType {
    operator: string;
    record_id: bigint;
    tx_hash: string;
}
export interface MsgConfirmDelegationResponse {
}
export interface MsgConfirmDelegationResponseProtoMsg {
    typeUrl: '/stride.stakedym.MsgConfirmDelegationResponse';
    value: Uint8Array;
}
export interface MsgConfirmDelegationResponseSDKType {
}
/** ConfirmUndelegation */
export interface MsgConfirmUndelegation {
    operator: string;
    recordId: bigint;
    txHash: string;
}
export interface MsgConfirmUndelegationProtoMsg {
    typeUrl: '/stride.stakedym.MsgConfirmUndelegation';
    value: Uint8Array;
}
/** ConfirmUndelegation */
export interface MsgConfirmUndelegationSDKType {
    operator: string;
    record_id: bigint;
    tx_hash: string;
}
export interface MsgConfirmUndelegationResponse {
}
export interface MsgConfirmUndelegationResponseProtoMsg {
    typeUrl: '/stride.stakedym.MsgConfirmUndelegationResponse';
    value: Uint8Array;
}
export interface MsgConfirmUndelegationResponseSDKType {
}
/** ConfirmUnbondedTokenSweep */
export interface MsgConfirmUnbondedTokenSweep {
    operator: string;
    recordId: bigint;
    txHash: string;
}
export interface MsgConfirmUnbondedTokenSweepProtoMsg {
    typeUrl: '/stride.stakedym.MsgConfirmUnbondedTokenSweep';
    value: Uint8Array;
}
/** ConfirmUnbondedTokenSweep */
export interface MsgConfirmUnbondedTokenSweepSDKType {
    operator: string;
    record_id: bigint;
    tx_hash: string;
}
export interface MsgConfirmUnbondedTokenSweepResponse {
}
export interface MsgConfirmUnbondedTokenSweepResponseProtoMsg {
    typeUrl: '/stride.stakedym.MsgConfirmUnbondedTokenSweepResponse';
    value: Uint8Array;
}
export interface MsgConfirmUnbondedTokenSweepResponseSDKType {
}
/** AdjustDelegatedBalance */
export interface MsgAdjustDelegatedBalance {
    operator: string;
    delegationOffset: string;
    validatorAddress: string;
}
export interface MsgAdjustDelegatedBalanceProtoMsg {
    typeUrl: '/stride.stakedym.MsgAdjustDelegatedBalance';
    value: Uint8Array;
}
/** AdjustDelegatedBalance */
export interface MsgAdjustDelegatedBalanceSDKType {
    operator: string;
    delegation_offset: string;
    validator_address: string;
}
export interface MsgAdjustDelegatedBalanceResponse {
}
export interface MsgAdjustDelegatedBalanceResponseProtoMsg {
    typeUrl: '/stride.stakedym.MsgAdjustDelegatedBalanceResponse';
    value: Uint8Array;
}
export interface MsgAdjustDelegatedBalanceResponseSDKType {
}
/** UpdateInnerRedemptionRate */
export interface MsgUpdateInnerRedemptionRateBounds {
    creator: string;
    minInnerRedemptionRate: string;
    maxInnerRedemptionRate: string;
}
export interface MsgUpdateInnerRedemptionRateBoundsProtoMsg {
    typeUrl: '/stride.stakedym.MsgUpdateInnerRedemptionRateBounds';
    value: Uint8Array;
}
/** UpdateInnerRedemptionRate */
export interface MsgUpdateInnerRedemptionRateBoundsSDKType {
    creator: string;
    min_inner_redemption_rate: string;
    max_inner_redemption_rate: string;
}
export interface MsgUpdateInnerRedemptionRateBoundsResponse {
}
export interface MsgUpdateInnerRedemptionRateBoundsResponseProtoMsg {
    typeUrl: '/stride.stakedym.MsgUpdateInnerRedemptionRateBoundsResponse';
    value: Uint8Array;
}
export interface MsgUpdateInnerRedemptionRateBoundsResponseSDKType {
}
/** ResumeHostZone */
export interface MsgResumeHostZone {
    creator: string;
}
export interface MsgResumeHostZoneProtoMsg {
    typeUrl: '/stride.stakedym.MsgResumeHostZone';
    value: Uint8Array;
}
/** ResumeHostZone */
export interface MsgResumeHostZoneSDKType {
    creator: string;
}
export interface MsgResumeHostZoneResponse {
}
export interface MsgResumeHostZoneResponseProtoMsg {
    typeUrl: '/stride.stakedym.MsgResumeHostZoneResponse';
    value: Uint8Array;
}
export interface MsgResumeHostZoneResponseSDKType {
}
/** RefreshRedemptionRate */
export interface MsgRefreshRedemptionRate {
    creator: string;
}
export interface MsgRefreshRedemptionRateProtoMsg {
    typeUrl: '/stride.stakedym.MsgRefreshRedemptionRate';
    value: Uint8Array;
}
/** RefreshRedemptionRate */
export interface MsgRefreshRedemptionRateSDKType {
    creator: string;
}
export interface MsgRefreshRedemptionRateResponse {
}
export interface MsgRefreshRedemptionRateResponseProtoMsg {
    typeUrl: '/stride.stakedym.MsgRefreshRedemptionRateResponse';
    value: Uint8Array;
}
export interface MsgRefreshRedemptionRateResponseSDKType {
}
/** OverwriteDelegationRecord */
export interface MsgOverwriteDelegationRecord {
    creator: string;
    delegationRecord?: DelegationRecord;
}
export interface MsgOverwriteDelegationRecordProtoMsg {
    typeUrl: '/stride.stakedym.MsgOverwriteDelegationRecord';
    value: Uint8Array;
}
/** OverwriteDelegationRecord */
export interface MsgOverwriteDelegationRecordSDKType {
    creator: string;
    delegation_record?: DelegationRecordSDKType;
}
export interface MsgOverwriteDelegationRecordResponse {
}
export interface MsgOverwriteDelegationRecordResponseProtoMsg {
    typeUrl: '/stride.stakedym.MsgOverwriteDelegationRecordResponse';
    value: Uint8Array;
}
export interface MsgOverwriteDelegationRecordResponseSDKType {
}
/** OverwriteUnbondingRecord */
export interface MsgOverwriteUnbondingRecord {
    creator: string;
    unbondingRecord?: UnbondingRecord;
}
export interface MsgOverwriteUnbondingRecordProtoMsg {
    typeUrl: '/stride.stakedym.MsgOverwriteUnbondingRecord';
    value: Uint8Array;
}
/** OverwriteUnbondingRecord */
export interface MsgOverwriteUnbondingRecordSDKType {
    creator: string;
    unbonding_record?: UnbondingRecordSDKType;
}
export interface MsgOverwriteUnbondingRecordResponse {
}
export interface MsgOverwriteUnbondingRecordResponseProtoMsg {
    typeUrl: '/stride.stakedym.MsgOverwriteUnbondingRecordResponse';
    value: Uint8Array;
}
export interface MsgOverwriteUnbondingRecordResponseSDKType {
}
/** OverwriteRedemptionRecord */
export interface MsgOverwriteRedemptionRecord {
    creator: string;
    redemptionRecord?: RedemptionRecord;
}
export interface MsgOverwriteRedemptionRecordProtoMsg {
    typeUrl: '/stride.stakedym.MsgOverwriteRedemptionRecord';
    value: Uint8Array;
}
/** OverwriteRedemptionRecord */
export interface MsgOverwriteRedemptionRecordSDKType {
    creator: string;
    redemption_record?: RedemptionRecordSDKType;
}
export interface MsgOverwriteRedemptionRecordResponse {
}
export interface MsgOverwriteRedemptionRecordResponseProtoMsg {
    typeUrl: '/stride.stakedym.MsgOverwriteRedemptionRecordResponse';
    value: Uint8Array;
}
export interface MsgOverwriteRedemptionRecordResponseSDKType {
}
/** SetOperatorAddress */
export interface MsgSetOperatorAddress {
    signer: string;
    operator: string;
}
export interface MsgSetOperatorAddressProtoMsg {
    typeUrl: '/stride.stakedym.MsgSetOperatorAddress';
    value: Uint8Array;
}
/** SetOperatorAddress */
export interface MsgSetOperatorAddressSDKType {
    signer: string;
    operator: string;
}
export interface MsgSetOperatorAddressResponse {
}
export interface MsgSetOperatorAddressResponseProtoMsg {
    typeUrl: '/stride.stakedym.MsgSetOperatorAddressResponse';
    value: Uint8Array;
}
export interface MsgSetOperatorAddressResponseSDKType {
}
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
    encode(message: MsgRedeemStakeResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgRedeemStakeResponse;
    fromJSON(object: any): MsgRedeemStakeResponse;
    toJSON(message: MsgRedeemStakeResponse): JsonSafe<MsgRedeemStakeResponse>;
    fromPartial(object: Partial<MsgRedeemStakeResponse>): MsgRedeemStakeResponse;
    fromProtoMsg(message: MsgRedeemStakeResponseProtoMsg): MsgRedeemStakeResponse;
    toProto(message: MsgRedeemStakeResponse): Uint8Array;
    toProtoMsg(message: MsgRedeemStakeResponse): MsgRedeemStakeResponseProtoMsg;
};
export declare const MsgConfirmDelegation: {
    typeUrl: string;
    encode(message: MsgConfirmDelegation, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgConfirmDelegation;
    fromJSON(object: any): MsgConfirmDelegation;
    toJSON(message: MsgConfirmDelegation): JsonSafe<MsgConfirmDelegation>;
    fromPartial(object: Partial<MsgConfirmDelegation>): MsgConfirmDelegation;
    fromProtoMsg(message: MsgConfirmDelegationProtoMsg): MsgConfirmDelegation;
    toProto(message: MsgConfirmDelegation): Uint8Array;
    toProtoMsg(message: MsgConfirmDelegation): MsgConfirmDelegationProtoMsg;
};
export declare const MsgConfirmDelegationResponse: {
    typeUrl: string;
    encode(_: MsgConfirmDelegationResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgConfirmDelegationResponse;
    fromJSON(_: any): MsgConfirmDelegationResponse;
    toJSON(_: MsgConfirmDelegationResponse): JsonSafe<MsgConfirmDelegationResponse>;
    fromPartial(_: Partial<MsgConfirmDelegationResponse>): MsgConfirmDelegationResponse;
    fromProtoMsg(message: MsgConfirmDelegationResponseProtoMsg): MsgConfirmDelegationResponse;
    toProto(message: MsgConfirmDelegationResponse): Uint8Array;
    toProtoMsg(message: MsgConfirmDelegationResponse): MsgConfirmDelegationResponseProtoMsg;
};
export declare const MsgConfirmUndelegation: {
    typeUrl: string;
    encode(message: MsgConfirmUndelegation, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgConfirmUndelegation;
    fromJSON(object: any): MsgConfirmUndelegation;
    toJSON(message: MsgConfirmUndelegation): JsonSafe<MsgConfirmUndelegation>;
    fromPartial(object: Partial<MsgConfirmUndelegation>): MsgConfirmUndelegation;
    fromProtoMsg(message: MsgConfirmUndelegationProtoMsg): MsgConfirmUndelegation;
    toProto(message: MsgConfirmUndelegation): Uint8Array;
    toProtoMsg(message: MsgConfirmUndelegation): MsgConfirmUndelegationProtoMsg;
};
export declare const MsgConfirmUndelegationResponse: {
    typeUrl: string;
    encode(_: MsgConfirmUndelegationResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgConfirmUndelegationResponse;
    fromJSON(_: any): MsgConfirmUndelegationResponse;
    toJSON(_: MsgConfirmUndelegationResponse): JsonSafe<MsgConfirmUndelegationResponse>;
    fromPartial(_: Partial<MsgConfirmUndelegationResponse>): MsgConfirmUndelegationResponse;
    fromProtoMsg(message: MsgConfirmUndelegationResponseProtoMsg): MsgConfirmUndelegationResponse;
    toProto(message: MsgConfirmUndelegationResponse): Uint8Array;
    toProtoMsg(message: MsgConfirmUndelegationResponse): MsgConfirmUndelegationResponseProtoMsg;
};
export declare const MsgConfirmUnbondedTokenSweep: {
    typeUrl: string;
    encode(message: MsgConfirmUnbondedTokenSweep, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgConfirmUnbondedTokenSweep;
    fromJSON(object: any): MsgConfirmUnbondedTokenSweep;
    toJSON(message: MsgConfirmUnbondedTokenSweep): JsonSafe<MsgConfirmUnbondedTokenSweep>;
    fromPartial(object: Partial<MsgConfirmUnbondedTokenSweep>): MsgConfirmUnbondedTokenSweep;
    fromProtoMsg(message: MsgConfirmUnbondedTokenSweepProtoMsg): MsgConfirmUnbondedTokenSweep;
    toProto(message: MsgConfirmUnbondedTokenSweep): Uint8Array;
    toProtoMsg(message: MsgConfirmUnbondedTokenSweep): MsgConfirmUnbondedTokenSweepProtoMsg;
};
export declare const MsgConfirmUnbondedTokenSweepResponse: {
    typeUrl: string;
    encode(_: MsgConfirmUnbondedTokenSweepResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgConfirmUnbondedTokenSweepResponse;
    fromJSON(_: any): MsgConfirmUnbondedTokenSweepResponse;
    toJSON(_: MsgConfirmUnbondedTokenSweepResponse): JsonSafe<MsgConfirmUnbondedTokenSweepResponse>;
    fromPartial(_: Partial<MsgConfirmUnbondedTokenSweepResponse>): MsgConfirmUnbondedTokenSweepResponse;
    fromProtoMsg(message: MsgConfirmUnbondedTokenSweepResponseProtoMsg): MsgConfirmUnbondedTokenSweepResponse;
    toProto(message: MsgConfirmUnbondedTokenSweepResponse): Uint8Array;
    toProtoMsg(message: MsgConfirmUnbondedTokenSweepResponse): MsgConfirmUnbondedTokenSweepResponseProtoMsg;
};
export declare const MsgAdjustDelegatedBalance: {
    typeUrl: string;
    encode(message: MsgAdjustDelegatedBalance, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgAdjustDelegatedBalance;
    fromJSON(object: any): MsgAdjustDelegatedBalance;
    toJSON(message: MsgAdjustDelegatedBalance): JsonSafe<MsgAdjustDelegatedBalance>;
    fromPartial(object: Partial<MsgAdjustDelegatedBalance>): MsgAdjustDelegatedBalance;
    fromProtoMsg(message: MsgAdjustDelegatedBalanceProtoMsg): MsgAdjustDelegatedBalance;
    toProto(message: MsgAdjustDelegatedBalance): Uint8Array;
    toProtoMsg(message: MsgAdjustDelegatedBalance): MsgAdjustDelegatedBalanceProtoMsg;
};
export declare const MsgAdjustDelegatedBalanceResponse: {
    typeUrl: string;
    encode(_: MsgAdjustDelegatedBalanceResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgAdjustDelegatedBalanceResponse;
    fromJSON(_: any): MsgAdjustDelegatedBalanceResponse;
    toJSON(_: MsgAdjustDelegatedBalanceResponse): JsonSafe<MsgAdjustDelegatedBalanceResponse>;
    fromPartial(_: Partial<MsgAdjustDelegatedBalanceResponse>): MsgAdjustDelegatedBalanceResponse;
    fromProtoMsg(message: MsgAdjustDelegatedBalanceResponseProtoMsg): MsgAdjustDelegatedBalanceResponse;
    toProto(message: MsgAdjustDelegatedBalanceResponse): Uint8Array;
    toProtoMsg(message: MsgAdjustDelegatedBalanceResponse): MsgAdjustDelegatedBalanceResponseProtoMsg;
};
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
export declare const MsgRefreshRedemptionRate: {
    typeUrl: string;
    encode(message: MsgRefreshRedemptionRate, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgRefreshRedemptionRate;
    fromJSON(object: any): MsgRefreshRedemptionRate;
    toJSON(message: MsgRefreshRedemptionRate): JsonSafe<MsgRefreshRedemptionRate>;
    fromPartial(object: Partial<MsgRefreshRedemptionRate>): MsgRefreshRedemptionRate;
    fromProtoMsg(message: MsgRefreshRedemptionRateProtoMsg): MsgRefreshRedemptionRate;
    toProto(message: MsgRefreshRedemptionRate): Uint8Array;
    toProtoMsg(message: MsgRefreshRedemptionRate): MsgRefreshRedemptionRateProtoMsg;
};
export declare const MsgRefreshRedemptionRateResponse: {
    typeUrl: string;
    encode(_: MsgRefreshRedemptionRateResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgRefreshRedemptionRateResponse;
    fromJSON(_: any): MsgRefreshRedemptionRateResponse;
    toJSON(_: MsgRefreshRedemptionRateResponse): JsonSafe<MsgRefreshRedemptionRateResponse>;
    fromPartial(_: Partial<MsgRefreshRedemptionRateResponse>): MsgRefreshRedemptionRateResponse;
    fromProtoMsg(message: MsgRefreshRedemptionRateResponseProtoMsg): MsgRefreshRedemptionRateResponse;
    toProto(message: MsgRefreshRedemptionRateResponse): Uint8Array;
    toProtoMsg(message: MsgRefreshRedemptionRateResponse): MsgRefreshRedemptionRateResponseProtoMsg;
};
export declare const MsgOverwriteDelegationRecord: {
    typeUrl: string;
    encode(message: MsgOverwriteDelegationRecord, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgOverwriteDelegationRecord;
    fromJSON(object: any): MsgOverwriteDelegationRecord;
    toJSON(message: MsgOverwriteDelegationRecord): JsonSafe<MsgOverwriteDelegationRecord>;
    fromPartial(object: Partial<MsgOverwriteDelegationRecord>): MsgOverwriteDelegationRecord;
    fromProtoMsg(message: MsgOverwriteDelegationRecordProtoMsg): MsgOverwriteDelegationRecord;
    toProto(message: MsgOverwriteDelegationRecord): Uint8Array;
    toProtoMsg(message: MsgOverwriteDelegationRecord): MsgOverwriteDelegationRecordProtoMsg;
};
export declare const MsgOverwriteDelegationRecordResponse: {
    typeUrl: string;
    encode(_: MsgOverwriteDelegationRecordResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgOverwriteDelegationRecordResponse;
    fromJSON(_: any): MsgOverwriteDelegationRecordResponse;
    toJSON(_: MsgOverwriteDelegationRecordResponse): JsonSafe<MsgOverwriteDelegationRecordResponse>;
    fromPartial(_: Partial<MsgOverwriteDelegationRecordResponse>): MsgOverwriteDelegationRecordResponse;
    fromProtoMsg(message: MsgOverwriteDelegationRecordResponseProtoMsg): MsgOverwriteDelegationRecordResponse;
    toProto(message: MsgOverwriteDelegationRecordResponse): Uint8Array;
    toProtoMsg(message: MsgOverwriteDelegationRecordResponse): MsgOverwriteDelegationRecordResponseProtoMsg;
};
export declare const MsgOverwriteUnbondingRecord: {
    typeUrl: string;
    encode(message: MsgOverwriteUnbondingRecord, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgOverwriteUnbondingRecord;
    fromJSON(object: any): MsgOverwriteUnbondingRecord;
    toJSON(message: MsgOverwriteUnbondingRecord): JsonSafe<MsgOverwriteUnbondingRecord>;
    fromPartial(object: Partial<MsgOverwriteUnbondingRecord>): MsgOverwriteUnbondingRecord;
    fromProtoMsg(message: MsgOverwriteUnbondingRecordProtoMsg): MsgOverwriteUnbondingRecord;
    toProto(message: MsgOverwriteUnbondingRecord): Uint8Array;
    toProtoMsg(message: MsgOverwriteUnbondingRecord): MsgOverwriteUnbondingRecordProtoMsg;
};
export declare const MsgOverwriteUnbondingRecordResponse: {
    typeUrl: string;
    encode(_: MsgOverwriteUnbondingRecordResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgOverwriteUnbondingRecordResponse;
    fromJSON(_: any): MsgOverwriteUnbondingRecordResponse;
    toJSON(_: MsgOverwriteUnbondingRecordResponse): JsonSafe<MsgOverwriteUnbondingRecordResponse>;
    fromPartial(_: Partial<MsgOverwriteUnbondingRecordResponse>): MsgOverwriteUnbondingRecordResponse;
    fromProtoMsg(message: MsgOverwriteUnbondingRecordResponseProtoMsg): MsgOverwriteUnbondingRecordResponse;
    toProto(message: MsgOverwriteUnbondingRecordResponse): Uint8Array;
    toProtoMsg(message: MsgOverwriteUnbondingRecordResponse): MsgOverwriteUnbondingRecordResponseProtoMsg;
};
export declare const MsgOverwriteRedemptionRecord: {
    typeUrl: string;
    encode(message: MsgOverwriteRedemptionRecord, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgOverwriteRedemptionRecord;
    fromJSON(object: any): MsgOverwriteRedemptionRecord;
    toJSON(message: MsgOverwriteRedemptionRecord): JsonSafe<MsgOverwriteRedemptionRecord>;
    fromPartial(object: Partial<MsgOverwriteRedemptionRecord>): MsgOverwriteRedemptionRecord;
    fromProtoMsg(message: MsgOverwriteRedemptionRecordProtoMsg): MsgOverwriteRedemptionRecord;
    toProto(message: MsgOverwriteRedemptionRecord): Uint8Array;
    toProtoMsg(message: MsgOverwriteRedemptionRecord): MsgOverwriteRedemptionRecordProtoMsg;
};
export declare const MsgOverwriteRedemptionRecordResponse: {
    typeUrl: string;
    encode(_: MsgOverwriteRedemptionRecordResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgOverwriteRedemptionRecordResponse;
    fromJSON(_: any): MsgOverwriteRedemptionRecordResponse;
    toJSON(_: MsgOverwriteRedemptionRecordResponse): JsonSafe<MsgOverwriteRedemptionRecordResponse>;
    fromPartial(_: Partial<MsgOverwriteRedemptionRecordResponse>): MsgOverwriteRedemptionRecordResponse;
    fromProtoMsg(message: MsgOverwriteRedemptionRecordResponseProtoMsg): MsgOverwriteRedemptionRecordResponse;
    toProto(message: MsgOverwriteRedemptionRecordResponse): Uint8Array;
    toProtoMsg(message: MsgOverwriteRedemptionRecordResponse): MsgOverwriteRedemptionRecordResponseProtoMsg;
};
export declare const MsgSetOperatorAddress: {
    typeUrl: string;
    encode(message: MsgSetOperatorAddress, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgSetOperatorAddress;
    fromJSON(object: any): MsgSetOperatorAddress;
    toJSON(message: MsgSetOperatorAddress): JsonSafe<MsgSetOperatorAddress>;
    fromPartial(object: Partial<MsgSetOperatorAddress>): MsgSetOperatorAddress;
    fromProtoMsg(message: MsgSetOperatorAddressProtoMsg): MsgSetOperatorAddress;
    toProto(message: MsgSetOperatorAddress): Uint8Array;
    toProtoMsg(message: MsgSetOperatorAddress): MsgSetOperatorAddressProtoMsg;
};
export declare const MsgSetOperatorAddressResponse: {
    typeUrl: string;
    encode(_: MsgSetOperatorAddressResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgSetOperatorAddressResponse;
    fromJSON(_: any): MsgSetOperatorAddressResponse;
    toJSON(_: MsgSetOperatorAddressResponse): JsonSafe<MsgSetOperatorAddressResponse>;
    fromPartial(_: Partial<MsgSetOperatorAddressResponse>): MsgSetOperatorAddressResponse;
    fromProtoMsg(message: MsgSetOperatorAddressResponseProtoMsg): MsgSetOperatorAddressResponse;
    toProto(message: MsgSetOperatorAddressResponse): Uint8Array;
    toProtoMsg(message: MsgSetOperatorAddressResponse): MsgSetOperatorAddressResponseProtoMsg;
};
