//@ts-nocheck
import {
  Params,
  type ParamsSDKType,
  Egress,
  type EgressSDKType,
} from './swingset.js';
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { type JsonSafe } from '../../json-safe.js';
import { isSet, bytesFromBase64, base64FromBytes } from '../../helpers.js';
/** QueryParamsRequest is the request type for the Query/Params RPC method. */
export interface QueryParamsRequest {}
export interface QueryParamsRequestProtoMsg {
  typeUrl: '/agoric.swingset.QueryParamsRequest';
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
  typeUrl: '/agoric.swingset.QueryParamsResponse';
  value: Uint8Array;
}
/** QueryParamsResponse is the response type for the Query/Params RPC method. */
export interface QueryParamsResponseSDKType {
  params: ParamsSDKType;
}
/** QueryEgressRequest is the request type for the Query/Egress RPC method */
export interface QueryEgressRequest {
  peer: Uint8Array;
}
export interface QueryEgressRequestProtoMsg {
  typeUrl: '/agoric.swingset.QueryEgressRequest';
  value: Uint8Array;
}
/** QueryEgressRequest is the request type for the Query/Egress RPC method */
export interface QueryEgressRequestSDKType {
  peer: Uint8Array;
}
/** QueryEgressResponse is the egress response. */
export interface QueryEgressResponse {
  egress?: Egress;
}
export interface QueryEgressResponseProtoMsg {
  typeUrl: '/agoric.swingset.QueryEgressResponse';
  value: Uint8Array;
}
/** QueryEgressResponse is the egress response. */
export interface QueryEgressResponseSDKType {
  egress?: EgressSDKType;
}
/** QueryMailboxRequest is the mailbox query. */
export interface QueryMailboxRequest {
  peer: Uint8Array;
}
export interface QueryMailboxRequestProtoMsg {
  typeUrl: '/agoric.swingset.QueryMailboxRequest';
  value: Uint8Array;
}
/** QueryMailboxRequest is the mailbox query. */
export interface QueryMailboxRequestSDKType {
  peer: Uint8Array;
}
/** QueryMailboxResponse is the mailbox response. */
export interface QueryMailboxResponse {
  value: string;
}
export interface QueryMailboxResponseProtoMsg {
  typeUrl: '/agoric.swingset.QueryMailboxResponse';
  value: Uint8Array;
}
/** QueryMailboxResponse is the mailbox response. */
export interface QueryMailboxResponseSDKType {
  value: string;
}
function createBaseQueryParamsRequest(): QueryParamsRequest {
  return {};
}
export const QueryParamsRequest = {
  typeUrl: '/agoric.swingset.QueryParamsRequest',
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
      typeUrl: '/agoric.swingset.QueryParamsRequest',
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
  typeUrl: '/agoric.swingset.QueryParamsResponse',
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
      typeUrl: '/agoric.swingset.QueryParamsResponse',
      value: QueryParamsResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryEgressRequest(): QueryEgressRequest {
  return {
    peer: new Uint8Array(),
  };
}
export const QueryEgressRequest = {
  typeUrl: '/agoric.swingset.QueryEgressRequest',
  encode(
    message: QueryEgressRequest,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.peer.length !== 0) {
      writer.uint32(10).bytes(message.peer);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryEgressRequest {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryEgressRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.peer = reader.bytes();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryEgressRequest {
    return {
      peer: isSet(object.peer)
        ? bytesFromBase64(object.peer)
        : new Uint8Array(),
    };
  },
  toJSON(message: QueryEgressRequest): JsonSafe<QueryEgressRequest> {
    const obj: any = {};
    message.peer !== undefined &&
      (obj.peer = base64FromBytes(
        message.peer !== undefined ? message.peer : new Uint8Array(),
      ));
    return obj;
  },
  fromPartial(object: Partial<QueryEgressRequest>): QueryEgressRequest {
    const message = createBaseQueryEgressRequest();
    message.peer = object.peer ?? new Uint8Array();
    return message;
  },
  fromProtoMsg(message: QueryEgressRequestProtoMsg): QueryEgressRequest {
    return QueryEgressRequest.decode(message.value);
  },
  toProto(message: QueryEgressRequest): Uint8Array {
    return QueryEgressRequest.encode(message).finish();
  },
  toProtoMsg(message: QueryEgressRequest): QueryEgressRequestProtoMsg {
    return {
      typeUrl: '/agoric.swingset.QueryEgressRequest',
      value: QueryEgressRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryEgressResponse(): QueryEgressResponse {
  return {
    egress: undefined,
  };
}
export const QueryEgressResponse = {
  typeUrl: '/agoric.swingset.QueryEgressResponse',
  encode(
    message: QueryEgressResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.egress !== undefined) {
      Egress.encode(message.egress, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryEgressResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryEgressResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.egress = Egress.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryEgressResponse {
    return {
      egress: isSet(object.egress) ? Egress.fromJSON(object.egress) : undefined,
    };
  },
  toJSON(message: QueryEgressResponse): JsonSafe<QueryEgressResponse> {
    const obj: any = {};
    message.egress !== undefined &&
      (obj.egress = message.egress ? Egress.toJSON(message.egress) : undefined);
    return obj;
  },
  fromPartial(object: Partial<QueryEgressResponse>): QueryEgressResponse {
    const message = createBaseQueryEgressResponse();
    message.egress =
      object.egress !== undefined && object.egress !== null
        ? Egress.fromPartial(object.egress)
        : undefined;
    return message;
  },
  fromProtoMsg(message: QueryEgressResponseProtoMsg): QueryEgressResponse {
    return QueryEgressResponse.decode(message.value);
  },
  toProto(message: QueryEgressResponse): Uint8Array {
    return QueryEgressResponse.encode(message).finish();
  },
  toProtoMsg(message: QueryEgressResponse): QueryEgressResponseProtoMsg {
    return {
      typeUrl: '/agoric.swingset.QueryEgressResponse',
      value: QueryEgressResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryMailboxRequest(): QueryMailboxRequest {
  return {
    peer: new Uint8Array(),
  };
}
export const QueryMailboxRequest = {
  typeUrl: '/agoric.swingset.QueryMailboxRequest',
  encode(
    message: QueryMailboxRequest,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.peer.length !== 0) {
      writer.uint32(10).bytes(message.peer);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryMailboxRequest {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryMailboxRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.peer = reader.bytes();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryMailboxRequest {
    return {
      peer: isSet(object.peer)
        ? bytesFromBase64(object.peer)
        : new Uint8Array(),
    };
  },
  toJSON(message: QueryMailboxRequest): JsonSafe<QueryMailboxRequest> {
    const obj: any = {};
    message.peer !== undefined &&
      (obj.peer = base64FromBytes(
        message.peer !== undefined ? message.peer : new Uint8Array(),
      ));
    return obj;
  },
  fromPartial(object: Partial<QueryMailboxRequest>): QueryMailboxRequest {
    const message = createBaseQueryMailboxRequest();
    message.peer = object.peer ?? new Uint8Array();
    return message;
  },
  fromProtoMsg(message: QueryMailboxRequestProtoMsg): QueryMailboxRequest {
    return QueryMailboxRequest.decode(message.value);
  },
  toProto(message: QueryMailboxRequest): Uint8Array {
    return QueryMailboxRequest.encode(message).finish();
  },
  toProtoMsg(message: QueryMailboxRequest): QueryMailboxRequestProtoMsg {
    return {
      typeUrl: '/agoric.swingset.QueryMailboxRequest',
      value: QueryMailboxRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryMailboxResponse(): QueryMailboxResponse {
  return {
    value: '',
  };
}
export const QueryMailboxResponse = {
  typeUrl: '/agoric.swingset.QueryMailboxResponse',
  encode(
    message: QueryMailboxResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.value !== '') {
      writer.uint32(10).string(message.value);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryMailboxResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryMailboxResponse();
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
  fromJSON(object: any): QueryMailboxResponse {
    return {
      value: isSet(object.value) ? String(object.value) : '',
    };
  },
  toJSON(message: QueryMailboxResponse): JsonSafe<QueryMailboxResponse> {
    const obj: any = {};
    message.value !== undefined && (obj.value = message.value);
    return obj;
  },
  fromPartial(object: Partial<QueryMailboxResponse>): QueryMailboxResponse {
    const message = createBaseQueryMailboxResponse();
    message.value = object.value ?? '';
    return message;
  },
  fromProtoMsg(message: QueryMailboxResponseProtoMsg): QueryMailboxResponse {
    return QueryMailboxResponse.decode(message.value);
  },
  toProto(message: QueryMailboxResponse): Uint8Array {
    return QueryMailboxResponse.encode(message).finish();
  },
  toProtoMsg(message: QueryMailboxResponse): QueryMailboxResponseProtoMsg {
    return {
      typeUrl: '/agoric.swingset.QueryMailboxResponse',
      value: QueryMailboxResponse.encode(message).finish(),
    };
  },
};
