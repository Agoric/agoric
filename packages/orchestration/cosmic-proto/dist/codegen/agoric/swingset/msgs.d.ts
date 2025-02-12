import { BinaryReader, BinaryWriter } from '../../binary.js';
import { type JsonSafe } from '../../json-safe.js';
/** MsgDeliverInbound defines an SDK message for delivering an eventual send */
export interface MsgDeliverInbound {
    messages: string[];
    nums: bigint[];
    ack: bigint;
    submitter: Uint8Array;
}
export interface MsgDeliverInboundProtoMsg {
    typeUrl: '/agoric.swingset.MsgDeliverInbound';
    value: Uint8Array;
}
/** MsgDeliverInbound defines an SDK message for delivering an eventual send */
export interface MsgDeliverInboundSDKType {
    messages: string[];
    nums: bigint[];
    ack: bigint;
    submitter: Uint8Array;
}
/** MsgDeliverInboundResponse is an empty reply. */
export interface MsgDeliverInboundResponse {
}
export interface MsgDeliverInboundResponseProtoMsg {
    typeUrl: '/agoric.swingset.MsgDeliverInboundResponse';
    value: Uint8Array;
}
/** MsgDeliverInboundResponse is an empty reply. */
export interface MsgDeliverInboundResponseSDKType {
}
/**
 * MsgWalletAction defines an SDK message for the on-chain wallet to perform an
 * action that *does not* spend any assets (other than gas fees/stamps).  This
 * message type is typically protected by feegrant budgets.
 */
export interface MsgWalletAction {
    owner: Uint8Array;
    /** The action to perform, as JSON-stringified marshalled data. */
    action: string;
}
export interface MsgWalletActionProtoMsg {
    typeUrl: '/agoric.swingset.MsgWalletAction';
    value: Uint8Array;
}
/**
 * MsgWalletAction defines an SDK message for the on-chain wallet to perform an
 * action that *does not* spend any assets (other than gas fees/stamps).  This
 * message type is typically protected by feegrant budgets.
 */
export interface MsgWalletActionSDKType {
    owner: Uint8Array;
    action: string;
}
/** MsgWalletActionResponse is an empty reply. */
export interface MsgWalletActionResponse {
}
export interface MsgWalletActionResponseProtoMsg {
    typeUrl: '/agoric.swingset.MsgWalletActionResponse';
    value: Uint8Array;
}
/** MsgWalletActionResponse is an empty reply. */
export interface MsgWalletActionResponseSDKType {
}
/**
 * MsgWalletSpendAction defines an SDK message for the on-chain wallet to
 * perform an action that *does spend the owner's assets.*  This message type is
 * typically protected by explicit confirmation by the user.
 */
export interface MsgWalletSpendAction {
    owner: Uint8Array;
    /** The action to perform, as JSON-stringified marshalled data. */
    spendAction: string;
}
export interface MsgWalletSpendActionProtoMsg {
    typeUrl: '/agoric.swingset.MsgWalletSpendAction';
    value: Uint8Array;
}
/**
 * MsgWalletSpendAction defines an SDK message for the on-chain wallet to
 * perform an action that *does spend the owner's assets.*  This message type is
 * typically protected by explicit confirmation by the user.
 */
