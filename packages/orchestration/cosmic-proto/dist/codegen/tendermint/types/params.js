//@ts-nocheck
import { Duration, } from '../../google/protobuf/duration.js';
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { isSet } from '../../helpers.js';
import {} from '../../json-safe.js';
function createBaseConsensusParams() {
    return {
        block: BlockParams.fromPartial({}),
        evidence: EvidenceParams.fromPartial({}),
        validator: ValidatorParams.fromPartial({}),
        version: VersionParams.fromPartial({}),
    };
}
export const ConsensusParams = {
    typeUrl: '/tendermint.types.ConsensusParams',
    encode(message, writer = BinaryWriter.create()) {
        if (message.block !== undefined) {
            BlockParams.encode(message.block, writer.uint32(10).fork()).ldelim();
        }
        if (message.evidence !== undefined) {
            EvidenceParams.encode(message.evidence, writer.uint32(18).fork()).ldelim();
        }
        if (message.validator !== undefined) {
            ValidatorParams.encode(message.validator, writer.uint32(26).fork()).ldelim();
        }
        if (message.version !== undefined) {
            VersionParams.encode(message.version, writer.uint32(34).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseConsensusParams();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.block = BlockParams.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.evidence = EvidenceParams.decode(reader, reader.uint32());
                    break;
                case 3:
                    message.validator = ValidatorParams.decode(reader, reader.uint32());
                    break;
                case 4:
                    message.version = VersionParams.decode(reader, reader.uint32());
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
            block: isSet(object.block)
                ? BlockParams.fromJSON(object.block)
                : undefined,
            evidence: isSet(object.evidence)
                ? EvidenceParams.fromJSON(object.evidence)
                : undefined,
            validator: isSet(object.validator)
                ? ValidatorParams.fromJSON(object.validator)
                : undefined,
            version: isSet(object.version)
                ? VersionParams.fromJSON(object.version)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.block !== undefined &&
            (obj.block = message.block
                ? BlockParams.toJSON(message.block)
                : undefined);
        message.evidence !== undefined &&
            (obj.evidence = message.evidence
                ? EvidenceParams.toJSON(message.evidence)
                : undefined);
        message.validator !== undefined &&
            (obj.validator = message.validator
                ? ValidatorParams.toJSON(message.validator)
                : undefined);
        message.version !== undefined &&
            (obj.version = message.version
                ? VersionParams.toJSON(message.version)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseConsensusParams();
        message.block =
            object.block !== undefined && object.block !== null
                ? BlockParams.fromPartial(object.block)
                : undefined;
        message.evidence =
            object.evidence !== undefined && object.evidence !== null
                ? EvidenceParams.fromPartial(object.evidence)
                : undefined;
        message.validator =
            object.validator !== undefined && object.validator !== null
                ? ValidatorParams.fromPartial(object.validator)
                : undefined;
        message.version =
            object.version !== undefined && object.version !== null
                ? VersionParams.fromPartial(object.version)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return ConsensusParams.decode(message.value);
    },
    toProto(message) {
        return ConsensusParams.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/tendermint.types.ConsensusParams',
            value: ConsensusParams.encode(message).finish(),
        };
    },
};
function createBaseBlockParams() {
    return {
        maxBytes: BigInt(0),
        maxGas: BigInt(0),
        timeIotaMs: BigInt(0),
    };
}
export const BlockParams = {
    typeUrl: '/tendermint.types.BlockParams',
    encode(message, writer = BinaryWriter.create()) {
        if (message.maxBytes !== BigInt(0)) {
            writer.uint32(8).int64(message.maxBytes);
        }
        if (message.maxGas !== BigInt(0)) {
            writer.uint32(16).int64(message.maxGas);
        }
        if (message.timeIotaMs !== BigInt(0)) {
            writer.uint32(24).int64(message.timeIotaMs);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseBlockParams();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.maxBytes = reader.int64();
                    break;
                case 2:
                    message.maxGas = reader.int64();
                    break;
                case 3:
                    message.timeIotaMs = reader.int64();
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
            maxBytes: isSet(object.maxBytes)
                ? BigInt(object.maxBytes.toString())
                : BigInt(0),
            maxGas: isSet(object.maxGas)
                ? BigInt(object.maxGas.toString())
                : BigInt(0),
            timeIotaMs: isSet(object.timeIotaMs)
                ? BigInt(object.timeIotaMs.toString())
                : BigInt(0),
        };
    },
    toJSON(message) {
        const obj = {};
        message.maxBytes !== undefined &&
            (obj.maxBytes = (message.maxBytes || BigInt(0)).toString());
        message.maxGas !== undefined &&
            (obj.maxGas = (message.maxGas || BigInt(0)).toString());
        message.timeIotaMs !== undefined &&
            (obj.timeIotaMs = (message.timeIotaMs || BigInt(0)).toString());
        return obj;
    },
    fromPartial(object) {
        const message = createBaseBlockParams();
        message.maxBytes =
            object.maxBytes !== undefined && object.maxBytes !== null
                ? BigInt(object.maxBytes.toString())
                : BigInt(0);
        message.maxGas =
            object.maxGas !== undefined && object.maxGas !== null
                ? BigInt(object.maxGas.toString())
                : BigInt(0);
        message.timeIotaMs =
            object.timeIotaMs !== undefined && object.timeIotaMs !== null
                ? BigInt(object.timeIotaMs.toString())
                : BigInt(0);
        return message;
    },
    fromProtoMsg(message) {
        return BlockParams.decode(message.value);
    },
    toProto(message) {
        return BlockParams.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/tendermint.types.BlockParams',
            value: BlockParams.encode(message).finish(),
        };
    },
};
function createBaseEvidenceParams() {
    return {
        maxAgeNumBlocks: BigInt(0),
        maxAgeDuration: Duration.fromPartial({}),
        maxBytes: BigInt(0),
    };
}
export const EvidenceParams = {
    typeUrl: '/tendermint.types.EvidenceParams',
    encode(message, writer = BinaryWriter.create()) {
        if (message.maxAgeNumBlocks !== BigInt(0)) {
            writer.uint32(8).int64(message.maxAgeNumBlocks);
        }
        if (message.maxAgeDuration !== undefined) {
            Duration.encode(message.maxAgeDuration, writer.uint32(18).fork()).ldelim();
        }
        if (message.maxBytes !== BigInt(0)) {
            writer.uint32(24).int64(message.maxBytes);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseEvidenceParams();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.maxAgeNumBlocks = reader.int64();
                    break;
                case 2:
                    message.maxAgeDuration = Duration.decode(reader, reader.uint32());
                    break;
                case 3:
                    message.maxBytes = reader.int64();
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
            maxAgeNumBlocks: isSet(object.maxAgeNumBlocks)
                ? BigInt(object.maxAgeNumBlocks.toString())
                : BigInt(0),
            maxAgeDuration: isSet(object.maxAgeDuration)
                ? Duration.fromJSON(object.maxAgeDuration)
                : undefined,
            maxBytes: isSet(object.maxBytes)
                ? BigInt(object.maxBytes.toString())
                : BigInt(0),
        };
    },
    toJSON(message) {
        const obj = {};
        message.maxAgeNumBlocks !== undefined &&
            (obj.maxAgeNumBlocks = (message.maxAgeNumBlocks || BigInt(0)).toString());
        message.maxAgeDuration !== undefined &&
            (obj.maxAgeDuration = message.maxAgeDuration
                ? Duration.toJSON(message.maxAgeDuration)
                : undefined);
        message.maxBytes !== undefined &&
            (obj.maxBytes = (message.maxBytes || BigInt(0)).toString());
        return obj;
    },
    fromPartial(object) {
        const message = createBaseEvidenceParams();
        message.maxAgeNumBlocks =
            object.maxAgeNumBlocks !== undefined && object.maxAgeNumBlocks !== null
                ? BigInt(object.maxAgeNumBlocks.toString())
                : BigInt(0);
        message.maxAgeDuration =
            object.maxAgeDuration !== undefined && object.maxAgeDuration !== null
                ? Duration.fromPartial(object.maxAgeDuration)
                : undefined;
        message.maxBytes =
            object.maxBytes !== undefined && object.maxBytes !== null
                ? BigInt(object.maxBytes.toString())
                : BigInt(0);
        return message;
    },
    fromProtoMsg(message) {
        return EvidenceParams.decode(message.value);
    },
    toProto(message) {
        return EvidenceParams.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/tendermint.types.EvidenceParams',
            value: EvidenceParams.encode(message).finish(),
        };
    },
};
function createBaseValidatorParams() {
    return {
        pubKeyTypes: [],
    };
}
export const ValidatorParams = {
    typeUrl: '/tendermint.types.ValidatorParams',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.pubKeyTypes) {
            writer.uint32(10).string(v);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseValidatorParams();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.pubKeyTypes.push(reader.string());
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
            pubKeyTypes: Array.isArray(object?.pubKeyTypes)
                ? object.pubKeyTypes.map((e) => String(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.pubKeyTypes) {
            obj.pubKeyTypes = message.pubKeyTypes.map(e => e);
        }
        else {
            obj.pubKeyTypes = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseValidatorParams();
        message.pubKeyTypes = object.pubKeyTypes?.map(e => e) || [];
        return message;
    },
    fromProtoMsg(message) {
        return ValidatorParams.decode(message.value);
    },
    toProto(message) {
        return ValidatorParams.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/tendermint.types.ValidatorParams',
            value: ValidatorParams.encode(message).finish(),
        };
    },
};
function createBaseVersionParams() {
    return {
        appVersion: BigInt(0),
    };
}
export const VersionParams = {
    typeUrl: '/tendermint.types.VersionParams',
    encode(message, writer = BinaryWriter.create()) {
        if (message.appVersion !== BigInt(0)) {
            writer.uint32(8).uint64(message.appVersion);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseVersionParams();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.appVersion = reader.uint64();
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
            appVersion: isSet(object.appVersion)
                ? BigInt(object.appVersion.toString())
                : BigInt(0),
        };
    },
    toJSON(message) {
        const obj = {};
        message.appVersion !== undefined &&
            (obj.appVersion = (message.appVersion || BigInt(0)).toString());
        return obj;
    },
    fromPartial(object) {
        const message = createBaseVersionParams();
        message.appVersion =
            object.appVersion !== undefined && object.appVersion !== null
                ? BigInt(object.appVersion.toString())
                : BigInt(0);
        return message;
    },
    fromProtoMsg(message) {
        return VersionParams.decode(message.value);
    },
    toProto(message) {
        return VersionParams.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/tendermint.types.VersionParams',
            value: VersionParams.encode(message).finish(),
        };
    },
};
function createBaseHashedParams() {
    return {
        blockMaxBytes: BigInt(0),
        blockMaxGas: BigInt(0),
    };
}
export const HashedParams = {
    typeUrl: '/tendermint.types.HashedParams',
    encode(message, writer = BinaryWriter.create()) {
        if (message.blockMaxBytes !== BigInt(0)) {
            writer.uint32(8).int64(message.blockMaxBytes);
        }
        if (message.blockMaxGas !== BigInt(0)) {
            writer.uint32(16).int64(message.blockMaxGas);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseHashedParams();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.blockMaxBytes = reader.int64();
                    break;
                case 2:
                    message.blockMaxGas = reader.int64();
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
            blockMaxBytes: isSet(object.blockMaxBytes)
                ? BigInt(object.blockMaxBytes.toString())
                : BigInt(0),
            blockMaxGas: isSet(object.blockMaxGas)
                ? BigInt(object.blockMaxGas.toString())
                : BigInt(0),
        };
    },
    toJSON(message) {
        const obj = {};
        message.blockMaxBytes !== undefined &&
            (obj.blockMaxBytes = (message.blockMaxBytes || BigInt(0)).toString());
        message.blockMaxGas !== undefined &&
            (obj.blockMaxGas = (message.blockMaxGas || BigInt(0)).toString());
        return obj;
    },
    fromPartial(object) {
        const message = createBaseHashedParams();
        message.blockMaxBytes =
            object.blockMaxBytes !== undefined && object.blockMaxBytes !== null
                ? BigInt(object.blockMaxBytes.toString())
                : BigInt(0);
        message.blockMaxGas =
            object.blockMaxGas !== undefined && object.blockMaxGas !== null
                ? BigInt(object.blockMaxGas.toString())
                : BigInt(0);
        return message;
    },
    fromProtoMsg(message) {
        return HashedParams.decode(message.value);
    },
    toProto(message) {
        return HashedParams.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/tendermint.types.HashedParams',
            value: HashedParams.encode(message).finish(),
        };
    },
};
//# sourceMappingURL=params.js.map