import { Coin, type CoinSDKType } from '../../base/v1beta1/coin.js';
import { Any, type AnySDKType } from '../../../google/protobuf/any.js';
import { Timestamp, type TimestampSDKType } from '../../../google/protobuf/timestamp.js';
import { Duration, type DurationSDKType } from '../../../google/protobuf/duration.js';
import { BinaryReader, BinaryWriter } from '../../../binary.js';
import { type JsonSafe } from '../../../json-safe.js';
/** VoteOption enumerates the valid vote options for a given governance proposal. */
export declare enum VoteOption {
    /** VOTE_OPTION_UNSPECIFIED - VOTE_OPTION_UNSPECIFIED defines a no-op vote option. */
    VOTE_OPTION_UNSPECIFIED = 0,
    /** VOTE_OPTION_YES - VOTE_OPTION_YES defines a yes vote option. */
    VOTE_OPTION_YES = 1,
    /** VOTE_OPTION_ABSTAIN - VOTE_OPTION_ABSTAIN defines an abstain vote option. */
    VOTE_OPTION_ABSTAIN = 2,
    /** VOTE_OPTION_NO - VOTE_OPTION_NO defines a no vote option. */
    VOTE_OPTION_NO = 3,
    /** VOTE_OPTION_NO_WITH_VETO - VOTE_OPTION_NO_WITH_VETO defines a no with veto vote option. */
    VOTE_OPTION_NO_WITH_VETO = 4,
    UNRECOGNIZED = -1
}
export declare const VoteOptionSDKType: typeof VoteOption;
export declare function voteOptionFromJSON(object: any): VoteOption;
export declare function voteOptionToJSON(object: VoteOption): string;
/** ProposalStatus enumerates the valid statuses of a proposal. */
export declare enum ProposalStatus {
    /** PROPOSAL_STATUS_UNSPECIFIED - PROPOSAL_STATUS_UNSPECIFIED defines the default proposal status. */
    PROPOSAL_STATUS_UNSPECIFIED = 0,
    /**
     * PROPOSAL_STATUS_DEPOSIT_PERIOD - PROPOSAL_STATUS_DEPOSIT_PERIOD defines a proposal status during the deposit
     * period.
     */
    PROPOSAL_STATUS_DEPOSIT_PERIOD = 1,
    /**
     * PROPOSAL_STATUS_VOTING_PERIOD - PROPOSAL_STATUS_VOTING_PERIOD defines a proposal status during the voting
     * period.
     */
    PROPOSAL_STATUS_VOTING_PERIOD = 2,
    /**
     * PROPOSAL_STATUS_PASSED - PROPOSAL_STATUS_PASSED defines a proposal status of a proposal that has
     * passed.
     */
    PROPOSAL_STATUS_PASSED = 3,
    /**
     * PROPOSAL_STATUS_REJECTED - PROPOSAL_STATUS_REJECTED defines a proposal status of a proposal that has
     * been rejected.
     */
    PROPOSAL_STATUS_REJECTED = 4,
    /**
     * PROPOSAL_STATUS_FAILED - PROPOSAL_STATUS_FAILED defines a proposal status of a proposal that has
     * failed.
     */
    PROPOSAL_STATUS_FAILED = 5,
    UNRECOGNIZED = -1
}
export declare const ProposalStatusSDKType: typeof ProposalStatus;
export declare function proposalStatusFromJSON(object: any): ProposalStatus;
export declare function proposalStatusToJSON(object: ProposalStatus): string;
/** WeightedVoteOption defines a unit of vote for vote split. */
export interface WeightedVoteOption {
    option: VoteOption;
    weight: string;
}
export interface WeightedVoteOptionProtoMsg {
    typeUrl: '/cosmos.gov.v1.WeightedVoteOption';
    value: Uint8Array;
}
/** WeightedVoteOption defines a unit of vote for vote split. */
export interface WeightedVoteOptionSDKType {
    option: VoteOption;
    weight: string;
}
/**
 * Deposit defines an amount deposited by an account address to an active
 * proposal.
 */
export interface Deposit {
    proposalId: bigint;
    depositor: string;
    amount: Coin[];
}
export interface DepositProtoMsg {
    typeUrl: '/cosmos.gov.v1.Deposit';
    value: Uint8Array;
}
/**
 * Deposit defines an amount deposited by an account address to an active
 * proposal.
 */
