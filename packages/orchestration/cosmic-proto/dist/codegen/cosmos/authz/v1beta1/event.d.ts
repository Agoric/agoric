import { BinaryReader, BinaryWriter } from '../../../binary.js';
import { type JsonSafe } from '../../../json-safe.js';
/** EventGrant is emitted on Msg/Grant */
export interface EventGrant {
    /** Msg type URL for which an autorization is granted */
    msgTypeUrl: string;
    /** Granter account address */
    granter: string;
    /** Grantee account address */
    grantee: string;
}
export interface EventGrantProtoMsg {
    typeUrl: '/cosmos.authz.v1beta1.EventGrant';
    value: Uint8Array;
}
/** EventGrant is emitted on Msg/Grant */
export interface EventGrantSDKType {
    msg_type_url: string;
    granter: string;
    grantee: string;
}
/** EventRevoke is emitted on Msg/Revoke */
export interface EventRevoke {
    /** Msg type URL for which an autorization is revoked */
    msgTypeUrl: string;
    /** Granter account address */
    granter: string;
    /** Grantee account address */
    grantee: string;
}
export interface EventRevokeProtoMsg {
    typeUrl: '/cosmos.authz.v1beta1.EventRevoke';
    value: Uint8Array;
}
/** EventRevoke is emitted on Msg/Revoke */
export interface EventRevokeSDKType {
    msg_type_url: string;
    granter: string;
    grantee: string;
}
export declare const EventGrant: {
    typeUrl: string;
    encode(message: EventGrant, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): EventGrant;
    fromJSON(object: any): EventGrant;
    toJSON(message: EventGrant): JsonSafe<EventGrant>;
    fromPartial(object: Partial<EventGrant>): EventGrant;
    fromProtoMsg(message: EventGrantProtoMsg): EventGrant;
    toProto(message: EventGrant): Uint8Array;
    toProtoMsg(message: EventGrant): EventGrantProtoMsg;
};
export declare const EventRevoke: {
    typeUrl: string;
    encode(message: EventRevoke, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): EventRevoke;
    fromJSON(object: any): EventRevoke;
    toJSON(message: EventRevoke): JsonSafe<EventRevoke>;
    fromPartial(object: Partial<EventRevoke>): EventRevoke;
    fromProtoMsg(message: EventRevokeProtoMsg): EventRevoke;
    toProto(message: EventRevoke): Uint8Array;
    toProtoMsg(message: EventRevoke): EventRevokeProtoMsg;
};
