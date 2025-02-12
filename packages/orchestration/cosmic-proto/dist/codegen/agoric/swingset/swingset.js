//@ts-nocheck
import { Coin } from '../../cosmos/base/v1beta1/coin.js';
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { isSet, bytesFromBase64, base64FromBytes } from '../../helpers.js';
import {} from '../../json-safe.js';
function createBaseCoreEvalProposal() {
    return {
        title: '',
        description: '',
        evals: [],
    };
}
export const CoreEvalProposal = {
    typeUrl: '/agoric.swingset.CoreEvalProposal',
    encode(message, writer = BinaryWriter.create()) {
        if (message.title !== '') {
            writer.uint32(10).string(message.title);
        }
        if (message.description !== '') {
            writer.uint32(18).string(message.description);
        }
        for (const v of message.evals) {
            CoreEval.encode(v, writer.uint32(26).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseCoreEvalProposal();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.title = reader.string();
                    break;
                case 2:
                    message.description = reader.string();
                    break;
                case 3:
                    message.evals.push(CoreEval.decode(reader, reader.uint32()));
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
            title: isSet(object.title) ? String(object.title) : '',
            description: isSet(object.description) ? String(object.description) : '',
            evals: Array.isArray(object?.evals)
                ? object.evals.map((e) => CoreEval.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        message.title !== undefined && (obj.title = message.title);
        message.description !== undefined &&
            (obj.description = message.description);
        if (message.evals) {
            obj.evals = message.evals.map(e => (e ? CoreEval.toJSON(e) : undefined));
        }
        else {
            obj.evals = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseCoreEvalProposal();
        message.title = object.title ?? '';
        message.description = object.description ?? '';
        message.evals = object.evals?.map(e => CoreEval.fromPartial(e)) || [];
        return message;
    },
    fromProtoMsg(message) {
        return CoreEvalProposal.decode(message.value);
    },
    toProto(message) {
        return CoreEvalProposal.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/agoric.swingset.CoreEvalProposal',
            value: CoreEvalProposal.encode(message).finish(),
        };
    },
};
function createBaseCoreEval() {
    return {
        jsonPermits: '',
        jsCode: '',
    };
}
export const CoreEval = {
    typeUrl: '/agoric.swingset.CoreEval',
    encode(message, writer = BinaryWriter.create()) {
        if (message.jsonPermits !== '') {
            writer.uint32(10).string(message.jsonPermits);
        }
        if (message.jsCode !== '') {
            writer.uint32(18).string(message.jsCode);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseCoreEval();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.jsonPermits = reader.string();
                    break;
                case 2:
                    message.jsCode = reader.string();
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
            jsonPermits: isSet(object.jsonPermits) ? String(object.jsonPermits) : '',
            jsCode: isSet(object.jsCode) ? String(object.jsCode) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.jsonPermits !== undefined &&
            (obj.jsonPermits = message.jsonPermits);
        message.jsCode !== undefined && (obj.jsCode = message.jsCode);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseCoreEval();
        message.jsonPermits = object.jsonPermits ?? '';
        message.jsCode = object.jsCode ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return CoreEval.decode(message.value);
    },
    toProto(message) {
        return CoreEval.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/agoric.swingset.CoreEval',
            value: CoreEval.encode(message).finish(),
        };
    },
};
function createBaseParams() {
    return {
        beansPerUnit: [],
        feeUnitPrice: [],
        bootstrapVatConfig: '',
        powerFlagFees: [],
        queueMax: [],
        vatCleanupBudget: [],
    };
}
export const Params = {
    typeUrl: '/agoric.swingset.Params',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.beansPerUnit) {
            StringBeans.encode(v, writer.uint32(10).fork()).ldelim();
        }
        for (const v of message.feeUnitPrice) {
            Coin.encode(v, writer.uint32(18).fork()).ldelim();
        }
        if (message.bootstrapVatConfig !== '') {
            writer.uint32(26).string(message.bootstrapVatConfig);
        }
        for (const v of message.powerFlagFees) {
            PowerFlagFee.encode(v, writer.uint32(34).fork()).ldelim();
        }
        for (const v of message.queueMax) {
            QueueSize.encode(v, writer.uint32(42).fork()).ldelim();
        }
        for (const v of message.vatCleanupBudget) {
            UintMapEntry.encode(v, writer.uint32(50).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseParams();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.beansPerUnit.push(StringBeans.decode(reader, reader.uint32()));
                    break;
                case 2:
                    message.feeUnitPrice.push(Coin.decode(reader, reader.uint32()));
                    break;
                case 3:
                    message.bootstrapVatConfig = reader.string();
                    break;
                case 4:
                    message.powerFlagFees.push(PowerFlagFee.decode(reader, reader.uint32()));
                    break;
                case 5:
                    message.queueMax.push(QueueSize.decode(reader, reader.uint32()));
                    break;
                case 6:
                    message.vatCleanupBudget.push(UintMapEntry.decode(reader, reader.uint32()));
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
            beansPerUnit: Array.isArray(object?.beansPerUnit)
                ? object.beansPerUnit.map((e) => StringBeans.fromJSON(e))
                : [],
            feeUnitPrice: Array.isArray(object?.feeUnitPrice)
                ? object.feeUnitPrice.map((e) => Coin.fromJSON(e))
                : [],
            bootstrapVatConfig: isSet(object.bootstrapVatConfig)
                ? String(object.bootstrapVatConfig)
                : '',
            powerFlagFees: Array.isArray(object?.powerFlagFees)
                ? object.powerFlagFees.map((e) => PowerFlagFee.fromJSON(e))
                : [],
            queueMax: Array.isArray(object?.queueMax)
                ? object.queueMax.map((e) => QueueSize.fromJSON(e))
                : [],
            vatCleanupBudget: Array.isArray(object?.vatCleanupBudget)
                ? object.vatCleanupBudget.map((e) => UintMapEntry.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.beansPerUnit) {
            obj.beansPerUnit = message.beansPerUnit.map(e => e ? StringBeans.toJSON(e) : undefined);
        }
        else {
            obj.beansPerUnit = [];
        }
        if (message.feeUnitPrice) {
            obj.feeUnitPrice = message.feeUnitPrice.map(e => e ? Coin.toJSON(e) : undefined);
        }
        else {
            obj.feeUnitPrice = [];
        }
        message.bootstrapVatConfig !== undefined &&
            (obj.bootstrapVatConfig = message.bootstrapVatConfig);
        if (message.powerFlagFees) {
            obj.powerFlagFees = message.powerFlagFees.map(e => e ? PowerFlagFee.toJSON(e) : undefined);
        }
        else {
            obj.powerFlagFees = [];
        }
        if (message.queueMax) {
            obj.queueMax = message.queueMax.map(e => e ? QueueSize.toJSON(e) : undefined);
        }
        else {
            obj.queueMax = [];
        }
        if (message.vatCleanupBudget) {
            obj.vatCleanupBudget = message.vatCleanupBudget.map(e => e ? UintMapEntry.toJSON(e) : undefined);
        }
        else {
            obj.vatCleanupBudget = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseParams();
        message.beansPerUnit =
            object.beansPerUnit?.map(e => StringBeans.fromPartial(e)) || [];
        message.feeUnitPrice =
            object.feeUnitPrice?.map(e => Coin.fromPartial(e)) || [];
        message.bootstrapVatConfig = object.bootstrapVatConfig ?? '';
        message.powerFlagFees =
            object.powerFlagFees?.map(e => PowerFlagFee.fromPartial(e)) || [];
        message.queueMax =
            object.queueMax?.map(e => QueueSize.fromPartial(e)) || [];
        message.vatCleanupBudget =
            object.vatCleanupBudget?.map(e => UintMapEntry.fromPartial(e)) || [];
        return message;
    },
    fromProtoMsg(message) {
        return Params.decode(message.value);
    },
    toProto(message) {
        return Params.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/agoric.swingset.Params',
            value: Params.encode(message).finish(),
        };
    },
};
function createBaseState() {
    return {
        queueAllowed: [],
    };
}
export const State = {
    typeUrl: '/agoric.swingset.State',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.queueAllowed) {
            QueueSize.encode(v, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseState();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.queueAllowed.push(QueueSize.decode(reader, reader.uint32()));
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
            queueAllowed: Array.isArray(object?.queueAllowed)
                ? object.queueAllowed.map((e) => QueueSize.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.queueAllowed) {
            obj.queueAllowed = message.queueAllowed.map(e => e ? QueueSize.toJSON(e) : undefined);
        }
        else {
            obj.queueAllowed = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseState();
        message.queueAllowed =
            object.queueAllowed?.map(e => QueueSize.fromPartial(e)) || [];
        return message;
    },
    fromProtoMsg(message) {
        return State.decode(message.value);
    },
    toProto(message) {
        return State.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/agoric.swingset.State',
            value: State.encode(message).finish(),
        };
    },
};
function createBaseStringBeans() {
    return {
        key: '',
        beans: '',
    };
}
export const StringBeans = {
    typeUrl: '/agoric.swingset.StringBeans',
    encode(message, writer = BinaryWriter.create()) {
        if (message.key !== '') {
            writer.uint32(10).string(message.key);
        }
        if (message.beans !== '') {
            writer.uint32(18).string(message.beans);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseStringBeans();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.key = reader.string();
                    break;
                case 2:
                    message.beans = reader.string();
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
            beans: isSet(object.beans) ? String(object.beans) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.key !== undefined && (obj.key = message.key);
        message.beans !== undefined && (obj.beans = message.beans);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseStringBeans();
        message.key = object.key ?? '';
        message.beans = object.beans ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return StringBeans.decode(message.value);
    },
    toProto(message) {
        return StringBeans.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/agoric.swingset.StringBeans',
            value: StringBeans.encode(message).finish(),
        };
    },
};
function createBasePowerFlagFee() {
    return {
        powerFlag: '',
        fee: [],
    };
}
export const PowerFlagFee = {
    typeUrl: '/agoric.swingset.PowerFlagFee',
    encode(message, writer = BinaryWriter.create()) {
        if (message.powerFlag !== '') {
            writer.uint32(10).string(message.powerFlag);
        }
        for (const v of message.fee) {
            Coin.encode(v, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBasePowerFlagFee();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.powerFlag = reader.string();
                    break;
                case 2:
                    message.fee.push(Coin.decode(reader, reader.uint32()));
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
            powerFlag: isSet(object.powerFlag) ? String(object.powerFlag) : '',
            fee: Array.isArray(object?.fee)
                ? object.fee.map((e) => Coin.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        message.powerFlag !== undefined && (obj.powerFlag = message.powerFlag);
        if (message.fee) {
            obj.fee = message.fee.map(e => (e ? Coin.toJSON(e) : undefined));
        }
        else {
            obj.fee = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBasePowerFlagFee();
        message.powerFlag = object.powerFlag ?? '';
        message.fee = object.fee?.map(e => Coin.fromPartial(e)) || [];
        return message;
    },
    fromProtoMsg(message) {
        return PowerFlagFee.decode(message.value);
    },
    toProto(message) {
        return PowerFlagFee.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/agoric.swingset.PowerFlagFee',
            value: PowerFlagFee.encode(message).finish(),
        };
    },
};
function createBaseQueueSize() {
    return {
        key: '',
        size: 0,
    };
}
export const QueueSize = {
    typeUrl: '/agoric.swingset.QueueSize',
    encode(message, writer = BinaryWriter.create()) {
        if (message.key !== '') {
            writer.uint32(10).string(message.key);
        }
        if (message.size !== 0) {
            writer.uint32(16).int32(message.size);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueueSize();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.key = reader.string();
                    break;
                case 2:
                    message.size = reader.int32();
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
            size: isSet(object.size) ? Number(object.size) : 0,
        };
    },
    toJSON(message) {
        const obj = {};
        message.key !== undefined && (obj.key = message.key);
        message.size !== undefined && (obj.size = Math.round(message.size));
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueueSize();
        message.key = object.key ?? '';
        message.size = object.size ?? 0;
        return message;
    },
    fromProtoMsg(message) {
        return QueueSize.decode(message.value);
    },
    toProto(message) {
        return QueueSize.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/agoric.swingset.QueueSize',
            value: QueueSize.encode(message).finish(),
        };
    },
};
function createBaseUintMapEntry() {
    return {
        key: '',
        value: '',
    };
}
export const UintMapEntry = {
    typeUrl: '/agoric.swingset.UintMapEntry',
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
        const message = createBaseUintMapEntry();
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
        const message = createBaseUintMapEntry();
        message.key = object.key ?? '';
        message.value = object.value ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return UintMapEntry.decode(message.value);
    },
    toProto(message) {
        return UintMapEntry.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/agoric.swingset.UintMapEntry',
            value: UintMapEntry.encode(message).finish(),
        };
    },
};
function createBaseEgress() {
    return {
        nickname: '',
        peer: new Uint8Array(),
        powerFlags: [],
    };
}
export const Egress = {
    typeUrl: '/agoric.swingset.Egress',
    encode(message, writer = BinaryWriter.create()) {
        if (message.nickname !== '') {
            writer.uint32(10).string(message.nickname);
        }
        if (message.peer.length !== 0) {
            writer.uint32(18).bytes(message.peer);
        }
        for (const v of message.powerFlags) {
            writer.uint32(26).string(v);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseEgress();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.nickname = reader.string();
                    break;
                case 2:
                    message.peer = reader.bytes();
                    break;
                case 3:
                    message.powerFlags.push(reader.string());
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
            nickname: isSet(object.nickname) ? String(object.nickname) : '',
            peer: isSet(object.peer)
                ? bytesFromBase64(object.peer)
                : new Uint8Array(),
            powerFlags: Array.isArray(object?.powerFlags)
                ? object.powerFlags.map((e) => String(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        message.nickname !== undefined && (obj.nickname = message.nickname);
        message.peer !== undefined &&
            (obj.peer = base64FromBytes(message.peer !== undefined ? message.peer : new Uint8Array()));
        if (message.powerFlags) {
            obj.powerFlags = message.powerFlags.map(e => e);
        }
        else {
            obj.powerFlags = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseEgress();
        message.nickname = object.nickname ?? '';
        message.peer = object.peer ?? new Uint8Array();
        message.powerFlags = object.powerFlags?.map(e => e) || [];
        return message;
    },
    fromProtoMsg(message) {
        return Egress.decode(message.value);
    },
    toProto(message) {
        return Egress.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/agoric.swingset.Egress',
            value: Egress.encode(message).finish(),
        };
    },
};
function createBaseSwingStoreArtifact() {
    return {
        name: '',
        data: new Uint8Array(),
    };
}
export const SwingStoreArtifact = {
    typeUrl: '/agoric.swingset.SwingStoreArtifact',
    encode(message, writer = BinaryWriter.create()) {
        if (message.name !== '') {
            writer.uint32(10).string(message.name);
        }
        if (message.data.length !== 0) {
            writer.uint32(18).bytes(message.data);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseSwingStoreArtifact();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.name = reader.string();
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
            name: isSet(object.name) ? String(object.name) : '',
            data: isSet(object.data)
                ? bytesFromBase64(object.data)
                : new Uint8Array(),
        };
    },
    toJSON(message) {
        const obj = {};
        message.name !== undefined && (obj.name = message.name);
        message.data !== undefined &&
            (obj.data = base64FromBytes(message.data !== undefined ? message.data : new Uint8Array()));
        return obj;
    },
    fromPartial(object) {
        const message = createBaseSwingStoreArtifact();
        message.name = object.name ?? '';
        message.data = object.data ?? new Uint8Array();
        return message;
    },
    fromProtoMsg(message) {
        return SwingStoreArtifact.decode(message.value);
    },
    toProto(message) {
        return SwingStoreArtifact.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/agoric.swingset.SwingStoreArtifact',
            value: SwingStoreArtifact.encode(message).finish(),
        };
    },
};
//# sourceMappingURL=swingset.js.map