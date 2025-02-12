//@ts-nocheck
import { BinaryReader, BinaryWriter } from '../../../binary.js';
import { isSet } from '../../../helpers.js';
import {} from '../../../json-safe.js';
function createBaseEventGrant() {
    return {
        msgTypeUrl: '',
        granter: '',
        grantee: '',
    };
}
export const EventGrant = {
    typeUrl: '/cosmos.authz.v1beta1.EventGrant',
    encode(message, writer = BinaryWriter.create()) {
        if (message.msgTypeUrl !== '') {
            writer.uint32(18).string(message.msgTypeUrl);
        }
        if (message.granter !== '') {
            writer.uint32(26).string(message.granter);
        }
        if (message.grantee !== '') {
            writer.uint32(34).string(message.grantee);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseEventGrant();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 2:
                    message.msgTypeUrl = reader.string();
                    break;
                case 3:
                    message.granter = reader.string();
                    break;
                case 4:
                    message.grantee = reader.string();
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
            msgTypeUrl: isSet(object.msgTypeUrl) ? String(object.msgTypeUrl) : '',
            granter: isSet(object.granter) ? String(object.granter) : '',
            grantee: isSet(object.grantee) ? String(object.grantee) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.msgTypeUrl !== undefined && (obj.msgTypeUrl = message.msgTypeUrl);
        message.granter !== undefined && (obj.granter = message.granter);
        message.grantee !== undefined && (obj.grantee = message.grantee);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseEventGrant();
        message.msgTypeUrl = object.msgTypeUrl ?? '';
        message.granter = object.granter ?? '';
        message.grantee = object.grantee ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return EventGrant.decode(message.value);
    },
    toProto(message) {
        return EventGrant.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.authz.v1beta1.EventGrant',
            value: EventGrant.encode(message).finish(),
        };
    },
};
function createBaseEventRevoke() {
    return {
        msgTypeUrl: '',
        granter: '',
        grantee: '',
    };
}
export const EventRevoke = {
    typeUrl: '/cosmos.authz.v1beta1.EventRevoke',
    encode(message, writer = BinaryWriter.create()) {
        if (message.msgTypeUrl !== '') {
            writer.uint32(18).string(message.msgTypeUrl);
        }
        if (message.granter !== '') {
            writer.uint32(26).string(message.granter);
        }
        if (message.grantee !== '') {
            writer.uint32(34).string(message.grantee);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseEventRevoke();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 2:
                    message.msgTypeUrl = reader.string();
                    break;
                case 3:
                    message.granter = reader.string();
                    break;
                case 4:
                    message.grantee = reader.string();
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
            msgTypeUrl: isSet(object.msgTypeUrl) ? String(object.msgTypeUrl) : '',
            granter: isSet(object.granter) ? String(object.granter) : '',
            grantee: isSet(object.grantee) ? String(object.grantee) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.msgTypeUrl !== undefined && (obj.msgTypeUrl = message.msgTypeUrl);
        message.granter !== undefined && (obj.granter = message.granter);
        message.grantee !== undefined && (obj.grantee = message.grantee);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseEventRevoke();
        message.msgTypeUrl = object.msgTypeUrl ?? '';
        message.granter = object.granter ?? '';
        message.grantee = object.grantee ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return EventRevoke.decode(message.value);
    },
    toProto(message) {
        return EventRevoke.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.authz.v1beta1.EventRevoke',
            value: EventRevoke.encode(message).finish(),
        };
    },
};
//# sourceMappingURL=event.js.map