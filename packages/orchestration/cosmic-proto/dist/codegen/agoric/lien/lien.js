//@ts-nocheck
import { Coin } from '../../cosmos/base/v1beta1/coin.js';
import { BinaryReader, BinaryWriter } from '../../binary.js';
import {} from '../../json-safe.js';
function createBaseLien() {
    return {
        coins: [],
        delegated: [],
    };
}
export const Lien = {
    typeUrl: '/agoric.lien.Lien',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.coins) {
            Coin.encode(v, writer.uint32(10).fork()).ldelim();
        }
        for (const v of message.delegated) {
            Coin.encode(v, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseLien();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.coins.push(Coin.decode(reader, reader.uint32()));
                    break;
                case 2:
                    message.delegated.push(Coin.decode(reader, reader.uint32()));
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
            coins: Array.isArray(object?.coins)
                ? object.coins.map((e) => Coin.fromJSON(e))
                : [],
            delegated: Array.isArray(object?.delegated)
                ? object.delegated.map((e) => Coin.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.coins) {
            obj.coins = message.coins.map(e => (e ? Coin.toJSON(e) : undefined));
        }
        else {
            obj.coins = [];
        }
        if (message.delegated) {
            obj.delegated = message.delegated.map(e => e ? Coin.toJSON(e) : undefined);
        }
        else {
            obj.delegated = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseLien();
        message.coins = object.coins?.map(e => Coin.fromPartial(e)) || [];
        message.delegated = object.delegated?.map(e => Coin.fromPartial(e)) || [];
        return message;
    },
    fromProtoMsg(message) {
        return Lien.decode(message.value);
    },
    toProto(message) {
        return Lien.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/agoric.lien.Lien',
            value: Lien.encode(message).finish(),
        };
    },
};
//# sourceMappingURL=lien.js.map