//@ts-nocheck
import { Params, type ParamsSDKType } from './params.js';
import {
  UserRedemptionRecord,
  type UserRedemptionRecordSDKType,
  EpochUnbondingRecord,
  type EpochUnbondingRecordSDKType,
  DepositRecord,
  type DepositRecordSDKType,
  LSMTokenDeposit,
  type LSMTokenDepositSDKType,
} from './records.js';
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { isSet } from '../../helpers.js';
import { type JsonSafe } from '../../json-safe.js';
/** GenesisState defines the records module's genesis state. */
export interface GenesisState {
  params: Params;
  portId: string;
  userRedemptionRecordList: UserRedemptionRecord[];
  userRedemptionRecordCount: bigint;
  epochUnbondingRecordList: EpochUnbondingRecord[];
  depositRecordList: DepositRecord[];
  depositRecordCount: bigint;
  lsmTokenDepositList: LSMTokenDeposit[];
}
export interface GenesisStateProtoMsg {
  typeUrl: '/stride.records.GenesisState';
  value: Uint8Array;
}
/** GenesisState defines the records module's genesis state. */
export interface GenesisStateSDKType {
  params: ParamsSDKType;
  port_id: string;
  user_redemption_record_list: UserRedemptionRecordSDKType[];
  user_redemption_record_count: bigint;
  epoch_unbonding_record_list: EpochUnbondingRecordSDKType[];
  deposit_record_list: DepositRecordSDKType[];
  deposit_record_count: bigint;
  lsm_token_deposit_list: LSMTokenDepositSDKType[];
}
function createBaseGenesisState(): GenesisState {
  return {
    params: Params.fromPartial({}),
    portId: '',
    userRedemptionRecordList: [],
    userRedemptionRecordCount: BigInt(0),
    epochUnbondingRecordList: [],
    depositRecordList: [],
    depositRecordCount: BigInt(0),
    lsmTokenDepositList: [],
  };
}
export const GenesisState = {
  typeUrl: '/stride.records.GenesisState',
  encode(
    message: GenesisState,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.params !== undefined) {
      Params.encode(message.params, writer.uint32(10).fork()).ldelim();
    }
    if (message.portId !== '') {
      writer.uint32(18).string(message.portId);
    }
    for (const v of message.userRedemptionRecordList) {
      UserRedemptionRecord.encode(v!, writer.uint32(26).fork()).ldelim();
    }
    if (message.userRedemptionRecordCount !== BigInt(0)) {
      writer.uint32(32).uint64(message.userRedemptionRecordCount);
    }
    for (const v of message.epochUnbondingRecordList) {
      EpochUnbondingRecord.encode(v!, writer.uint32(42).fork()).ldelim();
    }
    for (const v of message.depositRecordList) {
      DepositRecord.encode(v!, writer.uint32(58).fork()).ldelim();
    }
    if (message.depositRecordCount !== BigInt(0)) {
      writer.uint32(64).uint64(message.depositRecordCount);
    }
    for (const v of message.lsmTokenDepositList) {
      LSMTokenDeposit.encode(v!, writer.uint32(74).fork()).ldelim();
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
          message.portId = reader.string();
          break;
        case 3:
          message.userRedemptionRecordList.push(
            UserRedemptionRecord.decode(reader, reader.uint32()),
          );
          break;
        case 4:
          message.userRedemptionRecordCount = reader.uint64();
          break;
        case 5:
          message.epochUnbondingRecordList.push(
            EpochUnbondingRecord.decode(reader, reader.uint32()),
          );
          break;
        case 7:
          message.depositRecordList.push(
            DepositRecord.decode(reader, reader.uint32()),
          );
          break;
        case 8:
          message.depositRecordCount = reader.uint64();
          break;
        case 9:
          message.lsmTokenDepositList.push(
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
  fromJSON(object: any): GenesisState {
    return {
      params: isSet(object.params) ? Params.fromJSON(object.params) : undefined,
      portId: isSet(object.portId) ? String(object.portId) : '',
      userRedemptionRecordList: Array.isArray(object?.userRedemptionRecordList)
        ? object.userRedemptionRecordList.map((e: any) =>
            UserRedemptionRecord.fromJSON(e),
          )
        : [],
      userRedemptionRecordCount: isSet(object.userRedemptionRecordCount)
        ? BigInt(object.userRedemptionRecordCount.toString())
        : BigInt(0),
      epochUnbondingRecordList: Array.isArray(object?.epochUnbondingRecordList)
        ? object.epochUnbondingRecordList.map((e: any) =>
            EpochUnbondingRecord.fromJSON(e),
          )
        : [],
      depositRecordList: Array.isArray(object?.depositRecordList)
        ? object.depositRecordList.map((e: any) => DepositRecord.fromJSON(e))
        : [],
      depositRecordCount: isSet(object.depositRecordCount)
        ? BigInt(object.depositRecordCount.toString())
        : BigInt(0),
      lsmTokenDepositList: Array.isArray(object?.lsmTokenDepositList)
        ? object.lsmTokenDepositList.map((e: any) =>
            LSMTokenDeposit.fromJSON(e),
          )
        : [],
    };
  },
  toJSON(message: GenesisState): JsonSafe<GenesisState> {
    const obj: any = {};
    message.params !== undefined &&
      (obj.params = message.params ? Params.toJSON(message.params) : undefined);
    message.portId !== undefined && (obj.portId = message.portId);
    if (message.userRedemptionRecordList) {
      obj.userRedemptionRecordList = message.userRedemptionRecordList.map(e =>
        e ? UserRedemptionRecord.toJSON(e) : undefined,
      );
    } else {
      obj.userRedemptionRecordList = [];
    }
    message.userRedemptionRecordCount !== undefined &&
      (obj.userRedemptionRecordCount = (
        message.userRedemptionRecordCount || BigInt(0)
      ).toString());
    if (message.epochUnbondingRecordList) {
      obj.epochUnbondingRecordList = message.epochUnbondingRecordList.map(e =>
        e ? EpochUnbondingRecord.toJSON(e) : undefined,
      );
    } else {
      obj.epochUnbondingRecordList = [];
    }
    if (message.depositRecordList) {
      obj.depositRecordList = message.depositRecordList.map(e =>
        e ? DepositRecord.toJSON(e) : undefined,
      );
    } else {
      obj.depositRecordList = [];
    }
    message.depositRecordCount !== undefined &&
      (obj.depositRecordCount = (
        message.depositRecordCount || BigInt(0)
      ).toString());
    if (message.lsmTokenDepositList) {
      obj.lsmTokenDepositList = message.lsmTokenDepositList.map(e =>
        e ? LSMTokenDeposit.toJSON(e) : undefined,
      );
    } else {
      obj.lsmTokenDepositList = [];
    }
    return obj;
  },
  fromPartial(object: Partial<GenesisState>): GenesisState {
    const message = createBaseGenesisState();
    message.params =
      object.params !== undefined && object.params !== null
        ? Params.fromPartial(object.params)
        : undefined;
    message.portId = object.portId ?? '';
    message.userRedemptionRecordList =
      object.userRedemptionRecordList?.map(e =>
        UserRedemptionRecord.fromPartial(e),
      ) || [];
    message.userRedemptionRecordCount =
      object.userRedemptionRecordCount !== undefined &&
      object.userRedemptionRecordCount !== null
        ? BigInt(object.userRedemptionRecordCount.toString())
        : BigInt(0);
    message.epochUnbondingRecordList =
      object.epochUnbondingRecordList?.map(e =>
        EpochUnbondingRecord.fromPartial(e),
      ) || [];
    message.depositRecordList =
      object.depositRecordList?.map(e => DepositRecord.fromPartial(e)) || [];
    message.depositRecordCount =
      object.depositRecordCount !== undefined &&
      object.depositRecordCount !== null
        ? BigInt(object.depositRecordCount.toString())
        : BigInt(0);
    message.lsmTokenDepositList =
      object.lsmTokenDepositList?.map(e => LSMTokenDeposit.fromPartial(e)) ||
      [];
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
      typeUrl: '/stride.records.GenesisState',
      value: GenesisState.encode(message).finish(),
    };
  },
};
