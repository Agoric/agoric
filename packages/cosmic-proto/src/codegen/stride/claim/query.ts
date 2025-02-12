//@ts-nocheck
import {
  Action,
  ClaimRecord,
  type ClaimRecordSDKType,
  actionFromJSON,
  actionToJSON,
} from './claim.js';
import {
  Timestamp,
  type TimestampSDKType,
} from '../../google/protobuf/timestamp.js';
import { Coin, type CoinSDKType } from '../../cosmos/base/v1beta1/coin.js';
import { Params, type ParamsSDKType } from './params.js';
import { Period, type PeriodSDKType } from '../vesting/vesting.js';
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { isSet, fromJsonTimestamp, fromTimestamp } from '../../helpers.js';
import { type JsonSafe } from '../../json-safe.js';
export interface ClaimStatus {
  airdropIdentifier: string;
  claimed: boolean;
}
export interface ClaimStatusProtoMsg {
  typeUrl: '/stride.claim.ClaimStatus';
  value: Uint8Array;
}
export interface ClaimStatusSDKType {
  airdrop_identifier: string;
  claimed: boolean;
}
export interface QueryClaimStatusRequest {
  address: string;
}
export interface QueryClaimStatusRequestProtoMsg {
  typeUrl: '/stride.claim.QueryClaimStatusRequest';
  value: Uint8Array;
}
export interface QueryClaimStatusRequestSDKType {
  address: string;
}
export interface QueryClaimStatusResponse {
  claimStatus: ClaimStatus[];
}
export interface QueryClaimStatusResponseProtoMsg {
  typeUrl: '/stride.claim.QueryClaimStatusResponse';
  value: Uint8Array;
}
export interface QueryClaimStatusResponseSDKType {
  claim_status: ClaimStatusSDKType[];
}
export interface ClaimMetadata {
  airdropIdentifier: string;
  currentRound: string;
  currentRoundStart: Timestamp;
  currentRoundEnd: Timestamp;
}
export interface ClaimMetadataProtoMsg {
  typeUrl: '/stride.claim.ClaimMetadata';
  value: Uint8Array;
}
export interface ClaimMetadataSDKType {
  airdrop_identifier: string;
  current_round: string;
  current_round_start: TimestampSDKType;
  current_round_end: TimestampSDKType;
}
export interface QueryClaimMetadataRequest {}
export interface QueryClaimMetadataRequestProtoMsg {
  typeUrl: '/stride.claim.QueryClaimMetadataRequest';
  value: Uint8Array;
}
export interface QueryClaimMetadataRequestSDKType {}
export interface QueryClaimMetadataResponse {
  claimMetadata: ClaimMetadata[];
}
export interface QueryClaimMetadataResponseProtoMsg {
  typeUrl: '/stride.claim.QueryClaimMetadataResponse';
  value: Uint8Array;
}
export interface QueryClaimMetadataResponseSDKType {
  claim_metadata: ClaimMetadataSDKType[];
}
/** QueryParamsRequest is the request type for the Query/Params RPC method. */
export interface QueryDistributorAccountBalanceRequest {
  airdropIdentifier: string;
}
export interface QueryDistributorAccountBalanceRequestProtoMsg {
  typeUrl: '/stride.claim.QueryDistributorAccountBalanceRequest';
  value: Uint8Array;
}
/** QueryParamsRequest is the request type for the Query/Params RPC method. */
export interface QueryDistributorAccountBalanceRequestSDKType {
  airdrop_identifier: string;
}
/** QueryParamsResponse is the response type for the Query/Params RPC method. */
export interface QueryDistributorAccountBalanceResponse {
  /** params defines the parameters of the module. */
  distributorAccountBalance: Coin[];
}
export interface QueryDistributorAccountBalanceResponseProtoMsg {
  typeUrl: '/stride.claim.QueryDistributorAccountBalanceResponse';
  value: Uint8Array;
}
/** QueryParamsResponse is the response type for the Query/Params RPC method. */
export interface QueryDistributorAccountBalanceResponseSDKType {
  distributor_account_balance: CoinSDKType[];
}
/** QueryParamsRequest is the request type for the Query/Params RPC method. */
export interface QueryParamsRequest {}
export interface QueryParamsRequestProtoMsg {
  typeUrl: '/stride.claim.QueryParamsRequest';
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
  typeUrl: '/stride.claim.QueryParamsResponse';
  value: Uint8Array;
}
/** QueryParamsResponse is the response type for the Query/Params RPC method. */
export interface QueryParamsResponseSDKType {
  params: ParamsSDKType;
}
export interface QueryClaimRecordRequest {
  airdropIdentifier: string;
  address: string;
}
export interface QueryClaimRecordRequestProtoMsg {
  typeUrl: '/stride.claim.QueryClaimRecordRequest';
  value: Uint8Array;
}
export interface QueryClaimRecordRequestSDKType {
  airdrop_identifier: string;
  address: string;
}
export interface QueryClaimRecordResponse {
  claimRecord: ClaimRecord;
}
export interface QueryClaimRecordResponseProtoMsg {
  typeUrl: '/stride.claim.QueryClaimRecordResponse';
  value: Uint8Array;
}
export interface QueryClaimRecordResponseSDKType {
  claim_record: ClaimRecordSDKType;
}
export interface QueryClaimableForActionRequest {
  airdropIdentifier: string;
  address: string;
  action: Action;
}
export interface QueryClaimableForActionRequestProtoMsg {
  typeUrl: '/stride.claim.QueryClaimableForActionRequest';
  value: Uint8Array;
}
export interface QueryClaimableForActionRequestSDKType {
  airdrop_identifier: string;
  address: string;
  action: Action;
}
export interface QueryClaimableForActionResponse {
  coins: Coin[];
}
export interface QueryClaimableForActionResponseProtoMsg {
  typeUrl: '/stride.claim.QueryClaimableForActionResponse';
  value: Uint8Array;
}
export interface QueryClaimableForActionResponseSDKType {
  coins: CoinSDKType[];
}
export interface QueryTotalClaimableRequest {
  airdropIdentifier: string;
  address: string;
  includeClaimed: boolean;
}
export interface QueryTotalClaimableRequestProtoMsg {
  typeUrl: '/stride.claim.QueryTotalClaimableRequest';
  value: Uint8Array;
}
export interface QueryTotalClaimableRequestSDKType {
  airdrop_identifier: string;
  address: string;
  include_claimed: boolean;
}
export interface QueryTotalClaimableResponse {
  coins: Coin[];
}
export interface QueryTotalClaimableResponseProtoMsg {
  typeUrl: '/stride.claim.QueryTotalClaimableResponse';
  value: Uint8Array;
}
export interface QueryTotalClaimableResponseSDKType {
  coins: CoinSDKType[];
}
export interface QueryUserVestingsRequest {
  address: string;
}
export interface QueryUserVestingsRequestProtoMsg {
  typeUrl: '/stride.claim.QueryUserVestingsRequest';
  value: Uint8Array;
}
export interface QueryUserVestingsRequestSDKType {
  address: string;
}
export interface QueryUserVestingsResponse {
  spendableCoins: Coin[];
  periods: Period[];
}
export interface QueryUserVestingsResponseProtoMsg {
  typeUrl: '/stride.claim.QueryUserVestingsResponse';
  value: Uint8Array;
}
export interface QueryUserVestingsResponseSDKType {
  spendable_coins: CoinSDKType[];
  periods: PeriodSDKType[];
}
function createBaseClaimStatus(): ClaimStatus {
  return {
    airdropIdentifier: '',
    claimed: false,
  };
}
export const ClaimStatus = {
  typeUrl: '/stride.claim.ClaimStatus',
  encode(
    message: ClaimStatus,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.airdropIdentifier !== '') {
      writer.uint32(10).string(message.airdropIdentifier);
    }
    if (message.claimed === true) {
      writer.uint32(16).bool(message.claimed);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): ClaimStatus {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseClaimStatus();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.airdropIdentifier = reader.string();
          break;
        case 2:
          message.claimed = reader.bool();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): ClaimStatus {
    return {
      airdropIdentifier: isSet(object.airdropIdentifier)
        ? String(object.airdropIdentifier)
        : '',
      claimed: isSet(object.claimed) ? Boolean(object.claimed) : false,
    };
  },
  toJSON(message: ClaimStatus): JsonSafe<ClaimStatus> {
    const obj: any = {};
    message.airdropIdentifier !== undefined &&
      (obj.airdropIdentifier = message.airdropIdentifier);
    message.claimed !== undefined && (obj.claimed = message.claimed);
    return obj;
  },
  fromPartial(object: Partial<ClaimStatus>): ClaimStatus {
    const message = createBaseClaimStatus();
    message.airdropIdentifier = object.airdropIdentifier ?? '';
    message.claimed = object.claimed ?? false;
    return message;
  },
  fromProtoMsg(message: ClaimStatusProtoMsg): ClaimStatus {
    return ClaimStatus.decode(message.value);
  },
  toProto(message: ClaimStatus): Uint8Array {
    return ClaimStatus.encode(message).finish();
  },
  toProtoMsg(message: ClaimStatus): ClaimStatusProtoMsg {
    return {
      typeUrl: '/stride.claim.ClaimStatus',
      value: ClaimStatus.encode(message).finish(),
    };
  },
};
function createBaseQueryClaimStatusRequest(): QueryClaimStatusRequest {
  return {
    address: '',
  };
}
export const QueryClaimStatusRequest = {
  typeUrl: '/stride.claim.QueryClaimStatusRequest',
  encode(
    message: QueryClaimStatusRequest,
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
  ): QueryClaimStatusRequest {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryClaimStatusRequest();
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
  fromJSON(object: any): QueryClaimStatusRequest {
    return {
      address: isSet(object.address) ? String(object.address) : '',
    };
  },
  toJSON(message: QueryClaimStatusRequest): JsonSafe<QueryClaimStatusRequest> {
    const obj: any = {};
    message.address !== undefined && (obj.address = message.address);
    return obj;
  },
  fromPartial(
    object: Partial<QueryClaimStatusRequest>,
  ): QueryClaimStatusRequest {
    const message = createBaseQueryClaimStatusRequest();
    message.address = object.address ?? '';
    return message;
  },
  fromProtoMsg(
    message: QueryClaimStatusRequestProtoMsg,
  ): QueryClaimStatusRequest {
    return QueryClaimStatusRequest.decode(message.value);
  },
  toProto(message: QueryClaimStatusRequest): Uint8Array {
    return QueryClaimStatusRequest.encode(message).finish();
  },
  toProtoMsg(
    message: QueryClaimStatusRequest,
  ): QueryClaimStatusRequestProtoMsg {
    return {
      typeUrl: '/stride.claim.QueryClaimStatusRequest',
      value: QueryClaimStatusRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryClaimStatusResponse(): QueryClaimStatusResponse {
  return {
    claimStatus: [],
  };
}
export const QueryClaimStatusResponse = {
  typeUrl: '/stride.claim.QueryClaimStatusResponse',
  encode(
    message: QueryClaimStatusResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    for (const v of message.claimStatus) {
      ClaimStatus.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryClaimStatusResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryClaimStatusResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.claimStatus.push(ClaimStatus.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryClaimStatusResponse {
    return {
      claimStatus: Array.isArray(object?.claimStatus)
        ? object.claimStatus.map((e: any) => ClaimStatus.fromJSON(e))
        : [],
    };
  },
  toJSON(
    message: QueryClaimStatusResponse,
  ): JsonSafe<QueryClaimStatusResponse> {
    const obj: any = {};
    if (message.claimStatus) {
      obj.claimStatus = message.claimStatus.map(e =>
        e ? ClaimStatus.toJSON(e) : undefined,
      );
    } else {
      obj.claimStatus = [];
    }
    return obj;
  },
  fromPartial(
    object: Partial<QueryClaimStatusResponse>,
  ): QueryClaimStatusResponse {
    const message = createBaseQueryClaimStatusResponse();
    message.claimStatus =
      object.claimStatus?.map(e => ClaimStatus.fromPartial(e)) || [];
    return message;
  },
  fromProtoMsg(
    message: QueryClaimStatusResponseProtoMsg,
  ): QueryClaimStatusResponse {
    return QueryClaimStatusResponse.decode(message.value);
  },
  toProto(message: QueryClaimStatusResponse): Uint8Array {
    return QueryClaimStatusResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QueryClaimStatusResponse,
  ): QueryClaimStatusResponseProtoMsg {
    return {
      typeUrl: '/stride.claim.QueryClaimStatusResponse',
      value: QueryClaimStatusResponse.encode(message).finish(),
    };
  },
};
function createBaseClaimMetadata(): ClaimMetadata {
  return {
    airdropIdentifier: '',
    currentRound: '',
    currentRoundStart: Timestamp.fromPartial({}),
    currentRoundEnd: Timestamp.fromPartial({}),
  };
}
export const ClaimMetadata = {
  typeUrl: '/stride.claim.ClaimMetadata',
  encode(
    message: ClaimMetadata,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.airdropIdentifier !== '') {
      writer.uint32(10).string(message.airdropIdentifier);
    }
    if (message.currentRound !== '') {
      writer.uint32(18).string(message.currentRound);
    }
    if (message.currentRoundStart !== undefined) {
      Timestamp.encode(
        message.currentRoundStart,
        writer.uint32(26).fork(),
      ).ldelim();
    }
    if (message.currentRoundEnd !== undefined) {
      Timestamp.encode(
        message.currentRoundEnd,
        writer.uint32(34).fork(),
      ).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): ClaimMetadata {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseClaimMetadata();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.airdropIdentifier = reader.string();
          break;
        case 2:
          message.currentRound = reader.string();
          break;
        case 3:
          message.currentRoundStart = Timestamp.decode(reader, reader.uint32());
          break;
        case 4:
          message.currentRoundEnd = Timestamp.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): ClaimMetadata {
    return {
      airdropIdentifier: isSet(object.airdropIdentifier)
        ? String(object.airdropIdentifier)
        : '',
      currentRound: isSet(object.currentRound)
        ? String(object.currentRound)
        : '',
      currentRoundStart: isSet(object.currentRoundStart)
        ? fromJsonTimestamp(object.currentRoundStart)
        : undefined,
      currentRoundEnd: isSet(object.currentRoundEnd)
        ? fromJsonTimestamp(object.currentRoundEnd)
        : undefined,
    };
  },
  toJSON(message: ClaimMetadata): JsonSafe<ClaimMetadata> {
    const obj: any = {};
    message.airdropIdentifier !== undefined &&
      (obj.airdropIdentifier = message.airdropIdentifier);
    message.currentRound !== undefined &&
      (obj.currentRound = message.currentRound);
    message.currentRoundStart !== undefined &&
      (obj.currentRoundStart = fromTimestamp(
        message.currentRoundStart,
      ).toISOString());
    message.currentRoundEnd !== undefined &&
      (obj.currentRoundEnd = fromTimestamp(
        message.currentRoundEnd,
      ).toISOString());
    return obj;
  },
  fromPartial(object: Partial<ClaimMetadata>): ClaimMetadata {
    const message = createBaseClaimMetadata();
    message.airdropIdentifier = object.airdropIdentifier ?? '';
    message.currentRound = object.currentRound ?? '';
    message.currentRoundStart =
      object.currentRoundStart !== undefined &&
      object.currentRoundStart !== null
        ? Timestamp.fromPartial(object.currentRoundStart)
        : undefined;
    message.currentRoundEnd =
      object.currentRoundEnd !== undefined && object.currentRoundEnd !== null
        ? Timestamp.fromPartial(object.currentRoundEnd)
        : undefined;
    return message;
  },
  fromProtoMsg(message: ClaimMetadataProtoMsg): ClaimMetadata {
    return ClaimMetadata.decode(message.value);
  },
  toProto(message: ClaimMetadata): Uint8Array {
    return ClaimMetadata.encode(message).finish();
  },
  toProtoMsg(message: ClaimMetadata): ClaimMetadataProtoMsg {
    return {
      typeUrl: '/stride.claim.ClaimMetadata',
      value: ClaimMetadata.encode(message).finish(),
    };
  },
};
function createBaseQueryClaimMetadataRequest(): QueryClaimMetadataRequest {
  return {};
}
export const QueryClaimMetadataRequest = {
  typeUrl: '/stride.claim.QueryClaimMetadataRequest',
  encode(
    _: QueryClaimMetadataRequest,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryClaimMetadataRequest {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryClaimMetadataRequest();
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
  fromJSON(_: any): QueryClaimMetadataRequest {
    return {};
  },
  toJSON(_: QueryClaimMetadataRequest): JsonSafe<QueryClaimMetadataRequest> {
    const obj: any = {};
    return obj;
  },
  fromPartial(
    _: Partial<QueryClaimMetadataRequest>,
  ): QueryClaimMetadataRequest {
    const message = createBaseQueryClaimMetadataRequest();
    return message;
  },
  fromProtoMsg(
    message: QueryClaimMetadataRequestProtoMsg,
  ): QueryClaimMetadataRequest {
    return QueryClaimMetadataRequest.decode(message.value);
  },
  toProto(message: QueryClaimMetadataRequest): Uint8Array {
    return QueryClaimMetadataRequest.encode(message).finish();
  },
  toProtoMsg(
    message: QueryClaimMetadataRequest,
  ): QueryClaimMetadataRequestProtoMsg {
    return {
      typeUrl: '/stride.claim.QueryClaimMetadataRequest',
      value: QueryClaimMetadataRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryClaimMetadataResponse(): QueryClaimMetadataResponse {
  return {
    claimMetadata: [],
  };
}
export const QueryClaimMetadataResponse = {
  typeUrl: '/stride.claim.QueryClaimMetadataResponse',
  encode(
    message: QueryClaimMetadataResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    for (const v of message.claimMetadata) {
      ClaimMetadata.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryClaimMetadataResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryClaimMetadataResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.claimMetadata.push(
            ClaimMetadata.decode(reader, reader.uint32()),
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryClaimMetadataResponse {
    return {
      claimMetadata: Array.isArray(object?.claimMetadata)
        ? object.claimMetadata.map((e: any) => ClaimMetadata.fromJSON(e))
        : [],
    };
  },
  toJSON(
    message: QueryClaimMetadataResponse,
  ): JsonSafe<QueryClaimMetadataResponse> {
    const obj: any = {};
    if (message.claimMetadata) {
      obj.claimMetadata = message.claimMetadata.map(e =>
        e ? ClaimMetadata.toJSON(e) : undefined,
      );
    } else {
      obj.claimMetadata = [];
    }
    return obj;
  },
  fromPartial(
    object: Partial<QueryClaimMetadataResponse>,
  ): QueryClaimMetadataResponse {
    const message = createBaseQueryClaimMetadataResponse();
    message.claimMetadata =
      object.claimMetadata?.map(e => ClaimMetadata.fromPartial(e)) || [];
    return message;
  },
  fromProtoMsg(
    message: QueryClaimMetadataResponseProtoMsg,
  ): QueryClaimMetadataResponse {
    return QueryClaimMetadataResponse.decode(message.value);
  },
  toProto(message: QueryClaimMetadataResponse): Uint8Array {
    return QueryClaimMetadataResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QueryClaimMetadataResponse,
  ): QueryClaimMetadataResponseProtoMsg {
    return {
      typeUrl: '/stride.claim.QueryClaimMetadataResponse',
      value: QueryClaimMetadataResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryDistributorAccountBalanceRequest(): QueryDistributorAccountBalanceRequest {
  return {
    airdropIdentifier: '',
  };
}
export const QueryDistributorAccountBalanceRequest = {
  typeUrl: '/stride.claim.QueryDistributorAccountBalanceRequest',
  encode(
    message: QueryDistributorAccountBalanceRequest,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.airdropIdentifier !== '') {
      writer.uint32(10).string(message.airdropIdentifier);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryDistributorAccountBalanceRequest {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryDistributorAccountBalanceRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.airdropIdentifier = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryDistributorAccountBalanceRequest {
    return {
      airdropIdentifier: isSet(object.airdropIdentifier)
        ? String(object.airdropIdentifier)
        : '',
    };
  },
  toJSON(
    message: QueryDistributorAccountBalanceRequest,
  ): JsonSafe<QueryDistributorAccountBalanceRequest> {
    const obj: any = {};
    message.airdropIdentifier !== undefined &&
      (obj.airdropIdentifier = message.airdropIdentifier);
    return obj;
  },
  fromPartial(
    object: Partial<QueryDistributorAccountBalanceRequest>,
  ): QueryDistributorAccountBalanceRequest {
    const message = createBaseQueryDistributorAccountBalanceRequest();
    message.airdropIdentifier = object.airdropIdentifier ?? '';
    return message;
  },
  fromProtoMsg(
    message: QueryDistributorAccountBalanceRequestProtoMsg,
  ): QueryDistributorAccountBalanceRequest {
    return QueryDistributorAccountBalanceRequest.decode(message.value);
  },
  toProto(message: QueryDistributorAccountBalanceRequest): Uint8Array {
    return QueryDistributorAccountBalanceRequest.encode(message).finish();
  },
  toProtoMsg(
    message: QueryDistributorAccountBalanceRequest,
  ): QueryDistributorAccountBalanceRequestProtoMsg {
    return {
      typeUrl: '/stride.claim.QueryDistributorAccountBalanceRequest',
      value: QueryDistributorAccountBalanceRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryDistributorAccountBalanceResponse(): QueryDistributorAccountBalanceResponse {
  return {
    distributorAccountBalance: [],
  };
}
export const QueryDistributorAccountBalanceResponse = {
  typeUrl: '/stride.claim.QueryDistributorAccountBalanceResponse',
  encode(
    message: QueryDistributorAccountBalanceResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    for (const v of message.distributorAccountBalance) {
      Coin.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryDistributorAccountBalanceResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryDistributorAccountBalanceResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.distributorAccountBalance.push(
            Coin.decode(reader, reader.uint32()),
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryDistributorAccountBalanceResponse {
    return {
      distributorAccountBalance: Array.isArray(
        object?.distributorAccountBalance,
      )
        ? object.distributorAccountBalance.map((e: any) => Coin.fromJSON(e))
        : [],
    };
  },
  toJSON(
    message: QueryDistributorAccountBalanceResponse,
  ): JsonSafe<QueryDistributorAccountBalanceResponse> {
    const obj: any = {};
    if (message.distributorAccountBalance) {
      obj.distributorAccountBalance = message.distributorAccountBalance.map(
        e => (e ? Coin.toJSON(e) : undefined),
      );
    } else {
      obj.distributorAccountBalance = [];
    }
    return obj;
  },
  fromPartial(
    object: Partial<QueryDistributorAccountBalanceResponse>,
  ): QueryDistributorAccountBalanceResponse {
    const message = createBaseQueryDistributorAccountBalanceResponse();
    message.distributorAccountBalance =
      object.distributorAccountBalance?.map(e => Coin.fromPartial(e)) || [];
    return message;
  },
  fromProtoMsg(
    message: QueryDistributorAccountBalanceResponseProtoMsg,
  ): QueryDistributorAccountBalanceResponse {
    return QueryDistributorAccountBalanceResponse.decode(message.value);
  },
  toProto(message: QueryDistributorAccountBalanceResponse): Uint8Array {
    return QueryDistributorAccountBalanceResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QueryDistributorAccountBalanceResponse,
  ): QueryDistributorAccountBalanceResponseProtoMsg {
    return {
      typeUrl: '/stride.claim.QueryDistributorAccountBalanceResponse',
      value: QueryDistributorAccountBalanceResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryParamsRequest(): QueryParamsRequest {
  return {};
}
export const QueryParamsRequest = {
  typeUrl: '/stride.claim.QueryParamsRequest',
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
      typeUrl: '/stride.claim.QueryParamsRequest',
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
  typeUrl: '/stride.claim.QueryParamsResponse',
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
      typeUrl: '/stride.claim.QueryParamsResponse',
      value: QueryParamsResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryClaimRecordRequest(): QueryClaimRecordRequest {
  return {
    airdropIdentifier: '',
    address: '',
  };
}
export const QueryClaimRecordRequest = {
  typeUrl: '/stride.claim.QueryClaimRecordRequest',
  encode(
    message: QueryClaimRecordRequest,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.airdropIdentifier !== '') {
      writer.uint32(10).string(message.airdropIdentifier);
    }
    if (message.address !== '') {
      writer.uint32(18).string(message.address);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryClaimRecordRequest {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryClaimRecordRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.airdropIdentifier = reader.string();
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
  fromJSON(object: any): QueryClaimRecordRequest {
    return {
      airdropIdentifier: isSet(object.airdropIdentifier)
        ? String(object.airdropIdentifier)
        : '',
      address: isSet(object.address) ? String(object.address) : '',
    };
  },
  toJSON(message: QueryClaimRecordRequest): JsonSafe<QueryClaimRecordRequest> {
    const obj: any = {};
    message.airdropIdentifier !== undefined &&
      (obj.airdropIdentifier = message.airdropIdentifier);
    message.address !== undefined && (obj.address = message.address);
    return obj;
  },
  fromPartial(
    object: Partial<QueryClaimRecordRequest>,
  ): QueryClaimRecordRequest {
    const message = createBaseQueryClaimRecordRequest();
    message.airdropIdentifier = object.airdropIdentifier ?? '';
    message.address = object.address ?? '';
    return message;
  },
  fromProtoMsg(
    message: QueryClaimRecordRequestProtoMsg,
  ): QueryClaimRecordRequest {
    return QueryClaimRecordRequest.decode(message.value);
  },
  toProto(message: QueryClaimRecordRequest): Uint8Array {
    return QueryClaimRecordRequest.encode(message).finish();
  },
  toProtoMsg(
    message: QueryClaimRecordRequest,
  ): QueryClaimRecordRequestProtoMsg {
    return {
      typeUrl: '/stride.claim.QueryClaimRecordRequest',
      value: QueryClaimRecordRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryClaimRecordResponse(): QueryClaimRecordResponse {
  return {
    claimRecord: ClaimRecord.fromPartial({}),
  };
}
export const QueryClaimRecordResponse = {
  typeUrl: '/stride.claim.QueryClaimRecordResponse',
  encode(
    message: QueryClaimRecordResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.claimRecord !== undefined) {
      ClaimRecord.encode(
        message.claimRecord,
        writer.uint32(10).fork(),
      ).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryClaimRecordResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryClaimRecordResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.claimRecord = ClaimRecord.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryClaimRecordResponse {
    return {
      claimRecord: isSet(object.claimRecord)
        ? ClaimRecord.fromJSON(object.claimRecord)
        : undefined,
    };
  },
  toJSON(
    message: QueryClaimRecordResponse,
  ): JsonSafe<QueryClaimRecordResponse> {
    const obj: any = {};
    message.claimRecord !== undefined &&
      (obj.claimRecord = message.claimRecord
        ? ClaimRecord.toJSON(message.claimRecord)
        : undefined);
    return obj;
  },
  fromPartial(
    object: Partial<QueryClaimRecordResponse>,
  ): QueryClaimRecordResponse {
    const message = createBaseQueryClaimRecordResponse();
    message.claimRecord =
      object.claimRecord !== undefined && object.claimRecord !== null
        ? ClaimRecord.fromPartial(object.claimRecord)
        : undefined;
    return message;
  },
  fromProtoMsg(
    message: QueryClaimRecordResponseProtoMsg,
  ): QueryClaimRecordResponse {
    return QueryClaimRecordResponse.decode(message.value);
  },
  toProto(message: QueryClaimRecordResponse): Uint8Array {
    return QueryClaimRecordResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QueryClaimRecordResponse,
  ): QueryClaimRecordResponseProtoMsg {
    return {
      typeUrl: '/stride.claim.QueryClaimRecordResponse',
      value: QueryClaimRecordResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryClaimableForActionRequest(): QueryClaimableForActionRequest {
  return {
    airdropIdentifier: '',
    address: '',
    action: 0,
  };
}
export const QueryClaimableForActionRequest = {
  typeUrl: '/stride.claim.QueryClaimableForActionRequest',
  encode(
    message: QueryClaimableForActionRequest,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.airdropIdentifier !== '') {
      writer.uint32(10).string(message.airdropIdentifier);
    }
    if (message.address !== '') {
      writer.uint32(18).string(message.address);
    }
    if (message.action !== 0) {
      writer.uint32(24).int32(message.action);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryClaimableForActionRequest {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryClaimableForActionRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.airdropIdentifier = reader.string();
          break;
        case 2:
          message.address = reader.string();
          break;
        case 3:
          message.action = reader.int32() as any;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryClaimableForActionRequest {
    return {
      airdropIdentifier: isSet(object.airdropIdentifier)
        ? String(object.airdropIdentifier)
        : '',
      address: isSet(object.address) ? String(object.address) : '',
      action: isSet(object.action) ? actionFromJSON(object.action) : -1,
    };
  },
  toJSON(
    message: QueryClaimableForActionRequest,
  ): JsonSafe<QueryClaimableForActionRequest> {
    const obj: any = {};
    message.airdropIdentifier !== undefined &&
      (obj.airdropIdentifier = message.airdropIdentifier);
    message.address !== undefined && (obj.address = message.address);
    message.action !== undefined && (obj.action = actionToJSON(message.action));
    return obj;
  },
  fromPartial(
    object: Partial<QueryClaimableForActionRequest>,
  ): QueryClaimableForActionRequest {
    const message = createBaseQueryClaimableForActionRequest();
    message.airdropIdentifier = object.airdropIdentifier ?? '';
    message.address = object.address ?? '';
    message.action = object.action ?? 0;
    return message;
  },
  fromProtoMsg(
    message: QueryClaimableForActionRequestProtoMsg,
  ): QueryClaimableForActionRequest {
    return QueryClaimableForActionRequest.decode(message.value);
  },
  toProto(message: QueryClaimableForActionRequest): Uint8Array {
    return QueryClaimableForActionRequest.encode(message).finish();
  },
  toProtoMsg(
    message: QueryClaimableForActionRequest,
  ): QueryClaimableForActionRequestProtoMsg {
    return {
      typeUrl: '/stride.claim.QueryClaimableForActionRequest',
      value: QueryClaimableForActionRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryClaimableForActionResponse(): QueryClaimableForActionResponse {
  return {
    coins: [],
  };
}
export const QueryClaimableForActionResponse = {
  typeUrl: '/stride.claim.QueryClaimableForActionResponse',
  encode(
    message: QueryClaimableForActionResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    for (const v of message.coins) {
      Coin.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryClaimableForActionResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryClaimableForActionResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.coins.push(Coin.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryClaimableForActionResponse {
    return {
      coins: Array.isArray(object?.coins)
        ? object.coins.map((e: any) => Coin.fromJSON(e))
        : [],
    };
  },
  toJSON(
    message: QueryClaimableForActionResponse,
  ): JsonSafe<QueryClaimableForActionResponse> {
    const obj: any = {};
    if (message.coins) {
      obj.coins = message.coins.map(e => (e ? Coin.toJSON(e) : undefined));
    } else {
      obj.coins = [];
    }
    return obj;
  },
  fromPartial(
    object: Partial<QueryClaimableForActionResponse>,
  ): QueryClaimableForActionResponse {
    const message = createBaseQueryClaimableForActionResponse();
    message.coins = object.coins?.map(e => Coin.fromPartial(e)) || [];
    return message;
  },
  fromProtoMsg(
    message: QueryClaimableForActionResponseProtoMsg,
  ): QueryClaimableForActionResponse {
    return QueryClaimableForActionResponse.decode(message.value);
  },
  toProto(message: QueryClaimableForActionResponse): Uint8Array {
    return QueryClaimableForActionResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QueryClaimableForActionResponse,
  ): QueryClaimableForActionResponseProtoMsg {
    return {
      typeUrl: '/stride.claim.QueryClaimableForActionResponse',
      value: QueryClaimableForActionResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryTotalClaimableRequest(): QueryTotalClaimableRequest {
  return {
    airdropIdentifier: '',
    address: '',
    includeClaimed: false,
  };
}
export const QueryTotalClaimableRequest = {
  typeUrl: '/stride.claim.QueryTotalClaimableRequest',
  encode(
    message: QueryTotalClaimableRequest,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.airdropIdentifier !== '') {
      writer.uint32(10).string(message.airdropIdentifier);
    }
    if (message.address !== '') {
      writer.uint32(18).string(message.address);
    }
    if (message.includeClaimed === true) {
      writer.uint32(24).bool(message.includeClaimed);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryTotalClaimableRequest {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryTotalClaimableRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.airdropIdentifier = reader.string();
          break;
        case 2:
          message.address = reader.string();
          break;
        case 3:
          message.includeClaimed = reader.bool();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryTotalClaimableRequest {
    return {
      airdropIdentifier: isSet(object.airdropIdentifier)
        ? String(object.airdropIdentifier)
        : '',
      address: isSet(object.address) ? String(object.address) : '',
      includeClaimed: isSet(object.includeClaimed)
        ? Boolean(object.includeClaimed)
        : false,
    };
  },
  toJSON(
    message: QueryTotalClaimableRequest,
  ): JsonSafe<QueryTotalClaimableRequest> {
    const obj: any = {};
    message.airdropIdentifier !== undefined &&
      (obj.airdropIdentifier = message.airdropIdentifier);
    message.address !== undefined && (obj.address = message.address);
    message.includeClaimed !== undefined &&
      (obj.includeClaimed = message.includeClaimed);
    return obj;
  },
  fromPartial(
    object: Partial<QueryTotalClaimableRequest>,
  ): QueryTotalClaimableRequest {
    const message = createBaseQueryTotalClaimableRequest();
    message.airdropIdentifier = object.airdropIdentifier ?? '';
    message.address = object.address ?? '';
    message.includeClaimed = object.includeClaimed ?? false;
    return message;
  },
  fromProtoMsg(
    message: QueryTotalClaimableRequestProtoMsg,
  ): QueryTotalClaimableRequest {
    return QueryTotalClaimableRequest.decode(message.value);
  },
  toProto(message: QueryTotalClaimableRequest): Uint8Array {
    return QueryTotalClaimableRequest.encode(message).finish();
  },
  toProtoMsg(
    message: QueryTotalClaimableRequest,
  ): QueryTotalClaimableRequestProtoMsg {
    return {
      typeUrl: '/stride.claim.QueryTotalClaimableRequest',
      value: QueryTotalClaimableRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryTotalClaimableResponse(): QueryTotalClaimableResponse {
  return {
    coins: [],
  };
}
export const QueryTotalClaimableResponse = {
  typeUrl: '/stride.claim.QueryTotalClaimableResponse',
  encode(
    message: QueryTotalClaimableResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    for (const v of message.coins) {
      Coin.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryTotalClaimableResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryTotalClaimableResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.coins.push(Coin.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryTotalClaimableResponse {
    return {
      coins: Array.isArray(object?.coins)
        ? object.coins.map((e: any) => Coin.fromJSON(e))
        : [],
    };
  },
  toJSON(
    message: QueryTotalClaimableResponse,
  ): JsonSafe<QueryTotalClaimableResponse> {
    const obj: any = {};
    if (message.coins) {
      obj.coins = message.coins.map(e => (e ? Coin.toJSON(e) : undefined));
    } else {
      obj.coins = [];
    }
    return obj;
  },
  fromPartial(
    object: Partial<QueryTotalClaimableResponse>,
  ): QueryTotalClaimableResponse {
    const message = createBaseQueryTotalClaimableResponse();
    message.coins = object.coins?.map(e => Coin.fromPartial(e)) || [];
    return message;
  },
  fromProtoMsg(
    message: QueryTotalClaimableResponseProtoMsg,
  ): QueryTotalClaimableResponse {
    return QueryTotalClaimableResponse.decode(message.value);
  },
  toProto(message: QueryTotalClaimableResponse): Uint8Array {
    return QueryTotalClaimableResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QueryTotalClaimableResponse,
  ): QueryTotalClaimableResponseProtoMsg {
    return {
      typeUrl: '/stride.claim.QueryTotalClaimableResponse',
      value: QueryTotalClaimableResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryUserVestingsRequest(): QueryUserVestingsRequest {
  return {
    address: '',
  };
}
export const QueryUserVestingsRequest = {
  typeUrl: '/stride.claim.QueryUserVestingsRequest',
  encode(
    message: QueryUserVestingsRequest,
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
  ): QueryUserVestingsRequest {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryUserVestingsRequest();
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
  fromJSON(object: any): QueryUserVestingsRequest {
    return {
      address: isSet(object.address) ? String(object.address) : '',
    };
  },
  toJSON(
    message: QueryUserVestingsRequest,
  ): JsonSafe<QueryUserVestingsRequest> {
    const obj: any = {};
    message.address !== undefined && (obj.address = message.address);
    return obj;
  },
  fromPartial(
    object: Partial<QueryUserVestingsRequest>,
  ): QueryUserVestingsRequest {
    const message = createBaseQueryUserVestingsRequest();
    message.address = object.address ?? '';
    return message;
  },
  fromProtoMsg(
    message: QueryUserVestingsRequestProtoMsg,
  ): QueryUserVestingsRequest {
    return QueryUserVestingsRequest.decode(message.value);
  },
  toProto(message: QueryUserVestingsRequest): Uint8Array {
    return QueryUserVestingsRequest.encode(message).finish();
  },
  toProtoMsg(
    message: QueryUserVestingsRequest,
  ): QueryUserVestingsRequestProtoMsg {
    return {
      typeUrl: '/stride.claim.QueryUserVestingsRequest',
      value: QueryUserVestingsRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryUserVestingsResponse(): QueryUserVestingsResponse {
  return {
    spendableCoins: [],
    periods: [],
  };
}
export const QueryUserVestingsResponse = {
  typeUrl: '/stride.claim.QueryUserVestingsResponse',
  encode(
    message: QueryUserVestingsResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    for (const v of message.spendableCoins) {
      Coin.encode(v!, writer.uint32(26).fork()).ldelim();
    }
    for (const v of message.periods) {
      Period.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): QueryUserVestingsResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryUserVestingsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 3:
          message.spendableCoins.push(Coin.decode(reader, reader.uint32()));
          break;
        case 1:
          message.periods.push(Period.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueryUserVestingsResponse {
    return {
      spendableCoins: Array.isArray(object?.spendableCoins)
        ? object.spendableCoins.map((e: any) => Coin.fromJSON(e))
        : [],
      periods: Array.isArray(object?.periods)
        ? object.periods.map((e: any) => Period.fromJSON(e))
        : [],
    };
  },
  toJSON(
    message: QueryUserVestingsResponse,
  ): JsonSafe<QueryUserVestingsResponse> {
    const obj: any = {};
    if (message.spendableCoins) {
      obj.spendableCoins = message.spendableCoins.map(e =>
        e ? Coin.toJSON(e) : undefined,
      );
    } else {
      obj.spendableCoins = [];
    }
    if (message.periods) {
      obj.periods = message.periods.map(e =>
        e ? Period.toJSON(e) : undefined,
      );
    } else {
      obj.periods = [];
    }
    return obj;
  },
  fromPartial(
    object: Partial<QueryUserVestingsResponse>,
  ): QueryUserVestingsResponse {
    const message = createBaseQueryUserVestingsResponse();
    message.spendableCoins =
      object.spendableCoins?.map(e => Coin.fromPartial(e)) || [];
    message.periods = object.periods?.map(e => Period.fromPartial(e)) || [];
    return message;
  },
  fromProtoMsg(
    message: QueryUserVestingsResponseProtoMsg,
  ): QueryUserVestingsResponse {
    return QueryUserVestingsResponse.decode(message.value);
  },
  toProto(message: QueryUserVestingsResponse): Uint8Array {
    return QueryUserVestingsResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QueryUserVestingsResponse,
  ): QueryUserVestingsResponseProtoMsg {
    return {
      typeUrl: '/stride.claim.QueryUserVestingsResponse',
      value: QueryUserVestingsResponse.encode(message).finish(),
    };
  },
};
