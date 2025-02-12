import { Counterparty, type CounterpartySDKType, Version, type VersionSDKType } from './connection.js';
import { Any, type AnySDKType } from '../../../../google/protobuf/any.js';
import { Height, type HeightSDKType } from '../../client/v1/client.js';
import { BinaryReader, BinaryWriter } from '../../../../binary.js';
import { type JsonSafe } from '../../../../json-safe.js';
/**
 * MsgConnectionOpenInit defines the msg sent by an account on Chain A to
 * initialize a connection with Chain B.
 */
export interface MsgConnectionOpenInit {
    clientId: string;
    counterparty: Counterparty;
    version?: Version;
    delayPeriod: bigint;
    signer: string;
}
export interface MsgConnectionOpenInitProtoMsg {
    typeUrl: '/ibc.core.connection.v1.MsgConnectionOpenInit';
    value: Uint8Array;
}
/**
 * MsgConnectionOpenInit defines the msg sent by an account on Chain A to
 * initialize a connection with Chain B.
 */
export interface MsgConnectionOpenInitSDKType {
    client_id: string;
    counterparty: CounterpartySDKType;
    version?: VersionSDKType;
    delay_period: bigint;
    signer: string;
}
/**
 * MsgConnectionOpenInitResponse defines the Msg/ConnectionOpenInit response
 * type.
 */
export interface MsgConnectionOpenInitResponse {
}
export interface MsgConnectionOpenInitResponseProtoMsg {
    typeUrl: '/ibc.core.connection.v1.MsgConnectionOpenInitResponse';
    value: Uint8Array;
}
/**
 * MsgConnectionOpenInitResponse defines the Msg/ConnectionOpenInit response
 * type.
 */
export interface MsgConnectionOpenInitResponseSDKType {
}
/**
 * MsgConnectionOpenTry defines a msg sent by a Relayer to try to open a
 * connection on Chain B.
 */
export interface MsgConnectionOpenTry {
    clientId: string;
    /** Deprecated: this field is unused. Crossing hellos are no longer supported in core IBC. */
    /** @deprecated */
    previousConnectionId: string;
    clientState?: Any;
    counterparty: Counterparty;
    delayPeriod: bigint;
    counterpartyVersions: Version[];
    proofHeight: Height;
    /**
     * proof of the initialization the connection on Chain A: `UNITIALIZED ->
     * INIT`
     */
    proofInit: Uint8Array;
    /** proof of client state included in message */
    proofClient: Uint8Array;
    /** proof of client consensus state */
    proofConsensus: Uint8Array;
    consensusHeight: Height;
    signer: string;
}
export interface MsgConnectionOpenTryProtoMsg {
    typeUrl: '/ibc.core.connection.v1.MsgConnectionOpenTry';
    value: Uint8Array;
}
/**
 * MsgConnectionOpenTry defines a msg sent by a Relayer to try to open a
 * connection on Chain B.
 */
export interface MsgConnectionOpenTrySDKType {
    client_id: string;
    /** @deprecated */
    previous_connection_id: string;
    client_state?: AnySDKType;
    counterparty: CounterpartySDKType;
    delay_period: bigint;
    counterparty_versions: VersionSDKType[];
    proof_height: HeightSDKType;
    proof_init: Uint8Array;
    proof_client: Uint8Array;
    proof_consensus: Uint8Array;
    consensus_height: HeightSDKType;
    signer: string;
}
/** MsgConnectionOpenTryResponse defines the Msg/ConnectionOpenTry response type. */
export interface MsgConnectionOpenTryResponse {
}
export interface MsgConnectionOpenTryResponseProtoMsg {
    typeUrl: '/ibc.core.connection.v1.MsgConnectionOpenTryResponse';
    value: Uint8Array;
}
/** MsgConnectionOpenTryResponse defines the Msg/ConnectionOpenTry response type. */
export interface MsgConnectionOpenTryResponseSDKType {
}
/**
 * MsgConnectionOpenAck defines a msg sent by a Relayer to Chain A to
 * acknowledge the change of connection state to TRYOPEN on Chain B.
 */
export interface MsgConnectionOpenAck {
    connectionId: string;
    counterpartyConnectionId: string;
    version?: Version;
    clientState?: Any;
    proofHeight: Height;
    /**
     * proof of the initialization the connection on Chain B: `UNITIALIZED ->
     * TRYOPEN`
     */
    proofTry: Uint8Array;
    /** proof of client state included in message */
    proofClient: Uint8Array;
    /** proof of client consensus state */
    proofConsensus: Uint8Array;
    consensusHeight: Height;
    signer: string;
}
export interface MsgConnectionOpenAckProtoMsg {
    typeUrl: '/ibc.core.connection.v1.MsgConnectionOpenAck';
    value: Uint8Array;
}
/**
 * MsgConnectionOpenAck defines a msg sent by a Relayer to Chain A to
 * acknowledge the change of connection state to TRYOPEN on Chain B.
 */
