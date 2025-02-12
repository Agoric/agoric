import { PageRequest, type PageRequestSDKType, PageResponse, type PageResponseSDKType } from '../../cosmos/base/query/v1beta1/pagination.js';
import { HostZone, type HostZoneSDKType, DelegationRecord, type DelegationRecordSDKType, UnbondingRecord, type UnbondingRecordSDKType, SlashRecord, type SlashRecordSDKType, RedemptionRecord, type RedemptionRecordSDKType } from './stakedym.js';
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { type JsonSafe } from '../../json-safe.js';
/** Host Zone */
export interface QueryHostZoneRequest {
}
export interface QueryHostZoneRequestProtoMsg {
    typeUrl: '/stride.stakedym.QueryHostZoneRequest';
    value: Uint8Array;
}
/** Host Zone */
export interface QueryHostZoneRequestSDKType {
}
export interface QueryHostZoneResponse {
    hostZone?: HostZone;
}
export interface QueryHostZoneResponseProtoMsg {
    typeUrl: '/stride.stakedym.QueryHostZoneResponse';
    value: Uint8Array;
}
export interface QueryHostZoneResponseSDKType {
    host_zone?: HostZoneSDKType;
}
/** All Delegation Records */
export interface QueryDelegationRecordsRequest {
    includeArchived: boolean;
}
export interface QueryDelegationRecordsRequestProtoMsg {
    typeUrl: '/stride.stakedym.QueryDelegationRecordsRequest';
    value: Uint8Array;
}
/** All Delegation Records */
export interface QueryDelegationRecordsRequestSDKType {
    include_archived: boolean;
}
export interface QueryDelegationRecordsResponse {
    delegationRecords: DelegationRecord[];
}
export interface QueryDelegationRecordsResponseProtoMsg {
    typeUrl: '/stride.stakedym.QueryDelegationRecordsResponse';
    value: Uint8Array;
}
export interface QueryDelegationRecordsResponseSDKType {
    delegation_records: DelegationRecordSDKType[];
}
/** All Unbonding Records */
export interface QueryUnbondingRecordsRequest {
    includeArchived: boolean;
}
export interface QueryUnbondingRecordsRequestProtoMsg {
    typeUrl: '/stride.stakedym.QueryUnbondingRecordsRequest';
    value: Uint8Array;
}
/** All Unbonding Records */
export interface QueryUnbondingRecordsRequestSDKType {
    include_archived: boolean;
}
export interface QueryUnbondingRecordsResponse {
    unbondingRecords: UnbondingRecord[];
}
export interface QueryUnbondingRecordsResponseProtoMsg {
    typeUrl: '/stride.stakedym.QueryUnbondingRecordsResponse';
    value: Uint8Array;
}
export interface QueryUnbondingRecordsResponseSDKType {
    unbonding_records: UnbondingRecordSDKType[];
}
/** Single Redemption Record */
export interface QueryRedemptionRecordRequest {
    unbondingRecordId: bigint;
    address: string;
}
export interface QueryRedemptionRecordRequestProtoMsg {
    typeUrl: '/stride.stakedym.QueryRedemptionRecordRequest';
    value: Uint8Array;
}
/** Single Redemption Record */
export interface QueryRedemptionRecordRequestSDKType {
    unbonding_record_id: bigint;
    address: string;
}
export interface QueryRedemptionRecordResponse {
    redemptionRecordResponse?: RedemptionRecordResponse;
}
export interface QueryRedemptionRecordResponseProtoMsg {
    typeUrl: '/stride.stakedym.QueryRedemptionRecordResponse';
    value: Uint8Array;
}
export interface QueryRedemptionRecordResponseSDKType {
    redemption_record_response?: RedemptionRecordResponseSDKType;
}
/** All Redemption Records */
export interface QueryRedemptionRecordsRequest {
    address: string;
    unbondingRecordId: bigint;
    pagination?: PageRequest;
}
export interface QueryRedemptionRecordsRequestProtoMsg {
    typeUrl: '/stride.stakedym.QueryRedemptionRecordsRequest';
    value: Uint8Array;
}
/** All Redemption Records */
export interface QueryRedemptionRecordsRequestSDKType {
    address: string;
    unbonding_record_id: bigint;
    pagination?: PageRequestSDKType;
}
export interface QueryRedemptionRecordsResponse {
    redemptionRecordResponses: RedemptionRecordResponse[];
    pagination?: PageResponse;
}
export interface QueryRedemptionRecordsResponseProtoMsg {
    typeUrl: '/stride.stakedym.QueryRedemptionRecordsResponse';
    value: Uint8Array;
}
export interface QueryRedemptionRecordsResponseSDKType {
    redemption_record_responses: RedemptionRecordResponseSDKType[];
    pagination?: PageResponseSDKType;
}
/** All Slash Records */
export interface QuerySlashRecordsRequest {
}
export interface QuerySlashRecordsRequestProtoMsg {
    typeUrl: '/stride.stakedym.QuerySlashRecordsRequest';
    value: Uint8Array;
}
/** All Slash Records */
export interface QuerySlashRecordsRequestSDKType {
}
export interface QuerySlashRecordsResponse {
    slashRecords: SlashRecord[];
}
export interface QuerySlashRecordsResponseProtoMsg {
    typeUrl: '/stride.stakedym.QuerySlashRecordsResponse';
    value: Uint8Array;
}
export interface QuerySlashRecordsResponseSDKType {
    slash_records: SlashRecordSDKType[];
}
/** Data structure for frontend to consume */
export interface RedemptionRecordResponse {
    /** Redemption record */
    redemptionRecord?: RedemptionRecord;
    /**
     * The Unix timestamp (in seconds) at which the unbonding for the UR
     * associated with this RR completes
     */
    unbondingCompletionTimeSeconds: bigint;
}
export interface RedemptionRecordResponseProtoMsg {
    typeUrl: '/stride.stakedym.RedemptionRecordResponse';
    value: Uint8Array;
}
/** Data structure for frontend to consume */
export interface RedemptionRecordResponseSDKType {
    redemption_record?: RedemptionRecordSDKType;
    unbonding_completion_time_seconds: bigint;
}
export declare const QueryHostZoneRequest: {
    typeUrl: string;
    encode(_: QueryHostZoneRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryHostZoneRequest;
    fromJSON(_: any): QueryHostZoneRequest;
    toJSON(_: QueryHostZoneRequest): JsonSafe<QueryHostZoneRequest>;
    fromPartial(_: Partial<QueryHostZoneRequest>): QueryHostZoneRequest;
    fromProtoMsg(message: QueryHostZoneRequestProtoMsg): QueryHostZoneRequest;
    toProto(message: QueryHostZoneRequest): Uint8Array;
    toProtoMsg(message: QueryHostZoneRequest): QueryHostZoneRequestProtoMsg;
};
export declare const QueryHostZoneResponse: {
    typeUrl: string;
    encode(message: QueryHostZoneResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryHostZoneResponse;
    fromJSON(object: any): QueryHostZoneResponse;
    toJSON(message: QueryHostZoneResponse): JsonSafe<QueryHostZoneResponse>;
    fromPartial(object: Partial<QueryHostZoneResponse>): QueryHostZoneResponse;
    fromProtoMsg(message: QueryHostZoneResponseProtoMsg): QueryHostZoneResponse;
    toProto(message: QueryHostZoneResponse): Uint8Array;
    toProtoMsg(message: QueryHostZoneResponse): QueryHostZoneResponseProtoMsg;
};
export declare const QueryDelegationRecordsRequest: {
    typeUrl: string;
    encode(message: QueryDelegationRecordsRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryDelegationRecordsRequest;
    fromJSON(object: any): QueryDelegationRecordsRequest;
    toJSON(message: QueryDelegationRecordsRequest): JsonSafe<QueryDelegationRecordsRequest>;
    fromPartial(object: Partial<QueryDelegationRecordsRequest>): QueryDelegationRecordsRequest;
    fromProtoMsg(message: QueryDelegationRecordsRequestProtoMsg): QueryDelegationRecordsRequest;
    toProto(message: QueryDelegationRecordsRequest): Uint8Array;
    toProtoMsg(message: QueryDelegationRecordsRequest): QueryDelegationRecordsRequestProtoMsg;
};
export declare const QueryDelegationRecordsResponse: {
    typeUrl: string;
    encode(message: QueryDelegationRecordsResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryDelegationRecordsResponse;
    fromJSON(object: any): QueryDelegationRecordsResponse;
    toJSON(message: QueryDelegationRecordsResponse): JsonSafe<QueryDelegationRecordsResponse>;
    fromPartial(object: Partial<QueryDelegationRecordsResponse>): QueryDelegationRecordsResponse;
    fromProtoMsg(message: QueryDelegationRecordsResponseProtoMsg): QueryDelegationRecordsResponse;
    toProto(message: QueryDelegationRecordsResponse): Uint8Array;
    toProtoMsg(message: QueryDelegationRecordsResponse): QueryDelegationRecordsResponseProtoMsg;
};
export declare const QueryUnbondingRecordsRequest: {
    typeUrl: string;
    encode(message: QueryUnbondingRecordsRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryUnbondingRecordsRequest;
    fromJSON(object: any): QueryUnbondingRecordsRequest;
    toJSON(message: QueryUnbondingRecordsRequest): JsonSafe<QueryUnbondingRecordsRequest>;
    fromPartial(object: Partial<QueryUnbondingRecordsRequest>): QueryUnbondingRecordsRequest;
    fromProtoMsg(message: QueryUnbondingRecordsRequestProtoMsg): QueryUnbondingRecordsRequest;
    toProto(message: QueryUnbondingRecordsRequest): Uint8Array;
    toProtoMsg(message: QueryUnbondingRecordsRequest): QueryUnbondingRecordsRequestProtoMsg;
};
export declare const QueryUnbondingRecordsResponse: {
    typeUrl: string;
    encode(message: QueryUnbondingRecordsResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryUnbondingRecordsResponse;
    fromJSON(object: any): QueryUnbondingRecordsResponse;
    toJSON(message: QueryUnbondingRecordsResponse): JsonSafe<QueryUnbondingRecordsResponse>;
    fromPartial(object: Partial<QueryUnbondingRecordsResponse>): QueryUnbondingRecordsResponse;
    fromProtoMsg(message: QueryUnbondingRecordsResponseProtoMsg): QueryUnbondingRecordsResponse;
    toProto(message: QueryUnbondingRecordsResponse): Uint8Array;
    toProtoMsg(message: QueryUnbondingRecordsResponse): QueryUnbondingRecordsResponseProtoMsg;
};
export declare const QueryRedemptionRecordRequest: {
    typeUrl: string;
    encode(message: QueryRedemptionRecordRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryRedemptionRecordRequest;
    fromJSON(object: any): QueryRedemptionRecordRequest;
    toJSON(message: QueryRedemptionRecordRequest): JsonSafe<QueryRedemptionRecordRequest>;
    fromPartial(object: Partial<QueryRedemptionRecordRequest>): QueryRedemptionRecordRequest;
    fromProtoMsg(message: QueryRedemptionRecordRequestProtoMsg): QueryRedemptionRecordRequest;
    toProto(message: QueryRedemptionRecordRequest): Uint8Array;
    toProtoMsg(message: QueryRedemptionRecordRequest): QueryRedemptionRecordRequestProtoMsg;
};
export declare const QueryRedemptionRecordResponse: {
    typeUrl: string;
    encode(message: QueryRedemptionRecordResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryRedemptionRecordResponse;
    fromJSON(object: any): QueryRedemptionRecordResponse;
    toJSON(message: QueryRedemptionRecordResponse): JsonSafe<QueryRedemptionRecordResponse>;
    fromPartial(object: Partial<QueryRedemptionRecordResponse>): QueryRedemptionRecordResponse;
    fromProtoMsg(message: QueryRedemptionRecordResponseProtoMsg): QueryRedemptionRecordResponse;
    toProto(message: QueryRedemptionRecordResponse): Uint8Array;
    toProtoMsg(message: QueryRedemptionRecordResponse): QueryRedemptionRecordResponseProtoMsg;
};
export declare const QueryRedemptionRecordsRequest: {
    typeUrl: string;
    encode(message: QueryRedemptionRecordsRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryRedemptionRecordsRequest;
    fromJSON(object: any): QueryRedemptionRecordsRequest;
    toJSON(message: QueryRedemptionRecordsRequest): JsonSafe<QueryRedemptionRecordsRequest>;
    fromPartial(object: Partial<QueryRedemptionRecordsRequest>): QueryRedemptionRecordsRequest;
    fromProtoMsg(message: QueryRedemptionRecordsRequestProtoMsg): QueryRedemptionRecordsRequest;
    toProto(message: QueryRedemptionRecordsRequest): Uint8Array;
    toProtoMsg(message: QueryRedemptionRecordsRequest): QueryRedemptionRecordsRequestProtoMsg;
};
export declare const QueryRedemptionRecordsResponse: {
    typeUrl: string;
    encode(message: QueryRedemptionRecordsResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryRedemptionRecordsResponse;
    fromJSON(object: any): QueryRedemptionRecordsResponse;
    toJSON(message: QueryRedemptionRecordsResponse): JsonSafe<QueryRedemptionRecordsResponse>;
    fromPartial(object: Partial<QueryRedemptionRecordsResponse>): QueryRedemptionRecordsResponse;
    fromProtoMsg(message: QueryRedemptionRecordsResponseProtoMsg): QueryRedemptionRecordsResponse;
    toProto(message: QueryRedemptionRecordsResponse): Uint8Array;
    toProtoMsg(message: QueryRedemptionRecordsResponse): QueryRedemptionRecordsResponseProtoMsg;
};
export declare const QuerySlashRecordsRequest: {
    typeUrl: string;
    encode(_: QuerySlashRecordsRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QuerySlashRecordsRequest;
    fromJSON(_: any): QuerySlashRecordsRequest;
    toJSON(_: QuerySlashRecordsRequest): JsonSafe<QuerySlashRecordsRequest>;
    fromPartial(_: Partial<QuerySlashRecordsRequest>): QuerySlashRecordsRequest;
    fromProtoMsg(message: QuerySlashRecordsRequestProtoMsg): QuerySlashRecordsRequest;
    toProto(message: QuerySlashRecordsRequest): Uint8Array;
    toProtoMsg(message: QuerySlashRecordsRequest): QuerySlashRecordsRequestProtoMsg;
};
export declare const QuerySlashRecordsResponse: {
    typeUrl: string;
    encode(message: QuerySlashRecordsResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QuerySlashRecordsResponse;
    fromJSON(object: any): QuerySlashRecordsResponse;
    toJSON(message: QuerySlashRecordsResponse): JsonSafe<QuerySlashRecordsResponse>;
    fromPartial(object: Partial<QuerySlashRecordsResponse>): QuerySlashRecordsResponse;
    fromProtoMsg(message: QuerySlashRecordsResponseProtoMsg): QuerySlashRecordsResponse;
    toProto(message: QuerySlashRecordsResponse): Uint8Array;
    toProtoMsg(message: QuerySlashRecordsResponse): QuerySlashRecordsResponseProtoMsg;
};
export declare const RedemptionRecordResponse: {
    typeUrl: string;
    encode(message: RedemptionRecordResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): RedemptionRecordResponse;
    fromJSON(object: any): RedemptionRecordResponse;
    toJSON(message: RedemptionRecordResponse): JsonSafe<RedemptionRecordResponse>;
    fromPartial(object: Partial<RedemptionRecordResponse>): RedemptionRecordResponse;
    fromProtoMsg(message: RedemptionRecordResponseProtoMsg): RedemptionRecordResponse;
    toProto(message: RedemptionRecordResponse): Uint8Array;
    toProtoMsg(message: RedemptionRecordResponse): RedemptionRecordResponseProtoMsg;
};
