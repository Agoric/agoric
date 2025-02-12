import { PageRequest, type PageRequestSDKType, PageResponse, type PageResponseSDKType } from '../../cosmos/base/query/v1beta1/pagination.js';
import { EpochInfo, type EpochInfoSDKType } from './genesis.js';
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { type JsonSafe } from '../../json-safe.js';
export interface QueryEpochsInfoRequest {
    pagination?: PageRequest;
}
export interface QueryEpochsInfoRequestProtoMsg {
    typeUrl: '/stride.epochs.QueryEpochsInfoRequest';
    value: Uint8Array;
}
export interface QueryEpochsInfoRequestSDKType {
    pagination?: PageRequestSDKType;
}
export interface QueryEpochsInfoResponse {
    epochs: EpochInfo[];
    pagination?: PageResponse;
}
export interface QueryEpochsInfoResponseProtoMsg {
    typeUrl: '/stride.epochs.QueryEpochsInfoResponse';
    value: Uint8Array;
}
export interface QueryEpochsInfoResponseSDKType {
    epochs: EpochInfoSDKType[];
    pagination?: PageResponseSDKType;
}
export interface QueryCurrentEpochRequest {
    identifier: string;
}
export interface QueryCurrentEpochRequestProtoMsg {
    typeUrl: '/stride.epochs.QueryCurrentEpochRequest';
    value: Uint8Array;
}
export interface QueryCurrentEpochRequestSDKType {
    identifier: string;
}
export interface QueryCurrentEpochResponse {
    currentEpoch: bigint;
}
export interface QueryCurrentEpochResponseProtoMsg {
    typeUrl: '/stride.epochs.QueryCurrentEpochResponse';
    value: Uint8Array;
}
export interface QueryCurrentEpochResponseSDKType {
    current_epoch: bigint;
}
export interface QueryEpochInfoRequest {
    identifier: string;
}
export interface QueryEpochInfoRequestProtoMsg {
    typeUrl: '/stride.epochs.QueryEpochInfoRequest';
    value: Uint8Array;
}
export interface QueryEpochInfoRequestSDKType {
    identifier: string;
}
export interface QueryEpochInfoResponse {
    epoch: EpochInfo;
}
export interface QueryEpochInfoResponseProtoMsg {
    typeUrl: '/stride.epochs.QueryEpochInfoResponse';
    value: Uint8Array;
}
export interface QueryEpochInfoResponseSDKType {
    epoch: EpochInfoSDKType;
}
export declare const QueryEpochsInfoRequest: {
    typeUrl: string;
    encode(message: QueryEpochsInfoRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryEpochsInfoRequest;
    fromJSON(object: any): QueryEpochsInfoRequest;
    toJSON(message: QueryEpochsInfoRequest): JsonSafe<QueryEpochsInfoRequest>;
    fromPartial(object: Partial<QueryEpochsInfoRequest>): QueryEpochsInfoRequest;
    fromProtoMsg(message: QueryEpochsInfoRequestProtoMsg): QueryEpochsInfoRequest;
    toProto(message: QueryEpochsInfoRequest): Uint8Array;
    toProtoMsg(message: QueryEpochsInfoRequest): QueryEpochsInfoRequestProtoMsg;
};
export declare const QueryEpochsInfoResponse: {
    typeUrl: string;
    encode(message: QueryEpochsInfoResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryEpochsInfoResponse;
    fromJSON(object: any): QueryEpochsInfoResponse;
    toJSON(message: QueryEpochsInfoResponse): JsonSafe<QueryEpochsInfoResponse>;
    fromPartial(object: Partial<QueryEpochsInfoResponse>): QueryEpochsInfoResponse;
    fromProtoMsg(message: QueryEpochsInfoResponseProtoMsg): QueryEpochsInfoResponse;
    toProto(message: QueryEpochsInfoResponse): Uint8Array;
    toProtoMsg(message: QueryEpochsInfoResponse): QueryEpochsInfoResponseProtoMsg;
};
export declare const QueryCurrentEpochRequest: {
    typeUrl: string;
    encode(message: QueryCurrentEpochRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryCurrentEpochRequest;
    fromJSON(object: any): QueryCurrentEpochRequest;
    toJSON(message: QueryCurrentEpochRequest): JsonSafe<QueryCurrentEpochRequest>;
    fromPartial(object: Partial<QueryCurrentEpochRequest>): QueryCurrentEpochRequest;
    fromProtoMsg(message: QueryCurrentEpochRequestProtoMsg): QueryCurrentEpochRequest;
    toProto(message: QueryCurrentEpochRequest): Uint8Array;
    toProtoMsg(message: QueryCurrentEpochRequest): QueryCurrentEpochRequestProtoMsg;
};
export declare const QueryCurrentEpochResponse: {
    typeUrl: string;
    encode(message: QueryCurrentEpochResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryCurrentEpochResponse;
    fromJSON(object: any): QueryCurrentEpochResponse;
    toJSON(message: QueryCurrentEpochResponse): JsonSafe<QueryCurrentEpochResponse>;
    fromPartial(object: Partial<QueryCurrentEpochResponse>): QueryCurrentEpochResponse;
    fromProtoMsg(message: QueryCurrentEpochResponseProtoMsg): QueryCurrentEpochResponse;
    toProto(message: QueryCurrentEpochResponse): Uint8Array;
    toProtoMsg(message: QueryCurrentEpochResponse): QueryCurrentEpochResponseProtoMsg;
};
export declare const QueryEpochInfoRequest: {
    typeUrl: string;
    encode(message: QueryEpochInfoRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryEpochInfoRequest;
    fromJSON(object: any): QueryEpochInfoRequest;
    toJSON(message: QueryEpochInfoRequest): JsonSafe<QueryEpochInfoRequest>;
    fromPartial(object: Partial<QueryEpochInfoRequest>): QueryEpochInfoRequest;
    fromProtoMsg(message: QueryEpochInfoRequestProtoMsg): QueryEpochInfoRequest;
    toProto(message: QueryEpochInfoRequest): Uint8Array;
    toProtoMsg(message: QueryEpochInfoRequest): QueryEpochInfoRequestProtoMsg;
};
export declare const QueryEpochInfoResponse: {
    typeUrl: string;
    encode(message: QueryEpochInfoResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryEpochInfoResponse;
    fromJSON(object: any): QueryEpochInfoResponse;
    toJSON(message: QueryEpochInfoResponse): JsonSafe<QueryEpochInfoResponse>;
    fromPartial(object: Partial<QueryEpochInfoResponse>): QueryEpochInfoResponse;
    fromProtoMsg(message: QueryEpochInfoResponseProtoMsg): QueryEpochInfoResponse;
    toProto(message: QueryEpochInfoResponse): Uint8Array;
    toProtoMsg(message: QueryEpochInfoResponse): QueryEpochInfoResponseProtoMsg;
};
