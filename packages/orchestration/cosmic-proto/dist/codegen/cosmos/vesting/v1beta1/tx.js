//@ts-nocheck
import { Coin } from '../../base/v1beta1/coin.js';
import { Period } from './vesting.js';
import { BinaryReader, BinaryWriter } from '../../../binary.js';
import { isSet } from '../../../helpers.js';
import {} from '../../../json-safe.js';
function createBaseMsgCreateVestingAccount() {
    return {
        fromAddress: '',
        toAddress: '',
        amount: [],
        endTime: BigInt(0),
        delayed: false,
    };
}
export const MsgCreateVestingAccount = {
    typeUrl: '/cosmos.vesting.v1beta1.MsgCreateVestingAccount',
    encode(message, writer = BinaryWriter.create()) {
        if (message.fromAddress !== '') {
            writer.uint32(10).string(message.fromAddress);
        }
        if (message.toAddress !== '') {
            writer.uint32(18).string(message.toAddress);
        }
        for (const v of message.amount) {
            Coin.encode(v, writer.uint32(26).fork()).ldelim();
        }
        if (message.endTime !== BigInt(0)) {
            writer.uint32(32).int64(message.endTime);
        }
        if (message.delayed === true) {
            writer.uint32(40).bool(message.delayed);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgCreateVestingAccount();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.fromAddress = reader.string();
                    break;
                case 2:
                    message.toAddress = reader.string();
                    break;
                case 3:
                    message.amount.push(Coin.decode(reader, reader.uint32()));
                    break;
                case 4:
                    message.endTime = reader.int64();
                    break;
                case 5:
                    message.delayed = reader.bool();
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
            fromAddress: isSet(object.fromAddress) ? String(object.fromAddress) : '',
            toAddress: isSet(object.toAddress) ? String(object.toAddress) : '',
            amount: Array.isArray(object?.amount)
                ? object.amount.map((e) => Coin.fromJSON(e))
                : [],
            endTime: isSet(object.endTime)
                ? BigInt(object.endTime.toString())
                : BigInt(0),
            delayed: isSet(object.delayed) ? Boolean(object.delayed) : false,
        };
    },
    toJSON(message) {
        const obj = {};
        message.fromAddress !== undefined &&
            (obj.fromAddress = message.fromAddress);
        message.toAddress !== undefined && (obj.toAddress = message.toAddress);
        if (message.amount) {
            obj.amount = message.amount.map(e => (e ? Coin.toJSON(e) : undefined));
        }
        else {
            obj.amount = [];
        }
        message.endTime !== undefined &&
            (obj.endTime = (message.endTime || BigInt(0)).toString());
        message.delayed !== undefined && (obj.delayed = message.delayed);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgCreateVestingAccount();
        message.fromAddress = object.fromAddress ?? '';
        message.toAddress = object.toAddress ?? '';
        message.amount = object.amount?.map(e => Coin.fromPartial(e)) || [];
        message.endTime =
            object.endTime !== undefined && object.endTime !== null
                ? BigInt(object.endTime.toString())
                : BigInt(0);
        message.delayed = object.delayed ?? false;
        return message;
    },
    fromProtoMsg(message) {
        return MsgCreateVestingAccount.decode(message.value);
    },
    toProto(message) {
        return MsgCreateVestingAccount.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.vesting.v1beta1.MsgCreateVestingAccount',
            value: MsgCreateVestingAccount.encode(message).finish(),
        };
    },
};
function createBaseMsgCreateVestingAccountResponse() {
    return {};
}
export const MsgCreateVestingAccountResponse = {
    typeUrl: '/cosmos.vesting.v1beta1.MsgCreateVestingAccountResponse',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgCreateVestingAccountResponse();
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
        const message = createBaseMsgCreateVestingAccountResponse();
        return message;
    },
    fromProtoMsg(message) {
        return MsgCreateVestingAccountResponse.decode(message.value);
    },
    toProto(message) {
        return MsgCreateVestingAccountResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.vesting.v1beta1.MsgCreateVestingAccountResponse',
            value: MsgCreateVestingAccountResponse.encode(message).finish(),
        };
    },
};
function createBaseMsgCreatePermanentLockedAccount() {
    return {
        fromAddress: '',
        toAddress: '',
        amount: [],
    };
}
export const MsgCreatePermanentLockedAccount = {
    typeUrl: '/cosmos.vesting.v1beta1.MsgCreatePermanentLockedAccount',
    encode(message, writer = BinaryWriter.create()) {
        if (message.fromAddress !== '') {
            writer.uint32(10).string(message.fromAddress);
        }
        if (message.toAddress !== '') {
            writer.uint32(18).string(message.toAddress);
        }
        for (const v of message.amount) {
            Coin.encode(v, writer.uint32(26).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgCreatePermanentLockedAccount();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.fromAddress = reader.string();
                    break;
                case 2:
                    message.toAddress = reader.string();
                    break;
                case 3:
                    message.amount.push(Coin.decode(reader, reader.uint32()));
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
            fromAddress: isSet(object.fromAddress) ? String(object.fromAddress) : '',
            toAddress: isSet(object.toAddress) ? String(object.toAddress) : '',
            amount: Array.isArray(object?.amount)
                ? object.amount.map((e) => Coin.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        message.fromAddress !== undefined &&
            (obj.fromAddress = message.fromAddress);
        message.toAddress !== undefined && (obj.toAddress = message.toAddress);
        if (message.amount) {
            obj.amount = message.amount.map(e => (e ? Coin.toJSON(e) : undefined));
        }
        else {
            obj.amount = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgCreatePermanentLockedAccount();
        message.fromAddress = object.fromAddress ?? '';
        message.toAddress = object.toAddress ?? '';
        message.amount = object.amount?.map(e => Coin.fromPartial(e)) || [];
        return message;
    },
    fromProtoMsg(message) {
        return MsgCreatePermanentLockedAccount.decode(message.value);
    },
    toProto(message) {
        return MsgCreatePermanentLockedAccount.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.vesting.v1beta1.MsgCreatePermanentLockedAccount',
            value: MsgCreatePermanentLockedAccount.encode(message).finish(),
        };
    },
};
function createBaseMsgCreatePermanentLockedAccountResponse() {
    return {};
}
export const MsgCreatePermanentLockedAccountResponse = {
    typeUrl: '/cosmos.vesting.v1beta1.MsgCreatePermanentLockedAccountResponse',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgCreatePermanentLockedAccountResponse();
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
        const message = createBaseMsgCreatePermanentLockedAccountResponse();
        return message;
    },
    fromProtoMsg(message) {
        return MsgCreatePermanentLockedAccountResponse.decode(message.value);
    },
    toProto(message) {
        return MsgCreatePermanentLockedAccountResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.vesting.v1beta1.MsgCreatePermanentLockedAccountResponse',
            value: MsgCreatePermanentLockedAccountResponse.encode(message).finish(),
        };
    },
};
function createBaseMsgCreatePeriodicVestingAccount() {
    return {
        fromAddress: '',
        toAddress: '',
        startTime: BigInt(0),
        vestingPeriods: [],
        merge: false,
    };
}
export const MsgCreatePeriodicVestingAccount = {
    typeUrl: '/cosmos.vesting.v1beta1.MsgCreatePeriodicVestingAccount',
    encode(message, writer = BinaryWriter.create()) {
        if (message.fromAddress !== '') {
            writer.uint32(10).string(message.fromAddress);
        }
        if (message.toAddress !== '') {
            writer.uint32(18).string(message.toAddress);
        }
        if (message.startTime !== BigInt(0)) {
            writer.uint32(24).int64(message.startTime);
        }
        for (const v of message.vestingPeriods) {
            Period.encode(v, writer.uint32(34).fork()).ldelim();
        }
        if (message.merge === true) {
            writer.uint32(40).bool(message.merge);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgCreatePeriodicVestingAccount();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.fromAddress = reader.string();
                    break;
                case 2:
                    message.toAddress = reader.string();
                    break;
                case 3:
                    message.startTime = reader.int64();
                    break;
                case 4:
                    message.vestingPeriods.push(Period.decode(reader, reader.uint32()));
                    break;
                case 5:
                    message.merge = reader.bool();
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
            fromAddress: isSet(object.fromAddress) ? String(object.fromAddress) : '',
            toAddress: isSet(object.toAddress) ? String(object.toAddress) : '',
            startTime: isSet(object.startTime)
                ? BigInt(object.startTime.toString())
                : BigInt(0),
            vestingPeriods: Array.isArray(object?.vestingPeriods)
                ? object.vestingPeriods.map((e) => Period.fromJSON(e))
                : [],
            merge: isSet(object.merge) ? Boolean(object.merge) : false,
        };
    },
    toJSON(message) {
        const obj = {};
        message.fromAddress !== undefined &&
            (obj.fromAddress = message.fromAddress);
        message.toAddress !== undefined && (obj.toAddress = message.toAddress);
        message.startTime !== undefined &&
            (obj.startTime = (message.startTime || BigInt(0)).toString());
        if (message.vestingPeriods) {
            obj.vestingPeriods = message.vestingPeriods.map(e => e ? Period.toJSON(e) : undefined);
        }
        else {
            obj.vestingPeriods = [];
        }
        message.merge !== undefined && (obj.merge = message.merge);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgCreatePeriodicVestingAccount();
        message.fromAddress = object.fromAddress ?? '';
        message.toAddress = object.toAddress ?? '';
        message.startTime =
            object.startTime !== undefined && object.startTime !== null
                ? BigInt(object.startTime.toString())
                : BigInt(0);
        message.vestingPeriods =
            object.vestingPeriods?.map(e => Period.fromPartial(e)) || [];
        message.merge = object.merge ?? false;
        return message;
    },
    fromProtoMsg(message) {
        return MsgCreatePeriodicVestingAccount.decode(message.value);
    },
    toProto(message) {
        return MsgCreatePeriodicVestingAccount.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.vesting.v1beta1.MsgCreatePeriodicVestingAccount',
            value: MsgCreatePeriodicVestingAccount.encode(message).finish(),
        };
    },
};
function createBaseMsgCreatePeriodicVestingAccountResponse() {
    return {};
}
export const MsgCreatePeriodicVestingAccountResponse = {
    typeUrl: '/cosmos.vesting.v1beta1.MsgCreatePeriodicVestingAccountResponse',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgCreatePeriodicVestingAccountResponse();
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
        const message = createBaseMsgCreatePeriodicVestingAccountResponse();
        return message;
    },
    fromProtoMsg(message) {
        return MsgCreatePeriodicVestingAccountResponse.decode(message.value);
    },
    toProto(message) {
        return MsgCreatePeriodicVestingAccountResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.vesting.v1beta1.MsgCreatePeriodicVestingAccountResponse',
            value: MsgCreatePeriodicVestingAccountResponse.encode(message).finish(),
        };
    },
};
function createBaseMsgCreateClawbackVestingAccount() {
    return {
        fromAddress: '',
        toAddress: '',
        startTime: BigInt(0),
        lockupPeriods: [],
        vestingPeriods: [],
        merge: false,
    };
}
export const MsgCreateClawbackVestingAccount = {
    typeUrl: '/cosmos.vesting.v1beta1.MsgCreateClawbackVestingAccount',
    encode(message, writer = BinaryWriter.create()) {
        if (message.fromAddress !== '') {
            writer.uint32(10).string(message.fromAddress);
        }
        if (message.toAddress !== '') {
            writer.uint32(18).string(message.toAddress);
        }
        if (message.startTime !== BigInt(0)) {
            writer.uint32(24).int64(message.startTime);
        }
        for (const v of message.lockupPeriods) {
            Period.encode(v, writer.uint32(34).fork()).ldelim();
        }
        for (const v of message.vestingPeriods) {
            Period.encode(v, writer.uint32(42).fork()).ldelim();
        }
        if (message.merge === true) {
            writer.uint32(48).bool(message.merge);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgCreateClawbackVestingAccount();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.fromAddress = reader.string();
                    break;
                case 2:
                    message.toAddress = reader.string();
                    break;
                case 3:
                    message.startTime = reader.int64();
                    break;
                case 4:
                    message.lockupPeriods.push(Period.decode(reader, reader.uint32()));
                    break;
                case 5:
                    message.vestingPeriods.push(Period.decode(reader, reader.uint32()));
                    break;
                case 6:
                    message.merge = reader.bool();
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
            fromAddress: isSet(object.fromAddress) ? String(object.fromAddress) : '',
            toAddress: isSet(object.toAddress) ? String(object.toAddress) : '',
            startTime: isSet(object.startTime)
                ? BigInt(object.startTime.toString())
                : BigInt(0),
            lockupPeriods: Array.isArray(object?.lockupPeriods)
                ? object.lockupPeriods.map((e) => Period.fromJSON(e))
                : [],
            vestingPeriods: Array.isArray(object?.vestingPeriods)
                ? object.vestingPeriods.map((e) => Period.fromJSON(e))
                : [],
            merge: isSet(object.merge) ? Boolean(object.merge) : false,
        };
    },
    toJSON(message) {
        const obj = {};
        message.fromAddress !== undefined &&
            (obj.fromAddress = message.fromAddress);
        message.toAddress !== undefined && (obj.toAddress = message.toAddress);
        message.startTime !== undefined &&
            (obj.startTime = (message.startTime || BigInt(0)).toString());
        if (message.lockupPeriods) {
            obj.lockupPeriods = message.lockupPeriods.map(e => e ? Period.toJSON(e) : undefined);
        }
        else {
            obj.lockupPeriods = [];
        }
        if (message.vestingPeriods) {
            obj.vestingPeriods = message.vestingPeriods.map(e => e ? Period.toJSON(e) : undefined);
        }
        else {
            obj.vestingPeriods = [];
        }
        message.merge !== undefined && (obj.merge = message.merge);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgCreateClawbackVestingAccount();
        message.fromAddress = object.fromAddress ?? '';
        message.toAddress = object.toAddress ?? '';
        message.startTime =
            object.startTime !== undefined && object.startTime !== null
                ? BigInt(object.startTime.toString())
                : BigInt(0);
        message.lockupPeriods =
            object.lockupPeriods?.map(e => Period.fromPartial(e)) || [];
        message.vestingPeriods =
            object.vestingPeriods?.map(e => Period.fromPartial(e)) || [];
        message.merge = object.merge ?? false;
        return message;
    },
    fromProtoMsg(message) {
        return MsgCreateClawbackVestingAccount.decode(message.value);
    },
    toProto(message) {
        return MsgCreateClawbackVestingAccount.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.vesting.v1beta1.MsgCreateClawbackVestingAccount',
            value: MsgCreateClawbackVestingAccount.encode(message).finish(),
        };
    },
};
function createBaseMsgCreateClawbackVestingAccountResponse() {
    return {};
}
export const MsgCreateClawbackVestingAccountResponse = {
    typeUrl: '/cosmos.vesting.v1beta1.MsgCreateClawbackVestingAccountResponse',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgCreateClawbackVestingAccountResponse();
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
        const message = createBaseMsgCreateClawbackVestingAccountResponse();
        return message;
    },
    fromProtoMsg(message) {
        return MsgCreateClawbackVestingAccountResponse.decode(message.value);
    },
    toProto(message) {
        return MsgCreateClawbackVestingAccountResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.vesting.v1beta1.MsgCreateClawbackVestingAccountResponse',
            value: MsgCreateClawbackVestingAccountResponse.encode(message).finish(),
        };
    },
};
function createBaseMsgClawback() {
    return {
        funderAddress: '',
        address: '',
        destAddress: '',
    };
}
export const MsgClawback = {
    typeUrl: '/cosmos.vesting.v1beta1.MsgClawback',
    encode(message, writer = BinaryWriter.create()) {
        if (message.funderAddress !== '') {
            writer.uint32(10).string(message.funderAddress);
        }
        if (message.address !== '') {
            writer.uint32(18).string(message.address);
        }
        if (message.destAddress !== '') {
            writer.uint32(26).string(message.destAddress);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgClawback();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.funderAddress = reader.string();
                    break;
                case 2:
                    message.address = reader.string();
                    break;
                case 3:
                    message.destAddress = reader.string();
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
            funderAddress: isSet(object.funderAddress)
                ? String(object.funderAddress)
                : '',
            address: isSet(object.address) ? String(object.address) : '',
            destAddress: isSet(object.destAddress) ? String(object.destAddress) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.funderAddress !== undefined &&
            (obj.funderAddress = message.funderAddress);
        message.address !== undefined && (obj.address = message.address);
        message.destAddress !== undefined &&
            (obj.destAddress = message.destAddress);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgClawback();
        message.funderAddress = object.funderAddress ?? '';
        message.address = object.address ?? '';
        message.destAddress = object.destAddress ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return MsgClawback.decode(message.value);
    },
    toProto(message) {
        return MsgClawback.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.vesting.v1beta1.MsgClawback',
            value: MsgClawback.encode(message).finish(),
        };
    },
};
function createBaseMsgClawbackResponse() {
    return {};
}
export const MsgClawbackResponse = {
    typeUrl: '/cosmos.vesting.v1beta1.MsgClawbackResponse',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgClawbackResponse();
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
        const message = createBaseMsgClawbackResponse();
        return message;
    },
    fromProtoMsg(message) {
        return MsgClawbackResponse.decode(message.value);
    },
    toProto(message) {
        return MsgClawbackResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.vesting.v1beta1.MsgClawbackResponse',
            value: MsgClawbackResponse.encode(message).finish(),
        };
    },
};
function createBaseMsgReturnGrants() {
    return {
        address: '',
    };
}
export const MsgReturnGrants = {
    typeUrl: '/cosmos.vesting.v1beta1.MsgReturnGrants',
    encode(message, writer = BinaryWriter.create()) {
        if (message.address !== '') {
            writer.uint32(10).string(message.address);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgReturnGrants();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.address = reader.string();
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
        };
    },
    toJSON(message) {
        const obj = {};
        message.address !== undefined && (obj.address = message.address);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgReturnGrants();
        message.address = object.address ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return MsgReturnGrants.decode(message.value);
    },
    toProto(message) {
        return MsgReturnGrants.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.vesting.v1beta1.MsgReturnGrants',
            value: MsgReturnGrants.encode(message).finish(),
        };
    },
};
function createBaseMsgReturnGrantsResponse() {
    return {};
}
export const MsgReturnGrantsResponse = {
    typeUrl: '/cosmos.vesting.v1beta1.MsgReturnGrantsResponse',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgReturnGrantsResponse();
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
        const message = createBaseMsgReturnGrantsResponse();
        return message;
    },
    fromProtoMsg(message) {
        return MsgReturnGrantsResponse.decode(message.value);
    },
    toProto(message) {
        return MsgReturnGrantsResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.vesting.v1beta1.MsgReturnGrantsResponse',
            value: MsgReturnGrantsResponse.encode(message).finish(),
        };
    },
};
//# sourceMappingURL=tx.js.map