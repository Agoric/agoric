import { Action, ClaimRecord, type ClaimRecordSDKType } from './claim.js';
import { Timestamp, type TimestampSDKType } from '../../google/protobuf/timestamp.js';
import { Coin, type CoinSDKType } from '../../cosmos/base/v1beta1/coin.js';
import { Params, type ParamsSDKType } from './params.js';
import { Period, type PeriodSDKType } from '../vesting/vesting.js';
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { type JsonSafe } from '../../json-safe.js';
export interface ClaimStatus {
    airdropIdentifier: string;
    claimed: boolean;
}
export interface ClaimStatusProtoMsg {
    typeUrl: '/stride.claim.ClaimStatus';
    value: Uint8Array;
}
export interface ClaimStatusSDKType {
    airdrop_identifier: string;
    claimed: boolean;
}
export interface QueryClaimStatusRequest {
    address: string;
}
export interface QueryClaimStatusRequestProtoMsg {
    typeUrl: '/stride.claim.QueryClaimStatusRequest';
    value: Uint8Array;
}
export interface QueryClaimStatusRequestSDKType {
    address: string;
}
export interface QueryClaimStatusResponse {
    claimStatus: ClaimStatus[];
}
export interface QueryClaimStatusResponseProtoMsg {
    typeUrl: '/stride.claim.QueryClaimStatusResponse';
    value: Uint8Array;
}
export interface QueryClaimStatusResponseSDKType {
    claim_status: ClaimStatusSDKType[];
}
export interface ClaimMetadata {
    airdropIdentifier: string;
    currentRound: string;
    currentRoundStart: Timestamp;
    currentRoundEnd: Timestamp;
}
export interface ClaimMetadataProtoMsg {
    typeUrl: '/stride.claim.ClaimMetadata';
    value: Uint8Array;
}
export interface ClaimMetadataSDKType {
    airdrop_identifier: string;
    current_round: string;
    current_round_start: TimestampSDKType;
    current_round_end: TimestampSDKType;
}
export interface QueryClaimMetadataRequest {
}
export interface QueryClaimMetadataRequestProtoMsg {
    typeUrl: '/stride.claim.QueryClaimMetadataRequest';
    value: Uint8Array;
}
export interface QueryClaimMetadataRequestSDKType {
}
export interface QueryClaimMetadataResponse {
    claimMetadata: ClaimMetadata[];
}
export interface QueryClaimMetadataResponseProtoMsg {
    typeUrl: '/stride.claim.QueryClaimMetadataResponse';
    value: Uint8Array;
}
export interface QueryClaimMetadataResponseSDKType {
    claim_metadata: ClaimMetadataSDKType[];
}
/** QueryParamsRequest is the request type for the Query/Params RPC method. */
export interface QueryDistributorAccountBalanceRequest {
    airdropIdentifier: string;
}
export interface QueryDistributorAccountBalanceRequestProtoMsg {
    typeUrl: '/stride.claim.QueryDistributorAccountBalanceRequest';
    value: Uint8Array;
}
/** QueryParamsRequest is the request type for the Query/Params RPC method. */
export interface QueryDistributorAccountBalanceRequestSDKType {
    airdrop_identifier: string;
}
/** QueryParamsResponse is the response type for the Query/Params RPC method. */
export interface QueryDistributorAccountBalanceResponse {
    /** params defines the parameters of the module. */
    distributorAccountBalance: Coin[];
}
export interface QueryDistributorAccountBalanceResponseProtoMsg {
    typeUrl: '/stride.claim.QueryDistributorAccountBalanceResponse';
    value: Uint8Array;
}
/** QueryParamsResponse is the response type for the Query/Params RPC method. */
export interface QueryDistributorAccountBalanceResponseSDKType {
    distributor_account_balance: CoinSDKType[];
}
/** QueryParamsRequest is the request type for the Query/Params RPC method. */
export interface QueryParamsRequest {
}
export interface QueryParamsRequestProtoMsg {
    typeUrl: '/stride.claim.QueryParamsRequest';
    value: Uint8Array;
}
/** QueryParamsRequest is the request type for the Query/Params RPC method. */
export interface QueryParamsRequestSDKType {
}
/** QueryParamsResponse is the response type for the Query/Params RPC method. */
export interface QueryParamsResponse {
    /** params defines the parameters of the module. */
    params: Params;
}
export interface QueryParamsResponseProtoMsg {
    typeUrl: '/stride.claim.QueryParamsResponse';
    value: Uint8Array;
}
/** QueryParamsResponse is the response type for the Query/Params RPC method. */
export interface QueryParamsResponseSDKType {
    params: ParamsSDKType;
}
export interface QueryClaimRecordRequest {
    airdropIdentifier: string;
    address: string;
}
export interface QueryClaimRecordRequestProtoMsg {
    typeUrl: '/stride.claim.QueryClaimRecordRequest';
    value: Uint8Array;
}
export interface QueryClaimRecordRequestSDKType {
    airdrop_identifier: string;
    address: string;
}
export interface QueryClaimRecordResponse {
    claimRecord: ClaimRecord;
}
export interface QueryClaimRecordResponseProtoMsg {
    typeUrl: '/stride.claim.QueryClaimRecordResponse';
    value: Uint8Array;
}
export interface QueryClaimRecordResponseSDKType {
    claim_record: ClaimRecordSDKType;
}
export interface QueryClaimableForActionRequest {
    airdropIdentifier: string;
    address: string;
    action: Action;
}
export interface QueryClaimableForActionRequestProtoMsg {
    typeUrl: '/stride.claim.QueryClaimableForActionRequest';
    value: Uint8Array;
}
export interface QueryClaimableForActionRequestSDKType {
    airdrop_identifier: string;
    address: string;
    action: Action;
}
export interface QueryClaimableForActionResponse {
    coins: Coin[];
}
export interface QueryClaimableForActionResponseProtoMsg {
    typeUrl: '/stride.claim.QueryClaimableForActionResponse';
    value: Uint8Array;
}
export interface QueryClaimableForActionResponseSDKType {
    coins: CoinSDKType[];
}
export interface QueryTotalClaimableRequest {
    airdropIdentifier: string;
    address: string;
    includeClaimed: boolean;
}
export interface QueryTotalClaimableRequestProtoMsg {
    typeUrl: '/stride.claim.QueryTotalClaimableRequest';
    value: Uint8Array;
}
export interface QueryTotalClaimableRequestSDKType {
    airdrop_identifier: string;
    address: string;
    include_claimed: boolean;
}
export interface QueryTotalClaimableResponse {
    coins: Coin[];
}
export interface QueryTotalClaimableResponseProtoMsg {
    typeUrl: '/stride.claim.QueryTotalClaimableResponse';
    value: Uint8Array;
}
export interface QueryTotalClaimableResponseSDKType {
    coins: CoinSDKType[];
}
export interface QueryUserVestingsRequest {
    address: string;
}
export interface QueryUserVestingsRequestProtoMsg {
    typeUrl: '/stride.claim.QueryUserVestingsRequest';
    value: Uint8Array;
}
export interface QueryUserVestingsRequestSDKType {
    address: string;
}
export interface QueryUserVestingsResponse {
    spendableCoins: Coin[];
    periods: Period[];
}
export interface QueryUserVestingsResponseProtoMsg {
    typeUrl: '/stride.claim.QueryUserVestingsResponse';
    value: Uint8Array;
}
export interface QueryUserVestingsResponseSDKType {
    spendable_coins: CoinSDKType[];
    periods: PeriodSDKType[];
}
export declare const ClaimStatus: {
    typeUrl: string;
    encode(message: ClaimStatus, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): ClaimStatus;
    fromJSON(object: any): ClaimStatus;
    toJSON(message: ClaimStatus): JsonSafe<ClaimStatus>;
    fromPartial(object: Partial<ClaimStatus>): ClaimStatus;
    fromProtoMsg(message: ClaimStatusProtoMsg): ClaimStatus;
    toProto(message: ClaimStatus): Uint8Array;
    toProtoMsg(message: ClaimStatus): ClaimStatusProtoMsg;
};
export declare const QueryClaimStatusRequest: {
    typeUrl: string;
    encode(message: QueryClaimStatusRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryClaimStatusRequest;
    fromJSON(object: any): QueryClaimStatusRequest;
    toJSON(message: QueryClaimStatusRequest): JsonSafe<QueryClaimStatusRequest>;
    fromPartial(object: Partial<QueryClaimStatusRequest>): QueryClaimStatusRequest;
    fromProtoMsg(message: QueryClaimStatusRequestProtoMsg): QueryClaimStatusRequest;
    toProto(message: QueryClaimStatusRequest): Uint8Array;
    toProtoMsg(message: QueryClaimStatusRequest): QueryClaimStatusRequestProtoMsg;
};
export declare const QueryClaimStatusResponse: {
    typeUrl: string;
    encode(message: QueryClaimStatusResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryClaimStatusResponse;
    fromJSON(object: any): QueryClaimStatusResponse;
    toJSON(message: QueryClaimStatusResponse): JsonSafe<QueryClaimStatusResponse>;
    fromPartial(object: Partial<QueryClaimStatusResponse>): QueryClaimStatusResponse;
    fromProtoMsg(message: QueryClaimStatusResponseProtoMsg): QueryClaimStatusResponse;
    toProto(message: QueryClaimStatusResponse): Uint8Array;
    toProtoMsg(message: QueryClaimStatusResponse): QueryClaimStatusResponseProtoMsg;
};
export declare const ClaimMetadata: {
    typeUrl: string;
    encode(message: ClaimMetadata, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): ClaimMetadata;
    fromJSON(object: any): ClaimMetadata;
    toJSON(message: ClaimMetadata): JsonSafe<ClaimMetadata>;
    fromPartial(object: Partial<ClaimMetadata>): ClaimMetadata;
    fromProtoMsg(message: ClaimMetadataProtoMsg): ClaimMetadata;
    toProto(message: ClaimMetadata): Uint8Array;
    toProtoMsg(message: ClaimMetadata): ClaimMetadataProtoMsg;
};
export declare const QueryClaimMetadataRequest: {
    typeUrl: string;
    encode(_: QueryClaimMetadataRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryClaimMetadataRequest;
    fromJSON(_: any): QueryClaimMetadataRequest;
    toJSON(_: QueryClaimMetadataRequest): JsonSafe<QueryClaimMetadataRequest>;
    fromPartial(_: Partial<QueryClaimMetadataRequest>): QueryClaimMetadataRequest;
    fromProtoMsg(message: QueryClaimMetadataRequestProtoMsg): QueryClaimMetadataRequest;
    toProto(message: QueryClaimMetadataRequest): Uint8Array;
    toProtoMsg(message: QueryClaimMetadataRequest): QueryClaimMetadataRequestProtoMsg;
};
export declare const QueryClaimMetadataResponse: {
    typeUrl: string;
    encode(message: QueryClaimMetadataResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryClaimMetadataResponse;
    fromJSON(object: any): QueryClaimMetadataResponse;
    toJSON(message: QueryClaimMetadataResponse): JsonSafe<QueryClaimMetadataResponse>;
    fromPartial(object: Partial<QueryClaimMetadataResponse>): QueryClaimMetadataResponse;
    fromProtoMsg(message: QueryClaimMetadataResponseProtoMsg): QueryClaimMetadataResponse;
    toProto(message: QueryClaimMetadataResponse): Uint8Array;
    toProtoMsg(message: QueryClaimMetadataResponse): QueryClaimMetadataResponseProtoMsg;
};
export declare const QueryDistributorAccountBalanceRequest: {
    typeUrl: string;
    encode(message: QueryDistributorAccountBalanceRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryDistributorAccountBalanceRequest;
    fromJSON(object: any): QueryDistributorAccountBalanceRequest;
    toJSON(message: QueryDistributorAccountBalanceRequest): JsonSafe<QueryDistributorAccountBalanceRequest>;
    fromPartial(object: Partial<QueryDistributorAccountBalanceRequest>): QueryDistributorAccountBalanceRequest;
    fromProtoMsg(message: QueryDistributorAccountBalanceRequestProtoMsg): QueryDistributorAccountBalanceRequest;
    toProto(message: QueryDistributorAccountBalanceRequest): Uint8Array;
    toProtoMsg(message: QueryDistributorAccountBalanceRequest): QueryDistributorAccountBalanceRequestProtoMsg;
};
export declare const QueryDistributorAccountBalanceResponse: {
    typeUrl: string;
    encode(message: QueryDistributorAccountBalanceResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryDistributorAccountBalanceResponse;
    fromJSON(object: any): QueryDistributorAccountBalanceResponse;
    toJSON(message: QueryDistributorAccountBalanceResponse): JsonSafe<QueryDistributorAccountBalanceResponse>;
    fromPartial(object: Partial<QueryDistributorAccountBalanceResponse>): QueryDistributorAccountBalanceResponse;
    fromProtoMsg(message: QueryDistributorAccountBalanceResponseProtoMsg): QueryDistributorAccountBalanceResponse;
    toProto(message: QueryDistributorAccountBalanceResponse): Uint8Array;
    toProtoMsg(message: QueryDistributorAccountBalanceResponse): QueryDistributorAccountBalanceResponseProtoMsg;
};
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
export declare const QueryClaimRecordRequest: {
    typeUrl: string;
    encode(message: QueryClaimRecordRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryClaimRecordRequest;
    fromJSON(object: any): QueryClaimRecordRequest;
    toJSON(message: QueryClaimRecordRequest): JsonSafe<QueryClaimRecordRequest>;
    fromPartial(object: Partial<QueryClaimRecordRequest>): QueryClaimRecordRequest;
    fromProtoMsg(message: QueryClaimRecordRequestProtoMsg): QueryClaimRecordRequest;
    toProto(message: QueryClaimRecordRequest): Uint8Array;
    toProtoMsg(message: QueryClaimRecordRequest): QueryClaimRecordRequestProtoMsg;
};
export declare const QueryClaimRecordResponse: {
    typeUrl: string;
    encode(message: QueryClaimRecordResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryClaimRecordResponse;
    fromJSON(object: any): QueryClaimRecordResponse;
    toJSON(message: QueryClaimRecordResponse): JsonSafe<QueryClaimRecordResponse>;
    fromPartial(object: Partial<QueryClaimRecordResponse>): QueryClaimRecordResponse;
    fromProtoMsg(message: QueryClaimRecordResponseProtoMsg): QueryClaimRecordResponse;
    toProto(message: QueryClaimRecordResponse): Uint8Array;
    toProtoMsg(message: QueryClaimRecordResponse): QueryClaimRecordResponseProtoMsg;
};
export declare const QueryClaimableForActionRequest: {
    typeUrl: string;
    encode(message: QueryClaimableForActionRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryClaimableForActionRequest;
    fromJSON(object: any): QueryClaimableForActionRequest;
    toJSON(message: QueryClaimableForActionRequest): JsonSafe<QueryClaimableForActionRequest>;
    fromPartial(object: Partial<QueryClaimableForActionRequest>): QueryClaimableForActionRequest;
    fromProtoMsg(message: QueryClaimableForActionRequestProtoMsg): QueryClaimableForActionRequest;
    toProto(message: QueryClaimableForActionRequest): Uint8Array;
    toProtoMsg(message: QueryClaimableForActionRequest): QueryClaimableForActionRequestProtoMsg;
};
export declare const QueryClaimableForActionResponse: {
    typeUrl: string;
    encode(message: QueryClaimableForActionResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryClaimableForActionResponse;
    fromJSON(object: any): QueryClaimableForActionResponse;
    toJSON(message: QueryClaimableForActionResponse): JsonSafe<QueryClaimableForActionResponse>;
    fromPartial(object: Partial<QueryClaimableForActionResponse>): QueryClaimableForActionResponse;
    fromProtoMsg(message: QueryClaimableForActionResponseProtoMsg): QueryClaimableForActionResponse;
    toProto(message: QueryClaimableForActionResponse): Uint8Array;
    toProtoMsg(message: QueryClaimableForActionResponse): QueryClaimableForActionResponseProtoMsg;
};
export declare const QueryTotalClaimableRequest: {
    typeUrl: string;
    encode(message: QueryTotalClaimableRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryTotalClaimableRequest;
    fromJSON(object: any): QueryTotalClaimableRequest;
    toJSON(message: QueryTotalClaimableRequest): JsonSafe<QueryTotalClaimableRequest>;
    fromPartial(object: Partial<QueryTotalClaimableRequest>): QueryTotalClaimableRequest;
    fromProtoMsg(message: QueryTotalClaimableRequestProtoMsg): QueryTotalClaimableRequest;
    toProto(message: QueryTotalClaimableRequest): Uint8Array;
    toProtoMsg(message: QueryTotalClaimableRequest): QueryTotalClaimableRequestProtoMsg;
};
export declare const QueryTotalClaimableResponse: {
    typeUrl: string;
    encode(message: QueryTotalClaimableResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryTotalClaimableResponse;
    fromJSON(object: any): QueryTotalClaimableResponse;
    toJSON(message: QueryTotalClaimableResponse): JsonSafe<QueryTotalClaimableResponse>;
    fromPartial(object: Partial<QueryTotalClaimableResponse>): QueryTotalClaimableResponse;
    fromProtoMsg(message: QueryTotalClaimableResponseProtoMsg): QueryTotalClaimableResponse;
    toProto(message: QueryTotalClaimableResponse): Uint8Array;
    toProtoMsg(message: QueryTotalClaimableResponse): QueryTotalClaimableResponseProtoMsg;
};
export declare const QueryUserVestingsRequest: {
    typeUrl: string;
    encode(message: QueryUserVestingsRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryUserVestingsRequest;
    fromJSON(object: any): QueryUserVestingsRequest;
    toJSON(message: QueryUserVestingsRequest): JsonSafe<QueryUserVestingsRequest>;
    fromPartial(object: Partial<QueryUserVestingsRequest>): QueryUserVestingsRequest;
    fromProtoMsg(message: QueryUserVestingsRequestProtoMsg): QueryUserVestingsRequest;
    toProto(message: QueryUserVestingsRequest): Uint8Array;
    toProtoMsg(message: QueryUserVestingsRequest): QueryUserVestingsRequestProtoMsg;
};
export declare const QueryUserVestingsResponse: {
    typeUrl: string;
    encode(message: QueryUserVestingsResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryUserVestingsResponse;
    fromJSON(object: any): QueryUserVestingsResponse;
    toJSON(message: QueryUserVestingsResponse): JsonSafe<QueryUserVestingsResponse>;
    fromPartial(object: Partial<QueryUserVestingsResponse>): QueryUserVestingsResponse;
    fromProtoMsg(message: QueryUserVestingsResponseProtoMsg): QueryUserVestingsResponse;
    toProto(message: QueryUserVestingsResponse): Uint8Array;
    toProtoMsg(message: QueryUserVestingsResponse): QueryUserVestingsResponseProtoMsg;
};