export interface DepositSDKType {
    proposal_id: bigint;
    depositor: string;
    amount: CoinSDKType[];
}
/** Proposal defines the core field members of a governance proposal. */
export interface Proposal {
    id: bigint;
    messages: Any[];
    status: ProposalStatus;
    /**
     * final_tally_result is the final tally result of the proposal. When
     * querying a proposal via gRPC, this field is not populated until the
     * proposal's voting period has ended.
     */
    finalTallyResult?: TallyResult;
    submitTime?: Timestamp;
    depositEndTime?: Timestamp;
    totalDeposit: Coin[];
    votingStartTime?: Timestamp;
    votingEndTime?: Timestamp;
    /** metadata is any arbitrary metadata attached to the proposal. */
    metadata: string;
}
export interface ProposalProtoMsg {
    typeUrl: '/cosmos.gov.v1.Proposal';
    value: Uint8Array;
}
/** Proposal defines the core field members of a governance proposal. */
export interface ProposalSDKType {
    id: bigint;
    messages: AnySDKType[];
    status: ProposalStatus;
    final_tally_result?: TallyResultSDKType;
    submit_time?: TimestampSDKType;
    deposit_end_time?: TimestampSDKType;
    total_deposit: CoinSDKType[];
    voting_start_time?: TimestampSDKType;
    voting_end_time?: TimestampSDKType;
    metadata: string;
}
/** TallyResult defines a standard tally for a governance proposal. */
export interface TallyResult {
    yesCount: string;
    abstainCount: string;
    noCount: string;
    noWithVetoCount: string;
}
export interface TallyResultProtoMsg {
    typeUrl: '/cosmos.gov.v1.TallyResult';
    value: Uint8Array;
}
/** TallyResult defines a standard tally for a governance proposal. */
export interface TallyResultSDKType {
    yes_count: string;
    abstain_count: string;
    no_count: string;
    no_with_veto_count: string;
}
/**
 * Vote defines a vote on a governance proposal.
 * A Vote consists of a proposal ID, the voter, and the vote option.
 */
export interface Vote {
    proposalId: bigint;
    voter: string;
    options: WeightedVoteOption[];
    /** metadata is any  arbitrary metadata to attached to the vote. */
    metadata: string;
}
export interface VoteProtoMsg {
    typeUrl: '/cosmos.gov.v1.Vote';
    value: Uint8Array;
}
/**
 * Vote defines a vote on a governance proposal.
 * A Vote consists of a proposal ID, the voter, and the vote option.
 */
