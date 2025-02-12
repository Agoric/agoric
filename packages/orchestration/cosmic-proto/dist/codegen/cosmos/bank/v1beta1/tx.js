//@ts-nocheck
import { Coin } from '../../base/v1beta1/coin.js';
import { Input, Output, } from './bank.js';
import { BinaryReader, BinaryWriter } from '../../../binary.js';
import { isSet } from '../../../helpers.js';
import {} from '../../../json-safe.js';
function createBaseMsgSend() {
    return {
        fromAddress: '',
        toAddress: '',
        amount: [],
    };
}
export const MsgSend = {
    typeUrl: '/cosmos.bank.v1beta1.MsgSend',
    encode(message, writer = BinaryWriter.create()) {
        if (message.fromAddress !== '') {
            writer.uint32(10).string(message.fromAddress);
        }
        if (message.toAddress !== '') {
            writer.uint32(18).string(message.toAddress);
        }
        for (const v of message.amount) {
            Coin.encode(v, writer.uint32(26).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgSend();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.fromAddress = reader.string();
                    break;
                case 2:
                    message.toAddress = reader.string();
                    break;
                case 3:
                    message.amount.push(Coin.decode(reader, reader.uint32()));
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
            fromAddress: isSet(object.fromAddress) ? String(object.fromAddress) : '',
            toAddress: isSet(object.toAddress) ? String(object.toAddress) : '',
            amount: Array.isArray(object?.amount)
                ? object.amount.map((e) => Coin.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        message.fromAddress !== undefined &&
            (obj.fromAddress = message.fromAddress);
        message.toAddress !== undefined && (obj.toAddress = message.toAddress);
        if (message.amount) {
            obj.amount = message.amount.map(e => (e ? Coin.toJSON(e) : undefined));
        }
        else {
            obj.amount = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgSend();
        message.fromAddress = object.fromAddress ?? '';
        message.toAddress = object.toAddress ?? '';
        message.amount = object.amount?.map(e => Coin.fromPartial(e)) || [];
        return message;
    },
    fromProtoMsg(message) {
        return MsgSend.decode(message.value);
    },
    toProto(message) {
        return MsgSend.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.bank.v1beta1.MsgSend',
            value: MsgSend.encode(message).finish(),
        };
    },
};
function createBaseMsgSendResponse() {
    return {};
}
export const MsgSendResponse = {
    typeUrl: '/cosmos.bank.v1beta1.MsgSendResponse',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgSendResponse();
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
        const message = createBaseMsgSendResponse();
        return message;
    },
    fromProtoMsg(message) {
        return MsgSendResponse.decode(message.value);
    },
    toProto(message) {
        return MsgSendResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.bank.v1beta1.MsgSendResponse',
            value: MsgSendResponse.encode(message).finish(),
        };
    },
};
function createBaseMsgMultiSend() {
    return {
        inputs: [],
        outputs: [],
    };
}
export const MsgMultiSend = {
    typeUrl: '/cosmos.bank.v1beta1.MsgMultiSend',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.inputs) {
            Input.encode(v, writer.uint32(10).fork()).ldelim();
        }
        for (const v of message.outputs) {
            Output.encode(v, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgMultiSend();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.inputs.push(Input.decode(reader, reader.uint32()));
                    break;
                case 2:
                    message.outputs.push(Output.decode(reader, reader.uint32()));
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
            inputs: Array.isArray(object?.inputs)
                ? object.inputs.map((e) => Input.fromJSON(e))
                : [],
            outputs: Array.isArray(object?.outputs)
                ? object.outputs.map((e) => Output.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.inputs) {
            obj.inputs = message.inputs.map(e => (e ? Input.toJSON(e) : undefined));
        }
        else {
            obj.inputs = [];
        }
        if (message.outputs) {
            obj.outputs = message.outputs.map(e => e ? Output.toJSON(e) : undefined);
        }
        else {
            obj.outputs = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgMultiSend();
        message.inputs = object.inputs?.map(e => Input.fromPartial(e)) || [];
        message.outputs = object.outputs?.map(e => Output.fromPartial(e)) || [];
        return message;
    },
    fromProtoMsg(message) {
        return MsgMultiSend.decode(message.value);
    },
    toProto(message) {
        return MsgMultiSend.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.bank.v1beta1.MsgMultiSend',
            value: MsgMultiSend.encode(message).finish(),
        };
    },
};
function createBaseMsgMultiSendResponse() {
    return {};
}
export const MsgMultiSendResponse = {
    typeUrl: '/cosmos.bank.v1beta1.MsgMultiSendResponse',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgMultiSendResponse();
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
        const message = createBaseMsgMultiSendResponse();
        return message;
    },
    fromProtoMsg(message) {
        return MsgMultiSendResponse.decode(message.value);
    },
    toProto(message) {
        return MsgMultiSendResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.bank.v1beta1.MsgMultiSendResponse',
            value: MsgMultiSendResponse.encode(message).finish(),
        };
    },
};
//# sourceMappingURL=tx.js.map