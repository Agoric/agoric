import { PageRequest, type PageRequestSDKType, PageResponse, type PageResponseSDKType } from '../../cosmos/base/query/v1beta1/pagination.js';
import { Params, type ParamsSDKType } from './params.js';
import { DepositRecord, type DepositRecordSDKType, UserRedemptionRecord, type UserRedemptionRecordSDKType, EpochUnbondingRecord, type EpochUnbondingRecordSDKType, LSMTokenDeposit, type LSMTokenDepositSDKType } from './records.js';
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { type JsonSafe } from '../../json-safe.js';
/** QueryParamsRequest is request type for the Query/Params RPC method. */
export interface QueryParamsRequest {
}
export interface QueryParamsRequestProtoMsg {
    typeUrl: '/stride.records.QueryParamsRequest';
    value: Uint8Array;
}
/** QueryParamsRequest is request type for the Query/Params RPC method. */
export interface QueryParamsRequestSDKType {
}
/** QueryParamsResponse is response type for the Query/Params RPC method. */
export interface QueryParamsResponse {
    /** params holds all the parameters of this module. */
    params: Params;
}
export interface QueryParamsResponseProtoMsg {
    typeUrl: '/stride.records.QueryParamsResponse';
    value: Uint8Array;
}
/** QueryParamsResponse is response type for the Query/Params RPC method. */
export interface QueryParamsResponseSDKType {
    params: ParamsSDKType;
}
export interface QueryGetDepositRecordRequest {
    id: bigint;
}
export interface QueryGetDepositRecordRequestProtoMsg {
    typeUrl: '/stride.records.QueryGetDepositRecordRequest';
    value: Uint8Array;
}
export interface QueryGetDepositRecordRequestSDKType {
    id: bigint;
}
export interface QueryGetDepositRecordResponse {
    depositRecord: DepositRecord;
}
export interface QueryGetDepositRecordResponseProtoMsg {
    typeUrl: '/stride.records.QueryGetDepositRecordResponse';
    value: Uint8Array;
}
export interface QueryGetDepositRecordResponseSDKType {
    deposit_record: DepositRecordSDKType;
}
export interface QueryAllDepositRecordRequest {
    pagination?: PageRequest;
}
export interface QueryAllDepositRecordRequestProtoMsg {
    typeUrl: '/stride.records.QueryAllDepositRecordRequest';
    value: Uint8Array;
}
export interface QueryAllDepositRecordRequestSDKType {
    pagination?: PageRequestSDKType;
}
export interface QueryAllDepositRecordResponse {
    depositRecord: DepositRecord[];
    pagination?: PageResponse;
}
export interface QueryAllDepositRecordResponseProtoMsg {
    typeUrl: '/stride.records.QueryAllDepositRecordResponse';
    value: Uint8Array;
}
export interface QueryAllDepositRecordResponseSDKType {
    deposit_record: DepositRecordSDKType[];
    pagination?: PageResponseSDKType;
}
export interface QueryDepositRecordByHostRequest {
    hostZoneId: string;
}
export interface QueryDepositRecordByHostRequestProtoMsg {
    typeUrl: '/stride.records.QueryDepositRecordByHostRequest';
    value: Uint8Array;
}
export interface QueryDepositRecordByHostRequestSDKType {
    host_zone_id: string;
}
export interface QueryDepositRecordByHostResponse {
    depositRecord: DepositRecord[];
}
export interface QueryDepositRecordByHostResponseProtoMsg {
    typeUrl: '/stride.records.QueryDepositRecordByHostResponse';
    value: Uint8Array;
}
export interface QueryDepositRecordByHostResponseSDKType {
    deposit_record: DepositRecordSDKType[];
}
export interface QueryGetUserRedemptionRecordRequest {
    id: string;
}
export interface QueryGetUserRedemptionRecordRequestProtoMsg {
    typeUrl: '/stride.records.QueryGetUserRedemptionRecordRequest';
    value: Uint8Array;
}
export interface QueryGetUserRedemptionRecordRequestSDKType {
    id: string;
}
export interface QueryGetUserRedemptionRecordResponse {
    userRedemptionRecord: UserRedemptionRecord;
}
export interface QueryGetUserRedemptionRecordResponseProtoMsg {
    typeUrl: '/stride.records.QueryGetUserRedemptionRecordResponse';
    value: Uint8Array;
}
export interface QueryGetUserRedemptionRecordResponseSDKType {
    user_redemption_record: UserRedemptionRecordSDKType;
}
export interface QueryAllUserRedemptionRecordRequest {
    pagination?: PageRequest;
}
export interface QueryAllUserRedemptionRecordRequestProtoMsg {
    typeUrl: '/stride.records.QueryAllUserRedemptionRecordRequest';
    value: Uint8Array;
}
export interface QueryAllUserRedemptionRecordRequestSDKType {
    pagination?: PageRequestSDKType;
}
export interface QueryAllUserRedemptionRecordResponse {
    userRedemptionRecord: UserRedemptionRecord[];
    pagination?: PageResponse;
}
export interface QueryAllUserRedemptionRecordResponseProtoMsg {
    typeUrl: '/stride.records.QueryAllUserRedemptionRecordResponse';
    value: Uint8Array;
}
export interface QueryAllUserRedemptionRecordResponseSDKType {
    user_redemption_record: UserRedemptionRecordSDKType[];
    pagination?: PageResponseSDKType;
}
/** Query UserRedemptionRecords by chainId / userId pair */
export interface QueryAllUserRedemptionRecordForUserRequest {
    chainId: string;
    day: bigint;
    address: string;
    limit: bigint;
    pagination?: PageRequest;
}
export interface QueryAllUserRedemptionRecordForUserRequestProtoMsg {
    typeUrl: '/stride.records.QueryAllUserRedemptionRecordForUserRequest';
    value: Uint8Array;
}
/** Query UserRedemptionRecords by chainId / userId pair */
export interface QueryAllUserRedemptionRecordForUserRequestSDKType {
    chain_id: string;
    day: bigint;
    address: string;
    limit: bigint;
    pagination?: PageRequestSDKType;
}
export interface QueryAllUserRedemptionRecordForUserResponse {
    userRedemptionRecord: UserRedemptionRecord[];
    pagination?: PageResponse;
}
export interface QueryAllUserRedemptionRecordForUserResponseProtoMsg {
    typeUrl: '/stride.records.QueryAllUserRedemptionRecordForUserResponse';
    value: Uint8Array;
}
export interface QueryAllUserRedemptionRecordForUserResponseSDKType {
    user_redemption_record: UserRedemptionRecordSDKType[];
    pagination?: PageResponseSDKType;
}
export interface QueryGetEpochUnbondingRecordRequest {
    epochNumber: bigint;
}
export interface QueryGetEpochUnbondingRecordRequestProtoMsg {
    typeUrl: '/stride.records.QueryGetEpochUnbondingRecordRequest';
    value: Uint8Array;
}
export interface QueryGetEpochUnbondingRecordRequestSDKType {
    epoch_number: bigint;
}
export interface QueryGetEpochUnbondingRecordResponse {
    epochUnbondingRecord: EpochUnbondingRecord;
}
export interface QueryGetEpochUnbondingRecordResponseProtoMsg {
    typeUrl: '/stride.records.QueryGetEpochUnbondingRecordResponse';
    value: Uint8Array;
}
export interface QueryGetEpochUnbondingRecordResponseSDKType {
    epoch_unbonding_record: EpochUnbondingRecordSDKType;
}
export interface QueryAllEpochUnbondingRecordRequest {
    pagination?: PageRequest;
}
export interface QueryAllEpochUnbondingRecordRequestProtoMsg {
    typeUrl: '/stride.records.QueryAllEpochUnbondingRecordRequest';
    value: Uint8Array;
}
export interface QueryAllEpochUnbondingRecordRequestSDKType {
    pagination?: PageRequestSDKType;
}
export interface QueryAllEpochUnbondingRecordResponse {
    epochUnbondingRecord: EpochUnbondingRecord[];
    pagination?: PageResponse;
}
export interface QueryAllEpochUnbondingRecordResponseProtoMsg {
    typeUrl: '/stride.records.QueryAllEpochUnbondingRecordResponse';
    value: Uint8Array;
}
export interface QueryAllEpochUnbondingRecordResponseSDKType {
    epoch_unbonding_record: EpochUnbondingRecordSDKType[];
    pagination?: PageResponseSDKType;
}
export interface QueryLSMDepositRequest {
    chainId: string;
    denom: string;
}
export interface QueryLSMDepositRequestProtoMsg {
    typeUrl: '/stride.records.QueryLSMDepositRequest';
    value: Uint8Array;
}
export interface QueryLSMDepositRequestSDKType {
    chain_id: string;
    denom: string;
}
export interface QueryLSMDepositResponse {
    deposit: LSMTokenDeposit;
}
export interface QueryLSMDepositResponseProtoMsg {
    typeUrl: '/stride.records.QueryLSMDepositResponse';
    value: Uint8Array;
}
export interface QueryLSMDepositResponseSDKType {
    deposit: LSMTokenDepositSDKType;
}
export interface QueryLSMDepositsRequest {
    chainId: string;
    validatorAddress: string;
    status: string;
}
export interface QueryLSMDepositsRequestProtoMsg {
    typeUrl: '/stride.records.QueryLSMDepositsRequest';
    value: Uint8Array;
}
export interface QueryLSMDepositsRequestSDKType {
    chain_id: string;
    validator_address: string;
    status: string;
}
export interface QueryLSMDepositsResponse {
    deposits: LSMTokenDeposit[];
}
export interface QueryLSMDepositsResponseProtoMsg {
    typeUrl: '/stride.records.QueryLSMDepositsResponse';
    value: Uint8Array;
}
export interface QueryLSMDepositsResponseSDKType {
    deposits: LSMTokenDepositSDKType[];
}
export declare const QueryParamsRequest: {
    typeUrl: string;
    encode(_: QueryParamsRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryParamsRequest;
    fromJSON(_: any): QueryParamsRequest;
    toJSON(_: QueryParamsRequest): JsonSafe<QueryParamsRequest>;
    fromPartial(_: Partial<QueryParamsRequest>): QueryParamsRequest;
    fromProtoMsg(message: QueryParamsRequestProtoMsg): QueryParamsRequest;
    toProto(message: QueryParamsRequest): Uint8Array;
    toProtoMsg(message: QueryParamsRequest): QueryParamsRequestProtoMsg;
};
export declare const QueryParamsResponse: {
    typeUrl: string;
    encode(message: QueryParamsResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryParamsResponse;
    fromJSON(object: any): QueryParamsResponse;
    toJSON(message: QueryParamsResponse): JsonSafe<QueryParamsResponse>;
    fromPartial(object: Partial<QueryParamsResponse>): QueryParamsResponse;
    fromProtoMsg(message: QueryParamsResponseProtoMsg): QueryParamsResponse;
    toProto(message: QueryParamsResponse): Uint8Array;
    toProtoMsg(message: QueryParamsResponse): QueryParamsResponseProtoMsg;
};
export declare const QueryGetDepositRecordRequest: {
    typeUrl: string;
    encode(message: QueryGetDepositRecordRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryGetDepositRecordRequest;
    fromJSON(object: any): QueryGetDepositRecordRequest;
    toJSON(message: QueryGetDepositRecordRequest): JsonSafe<QueryGetDepositRecordRequest>;
    fromPartial(object: Partial<QueryGetDepositRecordRequest>): QueryGetDepositRecordRequest;
    fromProtoMsg(message: QueryGetDepositRecordRequestProtoMsg): QueryGetDepositRecordRequest;
    toProto(message: QueryGetDepositRecordRequest): Uint8Array;
    toProtoMsg(message: QueryGetDepositRecordRequest): QueryGetDepositRecordRequestProtoMsg;
};
export declare const QueryGetDepositRecordResponse: {
    typeUrl: string;
    encode(message: QueryGetDepositRecordResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryGetDepositRecordResponse;
    fromJSON(object: any): QueryGetDepositRecordResponse;
    toJSON(message: QueryGetDepositRecordResponse): JsonSafe<QueryGetDepositRecordResponse>;
    fromPartial(object: Partial<QueryGetDepositRecordResponse>): QueryGetDepositRecordResponse;
    fromProtoMsg(message: QueryGetDepositRecordResponseProtoMsg): QueryGetDepositRecordResponse;
    toProto(message: QueryGetDepositRecordResponse): Uint8Array;
    toProtoMsg(message: QueryGetDepositRecordResponse): QueryGetDepositRecordResponseProtoMsg;
};
export declare const QueryAllDepositRecordRequest: {
    typeUrl: string;
    encode(message: QueryAllDepositRecordRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryAllDepositRecordRequest;
    fromJSON(object: any): QueryAllDepositRecordRequest;
    toJSON(message: QueryAllDepositRecordRequest): JsonSafe<QueryAllDepositRecordRequest>;
    fromPartial(object: Partial<QueryAllDepositRecordRequest>): QueryAllDepositRecordRequest;
    fromProtoMsg(message: QueryAllDepositRecordRequestProtoMsg): QueryAllDepositRecordRequest;
    toProto(message: QueryAllDepositRecordRequest): Uint8Array;
    toProtoMsg(message: QueryAllDepositRecordRequest): QueryAllDepositRecordRequestProtoMsg;
};
export declare const QueryAllDepositRecordResponse: {
    typeUrl: string;
    encode(message: QueryAllDepositRecordResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryAllDepositRecordResponse;
    fromJSON(object: any): QueryAllDepositRecordResponse;
    toJSON(message: QueryAllDepositRecordResponse): JsonSafe<QueryAllDepositRecordResponse>;
    fromPartial(object: Partial<QueryAllDepositRecordResponse>): QueryAllDepositRecordResponse;
    fromProtoMsg(message: QueryAllDepositRecordResponseProtoMsg): QueryAllDepositRecordResponse;
    toProto(message: QueryAllDepositRecordResponse): Uint8Array;
    toProtoMsg(message: QueryAllDepositRecordResponse): QueryAllDepositRecordResponseProtoMsg;
};
export declare const QueryDepositRecordByHostRequest: {
    typeUrl: string;
    encode(message: QueryDepositRecordByHostRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryDepositRecordByHostRequest;
    fromJSON(object: any): QueryDepositRecordByHostRequest;
    toJSON(message: QueryDepositRecordByHostRequest): JsonSafe<QueryDepositRecordByHostRequest>;
    fromPartial(object: Partial<QueryDepositRecordByHostRequest>): QueryDepositRecordByHostRequest;
    fromProtoMsg(message: QueryDepositRecordByHostRequestProtoMsg): QueryDepositRecordByHostRequest;
    toProto(message: QueryDepositRecordByHostRequest): Uint8Array;
    toProtoMsg(message: QueryDepositRecordByHostRequest): QueryDepositRecordByHostRequestProtoMsg;
};
export declare const QueryDepositRecordByHostResponse: {
    typeUrl: string;
    encode(message: QueryDepositRecordByHostResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryDepositRecordByHostResponse;
    fromJSON(object: any): QueryDepositRecordByHostResponse;
    toJSON(message: QueryDepositRecordByHostResponse): JsonSafe<QueryDepositRecordByHostResponse>;
    fromPartial(object: Partial<QueryDepositRecordByHostResponse>): QueryDepositRecordByHostResponse;
    fromProtoMsg(message: QueryDepositRecordByHostResponseProtoMsg): QueryDepositRecordByHostResponse;
    toProto(message: QueryDepositRecordByHostResponse): Uint8Array;
    toProtoMsg(message: QueryDepositRecordByHostResponse): QueryDepositRecordByHostResponseProtoMsg;
};
export declare const QueryGetUserRedemptionRecordRequest: {
    typeUrl: string;
    encode(message: QueryGetUserRedemptionRecordRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryGetUserRedemptionRecordRequest;
    fromJSON(object: any): QueryGetUserRedemptionRecordRequest;
    toJSON(message: QueryGetUserRedemptionRecordRequest): JsonSafe<QueryGetUserRedemptionRecordRequest>;
    fromPartial(object: Partial<QueryGetUserRedemptionRecordRequest>): QueryGetUserRedemptionRecordRequest;
    fromProtoMsg(message: QueryGetUserRedemptionRecordRequestProtoMsg): QueryGetUserRedemptionRecordRequest;
    toProto(message: QueryGetUserRedemptionRecordRequest): Uint8Array;
    toProtoMsg(message: QueryGetUserRedemptionRecordRequest): QueryGetUserRedemptionRecordRequestProtoMsg;
};
export declare const QueryGetUserRedemptionRecordResponse: {
    typeUrl: string;
    encode(message: QueryGetUserRedemptionRecordResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryGetUserRedemptionRecordResponse;
    fromJSON(object: any): QueryGetUserRedemptionRecordResponse;
    toJSON(message: QueryGetUserRedemptionRecordResponse): JsonSafe<QueryGetUserRedemptionRecordResponse>;
    fromPartial(object: Partial<QueryGetUserRedemptionRecordResponse>): QueryGetUserRedemptionRecordResponse;
    fromProtoMsg(message: QueryGetUserRedemptionRecordResponseProtoMsg): QueryGetUserRedemptionRecordResponse;
    toProto(message: QueryGetUserRedemptionRecordResponse): Uint8Array;
    toProtoMsg(message: QueryGetUserRedemptionRecordResponse): QueryGetUserRedemptionRecordResponseProtoMsg;
};
export declare const QueryAllUserRedemptionRecordRequest: {
    typeUrl: string;
    encode(message: QueryAllUserRedemptionRecordRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryAllUserRedemptionRecordRequest;
    fromJSON(object: any): QueryAllUserRedemptionRecordRequest;
    toJSON(message: QueryAllUserRedemptionRecordRequest): JsonSafe<QueryAllUserRedemptionRecordRequest>;
    fromPartial(object: Partial<QueryAllUserRedemptionRecordRequest>): QueryAllUserRedemptionRecordRequest;
    fromProtoMsg(message: QueryAllUserRedemptionRecordRequestProtoMsg): QueryAllUserRedemptionRecordRequest;
    toProto(message: QueryAllUserRedemptionRecordRequest): Uint8Array;
    toProtoMsg(message: QueryAllUserRedemptionRecordRequest): QueryAllUserRedemptionRecordRequestProtoMsg;
};
export declare const QueryAllUserRedemptionRecordResponse: {
    typeUrl: string;
    encode(message: QueryAllUserRedemptionRecordResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryAllUserRedemptionRecordResponse;
    fromJSON(object: any): QueryAllUserRedemptionRecordResponse;
    toJSON(message: QueryAllUserRedemptionRecordResponse): JsonSafe<QueryAllUserRedemptionRecordResponse>;
    fromPartial(object: Partial<QueryAllUserRedemptionRecordResponse>): QueryAllUserRedemptionRecordResponse;
    fromProtoMsg(message: QueryAllUserRedemptionRecordResponseProtoMsg): QueryAllUserRedemptionRecordResponse;
    toProto(message: QueryAllUserRedemptionRecordResponse): Uint8Array;
    toProtoMsg(message: QueryAllUserRedemptionRecordResponse): QueryAllUserRedemptionRecordResponseProtoMsg;
};
export declare const QueryAllUserRedemptionRecordForUserRequest: {
    typeUrl: string;
    encode(message: QueryAllUserRedemptionRecordForUserRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryAllUserRedemptionRecordForUserRequest;
    fromJSON(object: any): QueryAllUserRedemptionRecordForUserRequest;
    toJSON(message: QueryAllUserRedemptionRecordForUserRequest): JsonSafe<QueryAllUserRedemptionRecordForUserRequest>;
    fromPartial(object: Partial<QueryAllUserRedemptionRecordForUserRequest>): QueryAllUserRedemptionRecordForUserRequest;
    fromProtoMsg(message: QueryAllUserRedemptionRecordForUserRequestProtoMsg): QueryAllUserRedemptionRecordForUserRequest;
    toProto(message: QueryAllUserRedemptionRecordForUserRequest): Uint8Array;
    toProtoMsg(message: QueryAllUserRedemptionRecordForUserRequest): QueryAllUserRedemptionRecordForUserRequestProtoMsg;
};
export declare const QueryAllUserRedemptionRecordForUserResponse: {
    typeUrl: string;
    encode(message: QueryAllUserRedemptionRecordForUserResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryAllUserRedemptionRecordForUserResponse;
    fromJSON(object: any): QueryAllUserRedemptionRecordForUserResponse;
    toJSON(message: QueryAllUserRedemptionRecordForUserResponse): JsonSafe<QueryAllUserRedemptionRecordForUserResponse>;
    fromPartial(object: Partial<QueryAllUserRedemptionRecordForUserResponse>): QueryAllUserRedemptionRecordForUserResponse;
    fromProtoMsg(message: QueryAllUserRedemptionRecordForUserResponseProtoMsg): QueryAllUserRedemptionRecordForUserResponse;
    toProto(message: QueryAllUserRedemptionRecordForUserResponse): Uint8Array;
    toProtoMsg(message: QueryAllUserRedemptionRecordForUserResponse): QueryAllUserRedemptionRecordForUserResponseProtoMsg;
};
export declare const QueryGetEpochUnbondingRecordRequest: {
    typeUrl: string;
    encode(message: QueryGetEpochUnbondingRecordRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryGetEpochUnbondingRecordRequest;
    fromJSON(object: any): QueryGetEpochUnbondingRecordRequest;
    toJSON(message: QueryGetEpochUnbondingRecordRequest): JsonSafe<QueryGetEpochUnbondingRecordRequest>;
    fromPartial(object: Partial<QueryGetEpochUnbondingRecordRequest>): QueryGetEpochUnbondingRecordRequest;
    fromProtoMsg(message: QueryGetEpochUnbondingRecordRequestProtoMsg): QueryGetEpochUnbondingRecordRequest;
    toProto(message: QueryGetEpochUnbondingRecordRequest): Uint8Array;
    toProtoMsg(message: QueryGetEpochUnbondingRecordRequest): QueryGetEpochUnbondingRecordRequestProtoMsg;
};
export declare const QueryGetEpochUnbondingRecordResponse: {
    typeUrl: string;
    encode(message: QueryGetEpochUnbondingRecordResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryGetEpochUnbondingRecordResponse;
    fromJSON(object: any): QueryGetEpochUnbondingRecordResponse;
    toJSON(message: QueryGetEpochUnbondingRecordResponse): JsonSafe<QueryGetEpochUnbondingRecordResponse>;
    fromPartial(object: Partial<QueryGetEpochUnbondingRecordResponse>): QueryGetEpochUnbondingRecordResponse;
    fromProtoMsg(message: QueryGetEpochUnbondingRecordResponseProtoMsg): QueryGetEpochUnbondingRecordResponse;
    toProto(message: QueryGetEpochUnbondingRecordResponse): Uint8Array;
    toProtoMsg(message: QueryGetEpochUnbondingRecordResponse): QueryGetEpochUnbondingRecordResponseProtoMsg;
};
export declare const QueryAllEpochUnbondingRecordRequest: {
    typeUrl: string;
    encode(message: QueryAllEpochUnbondingRecordRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryAllEpochUnbondingRecordRequest;
    fromJSON(object: any): QueryAllEpochUnbondingRecordRequest;
    toJSON(message: QueryAllEpochUnbondingRecordRequest): JsonSafe<QueryAllEpochUnbondingRecordRequest>;
    fromPartial(object: Partial<QueryAllEpochUnbondingRecordRequest>): QueryAllEpochUnbondingRecordRequest;
    fromProtoMsg(message: QueryAllEpochUnbondingRecordRequestProtoMsg): QueryAllEpochUnbondingRecordRequest;
    toProto(message: QueryAllEpochUnbondingRecordRequest): Uint8Array;
    toProtoMsg(message: QueryAllEpochUnbondingRecordRequest): QueryAllEpochUnbondingRecordRequestProtoMsg;
};
export declare const QueryAllEpochUnbondingRecordResponse: {
    typeUrl: string;
    encode(message: QueryAllEpochUnbondingRecordResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryAllEpochUnbondingRecordResponse;
    fromJSON(object: any): QueryAllEpochUnbondingRecordResponse;
    toJSON(message: QueryAllEpochUnbondingRecordResponse): JsonSafe<QueryAllEpochUnbondingRecordResponse>;
    fromPartial(object: Partial<QueryAllEpochUnbondingRecordResponse>): QueryAllEpochUnbondingRecordResponse;
    fromProtoMsg(message: QueryAllEpochUnbondingRecordResponseProtoMsg): QueryAllEpochUnbondingRecordResponse;
    toProto(message: QueryAllEpochUnbondingRecordResponse): Uint8Array;
    toProtoMsg(message: QueryAllEpochUnbondingRecordResponse): QueryAllEpochUnbondingRecordResponseProtoMsg;
};
export declare const QueryLSMDepositRequest: {
    typeUrl: string;
    encode(message: QueryLSMDepositRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryLSMDepositRequest;
    fromJSON(object: any): QueryLSMDepositRequest;
    toJSON(message: QueryLSMDepositRequest): JsonSafe<QueryLSMDepositRequest>;
    fromPartial(object: Partial<QueryLSMDepositRequest>): QueryLSMDepositRequest;
    fromProtoMsg(message: QueryLSMDepositRequestProtoMsg): QueryLSMDepositRequest;
    toProto(message: QueryLSMDepositRequest): Uint8Array;
    toProtoMsg(message: QueryLSMDepositRequest): QueryLSMDepositRequestProtoMsg;
};
export declare const QueryLSMDepositResponse: {
    typeUrl: string;
    encode(message: QueryLSMDepositResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryLSMDepositResponse;
    fromJSON(object: any): QueryLSMDepositResponse;
    toJSON(message: QueryLSMDepositResponse): JsonSafe<QueryLSMDepositResponse>;
    fromPartial(object: Partial<QueryLSMDepositResponse>): QueryLSMDepositResponse;
    fromProtoMsg(message: QueryLSMDepositResponseProtoMsg): QueryLSMDepositResponse;
    toProto(message: QueryLSMDepositResponse): Uint8Array;
    toProtoMsg(message: QueryLSMDepositResponse): QueryLSMDepositResponseProtoMsg;
};
export declare const QueryLSMDepositsRequest: {
    typeUrl: string;
    encode(message: QueryLSMDepositsRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryLSMDepositsRequest;
    fromJSON(object: any): QueryLSMDepositsRequest;
    toJSON(message: QueryLSMDepositsRequest): JsonSafe<QueryLSMDepositsRequest>;
    fromPartial(object: Partial<QueryLSMDepositsRequest>): QueryLSMDepositsRequest;
    fromProtoMsg(message: QueryLSMDepositsRequestProtoMsg): QueryLSMDepositsRequest;
    toProto(message: QueryLSMDepositsRequest): Uint8Array;
    toProtoMsg(message: QueryLSMDepositsRequest): QueryLSMDepositsRequestProtoMsg;
};
export declare const QueryLSMDepositsResponse: {
    typeUrl: string;
    encode(message: QueryLSMDepositsResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryLSMDepositsResponse;
    fromJSON(object: any): QueryLSMDepositsResponse;
    toJSON(message: QueryLSMDepositsResponse): JsonSafe<QueryLSMDepositsResponse>;
    fromPartial(object: Partial<QueryLSMDepositsResponse>): QueryLSMDepositsResponse;
    fromProtoMsg(message: QueryLSMDepositsResponseProtoMsg): QueryLSMDepositsResponse;
    toProto(message: QueryLSMDepositsResponse): Uint8Array;
    toProtoMsg(message: QueryLSMDepositsResponse): QueryLSMDepositsResponseProtoMsg;
};
