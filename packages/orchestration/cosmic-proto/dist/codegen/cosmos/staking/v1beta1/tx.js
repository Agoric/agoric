//@ts-nocheck
import { Description, CommissionRates, } from './staking.js';
import { Any } from '../../../google/protobuf/any.js';
import { Coin } from '../../base/v1beta1/coin.js';
import { Timestamp, } from '../../../google/protobuf/timestamp.js';
import { BinaryReader, BinaryWriter } from '../../../binary.js';
import { isSet, Decimal, fromJsonTimestamp, fromTimestamp, } from '../../../helpers.js';
import {} from '../../../json-safe.js';
function createBaseMsgCreateValidator() {
    return {
        description: Description.fromPartial({}),
        commission: CommissionRates.fromPartial({}),
        minSelfDelegation: '',
        delegatorAddress: '',
        validatorAddress: '',
        pubkey: undefined,
        value: Coin.fromPartial({}),
    };
}
export const MsgCreateValidator = {
    typeUrl: '/cosmos.staking.v1beta1.MsgCreateValidator',
    encode(message, writer = BinaryWriter.create()) {
        if (message.description !== undefined) {
            Description.encode(message.description, writer.uint32(10).fork()).ldelim();
        }
        if (message.commission !== undefined) {
            CommissionRates.encode(message.commission, writer.uint32(18).fork()).ldelim();
        }
        if (message.minSelfDelegation !== '') {
            writer.uint32(26).string(message.minSelfDelegation);
        }
        if (message.delegatorAddress !== '') {
            writer.uint32(34).string(message.delegatorAddress);
        }
        if (message.validatorAddress !== '') {
            writer.uint32(42).string(message.validatorAddress);
        }
        if (message.pubkey !== undefined) {
            Any.encode(message.pubkey, writer.uint32(50).fork()).ldelim();
        }
        if (message.value !== undefined) {
            Coin.encode(message.value, writer.uint32(58).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgCreateValidator();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.description = Description.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.commission = CommissionRates.decode(reader, reader.uint32());
                    break;
                case 3:
                    message.minSelfDelegation = reader.string();
                    break;
                case 4:
                    message.delegatorAddress = reader.string();
                    break;
                case 5:
                    message.validatorAddress = reader.string();
                    break;
                case 6:
                    message.pubkey = Cosmos_cryptoPubKey_InterfaceDecoder(reader);
                    break;
                case 7:
                    message.value = Coin.decode(reader, reader.uint32());
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
            description: isSet(object.description)
                ? Description.fromJSON(object.description)
                : undefined,
            commission: isSet(object.commission)
                ? CommissionRates.fromJSON(object.commission)
                : undefined,
            minSelfDelegation: isSet(object.minSelfDelegation)
                ? String(object.minSelfDelegation)
                : '',
            delegatorAddress: isSet(object.delegatorAddress)
                ? String(object.delegatorAddress)
                : '',
            validatorAddress: isSet(object.validatorAddress)
                ? String(object.validatorAddress)
                : '',
            pubkey: isSet(object.pubkey) ? Any.fromJSON(object.pubkey) : undefined,
            value: isSet(object.value) ? Coin.fromJSON(object.value) : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.description !== undefined &&
            (obj.description = message.description
                ? Description.toJSON(message.description)
                : undefined);
        message.commission !== undefined &&
            (obj.commission = message.commission
                ? CommissionRates.toJSON(message.commission)
                : undefined);
        message.minSelfDelegation !== undefined &&
            (obj.minSelfDelegation = message.minSelfDelegation);
        message.delegatorAddress !== undefined &&
            (obj.delegatorAddress = message.delegatorAddress);
        message.validatorAddress !== undefined &&
            (obj.validatorAddress = message.validatorAddress);
        message.pubkey !== undefined &&
            (obj.pubkey = message.pubkey ? Any.toJSON(message.pubkey) : undefined);
        message.value !== undefined &&
            (obj.value = message.value ? Coin.toJSON(message.value) : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgCreateValidator();
        message.description =
            object.description !== undefined && object.description !== null
                ? Description.fromPartial(object.description)
                : undefined;
        message.commission =
            object.commission !== undefined && object.commission !== null
                ? CommissionRates.fromPartial(object.commission)
                : undefined;
        message.minSelfDelegation = object.minSelfDelegation ?? '';
        message.delegatorAddress = object.delegatorAddress ?? '';
        message.validatorAddress = object.validatorAddress ?? '';
        message.pubkey =
            object.pubkey !== undefined && object.pubkey !== null
                ? Any.fromPartial(object.pubkey)
                : undefined;
        message.value =
            object.value !== undefined && object.value !== null
                ? Coin.fromPartial(object.value)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return MsgCreateValidator.decode(message.value);
    },
    toProto(message) {
        return MsgCreateValidator.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.staking.v1beta1.MsgCreateValidator',
            value: MsgCreateValidator.encode(message).finish(),
        };
    },
};
function createBaseMsgCreateValidatorResponse() {
    return {};
}
export const MsgCreateValidatorResponse = {
    typeUrl: '/cosmos.staking.v1beta1.MsgCreateValidatorResponse',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgCreateValidatorResponse();
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
        const message = createBaseMsgCreateValidatorResponse();
        return message;
    },
    fromProtoMsg(message) {
        return MsgCreateValidatorResponse.decode(message.value);
    },
    toProto(message) {
        return MsgCreateValidatorResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.staking.v1beta1.MsgCreateValidatorResponse',
            value: MsgCreateValidatorResponse.encode(message).finish(),
        };
    },
};
function createBaseMsgEditValidator() {
    return {
        description: Description.fromPartial({}),
        validatorAddress: '',
        commissionRate: '',
        minSelfDelegation: '',
    };
}
export const MsgEditValidator = {
    typeUrl: '/cosmos.staking.v1beta1.MsgEditValidator',
    encode(message, writer = BinaryWriter.create()) {
        if (message.description !== undefined) {
            Description.encode(message.description, writer.uint32(10).fork()).ldelim();
        }
        if (message.validatorAddress !== '') {
            writer.uint32(18).string(message.validatorAddress);
        }
        if (message.commissionRate !== '') {
            writer
                .uint32(26)
                .string(Decimal.fromUserInput(message.commissionRate, 18).atomics);
        }
        if (message.minSelfDelegation !== '') {
            writer.uint32(34).string(message.minSelfDelegation);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgEditValidator();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.description = Description.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.validatorAddress = reader.string();
                    break;
                case 3:
                    message.commissionRate = Decimal.fromAtomics(reader.string(), 18).toString();
                    break;
                case 4:
                    message.minSelfDelegation = reader.string();
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
            description: isSet(object.description)
                ? Description.fromJSON(object.description)
                : undefined,
            validatorAddress: isSet(object.validatorAddress)
                ? String(object.validatorAddress)
                : '',
            commissionRate: isSet(object.commissionRate)
                ? String(object.commissionRate)
                : '',
            minSelfDelegation: isSet(object.minSelfDelegation)
                ? String(object.minSelfDelegation)
                : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.description !== undefined &&
            (obj.description = message.description
                ? Description.toJSON(message.description)
                : undefined);
        message.validatorAddress !== undefined &&
            (obj.validatorAddress = message.validatorAddress);
        message.commissionRate !== undefined &&
            (obj.commissionRate = message.commissionRate);
        message.minSelfDelegation !== undefined &&
            (obj.minSelfDelegation = message.minSelfDelegation);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgEditValidator();
        message.description =
            object.description !== undefined && object.description !== null
                ? Description.fromPartial(object.description)
                : undefined;
        message.validatorAddress = object.validatorAddress ?? '';
        message.commissionRate = object.commissionRate ?? '';
        message.minSelfDelegation = object.minSelfDelegation ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return MsgEditValidator.decode(message.value);
    },
    toProto(message) {
        return MsgEditValidator.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.staking.v1beta1.MsgEditValidator',
            value: MsgEditValidator.encode(message).finish(),
        };
    },
};
function createBaseMsgEditValidatorResponse() {
    return {};
}
export const MsgEditValidatorResponse = {
    typeUrl: '/cosmos.staking.v1beta1.MsgEditValidatorResponse',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgEditValidatorResponse();
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
        const message = createBaseMsgEditValidatorResponse();
        return message;
    },
    fromProtoMsg(message) {
        return MsgEditValidatorResponse.decode(message.value);
    },
    toProto(message) {
        return MsgEditValidatorResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.staking.v1beta1.MsgEditValidatorResponse',
            value: MsgEditValidatorResponse.encode(message).finish(),
        };
    },
};
function createBaseMsgDelegate() {
    return {
        delegatorAddress: '',
        validatorAddress: '',
        amount: Coin.fromPartial({}),
    };
}
export const MsgDelegate = {
    typeUrl: '/cosmos.staking.v1beta1.MsgDelegate',
    encode(message, writer = BinaryWriter.create()) {
        if (message.delegatorAddress !== '') {
            writer.uint32(10).string(message.delegatorAddress);
        }
        if (message.validatorAddress !== '') {
            writer.uint32(18).string(message.validatorAddress);
        }
        if (message.amount !== undefined) {
            Coin.encode(message.amount, writer.uint32(26).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgDelegate();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.delegatorAddress = reader.string();
                    break;
                case 2:
                    message.validatorAddress = reader.string();
                    break;
                case 3:
                    message.amount = Coin.decode(reader, reader.uint32());
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
            delegatorAddress: isSet(object.delegatorAddress)
                ? String(object.delegatorAddress)
                : '',
            validatorAddress: isSet(object.validatorAddress)
                ? String(object.validatorAddress)
                : '',
            amount: isSet(object.amount) ? Coin.fromJSON(object.amount) : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.delegatorAddress !== undefined &&
            (obj.delegatorAddress = message.delegatorAddress);
        message.validatorAddress !== undefined &&
            (obj.validatorAddress = message.validatorAddress);
        message.amount !== undefined &&
            (obj.amount = message.amount ? Coin.toJSON(message.amount) : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgDelegate();
        message.delegatorAddress = object.delegatorAddress ?? '';
        message.validatorAddress = object.validatorAddress ?? '';
        message.amount =
            object.amount !== undefined && object.amount !== null
                ? Coin.fromPartial(object.amount)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return MsgDelegate.decode(message.value);
    },
    toProto(message) {
        return MsgDelegate.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.staking.v1beta1.MsgDelegate',
            value: MsgDelegate.encode(message).finish(),
        };
    },
};
function createBaseMsgDelegateResponse() {
    return {};
}
export const MsgDelegateResponse = {
    typeUrl: '/cosmos.staking.v1beta1.MsgDelegateResponse',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgDelegateResponse();
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
        const message = createBaseMsgDelegateResponse();
        return message;
    },
    fromProtoMsg(message) {
        return MsgDelegateResponse.decode(message.value);
    },
    toProto(message) {
        return MsgDelegateResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.staking.v1beta1.MsgDelegateResponse',
            value: MsgDelegateResponse.encode(message).finish(),
        };
    },
};
function createBaseMsgBeginRedelegate() {
    return {
        delegatorAddress: '',
        validatorSrcAddress: '',
        validatorDstAddress: '',
        amount: Coin.fromPartial({}),
    };
}
export const MsgBeginRedelegate = {
    typeUrl: '/cosmos.staking.v1beta1.MsgBeginRedelegate',
    encode(message, writer = BinaryWriter.create()) {
        if (message.delegatorAddress !== '') {
            writer.uint32(10).string(message.delegatorAddress);
        }
        if (message.validatorSrcAddress !== '') {
            writer.uint32(18).string(message.validatorSrcAddress);
        }
        if (message.validatorDstAddress !== '') {
            writer.uint32(26).string(message.validatorDstAddress);
        }
        if (message.amount !== undefined) {
            Coin.encode(message.amount, writer.uint32(34).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgBeginRedelegate();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.delegatorAddress = reader.string();
                    break;
                case 2:
                    message.validatorSrcAddress = reader.string();
                    break;
                case 3:
                    message.validatorDstAddress = reader.string();
                    break;
                case 4:
                    message.amount = Coin.decode(reader, reader.uint32());
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
            delegatorAddress: isSet(object.delegatorAddress)
                ? String(object.delegatorAddress)
                : '',
            validatorSrcAddress: isSet(object.validatorSrcAddress)
                ? String(object.validatorSrcAddress)
                : '',
            validatorDstAddress: isSet(object.validatorDstAddress)
                ? String(object.validatorDstAddress)
                : '',
            amount: isSet(object.amount) ? Coin.fromJSON(object.amount) : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.delegatorAddress !== undefined &&
            (obj.delegatorAddress = message.delegatorAddress);
        message.validatorSrcAddress !== undefined &&
            (obj.validatorSrcAddress = message.validatorSrcAddress);
        message.validatorDstAddress !== undefined &&
            (obj.validatorDstAddress = message.validatorDstAddress);
        message.amount !== undefined &&
            (obj.amount = message.amount ? Coin.toJSON(message.amount) : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgBeginRedelegate();
        message.delegatorAddress = object.delegatorAddress ?? '';
        message.validatorSrcAddress = object.validatorSrcAddress ?? '';
        message.validatorDstAddress = object.validatorDstAddress ?? '';
        message.amount =
            object.amount !== undefined && object.amount !== null
                ? Coin.fromPartial(object.amount)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return MsgBeginRedelegate.decode(message.value);
    },
    toProto(message) {
        return MsgBeginRedelegate.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.staking.v1beta1.MsgBeginRedelegate',
            value: MsgBeginRedelegate.encode(message).finish(),
        };
    },
};
function createBaseMsgBeginRedelegateResponse() {
    return {
        completionTime: Timestamp.fromPartial({}),
    };
}
export const MsgBeginRedelegateResponse = {
    typeUrl: '/cosmos.staking.v1beta1.MsgBeginRedelegateResponse',
    encode(message, writer = BinaryWriter.create()) {
        if (message.completionTime !== undefined) {
            Timestamp.encode(message.completionTime, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgBeginRedelegateResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.completionTime = Timestamp.decode(reader, reader.uint32());
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
            completionTime: isSet(object.completionTime)
                ? fromJsonTimestamp(object.completionTime)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.completionTime !== undefined &&
            (obj.completionTime = fromTimestamp(message.completionTime).toISOString());
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgBeginRedelegateResponse();
        message.completionTime =
            object.completionTime !== undefined && object.completionTime !== null
                ? Timestamp.fromPartial(object.completionTime)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return MsgBeginRedelegateResponse.decode(message.value);
    },
    toProto(message) {
        return MsgBeginRedelegateResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.staking.v1beta1.MsgBeginRedelegateResponse',
            value: MsgBeginRedelegateResponse.encode(message).finish(),
        };
    },
};
function createBaseMsgUndelegate() {
    return {
        delegatorAddress: '',
        validatorAddress: '',
        amount: Coin.fromPartial({}),
    };
}
export const MsgUndelegate = {
    typeUrl: '/cosmos.staking.v1beta1.MsgUndelegate',
    encode(message, writer = BinaryWriter.create()) {
        if (message.delegatorAddress !== '') {
            writer.uint32(10).string(message.delegatorAddress);
        }
        if (message.validatorAddress !== '') {
            writer.uint32(18).string(message.validatorAddress);
        }
        if (message.amount !== undefined) {
            Coin.encode(message.amount, writer.uint32(26).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgUndelegate();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.delegatorAddress = reader.string();
                    break;
                case 2:
                    message.validatorAddress = reader.string();
                    break;
                case 3:
                    message.amount = Coin.decode(reader, reader.uint32());
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
            delegatorAddress: isSet(object.delegatorAddress)
                ? String(object.delegatorAddress)
                : '',
            validatorAddress: isSet(object.validatorAddress)
                ? String(object.validatorAddress)
                : '',
            amount: isSet(object.amount) ? Coin.fromJSON(object.amount) : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.delegatorAddress !== undefined &&
            (obj.delegatorAddress = message.delegatorAddress);
        message.validatorAddress !== undefined &&
            (obj.validatorAddress = message.validatorAddress);
        message.amount !== undefined &&
            (obj.amount = message.amount ? Coin.toJSON(message.amount) : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgUndelegate();
        message.delegatorAddress = object.delegatorAddress ?? '';
        message.validatorAddress = object.validatorAddress ?? '';
        message.amount =
            object.amount !== undefined && object.amount !== null
                ? Coin.fromPartial(object.amount)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return MsgUndelegate.decode(message.value);
    },
    toProto(message) {
        return MsgUndelegate.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.staking.v1beta1.MsgUndelegate',
            value: MsgUndelegate.encode(message).finish(),
        };
    },
};
function createBaseMsgUndelegateResponse() {
    return {
        completionTime: Timestamp.fromPartial({}),
    };
}
export const MsgUndelegateResponse = {
    typeUrl: '/cosmos.staking.v1beta1.MsgUndelegateResponse',
    encode(message, writer = BinaryWriter.create()) {
        if (message.completionTime !== undefined) {
            Timestamp.encode(message.completionTime, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgUndelegateResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.completionTime = Timestamp.decode(reader, reader.uint32());
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
            completionTime: isSet(object.completionTime)
                ? fromJsonTimestamp(object.completionTime)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.completionTime !== undefined &&
            (obj.completionTime = fromTimestamp(message.completionTime).toISOString());
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgUndelegateResponse();
        message.completionTime =
            object.completionTime !== undefined && object.completionTime !== null
                ? Timestamp.fromPartial(object.completionTime)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return MsgUndelegateResponse.decode(message.value);
    },
    toProto(message) {
        return MsgUndelegateResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.staking.v1beta1.MsgUndelegateResponse',
            value: MsgUndelegateResponse.encode(message).finish(),
        };
    },
};
function createBaseMsgCancelUnbondingDelegation() {
    return {
        delegatorAddress: '',
        validatorAddress: '',
        amount: Coin.fromPartial({}),
        creationHeight: BigInt(0),
    };
}
export const MsgCancelUnbondingDelegation = {
    typeUrl: '/cosmos.staking.v1beta1.MsgCancelUnbondingDelegation',
    encode(message, writer = BinaryWriter.create()) {
        if (message.delegatorAddress !== '') {
            writer.uint32(10).string(message.delegatorAddress);
        }
        if (message.validatorAddress !== '') {
            writer.uint32(18).string(message.validatorAddress);
        }
        if (message.amount !== undefined) {
            Coin.encode(message.amount, writer.uint32(26).fork()).ldelim();
        }
        if (message.creationHeight !== BigInt(0)) {
            writer.uint32(32).int64(message.creationHeight);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgCancelUnbondingDelegation();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.delegatorAddress = reader.string();
                    break;
                case 2:
                    message.validatorAddress = reader.string();
                    break;
                case 3:
                    message.amount = Coin.decode(reader, reader.uint32());
                    break;
                case 4:
                    message.creationHeight = reader.int64();
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
            delegatorAddress: isSet(object.delegatorAddress)
                ? String(object.delegatorAddress)
                : '',
            validatorAddress: isSet(object.validatorAddress)
                ? String(object.validatorAddress)
                : '',
            amount: isSet(object.amount) ? Coin.fromJSON(object.amount) : undefined,
            creationHeight: isSet(object.creationHeight)
                ? BigInt(object.creationHeight.toString())
                : BigInt(0),
        };
    },
    toJSON(message) {
        const obj = {};
        message.delegatorAddress !== undefined &&
            (obj.delegatorAddress = message.delegatorAddress);
        message.validatorAddress !== undefined &&
            (obj.validatorAddress = message.validatorAddress);
        message.amount !== undefined &&
            (obj.amount = message.amount ? Coin.toJSON(message.amount) : undefined);
        message.creationHeight !== undefined &&
            (obj.creationHeight = (message.creationHeight || BigInt(0)).toString());
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgCancelUnbondingDelegation();
        message.delegatorAddress = object.delegatorAddress ?? '';
        message.validatorAddress = object.validatorAddress ?? '';
        message.amount =
            object.amount !== undefined && object.amount !== null
                ? Coin.fromPartial(object.amount)
                : undefined;
        message.creationHeight =
            object.creationHeight !== undefined && object.creationHeight !== null
                ? BigInt(object.creationHeight.toString())
                : BigInt(0);
        return message;
    },
    fromProtoMsg(message) {
        return MsgCancelUnbondingDelegation.decode(message.value);
    },
    toProto(message) {
        return MsgCancelUnbondingDelegation.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.staking.v1beta1.MsgCancelUnbondingDelegation',
            value: MsgCancelUnbondingDelegation.encode(message).finish(),
        };
    },
};
function createBaseMsgCancelUnbondingDelegationResponse() {
    return {};
}
export const MsgCancelUnbondingDelegationResponse = {
    typeUrl: '/cosmos.staking.v1beta1.MsgCancelUnbondingDelegationResponse',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgCancelUnbondingDelegationResponse();
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
        const message = createBaseMsgCancelUnbondingDelegationResponse();
        return message;
    },
    fromProtoMsg(message) {
        return MsgCancelUnbondingDelegationResponse.decode(message.value);
    },
    toProto(message) {
        return MsgCancelUnbondingDelegationResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.staking.v1beta1.MsgCancelUnbondingDelegationResponse',
            value: MsgCancelUnbondingDelegationResponse.encode(message).finish(),
        };
    },
};
export const Cosmos_cryptoPubKey_InterfaceDecoder = (input) => {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const data = Any.decode(reader, reader.uint32());
    switch (data.typeUrl) {
        default:
            return data;
    }
};
//# sourceMappingURL=tx.js.map