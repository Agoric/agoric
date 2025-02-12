//@ts-nocheck
import { BinaryReader, BinaryWriter } from '../../../../binary.js';
import {} from '../../../../json-safe.js';
import { isSet } from '../../../../helpers.js';
function createBaseConfigRequest() {
    return {};
}
export const ConfigRequest = {
    typeUrl: '/cosmos.base.node.v1beta1.ConfigRequest',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseConfigRequest();
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
        const message = createBaseConfigRequest();
        return message;
    },
    fromProtoMsg(message) {
        return ConfigRequest.decode(message.value);
    },
    toProto(message) {
        return ConfigRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.base.node.v1beta1.ConfigRequest',
            value: ConfigRequest.encode(message).finish(),
        };
    },
};
function createBaseConfigResponse() {
    return {
        minimumGasPrice: '',
    };
}
export const ConfigResponse = {
    typeUrl: '/cosmos.base.node.v1beta1.ConfigResponse',
    encode(message, writer = BinaryWriter.create()) {
        if (message.minimumGasPrice !== '') {
            writer.uint32(10).string(message.minimumGasPrice);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseConfigResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.minimumGasPrice = reader.string();
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
            minimumGasPrice: isSet(object.minimumGasPrice)
                ? String(object.minimumGasPrice)
                : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.minimumGasPrice !== undefined &&
            (obj.minimumGasPrice = message.minimumGasPrice);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseConfigResponse();
        message.minimumGasPrice = object.minimumGasPrice ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return ConfigResponse.decode(message.value);
    },
    toProto(message) {
        return ConfigResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.base.node.v1beta1.ConfigResponse',
            value: ConfigResponse.encode(message).finish(),
        };
    },
};
//# sourceMappingURL=query.js.map