//@ts-nocheck
import { BinaryReader, BinaryWriter } from '../../binary.js';
import {} from '../../json-safe.js';
import { isSet } from '../../helpers.js';
function createBaseGenesisState() {
    return {
        data: [],
    };
}
export const GenesisState = {
    typeUrl: '/agoric.vstorage.GenesisState',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.data) {
            DataEntry.encode(v, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseGenesisState();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.data.push(DataEntry.decode(reader, reader.uint32()));
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
                ? object.data.map((e) => DataEntry.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.data) {
            obj.data = message.data.map(e => (e ? DataEntry.toJSON(e) : undefined));
        }
        else {
            obj.data = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseGenesisState();
        message.data = object.data?.map(e => DataEntry.fromPartial(e)) || [];
        return message;
    },
    fromProtoMsg(message) {
        return GenesisState.decode(message.value);
    },
    toProto(message) {
        return GenesisState.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/agoric.vstorage.GenesisState',
            value: GenesisState.encode(message).finish(),
        };
    },
};
function createBaseDataEntry() {
    return {
        path: '',
        value: '',
    };
}
export const DataEntry = {
    typeUrl: '/agoric.vstorage.DataEntry',
    encode(message, writer = BinaryWriter.create()) {
        if (message.path !== '') {
            writer.uint32(10).string(message.path);
        }
        if (message.value !== '') {
            writer.uint32(18).string(message.value);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseDataEntry();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.path = reader.string();
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
            path: isSet(object.path) ? String(object.path) : '',
            value: isSet(object.value) ? String(object.value) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.path !== undefined && (obj.path = message.path);
        message.value !== undefined && (obj.value = message.value);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseDataEntry();
        message.path = object.path ?? '';
        message.value = object.value ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return DataEntry.decode(message.value);
    },
    toProto(message) {
        return DataEntry.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/agoric.vstorage.DataEntry',
            value: DataEntry.encode(message).finish(),
        };
    },
};
//# sourceMappingURL=genesis.js.map