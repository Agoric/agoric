//@ts-nocheck
import {
  MerklePrefix,
  type MerklePrefixSDKType,
} from '../../commitment/v1/commitment.js';
import { BinaryReader, BinaryWriter } from '../../../../binary.js';
import { isSet } from '../../../../helpers.js';
import { type JsonSafe } from '../../../../json-safe.js';
/**
 * State defines if a connection is in one of the following states:
 * INIT, TRYOPEN, OPEN or UNINITIALIZED.
 */
export enum State {
  /** STATE_UNINITIALIZED_UNSPECIFIED - Default State */
  STATE_UNINITIALIZED_UNSPECIFIED = 0,
  /** STATE_INIT - A connection end has just started the opening handshake. */
  STATE_INIT = 1,
  /**
   * STATE_TRYOPEN - A connection end has acknowledged the handshake step on the counterparty
   * chain.
   */
  STATE_TRYOPEN = 2,
  /** STATE_OPEN - A connection end has completed the handshake. */
  STATE_OPEN = 3,
  UNRECOGNIZED = -1,
}
export const StateSDKType = State;
export function stateFromJSON(object: any): State {
  switch (object) {
    case 0:
    case 'STATE_UNINITIALIZED_UNSPECIFIED':
      return State.STATE_UNINITIALIZED_UNSPECIFIED;
    case 1:
    case 'STATE_INIT':
      return State.STATE_INIT;
    case 2:
    case 'STATE_TRYOPEN':
      return State.STATE_TRYOPEN;
    case 3:
    case 'STATE_OPEN':
      return State.STATE_OPEN;
    case -1:
    case 'UNRECOGNIZED':
    default:
      return State.UNRECOGNIZED;
  }
}
export function stateToJSON(object: State): string {
  switch (object) {
    case State.STATE_UNINITIALIZED_UNSPECIFIED:
      return 'STATE_UNINITIALIZED_UNSPECIFIED';
    case State.STATE_INIT:
      return 'STATE_INIT';
    case State.STATE_TRYOPEN:
      return 'STATE_TRYOPEN';
    case State.STATE_OPEN:
      return 'STATE_OPEN';
    case State.UNRECOGNIZED:
    default:
      return 'UNRECOGNIZED';
  }
}
/**
 * ConnectionEnd defines a stateful object on a chain connected to another
 * separate one.
 * NOTE: there must only be 2 defined ConnectionEnds to establish
 * a connection between two chains.
 */
export interface ConnectionEnd {
  /** client associated with this connection. */
  clientId: string;
  /**
   * IBC version which can be utilised to determine encodings or protocols for
   * channels or packets utilising this connection.
   */
  versions: Version[];
  /** current state of the connection end. */
  state: State;
  /** counterparty chain associated with this connection. */
  counterparty: Counterparty;
  /**
   * delay period that must pass before a consensus state can be used for
   * packet-verification NOTE: delay period logic is only implemented by some
   * clients.
   */
  delayPeriod: bigint;
}
export interface ConnectionEndProtoMsg {
  typeUrl: '/ibc.core.connection.v1.ConnectionEnd';
  value: Uint8Array;
}
/**
 * ConnectionEnd defines a stateful object on a chain connected to another
 * separate one.
 * NOTE: there must only be 2 defined ConnectionEnds to establish
 * a connection between two chains.
 */
export interface ConnectionEndSDKType {
  client_id: string;
  versions: VersionSDKType[];
  state: State;
  counterparty: CounterpartySDKType;
  delay_period: bigint;
}
/**
 * IdentifiedConnection defines a connection with additional connection
 * identifier field.
 */
export interface IdentifiedConnection {
  /** connection identifier. */
  id: string;
  /** client associated with this connection. */
  clientId: string;
  /**
   * IBC version which can be utilised to determine encodings or protocols for
   * channels or packets utilising this connection
   */
  versions: Version[];
  /** current state of the connection end. */
  state: State;
  /** counterparty chain associated with this connection. */
  counterparty: Counterparty;
  /** delay period associated with this connection. */
  delayPeriod: bigint;
}
export interface IdentifiedConnectionProtoMsg {
  typeUrl: '/ibc.core.connection.v1.IdentifiedConnection';
  value: Uint8Array;
}
/**
 * IdentifiedConnection defines a connection with additional connection
 * identifier field.
 */
