import { Plan, type PlanSDKType, ModuleVersion, type ModuleVersionSDKType } from './upgrade.js';
import { BinaryReader, BinaryWriter } from '../../../binary.js';
import { type JsonSafe } from '../../../json-safe.js';
/**
 * QueryCurrentPlanRequest is the request type for the Query/CurrentPlan RPC
 * method.
 */
export interface QueryCurrentPlanRequest {
}
export interface QueryCurrentPlanRequestProtoMsg {
    typeUrl: '/cosmos.upgrade.v1beta1.QueryCurrentPlanRequest';
    value: Uint8Array;
}
/**
 * QueryCurrentPlanRequest is the request type for the Query/CurrentPlan RPC
 * method.
 */
export interface QueryCurrentPlanRequestSDKType {
}
/**
 * QueryCurrentPlanResponse is the response type for the Query/CurrentPlan RPC
 * method.
 */
export interface QueryCurrentPlanResponse {
    /** plan is the current upgrade plan. */
    plan?: Plan;
}
export interface QueryCurrentPlanResponseProtoMsg {
    typeUrl: '/cosmos.upgrade.v1beta1.QueryCurrentPlanResponse';
    value: Uint8Array;
}
/**
 * QueryCurrentPlanResponse is the response type for the Query/CurrentPlan RPC
 * method.
 */
export interface QueryCurrentPlanResponseSDKType {
    plan?: PlanSDKType;
}
/**
 * QueryCurrentPlanRequest is the request type for the Query/AppliedPlan RPC
 * method.
 */
export interface QueryAppliedPlanRequest {
    /** name is the name of the applied plan to query for. */
    name: string;
}
export interface QueryAppliedPlanRequestProtoMsg {
    typeUrl: '/cosmos.upgrade.v1beta1.QueryAppliedPlanRequest';
    value: Uint8Array;
}
/**
 * QueryCurrentPlanRequest is the request type for the Query/AppliedPlan RPC
 * method.
 */
export interface QueryAppliedPlanRequestSDKType {
    name: string;
}
/**
 * QueryAppliedPlanResponse is the response type for the Query/AppliedPlan RPC
 * method.
 */
export interface QueryAppliedPlanResponse {
    /** height is the block height at which the plan was applied. */
    height: bigint;
}
export interface QueryAppliedPlanResponseProtoMsg {
    typeUrl: '/cosmos.upgrade.v1beta1.QueryAppliedPlanResponse';
    value: Uint8Array;
}
/**
 * QueryAppliedPlanResponse is the response type for the Query/AppliedPlan RPC
 * method.
 */
export interface QueryAppliedPlanResponseSDKType {
    height: bigint;
}
/**
 * QueryUpgradedConsensusStateRequest is the request type for the Query/UpgradedConsensusState
 * RPC method.
 */
/** @deprecated */
export interface QueryUpgradedConsensusStateRequest {
    /**
     * last height of the current chain must be sent in request
     * as this is the height under which next consensus state is stored
     */
    lastHeight: bigint;
}
export interface QueryUpgradedConsensusStateRequestProtoMsg {
    typeUrl: '/cosmos.upgrade.v1beta1.QueryUpgradedConsensusStateRequest';
    value: Uint8Array;
}
/**
 * QueryUpgradedConsensusStateRequest is the request type for the Query/UpgradedConsensusState
 * RPC method.
 */
/** @deprecated */
export interface QueryUpgradedConsensusStateRequestSDKType {
    last_height: bigint;
}
/**
 * QueryUpgradedConsensusStateResponse is the response type for the Query/UpgradedConsensusState
 * RPC method.
 */
/** @deprecated */
export interface QueryUpgradedConsensusStateResponse {
    /** Since: cosmos-sdk 0.43 */
    upgradedConsensusState: Uint8Array;
}
export interface QueryUpgradedConsensusStateResponseProtoMsg {
    typeUrl: '/cosmos.upgrade.v1beta1.QueryUpgradedConsensusStateResponse';
    value: Uint8Array;
}
/**
 * QueryUpgradedConsensusStateResponse is the response type for the Query/UpgradedConsensusState
 * RPC method.
 */
/** @deprecated */
export interface QueryUpgradedConsensusStateResponseSDKType {
    upgraded_consensus_state: Uint8Array;
}
/**
 * QueryModuleVersionsRequest is the request type for the Query/ModuleVersions
 * RPC method.
 *
 * Since: cosmos-sdk 0.43
 */
export interface QueryModuleVersionsRequest {
    /**
     * module_name is a field to query a specific module
     * consensus version from state. Leaving this empty will
     * fetch the full list of module versions from state
     */
    moduleName: string;
}
export interface QueryModuleVersionsRequestProtoMsg {
    typeUrl: '/cosmos.upgrade.v1beta1.QueryModuleVersionsRequest';
    value: Uint8Array;
}
/**
 * QueryModuleVersionsRequest is the request type for the Query/ModuleVersions
 * RPC method.
 *
 * Since: cosmos-sdk 0.43
 */
