import { Any, type AnySDKType } from '../../../../google/protobuf/any.js';
import { Event, type EventSDKType } from '../../../../tendermint/abci/types.js';
import { BinaryReader, BinaryWriter } from '../../../../binary.js';
import { type JsonSafe } from '../../../../json-safe.js';
/**
 * TxResponse defines a structure containing relevant tx data and metadata. The
 * tags are stringified and the log is JSON decoded.
 */
export interface TxResponse {
    /** The block height */
    height: bigint;
    /** The transaction hash. */
    txhash: string;
    /** Namespace for the Code */
    codespace: string;
    /** Response code. */
    code: number;
    /** Result bytes, if any. */
    data: string;
    /**
     * The output of the application's logger (raw string). May be
     * non-deterministic.
     */
    rawLog: string;
    /** The output of the application's logger (typed). May be non-deterministic. */
    logs: ABCIMessageLog[];
    /** Additional information. May be non-deterministic. */
    info: string;
    /** Amount of gas requested for transaction. */
    gasWanted: bigint;
    /** Amount of gas consumed by transaction. */
    gasUsed: bigint;
    /** The request transaction bytes. */
    tx?: Any;
    /**
     * Time of the previous block. For heights > 1, it's the weighted median of
     * the timestamps of the valid votes in the block.LastCommit. For height == 1,
     * it's genesis time.
     */
    timestamp: string;
    /**
     * Events defines all the events emitted by processing a transaction. Note,
     * these events include those emitted by processing all the messages and those
     * emitted from the ante. Whereas Logs contains the events, with
     * additional metadata, emitted only by processing the messages.
     *
     * Since: cosmos-sdk 0.42.11, 0.44.5, 0.45
     */
    events: Event[];
}
export interface TxResponseProtoMsg {
    typeUrl: '/cosmos.base.abci.v1beta1.TxResponse';
    value: Uint8Array;
}
/**
 * TxResponse defines a structure containing relevant tx data and metadata. The
 * tags are stringified and the log is JSON decoded.
 */
export interface TxResponseSDKType {
    height: bigint;
    txhash: string;
    codespace: string;
    code: number;
    data: string;
    raw_log: string;
    logs: ABCIMessageLogSDKType[];
    info: string;
    gas_wanted: bigint;
    gas_used: bigint;
    tx?: AnySDKType;
    timestamp: string;
    events: EventSDKType[];
}
/** ABCIMessageLog defines a structure containing an indexed tx ABCI message log. */
export interface ABCIMessageLog {
    msgIndex: number;
    log: string;
    /**
     * Events contains a slice of Event objects that were emitted during some
     * execution.
     */
    events: StringEvent[];
}
export interface ABCIMessageLogProtoMsg {
    typeUrl: '/cosmos.base.abci.v1beta1.ABCIMessageLog';
    value: Uint8Array;
}
/** ABCIMessageLog defines a structure containing an indexed tx ABCI message log. */
export interface ABCIMessageLogSDKType {
    msg_index: number;
    log: string;
    events: StringEventSDKType[];
}
/**
 * StringEvent defines en Event object wrapper where all the attributes
 * contain key/value pairs that are strings instead of raw bytes.
 */
export interface StringEvent {
    type: string;
    attributes: Attribute[];
}
export interface StringEventProtoMsg {
    typeUrl: '/cosmos.base.abci.v1beta1.StringEvent';
    value: Uint8Array;
}
/**
 * StringEvent defines en Event object wrapper where all the attributes
 * contain key/value pairs that are strings instead of raw bytes.
 */
export interface StringEventSDKType {
    type: string;
    attributes: AttributeSDKType[];
}
/**
 * Attribute defines an attribute wrapper where the key and value are
 * strings instead of raw bytes.
 */
export interface Attribute {
    key: string;
    value: string;
}
export interface AttributeProtoMsg {
    typeUrl: '/cosmos.base.abci.v1beta1.Attribute';
    value: Uint8Array;
}
/**
 * Attribute defines an attribute wrapper where the key and value are
 * strings instead of raw bytes.
 */
