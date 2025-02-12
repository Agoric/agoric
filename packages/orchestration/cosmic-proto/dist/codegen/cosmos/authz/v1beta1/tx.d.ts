import { Grant, type GrantSDKType } from './authz.js';
import { Any, type AnySDKType } from '../../../google/protobuf/any.js';
import { BinaryReader, BinaryWriter } from '../../../binary.js';
import { type JsonSafe } from '../../../json-safe.js';
/**
 * MsgGrant is a request type for Grant method. It declares authorization to the grantee
 * on behalf of the granter with the provided expiration time.
 */
export interface MsgGrant {
    granter: string;
    grantee: string;
    grant: Grant;
}
export interface MsgGrantProtoMsg {
    typeUrl: '/cosmos.authz.v1beta1.MsgGrant';
    value: Uint8Array;
}
/**
 * MsgGrant is a request type for Grant method. It declares authorization to the grantee
 * on behalf of the granter with the provided expiration time.
 */
export interface MsgGrantSDKType {
    granter: string;
    grantee: string;
    grant: GrantSDKType;
}
/** MsgExecResponse defines the Msg/MsgExecResponse response type. */
export interface MsgExecResponse {
    results: Uint8Array[];
}
export interface MsgExecResponseProtoMsg {
    typeUrl: '/cosmos.authz.v1beta1.MsgExecResponse';
    value: Uint8Array;
}
/** MsgExecResponse defines the Msg/MsgExecResponse response type. */
export interface MsgExecResponseSDKType {
    results: Uint8Array[];
}
/**
 * MsgExec attempts to execute the provided messages using
 * authorizations granted to the grantee. Each message should have only
 * one signer corresponding to the granter of the authorization.
 */
export interface MsgExec {
    grantee: string;
    /**
     * Authorization Msg requests to execute. Each msg must implement Authorization interface
     * The x/authz will try to find a grant matching (msg.signers[0], grantee, MsgTypeURL(msg))
     * triple and validate it.
     */
    msgs: Any[] | Any[];
}
export interface MsgExecProtoMsg {
    typeUrl: '/cosmos.authz.v1beta1.MsgExec';
    value: Uint8Array;
}
/**
 * MsgExec attempts to execute the provided messages using
 * authorizations granted to the grantee. Each message should have only
 * one signer corresponding to the granter of the authorization.
 */
export interface MsgExecSDKType {
    grantee: string;
    msgs: AnySDKType[];
}
/** MsgGrantResponse defines the Msg/MsgGrant response type. */
export interface MsgGrantResponse {
}
export interface MsgGrantResponseProtoMsg {
    typeUrl: '/cosmos.authz.v1beta1.MsgGrantResponse';
    value: Uint8Array;
}
/** MsgGrantResponse defines the Msg/MsgGrant response type. */
export interface MsgGrantResponseSDKType {
}
/**
 * MsgRevoke revokes any authorization with the provided sdk.Msg type on the
 * granter's account with that has been granted to the grantee.
 */
export interface MsgRevoke {
    granter: string;
    grantee: string;
    msgTypeUrl: string;
}
export interface MsgRevokeProtoMsg {
    typeUrl: '/cosmos.authz.v1beta1.MsgRevoke';
    value: Uint8Array;
}
/**
 * MsgRevoke revokes any authorization with the provided sdk.Msg type on the
 * granter's account with that has been granted to the grantee.
 */
export interface MsgRevokeSDKType {
    granter: string;
    grantee: string;
    msg_type_url: string;
}
/** MsgRevokeResponse defines the Msg/MsgRevokeResponse response type. */
export interface MsgRevokeResponse {
}
export interface MsgRevokeResponseProtoMsg {
    typeUrl: '/cosmos.authz.v1beta1.MsgRevokeResponse';
    value: Uint8Array;
}
/** MsgRevokeResponse defines the Msg/MsgRevokeResponse response type. */
export interface MsgRevokeResponseSDKType {
}
export declare const MsgGrant: {
    typeUrl: string;
    encode(message: MsgGrant, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgGrant;
    fromJSON(object: any): MsgGrant;
    toJSON(message: MsgGrant): JsonSafe<MsgGrant>;
    fromPartial(object: Partial<MsgGrant>): MsgGrant;
    fromProtoMsg(message: MsgGrantProtoMsg): MsgGrant;
    toProto(message: MsgGrant): Uint8Array;
    toProtoMsg(message: MsgGrant): MsgGrantProtoMsg;
};
export declare const MsgExecResponse: {
    typeUrl: string;
    encode(message: MsgExecResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgExecResponse;
    fromJSON(object: any): MsgExecResponse;
    toJSON(message: MsgExecResponse): JsonSafe<MsgExecResponse>;
    fromPartial(object: Partial<MsgExecResponse>): MsgExecResponse;
    fromProtoMsg(message: MsgExecResponseProtoMsg): MsgExecResponse;
    toProto(message: MsgExecResponse): Uint8Array;
    toProtoMsg(message: MsgExecResponse): MsgExecResponseProtoMsg;
};
export declare const MsgExec: {
    typeUrl: string;
    encode(message: MsgExec, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgExec;
    fromJSON(object: any): MsgExec;
    toJSON(message: MsgExec): JsonSafe<MsgExec>;
    fromPartial(object: Partial<MsgExec>): MsgExec;
    fromProtoMsg(message: MsgExecProtoMsg): MsgExec;
    toProto(message: MsgExec): Uint8Array;
    toProtoMsg(message: MsgExec): MsgExecProtoMsg;
};
export declare const MsgGrantResponse: {
    typeUrl: string;
    encode(_: MsgGrantResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgGrantResponse;
    fromJSON(_: any): MsgGrantResponse;
    toJSON(_: MsgGrantResponse): JsonSafe<MsgGrantResponse>;
    fromPartial(_: Partial<MsgGrantResponse>): MsgGrantResponse;
    fromProtoMsg(message: MsgGrantResponseProtoMsg): MsgGrantResponse;
    toProto(message: MsgGrantResponse): Uint8Array;
    toProtoMsg(message: MsgGrantResponse): MsgGrantResponseProtoMsg;
};
export declare const MsgRevoke: {
    typeUrl: string;
    encode(message: MsgRevoke, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgRevoke;
    fromJSON(object: any): MsgRevoke;
    toJSON(message: MsgRevoke): JsonSafe<MsgRevoke>;
    fromPartial(object: Partial<MsgRevoke>): MsgRevoke;
    fromProtoMsg(message: MsgRevokeProtoMsg): MsgRevoke;
    toProto(message: MsgRevoke): Uint8Array;
    toProtoMsg(message: MsgRevoke): MsgRevokeProtoMsg;
};
export declare const MsgRevokeResponse: {
    typeUrl: string;
    encode(_: MsgRevokeResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgRevokeResponse;
    fromJSON(_: any): MsgRevokeResponse;
    toJSON(_: MsgRevokeResponse): JsonSafe<MsgRevokeResponse>;
    fromPartial(_: Partial<MsgRevokeResponse>): MsgRevokeResponse;
    fromProtoMsg(message: MsgRevokeResponseProtoMsg): MsgRevokeResponse;
    toProto(message: MsgRevokeResponse): Uint8Array;
    toProtoMsg(message: MsgRevokeResponse): MsgRevokeResponseProtoMsg;
};
export declare const Sdk_Msg_InterfaceDecoder: (input: BinaryReader | Uint8Array) => Any;
export declare const Authz_Authorization_InterfaceDecoder: (input: BinaryReader | Uint8Array) => Any;