export interface IdentifiedConnectionSDKType {
  id: string;
  client_id: string;
  versions: VersionSDKType[];
  state: State;
  counterparty: CounterpartySDKType;
  delay_period: bigint;
}
/** Counterparty defines the counterparty chain associated with a connection end. */
export interface Counterparty {
  /**
   * identifies the client on the counterparty chain associated with a given
   * connection.
   */
  clientId: string;
  /**
   * identifies the connection end on the counterparty chain associated with a
   * given connection.
   */
  connectionId: string;
  /** commitment merkle prefix of the counterparty chain. */
  prefix: MerklePrefix;
}
export interface CounterpartyProtoMsg {
  typeUrl: '/ibc.core.connection.v1.Counterparty';
  value: Uint8Array;
}
/** Counterparty defines the counterparty chain associated with a connection end. */
export interface CounterpartySDKType {
  client_id: string;
  connection_id: string;
  prefix: MerklePrefixSDKType;
}
/** ClientPaths define all the connection paths for a client state. */
export interface ClientPaths {
  /** list of connection paths */
  paths: string[];
}
export interface ClientPathsProtoMsg {
  typeUrl: '/ibc.core.connection.v1.ClientPaths';
  value: Uint8Array;
}
/** ClientPaths define all the connection paths for a client state. */
export interface ClientPathsSDKType {
  paths: string[];
}
/** ConnectionPaths define all the connection paths for a given client state. */
export interface ConnectionPaths {
  /** client state unique identifier */
  clientId: string;
  /** list of connection paths */
  paths: string[];
}
export interface ConnectionPathsProtoMsg {
  typeUrl: '/ibc.core.connection.v1.ConnectionPaths';
  value: Uint8Array;
}
/** ConnectionPaths define all the connection paths for a given client state. */
export interface ConnectionPathsSDKType {
  client_id: string;
  paths: string[];
}
/**
 * Version defines the versioning scheme used to negotiate the IBC verison in
 * the connection handshake.
 */
export interface Version {
  /** unique version identifier */
  identifier: string;
  /** list of features compatible with the specified identifier */
  features: string[];
}
export interface VersionProtoMsg {
  typeUrl: '/ibc.core.connection.v1.Version';
  value: Uint8Array;
}
/**
 * Version defines the versioning scheme used to negotiate the IBC verison in
 * the connection handshake.
 */