export interface QueryModuleVersionsRequestSDKType {
    module_name: string;
}
/**
 * QueryModuleVersionsResponse is the response type for the Query/ModuleVersions
 * RPC method.
 *
 * Since: cosmos-sdk 0.43
 */
export interface QueryModuleVersionsResponse {
    /** module_versions is a list of module names with their consensus versions. */
    moduleVersions: ModuleVersion[];
}
export interface QueryModuleVersionsResponseProtoMsg {
    typeUrl: '/cosmos.upgrade.v1beta1.QueryModuleVersionsResponse';
    value: Uint8Array;
}
/**
 * QueryModuleVersionsResponse is the response type for the Query/ModuleVersions
 * RPC method.
 *
 * Since: cosmos-sdk 0.43
 */
export interface QueryModuleVersionsResponseSDKType {
    module_versions: ModuleVersionSDKType[];
}
/**
 * QueryAuthorityRequest is the request type for Query/Authority
 *
 * Since: cosmos-sdk 0.46
 */
export interface QueryAuthorityRequest {
}
export interface QueryAuthorityRequestProtoMsg {
    typeUrl: '/cosmos.upgrade.v1beta1.QueryAuthorityRequest';
    value: Uint8Array;
}
/**
 * QueryAuthorityRequest is the request type for Query/Authority
 *
 * Since: cosmos-sdk 0.46
 */
export interface QueryAuthorityRequestSDKType {
}
/**
 * QueryAuthorityResponse is the response type for Query/Authority
 *
 * Since: cosmos-sdk 0.46
 */
export interface QueryAuthorityResponse {
    address: string;
}
export interface QueryAuthorityResponseProtoMsg {
    typeUrl: '/cosmos.upgrade.v1beta1.QueryAuthorityResponse';
    value: Uint8Array;
}
/**
 * QueryAuthorityResponse is the response type for Query/Authority
 *
 * Since: cosmos-sdk 0.46
 */
