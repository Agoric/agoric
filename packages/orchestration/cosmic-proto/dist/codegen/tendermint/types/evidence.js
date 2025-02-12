//@ts-nocheck
import { Vote, LightBlock, } from './types.js';
import { Timestamp, } from '../../google/protobuf/timestamp.js';
import { Validator } from './validator.js';
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { isSet, fromJsonTimestamp, fromTimestamp } from '../../helpers.js';
import {} from '../../json-safe.js';
function createBaseEvidence() {
    return {
        duplicateVoteEvidence: undefined,
        lightClientAttackEvidence: undefined,
    };
}
export const Evidence = {
    typeUrl: '/tendermint.types.Evidence',
    encode(message, writer = BinaryWriter.create()) {
        if (message.duplicateVoteEvidence !== undefined) {
            DuplicateVoteEvidence.encode(message.duplicateVoteEvidence, writer.uint32(10).fork()).ldelim();
        }
        if (message.lightClientAttackEvidence !== undefined) {
            LightClientAttackEvidence.encode(message.lightClientAttackEvidence, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseEvidence();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.duplicateVoteEvidence = DuplicateVoteEvidence.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.lightClientAttackEvidence = LightClientAttackEvidence.decode(reader, reader.uint32());
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
            duplicateVoteEvidence: isSet(object.duplicateVoteEvidence)
                ? DuplicateVoteEvidence.fromJSON(object.duplicateVoteEvidence)
                : undefined,
            lightClientAttackEvidence: isSet(object.lightClientAttackEvidence)
                ? LightClientAttackEvidence.fromJSON(object.lightClientAttackEvidence)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.duplicateVoteEvidence !== undefined &&
            (obj.duplicateVoteEvidence = message.duplicateVoteEvidence
                ? DuplicateVoteEvidence.toJSON(message.duplicateVoteEvidence)
                : undefined);
        message.lightClientAttackEvidence !== undefined &&
            (obj.lightClientAttackEvidence = message.lightClientAttackEvidence
                ? LightClientAttackEvidence.toJSON(message.lightClientAttackEvidence)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseEvidence();
        message.duplicateVoteEvidence =
            object.duplicateVoteEvidence !== undefined &&
                object.duplicateVoteEvidence !== null
                ? DuplicateVoteEvidence.fromPartial(object.duplicateVoteEvidence)
                : undefined;
        message.lightClientAttackEvidence =
            object.lightClientAttackEvidence !== undefined &&
                object.lightClientAttackEvidence !== null
                ? LightClientAttackEvidence.fromPartial(object.lightClientAttackEvidence)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return Evidence.decode(message.value);
    },
    toProto(message) {
        return Evidence.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/tendermint.types.Evidence',
            value: Evidence.encode(message).finish(),
        };
    },
};
function createBaseDuplicateVoteEvidence() {
    return {
        voteA: undefined,
        voteB: undefined,
        totalVotingPower: BigInt(0),
        validatorPower: BigInt(0),
        timestamp: Timestamp.fromPartial({}),
    };
}
export const DuplicateVoteEvidence = {
    typeUrl: '/tendermint.types.DuplicateVoteEvidence',
    encode(message, writer = BinaryWriter.create()) {
        if (message.voteA !== undefined) {
            Vote.encode(message.voteA, writer.uint32(10).fork()).ldelim();
        }
        if (message.voteB !== undefined) {
            Vote.encode(message.voteB, writer.uint32(18).fork()).ldelim();
        }
        if (message.totalVotingPower !== BigInt(0)) {
            writer.uint32(24).int64(message.totalVotingPower);
        }
        if (message.validatorPower !== BigInt(0)) {
            writer.uint32(32).int64(message.validatorPower);
        }
        if (message.timestamp !== undefined) {
            Timestamp.encode(message.timestamp, writer.uint32(42).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseDuplicateVoteEvidence();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.voteA = Vote.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.voteB = Vote.decode(reader, reader.uint32());
                    break;
                case 3:
                    message.totalVotingPower = reader.int64();
                    break;
                case 4:
                    message.validatorPower = reader.int64();
                    break;
                case 5:
                    message.timestamp = Timestamp.decode(reader, reader.uint32());
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
            voteA: isSet(object.voteA) ? Vote.fromJSON(object.voteA) : undefined,
            voteB: isSet(object.voteB) ? Vote.fromJSON(object.voteB) : undefined,
            totalVotingPower: isSet(object.totalVotingPower)
                ? BigInt(object.totalVotingPower.toString())
                : BigInt(0),
            validatorPower: isSet(object.validatorPower)
                ? BigInt(object.validatorPower.toString())
                : BigInt(0),
            timestamp: isSet(object.timestamp)
                ? fromJsonTimestamp(object.timestamp)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.voteA !== undefined &&
            (obj.voteA = message.voteA ? Vote.toJSON(message.voteA) : undefined);
        message.voteB !== undefined &&
            (obj.voteB = message.voteB ? Vote.toJSON(message.voteB) : undefined);
        message.totalVotingPower !== undefined &&
            (obj.totalVotingPower = (message.totalVotingPower || BigInt(0)).toString());
        message.validatorPower !== undefined &&
            (obj.validatorPower = (message.validatorPower || BigInt(0)).toString());
        message.timestamp !== undefined &&
            (obj.timestamp = fromTimestamp(message.timestamp).toISOString());
        return obj;
    },
    fromPartial(object) {
        const message = createBaseDuplicateVoteEvidence();
        message.voteA =
            object.voteA !== undefined && object.voteA !== null
                ? Vote.fromPartial(object.voteA)
                : undefined;
        message.voteB =
            object.voteB !== undefined && object.voteB !== null
                ? Vote.fromPartial(object.voteB)
                : undefined;
        message.totalVotingPower =
            object.totalVotingPower !== undefined && object.totalVotingPower !== null
                ? BigInt(object.totalVotingPower.toString())
                : BigInt(0);
        message.validatorPower =
            object.validatorPower !== undefined && object.validatorPower !== null
                ? BigInt(object.validatorPower.toString())
                : BigInt(0);
        message.timestamp =
            object.timestamp !== undefined && object.timestamp !== null
                ? Timestamp.fromPartial(object.timestamp)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return DuplicateVoteEvidence.decode(message.value);
    },
    toProto(message) {
        return DuplicateVoteEvidence.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/tendermint.types.DuplicateVoteEvidence',
            value: DuplicateVoteEvidence.encode(message).finish(),
        };
    },
};
function createBaseLightClientAttackEvidence() {
    return {
        conflictingBlock: undefined,
        commonHeight: BigInt(0),
        byzantineValidators: [],
        totalVotingPower: BigInt(0),
        timestamp: Timestamp.fromPartial({}),
    };
}
export const LightClientAttackEvidence = {
    typeUrl: '/tendermint.types.LightClientAttackEvidence',
    encode(message, writer = BinaryWriter.create()) {
        if (message.conflictingBlock !== undefined) {
            LightBlock.encode(message.conflictingBlock, writer.uint32(10).fork()).ldelim();
        }
        if (message.commonHeight !== BigInt(0)) {
            writer.uint32(16).int64(message.commonHeight);
        }
        for (const v of message.byzantineValidators) {
            Validator.encode(v, writer.uint32(26).fork()).ldelim();
        }
        if (message.totalVotingPower !== BigInt(0)) {
            writer.uint32(32).int64(message.totalVotingPower);
        }
        if (message.timestamp !== undefined) {
            Timestamp.encode(message.timestamp, writer.uint32(42).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseLightClientAttackEvidence();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.conflictingBlock = LightBlock.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.commonHeight = reader.int64();
                    break;
                case 3:
                    message.byzantineValidators.push(Validator.decode(reader, reader.uint32()));
                    break;
                case 4:
                    message.totalVotingPower = reader.int64();
                    break;
                case 5:
                    message.timestamp = Timestamp.decode(reader, reader.uint32());
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
            conflictingBlock: isSet(object.conflictingBlock)
                ? LightBlock.fromJSON(object.conflictingBlock)
                : undefined,
            commonHeight: isSet(object.commonHeight)
                ? BigInt(object.commonHeight.toString())
                : BigInt(0),
            byzantineValidators: Array.isArray(object?.byzantineValidators)
                ? object.byzantineValidators.map((e) => Validator.fromJSON(e))
                : [],
            totalVotingPower: isSet(object.totalVotingPower)
                ? BigInt(object.totalVotingPower.toString())
                : BigInt(0),
            timestamp: isSet(object.timestamp)
                ? fromJsonTimestamp(object.timestamp)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.conflictingBlock !== undefined &&
            (obj.conflictingBlock = message.conflictingBlock
                ? LightBlock.toJSON(message.conflictingBlock)
                : undefined);
        message.commonHeight !== undefined &&
            (obj.commonHeight = (message.commonHeight || BigInt(0)).toString());
        if (message.byzantineValidators) {
            obj.byzantineValidators = message.byzantineValidators.map(e => e ? Validator.toJSON(e) : undefined);
        }
        else {
            obj.byzantineValidators = [];
        }
        message.totalVotingPower !== undefined &&
            (obj.totalVotingPower = (message.totalVotingPower || BigInt(0)).toString());
        message.timestamp !== undefined &&
            (obj.timestamp = fromTimestamp(message.timestamp).toISOString());
        return obj;
    },
    fromPartial(object) {
        const message = createBaseLightClientAttackEvidence();
        message.conflictingBlock =
            object.conflictingBlock !== undefined && object.conflictingBlock !== null
                ? LightBlock.fromPartial(object.conflictingBlock)
                : undefined;
        message.commonHeight =
            object.commonHeight !== undefined && object.commonHeight !== null
                ? BigInt(object.commonHeight.toString())
                : BigInt(0);
        message.byzantineValidators =
            object.byzantineValidators?.map(e => Validator.fromPartial(e)) || [];
        message.totalVotingPower =
            object.totalVotingPower !== undefined && object.totalVotingPower !== null
                ? BigInt(object.totalVotingPower.toString())
                : BigInt(0);
        message.timestamp =
            object.timestamp !== undefined && object.timestamp !== null
                ? Timestamp.fromPartial(object.timestamp)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return LightClientAttackEvidence.decode(message.value);
    },
    toProto(message) {
        return LightClientAttackEvidence.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/tendermint.types.LightClientAttackEvidence',
            value: LightClientAttackEvidence.encode(message).finish(),
        };
    },
};
function createBaseEvidenceList() {
    return {
        evidence: [],
    };
}
export const EvidenceList = {
    typeUrl: '/tendermint.types.EvidenceList',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.evidence) {
            Evidence.encode(v, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseEvidenceList();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.evidence.push(Evidence.decode(reader, reader.uint32()));
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
            evidence: Array.isArray(object?.evidence)
                ? object.evidence.map((e) => Evidence.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.evidence) {
            obj.evidence = message.evidence.map(e => e ? Evidence.toJSON(e) : undefined);
        }
        else {
            obj.evidence = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseEvidenceList();
        message.evidence = object.evidence?.map(e => Evidence.fromPartial(e)) || [];
        return message;
    },
    fromProtoMsg(message) {
        return EvidenceList.decode(message.value);
    },
    toProto(message) {
        return EvidenceList.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/tendermint.types.EvidenceList',
            value: EvidenceList.encode(message).finish(),
        };
    },
};
//# sourceMappingURL=evidence.js.map