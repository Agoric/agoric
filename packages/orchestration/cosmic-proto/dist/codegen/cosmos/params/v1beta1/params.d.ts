import { BinaryReader, BinaryWriter } from '../../../binary.js';
import { type JsonSafe } from '../../../json-safe.js';
/** ParameterChangeProposal defines a proposal to change one or more parameters. */
export interface ParameterChangeProposal {
    $typeUrl?: '/cosmos.params.v1beta1.ParameterChangeProposal';
    title: string;
    description: string;
    changes: ParamChange[];
}
export interface ParameterChangeProposalProtoMsg {
    typeUrl: '/cosmos.params.v1beta1.ParameterChangeProposal';
    value: Uint8Array;
}
/** ParameterChangeProposal defines a proposal to change one or more parameters. */
export interface ParameterChangeProposalSDKType {
    $typeUrl?: '/cosmos.params.v1beta1.ParameterChangeProposal';
    title: string;
    description: string;
    changes: ParamChangeSDKType[];
}
/**
 * ParamChange defines an individual parameter change, for use in
 * ParameterChangeProposal.
 */
export interface ParamChange {
    subspace: string;
    key: string;
    value: string;
}
export interface ParamChangeProtoMsg {
    typeUrl: '/cosmos.params.v1beta1.ParamChange';
    value: Uint8Array;
}
/**
 * ParamChange defines an individual parameter change, for use in
 * ParameterChangeProposal.
 */
export interface ParamChangeSDKType {
    subspace: string;
    key: string;
    value: string;
}
export declare const ParameterChangeProposal: {
    typeUrl: string;
    encode(message: ParameterChangeProposal, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): ParameterChangeProposal;
    fromJSON(object: any): ParameterChangeProposal;
    toJSON(message: ParameterChangeProposal): JsonSafe<ParameterChangeProposal>;
    fromPartial(object: Partial<ParameterChangeProposal>): ParameterChangeProposal;
    fromProtoMsg(message: ParameterChangeProposalProtoMsg): ParameterChangeProposal;
    toProto(message: ParameterChangeProposal): Uint8Array;
    toProtoMsg(message: ParameterChangeProposal): ParameterChangeProposalProtoMsg;
};
export declare const ParamChange: {
    typeUrl: string;
    encode(message: ParamChange, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): ParamChange;
    fromJSON(object: any): ParamChange;
    toJSON(message: ParamChange): JsonSafe<ParamChange>;
    fromPartial(object: Partial<ParamChange>): ParamChange;
    fromProtoMsg(message: ParamChangeProtoMsg): ParamChange;
    toProto(message: ParamChange): Uint8Array;
    toProtoMsg(message: ParamChange): ParamChangeProtoMsg;
};
