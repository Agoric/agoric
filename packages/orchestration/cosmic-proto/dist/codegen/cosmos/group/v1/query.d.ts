import { PageRequest, type PageRequestSDKType, PageResponse, type PageResponseSDKType } from '../../base/query/v1beta1/pagination.js';
import { GroupInfo, type GroupInfoSDKType, GroupPolicyInfo, type GroupPolicyInfoSDKType, GroupMember, type GroupMemberSDKType, Proposal, type ProposalSDKType, Vote, type VoteSDKType, TallyResult, type TallyResultSDKType } from './types.js';
import { BinaryReader, BinaryWriter } from '../../../binary.js';
import { type JsonSafe } from '../../../json-safe.js';
/** QueryGroupInfoRequest is the Query/GroupInfo request type. */
export interface QueryGroupInfoRequest {
    /** group_id is the unique ID of the group. */
    groupId: bigint;
}
export interface QueryGroupInfoRequestProtoMsg {
    typeUrl: '/cosmos.group.v1.QueryGroupInfoRequest';
    value: Uint8Array;
}
/** QueryGroupInfoRequest is the Query/GroupInfo request type. */
export interface QueryGroupInfoRequestSDKType {
    group_id: bigint;
}
/** QueryGroupInfoResponse is the Query/GroupInfo response type. */
export interface QueryGroupInfoResponse {
    /** info is the GroupInfo for the group. */
    info?: GroupInfo;
}
export interface QueryGroupInfoResponseProtoMsg {
    typeUrl: '/cosmos.group.v1.QueryGroupInfoResponse';
    value: Uint8Array;
}
/** QueryGroupInfoResponse is the Query/GroupInfo response type. */
export interface QueryGroupInfoResponseSDKType {
    info?: GroupInfoSDKType;
}
/** QueryGroupPolicyInfoRequest is the Query/GroupPolicyInfo request type. */
export interface QueryGroupPolicyInfoRequest {
    /** address is the account address of the group policy. */
    address: string;
}
export interface QueryGroupPolicyInfoRequestProtoMsg {
    typeUrl: '/cosmos.group.v1.QueryGroupPolicyInfoRequest';
    value: Uint8Array;
}
/** QueryGroupPolicyInfoRequest is the Query/GroupPolicyInfo request type. */
export interface QueryGroupPolicyInfoRequestSDKType {
    address: string;
}
/** QueryGroupPolicyInfoResponse is the Query/GroupPolicyInfo response type. */
export interface QueryGroupPolicyInfoResponse {
    /** info is the GroupPolicyInfo for the group policy. */
    info?: GroupPolicyInfo;
}
export interface QueryGroupPolicyInfoResponseProtoMsg {
    typeUrl: '/cosmos.group.v1.QueryGroupPolicyInfoResponse';
    value: Uint8Array;
}
/** QueryGroupPolicyInfoResponse is the Query/GroupPolicyInfo response type. */
export interface QueryGroupPolicyInfoResponseSDKType {
    info?: GroupPolicyInfoSDKType;
}
/** QueryGroupMembersRequest is the Query/GroupMembers request type. */
export interface QueryGroupMembersRequest {
    /** group_id is the unique ID of the group. */
    groupId: bigint;
    /** pagination defines an optional pagination for the request. */
    pagination?: PageRequest;
}
export interface QueryGroupMembersRequestProtoMsg {
    typeUrl: '/cosmos.group.v1.QueryGroupMembersRequest';
    value: Uint8Array;
}
/** QueryGroupMembersRequest is the Query/GroupMembers request type. */
export interface QueryGroupMembersRequestSDKType {
    group_id: bigint;
    pagination?: PageRequestSDKType;
}
/** QueryGroupMembersResponse is the Query/GroupMembersResponse response type. */
export interface QueryGroupMembersResponse {
    /** members are the members of the group with given group_id. */
    members: GroupMember[];
    /** pagination defines the pagination in the response. */
    pagination?: PageResponse;
}
export interface QueryGroupMembersResponseProtoMsg {
    typeUrl: '/cosmos.group.v1.QueryGroupMembersResponse';
    value: Uint8Array;
}
/** QueryGroupMembersResponse is the Query/GroupMembersResponse response type. */
export interface QueryGroupMembersResponseSDKType {
    members: GroupMemberSDKType[];
    pagination?: PageResponseSDKType;
}
/** QueryGroupsByAdminRequest is the Query/GroupsByAdmin request type. */
export interface QueryGroupsByAdminRequest {
    /** admin is the account address of a group's admin. */
    admin: string;
    /** pagination defines an optional pagination for the request. */
    pagination?: PageRequest;
}
export interface QueryGroupsByAdminRequestProtoMsg {
    typeUrl: '/cosmos.group.v1.QueryGroupsByAdminRequest';
    value: Uint8Array;
}
/** QueryGroupsByAdminRequest is the Query/GroupsByAdmin request type. */
export interface QueryGroupsByAdminRequestSDKType {
    admin: string;
    pagination?: PageRequestSDKType;
}
/** QueryGroupsByAdminResponse is the Query/GroupsByAdminResponse response type. */
export interface QueryGroupsByAdminResponse {
    /** groups are the groups info with the provided admin. */
    groups: GroupInfo[];
    /** pagination defines the pagination in the response. */
    pagination?: PageResponse;
}
export interface QueryGroupsByAdminResponseProtoMsg {
    typeUrl: '/cosmos.group.v1.QueryGroupsByAdminResponse';
    value: Uint8Array;
}
/** QueryGroupsByAdminResponse is the Query/GroupsByAdminResponse response type. */
export interface QueryGroupsByAdminResponseSDKType {
    groups: GroupInfoSDKType[];
    pagination?: PageResponseSDKType;
}
/** QueryGroupPoliciesByGroupRequest is the Query/GroupPoliciesByGroup request type. */
export interface QueryGroupPoliciesByGroupRequest {
    /** group_id is the unique ID of the group policy's group. */
    groupId: bigint;
    /** pagination defines an optional pagination for the request. */
    pagination?: PageRequest;
}
export interface QueryGroupPoliciesByGroupRequestProtoMsg {
    typeUrl: '/cosmos.group.v1.QueryGroupPoliciesByGroupRequest';
    value: Uint8Array;
}
/** QueryGroupPoliciesByGroupRequest is the Query/GroupPoliciesByGroup request type. */
export interface QueryGroupPoliciesByGroupRequestSDKType {
    group_id: bigint;
    pagination?: PageRequestSDKType;
}
/** QueryGroupPoliciesByGroupResponse is the Query/GroupPoliciesByGroup response type. */
export interface QueryGroupPoliciesByGroupResponse {
    /** group_policies are the group policies info associated with the provided group. */
    groupPolicies: GroupPolicyInfo[];
    /** pagination defines the pagination in the response. */
    pagination?: PageResponse;
}
export interface QueryGroupPoliciesByGroupResponseProtoMsg {
    typeUrl: '/cosmos.group.v1.QueryGroupPoliciesByGroupResponse';
    value: Uint8Array;
}
/** QueryGroupPoliciesByGroupResponse is the Query/GroupPoliciesByGroup response type. */
export interface QueryGroupPoliciesByGroupResponseSDKType {
    group_policies: GroupPolicyInfoSDKType[];
    pagination?: PageResponseSDKType;
}
/** QueryGroupPoliciesByAdminRequest is the Query/GroupPoliciesByAdmin request type. */
export interface QueryGroupPoliciesByAdminRequest {
    /** admin is the admin address of the group policy. */
    admin: string;
    /** pagination defines an optional pagination for the request. */
    pagination?: PageRequest;
}
export interface QueryGroupPoliciesByAdminRequestProtoMsg {
    typeUrl: '/cosmos.group.v1.QueryGroupPoliciesByAdminRequest';
    value: Uint8Array;
}
/** QueryGroupPoliciesByAdminRequest is the Query/GroupPoliciesByAdmin request type. */
export interface QueryGroupPoliciesByAdminRequestSDKType {
    admin: string;
    pagination?: PageRequestSDKType;
}
/** QueryGroupPoliciesByAdminResponse is the Query/GroupPoliciesByAdmin response type. */
export interface QueryGroupPoliciesByAdminResponse {
    /** group_policies are the group policies info with provided admin. */
    groupPolicies: GroupPolicyInfo[];
    /** pagination defines the pagination in the response. */
    pagination?: PageResponse;
}
export interface QueryGroupPoliciesByAdminResponseProtoMsg {
    typeUrl: '/cosmos.group.v1.QueryGroupPoliciesByAdminResponse';
    value: Uint8Array;
}
/** QueryGroupPoliciesByAdminResponse is the Query/GroupPoliciesByAdmin response type. */
export interface QueryGroupPoliciesByAdminResponseSDKType {
    group_policies: GroupPolicyInfoSDKType[];
    pagination?: PageResponseSDKType;
}
/** QueryProposalRequest is the Query/Proposal request type. */
export interface QueryProposalRequest {
    /** proposal_id is the unique ID of a proposal. */
    proposalId: bigint;
}
export interface QueryProposalRequestProtoMsg {
    typeUrl: '/cosmos.group.v1.QueryProposalRequest';
    value: Uint8Array;
}
/** QueryProposalRequest is the Query/Proposal request type. */
export interface QueryProposalRequestSDKType {
    proposal_id: bigint;
}
/** QueryProposalResponse is the Query/Proposal response type. */
export interface QueryProposalResponse {
    /** proposal is the proposal info. */
    proposal?: Proposal;
}
export interface QueryProposalResponseProtoMsg {
    typeUrl: '/cosmos.group.v1.QueryProposalResponse';
    value: Uint8Array;
}
/** QueryProposalResponse is the Query/Proposal response type. */
export interface QueryProposalResponseSDKType {
    proposal?: ProposalSDKType;
}
/** QueryProposalsByGroupPolicyRequest is the Query/ProposalByGroupPolicy request type. */
export interface QueryProposalsByGroupPolicyRequest {
    /** address is the account address of the group policy related to proposals. */
    address: string;
    /** pagination defines an optional pagination for the request. */
    pagination?: PageRequest;
}
export interface QueryProposalsByGroupPolicyRequestProtoMsg {
    typeUrl: '/cosmos.group.v1.QueryProposalsByGroupPolicyRequest';
    value: Uint8Array;
}
/** QueryProposalsByGroupPolicyRequest is the Query/ProposalByGroupPolicy request type. */
export interface QueryProposalsByGroupPolicyRequestSDKType {
    address: string;
    pagination?: PageRequestSDKType;
}
/** QueryProposalsByGroupPolicyResponse is the Query/ProposalByGroupPolicy response type. */
export interface QueryProposalsByGroupPolicyResponse {
    /** proposals are the proposals with given group policy. */
    proposals: Proposal[];
    /** pagination defines the pagination in the response. */
    pagination?: PageResponse;
}
export interface QueryProposalsByGroupPolicyResponseProtoMsg {
    typeUrl: '/cosmos.group.v1.QueryProposalsByGroupPolicyResponse';
    value: Uint8Array;
}
/** QueryProposalsByGroupPolicyResponse is the Query/ProposalByGroupPolicy response type. */
export interface QueryProposalsByGroupPolicyResponseSDKType {
    proposals: ProposalSDKType[];
    pagination?: PageResponseSDKType;
}
/** QueryVoteByProposalVoterRequest is the Query/VoteByProposalVoter request type. */
export interface QueryVoteByProposalVoterRequest {
    /** proposal_id is the unique ID of a proposal. */
    proposalId: bigint;
    /** voter is a proposal voter account address. */
    voter: string;
}
export interface QueryVoteByProposalVoterRequestProtoMsg {
    typeUrl: '/cosmos.group.v1.QueryVoteByProposalVoterRequest';
    value: Uint8Array;
}
/** QueryVoteByProposalVoterRequest is the Query/VoteByProposalVoter request type. */
export interface QueryVoteByProposalVoterRequestSDKType {
    proposal_id: bigint;
    voter: string;
}
/** QueryVoteByProposalVoterResponse is the Query/VoteByProposalVoter response type. */
export interface QueryVoteByProposalVoterResponse {
    /** vote is the vote with given proposal_id and voter. */
    vote?: Vote;
}
export interface QueryVoteByProposalVoterResponseProtoMsg {
    typeUrl: '/cosmos.group.v1.QueryVoteByProposalVoterResponse';
    value: Uint8Array;
}
/** QueryVoteByProposalVoterResponse is the Query/VoteByProposalVoter response type. */
export interface QueryVoteByProposalVoterResponseSDKType {
    vote?: VoteSDKType;
}
/** QueryVotesByProposalRequest is the Query/VotesByProposal request type. */
export interface QueryVotesByProposalRequest {
    /** proposal_id is the unique ID of a proposal. */
    proposalId: bigint;
    /** pagination defines an optional pagination for the request. */
    pagination?: PageRequest;
}
export interface QueryVotesByProposalRequestProtoMsg {
    typeUrl: '/cosmos.group.v1.QueryVotesByProposalRequest';
    value: Uint8Array;
}
/** QueryVotesByProposalRequest is the Query/VotesByProposal request type. */
export interface QueryVotesByProposalRequestSDKType {
    proposal_id: bigint;
    pagination?: PageRequestSDKType;
}
/** QueryVotesByProposalResponse is the Query/VotesByProposal response type. */
export interface QueryVotesByProposalResponse {
    /** votes are the list of votes for given proposal_id. */
    votes: Vote[];
    /** pagination defines the pagination in the response. */
    pagination?: PageResponse;
}
export interface QueryVotesByProposalResponseProtoMsg {
    typeUrl: '/cosmos.group.v1.QueryVotesByProposalResponse';
    value: Uint8Array;
}
/** QueryVotesByProposalResponse is the Query/VotesByProposal response type. */
export interface QueryVotesByProposalResponseSDKType {
    votes: VoteSDKType[];
    pagination?: PageResponseSDKType;
}
/** QueryVotesByVoterRequest is the Query/VotesByVoter request type. */
export interface QueryVotesByVoterRequest {
    /** voter is a proposal voter account address. */
    voter: string;
    /** pagination defines an optional pagination for the request. */
    pagination?: PageRequest;
}
export interface QueryVotesByVoterRequestProtoMsg {
    typeUrl: '/cosmos.group.v1.QueryVotesByVoterRequest';
    value: Uint8Array;
}
/** QueryVotesByVoterRequest is the Query/VotesByVoter request type. */
export interface QueryVotesByVoterRequestSDKType {
    voter: string;
    pagination?: PageRequestSDKType;
}
/** QueryVotesByVoterResponse is the Query/VotesByVoter response type. */
export interface QueryVotesByVoterResponse {
    /** votes are the list of votes by given voter. */
    votes: Vote[];
    /** pagination defines the pagination in the response. */
    pagination?: PageResponse;
}
export interface QueryVotesByVoterResponseProtoMsg {
    typeUrl: '/cosmos.group.v1.QueryVotesByVoterResponse';
    value: Uint8Array;
}
/** QueryVotesByVoterResponse is the Query/VotesByVoter response type. */
export interface QueryVotesByVoterResponseSDKType {
    votes: VoteSDKType[];
    pagination?: PageResponseSDKType;
}
/** QueryGroupsByMemberRequest is the Query/GroupsByMember request type. */
export interface QueryGroupsByMemberRequest {
    /** address is the group member address. */
    address: string;
    /** pagination defines an optional pagination for the request. */
    pagination?: PageRequest;
}
export interface QueryGroupsByMemberRequestProtoMsg {
    typeUrl: '/cosmos.group.v1.QueryGroupsByMemberRequest';
    value: Uint8Array;
}
/** QueryGroupsByMemberRequest is the Query/GroupsByMember request type. */
export interface QueryGroupsByMemberRequestSDKType {
    address: string;
    pagination?: PageRequestSDKType;
}
/** QueryGroupsByMemberResponse is the Query/GroupsByMember response type. */
export interface QueryGroupsByMemberResponse {
    /** groups are the groups info with the provided group member. */
    groups: GroupInfo[];
    /** pagination defines the pagination in the response. */
    pagination?: PageResponse;
}
export interface QueryGroupsByMemberResponseProtoMsg {
    typeUrl: '/cosmos.group.v1.QueryGroupsByMemberResponse';
    value: Uint8Array;
}
/** QueryGroupsByMemberResponse is the Query/GroupsByMember response type. */
export interface QueryGroupsByMemberResponseSDKType {
    groups: GroupInfoSDKType[];
    pagination?: PageResponseSDKType;
}
/** QueryTallyResultRequest is the Query/TallyResult request type. */
export interface QueryTallyResultRequest {
    /** proposal_id is the unique id of a proposal. */
    proposalId: bigint;
}
export interface QueryTallyResultRequestProtoMsg {
    typeUrl: '/cosmos.group.v1.QueryTallyResultRequest';
    value: Uint8Array;
}
/** QueryTallyResultRequest is the Query/TallyResult request type. */
export interface QueryTallyResultRequestSDKType {
    proposal_id: bigint;
}
/** QueryTallyResultResponse is the Query/TallyResult response type. */
export interface QueryTallyResultResponse {
    /** tally defines the requested tally. */
    tally: TallyResult;
}
export interface QueryTallyResultResponseProtoMsg {
    typeUrl: '/cosmos.group.v1.QueryTallyResultResponse';
    value: Uint8Array;
}
/** QueryTallyResultResponse is the Query/TallyResult response type. */
export interface QueryTallyResultResponseSDKType {
    tally: TallyResultSDKType;
}
/**
 * QueryGroupsRequest is the Query/Groups request type.
 *
 * Since: cosmos-sdk 0.47.1
 */
