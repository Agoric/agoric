import { DecCoin, type DecCoinSDKType } from '../../base/v1beta1/coin.js';
import { ValidatorAccumulatedCommission, type ValidatorAccumulatedCommissionSDKType, ValidatorHistoricalRewards, type ValidatorHistoricalRewardsSDKType, ValidatorCurrentRewards, type ValidatorCurrentRewardsSDKType, DelegatorStartingInfo, type DelegatorStartingInfoSDKType, ValidatorSlashEvent, type ValidatorSlashEventSDKType, Params, type ParamsSDKType, FeePool, type FeePoolSDKType } from './distribution.js';
import { BinaryReader, BinaryWriter } from '../../../binary.js';
import { type JsonSafe } from '../../../json-safe.js';
/**
 * DelegatorWithdrawInfo is the address for where distributions rewards are
 * withdrawn to by default this struct is only used at genesis to feed in
 * default withdraw addresses.
 */
export interface DelegatorWithdrawInfo {
    /** delegator_address is the address of the delegator. */
    delegatorAddress: string;
    /** withdraw_address is the address to withdraw the delegation rewards to. */
    withdrawAddress: string;
}
export interface DelegatorWithdrawInfoProtoMsg {
    typeUrl: '/cosmos.distribution.v1beta1.DelegatorWithdrawInfo';
    value: Uint8Array;
}
/**
 * DelegatorWithdrawInfo is the address for where distributions rewards are
 * withdrawn to by default this struct is only used at genesis to feed in
 * default withdraw addresses.
 */
export interface DelegatorWithdrawInfoSDKType {
    delegator_address: string;
    withdraw_address: string;
}
/** ValidatorOutstandingRewardsRecord is used for import/export via genesis json. */
export interface ValidatorOutstandingRewardsRecord {
    /** validator_address is the address of the validator. */
    validatorAddress: string;
    /** outstanding_rewards represents the oustanding rewards of a validator. */
    outstandingRewards: DecCoin[];
}
export interface ValidatorOutstandingRewardsRecordProtoMsg {
    typeUrl: '/cosmos.distribution.v1beta1.ValidatorOutstandingRewardsRecord';
    value: Uint8Array;
}
/** ValidatorOutstandingRewardsRecord is used for import/export via genesis json. */
export interface ValidatorOutstandingRewardsRecordSDKType {
    validator_address: string;
    outstanding_rewards: DecCoinSDKType[];
}
/**
 * ValidatorAccumulatedCommissionRecord is used for import / export via genesis
 * json.
 */
export interface ValidatorAccumulatedCommissionRecord {
    /** validator_address is the address of the validator. */
    validatorAddress: string;
    /** accumulated is the accumulated commission of a validator. */
    accumulated: ValidatorAccumulatedCommission;
}
export interface ValidatorAccumulatedCommissionRecordProtoMsg {
    typeUrl: '/cosmos.distribution.v1beta1.ValidatorAccumulatedCommissionRecord';
    value: Uint8Array;
}
/**
 * ValidatorAccumulatedCommissionRecord is used for import / export via genesis
 * json.
 */
export interface ValidatorAccumulatedCommissionRecordSDKType {
    validator_address: string;
    accumulated: ValidatorAccumulatedCommissionSDKType;
}
/**
 * ValidatorHistoricalRewardsRecord is used for import / export via genesis
 * json.
 */
export interface ValidatorHistoricalRewardsRecord {
    /** validator_address is the address of the validator. */
    validatorAddress: string;
    /** period defines the period the historical rewards apply to. */
    period: bigint;
    /** rewards defines the historical rewards of a validator. */
    rewards: ValidatorHistoricalRewards;
}
export interface ValidatorHistoricalRewardsRecordProtoMsg {
    typeUrl: '/cosmos.distribution.v1beta1.ValidatorHistoricalRewardsRecord';
    value: Uint8Array;
}
/**
 * ValidatorHistoricalRewardsRecord is used for import / export via genesis
 * json.
 */
