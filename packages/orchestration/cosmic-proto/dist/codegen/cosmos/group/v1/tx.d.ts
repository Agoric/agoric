import { MemberRequest, type MemberRequestSDKType, VoteOption, ProposalExecutorResult } from './types.js';
import { Any, type AnySDKType } from '../../../google/protobuf/any.js';
import { BinaryReader, BinaryWriter } from '../../../binary.js';
import { type JsonSafe } from '../../../json-safe.js';
/** Exec defines modes of execution of a proposal on creation or on new vote. */
export declare enum Exec {
    /**
     * EXEC_UNSPECIFIED - An empty value means that there should be a separate
     * MsgExec request for the proposal to execute.
     */
    EXEC_UNSPECIFIED = 0,
    /**
     * EXEC_TRY - Try to execute the proposal immediately.
     * If the proposal is not allowed per the DecisionPolicy,
     * the proposal will still be open and could
     * be executed at a later point.
     */
    EXEC_TRY = 1,
    UNRECOGNIZED = -1
}
export declare const ExecSDKType: typeof Exec;
export declare function execFromJSON(object: any): Exec;
export declare function execToJSON(object: Exec): string;
/** MsgCreateGroup is the Msg/CreateGroup request type. */
export interface MsgCreateGroup {
    /** admin is the account address of the group admin. */
    admin: string;
    /** members defines the group members. */
    members: MemberRequest[];
    /** metadata is any arbitrary metadata to attached to the group. */
    metadata: string;
}
export interface MsgCreateGroupProtoMsg {
    typeUrl: '/cosmos.group.v1.MsgCreateGroup';
    value: Uint8Array;
}
/** MsgCreateGroup is the Msg/CreateGroup request type. */
export interface MsgCreateGroupSDKType {
    admin: string;
    members: MemberRequestSDKType[];
    metadata: string;
}
/** MsgCreateGroupResponse is the Msg/CreateGroup response type. */
export interface MsgCreateGroupResponse {
    /** group_id is the unique ID of the newly created group. */
    groupId: bigint;
}
export interface MsgCreateGroupResponseProtoMsg {
    typeUrl: '/cosmos.group.v1.MsgCreateGroupResponse';
    value: Uint8Array;
}
/** MsgCreateGroupResponse is the Msg/CreateGroup response type. */
export interface MsgCreateGroupResponseSDKType {
    group_id: bigint;
}
/** MsgUpdateGroupMembers is the Msg/UpdateGroupMembers request type. */
export interface MsgUpdateGroupMembers {
    /** admin is the account address of the group admin. */
    admin: string;
    /** group_id is the unique ID of the group. */
    groupId: bigint;
    /**
     * member_updates is the list of members to update,
     * set weight to 0 to remove a member.
     */
    memberUpdates: MemberRequest[];
}
export interface MsgUpdateGroupMembersProtoMsg {
    typeUrl: '/cosmos.group.v1.MsgUpdateGroupMembers';
    value: Uint8Array;
}
/** MsgUpdateGroupMembers is the Msg/UpdateGroupMembers request type. */
export interface MsgUpdateGroupMembersSDKType {
    admin: string;
    group_id: bigint;
    member_updates: MemberRequestSDKType[];
}
/** MsgUpdateGroupMembersResponse is the Msg/UpdateGroupMembers response type. */
export interface MsgUpdateGroupMembersResponse {
}
export interface MsgUpdateGroupMembersResponseProtoMsg {
    typeUrl: '/cosmos.group.v1.MsgUpdateGroupMembersResponse';
    value: Uint8Array;
}
/** MsgUpdateGroupMembersResponse is the Msg/UpdateGroupMembers response type. */
export interface MsgUpdateGroupMembersResponseSDKType {
}
/** MsgUpdateGroupAdmin is the Msg/UpdateGroupAdmin request type. */
export interface MsgUpdateGroupAdmin {
    /** admin is the current account address of the group admin. */
    admin: string;
    /** group_id is the unique ID of the group. */
    groupId: bigint;
    /** new_admin is the group new admin account address. */
    newAdmin: string;
}
export interface MsgUpdateGroupAdminProtoMsg {
    typeUrl: '/cosmos.group.v1.MsgUpdateGroupAdmin';
    value: Uint8Array;
}
/** MsgUpdateGroupAdmin is the Msg/UpdateGroupAdmin request type. */
export interface MsgUpdateGroupAdminSDKType {
    admin: string;
    group_id: bigint;
    new_admin: string;
}
/** MsgUpdateGroupAdminResponse is the Msg/UpdateGroupAdmin response type. */
export interface MsgUpdateGroupAdminResponse {
}
export interface MsgUpdateGroupAdminResponseProtoMsg {
    typeUrl: '/cosmos.group.v1.MsgUpdateGroupAdminResponse';
    value: Uint8Array;
}
/** MsgUpdateGroupAdminResponse is the Msg/UpdateGroupAdmin response type. */
export interface MsgUpdateGroupAdminResponseSDKType {
}
/** MsgUpdateGroupMetadata is the Msg/UpdateGroupMetadata request type. */
export interface MsgUpdateGroupMetadata {
    /** admin is the account address of the group admin. */
    admin: string;
    /** group_id is the unique ID of the group. */
    groupId: bigint;
    /** metadata is the updated group's metadata. */
    metadata: string;
}
export interface MsgUpdateGroupMetadataProtoMsg {
    typeUrl: '/cosmos.group.v1.MsgUpdateGroupMetadata';
    value: Uint8Array;
}
/** MsgUpdateGroupMetadata is the Msg/UpdateGroupMetadata request type. */
export interface MsgUpdateGroupMetadataSDKType {
    admin: string;
    group_id: bigint;
    metadata: string;
}
/** MsgUpdateGroupMetadataResponse is the Msg/UpdateGroupMetadata response type. */
export interface MsgUpdateGroupMetadataResponse {
}
export interface MsgUpdateGroupMetadataResponseProtoMsg {
    typeUrl: '/cosmos.group.v1.MsgUpdateGroupMetadataResponse';
    value: Uint8Array;
}
/** MsgUpdateGroupMetadataResponse is the Msg/UpdateGroupMetadata response type. */
export interface MsgUpdateGroupMetadataResponseSDKType {
}
/** MsgCreateGroupPolicy is the Msg/CreateGroupPolicy request type. */
export interface MsgCreateGroupPolicy {
    /** admin is the account address of the group admin. */
    admin: string;
    /** group_id is the unique ID of the group. */
    groupId: bigint;
    /** metadata is any arbitrary metadata attached to the group policy. */
    metadata: string;
    /** decision_policy specifies the group policy's decision policy. */
    decisionPolicy?: Any | undefined;
}
export interface MsgCreateGroupPolicyProtoMsg {
    typeUrl: '/cosmos.group.v1.MsgCreateGroupPolicy';
    value: Uint8Array;
}
/** MsgCreateGroupPolicy is the Msg/CreateGroupPolicy request type. */
export interface MsgCreateGroupPolicySDKType {
    admin: string;
    group_id: bigint;
    metadata: string;
    decision_policy?: AnySDKType | undefined;
}
/** MsgCreateGroupPolicyResponse is the Msg/CreateGroupPolicy response type. */
export interface MsgCreateGroupPolicyResponse {
    /** address is the account address of the newly created group policy. */
    address: string;
}
export interface MsgCreateGroupPolicyResponseProtoMsg {
    typeUrl: '/cosmos.group.v1.MsgCreateGroupPolicyResponse';
    value: Uint8Array;
}
/** MsgCreateGroupPolicyResponse is the Msg/CreateGroupPolicy response type. */
export interface MsgCreateGroupPolicyResponseSDKType {
    address: string;
}
/** MsgUpdateGroupPolicyAdmin is the Msg/UpdateGroupPolicyAdmin request type. */
export interface MsgUpdateGroupPolicyAdmin {
    /** admin is the account address of the group admin. */
    admin: string;
    /** group_policy_address is the account address of the group policy. */
    groupPolicyAddress: string;
    /** new_admin is the new group policy admin. */
    newAdmin: string;
}
export interface MsgUpdateGroupPolicyAdminProtoMsg {
    typeUrl: '/cosmos.group.v1.MsgUpdateGroupPolicyAdmin';
    value: Uint8Array;
}
/** MsgUpdateGroupPolicyAdmin is the Msg/UpdateGroupPolicyAdmin request type. */
export interface MsgUpdateGroupPolicyAdminSDKType {
    admin: string;
    group_policy_address: string;
    new_admin: string;
}
/** MsgCreateGroupWithPolicy is the Msg/CreateGroupWithPolicy request type. */
export interface MsgCreateGroupWithPolicy {
    /** admin is the account address of the group and group policy admin. */
    admin: string;
    /** members defines the group members. */
    members: MemberRequest[];
    /** group_metadata is any arbitrary metadata attached to the group. */
    groupMetadata: string;
    /** group_policy_metadata is any arbitrary metadata attached to the group policy. */
    groupPolicyMetadata: string;
    /**
     * group_policy_as_admin is a boolean field, if set to true, the group policy account address will be used as group
     * and group policy admin.
     */
    groupPolicyAsAdmin: boolean;
    /** decision_policy specifies the group policy's decision policy. */
    decisionPolicy?: Any | undefined;
}
export interface MsgCreateGroupWithPolicyProtoMsg {
    typeUrl: '/cosmos.group.v1.MsgCreateGroupWithPolicy';
    value: Uint8Array;
}
/** MsgCreateGroupWithPolicy is the Msg/CreateGroupWithPolicy request type. */
export interface MsgCreateGroupWithPolicySDKType {
    admin: string;
    members: MemberRequestSDKType[];
    group_metadata: string;
    group_policy_metadata: string;
    group_policy_as_admin: boolean;
    decision_policy?: AnySDKType | undefined;
}
/** MsgCreateGroupWithPolicyResponse is the Msg/CreateGroupWithPolicy response type. */
export interface MsgCreateGroupWithPolicyResponse {
    /** group_id is the unique ID of the newly created group with policy. */
    groupId: bigint;
    /** group_policy_address is the account address of the newly created group policy. */
    groupPolicyAddress: string;
}
export interface MsgCreateGroupWithPolicyResponseProtoMsg {
    typeUrl: '/cosmos.group.v1.MsgCreateGroupWithPolicyResponse';
    value: Uint8Array;
}
/** MsgCreateGroupWithPolicyResponse is the Msg/CreateGroupWithPolicy response type. */
export interface MsgCreateGroupWithPolicyResponseSDKType {
    group_id: bigint;
    group_policy_address: string;
}
/** MsgUpdateGroupPolicyAdminResponse is the Msg/UpdateGroupPolicyAdmin response type. */
export interface MsgUpdateGroupPolicyAdminResponse {
}
export interface MsgUpdateGroupPolicyAdminResponseProtoMsg {
    typeUrl: '/cosmos.group.v1.MsgUpdateGroupPolicyAdminResponse';
    value: Uint8Array;
}
/** MsgUpdateGroupPolicyAdminResponse is the Msg/UpdateGroupPolicyAdmin response type. */
export interface MsgUpdateGroupPolicyAdminResponseSDKType {
}
/** MsgUpdateGroupPolicyDecisionPolicy is the Msg/UpdateGroupPolicyDecisionPolicy request type. */
export interface MsgUpdateGroupPolicyDecisionPolicy {
    /** admin is the account address of the group admin. */
    admin: string;
    /** group_policy_address is the account address of group policy. */
    groupPolicyAddress: string;
    /** decision_policy is the updated group policy's decision policy. */
    decisionPolicy?: Any | undefined;
}
export interface MsgUpdateGroupPolicyDecisionPolicyProtoMsg {
    typeUrl: '/cosmos.group.v1.MsgUpdateGroupPolicyDecisionPolicy';
    value: Uint8Array;
}
/** MsgUpdateGroupPolicyDecisionPolicy is the Msg/UpdateGroupPolicyDecisionPolicy request type. */
export interface MsgUpdateGroupPolicyDecisionPolicySDKType {
    admin: string;
    group_policy_address: string;
    decision_policy?: AnySDKType | undefined;
}
/** MsgUpdateGroupPolicyDecisionPolicyResponse is the Msg/UpdateGroupPolicyDecisionPolicy response type. */
export interface MsgUpdateGroupPolicyDecisionPolicyResponse {
}
export interface MsgUpdateGroupPolicyDecisionPolicyResponseProtoMsg {
    typeUrl: '/cosmos.group.v1.MsgUpdateGroupPolicyDecisionPolicyResponse';
    value: Uint8Array;
}
/** MsgUpdateGroupPolicyDecisionPolicyResponse is the Msg/UpdateGroupPolicyDecisionPolicy response type. */
export interface MsgUpdateGroupPolicyDecisionPolicyResponseSDKType {
}
/** MsgUpdateGroupPolicyMetadata is the Msg/UpdateGroupPolicyMetadata request type. */
export interface MsgUpdateGroupPolicyMetadata {
    /** admin is the account address of the group admin. */
    admin: string;
    /** group_policy_address is the account address of group policy. */
    groupPolicyAddress: string;
    /** metadata is the updated group policy metadata. */
    metadata: string;
}
export interface MsgUpdateGroupPolicyMetadataProtoMsg {
    typeUrl: '/cosmos.group.v1.MsgUpdateGroupPolicyMetadata';
    value: Uint8Array;
}
/** MsgUpdateGroupPolicyMetadata is the Msg/UpdateGroupPolicyMetadata request type. */
export interface MsgUpdateGroupPolicyMetadataSDKType {
    admin: string;
    group_policy_address: string;
    metadata: string;
}
/** MsgUpdateGroupPolicyMetadataResponse is the Msg/UpdateGroupPolicyMetadata response type. */
export interface MsgUpdateGroupPolicyMetadataResponse {
}
export interface MsgUpdateGroupPolicyMetadataResponseProtoMsg {
    typeUrl: '/cosmos.group.v1.MsgUpdateGroupPolicyMetadataResponse';
    value: Uint8Array;
}
/** MsgUpdateGroupPolicyMetadataResponse is the Msg/UpdateGroupPolicyMetadata response type. */
export interface MsgUpdateGroupPolicyMetadataResponseSDKType {
}
/** MsgSubmitProposal is the Msg/SubmitProposal request type. */
export interface MsgSubmitProposal {
    /** group_policy_address is the account address of group policy. */
    groupPolicyAddress: string;
    /**
     * proposers are the account addresses of the proposers.
     * Proposers signatures will be counted as yes votes.
     */
    proposers: string[];
    /** metadata is any arbitrary metadata to attached to the proposal. */
    metadata: string;
    /** messages is a list of `sdk.Msg`s that will be executed if the proposal passes. */
    messages: Any[];
    /**
     * exec defines the mode of execution of the proposal,
     * whether it should be executed immediately on creation or not.
     * If so, proposers signatures are considered as Yes votes.
     */
    exec: Exec;
}
export interface MsgSubmitProposalProtoMsg {
    typeUrl: '/cosmos.group.v1.MsgSubmitProposal';
    value: Uint8Array;
}
/** MsgSubmitProposal is the Msg/SubmitProposal request type. */
export interface MsgSubmitProposalSDKType {
    group_policy_address: string;
    proposers: string[];
    metadata: string;
    messages: AnySDKType[];
    exec: Exec;
}
/** MsgSubmitProposalResponse is the Msg/SubmitProposal response type. */
export interface MsgSubmitProposalResponse {
    /** proposal is the unique ID of the proposal. */
    proposalId: bigint;
}
export interface MsgSubmitProposalResponseProtoMsg {
    typeUrl: '/cosmos.group.v1.MsgSubmitProposalResponse';
    value: Uint8Array;
}
/** MsgSubmitProposalResponse is the Msg/SubmitProposal response type. */
export interface MsgSubmitProposalResponseSDKType {
    proposal_id: bigint;
}
/** MsgWithdrawProposal is the Msg/WithdrawProposal request type. */
export interface MsgWithdrawProposal {
    /** proposal is the unique ID of the proposal. */
    proposalId: bigint;
    /** address is the admin of the group policy or one of the proposer of the proposal. */
    address: string;
}
export interface MsgWithdrawProposalProtoMsg {
    typeUrl: '/cosmos.group.v1.MsgWithdrawProposal';
    value: Uint8Array;
}
/** MsgWithdrawProposal is the Msg/WithdrawProposal request type. */
export interface MsgWithdrawProposalSDKType {
    proposal_id: bigint;
    address: string;
}
/** MsgWithdrawProposalResponse is the Msg/WithdrawProposal response type. */
export interface MsgWithdrawProposalResponse {
}
export interface MsgWithdrawProposalResponseProtoMsg {
    typeUrl: '/cosmos.group.v1.MsgWithdrawProposalResponse';
    value: Uint8Array;
}
/** MsgWithdrawProposalResponse is the Msg/WithdrawProposal response type. */
export interface MsgWithdrawProposalResponseSDKType {
}
/** MsgVote is the Msg/Vote request type. */
export interface MsgVote {
    /** proposal is the unique ID of the proposal. */
    proposalId: bigint;
    /** voter is the voter account address. */
    voter: string;
    /** option is the voter's choice on the proposal. */
    option: VoteOption;
    /** metadata is any arbitrary metadata to attached to the vote. */
    metadata: string;
    /**
     * exec defines whether the proposal should be executed
     * immediately after voting or not.
     */
    exec: Exec;
}
export interface MsgVoteProtoMsg {
    typeUrl: '/cosmos.group.v1.MsgVote';
    value: Uint8Array;
}
/** MsgVote is the Msg/Vote request type. */
export interface MsgVoteSDKType {
    proposal_id: bigint;
    voter: string;
    option: VoteOption;
    metadata: string;
    exec: Exec;
}
/** MsgVoteResponse is the Msg/Vote response type. */
export interface MsgVoteResponse {
}
export interface MsgVoteResponseProtoMsg {
    typeUrl: '/cosmos.group.v1.MsgVoteResponse';
    value: Uint8Array;
}
/** MsgVoteResponse is the Msg/Vote response type. */
export interface MsgVoteResponseSDKType {
}
/** MsgExec is the Msg/Exec request type. */
export interface MsgExec {
    /** proposal is the unique ID of the proposal. */
    proposalId: bigint;
    /** executor is the account address used to execute the proposal. */
    executor: string;
}
export interface MsgExecProtoMsg {
    typeUrl: '/cosmos.group.v1.MsgExec';
    value: Uint8Array;
}
/** MsgExec is the Msg/Exec request type. */
export interface MsgExecSDKType {
    proposal_id: bigint;
    executor: string;
}
/** MsgExecResponse is the Msg/Exec request type. */
export interface MsgExecResponse {
    /** result is the final result of the proposal execution. */
    result: ProposalExecutorResult;
}
export interface MsgExecResponseProtoMsg {
    typeUrl: '/cosmos.group.v1.MsgExecResponse';
    value: Uint8Array;
}
/** MsgExecResponse is the Msg/Exec request type. */
export interface MsgExecResponseSDKType {
    result: ProposalExecutorResult;
}
/** MsgLeaveGroup is the Msg/LeaveGroup request type. */
export interface MsgLeaveGroup {
    /** address is the account address of the group member. */
    address: string;
    /** group_id is the unique ID of the group. */
    groupId: bigint;
}
export interface MsgLeaveGroupProtoMsg {
    typeUrl: '/cosmos.group.v1.MsgLeaveGroup';
    value: Uint8Array;
}
/** MsgLeaveGroup is the Msg/LeaveGroup request type. */
export interface MsgLeaveGroupSDKType {
    address: string;
    group_id: bigint;
}
/** MsgLeaveGroupResponse is the Msg/LeaveGroup response type. */
export interface MsgLeaveGroupResponse {
}
export interface MsgLeaveGroupResponseProtoMsg {
    typeUrl: '/cosmos.group.v1.MsgLeaveGroupResponse';
    value: Uint8Array;
}
/** MsgLeaveGroupResponse is the Msg/LeaveGroup response type. */
export interface MsgLeaveGroupResponseSDKType {
}
export declare const MsgCreateGroup: {
    typeUrl: string;
    encode(message: MsgCreateGroup, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgCreateGroup;
    fromJSON(object: any): MsgCreateGroup;
    toJSON(message: MsgCreateGroup): JsonSafe<MsgCreateGroup>;
    fromPartial(object: Partial<MsgCreateGroup>): MsgCreateGroup;
    fromProtoMsg(message: MsgCreateGroupProtoMsg): MsgCreateGroup;
    toProto(message: MsgCreateGroup): Uint8Array;
    toProtoMsg(message: MsgCreateGroup): MsgCreateGroupProtoMsg;
};
export declare const MsgCreateGroupResponse: {
    typeUrl: string;
    encode(message: MsgCreateGroupResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgCreateGroupResponse;
    fromJSON(object: any): MsgCreateGroupResponse;
    toJSON(message: MsgCreateGroupResponse): JsonSafe<MsgCreateGroupResponse>;
    fromPartial(object: Partial<MsgCreateGroupResponse>): MsgCreateGroupResponse;
    fromProtoMsg(message: MsgCreateGroupResponseProtoMsg): MsgCreateGroupResponse;
    toProto(message: MsgCreateGroupResponse): Uint8Array;
    toProtoMsg(message: MsgCreateGroupResponse): MsgCreateGroupResponseProtoMsg;
};
export declare const MsgUpdateGroupMembers: {
    typeUrl: string;
    encode(message: MsgUpdateGroupMembers, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgUpdateGroupMembers;
    fromJSON(object: any): MsgUpdateGroupMembers;
    toJSON(message: MsgUpdateGroupMembers): JsonSafe<MsgUpdateGroupMembers>;
    fromPartial(object: Partial<MsgUpdateGroupMembers>): MsgUpdateGroupMembers;
    fromProtoMsg(message: MsgUpdateGroupMembersProtoMsg): MsgUpdateGroupMembers;
    toProto(message: MsgUpdateGroupMembers): Uint8Array;
    toProtoMsg(message: MsgUpdateGroupMembers): MsgUpdateGroupMembersProtoMsg;
};
export declare const MsgUpdateGroupMembersResponse: {
    typeUrl: string;
    encode(_: MsgUpdateGroupMembersResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgUpdateGroupMembersResponse;
    fromJSON(_: any): MsgUpdateGroupMembersResponse;
    toJSON(_: MsgUpdateGroupMembersResponse): JsonSafe<MsgUpdateGroupMembersResponse>;
    fromPartial(_: Partial<MsgUpdateGroupMembersResponse>): MsgUpdateGroupMembersResponse;
    fromProtoMsg(message: MsgUpdateGroupMembersResponseProtoMsg): MsgUpdateGroupMembersResponse;
    toProto(message: MsgUpdateGroupMembersResponse): Uint8Array;
    toProtoMsg(message: MsgUpdateGroupMembersResponse): MsgUpdateGroupMembersResponseProtoMsg;
};
export declare const MsgUpdateGroupAdmin: {
    typeUrl: string;
    encode(message: MsgUpdateGroupAdmin, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgUpdateGroupAdmin;
    fromJSON(object: any): MsgUpdateGroupAdmin;
    toJSON(message: MsgUpdateGroupAdmin): JsonSafe<MsgUpdateGroupAdmin>;
    fromPartial(object: Partial<MsgUpdateGroupAdmin>): MsgUpdateGroupAdmin;
    fromProtoMsg(message: MsgUpdateGroupAdminProtoMsg): MsgUpdateGroupAdmin;
    toProto(message: MsgUpdateGroupAdmin): Uint8Array;
    toProtoMsg(message: MsgUpdateGroupAdmin): MsgUpdateGroupAdminProtoMsg;
};
export declare const MsgUpdateGroupAdminResponse: {
    typeUrl: string;
    encode(_: MsgUpdateGroupAdminResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgUpdateGroupAdminResponse;
    fromJSON(_: any): MsgUpdateGroupAdminResponse;
    toJSON(_: MsgUpdateGroupAdminResponse): JsonSafe<MsgUpdateGroupAdminResponse>;
    fromPartial(_: Partial<MsgUpdateGroupAdminResponse>): MsgUpdateGroupAdminResponse;
    fromProtoMsg(message: MsgUpdateGroupAdminResponseProtoMsg): MsgUpdateGroupAdminResponse;
    toProto(message: MsgUpdateGroupAdminResponse): Uint8Array;
    toProtoMsg(message: MsgUpdateGroupAdminResponse): MsgUpdateGroupAdminResponseProtoMsg;
};
export declare const MsgUpdateGroupMetadata: {
    typeUrl: string;
    encode(message: MsgUpdateGroupMetadata, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgUpdateGroupMetadata;
    fromJSON(object: any): MsgUpdateGroupMetadata;
    toJSON(message: MsgUpdateGroupMetadata): JsonSafe<MsgUpdateGroupMetadata>;
    fromPartial(object: Partial<MsgUpdateGroupMetadata>): MsgUpdateGroupMetadata;
    fromProtoMsg(message: MsgUpdateGroupMetadataProtoMsg): MsgUpdateGroupMetadata;
    toProto(message: MsgUpdateGroupMetadata): Uint8Array;
    toProtoMsg(message: MsgUpdateGroupMetadata): MsgUpdateGroupMetadataProtoMsg;
};
export declare const MsgUpdateGroupMetadataResponse: {
    typeUrl: string;
    encode(_: MsgUpdateGroupMetadataResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgUpdateGroupMetadataResponse;
    fromJSON(_: any): MsgUpdateGroupMetadataResponse;
    toJSON(_: MsgUpdateGroupMetadataResponse): JsonSafe<MsgUpdateGroupMetadataResponse>;
    fromPartial(_: Partial<MsgUpdateGroupMetadataResponse>): MsgUpdateGroupMetadataResponse;
    fromProtoMsg(message: MsgUpdateGroupMetadataResponseProtoMsg): MsgUpdateGroupMetadataResponse;
    toProto(message: MsgUpdateGroupMetadataResponse): Uint8Array;
    toProtoMsg(message: MsgUpdateGroupMetadataResponse): MsgUpdateGroupMetadataResponseProtoMsg;
};
export declare const MsgCreateGroupPolicy: {
    typeUrl: string;
    encode(message: MsgCreateGroupPolicy, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgCreateGroupPolicy;
    fromJSON(object: any): MsgCreateGroupPolicy;
    toJSON(message: MsgCreateGroupPolicy): JsonSafe<MsgCreateGroupPolicy>;
    fromPartial(object: Partial<MsgCreateGroupPolicy>): MsgCreateGroupPolicy;
    fromProtoMsg(message: MsgCreateGroupPolicyProtoMsg): MsgCreateGroupPolicy;
    toProto(message: MsgCreateGroupPolicy): Uint8Array;
    toProtoMsg(message: MsgCreateGroupPolicy): MsgCreateGroupPolicyProtoMsg;
};
export declare const MsgCreateGroupPolicyResponse: {
    typeUrl: string;
    encode(message: MsgCreateGroupPolicyResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgCreateGroupPolicyResponse;
    fromJSON(object: any): MsgCreateGroupPolicyResponse;
    toJSON(message: MsgCreateGroupPolicyResponse): JsonSafe<MsgCreateGroupPolicyResponse>;
    fromPartial(object: Partial<MsgCreateGroupPolicyResponse>): MsgCreateGroupPolicyResponse;
    fromProtoMsg(message: MsgCreateGroupPolicyResponseProtoMsg): MsgCreateGroupPolicyResponse;
    toProto(message: MsgCreateGroupPolicyResponse): Uint8Array;
    toProtoMsg(message: MsgCreateGroupPolicyResponse): MsgCreateGroupPolicyResponseProtoMsg;
};
export declare const MsgUpdateGroupPolicyAdmin: {
    typeUrl: string;
    encode(message: MsgUpdateGroupPolicyAdmin, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgUpdateGroupPolicyAdmin;
    fromJSON(object: any): MsgUpdateGroupPolicyAdmin;
    toJSON(message: MsgUpdateGroupPolicyAdmin): JsonSafe<MsgUpdateGroupPolicyAdmin>;
    fromPartial(object: Partial<MsgUpdateGroupPolicyAdmin>): MsgUpdateGroupPolicyAdmin;
    fromProtoMsg(message: MsgUpdateGroupPolicyAdminProtoMsg): MsgUpdateGroupPolicyAdmin;
    toProto(message: MsgUpdateGroupPolicyAdmin): Uint8Array;
    toProtoMsg(message: MsgUpdateGroupPolicyAdmin): MsgUpdateGroupPolicyAdminProtoMsg;
};
export declare const MsgCreateGroupWithPolicy: {
    typeUrl: string;
    encode(message: MsgCreateGroupWithPolicy, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgCreateGroupWithPolicy;
    fromJSON(object: any): MsgCreateGroupWithPolicy;
    toJSON(message: MsgCreateGroupWithPolicy): JsonSafe<MsgCreateGroupWithPolicy>;
    fromPartial(object: Partial<MsgCreateGroupWithPolicy>): MsgCreateGroupWithPolicy;
    fromProtoMsg(message: MsgCreateGroupWithPolicyProtoMsg): MsgCreateGroupWithPolicy;
    toProto(message: MsgCreateGroupWithPolicy): Uint8Array;
    toProtoMsg(message: MsgCreateGroupWithPolicy): MsgCreateGroupWithPolicyProtoMsg;
};
export declare const MsgCreateGroupWithPolicyResponse: {
    typeUrl: string;
    encode(message: MsgCreateGroupWithPolicyResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgCreateGroupWithPolicyResponse;
    fromJSON(object: any): MsgCreateGroupWithPolicyResponse;
    toJSON(message: MsgCreateGroupWithPolicyResponse): JsonSafe<MsgCreateGroupWithPolicyResponse>;
    fromPartial(object: Partial<MsgCreateGroupWithPolicyResponse>): MsgCreateGroupWithPolicyResponse;
    fromProtoMsg(message: MsgCreateGroupWithPolicyResponseProtoMsg): MsgCreateGroupWithPolicyResponse;
    toProto(message: MsgCreateGroupWithPolicyResponse): Uint8Array;
    toProtoMsg(message: MsgCreateGroupWithPolicyResponse): MsgCreateGroupWithPolicyResponseProtoMsg;
};
export declare const MsgUpdateGroupPolicyAdminResponse: {
    typeUrl: string;
    encode(_: MsgUpdateGroupPolicyAdminResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgUpdateGroupPolicyAdminResponse;
    fromJSON(_: any): MsgUpdateGroupPolicyAdminResponse;
    toJSON(_: MsgUpdateGroupPolicyAdminResponse): JsonSafe<MsgUpdateGroupPolicyAdminResponse>;
    fromPartial(_: Partial<MsgUpdateGroupPolicyAdminResponse>): MsgUpdateGroupPolicyAdminResponse;
    fromProtoMsg(message: MsgUpdateGroupPolicyAdminResponseProtoMsg): MsgUpdateGroupPolicyAdminResponse;
    toProto(message: MsgUpdateGroupPolicyAdminResponse): Uint8Array;
    toProtoMsg(message: MsgUpdateGroupPolicyAdminResponse): MsgUpdateGroupPolicyAdminResponseProtoMsg;
};
export declare const MsgUpdateGroupPolicyDecisionPolicy: {
    typeUrl: string;
    encode(message: MsgUpdateGroupPolicyDecisionPolicy, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgUpdateGroupPolicyDecisionPolicy;
    fromJSON(object: any): MsgUpdateGroupPolicyDecisionPolicy;
    toJSON(message: MsgUpdateGroupPolicyDecisionPolicy): JsonSafe<MsgUpdateGroupPolicyDecisionPolicy>;
    fromPartial(object: Partial<MsgUpdateGroupPolicyDecisionPolicy>): MsgUpdateGroupPolicyDecisionPolicy;
    fromProtoMsg(message: MsgUpdateGroupPolicyDecisionPolicyProtoMsg): MsgUpdateGroupPolicyDecisionPolicy;
    toProto(message: MsgUpdateGroupPolicyDecisionPolicy): Uint8Array;
    toProtoMsg(message: MsgUpdateGroupPolicyDecisionPolicy): MsgUpdateGroupPolicyDecisionPolicyProtoMsg;
};
export declare const MsgUpdateGroupPolicyDecisionPolicyResponse: {
    typeUrl: string;
    encode(_: MsgUpdateGroupPolicyDecisionPolicyResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgUpdateGroupPolicyDecisionPolicyResponse;
    fromJSON(_: any): MsgUpdateGroupPolicyDecisionPolicyResponse;
    toJSON(_: MsgUpdateGroupPolicyDecisionPolicyResponse): JsonSafe<MsgUpdateGroupPolicyDecisionPolicyResponse>;
    fromPartial(_: Partial<MsgUpdateGroupPolicyDecisionPolicyResponse>): MsgUpdateGroupPolicyDecisionPolicyResponse;
    fromProtoMsg(message: MsgUpdateGroupPolicyDecisionPolicyResponseProtoMsg): MsgUpdateGroupPolicyDecisionPolicyResponse;
    toProto(message: MsgUpdateGroupPolicyDecisionPolicyResponse): Uint8Array;
    toProtoMsg(message: MsgUpdateGroupPolicyDecisionPolicyResponse): MsgUpdateGroupPolicyDecisionPolicyResponseProtoMsg;
};
export declare const MsgUpdateGroupPolicyMetadata: {
    typeUrl: string;
    encode(message: MsgUpdateGroupPolicyMetadata, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgUpdateGroupPolicyMetadata;
    fromJSON(object: any): MsgUpdateGroupPolicyMetadata;
    toJSON(message: MsgUpdateGroupPolicyMetadata): JsonSafe<MsgUpdateGroupPolicyMetadata>;
    fromPartial(object: Partial<MsgUpdateGroupPolicyMetadata>): MsgUpdateGroupPolicyMetadata;
    fromProtoMsg(message: MsgUpdateGroupPolicyMetadataProtoMsg): MsgUpdateGroupPolicyMetadata;
    toProto(message: MsgUpdateGroupPolicyMetadata): Uint8Array;
    toProtoMsg(message: MsgUpdateGroupPolicyMetadata): MsgUpdateGroupPolicyMetadataProtoMsg;
};
export declare const MsgUpdateGroupPolicyMetadataResponse: {
    typeUrl: string;
    encode(_: MsgUpdateGroupPolicyMetadataResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgUpdateGroupPolicyMetadataResponse;
    fromJSON(_: any): MsgUpdateGroupPolicyMetadataResponse;
    toJSON(_: MsgUpdateGroupPolicyMetadataResponse): JsonSafe<MsgUpdateGroupPolicyMetadataResponse>;
    fromPartial(_: Partial<MsgUpdateGroupPolicyMetadataResponse>): MsgUpdateGroupPolicyMetadataResponse;
    fromProtoMsg(message: MsgUpdateGroupPolicyMetadataResponseProtoMsg): MsgUpdateGroupPolicyMetadataResponse;
    toProto(message: MsgUpdateGroupPolicyMetadataResponse): Uint8Array;
    toProtoMsg(message: MsgUpdateGroupPolicyMetadataResponse): MsgUpdateGroupPolicyMetadataResponseProtoMsg;
};
export declare const MsgSubmitProposal: {
    typeUrl: string;
    encode(message: MsgSubmitProposal, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgSubmitProposal;
    fromJSON(object: any): MsgSubmitProposal;
    toJSON(message: MsgSubmitProposal): JsonSafe<MsgSubmitProposal>;
    fromPartial(object: Partial<MsgSubmitProposal>): MsgSubmitProposal;
    fromProtoMsg(message: MsgSubmitProposalProtoMsg): MsgSubmitProposal;
    toProto(message: MsgSubmitProposal): Uint8Array;
    toProtoMsg(message: MsgSubmitProposal): MsgSubmitProposalProtoMsg;
};
export declare const MsgSubmitProposalResponse: {
    typeUrl: string;
    encode(message: MsgSubmitProposalResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgSubmitProposalResponse;
    fromJSON(object: any): MsgSubmitProposalResponse;
    toJSON(message: MsgSubmitProposalResponse): JsonSafe<MsgSubmitProposalResponse>;
    fromPartial(object: Partial<MsgSubmitProposalResponse>): MsgSubmitProposalResponse;
    fromProtoMsg(message: MsgSubmitProposalResponseProtoMsg): MsgSubmitProposalResponse;
    toProto(message: MsgSubmitProposalResponse): Uint8Array;
    toProtoMsg(message: MsgSubmitProposalResponse): MsgSubmitProposalResponseProtoMsg;
};
export declare const MsgWithdrawProposal: {
    typeUrl: string;
    encode(message: MsgWithdrawProposal, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgWithdrawProposal;
    fromJSON(object: any): MsgWithdrawProposal;
    toJSON(message: MsgWithdrawProposal): JsonSafe<MsgWithdrawProposal>;
    fromPartial(object: Partial<MsgWithdrawProposal>): MsgWithdrawProposal;
    fromProtoMsg(message: MsgWithdrawProposalProtoMsg): MsgWithdrawProposal;
    toProto(message: MsgWithdrawProposal): Uint8Array;
    toProtoMsg(message: MsgWithdrawProposal): MsgWithdrawProposalProtoMsg;
};
export declare const MsgWithdrawProposalResponse: {
    typeUrl: string;
    encode(_: MsgWithdrawProposalResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgWithdrawProposalResponse;
    fromJSON(_: any): MsgWithdrawProposalResponse;
    toJSON(_: MsgWithdrawProposalResponse): JsonSafe<MsgWithdrawProposalResponse>;
    fromPartial(_: Partial<MsgWithdrawProposalResponse>): MsgWithdrawProposalResponse;
    fromProtoMsg(message: MsgWithdrawProposalResponseProtoMsg): MsgWithdrawProposalResponse;
    toProto(message: MsgWithdrawProposalResponse): Uint8Array;
    toProtoMsg(message: MsgWithdrawProposalResponse): MsgWithdrawProposalResponseProtoMsg;
};
export declare const MsgVote: {
    typeUrl: string;
    encode(message: MsgVote, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgVote;
    fromJSON(object: any): MsgVote;
    toJSON(message: MsgVote): JsonSafe<MsgVote>;
    fromPartial(object: Partial<MsgVote>): MsgVote;
    fromProtoMsg(message: MsgVoteProtoMsg): MsgVote;
    toProto(message: MsgVote): Uint8Array;
    toProtoMsg(message: MsgVote): MsgVoteProtoMsg;
};
export declare const MsgVoteResponse: {
    typeUrl: string;
    encode(_: MsgVoteResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgVoteResponse;
    fromJSON(_: any): MsgVoteResponse;
    toJSON(_: MsgVoteResponse): JsonSafe<MsgVoteResponse>;
    fromPartial(_: Partial<MsgVoteResponse>): MsgVoteResponse;
    fromProtoMsg(message: MsgVoteResponseProtoMsg): MsgVoteResponse;
    toProto(message: MsgVoteResponse): Uint8Array;
    toProtoMsg(message: MsgVoteResponse): MsgVoteResponseProtoMsg;
};
export declare const MsgExec: {
    typeUrl: string;
    encode(message: MsgExec, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgExec;
    fromJSON(object: any): MsgExec;
    toJSON(message: MsgExec): JsonSafe<MsgExec>;
    fromPartial(object: Partial<MsgExec>): MsgExec;
    fromProtoMsg(message: MsgExecProtoMsg): MsgExec;
    toProto(message: MsgExec): Uint8Array;
    toProtoMsg(message: MsgExec): MsgExecProtoMsg;
};
export declare const MsgExecResponse: {
    typeUrl: string;
    encode(message: MsgExecResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgExecResponse;
    fromJSON(object: any): MsgExecResponse;
    toJSON(message: MsgExecResponse): JsonSafe<MsgExecResponse>;
    fromPartial(object: Partial<MsgExecResponse>): MsgExecResponse;
    fromProtoMsg(message: MsgExecResponseProtoMsg): MsgExecResponse;
    toProto(message: MsgExecResponse): Uint8Array;
    toProtoMsg(message: MsgExecResponse): MsgExecResponseProtoMsg;
};
export declare const MsgLeaveGroup: {
    typeUrl: string;
    encode(message: MsgLeaveGroup, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgLeaveGroup;
    fromJSON(object: any): MsgLeaveGroup;
    toJSON(message: MsgLeaveGroup): JsonSafe<MsgLeaveGroup>;
    fromPartial(object: Partial<MsgLeaveGroup>): MsgLeaveGroup;
    fromProtoMsg(message: MsgLeaveGroupProtoMsg): MsgLeaveGroup;
    toProto(message: MsgLeaveGroup): Uint8Array;
    toProtoMsg(message: MsgLeaveGroup): MsgLeaveGroupProtoMsg;
};
export declare const MsgLeaveGroupResponse: {
    typeUrl: string;
    encode(_: MsgLeaveGroupResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): MsgLeaveGroupResponse;
    fromJSON(_: any): MsgLeaveGroupResponse;
    toJSON(_: MsgLeaveGroupResponse): JsonSafe<MsgLeaveGroupResponse>;
    fromPartial(_: Partial<MsgLeaveGroupResponse>): MsgLeaveGroupResponse;
    fromProtoMsg(message: MsgLeaveGroupResponseProtoMsg): MsgLeaveGroupResponse;
    toProto(message: MsgLeaveGroupResponse): Uint8Array;
    toProtoMsg(message: MsgLeaveGroupResponse): MsgLeaveGroupResponseProtoMsg;
};
export declare const Cosmos_groupv1DecisionPolicy_InterfaceDecoder: (input: BinaryReader | Uint8Array) => Any;
