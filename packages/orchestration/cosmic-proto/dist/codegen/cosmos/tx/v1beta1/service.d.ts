import { Tx, type TxSDKType } from './tx.js';
import { PageRequest, type PageRequestSDKType, PageResponse, type PageResponseSDKType } from '../../base/query/v1beta1/pagination.js';
import { TxResponse, type TxResponseSDKType, GasInfo, type GasInfoSDKType, Result, type ResultSDKType } from '../../base/abci/v1beta1/abci.js';
import { BlockID, type BlockIDSDKType } from '../../../tendermint/types/types.js';
import { Block, type BlockSDKType } from '../../../tendermint/types/block.js';
import { BinaryReader, BinaryWriter } from '../../../binary.js';
import { type JsonSafe } from '../../../json-safe.js';
/** OrderBy defines the sorting order */
export declare enum OrderBy {
    /** ORDER_BY_UNSPECIFIED - ORDER_BY_UNSPECIFIED specifies an unknown sorting order. OrderBy defaults to ASC in this case. */
    ORDER_BY_UNSPECIFIED = 0,
    /** ORDER_BY_ASC - ORDER_BY_ASC defines ascending order */
    ORDER_BY_ASC = 1,
    /** ORDER_BY_DESC - ORDER_BY_DESC defines descending order */
    ORDER_BY_DESC = 2,
    UNRECOGNIZED = -1
}
export declare const OrderBySDKType: typeof OrderBy;
export declare function orderByFromJSON(object: any): OrderBy;
export declare function orderByToJSON(object: OrderBy): string;
/** BroadcastMode specifies the broadcast mode for the TxService.Broadcast RPC method. */
export declare enum BroadcastMode {
    /** BROADCAST_MODE_UNSPECIFIED - zero-value for mode ordering */
    BROADCAST_MODE_UNSPECIFIED = 0,
    /**
     * BROADCAST_MODE_BLOCK - BROADCAST_MODE_BLOCK defines a tx broadcasting mode where the client waits for
     * the tx to be committed in a block.
     */
    BROADCAST_MODE_BLOCK = 1,
    /**
     * BROADCAST_MODE_SYNC - BROADCAST_MODE_SYNC defines a tx broadcasting mode where the client waits for
     * a CheckTx execution response only.
     */
    BROADCAST_MODE_SYNC = 2,
    /**
     * BROADCAST_MODE_ASYNC - BROADCAST_MODE_ASYNC defines a tx broadcasting mode where the client returns
     * immediately.
     */
    BROADCAST_MODE_ASYNC = 3,
    UNRECOGNIZED = -1
}
export declare const BroadcastModeSDKType: typeof BroadcastMode;
export declare function broadcastModeFromJSON(object: any): BroadcastMode;
export declare function broadcastModeToJSON(object: BroadcastMode): string;
/**
 * GetTxsEventRequest is the request type for the Service.TxsByEvents
 * RPC method.
 */
export interface GetTxsEventRequest {
    /** events is the list of transaction event type. */
    events: string[];
    /**
     * pagination defines a pagination for the request.
     * Deprecated post v0.46.x: use page and limit instead.
     */
    /** @deprecated */
    pagination?: PageRequest;
    orderBy: OrderBy;
    /** page is the page number to query, starts at 1. If not provided, will default to first page. */
    page: bigint;
    /**
     * limit is the total number of results to be returned in the result page.
     * If left empty it will default to a value to be set by each app.
     */
    limit: bigint;
}
export interface GetTxsEventRequestProtoMsg {
    typeUrl: '/cosmos.tx.v1beta1.GetTxsEventRequest';
    value: Uint8Array;
}
/**
 * GetTxsEventRequest is the request type for the Service.TxsByEvents
 * RPC method.
 */
export interface GetTxsEventRequestSDKType {
    events: string[];
    /** @deprecated */
    pagination?: PageRequestSDKType;
    order_by: OrderBy;
    page: bigint;
    limit: bigint;
}
/**
 * GetTxsEventResponse is the response type for the Service.TxsByEvents
 * RPC method.
 */
