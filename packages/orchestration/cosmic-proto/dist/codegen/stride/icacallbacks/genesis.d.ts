import { Params, type ParamsSDKType } from './params.js';
import { CallbackData, type CallbackDataSDKType } from './callback_data.js';
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { type JsonSafe } from '../../json-safe.js';
/** GenesisState defines the icacallbacks module's genesis state. */
export interface GenesisState {
    params: Params;
    portId: string;
    callbackDataList: CallbackData[];
}
export interface GenesisStateProtoMsg {
    typeUrl: '/stride.icacallbacks.GenesisState';
    value: Uint8Array;
}
/** GenesisState defines the icacallbacks module's genesis state. */
export interface GenesisStateSDKType {
    params: ParamsSDKType;
    port_id: string;
    callback_data_list: CallbackDataSDKType[];
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
