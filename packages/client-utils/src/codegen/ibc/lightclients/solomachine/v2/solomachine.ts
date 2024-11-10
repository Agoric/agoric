//@ts-nocheck
import { Any, type AnySDKType } from '../../../../google/protobuf/any.js';
import {
  ConnectionEnd,
  type ConnectionEndSDKType,
} from '../../../core/connection/v1/connection.js';
import {
  Channel,
  type ChannelSDKType,
} from '../../../core/channel/v1/channel.js';
import { BinaryReader, BinaryWriter } from '../../../../binary.js';
import {
  isSet,
  bytesFromBase64,
  base64FromBytes,
} from '../../../../helpers.js';
import { type JsonSafe } from '../../../../json-safe.js';
/**
 * DataType defines the type of solo machine proof being created. This is done
 * to preserve uniqueness of different data sign byte encodings.
 */
export enum DataType {
  /** DATA_TYPE_UNINITIALIZED_UNSPECIFIED - Default State */
  DATA_TYPE_UNINITIALIZED_UNSPECIFIED = 0,
  /** DATA_TYPE_CLIENT_STATE - Data type for client state verification */
  DATA_TYPE_CLIENT_STATE = 1,
  /** DATA_TYPE_CONSENSUS_STATE - Data type for consensus state verification */
  DATA_TYPE_CONSENSUS_STATE = 2,
  /** DATA_TYPE_CONNECTION_STATE - Data type for connection state verification */
  DATA_TYPE_CONNECTION_STATE = 3,
  /** DATA_TYPE_CHANNEL_STATE - Data type for channel state verification */
  DATA_TYPE_CHANNEL_STATE = 4,
  /** DATA_TYPE_PACKET_COMMITMENT - Data type for packet commitment verification */
  DATA_TYPE_PACKET_COMMITMENT = 5,
  /** DATA_TYPE_PACKET_ACKNOWLEDGEMENT - Data type for packet acknowledgement verification */
  DATA_TYPE_PACKET_ACKNOWLEDGEMENT = 6,
  /** DATA_TYPE_PACKET_RECEIPT_ABSENCE - Data type for packet receipt absence verification */
  DATA_TYPE_PACKET_RECEIPT_ABSENCE = 7,
  /** DATA_TYPE_NEXT_SEQUENCE_RECV - Data type for next sequence recv verification */
  DATA_TYPE_NEXT_SEQUENCE_RECV = 8,
  /** DATA_TYPE_HEADER - Data type for header verification */
  DATA_TYPE_HEADER = 9,
  UNRECOGNIZED = -1,
}
export const DataTypeSDKType = DataType;
export function dataTypeFromJSON(object: any): DataType {
  switch (object) {
    case 0:
    case 'DATA_TYPE_UNINITIALIZED_UNSPECIFIED':
      return DataType.DATA_TYPE_UNINITIALIZED_UNSPECIFIED;
    case 1:
    case 'DATA_TYPE_CLIENT_STATE':
      return DataType.DATA_TYPE_CLIENT_STATE;
    case 2:
    case 'DATA_TYPE_CONSENSUS_STATE':
      return DataType.DATA_TYPE_CONSENSUS_STATE;
    case 3:
    case 'DATA_TYPE_CONNECTION_STATE':
      return DataType.DATA_TYPE_CONNECTION_STATE;
    case 4:
    case 'DATA_TYPE_CHANNEL_STATE':
      return DataType.DATA_TYPE_CHANNEL_STATE;
    case 5:
    case 'DATA_TYPE_PACKET_COMMITMENT':
      return DataType.DATA_TYPE_PACKET_COMMITMENT;
    case 6:
    case 'DATA_TYPE_PACKET_ACKNOWLEDGEMENT':
      return DataType.DATA_TYPE_PACKET_ACKNOWLEDGEMENT;
    case 7:
    case 'DATA_TYPE_PACKET_RECEIPT_ABSENCE':
      return DataType.DATA_TYPE_PACKET_RECEIPT_ABSENCE;
    case 8:
    case 'DATA_TYPE_NEXT_SEQUENCE_RECV':
      return DataType.DATA_TYPE_NEXT_SEQUENCE_RECV;
    case 9:
    case 'DATA_TYPE_HEADER':
      return DataType.DATA_TYPE_HEADER;
    case -1:
    case 'UNRECOGNIZED':
    default:
      return DataType.UNRECOGNIZED;
  }
}
export function dataTypeToJSON(object: DataType): string {
  switch (object) {
    case DataType.DATA_TYPE_UNINITIALIZED_UNSPECIFIED:
      return 'DATA_TYPE_UNINITIALIZED_UNSPECIFIED';
    case DataType.DATA_TYPE_CLIENT_STATE:
      return 'DATA_TYPE_CLIENT_STATE';
    case DataType.DATA_TYPE_CONSENSUS_STATE:
      return 'DATA_TYPE_CONSENSUS_STATE';
    case DataType.DATA_TYPE_CONNECTION_STATE:
      return 'DATA_TYPE_CONNECTION_STATE';
    case DataType.DATA_TYPE_CHANNEL_STATE:
      return 'DATA_TYPE_CHANNEL_STATE';
    case DataType.DATA_TYPE_PACKET_COMMITMENT:
      return 'DATA_TYPE_PACKET_COMMITMENT';
    case DataType.DATA_TYPE_PACKET_ACKNOWLEDGEMENT:
      return 'DATA_TYPE_PACKET_ACKNOWLEDGEMENT';
    case DataType.DATA_TYPE_PACKET_RECEIPT_ABSENCE:
      return 'DATA_TYPE_PACKET_RECEIPT_ABSENCE';
    case DataType.DATA_TYPE_NEXT_SEQUENCE_RECV:
      return 'DATA_TYPE_NEXT_SEQUENCE_RECV';
    case DataType.DATA_TYPE_HEADER:
      return 'DATA_TYPE_HEADER';
    case DataType.UNRECOGNIZED:
    default:
      return 'UNRECOGNIZED';
  }
}
/**
 * ClientState defines a solo machine client that tracks the current consensus
 * state and if the client is frozen.
 */
export interface ClientState {
  /** latest sequence of the client state */
  sequence: bigint;
  /** frozen sequence of the solo machine */
  isFrozen: boolean;
  consensusState?: ConsensusState;
  /**
   * when set to true, will allow governance to update a solo machine client.
   * The client will be unfrozen if it is frozen.
   */
  allowUpdateAfterProposal: boolean;
}
export interface ClientStateProtoMsg {
  typeUrl: '/ibc.lightclients.solomachine.v2.ClientState';
  value: Uint8Array;
}
/**
 * ClientState defines a solo machine client that tracks the current consensus
 * state and if the client is frozen.
 */
export interface ClientStateSDKType {
  sequence: bigint;
  is_frozen: boolean;
  consensus_state?: ConsensusStateSDKType;
  allow_update_after_proposal: boolean;
}
/**
 * ConsensusState defines a solo machine consensus state. The sequence of a
 * consensus state is contained in the "height" key used in storing the
 * consensus state.
 */
