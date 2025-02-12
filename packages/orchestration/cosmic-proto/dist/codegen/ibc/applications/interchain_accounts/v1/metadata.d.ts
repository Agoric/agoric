import { BinaryReader, BinaryWriter } from '../../../../binary.js';
import { type JsonSafe } from '../../../../json-safe.js';
/**
 * Metadata defines a set of protocol specific data encoded into the ICS27 channel version bytestring
 * See ICS004: https://github.com/cosmos/ibc/tree/master/spec/core/ics-004-channel-and-packet-semantics#Versioning
 */
export interface Metadata {
    /** version defines the ICS27 protocol version */
    version: string;
    /** controller_connection_id is the connection identifier associated with the controller chain */
    controllerConnectionId: string;
    /** host_connection_id is the connection identifier associated with the host chain */
    hostConnectionId: string;
    /**
     * address defines the interchain account address to be fulfilled upon the OnChanOpenTry handshake step
     * NOTE: the address field is empty on the OnChanOpenInit handshake step
     */
    address: string;
    /** encoding defines the supported codec format */
    encoding: string;
    /** tx_type defines the type of transactions the interchain account can execute */
    txType: string;
}
export interface MetadataProtoMsg {
    typeUrl: '/ibc.applications.interchain_accounts.v1.Metadata';
    value: Uint8Array;
}
/**
 * Metadata defines a set of protocol specific data encoded into the ICS27 channel version bytestring
 * See ICS004: https://github.com/cosmos/ibc/tree/master/spec/core/ics-004-channel-and-packet-semantics#Versioning
 */
export interface MetadataSDKType {
    version: string;
    controller_connection_id: string;
    host_connection_id: string;
    address: string;
    encoding: string;
    tx_type: string;
}
export declare const Metadata: {
    typeUrl: string;
    encode(message: Metadata, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): Metadata;
    fromJSON(object: any): Metadata;
    toJSON(message: Metadata): JsonSafe<Metadata>;
    fromPartial(object: Partial<Metadata>): Metadata;
    fromProtoMsg(message: MetadataProtoMsg): Metadata;
    toProto(message: Metadata): Uint8Array;
    toProtoMsg(message: Metadata): MetadataProtoMsg;
};
