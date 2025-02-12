//@ts-nocheck
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { isSet, bytesFromBase64, base64FromBytes } from '../../helpers.js';
import {} from '../../json-safe.js';
function createBaseMsgDeliverInbound() {
    return {
        messages: [],
        nums: [],
        ack: BigInt(0),
        submitter: new Uint8Array(),
    };
}
export const MsgDeliverInbound = {
    typeUrl: '/agoric.swingset.MsgDeliverInbound',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.messages) {
            writer.uint32(10).string(v);
        }
        writer.uint32(18).fork();
        for (const v of message.nums) {
            writer.uint64(v);
        }
        writer.ldelim();
        if (message.ack !== BigInt(0)) {
            writer.uint32(24).uint64(message.ack);
        }
        if (message.submitter.length !== 0) {
            writer.uint32(34).bytes(message.submitter);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgDeliverInbound();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.messages.push(reader.string());
                    break;
                case 2:
                    if ((tag & 7) === 2) {
                        const end2 = reader.uint32() + reader.pos;
                        while (reader.pos < end2) {
                            message.nums.push(reader.uint64());
                        }
                    }
                    else {
                        message.nums.push(reader.uint64());
                    }
                    break;
                case 3:
                    message.ack = reader.uint64();
                    break;
                case 4:
                    message.submitter = reader.bytes();
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
            messages: Array.isArray(object?.messages)
                ? object.messages.map((e) => String(e))
                : [],
            nums: Array.isArray(object?.nums)
                ? object.nums.map((e) => BigInt(e.toString()))
                : [],
            ack: isSet(object.ack) ? BigInt(object.ack.toString()) : BigInt(0),
            submitter: isSet(object.submitter)
                ? bytesFromBase64(object.submitter)
                : new Uint8Array(),
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.messages) {
            obj.messages = message.messages.map(e => e);
        }
        else {
            obj.messages = [];
        }
        if (message.nums) {
            obj.nums = message.nums.map(e => (e || BigInt(0)).toString());
        }
        else {
            obj.nums = [];
        }
        message.ack !== undefined &&
            (obj.ack = (message.ack || BigInt(0)).toString());
        message.submitter !== undefined &&
            (obj.submitter = base64FromBytes(message.submitter !== undefined ? message.submitter : new Uint8Array()));
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgDeliverInbound();
        message.messages = object.messages?.map(e => e) || [];
        message.nums = object.nums?.map(e => BigInt(e.toString())) || [];
        message.ack =
            object.ack !== undefined && object.ack !== null
                ? BigInt(object.ack.toString())
                : BigInt(0);
        message.submitter = object.submitter ?? new Uint8Array();
        return message;
    },
    fromProtoMsg(message) {
        return MsgDeliverInbound.decode(message.value);
    },
    toProto(message) {
        return MsgDeliverInbound.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/agoric.swingset.MsgDeliverInbound',
            value: MsgDeliverInbound.encode(message).finish(),
        };
    },
};
function createBaseMsgDeliverInboundResponse() {
    return {};
}
export const MsgDeliverInboundResponse = {
    typeUrl: '/agoric.swingset.MsgDeliverInboundResponse',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgDeliverInboundResponse();
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
        const message = createBaseMsgDeliverInboundResponse();
        return message;
    },
    fromProtoMsg(message) {
        return MsgDeliverInboundResponse.decode(message.value);
    },
    toProto(message) {
        return MsgDeliverInboundResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/agoric.swingset.MsgDeliverInboundResponse',
            value: MsgDeliverInboundResponse.encode(message).finish(),
        };
    },
};
function createBaseMsgWalletAction() {
    return {
        owner: new Uint8Array(),
        action: '',
    };
}
export const MsgWalletAction = {
    typeUrl: '/agoric.swingset.MsgWalletAction',
    encode(message, writer = BinaryWriter.create()) {
        if (message.owner.length !== 0) {
            writer.uint32(10).bytes(message.owner);
        }
        if (message.action !== '') {
            writer.uint32(18).string(message.action);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgWalletAction();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.owner = reader.bytes();
                    break;
                case 2:
                    message.action = reader.string();
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
            owner: isSet(object.owner)
                ? bytesFromBase64(object.owner)
                : new Uint8Array(),
            action: isSet(object.action) ? String(object.action) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.owner !== undefined &&
            (obj.owner = base64FromBytes(message.owner !== undefined ? message.owner : new Uint8Array()));
        message.action !== undefined && (obj.action = message.action);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgWalletAction();
        message.owner = object.owner ?? new Uint8Array();
        message.action = object.action ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return MsgWalletAction.decode(message.value);
    },
    toProto(message) {
        return MsgWalletAction.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/agoric.swingset.MsgWalletAction',
            value: MsgWalletAction.encode(message).finish(),
        };
    },
};
function createBaseMsgWalletActionResponse() {
    return {};
}
export const MsgWalletActionResponse = {
    typeUrl: '/agoric.swingset.MsgWalletActionResponse',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgWalletActionResponse();
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
        const message = createBaseMsgWalletActionResponse();
        return message;
    },
    fromProtoMsg(message) {
        return MsgWalletActionResponse.decode(message.value);
    },
    toProto(message) {
        return MsgWalletActionResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/agoric.swingset.MsgWalletActionResponse',
            value: MsgWalletActionResponse.encode(message).finish(),
        };
    },
};
function createBaseMsgWalletSpendAction() {
    return {
        owner: new Uint8Array(),
        spendAction: '',
    };
}
export const MsgWalletSpendAction = {
    typeUrl: '/agoric.swingset.MsgWalletSpendAction',
    encode(message, writer = BinaryWriter.create()) {
        if (message.owner.length !== 0) {
            writer.uint32(10).bytes(message.owner);
        }
        if (message.spendAction !== '') {
            writer.uint32(18).string(message.spendAction);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgWalletSpendAction();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.owner = reader.bytes();
                    break;
                case 2:
                    message.spendAction = reader.string();
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
            owner: isSet(object.owner)
                ? bytesFromBase64(object.owner)
                : new Uint8Array(),
            spendAction: isSet(object.spendAction) ? String(object.spendAction) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.owner !== undefined &&
            (obj.owner = base64FromBytes(message.owner !== undefined ? message.owner : new Uint8Array()));
        message.spendAction !== undefined &&
            (obj.spendAction = message.spendAction);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgWalletSpendAction();
        message.owner = object.owner ?? new Uint8Array();
        message.spendAction = object.spendAction ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return MsgWalletSpendAction.decode(message.value);
    },
    toProto(message) {
        return MsgWalletSpendAction.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/agoric.swingset.MsgWalletSpendAction',
            value: MsgWalletSpendAction.encode(message).finish(),
        };
    },
};
function createBaseMsgWalletSpendActionResponse() {
    return {};
}
export const MsgWalletSpendActionResponse = {
    typeUrl: '/agoric.swingset.MsgWalletSpendActionResponse',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgWalletSpendActionResponse();
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
        const message = createBaseMsgWalletSpendActionResponse();
        return message;
    },
    fromProtoMsg(message) {
        return MsgWalletSpendActionResponse.decode(message.value);
    },
    toProto(message) {
        return MsgWalletSpendActionResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/agoric.swingset.MsgWalletSpendActionResponse',
            value: MsgWalletSpendActionResponse.encode(message).finish(),
        };
    },
};
function createBaseMsgProvision() {
    return {
        nickname: '',
        address: new Uint8Array(),
        powerFlags: [],
        submitter: new Uint8Array(),
    };
}
export const MsgProvision = {
    typeUrl: '/agoric.swingset.MsgProvision',
    encode(message, writer = BinaryWriter.create()) {
        if (message.nickname !== '') {
            writer.uint32(10).string(message.nickname);
        }
        if (message.address.length !== 0) {
            writer.uint32(18).bytes(message.address);
        }
        for (const v of message.powerFlags) {
            writer.uint32(26).string(v);
        }
        if (message.submitter.length !== 0) {
            writer.uint32(34).bytes(message.submitter);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgProvision();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.nickname = reader.string();
                    break;
                case 2:
                    message.address = reader.bytes();
                    break;
                case 3:
                    message.powerFlags.push(reader.string());
                    break;
                case 4:
                    message.submitter = reader.bytes();
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
            nickname: isSet(object.nickname) ? String(object.nickname) : '',
            address: isSet(object.address)
                ? bytesFromBase64(object.address)
                : new Uint8Array(),
            powerFlags: Array.isArray(object?.powerFlags)
                ? object.powerFlags.map((e) => String(e))
                : [],
            submitter: isSet(object.submitter)
                ? bytesFromBase64(object.submitter)
                : new Uint8Array(),
        };
    },
    toJSON(message) {
        const obj = {};
        message.nickname !== undefined && (obj.nickname = message.nickname);
        message.address !== undefined &&
            (obj.address = base64FromBytes(message.address !== undefined ? message.address : new Uint8Array()));
        if (message.powerFlags) {
            obj.powerFlags = message.powerFlags.map(e => e);
        }
        else {
            obj.powerFlags = [];
        }
        message.submitter !== undefined &&
            (obj.submitter = base64FromBytes(message.submitter !== undefined ? message.submitter : new Uint8Array()));
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgProvision();
        message.nickname = object.nickname ?? '';
        message.address = object.address ?? new Uint8Array();
        message.powerFlags = object.powerFlags?.map(e => e) || [];
        message.submitter = object.submitter ?? new Uint8Array();
        return message;
    },
    fromProtoMsg(message) {
        return MsgProvision.decode(message.value);
    },
    toProto(message) {
        return MsgProvision.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/agoric.swingset.MsgProvision',
            value: MsgProvision.encode(message).finish(),
        };
    },
};
function createBaseMsgProvisionResponse() {
    return {};
}
export const MsgProvisionResponse = {
    typeUrl: '/agoric.swingset.MsgProvisionResponse',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgProvisionResponse();
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
        const message = createBaseMsgProvisionResponse();
        return message;
    },
    fromProtoMsg(message) {
        return MsgProvisionResponse.decode(message.value);
    },
    toProto(message) {
        return MsgProvisionResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/agoric.swingset.MsgProvisionResponse',
            value: MsgProvisionResponse.encode(message).finish(),
        };
    },
};
function createBaseMsgInstallBundle() {
    return {
        bundle: '',
        submitter: new Uint8Array(),
        compressedBundle: new Uint8Array(),
        uncompressedSize: BigInt(0),
    };
}
export const MsgInstallBundle = {
    typeUrl: '/agoric.swingset.MsgInstallBundle',
    encode(message, writer = BinaryWriter.create()) {
        if (message.bundle !== '') {
            writer.uint32(10).string(message.bundle);
        }
        if (message.submitter.length !== 0) {
            writer.uint32(18).bytes(message.submitter);
        }
        if (message.compressedBundle.length !== 0) {
            writer.uint32(26).bytes(message.compressedBundle);
        }
        if (message.uncompressedSize !== BigInt(0)) {
            writer.uint32(32).int64(message.uncompressedSize);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgInstallBundle();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.bundle = reader.string();
                    break;
                case 2:
                    message.submitter = reader.bytes();
                    break;
                case 3:
                    message.compressedBundle = reader.bytes();
                    break;
                case 4:
                    message.uncompressedSize = reader.int64();
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
            bundle: isSet(object.bundle) ? String(object.bundle) : '',
            submitter: isSet(object.submitter)
                ? bytesFromBase64(object.submitter)
                : new Uint8Array(),
            compressedBundle: isSet(object.compressedBundle)
                ? bytesFromBase64(object.compressedBundle)
                : new Uint8Array(),
            uncompressedSize: isSet(object.uncompressedSize)
                ? BigInt(object.uncompressedSize.toString())
                : BigInt(0),
        };
    },
    toJSON(message) {
        const obj = {};
        message.bundle !== undefined && (obj.bundle = message.bundle);
        message.submitter !== undefined &&
            (obj.submitter = base64FromBytes(message.submitter !== undefined ? message.submitter : new Uint8Array()));
        message.compressedBundle !== undefined &&
            (obj.compressedBundle = base64FromBytes(message.compressedBundle !== undefined
                ? message.compressedBundle
                : new Uint8Array()));
        message.uncompressedSize !== undefined &&
            (obj.uncompressedSize = (message.uncompressedSize || BigInt(0)).toString());
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgInstallBundle();
        message.bundle = object.bundle ?? '';
        message.submitter = object.submitter ?? new Uint8Array();
        message.compressedBundle = object.compressedBundle ?? new Uint8Array();
        message.uncompressedSize =
            object.uncompressedSize !== undefined && object.uncompressedSize !== null
                ? BigInt(object.uncompressedSize.toString())
                : BigInt(0);
        return message;
    },
    fromProtoMsg(message) {
        return MsgInstallBundle.decode(message.value);
    },
    toProto(message) {
        return MsgInstallBundle.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/agoric.swingset.MsgInstallBundle',
            value: MsgInstallBundle.encode(message).finish(),
        };
    },
};
function createBaseMsgInstallBundleResponse() {
    return {};
}
export const MsgInstallBundleResponse = {
    typeUrl: '/agoric.swingset.MsgInstallBundleResponse',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgInstallBundleResponse();
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
        const message = createBaseMsgInstallBundleResponse();
        return message;
    },
    fromProtoMsg(message) {
        return MsgInstallBundleResponse.decode(message.value);
    },
    toProto(message) {
        return MsgInstallBundleResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/agoric.swingset.MsgInstallBundleResponse',
            value: MsgInstallBundleResponse.encode(message).finish(),
        };
    },
};
//# sourceMappingURL=msgs.js.map