export interface MsgConnectionOpenAckSDKType {
    connection_id: string;
    counterparty_connection_id: string;
    version?: VersionSDKType;
    client_state?: AnySDKType;
    proof_height: HeightSDKType;
    proof_try: Uint8Array;
    proof_client: Uint8Array;
    proof_consensus: Uint8Array;
    consensus_height: HeightSDKType;
    signer: string;
}
/** MsgConnectionOpenAckResponse defines the Msg/ConnectionOpenAck response type. */
export interface MsgConnectionOpenAckResponse {
}
export interface MsgConnectionOpenAckResponseProtoMsg {
    typeUrl: '/ibc.core.connection.v1.MsgConnectionOpenAckResponse';
    value: Uint8Array;
}
/** MsgConnectionOpenAckResponse defines the Msg/ConnectionOpenAck response type. */
export interface MsgConnectionOpenAckResponseSDKType {
}
/**
 * MsgConnectionOpenConfirm defines a msg sent by a Relayer to Chain B to
 * acknowledge the change of connection state to OPEN on Chain A.
 */
export interface MsgConnectionOpenConfirm {
    connectionId: string;
    /** proof for the change of the connection state on Chain A: `INIT -> OPEN` */
    proofAck: Uint8Array;
    proofHeight: Height;
    signer: string;
}
export interface MsgConnectionOpenConfirmProtoMsg {
    typeUrl: '/ibc.core.connection.v1.MsgConnectionOpenConfirm';
    value: Uint8Array;
}
/**
 * MsgConnectionOpenConfirm defines a msg sent by a Relayer to Chain B to
 * acknowledge the change of connection state to OPEN on Chain A.
 */
export interface MsgConnectionOpenConfirmSDKType {
    connection_id: string;
    proof_ack: Uint8Array;
    proof_height: HeightSDKType;
    signer: string;
}
/**
 * MsgConnectionOpenConfirmResponse defines the Msg/ConnectionOpenConfirm
 * response type.
 */
export interface MsgConnectionOpenConfirmResponse {
}
export interface MsgConnectionOpenConfirmResponseProtoMsg {
    typeUrl: '/ibc.core.connection.v1.MsgConnectionOpenConfirmResponse';
    value: Uint8Array;
}
/**
 * MsgConnectionOpenConfirmResponse defines the Msg/ConnectionOpenConfirm
 * response type.
 */
