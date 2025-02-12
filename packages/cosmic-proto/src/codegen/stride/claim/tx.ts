//@ts-nocheck
import { Coin, type CoinSDKType } from '../../cosmos/base/v1beta1/coin.js';
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { Decimal, isSet } from '../../helpers.js';
import { type JsonSafe } from '../../json-safe.js';
export interface MsgSetAirdropAllocations {
  allocator: string;
  airdropIdentifier: string;
  users: string[];
  weights: string[];
}
export interface MsgSetAirdropAllocationsProtoMsg {
  typeUrl: '/stride.claim.MsgSetAirdropAllocations';
  value: Uint8Array;
}
export interface MsgSetAirdropAllocationsSDKType {
  allocator: string;
  airdrop_identifier: string;
  users: string[];
  weights: string[];
}
export interface MsgSetAirdropAllocationsResponse {}
export interface MsgSetAirdropAllocationsResponseProtoMsg {
  typeUrl: '/stride.claim.MsgSetAirdropAllocationsResponse';
  value: Uint8Array;
}
export interface MsgSetAirdropAllocationsResponseSDKType {}
export interface MsgClaimFreeAmount {
  user: string;
}
export interface MsgClaimFreeAmountProtoMsg {
  typeUrl: '/stride.claim.MsgClaimFreeAmount';
  value: Uint8Array;
}
export interface MsgClaimFreeAmountSDKType {
  user: string;
}
export interface MsgClaimFreeAmountResponse {
  claimedAmount: Coin[];
}
export interface MsgClaimFreeAmountResponseProtoMsg {
  typeUrl: '/stride.claim.MsgClaimFreeAmountResponse';
  value: Uint8Array;
}
export interface MsgClaimFreeAmountResponseSDKType {
  claimed_amount: CoinSDKType[];
}
export interface MsgCreateAirdrop {
  distributor: string;
  identifier: string;
  chainId: string;
  denom: string;
  startTime: bigint;
  duration: bigint;
  autopilotEnabled: boolean;
}
export interface MsgCreateAirdropProtoMsg {
  typeUrl: '/stride.claim.MsgCreateAirdrop';
  value: Uint8Array;
}
export interface MsgCreateAirdropSDKType {
  distributor: string;
  identifier: string;
  chain_id: string;
  denom: string;
  start_time: bigint;
  duration: bigint;
  autopilot_enabled: boolean;
}
export interface MsgCreateAirdropResponse {}
export interface MsgCreateAirdropResponseProtoMsg {
  typeUrl: '/stride.claim.MsgCreateAirdropResponse';
  value: Uint8Array;
}
export interface MsgCreateAirdropResponseSDKType {}
export interface MsgDeleteAirdrop {
  distributor: string;
  identifier: string;
}
export interface MsgDeleteAirdropProtoMsg {
  typeUrl: '/stride.claim.MsgDeleteAirdrop';
  value: Uint8Array;
}
export interface MsgDeleteAirdropSDKType {
  distributor: string;
  identifier: string;
}
export interface MsgDeleteAirdropResponse {}
export interface MsgDeleteAirdropResponseProtoMsg {
  typeUrl: '/stride.claim.MsgDeleteAirdropResponse';
  value: Uint8Array;
}
export interface MsgDeleteAirdropResponseSDKType {}
function createBaseMsgSetAirdropAllocations(): MsgSetAirdropAllocations {
  return {
    allocator: '',
    airdropIdentifier: '',
    users: [],
    weights: [],
  };
}
export const MsgSetAirdropAllocations = {
  typeUrl: '/stride.claim.MsgSetAirdropAllocations',
  encode(
    message: MsgSetAirdropAllocations,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.allocator !== '') {
      writer.uint32(10).string(message.allocator);
    }
    if (message.airdropIdentifier !== '') {
      writer.uint32(18).string(message.airdropIdentifier);
    }
    for (const v of message.users) {
      writer.uint32(26).string(v!);
    }
    for (const v of message.weights) {
      writer.uint32(34).string(Decimal.fromUserInput(v!, 18).atomics);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): MsgSetAirdropAllocations {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgSetAirdropAllocations();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.allocator = reader.string();
          break;
        case 2:
          message.airdropIdentifier = reader.string();
          break;
        case 3:
          message.users.push(reader.string());
          break;
        case 4:
          message.weights.push(
            Decimal.fromAtomics(reader.string(), 18).toString(),
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): MsgSetAirdropAllocations {
    return {
      allocator: isSet(object.allocator) ? String(object.allocator) : '',
      airdropIdentifier: isSet(object.airdropIdentifier)
        ? String(object.airdropIdentifier)
        : '',
      users: Array.isArray(object?.users)
        ? object.users.map((e: any) => String(e))
        : [],
      weights: Array.isArray(object?.weights)
        ? object.weights.map((e: any) => String(e))
        : [],
    };
  },
  toJSON(
    message: MsgSetAirdropAllocations,
  ): JsonSafe<MsgSetAirdropAllocations> {
    const obj: any = {};
    message.allocator !== undefined && (obj.allocator = message.allocator);
    message.airdropIdentifier !== undefined &&
      (obj.airdropIdentifier = message.airdropIdentifier);
    if (message.users) {
      obj.users = message.users.map(e => e);
    } else {
      obj.users = [];
    }
    if (message.weights) {
      obj.weights = message.weights.map(e => e);
    } else {
      obj.weights = [];
    }
    return obj;
  },
  fromPartial(
    object: Partial<MsgSetAirdropAllocations>,
  ): MsgSetAirdropAllocations {
    const message = createBaseMsgSetAirdropAllocations();
    message.allocator = object.allocator ?? '';
    message.airdropIdentifier = object.airdropIdentifier ?? '';
    message.users = object.users?.map(e => e) || [];
    message.weights = object.weights?.map(e => e) || [];
    return message;
  },
  fromProtoMsg(
    message: MsgSetAirdropAllocationsProtoMsg,
  ): MsgSetAirdropAllocations {
    return MsgSetAirdropAllocations.decode(message.value);
  },
  toProto(message: MsgSetAirdropAllocations): Uint8Array {
    return MsgSetAirdropAllocations.encode(message).finish();
  },
  toProtoMsg(
    message: MsgSetAirdropAllocations,
  ): MsgSetAirdropAllocationsProtoMsg {
    return {
      typeUrl: '/stride.claim.MsgSetAirdropAllocations',
      value: MsgSetAirdropAllocations.encode(message).finish(),
    };
  },
};
function createBaseMsgSetAirdropAllocationsResponse(): MsgSetAirdropAllocationsResponse {
  return {};
}
export const MsgSetAirdropAllocationsResponse = {
  typeUrl: '/stride.claim.MsgSetAirdropAllocationsResponse',
  encode(
    _: MsgSetAirdropAllocationsResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): MsgSetAirdropAllocationsResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgSetAirdropAllocationsResponse();
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
  fromJSON(_: any): MsgSetAirdropAllocationsResponse {
    return {};
  },
  toJSON(
    _: MsgSetAirdropAllocationsResponse,
  ): JsonSafe<MsgSetAirdropAllocationsResponse> {
    const obj: any = {};
    return obj;
  },
  fromPartial(
    _: Partial<MsgSetAirdropAllocationsResponse>,
  ): MsgSetAirdropAllocationsResponse {
    const message = createBaseMsgSetAirdropAllocationsResponse();
    return message;
  },
  fromProtoMsg(
    message: MsgSetAirdropAllocationsResponseProtoMsg,
  ): MsgSetAirdropAllocationsResponse {
    return MsgSetAirdropAllocationsResponse.decode(message.value);
  },
  toProto(message: MsgSetAirdropAllocationsResponse): Uint8Array {
    return MsgSetAirdropAllocationsResponse.encode(message).finish();
  },
  toProtoMsg(
    message: MsgSetAirdropAllocationsResponse,
  ): MsgSetAirdropAllocationsResponseProtoMsg {
    return {
      typeUrl: '/stride.claim.MsgSetAirdropAllocationsResponse',
      value: MsgSetAirdropAllocationsResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgClaimFreeAmount(): MsgClaimFreeAmount {
  return {
    user: '',
  };
}
export const MsgClaimFreeAmount = {
  typeUrl: '/stride.claim.MsgClaimFreeAmount',
  encode(
    message: MsgClaimFreeAmount,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.user !== '') {
      writer.uint32(10).string(message.user);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): MsgClaimFreeAmount {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgClaimFreeAmount();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.user = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): MsgClaimFreeAmount {
    return {
      user: isSet(object.user) ? String(object.user) : '',
    };
  },
  toJSON(message: MsgClaimFreeAmount): JsonSafe<MsgClaimFreeAmount> {
    const obj: any = {};
    message.user !== undefined && (obj.user = message.user);
    return obj;
  },
  fromPartial(object: Partial<MsgClaimFreeAmount>): MsgClaimFreeAmount {
    const message = createBaseMsgClaimFreeAmount();
    message.user = object.user ?? '';
    return message;
  },
  fromProtoMsg(message: MsgClaimFreeAmountProtoMsg): MsgClaimFreeAmount {
    return MsgClaimFreeAmount.decode(message.value);
  },
  toProto(message: MsgClaimFreeAmount): Uint8Array {
    return MsgClaimFreeAmount.encode(message).finish();
  },
  toProtoMsg(message: MsgClaimFreeAmount): MsgClaimFreeAmountProtoMsg {
    return {
      typeUrl: '/stride.claim.MsgClaimFreeAmount',
      value: MsgClaimFreeAmount.encode(message).finish(),
    };
  },
};
function createBaseMsgClaimFreeAmountResponse(): MsgClaimFreeAmountResponse {
  return {
    claimedAmount: [],
  };
}
export const MsgClaimFreeAmountResponse = {
  typeUrl: '/stride.claim.MsgClaimFreeAmountResponse',
  encode(
    message: MsgClaimFreeAmountResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    for (const v of message.claimedAmount) {
      Coin.encode(v!, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): MsgClaimFreeAmountResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgClaimFreeAmountResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 3:
          message.claimedAmount.push(Coin.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): MsgClaimFreeAmountResponse {
    return {
      claimedAmount: Array.isArray(object?.claimedAmount)
        ? object.claimedAmount.map((e: any) => Coin.fromJSON(e))
        : [],
    };
  },
  toJSON(
    message: MsgClaimFreeAmountResponse,
  ): JsonSafe<MsgClaimFreeAmountResponse> {
    const obj: any = {};
    if (message.claimedAmount) {
      obj.claimedAmount = message.claimedAmount.map(e =>
        e ? Coin.toJSON(e) : undefined,
      );
    } else {
      obj.claimedAmount = [];
    }
    return obj;
  },
  fromPartial(
    object: Partial<MsgClaimFreeAmountResponse>,
  ): MsgClaimFreeAmountResponse {
    const message = createBaseMsgClaimFreeAmountResponse();
    message.claimedAmount =
      object.claimedAmount?.map(e => Coin.fromPartial(e)) || [];
    return message;
  },
  fromProtoMsg(
    message: MsgClaimFreeAmountResponseProtoMsg,
  ): MsgClaimFreeAmountResponse {
    return MsgClaimFreeAmountResponse.decode(message.value);
  },
  toProto(message: MsgClaimFreeAmountResponse): Uint8Array {
    return MsgClaimFreeAmountResponse.encode(message).finish();
  },
  toProtoMsg(
    message: MsgClaimFreeAmountResponse,
  ): MsgClaimFreeAmountResponseProtoMsg {
    return {
      typeUrl: '/stride.claim.MsgClaimFreeAmountResponse',
      value: MsgClaimFreeAmountResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgCreateAirdrop(): MsgCreateAirdrop {
  return {
    distributor: '',
    identifier: '',
    chainId: '',
    denom: '',
    startTime: BigInt(0),
    duration: BigInt(0),
    autopilotEnabled: false,
  };
}
export const MsgCreateAirdrop = {
  typeUrl: '/stride.claim.MsgCreateAirdrop',
  encode(
    message: MsgCreateAirdrop,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.distributor !== '') {
      writer.uint32(10).string(message.distributor);
    }
    if (message.identifier !== '') {
      writer.uint32(18).string(message.identifier);
    }
    if (message.chainId !== '') {
      writer.uint32(50).string(message.chainId);
    }
    if (message.denom !== '') {
      writer.uint32(42).string(message.denom);
    }
    if (message.startTime !== BigInt(0)) {
      writer.uint32(24).uint64(message.startTime);
    }
    if (message.duration !== BigInt(0)) {
      writer.uint32(32).uint64(message.duration);
    }
    if (message.autopilotEnabled === true) {
      writer.uint32(56).bool(message.autopilotEnabled);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgCreateAirdrop {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCreateAirdrop();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.distributor = reader.string();
          break;
        case 2:
          message.identifier = reader.string();
          break;
        case 6:
          message.chainId = reader.string();
          break;
        case 5:
          message.denom = reader.string();
          break;
        case 3:
          message.startTime = reader.uint64();
          break;
        case 4:
          message.duration = reader.uint64();
          break;
        case 7:
          message.autopilotEnabled = reader.bool();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): MsgCreateAirdrop {
    return {
      distributor: isSet(object.distributor) ? String(object.distributor) : '',
      identifier: isSet(object.identifier) ? String(object.identifier) : '',
      chainId: isSet(object.chainId) ? String(object.chainId) : '',
      denom: isSet(object.denom) ? String(object.denom) : '',
      startTime: isSet(object.startTime)
        ? BigInt(object.startTime.toString())
        : BigInt(0),
      duration: isSet(object.duration)
        ? BigInt(object.duration.toString())
        : BigInt(0),
      autopilotEnabled: isSet(object.autopilotEnabled)
        ? Boolean(object.autopilotEnabled)
        : false,
    };
  },
  toJSON(message: MsgCreateAirdrop): JsonSafe<MsgCreateAirdrop> {
    const obj: any = {};
    message.distributor !== undefined &&
      (obj.distributor = message.distributor);
    message.identifier !== undefined && (obj.identifier = message.identifier);
    message.chainId !== undefined && (obj.chainId = message.chainId);
    message.denom !== undefined && (obj.denom = message.denom);
    message.startTime !== undefined &&
      (obj.startTime = (message.startTime || BigInt(0)).toString());
    message.duration !== undefined &&
      (obj.duration = (message.duration || BigInt(0)).toString());
    message.autopilotEnabled !== undefined &&
      (obj.autopilotEnabled = message.autopilotEnabled);
    return obj;
  },
  fromPartial(object: Partial<MsgCreateAirdrop>): MsgCreateAirdrop {
    const message = createBaseMsgCreateAirdrop();
    message.distributor = object.distributor ?? '';
    message.identifier = object.identifier ?? '';
    message.chainId = object.chainId ?? '';
    message.denom = object.denom ?? '';
    message.startTime =
      object.startTime !== undefined && object.startTime !== null
        ? BigInt(object.startTime.toString())
        : BigInt(0);
    message.duration =
      object.duration !== undefined && object.duration !== null
        ? BigInt(object.duration.toString())
        : BigInt(0);
    message.autopilotEnabled = object.autopilotEnabled ?? false;
    return message;
  },
  fromProtoMsg(message: MsgCreateAirdropProtoMsg): MsgCreateAirdrop {
    return MsgCreateAirdrop.decode(message.value);
  },
  toProto(message: MsgCreateAirdrop): Uint8Array {
    return MsgCreateAirdrop.encode(message).finish();
  },
  toProtoMsg(message: MsgCreateAirdrop): MsgCreateAirdropProtoMsg {
    return {
      typeUrl: '/stride.claim.MsgCreateAirdrop',
      value: MsgCreateAirdrop.encode(message).finish(),
    };
  },
};
function createBaseMsgCreateAirdropResponse(): MsgCreateAirdropResponse {
  return {};
}
export const MsgCreateAirdropResponse = {
  typeUrl: '/stride.claim.MsgCreateAirdropResponse',
  encode(
    _: MsgCreateAirdropResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): MsgCreateAirdropResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCreateAirdropResponse();
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
  fromJSON(_: any): MsgCreateAirdropResponse {
    return {};
  },
  toJSON(_: MsgCreateAirdropResponse): JsonSafe<MsgCreateAirdropResponse> {
    const obj: any = {};
    return obj;
  },
  fromPartial(_: Partial<MsgCreateAirdropResponse>): MsgCreateAirdropResponse {
    const message = createBaseMsgCreateAirdropResponse();
    return message;
  },
  fromProtoMsg(
    message: MsgCreateAirdropResponseProtoMsg,
  ): MsgCreateAirdropResponse {
    return MsgCreateAirdropResponse.decode(message.value);
  },
  toProto(message: MsgCreateAirdropResponse): Uint8Array {
    return MsgCreateAirdropResponse.encode(message).finish();
  },
  toProtoMsg(
    message: MsgCreateAirdropResponse,
  ): MsgCreateAirdropResponseProtoMsg {
    return {
      typeUrl: '/stride.claim.MsgCreateAirdropResponse',
      value: MsgCreateAirdropResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgDeleteAirdrop(): MsgDeleteAirdrop {
  return {
    distributor: '',
    identifier: '',
  };
}
export const MsgDeleteAirdrop = {
  typeUrl: '/stride.claim.MsgDeleteAirdrop',
  encode(
    message: MsgDeleteAirdrop,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.distributor !== '') {
      writer.uint32(10).string(message.distributor);
    }
    if (message.identifier !== '') {
      writer.uint32(18).string(message.identifier);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgDeleteAirdrop {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgDeleteAirdrop();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.distributor = reader.string();
          break;
        case 2:
          message.identifier = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): MsgDeleteAirdrop {
    return {
      distributor: isSet(object.distributor) ? String(object.distributor) : '',
      identifier: isSet(object.identifier) ? String(object.identifier) : '',
    };
  },
  toJSON(message: MsgDeleteAirdrop): JsonSafe<MsgDeleteAirdrop> {
    const obj: any = {};
    message.distributor !== undefined &&
      (obj.distributor = message.distributor);
    message.identifier !== undefined && (obj.identifier = message.identifier);
    return obj;
  },
  fromPartial(object: Partial<MsgDeleteAirdrop>): MsgDeleteAirdrop {
    const message = createBaseMsgDeleteAirdrop();
    message.distributor = object.distributor ?? '';
    message.identifier = object.identifier ?? '';
    return message;
  },
  fromProtoMsg(message: MsgDeleteAirdropProtoMsg): MsgDeleteAirdrop {
    return MsgDeleteAirdrop.decode(message.value);
  },
  toProto(message: MsgDeleteAirdrop): Uint8Array {
    return MsgDeleteAirdrop.encode(message).finish();
  },
  toProtoMsg(message: MsgDeleteAirdrop): MsgDeleteAirdropProtoMsg {
    return {
      typeUrl: '/stride.claim.MsgDeleteAirdrop',
      value: MsgDeleteAirdrop.encode(message).finish(),
    };
  },
};
function createBaseMsgDeleteAirdropResponse(): MsgDeleteAirdropResponse {
  return {};
}
export const MsgDeleteAirdropResponse = {
  typeUrl: '/stride.claim.MsgDeleteAirdropResponse',
  encode(
    _: MsgDeleteAirdropResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): MsgDeleteAirdropResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgDeleteAirdropResponse();
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
  fromJSON(_: any): MsgDeleteAirdropResponse {
    return {};
  },
  toJSON(_: MsgDeleteAirdropResponse): JsonSafe<MsgDeleteAirdropResponse> {
    const obj: any = {};
    return obj;
  },
  fromPartial(_: Partial<MsgDeleteAirdropResponse>): MsgDeleteAirdropResponse {
    const message = createBaseMsgDeleteAirdropResponse();
    return message;
  },
  fromProtoMsg(
    message: MsgDeleteAirdropResponseProtoMsg,
  ): MsgDeleteAirdropResponse {
    return MsgDeleteAirdropResponse.decode(message.value);
  },
  toProto(message: MsgDeleteAirdropResponse): Uint8Array {
    return MsgDeleteAirdropResponse.encode(message).finish();
  },
  toProtoMsg(
    message: MsgDeleteAirdropResponse,
  ): MsgDeleteAirdropResponseProtoMsg {
    return {
      typeUrl: '/stride.claim.MsgDeleteAirdropResponse',
      value: MsgDeleteAirdropResponse.encode(message).finish(),
    };
  },
};
