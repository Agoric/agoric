//@ts-nocheck
import { Params as Params1 } from '../../controller/v1/controller.js';
import {} from '../../controller/v1/controller.js';
import { Params as Params2 } from '../../host/v1/host.js';
import {} from '../../host/v1/host.js';
import { BinaryReader, BinaryWriter } from '../../../../../binary.js';
import { isSet } from '../../../../../helpers.js';
import {} from '../../../../../json-safe.js';
function createBaseGenesisState() {
    return {
        controllerGenesisState: ControllerGenesisState.fromPartial({}),
        hostGenesisState: HostGenesisState.fromPartial({}),
    };
}
export const GenesisState = {
    typeUrl: '/ibc.applications.interchain_accounts.genesis.v1.GenesisState',
    encode(message, writer = BinaryWriter.create()) {
        if (message.controllerGenesisState !== undefined) {
            ControllerGenesisState.encode(message.controllerGenesisState, writer.uint32(10).fork()).ldelim();
        }
        if (message.hostGenesisState !== undefined) {
            HostGenesisState.encode(message.hostGenesisState, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseGenesisState();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.controllerGenesisState = ControllerGenesisState.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.hostGenesisState = HostGenesisState.decode(reader, reader.uint32());
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
            controllerGenesisState: isSet(object.controllerGenesisState)
                ? ControllerGenesisState.fromJSON(object.controllerGenesisState)
                : undefined,
            hostGenesisState: isSet(object.hostGenesisState)
                ? HostGenesisState.fromJSON(object.hostGenesisState)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.controllerGenesisState !== undefined &&
            (obj.controllerGenesisState = message.controllerGenesisState
                ? ControllerGenesisState.toJSON(message.controllerGenesisState)
                : undefined);
        message.hostGenesisState !== undefined &&
            (obj.hostGenesisState = message.hostGenesisState
                ? HostGenesisState.toJSON(message.hostGenesisState)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseGenesisState();
        message.controllerGenesisState =
            object.controllerGenesisState !== undefined &&
                object.controllerGenesisState !== null
                ? ControllerGenesisState.fromPartial(object.controllerGenesisState)
                : undefined;
        message.hostGenesisState =
            object.hostGenesisState !== undefined && object.hostGenesisState !== null
                ? HostGenesisState.fromPartial(object.hostGenesisState)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return GenesisState.decode(message.value);
    },
    toProto(message) {
        return GenesisState.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.applications.interchain_accounts.genesis.v1.GenesisState',
            value: GenesisState.encode(message).finish(),
        };
    },
};
function createBaseControllerGenesisState() {
    return {
        activeChannels: [],
        interchainAccounts: [],
        ports: [],
        params: Params1.fromPartial({}),
    };
}
export const ControllerGenesisState = {
    typeUrl: '/ibc.applications.interchain_accounts.genesis.v1.ControllerGenesisState',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.activeChannels) {
            ActiveChannel.encode(v, writer.uint32(10).fork()).ldelim();
        }
        for (const v of message.interchainAccounts) {
            RegisteredInterchainAccount.encode(v, writer.uint32(18).fork()).ldelim();
        }
        for (const v of message.ports) {
            writer.uint32(26).string(v);
        }
        if (message.params !== undefined) {
            Params1.encode(message.params, writer.uint32(34).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseControllerGenesisState();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.activeChannels.push(ActiveChannel.decode(reader, reader.uint32()));
                    break;
                case 2:
                    message.interchainAccounts.push(RegisteredInterchainAccount.decode(reader, reader.uint32()));
                    break;
                case 3:
                    message.ports.push(reader.string());
                    break;
                case 4:
                    message.params = Params1.decode(reader, reader.uint32());
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
            activeChannels: Array.isArray(object?.activeChannels)
                ? object.activeChannels.map((e) => ActiveChannel.fromJSON(e))
                : [],
            interchainAccounts: Array.isArray(object?.interchainAccounts)
                ? object.interchainAccounts.map((e) => RegisteredInterchainAccount.fromJSON(e))
                : [],
            ports: Array.isArray(object?.ports)
                ? object.ports.map((e) => String(e))
                : [],
            params: isSet(object.params)
                ? Params1.fromJSON(object.params)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.activeChannels) {
            obj.activeChannels = message.activeChannels.map(e => e ? ActiveChannel.toJSON(e) : undefined);
        }
        else {
            obj.activeChannels = [];
        }
        if (message.interchainAccounts) {
            obj.interchainAccounts = message.interchainAccounts.map(e => e ? RegisteredInterchainAccount.toJSON(e) : undefined);
        }
        else {
            obj.interchainAccounts = [];
        }
        if (message.ports) {
            obj.ports = message.ports.map(e => e);
        }
        else {
            obj.ports = [];
        }
        message.params !== undefined &&
            (obj.params = message.params
                ? Params1.toJSON(message.params)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseControllerGenesisState();
        message.activeChannels =
            object.activeChannels?.map(e => ActiveChannel.fromPartial(e)) || [];
        message.interchainAccounts =
            object.interchainAccounts?.map(e => RegisteredInterchainAccount.fromPartial(e)) || [];
        message.ports = object.ports?.map(e => e) || [];
        message.params =
            object.params !== undefined && object.params !== null
                ? Params1.fromPartial(object.params)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return ControllerGenesisState.decode(message.value);
    },
    toProto(message) {
        return ControllerGenesisState.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.applications.interchain_accounts.genesis.v1.ControllerGenesisState',
            value: ControllerGenesisState.encode(message).finish(),
        };
    },
};
function createBaseHostGenesisState() {
    return {
        activeChannels: [],
        interchainAccounts: [],
        port: '',
        params: Params2.fromPartial({}),
    };
}
export const HostGenesisState = {
    typeUrl: '/ibc.applications.interchain_accounts.genesis.v1.HostGenesisState',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.activeChannels) {
            ActiveChannel.encode(v, writer.uint32(10).fork()).ldelim();
        }
        for (const v of message.interchainAccounts) {
            RegisteredInterchainAccount.encode(v, writer.uint32(18).fork()).ldelim();
        }
        if (message.port !== '') {
            writer.uint32(26).string(message.port);
        }
        if (message.params !== undefined) {
            Params2.encode(message.params, writer.uint32(34).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseHostGenesisState();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.activeChannels.push(ActiveChannel.decode(reader, reader.uint32()));
                    break;
                case 2:
                    message.interchainAccounts.push(RegisteredInterchainAccount.decode(reader, reader.uint32()));
                    break;
                case 3:
                    message.port = reader.string();
                    break;
                case 4:
                    message.params = Params2.decode(reader, reader.uint32());
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
            activeChannels: Array.isArray(object?.activeChannels)
                ? object.activeChannels.map((e) => ActiveChannel.fromJSON(e))
                : [],
            interchainAccounts: Array.isArray(object?.interchainAccounts)
                ? object.interchainAccounts.map((e) => RegisteredInterchainAccount.fromJSON(e))
                : [],
            port: isSet(object.port) ? String(object.port) : '',
            params: isSet(object.params)
                ? Params2.fromJSON(object.params)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.activeChannels) {
            obj.activeChannels = message.activeChannels.map(e => e ? ActiveChannel.toJSON(e) : undefined);
        }
        else {
            obj.activeChannels = [];
        }
        if (message.interchainAccounts) {
            obj.interchainAccounts = message.interchainAccounts.map(e => e ? RegisteredInterchainAccount.toJSON(e) : undefined);
        }
        else {
            obj.interchainAccounts = [];
        }
        message.port !== undefined && (obj.port = message.port);
        message.params !== undefined &&
            (obj.params = message.params
                ? Params2.toJSON(message.params)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseHostGenesisState();
        message.activeChannels =
            object.activeChannels?.map(e => ActiveChannel.fromPartial(e)) || [];
        message.interchainAccounts =
            object.interchainAccounts?.map(e => RegisteredInterchainAccount.fromPartial(e)) || [];
        message.port = object.port ?? '';
        message.params =
            object.params !== undefined && object.params !== null
                ? Params2.fromPartial(object.params)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return HostGenesisState.decode(message.value);
    },
    toProto(message) {
        return HostGenesisState.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.applications.interchain_accounts.genesis.v1.HostGenesisState',
            value: HostGenesisState.encode(message).finish(),
        };
    },
};
function createBaseActiveChannel() {
    return {
        connectionId: '',
        portId: '',
        channelId: '',
        isMiddlewareEnabled: false,
    };
}
export const ActiveChannel = {
    typeUrl: '/ibc.applications.interchain_accounts.genesis.v1.ActiveChannel',
    encode(message, writer = BinaryWriter.create()) {
        if (message.connectionId !== '') {
            writer.uint32(10).string(message.connectionId);
        }
        if (message.portId !== '') {
            writer.uint32(18).string(message.portId);
        }
        if (message.channelId !== '') {
            writer.uint32(26).string(message.channelId);
        }
        if (message.isMiddlewareEnabled === true) {
            writer.uint32(32).bool(message.isMiddlewareEnabled);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseActiveChannel();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.connectionId = reader.string();
                    break;
                case 2:
                    message.portId = reader.string();
                    break;
                case 3:
                    message.channelId = reader.string();
                    break;
                case 4:
                    message.isMiddlewareEnabled = reader.bool();
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
            connectionId: isSet(object.connectionId)
                ? String(object.connectionId)
                : '',
            portId: isSet(object.portId) ? String(object.portId) : '',
            channelId: isSet(object.channelId) ? String(object.channelId) : '',
            isMiddlewareEnabled: isSet(object.isMiddlewareEnabled)
                ? Boolean(object.isMiddlewareEnabled)
                : false,
        };
    },
    toJSON(message) {
        const obj = {};
        message.connectionId !== undefined &&
            (obj.connectionId = message.connectionId);
        message.portId !== undefined && (obj.portId = message.portId);
        message.channelId !== undefined && (obj.channelId = message.channelId);
        message.isMiddlewareEnabled !== undefined &&
            (obj.isMiddlewareEnabled = message.isMiddlewareEnabled);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseActiveChannel();
        message.connectionId = object.connectionId ?? '';
        message.portId = object.portId ?? '';
        message.channelId = object.channelId ?? '';
        message.isMiddlewareEnabled = object.isMiddlewareEnabled ?? false;
        return message;
    },
    fromProtoMsg(message) {
        return ActiveChannel.decode(message.value);
    },
    toProto(message) {
        return ActiveChannel.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.applications.interchain_accounts.genesis.v1.ActiveChannel',
            value: ActiveChannel.encode(message).finish(),
        };
    },
};
function createBaseRegisteredInterchainAccount() {
    return {
        connectionId: '',
        portId: '',
        accountAddress: '',
    };
}
export const RegisteredInterchainAccount = {
    typeUrl: '/ibc.applications.interchain_accounts.genesis.v1.RegisteredInterchainAccount',
    encode(message, writer = BinaryWriter.create()) {
        if (message.connectionId !== '') {
            writer.uint32(10).string(message.connectionId);
        }
        if (message.portId !== '') {
            writer.uint32(18).string(message.portId);
        }
        if (message.accountAddress !== '') {
            writer.uint32(26).string(message.accountAddress);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseRegisteredInterchainAccount();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.connectionId = reader.string();
                    break;
                case 2:
                    message.portId = reader.string();
                    break;
                case 3:
                    message.accountAddress = reader.string();
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
            connectionId: isSet(object.connectionId)
                ? String(object.connectionId)
                : '',
            portId: isSet(object.portId) ? String(object.portId) : '',
            accountAddress: isSet(object.accountAddress)
                ? String(object.accountAddress)
                : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.connectionId !== undefined &&
            (obj.connectionId = message.connectionId);
        message.portId !== undefined && (obj.portId = message.portId);
        message.accountAddress !== undefined &&
            (obj.accountAddress = message.accountAddress);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseRegisteredInterchainAccount();
        message.connectionId = object.connectionId ?? '';
        message.portId = object.portId ?? '';
        message.accountAddress = object.accountAddress ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return RegisteredInterchainAccount.decode(message.value);
    },
    toProto(message) {
        return RegisteredInterchainAccount.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.applications.interchain_accounts.genesis.v1.RegisteredInterchainAccount',
            value: RegisteredInterchainAccount.encode(message).finish(),
        };
    },
};
//# sourceMappingURL=genesis.js.map