export interface GetTxsEventResponse {
    /** txs is the list of queried transactions. */
    txs: Tx[];
    /** tx_responses is the list of queried TxResponses. */
    txResponses: TxResponse[];
    /**
     * pagination defines a pagination for the response.
     * Deprecated post v0.46.x: use total instead.
     */
    /** @deprecated */
    pagination?: PageResponse;
    /** total is total number of results available */
    total: bigint;
}
export interface GetTxsEventResponseProtoMsg {
    typeUrl: '/cosmos.tx.v1beta1.GetTxsEventResponse';
    value: Uint8Array;
}
/**
 * GetTxsEventResponse is the response type for the Service.TxsByEvents
 * RPC method.
 */
export interface GetTxsEventResponseSDKType {
    txs: TxSDKType[];
    tx_responses: TxResponseSDKType[];
    /** @deprecated */
    pagination?: PageResponseSDKType;
    total: bigint;
}
/**
 * BroadcastTxRequest is the request type for the Service.BroadcastTxRequest
 * RPC method.
 */
export interface BroadcastTxRequest {
    /** tx_bytes is the raw transaction. */
    txBytes: Uint8Array;
    mode: BroadcastMode;
}
export interface BroadcastTxRequestProtoMsg {
    typeUrl: '/cosmos.tx.v1beta1.BroadcastTxRequest';
    value: Uint8Array;
}
/**
 * BroadcastTxRequest is the request type for the Service.BroadcastTxRequest
 * RPC method.
 */
export interface BroadcastTxRequestSDKType {
    tx_bytes: Uint8Array;
    mode: BroadcastMode;
}
/**
 * BroadcastTxResponse is the response type for the
 * Service.BroadcastTx method.
 */
export interface BroadcastTxResponse {
    /** tx_response is the queried TxResponses. */
    txResponse?: TxResponse;
}
export interface BroadcastTxResponseProtoMsg {
    typeUrl: '/cosmos.tx.v1beta1.BroadcastTxResponse';
    value: Uint8Array;
}
/**
 * BroadcastTxResponse is the response type for the
 * Service.BroadcastTx method.
 */
export interface BroadcastTxResponseSDKType {
    tx_response?: TxResponseSDKType;
}
/**
 * SimulateRequest is the request type for the Service.Simulate
 * RPC method.
 */
export interface SimulateRequest {
    /**
     * tx is the transaction to simulate.
     * Deprecated. Send raw tx bytes instead.
     */
    /** @deprecated */
    tx?: Tx;
    /**
     * tx_bytes is the raw transaction.
     *
     * Since: cosmos-sdk 0.43
     */
    txBytes: Uint8Array;
}
export interface SimulateRequestProtoMsg {
    typeUrl: '/cosmos.tx.v1beta1.SimulateRequest';
    value: Uint8Array;
}
/**
 * SimulateRequest is the request type for the Service.Simulate
 * RPC method.
 */
export interface SimulateRequestSDKType {
    /** @deprecated */
    tx?: TxSDKType;
    tx_bytes: Uint8Array;
}
/**
 * SimulateResponse is the response type for the
 * Service.SimulateRPC method.
 */
export interface SimulateResponse {
    /** gas_info is the information about gas used in the simulation. */
    gasInfo?: GasInfo;
    /** result is the result of the simulation. */
    result?: Result;
}
export interface SimulateResponseProtoMsg {
    typeUrl: '/cosmos.tx.v1beta1.SimulateResponse';
    value: Uint8Array;
}
/**
 * SimulateResponse is the response type for the
 * Service.SimulateRPC method.
 */
export interface SimulateResponseSDKType {
    gas_info?: GasInfoSDKType;
    result?: ResultSDKType;
}
/**
 * GetTxRequest is the request type for the Service.GetTx
 * RPC method.
 */
export interface GetTxRequest {
    /** hash is the tx hash to query, encoded as a hex string. */
    hash: string;
}
export interface GetTxRequestProtoMsg {
    typeUrl: '/cosmos.tx.v1beta1.GetTxRequest';
    value: Uint8Array;
}
/**
 * GetTxRequest is the request type for the Service.GetTx
 * RPC method.
 */
