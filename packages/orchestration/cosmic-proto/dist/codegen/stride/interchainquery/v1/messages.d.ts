import { ProofOps, type ProofOpsSDKType } from '../../../tendermint/crypto/proof.js';
import { BinaryReader, BinaryWriter } from '../../../binary.js';
import { type JsonSafe } from '../../../json-safe.js';
/** MsgSubmitQueryResponse represents a message type to fulfil a query request. */
export interface MsgSubmitQueryResponse {
    chainId: string;
    queryId: string;
    result: Uint8Array;
    proofOps?: ProofOps;
    height: bigint;
    fromAddress: string;
}
export interface MsgSubmitQueryResponseProtoMsg {
    typeUrl: '/stride.interchainquery.v1.MsgSubmitQueryResponse';
    value: Uint8Array;
}
/** MsgSubmitQueryResponse represents a message type to fulfil a query request. */
export interface MsgSubmitQueryResponseSDKType {
    chain_id: string;
    query_id: string;
    result: Uint8Array;
    proof_ops?: ProofOpsSDKType;
    height: bigint;
    from_address: string;
}
/**
 * MsgSubmitQueryResponseResponse defines the MsgSubmitQueryResponse response
 * type.
 */
export interface MsgSubmitQueryResponseResponse {
}
export interface MsgSubmitQueryResponseResponseProtoMsg {
    typeUrl: '/stride.interchainquery.v1.MsgSubmitQueryResponseResponse';
    value: Uint8Array;
}
/**
 * MsgSubmitQueryResponseResponse defines the MsgSubmitQueryResponse response
 * type.
 */
export interface MsgSubmitQueryResponseResponseSDKType {
}
export declare const MsgSubmitQueryResponse: {
    typeUrl: string;
    encode(message: MsgSubmitQueryResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgSubmitQueryResponse;
    fromJSON(object: any): MsgSubmitQueryResponse;
    toJSON(message: MsgSubmitQueryResponse): JsonSafe<MsgSubmitQueryResponse>;
    fromPartial(object: Partial<MsgSubmitQueryResponse>): MsgSubmitQueryResponse;
    fromProtoMsg(message: MsgSubmitQueryResponseProtoMsg): MsgSubmitQueryResponse;
    toProto(message: MsgSubmitQueryResponse): Uint8Array;
    toProtoMsg(message: MsgSubmitQueryResponse): MsgSubmitQueryResponseProtoMsg;
};
export declare const MsgSubmitQueryResponseResponse: {
    typeUrl: string;
    encode(_: MsgSubmitQueryResponseResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgSubmitQueryResponseResponse;
    fromJSON(_: any): MsgSubmitQueryResponseResponse;
    toJSON(_: MsgSubmitQueryResponseResponse): JsonSafe<MsgSubmitQueryResponseResponse>;
    fromPartial(_: Partial<MsgSubmitQueryResponseResponse>): MsgSubmitQueryResponseResponse;
    fromProtoMsg(message: MsgSubmitQueryResponseResponseProtoMsg): MsgSubmitQueryResponseResponse;
    toProto(message: MsgSubmitQueryResponseResponse): Uint8Array;
    toProtoMsg(message: MsgSubmitQueryResponseResponse): MsgSubmitQueryResponseResponseProtoMsg;
};
