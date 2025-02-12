//@ts-nocheck
import { PageRequest, PageResponse, } from '../../base/query/v1beta1/pagination.js';
import { GroupInfo, GroupPolicyInfo, GroupMember, Proposal, Vote, TallyResult, } from './types.js';
import { BinaryReader, BinaryWriter } from '../../../binary.js';
import { isSet } from '../../../helpers.js';
import {} from '../../../json-safe.js';
function createBaseQueryGroupInfoRequest() {
    return {
        groupId: BigInt(0),
    };
}
export const QueryGroupInfoRequest = {
    typeUrl: '/cosmos.group.v1.QueryGroupInfoRequest',
    encode(message, writer = BinaryWriter.create()) {
        if (message.groupId !== BigInt(0)) {
            writer.uint32(8).uint64(message.groupId);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryGroupInfoRequest();
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
        const message = createBaseQueryGroupInfoRequest();
        message.groupId =
            object.groupId !== undefined && object.groupId !== null
                ? BigInt(object.groupId.toString())
                : BigInt(0);
        return message;
    },
    fromProtoMsg(message) {
        return QueryGroupInfoRequest.decode(message.value);
    },
    toProto(message) {
        return QueryGroupInfoRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.group.v1.QueryGroupInfoRequest',
            value: QueryGroupInfoRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryGroupInfoResponse() {
    return {
        info: undefined,
    };
}
export const QueryGroupInfoResponse = {
    typeUrl: '/cosmos.group.v1.QueryGroupInfoResponse',
    encode(message, writer = BinaryWriter.create()) {
        if (message.info !== undefined) {
            GroupInfo.encode(message.info, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryGroupInfoResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.info = GroupInfo.decode(reader, reader.uint32());
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
            info: isSet(object.info) ? GroupInfo.fromJSON(object.info) : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.info !== undefined &&
            (obj.info = message.info ? GroupInfo.toJSON(message.info) : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryGroupInfoResponse();
        message.info =
            object.info !== undefined && object.info !== null
                ? GroupInfo.fromPartial(object.info)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return QueryGroupInfoResponse.decode(message.value);
    },
    toProto(message) {
        return QueryGroupInfoResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.group.v1.QueryGroupInfoResponse',
            value: QueryGroupInfoResponse.encode(message).finish(),
        };
    },
};
function createBaseQueryGroupPolicyInfoRequest() {
    return {
        address: '',
    };
}
export const QueryGroupPolicyInfoRequest = {
    typeUrl: '/cosmos.group.v1.QueryGroupPolicyInfoRequest',
    encode(message, writer = BinaryWriter.create()) {
        if (message.address !== '') {
            writer.uint32(10).string(message.address);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryGroupPolicyInfoRequest();
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
        const message = createBaseQueryGroupPolicyInfoRequest();
        message.address = object.address ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return QueryGroupPolicyInfoRequest.decode(message.value);
    },
    toProto(message) {
        return QueryGroupPolicyInfoRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.group.v1.QueryGroupPolicyInfoRequest',
            value: QueryGroupPolicyInfoRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryGroupPolicyInfoResponse() {
    return {
        info: undefined,
    };
}
export const QueryGroupPolicyInfoResponse = {
    typeUrl: '/cosmos.group.v1.QueryGroupPolicyInfoResponse',
    encode(message, writer = BinaryWriter.create()) {
        if (message.info !== undefined) {
            GroupPolicyInfo.encode(message.info, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryGroupPolicyInfoResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.info = GroupPolicyInfo.decode(reader, reader.uint32());
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
            info: isSet(object.info)
                ? GroupPolicyInfo.fromJSON(object.info)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.info !== undefined &&
            (obj.info = message.info
                ? GroupPolicyInfo.toJSON(message.info)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryGroupPolicyInfoResponse();
        message.info =
            object.info !== undefined && object.info !== null
                ? GroupPolicyInfo.fromPartial(object.info)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return QueryGroupPolicyInfoResponse.decode(message.value);
    },
    toProto(message) {
        return QueryGroupPolicyInfoResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.group.v1.QueryGroupPolicyInfoResponse',
            value: QueryGroupPolicyInfoResponse.encode(message).finish(),
        };
    },
};
function createBaseQueryGroupMembersRequest() {
    return {
        groupId: BigInt(0),
        pagination: undefined,
    };
}
export const QueryGroupMembersRequest = {
    typeUrl: '/cosmos.group.v1.QueryGroupMembersRequest',
    encode(message, writer = BinaryWriter.create()) {
        if (message.groupId !== BigInt(0)) {
            writer.uint32(8).uint64(message.groupId);
        }
        if (message.pagination !== undefined) {
            PageRequest.encode(message.pagination, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryGroupMembersRequest();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.groupId = reader.uint64();
                    break;
                case 2:
                    message.pagination = PageRequest.decode(reader, reader.uint32());
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
            pagination: isSet(object.pagination)
                ? PageRequest.fromJSON(object.pagination)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.groupId !== undefined &&
            (obj.groupId = (message.groupId || BigInt(0)).toString());
        message.pagination !== undefined &&
            (obj.pagination = message.pagination
                ? PageRequest.toJSON(message.pagination)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryGroupMembersRequest();
        message.groupId =
            object.groupId !== undefined && object.groupId !== null
                ? BigInt(object.groupId.toString())
                : BigInt(0);
        message.pagination =
            object.pagination !== undefined && object.pagination !== null
                ? PageRequest.fromPartial(object.pagination)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return QueryGroupMembersRequest.decode(message.value);
    },
    toProto(message) {
        return QueryGroupMembersRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.group.v1.QueryGroupMembersRequest',
            value: QueryGroupMembersRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryGroupMembersResponse() {
    return {
        members: [],
        pagination: undefined,
    };
}
export const QueryGroupMembersResponse = {
    typeUrl: '/cosmos.group.v1.QueryGroupMembersResponse',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.members) {
            GroupMember.encode(v, writer.uint32(10).fork()).ldelim();
        }
        if (message.pagination !== undefined) {
            PageResponse.encode(message.pagination, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryGroupMembersResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.members.push(GroupMember.decode(reader, reader.uint32()));
                    break;
                case 2:
                    message.pagination = PageResponse.decode(reader, reader.uint32());
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
            members: Array.isArray(object?.members)
                ? object.members.map((e) => GroupMember.fromJSON(e))
                : [],
            pagination: isSet(object.pagination)
                ? PageResponse.fromJSON(object.pagination)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.members) {
            obj.members = message.members.map(e => e ? GroupMember.toJSON(e) : undefined);
        }
        else {
            obj.members = [];
        }
        message.pagination !== undefined &&
            (obj.pagination = message.pagination
                ? PageResponse.toJSON(message.pagination)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryGroupMembersResponse();
        message.members =
            object.members?.map(e => GroupMember.fromPartial(e)) || [];
        message.pagination =
            object.pagination !== undefined && object.pagination !== null
                ? PageResponse.fromPartial(object.pagination)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return QueryGroupMembersResponse.decode(message.value);
    },
    toProto(message) {
        return QueryGroupMembersResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.group.v1.QueryGroupMembersResponse',
            value: QueryGroupMembersResponse.encode(message).finish(),
        };
    },
};
function createBaseQueryGroupsByAdminRequest() {
    return {
        admin: '',
        pagination: undefined,
    };
}
export const QueryGroupsByAdminRequest = {
    typeUrl: '/cosmos.group.v1.QueryGroupsByAdminRequest',
    encode(message, writer = BinaryWriter.create()) {
        if (message.admin !== '') {
            writer.uint32(10).string(message.admin);
        }
        if (message.pagination !== undefined) {
            PageRequest.encode(message.pagination, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryGroupsByAdminRequest();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.admin = reader.string();
                    break;
                case 2:
                    message.pagination = PageRequest.decode(reader, reader.uint32());
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
            pagination: isSet(object.pagination)
                ? PageRequest.fromJSON(object.pagination)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.admin !== undefined && (obj.admin = message.admin);
        message.pagination !== undefined &&
            (obj.pagination = message.pagination
                ? PageRequest.toJSON(message.pagination)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryGroupsByAdminRequest();
        message.admin = object.admin ?? '';
        message.pagination =
            object.pagination !== undefined && object.pagination !== null
                ? PageRequest.fromPartial(object.pagination)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return QueryGroupsByAdminRequest.decode(message.value);
    },
    toProto(message) {
        return QueryGroupsByAdminRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.group.v1.QueryGroupsByAdminRequest',
            value: QueryGroupsByAdminRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryGroupsByAdminResponse() {
    return {
        groups: [],
        pagination: undefined,
    };
}
export const QueryGroupsByAdminResponse = {
    typeUrl: '/cosmos.group.v1.QueryGroupsByAdminResponse',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.groups) {
            GroupInfo.encode(v, writer.uint32(10).fork()).ldelim();
        }
        if (message.pagination !== undefined) {
            PageResponse.encode(message.pagination, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryGroupsByAdminResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.groups.push(GroupInfo.decode(reader, reader.uint32()));
                    break;
                case 2:
                    message.pagination = PageResponse.decode(reader, reader.uint32());
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
            groups: Array.isArray(object?.groups)
                ? object.groups.map((e) => GroupInfo.fromJSON(e))
                : [],
            pagination: isSet(object.pagination)
                ? PageResponse.fromJSON(object.pagination)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.groups) {
            obj.groups = message.groups.map(e => e ? GroupInfo.toJSON(e) : undefined);
        }
        else {
            obj.groups = [];
        }
        message.pagination !== undefined &&
            (obj.pagination = message.pagination
                ? PageResponse.toJSON(message.pagination)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryGroupsByAdminResponse();
        message.groups = object.groups?.map(e => GroupInfo.fromPartial(e)) || [];
        message.pagination =
            object.pagination !== undefined && object.pagination !== null
                ? PageResponse.fromPartial(object.pagination)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return QueryGroupsByAdminResponse.decode(message.value);
    },
    toProto(message) {
        return QueryGroupsByAdminResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.group.v1.QueryGroupsByAdminResponse',
            value: QueryGroupsByAdminResponse.encode(message).finish(),
        };
    },
};
function createBaseQueryGroupPoliciesByGroupRequest() {
    return {
        groupId: BigInt(0),
        pagination: undefined,
    };
}
export const QueryGroupPoliciesByGroupRequest = {
    typeUrl: '/cosmos.group.v1.QueryGroupPoliciesByGroupRequest',
    encode(message, writer = BinaryWriter.create()) {
        if (message.groupId !== BigInt(0)) {
            writer.uint32(8).uint64(message.groupId);
        }
        if (message.pagination !== undefined) {
            PageRequest.encode(message.pagination, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryGroupPoliciesByGroupRequest();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.groupId = reader.uint64();
                    break;
                case 2:
                    message.pagination = PageRequest.decode(reader, reader.uint32());
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
            pagination: isSet(object.pagination)
                ? PageRequest.fromJSON(object.pagination)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.groupId !== undefined &&
            (obj.groupId = (message.groupId || BigInt(0)).toString());
        message.pagination !== undefined &&
            (obj.pagination = message.pagination
                ? PageRequest.toJSON(message.pagination)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryGroupPoliciesByGroupRequest();
        message.groupId =
            object.groupId !== undefined && object.groupId !== null
                ? BigInt(object.groupId.toString())
                : BigInt(0);
        message.pagination =
            object.pagination !== undefined && object.pagination !== null
                ? PageRequest.fromPartial(object.pagination)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return QueryGroupPoliciesByGroupRequest.decode(message.value);
    },
    toProto(message) {
        return QueryGroupPoliciesByGroupRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.group.v1.QueryGroupPoliciesByGroupRequest',
            value: QueryGroupPoliciesByGroupRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryGroupPoliciesByGroupResponse() {
    return {
        groupPolicies: [],
        pagination: undefined,
    };
}
export const QueryGroupPoliciesByGroupResponse = {
    typeUrl: '/cosmos.group.v1.QueryGroupPoliciesByGroupResponse',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.groupPolicies) {
            GroupPolicyInfo.encode(v, writer.uint32(10).fork()).ldelim();
        }
        if (message.pagination !== undefined) {
            PageResponse.encode(message.pagination, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryGroupPoliciesByGroupResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.groupPolicies.push(GroupPolicyInfo.decode(reader, reader.uint32()));
                    break;
                case 2:
                    message.pagination = PageResponse.decode(reader, reader.uint32());
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
            groupPolicies: Array.isArray(object?.groupPolicies)
                ? object.groupPolicies.map((e) => GroupPolicyInfo.fromJSON(e))
                : [],
            pagination: isSet(object.pagination)
                ? PageResponse.fromJSON(object.pagination)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.groupPolicies) {
            obj.groupPolicies = message.groupPolicies.map(e => e ? GroupPolicyInfo.toJSON(e) : undefined);
        }
        else {
            obj.groupPolicies = [];
        }
        message.pagination !== undefined &&
            (obj.pagination = message.pagination
                ? PageResponse.toJSON(message.pagination)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryGroupPoliciesByGroupResponse();
        message.groupPolicies =
            object.groupPolicies?.map(e => GroupPolicyInfo.fromPartial(e)) || [];
        message.pagination =
            object.pagination !== undefined && object.pagination !== null
                ? PageResponse.fromPartial(object.pagination)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return QueryGroupPoliciesByGroupResponse.decode(message.value);
    },
    toProto(message) {
        return QueryGroupPoliciesByGroupResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.group.v1.QueryGroupPoliciesByGroupResponse',
            value: QueryGroupPoliciesByGroupResponse.encode(message).finish(),
        };
    },
};
function createBaseQueryGroupPoliciesByAdminRequest() {
    return {
        admin: '',
        pagination: undefined,
    };
}
export const QueryGroupPoliciesByAdminRequest = {
    typeUrl: '/cosmos.group.v1.QueryGroupPoliciesByAdminRequest',
    encode(message, writer = BinaryWriter.create()) {
        if (message.admin !== '') {
            writer.uint32(10).string(message.admin);
        }
        if (message.pagination !== undefined) {
            PageRequest.encode(message.pagination, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryGroupPoliciesByAdminRequest();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.admin = reader.string();
                    break;
                case 2:
                    message.pagination = PageRequest.decode(reader, reader.uint32());
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
            pagination: isSet(object.pagination)
                ? PageRequest.fromJSON(object.pagination)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.admin !== undefined && (obj.admin = message.admin);
        message.pagination !== undefined &&
            (obj.pagination = message.pagination
                ? PageRequest.toJSON(message.pagination)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryGroupPoliciesByAdminRequest();
        message.admin = object.admin ?? '';
        message.pagination =
            object.pagination !== undefined && object.pagination !== null
                ? PageRequest.fromPartial(object.pagination)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return QueryGroupPoliciesByAdminRequest.decode(message.value);
    },
    toProto(message) {
        return QueryGroupPoliciesByAdminRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.group.v1.QueryGroupPoliciesByAdminRequest',
            value: QueryGroupPoliciesByAdminRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryGroupPoliciesByAdminResponse() {
    return {
        groupPolicies: [],
        pagination: undefined,
    };
}
export const QueryGroupPoliciesByAdminResponse = {
    typeUrl: '/cosmos.group.v1.QueryGroupPoliciesByAdminResponse',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.groupPolicies) {
            GroupPolicyInfo.encode(v, writer.uint32(10).fork()).ldelim();
        }
        if (message.pagination !== undefined) {
            PageResponse.encode(message.pagination, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryGroupPoliciesByAdminResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.groupPolicies.push(GroupPolicyInfo.decode(reader, reader.uint32()));
                    break;
                case 2:
                    message.pagination = PageResponse.decode(reader, reader.uint32());
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
            groupPolicies: Array.isArray(object?.groupPolicies)
                ? object.groupPolicies.map((e) => GroupPolicyInfo.fromJSON(e))
                : [],
            pagination: isSet(object.pagination)
                ? PageResponse.fromJSON(object.pagination)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.groupPolicies) {
            obj.groupPolicies = message.groupPolicies.map(e => e ? GroupPolicyInfo.toJSON(e) : undefined);
        }
        else {
            obj.groupPolicies = [];
        }
        message.pagination !== undefined &&
            (obj.pagination = message.pagination
                ? PageResponse.toJSON(message.pagination)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryGroupPoliciesByAdminResponse();
        message.groupPolicies =
            object.groupPolicies?.map(e => GroupPolicyInfo.fromPartial(e)) || [];
        message.pagination =
            object.pagination !== undefined && object.pagination !== null
                ? PageResponse.fromPartial(object.pagination)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return QueryGroupPoliciesByAdminResponse.decode(message.value);
    },
    toProto(message) {
        return QueryGroupPoliciesByAdminResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.group.v1.QueryGroupPoliciesByAdminResponse',
            value: QueryGroupPoliciesByAdminResponse.encode(message).finish(),
        };
    },
};
function createBaseQueryProposalRequest() {
    return {
        proposalId: BigInt(0),
    };
}
export const QueryProposalRequest = {
    typeUrl: '/cosmos.group.v1.QueryProposalRequest',
    encode(message, writer = BinaryWriter.create()) {
        if (message.proposalId !== BigInt(0)) {
            writer.uint32(8).uint64(message.proposalId);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryProposalRequest();
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
        const message = createBaseQueryProposalRequest();
        message.proposalId =
            object.proposalId !== undefined && object.proposalId !== null
                ? BigInt(object.proposalId.toString())
                : BigInt(0);
        return message;
    },
    fromProtoMsg(message) {
        return QueryProposalRequest.decode(message.value);
    },
    toProto(message) {
        return QueryProposalRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.group.v1.QueryProposalRequest',
            value: QueryProposalRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryProposalResponse() {
    return {
        proposal: undefined,
    };
}
export const QueryProposalResponse = {
    typeUrl: '/cosmos.group.v1.QueryProposalResponse',
    encode(message, writer = BinaryWriter.create()) {
        if (message.proposal !== undefined) {
            Proposal.encode(message.proposal, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryProposalResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.proposal = Proposal.decode(reader, reader.uint32());
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
            proposal: isSet(object.proposal)
                ? Proposal.fromJSON(object.proposal)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.proposal !== undefined &&
            (obj.proposal = message.proposal
                ? Proposal.toJSON(message.proposal)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryProposalResponse();
        message.proposal =
            object.proposal !== undefined && object.proposal !== null
                ? Proposal.fromPartial(object.proposal)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return QueryProposalResponse.decode(message.value);
    },
    toProto(message) {
        return QueryProposalResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.group.v1.QueryProposalResponse',
            value: QueryProposalResponse.encode(message).finish(),
        };
    },
};
function createBaseQueryProposalsByGroupPolicyRequest() {
    return {
        address: '',
        pagination: undefined,
    };
}
export const QueryProposalsByGroupPolicyRequest = {
    typeUrl: '/cosmos.group.v1.QueryProposalsByGroupPolicyRequest',
    encode(message, writer = BinaryWriter.create()) {
        if (message.address !== '') {
            writer.uint32(10).string(message.address);
        }
        if (message.pagination !== undefined) {
            PageRequest.encode(message.pagination, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryProposalsByGroupPolicyRequest();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.address = reader.string();
                    break;
                case 2:
                    message.pagination = PageRequest.decode(reader, reader.uint32());
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
            pagination: isSet(object.pagination)
                ? PageRequest.fromJSON(object.pagination)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.address !== undefined && (obj.address = message.address);
        message.pagination !== undefined &&
            (obj.pagination = message.pagination
                ? PageRequest.toJSON(message.pagination)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryProposalsByGroupPolicyRequest();
        message.address = object.address ?? '';
        message.pagination =
            object.pagination !== undefined && object.pagination !== null
                ? PageRequest.fromPartial(object.pagination)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return QueryProposalsByGroupPolicyRequest.decode(message.value);
    },
    toProto(message) {
        return QueryProposalsByGroupPolicyRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.group.v1.QueryProposalsByGroupPolicyRequest',
            value: QueryProposalsByGroupPolicyRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryProposalsByGroupPolicyResponse() {
    return {
        proposals: [],
        pagination: undefined,
    };
}
export const QueryProposalsByGroupPolicyResponse = {
    typeUrl: '/cosmos.group.v1.QueryProposalsByGroupPolicyResponse',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.proposals) {
            Proposal.encode(v, writer.uint32(10).fork()).ldelim();
        }
        if (message.pagination !== undefined) {
            PageResponse.encode(message.pagination, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryProposalsByGroupPolicyResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.proposals.push(Proposal.decode(reader, reader.uint32()));
                    break;
                case 2:
                    message.pagination = PageResponse.decode(reader, reader.uint32());
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
            proposals: Array.isArray(object?.proposals)
                ? object.proposals.map((e) => Proposal.fromJSON(e))
                : [],
            pagination: isSet(object.pagination)
                ? PageResponse.fromJSON(object.pagination)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.proposals) {
            obj.proposals = message.proposals.map(e => e ? Proposal.toJSON(e) : undefined);
        }
        else {
            obj.proposals = [];
        }
        message.pagination !== undefined &&
            (obj.pagination = message.pagination
                ? PageResponse.toJSON(message.pagination)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryProposalsByGroupPolicyResponse();
        message.proposals =
            object.proposals?.map(e => Proposal.fromPartial(e)) || [];
        message.pagination =
            object.pagination !== undefined && object.pagination !== null
                ? PageResponse.fromPartial(object.pagination)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return QueryProposalsByGroupPolicyResponse.decode(message.value);
    },
    toProto(message) {
        return QueryProposalsByGroupPolicyResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.group.v1.QueryProposalsByGroupPolicyResponse',
            value: QueryProposalsByGroupPolicyResponse.encode(message).finish(),
        };
    },
};
function createBaseQueryVoteByProposalVoterRequest() {
    return {
        proposalId: BigInt(0),
        voter: '',
    };
}
export const QueryVoteByProposalVoterRequest = {
    typeUrl: '/cosmos.group.v1.QueryVoteByProposalVoterRequest',
    encode(message, writer = BinaryWriter.create()) {
        if (message.proposalId !== BigInt(0)) {
            writer.uint32(8).uint64(message.proposalId);
        }
        if (message.voter !== '') {
            writer.uint32(18).string(message.voter);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryVoteByProposalVoterRequest();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.proposalId = reader.uint64();
                    break;
                case 2:
                    message.voter = reader.string();
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
        };
    },
    toJSON(message) {
        const obj = {};
        message.proposalId !== undefined &&
            (obj.proposalId = (message.proposalId || BigInt(0)).toString());
        message.voter !== undefined && (obj.voter = message.voter);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryVoteByProposalVoterRequest();
        message.proposalId =
            object.proposalId !== undefined && object.proposalId !== null
                ? BigInt(object.proposalId.toString())
                : BigInt(0);
        message.voter = object.voter ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return QueryVoteByProposalVoterRequest.decode(message.value);
    },
    toProto(message) {
        return QueryVoteByProposalVoterRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.group.v1.QueryVoteByProposalVoterRequest',
            value: QueryVoteByProposalVoterRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryVoteByProposalVoterResponse() {
    return {
        vote: undefined,
    };
}
export const QueryVoteByProposalVoterResponse = {
    typeUrl: '/cosmos.group.v1.QueryVoteByProposalVoterResponse',
    encode(message, writer = BinaryWriter.create()) {
        if (message.vote !== undefined) {
            Vote.encode(message.vote, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryVoteByProposalVoterResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.vote = Vote.decode(reader, reader.uint32());
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
            vote: isSet(object.vote) ? Vote.fromJSON(object.vote) : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.vote !== undefined &&
            (obj.vote = message.vote ? Vote.toJSON(message.vote) : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryVoteByProposalVoterResponse();
        message.vote =
            object.vote !== undefined && object.vote !== null
                ? Vote.fromPartial(object.vote)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return QueryVoteByProposalVoterResponse.decode(message.value);
    },
    toProto(message) {
        return QueryVoteByProposalVoterResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.group.v1.QueryVoteByProposalVoterResponse',
            value: QueryVoteByProposalVoterResponse.encode(message).finish(),
        };
    },
};
function createBaseQueryVotesByProposalRequest() {
    return {
        proposalId: BigInt(0),
        pagination: undefined,
    };
}
export const QueryVotesByProposalRequest = {
    typeUrl: '/cosmos.group.v1.QueryVotesByProposalRequest',
    encode(message, writer = BinaryWriter.create()) {
        if (message.proposalId !== BigInt(0)) {
            writer.uint32(8).uint64(message.proposalId);
        }
        if (message.pagination !== undefined) {
            PageRequest.encode(message.pagination, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryVotesByProposalRequest();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.proposalId = reader.uint64();
                    break;
                case 2:
                    message.pagination = PageRequest.decode(reader, reader.uint32());
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
            pagination: isSet(object.pagination)
                ? PageRequest.fromJSON(object.pagination)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.proposalId !== undefined &&
            (obj.proposalId = (message.proposalId || BigInt(0)).toString());
        message.pagination !== undefined &&
            (obj.pagination = message.pagination
                ? PageRequest.toJSON(message.pagination)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryVotesByProposalRequest();
        message.proposalId =
            object.proposalId !== undefined && object.proposalId !== null
                ? BigInt(object.proposalId.toString())
                : BigInt(0);
        message.pagination =
            object.pagination !== undefined && object.pagination !== null
                ? PageRequest.fromPartial(object.pagination)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return QueryVotesByProposalRequest.decode(message.value);
    },
    toProto(message) {
        return QueryVotesByProposalRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.group.v1.QueryVotesByProposalRequest',
            value: QueryVotesByProposalRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryVotesByProposalResponse() {
    return {
        votes: [],
        pagination: undefined,
    };
}
export const QueryVotesByProposalResponse = {
    typeUrl: '/cosmos.group.v1.QueryVotesByProposalResponse',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.votes) {
            Vote.encode(v, writer.uint32(10).fork()).ldelim();
        }
        if (message.pagination !== undefined) {
            PageResponse.encode(message.pagination, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryVotesByProposalResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.votes.push(Vote.decode(reader, reader.uint32()));
                    break;
                case 2:
                    message.pagination = PageResponse.decode(reader, reader.uint32());
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
            votes: Array.isArray(object?.votes)
                ? object.votes.map((e) => Vote.fromJSON(e))
                : [],
            pagination: isSet(object.pagination)
                ? PageResponse.fromJSON(object.pagination)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.votes) {
            obj.votes = message.votes.map(e => (e ? Vote.toJSON(e) : undefined));
        }
        else {
            obj.votes = [];
        }
        message.pagination !== undefined &&
            (obj.pagination = message.pagination
                ? PageResponse.toJSON(message.pagination)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryVotesByProposalResponse();
        message.votes = object.votes?.map(e => Vote.fromPartial(e)) || [];
        message.pagination =
            object.pagination !== undefined && object.pagination !== null
                ? PageResponse.fromPartial(object.pagination)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return QueryVotesByProposalResponse.decode(message.value);
    },
    toProto(message) {
        return QueryVotesByProposalResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.group.v1.QueryVotesByProposalResponse',
            value: QueryVotesByProposalResponse.encode(message).finish(),
        };
    },
};
function createBaseQueryVotesByVoterRequest() {
    return {
        voter: '',
        pagination: undefined,
    };
}
export const QueryVotesByVoterRequest = {
    typeUrl: '/cosmos.group.v1.QueryVotesByVoterRequest',
    encode(message, writer = BinaryWriter.create()) {
        if (message.voter !== '') {
            writer.uint32(10).string(message.voter);
        }
        if (message.pagination !== undefined) {
            PageRequest.encode(message.pagination, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryVotesByVoterRequest();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.voter = reader.string();
                    break;
                case 2:
                    message.pagination = PageRequest.decode(reader, reader.uint32());
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
            voter: isSet(object.voter) ? String(object.voter) : '',
            pagination: isSet(object.pagination)
                ? PageRequest.fromJSON(object.pagination)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.voter !== undefined && (obj.voter = message.voter);
        message.pagination !== undefined &&
            (obj.pagination = message.pagination
                ? PageRequest.toJSON(message.pagination)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryVotesByVoterRequest();
        message.voter = object.voter ?? '';
        message.pagination =
            object.pagination !== undefined && object.pagination !== null
                ? PageRequest.fromPartial(object.pagination)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return QueryVotesByVoterRequest.decode(message.value);
    },
    toProto(message) {
        return QueryVotesByVoterRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.group.v1.QueryVotesByVoterRequest',
            value: QueryVotesByVoterRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryVotesByVoterResponse() {
    return {
        votes: [],
        pagination: undefined,
    };
}
export const QueryVotesByVoterResponse = {
    typeUrl: '/cosmos.group.v1.QueryVotesByVoterResponse',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.votes) {
            Vote.encode(v, writer.uint32(10).fork()).ldelim();
        }
        if (message.pagination !== undefined) {
            PageResponse.encode(message.pagination, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryVotesByVoterResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.votes.push(Vote.decode(reader, reader.uint32()));
                    break;
                case 2:
                    message.pagination = PageResponse.decode(reader, reader.uint32());
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
            votes: Array.isArray(object?.votes)
                ? object.votes.map((e) => Vote.fromJSON(e))
                : [],
            pagination: isSet(object.pagination)
                ? PageResponse.fromJSON(object.pagination)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.votes) {
            obj.votes = message.votes.map(e => (e ? Vote.toJSON(e) : undefined));
        }
        else {
            obj.votes = [];
        }
        message.pagination !== undefined &&
            (obj.pagination = message.pagination
                ? PageResponse.toJSON(message.pagination)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryVotesByVoterResponse();
        message.votes = object.votes?.map(e => Vote.fromPartial(e)) || [];
        message.pagination =
            object.pagination !== undefined && object.pagination !== null
                ? PageResponse.fromPartial(object.pagination)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return QueryVotesByVoterResponse.decode(message.value);
    },
    toProto(message) {
        return QueryVotesByVoterResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.group.v1.QueryVotesByVoterResponse',
            value: QueryVotesByVoterResponse.encode(message).finish(),
        };
    },
};
function createBaseQueryGroupsByMemberRequest() {
    return {
        address: '',
        pagination: undefined,
    };
}
export const QueryGroupsByMemberRequest = {
    typeUrl: '/cosmos.group.v1.QueryGroupsByMemberRequest',
    encode(message, writer = BinaryWriter.create()) {
        if (message.address !== '') {
            writer.uint32(10).string(message.address);
        }
        if (message.pagination !== undefined) {
            PageRequest.encode(message.pagination, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryGroupsByMemberRequest();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.address = reader.string();
                    break;
                case 2:
                    message.pagination = PageRequest.decode(reader, reader.uint32());
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
            pagination: isSet(object.pagination)
                ? PageRequest.fromJSON(object.pagination)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.address !== undefined && (obj.address = message.address);
        message.pagination !== undefined &&
            (obj.pagination = message.pagination
                ? PageRequest.toJSON(message.pagination)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryGroupsByMemberRequest();
        message.address = object.address ?? '';
        message.pagination =
            object.pagination !== undefined && object.pagination !== null
                ? PageRequest.fromPartial(object.pagination)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return QueryGroupsByMemberRequest.decode(message.value);
    },
    toProto(message) {
        return QueryGroupsByMemberRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.group.v1.QueryGroupsByMemberRequest',
            value: QueryGroupsByMemberRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryGroupsByMemberResponse() {
    return {
        groups: [],
        pagination: undefined,
    };
}
export const QueryGroupsByMemberResponse = {
    typeUrl: '/cosmos.group.v1.QueryGroupsByMemberResponse',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.groups) {
            GroupInfo.encode(v, writer.uint32(10).fork()).ldelim();
        }
        if (message.pagination !== undefined) {
            PageResponse.encode(message.pagination, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryGroupsByMemberResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.groups.push(GroupInfo.decode(reader, reader.uint32()));
                    break;
                case 2:
                    message.pagination = PageResponse.decode(reader, reader.uint32());
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
            groups: Array.isArray(object?.groups)
                ? object.groups.map((e) => GroupInfo.fromJSON(e))
                : [],
            pagination: isSet(object.pagination)
                ? PageResponse.fromJSON(object.pagination)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.groups) {
            obj.groups = message.groups.map(e => e ? GroupInfo.toJSON(e) : undefined);
        }
        else {
            obj.groups = [];
        }
        message.pagination !== undefined &&
            (obj.pagination = message.pagination
                ? PageResponse.toJSON(message.pagination)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryGroupsByMemberResponse();
        message.groups = object.groups?.map(e => GroupInfo.fromPartial(e)) || [];
        message.pagination =
            object.pagination !== undefined && object.pagination !== null
                ? PageResponse.fromPartial(object.pagination)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return QueryGroupsByMemberResponse.decode(message.value);
    },
    toProto(message) {
        return QueryGroupsByMemberResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.group.v1.QueryGroupsByMemberResponse',
            value: QueryGroupsByMemberResponse.encode(message).finish(),
        };
    },
};
function createBaseQueryTallyResultRequest() {
    return {
        proposalId: BigInt(0),
    };
}
export const QueryTallyResultRequest = {
    typeUrl: '/cosmos.group.v1.QueryTallyResultRequest',
    encode(message, writer = BinaryWriter.create()) {
        if (message.proposalId !== BigInt(0)) {
            writer.uint32(8).uint64(message.proposalId);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryTallyResultRequest();
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
        const message = createBaseQueryTallyResultRequest();
        message.proposalId =
            object.proposalId !== undefined && object.proposalId !== null
                ? BigInt(object.proposalId.toString())
                : BigInt(0);
        return message;
    },
    fromProtoMsg(message) {
        return QueryTallyResultRequest.decode(message.value);
    },
    toProto(message) {
        return QueryTallyResultRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.group.v1.QueryTallyResultRequest',
            value: QueryTallyResultRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryTallyResultResponse() {
    return {
        tally: TallyResult.fromPartial({}),
    };
}
export const QueryTallyResultResponse = {
    typeUrl: '/cosmos.group.v1.QueryTallyResultResponse',
    encode(message, writer = BinaryWriter.create()) {
        if (message.tally !== undefined) {
            TallyResult.encode(message.tally, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryTallyResultResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.tally = TallyResult.decode(reader, reader.uint32());
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
            tally: isSet(object.tally)
                ? TallyResult.fromJSON(object.tally)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.tally !== undefined &&
            (obj.tally = message.tally
                ? TallyResult.toJSON(message.tally)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryTallyResultResponse();
        message.tally =
            object.tally !== undefined && object.tally !== null
                ? TallyResult.fromPartial(object.tally)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return QueryTallyResultResponse.decode(message.value);
    },
    toProto(message) {
        return QueryTallyResultResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.group.v1.QueryTallyResultResponse',
            value: QueryTallyResultResponse.encode(message).finish(),
        };
    },
};
function createBaseQueryGroupsRequest() {
    return {
        pagination: undefined,
    };
}
export const QueryGroupsRequest = {
    typeUrl: '/cosmos.group.v1.QueryGroupsRequest',
    encode(message, writer = BinaryWriter.create()) {
        if (message.pagination !== undefined) {
            PageRequest.encode(message.pagination, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryGroupsRequest();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 2:
                    message.pagination = PageRequest.decode(reader, reader.uint32());
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
            pagination: isSet(object.pagination)
                ? PageRequest.fromJSON(object.pagination)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.pagination !== undefined &&
            (obj.pagination = message.pagination
                ? PageRequest.toJSON(message.pagination)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryGroupsRequest();
        message.pagination =
            object.pagination !== undefined && object.pagination !== null
                ? PageRequest.fromPartial(object.pagination)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return QueryGroupsRequest.decode(message.value);
    },
    toProto(message) {
        return QueryGroupsRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.group.v1.QueryGroupsRequest',
            value: QueryGroupsRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryGroupsResponse() {
    return {
        groups: [],
        pagination: undefined,
    };
}
export const QueryGroupsResponse = {
    typeUrl: '/cosmos.group.v1.QueryGroupsResponse',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.groups) {
            GroupInfo.encode(v, writer.uint32(10).fork()).ldelim();
        }
        if (message.pagination !== undefined) {
            PageResponse.encode(message.pagination, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryGroupsResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.groups.push(GroupInfo.decode(reader, reader.uint32()));
                    break;
                case 2:
                    message.pagination = PageResponse.decode(reader, reader.uint32());
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
            groups: Array.isArray(object?.groups)
                ? object.groups.map((e) => GroupInfo.fromJSON(e))
                : [],
            pagination: isSet(object.pagination)
                ? PageResponse.fromJSON(object.pagination)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.groups) {
            obj.groups = message.groups.map(e => e ? GroupInfo.toJSON(e) : undefined);
        }
        else {
            obj.groups = [];
        }
        message.pagination !== undefined &&
            (obj.pagination = message.pagination
                ? PageResponse.toJSON(message.pagination)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryGroupsResponse();
        message.groups = object.groups?.map(e => GroupInfo.fromPartial(e)) || [];
        message.pagination =
            object.pagination !== undefined && object.pagination !== null
                ? PageResponse.fromPartial(object.pagination)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return QueryGroupsResponse.decode(message.value);
    },
    toProto(message) {
        return QueryGroupsResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.group.v1.QueryGroupsResponse',
            value: QueryGroupsResponse.encode(message).finish(),
        };
    },
};
//# sourceMappingURL=query.js.map