export interface GetTxRequestSDKType {
    hash: string;
}
/** GetTxResponse is the response type for the Service.GetTx method. */
export interface GetTxResponse {
    /** tx is the queried transaction. */
    tx?: Tx;
    /** tx_response is the queried TxResponses. */
    txResponse?: TxResponse;
}
export interface GetTxResponseProtoMsg {
    typeUrl: '/cosmos.tx.v1beta1.GetTxResponse';
    value: Uint8Array;
}
/** GetTxResponse is the response type for the Service.GetTx method. */
export interface GetTxResponseSDKType {
    tx?: TxSDKType;
    tx_response?: TxResponseSDKType;
}
/**
 * GetBlockWithTxsRequest is the request type for the Service.GetBlockWithTxs
 * RPC method.
 *
 * Since: cosmos-sdk 0.45.2
 */
export interface GetBlockWithTxsRequest {
    /** height is the height of the block to query. */
    height: bigint;
    /** pagination defines a pagination for the request. */
    pagination?: PageRequest;
}
export interface GetBlockWithTxsRequestProtoMsg {
    typeUrl: '/cosmos.tx.v1beta1.GetBlockWithTxsRequest';
    value: Uint8Array;
}
/**
 * GetBlockWithTxsRequest is the request type for the Service.GetBlockWithTxs
 * RPC method.
 *
 * Since: cosmos-sdk 0.45.2
 */
export interface GetBlockWithTxsRequestSDKType {
    height: bigint;
    pagination?: PageRequestSDKType;
}
/**
 * GetBlockWithTxsResponse is the response type for the Service.GetBlockWithTxs method.
 *
 * Since: cosmos-sdk 0.45.2
 */
export interface GetBlockWithTxsResponse {
    /** txs are the transactions in the block. */
    txs: Tx[];
    blockId?: BlockID;
    block?: Block;
    /** pagination defines a pagination for the response. */
    pagination?: PageResponse;
}
export interface GetBlockWithTxsResponseProtoMsg {
    typeUrl: '/cosmos.tx.v1beta1.GetBlockWithTxsResponse';
    value: Uint8Array;
}
/**
 * GetBlockWithTxsResponse is the response type for the Service.GetBlockWithTxs method.
 *
 * Since: cosmos-sdk 0.45.2
 */
