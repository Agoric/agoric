//@ts-nocheck
import {
  PageRequest,
  type PageRequestSDKType,
  PageResponse,
  type PageResponseSDKType,
} from '../../cosmos/base/query/v1beta1/pagination.js';
import { Params, type ParamsSDKType } from './params.js';
import {
  DepositRecord,
  type DepositRecordSDKType,
  UserRedemptionRecord,
  type UserRedemptionRecordSDKType,
  EpochUnbondingRecord,
  type EpochUnbondingRecordSDKType,
  LSMTokenDeposit,
  type LSMTokenDepositSDKType,
} from './records.js';
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { type JsonSafe } from '../../json-safe.js';
import { isSet } from '../../helpers.js';
/** QueryParamsRequest is request type for the Query/Params RPC method. */
export interface QueryParamsRequest {}
export interface QueryParamsRequestProtoMsg {
  typeUrl: '/stride.records.QueryParamsRequest';
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
  typeUrl: '/stride.records.QueryParamsResponse';
  value: Uint8Array;
}
/** QueryParamsResponse is response type for the Query/Params RPC method. */
export interface QueryParamsResponseSDKType {
  params: ParamsSDKType;
}
export interface QueryGetDepositRecordRequest {
  id: bigint;
}
export interface QueryGetDepositRecordRequestProtoMsg {
  typeUrl: '/stride.records.QueryGetDepositRecordRequest';
  value: Uint8Array;
}
export interface QueryGetDepositRecordRequestSDKType {
  id: bigint;
}
export interface QueryGetDepositRecordResponse {
  depositRecord: DepositRecord;
}
export interface QueryGetDepositRecordResponseProtoMsg {
  typeUrl: '/stride.records.QueryGetDepositRecordResponse';
  value: Uint8Array;
}
export interface QueryGetDepositRecordResponseSDKType {
  deposit_record: DepositRecordSDKType;
}
export interface QueryAllDepositRecordRequest {
  pagination?: PageRequest;
}
export interface QueryAllDepositRecordRequestProtoMsg {
  typeUrl: '/stride.records.QueryAllDepositRecordRequest';
  value: Uint8Array;
}
export interface QueryAllDepositRecordRequestSDKType {
  pagination?: PageRequestSDKType;
}
export interface QueryAllDepositRecordResponse {
  depositRecord: DepositRecord[];
  pagination?: PageResponse;
}
export interface QueryAllDepositRecordResponseProtoMsg {
  typeUrl: '/stride.records.QueryAllDepositRecordResponse';
  value: Uint8Array;
}
export interface QueryAllDepositRecordResponseSDKType {
  deposit_record: DepositRecordSDKType[];
  pagination?: PageResponseSDKType;
}
export interface QueryDepositRecordByHostRequest {
  hostZoneId: string;
}
export interface QueryDepositRecordByHostRequestProtoMsg {
  typeUrl: '/stride.records.QueryDepositRecordByHostRequest';
  value: Uint8Array;
}
export interface QueryDepositRecordByHostRequestSDKType {
  host_zone_id: string;
}
export interface QueryDepositRecordByHostResponse {
  depositRecord: DepositRecord[];
}
export interface QueryDepositRecordByHostResponseProtoMsg {
  typeUrl: '/stride.records.QueryDepositRecordByHostResponse';
  value: Uint8Array;
}
export interface QueryDepositRecordByHostResponseSDKType {
  deposit_record: DepositRecordSDKType[];
}
export interface QueryGetUserRedemptionRecordRequest {
  id: string;
}
export interface QueryGetUserRedemptionRecordRequestProtoMsg {
  typeUrl: '/stride.records.QueryGetUserRedemptionRecordRequest';
  value: Uint8Array;
}
export interface QueryGetUserRedemptionRecordRequestSDKType {
  id: string;
}
export interface QueryGetUserRedemptionRecordResponse {
  userRedemptionRecord: UserRedemptionRecord;
}
export interface QueryGetUserRedemptionRecordResponseProtoMsg {
  typeUrl: '/stride.records.QueryGetUserRedemptionRecordResponse';
  value: Uint8Array;
}
export interface QueryGetUserRedemptionRecordResponseSDKType {
  user_redemption_record: UserRedemptionRecordSDKType;
}
export interface QueryAllUserRedemptionRecordRequest {
  pagination?: PageRequest;
}
export interface QueryAllUserRedemptionRecordRequestProtoMsg {
  typeUrl: '/stride.records.QueryAllUserRedemptionRecordRequest';
  value: Uint8Array;
}
export interface QueryAllUserRedemptionRecordRequestSDKType {
  pagination?: PageRequestSDKType;
}
export interface QueryAllUserRedemptionRecordResponse {
  userRedemptionRecord: UserRedemptionRecord[];
  pagination?: PageResponse;
}
export interface QueryAllUserRedemptionRecordResponseProtoMsg {
  typeUrl: '/stride.records.QueryAllUserRedemptionRecordResponse';
  value: Uint8Array;
}
export interface QueryAllUserRedemptionRecordResponseSDKType {
  user_redemption_record: UserRedemptionRecordSDKType[];
  pagination?: PageResponseSDKType;
}
/** Query UserRedemptionRecords by chainId / userId pair */
export interface QueryAllUserRedemptionRecordForUserRequest {
  chainId: string;
  day: bigint;
  address: string;
  limit: bigint;
  pagination?: PageRequest;
}
export interface QueryAllUserRedemptionRecordForUserRequestProtoMsg {
  typeUrl: '/stride.records.QueryAllUserRedemptionRecordForUserRequest';
  value: Uint8Array;
}
/** Query UserRedemptionRecords by chainId / userId pair */
export interface QueryAllUserRedemptionRecordForUserRequestSDKType {
  chain_id: string;
  day: bigint;
  address: string;
  limit: bigint;
  pagination?: PageRequestSDKType;
}
export interface QueryAllUserRedemptionRecordForUserResponse {
  userRedemptionRecord: UserRedemptionRecord[];
  pagination?: PageResponse;
}
export interface QueryAllUserRedemptionRecordForUserResponseProtoMsg {
  typeUrl: '/stride.records.QueryAllUserRedemptionRecordForUserResponse';
  value: Uint8Array;
}
export interface QueryAllUserRedemptionRecordForUserResponseSDKType {
  user_redemption_record: UserRedemptionRecordSDKType[];
  pagination?: PageResponseSDKType;
}
export interface QueryGetEpochUnbondingRecordRequest {
  epochNumber: bigint;
}
export interface QueryGetEpochUnbondingRecordRequestProtoMsg {
  typeUrl: '/stride.records.QueryGetEpochUnbondingRecordRequest';
  value: Uint8Array;
}
export interface QueryGetEpochUnbondingRecordRequestSDKType {
  epoch_number: bigint;
}
export interface QueryGetEpochUnbondingRecordResponse {
  epochUnbondingRecord: EpochUnbondingRecord;
}
export interface QueryGetEpochUnbondingRecordResponseProtoMsg {
  typeUrl: '/stride.records.QueryGetEpochUnbondingRecordResponse';
  value: Uint8Array;
}
export interface QueryGetEpochUnbondingRecordResponseSDKType {
  epoch_unbonding_record: EpochUnbondingRecordSDKType;
}
export interface QueryAllEpochUnbondingRecordRequest {
  pagination?: PageRequest;
}
export interface QueryAllEpochUnbondingRecordRequestProtoMsg {
  typeUrl: '/stride.records.QueryAllEpochUnbondingRecordRequest';
  value: Uint8Array;
}
export interface QueryAllEpochUnbondingRecordRequestSDKType {
  pagination?: PageRequestSDKType;
}
export interface QueryAllEpochUnbondingRecordResponse {
  epochUnbondingRecord: EpochUnbondingRecord[];
  pagination?: PageResponse;
}
export interface QueryAllEpochUnbondingRecordResponseProtoMsg {
  typeUrl: '/stride.records.QueryAllEpochUnbondingRecordResponse';
  value: Uint8Array;
}
export interface QueryAllEpochUnbondingRecordResponseSDKType {
  epoch_unbonding_record: EpochUnbondingRecordSDKType[];
  pagination?: PageResponseSDKType;
}
export interface QueryLSMDepositRequest {
  chainId: string;
  denom: string;
}
export interface QueryLSMDepositRequestProtoMsg {
  typeUrl: '/stride.records.QueryLSMDepositRequest';
  value: Uint8Array;
}
export interface QueryLSMDepositRequestSDKType {
  chain_id: string;
  denom: string;
}
export interface QueryLSMDepositResponse {
  deposit: LSMTokenDeposit;
}
export interface QueryLSMDepositResponseProtoMsg {
  typeUrl: '/stride.records.QueryLSMDepositResponse';
  value: Uint8Array;
}
export interface QueryLSMDepositResponseSDKType {
  deposit: LSMTokenDepositSDKType;
}
export interface QueryLSMDepositsRequest {
  chainId: string;
  validatorAddress: string;
  status: string;
}
export interface QueryLSMDepositsRequestProtoMsg {
  typeUrl: '/stride.records.QueryLSMDepositsRequest';
  value: Uint8Array;
}
export interface QueryLSMDepositsRequestSDKType {
  chain_id: string;
  validator_address: string;
  status: string;
}
export interface QueryLSMDepositsResponse {
  deposits: LSMTokenDeposit[];
}
export interface QueryLSMDepositsResponseProtoMsg {
  typeUrl: '/stride.records.QueryLSMDepositsResponse';
  value: Uint8Array;
}
export interface QueryLSMDepositsResponseSDKType {
  deposits: LSMTokenDepositSDKType[];
}
function createBaseQueryParamsRequest(): QueryParamsRequest {
  return {};
}
export const QueryParamsRequest = {
  typeUrl: '/stride.records.QueryParamsRequest',
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
      typeUrl: '/stride.records.QueryParamsRequest',
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
  typeUrl: '/stride.records.QueryParamsResponse',
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
      typeUrl: '/stride.records.QueryParamsResponse',
      value: QueryParamsResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryGetDepositRecordRequest(): QueryGetDepositRecordRequest {
  return {
    id: BigInt(0),
  };
}
export const QueryGetDepositRecordRequest = {
  typeUrl: '/stride.records.QueryGetDepositRecordRequest',
  encode(
    message: QueryGetDepositRecordRequest,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.id !== BigInt(0)) {
      writer.uint32(8).uint64(message.id);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryGetDepositRecordRequest {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryGetDepositRecordRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.id = reader.uint64();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryGetDepositRecordRequest {
    return {
      id: isSet(object.id) ? BigInt(object.id.toString()) : BigInt(0),
    };
  },
  toJSON(
    message: QueryGetDepositRecordRequest,
  ): JsonSafe<QueryGetDepositRecordRequest> {
    const obj: any = {};
    message.id !== undefined && (obj.id = (message.id || BigInt(0)).toString());
    return obj;
  },
  fromPartial(
    object: Partial<QueryGetDepositRecordRequest>,
  ): QueryGetDepositRecordRequest {
    const message = createBaseQueryGetDepositRecordRequest();
    message.id =
      object.id !== undefined && object.id !== null
        ? BigInt(object.id.toString())
        : BigInt(0);
    return message;
  },
  fromProtoMsg(
    message: QueryGetDepositRecordRequestProtoMsg,
  ): QueryGetDepositRecordRequest {
    return QueryGetDepositRecordRequest.decode(message.value);
  },
  toProto(message: QueryGetDepositRecordRequest): Uint8Array {
    return QueryGetDepositRecordRequest.encode(message).finish();
  },
  toProtoMsg(
    message: QueryGetDepositRecordRequest,
  ): QueryGetDepositRecordRequestProtoMsg {
    return {
      typeUrl: '/stride.records.QueryGetDepositRecordRequest',
      value: QueryGetDepositRecordRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryGetDepositRecordResponse(): QueryGetDepositRecordResponse {
  return {
    depositRecord: DepositRecord.fromPartial({}),
  };
}
export const QueryGetDepositRecordResponse = {
  typeUrl: '/stride.records.QueryGetDepositRecordResponse',
  encode(
    message: QueryGetDepositRecordResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.depositRecord !== undefined) {
      DepositRecord.encode(
        message.depositRecord,
        writer.uint32(10).fork(),
      ).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryGetDepositRecordResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryGetDepositRecordResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.depositRecord = DepositRecord.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryGetDepositRecordResponse {
    return {
      depositRecord: isSet(object.depositRecord)
        ? DepositRecord.fromJSON(object.depositRecord)
        : undefined,
    };
  },
  toJSON(
    message: QueryGetDepositRecordResponse,
  ): JsonSafe<QueryGetDepositRecordResponse> {
    const obj: any = {};
    message.depositRecord !== undefined &&
      (obj.depositRecord = message.depositRecord
        ? DepositRecord.toJSON(message.depositRecord)
        : undefined);
    return obj;
  },
  fromPartial(
    object: Partial<QueryGetDepositRecordResponse>,
  ): QueryGetDepositRecordResponse {
    const message = createBaseQueryGetDepositRecordResponse();
    message.depositRecord =
      object.depositRecord !== undefined && object.depositRecord !== null
        ? DepositRecord.fromPartial(object.depositRecord)
        : undefined;
    return message;
  },
  fromProtoMsg(
    message: QueryGetDepositRecordResponseProtoMsg,
  ): QueryGetDepositRecordResponse {
    return QueryGetDepositRecordResponse.decode(message.value);
  },
  toProto(message: QueryGetDepositRecordResponse): Uint8Array {
    return QueryGetDepositRecordResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QueryGetDepositRecordResponse,
  ): QueryGetDepositRecordResponseProtoMsg {
    return {
      typeUrl: '/stride.records.QueryGetDepositRecordResponse',
      value: QueryGetDepositRecordResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryAllDepositRecordRequest(): QueryAllDepositRecordRequest {
  return {
    pagination: undefined,
  };
}
export const QueryAllDepositRecordRequest = {
  typeUrl: '/stride.records.QueryAllDepositRecordRequest',
  encode(
    message: QueryAllDepositRecordRequest,
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
  ): QueryAllDepositRecordRequest {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryAllDepositRecordRequest();
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
  fromJSON(object: any): QueryAllDepositRecordRequest {
    return {
      pagination: isSet(object.pagination)
        ? PageRequest.fromJSON(object.pagination)
        : undefined,
    };
  },
  toJSON(
    message: QueryAllDepositRecordRequest,
  ): JsonSafe<QueryAllDepositRecordRequest> {
    const obj: any = {};
    message.pagination !== undefined &&
      (obj.pagination = message.pagination
        ? PageRequest.toJSON(message.pagination)
        : undefined);
    return obj;
  },
  fromPartial(
    object: Partial<QueryAllDepositRecordRequest>,
  ): QueryAllDepositRecordRequest {
    const message = createBaseQueryAllDepositRecordRequest();
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageRequest.fromPartial(object.pagination)
        : undefined;
    return message;
  },
  fromProtoMsg(
    message: QueryAllDepositRecordRequestProtoMsg,
  ): QueryAllDepositRecordRequest {
    return QueryAllDepositRecordRequest.decode(message.value);
  },
  toProto(message: QueryAllDepositRecordRequest): Uint8Array {
    return QueryAllDepositRecordRequest.encode(message).finish();
  },
  toProtoMsg(
    message: QueryAllDepositRecordRequest,
  ): QueryAllDepositRecordRequestProtoMsg {
    return {
      typeUrl: '/stride.records.QueryAllDepositRecordRequest',
      value: QueryAllDepositRecordRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryAllDepositRecordResponse(): QueryAllDepositRecordResponse {
  return {
    depositRecord: [],
    pagination: undefined,
  };
}
export const QueryAllDepositRecordResponse = {
  typeUrl: '/stride.records.QueryAllDepositRecordResponse',
  encode(
    message: QueryAllDepositRecordResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    for (const v of message.depositRecord) {
      DepositRecord.encode(v!, writer.uint32(10).fork()).ldelim();
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
  ): QueryAllDepositRecordResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryAllDepositRecordResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.depositRecord.push(
            DepositRecord.decode(reader, reader.uint32()),
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
  fromJSON(object: any): QueryAllDepositRecordResponse {
    return {
      depositRecord: Array.isArray(object?.depositRecord)
        ? object.depositRecord.map((e: any) => DepositRecord.fromJSON(e))
        : [],
      pagination: isSet(object.pagination)
        ? PageResponse.fromJSON(object.pagination)
        : undefined,
    };
  },
  toJSON(
    message: QueryAllDepositRecordResponse,
  ): JsonSafe<QueryAllDepositRecordResponse> {
    const obj: any = {};
    if (message.depositRecord) {
      obj.depositRecord = message.depositRecord.map(e =>
        e ? DepositRecord.toJSON(e) : undefined,
      );
    } else {
      obj.depositRecord = [];
    }
    message.pagination !== undefined &&
      (obj.pagination = message.pagination
        ? PageResponse.toJSON(message.pagination)
        : undefined);
    return obj;
  },
  fromPartial(
    object: Partial<QueryAllDepositRecordResponse>,
  ): QueryAllDepositRecordResponse {
    const message = createBaseQueryAllDepositRecordResponse();
    message.depositRecord =
      object.depositRecord?.map(e => DepositRecord.fromPartial(e)) || [];
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageResponse.fromPartial(object.pagination)
        : undefined;
    return message;
  },
  fromProtoMsg(
    message: QueryAllDepositRecordResponseProtoMsg,
  ): QueryAllDepositRecordResponse {
    return QueryAllDepositRecordResponse.decode(message.value);
  },
  toProto(message: QueryAllDepositRecordResponse): Uint8Array {
    return QueryAllDepositRecordResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QueryAllDepositRecordResponse,
  ): QueryAllDepositRecordResponseProtoMsg {
    return {
      typeUrl: '/stride.records.QueryAllDepositRecordResponse',
      value: QueryAllDepositRecordResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryDepositRecordByHostRequest(): QueryDepositRecordByHostRequest {
  return {
    hostZoneId: '',
  };
}
export const QueryDepositRecordByHostRequest = {
  typeUrl: '/stride.records.QueryDepositRecordByHostRequest',
  encode(
    message: QueryDepositRecordByHostRequest,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.hostZoneId !== '') {
      writer.uint32(10).string(message.hostZoneId);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryDepositRecordByHostRequest {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryDepositRecordByHostRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.hostZoneId = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryDepositRecordByHostRequest {
    return {
      hostZoneId: isSet(object.hostZoneId) ? String(object.hostZoneId) : '',
    };
  },
  toJSON(
    message: QueryDepositRecordByHostRequest,
  ): JsonSafe<QueryDepositRecordByHostRequest> {
    const obj: any = {};
    message.hostZoneId !== undefined && (obj.hostZoneId = message.hostZoneId);
    return obj;
  },
  fromPartial(
    object: Partial<QueryDepositRecordByHostRequest>,
  ): QueryDepositRecordByHostRequest {
    const message = createBaseQueryDepositRecordByHostRequest();
    message.hostZoneId = object.hostZoneId ?? '';
    return message;
  },
  fromProtoMsg(
    message: QueryDepositRecordByHostRequestProtoMsg,
  ): QueryDepositRecordByHostRequest {
    return QueryDepositRecordByHostRequest.decode(message.value);
  },
  toProto(message: QueryDepositRecordByHostRequest): Uint8Array {
    return QueryDepositRecordByHostRequest.encode(message).finish();
  },
  toProtoMsg(
    message: QueryDepositRecordByHostRequest,
  ): QueryDepositRecordByHostRequestProtoMsg {
    return {
      typeUrl: '/stride.records.QueryDepositRecordByHostRequest',
      value: QueryDepositRecordByHostRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryDepositRecordByHostResponse(): QueryDepositRecordByHostResponse {
  return {
    depositRecord: [],
  };
}
export const QueryDepositRecordByHostResponse = {
  typeUrl: '/stride.records.QueryDepositRecordByHostResponse',
  encode(
    message: QueryDepositRecordByHostResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    for (const v of message.depositRecord) {
      DepositRecord.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryDepositRecordByHostResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryDepositRecordByHostResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.depositRecord.push(
            DepositRecord.decode(reader, reader.uint32()),
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryDepositRecordByHostResponse {
    return {
      depositRecord: Array.isArray(object?.depositRecord)
        ? object.depositRecord.map((e: any) => DepositRecord.fromJSON(e))
        : [],
    };
  },
  toJSON(
    message: QueryDepositRecordByHostResponse,
  ): JsonSafe<QueryDepositRecordByHostResponse> {
    const obj: any = {};
    if (message.depositRecord) {
      obj.depositRecord = message.depositRecord.map(e =>
        e ? DepositRecord.toJSON(e) : undefined,
      );
    } else {
      obj.depositRecord = [];
    }
    return obj;
  },
  fromPartial(
    object: Partial<QueryDepositRecordByHostResponse>,
  ): QueryDepositRecordByHostResponse {
    const message = createBaseQueryDepositRecordByHostResponse();
    message.depositRecord =
      object.depositRecord?.map(e => DepositRecord.fromPartial(e)) || [];
    return message;
  },
  fromProtoMsg(
    message: QueryDepositRecordByHostResponseProtoMsg,
  ): QueryDepositRecordByHostResponse {
    return QueryDepositRecordByHostResponse.decode(message.value);
  },
  toProto(message: QueryDepositRecordByHostResponse): Uint8Array {
    return QueryDepositRecordByHostResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QueryDepositRecordByHostResponse,
  ): QueryDepositRecordByHostResponseProtoMsg {
    return {
      typeUrl: '/stride.records.QueryDepositRecordByHostResponse',
      value: QueryDepositRecordByHostResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryGetUserRedemptionRecordRequest(): QueryGetUserRedemptionRecordRequest {
  return {
    id: '',
  };
}
export const QueryGetUserRedemptionRecordRequest = {
  typeUrl: '/stride.records.QueryGetUserRedemptionRecordRequest',
  encode(
    message: QueryGetUserRedemptionRecordRequest,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.id !== '') {
      writer.uint32(10).string(message.id);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryGetUserRedemptionRecordRequest {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryGetUserRedemptionRecordRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.id = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryGetUserRedemptionRecordRequest {
    return {
      id: isSet(object.id) ? String(object.id) : '',
    };
  },
  toJSON(
    message: QueryGetUserRedemptionRecordRequest,
  ): JsonSafe<QueryGetUserRedemptionRecordRequest> {
    const obj: any = {};
    message.id !== undefined && (obj.id = message.id);
    return obj;
  },
  fromPartial(
    object: Partial<QueryGetUserRedemptionRecordRequest>,
  ): QueryGetUserRedemptionRecordRequest {
    const message = createBaseQueryGetUserRedemptionRecordRequest();
    message.id = object.id ?? '';
    return message;
  },
  fromProtoMsg(
    message: QueryGetUserRedemptionRecordRequestProtoMsg,
  ): QueryGetUserRedemptionRecordRequest {
    return QueryGetUserRedemptionRecordRequest.decode(message.value);
  },
  toProto(message: QueryGetUserRedemptionRecordRequest): Uint8Array {
    return QueryGetUserRedemptionRecordRequest.encode(message).finish();
  },
  toProtoMsg(
    message: QueryGetUserRedemptionRecordRequest,
  ): QueryGetUserRedemptionRecordRequestProtoMsg {
    return {
      typeUrl: '/stride.records.QueryGetUserRedemptionRecordRequest',
      value: QueryGetUserRedemptionRecordRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryGetUserRedemptionRecordResponse(): QueryGetUserRedemptionRecordResponse {
  return {
    userRedemptionRecord: UserRedemptionRecord.fromPartial({}),
  };
}
export const QueryGetUserRedemptionRecordResponse = {
  typeUrl: '/stride.records.QueryGetUserRedemptionRecordResponse',
  encode(
    message: QueryGetUserRedemptionRecordResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.userRedemptionRecord !== undefined) {
      UserRedemptionRecord.encode(
        message.userRedemptionRecord,
        writer.uint32(10).fork(),
      ).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryGetUserRedemptionRecordResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryGetUserRedemptionRecordResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.userRedemptionRecord = UserRedemptionRecord.decode(
            reader,
            reader.uint32(),
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryGetUserRedemptionRecordResponse {
    return {
      userRedemptionRecord: isSet(object.userRedemptionRecord)
        ? UserRedemptionRecord.fromJSON(object.userRedemptionRecord)
        : undefined,
    };
  },
  toJSON(
    message: QueryGetUserRedemptionRecordResponse,
  ): JsonSafe<QueryGetUserRedemptionRecordResponse> {
    const obj: any = {};
    message.userRedemptionRecord !== undefined &&
      (obj.userRedemptionRecord = message.userRedemptionRecord
        ? UserRedemptionRecord.toJSON(message.userRedemptionRecord)
        : undefined);
    return obj;
  },
  fromPartial(
    object: Partial<QueryGetUserRedemptionRecordResponse>,
  ): QueryGetUserRedemptionRecordResponse {
    const message = createBaseQueryGetUserRedemptionRecordResponse();
    message.userRedemptionRecord =
      object.userRedemptionRecord !== undefined &&
      object.userRedemptionRecord !== null
        ? UserRedemptionRecord.fromPartial(object.userRedemptionRecord)
        : undefined;
    return message;
  },
  fromProtoMsg(
    message: QueryGetUserRedemptionRecordResponseProtoMsg,
  ): QueryGetUserRedemptionRecordResponse {
    return QueryGetUserRedemptionRecordResponse.decode(message.value);
  },
  toProto(message: QueryGetUserRedemptionRecordResponse): Uint8Array {
    return QueryGetUserRedemptionRecordResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QueryGetUserRedemptionRecordResponse,
  ): QueryGetUserRedemptionRecordResponseProtoMsg {
    return {
      typeUrl: '/stride.records.QueryGetUserRedemptionRecordResponse',
      value: QueryGetUserRedemptionRecordResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryAllUserRedemptionRecordRequest(): QueryAllUserRedemptionRecordRequest {
  return {
    pagination: undefined,
  };
}
export const QueryAllUserRedemptionRecordRequest = {
  typeUrl: '/stride.records.QueryAllUserRedemptionRecordRequest',
  encode(
    message: QueryAllUserRedemptionRecordRequest,
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
  ): QueryAllUserRedemptionRecordRequest {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryAllUserRedemptionRecordRequest();
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
  fromJSON(object: any): QueryAllUserRedemptionRecordRequest {
    return {
      pagination: isSet(object.pagination)
        ? PageRequest.fromJSON(object.pagination)
        : undefined,
    };
  },
  toJSON(
    message: QueryAllUserRedemptionRecordRequest,
  ): JsonSafe<QueryAllUserRedemptionRecordRequest> {
    const obj: any = {};
    message.pagination !== undefined &&
      (obj.pagination = message.pagination
        ? PageRequest.toJSON(message.pagination)
        : undefined);
    return obj;
  },
  fromPartial(
    object: Partial<QueryAllUserRedemptionRecordRequest>,
  ): QueryAllUserRedemptionRecordRequest {
    const message = createBaseQueryAllUserRedemptionRecordRequest();
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageRequest.fromPartial(object.pagination)
        : undefined;
    return message;
  },
  fromProtoMsg(
    message: QueryAllUserRedemptionRecordRequestProtoMsg,
  ): QueryAllUserRedemptionRecordRequest {
    return QueryAllUserRedemptionRecordRequest.decode(message.value);
  },
  toProto(message: QueryAllUserRedemptionRecordRequest): Uint8Array {
    return QueryAllUserRedemptionRecordRequest.encode(message).finish();
  },
  toProtoMsg(
    message: QueryAllUserRedemptionRecordRequest,
  ): QueryAllUserRedemptionRecordRequestProtoMsg {
    return {
      typeUrl: '/stride.records.QueryAllUserRedemptionRecordRequest',
      value: QueryAllUserRedemptionRecordRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryAllUserRedemptionRecordResponse(): QueryAllUserRedemptionRecordResponse {
  return {
    userRedemptionRecord: [],
    pagination: undefined,
  };
}
export const QueryAllUserRedemptionRecordResponse = {
  typeUrl: '/stride.records.QueryAllUserRedemptionRecordResponse',
  encode(
    message: QueryAllUserRedemptionRecordResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    for (const v of message.userRedemptionRecord) {
      UserRedemptionRecord.encode(v!, writer.uint32(10).fork()).ldelim();
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
  ): QueryAllUserRedemptionRecordResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryAllUserRedemptionRecordResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.userRedemptionRecord.push(
            UserRedemptionRecord.decode(reader, reader.uint32()),
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
  fromJSON(object: any): QueryAllUserRedemptionRecordResponse {
    return {
      userRedemptionRecord: Array.isArray(object?.userRedemptionRecord)
        ? object.userRedemptionRecord.map((e: any) =>
            UserRedemptionRecord.fromJSON(e),
          )
        : [],
      pagination: isSet(object.pagination)
        ? PageResponse.fromJSON(object.pagination)
        : undefined,
    };
  },
  toJSON(
    message: QueryAllUserRedemptionRecordResponse,
  ): JsonSafe<QueryAllUserRedemptionRecordResponse> {
    const obj: any = {};
    if (message.userRedemptionRecord) {
      obj.userRedemptionRecord = message.userRedemptionRecord.map(e =>
        e ? UserRedemptionRecord.toJSON(e) : undefined,
      );
    } else {
      obj.userRedemptionRecord = [];
    }
    message.pagination !== undefined &&
      (obj.pagination = message.pagination
        ? PageResponse.toJSON(message.pagination)
        : undefined);
    return obj;
  },
  fromPartial(
    object: Partial<QueryAllUserRedemptionRecordResponse>,
  ): QueryAllUserRedemptionRecordResponse {
    const message = createBaseQueryAllUserRedemptionRecordResponse();
    message.userRedemptionRecord =
      object.userRedemptionRecord?.map(e =>
        UserRedemptionRecord.fromPartial(e),
      ) || [];
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageResponse.fromPartial(object.pagination)
        : undefined;
    return message;
  },
  fromProtoMsg(
    message: QueryAllUserRedemptionRecordResponseProtoMsg,
  ): QueryAllUserRedemptionRecordResponse {
    return QueryAllUserRedemptionRecordResponse.decode(message.value);
  },
  toProto(message: QueryAllUserRedemptionRecordResponse): Uint8Array {
    return QueryAllUserRedemptionRecordResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QueryAllUserRedemptionRecordResponse,
  ): QueryAllUserRedemptionRecordResponseProtoMsg {
    return {
      typeUrl: '/stride.records.QueryAllUserRedemptionRecordResponse',
      value: QueryAllUserRedemptionRecordResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryAllUserRedemptionRecordForUserRequest(): QueryAllUserRedemptionRecordForUserRequest {
  return {
    chainId: '',
    day: BigInt(0),
    address: '',
    limit: BigInt(0),
    pagination: undefined,
  };
}
export const QueryAllUserRedemptionRecordForUserRequest = {
  typeUrl: '/stride.records.QueryAllUserRedemptionRecordForUserRequest',
  encode(
    message: QueryAllUserRedemptionRecordForUserRequest,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.chainId !== '') {
      writer.uint32(10).string(message.chainId);
    }
    if (message.day !== BigInt(0)) {
      writer.uint32(16).uint64(message.day);
    }
    if (message.address !== '') {
      writer.uint32(26).string(message.address);
    }
    if (message.limit !== BigInt(0)) {
      writer.uint32(32).uint64(message.limit);
    }
    if (message.pagination !== undefined) {
      PageRequest.encode(message.pagination, writer.uint32(42).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryAllUserRedemptionRecordForUserRequest {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryAllUserRedemptionRecordForUserRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.chainId = reader.string();
          break;
        case 2:
          message.day = reader.uint64();
          break;
        case 3:
          message.address = reader.string();
          break;
        case 4:
          message.limit = reader.uint64();
          break;
        case 5:
          message.pagination = PageRequest.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryAllUserRedemptionRecordForUserRequest {
    return {
      chainId: isSet(object.chainId) ? String(object.chainId) : '',
      day: isSet(object.day) ? BigInt(object.day.toString()) : BigInt(0),
      address: isSet(object.address) ? String(object.address) : '',
      limit: isSet(object.limit) ? BigInt(object.limit.toString()) : BigInt(0),
      pagination: isSet(object.pagination)
        ? PageRequest.fromJSON(object.pagination)
        : undefined,
    };
  },
  toJSON(
    message: QueryAllUserRedemptionRecordForUserRequest,
  ): JsonSafe<QueryAllUserRedemptionRecordForUserRequest> {
    const obj: any = {};
    message.chainId !== undefined && (obj.chainId = message.chainId);
    message.day !== undefined &&
      (obj.day = (message.day || BigInt(0)).toString());
    message.address !== undefined && (obj.address = message.address);
    message.limit !== undefined &&
      (obj.limit = (message.limit || BigInt(0)).toString());
    message.pagination !== undefined &&
      (obj.pagination = message.pagination
        ? PageRequest.toJSON(message.pagination)
        : undefined);
    return obj;
  },
  fromPartial(
    object: Partial<QueryAllUserRedemptionRecordForUserRequest>,
  ): QueryAllUserRedemptionRecordForUserRequest {
    const message = createBaseQueryAllUserRedemptionRecordForUserRequest();
    message.chainId = object.chainId ?? '';
    message.day =
      object.day !== undefined && object.day !== null
        ? BigInt(object.day.toString())
        : BigInt(0);
    message.address = object.address ?? '';
    message.limit =
      object.limit !== undefined && object.limit !== null
        ? BigInt(object.limit.toString())
        : BigInt(0);
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageRequest.fromPartial(object.pagination)
        : undefined;
    return message;
  },
  fromProtoMsg(
    message: QueryAllUserRedemptionRecordForUserRequestProtoMsg,
  ): QueryAllUserRedemptionRecordForUserRequest {
    return QueryAllUserRedemptionRecordForUserRequest.decode(message.value);
  },
  toProto(message: QueryAllUserRedemptionRecordForUserRequest): Uint8Array {
    return QueryAllUserRedemptionRecordForUserRequest.encode(message).finish();
  },
  toProtoMsg(
    message: QueryAllUserRedemptionRecordForUserRequest,
  ): QueryAllUserRedemptionRecordForUserRequestProtoMsg {
    return {
      typeUrl: '/stride.records.QueryAllUserRedemptionRecordForUserRequest',
      value:
        QueryAllUserRedemptionRecordForUserRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryAllUserRedemptionRecordForUserResponse(): QueryAllUserRedemptionRecordForUserResponse {
  return {
    userRedemptionRecord: [],
    pagination: undefined,
  };
}
export const QueryAllUserRedemptionRecordForUserResponse = {
  typeUrl: '/stride.records.QueryAllUserRedemptionRecordForUserResponse',
  encode(
    message: QueryAllUserRedemptionRecordForUserResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    for (const v of message.userRedemptionRecord) {
      UserRedemptionRecord.encode(v!, writer.uint32(10).fork()).ldelim();
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
  ): QueryAllUserRedemptionRecordForUserResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryAllUserRedemptionRecordForUserResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.userRedemptionRecord.push(
            UserRedemptionRecord.decode(reader, reader.uint32()),
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
  fromJSON(object: any): QueryAllUserRedemptionRecordForUserResponse {
    return {
      userRedemptionRecord: Array.isArray(object?.userRedemptionRecord)
        ? object.userRedemptionRecord.map((e: any) =>
            UserRedemptionRecord.fromJSON(e),
          )
        : [],
      pagination: isSet(object.pagination)
        ? PageResponse.fromJSON(object.pagination)
        : undefined,
    };
  },
  toJSON(
    message: QueryAllUserRedemptionRecordForUserResponse,
  ): JsonSafe<QueryAllUserRedemptionRecordForUserResponse> {
    const obj: any = {};
    if (message.userRedemptionRecord) {
      obj.userRedemptionRecord = message.userRedemptionRecord.map(e =>
        e ? UserRedemptionRecord.toJSON(e) : undefined,
      );
    } else {
      obj.userRedemptionRecord = [];
    }
    message.pagination !== undefined &&
      (obj.pagination = message.pagination
        ? PageResponse.toJSON(message.pagination)
        : undefined);
    return obj;
  },
  fromPartial(
    object: Partial<QueryAllUserRedemptionRecordForUserResponse>,
  ): QueryAllUserRedemptionRecordForUserResponse {
    const message = createBaseQueryAllUserRedemptionRecordForUserResponse();
    message.userRedemptionRecord =
      object.userRedemptionRecord?.map(e =>
        UserRedemptionRecord.fromPartial(e),
      ) || [];
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageResponse.fromPartial(object.pagination)
        : undefined;
    return message;
  },
  fromProtoMsg(
    message: QueryAllUserRedemptionRecordForUserResponseProtoMsg,
  ): QueryAllUserRedemptionRecordForUserResponse {
    return QueryAllUserRedemptionRecordForUserResponse.decode(message.value);
  },
  toProto(message: QueryAllUserRedemptionRecordForUserResponse): Uint8Array {
    return QueryAllUserRedemptionRecordForUserResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QueryAllUserRedemptionRecordForUserResponse,
  ): QueryAllUserRedemptionRecordForUserResponseProtoMsg {
    return {
      typeUrl: '/stride.records.QueryAllUserRedemptionRecordForUserResponse',
      value:
        QueryAllUserRedemptionRecordForUserResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryGetEpochUnbondingRecordRequest(): QueryGetEpochUnbondingRecordRequest {
  return {
    epochNumber: BigInt(0),
  };
}
export const QueryGetEpochUnbondingRecordRequest = {
  typeUrl: '/stride.records.QueryGetEpochUnbondingRecordRequest',
  encode(
    message: QueryGetEpochUnbondingRecordRequest,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.epochNumber !== BigInt(0)) {
      writer.uint32(8).uint64(message.epochNumber);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryGetEpochUnbondingRecordRequest {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryGetEpochUnbondingRecordRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.epochNumber = reader.uint64();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryGetEpochUnbondingRecordRequest {
    return {
      epochNumber: isSet(object.epochNumber)
        ? BigInt(object.epochNumber.toString())
        : BigInt(0),
    };
  },
  toJSON(
    message: QueryGetEpochUnbondingRecordRequest,
  ): JsonSafe<QueryGetEpochUnbondingRecordRequest> {
    const obj: any = {};
    message.epochNumber !== undefined &&
      (obj.epochNumber = (message.epochNumber || BigInt(0)).toString());
    return obj;
  },
  fromPartial(
    object: Partial<QueryGetEpochUnbondingRecordRequest>,
  ): QueryGetEpochUnbondingRecordRequest {
    const message = createBaseQueryGetEpochUnbondingRecordRequest();
    message.epochNumber =
      object.epochNumber !== undefined && object.epochNumber !== null
        ? BigInt(object.epochNumber.toString())
        : BigInt(0);
    return message;
  },
  fromProtoMsg(
    message: QueryGetEpochUnbondingRecordRequestProtoMsg,
  ): QueryGetEpochUnbondingRecordRequest {
    return QueryGetEpochUnbondingRecordRequest.decode(message.value);
  },
  toProto(message: QueryGetEpochUnbondingRecordRequest): Uint8Array {
    return QueryGetEpochUnbondingRecordRequest.encode(message).finish();
  },
  toProtoMsg(
    message: QueryGetEpochUnbondingRecordRequest,
  ): QueryGetEpochUnbondingRecordRequestProtoMsg {
    return {
      typeUrl: '/stride.records.QueryGetEpochUnbondingRecordRequest',
      value: QueryGetEpochUnbondingRecordRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryGetEpochUnbondingRecordResponse(): QueryGetEpochUnbondingRecordResponse {
  return {
    epochUnbondingRecord: EpochUnbondingRecord.fromPartial({}),
  };
}
export const QueryGetEpochUnbondingRecordResponse = {
  typeUrl: '/stride.records.QueryGetEpochUnbondingRecordResponse',
  encode(
    message: QueryGetEpochUnbondingRecordResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.epochUnbondingRecord !== undefined) {
      EpochUnbondingRecord.encode(
        message.epochUnbondingRecord,
        writer.uint32(10).fork(),
      ).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryGetEpochUnbondingRecordResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryGetEpochUnbondingRecordResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.epochUnbondingRecord = EpochUnbondingRecord.decode(
            reader,
            reader.uint32(),
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryGetEpochUnbondingRecordResponse {
    return {
      epochUnbondingRecord: isSet(object.epochUnbondingRecord)
        ? EpochUnbondingRecord.fromJSON(object.epochUnbondingRecord)
        : undefined,
    };
  },
  toJSON(
    message: QueryGetEpochUnbondingRecordResponse,
  ): JsonSafe<QueryGetEpochUnbondingRecordResponse> {
    const obj: any = {};
    message.epochUnbondingRecord !== undefined &&
      (obj.epochUnbondingRecord = message.epochUnbondingRecord
        ? EpochUnbondingRecord.toJSON(message.epochUnbondingRecord)
        : undefined);
    return obj;
  },
  fromPartial(
    object: Partial<QueryGetEpochUnbondingRecordResponse>,
  ): QueryGetEpochUnbondingRecordResponse {
    const message = createBaseQueryGetEpochUnbondingRecordResponse();
    message.epochUnbondingRecord =
      object.epochUnbondingRecord !== undefined &&
      object.epochUnbondingRecord !== null
        ? EpochUnbondingRecord.fromPartial(object.epochUnbondingRecord)
        : undefined;
    return message;
  },
  fromProtoMsg(
    message: QueryGetEpochUnbondingRecordResponseProtoMsg,
  ): QueryGetEpochUnbondingRecordResponse {
    return QueryGetEpochUnbondingRecordResponse.decode(message.value);
  },
  toProto(message: QueryGetEpochUnbondingRecordResponse): Uint8Array {
    return QueryGetEpochUnbondingRecordResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QueryGetEpochUnbondingRecordResponse,
  ): QueryGetEpochUnbondingRecordResponseProtoMsg {
    return {
      typeUrl: '/stride.records.QueryGetEpochUnbondingRecordResponse',
      value: QueryGetEpochUnbondingRecordResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryAllEpochUnbondingRecordRequest(): QueryAllEpochUnbondingRecordRequest {
  return {
    pagination: undefined,
  };
}
export const QueryAllEpochUnbondingRecordRequest = {
  typeUrl: '/stride.records.QueryAllEpochUnbondingRecordRequest',
  encode(
    message: QueryAllEpochUnbondingRecordRequest,
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
  ): QueryAllEpochUnbondingRecordRequest {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryAllEpochUnbondingRecordRequest();
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
  fromJSON(object: any): QueryAllEpochUnbondingRecordRequest {
    return {
      pagination: isSet(object.pagination)
        ? PageRequest.fromJSON(object.pagination)
        : undefined,
    };
  },
  toJSON(
    message: QueryAllEpochUnbondingRecordRequest,
  ): JsonSafe<QueryAllEpochUnbondingRecordRequest> {
    const obj: any = {};
    message.pagination !== undefined &&
      (obj.pagination = message.pagination
        ? PageRequest.toJSON(message.pagination)
        : undefined);
    return obj;
  },
  fromPartial(
    object: Partial<QueryAllEpochUnbondingRecordRequest>,
  ): QueryAllEpochUnbondingRecordRequest {
    const message = createBaseQueryAllEpochUnbondingRecordRequest();
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageRequest.fromPartial(object.pagination)
        : undefined;
    return message;
  },
  fromProtoMsg(
    message: QueryAllEpochUnbondingRecordRequestProtoMsg,
  ): QueryAllEpochUnbondingRecordRequest {
    return QueryAllEpochUnbondingRecordRequest.decode(message.value);
  },
  toProto(message: QueryAllEpochUnbondingRecordRequest): Uint8Array {
    return QueryAllEpochUnbondingRecordRequest.encode(message).finish();
  },
  toProtoMsg(
    message: QueryAllEpochUnbondingRecordRequest,
  ): QueryAllEpochUnbondingRecordRequestProtoMsg {
    return {
      typeUrl: '/stride.records.QueryAllEpochUnbondingRecordRequest',
      value: QueryAllEpochUnbondingRecordRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryAllEpochUnbondingRecordResponse(): QueryAllEpochUnbondingRecordResponse {
  return {
    epochUnbondingRecord: [],
    pagination: undefined,
  };
}
export const QueryAllEpochUnbondingRecordResponse = {
  typeUrl: '/stride.records.QueryAllEpochUnbondingRecordResponse',
  encode(
    message: QueryAllEpochUnbondingRecordResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    for (const v of message.epochUnbondingRecord) {
      EpochUnbondingRecord.encode(v!, writer.uint32(10).fork()).ldelim();
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
  ): QueryAllEpochUnbondingRecordResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryAllEpochUnbondingRecordResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.epochUnbondingRecord.push(
            EpochUnbondingRecord.decode(reader, reader.uint32()),
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
  fromJSON(object: any): QueryAllEpochUnbondingRecordResponse {
    return {
      epochUnbondingRecord: Array.isArray(object?.epochUnbondingRecord)
        ? object.epochUnbondingRecord.map((e: any) =>
            EpochUnbondingRecord.fromJSON(e),
          )
        : [],
      pagination: isSet(object.pagination)
        ? PageResponse.fromJSON(object.pagination)
        : undefined,
    };
  },
  toJSON(
    message: QueryAllEpochUnbondingRecordResponse,
  ): JsonSafe<QueryAllEpochUnbondingRecordResponse> {
    const obj: any = {};
    if (message.epochUnbondingRecord) {
      obj.epochUnbondingRecord = message.epochUnbondingRecord.map(e =>
        e ? EpochUnbondingRecord.toJSON(e) : undefined,
      );
    } else {
      obj.epochUnbondingRecord = [];
    }
    message.pagination !== undefined &&
      (obj.pagination = message.pagination
        ? PageResponse.toJSON(message.pagination)
        : undefined);
    return obj;
  },
  fromPartial(
    object: Partial<QueryAllEpochUnbondingRecordResponse>,
  ): QueryAllEpochUnbondingRecordResponse {
    const message = createBaseQueryAllEpochUnbondingRecordResponse();
    message.epochUnbondingRecord =
      object.epochUnbondingRecord?.map(e =>
        EpochUnbondingRecord.fromPartial(e),
      ) || [];
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageResponse.fromPartial(object.pagination)
        : undefined;
    return message;
  },
  fromProtoMsg(
    message: QueryAllEpochUnbondingRecordResponseProtoMsg,
  ): QueryAllEpochUnbondingRecordResponse {
    return QueryAllEpochUnbondingRecordResponse.decode(message.value);
  },
  toProto(message: QueryAllEpochUnbondingRecordResponse): Uint8Array {
    return QueryAllEpochUnbondingRecordResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QueryAllEpochUnbondingRecordResponse,
  ): QueryAllEpochUnbondingRecordResponseProtoMsg {
    return {
      typeUrl: '/stride.records.QueryAllEpochUnbondingRecordResponse',
      value: QueryAllEpochUnbondingRecordResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryLSMDepositRequest(): QueryLSMDepositRequest {
  return {
    chainId: '',
    denom: '',
  };
}
export const QueryLSMDepositRequest = {
  typeUrl: '/stride.records.QueryLSMDepositRequest',
  encode(
    message: QueryLSMDepositRequest,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.chainId !== '') {
      writer.uint32(10).string(message.chainId);
    }
    if (message.denom !== '') {
      writer.uint32(18).string(message.denom);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryLSMDepositRequest {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryLSMDepositRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.chainId = reader.string();
          break;
        case 2:
          message.denom = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryLSMDepositRequest {
    return {
      chainId: isSet(object.chainId) ? String(object.chainId) : '',
      denom: isSet(object.denom) ? String(object.denom) : '',
    };
  },
  toJSON(message: QueryLSMDepositRequest): JsonSafe<QueryLSMDepositRequest> {
    const obj: any = {};
    message.chainId !== undefined && (obj.chainId = message.chainId);
    message.denom !== undefined && (obj.denom = message.denom);
    return obj;
  },
  fromPartial(object: Partial<QueryLSMDepositRequest>): QueryLSMDepositRequest {
    const message = createBaseQueryLSMDepositRequest();
    message.chainId = object.chainId ?? '';
    message.denom = object.denom ?? '';
    return message;
  },
  fromProtoMsg(
    message: QueryLSMDepositRequestProtoMsg,
  ): QueryLSMDepositRequest {
    return QueryLSMDepositRequest.decode(message.value);
  },
  toProto(message: QueryLSMDepositRequest): Uint8Array {
    return QueryLSMDepositRequest.encode(message).finish();
  },
  toProtoMsg(message: QueryLSMDepositRequest): QueryLSMDepositRequestProtoMsg {
    return {
      typeUrl: '/stride.records.QueryLSMDepositRequest',
      value: QueryLSMDepositRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryLSMDepositResponse(): QueryLSMDepositResponse {
  return {
    deposit: LSMTokenDeposit.fromPartial({}),
  };
}
export const QueryLSMDepositResponse = {
  typeUrl: '/stride.records.QueryLSMDepositResponse',
  encode(
    message: QueryLSMDepositResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.deposit !== undefined) {
      LSMTokenDeposit.encode(
        message.deposit,
        writer.uint32(10).fork(),
      ).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryLSMDepositResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryLSMDepositResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.deposit = LSMTokenDeposit.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryLSMDepositResponse {
    return {
      deposit: isSet(object.deposit)
        ? LSMTokenDeposit.fromJSON(object.deposit)
        : undefined,
    };
  },
  toJSON(message: QueryLSMDepositResponse): JsonSafe<QueryLSMDepositResponse> {
    const obj: any = {};
    message.deposit !== undefined &&
      (obj.deposit = message.deposit
        ? LSMTokenDeposit.toJSON(message.deposit)
        : undefined);
    return obj;
  },
  fromPartial(
    object: Partial<QueryLSMDepositResponse>,
  ): QueryLSMDepositResponse {
    const message = createBaseQueryLSMDepositResponse();
    message.deposit =
      object.deposit !== undefined && object.deposit !== null
        ? LSMTokenDeposit.fromPartial(object.deposit)
        : undefined;
    return message;
  },
  fromProtoMsg(
    message: QueryLSMDepositResponseProtoMsg,
  ): QueryLSMDepositResponse {
    return QueryLSMDepositResponse.decode(message.value);
  },
  toProto(message: QueryLSMDepositResponse): Uint8Array {
    return QueryLSMDepositResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QueryLSMDepositResponse,
  ): QueryLSMDepositResponseProtoMsg {
    return {
      typeUrl: '/stride.records.QueryLSMDepositResponse',
      value: QueryLSMDepositResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryLSMDepositsRequest(): QueryLSMDepositsRequest {
  return {
    chainId: '',
    validatorAddress: '',
    status: '',
  };
}
export const QueryLSMDepositsRequest = {
  typeUrl: '/stride.records.QueryLSMDepositsRequest',
  encode(
    message: QueryLSMDepositsRequest,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.chainId !== '') {
      writer.uint32(10).string(message.chainId);
    }
    if (message.validatorAddress !== '') {
      writer.uint32(18).string(message.validatorAddress);
    }
    if (message.status !== '') {
      writer.uint32(26).string(message.status);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryLSMDepositsRequest {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryLSMDepositsRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.chainId = reader.string();
          break;
        case 2:
          message.validatorAddress = reader.string();
          break;
        case 3:
          message.status = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryLSMDepositsRequest {
    return {
      chainId: isSet(object.chainId) ? String(object.chainId) : '',
      validatorAddress: isSet(object.validatorAddress)
        ? String(object.validatorAddress)
        : '',
      status: isSet(object.status) ? String(object.status) : '',
    };
  },
  toJSON(message: QueryLSMDepositsRequest): JsonSafe<QueryLSMDepositsRequest> {
    const obj: any = {};
    message.chainId !== undefined && (obj.chainId = message.chainId);
    message.validatorAddress !== undefined &&
      (obj.validatorAddress = message.validatorAddress);
    message.status !== undefined && (obj.status = message.status);
    return obj;
  },
  fromPartial(
    object: Partial<QueryLSMDepositsRequest>,
  ): QueryLSMDepositsRequest {
    const message = createBaseQueryLSMDepositsRequest();
    message.chainId = object.chainId ?? '';
    message.validatorAddress = object.validatorAddress ?? '';
    message.status = object.status ?? '';
    return message;
  },
  fromProtoMsg(
    message: QueryLSMDepositsRequestProtoMsg,
  ): QueryLSMDepositsRequest {
    return QueryLSMDepositsRequest.decode(message.value);
  },
  toProto(message: QueryLSMDepositsRequest): Uint8Array {
    return QueryLSMDepositsRequest.encode(message).finish();
  },
  toProtoMsg(
    message: QueryLSMDepositsRequest,
  ): QueryLSMDepositsRequestProtoMsg {
    return {
      typeUrl: '/stride.records.QueryLSMDepositsRequest',
      value: QueryLSMDepositsRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryLSMDepositsResponse(): QueryLSMDepositsResponse {
  return {
    deposits: [],
  };
}
export const QueryLSMDepositsResponse = {
  typeUrl: '/stride.records.QueryLSMDepositsResponse',
  encode(
    message: QueryLSMDepositsResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    for (const v of message.deposits) {
      LSMTokenDeposit.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryLSMDepositsResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryLSMDepositsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.deposits.push(
            LSMTokenDeposit.decode(reader, reader.uint32()),
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryLSMDepositsResponse {
    return {
      deposits: Array.isArray(object?.deposits)
        ? object.deposits.map((e: any) => LSMTokenDeposit.fromJSON(e))
        : [],
    };
  },
  toJSON(
    message: QueryLSMDepositsResponse,
  ): JsonSafe<QueryLSMDepositsResponse> {
    const obj: any = {};
    if (message.deposits) {
      obj.deposits = message.deposits.map(e =>
        e ? LSMTokenDeposit.toJSON(e) : undefined,
      );
    } else {
      obj.deposits = [];
    }
    return obj;
  },
  fromPartial(
    object: Partial<QueryLSMDepositsResponse>,
  ): QueryLSMDepositsResponse {
    const message = createBaseQueryLSMDepositsResponse();
    message.deposits =
      object.deposits?.map(e => LSMTokenDeposit.fromPartial(e)) || [];
    return message;
  },
  fromProtoMsg(
    message: QueryLSMDepositsResponseProtoMsg,
  ): QueryLSMDepositsResponse {
    return QueryLSMDepositsResponse.decode(message.value);
  },
  toProto(message: QueryLSMDepositsResponse): Uint8Array {
    return QueryLSMDepositsResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QueryLSMDepositsResponse,
  ): QueryLSMDepositsResponseProtoMsg {
    return {
      typeUrl: '/stride.records.QueryLSMDepositsResponse',
      value: QueryLSMDepositsResponse.encode(message).finish(),
    };
  },
};
