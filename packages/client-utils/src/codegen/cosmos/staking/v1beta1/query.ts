//@ts-nocheck
import {
  PageRequest,
  type PageRequestSDKType,
  PageResponse,
  type PageResponseSDKType,
} from '../../base/query/v1beta1/pagination.js';
import {
  Validator,
  type ValidatorSDKType,
  DelegationResponse,
  type DelegationResponseSDKType,
  UnbondingDelegation,
  type UnbondingDelegationSDKType,
  RedelegationResponse,
  type RedelegationResponseSDKType,
  HistoricalInfo,
  type HistoricalInfoSDKType,
  Pool,
  type PoolSDKType,
  Params,
  type ParamsSDKType,
} from './staking.js';
import { BinaryReader, BinaryWriter } from '../../../binary.js';
import { isSet } from '../../../helpers.js';
import { type JsonSafe } from '../../../json-safe.js';
/** QueryValidatorsRequest is request type for Query/Validators RPC method. */
export interface QueryValidatorsRequest {
  /** status enables to query for validators matching a given status. */
  status: string;
  /** pagination defines an optional pagination for the request. */
  pagination?: PageRequest;
}
export interface QueryValidatorsRequestProtoMsg {
  typeUrl: '/cosmos.staking.v1beta1.QueryValidatorsRequest';
  value: Uint8Array;
}
/** QueryValidatorsRequest is request type for Query/Validators RPC method. */
export interface QueryValidatorsRequestSDKType {
  status: string;
  pagination?: PageRequestSDKType;
}
/** QueryValidatorsResponse is response type for the Query/Validators RPC method */
export interface QueryValidatorsResponse {
  /** validators contains all the queried validators. */
  validators: Validator[];
  /** pagination defines the pagination in the response. */
  pagination?: PageResponse;
}
export interface QueryValidatorsResponseProtoMsg {
  typeUrl: '/cosmos.staking.v1beta1.QueryValidatorsResponse';
  value: Uint8Array;
}
/** QueryValidatorsResponse is response type for the Query/Validators RPC method */
export interface QueryValidatorsResponseSDKType {
  validators: ValidatorSDKType[];
  pagination?: PageResponseSDKType;
}
/** QueryValidatorRequest is response type for the Query/Validator RPC method */
export interface QueryValidatorRequest {
  /** validator_addr defines the validator address to query for. */
  validatorAddr: string;
}
export interface QueryValidatorRequestProtoMsg {
  typeUrl: '/cosmos.staking.v1beta1.QueryValidatorRequest';
  value: Uint8Array;
}
/** QueryValidatorRequest is response type for the Query/Validator RPC method */
export interface QueryValidatorRequestSDKType {
  validator_addr: string;
}
/** QueryValidatorResponse is response type for the Query/Validator RPC method */
export interface QueryValidatorResponse {
  /** validator defines the validator info. */
  validator: Validator;
}
export interface QueryValidatorResponseProtoMsg {
  typeUrl: '/cosmos.staking.v1beta1.QueryValidatorResponse';
  value: Uint8Array;
}
/** QueryValidatorResponse is response type for the Query/Validator RPC method */
export interface QueryValidatorResponseSDKType {
  validator: ValidatorSDKType;
}
/**
 * QueryValidatorDelegationsRequest is request type for the
 * Query/ValidatorDelegations RPC method
 */
export interface QueryValidatorDelegationsRequest {
  /** validator_addr defines the validator address to query for. */
  validatorAddr: string;
  /** pagination defines an optional pagination for the request. */
  pagination?: PageRequest;
}
export interface QueryValidatorDelegationsRequestProtoMsg {
  typeUrl: '/cosmos.staking.v1beta1.QueryValidatorDelegationsRequest';
  value: Uint8Array;
}
/**
 * QueryValidatorDelegationsRequest is request type for the
 * Query/ValidatorDelegations RPC method
 */
export interface QueryValidatorDelegationsRequestSDKType {
  validator_addr: string;
  pagination?: PageRequestSDKType;
}
/**
 * QueryValidatorDelegationsResponse is response type for the
 * Query/ValidatorDelegations RPC method
 */
export interface QueryValidatorDelegationsResponse {
  delegationResponses: DelegationResponse[];
  /** pagination defines the pagination in the response. */
  pagination?: PageResponse;
}
export interface QueryValidatorDelegationsResponseProtoMsg {
  typeUrl: '/cosmos.staking.v1beta1.QueryValidatorDelegationsResponse';
  value: Uint8Array;
}
/**
 * QueryValidatorDelegationsResponse is response type for the
 * Query/ValidatorDelegations RPC method
 */
export interface QueryValidatorDelegationsResponseSDKType {
  delegation_responses: DelegationResponseSDKType[];
  pagination?: PageResponseSDKType;
}
/**
 * QueryValidatorUnbondingDelegationsRequest is required type for the
 * Query/ValidatorUnbondingDelegations RPC method
 */
export interface QueryValidatorUnbondingDelegationsRequest {
  /** validator_addr defines the validator address to query for. */
  validatorAddr: string;
  /** pagination defines an optional pagination for the request. */
  pagination?: PageRequest;
}
export interface QueryValidatorUnbondingDelegationsRequestProtoMsg {
  typeUrl: '/cosmos.staking.v1beta1.QueryValidatorUnbondingDelegationsRequest';
  value: Uint8Array;
}
/**
 * QueryValidatorUnbondingDelegationsRequest is required type for the
 * Query/ValidatorUnbondingDelegations RPC method
 */
export interface QueryValidatorUnbondingDelegationsRequestSDKType {
  validator_addr: string;
  pagination?: PageRequestSDKType;
}
/**
 * QueryValidatorUnbondingDelegationsResponse is response type for the
 * Query/ValidatorUnbondingDelegations RPC method.
 */
export interface QueryValidatorUnbondingDelegationsResponse {
  unbondingResponses: UnbondingDelegation[];
  /** pagination defines the pagination in the response. */
  pagination?: PageResponse;
}
export interface QueryValidatorUnbondingDelegationsResponseProtoMsg {
  typeUrl: '/cosmos.staking.v1beta1.QueryValidatorUnbondingDelegationsResponse';
  value: Uint8Array;
}
/**
 * QueryValidatorUnbondingDelegationsResponse is response type for the
 * Query/ValidatorUnbondingDelegations RPC method.
 */
export interface QueryValidatorUnbondingDelegationsResponseSDKType {
  unbonding_responses: UnbondingDelegationSDKType[];
  pagination?: PageResponseSDKType;
}
/** QueryDelegationRequest is request type for the Query/Delegation RPC method. */
export interface QueryDelegationRequest {
  /** delegator_addr defines the delegator address to query for. */
  delegatorAddr: string;
  /** validator_addr defines the validator address to query for. */
  validatorAddr: string;
}
export interface QueryDelegationRequestProtoMsg {
  typeUrl: '/cosmos.staking.v1beta1.QueryDelegationRequest';
  value: Uint8Array;
}
/** QueryDelegationRequest is request type for the Query/Delegation RPC method. */
export interface QueryDelegationRequestSDKType {
  delegator_addr: string;
  validator_addr: string;
}
/** QueryDelegationResponse is response type for the Query/Delegation RPC method. */
export interface QueryDelegationResponse {
  /** delegation_responses defines the delegation info of a delegation. */
  delegationResponse?: DelegationResponse;
}
export interface QueryDelegationResponseProtoMsg {
  typeUrl: '/cosmos.staking.v1beta1.QueryDelegationResponse';
  value: Uint8Array;
}
/** QueryDelegationResponse is response type for the Query/Delegation RPC method. */
export interface QueryDelegationResponseSDKType {
  delegation_response?: DelegationResponseSDKType;
}
/**
 * QueryUnbondingDelegationRequest is request type for the
 * Query/UnbondingDelegation RPC method.
 */
export interface QueryUnbondingDelegationRequest {
  /** delegator_addr defines the delegator address to query for. */
  delegatorAddr: string;
  /** validator_addr defines the validator address to query for. */
  validatorAddr: string;
}
export interface QueryUnbondingDelegationRequestProtoMsg {
  typeUrl: '/cosmos.staking.v1beta1.QueryUnbondingDelegationRequest';
  value: Uint8Array;
}
/**
 * QueryUnbondingDelegationRequest is request type for the
 * Query/UnbondingDelegation RPC method.
 */
export interface QueryUnbondingDelegationRequestSDKType {
  delegator_addr: string;
  validator_addr: string;
}
/**
 * QueryDelegationResponse is response type for the Query/UnbondingDelegation
 * RPC method.
 */
export interface QueryUnbondingDelegationResponse {
  /** unbond defines the unbonding information of a delegation. */
  unbond: UnbondingDelegation;
}
export interface QueryUnbondingDelegationResponseProtoMsg {
  typeUrl: '/cosmos.staking.v1beta1.QueryUnbondingDelegationResponse';
  value: Uint8Array;
}
/**
 * QueryDelegationResponse is response type for the Query/UnbondingDelegation
 * RPC method.
 */
export interface QueryUnbondingDelegationResponseSDKType {
  unbond: UnbondingDelegationSDKType;
}
/**
 * QueryDelegatorDelegationsRequest is request type for the
 * Query/DelegatorDelegations RPC method.
 */
export interface QueryDelegatorDelegationsRequest {
  /** delegator_addr defines the delegator address to query for. */
  delegatorAddr: string;
  /** pagination defines an optional pagination for the request. */
  pagination?: PageRequest;
}
export interface QueryDelegatorDelegationsRequestProtoMsg {
  typeUrl: '/cosmos.staking.v1beta1.QueryDelegatorDelegationsRequest';
  value: Uint8Array;
}
/**
 * QueryDelegatorDelegationsRequest is request type for the
 * Query/DelegatorDelegations RPC method.
 */
