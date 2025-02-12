//@ts-nocheck
import { BinaryReader, BinaryWriter } from '../../../../binary.js';
import { isSet } from '../../../../helpers.js';
import {} from '../../../../json-safe.js';
function createBaseAppDescriptor() {
    return {
        authn: undefined,
        chain: undefined,
        codec: undefined,
        configuration: undefined,
        queryServices: undefined,
        tx: undefined,
    };
}
export const AppDescriptor = {
    typeUrl: '/cosmos.base.reflection.v2alpha1.AppDescriptor',
    encode(message, writer = BinaryWriter.create()) {
        if (message.authn !== undefined) {
            AuthnDescriptor.encode(message.authn, writer.uint32(10).fork()).ldelim();
        }
        if (message.chain !== undefined) {
            ChainDescriptor.encode(message.chain, writer.uint32(18).fork()).ldelim();
        }
        if (message.codec !== undefined) {
            CodecDescriptor.encode(message.codec, writer.uint32(26).fork()).ldelim();
        }
        if (message.configuration !== undefined) {
            ConfigurationDescriptor.encode(message.configuration, writer.uint32(34).fork()).ldelim();
        }
        if (message.queryServices !== undefined) {
            QueryServicesDescriptor.encode(message.queryServices, writer.uint32(42).fork()).ldelim();
        }
        if (message.tx !== undefined) {
            TxDescriptor.encode(message.tx, writer.uint32(50).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseAppDescriptor();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.authn = AuthnDescriptor.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.chain = ChainDescriptor.decode(reader, reader.uint32());
                    break;
                case 3:
                    message.codec = CodecDescriptor.decode(reader, reader.uint32());
                    break;
                case 4:
                    message.configuration = ConfigurationDescriptor.decode(reader, reader.uint32());
                    break;
                case 5:
                    message.queryServices = QueryServicesDescriptor.decode(reader, reader.uint32());
                    break;
                case 6:
                    message.tx = TxDescriptor.decode(reader, reader.uint32());
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
            authn: isSet(object.authn)
                ? AuthnDescriptor.fromJSON(object.authn)
                : undefined,
            chain: isSet(object.chain)
                ? ChainDescriptor.fromJSON(object.chain)
                : undefined,
            codec: isSet(object.codec)
                ? CodecDescriptor.fromJSON(object.codec)
                : undefined,
            configuration: isSet(object.configuration)
                ? ConfigurationDescriptor.fromJSON(object.configuration)
                : undefined,
            queryServices: isSet(object.queryServices)
                ? QueryServicesDescriptor.fromJSON(object.queryServices)
                : undefined,
            tx: isSet(object.tx) ? TxDescriptor.fromJSON(object.tx) : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.authn !== undefined &&
            (obj.authn = message.authn
                ? AuthnDescriptor.toJSON(message.authn)
                : undefined);
        message.chain !== undefined &&
            (obj.chain = message.chain
                ? ChainDescriptor.toJSON(message.chain)
                : undefined);
        message.codec !== undefined &&
            (obj.codec = message.codec
                ? CodecDescriptor.toJSON(message.codec)
                : undefined);
        message.configuration !== undefined &&
            (obj.configuration = message.configuration
                ? ConfigurationDescriptor.toJSON(message.configuration)
                : undefined);
        message.queryServices !== undefined &&
            (obj.queryServices = message.queryServices
                ? QueryServicesDescriptor.toJSON(message.queryServices)
                : undefined);
        message.tx !== undefined &&
            (obj.tx = message.tx ? TxDescriptor.toJSON(message.tx) : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseAppDescriptor();
        message.authn =
            object.authn !== undefined && object.authn !== null
                ? AuthnDescriptor.fromPartial(object.authn)
                : undefined;
        message.chain =
            object.chain !== undefined && object.chain !== null
                ? ChainDescriptor.fromPartial(object.chain)
                : undefined;
        message.codec =
            object.codec !== undefined && object.codec !== null
                ? CodecDescriptor.fromPartial(object.codec)
                : undefined;
        message.configuration =
            object.configuration !== undefined && object.configuration !== null
                ? ConfigurationDescriptor.fromPartial(object.configuration)
                : undefined;
        message.queryServices =
            object.queryServices !== undefined && object.queryServices !== null
                ? QueryServicesDescriptor.fromPartial(object.queryServices)
                : undefined;
        message.tx =
            object.tx !== undefined && object.tx !== null
                ? TxDescriptor.fromPartial(object.tx)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return AppDescriptor.decode(message.value);
    },
    toProto(message) {
        return AppDescriptor.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.base.reflection.v2alpha1.AppDescriptor',
            value: AppDescriptor.encode(message).finish(),
        };
    },
};
function createBaseTxDescriptor() {
    return {
        fullname: '',
        msgs: [],
    };
}
export const TxDescriptor = {
    typeUrl: '/cosmos.base.reflection.v2alpha1.TxDescriptor',
    encode(message, writer = BinaryWriter.create()) {
        if (message.fullname !== '') {
            writer.uint32(10).string(message.fullname);
        }
        for (const v of message.msgs) {
            MsgDescriptor.encode(v, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseTxDescriptor();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.fullname = reader.string();
                    break;
                case 2:
                    message.msgs.push(MsgDescriptor.decode(reader, reader.uint32()));
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
            fullname: isSet(object.fullname) ? String(object.fullname) : '',
            msgs: Array.isArray(object?.msgs)
                ? object.msgs.map((e) => MsgDescriptor.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        message.fullname !== undefined && (obj.fullname = message.fullname);
        if (message.msgs) {
            obj.msgs = message.msgs.map(e => e ? MsgDescriptor.toJSON(e) : undefined);
        }
        else {
            obj.msgs = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseTxDescriptor();
        message.fullname = object.fullname ?? '';
        message.msgs = object.msgs?.map(e => MsgDescriptor.fromPartial(e)) || [];
        return message;
    },
    fromProtoMsg(message) {
        return TxDescriptor.decode(message.value);
    },
    toProto(message) {
        return TxDescriptor.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.base.reflection.v2alpha1.TxDescriptor',
            value: TxDescriptor.encode(message).finish(),
        };
    },
};
function createBaseAuthnDescriptor() {
    return {
        signModes: [],
    };
}
export const AuthnDescriptor = {
    typeUrl: '/cosmos.base.reflection.v2alpha1.AuthnDescriptor',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.signModes) {
            SigningModeDescriptor.encode(v, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseAuthnDescriptor();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.signModes.push(SigningModeDescriptor.decode(reader, reader.uint32()));
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
            signModes: Array.isArray(object?.signModes)
                ? object.signModes.map((e) => SigningModeDescriptor.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.signModes) {
            obj.signModes = message.signModes.map(e => e ? SigningModeDescriptor.toJSON(e) : undefined);
        }
        else {
            obj.signModes = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseAuthnDescriptor();
        message.signModes =
            object.signModes?.map(e => SigningModeDescriptor.fromPartial(e)) || [];
        return message;
    },
    fromProtoMsg(message) {
        return AuthnDescriptor.decode(message.value);
    },
    toProto(message) {
        return AuthnDescriptor.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.base.reflection.v2alpha1.AuthnDescriptor',
            value: AuthnDescriptor.encode(message).finish(),
        };
    },
};
function createBaseSigningModeDescriptor() {
    return {
        name: '',
        number: 0,
        authnInfoProviderMethodFullname: '',
    };
}
export const SigningModeDescriptor = {
    typeUrl: '/cosmos.base.reflection.v2alpha1.SigningModeDescriptor',
    encode(message, writer = BinaryWriter.create()) {
        if (message.name !== '') {
            writer.uint32(10).string(message.name);
        }
        if (message.number !== 0) {
            writer.uint32(16).int32(message.number);
        }
        if (message.authnInfoProviderMethodFullname !== '') {
            writer.uint32(26).string(message.authnInfoProviderMethodFullname);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseSigningModeDescriptor();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.name = reader.string();
                    break;
                case 2:
                    message.number = reader.int32();
                    break;
                case 3:
                    message.authnInfoProviderMethodFullname = reader.string();
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
            name: isSet(object.name) ? String(object.name) : '',
            number: isSet(object.number) ? Number(object.number) : 0,
            authnInfoProviderMethodFullname: isSet(object.authnInfoProviderMethodFullname)
                ? String(object.authnInfoProviderMethodFullname)
                : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.name !== undefined && (obj.name = message.name);
        message.number !== undefined && (obj.number = Math.round(message.number));
        message.authnInfoProviderMethodFullname !== undefined &&
            (obj.authnInfoProviderMethodFullname =
                message.authnInfoProviderMethodFullname);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseSigningModeDescriptor();
        message.name = object.name ?? '';
        message.number = object.number ?? 0;
        message.authnInfoProviderMethodFullname =
            object.authnInfoProviderMethodFullname ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return SigningModeDescriptor.decode(message.value);
    },
    toProto(message) {
        return SigningModeDescriptor.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.base.reflection.v2alpha1.SigningModeDescriptor',
            value: SigningModeDescriptor.encode(message).finish(),
        };
    },
};
function createBaseChainDescriptor() {
    return {
        id: '',
    };
}
export const ChainDescriptor = {
    typeUrl: '/cosmos.base.reflection.v2alpha1.ChainDescriptor',
    encode(message, writer = BinaryWriter.create()) {
        if (message.id !== '') {
            writer.uint32(10).string(message.id);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseChainDescriptor();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.id = reader.string();
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
        };
    },
    toJSON(message) {
        const obj = {};
        message.id !== undefined && (obj.id = message.id);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseChainDescriptor();
        message.id = object.id ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return ChainDescriptor.decode(message.value);
    },
    toProto(message) {
        return ChainDescriptor.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.base.reflection.v2alpha1.ChainDescriptor',
            value: ChainDescriptor.encode(message).finish(),
        };
    },
};
function createBaseCodecDescriptor() {
    return {
        interfaces: [],
    };
}
export const CodecDescriptor = {
    typeUrl: '/cosmos.base.reflection.v2alpha1.CodecDescriptor',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.interfaces) {
            InterfaceDescriptor.encode(v, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseCodecDescriptor();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.interfaces.push(InterfaceDescriptor.decode(reader, reader.uint32()));
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
            interfaces: Array.isArray(object?.interfaces)
                ? object.interfaces.map((e) => InterfaceDescriptor.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.interfaces) {
            obj.interfaces = message.interfaces.map(e => e ? InterfaceDescriptor.toJSON(e) : undefined);
        }
        else {
            obj.interfaces = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseCodecDescriptor();
        message.interfaces =
            object.interfaces?.map(e => InterfaceDescriptor.fromPartial(e)) || [];
        return message;
    },
    fromProtoMsg(message) {
        return CodecDescriptor.decode(message.value);
    },
    toProto(message) {
        return CodecDescriptor.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.base.reflection.v2alpha1.CodecDescriptor',
            value: CodecDescriptor.encode(message).finish(),
        };
    },
};
function createBaseInterfaceDescriptor() {
    return {
        fullname: '',
        interfaceAcceptingMessages: [],
        interfaceImplementers: [],
    };
}
export const InterfaceDescriptor = {
    typeUrl: '/cosmos.base.reflection.v2alpha1.InterfaceDescriptor',
    encode(message, writer = BinaryWriter.create()) {
        if (message.fullname !== '') {
            writer.uint32(10).string(message.fullname);
        }
        for (const v of message.interfaceAcceptingMessages) {
            InterfaceAcceptingMessageDescriptor.encode(v, writer.uint32(18).fork()).ldelim();
        }
        for (const v of message.interfaceImplementers) {
            InterfaceImplementerDescriptor.encode(v, writer.uint32(26).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseInterfaceDescriptor();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.fullname = reader.string();
                    break;
                case 2:
                    message.interfaceAcceptingMessages.push(InterfaceAcceptingMessageDescriptor.decode(reader, reader.uint32()));
                    break;
                case 3:
                    message.interfaceImplementers.push(InterfaceImplementerDescriptor.decode(reader, reader.uint32()));
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
            fullname: isSet(object.fullname) ? String(object.fullname) : '',
            interfaceAcceptingMessages: Array.isArray(object?.interfaceAcceptingMessages)
                ? object.interfaceAcceptingMessages.map((e) => InterfaceAcceptingMessageDescriptor.fromJSON(e))
                : [],
            interfaceImplementers: Array.isArray(object?.interfaceImplementers)
                ? object.interfaceImplementers.map((e) => InterfaceImplementerDescriptor.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        message.fullname !== undefined && (obj.fullname = message.fullname);
        if (message.interfaceAcceptingMessages) {
            obj.interfaceAcceptingMessages = message.interfaceAcceptingMessages.map(e => (e ? InterfaceAcceptingMessageDescriptor.toJSON(e) : undefined));
        }
        else {
            obj.interfaceAcceptingMessages = [];
        }
        if (message.interfaceImplementers) {
            obj.interfaceImplementers = message.interfaceImplementers.map(e => e ? InterfaceImplementerDescriptor.toJSON(e) : undefined);
        }
        else {
            obj.interfaceImplementers = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseInterfaceDescriptor();
        message.fullname = object.fullname ?? '';
        message.interfaceAcceptingMessages =
            object.interfaceAcceptingMessages?.map(e => InterfaceAcceptingMessageDescriptor.fromPartial(e)) || [];
        message.interfaceImplementers =
            object.interfaceImplementers?.map(e => InterfaceImplementerDescriptor.fromPartial(e)) || [];
        return message;
    },
    fromProtoMsg(message) {
        return InterfaceDescriptor.decode(message.value);
    },
    toProto(message) {
        return InterfaceDescriptor.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.base.reflection.v2alpha1.InterfaceDescriptor',
            value: InterfaceDescriptor.encode(message).finish(),
        };
    },
};
function createBaseInterfaceImplementerDescriptor() {
    return {
        fullname: '',
        typeUrl: '',
    };
}
export const InterfaceImplementerDescriptor = {
    typeUrl: '/cosmos.base.reflection.v2alpha1.InterfaceImplementerDescriptor',
    encode(message, writer = BinaryWriter.create()) {
        if (message.fullname !== '') {
            writer.uint32(10).string(message.fullname);
        }
        if (message.typeUrl !== '') {
            writer.uint32(18).string(message.typeUrl);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseInterfaceImplementerDescriptor();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.fullname = reader.string();
                    break;
                case 2:
                    message.typeUrl = reader.string();
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
            fullname: isSet(object.fullname) ? String(object.fullname) : '',
            typeUrl: isSet(object.typeUrl) ? String(object.typeUrl) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.fullname !== undefined && (obj.fullname = message.fullname);
        message.typeUrl !== undefined && (obj.typeUrl = message.typeUrl);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseInterfaceImplementerDescriptor();
        message.fullname = object.fullname ?? '';
        message.typeUrl = object.typeUrl ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return InterfaceImplementerDescriptor.decode(message.value);
    },
    toProto(message) {
        return InterfaceImplementerDescriptor.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.base.reflection.v2alpha1.InterfaceImplementerDescriptor',
            value: InterfaceImplementerDescriptor.encode(message).finish(),
        };
    },
};
function createBaseInterfaceAcceptingMessageDescriptor() {
    return {
        fullname: '',
        fieldDescriptorNames: [],
    };
}
export const InterfaceAcceptingMessageDescriptor = {
    typeUrl: '/cosmos.base.reflection.v2alpha1.InterfaceAcceptingMessageDescriptor',
    encode(message, writer = BinaryWriter.create()) {
        if (message.fullname !== '') {
            writer.uint32(10).string(message.fullname);
        }
        for (const v of message.fieldDescriptorNames) {
            writer.uint32(18).string(v);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseInterfaceAcceptingMessageDescriptor();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.fullname = reader.string();
                    break;
                case 2:
                    message.fieldDescriptorNames.push(reader.string());
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
            fullname: isSet(object.fullname) ? String(object.fullname) : '',
            fieldDescriptorNames: Array.isArray(object?.fieldDescriptorNames)
                ? object.fieldDescriptorNames.map((e) => String(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        message.fullname !== undefined && (obj.fullname = message.fullname);
        if (message.fieldDescriptorNames) {
            obj.fieldDescriptorNames = message.fieldDescriptorNames.map(e => e);
        }
        else {
            obj.fieldDescriptorNames = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseInterfaceAcceptingMessageDescriptor();
        message.fullname = object.fullname ?? '';
        message.fieldDescriptorNames =
            object.fieldDescriptorNames?.map(e => e) || [];
        return message;
    },
    fromProtoMsg(message) {
        return InterfaceAcceptingMessageDescriptor.decode(message.value);
    },
    toProto(message) {
        return InterfaceAcceptingMessageDescriptor.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.base.reflection.v2alpha1.InterfaceAcceptingMessageDescriptor',
            value: InterfaceAcceptingMessageDescriptor.encode(message).finish(),
        };
    },
};
function createBaseConfigurationDescriptor() {
    return {
        bech32AccountAddressPrefix: '',
    };
}
export const ConfigurationDescriptor = {
    typeUrl: '/cosmos.base.reflection.v2alpha1.ConfigurationDescriptor',
    encode(message, writer = BinaryWriter.create()) {
        if (message.bech32AccountAddressPrefix !== '') {
            writer.uint32(10).string(message.bech32AccountAddressPrefix);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseConfigurationDescriptor();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.bech32AccountAddressPrefix = reader.string();
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
            bech32AccountAddressPrefix: isSet(object.bech32AccountAddressPrefix)
                ? String(object.bech32AccountAddressPrefix)
                : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.bech32AccountAddressPrefix !== undefined &&
            (obj.bech32AccountAddressPrefix = message.bech32AccountAddressPrefix);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseConfigurationDescriptor();
        message.bech32AccountAddressPrefix =
            object.bech32AccountAddressPrefix ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return ConfigurationDescriptor.decode(message.value);
    },
    toProto(message) {
        return ConfigurationDescriptor.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.base.reflection.v2alpha1.ConfigurationDescriptor',
            value: ConfigurationDescriptor.encode(message).finish(),
        };
    },
};
function createBaseMsgDescriptor() {
    return {
        msgTypeUrl: '',
    };
}
export const MsgDescriptor = {
    typeUrl: '/cosmos.base.reflection.v2alpha1.MsgDescriptor',
    encode(message, writer = BinaryWriter.create()) {
        if (message.msgTypeUrl !== '') {
            writer.uint32(10).string(message.msgTypeUrl);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgDescriptor();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.msgTypeUrl = reader.string();
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
            msgTypeUrl: isSet(object.msgTypeUrl) ? String(object.msgTypeUrl) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.msgTypeUrl !== undefined && (obj.msgTypeUrl = message.msgTypeUrl);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgDescriptor();
        message.msgTypeUrl = object.msgTypeUrl ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return MsgDescriptor.decode(message.value);
    },
    toProto(message) {
        return MsgDescriptor.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.base.reflection.v2alpha1.MsgDescriptor',
            value: MsgDescriptor.encode(message).finish(),
        };
    },
};
function createBaseGetAuthnDescriptorRequest() {
    return {};
}
export const GetAuthnDescriptorRequest = {
    typeUrl: '/cosmos.base.reflection.v2alpha1.GetAuthnDescriptorRequest',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseGetAuthnDescriptorRequest();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON(_) {
        return {};
    },
    toJSON(_) {
        const obj = {};
        return obj;
    },
    fromPartial(_) {
        const message = createBaseGetAuthnDescriptorRequest();
        return message;
    },
    fromProtoMsg(message) {
        return GetAuthnDescriptorRequest.decode(message.value);
    },
    toProto(message) {
        return GetAuthnDescriptorRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.base.reflection.v2alpha1.GetAuthnDescriptorRequest',
            value: GetAuthnDescriptorRequest.encode(message).finish(),
        };
    },
};
function createBaseGetAuthnDescriptorResponse() {
    return {
        authn: undefined,
    };
}
export const GetAuthnDescriptorResponse = {
    typeUrl: '/cosmos.base.reflection.v2alpha1.GetAuthnDescriptorResponse',
    encode(message, writer = BinaryWriter.create()) {
        if (message.authn !== undefined) {
            AuthnDescriptor.encode(message.authn, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseGetAuthnDescriptorResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.authn = AuthnDescriptor.decode(reader, reader.uint32());
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
            authn: isSet(object.authn)
                ? AuthnDescriptor.fromJSON(object.authn)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.authn !== undefined &&
            (obj.authn = message.authn
                ? AuthnDescriptor.toJSON(message.authn)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseGetAuthnDescriptorResponse();
        message.authn =
            object.authn !== undefined && object.authn !== null
                ? AuthnDescriptor.fromPartial(object.authn)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return GetAuthnDescriptorResponse.decode(message.value);
    },
    toProto(message) {
        return GetAuthnDescriptorResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.base.reflection.v2alpha1.GetAuthnDescriptorResponse',
            value: GetAuthnDescriptorResponse.encode(message).finish(),
        };
    },
};
function createBaseGetChainDescriptorRequest() {
    return {};
}
export const GetChainDescriptorRequest = {
    typeUrl: '/cosmos.base.reflection.v2alpha1.GetChainDescriptorRequest',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseGetChainDescriptorRequest();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON(_) {
        return {};
    },
    toJSON(_) {
        const obj = {};
        return obj;
    },
    fromPartial(_) {
        const message = createBaseGetChainDescriptorRequest();
        return message;
    },
    fromProtoMsg(message) {
        return GetChainDescriptorRequest.decode(message.value);
    },
    toProto(message) {
        return GetChainDescriptorRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.base.reflection.v2alpha1.GetChainDescriptorRequest',
            value: GetChainDescriptorRequest.encode(message).finish(),
        };
    },
};
function createBaseGetChainDescriptorResponse() {
    return {
        chain: undefined,
    };
}
export const GetChainDescriptorResponse = {
    typeUrl: '/cosmos.base.reflection.v2alpha1.GetChainDescriptorResponse',
    encode(message, writer = BinaryWriter.create()) {
        if (message.chain !== undefined) {
            ChainDescriptor.encode(message.chain, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseGetChainDescriptorResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.chain = ChainDescriptor.decode(reader, reader.uint32());
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
            chain: isSet(object.chain)
                ? ChainDescriptor.fromJSON(object.chain)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.chain !== undefined &&
            (obj.chain = message.chain
                ? ChainDescriptor.toJSON(message.chain)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseGetChainDescriptorResponse();
        message.chain =
            object.chain !== undefined && object.chain !== null
                ? ChainDescriptor.fromPartial(object.chain)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return GetChainDescriptorResponse.decode(message.value);
    },
    toProto(message) {
        return GetChainDescriptorResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.base.reflection.v2alpha1.GetChainDescriptorResponse',
            value: GetChainDescriptorResponse.encode(message).finish(),
        };
    },
};
function createBaseGetCodecDescriptorRequest() {
    return {};
}
export const GetCodecDescriptorRequest = {
    typeUrl: '/cosmos.base.reflection.v2alpha1.GetCodecDescriptorRequest',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseGetCodecDescriptorRequest();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON(_) {
        return {};
    },
    toJSON(_) {
        const obj = {};
        return obj;
    },
    fromPartial(_) {
        const message = createBaseGetCodecDescriptorRequest();
        return message;
    },
    fromProtoMsg(message) {
        return GetCodecDescriptorRequest.decode(message.value);
    },
    toProto(message) {
        return GetCodecDescriptorRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.base.reflection.v2alpha1.GetCodecDescriptorRequest',
            value: GetCodecDescriptorRequest.encode(message).finish(),
        };
    },
};
function createBaseGetCodecDescriptorResponse() {
    return {
        codec: undefined,
    };
}
export const GetCodecDescriptorResponse = {
    typeUrl: '/cosmos.base.reflection.v2alpha1.GetCodecDescriptorResponse',
    encode(message, writer = BinaryWriter.create()) {
        if (message.codec !== undefined) {
            CodecDescriptor.encode(message.codec, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseGetCodecDescriptorResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.codec = CodecDescriptor.decode(reader, reader.uint32());
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
            codec: isSet(object.codec)
                ? CodecDescriptor.fromJSON(object.codec)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.codec !== undefined &&
            (obj.codec = message.codec
                ? CodecDescriptor.toJSON(message.codec)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseGetCodecDescriptorResponse();
        message.codec =
            object.codec !== undefined && object.codec !== null
                ? CodecDescriptor.fromPartial(object.codec)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return GetCodecDescriptorResponse.decode(message.value);
    },
    toProto(message) {
        return GetCodecDescriptorResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.base.reflection.v2alpha1.GetCodecDescriptorResponse',
            value: GetCodecDescriptorResponse.encode(message).finish(),
        };
    },
};
function createBaseGetConfigurationDescriptorRequest() {
    return {};
}
export const GetConfigurationDescriptorRequest = {
    typeUrl: '/cosmos.base.reflection.v2alpha1.GetConfigurationDescriptorRequest',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseGetConfigurationDescriptorRequest();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON(_) {
        return {};
    },
    toJSON(_) {
        const obj = {};
        return obj;
    },
    fromPartial(_) {
        const message = createBaseGetConfigurationDescriptorRequest();
        return message;
    },
    fromProtoMsg(message) {
        return GetConfigurationDescriptorRequest.decode(message.value);
    },
    toProto(message) {
        return GetConfigurationDescriptorRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.base.reflection.v2alpha1.GetConfigurationDescriptorRequest',
            value: GetConfigurationDescriptorRequest.encode(message).finish(),
        };
    },
};
function createBaseGetConfigurationDescriptorResponse() {
    return {
        config: undefined,
    };
}
export const GetConfigurationDescriptorResponse = {
    typeUrl: '/cosmos.base.reflection.v2alpha1.GetConfigurationDescriptorResponse',
    encode(message, writer = BinaryWriter.create()) {
        if (message.config !== undefined) {
            ConfigurationDescriptor.encode(message.config, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseGetConfigurationDescriptorResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.config = ConfigurationDescriptor.decode(reader, reader.uint32());
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
            config: isSet(object.config)
                ? ConfigurationDescriptor.fromJSON(object.config)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.config !== undefined &&
            (obj.config = message.config
                ? ConfigurationDescriptor.toJSON(message.config)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseGetConfigurationDescriptorResponse();
        message.config =
            object.config !== undefined && object.config !== null
                ? ConfigurationDescriptor.fromPartial(object.config)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return GetConfigurationDescriptorResponse.decode(message.value);
    },
    toProto(message) {
        return GetConfigurationDescriptorResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.base.reflection.v2alpha1.GetConfigurationDescriptorResponse',
            value: GetConfigurationDescriptorResponse.encode(message).finish(),
        };
    },
};
function createBaseGetQueryServicesDescriptorRequest() {
    return {};
}
export const GetQueryServicesDescriptorRequest = {
    typeUrl: '/cosmos.base.reflection.v2alpha1.GetQueryServicesDescriptorRequest',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseGetQueryServicesDescriptorRequest();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON(_) {
        return {};
    },
    toJSON(_) {
        const obj = {};
        return obj;
    },
    fromPartial(_) {
        const message = createBaseGetQueryServicesDescriptorRequest();
        return message;
    },
    fromProtoMsg(message) {
        return GetQueryServicesDescriptorRequest.decode(message.value);
    },
    toProto(message) {
        return GetQueryServicesDescriptorRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.base.reflection.v2alpha1.GetQueryServicesDescriptorRequest',
            value: GetQueryServicesDescriptorRequest.encode(message).finish(),
        };
    },
};
function createBaseGetQueryServicesDescriptorResponse() {
    return {
        queries: undefined,
    };
}
export const GetQueryServicesDescriptorResponse = {
    typeUrl: '/cosmos.base.reflection.v2alpha1.GetQueryServicesDescriptorResponse',
    encode(message, writer = BinaryWriter.create()) {
        if (message.queries !== undefined) {
            QueryServicesDescriptor.encode(message.queries, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseGetQueryServicesDescriptorResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.queries = QueryServicesDescriptor.decode(reader, reader.uint32());
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
            queries: isSet(object.queries)
                ? QueryServicesDescriptor.fromJSON(object.queries)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.queries !== undefined &&
            (obj.queries = message.queries
                ? QueryServicesDescriptor.toJSON(message.queries)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseGetQueryServicesDescriptorResponse();
        message.queries =
            object.queries !== undefined && object.queries !== null
                ? QueryServicesDescriptor.fromPartial(object.queries)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return GetQueryServicesDescriptorResponse.decode(message.value);
    },
    toProto(message) {
        return GetQueryServicesDescriptorResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.base.reflection.v2alpha1.GetQueryServicesDescriptorResponse',
            value: GetQueryServicesDescriptorResponse.encode(message).finish(),
        };
    },
};
function createBaseGetTxDescriptorRequest() {
    return {};
}
export const GetTxDescriptorRequest = {
    typeUrl: '/cosmos.base.reflection.v2alpha1.GetTxDescriptorRequest',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseGetTxDescriptorRequest();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON(_) {
        return {};
    },
    toJSON(_) {
        const obj = {};
        return obj;
    },
    fromPartial(_) {
        const message = createBaseGetTxDescriptorRequest();
        return message;
    },
    fromProtoMsg(message) {
        return GetTxDescriptorRequest.decode(message.value);
    },
    toProto(message) {
        return GetTxDescriptorRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.base.reflection.v2alpha1.GetTxDescriptorRequest',
            value: GetTxDescriptorRequest.encode(message).finish(),
        };
    },
};
function createBaseGetTxDescriptorResponse() {
    return {
        tx: undefined,
    };
}
export const GetTxDescriptorResponse = {
    typeUrl: '/cosmos.base.reflection.v2alpha1.GetTxDescriptorResponse',
    encode(message, writer = BinaryWriter.create()) {
        if (message.tx !== undefined) {
            TxDescriptor.encode(message.tx, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseGetTxDescriptorResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.tx = TxDescriptor.decode(reader, reader.uint32());
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
            tx: isSet(object.tx) ? TxDescriptor.fromJSON(object.tx) : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.tx !== undefined &&
            (obj.tx = message.tx ? TxDescriptor.toJSON(message.tx) : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseGetTxDescriptorResponse();
        message.tx =
            object.tx !== undefined && object.tx !== null
                ? TxDescriptor.fromPartial(object.tx)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return GetTxDescriptorResponse.decode(message.value);
    },
    toProto(message) {
        return GetTxDescriptorResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.base.reflection.v2alpha1.GetTxDescriptorResponse',
            value: GetTxDescriptorResponse.encode(message).finish(),
        };
    },
};
function createBaseQueryServicesDescriptor() {
    return {
        queryServices: [],
    };
}
export const QueryServicesDescriptor = {
    typeUrl: '/cosmos.base.reflection.v2alpha1.QueryServicesDescriptor',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.queryServices) {
            QueryServiceDescriptor.encode(v, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryServicesDescriptor();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.queryServices.push(QueryServiceDescriptor.decode(reader, reader.uint32()));
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
            queryServices: Array.isArray(object?.queryServices)
                ? object.queryServices.map((e) => QueryServiceDescriptor.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.queryServices) {
            obj.queryServices = message.queryServices.map(e => e ? QueryServiceDescriptor.toJSON(e) : undefined);
        }
        else {
            obj.queryServices = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryServicesDescriptor();
        message.queryServices =
            object.queryServices?.map(e => QueryServiceDescriptor.fromPartial(e)) ||
                [];
        return message;
    },
    fromProtoMsg(message) {
        return QueryServicesDescriptor.decode(message.value);
    },
    toProto(message) {
        return QueryServicesDescriptor.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.base.reflection.v2alpha1.QueryServicesDescriptor',
            value: QueryServicesDescriptor.encode(message).finish(),
        };
    },
};
function createBaseQueryServiceDescriptor() {
    return {
        fullname: '',
        isModule: false,
        methods: [],
    };
}
export const QueryServiceDescriptor = {
    typeUrl: '/cosmos.base.reflection.v2alpha1.QueryServiceDescriptor',
    encode(message, writer = BinaryWriter.create()) {
        if (message.fullname !== '') {
            writer.uint32(10).string(message.fullname);
        }
        if (message.isModule === true) {
            writer.uint32(16).bool(message.isModule);
        }
        for (const v of message.methods) {
            QueryMethodDescriptor.encode(v, writer.uint32(26).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryServiceDescriptor();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.fullname = reader.string();
                    break;
                case 2:
                    message.isModule = reader.bool();
                    break;
                case 3:
                    message.methods.push(QueryMethodDescriptor.decode(reader, reader.uint32()));
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
            fullname: isSet(object.fullname) ? String(object.fullname) : '',
            isModule: isSet(object.isModule) ? Boolean(object.isModule) : false,
            methods: Array.isArray(object?.methods)
                ? object.methods.map((e) => QueryMethodDescriptor.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        message.fullname !== undefined && (obj.fullname = message.fullname);
        message.isModule !== undefined && (obj.isModule = message.isModule);
        if (message.methods) {
            obj.methods = message.methods.map(e => e ? QueryMethodDescriptor.toJSON(e) : undefined);
        }
        else {
            obj.methods = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryServiceDescriptor();
        message.fullname = object.fullname ?? '';
        message.isModule = object.isModule ?? false;
        message.methods =
            object.methods?.map(e => QueryMethodDescriptor.fromPartial(e)) || [];
        return message;
    },
    fromProtoMsg(message) {
        return QueryServiceDescriptor.decode(message.value);
    },
    toProto(message) {
        return QueryServiceDescriptor.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.base.reflection.v2alpha1.QueryServiceDescriptor',
            value: QueryServiceDescriptor.encode(message).finish(),
        };
    },
};
function createBaseQueryMethodDescriptor() {
    return {
        name: '',
        fullQueryPath: '',
    };
}
export const QueryMethodDescriptor = {
    typeUrl: '/cosmos.base.reflection.v2alpha1.QueryMethodDescriptor',
    encode(message, writer = BinaryWriter.create()) {
        if (message.name !== '') {
            writer.uint32(10).string(message.name);
        }
        if (message.fullQueryPath !== '') {
            writer.uint32(18).string(message.fullQueryPath);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryMethodDescriptor();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.name = reader.string();
                    break;
                case 2:
                    message.fullQueryPath = reader.string();
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
            name: isSet(object.name) ? String(object.name) : '',
            fullQueryPath: isSet(object.fullQueryPath)
                ? String(object.fullQueryPath)
                : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.name !== undefined && (obj.name = message.name);
        message.fullQueryPath !== undefined &&
            (obj.fullQueryPath = message.fullQueryPath);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryMethodDescriptor();
        message.name = object.name ?? '';
        message.fullQueryPath = object.fullQueryPath ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return QueryMethodDescriptor.decode(message.value);
    },
    toProto(message) {
        return QueryMethodDescriptor.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.base.reflection.v2alpha1.QueryMethodDescriptor',
            value: QueryMethodDescriptor.encode(message).finish(),
        };
    },
};
//# sourceMappingURL=reflection.js.map