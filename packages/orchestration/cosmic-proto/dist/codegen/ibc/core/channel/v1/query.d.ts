import { PageRequest, type PageRequestSDKType, PageResponse, type PageResponseSDKType } from '../../../../cosmos/base/query/v1beta1/pagination.js';
import { Channel, type ChannelSDKType, IdentifiedChannel, type IdentifiedChannelSDKType, PacketState, type PacketStateSDKType } from './channel.js';
import { Height, type HeightSDKType, IdentifiedClientState, type IdentifiedClientStateSDKType } from '../../client/v1/client.js';
import { Any, type AnySDKType } from '../../../../google/protobuf/any.js';
import { BinaryReader, BinaryWriter } from '../../../../binary.js';
import { type JsonSafe } from '../../../../json-safe.js';
/** QueryChannelRequest is the request type for the Query/Channel RPC method */
export interface QueryChannelRequest {
    /** port unique identifier */
    portId: string;
    /** channel unique identifier */
    channelId: string;
}
export interface QueryChannelRequestProtoMsg {
    typeUrl: '/ibc.core.channel.v1.QueryChannelRequest';
    value: Uint8Array;
}
/** QueryChannelRequest is the request type for the Query/Channel RPC method */
export interface QueryChannelRequestSDKType {
    port_id: string;
    channel_id: string;
}
/**
 * QueryChannelResponse is the response type for the Query/Channel RPC method.
 * Besides the Channel end, it includes a proof and the height from which the
 * proof was retrieved.
 */
export interface QueryChannelResponse {
    /** channel associated with the request identifiers */
    channel?: Channel;
    /** merkle proof of existence */
    proof: Uint8Array;
    /** height at which the proof was retrieved */
    proofHeight: Height;
}
export interface QueryChannelResponseProtoMsg {
    typeUrl: '/ibc.core.channel.v1.QueryChannelResponse';
    value: Uint8Array;
}
/**
 * QueryChannelResponse is the response type for the Query/Channel RPC method.
 * Besides the Channel end, it includes a proof and the height from which the
 * proof was retrieved.
 */
export interface QueryChannelResponseSDKType {
    channel?: ChannelSDKType;
    proof: Uint8Array;
    proof_height: HeightSDKType;
}
/** QueryChannelsRequest is the request type for the Query/Channels RPC method */
export interface QueryChannelsRequest {
    /** pagination request */
    pagination?: PageRequest;
}
export interface QueryChannelsRequestProtoMsg {
    typeUrl: '/ibc.core.channel.v1.QueryChannelsRequest';
    value: Uint8Array;
}
/** QueryChannelsRequest is the request type for the Query/Channels RPC method */
export interface QueryChannelsRequestSDKType {
    pagination?: PageRequestSDKType;
}
/** QueryChannelsResponse is the response type for the Query/Channels RPC method. */
export interface QueryChannelsResponse {
    /** list of stored channels of the chain. */
    channels: IdentifiedChannel[];
    /** pagination response */
    pagination?: PageResponse;
    /** query block height */
    height: Height;
}
export interface QueryChannelsResponseProtoMsg {
    typeUrl: '/ibc.core.channel.v1.QueryChannelsResponse';
    value: Uint8Array;
}
/** QueryChannelsResponse is the response type for the Query/Channels RPC method. */
export interface QueryChannelsResponseSDKType {
    channels: IdentifiedChannelSDKType[];
    pagination?: PageResponseSDKType;
    height: HeightSDKType;
}
/**
 * QueryConnectionChannelsRequest is the request type for the
 * Query/QueryConnectionChannels RPC method
 */
export interface QueryConnectionChannelsRequest {
    /** connection unique identifier */
    connection: string;
    /** pagination request */
    pagination?: PageRequest;
}
export interface QueryConnectionChannelsRequestProtoMsg {
    typeUrl: '/ibc.core.channel.v1.QueryConnectionChannelsRequest';
    value: Uint8Array;
}
/**
 * QueryConnectionChannelsRequest is the request type for the
 * Query/QueryConnectionChannels RPC method
 */
export interface QueryConnectionChannelsRequestSDKType {
    connection: string;
    pagination?: PageRequestSDKType;
}
/**
 * QueryConnectionChannelsResponse is the Response type for the
 * Query/QueryConnectionChannels RPC method
 */
export interface QueryConnectionChannelsResponse {
    /** list of channels associated with a connection. */
    channels: IdentifiedChannel[];
    /** pagination response */
    pagination?: PageResponse;
    /** query block height */
    height: Height;
}
export interface QueryConnectionChannelsResponseProtoMsg {
    typeUrl: '/ibc.core.channel.v1.QueryConnectionChannelsResponse';
    value: Uint8Array;
}
/**
 * QueryConnectionChannelsResponse is the Response type for the
 * Query/QueryConnectionChannels RPC method
 */
export interface QueryConnectionChannelsResponseSDKType {
    channels: IdentifiedChannelSDKType[];
    pagination?: PageResponseSDKType;
    height: HeightSDKType;
}
/**
 * QueryChannelClientStateRequest is the request type for the Query/ClientState
 * RPC method
 */
