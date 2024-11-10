//@ts-nocheck
import {
  Duration,
  type DurationSDKType,
} from '../../../../google/protobuf/duration.js';
import { Height, type HeightSDKType } from '../../../core/client/v1/client.js';
import { ProofSpec, type ProofSpecSDKType } from '../../../../proofs.js';
import {
  Timestamp,
  type TimestampSDKType,
} from '../../../../google/protobuf/timestamp.js';
import {
  MerkleRoot,
  type MerkleRootSDKType,
} from '../../../core/commitment/v1/commitment.js';
import {
  SignedHeader,
  type SignedHeaderSDKType,
} from '../../../../tendermint/types/types.js';
import {
  ValidatorSet,
  type ValidatorSetSDKType,
} from '../../../../tendermint/types/validator.js';
import { BinaryReader, BinaryWriter } from '../../../../binary.js';
import {
  isSet,
  fromJsonTimestamp,
  bytesFromBase64,
  fromTimestamp,
  base64FromBytes,
} from '../../../../helpers.js';
import { type JsonSafe } from '../../../../json-safe.js';
/**
 * ClientState from Tendermint tracks the current validator set, latest height,
 * and a possible frozen height.
 */
export interface ClientState {
  chainId: string;
  trustLevel: Fraction;
  /**
   * duration of the period since the LastestTimestamp during which the
   * submitted headers are valid for upgrade
   */
  trustingPeriod: Duration;
  /** duration of the staking unbonding period */
  unbondingPeriod: Duration;
  /** defines how much new (untrusted) header's Time can drift into the future. */
  maxClockDrift: Duration;
  /** Block height when the client was frozen due to a misbehaviour */
  frozenHeight: Height;
  /** Latest height the client was updated to */
  latestHeight: Height;
  /** Proof specifications used in verifying counterparty state */
  proofSpecs: ProofSpec[];
  /**
   * Path at which next upgraded client will be committed.
   * Each element corresponds to the key for a single CommitmentProof in the
   * chained proof. NOTE: ClientState must stored under
   * `{upgradePath}/{upgradeHeight}/clientState` ConsensusState must be stored
   * under `{upgradepath}/{upgradeHeight}/consensusState` For SDK chains using
   * the default upgrade module, upgrade_path should be []string{"upgrade",
   * "upgradedIBCState"}`
   */
  upgradePath: string[];
  /** allow_update_after_expiry is deprecated */
  /** @deprecated */
  allowUpdateAfterExpiry: boolean;
  /** allow_update_after_misbehaviour is deprecated */
  /** @deprecated */
  allowUpdateAfterMisbehaviour: boolean;
}
export interface ClientStateProtoMsg {
  typeUrl: '/ibc.lightclients.tendermint.v1.ClientState';
  value: Uint8Array;
}
/**
 * ClientState from Tendermint tracks the current validator set, latest height,
 * and a possible frozen height.
 */
export interface ClientStateSDKType {
  chain_id: string;
  trust_level: FractionSDKType;
  trusting_period: DurationSDKType;
  unbonding_period: DurationSDKType;
  max_clock_drift: DurationSDKType;
  frozen_height: HeightSDKType;
  latest_height: HeightSDKType;
  proof_specs: ProofSpecSDKType[];
  upgrade_path: string[];
  /** @deprecated */
  allow_update_after_expiry: boolean;
  /** @deprecated */
  allow_update_after_misbehaviour: boolean;
}
/** ConsensusState defines the consensus state from Tendermint. */
export interface ConsensusState {
  /**
   * timestamp that corresponds to the block height in which the ConsensusState
   * was stored.
   */
  timestamp: Timestamp;
  /** commitment root (i.e app hash) */
  root: MerkleRoot;
  nextValidatorsHash: Uint8Array;
}
export interface ConsensusStateProtoMsg {
  typeUrl: '/ibc.lightclients.tendermint.v1.ConsensusState';
  value: Uint8Array;
}
/** ConsensusState defines the consensus state from Tendermint. */
export interface ConsensusStateSDKType {
  timestamp: TimestampSDKType;
  root: MerkleRootSDKType;
  next_validators_hash: Uint8Array;
}
/**
 * Misbehaviour is a wrapper over two conflicting Headers
 * that implements Misbehaviour interface expected by ICS-02
 */
