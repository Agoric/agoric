//@ts-nocheck
import {
  PageRequest,
  type PageRequestSDKType,
  PageResponse,
  type PageResponseSDKType,
} from '../../cosmos/base/query/v1beta1/pagination.js';
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { isSet } from '../../helpers.js';
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
function createBaseQueryDataRequest(): QueryDataRequest {
  return {
    path: '',
  };
}
export const QueryDataRequest = {
  typeUrl: '/agoric.vstorage.QueryDataRequest',
  encode(
    message: QueryDataRequest,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.path !== '') {
      writer.uint32(10).string(message.path);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): QueryDataRequest {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryDataRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.path = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryDataRequest {
    return {
      path: isSet(object.path) ? String(object.path) : '',
    };
  },
  toJSON(message: QueryDataRequest): JsonSafe<QueryDataRequest> {
    const obj: any = {};
    message.path !== undefined && (obj.path = message.path);
    return obj;
  },
  fromPartial(object: Partial<QueryDataRequest>): QueryDataRequest {
    const message = createBaseQueryDataRequest();
    message.path = object.path ?? '';
    return message;
  },
  fromProtoMsg(message: QueryDataRequestProtoMsg): QueryDataRequest {
    return QueryDataRequest.decode(message.value);
  },
  toProto(message: QueryDataRequest): Uint8Array {
    return QueryDataRequest.encode(message).finish();
  },
  toProtoMsg(message: QueryDataRequest): QueryDataRequestProtoMsg {
    return {
      typeUrl: '/agoric.vstorage.QueryDataRequest',
      value: QueryDataRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryDataResponse(): QueryDataResponse {
  return {
    value: '',
  };
}
export const QueryDataResponse = {
  typeUrl: '/agoric.vstorage.QueryDataResponse',
  encode(
    message: QueryDataResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.value !== '') {
      writer.uint32(10).string(message.value);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): QueryDataResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryDataResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.value = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryDataResponse {
    return {
      value: isSet(object.value) ? String(object.value) : '',
    };
  },
  toJSON(message: QueryDataResponse): JsonSafe<QueryDataResponse> {
    const obj: any = {};
    message.value !== undefined && (obj.value = message.value);
    return obj;
  },
  fromPartial(object: Partial<QueryDataResponse>): QueryDataResponse {
    const message = createBaseQueryDataResponse();
    message.value = object.value ?? '';
    return message;
  },
  fromProtoMsg(message: QueryDataResponseProtoMsg): QueryDataResponse {
    return QueryDataResponse.decode(message.value);
  },
  toProto(message: QueryDataResponse): Uint8Array {
    return QueryDataResponse.encode(message).finish();
  },
  toProtoMsg(message: QueryDataResponse): QueryDataResponseProtoMsg {
    return {
      typeUrl: '/agoric.vstorage.QueryDataResponse',
      value: QueryDataResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryCapDataRequest(): QueryCapDataRequest {
  return {
    path: '',
    mediaType: '',
    itemFormat: '',
    remotableValueFormat: '',
  };
}
export const QueryCapDataRequest = {
  typeUrl: '/agoric.vstorage.QueryCapDataRequest',
  encode(
    message: QueryCapDataRequest,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.path !== '') {
      writer.uint32(10).string(message.path);
    }
    if (message.mediaType !== '') {
      writer.uint32(18).string(message.mediaType);
    }
    if (message.itemFormat !== '') {
      writer.uint32(26).string(message.itemFormat);
    }
    if (message.remotableValueFormat !== '') {
      writer.uint32(82).string(message.remotableValueFormat);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryCapDataRequest {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryCapDataRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.path = reader.string();
          break;
        case 2:
          message.mediaType = reader.string();
          break;
        case 3:
          message.itemFormat = reader.string();
          break;
        case 10:
          message.remotableValueFormat = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryCapDataRequest {
    return {
      path: isSet(object.path) ? String(object.path) : '',
      mediaType: isSet(object.mediaType) ? String(object.mediaType) : '',
      itemFormat: isSet(object.itemFormat) ? String(object.itemFormat) : '',
      remotableValueFormat: isSet(object.remotableValueFormat)
        ? String(object.remotableValueFormat)
        : '',
    };
  },
  toJSON(message: QueryCapDataRequest): JsonSafe<QueryCapDataRequest> {
    const obj: any = {};
    message.path !== undefined && (obj.path = message.path);
    message.mediaType !== undefined && (obj.mediaType = message.mediaType);
    message.itemFormat !== undefined && (obj.itemFormat = message.itemFormat);
    message.remotableValueFormat !== undefined &&
      (obj.remotableValueFormat = message.remotableValueFormat);
    return obj;
  },
  fromPartial(object: Partial<QueryCapDataRequest>): QueryCapDataRequest {
    const message = createBaseQueryCapDataRequest();
    message.path = object.path ?? '';
    message.mediaType = object.mediaType ?? '';
    message.itemFormat = object.itemFormat ?? '';
    message.remotableValueFormat = object.remotableValueFormat ?? '';
    return message;
  },
  fromProtoMsg(message: QueryCapDataRequestProtoMsg): QueryCapDataRequest {
    return QueryCapDataRequest.decode(message.value);
  },
  toProto(message: QueryCapDataRequest): Uint8Array {
    return QueryCapDataRequest.encode(message).finish();
  },
  toProtoMsg(message: QueryCapDataRequest): QueryCapDataRequestProtoMsg {
    return {
      typeUrl: '/agoric.vstorage.QueryCapDataRequest',
      value: QueryCapDataRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryCapDataResponse(): QueryCapDataResponse {
  return {
    blockHeight: '',
    value: '',
  };
}
export const QueryCapDataResponse = {
  typeUrl: '/agoric.vstorage.QueryCapDataResponse',
  encode(
    message: QueryCapDataResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.blockHeight !== '') {
      writer.uint32(10).string(message.blockHeight);
    }
    if (message.value !== '') {
      writer.uint32(82).string(message.value);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryCapDataResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryCapDataResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.blockHeight = reader.string();
          break;
        case 10:
          message.value = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryCapDataResponse {
    return {
      blockHeight: isSet(object.blockHeight) ? String(object.blockHeight) : '',
      value: isSet(object.value) ? String(object.value) : '',
    };
  },
  toJSON(message: QueryCapDataResponse): JsonSafe<QueryCapDataResponse> {
    const obj: any = {};
    message.blockHeight !== undefined &&
      (obj.blockHeight = message.blockHeight);
    message.value !== undefined && (obj.value = message.value);
    return obj;
  },
  fromPartial(object: Partial<QueryCapDataResponse>): QueryCapDataResponse {
    const message = createBaseQueryCapDataResponse();
    message.blockHeight = object.blockHeight ?? '';
    message.value = object.value ?? '';
    return message;
  },
  fromProtoMsg(message: QueryCapDataResponseProtoMsg): QueryCapDataResponse {
    return QueryCapDataResponse.decode(message.value);
  },
  toProto(message: QueryCapDataResponse): Uint8Array {
    return QueryCapDataResponse.encode(message).finish();
  },
  toProtoMsg(message: QueryCapDataResponse): QueryCapDataResponseProtoMsg {
    return {
      typeUrl: '/agoric.vstorage.QueryCapDataResponse',
      value: QueryCapDataResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryChildrenRequest(): QueryChildrenRequest {
  return {
    path: '',
    pagination: undefined,
  };
}
export const QueryChildrenRequest = {
  typeUrl: '/agoric.vstorage.QueryChildrenRequest',
  encode(
    message: QueryChildrenRequest,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.path !== '') {
      writer.uint32(10).string(message.path);
    }
    if (message.pagination !== undefined) {
      PageRequest.encode(message.pagination, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryChildrenRequest {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryChildrenRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.path = reader.string();
          break;
        case 2:
          message.pagination = PageRequest.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryChildrenRequest {
    return {
      path: isSet(object.path) ? String(object.path) : '',
      pagination: isSet(object.pagination)
        ? PageRequest.fromJSON(object.pagination)
        : undefined,
    };
  },
  toJSON(message: QueryChildrenRequest): JsonSafe<QueryChildrenRequest> {
    const obj: any = {};
    message.path !== undefined && (obj.path = message.path);
    message.pagination !== undefined &&
      (obj.pagination = message.pagination
        ? PageRequest.toJSON(message.pagination)
        : undefined);
    return obj;
  },
  fromPartial(object: Partial<QueryChildrenRequest>): QueryChildrenRequest {
    const message = createBaseQueryChildrenRequest();
    message.path = object.path ?? '';
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageRequest.fromPartial(object.pagination)
        : undefined;
    return message;
  },
  fromProtoMsg(message: QueryChildrenRequestProtoMsg): QueryChildrenRequest {
    return QueryChildrenRequest.decode(message.value);
  },
  toProto(message: QueryChildrenRequest): Uint8Array {
    return QueryChildrenRequest.encode(message).finish();
  },
  toProtoMsg(message: QueryChildrenRequest): QueryChildrenRequestProtoMsg {
    return {
      typeUrl: '/agoric.vstorage.QueryChildrenRequest',
      value: QueryChildrenRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryChildrenResponse(): QueryChildrenResponse {
  return {
    children: [],
    pagination: undefined,
  };
}
export const QueryChildrenResponse = {
  typeUrl: '/agoric.vstorage.QueryChildrenResponse',
  encode(
    message: QueryChildrenResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    for (const v of message.children) {
      writer.uint32(10).string(v!);
    }
    if (message.pagination !== undefined) {
      PageResponse.encode(
        message.pagination,
        writer.uint32(18).fork(),
      ).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryChildrenResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryChildrenResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.children.push(reader.string());
          break;
        case 2:
          message.pagination = PageResponse.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryChildrenResponse {
    return {
      children: Array.isArray(object?.children)
        ? object.children.map((e: any) => String(e))
        : [],
      pagination: isSet(object.pagination)
        ? PageResponse.fromJSON(object.pagination)
        : undefined,
    };
  },
  toJSON(message: QueryChildrenResponse): JsonSafe<QueryChildrenResponse> {
    const obj: any = {};
    if (message.children) {
      obj.children = message.children.map(e => e);
    } else {
      obj.children = [];
    }
    message.pagination !== undefined &&
      (obj.pagination = message.pagination
        ? PageResponse.toJSON(message.pagination)
        : undefined);
    return obj;
  },
  fromPartial(object: Partial<QueryChildrenResponse>): QueryChildrenResponse {
    const message = createBaseQueryChildrenResponse();
    message.children = object.children?.map(e => e) || [];
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageResponse.fromPartial(object.pagination)
        : undefined;
    return message;
  },
  fromProtoMsg(message: QueryChildrenResponseProtoMsg): QueryChildrenResponse {
    return QueryChildrenResponse.decode(message.value);
  },
  toProto(message: QueryChildrenResponse): Uint8Array {
    return QueryChildrenResponse.encode(message).finish();
  },
  toProtoMsg(message: QueryChildrenResponse): QueryChildrenResponseProtoMsg {
    return {
      typeUrl: '/agoric.vstorage.QueryChildrenResponse',
      value: QueryChildrenResponse.encode(message).finish(),
    };
  },
};
