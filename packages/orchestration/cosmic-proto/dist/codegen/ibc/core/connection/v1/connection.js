//@ts-nocheck
import { MerklePrefix, } from '../../commitment/v1/commitment.js';
import { BinaryReader, BinaryWriter } from '../../../../binary.js';
import { isSet } from '../../../../helpers.js';
import {} from '../../../../json-safe.js';
/**
 * State defines if a connection is in one of the following states:
 * INIT, TRYOPEN, OPEN or UNINITIALIZED.
 */
export var State;
(function (State) {
    /** STATE_UNINITIALIZED_UNSPECIFIED - Default State */
    State[State["STATE_UNINITIALIZED_UNSPECIFIED"] = 0] = "STATE_UNINITIALIZED_UNSPECIFIED";
    /** STATE_INIT - A connection end has just started the opening handshake. */
    State[State["STATE_INIT"] = 1] = "STATE_INIT";
    /**
     * STATE_TRYOPEN - A connection end has acknowledged the handshake step on the counterparty
     * chain.
     */
    State[State["STATE_TRYOPEN"] = 2] = "STATE_TRYOPEN";
    /** STATE_OPEN - A connection end has completed the handshake. */
    State[State["STATE_OPEN"] = 3] = "STATE_OPEN";
    State[State["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
})(State || (State = {}));
export const StateSDKType = State;
export function stateFromJSON(object) {
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
export function stateToJSON(object) {
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
function createBaseConnectionEnd() {
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
    encode(message, writer = BinaryWriter.create()) {
        if (message.clientId !== '') {
            writer.uint32(10).string(message.clientId);
        }
        for (const v of message.versions) {
            Version.encode(v, writer.uint32(18).fork()).ldelim();
        }
        if (message.state !== 0) {
            writer.uint32(24).int32(message.state);
        }
        if (message.counterparty !== undefined) {
            Counterparty.encode(message.counterparty, writer.uint32(34).fork()).ldelim();
        }
        if (message.delayPeriod !== BigInt(0)) {
            writer.uint32(40).uint64(message.delayPeriod);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
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
                    message.state = reader.int32();
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
    fromJSON(object) {
        return {
            clientId: isSet(object.clientId) ? String(object.clientId) : '',
            versions: Array.isArray(object?.versions)
                ? object.versions.map((e) => Version.fromJSON(e))
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
    toJSON(message) {
        const obj = {};
        message.clientId !== undefined && (obj.clientId = message.clientId);
        if (message.versions) {
            obj.versions = message.versions.map(e => e ? Version.toJSON(e) : undefined);
        }
        else {
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
    fromPartial(object) {
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
    fromProtoMsg(message) {
        return ConnectionEnd.decode(message.value);
    },
    toProto(message) {
        return ConnectionEnd.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.core.connection.v1.ConnectionEnd',
            value: ConnectionEnd.encode(message).finish(),
        };
    },
};
function createBaseIdentifiedConnection() {
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
    encode(message, writer = BinaryWriter.create()) {
        if (message.id !== '') {
            writer.uint32(10).string(message.id);
        }
        if (message.clientId !== '') {
            writer.uint32(18).string(message.clientId);
        }
        for (const v of message.versions) {
            Version.encode(v, writer.uint32(26).fork()).ldelim();
        }
        if (message.state !== 0) {
            writer.uint32(32).int32(message.state);
        }
        if (message.counterparty !== undefined) {
            Counterparty.encode(message.counterparty, writer.uint32(42).fork()).ldelim();
        }
        if (message.delayPeriod !== BigInt(0)) {
            writer.uint32(48).uint64(message.delayPeriod);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
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
                    message.state = reader.int32();
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
    fromJSON(object) {
        return {
            id: isSet(object.id) ? String(object.id) : '',
            clientId: isSet(object.clientId) ? String(object.clientId) : '',
            versions: Array.isArray(object?.versions)
                ? object.versions.map((e) => Version.fromJSON(e))
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
    toJSON(message) {
        const obj = {};
        message.id !== undefined && (obj.id = message.id);
        message.clientId !== undefined && (obj.clientId = message.clientId);
        if (message.versions) {
            obj.versions = message.versions.map(e => e ? Version.toJSON(e) : undefined);
        }
        else {
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
    fromPartial(object) {
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
    fromProtoMsg(message) {
        return IdentifiedConnection.decode(message.value);
    },
    toProto(message) {
        return IdentifiedConnection.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.core.connection.v1.IdentifiedConnection',
            value: IdentifiedConnection.encode(message).finish(),
        };
    },
};
function createBaseCounterparty() {
    return {
        clientId: '',
        connectionId: '',
        prefix: MerklePrefix.fromPartial({}),
    };
}
export const Counterparty = {
    typeUrl: '/ibc.core.connection.v1.Counterparty',
    encode(message, writer = BinaryWriter.create()) {
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
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
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
    fromJSON(object) {
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
    toJSON(message) {
        const obj = {};
        message.clientId !== undefined && (obj.clientId = message.clientId);
        message.connectionId !== undefined &&
            (obj.connectionId = message.connectionId);
        message.prefix !== undefined &&
            (obj.prefix = message.prefix
                ? MerklePrefix.toJSON(message.prefix)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseCounterparty();
        message.clientId = object.clientId ?? '';
        message.connectionId = object.connectionId ?? '';
        message.prefix =
            object.prefix !== undefined && object.prefix !== null
                ? MerklePrefix.fromPartial(object.prefix)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return Counterparty.decode(message.value);
    },
    toProto(message) {
        return Counterparty.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.core.connection.v1.Counterparty',
            value: Counterparty.encode(message).finish(),
        };
    },
};
function createBaseClientPaths() {
    return {
        paths: [],
    };
}
export const ClientPaths = {
    typeUrl: '/ibc.core.connection.v1.ClientPaths',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.paths) {
            writer.uint32(10).string(v);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
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
    fromJSON(object) {
        return {
            paths: Array.isArray(object?.paths)
                ? object.paths.map((e) => String(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.paths) {
            obj.paths = message.paths.map(e => e);
        }
        else {
            obj.paths = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseClientPaths();
        message.paths = object.paths?.map(e => e) || [];
        return message;
    },
    fromProtoMsg(message) {
        return ClientPaths.decode(message.value);
    },
    toProto(message) {
        return ClientPaths.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.core.connection.v1.ClientPaths',
            value: ClientPaths.encode(message).finish(),
        };
    },
};
function createBaseConnectionPaths() {
    return {
        clientId: '',
        paths: [],
    };
}
export const ConnectionPaths = {
    typeUrl: '/ibc.core.connection.v1.ConnectionPaths',
    encode(message, writer = BinaryWriter.create()) {
        if (message.clientId !== '') {
            writer.uint32(10).string(message.clientId);
        }
        for (const v of message.paths) {
            writer.uint32(18).string(v);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
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
    fromJSON(object) {
        return {
            clientId: isSet(object.clientId) ? String(object.clientId) : '',
            paths: Array.isArray(object?.paths)
                ? object.paths.map((e) => String(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        message.clientId !== undefined && (obj.clientId = message.clientId);
        if (message.paths) {
            obj.paths = message.paths.map(e => e);
        }
        else {
            obj.paths = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseConnectionPaths();
        message.clientId = object.clientId ?? '';
        message.paths = object.paths?.map(e => e) || [];
        return message;
    },
    fromProtoMsg(message) {
        return ConnectionPaths.decode(message.value);
    },
    toProto(message) {
        return ConnectionPaths.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.core.connection.v1.ConnectionPaths',
            value: ConnectionPaths.encode(message).finish(),
        };
    },
};
function createBaseVersion() {
    return {
        identifier: '',
        features: [],
    };
}
export const Version = {
    typeUrl: '/ibc.core.connection.v1.Version',
    encode(message, writer = BinaryWriter.create()) {
        if (message.identifier !== '') {
            writer.uint32(10).string(message.identifier);
        }
        for (const v of message.features) {
            writer.uint32(18).string(v);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
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
    fromJSON(object) {
        return {
            identifier: isSet(object.identifier) ? String(object.identifier) : '',
            features: Array.isArray(object?.features)
                ? object.features.map((e) => String(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        message.identifier !== undefined && (obj.identifier = message.identifier);
        if (message.features) {
            obj.features = message.features.map(e => e);
        }
        else {
            obj.features = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseVersion();
        message.identifier = object.identifier ?? '';
        message.features = object.features?.map(e => e) || [];
        return message;
    },
    fromProtoMsg(message) {
        return Version.decode(message.value);
    },
    toProto(message) {
        return Version.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.core.connection.v1.Version',
            value: Version.encode(message).finish(),
        };
    },
};
function createBaseParams() {
    return {
        maxExpectedTimePerBlock: BigInt(0),
    };
}
export const Params = {
    typeUrl: '/ibc.core.connection.v1.Params',
    encode(message, writer = BinaryWriter.create()) {
        if (message.maxExpectedTimePerBlock !== BigInt(0)) {
            writer.uint32(8).uint64(message.maxExpectedTimePerBlock);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
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
    fromJSON(object) {
        return {
            maxExpectedTimePerBlock: isSet(object.maxExpectedTimePerBlock)
                ? BigInt(object.maxExpectedTimePerBlock.toString())
                : BigInt(0),
        };
    },
    toJSON(message) {
        const obj = {};
        message.maxExpectedTimePerBlock !== undefined &&
            (obj.maxExpectedTimePerBlock = (message.maxExpectedTimePerBlock || BigInt(0)).toString());
        return obj;
    },
    fromPartial(object) {
        const message = createBaseParams();
        message.maxExpectedTimePerBlock =
            object.maxExpectedTimePerBlock !== undefined &&
                object.maxExpectedTimePerBlock !== null
                ? BigInt(object.maxExpectedTimePerBlock.toString())
                : BigInt(0);
        return message;
    },
    fromProtoMsg(message) {
        return Params.decode(message.value);
    },
    toProto(message) {
        return Params.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.core.connection.v1.Params',
            value: Params.encode(message).finish(),
        };
    },
};
//# sourceMappingURL=connection.js.map