export interface VoteSDKType {
    proposal_id: bigint;
    voter: string;
    options: WeightedVoteOptionSDKType[];
    metadata: string;
}
/** DepositParams defines the params for deposits on governance proposals. */
export interface DepositParams {
    /** Minimum deposit for a proposal to enter voting period. */
    minDeposit: Coin[];
    /**
     * Maximum period for Atom holders to deposit on a proposal. Initial value: 2
     *  months.
     */
    maxDepositPeriod?: Duration;
}
export interface DepositParamsProtoMsg {
    typeUrl: '/cosmos.gov.v1.DepositParams';
    value: Uint8Array;
}
/** DepositParams defines the params for deposits on governance proposals. */
export interface DepositParamsSDKType {
    min_deposit: CoinSDKType[];
    max_deposit_period?: DurationSDKType;
}
/** VotingParams defines the params for voting on governance proposals. */
export interface VotingParams {
    /** Length of the voting period. */
    votingPeriod?: Duration;
}
export interface VotingParamsProtoMsg {
    typeUrl: '/cosmos.gov.v1.VotingParams';
    value: Uint8Array;
}
/** VotingParams defines the params for voting on governance proposals. */
export interface VotingParamsSDKType {
    voting_period?: DurationSDKType;
}
/** TallyParams defines the params for tallying votes on governance proposals. */
export interface TallyParams {
    /**
     * Minimum percentage of total stake needed to vote for a result to be
     *  considered valid.
     */
    quorum: string;
    /** Minimum proportion of Yes votes for proposal to pass. Default value: 0.5. */
    threshold: string;
    /**
     * Minimum value of Veto votes to Total votes ratio for proposal to be
     *  vetoed. Default value: 1/3.
     */
    vetoThreshold: string;
}
export interface TallyParamsProtoMsg {
    typeUrl: '/cosmos.gov.v1.TallyParams';
    value: Uint8Array;
}
/** TallyParams defines the params for tallying votes on governance proposals. */
export interface TallyParamsSDKType {
    quorum: string;
    threshold: string;
    veto_threshold: string;
}
export declare const WeightedVoteOption: {
    typeUrl: string;
    encode(message: WeightedVoteOption, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): WeightedVoteOption;
    fromJSON(object: any): WeightedVoteOption;
    toJSON(message: WeightedVoteOption): JsonSafe<WeightedVoteOption>;
    fromPartial(object: Partial<WeightedVoteOption>): WeightedVoteOption;
    fromProtoMsg(message: WeightedVoteOptionProtoMsg): WeightedVoteOption;
    toProto(message: WeightedVoteOption): Uint8Array;
    toProtoMsg(message: WeightedVoteOption): WeightedVoteOptionProtoMsg;
};
export declare const Deposit: {
    typeUrl: string;
    encode(message: Deposit, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): Deposit;
    fromJSON(object: any): Deposit;
    toJSON(message: Deposit): JsonSafe<Deposit>;
    fromPartial(object: Partial<Deposit>): Deposit;
    fromProtoMsg(message: DepositProtoMsg): Deposit;
    toProto(message: Deposit): Uint8Array;
    toProtoMsg(message: Deposit): DepositProtoMsg;
};
export declare const Proposal: {
    typeUrl: string;
    encode(message: Proposal, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): Proposal;
    fromJSON(object: any): Proposal;
    toJSON(message: Proposal): JsonSafe<Proposal>;
    fromPartial(object: Partial<Proposal>): Proposal;
    fromProtoMsg(message: ProposalProtoMsg): Proposal;
    toProto(message: Proposal): Uint8Array;
    toProtoMsg(message: Proposal): ProposalProtoMsg;
};
export declare const TallyResult: {
    typeUrl: string;
    encode(message: TallyResult, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): TallyResult;
    fromJSON(object: any): TallyResult;
    toJSON(message: TallyResult): JsonSafe<TallyResult>;
    fromPartial(object: Partial<TallyResult>): TallyResult;
    fromProtoMsg(message: TallyResultProtoMsg): TallyResult;
    toProto(message: TallyResult): Uint8Array;
    toProtoMsg(message: TallyResult): TallyResultProtoMsg;
};
export declare const Vote: {
    typeUrl: string;
    encode(message: Vote, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): Vote;
    fromJSON(object: any): Vote;
    toJSON(message: Vote): JsonSafe<Vote>;
    fromPartial(object: Partial<Vote>): Vote;
    fromProtoMsg(message: VoteProtoMsg): Vote;
    toProto(message: Vote): Uint8Array;
    toProtoMsg(message: Vote): VoteProtoMsg;
};
export declare const DepositParams: {
    typeUrl: string;
    encode(message: DepositParams, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): DepositParams;
    fromJSON(object: any): DepositParams;
    toJSON(message: DepositParams): JsonSafe<DepositParams>;
    fromPartial(object: Partial<DepositParams>): DepositParams;
    fromProtoMsg(message: DepositParamsProtoMsg): DepositParams;
    toProto(message: DepositParams): Uint8Array;
    toProtoMsg(message: DepositParams): DepositParamsProtoMsg;
};
export declare const VotingParams: {
    typeUrl: string;
    encode(message: VotingParams, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): VotingParams;
    fromJSON(object: any): VotingParams;
    toJSON(message: VotingParams): JsonSafe<VotingParams>;
    fromPartial(object: Partial<VotingParams>): VotingParams;
    fromProtoMsg(message: VotingParamsProtoMsg): VotingParams;
    toProto(message: VotingParams): Uint8Array;
    toProtoMsg(message: VotingParams): VotingParamsProtoMsg;
};
export declare const TallyParams: {
    typeUrl: string;
    encode(message: TallyParams, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): TallyParams;
    fromJSON(object: any): TallyParams;
    toJSON(message: TallyParams): JsonSafe<TallyParams>;
    fromPartial(object: Partial<TallyParams>): TallyParams;
    fromProtoMsg(message: TallyParamsProtoMsg): TallyParams;
    toProto(message: TallyParams): Uint8Array;
    toProtoMsg(message: TallyParams): TallyParamsProtoMsg;
};
