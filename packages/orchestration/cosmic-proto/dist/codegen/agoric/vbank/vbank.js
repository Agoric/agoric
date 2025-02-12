//@ts-nocheck
import { Coin } from '../../cosmos/base/v1beta1/coin.js';
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { Decimal, isSet } from '../../helpers.js';
import {} from '../../json-safe.js';
function createBaseParams() {
    return {
        rewardEpochDurationBlocks: BigInt(0),
        perEpochRewardFraction: '',
        rewardSmoothingBlocks: BigInt(0),
        allowedMonitoringAccounts: [],
    };
}
export const Params = {
    typeUrl: '/agoric.vbank.Params',
    encode(message, writer = BinaryWriter.create()) {
        if (message.rewardEpochDurationBlocks !== BigInt(0)) {
            writer.uint32(8).int64(message.rewardEpochDurationBlocks);
        }
        if (message.perEpochRewardFraction !== '') {
            writer
                .uint32(18)
                .string(Decimal.fromUserInput(message.perEpochRewardFraction, 18).atomics);
        }
        if (message.rewardSmoothingBlocks !== BigInt(0)) {
            writer.uint32(24).int64(message.rewardSmoothingBlocks);
        }
        for (const v of message.allowedMonitoringAccounts) {
            writer.uint32(34).string(v);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseParams();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.rewardEpochDurationBlocks = reader.int64();
                    break;
                case 2:
                    message.perEpochRewardFraction = Decimal.fromAtomics(reader.string(), 18).toString();
                    break;
                case 3:
                    message.rewardSmoothingBlocks = reader.int64();
                    break;
                case 4:
                    message.allowedMonitoringAccounts.push(reader.string());
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
            rewardEpochDurationBlocks: isSet(object.rewardEpochDurationBlocks)
                ? BigInt(object.rewardEpochDurationBlocks.toString())
                : BigInt(0),
            perEpochRewardFraction: isSet(object.perEpochRewardFraction)
                ? String(object.perEpochRewardFraction)
                : '',
            rewardSmoothingBlocks: isSet(object.rewardSmoothingBlocks)
                ? BigInt(object.rewardSmoothingBlocks.toString())
                : BigInt(0),
            allowedMonitoringAccounts: Array.isArray(object?.allowedMonitoringAccounts)
                ? object.allowedMonitoringAccounts.map((e) => String(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        message.rewardEpochDurationBlocks !== undefined &&
            (obj.rewardEpochDurationBlocks = (message.rewardEpochDurationBlocks || BigInt(0)).toString());
        message.perEpochRewardFraction !== undefined &&
            (obj.perEpochRewardFraction = message.perEpochRewardFraction);
        message.rewardSmoothingBlocks !== undefined &&
            (obj.rewardSmoothingBlocks = (message.rewardSmoothingBlocks || BigInt(0)).toString());
        if (message.allowedMonitoringAccounts) {
            obj.allowedMonitoringAccounts = message.allowedMonitoringAccounts.map(e => e);
        }
        else {
            obj.allowedMonitoringAccounts = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseParams();
        message.rewardEpochDurationBlocks =
            object.rewardEpochDurationBlocks !== undefined &&
                object.rewardEpochDurationBlocks !== null
                ? BigInt(object.rewardEpochDurationBlocks.toString())
                : BigInt(0);
        message.perEpochRewardFraction = object.perEpochRewardFraction ?? '';
        message.rewardSmoothingBlocks =
            object.rewardSmoothingBlocks !== undefined &&
                object.rewardSmoothingBlocks !== null
                ? BigInt(object.rewardSmoothingBlocks.toString())
                : BigInt(0);
        message.allowedMonitoringAccounts =
            object.allowedMonitoringAccounts?.map(e => e) || [];
        return message;
    },
    fromProtoMsg(message) {
        return Params.decode(message.value);
    },
    toProto(message) {
        return Params.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/agoric.vbank.Params',
            value: Params.encode(message).finish(),
        };
    },
};
function createBaseState() {
    return {
        rewardPool: [],
        rewardBlockAmount: [],
        lastSequence: BigInt(0),
        lastRewardDistributionBlock: BigInt(0),
    };
}
export const State = {
    typeUrl: '/agoric.vbank.State',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.rewardPool) {
            Coin.encode(v, writer.uint32(10).fork()).ldelim();
        }
        for (const v of message.rewardBlockAmount) {
            Coin.encode(v, writer.uint32(18).fork()).ldelim();
        }
        if (message.lastSequence !== BigInt(0)) {
            writer.uint32(24).uint64(message.lastSequence);
        }
        if (message.lastRewardDistributionBlock !== BigInt(0)) {
            writer.uint32(32).int64(message.lastRewardDistributionBlock);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseState();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.rewardPool.push(Coin.decode(reader, reader.uint32()));
                    break;
                case 2:
                    message.rewardBlockAmount.push(Coin.decode(reader, reader.uint32()));
                    break;
                case 3:
                    message.lastSequence = reader.uint64();
                    break;
                case 4:
                    message.lastRewardDistributionBlock = reader.int64();
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
            rewardPool: Array.isArray(object?.rewardPool)
                ? object.rewardPool.map((e) => Coin.fromJSON(e))
                : [],
            rewardBlockAmount: Array.isArray(object?.rewardBlockAmount)
                ? object.rewardBlockAmount.map((e) => Coin.fromJSON(e))
                : [],
            lastSequence: isSet(object.lastSequence)
                ? BigInt(object.lastSequence.toString())
                : BigInt(0),
            lastRewardDistributionBlock: isSet(object.lastRewardDistributionBlock)
                ? BigInt(object.lastRewardDistributionBlock.toString())
                : BigInt(0),
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.rewardPool) {
            obj.rewardPool = message.rewardPool.map(e => e ? Coin.toJSON(e) : undefined);
        }
        else {
            obj.rewardPool = [];
        }
        if (message.rewardBlockAmount) {
            obj.rewardBlockAmount = message.rewardBlockAmount.map(e => e ? Coin.toJSON(e) : undefined);
        }
        else {
            obj.rewardBlockAmount = [];
        }
        message.lastSequence !== undefined &&
            (obj.lastSequence = (message.lastSequence || BigInt(0)).toString());
        message.lastRewardDistributionBlock !== undefined &&
            (obj.lastRewardDistributionBlock = (message.lastRewardDistributionBlock || BigInt(0)).toString());
        return obj;
    },
    fromPartial(object) {
        const message = createBaseState();
        message.rewardPool = object.rewardPool?.map(e => Coin.fromPartial(e)) || [];
        message.rewardBlockAmount =
            object.rewardBlockAmount?.map(e => Coin.fromPartial(e)) || [];
        message.lastSequence =
            object.lastSequence !== undefined && object.lastSequence !== null
                ? BigInt(object.lastSequence.toString())
                : BigInt(0);
        message.lastRewardDistributionBlock =
            object.lastRewardDistributionBlock !== undefined &&
                object.lastRewardDistributionBlock !== null
                ? BigInt(object.lastRewardDistributionBlock.toString())
                : BigInt(0);
        return message;
    },
    fromProtoMsg(message) {
        return State.decode(message.value);
    },
    toProto(message) {
        return State.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/agoric.vbank.State',
            value: State.encode(message).finish(),
        };
    },
};
//# sourceMappingURL=vbank.js.map