export interface AttributeSDKType {
    key: string;
    value: string;
}
/** GasInfo defines tx execution gas context. */
export interface GasInfo {
    /** GasWanted is the maximum units of work we allow this tx to perform. */
    gasWanted: bigint;
    /** GasUsed is the amount of gas actually consumed. */
    gasUsed: bigint;
}
export interface GasInfoProtoMsg {
    typeUrl: '/cosmos.base.abci.v1beta1.GasInfo';
    value: Uint8Array;
}
/** GasInfo defines tx execution gas context. */
export interface GasInfoSDKType {
    gas_wanted: bigint;
    gas_used: bigint;
}
/** Result is the union of ResponseFormat and ResponseCheckTx. */
export interface Result {
    /**
     * Data is any data returned from message or handler execution. It MUST be
     * length prefixed in order to separate data from multiple message executions.
     * Deprecated. This field is still populated, but prefer msg_response instead
     * because it also contains the Msg response typeURL.
     */
    /** @deprecated */
    data: Uint8Array;
    /** Log contains the log information from message or handler execution. */
    log: string;
    /**
     * Events contains a slice of Event objects that were emitted during message
     * or handler execution.
     */
    events: Event[];
    /**
     * msg_responses contains the Msg handler responses type packed in Anys.
     *
     * Since: cosmos-sdk 0.46
     */
    msgResponses: Any[];
}
export interface ResultProtoMsg {
    typeUrl: '/cosmos.base.abci.v1beta1.Result';
    value: Uint8Array;
}
/** Result is the union of ResponseFormat and ResponseCheckTx. */
export interface ResultSDKType {
    /** @deprecated */
    data: Uint8Array;
    log: string;
    events: EventSDKType[];
    msg_responses: AnySDKType[];
}
/**
 * SimulationResponse defines the response generated when a transaction is
 * successfully simulated.
 */
export interface SimulationResponse {
    gasInfo: GasInfo;
    result?: Result;
}
export interface SimulationResponseProtoMsg {
    typeUrl: '/cosmos.base.abci.v1beta1.SimulationResponse';
    value: Uint8Array;
}
/**
 * SimulationResponse defines the response generated when a transaction is
 * successfully simulated.
 */
export interface SimulationResponseSDKType {
    gas_info: GasInfoSDKType;
    result?: ResultSDKType;
}
/**
 * MsgData defines the data returned in a Result object during message
 * execution.
 */
/** @deprecated */
export interface MsgData {
    msgType: string;
    data: Uint8Array;
}
export interface MsgDataProtoMsg {
    typeUrl: '/cosmos.base.abci.v1beta1.MsgData';
    value: Uint8Array;
}
/**
 * MsgData defines the data returned in a Result object during message
 * execution.
 */
/** @deprecated */
export interface MsgDataSDKType {
    msg_type: string;
    data: Uint8Array;
}
/**
 * TxMsgData defines a list of MsgData. A transaction will have a MsgData object
 * for each message.
 */
export interface TxMsgData {
    /** data field is deprecated and not populated. */
    /** @deprecated */
    data: MsgData[];
    /**
     * msg_responses contains the Msg handler responses packed into Anys.
     *
     * Since: cosmos-sdk 0.46
     */
    msgResponses: Any[];
}
export interface TxMsgDataProtoMsg {
    typeUrl: '/cosmos.base.abci.v1beta1.TxMsgData';
    value: Uint8Array;
}
/**
 * TxMsgData defines a list of MsgData. A transaction will have a MsgData object
 * for each message.
 */
