//@ts-nocheck
import { BinaryReader, BinaryWriter } from '../../../binary.js';
import { Decimal, isSet } from '../../../helpers.js';
import {} from '../../../json-safe.js';
function createBaseMinter() {
    return {
        epochProvisions: '',
    };
}
export const Minter = {
    typeUrl: '/stride.mint.v1beta1.Minter',
    encode(message, writer = BinaryWriter.create()) {
        if (message.epochProvisions !== '') {
            writer
                .uint32(10)
                .string(Decimal.fromUserInput(message.epochProvisions, 18).atomics);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMinter();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.epochProvisions = Decimal.fromAtomics(reader.string(), 18).toString();
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
            epochProvisions: isSet(object.epochProvisions)
                ? String(object.epochProvisions)
                : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.epochProvisions !== undefined &&
            (obj.epochProvisions = message.epochProvisions);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMinter();
        message.epochProvisions = object.epochProvisions ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return Minter.decode(message.value);
    },
    toProto(message) {
        return Minter.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.mint.v1beta1.Minter',
            value: Minter.encode(message).finish(),
        };
    },
};
function createBaseDistributionProportions() {
    return {
        staking: '',
        communityPoolGrowth: '',
        communityPoolSecurityBudget: '',
        strategicReserve: '',
    };
}
export const DistributionProportions = {
    typeUrl: '/stride.mint.v1beta1.DistributionProportions',
    encode(message, writer = BinaryWriter.create()) {
        if (message.staking !== '') {
            writer
                .uint32(10)
                .string(Decimal.fromUserInput(message.staking, 18).atomics);
        }
        if (message.communityPoolGrowth !== '') {
            writer
                .uint32(18)
                .string(Decimal.fromUserInput(message.communityPoolGrowth, 18).atomics);
        }
        if (message.communityPoolSecurityBudget !== '') {
            writer
                .uint32(26)
                .string(Decimal.fromUserInput(message.communityPoolSecurityBudget, 18)
                .atomics);
        }
        if (message.strategicReserve !== '') {
            writer
                .uint32(34)
                .string(Decimal.fromUserInput(message.strategicReserve, 18).atomics);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseDistributionProportions();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.staking = Decimal.fromAtomics(reader.string(), 18).toString();
                    break;
                case 2:
                    message.communityPoolGrowth = Decimal.fromAtomics(reader.string(), 18).toString();
                    break;
                case 3:
                    message.communityPoolSecurityBudget = Decimal.fromAtomics(reader.string(), 18).toString();
                    break;
                case 4:
                    message.strategicReserve = Decimal.fromAtomics(reader.string(), 18).toString();
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
            staking: isSet(object.staking) ? String(object.staking) : '',
            communityPoolGrowth: isSet(object.communityPoolGrowth)
                ? String(object.communityPoolGrowth)
                : '',
            communityPoolSecurityBudget: isSet(object.communityPoolSecurityBudget)
                ? String(object.communityPoolSecurityBudget)
                : '',
            strategicReserve: isSet(object.strategicReserve)
                ? String(object.strategicReserve)
                : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.staking !== undefined && (obj.staking = message.staking);
        message.communityPoolGrowth !== undefined &&
            (obj.communityPoolGrowth = message.communityPoolGrowth);
        message.communityPoolSecurityBudget !== undefined &&
            (obj.communityPoolSecurityBudget = message.communityPoolSecurityBudget);
        message.strategicReserve !== undefined &&
            (obj.strategicReserve = message.strategicReserve);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseDistributionProportions();
        message.staking = object.staking ?? '';
        message.communityPoolGrowth = object.communityPoolGrowth ?? '';
        message.communityPoolSecurityBudget =
            object.communityPoolSecurityBudget ?? '';
        message.strategicReserve = object.strategicReserve ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return DistributionProportions.decode(message.value);
    },
    toProto(message) {
        return DistributionProportions.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.mint.v1beta1.DistributionProportions',
            value: DistributionProportions.encode(message).finish(),
        };
    },
};
function createBaseParams() {
    return {
        mintDenom: '',
        genesisEpochProvisions: '',
        epochIdentifier: '',
        reductionPeriodInEpochs: BigInt(0),
        reductionFactor: '',
        distributionProportions: DistributionProportions.fromPartial({}),
        mintingRewardsDistributionStartEpoch: BigInt(0),
    };
}
export const Params = {
    typeUrl: '/stride.mint.v1beta1.Params',
    encode(message, writer = BinaryWriter.create()) {
        if (message.mintDenom !== '') {
            writer.uint32(10).string(message.mintDenom);
        }
        if (message.genesisEpochProvisions !== '') {
            writer
                .uint32(18)
                .string(Decimal.fromUserInput(message.genesisEpochProvisions, 18).atomics);
        }
        if (message.epochIdentifier !== '') {
            writer.uint32(26).string(message.epochIdentifier);
        }
        if (message.reductionPeriodInEpochs !== BigInt(0)) {
            writer.uint32(32).int64(message.reductionPeriodInEpochs);
        }
        if (message.reductionFactor !== '') {
            writer
                .uint32(42)
                .string(Decimal.fromUserInput(message.reductionFactor, 18).atomics);
        }
        if (message.distributionProportions !== undefined) {
            DistributionProportions.encode(message.distributionProportions, writer.uint32(50).fork()).ldelim();
        }
        if (message.mintingRewardsDistributionStartEpoch !== BigInt(0)) {
            writer.uint32(56).int64(message.mintingRewardsDistributionStartEpoch);
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
                    message.mintDenom = reader.string();
                    break;
                case 2:
                    message.genesisEpochProvisions = Decimal.fromAtomics(reader.string(), 18).toString();
                    break;
                case 3:
                    message.epochIdentifier = reader.string();
                    break;
                case 4:
                    message.reductionPeriodInEpochs = reader.int64();
                    break;
                case 5:
                    message.reductionFactor = Decimal.fromAtomics(reader.string(), 18).toString();
                    break;
                case 6:
                    message.distributionProportions = DistributionProportions.decode(reader, reader.uint32());
                    break;
                case 7:
                    message.mintingRewardsDistributionStartEpoch = reader.int64();
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
            mintDenom: isSet(object.mintDenom) ? String(object.mintDenom) : '',
            genesisEpochProvisions: isSet(object.genesisEpochProvisions)
                ? String(object.genesisEpochProvisions)
                : '',
            epochIdentifier: isSet(object.epochIdentifier)
                ? String(object.epochIdentifier)
                : '',
            reductionPeriodInEpochs: isSet(object.reductionPeriodInEpochs)
                ? BigInt(object.reductionPeriodInEpochs.toString())
                : BigInt(0),
            reductionFactor: isSet(object.reductionFactor)
                ? String(object.reductionFactor)
                : '',
            distributionProportions: isSet(object.distributionProportions)
                ? DistributionProportions.fromJSON(object.distributionProportions)
                : undefined,
            mintingRewardsDistributionStartEpoch: isSet(object.mintingRewardsDistributionStartEpoch)
                ? BigInt(object.mintingRewardsDistributionStartEpoch.toString())
                : BigInt(0),
        };
    },
    toJSON(message) {
        const obj = {};
        message.mintDenom !== undefined && (obj.mintDenom = message.mintDenom);
        message.genesisEpochProvisions !== undefined &&
            (obj.genesisEpochProvisions = message.genesisEpochProvisions);
        message.epochIdentifier !== undefined &&
            (obj.epochIdentifier = message.epochIdentifier);
        message.reductionPeriodInEpochs !== undefined &&
            (obj.reductionPeriodInEpochs = (message.reductionPeriodInEpochs || BigInt(0)).toString());
        message.reductionFactor !== undefined &&
            (obj.reductionFactor = message.reductionFactor);
        message.distributionProportions !== undefined &&
            (obj.distributionProportions = message.distributionProportions
                ? DistributionProportions.toJSON(message.distributionProportions)
                : undefined);
        message.mintingRewardsDistributionStartEpoch !== undefined &&
            (obj.mintingRewardsDistributionStartEpoch = (message.mintingRewardsDistributionStartEpoch || BigInt(0)).toString());
        return obj;
    },
    fromPartial(object) {
        const message = createBaseParams();
        message.mintDenom = object.mintDenom ?? '';
        message.genesisEpochProvisions = object.genesisEpochProvisions ?? '';
        message.epochIdentifier = object.epochIdentifier ?? '';
        message.reductionPeriodInEpochs =
            object.reductionPeriodInEpochs !== undefined &&
                object.reductionPeriodInEpochs !== null
                ? BigInt(object.reductionPeriodInEpochs.toString())
                : BigInt(0);
        message.reductionFactor = object.reductionFactor ?? '';
        message.distributionProportions =
            object.distributionProportions !== undefined &&
                object.distributionProportions !== null
                ? DistributionProportions.fromPartial(object.distributionProportions)
                : undefined;
        message.mintingRewardsDistributionStartEpoch =
            object.mintingRewardsDistributionStartEpoch !== undefined &&
                object.mintingRewardsDistributionStartEpoch !== null
                ? BigInt(object.mintingRewardsDistributionStartEpoch.toString())
                : BigInt(0);
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
            typeUrl: '/stride.mint.v1beta1.Params',
            value: Params.encode(message).finish(),
        };
    },
};
//# sourceMappingURL=mint.js.map