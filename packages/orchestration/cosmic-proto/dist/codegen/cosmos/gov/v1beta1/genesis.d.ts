import { Deposit, type DepositSDKType, Vote, type VoteSDKType, Proposal, type ProposalSDKType, DepositParams, type DepositParamsSDKType, VotingParams, type VotingParamsSDKType, TallyParams, type TallyParamsSDKType } from './gov.js';
import { BinaryReader, BinaryWriter } from '../../../binary.js';
import { type JsonSafe } from '../../../json-safe.js';
/** GenesisState defines the gov module's genesis state. */
export interface GenesisState {
    /** starting_proposal_id is the ID of the starting proposal. */
    startingProposalId: bigint;
    /** deposits defines all the deposits present at genesis. */
    deposits: Deposit[];
    /** votes defines all the votes present at genesis. */
    votes: Vote[];
    /** proposals defines all the proposals present at genesis. */
    proposals: Proposal[];
    /** params defines all the paramaters of related to deposit. */
    depositParams: DepositParams;
    /** params defines all the paramaters of related to voting. */
    votingParams: VotingParams;
    /** params defines all the paramaters of related to tally. */
    tallyParams: TallyParams;
}
export interface GenesisStateProtoMsg {
    typeUrl: '/cosmos.gov.v1beta1.GenesisState';
    value: Uint8Array;
}
/** GenesisState defines the gov module's genesis state. */
export interface GenesisStateSDKType {
    starting_proposal_id: bigint;
    deposits: DepositSDKType[];
    votes: VoteSDKType[];
    proposals: ProposalSDKType[];
    deposit_params: DepositParamsSDKType;
    voting_params: VotingParamsSDKType;
    tally_params: TallyParamsSDKType;
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