export interface QueryDelegatorDelegationsRequestSDKType {
  delegator_addr: string;
  pagination?: PageRequestSDKType;
}
/**
 * QueryDelegatorDelegationsResponse is response type for the
 * Query/DelegatorDelegations RPC method.
 */
export interface QueryDelegatorDelegationsResponse {
  /** delegation_responses defines all the delegations' info of a delegator. */
  delegationResponses: DelegationResponse[];
  /** pagination defines the pagination in the response. */
  pagination?: PageResponse;
}
export interface QueryDelegatorDelegationsResponseProtoMsg {
  typeUrl: '/cosmos.staking.v1beta1.QueryDelegatorDelegationsResponse';
  value: Uint8Array;
}
/**
 * QueryDelegatorDelegationsResponse is response type for the
 * Query/DelegatorDelegations RPC method.
 */
export interface QueryDelegatorDelegationsResponseSDKType {
  delegation_responses: DelegationResponseSDKType[];
  pagination?: PageResponseSDKType;
}
/**
 * QueryDelegatorUnbondingDelegationsRequest is request type for the
 * Query/DelegatorUnbondingDelegations RPC method.
 */
export interface QueryDelegatorUnbondingDelegationsRequest {
  /** delegator_addr defines the delegator address to query for. */
  delegatorAddr: string;
  /** pagination defines an optional pagination for the request. */
  pagination?: PageRequest;
}
export interface QueryDelegatorUnbondingDelegationsRequestProtoMsg {
  typeUrl: '/cosmos.staking.v1beta1.QueryDelegatorUnbondingDelegationsRequest';
  value: Uint8Array;
}
/**
 * QueryDelegatorUnbondingDelegationsRequest is request type for the
 * Query/DelegatorUnbondingDelegations RPC method.
 */
export interface QueryDelegatorUnbondingDelegationsRequestSDKType {
  delegator_addr: string;
  pagination?: PageRequestSDKType;
}
/**
 * QueryUnbondingDelegatorDelegationsResponse is response type for the
 * Query/UnbondingDelegatorDelegations RPC method.
 */
export interface QueryDelegatorUnbondingDelegationsResponse {
  unbondingResponses: UnbondingDelegation[];
  /** pagination defines the pagination in the response. */
  pagination?: PageResponse;
}
export interface QueryDelegatorUnbondingDelegationsResponseProtoMsg {
  typeUrl: '/cosmos.staking.v1beta1.QueryDelegatorUnbondingDelegationsResponse';
  value: Uint8Array;
}
/**
 * QueryUnbondingDelegatorDelegationsResponse is response type for the
 * Query/UnbondingDelegatorDelegations RPC method.
 */
export interface QueryDelegatorUnbondingDelegationsResponseSDKType {
  unbonding_responses: UnbondingDelegationSDKType[];
  pagination?: PageResponseSDKType;
}
/**
 * QueryRedelegationsRequest is request type for the Query/Redelegations RPC
 * method.
 */
export interface QueryRedelegationsRequest {
  /** delegator_addr defines the delegator address to query for. */
  delegatorAddr: string;
  /** src_validator_addr defines the validator address to redelegate from. */
  srcValidatorAddr: string;
  /** dst_validator_addr defines the validator address to redelegate to. */
  dstValidatorAddr: string;
  /** pagination defines an optional pagination for the request. */
  pagination?: PageRequest;
}
export interface QueryRedelegationsRequestProtoMsg {
  typeUrl: '/cosmos.staking.v1beta1.QueryRedelegationsRequest';
  value: Uint8Array;
}
/**
 * QueryRedelegationsRequest is request type for the Query/Redelegations RPC
 * method.
 */
export interface QueryRedelegationsRequestSDKType {
  delegator_addr: string;
  src_validator_addr: string;
  dst_validator_addr: string;
  pagination?: PageRequestSDKType;
}
/**
 * QueryRedelegationsResponse is response type for the Query/Redelegations RPC
 * method.
 */
export interface QueryRedelegationsResponse {
  redelegationResponses: RedelegationResponse[];
  /** pagination defines the pagination in the response. */
  pagination?: PageResponse;
}
export interface QueryRedelegationsResponseProtoMsg {
  typeUrl: '/cosmos.staking.v1beta1.QueryRedelegationsResponse';
  value: Uint8Array;
}
/**
 * QueryRedelegationsResponse is response type for the Query/Redelegations RPC
 * method.
 */
export interface QueryRedelegationsResponseSDKType {
  redelegation_responses: RedelegationResponseSDKType[];
  pagination?: PageResponseSDKType;
}
/**
 * QueryDelegatorValidatorsRequest is request type for the
 * Query/DelegatorValidators RPC method.
 */
export interface QueryDelegatorValidatorsRequest {
  /** delegator_addr defines the delegator address to query for. */
  delegatorAddr: string;
  /** pagination defines an optional pagination for the request. */
  pagination?: PageRequest;
}
export interface QueryDelegatorValidatorsRequestProtoMsg {
  typeUrl: '/cosmos.staking.v1beta1.QueryDelegatorValidatorsRequest';
  value: Uint8Array;
}
/**
 * QueryDelegatorValidatorsRequest is request type for the
 * Query/DelegatorValidators RPC method.
 */
export interface QueryDelegatorValidatorsRequestSDKType {
  delegator_addr: string;
  pagination?: PageRequestSDKType;
}
/**
 * QueryDelegatorValidatorsResponse is response type for the
 * Query/DelegatorValidators RPC method.
 */
export interface QueryDelegatorValidatorsResponse {
  /** validators defines the validators' info of a delegator. */
  validators: Validator[];
  /** pagination defines the pagination in the response. */
  pagination?: PageResponse;
}
export interface QueryDelegatorValidatorsResponseProtoMsg {
  typeUrl: '/cosmos.staking.v1beta1.QueryDelegatorValidatorsResponse';
  value: Uint8Array;
}
/**
 * QueryDelegatorValidatorsResponse is response type for the
 * Query/DelegatorValidators RPC method.
 */
export interface QueryDelegatorValidatorsResponseSDKType {
  validators: ValidatorSDKType[];
  pagination?: PageResponseSDKType;
}
/**
 * QueryDelegatorValidatorRequest is request type for the
 * Query/DelegatorValidator RPC method.
 */
export interface QueryDelegatorValidatorRequest {
  /** delegator_addr defines the delegator address to query for. */
  delegatorAddr: string;
  /** validator_addr defines the validator address to query for. */
  validatorAddr: string;
}
export interface QueryDelegatorValidatorRequestProtoMsg {
  typeUrl: '/cosmos.staking.v1beta1.QueryDelegatorValidatorRequest';
  value: Uint8Array;
}
/**
 * QueryDelegatorValidatorRequest is request type for the
 * Query/DelegatorValidator RPC method.
 */
export interface QueryDelegatorValidatorRequestSDKType {
  delegator_addr: string;
  validator_addr: string;
}
/**
 * QueryDelegatorValidatorResponse response type for the
 * Query/DelegatorValidator RPC method.
 */
export interface QueryDelegatorValidatorResponse {
  /** validator defines the validator info. */
  validator: Validator;
}
export interface QueryDelegatorValidatorResponseProtoMsg {
  typeUrl: '/cosmos.staking.v1beta1.QueryDelegatorValidatorResponse';
  value: Uint8Array;
}
/**
 * QueryDelegatorValidatorResponse response type for the
 * Query/DelegatorValidator RPC method.
 */
export interface QueryDelegatorValidatorResponseSDKType {
  validator: ValidatorSDKType;
}
/**
 * QueryHistoricalInfoRequest is request type for the Query/HistoricalInfo RPC
 * method.
 */
export interface QueryHistoricalInfoRequest {
  /** height defines at which height to query the historical info. */
  height: bigint;
}
export interface QueryHistoricalInfoRequestProtoMsg {
  typeUrl: '/cosmos.staking.v1beta1.QueryHistoricalInfoRequest';
  value: Uint8Array;
}
/**
 * QueryHistoricalInfoRequest is request type for the Query/HistoricalInfo RPC
 * method.
 */
export interface QueryHistoricalInfoRequestSDKType {
  height: bigint;
}
/**
 * QueryHistoricalInfoResponse is response type for the Query/HistoricalInfo RPC
 * method.
 */
export interface QueryHistoricalInfoResponse {
  /** hist defines the historical info at the given height. */
  hist?: HistoricalInfo;
}
export interface QueryHistoricalInfoResponseProtoMsg {
  typeUrl: '/cosmos.staking.v1beta1.QueryHistoricalInfoResponse';
  value: Uint8Array;
}
/**
 * QueryHistoricalInfoResponse is response type for the Query/HistoricalInfo RPC
 * method.
 */
