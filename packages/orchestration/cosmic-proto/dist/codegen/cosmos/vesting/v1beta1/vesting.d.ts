import { BaseAccount, type BaseAccountSDKType } from '../../auth/v1beta1/auth.js';
import { Coin, type CoinSDKType } from '../../base/v1beta1/coin.js';
import { BinaryReader, BinaryWriter } from '../../../binary.js';
import { type JsonSafe } from '../../../json-safe.js';
/**
 * BaseVestingAccount implements the VestingAccount interface. It contains all
 * the necessary fields needed for any vesting account implementation.
 */
export interface BaseVestingAccount {
    baseAccount?: BaseAccount;
    originalVesting: Coin[];
    delegatedFree: Coin[];
    delegatedVesting: Coin[];
    /** Vesting end time, as unix timestamp (in seconds). */
    endTime: bigint;
}
export interface BaseVestingAccountProtoMsg {
    typeUrl: '/cosmos.vesting.v1beta1.BaseVestingAccount';
    value: Uint8Array;
}
/**
 * BaseVestingAccount implements the VestingAccount interface. It contains all
 * the necessary fields needed for any vesting account implementation.
 */
export interface BaseVestingAccountSDKType {
    base_account?: BaseAccountSDKType;
    original_vesting: CoinSDKType[];
    delegated_free: CoinSDKType[];
    delegated_vesting: CoinSDKType[];
    end_time: bigint;
}
/**
 * ContinuousVestingAccount implements the VestingAccount interface. It
 * continuously vests by unlocking coins linearly with respect to time.
 */
export interface ContinuousVestingAccount {
    baseVestingAccount?: BaseVestingAccount;
    /** Vesting start time, as unix timestamp (in seconds). */
    startTime: bigint;
}
export interface ContinuousVestingAccountProtoMsg {
    typeUrl: '/cosmos.vesting.v1beta1.ContinuousVestingAccount';
    value: Uint8Array;
}
/**
 * ContinuousVestingAccount implements the VestingAccount interface. It
 * continuously vests by unlocking coins linearly with respect to time.
 */
export interface ContinuousVestingAccountSDKType {
    base_vesting_account?: BaseVestingAccountSDKType;
    start_time: bigint;
}
/**
 * DelayedVestingAccount implements the VestingAccount interface. It vests all
 * coins after a specific time, but non prior. In other words, it keeps them
 * locked until a specified time.
 */
export interface DelayedVestingAccount {
    baseVestingAccount?: BaseVestingAccount;
}
export interface DelayedVestingAccountProtoMsg {
    typeUrl: '/cosmos.vesting.v1beta1.DelayedVestingAccount';
    value: Uint8Array;
}
/**
 * DelayedVestingAccount implements the VestingAccount interface. It vests all
 * coins after a specific time, but non prior. In other words, it keeps them
 * locked until a specified time.
 */
export interface DelayedVestingAccountSDKType {
    base_vesting_account?: BaseVestingAccountSDKType;
}
/**
 * Period defines a length of time and amount of coins that will vest.
 * A sequence of periods defines a sequence of vesting events, with the
 * first period relative to an externally-provided start time,
 * and subsequent periods relatie to their predecessor.
 */
export interface Period {
    /** Period duration in seconds. */
    length: bigint;
    amount: Coin[];
}
export interface PeriodProtoMsg {
    typeUrl: '/cosmos.vesting.v1beta1.Period';
    value: Uint8Array;
}
/**
 * Period defines a length of time and amount of coins that will vest.
 * A sequence of periods defines a sequence of vesting events, with the
 * first period relative to an externally-provided start time,
 * and subsequent periods relatie to their predecessor.
 */
export interface PeriodSDKType {
    length: bigint;
    amount: CoinSDKType[];
}
/**
 * PeriodicVestingAccount implements the VestingAccount interface. It
 * periodically vests by unlocking coins during each specified period.
 */
export interface PeriodicVestingAccount {
    baseVestingAccount?: BaseVestingAccount;
    startTime: bigint;
    vestingPeriods: Period[];
}
export interface PeriodicVestingAccountProtoMsg {
    typeUrl: '/cosmos.vesting.v1beta1.PeriodicVestingAccount';
    value: Uint8Array;
}
/**
 * PeriodicVestingAccount implements the VestingAccount interface. It
 * periodically vests by unlocking coins during each specified period.
 */
export interface PeriodicVestingAccountSDKType {
    base_vesting_account?: BaseVestingAccountSDKType;
    start_time: bigint;
    vesting_periods: PeriodSDKType[];
}
/**
 * PermanentLockedAccount implements the VestingAccount interface. It does
 * not ever release coins, locking them indefinitely. Coins in this account can
 * still be used for delegating and for governance votes even while locked.
 *
 * Since: cosmos-sdk 0.43
 */
export interface PermanentLockedAccount {
    baseVestingAccount?: BaseVestingAccount;
}
export interface PermanentLockedAccountProtoMsg {
    typeUrl: '/cosmos.vesting.v1beta1.PermanentLockedAccount';
    value: Uint8Array;
}
/**
 * PermanentLockedAccount implements the VestingAccount interface. It does
 * not ever release coins, locking them indefinitely. Coins in this account can
 * still be used for delegating and for governance votes even while locked.
 *
 * Since: cosmos-sdk 0.43
 */
export interface PermanentLockedAccountSDKType {
    base_vesting_account?: BaseVestingAccountSDKType;
}
/**
 * ClawbackVestingAccount implements the VestingAccount interface. It provides
 * an account that can hold contributions subject to "lockup" (like a
 * PeriodicVestingAccount), or vesting which is subject to clawback
 * of unvested tokens, or a combination (tokens vest, but are still locked).
 */
