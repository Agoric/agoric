//@ts-nocheck
import {
  PageRequest,
  type PageRequestSDKType,
  PageResponse,
  type PageResponseSDKType,
} from '../../../../cosmos/base/query/v1beta1/pagination.js';
import {
  DenomTrace,
  type DenomTraceSDKType,
  Params,
  type ParamsSDKType,
} from './transfer.js';
import { BinaryReader, BinaryWriter } from '../../../../binary.js';
import { isSet } from '../../../../helpers.js';
import { type JsonSafe } from '../../../../json-safe.js';
/**
 * QueryDenomTraceRequest is the request type for the Query/DenomTrace RPC
 * method
 */
export interface QueryDenomTraceRequest {
  /** hash (in hex format) or denom (full denom with ibc prefix) of the denomination trace information. */
  hash: string;
}
export interface QueryDenomTraceRequestProtoMsg {
  typeUrl: '/ibc.applications.transfer.v1.QueryDenomTraceRequest';
  value: Uint8Array;
}
/**
 * QueryDenomTraceRequest is the request type for the Query/DenomTrace RPC
 * method
 */
export interface QueryDenomTraceRequestSDKType {
  hash: string;
}
/**
 * QueryDenomTraceResponse is the response type for the Query/DenomTrace RPC
 * method.
 */
export interface QueryDenomTraceResponse {
  /** denom_trace returns the requested denomination trace information. */
  denomTrace?: DenomTrace;
}
export interface QueryDenomTraceResponseProtoMsg {
  typeUrl: '/ibc.applications.transfer.v1.QueryDenomTraceResponse';
  value: Uint8Array;
}
/**
 * QueryDenomTraceResponse is the response type for the Query/DenomTrace RPC
 * method.
 */
export interface QueryDenomTraceResponseSDKType {
  denom_trace?: DenomTraceSDKType;
}
/**
 * QueryConnectionsRequest is the request type for the Query/DenomTraces RPC
 * method
 */
export interface QueryDenomTracesRequest {
  /** pagination defines an optional pagination for the request. */
  pagination?: PageRequest;
}
export interface QueryDenomTracesRequestProtoMsg {
  typeUrl: '/ibc.applications.transfer.v1.QueryDenomTracesRequest';
  value: Uint8Array;
}
/**
 * QueryConnectionsRequest is the request type for the Query/DenomTraces RPC
 * method
 */
export interface QueryDenomTracesRequestSDKType {
  pagination?: PageRequestSDKType;
}
/**
 * QueryConnectionsResponse is the response type for the Query/DenomTraces RPC
 * method.
 */
export interface QueryDenomTracesResponse {
  /** denom_traces returns all denominations trace information. */
  denomTraces: DenomTrace[];
  /** pagination defines the pagination in the response. */
  pagination?: PageResponse;
}
export interface QueryDenomTracesResponseProtoMsg {
  typeUrl: '/ibc.applications.transfer.v1.QueryDenomTracesResponse';
  value: Uint8Array;
}
/**
 * QueryConnectionsResponse is the response type for the Query/DenomTraces RPC
 * method.
 */
export interface QueryDenomTracesResponseSDKType {
  denom_traces: DenomTraceSDKType[];
  pagination?: PageResponseSDKType;
}
/** QueryParamsRequest is the request type for the Query/Params RPC method. */
export interface QueryParamsRequest {}
export interface QueryParamsRequestProtoMsg {
  typeUrl: '/ibc.applications.transfer.v1.QueryParamsRequest';
  value: Uint8Array;
}
/** QueryParamsRequest is the request type for the Query/Params RPC method. */
export interface QueryParamsRequestSDKType {}
/** QueryParamsResponse is the response type for the Query/Params RPC method. */
export interface QueryParamsResponse {
  /** params defines the parameters of the module. */
  params?: Params;
}
export interface QueryParamsResponseProtoMsg {
  typeUrl: '/ibc.applications.transfer.v1.QueryParamsResponse';
  value: Uint8Array;
}
/** QueryParamsResponse is the response type for the Query/Params RPC method. */
export interface QueryParamsResponseSDKType {
  params?: ParamsSDKType;
}
/**
 * QueryDenomHashRequest is the request type for the Query/DenomHash RPC
 * method
 */
