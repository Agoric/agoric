import { Timestamp, type TimestampSDKType } from '../../../google/protobuf/timestamp.js';
import { Any, type AnySDKType } from '../../../google/protobuf/any.js';
import { BinaryReader, BinaryWriter } from '../../../binary.js';
import { type JsonSafe } from '../../../json-safe.js';
/** Plan specifies information about a planned upgrade and when it should occur. */
export interface Plan {
    /**
     * Sets the name for the upgrade. This name will be used by the upgraded
     * version of the software to apply any special "on-upgrade" commands during
     * the first BeginBlock method after the upgrade is applied. It is also used
     * to detect whether a software version can handle a given upgrade. If no
     * upgrade handler with this name has been set in the software, it will be
     * assumed that the software is out-of-date when the upgrade Time or Height is
     * reached and the software will exit.
     */
    name: string;
    /**
     * Deprecated: Time based upgrades have been deprecated. Time based upgrade logic
     * has been removed from the SDK.
     * If this field is not empty, an error will be thrown.
     */
    /** @deprecated */
    time: Timestamp;
    /**
     * The height at which the upgrade must be performed.
     * Only used if Time is not set.
     */
    height: bigint;
    /**
     * Any application specific upgrade info to be included on-chain
     * such as a git commit that validators could automatically upgrade to
     */
    info: string;
    /**
     * Deprecated: UpgradedClientState field has been deprecated. IBC upgrade logic has been
     * moved to the IBC module in the sub module 02-client.
     * If this field is not empty, an error will be thrown.
     */
    /** @deprecated */
    upgradedClientState?: Any;
}
export interface PlanProtoMsg {
    typeUrl: '/cosmos.upgrade.v1beta1.Plan';
    value: Uint8Array;
}
/** Plan specifies information about a planned upgrade and when it should occur. */
export interface PlanSDKType {
    name: string;
    /** @deprecated */
    time: TimestampSDKType;
    height: bigint;
    info: string;
    /** @deprecated */
    upgraded_client_state?: AnySDKType;
}
/**
 * SoftwareUpgradeProposal is a gov Content type for initiating a software
 * upgrade.
 * Deprecated: This legacy proposal is deprecated in favor of Msg-based gov
 * proposals, see MsgSoftwareUpgrade.
 */
/** @deprecated */
export interface SoftwareUpgradeProposal {
    $typeUrl?: '/cosmos.upgrade.v1beta1.SoftwareUpgradeProposal';
    title: string;
    description: string;
    plan: Plan;
}
export interface SoftwareUpgradeProposalProtoMsg {
    typeUrl: '/cosmos.upgrade.v1beta1.SoftwareUpgradeProposal';
    value: Uint8Array;
}
/**
 * SoftwareUpgradeProposal is a gov Content type for initiating a software
 * upgrade.
 * Deprecated: This legacy proposal is deprecated in favor of Msg-based gov
 * proposals, see MsgSoftwareUpgrade.
 */
/** @deprecated */
export interface SoftwareUpgradeProposalSDKType {
    $typeUrl?: '/cosmos.upgrade.v1beta1.SoftwareUpgradeProposal';
    title: string;
    description: string;
    plan: PlanSDKType;
}
/**
 * CancelSoftwareUpgradeProposal is a gov Content type for cancelling a software
 * upgrade.
 * Deprecated: This legacy proposal is deprecated in favor of Msg-based gov
 * proposals, see MsgCancelUpgrade.
 */
/** @deprecated */
export interface CancelSoftwareUpgradeProposal {
    $typeUrl?: '/cosmos.upgrade.v1beta1.CancelSoftwareUpgradeProposal';
    title: string;
    description: string;
}
export interface CancelSoftwareUpgradeProposalProtoMsg {
    typeUrl: '/cosmos.upgrade.v1beta1.CancelSoftwareUpgradeProposal';
    value: Uint8Array;
}
/**
 * CancelSoftwareUpgradeProposal is a gov Content type for cancelling a software
 * upgrade.
 * Deprecated: This legacy proposal is deprecated in favor of Msg-based gov
 * proposals, see MsgCancelUpgrade.
 */
/** @deprecated */
export interface CancelSoftwareUpgradeProposalSDKType {
    $typeUrl?: '/cosmos.upgrade.v1beta1.CancelSoftwareUpgradeProposal';
    title: string;
    description: string;
}
/**
 * ModuleVersion specifies a module and its consensus version.
 *
 * Since: cosmos-sdk 0.43
 */
export interface ModuleVersion {
    /** name of the app module */
    name: string;
    /** consensus version of the app module */
    version: bigint;
}
export interface ModuleVersionProtoMsg {
    typeUrl: '/cosmos.upgrade.v1beta1.ModuleVersion';
    value: Uint8Array;
}
/**
 * ModuleVersion specifies a module and its consensus version.
 *
 * Since: cosmos-sdk 0.43
 */
export interface ModuleVersionSDKType {
    name: string;
    version: bigint;
}
export declare const Plan: {
    typeUrl: string;
    encode(message: Plan, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): Plan;
    fromJSON(object: any): Plan;
    toJSON(message: Plan): JsonSafe<Plan>;
    fromPartial(object: Partial<Plan>): Plan;
    fromProtoMsg(message: PlanProtoMsg): Plan;
    toProto(message: Plan): Uint8Array;
    toProtoMsg(message: Plan): PlanProtoMsg;
};
export declare const SoftwareUpgradeProposal: {
    typeUrl: string;
    encode(message: SoftwareUpgradeProposal, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): SoftwareUpgradeProposal;
    fromJSON(object: any): SoftwareUpgradeProposal;
    toJSON(message: SoftwareUpgradeProposal): JsonSafe<SoftwareUpgradeProposal>;
    fromPartial(object: Partial<SoftwareUpgradeProposal>): SoftwareUpgradeProposal;
    fromProtoMsg(message: SoftwareUpgradeProposalProtoMsg): SoftwareUpgradeProposal;
    toProto(message: SoftwareUpgradeProposal): Uint8Array;
    toProtoMsg(message: SoftwareUpgradeProposal): SoftwareUpgradeProposalProtoMsg;
};
export declare const CancelSoftwareUpgradeProposal: {
    typeUrl: string;
    encode(message: CancelSoftwareUpgradeProposal, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): CancelSoftwareUpgradeProposal;
    fromJSON(object: any): CancelSoftwareUpgradeProposal;
    toJSON(message: CancelSoftwareUpgradeProposal): JsonSafe<CancelSoftwareUpgradeProposal>;
    fromPartial(object: Partial<CancelSoftwareUpgradeProposal>): CancelSoftwareUpgradeProposal;
    fromProtoMsg(message: CancelSoftwareUpgradeProposalProtoMsg): CancelSoftwareUpgradeProposal;
    toProto(message: CancelSoftwareUpgradeProposal): Uint8Array;
    toProtoMsg(message: CancelSoftwareUpgradeProposal): CancelSoftwareUpgradeProposalProtoMsg;
};
export declare const ModuleVersion: {
    typeUrl: string;
    encode(message: ModuleVersion, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): ModuleVersion;
    fromJSON(object: any): ModuleVersion;
    toJSON(message: ModuleVersion): JsonSafe<ModuleVersion>;
    fromPartial(object: Partial<ModuleVersion>): ModuleVersion;
    fromProtoMsg(message: ModuleVersionProtoMsg): ModuleVersion;
    toProto(message: ModuleVersion): Uint8Array;
    toProtoMsg(message: ModuleVersion): ModuleVersionProtoMsg;
};
