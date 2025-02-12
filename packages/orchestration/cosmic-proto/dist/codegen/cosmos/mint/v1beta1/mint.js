//@ts-nocheck
import { BinaryReader, BinaryWriter } from '../../../binary.js';
import { Decimal, isSet } from '../../../helpers.js';
import {} from '../../../json-safe.js';
function createBaseMinter() {
    return {
        inflation: '',
        annualProvisions: '',
    };
}
export const Minter = {
    typeUrl: '/cosmos.mint.v1beta1.Minter',
    encode(message, writer = BinaryWriter.create()) {
        if (message.inflation !== '') {
            writer
                .uint32(10)
                .string(Decimal.fromUserInput(message.inflation, 18).atomics);
        }
        if (message.annualProvisions !== '') {
            writer
                .uint32(18)
                .string(Decimal.fromUserInput(message.annualProvisions, 18).atomics);
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
                    message.inflation = Decimal.fromAtomics(reader.string(), 18).toString();
                    break;
                case 2:
                    message.annualProvisions = Decimal.fromAtomics(reader.string(), 18).toString();
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
            inflation: isSet(object.inflation) ? String(object.inflation) : '',
            annualProvisions: isSet(object.annualProvisions)
                ? String(object.annualProvisions)
                : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.inflation !== undefined && (obj.inflation = message.inflation);
        message.annualProvisions !== undefined &&
            (obj.annualProvisions = message.annualProvisions);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMinter();
        message.inflation = object.inflation ?? '';
        message.annualProvisions = object.annualProvisions ?? '';
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
            typeUrl: '/cosmos.mint.v1beta1.Minter',
            value: Minter.encode(message).finish(),
        };
    },
};
function createBaseParams() {
    return {
        mintDenom: '',
        inflationRateChange: '',
        inflationMax: '',
        inflationMin: '',
        goalBonded: '',
        blocksPerYear: BigInt(0),
    };
}
export const Params = {
    typeUrl: '/cosmos.mint.v1beta1.Params',
    encode(message, writer = BinaryWriter.create()) {
        if (message.mintDenom !== '') {
            writer.uint32(10).string(message.mintDenom);
        }
        if (message.inflationRateChange !== '') {
            writer
                .uint32(18)
                .string(Decimal.fromUserInput(message.inflationRateChange, 18).atomics);
        }
        if (message.inflationMax !== '') {
            writer
                .uint32(26)
                .string(Decimal.fromUserInput(message.inflationMax, 18).atomics);
        }
        if (message.inflationMin !== '') {
            writer
                .uint32(34)
                .string(Decimal.fromUserInput(message.inflationMin, 18).atomics);
        }
        if (message.goalBonded !== '') {
            writer
                .uint32(42)
                .string(Decimal.fromUserInput(message.goalBonded, 18).atomics);
        }
        if (message.blocksPerYear !== BigInt(0)) {
            writer.uint32(48).uint64(message.blocksPerYear);
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
                    message.inflationRateChange = Decimal.fromAtomics(reader.string(), 18).toString();
                    break;
                case 3:
                    message.inflationMax = Decimal.fromAtomics(reader.string(), 18).toString();
                    break;
                case 4:
                    message.inflationMin = Decimal.fromAtomics(reader.string(), 18).toString();
                    break;
                case 5:
                    message.goalBonded = Decimal.fromAtomics(reader.string(), 18).toString();
                    break;
                case 6:
                    message.blocksPerYear = reader.uint64();
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
            inflationRateChange: isSet(object.inflationRateChange)
                ? String(object.inflationRateChange)
                : '',
            inflationMax: isSet(object.inflationMax)
                ? String(object.inflationMax)
                : '',
            inflationMin: isSet(object.inflationMin)
                ? String(object.inflationMin)
                : '',
            goalBonded: isSet(object.goalBonded) ? String(object.goalBonded) : '',
            blocksPerYear: isSet(object.blocksPerYear)
                ? BigInt(object.blocksPerYear.toString())
                : BigInt(0),
        };
    },
    toJSON(message) {
        const obj = {};
        message.mintDenom !== undefined && (obj.mintDenom = message.mintDenom);
        message.inflationRateChange !== undefined &&
            (obj.inflationRateChange = message.inflationRateChange);
        message.inflationMax !== undefined &&
            (obj.inflationMax = message.inflationMax);
        message.inflationMin !== undefined &&
            (obj.inflationMin = message.inflationMin);
        message.goalBonded !== undefined && (obj.goalBonded = message.goalBonded);
        message.blocksPerYear !== undefined &&
            (obj.blocksPerYear = (message.blocksPerYear || BigInt(0)).toString());
        return obj;
    },
    fromPartial(object) {
        const message = createBaseParams();
        message.mintDenom = object.mintDenom ?? '';
        message.inflationRateChange = object.inflationRateChange ?? '';
        message.inflationMax = object.inflationMax ?? '';
        message.inflationMin = object.inflationMin ?? '';
        message.goalBonded = object.goalBonded ?? '';
        message.blocksPerYear =
            object.blocksPerYear !== undefined && object.blocksPerYear !== null
                ? BigInt(object.blocksPerYear.toString())
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
            typeUrl: '/cosmos.mint.v1beta1.Params',
            value: Params.encode(message).finish(),
        };
    },
};
//# sourceMappingURL=mint.js.map