export interface ClawbackVestingAccount {
    baseVestingAccount?: BaseVestingAccount;
    /** funder_address specifies the account which can perform clawback. */
    funderAddress: string;
    startTime: bigint;
    /** unlocking schedule relative to the BaseVestingAccount start_time. */
    lockupPeriods: Period[];
    /** vesting (i.e. immunity from clawback) schedule relative to the BaseVestingAccount start_time. */
    vestingPeriods: Period[];
}
export interface ClawbackVestingAccountProtoMsg {
    typeUrl: '/cosmos.vesting.v1beta1.ClawbackVestingAccount';
    value: Uint8Array;
}
/**
 * ClawbackVestingAccount implements the VestingAccount interface. It provides
 * an account that can hold contributions subject to "lockup" (like a
 * PeriodicVestingAccount), or vesting which is subject to clawback
 * of unvested tokens, or a combination (tokens vest, but are still locked).
 */
export interface ClawbackVestingAccountSDKType {
    base_vesting_account?: BaseVestingAccountSDKType;
    funder_address: string;
    start_time: bigint;
    lockup_periods: PeriodSDKType[];
    vesting_periods: PeriodSDKType[];
}
export declare const BaseVestingAccount: {
    typeUrl: string;
    encode(message: BaseVestingAccount, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): BaseVestingAccount;
    fromJSON(object: any): BaseVestingAccount;
    toJSON(message: BaseVestingAccount): JsonSafe<BaseVestingAccount>;
    fromPartial(object: Partial<BaseVestingAccount>): BaseVestingAccount;
    fromProtoMsg(message: BaseVestingAccountProtoMsg): BaseVestingAccount;
    toProto(message: BaseVestingAccount): Uint8Array;
    toProtoMsg(message: BaseVestingAccount): BaseVestingAccountProtoMsg;
};
export declare const ContinuousVestingAccount: {
    typeUrl: string;
    encode(message: ContinuousVestingAccount, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): ContinuousVestingAccount;
    fromJSON(object: any): ContinuousVestingAccount;
    toJSON(message: ContinuousVestingAccount): JsonSafe<ContinuousVestingAccount>;
    fromPartial(object: Partial<ContinuousVestingAccount>): ContinuousVestingAccount;
    fromProtoMsg(message: ContinuousVestingAccountProtoMsg): ContinuousVestingAccount;
    toProto(message: ContinuousVestingAccount): Uint8Array;
    toProtoMsg(message: ContinuousVestingAccount): ContinuousVestingAccountProtoMsg;
};
export declare const DelayedVestingAccount: {
    typeUrl: string;
    encode(message: DelayedVestingAccount, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): DelayedVestingAccount;
    fromJSON(object: any): DelayedVestingAccount;
    toJSON(message: DelayedVestingAccount): JsonSafe<DelayedVestingAccount>;
    fromPartial(object: Partial<DelayedVestingAccount>): DelayedVestingAccount;
    fromProtoMsg(message: DelayedVestingAccountProtoMsg): DelayedVestingAccount;
    toProto(message: DelayedVestingAccount): Uint8Array;
    toProtoMsg(message: DelayedVestingAccount): DelayedVestingAccountProtoMsg;
};
export declare const Period: {
    typeUrl: string;
    encode(message: Period, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): Period;
    fromJSON(object: any): Period;
    toJSON(message: Period): JsonSafe<Period>;
    fromPartial(object: Partial<Period>): Period;
    fromProtoMsg(message: PeriodProtoMsg): Period;
    toProto(message: Period): Uint8Array;
    toProtoMsg(message: Period): PeriodProtoMsg;
};
export declare const PeriodicVestingAccount: {
    typeUrl: string;
    encode(message: PeriodicVestingAccount, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): PeriodicVestingAccount;
    fromJSON(object: any): PeriodicVestingAccount;
    toJSON(message: PeriodicVestingAccount): JsonSafe<PeriodicVestingAccount>;
    fromPartial(object: Partial<PeriodicVestingAccount>): PeriodicVestingAccount;
    fromProtoMsg(message: PeriodicVestingAccountProtoMsg): PeriodicVestingAccount;
    toProto(message: PeriodicVestingAccount): Uint8Array;
    toProtoMsg(message: PeriodicVestingAccount): PeriodicVestingAccountProtoMsg;
};
export declare const PermanentLockedAccount: {
    typeUrl: string;
    encode(message: PermanentLockedAccount, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): PermanentLockedAccount;
    fromJSON(object: any): PermanentLockedAccount;
    toJSON(message: PermanentLockedAccount): JsonSafe<PermanentLockedAccount>;
    fromPartial(object: Partial<PermanentLockedAccount>): PermanentLockedAccount;
    fromProtoMsg(message: PermanentLockedAccountProtoMsg): PermanentLockedAccount;
    toProto(message: PermanentLockedAccount): Uint8Array;
    toProtoMsg(message: PermanentLockedAccount): PermanentLockedAccountProtoMsg;
};
export declare const ClawbackVestingAccount: {
    typeUrl: string;
    encode(message: ClawbackVestingAccount, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): ClawbackVestingAccount;
    fromJSON(object: any): ClawbackVestingAccount;
    toJSON(message: ClawbackVestingAccount): JsonSafe<ClawbackVestingAccount>;
    fromPartial(object: Partial<ClawbackVestingAccount>): ClawbackVestingAccount;
    fromProtoMsg(message: ClawbackVestingAccountProtoMsg): ClawbackVestingAccount;
    toProto(message: ClawbackVestingAccount): Uint8Array;
    toProtoMsg(message: ClawbackVestingAccount): ClawbackVestingAccountProtoMsg;
};