export interface QueryChannelClientStateRequest {
    /** port unique identifier */
    portId: string;
    /** channel unique identifier */
    channelId: string;
}
export interface QueryChannelClientStateRequestProtoMsg {
    typeUrl: '/ibc.core.channel.v1.QueryChannelClientStateRequest';
    value: Uint8Array;
}
/**
 * QueryChannelClientStateRequest is the request type for the Query/ClientState
 * RPC method
 */
export interface QueryChannelClientStateRequestSDKType {
    port_id: string;
    channel_id: string;
}
/**
 * QueryChannelClientStateResponse is the Response type for the
 * Query/QueryChannelClientState RPC method
 */
export interface QueryChannelClientStateResponse {
    /** client state associated with the channel */
    identifiedClientState?: IdentifiedClientState;
    /** merkle proof of existence */
    proof: Uint8Array;
    /** height at which the proof was retrieved */
    proofHeight: Height;
}
export interface QueryChannelClientStateResponseProtoMsg {
    typeUrl: '/ibc.core.channel.v1.QueryChannelClientStateResponse';
    value: Uint8Array;
}
/**
 * QueryChannelClientStateResponse is the Response type for the
 * Query/QueryChannelClientState RPC method
 */
export interface QueryChannelClientStateResponseSDKType {
    identified_client_state?: IdentifiedClientStateSDKType;
    proof: Uint8Array;
    proof_height: HeightSDKType;
}
/**
 * QueryChannelConsensusStateRequest is the request type for the
 * Query/ConsensusState RPC method
 */
export interface QueryChannelConsensusStateRequest {
    /** port unique identifier */
    portId: string;
    /** channel unique identifier */
    channelId: string;
    /** revision number of the consensus state */
    revisionNumber: bigint;
    /** revision height of the consensus state */
    revisionHeight: bigint;
}
export interface QueryChannelConsensusStateRequestProtoMsg {
    typeUrl: '/ibc.core.channel.v1.QueryChannelConsensusStateRequest';
    value: Uint8Array;
}
/**
 * QueryChannelConsensusStateRequest is the request type for the
 * Query/ConsensusState RPC method
 */
export interface QueryChannelConsensusStateRequestSDKType {
    port_id: string;
    channel_id: string;
    revision_number: bigint;
    revision_height: bigint;
}
/**
 * QueryChannelClientStateResponse is the Response type for the
 * Query/QueryChannelClientState RPC method
 */
export interface QueryChannelConsensusStateResponse {
    /** consensus state associated with the channel */
    consensusState?: Any;
    /** client ID associated with the consensus state */
    clientId: string;
    /** merkle proof of existence */
    proof: Uint8Array;
    /** height at which the proof was retrieved */
    proofHeight: Height;
}
export interface QueryChannelConsensusStateResponseProtoMsg {
    typeUrl: '/ibc.core.channel.v1.QueryChannelConsensusStateResponse';
    value: Uint8Array;
}
/**
 * QueryChannelClientStateResponse is the Response type for the
 * Query/QueryChannelClientState RPC method
 */
export interface QueryChannelConsensusStateResponseSDKType {
    consensus_state?: AnySDKType;
    client_id: string;
    proof: Uint8Array;
    proof_height: HeightSDKType;
}
/**
 * QueryPacketCommitmentRequest is the request type for the
 * Query/PacketCommitment RPC method
 */
export interface QueryPacketCommitmentRequest {
    /** port unique identifier */
    portId: string;
    /** channel unique identifier */
    channelId: string;
    /** packet sequence */
    sequence: bigint;
}
export interface QueryPacketCommitmentRequestProtoMsg {
    typeUrl: '/ibc.core.channel.v1.QueryPacketCommitmentRequest';
    value: Uint8Array;
}
/**
 * QueryPacketCommitmentRequest is the request type for the
 * Query/PacketCommitment RPC method
 */
export interface QueryPacketCommitmentRequestSDKType {
    port_id: string;
    channel_id: string;
    sequence: bigint;
}
/**
 * QueryPacketCommitmentResponse defines the client query response for a packet
 * which also includes a proof and the height from which the proof was
 * retrieved
 */
export interface QueryPacketCommitmentResponse {
    /** packet associated with the request fields */
    commitment: Uint8Array;
    /** merkle proof of existence */
    proof: Uint8Array;
    /** height at which the proof was retrieved */
    proofHeight: Height;
}
export interface QueryPacketCommitmentResponseProtoMsg {
    typeUrl: '/ibc.core.channel.v1.QueryPacketCommitmentResponse';
    value: Uint8Array;
}
/**
 * QueryPacketCommitmentResponse defines the client query response for a packet
 * which also includes a proof and the height from which the proof was
 * retrieved
 */
export interface QueryPacketCommitmentResponseSDKType {
    commitment: Uint8Array;
    proof: Uint8Array;
    proof_height: HeightSDKType;
}
/**
 * QueryPacketCommitmentsRequest is the request type for the
 * Query/QueryPacketCommitments RPC method
 */
export interface QueryPacketCommitmentsRequest {
    /** port unique identifier */
    portId: string;
    /** channel unique identifier */
    channelId: string;
    /** pagination request */
    pagination?: PageRequest;
}
export interface QueryPacketCommitmentsRequestProtoMsg {
    typeUrl: '/ibc.core.channel.v1.QueryPacketCommitmentsRequest';
    value: Uint8Array;
}
/**
 * QueryPacketCommitmentsRequest is the request type for the
 * Query/QueryPacketCommitments RPC method
 */
