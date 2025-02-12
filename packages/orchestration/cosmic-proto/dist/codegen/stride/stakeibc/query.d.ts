import { PageRequest, type PageRequestSDKType, PageResponse, type PageResponseSDKType } from '../../cosmos/base/query/v1beta1/pagination.js';
import { Params, type ParamsSDKType } from './params.js';
import { Validator, type ValidatorSDKType } from './validator.js';
import { HostZone, type HostZoneSDKType } from './host_zone.js';
import { EpochTracker, type EpochTrackerSDKType } from './epoch_tracker.js';
import { AddressUnbonding, type AddressUnbondingSDKType } from './address_unbonding.js';
import { TradeRoute, type TradeRouteSDKType } from './trade_route.js';
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { type JsonSafe } from '../../json-safe.js';
/**
 * QueryInterchainAccountFromAddressRequest is the request type for the
 * Query/InterchainAccountAddress RPC
 */
export interface QueryInterchainAccountFromAddressRequest {
    owner: string;
    connectionId: string;
}
export interface QueryInterchainAccountFromAddressRequestProtoMsg {
    typeUrl: '/stride.stakeibc.QueryInterchainAccountFromAddressRequest';
    value: Uint8Array;
}
/**
 * QueryInterchainAccountFromAddressRequest is the request type for the
 * Query/InterchainAccountAddress RPC
 */
export interface QueryInterchainAccountFromAddressRequestSDKType {
    owner: string;
    connection_id: string;
}
/**
 * QueryInterchainAccountFromAddressResponse the response type for the
 * Query/InterchainAccountAddress RPC
 */
export interface QueryInterchainAccountFromAddressResponse {
    interchainAccountAddress: string;
}
export interface QueryInterchainAccountFromAddressResponseProtoMsg {
    typeUrl: '/stride.stakeibc.QueryInterchainAccountFromAddressResponse';
    value: Uint8Array;
}
/**
 * QueryInterchainAccountFromAddressResponse the response type for the
 * Query/InterchainAccountAddress RPC
 */
