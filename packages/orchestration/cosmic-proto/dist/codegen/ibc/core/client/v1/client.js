//@ts-nocheck
import { Any } from '../../../../google/protobuf/any.js';
import { Plan, } from '../../../../cosmos/upgrade/v1beta1/upgrade.js';
import { BinaryReader, BinaryWriter } from '../../../../binary.js';
import { isSet } from '../../../../helpers.js';
import {} from '../../../../json-safe.js';
function createBaseIdentifiedClientState() {
    return {
        clientId: '',
        clientState: undefined,
    };
}
export const IdentifiedClientState = {
    typeUrl: '/ibc.core.client.v1.IdentifiedClientState',
    encode(message, writer = BinaryWriter.create()) {
        if (message.clientId !== '') {
            writer.uint32(10).string(message.clientId);
        }
        if (message.clientState !== undefined) {
            Any.encode(message.clientState, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseIdentifiedClientState();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.clientId = reader.string();
                    break;
                case 2:
                    message.clientState = Any.decode(reader, reader.uint32());
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
            clientState: isSet(object.clientState)
                ? Any.fromJSON(object.clientState)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.clientId !== undefined && (obj.clientId = message.clientId);
        message.clientState !== undefined &&
            (obj.clientState = message.clientState
                ? Any.toJSON(message.clientState)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseIdentifiedClientState();
        message.clientId = object.clientId ?? '';
        message.clientState =
            object.clientState !== undefined && object.clientState !== null
                ? Any.fromPartial(object.clientState)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return IdentifiedClientState.decode(message.value);
    },
    toProto(message) {
        return IdentifiedClientState.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.core.client.v1.IdentifiedClientState',
            value: IdentifiedClientState.encode(message).finish(),
        };
    },
};
function createBaseConsensusStateWithHeight() {
    return {
        height: Height.fromPartial({}),
        consensusState: undefined,
    };
}
export const ConsensusStateWithHeight = {
    typeUrl: '/ibc.core.client.v1.ConsensusStateWithHeight',
    encode(message, writer = BinaryWriter.create()) {
        if (message.height !== undefined) {
            Height.encode(message.height, writer.uint32(10).fork()).ldelim();
        }
        if (message.consensusState !== undefined) {
            Any.encode(message.consensusState, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseConsensusStateWithHeight();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.height = Height.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.consensusState = Any.decode(reader, reader.uint32());
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
            height: isSet(object.height) ? Height.fromJSON(object.height) : undefined,
            consensusState: isSet(object.consensusState)
                ? Any.fromJSON(object.consensusState)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.height !== undefined &&
            (obj.height = message.height ? Height.toJSON(message.height) : undefined);
        message.consensusState !== undefined &&
            (obj.consensusState = message.consensusState
                ? Any.toJSON(message.consensusState)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseConsensusStateWithHeight();
        message.height =
            object.height !== undefined && object.height !== null
                ? Height.fromPartial(object.height)
                : undefined;
        message.consensusState =
            object.consensusState !== undefined && object.consensusState !== null
                ? Any.fromPartial(object.consensusState)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return ConsensusStateWithHeight.decode(message.value);
    },
    toProto(message) {
        return ConsensusStateWithHeight.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.core.client.v1.ConsensusStateWithHeight',
            value: ConsensusStateWithHeight.encode(message).finish(),
        };
    },
};
function createBaseClientConsensusStates() {
    return {
        clientId: '',
        consensusStates: [],
    };
}
export const ClientConsensusStates = {
    typeUrl: '/ibc.core.client.v1.ClientConsensusStates',
    encode(message, writer = BinaryWriter.create()) {
        if (message.clientId !== '') {
            writer.uint32(10).string(message.clientId);
        }
        for (const v of message.consensusStates) {
            ConsensusStateWithHeight.encode(v, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseClientConsensusStates();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.clientId = reader.string();
                    break;
                case 2:
                    message.consensusStates.push(ConsensusStateWithHeight.decode(reader, reader.uint32()));
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
            consensusStates: Array.isArray(object?.consensusStates)
                ? object.consensusStates.map((e) => ConsensusStateWithHeight.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        message.clientId !== undefined && (obj.clientId = message.clientId);
        if (message.consensusStates) {
            obj.consensusStates = message.consensusStates.map(e => e ? ConsensusStateWithHeight.toJSON(e) : undefined);
        }
        else {
            obj.consensusStates = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseClientConsensusStates();
        message.clientId = object.clientId ?? '';
        message.consensusStates =
            object.consensusStates?.map(e => ConsensusStateWithHeight.fromPartial(e)) || [];
        return message;
    },
    fromProtoMsg(message) {
        return ClientConsensusStates.decode(message.value);
    },
    toProto(message) {
        return ClientConsensusStates.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.core.client.v1.ClientConsensusStates',
            value: ClientConsensusStates.encode(message).finish(),
        };
    },
};
function createBaseClientUpdateProposal() {
    return {
        $typeUrl: '/ibc.core.client.v1.ClientUpdateProposal',
        title: '',
        description: '',
        subjectClientId: '',
        substituteClientId: '',
    };
}
export const ClientUpdateProposal = {
    typeUrl: '/ibc.core.client.v1.ClientUpdateProposal',
    encode(message, writer = BinaryWriter.create()) {
        if (message.title !== '') {
            writer.uint32(10).string(message.title);
        }
        if (message.description !== '') {
            writer.uint32(18).string(message.description);
        }
        if (message.subjectClientId !== '') {
            writer.uint32(26).string(message.subjectClientId);
        }
        if (message.substituteClientId !== '') {
            writer.uint32(34).string(message.substituteClientId);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseClientUpdateProposal();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.title = reader.string();
                    break;
                case 2:
                    message.description = reader.string();
                    break;
                case 3:
                    message.subjectClientId = reader.string();
                    break;
                case 4:
                    message.substituteClientId = reader.string();
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
            title: isSet(object.title) ? String(object.title) : '',
            description: isSet(object.description) ? String(object.description) : '',
            subjectClientId: isSet(object.subjectClientId)
                ? String(object.subjectClientId)
                : '',
            substituteClientId: isSet(object.substituteClientId)
                ? String(object.substituteClientId)
                : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.title !== undefined && (obj.title = message.title);
        message.description !== undefined &&
            (obj.description = message.description);
        message.subjectClientId !== undefined &&
            (obj.subjectClientId = message.subjectClientId);
        message.substituteClientId !== undefined &&
            (obj.substituteClientId = message.substituteClientId);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseClientUpdateProposal();
        message.title = object.title ?? '';
        message.description = object.description ?? '';
        message.subjectClientId = object.subjectClientId ?? '';
        message.substituteClientId = object.substituteClientId ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return ClientUpdateProposal.decode(message.value);
    },
    toProto(message) {
        return ClientUpdateProposal.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.core.client.v1.ClientUpdateProposal',
            value: ClientUpdateProposal.encode(message).finish(),
        };
    },
};
function createBaseUpgradeProposal() {
    return {
        $typeUrl: '/ibc.core.client.v1.UpgradeProposal',
        title: '',
        description: '',
        plan: Plan.fromPartial({}),
        upgradedClientState: undefined,
    };
}
export const UpgradeProposal = {
    typeUrl: '/ibc.core.client.v1.UpgradeProposal',
    encode(message, writer = BinaryWriter.create()) {
        if (message.title !== '') {
            writer.uint32(10).string(message.title);
        }
        if (message.description !== '') {
            writer.uint32(18).string(message.description);
        }
        if (message.plan !== undefined) {
            Plan.encode(message.plan, writer.uint32(26).fork()).ldelim();
        }
        if (message.upgradedClientState !== undefined) {
            Any.encode(message.upgradedClientState, writer.uint32(34).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseUpgradeProposal();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.title = reader.string();
                    break;
                case 2:
                    message.description = reader.string();
                    break;
                case 3:
                    message.plan = Plan.decode(reader, reader.uint32());
                    break;
                case 4:
                    message.upgradedClientState = Any.decode(reader, reader.uint32());
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
            title: isSet(object.title) ? String(object.title) : '',
            description: isSet(object.description) ? String(object.description) : '',
            plan: isSet(object.plan) ? Plan.fromJSON(object.plan) : undefined,
            upgradedClientState: isSet(object.upgradedClientState)
                ? Any.fromJSON(object.upgradedClientState)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.title !== undefined && (obj.title = message.title);
        message.description !== undefined &&
            (obj.description = message.description);
        message.plan !== undefined &&
            (obj.plan = message.plan ? Plan.toJSON(message.plan) : undefined);
        message.upgradedClientState !== undefined &&
            (obj.upgradedClientState = message.upgradedClientState
                ? Any.toJSON(message.upgradedClientState)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseUpgradeProposal();
        message.title = object.title ?? '';
        message.description = object.description ?? '';
        message.plan =
            object.plan !== undefined && object.plan !== null
                ? Plan.fromPartial(object.plan)
                : undefined;
        message.upgradedClientState =
            object.upgradedClientState !== undefined &&
                object.upgradedClientState !== null
                ? Any.fromPartial(object.upgradedClientState)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return UpgradeProposal.decode(message.value);
    },
    toProto(message) {
        return UpgradeProposal.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.core.client.v1.UpgradeProposal',
            value: UpgradeProposal.encode(message).finish(),
        };
    },
};
function createBaseHeight() {
    return {
        revisionNumber: BigInt(0),
        revisionHeight: BigInt(0),
    };
}
export const Height = {
    typeUrl: '/ibc.core.client.v1.Height',
    encode(message, writer = BinaryWriter.create()) {
        if (message.revisionNumber !== BigInt(0)) {
            writer.uint32(8).uint64(message.revisionNumber);
        }
        if (message.revisionHeight !== BigInt(0)) {
            writer.uint32(16).uint64(message.revisionHeight);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseHeight();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.revisionNumber = reader.uint64();
                    break;
                case 2:
                    message.revisionHeight = reader.uint64();
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
            revisionNumber: isSet(object.revisionNumber)
                ? BigInt(object.revisionNumber.toString())
                : BigInt(0),
            revisionHeight: isSet(object.revisionHeight)
                ? BigInt(object.revisionHeight.toString())
                : BigInt(0),
        };
    },
    toJSON(message) {
        const obj = {};
        message.revisionNumber !== undefined &&
            (obj.revisionNumber = (message.revisionNumber || BigInt(0)).toString());
        message.revisionHeight !== undefined &&
            (obj.revisionHeight = (message.revisionHeight || BigInt(0)).toString());
        return obj;
    },
    fromPartial(object) {
        const message = createBaseHeight();
        message.revisionNumber =
            object.revisionNumber !== undefined && object.revisionNumber !== null
                ? BigInt(object.revisionNumber.toString())
                : BigInt(0);
        message.revisionHeight =
            object.revisionHeight !== undefined && object.revisionHeight !== null
                ? BigInt(object.revisionHeight.toString())
                : BigInt(0);
        return message;
    },
    fromProtoMsg(message) {
        return Height.decode(message.value);
    },
    toProto(message) {
        return Height.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.core.client.v1.Height',
            value: Height.encode(message).finish(),
        };
    },
};
function createBaseParams() {
    return {
        allowedClients: [],
    };
}
export const Params = {
    typeUrl: '/ibc.core.client.v1.Params',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.allowedClients) {
            writer.uint32(10).string(v);
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
                    message.allowedClients.push(reader.string());
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
            allowedClients: Array.isArray(object?.allowedClients)
                ? object.allowedClients.map((e) => String(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.allowedClients) {
            obj.allowedClients = message.allowedClients.map(e => e);
        }
        else {
            obj.allowedClients = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseParams();
        message.allowedClients = object.allowedClients?.map(e => e) || [];
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
            typeUrl: '/ibc.core.client.v1.Params',
            value: Params.encode(message).finish(),
        };
    },
};
//# sourceMappingURL=client.js.map