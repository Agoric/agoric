import { PageRequest, type PageRequestSDKType, PageResponse, type PageResponseSDKType } from '../../base/query/v1beta1/pagination.js';
import { Params, type ParamsSDKType, ValidatorOutstandingRewards, type ValidatorOutstandingRewardsSDKType, ValidatorAccumulatedCommission, type ValidatorAccumulatedCommissionSDKType, ValidatorSlashEvent, type ValidatorSlashEventSDKType, DelegationDelegatorReward, type DelegationDelegatorRewardSDKType } from './distribution.js';
import { DecCoin, type DecCoinSDKType } from '../../base/v1beta1/coin.js';
import { BinaryReader, BinaryWriter } from '../../../binary.js';
import { type JsonSafe } from '../../../json-safe.js';
/** QueryParamsRequest is the request type for the Query/Params RPC method. */
export interface QueryParamsRequest {
}
export interface QueryParamsRequestProtoMsg {
    typeUrl: '/cosmos.distribution.v1beta1.QueryParamsRequest';
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
    typeUrl: '/cosmos.distribution.v1beta1.QueryParamsResponse';
    value: Uint8Array;
}
/** QueryParamsResponse is the response type for the Query/Params RPC method. */
export interface QueryParamsResponseSDKType {
    params: ParamsSDKType;
}
/**
 * QueryValidatorOutstandingRewardsRequest is the request type for the
 * Query/ValidatorOutstandingRewards RPC method.
 */
export interface QueryValidatorOutstandingRewardsRequest {
    /** validator_address defines the validator address to query for. */
    validatorAddress: string;
}
export interface QueryValidatorOutstandingRewardsRequestProtoMsg {
    typeUrl: '/cosmos.distribution.v1beta1.QueryValidatorOutstandingRewardsRequest';
    value: Uint8Array;
}
/**
 * QueryValidatorOutstandingRewardsRequest is the request type for the
 * Query/ValidatorOutstandingRewards RPC method.
 */
export interface QueryValidatorOutstandingRewardsRequestSDKType {
    validator_address: string;
}
/**
 * QueryValidatorOutstandingRewardsResponse is the response type for the
 * Query/ValidatorOutstandingRewards RPC method.
 */
export interface QueryValidatorOutstandingRewardsResponse {
    rewards: ValidatorOutstandingRewards;
}
export interface QueryValidatorOutstandingRewardsResponseProtoMsg {
    typeUrl: '/cosmos.distribution.v1beta1.QueryValidatorOutstandingRewardsResponse';
    value: Uint8Array;
}
/**
 * QueryValidatorOutstandingRewardsResponse is the response type for the
 * Query/ValidatorOutstandingRewards RPC method.
 */
export interface QueryValidatorOutstandingRewardsResponseSDKType {
    rewards: ValidatorOutstandingRewardsSDKType;
}
/**
 * QueryValidatorCommissionRequest is the request type for the
 * Query/ValidatorCommission RPC method
 */
export interface QueryValidatorCommissionRequest {
    /** validator_address defines the validator address to query for. */
    validatorAddress: string;
}
export interface QueryValidatorCommissionRequestProtoMsg {
    typeUrl: '/cosmos.distribution.v1beta1.QueryValidatorCommissionRequest';
    value: Uint8Array;
}
/**
 * QueryValidatorCommissionRequest is the request type for the
 * Query/ValidatorCommission RPC method
 */
export interface QueryValidatorCommissionRequestSDKType {
    validator_address: string;
}
/**
 * QueryValidatorCommissionResponse is the response type for the
 * Query/ValidatorCommission RPC method
 */
export interface QueryValidatorCommissionResponse {
    /** commission defines the commision the validator received. */
    commission: ValidatorAccumulatedCommission;
}
export interface QueryValidatorCommissionResponseProtoMsg {
    typeUrl: '/cosmos.distribution.v1beta1.QueryValidatorCommissionResponse';
    value: Uint8Array;
}
/**
 * QueryValidatorCommissionResponse is the response type for the
 * Query/ValidatorCommission RPC method
 */
export interface QueryValidatorCommissionResponseSDKType {
    commission: ValidatorAccumulatedCommissionSDKType;
}
/**
 * QueryValidatorSlashesRequest is the request type for the
 * Query/ValidatorSlashes RPC method
 */
