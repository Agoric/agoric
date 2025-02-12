//@ts-nocheck
import {
  HostZone,
  type HostZoneSDKType,
  DelegationRecord,
  type DelegationRecordSDKType,
  UnbondingRecord,
  type UnbondingRecordSDKType,
  RedemptionRecord,
  type RedemptionRecordSDKType,
  SlashRecord,
  type SlashRecordSDKType,
} from './staketia.js';
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { type JsonSafe } from '../../json-safe.js';
import { isSet } from '../../helpers.js';
/** Params defines the staketia module parameters. */
export interface Params {}
export interface ParamsProtoMsg {
  typeUrl: '/stride.staketia.Params';
  value: Uint8Array;
}
/** Params defines the staketia module parameters. */
export interface ParamsSDKType {}
/**
 * TransferInProgressRecordIds stores record IDs for delegation records
 * that have a transfer in progress
 */
export interface TransferInProgressRecordIds {
  channelId: string;
  sequence: bigint;
  recordId: bigint;
}
export interface TransferInProgressRecordIdsProtoMsg {
  typeUrl: '/stride.staketia.TransferInProgressRecordIds';
  value: Uint8Array;
}
/**
 * TransferInProgressRecordIds stores record IDs for delegation records
 * that have a transfer in progress
 */