export interface VersionSDKType {
  identifier: string;
  features: string[];
}
/** Params defines the set of Connection parameters. */
export interface Params {
  /**
   * maximum expected time per block (in nanoseconds), used to enforce block delay. This parameter should reflect the
   * largest amount of time that the chain might reasonably take to produce the next block under normal operating
   * conditions. A safe choice is 3-5x the expected time per block.
   */
  maxExpectedTimePerBlock: bigint;
}
export interface ParamsProtoMsg {
  typeUrl: '/ibc.core.connection.v1.Params';
  value: Uint8Array;
}
/** Params defines the set of Connection parameters. */
export interface ParamsSDKType {
  max_expected_time_per_block: bigint;
}
function createBaseConnectionEnd(): ConnectionEnd {
  return {
    clientId: '',
    versions: [],
    state: 0,
    counterparty: Counterparty.fromPartial({}),
    delayPeriod: BigInt(0),
  };
}
export const ConnectionEnd = {
  typeUrl: '/ibc.core.connection.v1.ConnectionEnd',
  encode(
    message: ConnectionEnd,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.clientId !== '') {
      writer.uint32(10).string(message.clientId);
    }
    for (const v of message.versions) {
      Version.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    if (message.state !== 0) {
      writer.uint32(24).int32(message.state);
    }
    if (message.counterparty !== undefined) {
      Counterparty.encode(
        message.counterparty,
        writer.uint32(34).fork(),
      ).ldelim();
    }
    if (message.delayPeriod !== BigInt(0)) {
      writer.uint32(40).uint64(message.delayPeriod);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): ConnectionEnd {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseConnectionEnd();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.clientId = reader.string();
          break;
        case 2:
          message.versions.push(Version.decode(reader, reader.uint32()));
          break;
        case 3:
          message.state = reader.int32() as any;
          break;
        case 4:
          message.counterparty = Counterparty.decode(reader, reader.uint32());
          break;
        case 5:
          message.delayPeriod = reader.uint64();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): ConnectionEnd {
    return {
      clientId: isSet(object.clientId) ? String(object.clientId) : '',
      versions: Array.isArray(object?.versions)
        ? object.versions.map((e: any) => Version.fromJSON(e))
        : [],
      state: isSet(object.state) ? stateFromJSON(object.state) : -1,
      counterparty: isSet(object.counterparty)
        ? Counterparty.fromJSON(object.counterparty)
        : undefined,
      delayPeriod: isSet(object.delayPeriod)
        ? BigInt(object.delayPeriod.toString())
        : BigInt(0),
    };
  },
  toJSON(message: ConnectionEnd): JsonSafe<ConnectionEnd> {
    const obj: any = {};
    message.clientId !== undefined && (obj.clientId = message.clientId);
    if (message.versions) {
      obj.versions = message.versions.map(e =>
        e ? Version.toJSON(e) : undefined,
      );
    } else {
      obj.versions = [];
    }
    message.state !== undefined && (obj.state = stateToJSON(message.state));
    message.counterparty !== undefined &&
      (obj.counterparty = message.counterparty
        ? Counterparty.toJSON(message.counterparty)
        : undefined);
    message.delayPeriod !== undefined &&
      (obj.delayPeriod = (message.delayPeriod || BigInt(0)).toString());
    return obj;
  },
  fromPartial(object: Partial<ConnectionEnd>): ConnectionEnd {
    const message = createBaseConnectionEnd();
    message.clientId = object.clientId ?? '';
    message.versions = object.versions?.map(e => Version.fromPartial(e)) || [];
    message.state = object.state ?? 0;
    message.counterparty =
      object.counterparty !== undefined && object.counterparty !== null
        ? Counterparty.fromPartial(object.counterparty)
        : undefined;
    message.delayPeriod =
      object.delayPeriod !== undefined && object.delayPeriod !== null
        ? BigInt(object.delayPeriod.toString())
        : BigInt(0);
    return message;
  },
  fromProtoMsg(message: ConnectionEndProtoMsg): ConnectionEnd {
    return ConnectionEnd.decode(message.value);
  },
  toProto(message: ConnectionEnd): Uint8Array {
    return ConnectionEnd.encode(message).finish();
  },
  toProtoMsg(message: ConnectionEnd): ConnectionEndProtoMsg {
    return {
      typeUrl: '/ibc.core.connection.v1.ConnectionEnd',
      value: ConnectionEnd.encode(message).finish(),
    };
  },
};
function createBaseIdentifiedConnection(): IdentifiedConnection {
  return {
    id: '',
    clientId: '',
    versions: [],
    state: 0,
    counterparty: Counterparty.fromPartial({}),
    delayPeriod: BigInt(0),
  };
}
export const IdentifiedConnection = {
  typeUrl: '/ibc.core.connection.v1.IdentifiedConnection',
  encode(
    message: IdentifiedConnection,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.id !== '') {
      writer.uint32(10).string(message.id);
    }
    if (message.clientId !== '') {
      writer.uint32(18).string(message.clientId);
    }
    for (const v of message.versions) {
      Version.encode(v!, writer.uint32(26).fork()).ldelim();
    }
    if (message.state !== 0) {
      writer.uint32(32).int32(message.state);
    }
    if (message.counterparty !== undefined) {
      Counterparty.encode(
        message.counterparty,
        writer.uint32(42).fork(),
      ).ldelim();
    }
    if (message.delayPeriod !== BigInt(0)) {
      writer.uint32(48).uint64(message.delayPeriod);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): IdentifiedConnection {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseIdentifiedConnection();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.id = reader.string();
          break;
        case 2:
          message.clientId = reader.string();
          break;
        case 3:
          message.versions.push(Version.decode(reader, reader.uint32()));
          break;
        case 4:
          message.state = reader.int32() as any;
          break;
        case 5:
          message.counterparty = Counterparty.decode(reader, reader.uint32());
          break;
        case 6:
          message.delayPeriod = reader.uint64();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): IdentifiedConnection {
    return {
      id: isSet(object.id) ? String(object.id) : '',
      clientId: isSet(object.clientId) ? String(object.clientId) : '',
      versions: Array.isArray(object?.versions)
        ? object.versions.map((e: any) => Version.fromJSON(e))
        : [],
      state: isSet(object.state) ? stateFromJSON(object.state) : -1,
      counterparty: isSet(object.counterparty)
        ? Counterparty.fromJSON(object.counterparty)
        : undefined,
      delayPeriod: isSet(object.delayPeriod)
        ? BigInt(object.delayPeriod.toString())
        : BigInt(0),
    };
  },
  toJSON(message: IdentifiedConnection): JsonSafe<IdentifiedConnection> {
    const obj: any = {};
    message.id !== undefined && (obj.id = message.id);
    message.clientId !== undefined && (obj.clientId = message.clientId);
    if (message.versions) {
      obj.versions = message.versions.map(e =>
        e ? Version.toJSON(e) : undefined,
      );
    } else {
      obj.versions = [];
    }
    message.state !== undefined && (obj.state = stateToJSON(message.state));
    message.counterparty !== undefined &&
      (obj.counterparty = message.counterparty
        ? Counterparty.toJSON(message.counterparty)
        : undefined);
    message.delayPeriod !== undefined &&
      (obj.delayPeriod = (message.delayPeriod || BigInt(0)).toString());
    return obj;
  },
  fromPartial(object: Partial<IdentifiedConnection>): IdentifiedConnection {
    const message = createBaseIdentifiedConnection();
    message.id = object.id ?? '';
    message.clientId = object.clientId ?? '';
    message.versions = object.versions?.map(e => Version.fromPartial(e)) || [];
    message.state = object.state ?? 0;
    message.counterparty =
      object.counterparty !== undefined && object.counterparty !== null
        ? Counterparty.fromPartial(object.counterparty)
        : undefined;
    message.delayPeriod =
      object.delayPeriod !== undefined && object.delayPeriod !== null
        ? BigInt(object.delayPeriod.toString())
        : BigInt(0);
    return message;
  },
  fromProtoMsg(message: IdentifiedConnectionProtoMsg): IdentifiedConnection {
    return IdentifiedConnection.decode(message.value);
  },
  toProto(message: IdentifiedConnection): Uint8Array {
    return IdentifiedConnection.encode(message).finish();
  },
  toProtoMsg(message: IdentifiedConnection): IdentifiedConnectionProtoMsg {
    return {
      typeUrl: '/ibc.core.connection.v1.IdentifiedConnection',
      value: IdentifiedConnection.encode(message).finish(),
    };
  },
};
function createBaseCounterparty(): Counterparty {
  return {
    clientId: '',
    connectionId: '',
    prefix: MerklePrefix.fromPartial({}),
  };
}
export const Counterparty = {
  typeUrl: '/ibc.core.connection.v1.Counterparty',
  encode(
    message: Counterparty,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.clientId !== '') {
      writer.uint32(10).string(message.clientId);
    }
    if (message.connectionId !== '') {
      writer.uint32(18).string(message.connectionId);
    }
    if (message.prefix !== undefined) {
      MerklePrefix.encode(message.prefix, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): Counterparty {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCounterparty();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.clientId = reader.string();
          break;
        case 2:
          message.connectionId = reader.string();
          break;
        case 3:
          message.prefix = MerklePrefix.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): Counterparty {
    return {
      clientId: isSet(object.clientId) ? String(object.clientId) : '',
      connectionId: isSet(object.connectionId)
        ? String(object.connectionId)
        : '',
      prefix: isSet(object.prefix)
        ? MerklePrefix.fromJSON(object.prefix)
        : undefined,
    };
  },
  toJSON(message: Counterparty): JsonSafe<Counterparty> {
    const obj: any = {};
    message.clientId !== undefined && (obj.clientId = message.clientId);
    message.connectionId !== undefined &&
      (obj.connectionId = message.connectionId);
    message.prefix !== undefined &&
      (obj.prefix = message.prefix
        ? MerklePrefix.toJSON(message.prefix)
        : undefined);
    return obj;
  },
  fromPartial(object: Partial<Counterparty>): Counterparty {
    const message = createBaseCounterparty();
    message.clientId = object.clientId ?? '';
    message.connectionId = object.connectionId ?? '';
    message.prefix =
      object.prefix !== undefined && object.prefix !== null
        ? MerklePrefix.fromPartial(object.prefix)
        : undefined;
    return message;
  },
  fromProtoMsg(message: CounterpartyProtoMsg): Counterparty {
    return Counterparty.decode(message.value);
  },
  toProto(message: Counterparty): Uint8Array {
    return Counterparty.encode(message).finish();
  },
  toProtoMsg(message: Counterparty): CounterpartyProtoMsg {
    return {
      typeUrl: '/ibc.core.connection.v1.Counterparty',
      value: Counterparty.encode(message).finish(),
    };
  },
};
function createBaseClientPaths(): ClientPaths {
  return {
    paths: [],
  };
}
export const ClientPaths = {
  typeUrl: '/ibc.core.connection.v1.ClientPaths',
  encode(
    message: ClientPaths,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    for (const v of message.paths) {
      writer.uint32(10).string(v!);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): ClientPaths {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseClientPaths();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.paths.push(reader.string());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): ClientPaths {
    return {
      paths: Array.isArray(object?.paths)
        ? object.paths.map((e: any) => String(e))
        : [],
    };
  },
  toJSON(message: ClientPaths): JsonSafe<ClientPaths> {
    const obj: any = {};
    if (message.paths) {
      obj.paths = message.paths.map(e => e);
    } else {
      obj.paths = [];
    }
    return obj;
  },
  fromPartial(object: Partial<ClientPaths>): ClientPaths {
    const message = createBaseClientPaths();
    message.paths = object.paths?.map(e => e) || [];
    return message;
  },
  fromProtoMsg(message: ClientPathsProtoMsg): ClientPaths {
    return ClientPaths.decode(message.value);
  },
  toProto(message: ClientPaths): Uint8Array {
    return ClientPaths.encode(message).finish();
  },
  toProtoMsg(message: ClientPaths): ClientPathsProtoMsg {
    return {
      typeUrl: '/ibc.core.connection.v1.ClientPaths',
      value: ClientPaths.encode(message).finish(),
    };
  },
};
function createBaseConnectionPaths(): ConnectionPaths {
  return {
    clientId: '',
    paths: [],
  };
}
export const ConnectionPaths = {
  typeUrl: '/ibc.core.connection.v1.ConnectionPaths',
  encode(
    message: ConnectionPaths,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.clientId !== '') {
      writer.uint32(10).string(message.clientId);
    }
    for (const v of message.paths) {
      writer.uint32(18).string(v!);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): ConnectionPaths {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseConnectionPaths();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.clientId = reader.string();
          break;
        case 2:
          message.paths.push(reader.string());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): ConnectionPaths {
    return {
      clientId: isSet(object.clientId) ? String(object.clientId) : '',
      paths: Array.isArray(object?.paths)
        ? object.paths.map((e: any) => String(e))
        : [],
    };
  },
  toJSON(message: ConnectionPaths): JsonSafe<ConnectionPaths> {
    const obj: any = {};
    message.clientId !== undefined && (obj.clientId = message.clientId);
    if (message.paths) {
      obj.paths = message.paths.map(e => e);
    } else {
      obj.paths = [];
    }
    return obj;
  },
  fromPartial(object: Partial<ConnectionPaths>): ConnectionPaths {
    const message = createBaseConnectionPaths();
    message.clientId = object.clientId ?? '';
    message.paths = object.paths?.map(e => e) || [];
    return message;
  },
  fromProtoMsg(message: ConnectionPathsProtoMsg): ConnectionPaths {
    return ConnectionPaths.decode(message.value);
  },
  toProto(message: ConnectionPaths): Uint8Array {
    return ConnectionPaths.encode(message).finish();
  },
  toProtoMsg(message: ConnectionPaths): ConnectionPathsProtoMsg {
    return {
      typeUrl: '/ibc.core.connection.v1.ConnectionPaths',
      value: ConnectionPaths.encode(message).finish(),
    };
  },
};
function createBaseVersion(): Version {
  return {
    identifier: '',
    features: [],
  };
}
export const Version = {
  typeUrl: '/ibc.core.connection.v1.Version',
  encode(
    message: Version,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.identifier !== '') {
      writer.uint32(10).string(message.identifier);
    }
    for (const v of message.features) {
      writer.uint32(18).string(v!);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): Version {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseVersion();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.identifier = reader.string();
          break;
        case 2:
          message.features.push(reader.string());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): Version {
    return {
      identifier: isSet(object.identifier) ? String(object.identifier) : '',
      features: Array.isArray(object?.features)
        ? object.features.map((e: any) => String(e))
        : [],
    };
  },
  toJSON(message: Version): JsonSafe<Version> {
    const obj: any = {};
    message.identifier !== undefined && (obj.identifier = message.identifier);
    if (message.features) {
      obj.features = message.features.map(e => e);
    } else {
      obj.features = [];
    }
    return obj;
  },
  fromPartial(object: Partial<Version>): Version {
    const message = createBaseVersion();
    message.identifier = object.identifier ?? '';
    message.features = object.features?.map(e => e) || [];
    return message;
  },
  fromProtoMsg(message: VersionProtoMsg): Version {
    return Version.decode(message.value);
  },
  toProto(message: Version): Uint8Array {
    return Version.encode(message).finish();
  },
  toProtoMsg(message: Version): VersionProtoMsg {
    return {
      typeUrl: '/ibc.core.connection.v1.Version',
      value: Version.encode(message).finish(),
    };
  },
};
function createBaseParams(): Params {
  return {
    maxExpectedTimePerBlock: BigInt(0),
  };
}
export const Params = {
  typeUrl: '/ibc.core.connection.v1.Params',
  encode(
    message: Params,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.maxExpectedTimePerBlock !== BigInt(0)) {
      writer.uint32(8).uint64(message.maxExpectedTimePerBlock);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): Params {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseParams();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.maxExpectedTimePerBlock = reader.uint64();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): Params {
    return {
      maxExpectedTimePerBlock: isSet(object.maxExpectedTimePerBlock)
        ? BigInt(object.maxExpectedTimePerBlock.toString())
        : BigInt(0),
    };
  },
  toJSON(message: Params): JsonSafe<Params> {
    const obj: any = {};
    message.maxExpectedTimePerBlock !== undefined &&
      (obj.maxExpectedTimePerBlock = (
        message.maxExpectedTimePerBlock || BigInt(0)
      ).toString());
    return obj;
  },
  fromPartial(object: Partial<Params>): Params {
    const message = createBaseParams();
    message.maxExpectedTimePerBlock =
      object.maxExpectedTimePerBlock !== undefined &&
      object.maxExpectedTimePerBlock !== null
        ? BigInt(object.maxExpectedTimePerBlock.toString())
        : BigInt(0);
    return message;
  },
  fromProtoMsg(message: ParamsProtoMsg): Params {
    return Params.decode(message.value);
  },
  toProto(message: Params): Uint8Array {
    return Params.encode(message).finish();
  },
  toProtoMsg(message: Params): ParamsProtoMsg {
    return {
      typeUrl: '/ibc.core.connection.v1.Params',
      value: Params.encode(message).finish(),
    };
  },
};