export interface MsgWalletSpendActionSDKType {
    owner: Uint8Array;
    spend_action: string;
}
/** MsgWalletSpendActionResponse is an empty reply. */
export interface MsgWalletSpendActionResponse {
}
export interface MsgWalletSpendActionResponseProtoMsg {
    typeUrl: '/agoric.swingset.MsgWalletSpendActionResponse';
    value: Uint8Array;
}
/** MsgWalletSpendActionResponse is an empty reply. */
export interface MsgWalletSpendActionResponseSDKType {
}
/** MsgProvision defines an SDK message for provisioning a client to the chain */
export interface MsgProvision {
    nickname: string;
    address: Uint8Array;
    powerFlags: string[];
    submitter: Uint8Array;
}
export interface MsgProvisionProtoMsg {
    typeUrl: '/agoric.swingset.MsgProvision';
    value: Uint8Array;
}
/** MsgProvision defines an SDK message for provisioning a client to the chain */
export interface MsgProvisionSDKType {
    nickname: string;
    address: Uint8Array;
    power_flags: string[];
    submitter: Uint8Array;
}
/** MsgProvisionResponse is an empty reply. */
export interface MsgProvisionResponse {
}
export interface MsgProvisionResponseProtoMsg {
    typeUrl: '/agoric.swingset.MsgProvisionResponse';
    value: Uint8Array;
}
/** MsgProvisionResponse is an empty reply. */
export interface MsgProvisionResponseSDKType {
}
/** MsgInstallBundle carries a signed bundle to SwingSet. */
export interface MsgInstallBundle {
    bundle: string;
    submitter: Uint8Array;
    /**
     * Either bundle or compressed_bundle will be set.
     * Default compression algorithm is gzip.
     */
    compressedBundle: Uint8Array;
    /** Size in bytes of uncompression of compressed_bundle. */
    uncompressedSize: bigint;
}
export interface MsgInstallBundleProtoMsg {
    typeUrl: '/agoric.swingset.MsgInstallBundle';
    value: Uint8Array;
}
/** MsgInstallBundle carries a signed bundle to SwingSet. */
export interface MsgInstallBundleSDKType {
    bundle: string;
    submitter: Uint8Array;
    compressed_bundle: Uint8Array;
    uncompressed_size: bigint;
}
/**
 * MsgInstallBundleResponse is an empty acknowledgement that an install bundle
 * message has been queued for the SwingSet kernel's consideration.
 */
export interface MsgInstallBundleResponse {
}
export interface MsgInstallBundleResponseProtoMsg {
    typeUrl: '/agoric.swingset.MsgInstallBundleResponse';
    value: Uint8Array;
}
/**
 * MsgInstallBundleResponse is an empty acknowledgement that an install bundle
 * message has been queued for the SwingSet kernel's consideration.
 */