export interface TransferInProgressRecordIdsSDKType {
  channel_id: string;
  sequence: bigint;
  record_id: bigint;
}
/** GenesisState defines the staketia module's genesis state. */
export interface GenesisState {
  params: Params;
  hostZone: HostZone;
  delegationRecords: DelegationRecord[];
  unbondingRecords: UnbondingRecord[];
  redemptionRecords: RedemptionRecord[];
  slashRecords: SlashRecord[];
  transferInProgressRecordIds: TransferInProgressRecordIds[];
}
export interface GenesisStateProtoMsg {
  typeUrl: '/stride.staketia.GenesisState';
  value: Uint8Array;
}
/** GenesisState defines the staketia module's genesis state. */
export interface GenesisStateSDKType {
  params: ParamsSDKType;
  host_zone: HostZoneSDKType;
  delegation_records: DelegationRecordSDKType[];
  unbonding_records: UnbondingRecordSDKType[];
  redemption_records: RedemptionRecordSDKType[];
  slash_records: SlashRecordSDKType[];
  transfer_in_progress_record_ids: TransferInProgressRecordIdsSDKType[];
}
function createBaseParams(): Params {
  return {};
}
export const Params = {
  typeUrl: '/stride.staketia.Params',
  encode(
    _: Params,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): Params {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseParams();
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
  fromJSON(_: any): Params {
    return {};
  },
  toJSON(_: Params): JsonSafe<Params> {
    const obj: any = {};
    return obj;
  },
  fromPartial(_: Partial<Params>): Params {
    const message = createBaseParams();
    return message;
  },
  fromProtoMsg(message: ParamsProtoMsg): Params {
    return Params.decode(message.value);
  },
  toProto(message: Params): Uint8Array {
    return Params.encode(message).finish();
  },
  toProtoMsg(message: Params): ParamsProtoMsg {
    return {
      typeUrl: '/stride.staketia.Params',
      value: Params.encode(message).finish(),
    };
  },
};
function createBaseTransferInProgressRecordIds(): TransferInProgressRecordIds {
  return {
    channelId: '',
    sequence: BigInt(0),
    recordId: BigInt(0),
  };
}
export const TransferInProgressRecordIds = {
  typeUrl: '/stride.staketia.TransferInProgressRecordIds',
  encode(
    message: TransferInProgressRecordIds,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.channelId !== '') {
      writer.uint32(10).string(message.channelId);
    }
    if (message.sequence !== BigInt(0)) {
      writer.uint32(16).uint64(message.sequence);
    }
    if (message.recordId !== BigInt(0)) {
      writer.uint32(24).uint64(message.recordId);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): TransferInProgressRecordIds {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTransferInProgressRecordIds();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.channelId = reader.string();
          break;
        case 2:
          message.sequence = reader.uint64();
          break;
        case 3:
          message.recordId = reader.uint64();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): TransferInProgressRecordIds {
    return {
      channelId: isSet(object.channelId) ? String(object.channelId) : '',
      sequence: isSet(object.sequence)
        ? BigInt(object.sequence.toString())
        : BigInt(0),
      recordId: isSet(object.recordId)
        ? BigInt(object.recordId.toString())
        : BigInt(0),
    };
  },
  toJSON(
    message: TransferInProgressRecordIds,
  ): JsonSafe<TransferInProgressRecordIds> {
    const obj: any = {};
    message.channelId !== undefined && (obj.channelId = message.channelId);
    message.sequence !== undefined &&
      (obj.sequence = (message.sequence || BigInt(0)).toString());
    message.recordId !== undefined &&
      (obj.recordId = (message.recordId || BigInt(0)).toString());
    return obj;
  },
  fromPartial(
    object: Partial<TransferInProgressRecordIds>,
  ): TransferInProgressRecordIds {
    const message = createBaseTransferInProgressRecordIds();
    message.channelId = object.channelId ?? '';
    message.sequence =
      object.sequence !== undefined && object.sequence !== null
        ? BigInt(object.sequence.toString())
        : BigInt(0);
    message.recordId =
      object.recordId !== undefined && object.recordId !== null
        ? BigInt(object.recordId.toString())
        : BigInt(0);
    return message;
  },
  fromProtoMsg(
    message: TransferInProgressRecordIdsProtoMsg,
  ): TransferInProgressRecordIds {
    return TransferInProgressRecordIds.decode(message.value);
  },
  toProto(message: TransferInProgressRecordIds): Uint8Array {
    return TransferInProgressRecordIds.encode(message).finish();
  },
  toProtoMsg(
    message: TransferInProgressRecordIds,
  ): TransferInProgressRecordIdsProtoMsg {
    return {
      typeUrl: '/stride.staketia.TransferInProgressRecordIds',
      value: TransferInProgressRecordIds.encode(message).finish(),
    };
  },
};
function createBaseGenesisState(): GenesisState {
  return {
    params: Params.fromPartial({}),
    hostZone: HostZone.fromPartial({}),
    delegationRecords: [],
    unbondingRecords: [],
    redemptionRecords: [],
    slashRecords: [],
    transferInProgressRecordIds: [],
  };
}
export const GenesisState = {
  typeUrl: '/stride.staketia.GenesisState',
  encode(
    message: GenesisState,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.params !== undefined) {
      Params.encode(message.params, writer.uint32(10).fork()).ldelim();
    }
    if (message.hostZone !== undefined) {
      HostZone.encode(message.hostZone, writer.uint32(18).fork()).ldelim();
    }
    for (const v of message.delegationRecords) {
      DelegationRecord.encode(v!, writer.uint32(26).fork()).ldelim();
    }
    for (const v of message.unbondingRecords) {
      UnbondingRecord.encode(v!, writer.uint32(34).fork()).ldelim();
    }
    for (const v of message.redemptionRecords) {
      RedemptionRecord.encode(v!, writer.uint32(42).fork()).ldelim();
    }
    for (const v of message.slashRecords) {
      SlashRecord.encode(v!, writer.uint32(50).fork()).ldelim();
    }
    for (const v of message.transferInProgressRecordIds) {
      TransferInProgressRecordIds.encode(v!, writer.uint32(58).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): GenesisState {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGenesisState();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.params = Params.decode(reader, reader.uint32());
          break;
        case 2:
          message.hostZone = HostZone.decode(reader, reader.uint32());
          break;
        case 3:
          message.delegationRecords.push(
            DelegationRecord.decode(reader, reader.uint32()),
          );
          break;
        case 4:
          message.unbondingRecords.push(
            UnbondingRecord.decode(reader, reader.uint32()),
          );
          break;
        case 5:
          message.redemptionRecords.push(
            RedemptionRecord.decode(reader, reader.uint32()),
          );
          break;
        case 6:
          message.slashRecords.push(
            SlashRecord.decode(reader, reader.uint32()),
          );
          break;
        case 7:
          message.transferInProgressRecordIds.push(
            TransferInProgressRecordIds.decode(reader, reader.uint32()),
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): GenesisState {
    return {
      params: isSet(object.params) ? Params.fromJSON(object.params) : undefined,
      hostZone: isSet(object.hostZone)
        ? HostZone.fromJSON(object.hostZone)
        : undefined,
      delegationRecords: Array.isArray(object?.delegationRecords)
        ? object.delegationRecords.map((e: any) => DelegationRecord.fromJSON(e))
        : [],
      unbondingRecords: Array.isArray(object?.unbondingRecords)
        ? object.unbondingRecords.map((e: any) => UnbondingRecord.fromJSON(e))
        : [],
      redemptionRecords: Array.isArray(object?.redemptionRecords)
        ? object.redemptionRecords.map((e: any) => RedemptionRecord.fromJSON(e))
        : [],
      slashRecords: Array.isArray(object?.slashRecords)
        ? object.slashRecords.map((e: any) => SlashRecord.fromJSON(e))
        : [],
      transferInProgressRecordIds: Array.isArray(
        object?.transferInProgressRecordIds,
      )
        ? object.transferInProgressRecordIds.map((e: any) =>
            TransferInProgressRecordIds.fromJSON(e),
          )
        : [],
    };
  },
  toJSON(message: GenesisState): JsonSafe<GenesisState> {
    const obj: any = {};
    message.params !== undefined &&
      (obj.params = message.params ? Params.toJSON(message.params) : undefined);
    message.hostZone !== undefined &&
      (obj.hostZone = message.hostZone
        ? HostZone.toJSON(message.hostZone)
        : undefined);
    if (message.delegationRecords) {
      obj.delegationRecords = message.delegationRecords.map(e =>
        e ? DelegationRecord.toJSON(e) : undefined,
      );
    } else {
      obj.delegationRecords = [];
    }
    if (message.unbondingRecords) {
      obj.unbondingRecords = message.unbondingRecords.map(e =>
        e ? UnbondingRecord.toJSON(e) : undefined,
      );
    } else {
      obj.unbondingRecords = [];
    }
    if (message.redemptionRecords) {
      obj.redemptionRecords = message.redemptionRecords.map(e =>
        e ? RedemptionRecord.toJSON(e) : undefined,
      );
    } else {
      obj.redemptionRecords = [];
    }
    if (message.slashRecords) {
      obj.slashRecords = message.slashRecords.map(e =>
        e ? SlashRecord.toJSON(e) : undefined,
      );
    } else {
      obj.slashRecords = [];
    }
    if (message.transferInProgressRecordIds) {
      obj.transferInProgressRecordIds = message.transferInProgressRecordIds.map(
        e => (e ? TransferInProgressRecordIds.toJSON(e) : undefined),
      );
    } else {
      obj.transferInProgressRecordIds = [];
    }
    return obj;
  },
  fromPartial(object: Partial<GenesisState>): GenesisState {
    const message = createBaseGenesisState();
    message.params =
      object.params !== undefined && object.params !== null
        ? Params.fromPartial(object.params)
        : undefined;
    message.hostZone =
      object.hostZone !== undefined && object.hostZone !== null
        ? HostZone.fromPartial(object.hostZone)
        : undefined;
    message.delegationRecords =
      object.delegationRecords?.map(e => DelegationRecord.fromPartial(e)) || [];
    message.unbondingRecords =
      object.unbondingRecords?.map(e => UnbondingRecord.fromPartial(e)) || [];
    message.redemptionRecords =
      object.redemptionRecords?.map(e => RedemptionRecord.fromPartial(e)) || [];
    message.slashRecords =
      object.slashRecords?.map(e => SlashRecord.fromPartial(e)) || [];
    message.transferInProgressRecordIds =
      object.transferInProgressRecordIds?.map(e =>
        TransferInProgressRecordIds.fromPartial(e),
      ) || [];
    return message;
  },
  fromProtoMsg(message: GenesisStateProtoMsg): GenesisState {
    return GenesisState.decode(message.value);
  },
  toProto(message: GenesisState): Uint8Array {
    return GenesisState.encode(message).finish();
  },
  toProtoMsg(message: GenesisState): GenesisStateProtoMsg {
    return {
      typeUrl: '/stride.staketia.GenesisState',
      value: GenesisState.encode(message).finish(),
    };
  },
};
