import { PageRequest, type PageRequestSDKType, PageResponse, type PageResponseSDKType } from '../../cosmos/base/query/v1beta1/pagination.js';
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { type JsonSafe } from '../../json-safe.js';
/** QueryDataRequest is the vstorage path data query. */
export interface QueryDataRequest {
    path: string;
}
export interface QueryDataRequestProtoMsg {
    typeUrl: '/agoric.vstorage.QueryDataRequest';
    value: Uint8Array;
}
/** QueryDataRequest is the vstorage path data query. */
export interface QueryDataRequestSDKType {
    path: string;
}
/** QueryDataResponse is the vstorage path data response. */
export interface QueryDataResponse {
    value: string;
}
export interface QueryDataResponseProtoMsg {
    typeUrl: '/agoric.vstorage.QueryDataResponse';
    value: Uint8Array;
}
/** QueryDataResponse is the vstorage path data response. */
export interface QueryDataResponseSDKType {
    value: string;
}
/** QueryCapDataRequest contains a path and formatting configuration. */
export interface QueryCapDataRequest {
    path: string;
    /**
     * mediaType must be an actual media type in the registry at
     * https://www.iana.org/assignments/media-types/media-types.xhtml
     * or a special value that does not conflict with the media type syntax.
     * The only valid value is "JSON Lines", which is also the default.
     */
    mediaType: string;
    /**
     * itemFormat, if present, must be the special value "flat" to indicate that
     * the deep structure of each item should be flattened into a single level
     * with kebab-case keys (e.g., `{ "metrics": { "min": 0, "max": 88 } }` as
     * `{ "metrics-min": 0, "metrics-max": 88 }`).
     */
    itemFormat: string;
    /**
     * remotableValueFormat indicates how to transform references to opaque but
     * distinguishable Remotables into readable embedded representations.
     * * "object" represents each Remotable as an `{ id, allegedName }` object, e.g. `{ "id": "board007", "allegedName": "IST brand" }`.
     * * "string" represents each Remotable as a string with bracket-wrapped contents including its alleged name and id, e.g. "[Alleged: IST brand <board007>]".
     */
    remotableValueFormat: string;
}
export interface QueryCapDataRequestProtoMsg {
    typeUrl: '/agoric.vstorage.QueryCapDataRequest';
    value: Uint8Array;
}
/** QueryCapDataRequest contains a path and formatting configuration. */
export interface QueryCapDataRequestSDKType {
    path: string;
    media_type: string;
    item_format: string;
    remotable_value_format: string;
}
/**
 * QueryCapDataResponse represents the result with the requested formatting,
 * reserving space for future metadata such as media type.
 */
export interface QueryCapDataResponse {
    blockHeight: string;
    value: string;
}
export interface QueryCapDataResponseProtoMsg {
    typeUrl: '/agoric.vstorage.QueryCapDataResponse';
    value: Uint8Array;
}
/**
 * QueryCapDataResponse represents the result with the requested formatting,
 * reserving space for future metadata such as media type.
 */
