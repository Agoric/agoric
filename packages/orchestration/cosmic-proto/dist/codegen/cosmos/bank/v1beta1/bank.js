//@ts-nocheck
import { Coin } from '../../base/v1beta1/coin.js';
import { BinaryReader, BinaryWriter } from '../../../binary.js';
import { isSet } from '../../../helpers.js';
import {} from '../../../json-safe.js';
function createBaseParams() {
    return {
        sendEnabled: [],
        defaultSendEnabled: false,
    };
}
export const Params = {
    typeUrl: '/cosmos.bank.v1beta1.Params',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.sendEnabled) {
            SendEnabled.encode(v, writer.uint32(10).fork()).ldelim();
        }
        if (message.defaultSendEnabled === true) {
            writer.uint32(16).bool(message.defaultSendEnabled);
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
                    message.sendEnabled.push(SendEnabled.decode(reader, reader.uint32()));
                    break;
                case 2:
                    message.defaultSendEnabled = reader.bool();
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
            sendEnabled: Array.isArray(object?.sendEnabled)
                ? object.sendEnabled.map((e) => SendEnabled.fromJSON(e))
                : [],
            defaultSendEnabled: isSet(object.defaultSendEnabled)
                ? Boolean(object.defaultSendEnabled)
                : false,
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.sendEnabled) {
            obj.sendEnabled = message.sendEnabled.map(e => e ? SendEnabled.toJSON(e) : undefined);
        }
        else {
            obj.sendEnabled = [];
        }
        message.defaultSendEnabled !== undefined &&
            (obj.defaultSendEnabled = message.defaultSendEnabled);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseParams();
        message.sendEnabled =
            object.sendEnabled?.map(e => SendEnabled.fromPartial(e)) || [];
        message.defaultSendEnabled = object.defaultSendEnabled ?? false;
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
            typeUrl: '/cosmos.bank.v1beta1.Params',
            value: Params.encode(message).finish(),
        };
    },
};
function createBaseSendEnabled() {
    return {
        denom: '',
        enabled: false,
    };
}
export const SendEnabled = {
    typeUrl: '/cosmos.bank.v1beta1.SendEnabled',
    encode(message, writer = BinaryWriter.create()) {
        if (message.denom !== '') {
            writer.uint32(10).string(message.denom);
        }
        if (message.enabled === true) {
            writer.uint32(16).bool(message.enabled);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseSendEnabled();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.denom = reader.string();
                    break;
                case 2:
                    message.enabled = reader.bool();
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
            denom: isSet(object.denom) ? String(object.denom) : '',
            enabled: isSet(object.enabled) ? Boolean(object.enabled) : false,
        };
    },
    toJSON(message) {
        const obj = {};
        message.denom !== undefined && (obj.denom = message.denom);
        message.enabled !== undefined && (obj.enabled = message.enabled);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseSendEnabled();
        message.denom = object.denom ?? '';
        message.enabled = object.enabled ?? false;
        return message;
    },
    fromProtoMsg(message) {
        return SendEnabled.decode(message.value);
    },
    toProto(message) {
        return SendEnabled.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.bank.v1beta1.SendEnabled',
            value: SendEnabled.encode(message).finish(),
        };
    },
};
function createBaseInput() {
    return {
        address: '',
        coins: [],
    };
}
export const Input = {
    typeUrl: '/cosmos.bank.v1beta1.Input',
    encode(message, writer = BinaryWriter.create()) {
        if (message.address !== '') {
            writer.uint32(10).string(message.address);
        }
        for (const v of message.coins) {
            Coin.encode(v, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseInput();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.address = reader.string();
                    break;
                case 2:
                    message.coins.push(Coin.decode(reader, reader.uint32()));
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
            address: isSet(object.address) ? String(object.address) : '',
            coins: Array.isArray(object?.coins)
                ? object.coins.map((e) => Coin.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        message.address !== undefined && (obj.address = message.address);
        if (message.coins) {
            obj.coins = message.coins.map(e => (e ? Coin.toJSON(e) : undefined));
        }
        else {
            obj.coins = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseInput();
        message.address = object.address ?? '';
        message.coins = object.coins?.map(e => Coin.fromPartial(e)) || [];
        return message;
    },
    fromProtoMsg(message) {
        return Input.decode(message.value);
    },
    toProto(message) {
        return Input.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.bank.v1beta1.Input',
            value: Input.encode(message).finish(),
        };
    },
};
function createBaseOutput() {
    return {
        address: '',
        coins: [],
    };
}
export const Output = {
    typeUrl: '/cosmos.bank.v1beta1.Output',
    encode(message, writer = BinaryWriter.create()) {
        if (message.address !== '') {
            writer.uint32(10).string(message.address);
        }
        for (const v of message.coins) {
            Coin.encode(v, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseOutput();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.address = reader.string();
                    break;
                case 2:
                    message.coins.push(Coin.decode(reader, reader.uint32()));
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
            address: isSet(object.address) ? String(object.address) : '',
            coins: Array.isArray(object?.coins)
                ? object.coins.map((e) => Coin.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        message.address !== undefined && (obj.address = message.address);
        if (message.coins) {
            obj.coins = message.coins.map(e => (e ? Coin.toJSON(e) : undefined));
        }
        else {
            obj.coins = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseOutput();
        message.address = object.address ?? '';
        message.coins = object.coins?.map(e => Coin.fromPartial(e)) || [];
        return message;
    },
    fromProtoMsg(message) {
        return Output.decode(message.value);
    },
    toProto(message) {
        return Output.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.bank.v1beta1.Output',
            value: Output.encode(message).finish(),
        };
    },
};
function createBaseSupply() {
    return {
        $typeUrl: '/cosmos.bank.v1beta1.Supply',
        total: [],
    };
}
export const Supply = {
    typeUrl: '/cosmos.bank.v1beta1.Supply',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.total) {
            Coin.encode(v, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseSupply();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.total.push(Coin.decode(reader, reader.uint32()));
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
            total: Array.isArray(object?.total)
                ? object.total.map((e) => Coin.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.total) {
            obj.total = message.total.map(e => (e ? Coin.toJSON(e) : undefined));
        }
        else {
            obj.total = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseSupply();
        message.total = object.total?.map(e => Coin.fromPartial(e)) || [];
        return message;
    },
    fromProtoMsg(message) {
        return Supply.decode(message.value);
    },
    toProto(message) {
        return Supply.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.bank.v1beta1.Supply',
            value: Supply.encode(message).finish(),
        };
    },
};
function createBaseDenomUnit() {
    return {
        denom: '',
        exponent: 0,
        aliases: [],
    };
}
export const DenomUnit = {
    typeUrl: '/cosmos.bank.v1beta1.DenomUnit',
    encode(message, writer = BinaryWriter.create()) {
        if (message.denom !== '') {
            writer.uint32(10).string(message.denom);
        }
        if (message.exponent !== 0) {
            writer.uint32(16).uint32(message.exponent);
        }
        for (const v of message.aliases) {
            writer.uint32(26).string(v);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseDenomUnit();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.denom = reader.string();
                    break;
                case 2:
                    message.exponent = reader.uint32();
                    break;
                case 3:
                    message.aliases.push(reader.string());
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
            denom: isSet(object.denom) ? String(object.denom) : '',
            exponent: isSet(object.exponent) ? Number(object.exponent) : 0,
            aliases: Array.isArray(object?.aliases)
                ? object.aliases.map((e) => String(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        message.denom !== undefined && (obj.denom = message.denom);
        message.exponent !== undefined &&
            (obj.exponent = Math.round(message.exponent));
        if (message.aliases) {
            obj.aliases = message.aliases.map(e => e);
        }
        else {
            obj.aliases = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseDenomUnit();
        message.denom = object.denom ?? '';
        message.exponent = object.exponent ?? 0;
        message.aliases = object.aliases?.map(e => e) || [];
        return message;
    },
    fromProtoMsg(message) {
        return DenomUnit.decode(message.value);
    },
    toProto(message) {
        return DenomUnit.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.bank.v1beta1.DenomUnit',
            value: DenomUnit.encode(message).finish(),
        };
    },
};
function createBaseMetadata() {
    return {
        description: '',
        denomUnits: [],
        base: '',
        display: '',
        name: '',
        symbol: '',
        uri: '',
        uriHash: '',
    };
}
export const Metadata = {
    typeUrl: '/cosmos.bank.v1beta1.Metadata',
    encode(message, writer = BinaryWriter.create()) {
        if (message.description !== '') {
            writer.uint32(10).string(message.description);
        }
        for (const v of message.denomUnits) {
            DenomUnit.encode(v, writer.uint32(18).fork()).ldelim();
        }
        if (message.base !== '') {
            writer.uint32(26).string(message.base);
        }
        if (message.display !== '') {
            writer.uint32(34).string(message.display);
        }
        if (message.name !== '') {
            writer.uint32(42).string(message.name);
        }
        if (message.symbol !== '') {
            writer.uint32(50).string(message.symbol);
        }
        if (message.uri !== '') {
            writer.uint32(58).string(message.uri);
        }
        if (message.uriHash !== '') {
            writer.uint32(66).string(message.uriHash);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMetadata();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.description = reader.string();
                    break;
                case 2:
                    message.denomUnits.push(DenomUnit.decode(reader, reader.uint32()));
                    break;
                case 3:
                    message.base = reader.string();
                    break;
                case 4:
                    message.display = reader.string();
                    break;
                case 5:
                    message.name = reader.string();
                    break;
                case 6:
                    message.symbol = reader.string();
                    break;
                case 7:
                    message.uri = reader.string();
                    break;
                case 8:
                    message.uriHash = reader.string();
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
            description: isSet(object.description) ? String(object.description) : '',
            denomUnits: Array.isArray(object?.denomUnits)
                ? object.denomUnits.map((e) => DenomUnit.fromJSON(e))
                : [],
            base: isSet(object.base) ? String(object.base) : '',
            display: isSet(object.display) ? String(object.display) : '',
            name: isSet(object.name) ? String(object.name) : '',
            symbol: isSet(object.symbol) ? String(object.symbol) : '',
            uri: isSet(object.uri) ? String(object.uri) : '',
            uriHash: isSet(object.uriHash) ? String(object.uriHash) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.description !== undefined &&
            (obj.description = message.description);
        if (message.denomUnits) {
            obj.denomUnits = message.denomUnits.map(e => e ? DenomUnit.toJSON(e) : undefined);
        }
        else {
            obj.denomUnits = [];
        }
        message.base !== undefined && (obj.base = message.base);
        message.display !== undefined && (obj.display = message.display);
        message.name !== undefined && (obj.name = message.name);
        message.symbol !== undefined && (obj.symbol = message.symbol);
        message.uri !== undefined && (obj.uri = message.uri);
        message.uriHash !== undefined && (obj.uriHash = message.uriHash);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMetadata();
        message.description = object.description ?? '';
        message.denomUnits =
            object.denomUnits?.map(e => DenomUnit.fromPartial(e)) || [];
        message.base = object.base ?? '';
        message.display = object.display ?? '';
        message.name = object.name ?? '';
        message.symbol = object.symbol ?? '';
        message.uri = object.uri ?? '';
        message.uriHash = object.uriHash ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return Metadata.decode(message.value);
    },
    toProto(message) {
        return Metadata.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.bank.v1beta1.Metadata',
            value: Metadata.encode(message).finish(),
        };
    },
};
//# sourceMappingURL=bank.js.map