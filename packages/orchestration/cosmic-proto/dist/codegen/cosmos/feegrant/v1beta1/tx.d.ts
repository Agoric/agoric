import { Any, type AnySDKType } from '../../../google/protobuf/any.js';
import { BasicAllowance, type BasicAllowanceSDKType, PeriodicAllowance, type PeriodicAllowanceSDKType, AllowedMsgAllowance, type AllowedMsgAllowanceSDKType } from './feegrant.js';
import { BinaryReader, BinaryWriter } from '../../../binary.js';
import { type JsonSafe } from '../../../json-safe.js';
/**
 * MsgGrantAllowance adds permission for Grantee to spend up to Allowance
 * of fees from the account of Granter.
 */
export interface MsgGrantAllowance {
    /** granter is the address of the user granting an allowance of their funds. */
    granter: string;
    /** grantee is the address of the user being granted an allowance of another user's funds. */
    grantee: string;
    /** allowance can be any of basic, periodic, allowed fee allowance. */
    allowance?: (BasicAllowance & PeriodicAllowance & AllowedMsgAllowance & Any) | undefined;
}
export interface MsgGrantAllowanceProtoMsg {
    typeUrl: '/cosmos.feegrant.v1beta1.MsgGrantAllowance';
    value: Uint8Array;
}
/**
 * MsgGrantAllowance adds permission for Grantee to spend up to Allowance
 * of fees from the account of Granter.
 */
export interface MsgGrantAllowanceSDKType {
    granter: string;
    grantee: string;
    allowance?: BasicAllowanceSDKType | PeriodicAllowanceSDKType | AllowedMsgAllowanceSDKType | AnySDKType | undefined;
}
/** MsgGrantAllowanceResponse defines the Msg/GrantAllowanceResponse response type. */
export interface MsgGrantAllowanceResponse {
}
export interface MsgGrantAllowanceResponseProtoMsg {
    typeUrl: '/cosmos.feegrant.v1beta1.MsgGrantAllowanceResponse';
    value: Uint8Array;
}
/** MsgGrantAllowanceResponse defines the Msg/GrantAllowanceResponse response type. */
export interface MsgGrantAllowanceResponseSDKType {
}
/** MsgRevokeAllowance removes any existing Allowance from Granter to Grantee. */
export interface MsgRevokeAllowance {
    /** granter is the address of the user granting an allowance of their funds. */
    granter: string;
    /** grantee is the address of the user being granted an allowance of another user's funds. */
    grantee: string;
}
export interface MsgRevokeAllowanceProtoMsg {
    typeUrl: '/cosmos.feegrant.v1beta1.MsgRevokeAllowance';
    value: Uint8Array;
}
/** MsgRevokeAllowance removes any existing Allowance from Granter to Grantee. */
export interface MsgRevokeAllowanceSDKType {
    granter: string;
    grantee: string;
}
/** MsgRevokeAllowanceResponse defines the Msg/RevokeAllowanceResponse response type. */
export interface MsgRevokeAllowanceResponse {
}
export interface MsgRevokeAllowanceResponseProtoMsg {
    typeUrl: '/cosmos.feegrant.v1beta1.MsgRevokeAllowanceResponse';
    value: Uint8Array;
}
/** MsgRevokeAllowanceResponse defines the Msg/RevokeAllowanceResponse response type. */
export interface MsgRevokeAllowanceResponseSDKType {
}
export declare const MsgGrantAllowance: {
    typeUrl: string;
    encode(message: MsgGrantAllowance, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgGrantAllowance;
    fromJSON(object: any): MsgGrantAllowance;
    toJSON(message: MsgGrantAllowance): JsonSafe<MsgGrantAllowance>;
    fromPartial(object: Partial<MsgGrantAllowance>): MsgGrantAllowance;
    fromProtoMsg(message: MsgGrantAllowanceProtoMsg): MsgGrantAllowance;
    toProto(message: MsgGrantAllowance): Uint8Array;
    toProtoMsg(message: MsgGrantAllowance): MsgGrantAllowanceProtoMsg;
};
export declare const MsgGrantAllowanceResponse: {
    typeUrl: string;
    encode(_: MsgGrantAllowanceResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgGrantAllowanceResponse;
    fromJSON(_: any): MsgGrantAllowanceResponse;
    toJSON(_: MsgGrantAllowanceResponse): JsonSafe<MsgGrantAllowanceResponse>;
    fromPartial(_: Partial<MsgGrantAllowanceResponse>): MsgGrantAllowanceResponse;
    fromProtoMsg(message: MsgGrantAllowanceResponseProtoMsg): MsgGrantAllowanceResponse;
    toProto(message: MsgGrantAllowanceResponse): Uint8Array;
    toProtoMsg(message: MsgGrantAllowanceResponse): MsgGrantAllowanceResponseProtoMsg;
};
export declare const MsgRevokeAllowance: {
    typeUrl: string;
    encode(message: MsgRevokeAllowance, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgRevokeAllowance;
    fromJSON(object: any): MsgRevokeAllowance;
    toJSON(message: MsgRevokeAllowance): JsonSafe<MsgRevokeAllowance>;
    fromPartial(object: Partial<MsgRevokeAllowance>): MsgRevokeAllowance;
    fromProtoMsg(message: MsgRevokeAllowanceProtoMsg): MsgRevokeAllowance;
    toProto(message: MsgRevokeAllowance): Uint8Array;
    toProtoMsg(message: MsgRevokeAllowance): MsgRevokeAllowanceProtoMsg;
};
export declare const MsgRevokeAllowanceResponse: {
    typeUrl: string;
    encode(_: MsgRevokeAllowanceResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgRevokeAllowanceResponse;
    fromJSON(_: any): MsgRevokeAllowanceResponse;
    toJSON(_: MsgRevokeAllowanceResponse): JsonSafe<MsgRevokeAllowanceResponse>;
    fromPartial(_: Partial<MsgRevokeAllowanceResponse>): MsgRevokeAllowanceResponse;
    fromProtoMsg(message: MsgRevokeAllowanceResponseProtoMsg): MsgRevokeAllowanceResponse;
    toProto(message: MsgRevokeAllowanceResponse): Uint8Array;
    toProtoMsg(message: MsgRevokeAllowanceResponse): MsgRevokeAllowanceResponseProtoMsg;
};
export declare const FeeAllowanceI_InterfaceDecoder: (input: BinaryReader | Uint8Array) => BasicAllowance | PeriodicAllowance | AllowedMsgAllowance | Any;
