//@ts-nocheck
import { BinaryReader, BinaryWriter } from '../../../binary.js';
import { isSet } from '../../../helpers.js';
import {} from '../../../json-safe.js';
function createBaseCoin() {
    return {
        denom: '',
        amount: '',
    };
}
export const Coin = {
    typeUrl: '/cosmos.base.v1beta1.Coin',
    encode(message, writer = BinaryWriter.create()) {
        if (message.denom !== '') {
            writer.uint32(10).string(message.denom);
        }
        if (message.amount !== '') {
            writer.uint32(18).string(message.amount);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseCoin();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.denom = reader.string();
                    break;
                case 2:
                    message.amount = reader.string();
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
            denom: isSet(object.denom) ? String(object.denom) : '',
            amount: isSet(object.amount) ? String(object.amount) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.denom !== undefined && (obj.denom = message.denom);
        message.amount !== undefined && (obj.amount = message.amount);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseCoin();
        message.denom = object.denom ?? '';
        message.amount = object.amount ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return Coin.decode(message.value);
    },
    toProto(message) {
        return Coin.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.base.v1beta1.Coin',
            value: Coin.encode(message).finish(),
        };
    },
};
function createBaseDecCoin() {
    return {
        denom: '',
        amount: '',
    };
}
export const DecCoin = {
    typeUrl: '/cosmos.base.v1beta1.DecCoin',
    encode(message, writer = BinaryWriter.create()) {
        if (message.denom !== '') {
            writer.uint32(10).string(message.denom);
        }
        if (message.amount !== '') {
            writer.uint32(18).string(message.amount);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseDecCoin();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.denom = reader.string();
                    break;
                case 2:
                    message.amount = reader.string();
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
            denom: isSet(object.denom) ? String(object.denom) : '',
            amount: isSet(object.amount) ? String(object.amount) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.denom !== undefined && (obj.denom = message.denom);
        message.amount !== undefined && (obj.amount = message.amount);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseDecCoin();
        message.denom = object.denom ?? '';
        message.amount = object.amount ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return DecCoin.decode(message.value);
    },
    toProto(message) {
        return DecCoin.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.base.v1beta1.DecCoin',
            value: DecCoin.encode(message).finish(),
        };
    },
};
function createBaseIntProto() {
    return {
        int: '',
    };
}
export const IntProto = {
    typeUrl: '/cosmos.base.v1beta1.IntProto',
    encode(message, writer = BinaryWriter.create()) {
        if (message.int !== '') {
            writer.uint32(10).string(message.int);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseIntProto();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.int = reader.string();
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
            int: isSet(object.int) ? String(object.int) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.int !== undefined && (obj.int = message.int);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseIntProto();
        message.int = object.int ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return IntProto.decode(message.value);
    },
    toProto(message) {
        return IntProto.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.base.v1beta1.IntProto',
            value: IntProto.encode(message).finish(),
        };
    },
};
function createBaseDecProto() {
    return {
        dec: '',
    };
}
export const DecProto = {
    typeUrl: '/cosmos.base.v1beta1.DecProto',
    encode(message, writer = BinaryWriter.create()) {
        if (message.dec !== '') {
            writer.uint32(10).string(message.dec);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseDecProto();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.dec = reader.string();
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
            dec: isSet(object.dec) ? String(object.dec) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.dec !== undefined && (obj.dec = message.dec);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseDecProto();
        message.dec = object.dec ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return DecProto.decode(message.value);
    },
    toProto(message) {
        return DecProto.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.base.v1beta1.DecProto',
            value: DecProto.encode(message).finish(),
        };
    },
};
//# sourceMappingURL=coin.js.map