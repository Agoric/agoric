//@ts-nocheck
import { Duration, } from '../../../../google/protobuf/duration.js';
import { Height } from '../../../core/client/v1/client.js';
import { ProofSpec } from '../../../../proofs.js';
import { Timestamp, } from '../../../../google/protobuf/timestamp.js';
import { MerkleRoot, } from '../../../core/commitment/v1/commitment.js';
import { SignedHeader, } from '../../../../tendermint/types/types.js';
import { ValidatorSet, } from '../../../../tendermint/types/validator.js';
import { BinaryReader, BinaryWriter } from '../../../../binary.js';
import { isSet, fromJsonTimestamp, bytesFromBase64, fromTimestamp, base64FromBytes, } from '../../../../helpers.js';
import {} from '../../../../json-safe.js';
function createBaseClientState() {
    return {
        chainId: '',
        trustLevel: Fraction.fromPartial({}),
        trustingPeriod: Duration.fromPartial({}),
        unbondingPeriod: Duration.fromPartial({}),
        maxClockDrift: Duration.fromPartial({}),
        frozenHeight: Height.fromPartial({}),
        latestHeight: Height.fromPartial({}),
        proofSpecs: [],
        upgradePath: [],
        allowUpdateAfterExpiry: false,
        allowUpdateAfterMisbehaviour: false,
    };
}
export const ClientState = {
    typeUrl: '/ibc.lightclients.tendermint.v1.ClientState',
    encode(message, writer = BinaryWriter.create()) {
        if (message.chainId !== '') {
            writer.uint32(10).string(message.chainId);
        }
        if (message.trustLevel !== undefined) {
            Fraction.encode(message.trustLevel, writer.uint32(18).fork()).ldelim();
        }
        if (message.trustingPeriod !== undefined) {
            Duration.encode(message.trustingPeriod, writer.uint32(26).fork()).ldelim();
        }
        if (message.unbondingPeriod !== undefined) {
            Duration.encode(message.unbondingPeriod, writer.uint32(34).fork()).ldelim();
        }
        if (message.maxClockDrift !== undefined) {
            Duration.encode(message.maxClockDrift, writer.uint32(42).fork()).ldelim();
        }
        if (message.frozenHeight !== undefined) {
            Height.encode(message.frozenHeight, writer.uint32(50).fork()).ldelim();
        }
        if (message.latestHeight !== undefined) {
            Height.encode(message.latestHeight, writer.uint32(58).fork()).ldelim();
        }
        for (const v of message.proofSpecs) {
            ProofSpec.encode(v, writer.uint32(66).fork()).ldelim();
        }
        for (const v of message.upgradePath) {
            writer.uint32(74).string(v);
        }
        if (message.allowUpdateAfterExpiry === true) {
            writer.uint32(80).bool(message.allowUpdateAfterExpiry);
        }
        if (message.allowUpdateAfterMisbehaviour === true) {
            writer.uint32(88).bool(message.allowUpdateAfterMisbehaviour);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseClientState();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.chainId = reader.string();
                    break;
                case 2:
                    message.trustLevel = Fraction.decode(reader, reader.uint32());
                    break;
                case 3:
                    message.trustingPeriod = Duration.decode(reader, reader.uint32());
                    break;
                case 4:
                    message.unbondingPeriod = Duration.decode(reader, reader.uint32());
                    break;
                case 5:
                    message.maxClockDrift = Duration.decode(reader, reader.uint32());
                    break;
                case 6:
                    message.frozenHeight = Height.decode(reader, reader.uint32());
                    break;
                case 7:
                    message.latestHeight = Height.decode(reader, reader.uint32());
                    break;
                case 8:
                    message.proofSpecs.push(ProofSpec.decode(reader, reader.uint32()));
                    break;
                case 9:
                    message.upgradePath.push(reader.string());
                    break;
                case 10:
                    message.allowUpdateAfterExpiry = reader.bool();
                    break;
                case 11:
                    message.allowUpdateAfterMisbehaviour = reader.bool();
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
            chainId: isSet(object.chainId) ? String(object.chainId) : '',
            trustLevel: isSet(object.trustLevel)
                ? Fraction.fromJSON(object.trustLevel)
                : undefined,
            trustingPeriod: isSet(object.trustingPeriod)
                ? Duration.fromJSON(object.trustingPeriod)
                : undefined,
            unbondingPeriod: isSet(object.unbondingPeriod)
                ? Duration.fromJSON(object.unbondingPeriod)
                : undefined,
            maxClockDrift: isSet(object.maxClockDrift)
                ? Duration.fromJSON(object.maxClockDrift)
                : undefined,
            frozenHeight: isSet(object.frozenHeight)
                ? Height.fromJSON(object.frozenHeight)
                : undefined,
            latestHeight: isSet(object.latestHeight)
                ? Height.fromJSON(object.latestHeight)
                : undefined,
            proofSpecs: Array.isArray(object?.proofSpecs)
                ? object.proofSpecs.map((e) => ProofSpec.fromJSON(e))
                : [],
            upgradePath: Array.isArray(object?.upgradePath)
                ? object.upgradePath.map((e) => String(e))
                : [],
            allowUpdateAfterExpiry: isSet(object.allowUpdateAfterExpiry)
                ? Boolean(object.allowUpdateAfterExpiry)
                : false,
            allowUpdateAfterMisbehaviour: isSet(object.allowUpdateAfterMisbehaviour)
                ? Boolean(object.allowUpdateAfterMisbehaviour)
                : false,
        };
    },
    toJSON(message) {
        const obj = {};
        message.chainId !== undefined && (obj.chainId = message.chainId);
        message.trustLevel !== undefined &&
            (obj.trustLevel = message.trustLevel
                ? Fraction.toJSON(message.trustLevel)
                : undefined);
        message.trustingPeriod !== undefined &&
            (obj.trustingPeriod = message.trustingPeriod
                ? Duration.toJSON(message.trustingPeriod)
                : undefined);
        message.unbondingPeriod !== undefined &&
            (obj.unbondingPeriod = message.unbondingPeriod
                ? Duration.toJSON(message.unbondingPeriod)
                : undefined);
        message.maxClockDrift !== undefined &&
            (obj.maxClockDrift = message.maxClockDrift
                ? Duration.toJSON(message.maxClockDrift)
                : undefined);
        message.frozenHeight !== undefined &&
            (obj.frozenHeight = message.frozenHeight
                ? Height.toJSON(message.frozenHeight)
                : undefined);
        message.latestHeight !== undefined &&
            (obj.latestHeight = message.latestHeight
                ? Height.toJSON(message.latestHeight)
                : undefined);
        if (message.proofSpecs) {
            obj.proofSpecs = message.proofSpecs.map(e => e ? ProofSpec.toJSON(e) : undefined);
        }
        else {
            obj.proofSpecs = [];
        }
        if (message.upgradePath) {
            obj.upgradePath = message.upgradePath.map(e => e);
        }
        else {
            obj.upgradePath = [];
        }
        message.allowUpdateAfterExpiry !== undefined &&
            (obj.allowUpdateAfterExpiry = message.allowUpdateAfterExpiry);
        message.allowUpdateAfterMisbehaviour !== undefined &&
            (obj.allowUpdateAfterMisbehaviour = message.allowUpdateAfterMisbehaviour);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseClientState();
        message.chainId = object.chainId ?? '';
        message.trustLevel =
            object.trustLevel !== undefined && object.trustLevel !== null
                ? Fraction.fromPartial(object.trustLevel)
                : undefined;
        message.trustingPeriod =
            object.trustingPeriod !== undefined && object.trustingPeriod !== null
                ? Duration.fromPartial(object.trustingPeriod)
                : undefined;
        message.unbondingPeriod =
            object.unbondingPeriod !== undefined && object.unbondingPeriod !== null
                ? Duration.fromPartial(object.unbondingPeriod)
                : undefined;
        message.maxClockDrift =
            object.maxClockDrift !== undefined && object.maxClockDrift !== null
                ? Duration.fromPartial(object.maxClockDrift)
                : undefined;
        message.frozenHeight =
            object.frozenHeight !== undefined && object.frozenHeight !== null
                ? Height.fromPartial(object.frozenHeight)
                : undefined;
        message.latestHeight =
            object.latestHeight !== undefined && object.latestHeight !== null
                ? Height.fromPartial(object.latestHeight)
                : undefined;
        message.proofSpecs =
            object.proofSpecs?.map(e => ProofSpec.fromPartial(e)) || [];
        message.upgradePath = object.upgradePath?.map(e => e) || [];
        message.allowUpdateAfterExpiry = object.allowUpdateAfterExpiry ?? false;
        message.allowUpdateAfterMisbehaviour =
            object.allowUpdateAfterMisbehaviour ?? false;
        return message;
    },
    fromProtoMsg(message) {
        return ClientState.decode(message.value);
    },
    toProto(message) {
        return ClientState.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.lightclients.tendermint.v1.ClientState',
            value: ClientState.encode(message).finish(),
        };
    },
};
function createBaseConsensusState() {
    return {
        timestamp: Timestamp.fromPartial({}),
        root: MerkleRoot.fromPartial({}),
        nextValidatorsHash: new Uint8Array(),
    };
}
export const ConsensusState = {
    typeUrl: '/ibc.lightclients.tendermint.v1.ConsensusState',
    encode(message, writer = BinaryWriter.create()) {
        if (message.timestamp !== undefined) {
            Timestamp.encode(message.timestamp, writer.uint32(10).fork()).ldelim();
        }
        if (message.root !== undefined) {
            MerkleRoot.encode(message.root, writer.uint32(18).fork()).ldelim();
        }
        if (message.nextValidatorsHash.length !== 0) {
            writer.uint32(26).bytes(message.nextValidatorsHash);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseConsensusState();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.timestamp = Timestamp.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.root = MerkleRoot.decode(reader, reader.uint32());
                    break;
                case 3:
                    message.nextValidatorsHash = reader.bytes();
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
            timestamp: isSet(object.timestamp)
                ? fromJsonTimestamp(object.timestamp)
                : undefined,
            root: isSet(object.root) ? MerkleRoot.fromJSON(object.root) : undefined,
            nextValidatorsHash: isSet(object.nextValidatorsHash)
                ? bytesFromBase64(object.nextValidatorsHash)
                : new Uint8Array(),
        };
    },
    toJSON(message) {
        const obj = {};
        message.timestamp !== undefined &&
            (obj.timestamp = fromTimestamp(message.timestamp).toISOString());
        message.root !== undefined &&
            (obj.root = message.root ? MerkleRoot.toJSON(message.root) : undefined);
        message.nextValidatorsHash !== undefined &&
            (obj.nextValidatorsHash = base64FromBytes(message.nextValidatorsHash !== undefined
                ? message.nextValidatorsHash
                : new Uint8Array()));
        return obj;
    },
    fromPartial(object) {
        const message = createBaseConsensusState();
        message.timestamp =
            object.timestamp !== undefined && object.timestamp !== null
                ? Timestamp.fromPartial(object.timestamp)
                : undefined;
        message.root =
            object.root !== undefined && object.root !== null
                ? MerkleRoot.fromPartial(object.root)
                : undefined;
        message.nextValidatorsHash = object.nextValidatorsHash ?? new Uint8Array();
        return message;
    },
    fromProtoMsg(message) {
        return ConsensusState.decode(message.value);
    },
    toProto(message) {
        return ConsensusState.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.lightclients.tendermint.v1.ConsensusState',
            value: ConsensusState.encode(message).finish(),
        };
    },
};
function createBaseMisbehaviour() {
    return {
        clientId: '',
        header1: undefined,
        header2: undefined,
    };
}
export const Misbehaviour = {
    typeUrl: '/ibc.lightclients.tendermint.v1.Misbehaviour',
    encode(message, writer = BinaryWriter.create()) {
        if (message.clientId !== '') {
            writer.uint32(10).string(message.clientId);
        }
        if (message.header1 !== undefined) {
            Header.encode(message.header1, writer.uint32(18).fork()).ldelim();
        }
        if (message.header2 !== undefined) {
            Header.encode(message.header2, writer.uint32(26).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMisbehaviour();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.clientId = reader.string();
                    break;
                case 2:
                    message.header1 = Header.decode(reader, reader.uint32());
                    break;
                case 3:
                    message.header2 = Header.decode(reader, reader.uint32());
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
            clientId: isSet(object.clientId) ? String(object.clientId) : '',
            header1: isSet(object.header1)
                ? Header.fromJSON(object.header1)
                : undefined,
            header2: isSet(object.header2)
                ? Header.fromJSON(object.header2)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.clientId !== undefined && (obj.clientId = message.clientId);
        message.header1 !== undefined &&
            (obj.header1 = message.header1
                ? Header.toJSON(message.header1)
                : undefined);
        message.header2 !== undefined &&
            (obj.header2 = message.header2
                ? Header.toJSON(message.header2)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMisbehaviour();
        message.clientId = object.clientId ?? '';
        message.header1 =
            object.header1 !== undefined && object.header1 !== null
                ? Header.fromPartial(object.header1)
                : undefined;
        message.header2 =
            object.header2 !== undefined && object.header2 !== null
                ? Header.fromPartial(object.header2)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return Misbehaviour.decode(message.value);
    },
    toProto(message) {
        return Misbehaviour.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.lightclients.tendermint.v1.Misbehaviour',
            value: Misbehaviour.encode(message).finish(),
        };
    },
};
function createBaseHeader() {
    return {
        signedHeader: undefined,
        validatorSet: undefined,
        trustedHeight: Height.fromPartial({}),
        trustedValidators: undefined,
    };
}
export const Header = {
    typeUrl: '/ibc.lightclients.tendermint.v1.Header',
    encode(message, writer = BinaryWriter.create()) {
        if (message.signedHeader !== undefined) {
            SignedHeader.encode(message.signedHeader, writer.uint32(10).fork()).ldelim();
        }
        if (message.validatorSet !== undefined) {
            ValidatorSet.encode(message.validatorSet, writer.uint32(18).fork()).ldelim();
        }
        if (message.trustedHeight !== undefined) {
            Height.encode(message.trustedHeight, writer.uint32(26).fork()).ldelim();
        }
        if (message.trustedValidators !== undefined) {
            ValidatorSet.encode(message.trustedValidators, writer.uint32(34).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseHeader();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.signedHeader = SignedHeader.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.validatorSet = ValidatorSet.decode(reader, reader.uint32());
                    break;
                case 3:
                    message.trustedHeight = Height.decode(reader, reader.uint32());
                    break;
                case 4:
                    message.trustedValidators = ValidatorSet.decode(reader, reader.uint32());
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
            signedHeader: isSet(object.signedHeader)
                ? SignedHeader.fromJSON(object.signedHeader)
                : undefined,
            validatorSet: isSet(object.validatorSet)
                ? ValidatorSet.fromJSON(object.validatorSet)
                : undefined,
            trustedHeight: isSet(object.trustedHeight)
                ? Height.fromJSON(object.trustedHeight)
                : undefined,
            trustedValidators: isSet(object.trustedValidators)
                ? ValidatorSet.fromJSON(object.trustedValidators)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.signedHeader !== undefined &&
            (obj.signedHeader = message.signedHeader
                ? SignedHeader.toJSON(message.signedHeader)
                : undefined);
        message.validatorSet !== undefined &&
            (obj.validatorSet = message.validatorSet
                ? ValidatorSet.toJSON(message.validatorSet)
                : undefined);
        message.trustedHeight !== undefined &&
            (obj.trustedHeight = message.trustedHeight
                ? Height.toJSON(message.trustedHeight)
                : undefined);
        message.trustedValidators !== undefined &&
            (obj.trustedValidators = message.trustedValidators
                ? ValidatorSet.toJSON(message.trustedValidators)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseHeader();
        message.signedHeader =
            object.signedHeader !== undefined && object.signedHeader !== null
                ? SignedHeader.fromPartial(object.signedHeader)
                : undefined;
        message.validatorSet =
            object.validatorSet !== undefined && object.validatorSet !== null
                ? ValidatorSet.fromPartial(object.validatorSet)
                : undefined;
        message.trustedHeight =
            object.trustedHeight !== undefined && object.trustedHeight !== null
                ? Height.fromPartial(object.trustedHeight)
                : undefined;
        message.trustedValidators =
            object.trustedValidators !== undefined &&
                object.trustedValidators !== null
                ? ValidatorSet.fromPartial(object.trustedValidators)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return Header.decode(message.value);
    },
    toProto(message) {
        return Header.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.lightclients.tendermint.v1.Header',
            value: Header.encode(message).finish(),
        };
    },
};
function createBaseFraction() {
    return {
        numerator: BigInt(0),
        denominator: BigInt(0),
    };
}
export const Fraction = {
    typeUrl: '/ibc.lightclients.tendermint.v1.Fraction',
    encode(message, writer = BinaryWriter.create()) {
        if (message.numerator !== BigInt(0)) {
            writer.uint32(8).uint64(message.numerator);
        }
        if (message.denominator !== BigInt(0)) {
            writer.uint32(16).uint64(message.denominator);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseFraction();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.numerator = reader.uint64();
                    break;
                case 2:
                    message.denominator = reader.uint64();
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
            numerator: isSet(object.numerator)
                ? BigInt(object.numerator.toString())
                : BigInt(0),
            denominator: isSet(object.denominator)
                ? BigInt(object.denominator.toString())
                : BigInt(0),
        };
    },
    toJSON(message) {
        const obj = {};
        message.numerator !== undefined &&
            (obj.numerator = (message.numerator || BigInt(0)).toString());
        message.denominator !== undefined &&
            (obj.denominator = (message.denominator || BigInt(0)).toString());
        return obj;
    },
    fromPartial(object) {
        const message = createBaseFraction();
        message.numerator =
            object.numerator !== undefined && object.numerator !== null
                ? BigInt(object.numerator.toString())
                : BigInt(0);
        message.denominator =
            object.denominator !== undefined && object.denominator !== null
                ? BigInt(object.denominator.toString())
                : BigInt(0);
        return message;
    },
    fromProtoMsg(message) {
        return Fraction.decode(message.value);
    },
    toProto(message) {
        return Fraction.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.lightclients.tendermint.v1.Fraction',
            value: Fraction.encode(message).finish(),
        };
    },
};
//# sourceMappingURL=tendermint.js.map