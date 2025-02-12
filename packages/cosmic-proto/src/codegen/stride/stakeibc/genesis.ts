//@ts-nocheck
import { Params, type ParamsSDKType } from './params.js';
import { HostZone, type HostZoneSDKType } from './host_zone.js';
import { EpochTracker, type EpochTrackerSDKType } from './epoch_tracker.js';
import { TradeRoute, type TradeRouteSDKType } from './trade_route.js';
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { isSet } from '../../helpers.js';
import { type JsonSafe } from '../../json-safe.js';
/** GenesisState defines the stakeibc module's genesis state. */
export interface GenesisState {
  params: Params;
  portId: string;
  hostZoneList: HostZone[];
  epochTrackerList: EpochTracker[];
  tradeRoutes: TradeRoute[];
}
export interface GenesisStateProtoMsg {
  typeUrl: '/stride.stakeibc.GenesisState';
  value: Uint8Array;
}
/** GenesisState defines the stakeibc module's genesis state. */
export interface GenesisStateSDKType {
  params: ParamsSDKType;
  port_id: string;
  host_zone_list: HostZoneSDKType[];
  epoch_tracker_list: EpochTrackerSDKType[];
  trade_routes: TradeRouteSDKType[];
}
function createBaseGenesisState(): GenesisState {
  return {
    params: Params.fromPartial({}),
    portId: '',
    hostZoneList: [],
    epochTrackerList: [],
    tradeRoutes: [],
  };
}
export const GenesisState = {
  typeUrl: '/stride.stakeibc.GenesisState',
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
    for (const v of message.hostZoneList) {
      HostZone.encode(v!, writer.uint32(42).fork()).ldelim();
    }
    for (const v of message.epochTrackerList) {
      EpochTracker.encode(v!, writer.uint32(82).fork()).ldelim();
    }
    for (const v of message.tradeRoutes) {
      TradeRoute.encode(v!, writer.uint32(98).fork()).ldelim();
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
        case 5:
          message.hostZoneList.push(HostZone.decode(reader, reader.uint32()));
          break;
        case 10:
          message.epochTrackerList.push(
            EpochTracker.decode(reader, reader.uint32()),
          );
          break;
        case 12:
          message.tradeRoutes.push(TradeRoute.decode(reader, reader.uint32()));
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
      hostZoneList: Array.isArray(object?.hostZoneList)
        ? object.hostZoneList.map((e: any) => HostZone.fromJSON(e))
        : [],
      epochTrackerList: Array.isArray(object?.epochTrackerList)
        ? object.epochTrackerList.map((e: any) => EpochTracker.fromJSON(e))
        : [],
      tradeRoutes: Array.isArray(object?.tradeRoutes)
        ? object.tradeRoutes.map((e: any) => TradeRoute.fromJSON(e))
        : [],
    };
  },
  toJSON(message: GenesisState): JsonSafe<GenesisState> {
    const obj: any = {};
    message.params !== undefined &&
      (obj.params = message.params ? Params.toJSON(message.params) : undefined);
    message.portId !== undefined && (obj.portId = message.portId);
    if (message.hostZoneList) {
      obj.hostZoneList = message.hostZoneList.map(e =>
        e ? HostZone.toJSON(e) : undefined,
      );
    } else {
      obj.hostZoneList = [];
    }
    if (message.epochTrackerList) {
      obj.epochTrackerList = message.epochTrackerList.map(e =>
        e ? EpochTracker.toJSON(e) : undefined,
      );
    } else {
      obj.epochTrackerList = [];
    }
    if (message.tradeRoutes) {
      obj.tradeRoutes = message.tradeRoutes.map(e =>
        e ? TradeRoute.toJSON(e) : undefined,
      );
    } else {
      obj.tradeRoutes = [];
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
    message.hostZoneList =
      object.hostZoneList?.map(e => HostZone.fromPartial(e)) || [];
    message.epochTrackerList =
      object.epochTrackerList?.map(e => EpochTracker.fromPartial(e)) || [];
    message.tradeRoutes =
      object.tradeRoutes?.map(e => TradeRoute.fromPartial(e)) || [];
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
      typeUrl: '/stride.stakeibc.GenesisState',
      value: GenesisState.encode(message).finish(),
    };
  },
};
