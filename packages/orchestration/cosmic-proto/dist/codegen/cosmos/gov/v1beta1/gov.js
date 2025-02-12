//@ts-nocheck
import { Coin } from '../../base/v1beta1/coin.js';
import { Any } from '../../../google/protobuf/any.js';
import { Timestamp, } from '../../../google/protobuf/timestamp.js';
import { Duration, } from '../../../google/protobuf/duration.js';
import { BinaryReader, BinaryWriter } from '../../../binary.js';
import { Decimal, isSet, fromJsonTimestamp, fromTimestamp, bytesFromBase64, base64FromBytes, } from '../../../helpers.js';
import {} from '../../../json-safe.js';
/** VoteOption enumerates the valid vote options for a given governance proposal. */
export var VoteOption;
(function (VoteOption) {
    /** VOTE_OPTION_UNSPECIFIED - VOTE_OPTION_UNSPECIFIED defines a no-op vote option. */
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
/** ProposalStatus enumerates the valid statuses of a proposal. */
export var ProposalStatus;
(function (ProposalStatus) {
    /** PROPOSAL_STATUS_UNSPECIFIED - PROPOSAL_STATUS_UNSPECIFIED defines the default proposal status. */
    ProposalStatus[ProposalStatus["PROPOSAL_STATUS_UNSPECIFIED"] = 0] = "PROPOSAL_STATUS_UNSPECIFIED";
    /**
     * PROPOSAL_STATUS_DEPOSIT_PERIOD - PROPOSAL_STATUS_DEPOSIT_PERIOD defines a proposal status during the deposit
     * period.
     */
    ProposalStatus[ProposalStatus["PROPOSAL_STATUS_DEPOSIT_PERIOD"] = 1] = "PROPOSAL_STATUS_DEPOSIT_PERIOD";
    /**
     * PROPOSAL_STATUS_VOTING_PERIOD - PROPOSAL_STATUS_VOTING_PERIOD defines a proposal status during the voting
     * period.
     */
    ProposalStatus[ProposalStatus["PROPOSAL_STATUS_VOTING_PERIOD"] = 2] = "PROPOSAL_STATUS_VOTING_PERIOD";
    /**
     * PROPOSAL_STATUS_PASSED - PROPOSAL_STATUS_PASSED defines a proposal status of a proposal that has
     * passed.
     */
    ProposalStatus[ProposalStatus["PROPOSAL_STATUS_PASSED"] = 3] = "PROPOSAL_STATUS_PASSED";
    /**
     * PROPOSAL_STATUS_REJECTED - PROPOSAL_STATUS_REJECTED defines a proposal status of a proposal that has
     * been rejected.
     */
    ProposalStatus[ProposalStatus["PROPOSAL_STATUS_REJECTED"] = 4] = "PROPOSAL_STATUS_REJECTED";
    /**
     * PROPOSAL_STATUS_FAILED - PROPOSAL_STATUS_FAILED defines a proposal status of a proposal that has
     * failed.
     */
    ProposalStatus[ProposalStatus["PROPOSAL_STATUS_FAILED"] = 5] = "PROPOSAL_STATUS_FAILED";
    ProposalStatus[ProposalStatus["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
})(ProposalStatus || (ProposalStatus = {}));
export const ProposalStatusSDKType = ProposalStatus;
export function proposalStatusFromJSON(object) {
    switch (object) {
        case 0:
        case 'PROPOSAL_STATUS_UNSPECIFIED':
            return ProposalStatus.PROPOSAL_STATUS_UNSPECIFIED;
        case 1:
        case 'PROPOSAL_STATUS_DEPOSIT_PERIOD':
            return ProposalStatus.PROPOSAL_STATUS_DEPOSIT_PERIOD;
        case 2:
        case 'PROPOSAL_STATUS_VOTING_PERIOD':
            return ProposalStatus.PROPOSAL_STATUS_VOTING_PERIOD;
        case 3:
        case 'PROPOSAL_STATUS_PASSED':
            return ProposalStatus.PROPOSAL_STATUS_PASSED;
        case 4:
        case 'PROPOSAL_STATUS_REJECTED':
            return ProposalStatus.PROPOSAL_STATUS_REJECTED;
        case 5:
        case 'PROPOSAL_STATUS_FAILED':
            return ProposalStatus.PROPOSAL_STATUS_FAILED;
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
        case ProposalStatus.PROPOSAL_STATUS_DEPOSIT_PERIOD:
            return 'PROPOSAL_STATUS_DEPOSIT_PERIOD';
        case ProposalStatus.PROPOSAL_STATUS_VOTING_PERIOD:
            return 'PROPOSAL_STATUS_VOTING_PERIOD';
        case ProposalStatus.PROPOSAL_STATUS_PASSED:
            return 'PROPOSAL_STATUS_PASSED';
        case ProposalStatus.PROPOSAL_STATUS_REJECTED:
            return 'PROPOSAL_STATUS_REJECTED';
        case ProposalStatus.PROPOSAL_STATUS_FAILED:
            return 'PROPOSAL_STATUS_FAILED';
        case ProposalStatus.UNRECOGNIZED:
        default:
            return 'UNRECOGNIZED';
    }
}
function createBaseWeightedVoteOption() {
    return {
        option: 0,
        weight: '',
    };
}
export const WeightedVoteOption = {
    typeUrl: '/cosmos.gov.v1beta1.WeightedVoteOption',
    encode(message, writer = BinaryWriter.create()) {
        if (message.option !== 0) {
            writer.uint32(8).int32(message.option);
        }
        if (message.weight !== '') {
            writer
                .uint32(18)
                .string(Decimal.fromUserInput(message.weight, 18).atomics);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseWeightedVoteOption();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.option = reader.int32();
                    break;
                case 2:
                    message.weight = Decimal.fromAtomics(reader.string(), 18).toString();
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
            option: isSet(object.option) ? voteOptionFromJSON(object.option) : -1,
            weight: isSet(object.weight) ? String(object.weight) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.option !== undefined &&
            (obj.option = voteOptionToJSON(message.option));
        message.weight !== undefined && (obj.weight = message.weight);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseWeightedVoteOption();
        message.option = object.option ?? 0;
        message.weight = object.weight ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return WeightedVoteOption.decode(message.value);
    },
    toProto(message) {
        return WeightedVoteOption.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.gov.v1beta1.WeightedVoteOption',
            value: WeightedVoteOption.encode(message).finish(),
        };
    },
};
function createBaseTextProposal() {
    return {
        $typeUrl: '/cosmos.gov.v1beta1.TextProposal',
        title: '',
        description: '',
    };
}
export const TextProposal = {
    typeUrl: '/cosmos.gov.v1beta1.TextProposal',
    encode(message, writer = BinaryWriter.create()) {
        if (message.title !== '') {
            writer.uint32(10).string(message.title);
        }
        if (message.description !== '') {
            writer.uint32(18).string(message.description);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseTextProposal();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.title = reader.string();
                    break;
                case 2:
                    message.description = reader.string();
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
        };
    },
    toJSON(message) {
        const obj = {};
        message.title !== undefined && (obj.title = message.title);
        message.description !== undefined &&
            (obj.description = message.description);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseTextProposal();
        message.title = object.title ?? '';
        message.description = object.description ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return TextProposal.decode(message.value);
    },
    toProto(message) {
        return TextProposal.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.gov.v1beta1.TextProposal',
            value: TextProposal.encode(message).finish(),
        };
    },
};
function createBaseDeposit() {
    return {
        proposalId: BigInt(0),
        depositor: '',
        amount: [],
    };
}
export const Deposit = {
    typeUrl: '/cosmos.gov.v1beta1.Deposit',
    encode(message, writer = BinaryWriter.create()) {
        if (message.proposalId !== BigInt(0)) {
            writer.uint32(8).uint64(message.proposalId);
        }
        if (message.depositor !== '') {
            writer.uint32(18).string(message.depositor);
        }
        for (const v of message.amount) {
            Coin.encode(v, writer.uint32(26).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseDeposit();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.proposalId = reader.uint64();
                    break;
                case 2:
                    message.depositor = reader.string();
                    break;
                case 3:
                    message.amount.push(Coin.decode(reader, reader.uint32()));
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
            depositor: isSet(object.depositor) ? String(object.depositor) : '',
            amount: Array.isArray(object?.amount)
                ? object.amount.map((e) => Coin.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        message.proposalId !== undefined &&
            (obj.proposalId = (message.proposalId || BigInt(0)).toString());
        message.depositor !== undefined && (obj.depositor = message.depositor);
        if (message.amount) {
            obj.amount = message.amount.map(e => (e ? Coin.toJSON(e) : undefined));
        }
        else {
            obj.amount = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseDeposit();
        message.proposalId =
            object.proposalId !== undefined && object.proposalId !== null
                ? BigInt(object.proposalId.toString())
                : BigInt(0);
        message.depositor = object.depositor ?? '';
        message.amount = object.amount?.map(e => Coin.fromPartial(e)) || [];
        return message;
    },
    fromProtoMsg(message) {
        return Deposit.decode(message.value);
    },
    toProto(message) {
        return Deposit.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.gov.v1beta1.Deposit',
            value: Deposit.encode(message).finish(),
        };
    },
};
function createBaseProposal() {
    return {
        proposalId: BigInt(0),
        content: undefined,
        status: 0,
        finalTallyResult: TallyResult.fromPartial({}),
        submitTime: Timestamp.fromPartial({}),
        depositEndTime: Timestamp.fromPartial({}),
        totalDeposit: [],
        votingStartTime: Timestamp.fromPartial({}),
        votingEndTime: Timestamp.fromPartial({}),
    };
}
export const Proposal = {
    typeUrl: '/cosmos.gov.v1beta1.Proposal',
    encode(message, writer = BinaryWriter.create()) {
        if (message.proposalId !== BigInt(0)) {
            writer.uint32(8).uint64(message.proposalId);
        }
        if (message.content !== undefined) {
            Any.encode(message.content, writer.uint32(18).fork()).ldelim();
        }
        if (message.status !== 0) {
            writer.uint32(24).int32(message.status);
        }
        if (message.finalTallyResult !== undefined) {
            TallyResult.encode(message.finalTallyResult, writer.uint32(34).fork()).ldelim();
        }
        if (message.submitTime !== undefined) {
            Timestamp.encode(message.submitTime, writer.uint32(42).fork()).ldelim();
        }
        if (message.depositEndTime !== undefined) {
            Timestamp.encode(message.depositEndTime, writer.uint32(50).fork()).ldelim();
        }
        for (const v of message.totalDeposit) {
            Coin.encode(v, writer.uint32(58).fork()).ldelim();
        }
        if (message.votingStartTime !== undefined) {
            Timestamp.encode(message.votingStartTime, writer.uint32(66).fork()).ldelim();
        }
        if (message.votingEndTime !== undefined) {
            Timestamp.encode(message.votingEndTime, writer.uint32(74).fork()).ldelim();
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
                    message.proposalId = reader.uint64();
                    break;
                case 2:
                    message.content = Content_InterfaceDecoder(reader);
                    break;
                case 3:
                    message.status = reader.int32();
                    break;
                case 4:
                    message.finalTallyResult = TallyResult.decode(reader, reader.uint32());
                    break;
                case 5:
                    message.submitTime = Timestamp.decode(reader, reader.uint32());
                    break;
                case 6:
                    message.depositEndTime = Timestamp.decode(reader, reader.uint32());
                    break;
                case 7:
                    message.totalDeposit.push(Coin.decode(reader, reader.uint32()));
                    break;
                case 8:
                    message.votingStartTime = Timestamp.decode(reader, reader.uint32());
                    break;
                case 9:
                    message.votingEndTime = Timestamp.decode(reader, reader.uint32());
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
            content: isSet(object.content) ? Any.fromJSON(object.content) : undefined,
            status: isSet(object.status) ? proposalStatusFromJSON(object.status) : -1,
            finalTallyResult: isSet(object.finalTallyResult)
                ? TallyResult.fromJSON(object.finalTallyResult)
                : undefined,
            submitTime: isSet(object.submitTime)
                ? fromJsonTimestamp(object.submitTime)
                : undefined,
            depositEndTime: isSet(object.depositEndTime)
                ? fromJsonTimestamp(object.depositEndTime)
                : undefined,
            totalDeposit: Array.isArray(object?.totalDeposit)
                ? object.totalDeposit.map((e) => Coin.fromJSON(e))
                : [],
            votingStartTime: isSet(object.votingStartTime)
                ? fromJsonTimestamp(object.votingStartTime)
                : undefined,
            votingEndTime: isSet(object.votingEndTime)
                ? fromJsonTimestamp(object.votingEndTime)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.proposalId !== undefined &&
            (obj.proposalId = (message.proposalId || BigInt(0)).toString());
        message.content !== undefined &&
            (obj.content = message.content ? Any.toJSON(message.content) : undefined);
        message.status !== undefined &&
            (obj.status = proposalStatusToJSON(message.status));
        message.finalTallyResult !== undefined &&
            (obj.finalTallyResult = message.finalTallyResult
                ? TallyResult.toJSON(message.finalTallyResult)
                : undefined);
        message.submitTime !== undefined &&
            (obj.submitTime = fromTimestamp(message.submitTime).toISOString());
        message.depositEndTime !== undefined &&
            (obj.depositEndTime = fromTimestamp(message.depositEndTime).toISOString());
        if (message.totalDeposit) {
            obj.totalDeposit = message.totalDeposit.map(e => e ? Coin.toJSON(e) : undefined);
        }
        else {
            obj.totalDeposit = [];
        }
        message.votingStartTime !== undefined &&
            (obj.votingStartTime = fromTimestamp(message.votingStartTime).toISOString());
        message.votingEndTime !== undefined &&
            (obj.votingEndTime = fromTimestamp(message.votingEndTime).toISOString());
        return obj;
    },
    fromPartial(object) {
        const message = createBaseProposal();
        message.proposalId =
            object.proposalId !== undefined && object.proposalId !== null
                ? BigInt(object.proposalId.toString())
                : BigInt(0);
        message.content =
            object.content !== undefined && object.content !== null
                ? Any.fromPartial(object.content)
                : undefined;
        message.status = object.status ?? 0;
        message.finalTallyResult =
            object.finalTallyResult !== undefined && object.finalTallyResult !== null
                ? TallyResult.fromPartial(object.finalTallyResult)
                : undefined;
        message.submitTime =
            object.submitTime !== undefined && object.submitTime !== null
                ? Timestamp.fromPartial(object.submitTime)
                : undefined;
        message.depositEndTime =
            object.depositEndTime !== undefined && object.depositEndTime !== null
                ? Timestamp.fromPartial(object.depositEndTime)
                : undefined;
        message.totalDeposit =
            object.totalDeposit?.map(e => Coin.fromPartial(e)) || [];
        message.votingStartTime =
            object.votingStartTime !== undefined && object.votingStartTime !== null
                ? Timestamp.fromPartial(object.votingStartTime)
                : undefined;
        message.votingEndTime =
            object.votingEndTime !== undefined && object.votingEndTime !== null
                ? Timestamp.fromPartial(object.votingEndTime)
                : undefined;
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
            typeUrl: '/cosmos.gov.v1beta1.Proposal',
            value: Proposal.encode(message).finish(),
        };
    },
};
function createBaseTallyResult() {
    return {
        yes: '',
        abstain: '',
        no: '',
        noWithVeto: '',
    };
}
export const TallyResult = {
    typeUrl: '/cosmos.gov.v1beta1.TallyResult',
    encode(message, writer = BinaryWriter.create()) {
        if (message.yes !== '') {
            writer.uint32(10).string(message.yes);
        }
        if (message.abstain !== '') {
            writer.uint32(18).string(message.abstain);
        }
        if (message.no !== '') {
            writer.uint32(26).string(message.no);
        }
        if (message.noWithVeto !== '') {
            writer.uint32(34).string(message.noWithVeto);
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
                    message.yes = reader.string();
                    break;
                case 2:
                    message.abstain = reader.string();
                    break;
                case 3:
                    message.no = reader.string();
                    break;
                case 4:
                    message.noWithVeto = reader.string();
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
            yes: isSet(object.yes) ? String(object.yes) : '',
            abstain: isSet(object.abstain) ? String(object.abstain) : '',
            no: isSet(object.no) ? String(object.no) : '',
            noWithVeto: isSet(object.noWithVeto) ? String(object.noWithVeto) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.yes !== undefined && (obj.yes = message.yes);
        message.abstain !== undefined && (obj.abstain = message.abstain);
        message.no !== undefined && (obj.no = message.no);
        message.noWithVeto !== undefined && (obj.noWithVeto = message.noWithVeto);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseTallyResult();
        message.yes = object.yes ?? '';
        message.abstain = object.abstain ?? '';
        message.no = object.no ?? '';
        message.noWithVeto = object.noWithVeto ?? '';
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
            typeUrl: '/cosmos.gov.v1beta1.TallyResult',
            value: TallyResult.encode(message).finish(),
        };
    },
};
function createBaseVote() {
    return {
        proposalId: BigInt(0),
        voter: '',
        option: 0,
        options: [],
    };
}
export const Vote = {
    typeUrl: '/cosmos.gov.v1beta1.Vote',
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
        for (const v of message.options) {
            WeightedVoteOption.encode(v, writer.uint32(34).fork()).ldelim();
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
                    message.options.push(WeightedVoteOption.decode(reader, reader.uint32()));
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
            options: Array.isArray(object?.options)
                ? object.options.map((e) => WeightedVoteOption.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        message.proposalId !== undefined &&
            (obj.proposalId = (message.proposalId || BigInt(0)).toString());
        message.voter !== undefined && (obj.voter = message.voter);
        message.option !== undefined &&
            (obj.option = voteOptionToJSON(message.option));
        if (message.options) {
            obj.options = message.options.map(e => e ? WeightedVoteOption.toJSON(e) : undefined);
        }
        else {
            obj.options = [];
        }
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
        message.options =
            object.options?.map(e => WeightedVoteOption.fromPartial(e)) || [];
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
            typeUrl: '/cosmos.gov.v1beta1.Vote',
            value: Vote.encode(message).finish(),
        };
    },
};
function createBaseDepositParams() {
    return {
        minDeposit: [],
        maxDepositPeriod: Duration.fromPartial({}),
    };
}
export const DepositParams = {
    typeUrl: '/cosmos.gov.v1beta1.DepositParams',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.minDeposit) {
            Coin.encode(v, writer.uint32(10).fork()).ldelim();
        }
        if (message.maxDepositPeriod !== undefined) {
            Duration.encode(message.maxDepositPeriod, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseDepositParams();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.minDeposit.push(Coin.decode(reader, reader.uint32()));
                    break;
                case 2:
                    message.maxDepositPeriod = Duration.decode(reader, reader.uint32());
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
            minDeposit: Array.isArray(object?.minDeposit)
                ? object.minDeposit.map((e) => Coin.fromJSON(e))
                : [],
            maxDepositPeriod: isSet(object.maxDepositPeriod)
                ? Duration.fromJSON(object.maxDepositPeriod)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.minDeposit) {
            obj.minDeposit = message.minDeposit.map(e => e ? Coin.toJSON(e) : undefined);
        }
        else {
            obj.minDeposit = [];
        }
        message.maxDepositPeriod !== undefined &&
            (obj.maxDepositPeriod = message.maxDepositPeriod
                ? Duration.toJSON(message.maxDepositPeriod)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseDepositParams();
        message.minDeposit = object.minDeposit?.map(e => Coin.fromPartial(e)) || [];
        message.maxDepositPeriod =
            object.maxDepositPeriod !== undefined && object.maxDepositPeriod !== null
                ? Duration.fromPartial(object.maxDepositPeriod)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return DepositParams.decode(message.value);
    },
    toProto(message) {
        return DepositParams.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.gov.v1beta1.DepositParams',
            value: DepositParams.encode(message).finish(),
        };
    },
};
function createBaseVotingParams() {
    return {
        votingPeriod: Duration.fromPartial({}),
    };
}
export const VotingParams = {
    typeUrl: '/cosmos.gov.v1beta1.VotingParams',
    encode(message, writer = BinaryWriter.create()) {
        if (message.votingPeriod !== undefined) {
            Duration.encode(message.votingPeriod, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseVotingParams();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.votingPeriod = Duration.decode(reader, reader.uint32());
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
        };
    },
    toJSON(message) {
        const obj = {};
        message.votingPeriod !== undefined &&
            (obj.votingPeriod = message.votingPeriod
                ? Duration.toJSON(message.votingPeriod)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseVotingParams();
        message.votingPeriod =
            object.votingPeriod !== undefined && object.votingPeriod !== null
                ? Duration.fromPartial(object.votingPeriod)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return VotingParams.decode(message.value);
    },
    toProto(message) {
        return VotingParams.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.gov.v1beta1.VotingParams',
            value: VotingParams.encode(message).finish(),
        };
    },
};
function createBaseTallyParams() {
    return {
        quorum: new Uint8Array(),
        threshold: new Uint8Array(),
        vetoThreshold: new Uint8Array(),
    };
}
export const TallyParams = {
    typeUrl: '/cosmos.gov.v1beta1.TallyParams',
    encode(message, writer = BinaryWriter.create()) {
        if (message.quorum.length !== 0) {
            writer.uint32(10).bytes(message.quorum);
        }
        if (message.threshold.length !== 0) {
            writer.uint32(18).bytes(message.threshold);
        }
        if (message.vetoThreshold.length !== 0) {
            writer.uint32(26).bytes(message.vetoThreshold);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseTallyParams();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.quorum = reader.bytes();
                    break;
                case 2:
                    message.threshold = reader.bytes();
                    break;
                case 3:
                    message.vetoThreshold = reader.bytes();
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
            quorum: isSet(object.quorum)
                ? bytesFromBase64(object.quorum)
                : new Uint8Array(),
            threshold: isSet(object.threshold)
                ? bytesFromBase64(object.threshold)
                : new Uint8Array(),
            vetoThreshold: isSet(object.vetoThreshold)
                ? bytesFromBase64(object.vetoThreshold)
                : new Uint8Array(),
        };
    },
    toJSON(message) {
        const obj = {};
        message.quorum !== undefined &&
            (obj.quorum = base64FromBytes(message.quorum !== undefined ? message.quorum : new Uint8Array()));
        message.threshold !== undefined &&
            (obj.threshold = base64FromBytes(message.threshold !== undefined ? message.threshold : new Uint8Array()));
        message.vetoThreshold !== undefined &&
            (obj.vetoThreshold = base64FromBytes(message.vetoThreshold !== undefined
                ? message.vetoThreshold
                : new Uint8Array()));
        return obj;
    },
    fromPartial(object) {
        const message = createBaseTallyParams();
        message.quorum = object.quorum ?? new Uint8Array();
        message.threshold = object.threshold ?? new Uint8Array();
        message.vetoThreshold = object.vetoThreshold ?? new Uint8Array();
        return message;
    },
    fromProtoMsg(message) {
        return TallyParams.decode(message.value);
    },
    toProto(message) {
        return TallyParams.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.gov.v1beta1.TallyParams',
            value: TallyParams.encode(message).finish(),
        };
    },
};
export const Content_InterfaceDecoder = (input) => {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const data = Any.decode(reader, reader.uint32());
    switch (data.typeUrl) {
        case '/cosmos.gov.v1beta1.TextProposal':
            return TextProposal.decode(data.value);
        default:
            return data;
    }
};
//# sourceMappingURL=gov.js.map