export interface QueryAuthorityResponseSDKType {
    address: string;
}
export declare const QueryCurrentPlanRequest: {
    typeUrl: string;
    encode(_: QueryCurrentPlanRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryCurrentPlanRequest;
    fromJSON(_: any): QueryCurrentPlanRequest;
    toJSON(_: QueryCurrentPlanRequest): JsonSafe<QueryCurrentPlanRequest>;
    fromPartial(_: Partial<QueryCurrentPlanRequest>): QueryCurrentPlanRequest;
    fromProtoMsg(message: QueryCurrentPlanRequestProtoMsg): QueryCurrentPlanRequest;
    toProto(message: QueryCurrentPlanRequest): Uint8Array;
    toProtoMsg(message: QueryCurrentPlanRequest): QueryCurrentPlanRequestProtoMsg;
};
export declare const QueryCurrentPlanResponse: {
    typeUrl: string;
    encode(message: QueryCurrentPlanResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryCurrentPlanResponse;
    fromJSON(object: any): QueryCurrentPlanResponse;
    toJSON(message: QueryCurrentPlanResponse): JsonSafe<QueryCurrentPlanResponse>;
    fromPartial(object: Partial<QueryCurrentPlanResponse>): QueryCurrentPlanResponse;
    fromProtoMsg(message: QueryCurrentPlanResponseProtoMsg): QueryCurrentPlanResponse;
    toProto(message: QueryCurrentPlanResponse): Uint8Array;
    toProtoMsg(message: QueryCurrentPlanResponse): QueryCurrentPlanResponseProtoMsg;
};
export declare const QueryAppliedPlanRequest: {
    typeUrl: string;
    encode(message: QueryAppliedPlanRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryAppliedPlanRequest;
    fromJSON(object: any): QueryAppliedPlanRequest;
    toJSON(message: QueryAppliedPlanRequest): JsonSafe<QueryAppliedPlanRequest>;
    fromPartial(object: Partial<QueryAppliedPlanRequest>): QueryAppliedPlanRequest;
    fromProtoMsg(message: QueryAppliedPlanRequestProtoMsg): QueryAppliedPlanRequest;
    toProto(message: QueryAppliedPlanRequest): Uint8Array;
    toProtoMsg(message: QueryAppliedPlanRequest): QueryAppliedPlanRequestProtoMsg;
};
export declare const QueryAppliedPlanResponse: {
    typeUrl: string;
    encode(message: QueryAppliedPlanResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryAppliedPlanResponse;
    fromJSON(object: any): QueryAppliedPlanResponse;
    toJSON(message: QueryAppliedPlanResponse): JsonSafe<QueryAppliedPlanResponse>;
    fromPartial(object: Partial<QueryAppliedPlanResponse>): QueryAppliedPlanResponse;
    fromProtoMsg(message: QueryAppliedPlanResponseProtoMsg): QueryAppliedPlanResponse;
    toProto(message: QueryAppliedPlanResponse): Uint8Array;
    toProtoMsg(message: QueryAppliedPlanResponse): QueryAppliedPlanResponseProtoMsg;
};
export declare const QueryUpgradedConsensusStateRequest: {
    typeUrl: string;
    encode(message: QueryUpgradedConsensusStateRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryUpgradedConsensusStateRequest;
    fromJSON(object: any): QueryUpgradedConsensusStateRequest;
    toJSON(message: QueryUpgradedConsensusStateRequest): JsonSafe<QueryUpgradedConsensusStateRequest>;
    fromPartial(object: Partial<QueryUpgradedConsensusStateRequest>): QueryUpgradedConsensusStateRequest;
    fromProtoMsg(message: QueryUpgradedConsensusStateRequestProtoMsg): QueryUpgradedConsensusStateRequest;
    toProto(message: QueryUpgradedConsensusStateRequest): Uint8Array;
    toProtoMsg(message: QueryUpgradedConsensusStateRequest): QueryUpgradedConsensusStateRequestProtoMsg;
};
export declare const QueryUpgradedConsensusStateResponse: {
    typeUrl: string;
    encode(message: QueryUpgradedConsensusStateResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryUpgradedConsensusStateResponse;
    fromJSON(object: any): QueryUpgradedConsensusStateResponse;
    toJSON(message: QueryUpgradedConsensusStateResponse): JsonSafe<QueryUpgradedConsensusStateResponse>;
    fromPartial(object: Partial<QueryUpgradedConsensusStateResponse>): QueryUpgradedConsensusStateResponse;
    fromProtoMsg(message: QueryUpgradedConsensusStateResponseProtoMsg): QueryUpgradedConsensusStateResponse;
    toProto(message: QueryUpgradedConsensusStateResponse): Uint8Array;
    toProtoMsg(message: QueryUpgradedConsensusStateResponse): QueryUpgradedConsensusStateResponseProtoMsg;
};
export declare const QueryModuleVersionsRequest: {
    typeUrl: string;
    encode(message: QueryModuleVersionsRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryModuleVersionsRequest;
    fromJSON(object: any): QueryModuleVersionsRequest;
    toJSON(message: QueryModuleVersionsRequest): JsonSafe<QueryModuleVersionsRequest>;
    fromPartial(object: Partial<QueryModuleVersionsRequest>): QueryModuleVersionsRequest;
    fromProtoMsg(message: QueryModuleVersionsRequestProtoMsg): QueryModuleVersionsRequest;
    toProto(message: QueryModuleVersionsRequest): Uint8Array;
    toProtoMsg(message: QueryModuleVersionsRequest): QueryModuleVersionsRequestProtoMsg;
};
export declare const QueryModuleVersionsResponse: {
    typeUrl: string;
    encode(message: QueryModuleVersionsResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryModuleVersionsResponse;
    fromJSON(object: any): QueryModuleVersionsResponse;
    toJSON(message: QueryModuleVersionsResponse): JsonSafe<QueryModuleVersionsResponse>;
    fromPartial(object: Partial<QueryModuleVersionsResponse>): QueryModuleVersionsResponse;
    fromProtoMsg(message: QueryModuleVersionsResponseProtoMsg): QueryModuleVersionsResponse;
    toProto(message: QueryModuleVersionsResponse): Uint8Array;
    toProtoMsg(message: QueryModuleVersionsResponse): QueryModuleVersionsResponseProtoMsg;
};
export declare const QueryAuthorityRequest: {
    typeUrl: string;
    encode(_: QueryAuthorityRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryAuthorityRequest;
    fromJSON(_: any): QueryAuthorityRequest;
    toJSON(_: QueryAuthorityRequest): JsonSafe<QueryAuthorityRequest>;
    fromPartial(_: Partial<QueryAuthorityRequest>): QueryAuthorityRequest;
    fromProtoMsg(message: QueryAuthorityRequestProtoMsg): QueryAuthorityRequest;
    toProto(message: QueryAuthorityRequest): Uint8Array;
    toProtoMsg(message: QueryAuthorityRequest): QueryAuthorityRequestProtoMsg;
};
export declare const QueryAuthorityResponse: {
    typeUrl: string;
    encode(message: QueryAuthorityResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryAuthorityResponse;
    fromJSON(object: any): QueryAuthorityResponse;
    toJSON(message: QueryAuthorityResponse): JsonSafe<QueryAuthorityResponse>;
    fromPartial(object: Partial<QueryAuthorityResponse>): QueryAuthorityResponse;
    fromProtoMsg(message: QueryAuthorityResponseProtoMsg): QueryAuthorityResponse;
    toProto(message: QueryAuthorityResponse): Uint8Array;
    toProtoMsg(message: QueryAuthorityResponse): QueryAuthorityResponseProtoMsg;
};