export interface ConsensusState {
  /** public key of the solo machine */
  publicKey?: Any;
  /**
   * diversifier allows the same public key to be re-used across different solo
   * machine clients (potentially on different chains) without being considered
   * misbehaviour.
   */
  diversifier: string;
  timestamp: bigint;
}
export interface ConsensusStateProtoMsg {
  typeUrl: '/ibc.lightclients.solomachine.v2.ConsensusState';
  value: Uint8Array;
}
/**
 * ConsensusState defines a solo machine consensus state. The sequence of a
 * consensus state is contained in the "height" key used in storing the
 * consensus state.
 */
export interface ConsensusStateSDKType {
  public_key?: AnySDKType;
  diversifier: string;
  timestamp: bigint;
}
/** Header defines a solo machine consensus header */
export interface Header {
  /** sequence to update solo machine public key at */
  sequence: bigint;
  timestamp: bigint;
  signature: Uint8Array;
  newPublicKey?: Any;
  newDiversifier: string;
}
export interface HeaderProtoMsg {
  typeUrl: '/ibc.lightclients.solomachine.v2.Header';
  value: Uint8Array;
}
/** Header defines a solo machine consensus header */
export interface HeaderSDKType {
  sequence: bigint;
  timestamp: bigint;
  signature: Uint8Array;
  new_public_key?: AnySDKType;
  new_diversifier: string;
}
/**
 * Misbehaviour defines misbehaviour for a solo machine which consists
 * of a sequence and two signatures over different messages at that sequence.
 */
export interface Misbehaviour {
  clientId: string;
  sequence: bigint;
  signatureOne?: SignatureAndData;
  signatureTwo?: SignatureAndData;
}
export interface MisbehaviourProtoMsg {
  typeUrl: '/ibc.lightclients.solomachine.v2.Misbehaviour';
  value: Uint8Array;
}
/**
 * Misbehaviour defines misbehaviour for a solo machine which consists
 * of a sequence and two signatures over different messages at that sequence.
 */
export interface MisbehaviourSDKType {
  client_id: string;
  sequence: bigint;
  signature_one?: SignatureAndDataSDKType;
  signature_two?: SignatureAndDataSDKType;
}
/**
 * SignatureAndData contains a signature and the data signed over to create that
 * signature.
 */
export interface SignatureAndData {
  signature: Uint8Array;
  dataType: DataType;
  data: Uint8Array;
  timestamp: bigint;
}
export interface SignatureAndDataProtoMsg {
  typeUrl: '/ibc.lightclients.solomachine.v2.SignatureAndData';
  value: Uint8Array;
}
/**
 * SignatureAndData contains a signature and the data signed over to create that
 * signature.
 */
export interface SignatureAndDataSDKType {
  signature: Uint8Array;
  data_type: DataType;
  data: Uint8Array;
  timestamp: bigint;
}
/**
 * TimestampedSignatureData contains the signature data and the timestamp of the
 * signature.
 */
export interface TimestampedSignatureData {
  signatureData: Uint8Array;
  timestamp: bigint;
}
export interface TimestampedSignatureDataProtoMsg {
  typeUrl: '/ibc.lightclients.solomachine.v2.TimestampedSignatureData';
  value: Uint8Array;
}
/**
 * TimestampedSignatureData contains the signature data and the timestamp of the
 * signature.
 */
export interface TimestampedSignatureDataSDKType {
  signature_data: Uint8Array;
  timestamp: bigint;
}
/** SignBytes defines the signed bytes used for signature verification. */
export interface SignBytes {
  sequence: bigint;
  timestamp: bigint;
  diversifier: string;
  /** type of the data used */
  dataType: DataType;
  /** marshaled data */
  data: Uint8Array;
}
export interface SignBytesProtoMsg {
  typeUrl: '/ibc.lightclients.solomachine.v2.SignBytes';
  value: Uint8Array;
}
/** SignBytes defines the signed bytes used for signature verification. */
export interface SignBytesSDKType {
  sequence: bigint;
  timestamp: bigint;
  diversifier: string;
  data_type: DataType;
  data: Uint8Array;
}
/** HeaderData returns the SignBytes data for update verification. */
export interface HeaderData {
  /** header public key */
  newPubKey?: Any;
  /** header diversifier */
  newDiversifier: string;
}
export interface HeaderDataProtoMsg {
  typeUrl: '/ibc.lightclients.solomachine.v2.HeaderData';
  value: Uint8Array;
}
/** HeaderData returns the SignBytes data for update verification. */
export interface HeaderDataSDKType {
  new_pub_key?: AnySDKType;
  new_diversifier: string;
}
/** ClientStateData returns the SignBytes data for client state verification. */
export interface ClientStateData {
  path: Uint8Array;
  clientState?: Any;
}
export interface ClientStateDataProtoMsg {
  typeUrl: '/ibc.lightclients.solomachine.v2.ClientStateData';
  value: Uint8Array;
}
/** ClientStateData returns the SignBytes data for client state verification. */
export interface ClientStateDataSDKType {
  path: Uint8Array;
  client_state?: AnySDKType;
}
/**
 * ConsensusStateData returns the SignBytes data for consensus state
 * verification.
 */
export interface ConsensusStateData {
  path: Uint8Array;
  consensusState?: Any;
}
export interface ConsensusStateDataProtoMsg {
  typeUrl: '/ibc.lightclients.solomachine.v2.ConsensusStateData';
  value: Uint8Array;
}
/**
 * ConsensusStateData returns the SignBytes data for consensus state
 * verification.
 */
export interface ConsensusStateDataSDKType {
  path: Uint8Array;
  consensus_state?: AnySDKType;
}
/**
 * ConnectionStateData returns the SignBytes data for connection state
 * verification.
 */
export interface ConnectionStateData {
  path: Uint8Array;
  connection?: ConnectionEnd;
}
export interface ConnectionStateDataProtoMsg {
  typeUrl: '/ibc.lightclients.solomachine.v2.ConnectionStateData';
  value: Uint8Array;
}
/**
 * ConnectionStateData returns the SignBytes data for connection state
 * verification.
 */
export interface ConnectionStateDataSDKType {
  path: Uint8Array;
  connection?: ConnectionEndSDKType;
}
/**
 * ChannelStateData returns the SignBytes data for channel state
 * verification.
 */
export interface ChannelStateData {
  path: Uint8Array;
  channel?: Channel;
}
export interface ChannelStateDataProtoMsg {
  typeUrl: '/ibc.lightclients.solomachine.v2.ChannelStateData';
  value: Uint8Array;
}
/**
 * ChannelStateData returns the SignBytes data for channel state
 * verification.
 */
export interface ChannelStateDataSDKType {
  path: Uint8Array;
  channel?: ChannelSDKType;
}
/**
 * PacketCommitmentData returns the SignBytes data for packet commitment
 * verification.
 */
export interface PacketCommitmentData {
  path: Uint8Array;
  commitment: Uint8Array;
}
export interface PacketCommitmentDataProtoMsg {
  typeUrl: '/ibc.lightclients.solomachine.v2.PacketCommitmentData';
  value: Uint8Array;
}
/**
 * PacketCommitmentData returns the SignBytes data for packet commitment
 * verification.
 */
export interface PacketCommitmentDataSDKType {
  path: Uint8Array;
  commitment: Uint8Array;
}
/**
 * PacketAcknowledgementData returns the SignBytes data for acknowledgement
 * verification.
 */
