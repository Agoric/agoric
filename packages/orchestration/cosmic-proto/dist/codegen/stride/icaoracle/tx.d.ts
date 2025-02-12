import { BinaryReader, BinaryWriter } from '../../binary.js';
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
export interface MsgAddOracleResponse {
}
export interface MsgAddOracleResponseProtoMsg {
    typeUrl: '/stride.icaoracle.MsgAddOracleResponse';
    value: Uint8Array;
}
export interface MsgAddOracleResponseSDKType {
}
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
export interface MsgInstantiateOracleResponse {
}
export interface MsgInstantiateOracleResponseProtoMsg {
    typeUrl: '/stride.icaoracle.MsgInstantiateOracleResponse';
    value: Uint8Array;
}
export interface MsgInstantiateOracleResponseSDKType {
}
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
export interface MsgRestoreOracleICAResponse {
}
export interface MsgRestoreOracleICAResponseProtoMsg {
    typeUrl: '/stride.icaoracle.MsgRestoreOracleICAResponse';
    value: Uint8Array;
}
export interface MsgRestoreOracleICAResponseSDKType {
}
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
export interface MsgToggleOracleResponse {
}
export interface MsgToggleOracleResponseProtoMsg {
    typeUrl: '/stride.icaoracle.MsgToggleOracleResponse';
    value: Uint8Array;
}
export interface MsgToggleOracleResponseSDKType {
}
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
export interface MsgRemoveOracleResponse {
}
export interface MsgRemoveOracleResponseProtoMsg {
    typeUrl: '/stride.icaoracle.MsgRemoveOracleResponse';
    value: Uint8Array;
}
export interface MsgRemoveOracleResponseSDKType {
}
export declare const MsgAddOracle: {
    typeUrl: string;
    encode(message: MsgAddOracle, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgAddOracle;
    fromJSON(object: any): MsgAddOracle;
    toJSON(message: MsgAddOracle): JsonSafe<MsgAddOracle>;
    fromPartial(object: Partial<MsgAddOracle>): MsgAddOracle;
    fromProtoMsg(message: MsgAddOracleProtoMsg): MsgAddOracle;
    toProto(message: MsgAddOracle): Uint8Array;
    toProtoMsg(message: MsgAddOracle): MsgAddOracleProtoMsg;
};
export declare const MsgAddOracleResponse: {
    typeUrl: string;
    encode(_: MsgAddOracleResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgAddOracleResponse;
    fromJSON(_: any): MsgAddOracleResponse;
    toJSON(_: MsgAddOracleResponse): JsonSafe<MsgAddOracleResponse>;
    fromPartial(_: Partial<MsgAddOracleResponse>): MsgAddOracleResponse;
    fromProtoMsg(message: MsgAddOracleResponseProtoMsg): MsgAddOracleResponse;
    toProto(message: MsgAddOracleResponse): Uint8Array;
    toProtoMsg(message: MsgAddOracleResponse): MsgAddOracleResponseProtoMsg;
};
export declare const MsgInstantiateOracle: {
    typeUrl: string;
    encode(message: MsgInstantiateOracle, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgInstantiateOracle;
    fromJSON(object: any): MsgInstantiateOracle;
    toJSON(message: MsgInstantiateOracle): JsonSafe<MsgInstantiateOracle>;
    fromPartial(object: Partial<MsgInstantiateOracle>): MsgInstantiateOracle;
    fromProtoMsg(message: MsgInstantiateOracleProtoMsg): MsgInstantiateOracle;
    toProto(message: MsgInstantiateOracle): Uint8Array;
    toProtoMsg(message: MsgInstantiateOracle): MsgInstantiateOracleProtoMsg;
};
export declare const MsgInstantiateOracleResponse: {
    typeUrl: string;
    encode(_: MsgInstantiateOracleResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgInstantiateOracleResponse;
    fromJSON(_: any): MsgInstantiateOracleResponse;
    toJSON(_: MsgInstantiateOracleResponse): JsonSafe<MsgInstantiateOracleResponse>;
    fromPartial(_: Partial<MsgInstantiateOracleResponse>): MsgInstantiateOracleResponse;
    fromProtoMsg(message: MsgInstantiateOracleResponseProtoMsg): MsgInstantiateOracleResponse;
    toProto(message: MsgInstantiateOracleResponse): Uint8Array;
    toProtoMsg(message: MsgInstantiateOracleResponse): MsgInstantiateOracleResponseProtoMsg;
};
export declare const MsgRestoreOracleICA: {
    typeUrl: string;
    encode(message: MsgRestoreOracleICA, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgRestoreOracleICA;
    fromJSON(object: any): MsgRestoreOracleICA;
    toJSON(message: MsgRestoreOracleICA): JsonSafe<MsgRestoreOracleICA>;
    fromPartial(object: Partial<MsgRestoreOracleICA>): MsgRestoreOracleICA;
    fromProtoMsg(message: MsgRestoreOracleICAProtoMsg): MsgRestoreOracleICA;
    toProto(message: MsgRestoreOracleICA): Uint8Array;
    toProtoMsg(message: MsgRestoreOracleICA): MsgRestoreOracleICAProtoMsg;
};
export declare const MsgRestoreOracleICAResponse: {
    typeUrl: string;
    encode(_: MsgRestoreOracleICAResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgRestoreOracleICAResponse;
    fromJSON(_: any): MsgRestoreOracleICAResponse;
    toJSON(_: MsgRestoreOracleICAResponse): JsonSafe<MsgRestoreOracleICAResponse>;
    fromPartial(_: Partial<MsgRestoreOracleICAResponse>): MsgRestoreOracleICAResponse;
    fromProtoMsg(message: MsgRestoreOracleICAResponseProtoMsg): MsgRestoreOracleICAResponse;
    toProto(message: MsgRestoreOracleICAResponse): Uint8Array;
    toProtoMsg(message: MsgRestoreOracleICAResponse): MsgRestoreOracleICAResponseProtoMsg;
};
export declare const MsgToggleOracle: {
    typeUrl: string;
    encode(message: MsgToggleOracle, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgToggleOracle;
    fromJSON(object: any): MsgToggleOracle;
    toJSON(message: MsgToggleOracle): JsonSafe<MsgToggleOracle>;
    fromPartial(object: Partial<MsgToggleOracle>): MsgToggleOracle;
    fromProtoMsg(message: MsgToggleOracleProtoMsg): MsgToggleOracle;
    toProto(message: MsgToggleOracle): Uint8Array;
    toProtoMsg(message: MsgToggleOracle): MsgToggleOracleProtoMsg;
};
export declare const MsgToggleOracleResponse: {
    typeUrl: string;
    encode(_: MsgToggleOracleResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgToggleOracleResponse;
    fromJSON(_: any): MsgToggleOracleResponse;
    toJSON(_: MsgToggleOracleResponse): JsonSafe<MsgToggleOracleResponse>;
    fromPartial(_: Partial<MsgToggleOracleResponse>): MsgToggleOracleResponse;
    fromProtoMsg(message: MsgToggleOracleResponseProtoMsg): MsgToggleOracleResponse;
    toProto(message: MsgToggleOracleResponse): Uint8Array;
    toProtoMsg(message: MsgToggleOracleResponse): MsgToggleOracleResponseProtoMsg;
};
export declare const MsgRemoveOracle: {
    typeUrl: string;
    encode(message: MsgRemoveOracle, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgRemoveOracle;
    fromJSON(object: any): MsgRemoveOracle;
    toJSON(message: MsgRemoveOracle): JsonSafe<MsgRemoveOracle>;
    fromPartial(object: Partial<MsgRemoveOracle>): MsgRemoveOracle;
    fromProtoMsg(message: MsgRemoveOracleProtoMsg): MsgRemoveOracle;
    toProto(message: MsgRemoveOracle): Uint8Array;
    toProtoMsg(message: MsgRemoveOracle): MsgRemoveOracleProtoMsg;
};
export declare const MsgRemoveOracleResponse: {
    typeUrl: string;
    encode(_: MsgRemoveOracleResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgRemoveOracleResponse;
    fromJSON(_: any): MsgRemoveOracleResponse;
    toJSON(_: MsgRemoveOracleResponse): JsonSafe<MsgRemoveOracleResponse>;
    fromPartial(_: Partial<MsgRemoveOracleResponse>): MsgRemoveOracleResponse;
    fromProtoMsg(message: MsgRemoveOracleResponseProtoMsg): MsgRemoveOracleResponse;
    toProto(message: MsgRemoveOracleResponse): Uint8Array;
    toProtoMsg(message: MsgRemoveOracleResponse): MsgRemoveOracleResponseProtoMsg;
};