export interface Misbehaviour {
  clientId: string;
  header1?: Header;
  header2?: Header;
}
export interface MisbehaviourProtoMsg {
  typeUrl: '/ibc.lightclients.tendermint.v1.Misbehaviour';
  value: Uint8Array;
}
/**
 * Misbehaviour is a wrapper over two conflicting Headers
 * that implements Misbehaviour interface expected by ICS-02
 */
export interface MisbehaviourSDKType {
  client_id: string;
  header_1?: HeaderSDKType;
  header_2?: HeaderSDKType;
}
/**
 * Header defines the Tendermint client consensus Header.
 * It encapsulates all the information necessary to update from a trusted
 * Tendermint ConsensusState. The inclusion of TrustedHeight and
 * TrustedValidators allows this update to process correctly, so long as the
 * ConsensusState for the TrustedHeight exists, this removes race conditions
 * among relayers The SignedHeader and ValidatorSet are the new untrusted update
 * fields for the client. The TrustedHeight is the height of a stored
 * ConsensusState on the client that will be used to verify the new untrusted
 * header. The Trusted ConsensusState must be within the unbonding period of
 * current time in order to correctly verify, and the TrustedValidators must
 * hash to TrustedConsensusState.NextValidatorsHash since that is the last
 * trusted validator set at the TrustedHeight.
 */
export interface Header {
  signedHeader?: SignedHeader;
  validatorSet?: ValidatorSet;
  trustedHeight: Height;
  trustedValidators?: ValidatorSet;
}
export interface HeaderProtoMsg {
  typeUrl: '/ibc.lightclients.tendermint.v1.Header';
  value: Uint8Array;
}
/**
 * Header defines the Tendermint client consensus Header.
 * It encapsulates all the information necessary to update from a trusted
 * Tendermint ConsensusState. The inclusion of TrustedHeight and
 * TrustedValidators allows this update to process correctly, so long as the
 * ConsensusState for the TrustedHeight exists, this removes race conditions
 * among relayers The SignedHeader and ValidatorSet are the new untrusted update
 * fields for the client. The TrustedHeight is the height of a stored
 * ConsensusState on the client that will be used to verify the new untrusted
 * header. The Trusted ConsensusState must be within the unbonding period of
 * current time in order to correctly verify, and the TrustedValidators must
 * hash to TrustedConsensusState.NextValidatorsHash since that is the last
 * trusted validator set at the TrustedHeight.
 */
export interface HeaderSDKType {
  signed_header?: SignedHeaderSDKType;
  validator_set?: ValidatorSetSDKType;
  trusted_height: HeightSDKType;
  trusted_validators?: ValidatorSetSDKType;
}
/**
 * Fraction defines the protobuf message type for tmmath.Fraction that only
 * supports positive values.
 */
export interface Fraction {
  numerator: bigint;
  denominator: bigint;
}
export interface FractionProtoMsg {
  typeUrl: '/ibc.lightclients.tendermint.v1.Fraction';
  value: Uint8Array;
}
/**
 * Fraction defines the protobuf message type for tmmath.Fraction that only
 * supports positive values.
 */
