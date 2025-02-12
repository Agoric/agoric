//@ts-nocheck
import {
  PageRequest,
  type PageRequestSDKType,
  PageResponse,
  type PageResponseSDKType,
} from '../../cosmos/base/query/v1beta1/pagination.js';
import { Params, type ParamsSDKType } from './params.js';
import { CallbackData, type CallbackDataSDKType } from './callback_data.js';
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { type JsonSafe } from '../../json-safe.js';
import { isSet } from '../../helpers.js';
/** QueryParamsRequest is request type for the Query/Params RPC method. */
export interface QueryParamsRequest {}
export interface QueryParamsRequestProtoMsg {
  typeUrl: '/stride.icacallbacks.QueryParamsRequest';
  value: Uint8Array;
}
/** QueryParamsRequest is request type for the Query/Params RPC method. */
export interface QueryParamsRequestSDKType {}
/** QueryParamsResponse is response type for the Query/Params RPC method. */
export interface QueryParamsResponse {
  /** params holds all the parameters of this module. */
  params: Params;
}
export interface QueryParamsResponseProtoMsg {
  typeUrl: '/stride.icacallbacks.QueryParamsResponse';
  value: Uint8Array;
}
/** QueryParamsResponse is response type for the Query/Params RPC method. */
export interface QueryParamsResponseSDKType {
  params: ParamsSDKType;
}
export interface QueryGetCallbackDataRequest {
  callbackKey: string;
}
export interface QueryGetCallbackDataRequestProtoMsg {
  typeUrl: '/stride.icacallbacks.QueryGetCallbackDataRequest';
  value: Uint8Array;
}
export interface QueryGetCallbackDataRequestSDKType {
  callback_key: string;
}
export interface QueryGetCallbackDataResponse {
  callbackData: CallbackData;
}
export interface QueryGetCallbackDataResponseProtoMsg {
  typeUrl: '/stride.icacallbacks.QueryGetCallbackDataResponse';
  value: Uint8Array;
}
export interface QueryGetCallbackDataResponseSDKType {
  callback_data: CallbackDataSDKType;
}
export interface QueryAllCallbackDataRequest {
  pagination?: PageRequest;
}
export interface QueryAllCallbackDataRequestProtoMsg {
  typeUrl: '/stride.icacallbacks.QueryAllCallbackDataRequest';
  value: Uint8Array;
}
export interface QueryAllCallbackDataRequestSDKType {
  pagination?: PageRequestSDKType;
}
export interface QueryAllCallbackDataResponse {
  callbackData: CallbackData[];
  pagination?: PageResponse;
}
export interface QueryAllCallbackDataResponseProtoMsg {
  typeUrl: '/stride.icacallbacks.QueryAllCallbackDataResponse';
  value: Uint8Array;
}
export interface QueryAllCallbackDataResponseSDKType {
  callback_data: CallbackDataSDKType[];
  pagination?: PageResponseSDKType;
}
function createBaseQueryParamsRequest(): QueryParamsRequest {
  return {};
}
export const QueryParamsRequest = {
  typeUrl: '/stride.icacallbacks.QueryParamsRequest',
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
      typeUrl: '/stride.icacallbacks.QueryParamsRequest',
      value: QueryParamsRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryParamsResponse(): QueryParamsResponse {
  return {
    params: Params.fromPartial({}),
  };
}
export const QueryParamsResponse = {
  typeUrl: '/stride.icacallbacks.QueryParamsResponse',
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
      typeUrl: '/stride.icacallbacks.QueryParamsResponse',
      value: QueryParamsResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryGetCallbackDataRequest(): QueryGetCallbackDataRequest {
  return {
    callbackKey: '',
  };
}
export const QueryGetCallbackDataRequest = {
  typeUrl: '/stride.icacallbacks.QueryGetCallbackDataRequest',
  encode(
    message: QueryGetCallbackDataRequest,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.callbackKey !== '') {
      writer.uint32(10).string(message.callbackKey);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryGetCallbackDataRequest {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryGetCallbackDataRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.callbackKey = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryGetCallbackDataRequest {
    return {
      callbackKey: isSet(object.callbackKey) ? String(object.callbackKey) : '',
    };
  },
  toJSON(
    message: QueryGetCallbackDataRequest,
  ): JsonSafe<QueryGetCallbackDataRequest> {
    const obj: any = {};
    message.callbackKey !== undefined &&
      (obj.callbackKey = message.callbackKey);
    return obj;
  },
  fromPartial(
    object: Partial<QueryGetCallbackDataRequest>,
  ): QueryGetCallbackDataRequest {
    const message = createBaseQueryGetCallbackDataRequest();
    message.callbackKey = object.callbackKey ?? '';
    return message;
  },
  fromProtoMsg(
    message: QueryGetCallbackDataRequestProtoMsg,
  ): QueryGetCallbackDataRequest {
    return QueryGetCallbackDataRequest.decode(message.value);
  },
  toProto(message: QueryGetCallbackDataRequest): Uint8Array {
    return QueryGetCallbackDataRequest.encode(message).finish();
  },
  toProtoMsg(
    message: QueryGetCallbackDataRequest,
  ): QueryGetCallbackDataRequestProtoMsg {
    return {
      typeUrl: '/stride.icacallbacks.QueryGetCallbackDataRequest',
      value: QueryGetCallbackDataRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryGetCallbackDataResponse(): QueryGetCallbackDataResponse {
  return {
    callbackData: CallbackData.fromPartial({}),
  };
}
export const QueryGetCallbackDataResponse = {
  typeUrl: '/stride.icacallbacks.QueryGetCallbackDataResponse',
  encode(
    message: QueryGetCallbackDataResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.callbackData !== undefined) {
      CallbackData.encode(
        message.callbackData,
        writer.uint32(10).fork(),
      ).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryGetCallbackDataResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryGetCallbackDataResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.callbackData = CallbackData.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryGetCallbackDataResponse {
    return {
      callbackData: isSet(object.callbackData)
        ? CallbackData.fromJSON(object.callbackData)
        : undefined,
    };
  },
  toJSON(
    message: QueryGetCallbackDataResponse,
  ): JsonSafe<QueryGetCallbackDataResponse> {
    const obj: any = {};
    message.callbackData !== undefined &&
      (obj.callbackData = message.callbackData
        ? CallbackData.toJSON(message.callbackData)
        : undefined);
    return obj;
  },
  fromPartial(
    object: Partial<QueryGetCallbackDataResponse>,
  ): QueryGetCallbackDataResponse {
    const message = createBaseQueryGetCallbackDataResponse();
    message.callbackData =
      object.callbackData !== undefined && object.callbackData !== null
        ? CallbackData.fromPartial(object.callbackData)
        : undefined;
    return message;
  },
  fromProtoMsg(
    message: QueryGetCallbackDataResponseProtoMsg,
  ): QueryGetCallbackDataResponse {
    return QueryGetCallbackDataResponse.decode(message.value);
  },
  toProto(message: QueryGetCallbackDataResponse): Uint8Array {
    return QueryGetCallbackDataResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QueryGetCallbackDataResponse,
  ): QueryGetCallbackDataResponseProtoMsg {
    return {
      typeUrl: '/stride.icacallbacks.QueryGetCallbackDataResponse',
      value: QueryGetCallbackDataResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryAllCallbackDataRequest(): QueryAllCallbackDataRequest {
  return {
    pagination: undefined,
  };
}
export const QueryAllCallbackDataRequest = {
  typeUrl: '/stride.icacallbacks.QueryAllCallbackDataRequest',
  encode(
    message: QueryAllCallbackDataRequest,
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
  ): QueryAllCallbackDataRequest {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryAllCallbackDataRequest();
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
  fromJSON(object: any): QueryAllCallbackDataRequest {
    return {
      pagination: isSet(object.pagination)
        ? PageRequest.fromJSON(object.pagination)
        : undefined,
    };
  },
  toJSON(
    message: QueryAllCallbackDataRequest,
  ): JsonSafe<QueryAllCallbackDataRequest> {
    const obj: any = {};
    message.pagination !== undefined &&
      (obj.pagination = message.pagination
        ? PageRequest.toJSON(message.pagination)
        : undefined);
    return obj;
  },
  fromPartial(
    object: Partial<QueryAllCallbackDataRequest>,
  ): QueryAllCallbackDataRequest {
    const message = createBaseQueryAllCallbackDataRequest();
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageRequest.fromPartial(object.pagination)
        : undefined;
    return message;
  },
  fromProtoMsg(
    message: QueryAllCallbackDataRequestProtoMsg,
  ): QueryAllCallbackDataRequest {
    return QueryAllCallbackDataRequest.decode(message.value);
  },
  toProto(message: QueryAllCallbackDataRequest): Uint8Array {
    return QueryAllCallbackDataRequest.encode(message).finish();
  },
  toProtoMsg(
    message: QueryAllCallbackDataRequest,
  ): QueryAllCallbackDataRequestProtoMsg {
    return {
      typeUrl: '/stride.icacallbacks.QueryAllCallbackDataRequest',
      value: QueryAllCallbackDataRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryAllCallbackDataResponse(): QueryAllCallbackDataResponse {
  return {
    callbackData: [],
    pagination: undefined,
  };
}
export const QueryAllCallbackDataResponse = {
  typeUrl: '/stride.icacallbacks.QueryAllCallbackDataResponse',
  encode(
    message: QueryAllCallbackDataResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    for (const v of message.callbackData) {
      CallbackData.encode(v!, writer.uint32(10).fork()).ldelim();
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
  ): QueryAllCallbackDataResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryAllCallbackDataResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.callbackData.push(
            CallbackData.decode(reader, reader.uint32()),
          );
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
  fromJSON(object: any): QueryAllCallbackDataResponse {
    return {
      callbackData: Array.isArray(object?.callbackData)
        ? object.callbackData.map((e: any) => CallbackData.fromJSON(e))
        : [],
      pagination: isSet(object.pagination)
        ? PageResponse.fromJSON(object.pagination)
        : undefined,
    };
  },
  toJSON(
    message: QueryAllCallbackDataResponse,
  ): JsonSafe<QueryAllCallbackDataResponse> {
    const obj: any = {};
    if (message.callbackData) {
      obj.callbackData = message.callbackData.map(e =>
        e ? CallbackData.toJSON(e) : undefined,
      );
    } else {
      obj.callbackData = [];
    }
    message.pagination !== undefined &&
      (obj.pagination = message.pagination
        ? PageResponse.toJSON(message.pagination)
        : undefined);
    return obj;
  },
  fromPartial(
    object: Partial<QueryAllCallbackDataResponse>,
  ): QueryAllCallbackDataResponse {
    const message = createBaseQueryAllCallbackDataResponse();
    message.callbackData =
      object.callbackData?.map(e => CallbackData.fromPartial(e)) || [];
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageResponse.fromPartial(object.pagination)
        : undefined;
    return message;
  },
  fromProtoMsg(
    message: QueryAllCallbackDataResponseProtoMsg,
  ): QueryAllCallbackDataResponse {
    return QueryAllCallbackDataResponse.decode(message.value);
  },
  toProto(message: QueryAllCallbackDataResponse): Uint8Array {
    return QueryAllCallbackDataResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QueryAllCallbackDataResponse,
  ): QueryAllCallbackDataResponseProtoMsg {
    return {
      typeUrl: '/stride.icacallbacks.QueryAllCallbackDataResponse',
      value: QueryAllCallbackDataResponse.encode(message).finish(),
    };
  },
};
