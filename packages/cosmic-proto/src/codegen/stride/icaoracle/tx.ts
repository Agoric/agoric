//@ts-nocheck
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { isSet } from '../../helpers.js';
import { type JsonSafe } from '../../json-safe.js';
/** Adds a new oracle */
export interface MsgAddOracle {
  creator: string;
  connectionId: string;
}
export interface MsgAddOracleProtoMsg {
  typeUrl: '/stride.icaoracle.MsgAddOracle';
  value: Uint8Array;
}
/** Adds a new oracle */
export interface MsgAddOracleSDKType {
  creator: string;
  connection_id: string;
}
export interface MsgAddOracleResponse {}
export interface MsgAddOracleResponseProtoMsg {
  typeUrl: '/stride.icaoracle.MsgAddOracleResponse';
  value: Uint8Array;
}
export interface MsgAddOracleResponseSDKType {}
/** Instantiates the oracle's CW contract */
export interface MsgInstantiateOracle {
  creator: string;
  oracleChainId: string;
  contractCodeId: bigint;
  transferChannelOnOracle: string;
}
export interface MsgInstantiateOracleProtoMsg {
  typeUrl: '/stride.icaoracle.MsgInstantiateOracle';
  value: Uint8Array;
}
/** Instantiates the oracle's CW contract */
export interface MsgInstantiateOracleSDKType {
  creator: string;
  oracle_chain_id: string;
  contract_code_id: bigint;
  transfer_channel_on_oracle: string;
}
export interface MsgInstantiateOracleResponse {}
export interface MsgInstantiateOracleResponseProtoMsg {
  typeUrl: '/stride.icaoracle.MsgInstantiateOracleResponse';
  value: Uint8Array;
}
export interface MsgInstantiateOracleResponseSDKType {}
/** Restore's a closed ICA channel for a given oracle */
export interface MsgRestoreOracleICA {
  creator: string;
  oracleChainId: string;
}
export interface MsgRestoreOracleICAProtoMsg {
  typeUrl: '/stride.icaoracle.MsgRestoreOracleICA';
  value: Uint8Array;
}
/** Restore's a closed ICA channel for a given oracle */
export interface MsgRestoreOracleICASDKType {
  creator: string;
  oracle_chain_id: string;
}
export interface MsgRestoreOracleICAResponse {}
export interface MsgRestoreOracleICAResponseProtoMsg {
  typeUrl: '/stride.icaoracle.MsgRestoreOracleICAResponse';
  value: Uint8Array;
}
export interface MsgRestoreOracleICAResponseSDKType {}
/** Toggle's whether an oracle is active and should receive metric updates */
export interface MsgToggleOracle {
  /**
   * authority is the address that controls the module (defaults to x/gov unless
   * overwritten).
   */
  authority: string;
  oracleChainId: string;
  active: boolean;
}
export interface MsgToggleOracleProtoMsg {
  typeUrl: '/stride.icaoracle.MsgToggleOracle';
  value: Uint8Array;
}
/** Toggle's whether an oracle is active and should receive metric updates */
export interface MsgToggleOracleSDKType {
  authority: string;
  oracle_chain_id: string;
  active: boolean;
}
export interface MsgToggleOracleResponse {}
export interface MsgToggleOracleResponseProtoMsg {
  typeUrl: '/stride.icaoracle.MsgToggleOracleResponse';
  value: Uint8Array;
}
export interface MsgToggleOracleResponseSDKType {}
/** Removes an oracle completely */
export interface MsgRemoveOracle {
  /**
   * authority is the address that controls the module (defaults to x/gov unless
   * overwritten).
   */
  authority: string;
  oracleChainId: string;
}
export interface MsgRemoveOracleProtoMsg {
  typeUrl: '/stride.icaoracle.MsgRemoveOracle';
  value: Uint8Array;
}
/** Removes an oracle completely */
export interface MsgRemoveOracleSDKType {
  authority: string;
  oracle_chain_id: string;
}
export interface MsgRemoveOracleResponse {}
export interface MsgRemoveOracleResponseProtoMsg {
  typeUrl: '/stride.icaoracle.MsgRemoveOracleResponse';
  value: Uint8Array;
}
export interface MsgRemoveOracleResponseSDKType {}
function createBaseMsgAddOracle(): MsgAddOracle {
  return {
    creator: '',
    connectionId: '',
  };
}
export const MsgAddOracle = {
  typeUrl: '/stride.icaoracle.MsgAddOracle',
  encode(
    message: MsgAddOracle,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.creator !== '') {
      writer.uint32(10).string(message.creator);
    }
    if (message.connectionId !== '') {
      writer.uint32(18).string(message.connectionId);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgAddOracle {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgAddOracle();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.creator = reader.string();
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
  fromJSON(object: any): MsgAddOracle {
    return {
      creator: isSet(object.creator) ? String(object.creator) : '',
      connectionId: isSet(object.connectionId)
        ? String(object.connectionId)
        : '',
    };
  },
  toJSON(message: MsgAddOracle): JsonSafe<MsgAddOracle> {
    const obj: any = {};
    message.creator !== undefined && (obj.creator = message.creator);
    message.connectionId !== undefined &&
      (obj.connectionId = message.connectionId);
    return obj;
  },
  fromPartial(object: Partial<MsgAddOracle>): MsgAddOracle {
    const message = createBaseMsgAddOracle();
    message.creator = object.creator ?? '';
    message.connectionId = object.connectionId ?? '';
    return message;
  },
  fromProtoMsg(message: MsgAddOracleProtoMsg): MsgAddOracle {
    return MsgAddOracle.decode(message.value);
  },
  toProto(message: MsgAddOracle): Uint8Array {
    return MsgAddOracle.encode(message).finish();
  },
  toProtoMsg(message: MsgAddOracle): MsgAddOracleProtoMsg {
    return {
      typeUrl: '/stride.icaoracle.MsgAddOracle',
      value: MsgAddOracle.encode(message).finish(),
    };
  },
};
function createBaseMsgAddOracleResponse(): MsgAddOracleResponse {
  return {};
}
export const MsgAddOracleResponse = {
  typeUrl: '/stride.icaoracle.MsgAddOracleResponse',
  encode(
    _: MsgAddOracleResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): MsgAddOracleResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgAddOracleResponse();
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
  fromJSON(_: any): MsgAddOracleResponse {
    return {};
  },
  toJSON(_: MsgAddOracleResponse): JsonSafe<MsgAddOracleResponse> {
    const obj: any = {};
    return obj;
  },
  fromPartial(_: Partial<MsgAddOracleResponse>): MsgAddOracleResponse {
    const message = createBaseMsgAddOracleResponse();
    return message;
  },
  fromProtoMsg(message: MsgAddOracleResponseProtoMsg): MsgAddOracleResponse {
    return MsgAddOracleResponse.decode(message.value);
  },
  toProto(message: MsgAddOracleResponse): Uint8Array {
    return MsgAddOracleResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgAddOracleResponse): MsgAddOracleResponseProtoMsg {
    return {
      typeUrl: '/stride.icaoracle.MsgAddOracleResponse',
      value: MsgAddOracleResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgInstantiateOracle(): MsgInstantiateOracle {
  return {
    creator: '',
    oracleChainId: '',
    contractCodeId: BigInt(0),
    transferChannelOnOracle: '',
  };
}
export const MsgInstantiateOracle = {
  typeUrl: '/stride.icaoracle.MsgInstantiateOracle',
  encode(
    message: MsgInstantiateOracle,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.creator !== '') {
      writer.uint32(10).string(message.creator);
    }
    if (message.oracleChainId !== '') {
      writer.uint32(18).string(message.oracleChainId);
    }
    if (message.contractCodeId !== BigInt(0)) {
      writer.uint32(24).uint64(message.contractCodeId);
    }
    if (message.transferChannelOnOracle !== '') {
      writer.uint32(34).string(message.transferChannelOnOracle);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): MsgInstantiateOracle {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgInstantiateOracle();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.creator = reader.string();
          break;
        case 2:
          message.oracleChainId = reader.string();
          break;
        case 3:
          message.contractCodeId = reader.uint64();
          break;
        case 4:
          message.transferChannelOnOracle = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): MsgInstantiateOracle {
    return {
      creator: isSet(object.creator) ? String(object.creator) : '',
      oracleChainId: isSet(object.oracleChainId)
        ? String(object.oracleChainId)
        : '',
      contractCodeId: isSet(object.contractCodeId)
        ? BigInt(object.contractCodeId.toString())
        : BigInt(0),
      transferChannelOnOracle: isSet(object.transferChannelOnOracle)
        ? String(object.transferChannelOnOracle)
        : '',
    };
  },
  toJSON(message: MsgInstantiateOracle): JsonSafe<MsgInstantiateOracle> {
    const obj: any = {};
    message.creator !== undefined && (obj.creator = message.creator);
    message.oracleChainId !== undefined &&
      (obj.oracleChainId = message.oracleChainId);
    message.contractCodeId !== undefined &&
      (obj.contractCodeId = (message.contractCodeId || BigInt(0)).toString());
    message.transferChannelOnOracle !== undefined &&
      (obj.transferChannelOnOracle = message.transferChannelOnOracle);
    return obj;
  },
  fromPartial(object: Partial<MsgInstantiateOracle>): MsgInstantiateOracle {
    const message = createBaseMsgInstantiateOracle();
    message.creator = object.creator ?? '';
    message.oracleChainId = object.oracleChainId ?? '';
    message.contractCodeId =
      object.contractCodeId !== undefined && object.contractCodeId !== null
        ? BigInt(object.contractCodeId.toString())
        : BigInt(0);
    message.transferChannelOnOracle = object.transferChannelOnOracle ?? '';
    return message;
  },
  fromProtoMsg(message: MsgInstantiateOracleProtoMsg): MsgInstantiateOracle {
    return MsgInstantiateOracle.decode(message.value);
  },
  toProto(message: MsgInstantiateOracle): Uint8Array {
    return MsgInstantiateOracle.encode(message).finish();
  },
  toProtoMsg(message: MsgInstantiateOracle): MsgInstantiateOracleProtoMsg {
    return {
      typeUrl: '/stride.icaoracle.MsgInstantiateOracle',
      value: MsgInstantiateOracle.encode(message).finish(),
    };
  },
};
function createBaseMsgInstantiateOracleResponse(): MsgInstantiateOracleResponse {
  return {};
}
export const MsgInstantiateOracleResponse = {
  typeUrl: '/stride.icaoracle.MsgInstantiateOracleResponse',
  encode(
    _: MsgInstantiateOracleResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): MsgInstantiateOracleResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgInstantiateOracleResponse();
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
  fromJSON(_: any): MsgInstantiateOracleResponse {
    return {};
  },
  toJSON(
    _: MsgInstantiateOracleResponse,
  ): JsonSafe<MsgInstantiateOracleResponse> {
    const obj: any = {};
    return obj;
  },
  fromPartial(
    _: Partial<MsgInstantiateOracleResponse>,
  ): MsgInstantiateOracleResponse {
    const message = createBaseMsgInstantiateOracleResponse();
    return message;
  },
  fromProtoMsg(
    message: MsgInstantiateOracleResponseProtoMsg,
  ): MsgInstantiateOracleResponse {
    return MsgInstantiateOracleResponse.decode(message.value);
  },
  toProto(message: MsgInstantiateOracleResponse): Uint8Array {
    return MsgInstantiateOracleResponse.encode(message).finish();
  },
  toProtoMsg(
    message: MsgInstantiateOracleResponse,
  ): MsgInstantiateOracleResponseProtoMsg {
    return {
      typeUrl: '/stride.icaoracle.MsgInstantiateOracleResponse',
      value: MsgInstantiateOracleResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgRestoreOracleICA(): MsgRestoreOracleICA {
  return {
    creator: '',
    oracleChainId: '',
  };
}
export const MsgRestoreOracleICA = {
  typeUrl: '/stride.icaoracle.MsgRestoreOracleICA',
  encode(
    message: MsgRestoreOracleICA,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.creator !== '') {
      writer.uint32(10).string(message.creator);
    }
    if (message.oracleChainId !== '') {
      writer.uint32(18).string(message.oracleChainId);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): MsgRestoreOracleICA {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgRestoreOracleICA();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.creator = reader.string();
          break;
        case 2:
          message.oracleChainId = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): MsgRestoreOracleICA {
    return {
      creator: isSet(object.creator) ? String(object.creator) : '',
      oracleChainId: isSet(object.oracleChainId)
        ? String(object.oracleChainId)
        : '',
    };
  },
  toJSON(message: MsgRestoreOracleICA): JsonSafe<MsgRestoreOracleICA> {
    const obj: any = {};
    message.creator !== undefined && (obj.creator = message.creator);
    message.oracleChainId !== undefined &&
      (obj.oracleChainId = message.oracleChainId);
    return obj;
  },
  fromPartial(object: Partial<MsgRestoreOracleICA>): MsgRestoreOracleICA {
    const message = createBaseMsgRestoreOracleICA();
    message.creator = object.creator ?? '';
    message.oracleChainId = object.oracleChainId ?? '';
    return message;
  },
  fromProtoMsg(message: MsgRestoreOracleICAProtoMsg): MsgRestoreOracleICA {
    return MsgRestoreOracleICA.decode(message.value);
  },
  toProto(message: MsgRestoreOracleICA): Uint8Array {
    return MsgRestoreOracleICA.encode(message).finish();
  },
  toProtoMsg(message: MsgRestoreOracleICA): MsgRestoreOracleICAProtoMsg {
    return {
      typeUrl: '/stride.icaoracle.MsgRestoreOracleICA',
      value: MsgRestoreOracleICA.encode(message).finish(),
    };
  },
};
function createBaseMsgRestoreOracleICAResponse(): MsgRestoreOracleICAResponse {
  return {};
}
export const MsgRestoreOracleICAResponse = {
  typeUrl: '/stride.icaoracle.MsgRestoreOracleICAResponse',
  encode(
    _: MsgRestoreOracleICAResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): MsgRestoreOracleICAResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgRestoreOracleICAResponse();
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
  fromJSON(_: any): MsgRestoreOracleICAResponse {
    return {};
  },
  toJSON(
    _: MsgRestoreOracleICAResponse,
  ): JsonSafe<MsgRestoreOracleICAResponse> {
    const obj: any = {};
    return obj;
  },
  fromPartial(
    _: Partial<MsgRestoreOracleICAResponse>,
  ): MsgRestoreOracleICAResponse {
    const message = createBaseMsgRestoreOracleICAResponse();
    return message;
  },
  fromProtoMsg(
    message: MsgRestoreOracleICAResponseProtoMsg,
  ): MsgRestoreOracleICAResponse {
    return MsgRestoreOracleICAResponse.decode(message.value);
  },
  toProto(message: MsgRestoreOracleICAResponse): Uint8Array {
    return MsgRestoreOracleICAResponse.encode(message).finish();
  },
  toProtoMsg(
    message: MsgRestoreOracleICAResponse,
  ): MsgRestoreOracleICAResponseProtoMsg {
    return {
      typeUrl: '/stride.icaoracle.MsgRestoreOracleICAResponse',
      value: MsgRestoreOracleICAResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgToggleOracle(): MsgToggleOracle {
  return {
    authority: '',
    oracleChainId: '',
    active: false,
  };
}
export const MsgToggleOracle = {
  typeUrl: '/stride.icaoracle.MsgToggleOracle',
  encode(
    message: MsgToggleOracle,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.authority !== '') {
      writer.uint32(10).string(message.authority);
    }
    if (message.oracleChainId !== '') {
      writer.uint32(18).string(message.oracleChainId);
    }
    if (message.active === true) {
      writer.uint32(24).bool(message.active);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgToggleOracle {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgToggleOracle();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.authority = reader.string();
          break;
        case 2:
          message.oracleChainId = reader.string();
          break;
        case 3:
          message.active = reader.bool();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): MsgToggleOracle {
    return {
      authority: isSet(object.authority) ? String(object.authority) : '',
      oracleChainId: isSet(object.oracleChainId)
        ? String(object.oracleChainId)
        : '',
      active: isSet(object.active) ? Boolean(object.active) : false,
    };
  },
  toJSON(message: MsgToggleOracle): JsonSafe<MsgToggleOracle> {
    const obj: any = {};
    message.authority !== undefined && (obj.authority = message.authority);
    message.oracleChainId !== undefined &&
      (obj.oracleChainId = message.oracleChainId);
    message.active !== undefined && (obj.active = message.active);
    return obj;
  },
  fromPartial(object: Partial<MsgToggleOracle>): MsgToggleOracle {
    const message = createBaseMsgToggleOracle();
    message.authority = object.authority ?? '';
    message.oracleChainId = object.oracleChainId ?? '';
    message.active = object.active ?? false;
    return message;
  },
  fromProtoMsg(message: MsgToggleOracleProtoMsg): MsgToggleOracle {
    return MsgToggleOracle.decode(message.value);
  },
  toProto(message: MsgToggleOracle): Uint8Array {
    return MsgToggleOracle.encode(message).finish();
  },
  toProtoMsg(message: MsgToggleOracle): MsgToggleOracleProtoMsg {
    return {
      typeUrl: '/stride.icaoracle.MsgToggleOracle',
      value: MsgToggleOracle.encode(message).finish(),
    };
  },
};
function createBaseMsgToggleOracleResponse(): MsgToggleOracleResponse {
  return {};
}
export const MsgToggleOracleResponse = {
  typeUrl: '/stride.icaoracle.MsgToggleOracleResponse',
  encode(
    _: MsgToggleOracleResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): MsgToggleOracleResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgToggleOracleResponse();
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
  fromJSON(_: any): MsgToggleOracleResponse {
    return {};
  },
  toJSON(_: MsgToggleOracleResponse): JsonSafe<MsgToggleOracleResponse> {
    const obj: any = {};
    return obj;
  },
  fromPartial(_: Partial<MsgToggleOracleResponse>): MsgToggleOracleResponse {
    const message = createBaseMsgToggleOracleResponse();
    return message;
  },
  fromProtoMsg(
    message: MsgToggleOracleResponseProtoMsg,
  ): MsgToggleOracleResponse {
    return MsgToggleOracleResponse.decode(message.value);
  },
  toProto(message: MsgToggleOracleResponse): Uint8Array {
    return MsgToggleOracleResponse.encode(message).finish();
  },
  toProtoMsg(
    message: MsgToggleOracleResponse,
  ): MsgToggleOracleResponseProtoMsg {
    return {
      typeUrl: '/stride.icaoracle.MsgToggleOracleResponse',
      value: MsgToggleOracleResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgRemoveOracle(): MsgRemoveOracle {
  return {
    authority: '',
    oracleChainId: '',
  };
}
export const MsgRemoveOracle = {
  typeUrl: '/stride.icaoracle.MsgRemoveOracle',
  encode(
    message: MsgRemoveOracle,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.authority !== '') {
      writer.uint32(10).string(message.authority);
    }
    if (message.oracleChainId !== '') {
      writer.uint32(18).string(message.oracleChainId);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgRemoveOracle {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgRemoveOracle();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.authority = reader.string();
          break;
        case 2:
          message.oracleChainId = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): MsgRemoveOracle {
    return {
      authority: isSet(object.authority) ? String(object.authority) : '',
      oracleChainId: isSet(object.oracleChainId)
        ? String(object.oracleChainId)
        : '',
    };
  },
  toJSON(message: MsgRemoveOracle): JsonSafe<MsgRemoveOracle> {
    const obj: any = {};
    message.authority !== undefined && (obj.authority = message.authority);
    message.oracleChainId !== undefined &&
      (obj.oracleChainId = message.oracleChainId);
    return obj;
  },
  fromPartial(object: Partial<MsgRemoveOracle>): MsgRemoveOracle {
    const message = createBaseMsgRemoveOracle();
    message.authority = object.authority ?? '';
    message.oracleChainId = object.oracleChainId ?? '';
    return message;
  },
  fromProtoMsg(message: MsgRemoveOracleProtoMsg): MsgRemoveOracle {
    return MsgRemoveOracle.decode(message.value);
  },
  toProto(message: MsgRemoveOracle): Uint8Array {
    return MsgRemoveOracle.encode(message).finish();
  },
  toProtoMsg(message: MsgRemoveOracle): MsgRemoveOracleProtoMsg {
    return {
      typeUrl: '/stride.icaoracle.MsgRemoveOracle',
      value: MsgRemoveOracle.encode(message).finish(),
    };
  },
};
function createBaseMsgRemoveOracleResponse(): MsgRemoveOracleResponse {
  return {};
}
export const MsgRemoveOracleResponse = {
  typeUrl: '/stride.icaoracle.MsgRemoveOracleResponse',
  encode(
    _: MsgRemoveOracleResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): MsgRemoveOracleResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgRemoveOracleResponse();
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
  fromJSON(_: any): MsgRemoveOracleResponse {
    return {};
  },
  toJSON(_: MsgRemoveOracleResponse): JsonSafe<MsgRemoveOracleResponse> {
    const obj: any = {};
    return obj;
  },
  fromPartial(_: Partial<MsgRemoveOracleResponse>): MsgRemoveOracleResponse {
    const message = createBaseMsgRemoveOracleResponse();
    return message;
  },
  fromProtoMsg(
    message: MsgRemoveOracleResponseProtoMsg,
  ): MsgRemoveOracleResponse {
    return MsgRemoveOracleResponse.decode(message.value);
  },
  toProto(message: MsgRemoveOracleResponse): Uint8Array {
    return MsgRemoveOracleResponse.encode(message).finish();
  },
  toProtoMsg(
    message: MsgRemoveOracleResponse,
  ): MsgRemoveOracleResponseProtoMsg {
    return {
      typeUrl: '/stride.icaoracle.MsgRemoveOracleResponse',
      value: MsgRemoveOracleResponse.encode(message).finish(),
    };
  },
};
