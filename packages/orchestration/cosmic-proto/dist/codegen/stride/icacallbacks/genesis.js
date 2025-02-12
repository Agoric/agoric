//@ts-nocheck
import { Params } from './params.js';
import { CallbackData } from './callback_data.js';
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { isSet } from '../../helpers.js';
import {} from '../../json-safe.js';
function createBaseGenesisState() {
    return {
        params: Params.fromPartial({}),
        portId: '',
        callbackDataList: [],
    };
}
export const GenesisState = {
    typeUrl: '/stride.icacallbacks.GenesisState',
    encode(message, writer = BinaryWriter.create()) {
        if (message.params !== undefined) {
            Params.encode(message.params, writer.uint32(10).fork()).ldelim();
        }
        if (message.portId !== '') {
            writer.uint32(18).string(message.portId);
        }
        for (const v of message.callbackDataList) {
            CallbackData.encode(v, writer.uint32(26).fork()).ldelim();
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
                    message.params = Params.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.portId = reader.string();
                    break;
                case 3:
                    message.callbackDataList.push(CallbackData.decode(reader, reader.uint32()));
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
            params: isSet(object.params) ? Params.fromJSON(object.params) : undefined,
            portId: isSet(object.portId) ? String(object.portId) : '',
            callbackDataList: Array.isArray(object?.callbackDataList)
                ? object.callbackDataList.map((e) => CallbackData.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        message.params !== undefined &&
            (obj.params = message.params ? Params.toJSON(message.params) : undefined);
        message.portId !== undefined && (obj.portId = message.portId);
        if (message.callbackDataList) {
            obj.callbackDataList = message.callbackDataList.map(e => e ? CallbackData.toJSON(e) : undefined);
        }
        else {
            obj.callbackDataList = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseGenesisState();
        message.params =
            object.params !== undefined && object.params !== null
                ? Params.fromPartial(object.params)
                : undefined;
        message.portId = object.portId ?? '';
        message.callbackDataList =
            object.callbackDataList?.map(e => CallbackData.fromPartial(e)) || [];
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
            typeUrl: '/stride.icacallbacks.GenesisState',
            value: GenesisState.encode(message).finish(),
        };
    },
};
//# sourceMappingURL=genesis.js.map