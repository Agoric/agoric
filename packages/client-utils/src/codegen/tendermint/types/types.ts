//@ts-nocheck
import { Proof, type ProofSDKType } from '../crypto/proof.js';
import { Consensus, type ConsensusSDKType } from '../version/types.js';
import {
  Timestamp,
  type TimestampSDKType,
} from '../../google/protobuf/timestamp.js';
import { ValidatorSet, type ValidatorSetSDKType } from './validator.js';
import { BinaryReader, BinaryWriter } from '../../binary.js';
import {
  isSet,
  bytesFromBase64,
  base64FromBytes,
  fromJsonTimestamp,
  fromTimestamp,
} from '../../helpers.js';
import { type JsonSafe } from '../../json-safe.js';
/** BlockIdFlag indicates which BlcokID the signature is for */
export enum BlockIDFlag {
  BLOCK_ID_FLAG_UNKNOWN = 0,
  BLOCK_ID_FLAG_ABSENT = 1,
  BLOCK_ID_FLAG_COMMIT = 2,
  BLOCK_ID_FLAG_NIL = 3,
  UNRECOGNIZED = -1,
}
export const BlockIDFlagSDKType = BlockIDFlag;
export function blockIDFlagFromJSON(object: any): BlockIDFlag {
  switch (object) {
    case 0:
    case 'BLOCK_ID_FLAG_UNKNOWN':
      return BlockIDFlag.BLOCK_ID_FLAG_UNKNOWN;
    case 1:
    case 'BLOCK_ID_FLAG_ABSENT':
      return BlockIDFlag.BLOCK_ID_FLAG_ABSENT;
    case 2:
    case 'BLOCK_ID_FLAG_COMMIT':
      return BlockIDFlag.BLOCK_ID_FLAG_COMMIT;
    case 3:
    case 'BLOCK_ID_FLAG_NIL':
      return BlockIDFlag.BLOCK_ID_FLAG_NIL;
    case -1:
    case 'UNRECOGNIZED':
    default:
      return BlockIDFlag.UNRECOGNIZED;
  }
}
export function blockIDFlagToJSON(object: BlockIDFlag): string {
  switch (object) {
    case BlockIDFlag.BLOCK_ID_FLAG_UNKNOWN:
      return 'BLOCK_ID_FLAG_UNKNOWN';
    case BlockIDFlag.BLOCK_ID_FLAG_ABSENT:
      return 'BLOCK_ID_FLAG_ABSENT';
    case BlockIDFlag.BLOCK_ID_FLAG_COMMIT:
      return 'BLOCK_ID_FLAG_COMMIT';
    case BlockIDFlag.BLOCK_ID_FLAG_NIL:
      return 'BLOCK_ID_FLAG_NIL';
    case BlockIDFlag.UNRECOGNIZED:
    default:
      return 'UNRECOGNIZED';
  }
}
/** SignedMsgType is a type of signed message in the consensus. */
export enum SignedMsgType {
  SIGNED_MSG_TYPE_UNKNOWN = 0,
  /** SIGNED_MSG_TYPE_PREVOTE - Votes */
  SIGNED_MSG_TYPE_PREVOTE = 1,
  SIGNED_MSG_TYPE_PRECOMMIT = 2,
  /** SIGNED_MSG_TYPE_PROPOSAL - Proposals */
  SIGNED_MSG_TYPE_PROPOSAL = 32,
  UNRECOGNIZED = -1,
}
export const SignedMsgTypeSDKType = SignedMsgType;
export function signedMsgTypeFromJSON(object: any): SignedMsgType {
  switch (object) {
    case 0:
    case 'SIGNED_MSG_TYPE_UNKNOWN':
      return SignedMsgType.SIGNED_MSG_TYPE_UNKNOWN;
    case 1:
    case 'SIGNED_MSG_TYPE_PREVOTE':
      return SignedMsgType.SIGNED_MSG_TYPE_PREVOTE;
    case 2:
    case 'SIGNED_MSG_TYPE_PRECOMMIT':
      return SignedMsgType.SIGNED_MSG_TYPE_PRECOMMIT;
    case 32:
    case 'SIGNED_MSG_TYPE_PROPOSAL':
      return SignedMsgType.SIGNED_MSG_TYPE_PROPOSAL;
    case -1:
    case 'UNRECOGNIZED':
    default:
      return SignedMsgType.UNRECOGNIZED;
  }
}
export function signedMsgTypeToJSON(object: SignedMsgType): string {
  switch (object) {
    case SignedMsgType.SIGNED_MSG_TYPE_UNKNOWN:
      return 'SIGNED_MSG_TYPE_UNKNOWN';
    case SignedMsgType.SIGNED_MSG_TYPE_PREVOTE:
      return 'SIGNED_MSG_TYPE_PREVOTE';
    case SignedMsgType.SIGNED_MSG_TYPE_PRECOMMIT:
      return 'SIGNED_MSG_TYPE_PRECOMMIT';
    case SignedMsgType.SIGNED_MSG_TYPE_PROPOSAL:
      return 'SIGNED_MSG_TYPE_PROPOSAL';
    case SignedMsgType.UNRECOGNIZED:
    default:
      return 'UNRECOGNIZED';
  }
}
/** PartsetHeader */
export interface PartSetHeader {
  total: number;
  hash: Uint8Array;
}
export interface PartSetHeaderProtoMsg {
  typeUrl: '/tendermint.types.PartSetHeader';
  value: Uint8Array;
}
/** PartsetHeader */
export interface PartSetHeaderSDKType {
  total: number;
  hash: Uint8Array;
}
export interface Part {
  index: number;
  bytes: Uint8Array;
  proof: Proof;
}
export interface PartProtoMsg {
  typeUrl: '/tendermint.types.Part';
  value: Uint8Array;
}
export interface PartSDKType {
  index: number;
  bytes: Uint8Array;
  proof: ProofSDKType;
}
/** BlockID */
export interface BlockID {
  hash: Uint8Array;
  partSetHeader: PartSetHeader;
}
export interface BlockIDProtoMsg {
  typeUrl: '/tendermint.types.BlockID';
  value: Uint8Array;
}
/** BlockID */
export interface BlockIDSDKType {
  hash: Uint8Array;
  part_set_header: PartSetHeaderSDKType;
}
/** Header defines the structure of a Tendermint block header. */
export interface Header {
  /** basic block info */
  version: Consensus;
  chainId: string;
  height: bigint;
  time: Timestamp;
  /** prev block info */
  lastBlockId: BlockID;
  /** hashes of block data */
  lastCommitHash: Uint8Array;
  /** transactions */
  dataHash: Uint8Array;
  /** hashes from the app output from the prev block */
  validatorsHash: Uint8Array;
  /** validators for the next block */
  nextValidatorsHash: Uint8Array;
  /** consensus params for current block */
  consensusHash: Uint8Array;
  /** state after txs from the previous block */
  appHash: Uint8Array;
  /** root hash of all results from the txs from the previous block */
  lastResultsHash: Uint8Array;
  /** consensus info */
  evidenceHash: Uint8Array;
  /** original proposer of the block */
  proposerAddress: Uint8Array;
}
export interface HeaderProtoMsg {
  typeUrl: '/tendermint.types.Header';
  value: Uint8Array;
}
/** Header defines the structure of a Tendermint block header. */
export interface HeaderSDKType {
  version: ConsensusSDKType;
  chain_id: string;
  height: bigint;
  time: TimestampSDKType;
  last_block_id: BlockIDSDKType;
  last_commit_hash: Uint8Array;
  data_hash: Uint8Array;
  validators_hash: Uint8Array;
  next_validators_hash: Uint8Array;
  consensus_hash: Uint8Array;
  app_hash: Uint8Array;
  last_results_hash: Uint8Array;
  evidence_hash: Uint8Array;
  proposer_address: Uint8Array;
}
/** Data contains the set of transactions included in the block */
export interface Data {
  /**
   * Txs that will be applied by state @ block.Height+1.
   * NOTE: not all txs here are valid.  We're just agreeing on the order first.
   * This means that block.AppHash does not include these txs.
   */
  txs: Uint8Array[];
}
export interface DataProtoMsg {
  typeUrl: '/tendermint.types.Data';
  value: Uint8Array;
}
/** Data contains the set of transactions included in the block */
export interface DataSDKType {
  txs: Uint8Array[];
}
/**
 * Vote represents a prevote, precommit, or commit vote from validators for
 * consensus.
 */
