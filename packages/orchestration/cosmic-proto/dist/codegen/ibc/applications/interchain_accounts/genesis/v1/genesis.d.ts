import { Params as Params1 } from '../../controller/v1/controller.js';
import { type ParamsSDKType as Params1SDKType } from '../../controller/v1/controller.js';
import { Params as Params2 } from '../../host/v1/host.js';
import { type ParamsSDKType as Params2SDKType } from '../../host/v1/host.js';
import { BinaryReader, BinaryWriter } from '../../../../../binary.js';
import { type JsonSafe } from '../../../../../json-safe.js';
/** GenesisState defines the interchain accounts genesis state */
export interface GenesisState {
    controllerGenesisState: ControllerGenesisState;
    hostGenesisState: HostGenesisState;
}
export interface GenesisStateProtoMsg {
    typeUrl: '/ibc.applications.interchain_accounts.genesis.v1.GenesisState';
    value: Uint8Array;
}
/** GenesisState defines the interchain accounts genesis state */
export interface GenesisStateSDKType {
    controller_genesis_state: ControllerGenesisStateSDKType;
    host_genesis_state: HostGenesisStateSDKType;
}
/** ControllerGenesisState defines the interchain accounts controller genesis state */
export interface ControllerGenesisState {
    activeChannels: ActiveChannel[];
    interchainAccounts: RegisteredInterchainAccount[];
    ports: string[];
    params: Params1;
}
export interface ControllerGenesisStateProtoMsg {
    typeUrl: '/ibc.applications.interchain_accounts.genesis.v1.ControllerGenesisState';
    value: Uint8Array;
}
/** ControllerGenesisState defines the interchain accounts controller genesis state */
export interface ControllerGenesisStateSDKType {
    active_channels: ActiveChannelSDKType[];
    interchain_accounts: RegisteredInterchainAccountSDKType[];
    ports: string[];
    params: Params1SDKType;
}
/** HostGenesisState defines the interchain accounts host genesis state */
export interface HostGenesisState {
    activeChannels: ActiveChannel[];
    interchainAccounts: RegisteredInterchainAccount[];
    port: string;
    params: Params2;
}
export interface HostGenesisStateProtoMsg {
    typeUrl: '/ibc.applications.interchain_accounts.genesis.v1.HostGenesisState';
    value: Uint8Array;
}
/** HostGenesisState defines the interchain accounts host genesis state */
export interface HostGenesisStateSDKType {
    active_channels: ActiveChannelSDKType[];
    interchain_accounts: RegisteredInterchainAccountSDKType[];
    port: string;
    params: Params2SDKType;
}
/**
 * ActiveChannel contains a connection ID, port ID and associated active channel ID, as well as a boolean flag to
 * indicate if the channel is middleware enabled
 */
export interface ActiveChannel {
    connectionId: string;
    portId: string;
    channelId: string;
    isMiddlewareEnabled: boolean;
}
export interface ActiveChannelProtoMsg {
    typeUrl: '/ibc.applications.interchain_accounts.genesis.v1.ActiveChannel';
    value: Uint8Array;
}
/**
 * ActiveChannel contains a connection ID, port ID and associated active channel ID, as well as a boolean flag to
 * indicate if the channel is middleware enabled
 */
export interface ActiveChannelSDKType {
    connection_id: string;
    port_id: string;
    channel_id: string;
    is_middleware_enabled: boolean;
}
/** RegisteredInterchainAccount contains a connection ID, port ID and associated interchain account address */
export interface RegisteredInterchainAccount {
    connectionId: string;
    portId: string;
    accountAddress: string;
}
export interface RegisteredInterchainAccountProtoMsg {
    typeUrl: '/ibc.applications.interchain_accounts.genesis.v1.RegisteredInterchainAccount';
    value: Uint8Array;
}
/** RegisteredInterchainAccount contains a connection ID, port ID and associated interchain account address */
export interface RegisteredInterchainAccountSDKType {
    connection_id: string;
    port_id: string;
    account_address: string;
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
export declare const ControllerGenesisState: {
    typeUrl: string;
    encode(message: ControllerGenesisState, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): ControllerGenesisState;
    fromJSON(object: any): ControllerGenesisState;
    toJSON(message: ControllerGenesisState): JsonSafe<ControllerGenesisState>;
    fromPartial(object: Partial<ControllerGenesisState>): ControllerGenesisState;
    fromProtoMsg(message: ControllerGenesisStateProtoMsg): ControllerGenesisState;
    toProto(message: ControllerGenesisState): Uint8Array;
    toProtoMsg(message: ControllerGenesisState): ControllerGenesisStateProtoMsg;
};
export declare const HostGenesisState: {
    typeUrl: string;
    encode(message: HostGenesisState, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): HostGenesisState;
    fromJSON(object: any): HostGenesisState;
    toJSON(message: HostGenesisState): JsonSafe<HostGenesisState>;
    fromPartial(object: Partial<HostGenesisState>): HostGenesisState;
    fromProtoMsg(message: HostGenesisStateProtoMsg): HostGenesisState;
    toProto(message: HostGenesisState): Uint8Array;
    toProtoMsg(message: HostGenesisState): HostGenesisStateProtoMsg;
};
export declare const ActiveChannel: {
    typeUrl: string;
    encode(message: ActiveChannel, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): ActiveChannel;
    fromJSON(object: any): ActiveChannel;
    toJSON(message: ActiveChannel): JsonSafe<ActiveChannel>;
    fromPartial(object: Partial<ActiveChannel>): ActiveChannel;
    fromProtoMsg(message: ActiveChannelProtoMsg): ActiveChannel;
    toProto(message: ActiveChannel): Uint8Array;
    toProtoMsg(message: ActiveChannel): ActiveChannelProtoMsg;
};
export declare const RegisteredInterchainAccount: {
    typeUrl: string;
    encode(message: RegisteredInterchainAccount, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): RegisteredInterchainAccount;
    fromJSON(object: any): RegisteredInterchainAccount;
    toJSON(message: RegisteredInterchainAccount): JsonSafe<RegisteredInterchainAccount>;
    fromPartial(object: Partial<RegisteredInterchainAccount>): RegisteredInterchainAccount;
    fromProtoMsg(message: RegisteredInterchainAccountProtoMsg): RegisteredInterchainAccount;
    toProto(message: RegisteredInterchainAccount): Uint8Array;
    toProtoMsg(message: RegisteredInterchainAccount): RegisteredInterchainAccountProtoMsg;
};