export interface QueryHistoricalInfoResponseSDKType {
  hist?: HistoricalInfoSDKType;
}
/** QueryPoolRequest is request type for the Query/Pool RPC method. */
export interface QueryPoolRequest {}
export interface QueryPoolRequestProtoMsg {
  typeUrl: '/cosmos.staking.v1beta1.QueryPoolRequest';
  value: Uint8Array;
}
/** QueryPoolRequest is request type for the Query/Pool RPC method. */
export interface QueryPoolRequestSDKType {}
/** QueryPoolResponse is response type for the Query/Pool RPC method. */
export interface QueryPoolResponse {
  /** pool defines the pool info. */
  pool: Pool;
}
export interface QueryPoolResponseProtoMsg {
  typeUrl: '/cosmos.staking.v1beta1.QueryPoolResponse';
  value: Uint8Array;
}
/** QueryPoolResponse is response type for the Query/Pool RPC method. */
export interface QueryPoolResponseSDKType {
  pool: PoolSDKType;
}
/** QueryParamsRequest is request type for the Query/Params RPC method. */
export interface QueryParamsRequest {}
export interface QueryParamsRequestProtoMsg {
  typeUrl: '/cosmos.staking.v1beta1.QueryParamsRequest';
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
  typeUrl: '/cosmos.staking.v1beta1.QueryParamsResponse';
  value: Uint8Array;
}
/** QueryParamsResponse is response type for the Query/Params RPC method. */
export interface QueryParamsResponseSDKType {
  params: ParamsSDKType;
}
function createBaseQueryValidatorsRequest(): QueryValidatorsRequest {
  return {
    status: '',
    pagination: undefined,
  };
}
export const QueryValidatorsRequest = {
  typeUrl: '/cosmos.staking.v1beta1.QueryValidatorsRequest',
  encode(
    message: QueryValidatorsRequest,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.status !== '') {
      writer.uint32(10).string(message.status);
    }
    if (message.pagination !== undefined) {
      PageRequest.encode(message.pagination, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryValidatorsRequest {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryValidatorsRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.status = reader.string();
          break;
        case 2:
          message.pagination = PageRequest.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryValidatorsRequest {
    return {
      status: isSet(object.status) ? String(object.status) : '',
      pagination: isSet(object.pagination)
        ? PageRequest.fromJSON(object.pagination)
        : undefined,
    };
  },
  toJSON(message: QueryValidatorsRequest): JsonSafe<QueryValidatorsRequest> {
    const obj: any = {};
    message.status !== undefined && (obj.status = message.status);
    message.pagination !== undefined &&
      (obj.pagination = message.pagination
        ? PageRequest.toJSON(message.pagination)
        : undefined);
    return obj;
  },
  fromPartial(object: Partial<QueryValidatorsRequest>): QueryValidatorsRequest {
    const message = createBaseQueryValidatorsRequest();
    message.status = object.status ?? '';
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageRequest.fromPartial(object.pagination)
        : undefined;
    return message;
  },
  fromProtoMsg(
    message: QueryValidatorsRequestProtoMsg,
  ): QueryValidatorsRequest {
    return QueryValidatorsRequest.decode(message.value);
  },
  toProto(message: QueryValidatorsRequest): Uint8Array {
    return QueryValidatorsRequest.encode(message).finish();
  },
  toProtoMsg(message: QueryValidatorsRequest): QueryValidatorsRequestProtoMsg {
    return {
      typeUrl: '/cosmos.staking.v1beta1.QueryValidatorsRequest',
      value: QueryValidatorsRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryValidatorsResponse(): QueryValidatorsResponse {
  return {
    validators: [],
    pagination: undefined,
  };
}
export const QueryValidatorsResponse = {
  typeUrl: '/cosmos.staking.v1beta1.QueryValidatorsResponse',
  encode(
    message: QueryValidatorsResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    for (const v of message.validators) {
      Validator.encode(v!, writer.uint32(10).fork()).ldelim();
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
  ): QueryValidatorsResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryValidatorsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.validators.push(Validator.decode(reader, reader.uint32()));
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
  fromJSON(object: any): QueryValidatorsResponse {
    return {
      validators: Array.isArray(object?.validators)
        ? object.validators.map((e: any) => Validator.fromJSON(e))
        : [],
      pagination: isSet(object.pagination)
        ? PageResponse.fromJSON(object.pagination)
        : undefined,
    };
  },
  toJSON(message: QueryValidatorsResponse): JsonSafe<QueryValidatorsResponse> {
    const obj: any = {};
    if (message.validators) {
      obj.validators = message.validators.map(e =>
        e ? Validator.toJSON(e) : undefined,
      );
    } else {
      obj.validators = [];
    }
    message.pagination !== undefined &&
      (obj.pagination = message.pagination
        ? PageResponse.toJSON(message.pagination)
        : undefined);
    return obj;
  },
  fromPartial(
    object: Partial<QueryValidatorsResponse>,
  ): QueryValidatorsResponse {
    const message = createBaseQueryValidatorsResponse();
    message.validators =
      object.validators?.map(e => Validator.fromPartial(e)) || [];
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageResponse.fromPartial(object.pagination)
        : undefined;
    return message;
  },
  fromProtoMsg(
    message: QueryValidatorsResponseProtoMsg,
  ): QueryValidatorsResponse {
    return QueryValidatorsResponse.decode(message.value);
  },
  toProto(message: QueryValidatorsResponse): Uint8Array {
    return QueryValidatorsResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QueryValidatorsResponse,
  ): QueryValidatorsResponseProtoMsg {
    return {
      typeUrl: '/cosmos.staking.v1beta1.QueryValidatorsResponse',
      value: QueryValidatorsResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryValidatorRequest(): QueryValidatorRequest {
  return {
    validatorAddr: '',
  };
}
export const QueryValidatorRequest = {
  typeUrl: '/cosmos.staking.v1beta1.QueryValidatorRequest',
  encode(
    message: QueryValidatorRequest,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.validatorAddr !== '') {
      writer.uint32(10).string(message.validatorAddr);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryValidatorRequest {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryValidatorRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.validatorAddr = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryValidatorRequest {
    return {
      validatorAddr: isSet(object.validatorAddr)
        ? String(object.validatorAddr)
        : '',
    };
  },
  toJSON(message: QueryValidatorRequest): JsonSafe<QueryValidatorRequest> {
    const obj: any = {};
    message.validatorAddr !== undefined &&
      (obj.validatorAddr = message.validatorAddr);
    return obj;
  },
  fromPartial(object: Partial<QueryValidatorRequest>): QueryValidatorRequest {
    const message = createBaseQueryValidatorRequest();
    message.validatorAddr = object.validatorAddr ?? '';
    return message;
  },
  fromProtoMsg(message: QueryValidatorRequestProtoMsg): QueryValidatorRequest {
    return QueryValidatorRequest.decode(message.value);
  },
  toProto(message: QueryValidatorRequest): Uint8Array {
    return QueryValidatorRequest.encode(message).finish();
  },
  toProtoMsg(message: QueryValidatorRequest): QueryValidatorRequestProtoMsg {
    return {
      typeUrl: '/cosmos.staking.v1beta1.QueryValidatorRequest',
      value: QueryValidatorRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryValidatorResponse(): QueryValidatorResponse {
  return {
    validator: Validator.fromPartial({}),
  };
}
export const QueryValidatorResponse = {
  typeUrl: '/cosmos.staking.v1beta1.QueryValidatorResponse',
  encode(
    message: QueryValidatorResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.validator !== undefined) {
      Validator.encode(message.validator, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryValidatorResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryValidatorResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.validator = Validator.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryValidatorResponse {
    return {
      validator: isSet(object.validator)
        ? Validator.fromJSON(object.validator)
        : undefined,
    };
  },
  toJSON(message: QueryValidatorResponse): JsonSafe<QueryValidatorResponse> {
    const obj: any = {};
    message.validator !== undefined &&
      (obj.validator = message.validator
        ? Validator.toJSON(message.validator)
        : undefined);
    return obj;
  },
  fromPartial(object: Partial<QueryValidatorResponse>): QueryValidatorResponse {
    const message = createBaseQueryValidatorResponse();
    message.validator =
      object.validator !== undefined && object.validator !== null
        ? Validator.fromPartial(object.validator)
        : undefined;
    return message;
  },
  fromProtoMsg(
    message: QueryValidatorResponseProtoMsg,
  ): QueryValidatorResponse {
    return QueryValidatorResponse.decode(message.value);
  },
  toProto(message: QueryValidatorResponse): Uint8Array {
    return QueryValidatorResponse.encode(message).finish();
  },
  toProtoMsg(message: QueryValidatorResponse): QueryValidatorResponseProtoMsg {
    return {
      typeUrl: '/cosmos.staking.v1beta1.QueryValidatorResponse',
      value: QueryValidatorResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryValidatorDelegationsRequest(): QueryValidatorDelegationsRequest {
  return {
    validatorAddr: '',
    pagination: undefined,
  };
}
export const QueryValidatorDelegationsRequest = {
  typeUrl: '/cosmos.staking.v1beta1.QueryValidatorDelegationsRequest',
  encode(
    message: QueryValidatorDelegationsRequest,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.validatorAddr !== '') {
      writer.uint32(10).string(message.validatorAddr);
    }
    if (message.pagination !== undefined) {
      PageRequest.encode(message.pagination, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryValidatorDelegationsRequest {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryValidatorDelegationsRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.validatorAddr = reader.string();
          break;
        case 2:
          message.pagination = PageRequest.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryValidatorDelegationsRequest {
    return {
      validatorAddr: isSet(object.validatorAddr)
        ? String(object.validatorAddr)
        : '',
      pagination: isSet(object.pagination)
        ? PageRequest.fromJSON(object.pagination)
        : undefined,
    };
  },
  toJSON(
    message: QueryValidatorDelegationsRequest,
  ): JsonSafe<QueryValidatorDelegationsRequest> {
    const obj: any = {};
    message.validatorAddr !== undefined &&
      (obj.validatorAddr = message.validatorAddr);
    message.pagination !== undefined &&
      (obj.pagination = message.pagination
        ? PageRequest.toJSON(message.pagination)
        : undefined);
    return obj;
  },
  fromPartial(
    object: Partial<QueryValidatorDelegationsRequest>,
  ): QueryValidatorDelegationsRequest {
    const message = createBaseQueryValidatorDelegationsRequest();
    message.validatorAddr = object.validatorAddr ?? '';
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageRequest.fromPartial(object.pagination)
        : undefined;
    return message;
  },
  fromProtoMsg(
    message: QueryValidatorDelegationsRequestProtoMsg,
  ): QueryValidatorDelegationsRequest {
    return QueryValidatorDelegationsRequest.decode(message.value);
  },
  toProto(message: QueryValidatorDelegationsRequest): Uint8Array {
    return QueryValidatorDelegationsRequest.encode(message).finish();
  },
  toProtoMsg(
    message: QueryValidatorDelegationsRequest,
  ): QueryValidatorDelegationsRequestProtoMsg {
    return {
      typeUrl: '/cosmos.staking.v1beta1.QueryValidatorDelegationsRequest',
      value: QueryValidatorDelegationsRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryValidatorDelegationsResponse(): QueryValidatorDelegationsResponse {
  return {
    delegationResponses: [],
    pagination: undefined,
  };
}
export const QueryValidatorDelegationsResponse = {
  typeUrl: '/cosmos.staking.v1beta1.QueryValidatorDelegationsResponse',
  encode(
    message: QueryValidatorDelegationsResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    for (const v of message.delegationResponses) {
      DelegationResponse.encode(v!, writer.uint32(10).fork()).ldelim();
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
  ): QueryValidatorDelegationsResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryValidatorDelegationsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.delegationResponses.push(
            DelegationResponse.decode(reader, reader.uint32()),
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
  fromJSON(object: any): QueryValidatorDelegationsResponse {
    return {
      delegationResponses: Array.isArray(object?.delegationResponses)
        ? object.delegationResponses.map((e: any) =>
            DelegationResponse.fromJSON(e),
          )
        : [],
      pagination: isSet(object.pagination)
        ? PageResponse.fromJSON(object.pagination)
        : undefined,
    };
  },
  toJSON(
    message: QueryValidatorDelegationsResponse,
  ): JsonSafe<QueryValidatorDelegationsResponse> {
    const obj: any = {};
    if (message.delegationResponses) {
      obj.delegationResponses = message.delegationResponses.map(e =>
        e ? DelegationResponse.toJSON(e) : undefined,
      );
    } else {
      obj.delegationResponses = [];
    }
    message.pagination !== undefined &&
      (obj.pagination = message.pagination
        ? PageResponse.toJSON(message.pagination)
        : undefined);
    return obj;
  },
  fromPartial(
    object: Partial<QueryValidatorDelegationsResponse>,
  ): QueryValidatorDelegationsResponse {
    const message = createBaseQueryValidatorDelegationsResponse();
    message.delegationResponses =
      object.delegationResponses?.map(e => DelegationResponse.fromPartial(e)) ||
      [];
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageResponse.fromPartial(object.pagination)
        : undefined;
    return message;
  },
  fromProtoMsg(
    message: QueryValidatorDelegationsResponseProtoMsg,
  ): QueryValidatorDelegationsResponse {
    return QueryValidatorDelegationsResponse.decode(message.value);
  },
  toProto(message: QueryValidatorDelegationsResponse): Uint8Array {
    return QueryValidatorDelegationsResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QueryValidatorDelegationsResponse,
  ): QueryValidatorDelegationsResponseProtoMsg {
    return {
      typeUrl: '/cosmos.staking.v1beta1.QueryValidatorDelegationsResponse',
      value: QueryValidatorDelegationsResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryValidatorUnbondingDelegationsRequest(): QueryValidatorUnbondingDelegationsRequest {
  return {
    validatorAddr: '',
    pagination: undefined,
  };
}
export const QueryValidatorUnbondingDelegationsRequest = {
  typeUrl: '/cosmos.staking.v1beta1.QueryValidatorUnbondingDelegationsRequest',
  encode(
    message: QueryValidatorUnbondingDelegationsRequest,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.validatorAddr !== '') {
      writer.uint32(10).string(message.validatorAddr);
    }
    if (message.pagination !== undefined) {
      PageRequest.encode(message.pagination, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryValidatorUnbondingDelegationsRequest {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryValidatorUnbondingDelegationsRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.validatorAddr = reader.string();
          break;
        case 2:
          message.pagination = PageRequest.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryValidatorUnbondingDelegationsRequest {
    return {
      validatorAddr: isSet(object.validatorAddr)
        ? String(object.validatorAddr)
        : '',
      pagination: isSet(object.pagination)
        ? PageRequest.fromJSON(object.pagination)
        : undefined,
    };
  },
  toJSON(
    message: QueryValidatorUnbondingDelegationsRequest,
  ): JsonSafe<QueryValidatorUnbondingDelegationsRequest> {
    const obj: any = {};
    message.validatorAddr !== undefined &&
      (obj.validatorAddr = message.validatorAddr);
    message.pagination !== undefined &&
      (obj.pagination = message.pagination
        ? PageRequest.toJSON(message.pagination)
        : undefined);
    return obj;
  },
  fromPartial(
    object: Partial<QueryValidatorUnbondingDelegationsRequest>,
  ): QueryValidatorUnbondingDelegationsRequest {
    const message = createBaseQueryValidatorUnbondingDelegationsRequest();
    message.validatorAddr = object.validatorAddr ?? '';
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageRequest.fromPartial(object.pagination)
        : undefined;
    return message;
  },
  fromProtoMsg(
    message: QueryValidatorUnbondingDelegationsRequestProtoMsg,
  ): QueryValidatorUnbondingDelegationsRequest {
    return QueryValidatorUnbondingDelegationsRequest.decode(message.value);
  },
  toProto(message: QueryValidatorUnbondingDelegationsRequest): Uint8Array {
    return QueryValidatorUnbondingDelegationsRequest.encode(message).finish();
  },
  toProtoMsg(
    message: QueryValidatorUnbondingDelegationsRequest,
  ): QueryValidatorUnbondingDelegationsRequestProtoMsg {
    return {
      typeUrl:
        '/cosmos.staking.v1beta1.QueryValidatorUnbondingDelegationsRequest',
      value: QueryValidatorUnbondingDelegationsRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryValidatorUnbondingDelegationsResponse(): QueryValidatorUnbondingDelegationsResponse {
  return {
    unbondingResponses: [],
    pagination: undefined,
  };
}
export const QueryValidatorUnbondingDelegationsResponse = {
  typeUrl: '/cosmos.staking.v1beta1.QueryValidatorUnbondingDelegationsResponse',
  encode(
    message: QueryValidatorUnbondingDelegationsResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    for (const v of message.unbondingResponses) {
      UnbondingDelegation.encode(v!, writer.uint32(10).fork()).ldelim();
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
  ): QueryValidatorUnbondingDelegationsResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryValidatorUnbondingDelegationsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.unbondingResponses.push(
            UnbondingDelegation.decode(reader, reader.uint32()),
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
  fromJSON(object: any): QueryValidatorUnbondingDelegationsResponse {
    return {
      unbondingResponses: Array.isArray(object?.unbondingResponses)
        ? object.unbondingResponses.map((e: any) =>
            UnbondingDelegation.fromJSON(e),
          )
        : [],
      pagination: isSet(object.pagination)
        ? PageResponse.fromJSON(object.pagination)
        : undefined,
    };
  },
  toJSON(
    message: QueryValidatorUnbondingDelegationsResponse,
  ): JsonSafe<QueryValidatorUnbondingDelegationsResponse> {
    const obj: any = {};
    if (message.unbondingResponses) {
      obj.unbondingResponses = message.unbondingResponses.map(e =>
        e ? UnbondingDelegation.toJSON(e) : undefined,
      );
    } else {
      obj.unbondingResponses = [];
    }
    message.pagination !== undefined &&
      (obj.pagination = message.pagination
        ? PageResponse.toJSON(message.pagination)
        : undefined);
    return obj;
  },
  fromPartial(
    object: Partial<QueryValidatorUnbondingDelegationsResponse>,
  ): QueryValidatorUnbondingDelegationsResponse {
    const message = createBaseQueryValidatorUnbondingDelegationsResponse();
    message.unbondingResponses =
      object.unbondingResponses?.map(e => UnbondingDelegation.fromPartial(e)) ||
      [];
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageResponse.fromPartial(object.pagination)
        : undefined;
    return message;
  },
  fromProtoMsg(
    message: QueryValidatorUnbondingDelegationsResponseProtoMsg,
  ): QueryValidatorUnbondingDelegationsResponse {
    return QueryValidatorUnbondingDelegationsResponse.decode(message.value);
  },
  toProto(message: QueryValidatorUnbondingDelegationsResponse): Uint8Array {
    return QueryValidatorUnbondingDelegationsResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QueryValidatorUnbondingDelegationsResponse,
  ): QueryValidatorUnbondingDelegationsResponseProtoMsg {
    return {
      typeUrl:
        '/cosmos.staking.v1beta1.QueryValidatorUnbondingDelegationsResponse',
      value:
        QueryValidatorUnbondingDelegationsResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryDelegationRequest(): QueryDelegationRequest {
  return {
    delegatorAddr: '',
    validatorAddr: '',
  };
}
export const QueryDelegationRequest = {
  typeUrl: '/cosmos.staking.v1beta1.QueryDelegationRequest',
  encode(
    message: QueryDelegationRequest,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.delegatorAddr !== '') {
      writer.uint32(10).string(message.delegatorAddr);
    }
    if (message.validatorAddr !== '') {
      writer.uint32(18).string(message.validatorAddr);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryDelegationRequest {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryDelegationRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.delegatorAddr = reader.string();
          break;
        case 2:
          message.validatorAddr = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryDelegationRequest {
    return {
      delegatorAddr: isSet(object.delegatorAddr)
        ? String(object.delegatorAddr)
        : '',
      validatorAddr: isSet(object.validatorAddr)
        ? String(object.validatorAddr)
        : '',
    };
  },
  toJSON(message: QueryDelegationRequest): JsonSafe<QueryDelegationRequest> {
    const obj: any = {};
    message.delegatorAddr !== undefined &&
      (obj.delegatorAddr = message.delegatorAddr);
    message.validatorAddr !== undefined &&
      (obj.validatorAddr = message.validatorAddr);
    return obj;
  },
  fromPartial(object: Partial<QueryDelegationRequest>): QueryDelegationRequest {
    const message = createBaseQueryDelegationRequest();
    message.delegatorAddr = object.delegatorAddr ?? '';
    message.validatorAddr = object.validatorAddr ?? '';
    return message;
  },
  fromProtoMsg(
    message: QueryDelegationRequestProtoMsg,
  ): QueryDelegationRequest {
    return QueryDelegationRequest.decode(message.value);
  },
  toProto(message: QueryDelegationRequest): Uint8Array {
    return QueryDelegationRequest.encode(message).finish();
  },
  toProtoMsg(message: QueryDelegationRequest): QueryDelegationRequestProtoMsg {
    return {
      typeUrl: '/cosmos.staking.v1beta1.QueryDelegationRequest',
      value: QueryDelegationRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryDelegationResponse(): QueryDelegationResponse {
  return {
    delegationResponse: undefined,
  };
}
export const QueryDelegationResponse = {
  typeUrl: '/cosmos.staking.v1beta1.QueryDelegationResponse',
  encode(
    message: QueryDelegationResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.delegationResponse !== undefined) {
      DelegationResponse.encode(
        message.delegationResponse,
        writer.uint32(10).fork(),
      ).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryDelegationResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryDelegationResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.delegationResponse = DelegationResponse.decode(
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
  fromJSON(object: any): QueryDelegationResponse {
    return {
      delegationResponse: isSet(object.delegationResponse)
        ? DelegationResponse.fromJSON(object.delegationResponse)
        : undefined,
    };
  },
  toJSON(message: QueryDelegationResponse): JsonSafe<QueryDelegationResponse> {
    const obj: any = {};
    message.delegationResponse !== undefined &&
      (obj.delegationResponse = message.delegationResponse
        ? DelegationResponse.toJSON(message.delegationResponse)
        : undefined);
    return obj;
  },
  fromPartial(
    object: Partial<QueryDelegationResponse>,
  ): QueryDelegationResponse {
    const message = createBaseQueryDelegationResponse();
    message.delegationResponse =
      object.delegationResponse !== undefined &&
      object.delegationResponse !== null
        ? DelegationResponse.fromPartial(object.delegationResponse)
        : undefined;
    return message;
  },
  fromProtoMsg(
    message: QueryDelegationResponseProtoMsg,
  ): QueryDelegationResponse {
    return QueryDelegationResponse.decode(message.value);
  },
  toProto(message: QueryDelegationResponse): Uint8Array {
    return QueryDelegationResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QueryDelegationResponse,
  ): QueryDelegationResponseProtoMsg {
    return {
      typeUrl: '/cosmos.staking.v1beta1.QueryDelegationResponse',
      value: QueryDelegationResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryUnbondingDelegationRequest(): QueryUnbondingDelegationRequest {
  return {
    delegatorAddr: '',
    validatorAddr: '',
  };
}
export const QueryUnbondingDelegationRequest = {
  typeUrl: '/cosmos.staking.v1beta1.QueryUnbondingDelegationRequest',
  encode(
    message: QueryUnbondingDelegationRequest,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.delegatorAddr !== '') {
      writer.uint32(10).string(message.delegatorAddr);
    }
    if (message.validatorAddr !== '') {
      writer.uint32(18).string(message.validatorAddr);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryUnbondingDelegationRequest {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryUnbondingDelegationRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.delegatorAddr = reader.string();
          break;
        case 2:
          message.validatorAddr = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryUnbondingDelegationRequest {
    return {
      delegatorAddr: isSet(object.delegatorAddr)
        ? String(object.delegatorAddr)
        : '',
      validatorAddr: isSet(object.validatorAddr)
        ? String(object.validatorAddr)
        : '',
    };
  },
  toJSON(
    message: QueryUnbondingDelegationRequest,
  ): JsonSafe<QueryUnbondingDelegationRequest> {
    const obj: any = {};
    message.delegatorAddr !== undefined &&
      (obj.delegatorAddr = message.delegatorAddr);
    message.validatorAddr !== undefined &&
      (obj.validatorAddr = message.validatorAddr);
    return obj;
  },
  fromPartial(
    object: Partial<QueryUnbondingDelegationRequest>,
  ): QueryUnbondingDelegationRequest {
    const message = createBaseQueryUnbondingDelegationRequest();
    message.delegatorAddr = object.delegatorAddr ?? '';
    message.validatorAddr = object.validatorAddr ?? '';
    return message;
  },
  fromProtoMsg(
    message: QueryUnbondingDelegationRequestProtoMsg,
  ): QueryUnbondingDelegationRequest {
    return QueryUnbondingDelegationRequest.decode(message.value);
  },
  toProto(message: QueryUnbondingDelegationRequest): Uint8Array {
    return QueryUnbondingDelegationRequest.encode(message).finish();
  },
  toProtoMsg(
    message: QueryUnbondingDelegationRequest,
  ): QueryUnbondingDelegationRequestProtoMsg {
    return {
      typeUrl: '/cosmos.staking.v1beta1.QueryUnbondingDelegationRequest',
      value: QueryUnbondingDelegationRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryUnbondingDelegationResponse(): QueryUnbondingDelegationResponse {
  return {
    unbond: UnbondingDelegation.fromPartial({}),
  };
}
export const QueryUnbondingDelegationResponse = {
  typeUrl: '/cosmos.staking.v1beta1.QueryUnbondingDelegationResponse',
  encode(
    message: QueryUnbondingDelegationResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.unbond !== undefined) {
      UnbondingDelegation.encode(
        message.unbond,
        writer.uint32(10).fork(),
      ).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryUnbondingDelegationResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryUnbondingDelegationResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.unbond = UnbondingDelegation.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryUnbondingDelegationResponse {
    return {
      unbond: isSet(object.unbond)
        ? UnbondingDelegation.fromJSON(object.unbond)
        : undefined,
    };
  },
  toJSON(
    message: QueryUnbondingDelegationResponse,
  ): JsonSafe<QueryUnbondingDelegationResponse> {
    const obj: any = {};
    message.unbond !== undefined &&
      (obj.unbond = message.unbond
        ? UnbondingDelegation.toJSON(message.unbond)
        : undefined);
    return obj;
  },
  fromPartial(
    object: Partial<QueryUnbondingDelegationResponse>,
  ): QueryUnbondingDelegationResponse {
    const message = createBaseQueryUnbondingDelegationResponse();
    message.unbond =
      object.unbond !== undefined && object.unbond !== null
        ? UnbondingDelegation.fromPartial(object.unbond)
        : undefined;
    return message;
  },
  fromProtoMsg(
    message: QueryUnbondingDelegationResponseProtoMsg,
  ): QueryUnbondingDelegationResponse {
    return QueryUnbondingDelegationResponse.decode(message.value);
  },
  toProto(message: QueryUnbondingDelegationResponse): Uint8Array {
    return QueryUnbondingDelegationResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QueryUnbondingDelegationResponse,
  ): QueryUnbondingDelegationResponseProtoMsg {
    return {
      typeUrl: '/cosmos.staking.v1beta1.QueryUnbondingDelegationResponse',
      value: QueryUnbondingDelegationResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryDelegatorDelegationsRequest(): QueryDelegatorDelegationsRequest {
  return {
    delegatorAddr: '',
    pagination: undefined,
  };
}
export const QueryDelegatorDelegationsRequest = {
  typeUrl: '/cosmos.staking.v1beta1.QueryDelegatorDelegationsRequest',
  encode(
    message: QueryDelegatorDelegationsRequest,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.delegatorAddr !== '') {
      writer.uint32(10).string(message.delegatorAddr);
    }
    if (message.pagination !== undefined) {
      PageRequest.encode(message.pagination, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryDelegatorDelegationsRequest {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryDelegatorDelegationsRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.delegatorAddr = reader.string();
          break;
        case 2:
          message.pagination = PageRequest.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryDelegatorDelegationsRequest {
    return {
      delegatorAddr: isSet(object.delegatorAddr)
        ? String(object.delegatorAddr)
        : '',
      pagination: isSet(object.pagination)
        ? PageRequest.fromJSON(object.pagination)
        : undefined,
    };
  },
  toJSON(
    message: QueryDelegatorDelegationsRequest,
  ): JsonSafe<QueryDelegatorDelegationsRequest> {
    const obj: any = {};
    message.delegatorAddr !== undefined &&
      (obj.delegatorAddr = message.delegatorAddr);
    message.pagination !== undefined &&
      (obj.pagination = message.pagination
        ? PageRequest.toJSON(message.pagination)
        : undefined);
    return obj;
  },
  fromPartial(
    object: Partial<QueryDelegatorDelegationsRequest>,
  ): QueryDelegatorDelegationsRequest {
    const message = createBaseQueryDelegatorDelegationsRequest();
    message.delegatorAddr = object.delegatorAddr ?? '';
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageRequest.fromPartial(object.pagination)
        : undefined;
    return message;
  },
  fromProtoMsg(
    message: QueryDelegatorDelegationsRequestProtoMsg,
  ): QueryDelegatorDelegationsRequest {
    return QueryDelegatorDelegationsRequest.decode(message.value);
  },
  toProto(message: QueryDelegatorDelegationsRequest): Uint8Array {
    return QueryDelegatorDelegationsRequest.encode(message).finish();
  },
  toProtoMsg(
    message: QueryDelegatorDelegationsRequest,
  ): QueryDelegatorDelegationsRequestProtoMsg {
    return {
      typeUrl: '/cosmos.staking.v1beta1.QueryDelegatorDelegationsRequest',
      value: QueryDelegatorDelegationsRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryDelegatorDelegationsResponse(): QueryDelegatorDelegationsResponse {
  return {
    delegationResponses: [],
    pagination: undefined,
  };
}
export const QueryDelegatorDelegationsResponse = {
  typeUrl: '/cosmos.staking.v1beta1.QueryDelegatorDelegationsResponse',
  encode(
    message: QueryDelegatorDelegationsResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    for (const v of message.delegationResponses) {
      DelegationResponse.encode(v!, writer.uint32(10).fork()).ldelim();
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
  ): QueryDelegatorDelegationsResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryDelegatorDelegationsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.delegationResponses.push(
            DelegationResponse.decode(reader, reader.uint32()),
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
  fromJSON(object: any): QueryDelegatorDelegationsResponse {
    return {
      delegationResponses: Array.isArray(object?.delegationResponses)
        ? object.delegationResponses.map((e: any) =>
            DelegationResponse.fromJSON(e),
          )
        : [],
      pagination: isSet(object.pagination)
        ? PageResponse.fromJSON(object.pagination)
        : undefined,
    };
  },
  toJSON(
    message: QueryDelegatorDelegationsResponse,
  ): JsonSafe<QueryDelegatorDelegationsResponse> {
    const obj: any = {};
    if (message.delegationResponses) {
      obj.delegationResponses = message.delegationResponses.map(e =>
        e ? DelegationResponse.toJSON(e) : undefined,
      );
    } else {
      obj.delegationResponses = [];
    }
    message.pagination !== undefined &&
      (obj.pagination = message.pagination
        ? PageResponse.toJSON(message.pagination)
        : undefined);
    return obj;
  },
  fromPartial(
    object: Partial<QueryDelegatorDelegationsResponse>,
  ): QueryDelegatorDelegationsResponse {
    const message = createBaseQueryDelegatorDelegationsResponse();
    message.delegationResponses =
      object.delegationResponses?.map(e => DelegationResponse.fromPartial(e)) ||
      [];
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageResponse.fromPartial(object.pagination)
        : undefined;
    return message;
  },
  fromProtoMsg(
    message: QueryDelegatorDelegationsResponseProtoMsg,
  ): QueryDelegatorDelegationsResponse {
    return QueryDelegatorDelegationsResponse.decode(message.value);
  },
  toProto(message: QueryDelegatorDelegationsResponse): Uint8Array {
    return QueryDelegatorDelegationsResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QueryDelegatorDelegationsResponse,
  ): QueryDelegatorDelegationsResponseProtoMsg {
    return {
      typeUrl: '/cosmos.staking.v1beta1.QueryDelegatorDelegationsResponse',
      value: QueryDelegatorDelegationsResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryDelegatorUnbondingDelegationsRequest(): QueryDelegatorUnbondingDelegationsRequest {
  return {
    delegatorAddr: '',
    pagination: undefined,
  };
}
export const QueryDelegatorUnbondingDelegationsRequest = {
  typeUrl: '/cosmos.staking.v1beta1.QueryDelegatorUnbondingDelegationsRequest',
  encode(
    message: QueryDelegatorUnbondingDelegationsRequest,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.delegatorAddr !== '') {
      writer.uint32(10).string(message.delegatorAddr);
    }
    if (message.pagination !== undefined) {
      PageRequest.encode(message.pagination, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryDelegatorUnbondingDelegationsRequest {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryDelegatorUnbondingDelegationsRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.delegatorAddr = reader.string();
          break;
        case 2:
          message.pagination = PageRequest.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryDelegatorUnbondingDelegationsRequest {
    return {
      delegatorAddr: isSet(object.delegatorAddr)
        ? String(object.delegatorAddr)
        : '',
      pagination: isSet(object.pagination)
        ? PageRequest.fromJSON(object.pagination)
        : undefined,
    };
  },
  toJSON(
    message: QueryDelegatorUnbondingDelegationsRequest,
  ): JsonSafe<QueryDelegatorUnbondingDelegationsRequest> {
    const obj: any = {};
    message.delegatorAddr !== undefined &&
      (obj.delegatorAddr = message.delegatorAddr);
    message.pagination !== undefined &&
      (obj.pagination = message.pagination
        ? PageRequest.toJSON(message.pagination)
        : undefined);
    return obj;
  },
  fromPartial(
    object: Partial<QueryDelegatorUnbondingDelegationsRequest>,
  ): QueryDelegatorUnbondingDelegationsRequest {
    const message = createBaseQueryDelegatorUnbondingDelegationsRequest();
    message.delegatorAddr = object.delegatorAddr ?? '';
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageRequest.fromPartial(object.pagination)
        : undefined;
    return message;
  },
  fromProtoMsg(
    message: QueryDelegatorUnbondingDelegationsRequestProtoMsg,
  ): QueryDelegatorUnbondingDelegationsRequest {
    return QueryDelegatorUnbondingDelegationsRequest.decode(message.value);
  },
  toProto(message: QueryDelegatorUnbondingDelegationsRequest): Uint8Array {
    return QueryDelegatorUnbondingDelegationsRequest.encode(message).finish();
  },
  toProtoMsg(
    message: QueryDelegatorUnbondingDelegationsRequest,
  ): QueryDelegatorUnbondingDelegationsRequestProtoMsg {
    return {
      typeUrl:
        '/cosmos.staking.v1beta1.QueryDelegatorUnbondingDelegationsRequest',
      value: QueryDelegatorUnbondingDelegationsRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryDelegatorUnbondingDelegationsResponse(): QueryDelegatorUnbondingDelegationsResponse {
  return {
    unbondingResponses: [],
    pagination: undefined,
  };
}
export const QueryDelegatorUnbondingDelegationsResponse = {
  typeUrl: '/cosmos.staking.v1beta1.QueryDelegatorUnbondingDelegationsResponse',
  encode(
    message: QueryDelegatorUnbondingDelegationsResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    for (const v of message.unbondingResponses) {
      UnbondingDelegation.encode(v!, writer.uint32(10).fork()).ldelim();
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
  ): QueryDelegatorUnbondingDelegationsResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryDelegatorUnbondingDelegationsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.unbondingResponses.push(
            UnbondingDelegation.decode(reader, reader.uint32()),
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
  fromJSON(object: any): QueryDelegatorUnbondingDelegationsResponse {
    return {
      unbondingResponses: Array.isArray(object?.unbondingResponses)
        ? object.unbondingResponses.map((e: any) =>
            UnbondingDelegation.fromJSON(e),
          )
        : [],
      pagination: isSet(object.pagination)
        ? PageResponse.fromJSON(object.pagination)
        : undefined,
    };
  },
  toJSON(
    message: QueryDelegatorUnbondingDelegationsResponse,
  ): JsonSafe<QueryDelegatorUnbondingDelegationsResponse> {
    const obj: any = {};
    if (message.unbondingResponses) {
      obj.unbondingResponses = message.unbondingResponses.map(e =>
        e ? UnbondingDelegation.toJSON(e) : undefined,
      );
    } else {
      obj.unbondingResponses = [];
    }
    message.pagination !== undefined &&
      (obj.pagination = message.pagination
        ? PageResponse.toJSON(message.pagination)
        : undefined);
    return obj;
  },
  fromPartial(
    object: Partial<QueryDelegatorUnbondingDelegationsResponse>,
  ): QueryDelegatorUnbondingDelegationsResponse {
    const message = createBaseQueryDelegatorUnbondingDelegationsResponse();
    message.unbondingResponses =
      object.unbondingResponses?.map(e => UnbondingDelegation.fromPartial(e)) ||
      [];
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageResponse.fromPartial(object.pagination)
        : undefined;
    return message;
  },
  fromProtoMsg(
    message: QueryDelegatorUnbondingDelegationsResponseProtoMsg,
  ): QueryDelegatorUnbondingDelegationsResponse {
    return QueryDelegatorUnbondingDelegationsResponse.decode(message.value);
  },
  toProto(message: QueryDelegatorUnbondingDelegationsResponse): Uint8Array {
    return QueryDelegatorUnbondingDelegationsResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QueryDelegatorUnbondingDelegationsResponse,
  ): QueryDelegatorUnbondingDelegationsResponseProtoMsg {
    return {
      typeUrl:
        '/cosmos.staking.v1beta1.QueryDelegatorUnbondingDelegationsResponse',
      value:
        QueryDelegatorUnbondingDelegationsResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryRedelegationsRequest(): QueryRedelegationsRequest {
  return {
    delegatorAddr: '',
    srcValidatorAddr: '',
    dstValidatorAddr: '',
    pagination: undefined,
  };
}
export const QueryRedelegationsRequest = {
  typeUrl: '/cosmos.staking.v1beta1.QueryRedelegationsRequest',
  encode(
    message: QueryRedelegationsRequest,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.delegatorAddr !== '') {
      writer.uint32(10).string(message.delegatorAddr);
    }
    if (message.srcValidatorAddr !== '') {
      writer.uint32(18).string(message.srcValidatorAddr);
    }
    if (message.dstValidatorAddr !== '') {
      writer.uint32(26).string(message.dstValidatorAddr);
    }
    if (message.pagination !== undefined) {
      PageRequest.encode(message.pagination, writer.uint32(34).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryRedelegationsRequest {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryRedelegationsRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.delegatorAddr = reader.string();
          break;
        case 2:
          message.srcValidatorAddr = reader.string();
          break;
        case 3:
          message.dstValidatorAddr = reader.string();
          break;
        case 4:
          message.pagination = PageRequest.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryRedelegationsRequest {
    return {
      delegatorAddr: isSet(object.delegatorAddr)
        ? String(object.delegatorAddr)
        : '',
      srcValidatorAddr: isSet(object.srcValidatorAddr)
        ? String(object.srcValidatorAddr)
        : '',
      dstValidatorAddr: isSet(object.dstValidatorAddr)
        ? String(object.dstValidatorAddr)
        : '',
      pagination: isSet(object.pagination)
        ? PageRequest.fromJSON(object.pagination)
        : undefined,
    };
  },
  toJSON(
    message: QueryRedelegationsRequest,
  ): JsonSafe<QueryRedelegationsRequest> {
    const obj: any = {};
    message.delegatorAddr !== undefined &&
      (obj.delegatorAddr = message.delegatorAddr);
    message.srcValidatorAddr !== undefined &&
      (obj.srcValidatorAddr = message.srcValidatorAddr);
    message.dstValidatorAddr !== undefined &&
      (obj.dstValidatorAddr = message.dstValidatorAddr);
    message.pagination !== undefined &&
      (obj.pagination = message.pagination
        ? PageRequest.toJSON(message.pagination)
        : undefined);
    return obj;
  },
  fromPartial(
    object: Partial<QueryRedelegationsRequest>,
  ): QueryRedelegationsRequest {
    const message = createBaseQueryRedelegationsRequest();
    message.delegatorAddr = object.delegatorAddr ?? '';
    message.srcValidatorAddr = object.srcValidatorAddr ?? '';
    message.dstValidatorAddr = object.dstValidatorAddr ?? '';
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageRequest.fromPartial(object.pagination)
        : undefined;
    return message;
  },
  fromProtoMsg(
    message: QueryRedelegationsRequestProtoMsg,
  ): QueryRedelegationsRequest {
    return QueryRedelegationsRequest.decode(message.value);
  },
  toProto(message: QueryRedelegationsRequest): Uint8Array {
    return QueryRedelegationsRequest.encode(message).finish();
  },
  toProtoMsg(
    message: QueryRedelegationsRequest,
  ): QueryRedelegationsRequestProtoMsg {
    return {
      typeUrl: '/cosmos.staking.v1beta1.QueryRedelegationsRequest',
      value: QueryRedelegationsRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryRedelegationsResponse(): QueryRedelegationsResponse {
  return {
    redelegationResponses: [],
    pagination: undefined,
  };
}
export const QueryRedelegationsResponse = {
  typeUrl: '/cosmos.staking.v1beta1.QueryRedelegationsResponse',
  encode(
    message: QueryRedelegationsResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    for (const v of message.redelegationResponses) {
      RedelegationResponse.encode(v!, writer.uint32(10).fork()).ldelim();
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
  ): QueryRedelegationsResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryRedelegationsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.redelegationResponses.push(
            RedelegationResponse.decode(reader, reader.uint32()),
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
  fromJSON(object: any): QueryRedelegationsResponse {
    return {
      redelegationResponses: Array.isArray(object?.redelegationResponses)
        ? object.redelegationResponses.map((e: any) =>
            RedelegationResponse.fromJSON(e),
          )
        : [],
      pagination: isSet(object.pagination)
        ? PageResponse.fromJSON(object.pagination)
        : undefined,
    };
  },
  toJSON(
    message: QueryRedelegationsResponse,
  ): JsonSafe<QueryRedelegationsResponse> {
    const obj: any = {};
    if (message.redelegationResponses) {
      obj.redelegationResponses = message.redelegationResponses.map(e =>
        e ? RedelegationResponse.toJSON(e) : undefined,
      );
    } else {
      obj.redelegationResponses = [];
    }
    message.pagination !== undefined &&
      (obj.pagination = message.pagination
        ? PageResponse.toJSON(message.pagination)
        : undefined);
    return obj;
  },
  fromPartial(
    object: Partial<QueryRedelegationsResponse>,
  ): QueryRedelegationsResponse {
    const message = createBaseQueryRedelegationsResponse();
    message.redelegationResponses =
      object.redelegationResponses?.map(e =>
        RedelegationResponse.fromPartial(e),
      ) || [];
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageResponse.fromPartial(object.pagination)
        : undefined;
    return message;
  },
  fromProtoMsg(
    message: QueryRedelegationsResponseProtoMsg,
  ): QueryRedelegationsResponse {
    return QueryRedelegationsResponse.decode(message.value);
  },
  toProto(message: QueryRedelegationsResponse): Uint8Array {
    return QueryRedelegationsResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QueryRedelegationsResponse,
  ): QueryRedelegationsResponseProtoMsg {
    return {
      typeUrl: '/cosmos.staking.v1beta1.QueryRedelegationsResponse',
      value: QueryRedelegationsResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryDelegatorValidatorsRequest(): QueryDelegatorValidatorsRequest {
  return {
    delegatorAddr: '',
    pagination: undefined,
  };
}
export const QueryDelegatorValidatorsRequest = {
  typeUrl: '/cosmos.staking.v1beta1.QueryDelegatorValidatorsRequest',
  encode(
    message: QueryDelegatorValidatorsRequest,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.delegatorAddr !== '') {
      writer.uint32(10).string(message.delegatorAddr);
    }
    if (message.pagination !== undefined) {
      PageRequest.encode(message.pagination, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryDelegatorValidatorsRequest {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryDelegatorValidatorsRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.delegatorAddr = reader.string();
          break;
        case 2:
          message.pagination = PageRequest.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryDelegatorValidatorsRequest {
    return {
      delegatorAddr: isSet(object.delegatorAddr)
        ? String(object.delegatorAddr)
        : '',
      pagination: isSet(object.pagination)
        ? PageRequest.fromJSON(object.pagination)
        : undefined,
    };
  },
  toJSON(
    message: QueryDelegatorValidatorsRequest,
  ): JsonSafe<QueryDelegatorValidatorsRequest> {
    const obj: any = {};
    message.delegatorAddr !== undefined &&
      (obj.delegatorAddr = message.delegatorAddr);
    message.pagination !== undefined &&
      (obj.pagination = message.pagination
        ? PageRequest.toJSON(message.pagination)
        : undefined);
    return obj;
  },
  fromPartial(
    object: Partial<QueryDelegatorValidatorsRequest>,
  ): QueryDelegatorValidatorsRequest {
    const message = createBaseQueryDelegatorValidatorsRequest();
    message.delegatorAddr = object.delegatorAddr ?? '';
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageRequest.fromPartial(object.pagination)
        : undefined;
    return message;
  },
  fromProtoMsg(
    message: QueryDelegatorValidatorsRequestProtoMsg,
  ): QueryDelegatorValidatorsRequest {
    return QueryDelegatorValidatorsRequest.decode(message.value);
  },
  toProto(message: QueryDelegatorValidatorsRequest): Uint8Array {
    return QueryDelegatorValidatorsRequest.encode(message).finish();
  },
  toProtoMsg(
    message: QueryDelegatorValidatorsRequest,
  ): QueryDelegatorValidatorsRequestProtoMsg {
    return {
      typeUrl: '/cosmos.staking.v1beta1.QueryDelegatorValidatorsRequest',
      value: QueryDelegatorValidatorsRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryDelegatorValidatorsResponse(): QueryDelegatorValidatorsResponse {
  return {
    validators: [],
    pagination: undefined,
  };
}
export const QueryDelegatorValidatorsResponse = {
  typeUrl: '/cosmos.staking.v1beta1.QueryDelegatorValidatorsResponse',
  encode(
    message: QueryDelegatorValidatorsResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    for (const v of message.validators) {
      Validator.encode(v!, writer.uint32(10).fork()).ldelim();
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
  ): QueryDelegatorValidatorsResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryDelegatorValidatorsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.validators.push(Validator.decode(reader, reader.uint32()));
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
  fromJSON(object: any): QueryDelegatorValidatorsResponse {
    return {
      validators: Array.isArray(object?.validators)
        ? object.validators.map((e: any) => Validator.fromJSON(e))
        : [],
      pagination: isSet(object.pagination)
        ? PageResponse.fromJSON(object.pagination)
        : undefined,
    };
  },
  toJSON(
    message: QueryDelegatorValidatorsResponse,
  ): JsonSafe<QueryDelegatorValidatorsResponse> {
    const obj: any = {};
    if (message.validators) {
      obj.validators = message.validators.map(e =>
        e ? Validator.toJSON(e) : undefined,
      );
    } else {
      obj.validators = [];
    }
    message.pagination !== undefined &&
      (obj.pagination = message.pagination
        ? PageResponse.toJSON(message.pagination)
        : undefined);
    return obj;
  },
  fromPartial(
    object: Partial<QueryDelegatorValidatorsResponse>,
  ): QueryDelegatorValidatorsResponse {
    const message = createBaseQueryDelegatorValidatorsResponse();
    message.validators =
      object.validators?.map(e => Validator.fromPartial(e)) || [];
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageResponse.fromPartial(object.pagination)
        : undefined;
    return message;
  },
  fromProtoMsg(
    message: QueryDelegatorValidatorsResponseProtoMsg,
  ): QueryDelegatorValidatorsResponse {
    return QueryDelegatorValidatorsResponse.decode(message.value);
  },
  toProto(message: QueryDelegatorValidatorsResponse): Uint8Array {
    return QueryDelegatorValidatorsResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QueryDelegatorValidatorsResponse,
  ): QueryDelegatorValidatorsResponseProtoMsg {
    return {
      typeUrl: '/cosmos.staking.v1beta1.QueryDelegatorValidatorsResponse',
      value: QueryDelegatorValidatorsResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryDelegatorValidatorRequest(): QueryDelegatorValidatorRequest {
  return {
    delegatorAddr: '',
    validatorAddr: '',
  };
}
export const QueryDelegatorValidatorRequest = {
  typeUrl: '/cosmos.staking.v1beta1.QueryDelegatorValidatorRequest',
  encode(
    message: QueryDelegatorValidatorRequest,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.delegatorAddr !== '') {
      writer.uint32(10).string(message.delegatorAddr);
    }
    if (message.validatorAddr !== '') {
      writer.uint32(18).string(message.validatorAddr);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryDelegatorValidatorRequest {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryDelegatorValidatorRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.delegatorAddr = reader.string();
          break;
        case 2:
          message.validatorAddr = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryDelegatorValidatorRequest {
    return {
      delegatorAddr: isSet(object.delegatorAddr)
        ? String(object.delegatorAddr)
        : '',
      validatorAddr: isSet(object.validatorAddr)
        ? String(object.validatorAddr)
        : '',
    };
  },
  toJSON(
    message: QueryDelegatorValidatorRequest,
  ): JsonSafe<QueryDelegatorValidatorRequest> {
    const obj: any = {};
    message.delegatorAddr !== undefined &&
      (obj.delegatorAddr = message.delegatorAddr);
    message.validatorAddr !== undefined &&
      (obj.validatorAddr = message.validatorAddr);
    return obj;
  },
  fromPartial(
    object: Partial<QueryDelegatorValidatorRequest>,
  ): QueryDelegatorValidatorRequest {
    const message = createBaseQueryDelegatorValidatorRequest();
    message.delegatorAddr = object.delegatorAddr ?? '';
    message.validatorAddr = object.validatorAddr ?? '';
    return message;
  },
  fromProtoMsg(
    message: QueryDelegatorValidatorRequestProtoMsg,
  ): QueryDelegatorValidatorRequest {
    return QueryDelegatorValidatorRequest.decode(message.value);
  },
  toProto(message: QueryDelegatorValidatorRequest): Uint8Array {
    return QueryDelegatorValidatorRequest.encode(message).finish();
  },
  toProtoMsg(
    message: QueryDelegatorValidatorRequest,
  ): QueryDelegatorValidatorRequestProtoMsg {
    return {
      typeUrl: '/cosmos.staking.v1beta1.QueryDelegatorValidatorRequest',
      value: QueryDelegatorValidatorRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryDelegatorValidatorResponse(): QueryDelegatorValidatorResponse {
  return {
    validator: Validator.fromPartial({}),
  };
}
export const QueryDelegatorValidatorResponse = {
  typeUrl: '/cosmos.staking.v1beta1.QueryDelegatorValidatorResponse',
  encode(
    message: QueryDelegatorValidatorResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.validator !== undefined) {
      Validator.encode(message.validator, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryDelegatorValidatorResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryDelegatorValidatorResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.validator = Validator.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryDelegatorValidatorResponse {
    return {
      validator: isSet(object.validator)
        ? Validator.fromJSON(object.validator)
        : undefined,
    };
  },
  toJSON(
    message: QueryDelegatorValidatorResponse,
  ): JsonSafe<QueryDelegatorValidatorResponse> {
    const obj: any = {};
    message.validator !== undefined &&
      (obj.validator = message.validator
        ? Validator.toJSON(message.validator)
        : undefined);
    return obj;
  },
  fromPartial(
    object: Partial<QueryDelegatorValidatorResponse>,
  ): QueryDelegatorValidatorResponse {
    const message = createBaseQueryDelegatorValidatorResponse();
    message.validator =
      object.validator !== undefined && object.validator !== null
        ? Validator.fromPartial(object.validator)
        : undefined;
    return message;
  },
  fromProtoMsg(
    message: QueryDelegatorValidatorResponseProtoMsg,
  ): QueryDelegatorValidatorResponse {
    return QueryDelegatorValidatorResponse.decode(message.value);
  },
  toProto(message: QueryDelegatorValidatorResponse): Uint8Array {
    return QueryDelegatorValidatorResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QueryDelegatorValidatorResponse,
  ): QueryDelegatorValidatorResponseProtoMsg {
    return {
      typeUrl: '/cosmos.staking.v1beta1.QueryDelegatorValidatorResponse',
      value: QueryDelegatorValidatorResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryHistoricalInfoRequest(): QueryHistoricalInfoRequest {
  return {
    height: BigInt(0),
  };
}
export const QueryHistoricalInfoRequest = {
  typeUrl: '/cosmos.staking.v1beta1.QueryHistoricalInfoRequest',
  encode(
    message: QueryHistoricalInfoRequest,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.height !== BigInt(0)) {
      writer.uint32(8).int64(message.height);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryHistoricalInfoRequest {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryHistoricalInfoRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.height = reader.int64();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryHistoricalInfoRequest {
    return {
      height: isSet(object.height)
        ? BigInt(object.height.toString())
        : BigInt(0),
    };
  },
  toJSON(
    message: QueryHistoricalInfoRequest,
  ): JsonSafe<QueryHistoricalInfoRequest> {
    const obj: any = {};
    message.height !== undefined &&
      (obj.height = (message.height || BigInt(0)).toString());
    return obj;
  },
  fromPartial(
    object: Partial<QueryHistoricalInfoRequest>,
  ): QueryHistoricalInfoRequest {
    const message = createBaseQueryHistoricalInfoRequest();
    message.height =
      object.height !== undefined && object.height !== null
        ? BigInt(object.height.toString())
        : BigInt(0);
    return message;
  },
  fromProtoMsg(
    message: QueryHistoricalInfoRequestProtoMsg,
  ): QueryHistoricalInfoRequest {
    return QueryHistoricalInfoRequest.decode(message.value);
  },
  toProto(message: QueryHistoricalInfoRequest): Uint8Array {
    return QueryHistoricalInfoRequest.encode(message).finish();
  },
  toProtoMsg(
    message: QueryHistoricalInfoRequest,
  ): QueryHistoricalInfoRequestProtoMsg {
    return {
      typeUrl: '/cosmos.staking.v1beta1.QueryHistoricalInfoRequest',
      value: QueryHistoricalInfoRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryHistoricalInfoResponse(): QueryHistoricalInfoResponse {
  return {
    hist: undefined,
  };
}
export const QueryHistoricalInfoResponse = {
  typeUrl: '/cosmos.staking.v1beta1.QueryHistoricalInfoResponse',
  encode(
    message: QueryHistoricalInfoResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.hist !== undefined) {
      HistoricalInfo.encode(message.hist, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryHistoricalInfoResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryHistoricalInfoResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.hist = HistoricalInfo.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryHistoricalInfoResponse {
    return {
      hist: isSet(object.hist)
        ? HistoricalInfo.fromJSON(object.hist)
        : undefined,
    };
  },
  toJSON(
    message: QueryHistoricalInfoResponse,
  ): JsonSafe<QueryHistoricalInfoResponse> {
    const obj: any = {};
    message.hist !== undefined &&
      (obj.hist = message.hist
        ? HistoricalInfo.toJSON(message.hist)
        : undefined);
    return obj;
  },
  fromPartial(
    object: Partial<QueryHistoricalInfoResponse>,
  ): QueryHistoricalInfoResponse {
    const message = createBaseQueryHistoricalInfoResponse();
    message.hist =
      object.hist !== undefined && object.hist !== null
        ? HistoricalInfo.fromPartial(object.hist)
        : undefined;
    return message;
  },
  fromProtoMsg(
    message: QueryHistoricalInfoResponseProtoMsg,
  ): QueryHistoricalInfoResponse {
    return QueryHistoricalInfoResponse.decode(message.value);
  },
  toProto(message: QueryHistoricalInfoResponse): Uint8Array {
    return QueryHistoricalInfoResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QueryHistoricalInfoResponse,
  ): QueryHistoricalInfoResponseProtoMsg {
    return {
      typeUrl: '/cosmos.staking.v1beta1.QueryHistoricalInfoResponse',
      value: QueryHistoricalInfoResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryPoolRequest(): QueryPoolRequest {
  return {};
}
export const QueryPoolRequest = {
  typeUrl: '/cosmos.staking.v1beta1.QueryPoolRequest',
  encode(
    _: QueryPoolRequest,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): QueryPoolRequest {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryPoolRequest();
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
  fromJSON(_: any): QueryPoolRequest {
    return {};
  },
  toJSON(_: QueryPoolRequest): JsonSafe<QueryPoolRequest> {
    const obj: any = {};
    return obj;
  },
  fromPartial(_: Partial<QueryPoolRequest>): QueryPoolRequest {
    const message = createBaseQueryPoolRequest();
    return message;
  },
  fromProtoMsg(message: QueryPoolRequestProtoMsg): QueryPoolRequest {
    return QueryPoolRequest.decode(message.value);
  },
  toProto(message: QueryPoolRequest): Uint8Array {
    return QueryPoolRequest.encode(message).finish();
  },
  toProtoMsg(message: QueryPoolRequest): QueryPoolRequestProtoMsg {
    return {
      typeUrl: '/cosmos.staking.v1beta1.QueryPoolRequest',
      value: QueryPoolRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryPoolResponse(): QueryPoolResponse {
  return {
    pool: Pool.fromPartial({}),
  };
}
export const QueryPoolResponse = {
  typeUrl: '/cosmos.staking.v1beta1.QueryPoolResponse',
  encode(
    message: QueryPoolResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.pool !== undefined) {
      Pool.encode(message.pool, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): QueryPoolResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryPoolResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.pool = Pool.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryPoolResponse {
    return {
      pool: isSet(object.pool) ? Pool.fromJSON(object.pool) : undefined,
    };
  },
  toJSON(message: QueryPoolResponse): JsonSafe<QueryPoolResponse> {
    const obj: any = {};
    message.pool !== undefined &&
      (obj.pool = message.pool ? Pool.toJSON(message.pool) : undefined);
    return obj;
  },
  fromPartial(object: Partial<QueryPoolResponse>): QueryPoolResponse {
    const message = createBaseQueryPoolResponse();
    message.pool =
      object.pool !== undefined && object.pool !== null
        ? Pool.fromPartial(object.pool)
        : undefined;
    return message;
  },
  fromProtoMsg(message: QueryPoolResponseProtoMsg): QueryPoolResponse {
    return QueryPoolResponse.decode(message.value);
  },
  toProto(message: QueryPoolResponse): Uint8Array {
    return QueryPoolResponse.encode(message).finish();
  },
  toProtoMsg(message: QueryPoolResponse): QueryPoolResponseProtoMsg {
    return {
      typeUrl: '/cosmos.staking.v1beta1.QueryPoolResponse',
      value: QueryPoolResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryParamsRequest(): QueryParamsRequest {
  return {};
}
export const QueryParamsRequest = {
  typeUrl: '/cosmos.staking.v1beta1.QueryParamsRequest',
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
      typeUrl: '/cosmos.staking.v1beta1.QueryParamsRequest',
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
  typeUrl: '/cosmos.staking.v1beta1.QueryParamsResponse',
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
      typeUrl: '/cosmos.staking.v1beta1.QueryParamsResponse',
      value: QueryParamsResponse.encode(message).finish(),
    };
  },
};
