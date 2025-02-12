//@ts-nocheck
import { Lien } from './lien.js';
import { BinaryReader, BinaryWriter } from '../../binary.js';
import {} from '../../json-safe.js';
import { isSet } from '../../helpers.js';
function createBaseGenesisState() {
    return {
        liens: [],
    };
}
export const GenesisState = {
    typeUrl: '/agoric.lien.GenesisState',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.liens) {
            AccountLien.encode(v, writer.uint32(10).fork()).ldelim();
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
                    message.liens.push(AccountLien.decode(reader, reader.uint32()));
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
            liens: Array.isArray(object?.liens)
                ? object.liens.map((e) => AccountLien.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.liens) {
            obj.liens = message.liens.map(e => e ? AccountLien.toJSON(e) : undefined);
        }
        else {
            obj.liens = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseGenesisState();
        message.liens = object.liens?.map(e => AccountLien.fromPartial(e)) || [];
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
            typeUrl: '/agoric.lien.GenesisState',
            value: GenesisState.encode(message).finish(),
        };
    },
};
function createBaseAccountLien() {
    return {
        address: '',
        lien: undefined,
    };
}
export const AccountLien = {
    typeUrl: '/agoric.lien.AccountLien',
    encode(message, writer = BinaryWriter.create()) {
        if (message.address !== '') {
            writer.uint32(10).string(message.address);
        }
        if (message.lien !== undefined) {
            Lien.encode(message.lien, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseAccountLien();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.address = reader.string();
                    break;
                case 2:
                    message.lien = Lien.decode(reader, reader.uint32());
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
            address: isSet(object.address) ? String(object.address) : '',
            lien: isSet(object.lien) ? Lien.fromJSON(object.lien) : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.address !== undefined && (obj.address = message.address);
        message.lien !== undefined &&
            (obj.lien = message.lien ? Lien.toJSON(message.lien) : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseAccountLien();
        message.address = object.address ?? '';
        message.lien =
            object.lien !== undefined && object.lien !== null
                ? Lien.fromPartial(object.lien)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return AccountLien.decode(message.value);
    },
    toProto(message) {
        return AccountLien.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/agoric.lien.AccountLien',
            value: AccountLien.encode(message).finish(),
        };
    },
};
//# sourceMappingURL=genesis.js.map