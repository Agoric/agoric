//@ts-nocheck
import { Any } from '../../../../google/protobuf/any.js';
import { BIP44Params } from '../../hd/v1/hd.js';
import { BinaryReader, BinaryWriter } from '../../../../binary.js';
import { isSet } from '../../../../helpers.js';
import {} from '../../../../json-safe.js';
function createBaseRecord() {
    return {
        name: '',
        pubKey: undefined,
        local: undefined,
        ledger: undefined,
        multi: undefined,
        offline: undefined,
    };
}
export const Record = {
    typeUrl: '/cosmos.crypto.keyring.v1.Record',
    encode(message, writer = BinaryWriter.create()) {
        if (message.name !== '') {
            writer.uint32(10).string(message.name);
        }
        if (message.pubKey !== undefined) {
            Any.encode(message.pubKey, writer.uint32(18).fork()).ldelim();
        }
        if (message.local !== undefined) {
            Record_Local.encode(message.local, writer.uint32(26).fork()).ldelim();
        }
        if (message.ledger !== undefined) {
            Record_Ledger.encode(message.ledger, writer.uint32(34).fork()).ldelim();
        }
        if (message.multi !== undefined) {
            Record_Multi.encode(message.multi, writer.uint32(42).fork()).ldelim();
        }
        if (message.offline !== undefined) {
            Record_Offline.encode(message.offline, writer.uint32(50).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseRecord();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.name = reader.string();
                    break;
                case 2:
                    message.pubKey = Any.decode(reader, reader.uint32());
                    break;
                case 3:
                    message.local = Record_Local.decode(reader, reader.uint32());
                    break;
                case 4:
                    message.ledger = Record_Ledger.decode(reader, reader.uint32());
                    break;
                case 5:
                    message.multi = Record_Multi.decode(reader, reader.uint32());
                    break;
                case 6:
                    message.offline = Record_Offline.decode(reader, reader.uint32());
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
            name: isSet(object.name) ? String(object.name) : '',
            pubKey: isSet(object.pubKey) ? Any.fromJSON(object.pubKey) : undefined,
            local: isSet(object.local)
                ? Record_Local.fromJSON(object.local)
                : undefined,
            ledger: isSet(object.ledger)
                ? Record_Ledger.fromJSON(object.ledger)
                : undefined,
            multi: isSet(object.multi)
                ? Record_Multi.fromJSON(object.multi)
                : undefined,
            offline: isSet(object.offline)
                ? Record_Offline.fromJSON(object.offline)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.name !== undefined && (obj.name = message.name);
        message.pubKey !== undefined &&
            (obj.pubKey = message.pubKey ? Any.toJSON(message.pubKey) : undefined);
        message.local !== undefined &&
            (obj.local = message.local
                ? Record_Local.toJSON(message.local)
                : undefined);
        message.ledger !== undefined &&
            (obj.ledger = message.ledger
                ? Record_Ledger.toJSON(message.ledger)
                : undefined);
        message.multi !== undefined &&
            (obj.multi = message.multi
                ? Record_Multi.toJSON(message.multi)
                : undefined);
        message.offline !== undefined &&
            (obj.offline = message.offline
                ? Record_Offline.toJSON(message.offline)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseRecord();
        message.name = object.name ?? '';
        message.pubKey =
            object.pubKey !== undefined && object.pubKey !== null
                ? Any.fromPartial(object.pubKey)
                : undefined;
        message.local =
            object.local !== undefined && object.local !== null
                ? Record_Local.fromPartial(object.local)
                : undefined;
        message.ledger =
            object.ledger !== undefined && object.ledger !== null
                ? Record_Ledger.fromPartial(object.ledger)
                : undefined;
        message.multi =
            object.multi !== undefined && object.multi !== null
                ? Record_Multi.fromPartial(object.multi)
                : undefined;
        message.offline =
            object.offline !== undefined && object.offline !== null
                ? Record_Offline.fromPartial(object.offline)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return Record.decode(message.value);
    },
    toProto(message) {
        return Record.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.crypto.keyring.v1.Record',
            value: Record.encode(message).finish(),
        };
    },
};
function createBaseRecord_Local() {
    return {
        privKey: undefined,
    };
}
export const Record_Local = {
    typeUrl: '/cosmos.crypto.keyring.v1.Local',
    encode(message, writer = BinaryWriter.create()) {
        if (message.privKey !== undefined) {
            Any.encode(message.privKey, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseRecord_Local();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.privKey = Any.decode(reader, reader.uint32());
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
            privKey: isSet(object.privKey) ? Any.fromJSON(object.privKey) : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.privKey !== undefined &&
            (obj.privKey = message.privKey ? Any.toJSON(message.privKey) : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseRecord_Local();
        message.privKey =
            object.privKey !== undefined && object.privKey !== null
                ? Any.fromPartial(object.privKey)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return Record_Local.decode(message.value);
    },
    toProto(message) {
        return Record_Local.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.crypto.keyring.v1.Local',
            value: Record_Local.encode(message).finish(),
        };
    },
};
function createBaseRecord_Ledger() {
    return {
        path: undefined,
    };
}
export const Record_Ledger = {
    typeUrl: '/cosmos.crypto.keyring.v1.Ledger',
    encode(message, writer = BinaryWriter.create()) {
        if (message.path !== undefined) {
            BIP44Params.encode(message.path, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseRecord_Ledger();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.path = BIP44Params.decode(reader, reader.uint32());
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
            path: isSet(object.path) ? BIP44Params.fromJSON(object.path) : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.path !== undefined &&
            (obj.path = message.path ? BIP44Params.toJSON(message.path) : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseRecord_Ledger();
        message.path =
            object.path !== undefined && object.path !== null
                ? BIP44Params.fromPartial(object.path)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return Record_Ledger.decode(message.value);
    },
    toProto(message) {
        return Record_Ledger.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.crypto.keyring.v1.Ledger',
            value: Record_Ledger.encode(message).finish(),
        };
    },
};
function createBaseRecord_Multi() {
    return {};
}
export const Record_Multi = {
    typeUrl: '/cosmos.crypto.keyring.v1.Multi',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseRecord_Multi();
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
        const message = createBaseRecord_Multi();
        return message;
    },
    fromProtoMsg(message) {
        return Record_Multi.decode(message.value);
    },
    toProto(message) {
        return Record_Multi.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.crypto.keyring.v1.Multi',
            value: Record_Multi.encode(message).finish(),
        };
    },
};
function createBaseRecord_Offline() {
    return {};
}
export const Record_Offline = {
    typeUrl: '/cosmos.crypto.keyring.v1.Offline',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseRecord_Offline();
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
        const message = createBaseRecord_Offline();
        return message;
    },
    fromProtoMsg(message) {
        return Record_Offline.decode(message.value);
    },
    toProto(message) {
        return Record_Offline.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.crypto.keyring.v1.Offline',
            value: Record_Offline.encode(message).finish(),
        };
    },
};
//# sourceMappingURL=record.js.map