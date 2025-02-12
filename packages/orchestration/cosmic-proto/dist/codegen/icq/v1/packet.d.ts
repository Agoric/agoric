import { RequestQuery, type RequestQuerySDKType, ResponseQuery, type ResponseQuerySDKType } from '../../tendermint/abci/types.js';
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { type JsonSafe } from '../../json-safe.js';
/** InterchainQueryPacketData is comprised of raw query. */
export interface InterchainQueryPacketData {
    data: Uint8Array;
    /** optional memo */
    memo: string;
}
export interface InterchainQueryPacketDataProtoMsg {
    typeUrl: '/icq.v1.InterchainQueryPacketData';
    value: Uint8Array;
}
/** InterchainQueryPacketData is comprised of raw query. */
export interface InterchainQueryPacketDataSDKType {
    data: Uint8Array;
    memo: string;
}
/** InterchainQueryPacketAck is comprised of an ABCI query response with non-deterministic fields left empty (e.g. Codespace, Log, Info and ...). */
export interface InterchainQueryPacketAck {
    data: Uint8Array;
}
export interface InterchainQueryPacketAckProtoMsg {
    typeUrl: '/icq.v1.InterchainQueryPacketAck';
    value: Uint8Array;
}
/** InterchainQueryPacketAck is comprised of an ABCI query response with non-deterministic fields left empty (e.g. Codespace, Log, Info and ...). */
export interface InterchainQueryPacketAckSDKType {
    data: Uint8Array;
}
/** CosmosQuery contains a list of tendermint ABCI query requests. It should be used when sending queries to an SDK host chain. */
export interface CosmosQuery {
    requests: RequestQuery[];
}
export interface CosmosQueryProtoMsg {
    typeUrl: '/icq.v1.CosmosQuery';
    value: Uint8Array;
}
/** CosmosQuery contains a list of tendermint ABCI query requests. It should be used when sending queries to an SDK host chain. */
export interface CosmosQuerySDKType {
    requests: RequestQuerySDKType[];
}
/** CosmosResponse contains a list of tendermint ABCI query responses. It should be used when receiving responses from an SDK host chain. */
export interface CosmosResponse {
    responses: ResponseQuery[];
}
export interface CosmosResponseProtoMsg {
    typeUrl: '/icq.v1.CosmosResponse';
    value: Uint8Array;
}
/** CosmosResponse contains a list of tendermint ABCI query responses. It should be used when receiving responses from an SDK host chain. */
export interface CosmosResponseSDKType {
    responses: ResponseQuerySDKType[];
}
export declare const InterchainQueryPacketData: {
    typeUrl: string;
    encode(message: InterchainQueryPacketData, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): InterchainQueryPacketData;
    fromJSON(object: any): InterchainQueryPacketData;
    toJSON(message: InterchainQueryPacketData): JsonSafe<InterchainQueryPacketData>;
    fromPartial(object: Partial<InterchainQueryPacketData>): InterchainQueryPacketData;
    fromProtoMsg(message: InterchainQueryPacketDataProtoMsg): InterchainQueryPacketData;
    toProto(message: InterchainQueryPacketData): Uint8Array;
    toProtoMsg(message: InterchainQueryPacketData): InterchainQueryPacketDataProtoMsg;
};
export declare const InterchainQueryPacketAck: {
    typeUrl: string;
    encode(message: InterchainQueryPacketAck, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): InterchainQueryPacketAck;
    fromJSON(object: any): InterchainQueryPacketAck;
    toJSON(message: InterchainQueryPacketAck): JsonSafe<InterchainQueryPacketAck>;
    fromPartial(object: Partial<InterchainQueryPacketAck>): InterchainQueryPacketAck;
    fromProtoMsg(message: InterchainQueryPacketAckProtoMsg): InterchainQueryPacketAck;
    toProto(message: InterchainQueryPacketAck): Uint8Array;
    toProtoMsg(message: InterchainQueryPacketAck): InterchainQueryPacketAckProtoMsg;
};
export declare const CosmosQuery: {
    typeUrl: string;
    encode(message: CosmosQuery, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): CosmosQuery;
    fromJSON(object: any): CosmosQuery;
    toJSON(message: CosmosQuery): JsonSafe<CosmosQuery>;
    fromPartial(object: Partial<CosmosQuery>): CosmosQuery;
    fromProtoMsg(message: CosmosQueryProtoMsg): CosmosQuery;
    toProto(message: CosmosQuery): Uint8Array;
    toProtoMsg(message: CosmosQuery): CosmosQueryProtoMsg;
};
export declare const CosmosResponse: {
    typeUrl: string;
    encode(message: CosmosResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): CosmosResponse;
    fromJSON(object: any): CosmosResponse;
    toJSON(message: CosmosResponse): JsonSafe<CosmosResponse>;
    fromPartial(object: Partial<CosmosResponse>): CosmosResponse;
    fromProtoMsg(message: CosmosResponseProtoMsg): CosmosResponse;
    toProto(message: CosmosResponse): Uint8Array;
    toProtoMsg(message: CosmosResponse): CosmosResponseProtoMsg;
};
