//@ts-nocheck
import { Coin } from '../../base/v1beta1/coin.js';
import { BinaryReader, BinaryWriter } from '../../../binary.js';
import { isSet } from '../../../helpers.js';
import {} from '../../../json-safe.js';
/**
 * AuthorizationType defines the type of staking module authorization type
 *
 * Since: cosmos-sdk 0.43
 */
export var AuthorizationType;
(function (AuthorizationType) {
    /** AUTHORIZATION_TYPE_UNSPECIFIED - AUTHORIZATION_TYPE_UNSPECIFIED specifies an unknown authorization type */
    AuthorizationType[AuthorizationType["AUTHORIZATION_TYPE_UNSPECIFIED"] = 0] = "AUTHORIZATION_TYPE_UNSPECIFIED";
    /** AUTHORIZATION_TYPE_DELEGATE - AUTHORIZATION_TYPE_DELEGATE defines an authorization type for Msg/Delegate */
    AuthorizationType[AuthorizationType["AUTHORIZATION_TYPE_DELEGATE"] = 1] = "AUTHORIZATION_TYPE_DELEGATE";
    /** AUTHORIZATION_TYPE_UNDELEGATE - AUTHORIZATION_TYPE_UNDELEGATE defines an authorization type for Msg/Undelegate */
    AuthorizationType[AuthorizationType["AUTHORIZATION_TYPE_UNDELEGATE"] = 2] = "AUTHORIZATION_TYPE_UNDELEGATE";
    /** AUTHORIZATION_TYPE_REDELEGATE - AUTHORIZATION_TYPE_REDELEGATE defines an authorization type for Msg/BeginRedelegate */
    AuthorizationType[AuthorizationType["AUTHORIZATION_TYPE_REDELEGATE"] = 3] = "AUTHORIZATION_TYPE_REDELEGATE";
    AuthorizationType[AuthorizationType["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
})(AuthorizationType || (AuthorizationType = {}));
export const AuthorizationTypeSDKType = AuthorizationType;
export function authorizationTypeFromJSON(object) {
    switch (object) {
        case 0:
        case 'AUTHORIZATION_TYPE_UNSPECIFIED':
            return AuthorizationType.AUTHORIZATION_TYPE_UNSPECIFIED;
        case 1:
        case 'AUTHORIZATION_TYPE_DELEGATE':
            return AuthorizationType.AUTHORIZATION_TYPE_DELEGATE;
        case 2:
        case 'AUTHORIZATION_TYPE_UNDELEGATE':
            return AuthorizationType.AUTHORIZATION_TYPE_UNDELEGATE;
        case 3:
        case 'AUTHORIZATION_TYPE_REDELEGATE':
            return AuthorizationType.AUTHORIZATION_TYPE_REDELEGATE;
        case -1:
        case 'UNRECOGNIZED':
        default:
            return AuthorizationType.UNRECOGNIZED;
    }
}
export function authorizationTypeToJSON(object) {
    switch (object) {
        case AuthorizationType.AUTHORIZATION_TYPE_UNSPECIFIED:
            return 'AUTHORIZATION_TYPE_UNSPECIFIED';
        case AuthorizationType.AUTHORIZATION_TYPE_DELEGATE:
            return 'AUTHORIZATION_TYPE_DELEGATE';
        case AuthorizationType.AUTHORIZATION_TYPE_UNDELEGATE:
            return 'AUTHORIZATION_TYPE_UNDELEGATE';
        case AuthorizationType.AUTHORIZATION_TYPE_REDELEGATE:
            return 'AUTHORIZATION_TYPE_REDELEGATE';
        case AuthorizationType.UNRECOGNIZED:
        default:
            return 'UNRECOGNIZED';
    }
}
function createBaseStakeAuthorization() {
    return {
        $typeUrl: '/cosmos.staking.v1beta1.StakeAuthorization',
        maxTokens: undefined,
        allowList: undefined,
        denyList: undefined,
        authorizationType: 0,
    };
}
export const StakeAuthorization = {
    typeUrl: '/cosmos.staking.v1beta1.StakeAuthorization',
    encode(message, writer = BinaryWriter.create()) {
        if (message.maxTokens !== undefined) {
            Coin.encode(message.maxTokens, writer.uint32(10).fork()).ldelim();
        }
        if (message.allowList !== undefined) {
            StakeAuthorization_Validators.encode(message.allowList, writer.uint32(18).fork()).ldelim();
        }
        if (message.denyList !== undefined) {
            StakeAuthorization_Validators.encode(message.denyList, writer.uint32(26).fork()).ldelim();
        }
        if (message.authorizationType !== 0) {
            writer.uint32(32).int32(message.authorizationType);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseStakeAuthorization();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.maxTokens = Coin.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.allowList = StakeAuthorization_Validators.decode(reader, reader.uint32());
                    break;
                case 3:
                    message.denyList = StakeAuthorization_Validators.decode(reader, reader.uint32());
                    break;
                case 4:
                    message.authorizationType = reader.int32();
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
            maxTokens: isSet(object.maxTokens)
                ? Coin.fromJSON(object.maxTokens)
                : undefined,
            allowList: isSet(object.allowList)
                ? StakeAuthorization_Validators.fromJSON(object.allowList)
                : undefined,
            denyList: isSet(object.denyList)
                ? StakeAuthorization_Validators.fromJSON(object.denyList)
                : undefined,
            authorizationType: isSet(object.authorizationType)
                ? authorizationTypeFromJSON(object.authorizationType)
                : -1,
        };
    },
    toJSON(message) {
        const obj = {};
        message.maxTokens !== undefined &&
            (obj.maxTokens = message.maxTokens
                ? Coin.toJSON(message.maxTokens)
                : undefined);
        message.allowList !== undefined &&
            (obj.allowList = message.allowList
                ? StakeAuthorization_Validators.toJSON(message.allowList)
                : undefined);
        message.denyList !== undefined &&
            (obj.denyList = message.denyList
                ? StakeAuthorization_Validators.toJSON(message.denyList)
                : undefined);
        message.authorizationType !== undefined &&
            (obj.authorizationType = authorizationTypeToJSON(message.authorizationType));
        return obj;
    },
    fromPartial(object) {
        const message = createBaseStakeAuthorization();
        message.maxTokens =
            object.maxTokens !== undefined && object.maxTokens !== null
                ? Coin.fromPartial(object.maxTokens)
                : undefined;
        message.allowList =
            object.allowList !== undefined && object.allowList !== null
                ? StakeAuthorization_Validators.fromPartial(object.allowList)
                : undefined;
        message.denyList =
            object.denyList !== undefined && object.denyList !== null
                ? StakeAuthorization_Validators.fromPartial(object.denyList)
                : undefined;
        message.authorizationType = object.authorizationType ?? 0;
        return message;
    },
    fromProtoMsg(message) {
        return StakeAuthorization.decode(message.value);
    },
    toProto(message) {
        return StakeAuthorization.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.staking.v1beta1.StakeAuthorization',
            value: StakeAuthorization.encode(message).finish(),
        };
    },
};
function createBaseStakeAuthorization_Validators() {
    return {
        address: [],
    };
}
export const StakeAuthorization_Validators = {
    typeUrl: '/cosmos.staking.v1beta1.Validators',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.address) {
            writer.uint32(10).string(v);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseStakeAuthorization_Validators();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.address.push(reader.string());
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
            address: Array.isArray(object?.address)
                ? object.address.map((e) => String(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.address) {
            obj.address = message.address.map(e => e);
        }
        else {
            obj.address = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseStakeAuthorization_Validators();
        message.address = object.address?.map(e => e) || [];
        return message;
    },
    fromProtoMsg(message) {
        return StakeAuthorization_Validators.decode(message.value);
    },
    toProto(message) {
        return StakeAuthorization_Validators.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.staking.v1beta1.Validators',
            value: StakeAuthorization_Validators.encode(message).finish(),
        };
    },
};
//# sourceMappingURL=authz.js.map