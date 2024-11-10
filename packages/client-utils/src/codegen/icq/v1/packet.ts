//@ts-nocheck
import {
  RequestQuery,
  type RequestQuerySDKType,
  ResponseQuery,
  type ResponseQuerySDKType,
} from '../../tendermint/abci/types.js';
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { isSet, bytesFromBase64, base64FromBytes } from '../../helpers.js';
import { type JsonSafe } from '../../json-safe.js';
/** InterchainQueryPacketData is comprised of raw query. */
export interface InterchainQueryPacketData {
  data: Uint8Array;
  /** optional memo */
  memo: string;
}
export interface InterchainQueryPacketDataProtoMsg {
  typeUrl: '/icq.v1.InterchainQueryPacketData';
  value: Uint8Array;
}
/** InterchainQueryPacketData is comprised of raw query. */
export interface InterchainQueryPacketDataSDKType {
  data: Uint8Array;
  memo: string;
}
/** InterchainQueryPacketAck is comprised of an ABCI query response with non-deterministic fields left empty (e.g. Codespace, Log, Info and ...). */
export interface InterchainQueryPacketAck {
  data: Uint8Array;
}
export interface InterchainQueryPacketAckProtoMsg {
  typeUrl: '/icq.v1.InterchainQueryPacketAck';
  value: Uint8Array;
}
/** InterchainQueryPacketAck is comprised of an ABCI query response with non-deterministic fields left empty (e.g. Codespace, Log, Info and ...). */
export interface InterchainQueryPacketAckSDKType {
  data: Uint8Array;
}
/** CosmosQuery contains a list of tendermint ABCI query requests. It should be used when sending queries to an SDK host chain. */
export interface CosmosQuery {
  requests: RequestQuery[];
}
export interface CosmosQueryProtoMsg {
  typeUrl: '/icq.v1.CosmosQuery';
  value: Uint8Array;
}
/** CosmosQuery contains a list of tendermint ABCI query requests. It should be used when sending queries to an SDK host chain. */
export interface CosmosQuerySDKType {
  requests: RequestQuerySDKType[];
}
/** CosmosResponse contains a list of tendermint ABCI query responses. It should be used when receiving responses from an SDK host chain. */
export interface CosmosResponse {
  responses: ResponseQuery[];
}
export interface CosmosResponseProtoMsg {
  typeUrl: '/icq.v1.CosmosResponse';
  value: Uint8Array;
}
/** CosmosResponse contains a list of tendermint ABCI query responses. It should be used when receiving responses from an SDK host chain. */
export interface CosmosResponseSDKType {
  responses: ResponseQuerySDKType[];
}
function createBaseInterchainQueryPacketData(): InterchainQueryPacketData {
  return {
    data: new Uint8Array(),
    memo: '',
  };
}
export const InterchainQueryPacketData = {
  typeUrl: '/icq.v1.InterchainQueryPacketData',
  encode(
    message: InterchainQueryPacketData,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.data.length !== 0) {
      writer.uint32(10).bytes(message.data);
    }
    if (message.memo !== '') {
      writer.uint32(18).string(message.memo);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): InterchainQueryPacketData {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseInterchainQueryPacketData();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.data = reader.bytes();
          break;
        case 2:
          message.memo = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): InterchainQueryPacketData {
    return {
      data: isSet(object.data)
        ? bytesFromBase64(object.data)
        : new Uint8Array(),
      memo: isSet(object.memo) ? String(object.memo) : '',
    };
  },
  toJSON(
    message: InterchainQueryPacketData,
  ): JsonSafe<InterchainQueryPacketData> {
    const obj: any = {};
    message.data !== undefined &&
      (obj.data = base64FromBytes(
        message.data !== undefined ? message.data : new Uint8Array(),
      ));
    message.memo !== undefined && (obj.memo = message.memo);
    return obj;
  },
  fromPartial(
    object: Partial<InterchainQueryPacketData>,
  ): InterchainQueryPacketData {
    const message = createBaseInterchainQueryPacketData();
    message.data = object.data ?? new Uint8Array();
    message.memo = object.memo ?? '';
    return message;
  },
  fromProtoMsg(
    message: InterchainQueryPacketDataProtoMsg,
  ): InterchainQueryPacketData {
    return InterchainQueryPacketData.decode(message.value);
  },
  toProto(message: InterchainQueryPacketData): Uint8Array {
    return InterchainQueryPacketData.encode(message).finish();
  },
  toProtoMsg(
    message: InterchainQueryPacketData,
  ): InterchainQueryPacketDataProtoMsg {
    return {
      typeUrl: '/icq.v1.InterchainQueryPacketData',
      value: InterchainQueryPacketData.encode(message).finish(),
    };
  },
};
function createBaseInterchainQueryPacketAck(): InterchainQueryPacketAck {
  return {
    data: new Uint8Array(),
  };
}
export const InterchainQueryPacketAck = {
  typeUrl: '/icq.v1.InterchainQueryPacketAck',
  encode(
    message: InterchainQueryPacketAck,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.data.length !== 0) {
      writer.uint32(10).bytes(message.data);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): InterchainQueryPacketAck {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseInterchainQueryPacketAck();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.data = reader.bytes();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): InterchainQueryPacketAck {
    return {
      data: isSet(object.data)
        ? bytesFromBase64(object.data)
        : new Uint8Array(),
    };
  },
  toJSON(
    message: InterchainQueryPacketAck,
  ): JsonSafe<InterchainQueryPacketAck> {
    const obj: any = {};
    message.data !== undefined &&
      (obj.data = base64FromBytes(
        message.data !== undefined ? message.data : new Uint8Array(),
      ));
    return obj;
  },
  fromPartial(
    object: Partial<InterchainQueryPacketAck>,
  ): InterchainQueryPacketAck {
    const message = createBaseInterchainQueryPacketAck();
    message.data = object.data ?? new Uint8Array();
    return message;
  },
  fromProtoMsg(
    message: InterchainQueryPacketAckProtoMsg,
  ): InterchainQueryPacketAck {
    return InterchainQueryPacketAck.decode(message.value);
  },
  toProto(message: InterchainQueryPacketAck): Uint8Array {
    return InterchainQueryPacketAck.encode(message).finish();
  },
  toProtoMsg(
    message: InterchainQueryPacketAck,
  ): InterchainQueryPacketAckProtoMsg {
    return {
      typeUrl: '/icq.v1.InterchainQueryPacketAck',
      value: InterchainQueryPacketAck.encode(message).finish(),
    };
  },
};
function createBaseCosmosQuery(): CosmosQuery {
  return {
    requests: [],
  };
}
export const CosmosQuery = {
  typeUrl: '/icq.v1.CosmosQuery',
  encode(
    message: CosmosQuery,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    for (const v of message.requests) {
      RequestQuery.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): CosmosQuery {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCosmosQuery();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.requests.push(RequestQuery.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): CosmosQuery {
    return {
      requests: Array.isArray(object?.requests)
        ? object.requests.map((e: any) => RequestQuery.fromJSON(e))
        : [],
    };
  },
  toJSON(message: CosmosQuery): JsonSafe<CosmosQuery> {
    const obj: any = {};
    if (message.requests) {
      obj.requests = message.requests.map(e =>
        e ? RequestQuery.toJSON(e) : undefined,
      );
    } else {
      obj.requests = [];
    }
    return obj;
  },
  fromPartial(object: Partial<CosmosQuery>): CosmosQuery {
    const message = createBaseCosmosQuery();
    message.requests =
      object.requests?.map(e => RequestQuery.fromPartial(e)) || [];
    return message;
  },
  fromProtoMsg(message: CosmosQueryProtoMsg): CosmosQuery {
    return CosmosQuery.decode(message.value);
  },
  toProto(message: CosmosQuery): Uint8Array {
    return CosmosQuery.encode(message).finish();
  },
  toProtoMsg(message: CosmosQuery): CosmosQueryProtoMsg {
    return {
      typeUrl: '/icq.v1.CosmosQuery',
      value: CosmosQuery.encode(message).finish(),
    };
  },
};
function createBaseCosmosResponse(): CosmosResponse {
  return {
    responses: [],
  };
}
export const CosmosResponse = {
  typeUrl: '/icq.v1.CosmosResponse',
  encode(
    message: CosmosResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    for (const v of message.responses) {
      ResponseQuery.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): CosmosResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCosmosResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.responses.push(ResponseQuery.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): CosmosResponse {
    return {
      responses: Array.isArray(object?.responses)
        ? object.responses.map((e: any) => ResponseQuery.fromJSON(e))
        : [],
    };
  },
  toJSON(message: CosmosResponse): JsonSafe<CosmosResponse> {
    const obj: any = {};
    if (message.responses) {
      obj.responses = message.responses.map(e =>
        e ? ResponseQuery.toJSON(e) : undefined,
      );
    } else {
      obj.responses = [];
    }
    return obj;
  },
  fromPartial(object: Partial<CosmosResponse>): CosmosResponse {
    const message = createBaseCosmosResponse();
    message.responses =
      object.responses?.map(e => ResponseQuery.fromPartial(e)) || [];
    return message;
  },
  fromProtoMsg(message: CosmosResponseProtoMsg): CosmosResponse {
    return CosmosResponse.decode(message.value);
  },
  toProto(message: CosmosResponse): Uint8Array {
    return CosmosResponse.encode(message).finish();
  },
  toProtoMsg(message: CosmosResponse): CosmosResponseProtoMsg {
    return {
      typeUrl: '/icq.v1.CosmosResponse',
      value: CosmosResponse.encode(message).finish(),
    };
  },
};