export interface PacketAcknowledgementData {
  path: Uint8Array;
  acknowledgement: Uint8Array;
}
export interface PacketAcknowledgementDataProtoMsg {
  typeUrl: '/ibc.lightclients.solomachine.v2.PacketAcknowledgementData';
  value: Uint8Array;
}
/**
 * PacketAcknowledgementData returns the SignBytes data for acknowledgement
 * verification.
 */
export interface PacketAcknowledgementDataSDKType {
  path: Uint8Array;
  acknowledgement: Uint8Array;
}
/**
 * PacketReceiptAbsenceData returns the SignBytes data for
 * packet receipt absence verification.
 */
export interface PacketReceiptAbsenceData {
  path: Uint8Array;
}
export interface PacketReceiptAbsenceDataProtoMsg {
  typeUrl: '/ibc.lightclients.solomachine.v2.PacketReceiptAbsenceData';
  value: Uint8Array;
}
/**
 * PacketReceiptAbsenceData returns the SignBytes data for
 * packet receipt absence verification.
 */
export interface PacketReceiptAbsenceDataSDKType {
  path: Uint8Array;
}
/**
 * NextSequenceRecvData returns the SignBytes data for verification of the next
 * sequence to be received.
 */
export interface NextSequenceRecvData {
  path: Uint8Array;
  nextSeqRecv: bigint;
}
export interface NextSequenceRecvDataProtoMsg {
  typeUrl: '/ibc.lightclients.solomachine.v2.NextSequenceRecvData';
  value: Uint8Array;
}
/**
 * NextSequenceRecvData returns the SignBytes data for verification of the next
 * sequence to be received.
 */
