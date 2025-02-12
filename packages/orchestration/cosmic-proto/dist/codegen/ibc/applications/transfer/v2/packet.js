//@ts-nocheck
import { BinaryReader, BinaryWriter } from '../../../../binary.js';
import { isSet } from '../../../../helpers.js';
import {} from '../../../../json-safe.js';
function createBaseFungibleTokenPacketData() {
    return {
        denom: '',
        amount: '',
        sender: '',
        receiver: '',
        memo: '',
    };
}
export const FungibleTokenPacketData = {
    typeUrl: '/ibc.applications.transfer.v2.FungibleTokenPacketData',
    encode(message, writer = BinaryWriter.create()) {
        if (message.denom !== '') {
            writer.uint32(10).string(message.denom);
        }
        if (message.amount !== '') {
            writer.uint32(18).string(message.amount);
        }
        if (message.sender !== '') {
            writer.uint32(26).string(message.sender);
        }
        if (message.receiver !== '') {
            writer.uint32(34).string(message.receiver);
        }
        if (message.memo !== '') {
            writer.uint32(42).string(message.memo);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseFungibleTokenPacketData();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.denom = reader.string();
                    break;
                case 2:
                    message.amount = reader.string();
                    break;
                case 3:
                    message.sender = reader.string();
                    break;
                case 4:
                    message.receiver = reader.string();
                    break;
                case 5:
                    message.memo = reader.string();
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
            sender: isSet(object.sender) ? String(object.sender) : '',
            receiver: isSet(object.receiver) ? String(object.receiver) : '',
            memo: isSet(object.memo) ? String(object.memo) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.denom !== undefined && (obj.denom = message.denom);
        message.amount !== undefined && (obj.amount = message.amount);
        message.sender !== undefined && (obj.sender = message.sender);
        message.receiver !== undefined && (obj.receiver = message.receiver);
        message.memo !== undefined && (obj.memo = message.memo);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseFungibleTokenPacketData();
        message.denom = object.denom ?? '';
        message.amount = object.amount ?? '';
        message.sender = object.sender ?? '';
        message.receiver = object.receiver ?? '';
        message.memo = object.memo ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return FungibleTokenPacketData.decode(message.value);
    },
    toProto(message) {
        return FungibleTokenPacketData.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.applications.transfer.v2.FungibleTokenPacketData',
            value: FungibleTokenPacketData.encode(message).finish(),
        };
    },
};
//# sourceMappingURL=packet.js.map