export interface ValidatorHistoricalRewardsRecordSDKType {
    validator_address: string;
    period: bigint;
    rewards: ValidatorHistoricalRewardsSDKType;
}
/** ValidatorCurrentRewardsRecord is used for import / export via genesis json. */
export interface ValidatorCurrentRewardsRecord {
    /** validator_address is the address of the validator. */
    validatorAddress: string;
    /** rewards defines the current rewards of a validator. */
    rewards: ValidatorCurrentRewards;
}
export interface ValidatorCurrentRewardsRecordProtoMsg {
    typeUrl: '/cosmos.distribution.v1beta1.ValidatorCurrentRewardsRecord';
    value: Uint8Array;
}
/** ValidatorCurrentRewardsRecord is used for import / export via genesis json. */
export interface ValidatorCurrentRewardsRecordSDKType {
    validator_address: string;
    rewards: ValidatorCurrentRewardsSDKType;
}
/** DelegatorStartingInfoRecord used for import / export via genesis json. */
export interface DelegatorStartingInfoRecord {
    /** delegator_address is the address of the delegator. */
    delegatorAddress: string;
    /** validator_address is the address of the validator. */
    validatorAddress: string;
    /** starting_info defines the starting info of a delegator. */
    startingInfo: DelegatorStartingInfo;
}
export interface DelegatorStartingInfoRecordProtoMsg {
    typeUrl: '/cosmos.distribution.v1beta1.DelegatorStartingInfoRecord';
    value: Uint8Array;
}
/** DelegatorStartingInfoRecord used for import / export via genesis json. */
export interface DelegatorStartingInfoRecordSDKType {
    delegator_address: string;
    validator_address: string;
    starting_info: DelegatorStartingInfoSDKType;
}
/** ValidatorSlashEventRecord is used for import / export via genesis json. */
export interface ValidatorSlashEventRecord {
    /** validator_address is the address of the validator. */
    validatorAddress: string;
    /** height defines the block height at which the slash event occured. */
    height: bigint;
    /** period is the period of the slash event. */
    period: bigint;
    /** validator_slash_event describes the slash event. */
    validatorSlashEvent: ValidatorSlashEvent;
}
export interface ValidatorSlashEventRecordProtoMsg {
    typeUrl: '/cosmos.distribution.v1beta1.ValidatorSlashEventRecord';
    value: Uint8Array;
}
/** ValidatorSlashEventRecord is used for import / export via genesis json. */
export interface ValidatorSlashEventRecordSDKType {
    validator_address: string;
    height: bigint;
    period: bigint;
    validator_slash_event: ValidatorSlashEventSDKType;
}
/** GenesisState defines the distribution module's genesis state. */
export interface GenesisState {
    /** params defines all the paramaters of the module. */
    params: Params;
    /** fee_pool defines the fee pool at genesis. */
    feePool: FeePool;
    /** fee_pool defines the delegator withdraw infos at genesis. */
    delegatorWithdrawInfos: DelegatorWithdrawInfo[];
    /** fee_pool defines the previous proposer at genesis. */
    previousProposer: string;
    /** fee_pool defines the outstanding rewards of all validators at genesis. */
    outstandingRewards: ValidatorOutstandingRewardsRecord[];
    /** fee_pool defines the accumulated commisions of all validators at genesis. */
    validatorAccumulatedCommissions: ValidatorAccumulatedCommissionRecord[];
    /** fee_pool defines the historical rewards of all validators at genesis. */
    validatorHistoricalRewards: ValidatorHistoricalRewardsRecord[];
    /** fee_pool defines the current rewards of all validators at genesis. */
    validatorCurrentRewards: ValidatorCurrentRewardsRecord[];
    /** fee_pool defines the delegator starting infos at genesis. */
    delegatorStartingInfos: DelegatorStartingInfoRecord[];
    /** fee_pool defines the validator slash events at genesis. */
    validatorSlashEvents: ValidatorSlashEventRecord[];
}
export interface GenesisStateProtoMsg {
    typeUrl: '/cosmos.distribution.v1beta1.GenesisState';
    value: Uint8Array;
}
/** GenesisState defines the distribution module's genesis state. */
export interface GenesisStateSDKType {
    params: ParamsSDKType;
    fee_pool: FeePoolSDKType;
    delegator_withdraw_infos: DelegatorWithdrawInfoSDKType[];
    previous_proposer: string;
    outstanding_rewards: ValidatorOutstandingRewardsRecordSDKType[];
    validator_accumulated_commissions: ValidatorAccumulatedCommissionRecordSDKType[];
    validator_historical_rewards: ValidatorHistoricalRewardsRecordSDKType[];
    validator_current_rewards: ValidatorCurrentRewardsRecordSDKType[];
    delegator_starting_infos: DelegatorStartingInfoRecordSDKType[];
    validator_slash_events: ValidatorSlashEventRecordSDKType[];
}
export declare const DelegatorWithdrawInfo: {
    typeUrl: string;
    encode(message: DelegatorWithdrawInfo, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): DelegatorWithdrawInfo;
    fromJSON(object: any): DelegatorWithdrawInfo;
    toJSON(message: DelegatorWithdrawInfo): JsonSafe<DelegatorWithdrawInfo>;
    fromPartial(object: Partial<DelegatorWithdrawInfo>): DelegatorWithdrawInfo;
    fromProtoMsg(message: DelegatorWithdrawInfoProtoMsg): DelegatorWithdrawInfo;
    toProto(message: DelegatorWithdrawInfo): Uint8Array;
    toProtoMsg(message: DelegatorWithdrawInfo): DelegatorWithdrawInfoProtoMsg;
};
export declare const ValidatorOutstandingRewardsRecord: {
    typeUrl: string;
    encode(message: ValidatorOutstandingRewardsRecord, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): ValidatorOutstandingRewardsRecord;
    fromJSON(object: any): ValidatorOutstandingRewardsRecord;
    toJSON(message: ValidatorOutstandingRewardsRecord): JsonSafe<ValidatorOutstandingRewardsRecord>;
    fromPartial(object: Partial<ValidatorOutstandingRewardsRecord>): ValidatorOutstandingRewardsRecord;
    fromProtoMsg(message: ValidatorOutstandingRewardsRecordProtoMsg): ValidatorOutstandingRewardsRecord;
    toProto(message: ValidatorOutstandingRewardsRecord): Uint8Array;
    toProtoMsg(message: ValidatorOutstandingRewardsRecord): ValidatorOutstandingRewardsRecordProtoMsg;
};
export declare const ValidatorAccumulatedCommissionRecord: {
    typeUrl: string;
    encode(message: ValidatorAccumulatedCommissionRecord, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): ValidatorAccumulatedCommissionRecord;
    fromJSON(object: any): ValidatorAccumulatedCommissionRecord;
    toJSON(message: ValidatorAccumulatedCommissionRecord): JsonSafe<ValidatorAccumulatedCommissionRecord>;
    fromPartial(object: Partial<ValidatorAccumulatedCommissionRecord>): ValidatorAccumulatedCommissionRecord;
    fromProtoMsg(message: ValidatorAccumulatedCommissionRecordProtoMsg): ValidatorAccumulatedCommissionRecord;
    toProto(message: ValidatorAccumulatedCommissionRecord): Uint8Array;
    toProtoMsg(message: ValidatorAccumulatedCommissionRecord): ValidatorAccumulatedCommissionRecordProtoMsg;
};
export declare const ValidatorHistoricalRewardsRecord: {
    typeUrl: string;
    encode(message: ValidatorHistoricalRewardsRecord, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): ValidatorHistoricalRewardsRecord;
    fromJSON(object: any): ValidatorHistoricalRewardsRecord;
    toJSON(message: ValidatorHistoricalRewardsRecord): JsonSafe<ValidatorHistoricalRewardsRecord>;
    fromPartial(object: Partial<ValidatorHistoricalRewardsRecord>): ValidatorHistoricalRewardsRecord;
    fromProtoMsg(message: ValidatorHistoricalRewardsRecordProtoMsg): ValidatorHistoricalRewardsRecord;
    toProto(message: ValidatorHistoricalRewardsRecord): Uint8Array;
    toProtoMsg(message: ValidatorHistoricalRewardsRecord): ValidatorHistoricalRewardsRecordProtoMsg;
};
export declare const ValidatorCurrentRewardsRecord: {
    typeUrl: string;
    encode(message: ValidatorCurrentRewardsRecord, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): ValidatorCurrentRewardsRecord;
    fromJSON(object: any): ValidatorCurrentRewardsRecord;
    toJSON(message: ValidatorCurrentRewardsRecord): JsonSafe<ValidatorCurrentRewardsRecord>;
    fromPartial(object: Partial<ValidatorCurrentRewardsRecord>): ValidatorCurrentRewardsRecord;
    fromProtoMsg(message: ValidatorCurrentRewardsRecordProtoMsg): ValidatorCurrentRewardsRecord;
    toProto(message: ValidatorCurrentRewardsRecord): Uint8Array;
    toProtoMsg(message: ValidatorCurrentRewardsRecord): ValidatorCurrentRewardsRecordProtoMsg;
};
export declare const DelegatorStartingInfoRecord: {
    typeUrl: string;
    encode(message: DelegatorStartingInfoRecord, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): DelegatorStartingInfoRecord;
    fromJSON(object: any): DelegatorStartingInfoRecord;
    toJSON(message: DelegatorStartingInfoRecord): JsonSafe<DelegatorStartingInfoRecord>;
    fromPartial(object: Partial<DelegatorStartingInfoRecord>): DelegatorStartingInfoRecord;
    fromProtoMsg(message: DelegatorStartingInfoRecordProtoMsg): DelegatorStartingInfoRecord;
    toProto(message: DelegatorStartingInfoRecord): Uint8Array;
    toProtoMsg(message: DelegatorStartingInfoRecord): DelegatorStartingInfoRecordProtoMsg;
};
export declare const ValidatorSlashEventRecord: {
    typeUrl: string;
    encode(message: ValidatorSlashEventRecord, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): ValidatorSlashEventRecord;
    fromJSON(object: any): ValidatorSlashEventRecord;
    toJSON(message: ValidatorSlashEventRecord): JsonSafe<ValidatorSlashEventRecord>;
    fromPartial(object: Partial<ValidatorSlashEventRecord>): ValidatorSlashEventRecord;
    fromProtoMsg(message: ValidatorSlashEventRecordProtoMsg): ValidatorSlashEventRecord;
    toProto(message: ValidatorSlashEventRecord): Uint8Array;
    toProtoMsg(message: ValidatorSlashEventRecord): ValidatorSlashEventRecordProtoMsg;
};
export declare const GenesisState: {
    typeUrl: string;
    encode(message: GenesisState, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): GenesisState;
    fromJSON(object: any): GenesisState;
    toJSON(message: GenesisState): JsonSafe<GenesisState>;
    fromPartial(object: Partial<GenesisState>): GenesisState;
    fromProtoMsg(message: GenesisStateProtoMsg): GenesisState;
    toProto(message: GenesisState): Uint8Array;
    toProtoMsg(message: GenesisState): GenesisStateProtoMsg;
};