export interface QueryPacketCommitmentsRequestSDKType {
    port_id: string;
    channel_id: string;
    pagination?: PageRequestSDKType;
}
/**
 * QueryPacketCommitmentsResponse is the request type for the
 * Query/QueryPacketCommitments RPC method
 */
export interface QueryPacketCommitmentsResponse {
    commitments: PacketState[];
    /** pagination response */
    pagination?: PageResponse;
    /** query block height */
    height: Height;
}
export interface QueryPacketCommitmentsResponseProtoMsg {
    typeUrl: '/ibc.core.channel.v1.QueryPacketCommitmentsResponse';
    value: Uint8Array;
}
/**
 * QueryPacketCommitmentsResponse is the request type for the
 * Query/QueryPacketCommitments RPC method
 */
export interface QueryPacketCommitmentsResponseSDKType {
    commitments: PacketStateSDKType[];
    pagination?: PageResponseSDKType;
    height: HeightSDKType;
}
/**
 * QueryPacketReceiptRequest is the request type for the
 * Query/PacketReceipt RPC method
 */
export interface QueryPacketReceiptRequest {
    /** port unique identifier */
    portId: string;
    /** channel unique identifier */
    channelId: string;
    /** packet sequence */
    sequence: bigint;
}
export interface QueryPacketReceiptRequestProtoMsg {
    typeUrl: '/ibc.core.channel.v1.QueryPacketReceiptRequest';
    value: Uint8Array;
}
/**
 * QueryPacketReceiptRequest is the request type for the
 * Query/PacketReceipt RPC method
 */
export interface QueryPacketReceiptRequestSDKType {
    port_id: string;
    channel_id: string;
    sequence: bigint;
}
/**
 * QueryPacketReceiptResponse defines the client query response for a packet
 * receipt which also includes a proof, and the height from which the proof was
 * retrieved
 */
export interface QueryPacketReceiptResponse {
    /** success flag for if receipt exists */
    received: boolean;
    /** merkle proof of existence */
    proof: Uint8Array;
    /** height at which the proof was retrieved */
    proofHeight: Height;
}
export interface QueryPacketReceiptResponseProtoMsg {
    typeUrl: '/ibc.core.channel.v1.QueryPacketReceiptResponse';
    value: Uint8Array;
}
/**
 * QueryPacketReceiptResponse defines the client query response for a packet
 * receipt which also includes a proof, and the height from which the proof was
 * retrieved
 */
export interface QueryPacketReceiptResponseSDKType {
    received: boolean;
    proof: Uint8Array;
    proof_height: HeightSDKType;
}
/**
 * QueryPacketAcknowledgementRequest is the request type for the
 * Query/PacketAcknowledgement RPC method
 */
export interface QueryPacketAcknowledgementRequest {
    /** port unique identifier */
    portId: string;
    /** channel unique identifier */
    channelId: string;
    /** packet sequence */
    sequence: bigint;
}
export interface QueryPacketAcknowledgementRequestProtoMsg {
    typeUrl: '/ibc.core.channel.v1.QueryPacketAcknowledgementRequest';
    value: Uint8Array;
}
/**
 * QueryPacketAcknowledgementRequest is the request type for the
 * Query/PacketAcknowledgement RPC method
 */
export interface QueryPacketAcknowledgementRequestSDKType {
    port_id: string;
    channel_id: string;
    sequence: bigint;
}
/**
 * QueryPacketAcknowledgementResponse defines the client query response for a
 * packet which also includes a proof and the height from which the
 * proof was retrieved
 */
export interface QueryPacketAcknowledgementResponse {
    /** packet associated with the request fields */
    acknowledgement: Uint8Array;
    /** merkle proof of existence */
    proof: Uint8Array;
    /** height at which the proof was retrieved */
    proofHeight: Height;
}
export interface QueryPacketAcknowledgementResponseProtoMsg {
    typeUrl: '/ibc.core.channel.v1.QueryPacketAcknowledgementResponse';
    value: Uint8Array;
}
/**
 * QueryPacketAcknowledgementResponse defines the client query response for a
 * packet which also includes a proof and the height from which the
 * proof was retrieved
 */
export interface QueryPacketAcknowledgementResponseSDKType {
    acknowledgement: Uint8Array;
    proof: Uint8Array;
    proof_height: HeightSDKType;
}
/**
 * QueryPacketAcknowledgementsRequest is the request type for the
 * Query/QueryPacketCommitments RPC method
 */
export interface QueryPacketAcknowledgementsRequest {
    /** port unique identifier */
    portId: string;
    /** channel unique identifier */
    channelId: string;
    /** pagination request */
    pagination?: PageRequest;
    /** list of packet sequences */
    packetCommitmentSequences: bigint[];
}
export interface QueryPacketAcknowledgementsRequestProtoMsg {
    typeUrl: '/ibc.core.channel.v1.QueryPacketAcknowledgementsRequest';
    value: Uint8Array;
}
/**
 * QueryPacketAcknowledgementsRequest is the request type for the
 * Query/QueryPacketCommitments RPC method
 */
