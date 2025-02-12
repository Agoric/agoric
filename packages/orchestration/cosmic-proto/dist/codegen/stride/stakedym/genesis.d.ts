import { HostZone, type HostZoneSDKType, DelegationRecord, type DelegationRecordSDKType, UnbondingRecord, type UnbondingRecordSDKType, RedemptionRecord, type RedemptionRecordSDKType, SlashRecord, type SlashRecordSDKType } from './stakedym.js';
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { type JsonSafe } from '../../json-safe.js';
/** Params defines the stakedym module parameters. */
export interface Params {
}
export interface ParamsProtoMsg {
    typeUrl: '/stride.stakedym.Params';
    value: Uint8Array;
}
/** Params defines the stakedym module parameters. */
export interface ParamsSDKType {
}
/**
 * TransferInProgressRecordIds stores record IDs for delegation records
 * that have a transfer in progress
 */
export interface TransferInProgressRecordIds {
    channelId: string;
    sequence: bigint;
    recordId: bigint;
}
export interface TransferInProgressRecordIdsProtoMsg {
    typeUrl: '/stride.stakedym.TransferInProgressRecordIds';
    value: Uint8Array;
}
/**
 * TransferInProgressRecordIds stores record IDs for delegation records
 * that have a transfer in progress
 */
export interface TransferInProgressRecordIdsSDKType {
    channel_id: string;
    sequence: bigint;
    record_id: bigint;
}
/** GenesisState defines the stakedym module's genesis state. */
export interface GenesisState {
    params: Params;
    hostZone: HostZone;
    delegationRecords: DelegationRecord[];
    unbondingRecords: UnbondingRecord[];
    redemptionRecords: RedemptionRecord[];
    slashRecords: SlashRecord[];
    transferInProgressRecordIds: TransferInProgressRecordIds[];
}
export interface GenesisStateProtoMsg {
    typeUrl: '/stride.stakedym.GenesisState';
    value: Uint8Array;
}
/** GenesisState defines the stakedym module's genesis state. */
export interface GenesisStateSDKType {
    params: ParamsSDKType;
    host_zone: HostZoneSDKType;
    delegation_records: DelegationRecordSDKType[];
    unbonding_records: UnbondingRecordSDKType[];
    redemption_records: RedemptionRecordSDKType[];
    slash_records: SlashRecordSDKType[];
    transfer_in_progress_record_ids: TransferInProgressRecordIdsSDKType[];
}
export declare const Params: {
    typeUrl: string;
    encode(_: Params, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): Params;
    fromJSON(_: any): Params;
    toJSON(_: Params): JsonSafe<Params>;
    fromPartial(_: Partial<Params>): Params;
    fromProtoMsg(message: ParamsProtoMsg): Params;
    toProto(message: Params): Uint8Array;
    toProtoMsg(message: Params): ParamsProtoMsg;
};
export declare const TransferInProgressRecordIds: {
    typeUrl: string;
    encode(message: TransferInProgressRecordIds, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): TransferInProgressRecordIds;
    fromJSON(object: any): TransferInProgressRecordIds;
    toJSON(message: TransferInProgressRecordIds): JsonSafe<TransferInProgressRecordIds>;
    fromPartial(object: Partial<TransferInProgressRecordIds>): TransferInProgressRecordIds;
    fromProtoMsg(message: TransferInProgressRecordIdsProtoMsg): TransferInProgressRecordIds;
    toProto(message: TransferInProgressRecordIds): Uint8Array;
    toProtoMsg(message: TransferInProgressRecordIds): TransferInProgressRecordIdsProtoMsg;
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