export interface FractionSDKType {
  numerator: bigint;
  denominator: bigint;
}
function createBaseClientState(): ClientState {
  return {
    chainId: '',
    trustLevel: Fraction.fromPartial({}),
    trustingPeriod: Duration.fromPartial({}),
    unbondingPeriod: Duration.fromPartial({}),
    maxClockDrift: Duration.fromPartial({}),
    frozenHeight: Height.fromPartial({}),
    latestHeight: Height.fromPartial({}),
    proofSpecs: [],
    upgradePath: [],
    allowUpdateAfterExpiry: false,
    allowUpdateAfterMisbehaviour: false,
  };
}
export const ClientState = {
  typeUrl: '/ibc.lightclients.tendermint.v1.ClientState',
  encode(
    message: ClientState,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.chainId !== '') {
      writer.uint32(10).string(message.chainId);
    }
    if (message.trustLevel !== undefined) {
      Fraction.encode(message.trustLevel, writer.uint32(18).fork()).ldelim();
    }
    if (message.trustingPeriod !== undefined) {
      Duration.encode(
        message.trustingPeriod,
        writer.uint32(26).fork(),
      ).ldelim();
    }
    if (message.unbondingPeriod !== undefined) {
      Duration.encode(
        message.unbondingPeriod,
        writer.uint32(34).fork(),
      ).ldelim();
    }
    if (message.maxClockDrift !== undefined) {
      Duration.encode(message.maxClockDrift, writer.uint32(42).fork()).ldelim();
    }
    if (message.frozenHeight !== undefined) {
      Height.encode(message.frozenHeight, writer.uint32(50).fork()).ldelim();
    }
    if (message.latestHeight !== undefined) {
      Height.encode(message.latestHeight, writer.uint32(58).fork()).ldelim();
    }
    for (const v of message.proofSpecs) {
      ProofSpec.encode(v!, writer.uint32(66).fork()).ldelim();
    }
    for (const v of message.upgradePath) {
      writer.uint32(74).string(v!);
    }
    if (message.allowUpdateAfterExpiry === true) {
      writer.uint32(80).bool(message.allowUpdateAfterExpiry);
    }
    if (message.allowUpdateAfterMisbehaviour === true) {
      writer.uint32(88).bool(message.allowUpdateAfterMisbehaviour);
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
          message.chainId = reader.string();
          break;
        case 2:
          message.trustLevel = Fraction.decode(reader, reader.uint32());
          break;
        case 3:
          message.trustingPeriod = Duration.decode(reader, reader.uint32());
          break;
        case 4:
          message.unbondingPeriod = Duration.decode(reader, reader.uint32());
          break;
        case 5:
          message.maxClockDrift = Duration.decode(reader, reader.uint32());
          break;
        case 6:
          message.frozenHeight = Height.decode(reader, reader.uint32());
          break;
        case 7:
          message.latestHeight = Height.decode(reader, reader.uint32());
          break;
        case 8:
          message.proofSpecs.push(ProofSpec.decode(reader, reader.uint32()));
          break;
        case 9:
          message.upgradePath.push(reader.string());
          break;
        case 10:
          message.allowUpdateAfterExpiry = reader.bool();
          break;
        case 11:
          message.allowUpdateAfterMisbehaviour = reader.bool();
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
      chainId: isSet(object.chainId) ? String(object.chainId) : '',
      trustLevel: isSet(object.trustLevel)
        ? Fraction.fromJSON(object.trustLevel)
        : undefined,
      trustingPeriod: isSet(object.trustingPeriod)
        ? Duration.fromJSON(object.trustingPeriod)
        : undefined,
      unbondingPeriod: isSet(object.unbondingPeriod)
        ? Duration.fromJSON(object.unbondingPeriod)
        : undefined,
      maxClockDrift: isSet(object.maxClockDrift)
        ? Duration.fromJSON(object.maxClockDrift)
        : undefined,
      frozenHeight: isSet(object.frozenHeight)
        ? Height.fromJSON(object.frozenHeight)
        : undefined,
      latestHeight: isSet(object.latestHeight)
        ? Height.fromJSON(object.latestHeight)
        : undefined,
      proofSpecs: Array.isArray(object?.proofSpecs)
        ? object.proofSpecs.map((e: any) => ProofSpec.fromJSON(e))
        : [],
      upgradePath: Array.isArray(object?.upgradePath)
        ? object.upgradePath.map((e: any) => String(e))
        : [],
      allowUpdateAfterExpiry: isSet(object.allowUpdateAfterExpiry)
        ? Boolean(object.allowUpdateAfterExpiry)
        : false,
      allowUpdateAfterMisbehaviour: isSet(object.allowUpdateAfterMisbehaviour)
        ? Boolean(object.allowUpdateAfterMisbehaviour)
        : false,
    };
  },
  toJSON(message: ClientState): JsonSafe<ClientState> {
    const obj: any = {};
    message.chainId !== undefined && (obj.chainId = message.chainId);
    message.trustLevel !== undefined &&
      (obj.trustLevel = message.trustLevel
        ? Fraction.toJSON(message.trustLevel)
        : undefined);
    message.trustingPeriod !== undefined &&
      (obj.trustingPeriod = message.trustingPeriod
        ? Duration.toJSON(message.trustingPeriod)
        : undefined);
    message.unbondingPeriod !== undefined &&
      (obj.unbondingPeriod = message.unbondingPeriod
        ? Duration.toJSON(message.unbondingPeriod)
        : undefined);
    message.maxClockDrift !== undefined &&
      (obj.maxClockDrift = message.maxClockDrift
        ? Duration.toJSON(message.maxClockDrift)
        : undefined);
    message.frozenHeight !== undefined &&
      (obj.frozenHeight = message.frozenHeight
        ? Height.toJSON(message.frozenHeight)
        : undefined);
    message.latestHeight !== undefined &&
      (obj.latestHeight = message.latestHeight
        ? Height.toJSON(message.latestHeight)
        : undefined);
    if (message.proofSpecs) {
      obj.proofSpecs = message.proofSpecs.map(e =>
        e ? ProofSpec.toJSON(e) : undefined,
      );
    } else {
      obj.proofSpecs = [];
    }
    if (message.upgradePath) {
      obj.upgradePath = message.upgradePath.map(e => e);
    } else {
      obj.upgradePath = [];
    }
    message.allowUpdateAfterExpiry !== undefined &&
      (obj.allowUpdateAfterExpiry = message.allowUpdateAfterExpiry);
    message.allowUpdateAfterMisbehaviour !== undefined &&
      (obj.allowUpdateAfterMisbehaviour = message.allowUpdateAfterMisbehaviour);
    return obj;
  },
  fromPartial(object: Partial<ClientState>): ClientState {
    const message = createBaseClientState();
    message.chainId = object.chainId ?? '';
    message.trustLevel =
      object.trustLevel !== undefined && object.trustLevel !== null
        ? Fraction.fromPartial(object.trustLevel)
        : undefined;
    message.trustingPeriod =
      object.trustingPeriod !== undefined && object.trustingPeriod !== null
        ? Duration.fromPartial(object.trustingPeriod)
        : undefined;
    message.unbondingPeriod =
      object.unbondingPeriod !== undefined && object.unbondingPeriod !== null
        ? Duration.fromPartial(object.unbondingPeriod)
        : undefined;
    message.maxClockDrift =
      object.maxClockDrift !== undefined && object.maxClockDrift !== null
        ? Duration.fromPartial(object.maxClockDrift)
        : undefined;
    message.frozenHeight =
      object.frozenHeight !== undefined && object.frozenHeight !== null
        ? Height.fromPartial(object.frozenHeight)
        : undefined;
    message.latestHeight =
      object.latestHeight !== undefined && object.latestHeight !== null
        ? Height.fromPartial(object.latestHeight)
        : undefined;
    message.proofSpecs =
      object.proofSpecs?.map(e => ProofSpec.fromPartial(e)) || [];
    message.upgradePath = object.upgradePath?.map(e => e) || [];
    message.allowUpdateAfterExpiry = object.allowUpdateAfterExpiry ?? false;
    message.allowUpdateAfterMisbehaviour =
      object.allowUpdateAfterMisbehaviour ?? false;
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
      typeUrl: '/ibc.lightclients.tendermint.v1.ClientState',
      value: ClientState.encode(message).finish(),
    };
  },
};
function createBaseConsensusState(): ConsensusState {
  return {
    timestamp: Timestamp.fromPartial({}),
    root: MerkleRoot.fromPartial({}),
    nextValidatorsHash: new Uint8Array(),
  };
}
export const ConsensusState = {
  typeUrl: '/ibc.lightclients.tendermint.v1.ConsensusState',
  encode(
    message: ConsensusState,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.timestamp !== undefined) {
      Timestamp.encode(message.timestamp, writer.uint32(10).fork()).ldelim();
    }
    if (message.root !== undefined) {
      MerkleRoot.encode(message.root, writer.uint32(18).fork()).ldelim();
    }
    if (message.nextValidatorsHash.length !== 0) {
      writer.uint32(26).bytes(message.nextValidatorsHash);
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
          message.timestamp = Timestamp.decode(reader, reader.uint32());
          break;
        case 2:
          message.root = MerkleRoot.decode(reader, reader.uint32());
          break;
        case 3:
          message.nextValidatorsHash = reader.bytes();
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
      timestamp: isSet(object.timestamp)
        ? fromJsonTimestamp(object.timestamp)
        : undefined,
      root: isSet(object.root) ? MerkleRoot.fromJSON(object.root) : undefined,
      nextValidatorsHash: isSet(object.nextValidatorsHash)
        ? bytesFromBase64(object.nextValidatorsHash)
        : new Uint8Array(),
    };
  },
  toJSON(message: ConsensusState): JsonSafe<ConsensusState> {
    const obj: any = {};
    message.timestamp !== undefined &&
      (obj.timestamp = fromTimestamp(message.timestamp).toISOString());
    message.root !== undefined &&
      (obj.root = message.root ? MerkleRoot.toJSON(message.root) : undefined);
    message.nextValidatorsHash !== undefined &&
      (obj.nextValidatorsHash = base64FromBytes(
        message.nextValidatorsHash !== undefined
          ? message.nextValidatorsHash
          : new Uint8Array(),
      ));
    return obj;
  },
  fromPartial(object: Partial<ConsensusState>): ConsensusState {
    const message = createBaseConsensusState();
    message.timestamp =
      object.timestamp !== undefined && object.timestamp !== null
        ? Timestamp.fromPartial(object.timestamp)
        : undefined;
    message.root =
      object.root !== undefined && object.root !== null
        ? MerkleRoot.fromPartial(object.root)
        : undefined;
    message.nextValidatorsHash = object.nextValidatorsHash ?? new Uint8Array();
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
      typeUrl: '/ibc.lightclients.tendermint.v1.ConsensusState',
      value: ConsensusState.encode(message).finish(),
    };
  },
};
function createBaseMisbehaviour(): Misbehaviour {
  return {
    clientId: '',
    header1: undefined,
    header2: undefined,
  };
}
export const Misbehaviour = {
  typeUrl: '/ibc.lightclients.tendermint.v1.Misbehaviour',
  encode(
    message: Misbehaviour,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.clientId !== '') {
      writer.uint32(10).string(message.clientId);
    }
    if (message.header1 !== undefined) {
      Header.encode(message.header1, writer.uint32(18).fork()).ldelim();
    }
    if (message.header2 !== undefined) {
      Header.encode(message.header2, writer.uint32(26).fork()).ldelim();
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
          message.header1 = Header.decode(reader, reader.uint32());
          break;
        case 3:
          message.header2 = Header.decode(reader, reader.uint32());
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
      header1: isSet(object.header1)
        ? Header.fromJSON(object.header1)
        : undefined,
      header2: isSet(object.header2)
        ? Header.fromJSON(object.header2)
        : undefined,
    };
  },
  toJSON(message: Misbehaviour): JsonSafe<Misbehaviour> {
    const obj: any = {};
    message.clientId !== undefined && (obj.clientId = message.clientId);
    message.header1 !== undefined &&
      (obj.header1 = message.header1
        ? Header.toJSON(message.header1)
        : undefined);
    message.header2 !== undefined &&
      (obj.header2 = message.header2
        ? Header.toJSON(message.header2)
        : undefined);
    return obj;
  },
  fromPartial(object: Partial<Misbehaviour>): Misbehaviour {
    const message = createBaseMisbehaviour();
    message.clientId = object.clientId ?? '';
    message.header1 =
      object.header1 !== undefined && object.header1 !== null
        ? Header.fromPartial(object.header1)
        : undefined;
    message.header2 =
      object.header2 !== undefined && object.header2 !== null
        ? Header.fromPartial(object.header2)
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
      typeUrl: '/ibc.lightclients.tendermint.v1.Misbehaviour',
      value: Misbehaviour.encode(message).finish(),
    };
  },
};
function createBaseHeader(): Header {
  return {
    signedHeader: undefined,
    validatorSet: undefined,
    trustedHeight: Height.fromPartial({}),
    trustedValidators: undefined,
  };
}
export const Header = {
  typeUrl: '/ibc.lightclients.tendermint.v1.Header',
  encode(
    message: Header,
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
    if (message.trustedHeight !== undefined) {
      Height.encode(message.trustedHeight, writer.uint32(26).fork()).ldelim();
    }
    if (message.trustedValidators !== undefined) {
      ValidatorSet.encode(
        message.trustedValidators,
        writer.uint32(34).fork(),
      ).ldelim();
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
          message.signedHeader = SignedHeader.decode(reader, reader.uint32());
          break;
        case 2:
          message.validatorSet = ValidatorSet.decode(reader, reader.uint32());
          break;
        case 3:
          message.trustedHeight = Height.decode(reader, reader.uint32());
          break;
        case 4:
          message.trustedValidators = ValidatorSet.decode(
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
  fromJSON(object: any): Header {
    return {
      signedHeader: isSet(object.signedHeader)
        ? SignedHeader.fromJSON(object.signedHeader)
        : undefined,
      validatorSet: isSet(object.validatorSet)
        ? ValidatorSet.fromJSON(object.validatorSet)
        : undefined,
      trustedHeight: isSet(object.trustedHeight)
        ? Height.fromJSON(object.trustedHeight)
        : undefined,
      trustedValidators: isSet(object.trustedValidators)
        ? ValidatorSet.fromJSON(object.trustedValidators)
        : undefined,
    };
  },
  toJSON(message: Header): JsonSafe<Header> {
    const obj: any = {};
    message.signedHeader !== undefined &&
      (obj.signedHeader = message.signedHeader
        ? SignedHeader.toJSON(message.signedHeader)
        : undefined);
    message.validatorSet !== undefined &&
      (obj.validatorSet = message.validatorSet
        ? ValidatorSet.toJSON(message.validatorSet)
        : undefined);
    message.trustedHeight !== undefined &&
      (obj.trustedHeight = message.trustedHeight
        ? Height.toJSON(message.trustedHeight)
        : undefined);
    message.trustedValidators !== undefined &&
      (obj.trustedValidators = message.trustedValidators
        ? ValidatorSet.toJSON(message.trustedValidators)
        : undefined);
    return obj;
  },
  fromPartial(object: Partial<Header>): Header {
    const message = createBaseHeader();
    message.signedHeader =
      object.signedHeader !== undefined && object.signedHeader !== null
        ? SignedHeader.fromPartial(object.signedHeader)
        : undefined;
    message.validatorSet =
      object.validatorSet !== undefined && object.validatorSet !== null
        ? ValidatorSet.fromPartial(object.validatorSet)
        : undefined;
    message.trustedHeight =
      object.trustedHeight !== undefined && object.trustedHeight !== null
        ? Height.fromPartial(object.trustedHeight)
        : undefined;
    message.trustedValidators =
      object.trustedValidators !== undefined &&
      object.trustedValidators !== null
        ? ValidatorSet.fromPartial(object.trustedValidators)
        : undefined;
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
      typeUrl: '/ibc.lightclients.tendermint.v1.Header',
      value: Header.encode(message).finish(),
    };
  },
};
function createBaseFraction(): Fraction {
  return {
    numerator: BigInt(0),
    denominator: BigInt(0),
  };
}
export const Fraction = {
  typeUrl: '/ibc.lightclients.tendermint.v1.Fraction',
  encode(
    message: Fraction,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.numerator !== BigInt(0)) {
      writer.uint32(8).uint64(message.numerator);
    }
    if (message.denominator !== BigInt(0)) {
      writer.uint32(16).uint64(message.denominator);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): Fraction {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseFraction();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.numerator = reader.uint64();
          break;
        case 2:
          message.denominator = reader.uint64();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): Fraction {
    return {
      numerator: isSet(object.numerator)
        ? BigInt(object.numerator.toString())
        : BigInt(0),
      denominator: isSet(object.denominator)
        ? BigInt(object.denominator.toString())
        : BigInt(0),
    };
  },
  toJSON(message: Fraction): JsonSafe<Fraction> {
    const obj: any = {};
    message.numerator !== undefined &&
      (obj.numerator = (message.numerator || BigInt(0)).toString());
    message.denominator !== undefined &&
      (obj.denominator = (message.denominator || BigInt(0)).toString());
    return obj;
  },
  fromPartial(object: Partial<Fraction>): Fraction {
    const message = createBaseFraction();
    message.numerator =
      object.numerator !== undefined && object.numerator !== null
        ? BigInt(object.numerator.toString())
        : BigInt(0);
    message.denominator =
      object.denominator !== undefined && object.denominator !== null
        ? BigInt(object.denominator.toString())
        : BigInt(0);
    return message;
  },
  fromProtoMsg(message: FractionProtoMsg): Fraction {
    return Fraction.decode(message.value);
  },
  toProto(message: Fraction): Uint8Array {
    return Fraction.encode(message).finish();
  },
  toProtoMsg(message: Fraction): FractionProtoMsg {
    return {
      typeUrl: '/ibc.lightclients.tendermint.v1.Fraction',
      value: Fraction.encode(message).finish(),
    };
  },
};