export interface QueryPacketAcknowledgementsRequestSDKType {
    port_id: string;
    channel_id: string;
    pagination?: PageRequestSDKType;
    packet_commitment_sequences: bigint[];
}
/**
 * QueryPacketAcknowledgemetsResponse is the request type for the
 * Query/QueryPacketAcknowledgements RPC method
 */
export interface QueryPacketAcknowledgementsResponse {
    acknowledgements: PacketState[];
    /** pagination response */
    pagination?: PageResponse;
    /** query block height */
    height: Height;
}
export interface QueryPacketAcknowledgementsResponseProtoMsg {
    typeUrl: '/ibc.core.channel.v1.QueryPacketAcknowledgementsResponse';
    value: Uint8Array;
}
/**
 * QueryPacketAcknowledgemetsResponse is the request type for the
 * Query/QueryPacketAcknowledgements RPC method
 */
export interface QueryPacketAcknowledgementsResponseSDKType {
    acknowledgements: PacketStateSDKType[];
    pagination?: PageResponseSDKType;
    height: HeightSDKType;
}
/**
 * QueryUnreceivedPacketsRequest is the request type for the
 * Query/UnreceivedPackets RPC method
 */
export interface QueryUnreceivedPacketsRequest {
    /** port unique identifier */
    portId: string;
    /** channel unique identifier */
    channelId: string;
    /** list of packet sequences */
    packetCommitmentSequences: bigint[];
}
export interface QueryUnreceivedPacketsRequestProtoMsg {
    typeUrl: '/ibc.core.channel.v1.QueryUnreceivedPacketsRequest';
    value: Uint8Array;
}
/**
 * QueryUnreceivedPacketsRequest is the request type for the
 * Query/UnreceivedPackets RPC method
 */
export interface QueryUnreceivedPacketsRequestSDKType {
    port_id: string;
    channel_id: string;
    packet_commitment_sequences: bigint[];
}
/**
 * QueryUnreceivedPacketsResponse is the response type for the
 * Query/UnreceivedPacketCommitments RPC method
 */
export interface QueryUnreceivedPacketsResponse {
    /** list of unreceived packet sequences */
    sequences: bigint[];
    /** query block height */
    height: Height;
}
export interface QueryUnreceivedPacketsResponseProtoMsg {
    typeUrl: '/ibc.core.channel.v1.QueryUnreceivedPacketsResponse';
    value: Uint8Array;
}
/**
 * QueryUnreceivedPacketsResponse is the response type for the
 * Query/UnreceivedPacketCommitments RPC method
 */
export interface QueryUnreceivedPacketsResponseSDKType {
    sequences: bigint[];
    height: HeightSDKType;
}
/**
 * QueryUnreceivedAcks is the request type for the
 * Query/UnreceivedAcks RPC method
 */
export interface QueryUnreceivedAcksRequest {
    /** port unique identifier */
    portId: string;
    /** channel unique identifier */
    channelId: string;
    /** list of acknowledgement sequences */
    packetAckSequences: bigint[];
}
export interface QueryUnreceivedAcksRequestProtoMsg {
    typeUrl: '/ibc.core.channel.v1.QueryUnreceivedAcksRequest';
    value: Uint8Array;
}
/**
 * QueryUnreceivedAcks is the request type for the
 * Query/UnreceivedAcks RPC method
 */
export interface QueryUnreceivedAcksRequestSDKType {
    port_id: string;
    channel_id: string;
    packet_ack_sequences: bigint[];
}
/**
 * QueryUnreceivedAcksResponse is the response type for the
 * Query/UnreceivedAcks RPC method
 */
export interface QueryUnreceivedAcksResponse {
    /** list of unreceived acknowledgement sequences */
    sequences: bigint[];
    /** query block height */
    height: Height;
}
export interface QueryUnreceivedAcksResponseProtoMsg {
    typeUrl: '/ibc.core.channel.v1.QueryUnreceivedAcksResponse';
    value: Uint8Array;
}
/**
 * QueryUnreceivedAcksResponse is the response type for the
 * Query/UnreceivedAcks RPC method
 */
export interface QueryUnreceivedAcksResponseSDKType {
    sequences: bigint[];
    height: HeightSDKType;
}
/**
 * QueryNextSequenceReceiveRequest is the request type for the
 * Query/QueryNextSequenceReceiveRequest RPC method
 */
export interface QueryNextSequenceReceiveRequest {
    /** port unique identifier */
    portId: string;
    /** channel unique identifier */
    channelId: string;
}
export interface QueryNextSequenceReceiveRequestProtoMsg {
    typeUrl: '/ibc.core.channel.v1.QueryNextSequenceReceiveRequest';
    value: Uint8Array;
}
/**
 * QueryNextSequenceReceiveRequest is the request type for the
 * Query/QueryNextSequenceReceiveRequest RPC method
 */
export interface QueryNextSequenceReceiveRequestSDKType {
    port_id: string;
    channel_id: string;
}
/**
 * QuerySequenceResponse is the request type for the
 * Query/QueryNextSequenceReceiveResponse RPC method
 */
