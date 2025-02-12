//@ts-nocheck
import { Tx } from './tx.js';
import { PageRequest, PageResponse, } from '../../base/query/v1beta1/pagination.js';
import { TxResponse, GasInfo, Result, } from '../../base/abci/v1beta1/abci.js';
import { BlockID, } from '../../../tendermint/types/types.js';
import { Block } from '../../../tendermint/types/block.js';
import { BinaryReader, BinaryWriter } from '../../../binary.js';
import { isSet, bytesFromBase64, base64FromBytes } from '../../../helpers.js';
import {} from '../../../json-safe.js';
/** OrderBy defines the sorting order */
export var OrderBy;
(function (OrderBy) {
    /** ORDER_BY_UNSPECIFIED - ORDER_BY_UNSPECIFIED specifies an unknown sorting order. OrderBy defaults to ASC in this case. */
    OrderBy[OrderBy["ORDER_BY_UNSPECIFIED"] = 0] = "ORDER_BY_UNSPECIFIED";
    /** ORDER_BY_ASC - ORDER_BY_ASC defines ascending order */
    OrderBy[OrderBy["ORDER_BY_ASC"] = 1] = "ORDER_BY_ASC";
    /** ORDER_BY_DESC - ORDER_BY_DESC defines descending order */
    OrderBy[OrderBy["ORDER_BY_DESC"] = 2] = "ORDER_BY_DESC";
    OrderBy[OrderBy["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
})(OrderBy || (OrderBy = {}));
export const OrderBySDKType = OrderBy;
export function orderByFromJSON(object) {
    switch (object) {
        case 0:
        case 'ORDER_BY_UNSPECIFIED':
            return OrderBy.ORDER_BY_UNSPECIFIED;
        case 1:
        case 'ORDER_BY_ASC':
            return OrderBy.ORDER_BY_ASC;
        case 2:
        case 'ORDER_BY_DESC':
            return OrderBy.ORDER_BY_DESC;
        case -1:
        case 'UNRECOGNIZED':
        default:
            return OrderBy.UNRECOGNIZED;
    }
}
export function orderByToJSON(object) {
    switch (object) {
        case OrderBy.ORDER_BY_UNSPECIFIED:
            return 'ORDER_BY_UNSPECIFIED';
        case OrderBy.ORDER_BY_ASC:
            return 'ORDER_BY_ASC';
        case OrderBy.ORDER_BY_DESC:
            return 'ORDER_BY_DESC';
        case OrderBy.UNRECOGNIZED:
        default:
            return 'UNRECOGNIZED';
    }
}
/** BroadcastMode specifies the broadcast mode for the TxService.Broadcast RPC method. */
export var BroadcastMode;
(function (BroadcastMode) {
    /** BROADCAST_MODE_UNSPECIFIED - zero-value for mode ordering */
    BroadcastMode[BroadcastMode["BROADCAST_MODE_UNSPECIFIED"] = 0] = "BROADCAST_MODE_UNSPECIFIED";
    /**
     * BROADCAST_MODE_BLOCK - BROADCAST_MODE_BLOCK defines a tx broadcasting mode where the client waits for
     * the tx to be committed in a block.
     */
    BroadcastMode[BroadcastMode["BROADCAST_MODE_BLOCK"] = 1] = "BROADCAST_MODE_BLOCK";
    /**
     * BROADCAST_MODE_SYNC - BROADCAST_MODE_SYNC defines a tx broadcasting mode where the client waits for
     * a CheckTx execution response only.
     */
    BroadcastMode[BroadcastMode["BROADCAST_MODE_SYNC"] = 2] = "BROADCAST_MODE_SYNC";
    /**
     * BROADCAST_MODE_ASYNC - BROADCAST_MODE_ASYNC defines a tx broadcasting mode where the client returns
     * immediately.
     */
    BroadcastMode[BroadcastMode["BROADCAST_MODE_ASYNC"] = 3] = "BROADCAST_MODE_ASYNC";
    BroadcastMode[BroadcastMode["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
})(BroadcastMode || (BroadcastMode = {}));
export const BroadcastModeSDKType = BroadcastMode;
export function broadcastModeFromJSON(object) {
    switch (object) {
        case 0:
        case 'BROADCAST_MODE_UNSPECIFIED':
            return BroadcastMode.BROADCAST_MODE_UNSPECIFIED;
        case 1:
        case 'BROADCAST_MODE_BLOCK':
            return BroadcastMode.BROADCAST_MODE_BLOCK;
        case 2:
        case 'BROADCAST_MODE_SYNC':
            return BroadcastMode.BROADCAST_MODE_SYNC;
        case 3:
        case 'BROADCAST_MODE_ASYNC':
            return BroadcastMode.BROADCAST_MODE_ASYNC;
        case -1:
        case 'UNRECOGNIZED':
        default:
            return BroadcastMode.UNRECOGNIZED;
    }
}
export function broadcastModeToJSON(object) {
    switch (object) {
        case BroadcastMode.BROADCAST_MODE_UNSPECIFIED:
            return 'BROADCAST_MODE_UNSPECIFIED';
        case BroadcastMode.BROADCAST_MODE_BLOCK:
            return 'BROADCAST_MODE_BLOCK';
        case BroadcastMode.BROADCAST_MODE_SYNC:
            return 'BROADCAST_MODE_SYNC';
        case BroadcastMode.BROADCAST_MODE_ASYNC:
            return 'BROADCAST_MODE_ASYNC';
        case BroadcastMode.UNRECOGNIZED:
        default:
            return 'UNRECOGNIZED';
    }
}
function createBaseGetTxsEventRequest() {
    return {
        events: [],
        pagination: undefined,
        orderBy: 0,
        page: BigInt(0),
        limit: BigInt(0),
    };
}
export const GetTxsEventRequest = {
    typeUrl: '/cosmos.tx.v1beta1.GetTxsEventRequest',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.events) {
            writer.uint32(10).string(v);
        }
        if (message.pagination !== undefined) {
            PageRequest.encode(message.pagination, writer.uint32(18).fork()).ldelim();
        }
        if (message.orderBy !== 0) {
            writer.uint32(24).int32(message.orderBy);
        }
        if (message.page !== BigInt(0)) {
            writer.uint32(32).uint64(message.page);
        }
        if (message.limit !== BigInt(0)) {
            writer.uint32(40).uint64(message.limit);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseGetTxsEventRequest();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.events.push(reader.string());
                    break;
                case 2:
                    message.pagination = PageRequest.decode(reader, reader.uint32());
                    break;
                case 3:
                    message.orderBy = reader.int32();
                    break;
                case 4:
                    message.page = reader.uint64();
                    break;
                case 5:
                    message.limit = reader.uint64();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON(object) {
        return {
            events: Array.isArray(object?.events)
                ? object.events.map((e) => String(e))
                : [],
            pagination: isSet(object.pagination)
                ? PageRequest.fromJSON(object.pagination)
                : undefined,
            orderBy: isSet(object.orderBy) ? orderByFromJSON(object.orderBy) : -1,
            page: isSet(object.page) ? BigInt(object.page.toString()) : BigInt(0),
            limit: isSet(object.limit) ? BigInt(object.limit.toString()) : BigInt(0),
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.events) {
            obj.events = message.events.map(e => e);
        }
        else {
            obj.events = [];
        }
        message.pagination !== undefined &&
            (obj.pagination = message.pagination
                ? PageRequest.toJSON(message.pagination)
                : undefined);
        message.orderBy !== undefined &&
            (obj.orderBy = orderByToJSON(message.orderBy));
        message.page !== undefined &&
            (obj.page = (message.page || BigInt(0)).toString());
        message.limit !== undefined &&
            (obj.limit = (message.limit || BigInt(0)).toString());
        return obj;
    },
    fromPartial(object) {
        const message = createBaseGetTxsEventRequest();
        message.events = object.events?.map(e => e) || [];
        message.pagination =
            object.pagination !== undefined && object.pagination !== null
                ? PageRequest.fromPartial(object.pagination)
                : undefined;
        message.orderBy = object.orderBy ?? 0;
        message.page =
            object.page !== undefined && object.page !== null
                ? BigInt(object.page.toString())
                : BigInt(0);
        message.limit =
            object.limit !== undefined && object.limit !== null
                ? BigInt(object.limit.toString())
                : BigInt(0);
        return message;
    },
    fromProtoMsg(message) {
        return GetTxsEventRequest.decode(message.value);
    },
    toProto(message) {
        return GetTxsEventRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.tx.v1beta1.GetTxsEventRequest',
            value: GetTxsEventRequest.encode(message).finish(),
        };
    },
};
function createBaseGetTxsEventResponse() {
    return {
        txs: [],
        txResponses: [],
        pagination: undefined,
        total: BigInt(0),
    };
}
export const GetTxsEventResponse = {
    typeUrl: '/cosmos.tx.v1beta1.GetTxsEventResponse',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.txs) {
            Tx.encode(v, writer.uint32(10).fork()).ldelim();
        }
        for (const v of message.txResponses) {
            TxResponse.encode(v, writer.uint32(18).fork()).ldelim();
        }
        if (message.pagination !== undefined) {
            PageResponse.encode(message.pagination, writer.uint32(26).fork()).ldelim();
        }
        if (message.total !== BigInt(0)) {
            writer.uint32(32).uint64(message.total);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseGetTxsEventResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.txs.push(Tx.decode(reader, reader.uint32()));
                    break;
                case 2:
                    message.txResponses.push(TxResponse.decode(reader, reader.uint32()));
                    break;
                case 3:
                    message.pagination = PageResponse.decode(reader, reader.uint32());
                    break;
                case 4:
                    message.total = reader.uint64();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON(object) {
        return {
            txs: Array.isArray(object?.txs)
                ? object.txs.map((e) => Tx.fromJSON(e))
                : [],
            txResponses: Array.isArray(object?.txResponses)
                ? object.txResponses.map((e) => TxResponse.fromJSON(e))
                : [],
            pagination: isSet(object.pagination)
                ? PageResponse.fromJSON(object.pagination)
                : undefined,
            total: isSet(object.total) ? BigInt(object.total.toString()) : BigInt(0),
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.txs) {
            obj.txs = message.txs.map(e => (e ? Tx.toJSON(e) : undefined));
        }
        else {
            obj.txs = [];
        }
        if (message.txResponses) {
            obj.txResponses = message.txResponses.map(e => e ? TxResponse.toJSON(e) : undefined);
        }
        else {
            obj.txResponses = [];
        }
        message.pagination !== undefined &&
            (obj.pagination = message.pagination
                ? PageResponse.toJSON(message.pagination)
                : undefined);
        message.total !== undefined &&
            (obj.total = (message.total || BigInt(0)).toString());
        return obj;
    },
    fromPartial(object) {
        const message = createBaseGetTxsEventResponse();
        message.txs = object.txs?.map(e => Tx.fromPartial(e)) || [];
        message.txResponses =
            object.txResponses?.map(e => TxResponse.fromPartial(e)) || [];
        message.pagination =
            object.pagination !== undefined && object.pagination !== null
                ? PageResponse.fromPartial(object.pagination)
                : undefined;
        message.total =
            object.total !== undefined && object.total !== null
                ? BigInt(object.total.toString())
                : BigInt(0);
        return message;
    },
    fromProtoMsg(message) {
        return GetTxsEventResponse.decode(message.value);
    },
    toProto(message) {
        return GetTxsEventResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.tx.v1beta1.GetTxsEventResponse',
            value: GetTxsEventResponse.encode(message).finish(),
        };
    },
};
function createBaseBroadcastTxRequest() {
    return {
        txBytes: new Uint8Array(),
        mode: 0,
    };
}
export const BroadcastTxRequest = {
    typeUrl: '/cosmos.tx.v1beta1.BroadcastTxRequest',
    encode(message, writer = BinaryWriter.create()) {
        if (message.txBytes.length !== 0) {
            writer.uint32(10).bytes(message.txBytes);
        }
        if (message.mode !== 0) {
            writer.uint32(16).int32(message.mode);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseBroadcastTxRequest();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.txBytes = reader.bytes();
                    break;
                case 2:
                    message.mode = reader.int32();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON(object) {
        return {
            txBytes: isSet(object.txBytes)
                ? bytesFromBase64(object.txBytes)
                : new Uint8Array(),
            mode: isSet(object.mode) ? broadcastModeFromJSON(object.mode) : -1,
        };
    },
    toJSON(message) {
        const obj = {};
        message.txBytes !== undefined &&
            (obj.txBytes = base64FromBytes(message.txBytes !== undefined ? message.txBytes : new Uint8Array()));
        message.mode !== undefined &&
            (obj.mode = broadcastModeToJSON(message.mode));
        return obj;
    },
    fromPartial(object) {
        const message = createBaseBroadcastTxRequest();
        message.txBytes = object.txBytes ?? new Uint8Array();
        message.mode = object.mode ?? 0;
        return message;
    },
    fromProtoMsg(message) {
        return BroadcastTxRequest.decode(message.value);
    },
    toProto(message) {
        return BroadcastTxRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.tx.v1beta1.BroadcastTxRequest',
            value: BroadcastTxRequest.encode(message).finish(),
        };
    },
};
function createBaseBroadcastTxResponse() {
    return {
        txResponse: undefined,
    };
}
export const BroadcastTxResponse = {
    typeUrl: '/cosmos.tx.v1beta1.BroadcastTxResponse',
    encode(message, writer = BinaryWriter.create()) {
        if (message.txResponse !== undefined) {
            TxResponse.encode(message.txResponse, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseBroadcastTxResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.txResponse = TxResponse.decode(reader, reader.uint32());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON(object) {
        return {
            txResponse: isSet(object.txResponse)
                ? TxResponse.fromJSON(object.txResponse)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.txResponse !== undefined &&
            (obj.txResponse = message.txResponse
                ? TxResponse.toJSON(message.txResponse)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseBroadcastTxResponse();
        message.txResponse =
            object.txResponse !== undefined && object.txResponse !== null
                ? TxResponse.fromPartial(object.txResponse)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return BroadcastTxResponse.decode(message.value);
    },
    toProto(message) {
        return BroadcastTxResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.tx.v1beta1.BroadcastTxResponse',
            value: BroadcastTxResponse.encode(message).finish(),
        };
    },
};
function createBaseSimulateRequest() {
    return {
        tx: undefined,
        txBytes: new Uint8Array(),
    };
}
export const SimulateRequest = {
    typeUrl: '/cosmos.tx.v1beta1.SimulateRequest',
    encode(message, writer = BinaryWriter.create()) {
        if (message.tx !== undefined) {
            Tx.encode(message.tx, writer.uint32(10).fork()).ldelim();
        }
        if (message.txBytes.length !== 0) {
            writer.uint32(18).bytes(message.txBytes);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseSimulateRequest();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.tx = Tx.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.txBytes = reader.bytes();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON(object) {
        return {
            tx: isSet(object.tx) ? Tx.fromJSON(object.tx) : undefined,
            txBytes: isSet(object.txBytes)
                ? bytesFromBase64(object.txBytes)
                : new Uint8Array(),
        };
    },
    toJSON(message) {
        const obj = {};
        message.tx !== undefined &&
            (obj.tx = message.tx ? Tx.toJSON(message.tx) : undefined);
        message.txBytes !== undefined &&
            (obj.txBytes = base64FromBytes(message.txBytes !== undefined ? message.txBytes : new Uint8Array()));
        return obj;
    },
    fromPartial(object) {
        const message = createBaseSimulateRequest();
        message.tx =
            object.tx !== undefined && object.tx !== null
                ? Tx.fromPartial(object.tx)
                : undefined;
        message.txBytes = object.txBytes ?? new Uint8Array();
        return message;
    },
    fromProtoMsg(message) {
        return SimulateRequest.decode(message.value);
    },
    toProto(message) {
        return SimulateRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.tx.v1beta1.SimulateRequest',
            value: SimulateRequest.encode(message).finish(),
        };
    },
};
function createBaseSimulateResponse() {
    return {
        gasInfo: undefined,
        result: undefined,
    };
}
export const SimulateResponse = {
    typeUrl: '/cosmos.tx.v1beta1.SimulateResponse',
    encode(message, writer = BinaryWriter.create()) {
        if (message.gasInfo !== undefined) {
            GasInfo.encode(message.gasInfo, writer.uint32(10).fork()).ldelim();
        }
        if (message.result !== undefined) {
            Result.encode(message.result, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseSimulateResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.gasInfo = GasInfo.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.result = Result.decode(reader, reader.uint32());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON(object) {
        return {
            gasInfo: isSet(object.gasInfo)
                ? GasInfo.fromJSON(object.gasInfo)
                : undefined,
            result: isSet(object.result) ? Result.fromJSON(object.result) : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.gasInfo !== undefined &&
            (obj.gasInfo = message.gasInfo
                ? GasInfo.toJSON(message.gasInfo)
                : undefined);
        message.result !== undefined &&
            (obj.result = message.result ? Result.toJSON(message.result) : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseSimulateResponse();
        message.gasInfo =
            object.gasInfo !== undefined && object.gasInfo !== null
                ? GasInfo.fromPartial(object.gasInfo)
                : undefined;
        message.result =
            object.result !== undefined && object.result !== null
                ? Result.fromPartial(object.result)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return SimulateResponse.decode(message.value);
    },
    toProto(message) {
        return SimulateResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.tx.v1beta1.SimulateResponse',
            value: SimulateResponse.encode(message).finish(),
        };
    },
};
function createBaseGetTxRequest() {
    return {
        hash: '',
    };
}
export const GetTxRequest = {
    typeUrl: '/cosmos.tx.v1beta1.GetTxRequest',
    encode(message, writer = BinaryWriter.create()) {
        if (message.hash !== '') {
            writer.uint32(10).string(message.hash);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseGetTxRequest();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.hash = reader.string();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON(object) {
        return {
            hash: isSet(object.hash) ? String(object.hash) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.hash !== undefined && (obj.hash = message.hash);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseGetTxRequest();
        message.hash = object.hash ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return GetTxRequest.decode(message.value);
    },
    toProto(message) {
        return GetTxRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.tx.v1beta1.GetTxRequest',
            value: GetTxRequest.encode(message).finish(),
        };
    },
};
function createBaseGetTxResponse() {
    return {
        tx: undefined,
        txResponse: undefined,
    };
}
export const GetTxResponse = {
    typeUrl: '/cosmos.tx.v1beta1.GetTxResponse',
    encode(message, writer = BinaryWriter.create()) {
        if (message.tx !== undefined) {
            Tx.encode(message.tx, writer.uint32(10).fork()).ldelim();
        }
        if (message.txResponse !== undefined) {
            TxResponse.encode(message.txResponse, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseGetTxResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.tx = Tx.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.txResponse = TxResponse.decode(reader, reader.uint32());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON(object) {
        return {
            tx: isSet(object.tx) ? Tx.fromJSON(object.tx) : undefined,
            txResponse: isSet(object.txResponse)
                ? TxResponse.fromJSON(object.txResponse)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.tx !== undefined &&
            (obj.tx = message.tx ? Tx.toJSON(message.tx) : undefined);
        message.txResponse !== undefined &&
            (obj.txResponse = message.txResponse
                ? TxResponse.toJSON(message.txResponse)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseGetTxResponse();
        message.tx =
            object.tx !== undefined && object.tx !== null
                ? Tx.fromPartial(object.tx)
                : undefined;
        message.txResponse =
            object.txResponse !== undefined && object.txResponse !== null
                ? TxResponse.fromPartial(object.txResponse)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return GetTxResponse.decode(message.value);
    },
    toProto(message) {
        return GetTxResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.tx.v1beta1.GetTxResponse',
            value: GetTxResponse.encode(message).finish(),
        };
    },
};
function createBaseGetBlockWithTxsRequest() {
    return {
        height: BigInt(0),
        pagination: undefined,
    };
}
export const GetBlockWithTxsRequest = {
    typeUrl: '/cosmos.tx.v1beta1.GetBlockWithTxsRequest',
    encode(message, writer = BinaryWriter.create()) {
        if (message.height !== BigInt(0)) {
            writer.uint32(8).int64(message.height);
        }
        if (message.pagination !== undefined) {
            PageRequest.encode(message.pagination, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseGetBlockWithTxsRequest();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.height = reader.int64();
                    break;
                case 2:
                    message.pagination = PageRequest.decode(reader, reader.uint32());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON(object) {
        return {
            height: isSet(object.height)
                ? BigInt(object.height.toString())
                : BigInt(0),
            pagination: isSet(object.pagination)
                ? PageRequest.fromJSON(object.pagination)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.height !== undefined &&
            (obj.height = (message.height || BigInt(0)).toString());
        message.pagination !== undefined &&
            (obj.pagination = message.pagination
                ? PageRequest.toJSON(message.pagination)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseGetBlockWithTxsRequest();
        message.height =
            object.height !== undefined && object.height !== null
                ? BigInt(object.height.toString())
                : BigInt(0);
        message.pagination =
            object.pagination !== undefined && object.pagination !== null
                ? PageRequest.fromPartial(object.pagination)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return GetBlockWithTxsRequest.decode(message.value);
    },
    toProto(message) {
        return GetBlockWithTxsRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.tx.v1beta1.GetBlockWithTxsRequest',
            value: GetBlockWithTxsRequest.encode(message).finish(),
        };
    },
};
function createBaseGetBlockWithTxsResponse() {
    return {
        txs: [],
        blockId: undefined,
        block: undefined,
        pagination: undefined,
    };
}
export const GetBlockWithTxsResponse = {
    typeUrl: '/cosmos.tx.v1beta1.GetBlockWithTxsResponse',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.txs) {
            Tx.encode(v, writer.uint32(10).fork()).ldelim();
        }
        if (message.blockId !== undefined) {
            BlockID.encode(message.blockId, writer.uint32(18).fork()).ldelim();
        }
        if (message.block !== undefined) {
            Block.encode(message.block, writer.uint32(26).fork()).ldelim();
        }
        if (message.pagination !== undefined) {
            PageResponse.encode(message.pagination, writer.uint32(34).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseGetBlockWithTxsResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.txs.push(Tx.decode(reader, reader.uint32()));
                    break;
                case 2:
                    message.blockId = BlockID.decode(reader, reader.uint32());
                    break;
                case 3:
                    message.block = Block.decode(reader, reader.uint32());
                    break;
                case 4:
                    message.pagination = PageResponse.decode(reader, reader.uint32());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON(object) {
        return {
            txs: Array.isArray(object?.txs)
                ? object.txs.map((e) => Tx.fromJSON(e))
                : [],
            blockId: isSet(object.blockId)
                ? BlockID.fromJSON(object.blockId)
                : undefined,
            block: isSet(object.block) ? Block.fromJSON(object.block) : undefined,
            pagination: isSet(object.pagination)
                ? PageResponse.fromJSON(object.pagination)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.txs) {
            obj.txs = message.txs.map(e => (e ? Tx.toJSON(e) : undefined));
        }
        else {
            obj.txs = [];
        }
        message.blockId !== undefined &&
            (obj.blockId = message.blockId
                ? BlockID.toJSON(message.blockId)
                : undefined);
        message.block !== undefined &&
            (obj.block = message.block ? Block.toJSON(message.block) : undefined);
        message.pagination !== undefined &&
            (obj.pagination = message.pagination
                ? PageResponse.toJSON(message.pagination)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseGetBlockWithTxsResponse();
        message.txs = object.txs?.map(e => Tx.fromPartial(e)) || [];
        message.blockId =
            object.blockId !== undefined && object.blockId !== null
                ? BlockID.fromPartial(object.blockId)
                : undefined;
        message.block =
            object.block !== undefined && object.block !== null
                ? Block.fromPartial(object.block)
                : undefined;
        message.pagination =
            object.pagination !== undefined && object.pagination !== null
                ? PageResponse.fromPartial(object.pagination)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return GetBlockWithTxsResponse.decode(message.value);
    },
    toProto(message) {
        return GetBlockWithTxsResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.tx.v1beta1.GetBlockWithTxsResponse',
            value: GetBlockWithTxsResponse.encode(message).finish(),
        };
    },
};
//# sourceMappingURL=service.js.map