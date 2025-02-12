import { BinaryReader, BinaryWriter } from '../../binary.js';
import { type JsonSafe } from '../../json-safe.js';
export declare enum Action {
    ACTION_FREE = 0,
    ACTION_LIQUID_STAKE = 1,
    ACTION_DELEGATE_STAKE = 2,
    UNRECOGNIZED = -1
}
export declare const ActionSDKType: typeof Action;
export declare function actionFromJSON(object: any): Action;
export declare function actionToJSON(object: Action): string;
/** A Claim Records is the metadata of claim data per address */
export interface ClaimRecord {
    /** airdrop identifier */
    airdropIdentifier: string;
    /** address of claim user */
    address: string;
    /** weight that represent the portion from total allocation */
    weight: string;
    /**
     * true if action is completed
     * index of bool in array refers to action enum #
     */
    actionCompleted: boolean[];
}
export interface ClaimRecordProtoMsg {
    typeUrl: '/stride.claim.ClaimRecord';
    value: Uint8Array;
}
/** A Claim Records is the metadata of claim data per address */
export interface ClaimRecordSDKType {
    airdrop_identifier: string;
    address: string;
    weight: string;
    action_completed: boolean[];
}
export declare const ClaimRecord: {
    typeUrl: string;
    encode(message: ClaimRecord, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): ClaimRecord;
    fromJSON(object: any): ClaimRecord;
    toJSON(message: ClaimRecord): JsonSafe<ClaimRecord>;
    fromPartial(object: Partial<ClaimRecord>): ClaimRecord;
    fromProtoMsg(message: ClaimRecordProtoMsg): ClaimRecord;
    toProto(message: ClaimRecord): Uint8Array;
    toProtoMsg(message: ClaimRecord): ClaimRecordProtoMsg;
};
