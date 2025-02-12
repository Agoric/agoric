//@ts-nocheck
import { Any } from '../../../google/protobuf/any.js';
import { BinaryReader, BinaryWriter } from '../../../binary.js';
import { isSet } from '../../../helpers.js';
import {} from '../../../json-safe.js';
function createBaseBaseAccount() {
    return {
        $typeUrl: '/cosmos.auth.v1beta1.BaseAccount',
        address: '',
        pubKey: undefined,
        accountNumber: BigInt(0),
        sequence: BigInt(0),
    };
}
export const BaseAccount = {
    typeUrl: '/cosmos.auth.v1beta1.BaseAccount',
    encode(message, writer = BinaryWriter.create()) {
        if (message.address !== '') {
            writer.uint32(10).string(message.address);
        }
        if (message.pubKey !== undefined) {
            Any.encode(message.pubKey, writer.uint32(18).fork()).ldelim();
        }
        if (message.accountNumber !== BigInt(0)) {
            writer.uint32(24).uint64(message.accountNumber);
        }
        if (message.sequence !== BigInt(0)) {
            writer.uint32(32).uint64(message.sequence);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseBaseAccount();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.address = reader.string();
                    break;
                case 2:
                    message.pubKey = Any.decode(reader, reader.uint32());
                    break;
                case 3:
                    message.accountNumber = reader.uint64();
                    break;
                case 4:
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
            address: isSet(object.address) ? String(object.address) : '',
            pubKey: isSet(object.pubKey) ? Any.fromJSON(object.pubKey) : undefined,
            accountNumber: isSet(object.accountNumber)
                ? BigInt(object.accountNumber.toString())
                : BigInt(0),
            sequence: isSet(object.sequence)
                ? BigInt(object.sequence.toString())
                : BigInt(0),
        };
    },
    toJSON(message) {
        const obj = {};
        message.address !== undefined && (obj.address = message.address);
        message.pubKey !== undefined &&
            (obj.pubKey = message.pubKey ? Any.toJSON(message.pubKey) : undefined);
        message.accountNumber !== undefined &&
            (obj.accountNumber = (message.accountNumber || BigInt(0)).toString());
        message.sequence !== undefined &&
            (obj.sequence = (message.sequence || BigInt(0)).toString());
        return obj;
    },
    fromPartial(object) {
        const message = createBaseBaseAccount();
        message.address = object.address ?? '';
        message.pubKey =
            object.pubKey !== undefined && object.pubKey !== null
                ? Any.fromPartial(object.pubKey)
                : undefined;
        message.accountNumber =
            object.accountNumber !== undefined && object.accountNumber !== null
                ? BigInt(object.accountNumber.toString())
                : BigInt(0);
        message.sequence =
            object.sequence !== undefined && object.sequence !== null
                ? BigInt(object.sequence.toString())
                : BigInt(0);
        return message;
    },
    fromProtoMsg(message) {
        return BaseAccount.decode(message.value);
    },
    toProto(message) {
        return BaseAccount.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.auth.v1beta1.BaseAccount',
            value: BaseAccount.encode(message).finish(),
        };
    },
};
function createBaseModuleAccount() {
    return {
        $typeUrl: '/cosmos.auth.v1beta1.ModuleAccount',
        baseAccount: undefined,
        name: '',
        permissions: [],
    };
}
export const ModuleAccount = {
    typeUrl: '/cosmos.auth.v1beta1.ModuleAccount',
    encode(message, writer = BinaryWriter.create()) {
        if (message.baseAccount !== undefined) {
            BaseAccount.encode(message.baseAccount, writer.uint32(10).fork()).ldelim();
        }
        if (message.name !== '') {
            writer.uint32(18).string(message.name);
        }
        for (const v of message.permissions) {
            writer.uint32(26).string(v);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseModuleAccount();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.baseAccount = BaseAccount.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.name = reader.string();
                    break;
                case 3:
                    message.permissions.push(reader.string());
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
            baseAccount: isSet(object.baseAccount)
                ? BaseAccount.fromJSON(object.baseAccount)
                : undefined,
            name: isSet(object.name) ? String(object.name) : '',
            permissions: Array.isArray(object?.permissions)
                ? object.permissions.map((e) => String(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        message.baseAccount !== undefined &&
            (obj.baseAccount = message.baseAccount
                ? BaseAccount.toJSON(message.baseAccount)
                : undefined);
        message.name !== undefined && (obj.name = message.name);
        if (message.permissions) {
            obj.permissions = message.permissions.map(e => e);
        }
        else {
            obj.permissions = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseModuleAccount();
        message.baseAccount =
            object.baseAccount !== undefined && object.baseAccount !== null
                ? BaseAccount.fromPartial(object.baseAccount)
                : undefined;
        message.name = object.name ?? '';
        message.permissions = object.permissions?.map(e => e) || [];
        return message;
    },
    fromProtoMsg(message) {
        return ModuleAccount.decode(message.value);
    },
    toProto(message) {
        return ModuleAccount.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.auth.v1beta1.ModuleAccount',
            value: ModuleAccount.encode(message).finish(),
        };
    },
};
function createBaseParams() {
    return {
        maxMemoCharacters: BigInt(0),
        txSigLimit: BigInt(0),
        txSizeCostPerByte: BigInt(0),
        sigVerifyCostEd25519: BigInt(0),
        sigVerifyCostSecp256k1: BigInt(0),
    };
}
export const Params = {
    typeUrl: '/cosmos.auth.v1beta1.Params',
    encode(message, writer = BinaryWriter.create()) {
        if (message.maxMemoCharacters !== BigInt(0)) {
            writer.uint32(8).uint64(message.maxMemoCharacters);
        }
        if (message.txSigLimit !== BigInt(0)) {
            writer.uint32(16).uint64(message.txSigLimit);
        }
        if (message.txSizeCostPerByte !== BigInt(0)) {
            writer.uint32(24).uint64(message.txSizeCostPerByte);
        }
        if (message.sigVerifyCostEd25519 !== BigInt(0)) {
            writer.uint32(32).uint64(message.sigVerifyCostEd25519);
        }
        if (message.sigVerifyCostSecp256k1 !== BigInt(0)) {
            writer.uint32(40).uint64(message.sigVerifyCostSecp256k1);
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
                    message.maxMemoCharacters = reader.uint64();
                    break;
                case 2:
                    message.txSigLimit = reader.uint64();
                    break;
                case 3:
                    message.txSizeCostPerByte = reader.uint64();
                    break;
                case 4:
                    message.sigVerifyCostEd25519 = reader.uint64();
                    break;
                case 5:
                    message.sigVerifyCostSecp256k1 = reader.uint64();
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
            maxMemoCharacters: isSet(object.maxMemoCharacters)
                ? BigInt(object.maxMemoCharacters.toString())
                : BigInt(0),
            txSigLimit: isSet(object.txSigLimit)
                ? BigInt(object.txSigLimit.toString())
                : BigInt(0),
            txSizeCostPerByte: isSet(object.txSizeCostPerByte)
                ? BigInt(object.txSizeCostPerByte.toString())
                : BigInt(0),
            sigVerifyCostEd25519: isSet(object.sigVerifyCostEd25519)
                ? BigInt(object.sigVerifyCostEd25519.toString())
                : BigInt(0),
            sigVerifyCostSecp256k1: isSet(object.sigVerifyCostSecp256k1)
                ? BigInt(object.sigVerifyCostSecp256k1.toString())
                : BigInt(0),
        };
    },
    toJSON(message) {
        const obj = {};
        message.maxMemoCharacters !== undefined &&
            (obj.maxMemoCharacters = (message.maxMemoCharacters || BigInt(0)).toString());
        message.txSigLimit !== undefined &&
            (obj.txSigLimit = (message.txSigLimit || BigInt(0)).toString());
        message.txSizeCostPerByte !== undefined &&
            (obj.txSizeCostPerByte = (message.txSizeCostPerByte || BigInt(0)).toString());
        message.sigVerifyCostEd25519 !== undefined &&
            (obj.sigVerifyCostEd25519 = (message.sigVerifyCostEd25519 || BigInt(0)).toString());
        message.sigVerifyCostSecp256k1 !== undefined &&
            (obj.sigVerifyCostSecp256k1 = (message.sigVerifyCostSecp256k1 || BigInt(0)).toString());
        return obj;
    },
    fromPartial(object) {
        const message = createBaseParams();
        message.maxMemoCharacters =
            object.maxMemoCharacters !== undefined &&
                object.maxMemoCharacters !== null
                ? BigInt(object.maxMemoCharacters.toString())
                : BigInt(0);
        message.txSigLimit =
            object.txSigLimit !== undefined && object.txSigLimit !== null
                ? BigInt(object.txSigLimit.toString())
                : BigInt(0);
        message.txSizeCostPerByte =
            object.txSizeCostPerByte !== undefined &&
                object.txSizeCostPerByte !== null
                ? BigInt(object.txSizeCostPerByte.toString())
                : BigInt(0);
        message.sigVerifyCostEd25519 =
            object.sigVerifyCostEd25519 !== undefined &&
                object.sigVerifyCostEd25519 !== null
                ? BigInt(object.sigVerifyCostEd25519.toString())
                : BigInt(0);
        message.sigVerifyCostSecp256k1 =
            object.sigVerifyCostSecp256k1 !== undefined &&
                object.sigVerifyCostSecp256k1 !== null
                ? BigInt(object.sigVerifyCostSecp256k1.toString())
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
            typeUrl: '/cosmos.auth.v1beta1.Params',
            value: Params.encode(message).finish(),
        };
    },
};
//# sourceMappingURL=auth.js.map