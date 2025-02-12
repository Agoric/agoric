//@ts-nocheck
import { Timestamp, } from '../../google/protobuf/timestamp.js';
import { Header } from '../types/types.js';
import { ProofOps } from '../crypto/proof.js';
import { EvidenceParams, ValidatorParams, VersionParams, } from '../types/params.js';
import { PublicKey } from '../crypto/keys.js';
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { isSet, fromJsonTimestamp, bytesFromBase64, fromTimestamp, base64FromBytes, } from '../../helpers.js';
import {} from '../../json-safe.js';
export var CheckTxType;
(function (CheckTxType) {
    CheckTxType[CheckTxType["NEW"] = 0] = "NEW";
    CheckTxType[CheckTxType["RECHECK"] = 1] = "RECHECK";
    CheckTxType[CheckTxType["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
})(CheckTxType || (CheckTxType = {}));
export const CheckTxTypeSDKType = CheckTxType;
export function checkTxTypeFromJSON(object) {
    switch (object) {
        case 0:
        case 'NEW':
            return CheckTxType.NEW;
        case 1:
        case 'RECHECK':
            return CheckTxType.RECHECK;
        case -1:
        case 'UNRECOGNIZED':
        default:
            return CheckTxType.UNRECOGNIZED;
    }
}
export function checkTxTypeToJSON(object) {
    switch (object) {
        case CheckTxType.NEW:
            return 'NEW';
        case CheckTxType.RECHECK:
            return 'RECHECK';
        case CheckTxType.UNRECOGNIZED:
        default:
            return 'UNRECOGNIZED';
    }
}
export var ResponseOfferSnapshot_Result;
(function (ResponseOfferSnapshot_Result) {
    /** UNKNOWN - Unknown result, abort all snapshot restoration */
    ResponseOfferSnapshot_Result[ResponseOfferSnapshot_Result["UNKNOWN"] = 0] = "UNKNOWN";
    /** ACCEPT - Snapshot accepted, apply chunks */
    ResponseOfferSnapshot_Result[ResponseOfferSnapshot_Result["ACCEPT"] = 1] = "ACCEPT";
    /** ABORT - Abort all snapshot restoration */
    ResponseOfferSnapshot_Result[ResponseOfferSnapshot_Result["ABORT"] = 2] = "ABORT";
    /** REJECT - Reject this specific snapshot, try others */
    ResponseOfferSnapshot_Result[ResponseOfferSnapshot_Result["REJECT"] = 3] = "REJECT";
    /** REJECT_FORMAT - Reject all snapshots of this format, try others */
    ResponseOfferSnapshot_Result[ResponseOfferSnapshot_Result["REJECT_FORMAT"] = 4] = "REJECT_FORMAT";
    /** REJECT_SENDER - Reject all snapshots from the sender(s), try others */
    ResponseOfferSnapshot_Result[ResponseOfferSnapshot_Result["REJECT_SENDER"] = 5] = "REJECT_SENDER";
    ResponseOfferSnapshot_Result[ResponseOfferSnapshot_Result["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
})(ResponseOfferSnapshot_Result || (ResponseOfferSnapshot_Result = {}));
export const ResponseOfferSnapshot_ResultSDKType = ResponseOfferSnapshot_Result;
export function responseOfferSnapshot_ResultFromJSON(object) {
    switch (object) {
        case 0:
        case 'UNKNOWN':
            return ResponseOfferSnapshot_Result.UNKNOWN;
        case 1:
        case 'ACCEPT':
            return ResponseOfferSnapshot_Result.ACCEPT;
        case 2:
        case 'ABORT':
            return ResponseOfferSnapshot_Result.ABORT;
        case 3:
        case 'REJECT':
            return ResponseOfferSnapshot_Result.REJECT;
        case 4:
        case 'REJECT_FORMAT':
            return ResponseOfferSnapshot_Result.REJECT_FORMAT;
        case 5:
        case 'REJECT_SENDER':
            return ResponseOfferSnapshot_Result.REJECT_SENDER;
        case -1:
        case 'UNRECOGNIZED':
        default:
            return ResponseOfferSnapshot_Result.UNRECOGNIZED;
    }
}
export function responseOfferSnapshot_ResultToJSON(object) {
    switch (object) {
        case ResponseOfferSnapshot_Result.UNKNOWN:
            return 'UNKNOWN';
        case ResponseOfferSnapshot_Result.ACCEPT:
            return 'ACCEPT';
        case ResponseOfferSnapshot_Result.ABORT:
            return 'ABORT';
        case ResponseOfferSnapshot_Result.REJECT:
            return 'REJECT';
        case ResponseOfferSnapshot_Result.REJECT_FORMAT:
            return 'REJECT_FORMAT';
        case ResponseOfferSnapshot_Result.REJECT_SENDER:
            return 'REJECT_SENDER';
        case ResponseOfferSnapshot_Result.UNRECOGNIZED:
        default:
            return 'UNRECOGNIZED';
    }
}
export var ResponseApplySnapshotChunk_Result;
(function (ResponseApplySnapshotChunk_Result) {
    /** UNKNOWN - Unknown result, abort all snapshot restoration */
    ResponseApplySnapshotChunk_Result[ResponseApplySnapshotChunk_Result["UNKNOWN"] = 0] = "UNKNOWN";
    /** ACCEPT - Chunk successfully accepted */
    ResponseApplySnapshotChunk_Result[ResponseApplySnapshotChunk_Result["ACCEPT"] = 1] = "ACCEPT";
    /** ABORT - Abort all snapshot restoration */
    ResponseApplySnapshotChunk_Result[ResponseApplySnapshotChunk_Result["ABORT"] = 2] = "ABORT";
    /** RETRY - Retry chunk (combine with refetch and reject) */
    ResponseApplySnapshotChunk_Result[ResponseApplySnapshotChunk_Result["RETRY"] = 3] = "RETRY";
    /** RETRY_SNAPSHOT - Retry snapshot (combine with refetch and reject) */
    ResponseApplySnapshotChunk_Result[ResponseApplySnapshotChunk_Result["RETRY_SNAPSHOT"] = 4] = "RETRY_SNAPSHOT";
    /** REJECT_SNAPSHOT - Reject this snapshot, try others */
    ResponseApplySnapshotChunk_Result[ResponseApplySnapshotChunk_Result["REJECT_SNAPSHOT"] = 5] = "REJECT_SNAPSHOT";
    ResponseApplySnapshotChunk_Result[ResponseApplySnapshotChunk_Result["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
})(ResponseApplySnapshotChunk_Result || (ResponseApplySnapshotChunk_Result = {}));
export const ResponseApplySnapshotChunk_ResultSDKType = ResponseApplySnapshotChunk_Result;
export function responseApplySnapshotChunk_ResultFromJSON(object) {
    switch (object) {
        case 0:
        case 'UNKNOWN':
            return ResponseApplySnapshotChunk_Result.UNKNOWN;
        case 1:
        case 'ACCEPT':
            return ResponseApplySnapshotChunk_Result.ACCEPT;
        case 2:
        case 'ABORT':
            return ResponseApplySnapshotChunk_Result.ABORT;
        case 3:
        case 'RETRY':
            return ResponseApplySnapshotChunk_Result.RETRY;
        case 4:
        case 'RETRY_SNAPSHOT':
            return ResponseApplySnapshotChunk_Result.RETRY_SNAPSHOT;
        case 5:
        case 'REJECT_SNAPSHOT':
            return ResponseApplySnapshotChunk_Result.REJECT_SNAPSHOT;
        case -1:
        case 'UNRECOGNIZED':
        default:
            return ResponseApplySnapshotChunk_Result.UNRECOGNIZED;
    }
}
export function responseApplySnapshotChunk_ResultToJSON(object) {
    switch (object) {
        case ResponseApplySnapshotChunk_Result.UNKNOWN:
            return 'UNKNOWN';
        case ResponseApplySnapshotChunk_Result.ACCEPT:
            return 'ACCEPT';
        case ResponseApplySnapshotChunk_Result.ABORT:
            return 'ABORT';
        case ResponseApplySnapshotChunk_Result.RETRY:
            return 'RETRY';
        case ResponseApplySnapshotChunk_Result.RETRY_SNAPSHOT:
            return 'RETRY_SNAPSHOT';
        case ResponseApplySnapshotChunk_Result.REJECT_SNAPSHOT:
            return 'REJECT_SNAPSHOT';
        case ResponseApplySnapshotChunk_Result.UNRECOGNIZED:
        default:
            return 'UNRECOGNIZED';
    }
}
export var EvidenceType;
(function (EvidenceType) {
    EvidenceType[EvidenceType["UNKNOWN"] = 0] = "UNKNOWN";
    EvidenceType[EvidenceType["DUPLICATE_VOTE"] = 1] = "DUPLICATE_VOTE";
    EvidenceType[EvidenceType["LIGHT_CLIENT_ATTACK"] = 2] = "LIGHT_CLIENT_ATTACK";
    EvidenceType[EvidenceType["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
})(EvidenceType || (EvidenceType = {}));
export const EvidenceTypeSDKType = EvidenceType;
export function evidenceTypeFromJSON(object) {
    switch (object) {
        case 0:
        case 'UNKNOWN':
            return EvidenceType.UNKNOWN;
        case 1:
        case 'DUPLICATE_VOTE':
            return EvidenceType.DUPLICATE_VOTE;
        case 2:
        case 'LIGHT_CLIENT_ATTACK':
            return EvidenceType.LIGHT_CLIENT_ATTACK;
        case -1:
        case 'UNRECOGNIZED':
        default:
            return EvidenceType.UNRECOGNIZED;
    }
}
export function evidenceTypeToJSON(object) {
    switch (object) {
        case EvidenceType.UNKNOWN:
            return 'UNKNOWN';
        case EvidenceType.DUPLICATE_VOTE:
            return 'DUPLICATE_VOTE';
        case EvidenceType.LIGHT_CLIENT_ATTACK:
            return 'LIGHT_CLIENT_ATTACK';
        case EvidenceType.UNRECOGNIZED:
        default:
            return 'UNRECOGNIZED';
    }
}
function createBaseRequest() {
    return {
        echo: undefined,
        flush: undefined,
        info: undefined,
        setOption: undefined,
        initChain: undefined,
        query: undefined,
        beginBlock: undefined,
        checkTx: undefined,
        deliverTx: undefined,
        endBlock: undefined,
        commit: undefined,
        listSnapshots: undefined,
        offerSnapshot: undefined,
        loadSnapshotChunk: undefined,
        applySnapshotChunk: undefined,
    };
}
export const Request = {
    typeUrl: '/tendermint.abci.Request',
    encode(message, writer = BinaryWriter.create()) {
        if (message.echo !== undefined) {
            RequestEcho.encode(message.echo, writer.uint32(10).fork()).ldelim();
        }
        if (message.flush !== undefined) {
            RequestFlush.encode(message.flush, writer.uint32(18).fork()).ldelim();
        }
        if (message.info !== undefined) {
            RequestInfo.encode(message.info, writer.uint32(26).fork()).ldelim();
        }
        if (message.setOption !== undefined) {
            RequestSetOption.encode(message.setOption, writer.uint32(34).fork()).ldelim();
        }
        if (message.initChain !== undefined) {
            RequestInitChain.encode(message.initChain, writer.uint32(42).fork()).ldelim();
        }
        if (message.query !== undefined) {
            RequestQuery.encode(message.query, writer.uint32(50).fork()).ldelim();
        }
        if (message.beginBlock !== undefined) {
            RequestBeginBlock.encode(message.beginBlock, writer.uint32(58).fork()).ldelim();
        }
        if (message.checkTx !== undefined) {
            RequestCheckTx.encode(message.checkTx, writer.uint32(66).fork()).ldelim();
        }
        if (message.deliverTx !== undefined) {
            RequestDeliverTx.encode(message.deliverTx, writer.uint32(74).fork()).ldelim();
        }
        if (message.endBlock !== undefined) {
            RequestEndBlock.encode(message.endBlock, writer.uint32(82).fork()).ldelim();
        }
        if (message.commit !== undefined) {
            RequestCommit.encode(message.commit, writer.uint32(90).fork()).ldelim();
        }
        if (message.listSnapshots !== undefined) {
            RequestListSnapshots.encode(message.listSnapshots, writer.uint32(98).fork()).ldelim();
        }
        if (message.offerSnapshot !== undefined) {
            RequestOfferSnapshot.encode(message.offerSnapshot, writer.uint32(106).fork()).ldelim();
        }
        if (message.loadSnapshotChunk !== undefined) {
            RequestLoadSnapshotChunk.encode(message.loadSnapshotChunk, writer.uint32(114).fork()).ldelim();
        }
        if (message.applySnapshotChunk !== undefined) {
            RequestApplySnapshotChunk.encode(message.applySnapshotChunk, writer.uint32(122).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseRequest();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.echo = RequestEcho.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.flush = RequestFlush.decode(reader, reader.uint32());
                    break;
                case 3:
                    message.info = RequestInfo.decode(reader, reader.uint32());
                    break;
                case 4:
                    message.setOption = RequestSetOption.decode(reader, reader.uint32());
                    break;
                case 5:
                    message.initChain = RequestInitChain.decode(reader, reader.uint32());
                    break;
                case 6:
                    message.query = RequestQuery.decode(reader, reader.uint32());
                    break;
                case 7:
                    message.beginBlock = RequestBeginBlock.decode(reader, reader.uint32());
                    break;
                case 8:
                    message.checkTx = RequestCheckTx.decode(reader, reader.uint32());
                    break;
                case 9:
                    message.deliverTx = RequestDeliverTx.decode(reader, reader.uint32());
                    break;
                case 10:
                    message.endBlock = RequestEndBlock.decode(reader, reader.uint32());
                    break;
                case 11:
                    message.commit = RequestCommit.decode(reader, reader.uint32());
                    break;
                case 12:
                    message.listSnapshots = RequestListSnapshots.decode(reader, reader.uint32());
                    break;
                case 13:
                    message.offerSnapshot = RequestOfferSnapshot.decode(reader, reader.uint32());
                    break;
                case 14:
                    message.loadSnapshotChunk = RequestLoadSnapshotChunk.decode(reader, reader.uint32());
                    break;
                case 15:
                    message.applySnapshotChunk = RequestApplySnapshotChunk.decode(reader, reader.uint32());
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
            echo: isSet(object.echo) ? RequestEcho.fromJSON(object.echo) : undefined,
            flush: isSet(object.flush)
                ? RequestFlush.fromJSON(object.flush)
                : undefined,
            info: isSet(object.info) ? RequestInfo.fromJSON(object.info) : undefined,
            setOption: isSet(object.setOption)
                ? RequestSetOption.fromJSON(object.setOption)
                : undefined,
            initChain: isSet(object.initChain)
                ? RequestInitChain.fromJSON(object.initChain)
                : undefined,
            query: isSet(object.query)
                ? RequestQuery.fromJSON(object.query)
                : undefined,
            beginBlock: isSet(object.beginBlock)
                ? RequestBeginBlock.fromJSON(object.beginBlock)
                : undefined,
            checkTx: isSet(object.checkTx)
                ? RequestCheckTx.fromJSON(object.checkTx)
                : undefined,
            deliverTx: isSet(object.deliverTx)
                ? RequestDeliverTx.fromJSON(object.deliverTx)
                : undefined,
            endBlock: isSet(object.endBlock)
                ? RequestEndBlock.fromJSON(object.endBlock)
                : undefined,
            commit: isSet(object.commit)
                ? RequestCommit.fromJSON(object.commit)
                : undefined,
            listSnapshots: isSet(object.listSnapshots)
                ? RequestListSnapshots.fromJSON(object.listSnapshots)
                : undefined,
            offerSnapshot: isSet(object.offerSnapshot)
                ? RequestOfferSnapshot.fromJSON(object.offerSnapshot)
                : undefined,
            loadSnapshotChunk: isSet(object.loadSnapshotChunk)
                ? RequestLoadSnapshotChunk.fromJSON(object.loadSnapshotChunk)
                : undefined,
            applySnapshotChunk: isSet(object.applySnapshotChunk)
                ? RequestApplySnapshotChunk.fromJSON(object.applySnapshotChunk)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.echo !== undefined &&
            (obj.echo = message.echo ? RequestEcho.toJSON(message.echo) : undefined);
        message.flush !== undefined &&
            (obj.flush = message.flush
                ? RequestFlush.toJSON(message.flush)
                : undefined);
        message.info !== undefined &&
            (obj.info = message.info ? RequestInfo.toJSON(message.info) : undefined);
        message.setOption !== undefined &&
            (obj.setOption = message.setOption
                ? RequestSetOption.toJSON(message.setOption)
                : undefined);
        message.initChain !== undefined &&
            (obj.initChain = message.initChain
                ? RequestInitChain.toJSON(message.initChain)
                : undefined);
        message.query !== undefined &&
            (obj.query = message.query
                ? RequestQuery.toJSON(message.query)
                : undefined);
        message.beginBlock !== undefined &&
            (obj.beginBlock = message.beginBlock
                ? RequestBeginBlock.toJSON(message.beginBlock)
                : undefined);
        message.checkTx !== undefined &&
            (obj.checkTx = message.checkTx
                ? RequestCheckTx.toJSON(message.checkTx)
                : undefined);
        message.deliverTx !== undefined &&
            (obj.deliverTx = message.deliverTx
                ? RequestDeliverTx.toJSON(message.deliverTx)
                : undefined);
        message.endBlock !== undefined &&
            (obj.endBlock = message.endBlock
                ? RequestEndBlock.toJSON(message.endBlock)
                : undefined);
        message.commit !== undefined &&
            (obj.commit = message.commit
                ? RequestCommit.toJSON(message.commit)
                : undefined);
        message.listSnapshots !== undefined &&
            (obj.listSnapshots = message.listSnapshots
                ? RequestListSnapshots.toJSON(message.listSnapshots)
                : undefined);
        message.offerSnapshot !== undefined &&
            (obj.offerSnapshot = message.offerSnapshot
                ? RequestOfferSnapshot.toJSON(message.offerSnapshot)
                : undefined);
        message.loadSnapshotChunk !== undefined &&
            (obj.loadSnapshotChunk = message.loadSnapshotChunk
                ? RequestLoadSnapshotChunk.toJSON(message.loadSnapshotChunk)
                : undefined);
        message.applySnapshotChunk !== undefined &&
            (obj.applySnapshotChunk = message.applySnapshotChunk
                ? RequestApplySnapshotChunk.toJSON(message.applySnapshotChunk)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseRequest();
        message.echo =
            object.echo !== undefined && object.echo !== null
                ? RequestEcho.fromPartial(object.echo)
                : undefined;
        message.flush =
            object.flush !== undefined && object.flush !== null
                ? RequestFlush.fromPartial(object.flush)
                : undefined;
        message.info =
            object.info !== undefined && object.info !== null
                ? RequestInfo.fromPartial(object.info)
                : undefined;
        message.setOption =
            object.setOption !== undefined && object.setOption !== null
                ? RequestSetOption.fromPartial(object.setOption)
                : undefined;
        message.initChain =
            object.initChain !== undefined && object.initChain !== null
                ? RequestInitChain.fromPartial(object.initChain)
                : undefined;
        message.query =
            object.query !== undefined && object.query !== null
                ? RequestQuery.fromPartial(object.query)
                : undefined;
        message.beginBlock =
            object.beginBlock !== undefined && object.beginBlock !== null
                ? RequestBeginBlock.fromPartial(object.beginBlock)
                : undefined;
        message.checkTx =
            object.checkTx !== undefined && object.checkTx !== null
                ? RequestCheckTx.fromPartial(object.checkTx)
                : undefined;
        message.deliverTx =
            object.deliverTx !== undefined && object.deliverTx !== null
                ? RequestDeliverTx.fromPartial(object.deliverTx)
                : undefined;
        message.endBlock =
            object.endBlock !== undefined && object.endBlock !== null
                ? RequestEndBlock.fromPartial(object.endBlock)
                : undefined;
        message.commit =
            object.commit !== undefined && object.commit !== null
                ? RequestCommit.fromPartial(object.commit)
                : undefined;
        message.listSnapshots =
            object.listSnapshots !== undefined && object.listSnapshots !== null
                ? RequestListSnapshots.fromPartial(object.listSnapshots)
                : undefined;
        message.offerSnapshot =
            object.offerSnapshot !== undefined && object.offerSnapshot !== null
                ? RequestOfferSnapshot.fromPartial(object.offerSnapshot)
                : undefined;
        message.loadSnapshotChunk =
            object.loadSnapshotChunk !== undefined &&
                object.loadSnapshotChunk !== null
                ? RequestLoadSnapshotChunk.fromPartial(object.loadSnapshotChunk)
                : undefined;
        message.applySnapshotChunk =
            object.applySnapshotChunk !== undefined &&
                object.applySnapshotChunk !== null
                ? RequestApplySnapshotChunk.fromPartial(object.applySnapshotChunk)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return Request.decode(message.value);
    },
    toProto(message) {
        return Request.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/tendermint.abci.Request',
            value: Request.encode(message).finish(),
        };
    },
};
function createBaseRequestEcho() {
    return {
        message: '',
    };
}
export const RequestEcho = {
    typeUrl: '/tendermint.abci.RequestEcho',
    encode(message, writer = BinaryWriter.create()) {
        if (message.message !== '') {
            writer.uint32(10).string(message.message);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseRequestEcho();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.message = reader.string();
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
            message: isSet(object.message) ? String(object.message) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.message !== undefined && (obj.message = message.message);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseRequestEcho();
        message.message = object.message ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return RequestEcho.decode(message.value);
    },
    toProto(message) {
        return RequestEcho.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/tendermint.abci.RequestEcho',
            value: RequestEcho.encode(message).finish(),
        };
    },
};
function createBaseRequestFlush() {
    return {};
}
export const RequestFlush = {
    typeUrl: '/tendermint.abci.RequestFlush',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseRequestFlush();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON(_) {
        return {};
    },
    toJSON(_) {
        const obj = {};
        return obj;
    },
    fromPartial(_) {
        const message = createBaseRequestFlush();
        return message;
    },
    fromProtoMsg(message) {
        return RequestFlush.decode(message.value);
    },
    toProto(message) {
        return RequestFlush.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/tendermint.abci.RequestFlush',
            value: RequestFlush.encode(message).finish(),
        };
    },
};
function createBaseRequestInfo() {
    return {
        version: '',
        blockVersion: BigInt(0),
        p2pVersion: BigInt(0),
    };
}
export const RequestInfo = {
    typeUrl: '/tendermint.abci.RequestInfo',
    encode(message, writer = BinaryWriter.create()) {
        if (message.version !== '') {
            writer.uint32(10).string(message.version);
        }
        if (message.blockVersion !== BigInt(0)) {
            writer.uint32(16).uint64(message.blockVersion);
        }
        if (message.p2pVersion !== BigInt(0)) {
            writer.uint32(24).uint64(message.p2pVersion);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseRequestInfo();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.version = reader.string();
                    break;
                case 2:
                    message.blockVersion = reader.uint64();
                    break;
                case 3:
                    message.p2pVersion = reader.uint64();
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
            version: isSet(object.version) ? String(object.version) : '',
            blockVersion: isSet(object.blockVersion)
                ? BigInt(object.blockVersion.toString())
                : BigInt(0),
            p2pVersion: isSet(object.p2pVersion)
                ? BigInt(object.p2pVersion.toString())
                : BigInt(0),
        };
    },
    toJSON(message) {
        const obj = {};
        message.version !== undefined && (obj.version = message.version);
        message.blockVersion !== undefined &&
            (obj.blockVersion = (message.blockVersion || BigInt(0)).toString());
        message.p2pVersion !== undefined &&
            (obj.p2pVersion = (message.p2pVersion || BigInt(0)).toString());
        return obj;
    },
    fromPartial(object) {
        const message = createBaseRequestInfo();
        message.version = object.version ?? '';
        message.blockVersion =
            object.blockVersion !== undefined && object.blockVersion !== null
                ? BigInt(object.blockVersion.toString())
                : BigInt(0);
        message.p2pVersion =
            object.p2pVersion !== undefined && object.p2pVersion !== null
                ? BigInt(object.p2pVersion.toString())
                : BigInt(0);
        return message;
    },
    fromProtoMsg(message) {
        return RequestInfo.decode(message.value);
    },
    toProto(message) {
        return RequestInfo.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/tendermint.abci.RequestInfo',
            value: RequestInfo.encode(message).finish(),
        };
    },
};
function createBaseRequestSetOption() {
    return {
        key: '',
        value: '',
    };
}
export const RequestSetOption = {
    typeUrl: '/tendermint.abci.RequestSetOption',
    encode(message, writer = BinaryWriter.create()) {
        if (message.key !== '') {
            writer.uint32(10).string(message.key);
        }
        if (message.value !== '') {
            writer.uint32(18).string(message.value);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseRequestSetOption();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.key = reader.string();
                    break;
                case 2:
                    message.value = reader.string();
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
            key: isSet(object.key) ? String(object.key) : '',
            value: isSet(object.value) ? String(object.value) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.key !== undefined && (obj.key = message.key);
        message.value !== undefined && (obj.value = message.value);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseRequestSetOption();
        message.key = object.key ?? '';
        message.value = object.value ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return RequestSetOption.decode(message.value);
    },
    toProto(message) {
        return RequestSetOption.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/tendermint.abci.RequestSetOption',
            value: RequestSetOption.encode(message).finish(),
        };
    },
};
function createBaseRequestInitChain() {
    return {
        time: Timestamp.fromPartial({}),
        chainId: '',
        consensusParams: undefined,
        validators: [],
        appStateBytes: new Uint8Array(),
        initialHeight: BigInt(0),
    };
}
export const RequestInitChain = {
    typeUrl: '/tendermint.abci.RequestInitChain',
    encode(message, writer = BinaryWriter.create()) {
        if (message.time !== undefined) {
            Timestamp.encode(message.time, writer.uint32(10).fork()).ldelim();
        }
        if (message.chainId !== '') {
            writer.uint32(18).string(message.chainId);
        }
        if (message.consensusParams !== undefined) {
            ConsensusParams.encode(message.consensusParams, writer.uint32(26).fork()).ldelim();
        }
        for (const v of message.validators) {
            ValidatorUpdate.encode(v, writer.uint32(34).fork()).ldelim();
        }
        if (message.appStateBytes.length !== 0) {
            writer.uint32(42).bytes(message.appStateBytes);
        }
        if (message.initialHeight !== BigInt(0)) {
            writer.uint32(48).int64(message.initialHeight);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseRequestInitChain();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.time = Timestamp.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.chainId = reader.string();
                    break;
                case 3:
                    message.consensusParams = ConsensusParams.decode(reader, reader.uint32());
                    break;
                case 4:
                    message.validators.push(ValidatorUpdate.decode(reader, reader.uint32()));
                    break;
                case 5:
                    message.appStateBytes = reader.bytes();
                    break;
                case 6:
                    message.initialHeight = reader.int64();
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
            time: isSet(object.time) ? fromJsonTimestamp(object.time) : undefined,
            chainId: isSet(object.chainId) ? String(object.chainId) : '',
            consensusParams: isSet(object.consensusParams)
                ? ConsensusParams.fromJSON(object.consensusParams)
                : undefined,
            validators: Array.isArray(object?.validators)
                ? object.validators.map((e) => ValidatorUpdate.fromJSON(e))
                : [],
            appStateBytes: isSet(object.appStateBytes)
                ? bytesFromBase64(object.appStateBytes)
                : new Uint8Array(),
            initialHeight: isSet(object.initialHeight)
                ? BigInt(object.initialHeight.toString())
                : BigInt(0),
        };
    },
    toJSON(message) {
        const obj = {};
        message.time !== undefined &&
            (obj.time = fromTimestamp(message.time).toISOString());
        message.chainId !== undefined && (obj.chainId = message.chainId);
        message.consensusParams !== undefined &&
            (obj.consensusParams = message.consensusParams
                ? ConsensusParams.toJSON(message.consensusParams)
                : undefined);
        if (message.validators) {
            obj.validators = message.validators.map(e => e ? ValidatorUpdate.toJSON(e) : undefined);
        }
        else {
            obj.validators = [];
        }
        message.appStateBytes !== undefined &&
            (obj.appStateBytes = base64FromBytes(message.appStateBytes !== undefined
                ? message.appStateBytes
                : new Uint8Array()));
        message.initialHeight !== undefined &&
            (obj.initialHeight = (message.initialHeight || BigInt(0)).toString());
        return obj;
    },
    fromPartial(object) {
        const message = createBaseRequestInitChain();
        message.time =
            object.time !== undefined && object.time !== null
                ? Timestamp.fromPartial(object.time)
                : undefined;
        message.chainId = object.chainId ?? '';
        message.consensusParams =
            object.consensusParams !== undefined && object.consensusParams !== null
                ? ConsensusParams.fromPartial(object.consensusParams)
                : undefined;
        message.validators =
            object.validators?.map(e => ValidatorUpdate.fromPartial(e)) || [];
        message.appStateBytes = object.appStateBytes ?? new Uint8Array();
        message.initialHeight =
            object.initialHeight !== undefined && object.initialHeight !== null
                ? BigInt(object.initialHeight.toString())
                : BigInt(0);
        return message;
    },
    fromProtoMsg(message) {
        return RequestInitChain.decode(message.value);
    },
    toProto(message) {
        return RequestInitChain.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/tendermint.abci.RequestInitChain',
            value: RequestInitChain.encode(message).finish(),
        };
    },
};
function createBaseRequestQuery() {
    return {
        data: new Uint8Array(),
        path: '',
        height: BigInt(0),
        prove: false,
    };
}
export const RequestQuery = {
    typeUrl: '/tendermint.abci.RequestQuery',
    encode(message, writer = BinaryWriter.create()) {
        if (message.data.length !== 0) {
            writer.uint32(10).bytes(message.data);
        }
        if (message.path !== '') {
            writer.uint32(18).string(message.path);
        }
        if (message.height !== BigInt(0)) {
            writer.uint32(24).int64(message.height);
        }
        if (message.prove === true) {
            writer.uint32(32).bool(message.prove);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseRequestQuery();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.data = reader.bytes();
                    break;
                case 2:
                    message.path = reader.string();
                    break;
                case 3:
                    message.height = reader.int64();
                    break;
                case 4:
                    message.prove = reader.bool();
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
            data: isSet(object.data)
                ? bytesFromBase64(object.data)
                : new Uint8Array(),
            path: isSet(object.path) ? String(object.path) : '',
            height: isSet(object.height)
                ? BigInt(object.height.toString())
                : BigInt(0),
            prove: isSet(object.prove) ? Boolean(object.prove) : false,
        };
    },
    toJSON(message) {
        const obj = {};
        message.data !== undefined &&
            (obj.data = base64FromBytes(message.data !== undefined ? message.data : new Uint8Array()));
        message.path !== undefined && (obj.path = message.path);
        message.height !== undefined &&
            (obj.height = (message.height || BigInt(0)).toString());
        message.prove !== undefined && (obj.prove = message.prove);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseRequestQuery();
        message.data = object.data ?? new Uint8Array();
        message.path = object.path ?? '';
        message.height =
            object.height !== undefined && object.height !== null
                ? BigInt(object.height.toString())
                : BigInt(0);
        message.prove = object.prove ?? false;
        return message;
    },
    fromProtoMsg(message) {
        return RequestQuery.decode(message.value);
    },
    toProto(message) {
        return RequestQuery.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/tendermint.abci.RequestQuery',
            value: RequestQuery.encode(message).finish(),
        };
    },
};
function createBaseRequestBeginBlock() {
    return {
        hash: new Uint8Array(),
        header: Header.fromPartial({}),
        lastCommitInfo: LastCommitInfo.fromPartial({}),
        byzantineValidators: [],
    };
}
export const RequestBeginBlock = {
    typeUrl: '/tendermint.abci.RequestBeginBlock',
    encode(message, writer = BinaryWriter.create()) {
        if (message.hash.length !== 0) {
            writer.uint32(10).bytes(message.hash);
        }
        if (message.header !== undefined) {
            Header.encode(message.header, writer.uint32(18).fork()).ldelim();
        }
        if (message.lastCommitInfo !== undefined) {
            LastCommitInfo.encode(message.lastCommitInfo, writer.uint32(26).fork()).ldelim();
        }
        for (const v of message.byzantineValidators) {
            Evidence.encode(v, writer.uint32(34).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseRequestBeginBlock();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.hash = reader.bytes();
                    break;
                case 2:
                    message.header = Header.decode(reader, reader.uint32());
                    break;
                case 3:
                    message.lastCommitInfo = LastCommitInfo.decode(reader, reader.uint32());
                    break;
                case 4:
                    message.byzantineValidators.push(Evidence.decode(reader, reader.uint32()));
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
            hash: isSet(object.hash)
                ? bytesFromBase64(object.hash)
                : new Uint8Array(),
            header: isSet(object.header) ? Header.fromJSON(object.header) : undefined,
            lastCommitInfo: isSet(object.lastCommitInfo)
                ? LastCommitInfo.fromJSON(object.lastCommitInfo)
                : undefined,
            byzantineValidators: Array.isArray(object?.byzantineValidators)
                ? object.byzantineValidators.map((e) => Evidence.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        message.hash !== undefined &&
            (obj.hash = base64FromBytes(message.hash !== undefined ? message.hash : new Uint8Array()));
        message.header !== undefined &&
            (obj.header = message.header ? Header.toJSON(message.header) : undefined);
        message.lastCommitInfo !== undefined &&
            (obj.lastCommitInfo = message.lastCommitInfo
                ? LastCommitInfo.toJSON(message.lastCommitInfo)
                : undefined);
        if (message.byzantineValidators) {
            obj.byzantineValidators = message.byzantineValidators.map(e => e ? Evidence.toJSON(e) : undefined);
        }
        else {
            obj.byzantineValidators = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseRequestBeginBlock();
        message.hash = object.hash ?? new Uint8Array();
        message.header =
            object.header !== undefined && object.header !== null
                ? Header.fromPartial(object.header)
                : undefined;
        message.lastCommitInfo =
            object.lastCommitInfo !== undefined && object.lastCommitInfo !== null
                ? LastCommitInfo.fromPartial(object.lastCommitInfo)
                : undefined;
        message.byzantineValidators =
            object.byzantineValidators?.map(e => Evidence.fromPartial(e)) || [];
        return message;
    },
    fromProtoMsg(message) {
        return RequestBeginBlock.decode(message.value);
    },
    toProto(message) {
        return RequestBeginBlock.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/tendermint.abci.RequestBeginBlock',
            value: RequestBeginBlock.encode(message).finish(),
        };
    },
};
function createBaseRequestCheckTx() {
    return {
        tx: new Uint8Array(),
        type: 0,
    };
}
export const RequestCheckTx = {
    typeUrl: '/tendermint.abci.RequestCheckTx',
    encode(message, writer = BinaryWriter.create()) {
        if (message.tx.length !== 0) {
            writer.uint32(10).bytes(message.tx);
        }
        if (message.type !== 0) {
            writer.uint32(16).int32(message.type);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseRequestCheckTx();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.tx = reader.bytes();
                    break;
                case 2:
                    message.type = reader.int32();
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
            tx: isSet(object.tx) ? bytesFromBase64(object.tx) : new Uint8Array(),
            type: isSet(object.type) ? checkTxTypeFromJSON(object.type) : -1,
        };
    },
    toJSON(message) {
        const obj = {};
        message.tx !== undefined &&
            (obj.tx = base64FromBytes(message.tx !== undefined ? message.tx : new Uint8Array()));
        message.type !== undefined && (obj.type = checkTxTypeToJSON(message.type));
        return obj;
    },
    fromPartial(object) {
        const message = createBaseRequestCheckTx();
        message.tx = object.tx ?? new Uint8Array();
        message.type = object.type ?? 0;
        return message;
    },
    fromProtoMsg(message) {
        return RequestCheckTx.decode(message.value);
    },
    toProto(message) {
        return RequestCheckTx.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/tendermint.abci.RequestCheckTx',
            value: RequestCheckTx.encode(message).finish(),
        };
    },
};
function createBaseRequestDeliverTx() {
    return {
        tx: new Uint8Array(),
    };
}
export const RequestDeliverTx = {
    typeUrl: '/tendermint.abci.RequestDeliverTx',
    encode(message, writer = BinaryWriter.create()) {
        if (message.tx.length !== 0) {
            writer.uint32(10).bytes(message.tx);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseRequestDeliverTx();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.tx = reader.bytes();
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
            tx: isSet(object.tx) ? bytesFromBase64(object.tx) : new Uint8Array(),
        };
    },
    toJSON(message) {
        const obj = {};
        message.tx !== undefined &&
            (obj.tx = base64FromBytes(message.tx !== undefined ? message.tx : new Uint8Array()));
        return obj;
    },
    fromPartial(object) {
        const message = createBaseRequestDeliverTx();
        message.tx = object.tx ?? new Uint8Array();
        return message;
    },
    fromProtoMsg(message) {
        return RequestDeliverTx.decode(message.value);
    },
    toProto(message) {
        return RequestDeliverTx.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/tendermint.abci.RequestDeliverTx',
            value: RequestDeliverTx.encode(message).finish(),
        };
    },
};
function createBaseRequestEndBlock() {
    return {
        height: BigInt(0),
    };
}
export const RequestEndBlock = {
    typeUrl: '/tendermint.abci.RequestEndBlock',
    encode(message, writer = BinaryWriter.create()) {
        if (message.height !== BigInt(0)) {
            writer.uint32(8).int64(message.height);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseRequestEndBlock();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.height = reader.int64();
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
        };
    },
    toJSON(message) {
        const obj = {};
        message.height !== undefined &&
            (obj.height = (message.height || BigInt(0)).toString());
        return obj;
    },
    fromPartial(object) {
        const message = createBaseRequestEndBlock();
        message.height =
            object.height !== undefined && object.height !== null
                ? BigInt(object.height.toString())
                : BigInt(0);
        return message;
    },
    fromProtoMsg(message) {
        return RequestEndBlock.decode(message.value);
    },
    toProto(message) {
        return RequestEndBlock.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/tendermint.abci.RequestEndBlock',
            value: RequestEndBlock.encode(message).finish(),
        };
    },
};
function createBaseRequestCommit() {
    return {};
}
export const RequestCommit = {
    typeUrl: '/tendermint.abci.RequestCommit',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseRequestCommit();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON(_) {
        return {};
    },
    toJSON(_) {
        const obj = {};
        return obj;
    },
    fromPartial(_) {
        const message = createBaseRequestCommit();
        return message;
    },
    fromProtoMsg(message) {
        return RequestCommit.decode(message.value);
    },
    toProto(message) {
        return RequestCommit.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/tendermint.abci.RequestCommit',
            value: RequestCommit.encode(message).finish(),
        };
    },
};
function createBaseRequestListSnapshots() {
    return {};
}
export const RequestListSnapshots = {
    typeUrl: '/tendermint.abci.RequestListSnapshots',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseRequestListSnapshots();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON(_) {
        return {};
    },
    toJSON(_) {
        const obj = {};
        return obj;
    },
    fromPartial(_) {
        const message = createBaseRequestListSnapshots();
        return message;
    },
    fromProtoMsg(message) {
        return RequestListSnapshots.decode(message.value);
    },
    toProto(message) {
        return RequestListSnapshots.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/tendermint.abci.RequestListSnapshots',
            value: RequestListSnapshots.encode(message).finish(),
        };
    },
};
function createBaseRequestOfferSnapshot() {
    return {
        snapshot: undefined,
        appHash: new Uint8Array(),
    };
}
export const RequestOfferSnapshot = {
    typeUrl: '/tendermint.abci.RequestOfferSnapshot',
    encode(message, writer = BinaryWriter.create()) {
        if (message.snapshot !== undefined) {
            Snapshot.encode(message.snapshot, writer.uint32(10).fork()).ldelim();
        }
        if (message.appHash.length !== 0) {
            writer.uint32(18).bytes(message.appHash);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseRequestOfferSnapshot();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.snapshot = Snapshot.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.appHash = reader.bytes();
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
            snapshot: isSet(object.snapshot)
                ? Snapshot.fromJSON(object.snapshot)
                : undefined,
            appHash: isSet(object.appHash)
                ? bytesFromBase64(object.appHash)
                : new Uint8Array(),
        };
    },
    toJSON(message) {
        const obj = {};
        message.snapshot !== undefined &&
            (obj.snapshot = message.snapshot
                ? Snapshot.toJSON(message.snapshot)
                : undefined);
        message.appHash !== undefined &&
            (obj.appHash = base64FromBytes(message.appHash !== undefined ? message.appHash : new Uint8Array()));
        return obj;
    },
    fromPartial(object) {
        const message = createBaseRequestOfferSnapshot();
        message.snapshot =
            object.snapshot !== undefined && object.snapshot !== null
                ? Snapshot.fromPartial(object.snapshot)
                : undefined;
        message.appHash = object.appHash ?? new Uint8Array();
        return message;
    },
    fromProtoMsg(message) {
        return RequestOfferSnapshot.decode(message.value);
    },
    toProto(message) {
        return RequestOfferSnapshot.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/tendermint.abci.RequestOfferSnapshot',
            value: RequestOfferSnapshot.encode(message).finish(),
        };
    },
};
function createBaseRequestLoadSnapshotChunk() {
    return {
        height: BigInt(0),
        format: 0,
        chunk: 0,
    };
}
export const RequestLoadSnapshotChunk = {
    typeUrl: '/tendermint.abci.RequestLoadSnapshotChunk',
    encode(message, writer = BinaryWriter.create()) {
        if (message.height !== BigInt(0)) {
            writer.uint32(8).uint64(message.height);
        }
        if (message.format !== 0) {
            writer.uint32(16).uint32(message.format);
        }
        if (message.chunk !== 0) {
            writer.uint32(24).uint32(message.chunk);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseRequestLoadSnapshotChunk();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.height = reader.uint64();
                    break;
                case 2:
                    message.format = reader.uint32();
                    break;
                case 3:
                    message.chunk = reader.uint32();
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
            format: isSet(object.format) ? Number(object.format) : 0,
            chunk: isSet(object.chunk) ? Number(object.chunk) : 0,
        };
    },
    toJSON(message) {
        const obj = {};
        message.height !== undefined &&
            (obj.height = (message.height || BigInt(0)).toString());
        message.format !== undefined && (obj.format = Math.round(message.format));
        message.chunk !== undefined && (obj.chunk = Math.round(message.chunk));
        return obj;
    },
    fromPartial(object) {
        const message = createBaseRequestLoadSnapshotChunk();
        message.height =
            object.height !== undefined && object.height !== null
                ? BigInt(object.height.toString())
                : BigInt(0);
        message.format = object.format ?? 0;
        message.chunk = object.chunk ?? 0;
        return message;
    },
    fromProtoMsg(message) {
        return RequestLoadSnapshotChunk.decode(message.value);
    },
    toProto(message) {
        return RequestLoadSnapshotChunk.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/tendermint.abci.RequestLoadSnapshotChunk',
            value: RequestLoadSnapshotChunk.encode(message).finish(),
        };
    },
};
function createBaseRequestApplySnapshotChunk() {
    return {
        index: 0,
        chunk: new Uint8Array(),
        sender: '',
    };
}
export const RequestApplySnapshotChunk = {
    typeUrl: '/tendermint.abci.RequestApplySnapshotChunk',
    encode(message, writer = BinaryWriter.create()) {
        if (message.index !== 0) {
            writer.uint32(8).uint32(message.index);
        }
        if (message.chunk.length !== 0) {
            writer.uint32(18).bytes(message.chunk);
        }
        if (message.sender !== '') {
            writer.uint32(26).string(message.sender);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseRequestApplySnapshotChunk();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.index = reader.uint32();
                    break;
                case 2:
                    message.chunk = reader.bytes();
                    break;
                case 3:
                    message.sender = reader.string();
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
            index: isSet(object.index) ? Number(object.index) : 0,
            chunk: isSet(object.chunk)
                ? bytesFromBase64(object.chunk)
                : new Uint8Array(),
            sender: isSet(object.sender) ? String(object.sender) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.index !== undefined && (obj.index = Math.round(message.index));
        message.chunk !== undefined &&
            (obj.chunk = base64FromBytes(message.chunk !== undefined ? message.chunk : new Uint8Array()));
        message.sender !== undefined && (obj.sender = message.sender);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseRequestApplySnapshotChunk();
        message.index = object.index ?? 0;
        message.chunk = object.chunk ?? new Uint8Array();
        message.sender = object.sender ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return RequestApplySnapshotChunk.decode(message.value);
    },
    toProto(message) {
        return RequestApplySnapshotChunk.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/tendermint.abci.RequestApplySnapshotChunk',
            value: RequestApplySnapshotChunk.encode(message).finish(),
        };
    },
};
function createBaseResponse() {
    return {
        exception: undefined,
        echo: undefined,
        flush: undefined,
        info: undefined,
        setOption: undefined,
        initChain: undefined,
        query: undefined,
        beginBlock: undefined,
        checkTx: undefined,
        deliverTx: undefined,
        endBlock: undefined,
        commit: undefined,
        listSnapshots: undefined,
        offerSnapshot: undefined,
        loadSnapshotChunk: undefined,
        applySnapshotChunk: undefined,
    };
}
export const Response = {
    typeUrl: '/tendermint.abci.Response',
    encode(message, writer = BinaryWriter.create()) {
        if (message.exception !== undefined) {
            ResponseException.encode(message.exception, writer.uint32(10).fork()).ldelim();
        }
        if (message.echo !== undefined) {
            ResponseEcho.encode(message.echo, writer.uint32(18).fork()).ldelim();
        }
        if (message.flush !== undefined) {
            ResponseFlush.encode(message.flush, writer.uint32(26).fork()).ldelim();
        }
        if (message.info !== undefined) {
            ResponseInfo.encode(message.info, writer.uint32(34).fork()).ldelim();
        }
        if (message.setOption !== undefined) {
            ResponseSetOption.encode(message.setOption, writer.uint32(42).fork()).ldelim();
        }
        if (message.initChain !== undefined) {
            ResponseInitChain.encode(message.initChain, writer.uint32(50).fork()).ldelim();
        }
        if (message.query !== undefined) {
            ResponseQuery.encode(message.query, writer.uint32(58).fork()).ldelim();
        }
        if (message.beginBlock !== undefined) {
            ResponseBeginBlock.encode(message.beginBlock, writer.uint32(66).fork()).ldelim();
        }
        if (message.checkTx !== undefined) {
            ResponseCheckTx.encode(message.checkTx, writer.uint32(74).fork()).ldelim();
        }
        if (message.deliverTx !== undefined) {
            ResponseDeliverTx.encode(message.deliverTx, writer.uint32(82).fork()).ldelim();
        }
        if (message.endBlock !== undefined) {
            ResponseEndBlock.encode(message.endBlock, writer.uint32(90).fork()).ldelim();
        }
        if (message.commit !== undefined) {
            ResponseCommit.encode(message.commit, writer.uint32(98).fork()).ldelim();
        }
        if (message.listSnapshots !== undefined) {
            ResponseListSnapshots.encode(message.listSnapshots, writer.uint32(106).fork()).ldelim();
        }
        if (message.offerSnapshot !== undefined) {
            ResponseOfferSnapshot.encode(message.offerSnapshot, writer.uint32(114).fork()).ldelim();
        }
        if (message.loadSnapshotChunk !== undefined) {
            ResponseLoadSnapshotChunk.encode(message.loadSnapshotChunk, writer.uint32(122).fork()).ldelim();
        }
        if (message.applySnapshotChunk !== undefined) {
            ResponseApplySnapshotChunk.encode(message.applySnapshotChunk, writer.uint32(130).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.exception = ResponseException.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.echo = ResponseEcho.decode(reader, reader.uint32());
                    break;
                case 3:
                    message.flush = ResponseFlush.decode(reader, reader.uint32());
                    break;
                case 4:
                    message.info = ResponseInfo.decode(reader, reader.uint32());
                    break;
                case 5:
                    message.setOption = ResponseSetOption.decode(reader, reader.uint32());
                    break;
                case 6:
                    message.initChain = ResponseInitChain.decode(reader, reader.uint32());
                    break;
                case 7:
                    message.query = ResponseQuery.decode(reader, reader.uint32());
                    break;
                case 8:
                    message.beginBlock = ResponseBeginBlock.decode(reader, reader.uint32());
                    break;
                case 9:
                    message.checkTx = ResponseCheckTx.decode(reader, reader.uint32());
                    break;
                case 10:
                    message.deliverTx = ResponseDeliverTx.decode(reader, reader.uint32());
                    break;
                case 11:
                    message.endBlock = ResponseEndBlock.decode(reader, reader.uint32());
                    break;
                case 12:
                    message.commit = ResponseCommit.decode(reader, reader.uint32());
                    break;
                case 13:
                    message.listSnapshots = ResponseListSnapshots.decode(reader, reader.uint32());
                    break;
                case 14:
                    message.offerSnapshot = ResponseOfferSnapshot.decode(reader, reader.uint32());
                    break;
                case 15:
                    message.loadSnapshotChunk = ResponseLoadSnapshotChunk.decode(reader, reader.uint32());
                    break;
                case 16:
                    message.applySnapshotChunk = ResponseApplySnapshotChunk.decode(reader, reader.uint32());
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
            exception: isSet(object.exception)
                ? ResponseException.fromJSON(object.exception)
                : undefined,
            echo: isSet(object.echo) ? ResponseEcho.fromJSON(object.echo) : undefined,
            flush: isSet(object.flush)
                ? ResponseFlush.fromJSON(object.flush)
                : undefined,
            info: isSet(object.info) ? ResponseInfo.fromJSON(object.info) : undefined,
            setOption: isSet(object.setOption)
                ? ResponseSetOption.fromJSON(object.setOption)
                : undefined,
            initChain: isSet(object.initChain)
                ? ResponseInitChain.fromJSON(object.initChain)
                : undefined,
            query: isSet(object.query)
                ? ResponseQuery.fromJSON(object.query)
                : undefined,
            beginBlock: isSet(object.beginBlock)
                ? ResponseBeginBlock.fromJSON(object.beginBlock)
                : undefined,
            checkTx: isSet(object.checkTx)
                ? ResponseCheckTx.fromJSON(object.checkTx)
                : undefined,
            deliverTx: isSet(object.deliverTx)
                ? ResponseDeliverTx.fromJSON(object.deliverTx)
                : undefined,
            endBlock: isSet(object.endBlock)
                ? ResponseEndBlock.fromJSON(object.endBlock)
                : undefined,
            commit: isSet(object.commit)
                ? ResponseCommit.fromJSON(object.commit)
                : undefined,
            listSnapshots: isSet(object.listSnapshots)
                ? ResponseListSnapshots.fromJSON(object.listSnapshots)
                : undefined,
            offerSnapshot: isSet(object.offerSnapshot)
                ? ResponseOfferSnapshot.fromJSON(object.offerSnapshot)
                : undefined,
            loadSnapshotChunk: isSet(object.loadSnapshotChunk)
                ? ResponseLoadSnapshotChunk.fromJSON(object.loadSnapshotChunk)
                : undefined,
            applySnapshotChunk: isSet(object.applySnapshotChunk)
                ? ResponseApplySnapshotChunk.fromJSON(object.applySnapshotChunk)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.exception !== undefined &&
            (obj.exception = message.exception
                ? ResponseException.toJSON(message.exception)
                : undefined);
        message.echo !== undefined &&
            (obj.echo = message.echo ? ResponseEcho.toJSON(message.echo) : undefined);
        message.flush !== undefined &&
            (obj.flush = message.flush
                ? ResponseFlush.toJSON(message.flush)
                : undefined);
        message.info !== undefined &&
            (obj.info = message.info ? ResponseInfo.toJSON(message.info) : undefined);
        message.setOption !== undefined &&
            (obj.setOption = message.setOption
                ? ResponseSetOption.toJSON(message.setOption)
                : undefined);
        message.initChain !== undefined &&
            (obj.initChain = message.initChain
                ? ResponseInitChain.toJSON(message.initChain)
                : undefined);
        message.query !== undefined &&
            (obj.query = message.query
                ? ResponseQuery.toJSON(message.query)
                : undefined);
        message.beginBlock !== undefined &&
            (obj.beginBlock = message.beginBlock
                ? ResponseBeginBlock.toJSON(message.beginBlock)
                : undefined);
        message.checkTx !== undefined &&
            (obj.checkTx = message.checkTx
                ? ResponseCheckTx.toJSON(message.checkTx)
                : undefined);
        message.deliverTx !== undefined &&
            (obj.deliverTx = message.deliverTx
                ? ResponseDeliverTx.toJSON(message.deliverTx)
                : undefined);
        message.endBlock !== undefined &&
            (obj.endBlock = message.endBlock
                ? ResponseEndBlock.toJSON(message.endBlock)
                : undefined);
        message.commit !== undefined &&
            (obj.commit = message.commit
                ? ResponseCommit.toJSON(message.commit)
                : undefined);
        message.listSnapshots !== undefined &&
            (obj.listSnapshots = message.listSnapshots
                ? ResponseListSnapshots.toJSON(message.listSnapshots)
                : undefined);
        message.offerSnapshot !== undefined &&
            (obj.offerSnapshot = message.offerSnapshot
                ? ResponseOfferSnapshot.toJSON(message.offerSnapshot)
                : undefined);
        message.loadSnapshotChunk !== undefined &&
            (obj.loadSnapshotChunk = message.loadSnapshotChunk
                ? ResponseLoadSnapshotChunk.toJSON(message.loadSnapshotChunk)
                : undefined);
        message.applySnapshotChunk !== undefined &&
            (obj.applySnapshotChunk = message.applySnapshotChunk
                ? ResponseApplySnapshotChunk.toJSON(message.applySnapshotChunk)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseResponse();
        message.exception =
            object.exception !== undefined && object.exception !== null
                ? ResponseException.fromPartial(object.exception)
                : undefined;
        message.echo =
            object.echo !== undefined && object.echo !== null
                ? ResponseEcho.fromPartial(object.echo)
                : undefined;
        message.flush =
            object.flush !== undefined && object.flush !== null
                ? ResponseFlush.fromPartial(object.flush)
                : undefined;
        message.info =
            object.info !== undefined && object.info !== null
                ? ResponseInfo.fromPartial(object.info)
                : undefined;
        message.setOption =
            object.setOption !== undefined && object.setOption !== null
                ? ResponseSetOption.fromPartial(object.setOption)
                : undefined;
        message.initChain =
            object.initChain !== undefined && object.initChain !== null
                ? ResponseInitChain.fromPartial(object.initChain)
                : undefined;
        message.query =
            object.query !== undefined && object.query !== null
                ? ResponseQuery.fromPartial(object.query)
                : undefined;
        message.beginBlock =
            object.beginBlock !== undefined && object.beginBlock !== null
                ? ResponseBeginBlock.fromPartial(object.beginBlock)
                : undefined;
        message.checkTx =
            object.checkTx !== undefined && object.checkTx !== null
                ? ResponseCheckTx.fromPartial(object.checkTx)
                : undefined;
        message.deliverTx =
            object.deliverTx !== undefined && object.deliverTx !== null
                ? ResponseDeliverTx.fromPartial(object.deliverTx)
                : undefined;
        message.endBlock =
            object.endBlock !== undefined && object.endBlock !== null
                ? ResponseEndBlock.fromPartial(object.endBlock)
                : undefined;
        message.commit =
            object.commit !== undefined && object.commit !== null
                ? ResponseCommit.fromPartial(object.commit)
                : undefined;
        message.listSnapshots =
            object.listSnapshots !== undefined && object.listSnapshots !== null
                ? ResponseListSnapshots.fromPartial(object.listSnapshots)
                : undefined;
        message.offerSnapshot =
            object.offerSnapshot !== undefined && object.offerSnapshot !== null
                ? ResponseOfferSnapshot.fromPartial(object.offerSnapshot)
                : undefined;
        message.loadSnapshotChunk =
            object.loadSnapshotChunk !== undefined &&
                object.loadSnapshotChunk !== null
                ? ResponseLoadSnapshotChunk.fromPartial(object.loadSnapshotChunk)
                : undefined;
        message.applySnapshotChunk =
            object.applySnapshotChunk !== undefined &&
                object.applySnapshotChunk !== null
                ? ResponseApplySnapshotChunk.fromPartial(object.applySnapshotChunk)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return Response.decode(message.value);
    },
    toProto(message) {
        return Response.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/tendermint.abci.Response',
            value: Response.encode(message).finish(),
        };
    },
};
function createBaseResponseException() {
    return {
        error: '',
    };
}
export const ResponseException = {
    typeUrl: '/tendermint.abci.ResponseException',
    encode(message, writer = BinaryWriter.create()) {
        if (message.error !== '') {
            writer.uint32(10).string(message.error);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseResponseException();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.error = reader.string();
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
            error: isSet(object.error) ? String(object.error) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.error !== undefined && (obj.error = message.error);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseResponseException();
        message.error = object.error ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return ResponseException.decode(message.value);
    },
    toProto(message) {
        return ResponseException.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/tendermint.abci.ResponseException',
            value: ResponseException.encode(message).finish(),
        };
    },
};
function createBaseResponseEcho() {
    return {
        message: '',
    };
}
export const ResponseEcho = {
    typeUrl: '/tendermint.abci.ResponseEcho',
    encode(message, writer = BinaryWriter.create()) {
        if (message.message !== '') {
            writer.uint32(10).string(message.message);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseResponseEcho();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.message = reader.string();
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
            message: isSet(object.message) ? String(object.message) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.message !== undefined && (obj.message = message.message);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseResponseEcho();
        message.message = object.message ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return ResponseEcho.decode(message.value);
    },
    toProto(message) {
        return ResponseEcho.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/tendermint.abci.ResponseEcho',
            value: ResponseEcho.encode(message).finish(),
        };
    },
};
function createBaseResponseFlush() {
    return {};
}
export const ResponseFlush = {
    typeUrl: '/tendermint.abci.ResponseFlush',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseResponseFlush();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON(_) {
        return {};
    },
    toJSON(_) {
        const obj = {};
        return obj;
    },
    fromPartial(_) {
        const message = createBaseResponseFlush();
        return message;
    },
    fromProtoMsg(message) {
        return ResponseFlush.decode(message.value);
    },
    toProto(message) {
        return ResponseFlush.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/tendermint.abci.ResponseFlush',
            value: ResponseFlush.encode(message).finish(),
        };
    },
};
function createBaseResponseInfo() {
    return {
        data: '',
        version: '',
        appVersion: BigInt(0),
        lastBlockHeight: BigInt(0),
        lastBlockAppHash: new Uint8Array(),
    };
}
export const ResponseInfo = {
    typeUrl: '/tendermint.abci.ResponseInfo',
    encode(message, writer = BinaryWriter.create()) {
        if (message.data !== '') {
            writer.uint32(10).string(message.data);
        }
        if (message.version !== '') {
            writer.uint32(18).string(message.version);
        }
        if (message.appVersion !== BigInt(0)) {
            writer.uint32(24).uint64(message.appVersion);
        }
        if (message.lastBlockHeight !== BigInt(0)) {
            writer.uint32(32).int64(message.lastBlockHeight);
        }
        if (message.lastBlockAppHash.length !== 0) {
            writer.uint32(42).bytes(message.lastBlockAppHash);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseResponseInfo();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.data = reader.string();
                    break;
                case 2:
                    message.version = reader.string();
                    break;
                case 3:
                    message.appVersion = reader.uint64();
                    break;
                case 4:
                    message.lastBlockHeight = reader.int64();
                    break;
                case 5:
                    message.lastBlockAppHash = reader.bytes();
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
            data: isSet(object.data) ? String(object.data) : '',
            version: isSet(object.version) ? String(object.version) : '',
            appVersion: isSet(object.appVersion)
                ? BigInt(object.appVersion.toString())
                : BigInt(0),
            lastBlockHeight: isSet(object.lastBlockHeight)
                ? BigInt(object.lastBlockHeight.toString())
                : BigInt(0),
            lastBlockAppHash: isSet(object.lastBlockAppHash)
                ? bytesFromBase64(object.lastBlockAppHash)
                : new Uint8Array(),
        };
    },
    toJSON(message) {
        const obj = {};
        message.data !== undefined && (obj.data = message.data);
        message.version !== undefined && (obj.version = message.version);
        message.appVersion !== undefined &&
            (obj.appVersion = (message.appVersion || BigInt(0)).toString());
        message.lastBlockHeight !== undefined &&
            (obj.lastBlockHeight = (message.lastBlockHeight || BigInt(0)).toString());
        message.lastBlockAppHash !== undefined &&
            (obj.lastBlockAppHash = base64FromBytes(message.lastBlockAppHash !== undefined
                ? message.lastBlockAppHash
                : new Uint8Array()));
        return obj;
    },
    fromPartial(object) {
        const message = createBaseResponseInfo();
        message.data = object.data ?? '';
        message.version = object.version ?? '';
        message.appVersion =
            object.appVersion !== undefined && object.appVersion !== null
                ? BigInt(object.appVersion.toString())
                : BigInt(0);
        message.lastBlockHeight =
            object.lastBlockHeight !== undefined && object.lastBlockHeight !== null
                ? BigInt(object.lastBlockHeight.toString())
                : BigInt(0);
        message.lastBlockAppHash = object.lastBlockAppHash ?? new Uint8Array();
        return message;
    },
    fromProtoMsg(message) {
        return ResponseInfo.decode(message.value);
    },
    toProto(message) {
        return ResponseInfo.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/tendermint.abci.ResponseInfo',
            value: ResponseInfo.encode(message).finish(),
        };
    },
};
function createBaseResponseSetOption() {
    return {
        code: 0,
        log: '',
        info: '',
    };
}
export const ResponseSetOption = {
    typeUrl: '/tendermint.abci.ResponseSetOption',
    encode(message, writer = BinaryWriter.create()) {
        if (message.code !== 0) {
            writer.uint32(8).uint32(message.code);
        }
        if (message.log !== '') {
            writer.uint32(26).string(message.log);
        }
        if (message.info !== '') {
            writer.uint32(34).string(message.info);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseResponseSetOption();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.code = reader.uint32();
                    break;
                case 3:
                    message.log = reader.string();
                    break;
                case 4:
                    message.info = reader.string();
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
            code: isSet(object.code) ? Number(object.code) : 0,
            log: isSet(object.log) ? String(object.log) : '',
            info: isSet(object.info) ? String(object.info) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.code !== undefined && (obj.code = Math.round(message.code));
        message.log !== undefined && (obj.log = message.log);
        message.info !== undefined && (obj.info = message.info);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseResponseSetOption();
        message.code = object.code ?? 0;
        message.log = object.log ?? '';
        message.info = object.info ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return ResponseSetOption.decode(message.value);
    },
    toProto(message) {
        return ResponseSetOption.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/tendermint.abci.ResponseSetOption',
            value: ResponseSetOption.encode(message).finish(),
        };
    },
};
function createBaseResponseInitChain() {
    return {
        consensusParams: undefined,
        validators: [],
        appHash: new Uint8Array(),
    };
}
export const ResponseInitChain = {
    typeUrl: '/tendermint.abci.ResponseInitChain',
    encode(message, writer = BinaryWriter.create()) {
        if (message.consensusParams !== undefined) {
            ConsensusParams.encode(message.consensusParams, writer.uint32(10).fork()).ldelim();
        }
        for (const v of message.validators) {
            ValidatorUpdate.encode(v, writer.uint32(18).fork()).ldelim();
        }
        if (message.appHash.length !== 0) {
            writer.uint32(26).bytes(message.appHash);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseResponseInitChain();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.consensusParams = ConsensusParams.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.validators.push(ValidatorUpdate.decode(reader, reader.uint32()));
                    break;
                case 3:
                    message.appHash = reader.bytes();
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
            consensusParams: isSet(object.consensusParams)
                ? ConsensusParams.fromJSON(object.consensusParams)
                : undefined,
            validators: Array.isArray(object?.validators)
                ? object.validators.map((e) => ValidatorUpdate.fromJSON(e))
                : [],
            appHash: isSet(object.appHash)
                ? bytesFromBase64(object.appHash)
                : new Uint8Array(),
        };
    },
    toJSON(message) {
        const obj = {};
        message.consensusParams !== undefined &&
            (obj.consensusParams = message.consensusParams
                ? ConsensusParams.toJSON(message.consensusParams)
                : undefined);
        if (message.validators) {
            obj.validators = message.validators.map(e => e ? ValidatorUpdate.toJSON(e) : undefined);
        }
        else {
            obj.validators = [];
        }
        message.appHash !== undefined &&
            (obj.appHash = base64FromBytes(message.appHash !== undefined ? message.appHash : new Uint8Array()));
        return obj;
    },
    fromPartial(object) {
        const message = createBaseResponseInitChain();
        message.consensusParams =
            object.consensusParams !== undefined && object.consensusParams !== null
                ? ConsensusParams.fromPartial(object.consensusParams)
                : undefined;
        message.validators =
            object.validators?.map(e => ValidatorUpdate.fromPartial(e)) || [];
        message.appHash = object.appHash ?? new Uint8Array();
        return message;
    },
    fromProtoMsg(message) {
        return ResponseInitChain.decode(message.value);
    },
    toProto(message) {
        return ResponseInitChain.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/tendermint.abci.ResponseInitChain',
            value: ResponseInitChain.encode(message).finish(),
        };
    },
};
function createBaseResponseQuery() {
    return {
        code: 0,
        log: '',
        info: '',
        index: BigInt(0),
        key: new Uint8Array(),
        value: new Uint8Array(),
        proofOps: undefined,
        height: BigInt(0),
        codespace: '',
    };
}
export const ResponseQuery = {
    typeUrl: '/tendermint.abci.ResponseQuery',
    encode(message, writer = BinaryWriter.create()) {
        if (message.code !== 0) {
            writer.uint32(8).uint32(message.code);
        }
        if (message.log !== '') {
            writer.uint32(26).string(message.log);
        }
        if (message.info !== '') {
            writer.uint32(34).string(message.info);
        }
        if (message.index !== BigInt(0)) {
            writer.uint32(40).int64(message.index);
        }
        if (message.key.length !== 0) {
            writer.uint32(50).bytes(message.key);
        }
        if (message.value.length !== 0) {
            writer.uint32(58).bytes(message.value);
        }
        if (message.proofOps !== undefined) {
            ProofOps.encode(message.proofOps, writer.uint32(66).fork()).ldelim();
        }
        if (message.height !== BigInt(0)) {
            writer.uint32(72).int64(message.height);
        }
        if (message.codespace !== '') {
            writer.uint32(82).string(message.codespace);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseResponseQuery();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.code = reader.uint32();
                    break;
                case 3:
                    message.log = reader.string();
                    break;
                case 4:
                    message.info = reader.string();
                    break;
                case 5:
                    message.index = reader.int64();
                    break;
                case 6:
                    message.key = reader.bytes();
                    break;
                case 7:
                    message.value = reader.bytes();
                    break;
                case 8:
                    message.proofOps = ProofOps.decode(reader, reader.uint32());
                    break;
                case 9:
                    message.height = reader.int64();
                    break;
                case 10:
                    message.codespace = reader.string();
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
            code: isSet(object.code) ? Number(object.code) : 0,
            log: isSet(object.log) ? String(object.log) : '',
            info: isSet(object.info) ? String(object.info) : '',
            index: isSet(object.index) ? BigInt(object.index.toString()) : BigInt(0),
            key: isSet(object.key) ? bytesFromBase64(object.key) : new Uint8Array(),
            value: isSet(object.value)
                ? bytesFromBase64(object.value)
                : new Uint8Array(),
            proofOps: isSet(object.proofOps)
                ? ProofOps.fromJSON(object.proofOps)
                : undefined,
            height: isSet(object.height)
                ? BigInt(object.height.toString())
                : BigInt(0),
            codespace: isSet(object.codespace) ? String(object.codespace) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.code !== undefined && (obj.code = Math.round(message.code));
        message.log !== undefined && (obj.log = message.log);
        message.info !== undefined && (obj.info = message.info);
        message.index !== undefined &&
            (obj.index = (message.index || BigInt(0)).toString());
        message.key !== undefined &&
            (obj.key = base64FromBytes(message.key !== undefined ? message.key : new Uint8Array()));
        message.value !== undefined &&
            (obj.value = base64FromBytes(message.value !== undefined ? message.value : new Uint8Array()));
        message.proofOps !== undefined &&
            (obj.proofOps = message.proofOps
                ? ProofOps.toJSON(message.proofOps)
                : undefined);
        message.height !== undefined &&
            (obj.height = (message.height || BigInt(0)).toString());
        message.codespace !== undefined && (obj.codespace = message.codespace);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseResponseQuery();
        message.code = object.code ?? 0;
        message.log = object.log ?? '';
        message.info = object.info ?? '';
        message.index =
            object.index !== undefined && object.index !== null
                ? BigInt(object.index.toString())
                : BigInt(0);
        message.key = object.key ?? new Uint8Array();
        message.value = object.value ?? new Uint8Array();
        message.proofOps =
            object.proofOps !== undefined && object.proofOps !== null
                ? ProofOps.fromPartial(object.proofOps)
                : undefined;
        message.height =
            object.height !== undefined && object.height !== null
                ? BigInt(object.height.toString())
                : BigInt(0);
        message.codespace = object.codespace ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return ResponseQuery.decode(message.value);
    },
    toProto(message) {
        return ResponseQuery.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/tendermint.abci.ResponseQuery',
            value: ResponseQuery.encode(message).finish(),
        };
    },
};
function createBaseResponseBeginBlock() {
    return {
        events: [],
    };
}
export const ResponseBeginBlock = {
    typeUrl: '/tendermint.abci.ResponseBeginBlock',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.events) {
            Event.encode(v, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseResponseBeginBlock();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.events.push(Event.decode(reader, reader.uint32()));
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
                ? object.events.map((e) => Event.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.events) {
            obj.events = message.events.map(e => (e ? Event.toJSON(e) : undefined));
        }
        else {
            obj.events = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseResponseBeginBlock();
        message.events = object.events?.map(e => Event.fromPartial(e)) || [];
        return message;
    },
    fromProtoMsg(message) {
        return ResponseBeginBlock.decode(message.value);
    },
    toProto(message) {
        return ResponseBeginBlock.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/tendermint.abci.ResponseBeginBlock',
            value: ResponseBeginBlock.encode(message).finish(),
        };
    },
};
function createBaseResponseCheckTx() {
    return {
        code: 0,
        data: new Uint8Array(),
        log: '',
        info: '',
        gasWanted: BigInt(0),
        gasUsed: BigInt(0),
        events: [],
        codespace: '',
    };
}
export const ResponseCheckTx = {
    typeUrl: '/tendermint.abci.ResponseCheckTx',
    encode(message, writer = BinaryWriter.create()) {
        if (message.code !== 0) {
            writer.uint32(8).uint32(message.code);
        }
        if (message.data.length !== 0) {
            writer.uint32(18).bytes(message.data);
        }
        if (message.log !== '') {
            writer.uint32(26).string(message.log);
        }
        if (message.info !== '') {
            writer.uint32(34).string(message.info);
        }
        if (message.gasWanted !== BigInt(0)) {
            writer.uint32(40).int64(message.gasWanted);
        }
        if (message.gasUsed !== BigInt(0)) {
            writer.uint32(48).int64(message.gasUsed);
        }
        for (const v of message.events) {
            Event.encode(v, writer.uint32(58).fork()).ldelim();
        }
        if (message.codespace !== '') {
            writer.uint32(66).string(message.codespace);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseResponseCheckTx();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.code = reader.uint32();
                    break;
                case 2:
                    message.data = reader.bytes();
                    break;
                case 3:
                    message.log = reader.string();
                    break;
                case 4:
                    message.info = reader.string();
                    break;
                case 5:
                    message.gasWanted = reader.int64();
                    break;
                case 6:
                    message.gasUsed = reader.int64();
                    break;
                case 7:
                    message.events.push(Event.decode(reader, reader.uint32()));
                    break;
                case 8:
                    message.codespace = reader.string();
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
            code: isSet(object.code) ? Number(object.code) : 0,
            data: isSet(object.data)
                ? bytesFromBase64(object.data)
                : new Uint8Array(),
            log: isSet(object.log) ? String(object.log) : '',
            info: isSet(object.info) ? String(object.info) : '',
            gasWanted: isSet(object.gas_wanted)
                ? BigInt(object.gas_wanted.toString())
                : BigInt(0),
            gasUsed: isSet(object.gas_used)
                ? BigInt(object.gas_used.toString())
                : BigInt(0),
            events: Array.isArray(object?.events)
                ? object.events.map((e) => Event.fromJSON(e))
                : [],
            codespace: isSet(object.codespace) ? String(object.codespace) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.code !== undefined && (obj.code = Math.round(message.code));
        message.data !== undefined &&
            (obj.data = base64FromBytes(message.data !== undefined ? message.data : new Uint8Array()));
        message.log !== undefined && (obj.log = message.log);
        message.info !== undefined && (obj.info = message.info);
        message.gasWanted !== undefined &&
            (obj.gas_wanted = (message.gasWanted || BigInt(0)).toString());
        message.gasUsed !== undefined &&
            (obj.gas_used = (message.gasUsed || BigInt(0)).toString());
        if (message.events) {
            obj.events = message.events.map(e => (e ? Event.toJSON(e) : undefined));
        }
        else {
            obj.events = [];
        }
        message.codespace !== undefined && (obj.codespace = message.codespace);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseResponseCheckTx();
        message.code = object.code ?? 0;
        message.data = object.data ?? new Uint8Array();
        message.log = object.log ?? '';
        message.info = object.info ?? '';
        message.gasWanted =
            object.gasWanted !== undefined && object.gasWanted !== null
                ? BigInt(object.gasWanted.toString())
                : BigInt(0);
        message.gasUsed =
            object.gasUsed !== undefined && object.gasUsed !== null
                ? BigInt(object.gasUsed.toString())
                : BigInt(0);
        message.events = object.events?.map(e => Event.fromPartial(e)) || [];
        message.codespace = object.codespace ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return ResponseCheckTx.decode(message.value);
    },
    toProto(message) {
        return ResponseCheckTx.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/tendermint.abci.ResponseCheckTx',
            value: ResponseCheckTx.encode(message).finish(),
        };
    },
};
function createBaseResponseDeliverTx() {
    return {
        code: 0,
        data: new Uint8Array(),
        log: '',
        info: '',
        gasWanted: BigInt(0),
        gasUsed: BigInt(0),
        events: [],
        codespace: '',
    };
}
export const ResponseDeliverTx = {
    typeUrl: '/tendermint.abci.ResponseDeliverTx',
    encode(message, writer = BinaryWriter.create()) {
        if (message.code !== 0) {
            writer.uint32(8).uint32(message.code);
        }
        if (message.data.length !== 0) {
            writer.uint32(18).bytes(message.data);
        }
        if (message.log !== '') {
            writer.uint32(26).string(message.log);
        }
        if (message.info !== '') {
            writer.uint32(34).string(message.info);
        }
        if (message.gasWanted !== BigInt(0)) {
            writer.uint32(40).int64(message.gasWanted);
        }
        if (message.gasUsed !== BigInt(0)) {
            writer.uint32(48).int64(message.gasUsed);
        }
        for (const v of message.events) {
            Event.encode(v, writer.uint32(58).fork()).ldelim();
        }
        if (message.codespace !== '') {
            writer.uint32(66).string(message.codespace);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseResponseDeliverTx();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.code = reader.uint32();
                    break;
                case 2:
                    message.data = reader.bytes();
                    break;
                case 3:
                    message.log = reader.string();
                    break;
                case 4:
                    message.info = reader.string();
                    break;
                case 5:
                    message.gasWanted = reader.int64();
                    break;
                case 6:
                    message.gasUsed = reader.int64();
                    break;
                case 7:
                    message.events.push(Event.decode(reader, reader.uint32()));
                    break;
                case 8:
                    message.codespace = reader.string();
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
            code: isSet(object.code) ? Number(object.code) : 0,
            data: isSet(object.data)
                ? bytesFromBase64(object.data)
                : new Uint8Array(),
            log: isSet(object.log) ? String(object.log) : '',
            info: isSet(object.info) ? String(object.info) : '',
            gasWanted: isSet(object.gas_wanted)
                ? BigInt(object.gas_wanted.toString())
                : BigInt(0),
            gasUsed: isSet(object.gas_used)
                ? BigInt(object.gas_used.toString())
                : BigInt(0),
            events: Array.isArray(object?.events)
                ? object.events.map((e) => Event.fromJSON(e))
                : [],
            codespace: isSet(object.codespace) ? String(object.codespace) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.code !== undefined && (obj.code = Math.round(message.code));
        message.data !== undefined &&
            (obj.data = base64FromBytes(message.data !== undefined ? message.data : new Uint8Array()));
        message.log !== undefined && (obj.log = message.log);
        message.info !== undefined && (obj.info = message.info);
        message.gasWanted !== undefined &&
            (obj.gas_wanted = (message.gasWanted || BigInt(0)).toString());
        message.gasUsed !== undefined &&
            (obj.gas_used = (message.gasUsed || BigInt(0)).toString());
        if (message.events) {
            obj.events = message.events.map(e => (e ? Event.toJSON(e) : undefined));
        }
        else {
            obj.events = [];
        }
        message.codespace !== undefined && (obj.codespace = message.codespace);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseResponseDeliverTx();
        message.code = object.code ?? 0;
        message.data = object.data ?? new Uint8Array();
        message.log = object.log ?? '';
        message.info = object.info ?? '';
        message.gasWanted =
            object.gasWanted !== undefined && object.gasWanted !== null
                ? BigInt(object.gasWanted.toString())
                : BigInt(0);
        message.gasUsed =
            object.gasUsed !== undefined && object.gasUsed !== null
                ? BigInt(object.gasUsed.toString())
                : BigInt(0);
        message.events = object.events?.map(e => Event.fromPartial(e)) || [];
        message.codespace = object.codespace ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return ResponseDeliverTx.decode(message.value);
    },
    toProto(message) {
        return ResponseDeliverTx.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/tendermint.abci.ResponseDeliverTx',
            value: ResponseDeliverTx.encode(message).finish(),
        };
    },
};
function createBaseResponseEndBlock() {
    return {
        validatorUpdates: [],
        consensusParamUpdates: undefined,
        events: [],
    };
}
export const ResponseEndBlock = {
    typeUrl: '/tendermint.abci.ResponseEndBlock',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.validatorUpdates) {
            ValidatorUpdate.encode(v, writer.uint32(10).fork()).ldelim();
        }
        if (message.consensusParamUpdates !== undefined) {
            ConsensusParams.encode(message.consensusParamUpdates, writer.uint32(18).fork()).ldelim();
        }
        for (const v of message.events) {
            Event.encode(v, writer.uint32(26).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseResponseEndBlock();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.validatorUpdates.push(ValidatorUpdate.decode(reader, reader.uint32()));
                    break;
                case 2:
                    message.consensusParamUpdates = ConsensusParams.decode(reader, reader.uint32());
                    break;
                case 3:
                    message.events.push(Event.decode(reader, reader.uint32()));
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
            validatorUpdates: Array.isArray(object?.validatorUpdates)
                ? object.validatorUpdates.map((e) => ValidatorUpdate.fromJSON(e))
                : [],
            consensusParamUpdates: isSet(object.consensusParamUpdates)
                ? ConsensusParams.fromJSON(object.consensusParamUpdates)
                : undefined,
            events: Array.isArray(object?.events)
                ? object.events.map((e) => Event.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.validatorUpdates) {
            obj.validatorUpdates = message.validatorUpdates.map(e => e ? ValidatorUpdate.toJSON(e) : undefined);
        }
        else {
            obj.validatorUpdates = [];
        }
        message.consensusParamUpdates !== undefined &&
            (obj.consensusParamUpdates = message.consensusParamUpdates
                ? ConsensusParams.toJSON(message.consensusParamUpdates)
                : undefined);
        if (message.events) {
            obj.events = message.events.map(e => (e ? Event.toJSON(e) : undefined));
        }
        else {
            obj.events = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseResponseEndBlock();
        message.validatorUpdates =
            object.validatorUpdates?.map(e => ValidatorUpdate.fromPartial(e)) || [];
        message.consensusParamUpdates =
            object.consensusParamUpdates !== undefined &&
                object.consensusParamUpdates !== null
                ? ConsensusParams.fromPartial(object.consensusParamUpdates)
                : undefined;
        message.events = object.events?.map(e => Event.fromPartial(e)) || [];
        return message;
    },
    fromProtoMsg(message) {
        return ResponseEndBlock.decode(message.value);
    },
    toProto(message) {
        return ResponseEndBlock.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/tendermint.abci.ResponseEndBlock',
            value: ResponseEndBlock.encode(message).finish(),
        };
    },
};
function createBaseResponseCommit() {
    return {
        data: new Uint8Array(),
        retainHeight: BigInt(0),
    };
}
export const ResponseCommit = {
    typeUrl: '/tendermint.abci.ResponseCommit',
    encode(message, writer = BinaryWriter.create()) {
        if (message.data.length !== 0) {
            writer.uint32(18).bytes(message.data);
        }
        if (message.retainHeight !== BigInt(0)) {
            writer.uint32(24).int64(message.retainHeight);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseResponseCommit();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 2:
                    message.data = reader.bytes();
                    break;
                case 3:
                    message.retainHeight = reader.int64();
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
            data: isSet(object.data)
                ? bytesFromBase64(object.data)
                : new Uint8Array(),
            retainHeight: isSet(object.retainHeight)
                ? BigInt(object.retainHeight.toString())
                : BigInt(0),
        };
    },
    toJSON(message) {
        const obj = {};
        message.data !== undefined &&
            (obj.data = base64FromBytes(message.data !== undefined ? message.data : new Uint8Array()));
        message.retainHeight !== undefined &&
            (obj.retainHeight = (message.retainHeight || BigInt(0)).toString());
        return obj;
    },
    fromPartial(object) {
        const message = createBaseResponseCommit();
        message.data = object.data ?? new Uint8Array();
        message.retainHeight =
            object.retainHeight !== undefined && object.retainHeight !== null
                ? BigInt(object.retainHeight.toString())
                : BigInt(0);
        return message;
    },
    fromProtoMsg(message) {
        return ResponseCommit.decode(message.value);
    },
    toProto(message) {
        return ResponseCommit.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/tendermint.abci.ResponseCommit',
            value: ResponseCommit.encode(message).finish(),
        };
    },
};
function createBaseResponseListSnapshots() {
    return {
        snapshots: [],
    };
}
export const ResponseListSnapshots = {
    typeUrl: '/tendermint.abci.ResponseListSnapshots',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.snapshots) {
            Snapshot.encode(v, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseResponseListSnapshots();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.snapshots.push(Snapshot.decode(reader, reader.uint32()));
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
            snapshots: Array.isArray(object?.snapshots)
                ? object.snapshots.map((e) => Snapshot.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.snapshots) {
            obj.snapshots = message.snapshots.map(e => e ? Snapshot.toJSON(e) : undefined);
        }
        else {
            obj.snapshots = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseResponseListSnapshots();
        message.snapshots =
            object.snapshots?.map(e => Snapshot.fromPartial(e)) || [];
        return message;
    },
    fromProtoMsg(message) {
        return ResponseListSnapshots.decode(message.value);
    },
    toProto(message) {
        return ResponseListSnapshots.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/tendermint.abci.ResponseListSnapshots',
            value: ResponseListSnapshots.encode(message).finish(),
        };
    },
};
function createBaseResponseOfferSnapshot() {
    return {
        result: 0,
    };
}
export const ResponseOfferSnapshot = {
    typeUrl: '/tendermint.abci.ResponseOfferSnapshot',
    encode(message, writer = BinaryWriter.create()) {
        if (message.result !== 0) {
            writer.uint32(8).int32(message.result);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseResponseOfferSnapshot();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.result = reader.int32();
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
            result: isSet(object.result)
                ? responseOfferSnapshot_ResultFromJSON(object.result)
                : -1,
        };
    },
    toJSON(message) {
        const obj = {};
        message.result !== undefined &&
            (obj.result = responseOfferSnapshot_ResultToJSON(message.result));
        return obj;
    },
    fromPartial(object) {
        const message = createBaseResponseOfferSnapshot();
        message.result = object.result ?? 0;
        return message;
    },
    fromProtoMsg(message) {
        return ResponseOfferSnapshot.decode(message.value);
    },
    toProto(message) {
        return ResponseOfferSnapshot.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/tendermint.abci.ResponseOfferSnapshot',
            value: ResponseOfferSnapshot.encode(message).finish(),
        };
    },
};
function createBaseResponseLoadSnapshotChunk() {
    return {
        chunk: new Uint8Array(),
    };
}
export const ResponseLoadSnapshotChunk = {
    typeUrl: '/tendermint.abci.ResponseLoadSnapshotChunk',
    encode(message, writer = BinaryWriter.create()) {
        if (message.chunk.length !== 0) {
            writer.uint32(10).bytes(message.chunk);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseResponseLoadSnapshotChunk();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.chunk = reader.bytes();
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
            chunk: isSet(object.chunk)
                ? bytesFromBase64(object.chunk)
                : new Uint8Array(),
        };
    },
    toJSON(message) {
        const obj = {};
        message.chunk !== undefined &&
            (obj.chunk = base64FromBytes(message.chunk !== undefined ? message.chunk : new Uint8Array()));
        return obj;
    },
    fromPartial(object) {
        const message = createBaseResponseLoadSnapshotChunk();
        message.chunk = object.chunk ?? new Uint8Array();
        return message;
    },
    fromProtoMsg(message) {
        return ResponseLoadSnapshotChunk.decode(message.value);
    },
    toProto(message) {
        return ResponseLoadSnapshotChunk.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/tendermint.abci.ResponseLoadSnapshotChunk',
            value: ResponseLoadSnapshotChunk.encode(message).finish(),
        };
    },
};
function createBaseResponseApplySnapshotChunk() {
    return {
        result: 0,
        refetchChunks: [],
        rejectSenders: [],
    };
}
export const ResponseApplySnapshotChunk = {
    typeUrl: '/tendermint.abci.ResponseApplySnapshotChunk',
    encode(message, writer = BinaryWriter.create()) {
        if (message.result !== 0) {
            writer.uint32(8).int32(message.result);
        }
        writer.uint32(18).fork();
        for (const v of message.refetchChunks) {
            writer.uint32(v);
        }
        writer.ldelim();
        for (const v of message.rejectSenders) {
            writer.uint32(26).string(v);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseResponseApplySnapshotChunk();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.result = reader.int32();
                    break;
                case 2:
                    if ((tag & 7) === 2) {
                        const end2 = reader.uint32() + reader.pos;
                        while (reader.pos < end2) {
                            message.refetchChunks.push(reader.uint32());
                        }
                    }
                    else {
                        message.refetchChunks.push(reader.uint32());
                    }
                    break;
                case 3:
                    message.rejectSenders.push(reader.string());
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
            result: isSet(object.result)
                ? responseApplySnapshotChunk_ResultFromJSON(object.result)
                : -1,
            refetchChunks: Array.isArray(object?.refetchChunks)
                ? object.refetchChunks.map((e) => Number(e))
                : [],
            rejectSenders: Array.isArray(object?.rejectSenders)
                ? object.rejectSenders.map((e) => String(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        message.result !== undefined &&
            (obj.result = responseApplySnapshotChunk_ResultToJSON(message.result));
        if (message.refetchChunks) {
            obj.refetchChunks = message.refetchChunks.map(e => Math.round(e));
        }
        else {
            obj.refetchChunks = [];
        }
        if (message.rejectSenders) {
            obj.rejectSenders = message.rejectSenders.map(e => e);
        }
        else {
            obj.rejectSenders = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseResponseApplySnapshotChunk();
        message.result = object.result ?? 0;
        message.refetchChunks = object.refetchChunks?.map(e => e) || [];
        message.rejectSenders = object.rejectSenders?.map(e => e) || [];
        return message;
    },
    fromProtoMsg(message) {
        return ResponseApplySnapshotChunk.decode(message.value);
    },
    toProto(message) {
        return ResponseApplySnapshotChunk.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/tendermint.abci.ResponseApplySnapshotChunk',
            value: ResponseApplySnapshotChunk.encode(message).finish(),
        };
    },
};
function createBaseConsensusParams() {
    return {
        block: undefined,
        evidence: undefined,
        validator: undefined,
        version: undefined,
    };
}
export const ConsensusParams = {
    typeUrl: '/tendermint.abci.ConsensusParams',
    encode(message, writer = BinaryWriter.create()) {
        if (message.block !== undefined) {
            BlockParams.encode(message.block, writer.uint32(10).fork()).ldelim();
        }
        if (message.evidence !== undefined) {
            EvidenceParams.encode(message.evidence, writer.uint32(18).fork()).ldelim();
        }
        if (message.validator !== undefined) {
            ValidatorParams.encode(message.validator, writer.uint32(26).fork()).ldelim();
        }
        if (message.version !== undefined) {
            VersionParams.encode(message.version, writer.uint32(34).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseConsensusParams();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.block = BlockParams.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.evidence = EvidenceParams.decode(reader, reader.uint32());
                    break;
                case 3:
                    message.validator = ValidatorParams.decode(reader, reader.uint32());
                    break;
                case 4:
                    message.version = VersionParams.decode(reader, reader.uint32());
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
            block: isSet(object.block)
                ? BlockParams.fromJSON(object.block)
                : undefined,
            evidence: isSet(object.evidence)
                ? EvidenceParams.fromJSON(object.evidence)
                : undefined,
            validator: isSet(object.validator)
                ? ValidatorParams.fromJSON(object.validator)
                : undefined,
            version: isSet(object.version)
                ? VersionParams.fromJSON(object.version)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.block !== undefined &&
            (obj.block = message.block
                ? BlockParams.toJSON(message.block)
                : undefined);
        message.evidence !== undefined &&
            (obj.evidence = message.evidence
                ? EvidenceParams.toJSON(message.evidence)
                : undefined);
        message.validator !== undefined &&
            (obj.validator = message.validator
                ? ValidatorParams.toJSON(message.validator)
                : undefined);
        message.version !== undefined &&
            (obj.version = message.version
                ? VersionParams.toJSON(message.version)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseConsensusParams();
        message.block =
            object.block !== undefined && object.block !== null
                ? BlockParams.fromPartial(object.block)
                : undefined;
        message.evidence =
            object.evidence !== undefined && object.evidence !== null
                ? EvidenceParams.fromPartial(object.evidence)
                : undefined;
        message.validator =
            object.validator !== undefined && object.validator !== null
                ? ValidatorParams.fromPartial(object.validator)
                : undefined;
        message.version =
            object.version !== undefined && object.version !== null
                ? VersionParams.fromPartial(object.version)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return ConsensusParams.decode(message.value);
    },
    toProto(message) {
        return ConsensusParams.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/tendermint.abci.ConsensusParams',
            value: ConsensusParams.encode(message).finish(),
        };
    },
};
function createBaseBlockParams() {
    return {
        maxBytes: BigInt(0),
        maxGas: BigInt(0),
    };
}
export const BlockParams = {
    typeUrl: '/tendermint.abci.BlockParams',
    encode(message, writer = BinaryWriter.create()) {
        if (message.maxBytes !== BigInt(0)) {
            writer.uint32(8).int64(message.maxBytes);
        }
        if (message.maxGas !== BigInt(0)) {
            writer.uint32(16).int64(message.maxGas);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseBlockParams();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.maxBytes = reader.int64();
                    break;
                case 2:
                    message.maxGas = reader.int64();
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
            maxBytes: isSet(object.maxBytes)
                ? BigInt(object.maxBytes.toString())
                : BigInt(0),
            maxGas: isSet(object.maxGas)
                ? BigInt(object.maxGas.toString())
                : BigInt(0),
        };
    },
    toJSON(message) {
        const obj = {};
        message.maxBytes !== undefined &&
            (obj.maxBytes = (message.maxBytes || BigInt(0)).toString());
        message.maxGas !== undefined &&
            (obj.maxGas = (message.maxGas || BigInt(0)).toString());
        return obj;
    },
    fromPartial(object) {
        const message = createBaseBlockParams();
        message.maxBytes =
            object.maxBytes !== undefined && object.maxBytes !== null
                ? BigInt(object.maxBytes.toString())
                : BigInt(0);
        message.maxGas =
            object.maxGas !== undefined && object.maxGas !== null
                ? BigInt(object.maxGas.toString())
                : BigInt(0);
        return message;
    },
    fromProtoMsg(message) {
        return BlockParams.decode(message.value);
    },
    toProto(message) {
        return BlockParams.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/tendermint.abci.BlockParams',
            value: BlockParams.encode(message).finish(),
        };
    },
};
function createBaseLastCommitInfo() {
    return {
        round: 0,
        votes: [],
    };
}
export const LastCommitInfo = {
    typeUrl: '/tendermint.abci.LastCommitInfo',
    encode(message, writer = BinaryWriter.create()) {
        if (message.round !== 0) {
            writer.uint32(8).int32(message.round);
        }
        for (const v of message.votes) {
            VoteInfo.encode(v, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseLastCommitInfo();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.round = reader.int32();
                    break;
                case 2:
                    message.votes.push(VoteInfo.decode(reader, reader.uint32()));
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
            round: isSet(object.round) ? Number(object.round) : 0,
            votes: Array.isArray(object?.votes)
                ? object.votes.map((e) => VoteInfo.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        message.round !== undefined && (obj.round = Math.round(message.round));
        if (message.votes) {
            obj.votes = message.votes.map(e => (e ? VoteInfo.toJSON(e) : undefined));
        }
        else {
            obj.votes = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseLastCommitInfo();
        message.round = object.round ?? 0;
        message.votes = object.votes?.map(e => VoteInfo.fromPartial(e)) || [];
        return message;
    },
    fromProtoMsg(message) {
        return LastCommitInfo.decode(message.value);
    },
    toProto(message) {
        return LastCommitInfo.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/tendermint.abci.LastCommitInfo',
            value: LastCommitInfo.encode(message).finish(),
        };
    },
};
function createBaseEvent() {
    return {
        type: '',
        attributes: [],
    };
}
export const Event = {
    typeUrl: '/tendermint.abci.Event',
    encode(message, writer = BinaryWriter.create()) {
        if (message.type !== '') {
            writer.uint32(10).string(message.type);
        }
        for (const v of message.attributes) {
            EventAttribute.encode(v, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseEvent();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.type = reader.string();
                    break;
                case 2:
                    message.attributes.push(EventAttribute.decode(reader, reader.uint32()));
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
            type: isSet(object.type) ? String(object.type) : '',
            attributes: Array.isArray(object?.attributes)
                ? object.attributes.map((e) => EventAttribute.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        message.type !== undefined && (obj.type = message.type);
        if (message.attributes) {
            obj.attributes = message.attributes.map(e => e ? EventAttribute.toJSON(e) : undefined);
        }
        else {
            obj.attributes = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseEvent();
        message.type = object.type ?? '';
        message.attributes =
            object.attributes?.map(e => EventAttribute.fromPartial(e)) || [];
        return message;
    },
    fromProtoMsg(message) {
        return Event.decode(message.value);
    },
    toProto(message) {
        return Event.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/tendermint.abci.Event',
            value: Event.encode(message).finish(),
        };
    },
};
function createBaseEventAttribute() {
    return {
        key: new Uint8Array(),
        value: new Uint8Array(),
        index: false,
    };
}
export const EventAttribute = {
    typeUrl: '/tendermint.abci.EventAttribute',
    encode(message, writer = BinaryWriter.create()) {
        if (message.key.length !== 0) {
            writer.uint32(10).bytes(message.key);
        }
        if (message.value.length !== 0) {
            writer.uint32(18).bytes(message.value);
        }
        if (message.index === true) {
            writer.uint32(24).bool(message.index);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseEventAttribute();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.key = reader.bytes();
                    break;
                case 2:
                    message.value = reader.bytes();
                    break;
                case 3:
                    message.index = reader.bool();
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
            key: isSet(object.key) ? bytesFromBase64(object.key) : new Uint8Array(),
            value: isSet(object.value)
                ? bytesFromBase64(object.value)
                : new Uint8Array(),
            index: isSet(object.index) ? Boolean(object.index) : false,
        };
    },
    toJSON(message) {
        const obj = {};
        message.key !== undefined &&
            (obj.key = base64FromBytes(message.key !== undefined ? message.key : new Uint8Array()));
        message.value !== undefined &&
            (obj.value = base64FromBytes(message.value !== undefined ? message.value : new Uint8Array()));
        message.index !== undefined && (obj.index = message.index);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseEventAttribute();
        message.key = object.key ?? new Uint8Array();
        message.value = object.value ?? new Uint8Array();
        message.index = object.index ?? false;
        return message;
    },
    fromProtoMsg(message) {
        return EventAttribute.decode(message.value);
    },
    toProto(message) {
        return EventAttribute.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/tendermint.abci.EventAttribute',
            value: EventAttribute.encode(message).finish(),
        };
    },
};
function createBaseTxResult() {
    return {
        height: BigInt(0),
        index: 0,
        tx: new Uint8Array(),
        result: ResponseDeliverTx.fromPartial({}),
    };
}
export const TxResult = {
    typeUrl: '/tendermint.abci.TxResult',
    encode(message, writer = BinaryWriter.create()) {
        if (message.height !== BigInt(0)) {
            writer.uint32(8).int64(message.height);
        }
        if (message.index !== 0) {
            writer.uint32(16).uint32(message.index);
        }
        if (message.tx.length !== 0) {
            writer.uint32(26).bytes(message.tx);
        }
        if (message.result !== undefined) {
            ResponseDeliverTx.encode(message.result, writer.uint32(34).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseTxResult();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.height = reader.int64();
                    break;
                case 2:
                    message.index = reader.uint32();
                    break;
                case 3:
                    message.tx = reader.bytes();
                    break;
                case 4:
                    message.result = ResponseDeliverTx.decode(reader, reader.uint32());
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
            index: isSet(object.index) ? Number(object.index) : 0,
            tx: isSet(object.tx) ? bytesFromBase64(object.tx) : new Uint8Array(),
            result: isSet(object.result)
                ? ResponseDeliverTx.fromJSON(object.result)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.height !== undefined &&
            (obj.height = (message.height || BigInt(0)).toString());
        message.index !== undefined && (obj.index = Math.round(message.index));
        message.tx !== undefined &&
            (obj.tx = base64FromBytes(message.tx !== undefined ? message.tx : new Uint8Array()));
        message.result !== undefined &&
            (obj.result = message.result
                ? ResponseDeliverTx.toJSON(message.result)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseTxResult();
        message.height =
            object.height !== undefined && object.height !== null
                ? BigInt(object.height.toString())
                : BigInt(0);
        message.index = object.index ?? 0;
        message.tx = object.tx ?? new Uint8Array();
        message.result =
            object.result !== undefined && object.result !== null
                ? ResponseDeliverTx.fromPartial(object.result)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return TxResult.decode(message.value);
    },
    toProto(message) {
        return TxResult.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/tendermint.abci.TxResult',
            value: TxResult.encode(message).finish(),
        };
    },
};
function createBaseValidator() {
    return {
        address: new Uint8Array(),
        power: BigInt(0),
    };
}
export const Validator = {
    typeUrl: '/tendermint.abci.Validator',
    encode(message, writer = BinaryWriter.create()) {
        if (message.address.length !== 0) {
            writer.uint32(10).bytes(message.address);
        }
        if (message.power !== BigInt(0)) {
            writer.uint32(24).int64(message.power);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseValidator();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.address = reader.bytes();
                    break;
                case 3:
                    message.power = reader.int64();
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
            address: isSet(object.address)
                ? bytesFromBase64(object.address)
                : new Uint8Array(),
            power: isSet(object.power) ? BigInt(object.power.toString()) : BigInt(0),
        };
    },
    toJSON(message) {
        const obj = {};
        message.address !== undefined &&
            (obj.address = base64FromBytes(message.address !== undefined ? message.address : new Uint8Array()));
        message.power !== undefined &&
            (obj.power = (message.power || BigInt(0)).toString());
        return obj;
    },
    fromPartial(object) {
        const message = createBaseValidator();
        message.address = object.address ?? new Uint8Array();
        message.power =
            object.power !== undefined && object.power !== null
                ? BigInt(object.power.toString())
                : BigInt(0);
        return message;
    },
    fromProtoMsg(message) {
        return Validator.decode(message.value);
    },
    toProto(message) {
        return Validator.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/tendermint.abci.Validator',
            value: Validator.encode(message).finish(),
        };
    },
};
function createBaseValidatorUpdate() {
    return {
        pubKey: PublicKey.fromPartial({}),
        power: BigInt(0),
    };
}
export const ValidatorUpdate = {
    typeUrl: '/tendermint.abci.ValidatorUpdate',
    encode(message, writer = BinaryWriter.create()) {
        if (message.pubKey !== undefined) {
            PublicKey.encode(message.pubKey, writer.uint32(10).fork()).ldelim();
        }
        if (message.power !== BigInt(0)) {
            writer.uint32(16).int64(message.power);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseValidatorUpdate();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.pubKey = PublicKey.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.power = reader.int64();
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
            pubKey: isSet(object.pubKey)
                ? PublicKey.fromJSON(object.pubKey)
                : undefined,
            power: isSet(object.power) ? BigInt(object.power.toString()) : BigInt(0),
        };
    },
    toJSON(message) {
        const obj = {};
        message.pubKey !== undefined &&
            (obj.pubKey = message.pubKey
                ? PublicKey.toJSON(message.pubKey)
                : undefined);
        message.power !== undefined &&
            (obj.power = (message.power || BigInt(0)).toString());
        return obj;
    },
    fromPartial(object) {
        const message = createBaseValidatorUpdate();
        message.pubKey =
            object.pubKey !== undefined && object.pubKey !== null
                ? PublicKey.fromPartial(object.pubKey)
                : undefined;
        message.power =
            object.power !== undefined && object.power !== null
                ? BigInt(object.power.toString())
                : BigInt(0);
        return message;
    },
    fromProtoMsg(message) {
        return ValidatorUpdate.decode(message.value);
    },
    toProto(message) {
        return ValidatorUpdate.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/tendermint.abci.ValidatorUpdate',
            value: ValidatorUpdate.encode(message).finish(),
        };
    },
};
function createBaseVoteInfo() {
    return {
        validator: Validator.fromPartial({}),
        signedLastBlock: false,
    };
}
export const VoteInfo = {
    typeUrl: '/tendermint.abci.VoteInfo',
    encode(message, writer = BinaryWriter.create()) {
        if (message.validator !== undefined) {
            Validator.encode(message.validator, writer.uint32(10).fork()).ldelim();
        }
        if (message.signedLastBlock === true) {
            writer.uint32(16).bool(message.signedLastBlock);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseVoteInfo();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.validator = Validator.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.signedLastBlock = reader.bool();
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
            validator: isSet(object.validator)
                ? Validator.fromJSON(object.validator)
                : undefined,
            signedLastBlock: isSet(object.signedLastBlock)
                ? Boolean(object.signedLastBlock)
                : false,
        };
    },
    toJSON(message) {
        const obj = {};
        message.validator !== undefined &&
            (obj.validator = message.validator
                ? Validator.toJSON(message.validator)
                : undefined);
        message.signedLastBlock !== undefined &&
            (obj.signedLastBlock = message.signedLastBlock);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseVoteInfo();
        message.validator =
            object.validator !== undefined && object.validator !== null
                ? Validator.fromPartial(object.validator)
                : undefined;
        message.signedLastBlock = object.signedLastBlock ?? false;
        return message;
    },
    fromProtoMsg(message) {
        return VoteInfo.decode(message.value);
    },
    toProto(message) {
        return VoteInfo.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/tendermint.abci.VoteInfo',
            value: VoteInfo.encode(message).finish(),
        };
    },
};
function createBaseEvidence() {
    return {
        type: 0,
        validator: Validator.fromPartial({}),
        height: BigInt(0),
        time: Timestamp.fromPartial({}),
        totalVotingPower: BigInt(0),
    };
}
export const Evidence = {
    typeUrl: '/tendermint.abci.Evidence',
    encode(message, writer = BinaryWriter.create()) {
        if (message.type !== 0) {
            writer.uint32(8).int32(message.type);
        }
        if (message.validator !== undefined) {
            Validator.encode(message.validator, writer.uint32(18).fork()).ldelim();
        }
        if (message.height !== BigInt(0)) {
            writer.uint32(24).int64(message.height);
        }
        if (message.time !== undefined) {
            Timestamp.encode(message.time, writer.uint32(34).fork()).ldelim();
        }
        if (message.totalVotingPower !== BigInt(0)) {
            writer.uint32(40).int64(message.totalVotingPower);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseEvidence();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.type = reader.int32();
                    break;
                case 2:
                    message.validator = Validator.decode(reader, reader.uint32());
                    break;
                case 3:
                    message.height = reader.int64();
                    break;
                case 4:
                    message.time = Timestamp.decode(reader, reader.uint32());
                    break;
                case 5:
                    message.totalVotingPower = reader.int64();
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
            type: isSet(object.type) ? evidenceTypeFromJSON(object.type) : -1,
            validator: isSet(object.validator)
                ? Validator.fromJSON(object.validator)
                : undefined,
            height: isSet(object.height)
                ? BigInt(object.height.toString())
                : BigInt(0),
            time: isSet(object.time) ? fromJsonTimestamp(object.time) : undefined,
            totalVotingPower: isSet(object.totalVotingPower)
                ? BigInt(object.totalVotingPower.toString())
                : BigInt(0),
        };
    },
    toJSON(message) {
        const obj = {};
        message.type !== undefined && (obj.type = evidenceTypeToJSON(message.type));
        message.validator !== undefined &&
            (obj.validator = message.validator
                ? Validator.toJSON(message.validator)
                : undefined);
        message.height !== undefined &&
            (obj.height = (message.height || BigInt(0)).toString());
        message.time !== undefined &&
            (obj.time = fromTimestamp(message.time).toISOString());
        message.totalVotingPower !== undefined &&
            (obj.totalVotingPower = (message.totalVotingPower || BigInt(0)).toString());
        return obj;
    },
    fromPartial(object) {
        const message = createBaseEvidence();
        message.type = object.type ?? 0;
        message.validator =
            object.validator !== undefined && object.validator !== null
                ? Validator.fromPartial(object.validator)
                : undefined;
        message.height =
            object.height !== undefined && object.height !== null
                ? BigInt(object.height.toString())
                : BigInt(0);
        message.time =
            object.time !== undefined && object.time !== null
                ? Timestamp.fromPartial(object.time)
                : undefined;
        message.totalVotingPower =
            object.totalVotingPower !== undefined && object.totalVotingPower !== null
                ? BigInt(object.totalVotingPower.toString())
                : BigInt(0);
        return message;
    },
    fromProtoMsg(message) {
        return Evidence.decode(message.value);
    },
    toProto(message) {
        return Evidence.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/tendermint.abci.Evidence',
            value: Evidence.encode(message).finish(),
        };
    },
};
function createBaseSnapshot() {
    return {
        height: BigInt(0),
        format: 0,
        chunks: 0,
        hash: new Uint8Array(),
        metadata: new Uint8Array(),
    };
}
export const Snapshot = {
    typeUrl: '/tendermint.abci.Snapshot',
    encode(message, writer = BinaryWriter.create()) {
        if (message.height !== BigInt(0)) {
            writer.uint32(8).uint64(message.height);
        }
        if (message.format !== 0) {
            writer.uint32(16).uint32(message.format);
        }
        if (message.chunks !== 0) {
            writer.uint32(24).uint32(message.chunks);
        }
        if (message.hash.length !== 0) {
            writer.uint32(34).bytes(message.hash);
        }
        if (message.metadata.length !== 0) {
            writer.uint32(42).bytes(message.metadata);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseSnapshot();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.height = reader.uint64();
                    break;
                case 2:
                    message.format = reader.uint32();
                    break;
                case 3:
                    message.chunks = reader.uint32();
                    break;
                case 4:
                    message.hash = reader.bytes();
                    break;
                case 5:
                    message.metadata = reader.bytes();
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
            format: isSet(object.format) ? Number(object.format) : 0,
            chunks: isSet(object.chunks) ? Number(object.chunks) : 0,
            hash: isSet(object.hash)
                ? bytesFromBase64(object.hash)
                : new Uint8Array(),
            metadata: isSet(object.metadata)
                ? bytesFromBase64(object.metadata)
                : new Uint8Array(),
        };
    },
    toJSON(message) {
        const obj = {};
        message.height !== undefined &&
            (obj.height = (message.height || BigInt(0)).toString());
        message.format !== undefined && (obj.format = Math.round(message.format));
        message.chunks !== undefined && (obj.chunks = Math.round(message.chunks));
        message.hash !== undefined &&
            (obj.hash = base64FromBytes(message.hash !== undefined ? message.hash : new Uint8Array()));
        message.metadata !== undefined &&
            (obj.metadata = base64FromBytes(message.metadata !== undefined ? message.metadata : new Uint8Array()));
        return obj;
    },
    fromPartial(object) {
        const message = createBaseSnapshot();
        message.height =
            object.height !== undefined && object.height !== null
                ? BigInt(object.height.toString())
                : BigInt(0);
        message.format = object.format ?? 0;
        message.chunks = object.chunks ?? 0;
        message.hash = object.hash ?? new Uint8Array();
        message.metadata = object.metadata ?? new Uint8Array();
        return message;
    },
    fromProtoMsg(message) {
        return Snapshot.decode(message.value);
    },
    toProto(message) {
        return Snapshot.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/tendermint.abci.Snapshot',
            value: Snapshot.encode(message).finish(),
        };
    },
};
//# sourceMappingURL=types.js.map