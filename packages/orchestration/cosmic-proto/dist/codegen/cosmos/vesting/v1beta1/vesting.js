//@ts-nocheck
import { BaseAccount, } from '../../auth/v1beta1/auth.js';
import { Coin } from '../../base/v1beta1/coin.js';
import { BinaryReader, BinaryWriter } from '../../../binary.js';
import { isSet } from '../../../helpers.js';
import {} from '../../../json-safe.js';
function createBaseBaseVestingAccount() {
    return {
        baseAccount: undefined,
        originalVesting: [],
        delegatedFree: [],
        delegatedVesting: [],
        endTime: BigInt(0),
    };
}
export const BaseVestingAccount = {
    typeUrl: '/cosmos.vesting.v1beta1.BaseVestingAccount',
    encode(message, writer = BinaryWriter.create()) {
        if (message.baseAccount !== undefined) {
            BaseAccount.encode(message.baseAccount, writer.uint32(10).fork()).ldelim();
        }
        for (const v of message.originalVesting) {
            Coin.encode(v, writer.uint32(18).fork()).ldelim();
        }
        for (const v of message.delegatedFree) {
            Coin.encode(v, writer.uint32(26).fork()).ldelim();
        }
        for (const v of message.delegatedVesting) {
            Coin.encode(v, writer.uint32(34).fork()).ldelim();
        }
        if (message.endTime !== BigInt(0)) {
            writer.uint32(40).int64(message.endTime);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseBaseVestingAccount();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.baseAccount = BaseAccount.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.originalVesting.push(Coin.decode(reader, reader.uint32()));
                    break;
                case 3:
                    message.delegatedFree.push(Coin.decode(reader, reader.uint32()));
                    break;
                case 4:
                    message.delegatedVesting.push(Coin.decode(reader, reader.uint32()));
                    break;
                case 5:
                    message.endTime = reader.int64();
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
            baseAccount: isSet(object.baseAccount)
                ? BaseAccount.fromJSON(object.baseAccount)
                : undefined,
            originalVesting: Array.isArray(object?.originalVesting)
                ? object.originalVesting.map((e) => Coin.fromJSON(e))
                : [],
            delegatedFree: Array.isArray(object?.delegatedFree)
                ? object.delegatedFree.map((e) => Coin.fromJSON(e))
                : [],
            delegatedVesting: Array.isArray(object?.delegatedVesting)
                ? object.delegatedVesting.map((e) => Coin.fromJSON(e))
                : [],
            endTime: isSet(object.endTime)
                ? BigInt(object.endTime.toString())
                : BigInt(0),
        };
    },
    toJSON(message) {
        const obj = {};
        message.baseAccount !== undefined &&
            (obj.baseAccount = message.baseAccount
                ? BaseAccount.toJSON(message.baseAccount)
                : undefined);
        if (message.originalVesting) {
            obj.originalVesting = message.originalVesting.map(e => e ? Coin.toJSON(e) : undefined);
        }
        else {
            obj.originalVesting = [];
        }
        if (message.delegatedFree) {
            obj.delegatedFree = message.delegatedFree.map(e => e ? Coin.toJSON(e) : undefined);
        }
        else {
            obj.delegatedFree = [];
        }
        if (message.delegatedVesting) {
            obj.delegatedVesting = message.delegatedVesting.map(e => e ? Coin.toJSON(e) : undefined);
        }
        else {
            obj.delegatedVesting = [];
        }
        message.endTime !== undefined &&
            (obj.endTime = (message.endTime || BigInt(0)).toString());
        return obj;
    },
    fromPartial(object) {
        const message = createBaseBaseVestingAccount();
        message.baseAccount =
            object.baseAccount !== undefined && object.baseAccount !== null
                ? BaseAccount.fromPartial(object.baseAccount)
                : undefined;
        message.originalVesting =
            object.originalVesting?.map(e => Coin.fromPartial(e)) || [];
        message.delegatedFree =
            object.delegatedFree?.map(e => Coin.fromPartial(e)) || [];
        message.delegatedVesting =
            object.delegatedVesting?.map(e => Coin.fromPartial(e)) || [];
        message.endTime =
            object.endTime !== undefined && object.endTime !== null
                ? BigInt(object.endTime.toString())
                : BigInt(0);
        return message;
    },
    fromProtoMsg(message) {
        return BaseVestingAccount.decode(message.value);
    },
    toProto(message) {
        return BaseVestingAccount.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.vesting.v1beta1.BaseVestingAccount',
            value: BaseVestingAccount.encode(message).finish(),
        };
    },
};
function createBaseContinuousVestingAccount() {
    return {
        baseVestingAccount: undefined,
        startTime: BigInt(0),
    };
}
export const ContinuousVestingAccount = {
    typeUrl: '/cosmos.vesting.v1beta1.ContinuousVestingAccount',
    encode(message, writer = BinaryWriter.create()) {
        if (message.baseVestingAccount !== undefined) {
            BaseVestingAccount.encode(message.baseVestingAccount, writer.uint32(10).fork()).ldelim();
        }
        if (message.startTime !== BigInt(0)) {
            writer.uint32(16).int64(message.startTime);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseContinuousVestingAccount();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.baseVestingAccount = BaseVestingAccount.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.startTime = reader.int64();
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
            baseVestingAccount: isSet(object.baseVestingAccount)
                ? BaseVestingAccount.fromJSON(object.baseVestingAccount)
                : undefined,
            startTime: isSet(object.startTime)
                ? BigInt(object.startTime.toString())
                : BigInt(0),
        };
    },
    toJSON(message) {
        const obj = {};
        message.baseVestingAccount !== undefined &&
            (obj.baseVestingAccount = message.baseVestingAccount
                ? BaseVestingAccount.toJSON(message.baseVestingAccount)
                : undefined);
        message.startTime !== undefined &&
            (obj.startTime = (message.startTime || BigInt(0)).toString());
        return obj;
    },
    fromPartial(object) {
        const message = createBaseContinuousVestingAccount();
        message.baseVestingAccount =
            object.baseVestingAccount !== undefined &&
                object.baseVestingAccount !== null
                ? BaseVestingAccount.fromPartial(object.baseVestingAccount)
                : undefined;
        message.startTime =
            object.startTime !== undefined && object.startTime !== null
                ? BigInt(object.startTime.toString())
                : BigInt(0);
        return message;
    },
    fromProtoMsg(message) {
        return ContinuousVestingAccount.decode(message.value);
    },
    toProto(message) {
        return ContinuousVestingAccount.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.vesting.v1beta1.ContinuousVestingAccount',
            value: ContinuousVestingAccount.encode(message).finish(),
        };
    },
};
function createBaseDelayedVestingAccount() {
    return {
        baseVestingAccount: undefined,
    };
}
export const DelayedVestingAccount = {
    typeUrl: '/cosmos.vesting.v1beta1.DelayedVestingAccount',
    encode(message, writer = BinaryWriter.create()) {
        if (message.baseVestingAccount !== undefined) {
            BaseVestingAccount.encode(message.baseVestingAccount, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseDelayedVestingAccount();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.baseVestingAccount = BaseVestingAccount.decode(reader, reader.uint32());
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
            baseVestingAccount: isSet(object.baseVestingAccount)
                ? BaseVestingAccount.fromJSON(object.baseVestingAccount)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.baseVestingAccount !== undefined &&
            (obj.baseVestingAccount = message.baseVestingAccount
                ? BaseVestingAccount.toJSON(message.baseVestingAccount)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseDelayedVestingAccount();
        message.baseVestingAccount =
            object.baseVestingAccount !== undefined &&
                object.baseVestingAccount !== null
                ? BaseVestingAccount.fromPartial(object.baseVestingAccount)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return DelayedVestingAccount.decode(message.value);
    },
    toProto(message) {
        return DelayedVestingAccount.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.vesting.v1beta1.DelayedVestingAccount',
            value: DelayedVestingAccount.encode(message).finish(),
        };
    },
};
function createBasePeriod() {
    return {
        length: BigInt(0),
        amount: [],
    };
}
export const Period = {
    typeUrl: '/cosmos.vesting.v1beta1.Period',
    encode(message, writer = BinaryWriter.create()) {
        if (message.length !== BigInt(0)) {
            writer.uint32(8).int64(message.length);
        }
        for (const v of message.amount) {
            Coin.encode(v, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBasePeriod();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.length = reader.int64();
                    break;
                case 2:
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
            length: isSet(object.length)
                ? BigInt(object.length.toString())
                : BigInt(0),
            amount: Array.isArray(object?.amount)
                ? object.amount.map((e) => Coin.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        message.length !== undefined &&
            (obj.length = (message.length || BigInt(0)).toString());
        if (message.amount) {
            obj.amount = message.amount.map(e => (e ? Coin.toJSON(e) : undefined));
        }
        else {
            obj.amount = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBasePeriod();
        message.length =
            object.length !== undefined && object.length !== null
                ? BigInt(object.length.toString())
                : BigInt(0);
        message.amount = object.amount?.map(e => Coin.fromPartial(e)) || [];
        return message;
    },
    fromProtoMsg(message) {
        return Period.decode(message.value);
    },
    toProto(message) {
        return Period.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.vesting.v1beta1.Period',
            value: Period.encode(message).finish(),
        };
    },
};
function createBasePeriodicVestingAccount() {
    return {
        baseVestingAccount: undefined,
        startTime: BigInt(0),
        vestingPeriods: [],
    };
}
export const PeriodicVestingAccount = {
    typeUrl: '/cosmos.vesting.v1beta1.PeriodicVestingAccount',
    encode(message, writer = BinaryWriter.create()) {
        if (message.baseVestingAccount !== undefined) {
            BaseVestingAccount.encode(message.baseVestingAccount, writer.uint32(10).fork()).ldelim();
        }
        if (message.startTime !== BigInt(0)) {
            writer.uint32(16).int64(message.startTime);
        }
        for (const v of message.vestingPeriods) {
            Period.encode(v, writer.uint32(26).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBasePeriodicVestingAccount();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.baseVestingAccount = BaseVestingAccount.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.startTime = reader.int64();
                    break;
                case 3:
                    message.vestingPeriods.push(Period.decode(reader, reader.uint32()));
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
            baseVestingAccount: isSet(object.baseVestingAccount)
                ? BaseVestingAccount.fromJSON(object.baseVestingAccount)
                : undefined,
            startTime: isSet(object.startTime)
                ? BigInt(object.startTime.toString())
                : BigInt(0),
            vestingPeriods: Array.isArray(object?.vestingPeriods)
                ? object.vestingPeriods.map((e) => Period.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        message.baseVestingAccount !== undefined &&
            (obj.baseVestingAccount = message.baseVestingAccount
                ? BaseVestingAccount.toJSON(message.baseVestingAccount)
                : undefined);
        message.startTime !== undefined &&
            (obj.startTime = (message.startTime || BigInt(0)).toString());
        if (message.vestingPeriods) {
            obj.vestingPeriods = message.vestingPeriods.map(e => e ? Period.toJSON(e) : undefined);
        }
        else {
            obj.vestingPeriods = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBasePeriodicVestingAccount();
        message.baseVestingAccount =
            object.baseVestingAccount !== undefined &&
                object.baseVestingAccount !== null
                ? BaseVestingAccount.fromPartial(object.baseVestingAccount)
                : undefined;
        message.startTime =
            object.startTime !== undefined && object.startTime !== null
                ? BigInt(object.startTime.toString())
                : BigInt(0);
        message.vestingPeriods =
            object.vestingPeriods?.map(e => Period.fromPartial(e)) || [];
        return message;
    },
    fromProtoMsg(message) {
        return PeriodicVestingAccount.decode(message.value);
    },
    toProto(message) {
        return PeriodicVestingAccount.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.vesting.v1beta1.PeriodicVestingAccount',
            value: PeriodicVestingAccount.encode(message).finish(),
        };
    },
};
function createBasePermanentLockedAccount() {
    return {
        baseVestingAccount: undefined,
    };
}
export const PermanentLockedAccount = {
    typeUrl: '/cosmos.vesting.v1beta1.PermanentLockedAccount',
    encode(message, writer = BinaryWriter.create()) {
        if (message.baseVestingAccount !== undefined) {
            BaseVestingAccount.encode(message.baseVestingAccount, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBasePermanentLockedAccount();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.baseVestingAccount = BaseVestingAccount.decode(reader, reader.uint32());
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
            baseVestingAccount: isSet(object.baseVestingAccount)
                ? BaseVestingAccount.fromJSON(object.baseVestingAccount)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.baseVestingAccount !== undefined &&
            (obj.baseVestingAccount = message.baseVestingAccount
                ? BaseVestingAccount.toJSON(message.baseVestingAccount)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBasePermanentLockedAccount();
        message.baseVestingAccount =
            object.baseVestingAccount !== undefined &&
                object.baseVestingAccount !== null
                ? BaseVestingAccount.fromPartial(object.baseVestingAccount)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return PermanentLockedAccount.decode(message.value);
    },
    toProto(message) {
        return PermanentLockedAccount.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.vesting.v1beta1.PermanentLockedAccount',
            value: PermanentLockedAccount.encode(message).finish(),
        };
    },
};
function createBaseClawbackVestingAccount() {
    return {
        baseVestingAccount: undefined,
        funderAddress: '',
        startTime: BigInt(0),
        lockupPeriods: [],
        vestingPeriods: [],
    };
}
export const ClawbackVestingAccount = {
    typeUrl: '/cosmos.vesting.v1beta1.ClawbackVestingAccount',
    encode(message, writer = BinaryWriter.create()) {
        if (message.baseVestingAccount !== undefined) {
            BaseVestingAccount.encode(message.baseVestingAccount, writer.uint32(10).fork()).ldelim();
        }
        if (message.funderAddress !== '') {
            writer.uint32(18).string(message.funderAddress);
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
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseClawbackVestingAccount();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.baseVestingAccount = BaseVestingAccount.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.funderAddress = reader.string();
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
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON(object) {
        return {
            baseVestingAccount: isSet(object.baseVestingAccount)
                ? BaseVestingAccount.fromJSON(object.baseVestingAccount)
                : undefined,
            funderAddress: isSet(object.funderAddress)
                ? String(object.funderAddress)
                : '',
            startTime: isSet(object.startTime)
                ? BigInt(object.startTime.toString())
                : BigInt(0),
            lockupPeriods: Array.isArray(object?.lockupPeriods)
                ? object.lockupPeriods.map((e) => Period.fromJSON(e))
                : [],
            vestingPeriods: Array.isArray(object?.vestingPeriods)
                ? object.vestingPeriods.map((e) => Period.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        message.baseVestingAccount !== undefined &&
            (obj.baseVestingAccount = message.baseVestingAccount
                ? BaseVestingAccount.toJSON(message.baseVestingAccount)
                : undefined);
        message.funderAddress !== undefined &&
            (obj.funderAddress = message.funderAddress);
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
        return obj;
    },
    fromPartial(object) {
        const message = createBaseClawbackVestingAccount();
        message.baseVestingAccount =
            object.baseVestingAccount !== undefined &&
                object.baseVestingAccount !== null
                ? BaseVestingAccount.fromPartial(object.baseVestingAccount)
                : undefined;
        message.funderAddress = object.funderAddress ?? '';
        message.startTime =
            object.startTime !== undefined && object.startTime !== null
                ? BigInt(object.startTime.toString())
                : BigInt(0);
        message.lockupPeriods =
            object.lockupPeriods?.map(e => Period.fromPartial(e)) || [];
        message.vestingPeriods =
            object.vestingPeriods?.map(e => Period.fromPartial(e)) || [];
        return message;
    },
    fromProtoMsg(message) {
        return ClawbackVestingAccount.decode(message.value);
    },
    toProto(message) {
        return ClawbackVestingAccount.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.vesting.v1beta1.ClawbackVestingAccount',
            value: ClawbackVestingAccount.encode(message).finish(),
        };
    },
};
//# sourceMappingURL=vesting.js.map