import { Any, type AnySDKType } from '../../../../google/protobuf/any.js';
import { BinaryReader, BinaryWriter } from '../../../../binary.js';
import { type JsonSafe } from '../../../../json-safe.js';
/** MsgCreateClient defines a message to create an IBC client */
export interface MsgCreateClient {
    /** light client state */
    clientState?: Any;
    /**
     * consensus state associated with the client that corresponds to a given
     * height.
     */
    consensusState?: Any;
    /** signer address */
    signer: string;
}
export interface MsgCreateClientProtoMsg {
    typeUrl: '/ibc.core.client.v1.MsgCreateClient';
    value: Uint8Array;
}
/** MsgCreateClient defines a message to create an IBC client */
export interface MsgCreateClientSDKType {
    client_state?: AnySDKType;
    consensus_state?: AnySDKType;
    signer: string;
}
/** MsgCreateClientResponse defines the Msg/CreateClient response type. */
export interface MsgCreateClientResponse {
}
export interface MsgCreateClientResponseProtoMsg {
    typeUrl: '/ibc.core.client.v1.MsgCreateClientResponse';
    value: Uint8Array;
}
/** MsgCreateClientResponse defines the Msg/CreateClient response type. */
export interface MsgCreateClientResponseSDKType {
}
/**
 * MsgUpdateClient defines an sdk.Msg to update a IBC client state using
 * the given header.
 */
export interface MsgUpdateClient {
    /** client unique identifier */
    clientId: string;
    /** header to update the light client */
    header?: Any;
    /** signer address */
    signer: string;
}
export interface MsgUpdateClientProtoMsg {
    typeUrl: '/ibc.core.client.v1.MsgUpdateClient';
    value: Uint8Array;
}
/**
 * MsgUpdateClient defines an sdk.Msg to update a IBC client state using
 * the given header.
 */
export interface MsgUpdateClientSDKType {
    client_id: string;
    header?: AnySDKType;
    signer: string;
}
/** MsgUpdateClientResponse defines the Msg/UpdateClient response type. */
export interface MsgUpdateClientResponse {
}
export interface MsgUpdateClientResponseProtoMsg {
    typeUrl: '/ibc.core.client.v1.MsgUpdateClientResponse';
    value: Uint8Array;
}
/** MsgUpdateClientResponse defines the Msg/UpdateClient response type. */
export interface MsgUpdateClientResponseSDKType {
}
/**
 * MsgUpgradeClient defines an sdk.Msg to upgrade an IBC client to a new client
 * state
 */
export interface MsgUpgradeClient {
    /** client unique identifier */
    clientId: string;
    /** upgraded client state */
    clientState?: Any;
    /**
     * upgraded consensus state, only contains enough information to serve as a
     * basis of trust in update logic
     */
    consensusState?: Any;
    /** proof that old chain committed to new client */
    proofUpgradeClient: Uint8Array;
    /** proof that old chain committed to new consensus state */
    proofUpgradeConsensusState: Uint8Array;
    /** signer address */
    signer: string;
}
export interface MsgUpgradeClientProtoMsg {
    typeUrl: '/ibc.core.client.v1.MsgUpgradeClient';
    value: Uint8Array;
}
/**
 * MsgUpgradeClient defines an sdk.Msg to upgrade an IBC client to a new client
 * state
 */
export interface MsgUpgradeClientSDKType {
    client_id: string;
    client_state?: AnySDKType;
    consensus_state?: AnySDKType;
    proof_upgrade_client: Uint8Array;
    proof_upgrade_consensus_state: Uint8Array;
    signer: string;
}
/** MsgUpgradeClientResponse defines the Msg/UpgradeClient response type. */
export interface MsgUpgradeClientResponse {
}
export interface MsgUpgradeClientResponseProtoMsg {
    typeUrl: '/ibc.core.client.v1.MsgUpgradeClientResponse';
    value: Uint8Array;
}
/** MsgUpgradeClientResponse defines the Msg/UpgradeClient response type. */
export interface MsgUpgradeClientResponseSDKType {
}
/**
 * MsgSubmitMisbehaviour defines an sdk.Msg type that submits Evidence for
 * light client misbehaviour.
 */
export interface MsgSubmitMisbehaviour {
    /** client unique identifier */
    clientId: string;
    /** misbehaviour used for freezing the light client */
    misbehaviour?: Any;
    /** signer address */
    signer: string;
}
export interface MsgSubmitMisbehaviourProtoMsg {
    typeUrl: '/ibc.core.client.v1.MsgSubmitMisbehaviour';
    value: Uint8Array;
}
/**
 * MsgSubmitMisbehaviour defines an sdk.Msg type that submits Evidence for
 * light client misbehaviour.
 */
export interface MsgSubmitMisbehaviourSDKType {
    client_id: string;
    misbehaviour?: AnySDKType;
    signer: string;
}
/**
 * MsgSubmitMisbehaviourResponse defines the Msg/SubmitMisbehaviour response
 * type.
 */
export interface MsgSubmitMisbehaviourResponse {
}
export interface MsgSubmitMisbehaviourResponseProtoMsg {
    typeUrl: '/ibc.core.client.v1.MsgSubmitMisbehaviourResponse';
    value: Uint8Array;
}
/**
 * MsgSubmitMisbehaviourResponse defines the Msg/SubmitMisbehaviour response
 * type.
 */