export interface TxMsgDataSDKType {
    /** @deprecated */
    data: MsgDataSDKType[];
    msg_responses: AnySDKType[];
}
/** SearchTxsResult defines a structure for querying txs pageable */
export interface SearchTxsResult {
    /** Count of all txs */
    totalCount: bigint;
    /** Count of txs in current page */
    count: bigint;
    /** Index of current page, start from 1 */
    pageNumber: bigint;
    /** Count of total pages */
    pageTotal: bigint;
    /** Max count txs per page */
    limit: bigint;
    /** List of txs in current page */
    txs: TxResponse[];
}
export interface SearchTxsResultProtoMsg {
    typeUrl: '/cosmos.base.abci.v1beta1.SearchTxsResult';
    value: Uint8Array;
}
/** SearchTxsResult defines a structure for querying txs pageable */
export interface SearchTxsResultSDKType {
    total_count: bigint;
    count: bigint;
    page_number: bigint;
    page_total: bigint;
    limit: bigint;
    txs: TxResponseSDKType[];
}
export declare const TxResponse: {
    typeUrl: string;
    encode(message: TxResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): TxResponse;
    fromJSON(object: any): TxResponse;
    toJSON(message: TxResponse): JsonSafe<TxResponse>;
    fromPartial(object: Partial<TxResponse>): TxResponse;
    fromProtoMsg(message: TxResponseProtoMsg): TxResponse;
    toProto(message: TxResponse): Uint8Array;
    toProtoMsg(message: TxResponse): TxResponseProtoMsg;
};
export declare const ABCIMessageLog: {
    typeUrl: string;
    encode(message: ABCIMessageLog, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): ABCIMessageLog;
    fromJSON(object: any): ABCIMessageLog;
    toJSON(message: ABCIMessageLog): JsonSafe<ABCIMessageLog>;
    fromPartial(object: Partial<ABCIMessageLog>): ABCIMessageLog;
    fromProtoMsg(message: ABCIMessageLogProtoMsg): ABCIMessageLog;
    toProto(message: ABCIMessageLog): Uint8Array;
    toProtoMsg(message: ABCIMessageLog): ABCIMessageLogProtoMsg;
};
export declare const StringEvent: {
    typeUrl: string;
    encode(message: StringEvent, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): StringEvent;
    fromJSON(object: any): StringEvent;
    toJSON(message: StringEvent): JsonSafe<StringEvent>;
    fromPartial(object: Partial<StringEvent>): StringEvent;
    fromProtoMsg(message: StringEventProtoMsg): StringEvent;
    toProto(message: StringEvent): Uint8Array;
    toProtoMsg(message: StringEvent): StringEventProtoMsg;
};
export declare const Attribute: {
    typeUrl: string;
    encode(message: Attribute, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): Attribute;
    fromJSON(object: any): Attribute;
    toJSON(message: Attribute): JsonSafe<Attribute>;
    fromPartial(object: Partial<Attribute>): Attribute;
    fromProtoMsg(message: AttributeProtoMsg): Attribute;
    toProto(message: Attribute): Uint8Array;
    toProtoMsg(message: Attribute): AttributeProtoMsg;
};
export declare const GasInfo: {
    typeUrl: string;
    encode(message: GasInfo, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): GasInfo;
    fromJSON(object: any): GasInfo;
    toJSON(message: GasInfo): JsonSafe<GasInfo>;
    fromPartial(object: Partial<GasInfo>): GasInfo;
    fromProtoMsg(message: GasInfoProtoMsg): GasInfo;
    toProto(message: GasInfo): Uint8Array;
    toProtoMsg(message: GasInfo): GasInfoProtoMsg;
};
export declare const Result: {
    typeUrl: string;
    encode(message: Result, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): Result;
    fromJSON(object: any): Result;
    toJSON(message: Result): JsonSafe<Result>;
    fromPartial(object: Partial<Result>): Result;
    fromProtoMsg(message: ResultProtoMsg): Result;
    toProto(message: Result): Uint8Array;
    toProtoMsg(message: Result): ResultProtoMsg;
};
export declare const SimulationResponse: {
    typeUrl: string;
    encode(message: SimulationResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): SimulationResponse;
    fromJSON(object: any): SimulationResponse;
    toJSON(message: SimulationResponse): JsonSafe<SimulationResponse>;
    fromPartial(object: Partial<SimulationResponse>): SimulationResponse;
    fromProtoMsg(message: SimulationResponseProtoMsg): SimulationResponse;
    toProto(message: SimulationResponse): Uint8Array;
    toProtoMsg(message: SimulationResponse): SimulationResponseProtoMsg;
};
export declare const MsgData: {
    typeUrl: string;
    encode(message: MsgData, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgData;
    fromJSON(object: any): MsgData;
    toJSON(message: MsgData): JsonSafe<MsgData>;
    fromPartial(object: Partial<MsgData>): MsgData;
    fromProtoMsg(message: MsgDataProtoMsg): MsgData;
    toProto(message: MsgData): Uint8Array;
    toProtoMsg(message: MsgData): MsgDataProtoMsg;
};
export declare const TxMsgData: {
    typeUrl: string;
    encode(message: TxMsgData, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): TxMsgData;
    fromJSON(object: any): TxMsgData;
    toJSON(message: TxMsgData): JsonSafe<TxMsgData>;
    fromPartial(object: Partial<TxMsgData>): TxMsgData;
    fromProtoMsg(message: TxMsgDataProtoMsg): TxMsgData;
    toProto(message: TxMsgData): Uint8Array;
    toProtoMsg(message: TxMsgData): TxMsgDataProtoMsg;
};
export declare const SearchTxsResult: {
    typeUrl: string;
    encode(message: SearchTxsResult, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): SearchTxsResult;
    fromJSON(object: any): SearchTxsResult;
    toJSON(message: SearchTxsResult): JsonSafe<SearchTxsResult>;
    fromPartial(object: Partial<SearchTxsResult>): SearchTxsResult;
    fromProtoMsg(message: SearchTxsResultProtoMsg): SearchTxsResult;
    toProto(message: SearchTxsResult): Uint8Array;
    toProtoMsg(message: SearchTxsResult): SearchTxsResultProtoMsg;
};
