//@ts-nocheck
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { isSet } from '../../helpers.js';
import {} from '../../json-safe.js';
function createBaseData() {
    return {
        value: '',
    };
}
export const Data = {
    typeUrl: '/agoric.vstorage.Data',
    encode(message, writer = BinaryWriter.create()) {
        if (message.value !== '') {
            writer.uint32(10).string(message.value);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseData();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
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
            value: isSet(object.value) ? String(object.value) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.value !== undefined && (obj.value = message.value);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseData();
        message.value = object.value ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return Data.decode(message.value);
    },
    toProto(message) {
        return Data.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/agoric.vstorage.Data',
            value: Data.encode(message).finish(),
        };
    },
};
function createBaseChildren() {
    return {
        children: [],
    };
}
export const Children = {
    typeUrl: '/agoric.vstorage.Children',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.children) {
            writer.uint32(10).string(v);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseChildren();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.children.push(reader.string());
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
            children: Array.isArray(object?.children)
                ? object.children.map((e) => String(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.children) {
            obj.children = message.children.map(e => e);
        }
        else {
            obj.children = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseChildren();
        message.children = object.children?.map(e => e) || [];
        return message;
    },
    fromProtoMsg(message) {
        return Children.decode(message.value);
    },
    toProto(message) {
        return Children.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/agoric.vstorage.Children',
            value: Children.encode(message).finish(),
        };
    },
};
//# sourceMappingURL=vstorage.js.map