export interface MsgConnectionOpenConfirmResponseSDKType {
}
export declare const MsgConnectionOpenInit: {
    typeUrl: string;
    encode(message: MsgConnectionOpenInit, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgConnectionOpenInit;
    fromJSON(object: any): MsgConnectionOpenInit;
    toJSON(message: MsgConnectionOpenInit): JsonSafe<MsgConnectionOpenInit>;
    fromPartial(object: Partial<MsgConnectionOpenInit>): MsgConnectionOpenInit;
    fromProtoMsg(message: MsgConnectionOpenInitProtoMsg): MsgConnectionOpenInit;
    toProto(message: MsgConnectionOpenInit): Uint8Array;
    toProtoMsg(message: MsgConnectionOpenInit): MsgConnectionOpenInitProtoMsg;
};
export declare const MsgConnectionOpenInitResponse: {
    typeUrl: string;
    encode(_: MsgConnectionOpenInitResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgConnectionOpenInitResponse;
    fromJSON(_: any): MsgConnectionOpenInitResponse;
    toJSON(_: MsgConnectionOpenInitResponse): JsonSafe<MsgConnectionOpenInitResponse>;
    fromPartial(_: Partial<MsgConnectionOpenInitResponse>): MsgConnectionOpenInitResponse;
    fromProtoMsg(message: MsgConnectionOpenInitResponseProtoMsg): MsgConnectionOpenInitResponse;
    toProto(message: MsgConnectionOpenInitResponse): Uint8Array;
    toProtoMsg(message: MsgConnectionOpenInitResponse): MsgConnectionOpenInitResponseProtoMsg;
};
export declare const MsgConnectionOpenTry: {
    typeUrl: string;
    encode(message: MsgConnectionOpenTry, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgConnectionOpenTry;
    fromJSON(object: any): MsgConnectionOpenTry;
    toJSON(message: MsgConnectionOpenTry): JsonSafe<MsgConnectionOpenTry>;
    fromPartial(object: Partial<MsgConnectionOpenTry>): MsgConnectionOpenTry;
    fromProtoMsg(message: MsgConnectionOpenTryProtoMsg): MsgConnectionOpenTry;
    toProto(message: MsgConnectionOpenTry): Uint8Array;
    toProtoMsg(message: MsgConnectionOpenTry): MsgConnectionOpenTryProtoMsg;
};
export declare const MsgConnectionOpenTryResponse: {
    typeUrl: string;
    encode(_: MsgConnectionOpenTryResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgConnectionOpenTryResponse;
    fromJSON(_: any): MsgConnectionOpenTryResponse;
    toJSON(_: MsgConnectionOpenTryResponse): JsonSafe<MsgConnectionOpenTryResponse>;
    fromPartial(_: Partial<MsgConnectionOpenTryResponse>): MsgConnectionOpenTryResponse;
    fromProtoMsg(message: MsgConnectionOpenTryResponseProtoMsg): MsgConnectionOpenTryResponse;
    toProto(message: MsgConnectionOpenTryResponse): Uint8Array;
    toProtoMsg(message: MsgConnectionOpenTryResponse): MsgConnectionOpenTryResponseProtoMsg;
};
export declare const MsgConnectionOpenAck: {
    typeUrl: string;
    encode(message: MsgConnectionOpenAck, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgConnectionOpenAck;
    fromJSON(object: any): MsgConnectionOpenAck;
    toJSON(message: MsgConnectionOpenAck): JsonSafe<MsgConnectionOpenAck>;
    fromPartial(object: Partial<MsgConnectionOpenAck>): MsgConnectionOpenAck;
    fromProtoMsg(message: MsgConnectionOpenAckProtoMsg): MsgConnectionOpenAck;
    toProto(message: MsgConnectionOpenAck): Uint8Array;
    toProtoMsg(message: MsgConnectionOpenAck): MsgConnectionOpenAckProtoMsg;
};
export declare const MsgConnectionOpenAckResponse: {
    typeUrl: string;
    encode(_: MsgConnectionOpenAckResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgConnectionOpenAckResponse;
    fromJSON(_: any): MsgConnectionOpenAckResponse;
    toJSON(_: MsgConnectionOpenAckResponse): JsonSafe<MsgConnectionOpenAckResponse>;
    fromPartial(_: Partial<MsgConnectionOpenAckResponse>): MsgConnectionOpenAckResponse;
    fromProtoMsg(message: MsgConnectionOpenAckResponseProtoMsg): MsgConnectionOpenAckResponse;
    toProto(message: MsgConnectionOpenAckResponse): Uint8Array;
    toProtoMsg(message: MsgConnectionOpenAckResponse): MsgConnectionOpenAckResponseProtoMsg;
};
export declare const MsgConnectionOpenConfirm: {
    typeUrl: string;
    encode(message: MsgConnectionOpenConfirm, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgConnectionOpenConfirm;
    fromJSON(object: any): MsgConnectionOpenConfirm;
    toJSON(message: MsgConnectionOpenConfirm): JsonSafe<MsgConnectionOpenConfirm>;
    fromPartial(object: Partial<MsgConnectionOpenConfirm>): MsgConnectionOpenConfirm;
    fromProtoMsg(message: MsgConnectionOpenConfirmProtoMsg): MsgConnectionOpenConfirm;
    toProto(message: MsgConnectionOpenConfirm): Uint8Array;
    toProtoMsg(message: MsgConnectionOpenConfirm): MsgConnectionOpenConfirmProtoMsg;
};
export declare const MsgConnectionOpenConfirmResponse: {
    typeUrl: string;
    encode(_: MsgConnectionOpenConfirmResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgConnectionOpenConfirmResponse;
    fromJSON(_: any): MsgConnectionOpenConfirmResponse;
    toJSON(_: MsgConnectionOpenConfirmResponse): JsonSafe<MsgConnectionOpenConfirmResponse>;
    fromPartial(_: Partial<MsgConnectionOpenConfirmResponse>): MsgConnectionOpenConfirmResponse;
    fromProtoMsg(message: MsgConnectionOpenConfirmResponseProtoMsg): MsgConnectionOpenConfirmResponse;
    toProto(message: MsgConnectionOpenConfirmResponse): Uint8Array;
    toProtoMsg(message: MsgConnectionOpenConfirmResponse): MsgConnectionOpenConfirmResponseProtoMsg;
};