export interface GetBlockWithTxsResponseSDKType {
    txs: TxSDKType[];
    block_id?: BlockIDSDKType;
    block?: BlockSDKType;
    pagination?: PageResponseSDKType;
}
export declare const GetTxsEventRequest: {
    typeUrl: string;
    encode(message: GetTxsEventRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): GetTxsEventRequest;
    fromJSON(object: any): GetTxsEventRequest;
    toJSON(message: GetTxsEventRequest): JsonSafe<GetTxsEventRequest>;
    fromPartial(object: Partial<GetTxsEventRequest>): GetTxsEventRequest;
    fromProtoMsg(message: GetTxsEventRequestProtoMsg): GetTxsEventRequest;
    toProto(message: GetTxsEventRequest): Uint8Array;
    toProtoMsg(message: GetTxsEventRequest): GetTxsEventRequestProtoMsg;
};
export declare const GetTxsEventResponse: {
    typeUrl: string;
    encode(message: GetTxsEventResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): GetTxsEventResponse;
    fromJSON(object: any): GetTxsEventResponse;
    toJSON(message: GetTxsEventResponse): JsonSafe<GetTxsEventResponse>;
    fromPartial(object: Partial<GetTxsEventResponse>): GetTxsEventResponse;
    fromProtoMsg(message: GetTxsEventResponseProtoMsg): GetTxsEventResponse;
    toProto(message: GetTxsEventResponse): Uint8Array;
    toProtoMsg(message: GetTxsEventResponse): GetTxsEventResponseProtoMsg;
};
export declare const BroadcastTxRequest: {
    typeUrl: string;
    encode(message: BroadcastTxRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): BroadcastTxRequest;
    fromJSON(object: any): BroadcastTxRequest;
    toJSON(message: BroadcastTxRequest): JsonSafe<BroadcastTxRequest>;
    fromPartial(object: Partial<BroadcastTxRequest>): BroadcastTxRequest;
    fromProtoMsg(message: BroadcastTxRequestProtoMsg): BroadcastTxRequest;
    toProto(message: BroadcastTxRequest): Uint8Array;
    toProtoMsg(message: BroadcastTxRequest): BroadcastTxRequestProtoMsg;
};
export declare const BroadcastTxResponse: {
    typeUrl: string;
    encode(message: BroadcastTxResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): BroadcastTxResponse;
    fromJSON(object: any): BroadcastTxResponse;
    toJSON(message: BroadcastTxResponse): JsonSafe<BroadcastTxResponse>;
    fromPartial(object: Partial<BroadcastTxResponse>): BroadcastTxResponse;
    fromProtoMsg(message: BroadcastTxResponseProtoMsg): BroadcastTxResponse;
    toProto(message: BroadcastTxResponse): Uint8Array;
    toProtoMsg(message: BroadcastTxResponse): BroadcastTxResponseProtoMsg;
};
export declare const SimulateRequest: {
    typeUrl: string;
    encode(message: SimulateRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): SimulateRequest;
    fromJSON(object: any): SimulateRequest;
    toJSON(message: SimulateRequest): JsonSafe<SimulateRequest>;
    fromPartial(object: Partial<SimulateRequest>): SimulateRequest;
    fromProtoMsg(message: SimulateRequestProtoMsg): SimulateRequest;
    toProto(message: SimulateRequest): Uint8Array;
    toProtoMsg(message: SimulateRequest): SimulateRequestProtoMsg;
};
export declare const SimulateResponse: {
    typeUrl: string;
    encode(message: SimulateResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): SimulateResponse;
    fromJSON(object: any): SimulateResponse;
    toJSON(message: SimulateResponse): JsonSafe<SimulateResponse>;
    fromPartial(object: Partial<SimulateResponse>): SimulateResponse;
    fromProtoMsg(message: SimulateResponseProtoMsg): SimulateResponse;
    toProto(message: SimulateResponse): Uint8Array;
    toProtoMsg(message: SimulateResponse): SimulateResponseProtoMsg;
};
export declare const GetTxRequest: {
    typeUrl: string;
    encode(message: GetTxRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): GetTxRequest;
    fromJSON(object: any): GetTxRequest;
    toJSON(message: GetTxRequest): JsonSafe<GetTxRequest>;
    fromPartial(object: Partial<GetTxRequest>): GetTxRequest;
    fromProtoMsg(message: GetTxRequestProtoMsg): GetTxRequest;
    toProto(message: GetTxRequest): Uint8Array;
    toProtoMsg(message: GetTxRequest): GetTxRequestProtoMsg;
};
export declare const GetTxResponse: {
    typeUrl: string;
    encode(message: GetTxResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): GetTxResponse;
    fromJSON(object: any): GetTxResponse;
    toJSON(message: GetTxResponse): JsonSafe<GetTxResponse>;
    fromPartial(object: Partial<GetTxResponse>): GetTxResponse;
    fromProtoMsg(message: GetTxResponseProtoMsg): GetTxResponse;
    toProto(message: GetTxResponse): Uint8Array;
    toProtoMsg(message: GetTxResponse): GetTxResponseProtoMsg;
};
export declare const GetBlockWithTxsRequest: {
    typeUrl: string;
    encode(message: GetBlockWithTxsRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): GetBlockWithTxsRequest;
    fromJSON(object: any): GetBlockWithTxsRequest;
    toJSON(message: GetBlockWithTxsRequest): JsonSafe<GetBlockWithTxsRequest>;
    fromPartial(object: Partial<GetBlockWithTxsRequest>): GetBlockWithTxsRequest;
    fromProtoMsg(message: GetBlockWithTxsRequestProtoMsg): GetBlockWithTxsRequest;
    toProto(message: GetBlockWithTxsRequest): Uint8Array;
    toProtoMsg(message: GetBlockWithTxsRequest): GetBlockWithTxsRequestProtoMsg;
};
export declare const GetBlockWithTxsResponse: {
    typeUrl: string;
    encode(message: GetBlockWithTxsResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): GetBlockWithTxsResponse;
    fromJSON(object: any): GetBlockWithTxsResponse;
    toJSON(message: GetBlockWithTxsResponse): JsonSafe<GetBlockWithTxsResponse>;
    fromPartial(object: Partial<GetBlockWithTxsResponse>): GetBlockWithTxsResponse;
    fromProtoMsg(message: GetBlockWithTxsResponseProtoMsg): GetBlockWithTxsResponse;
    toProto(message: GetBlockWithTxsResponse): Uint8Array;
    toProtoMsg(message: GetBlockWithTxsResponse): GetBlockWithTxsResponseProtoMsg;
};
