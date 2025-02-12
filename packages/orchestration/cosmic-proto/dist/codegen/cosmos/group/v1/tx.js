//@ts-nocheck
import { MemberRequest, VoteOption, ProposalExecutorResult, voteOptionFromJSON, voteOptionToJSON, proposalExecutorResultFromJSON, proposalExecutorResultToJSON, } from './types.js';
import { Any } from '../../../google/protobuf/any.js';
import { BinaryReader, BinaryWriter } from '../../../binary.js';
import { isSet } from '../../../helpers.js';
import {} from '../../../json-safe.js';
/** Exec defines modes of execution of a proposal on creation or on new vote. */
export var Exec;
(function (Exec) {
    /**
     * EXEC_UNSPECIFIED - An empty value means that there should be a separate
     * MsgExec request for the proposal to execute.
     */
    Exec[Exec["EXEC_UNSPECIFIED"] = 0] = "EXEC_UNSPECIFIED";
    /**
     * EXEC_TRY - Try to execute the proposal immediately.
     * If the proposal is not allowed per the DecisionPolicy,
     * the proposal will still be open and could
     * be executed at a later point.
     */
    Exec[Exec["EXEC_TRY"] = 1] = "EXEC_TRY";
    Exec[Exec["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
})(Exec || (Exec = {}));
export const ExecSDKType = Exec;
export function execFromJSON(object) {
    switch (object) {
        case 0:
        case 'EXEC_UNSPECIFIED':
            return Exec.EXEC_UNSPECIFIED;
        case 1:
        case 'EXEC_TRY':
            return Exec.EXEC_TRY;
        case -1:
        case 'UNRECOGNIZED':
        default:
            return Exec.UNRECOGNIZED;
    }
}
export function execToJSON(object) {
    switch (object) {
        case Exec.EXEC_UNSPECIFIED:
            return 'EXEC_UNSPECIFIED';
        case Exec.EXEC_TRY:
            return 'EXEC_TRY';
        case Exec.UNRECOGNIZED:
        default:
            return 'UNRECOGNIZED';
    }
}
function createBaseMsgCreateGroup() {
    return {
        admin: '',
        members: [],
        metadata: '',
    };
}
export const MsgCreateGroup = {
    typeUrl: '/cosmos.group.v1.MsgCreateGroup',
    encode(message, writer = BinaryWriter.create()) {
        if (message.admin !== '') {
            writer.uint32(10).string(message.admin);
        }
        for (const v of message.members) {
            MemberRequest.encode(v, writer.uint32(18).fork()).ldelim();
        }
        if (message.metadata !== '') {
            writer.uint32(26).string(message.metadata);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgCreateGroup();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.admin = reader.string();
                    break;
                case 2:
                    message.members.push(MemberRequest.decode(reader, reader.uint32()));
                    break;
                case 3:
                    message.metadata = reader.string();
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
            admin: isSet(object.admin) ? String(object.admin) : '',
            members: Array.isArray(object?.members)
                ? object.members.map((e) => MemberRequest.fromJSON(e))
                : [],
            metadata: isSet(object.metadata) ? String(object.metadata) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.admin !== undefined && (obj.admin = message.admin);
        if (message.members) {
            obj.members = message.members.map(e => e ? MemberRequest.toJSON(e) : undefined);
        }
        else {
            obj.members = [];
        }
        message.metadata !== undefined && (obj.metadata = message.metadata);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgCreateGroup();
        message.admin = object.admin ?? '';
        message.members =
            object.members?.map(e => MemberRequest.fromPartial(e)) || [];
        message.metadata = object.metadata ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return MsgCreateGroup.decode(message.value);
    },
    toProto(message) {
        return MsgCreateGroup.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.group.v1.MsgCreateGroup',
            value: MsgCreateGroup.encode(message).finish(),
        };
    },
};
function createBaseMsgCreateGroupResponse() {
    return {
        groupId: BigInt(0),
    };
}
export const MsgCreateGroupResponse = {
    typeUrl: '/cosmos.group.v1.MsgCreateGroupResponse',
    encode(message, writer = BinaryWriter.create()) {
        if (message.groupId !== BigInt(0)) {
            writer.uint32(8).uint64(message.groupId);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgCreateGroupResponse();
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
        const message = createBaseMsgCreateGroupResponse();
        message.groupId =
            object.groupId !== undefined && object.groupId !== null
                ? BigInt(object.groupId.toString())
                : BigInt(0);
        return message;
    },
    fromProtoMsg(message) {
        return MsgCreateGroupResponse.decode(message.value);
    },
    toProto(message) {
        return MsgCreateGroupResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.group.v1.MsgCreateGroupResponse',
            value: MsgCreateGroupResponse.encode(message).finish(),
        };
    },
};
function createBaseMsgUpdateGroupMembers() {
    return {
        admin: '',
        groupId: BigInt(0),
        memberUpdates: [],
    };
}
export const MsgUpdateGroupMembers = {
    typeUrl: '/cosmos.group.v1.MsgUpdateGroupMembers',
    encode(message, writer = BinaryWriter.create()) {
        if (message.admin !== '') {
            writer.uint32(10).string(message.admin);
        }
        if (message.groupId !== BigInt(0)) {
            writer.uint32(16).uint64(message.groupId);
        }
        for (const v of message.memberUpdates) {
            MemberRequest.encode(v, writer.uint32(26).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgUpdateGroupMembers();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.admin = reader.string();
                    break;
                case 2:
                    message.groupId = reader.uint64();
                    break;
                case 3:
                    message.memberUpdates.push(MemberRequest.decode(reader, reader.uint32()));
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
            admin: isSet(object.admin) ? String(object.admin) : '',
            groupId: isSet(object.groupId)
                ? BigInt(object.groupId.toString())
                : BigInt(0),
            memberUpdates: Array.isArray(object?.memberUpdates)
                ? object.memberUpdates.map((e) => MemberRequest.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        message.admin !== undefined && (obj.admin = message.admin);
        message.groupId !== undefined &&
            (obj.groupId = (message.groupId || BigInt(0)).toString());
        if (message.memberUpdates) {
            obj.memberUpdates = message.memberUpdates.map(e => e ? MemberRequest.toJSON(e) : undefined);
        }
        else {
            obj.memberUpdates = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgUpdateGroupMembers();
        message.admin = object.admin ?? '';
        message.groupId =
            object.groupId !== undefined && object.groupId !== null
                ? BigInt(object.groupId.toString())
                : BigInt(0);
        message.memberUpdates =
            object.memberUpdates?.map(e => MemberRequest.fromPartial(e)) || [];
        return message;
    },
    fromProtoMsg(message) {
        return MsgUpdateGroupMembers.decode(message.value);
    },
    toProto(message) {
        return MsgUpdateGroupMembers.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.group.v1.MsgUpdateGroupMembers',
            value: MsgUpdateGroupMembers.encode(message).finish(),
        };
    },
};
function createBaseMsgUpdateGroupMembersResponse() {
    return {};
}
export const MsgUpdateGroupMembersResponse = {
    typeUrl: '/cosmos.group.v1.MsgUpdateGroupMembersResponse',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgUpdateGroupMembersResponse();
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
        const message = createBaseMsgUpdateGroupMembersResponse();
        return message;
    },
    fromProtoMsg(message) {
        return MsgUpdateGroupMembersResponse.decode(message.value);
    },
    toProto(message) {
        return MsgUpdateGroupMembersResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.group.v1.MsgUpdateGroupMembersResponse',
            value: MsgUpdateGroupMembersResponse.encode(message).finish(),
        };
    },
};
function createBaseMsgUpdateGroupAdmin() {
    return {
        admin: '',
        groupId: BigInt(0),
        newAdmin: '',
    };
}
export const MsgUpdateGroupAdmin = {
    typeUrl: '/cosmos.group.v1.MsgUpdateGroupAdmin',
    encode(message, writer = BinaryWriter.create()) {
        if (message.admin !== '') {
            writer.uint32(10).string(message.admin);
        }
        if (message.groupId !== BigInt(0)) {
            writer.uint32(16).uint64(message.groupId);
        }
        if (message.newAdmin !== '') {
            writer.uint32(26).string(message.newAdmin);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgUpdateGroupAdmin();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.admin = reader.string();
                    break;
                case 2:
                    message.groupId = reader.uint64();
                    break;
                case 3:
                    message.newAdmin = reader.string();
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
            admin: isSet(object.admin) ? String(object.admin) : '',
            groupId: isSet(object.groupId)
                ? BigInt(object.groupId.toString())
                : BigInt(0),
            newAdmin: isSet(object.newAdmin) ? String(object.newAdmin) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.admin !== undefined && (obj.admin = message.admin);
        message.groupId !== undefined &&
            (obj.groupId = (message.groupId || BigInt(0)).toString());
        message.newAdmin !== undefined && (obj.newAdmin = message.newAdmin);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgUpdateGroupAdmin();
        message.admin = object.admin ?? '';
        message.groupId =
            object.groupId !== undefined && object.groupId !== null
                ? BigInt(object.groupId.toString())
                : BigInt(0);
        message.newAdmin = object.newAdmin ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return MsgUpdateGroupAdmin.decode(message.value);
    },
    toProto(message) {
        return MsgUpdateGroupAdmin.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.group.v1.MsgUpdateGroupAdmin',
            value: MsgUpdateGroupAdmin.encode(message).finish(),
        };
    },
};
function createBaseMsgUpdateGroupAdminResponse() {
    return {};
}
export const MsgUpdateGroupAdminResponse = {
    typeUrl: '/cosmos.group.v1.MsgUpdateGroupAdminResponse',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgUpdateGroupAdminResponse();
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
        const message = createBaseMsgUpdateGroupAdminResponse();
        return message;
    },
    fromProtoMsg(message) {
        return MsgUpdateGroupAdminResponse.decode(message.value);
    },
    toProto(message) {
        return MsgUpdateGroupAdminResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.group.v1.MsgUpdateGroupAdminResponse',
            value: MsgUpdateGroupAdminResponse.encode(message).finish(),
        };
    },
};
function createBaseMsgUpdateGroupMetadata() {
    return {
        admin: '',
        groupId: BigInt(0),
        metadata: '',
    };
}
export const MsgUpdateGroupMetadata = {
    typeUrl: '/cosmos.group.v1.MsgUpdateGroupMetadata',
    encode(message, writer = BinaryWriter.create()) {
        if (message.admin !== '') {
            writer.uint32(10).string(message.admin);
        }
        if (message.groupId !== BigInt(0)) {
            writer.uint32(16).uint64(message.groupId);
        }
        if (message.metadata !== '') {
            writer.uint32(26).string(message.metadata);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgUpdateGroupMetadata();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.admin = reader.string();
                    break;
                case 2:
                    message.groupId = reader.uint64();
                    break;
                case 3:
                    message.metadata = reader.string();
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
            admin: isSet(object.admin) ? String(object.admin) : '',
            groupId: isSet(object.groupId)
                ? BigInt(object.groupId.toString())
                : BigInt(0),
            metadata: isSet(object.metadata) ? String(object.metadata) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.admin !== undefined && (obj.admin = message.admin);
        message.groupId !== undefined &&
            (obj.groupId = (message.groupId || BigInt(0)).toString());
        message.metadata !== undefined && (obj.metadata = message.metadata);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgUpdateGroupMetadata();
        message.admin = object.admin ?? '';
        message.groupId =
            object.groupId !== undefined && object.groupId !== null
                ? BigInt(object.groupId.toString())
                : BigInt(0);
        message.metadata = object.metadata ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return MsgUpdateGroupMetadata.decode(message.value);
    },
    toProto(message) {
        return MsgUpdateGroupMetadata.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.group.v1.MsgUpdateGroupMetadata',
            value: MsgUpdateGroupMetadata.encode(message).finish(),
        };
    },
};
function createBaseMsgUpdateGroupMetadataResponse() {
    return {};
}
export const MsgUpdateGroupMetadataResponse = {
    typeUrl: '/cosmos.group.v1.MsgUpdateGroupMetadataResponse',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgUpdateGroupMetadataResponse();
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
        const message = createBaseMsgUpdateGroupMetadataResponse();
        return message;
    },
    fromProtoMsg(message) {
        return MsgUpdateGroupMetadataResponse.decode(message.value);
    },
    toProto(message) {
        return MsgUpdateGroupMetadataResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.group.v1.MsgUpdateGroupMetadataResponse',
            value: MsgUpdateGroupMetadataResponse.encode(message).finish(),
        };
    },
};
function createBaseMsgCreateGroupPolicy() {
    return {
        admin: '',
        groupId: BigInt(0),
        metadata: '',
        decisionPolicy: undefined,
    };
}
export const MsgCreateGroupPolicy = {
    typeUrl: '/cosmos.group.v1.MsgCreateGroupPolicy',
    encode(message, writer = BinaryWriter.create()) {
        if (message.admin !== '') {
            writer.uint32(10).string(message.admin);
        }
        if (message.groupId !== BigInt(0)) {
            writer.uint32(16).uint64(message.groupId);
        }
        if (message.metadata !== '') {
            writer.uint32(26).string(message.metadata);
        }
        if (message.decisionPolicy !== undefined) {
            Any.encode(message.decisionPolicy, writer.uint32(34).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgCreateGroupPolicy();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.admin = reader.string();
                    break;
                case 2:
                    message.groupId = reader.uint64();
                    break;
                case 3:
                    message.metadata = reader.string();
                    break;
                case 4:
                    message.decisionPolicy =
                        Cosmos_groupv1DecisionPolicy_InterfaceDecoder(reader);
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
            admin: isSet(object.admin) ? String(object.admin) : '',
            groupId: isSet(object.groupId)
                ? BigInt(object.groupId.toString())
                : BigInt(0),
            metadata: isSet(object.metadata) ? String(object.metadata) : '',
            decisionPolicy: isSet(object.decisionPolicy)
                ? Any.fromJSON(object.decisionPolicy)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.admin !== undefined && (obj.admin = message.admin);
        message.groupId !== undefined &&
            (obj.groupId = (message.groupId || BigInt(0)).toString());
        message.metadata !== undefined && (obj.metadata = message.metadata);
        message.decisionPolicy !== undefined &&
            (obj.decisionPolicy = message.decisionPolicy
                ? Any.toJSON(message.decisionPolicy)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgCreateGroupPolicy();
        message.admin = object.admin ?? '';
        message.groupId =
            object.groupId !== undefined && object.groupId !== null
                ? BigInt(object.groupId.toString())
                : BigInt(0);
        message.metadata = object.metadata ?? '';
        message.decisionPolicy =
            object.decisionPolicy !== undefined && object.decisionPolicy !== null
                ? Any.fromPartial(object.decisionPolicy)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return MsgCreateGroupPolicy.decode(message.value);
    },
    toProto(message) {
        return MsgCreateGroupPolicy.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.group.v1.MsgCreateGroupPolicy',
            value: MsgCreateGroupPolicy.encode(message).finish(),
        };
    },
};
function createBaseMsgCreateGroupPolicyResponse() {
    return {
        address: '',
    };
}
export const MsgCreateGroupPolicyResponse = {
    typeUrl: '/cosmos.group.v1.MsgCreateGroupPolicyResponse',
    encode(message, writer = BinaryWriter.create()) {
        if (message.address !== '') {
            writer.uint32(10).string(message.address);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgCreateGroupPolicyResponse();
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
        const message = createBaseMsgCreateGroupPolicyResponse();
        message.address = object.address ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return MsgCreateGroupPolicyResponse.decode(message.value);
    },
    toProto(message) {
        return MsgCreateGroupPolicyResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.group.v1.MsgCreateGroupPolicyResponse',
            value: MsgCreateGroupPolicyResponse.encode(message).finish(),
        };
    },
};
function createBaseMsgUpdateGroupPolicyAdmin() {
    return {
        admin: '',
        groupPolicyAddress: '',
        newAdmin: '',
    };
}
export const MsgUpdateGroupPolicyAdmin = {
    typeUrl: '/cosmos.group.v1.MsgUpdateGroupPolicyAdmin',
    encode(message, writer = BinaryWriter.create()) {
        if (message.admin !== '') {
            writer.uint32(10).string(message.admin);
        }
        if (message.groupPolicyAddress !== '') {
            writer.uint32(18).string(message.groupPolicyAddress);
        }
        if (message.newAdmin !== '') {
            writer.uint32(26).string(message.newAdmin);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgUpdateGroupPolicyAdmin();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.admin = reader.string();
                    break;
                case 2:
                    message.groupPolicyAddress = reader.string();
                    break;
                case 3:
                    message.newAdmin = reader.string();
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
            admin: isSet(object.admin) ? String(object.admin) : '',
            groupPolicyAddress: isSet(object.groupPolicyAddress)
                ? String(object.groupPolicyAddress)
                : '',
            newAdmin: isSet(object.newAdmin) ? String(object.newAdmin) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.admin !== undefined && (obj.admin = message.admin);
        message.groupPolicyAddress !== undefined &&
            (obj.groupPolicyAddress = message.groupPolicyAddress);
        message.newAdmin !== undefined && (obj.newAdmin = message.newAdmin);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgUpdateGroupPolicyAdmin();
        message.admin = object.admin ?? '';
        message.groupPolicyAddress = object.groupPolicyAddress ?? '';
        message.newAdmin = object.newAdmin ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return MsgUpdateGroupPolicyAdmin.decode(message.value);
    },
    toProto(message) {
        return MsgUpdateGroupPolicyAdmin.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.group.v1.MsgUpdateGroupPolicyAdmin',
            value: MsgUpdateGroupPolicyAdmin.encode(message).finish(),
        };
    },
};
function createBaseMsgCreateGroupWithPolicy() {
    return {
        admin: '',
        members: [],
        groupMetadata: '',
        groupPolicyMetadata: '',
        groupPolicyAsAdmin: false,
        decisionPolicy: undefined,
    };
}
export const MsgCreateGroupWithPolicy = {
    typeUrl: '/cosmos.group.v1.MsgCreateGroupWithPolicy',
    encode(message, writer = BinaryWriter.create()) {
        if (message.admin !== '') {
            writer.uint32(10).string(message.admin);
        }
        for (const v of message.members) {
            MemberRequest.encode(v, writer.uint32(18).fork()).ldelim();
        }
        if (message.groupMetadata !== '') {
            writer.uint32(26).string(message.groupMetadata);
        }
        if (message.groupPolicyMetadata !== '') {
            writer.uint32(34).string(message.groupPolicyMetadata);
        }
        if (message.groupPolicyAsAdmin === true) {
            writer.uint32(40).bool(message.groupPolicyAsAdmin);
        }
        if (message.decisionPolicy !== undefined) {
            Any.encode(message.decisionPolicy, writer.uint32(50).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgCreateGroupWithPolicy();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.admin = reader.string();
                    break;
                case 2:
                    message.members.push(MemberRequest.decode(reader, reader.uint32()));
                    break;
                case 3:
                    message.groupMetadata = reader.string();
                    break;
                case 4:
                    message.groupPolicyMetadata = reader.string();
                    break;
                case 5:
                    message.groupPolicyAsAdmin = reader.bool();
                    break;
                case 6:
                    message.decisionPolicy =
                        Cosmos_groupv1DecisionPolicy_InterfaceDecoder(reader);
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
            admin: isSet(object.admin) ? String(object.admin) : '',
            members: Array.isArray(object?.members)
                ? object.members.map((e) => MemberRequest.fromJSON(e))
                : [],
            groupMetadata: isSet(object.groupMetadata)
                ? String(object.groupMetadata)
                : '',
            groupPolicyMetadata: isSet(object.groupPolicyMetadata)
                ? String(object.groupPolicyMetadata)
                : '',
            groupPolicyAsAdmin: isSet(object.groupPolicyAsAdmin)
                ? Boolean(object.groupPolicyAsAdmin)
                : false,
            decisionPolicy: isSet(object.decisionPolicy)
                ? Any.fromJSON(object.decisionPolicy)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.admin !== undefined && (obj.admin = message.admin);
        if (message.members) {
            obj.members = message.members.map(e => e ? MemberRequest.toJSON(e) : undefined);
        }
        else {
            obj.members = [];
        }
        message.groupMetadata !== undefined &&
            (obj.groupMetadata = message.groupMetadata);
        message.groupPolicyMetadata !== undefined &&
            (obj.groupPolicyMetadata = message.groupPolicyMetadata);
        message.groupPolicyAsAdmin !== undefined &&
            (obj.groupPolicyAsAdmin = message.groupPolicyAsAdmin);
        message.decisionPolicy !== undefined &&
            (obj.decisionPolicy = message.decisionPolicy
                ? Any.toJSON(message.decisionPolicy)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgCreateGroupWithPolicy();
        message.admin = object.admin ?? '';
        message.members =
            object.members?.map(e => MemberRequest.fromPartial(e)) || [];
        message.groupMetadata = object.groupMetadata ?? '';
        message.groupPolicyMetadata = object.groupPolicyMetadata ?? '';
        message.groupPolicyAsAdmin = object.groupPolicyAsAdmin ?? false;
        message.decisionPolicy =
            object.decisionPolicy !== undefined && object.decisionPolicy !== null
                ? Any.fromPartial(object.decisionPolicy)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return MsgCreateGroupWithPolicy.decode(message.value);
    },
    toProto(message) {
        return MsgCreateGroupWithPolicy.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.group.v1.MsgCreateGroupWithPolicy',
            value: MsgCreateGroupWithPolicy.encode(message).finish(),
        };
    },
};
function createBaseMsgCreateGroupWithPolicyResponse() {
    return {
        groupId: BigInt(0),
        groupPolicyAddress: '',
    };
}
export const MsgCreateGroupWithPolicyResponse = {
    typeUrl: '/cosmos.group.v1.MsgCreateGroupWithPolicyResponse',
    encode(message, writer = BinaryWriter.create()) {
        if (message.groupId !== BigInt(0)) {
            writer.uint32(8).uint64(message.groupId);
        }
        if (message.groupPolicyAddress !== '') {
            writer.uint32(18).string(message.groupPolicyAddress);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgCreateGroupWithPolicyResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.groupId = reader.uint64();
                    break;
                case 2:
                    message.groupPolicyAddress = reader.string();
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
            groupPolicyAddress: isSet(object.groupPolicyAddress)
                ? String(object.groupPolicyAddress)
                : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.groupId !== undefined &&
            (obj.groupId = (message.groupId || BigInt(0)).toString());
        message.groupPolicyAddress !== undefined &&
            (obj.groupPolicyAddress = message.groupPolicyAddress);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgCreateGroupWithPolicyResponse();
        message.groupId =
            object.groupId !== undefined && object.groupId !== null
                ? BigInt(object.groupId.toString())
                : BigInt(0);
        message.groupPolicyAddress = object.groupPolicyAddress ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return MsgCreateGroupWithPolicyResponse.decode(message.value);
    },
    toProto(message) {
        return MsgCreateGroupWithPolicyResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.group.v1.MsgCreateGroupWithPolicyResponse',
            value: MsgCreateGroupWithPolicyResponse.encode(message).finish(),
        };
    },
};
function createBaseMsgUpdateGroupPolicyAdminResponse() {
    return {};
}
export const MsgUpdateGroupPolicyAdminResponse = {
    typeUrl: '/cosmos.group.v1.MsgUpdateGroupPolicyAdminResponse',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgUpdateGroupPolicyAdminResponse();
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
        const message = createBaseMsgUpdateGroupPolicyAdminResponse();
        return message;
    },
    fromProtoMsg(message) {
        return MsgUpdateGroupPolicyAdminResponse.decode(message.value);
    },
    toProto(message) {
        return MsgUpdateGroupPolicyAdminResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.group.v1.MsgUpdateGroupPolicyAdminResponse',
            value: MsgUpdateGroupPolicyAdminResponse.encode(message).finish(),
        };
    },
};
function createBaseMsgUpdateGroupPolicyDecisionPolicy() {
    return {
        admin: '',
        groupPolicyAddress: '',
        decisionPolicy: undefined,
    };
}
export const MsgUpdateGroupPolicyDecisionPolicy = {
    typeUrl: '/cosmos.group.v1.MsgUpdateGroupPolicyDecisionPolicy',
    encode(message, writer = BinaryWriter.create()) {
        if (message.admin !== '') {
            writer.uint32(10).string(message.admin);
        }
        if (message.groupPolicyAddress !== '') {
            writer.uint32(18).string(message.groupPolicyAddress);
        }
        if (message.decisionPolicy !== undefined) {
            Any.encode(message.decisionPolicy, writer.uint32(26).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgUpdateGroupPolicyDecisionPolicy();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.admin = reader.string();
                    break;
                case 2:
                    message.groupPolicyAddress = reader.string();
                    break;
                case 3:
                    message.decisionPolicy =
                        Cosmos_groupv1DecisionPolicy_InterfaceDecoder(reader);
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
            admin: isSet(object.admin) ? String(object.admin) : '',
            groupPolicyAddress: isSet(object.groupPolicyAddress)
                ? String(object.groupPolicyAddress)
                : '',
            decisionPolicy: isSet(object.decisionPolicy)
                ? Any.fromJSON(object.decisionPolicy)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.admin !== undefined && (obj.admin = message.admin);
        message.groupPolicyAddress !== undefined &&
            (obj.groupPolicyAddress = message.groupPolicyAddress);
        message.decisionPolicy !== undefined &&
            (obj.decisionPolicy = message.decisionPolicy
                ? Any.toJSON(message.decisionPolicy)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgUpdateGroupPolicyDecisionPolicy();
        message.admin = object.admin ?? '';
        message.groupPolicyAddress = object.groupPolicyAddress ?? '';
        message.decisionPolicy =
            object.decisionPolicy !== undefined && object.decisionPolicy !== null
                ? Any.fromPartial(object.decisionPolicy)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return MsgUpdateGroupPolicyDecisionPolicy.decode(message.value);
    },
    toProto(message) {
        return MsgUpdateGroupPolicyDecisionPolicy.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.group.v1.MsgUpdateGroupPolicyDecisionPolicy',
            value: MsgUpdateGroupPolicyDecisionPolicy.encode(message).finish(),
        };
    },
};
function createBaseMsgUpdateGroupPolicyDecisionPolicyResponse() {
    return {};
}
export const MsgUpdateGroupPolicyDecisionPolicyResponse = {
    typeUrl: '/cosmos.group.v1.MsgUpdateGroupPolicyDecisionPolicyResponse',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgUpdateGroupPolicyDecisionPolicyResponse();
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
        const message = createBaseMsgUpdateGroupPolicyDecisionPolicyResponse();
        return message;
    },
    fromProtoMsg(message) {
        return MsgUpdateGroupPolicyDecisionPolicyResponse.decode(message.value);
    },
    toProto(message) {
        return MsgUpdateGroupPolicyDecisionPolicyResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.group.v1.MsgUpdateGroupPolicyDecisionPolicyResponse',
            value: MsgUpdateGroupPolicyDecisionPolicyResponse.encode(message).finish(),
        };
    },
};
function createBaseMsgUpdateGroupPolicyMetadata() {
    return {
        admin: '',
        groupPolicyAddress: '',
        metadata: '',
    };
}
export const MsgUpdateGroupPolicyMetadata = {
    typeUrl: '/cosmos.group.v1.MsgUpdateGroupPolicyMetadata',
    encode(message, writer = BinaryWriter.create()) {
        if (message.admin !== '') {
            writer.uint32(10).string(message.admin);
        }
        if (message.groupPolicyAddress !== '') {
            writer.uint32(18).string(message.groupPolicyAddress);
        }
        if (message.metadata !== '') {
            writer.uint32(26).string(message.metadata);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgUpdateGroupPolicyMetadata();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.admin = reader.string();
                    break;
                case 2:
                    message.groupPolicyAddress = reader.string();
                    break;
                case 3:
                    message.metadata = reader.string();
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
            admin: isSet(object.admin) ? String(object.admin) : '',
            groupPolicyAddress: isSet(object.groupPolicyAddress)
                ? String(object.groupPolicyAddress)
                : '',
            metadata: isSet(object.metadata) ? String(object.metadata) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.admin !== undefined && (obj.admin = message.admin);
        message.groupPolicyAddress !== undefined &&
            (obj.groupPolicyAddress = message.groupPolicyAddress);
        message.metadata !== undefined && (obj.metadata = message.metadata);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgUpdateGroupPolicyMetadata();
        message.admin = object.admin ?? '';
        message.groupPolicyAddress = object.groupPolicyAddress ?? '';
        message.metadata = object.metadata ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return MsgUpdateGroupPolicyMetadata.decode(message.value);
    },
    toProto(message) {
        return MsgUpdateGroupPolicyMetadata.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.group.v1.MsgUpdateGroupPolicyMetadata',
            value: MsgUpdateGroupPolicyMetadata.encode(message).finish(),
        };
    },
};
function createBaseMsgUpdateGroupPolicyMetadataResponse() {
    return {};
}
export const MsgUpdateGroupPolicyMetadataResponse = {
    typeUrl: '/cosmos.group.v1.MsgUpdateGroupPolicyMetadataResponse',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgUpdateGroupPolicyMetadataResponse();
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
        const message = createBaseMsgUpdateGroupPolicyMetadataResponse();
        return message;
    },
    fromProtoMsg(message) {
        return MsgUpdateGroupPolicyMetadataResponse.decode(message.value);
    },
    toProto(message) {
        return MsgUpdateGroupPolicyMetadataResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.group.v1.MsgUpdateGroupPolicyMetadataResponse',
            value: MsgUpdateGroupPolicyMetadataResponse.encode(message).finish(),
        };
    },
};
function createBaseMsgSubmitProposal() {
    return {
        groupPolicyAddress: '',
        proposers: [],
        metadata: '',
        messages: [],
        exec: 0,
    };
}
export const MsgSubmitProposal = {
    typeUrl: '/cosmos.group.v1.MsgSubmitProposal',
    encode(message, writer = BinaryWriter.create()) {
        if (message.groupPolicyAddress !== '') {
            writer.uint32(10).string(message.groupPolicyAddress);
        }
        for (const v of message.proposers) {
            writer.uint32(18).string(v);
        }
        if (message.metadata !== '') {
            writer.uint32(26).string(message.metadata);
        }
        for (const v of message.messages) {
            Any.encode(v, writer.uint32(34).fork()).ldelim();
        }
        if (message.exec !== 0) {
            writer.uint32(40).int32(message.exec);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgSubmitProposal();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.groupPolicyAddress = reader.string();
                    break;
                case 2:
                    message.proposers.push(reader.string());
                    break;
                case 3:
                    message.metadata = reader.string();
                    break;
                case 4:
                    message.messages.push(Any.decode(reader, reader.uint32()));
                    break;
                case 5:
                    message.exec = reader.int32();
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
            groupPolicyAddress: isSet(object.groupPolicyAddress)
                ? String(object.groupPolicyAddress)
                : '',
            proposers: Array.isArray(object?.proposers)
                ? object.proposers.map((e) => String(e))
                : [],
            metadata: isSet(object.metadata) ? String(object.metadata) : '',
            messages: Array.isArray(object?.messages)
                ? object.messages.map((e) => Any.fromJSON(e))
                : [],
            exec: isSet(object.exec) ? execFromJSON(object.exec) : -1,
        };
    },
    toJSON(message) {
        const obj = {};
        message.groupPolicyAddress !== undefined &&
            (obj.groupPolicyAddress = message.groupPolicyAddress);
        if (message.proposers) {
            obj.proposers = message.proposers.map(e => e);
        }
        else {
            obj.proposers = [];
        }
        message.metadata !== undefined && (obj.metadata = message.metadata);
        if (message.messages) {
            obj.messages = message.messages.map(e => (e ? Any.toJSON(e) : undefined));
        }
        else {
            obj.messages = [];
        }
        message.exec !== undefined && (obj.exec = execToJSON(message.exec));
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgSubmitProposal();
        message.groupPolicyAddress = object.groupPolicyAddress ?? '';
        message.proposers = object.proposers?.map(e => e) || [];
        message.metadata = object.metadata ?? '';
        message.messages = object.messages?.map(e => Any.fromPartial(e)) || [];
        message.exec = object.exec ?? 0;
        return message;
    },
    fromProtoMsg(message) {
        return MsgSubmitProposal.decode(message.value);
    },
    toProto(message) {
        return MsgSubmitProposal.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.group.v1.MsgSubmitProposal',
            value: MsgSubmitProposal.encode(message).finish(),
        };
    },
};
function createBaseMsgSubmitProposalResponse() {
    return {
        proposalId: BigInt(0),
    };
}
export const MsgSubmitProposalResponse = {
    typeUrl: '/cosmos.group.v1.MsgSubmitProposalResponse',
    encode(message, writer = BinaryWriter.create()) {
        if (message.proposalId !== BigInt(0)) {
            writer.uint32(8).uint64(message.proposalId);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgSubmitProposalResponse();
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
        const message = createBaseMsgSubmitProposalResponse();
        message.proposalId =
            object.proposalId !== undefined && object.proposalId !== null
                ? BigInt(object.proposalId.toString())
                : BigInt(0);
        return message;
    },
    fromProtoMsg(message) {
        return MsgSubmitProposalResponse.decode(message.value);
    },
    toProto(message) {
        return MsgSubmitProposalResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.group.v1.MsgSubmitProposalResponse',
            value: MsgSubmitProposalResponse.encode(message).finish(),
        };
    },
};
function createBaseMsgWithdrawProposal() {
    return {
        proposalId: BigInt(0),
        address: '',
    };
}
export const MsgWithdrawProposal = {
    typeUrl: '/cosmos.group.v1.MsgWithdrawProposal',
    encode(message, writer = BinaryWriter.create()) {
        if (message.proposalId !== BigInt(0)) {
            writer.uint32(8).uint64(message.proposalId);
        }
        if (message.address !== '') {
            writer.uint32(18).string(message.address);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgWithdrawProposal();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.proposalId = reader.uint64();
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
            proposalId: isSet(object.proposalId)
                ? BigInt(object.proposalId.toString())
                : BigInt(0),
            address: isSet(object.address) ? String(object.address) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.proposalId !== undefined &&
            (obj.proposalId = (message.proposalId || BigInt(0)).toString());
        message.address !== undefined && (obj.address = message.address);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgWithdrawProposal();
        message.proposalId =
            object.proposalId !== undefined && object.proposalId !== null
                ? BigInt(object.proposalId.toString())
                : BigInt(0);
        message.address = object.address ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return MsgWithdrawProposal.decode(message.value);
    },
    toProto(message) {
        return MsgWithdrawProposal.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.group.v1.MsgWithdrawProposal',
            value: MsgWithdrawProposal.encode(message).finish(),
        };
    },
};
function createBaseMsgWithdrawProposalResponse() {
    return {};
}
export const MsgWithdrawProposalResponse = {
    typeUrl: '/cosmos.group.v1.MsgWithdrawProposalResponse',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgWithdrawProposalResponse();
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
        const message = createBaseMsgWithdrawProposalResponse();
        return message;
    },
    fromProtoMsg(message) {
        return MsgWithdrawProposalResponse.decode(message.value);
    },
    toProto(message) {
        return MsgWithdrawProposalResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.group.v1.MsgWithdrawProposalResponse',
            value: MsgWithdrawProposalResponse.encode(message).finish(),
        };
    },
};
function createBaseMsgVote() {
    return {
        proposalId: BigInt(0),
        voter: '',
        option: 0,
        metadata: '',
        exec: 0,
    };
}
export const MsgVote = {
    typeUrl: '/cosmos.group.v1.MsgVote',
    encode(message, writer = BinaryWriter.create()) {
        if (message.proposalId !== BigInt(0)) {
            writer.uint32(8).uint64(message.proposalId);
        }
        if (message.voter !== '') {
            writer.uint32(18).string(message.voter);
        }
        if (message.option !== 0) {
            writer.uint32(24).int32(message.option);
        }
        if (message.metadata !== '') {
            writer.uint32(34).string(message.metadata);
        }
        if (message.exec !== 0) {
            writer.uint32(40).int32(message.exec);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgVote();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.proposalId = reader.uint64();
                    break;
                case 2:
                    message.voter = reader.string();
                    break;
                case 3:
                    message.option = reader.int32();
                    break;
                case 4:
                    message.metadata = reader.string();
                    break;
                case 5:
                    message.exec = reader.int32();
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
            voter: isSet(object.voter) ? String(object.voter) : '',
            option: isSet(object.option) ? voteOptionFromJSON(object.option) : -1,
            metadata: isSet(object.metadata) ? String(object.metadata) : '',
            exec: isSet(object.exec) ? execFromJSON(object.exec) : -1,
        };
    },
    toJSON(message) {
        const obj = {};
        message.proposalId !== undefined &&
            (obj.proposalId = (message.proposalId || BigInt(0)).toString());
        message.voter !== undefined && (obj.voter = message.voter);
        message.option !== undefined &&
            (obj.option = voteOptionToJSON(message.option));
        message.metadata !== undefined && (obj.metadata = message.metadata);
        message.exec !== undefined && (obj.exec = execToJSON(message.exec));
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgVote();
        message.proposalId =
            object.proposalId !== undefined && object.proposalId !== null
                ? BigInt(object.proposalId.toString())
                : BigInt(0);
        message.voter = object.voter ?? '';
        message.option = object.option ?? 0;
        message.metadata = object.metadata ?? '';
        message.exec = object.exec ?? 0;
        return message;
    },
    fromProtoMsg(message) {
        return MsgVote.decode(message.value);
    },
    toProto(message) {
        return MsgVote.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.group.v1.MsgVote',
            value: MsgVote.encode(message).finish(),
        };
    },
};
function createBaseMsgVoteResponse() {
    return {};
}
export const MsgVoteResponse = {
    typeUrl: '/cosmos.group.v1.MsgVoteResponse',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgVoteResponse();
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
        const message = createBaseMsgVoteResponse();
        return message;
    },
    fromProtoMsg(message) {
        return MsgVoteResponse.decode(message.value);
    },
    toProto(message) {
        return MsgVoteResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.group.v1.MsgVoteResponse',
            value: MsgVoteResponse.encode(message).finish(),
        };
    },
};
function createBaseMsgExec() {
    return {
        proposalId: BigInt(0),
        executor: '',
    };
}
export const MsgExec = {
    typeUrl: '/cosmos.group.v1.MsgExec',
    encode(message, writer = BinaryWriter.create()) {
        if (message.proposalId !== BigInt(0)) {
            writer.uint32(8).uint64(message.proposalId);
        }
        if (message.executor !== '') {
            writer.uint32(18).string(message.executor);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgExec();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.proposalId = reader.uint64();
                    break;
                case 2:
                    message.executor = reader.string();
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
            executor: isSet(object.executor) ? String(object.executor) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.proposalId !== undefined &&
            (obj.proposalId = (message.proposalId || BigInt(0)).toString());
        message.executor !== undefined && (obj.executor = message.executor);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgExec();
        message.proposalId =
            object.proposalId !== undefined && object.proposalId !== null
                ? BigInt(object.proposalId.toString())
                : BigInt(0);
        message.executor = object.executor ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return MsgExec.decode(message.value);
    },
    toProto(message) {
        return MsgExec.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.group.v1.MsgExec',
            value: MsgExec.encode(message).finish(),
        };
    },
};
function createBaseMsgExecResponse() {
    return {
        result: 0,
    };
}
export const MsgExecResponse = {
    typeUrl: '/cosmos.group.v1.MsgExecResponse',
    encode(message, writer = BinaryWriter.create()) {
        if (message.result !== 0) {
            writer.uint32(16).int32(message.result);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgExecResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 2:
                    message.result = reader.int32();
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
            result: isSet(object.result)
                ? proposalExecutorResultFromJSON(object.result)
                : -1,
        };
    },
    toJSON(message) {
        const obj = {};
        message.result !== undefined &&
            (obj.result = proposalExecutorResultToJSON(message.result));
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgExecResponse();
        message.result = object.result ?? 0;
        return message;
    },
    fromProtoMsg(message) {
        return MsgExecResponse.decode(message.value);
    },
    toProto(message) {
        return MsgExecResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.group.v1.MsgExecResponse',
            value: MsgExecResponse.encode(message).finish(),
        };
    },
};
function createBaseMsgLeaveGroup() {
    return {
        address: '',
        groupId: BigInt(0),
    };
}
export const MsgLeaveGroup = {
    typeUrl: '/cosmos.group.v1.MsgLeaveGroup',
    encode(message, writer = BinaryWriter.create()) {
        if (message.address !== '') {
            writer.uint32(10).string(message.address);
        }
        if (message.groupId !== BigInt(0)) {
            writer.uint32(16).uint64(message.groupId);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgLeaveGroup();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.address = reader.string();
                    break;
                case 2:
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
            address: isSet(object.address) ? String(object.address) : '',
            groupId: isSet(object.groupId)
                ? BigInt(object.groupId.toString())
                : BigInt(0),
        };
    },
    toJSON(message) {
        const obj = {};
        message.address !== undefined && (obj.address = message.address);
        message.groupId !== undefined &&
            (obj.groupId = (message.groupId || BigInt(0)).toString());
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgLeaveGroup();
        message.address = object.address ?? '';
        message.groupId =
            object.groupId !== undefined && object.groupId !== null
                ? BigInt(object.groupId.toString())
                : BigInt(0);
        return message;
    },
    fromProtoMsg(message) {
        return MsgLeaveGroup.decode(message.value);
    },
    toProto(message) {
        return MsgLeaveGroup.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.group.v1.MsgLeaveGroup',
            value: MsgLeaveGroup.encode(message).finish(),
        };
    },
};
function createBaseMsgLeaveGroupResponse() {
    return {};
}
export const MsgLeaveGroupResponse = {
    typeUrl: '/cosmos.group.v1.MsgLeaveGroupResponse',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgLeaveGroupResponse();
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
        const message = createBaseMsgLeaveGroupResponse();
        return message;
    },
    fromProtoMsg(message) {
        return MsgLeaveGroupResponse.decode(message.value);
    },
    toProto(message) {
        return MsgLeaveGroupResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.group.v1.MsgLeaveGroupResponse',
            value: MsgLeaveGroupResponse.encode(message).finish(),
        };
    },
};
export const Cosmos_groupv1DecisionPolicy_InterfaceDecoder = (input) => {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const data = Any.decode(reader, reader.uint32());
    switch (data.typeUrl) {
        default:
            return data;
    }
};
//# sourceMappingURL=tx.js.map