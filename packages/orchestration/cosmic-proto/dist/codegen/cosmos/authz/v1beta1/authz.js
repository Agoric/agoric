//@ts-nocheck
import { Any } from '../../../google/protobuf/any.js';
import { Timestamp, } from '../../../google/protobuf/timestamp.js';
import { SendAuthorization, } from '../../bank/v1beta1/authz.js';
import { StakeAuthorization, } from '../../staking/v1beta1/authz.js';
import { TransferAuthorization, } from '../../../ibc/applications/transfer/v1/authz.js';
import { BinaryReader, BinaryWriter } from '../../../binary.js';
import { isSet, fromJsonTimestamp, fromTimestamp } from '../../../helpers.js';
import {} from '../../../json-safe.js';
function createBaseGenericAuthorization() {
    return {
        $typeUrl: '/cosmos.authz.v1beta1.GenericAuthorization',
        msg: '',
    };
}
export const GenericAuthorization = {
    typeUrl: '/cosmos.authz.v1beta1.GenericAuthorization',
    encode(message, writer = BinaryWriter.create()) {
        if (message.msg !== '') {
            writer.uint32(10).string(message.msg);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseGenericAuthorization();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.msg = reader.string();
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
            msg: isSet(object.msg) ? String(object.msg) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.msg !== undefined && (obj.msg = message.msg);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseGenericAuthorization();
        message.msg = object.msg ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return GenericAuthorization.decode(message.value);
    },
    toProto(message) {
        return GenericAuthorization.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.authz.v1beta1.GenericAuthorization',
            value: GenericAuthorization.encode(message).finish(),
        };
    },
};
function createBaseGrant() {
    return {
        authorization: undefined,
        expiration: undefined,
    };
}
export const Grant = {
    typeUrl: '/cosmos.authz.v1beta1.Grant',
    encode(message, writer = BinaryWriter.create()) {
        if (message.authorization !== undefined) {
            Any.encode(message.authorization, writer.uint32(10).fork()).ldelim();
        }
        if (message.expiration !== undefined) {
            Timestamp.encode(message.expiration, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseGrant();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.authorization = Authorization_InterfaceDecoder(reader);
                    break;
                case 2:
                    message.expiration = Timestamp.decode(reader, reader.uint32());
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
            authorization: isSet(object.authorization)
                ? Any.fromJSON(object.authorization)
                : undefined,
            expiration: isSet(object.expiration)
                ? fromJsonTimestamp(object.expiration)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.authorization !== undefined &&
            (obj.authorization = message.authorization
                ? Any.toJSON(message.authorization)
                : undefined);
        message.expiration !== undefined &&
            (obj.expiration = fromTimestamp(message.expiration).toISOString());
        return obj;
    },
    fromPartial(object) {
        const message = createBaseGrant();
        message.authorization =
            object.authorization !== undefined && object.authorization !== null
                ? Any.fromPartial(object.authorization)
                : undefined;
        message.expiration =
            object.expiration !== undefined && object.expiration !== null
                ? Timestamp.fromPartial(object.expiration)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return Grant.decode(message.value);
    },
    toProto(message) {
        return Grant.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.authz.v1beta1.Grant',
            value: Grant.encode(message).finish(),
        };
    },
};
function createBaseGrantAuthorization() {
    return {
        granter: '',
        grantee: '',
        authorization: undefined,
        expiration: undefined,
    };
}
export const GrantAuthorization = {
    typeUrl: '/cosmos.authz.v1beta1.GrantAuthorization',
    encode(message, writer = BinaryWriter.create()) {
        if (message.granter !== '') {
            writer.uint32(10).string(message.granter);
        }
        if (message.grantee !== '') {
            writer.uint32(18).string(message.grantee);
        }
        if (message.authorization !== undefined) {
            Any.encode(message.authorization, writer.uint32(26).fork()).ldelim();
        }
        if (message.expiration !== undefined) {
            Timestamp.encode(message.expiration, writer.uint32(34).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseGrantAuthorization();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.granter = reader.string();
                    break;
                case 2:
                    message.grantee = reader.string();
                    break;
                case 3:
                    message.authorization = Authorization_InterfaceDecoder(reader);
                    break;
                case 4:
                    message.expiration = Timestamp.decode(reader, reader.uint32());
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
            granter: isSet(object.granter) ? String(object.granter) : '',
            grantee: isSet(object.grantee) ? String(object.grantee) : '',
            authorization: isSet(object.authorization)
                ? Any.fromJSON(object.authorization)
                : undefined,
            expiration: isSet(object.expiration)
                ? fromJsonTimestamp(object.expiration)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.granter !== undefined && (obj.granter = message.granter);
        message.grantee !== undefined && (obj.grantee = message.grantee);
        message.authorization !== undefined &&
            (obj.authorization = message.authorization
                ? Any.toJSON(message.authorization)
                : undefined);
        message.expiration !== undefined &&
            (obj.expiration = fromTimestamp(message.expiration).toISOString());
        return obj;
    },
    fromPartial(object) {
        const message = createBaseGrantAuthorization();
        message.granter = object.granter ?? '';
        message.grantee = object.grantee ?? '';
        message.authorization =
            object.authorization !== undefined && object.authorization !== null
                ? Any.fromPartial(object.authorization)
                : undefined;
        message.expiration =
            object.expiration !== undefined && object.expiration !== null
                ? Timestamp.fromPartial(object.expiration)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return GrantAuthorization.decode(message.value);
    },
    toProto(message) {
        return GrantAuthorization.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.authz.v1beta1.GrantAuthorization',
            value: GrantAuthorization.encode(message).finish(),
        };
    },
};
function createBaseGrantQueueItem() {
    return {
        msgTypeUrls: [],
    };
}
export const GrantQueueItem = {
    typeUrl: '/cosmos.authz.v1beta1.GrantQueueItem',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.msgTypeUrls) {
            writer.uint32(10).string(v);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseGrantQueueItem();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.msgTypeUrls.push(reader.string());
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
            msgTypeUrls: Array.isArray(object?.msgTypeUrls)
                ? object.msgTypeUrls.map((e) => String(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.msgTypeUrls) {
            obj.msgTypeUrls = message.msgTypeUrls.map(e => e);
        }
        else {
            obj.msgTypeUrls = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseGrantQueueItem();
        message.msgTypeUrls = object.msgTypeUrls?.map(e => e) || [];
        return message;
    },
    fromProtoMsg(message) {
        return GrantQueueItem.decode(message.value);
    },
    toProto(message) {
        return GrantQueueItem.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.authz.v1beta1.GrantQueueItem',
            value: GrantQueueItem.encode(message).finish(),
        };
    },
};
export const Authorization_InterfaceDecoder = (input) => {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const data = Any.decode(reader, reader.uint32());
    switch (data.typeUrl) {
        case '/cosmos.authz.v1beta1.GenericAuthorization':
            return GenericAuthorization.decode(data.value);
        case '/cosmos.bank.v1beta1.SendAuthorization':
            return SendAuthorization.decode(data.value);
        case '/cosmos.staking.v1beta1.StakeAuthorization':
            return StakeAuthorization.decode(data.value);
        case '/ibc.applications.transfer.v1.TransferAuthorization':
            return TransferAuthorization.decode(data.value);
        default:
            return data;
    }
};
//# sourceMappingURL=authz.js.map