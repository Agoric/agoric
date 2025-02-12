import { Params, type ParamsSDKType } from './params.js';
import { HostZone, type HostZoneSDKType } from './host_zone.js';
import { EpochTracker, type EpochTrackerSDKType } from './epoch_tracker.js';
import { TradeRoute, type TradeRouteSDKType } from './trade_route.js';
import { BinaryReader, BinaryWriter } from '../../binary.js';
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
export declare const GenesisState: {
    typeUrl: string;
    encode(message: GenesisState, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): GenesisState;
    fromJSON(object: any): GenesisState;
    toJSON(message: GenesisState): JsonSafe<GenesisState>;
    fromPartial(object: Partial<GenesisState>): GenesisState;
    fromProtoMsg(message: GenesisStateProtoMsg): GenesisState;
    toProto(message: GenesisState): Uint8Array;
    toProtoMsg(message: GenesisState): GenesisStateProtoMsg;
};
