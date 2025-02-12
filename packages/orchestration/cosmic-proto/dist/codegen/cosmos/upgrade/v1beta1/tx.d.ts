import { Plan, type PlanSDKType } from './upgrade.js';
import { BinaryReader, BinaryWriter } from '../../../binary.js';
import { type JsonSafe } from '../../../json-safe.js';
/**
 * MsgSoftwareUpgrade is the Msg/SoftwareUpgrade request type.
 *
 * Since: cosmos-sdk 0.46
 */
export interface MsgSoftwareUpgrade {
    /** authority is the address of the governance account. */
    authority: string;
    /** plan is the upgrade plan. */
    plan: Plan;
}
export interface MsgSoftwareUpgradeProtoMsg {
    typeUrl: '/cosmos.upgrade.v1beta1.MsgSoftwareUpgrade';
    value: Uint8Array;
}
/**
 * MsgSoftwareUpgrade is the Msg/SoftwareUpgrade request type.
 *
 * Since: cosmos-sdk 0.46
 */
export interface MsgSoftwareUpgradeSDKType {
    authority: string;
    plan: PlanSDKType;
}
/**
 * MsgSoftwareUpgradeResponse is the Msg/SoftwareUpgrade response type.
 *
 * Since: cosmos-sdk 0.46
 */
export interface MsgSoftwareUpgradeResponse {
}
export interface MsgSoftwareUpgradeResponseProtoMsg {
    typeUrl: '/cosmos.upgrade.v1beta1.MsgSoftwareUpgradeResponse';
    value: Uint8Array;
}
/**
 * MsgSoftwareUpgradeResponse is the Msg/SoftwareUpgrade response type.
 *
 * Since: cosmos-sdk 0.46
 */
export interface MsgSoftwareUpgradeResponseSDKType {
}
/**
 * MsgCancelUpgrade is the Msg/CancelUpgrade request type.
 *
 * Since: cosmos-sdk 0.46
 */
export interface MsgCancelUpgrade {
    /** authority is the address of the governance account. */
    authority: string;
}
export interface MsgCancelUpgradeProtoMsg {
    typeUrl: '/cosmos.upgrade.v1beta1.MsgCancelUpgrade';
    value: Uint8Array;
}
/**
 * MsgCancelUpgrade is the Msg/CancelUpgrade request type.
 *
 * Since: cosmos-sdk 0.46
 */
export interface MsgCancelUpgradeSDKType {
    authority: string;
}
/**
 * MsgCancelUpgradeResponse is the Msg/CancelUpgrade response type.
 *
 * Since: cosmos-sdk 0.46
 */
export interface MsgCancelUpgradeResponse {
}
export interface MsgCancelUpgradeResponseProtoMsg {
    typeUrl: '/cosmos.upgrade.v1beta1.MsgCancelUpgradeResponse';
    value: Uint8Array;
}
/**
 * MsgCancelUpgradeResponse is the Msg/CancelUpgrade response type.
 *
 * Since: cosmos-sdk 0.46
 */
export interface MsgCancelUpgradeResponseSDKType {
}
export declare const MsgSoftwareUpgrade: {
    typeUrl: string;
    encode(message: MsgSoftwareUpgrade, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgSoftwareUpgrade;
    fromJSON(object: any): MsgSoftwareUpgrade;
    toJSON(message: MsgSoftwareUpgrade): JsonSafe<MsgSoftwareUpgrade>;
    fromPartial(object: Partial<MsgSoftwareUpgrade>): MsgSoftwareUpgrade;
    fromProtoMsg(message: MsgSoftwareUpgradeProtoMsg): MsgSoftwareUpgrade;
    toProto(message: MsgSoftwareUpgrade): Uint8Array;
    toProtoMsg(message: MsgSoftwareUpgrade): MsgSoftwareUpgradeProtoMsg;
};
export declare const MsgSoftwareUpgradeResponse: {
    typeUrl: string;
    encode(_: MsgSoftwareUpgradeResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgSoftwareUpgradeResponse;
    fromJSON(_: any): MsgSoftwareUpgradeResponse;
    toJSON(_: MsgSoftwareUpgradeResponse): JsonSafe<MsgSoftwareUpgradeResponse>;
    fromPartial(_: Partial<MsgSoftwareUpgradeResponse>): MsgSoftwareUpgradeResponse;
    fromProtoMsg(message: MsgSoftwareUpgradeResponseProtoMsg): MsgSoftwareUpgradeResponse;
    toProto(message: MsgSoftwareUpgradeResponse): Uint8Array;
    toProtoMsg(message: MsgSoftwareUpgradeResponse): MsgSoftwareUpgradeResponseProtoMsg;
};
export declare const MsgCancelUpgrade: {
    typeUrl: string;
    encode(message: MsgCancelUpgrade, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgCancelUpgrade;
    fromJSON(object: any): MsgCancelUpgrade;
    toJSON(message: MsgCancelUpgrade): JsonSafe<MsgCancelUpgrade>;
    fromPartial(object: Partial<MsgCancelUpgrade>): MsgCancelUpgrade;
    fromProtoMsg(message: MsgCancelUpgradeProtoMsg): MsgCancelUpgrade;
    toProto(message: MsgCancelUpgrade): Uint8Array;
    toProtoMsg(message: MsgCancelUpgrade): MsgCancelUpgradeProtoMsg;
};
export declare const MsgCancelUpgradeResponse: {
    typeUrl: string;
    encode(_: MsgCancelUpgradeResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgCancelUpgradeResponse;
    fromJSON(_: any): MsgCancelUpgradeResponse;
    toJSON(_: MsgCancelUpgradeResponse): JsonSafe<MsgCancelUpgradeResponse>;
    fromPartial(_: Partial<MsgCancelUpgradeResponse>): MsgCancelUpgradeResponse;
    fromProtoMsg(message: MsgCancelUpgradeResponseProtoMsg): MsgCancelUpgradeResponse;
    toProto(message: MsgCancelUpgradeResponse): Uint8Array;
    toProtoMsg(message: MsgCancelUpgradeResponse): MsgCancelUpgradeResponseProtoMsg;
};
