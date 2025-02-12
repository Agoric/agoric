//@ts-nocheck
import { Validator } from './validator.js';
import { Coin } from '../../cosmos/base/v1beta1/coin.js';
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { Decimal, isSet } from '../../helpers.js';
import {} from '../../json-safe.js';
export var AuthzPermissionChange;
(function (AuthzPermissionChange) {
    /** GRANT - Grant the address trade permissions */
    AuthzPermissionChange[AuthzPermissionChange["GRANT"] = 0] = "GRANT";
    /** REVOKE - Revoke trade permissions from the address */
    AuthzPermissionChange[AuthzPermissionChange["REVOKE"] = 1] = "REVOKE";
    AuthzPermissionChange[AuthzPermissionChange["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
})(AuthzPermissionChange || (AuthzPermissionChange = {}));
export const AuthzPermissionChangeSDKType = AuthzPermissionChange;
export function authzPermissionChangeFromJSON(object) {
    switch (object) {
        case 0:
        case 'GRANT':
            return AuthzPermissionChange.GRANT;
        case 1:
        case 'REVOKE':
            return AuthzPermissionChange.REVOKE;
        case -1:
        case 'UNRECOGNIZED':
        default:
            return AuthzPermissionChange.UNRECOGNIZED;
    }
}
export function authzPermissionChangeToJSON(object) {
    switch (object) {
        case AuthzPermissionChange.GRANT:
            return 'GRANT';
        case AuthzPermissionChange.REVOKE:
            return 'REVOKE';
        case AuthzPermissionChange.UNRECOGNIZED:
        default:
            return 'UNRECOGNIZED';
    }
}
function createBaseMsgUpdateInnerRedemptionRateBounds() {
    return {
        creator: '',
        chainId: '',
        minInnerRedemptionRate: '',
        maxInnerRedemptionRate: '',
    };
}
export const MsgUpdateInnerRedemptionRateBounds = {
    typeUrl: '/stride.stakeibc.MsgUpdateInnerRedemptionRateBounds',
    encode(message, writer = BinaryWriter.create()) {
        if (message.creator !== '') {
            writer.uint32(10).string(message.creator);
        }
        if (message.chainId !== '') {
            writer.uint32(18).string(message.chainId);
        }
        if (message.minInnerRedemptionRate !== '') {
            writer
                .uint32(26)
                .string(Decimal.fromUserInput(message.minInnerRedemptionRate, 18).atomics);
        }
        if (message.maxInnerRedemptionRate !== '') {
            writer
                .uint32(34)
                .string(Decimal.fromUserInput(message.maxInnerRedemptionRate, 18).atomics);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgUpdateInnerRedemptionRateBounds();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.creator = reader.string();
                    break;
                case 2:
                    message.chainId = reader.string();
                    break;
                case 3:
                    message.minInnerRedemptionRate = Decimal.fromAtomics(reader.string(), 18).toString();
                    break;
                case 4:
                    message.maxInnerRedemptionRate = Decimal.fromAtomics(reader.string(), 18).toString();
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
            creator: isSet(object.creator) ? String(object.creator) : '',
            chainId: isSet(object.chainId) ? String(object.chainId) : '',
            minInnerRedemptionRate: isSet(object.minInnerRedemptionRate)
                ? String(object.minInnerRedemptionRate)
                : '',
            maxInnerRedemptionRate: isSet(object.maxInnerRedemptionRate)
                ? String(object.maxInnerRedemptionRate)
                : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.creator !== undefined && (obj.creator = message.creator);
        message.chainId !== undefined && (obj.chainId = message.chainId);
        message.minInnerRedemptionRate !== undefined &&
            (obj.minInnerRedemptionRate = message.minInnerRedemptionRate);
        message.maxInnerRedemptionRate !== undefined &&
            (obj.maxInnerRedemptionRate = message.maxInnerRedemptionRate);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgUpdateInnerRedemptionRateBounds();
        message.creator = object.creator ?? '';
        message.chainId = object.chainId ?? '';
        message.minInnerRedemptionRate = object.minInnerRedemptionRate ?? '';
        message.maxInnerRedemptionRate = object.maxInnerRedemptionRate ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return MsgUpdateInnerRedemptionRateBounds.decode(message.value);
    },
    toProto(message) {
        return MsgUpdateInnerRedemptionRateBounds.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakeibc.MsgUpdateInnerRedemptionRateBounds',
            value: MsgUpdateInnerRedemptionRateBounds.encode(message).finish(),
        };
    },
};
function createBaseMsgUpdateInnerRedemptionRateBoundsResponse() {
    return {};
}
export const MsgUpdateInnerRedemptionRateBoundsResponse = {
    typeUrl: '/stride.stakeibc.MsgUpdateInnerRedemptionRateBoundsResponse',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgUpdateInnerRedemptionRateBoundsResponse();
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
        const message = createBaseMsgUpdateInnerRedemptionRateBoundsResponse();
        return message;
    },
    fromProtoMsg(message) {
        return MsgUpdateInnerRedemptionRateBoundsResponse.decode(message.value);
    },
    toProto(message) {
        return MsgUpdateInnerRedemptionRateBoundsResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakeibc.MsgUpdateInnerRedemptionRateBoundsResponse',
            value: MsgUpdateInnerRedemptionRateBoundsResponse.encode(message).finish(),
        };
    },
};
function createBaseMsgLiquidStake() {
    return {
        creator: '',
        amount: '',
        hostDenom: '',
    };
}
export const MsgLiquidStake = {
    typeUrl: '/stride.stakeibc.MsgLiquidStake',
    encode(message, writer = BinaryWriter.create()) {
        if (message.creator !== '') {
            writer.uint32(10).string(message.creator);
        }
        if (message.amount !== '') {
            writer.uint32(18).string(message.amount);
        }
        if (message.hostDenom !== '') {
            writer.uint32(26).string(message.hostDenom);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgLiquidStake();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.creator = reader.string();
                    break;
                case 2:
                    message.amount = reader.string();
                    break;
                case 3:
                    message.hostDenom = reader.string();
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
            creator: isSet(object.creator) ? String(object.creator) : '',
            amount: isSet(object.amount) ? String(object.amount) : '',
            hostDenom: isSet(object.hostDenom) ? String(object.hostDenom) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.creator !== undefined && (obj.creator = message.creator);
        message.amount !== undefined && (obj.amount = message.amount);
        message.hostDenom !== undefined && (obj.hostDenom = message.hostDenom);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgLiquidStake();
        message.creator = object.creator ?? '';
        message.amount = object.amount ?? '';
        message.hostDenom = object.hostDenom ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return MsgLiquidStake.decode(message.value);
    },
    toProto(message) {
        return MsgLiquidStake.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakeibc.MsgLiquidStake',
            value: MsgLiquidStake.encode(message).finish(),
        };
    },
};
function createBaseMsgLiquidStakeResponse() {
    return {
        stToken: Coin.fromPartial({}),
    };
}
export const MsgLiquidStakeResponse = {
    typeUrl: '/stride.stakeibc.MsgLiquidStakeResponse',
    encode(message, writer = BinaryWriter.create()) {
        if (message.stToken !== undefined) {
            Coin.encode(message.stToken, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgLiquidStakeResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.stToken = Coin.decode(reader, reader.uint32());
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
            stToken: isSet(object.stToken)
                ? Coin.fromJSON(object.stToken)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.stToken !== undefined &&
            (obj.stToken = message.stToken
                ? Coin.toJSON(message.stToken)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgLiquidStakeResponse();
        message.stToken =
            object.stToken !== undefined && object.stToken !== null
                ? Coin.fromPartial(object.stToken)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return MsgLiquidStakeResponse.decode(message.value);
    },
    toProto(message) {
        return MsgLiquidStakeResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakeibc.MsgLiquidStakeResponse',
            value: MsgLiquidStakeResponse.encode(message).finish(),
        };
    },
};
function createBaseMsgLSMLiquidStake() {
    return {
        creator: '',
        amount: '',
        lsmTokenIbcDenom: '',
    };
}
export const MsgLSMLiquidStake = {
    typeUrl: '/stride.stakeibc.MsgLSMLiquidStake',
    encode(message, writer = BinaryWriter.create()) {
        if (message.creator !== '') {
            writer.uint32(10).string(message.creator);
        }
        if (message.amount !== '') {
            writer.uint32(18).string(message.amount);
        }
        if (message.lsmTokenIbcDenom !== '') {
            writer.uint32(26).string(message.lsmTokenIbcDenom);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgLSMLiquidStake();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.creator = reader.string();
                    break;
                case 2:
                    message.amount = reader.string();
                    break;
                case 3:
                    message.lsmTokenIbcDenom = reader.string();
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
            creator: isSet(object.creator) ? String(object.creator) : '',
            amount: isSet(object.amount) ? String(object.amount) : '',
            lsmTokenIbcDenom: isSet(object.lsmTokenIbcDenom)
                ? String(object.lsmTokenIbcDenom)
                : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.creator !== undefined && (obj.creator = message.creator);
        message.amount !== undefined && (obj.amount = message.amount);
        message.lsmTokenIbcDenom !== undefined &&
            (obj.lsmTokenIbcDenom = message.lsmTokenIbcDenom);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgLSMLiquidStake();
        message.creator = object.creator ?? '';
        message.amount = object.amount ?? '';
        message.lsmTokenIbcDenom = object.lsmTokenIbcDenom ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return MsgLSMLiquidStake.decode(message.value);
    },
    toProto(message) {
        return MsgLSMLiquidStake.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakeibc.MsgLSMLiquidStake',
            value: MsgLSMLiquidStake.encode(message).finish(),
        };
    },
};
function createBaseMsgLSMLiquidStakeResponse() {
    return {
        transactionComplete: false,
    };
}
export const MsgLSMLiquidStakeResponse = {
    typeUrl: '/stride.stakeibc.MsgLSMLiquidStakeResponse',
    encode(message, writer = BinaryWriter.create()) {
        if (message.transactionComplete === true) {
            writer.uint32(8).bool(message.transactionComplete);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgLSMLiquidStakeResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.transactionComplete = reader.bool();
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
            transactionComplete: isSet(object.transactionComplete)
                ? Boolean(object.transactionComplete)
                : false,
        };
    },
    toJSON(message) {
        const obj = {};
        message.transactionComplete !== undefined &&
            (obj.transactionComplete = message.transactionComplete);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgLSMLiquidStakeResponse();
        message.transactionComplete = object.transactionComplete ?? false;
        return message;
    },
    fromProtoMsg(message) {
        return MsgLSMLiquidStakeResponse.decode(message.value);
    },
    toProto(message) {
        return MsgLSMLiquidStakeResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakeibc.MsgLSMLiquidStakeResponse',
            value: MsgLSMLiquidStakeResponse.encode(message).finish(),
        };
    },
};
function createBaseMsgClearBalance() {
    return {
        creator: '',
        chainId: '',
        amount: '',
        channel: '',
    };
}
export const MsgClearBalance = {
    typeUrl: '/stride.stakeibc.MsgClearBalance',
    encode(message, writer = BinaryWriter.create()) {
        if (message.creator !== '') {
            writer.uint32(10).string(message.creator);
        }
        if (message.chainId !== '') {
            writer.uint32(18).string(message.chainId);
        }
        if (message.amount !== '') {
            writer.uint32(26).string(message.amount);
        }
        if (message.channel !== '') {
            writer.uint32(34).string(message.channel);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgClearBalance();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.creator = reader.string();
                    break;
                case 2:
                    message.chainId = reader.string();
                    break;
                case 3:
                    message.amount = reader.string();
                    break;
                case 4:
                    message.channel = reader.string();
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
            creator: isSet(object.creator) ? String(object.creator) : '',
            chainId: isSet(object.chainId) ? String(object.chainId) : '',
            amount: isSet(object.amount) ? String(object.amount) : '',
            channel: isSet(object.channel) ? String(object.channel) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.creator !== undefined && (obj.creator = message.creator);
        message.chainId !== undefined && (obj.chainId = message.chainId);
        message.amount !== undefined && (obj.amount = message.amount);
        message.channel !== undefined && (obj.channel = message.channel);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgClearBalance();
        message.creator = object.creator ?? '';
        message.chainId = object.chainId ?? '';
        message.amount = object.amount ?? '';
        message.channel = object.channel ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return MsgClearBalance.decode(message.value);
    },
    toProto(message) {
        return MsgClearBalance.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakeibc.MsgClearBalance',
            value: MsgClearBalance.encode(message).finish(),
        };
    },
};
function createBaseMsgClearBalanceResponse() {
    return {};
}
export const MsgClearBalanceResponse = {
    typeUrl: '/stride.stakeibc.MsgClearBalanceResponse',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgClearBalanceResponse();
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
        const message = createBaseMsgClearBalanceResponse();
        return message;
    },
    fromProtoMsg(message) {
        return MsgClearBalanceResponse.decode(message.value);
    },
    toProto(message) {
        return MsgClearBalanceResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakeibc.MsgClearBalanceResponse',
            value: MsgClearBalanceResponse.encode(message).finish(),
        };
    },
};
function createBaseMsgRedeemStake() {
    return {
        creator: '',
        amount: '',
        hostZone: '',
        receiver: '',
    };
}
export const MsgRedeemStake = {
    typeUrl: '/stride.stakeibc.MsgRedeemStake',
    encode(message, writer = BinaryWriter.create()) {
        if (message.creator !== '') {
            writer.uint32(10).string(message.creator);
        }
        if (message.amount !== '') {
            writer.uint32(18).string(message.amount);
        }
        if (message.hostZone !== '') {
            writer.uint32(26).string(message.hostZone);
        }
        if (message.receiver !== '') {
            writer.uint32(34).string(message.receiver);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgRedeemStake();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.creator = reader.string();
                    break;
                case 2:
                    message.amount = reader.string();
                    break;
                case 3:
                    message.hostZone = reader.string();
                    break;
                case 4:
                    message.receiver = reader.string();
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
            creator: isSet(object.creator) ? String(object.creator) : '',
            amount: isSet(object.amount) ? String(object.amount) : '',
            hostZone: isSet(object.hostZone) ? String(object.hostZone) : '',
            receiver: isSet(object.receiver) ? String(object.receiver) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.creator !== undefined && (obj.creator = message.creator);
        message.amount !== undefined && (obj.amount = message.amount);
        message.hostZone !== undefined && (obj.hostZone = message.hostZone);
        message.receiver !== undefined && (obj.receiver = message.receiver);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgRedeemStake();
        message.creator = object.creator ?? '';
        message.amount = object.amount ?? '';
        message.hostZone = object.hostZone ?? '';
        message.receiver = object.receiver ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return MsgRedeemStake.decode(message.value);
    },
    toProto(message) {
        return MsgRedeemStake.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakeibc.MsgRedeemStake',
            value: MsgRedeemStake.encode(message).finish(),
        };
    },
};
function createBaseMsgRedeemStakeResponse() {
    return {};
}
export const MsgRedeemStakeResponse = {
    typeUrl: '/stride.stakeibc.MsgRedeemStakeResponse',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgRedeemStakeResponse();
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
        const message = createBaseMsgRedeemStakeResponse();
        return message;
    },
    fromProtoMsg(message) {
        return MsgRedeemStakeResponse.decode(message.value);
    },
    toProto(message) {
        return MsgRedeemStakeResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakeibc.MsgRedeemStakeResponse',
            value: MsgRedeemStakeResponse.encode(message).finish(),
        };
    },
};
function createBaseMsgRegisterHostZone() {
    return {
        connectionId: '',
        bech32prefix: '',
        hostDenom: '',
        ibcDenom: '',
        creator: '',
        transferChannelId: '',
        unbondingPeriod: BigInt(0),
        minRedemptionRate: '',
        maxRedemptionRate: '',
        lsmLiquidStakeEnabled: false,
        communityPoolTreasuryAddress: '',
        maxMessagesPerIcaTx: BigInt(0),
    };
}
export const MsgRegisterHostZone = {
    typeUrl: '/stride.stakeibc.MsgRegisterHostZone',
    encode(message, writer = BinaryWriter.create()) {
        if (message.connectionId !== '') {
            writer.uint32(18).string(message.connectionId);
        }
        if (message.bech32prefix !== '') {
            writer.uint32(98).string(message.bech32prefix);
        }
        if (message.hostDenom !== '') {
            writer.uint32(34).string(message.hostDenom);
        }
        if (message.ibcDenom !== '') {
            writer.uint32(42).string(message.ibcDenom);
        }
        if (message.creator !== '') {
            writer.uint32(50).string(message.creator);
        }
        if (message.transferChannelId !== '') {
            writer.uint32(82).string(message.transferChannelId);
        }
        if (message.unbondingPeriod !== BigInt(0)) {
            writer.uint32(88).uint64(message.unbondingPeriod);
        }
        if (message.minRedemptionRate !== '') {
            writer
                .uint32(106)
                .string(Decimal.fromUserInput(message.minRedemptionRate, 18).atomics);
        }
        if (message.maxRedemptionRate !== '') {
            writer
                .uint32(114)
                .string(Decimal.fromUserInput(message.maxRedemptionRate, 18).atomics);
        }
        if (message.lsmLiquidStakeEnabled === true) {
            writer.uint32(120).bool(message.lsmLiquidStakeEnabled);
        }
        if (message.communityPoolTreasuryAddress !== '') {
            writer.uint32(130).string(message.communityPoolTreasuryAddress);
        }
        if (message.maxMessagesPerIcaTx !== BigInt(0)) {
            writer.uint32(136).uint64(message.maxMessagesPerIcaTx);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgRegisterHostZone();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 2:
                    message.connectionId = reader.string();
                    break;
                case 12:
                    message.bech32prefix = reader.string();
                    break;
                case 4:
                    message.hostDenom = reader.string();
                    break;
                case 5:
                    message.ibcDenom = reader.string();
                    break;
                case 6:
                    message.creator = reader.string();
                    break;
                case 10:
                    message.transferChannelId = reader.string();
                    break;
                case 11:
                    message.unbondingPeriod = reader.uint64();
                    break;
                case 13:
                    message.minRedemptionRate = Decimal.fromAtomics(reader.string(), 18).toString();
                    break;
                case 14:
                    message.maxRedemptionRate = Decimal.fromAtomics(reader.string(), 18).toString();
                    break;
                case 15:
                    message.lsmLiquidStakeEnabled = reader.bool();
                    break;
                case 16:
                    message.communityPoolTreasuryAddress = reader.string();
                    break;
                case 17:
                    message.maxMessagesPerIcaTx = reader.uint64();
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
            connectionId: isSet(object.connectionId)
                ? String(object.connectionId)
                : '',
            bech32prefix: isSet(object.bech32prefix)
                ? String(object.bech32prefix)
                : '',
            hostDenom: isSet(object.hostDenom) ? String(object.hostDenom) : '',
            ibcDenom: isSet(object.ibcDenom) ? String(object.ibcDenom) : '',
            creator: isSet(object.creator) ? String(object.creator) : '',
            transferChannelId: isSet(object.transferChannelId)
                ? String(object.transferChannelId)
                : '',
            unbondingPeriod: isSet(object.unbondingPeriod)
                ? BigInt(object.unbondingPeriod.toString())
                : BigInt(0),
            minRedemptionRate: isSet(object.minRedemptionRate)
                ? String(object.minRedemptionRate)
                : '',
            maxRedemptionRate: isSet(object.maxRedemptionRate)
                ? String(object.maxRedemptionRate)
                : '',
            lsmLiquidStakeEnabled: isSet(object.lsmLiquidStakeEnabled)
                ? Boolean(object.lsmLiquidStakeEnabled)
                : false,
            communityPoolTreasuryAddress: isSet(object.communityPoolTreasuryAddress)
                ? String(object.communityPoolTreasuryAddress)
                : '',
            maxMessagesPerIcaTx: isSet(object.maxMessagesPerIcaTx)
                ? BigInt(object.maxMessagesPerIcaTx.toString())
                : BigInt(0),
        };
    },
    toJSON(message) {
        const obj = {};
        message.connectionId !== undefined &&
            (obj.connectionId = message.connectionId);
        message.bech32prefix !== undefined &&
            (obj.bech32prefix = message.bech32prefix);
        message.hostDenom !== undefined && (obj.hostDenom = message.hostDenom);
        message.ibcDenom !== undefined && (obj.ibcDenom = message.ibcDenom);
        message.creator !== undefined && (obj.creator = message.creator);
        message.transferChannelId !== undefined &&
            (obj.transferChannelId = message.transferChannelId);
        message.unbondingPeriod !== undefined &&
            (obj.unbondingPeriod = (message.unbondingPeriod || BigInt(0)).toString());
        message.minRedemptionRate !== undefined &&
            (obj.minRedemptionRate = message.minRedemptionRate);
        message.maxRedemptionRate !== undefined &&
            (obj.maxRedemptionRate = message.maxRedemptionRate);
        message.lsmLiquidStakeEnabled !== undefined &&
            (obj.lsmLiquidStakeEnabled = message.lsmLiquidStakeEnabled);
        message.communityPoolTreasuryAddress !== undefined &&
            (obj.communityPoolTreasuryAddress = message.communityPoolTreasuryAddress);
        message.maxMessagesPerIcaTx !== undefined &&
            (obj.maxMessagesPerIcaTx = (message.maxMessagesPerIcaTx || BigInt(0)).toString());
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgRegisterHostZone();
        message.connectionId = object.connectionId ?? '';
        message.bech32prefix = object.bech32prefix ?? '';
        message.hostDenom = object.hostDenom ?? '';
        message.ibcDenom = object.ibcDenom ?? '';
        message.creator = object.creator ?? '';
        message.transferChannelId = object.transferChannelId ?? '';
        message.unbondingPeriod =
            object.unbondingPeriod !== undefined && object.unbondingPeriod !== null
                ? BigInt(object.unbondingPeriod.toString())
                : BigInt(0);
        message.minRedemptionRate = object.minRedemptionRate ?? '';
        message.maxRedemptionRate = object.maxRedemptionRate ?? '';
        message.lsmLiquidStakeEnabled = object.lsmLiquidStakeEnabled ?? false;
        message.communityPoolTreasuryAddress =
            object.communityPoolTreasuryAddress ?? '';
        message.maxMessagesPerIcaTx =
            object.maxMessagesPerIcaTx !== undefined &&
                object.maxMessagesPerIcaTx !== null
                ? BigInt(object.maxMessagesPerIcaTx.toString())
                : BigInt(0);
        return message;
    },
    fromProtoMsg(message) {
        return MsgRegisterHostZone.decode(message.value);
    },
    toProto(message) {
        return MsgRegisterHostZone.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakeibc.MsgRegisterHostZone',
            value: MsgRegisterHostZone.encode(message).finish(),
        };
    },
};
function createBaseMsgRegisterHostZoneResponse() {
    return {};
}
export const MsgRegisterHostZoneResponse = {
    typeUrl: '/stride.stakeibc.MsgRegisterHostZoneResponse',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgRegisterHostZoneResponse();
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
        const message = createBaseMsgRegisterHostZoneResponse();
        return message;
    },
    fromProtoMsg(message) {
        return MsgRegisterHostZoneResponse.decode(message.value);
    },
    toProto(message) {
        return MsgRegisterHostZoneResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakeibc.MsgRegisterHostZoneResponse',
            value: MsgRegisterHostZoneResponse.encode(message).finish(),
        };
    },
};
function createBaseMsgClaimUndelegatedTokens() {
    return {
        creator: '',
        hostZoneId: '',
        epoch: BigInt(0),
        receiver: '',
    };
}
export const MsgClaimUndelegatedTokens = {
    typeUrl: '/stride.stakeibc.MsgClaimUndelegatedTokens',
    encode(message, writer = BinaryWriter.create()) {
        if (message.creator !== '') {
            writer.uint32(10).string(message.creator);
        }
        if (message.hostZoneId !== '') {
            writer.uint32(18).string(message.hostZoneId);
        }
        if (message.epoch !== BigInt(0)) {
            writer.uint32(24).uint64(message.epoch);
        }
        if (message.receiver !== '') {
            writer.uint32(42).string(message.receiver);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgClaimUndelegatedTokens();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.creator = reader.string();
                    break;
                case 2:
                    message.hostZoneId = reader.string();
                    break;
                case 3:
                    message.epoch = reader.uint64();
                    break;
                case 5:
                    message.receiver = reader.string();
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
            creator: isSet(object.creator) ? String(object.creator) : '',
            hostZoneId: isSet(object.hostZoneId) ? String(object.hostZoneId) : '',
            epoch: isSet(object.epoch) ? BigInt(object.epoch.toString()) : BigInt(0),
            receiver: isSet(object.receiver) ? String(object.receiver) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.creator !== undefined && (obj.creator = message.creator);
        message.hostZoneId !== undefined && (obj.hostZoneId = message.hostZoneId);
        message.epoch !== undefined &&
            (obj.epoch = (message.epoch || BigInt(0)).toString());
        message.receiver !== undefined && (obj.receiver = message.receiver);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgClaimUndelegatedTokens();
        message.creator = object.creator ?? '';
        message.hostZoneId = object.hostZoneId ?? '';
        message.epoch =
            object.epoch !== undefined && object.epoch !== null
                ? BigInt(object.epoch.toString())
                : BigInt(0);
        message.receiver = object.receiver ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return MsgClaimUndelegatedTokens.decode(message.value);
    },
    toProto(message) {
        return MsgClaimUndelegatedTokens.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakeibc.MsgClaimUndelegatedTokens',
            value: MsgClaimUndelegatedTokens.encode(message).finish(),
        };
    },
};
function createBaseMsgClaimUndelegatedTokensResponse() {
    return {};
}
export const MsgClaimUndelegatedTokensResponse = {
    typeUrl: '/stride.stakeibc.MsgClaimUndelegatedTokensResponse',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgClaimUndelegatedTokensResponse();
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
        const message = createBaseMsgClaimUndelegatedTokensResponse();
        return message;
    },
    fromProtoMsg(message) {
        return MsgClaimUndelegatedTokensResponse.decode(message.value);
    },
    toProto(message) {
        return MsgClaimUndelegatedTokensResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakeibc.MsgClaimUndelegatedTokensResponse',
            value: MsgClaimUndelegatedTokensResponse.encode(message).finish(),
        };
    },
};
function createBaseMsgRebalanceValidators() {
    return {
        creator: '',
        hostZone: '',
        numRebalance: BigInt(0),
    };
}
export const MsgRebalanceValidators = {
    typeUrl: '/stride.stakeibc.MsgRebalanceValidators',
    encode(message, writer = BinaryWriter.create()) {
        if (message.creator !== '') {
            writer.uint32(10).string(message.creator);
        }
        if (message.hostZone !== '') {
            writer.uint32(18).string(message.hostZone);
        }
        if (message.numRebalance !== BigInt(0)) {
            writer.uint32(24).uint64(message.numRebalance);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgRebalanceValidators();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.creator = reader.string();
                    break;
                case 2:
                    message.hostZone = reader.string();
                    break;
                case 3:
                    message.numRebalance = reader.uint64();
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
            creator: isSet(object.creator) ? String(object.creator) : '',
            hostZone: isSet(object.hostZone) ? String(object.hostZone) : '',
            numRebalance: isSet(object.numRebalance)
                ? BigInt(object.numRebalance.toString())
                : BigInt(0),
        };
    },
    toJSON(message) {
        const obj = {};
        message.creator !== undefined && (obj.creator = message.creator);
        message.hostZone !== undefined && (obj.hostZone = message.hostZone);
        message.numRebalance !== undefined &&
            (obj.numRebalance = (message.numRebalance || BigInt(0)).toString());
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgRebalanceValidators();
        message.creator = object.creator ?? '';
        message.hostZone = object.hostZone ?? '';
        message.numRebalance =
            object.numRebalance !== undefined && object.numRebalance !== null
                ? BigInt(object.numRebalance.toString())
                : BigInt(0);
        return message;
    },
    fromProtoMsg(message) {
        return MsgRebalanceValidators.decode(message.value);
    },
    toProto(message) {
        return MsgRebalanceValidators.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakeibc.MsgRebalanceValidators',
            value: MsgRebalanceValidators.encode(message).finish(),
        };
    },
};
function createBaseMsgRebalanceValidatorsResponse() {
    return {};
}
export const MsgRebalanceValidatorsResponse = {
    typeUrl: '/stride.stakeibc.MsgRebalanceValidatorsResponse',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgRebalanceValidatorsResponse();
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
        const message = createBaseMsgRebalanceValidatorsResponse();
        return message;
    },
    fromProtoMsg(message) {
        return MsgRebalanceValidatorsResponse.decode(message.value);
    },
    toProto(message) {
        return MsgRebalanceValidatorsResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakeibc.MsgRebalanceValidatorsResponse',
            value: MsgRebalanceValidatorsResponse.encode(message).finish(),
        };
    },
};
function createBaseMsgAddValidators() {
    return {
        creator: '',
        hostZone: '',
        validators: [],
    };
}
export const MsgAddValidators = {
    typeUrl: '/stride.stakeibc.MsgAddValidators',
    encode(message, writer = BinaryWriter.create()) {
        if (message.creator !== '') {
            writer.uint32(10).string(message.creator);
        }
        if (message.hostZone !== '') {
            writer.uint32(18).string(message.hostZone);
        }
        for (const v of message.validators) {
            Validator.encode(v, writer.uint32(26).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgAddValidators();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.creator = reader.string();
                    break;
                case 2:
                    message.hostZone = reader.string();
                    break;
                case 3:
                    message.validators.push(Validator.decode(reader, reader.uint32()));
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
            creator: isSet(object.creator) ? String(object.creator) : '',
            hostZone: isSet(object.hostZone) ? String(object.hostZone) : '',
            validators: Array.isArray(object?.validators)
                ? object.validators.map((e) => Validator.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        message.creator !== undefined && (obj.creator = message.creator);
        message.hostZone !== undefined && (obj.hostZone = message.hostZone);
        if (message.validators) {
            obj.validators = message.validators.map(e => e ? Validator.toJSON(e) : undefined);
        }
        else {
            obj.validators = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgAddValidators();
        message.creator = object.creator ?? '';
        message.hostZone = object.hostZone ?? '';
        message.validators =
            object.validators?.map(e => Validator.fromPartial(e)) || [];
        return message;
    },
    fromProtoMsg(message) {
        return MsgAddValidators.decode(message.value);
    },
    toProto(message) {
        return MsgAddValidators.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakeibc.MsgAddValidators',
            value: MsgAddValidators.encode(message).finish(),
        };
    },
};
function createBaseMsgAddValidatorsResponse() {
    return {};
}
export const MsgAddValidatorsResponse = {
    typeUrl: '/stride.stakeibc.MsgAddValidatorsResponse',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgAddValidatorsResponse();
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
        const message = createBaseMsgAddValidatorsResponse();
        return message;
    },
    fromProtoMsg(message) {
        return MsgAddValidatorsResponse.decode(message.value);
    },
    toProto(message) {
        return MsgAddValidatorsResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakeibc.MsgAddValidatorsResponse',
            value: MsgAddValidatorsResponse.encode(message).finish(),
        };
    },
};
function createBaseValidatorWeight() {
    return {
        address: '',
        weight: BigInt(0),
    };
}
export const ValidatorWeight = {
    typeUrl: '/stride.stakeibc.ValidatorWeight',
    encode(message, writer = BinaryWriter.create()) {
        if (message.address !== '') {
            writer.uint32(10).string(message.address);
        }
        if (message.weight !== BigInt(0)) {
            writer.uint32(16).uint64(message.weight);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseValidatorWeight();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.address = reader.string();
                    break;
                case 2:
                    message.weight = reader.uint64();
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
            weight: isSet(object.weight)
                ? BigInt(object.weight.toString())
                : BigInt(0),
        };
    },
    toJSON(message) {
        const obj = {};
        message.address !== undefined && (obj.address = message.address);
        message.weight !== undefined &&
            (obj.weight = (message.weight || BigInt(0)).toString());
        return obj;
    },
    fromPartial(object) {
        const message = createBaseValidatorWeight();
        message.address = object.address ?? '';
        message.weight =
            object.weight !== undefined && object.weight !== null
                ? BigInt(object.weight.toString())
                : BigInt(0);
        return message;
    },
    fromProtoMsg(message) {
        return ValidatorWeight.decode(message.value);
    },
    toProto(message) {
        return ValidatorWeight.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakeibc.ValidatorWeight',
            value: ValidatorWeight.encode(message).finish(),
        };
    },
};
function createBaseMsgChangeValidatorWeights() {
    return {
        creator: '',
        hostZone: '',
        validatorWeights: [],
    };
}
export const MsgChangeValidatorWeights = {
    typeUrl: '/stride.stakeibc.MsgChangeValidatorWeights',
    encode(message, writer = BinaryWriter.create()) {
        if (message.creator !== '') {
            writer.uint32(10).string(message.creator);
        }
        if (message.hostZone !== '') {
            writer.uint32(18).string(message.hostZone);
        }
        for (const v of message.validatorWeights) {
            ValidatorWeight.encode(v, writer.uint32(26).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgChangeValidatorWeights();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.creator = reader.string();
                    break;
                case 2:
                    message.hostZone = reader.string();
                    break;
                case 3:
                    message.validatorWeights.push(ValidatorWeight.decode(reader, reader.uint32()));
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
            creator: isSet(object.creator) ? String(object.creator) : '',
            hostZone: isSet(object.hostZone) ? String(object.hostZone) : '',
            validatorWeights: Array.isArray(object?.validatorWeights)
                ? object.validatorWeights.map((e) => ValidatorWeight.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        message.creator !== undefined && (obj.creator = message.creator);
        message.hostZone !== undefined && (obj.hostZone = message.hostZone);
        if (message.validatorWeights) {
            obj.validatorWeights = message.validatorWeights.map(e => e ? ValidatorWeight.toJSON(e) : undefined);
        }
        else {
            obj.validatorWeights = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgChangeValidatorWeights();
        message.creator = object.creator ?? '';
        message.hostZone = object.hostZone ?? '';
        message.validatorWeights =
            object.validatorWeights?.map(e => ValidatorWeight.fromPartial(e)) || [];
        return message;
    },
    fromProtoMsg(message) {
        return MsgChangeValidatorWeights.decode(message.value);
    },
    toProto(message) {
        return MsgChangeValidatorWeights.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakeibc.MsgChangeValidatorWeights',
            value: MsgChangeValidatorWeights.encode(message).finish(),
        };
    },
};
function createBaseMsgChangeValidatorWeightsResponse() {
    return {};
}
export const MsgChangeValidatorWeightsResponse = {
    typeUrl: '/stride.stakeibc.MsgChangeValidatorWeightsResponse',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgChangeValidatorWeightsResponse();
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
        const message = createBaseMsgChangeValidatorWeightsResponse();
        return message;
    },
    fromProtoMsg(message) {
        return MsgChangeValidatorWeightsResponse.decode(message.value);
    },
    toProto(message) {
        return MsgChangeValidatorWeightsResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakeibc.MsgChangeValidatorWeightsResponse',
            value: MsgChangeValidatorWeightsResponse.encode(message).finish(),
        };
    },
};
function createBaseMsgDeleteValidator() {
    return {
        creator: '',
        hostZone: '',
        valAddr: '',
    };
}
export const MsgDeleteValidator = {
    typeUrl: '/stride.stakeibc.MsgDeleteValidator',
    encode(message, writer = BinaryWriter.create()) {
        if (message.creator !== '') {
            writer.uint32(10).string(message.creator);
        }
        if (message.hostZone !== '') {
            writer.uint32(18).string(message.hostZone);
        }
        if (message.valAddr !== '') {
            writer.uint32(26).string(message.valAddr);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgDeleteValidator();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.creator = reader.string();
                    break;
                case 2:
                    message.hostZone = reader.string();
                    break;
                case 3:
                    message.valAddr = reader.string();
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
            creator: isSet(object.creator) ? String(object.creator) : '',
            hostZone: isSet(object.hostZone) ? String(object.hostZone) : '',
            valAddr: isSet(object.valAddr) ? String(object.valAddr) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.creator !== undefined && (obj.creator = message.creator);
        message.hostZone !== undefined && (obj.hostZone = message.hostZone);
        message.valAddr !== undefined && (obj.valAddr = message.valAddr);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgDeleteValidator();
        message.creator = object.creator ?? '';
        message.hostZone = object.hostZone ?? '';
        message.valAddr = object.valAddr ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return MsgDeleteValidator.decode(message.value);
    },
    toProto(message) {
        return MsgDeleteValidator.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakeibc.MsgDeleteValidator',
            value: MsgDeleteValidator.encode(message).finish(),
        };
    },
};
function createBaseMsgDeleteValidatorResponse() {
    return {};
}
export const MsgDeleteValidatorResponse = {
    typeUrl: '/stride.stakeibc.MsgDeleteValidatorResponse',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgDeleteValidatorResponse();
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
        const message = createBaseMsgDeleteValidatorResponse();
        return message;
    },
    fromProtoMsg(message) {
        return MsgDeleteValidatorResponse.decode(message.value);
    },
    toProto(message) {
        return MsgDeleteValidatorResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakeibc.MsgDeleteValidatorResponse',
            value: MsgDeleteValidatorResponse.encode(message).finish(),
        };
    },
};
function createBaseMsgRestoreInterchainAccount() {
    return {
        creator: '',
        chainId: '',
        connectionId: '',
        accountOwner: '',
    };
}
export const MsgRestoreInterchainAccount = {
    typeUrl: '/stride.stakeibc.MsgRestoreInterchainAccount',
    encode(message, writer = BinaryWriter.create()) {
        if (message.creator !== '') {
            writer.uint32(10).string(message.creator);
        }
        if (message.chainId !== '') {
            writer.uint32(18).string(message.chainId);
        }
        if (message.connectionId !== '') {
            writer.uint32(26).string(message.connectionId);
        }
        if (message.accountOwner !== '') {
            writer.uint32(34).string(message.accountOwner);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgRestoreInterchainAccount();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.creator = reader.string();
                    break;
                case 2:
                    message.chainId = reader.string();
                    break;
                case 3:
                    message.connectionId = reader.string();
                    break;
                case 4:
                    message.accountOwner = reader.string();
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
            creator: isSet(object.creator) ? String(object.creator) : '',
            chainId: isSet(object.chainId) ? String(object.chainId) : '',
            connectionId: isSet(object.connectionId)
                ? String(object.connectionId)
                : '',
            accountOwner: isSet(object.accountOwner)
                ? String(object.accountOwner)
                : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.creator !== undefined && (obj.creator = message.creator);
        message.chainId !== undefined && (obj.chainId = message.chainId);
        message.connectionId !== undefined &&
            (obj.connectionId = message.connectionId);
        message.accountOwner !== undefined &&
            (obj.accountOwner = message.accountOwner);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgRestoreInterchainAccount();
        message.creator = object.creator ?? '';
        message.chainId = object.chainId ?? '';
        message.connectionId = object.connectionId ?? '';
        message.accountOwner = object.accountOwner ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return MsgRestoreInterchainAccount.decode(message.value);
    },
    toProto(message) {
        return MsgRestoreInterchainAccount.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakeibc.MsgRestoreInterchainAccount',
            value: MsgRestoreInterchainAccount.encode(message).finish(),
        };
    },
};
function createBaseMsgRestoreInterchainAccountResponse() {
    return {};
}
export const MsgRestoreInterchainAccountResponse = {
    typeUrl: '/stride.stakeibc.MsgRestoreInterchainAccountResponse',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgRestoreInterchainAccountResponse();
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
        const message = createBaseMsgRestoreInterchainAccountResponse();
        return message;
    },
    fromProtoMsg(message) {
        return MsgRestoreInterchainAccountResponse.decode(message.value);
    },
    toProto(message) {
        return MsgRestoreInterchainAccountResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakeibc.MsgRestoreInterchainAccountResponse',
            value: MsgRestoreInterchainAccountResponse.encode(message).finish(),
        };
    },
};
function createBaseMsgCloseDelegationChannel() {
    return {
        creator: '',
        chainId: '',
    };
}
export const MsgCloseDelegationChannel = {
    typeUrl: '/stride.stakeibc.MsgCloseDelegationChannel',
    encode(message, writer = BinaryWriter.create()) {
        if (message.creator !== '') {
            writer.uint32(10).string(message.creator);
        }
        if (message.chainId !== '') {
            writer.uint32(18).string(message.chainId);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgCloseDelegationChannel();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.creator = reader.string();
                    break;
                case 2:
                    message.chainId = reader.string();
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
            creator: isSet(object.creator) ? String(object.creator) : '',
            chainId: isSet(object.chainId) ? String(object.chainId) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.creator !== undefined && (obj.creator = message.creator);
        message.chainId !== undefined && (obj.chainId = message.chainId);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgCloseDelegationChannel();
        message.creator = object.creator ?? '';
        message.chainId = object.chainId ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return MsgCloseDelegationChannel.decode(message.value);
    },
    toProto(message) {
        return MsgCloseDelegationChannel.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakeibc.MsgCloseDelegationChannel',
            value: MsgCloseDelegationChannel.encode(message).finish(),
        };
    },
};
function createBaseMsgCloseDelegationChannelResponse() {
    return {};
}
export const MsgCloseDelegationChannelResponse = {
    typeUrl: '/stride.stakeibc.MsgCloseDelegationChannelResponse',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgCloseDelegationChannelResponse();
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
        const message = createBaseMsgCloseDelegationChannelResponse();
        return message;
    },
    fromProtoMsg(message) {
        return MsgCloseDelegationChannelResponse.decode(message.value);
    },
    toProto(message) {
        return MsgCloseDelegationChannelResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakeibc.MsgCloseDelegationChannelResponse',
            value: MsgCloseDelegationChannelResponse.encode(message).finish(),
        };
    },
};
function createBaseMsgUpdateValidatorSharesExchRate() {
    return {
        creator: '',
        chainId: '',
        valoper: '',
    };
}
export const MsgUpdateValidatorSharesExchRate = {
    typeUrl: '/stride.stakeibc.MsgUpdateValidatorSharesExchRate',
    encode(message, writer = BinaryWriter.create()) {
        if (message.creator !== '') {
            writer.uint32(10).string(message.creator);
        }
        if (message.chainId !== '') {
            writer.uint32(18).string(message.chainId);
        }
        if (message.valoper !== '') {
            writer.uint32(26).string(message.valoper);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgUpdateValidatorSharesExchRate();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.creator = reader.string();
                    break;
                case 2:
                    message.chainId = reader.string();
                    break;
                case 3:
                    message.valoper = reader.string();
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
            creator: isSet(object.creator) ? String(object.creator) : '',
            chainId: isSet(object.chainId) ? String(object.chainId) : '',
            valoper: isSet(object.valoper) ? String(object.valoper) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.creator !== undefined && (obj.creator = message.creator);
        message.chainId !== undefined && (obj.chainId = message.chainId);
        message.valoper !== undefined && (obj.valoper = message.valoper);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgUpdateValidatorSharesExchRate();
        message.creator = object.creator ?? '';
        message.chainId = object.chainId ?? '';
        message.valoper = object.valoper ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return MsgUpdateValidatorSharesExchRate.decode(message.value);
    },
    toProto(message) {
        return MsgUpdateValidatorSharesExchRate.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakeibc.MsgUpdateValidatorSharesExchRate',
            value: MsgUpdateValidatorSharesExchRate.encode(message).finish(),
        };
    },
};
function createBaseMsgUpdateValidatorSharesExchRateResponse() {
    return {};
}
export const MsgUpdateValidatorSharesExchRateResponse = {
    typeUrl: '/stride.stakeibc.MsgUpdateValidatorSharesExchRateResponse',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgUpdateValidatorSharesExchRateResponse();
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
        const message = createBaseMsgUpdateValidatorSharesExchRateResponse();
        return message;
    },
    fromProtoMsg(message) {
        return MsgUpdateValidatorSharesExchRateResponse.decode(message.value);
    },
    toProto(message) {
        return MsgUpdateValidatorSharesExchRateResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakeibc.MsgUpdateValidatorSharesExchRateResponse',
            value: MsgUpdateValidatorSharesExchRateResponse.encode(message).finish(),
        };
    },
};
function createBaseMsgCalibrateDelegation() {
    return {
        creator: '',
        chainId: '',
        valoper: '',
    };
}
export const MsgCalibrateDelegation = {
    typeUrl: '/stride.stakeibc.MsgCalibrateDelegation',
    encode(message, writer = BinaryWriter.create()) {
        if (message.creator !== '') {
            writer.uint32(10).string(message.creator);
        }
        if (message.chainId !== '') {
            writer.uint32(18).string(message.chainId);
        }
        if (message.valoper !== '') {
            writer.uint32(26).string(message.valoper);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgCalibrateDelegation();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.creator = reader.string();
                    break;
                case 2:
                    message.chainId = reader.string();
                    break;
                case 3:
                    message.valoper = reader.string();
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
            creator: isSet(object.creator) ? String(object.creator) : '',
            chainId: isSet(object.chainId) ? String(object.chainId) : '',
            valoper: isSet(object.valoper) ? String(object.valoper) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.creator !== undefined && (obj.creator = message.creator);
        message.chainId !== undefined && (obj.chainId = message.chainId);
        message.valoper !== undefined && (obj.valoper = message.valoper);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgCalibrateDelegation();
        message.creator = object.creator ?? '';
        message.chainId = object.chainId ?? '';
        message.valoper = object.valoper ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return MsgCalibrateDelegation.decode(message.value);
    },
    toProto(message) {
        return MsgCalibrateDelegation.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakeibc.MsgCalibrateDelegation',
            value: MsgCalibrateDelegation.encode(message).finish(),
        };
    },
};
function createBaseMsgCalibrateDelegationResponse() {
    return {};
}
export const MsgCalibrateDelegationResponse = {
    typeUrl: '/stride.stakeibc.MsgCalibrateDelegationResponse',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgCalibrateDelegationResponse();
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
        const message = createBaseMsgCalibrateDelegationResponse();
        return message;
    },
    fromProtoMsg(message) {
        return MsgCalibrateDelegationResponse.decode(message.value);
    },
    toProto(message) {
        return MsgCalibrateDelegationResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakeibc.MsgCalibrateDelegationResponse',
            value: MsgCalibrateDelegationResponse.encode(message).finish(),
        };
    },
};
function createBaseMsgResumeHostZone() {
    return {
        creator: '',
        chainId: '',
    };
}
export const MsgResumeHostZone = {
    typeUrl: '/stride.stakeibc.MsgResumeHostZone',
    encode(message, writer = BinaryWriter.create()) {
        if (message.creator !== '') {
            writer.uint32(10).string(message.creator);
        }
        if (message.chainId !== '') {
            writer.uint32(18).string(message.chainId);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgResumeHostZone();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.creator = reader.string();
                    break;
                case 2:
                    message.chainId = reader.string();
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
            creator: isSet(object.creator) ? String(object.creator) : '',
            chainId: isSet(object.chainId) ? String(object.chainId) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.creator !== undefined && (obj.creator = message.creator);
        message.chainId !== undefined && (obj.chainId = message.chainId);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgResumeHostZone();
        message.creator = object.creator ?? '';
        message.chainId = object.chainId ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return MsgResumeHostZone.decode(message.value);
    },
    toProto(message) {
        return MsgResumeHostZone.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakeibc.MsgResumeHostZone',
            value: MsgResumeHostZone.encode(message).finish(),
        };
    },
};
function createBaseMsgResumeHostZoneResponse() {
    return {};
}
export const MsgResumeHostZoneResponse = {
    typeUrl: '/stride.stakeibc.MsgResumeHostZoneResponse',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgResumeHostZoneResponse();
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
        const message = createBaseMsgResumeHostZoneResponse();
        return message;
    },
    fromProtoMsg(message) {
        return MsgResumeHostZoneResponse.decode(message.value);
    },
    toProto(message) {
        return MsgResumeHostZoneResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakeibc.MsgResumeHostZoneResponse',
            value: MsgResumeHostZoneResponse.encode(message).finish(),
        };
    },
};
function createBaseMsgCreateTradeRoute() {
    return {
        authority: '',
        hostChainId: '',
        strideToRewardConnectionId: '',
        strideToTradeConnectionId: '',
        hostToRewardTransferChannelId: '',
        rewardToTradeTransferChannelId: '',
        tradeToHostTransferChannelId: '',
        rewardDenomOnHost: '',
        rewardDenomOnReward: '',
        rewardDenomOnTrade: '',
        hostDenomOnTrade: '',
        hostDenomOnHost: '',
        poolId: BigInt(0),
        maxAllowedSwapLossRate: '',
        minSwapAmount: '',
        maxSwapAmount: '',
        minTransferAmount: '',
    };
}
export const MsgCreateTradeRoute = {
    typeUrl: '/stride.stakeibc.MsgCreateTradeRoute',
    encode(message, writer = BinaryWriter.create()) {
        if (message.authority !== '') {
            writer.uint32(10).string(message.authority);
        }
        if (message.hostChainId !== '') {
            writer.uint32(18).string(message.hostChainId);
        }
        if (message.strideToRewardConnectionId !== '') {
            writer.uint32(26).string(message.strideToRewardConnectionId);
        }
        if (message.strideToTradeConnectionId !== '') {
            writer.uint32(34).string(message.strideToTradeConnectionId);
        }
        if (message.hostToRewardTransferChannelId !== '') {
            writer.uint32(42).string(message.hostToRewardTransferChannelId);
        }
        if (message.rewardToTradeTransferChannelId !== '') {
            writer.uint32(50).string(message.rewardToTradeTransferChannelId);
        }
        if (message.tradeToHostTransferChannelId !== '') {
            writer.uint32(58).string(message.tradeToHostTransferChannelId);
        }
        if (message.rewardDenomOnHost !== '') {
            writer.uint32(66).string(message.rewardDenomOnHost);
        }
        if (message.rewardDenomOnReward !== '') {
            writer.uint32(74).string(message.rewardDenomOnReward);
        }
        if (message.rewardDenomOnTrade !== '') {
            writer.uint32(82).string(message.rewardDenomOnTrade);
        }
        if (message.hostDenomOnTrade !== '') {
            writer.uint32(90).string(message.hostDenomOnTrade);
        }
        if (message.hostDenomOnHost !== '') {
            writer.uint32(98).string(message.hostDenomOnHost);
        }
        if (message.poolId !== BigInt(0)) {
            writer.uint32(104).uint64(message.poolId);
        }
        if (message.maxAllowedSwapLossRate !== '') {
            writer.uint32(114).string(message.maxAllowedSwapLossRate);
        }
        if (message.minSwapAmount !== '') {
            writer.uint32(122).string(message.minSwapAmount);
        }
        if (message.maxSwapAmount !== '') {
            writer.uint32(130).string(message.maxSwapAmount);
        }
        if (message.minTransferAmount !== '') {
            writer.uint32(138).string(message.minTransferAmount);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgCreateTradeRoute();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.authority = reader.string();
                    break;
                case 2:
                    message.hostChainId = reader.string();
                    break;
                case 3:
                    message.strideToRewardConnectionId = reader.string();
                    break;
                case 4:
                    message.strideToTradeConnectionId = reader.string();
                    break;
                case 5:
                    message.hostToRewardTransferChannelId = reader.string();
                    break;
                case 6:
                    message.rewardToTradeTransferChannelId = reader.string();
                    break;
                case 7:
                    message.tradeToHostTransferChannelId = reader.string();
                    break;
                case 8:
                    message.rewardDenomOnHost = reader.string();
                    break;
                case 9:
                    message.rewardDenomOnReward = reader.string();
                    break;
                case 10:
                    message.rewardDenomOnTrade = reader.string();
                    break;
                case 11:
                    message.hostDenomOnTrade = reader.string();
                    break;
                case 12:
                    message.hostDenomOnHost = reader.string();
                    break;
                case 13:
                    message.poolId = reader.uint64();
                    break;
                case 14:
                    message.maxAllowedSwapLossRate = reader.string();
                    break;
                case 15:
                    message.minSwapAmount = reader.string();
                    break;
                case 16:
                    message.maxSwapAmount = reader.string();
                    break;
                case 17:
                    message.minTransferAmount = reader.string();
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
            authority: isSet(object.authority) ? String(object.authority) : '',
            hostChainId: isSet(object.hostChainId) ? String(object.hostChainId) : '',
            strideToRewardConnectionId: isSet(object.strideToRewardConnectionId)
                ? String(object.strideToRewardConnectionId)
                : '',
            strideToTradeConnectionId: isSet(object.strideToTradeConnectionId)
                ? String(object.strideToTradeConnectionId)
                : '',
            hostToRewardTransferChannelId: isSet(object.hostToRewardTransferChannelId)
                ? String(object.hostToRewardTransferChannelId)
                : '',
            rewardToTradeTransferChannelId: isSet(object.rewardToTradeTransferChannelId)
                ? String(object.rewardToTradeTransferChannelId)
                : '',
            tradeToHostTransferChannelId: isSet(object.tradeToHostTransferChannelId)
                ? String(object.tradeToHostTransferChannelId)
                : '',
            rewardDenomOnHost: isSet(object.rewardDenomOnHost)
                ? String(object.rewardDenomOnHost)
                : '',
            rewardDenomOnReward: isSet(object.rewardDenomOnReward)
                ? String(object.rewardDenomOnReward)
                : '',
            rewardDenomOnTrade: isSet(object.rewardDenomOnTrade)
                ? String(object.rewardDenomOnTrade)
                : '',
            hostDenomOnTrade: isSet(object.hostDenomOnTrade)
                ? String(object.hostDenomOnTrade)
                : '',
            hostDenomOnHost: isSet(object.hostDenomOnHost)
                ? String(object.hostDenomOnHost)
                : '',
            poolId: isSet(object.poolId)
                ? BigInt(object.poolId.toString())
                : BigInt(0),
            maxAllowedSwapLossRate: isSet(object.maxAllowedSwapLossRate)
                ? String(object.maxAllowedSwapLossRate)
                : '',
            minSwapAmount: isSet(object.minSwapAmount)
                ? String(object.minSwapAmount)
                : '',
            maxSwapAmount: isSet(object.maxSwapAmount)
                ? String(object.maxSwapAmount)
                : '',
            minTransferAmount: isSet(object.minTransferAmount)
                ? String(object.minTransferAmount)
                : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.authority !== undefined && (obj.authority = message.authority);
        message.hostChainId !== undefined &&
            (obj.hostChainId = message.hostChainId);
        message.strideToRewardConnectionId !== undefined &&
            (obj.strideToRewardConnectionId = message.strideToRewardConnectionId);
        message.strideToTradeConnectionId !== undefined &&
            (obj.strideToTradeConnectionId = message.strideToTradeConnectionId);
        message.hostToRewardTransferChannelId !== undefined &&
            (obj.hostToRewardTransferChannelId =
                message.hostToRewardTransferChannelId);
        message.rewardToTradeTransferChannelId !== undefined &&
            (obj.rewardToTradeTransferChannelId =
                message.rewardToTradeTransferChannelId);
        message.tradeToHostTransferChannelId !== undefined &&
            (obj.tradeToHostTransferChannelId = message.tradeToHostTransferChannelId);
        message.rewardDenomOnHost !== undefined &&
            (obj.rewardDenomOnHost = message.rewardDenomOnHost);
        message.rewardDenomOnReward !== undefined &&
            (obj.rewardDenomOnReward = message.rewardDenomOnReward);
        message.rewardDenomOnTrade !== undefined &&
            (obj.rewardDenomOnTrade = message.rewardDenomOnTrade);
        message.hostDenomOnTrade !== undefined &&
            (obj.hostDenomOnTrade = message.hostDenomOnTrade);
        message.hostDenomOnHost !== undefined &&
            (obj.hostDenomOnHost = message.hostDenomOnHost);
        message.poolId !== undefined &&
            (obj.poolId = (message.poolId || BigInt(0)).toString());
        message.maxAllowedSwapLossRate !== undefined &&
            (obj.maxAllowedSwapLossRate = message.maxAllowedSwapLossRate);
        message.minSwapAmount !== undefined &&
            (obj.minSwapAmount = message.minSwapAmount);
        message.maxSwapAmount !== undefined &&
            (obj.maxSwapAmount = message.maxSwapAmount);
        message.minTransferAmount !== undefined &&
            (obj.minTransferAmount = message.minTransferAmount);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgCreateTradeRoute();
        message.authority = object.authority ?? '';
        message.hostChainId = object.hostChainId ?? '';
        message.strideToRewardConnectionId =
            object.strideToRewardConnectionId ?? '';
        message.strideToTradeConnectionId = object.strideToTradeConnectionId ?? '';
        message.hostToRewardTransferChannelId =
            object.hostToRewardTransferChannelId ?? '';
        message.rewardToTradeTransferChannelId =
            object.rewardToTradeTransferChannelId ?? '';
        message.tradeToHostTransferChannelId =
            object.tradeToHostTransferChannelId ?? '';
        message.rewardDenomOnHost = object.rewardDenomOnHost ?? '';
        message.rewardDenomOnReward = object.rewardDenomOnReward ?? '';
        message.rewardDenomOnTrade = object.rewardDenomOnTrade ?? '';
        message.hostDenomOnTrade = object.hostDenomOnTrade ?? '';
        message.hostDenomOnHost = object.hostDenomOnHost ?? '';
        message.poolId =
            object.poolId !== undefined && object.poolId !== null
                ? BigInt(object.poolId.toString())
                : BigInt(0);
        message.maxAllowedSwapLossRate = object.maxAllowedSwapLossRate ?? '';
        message.minSwapAmount = object.minSwapAmount ?? '';
        message.maxSwapAmount = object.maxSwapAmount ?? '';
        message.minTransferAmount = object.minTransferAmount ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return MsgCreateTradeRoute.decode(message.value);
    },
    toProto(message) {
        return MsgCreateTradeRoute.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakeibc.MsgCreateTradeRoute',
            value: MsgCreateTradeRoute.encode(message).finish(),
        };
    },
};
function createBaseMsgCreateTradeRouteResponse() {
    return {};
}
export const MsgCreateTradeRouteResponse = {
    typeUrl: '/stride.stakeibc.MsgCreateTradeRouteResponse',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgCreateTradeRouteResponse();
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
        const message = createBaseMsgCreateTradeRouteResponse();
        return message;
    },
    fromProtoMsg(message) {
        return MsgCreateTradeRouteResponse.decode(message.value);
    },
    toProto(message) {
        return MsgCreateTradeRouteResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakeibc.MsgCreateTradeRouteResponse',
            value: MsgCreateTradeRouteResponse.encode(message).finish(),
        };
    },
};
function createBaseMsgDeleteTradeRoute() {
    return {
        authority: '',
        rewardDenom: '',
        hostDenom: '',
    };
}
export const MsgDeleteTradeRoute = {
    typeUrl: '/stride.stakeibc.MsgDeleteTradeRoute',
    encode(message, writer = BinaryWriter.create()) {
        if (message.authority !== '') {
            writer.uint32(10).string(message.authority);
        }
        if (message.rewardDenom !== '') {
            writer.uint32(18).string(message.rewardDenom);
        }
        if (message.hostDenom !== '') {
            writer.uint32(26).string(message.hostDenom);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgDeleteTradeRoute();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.authority = reader.string();
                    break;
                case 2:
                    message.rewardDenom = reader.string();
                    break;
                case 3:
                    message.hostDenom = reader.string();
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
            authority: isSet(object.authority) ? String(object.authority) : '',
            rewardDenom: isSet(object.rewardDenom) ? String(object.rewardDenom) : '',
            hostDenom: isSet(object.hostDenom) ? String(object.hostDenom) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.authority !== undefined && (obj.authority = message.authority);
        message.rewardDenom !== undefined &&
            (obj.rewardDenom = message.rewardDenom);
        message.hostDenom !== undefined && (obj.hostDenom = message.hostDenom);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgDeleteTradeRoute();
        message.authority = object.authority ?? '';
        message.rewardDenom = object.rewardDenom ?? '';
        message.hostDenom = object.hostDenom ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return MsgDeleteTradeRoute.decode(message.value);
    },
    toProto(message) {
        return MsgDeleteTradeRoute.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakeibc.MsgDeleteTradeRoute',
            value: MsgDeleteTradeRoute.encode(message).finish(),
        };
    },
};
function createBaseMsgDeleteTradeRouteResponse() {
    return {};
}
export const MsgDeleteTradeRouteResponse = {
    typeUrl: '/stride.stakeibc.MsgDeleteTradeRouteResponse',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgDeleteTradeRouteResponse();
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
        const message = createBaseMsgDeleteTradeRouteResponse();
        return message;
    },
    fromProtoMsg(message) {
        return MsgDeleteTradeRouteResponse.decode(message.value);
    },
    toProto(message) {
        return MsgDeleteTradeRouteResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakeibc.MsgDeleteTradeRouteResponse',
            value: MsgDeleteTradeRouteResponse.encode(message).finish(),
        };
    },
};
function createBaseMsgUpdateTradeRoute() {
    return {
        authority: '',
        rewardDenom: '',
        hostDenom: '',
        poolId: BigInt(0),
        maxAllowedSwapLossRate: '',
        minSwapAmount: '',
        maxSwapAmount: '',
        minTransferAmount: '',
    };
}
export const MsgUpdateTradeRoute = {
    typeUrl: '/stride.stakeibc.MsgUpdateTradeRoute',
    encode(message, writer = BinaryWriter.create()) {
        if (message.authority !== '') {
            writer.uint32(10).string(message.authority);
        }
        if (message.rewardDenom !== '') {
            writer.uint32(18).string(message.rewardDenom);
        }
        if (message.hostDenom !== '') {
            writer.uint32(26).string(message.hostDenom);
        }
        if (message.poolId !== BigInt(0)) {
            writer.uint32(32).uint64(message.poolId);
        }
        if (message.maxAllowedSwapLossRate !== '') {
            writer.uint32(42).string(message.maxAllowedSwapLossRate);
        }
        if (message.minSwapAmount !== '') {
            writer.uint32(50).string(message.minSwapAmount);
        }
        if (message.maxSwapAmount !== '') {
            writer.uint32(58).string(message.maxSwapAmount);
        }
        if (message.minTransferAmount !== '') {
            writer.uint32(138).string(message.minTransferAmount);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgUpdateTradeRoute();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.authority = reader.string();
                    break;
                case 2:
                    message.rewardDenom = reader.string();
                    break;
                case 3:
                    message.hostDenom = reader.string();
                    break;
                case 4:
                    message.poolId = reader.uint64();
                    break;
                case 5:
                    message.maxAllowedSwapLossRate = reader.string();
                    break;
                case 6:
                    message.minSwapAmount = reader.string();
                    break;
                case 7:
                    message.maxSwapAmount = reader.string();
                    break;
                case 17:
                    message.minTransferAmount = reader.string();
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
            authority: isSet(object.authority) ? String(object.authority) : '',
            rewardDenom: isSet(object.rewardDenom) ? String(object.rewardDenom) : '',
            hostDenom: isSet(object.hostDenom) ? String(object.hostDenom) : '',
            poolId: isSet(object.poolId)
                ? BigInt(object.poolId.toString())
                : BigInt(0),
            maxAllowedSwapLossRate: isSet(object.maxAllowedSwapLossRate)
                ? String(object.maxAllowedSwapLossRate)
                : '',
            minSwapAmount: isSet(object.minSwapAmount)
                ? String(object.minSwapAmount)
                : '',
            maxSwapAmount: isSet(object.maxSwapAmount)
                ? String(object.maxSwapAmount)
                : '',
            minTransferAmount: isSet(object.minTransferAmount)
                ? String(object.minTransferAmount)
                : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.authority !== undefined && (obj.authority = message.authority);
        message.rewardDenom !== undefined &&
            (obj.rewardDenom = message.rewardDenom);
        message.hostDenom !== undefined && (obj.hostDenom = message.hostDenom);
        message.poolId !== undefined &&
            (obj.poolId = (message.poolId || BigInt(0)).toString());
        message.maxAllowedSwapLossRate !== undefined &&
            (obj.maxAllowedSwapLossRate = message.maxAllowedSwapLossRate);
        message.minSwapAmount !== undefined &&
            (obj.minSwapAmount = message.minSwapAmount);
        message.maxSwapAmount !== undefined &&
            (obj.maxSwapAmount = message.maxSwapAmount);
        message.minTransferAmount !== undefined &&
            (obj.minTransferAmount = message.minTransferAmount);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgUpdateTradeRoute();
        message.authority = object.authority ?? '';
        message.rewardDenom = object.rewardDenom ?? '';
        message.hostDenom = object.hostDenom ?? '';
        message.poolId =
            object.poolId !== undefined && object.poolId !== null
                ? BigInt(object.poolId.toString())
                : BigInt(0);
        message.maxAllowedSwapLossRate = object.maxAllowedSwapLossRate ?? '';
        message.minSwapAmount = object.minSwapAmount ?? '';
        message.maxSwapAmount = object.maxSwapAmount ?? '';
        message.minTransferAmount = object.minTransferAmount ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return MsgUpdateTradeRoute.decode(message.value);
    },
    toProto(message) {
        return MsgUpdateTradeRoute.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakeibc.MsgUpdateTradeRoute',
            value: MsgUpdateTradeRoute.encode(message).finish(),
        };
    },
};
function createBaseMsgUpdateTradeRouteResponse() {
    return {};
}
export const MsgUpdateTradeRouteResponse = {
    typeUrl: '/stride.stakeibc.MsgUpdateTradeRouteResponse',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgUpdateTradeRouteResponse();
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
        const message = createBaseMsgUpdateTradeRouteResponse();
        return message;
    },
    fromProtoMsg(message) {
        return MsgUpdateTradeRouteResponse.decode(message.value);
    },
    toProto(message) {
        return MsgUpdateTradeRouteResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakeibc.MsgUpdateTradeRouteResponse',
            value: MsgUpdateTradeRouteResponse.encode(message).finish(),
        };
    },
};
function createBaseMsgSetCommunityPoolRebate() {
    return {
        creator: '',
        chainId: '',
        rebateRate: '',
        liquidStakedStTokenAmount: '',
    };
}
export const MsgSetCommunityPoolRebate = {
    typeUrl: '/stride.stakeibc.MsgSetCommunityPoolRebate',
    encode(message, writer = BinaryWriter.create()) {
        if (message.creator !== '') {
            writer.uint32(10).string(message.creator);
        }
        if (message.chainId !== '') {
            writer.uint32(18).string(message.chainId);
        }
        if (message.rebateRate !== '') {
            writer
                .uint32(26)
                .string(Decimal.fromUserInput(message.rebateRate, 18).atomics);
        }
        if (message.liquidStakedStTokenAmount !== '') {
            writer.uint32(34).string(message.liquidStakedStTokenAmount);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgSetCommunityPoolRebate();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.creator = reader.string();
                    break;
                case 2:
                    message.chainId = reader.string();
                    break;
                case 3:
                    message.rebateRate = Decimal.fromAtomics(reader.string(), 18).toString();
                    break;
                case 4:
                    message.liquidStakedStTokenAmount = reader.string();
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
            creator: isSet(object.creator) ? String(object.creator) : '',
            chainId: isSet(object.chainId) ? String(object.chainId) : '',
            rebateRate: isSet(object.rebateRate) ? String(object.rebateRate) : '',
            liquidStakedStTokenAmount: isSet(object.liquidStakedStTokenAmount)
                ? String(object.liquidStakedStTokenAmount)
                : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.creator !== undefined && (obj.creator = message.creator);
        message.chainId !== undefined && (obj.chainId = message.chainId);
        message.rebateRate !== undefined && (obj.rebateRate = message.rebateRate);
        message.liquidStakedStTokenAmount !== undefined &&
            (obj.liquidStakedStTokenAmount = message.liquidStakedStTokenAmount);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgSetCommunityPoolRebate();
        message.creator = object.creator ?? '';
        message.chainId = object.chainId ?? '';
        message.rebateRate = object.rebateRate ?? '';
        message.liquidStakedStTokenAmount = object.liquidStakedStTokenAmount ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return MsgSetCommunityPoolRebate.decode(message.value);
    },
    toProto(message) {
        return MsgSetCommunityPoolRebate.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakeibc.MsgSetCommunityPoolRebate',
            value: MsgSetCommunityPoolRebate.encode(message).finish(),
        };
    },
};
function createBaseMsgSetCommunityPoolRebateResponse() {
    return {};
}
export const MsgSetCommunityPoolRebateResponse = {
    typeUrl: '/stride.stakeibc.MsgSetCommunityPoolRebateResponse',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgSetCommunityPoolRebateResponse();
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
        const message = createBaseMsgSetCommunityPoolRebateResponse();
        return message;
    },
    fromProtoMsg(message) {
        return MsgSetCommunityPoolRebateResponse.decode(message.value);
    },
    toProto(message) {
        return MsgSetCommunityPoolRebateResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakeibc.MsgSetCommunityPoolRebateResponse',
            value: MsgSetCommunityPoolRebateResponse.encode(message).finish(),
        };
    },
};
function createBaseMsgToggleTradeController() {
    return {
        creator: '',
        chainId: '',
        permissionChange: 0,
        address: '',
        legacy: false,
    };
}
export const MsgToggleTradeController = {
    typeUrl: '/stride.stakeibc.MsgToggleTradeController',
    encode(message, writer = BinaryWriter.create()) {
        if (message.creator !== '') {
            writer.uint32(10).string(message.creator);
        }
        if (message.chainId !== '') {
            writer.uint32(18).string(message.chainId);
        }
        if (message.permissionChange !== 0) {
            writer.uint32(24).int32(message.permissionChange);
        }
        if (message.address !== '') {
            writer.uint32(34).string(message.address);
        }
        if (message.legacy === true) {
            writer.uint32(40).bool(message.legacy);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgToggleTradeController();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.creator = reader.string();
                    break;
                case 2:
                    message.chainId = reader.string();
                    break;
                case 3:
                    message.permissionChange = reader.int32();
                    break;
                case 4:
                    message.address = reader.string();
                    break;
                case 5:
                    message.legacy = reader.bool();
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
            creator: isSet(object.creator) ? String(object.creator) : '',
            chainId: isSet(object.chainId) ? String(object.chainId) : '',
            permissionChange: isSet(object.permissionChange)
                ? authzPermissionChangeFromJSON(object.permissionChange)
                : -1,
            address: isSet(object.address) ? String(object.address) : '',
            legacy: isSet(object.legacy) ? Boolean(object.legacy) : false,
        };
    },
    toJSON(message) {
        const obj = {};
        message.creator !== undefined && (obj.creator = message.creator);
        message.chainId !== undefined && (obj.chainId = message.chainId);
        message.permissionChange !== undefined &&
            (obj.permissionChange = authzPermissionChangeToJSON(message.permissionChange));
        message.address !== undefined && (obj.address = message.address);
        message.legacy !== undefined && (obj.legacy = message.legacy);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgToggleTradeController();
        message.creator = object.creator ?? '';
        message.chainId = object.chainId ?? '';
        message.permissionChange = object.permissionChange ?? 0;
        message.address = object.address ?? '';
        message.legacy = object.legacy ?? false;
        return message;
    },
    fromProtoMsg(message) {
        return MsgToggleTradeController.decode(message.value);
    },
    toProto(message) {
        return MsgToggleTradeController.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakeibc.MsgToggleTradeController',
            value: MsgToggleTradeController.encode(message).finish(),
        };
    },
};
function createBaseMsgToggleTradeControllerResponse() {
    return {};
}
export const MsgToggleTradeControllerResponse = {
    typeUrl: '/stride.stakeibc.MsgToggleTradeControllerResponse',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgToggleTradeControllerResponse();
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
        const message = createBaseMsgToggleTradeControllerResponse();
        return message;
    },
    fromProtoMsg(message) {
        return MsgToggleTradeControllerResponse.decode(message.value);
    },
    toProto(message) {
        return MsgToggleTradeControllerResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakeibc.MsgToggleTradeControllerResponse',
            value: MsgToggleTradeControllerResponse.encode(message).finish(),
        };
    },
};
function createBaseMsgUpdateHostZoneParams() {
    return {
        authority: '',
        chainId: '',
        maxMessagesPerIcaTx: BigInt(0),
    };
}
export const MsgUpdateHostZoneParams = {
    typeUrl: '/stride.stakeibc.MsgUpdateHostZoneParams',
    encode(message, writer = BinaryWriter.create()) {
        if (message.authority !== '') {
            writer.uint32(10).string(message.authority);
        }
        if (message.chainId !== '') {
            writer.uint32(18).string(message.chainId);
        }
        if (message.maxMessagesPerIcaTx !== BigInt(0)) {
            writer.uint32(24).uint64(message.maxMessagesPerIcaTx);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgUpdateHostZoneParams();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.authority = reader.string();
                    break;
                case 2:
                    message.chainId = reader.string();
                    break;
                case 3:
                    message.maxMessagesPerIcaTx = reader.uint64();
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
            authority: isSet(object.authority) ? String(object.authority) : '',
            chainId: isSet(object.chainId) ? String(object.chainId) : '',
            maxMessagesPerIcaTx: isSet(object.maxMessagesPerIcaTx)
                ? BigInt(object.maxMessagesPerIcaTx.toString())
                : BigInt(0),
        };
    },
    toJSON(message) {
        const obj = {};
        message.authority !== undefined && (obj.authority = message.authority);
        message.chainId !== undefined && (obj.chainId = message.chainId);
        message.maxMessagesPerIcaTx !== undefined &&
            (obj.maxMessagesPerIcaTx = (message.maxMessagesPerIcaTx || BigInt(0)).toString());
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgUpdateHostZoneParams();
        message.authority = object.authority ?? '';
        message.chainId = object.chainId ?? '';
        message.maxMessagesPerIcaTx =
            object.maxMessagesPerIcaTx !== undefined &&
                object.maxMessagesPerIcaTx !== null
                ? BigInt(object.maxMessagesPerIcaTx.toString())
                : BigInt(0);
        return message;
    },
    fromProtoMsg(message) {
        return MsgUpdateHostZoneParams.decode(message.value);
    },
    toProto(message) {
        return MsgUpdateHostZoneParams.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakeibc.MsgUpdateHostZoneParams',
            value: MsgUpdateHostZoneParams.encode(message).finish(),
        };
    },
};
function createBaseMsgUpdateHostZoneParamsResponse() {
    return {};
}
export const MsgUpdateHostZoneParamsResponse = {
    typeUrl: '/stride.stakeibc.MsgUpdateHostZoneParamsResponse',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgUpdateHostZoneParamsResponse();
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
        const message = createBaseMsgUpdateHostZoneParamsResponse();
        return message;
    },
    fromProtoMsg(message) {
        return MsgUpdateHostZoneParamsResponse.decode(message.value);
    },
    toProto(message) {
        return MsgUpdateHostZoneParamsResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakeibc.MsgUpdateHostZoneParamsResponse',
            value: MsgUpdateHostZoneParamsResponse.encode(message).finish(),
        };
    },
};
//# sourceMappingURL=tx.js.map