export interface Vote {
  type: SignedMsgType;
  height: bigint;
  round: number;
  /** zero if vote is nil. */
  blockId: BlockID;
  timestamp: Timestamp;
  validatorAddress: Uint8Array;
  validatorIndex: number;
  signature: Uint8Array;
}
export interface VoteProtoMsg {
  typeUrl: '/tendermint.types.Vote';
  value: Uint8Array;
}
/**
 * Vote represents a prevote, precommit, or commit vote from validators for
 * consensus.
 */
export interface VoteSDKType {
  type: SignedMsgType;
  height: bigint;
  round: number;
  block_id: BlockIDSDKType;
  timestamp: TimestampSDKType;
  validator_address: Uint8Array;
  validator_index: number;
  signature: Uint8Array;
}
/** Commit contains the evidence that a block was committed by a set of validators. */
export interface Commit {
  height: bigint;
  round: number;
  blockId: BlockID;
  signatures: CommitSig[];
}
export interface CommitProtoMsg {
  typeUrl: '/tendermint.types.Commit';
  value: Uint8Array;
}
/** Commit contains the evidence that a block was committed by a set of validators. */
export interface CommitSDKType {
  height: bigint;
  round: number;
  block_id: BlockIDSDKType;
  signatures: CommitSigSDKType[];
}
/** CommitSig is a part of the Vote included in a Commit. */
export interface CommitSig {
  blockIdFlag: BlockIDFlag;
  validatorAddress: Uint8Array;
  timestamp: Timestamp;
  signature: Uint8Array;
}
export interface CommitSigProtoMsg {
  typeUrl: '/tendermint.types.CommitSig';
  value: Uint8Array;
}
/** CommitSig is a part of the Vote included in a Commit. */
export interface CommitSigSDKType {
  block_id_flag: BlockIDFlag;
  validator_address: Uint8Array;
  timestamp: TimestampSDKType;
  signature: Uint8Array;
}
export interface Proposal {
  type: SignedMsgType;
  height: bigint;
  round: number;
  polRound: number;
  blockId: BlockID;
  timestamp: Timestamp;
  signature: Uint8Array;
}
export interface ProposalProtoMsg {
  typeUrl: '/tendermint.types.Proposal';
  value: Uint8Array;
}
export interface ProposalSDKType {
  type: SignedMsgType;
  height: bigint;
  round: number;
  pol_round: number;
  block_id: BlockIDSDKType;
  timestamp: TimestampSDKType;
  signature: Uint8Array;
}
export interface SignedHeader {
  header?: Header;
  commit?: Commit;
}
export interface SignedHeaderProtoMsg {
  typeUrl: '/tendermint.types.SignedHeader';
  value: Uint8Array;
}
export interface SignedHeaderSDKType {
  header?: HeaderSDKType;
  commit?: CommitSDKType;
}
export interface LightBlock {
  signedHeader?: SignedHeader;
  validatorSet?: ValidatorSet;
}
export interface LightBlockProtoMsg {
  typeUrl: '/tendermint.types.LightBlock';
  value: Uint8Array;
}
export interface LightBlockSDKType {
  signed_header?: SignedHeaderSDKType;
  validator_set?: ValidatorSetSDKType;
}
export interface BlockMeta {
  blockId: BlockID;
  blockSize: bigint;
  header: Header;
  numTxs: bigint;
}
export interface BlockMetaProtoMsg {
  typeUrl: '/tendermint.types.BlockMeta';
  value: Uint8Array;
}
export interface BlockMetaSDKType {
  block_id: BlockIDSDKType;
  block_size: bigint;
  header: HeaderSDKType;
  num_txs: bigint;
}
/** TxProof represents a Merkle proof of the presence of a transaction in the Merkle tree. */
export interface TxProof {
  rootHash: Uint8Array;
  data: Uint8Array;
  proof?: Proof;
}
export interface TxProofProtoMsg {
  typeUrl: '/tendermint.types.TxProof';
  value: Uint8Array;
}
/** TxProof represents a Merkle proof of the presence of a transaction in the Merkle tree. */
export interface TxProofSDKType {
  root_hash: Uint8Array;
  data: Uint8Array;
  proof?: ProofSDKType;
}
function createBasePartSetHeader(): PartSetHeader {
  return {
    total: 0,
    hash: new Uint8Array(),
  };
}
export const PartSetHeader = {
  typeUrl: '/tendermint.types.PartSetHeader',
  encode(
    message: PartSetHeader,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.total !== 0) {
      writer.uint32(8).uint32(message.total);
    }
    if (message.hash.length !== 0) {
      writer.uint32(18).bytes(message.hash);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): PartSetHeader {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePartSetHeader();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.total = reader.uint32();
          break;
        case 2:
          message.hash = reader.bytes();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): PartSetHeader {
    return {
      total: isSet(object.total) ? Number(object.total) : 0,
      hash: isSet(object.hash)
        ? bytesFromBase64(object.hash)
        : new Uint8Array(),
    };
  },
  toJSON(message: PartSetHeader): JsonSafe<PartSetHeader> {
    const obj: any = {};
    message.total !== undefined && (obj.total = Math.round(message.total));
    message.hash !== undefined &&
      (obj.hash = base64FromBytes(
        message.hash !== undefined ? message.hash : new Uint8Array(),
      ));
    return obj;
  },
  fromPartial(object: Partial<PartSetHeader>): PartSetHeader {
    const message = createBasePartSetHeader();
    message.total = object.total ?? 0;
    message.hash = object.hash ?? new Uint8Array();
    return message;
  },
  fromProtoMsg(message: PartSetHeaderProtoMsg): PartSetHeader {
    return PartSetHeader.decode(message.value);
  },
  toProto(message: PartSetHeader): Uint8Array {
    return PartSetHeader.encode(message).finish();
  },
  toProtoMsg(message: PartSetHeader): PartSetHeaderProtoMsg {
    return {
      typeUrl: '/tendermint.types.PartSetHeader',
      value: PartSetHeader.encode(message).finish(),
    };
  },
};
function createBasePart(): Part {
  return {
    index: 0,
    bytes: new Uint8Array(),
    proof: Proof.fromPartial({}),
  };
}
export const Part = {
  typeUrl: '/tendermint.types.Part',
  encode(
    message: Part,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.index !== 0) {
      writer.uint32(8).uint32(message.index);
    }
    if (message.bytes.length !== 0) {
      writer.uint32(18).bytes(message.bytes);
    }
    if (message.proof !== undefined) {
      Proof.encode(message.proof, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): Part {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePart();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.index = reader.uint32();
          break;
        case 2:
          message.bytes = reader.bytes();
          break;
        case 3:
          message.proof = Proof.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): Part {
    return {
      index: isSet(object.index) ? Number(object.index) : 0,
      bytes: isSet(object.bytes)
        ? bytesFromBase64(object.bytes)
        : new Uint8Array(),
      proof: isSet(object.proof) ? Proof.fromJSON(object.proof) : undefined,
    };
  },
  toJSON(message: Part): JsonSafe<Part> {
    const obj: any = {};
    message.index !== undefined && (obj.index = Math.round(message.index));
    message.bytes !== undefined &&
      (obj.bytes = base64FromBytes(
        message.bytes !== undefined ? message.bytes : new Uint8Array(),
      ));
    message.proof !== undefined &&
      (obj.proof = message.proof ? Proof.toJSON(message.proof) : undefined);
    return obj;
  },
  fromPartial(object: Partial<Part>): Part {
    const message = createBasePart();
    message.index = object.index ?? 0;
    message.bytes = object.bytes ?? new Uint8Array();
    message.proof =
      object.proof !== undefined && object.proof !== null
        ? Proof.fromPartial(object.proof)
        : undefined;
    return message;
  },
  fromProtoMsg(message: PartProtoMsg): Part {
    return Part.decode(message.value);
  },
  toProto(message: Part): Uint8Array {
    return Part.encode(message).finish();
  },
  toProtoMsg(message: Part): PartProtoMsg {
    return {
      typeUrl: '/tendermint.types.Part',
      value: Part.encode(message).finish(),
    };
  },
};
function createBaseBlockID(): BlockID {
  return {
    hash: new Uint8Array(),
    partSetHeader: PartSetHeader.fromPartial({}),
  };
}
export const BlockID = {
  typeUrl: '/tendermint.types.BlockID',
  encode(
    message: BlockID,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.hash.length !== 0) {
      writer.uint32(10).bytes(message.hash);
    }
    if (message.partSetHeader !== undefined) {
      PartSetHeader.encode(
        message.partSetHeader,
        writer.uint32(18).fork(),
      ).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): BlockID {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBlockID();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.hash = reader.bytes();
          break;
        case 2:
          message.partSetHeader = PartSetHeader.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): BlockID {
    return {
      hash: isSet(object.hash)
        ? bytesFromBase64(object.hash)
        : new Uint8Array(),
      partSetHeader: isSet(object.partSetHeader)
        ? PartSetHeader.fromJSON(object.partSetHeader)
        : undefined,
    };
  },
  toJSON(message: BlockID): JsonSafe<BlockID> {
    const obj: any = {};
    message.hash !== undefined &&
      (obj.hash = base64FromBytes(
        message.hash !== undefined ? message.hash : new Uint8Array(),
      ));
    message.partSetHeader !== undefined &&
      (obj.partSetHeader = message.partSetHeader
        ? PartSetHeader.toJSON(message.partSetHeader)
        : undefined);
    return obj;
  },
  fromPartial(object: Partial<BlockID>): BlockID {
    const message = createBaseBlockID();
    message.hash = object.hash ?? new Uint8Array();
    message.partSetHeader =
      object.partSetHeader !== undefined && object.partSetHeader !== null
        ? PartSetHeader.fromPartial(object.partSetHeader)
        : undefined;
    return message;
  },
  fromProtoMsg(message: BlockIDProtoMsg): BlockID {
    return BlockID.decode(message.value);
  },
  toProto(message: BlockID): Uint8Array {
    return BlockID.encode(message).finish();
  },
  toProtoMsg(message: BlockID): BlockIDProtoMsg {
    return {
      typeUrl: '/tendermint.types.BlockID',
      value: BlockID.encode(message).finish(),
    };
  },
};
function createBaseHeader(): Header {
  return {
    version: Consensus.fromPartial({}),
    chainId: '',
    height: BigInt(0),
    time: Timestamp.fromPartial({}),
    lastBlockId: BlockID.fromPartial({}),
    lastCommitHash: new Uint8Array(),
    dataHash: new Uint8Array(),
    validatorsHash: new Uint8Array(),
    nextValidatorsHash: new Uint8Array(),
    consensusHash: new Uint8Array(),
    appHash: new Uint8Array(),
    lastResultsHash: new Uint8Array(),
    evidenceHash: new Uint8Array(),
    proposerAddress: new Uint8Array(),
  };
}
export const Header = {
  typeUrl: '/tendermint.types.Header',
  encode(
    message: Header,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.version !== undefined) {
      Consensus.encode(message.version, writer.uint32(10).fork()).ldelim();
    }
    if (message.chainId !== '') {
      writer.uint32(18).string(message.chainId);
    }
    if (message.height !== BigInt(0)) {
      writer.uint32(24).int64(message.height);
    }
    if (message.time !== undefined) {
      Timestamp.encode(message.time, writer.uint32(34).fork()).ldelim();
    }
    if (message.lastBlockId !== undefined) {
      BlockID.encode(message.lastBlockId, writer.uint32(42).fork()).ldelim();
    }
    if (message.lastCommitHash.length !== 0) {
      writer.uint32(50).bytes(message.lastCommitHash);
    }
    if (message.dataHash.length !== 0) {
      writer.uint32(58).bytes(message.dataHash);
    }
    if (message.validatorsHash.length !== 0) {
      writer.uint32(66).bytes(message.validatorsHash);
    }
    if (message.nextValidatorsHash.length !== 0) {
      writer.uint32(74).bytes(message.nextValidatorsHash);
    }
    if (message.consensusHash.length !== 0) {
      writer.uint32(82).bytes(message.consensusHash);
    }
    if (message.appHash.length !== 0) {
      writer.uint32(90).bytes(message.appHash);
    }
    if (message.lastResultsHash.length !== 0) {
      writer.uint32(98).bytes(message.lastResultsHash);
    }
    if (message.evidenceHash.length !== 0) {
      writer.uint32(106).bytes(message.evidenceHash);
    }
    if (message.proposerAddress.length !== 0) {
      writer.uint32(114).bytes(message.proposerAddress);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): Header {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseHeader();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.version = Consensus.decode(reader, reader.uint32());
          break;
        case 2:
          message.chainId = reader.string();
          break;
        case 3:
          message.height = reader.int64();
          break;
        case 4:
          message.time = Timestamp.decode(reader, reader.uint32());
          break;
        case 5:
          message.lastBlockId = BlockID.decode(reader, reader.uint32());
          break;
        case 6:
          message.lastCommitHash = reader.bytes();
          break;
        case 7:
          message.dataHash = reader.bytes();
          break;
        case 8:
          message.validatorsHash = reader.bytes();
          break;
        case 9:
          message.nextValidatorsHash = reader.bytes();
          break;
        case 10:
          message.consensusHash = reader.bytes();
          break;
        case 11:
          message.appHash = reader.bytes();
          break;
        case 12:
          message.lastResultsHash = reader.bytes();
          break;
        case 13:
          message.evidenceHash = reader.bytes();
          break;
        case 14:
          message.proposerAddress = reader.bytes();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): Header {
    return {
      version: isSet(object.version)
        ? Consensus.fromJSON(object.version)
        : undefined,
      chainId: isSet(object.chainId) ? String(object.chainId) : '',
      height: isSet(object.height)
        ? BigInt(object.height.toString())
        : BigInt(0),
      time: isSet(object.time) ? fromJsonTimestamp(object.time) : undefined,
      lastBlockId: isSet(object.lastBlockId)
        ? BlockID.fromJSON(object.lastBlockId)
        : undefined,
      lastCommitHash: isSet(object.lastCommitHash)
        ? bytesFromBase64(object.lastCommitHash)
        : new Uint8Array(),
      dataHash: isSet(object.dataHash)
        ? bytesFromBase64(object.dataHash)
        : new Uint8Array(),
      validatorsHash: isSet(object.validatorsHash)
        ? bytesFromBase64(object.validatorsHash)
        : new Uint8Array(),
      nextValidatorsHash: isSet(object.nextValidatorsHash)
        ? bytesFromBase64(object.nextValidatorsHash)
        : new Uint8Array(),
      consensusHash: isSet(object.consensusHash)
        ? bytesFromBase64(object.consensusHash)
        : new Uint8Array(),
      appHash: isSet(object.appHash)
        ? bytesFromBase64(object.appHash)
        : new Uint8Array(),
      lastResultsHash: isSet(object.lastResultsHash)
        ? bytesFromBase64(object.lastResultsHash)
        : new Uint8Array(),
      evidenceHash: isSet(object.evidenceHash)
        ? bytesFromBase64(object.evidenceHash)
        : new Uint8Array(),
      proposerAddress: isSet(object.proposerAddress)
        ? bytesFromBase64(object.proposerAddress)
        : new Uint8Array(),
    };
  },
  toJSON(message: Header): JsonSafe<Header> {
    const obj: any = {};
    message.version !== undefined &&
      (obj.version = message.version
        ? Consensus.toJSON(message.version)
        : undefined);
    message.chainId !== undefined && (obj.chainId = message.chainId);
    message.height !== undefined &&
      (obj.height = (message.height || BigInt(0)).toString());
    message.time !== undefined &&
      (obj.time = fromTimestamp(message.time).toISOString());
    message.lastBlockId !== undefined &&
      (obj.lastBlockId = message.lastBlockId
        ? BlockID.toJSON(message.lastBlockId)
        : undefined);
    message.lastCommitHash !== undefined &&
      (obj.lastCommitHash = base64FromBytes(
        message.lastCommitHash !== undefined
          ? message.lastCommitHash
          : new Uint8Array(),
      ));
    message.dataHash !== undefined &&
      (obj.dataHash = base64FromBytes(
        message.dataHash !== undefined ? message.dataHash : new Uint8Array(),
      ));
    message.validatorsHash !== undefined &&
      (obj.validatorsHash = base64FromBytes(
        message.validatorsHash !== undefined
          ? message.validatorsHash
          : new Uint8Array(),
      ));
    message.nextValidatorsHash !== undefined &&
      (obj.nextValidatorsHash = base64FromBytes(
        message.nextValidatorsHash !== undefined
          ? message.nextValidatorsHash
          : new Uint8Array(),
      ));
    message.consensusHash !== undefined &&
      (obj.consensusHash = base64FromBytes(
        message.consensusHash !== undefined
          ? message.consensusHash
          : new Uint8Array(),
      ));
    message.appHash !== undefined &&
      (obj.appHash = base64FromBytes(
        message.appHash !== undefined ? message.appHash : new Uint8Array(),
      ));
    message.lastResultsHash !== undefined &&
      (obj.lastResultsHash = base64FromBytes(
        message.lastResultsHash !== undefined
          ? message.lastResultsHash
          : new Uint8Array(),
      ));
    message.evidenceHash !== undefined &&
      (obj.evidenceHash = base64FromBytes(
        message.evidenceHash !== undefined
          ? message.evidenceHash
          : new Uint8Array(),
      ));
    message.proposerAddress !== undefined &&
      (obj.proposerAddress = base64FromBytes(
        message.proposerAddress !== undefined
          ? message.proposerAddress
          : new Uint8Array(),
      ));
    return obj;
  },
  fromPartial(object: Partial<Header>): Header {
    const message = createBaseHeader();
    message.version =
      object.version !== undefined && object.version !== null
        ? Consensus.fromPartial(object.version)
        : undefined;
    message.chainId = object.chainId ?? '';
    message.height =
      object.height !== undefined && object.height !== null
        ? BigInt(object.height.toString())
        : BigInt(0);
    message.time =
      object.time !== undefined && object.time !== null
        ? Timestamp.fromPartial(object.time)
        : undefined;
    message.lastBlockId =
      object.lastBlockId !== undefined && object.lastBlockId !== null
        ? BlockID.fromPartial(object.lastBlockId)
        : undefined;
    message.lastCommitHash = object.lastCommitHash ?? new Uint8Array();
    message.dataHash = object.dataHash ?? new Uint8Array();
    message.validatorsHash = object.validatorsHash ?? new Uint8Array();
    message.nextValidatorsHash = object.nextValidatorsHash ?? new Uint8Array();
    message.consensusHash = object.consensusHash ?? new Uint8Array();
    message.appHash = object.appHash ?? new Uint8Array();
    message.lastResultsHash = object.lastResultsHash ?? new Uint8Array();
    message.evidenceHash = object.evidenceHash ?? new Uint8Array();
    message.proposerAddress = object.proposerAddress ?? new Uint8Array();
    return message;
  },
  fromProtoMsg(message: HeaderProtoMsg): Header {
    return Header.decode(message.value);
  },
  toProto(message: Header): Uint8Array {
    return Header.encode(message).finish();
  },
  toProtoMsg(message: Header): HeaderProtoMsg {
    return {
      typeUrl: '/tendermint.types.Header',
      value: Header.encode(message).finish(),
    };
  },
};
function createBaseData(): Data {
  return {
    txs: [],
  };
}
export const Data = {
  typeUrl: '/tendermint.types.Data',
  encode(
    message: Data,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    for (const v of message.txs) {
      writer.uint32(10).bytes(v!);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): Data {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseData();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.txs.push(reader.bytes());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): Data {
    return {
      txs: Array.isArray(object?.txs)
        ? object.txs.map((e: any) => bytesFromBase64(e))
        : [],
    };
  },
  toJSON(message: Data): JsonSafe<Data> {
    const obj: any = {};
    if (message.txs) {
      obj.txs = message.txs.map(e =>
        base64FromBytes(e !== undefined ? e : new Uint8Array()),
      );
    } else {
      obj.txs = [];
    }
    return obj;
  },
  fromPartial(object: Partial<Data>): Data {
    const message = createBaseData();
    message.txs = object.txs?.map(e => e) || [];
    return message;
  },
  fromProtoMsg(message: DataProtoMsg): Data {
    return Data.decode(message.value);
  },
  toProto(message: Data): Uint8Array {
    return Data.encode(message).finish();
  },
  toProtoMsg(message: Data): DataProtoMsg {
    return {
      typeUrl: '/tendermint.types.Data',
      value: Data.encode(message).finish(),
    };
  },
};
function createBaseVote(): Vote {
  return {
    type: 0,
    height: BigInt(0),
    round: 0,
    blockId: BlockID.fromPartial({}),
    timestamp: Timestamp.fromPartial({}),
    validatorAddress: new Uint8Array(),
    validatorIndex: 0,
    signature: new Uint8Array(),
  };
}
export const Vote = {
  typeUrl: '/tendermint.types.Vote',
  encode(
    message: Vote,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.type !== 0) {
      writer.uint32(8).int32(message.type);
    }
    if (message.height !== BigInt(0)) {
      writer.uint32(16).int64(message.height);
    }
    if (message.round !== 0) {
      writer.uint32(24).int32(message.round);
    }
    if (message.blockId !== undefined) {
      BlockID.encode(message.blockId, writer.uint32(34).fork()).ldelim();
    }
    if (message.timestamp !== undefined) {
      Timestamp.encode(message.timestamp, writer.uint32(42).fork()).ldelim();
    }
    if (message.validatorAddress.length !== 0) {
      writer.uint32(50).bytes(message.validatorAddress);
    }
    if (message.validatorIndex !== 0) {
      writer.uint32(56).int32(message.validatorIndex);
    }
    if (message.signature.length !== 0) {
      writer.uint32(66).bytes(message.signature);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): Vote {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseVote();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.type = reader.int32() as any;
          break;
        case 2:
          message.height = reader.int64();
          break;
        case 3:
          message.round = reader.int32();
          break;
        case 4:
          message.blockId = BlockID.decode(reader, reader.uint32());
          break;
        case 5:
          message.timestamp = Timestamp.decode(reader, reader.uint32());
          break;
        case 6:
          message.validatorAddress = reader.bytes();
          break;
        case 7:
          message.validatorIndex = reader.int32();
          break;
        case 8:
          message.signature = reader.bytes();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): Vote {
    return {
      type: isSet(object.type) ? signedMsgTypeFromJSON(object.type) : -1,
      height: isSet(object.height)
        ? BigInt(object.height.toString())
        : BigInt(0),
      round: isSet(object.round) ? Number(object.round) : 0,
      blockId: isSet(object.blockId)
        ? BlockID.fromJSON(object.blockId)
        : undefined,
      timestamp: isSet(object.timestamp)
        ? fromJsonTimestamp(object.timestamp)
        : undefined,
      validatorAddress: isSet(object.validatorAddress)
        ? bytesFromBase64(object.validatorAddress)
        : new Uint8Array(),
      validatorIndex: isSet(object.validatorIndex)
        ? Number(object.validatorIndex)
        : 0,
      signature: isSet(object.signature)
        ? bytesFromBase64(object.signature)
        : new Uint8Array(),
    };
  },
  toJSON(message: Vote): JsonSafe<Vote> {
    const obj: any = {};
    message.type !== undefined &&
      (obj.type = signedMsgTypeToJSON(message.type));
    message.height !== undefined &&
      (obj.height = (message.height || BigInt(0)).toString());
    message.round !== undefined && (obj.round = Math.round(message.round));
    message.blockId !== undefined &&
      (obj.blockId = message.blockId
        ? BlockID.toJSON(message.blockId)
        : undefined);
    message.timestamp !== undefined &&
      (obj.timestamp = fromTimestamp(message.timestamp).toISOString());
    message.validatorAddress !== undefined &&
      (obj.validatorAddress = base64FromBytes(
        message.validatorAddress !== undefined
          ? message.validatorAddress
          : new Uint8Array(),
      ));
    message.validatorIndex !== undefined &&
      (obj.validatorIndex = Math.round(message.validatorIndex));
    message.signature !== undefined &&
      (obj.signature = base64FromBytes(
        message.signature !== undefined ? message.signature : new Uint8Array(),
      ));
    return obj;
  },
  fromPartial(object: Partial<Vote>): Vote {
    const message = createBaseVote();
    message.type = object.type ?? 0;
    message.height =
      object.height !== undefined && object.height !== null
        ? BigInt(object.height.toString())
        : BigInt(0);
    message.round = object.round ?? 0;
    message.blockId =
      object.blockId !== undefined && object.blockId !== null
        ? BlockID.fromPartial(object.blockId)
        : undefined;
    message.timestamp =
      object.timestamp !== undefined && object.timestamp !== null
        ? Timestamp.fromPartial(object.timestamp)
        : undefined;
    message.validatorAddress = object.validatorAddress ?? new Uint8Array();
    message.validatorIndex = object.validatorIndex ?? 0;
    message.signature = object.signature ?? new Uint8Array();
    return message;
  },
  fromProtoMsg(message: VoteProtoMsg): Vote {
    return Vote.decode(message.value);
  },
  toProto(message: Vote): Uint8Array {
    return Vote.encode(message).finish();
  },
  toProtoMsg(message: Vote): VoteProtoMsg {
    return {
      typeUrl: '/tendermint.types.Vote',
      value: Vote.encode(message).finish(),
    };
  },
};
function createBaseCommit(): Commit {
  return {
    height: BigInt(0),
    round: 0,
    blockId: BlockID.fromPartial({}),
    signatures: [],
  };
}
export const Commit = {
  typeUrl: '/tendermint.types.Commit',
  encode(
    message: Commit,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.height !== BigInt(0)) {
      writer.uint32(8).int64(message.height);
    }
    if (message.round !== 0) {
      writer.uint32(16).int32(message.round);
    }
    if (message.blockId !== undefined) {
      BlockID.encode(message.blockId, writer.uint32(26).fork()).ldelim();
    }
    for (const v of message.signatures) {
      CommitSig.encode(v!, writer.uint32(34).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): Commit {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommit();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.height = reader.int64();
          break;
        case 2:
          message.round = reader.int32();
          break;
        case 3:
          message.blockId = BlockID.decode(reader, reader.uint32());
          break;
        case 4:
          message.signatures.push(CommitSig.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): Commit {
    return {
      height: isSet(object.height)
        ? BigInt(object.height.toString())
        : BigInt(0),
      round: isSet(object.round) ? Number(object.round) : 0,
      blockId: isSet(object.blockId)
        ? BlockID.fromJSON(object.blockId)
        : undefined,
      signatures: Array.isArray(object?.signatures)
        ? object.signatures.map((e: any) => CommitSig.fromJSON(e))
        : [],
    };
  },
  toJSON(message: Commit): JsonSafe<Commit> {
    const obj: any = {};
    message.height !== undefined &&
      (obj.height = (message.height || BigInt(0)).toString());
    message.round !== undefined && (obj.round = Math.round(message.round));
    message.blockId !== undefined &&
      (obj.blockId = message.blockId
        ? BlockID.toJSON(message.blockId)
        : undefined);
    if (message.signatures) {
      obj.signatures = message.signatures.map(e =>
        e ? CommitSig.toJSON(e) : undefined,
      );
    } else {
      obj.signatures = [];
    }
    return obj;
  },
  fromPartial(object: Partial<Commit>): Commit {
    const message = createBaseCommit();
    message.height =
      object.height !== undefined && object.height !== null
        ? BigInt(object.height.toString())
        : BigInt(0);
    message.round = object.round ?? 0;
    message.blockId =
      object.blockId !== undefined && object.blockId !== null
        ? BlockID.fromPartial(object.blockId)
        : undefined;
    message.signatures =
      object.signatures?.map(e => CommitSig.fromPartial(e)) || [];
    return message;
  },
  fromProtoMsg(message: CommitProtoMsg): Commit {
    return Commit.decode(message.value);
  },
  toProto(message: Commit): Uint8Array {
    return Commit.encode(message).finish();
  },
  toProtoMsg(message: Commit): CommitProtoMsg {
    return {
      typeUrl: '/tendermint.types.Commit',
      value: Commit.encode(message).finish(),
    };
  },
};
function createBaseCommitSig(): CommitSig {
  return {
    blockIdFlag: 0,
    validatorAddress: new Uint8Array(),
    timestamp: Timestamp.fromPartial({}),
    signature: new Uint8Array(),
  };
}
export const CommitSig = {
  typeUrl: '/tendermint.types.CommitSig',
  encode(
    message: CommitSig,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.blockIdFlag !== 0) {
      writer.uint32(8).int32(message.blockIdFlag);
    }
    if (message.validatorAddress.length !== 0) {
      writer.uint32(18).bytes(message.validatorAddress);
    }
    if (message.timestamp !== undefined) {
      Timestamp.encode(message.timestamp, writer.uint32(26).fork()).ldelim();
    }
    if (message.signature.length !== 0) {
      writer.uint32(34).bytes(message.signature);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): CommitSig {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommitSig();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.blockIdFlag = reader.int32() as any;
          break;
        case 2:
          message.validatorAddress = reader.bytes();
          break;
        case 3:
          message.timestamp = Timestamp.decode(reader, reader.uint32());
          break;
        case 4:
          message.signature = reader.bytes();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): CommitSig {
    return {
      blockIdFlag: isSet(object.blockIdFlag)
        ? blockIDFlagFromJSON(object.blockIdFlag)
        : -1,
      validatorAddress: isSet(object.validatorAddress)
        ? bytesFromBase64(object.validatorAddress)
        : new Uint8Array(),
      timestamp: isSet(object.timestamp)
        ? fromJsonTimestamp(object.timestamp)
        : undefined,
      signature: isSet(object.signature)
        ? bytesFromBase64(object.signature)
        : new Uint8Array(),
    };
  },
  toJSON(message: CommitSig): JsonSafe<CommitSig> {
    const obj: any = {};
    message.blockIdFlag !== undefined &&
      (obj.blockIdFlag = blockIDFlagToJSON(message.blockIdFlag));
    message.validatorAddress !== undefined &&
      (obj.validatorAddress = base64FromBytes(
        message.validatorAddress !== undefined
          ? message.validatorAddress
          : new Uint8Array(),
      ));
    message.timestamp !== undefined &&
      (obj.timestamp = fromTimestamp(message.timestamp).toISOString());
    message.signature !== undefined &&
      (obj.signature = base64FromBytes(
        message.signature !== undefined ? message.signature : new Uint8Array(),
      ));
    return obj;
  },
  fromPartial(object: Partial<CommitSig>): CommitSig {
    const message = createBaseCommitSig();
    message.blockIdFlag = object.blockIdFlag ?? 0;
    message.validatorAddress = object.validatorAddress ?? new Uint8Array();
    message.timestamp =
      object.timestamp !== undefined && object.timestamp !== null
        ? Timestamp.fromPartial(object.timestamp)
        : undefined;
    message.signature = object.signature ?? new Uint8Array();
    return message;
  },
  fromProtoMsg(message: CommitSigProtoMsg): CommitSig {
    return CommitSig.decode(message.value);
  },
  toProto(message: CommitSig): Uint8Array {
    return CommitSig.encode(message).finish();
  },
  toProtoMsg(message: CommitSig): CommitSigProtoMsg {
    return {
      typeUrl: '/tendermint.types.CommitSig',
      value: CommitSig.encode(message).finish(),
    };
  },
};
function createBaseProposal(): Proposal {
  return {
    type: 0,
    height: BigInt(0),
    round: 0,
    polRound: 0,
    blockId: BlockID.fromPartial({}),
    timestamp: Timestamp.fromPartial({}),
    signature: new Uint8Array(),
  };
}
export const Proposal = {
  typeUrl: '/tendermint.types.Proposal',
  encode(
    message: Proposal,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.type !== 0) {
      writer.uint32(8).int32(message.type);
    }
    if (message.height !== BigInt(0)) {
      writer.uint32(16).int64(message.height);
    }
    if (message.round !== 0) {
      writer.uint32(24).int32(message.round);
    }
    if (message.polRound !== 0) {
      writer.uint32(32).int32(message.polRound);
    }
    if (message.blockId !== undefined) {
      BlockID.encode(message.blockId, writer.uint32(42).fork()).ldelim();
    }
    if (message.timestamp !== undefined) {
      Timestamp.encode(message.timestamp, writer.uint32(50).fork()).ldelim();
    }
    if (message.signature.length !== 0) {
      writer.uint32(58).bytes(message.signature);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): Proposal {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseProposal();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.type = reader.int32() as any;
          break;
        case 2:
          message.height = reader.int64();
          break;
        case 3:
          message.round = reader.int32();
          break;
        case 4:
          message.polRound = reader.int32();
          break;
        case 5:
          message.blockId = BlockID.decode(reader, reader.uint32());
          break;
        case 6:
          message.timestamp = Timestamp.decode(reader, reader.uint32());
          break;
        case 7:
          message.signature = reader.bytes();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): Proposal {
    return {
      type: isSet(object.type) ? signedMsgTypeFromJSON(object.type) : -1,
      height: isSet(object.height)
        ? BigInt(object.height.toString())
        : BigInt(0),
      round: isSet(object.round) ? Number(object.round) : 0,
      polRound: isSet(object.polRound) ? Number(object.polRound) : 0,
      blockId: isSet(object.blockId)
        ? BlockID.fromJSON(object.blockId)
        : undefined,
      timestamp: isSet(object.timestamp)
        ? fromJsonTimestamp(object.timestamp)
        : undefined,
      signature: isSet(object.signature)
        ? bytesFromBase64(object.signature)
        : new Uint8Array(),
    };
  },
  toJSON(message: Proposal): JsonSafe<Proposal> {
    const obj: any = {};
    message.type !== undefined &&
      (obj.type = signedMsgTypeToJSON(message.type));
    message.height !== undefined &&
      (obj.height = (message.height || BigInt(0)).toString());
    message.round !== undefined && (obj.round = Math.round(message.round));
    message.polRound !== undefined &&
      (obj.polRound = Math.round(message.polRound));
    message.blockId !== undefined &&
      (obj.blockId = message.blockId
        ? BlockID.toJSON(message.blockId)
        : undefined);
    message.timestamp !== undefined &&
      (obj.timestamp = fromTimestamp(message.timestamp).toISOString());
    message.signature !== undefined &&
      (obj.signature = base64FromBytes(
        message.signature !== undefined ? message.signature : new Uint8Array(),
      ));
    return obj;
  },
  fromPartial(object: Partial<Proposal>): Proposal {
    const message = createBaseProposal();
    message.type = object.type ?? 0;
    message.height =
      object.height !== undefined && object.height !== null
        ? BigInt(object.height.toString())
        : BigInt(0);
    message.round = object.round ?? 0;
    message.polRound = object.polRound ?? 0;
    message.blockId =
      object.blockId !== undefined && object.blockId !== null
        ? BlockID.fromPartial(object.blockId)
        : undefined;
    message.timestamp =
      object.timestamp !== undefined && object.timestamp !== null
        ? Timestamp.fromPartial(object.timestamp)
        : undefined;
    message.signature = object.signature ?? new Uint8Array();
    return message;
  },
  fromProtoMsg(message: ProposalProtoMsg): Proposal {
    return Proposal.decode(message.value);
  },
  toProto(message: Proposal): Uint8Array {
    return Proposal.encode(message).finish();
  },
  toProtoMsg(message: Proposal): ProposalProtoMsg {
    return {
      typeUrl: '/tendermint.types.Proposal',
      value: Proposal.encode(message).finish(),
    };
  },
};
function createBaseSignedHeader(): SignedHeader {
  return {
    header: undefined,
    commit: undefined,
  };
}
export const SignedHeader = {
  typeUrl: '/tendermint.types.SignedHeader',
  encode(
    message: SignedHeader,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.header !== undefined) {
      Header.encode(message.header, writer.uint32(10).fork()).ldelim();
    }
    if (message.commit !== undefined) {
      Commit.encode(message.commit, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): SignedHeader {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSignedHeader();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.header = Header.decode(reader, reader.uint32());
          break;
        case 2:
          message.commit = Commit.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): SignedHeader {
    return {
      header: isSet(object.header) ? Header.fromJSON(object.header) : undefined,
      commit: isSet(object.commit) ? Commit.fromJSON(object.commit) : undefined,
    };
  },
  toJSON(message: SignedHeader): JsonSafe<SignedHeader> {
    const obj: any = {};
    message.header !== undefined &&
      (obj.header = message.header ? Header.toJSON(message.header) : undefined);
    message.commit !== undefined &&
      (obj.commit = message.commit ? Commit.toJSON(message.commit) : undefined);
    return obj;
  },
  fromPartial(object: Partial<SignedHeader>): SignedHeader {
    const message = createBaseSignedHeader();
    message.header =
      object.header !== undefined && object.header !== null
        ? Header.fromPartial(object.header)
        : undefined;
    message.commit =
      object.commit !== undefined && object.commit !== null
        ? Commit.fromPartial(object.commit)
        : undefined;
    return message;
  },
  fromProtoMsg(message: SignedHeaderProtoMsg): SignedHeader {
    return SignedHeader.decode(message.value);
  },
  toProto(message: SignedHeader): Uint8Array {
    return SignedHeader.encode(message).finish();
  },
  toProtoMsg(message: SignedHeader): SignedHeaderProtoMsg {
    return {
      typeUrl: '/tendermint.types.SignedHeader',
      value: SignedHeader.encode(message).finish(),
    };
  },
};
function createBaseLightBlock(): LightBlock {
  return {
    signedHeader: undefined,
    validatorSet: undefined,
  };
}
export const LightBlock = {
  typeUrl: '/tendermint.types.LightBlock',
  encode(
    message: LightBlock,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.signedHeader !== undefined) {
      SignedHeader.encode(
        message.signedHeader,
        writer.uint32(10).fork(),
      ).ldelim();
    }
    if (message.validatorSet !== undefined) {
      ValidatorSet.encode(
        message.validatorSet,
        writer.uint32(18).fork(),
      ).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): LightBlock {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseLightBlock();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.signedHeader = SignedHeader.decode(reader, reader.uint32());
          break;
        case 2:
          message.validatorSet = ValidatorSet.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): LightBlock {
    return {
      signedHeader: isSet(object.signedHeader)
        ? SignedHeader.fromJSON(object.signedHeader)
        : undefined,
      validatorSet: isSet(object.validatorSet)
        ? ValidatorSet.fromJSON(object.validatorSet)
        : undefined,
    };
  },
  toJSON(message: LightBlock): JsonSafe<LightBlock> {
    const obj: any = {};
    message.signedHeader !== undefined &&
      (obj.signedHeader = message.signedHeader
        ? SignedHeader.toJSON(message.signedHeader)
        : undefined);
    message.validatorSet !== undefined &&
      (obj.validatorSet = message.validatorSet
        ? ValidatorSet.toJSON(message.validatorSet)
        : undefined);
    return obj;
  },
  fromPartial(object: Partial<LightBlock>): LightBlock {
    const message = createBaseLightBlock();
    message.signedHeader =
      object.signedHeader !== undefined && object.signedHeader !== null
        ? SignedHeader.fromPartial(object.signedHeader)
        : undefined;
    message.validatorSet =
      object.validatorSet !== undefined && object.validatorSet !== null
        ? ValidatorSet.fromPartial(object.validatorSet)
        : undefined;
    return message;
  },
  fromProtoMsg(message: LightBlockProtoMsg): LightBlock {
    return LightBlock.decode(message.value);
  },
  toProto(message: LightBlock): Uint8Array {
    return LightBlock.encode(message).finish();
  },
  toProtoMsg(message: LightBlock): LightBlockProtoMsg {
    return {
      typeUrl: '/tendermint.types.LightBlock',
      value: LightBlock.encode(message).finish(),
    };
  },
};
function createBaseBlockMeta(): BlockMeta {
  return {
    blockId: BlockID.fromPartial({}),
    blockSize: BigInt(0),
    header: Header.fromPartial({}),
    numTxs: BigInt(0),
  };
}
export const BlockMeta = {
  typeUrl: '/tendermint.types.BlockMeta',
  encode(
    message: BlockMeta,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.blockId !== undefined) {
      BlockID.encode(message.blockId, writer.uint32(10).fork()).ldelim();
    }
    if (message.blockSize !== BigInt(0)) {
      writer.uint32(16).int64(message.blockSize);
    }
    if (message.header !== undefined) {
      Header.encode(message.header, writer.uint32(26).fork()).ldelim();
    }
    if (message.numTxs !== BigInt(0)) {
      writer.uint32(32).int64(message.numTxs);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): BlockMeta {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBlockMeta();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.blockId = BlockID.decode(reader, reader.uint32());
          break;
        case 2:
          message.blockSize = reader.int64();
          break;
        case 3:
          message.header = Header.decode(reader, reader.uint32());
          break;
        case 4:
          message.numTxs = reader.int64();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): BlockMeta {
    return {
      blockId: isSet(object.blockId)
        ? BlockID.fromJSON(object.blockId)
        : undefined,
      blockSize: isSet(object.blockSize)
        ? BigInt(object.blockSize.toString())
        : BigInt(0),
      header: isSet(object.header) ? Header.fromJSON(object.header) : undefined,
      numTxs: isSet(object.numTxs)
        ? BigInt(object.numTxs.toString())
        : BigInt(0),
    };
  },
  toJSON(message: BlockMeta): JsonSafe<BlockMeta> {
    const obj: any = {};
    message.blockId !== undefined &&
      (obj.blockId = message.blockId
        ? BlockID.toJSON(message.blockId)
        : undefined);
    message.blockSize !== undefined &&
      (obj.blockSize = (message.blockSize || BigInt(0)).toString());
    message.header !== undefined &&
      (obj.header = message.header ? Header.toJSON(message.header) : undefined);
    message.numTxs !== undefined &&
      (obj.numTxs = (message.numTxs || BigInt(0)).toString());
    return obj;
  },
  fromPartial(object: Partial<BlockMeta>): BlockMeta {
    const message = createBaseBlockMeta();
    message.blockId =
      object.blockId !== undefined && object.blockId !== null
        ? BlockID.fromPartial(object.blockId)
        : undefined;
    message.blockSize =
      object.blockSize !== undefined && object.blockSize !== null
        ? BigInt(object.blockSize.toString())
        : BigInt(0);
    message.header =
      object.header !== undefined && object.header !== null
        ? Header.fromPartial(object.header)
        : undefined;
    message.numTxs =
      object.numTxs !== undefined && object.numTxs !== null
        ? BigInt(object.numTxs.toString())
        : BigInt(0);
    return message;
  },
  fromProtoMsg(message: BlockMetaProtoMsg): BlockMeta {
    return BlockMeta.decode(message.value);
  },
  toProto(message: BlockMeta): Uint8Array {
    return BlockMeta.encode(message).finish();
  },
  toProtoMsg(message: BlockMeta): BlockMetaProtoMsg {
    return {
      typeUrl: '/tendermint.types.BlockMeta',
      value: BlockMeta.encode(message).finish(),
    };
  },
};
function createBaseTxProof(): TxProof {
  return {
    rootHash: new Uint8Array(),
    data: new Uint8Array(),
    proof: undefined,
  };
}
export const TxProof = {
  typeUrl: '/tendermint.types.TxProof',
  encode(
    message: TxProof,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.rootHash.length !== 0) {
      writer.uint32(10).bytes(message.rootHash);
    }
    if (message.data.length !== 0) {
      writer.uint32(18).bytes(message.data);
    }
    if (message.proof !== undefined) {
      Proof.encode(message.proof, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): TxProof {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTxProof();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.rootHash = reader.bytes();
          break;
        case 2:
          message.data = reader.bytes();
          break;
        case 3:
          message.proof = Proof.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): TxProof {
    return {
      rootHash: isSet(object.rootHash)
        ? bytesFromBase64(object.rootHash)
        : new Uint8Array(),
      data: isSet(object.data)
        ? bytesFromBase64(object.data)
        : new Uint8Array(),
      proof: isSet(object.proof) ? Proof.fromJSON(object.proof) : undefined,
    };
  },
  toJSON(message: TxProof): JsonSafe<TxProof> {
    const obj: any = {};
    message.rootHash !== undefined &&
      (obj.rootHash = base64FromBytes(
        message.rootHash !== undefined ? message.rootHash : new Uint8Array(),
      ));
    message.data !== undefined &&
      (obj.data = base64FromBytes(
        message.data !== undefined ? message.data : new Uint8Array(),
      ));
    message.proof !== undefined &&
      (obj.proof = message.proof ? Proof.toJSON(message.proof) : undefined);
    return obj;
  },
  fromPartial(object: Partial<TxProof>): TxProof {
    const message = createBaseTxProof();
    message.rootHash = object.rootHash ?? new Uint8Array();
    message.data = object.data ?? new Uint8Array();
    message.proof =
      object.proof !== undefined && object.proof !== null
        ? Proof.fromPartial(object.proof)
        : undefined;
    return message;
  },
  fromProtoMsg(message: TxProofProtoMsg): TxProof {
    return TxProof.decode(message.value);
  },
  toProto(message: TxProof): Uint8Array {
    return TxProof.encode(message).finish();
  },
  toProtoMsg(message: TxProof): TxProofProtoMsg {
    return {
      typeUrl: '/tendermint.types.TxProof',
      value: TxProof.encode(message).finish(),
    };
  },
};
