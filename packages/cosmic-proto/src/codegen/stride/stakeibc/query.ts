//@ts-nocheck
import {
  PageRequest,
  type PageRequestSDKType,
  PageResponse,
  type PageResponseSDKType,
} from '../../cosmos/base/query/v1beta1/pagination.js';
import { Params, type ParamsSDKType } from './params.js';
import { Validator, type ValidatorSDKType } from './validator.js';
import { HostZone, type HostZoneSDKType } from './host_zone.js';
import { EpochTracker, type EpochTrackerSDKType } from './epoch_tracker.js';
import {
  AddressUnbonding,
  type AddressUnbondingSDKType,
} from './address_unbonding.js';
import { TradeRoute, type TradeRouteSDKType } from './trade_route.js';
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { isSet } from '../../helpers.js';
import { type JsonSafe } from '../../json-safe.js';
/**
 * QueryInterchainAccountFromAddressRequest is the request type for the
 * Query/InterchainAccountAddress RPC
 */
export interface QueryInterchainAccountFromAddressRequest {
  owner: string;
  connectionId: string;
}
export interface QueryInterchainAccountFromAddressRequestProtoMsg {
  typeUrl: '/stride.stakeibc.QueryInterchainAccountFromAddressRequest';
  value: Uint8Array;
}
/**
 * QueryInterchainAccountFromAddressRequest is the request type for the
 * Query/InterchainAccountAddress RPC
 */
export interface QueryInterchainAccountFromAddressRequestSDKType {
  owner: string;
  connection_id: string;
}
/**
 * QueryInterchainAccountFromAddressResponse the response type for the
 * Query/InterchainAccountAddress RPC
 */
export interface QueryInterchainAccountFromAddressResponse {
  interchainAccountAddress: string;
}
export interface QueryInterchainAccountFromAddressResponseProtoMsg {
  typeUrl: '/stride.stakeibc.QueryInterchainAccountFromAddressResponse';
  value: Uint8Array;
}
/**
 * QueryInterchainAccountFromAddressResponse the response type for the
 * Query/InterchainAccountAddress RPC
 */
