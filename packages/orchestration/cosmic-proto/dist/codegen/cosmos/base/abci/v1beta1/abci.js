//@ts-nocheck
import { Any } from '../../../../google/protobuf/any.js';
import { Event } from '../../../../tendermint/abci/types.js';
import { BinaryReader, BinaryWriter } from '../../../../binary.js';
import { isSet, bytesFromBase64, base64FromBytes, } from '../../../../helpers.js';
import {} from '../../../../json-safe.js';
function createBaseTxResponse() {
    return {
        height: BigInt(0),
        txhash: '',
        codespace: '',
        code: 0,
        data: '',
        rawLog: '',
        logs: [],
        info: '',
        gasWanted: BigInt(0),
        gasUsed: BigInt(0),
        tx: undefined,
        timestamp: '',
        events: [],
    };
}
export const TxResponse = {
    typeUrl: '/cosmos.base.abci.v1beta1.TxResponse',
    encode(message, writer = BinaryWriter.create()) {
        if (message.height !== BigInt(0)) {
            writer.uint32(8).int64(message.height);
        }
        if (message.txhash !== '') {
            writer.uint32(18).string(message.txhash);
        }
        if (message.codespace !== '') {
            writer.uint32(26).string(message.codespace);
        }
        if (message.code !== 0) {
            writer.uint32(32).uint32(message.code);
        }
        if (message.data !== '') {
            writer.uint32(42).string(message.data);
        }
        if (message.rawLog !== '') {
            writer.uint32(50).string(message.rawLog);
        }
        for (const v of message.logs) {
            ABCIMessageLog.encode(v, writer.uint32(58).fork()).ldelim();
        }
        if (message.info !== '') {
            writer.uint32(66).string(message.info);
        }
        if (message.gasWanted !== BigInt(0)) {
            writer.uint32(72).int64(message.gasWanted);
        }
        if (message.gasUsed !== BigInt(0)) {
            writer.uint32(80).int64(message.gasUsed);
        }
        if (message.tx !== undefined) {
            Any.encode(message.tx, writer.uint32(90).fork()).ldelim();
        }
        if (message.timestamp !== '') {
            writer.uint32(98).string(message.timestamp);
        }
        for (const v of message.events) {
            Event.encode(v, writer.uint32(106).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseTxResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.height = reader.int64();
                    break;
                case 2:
                    message.txhash = reader.string();
                    break;
                case 3:
                    message.codespace = reader.string();
                    break;
                case 4:
                    message.code = reader.uint32();
                    break;
                case 5:
                    message.data = reader.string();
                    break;
                case 6:
                    message.rawLog = reader.string();
                    break;
                case 7:
                    message.logs.push(ABCIMessageLog.decode(reader, reader.uint32()));
                    break;
                case 8:
                    message.info = reader.string();
                    break;
                case 9:
                    message.gasWanted = reader.int64();
                    break;
                case 10:
                    message.gasUsed = reader.int64();
                    break;
                case 11:
                    message.tx = Any.decode(reader, reader.uint32());
                    break;
                case 12:
                    message.timestamp = reader.string();
                    break;
                case 13:
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
            height: isSet(object.height)
                ? BigInt(object.height.toString())
                : BigInt(0),
            txhash: isSet(object.txhash) ? String(object.txhash) : '',
            codespace: isSet(object.codespace) ? String(object.codespace) : '',
            code: isSet(object.code) ? Number(object.code) : 0,
            data: isSet(object.data) ? String(object.data) : '',
            rawLog: isSet(object.rawLog) ? String(object.rawLog) : '',
            logs: Array.isArray(object?.logs)
                ? object.logs.map((e) => ABCIMessageLog.fromJSON(e))
                : [],
            info: isSet(object.info) ? String(object.info) : '',
            gasWanted: isSet(object.gasWanted)
                ? BigInt(object.gasWanted.toString())
                : BigInt(0),
            gasUsed: isSet(object.gasUsed)
                ? BigInt(object.gasUsed.toString())
                : BigInt(0),
            tx: isSet(object.tx) ? Any.fromJSON(object.tx) : undefined,
            timestamp: isSet(object.timestamp) ? String(object.timestamp) : '',
            events: Array.isArray(object?.events)
                ? object.events.map((e) => Event.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        message.height !== undefined &&
            (obj.height = (message.height || BigInt(0)).toString());
        message.txhash !== undefined && (obj.txhash = message.txhash);
        message.codespace !== undefined && (obj.codespace = message.codespace);
        message.code !== undefined && (obj.code = Math.round(message.code));
        message.data !== undefined && (obj.data = message.data);
        message.rawLog !== undefined && (obj.rawLog = message.rawLog);
        if (message.logs) {
            obj.logs = message.logs.map(e => e ? ABCIMessageLog.toJSON(e) : undefined);
        }
        else {
            obj.logs = [];
        }
        message.info !== undefined && (obj.info = message.info);
        message.gasWanted !== undefined &&
            (obj.gasWanted = (message.gasWanted || BigInt(0)).toString());
        message.gasUsed !== undefined &&
            (obj.gasUsed = (message.gasUsed || BigInt(0)).toString());
        message.tx !== undefined &&
            (obj.tx = message.tx ? Any.toJSON(message.tx) : undefined);
        message.timestamp !== undefined && (obj.timestamp = message.timestamp);
        if (message.events) {
            obj.events = message.events.map(e => (e ? Event.toJSON(e) : undefined));
        }
        else {
            obj.events = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseTxResponse();
        message.height =
            object.height !== undefined && object.height !== null
                ? BigInt(object.height.toString())
                : BigInt(0);
        message.txhash = object.txhash ?? '';
        message.codespace = object.codespace ?? '';
        message.code = object.code ?? 0;
        message.data = object.data ?? '';
        message.rawLog = object.rawLog ?? '';
        message.logs = object.logs?.map(e => ABCIMessageLog.fromPartial(e)) || [];
        message.info = object.info ?? '';
        message.gasWanted =
            object.gasWanted !== undefined && object.gasWanted !== null
                ? BigInt(object.gasWanted.toString())
                : BigInt(0);
        message.gasUsed =
            object.gasUsed !== undefined && object.gasUsed !== null
                ? BigInt(object.gasUsed.toString())
                : BigInt(0);
        message.tx =
            object.tx !== undefined && object.tx !== null
                ? Any.fromPartial(object.tx)
                : undefined;
        message.timestamp = object.timestamp ?? '';
        message.events = object.events?.map(e => Event.fromPartial(e)) || [];
        return message;
    },
    fromProtoMsg(message) {
        return TxResponse.decode(message.value);
    },
    toProto(message) {
        return TxResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.base.abci.v1beta1.TxResponse',
            value: TxResponse.encode(message).finish(),
        };
    },
};
function createBaseABCIMessageLog() {
    return {
        msgIndex: 0,
        log: '',
        events: [],
    };
}
export const ABCIMessageLog = {
    typeUrl: '/cosmos.base.abci.v1beta1.ABCIMessageLog',
    encode(message, writer = BinaryWriter.create()) {
        if (message.msgIndex !== 0) {
            writer.uint32(8).uint32(message.msgIndex);
        }
        if (message.log !== '') {
            writer.uint32(18).string(message.log);
        }
        for (const v of message.events) {
            StringEvent.encode(v, writer.uint32(26).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseABCIMessageLog();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.msgIndex = reader.uint32();
                    break;
                case 2:
                    message.log = reader.string();
                    break;
                case 3:
                    message.events.push(StringEvent.decode(reader, reader.uint32()));
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
            msgIndex: isSet(object.msgIndex) ? Number(object.msgIndex) : 0,
            log: isSet(object.log) ? String(object.log) : '',
            events: Array.isArray(object?.events)
                ? object.events.map((e) => StringEvent.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        message.msgIndex !== undefined &&
            (obj.msgIndex = Math.round(message.msgIndex));
        message.log !== undefined && (obj.log = message.log);
        if (message.events) {
            obj.events = message.events.map(e => e ? StringEvent.toJSON(e) : undefined);
        }
        else {
            obj.events = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseABCIMessageLog();
        message.msgIndex = object.msgIndex ?? 0;
        message.log = object.log ?? '';
        message.events = object.events?.map(e => StringEvent.fromPartial(e)) || [];
        return message;
    },
    fromProtoMsg(message) {
        return ABCIMessageLog.decode(message.value);
    },
    toProto(message) {
        return ABCIMessageLog.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.base.abci.v1beta1.ABCIMessageLog',
            value: ABCIMessageLog.encode(message).finish(),
        };
    },
};
function createBaseStringEvent() {
    return {
        type: '',
        attributes: [],
    };
}
export const StringEvent = {
    typeUrl: '/cosmos.base.abci.v1beta1.StringEvent',
    encode(message, writer = BinaryWriter.create()) {
        if (message.type !== '') {
            writer.uint32(10).string(message.type);
        }
        for (const v of message.attributes) {
            Attribute.encode(v, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseStringEvent();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.type = reader.string();
                    break;
                case 2:
                    message.attributes.push(Attribute.decode(reader, reader.uint32()));
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
                ? object.attributes.map((e) => Attribute.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        message.type !== undefined && (obj.type = message.type);
        if (message.attributes) {
            obj.attributes = message.attributes.map(e => e ? Attribute.toJSON(e) : undefined);
        }
        else {
            obj.attributes = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseStringEvent();
        message.type = object.type ?? '';
        message.attributes =
            object.attributes?.map(e => Attribute.fromPartial(e)) || [];
        return message;
    },
    fromProtoMsg(message) {
        return StringEvent.decode(message.value);
    },
    toProto(message) {
        return StringEvent.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.base.abci.v1beta1.StringEvent',
            value: StringEvent.encode(message).finish(),
        };
    },
};
function createBaseAttribute() {
    return {
        key: '',
        value: '',
    };
}
export const Attribute = {
    typeUrl: '/cosmos.base.abci.v1beta1.Attribute',
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
        const message = createBaseAttribute();
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
        const message = createBaseAttribute();
        message.key = object.key ?? '';
        message.value = object.value ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return Attribute.decode(message.value);
    },
    toProto(message) {
        return Attribute.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.base.abci.v1beta1.Attribute',
            value: Attribute.encode(message).finish(),
        };
    },
};
function createBaseGasInfo() {
    return {
        gasWanted: BigInt(0),
        gasUsed: BigInt(0),
    };
}
export const GasInfo = {
    typeUrl: '/cosmos.base.abci.v1beta1.GasInfo',
    encode(message, writer = BinaryWriter.create()) {
        if (message.gasWanted !== BigInt(0)) {
            writer.uint32(8).uint64(message.gasWanted);
        }
        if (message.gasUsed !== BigInt(0)) {
            writer.uint32(16).uint64(message.gasUsed);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseGasInfo();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.gasWanted = reader.uint64();
                    break;
                case 2:
                    message.gasUsed = reader.uint64();
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
            gasWanted: isSet(object.gasWanted)
                ? BigInt(object.gasWanted.toString())
                : BigInt(0),
            gasUsed: isSet(object.gasUsed)
                ? BigInt(object.gasUsed.toString())
                : BigInt(0),
        };
    },
    toJSON(message) {
        const obj = {};
        message.gasWanted !== undefined &&
            (obj.gasWanted = (message.gasWanted || BigInt(0)).toString());
        message.gasUsed !== undefined &&
            (obj.gasUsed = (message.gasUsed || BigInt(0)).toString());
        return obj;
    },
    fromPartial(object) {
        const message = createBaseGasInfo();
        message.gasWanted =
            object.gasWanted !== undefined && object.gasWanted !== null
                ? BigInt(object.gasWanted.toString())
                : BigInt(0);
        message.gasUsed =
            object.gasUsed !== undefined && object.gasUsed !== null
                ? BigInt(object.gasUsed.toString())
                : BigInt(0);
        return message;
    },
    fromProtoMsg(message) {
        return GasInfo.decode(message.value);
    },
    toProto(message) {
        return GasInfo.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.base.abci.v1beta1.GasInfo',
            value: GasInfo.encode(message).finish(),
        };
    },
};
function createBaseResult() {
    return {
        data: new Uint8Array(),
        log: '',
        events: [],
        msgResponses: [],
    };
}
export const Result = {
    typeUrl: '/cosmos.base.abci.v1beta1.Result',
    encode(message, writer = BinaryWriter.create()) {
        if (message.data.length !== 0) {
            writer.uint32(10).bytes(message.data);
        }
        if (message.log !== '') {
            writer.uint32(18).string(message.log);
        }
        for (const v of message.events) {
            Event.encode(v, writer.uint32(26).fork()).ldelim();
        }
        for (const v of message.msgResponses) {
            Any.encode(v, writer.uint32(34).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseResult();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.data = reader.bytes();
                    break;
                case 2:
                    message.log = reader.string();
                    break;
                case 3:
                    message.events.push(Event.decode(reader, reader.uint32()));
                    break;
                case 4:
                    message.msgResponses.push(Any.decode(reader, reader.uint32()));
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
            log: isSet(object.log) ? String(object.log) : '',
            events: Array.isArray(object?.events)
                ? object.events.map((e) => Event.fromJSON(e))
                : [],
            msgResponses: Array.isArray(object?.msgResponses)
                ? object.msgResponses.map((e) => Any.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        message.data !== undefined &&
            (obj.data = base64FromBytes(message.data !== undefined ? message.data : new Uint8Array()));
        message.log !== undefined && (obj.log = message.log);
        if (message.events) {
            obj.events = message.events.map(e => (e ? Event.toJSON(e) : undefined));
        }
        else {
            obj.events = [];
        }
        if (message.msgResponses) {
            obj.msgResponses = message.msgResponses.map(e => e ? Any.toJSON(e) : undefined);
        }
        else {
            obj.msgResponses = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseResult();
        message.data = object.data ?? new Uint8Array();
        message.log = object.log ?? '';
        message.events = object.events?.map(e => Event.fromPartial(e)) || [];
        message.msgResponses =
            object.msgResponses?.map(e => Any.fromPartial(e)) || [];
        return message;
    },
    fromProtoMsg(message) {
        return Result.decode(message.value);
    },
    toProto(message) {
        return Result.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.base.abci.v1beta1.Result',
            value: Result.encode(message).finish(),
        };
    },
};
function createBaseSimulationResponse() {
    return {
        gasInfo: GasInfo.fromPartial({}),
        result: undefined,
    };
}
export const SimulationResponse = {
    typeUrl: '/cosmos.base.abci.v1beta1.SimulationResponse',
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
        const message = createBaseSimulationResponse();
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
        const message = createBaseSimulationResponse();
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
        return SimulationResponse.decode(message.value);
    },
    toProto(message) {
        return SimulationResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.base.abci.v1beta1.SimulationResponse',
            value: SimulationResponse.encode(message).finish(),
        };
    },
};
function createBaseMsgData() {
    return {
        msgType: '',
        data: new Uint8Array(),
    };
}
export const MsgData = {
    typeUrl: '/cosmos.base.abci.v1beta1.MsgData',
    encode(message, writer = BinaryWriter.create()) {
        if (message.msgType !== '') {
            writer.uint32(10).string(message.msgType);
        }
        if (message.data.length !== 0) {
            writer.uint32(18).bytes(message.data);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgData();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.msgType = reader.string();
                    break;
                case 2:
                    message.data = reader.bytes();
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
            msgType: isSet(object.msgType) ? String(object.msgType) : '',
            data: isSet(object.data)
                ? bytesFromBase64(object.data)
                : new Uint8Array(),
        };
    },
    toJSON(message) {
        const obj = {};
        message.msgType !== undefined && (obj.msgType = message.msgType);
        message.data !== undefined &&
            (obj.data = base64FromBytes(message.data !== undefined ? message.data : new Uint8Array()));
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgData();
        message.msgType = object.msgType ?? '';
        message.data = object.data ?? new Uint8Array();
        return message;
    },
    fromProtoMsg(message) {
        return MsgData.decode(message.value);
    },
    toProto(message) {
        return MsgData.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.base.abci.v1beta1.MsgData',
            value: MsgData.encode(message).finish(),
        };
    },
};
function createBaseTxMsgData() {
    return {
        data: [],
        msgResponses: [],
    };
}
export const TxMsgData = {
    typeUrl: '/cosmos.base.abci.v1beta1.TxMsgData',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.data) {
            MsgData.encode(v, writer.uint32(10).fork()).ldelim();
        }
        for (const v of message.msgResponses) {
            Any.encode(v, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseTxMsgData();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.data.push(MsgData.decode(reader, reader.uint32()));
                    break;
                case 2:
                    message.msgResponses.push(Any.decode(reader, reader.uint32()));
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
            data: Array.isArray(object?.data)
                ? object.data.map((e) => MsgData.fromJSON(e))
                : [],
            msgResponses: Array.isArray(object?.msgResponses)
                ? object.msgResponses.map((e) => Any.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.data) {
            obj.data = message.data.map(e => (e ? MsgData.toJSON(e) : undefined));
        }
        else {
            obj.data = [];
        }
        if (message.msgResponses) {
            obj.msgResponses = message.msgResponses.map(e => e ? Any.toJSON(e) : undefined);
        }
        else {
            obj.msgResponses = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseTxMsgData();
        message.data = object.data?.map(e => MsgData.fromPartial(e)) || [];
        message.msgResponses =
            object.msgResponses?.map(e => Any.fromPartial(e)) || [];
        return message;
    },
    fromProtoMsg(message) {
        return TxMsgData.decode(message.value);
    },
    toProto(message) {
        return TxMsgData.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.base.abci.v1beta1.TxMsgData',
            value: TxMsgData.encode(message).finish(),
        };
    },
};
function createBaseSearchTxsResult() {
    return {
        totalCount: BigInt(0),
        count: BigInt(0),
        pageNumber: BigInt(0),
        pageTotal: BigInt(0),
        limit: BigInt(0),
        txs: [],
    };
}
export const SearchTxsResult = {
    typeUrl: '/cosmos.base.abci.v1beta1.SearchTxsResult',
    encode(message, writer = BinaryWriter.create()) {
        if (message.totalCount !== BigInt(0)) {
            writer.uint32(8).uint64(message.totalCount);
        }
        if (message.count !== BigInt(0)) {
            writer.uint32(16).uint64(message.count);
        }
        if (message.pageNumber !== BigInt(0)) {
            writer.uint32(24).uint64(message.pageNumber);
        }
        if (message.pageTotal !== BigInt(0)) {
            writer.uint32(32).uint64(message.pageTotal);
        }
        if (message.limit !== BigInt(0)) {
            writer.uint32(40).uint64(message.limit);
        }
        for (const v of message.txs) {
            TxResponse.encode(v, writer.uint32(50).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseSearchTxsResult();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.totalCount = reader.uint64();
                    break;
                case 2:
                    message.count = reader.uint64();
                    break;
                case 3:
                    message.pageNumber = reader.uint64();
                    break;
                case 4:
                    message.pageTotal = reader.uint64();
                    break;
                case 5:
                    message.limit = reader.uint64();
                    break;
                case 6:
                    message.txs.push(TxResponse.decode(reader, reader.uint32()));
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
            totalCount: isSet(object.totalCount)
                ? BigInt(object.totalCount.toString())
                : BigInt(0),
            count: isSet(object.count) ? BigInt(object.count.toString()) : BigInt(0),
            pageNumber: isSet(object.pageNumber)
                ? BigInt(object.pageNumber.toString())
                : BigInt(0),
            pageTotal: isSet(object.pageTotal)
                ? BigInt(object.pageTotal.toString())
                : BigInt(0),
            limit: isSet(object.limit) ? BigInt(object.limit.toString()) : BigInt(0),
            txs: Array.isArray(object?.txs)
                ? object.txs.map((e) => TxResponse.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        message.totalCount !== undefined &&
            (obj.totalCount = (message.totalCount || BigInt(0)).toString());
        message.count !== undefined &&
            (obj.count = (message.count || BigInt(0)).toString());
        message.pageNumber !== undefined &&
            (obj.pageNumber = (message.pageNumber || BigInt(0)).toString());
        message.pageTotal !== undefined &&
            (obj.pageTotal = (message.pageTotal || BigInt(0)).toString());
        message.limit !== undefined &&
            (obj.limit = (message.limit || BigInt(0)).toString());
        if (message.txs) {
            obj.txs = message.txs.map(e => (e ? TxResponse.toJSON(e) : undefined));
        }
        else {
            obj.txs = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseSearchTxsResult();
        message.totalCount =
            object.totalCount !== undefined && object.totalCount !== null
                ? BigInt(object.totalCount.toString())
                : BigInt(0);
        message.count =
            object.count !== undefined && object.count !== null
                ? BigInt(object.count.toString())
                : BigInt(0);
        message.pageNumber =
            object.pageNumber !== undefined && object.pageNumber !== null
                ? BigInt(object.pageNumber.toString())
                : BigInt(0);
        message.pageTotal =
            object.pageTotal !== undefined && object.pageTotal !== null
                ? BigInt(object.pageTotal.toString())
                : BigInt(0);
        message.limit =
            object.limit !== undefined && object.limit !== null
                ? BigInt(object.limit.toString())
                : BigInt(0);
        message.txs = object.txs?.map(e => TxResponse.fromPartial(e)) || [];
        return message;
    },
    fromProtoMsg(message) {
        return SearchTxsResult.decode(message.value);
    },
    toProto(message) {
        return SearchTxsResult.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.base.abci.v1beta1.SearchTxsResult',
            value: SearchTxsResult.encode(message).finish(),
        };
    },
};
//# sourceMappingURL=abci.js.map