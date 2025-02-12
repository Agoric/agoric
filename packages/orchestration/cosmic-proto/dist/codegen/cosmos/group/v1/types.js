//@ts-nocheck
import { Timestamp, } from '../../../google/protobuf/timestamp.js';
import { Duration, } from '../../../google/protobuf/duration.js';
import { Any } from '../../../google/protobuf/any.js';
import { BinaryReader, BinaryWriter } from '../../../binary.js';
import { isSet, fromJsonTimestamp, fromTimestamp } from '../../../helpers.js';
import {} from '../../../json-safe.js';
/** VoteOption enumerates the valid vote options for a given proposal. */
export var VoteOption;
(function (VoteOption) {
    /**
     * VOTE_OPTION_UNSPECIFIED - VOTE_OPTION_UNSPECIFIED defines an unspecified vote option which will
     * return an error.
     */
    VoteOption[VoteOption["VOTE_OPTION_UNSPECIFIED"] = 0] = "VOTE_OPTION_UNSPECIFIED";
    /** VOTE_OPTION_YES - VOTE_OPTION_YES defines a yes vote option. */
    VoteOption[VoteOption["VOTE_OPTION_YES"] = 1] = "VOTE_OPTION_YES";
    /** VOTE_OPTION_ABSTAIN - VOTE_OPTION_ABSTAIN defines an abstain vote option. */
    VoteOption[VoteOption["VOTE_OPTION_ABSTAIN"] = 2] = "VOTE_OPTION_ABSTAIN";
    /** VOTE_OPTION_NO - VOTE_OPTION_NO defines a no vote option. */
    VoteOption[VoteOption["VOTE_OPTION_NO"] = 3] = "VOTE_OPTION_NO";
    /** VOTE_OPTION_NO_WITH_VETO - VOTE_OPTION_NO_WITH_VETO defines a no with veto vote option. */
    VoteOption[VoteOption["VOTE_OPTION_NO_WITH_VETO"] = 4] = "VOTE_OPTION_NO_WITH_VETO";
    VoteOption[VoteOption["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
})(VoteOption || (VoteOption = {}));
export const VoteOptionSDKType = VoteOption;
export function voteOptionFromJSON(object) {
    switch (object) {
        case 0:
        case 'VOTE_OPTION_UNSPECIFIED':
            return VoteOption.VOTE_OPTION_UNSPECIFIED;
        case 1:
        case 'VOTE_OPTION_YES':
            return VoteOption.VOTE_OPTION_YES;
        case 2:
        case 'VOTE_OPTION_ABSTAIN':
            return VoteOption.VOTE_OPTION_ABSTAIN;
        case 3:
        case 'VOTE_OPTION_NO':
            return VoteOption.VOTE_OPTION_NO;
        case 4:
        case 'VOTE_OPTION_NO_WITH_VETO':
            return VoteOption.VOTE_OPTION_NO_WITH_VETO;
        case -1:
        case 'UNRECOGNIZED':
        default:
            return VoteOption.UNRECOGNIZED;
    }
}
export function voteOptionToJSON(object) {
    switch (object) {
        case VoteOption.VOTE_OPTION_UNSPECIFIED:
            return 'VOTE_OPTION_UNSPECIFIED';
        case VoteOption.VOTE_OPTION_YES:
            return 'VOTE_OPTION_YES';
        case VoteOption.VOTE_OPTION_ABSTAIN:
            return 'VOTE_OPTION_ABSTAIN';
        case VoteOption.VOTE_OPTION_NO:
            return 'VOTE_OPTION_NO';
        case VoteOption.VOTE_OPTION_NO_WITH_VETO:
            return 'VOTE_OPTION_NO_WITH_VETO';
        case VoteOption.UNRECOGNIZED:
        default:
            return 'UNRECOGNIZED';
    }
}
/** ProposalStatus defines proposal statuses. */
export var ProposalStatus;
(function (ProposalStatus) {
    /** PROPOSAL_STATUS_UNSPECIFIED - An empty value is invalid and not allowed. */
    ProposalStatus[ProposalStatus["PROPOSAL_STATUS_UNSPECIFIED"] = 0] = "PROPOSAL_STATUS_UNSPECIFIED";
    /** PROPOSAL_STATUS_SUBMITTED - Initial status of a proposal when submitted. */
    ProposalStatus[ProposalStatus["PROPOSAL_STATUS_SUBMITTED"] = 1] = "PROPOSAL_STATUS_SUBMITTED";
    /**
     * PROPOSAL_STATUS_ACCEPTED - Final status of a proposal when the final tally is done and the outcome
     * passes the group policy's decision policy.
     */
    ProposalStatus[ProposalStatus["PROPOSAL_STATUS_ACCEPTED"] = 2] = "PROPOSAL_STATUS_ACCEPTED";
    /**
     * PROPOSAL_STATUS_REJECTED - Final status of a proposal when the final tally is done and the outcome
     * is rejected by the group policy's decision policy.
     */
    ProposalStatus[ProposalStatus["PROPOSAL_STATUS_REJECTED"] = 3] = "PROPOSAL_STATUS_REJECTED";
    /**
     * PROPOSAL_STATUS_ABORTED - Final status of a proposal when the group policy is modified before the
     * final tally.
     */
    ProposalStatus[ProposalStatus["PROPOSAL_STATUS_ABORTED"] = 4] = "PROPOSAL_STATUS_ABORTED";
    /**
     * PROPOSAL_STATUS_WITHDRAWN - A proposal can be withdrawn before the voting start time by the owner.
     * When this happens the final status is Withdrawn.
     */
    ProposalStatus[ProposalStatus["PROPOSAL_STATUS_WITHDRAWN"] = 5] = "PROPOSAL_STATUS_WITHDRAWN";
    ProposalStatus[ProposalStatus["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
})(ProposalStatus || (ProposalStatus = {}));
export const ProposalStatusSDKType = ProposalStatus;
export function proposalStatusFromJSON(object) {
    switch (object) {
        case 0:
        case 'PROPOSAL_STATUS_UNSPECIFIED':
            return ProposalStatus.PROPOSAL_STATUS_UNSPECIFIED;
        case 1:
        case 'PROPOSAL_STATUS_SUBMITTED':
            return ProposalStatus.PROPOSAL_STATUS_SUBMITTED;
        case 2:
        case 'PROPOSAL_STATUS_ACCEPTED':
            return ProposalStatus.PROPOSAL_STATUS_ACCEPTED;
        case 3:
        case 'PROPOSAL_STATUS_REJECTED':
            return ProposalStatus.PROPOSAL_STATUS_REJECTED;
        case 4:
        case 'PROPOSAL_STATUS_ABORTED':
            return ProposalStatus.PROPOSAL_STATUS_ABORTED;
        case 5:
        case 'PROPOSAL_STATUS_WITHDRAWN':
            return ProposalStatus.PROPOSAL_STATUS_WITHDRAWN;
        case -1:
        case 'UNRECOGNIZED':
        default:
            return ProposalStatus.UNRECOGNIZED;
    }
}
export function proposalStatusToJSON(object) {
    switch (object) {
        case ProposalStatus.PROPOSAL_STATUS_UNSPECIFIED:
            return 'PROPOSAL_STATUS_UNSPECIFIED';
        case ProposalStatus.PROPOSAL_STATUS_SUBMITTED:
            return 'PROPOSAL_STATUS_SUBMITTED';
        case ProposalStatus.PROPOSAL_STATUS_ACCEPTED:
            return 'PROPOSAL_STATUS_ACCEPTED';
        case ProposalStatus.PROPOSAL_STATUS_REJECTED:
            return 'PROPOSAL_STATUS_REJECTED';
        case ProposalStatus.PROPOSAL_STATUS_ABORTED:
            return 'PROPOSAL_STATUS_ABORTED';
        case ProposalStatus.PROPOSAL_STATUS_WITHDRAWN:
            return 'PROPOSAL_STATUS_WITHDRAWN';
        case ProposalStatus.UNRECOGNIZED:
        default:
            return 'UNRECOGNIZED';
    }
}
/** ProposalExecutorResult defines types of proposal executor results. */
export var ProposalExecutorResult;
(function (ProposalExecutorResult) {
    /** PROPOSAL_EXECUTOR_RESULT_UNSPECIFIED - An empty value is not allowed. */
    ProposalExecutorResult[ProposalExecutorResult["PROPOSAL_EXECUTOR_RESULT_UNSPECIFIED"] = 0] = "PROPOSAL_EXECUTOR_RESULT_UNSPECIFIED";
    /** PROPOSAL_EXECUTOR_RESULT_NOT_RUN - We have not yet run the executor. */
    ProposalExecutorResult[ProposalExecutorResult["PROPOSAL_EXECUTOR_RESULT_NOT_RUN"] = 1] = "PROPOSAL_EXECUTOR_RESULT_NOT_RUN";
    /** PROPOSAL_EXECUTOR_RESULT_SUCCESS - The executor was successful and proposed action updated state. */
    ProposalExecutorResult[ProposalExecutorResult["PROPOSAL_EXECUTOR_RESULT_SUCCESS"] = 2] = "PROPOSAL_EXECUTOR_RESULT_SUCCESS";
    /** PROPOSAL_EXECUTOR_RESULT_FAILURE - The executor returned an error and proposed action didn't update state. */
    ProposalExecutorResult[ProposalExecutorResult["PROPOSAL_EXECUTOR_RESULT_FAILURE"] = 3] = "PROPOSAL_EXECUTOR_RESULT_FAILURE";
    ProposalExecutorResult[ProposalExecutorResult["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
})(ProposalExecutorResult || (ProposalExecutorResult = {}));
export const ProposalExecutorResultSDKType = ProposalExecutorResult;
export function proposalExecutorResultFromJSON(object) {
    switch (object) {
        case 0:
        case 'PROPOSAL_EXECUTOR_RESULT_UNSPECIFIED':
            return ProposalExecutorResult.PROPOSAL_EXECUTOR_RESULT_UNSPECIFIED;
        case 1:
        case 'PROPOSAL_EXECUTOR_RESULT_NOT_RUN':
            return ProposalExecutorResult.PROPOSAL_EXECUTOR_RESULT_NOT_RUN;
        case 2:
        case 'PROPOSAL_EXECUTOR_RESULT_SUCCESS':
            return ProposalExecutorResult.PROPOSAL_EXECUTOR_RESULT_SUCCESS;
        case 3:
        case 'PROPOSAL_EXECUTOR_RESULT_FAILURE':
            return ProposalExecutorResult.PROPOSAL_EXECUTOR_RESULT_FAILURE;
        case -1:
        case 'UNRECOGNIZED':
        default:
            return ProposalExecutorResult.UNRECOGNIZED;
    }
}
export function proposalExecutorResultToJSON(object) {
    switch (object) {
        case ProposalExecutorResult.PROPOSAL_EXECUTOR_RESULT_UNSPECIFIED:
            return 'PROPOSAL_EXECUTOR_RESULT_UNSPECIFIED';
        case ProposalExecutorResult.PROPOSAL_EXECUTOR_RESULT_NOT_RUN:
            return 'PROPOSAL_EXECUTOR_RESULT_NOT_RUN';
        case ProposalExecutorResult.PROPOSAL_EXECUTOR_RESULT_SUCCESS:
            return 'PROPOSAL_EXECUTOR_RESULT_SUCCESS';
        case ProposalExecutorResult.PROPOSAL_EXECUTOR_RESULT_FAILURE:
            return 'PROPOSAL_EXECUTOR_RESULT_FAILURE';
        case ProposalExecutorResult.UNRECOGNIZED:
        default:
            return 'UNRECOGNIZED';
    }
}
function createBaseMember() {
    return {
        address: '',
        weight: '',
        metadata: '',
        addedAt: Timestamp.fromPartial({}),
    };
}
export const Member = {
    typeUrl: '/cosmos.group.v1.Member',
    encode(message, writer = BinaryWriter.create()) {
        if (message.address !== '') {
            writer.uint32(10).string(message.address);
        }
        if (message.weight !== '') {
            writer.uint32(18).string(message.weight);
        }
        if (message.metadata !== '') {
            writer.uint32(26).string(message.metadata);
        }
        if (message.addedAt !== undefined) {
            Timestamp.encode(message.addedAt, writer.uint32(34).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMember();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.address = reader.string();
                    break;
                case 2:
                    message.weight = reader.string();
                    break;
                case 3:
                    message.metadata = reader.string();
                    break;
                case 4:
                    message.addedAt = Timestamp.decode(reader, reader.uint32());
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
            weight: isSet(object.weight) ? String(object.weight) : '',
            metadata: isSet(object.metadata) ? String(object.metadata) : '',
            addedAt: isSet(object.addedAt)
                ? fromJsonTimestamp(object.addedAt)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.address !== undefined && (obj.address = message.address);
        message.weight !== undefined && (obj.weight = message.weight);
        message.metadata !== undefined && (obj.metadata = message.metadata);
        message.addedAt !== undefined &&
            (obj.addedAt = fromTimestamp(message.addedAt).toISOString());
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMember();
        message.address = object.address ?? '';
        message.weight = object.weight ?? '';
        message.metadata = object.metadata ?? '';
        message.addedAt =
            object.addedAt !== undefined && object.addedAt !== null
                ? Timestamp.fromPartial(object.addedAt)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return Member.decode(message.value);
    },
    toProto(message) {
        return Member.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.group.v1.Member',
            value: Member.encode(message).finish(),
        };
    },
};
function createBaseMemberRequest() {
    return {
        address: '',
        weight: '',
        metadata: '',
    };
}
export const MemberRequest = {
    typeUrl: '/cosmos.group.v1.MemberRequest',
    encode(message, writer = BinaryWriter.create()) {
        if (message.address !== '') {
            writer.uint32(10).string(message.address);
        }
        if (message.weight !== '') {
            writer.uint32(18).string(message.weight);
        }
        if (message.metadata !== '') {
            writer.uint32(26).string(message.metadata);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMemberRequest();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.address = reader.string();
                    break;
                case 2:
                    message.weight = reader.string();
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
            address: isSet(object.address) ? String(object.address) : '',
            weight: isSet(object.weight) ? String(object.weight) : '',
            metadata: isSet(object.metadata) ? String(object.metadata) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.address !== undefined && (obj.address = message.address);
        message.weight !== undefined && (obj.weight = message.weight);
        message.metadata !== undefined && (obj.metadata = message.metadata);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMemberRequest();
        message.address = object.address ?? '';
        message.weight = object.weight ?? '';
        message.metadata = object.metadata ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return MemberRequest.decode(message.value);
    },
    toProto(message) {
        return MemberRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.group.v1.MemberRequest',
            value: MemberRequest.encode(message).finish(),
        };
    },
};
function createBaseThresholdDecisionPolicy() {
    return {
        $typeUrl: '/cosmos.group.v1.ThresholdDecisionPolicy',
        threshold: '',
        windows: undefined,
    };
}
export const ThresholdDecisionPolicy = {
    typeUrl: '/cosmos.group.v1.ThresholdDecisionPolicy',
    encode(message, writer = BinaryWriter.create()) {
        if (message.threshold !== '') {
            writer.uint32(10).string(message.threshold);
        }
        if (message.windows !== undefined) {
            DecisionPolicyWindows.encode(message.windows, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseThresholdDecisionPolicy();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.threshold = reader.string();
                    break;
                case 2:
                    message.windows = DecisionPolicyWindows.decode(reader, reader.uint32());
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
            threshold: isSet(object.threshold) ? String(object.threshold) : '',
            windows: isSet(object.windows)
                ? DecisionPolicyWindows.fromJSON(object.windows)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.threshold !== undefined && (obj.threshold = message.threshold);
        message.windows !== undefined &&
            (obj.windows = message.windows
                ? DecisionPolicyWindows.toJSON(message.windows)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseThresholdDecisionPolicy();
        message.threshold = object.threshold ?? '';
        message.windows =
            object.windows !== undefined && object.windows !== null
                ? DecisionPolicyWindows.fromPartial(object.windows)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return ThresholdDecisionPolicy.decode(message.value);
    },
    toProto(message) {
        return ThresholdDecisionPolicy.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.group.v1.ThresholdDecisionPolicy',
            value: ThresholdDecisionPolicy.encode(message).finish(),
        };
    },
};
function createBasePercentageDecisionPolicy() {
    return {
        $typeUrl: '/cosmos.group.v1.PercentageDecisionPolicy',
        percentage: '',
        windows: undefined,
    };
}
export const PercentageDecisionPolicy = {
    typeUrl: '/cosmos.group.v1.PercentageDecisionPolicy',
    encode(message, writer = BinaryWriter.create()) {
        if (message.percentage !== '') {
            writer.uint32(10).string(message.percentage);
        }
        if (message.windows !== undefined) {
            DecisionPolicyWindows.encode(message.windows, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBasePercentageDecisionPolicy();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.percentage = reader.string();
                    break;
                case 2:
                    message.windows = DecisionPolicyWindows.decode(reader, reader.uint32());
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
            percentage: isSet(object.percentage) ? String(object.percentage) : '',
            windows: isSet(object.windows)
                ? DecisionPolicyWindows.fromJSON(object.windows)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.percentage !== undefined && (obj.percentage = message.percentage);
        message.windows !== undefined &&
            (obj.windows = message.windows
                ? DecisionPolicyWindows.toJSON(message.windows)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBasePercentageDecisionPolicy();
        message.percentage = object.percentage ?? '';
        message.windows =
            object.windows !== undefined && object.windows !== null
                ? DecisionPolicyWindows.fromPartial(object.windows)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return PercentageDecisionPolicy.decode(message.value);
    },
    toProto(message) {
        return PercentageDecisionPolicy.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.group.v1.PercentageDecisionPolicy',
            value: PercentageDecisionPolicy.encode(message).finish(),
        };
    },
};
function createBaseDecisionPolicyWindows() {
    return {
        votingPeriod: Duration.fromPartial({}),
        minExecutionPeriod: Duration.fromPartial({}),
    };
}
export const DecisionPolicyWindows = {
    typeUrl: '/cosmos.group.v1.DecisionPolicyWindows',
    encode(message, writer = BinaryWriter.create()) {
        if (message.votingPeriod !== undefined) {
            Duration.encode(message.votingPeriod, writer.uint32(10).fork()).ldelim();
        }
        if (message.minExecutionPeriod !== undefined) {
            Duration.encode(message.minExecutionPeriod, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseDecisionPolicyWindows();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.votingPeriod = Duration.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.minExecutionPeriod = Duration.decode(reader, reader.uint32());
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
            votingPeriod: isSet(object.votingPeriod)
                ? Duration.fromJSON(object.votingPeriod)
                : undefined,
            minExecutionPeriod: isSet(object.minExecutionPeriod)
                ? Duration.fromJSON(object.minExecutionPeriod)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.votingPeriod !== undefined &&
            (obj.votingPeriod = message.votingPeriod
                ? Duration.toJSON(message.votingPeriod)
                : undefined);
        message.minExecutionPeriod !== undefined &&
            (obj.minExecutionPeriod = message.minExecutionPeriod
                ? Duration.toJSON(message.minExecutionPeriod)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseDecisionPolicyWindows();
        message.votingPeriod =
            object.votingPeriod !== undefined && object.votingPeriod !== null
                ? Duration.fromPartial(object.votingPeriod)
                : undefined;
        message.minExecutionPeriod =
            object.minExecutionPeriod !== undefined &&
                object.minExecutionPeriod !== null
                ? Duration.fromPartial(object.minExecutionPeriod)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return DecisionPolicyWindows.decode(message.value);
    },
    toProto(message) {
        return DecisionPolicyWindows.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.group.v1.DecisionPolicyWindows',
            value: DecisionPolicyWindows.encode(message).finish(),
        };
    },
};
function createBaseGroupInfo() {
    return {
        id: BigInt(0),
        admin: '',
        metadata: '',
        version: BigInt(0),
        totalWeight: '',
        createdAt: Timestamp.fromPartial({}),
    };
}
export const GroupInfo = {
    typeUrl: '/cosmos.group.v1.GroupInfo',
    encode(message, writer = BinaryWriter.create()) {
        if (message.id !== BigInt(0)) {
            writer.uint32(8).uint64(message.id);
        }
        if (message.admin !== '') {
            writer.uint32(18).string(message.admin);
        }
        if (message.metadata !== '') {
            writer.uint32(26).string(message.metadata);
        }
        if (message.version !== BigInt(0)) {
            writer.uint32(32).uint64(message.version);
        }
        if (message.totalWeight !== '') {
            writer.uint32(42).string(message.totalWeight);
        }
        if (message.createdAt !== undefined) {
            Timestamp.encode(message.createdAt, writer.uint32(50).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseGroupInfo();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.id = reader.uint64();
                    break;
                case 2:
                    message.admin = reader.string();
                    break;
                case 3:
                    message.metadata = reader.string();
                    break;
                case 4:
                    message.version = reader.uint64();
                    break;
                case 5:
                    message.totalWeight = reader.string();
                    break;
                case 6:
                    message.createdAt = Timestamp.decode(reader, reader.uint32());
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
            id: isSet(object.id) ? BigInt(object.id.toString()) : BigInt(0),
            admin: isSet(object.admin) ? String(object.admin) : '',
            metadata: isSet(object.metadata) ? String(object.metadata) : '',
            version: isSet(object.version)
                ? BigInt(object.version.toString())
                : BigInt(0),
            totalWeight: isSet(object.totalWeight) ? String(object.totalWeight) : '',
            createdAt: isSet(object.createdAt)
                ? fromJsonTimestamp(object.createdAt)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.id !== undefined && (obj.id = (message.id || BigInt(0)).toString());
        message.admin !== undefined && (obj.admin = message.admin);
        message.metadata !== undefined && (obj.metadata = message.metadata);
        message.version !== undefined &&
            (obj.version = (message.version || BigInt(0)).toString());
        message.totalWeight !== undefined &&
            (obj.totalWeight = message.totalWeight);
        message.createdAt !== undefined &&
            (obj.createdAt = fromTimestamp(message.createdAt).toISOString());
        return obj;
    },
    fromPartial(object) {
        const message = createBaseGroupInfo();
        message.id =
            object.id !== undefined && object.id !== null
                ? BigInt(object.id.toString())
                : BigInt(0);
        message.admin = object.admin ?? '';
        message.metadata = object.metadata ?? '';
        message.version =
            object.version !== undefined && object.version !== null
                ? BigInt(object.version.toString())
                : BigInt(0);
        message.totalWeight = object.totalWeight ?? '';
        message.createdAt =
            object.createdAt !== undefined && object.createdAt !== null
                ? Timestamp.fromPartial(object.createdAt)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return GroupInfo.decode(message.value);
    },
    toProto(message) {
        return GroupInfo.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.group.v1.GroupInfo',
            value: GroupInfo.encode(message).finish(),
        };
    },
};
function createBaseGroupMember() {
    return {
        groupId: BigInt(0),
        member: undefined,
    };
}
export const GroupMember = {
    typeUrl: '/cosmos.group.v1.GroupMember',
    encode(message, writer = BinaryWriter.create()) {
        if (message.groupId !== BigInt(0)) {
            writer.uint32(8).uint64(message.groupId);
        }
        if (message.member !== undefined) {
            Member.encode(message.member, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseGroupMember();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.groupId = reader.uint64();
                    break;
                case 2:
                    message.member = Member.decode(reader, reader.uint32());
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
            member: isSet(object.member) ? Member.fromJSON(object.member) : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.groupId !== undefined &&
            (obj.groupId = (message.groupId || BigInt(0)).toString());
        message.member !== undefined &&
            (obj.member = message.member ? Member.toJSON(message.member) : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseGroupMember();
        message.groupId =
            object.groupId !== undefined && object.groupId !== null
                ? BigInt(object.groupId.toString())
                : BigInt(0);
        message.member =
            object.member !== undefined && object.member !== null
                ? Member.fromPartial(object.member)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return GroupMember.decode(message.value);
    },
    toProto(message) {
        return GroupMember.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.group.v1.GroupMember',
            value: GroupMember.encode(message).finish(),
        };
    },
};
function createBaseGroupPolicyInfo() {
    return {
        address: '',
        groupId: BigInt(0),
        admin: '',
        metadata: '',
        version: BigInt(0),
        decisionPolicy: undefined,
        createdAt: Timestamp.fromPartial({}),
    };
}
export const GroupPolicyInfo = {
    typeUrl: '/cosmos.group.v1.GroupPolicyInfo',
    encode(message, writer = BinaryWriter.create()) {
        if (message.address !== '') {
            writer.uint32(10).string(message.address);
        }
        if (message.groupId !== BigInt(0)) {
            writer.uint32(16).uint64(message.groupId);
        }
        if (message.admin !== '') {
            writer.uint32(26).string(message.admin);
        }
        if (message.metadata !== '') {
            writer.uint32(34).string(message.metadata);
        }
        if (message.version !== BigInt(0)) {
            writer.uint32(40).uint64(message.version);
        }
        if (message.decisionPolicy !== undefined) {
            Any.encode(message.decisionPolicy, writer.uint32(50).fork()).ldelim();
        }
        if (message.createdAt !== undefined) {
            Timestamp.encode(message.createdAt, writer.uint32(58).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseGroupPolicyInfo();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.address = reader.string();
                    break;
                case 2:
                    message.groupId = reader.uint64();
                    break;
                case 3:
                    message.admin = reader.string();
                    break;
                case 4:
                    message.metadata = reader.string();
                    break;
                case 5:
                    message.version = reader.uint64();
                    break;
                case 6:
                    message.decisionPolicy =
                        Cosmos_groupv1DecisionPolicy_InterfaceDecoder(reader);
                    break;
                case 7:
                    message.createdAt = Timestamp.decode(reader, reader.uint32());
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
            admin: isSet(object.admin) ? String(object.admin) : '',
            metadata: isSet(object.metadata) ? String(object.metadata) : '',
            version: isSet(object.version)
                ? BigInt(object.version.toString())
                : BigInt(0),
            decisionPolicy: isSet(object.decisionPolicy)
                ? Any.fromJSON(object.decisionPolicy)
                : undefined,
            createdAt: isSet(object.createdAt)
                ? fromJsonTimestamp(object.createdAt)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.address !== undefined && (obj.address = message.address);
        message.groupId !== undefined &&
            (obj.groupId = (message.groupId || BigInt(0)).toString());
        message.admin !== undefined && (obj.admin = message.admin);
        message.metadata !== undefined && (obj.metadata = message.metadata);
        message.version !== undefined &&
            (obj.version = (message.version || BigInt(0)).toString());
        message.decisionPolicy !== undefined &&
            (obj.decisionPolicy = message.decisionPolicy
                ? Any.toJSON(message.decisionPolicy)
                : undefined);
        message.createdAt !== undefined &&
            (obj.createdAt = fromTimestamp(message.createdAt).toISOString());
        return obj;
    },
    fromPartial(object) {
        const message = createBaseGroupPolicyInfo();
        message.address = object.address ?? '';
        message.groupId =
            object.groupId !== undefined && object.groupId !== null
                ? BigInt(object.groupId.toString())
                : BigInt(0);
        message.admin = object.admin ?? '';
        message.metadata = object.metadata ?? '';
        message.version =
            object.version !== undefined && object.version !== null
                ? BigInt(object.version.toString())
                : BigInt(0);
        message.decisionPolicy =
            object.decisionPolicy !== undefined && object.decisionPolicy !== null
                ? Any.fromPartial(object.decisionPolicy)
                : undefined;
        message.createdAt =
            object.createdAt !== undefined && object.createdAt !== null
                ? Timestamp.fromPartial(object.createdAt)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return GroupPolicyInfo.decode(message.value);
    },
    toProto(message) {
        return GroupPolicyInfo.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.group.v1.GroupPolicyInfo',
            value: GroupPolicyInfo.encode(message).finish(),
        };
    },
};
function createBaseProposal() {
    return {
        id: BigInt(0),
        groupPolicyAddress: '',
        metadata: '',
        proposers: [],
        submitTime: Timestamp.fromPartial({}),
        groupVersion: BigInt(0),
        groupPolicyVersion: BigInt(0),
        status: 0,
        finalTallyResult: TallyResult.fromPartial({}),
        votingPeriodEnd: Timestamp.fromPartial({}),
        executorResult: 0,
        messages: [],
    };
}
export const Proposal = {
    typeUrl: '/cosmos.group.v1.Proposal',
    encode(message, writer = BinaryWriter.create()) {
        if (message.id !== BigInt(0)) {
            writer.uint32(8).uint64(message.id);
        }
        if (message.groupPolicyAddress !== '') {
            writer.uint32(18).string(message.groupPolicyAddress);
        }
        if (message.metadata !== '') {
            writer.uint32(26).string(message.metadata);
        }
        for (const v of message.proposers) {
            writer.uint32(34).string(v);
        }
        if (message.submitTime !== undefined) {
            Timestamp.encode(message.submitTime, writer.uint32(42).fork()).ldelim();
        }
        if (message.groupVersion !== BigInt(0)) {
            writer.uint32(48).uint64(message.groupVersion);
        }
        if (message.groupPolicyVersion !== BigInt(0)) {
            writer.uint32(56).uint64(message.groupPolicyVersion);
        }
        if (message.status !== 0) {
            writer.uint32(64).int32(message.status);
        }
        if (message.finalTallyResult !== undefined) {
            TallyResult.encode(message.finalTallyResult, writer.uint32(74).fork()).ldelim();
        }
        if (message.votingPeriodEnd !== undefined) {
            Timestamp.encode(message.votingPeriodEnd, writer.uint32(82).fork()).ldelim();
        }
        if (message.executorResult !== 0) {
            writer.uint32(88).int32(message.executorResult);
        }
        for (const v of message.messages) {
            Any.encode(v, writer.uint32(98).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseProposal();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.id = reader.uint64();
                    break;
                case 2:
                    message.groupPolicyAddress = reader.string();
                    break;
                case 3:
                    message.metadata = reader.string();
                    break;
                case 4:
                    message.proposers.push(reader.string());
                    break;
                case 5:
                    message.submitTime = Timestamp.decode(reader, reader.uint32());
                    break;
                case 6:
                    message.groupVersion = reader.uint64();
                    break;
                case 7:
                    message.groupPolicyVersion = reader.uint64();
                    break;
                case 8:
                    message.status = reader.int32();
                    break;
                case 9:
                    message.finalTallyResult = TallyResult.decode(reader, reader.uint32());
                    break;
                case 10:
                    message.votingPeriodEnd = Timestamp.decode(reader, reader.uint32());
                    break;
                case 11:
                    message.executorResult = reader.int32();
                    break;
                case 12:
                    message.messages.push(Any.decode(reader, reader.uint32()));
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
            id: isSet(object.id) ? BigInt(object.id.toString()) : BigInt(0),
            groupPolicyAddress: isSet(object.groupPolicyAddress)
                ? String(object.groupPolicyAddress)
                : '',
            metadata: isSet(object.metadata) ? String(object.metadata) : '',
            proposers: Array.isArray(object?.proposers)
                ? object.proposers.map((e) => String(e))
                : [],
            submitTime: isSet(object.submitTime)
                ? fromJsonTimestamp(object.submitTime)
                : undefined,
            groupVersion: isSet(object.groupVersion)
                ? BigInt(object.groupVersion.toString())
                : BigInt(0),
            groupPolicyVersion: isSet(object.groupPolicyVersion)
                ? BigInt(object.groupPolicyVersion.toString())
                : BigInt(0),
            status: isSet(object.status) ? proposalStatusFromJSON(object.status) : -1,
            finalTallyResult: isSet(object.finalTallyResult)
                ? TallyResult.fromJSON(object.finalTallyResult)
                : undefined,
            votingPeriodEnd: isSet(object.votingPeriodEnd)
                ? fromJsonTimestamp(object.votingPeriodEnd)
                : undefined,
            executorResult: isSet(object.executorResult)
                ? proposalExecutorResultFromJSON(object.executorResult)
                : -1,
            messages: Array.isArray(object?.messages)
                ? object.messages.map((e) => Any.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        message.id !== undefined && (obj.id = (message.id || BigInt(0)).toString());
        message.groupPolicyAddress !== undefined &&
            (obj.groupPolicyAddress = message.groupPolicyAddress);
        message.metadata !== undefined && (obj.metadata = message.metadata);
        if (message.proposers) {
            obj.proposers = message.proposers.map(e => e);
        }
        else {
            obj.proposers = [];
        }
        message.submitTime !== undefined &&
            (obj.submitTime = fromTimestamp(message.submitTime).toISOString());
        message.groupVersion !== undefined &&
            (obj.groupVersion = (message.groupVersion || BigInt(0)).toString());
        message.groupPolicyVersion !== undefined &&
            (obj.groupPolicyVersion = (message.groupPolicyVersion || BigInt(0)).toString());
        message.status !== undefined &&
            (obj.status = proposalStatusToJSON(message.status));
        message.finalTallyResult !== undefined &&
            (obj.finalTallyResult = message.finalTallyResult
                ? TallyResult.toJSON(message.finalTallyResult)
                : undefined);
        message.votingPeriodEnd !== undefined &&
            (obj.votingPeriodEnd = fromTimestamp(message.votingPeriodEnd).toISOString());
        message.executorResult !== undefined &&
            (obj.executorResult = proposalExecutorResultToJSON(message.executorResult));
        if (message.messages) {
            obj.messages = message.messages.map(e => (e ? Any.toJSON(e) : undefined));
        }
        else {
            obj.messages = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseProposal();
        message.id =
            object.id !== undefined && object.id !== null
                ? BigInt(object.id.toString())
                : BigInt(0);
        message.groupPolicyAddress = object.groupPolicyAddress ?? '';
        message.metadata = object.metadata ?? '';
        message.proposers = object.proposers?.map(e => e) || [];
        message.submitTime =
            object.submitTime !== undefined && object.submitTime !== null
                ? Timestamp.fromPartial(object.submitTime)
                : undefined;
        message.groupVersion =
            object.groupVersion !== undefined && object.groupVersion !== null
                ? BigInt(object.groupVersion.toString())
                : BigInt(0);
        message.groupPolicyVersion =
            object.groupPolicyVersion !== undefined &&
                object.groupPolicyVersion !== null
                ? BigInt(object.groupPolicyVersion.toString())
                : BigInt(0);
        message.status = object.status ?? 0;
        message.finalTallyResult =
            object.finalTallyResult !== undefined && object.finalTallyResult !== null
                ? TallyResult.fromPartial(object.finalTallyResult)
                : undefined;
        message.votingPeriodEnd =
            object.votingPeriodEnd !== undefined && object.votingPeriodEnd !== null
                ? Timestamp.fromPartial(object.votingPeriodEnd)
                : undefined;
        message.executorResult = object.executorResult ?? 0;
        message.messages = object.messages?.map(e => Any.fromPartial(e)) || [];
        return message;
    },
    fromProtoMsg(message) {
        return Proposal.decode(message.value);
    },
    toProto(message) {
        return Proposal.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.group.v1.Proposal',
            value: Proposal.encode(message).finish(),
        };
    },
};
function createBaseTallyResult() {
    return {
        yesCount: '',
        abstainCount: '',
        noCount: '',
        noWithVetoCount: '',
    };
}
export const TallyResult = {
    typeUrl: '/cosmos.group.v1.TallyResult',
    encode(message, writer = BinaryWriter.create()) {
        if (message.yesCount !== '') {
            writer.uint32(10).string(message.yesCount);
        }
        if (message.abstainCount !== '') {
            writer.uint32(18).string(message.abstainCount);
        }
        if (message.noCount !== '') {
            writer.uint32(26).string(message.noCount);
        }
        if (message.noWithVetoCount !== '') {
            writer.uint32(34).string(message.noWithVetoCount);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseTallyResult();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.yesCount = reader.string();
                    break;
                case 2:
                    message.abstainCount = reader.string();
                    break;
                case 3:
                    message.noCount = reader.string();
                    break;
                case 4:
                    message.noWithVetoCount = reader.string();
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
            yesCount: isSet(object.yesCount) ? String(object.yesCount) : '',
            abstainCount: isSet(object.abstainCount)
                ? String(object.abstainCount)
                : '',
            noCount: isSet(object.noCount) ? String(object.noCount) : '',
            noWithVetoCount: isSet(object.noWithVetoCount)
                ? String(object.noWithVetoCount)
                : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.yesCount !== undefined && (obj.yesCount = message.yesCount);
        message.abstainCount !== undefined &&
            (obj.abstainCount = message.abstainCount);
        message.noCount !== undefined && (obj.noCount = message.noCount);
        message.noWithVetoCount !== undefined &&
            (obj.noWithVetoCount = message.noWithVetoCount);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseTallyResult();
        message.yesCount = object.yesCount ?? '';
        message.abstainCount = object.abstainCount ?? '';
        message.noCount = object.noCount ?? '';
        message.noWithVetoCount = object.noWithVetoCount ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return TallyResult.decode(message.value);
    },
    toProto(message) {
        return TallyResult.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.group.v1.TallyResult',
            value: TallyResult.encode(message).finish(),
        };
    },
};
function createBaseVote() {
    return {
        proposalId: BigInt(0),
        voter: '',
        option: 0,
        metadata: '',
        submitTime: Timestamp.fromPartial({}),
    };
}
export const Vote = {
    typeUrl: '/cosmos.group.v1.Vote',
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
        if (message.submitTime !== undefined) {
            Timestamp.encode(message.submitTime, writer.uint32(42).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseVote();
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
                    message.submitTime = Timestamp.decode(reader, reader.uint32());
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
            submitTime: isSet(object.submitTime)
                ? fromJsonTimestamp(object.submitTime)
                : undefined,
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
        message.submitTime !== undefined &&
            (obj.submitTime = fromTimestamp(message.submitTime).toISOString());
        return obj;
    },
    fromPartial(object) {
        const message = createBaseVote();
        message.proposalId =
            object.proposalId !== undefined && object.proposalId !== null
                ? BigInt(object.proposalId.toString())
                : BigInt(0);
        message.voter = object.voter ?? '';
        message.option = object.option ?? 0;
        message.metadata = object.metadata ?? '';
        message.submitTime =
            object.submitTime !== undefined && object.submitTime !== null
                ? Timestamp.fromPartial(object.submitTime)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return Vote.decode(message.value);
    },
    toProto(message) {
        return Vote.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.group.v1.Vote',
            value: Vote.encode(message).finish(),
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
//# sourceMappingURL=types.js.map