export interface QueryCapDataResponseSDKType {
    block_height: string;
    value: string;
}
/** QueryChildrenRequest is the vstorage path children query. */
export interface QueryChildrenRequest {
    path: string;
    pagination?: PageRequest;
}
export interface QueryChildrenRequestProtoMsg {
    typeUrl: '/agoric.vstorage.QueryChildrenRequest';
    value: Uint8Array;
}
/** QueryChildrenRequest is the vstorage path children query. */
export interface QueryChildrenRequestSDKType {
    path: string;
    pagination?: PageRequestSDKType;
}
/** QueryChildrenResponse is the vstorage path children response. */
export interface QueryChildrenResponse {
    children: string[];
    pagination?: PageResponse;
}
export interface QueryChildrenResponseProtoMsg {
    typeUrl: '/agoric.vstorage.QueryChildrenResponse';
    value: Uint8Array;
}
/** QueryChildrenResponse is the vstorage path children response. */
export interface QueryChildrenResponseSDKType {
    children: string[];
    pagination?: PageResponseSDKType;
}
export declare const QueryDataRequest: {
    typeUrl: string;
    encode(message: QueryDataRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryDataRequest;
    fromJSON(object: any): QueryDataRequest;
    toJSON(message: QueryDataRequest): JsonSafe<QueryDataRequest>;
    fromPartial(object: Partial<QueryDataRequest>): QueryDataRequest;
    fromProtoMsg(message: QueryDataRequestProtoMsg): QueryDataRequest;
    toProto(message: QueryDataRequest): Uint8Array;
    toProtoMsg(message: QueryDataRequest): QueryDataRequestProtoMsg;
};
export declare const QueryDataResponse: {
    typeUrl: string;
    encode(message: QueryDataResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryDataResponse;
    fromJSON(object: any): QueryDataResponse;
    toJSON(message: QueryDataResponse): JsonSafe<QueryDataResponse>;
    fromPartial(object: Partial<QueryDataResponse>): QueryDataResponse;
    fromProtoMsg(message: QueryDataResponseProtoMsg): QueryDataResponse;
    toProto(message: QueryDataResponse): Uint8Array;
    toProtoMsg(message: QueryDataResponse): QueryDataResponseProtoMsg;
};
export declare const QueryCapDataRequest: {
    typeUrl: string;
    encode(message: QueryCapDataRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryCapDataRequest;
    fromJSON(object: any): QueryCapDataRequest;
    toJSON(message: QueryCapDataRequest): JsonSafe<QueryCapDataRequest>;
    fromPartial(object: Partial<QueryCapDataRequest>): QueryCapDataRequest;
    fromProtoMsg(message: QueryCapDataRequestProtoMsg): QueryCapDataRequest;
    toProto(message: QueryCapDataRequest): Uint8Array;
    toProtoMsg(message: QueryCapDataRequest): QueryCapDataRequestProtoMsg;
};
export declare const QueryCapDataResponse: {
    typeUrl: string;
    encode(message: QueryCapDataResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryCapDataResponse;
    fromJSON(object: any): QueryCapDataResponse;
    toJSON(message: QueryCapDataResponse): JsonSafe<QueryCapDataResponse>;
    fromPartial(object: Partial<QueryCapDataResponse>): QueryCapDataResponse;
    fromProtoMsg(message: QueryCapDataResponseProtoMsg): QueryCapDataResponse;
    toProto(message: QueryCapDataResponse): Uint8Array;
    toProtoMsg(message: QueryCapDataResponse): QueryCapDataResponseProtoMsg;
};
export declare const QueryChildrenRequest: {
    typeUrl: string;
    encode(message: QueryChildrenRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryChildrenRequest;
    fromJSON(object: any): QueryChildrenRequest;
    toJSON(message: QueryChildrenRequest): JsonSafe<QueryChildrenRequest>;
    fromPartial(object: Partial<QueryChildrenRequest>): QueryChildrenRequest;
    fromProtoMsg(message: QueryChildrenRequestProtoMsg): QueryChildrenRequest;
    toProto(message: QueryChildrenRequest): Uint8Array;
    toProtoMsg(message: QueryChildrenRequest): QueryChildrenRequestProtoMsg;
};
export declare const QueryChildrenResponse: {
    typeUrl: string;
    encode(message: QueryChildrenResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryChildrenResponse;
    fromJSON(object: any): QueryChildrenResponse;
    toJSON(message: QueryChildrenResponse): JsonSafe<QueryChildrenResponse>;
    fromPartial(object: Partial<QueryChildrenResponse>): QueryChildrenResponse;
    fromProtoMsg(message: QueryChildrenResponseProtoMsg): QueryChildrenResponse;
    toProto(message: QueryChildrenResponse): Uint8Array;
    toProtoMsg(message: QueryChildrenResponse): QueryChildrenResponseProtoMsg;
};
