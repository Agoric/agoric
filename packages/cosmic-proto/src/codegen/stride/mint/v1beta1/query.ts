//@ts-nocheck
import { Params, type ParamsSDKType } from './mint.js';
import { BinaryReader, BinaryWriter } from '../../../binary.js';
import { type JsonSafe } from '../../../json-safe.js';
import { isSet, bytesFromBase64, base64FromBytes } from '../../../helpers.js';
/** QueryParamsRequest is the request type for the Query/Params RPC method. */
export interface QueryParamsRequest {}
export interface QueryParamsRequestProtoMsg {
  typeUrl: '/stride.mint.v1beta1.QueryParamsRequest';
  value: Uint8Array;
}
/** QueryParamsRequest is the request type for the Query/Params RPC method. */
export interface QueryParamsRequestSDKType {}
/** QueryParamsResponse is the response type for the Query/Params RPC method. */
export interface QueryParamsResponse {
  /** params defines the parameters of the module. */
  params: Params;
}
export interface QueryParamsResponseProtoMsg {
  typeUrl: '/stride.mint.v1beta1.QueryParamsResponse';
  value: Uint8Array;
}
/** QueryParamsResponse is the response type for the Query/Params RPC method. */
export interface QueryParamsResponseSDKType {
  params: ParamsSDKType;
}
/**
 * QueryEpochProvisionsRequest is the request type for the
 * Query/EpochProvisions RPC method.
 */
export interface QueryEpochProvisionsRequest {}
export interface QueryEpochProvisionsRequestProtoMsg {
  typeUrl: '/stride.mint.v1beta1.QueryEpochProvisionsRequest';
  value: Uint8Array;
}
/**
 * QueryEpochProvisionsRequest is the request type for the
 * Query/EpochProvisions RPC method.
 */
export interface QueryEpochProvisionsRequestSDKType {}
/**
 * QueryEpochProvisionsResponse is the response type for the
 * Query/EpochProvisions RPC method.
 */
export interface QueryEpochProvisionsResponse {
  /** epoch_provisions is the current minting per epoch provisions value. */
  epochProvisions: Uint8Array;
}
export interface QueryEpochProvisionsResponseProtoMsg {
  typeUrl: '/stride.mint.v1beta1.QueryEpochProvisionsResponse';
  value: Uint8Array;
}
/**
 * QueryEpochProvisionsResponse is the response type for the
 * Query/EpochProvisions RPC method.
 */
export interface QueryEpochProvisionsResponseSDKType {
  epoch_provisions: Uint8Array;
}
function createBaseQueryParamsRequest(): QueryParamsRequest {
  return {};
}
export const QueryParamsRequest = {
  typeUrl: '/stride.mint.v1beta1.QueryParamsRequest',
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
      typeUrl: '/stride.mint.v1beta1.QueryParamsRequest',
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
  typeUrl: '/stride.mint.v1beta1.QueryParamsResponse',
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
      typeUrl: '/stride.mint.v1beta1.QueryParamsResponse',
      value: QueryParamsResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryEpochProvisionsRequest(): QueryEpochProvisionsRequest {
  return {};
}
export const QueryEpochProvisionsRequest = {
  typeUrl: '/stride.mint.v1beta1.QueryEpochProvisionsRequest',
  encode(
    _: QueryEpochProvisionsRequest,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryEpochProvisionsRequest {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryEpochProvisionsRequest();
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
  fromJSON(_: any): QueryEpochProvisionsRequest {
    return {};
  },
  toJSON(
    _: QueryEpochProvisionsRequest,
  ): JsonSafe<QueryEpochProvisionsRequest> {
    const obj: any = {};
    return obj;
  },
  fromPartial(
    _: Partial<QueryEpochProvisionsRequest>,
  ): QueryEpochProvisionsRequest {
    const message = createBaseQueryEpochProvisionsRequest();
    return message;
  },
  fromProtoMsg(
    message: QueryEpochProvisionsRequestProtoMsg,
  ): QueryEpochProvisionsRequest {
    return QueryEpochProvisionsRequest.decode(message.value);
  },
  toProto(message: QueryEpochProvisionsRequest): Uint8Array {
    return QueryEpochProvisionsRequest.encode(message).finish();
  },
  toProtoMsg(
    message: QueryEpochProvisionsRequest,
  ): QueryEpochProvisionsRequestProtoMsg {
    return {
      typeUrl: '/stride.mint.v1beta1.QueryEpochProvisionsRequest',
      value: QueryEpochProvisionsRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryEpochProvisionsResponse(): QueryEpochProvisionsResponse {
  return {
    epochProvisions: new Uint8Array(),
  };
}
export const QueryEpochProvisionsResponse = {
  typeUrl: '/stride.mint.v1beta1.QueryEpochProvisionsResponse',
  encode(
    message: QueryEpochProvisionsResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.epochProvisions.length !== 0) {
      writer.uint32(10).bytes(message.epochProvisions);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryEpochProvisionsResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryEpochProvisionsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.epochProvisions = reader.bytes();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryEpochProvisionsResponse {
    return {
      epochProvisions: isSet(object.epochProvisions)
        ? bytesFromBase64(object.epochProvisions)
        : new Uint8Array(),
    };
  },
  toJSON(
    message: QueryEpochProvisionsResponse,
  ): JsonSafe<QueryEpochProvisionsResponse> {
    const obj: any = {};
    message.epochProvisions !== undefined &&
      (obj.epochProvisions = base64FromBytes(
        message.epochProvisions !== undefined
          ? message.epochProvisions
          : new Uint8Array(),
      ));
    return obj;
  },
  fromPartial(
    object: Partial<QueryEpochProvisionsResponse>,
  ): QueryEpochProvisionsResponse {
    const message = createBaseQueryEpochProvisionsResponse();
    message.epochProvisions = object.epochProvisions ?? new Uint8Array();
    return message;
  },
  fromProtoMsg(
    message: QueryEpochProvisionsResponseProtoMsg,
  ): QueryEpochProvisionsResponse {
    return QueryEpochProvisionsResponse.decode(message.value);
  },
  toProto(message: QueryEpochProvisionsResponse): Uint8Array {
    return QueryEpochProvisionsResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QueryEpochProvisionsResponse,
  ): QueryEpochProvisionsResponseProtoMsg {
    return {
      typeUrl: '/stride.mint.v1beta1.QueryEpochProvisionsResponse',
      value: QueryEpochProvisionsResponse.encode(message).finish(),
    };
  },
};