export interface QueryValidatorSlashesRequest {
    /** validator_address defines the validator address to query for. */
    validatorAddress: string;
    /** starting_height defines the optional starting height to query the slashes. */
    startingHeight: bigint;
    /** starting_height defines the optional ending height to query the slashes. */
    endingHeight: bigint;
    /** pagination defines an optional pagination for the request. */
    pagination?: PageRequest;
}
export interface QueryValidatorSlashesRequestProtoMsg {
    typeUrl: '/cosmos.distribution.v1beta1.QueryValidatorSlashesRequest';
    value: Uint8Array;
}
/**
 * QueryValidatorSlashesRequest is the request type for the
 * Query/ValidatorSlashes RPC method
 */
export interface QueryValidatorSlashesRequestSDKType {
    validator_address: string;
    starting_height: bigint;
    ending_height: bigint;
    pagination?: PageRequestSDKType;
}
/**
 * QueryValidatorSlashesResponse is the response type for the
 * Query/ValidatorSlashes RPC method.
 */
export interface QueryValidatorSlashesResponse {
    /** slashes defines the slashes the validator received. */
    slashes: ValidatorSlashEvent[];
    /** pagination defines the pagination in the response. */
    pagination?: PageResponse;
}
export interface QueryValidatorSlashesResponseProtoMsg {
    typeUrl: '/cosmos.distribution.v1beta1.QueryValidatorSlashesResponse';
    value: Uint8Array;
}
/**
 * QueryValidatorSlashesResponse is the response type for the
 * Query/ValidatorSlashes RPC method.
 */
export interface QueryValidatorSlashesResponseSDKType {
    slashes: ValidatorSlashEventSDKType[];
    pagination?: PageResponseSDKType;
}
/**
 * QueryDelegationRewardsRequest is the request type for the
 * Query/DelegationRewards RPC method.
 */
export interface QueryDelegationRewardsRequest {
    /** delegator_address defines the delegator address to query for. */
    delegatorAddress: string;
    /** validator_address defines the validator address to query for. */
    validatorAddress: string;
}
export interface QueryDelegationRewardsRequestProtoMsg {
    typeUrl: '/cosmos.distribution.v1beta1.QueryDelegationRewardsRequest';
    value: Uint8Array;
}
/**
 * QueryDelegationRewardsRequest is the request type for the
 * Query/DelegationRewards RPC method.
 */
export interface QueryDelegationRewardsRequestSDKType {
    delegator_address: string;
    validator_address: string;
}
/**
 * QueryDelegationRewardsResponse is the response type for the
 * Query/DelegationRewards RPC method.
 */
export interface QueryDelegationRewardsResponse {
    /** rewards defines the rewards accrued by a delegation. */
    rewards: DecCoin[];
}
export interface QueryDelegationRewardsResponseProtoMsg {
    typeUrl: '/cosmos.distribution.v1beta1.QueryDelegationRewardsResponse';
    value: Uint8Array;
}
/**
 * QueryDelegationRewardsResponse is the response type for the
 * Query/DelegationRewards RPC method.
 */
export interface QueryDelegationRewardsResponseSDKType {
    rewards: DecCoinSDKType[];
}
/**
 * QueryDelegationTotalRewardsRequest is the request type for the
 * Query/DelegationTotalRewards RPC method.
 */
export interface QueryDelegationTotalRewardsRequest {
    /** delegator_address defines the delegator address to query for. */
    delegatorAddress: string;
}
export interface QueryDelegationTotalRewardsRequestProtoMsg {
    typeUrl: '/cosmos.distribution.v1beta1.QueryDelegationTotalRewardsRequest';
    value: Uint8Array;
}
/**
 * QueryDelegationTotalRewardsRequest is the request type for the
 * Query/DelegationTotalRewards RPC method.
 */
export interface QueryDelegationTotalRewardsRequestSDKType {
    delegator_address: string;
}
/**
 * QueryDelegationTotalRewardsResponse is the response type for the
 * Query/DelegationTotalRewards RPC method.
 */
export interface QueryDelegationTotalRewardsResponse {
    /** rewards defines all the rewards accrued by a delegator. */
    rewards: DelegationDelegatorReward[];
    /** total defines the sum of all the rewards. */
    total: DecCoin[];
}
export interface QueryDelegationTotalRewardsResponseProtoMsg {
    typeUrl: '/cosmos.distribution.v1beta1.QueryDelegationTotalRewardsResponse';
    value: Uint8Array;
}
/**
 * QueryDelegationTotalRewardsResponse is the response type for the
 * Query/DelegationTotalRewards RPC method.
 */
