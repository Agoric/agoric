//@ts-nocheck
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { bytesFromBase64, base64FromBytes } from '../../helpers.js';
import {} from '../../json-safe.js';
function createBaseGenesisState() {
    return {
        watchedAddresses: [],
    };
}
export const GenesisState = {
    typeUrl: '/agoric.vtransfer.GenesisState',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.watchedAddresses) {
            writer.uint32(10).bytes(v);
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
                    message.watchedAddresses.push(reader.bytes());
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
            watchedAddresses: Array.isArray(object?.watchedAddresses)
                ? object.watchedAddresses.map((e) => bytesFromBase64(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.watchedAddresses) {
            obj.watchedAddresses = message.watchedAddresses.map(e => base64FromBytes(e !== undefined ? e : new Uint8Array()));
        }
        else {
            obj.watchedAddresses = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseGenesisState();
        message.watchedAddresses = object.watchedAddresses?.map(e => e) || [];
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
            typeUrl: '/agoric.vtransfer.GenesisState',
            value: GenesisState.encode(message).finish(),
        };
    },
};
//# sourceMappingURL=genesis.js.map