export interface QueryInterchainAccountFromAddressResponseSDKType {
  interchain_account_address: string;
}
/** QueryParamsRequest is request type for the Query/Params RPC method. */
export interface QueryParamsRequest {}
export interface QueryParamsRequestProtoMsg {
  typeUrl: '/stride.stakeibc.QueryParamsRequest';
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
  typeUrl: '/stride.stakeibc.QueryParamsResponse';
  value: Uint8Array;
}
/** QueryParamsResponse is response type for the Query/Params RPC method. */
export interface QueryParamsResponseSDKType {
  params: ParamsSDKType;
}
export interface QueryGetValidatorsRequest {
  chainId: string;
}
export interface QueryGetValidatorsRequestProtoMsg {
  typeUrl: '/stride.stakeibc.QueryGetValidatorsRequest';
  value: Uint8Array;
}
export interface QueryGetValidatorsRequestSDKType {
  chain_id: string;
}
export interface QueryGetValidatorsResponse {
  validators: Validator[];
}
export interface QueryGetValidatorsResponseProtoMsg {
  typeUrl: '/stride.stakeibc.QueryGetValidatorsResponse';
  value: Uint8Array;
}
export interface QueryGetValidatorsResponseSDKType {
  validators: ValidatorSDKType[];
}
export interface QueryGetHostZoneRequest {
  chainId: string;
}
export interface QueryGetHostZoneRequestProtoMsg {
  typeUrl: '/stride.stakeibc.QueryGetHostZoneRequest';
  value: Uint8Array;
}
export interface QueryGetHostZoneRequestSDKType {
  chain_id: string;
}
export interface QueryGetHostZoneResponse {
  hostZone: HostZone;
}
export interface QueryGetHostZoneResponseProtoMsg {
  typeUrl: '/stride.stakeibc.QueryGetHostZoneResponse';
  value: Uint8Array;
}
export interface QueryGetHostZoneResponseSDKType {
  host_zone: HostZoneSDKType;
}
export interface QueryAllHostZoneRequest {
  pagination?: PageRequest;
}
export interface QueryAllHostZoneRequestProtoMsg {
  typeUrl: '/stride.stakeibc.QueryAllHostZoneRequest';
  value: Uint8Array;
}
export interface QueryAllHostZoneRequestSDKType {
  pagination?: PageRequestSDKType;
}
export interface QueryAllHostZoneResponse {
  hostZone: HostZone[];
  pagination?: PageResponse;
}
export interface QueryAllHostZoneResponseProtoMsg {
  typeUrl: '/stride.stakeibc.QueryAllHostZoneResponse';
  value: Uint8Array;
}
export interface QueryAllHostZoneResponseSDKType {
  host_zone: HostZoneSDKType[];
  pagination?: PageResponseSDKType;
}
export interface QueryModuleAddressRequest {
  name: string;
}
export interface QueryModuleAddressRequestProtoMsg {
  typeUrl: '/stride.stakeibc.QueryModuleAddressRequest';
  value: Uint8Array;
}
export interface QueryModuleAddressRequestSDKType {
  name: string;
}
export interface QueryModuleAddressResponse {
  addr: string;
}
export interface QueryModuleAddressResponseProtoMsg {
  typeUrl: '/stride.stakeibc.QueryModuleAddressResponse';
  value: Uint8Array;
}
export interface QueryModuleAddressResponseSDKType {
  addr: string;
}
export interface QueryGetEpochTrackerRequest {
  epochIdentifier: string;
}
export interface QueryGetEpochTrackerRequestProtoMsg {
  typeUrl: '/stride.stakeibc.QueryGetEpochTrackerRequest';
  value: Uint8Array;
}
export interface QueryGetEpochTrackerRequestSDKType {
  epoch_identifier: string;
}
export interface QueryGetEpochTrackerResponse {
  epochTracker: EpochTracker;
}
export interface QueryGetEpochTrackerResponseProtoMsg {
  typeUrl: '/stride.stakeibc.QueryGetEpochTrackerResponse';
  value: Uint8Array;
}
export interface QueryGetEpochTrackerResponseSDKType {
  epoch_tracker: EpochTrackerSDKType;
}
export interface QueryAllEpochTrackerRequest {}
export interface QueryAllEpochTrackerRequestProtoMsg {
  typeUrl: '/stride.stakeibc.QueryAllEpochTrackerRequest';
  value: Uint8Array;
}
export interface QueryAllEpochTrackerRequestSDKType {}
export interface QueryAllEpochTrackerResponse {
  epochTracker: EpochTracker[];
}
export interface QueryAllEpochTrackerResponseProtoMsg {
  typeUrl: '/stride.stakeibc.QueryAllEpochTrackerResponse';
  value: Uint8Array;
}
export interface QueryAllEpochTrackerResponseSDKType {
  epoch_tracker: EpochTrackerSDKType[];
}
export interface QueryGetNextPacketSequenceRequest {
  channelId: string;
  portId: string;
}
export interface QueryGetNextPacketSequenceRequestProtoMsg {
  typeUrl: '/stride.stakeibc.QueryGetNextPacketSequenceRequest';
  value: Uint8Array;
}
export interface QueryGetNextPacketSequenceRequestSDKType {
  channel_id: string;
  port_id: string;
}
export interface QueryGetNextPacketSequenceResponse {
  sequence: bigint;
}
export interface QueryGetNextPacketSequenceResponseProtoMsg {
  typeUrl: '/stride.stakeibc.QueryGetNextPacketSequenceResponse';
  value: Uint8Array;
}
export interface QueryGetNextPacketSequenceResponseSDKType {
  sequence: bigint;
}
export interface QueryAddressUnbondings {
  address: string;
}
export interface QueryAddressUnbondingsProtoMsg {
  typeUrl: '/stride.stakeibc.QueryAddressUnbondings';
  value: Uint8Array;
}
export interface QueryAddressUnbondingsSDKType {
  address: string;
}
export interface QueryAddressUnbondingsResponse {
  addressUnbondings: AddressUnbonding[];
}
export interface QueryAddressUnbondingsResponseProtoMsg {
  typeUrl: '/stride.stakeibc.QueryAddressUnbondingsResponse';
  value: Uint8Array;
}
export interface QueryAddressUnbondingsResponseSDKType {
  address_unbondings: AddressUnbondingSDKType[];
}
export interface QueryAllTradeRoutes {}
export interface QueryAllTradeRoutesProtoMsg {
  typeUrl: '/stride.stakeibc.QueryAllTradeRoutes';
  value: Uint8Array;
}
export interface QueryAllTradeRoutesSDKType {}
export interface QueryAllTradeRoutesResponse {
  tradeRoutes: TradeRoute[];
}
export interface QueryAllTradeRoutesResponseProtoMsg {
  typeUrl: '/stride.stakeibc.QueryAllTradeRoutesResponse';
  value: Uint8Array;
}
export interface QueryAllTradeRoutesResponseSDKType {
  trade_routes: TradeRouteSDKType[];
}
function createBaseQueryInterchainAccountFromAddressRequest(): QueryInterchainAccountFromAddressRequest {
  return {
    owner: '',
    connectionId: '',
  };
}
export const QueryInterchainAccountFromAddressRequest = {
  typeUrl: '/stride.stakeibc.QueryInterchainAccountFromAddressRequest',
  encode(
    message: QueryInterchainAccountFromAddressRequest,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.owner !== '') {
      writer.uint32(10).string(message.owner);
    }
    if (message.connectionId !== '') {
      writer.uint32(18).string(message.connectionId);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryInterchainAccountFromAddressRequest {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryInterchainAccountFromAddressRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.owner = reader.string();
          break;
        case 2:
          message.connectionId = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryInterchainAccountFromAddressRequest {
    return {
      owner: isSet(object.owner) ? String(object.owner) : '',
      connectionId: isSet(object.connectionId)
        ? String(object.connectionId)
        : '',
    };
  },
  toJSON(
    message: QueryInterchainAccountFromAddressRequest,
  ): JsonSafe<QueryInterchainAccountFromAddressRequest> {
    const obj: any = {};
    message.owner !== undefined && (obj.owner = message.owner);
    message.connectionId !== undefined &&
      (obj.connectionId = message.connectionId);
    return obj;
  },
  fromPartial(
    object: Partial<QueryInterchainAccountFromAddressRequest>,
  ): QueryInterchainAccountFromAddressRequest {
    const message = createBaseQueryInterchainAccountFromAddressRequest();
    message.owner = object.owner ?? '';
    message.connectionId = object.connectionId ?? '';
    return message;
  },
  fromProtoMsg(
    message: QueryInterchainAccountFromAddressRequestProtoMsg,
  ): QueryInterchainAccountFromAddressRequest {
    return QueryInterchainAccountFromAddressRequest.decode(message.value);
  },
  toProto(message: QueryInterchainAccountFromAddressRequest): Uint8Array {
    return QueryInterchainAccountFromAddressRequest.encode(message).finish();
  },
  toProtoMsg(
    message: QueryInterchainAccountFromAddressRequest,
  ): QueryInterchainAccountFromAddressRequestProtoMsg {
    return {
      typeUrl: '/stride.stakeibc.QueryInterchainAccountFromAddressRequest',
      value: QueryInterchainAccountFromAddressRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryInterchainAccountFromAddressResponse(): QueryInterchainAccountFromAddressResponse {
  return {
    interchainAccountAddress: '',
  };
}
export const QueryInterchainAccountFromAddressResponse = {
  typeUrl: '/stride.stakeibc.QueryInterchainAccountFromAddressResponse',
  encode(
    message: QueryInterchainAccountFromAddressResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.interchainAccountAddress !== '') {
      writer.uint32(10).string(message.interchainAccountAddress);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryInterchainAccountFromAddressResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryInterchainAccountFromAddressResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.interchainAccountAddress = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryInterchainAccountFromAddressResponse {
    return {
      interchainAccountAddress: isSet(object.interchainAccountAddress)
        ? String(object.interchainAccountAddress)
        : '',
    };
  },
  toJSON(
    message: QueryInterchainAccountFromAddressResponse,
  ): JsonSafe<QueryInterchainAccountFromAddressResponse> {
    const obj: any = {};
    message.interchainAccountAddress !== undefined &&
      (obj.interchainAccountAddress = message.interchainAccountAddress);
    return obj;
  },
  fromPartial(
    object: Partial<QueryInterchainAccountFromAddressResponse>,
  ): QueryInterchainAccountFromAddressResponse {
    const message = createBaseQueryInterchainAccountFromAddressResponse();
    message.interchainAccountAddress = object.interchainAccountAddress ?? '';
    return message;
  },
  fromProtoMsg(
    message: QueryInterchainAccountFromAddressResponseProtoMsg,
  ): QueryInterchainAccountFromAddressResponse {
    return QueryInterchainAccountFromAddressResponse.decode(message.value);
  },
  toProto(message: QueryInterchainAccountFromAddressResponse): Uint8Array {
    return QueryInterchainAccountFromAddressResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QueryInterchainAccountFromAddressResponse,
  ): QueryInterchainAccountFromAddressResponseProtoMsg {
    return {
      typeUrl: '/stride.stakeibc.QueryInterchainAccountFromAddressResponse',
      value: QueryInterchainAccountFromAddressResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryParamsRequest(): QueryParamsRequest {
  return {};
}
export const QueryParamsRequest = {
  typeUrl: '/stride.stakeibc.QueryParamsRequest',
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
      typeUrl: '/stride.stakeibc.QueryParamsRequest',
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
  typeUrl: '/stride.stakeibc.QueryParamsResponse',
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
      typeUrl: '/stride.stakeibc.QueryParamsResponse',
      value: QueryParamsResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryGetValidatorsRequest(): QueryGetValidatorsRequest {
  return {
    chainId: '',
  };
}
export const QueryGetValidatorsRequest = {
  typeUrl: '/stride.stakeibc.QueryGetValidatorsRequest',
  encode(
    message: QueryGetValidatorsRequest,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.chainId !== '') {
      writer.uint32(10).string(message.chainId);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryGetValidatorsRequest {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryGetValidatorsRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.chainId = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryGetValidatorsRequest {
    return {
      chainId: isSet(object.chainId) ? String(object.chainId) : '',
    };
  },
  toJSON(
    message: QueryGetValidatorsRequest,
  ): JsonSafe<QueryGetValidatorsRequest> {
    const obj: any = {};
    message.chainId !== undefined && (obj.chainId = message.chainId);
    return obj;
  },
  fromPartial(
    object: Partial<QueryGetValidatorsRequest>,
  ): QueryGetValidatorsRequest {
    const message = createBaseQueryGetValidatorsRequest();
    message.chainId = object.chainId ?? '';
    return message;
  },
  fromProtoMsg(
    message: QueryGetValidatorsRequestProtoMsg,
  ): QueryGetValidatorsRequest {
    return QueryGetValidatorsRequest.decode(message.value);
  },
  toProto(message: QueryGetValidatorsRequest): Uint8Array {
    return QueryGetValidatorsRequest.encode(message).finish();
  },
  toProtoMsg(
    message: QueryGetValidatorsRequest,
  ): QueryGetValidatorsRequestProtoMsg {
    return {
      typeUrl: '/stride.stakeibc.QueryGetValidatorsRequest',
      value: QueryGetValidatorsRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryGetValidatorsResponse(): QueryGetValidatorsResponse {
  return {
    validators: [],
  };
}
export const QueryGetValidatorsResponse = {
  typeUrl: '/stride.stakeibc.QueryGetValidatorsResponse',
  encode(
    message: QueryGetValidatorsResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    for (const v of message.validators) {
      Validator.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryGetValidatorsResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryGetValidatorsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.validators.push(Validator.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryGetValidatorsResponse {
    return {
      validators: Array.isArray(object?.validators)
        ? object.validators.map((e: any) => Validator.fromJSON(e))
        : [],
    };
  },
  toJSON(
    message: QueryGetValidatorsResponse,
  ): JsonSafe<QueryGetValidatorsResponse> {
    const obj: any = {};
    if (message.validators) {
      obj.validators = message.validators.map(e =>
        e ? Validator.toJSON(e) : undefined,
      );
    } else {
      obj.validators = [];
    }
    return obj;
  },
  fromPartial(
    object: Partial<QueryGetValidatorsResponse>,
  ): QueryGetValidatorsResponse {
    const message = createBaseQueryGetValidatorsResponse();
    message.validators =
      object.validators?.map(e => Validator.fromPartial(e)) || [];
    return message;
  },
  fromProtoMsg(
    message: QueryGetValidatorsResponseProtoMsg,
  ): QueryGetValidatorsResponse {
    return QueryGetValidatorsResponse.decode(message.value);
  },
  toProto(message: QueryGetValidatorsResponse): Uint8Array {
    return QueryGetValidatorsResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QueryGetValidatorsResponse,
  ): QueryGetValidatorsResponseProtoMsg {
    return {
      typeUrl: '/stride.stakeibc.QueryGetValidatorsResponse',
      value: QueryGetValidatorsResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryGetHostZoneRequest(): QueryGetHostZoneRequest {
  return {
    chainId: '',
  };
}
export const QueryGetHostZoneRequest = {
  typeUrl: '/stride.stakeibc.QueryGetHostZoneRequest',
  encode(
    message: QueryGetHostZoneRequest,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.chainId !== '') {
      writer.uint32(10).string(message.chainId);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryGetHostZoneRequest {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryGetHostZoneRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.chainId = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryGetHostZoneRequest {
    return {
      chainId: isSet(object.chainId) ? String(object.chainId) : '',
    };
  },
  toJSON(message: QueryGetHostZoneRequest): JsonSafe<QueryGetHostZoneRequest> {
    const obj: any = {};
    message.chainId !== undefined && (obj.chainId = message.chainId);
    return obj;
  },
  fromPartial(
    object: Partial<QueryGetHostZoneRequest>,
  ): QueryGetHostZoneRequest {
    const message = createBaseQueryGetHostZoneRequest();
    message.chainId = object.chainId ?? '';
    return message;
  },
  fromProtoMsg(
    message: QueryGetHostZoneRequestProtoMsg,
  ): QueryGetHostZoneRequest {
    return QueryGetHostZoneRequest.decode(message.value);
  },
  toProto(message: QueryGetHostZoneRequest): Uint8Array {
    return QueryGetHostZoneRequest.encode(message).finish();
  },
  toProtoMsg(
    message: QueryGetHostZoneRequest,
  ): QueryGetHostZoneRequestProtoMsg {
    return {
      typeUrl: '/stride.stakeibc.QueryGetHostZoneRequest',
      value: QueryGetHostZoneRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryGetHostZoneResponse(): QueryGetHostZoneResponse {
  return {
    hostZone: HostZone.fromPartial({}),
  };
}
export const QueryGetHostZoneResponse = {
  typeUrl: '/stride.stakeibc.QueryGetHostZoneResponse',
  encode(
    message: QueryGetHostZoneResponse,
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
  ): QueryGetHostZoneResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryGetHostZoneResponse();
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
  fromJSON(object: any): QueryGetHostZoneResponse {
    return {
      hostZone: isSet(object.hostZone)
        ? HostZone.fromJSON(object.hostZone)
        : undefined,
    };
  },
  toJSON(
    message: QueryGetHostZoneResponse,
  ): JsonSafe<QueryGetHostZoneResponse> {
    const obj: any = {};
    message.hostZone !== undefined &&
      (obj.hostZone = message.hostZone
        ? HostZone.toJSON(message.hostZone)
        : undefined);
    return obj;
  },
  fromPartial(
    object: Partial<QueryGetHostZoneResponse>,
  ): QueryGetHostZoneResponse {
    const message = createBaseQueryGetHostZoneResponse();
    message.hostZone =
      object.hostZone !== undefined && object.hostZone !== null
        ? HostZone.fromPartial(object.hostZone)
        : undefined;
    return message;
  },
  fromProtoMsg(
    message: QueryGetHostZoneResponseProtoMsg,
  ): QueryGetHostZoneResponse {
    return QueryGetHostZoneResponse.decode(message.value);
  },
  toProto(message: QueryGetHostZoneResponse): Uint8Array {
    return QueryGetHostZoneResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QueryGetHostZoneResponse,
  ): QueryGetHostZoneResponseProtoMsg {
    return {
      typeUrl: '/stride.stakeibc.QueryGetHostZoneResponse',
      value: QueryGetHostZoneResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryAllHostZoneRequest(): QueryAllHostZoneRequest {
  return {
    pagination: undefined,
  };
}
export const QueryAllHostZoneRequest = {
  typeUrl: '/stride.stakeibc.QueryAllHostZoneRequest',
  encode(
    message: QueryAllHostZoneRequest,
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
  ): QueryAllHostZoneRequest {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryAllHostZoneRequest();
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
  fromJSON(object: any): QueryAllHostZoneRequest {
    return {
      pagination: isSet(object.pagination)
        ? PageRequest.fromJSON(object.pagination)
        : undefined,
    };
  },
  toJSON(message: QueryAllHostZoneRequest): JsonSafe<QueryAllHostZoneRequest> {
    const obj: any = {};
    message.pagination !== undefined &&
      (obj.pagination = message.pagination
        ? PageRequest.toJSON(message.pagination)
        : undefined);
    return obj;
  },
  fromPartial(
    object: Partial<QueryAllHostZoneRequest>,
  ): QueryAllHostZoneRequest {
    const message = createBaseQueryAllHostZoneRequest();
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageRequest.fromPartial(object.pagination)
        : undefined;
    return message;
  },
  fromProtoMsg(
    message: QueryAllHostZoneRequestProtoMsg,
  ): QueryAllHostZoneRequest {
    return QueryAllHostZoneRequest.decode(message.value);
  },
  toProto(message: QueryAllHostZoneRequest): Uint8Array {
    return QueryAllHostZoneRequest.encode(message).finish();
  },
  toProtoMsg(
    message: QueryAllHostZoneRequest,
  ): QueryAllHostZoneRequestProtoMsg {
    return {
      typeUrl: '/stride.stakeibc.QueryAllHostZoneRequest',
      value: QueryAllHostZoneRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryAllHostZoneResponse(): QueryAllHostZoneResponse {
  return {
    hostZone: [],
    pagination: undefined,
  };
}
export const QueryAllHostZoneResponse = {
  typeUrl: '/stride.stakeibc.QueryAllHostZoneResponse',
  encode(
    message: QueryAllHostZoneResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    for (const v of message.hostZone) {
      HostZone.encode(v!, writer.uint32(10).fork()).ldelim();
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
  ): QueryAllHostZoneResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryAllHostZoneResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.hostZone.push(HostZone.decode(reader, reader.uint32()));
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
  fromJSON(object: any): QueryAllHostZoneResponse {
    return {
      hostZone: Array.isArray(object?.hostZone)
        ? object.hostZone.map((e: any) => HostZone.fromJSON(e))
        : [],
      pagination: isSet(object.pagination)
        ? PageResponse.fromJSON(object.pagination)
        : undefined,
    };
  },
  toJSON(
    message: QueryAllHostZoneResponse,
  ): JsonSafe<QueryAllHostZoneResponse> {
    const obj: any = {};
    if (message.hostZone) {
      obj.hostZone = message.hostZone.map(e =>
        e ? HostZone.toJSON(e) : undefined,
      );
    } else {
      obj.hostZone = [];
    }
    message.pagination !== undefined &&
      (obj.pagination = message.pagination
        ? PageResponse.toJSON(message.pagination)
        : undefined);
    return obj;
  },
  fromPartial(
    object: Partial<QueryAllHostZoneResponse>,
  ): QueryAllHostZoneResponse {
    const message = createBaseQueryAllHostZoneResponse();
    message.hostZone = object.hostZone?.map(e => HostZone.fromPartial(e)) || [];
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageResponse.fromPartial(object.pagination)
        : undefined;
    return message;
  },
  fromProtoMsg(
    message: QueryAllHostZoneResponseProtoMsg,
  ): QueryAllHostZoneResponse {
    return QueryAllHostZoneResponse.decode(message.value);
  },
  toProto(message: QueryAllHostZoneResponse): Uint8Array {
    return QueryAllHostZoneResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QueryAllHostZoneResponse,
  ): QueryAllHostZoneResponseProtoMsg {
    return {
      typeUrl: '/stride.stakeibc.QueryAllHostZoneResponse',
      value: QueryAllHostZoneResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryModuleAddressRequest(): QueryModuleAddressRequest {
  return {
    name: '',
  };
}
export const QueryModuleAddressRequest = {
  typeUrl: '/stride.stakeibc.QueryModuleAddressRequest',
  encode(
    message: QueryModuleAddressRequest,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.name !== '') {
      writer.uint32(10).string(message.name);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryModuleAddressRequest {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryModuleAddressRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.name = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryModuleAddressRequest {
    return {
      name: isSet(object.name) ? String(object.name) : '',
    };
  },
  toJSON(
    message: QueryModuleAddressRequest,
  ): JsonSafe<QueryModuleAddressRequest> {
    const obj: any = {};
    message.name !== undefined && (obj.name = message.name);
    return obj;
  },
  fromPartial(
    object: Partial<QueryModuleAddressRequest>,
  ): QueryModuleAddressRequest {
    const message = createBaseQueryModuleAddressRequest();
    message.name = object.name ?? '';
    return message;
  },
  fromProtoMsg(
    message: QueryModuleAddressRequestProtoMsg,
  ): QueryModuleAddressRequest {
    return QueryModuleAddressRequest.decode(message.value);
  },
  toProto(message: QueryModuleAddressRequest): Uint8Array {
    return QueryModuleAddressRequest.encode(message).finish();
  },
  toProtoMsg(
    message: QueryModuleAddressRequest,
  ): QueryModuleAddressRequestProtoMsg {
    return {
      typeUrl: '/stride.stakeibc.QueryModuleAddressRequest',
      value: QueryModuleAddressRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryModuleAddressResponse(): QueryModuleAddressResponse {
  return {
    addr: '',
  };
}
export const QueryModuleAddressResponse = {
  typeUrl: '/stride.stakeibc.QueryModuleAddressResponse',
  encode(
    message: QueryModuleAddressResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.addr !== '') {
      writer.uint32(10).string(message.addr);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryModuleAddressResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryModuleAddressResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.addr = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryModuleAddressResponse {
    return {
      addr: isSet(object.addr) ? String(object.addr) : '',
    };
  },
  toJSON(
    message: QueryModuleAddressResponse,
  ): JsonSafe<QueryModuleAddressResponse> {
    const obj: any = {};
    message.addr !== undefined && (obj.addr = message.addr);
    return obj;
  },
  fromPartial(
    object: Partial<QueryModuleAddressResponse>,
  ): QueryModuleAddressResponse {
    const message = createBaseQueryModuleAddressResponse();
    message.addr = object.addr ?? '';
    return message;
  },
  fromProtoMsg(
    message: QueryModuleAddressResponseProtoMsg,
  ): QueryModuleAddressResponse {
    return QueryModuleAddressResponse.decode(message.value);
  },
  toProto(message: QueryModuleAddressResponse): Uint8Array {
    return QueryModuleAddressResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QueryModuleAddressResponse,
  ): QueryModuleAddressResponseProtoMsg {
    return {
      typeUrl: '/stride.stakeibc.QueryModuleAddressResponse',
      value: QueryModuleAddressResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryGetEpochTrackerRequest(): QueryGetEpochTrackerRequest {
  return {
    epochIdentifier: '',
  };
}
export const QueryGetEpochTrackerRequest = {
  typeUrl: '/stride.stakeibc.QueryGetEpochTrackerRequest',
  encode(
    message: QueryGetEpochTrackerRequest,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.epochIdentifier !== '') {
      writer.uint32(10).string(message.epochIdentifier);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryGetEpochTrackerRequest {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryGetEpochTrackerRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.epochIdentifier = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryGetEpochTrackerRequest {
    return {
      epochIdentifier: isSet(object.epochIdentifier)
        ? String(object.epochIdentifier)
        : '',
    };
  },
  toJSON(
    message: QueryGetEpochTrackerRequest,
  ): JsonSafe<QueryGetEpochTrackerRequest> {
    const obj: any = {};
    message.epochIdentifier !== undefined &&
      (obj.epochIdentifier = message.epochIdentifier);
    return obj;
  },
  fromPartial(
    object: Partial<QueryGetEpochTrackerRequest>,
  ): QueryGetEpochTrackerRequest {
    const message = createBaseQueryGetEpochTrackerRequest();
    message.epochIdentifier = object.epochIdentifier ?? '';
    return message;
  },
  fromProtoMsg(
    message: QueryGetEpochTrackerRequestProtoMsg,
  ): QueryGetEpochTrackerRequest {
    return QueryGetEpochTrackerRequest.decode(message.value);
  },
  toProto(message: QueryGetEpochTrackerRequest): Uint8Array {
    return QueryGetEpochTrackerRequest.encode(message).finish();
  },
  toProtoMsg(
    message: QueryGetEpochTrackerRequest,
  ): QueryGetEpochTrackerRequestProtoMsg {
    return {
      typeUrl: '/stride.stakeibc.QueryGetEpochTrackerRequest',
      value: QueryGetEpochTrackerRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryGetEpochTrackerResponse(): QueryGetEpochTrackerResponse {
  return {
    epochTracker: EpochTracker.fromPartial({}),
  };
}
export const QueryGetEpochTrackerResponse = {
  typeUrl: '/stride.stakeibc.QueryGetEpochTrackerResponse',
  encode(
    message: QueryGetEpochTrackerResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.epochTracker !== undefined) {
      EpochTracker.encode(
        message.epochTracker,
        writer.uint32(10).fork(),
      ).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryGetEpochTrackerResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryGetEpochTrackerResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.epochTracker = EpochTracker.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryGetEpochTrackerResponse {
    return {
      epochTracker: isSet(object.epochTracker)
        ? EpochTracker.fromJSON(object.epochTracker)
        : undefined,
    };
  },
  toJSON(
    message: QueryGetEpochTrackerResponse,
  ): JsonSafe<QueryGetEpochTrackerResponse> {
    const obj: any = {};
    message.epochTracker !== undefined &&
      (obj.epochTracker = message.epochTracker
        ? EpochTracker.toJSON(message.epochTracker)
        : undefined);
    return obj;
  },
  fromPartial(
    object: Partial<QueryGetEpochTrackerResponse>,
  ): QueryGetEpochTrackerResponse {
    const message = createBaseQueryGetEpochTrackerResponse();
    message.epochTracker =
      object.epochTracker !== undefined && object.epochTracker !== null
        ? EpochTracker.fromPartial(object.epochTracker)
        : undefined;
    return message;
  },
  fromProtoMsg(
    message: QueryGetEpochTrackerResponseProtoMsg,
  ): QueryGetEpochTrackerResponse {
    return QueryGetEpochTrackerResponse.decode(message.value);
  },
  toProto(message: QueryGetEpochTrackerResponse): Uint8Array {
    return QueryGetEpochTrackerResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QueryGetEpochTrackerResponse,
  ): QueryGetEpochTrackerResponseProtoMsg {
    return {
      typeUrl: '/stride.stakeibc.QueryGetEpochTrackerResponse',
      value: QueryGetEpochTrackerResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryAllEpochTrackerRequest(): QueryAllEpochTrackerRequest {
  return {};
}
export const QueryAllEpochTrackerRequest = {
  typeUrl: '/stride.stakeibc.QueryAllEpochTrackerRequest',
  encode(
    _: QueryAllEpochTrackerRequest,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryAllEpochTrackerRequest {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryAllEpochTrackerRequest();
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
  fromJSON(_: any): QueryAllEpochTrackerRequest {
    return {};
  },
  toJSON(
    _: QueryAllEpochTrackerRequest,
  ): JsonSafe<QueryAllEpochTrackerRequest> {
    const obj: any = {};
    return obj;
  },
  fromPartial(
    _: Partial<QueryAllEpochTrackerRequest>,
  ): QueryAllEpochTrackerRequest {
    const message = createBaseQueryAllEpochTrackerRequest();
    return message;
  },
  fromProtoMsg(
    message: QueryAllEpochTrackerRequestProtoMsg,
  ): QueryAllEpochTrackerRequest {
    return QueryAllEpochTrackerRequest.decode(message.value);
  },
  toProto(message: QueryAllEpochTrackerRequest): Uint8Array {
    return QueryAllEpochTrackerRequest.encode(message).finish();
  },
  toProtoMsg(
    message: QueryAllEpochTrackerRequest,
  ): QueryAllEpochTrackerRequestProtoMsg {
    return {
      typeUrl: '/stride.stakeibc.QueryAllEpochTrackerRequest',
      value: QueryAllEpochTrackerRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryAllEpochTrackerResponse(): QueryAllEpochTrackerResponse {
  return {
    epochTracker: [],
  };
}
export const QueryAllEpochTrackerResponse = {
  typeUrl: '/stride.stakeibc.QueryAllEpochTrackerResponse',
  encode(
    message: QueryAllEpochTrackerResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    for (const v of message.epochTracker) {
      EpochTracker.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryAllEpochTrackerResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryAllEpochTrackerResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.epochTracker.push(
            EpochTracker.decode(reader, reader.uint32()),
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryAllEpochTrackerResponse {
    return {
      epochTracker: Array.isArray(object?.epochTracker)
        ? object.epochTracker.map((e: any) => EpochTracker.fromJSON(e))
        : [],
    };
  },
  toJSON(
    message: QueryAllEpochTrackerResponse,
  ): JsonSafe<QueryAllEpochTrackerResponse> {
    const obj: any = {};
    if (message.epochTracker) {
      obj.epochTracker = message.epochTracker.map(e =>
        e ? EpochTracker.toJSON(e) : undefined,
      );
    } else {
      obj.epochTracker = [];
    }
    return obj;
  },
  fromPartial(
    object: Partial<QueryAllEpochTrackerResponse>,
  ): QueryAllEpochTrackerResponse {
    const message = createBaseQueryAllEpochTrackerResponse();
    message.epochTracker =
      object.epochTracker?.map(e => EpochTracker.fromPartial(e)) || [];
    return message;
  },
  fromProtoMsg(
    message: QueryAllEpochTrackerResponseProtoMsg,
  ): QueryAllEpochTrackerResponse {
    return QueryAllEpochTrackerResponse.decode(message.value);
  },
  toProto(message: QueryAllEpochTrackerResponse): Uint8Array {
    return QueryAllEpochTrackerResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QueryAllEpochTrackerResponse,
  ): QueryAllEpochTrackerResponseProtoMsg {
    return {
      typeUrl: '/stride.stakeibc.QueryAllEpochTrackerResponse',
      value: QueryAllEpochTrackerResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryGetNextPacketSequenceRequest(): QueryGetNextPacketSequenceRequest {
  return {
    channelId: '',
    portId: '',
  };
}
export const QueryGetNextPacketSequenceRequest = {
  typeUrl: '/stride.stakeibc.QueryGetNextPacketSequenceRequest',
  encode(
    message: QueryGetNextPacketSequenceRequest,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.channelId !== '') {
      writer.uint32(10).string(message.channelId);
    }
    if (message.portId !== '') {
      writer.uint32(18).string(message.portId);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryGetNextPacketSequenceRequest {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryGetNextPacketSequenceRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.channelId = reader.string();
          break;
        case 2:
          message.portId = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryGetNextPacketSequenceRequest {
    return {
      channelId: isSet(object.channelId) ? String(object.channelId) : '',
      portId: isSet(object.portId) ? String(object.portId) : '',
    };
  },
  toJSON(
    message: QueryGetNextPacketSequenceRequest,
  ): JsonSafe<QueryGetNextPacketSequenceRequest> {
    const obj: any = {};
    message.channelId !== undefined && (obj.channelId = message.channelId);
    message.portId !== undefined && (obj.portId = message.portId);
    return obj;
  },
  fromPartial(
    object: Partial<QueryGetNextPacketSequenceRequest>,
  ): QueryGetNextPacketSequenceRequest {
    const message = createBaseQueryGetNextPacketSequenceRequest();
    message.channelId = object.channelId ?? '';
    message.portId = object.portId ?? '';
    return message;
  },
  fromProtoMsg(
    message: QueryGetNextPacketSequenceRequestProtoMsg,
  ): QueryGetNextPacketSequenceRequest {
    return QueryGetNextPacketSequenceRequest.decode(message.value);
  },
  toProto(message: QueryGetNextPacketSequenceRequest): Uint8Array {
    return QueryGetNextPacketSequenceRequest.encode(message).finish();
  },
  toProtoMsg(
    message: QueryGetNextPacketSequenceRequest,
  ): QueryGetNextPacketSequenceRequestProtoMsg {
    return {
      typeUrl: '/stride.stakeibc.QueryGetNextPacketSequenceRequest',
      value: QueryGetNextPacketSequenceRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryGetNextPacketSequenceResponse(): QueryGetNextPacketSequenceResponse {
  return {
    sequence: BigInt(0),
  };
}
export const QueryGetNextPacketSequenceResponse = {
  typeUrl: '/stride.stakeibc.QueryGetNextPacketSequenceResponse',
  encode(
    message: QueryGetNextPacketSequenceResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.sequence !== BigInt(0)) {
      writer.uint32(8).uint64(message.sequence);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryGetNextPacketSequenceResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryGetNextPacketSequenceResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.sequence = reader.uint64();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryGetNextPacketSequenceResponse {
    return {
      sequence: isSet(object.sequence)
        ? BigInt(object.sequence.toString())
        : BigInt(0),
    };
  },
  toJSON(
    message: QueryGetNextPacketSequenceResponse,
  ): JsonSafe<QueryGetNextPacketSequenceResponse> {
    const obj: any = {};
    message.sequence !== undefined &&
      (obj.sequence = (message.sequence || BigInt(0)).toString());
    return obj;
  },
  fromPartial(
    object: Partial<QueryGetNextPacketSequenceResponse>,
  ): QueryGetNextPacketSequenceResponse {
    const message = createBaseQueryGetNextPacketSequenceResponse();
    message.sequence =
      object.sequence !== undefined && object.sequence !== null
        ? BigInt(object.sequence.toString())
        : BigInt(0);
    return message;
  },
  fromProtoMsg(
    message: QueryGetNextPacketSequenceResponseProtoMsg,
  ): QueryGetNextPacketSequenceResponse {
    return QueryGetNextPacketSequenceResponse.decode(message.value);
  },
  toProto(message: QueryGetNextPacketSequenceResponse): Uint8Array {
    return QueryGetNextPacketSequenceResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QueryGetNextPacketSequenceResponse,
  ): QueryGetNextPacketSequenceResponseProtoMsg {
    return {
      typeUrl: '/stride.stakeibc.QueryGetNextPacketSequenceResponse',
      value: QueryGetNextPacketSequenceResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryAddressUnbondings(): QueryAddressUnbondings {
  return {
    address: '',
  };
}
export const QueryAddressUnbondings = {
  typeUrl: '/stride.stakeibc.QueryAddressUnbondings',
  encode(
    message: QueryAddressUnbondings,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.address !== '') {
      writer.uint32(10).string(message.address);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryAddressUnbondings {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryAddressUnbondings();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.address = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryAddressUnbondings {
    return {
      address: isSet(object.address) ? String(object.address) : '',
    };
  },
  toJSON(message: QueryAddressUnbondings): JsonSafe<QueryAddressUnbondings> {
    const obj: any = {};
    message.address !== undefined && (obj.address = message.address);
    return obj;
  },
  fromPartial(object: Partial<QueryAddressUnbondings>): QueryAddressUnbondings {
    const message = createBaseQueryAddressUnbondings();
    message.address = object.address ?? '';
    return message;
  },
  fromProtoMsg(
    message: QueryAddressUnbondingsProtoMsg,
  ): QueryAddressUnbondings {
    return QueryAddressUnbondings.decode(message.value);
  },
  toProto(message: QueryAddressUnbondings): Uint8Array {
    return QueryAddressUnbondings.encode(message).finish();
  },
  toProtoMsg(message: QueryAddressUnbondings): QueryAddressUnbondingsProtoMsg {
    return {
      typeUrl: '/stride.stakeibc.QueryAddressUnbondings',
      value: QueryAddressUnbondings.encode(message).finish(),
    };
  },
};
function createBaseQueryAddressUnbondingsResponse(): QueryAddressUnbondingsResponse {
  return {
    addressUnbondings: [],
  };
}
export const QueryAddressUnbondingsResponse = {
  typeUrl: '/stride.stakeibc.QueryAddressUnbondingsResponse',
  encode(
    message: QueryAddressUnbondingsResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    for (const v of message.addressUnbondings) {
      AddressUnbonding.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryAddressUnbondingsResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryAddressUnbondingsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.addressUnbondings.push(
            AddressUnbonding.decode(reader, reader.uint32()),
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryAddressUnbondingsResponse {
    return {
      addressUnbondings: Array.isArray(object?.addressUnbondings)
        ? object.addressUnbondings.map((e: any) => AddressUnbonding.fromJSON(e))
        : [],
    };
  },
  toJSON(
    message: QueryAddressUnbondingsResponse,
  ): JsonSafe<QueryAddressUnbondingsResponse> {
    const obj: any = {};
    if (message.addressUnbondings) {
      obj.addressUnbondings = message.addressUnbondings.map(e =>
        e ? AddressUnbonding.toJSON(e) : undefined,
      );
    } else {
      obj.addressUnbondings = [];
    }
    return obj;
  },
  fromPartial(
    object: Partial<QueryAddressUnbondingsResponse>,
  ): QueryAddressUnbondingsResponse {
    const message = createBaseQueryAddressUnbondingsResponse();
    message.addressUnbondings =
      object.addressUnbondings?.map(e => AddressUnbonding.fromPartial(e)) || [];
    return message;
  },
  fromProtoMsg(
    message: QueryAddressUnbondingsResponseProtoMsg,
  ): QueryAddressUnbondingsResponse {
    return QueryAddressUnbondingsResponse.decode(message.value);
  },
  toProto(message: QueryAddressUnbondingsResponse): Uint8Array {
    return QueryAddressUnbondingsResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QueryAddressUnbondingsResponse,
  ): QueryAddressUnbondingsResponseProtoMsg {
    return {
      typeUrl: '/stride.stakeibc.QueryAddressUnbondingsResponse',
      value: QueryAddressUnbondingsResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryAllTradeRoutes(): QueryAllTradeRoutes {
  return {};
}
export const QueryAllTradeRoutes = {
  typeUrl: '/stride.stakeibc.QueryAllTradeRoutes',
  encode(
    _: QueryAllTradeRoutes,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryAllTradeRoutes {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryAllTradeRoutes();
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
  fromJSON(_: any): QueryAllTradeRoutes {
    return {};
  },
  toJSON(_: QueryAllTradeRoutes): JsonSafe<QueryAllTradeRoutes> {
    const obj: any = {};
    return obj;
  },
  fromPartial(_: Partial<QueryAllTradeRoutes>): QueryAllTradeRoutes {
    const message = createBaseQueryAllTradeRoutes();
    return message;
  },
  fromProtoMsg(message: QueryAllTradeRoutesProtoMsg): QueryAllTradeRoutes {
    return QueryAllTradeRoutes.decode(message.value);
  },
  toProto(message: QueryAllTradeRoutes): Uint8Array {
    return QueryAllTradeRoutes.encode(message).finish();
  },
  toProtoMsg(message: QueryAllTradeRoutes): QueryAllTradeRoutesProtoMsg {
    return {
      typeUrl: '/stride.stakeibc.QueryAllTradeRoutes',
      value: QueryAllTradeRoutes.encode(message).finish(),
    };
  },
};
function createBaseQueryAllTradeRoutesResponse(): QueryAllTradeRoutesResponse {
  return {
    tradeRoutes: [],
  };
}
export const QueryAllTradeRoutesResponse = {
  typeUrl: '/stride.stakeibc.QueryAllTradeRoutesResponse',
  encode(
    message: QueryAllTradeRoutesResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    for (const v of message.tradeRoutes) {
      TradeRoute.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryAllTradeRoutesResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryAllTradeRoutesResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.tradeRoutes.push(TradeRoute.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryAllTradeRoutesResponse {
    return {
      tradeRoutes: Array.isArray(object?.tradeRoutes)
        ? object.tradeRoutes.map((e: any) => TradeRoute.fromJSON(e))
        : [],
    };
  },
  toJSON(
    message: QueryAllTradeRoutesResponse,
  ): JsonSafe<QueryAllTradeRoutesResponse> {
    const obj: any = {};
    if (message.tradeRoutes) {
      obj.tradeRoutes = message.tradeRoutes.map(e =>
        e ? TradeRoute.toJSON(e) : undefined,
      );
    } else {
      obj.tradeRoutes = [];
    }
    return obj;
  },
  fromPartial(
    object: Partial<QueryAllTradeRoutesResponse>,
  ): QueryAllTradeRoutesResponse {
    const message = createBaseQueryAllTradeRoutesResponse();
    message.tradeRoutes =
      object.tradeRoutes?.map(e => TradeRoute.fromPartial(e)) || [];
    return message;
  },
  fromProtoMsg(
    message: QueryAllTradeRoutesResponseProtoMsg,
  ): QueryAllTradeRoutesResponse {
    return QueryAllTradeRoutesResponse.decode(message.value);
  },
  toProto(message: QueryAllTradeRoutesResponse): Uint8Array {
    return QueryAllTradeRoutesResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QueryAllTradeRoutesResponse,
  ): QueryAllTradeRoutesResponseProtoMsg {
    return {
      typeUrl: '/stride.stakeibc.QueryAllTradeRoutesResponse',
      value: QueryAllTradeRoutesResponse.encode(message).finish(),
    };
  },
};