export interface MsgInstallBundleResponseSDKType {
}
export declare const MsgDeliverInbound: {
    typeUrl: string;
    encode(message: MsgDeliverInbound, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgDeliverInbound;
    fromJSON(object: any): MsgDeliverInbound;
    toJSON(message: MsgDeliverInbound): JsonSafe<MsgDeliverInbound>;
    fromPartial(object: Partial<MsgDeliverInbound>): MsgDeliverInbound;
    fromProtoMsg(message: MsgDeliverInboundProtoMsg): MsgDeliverInbound;
    toProto(message: MsgDeliverInbound): Uint8Array;
    toProtoMsg(message: MsgDeliverInbound): MsgDeliverInboundProtoMsg;
};
export declare const MsgDeliverInboundResponse: {
    typeUrl: string;
    encode(_: MsgDeliverInboundResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgDeliverInboundResponse;
    fromJSON(_: any): MsgDeliverInboundResponse;
    toJSON(_: MsgDeliverInboundResponse): JsonSafe<MsgDeliverInboundResponse>;
    fromPartial(_: Partial<MsgDeliverInboundResponse>): MsgDeliverInboundResponse;
    fromProtoMsg(message: MsgDeliverInboundResponseProtoMsg): MsgDeliverInboundResponse;
    toProto(message: MsgDeliverInboundResponse): Uint8Array;
    toProtoMsg(message: MsgDeliverInboundResponse): MsgDeliverInboundResponseProtoMsg;
};
export declare const MsgWalletAction: {
    typeUrl: string;
    encode(message: MsgWalletAction, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgWalletAction;
    fromJSON(object: any): MsgWalletAction;
    toJSON(message: MsgWalletAction): JsonSafe<MsgWalletAction>;
    fromPartial(object: Partial<MsgWalletAction>): MsgWalletAction;
    fromProtoMsg(message: MsgWalletActionProtoMsg): MsgWalletAction;
    toProto(message: MsgWalletAction): Uint8Array;
    toProtoMsg(message: MsgWalletAction): MsgWalletActionProtoMsg;
};
export declare const MsgWalletActionResponse: {
    typeUrl: string;
    encode(_: MsgWalletActionResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgWalletActionResponse;
    fromJSON(_: any): MsgWalletActionResponse;
    toJSON(_: MsgWalletActionResponse): JsonSafe<MsgWalletActionResponse>;
    fromPartial(_: Partial<MsgWalletActionResponse>): MsgWalletActionResponse;
    fromProtoMsg(message: MsgWalletActionResponseProtoMsg): MsgWalletActionResponse;
    toProto(message: MsgWalletActionResponse): Uint8Array;
    toProtoMsg(message: MsgWalletActionResponse): MsgWalletActionResponseProtoMsg;
};
export declare const MsgWalletSpendAction: {
    typeUrl: string;
    encode(message: MsgWalletSpendAction, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgWalletSpendAction;
    fromJSON(object: any): MsgWalletSpendAction;
    toJSON(message: MsgWalletSpendAction): JsonSafe<MsgWalletSpendAction>;
    fromPartial(object: Partial<MsgWalletSpendAction>): MsgWalletSpendAction;
    fromProtoMsg(message: MsgWalletSpendActionProtoMsg): MsgWalletSpendAction;
    toProto(message: MsgWalletSpendAction): Uint8Array;
    toProtoMsg(message: MsgWalletSpendAction): MsgWalletSpendActionProtoMsg;
};
export declare const MsgWalletSpendActionResponse: {
    typeUrl: string;
    encode(_: MsgWalletSpendActionResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgWalletSpendActionResponse;
    fromJSON(_: any): MsgWalletSpendActionResponse;
    toJSON(_: MsgWalletSpendActionResponse): JsonSafe<MsgWalletSpendActionResponse>;
    fromPartial(_: Partial<MsgWalletSpendActionResponse>): MsgWalletSpendActionResponse;
    fromProtoMsg(message: MsgWalletSpendActionResponseProtoMsg): MsgWalletSpendActionResponse;
    toProto(message: MsgWalletSpendActionResponse): Uint8Array;
    toProtoMsg(message: MsgWalletSpendActionResponse): MsgWalletSpendActionResponseProtoMsg;
};
export declare const MsgProvision: {
    typeUrl: string;
    encode(message: MsgProvision, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgProvision;
    fromJSON(object: any): MsgProvision;
    toJSON(message: MsgProvision): JsonSafe<MsgProvision>;
    fromPartial(object: Partial<MsgProvision>): MsgProvision;
    fromProtoMsg(message: MsgProvisionProtoMsg): MsgProvision;
    toProto(message: MsgProvision): Uint8Array;
    toProtoMsg(message: MsgProvision): MsgProvisionProtoMsg;
};
export declare const MsgProvisionResponse: {
    typeUrl: string;
    encode(_: MsgProvisionResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgProvisionResponse;
    fromJSON(_: any): MsgProvisionResponse;
    toJSON(_: MsgProvisionResponse): JsonSafe<MsgProvisionResponse>;
    fromPartial(_: Partial<MsgProvisionResponse>): MsgProvisionResponse;
    fromProtoMsg(message: MsgProvisionResponseProtoMsg): MsgProvisionResponse;
    toProto(message: MsgProvisionResponse): Uint8Array;
    toProtoMsg(message: MsgProvisionResponse): MsgProvisionResponseProtoMsg;
};
export declare const MsgInstallBundle: {
    typeUrl: string;
    encode(message: MsgInstallBundle, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgInstallBundle;
    fromJSON(object: any): MsgInstallBundle;
    toJSON(message: MsgInstallBundle): JsonSafe<MsgInstallBundle>;
    fromPartial(object: Partial<MsgInstallBundle>): MsgInstallBundle;
    fromProtoMsg(message: MsgInstallBundleProtoMsg): MsgInstallBundle;
    toProto(message: MsgInstallBundle): Uint8Array;
    toProtoMsg(message: MsgInstallBundle): MsgInstallBundleProtoMsg;
};
export declare const MsgInstallBundleResponse: {
    typeUrl: string;
    encode(_: MsgInstallBundleResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgInstallBundleResponse;
    fromJSON(_: any): MsgInstallBundleResponse;
    toJSON(_: MsgInstallBundleResponse): JsonSafe<MsgInstallBundleResponse>;
    fromPartial(_: Partial<MsgInstallBundleResponse>): MsgInstallBundleResponse;
    fromProtoMsg(message: MsgInstallBundleResponseProtoMsg): MsgInstallBundleResponse;
    toProto(message: MsgInstallBundleResponse): Uint8Array;
    toProtoMsg(message: MsgInstallBundleResponse): MsgInstallBundleResponseProtoMsg;
};