export interface QueryDelegationTotalRewardsResponseSDKType {
    rewards: DelegationDelegatorRewardSDKType[];
    total: DecCoinSDKType[];
}
/**
 * QueryDelegatorValidatorsRequest is the request type for the
 * Query/DelegatorValidators RPC method.
 */
export interface QueryDelegatorValidatorsRequest {
    /** delegator_address defines the delegator address to query for. */
    delegatorAddress: string;
}
export interface QueryDelegatorValidatorsRequestProtoMsg {
    typeUrl: '/cosmos.distribution.v1beta1.QueryDelegatorValidatorsRequest';
    value: Uint8Array;
}
/**
 * QueryDelegatorValidatorsRequest is the request type for the
 * Query/DelegatorValidators RPC method.
 */
export interface QueryDelegatorValidatorsRequestSDKType {
    delegator_address: string;
}
/**
 * QueryDelegatorValidatorsResponse is the response type for the
 * Query/DelegatorValidators RPC method.
 */
export interface QueryDelegatorValidatorsResponse {
    /** validators defines the validators a delegator is delegating for. */
    validators: string[];
}
export interface QueryDelegatorValidatorsResponseProtoMsg {
    typeUrl: '/cosmos.distribution.v1beta1.QueryDelegatorValidatorsResponse';
    value: Uint8Array;
}
/**
 * QueryDelegatorValidatorsResponse is the response type for the
 * Query/DelegatorValidators RPC method.
 */
export interface QueryDelegatorValidatorsResponseSDKType {
    validators: string[];
}
/**
 * QueryDelegatorWithdrawAddressRequest is the request type for the
 * Query/DelegatorWithdrawAddress RPC method.
 */
export interface QueryDelegatorWithdrawAddressRequest {
    /** delegator_address defines the delegator address to query for. */
    delegatorAddress: string;
}
export interface QueryDelegatorWithdrawAddressRequestProtoMsg {
    typeUrl: '/cosmos.distribution.v1beta1.QueryDelegatorWithdrawAddressRequest';
    value: Uint8Array;
}
/**
 * QueryDelegatorWithdrawAddressRequest is the request type for the
 * Query/DelegatorWithdrawAddress RPC method.
 */
export interface QueryDelegatorWithdrawAddressRequestSDKType {
    delegator_address: string;
}
/**
 * QueryDelegatorWithdrawAddressResponse is the response type for the
 * Query/DelegatorWithdrawAddress RPC method.
 */
export interface QueryDelegatorWithdrawAddressResponse {
    /** withdraw_address defines the delegator address to query for. */
    withdrawAddress: string;
}
export interface QueryDelegatorWithdrawAddressResponseProtoMsg {
    typeUrl: '/cosmos.distribution.v1beta1.QueryDelegatorWithdrawAddressResponse';
    value: Uint8Array;
}
/**
 * QueryDelegatorWithdrawAddressResponse is the response type for the
 * Query/DelegatorWithdrawAddress RPC method.
 */
export interface QueryDelegatorWithdrawAddressResponseSDKType {
    withdraw_address: string;
}
/**
 * QueryCommunityPoolRequest is the request type for the Query/CommunityPool RPC
 * method.
 */
export interface QueryCommunityPoolRequest {
}
export interface QueryCommunityPoolRequestProtoMsg {
    typeUrl: '/cosmos.distribution.v1beta1.QueryCommunityPoolRequest';
    value: Uint8Array;
}
/**
 * QueryCommunityPoolRequest is the request type for the Query/CommunityPool RPC
 * method.
 */
export interface QueryCommunityPoolRequestSDKType {
}
/**
 * QueryCommunityPoolResponse is the response type for the Query/CommunityPool
 * RPC method.
 */
export interface QueryCommunityPoolResponse {
    /** pool defines community pool's coins. */
    pool: DecCoin[];
}
export interface QueryCommunityPoolResponseProtoMsg {
    typeUrl: '/cosmos.distribution.v1beta1.QueryCommunityPoolResponse';
    value: Uint8Array;
}
/**
 * QueryCommunityPoolResponse is the response type for the Query/CommunityPool
 * RPC method.
 */