export interface MsgSubmitMisbehaviourResponseSDKType {
}
export declare const MsgCreateClient: {
    typeUrl: string;
    encode(message: MsgCreateClient, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgCreateClient;
    fromJSON(object: any): MsgCreateClient;
    toJSON(message: MsgCreateClient): JsonSafe<MsgCreateClient>;
    fromPartial(object: Partial<MsgCreateClient>): MsgCreateClient;
    fromProtoMsg(message: MsgCreateClientProtoMsg): MsgCreateClient;
    toProto(message: MsgCreateClient): Uint8Array;
    toProtoMsg(message: MsgCreateClient): MsgCreateClientProtoMsg;
};
export declare const MsgCreateClientResponse: {
    typeUrl: string;
    encode(_: MsgCreateClientResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgCreateClientResponse;
    fromJSON(_: any): MsgCreateClientResponse;
    toJSON(_: MsgCreateClientResponse): JsonSafe<MsgCreateClientResponse>;
    fromPartial(_: Partial<MsgCreateClientResponse>): MsgCreateClientResponse;
    fromProtoMsg(message: MsgCreateClientResponseProtoMsg): MsgCreateClientResponse;
    toProto(message: MsgCreateClientResponse): Uint8Array;
    toProtoMsg(message: MsgCreateClientResponse): MsgCreateClientResponseProtoMsg;
};
export declare const MsgUpdateClient: {
    typeUrl: string;
    encode(message: MsgUpdateClient, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgUpdateClient;
    fromJSON(object: any): MsgUpdateClient;
    toJSON(message: MsgUpdateClient): JsonSafe<MsgUpdateClient>;
    fromPartial(object: Partial<MsgUpdateClient>): MsgUpdateClient;
    fromProtoMsg(message: MsgUpdateClientProtoMsg): MsgUpdateClient;
    toProto(message: MsgUpdateClient): Uint8Array;
    toProtoMsg(message: MsgUpdateClient): MsgUpdateClientProtoMsg;
};
export declare const MsgUpdateClientResponse: {
    typeUrl: string;
    encode(_: MsgUpdateClientResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgUpdateClientResponse;
    fromJSON(_: any): MsgUpdateClientResponse;
    toJSON(_: MsgUpdateClientResponse): JsonSafe<MsgUpdateClientResponse>;
    fromPartial(_: Partial<MsgUpdateClientResponse>): MsgUpdateClientResponse;
    fromProtoMsg(message: MsgUpdateClientResponseProtoMsg): MsgUpdateClientResponse;
    toProto(message: MsgUpdateClientResponse): Uint8Array;
    toProtoMsg(message: MsgUpdateClientResponse): MsgUpdateClientResponseProtoMsg;
};
export declare const MsgUpgradeClient: {
    typeUrl: string;
    encode(message: MsgUpgradeClient, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgUpgradeClient;
    fromJSON(object: any): MsgUpgradeClient;
    toJSON(message: MsgUpgradeClient): JsonSafe<MsgUpgradeClient>;
    fromPartial(object: Partial<MsgUpgradeClient>): MsgUpgradeClient;
    fromProtoMsg(message: MsgUpgradeClientProtoMsg): MsgUpgradeClient;
    toProto(message: MsgUpgradeClient): Uint8Array;
    toProtoMsg(message: MsgUpgradeClient): MsgUpgradeClientProtoMsg;
};
export declare const MsgUpgradeClientResponse: {
    typeUrl: string;
    encode(_: MsgUpgradeClientResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgUpgradeClientResponse;
    fromJSON(_: any): MsgUpgradeClientResponse;
    toJSON(_: MsgUpgradeClientResponse): JsonSafe<MsgUpgradeClientResponse>;
    fromPartial(_: Partial<MsgUpgradeClientResponse>): MsgUpgradeClientResponse;
    fromProtoMsg(message: MsgUpgradeClientResponseProtoMsg): MsgUpgradeClientResponse;
    toProto(message: MsgUpgradeClientResponse): Uint8Array;
    toProtoMsg(message: MsgUpgradeClientResponse): MsgUpgradeClientResponseProtoMsg;
};
export declare const MsgSubmitMisbehaviour: {
    typeUrl: string;
    encode(message: MsgSubmitMisbehaviour, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgSubmitMisbehaviour;
    fromJSON(object: any): MsgSubmitMisbehaviour;
    toJSON(message: MsgSubmitMisbehaviour): JsonSafe<MsgSubmitMisbehaviour>;
    fromPartial(object: Partial<MsgSubmitMisbehaviour>): MsgSubmitMisbehaviour;
    fromProtoMsg(message: MsgSubmitMisbehaviourProtoMsg): MsgSubmitMisbehaviour;
    toProto(message: MsgSubmitMisbehaviour): Uint8Array;
    toProtoMsg(message: MsgSubmitMisbehaviour): MsgSubmitMisbehaviourProtoMsg;
};
export declare const MsgSubmitMisbehaviourResponse: {
    typeUrl: string;
    encode(_: MsgSubmitMisbehaviourResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgSubmitMisbehaviourResponse;
    fromJSON(_: any): MsgSubmitMisbehaviourResponse;
    toJSON(_: MsgSubmitMisbehaviourResponse): JsonSafe<MsgSubmitMisbehaviourResponse>;
    fromPartial(_: Partial<MsgSubmitMisbehaviourResponse>): MsgSubmitMisbehaviourResponse;
    fromProtoMsg(message: MsgSubmitMisbehaviourResponseProtoMsg): MsgSubmitMisbehaviourResponse;
    toProto(message: MsgSubmitMisbehaviourResponse): Uint8Array;
    toProtoMsg(message: MsgSubmitMisbehaviourResponse): MsgSubmitMisbehaviourResponseProtoMsg;
};