export interface QueryInterchainAccountFromAddressResponseSDKType {
    interchain_account_address: string;
}
/** QueryParamsRequest is request type for the Query/Params RPC method. */
export interface QueryParamsRequest {
}
export interface QueryParamsRequestProtoMsg {
    typeUrl: '/stride.stakeibc.QueryParamsRequest';
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
    typeUrl: '/stride.stakeibc.QueryParamsResponse';
    value: Uint8Array;
}
/** QueryParamsResponse is response type for the Query/Params RPC method. */
export interface QueryParamsResponseSDKType {
    params: ParamsSDKType;
}
export interface QueryGetValidatorsRequest {
    chainId: string;
}
export interface QueryGetValidatorsRequestProtoMsg {
    typeUrl: '/stride.stakeibc.QueryGetValidatorsRequest';
    value: Uint8Array;
}
export interface QueryGetValidatorsRequestSDKType {
    chain_id: string;
}
export interface QueryGetValidatorsResponse {
    validators: Validator[];
}
export interface QueryGetValidatorsResponseProtoMsg {
    typeUrl: '/stride.stakeibc.QueryGetValidatorsResponse';
    value: Uint8Array;
}
export interface QueryGetValidatorsResponseSDKType {
    validators: ValidatorSDKType[];
}
export interface QueryGetHostZoneRequest {
    chainId: string;
}
export interface QueryGetHostZoneRequestProtoMsg {
    typeUrl: '/stride.stakeibc.QueryGetHostZoneRequest';
    value: Uint8Array;
}
export interface QueryGetHostZoneRequestSDKType {
    chain_id: string;
}
export interface QueryGetHostZoneResponse {
    hostZone: HostZone;
}
export interface QueryGetHostZoneResponseProtoMsg {
    typeUrl: '/stride.stakeibc.QueryGetHostZoneResponse';
    value: Uint8Array;
}
export interface QueryGetHostZoneResponseSDKType {
    host_zone: HostZoneSDKType;
}
export interface QueryAllHostZoneRequest {
    pagination?: PageRequest;
}
export interface QueryAllHostZoneRequestProtoMsg {
    typeUrl: '/stride.stakeibc.QueryAllHostZoneRequest';
    value: Uint8Array;
}
export interface QueryAllHostZoneRequestSDKType {
    pagination?: PageRequestSDKType;
}
export interface QueryAllHostZoneResponse {
    hostZone: HostZone[];
    pagination?: PageResponse;
}
export interface QueryAllHostZoneResponseProtoMsg {
    typeUrl: '/stride.stakeibc.QueryAllHostZoneResponse';
    value: Uint8Array;
}
export interface QueryAllHostZoneResponseSDKType {
    host_zone: HostZoneSDKType[];
    pagination?: PageResponseSDKType;
}
export interface QueryModuleAddressRequest {
    name: string;
}
export interface QueryModuleAddressRequestProtoMsg {
    typeUrl: '/stride.stakeibc.QueryModuleAddressRequest';
    value: Uint8Array;
}
export interface QueryModuleAddressRequestSDKType {
    name: string;
}
export interface QueryModuleAddressResponse {
    addr: string;
}
export interface QueryModuleAddressResponseProtoMsg {
    typeUrl: '/stride.stakeibc.QueryModuleAddressResponse';
    value: Uint8Array;
}
export interface QueryModuleAddressResponseSDKType {
    addr: string;
}
export interface QueryGetEpochTrackerRequest {
    epochIdentifier: string;
}
export interface QueryGetEpochTrackerRequestProtoMsg {
    typeUrl: '/stride.stakeibc.QueryGetEpochTrackerRequest';
    value: Uint8Array;
}
export interface QueryGetEpochTrackerRequestSDKType {
    epoch_identifier: string;
}
export interface QueryGetEpochTrackerResponse {
    epochTracker: EpochTracker;
}
export interface QueryGetEpochTrackerResponseProtoMsg {
    typeUrl: '/stride.stakeibc.QueryGetEpochTrackerResponse';
    value: Uint8Array;
}
export interface QueryGetEpochTrackerResponseSDKType {
    epoch_tracker: EpochTrackerSDKType;
}
export interface QueryAllEpochTrackerRequest {
}
export interface QueryAllEpochTrackerRequestProtoMsg {
    typeUrl: '/stride.stakeibc.QueryAllEpochTrackerRequest';
    value: Uint8Array;
}
export interface QueryAllEpochTrackerRequestSDKType {
}
export interface QueryAllEpochTrackerResponse {
    epochTracker: EpochTracker[];
}
export interface QueryAllEpochTrackerResponseProtoMsg {
    typeUrl: '/stride.stakeibc.QueryAllEpochTrackerResponse';
    value: Uint8Array;
}
export interface QueryAllEpochTrackerResponseSDKType {
    epoch_tracker: EpochTrackerSDKType[];
}
export interface QueryGetNextPacketSequenceRequest {
    channelId: string;
    portId: string;
}
export interface QueryGetNextPacketSequenceRequestProtoMsg {
    typeUrl: '/stride.stakeibc.QueryGetNextPacketSequenceRequest';
    value: Uint8Array;
}
export interface QueryGetNextPacketSequenceRequestSDKType {
    channel_id: string;
    port_id: string;
}
export interface QueryGetNextPacketSequenceResponse {
    sequence: bigint;
}
export interface QueryGetNextPacketSequenceResponseProtoMsg {
    typeUrl: '/stride.stakeibc.QueryGetNextPacketSequenceResponse';
    value: Uint8Array;
}
export interface QueryGetNextPacketSequenceResponseSDKType {
    sequence: bigint;
}
export interface QueryAddressUnbondings {
    address: string;
}
export interface QueryAddressUnbondingsProtoMsg {
    typeUrl: '/stride.stakeibc.QueryAddressUnbondings';
    value: Uint8Array;
}
export interface QueryAddressUnbondingsSDKType {
    address: string;
}
export interface QueryAddressUnbondingsResponse {
    addressUnbondings: AddressUnbonding[];
}
export interface QueryAddressUnbondingsResponseProtoMsg {
    typeUrl: '/stride.stakeibc.QueryAddressUnbondingsResponse';
    value: Uint8Array;
}
export interface QueryAddressUnbondingsResponseSDKType {
    address_unbondings: AddressUnbondingSDKType[];
}
export interface QueryAllTradeRoutes {
}
export interface QueryAllTradeRoutesProtoMsg {
    typeUrl: '/stride.stakeibc.QueryAllTradeRoutes';
    value: Uint8Array;
}
export interface QueryAllTradeRoutesSDKType {
}
export interface QueryAllTradeRoutesResponse {
    tradeRoutes: TradeRoute[];
}
export interface QueryAllTradeRoutesResponseProtoMsg {
    typeUrl: '/stride.stakeibc.QueryAllTradeRoutesResponse';
    value: Uint8Array;
}
export interface QueryAllTradeRoutesResponseSDKType {
    trade_routes: TradeRouteSDKType[];
}
export declare const QueryInterchainAccountFromAddressRequest: {
    typeUrl: string;
    encode(message: QueryInterchainAccountFromAddressRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryInterchainAccountFromAddressRequest;
    fromJSON(object: any): QueryInterchainAccountFromAddressRequest;
    toJSON(message: QueryInterchainAccountFromAddressRequest): JsonSafe<QueryInterchainAccountFromAddressRequest>;
    fromPartial(object: Partial<QueryInterchainAccountFromAddressRequest>): QueryInterchainAccountFromAddressRequest;
    fromProtoMsg(message: QueryInterchainAccountFromAddressRequestProtoMsg): QueryInterchainAccountFromAddressRequest;
    toProto(message: QueryInterchainAccountFromAddressRequest): Uint8Array;
    toProtoMsg(message: QueryInterchainAccountFromAddressRequest): QueryInterchainAccountFromAddressRequestProtoMsg;
};
export declare const QueryInterchainAccountFromAddressResponse: {
    typeUrl: string;
    encode(message: QueryInterchainAccountFromAddressResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryInterchainAccountFromAddressResponse;
    fromJSON(object: any): QueryInterchainAccountFromAddressResponse;
    toJSON(message: QueryInterchainAccountFromAddressResponse): JsonSafe<QueryInterchainAccountFromAddressResponse>;
    fromPartial(object: Partial<QueryInterchainAccountFromAddressResponse>): QueryInterchainAccountFromAddressResponse;
    fromProtoMsg(message: QueryInterchainAccountFromAddressResponseProtoMsg): QueryInterchainAccountFromAddressResponse;
    toProto(message: QueryInterchainAccountFromAddressResponse): Uint8Array;
    toProtoMsg(message: QueryInterchainAccountFromAddressResponse): QueryInterchainAccountFromAddressResponseProtoMsg;
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
export declare const QueryGetValidatorsRequest: {
    typeUrl: string;
    encode(message: QueryGetValidatorsRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryGetValidatorsRequest;
    fromJSON(object: any): QueryGetValidatorsRequest;
    toJSON(message: QueryGetValidatorsRequest): JsonSafe<QueryGetValidatorsRequest>;
    fromPartial(object: Partial<QueryGetValidatorsRequest>): QueryGetValidatorsRequest;
    fromProtoMsg(message: QueryGetValidatorsRequestProtoMsg): QueryGetValidatorsRequest;
    toProto(message: QueryGetValidatorsRequest): Uint8Array;
    toProtoMsg(message: QueryGetValidatorsRequest): QueryGetValidatorsRequestProtoMsg;
};
export declare const QueryGetValidatorsResponse: {
    typeUrl: string;
    encode(message: QueryGetValidatorsResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryGetValidatorsResponse;
    fromJSON(object: any): QueryGetValidatorsResponse;
    toJSON(message: QueryGetValidatorsResponse): JsonSafe<QueryGetValidatorsResponse>;
    fromPartial(object: Partial<QueryGetValidatorsResponse>): QueryGetValidatorsResponse;
    fromProtoMsg(message: QueryGetValidatorsResponseProtoMsg): QueryGetValidatorsResponse;
    toProto(message: QueryGetValidatorsResponse): Uint8Array;
    toProtoMsg(message: QueryGetValidatorsResponse): QueryGetValidatorsResponseProtoMsg;
};
export declare const QueryGetHostZoneRequest: {
    typeUrl: string;
    encode(message: QueryGetHostZoneRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryGetHostZoneRequest;
    fromJSON(object: any): QueryGetHostZoneRequest;
    toJSON(message: QueryGetHostZoneRequest): JsonSafe<QueryGetHostZoneRequest>;
    fromPartial(object: Partial<QueryGetHostZoneRequest>): QueryGetHostZoneRequest;
    fromProtoMsg(message: QueryGetHostZoneRequestProtoMsg): QueryGetHostZoneRequest;
    toProto(message: QueryGetHostZoneRequest): Uint8Array;
    toProtoMsg(message: QueryGetHostZoneRequest): QueryGetHostZoneRequestProtoMsg;
};
export declare const QueryGetHostZoneResponse: {
    typeUrl: string;
    encode(message: QueryGetHostZoneResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryGetHostZoneResponse;
    fromJSON(object: any): QueryGetHostZoneResponse;
    toJSON(message: QueryGetHostZoneResponse): JsonSafe<QueryGetHostZoneResponse>;
    fromPartial(object: Partial<QueryGetHostZoneResponse>): QueryGetHostZoneResponse;
    fromProtoMsg(message: QueryGetHostZoneResponseProtoMsg): QueryGetHostZoneResponse;
    toProto(message: QueryGetHostZoneResponse): Uint8Array;
    toProtoMsg(message: QueryGetHostZoneResponse): QueryGetHostZoneResponseProtoMsg;
};
export declare const QueryAllHostZoneRequest: {
    typeUrl: string;
    encode(message: QueryAllHostZoneRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryAllHostZoneRequest;
    fromJSON(object: any): QueryAllHostZoneRequest;
    toJSON(message: QueryAllHostZoneRequest): JsonSafe<QueryAllHostZoneRequest>;
    fromPartial(object: Partial<QueryAllHostZoneRequest>): QueryAllHostZoneRequest;
    fromProtoMsg(message: QueryAllHostZoneRequestProtoMsg): QueryAllHostZoneRequest;
    toProto(message: QueryAllHostZoneRequest): Uint8Array;
    toProtoMsg(message: QueryAllHostZoneRequest): QueryAllHostZoneRequestProtoMsg;
};
export declare const QueryAllHostZoneResponse: {
    typeUrl: string;
    encode(message: QueryAllHostZoneResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryAllHostZoneResponse;
    fromJSON(object: any): QueryAllHostZoneResponse;
    toJSON(message: QueryAllHostZoneResponse): JsonSafe<QueryAllHostZoneResponse>;
    fromPartial(object: Partial<QueryAllHostZoneResponse>): QueryAllHostZoneResponse;
    fromProtoMsg(message: QueryAllHostZoneResponseProtoMsg): QueryAllHostZoneResponse;
    toProto(message: QueryAllHostZoneResponse): Uint8Array;
    toProtoMsg(message: QueryAllHostZoneResponse): QueryAllHostZoneResponseProtoMsg;
};
export declare const QueryModuleAddressRequest: {
    typeUrl: string;
    encode(message: QueryModuleAddressRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryModuleAddressRequest;
    fromJSON(object: any): QueryModuleAddressRequest;
    toJSON(message: QueryModuleAddressRequest): JsonSafe<QueryModuleAddressRequest>;
    fromPartial(object: Partial<QueryModuleAddressRequest>): QueryModuleAddressRequest;
    fromProtoMsg(message: QueryModuleAddressRequestProtoMsg): QueryModuleAddressRequest;
    toProto(message: QueryModuleAddressRequest): Uint8Array;
    toProtoMsg(message: QueryModuleAddressRequest): QueryModuleAddressRequestProtoMsg;
};
export declare const QueryModuleAddressResponse: {
    typeUrl: string;
    encode(message: QueryModuleAddressResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryModuleAddressResponse;
    fromJSON(object: any): QueryModuleAddressResponse;
    toJSON(message: QueryModuleAddressResponse): JsonSafe<QueryModuleAddressResponse>;
    fromPartial(object: Partial<QueryModuleAddressResponse>): QueryModuleAddressResponse;
    fromProtoMsg(message: QueryModuleAddressResponseProtoMsg): QueryModuleAddressResponse;
    toProto(message: QueryModuleAddressResponse): Uint8Array;
    toProtoMsg(message: QueryModuleAddressResponse): QueryModuleAddressResponseProtoMsg;
};
export declare const QueryGetEpochTrackerRequest: {
    typeUrl: string;
    encode(message: QueryGetEpochTrackerRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryGetEpochTrackerRequest;
    fromJSON(object: any): QueryGetEpochTrackerRequest;
    toJSON(message: QueryGetEpochTrackerRequest): JsonSafe<QueryGetEpochTrackerRequest>;
    fromPartial(object: Partial<QueryGetEpochTrackerRequest>): QueryGetEpochTrackerRequest;
    fromProtoMsg(message: QueryGetEpochTrackerRequestProtoMsg): QueryGetEpochTrackerRequest;
    toProto(message: QueryGetEpochTrackerRequest): Uint8Array;
    toProtoMsg(message: QueryGetEpochTrackerRequest): QueryGetEpochTrackerRequestProtoMsg;
};
export declare const QueryGetEpochTrackerResponse: {
    typeUrl: string;
    encode(message: QueryGetEpochTrackerResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryGetEpochTrackerResponse;
    fromJSON(object: any): QueryGetEpochTrackerResponse;
    toJSON(message: QueryGetEpochTrackerResponse): JsonSafe<QueryGetEpochTrackerResponse>;
    fromPartial(object: Partial<QueryGetEpochTrackerResponse>): QueryGetEpochTrackerResponse;
    fromProtoMsg(message: QueryGetEpochTrackerResponseProtoMsg): QueryGetEpochTrackerResponse;
    toProto(message: QueryGetEpochTrackerResponse): Uint8Array;
    toProtoMsg(message: QueryGetEpochTrackerResponse): QueryGetEpochTrackerResponseProtoMsg;
};
export declare const QueryAllEpochTrackerRequest: {
    typeUrl: string;
    encode(_: QueryAllEpochTrackerRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryAllEpochTrackerRequest;
    fromJSON(_: any): QueryAllEpochTrackerRequest;
    toJSON(_: QueryAllEpochTrackerRequest): JsonSafe<QueryAllEpochTrackerRequest>;
    fromPartial(_: Partial<QueryAllEpochTrackerRequest>): QueryAllEpochTrackerRequest;
    fromProtoMsg(message: QueryAllEpochTrackerRequestProtoMsg): QueryAllEpochTrackerRequest;
    toProto(message: QueryAllEpochTrackerRequest): Uint8Array;
    toProtoMsg(message: QueryAllEpochTrackerRequest): QueryAllEpochTrackerRequestProtoMsg;
};
export declare const QueryAllEpochTrackerResponse: {
    typeUrl: string;
    encode(message: QueryAllEpochTrackerResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryAllEpochTrackerResponse;
    fromJSON(object: any): QueryAllEpochTrackerResponse;
    toJSON(message: QueryAllEpochTrackerResponse): JsonSafe<QueryAllEpochTrackerResponse>;
    fromPartial(object: Partial<QueryAllEpochTrackerResponse>): QueryAllEpochTrackerResponse;
    fromProtoMsg(message: QueryAllEpochTrackerResponseProtoMsg): QueryAllEpochTrackerResponse;
    toProto(message: QueryAllEpochTrackerResponse): Uint8Array;
    toProtoMsg(message: QueryAllEpochTrackerResponse): QueryAllEpochTrackerResponseProtoMsg;
};
export declare const QueryGetNextPacketSequenceRequest: {
    typeUrl: string;
    encode(message: QueryGetNextPacketSequenceRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryGetNextPacketSequenceRequest;
    fromJSON(object: any): QueryGetNextPacketSequenceRequest;
    toJSON(message: QueryGetNextPacketSequenceRequest): JsonSafe<QueryGetNextPacketSequenceRequest>;
    fromPartial(object: Partial<QueryGetNextPacketSequenceRequest>): QueryGetNextPacketSequenceRequest;
    fromProtoMsg(message: QueryGetNextPacketSequenceRequestProtoMsg): QueryGetNextPacketSequenceRequest;
    toProto(message: QueryGetNextPacketSequenceRequest): Uint8Array;
    toProtoMsg(message: QueryGetNextPacketSequenceRequest): QueryGetNextPacketSequenceRequestProtoMsg;
};
export declare const QueryGetNextPacketSequenceResponse: {
    typeUrl: string;
    encode(message: QueryGetNextPacketSequenceResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryGetNextPacketSequenceResponse;
    fromJSON(object: any): QueryGetNextPacketSequenceResponse;
    toJSON(message: QueryGetNextPacketSequenceResponse): JsonSafe<QueryGetNextPacketSequenceResponse>;
    fromPartial(object: Partial<QueryGetNextPacketSequenceResponse>): QueryGetNextPacketSequenceResponse;
    fromProtoMsg(message: QueryGetNextPacketSequenceResponseProtoMsg): QueryGetNextPacketSequenceResponse;
    toProto(message: QueryGetNextPacketSequenceResponse): Uint8Array;
    toProtoMsg(message: QueryGetNextPacketSequenceResponse): QueryGetNextPacketSequenceResponseProtoMsg;
};
export declare const QueryAddressUnbondings: {
    typeUrl: string;
    encode(message: QueryAddressUnbondings, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryAddressUnbondings;
    fromJSON(object: any): QueryAddressUnbondings;
    toJSON(message: QueryAddressUnbondings): JsonSafe<QueryAddressUnbondings>;
    fromPartial(object: Partial<QueryAddressUnbondings>): QueryAddressUnbondings;
    fromProtoMsg(message: QueryAddressUnbondingsProtoMsg): QueryAddressUnbondings;
    toProto(message: QueryAddressUnbondings): Uint8Array;
    toProtoMsg(message: QueryAddressUnbondings): QueryAddressUnbondingsProtoMsg;
};
export declare const QueryAddressUnbondingsResponse: {
    typeUrl: string;
    encode(message: QueryAddressUnbondingsResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryAddressUnbondingsResponse;
    fromJSON(object: any): QueryAddressUnbondingsResponse;
    toJSON(message: QueryAddressUnbondingsResponse): JsonSafe<QueryAddressUnbondingsResponse>;
    fromPartial(object: Partial<QueryAddressUnbondingsResponse>): QueryAddressUnbondingsResponse;
    fromProtoMsg(message: QueryAddressUnbondingsResponseProtoMsg): QueryAddressUnbondingsResponse;
    toProto(message: QueryAddressUnbondingsResponse): Uint8Array;
    toProtoMsg(message: QueryAddressUnbondingsResponse): QueryAddressUnbondingsResponseProtoMsg;
};
export declare const QueryAllTradeRoutes: {
    typeUrl: string;
    encode(_: QueryAllTradeRoutes, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryAllTradeRoutes;
    fromJSON(_: any): QueryAllTradeRoutes;
    toJSON(_: QueryAllTradeRoutes): JsonSafe<QueryAllTradeRoutes>;
    fromPartial(_: Partial<QueryAllTradeRoutes>): QueryAllTradeRoutes;
    fromProtoMsg(message: QueryAllTradeRoutesProtoMsg): QueryAllTradeRoutes;
    toProto(message: QueryAllTradeRoutes): Uint8Array;
    toProtoMsg(message: QueryAllTradeRoutes): QueryAllTradeRoutesProtoMsg;
};
export declare const QueryAllTradeRoutesResponse: {
    typeUrl: string;
    encode(message: QueryAllTradeRoutesResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryAllTradeRoutesResponse;
    fromJSON(object: any): QueryAllTradeRoutesResponse;
    toJSON(message: QueryAllTradeRoutesResponse): JsonSafe<QueryAllTradeRoutesResponse>;
    fromPartial(object: Partial<QueryAllTradeRoutesResponse>): QueryAllTradeRoutesResponse;
    fromProtoMsg(message: QueryAllTradeRoutesResponseProtoMsg): QueryAllTradeRoutesResponse;
    toProto(message: QueryAllTradeRoutesResponse): Uint8Array;
    toProtoMsg(message: QueryAllTradeRoutesResponse): QueryAllTradeRoutesResponseProtoMsg;
};
