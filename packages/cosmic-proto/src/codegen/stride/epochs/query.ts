//@ts-nocheck
import {
  PageRequest,
  type PageRequestSDKType,
  PageResponse,
  type PageResponseSDKType,
} from '../../cosmos/base/query/v1beta1/pagination.js';
import { EpochInfo, type EpochInfoSDKType } from './genesis.js';
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { isSet } from '../../helpers.js';
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
function createBaseQueryEpochsInfoRequest(): QueryEpochsInfoRequest {
  return {
    pagination: undefined,
  };
}
export const QueryEpochsInfoRequest = {
  typeUrl: '/stride.epochs.QueryEpochsInfoRequest',
  encode(
    message: QueryEpochsInfoRequest,
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
  ): QueryEpochsInfoRequest {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryEpochsInfoRequest();
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
  fromJSON(object: any): QueryEpochsInfoRequest {
    return {
      pagination: isSet(object.pagination)
        ? PageRequest.fromJSON(object.pagination)
        : undefined,
    };
  },
  toJSON(message: QueryEpochsInfoRequest): JsonSafe<QueryEpochsInfoRequest> {
    const obj: any = {};
    message.pagination !== undefined &&
      (obj.pagination = message.pagination
        ? PageRequest.toJSON(message.pagination)
        : undefined);
    return obj;
  },
  fromPartial(object: Partial<QueryEpochsInfoRequest>): QueryEpochsInfoRequest {
    const message = createBaseQueryEpochsInfoRequest();
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageRequest.fromPartial(object.pagination)
        : undefined;
    return message;
  },
  fromProtoMsg(
    message: QueryEpochsInfoRequestProtoMsg,
  ): QueryEpochsInfoRequest {
    return QueryEpochsInfoRequest.decode(message.value);
  },
  toProto(message: QueryEpochsInfoRequest): Uint8Array {
    return QueryEpochsInfoRequest.encode(message).finish();
  },
  toProtoMsg(message: QueryEpochsInfoRequest): QueryEpochsInfoRequestProtoMsg {
    return {
      typeUrl: '/stride.epochs.QueryEpochsInfoRequest',
      value: QueryEpochsInfoRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryEpochsInfoResponse(): QueryEpochsInfoResponse {
  return {
    epochs: [],
    pagination: undefined,
  };
}
export const QueryEpochsInfoResponse = {
  typeUrl: '/stride.epochs.QueryEpochsInfoResponse',
  encode(
    message: QueryEpochsInfoResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    for (const v of message.epochs) {
      EpochInfo.encode(v!, writer.uint32(10).fork()).ldelim();
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
  ): QueryEpochsInfoResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryEpochsInfoResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.epochs.push(EpochInfo.decode(reader, reader.uint32()));
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
  fromJSON(object: any): QueryEpochsInfoResponse {
    return {
      epochs: Array.isArray(object?.epochs)
        ? object.epochs.map((e: any) => EpochInfo.fromJSON(e))
        : [],
      pagination: isSet(object.pagination)
        ? PageResponse.fromJSON(object.pagination)
        : undefined,
    };
  },
  toJSON(message: QueryEpochsInfoResponse): JsonSafe<QueryEpochsInfoResponse> {
    const obj: any = {};
    if (message.epochs) {
      obj.epochs = message.epochs.map(e =>
        e ? EpochInfo.toJSON(e) : undefined,
      );
    } else {
      obj.epochs = [];
    }
    message.pagination !== undefined &&
      (obj.pagination = message.pagination
        ? PageResponse.toJSON(message.pagination)
        : undefined);
    return obj;
  },
  fromPartial(
    object: Partial<QueryEpochsInfoResponse>,
  ): QueryEpochsInfoResponse {
    const message = createBaseQueryEpochsInfoResponse();
    message.epochs = object.epochs?.map(e => EpochInfo.fromPartial(e)) || [];
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageResponse.fromPartial(object.pagination)
        : undefined;
    return message;
  },
  fromProtoMsg(
    message: QueryEpochsInfoResponseProtoMsg,
  ): QueryEpochsInfoResponse {
    return QueryEpochsInfoResponse.decode(message.value);
  },
  toProto(message: QueryEpochsInfoResponse): Uint8Array {
    return QueryEpochsInfoResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QueryEpochsInfoResponse,
  ): QueryEpochsInfoResponseProtoMsg {
    return {
      typeUrl: '/stride.epochs.QueryEpochsInfoResponse',
      value: QueryEpochsInfoResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryCurrentEpochRequest(): QueryCurrentEpochRequest {
  return {
    identifier: '',
  };
}
export const QueryCurrentEpochRequest = {
  typeUrl: '/stride.epochs.QueryCurrentEpochRequest',
  encode(
    message: QueryCurrentEpochRequest,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.identifier !== '') {
      writer.uint32(10).string(message.identifier);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryCurrentEpochRequest {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryCurrentEpochRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.identifier = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryCurrentEpochRequest {
    return {
      identifier: isSet(object.identifier) ? String(object.identifier) : '',
    };
  },
  toJSON(
    message: QueryCurrentEpochRequest,
  ): JsonSafe<QueryCurrentEpochRequest> {
    const obj: any = {};
    message.identifier !== undefined && (obj.identifier = message.identifier);
    return obj;
  },
  fromPartial(
    object: Partial<QueryCurrentEpochRequest>,
  ): QueryCurrentEpochRequest {
    const message = createBaseQueryCurrentEpochRequest();
    message.identifier = object.identifier ?? '';
    return message;
  },
  fromProtoMsg(
    message: QueryCurrentEpochRequestProtoMsg,
  ): QueryCurrentEpochRequest {
    return QueryCurrentEpochRequest.decode(message.value);
  },
  toProto(message: QueryCurrentEpochRequest): Uint8Array {
    return QueryCurrentEpochRequest.encode(message).finish();
  },
  toProtoMsg(
    message: QueryCurrentEpochRequest,
  ): QueryCurrentEpochRequestProtoMsg {
    return {
      typeUrl: '/stride.epochs.QueryCurrentEpochRequest',
      value: QueryCurrentEpochRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryCurrentEpochResponse(): QueryCurrentEpochResponse {
  return {
    currentEpoch: BigInt(0),
  };
}
export const QueryCurrentEpochResponse = {
  typeUrl: '/stride.epochs.QueryCurrentEpochResponse',
  encode(
    message: QueryCurrentEpochResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.currentEpoch !== BigInt(0)) {
      writer.uint32(8).int64(message.currentEpoch);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryCurrentEpochResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryCurrentEpochResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.currentEpoch = reader.int64();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryCurrentEpochResponse {
    return {
      currentEpoch: isSet(object.currentEpoch)
        ? BigInt(object.currentEpoch.toString())
        : BigInt(0),
    };
  },
  toJSON(
    message: QueryCurrentEpochResponse,
  ): JsonSafe<QueryCurrentEpochResponse> {
    const obj: any = {};
    message.currentEpoch !== undefined &&
      (obj.currentEpoch = (message.currentEpoch || BigInt(0)).toString());
    return obj;
  },
  fromPartial(
    object: Partial<QueryCurrentEpochResponse>,
  ): QueryCurrentEpochResponse {
    const message = createBaseQueryCurrentEpochResponse();
    message.currentEpoch =
      object.currentEpoch !== undefined && object.currentEpoch !== null
        ? BigInt(object.currentEpoch.toString())
        : BigInt(0);
    return message;
  },
  fromProtoMsg(
    message: QueryCurrentEpochResponseProtoMsg,
  ): QueryCurrentEpochResponse {
    return QueryCurrentEpochResponse.decode(message.value);
  },
  toProto(message: QueryCurrentEpochResponse): Uint8Array {
    return QueryCurrentEpochResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QueryCurrentEpochResponse,
  ): QueryCurrentEpochResponseProtoMsg {
    return {
      typeUrl: '/stride.epochs.QueryCurrentEpochResponse',
      value: QueryCurrentEpochResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryEpochInfoRequest(): QueryEpochInfoRequest {
  return {
    identifier: '',
  };
}
export const QueryEpochInfoRequest = {
  typeUrl: '/stride.epochs.QueryEpochInfoRequest',
  encode(
    message: QueryEpochInfoRequest,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.identifier !== '') {
      writer.uint32(10).string(message.identifier);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryEpochInfoRequest {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryEpochInfoRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.identifier = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryEpochInfoRequest {
    return {
      identifier: isSet(object.identifier) ? String(object.identifier) : '',
    };
  },
  toJSON(message: QueryEpochInfoRequest): JsonSafe<QueryEpochInfoRequest> {
    const obj: any = {};
    message.identifier !== undefined && (obj.identifier = message.identifier);
    return obj;
  },
  fromPartial(object: Partial<QueryEpochInfoRequest>): QueryEpochInfoRequest {
    const message = createBaseQueryEpochInfoRequest();
    message.identifier = object.identifier ?? '';
    return message;
  },
  fromProtoMsg(message: QueryEpochInfoRequestProtoMsg): QueryEpochInfoRequest {
    return QueryEpochInfoRequest.decode(message.value);
  },
  toProto(message: QueryEpochInfoRequest): Uint8Array {
    return QueryEpochInfoRequest.encode(message).finish();
  },
  toProtoMsg(message: QueryEpochInfoRequest): QueryEpochInfoRequestProtoMsg {
    return {
      typeUrl: '/stride.epochs.QueryEpochInfoRequest',
      value: QueryEpochInfoRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryEpochInfoResponse(): QueryEpochInfoResponse {
  return {
    epoch: EpochInfo.fromPartial({}),
  };
}
export const QueryEpochInfoResponse = {
  typeUrl: '/stride.epochs.QueryEpochInfoResponse',
  encode(
    message: QueryEpochInfoResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.epoch !== undefined) {
      EpochInfo.encode(message.epoch, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryEpochInfoResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryEpochInfoResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.epoch = EpochInfo.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryEpochInfoResponse {
    return {
      epoch: isSet(object.epoch) ? EpochInfo.fromJSON(object.epoch) : undefined,
    };
  },
  toJSON(message: QueryEpochInfoResponse): JsonSafe<QueryEpochInfoResponse> {
    const obj: any = {};
    message.epoch !== undefined &&
      (obj.epoch = message.epoch ? EpochInfo.toJSON(message.epoch) : undefined);
    return obj;
  },
  fromPartial(object: Partial<QueryEpochInfoResponse>): QueryEpochInfoResponse {
    const message = createBaseQueryEpochInfoResponse();
    message.epoch =
      object.epoch !== undefined && object.epoch !== null
        ? EpochInfo.fromPartial(object.epoch)
        : undefined;
    return message;
  },
  fromProtoMsg(
    message: QueryEpochInfoResponseProtoMsg,
  ): QueryEpochInfoResponse {
    return QueryEpochInfoResponse.decode(message.value);
  },
  toProto(message: QueryEpochInfoResponse): Uint8Array {
    return QueryEpochInfoResponse.encode(message).finish();
  },
  toProtoMsg(message: QueryEpochInfoResponse): QueryEpochInfoResponseProtoMsg {
    return {
      typeUrl: '/stride.epochs.QueryEpochInfoResponse',
      value: QueryEpochInfoResponse.encode(message).finish(),
    };
  },
};