export interface QueryDenomHashRequest {
  /** The denomination trace ([port_id]/[channel_id])+/[denom] */
  trace: string;
}
export interface QueryDenomHashRequestProtoMsg {
  typeUrl: '/ibc.applications.transfer.v1.QueryDenomHashRequest';
  value: Uint8Array;
}
/**
 * QueryDenomHashRequest is the request type for the Query/DenomHash RPC
 * method
 */
export interface QueryDenomHashRequestSDKType {
  trace: string;
}
/**
 * QueryDenomHashResponse is the response type for the Query/DenomHash RPC
 * method.
 */
export interface QueryDenomHashResponse {
  /** hash (in hex format) of the denomination trace information. */
  hash: string;
}
export interface QueryDenomHashResponseProtoMsg {
  typeUrl: '/ibc.applications.transfer.v1.QueryDenomHashResponse';
  value: Uint8Array;
}
/**
 * QueryDenomHashResponse is the response type for the Query/DenomHash RPC
 * method.
 */
export interface QueryDenomHashResponseSDKType {
  hash: string;
}
/** QueryEscrowAddressRequest is the request type for the EscrowAddress RPC method. */
export interface QueryEscrowAddressRequest {
  /** unique port identifier */
  portId: string;
  /** unique channel identifier */
  channelId: string;
}
export interface QueryEscrowAddressRequestProtoMsg {
  typeUrl: '/ibc.applications.transfer.v1.QueryEscrowAddressRequest';
  value: Uint8Array;
}
/** QueryEscrowAddressRequest is the request type for the EscrowAddress RPC method. */
export interface QueryEscrowAddressRequestSDKType {
  port_id: string;
  channel_id: string;
}
/** QueryEscrowAddressResponse is the response type of the EscrowAddress RPC method. */
export interface QueryEscrowAddressResponse {
  /** the escrow account address */
  escrowAddress: string;
}
export interface QueryEscrowAddressResponseProtoMsg {
  typeUrl: '/ibc.applications.transfer.v1.QueryEscrowAddressResponse';
  value: Uint8Array;
}
/** QueryEscrowAddressResponse is the response type of the EscrowAddress RPC method. */
export interface QueryEscrowAddressResponseSDKType {
  escrow_address: string;
}
function createBaseQueryDenomTraceRequest(): QueryDenomTraceRequest {
  return {
    hash: '',
  };
}
export const QueryDenomTraceRequest = {
  typeUrl: '/ibc.applications.transfer.v1.QueryDenomTraceRequest',
  encode(
    message: QueryDenomTraceRequest,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.hash !== '') {
      writer.uint32(10).string(message.hash);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryDenomTraceRequest {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryDenomTraceRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.hash = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryDenomTraceRequest {
    return {
      hash: isSet(object.hash) ? String(object.hash) : '',
    };
  },
  toJSON(message: QueryDenomTraceRequest): JsonSafe<QueryDenomTraceRequest> {
    const obj: any = {};
    message.hash !== undefined && (obj.hash = message.hash);
    return obj;
  },
  fromPartial(object: Partial<QueryDenomTraceRequest>): QueryDenomTraceRequest {
    const message = createBaseQueryDenomTraceRequest();
    message.hash = object.hash ?? '';
    return message;
  },
  fromProtoMsg(
    message: QueryDenomTraceRequestProtoMsg,
  ): QueryDenomTraceRequest {
    return QueryDenomTraceRequest.decode(message.value);
  },
  toProto(message: QueryDenomTraceRequest): Uint8Array {
    return QueryDenomTraceRequest.encode(message).finish();
  },
  toProtoMsg(message: QueryDenomTraceRequest): QueryDenomTraceRequestProtoMsg {
    return {
      typeUrl: '/ibc.applications.transfer.v1.QueryDenomTraceRequest',
      value: QueryDenomTraceRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryDenomTraceResponse(): QueryDenomTraceResponse {
  return {
    denomTrace: undefined,
  };
}
export const QueryDenomTraceResponse = {
  typeUrl: '/ibc.applications.transfer.v1.QueryDenomTraceResponse',
  encode(
    message: QueryDenomTraceResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.denomTrace !== undefined) {
      DenomTrace.encode(message.denomTrace, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryDenomTraceResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryDenomTraceResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.denomTrace = DenomTrace.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryDenomTraceResponse {
    return {
      denomTrace: isSet(object.denomTrace)
        ? DenomTrace.fromJSON(object.denomTrace)
        : undefined,
    };
  },
  toJSON(message: QueryDenomTraceResponse): JsonSafe<QueryDenomTraceResponse> {
    const obj: any = {};
    message.denomTrace !== undefined &&
      (obj.denomTrace = message.denomTrace
        ? DenomTrace.toJSON(message.denomTrace)
        : undefined);
    return obj;
  },
  fromPartial(
    object: Partial<QueryDenomTraceResponse>,
  ): QueryDenomTraceResponse {
    const message = createBaseQueryDenomTraceResponse();
    message.denomTrace =
      object.denomTrace !== undefined && object.denomTrace !== null
        ? DenomTrace.fromPartial(object.denomTrace)
        : undefined;
    return message;
  },
  fromProtoMsg(
    message: QueryDenomTraceResponseProtoMsg,
  ): QueryDenomTraceResponse {
    return QueryDenomTraceResponse.decode(message.value);
  },
  toProto(message: QueryDenomTraceResponse): Uint8Array {
    return QueryDenomTraceResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QueryDenomTraceResponse,
  ): QueryDenomTraceResponseProtoMsg {
    return {
      typeUrl: '/ibc.applications.transfer.v1.QueryDenomTraceResponse',
      value: QueryDenomTraceResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryDenomTracesRequest(): QueryDenomTracesRequest {
  return {
    pagination: undefined,
  };
}
export const QueryDenomTracesRequest = {
  typeUrl: '/ibc.applications.transfer.v1.QueryDenomTracesRequest',
  encode(
    message: QueryDenomTracesRequest,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.pagination !== undefined) {
      PageRequest.encode(message.pagination, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryDenomTracesRequest {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryDenomTracesRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.pagination = PageRequest.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryDenomTracesRequest {
    return {
      pagination: isSet(object.pagination)
        ? PageRequest.fromJSON(object.pagination)
        : undefined,
    };
  },
  toJSON(message: QueryDenomTracesRequest): JsonSafe<QueryDenomTracesRequest> {
    const obj: any = {};
    message.pagination !== undefined &&
      (obj.pagination = message.pagination
        ? PageRequest.toJSON(message.pagination)
        : undefined);
    return obj;
  },
  fromPartial(
    object: Partial<QueryDenomTracesRequest>,
  ): QueryDenomTracesRequest {
    const message = createBaseQueryDenomTracesRequest();
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageRequest.fromPartial(object.pagination)
        : undefined;
    return message;
  },
  fromProtoMsg(
    message: QueryDenomTracesRequestProtoMsg,
  ): QueryDenomTracesRequest {
    return QueryDenomTracesRequest.decode(message.value);
  },
  toProto(message: QueryDenomTracesRequest): Uint8Array {
    return QueryDenomTracesRequest.encode(message).finish();
  },
  toProtoMsg(
    message: QueryDenomTracesRequest,
  ): QueryDenomTracesRequestProtoMsg {
    return {
      typeUrl: '/ibc.applications.transfer.v1.QueryDenomTracesRequest',
      value: QueryDenomTracesRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryDenomTracesResponse(): QueryDenomTracesResponse {
  return {
    denomTraces: [],
    pagination: undefined,
  };
}
export const QueryDenomTracesResponse = {
  typeUrl: '/ibc.applications.transfer.v1.QueryDenomTracesResponse',
  encode(
    message: QueryDenomTracesResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    for (const v of message.denomTraces) {
      DenomTrace.encode(v!, writer.uint32(10).fork()).ldelim();
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
  ): QueryDenomTracesResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryDenomTracesResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.denomTraces.push(DenomTrace.decode(reader, reader.uint32()));
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
  fromJSON(object: any): QueryDenomTracesResponse {
    return {
      denomTraces: Array.isArray(object?.denomTraces)
        ? object.denomTraces.map((e: any) => DenomTrace.fromJSON(e))
        : [],
      pagination: isSet(object.pagination)
        ? PageResponse.fromJSON(object.pagination)
        : undefined,
    };
  },
  toJSON(
    message: QueryDenomTracesResponse,
  ): JsonSafe<QueryDenomTracesResponse> {
    const obj: any = {};
    if (message.denomTraces) {
      obj.denomTraces = message.denomTraces.map(e =>
        e ? DenomTrace.toJSON(e) : undefined,
      );
    } else {
      obj.denomTraces = [];
    }
    message.pagination !== undefined &&
      (obj.pagination = message.pagination
        ? PageResponse.toJSON(message.pagination)
        : undefined);
    return obj;
  },
  fromPartial(
    object: Partial<QueryDenomTracesResponse>,
  ): QueryDenomTracesResponse {
    const message = createBaseQueryDenomTracesResponse();
    message.denomTraces =
      object.denomTraces?.map(e => DenomTrace.fromPartial(e)) || [];
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageResponse.fromPartial(object.pagination)
        : undefined;
    return message;
  },
  fromProtoMsg(
    message: QueryDenomTracesResponseProtoMsg,
  ): QueryDenomTracesResponse {
    return QueryDenomTracesResponse.decode(message.value);
  },
  toProto(message: QueryDenomTracesResponse): Uint8Array {
    return QueryDenomTracesResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QueryDenomTracesResponse,
  ): QueryDenomTracesResponseProtoMsg {
    return {
      typeUrl: '/ibc.applications.transfer.v1.QueryDenomTracesResponse',
      value: QueryDenomTracesResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryParamsRequest(): QueryParamsRequest {
  return {};
}
export const QueryParamsRequest = {
  typeUrl: '/ibc.applications.transfer.v1.QueryParamsRequest',
  encode(
    _: QueryParamsRequest,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryParamsRequest {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryParamsRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(_: any): QueryParamsRequest {
    return {};
  },
  toJSON(_: QueryParamsRequest): JsonSafe<QueryParamsRequest> {
    const obj: any = {};
    return obj;
  },
  fromPartial(_: Partial<QueryParamsRequest>): QueryParamsRequest {
    const message = createBaseQueryParamsRequest();
    return message;
  },
  fromProtoMsg(message: QueryParamsRequestProtoMsg): QueryParamsRequest {
    return QueryParamsRequest.decode(message.value);
  },
  toProto(message: QueryParamsRequest): Uint8Array {
    return QueryParamsRequest.encode(message).finish();
  },
  toProtoMsg(message: QueryParamsRequest): QueryParamsRequestProtoMsg {
    return {
      typeUrl: '/ibc.applications.transfer.v1.QueryParamsRequest',
      value: QueryParamsRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryParamsResponse(): QueryParamsResponse {
  return {
    params: undefined,
  };
}
export const QueryParamsResponse = {
  typeUrl: '/ibc.applications.transfer.v1.QueryParamsResponse',
  encode(
    message: QueryParamsResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.params !== undefined) {
      Params.encode(message.params, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryParamsResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryParamsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.params = Params.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryParamsResponse {
    return {
      params: isSet(object.params) ? Params.fromJSON(object.params) : undefined,
    };
  },
  toJSON(message: QueryParamsResponse): JsonSafe<QueryParamsResponse> {
    const obj: any = {};
    message.params !== undefined &&
      (obj.params = message.params ? Params.toJSON(message.params) : undefined);
    return obj;
  },
  fromPartial(object: Partial<QueryParamsResponse>): QueryParamsResponse {
    const message = createBaseQueryParamsResponse();
    message.params =
      object.params !== undefined && object.params !== null
        ? Params.fromPartial(object.params)
        : undefined;
    return message;
  },
  fromProtoMsg(message: QueryParamsResponseProtoMsg): QueryParamsResponse {
    return QueryParamsResponse.decode(message.value);
  },
  toProto(message: QueryParamsResponse): Uint8Array {
    return QueryParamsResponse.encode(message).finish();
  },
  toProtoMsg(message: QueryParamsResponse): QueryParamsResponseProtoMsg {
    return {
      typeUrl: '/ibc.applications.transfer.v1.QueryParamsResponse',
      value: QueryParamsResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryDenomHashRequest(): QueryDenomHashRequest {
  return {
    trace: '',
  };
}
export const QueryDenomHashRequest = {
  typeUrl: '/ibc.applications.transfer.v1.QueryDenomHashRequest',
  encode(
    message: QueryDenomHashRequest,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.trace !== '') {
      writer.uint32(10).string(message.trace);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryDenomHashRequest {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryDenomHashRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.trace = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryDenomHashRequest {
    return {
      trace: isSet(object.trace) ? String(object.trace) : '',
    };
  },
  toJSON(message: QueryDenomHashRequest): JsonSafe<QueryDenomHashRequest> {
    const obj: any = {};
    message.trace !== undefined && (obj.trace = message.trace);
    return obj;
  },
  fromPartial(object: Partial<QueryDenomHashRequest>): QueryDenomHashRequest {
    const message = createBaseQueryDenomHashRequest();
    message.trace = object.trace ?? '';
    return message;
  },
  fromProtoMsg(message: QueryDenomHashRequestProtoMsg): QueryDenomHashRequest {
    return QueryDenomHashRequest.decode(message.value);
  },
  toProto(message: QueryDenomHashRequest): Uint8Array {
    return QueryDenomHashRequest.encode(message).finish();
  },
  toProtoMsg(message: QueryDenomHashRequest): QueryDenomHashRequestProtoMsg {
    return {
      typeUrl: '/ibc.applications.transfer.v1.QueryDenomHashRequest',
      value: QueryDenomHashRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryDenomHashResponse(): QueryDenomHashResponse {
  return {
    hash: '',
  };
}
export const QueryDenomHashResponse = {
  typeUrl: '/ibc.applications.transfer.v1.QueryDenomHashResponse',
  encode(
    message: QueryDenomHashResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.hash !== '') {
      writer.uint32(10).string(message.hash);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryDenomHashResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryDenomHashResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.hash = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryDenomHashResponse {
    return {
      hash: isSet(object.hash) ? String(object.hash) : '',
    };
  },
  toJSON(message: QueryDenomHashResponse): JsonSafe<QueryDenomHashResponse> {
    const obj: any = {};
    message.hash !== undefined && (obj.hash = message.hash);
    return obj;
  },
  fromPartial(object: Partial<QueryDenomHashResponse>): QueryDenomHashResponse {
    const message = createBaseQueryDenomHashResponse();
    message.hash = object.hash ?? '';
    return message;
  },
  fromProtoMsg(
    message: QueryDenomHashResponseProtoMsg,
  ): QueryDenomHashResponse {
    return QueryDenomHashResponse.decode(message.value);
  },
  toProto(message: QueryDenomHashResponse): Uint8Array {
    return QueryDenomHashResponse.encode(message).finish();
  },
  toProtoMsg(message: QueryDenomHashResponse): QueryDenomHashResponseProtoMsg {
    return {
      typeUrl: '/ibc.applications.transfer.v1.QueryDenomHashResponse',
      value: QueryDenomHashResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryEscrowAddressRequest(): QueryEscrowAddressRequest {
  return {
    portId: '',
    channelId: '',
  };
}
export const QueryEscrowAddressRequest = {
  typeUrl: '/ibc.applications.transfer.v1.QueryEscrowAddressRequest',
  encode(
    message: QueryEscrowAddressRequest,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.portId !== '') {
      writer.uint32(10).string(message.portId);
    }
    if (message.channelId !== '') {
      writer.uint32(18).string(message.channelId);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryEscrowAddressRequest {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryEscrowAddressRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.portId = reader.string();
          break;
        case 2:
          message.channelId = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryEscrowAddressRequest {
    return {
      portId: isSet(object.portId) ? String(object.portId) : '',
      channelId: isSet(object.channelId) ? String(object.channelId) : '',
    };
  },
  toJSON(
    message: QueryEscrowAddressRequest,
  ): JsonSafe<QueryEscrowAddressRequest> {
    const obj: any = {};
    message.portId !== undefined && (obj.portId = message.portId);
    message.channelId !== undefined && (obj.channelId = message.channelId);
    return obj;
  },
  fromPartial(
    object: Partial<QueryEscrowAddressRequest>,
  ): QueryEscrowAddressRequest {
    const message = createBaseQueryEscrowAddressRequest();
    message.portId = object.portId ?? '';
    message.channelId = object.channelId ?? '';
    return message;
  },
  fromProtoMsg(
    message: QueryEscrowAddressRequestProtoMsg,
  ): QueryEscrowAddressRequest {
    return QueryEscrowAddressRequest.decode(message.value);
  },
  toProto(message: QueryEscrowAddressRequest): Uint8Array {
    return QueryEscrowAddressRequest.encode(message).finish();
  },
  toProtoMsg(
    message: QueryEscrowAddressRequest,
  ): QueryEscrowAddressRequestProtoMsg {
    return {
      typeUrl: '/ibc.applications.transfer.v1.QueryEscrowAddressRequest',
      value: QueryEscrowAddressRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryEscrowAddressResponse(): QueryEscrowAddressResponse {
  return {
    escrowAddress: '',
  };
}
export const QueryEscrowAddressResponse = {
  typeUrl: '/ibc.applications.transfer.v1.QueryEscrowAddressResponse',
  encode(
    message: QueryEscrowAddressResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.escrowAddress !== '') {
      writer.uint32(10).string(message.escrowAddress);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryEscrowAddressResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryEscrowAddressResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.escrowAddress = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryEscrowAddressResponse {
    return {
      escrowAddress: isSet(object.escrowAddress)
        ? String(object.escrowAddress)
        : '',
    };
  },
  toJSON(
    message: QueryEscrowAddressResponse,
  ): JsonSafe<QueryEscrowAddressResponse> {
    const obj: any = {};
    message.escrowAddress !== undefined &&
      (obj.escrowAddress = message.escrowAddress);
    return obj;
  },
  fromPartial(
    object: Partial<QueryEscrowAddressResponse>,
  ): QueryEscrowAddressResponse {
    const message = createBaseQueryEscrowAddressResponse();
    message.escrowAddress = object.escrowAddress ?? '';
    return message;
  },
  fromProtoMsg(
    message: QueryEscrowAddressResponseProtoMsg,
  ): QueryEscrowAddressResponse {
    return QueryEscrowAddressResponse.decode(message.value);
  },
  toProto(message: QueryEscrowAddressResponse): Uint8Array {
    return QueryEscrowAddressResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QueryEscrowAddressResponse,
  ): QueryEscrowAddressResponseProtoMsg {
    return {
      typeUrl: '/ibc.applications.transfer.v1.QueryEscrowAddressResponse',
      value: QueryEscrowAddressResponse.encode(message).finish(),
    };
  },
};
