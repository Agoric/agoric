//@ts-nocheck
import {
  PageRequest,
  type PageRequestSDKType,
  PageResponse,
  type PageResponseSDKType,
} from '../../cosmos/base/query/v1beta1/pagination.js';
import {
  HostZone,
  type HostZoneSDKType,
  DelegationRecord,
  type DelegationRecordSDKType,
  UnbondingRecord,
  type UnbondingRecordSDKType,
  SlashRecord,
  type SlashRecordSDKType,
  RedemptionRecord,
  type RedemptionRecordSDKType,
} from './stakedym.js';
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { type JsonSafe } from '../../json-safe.js';
import { isSet } from '../../helpers.js';
/** Host Zone */
export interface QueryHostZoneRequest {}
export interface QueryHostZoneRequestProtoMsg {
  typeUrl: '/stride.stakedym.QueryHostZoneRequest';
  value: Uint8Array;
}
/** Host Zone */
export interface QueryHostZoneRequestSDKType {}
export interface QueryHostZoneResponse {
  hostZone?: HostZone;
}
export interface QueryHostZoneResponseProtoMsg {
  typeUrl: '/stride.stakedym.QueryHostZoneResponse';
  value: Uint8Array;
}
export interface QueryHostZoneResponseSDKType {
  host_zone?: HostZoneSDKType;
}
/** All Delegation Records */
export interface QueryDelegationRecordsRequest {
  includeArchived: boolean;
}
export interface QueryDelegationRecordsRequestProtoMsg {
  typeUrl: '/stride.stakedym.QueryDelegationRecordsRequest';
  value: Uint8Array;
}
/** All Delegation Records */
export interface QueryDelegationRecordsRequestSDKType {
  include_archived: boolean;
}
export interface QueryDelegationRecordsResponse {
  delegationRecords: DelegationRecord[];
}
export interface QueryDelegationRecordsResponseProtoMsg {
  typeUrl: '/stride.stakedym.QueryDelegationRecordsResponse';
  value: Uint8Array;
}
export interface QueryDelegationRecordsResponseSDKType {
  delegation_records: DelegationRecordSDKType[];
}
/** All Unbonding Records */
export interface QueryUnbondingRecordsRequest {
  includeArchived: boolean;
}
export interface QueryUnbondingRecordsRequestProtoMsg {
  typeUrl: '/stride.stakedym.QueryUnbondingRecordsRequest';
  value: Uint8Array;
}
/** All Unbonding Records */
export interface QueryUnbondingRecordsRequestSDKType {
  include_archived: boolean;
}
export interface QueryUnbondingRecordsResponse {
  unbondingRecords: UnbondingRecord[];
}
export interface QueryUnbondingRecordsResponseProtoMsg {
  typeUrl: '/stride.stakedym.QueryUnbondingRecordsResponse';
  value: Uint8Array;
}
export interface QueryUnbondingRecordsResponseSDKType {
  unbonding_records: UnbondingRecordSDKType[];
}
/** Single Redemption Record */
export interface QueryRedemptionRecordRequest {
  unbondingRecordId: bigint;
  address: string;
}
export interface QueryRedemptionRecordRequestProtoMsg {
  typeUrl: '/stride.stakedym.QueryRedemptionRecordRequest';
  value: Uint8Array;
}
/** Single Redemption Record */
export interface QueryRedemptionRecordRequestSDKType {
  unbonding_record_id: bigint;
  address: string;
}
export interface QueryRedemptionRecordResponse {
  redemptionRecordResponse?: RedemptionRecordResponse;
}
export interface QueryRedemptionRecordResponseProtoMsg {
  typeUrl: '/stride.stakedym.QueryRedemptionRecordResponse';
  value: Uint8Array;
}
export interface QueryRedemptionRecordResponseSDKType {
  redemption_record_response?: RedemptionRecordResponseSDKType;
}
/** All Redemption Records */
export interface QueryRedemptionRecordsRequest {
  address: string;
  unbondingRecordId: bigint;
  pagination?: PageRequest;
}
export interface QueryRedemptionRecordsRequestProtoMsg {
  typeUrl: '/stride.stakedym.QueryRedemptionRecordsRequest';
  value: Uint8Array;
}
/** All Redemption Records */
export interface QueryRedemptionRecordsRequestSDKType {
  address: string;
  unbonding_record_id: bigint;
  pagination?: PageRequestSDKType;
}
export interface QueryRedemptionRecordsResponse {
  redemptionRecordResponses: RedemptionRecordResponse[];
  pagination?: PageResponse;
}
export interface QueryRedemptionRecordsResponseProtoMsg {
  typeUrl: '/stride.stakedym.QueryRedemptionRecordsResponse';
  value: Uint8Array;
}
export interface QueryRedemptionRecordsResponseSDKType {
  redemption_record_responses: RedemptionRecordResponseSDKType[];
  pagination?: PageResponseSDKType;
}
/** All Slash Records */
export interface QuerySlashRecordsRequest {}
export interface QuerySlashRecordsRequestProtoMsg {
  typeUrl: '/stride.stakedym.QuerySlashRecordsRequest';
  value: Uint8Array;
}
/** All Slash Records */
export interface QuerySlashRecordsRequestSDKType {}
export interface QuerySlashRecordsResponse {
  slashRecords: SlashRecord[];
}
export interface QuerySlashRecordsResponseProtoMsg {
  typeUrl: '/stride.stakedym.QuerySlashRecordsResponse';
  value: Uint8Array;
}
export interface QuerySlashRecordsResponseSDKType {
  slash_records: SlashRecordSDKType[];
}
/** Data structure for frontend to consume */
export interface RedemptionRecordResponse {
  /** Redemption record */
  redemptionRecord?: RedemptionRecord;
  /**
   * The Unix timestamp (in seconds) at which the unbonding for the UR
   * associated with this RR completes
   */
  unbondingCompletionTimeSeconds: bigint;
}
export interface RedemptionRecordResponseProtoMsg {
  typeUrl: '/stride.stakedym.RedemptionRecordResponse';
  value: Uint8Array;
}
/** Data structure for frontend to consume */
export interface RedemptionRecordResponseSDKType {
  redemption_record?: RedemptionRecordSDKType;
  unbonding_completion_time_seconds: bigint;
}
function createBaseQueryHostZoneRequest(): QueryHostZoneRequest {
  return {};
}
export const QueryHostZoneRequest = {
  typeUrl: '/stride.stakedym.QueryHostZoneRequest',
  encode(
    _: QueryHostZoneRequest,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryHostZoneRequest {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryHostZoneRequest();
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
  fromJSON(_: any): QueryHostZoneRequest {
    return {};
  },
  toJSON(_: QueryHostZoneRequest): JsonSafe<QueryHostZoneRequest> {
    const obj: any = {};
    return obj;
  },
  fromPartial(_: Partial<QueryHostZoneRequest>): QueryHostZoneRequest {
    const message = createBaseQueryHostZoneRequest();
    return message;
  },
  fromProtoMsg(message: QueryHostZoneRequestProtoMsg): QueryHostZoneRequest {
    return QueryHostZoneRequest.decode(message.value);
  },
  toProto(message: QueryHostZoneRequest): Uint8Array {
    return QueryHostZoneRequest.encode(message).finish();
  },
  toProtoMsg(message: QueryHostZoneRequest): QueryHostZoneRequestProtoMsg {
    return {
      typeUrl: '/stride.stakedym.QueryHostZoneRequest',
      value: QueryHostZoneRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryHostZoneResponse(): QueryHostZoneResponse {
  return {
    hostZone: undefined,
  };
}
export const QueryHostZoneResponse = {
  typeUrl: '/stride.stakedym.QueryHostZoneResponse',
  encode(
    message: QueryHostZoneResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.hostZone !== undefined) {
      HostZone.encode(message.hostZone, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryHostZoneResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryHostZoneResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.hostZone = HostZone.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryHostZoneResponse {
    return {
      hostZone: isSet(object.hostZone)
        ? HostZone.fromJSON(object.hostZone)
        : undefined,
    };
  },
  toJSON(message: QueryHostZoneResponse): JsonSafe<QueryHostZoneResponse> {
    const obj: any = {};
    message.hostZone !== undefined &&
      (obj.hostZone = message.hostZone
        ? HostZone.toJSON(message.hostZone)
        : undefined);
    return obj;
  },
  fromPartial(object: Partial<QueryHostZoneResponse>): QueryHostZoneResponse {
    const message = createBaseQueryHostZoneResponse();
    message.hostZone =
      object.hostZone !== undefined && object.hostZone !== null
        ? HostZone.fromPartial(object.hostZone)
        : undefined;
    return message;
  },
  fromProtoMsg(message: QueryHostZoneResponseProtoMsg): QueryHostZoneResponse {
    return QueryHostZoneResponse.decode(message.value);
  },
  toProto(message: QueryHostZoneResponse): Uint8Array {
    return QueryHostZoneResponse.encode(message).finish();
  },
  toProtoMsg(message: QueryHostZoneResponse): QueryHostZoneResponseProtoMsg {
    return {
      typeUrl: '/stride.stakedym.QueryHostZoneResponse',
      value: QueryHostZoneResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryDelegationRecordsRequest(): QueryDelegationRecordsRequest {
  return {
    includeArchived: false,
  };
}
export const QueryDelegationRecordsRequest = {
  typeUrl: '/stride.stakedym.QueryDelegationRecordsRequest',
  encode(
    message: QueryDelegationRecordsRequest,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.includeArchived === true) {
      writer.uint32(8).bool(message.includeArchived);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryDelegationRecordsRequest {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryDelegationRecordsRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.includeArchived = reader.bool();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryDelegationRecordsRequest {
    return {
      includeArchived: isSet(object.includeArchived)
        ? Boolean(object.includeArchived)
        : false,
    };
  },
  toJSON(
    message: QueryDelegationRecordsRequest,
  ): JsonSafe<QueryDelegationRecordsRequest> {
    const obj: any = {};
    message.includeArchived !== undefined &&
      (obj.includeArchived = message.includeArchived);
    return obj;
  },
  fromPartial(
    object: Partial<QueryDelegationRecordsRequest>,
  ): QueryDelegationRecordsRequest {
    const message = createBaseQueryDelegationRecordsRequest();
    message.includeArchived = object.includeArchived ?? false;
    return message;
  },
  fromProtoMsg(
    message: QueryDelegationRecordsRequestProtoMsg,
  ): QueryDelegationRecordsRequest {
    return QueryDelegationRecordsRequest.decode(message.value);
  },
  toProto(message: QueryDelegationRecordsRequest): Uint8Array {
    return QueryDelegationRecordsRequest.encode(message).finish();
  },
  toProtoMsg(
    message: QueryDelegationRecordsRequest,
  ): QueryDelegationRecordsRequestProtoMsg {
    return {
      typeUrl: '/stride.stakedym.QueryDelegationRecordsRequest',
      value: QueryDelegationRecordsRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryDelegationRecordsResponse(): QueryDelegationRecordsResponse {
  return {
    delegationRecords: [],
  };
}
export const QueryDelegationRecordsResponse = {
  typeUrl: '/stride.stakedym.QueryDelegationRecordsResponse',
  encode(
    message: QueryDelegationRecordsResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    for (const v of message.delegationRecords) {
      DelegationRecord.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryDelegationRecordsResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryDelegationRecordsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.delegationRecords.push(
            DelegationRecord.decode(reader, reader.uint32()),
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryDelegationRecordsResponse {
    return {
      delegationRecords: Array.isArray(object?.delegationRecords)
        ? object.delegationRecords.map((e: any) => DelegationRecord.fromJSON(e))
        : [],
    };
  },
  toJSON(
    message: QueryDelegationRecordsResponse,
  ): JsonSafe<QueryDelegationRecordsResponse> {
    const obj: any = {};
    if (message.delegationRecords) {
      obj.delegationRecords = message.delegationRecords.map(e =>
        e ? DelegationRecord.toJSON(e) : undefined,
      );
    } else {
      obj.delegationRecords = [];
    }
    return obj;
  },
  fromPartial(
    object: Partial<QueryDelegationRecordsResponse>,
  ): QueryDelegationRecordsResponse {
    const message = createBaseQueryDelegationRecordsResponse();
    message.delegationRecords =
      object.delegationRecords?.map(e => DelegationRecord.fromPartial(e)) || [];
    return message;
  },
  fromProtoMsg(
    message: QueryDelegationRecordsResponseProtoMsg,
  ): QueryDelegationRecordsResponse {
    return QueryDelegationRecordsResponse.decode(message.value);
  },
  toProto(message: QueryDelegationRecordsResponse): Uint8Array {
    return QueryDelegationRecordsResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QueryDelegationRecordsResponse,
  ): QueryDelegationRecordsResponseProtoMsg {
    return {
      typeUrl: '/stride.stakedym.QueryDelegationRecordsResponse',
      value: QueryDelegationRecordsResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryUnbondingRecordsRequest(): QueryUnbondingRecordsRequest {
  return {
    includeArchived: false,
  };
}
export const QueryUnbondingRecordsRequest = {
  typeUrl: '/stride.stakedym.QueryUnbondingRecordsRequest',
  encode(
    message: QueryUnbondingRecordsRequest,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.includeArchived === true) {
      writer.uint32(8).bool(message.includeArchived);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryUnbondingRecordsRequest {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryUnbondingRecordsRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.includeArchived = reader.bool();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryUnbondingRecordsRequest {
    return {
      includeArchived: isSet(object.includeArchived)
        ? Boolean(object.includeArchived)
        : false,
    };
  },
  toJSON(
    message: QueryUnbondingRecordsRequest,
  ): JsonSafe<QueryUnbondingRecordsRequest> {
    const obj: any = {};
    message.includeArchived !== undefined &&
      (obj.includeArchived = message.includeArchived);
    return obj;
  },
  fromPartial(
    object: Partial<QueryUnbondingRecordsRequest>,
  ): QueryUnbondingRecordsRequest {
    const message = createBaseQueryUnbondingRecordsRequest();
    message.includeArchived = object.includeArchived ?? false;
    return message;
  },
  fromProtoMsg(
    message: QueryUnbondingRecordsRequestProtoMsg,
  ): QueryUnbondingRecordsRequest {
    return QueryUnbondingRecordsRequest.decode(message.value);
  },
  toProto(message: QueryUnbondingRecordsRequest): Uint8Array {
    return QueryUnbondingRecordsRequest.encode(message).finish();
  },
  toProtoMsg(
    message: QueryUnbondingRecordsRequest,
  ): QueryUnbondingRecordsRequestProtoMsg {
    return {
      typeUrl: '/stride.stakedym.QueryUnbondingRecordsRequest',
      value: QueryUnbondingRecordsRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryUnbondingRecordsResponse(): QueryUnbondingRecordsResponse {
  return {
    unbondingRecords: [],
  };
}
export const QueryUnbondingRecordsResponse = {
  typeUrl: '/stride.stakedym.QueryUnbondingRecordsResponse',
  encode(
    message: QueryUnbondingRecordsResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    for (const v of message.unbondingRecords) {
      UnbondingRecord.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryUnbondingRecordsResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryUnbondingRecordsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.unbondingRecords.push(
            UnbondingRecord.decode(reader, reader.uint32()),
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryUnbondingRecordsResponse {
    return {
      unbondingRecords: Array.isArray(object?.unbondingRecords)
        ? object.unbondingRecords.map((e: any) => UnbondingRecord.fromJSON(e))
        : [],
    };
  },
  toJSON(
    message: QueryUnbondingRecordsResponse,
  ): JsonSafe<QueryUnbondingRecordsResponse> {
    const obj: any = {};
    if (message.unbondingRecords) {
      obj.unbondingRecords = message.unbondingRecords.map(e =>
        e ? UnbondingRecord.toJSON(e) : undefined,
      );
    } else {
      obj.unbondingRecords = [];
    }
    return obj;
  },
  fromPartial(
    object: Partial<QueryUnbondingRecordsResponse>,
  ): QueryUnbondingRecordsResponse {
    const message = createBaseQueryUnbondingRecordsResponse();
    message.unbondingRecords =
      object.unbondingRecords?.map(e => UnbondingRecord.fromPartial(e)) || [];
    return message;
  },
  fromProtoMsg(
    message: QueryUnbondingRecordsResponseProtoMsg,
  ): QueryUnbondingRecordsResponse {
    return QueryUnbondingRecordsResponse.decode(message.value);
  },
  toProto(message: QueryUnbondingRecordsResponse): Uint8Array {
    return QueryUnbondingRecordsResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QueryUnbondingRecordsResponse,
  ): QueryUnbondingRecordsResponseProtoMsg {
    return {
      typeUrl: '/stride.stakedym.QueryUnbondingRecordsResponse',
      value: QueryUnbondingRecordsResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryRedemptionRecordRequest(): QueryRedemptionRecordRequest {
  return {
    unbondingRecordId: BigInt(0),
    address: '',
  };
}
export const QueryRedemptionRecordRequest = {
  typeUrl: '/stride.stakedym.QueryRedemptionRecordRequest',
  encode(
    message: QueryRedemptionRecordRequest,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.unbondingRecordId !== BigInt(0)) {
      writer.uint32(8).uint64(message.unbondingRecordId);
    }
    if (message.address !== '') {
      writer.uint32(18).string(message.address);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryRedemptionRecordRequest {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryRedemptionRecordRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.unbondingRecordId = reader.uint64();
          break;
        case 2:
          message.address = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryRedemptionRecordRequest {
    return {
      unbondingRecordId: isSet(object.unbondingRecordId)
        ? BigInt(object.unbondingRecordId.toString())
        : BigInt(0),
      address: isSet(object.address) ? String(object.address) : '',
    };
  },
  toJSON(
    message: QueryRedemptionRecordRequest,
  ): JsonSafe<QueryRedemptionRecordRequest> {
    const obj: any = {};
    message.unbondingRecordId !== undefined &&
      (obj.unbondingRecordId = (
        message.unbondingRecordId || BigInt(0)
      ).toString());
    message.address !== undefined && (obj.address = message.address);
    return obj;
  },
  fromPartial(
    object: Partial<QueryRedemptionRecordRequest>,
  ): QueryRedemptionRecordRequest {
    const message = createBaseQueryRedemptionRecordRequest();
    message.unbondingRecordId =
      object.unbondingRecordId !== undefined &&
      object.unbondingRecordId !== null
        ? BigInt(object.unbondingRecordId.toString())
        : BigInt(0);
    message.address = object.address ?? '';
    return message;
  },
  fromProtoMsg(
    message: QueryRedemptionRecordRequestProtoMsg,
  ): QueryRedemptionRecordRequest {
    return QueryRedemptionRecordRequest.decode(message.value);
  },
  toProto(message: QueryRedemptionRecordRequest): Uint8Array {
    return QueryRedemptionRecordRequest.encode(message).finish();
  },
  toProtoMsg(
    message: QueryRedemptionRecordRequest,
  ): QueryRedemptionRecordRequestProtoMsg {
    return {
      typeUrl: '/stride.stakedym.QueryRedemptionRecordRequest',
      value: QueryRedemptionRecordRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryRedemptionRecordResponse(): QueryRedemptionRecordResponse {
  return {
    redemptionRecordResponse: undefined,
  };
}
export const QueryRedemptionRecordResponse = {
  typeUrl: '/stride.stakedym.QueryRedemptionRecordResponse',
  encode(
    message: QueryRedemptionRecordResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.redemptionRecordResponse !== undefined) {
      RedemptionRecordResponse.encode(
        message.redemptionRecordResponse,
        writer.uint32(10).fork(),
      ).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryRedemptionRecordResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryRedemptionRecordResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.redemptionRecordResponse = RedemptionRecordResponse.decode(
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
  fromJSON(object: any): QueryRedemptionRecordResponse {
    return {
      redemptionRecordResponse: isSet(object.redemptionRecordResponse)
        ? RedemptionRecordResponse.fromJSON(object.redemptionRecordResponse)
        : undefined,
    };
  },
  toJSON(
    message: QueryRedemptionRecordResponse,
  ): JsonSafe<QueryRedemptionRecordResponse> {
    const obj: any = {};
    message.redemptionRecordResponse !== undefined &&
      (obj.redemptionRecordResponse = message.redemptionRecordResponse
        ? RedemptionRecordResponse.toJSON(message.redemptionRecordResponse)
        : undefined);
    return obj;
  },
  fromPartial(
    object: Partial<QueryRedemptionRecordResponse>,
  ): QueryRedemptionRecordResponse {
    const message = createBaseQueryRedemptionRecordResponse();
    message.redemptionRecordResponse =
      object.redemptionRecordResponse !== undefined &&
      object.redemptionRecordResponse !== null
        ? RedemptionRecordResponse.fromPartial(object.redemptionRecordResponse)
        : undefined;
    return message;
  },
  fromProtoMsg(
    message: QueryRedemptionRecordResponseProtoMsg,
  ): QueryRedemptionRecordResponse {
    return QueryRedemptionRecordResponse.decode(message.value);
  },
  toProto(message: QueryRedemptionRecordResponse): Uint8Array {
    return QueryRedemptionRecordResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QueryRedemptionRecordResponse,
  ): QueryRedemptionRecordResponseProtoMsg {
    return {
      typeUrl: '/stride.stakedym.QueryRedemptionRecordResponse',
      value: QueryRedemptionRecordResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryRedemptionRecordsRequest(): QueryRedemptionRecordsRequest {
  return {
    address: '',
    unbondingRecordId: BigInt(0),
    pagination: undefined,
  };
}
export const QueryRedemptionRecordsRequest = {
  typeUrl: '/stride.stakedym.QueryRedemptionRecordsRequest',
  encode(
    message: QueryRedemptionRecordsRequest,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.address !== '') {
      writer.uint32(10).string(message.address);
    }
    if (message.unbondingRecordId !== BigInt(0)) {
      writer.uint32(16).uint64(message.unbondingRecordId);
    }
    if (message.pagination !== undefined) {
      PageRequest.encode(message.pagination, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryRedemptionRecordsRequest {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryRedemptionRecordsRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.address = reader.string();
          break;
        case 2:
          message.unbondingRecordId = reader.uint64();
          break;
        case 3:
          message.pagination = PageRequest.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryRedemptionRecordsRequest {
    return {
      address: isSet(object.address) ? String(object.address) : '',
      unbondingRecordId: isSet(object.unbondingRecordId)
        ? BigInt(object.unbondingRecordId.toString())
        : BigInt(0),
      pagination: isSet(object.pagination)
        ? PageRequest.fromJSON(object.pagination)
        : undefined,
    };
  },
  toJSON(
    message: QueryRedemptionRecordsRequest,
  ): JsonSafe<QueryRedemptionRecordsRequest> {
    const obj: any = {};
    message.address !== undefined && (obj.address = message.address);
    message.unbondingRecordId !== undefined &&
      (obj.unbondingRecordId = (
        message.unbondingRecordId || BigInt(0)
      ).toString());
    message.pagination !== undefined &&
      (obj.pagination = message.pagination
        ? PageRequest.toJSON(message.pagination)
        : undefined);
    return obj;
  },
  fromPartial(
    object: Partial<QueryRedemptionRecordsRequest>,
  ): QueryRedemptionRecordsRequest {
    const message = createBaseQueryRedemptionRecordsRequest();
    message.address = object.address ?? '';
    message.unbondingRecordId =
      object.unbondingRecordId !== undefined &&
      object.unbondingRecordId !== null
        ? BigInt(object.unbondingRecordId.toString())
        : BigInt(0);
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageRequest.fromPartial(object.pagination)
        : undefined;
    return message;
  },
  fromProtoMsg(
    message: QueryRedemptionRecordsRequestProtoMsg,
  ): QueryRedemptionRecordsRequest {
    return QueryRedemptionRecordsRequest.decode(message.value);
  },
  toProto(message: QueryRedemptionRecordsRequest): Uint8Array {
    return QueryRedemptionRecordsRequest.encode(message).finish();
  },
  toProtoMsg(
    message: QueryRedemptionRecordsRequest,
  ): QueryRedemptionRecordsRequestProtoMsg {
    return {
      typeUrl: '/stride.stakedym.QueryRedemptionRecordsRequest',
      value: QueryRedemptionRecordsRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryRedemptionRecordsResponse(): QueryRedemptionRecordsResponse {
  return {
    redemptionRecordResponses: [],
    pagination: undefined,
  };
}
export const QueryRedemptionRecordsResponse = {
  typeUrl: '/stride.stakedym.QueryRedemptionRecordsResponse',
  encode(
    message: QueryRedemptionRecordsResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    for (const v of message.redemptionRecordResponses) {
      RedemptionRecordResponse.encode(v!, writer.uint32(10).fork()).ldelim();
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
  ): QueryRedemptionRecordsResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryRedemptionRecordsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.redemptionRecordResponses.push(
            RedemptionRecordResponse.decode(reader, reader.uint32()),
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
  fromJSON(object: any): QueryRedemptionRecordsResponse {
    return {
      redemptionRecordResponses: Array.isArray(
        object?.redemptionRecordResponses,
      )
        ? object.redemptionRecordResponses.map((e: any) =>
            RedemptionRecordResponse.fromJSON(e),
          )
        : [],
      pagination: isSet(object.pagination)
        ? PageResponse.fromJSON(object.pagination)
        : undefined,
    };
  },
  toJSON(
    message: QueryRedemptionRecordsResponse,
  ): JsonSafe<QueryRedemptionRecordsResponse> {
    const obj: any = {};
    if (message.redemptionRecordResponses) {
      obj.redemptionRecordResponses = message.redemptionRecordResponses.map(
        e => (e ? RedemptionRecordResponse.toJSON(e) : undefined),
      );
    } else {
      obj.redemptionRecordResponses = [];
    }
    message.pagination !== undefined &&
      (obj.pagination = message.pagination
        ? PageResponse.toJSON(message.pagination)
        : undefined);
    return obj;
  },
  fromPartial(
    object: Partial<QueryRedemptionRecordsResponse>,
  ): QueryRedemptionRecordsResponse {
    const message = createBaseQueryRedemptionRecordsResponse();
    message.redemptionRecordResponses =
      object.redemptionRecordResponses?.map(e =>
        RedemptionRecordResponse.fromPartial(e),
      ) || [];
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageResponse.fromPartial(object.pagination)
        : undefined;
    return message;
  },
  fromProtoMsg(
    message: QueryRedemptionRecordsResponseProtoMsg,
  ): QueryRedemptionRecordsResponse {
    return QueryRedemptionRecordsResponse.decode(message.value);
  },
  toProto(message: QueryRedemptionRecordsResponse): Uint8Array {
    return QueryRedemptionRecordsResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QueryRedemptionRecordsResponse,
  ): QueryRedemptionRecordsResponseProtoMsg {
    return {
      typeUrl: '/stride.stakedym.QueryRedemptionRecordsResponse',
      value: QueryRedemptionRecordsResponse.encode(message).finish(),
    };
  },
};
function createBaseQuerySlashRecordsRequest(): QuerySlashRecordsRequest {
  return {};
}
export const QuerySlashRecordsRequest = {
  typeUrl: '/stride.stakedym.QuerySlashRecordsRequest',
  encode(
    _: QuerySlashRecordsRequest,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QuerySlashRecordsRequest {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQuerySlashRecordsRequest();
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
  fromJSON(_: any): QuerySlashRecordsRequest {
    return {};
  },
  toJSON(_: QuerySlashRecordsRequest): JsonSafe<QuerySlashRecordsRequest> {
    const obj: any = {};
    return obj;
  },
  fromPartial(_: Partial<QuerySlashRecordsRequest>): QuerySlashRecordsRequest {
    const message = createBaseQuerySlashRecordsRequest();
    return message;
  },
  fromProtoMsg(
    message: QuerySlashRecordsRequestProtoMsg,
  ): QuerySlashRecordsRequest {
    return QuerySlashRecordsRequest.decode(message.value);
  },
  toProto(message: QuerySlashRecordsRequest): Uint8Array {
    return QuerySlashRecordsRequest.encode(message).finish();
  },
  toProtoMsg(
    message: QuerySlashRecordsRequest,
  ): QuerySlashRecordsRequestProtoMsg {
    return {
      typeUrl: '/stride.stakedym.QuerySlashRecordsRequest',
      value: QuerySlashRecordsRequest.encode(message).finish(),
    };
  },
};
function createBaseQuerySlashRecordsResponse(): QuerySlashRecordsResponse {
  return {
    slashRecords: [],
  };
}
export const QuerySlashRecordsResponse = {
  typeUrl: '/stride.stakedym.QuerySlashRecordsResponse',
  encode(
    message: QuerySlashRecordsResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    for (const v of message.slashRecords) {
      SlashRecord.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QuerySlashRecordsResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQuerySlashRecordsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.slashRecords.push(
            SlashRecord.decode(reader, reader.uint32()),
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QuerySlashRecordsResponse {
    return {
      slashRecords: Array.isArray(object?.slashRecords)
        ? object.slashRecords.map((e: any) => SlashRecord.fromJSON(e))
        : [],
    };
  },
  toJSON(
    message: QuerySlashRecordsResponse,
  ): JsonSafe<QuerySlashRecordsResponse> {
    const obj: any = {};
    if (message.slashRecords) {
      obj.slashRecords = message.slashRecords.map(e =>
        e ? SlashRecord.toJSON(e) : undefined,
      );
    } else {
      obj.slashRecords = [];
    }
    return obj;
  },
  fromPartial(
    object: Partial<QuerySlashRecordsResponse>,
  ): QuerySlashRecordsResponse {
    const message = createBaseQuerySlashRecordsResponse();
    message.slashRecords =
      object.slashRecords?.map(e => SlashRecord.fromPartial(e)) || [];
    return message;
  },
  fromProtoMsg(
    message: QuerySlashRecordsResponseProtoMsg,
  ): QuerySlashRecordsResponse {
    return QuerySlashRecordsResponse.decode(message.value);
  },
  toProto(message: QuerySlashRecordsResponse): Uint8Array {
    return QuerySlashRecordsResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QuerySlashRecordsResponse,
  ): QuerySlashRecordsResponseProtoMsg {
    return {
      typeUrl: '/stride.stakedym.QuerySlashRecordsResponse',
      value: QuerySlashRecordsResponse.encode(message).finish(),
    };
  },
};
function createBaseRedemptionRecordResponse(): RedemptionRecordResponse {
  return {
    redemptionRecord: undefined,
    unbondingCompletionTimeSeconds: BigInt(0),
  };
}
export const RedemptionRecordResponse = {
  typeUrl: '/stride.stakedym.RedemptionRecordResponse',
  encode(
    message: RedemptionRecordResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.redemptionRecord !== undefined) {
      RedemptionRecord.encode(
        message.redemptionRecord,
        writer.uint32(10).fork(),
      ).ldelim();
    }
    if (message.unbondingCompletionTimeSeconds !== BigInt(0)) {
      writer.uint32(16).uint64(message.unbondingCompletionTimeSeconds);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): RedemptionRecordResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRedemptionRecordResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.redemptionRecord = RedemptionRecord.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 2:
          message.unbondingCompletionTimeSeconds = reader.uint64();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): RedemptionRecordResponse {
    return {
      redemptionRecord: isSet(object.redemptionRecord)
        ? RedemptionRecord.fromJSON(object.redemptionRecord)
        : undefined,
      unbondingCompletionTimeSeconds: isSet(
        object.unbondingCompletionTimeSeconds,
      )
        ? BigInt(object.unbondingCompletionTimeSeconds.toString())
        : BigInt(0),
    };
  },
  toJSON(
    message: RedemptionRecordResponse,
  ): JsonSafe<RedemptionRecordResponse> {
    const obj: any = {};
    message.redemptionRecord !== undefined &&
      (obj.redemptionRecord = message.redemptionRecord
        ? RedemptionRecord.toJSON(message.redemptionRecord)
        : undefined);
    message.unbondingCompletionTimeSeconds !== undefined &&
      (obj.unbondingCompletionTimeSeconds = (
        message.unbondingCompletionTimeSeconds || BigInt(0)
      ).toString());
    return obj;
  },
  fromPartial(
    object: Partial<RedemptionRecordResponse>,
  ): RedemptionRecordResponse {
    const message = createBaseRedemptionRecordResponse();
    message.redemptionRecord =
      object.redemptionRecord !== undefined && object.redemptionRecord !== null
        ? RedemptionRecord.fromPartial(object.redemptionRecord)
        : undefined;
    message.unbondingCompletionTimeSeconds =
      object.unbondingCompletionTimeSeconds !== undefined &&
      object.unbondingCompletionTimeSeconds !== null
        ? BigInt(object.unbondingCompletionTimeSeconds.toString())
        : BigInt(0);
    return message;
  },
  fromProtoMsg(
    message: RedemptionRecordResponseProtoMsg,
  ): RedemptionRecordResponse {
    return RedemptionRecordResponse.decode(message.value);
  },
  toProto(message: RedemptionRecordResponse): Uint8Array {
    return RedemptionRecordResponse.encode(message).finish();
  },
  toProtoMsg(
    message: RedemptionRecordResponse,
  ): RedemptionRecordResponseProtoMsg {
    return {
      typeUrl: '/stride.stakedym.RedemptionRecordResponse',
      value: RedemptionRecordResponse.encode(message).finish(),
    };
  },
};
