//@ts-nocheck
import { BinaryReader, BinaryWriter } from '../../../../../binary.js';
import { isSet } from '../../../../../helpers.js';
import {} from '../../../../../json-safe.js';
function createBaseParams() {
    return {
        hostEnabled: false,
        allowMessages: [],
    };
}
export const Params = {
    typeUrl: '/ibc.applications.interchain_accounts.host.v1.Params',
    encode(message, writer = BinaryWriter.create()) {
        if (message.hostEnabled === true) {
            writer.uint32(8).bool(message.hostEnabled);
        }
        for (const v of message.allowMessages) {
            writer.uint32(18).string(v);
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
                    message.hostEnabled = reader.bool();
                    break;
                case 2:
                    message.allowMessages.push(reader.string());
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
            hostEnabled: isSet(object.hostEnabled)
                ? Boolean(object.hostEnabled)
                : false,
            allowMessages: Array.isArray(object?.allowMessages)
                ? object.allowMessages.map((e) => String(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        message.hostEnabled !== undefined &&
            (obj.hostEnabled = message.hostEnabled);
        if (message.allowMessages) {
            obj.allowMessages = message.allowMessages.map(e => e);
        }
        else {
            obj.allowMessages = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseParams();
        message.hostEnabled = object.hostEnabled ?? false;
        message.allowMessages = object.allowMessages?.map(e => e) || [];
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
            typeUrl: '/ibc.applications.interchain_accounts.host.v1.Params',
            value: Params.encode(message).finish(),
        };
    },
};
//# sourceMappingURL=host.js.map