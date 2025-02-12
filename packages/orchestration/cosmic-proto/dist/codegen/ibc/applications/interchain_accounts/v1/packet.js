//@ts-nocheck
import { Any } from '../../../../google/protobuf/any.js';
import { BinaryReader, BinaryWriter } from '../../../../binary.js';
import { isSet, bytesFromBase64, base64FromBytes, } from '../../../../helpers.js';
import {} from '../../../../json-safe.js';
/**
 * Type defines a classification of message issued from a controller chain to its associated interchain accounts
 * host
 */
export var Type;
(function (Type) {
    /** TYPE_UNSPECIFIED - Default zero value enumeration */
    Type[Type["TYPE_UNSPECIFIED"] = 0] = "TYPE_UNSPECIFIED";
    /** TYPE_EXECUTE_TX - Execute a transaction on an interchain accounts host chain */
    Type[Type["TYPE_EXECUTE_TX"] = 1] = "TYPE_EXECUTE_TX";
    Type[Type["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
})(Type || (Type = {}));
export const TypeSDKType = Type;
export function typeFromJSON(object) {
    switch (object) {
        case 0:
        case 'TYPE_UNSPECIFIED':
            return Type.TYPE_UNSPECIFIED;
        case 1:
        case 'TYPE_EXECUTE_TX':
            return Type.TYPE_EXECUTE_TX;
        case -1:
        case 'UNRECOGNIZED':
        default:
            return Type.UNRECOGNIZED;
    }
}
export function typeToJSON(object) {
    switch (object) {
        case Type.TYPE_UNSPECIFIED:
            return 'TYPE_UNSPECIFIED';
        case Type.TYPE_EXECUTE_TX:
            return 'TYPE_EXECUTE_TX';
        case Type.UNRECOGNIZED:
        default:
            return 'UNRECOGNIZED';
    }
}
function createBaseInterchainAccountPacketData() {
    return {
        type: 0,
        data: new Uint8Array(),
        memo: '',
    };
}
export const InterchainAccountPacketData = {
    typeUrl: '/ibc.applications.interchain_accounts.v1.InterchainAccountPacketData',
    encode(message, writer = BinaryWriter.create()) {
        if (message.type !== 0) {
            writer.uint32(8).int32(message.type);
        }
        if (message.data.length !== 0) {
            writer.uint32(18).bytes(message.data);
        }
        if (message.memo !== '') {
            writer.uint32(26).string(message.memo);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseInterchainAccountPacketData();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.type = reader.int32();
                    break;
                case 2:
                    message.data = reader.bytes();
                    break;
                case 3:
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
            type: isSet(object.type) ? typeFromJSON(object.type) : -1,
            data: isSet(object.data)
                ? bytesFromBase64(object.data)
                : new Uint8Array(),
            memo: isSet(object.memo) ? String(object.memo) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.type !== undefined && (obj.type = typeToJSON(message.type));
        message.data !== undefined &&
            (obj.data = base64FromBytes(message.data !== undefined ? message.data : new Uint8Array()));
        message.memo !== undefined && (obj.memo = message.memo);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseInterchainAccountPacketData();
        message.type = object.type ?? 0;
        message.data = object.data ?? new Uint8Array();
        message.memo = object.memo ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return InterchainAccountPacketData.decode(message.value);
    },
    toProto(message) {
        return InterchainAccountPacketData.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.applications.interchain_accounts.v1.InterchainAccountPacketData',
            value: InterchainAccountPacketData.encode(message).finish(),
        };
    },
};
function createBaseCosmosTx() {
    return {
        messages: [],
    };
}
export const CosmosTx = {
    typeUrl: '/ibc.applications.interchain_accounts.v1.CosmosTx',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.messages) {
            Any.encode(v, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseCosmosTx();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.messages.push(Any.decode(reader, reader.uint32()));
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
            messages: Array.isArray(object?.messages)
                ? object.messages.map((e) => Any.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.messages) {
            obj.messages = message.messages.map(e => (e ? Any.toJSON(e) : undefined));
        }
        else {
            obj.messages = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseCosmosTx();
        message.messages = object.messages?.map(e => Any.fromPartial(e)) || [];
        return message;
    },
    fromProtoMsg(message) {
        return CosmosTx.decode(message.value);
    },
    toProto(message) {
        return CosmosTx.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.applications.interchain_accounts.v1.CosmosTx',
            value: CosmosTx.encode(message).finish(),
        };
    },
};
//# sourceMappingURL=packet.js.map