export interface QueryCommunityPoolResponseSDKType {
    pool: DecCoinSDKType[];
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
export declare const QueryValidatorOutstandingRewardsRequest: {
    typeUrl: string;
    encode(message: QueryValidatorOutstandingRewardsRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryValidatorOutstandingRewardsRequest;
    fromJSON(object: any): QueryValidatorOutstandingRewardsRequest;
    toJSON(message: QueryValidatorOutstandingRewardsRequest): JsonSafe<QueryValidatorOutstandingRewardsRequest>;
    fromPartial(object: Partial<QueryValidatorOutstandingRewardsRequest>): QueryValidatorOutstandingRewardsRequest;
    fromProtoMsg(message: QueryValidatorOutstandingRewardsRequestProtoMsg): QueryValidatorOutstandingRewardsRequest;
    toProto(message: QueryValidatorOutstandingRewardsRequest): Uint8Array;
    toProtoMsg(message: QueryValidatorOutstandingRewardsRequest): QueryValidatorOutstandingRewardsRequestProtoMsg;
};
export declare const QueryValidatorOutstandingRewardsResponse: {
    typeUrl: string;
    encode(message: QueryValidatorOutstandingRewardsResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryValidatorOutstandingRewardsResponse;
    fromJSON(object: any): QueryValidatorOutstandingRewardsResponse;
    toJSON(message: QueryValidatorOutstandingRewardsResponse): JsonSafe<QueryValidatorOutstandingRewardsResponse>;
    fromPartial(object: Partial<QueryValidatorOutstandingRewardsResponse>): QueryValidatorOutstandingRewardsResponse;
    fromProtoMsg(message: QueryValidatorOutstandingRewardsResponseProtoMsg): QueryValidatorOutstandingRewardsResponse;
    toProto(message: QueryValidatorOutstandingRewardsResponse): Uint8Array;
    toProtoMsg(message: QueryValidatorOutstandingRewardsResponse): QueryValidatorOutstandingRewardsResponseProtoMsg;
};
export declare const QueryValidatorCommissionRequest: {
    typeUrl: string;
    encode(message: QueryValidatorCommissionRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryValidatorCommissionRequest;
    fromJSON(object: any): QueryValidatorCommissionRequest;
    toJSON(message: QueryValidatorCommissionRequest): JsonSafe<QueryValidatorCommissionRequest>;
    fromPartial(object: Partial<QueryValidatorCommissionRequest>): QueryValidatorCommissionRequest;
    fromProtoMsg(message: QueryValidatorCommissionRequestProtoMsg): QueryValidatorCommissionRequest;
    toProto(message: QueryValidatorCommissionRequest): Uint8Array;
    toProtoMsg(message: QueryValidatorCommissionRequest): QueryValidatorCommissionRequestProtoMsg;
};
export declare const QueryValidatorCommissionResponse: {
    typeUrl: string;
    encode(message: QueryValidatorCommissionResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryValidatorCommissionResponse;
    fromJSON(object: any): QueryValidatorCommissionResponse;
    toJSON(message: QueryValidatorCommissionResponse): JsonSafe<QueryValidatorCommissionResponse>;
    fromPartial(object: Partial<QueryValidatorCommissionResponse>): QueryValidatorCommissionResponse;
    fromProtoMsg(message: QueryValidatorCommissionResponseProtoMsg): QueryValidatorCommissionResponse;
    toProto(message: QueryValidatorCommissionResponse): Uint8Array;
    toProtoMsg(message: QueryValidatorCommissionResponse): QueryValidatorCommissionResponseProtoMsg;
};
export declare const QueryValidatorSlashesRequest: {
    typeUrl: string;
    encode(message: QueryValidatorSlashesRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryValidatorSlashesRequest;
    fromJSON(object: any): QueryValidatorSlashesRequest;
    toJSON(message: QueryValidatorSlashesRequest): JsonSafe<QueryValidatorSlashesRequest>;
    fromPartial(object: Partial<QueryValidatorSlashesRequest>): QueryValidatorSlashesRequest;
    fromProtoMsg(message: QueryValidatorSlashesRequestProtoMsg): QueryValidatorSlashesRequest;
    toProto(message: QueryValidatorSlashesRequest): Uint8Array;
    toProtoMsg(message: QueryValidatorSlashesRequest): QueryValidatorSlashesRequestProtoMsg;
};
export declare const QueryValidatorSlashesResponse: {
    typeUrl: string;
    encode(message: QueryValidatorSlashesResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryValidatorSlashesResponse;
    fromJSON(object: any): QueryValidatorSlashesResponse;
    toJSON(message: QueryValidatorSlashesResponse): JsonSafe<QueryValidatorSlashesResponse>;
    fromPartial(object: Partial<QueryValidatorSlashesResponse>): QueryValidatorSlashesResponse;
    fromProtoMsg(message: QueryValidatorSlashesResponseProtoMsg): QueryValidatorSlashesResponse;
    toProto(message: QueryValidatorSlashesResponse): Uint8Array;
    toProtoMsg(message: QueryValidatorSlashesResponse): QueryValidatorSlashesResponseProtoMsg;
};
export declare const QueryDelegationRewardsRequest: {
    typeUrl: string;
    encode(message: QueryDelegationRewardsRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryDelegationRewardsRequest;
    fromJSON(object: any): QueryDelegationRewardsRequest;
    toJSON(message: QueryDelegationRewardsRequest): JsonSafe<QueryDelegationRewardsRequest>;
    fromPartial(object: Partial<QueryDelegationRewardsRequest>): QueryDelegationRewardsRequest;
    fromProtoMsg(message: QueryDelegationRewardsRequestProtoMsg): QueryDelegationRewardsRequest;
    toProto(message: QueryDelegationRewardsRequest): Uint8Array;
    toProtoMsg(message: QueryDelegationRewardsRequest): QueryDelegationRewardsRequestProtoMsg;
};
export declare const QueryDelegationRewardsResponse: {
    typeUrl: string;
    encode(message: QueryDelegationRewardsResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryDelegationRewardsResponse;
    fromJSON(object: any): QueryDelegationRewardsResponse;
    toJSON(message: QueryDelegationRewardsResponse): JsonSafe<QueryDelegationRewardsResponse>;
    fromPartial(object: Partial<QueryDelegationRewardsResponse>): QueryDelegationRewardsResponse;
    fromProtoMsg(message: QueryDelegationRewardsResponseProtoMsg): QueryDelegationRewardsResponse;
    toProto(message: QueryDelegationRewardsResponse): Uint8Array;
    toProtoMsg(message: QueryDelegationRewardsResponse): QueryDelegationRewardsResponseProtoMsg;
};
export declare const QueryDelegationTotalRewardsRequest: {
    typeUrl: string;
    encode(message: QueryDelegationTotalRewardsRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryDelegationTotalRewardsRequest;
    fromJSON(object: any): QueryDelegationTotalRewardsRequest;
    toJSON(message: QueryDelegationTotalRewardsRequest): JsonSafe<QueryDelegationTotalRewardsRequest>;
    fromPartial(object: Partial<QueryDelegationTotalRewardsRequest>): QueryDelegationTotalRewardsRequest;
    fromProtoMsg(message: QueryDelegationTotalRewardsRequestProtoMsg): QueryDelegationTotalRewardsRequest;
    toProto(message: QueryDelegationTotalRewardsRequest): Uint8Array;
    toProtoMsg(message: QueryDelegationTotalRewardsRequest): QueryDelegationTotalRewardsRequestProtoMsg;
};
export declare const QueryDelegationTotalRewardsResponse: {
    typeUrl: string;
    encode(message: QueryDelegationTotalRewardsResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryDelegationTotalRewardsResponse;
    fromJSON(object: any): QueryDelegationTotalRewardsResponse;
    toJSON(message: QueryDelegationTotalRewardsResponse): JsonSafe<QueryDelegationTotalRewardsResponse>;
    fromPartial(object: Partial<QueryDelegationTotalRewardsResponse>): QueryDelegationTotalRewardsResponse;
    fromProtoMsg(message: QueryDelegationTotalRewardsResponseProtoMsg): QueryDelegationTotalRewardsResponse;
    toProto(message: QueryDelegationTotalRewardsResponse): Uint8Array;
    toProtoMsg(message: QueryDelegationTotalRewardsResponse): QueryDelegationTotalRewardsResponseProtoMsg;
};
export declare const QueryDelegatorValidatorsRequest: {
    typeUrl: string;
    encode(message: QueryDelegatorValidatorsRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryDelegatorValidatorsRequest;
    fromJSON(object: any): QueryDelegatorValidatorsRequest;
    toJSON(message: QueryDelegatorValidatorsRequest): JsonSafe<QueryDelegatorValidatorsRequest>;
    fromPartial(object: Partial<QueryDelegatorValidatorsRequest>): QueryDelegatorValidatorsRequest;
    fromProtoMsg(message: QueryDelegatorValidatorsRequestProtoMsg): QueryDelegatorValidatorsRequest;
    toProto(message: QueryDelegatorValidatorsRequest): Uint8Array;
    toProtoMsg(message: QueryDelegatorValidatorsRequest): QueryDelegatorValidatorsRequestProtoMsg;
};
export declare const QueryDelegatorValidatorsResponse: {
    typeUrl: string;
    encode(message: QueryDelegatorValidatorsResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryDelegatorValidatorsResponse;
    fromJSON(object: any): QueryDelegatorValidatorsResponse;
    toJSON(message: QueryDelegatorValidatorsResponse): JsonSafe<QueryDelegatorValidatorsResponse>;
    fromPartial(object: Partial<QueryDelegatorValidatorsResponse>): QueryDelegatorValidatorsResponse;
    fromProtoMsg(message: QueryDelegatorValidatorsResponseProtoMsg): QueryDelegatorValidatorsResponse;
    toProto(message: QueryDelegatorValidatorsResponse): Uint8Array;
    toProtoMsg(message: QueryDelegatorValidatorsResponse): QueryDelegatorValidatorsResponseProtoMsg;
};
export declare const QueryDelegatorWithdrawAddressRequest: {
    typeUrl: string;
    encode(message: QueryDelegatorWithdrawAddressRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryDelegatorWithdrawAddressRequest;
    fromJSON(object: any): QueryDelegatorWithdrawAddressRequest;
    toJSON(message: QueryDelegatorWithdrawAddressRequest): JsonSafe<QueryDelegatorWithdrawAddressRequest>;
    fromPartial(object: Partial<QueryDelegatorWithdrawAddressRequest>): QueryDelegatorWithdrawAddressRequest;
    fromProtoMsg(message: QueryDelegatorWithdrawAddressRequestProtoMsg): QueryDelegatorWithdrawAddressRequest;
    toProto(message: QueryDelegatorWithdrawAddressRequest): Uint8Array;
    toProtoMsg(message: QueryDelegatorWithdrawAddressRequest): QueryDelegatorWithdrawAddressRequestProtoMsg;
};
export declare const QueryDelegatorWithdrawAddressResponse: {
    typeUrl: string;
    encode(message: QueryDelegatorWithdrawAddressResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryDelegatorWithdrawAddressResponse;
    fromJSON(object: any): QueryDelegatorWithdrawAddressResponse;
    toJSON(message: QueryDelegatorWithdrawAddressResponse): JsonSafe<QueryDelegatorWithdrawAddressResponse>;
    fromPartial(object: Partial<QueryDelegatorWithdrawAddressResponse>): QueryDelegatorWithdrawAddressResponse;
    fromProtoMsg(message: QueryDelegatorWithdrawAddressResponseProtoMsg): QueryDelegatorWithdrawAddressResponse;
    toProto(message: QueryDelegatorWithdrawAddressResponse): Uint8Array;
    toProtoMsg(message: QueryDelegatorWithdrawAddressResponse): QueryDelegatorWithdrawAddressResponseProtoMsg;
};
export declare const QueryCommunityPoolRequest: {
    typeUrl: string;
    encode(_: QueryCommunityPoolRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryCommunityPoolRequest;
    fromJSON(_: any): QueryCommunityPoolRequest;
    toJSON(_: QueryCommunityPoolRequest): JsonSafe<QueryCommunityPoolRequest>;
    fromPartial(_: Partial<QueryCommunityPoolRequest>): QueryCommunityPoolRequest;
    fromProtoMsg(message: QueryCommunityPoolRequestProtoMsg): QueryCommunityPoolRequest;
    toProto(message: QueryCommunityPoolRequest): Uint8Array;
    toProtoMsg(message: QueryCommunityPoolRequest): QueryCommunityPoolRequestProtoMsg;
};
export declare const QueryCommunityPoolResponse: {
    typeUrl: string;
    encode(message: QueryCommunityPoolResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryCommunityPoolResponse;
    fromJSON(object: any): QueryCommunityPoolResponse;
    toJSON(message: QueryCommunityPoolResponse): JsonSafe<QueryCommunityPoolResponse>;
    fromPartial(object: Partial<QueryCommunityPoolResponse>): QueryCommunityPoolResponse;
    fromProtoMsg(message: QueryCommunityPoolResponseProtoMsg): QueryCommunityPoolResponse;
    toProto(message: QueryCommunityPoolResponse): Uint8Array;
    toProtoMsg(message: QueryCommunityPoolResponse): QueryCommunityPoolResponseProtoMsg;
};
