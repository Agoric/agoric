//@ts-nocheck
import { BinaryReader, BinaryWriter } from '../../../../../binary.js';
import { isSet } from '../../../../../helpers.js';
import {} from '../../../../../json-safe.js';
function createBaseParams() {
    return {
        controllerEnabled: false,
    };
}
export const Params = {
    typeUrl: '/ibc.applications.interchain_accounts.controller.v1.Params',
    encode(message, writer = BinaryWriter.create()) {
        if (message.controllerEnabled === true) {
            writer.uint32(8).bool(message.controllerEnabled);
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
                    message.controllerEnabled = reader.bool();
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
            controllerEnabled: isSet(object.controllerEnabled)
                ? Boolean(object.controllerEnabled)
                : false,
        };
    },
    toJSON(message) {
        const obj = {};
        message.controllerEnabled !== undefined &&
            (obj.controllerEnabled = message.controllerEnabled);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseParams();
        message.controllerEnabled = object.controllerEnabled ?? false;
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
            typeUrl: '/ibc.applications.interchain_accounts.controller.v1.Params',
            value: Params.encode(message).finish(),
        };
    },
};
//# sourceMappingURL=controller.js.map