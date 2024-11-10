//@ts-nocheck
import { Any, type AnySDKType } from '../../google/protobuf/any.js';
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { type JsonSafe } from '../../json-safe.js';
import { isSet } from '../../helpers.js';
/**
 * CosmosTx contains a list of sdk.Msg's. It should be used when sending
 * transactions to a local chain.
 */
export interface CosmosTx {
  messages: Any[];
}
export interface CosmosTxProtoMsg {
  typeUrl: '/agoric.vlocalchain.CosmosTx';
  value: Uint8Array;
}
/**
 * CosmosTx contains a list of sdk.Msg's. It should be used when sending
 * transactions to a local chain.
 */
export interface CosmosTxSDKType {
  messages: AnySDKType[];
}
/** QueryRequest is used internally to describe a query for the local chain. */
export interface QueryRequest {
  fullMethod: string;
  request?: Any;
  replyType: string;
}
export interface QueryRequestProtoMsg {
  typeUrl: '/agoric.vlocalchain.QueryRequest';
  value: Uint8Array;
}
/** QueryRequest is used internally to describe a query for the local chain. */
export interface QueryRequestSDKType {
  full_method: string;
  request?: AnySDKType;
  reply_type: string;
}
/** QueryResponse is used internally to describe a response from the local chain. */
export interface QueryResponse {
  height: bigint;
  reply?: Any;
  error: string;
}
export interface QueryResponseProtoMsg {
  typeUrl: '/agoric.vlocalchain.QueryResponse';
  value: Uint8Array;
}
/** QueryResponse is used internally to describe a response from the local chain. */
export interface QueryResponseSDKType {
  height: bigint;
  reply?: AnySDKType;
  error: string;
}
/** QueryResponses is used to group multiple QueryResponse messages. */
export interface QueryResponses {
  responses: QueryResponse[];
}
export interface QueryResponsesProtoMsg {
  typeUrl: '/agoric.vlocalchain.QueryResponses';
  value: Uint8Array;
}
/** QueryResponses is used to group multiple QueryResponse messages. */
export interface QueryResponsesSDKType {
  responses: QueryResponseSDKType[];
}
function createBaseCosmosTx(): CosmosTx {
  return {
    messages: [],
  };
}
export const CosmosTx = {
  typeUrl: '/agoric.vlocalchain.CosmosTx',
  encode(
    message: CosmosTx,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    for (const v of message.messages) {
      Any.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): CosmosTx {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCosmosTx();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.messages.push(Any.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): CosmosTx {
    return {
      messages: Array.isArray(object?.messages)
        ? object.messages.map((e: any) => Any.fromJSON(e))
        : [],
    };
  },
  toJSON(message: CosmosTx): JsonSafe<CosmosTx> {
    const obj: any = {};
    if (message.messages) {
      obj.messages = message.messages.map(e => (e ? Any.toJSON(e) : undefined));
    } else {
      obj.messages = [];
    }
    return obj;
  },
  fromPartial(object: Partial<CosmosTx>): CosmosTx {
    const message = createBaseCosmosTx();
    message.messages = object.messages?.map(e => Any.fromPartial(e)) || [];
    return message;
  },
  fromProtoMsg(message: CosmosTxProtoMsg): CosmosTx {
    return CosmosTx.decode(message.value);
  },
  toProto(message: CosmosTx): Uint8Array {
    return CosmosTx.encode(message).finish();
  },
  toProtoMsg(message: CosmosTx): CosmosTxProtoMsg {
    return {
      typeUrl: '/agoric.vlocalchain.CosmosTx',
      value: CosmosTx.encode(message).finish(),
    };
  },
};
function createBaseQueryRequest(): QueryRequest {
  return {
    fullMethod: '',
    request: undefined,
    replyType: '',
  };
}
export const QueryRequest = {
  typeUrl: '/agoric.vlocalchain.QueryRequest',
  encode(
    message: QueryRequest,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.fullMethod !== '') {
      writer.uint32(10).string(message.fullMethod);
    }
    if (message.request !== undefined) {
      Any.encode(message.request, writer.uint32(18).fork()).ldelim();
    }
    if (message.replyType !== '') {
      writer.uint32(26).string(message.replyType);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): QueryRequest {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.fullMethod = reader.string();
          break;
        case 2:
          message.request = Any.decode(reader, reader.uint32());
          break;
        case 3:
          message.replyType = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryRequest {
    return {
      fullMethod: isSet(object.fullMethod) ? String(object.fullMethod) : '',
      request: isSet(object.request) ? Any.fromJSON(object.request) : undefined,
      replyType: isSet(object.replyType) ? String(object.replyType) : '',
    };
  },
  toJSON(message: QueryRequest): JsonSafe<QueryRequest> {
    const obj: any = {};
    message.fullMethod !== undefined && (obj.fullMethod = message.fullMethod);
    message.request !== undefined &&
      (obj.request = message.request ? Any.toJSON(message.request) : undefined);
    message.replyType !== undefined && (obj.replyType = message.replyType);
    return obj;
  },
  fromPartial(object: Partial<QueryRequest>): QueryRequest {
    const message = createBaseQueryRequest();
    message.fullMethod = object.fullMethod ?? '';
    message.request =
      object.request !== undefined && object.request !== null
        ? Any.fromPartial(object.request)
        : undefined;
    message.replyType = object.replyType ?? '';
    return message;
  },
  fromProtoMsg(message: QueryRequestProtoMsg): QueryRequest {
    return QueryRequest.decode(message.value);
  },
  toProto(message: QueryRequest): Uint8Array {
    return QueryRequest.encode(message).finish();
  },
  toProtoMsg(message: QueryRequest): QueryRequestProtoMsg {
    return {
      typeUrl: '/agoric.vlocalchain.QueryRequest',
      value: QueryRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryResponse(): QueryResponse {
  return {
    height: BigInt(0),
    reply: undefined,
    error: '',
  };
}
export const QueryResponse = {
  typeUrl: '/agoric.vlocalchain.QueryResponse',
  encode(
    message: QueryResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.height !== BigInt(0)) {
      writer.uint32(8).int64(message.height);
    }
    if (message.reply !== undefined) {
      Any.encode(message.reply, writer.uint32(18).fork()).ldelim();
    }
    if (message.error !== '') {
      writer.uint32(26).string(message.error);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): QueryResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.height = reader.int64();
          break;
        case 2:
          message.reply = Any.decode(reader, reader.uint32());
          break;
        case 3:
          message.error = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryResponse {
    return {
      height: isSet(object.height)
        ? BigInt(object.height.toString())
        : BigInt(0),
      reply: isSet(object.reply) ? Any.fromJSON(object.reply) : undefined,
      error: isSet(object.error) ? String(object.error) : '',
    };
  },
  toJSON(message: QueryResponse): JsonSafe<QueryResponse> {
    const obj: any = {};
    message.height !== undefined &&
      (obj.height = (message.height || BigInt(0)).toString());
    message.reply !== undefined &&
      (obj.reply = message.reply ? Any.toJSON(message.reply) : undefined);
    message.error !== undefined && (obj.error = message.error);
    return obj;
  },
  fromPartial(object: Partial<QueryResponse>): QueryResponse {
    const message = createBaseQueryResponse();
    message.height =
      object.height !== undefined && object.height !== null
        ? BigInt(object.height.toString())
        : BigInt(0);
    message.reply =
      object.reply !== undefined && object.reply !== null
        ? Any.fromPartial(object.reply)
        : undefined;
    message.error = object.error ?? '';
    return message;
  },
  fromProtoMsg(message: QueryResponseProtoMsg): QueryResponse {
    return QueryResponse.decode(message.value);
  },
  toProto(message: QueryResponse): Uint8Array {
    return QueryResponse.encode(message).finish();
  },
  toProtoMsg(message: QueryResponse): QueryResponseProtoMsg {
    return {
      typeUrl: '/agoric.vlocalchain.QueryResponse',
      value: QueryResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryResponses(): QueryResponses {
  return {
    responses: [],
  };
}
export const QueryResponses = {
  typeUrl: '/agoric.vlocalchain.QueryResponses',
  encode(
    message: QueryResponses,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    for (const v of message.responses) {
      QueryResponse.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): QueryResponses {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryResponses();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.responses.push(QueryResponse.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryResponses {
    return {
      responses: Array.isArray(object?.responses)
        ? object.responses.map((e: any) => QueryResponse.fromJSON(e))
        : [],
    };
  },
  toJSON(message: QueryResponses): JsonSafe<QueryResponses> {
    const obj: any = {};
    if (message.responses) {
      obj.responses = message.responses.map(e =>
        e ? QueryResponse.toJSON(e) : undefined,
      );
    } else {
      obj.responses = [];
    }
    return obj;
  },
  fromPartial(object: Partial<QueryResponses>): QueryResponses {
    const message = createBaseQueryResponses();
    message.responses =
      object.responses?.map(e => QueryResponse.fromPartial(e)) || [];
    return message;
  },
  fromProtoMsg(message: QueryResponsesProtoMsg): QueryResponses {
    return QueryResponses.decode(message.value);
  },
  toProto(message: QueryResponses): Uint8Array {
    return QueryResponses.encode(message).finish();
  },
  toProtoMsg(message: QueryResponses): QueryResponsesProtoMsg {
    return {
      typeUrl: '/agoric.vlocalchain.QueryResponses',
      value: QueryResponses.encode(message).finish(),
    };
  },
};