export interface QueryGroupsRequest {
    /** pagination defines an optional pagination for the request. */
    pagination?: PageRequest;
}
export interface QueryGroupsRequestProtoMsg {
    typeUrl: '/cosmos.group.v1.QueryGroupsRequest';
    value: Uint8Array;
}
/**
 * QueryGroupsRequest is the Query/Groups request type.
 *
 * Since: cosmos-sdk 0.47.1
 */
export interface QueryGroupsRequestSDKType {
    pagination?: PageRequestSDKType;
}
/**
 * QueryGroupsResponse is the Query/Groups response type.
 *
 * Since: cosmos-sdk 0.47.1
 */
export interface QueryGroupsResponse {
    /** `groups` is all the groups present in state. */
    groups: GroupInfo[];
    /** pagination defines the pagination in the response. */
    pagination?: PageResponse;
}
export interface QueryGroupsResponseProtoMsg {
    typeUrl: '/cosmos.group.v1.QueryGroupsResponse';
    value: Uint8Array;
}
/**
 * QueryGroupsResponse is the Query/Groups response type.
 *
 * Since: cosmos-sdk 0.47.1
 */
export interface QueryGroupsResponseSDKType {
    groups: GroupInfoSDKType[];
    pagination?: PageResponseSDKType;
}
export declare const QueryGroupInfoRequest: {
    typeUrl: string;
    encode(message: QueryGroupInfoRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryGroupInfoRequest;
    fromJSON(object: any): QueryGroupInfoRequest;
    toJSON(message: QueryGroupInfoRequest): JsonSafe<QueryGroupInfoRequest>;
    fromPartial(object: Partial<QueryGroupInfoRequest>): QueryGroupInfoRequest;
    fromProtoMsg(message: QueryGroupInfoRequestProtoMsg): QueryGroupInfoRequest;
    toProto(message: QueryGroupInfoRequest): Uint8Array;
    toProtoMsg(message: QueryGroupInfoRequest): QueryGroupInfoRequestProtoMsg;
};
export declare const QueryGroupInfoResponse: {
    typeUrl: string;
    encode(message: QueryGroupInfoResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryGroupInfoResponse;
    fromJSON(object: any): QueryGroupInfoResponse;
    toJSON(message: QueryGroupInfoResponse): JsonSafe<QueryGroupInfoResponse>;
    fromPartial(object: Partial<QueryGroupInfoResponse>): QueryGroupInfoResponse;
    fromProtoMsg(message: QueryGroupInfoResponseProtoMsg): QueryGroupInfoResponse;
    toProto(message: QueryGroupInfoResponse): Uint8Array;
    toProtoMsg(message: QueryGroupInfoResponse): QueryGroupInfoResponseProtoMsg;
};
export declare const QueryGroupPolicyInfoRequest: {
    typeUrl: string;
    encode(message: QueryGroupPolicyInfoRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryGroupPolicyInfoRequest;
    fromJSON(object: any): QueryGroupPolicyInfoRequest;
    toJSON(message: QueryGroupPolicyInfoRequest): JsonSafe<QueryGroupPolicyInfoRequest>;
    fromPartial(object: Partial<QueryGroupPolicyInfoRequest>): QueryGroupPolicyInfoRequest;
    fromProtoMsg(message: QueryGroupPolicyInfoRequestProtoMsg): QueryGroupPolicyInfoRequest;
    toProto(message: QueryGroupPolicyInfoRequest): Uint8Array;
    toProtoMsg(message: QueryGroupPolicyInfoRequest): QueryGroupPolicyInfoRequestProtoMsg;
};
export declare const QueryGroupPolicyInfoResponse: {
    typeUrl: string;
    encode(message: QueryGroupPolicyInfoResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryGroupPolicyInfoResponse;
    fromJSON(object: any): QueryGroupPolicyInfoResponse;
    toJSON(message: QueryGroupPolicyInfoResponse): JsonSafe<QueryGroupPolicyInfoResponse>;
    fromPartial(object: Partial<QueryGroupPolicyInfoResponse>): QueryGroupPolicyInfoResponse;
    fromProtoMsg(message: QueryGroupPolicyInfoResponseProtoMsg): QueryGroupPolicyInfoResponse;
    toProto(message: QueryGroupPolicyInfoResponse): Uint8Array;
    toProtoMsg(message: QueryGroupPolicyInfoResponse): QueryGroupPolicyInfoResponseProtoMsg;
};
export declare const QueryGroupMembersRequest: {
    typeUrl: string;
    encode(message: QueryGroupMembersRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryGroupMembersRequest;
    fromJSON(object: any): QueryGroupMembersRequest;
    toJSON(message: QueryGroupMembersRequest): JsonSafe<QueryGroupMembersRequest>;
    fromPartial(object: Partial<QueryGroupMembersRequest>): QueryGroupMembersRequest;
    fromProtoMsg(message: QueryGroupMembersRequestProtoMsg): QueryGroupMembersRequest;
    toProto(message: QueryGroupMembersRequest): Uint8Array;
    toProtoMsg(message: QueryGroupMembersRequest): QueryGroupMembersRequestProtoMsg;
};
export declare const QueryGroupMembersResponse: {
    typeUrl: string;
    encode(message: QueryGroupMembersResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryGroupMembersResponse;
    fromJSON(object: any): QueryGroupMembersResponse;
    toJSON(message: QueryGroupMembersResponse): JsonSafe<QueryGroupMembersResponse>;
    fromPartial(object: Partial<QueryGroupMembersResponse>): QueryGroupMembersResponse;
    fromProtoMsg(message: QueryGroupMembersResponseProtoMsg): QueryGroupMembersResponse;
    toProto(message: QueryGroupMembersResponse): Uint8Array;
    toProtoMsg(message: QueryGroupMembersResponse): QueryGroupMembersResponseProtoMsg;
};
export declare const QueryGroupsByAdminRequest: {
    typeUrl: string;
    encode(message: QueryGroupsByAdminRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryGroupsByAdminRequest;
    fromJSON(object: any): QueryGroupsByAdminRequest;
    toJSON(message: QueryGroupsByAdminRequest): JsonSafe<QueryGroupsByAdminRequest>;
    fromPartial(object: Partial<QueryGroupsByAdminRequest>): QueryGroupsByAdminRequest;
    fromProtoMsg(message: QueryGroupsByAdminRequestProtoMsg): QueryGroupsByAdminRequest;
    toProto(message: QueryGroupsByAdminRequest): Uint8Array;
    toProtoMsg(message: QueryGroupsByAdminRequest): QueryGroupsByAdminRequestProtoMsg;
};
export declare const QueryGroupsByAdminResponse: {
    typeUrl: string;
    encode(message: QueryGroupsByAdminResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryGroupsByAdminResponse;
    fromJSON(object: any): QueryGroupsByAdminResponse;
    toJSON(message: QueryGroupsByAdminResponse): JsonSafe<QueryGroupsByAdminResponse>;
    fromPartial(object: Partial<QueryGroupsByAdminResponse>): QueryGroupsByAdminResponse;
    fromProtoMsg(message: QueryGroupsByAdminResponseProtoMsg): QueryGroupsByAdminResponse;
    toProto(message: QueryGroupsByAdminResponse): Uint8Array;
    toProtoMsg(message: QueryGroupsByAdminResponse): QueryGroupsByAdminResponseProtoMsg;
};
export declare const QueryGroupPoliciesByGroupRequest: {
    typeUrl: string;
    encode(message: QueryGroupPoliciesByGroupRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryGroupPoliciesByGroupRequest;
    fromJSON(object: any): QueryGroupPoliciesByGroupRequest;
    toJSON(message: QueryGroupPoliciesByGroupRequest): JsonSafe<QueryGroupPoliciesByGroupRequest>;
    fromPartial(object: Partial<QueryGroupPoliciesByGroupRequest>): QueryGroupPoliciesByGroupRequest;
    fromProtoMsg(message: QueryGroupPoliciesByGroupRequestProtoMsg): QueryGroupPoliciesByGroupRequest;
    toProto(message: QueryGroupPoliciesByGroupRequest): Uint8Array;
    toProtoMsg(message: QueryGroupPoliciesByGroupRequest): QueryGroupPoliciesByGroupRequestProtoMsg;
};
export declare const QueryGroupPoliciesByGroupResponse: {
    typeUrl: string;
    encode(message: QueryGroupPoliciesByGroupResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryGroupPoliciesByGroupResponse;
    fromJSON(object: any): QueryGroupPoliciesByGroupResponse;
    toJSON(message: QueryGroupPoliciesByGroupResponse): JsonSafe<QueryGroupPoliciesByGroupResponse>;
    fromPartial(object: Partial<QueryGroupPoliciesByGroupResponse>): QueryGroupPoliciesByGroupResponse;
    fromProtoMsg(message: QueryGroupPoliciesByGroupResponseProtoMsg): QueryGroupPoliciesByGroupResponse;
    toProto(message: QueryGroupPoliciesByGroupResponse): Uint8Array;
    toProtoMsg(message: QueryGroupPoliciesByGroupResponse): QueryGroupPoliciesByGroupResponseProtoMsg;
};
export declare const QueryGroupPoliciesByAdminRequest: {
    typeUrl: string;
    encode(message: QueryGroupPoliciesByAdminRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryGroupPoliciesByAdminRequest;
    fromJSON(object: any): QueryGroupPoliciesByAdminRequest;
    toJSON(message: QueryGroupPoliciesByAdminRequest): JsonSafe<QueryGroupPoliciesByAdminRequest>;
    fromPartial(object: Partial<QueryGroupPoliciesByAdminRequest>): QueryGroupPoliciesByAdminRequest;
    fromProtoMsg(message: QueryGroupPoliciesByAdminRequestProtoMsg): QueryGroupPoliciesByAdminRequest;
    toProto(message: QueryGroupPoliciesByAdminRequest): Uint8Array;
    toProtoMsg(message: QueryGroupPoliciesByAdminRequest): QueryGroupPoliciesByAdminRequestProtoMsg;
};
export declare const QueryGroupPoliciesByAdminResponse: {
    typeUrl: string;
    encode(message: QueryGroupPoliciesByAdminResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryGroupPoliciesByAdminResponse;
    fromJSON(object: any): QueryGroupPoliciesByAdminResponse;
    toJSON(message: QueryGroupPoliciesByAdminResponse): JsonSafe<QueryGroupPoliciesByAdminResponse>;
    fromPartial(object: Partial<QueryGroupPoliciesByAdminResponse>): QueryGroupPoliciesByAdminResponse;
    fromProtoMsg(message: QueryGroupPoliciesByAdminResponseProtoMsg): QueryGroupPoliciesByAdminResponse;
    toProto(message: QueryGroupPoliciesByAdminResponse): Uint8Array;
    toProtoMsg(message: QueryGroupPoliciesByAdminResponse): QueryGroupPoliciesByAdminResponseProtoMsg;
};
export declare const QueryProposalRequest: {
    typeUrl: string;
    encode(message: QueryProposalRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryProposalRequest;
    fromJSON(object: any): QueryProposalRequest;
    toJSON(message: QueryProposalRequest): JsonSafe<QueryProposalRequest>;
    fromPartial(object: Partial<QueryProposalRequest>): QueryProposalRequest;
    fromProtoMsg(message: QueryProposalRequestProtoMsg): QueryProposalRequest;
    toProto(message: QueryProposalRequest): Uint8Array;
    toProtoMsg(message: QueryProposalRequest): QueryProposalRequestProtoMsg;
};
export declare const QueryProposalResponse: {
    typeUrl: string;
    encode(message: QueryProposalResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryProposalResponse;
    fromJSON(object: any): QueryProposalResponse;
    toJSON(message: QueryProposalResponse): JsonSafe<QueryProposalResponse>;
    fromPartial(object: Partial<QueryProposalResponse>): QueryProposalResponse;
    fromProtoMsg(message: QueryProposalResponseProtoMsg): QueryProposalResponse;
    toProto(message: QueryProposalResponse): Uint8Array;
    toProtoMsg(message: QueryProposalResponse): QueryProposalResponseProtoMsg;
};
export declare const QueryProposalsByGroupPolicyRequest: {
    typeUrl: string;
    encode(message: QueryProposalsByGroupPolicyRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryProposalsByGroupPolicyRequest;
    fromJSON(object: any): QueryProposalsByGroupPolicyRequest;
    toJSON(message: QueryProposalsByGroupPolicyRequest): JsonSafe<QueryProposalsByGroupPolicyRequest>;
    fromPartial(object: Partial<QueryProposalsByGroupPolicyRequest>): QueryProposalsByGroupPolicyRequest;
    fromProtoMsg(message: QueryProposalsByGroupPolicyRequestProtoMsg): QueryProposalsByGroupPolicyRequest;
    toProto(message: QueryProposalsByGroupPolicyRequest): Uint8Array;
    toProtoMsg(message: QueryProposalsByGroupPolicyRequest): QueryProposalsByGroupPolicyRequestProtoMsg;
};
export declare const QueryProposalsByGroupPolicyResponse: {
    typeUrl: string;
    encode(message: QueryProposalsByGroupPolicyResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryProposalsByGroupPolicyResponse;
    fromJSON(object: any): QueryProposalsByGroupPolicyResponse;
    toJSON(message: QueryProposalsByGroupPolicyResponse): JsonSafe<QueryProposalsByGroupPolicyResponse>;
    fromPartial(object: Partial<QueryProposalsByGroupPolicyResponse>): QueryProposalsByGroupPolicyResponse;
    fromProtoMsg(message: QueryProposalsByGroupPolicyResponseProtoMsg): QueryProposalsByGroupPolicyResponse;
    toProto(message: QueryProposalsByGroupPolicyResponse): Uint8Array;
    toProtoMsg(message: QueryProposalsByGroupPolicyResponse): QueryProposalsByGroupPolicyResponseProtoMsg;
};
export declare const QueryVoteByProposalVoterRequest: {
    typeUrl: string;
    encode(message: QueryVoteByProposalVoterRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryVoteByProposalVoterRequest;
    fromJSON(object: any): QueryVoteByProposalVoterRequest;
    toJSON(message: QueryVoteByProposalVoterRequest): JsonSafe<QueryVoteByProposalVoterRequest>;
    fromPartial(object: Partial<QueryVoteByProposalVoterRequest>): QueryVoteByProposalVoterRequest;
    fromProtoMsg(message: QueryVoteByProposalVoterRequestProtoMsg): QueryVoteByProposalVoterRequest;
    toProto(message: QueryVoteByProposalVoterRequest): Uint8Array;
    toProtoMsg(message: QueryVoteByProposalVoterRequest): QueryVoteByProposalVoterRequestProtoMsg;
};
export declare const QueryVoteByProposalVoterResponse: {
    typeUrl: string;
    encode(message: QueryVoteByProposalVoterResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryVoteByProposalVoterResponse;
    fromJSON(object: any): QueryVoteByProposalVoterResponse;
    toJSON(message: QueryVoteByProposalVoterResponse): JsonSafe<QueryVoteByProposalVoterResponse>;
    fromPartial(object: Partial<QueryVoteByProposalVoterResponse>): QueryVoteByProposalVoterResponse;
    fromProtoMsg(message: QueryVoteByProposalVoterResponseProtoMsg): QueryVoteByProposalVoterResponse;
    toProto(message: QueryVoteByProposalVoterResponse): Uint8Array;
    toProtoMsg(message: QueryVoteByProposalVoterResponse): QueryVoteByProposalVoterResponseProtoMsg;
};
export declare const QueryVotesByProposalRequest: {
    typeUrl: string;
    encode(message: QueryVotesByProposalRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryVotesByProposalRequest;
    fromJSON(object: any): QueryVotesByProposalRequest;
    toJSON(message: QueryVotesByProposalRequest): JsonSafe<QueryVotesByProposalRequest>;
    fromPartial(object: Partial<QueryVotesByProposalRequest>): QueryVotesByProposalRequest;
    fromProtoMsg(message: QueryVotesByProposalRequestProtoMsg): QueryVotesByProposalRequest;
    toProto(message: QueryVotesByProposalRequest): Uint8Array;
    toProtoMsg(message: QueryVotesByProposalRequest): QueryVotesByProposalRequestProtoMsg;
};
export declare const QueryVotesByProposalResponse: {
    typeUrl: string;
    encode(message: QueryVotesByProposalResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryVotesByProposalResponse;
    fromJSON(object: any): QueryVotesByProposalResponse;
    toJSON(message: QueryVotesByProposalResponse): JsonSafe<QueryVotesByProposalResponse>;
    fromPartial(object: Partial<QueryVotesByProposalResponse>): QueryVotesByProposalResponse;
    fromProtoMsg(message: QueryVotesByProposalResponseProtoMsg): QueryVotesByProposalResponse;
    toProto(message: QueryVotesByProposalResponse): Uint8Array;
    toProtoMsg(message: QueryVotesByProposalResponse): QueryVotesByProposalResponseProtoMsg;
};
export declare const QueryVotesByVoterRequest: {
    typeUrl: string;
    encode(message: QueryVotesByVoterRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryVotesByVoterRequest;
    fromJSON(object: any): QueryVotesByVoterRequest;
    toJSON(message: QueryVotesByVoterRequest): JsonSafe<QueryVotesByVoterRequest>;
    fromPartial(object: Partial<QueryVotesByVoterRequest>): QueryVotesByVoterRequest;
    fromProtoMsg(message: QueryVotesByVoterRequestProtoMsg): QueryVotesByVoterRequest;
    toProto(message: QueryVotesByVoterRequest): Uint8Array;
    toProtoMsg(message: QueryVotesByVoterRequest): QueryVotesByVoterRequestProtoMsg;
};
export declare const QueryVotesByVoterResponse: {
    typeUrl: string;
    encode(message: QueryVotesByVoterResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryVotesByVoterResponse;
    fromJSON(object: any): QueryVotesByVoterResponse;
    toJSON(message: QueryVotesByVoterResponse): JsonSafe<QueryVotesByVoterResponse>;
    fromPartial(object: Partial<QueryVotesByVoterResponse>): QueryVotesByVoterResponse;
    fromProtoMsg(message: QueryVotesByVoterResponseProtoMsg): QueryVotesByVoterResponse;
    toProto(message: QueryVotesByVoterResponse): Uint8Array;
    toProtoMsg(message: QueryVotesByVoterResponse): QueryVotesByVoterResponseProtoMsg;
};
export declare const QueryGroupsByMemberRequest: {
    typeUrl: string;
    encode(message: QueryGroupsByMemberRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryGroupsByMemberRequest;
    fromJSON(object: any): QueryGroupsByMemberRequest;
    toJSON(message: QueryGroupsByMemberRequest): JsonSafe<QueryGroupsByMemberRequest>;
    fromPartial(object: Partial<QueryGroupsByMemberRequest>): QueryGroupsByMemberRequest;
    fromProtoMsg(message: QueryGroupsByMemberRequestProtoMsg): QueryGroupsByMemberRequest;
    toProto(message: QueryGroupsByMemberRequest): Uint8Array;
    toProtoMsg(message: QueryGroupsByMemberRequest): QueryGroupsByMemberRequestProtoMsg;
};
export declare const QueryGroupsByMemberResponse: {
    typeUrl: string;
    encode(message: QueryGroupsByMemberResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryGroupsByMemberResponse;
    fromJSON(object: any): QueryGroupsByMemberResponse;
    toJSON(message: QueryGroupsByMemberResponse): JsonSafe<QueryGroupsByMemberResponse>;
    fromPartial(object: Partial<QueryGroupsByMemberResponse>): QueryGroupsByMemberResponse;
    fromProtoMsg(message: QueryGroupsByMemberResponseProtoMsg): QueryGroupsByMemberResponse;
    toProto(message: QueryGroupsByMemberResponse): Uint8Array;
    toProtoMsg(message: QueryGroupsByMemberResponse): QueryGroupsByMemberResponseProtoMsg;
};
export declare const QueryTallyResultRequest: {
    typeUrl: string;
    encode(message: QueryTallyResultRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryTallyResultRequest;
    fromJSON(object: any): QueryTallyResultRequest;
    toJSON(message: QueryTallyResultRequest): JsonSafe<QueryTallyResultRequest>;
    fromPartial(object: Partial<QueryTallyResultRequest>): QueryTallyResultRequest;
    fromProtoMsg(message: QueryTallyResultRequestProtoMsg): QueryTallyResultRequest;
    toProto(message: QueryTallyResultRequest): Uint8Array;
    toProtoMsg(message: QueryTallyResultRequest): QueryTallyResultRequestProtoMsg;
};
export declare const QueryTallyResultResponse: {
    typeUrl: string;
    encode(message: QueryTallyResultResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryTallyResultResponse;
    fromJSON(object: any): QueryTallyResultResponse;
    toJSON(message: QueryTallyResultResponse): JsonSafe<QueryTallyResultResponse>;
    fromPartial(object: Partial<QueryTallyResultResponse>): QueryTallyResultResponse;
    fromProtoMsg(message: QueryTallyResultResponseProtoMsg): QueryTallyResultResponse;
    toProto(message: QueryTallyResultResponse): Uint8Array;
    toProtoMsg(message: QueryTallyResultResponse): QueryTallyResultResponseProtoMsg;
};
export declare const QueryGroupsRequest: {
    typeUrl: string;
    encode(message: QueryGroupsRequest, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryGroupsRequest;
    fromJSON(object: any): QueryGroupsRequest;
    toJSON(message: QueryGroupsRequest): JsonSafe<QueryGroupsRequest>;
    fromPartial(object: Partial<QueryGroupsRequest>): QueryGroupsRequest;
    fromProtoMsg(message: QueryGroupsRequestProtoMsg): QueryGroupsRequest;
    toProto(message: QueryGroupsRequest): Uint8Array;
    toProtoMsg(message: QueryGroupsRequest): QueryGroupsRequestProtoMsg;
};
export declare const QueryGroupsResponse: {
    typeUrl: string;
    encode(message: QueryGroupsResponse, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueryGroupsResponse;
    fromJSON(object: any): QueryGroupsResponse;
    toJSON(message: QueryGroupsResponse): JsonSafe<QueryGroupsResponse>;
    fromPartial(object: Partial<QueryGroupsResponse>): QueryGroupsResponse;
    fromProtoMsg(message: QueryGroupsResponseProtoMsg): QueryGroupsResponse;
    toProto(message: QueryGroupsResponse): Uint8Array;
    toProtoMsg(message: QueryGroupsResponse): QueryGroupsResponseProtoMsg;
};
