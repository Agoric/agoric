//@ts-nocheck
import { Height } from '../../client/v1/client.js';
import { BinaryReader, BinaryWriter } from '../../../../binary.js';
import { isSet, bytesFromBase64, base64FromBytes, } from '../../../../helpers.js';
import {} from '../../../../json-safe.js';
/**
 * State defines if a channel is in one of the following states:
 * CLOSED, INIT, TRYOPEN, OPEN or UNINITIALIZED.
 */
export var State;
(function (State) {
    /** STATE_UNINITIALIZED_UNSPECIFIED - Default State */
    State[State["STATE_UNINITIALIZED_UNSPECIFIED"] = 0] = "STATE_UNINITIALIZED_UNSPECIFIED";
    /** STATE_INIT - A channel has just started the opening handshake. */
    State[State["STATE_INIT"] = 1] = "STATE_INIT";
    /** STATE_TRYOPEN - A channel has acknowledged the handshake step on the counterparty chain. */
    State[State["STATE_TRYOPEN"] = 2] = "STATE_TRYOPEN";
    /**
     * STATE_OPEN - A channel has completed the handshake. Open channels are
     * ready to send and receive packets.
     */
    State[State["STATE_OPEN"] = 3] = "STATE_OPEN";
    /**
     * STATE_CLOSED - A channel has been closed and can no longer be used to send or receive
     * packets.
     */
    State[State["STATE_CLOSED"] = 4] = "STATE_CLOSED";
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
        case 4:
        case 'STATE_CLOSED':
            return State.STATE_CLOSED;
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
        case State.STATE_CLOSED:
            return 'STATE_CLOSED';
        case State.UNRECOGNIZED:
        default:
            return 'UNRECOGNIZED';
    }
}
/** Order defines if a channel is ORDERED or UNORDERED */
export var Order;
(function (Order) {
    /** ORDER_NONE_UNSPECIFIED - zero-value for channel ordering */
    Order[Order["ORDER_NONE_UNSPECIFIED"] = 0] = "ORDER_NONE_UNSPECIFIED";
    /**
     * ORDER_UNORDERED - packets can be delivered in any order, which may differ from the order in
     * which they were sent.
     */
    Order[Order["ORDER_UNORDERED"] = 1] = "ORDER_UNORDERED";
    /** ORDER_ORDERED - packets are delivered exactly in the order which they were sent */
    Order[Order["ORDER_ORDERED"] = 2] = "ORDER_ORDERED";
    Order[Order["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
})(Order || (Order = {}));
export const OrderSDKType = Order;
export function orderFromJSON(object) {
    switch (object) {
        case 0:
        case 'ORDER_NONE_UNSPECIFIED':
            return Order.ORDER_NONE_UNSPECIFIED;
        case 1:
        case 'ORDER_UNORDERED':
            return Order.ORDER_UNORDERED;
        case 2:
        case 'ORDER_ORDERED':
            return Order.ORDER_ORDERED;
        case -1:
        case 'UNRECOGNIZED':
        default:
            return Order.UNRECOGNIZED;
    }
}
export function orderToJSON(object) {
    switch (object) {
        case Order.ORDER_NONE_UNSPECIFIED:
            return 'ORDER_NONE_UNSPECIFIED';
        case Order.ORDER_UNORDERED:
            return 'ORDER_UNORDERED';
        case Order.ORDER_ORDERED:
            return 'ORDER_ORDERED';
        case Order.UNRECOGNIZED:
        default:
            return 'UNRECOGNIZED';
    }
}
function createBaseChannel() {
    return {
        state: 0,
        ordering: 0,
        counterparty: Counterparty.fromPartial({}),
        connectionHops: [],
        version: '',
    };
}
export const Channel = {
    typeUrl: '/ibc.core.channel.v1.Channel',
    encode(message, writer = BinaryWriter.create()) {
        if (message.state !== 0) {
            writer.uint32(8).int32(message.state);
        }
        if (message.ordering !== 0) {
            writer.uint32(16).int32(message.ordering);
        }
        if (message.counterparty !== undefined) {
            Counterparty.encode(message.counterparty, writer.uint32(26).fork()).ldelim();
        }
        for (const v of message.connectionHops) {
            writer.uint32(34).string(v);
        }
        if (message.version !== '') {
            writer.uint32(42).string(message.version);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseChannel();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.state = reader.int32();
                    break;
                case 2:
                    message.ordering = reader.int32();
                    break;
                case 3:
                    message.counterparty = Counterparty.decode(reader, reader.uint32());
                    break;
                case 4:
                    message.connectionHops.push(reader.string());
                    break;
                case 5:
                    message.version = reader.string();
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
            state: isSet(object.state) ? stateFromJSON(object.state) : -1,
            ordering: isSet(object.ordering) ? orderFromJSON(object.ordering) : -1,
            counterparty: isSet(object.counterparty)
                ? Counterparty.fromJSON(object.counterparty)
                : undefined,
            connectionHops: Array.isArray(object?.connectionHops)
                ? object.connectionHops.map((e) => String(e))
                : [],
            version: isSet(object.version) ? String(object.version) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.state !== undefined && (obj.state = stateToJSON(message.state));
        message.ordering !== undefined &&
            (obj.ordering = orderToJSON(message.ordering));
        message.counterparty !== undefined &&
            (obj.counterparty = message.counterparty
                ? Counterparty.toJSON(message.counterparty)
                : undefined);
        if (message.connectionHops) {
            obj.connectionHops = message.connectionHops.map(e => e);
        }
        else {
            obj.connectionHops = [];
        }
        message.version !== undefined && (obj.version = message.version);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseChannel();
        message.state = object.state ?? 0;
        message.ordering = object.ordering ?? 0;
        message.counterparty =
            object.counterparty !== undefined && object.counterparty !== null
                ? Counterparty.fromPartial(object.counterparty)
                : undefined;
        message.connectionHops = object.connectionHops?.map(e => e) || [];
        message.version = object.version ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return Channel.decode(message.value);
    },
    toProto(message) {
        return Channel.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.core.channel.v1.Channel',
            value: Channel.encode(message).finish(),
        };
    },
};
function createBaseIdentifiedChannel() {
    return {
        state: 0,
        ordering: 0,
        counterparty: Counterparty.fromPartial({}),
        connectionHops: [],
        version: '',
        portId: '',
        channelId: '',
    };
}
export const IdentifiedChannel = {
    typeUrl: '/ibc.core.channel.v1.IdentifiedChannel',
    encode(message, writer = BinaryWriter.create()) {
        if (message.state !== 0) {
            writer.uint32(8).int32(message.state);
        }
        if (message.ordering !== 0) {
            writer.uint32(16).int32(message.ordering);
        }
        if (message.counterparty !== undefined) {
            Counterparty.encode(message.counterparty, writer.uint32(26).fork()).ldelim();
        }
        for (const v of message.connectionHops) {
            writer.uint32(34).string(v);
        }
        if (message.version !== '') {
            writer.uint32(42).string(message.version);
        }
        if (message.portId !== '') {
            writer.uint32(50).string(message.portId);
        }
        if (message.channelId !== '') {
            writer.uint32(58).string(message.channelId);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseIdentifiedChannel();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.state = reader.int32();
                    break;
                case 2:
                    message.ordering = reader.int32();
                    break;
                case 3:
                    message.counterparty = Counterparty.decode(reader, reader.uint32());
                    break;
                case 4:
                    message.connectionHops.push(reader.string());
                    break;
                case 5:
                    message.version = reader.string();
                    break;
                case 6:
                    message.portId = reader.string();
                    break;
                case 7:
                    message.channelId = reader.string();
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
            state: isSet(object.state) ? stateFromJSON(object.state) : -1,
            ordering: isSet(object.ordering) ? orderFromJSON(object.ordering) : -1,
            counterparty: isSet(object.counterparty)
                ? Counterparty.fromJSON(object.counterparty)
                : undefined,
            connectionHops: Array.isArray(object?.connectionHops)
                ? object.connectionHops.map((e) => String(e))
                : [],
            version: isSet(object.version) ? String(object.version) : '',
            portId: isSet(object.portId) ? String(object.portId) : '',
            channelId: isSet(object.channelId) ? String(object.channelId) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.state !== undefined && (obj.state = stateToJSON(message.state));
        message.ordering !== undefined &&
            (obj.ordering = orderToJSON(message.ordering));
        message.counterparty !== undefined &&
            (obj.counterparty = message.counterparty
                ? Counterparty.toJSON(message.counterparty)
                : undefined);
        if (message.connectionHops) {
            obj.connectionHops = message.connectionHops.map(e => e);
        }
        else {
            obj.connectionHops = [];
        }
        message.version !== undefined && (obj.version = message.version);
        message.portId !== undefined && (obj.portId = message.portId);
        message.channelId !== undefined && (obj.channelId = message.channelId);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseIdentifiedChannel();
        message.state = object.state ?? 0;
        message.ordering = object.ordering ?? 0;
        message.counterparty =
            object.counterparty !== undefined && object.counterparty !== null
                ? Counterparty.fromPartial(object.counterparty)
                : undefined;
        message.connectionHops = object.connectionHops?.map(e => e) || [];
        message.version = object.version ?? '';
        message.portId = object.portId ?? '';
        message.channelId = object.channelId ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return IdentifiedChannel.decode(message.value);
    },
    toProto(message) {
        return IdentifiedChannel.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.core.channel.v1.IdentifiedChannel',
            value: IdentifiedChannel.encode(message).finish(),
        };
    },
};
function createBaseCounterparty() {
    return {
        portId: '',
        channelId: '',
    };
}
export const Counterparty = {
    typeUrl: '/ibc.core.channel.v1.Counterparty',
    encode(message, writer = BinaryWriter.create()) {
        if (message.portId !== '') {
            writer.uint32(10).string(message.portId);
        }
        if (message.channelId !== '') {
            writer.uint32(18).string(message.channelId);
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
                    message.portId = reader.string();
                    break;
                case 2:
                    message.channelId = reader.string();
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
            portId: isSet(object.portId) ? String(object.portId) : '',
            channelId: isSet(object.channelId) ? String(object.channelId) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.portId !== undefined && (obj.portId = message.portId);
        message.channelId !== undefined && (obj.channelId = message.channelId);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseCounterparty();
        message.portId = object.portId ?? '';
        message.channelId = object.channelId ?? '';
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
            typeUrl: '/ibc.core.channel.v1.Counterparty',
            value: Counterparty.encode(message).finish(),
        };
    },
};
function createBasePacket() {
    return {
        sequence: BigInt(0),
        sourcePort: '',
        sourceChannel: '',
        destinationPort: '',
        destinationChannel: '',
        data: new Uint8Array(),
        timeoutHeight: Height.fromPartial({}),
        timeoutTimestamp: BigInt(0),
    };
}
export const Packet = {
    typeUrl: '/ibc.core.channel.v1.Packet',
    encode(message, writer = BinaryWriter.create()) {
        if (message.sequence !== BigInt(0)) {
            writer.uint32(8).uint64(message.sequence);
        }
        if (message.sourcePort !== '') {
            writer.uint32(18).string(message.sourcePort);
        }
        if (message.sourceChannel !== '') {
            writer.uint32(26).string(message.sourceChannel);
        }
        if (message.destinationPort !== '') {
            writer.uint32(34).string(message.destinationPort);
        }
        if (message.destinationChannel !== '') {
            writer.uint32(42).string(message.destinationChannel);
        }
        if (message.data.length !== 0) {
            writer.uint32(50).bytes(message.data);
        }
        if (message.timeoutHeight !== undefined) {
            Height.encode(message.timeoutHeight, writer.uint32(58).fork()).ldelim();
        }
        if (message.timeoutTimestamp !== BigInt(0)) {
            writer.uint32(64).uint64(message.timeoutTimestamp);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBasePacket();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.sequence = reader.uint64();
                    break;
                case 2:
                    message.sourcePort = reader.string();
                    break;
                case 3:
                    message.sourceChannel = reader.string();
                    break;
                case 4:
                    message.destinationPort = reader.string();
                    break;
                case 5:
                    message.destinationChannel = reader.string();
                    break;
                case 6:
                    message.data = reader.bytes();
                    break;
                case 7:
                    message.timeoutHeight = Height.decode(reader, reader.uint32());
                    break;
                case 8:
                    message.timeoutTimestamp = reader.uint64();
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
            sequence: isSet(object.sequence)
                ? BigInt(object.sequence.toString())
                : BigInt(0),
            sourcePort: isSet(object.sourcePort) ? String(object.sourcePort) : '',
            sourceChannel: isSet(object.sourceChannel)
                ? String(object.sourceChannel)
                : '',
            destinationPort: isSet(object.destinationPort)
                ? String(object.destinationPort)
                : '',
            destinationChannel: isSet(object.destinationChannel)
                ? String(object.destinationChannel)
                : '',
            data: isSet(object.data)
                ? bytesFromBase64(object.data)
                : new Uint8Array(),
            timeoutHeight: isSet(object.timeoutHeight)
                ? Height.fromJSON(object.timeoutHeight)
                : undefined,
            timeoutTimestamp: isSet(object.timeoutTimestamp)
                ? BigInt(object.timeoutTimestamp.toString())
                : BigInt(0),
        };
    },
    toJSON(message) {
        const obj = {};
        message.sequence !== undefined &&
            (obj.sequence = (message.sequence || BigInt(0)).toString());
        message.sourcePort !== undefined && (obj.sourcePort = message.sourcePort);
        message.sourceChannel !== undefined &&
            (obj.sourceChannel = message.sourceChannel);
        message.destinationPort !== undefined &&
            (obj.destinationPort = message.destinationPort);
        message.destinationChannel !== undefined &&
            (obj.destinationChannel = message.destinationChannel);
        message.data !== undefined &&
            (obj.data = base64FromBytes(message.data !== undefined ? message.data : new Uint8Array()));
        message.timeoutHeight !== undefined &&
            (obj.timeoutHeight = message.timeoutHeight
                ? Height.toJSON(message.timeoutHeight)
                : undefined);
        message.timeoutTimestamp !== undefined &&
            (obj.timeoutTimestamp = (message.timeoutTimestamp || BigInt(0)).toString());
        return obj;
    },
    fromPartial(object) {
        const message = createBasePacket();
        message.sequence =
            object.sequence !== undefined && object.sequence !== null
                ? BigInt(object.sequence.toString())
                : BigInt(0);
        message.sourcePort = object.sourcePort ?? '';
        message.sourceChannel = object.sourceChannel ?? '';
        message.destinationPort = object.destinationPort ?? '';
        message.destinationChannel = object.destinationChannel ?? '';
        message.data = object.data ?? new Uint8Array();
        message.timeoutHeight =
            object.timeoutHeight !== undefined && object.timeoutHeight !== null
                ? Height.fromPartial(object.timeoutHeight)
                : undefined;
        message.timeoutTimestamp =
            object.timeoutTimestamp !== undefined && object.timeoutTimestamp !== null
                ? BigInt(object.timeoutTimestamp.toString())
                : BigInt(0);
        return message;
    },
    fromProtoMsg(message) {
        return Packet.decode(message.value);
    },
    toProto(message) {
        return Packet.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.core.channel.v1.Packet',
            value: Packet.encode(message).finish(),
        };
    },
};
function createBasePacketState() {
    return {
        portId: '',
        channelId: '',
        sequence: BigInt(0),
        data: new Uint8Array(),
    };
}
export const PacketState = {
    typeUrl: '/ibc.core.channel.v1.PacketState',
    encode(message, writer = BinaryWriter.create()) {
        if (message.portId !== '') {
            writer.uint32(10).string(message.portId);
        }
        if (message.channelId !== '') {
            writer.uint32(18).string(message.channelId);
        }
        if (message.sequence !== BigInt(0)) {
            writer.uint32(24).uint64(message.sequence);
        }
        if (message.data.length !== 0) {
            writer.uint32(34).bytes(message.data);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBasePacketState();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.portId = reader.string();
                    break;
                case 2:
                    message.channelId = reader.string();
                    break;
                case 3:
                    message.sequence = reader.uint64();
                    break;
                case 4:
                    message.data = reader.bytes();
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
            portId: isSet(object.portId) ? String(object.portId) : '',
            channelId: isSet(object.channelId) ? String(object.channelId) : '',
            sequence: isSet(object.sequence)
                ? BigInt(object.sequence.toString())
                : BigInt(0),
            data: isSet(object.data)
                ? bytesFromBase64(object.data)
                : new Uint8Array(),
        };
    },
    toJSON(message) {
        const obj = {};
        message.portId !== undefined && (obj.portId = message.portId);
        message.channelId !== undefined && (obj.channelId = message.channelId);
        message.sequence !== undefined &&
            (obj.sequence = (message.sequence || BigInt(0)).toString());
        message.data !== undefined &&
            (obj.data = base64FromBytes(message.data !== undefined ? message.data : new Uint8Array()));
        return obj;
    },
    fromPartial(object) {
        const message = createBasePacketState();
        message.portId = object.portId ?? '';
        message.channelId = object.channelId ?? '';
        message.sequence =
            object.sequence !== undefined && object.sequence !== null
                ? BigInt(object.sequence.toString())
                : BigInt(0);
        message.data = object.data ?? new Uint8Array();
        return message;
    },
    fromProtoMsg(message) {
        return PacketState.decode(message.value);
    },
    toProto(message) {
        return PacketState.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.core.channel.v1.PacketState',
            value: PacketState.encode(message).finish(),
        };
    },
};
function createBasePacketId() {
    return {
        portId: '',
        channelId: '',
        sequence: BigInt(0),
    };
}
export const PacketId = {
    typeUrl: '/ibc.core.channel.v1.PacketId',
    encode(message, writer = BinaryWriter.create()) {
        if (message.portId !== '') {
            writer.uint32(10).string(message.portId);
        }
        if (message.channelId !== '') {
            writer.uint32(18).string(message.channelId);
        }
        if (message.sequence !== BigInt(0)) {
            writer.uint32(24).uint64(message.sequence);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBasePacketId();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.portId = reader.string();
                    break;
                case 2:
                    message.channelId = reader.string();
                    break;
                case 3:
                    message.sequence = reader.uint64();
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
            portId: isSet(object.portId) ? String(object.portId) : '',
            channelId: isSet(object.channelId) ? String(object.channelId) : '',
            sequence: isSet(object.sequence)
                ? BigInt(object.sequence.toString())
                : BigInt(0),
        };
    },
    toJSON(message) {
        const obj = {};
        message.portId !== undefined && (obj.portId = message.portId);
        message.channelId !== undefined && (obj.channelId = message.channelId);
        message.sequence !== undefined &&
            (obj.sequence = (message.sequence || BigInt(0)).toString());
        return obj;
    },
    fromPartial(object) {
        const message = createBasePacketId();
        message.portId = object.portId ?? '';
        message.channelId = object.channelId ?? '';
        message.sequence =
            object.sequence !== undefined && object.sequence !== null
                ? BigInt(object.sequence.toString())
                : BigInt(0);
        return message;
    },
    fromProtoMsg(message) {
        return PacketId.decode(message.value);
    },
    toProto(message) {
        return PacketId.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.core.channel.v1.PacketId',
            value: PacketId.encode(message).finish(),
        };
    },
};
function createBaseAcknowledgement() {
    return {
        result: undefined,
        error: undefined,
    };
}
export const Acknowledgement = {
    typeUrl: '/ibc.core.channel.v1.Acknowledgement',
    encode(message, writer = BinaryWriter.create()) {
        if (message.result !== undefined) {
            writer.uint32(170).bytes(message.result);
        }
        if (message.error !== undefined) {
            writer.uint32(178).string(message.error);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseAcknowledgement();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 21:
                    message.result = reader.bytes();
                    break;
                case 22:
                    message.error = reader.string();
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
            result: isSet(object.result) ? bytesFromBase64(object.result) : undefined,
            error: isSet(object.error) ? String(object.error) : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.result !== undefined &&
            (obj.result =
                message.result !== undefined
                    ? base64FromBytes(message.result)
                    : undefined);
        message.error !== undefined && (obj.error = message.error);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseAcknowledgement();
        message.result = object.result ?? undefined;
        message.error = object.error ?? undefined;
        return message;
    },
    fromProtoMsg(message) {
        return Acknowledgement.decode(message.value);
    },
    toProto(message) {
        return Acknowledgement.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.core.channel.v1.Acknowledgement',
            value: Acknowledgement.encode(message).finish(),
        };
    },
};
//# sourceMappingURL=channel.js.map