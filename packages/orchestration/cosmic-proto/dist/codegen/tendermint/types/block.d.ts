import { Header, type HeaderSDKType, Data, type DataSDKType, Commit, type CommitSDKType } from './types.js';
import { EvidenceList, type EvidenceListSDKType } from './evidence.js';
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { type JsonSafe } from '../../json-safe.js';
export interface Block {
    header: Header;
    data: Data;
    evidence: EvidenceList;
    lastCommit?: Commit;
}
export interface BlockProtoMsg {
    typeUrl: '/tendermint.types.Block';
    value: Uint8Array;
}
export interface BlockSDKType {
    header: HeaderSDKType;
    data: DataSDKType;
    evidence: EvidenceListSDKType;
    last_commit?: CommitSDKType;
}
export declare const Block: {
    typeUrl: string;
    encode(message: Block, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): Block;
    fromJSON(object: any): Block;
    toJSON(message: Block): JsonSafe<Block>;
    fromPartial(object: Partial<Block>): Block;
    fromProtoMsg(message: BlockProtoMsg): Block;
    toProto(message: Block): Uint8Array;
    toProtoMsg(message: Block): BlockProtoMsg;
};
