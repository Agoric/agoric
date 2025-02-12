//@ts-nocheck
import { ProposalExecutorResult, ProposalStatus, TallyResult, proposalExecutorResultFromJSON, proposalExecutorResultToJSON, proposalStatusFromJSON, proposalStatusToJSON, } from './types.js';
import { BinaryReader, BinaryWriter } from '../../../binary.js';
import { isSet } from '../../../helpers.js';
import {} from '../../../json-safe.js';
function createBaseEventCreateGroup() {
    return {
        groupId: BigInt(0),
    };
}
export const EventCreateGroup = {
    typeUrl: '/cosmos.group.v1.EventCreateGroup',
    encode(message, writer = BinaryWriter.create()) {
        if (message.groupId !== BigInt(0)) {
            writer.uint32(8).uint64(message.groupId);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseEventCreateGroup();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.groupId = reader.uint64();
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
            groupId: isSet(object.groupId)
                ? BigInt(object.groupId.toString())
                : BigInt(0),
        };
    },
    toJSON(message) {
        const obj = {};
        message.groupId !== undefined &&
            (obj.groupId = (message.groupId || BigInt(0)).toString());
        return obj;
    },
    fromPartial(object) {
        const message = createBaseEventCreateGroup();
        message.groupId =
            object.groupId !== undefined && object.groupId !== null
                ? BigInt(object.groupId.toString())
                : BigInt(0);
        return message;
    },
    fromProtoMsg(message) {
        return EventCreateGroup.decode(message.value);
    },
    toProto(message) {
        return EventCreateGroup.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.group.v1.EventCreateGroup',
            value: EventCreateGroup.encode(message).finish(),
        };
    },
};
function createBaseEventUpdateGroup() {
    return {
        groupId: BigInt(0),
    };
}
export const EventUpdateGroup = {
    typeUrl: '/cosmos.group.v1.EventUpdateGroup',
    encode(message, writer = BinaryWriter.create()) {
        if (message.groupId !== BigInt(0)) {
            writer.uint32(8).uint64(message.groupId);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseEventUpdateGroup();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.groupId = reader.uint64();
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
            groupId: isSet(object.groupId)
                ? BigInt(object.groupId.toString())
                : BigInt(0),
        };
    },
    toJSON(message) {
        const obj = {};
        message.groupId !== undefined &&
            (obj.groupId = (message.groupId || BigInt(0)).toString());
        return obj;
    },
    fromPartial(object) {
        const message = createBaseEventUpdateGroup();
        message.groupId =
            object.groupId !== undefined && object.groupId !== null
                ? BigInt(object.groupId.toString())
                : BigInt(0);
        return message;
    },
    fromProtoMsg(message) {
        return EventUpdateGroup.decode(message.value);
    },
    toProto(message) {
        return EventUpdateGroup.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.group.v1.EventUpdateGroup',
            value: EventUpdateGroup.encode(message).finish(),
        };
    },
};
function createBaseEventCreateGroupPolicy() {
    return {
        address: '',
    };
}
export const EventCreateGroupPolicy = {
    typeUrl: '/cosmos.group.v1.EventCreateGroupPolicy',
    encode(message, writer = BinaryWriter.create()) {
        if (message.address !== '') {
            writer.uint32(10).string(message.address);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseEventCreateGroupPolicy();
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
        const message = createBaseEventCreateGroupPolicy();
        message.address = object.address ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return EventCreateGroupPolicy.decode(message.value);
    },
    toProto(message) {
        return EventCreateGroupPolicy.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.group.v1.EventCreateGroupPolicy',
            value: EventCreateGroupPolicy.encode(message).finish(),
        };
    },
};
function createBaseEventUpdateGroupPolicy() {
    return {
        address: '',
    };
}
export const EventUpdateGroupPolicy = {
    typeUrl: '/cosmos.group.v1.EventUpdateGroupPolicy',
    encode(message, writer = BinaryWriter.create()) {
        if (message.address !== '') {
            writer.uint32(10).string(message.address);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseEventUpdateGroupPolicy();
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
        const message = createBaseEventUpdateGroupPolicy();
        message.address = object.address ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return EventUpdateGroupPolicy.decode(message.value);
    },
    toProto(message) {
        return EventUpdateGroupPolicy.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.group.v1.EventUpdateGroupPolicy',
            value: EventUpdateGroupPolicy.encode(message).finish(),
        };
    },
};
function createBaseEventSubmitProposal() {
    return {
        proposalId: BigInt(0),
    };
}
export const EventSubmitProposal = {
    typeUrl: '/cosmos.group.v1.EventSubmitProposal',
    encode(message, writer = BinaryWriter.create()) {
        if (message.proposalId !== BigInt(0)) {
            writer.uint32(8).uint64(message.proposalId);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseEventSubmitProposal();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.proposalId = reader.uint64();
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
            proposalId: isSet(object.proposalId)
                ? BigInt(object.proposalId.toString())
                : BigInt(0),
        };
    },
    toJSON(message) {
        const obj = {};
        message.proposalId !== undefined &&
            (obj.proposalId = (message.proposalId || BigInt(0)).toString());
        return obj;
    },
    fromPartial(object) {
        const message = createBaseEventSubmitProposal();
        message.proposalId =
            object.proposalId !== undefined && object.proposalId !== null
                ? BigInt(object.proposalId.toString())
                : BigInt(0);
        return message;
    },
    fromProtoMsg(message) {
        return EventSubmitProposal.decode(message.value);
    },
    toProto(message) {
        return EventSubmitProposal.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.group.v1.EventSubmitProposal',
            value: EventSubmitProposal.encode(message).finish(),
        };
    },
};
function createBaseEventWithdrawProposal() {
    return {
        proposalId: BigInt(0),
    };
}
export const EventWithdrawProposal = {
    typeUrl: '/cosmos.group.v1.EventWithdrawProposal',
    encode(message, writer = BinaryWriter.create()) {
        if (message.proposalId !== BigInt(0)) {
            writer.uint32(8).uint64(message.proposalId);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseEventWithdrawProposal();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.proposalId = reader.uint64();
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
            proposalId: isSet(object.proposalId)
                ? BigInt(object.proposalId.toString())
                : BigInt(0),
        };
    },
    toJSON(message) {
        const obj = {};
        message.proposalId !== undefined &&
            (obj.proposalId = (message.proposalId || BigInt(0)).toString());
        return obj;
    },
    fromPartial(object) {
        const message = createBaseEventWithdrawProposal();
        message.proposalId =
            object.proposalId !== undefined && object.proposalId !== null
                ? BigInt(object.proposalId.toString())
                : BigInt(0);
        return message;
    },
    fromProtoMsg(message) {
        return EventWithdrawProposal.decode(message.value);
    },
    toProto(message) {
        return EventWithdrawProposal.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.group.v1.EventWithdrawProposal',
            value: EventWithdrawProposal.encode(message).finish(),
        };
    },
};
function createBaseEventVote() {
    return {
        proposalId: BigInt(0),
    };
}
export const EventVote = {
    typeUrl: '/cosmos.group.v1.EventVote',
    encode(message, writer = BinaryWriter.create()) {
        if (message.proposalId !== BigInt(0)) {
            writer.uint32(8).uint64(message.proposalId);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseEventVote();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.proposalId = reader.uint64();
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
            proposalId: isSet(object.proposalId)
                ? BigInt(object.proposalId.toString())
                : BigInt(0),
        };
    },
    toJSON(message) {
        const obj = {};
        message.proposalId !== undefined &&
            (obj.proposalId = (message.proposalId || BigInt(0)).toString());
        return obj;
    },
    fromPartial(object) {
        const message = createBaseEventVote();
        message.proposalId =
            object.proposalId !== undefined && object.proposalId !== null
                ? BigInt(object.proposalId.toString())
                : BigInt(0);
        return message;
    },
    fromProtoMsg(message) {
        return EventVote.decode(message.value);
    },
    toProto(message) {
        return EventVote.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.group.v1.EventVote',
            value: EventVote.encode(message).finish(),
        };
    },
};
function createBaseEventExec() {
    return {
        proposalId: BigInt(0),
        result: 0,
        logs: '',
    };
}
export const EventExec = {
    typeUrl: '/cosmos.group.v1.EventExec',
    encode(message, writer = BinaryWriter.create()) {
        if (message.proposalId !== BigInt(0)) {
            writer.uint32(8).uint64(message.proposalId);
        }
        if (message.result !== 0) {
            writer.uint32(16).int32(message.result);
        }
        if (message.logs !== '') {
            writer.uint32(26).string(message.logs);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseEventExec();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.proposalId = reader.uint64();
                    break;
                case 2:
                    message.result = reader.int32();
                    break;
                case 3:
                    message.logs = reader.string();
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
            proposalId: isSet(object.proposalId)
                ? BigInt(object.proposalId.toString())
                : BigInt(0),
            result: isSet(object.result)
                ? proposalExecutorResultFromJSON(object.result)
                : -1,
            logs: isSet(object.logs) ? String(object.logs) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.proposalId !== undefined &&
            (obj.proposalId = (message.proposalId || BigInt(0)).toString());
        message.result !== undefined &&
            (obj.result = proposalExecutorResultToJSON(message.result));
        message.logs !== undefined && (obj.logs = message.logs);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseEventExec();
        message.proposalId =
            object.proposalId !== undefined && object.proposalId !== null
                ? BigInt(object.proposalId.toString())
                : BigInt(0);
        message.result = object.result ?? 0;
        message.logs = object.logs ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return EventExec.decode(message.value);
    },
    toProto(message) {
        return EventExec.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.group.v1.EventExec',
            value: EventExec.encode(message).finish(),
        };
    },
};
function createBaseEventLeaveGroup() {
    return {
        groupId: BigInt(0),
        address: '',
    };
}
export const EventLeaveGroup = {
    typeUrl: '/cosmos.group.v1.EventLeaveGroup',
    encode(message, writer = BinaryWriter.create()) {
        if (message.groupId !== BigInt(0)) {
            writer.uint32(8).uint64(message.groupId);
        }
        if (message.address !== '') {
            writer.uint32(18).string(message.address);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseEventLeaveGroup();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.groupId = reader.uint64();
                    break;
                case 2:
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
            groupId: isSet(object.groupId)
                ? BigInt(object.groupId.toString())
                : BigInt(0),
            address: isSet(object.address) ? String(object.address) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.groupId !== undefined &&
            (obj.groupId = (message.groupId || BigInt(0)).toString());
        message.address !== undefined && (obj.address = message.address);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseEventLeaveGroup();
        message.groupId =
            object.groupId !== undefined && object.groupId !== null
                ? BigInt(object.groupId.toString())
                : BigInt(0);
        message.address = object.address ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return EventLeaveGroup.decode(message.value);
    },
    toProto(message) {
        return EventLeaveGroup.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.group.v1.EventLeaveGroup',
            value: EventLeaveGroup.encode(message).finish(),
        };
    },
};
function createBaseEventProposalPruned() {
    return {
        proposalId: BigInt(0),
        status: 0,
        tallyResult: undefined,
    };
}
export const EventProposalPruned = {
    typeUrl: '/cosmos.group.v1.EventProposalPruned',
    encode(message, writer = BinaryWriter.create()) {
        if (message.proposalId !== BigInt(0)) {
            writer.uint32(8).uint64(message.proposalId);
        }
        if (message.status !== 0) {
            writer.uint32(16).int32(message.status);
        }
        if (message.tallyResult !== undefined) {
            TallyResult.encode(message.tallyResult, writer.uint32(26).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseEventProposalPruned();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.proposalId = reader.uint64();
                    break;
                case 2:
                    message.status = reader.int32();
                    break;
                case 3:
                    message.tallyResult = TallyResult.decode(reader, reader.uint32());
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
            proposalId: isSet(object.proposalId)
                ? BigInt(object.proposalId.toString())
                : BigInt(0),
            status: isSet(object.status) ? proposalStatusFromJSON(object.status) : -1,
            tallyResult: isSet(object.tallyResult)
                ? TallyResult.fromJSON(object.tallyResult)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.proposalId !== undefined &&
            (obj.proposalId = (message.proposalId || BigInt(0)).toString());
        message.status !== undefined &&
            (obj.status = proposalStatusToJSON(message.status));
        message.tallyResult !== undefined &&
            (obj.tallyResult = message.tallyResult
                ? TallyResult.toJSON(message.tallyResult)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseEventProposalPruned();
        message.proposalId =
            object.proposalId !== undefined && object.proposalId !== null
                ? BigInt(object.proposalId.toString())
                : BigInt(0);
        message.status = object.status ?? 0;
        message.tallyResult =
            object.tallyResult !== undefined && object.tallyResult !== null
                ? TallyResult.fromPartial(object.tallyResult)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return EventProposalPruned.decode(message.value);
    },
    toProto(message) {
        return EventProposalPruned.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.group.v1.EventProposalPruned',
            value: EventProposalPruned.encode(message).finish(),
        };
    },
};
//# sourceMappingURL=events.js.map