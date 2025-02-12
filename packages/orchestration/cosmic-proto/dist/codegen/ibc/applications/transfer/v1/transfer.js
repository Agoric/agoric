//@ts-nocheck
import { BinaryReader, BinaryWriter } from '../../../../binary.js';
import { isSet } from '../../../../helpers.js';
import {} from '../../../../json-safe.js';
function createBaseDenomTrace() {
    return {
        path: '',
        baseDenom: '',
    };
}
export const DenomTrace = {
    typeUrl: '/ibc.applications.transfer.v1.DenomTrace',
    encode(message, writer = BinaryWriter.create()) {
        if (message.path !== '') {
            writer.uint32(10).string(message.path);
        }
        if (message.baseDenom !== '') {
            writer.uint32(18).string(message.baseDenom);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseDenomTrace();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.path = reader.string();
                    break;
                case 2:
                    message.baseDenom = reader.string();
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
            path: isSet(object.path) ? String(object.path) : '',
            baseDenom: isSet(object.baseDenom) ? String(object.baseDenom) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.path !== undefined && (obj.path = message.path);
        message.baseDenom !== undefined && (obj.baseDenom = message.baseDenom);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseDenomTrace();
        message.path = object.path ?? '';
        message.baseDenom = object.baseDenom ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return DenomTrace.decode(message.value);
    },
    toProto(message) {
        return DenomTrace.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.applications.transfer.v1.DenomTrace',
            value: DenomTrace.encode(message).finish(),
        };
    },
};
function createBaseParams() {
    return {
        sendEnabled: false,
        receiveEnabled: false,
    };
}
export const Params = {
    typeUrl: '/ibc.applications.transfer.v1.Params',
    encode(message, writer = BinaryWriter.create()) {
        if (message.sendEnabled === true) {
            writer.uint32(8).bool(message.sendEnabled);
        }
        if (message.receiveEnabled === true) {
            writer.uint32(16).bool(message.receiveEnabled);
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
                    message.sendEnabled = reader.bool();
                    break;
                case 2:
                    message.receiveEnabled = reader.bool();
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
            sendEnabled: isSet(object.sendEnabled)
                ? Boolean(object.sendEnabled)
                : false,
            receiveEnabled: isSet(object.receiveEnabled)
                ? Boolean(object.receiveEnabled)
                : false,
        };
    },
    toJSON(message) {
        const obj = {};
        message.sendEnabled !== undefined &&
            (obj.sendEnabled = message.sendEnabled);
        message.receiveEnabled !== undefined &&
            (obj.receiveEnabled = message.receiveEnabled);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseParams();
        message.sendEnabled = object.sendEnabled ?? false;
        message.receiveEnabled = object.receiveEnabled ?? false;
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
            typeUrl: '/ibc.applications.transfer.v1.Params',
            value: Params.encode(message).finish(),
        };
    },
};
//# sourceMappingURL=transfer.js.map