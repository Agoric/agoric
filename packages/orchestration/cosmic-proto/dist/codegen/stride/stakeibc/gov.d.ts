import { Validator, type ValidatorSDKType } from './validator.js';
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { type JsonSafe } from '../../json-safe.js';
export interface AddValidatorsProposal {
    title: string;
    description: string;
    hostZone: string;
    validators: Validator[];
    deposit: string;
}
export interface AddValidatorsProposalProtoMsg {
    typeUrl: '/stride.stakeibc.AddValidatorsProposal';
    value: Uint8Array;
}
export interface AddValidatorsProposalSDKType {
    title: string;
    description: string;
    host_zone: string;
    validators: ValidatorSDKType[];
    deposit: string;
}
export interface ToggleLSMProposal {
    title: string;
    description: string;
    hostZone: string;
    enabled: boolean;
    deposit: string;
}
export interface ToggleLSMProposalProtoMsg {
    typeUrl: '/stride.stakeibc.ToggleLSMProposal';
    value: Uint8Array;
}
export interface ToggleLSMProposalSDKType {
    title: string;
    description: string;
    host_zone: string;
    enabled: boolean;
    deposit: string;
}
export declare const AddValidatorsProposal: {
    typeUrl: string;
    encode(message: AddValidatorsProposal, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): AddValidatorsProposal;
    fromJSON(object: any): AddValidatorsProposal;
    toJSON(message: AddValidatorsProposal): JsonSafe<AddValidatorsProposal>;
    fromPartial(object: Partial<AddValidatorsProposal>): AddValidatorsProposal;
    fromProtoMsg(message: AddValidatorsProposalProtoMsg): AddValidatorsProposal;
    toProto(message: AddValidatorsProposal): Uint8Array;
    toProtoMsg(message: AddValidatorsProposal): AddValidatorsProposalProtoMsg;
};
export declare const ToggleLSMProposal: {
    typeUrl: string;
    encode(message: ToggleLSMProposal, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): ToggleLSMProposal;
    fromJSON(object: any): ToggleLSMProposal;
    toJSON(message: ToggleLSMProposal): JsonSafe<ToggleLSMProposal>;
    fromPartial(object: Partial<ToggleLSMProposal>): ToggleLSMProposal;
    fromProtoMsg(message: ToggleLSMProposalProtoMsg): ToggleLSMProposal;
    toProto(message: ToggleLSMProposal): Uint8Array;
    toProtoMsg(message: ToggleLSMProposal): ToggleLSMProposalProtoMsg;
};