export interface NextSequenceRecvDataSDKType {
  path: Uint8Array;
  next_seq_recv: bigint;
}
function createBaseClientState(): ClientState {
  return {
    sequence: BigInt(0),
    isFrozen: false,
    consensusState: undefined,
    allowUpdateAfterProposal: false,
  };
}
export const ClientState = {
  typeUrl: '/ibc.lightclients.solomachine.v2.ClientState',
  encode(
    message: ClientState,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.sequence !== BigInt(0)) {
      writer.uint32(8).uint64(message.sequence);
    }
    if (message.isFrozen === true) {
      writer.uint32(16).bool(message.isFrozen);
    }
    if (message.consensusState !== undefined) {
      ConsensusState.encode(
        message.consensusState,
        writer.uint32(26).fork(),
      ).ldelim();
    }
    if (message.allowUpdateAfterProposal === true) {
      writer.uint32(32).bool(message.allowUpdateAfterProposal);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): ClientState {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseClientState();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.sequence = reader.uint64();
          break;
        case 2:
          message.isFrozen = reader.bool();
          break;
        case 3:
          message.consensusState = ConsensusState.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 4:
          message.allowUpdateAfterProposal = reader.bool();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): ClientState {
    return {
      sequence: isSet(object.sequence)
        ? BigInt(object.sequence.toString())
        : BigInt(0),
      isFrozen: isSet(object.isFrozen) ? Boolean(object.isFrozen) : false,
      consensusState: isSet(object.consensusState)
        ? ConsensusState.fromJSON(object.consensusState)
        : undefined,
      allowUpdateAfterProposal: isSet(object.allowUpdateAfterProposal)
        ? Boolean(object.allowUpdateAfterProposal)
        : false,
    };
  },
  toJSON(message: ClientState): JsonSafe<ClientState> {
    const obj: any = {};
    message.sequence !== undefined &&
      (obj.sequence = (message.sequence || BigInt(0)).toString());
    message.isFrozen !== undefined && (obj.isFrozen = message.isFrozen);
    message.consensusState !== undefined &&
      (obj.consensusState = message.consensusState
        ? ConsensusState.toJSON(message.consensusState)
        : undefined);
    message.allowUpdateAfterProposal !== undefined &&
      (obj.allowUpdateAfterProposal = message.allowUpdateAfterProposal);
    return obj;
  },
  fromPartial(object: Partial<ClientState>): ClientState {
    const message = createBaseClientState();
    message.sequence =
      object.sequence !== undefined && object.sequence !== null
        ? BigInt(object.sequence.toString())
        : BigInt(0);
    message.isFrozen = object.isFrozen ?? false;
    message.consensusState =
      object.consensusState !== undefined && object.consensusState !== null
        ? ConsensusState.fromPartial(object.consensusState)
        : undefined;
    message.allowUpdateAfterProposal = object.allowUpdateAfterProposal ?? false;
    return message;
  },
  fromProtoMsg(message: ClientStateProtoMsg): ClientState {
    return ClientState.decode(message.value);
  },
  toProto(message: ClientState): Uint8Array {
    return ClientState.encode(message).finish();
  },
  toProtoMsg(message: ClientState): ClientStateProtoMsg {
    return {
      typeUrl: '/ibc.lightclients.solomachine.v2.ClientState',
      value: ClientState.encode(message).finish(),
    };
  },
};
function createBaseConsensusState(): ConsensusState {
  return {
    publicKey: undefined,
    diversifier: '',
    timestamp: BigInt(0),
  };
}
export const ConsensusState = {
  typeUrl: '/ibc.lightclients.solomachine.v2.ConsensusState',
  encode(
    message: ConsensusState,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.publicKey !== undefined) {
      Any.encode(message.publicKey, writer.uint32(10).fork()).ldelim();
    }
    if (message.diversifier !== '') {
      writer.uint32(18).string(message.diversifier);
    }
    if (message.timestamp !== BigInt(0)) {
      writer.uint32(24).uint64(message.timestamp);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): ConsensusState {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseConsensusState();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.publicKey = Any.decode(reader, reader.uint32());
          break;
        case 2:
          message.diversifier = reader.string();
          break;
        case 3:
          message.timestamp = reader.uint64();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): ConsensusState {
    return {
      publicKey: isSet(object.publicKey)
        ? Any.fromJSON(object.publicKey)
        : undefined,
      diversifier: isSet(object.diversifier) ? String(object.diversifier) : '',
      timestamp: isSet(object.timestamp)
        ? BigInt(object.timestamp.toString())
        : BigInt(0),
    };
  },
  toJSON(message: ConsensusState): JsonSafe<ConsensusState> {
    const obj: any = {};
    message.publicKey !== undefined &&
      (obj.publicKey = message.publicKey
        ? Any.toJSON(message.publicKey)
        : undefined);
    message.diversifier !== undefined &&
      (obj.diversifier = message.diversifier);
    message.timestamp !== undefined &&
      (obj.timestamp = (message.timestamp || BigInt(0)).toString());
    return obj;
  },
  fromPartial(object: Partial<ConsensusState>): ConsensusState {
    const message = createBaseConsensusState();
    message.publicKey =
      object.publicKey !== undefined && object.publicKey !== null
        ? Any.fromPartial(object.publicKey)
        : undefined;
    message.diversifier = object.diversifier ?? '';
    message.timestamp =
      object.timestamp !== undefined && object.timestamp !== null
        ? BigInt(object.timestamp.toString())
        : BigInt(0);
    return message;
  },
  fromProtoMsg(message: ConsensusStateProtoMsg): ConsensusState {
    return ConsensusState.decode(message.value);
  },
  toProto(message: ConsensusState): Uint8Array {
    return ConsensusState.encode(message).finish();
  },
  toProtoMsg(message: ConsensusState): ConsensusStateProtoMsg {
    return {
      typeUrl: '/ibc.lightclients.solomachine.v2.ConsensusState',
      value: ConsensusState.encode(message).finish(),
    };
  },
};
function createBaseHeader(): Header {
  return {
    sequence: BigInt(0),
    timestamp: BigInt(0),
    signature: new Uint8Array(),
    newPublicKey: undefined,
    newDiversifier: '',
  };
}
export const Header = {
  typeUrl: '/ibc.lightclients.solomachine.v2.Header',
  encode(
    message: Header,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.sequence !== BigInt(0)) {
      writer.uint32(8).uint64(message.sequence);
    }
    if (message.timestamp !== BigInt(0)) {
      writer.uint32(16).uint64(message.timestamp);
    }
    if (message.signature.length !== 0) {
      writer.uint32(26).bytes(message.signature);
    }
    if (message.newPublicKey !== undefined) {
      Any.encode(message.newPublicKey, writer.uint32(34).fork()).ldelim();
    }
    if (message.newDiversifier !== '') {
      writer.uint32(42).string(message.newDiversifier);
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
          message.sequence = reader.uint64();
          break;
        case 2:
          message.timestamp = reader.uint64();
          break;
        case 3:
          message.signature = reader.bytes();
          break;
        case 4:
          message.newPublicKey = Any.decode(reader, reader.uint32());
          break;
        case 5:
          message.newDiversifier = reader.string();
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
      sequence: isSet(object.sequence)
        ? BigInt(object.sequence.toString())
        : BigInt(0),
      timestamp: isSet(object.timestamp)
        ? BigInt(object.timestamp.toString())
        : BigInt(0),
      signature: isSet(object.signature)
        ? bytesFromBase64(object.signature)
        : new Uint8Array(),
      newPublicKey: isSet(object.newPublicKey)
        ? Any.fromJSON(object.newPublicKey)
        : undefined,
      newDiversifier: isSet(object.newDiversifier)
        ? String(object.newDiversifier)
        : '',
    };
  },
  toJSON(message: Header): JsonSafe<Header> {
    const obj: any = {};
    message.sequence !== undefined &&
      (obj.sequence = (message.sequence || BigInt(0)).toString());
    message.timestamp !== undefined &&
      (obj.timestamp = (message.timestamp || BigInt(0)).toString());
    message.signature !== undefined &&
      (obj.signature = base64FromBytes(
        message.signature !== undefined ? message.signature : new Uint8Array(),
      ));
    message.newPublicKey !== undefined &&
      (obj.newPublicKey = message.newPublicKey
        ? Any.toJSON(message.newPublicKey)
        : undefined);
    message.newDiversifier !== undefined &&
      (obj.newDiversifier = message.newDiversifier);
    return obj;
  },
  fromPartial(object: Partial<Header>): Header {
    const message = createBaseHeader();
    message.sequence =
      object.sequence !== undefined && object.sequence !== null
        ? BigInt(object.sequence.toString())
        : BigInt(0);
    message.timestamp =
      object.timestamp !== undefined && object.timestamp !== null
        ? BigInt(object.timestamp.toString())
        : BigInt(0);
    message.signature = object.signature ?? new Uint8Array();
    message.newPublicKey =
      object.newPublicKey !== undefined && object.newPublicKey !== null
        ? Any.fromPartial(object.newPublicKey)
        : undefined;
    message.newDiversifier = object.newDiversifier ?? '';
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
      typeUrl: '/ibc.lightclients.solomachine.v2.Header',
      value: Header.encode(message).finish(),
    };
  },
};
function createBaseMisbehaviour(): Misbehaviour {
  return {
    clientId: '',
    sequence: BigInt(0),
    signatureOne: undefined,
    signatureTwo: undefined,
  };
}
export const Misbehaviour = {
  typeUrl: '/ibc.lightclients.solomachine.v2.Misbehaviour',
  encode(
    message: Misbehaviour,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.clientId !== '') {
      writer.uint32(10).string(message.clientId);
    }
    if (message.sequence !== BigInt(0)) {
      writer.uint32(16).uint64(message.sequence);
    }
    if (message.signatureOne !== undefined) {
      SignatureAndData.encode(
        message.signatureOne,
        writer.uint32(26).fork(),
      ).ldelim();
    }
    if (message.signatureTwo !== undefined) {
      SignatureAndData.encode(
        message.signatureTwo,
        writer.uint32(34).fork(),
      ).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): Misbehaviour {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMisbehaviour();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.clientId = reader.string();
          break;
        case 2:
          message.sequence = reader.uint64();
          break;
        case 3:
          message.signatureOne = SignatureAndData.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 4:
          message.signatureTwo = SignatureAndData.decode(
            reader,
            reader.uint32(),
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): Misbehaviour {
    return {
      clientId: isSet(object.clientId) ? String(object.clientId) : '',
      sequence: isSet(object.sequence)
        ? BigInt(object.sequence.toString())
        : BigInt(0),
      signatureOne: isSet(object.signatureOne)
        ? SignatureAndData.fromJSON(object.signatureOne)
        : undefined,
      signatureTwo: isSet(object.signatureTwo)
        ? SignatureAndData.fromJSON(object.signatureTwo)
        : undefined,
    };
  },
  toJSON(message: Misbehaviour): JsonSafe<Misbehaviour> {
    const obj: any = {};
    message.clientId !== undefined && (obj.clientId = message.clientId);
    message.sequence !== undefined &&
      (obj.sequence = (message.sequence || BigInt(0)).toString());
    message.signatureOne !== undefined &&
      (obj.signatureOne = message.signatureOne
        ? SignatureAndData.toJSON(message.signatureOne)
        : undefined);
    message.signatureTwo !== undefined &&
      (obj.signatureTwo = message.signatureTwo
        ? SignatureAndData.toJSON(message.signatureTwo)
        : undefined);
    return obj;
  },
  fromPartial(object: Partial<Misbehaviour>): Misbehaviour {
    const message = createBaseMisbehaviour();
    message.clientId = object.clientId ?? '';
    message.sequence =
      object.sequence !== undefined && object.sequence !== null
        ? BigInt(object.sequence.toString())
        : BigInt(0);
    message.signatureOne =
      object.signatureOne !== undefined && object.signatureOne !== null
        ? SignatureAndData.fromPartial(object.signatureOne)
        : undefined;
    message.signatureTwo =
      object.signatureTwo !== undefined && object.signatureTwo !== null
        ? SignatureAndData.fromPartial(object.signatureTwo)
        : undefined;
    return message;
  },
  fromProtoMsg(message: MisbehaviourProtoMsg): Misbehaviour {
    return Misbehaviour.decode(message.value);
  },
  toProto(message: Misbehaviour): Uint8Array {
    return Misbehaviour.encode(message).finish();
  },
  toProtoMsg(message: Misbehaviour): MisbehaviourProtoMsg {
    return {
      typeUrl: '/ibc.lightclients.solomachine.v2.Misbehaviour',
      value: Misbehaviour.encode(message).finish(),
    };
  },
};
function createBaseSignatureAndData(): SignatureAndData {
  return {
    signature: new Uint8Array(),
    dataType: 0,
    data: new Uint8Array(),
    timestamp: BigInt(0),
  };
}
export const SignatureAndData = {
  typeUrl: '/ibc.lightclients.solomachine.v2.SignatureAndData',
  encode(
    message: SignatureAndData,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.signature.length !== 0) {
      writer.uint32(10).bytes(message.signature);
    }
    if (message.dataType !== 0) {
      writer.uint32(16).int32(message.dataType);
    }
    if (message.data.length !== 0) {
      writer.uint32(26).bytes(message.data);
    }
    if (message.timestamp !== BigInt(0)) {
      writer.uint32(32).uint64(message.timestamp);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): SignatureAndData {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSignatureAndData();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.signature = reader.bytes();
          break;
        case 2:
          message.dataType = reader.int32() as any;
          break;
        case 3:
          message.data = reader.bytes();
          break;
        case 4:
          message.timestamp = reader.uint64();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): SignatureAndData {
    return {
      signature: isSet(object.signature)
        ? bytesFromBase64(object.signature)
        : new Uint8Array(),
      dataType: isSet(object.dataType) ? dataTypeFromJSON(object.dataType) : -1,
      data: isSet(object.data)
        ? bytesFromBase64(object.data)
        : new Uint8Array(),
      timestamp: isSet(object.timestamp)
        ? BigInt(object.timestamp.toString())
        : BigInt(0),
    };
  },
  toJSON(message: SignatureAndData): JsonSafe<SignatureAndData> {
    const obj: any = {};
    message.signature !== undefined &&
      (obj.signature = base64FromBytes(
        message.signature !== undefined ? message.signature : new Uint8Array(),
      ));
    message.dataType !== undefined &&
      (obj.dataType = dataTypeToJSON(message.dataType));
    message.data !== undefined &&
      (obj.data = base64FromBytes(
        message.data !== undefined ? message.data : new Uint8Array(),
      ));
    message.timestamp !== undefined &&
      (obj.timestamp = (message.timestamp || BigInt(0)).toString());
    return obj;
  },
  fromPartial(object: Partial<SignatureAndData>): SignatureAndData {
    const message = createBaseSignatureAndData();
    message.signature = object.signature ?? new Uint8Array();
    message.dataType = object.dataType ?? 0;
    message.data = object.data ?? new Uint8Array();
    message.timestamp =
      object.timestamp !== undefined && object.timestamp !== null
        ? BigInt(object.timestamp.toString())
        : BigInt(0);
    return message;
  },
  fromProtoMsg(message: SignatureAndDataProtoMsg): SignatureAndData {
    return SignatureAndData.decode(message.value);
  },
  toProto(message: SignatureAndData): Uint8Array {
    return SignatureAndData.encode(message).finish();
  },
  toProtoMsg(message: SignatureAndData): SignatureAndDataProtoMsg {
    return {
      typeUrl: '/ibc.lightclients.solomachine.v2.SignatureAndData',
      value: SignatureAndData.encode(message).finish(),
    };
  },
};
function createBaseTimestampedSignatureData(): TimestampedSignatureData {
  return {
    signatureData: new Uint8Array(),
    timestamp: BigInt(0),
  };
}
export const TimestampedSignatureData = {
  typeUrl: '/ibc.lightclients.solomachine.v2.TimestampedSignatureData',
  encode(
    message: TimestampedSignatureData,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.signatureData.length !== 0) {
      writer.uint32(10).bytes(message.signatureData);
    }
    if (message.timestamp !== BigInt(0)) {
      writer.uint32(16).uint64(message.timestamp);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): TimestampedSignatureData {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTimestampedSignatureData();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.signatureData = reader.bytes();
          break;
        case 2:
          message.timestamp = reader.uint64();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): TimestampedSignatureData {
    return {
      signatureData: isSet(object.signatureData)
        ? bytesFromBase64(object.signatureData)
        : new Uint8Array(),
      timestamp: isSet(object.timestamp)
        ? BigInt(object.timestamp.toString())
        : BigInt(0),
    };
  },
  toJSON(
    message: TimestampedSignatureData,
  ): JsonSafe<TimestampedSignatureData> {
    const obj: any = {};
    message.signatureData !== undefined &&
      (obj.signatureData = base64FromBytes(
        message.signatureData !== undefined
          ? message.signatureData
          : new Uint8Array(),
      ));
    message.timestamp !== undefined &&
      (obj.timestamp = (message.timestamp || BigInt(0)).toString());
    return obj;
  },
  fromPartial(
    object: Partial<TimestampedSignatureData>,
  ): TimestampedSignatureData {
    const message = createBaseTimestampedSignatureData();
    message.signatureData = object.signatureData ?? new Uint8Array();
    message.timestamp =
      object.timestamp !== undefined && object.timestamp !== null
        ? BigInt(object.timestamp.toString())
        : BigInt(0);
    return message;
  },
  fromProtoMsg(
    message: TimestampedSignatureDataProtoMsg,
  ): TimestampedSignatureData {
    return TimestampedSignatureData.decode(message.value);
  },
  toProto(message: TimestampedSignatureData): Uint8Array {
    return TimestampedSignatureData.encode(message).finish();
  },
  toProtoMsg(
    message: TimestampedSignatureData,
  ): TimestampedSignatureDataProtoMsg {
    return {
      typeUrl: '/ibc.lightclients.solomachine.v2.TimestampedSignatureData',
      value: TimestampedSignatureData.encode(message).finish(),
    };
  },
};
function createBaseSignBytes(): SignBytes {
  return {
    sequence: BigInt(0),
    timestamp: BigInt(0),
    diversifier: '',
    dataType: 0,
    data: new Uint8Array(),
  };
}
export const SignBytes = {
  typeUrl: '/ibc.lightclients.solomachine.v2.SignBytes',
  encode(
    message: SignBytes,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.sequence !== BigInt(0)) {
      writer.uint32(8).uint64(message.sequence);
    }
    if (message.timestamp !== BigInt(0)) {
      writer.uint32(16).uint64(message.timestamp);
    }
    if (message.diversifier !== '') {
      writer.uint32(26).string(message.diversifier);
    }
    if (message.dataType !== 0) {
      writer.uint32(32).int32(message.dataType);
    }
    if (message.data.length !== 0) {
      writer.uint32(42).bytes(message.data);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): SignBytes {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSignBytes();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.sequence = reader.uint64();
          break;
        case 2:
          message.timestamp = reader.uint64();
          break;
        case 3:
          message.diversifier = reader.string();
          break;
        case 4:
          message.dataType = reader.int32() as any;
          break;
        case 5:
          message.data = reader.bytes();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): SignBytes {
    return {
      sequence: isSet(object.sequence)
        ? BigInt(object.sequence.toString())
        : BigInt(0),
      timestamp: isSet(object.timestamp)
        ? BigInt(object.timestamp.toString())
        : BigInt(0),
      diversifier: isSet(object.diversifier) ? String(object.diversifier) : '',
      dataType: isSet(object.dataType) ? dataTypeFromJSON(object.dataType) : -1,
      data: isSet(object.data)
        ? bytesFromBase64(object.data)
        : new Uint8Array(),
    };
  },
  toJSON(message: SignBytes): JsonSafe<SignBytes> {
    const obj: any = {};
    message.sequence !== undefined &&
      (obj.sequence = (message.sequence || BigInt(0)).toString());
    message.timestamp !== undefined &&
      (obj.timestamp = (message.timestamp || BigInt(0)).toString());
    message.diversifier !== undefined &&
      (obj.diversifier = message.diversifier);
    message.dataType !== undefined &&
      (obj.dataType = dataTypeToJSON(message.dataType));
    message.data !== undefined &&
      (obj.data = base64FromBytes(
        message.data !== undefined ? message.data : new Uint8Array(),
      ));
    return obj;
  },
  fromPartial(object: Partial<SignBytes>): SignBytes {
    const message = createBaseSignBytes();
    message.sequence =
      object.sequence !== undefined && object.sequence !== null
        ? BigInt(object.sequence.toString())
        : BigInt(0);
    message.timestamp =
      object.timestamp !== undefined && object.timestamp !== null
        ? BigInt(object.timestamp.toString())
        : BigInt(0);
    message.diversifier = object.diversifier ?? '';
    message.dataType = object.dataType ?? 0;
    message.data = object.data ?? new Uint8Array();
    return message;
  },
  fromProtoMsg(message: SignBytesProtoMsg): SignBytes {
    return SignBytes.decode(message.value);
  },
  toProto(message: SignBytes): Uint8Array {
    return SignBytes.encode(message).finish();
  },
  toProtoMsg(message: SignBytes): SignBytesProtoMsg {
    return {
      typeUrl: '/ibc.lightclients.solomachine.v2.SignBytes',
      value: SignBytes.encode(message).finish(),
    };
  },
};
function createBaseHeaderData(): HeaderData {
  return {
    newPubKey: undefined,
    newDiversifier: '',
  };
}
export const HeaderData = {
  typeUrl: '/ibc.lightclients.solomachine.v2.HeaderData',
  encode(
    message: HeaderData,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.newPubKey !== undefined) {
      Any.encode(message.newPubKey, writer.uint32(10).fork()).ldelim();
    }
    if (message.newDiversifier !== '') {
      writer.uint32(18).string(message.newDiversifier);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): HeaderData {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseHeaderData();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.newPubKey = Any.decode(reader, reader.uint32());
          break;
        case 2:
          message.newDiversifier = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): HeaderData {
    return {
      newPubKey: isSet(object.newPubKey)
        ? Any.fromJSON(object.newPubKey)
        : undefined,
      newDiversifier: isSet(object.newDiversifier)
        ? String(object.newDiversifier)
        : '',
    };
  },
  toJSON(message: HeaderData): JsonSafe<HeaderData> {
    const obj: any = {};
    message.newPubKey !== undefined &&
      (obj.newPubKey = message.newPubKey
        ? Any.toJSON(message.newPubKey)
        : undefined);
    message.newDiversifier !== undefined &&
      (obj.newDiversifier = message.newDiversifier);
    return obj;
  },
  fromPartial(object: Partial<HeaderData>): HeaderData {
    const message = createBaseHeaderData();
    message.newPubKey =
      object.newPubKey !== undefined && object.newPubKey !== null
        ? Any.fromPartial(object.newPubKey)
        : undefined;
    message.newDiversifier = object.newDiversifier ?? '';
    return message;
  },
  fromProtoMsg(message: HeaderDataProtoMsg): HeaderData {
    return HeaderData.decode(message.value);
  },
  toProto(message: HeaderData): Uint8Array {
    return HeaderData.encode(message).finish();
  },
  toProtoMsg(message: HeaderData): HeaderDataProtoMsg {
    return {
      typeUrl: '/ibc.lightclients.solomachine.v2.HeaderData',
      value: HeaderData.encode(message).finish(),
    };
  },
};
function createBaseClientStateData(): ClientStateData {
  return {
    path: new Uint8Array(),
    clientState: undefined,
  };
}
export const ClientStateData = {
  typeUrl: '/ibc.lightclients.solomachine.v2.ClientStateData',
  encode(
    message: ClientStateData,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.path.length !== 0) {
      writer.uint32(10).bytes(message.path);
    }
    if (message.clientState !== undefined) {
      Any.encode(message.clientState, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): ClientStateData {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseClientStateData();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.path = reader.bytes();
          break;
        case 2:
          message.clientState = Any.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): ClientStateData {
    return {
      path: isSet(object.path)
        ? bytesFromBase64(object.path)
        : new Uint8Array(),
      clientState: isSet(object.clientState)
        ? Any.fromJSON(object.clientState)
        : undefined,
    };
  },
  toJSON(message: ClientStateData): JsonSafe<ClientStateData> {
    const obj: any = {};
    message.path !== undefined &&
      (obj.path = base64FromBytes(
        message.path !== undefined ? message.path : new Uint8Array(),
      ));
    message.clientState !== undefined &&
      (obj.clientState = message.clientState
        ? Any.toJSON(message.clientState)
        : undefined);
    return obj;
  },
  fromPartial(object: Partial<ClientStateData>): ClientStateData {
    const message = createBaseClientStateData();
    message.path = object.path ?? new Uint8Array();
    message.clientState =
      object.clientState !== undefined && object.clientState !== null
        ? Any.fromPartial(object.clientState)
        : undefined;
    return message;
  },
  fromProtoMsg(message: ClientStateDataProtoMsg): ClientStateData {
    return ClientStateData.decode(message.value);
  },
  toProto(message: ClientStateData): Uint8Array {
    return ClientStateData.encode(message).finish();
  },
  toProtoMsg(message: ClientStateData): ClientStateDataProtoMsg {
    return {
      typeUrl: '/ibc.lightclients.solomachine.v2.ClientStateData',
      value: ClientStateData.encode(message).finish(),
    };
  },
};
function createBaseConsensusStateData(): ConsensusStateData {
  return {
    path: new Uint8Array(),
    consensusState: undefined,
  };
}
export const ConsensusStateData = {
  typeUrl: '/ibc.lightclients.solomachine.v2.ConsensusStateData',
  encode(
    message: ConsensusStateData,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.path.length !== 0) {
      writer.uint32(10).bytes(message.path);
    }
    if (message.consensusState !== undefined) {
      Any.encode(message.consensusState, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): ConsensusStateData {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseConsensusStateData();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.path = reader.bytes();
          break;
        case 2:
          message.consensusState = Any.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): ConsensusStateData {
    return {
      path: isSet(object.path)
        ? bytesFromBase64(object.path)
        : new Uint8Array(),
      consensusState: isSet(object.consensusState)
        ? Any.fromJSON(object.consensusState)
        : undefined,
    };
  },
  toJSON(message: ConsensusStateData): JsonSafe<ConsensusStateData> {
    const obj: any = {};
    message.path !== undefined &&
      (obj.path = base64FromBytes(
        message.path !== undefined ? message.path : new Uint8Array(),
      ));
    message.consensusState !== undefined &&
      (obj.consensusState = message.consensusState
        ? Any.toJSON(message.consensusState)
        : undefined);
    return obj;
  },
  fromPartial(object: Partial<ConsensusStateData>): ConsensusStateData {
    const message = createBaseConsensusStateData();
    message.path = object.path ?? new Uint8Array();
    message.consensusState =
      object.consensusState !== undefined && object.consensusState !== null
        ? Any.fromPartial(object.consensusState)
        : undefined;
    return message;
  },
  fromProtoMsg(message: ConsensusStateDataProtoMsg): ConsensusStateData {
    return ConsensusStateData.decode(message.value);
  },
  toProto(message: ConsensusStateData): Uint8Array {
    return ConsensusStateData.encode(message).finish();
  },
  toProtoMsg(message: ConsensusStateData): ConsensusStateDataProtoMsg {
    return {
      typeUrl: '/ibc.lightclients.solomachine.v2.ConsensusStateData',
      value: ConsensusStateData.encode(message).finish(),
    };
  },
};
function createBaseConnectionStateData(): ConnectionStateData {
  return {
    path: new Uint8Array(),
    connection: undefined,
  };
}
export const ConnectionStateData = {
  typeUrl: '/ibc.lightclients.solomachine.v2.ConnectionStateData',
  encode(
    message: ConnectionStateData,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.path.length !== 0) {
      writer.uint32(10).bytes(message.path);
    }
    if (message.connection !== undefined) {
      ConnectionEnd.encode(
        message.connection,
        writer.uint32(18).fork(),
      ).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): ConnectionStateData {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseConnectionStateData();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.path = reader.bytes();
          break;
        case 2:
          message.connection = ConnectionEnd.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): ConnectionStateData {
    return {
      path: isSet(object.path)
        ? bytesFromBase64(object.path)
        : new Uint8Array(),
      connection: isSet(object.connection)
        ? ConnectionEnd.fromJSON(object.connection)
        : undefined,
    };
  },
  toJSON(message: ConnectionStateData): JsonSafe<ConnectionStateData> {
    const obj: any = {};
    message.path !== undefined &&
      (obj.path = base64FromBytes(
        message.path !== undefined ? message.path : new Uint8Array(),
      ));
    message.connection !== undefined &&
      (obj.connection = message.connection
        ? ConnectionEnd.toJSON(message.connection)
        : undefined);
    return obj;
  },
  fromPartial(object: Partial<ConnectionStateData>): ConnectionStateData {
    const message = createBaseConnectionStateData();
    message.path = object.path ?? new Uint8Array();
    message.connection =
      object.connection !== undefined && object.connection !== null
        ? ConnectionEnd.fromPartial(object.connection)
        : undefined;
    return message;
  },
  fromProtoMsg(message: ConnectionStateDataProtoMsg): ConnectionStateData {
    return ConnectionStateData.decode(message.value);
  },
  toProto(message: ConnectionStateData): Uint8Array {
    return ConnectionStateData.encode(message).finish();
  },
  toProtoMsg(message: ConnectionStateData): ConnectionStateDataProtoMsg {
    return {
      typeUrl: '/ibc.lightclients.solomachine.v2.ConnectionStateData',
      value: ConnectionStateData.encode(message).finish(),
    };
  },
};
function createBaseChannelStateData(): ChannelStateData {
  return {
    path: new Uint8Array(),
    channel: undefined,
  };
}
export const ChannelStateData = {
  typeUrl: '/ibc.lightclients.solomachine.v2.ChannelStateData',
  encode(
    message: ChannelStateData,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.path.length !== 0) {
      writer.uint32(10).bytes(message.path);
    }
    if (message.channel !== undefined) {
      Channel.encode(message.channel, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): ChannelStateData {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseChannelStateData();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.path = reader.bytes();
          break;
        case 2:
          message.channel = Channel.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): ChannelStateData {
    return {
      path: isSet(object.path)
        ? bytesFromBase64(object.path)
        : new Uint8Array(),
      channel: isSet(object.channel)
        ? Channel.fromJSON(object.channel)
        : undefined,
    };
  },
  toJSON(message: ChannelStateData): JsonSafe<ChannelStateData> {
    const obj: any = {};
    message.path !== undefined &&
      (obj.path = base64FromBytes(
        message.path !== undefined ? message.path : new Uint8Array(),
      ));
    message.channel !== undefined &&
      (obj.channel = message.channel
        ? Channel.toJSON(message.channel)
        : undefined);
    return obj;
  },
  fromPartial(object: Partial<ChannelStateData>): ChannelStateData {
    const message = createBaseChannelStateData();
    message.path = object.path ?? new Uint8Array();
    message.channel =
      object.channel !== undefined && object.channel !== null
        ? Channel.fromPartial(object.channel)
        : undefined;
    return message;
  },
  fromProtoMsg(message: ChannelStateDataProtoMsg): ChannelStateData {
    return ChannelStateData.decode(message.value);
  },
  toProto(message: ChannelStateData): Uint8Array {
    return ChannelStateData.encode(message).finish();
  },
  toProtoMsg(message: ChannelStateData): ChannelStateDataProtoMsg {
    return {
      typeUrl: '/ibc.lightclients.solomachine.v2.ChannelStateData',
      value: ChannelStateData.encode(message).finish(),
    };
  },
};
function createBasePacketCommitmentData(): PacketCommitmentData {
  return {
    path: new Uint8Array(),
    commitment: new Uint8Array(),
  };
}
export const PacketCommitmentData = {
  typeUrl: '/ibc.lightclients.solomachine.v2.PacketCommitmentData',
  encode(
    message: PacketCommitmentData,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.path.length !== 0) {
      writer.uint32(10).bytes(message.path);
    }
    if (message.commitment.length !== 0) {
      writer.uint32(18).bytes(message.commitment);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): PacketCommitmentData {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePacketCommitmentData();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.path = reader.bytes();
          break;
        case 2:
          message.commitment = reader.bytes();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): PacketCommitmentData {
    return {
      path: isSet(object.path)
        ? bytesFromBase64(object.path)
        : new Uint8Array(),
      commitment: isSet(object.commitment)
        ? bytesFromBase64(object.commitment)
        : new Uint8Array(),
    };
  },
  toJSON(message: PacketCommitmentData): JsonSafe<PacketCommitmentData> {
    const obj: any = {};
    message.path !== undefined &&
      (obj.path = base64FromBytes(
        message.path !== undefined ? message.path : new Uint8Array(),
      ));
    message.commitment !== undefined &&
      (obj.commitment = base64FromBytes(
        message.commitment !== undefined
          ? message.commitment
          : new Uint8Array(),
      ));
    return obj;
  },
  fromPartial(object: Partial<PacketCommitmentData>): PacketCommitmentData {
    const message = createBasePacketCommitmentData();
    message.path = object.path ?? new Uint8Array();
    message.commitment = object.commitment ?? new Uint8Array();
    return message;
  },
  fromProtoMsg(message: PacketCommitmentDataProtoMsg): PacketCommitmentData {
    return PacketCommitmentData.decode(message.value);
  },
  toProto(message: PacketCommitmentData): Uint8Array {
    return PacketCommitmentData.encode(message).finish();
  },
  toProtoMsg(message: PacketCommitmentData): PacketCommitmentDataProtoMsg {
    return {
      typeUrl: '/ibc.lightclients.solomachine.v2.PacketCommitmentData',
      value: PacketCommitmentData.encode(message).finish(),
    };
  },
};
function createBasePacketAcknowledgementData(): PacketAcknowledgementData {
  return {
    path: new Uint8Array(),
    acknowledgement: new Uint8Array(),
  };
}
export const PacketAcknowledgementData = {
  typeUrl: '/ibc.lightclients.solomachine.v2.PacketAcknowledgementData',
  encode(
    message: PacketAcknowledgementData,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.path.length !== 0) {
      writer.uint32(10).bytes(message.path);
    }
    if (message.acknowledgement.length !== 0) {
      writer.uint32(18).bytes(message.acknowledgement);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): PacketAcknowledgementData {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePacketAcknowledgementData();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.path = reader.bytes();
          break;
        case 2:
          message.acknowledgement = reader.bytes();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): PacketAcknowledgementData {
    return {
      path: isSet(object.path)
        ? bytesFromBase64(object.path)
        : new Uint8Array(),
      acknowledgement: isSet(object.acknowledgement)
        ? bytesFromBase64(object.acknowledgement)
        : new Uint8Array(),
    };
  },
  toJSON(
    message: PacketAcknowledgementData,
  ): JsonSafe<PacketAcknowledgementData> {
    const obj: any = {};
    message.path !== undefined &&
      (obj.path = base64FromBytes(
        message.path !== undefined ? message.path : new Uint8Array(),
      ));
    message.acknowledgement !== undefined &&
      (obj.acknowledgement = base64FromBytes(
        message.acknowledgement !== undefined
          ? message.acknowledgement
          : new Uint8Array(),
      ));
    return obj;
  },
  fromPartial(
    object: Partial<PacketAcknowledgementData>,
  ): PacketAcknowledgementData {
    const message = createBasePacketAcknowledgementData();
    message.path = object.path ?? new Uint8Array();
    message.acknowledgement = object.acknowledgement ?? new Uint8Array();
    return message;
  },
  fromProtoMsg(
    message: PacketAcknowledgementDataProtoMsg,
  ): PacketAcknowledgementData {
    return PacketAcknowledgementData.decode(message.value);
  },
  toProto(message: PacketAcknowledgementData): Uint8Array {
    return PacketAcknowledgementData.encode(message).finish();
  },
  toProtoMsg(
    message: PacketAcknowledgementData,
  ): PacketAcknowledgementDataProtoMsg {
    return {
      typeUrl: '/ibc.lightclients.solomachine.v2.PacketAcknowledgementData',
      value: PacketAcknowledgementData.encode(message).finish(),
    };
  },
};
function createBasePacketReceiptAbsenceData(): PacketReceiptAbsenceData {
  return {
    path: new Uint8Array(),
  };
}
export const PacketReceiptAbsenceData = {
  typeUrl: '/ibc.lightclients.solomachine.v2.PacketReceiptAbsenceData',
  encode(
    message: PacketReceiptAbsenceData,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.path.length !== 0) {
      writer.uint32(10).bytes(message.path);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): PacketReceiptAbsenceData {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePacketReceiptAbsenceData();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.path = reader.bytes();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): PacketReceiptAbsenceData {
    return {
      path: isSet(object.path)
        ? bytesFromBase64(object.path)
        : new Uint8Array(),
    };
  },
  toJSON(
    message: PacketReceiptAbsenceData,
  ): JsonSafe<PacketReceiptAbsenceData> {
    const obj: any = {};
    message.path !== undefined &&
      (obj.path = base64FromBytes(
        message.path !== undefined ? message.path : new Uint8Array(),
      ));
    return obj;
  },
  fromPartial(
    object: Partial<PacketReceiptAbsenceData>,
  ): PacketReceiptAbsenceData {
    const message = createBasePacketReceiptAbsenceData();
    message.path = object.path ?? new Uint8Array();
    return message;
  },
  fromProtoMsg(
    message: PacketReceiptAbsenceDataProtoMsg,
  ): PacketReceiptAbsenceData {
    return PacketReceiptAbsenceData.decode(message.value);
  },
  toProto(message: PacketReceiptAbsenceData): Uint8Array {
    return PacketReceiptAbsenceData.encode(message).finish();
  },
  toProtoMsg(
    message: PacketReceiptAbsenceData,
  ): PacketReceiptAbsenceDataProtoMsg {
    return {
      typeUrl: '/ibc.lightclients.solomachine.v2.PacketReceiptAbsenceData',
      value: PacketReceiptAbsenceData.encode(message).finish(),
    };
  },
};
function createBaseNextSequenceRecvData(): NextSequenceRecvData {
  return {
    path: new Uint8Array(),
    nextSeqRecv: BigInt(0),
  };
}
export const NextSequenceRecvData = {
  typeUrl: '/ibc.lightclients.solomachine.v2.NextSequenceRecvData',
  encode(
    message: NextSequenceRecvData,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.path.length !== 0) {
      writer.uint32(10).bytes(message.path);
    }
    if (message.nextSeqRecv !== BigInt(0)) {
      writer.uint32(16).uint64(message.nextSeqRecv);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): NextSequenceRecvData {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseNextSequenceRecvData();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.path = reader.bytes();
          break;
        case 2:
          message.nextSeqRecv = reader.uint64();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): NextSequenceRecvData {
    return {
      path: isSet(object.path)
        ? bytesFromBase64(object.path)
        : new Uint8Array(),
      nextSeqRecv: isSet(object.nextSeqRecv)
        ? BigInt(object.nextSeqRecv.toString())
        : BigInt(0),
    };
  },
  toJSON(message: NextSequenceRecvData): JsonSafe<NextSequenceRecvData> {
    const obj: any = {};
    message.path !== undefined &&
      (obj.path = base64FromBytes(
        message.path !== undefined ? message.path : new Uint8Array(),
      ));
    message.nextSeqRecv !== undefined &&
      (obj.nextSeqRecv = (message.nextSeqRecv || BigInt(0)).toString());
    return obj;
  },
  fromPartial(object: Partial<NextSequenceRecvData>): NextSequenceRecvData {
    const message = createBaseNextSequenceRecvData();
    message.path = object.path ?? new Uint8Array();
    message.nextSeqRecv =
      object.nextSeqRecv !== undefined && object.nextSeqRecv !== null
        ? BigInt(object.nextSeqRecv.toString())
        : BigInt(0);
    return message;
  },
  fromProtoMsg(message: NextSequenceRecvDataProtoMsg): NextSequenceRecvData {
    return NextSequenceRecvData.decode(message.value);
  },
  toProto(message: NextSequenceRecvData): Uint8Array {
    return NextSequenceRecvData.encode(message).finish();
  },
  toProtoMsg(message: NextSequenceRecvData): NextSequenceRecvDataProtoMsg {
    return {
      typeUrl: '/ibc.lightclients.solomachine.v2.NextSequenceRecvData',
      value: NextSequenceRecvData.encode(message).finish(),
    };
  },
};