export interface QueryNextSequenceReceiveResponse {
    /** next sequence receive number */
    nextSequenceReceive: bigint;
    /** merkle proof of existence */
    proof: Uint8Array;
    /** height at which the proof was retrieved */
    proofHeight: Height;
}
export interface QueryNextSequenceReceiveResponseProtoMsg {
    typeUrl: '/ibc.core.channel.v1.QueryNextSequenceReceiveResponse';
    value: Uint8Array;
}
/**
 * QuerySequenceResponse is the request type for the
 * Query/QueryNextSequenceReceiveResponse RPC method
 */
export interface QueryNextSequenceReceiveResponseSDKType {
    next_sequence_receive: bigint;
    proof: Uint8Array;
    proof_height: HeightSDKType;
}
export declare const QueryChannelRequest: {
    typeUrl: string;
    encode(message: QueryChannelRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryChannelRequest;
    fromJSON(object: any): QueryChannelRequest;
    toJSON(message: QueryChannelRequest): JsonSafe<QueryChannelRequest>;
    fromPartial(object: Partial<QueryChannelRequest>): QueryChannelRequest;
    fromProtoMsg(message: QueryChannelRequestProtoMsg): QueryChannelRequest;
    toProto(message: QueryChannelRequest): Uint8Array;
    toProtoMsg(message: QueryChannelRequest): QueryChannelRequestProtoMsg;
};
export declare const QueryChannelResponse: {
    typeUrl: string;
    encode(message: QueryChannelResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryChannelResponse;
    fromJSON(object: any): QueryChannelResponse;
    toJSON(message: QueryChannelResponse): JsonSafe<QueryChannelResponse>;
    fromPartial(object: Partial<QueryChannelResponse>): QueryChannelResponse;
    fromProtoMsg(message: QueryChannelResponseProtoMsg): QueryChannelResponse;
    toProto(message: QueryChannelResponse): Uint8Array;
    toProtoMsg(message: QueryChannelResponse): QueryChannelResponseProtoMsg;
};
export declare const QueryChannelsRequest: {
    typeUrl: string;
    encode(message: QueryChannelsRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryChannelsRequest;
    fromJSON(object: any): QueryChannelsRequest;
    toJSON(message: QueryChannelsRequest): JsonSafe<QueryChannelsRequest>;
    fromPartial(object: Partial<QueryChannelsRequest>): QueryChannelsRequest;
    fromProtoMsg(message: QueryChannelsRequestProtoMsg): QueryChannelsRequest;
    toProto(message: QueryChannelsRequest): Uint8Array;
    toProtoMsg(message: QueryChannelsRequest): QueryChannelsRequestProtoMsg;
};
export declare const QueryChannelsResponse: {
    typeUrl: string;
    encode(message: QueryChannelsResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryChannelsResponse;
    fromJSON(object: any): QueryChannelsResponse;
    toJSON(message: QueryChannelsResponse): JsonSafe<QueryChannelsResponse>;
    fromPartial(object: Partial<QueryChannelsResponse>): QueryChannelsResponse;
    fromProtoMsg(message: QueryChannelsResponseProtoMsg): QueryChannelsResponse;
    toProto(message: QueryChannelsResponse): Uint8Array;
    toProtoMsg(message: QueryChannelsResponse): QueryChannelsResponseProtoMsg;
};
export declare const QueryConnectionChannelsRequest: {
    typeUrl: string;
    encode(message: QueryConnectionChannelsRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryConnectionChannelsRequest;
    fromJSON(object: any): QueryConnectionChannelsRequest;
    toJSON(message: QueryConnectionChannelsRequest): JsonSafe<QueryConnectionChannelsRequest>;
    fromPartial(object: Partial<QueryConnectionChannelsRequest>): QueryConnectionChannelsRequest;
    fromProtoMsg(message: QueryConnectionChannelsRequestProtoMsg): QueryConnectionChannelsRequest;
    toProto(message: QueryConnectionChannelsRequest): Uint8Array;
    toProtoMsg(message: QueryConnectionChannelsRequest): QueryConnectionChannelsRequestProtoMsg;
};
export declare const QueryConnectionChannelsResponse: {
    typeUrl: string;
    encode(message: QueryConnectionChannelsResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryConnectionChannelsResponse;
    fromJSON(object: any): QueryConnectionChannelsResponse;
    toJSON(message: QueryConnectionChannelsResponse): JsonSafe<QueryConnectionChannelsResponse>;
    fromPartial(object: Partial<QueryConnectionChannelsResponse>): QueryConnectionChannelsResponse;
    fromProtoMsg(message: QueryConnectionChannelsResponseProtoMsg): QueryConnectionChannelsResponse;
    toProto(message: QueryConnectionChannelsResponse): Uint8Array;
    toProtoMsg(message: QueryConnectionChannelsResponse): QueryConnectionChannelsResponseProtoMsg;
};
export declare const QueryChannelClientStateRequest: {
    typeUrl: string;
    encode(message: QueryChannelClientStateRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryChannelClientStateRequest;
    fromJSON(object: any): QueryChannelClientStateRequest;
    toJSON(message: QueryChannelClientStateRequest): JsonSafe<QueryChannelClientStateRequest>;
    fromPartial(object: Partial<QueryChannelClientStateRequest>): QueryChannelClientStateRequest;
    fromProtoMsg(message: QueryChannelClientStateRequestProtoMsg): QueryChannelClientStateRequest;
    toProto(message: QueryChannelClientStateRequest): Uint8Array;
    toProtoMsg(message: QueryChannelClientStateRequest): QueryChannelClientStateRequestProtoMsg;
};
export declare const QueryChannelClientStateResponse: {
    typeUrl: string;
    encode(message: QueryChannelClientStateResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryChannelClientStateResponse;
    fromJSON(object: any): QueryChannelClientStateResponse;
    toJSON(message: QueryChannelClientStateResponse): JsonSafe<QueryChannelClientStateResponse>;
    fromPartial(object: Partial<QueryChannelClientStateResponse>): QueryChannelClientStateResponse;
    fromProtoMsg(message: QueryChannelClientStateResponseProtoMsg): QueryChannelClientStateResponse;
    toProto(message: QueryChannelClientStateResponse): Uint8Array;
    toProtoMsg(message: QueryChannelClientStateResponse): QueryChannelClientStateResponseProtoMsg;
};
export declare const QueryChannelConsensusStateRequest: {
    typeUrl: string;
    encode(message: QueryChannelConsensusStateRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryChannelConsensusStateRequest;
    fromJSON(object: any): QueryChannelConsensusStateRequest;
    toJSON(message: QueryChannelConsensusStateRequest): JsonSafe<QueryChannelConsensusStateRequest>;
    fromPartial(object: Partial<QueryChannelConsensusStateRequest>): QueryChannelConsensusStateRequest;
    fromProtoMsg(message: QueryChannelConsensusStateRequestProtoMsg): QueryChannelConsensusStateRequest;
    toProto(message: QueryChannelConsensusStateRequest): Uint8Array;
    toProtoMsg(message: QueryChannelConsensusStateRequest): QueryChannelConsensusStateRequestProtoMsg;
};
export declare const QueryChannelConsensusStateResponse: {
    typeUrl: string;
    encode(message: QueryChannelConsensusStateResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryChannelConsensusStateResponse;
    fromJSON(object: any): QueryChannelConsensusStateResponse;
    toJSON(message: QueryChannelConsensusStateResponse): JsonSafe<QueryChannelConsensusStateResponse>;
    fromPartial(object: Partial<QueryChannelConsensusStateResponse>): QueryChannelConsensusStateResponse;
    fromProtoMsg(message: QueryChannelConsensusStateResponseProtoMsg): QueryChannelConsensusStateResponse;
    toProto(message: QueryChannelConsensusStateResponse): Uint8Array;
    toProtoMsg(message: QueryChannelConsensusStateResponse): QueryChannelConsensusStateResponseProtoMsg;
};
export declare const QueryPacketCommitmentRequest: {
    typeUrl: string;
    encode(message: QueryPacketCommitmentRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryPacketCommitmentRequest;
    fromJSON(object: any): QueryPacketCommitmentRequest;
    toJSON(message: QueryPacketCommitmentRequest): JsonSafe<QueryPacketCommitmentRequest>;
    fromPartial(object: Partial<QueryPacketCommitmentRequest>): QueryPacketCommitmentRequest;
    fromProtoMsg(message: QueryPacketCommitmentRequestProtoMsg): QueryPacketCommitmentRequest;
    toProto(message: QueryPacketCommitmentRequest): Uint8Array;
    toProtoMsg(message: QueryPacketCommitmentRequest): QueryPacketCommitmentRequestProtoMsg;
};
export declare const QueryPacketCommitmentResponse: {
    typeUrl: string;
    encode(message: QueryPacketCommitmentResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryPacketCommitmentResponse;
    fromJSON(object: any): QueryPacketCommitmentResponse;
    toJSON(message: QueryPacketCommitmentResponse): JsonSafe<QueryPacketCommitmentResponse>;
    fromPartial(object: Partial<QueryPacketCommitmentResponse>): QueryPacketCommitmentResponse;
    fromProtoMsg(message: QueryPacketCommitmentResponseProtoMsg): QueryPacketCommitmentResponse;
    toProto(message: QueryPacketCommitmentResponse): Uint8Array;
    toProtoMsg(message: QueryPacketCommitmentResponse): QueryPacketCommitmentResponseProtoMsg;
};
export declare const QueryPacketCommitmentsRequest: {
    typeUrl: string;
    encode(message: QueryPacketCommitmentsRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryPacketCommitmentsRequest;
    fromJSON(object: any): QueryPacketCommitmentsRequest;
    toJSON(message: QueryPacketCommitmentsRequest): JsonSafe<QueryPacketCommitmentsRequest>;
    fromPartial(object: Partial<QueryPacketCommitmentsRequest>): QueryPacketCommitmentsRequest;
    fromProtoMsg(message: QueryPacketCommitmentsRequestProtoMsg): QueryPacketCommitmentsRequest;
    toProto(message: QueryPacketCommitmentsRequest): Uint8Array;
    toProtoMsg(message: QueryPacketCommitmentsRequest): QueryPacketCommitmentsRequestProtoMsg;
};
export declare const QueryPacketCommitmentsResponse: {
    typeUrl: string;
    encode(message: QueryPacketCommitmentsResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryPacketCommitmentsResponse;
    fromJSON(object: any): QueryPacketCommitmentsResponse;
    toJSON(message: QueryPacketCommitmentsResponse): JsonSafe<QueryPacketCommitmentsResponse>;
    fromPartial(object: Partial<QueryPacketCommitmentsResponse>): QueryPacketCommitmentsResponse;
    fromProtoMsg(message: QueryPacketCommitmentsResponseProtoMsg): QueryPacketCommitmentsResponse;
    toProto(message: QueryPacketCommitmentsResponse): Uint8Array;
    toProtoMsg(message: QueryPacketCommitmentsResponse): QueryPacketCommitmentsResponseProtoMsg;
};
export declare const QueryPacketReceiptRequest: {
    typeUrl: string;
    encode(message: QueryPacketReceiptRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryPacketReceiptRequest;
    fromJSON(object: any): QueryPacketReceiptRequest;
    toJSON(message: QueryPacketReceiptRequest): JsonSafe<QueryPacketReceiptRequest>;
    fromPartial(object: Partial<QueryPacketReceiptRequest>): QueryPacketReceiptRequest;
    fromProtoMsg(message: QueryPacketReceiptRequestProtoMsg): QueryPacketReceiptRequest;
    toProto(message: QueryPacketReceiptRequest): Uint8Array;
    toProtoMsg(message: QueryPacketReceiptRequest): QueryPacketReceiptRequestProtoMsg;
};
export declare const QueryPacketReceiptResponse: {
    typeUrl: string;
    encode(message: QueryPacketReceiptResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryPacketReceiptResponse;
    fromJSON(object: any): QueryPacketReceiptResponse;
    toJSON(message: QueryPacketReceiptResponse): JsonSafe<QueryPacketReceiptResponse>;
    fromPartial(object: Partial<QueryPacketReceiptResponse>): QueryPacketReceiptResponse;
    fromProtoMsg(message: QueryPacketReceiptResponseProtoMsg): QueryPacketReceiptResponse;
    toProto(message: QueryPacketReceiptResponse): Uint8Array;
    toProtoMsg(message: QueryPacketReceiptResponse): QueryPacketReceiptResponseProtoMsg;
};
export declare const QueryPacketAcknowledgementRequest: {
    typeUrl: string;
    encode(message: QueryPacketAcknowledgementRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryPacketAcknowledgementRequest;
    fromJSON(object: any): QueryPacketAcknowledgementRequest;
    toJSON(message: QueryPacketAcknowledgementRequest): JsonSafe<QueryPacketAcknowledgementRequest>;
    fromPartial(object: Partial<QueryPacketAcknowledgementRequest>): QueryPacketAcknowledgementRequest;
    fromProtoMsg(message: QueryPacketAcknowledgementRequestProtoMsg): QueryPacketAcknowledgementRequest;
    toProto(message: QueryPacketAcknowledgementRequest): Uint8Array;
    toProtoMsg(message: QueryPacketAcknowledgementRequest): QueryPacketAcknowledgementRequestProtoMsg;
};
export declare const QueryPacketAcknowledgementResponse: {
    typeUrl: string;
    encode(message: QueryPacketAcknowledgementResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryPacketAcknowledgementResponse;
    fromJSON(object: any): QueryPacketAcknowledgementResponse;
    toJSON(message: QueryPacketAcknowledgementResponse): JsonSafe<QueryPacketAcknowledgementResponse>;
    fromPartial(object: Partial<QueryPacketAcknowledgementResponse>): QueryPacketAcknowledgementResponse;
    fromProtoMsg(message: QueryPacketAcknowledgementResponseProtoMsg): QueryPacketAcknowledgementResponse;
    toProto(message: QueryPacketAcknowledgementResponse): Uint8Array;
    toProtoMsg(message: QueryPacketAcknowledgementResponse): QueryPacketAcknowledgementResponseProtoMsg;
};
export declare const QueryPacketAcknowledgementsRequest: {
    typeUrl: string;
    encode(message: QueryPacketAcknowledgementsRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryPacketAcknowledgementsRequest;
    fromJSON(object: any): QueryPacketAcknowledgementsRequest;
    toJSON(message: QueryPacketAcknowledgementsRequest): JsonSafe<QueryPacketAcknowledgementsRequest>;
    fromPartial(object: Partial<QueryPacketAcknowledgementsRequest>): QueryPacketAcknowledgementsRequest;
    fromProtoMsg(message: QueryPacketAcknowledgementsRequestProtoMsg): QueryPacketAcknowledgementsRequest;
    toProto(message: QueryPacketAcknowledgementsRequest): Uint8Array;
    toProtoMsg(message: QueryPacketAcknowledgementsRequest): QueryPacketAcknowledgementsRequestProtoMsg;
};
export declare const QueryPacketAcknowledgementsResponse: {
    typeUrl: string;
    encode(message: QueryPacketAcknowledgementsResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryPacketAcknowledgementsResponse;
    fromJSON(object: any): QueryPacketAcknowledgementsResponse;
    toJSON(message: QueryPacketAcknowledgementsResponse): JsonSafe<QueryPacketAcknowledgementsResponse>;
    fromPartial(object: Partial<QueryPacketAcknowledgementsResponse>): QueryPacketAcknowledgementsResponse;
    fromProtoMsg(message: QueryPacketAcknowledgementsResponseProtoMsg): QueryPacketAcknowledgementsResponse;
    toProto(message: QueryPacketAcknowledgementsResponse): Uint8Array;
    toProtoMsg(message: QueryPacketAcknowledgementsResponse): QueryPacketAcknowledgementsResponseProtoMsg;
};
export declare const QueryUnreceivedPacketsRequest: {
    typeUrl: string;
    encode(message: QueryUnreceivedPacketsRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryUnreceivedPacketsRequest;
    fromJSON(object: any): QueryUnreceivedPacketsRequest;
    toJSON(message: QueryUnreceivedPacketsRequest): JsonSafe<QueryUnreceivedPacketsRequest>;
    fromPartial(object: Partial<QueryUnreceivedPacketsRequest>): QueryUnreceivedPacketsRequest;
    fromProtoMsg(message: QueryUnreceivedPacketsRequestProtoMsg): QueryUnreceivedPacketsRequest;
    toProto(message: QueryUnreceivedPacketsRequest): Uint8Array;
    toProtoMsg(message: QueryUnreceivedPacketsRequest): QueryUnreceivedPacketsRequestProtoMsg;
};
export declare const QueryUnreceivedPacketsResponse: {
    typeUrl: string;
    encode(message: QueryUnreceivedPacketsResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryUnreceivedPacketsResponse;
    fromJSON(object: any): QueryUnreceivedPacketsResponse;
    toJSON(message: QueryUnreceivedPacketsResponse): JsonSafe<QueryUnreceivedPacketsResponse>;
    fromPartial(object: Partial<QueryUnreceivedPacketsResponse>): QueryUnreceivedPacketsResponse;
    fromProtoMsg(message: QueryUnreceivedPacketsResponseProtoMsg): QueryUnreceivedPacketsResponse;
    toProto(message: QueryUnreceivedPacketsResponse): Uint8Array;
    toProtoMsg(message: QueryUnreceivedPacketsResponse): QueryUnreceivedPacketsResponseProtoMsg;
};
export declare const QueryUnreceivedAcksRequest: {
    typeUrl: string;
    encode(message: QueryUnreceivedAcksRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryUnreceivedAcksRequest;
    fromJSON(object: any): QueryUnreceivedAcksRequest;
    toJSON(message: QueryUnreceivedAcksRequest): JsonSafe<QueryUnreceivedAcksRequest>;
    fromPartial(object: Partial<QueryUnreceivedAcksRequest>): QueryUnreceivedAcksRequest;
    fromProtoMsg(message: QueryUnreceivedAcksRequestProtoMsg): QueryUnreceivedAcksRequest;
    toProto(message: QueryUnreceivedAcksRequest): Uint8Array;
    toProtoMsg(message: QueryUnreceivedAcksRequest): QueryUnreceivedAcksRequestProtoMsg;
};
export declare const QueryUnreceivedAcksResponse: {
    typeUrl: string;
    encode(message: QueryUnreceivedAcksResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryUnreceivedAcksResponse;
    fromJSON(object: any): QueryUnreceivedAcksResponse;
    toJSON(message: QueryUnreceivedAcksResponse): JsonSafe<QueryUnreceivedAcksResponse>;
    fromPartial(object: Partial<QueryUnreceivedAcksResponse>): QueryUnreceivedAcksResponse;
    fromProtoMsg(message: QueryUnreceivedAcksResponseProtoMsg): QueryUnreceivedAcksResponse;
    toProto(message: QueryUnreceivedAcksResponse): Uint8Array;
    toProtoMsg(message: QueryUnreceivedAcksResponse): QueryUnreceivedAcksResponseProtoMsg;
};
export declare const QueryNextSequenceReceiveRequest: {
    typeUrl: string;
    encode(message: QueryNextSequenceReceiveRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryNextSequenceReceiveRequest;
    fromJSON(object: any): QueryNextSequenceReceiveRequest;
    toJSON(message: QueryNextSequenceReceiveRequest): JsonSafe<QueryNextSequenceReceiveRequest>;
    fromPartial(object: Partial<QueryNextSequenceReceiveRequest>): QueryNextSequenceReceiveRequest;
    fromProtoMsg(message: QueryNextSequenceReceiveRequestProtoMsg): QueryNextSequenceReceiveRequest;
    toProto(message: QueryNextSequenceReceiveRequest): Uint8Array;
    toProtoMsg(message: QueryNextSequenceReceiveRequest): QueryNextSequenceReceiveRequestProtoMsg;
};
export declare const QueryNextSequenceReceiveResponse: {
    typeUrl: string;
    encode(message: QueryNextSequenceReceiveResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryNextSequenceReceiveResponse;
    fromJSON(object: any): QueryNextSequenceReceiveResponse;
    toJSON(message: QueryNextSequenceReceiveResponse): JsonSafe<QueryNextSequenceReceiveResponse>;
    fromPartial(object: Partial<QueryNextSequenceReceiveResponse>): QueryNextSequenceReceiveResponse;
    fromProtoMsg(message: QueryNextSequenceReceiveResponseProtoMsg): QueryNextSequenceReceiveResponse;
    toProto(message: QueryNextSequenceReceiveResponse): Uint8Array;
    toProtoMsg(message: QueryNextSequenceReceiveResponse): QueryNextSequenceReceiveResponseProtoMsg;
};
