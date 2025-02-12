import { GroupInfo, type GroupInfoSDKType, GroupMember, type GroupMemberSDKType, GroupPolicyInfo, type GroupPolicyInfoSDKType, Proposal, type ProposalSDKType, Vote, type VoteSDKType } from './types.js';
import { BinaryReader, BinaryWriter } from '../../../binary.js';
import { type JsonSafe } from '../../../json-safe.js';
/** GenesisState defines the group module's genesis state. */
export interface GenesisState {
    /**
     * group_seq is the group table orm.Sequence,
     * it is used to get the next group ID.
     */
    groupSeq: bigint;
    /** groups is the list of groups info. */
    groups: GroupInfo[];
    /** group_members is the list of groups members. */
    groupMembers: GroupMember[];
    /**
     * group_policy_seq is the group policy table orm.Sequence,
     * it is used to generate the next group policy account address.
     */
    groupPolicySeq: bigint;
    /** group_policies is the list of group policies info. */
    groupPolicies: GroupPolicyInfo[];
    /**
     * proposal_seq is the proposal table orm.Sequence,
     * it is used to get the next proposal ID.
     */
    proposalSeq: bigint;
    /** proposals is the list of proposals. */
    proposals: Proposal[];
    /** votes is the list of votes. */
    votes: Vote[];
}
export interface GenesisStateProtoMsg {
    typeUrl: '/cosmos.group.v1.GenesisState';
    value: Uint8Array;
}
/** GenesisState defines the group module's genesis state. */
export interface GenesisStateSDKType {
    group_seq: bigint;
    groups: GroupInfoSDKType[];
    group_members: GroupMemberSDKType[];
    group_policy_seq: bigint;
    group_policies: GroupPolicyInfoSDKType[];
    proposal_seq: bigint;
    proposals: ProposalSDKType[];
    votes: VoteSDKType[];
}
export declare const GenesisState: {
    typeUrl: string;
    encode(message: GenesisState, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): GenesisState;
    fromJSON(object: any): GenesisState;
    toJSON(message: GenesisState): JsonSafe<GenesisState>;
    fromPartial(object: Partial<GenesisState>): GenesisState;
    fromProtoMsg(message: GenesisStateProtoMsg): GenesisState;
    toProto(message: GenesisState): Uint8Array;
    toProtoMsg(message: GenesisState): GenesisStateProtoMsg;
};
